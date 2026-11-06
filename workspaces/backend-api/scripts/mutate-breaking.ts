#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MUTATED_BREAKING_SCHEMA_CONTENT } from '../src/routes/v1.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../src/schemas/orders.ts');

console.log('[PactRoom Machine A] Mutating backend API contract on disk...');
console.log(`[PactRoom Machine A] Target file: ${schemaPath}`);

fs.writeFileSync(schemaPath, MUTATED_BREAKING_SCHEMA_CONTENT, 'utf-8');

console.log('✓ Successfully applied breaking schema change to disk:');
console.log('  - Field refactor: total_amount_cents -> pricing_breakdown.amount_minor');
console.log('  - Enum update: OrderStatusEnum settled -> completed');
console.log('  - Git status: uncommitted, dirty working tree on Machine A.');
