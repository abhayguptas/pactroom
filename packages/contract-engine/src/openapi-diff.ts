import { OpenApiDocument, SchemaDiffResult } from './types.js';
import { classifyContractChanges } from './breaking-classifier.js';

/**
 * Compares two OpenAPI 3.0 / 3.1 documents and returns a SchemaDiffResult
 * with standard RFC 6901 JSON pointers and breaking/non-breaking classifications.
 */
export function diffOpenApiSchemas(
  oldDoc: OpenApiDocument,
  newDoc: OpenApiDocument
): SchemaDiffResult {
  return classifyContractChanges(oldDoc, newDoc);
}
