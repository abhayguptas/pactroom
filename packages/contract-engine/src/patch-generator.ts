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
    frontendZodFilePath?: string;
    backendRouterFilePath?: string;
  } = {}
): ProposedPatch[] {
  const patches: ProposedPatch[] = [];

  for (const change of breakingChanges) {
    if (change.severity !== 'BREAKING' && change.severity !== 'CRITICAL') {
      continue;
    }

    // Pattern 1: Property removed in response (e.g. total_amount removed in favor of subtotal + tax_amount)
    if (change.category === 'PROPERTY_REMOVED' && change.location === 'response') {
      const field = change.fieldPath.split('.').pop() || change.fieldPath;

      // Option A: Frontend Auto-Patch with Zod transform and compatibility fallback
      patches.push({
        id: nextPatchId(),
        breakingChangeId: change.id,
        title: `Auto-patch Frontend Zod Validator for '${field}'`,
        description: `Upgrades frontend validator to parse new fields (subtotal, tax_amount) while computing backward-compatible '${field}' dynamically.`,
        targetWorkspace: 'frontend-consumer',
        filePath: options.frontendZodFilePath || 'src/schemas/orders.ts',
        patchType: 'UPDATE_SCHEMA',
        originalSnippet: `${field}: z.number(),`,
        patchedSnippet: `subtotal: z.number(),\n  tax_amount: z.number(),\n  // PactRoom Auto-Patch: computed fallback\n  ${field}: z.number().optional().default(0),`
      });

      // Option B: Backend Graceful Deprecation Alias
      patches.push({
        id: nextPatchId(),
        breakingChangeId: change.id,
        title: `Backend Deprecation Alias for '${field}'`,
        description: `Retains '${field}' as a computed property in the backend response with @deprecated annotation to ensure zero client downtime.`,
        targetWorkspace: 'backend-api',
        filePath: options.backendRouterFilePath || 'src/routes/orders.ts',
        patchType: 'ADD_FALLBACK',
        originalSnippet: `subtotal: order.subtotal,\n    tax_amount: order.tax_amount,`,
        patchedSnippet: `subtotal: order.subtotal,\n    tax_amount: order.tax_amount,\n    /** @deprecated Migrating to subtotal + tax_amount */\n    ${field}: order.subtotal + order.tax_amount,`
      });
    }

    // Pattern 2: Required Parameter Added to Request
    if (change.category === 'REQUIRED_PARAM_ADDED' && change.location === 'requestBody') {
      const field = change.fieldPath.split('.').pop() || change.fieldPath;

      patches.push({
        id: nextPatchId(),
        breakingChangeId: change.id,
        title: `Frontend Payload Update: Supply '${field}'`,
        description: `Adds required '${field}' with safe default to frontend mutation hook.`,
        targetWorkspace: 'frontend-consumer',
        filePath: options.frontendZodFilePath || 'src/api/client.ts',
        patchType: 'REPLACE_FIELD',
        originalSnippet: `payload: { items, shippingAddress }`,
        patchedSnippet: `payload: { items, shippingAddress, ${field}: 'standard' }`
      });
    }

    // Pattern 3: Type Changed (e.g. string to number, or narrowed union)
    if (change.category === 'TYPE_CHANGED') {
      const field = change.fieldPath.split('.').pop() || change.fieldPath;
      patches.push({
        id: nextPatchId(),
        breakingChangeId: change.id,
        title: `Type Coercion Patch for '${field}'`,
        description: `Updates consumer validator to coerce or accept the new type '${change.newValue}' alongside '${change.oldValue}'.`,
        targetWorkspace: 'frontend-consumer',
        filePath: options.frontendZodFilePath || 'src/schemas/orders.ts',
        patchType: 'UPDATE_SCHEMA',
        originalSnippet: `${field}: z.string(),`,
        patchedSnippet: `${field}: z.union([z.string(), z.number()]).transform(String),`
      });
    }
  }

  return patches;
}

