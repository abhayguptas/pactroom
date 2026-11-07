import { BreakingChange, ProposedPatch } from './types.js';

let patchCounter = 0;
function nextPatchId(): string {
  patchCounter += 1;
  return `patch_${Date.now()}_${patchCounter}`;
}

/**
 * Generates actionable patches for frontend or backend codebases given breaking changes
 */
export function generateMigrationPatches(
  breakingChanges: BreakingChange[],
  options: {
    frontendWorkspace?: string;
    backendWorkspace?: string;
    frontendZodFilePath?: string;
    backendRouterFilePath?: string;
  } = {}
): ProposedPatch[] {
  const patches: ProposedPatch[] = [];
  const feWs = options.frontendWorkspace || 'frontend-consumer';
  const beWs = options.backendWorkspace || 'backend-api';

  for (const change of breakingChanges) {
    if (change.severity !== 'BREAKING' && change.severity !== 'CRITICAL') {
      continue;
    }

    const field = change.fieldPath.split('.').pop() || change.fieldPath;

    // Pattern 1: Property removed in response (e.g. field removed or refactored)
    if (change.category === 'PROPERTY_REMOVED' && change.location === 'response') {
      // Option A: Frontend Auto-Patch with fallback
      patches.push({
        id: nextPatchId(),
        breakingChangeId: change.id,
        title: `Auto-patch Frontend Validator for '${field}'`,
        description: `Upgrades frontend validator to handle upstream removal of '${field}' dynamically while maintaining backward-compatible fallback.`,
        targetWorkspace: feWs,
        filePath: options.frontendZodFilePath || 'src/schemas/orders.ts',
        patchType: 'UPDATE_SCHEMA',
        originalSnippet: `${field}: z.any(),`,
        patchedSnippet: `// PactRoom Dynamic Fallback Patch\n  ${field}: z.any().optional(),`
      });

      // Option B: Backend Graceful Deprecation Alias
      patches.push({
        id: nextPatchId(),
        breakingChangeId: change.id,
        title: `Backend Deprecation Alias for '${field}'`,
        description: `Retains '${field}' as a computed property in the backend response with @deprecated annotation to ensure zero client downtime.`,
        targetWorkspace: beWs,
        filePath: options.backendRouterFilePath || 'src/routes/orders.ts',
        patchType: 'ADD_FALLBACK',
        originalSnippet: `// Omitted ${field} from response`,
        patchedSnippet: `/** @deprecated Backward-compatibility alias for ${field} */\n    ${field}: (order as any).${field} ?? (order as any).pricing_breakdown?.amount_minor,`
      });
    }

    // Pattern 2: Required Parameter Added to Request
    if (change.category === 'REQUIRED_PARAM_ADDED' && change.location === 'requestBody') {
      patches.push({
        id: nextPatchId(),
        breakingChangeId: change.id,
        title: `Frontend Payload Update: Supply '${field}'`,
        description: `Adds required '${field}' with safe default to frontend mutation payload.`,
        targetWorkspace: feWs,
        filePath: options.frontendZodFilePath || 'src/api/client.ts',
        patchType: 'REPLACE_FIELD',
        originalSnippet: `payload: { ...data }`,
        patchedSnippet: `payload: { ...data, ${field}: 'standard' }`
      });

      patches.push({
        id: nextPatchId(),
        breakingChangeId: change.id,
        title: `Backend Optional Fallback for '${field}'`,
        description: `Relaxes '${field}' to optional with sensible default fallback value.`,
        targetWorkspace: beWs,
        filePath: options.backendRouterFilePath || 'src/schemas/orders.ts',
        patchType: 'UPDATE_SCHEMA',
        originalSnippet: `${field}: z.string(),`,
        patchedSnippet: `${field}: z.string().optional().default('standard'),`
      });
    }

    // Pattern 3: Type Changed (e.g. string to number, or narrowed union)
    if (change.category === 'TYPE_CHANGED') {
      const oldType = change.oldValue ? String(change.oldValue) : 'string';
      const newType = change.newValue ? String(change.newValue) : 'number';
      patches.push({
        id: nextPatchId(),
        breakingChangeId: change.id,
        title: `Type Coercion Patch for '${field}'`,
        description: `Updates consumer validator to coerce or accept '${newType}' alongside legacy '${oldType}'.`,
        targetWorkspace: feWs,
        filePath: options.frontendZodFilePath || 'src/schemas/orders.ts',
        patchType: 'UPDATE_SCHEMA',
        originalSnippet: `${field}: z.${oldType}(),`,
        patchedSnippet: `${field}: z.union([z.${oldType}(), z.${newType}()]),`
      });
    }
  }

  return patches;
}

