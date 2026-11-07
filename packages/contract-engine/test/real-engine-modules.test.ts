import { describe, it, expect } from 'vitest';
import path from 'path';
import {
  classifyContractChanges,
  extractLiveBackendSchema,
  extractAndCompareGitHeadAgainstWorkingTree,
  scanFrontendConsumerWorkspace,
  runFrontendContractVerification,
  parseTscDiagnostics,
  buildJsonPointer,
  OpenApiDocument
} from '../src/index.js';

describe('Real API Contract Analysis & Diffing Engine', () => {
  const rootDir = path.resolve(__dirname, '../../..');
  const backendWorkspacePath = path.resolve(rootDir, 'workspaces/backend-api');
  const frontendWorkspacePath = path.resolve(rootDir, 'workspaces/frontend-consumer');

  // ==========================================================================
  // Module 1: OpenAPI & TypeScript Schema Extractor
  // ==========================================================================
  describe('Module 1: OpenAPI & TypeScript Schema Extractor', () => {
    it('reads live route definitions and Zod DTOs from workspaces/backend-api on disk', () => {
      const extracted = extractLiveBackendSchema(backendWorkspacePath);

      expect(extracted).toBeDefined();
      expect(extracted.openApiDoc.openapi).toBe('3.1.0');
      expect(extracted.sourceFilesScanned.length).toBeGreaterThanOrEqual(1);

      // Verify canonical endpoints extracted
      expect(extracted.openApiDoc.paths).toHaveProperty('/api/orders');
      expect(extracted.openApiDoc.paths).toHaveProperty('/api/users/{id}');
      expect(extracted.openApiDoc.paths).toHaveProperty('/api/billing/invoices');

      // Verify schemas extracted from live disk files
      expect(extracted.openApiDoc.components?.schemas).toHaveProperty('OrderSchema');
      expect(extracted.openApiDoc.components?.schemas).toHaveProperty('UserSchema');
      expect(extracted.openApiDoc.components?.schemas).toHaveProperty('InvoiceSchema');
    });

    it('extracts and compares committed Git HEAD schema against working tree', () => {
      const comparison = extractAndCompareGitHeadAgainstWorkingTree(backendWorkspacePath);

      expect(comparison).toBeDefined();
      expect(comparison.headDoc.openapi).toBe('3.1.0');
      expect(comparison.workingDoc.openapi).toBe('3.1.0');
      expect(typeof comparison.isDirty).toBe('boolean');
    });
  });

  // ==========================================================================
  // Module 2: Breaking-Change Classifier with RFC 6901 JSON Pointers
  // ==========================================================================
  describe('Module 2: Breaking-Change Classifier', () => {
    const baselineDoc: OpenApiDocument = {
      openapi: '3.1.0',
      info: { title: 'Order Service', version: '1.0.0' },
      paths: {
        '/api/orders': {
          get: {
            summary: 'List customer orders',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['orders'],
                      properties: {
                        orders: {
                          type: 'array',
                          items: {
                            type: 'object',
                            required: ['id', 'total_amount', 'status', 'description'],
                            properties: {
                              id: { type: 'string' },
                              total_amount: { type: 'number' },
                              status: { type: 'string', enum: ['pending', 'shipped', 'delivered'] },
                              description: { type: 'string' }
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
            summary: 'Create order',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['customerId'],
                    properties: {
                      customerId: { type: 'string' }
                    }
                  }
                }
              }
            },
            responses: {
              '201': { description: 'Created' }
            }
          }
        }
      }
    };

    it('generates standard RFC 6901 JSON pointers', () => {
      const pointer = buildJsonPointer(['paths', '/api/orders', 'get', 'responses', '200']);
      expect(pointer).toBe('#/paths/~1api~1orders/get/responses/200');
    });

    it('detects and classifies breaking removed response fields with JSON pointer', () => {
      const uncommittedDoc: OpenApiDocument = JSON.parse(JSON.stringify(baselineDoc));
      const orderItemProps =
        uncommittedDoc.paths['/api/orders'].get.responses['200'].content['application/json'].schema.properties.orders.items.properties;

      // Remove total_amount
      delete orderItemProps.total_amount;

      const result = classifyContractChanges(baselineDoc, uncommittedDoc);

      expect(result.hasBreakingChanges).toBe(true);
      expect(result.breakingCount).toBeGreaterThanOrEqual(1);

      const removal = result.changes.find((c) => c.fieldPath.includes('total_amount'));
      expect(removal).toBeDefined();
      expect(removal?.isBreaking).toBe(true);
      expect(removal?.category).toBe('PROPERTY_REMOVED');
      expect(removal?.httpMethod).toBe('GET');
      expect(removal?.routePath).toBe('/api/orders');
      expect(removal?.previousType).toBe('number');
      expect(removal?.newType).toBeUndefined();
      expect(removal?.jsonPointer).toContain('~1');
      expect(removal?.jsonPointer).toContain('total_amount');
      expect(removal?.impactSummary).toContain('total_amount');
    });

    it('detects and classifies narrowed field types (string to number, enum narrowing)', () => {
      const uncommittedDoc: OpenApiDocument = JSON.parse(JSON.stringify(baselineDoc));
      const orderItemProps =
        uncommittedDoc.paths['/api/orders'].get.responses['200'].content['application/json'].schema.properties.orders.items.properties;

      // Narrow description to number
      orderItemProps.description = { type: 'number' };

      // Narrow enum by removing 'pending'
      orderItemProps.status = { type: 'string', enum: ['shipped', 'delivered'] };

      const result = classifyContractChanges(baselineDoc, uncommittedDoc);

      expect(result.hasBreakingChanges).toBe(true);

      const typeNarrowed = result.changes.find((c) => c.fieldPath.includes('description'));
      expect(typeNarrowed).toBeDefined();
      expect(typeNarrowed?.isBreaking).toBe(true);
      expect(typeNarrowed?.category).toBe('TYPE_NARROWED');
      expect(typeNarrowed?.previousType).toBe('string');
      expect(typeNarrowed?.newType).toBe('number');

      const enumRemoved = result.changes.find((c) => c.category === 'ENUM_VALUE_REMOVED');
      expect(enumRemoved).toBeDefined();
      expect(enumRemoved?.oldValue).toBe('pending');
    });

    it('detects and classifies newly required request body fields', () => {
      const uncommittedDoc: OpenApiDocument = JSON.parse(JSON.stringify(baselineDoc));
      const postReqSchema =
        uncommittedDoc.paths['/api/orders'].post.requestBody.content['application/json'].schema;

      // Add newly required 'currency' field
      postReqSchema.required.push('currency');
      postReqSchema.properties.currency = { type: 'string' };

      const result = classifyContractChanges(baselineDoc, uncommittedDoc);

      expect(result.hasBreakingChanges).toBe(true);
      const reqParamAdded = result.changes.find((c) => c.fieldPath.includes('currency'));
      expect(reqParamAdded).toBeDefined();
      expect(reqParamAdded?.isBreaking).toBe(true);
      expect(reqParamAdded?.category).toBe('REQUIRED_PARAM_ADDED');
      expect(reqParamAdded?.httpMethod).toBe('POST');
    });

    it('detects and classifies non-breaking changes (optional fields and doc updates)', () => {
      const uncommittedDoc: OpenApiDocument = JSON.parse(JSON.stringify(baselineDoc));

      // 1. Add non-breaking optional response field
      const orderItemProps =
        uncommittedDoc.paths['/api/orders'].get.responses['200'].content['application/json'].schema.properties.orders.items.properties;
      orderItemProps.estimatedDelivery = { type: 'string' };

      // 2. Update documentation summary
      uncommittedDoc.paths['/api/orders'].get.summary = 'List customer orders with delivery metrics';

      const result = classifyContractChanges(baselineDoc, uncommittedDoc);

      expect(result.hasBreakingChanges).toBe(false);
      expect(result.breakingCount).toBe(0);
      expect(result.nonBreakingCount).toBeGreaterThanOrEqual(2);

      const docChange = result.changes.find((c) => c.category === 'DOCUMENTATION_UPDATED');
      expect(docChange).toBeDefined();
      expect(docChange?.isBreaking).toBe(false);

      const optField = result.changes.find((c) => c.fieldPath.includes('estimatedDelivery'));
      expect(optField).toBeDefined();
      expect(optField?.isBreaking).toBe(false);
      expect(optField?.category).toBe('PROPERTY_ADDED');
    });
  });

  // ==========================================================================
  // Module 3: Frontend Consumer AST Scanner & Type Verifier
  // ==========================================================================
  describe('Module 3: Frontend Consumer AST Scanner & Type Verifier', () => {
    it('scans workspaces/frontend-consumer/src to locate real TypeScript interfaces, hooks, and React components', () => {
      const scanResult = scanFrontendConsumerWorkspace(
        frontendWorkspacePath,
        'total_amount',
        '/api/orders'
      );

      expect(scanResult.totalReferences).toBeGreaterThan(0);
      expect(scanResult.targetField).toBe('total_amount');

      // Check Zod schemas found
      expect(scanResult.zodSchemas.length).toBeGreaterThanOrEqual(1);
      expect(scanResult.zodSchemas[0].filePath).toContain('schemas/orders.ts');

      // Check React components found referencing total_amount
      expect(scanResult.components.length).toBeGreaterThanOrEqual(1);
      const componentFiles = scanResult.components.map((c) => c.filePath);
      expect(componentFiles.some((f) => f.includes('OrdersView.tsx'))).toBe(true);

      // Check calls or property accesses found
      expect(scanResult.calls.length).toBeGreaterThanOrEqual(1);
    });

    it('parses real TypeScript compiler diagnostic strings into exact file, line, column, and error code', () => {
      const sampleTscOutput = `
src/components/OrdersView.tsx(52,19): error TS2339: Property 'total_amount' does not exist on type 'Order'.
src/api/client.ts(44,5): error TS2322: Type 'unknown' is not assignable to type 'OrderResponse'.
`;
      const diagnostics = parseTscDiagnostics(sampleTscOutput);

      expect(diagnostics.length).toBe(2);

      expect(diagnostics[0].fileName).toBe('src/components/OrdersView.tsx');
      expect(diagnostics[0].line).toBe(52);
      expect(diagnostics[0].column).toBe(19);
      expect(diagnostics[0].code).toBe('TS2339');
      expect(diagnostics[0].message).toContain("Property 'total_amount' does not exist");

      expect(diagnostics[1].fileName).toBe('src/api/client.ts');
      expect(diagnostics[1].line).toBe(44);
      expect(diagnostics[1].column).toBe(5);
      expect(diagnostics[1].code).toBe('TS2322');
    });

    it('dynamically writes a temporary contract fixture, runs real child process verification, and safely cleans up', async () => {
      // Test verified compliant candidate schema
      const compliantCandidate = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          customerId: { type: 'string' },
          total_amount: { type: 'number' },
          status: { type: 'string' }
        }
      };

      const verification = await runFrontendContractVerification(
        frontendWorkspacePath,
        compliantCandidate,
        { runVitest: true }
      );

      expect(verification).toBeDefined();
      expect(verification.durationMs).toBeGreaterThan(0);

      // Verify fixture file was cleaned up and does not linger on disk
      if (verification.temporaryFixturePath) {
        const fileStillExists = require('fs').existsSync(verification.temporaryFixturePath);
        expect(fileStillExists).toBe(false);
      }
    }, 15000);

    it('verifies that when uncommitted backend schema mutation is applied, PactRoom verifier against frontend-consumer fails with real compiler diagnostics', async () => {
      // Mutated candidate schema from uncommitted backend mutation (total_amount_cents replaced by pricing_breakdown)
      const mutatedCandidate = {
        type: 'object',
        required: ['id', 'pricing_breakdown', 'status'],
        properties: {
          id: { type: 'string' },
          pricing_breakdown: { type: 'object' },
          status: { type: 'string' }
        }
      };

      const verification = await runFrontendContractVerification(
        frontendWorkspacePath,
        mutatedCandidate,
        { runVitest: true }
      );

      expect(verification).toBeDefined();
      expect(verification.passed).toBe(false);
      expect(verification.diagnostics.length).toBeGreaterThan(0);
      const ts2339 = verification.diagnostics.find((d) => d.code === 'TS2339');
      expect(ts2339).toBeDefined();
      expect(ts2339?.message).toContain("Property 'total_amount_cents' does not exist");
      expect(ts2339?.line).toBeGreaterThan(0);
    });
  });
});
