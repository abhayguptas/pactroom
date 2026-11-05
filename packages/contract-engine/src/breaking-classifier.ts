import {
  OpenApiDocument,
  OpenApiOperation,
  OpenApiParameter,
  OpenApiSchemaObject,
  SchemaDiffResult,
  StructuredContractDiff
} from './types.js';

let diffCounter = 0;
function nextDiffId(prefix = 'diff'): string {
  diffCounter += 1;
  return `${prefix}_${Date.now()}_${diffCounter}`;
}

/**
 * Encodes a JSON pointer token according to RFC 6901
 * ('~' becomes '~0', '/' becomes '~1')
 */
export function escapeJsonPointerToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Builds an RFC 6901 compliant JSON Pointer
 */
export function buildJsonPointer(tokens: string[]): string {
  if (tokens.length === 0) return '#';
  return '#' + tokens.map((t) => '/' + escapeJsonPointerToken(t)).join('');
}

/**
 * Resolves $ref within an OpenAPI document
 */
export function resolveSchema(
  schema: OpenApiSchemaObject | undefined,
  doc: OpenApiDocument
): OpenApiSchemaObject | undefined {
  if (!schema) return undefined;
  if (schema.$ref && schema.$ref.startsWith('#/components/schemas/')) {
    const name = schema.$ref.replace('#/components/schemas/', '');
    const resolved = doc.components?.schemas?.[name];
    if (resolved) {
      return resolveSchema(resolved, doc);
    }
  }
  return schema;
}

/**
 * Recursively diffs schema objects (Response or RequestBody payload schemas)
 */
function diffSchemaStructure(
  oldSchema: OpenApiSchemaObject | undefined,
  newSchema: OpenApiSchemaObject | undefined,
  oldDoc: OpenApiDocument,
  newDoc: OpenApiDocument,
  pointerTokens: string[],
  context: {
    routePath: string;
    httpMethod: string;
    location: 'response' | 'requestBody' | 'parameters';
    fieldPrefix: string;
  }
): StructuredContractDiff[] {
  const diffs: StructuredContractDiff[] = [];
  const sOld = resolveSchema(oldSchema, oldDoc);
  const sNew = resolveSchema(newSchema, newDoc);

  if (!sOld && !sNew) return diffs;

  // Case 1: Entire schema removed
  if (sOld && !sNew) {
    const isBreaking = context.location === 'response';
    diffs.push({
      id: nextDiffId('sch_rem'),
      isBreaking,
      category: 'PROPERTY_REMOVED',
      severity: isBreaking ? 'BREAKING' : 'WARNING',
      httpMethod: context.httpMethod,
      method: context.httpMethod,
      routePath: context.routePath,
      jsonPointer: buildJsonPointer(pointerTokens),
      fieldPath: context.fieldPrefix || 'body',
      previousType: sOld.type ? String(sOld.type) : 'object',
      newType: undefined,
      impactSummary: isBreaking
        ? `Response payload at '${context.fieldPrefix || 'body'}' was removed. Consumers will receive undefined.`
        : `Request payload schema was removed.`,
      remediationAdvice: 'Retain response model or provide fallback deprecation wrapper.',
      oldValue: sOld,
      newValue: undefined
    });
    return diffs;
  }

  // Case 2: Schema added
  if (!sOld && sNew) {
    if (context.location === 'requestBody') {
      diffs.push({
        id: nextDiffId('sch_add_req'),
        isBreaking: true,
        category: 'REQUIRED_PARAM_ADDED',
        severity: 'BREAKING',
        httpMethod: context.httpMethod,
      method: context.httpMethod,
        routePath: context.routePath,
        jsonPointer: buildJsonPointer(pointerTokens),
        fieldPath: context.fieldPrefix || 'body',
        previousType: undefined,
        newType: sNew.type ? String(sNew.type) : 'object',
        impactSummary: `New required request body introduced. Existing callers will receive 400 Bad Request.`,
        remediationAdvice: 'Make new request fields optional or provide server-side defaults.',
        oldValue: undefined,
        newValue: sNew
      });
    } else {
      diffs.push({
        id: nextDiffId('sch_add_resp'),
        isBreaking: false,
        category: 'PROPERTY_ADDED',
        severity: 'INFO',
        httpMethod: context.httpMethod,
      method: context.httpMethod,
        routePath: context.routePath,
        jsonPointer: buildJsonPointer(pointerTokens),
        fieldPath: context.fieldPrefix || 'body',
        previousType: undefined,
        newType: sNew.type ? String(sNew.type) : 'object',
        impactSummary: `Non-breaking: New response schema added at '${context.fieldPrefix || 'body'}'. Older consumers ignore it safely.`,
        remediationAdvice: 'Frontend can update client DTOs to consume new fields when ready.',
        oldValue: undefined,
        newValue: sNew
      });
    }
    return diffs;
  }

  if (!sOld || !sNew) return diffs;

  // Type change or type narrowing check
  const oldType = Array.isArray(sOld.type) ? sOld.type.join('|') : sOld.type;
  const newType = Array.isArray(sNew.type) ? sNew.type.join('|') : sNew.type;

  if (oldType && newType && oldType !== newType) {
    // Check if type narrowed (e.g. string|number -> number, or string -> number)
    const isNarrowed =
      (oldType.includes('|') && !newType.includes('|')) ||
      (oldType === 'string' && newType === 'number') ||
      (oldType === 'any' && newType !== 'any');

    const isWidened =
      (!oldType.includes('|') && newType.includes('|')) ||
      (context.location === 'requestBody' && newType === 'string' && oldType === 'number');

    const isBreaking = context.location === 'response' || isNarrowed;

    diffs.push({
      id: nextDiffId('type_diff'),
      isBreaking,
      category: isNarrowed ? 'TYPE_NARROWED' : isWidened ? 'TYPE_WIDENED' : 'TYPE_CHANGED',
      severity: isBreaking ? 'BREAKING' : 'INFO',
      httpMethod: context.httpMethod,
      method: context.httpMethod,
      routePath: context.routePath,
      jsonPointer: buildJsonPointer([...pointerTokens, 'type']),
      fieldPath: context.fieldPrefix || 'root',
      previousType: oldType,
      newType: newType,
      impactSummary: isBreaking
        ? `Field type narrowed/changed from '${oldType}' to '${newType}'. Frontend Zod validator will throw ZodError at runtime.`
        : `Field type widened from '${oldType}' to '${newType}'. Compatible change.`,
      remediationAdvice: `Update frontend TypeScript types and Zod parser to accept '${newType}'.`,
      oldValue: oldType,
      newValue: newType
    });
  }

  // Enum value removed
  if (sOld.enum && sNew.enum) {
    const oldEnumSet = new Set(sOld.enum.map(String));
    const newEnumSet = new Set(sNew.enum.map(String));

    for (const val of oldEnumSet) {
      if (!newEnumSet.has(val)) {
        const isBreaking = context.location === 'response';
        diffs.push({
          id: nextDiffId('enum_rem'),
          isBreaking,
          category: 'ENUM_VALUE_REMOVED',
          severity: isBreaking ? 'BREAKING' : 'WARNING',
          httpMethod: context.httpMethod,
      method: context.httpMethod,
          routePath: context.routePath,
          jsonPointer: buildJsonPointer([...pointerTokens, 'enum']),
          fieldPath: context.fieldPrefix,
          previousType: `enum(${val})`,
          newType: undefined,
          impactSummary: `Enum value '${val}' was removed from '${context.fieldPrefix}'. Frontend switch-cases or UI states will miss this state.`,
          remediationAdvice: `Remove consumer references to enum '${val}' or retain it in backend union.`,
          oldValue: val,
          newValue: undefined
        });
      }
    }

    for (const val of newEnumSet) {
      if (!oldEnumSet.has(val)) {
        diffs.push({
          id: nextDiffId('enum_add'),
          isBreaking: false,
          category: 'ENUM_VALUE_ADDED',
          severity: 'INFO',
          httpMethod: context.httpMethod,
      method: context.httpMethod,
          routePath: context.routePath,
          jsonPointer: buildJsonPointer([...pointerTokens, 'enum']),
          fieldPath: context.fieldPrefix,
          previousType: undefined,
          newType: `enum(${val})`,
          impactSummary: `Compatible: New enum value '${val}' added to '${context.fieldPrefix}'.`,
          remediationAdvice: 'Frontend can handle new enum state when appropriate.',
          oldValue: undefined,
          newValue: val
        });
      }
    }
  }

  // Object Properties Structural Diff
  const oldProps = sOld.properties || {};
  const newProps = sNew.properties || {};
  const oldRequired = new Set(sOld.required || []);
  const newRequired = new Set(sNew.required || []);

  const removedPropKeys = Object.keys(oldProps).filter((k) => !newProps[k]);
  const addedPropKeys = Object.keys(newProps).filter((k) => !oldProps[k]);

  // Check for Removed / Renamed Properties
  for (const propName of removedPropKeys) {
    const currentField = context.fieldPrefix ? `${context.fieldPrefix}.${propName}` : propName;
    const oldPropSchema = oldProps[propName];

    // Detect if this is a 1-to-1 renamed property key (e.g. total_price -> total_amount)
    const isRenamed = removedPropKeys.length === 1 && addedPropKeys.length === 1;
    const isBreaking = context.location === 'response' || oldRequired.has(propName);

    diffs.push({
      id: nextDiffId(isRenamed ? 'prop_renamed' : 'prop_rem'),
      isBreaking,
      category: isRenamed ? 'PROPERTY_RENAMED' : 'PROPERTY_REMOVED',
      severity: isBreaking ? 'BREAKING' : 'WARNING',
      httpMethod: context.httpMethod,
      method: context.httpMethod,
      routePath: context.routePath,
      path: context.routePath,
      location: context.location,
      jsonPointer: buildJsonPointer([...pointerTokens, 'properties', propName]),
      fieldPath: currentField,
      previousType: oldPropSchema.type ? String(oldPropSchema.type) : 'unknown',
      newType: undefined,
      impactSummary: isBreaking
        ? `Response property '${currentField}' was ${isRenamed ? 'renamed' : 'removed'}${
            addedPropKeys.length > 0 ? ` (new fields introduced: ${addedPropKeys.join(', ')})` : ''
          }. Frontend data accesses like 'data.${currentField}' will crash or fail Zod parsing.`
        : `Property '${currentField}' was removed from request schema.`,
      message: `Property '${currentField}' was ${isRenamed ? 'renamed' : 'removed'}`,
      impact: `Frontend accesses to '${currentField}' will fail at runtime.`,
      remediationAdvice: `Migrate frontend callers to replacement fields or maintain backward-compatible alias.`,
      migrationAdvice: `Update frontend consumers to stop referencing '${currentField}', or request backend backward-compatibility alias.`,
      oldValue: oldPropSchema,
      newValue: undefined
    });
  }

  // Check for Added Properties
  for (const propName of addedPropKeys) {
    const currentField = context.fieldPrefix ? `${context.fieldPrefix}.${propName}` : propName;
    const newPropSchema = newProps[propName];
    const isRequired = newRequired.has(propName);

    if (context.location === 'requestBody' && isRequired) {
      diffs.push({
        id: nextDiffId('prop_req_add'),
        isBreaking: true,
        category: 'REQUIRED_PARAM_ADDED',
        severity: 'BREAKING',
        httpMethod: context.httpMethod,
      method: context.httpMethod,
        routePath: context.routePath,
        path: context.routePath,
        location: context.location,
        jsonPointer: buildJsonPointer([...pointerTokens, 'properties', propName]),
        fieldPath: currentField,
        previousType: undefined,
        newType: newPropSchema.type ? String(newPropSchema.type) : 'unknown',
        impactSummary: `New required request field '${currentField}' was added. Calls without this field will return 400 Bad Request.`,
        message: `New required request field '${currentField}' was added`,
        impact: `Existing callers will fail validation with 400 Bad Request.`,
        remediationAdvice: `Supply '${currentField}' in consumer API client mutations.`,
        migrationAdvice: `Add required field '${currentField}' in consumer request payloads.`,
        oldValue: undefined,
        newValue: newPropSchema
      });
    } else {
      diffs.push({
        id: nextDiffId('prop_add_opt'),
        isBreaking: false,
        category: 'PROPERTY_ADDED',
        severity: 'INFO',
        httpMethod: context.httpMethod,
      method: context.httpMethod,
        routePath: context.routePath,
        path: context.routePath,
        location: context.location,
        jsonPointer: buildJsonPointer([...pointerTokens, 'properties', propName]),
        fieldPath: currentField,
        previousType: undefined,
        newType: newPropSchema.type ? String(newPropSchema.type) : 'unknown',
        impactSummary: `Non-breaking: Optional field '${currentField}' added. Older consumers ignore it safely.`,
        message: `New field '${currentField}' added`,
        impact: `Non-breaking additive change.`,
        remediationAdvice: `Consume '${currentField}' when UI is ready.`,
        migrationAdvice: `Can be consumed by frontend when needed.`,
        oldValue: undefined,
        newValue: newPropSchema
      });
    }
  }

  // Recurse into common properties
  for (const [propName, oldPropSchema] of Object.entries(oldProps)) {
    if (newProps[propName]) {
      const currentField = context.fieldPrefix ? `${context.fieldPrefix}.${propName}` : propName;
      const childDiffs = diffSchemaStructure(
        oldPropSchema,
        newProps[propName],
        oldDoc,
        newDoc,
        [...pointerTokens, 'properties', propName],
        {
          ...context,
          fieldPrefix: currentField
        }
      );
      diffs.push(...childDiffs);
    }
  }

  // Array items diffing
  if (sOld.items || sNew.items) {
    const itemDiffs = diffSchemaStructure(
      sOld.items,
      sNew.items,
      oldDoc,
      newDoc,
      [...pointerTokens, 'items'],
      {
        ...context,
        fieldPrefix: `${context.fieldPrefix}[]`
      }
    );
    diffs.push(...itemDiffs);
  }

  return diffs;
}

/**
 * Diffs operation parameters (query, path, header)
 */
function diffOperationParameters(
  oldParams: OpenApiParameter[] = [],
  newParams: OpenApiParameter[] = [],
  context: { routePath: string; httpMethod: string }
): StructuredContractDiff[] {
  const diffs: StructuredContractDiff[] = [];
  const oldMap = new Map<string, OpenApiParameter>(oldParams.map((p) => [`${p.in}:${p.name}`, p]));
  const newMap = new Map<string, OpenApiParameter>(newParams.map((p) => [`${p.in}:${p.name}`, p]));

  for (const [key, nParam] of newMap.entries()) {
    const oParam = oldMap.get(key);
    const pointer = buildJsonPointer([
      'paths',
      context.routePath,
      context.httpMethod.toLowerCase(),
      'parameters',
      nParam.name
    ]);

    if (!oParam && nParam.required) {
      diffs.push({
        id: nextDiffId('param_req'),
        isBreaking: true,
        category: 'REQUIRED_PARAM_ADDED',
        severity: 'BREAKING',
        httpMethod: context.httpMethod,
      method: context.httpMethod,
        routePath: context.routePath,
        jsonPointer: pointer,
        fieldPath: `${nParam.in}.${nParam.name}`,
        previousType: undefined,
        newType: nParam.schema?.type ? String(nParam.schema.type) : 'string',
        impactSummary: `New required ${nParam.in} parameter '${nParam.name}' added to ${context.httpMethod} ${context.routePath}. Requests omitting this will fail with 400.`,
        remediationAdvice: `Update consumer fetch hooks to supply parameter '${nParam.name}'.`,
        oldValue: undefined,
        newValue: nParam
      });
    } else if (oParam && !oParam.required && nParam.required) {
      diffs.push({
        id: nextDiffId('param_made_req'),
        isBreaking: true,
        category: 'OPTIONAL_PARAM_MADE_REQUIRED',
        severity: 'BREAKING',
        httpMethod: context.httpMethod,
      method: context.httpMethod,
        routePath: context.routePath,
        jsonPointer: pointer,
        fieldPath: `${nParam.in}.${nParam.name}`,
        previousType: 'optional',
        newType: 'required',
        impactSummary: `Parameter '${nParam.name}' was optional and is now required. Existing consumer calls omitting it will fail.`,
        remediationAdvice: `Ensure all consumer call sites provide '${nParam.name}'.`,
        oldValue: 'optional',
        newValue: 'required'
      });
    } else if (!oParam && !nParam.required) {
      diffs.push({
        id: nextDiffId('param_opt_add'),
        isBreaking: false,
        category: 'OPTIONAL_PARAM_ADDED',
        severity: 'INFO',
        httpMethod: context.httpMethod,
      method: context.httpMethod,
        routePath: context.routePath,
        jsonPointer: pointer,
        fieldPath: `${nParam.in}.${nParam.name}`,
        previousType: undefined,
        newType: nParam.schema?.type ? String(nParam.schema.type) : 'string',
        impactSummary: `Non-breaking: Optional ${nParam.in} parameter '${nParam.name}' added.`,
        remediationAdvice: 'Consumers can supply parameter when required.',
        oldValue: undefined,
        newValue: nParam
      });
    }
  }

  return diffs;
}

/**
 * Diffs operation responses (status codes and body schemas)
 */
function diffOperationResponses(
  oldResponses: Record<string, any> = {},
  newResponses: Record<string, any> = {},
  oldDoc: OpenApiDocument,
  newDoc: OpenApiDocument,
  context: { routePath: string; httpMethod: string }
): StructuredContractDiff[] {
  const diffs: StructuredContractDiff[] = [];
  const oldCodes = Object.keys(oldResponses);
  const newCodes = Object.keys(newResponses);

  // Check removed success codes
  for (const code of oldCodes) {
    if (code.startsWith('2') && !newCodes.includes(code)) {
      const pointer = buildJsonPointer([
        'paths',
        context.routePath,
        context.httpMethod.toLowerCase(),
        'responses',
        code
      ]);
      diffs.push({
        id: nextDiffId('status_rem'),
        isBreaking: true,
        category: 'STATUS_CODE_REMOVED',
        severity: 'BREAKING',
        httpMethod: context.httpMethod,
      method: context.httpMethod,
        routePath: context.routePath,
        jsonPointer: pointer,
        fieldPath: `HTTP ${code}`,
        previousType: `HTTP ${code}`,
        newType: undefined,
        impactSummary: `Success response status code ${code} was removed from ${context.httpMethod} ${context.routePath}. Callers expecting this code will fail status checks.`,
        remediationAdvice: `Update client response status handling to support: ${newCodes.join(', ')}.`,
        oldValue: code,
        newValue: undefined
      });
    }
  }

  // Compare body schemas for common status codes
  const commonCodes = oldCodes.filter((c) => newCodes.includes(c));
  for (const code of commonCodes) {
    const oldResp = oldResponses[code];
    const newResp = newResponses[code];

    const oldJsonSchema = oldResp?.content?.['application/json']?.schema;
    const newJsonSchema = newResp?.content?.['application/json']?.schema;

    const basePointerTokens = [
      'paths',
      context.routePath,
      context.httpMethod.toLowerCase(),
      'responses',
      code,
      'content',
      'application/json',
      'schema'
    ];

    const schemaDiffs = diffSchemaStructure(
      oldJsonSchema,
      newJsonSchema,
      oldDoc,
      newDoc,
      basePointerTokens,
      {
        routePath: context.routePath,
        httpMethod: context.httpMethod,
        location: 'response',
        fieldPrefix: ''
      }
    );
    diffs.push(...schemaDiffs);
  }

  return diffs;
}

/**
 * Main Classifier Function: Performs structural diffing between baseline and uncommitted working schemas
 */
export function classifyContractChanges(
  baselineDoc: OpenApiDocument,
  workingDoc: OpenApiDocument
): SchemaDiffResult {
  const diffs: StructuredContractDiff[] = [];

  const baselinePaths = Object.keys(baselineDoc.paths || {});
  const workingPaths = Object.keys(workingDoc.paths || {});

  // 1. Check for removed endpoints
  for (const path of baselinePaths) {
    if (!workingPaths.includes(path)) {
      diffs.push({
        id: nextDiffId('ep_rem'),
        isBreaking: true,
        category: 'ENDPOINT_REMOVED',
        severity: 'CRITICAL',
        httpMethod: 'ALL',
        routePath: path,
        path,
        location: 'endpoint',
        jsonPointer: buildJsonPointer(['paths', path]),
        fieldPath: path,
        previousType: 'endpoint',
        newType: undefined,
        impactSummary: `Endpoint '${path}' was completely removed. All consumer requests will return 404 Not Found.`,
        message: `Endpoint '${path}' was completely removed`,
        impact: `All frontend calls to '${path}' will fail with HTTP 404 Not Found.`,
        remediationAdvice: 'Restore endpoint or configure backward-compatibility redirect.',
        migrationAdvice: 'Verify if route was deprecated or replaced with an alternative path.',
        oldValue: path,
        newValue: undefined
      });
      continue;
    }

    const baseMethods = Object.keys(baselineDoc.paths[path] || {});
    const workMethods = Object.keys(workingDoc.paths[path] || {});

    // Check removed methods on existing endpoint
    for (const method of baseMethods) {
      const upperMethod = method.toUpperCase();
      if (!workMethods.map((m) => m.toLowerCase()).includes(method.toLowerCase())) {
        diffs.push({
          id: nextDiffId('meth_rem'),
          isBreaking: true,
          category: 'METHOD_REMOVED',
          severity: 'CRITICAL',
          httpMethod: upperMethod,
          routePath: path,
          path,
          location: 'endpoint',
          jsonPointer: buildJsonPointer(['paths', path, method.toLowerCase()]),
          fieldPath: `${upperMethod} ${path}`,
          previousType: upperMethod,
          newType: undefined,
          impactSummary: `HTTP Method ${upperMethod} removed from '${path}'. Consumer calls will fail with 405 Method Not Allowed.`,
          message: `HTTP Method ${upperMethod} removed from endpoint '${path}'`,
          impact: `Calls to ${upperMethod} ${path} will return HTTP 405 Method Not Allowed.`,
          remediationAdvice: `Update client to use available methods: ${workMethods.map((m) => m.toUpperCase()).join(', ')}.`,
          migrationAdvice: `Update frontend client to use active methods: ${workMethods.map((m) => m.toUpperCase()).join(', ')}.`,
          oldValue: upperMethod,
          newValue: undefined
        });
        continue;
      }

      const oldOp: OpenApiOperation = baselineDoc.paths[path][method];
      const newOp: OpenApiOperation = workingDoc.paths[path][method];

      // Documentation changes
      if (oldOp.summary !== newOp.summary || oldOp.description !== newOp.description) {
        diffs.push({
          id: nextDiffId('doc_upd'),
          isBreaking: false,
          category: 'DOCUMENTATION_UPDATED',
          severity: 'INFO',
          httpMethod: upperMethod,
          routePath: path,
          jsonPointer: buildJsonPointer(['paths', path, method.toLowerCase(), 'description']),
          fieldPath: 'description',
          previousType: 'string',
          newType: 'string',
          impactSummary: 'Non-breaking documentation update.',
          remediationAdvice: 'No consumer code changes required.',
          oldValue: oldOp.summary || oldOp.description,
          newValue: newOp.summary || newOp.description
        });
      }

      // Parameters diff
      const paramDiffs = diffOperationParameters(oldOp.parameters, newOp.parameters, {
        routePath: path,
        httpMethod: upperMethod
      });
      diffs.push(...paramDiffs);

      // Request body diff
      const oldReqBody = oldOp.requestBody?.content?.['application/json']?.schema;
      const newReqBody = newOp.requestBody?.content?.['application/json']?.schema;
      const reqDiffs = diffSchemaStructure(
        oldReqBody,
        newReqBody,
        baselineDoc,
        workingDoc,
        ['paths', path, method.toLowerCase(), 'requestBody', 'content', 'application/json', 'schema'],
        {
          routePath: path,
          httpMethod: upperMethod,
          location: 'requestBody',
          fieldPrefix: 'body'
        }
      );
      diffs.push(...reqDiffs);

      // Response diff
      const respDiffs = diffOperationResponses(oldOp.responses, newOp.responses, baselineDoc, workingDoc, {
        routePath: path,
        httpMethod: upperMethod
      });
      diffs.push(...respDiffs);
    }
  }

  // 2. Check for added endpoints (Non-Breaking)
  for (const path of workingPaths) {
    if (!baselinePaths.includes(path)) {
      diffs.push({
        id: nextDiffId('ep_add'),
        isBreaking: false,
        category: 'ENDPOINT_ADDED',
        severity: 'INFO',
        httpMethod: 'ALL',
        routePath: path,
        jsonPointer: buildJsonPointer(['paths', path]),
        fieldPath: path,
        previousType: undefined,
        newType: 'endpoint',
        impactSummary: `Non-breaking: New endpoint '${path}' added to API.`,
        remediationAdvice: 'Frontend can build new features using this endpoint.',
        oldValue: undefined,
        newValue: path
      });
    }
  }

  const breakingCount = diffs.filter((d) => d.isBreaking).length;
  const nonBreakingCount = diffs.filter((d) => !d.isBreaking).length;
  const warningCount = diffs.filter((d) => d.severity === 'WARNING').length;

  return {
    hasBreakingChanges: breakingCount > 0,
    totalChanges: diffs.length,
    breakingCount,
    nonBreakingCount,
    warningCount,
    changes: diffs,
    oldVersion: baselineDoc.info.version,
    newVersion: workingDoc.info.version,
    summary:
      breakingCount > 0
        ? `Detected ${breakingCount} breaking change(s) and ${nonBreakingCount} non-breaking change(s).`
        : diffs.length > 0
        ? `All ${diffs.length} change(s) are backward-compatible.`
        : 'Zero schema differences detected between API versions.'
  };
}
