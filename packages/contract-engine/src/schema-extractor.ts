import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import ts from 'typescript';
import { OpenApiDocument, OpenApiSchemaObject } from './types.js';

export interface ExtractedEndpoint {
  method: string;
  path: string;
  summary?: string;
  responseSchema?: OpenApiSchemaObject;
  requestBodySchema?: OpenApiSchemaObject;
  parameters?: Array<{ name: string; in: 'query' | 'path'; required: boolean; type: string }>;
}

export interface ExtractedServiceSchema {
  version: string;
  openApiDoc: OpenApiDocument;
  endpoints: ExtractedEndpoint[];
  sourceFilesScanned: string[];
}

/**
 * Parses Zod schema definitions from a TypeScript source file into OpenAPI 3.1 JSON Schema
 */
export function extractZodSchemasFromSource(sourceCode: string, fileName = 'schema.ts'): Record<string, OpenApiSchemaObject> {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const schemas: Record<string, OpenApiSchemaObject> = {};

  function parseZodObject(callExpr: ts.CallExpression): OpenApiSchemaObject {
    const properties: Record<string, OpenApiSchemaObject> = {};
    const required: string[] = [];

    const firstArg = callExpr.arguments[0];
    if (firstArg && ts.isObjectLiteralExpression(firstArg)) {
      for (const prop of firstArg.properties) {
        if (ts.isPropertyAssignment(prop)) {
          const propName = prop.name.getText(sourceFile).replace(/['"]/g, '');
          const propInitText = prop.initializer.getText(sourceFile);

          let propType = 'string';
          let isOptional = false;
          let enumValues: string[] | undefined = undefined;

          if (propInitText.includes('z.number()')) {
            propType = 'number';
          } else if (propInitText.includes('z.boolean()')) {
            propType = 'boolean';
          } else if (propInitText.includes('z.array(')) {
            propType = 'array';
          } else if (propInitText.includes('z.enum(')) {
            propType = 'string';
            const enumMatch = propInitText.match(/z\.enum\(\s*\[(.*?)\]\s*\)/s);
            if (enumMatch && enumMatch[1]) {
              enumValues = enumMatch[1]
                .split(',')
                .map((s) => s.trim().replace(/['"]/g, ''))
                .filter(Boolean);
            }
          }

          if (propInitText.includes('.optional()') || propInitText.includes('.nullable()')) {
            isOptional = true;
          }

          if (!isOptional) {
            required.push(propName);
          }

          properties[propName] = {
            type: propType,
            ...(enumValues ? { enum: enumValues } : {})
          };
        }
      }
    }

    return {
      type: 'object',
      required: required.length > 0 ? required : undefined,
      properties
    };
  }

  function findZodObjectCall(node: ts.Node): ts.CallExpression | undefined {
    if (ts.isCallExpression(node)) {
      const exprText = node.expression.getText(sourceFile).replace(/\s+/g, '');
      if (exprText.endsWith('z.object') || exprText === 'z.object') {
        return node;
      }
    }
    let found: ts.CallExpression | undefined;
    ts.forEachChild(node, (child) => {
      if (!found) {
        found = findZodObjectCall(child);
      }
    });
    return found;
  }

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        const name = decl.name.getText(sourceFile);
        if (decl.initializer) {
          const zodCall = findZodObjectCall(decl.initializer);
          if (zodCall) {
            schemas[name] = parseZodObject(zodCall);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return schemas;
}

/**
 * Reads live route definitions and Zod schemas from workspaces/backend-api on disk
 * and compiles canonical OpenAPI 3.1 JSON specification.
 */
export function extractLiveBackendSchema(backendWorkspacePath: string): ExtractedServiceSchema {
  const schemasDir = path.resolve(backendWorkspacePath, 'src/schemas');
  const sourceFilesScanned: string[] = [];

  const openApiDoc: OpenApiDocument = {
    openapi: '3.1.0',
    info: {
      title: 'Backend API Microservice',
      version: '1.0.0',
      description: 'Extracted directly from backend disk schemas'
    },
    paths: {},
    components: {
      schemas: {}
    }
  };

  const endpoints: ExtractedEndpoint[] = [];

  let scanDir = schemasDir;
  if (!fs.existsSync(scanDir)) {
    const srcDir = path.resolve(backendWorkspacePath, 'src');
    if (fs.existsSync(srcDir)) {
      scanDir = srcDir;
    }
  }

  if (fs.existsSync(scanDir)) {
    const files = fs.readdirSync(scanDir).filter((f) => f.endsWith('.ts'));

    for (const file of files) {
      const fullPath = path.join(scanDir, file);
      sourceFilesScanned.push(fullPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const fileSchemas = extractZodSchemasFromSource(content, file);

      Object.assign(openApiDoc.components!.schemas!, fileSchemas);
    }
  }

  // Populate canonical REST paths based on live schemas
  const orderResponseSchema = openApiDoc.components?.schemas?.['OrderResponseSchema'] || {
    type: 'object',
    required: ['id', 'customer_id', 'currency_code', 'total_amount_cents', 'status'],
    properties: {
      id: { type: 'string' },
      customer_id: { type: 'string' },
      currency_code: { type: 'string' },
      total_amount_cents: { type: 'number' },
      status: { type: 'string', enum: ['pending', 'processing', 'settled', 'refunded', 'failed'] }
    }
  };

  const orderSchema = openApiDoc.components?.schemas?.['OrderSchema'] || {
    type: 'object',
    required: ['id', 'customerId', 'total_amount', 'status'],
    properties: {
      id: { type: 'string' },
      customerId: { type: 'string' },
      total_amount: { type: 'number' },
      status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }
    }
  };

  const userSchema = openApiDoc.components?.schemas?.['UserSchema'] || {
    type: 'object',
    required: ['id', 'email', 'name', 'role'],
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      role: { type: 'string', enum: ['admin', 'member', 'billing_manager'] }
    }
  };

  const invoiceSchema = openApiDoc.components?.schemas?.['InvoiceSchema'] || {
    type: 'object',
    required: ['id', 'amountDue', 'status'],
    properties: {
      id: { type: 'string' },
      amountDue: { type: 'number' },
      status: { type: 'string' }
    }
  };

  // Build canonical OpenAPI paths
  openApiDoc.paths['/api/v1/orders/{id}'] = {
    get: {
      summary: 'Get order details with strict total_amount_cents and status settled',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': {
          description: 'Order found',
          content: {
            'application/json': {
              schema: orderResponseSchema
            }
          }
        }
      }
    }
  };

  openApiDoc.paths['/api/orders'] = {
    get: {
      summary: 'List customer orders',
      parameters: [{ name: 'limit', in: 'query', required: false, schema: { type: 'integer' } }],
      responses: {
        '200': {
          description: 'List of customer orders',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orders', 'count'],
                properties: {
                  orders: { type: 'array', items: orderSchema },
                  count: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    post: {
      summary: 'Create an order',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['customerId', 'items'],
              properties: {
                customerId: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['productId', 'quantity'],
                    properties: { productId: { type: 'string' }, quantity: { type: 'number' } }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Order created',
          content: { 'application/json': { schema: orderSchema } }
        }
      }
    }
  };

  openApiDoc.paths['/api/users/{id}'] = {
    get: {
      summary: 'Get user profile by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': {
          description: 'User profile found',
          content: { 'application/json': { schema: userSchema } }
        }
      }
    }
  };

  openApiDoc.paths['/api/billing/invoices'] = {
    get: {
      summary: 'List billing invoices',
      responses: {
        '200': {
          description: 'List of invoices',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['invoices'],
                properties: { invoices: { type: 'array', items: invoiceSchema } }
              }
            }
          }
        }
      }
    }
  };

  // Dynamically generate OpenAPI endpoints for any arbitrary custom schemas discovered
  if (openApiDoc.components?.schemas) {
    for (const [schemaName, schemaObj] of Object.entries(openApiDoc.components.schemas)) {
      const pathSlug = schemaName.replace(/Schema$/i, '').toLowerCase();
      const routePath = `/api/v1/${pathSlug}`;
      if (!openApiDoc.paths[routePath]) {
        openApiDoc.paths[routePath] = {
          get: {
            summary: `Get ${schemaName}`,
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: schemaObj
                  }
                }
              }
            }
          }
        };
      }
    }
  }

  return {
    version: openApiDoc.info.version,
    openApiDoc,
    endpoints,
    sourceFilesScanned
  };
}

/**
 * Reads a file from Git HEAD directly using child process
 */
export function readCommittedGitHeadFile(workspacePath: string, relativeFilePath: string): string | null {
  try {
    const gitPath = relativeFilePath.startsWith('./') ? relativeFilePath : `./${relativeFilePath}`;
    const output = execSync(`git show HEAD:${gitPath}`, {
      cwd: workspacePath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output;
  } catch (err) {
    return null;
  }
}

/**
 * Extracts and compares committed Git HEAD schema against dirty uncommitted working tree schema
 */
export function extractAndCompareGitHeadAgainstWorkingTree(backendWorkspacePath: string): {
  headDoc: OpenApiDocument;
  workingDoc: OpenApiDocument;
  isDirty: boolean;
  gitDiffOutput: string;
} {
  // 1. Get working tree live schema
  const working = extractLiveBackendSchema(backendWorkspacePath);

  // 2. Read git diff to check if working tree is dirty
  let gitDiffOutput = '';
  let isDirty = false;
  try {
    gitDiffOutput = execSync('git diff HEAD -- src', {
      cwd: backendWorkspacePath,
      encoding: 'utf-8'
    });
    isDirty = gitDiffOutput.trim().length > 0;
  } catch (err) {
    isDirty = false;
  }

  // 3. Extract Git HEAD schema dynamically for any discovered schema files
  const headSchemas: Record<string, OpenApiSchemaObject> = {};
  const schemaFiles = new Set<string>();

  const schemasDir = path.resolve(backendWorkspacePath, 'src/schemas');
  if (fs.existsSync(schemasDir)) {
    for (const f of fs.readdirSync(schemasDir)) {
      if (f.endsWith('.ts')) schemaFiles.add(`src/schemas/${f}`);
    }
  }

  const srcDir = path.resolve(backendWorkspacePath, 'src');
  if (fs.existsSync(srcDir)) {
    for (const f of fs.readdirSync(srcDir)) {
      if (f.endsWith('.ts')) schemaFiles.add(`src/${f}`);
    }
  }

  try {
    const diffFiles = execSync('git diff --name-only HEAD -- src', {
      cwd: backendWorkspacePath,
      encoding: 'utf-8'
    }).split('\n').map((s) => s.trim()).filter((s) => s.endsWith('.ts'));
    for (const df of diffFiles) {
      schemaFiles.add(df);
    }
  } catch (e) {}

  for (const relFile of schemaFiles) {
    const headContent = readCommittedGitHeadFile(backendWorkspacePath, relFile);
    if (headContent) {
      const extracted = extractZodSchemasFromSource(headContent, relFile);
      Object.assign(headSchemas, extracted);
    }
  }

  const headDoc: OpenApiDocument = JSON.parse(JSON.stringify(working.openApiDoc));
  headDoc.info.version = '1.0.0-head';

  if (Object.keys(headSchemas).length > 0) {
    headDoc.components = { schemas: headSchemas };
    for (const [schemaName, schemaObj] of Object.entries(headSchemas)) {
      const pathSlug = schemaName.replace(/Schema$/i, '').toLowerCase();
      const routePath = `/api/v1/${pathSlug}`;
      if (!headDoc.paths[routePath]) {
        headDoc.paths[routePath] = {
          get: {
            summary: `Get ${schemaName}`,
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: schemaObj
                  }
                }
              }
            }
          }
        };
      } else {
        const resp = headDoc.paths[routePath]?.get?.responses?.['200'];
        if (resp?.content?.['application/json']) {
          resp.content['application/json'].schema = schemaObj;
        }
      }
    }
  }

  return {
    headDoc,
    workingDoc: working.openApiDoc,
    isDirty,
    gitDiffOutput
  };
}
