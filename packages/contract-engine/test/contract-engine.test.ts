import { describe, it, expect } from 'vitest';
import {
  diffOpenApiSchemas,
  analyzeSourceForField,
  generateMigrationPatches,
  OpenApiDocument
} from '../src/index.js';

describe('PactRoom Contract Engine', () => {
  const baseV1Spec: OpenApiDocument = {
    openapi: '3.1.0',
    info: {
      title: 'Backend API Service',
      version: '1.0.0'
    },
    paths: {
      '/api/orders': {
        get: {
          summary: 'List customer orders',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      orders: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['id', 'total_amount', 'status'],
                          properties: {
                            id: { type: 'string' },
                            total_amount: { type: 'number' },
                            status: {
                              type: 'string',
                              enum: ['pending', 'processing', 'completed', 'cancelled']
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new order',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'items'],
                  properties: {
                    userId: { type: 'string' },
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string' },
                          quantity: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      status: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  it('detects no breaking changes when specs are identical', () => {
    const result = diffOpenApiSchemas(baseV1Spec, baseV1Spec);
    expect(result.hasBreakingChanges).toBe(false);
    expect(result.breakingCount).toBe(0);
    expect(result.changes.length).toBe(0);
  });

  it('detects breaking change when response property is removed', () => {
    // V2 removes total_amount and introduces subtotal + tax_amount
    const brokenV2Spec: OpenApiDocument = JSON.parse(JSON.stringify(baseV1Spec));
    brokenV2Spec.info.version = '2.0.0';

    const orderItemSchema =
      brokenV2Spec.paths['/api/orders'].get.responses['200'].content['application/json'].schema
        .properties.orders.items;

    delete orderItemSchema.properties.total_amount;
    orderItemSchema.properties.subtotal = { type: 'number' };
    orderItemSchema.properties.tax_amount = { type: 'number' };

    const result = diffOpenApiSchemas(baseV1Spec, brokenV2Spec);

    expect(result.hasBreakingChanges).toBe(true);
    expect(result.breakingCount).toBeGreaterThanOrEqual(1);

    const removedFieldChange = result.changes.find(
      (c) => c.category === 'PROPERTY_REMOVED' && c.fieldPath.includes('total_amount')
    );
    expect(removedFieldChange).toBeDefined();
    expect(removedFieldChange?.severity).toBe('BREAKING');
  });

  it('detects breaking change when required request parameter is added', () => {
    const brokenV2Spec: OpenApiDocument = JSON.parse(JSON.stringify(baseV1Spec));
    brokenV2Spec.info.version = '2.0.0';

    // Add required 'currency' field in POST requestBody
    const postReqSchema =
      brokenV2Spec.paths['/api/orders'].post.requestBody.content['application/json'].schema;
    postReqSchema.required.push('currency');
    postReqSchema.properties.currency = { type: 'string' };

    const result = diffOpenApiSchemas(baseV1Spec, brokenV2Spec);

    expect(result.hasBreakingChanges).toBe(true);
    const addedRequiredChange = result.changes.find(
      (c) => c.category === 'REQUIRED_PARAM_ADDED' && c.fieldPath.includes('currency')
    );
    expect(addedRequiredChange).toBeDefined();
    expect(addedRequiredChange?.severity).toBe('BREAKING');
  });

  it('detects endpoint removal as CRITICAL', () => {
    const brokenV2Spec: OpenApiDocument = {
      openapi: '3.1.0',
      info: { title: 'Backend API Service', version: '2.0.0' },
      paths: {}
    };

    const result = diffOpenApiSchemas(baseV1Spec, brokenV2Spec);
    expect(result.hasBreakingChanges).toBe(true);
    const removedEndpoint = result.changes.find((c) => c.category === 'ENDPOINT_REMOVED');
    expect(removedEndpoint).toBeDefined();
    expect(removedEndpoint?.severity).toBe('CRITICAL');
  });

  it('accurately parses TypeScript source code via AST to find field references', () => {
    const sampleTsCode = `
      import { z } from 'zod';

      export const OrderSchema = z.object({
        id: z.string(),
        total_amount: z.number(),
        status: z.string(),
      });

      export function renderOrder(order: z.infer<typeof OrderSchema>) {
        console.log("Total is: " + order.total_amount);
        return order.total_amount;
      }
    `;

    const analysis = analyzeSourceForField(sampleTsCode, 'test-order.ts', 'total_amount');
    expect(analysis.hasReference).toBe(true);
    // Should find the Zod property assignment and the two order.total_amount property accesses
    expect(analysis.references.length).toBeGreaterThanOrEqual(2);
    expect(analysis.references[0].contextSnippet).toContain('total_amount');
  });

  it('synthesizes migration patches for breaking changes', () => {
    const breakingChanges = [
      {
        id: 'chg_1',
        category: 'PROPERTY_REMOVED' as const,
        severity: 'BREAKING' as const,
        path: '/api/orders',
        method: 'GET',
        location: 'response' as const,
        fieldPath: 'orders[].total_amount',
        message: "Property 'orders[].total_amount' was removed",
        impact: 'Breaks frontend UI rendering total_amount',
        migrationAdvice: 'Use subtotal + tax_amount'
      }
    ];

    const patches = generateMigrationPatches(breakingChanges);
    expect(patches.length).toBeGreaterThan(0);
    const frontendPatch = patches.find((p) => p.targetWorkspace === 'frontend-consumer');
    const backendPatch = patches.find((p) => p.targetWorkspace === 'backend-api');

    expect(frontendPatch).toBeDefined();
    expect(frontendPatch?.patchedSnippet).toContain('total_amount');
    expect(backendPatch).toBeDefined();
    expect(backendPatch?.patchedSnippet).toContain('@deprecated');
  });
});

