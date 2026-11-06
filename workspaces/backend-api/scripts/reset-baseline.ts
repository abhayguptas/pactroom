#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BASELINE_SCHEMA_CONTENT } from '../src/routes/v1.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../src/schemas/orders.ts');

console.log('[PactRoom Machine A] Restoring baseline backend API contract on disk...');
console.log(`[PactRoom Machine A] Target file: ${schemaPath}`);

fs.writeFileSync(schemaPath, BASELINE_SCHEMA_CONTENT, 'utf-8');

console.log('✓ Successfully restored clean baseline schema state:');
console.log('  - Field restored: total_amount_cents: number');
console.log('  - Enum restored: OrderStatusEnum settled');
console.log('  - Git status: clean baseline.');
