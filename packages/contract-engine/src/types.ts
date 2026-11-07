export type ChangeSeverity = 'CRITICAL' | 'BREAKING' | 'WARNING' | 'INFO';

export type ChangeCategory =
  | 'ENDPOINT_REMOVED'
  | 'ENDPOINT_ADDED'
  | 'METHOD_REMOVED'
  | 'PROPERTY_REMOVED'
  | 'PROPERTY_RENAMED'
  | 'PROPERTY_ADDED'
  | 'TYPE_NARROWED'
  | 'TYPE_WIDENED'
  | 'TYPE_CHANGED'
  | 'REQUIRED_PARAM_ADDED'
  | 'OPTIONAL_PARAM_MADE_REQUIRED'
  | 'OPTIONAL_PARAM_ADDED'
  | 'STATUS_CODE_CHANGED'
  | 'STATUS_CODE_REMOVED'
  | 'ENUM_VALUE_REMOVED'
  | 'ENUM_VALUE_ADDED'
  | 'DOCUMENTATION_UPDATED';

/**
 * Standard RFC 6901 compliant Structured Contract Diff Object
 */
export interface StructuredContractDiff {
  id: string;
  isBreaking: boolean;
  category: ChangeCategory;
  severity: ChangeSeverity;
  httpMethod: string; // e.g. "GET", "POST"
  method?: string; // alias for httpMethod
  routePath: string; // e.g. "/api/orders"
  path?: string; // alias for routePath for backward compatibility
  location?: 'response' | 'requestBody' | 'parameters' | 'endpoint';
  jsonPointer: string; // RFC 6901 JSON Pointer e.g. "#/paths/~1api~1orders/get/responses/200/..."
  fieldPath: string; // e.g. "orders[].total_amount"
  previousType: string | undefined;
  newType: string | undefined;
  impactSummary: string;
  message?: string; // alias for impactSummary
  impact?: string; // alias for impactSummary
  remediationAdvice: string;
  migrationAdvice?: string; // alias for remediationAdvice
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
}

// Backward compatibility alias for BreakingChange
export type BreakingChange = StructuredContractDiff;

export interface SchemaDiffResult {
  hasBreakingChanges: boolean;
  totalChanges: number;
  breakingCount: number;
  nonBreakingCount?: number;
  warningCount: number;
  changes: StructuredContractDiff[];
  oldVersion?: string;
  newVersion?: string;
  summary: string;
}

export interface ProposedPatch {
  id: string;
  breakingChangeId: string;
  title: string;
  description: string;
  targetWorkspace: string;
  filePath: string;
  patchType: 'REPLACE_FIELD' | 'ADD_FALLBACK' | 'UPDATE_SCHEMA' | 'ADD_ADAPTER';
  originalSnippet: string;
  patchedSnippet: string;
}

export interface OpenApiSchemaObject {
  type?: string | string[];
  properties?: Record<string, OpenApiSchemaObject>;
  required?: string[];
  items?: OpenApiSchemaObject;
  enum?: (string | number)[];
  description?: string;
  format?: string;
  $ref?: string;
  oneOf?: OpenApiSchemaObject[];
  anyOf?: OpenApiSchemaObject[];
  allOf?: OpenApiSchemaObject[];
  nullable?: boolean;
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  required?: boolean;
  schema?: OpenApiSchemaObject;
  description?: string;
}

export interface OpenApiResponse {
  description?: string;
  content?: Record<string, { schema?: OpenApiSchemaObject }>;
}

export interface OpenApiOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, { schema?: OpenApiSchemaObject }>;
  };
  responses?: Record<string, OpenApiResponse>;
}

export interface OpenApiDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    schemas?: Record<string, OpenApiSchemaObject>;
  };
}

export type ConsumerArtifactKind =
  | 'interface'
  | 'type_alias'
  | 'zod_schema'
  | 'hook'
  | 'react_component'
  | 'fetch_call'
  | 'property_access';

export interface ConsumerReferenceLocation {
  filePath: string;
  line: number;
  column: number;
  kind: ConsumerArtifactKind;
  identifier: string;
  contextSnippet: string;
}

export interface ConsumerScanResult {
  targetField: string;
  endpointPath?: string;
  totalReferences: number;
  interfaces: ConsumerReferenceLocation[];
  zodSchemas: ConsumerReferenceLocation[];
  hooks: ConsumerReferenceLocation[];
  components: ConsumerReferenceLocation[];
  calls: ConsumerReferenceLocation[];
}

export interface CompilerDiagnostic {
  fileName: string;
  line: number;
  column: number;
  code: string; // e.g. "TS2339", "TS2322"
  message: string;
  raw: string;
}

export interface TypeVerificationResult {
  passed: boolean;
  tscExitCode: number;
  vitestExitCode: number;
  diagnostics: CompilerDiagnostic[];
  testFailures: string[];
  stdout: string;
  stderr: string;
  durationMs: number;
  temporaryFixturePath?: string;
}
