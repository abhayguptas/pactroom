import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDbPath = path.resolve(__dirname, '../../pactroom.db');

const dbPath = process.env.PACTROOM_DATABASE_PATH || defaultDbPath;
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Export initialized Drizzle ORM instance
export const orm = drizzle(sqlite, { schema });
export const db = sqlite; // backward-compatibility alias for raw queries

export function initDatabase(): void {
  // 1. SwitchRooms Table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS switch_rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team TEXT NOT NULL DEFAULT 'pactflow',
      bridge TEXT NOT NULL DEFAULT 'Slack',
      active_agents TEXT NOT NULL,
      rules TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL
    );
  `);

  // 2. ContractNegotiations Table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS contract_negotiations (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      status TEXT NOT NULL,
      source_workspace TEXT NOT NULL DEFAULT 'workspaces/backend-api',
      target_workspace TEXT NOT NULL DEFAULT 'workspaces/frontend-consumer',
      detected_endpoint TEXT,
      diff_summary TEXT,
      baseline_schema_json TEXT,
      candidate_schema_json TEXT,
      breaking_count INTEGER DEFAULT 0,
      chosen_option TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      resolved_at TEXT,
      FOREIGN KEY(room_id) REFERENCES switch_rooms(id)
    );
  `);

  // 3. ConsumerBreakages Table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS consumer_breakages (
      id TEXT PRIMARY KEY,
      negotiation_id TEXT NOT NULL,
      workspace TEXT NOT NULL DEFAULT 'workspaces/frontend-consumer',
      tool TEXT NOT NULL,
      file_path TEXT NOT NULL,
      line_number INTEGER NOT NULL,
      column_number INTEGER,
      error_code TEXT NOT NULL,
      code_snippet TEXT NOT NULL,
      raw_terminal_output TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(negotiation_id) REFERENCES contract_negotiations(id)
    );
  `);

  // 4. RoomDecisions Table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS room_decisions (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      negotiation_id TEXT NOT NULL,
      decision_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      approved_by_backend_human TEXT NOT NULL,
      approved_by_frontend_human TEXT NOT NULL,
      schema_version TEXT NOT NULL,
      applied_patch_diff TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY(room_id) REFERENCES switch_rooms(id),
      FOREIGN KEY(negotiation_id) REFERENCES contract_negotiations(id)
    );
  `);

  // 5. AgentExecutionLogs Table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS agent_execution_logs (
      id TEXT PRIMARY KEY,
      negotiation_id TEXT,
      agent_role TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      command TEXT NOT NULL,
      workspace TEXT NOT NULL,
      git_diff_output TEXT,
      applied_patch_diff TEXT,
      exit_code INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      stdout TEXT NOT NULL,
      stderr TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY(negotiation_id) REFERENCES contract_negotiations(id)
    );
  `);

  // Legacy compatibility tables for existing UI views
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL,
      instructions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      workspace_path TEXT NOT NULL,
      capabilities TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contract_revisions (
      id TEXT PRIMARY KEY,
      version TEXT NOT NULL,
      spec_json TEXT NOT NULL,
      branch TEXT NOT NULL,
      commit_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS breaking_changes (
      id TEXT PRIMARY KEY,
      revision_id TEXT NOT NULL,
      category TEXT NOT NULL,
      severity TEXT NOT NULL,
      path TEXT NOT NULL,
      method TEXT,
      field_path TEXT NOT NULL,
      message TEXT NOT NULL,
      impact TEXT NOT NULL,
      migration_advice TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS negotiations (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      status TEXT NOT NULL,
      breaking_count INTEGER DEFAULT 0,
      chosen_strategy TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS negotiation_messages (
      id TEXT PRIMARY KEY,
      negotiation_id TEXT NOT NULL,
      sender_agent_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS verification_runs (
      id TEXT PRIMARY KEY,
      negotiation_id TEXT,
      workspace TEXT NOT NULL,
      tool TEXT NOT NULL,
      command TEXT NOT NULL,
      exit_code INTEGER NOT NULL,
      stdout TEXT NOT NULL,
      stderr TEXT NOT NULL,
      passed INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patches (
      id TEXT PRIMARY KEY,
      negotiation_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      target_workspace TEXT NOT NULL,
      file_path TEXT NOT NULL,
      patch_type TEXT NOT NULL,
      original_snippet TEXT NOT NULL,
      patched_snippet TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PROPOSED',
      applied_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed official Switch Room: {team}-api-contracts (default team: pactflow)
  const defaultRoomId = 'room-pactflow-api-contracts';
  const existingSwitchRoom = sqlite.prepare('SELECT id FROM switch_rooms WHERE id = ?').get(defaultRoomId);

  if (!existingSwitchRoom) {
    const now = new Date().toISOString();
    const defaultRules = `
1. Zero Breaking Changes Released Uncoordinated: Every uncommitted backend change modifying REST endpoints or DTO shapes must be negotiated.
2. Machine B Verification: The frontend agent must verify candidate schemas against local TypeScript codebase using tsc --noEmit and vitest.
3. Human-in-the-Loop Gate: The sync agent must never apply patches or merge pull requests without explicit human sign-off from both backend and frontend owners.
4. Binding Decisions Log: All approved resolutions are permanently written to RoomDecisions with binding schema versions.
    `.trim();

    sqlite.prepare(`
      INSERT INTO switch_rooms (id, name, team, bridge, active_agents, rules, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      defaultRoomId,
      'pactflow-api-contracts',
      'pactflow',
      'Slack',
      JSON.stringify(['pactflow-watch', 'pactflow-verify', 'pactflow-sync']),
      defaultRules,
      'ACTIVE',
      now
    );

    // Seed default baseline negotiation
    sqlite.prepare(`
      INSERT OR IGNORE INTO contract_negotiations (
        id, room_id, status, source_workspace, target_workspace, detected_endpoint, diff_summary, breaking_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'neg_default',
      defaultRoomId,
      'DETECTED',
      'workspaces/backend-api',
      'workspaces/frontend-consumer',
      'GET /api/v1/orders/:id',
      'Baseline active negotiation monitoring uncommitted working trees',
      0,
      now,
      now
    );

    // Seed legacy rooms and agents for backward compatibility
    sqlite.prepare(`
      INSERT OR IGNORE INTO rooms (id, name, platform, status, instructions)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'room-pactroom-prod-01',
      'PactRoom Cross-Machine Negotiator',
      'switch',
      'READY',
      'Cross-machine API contract and breaking-change negotiator connecting backend and frontend coding agents.'
    );

    sqlite.prepare(`
      INSERT OR IGNORE INTO agents (id, room_id, name, role, workspace_path, capabilities, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'pactflow-watch',
      'room-pactroom-prod-01',
      'pactflow-watch (Backend Machine A)',
      'inspector',
      'workspaces/backend-api',
      JSON.stringify(['git.diff', 'openapi.extract_live', 'schema.classify_breaking']),
      'ACTIVE'
    );

    sqlite.prepare(`
      INSERT OR IGNORE INTO agents (id, room_id, name, role, workspace_path, capabilities, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'pactflow-verify',
      'room-pactroom-prod-01',
      'pactflow-verify (Frontend Machine B)',
      'validator',
      'workspaces/frontend-consumer',
      JSON.stringify(['tsc.typecheck', 'vitest.contract_tests', 'ast.scanner']),
      'ACTIVE'
    );

    sqlite.prepare(`
      INSERT OR IGNORE INTO agents (id, room_id, name, role, workspace_path, capabilities, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'pactflow-sync',
      'room-pactroom-prod-01',
      'pactflow-sync (Negotiator & Auto-Patcher)',
      'arbitrator',
      'packages/contract-engine',
      JSON.stringify(['plan.synthesize_options', 'human.approval_gate', 'patch.auto_apply']),
      'ACTIVE'
    );

    sqlite.prepare(`
      INSERT OR IGNORE INTO negotiations (id, room_id, status, breaking_count)
      VALUES (?, ?, ?, ?)
    `).run('neg_default', 'room-pactroom-prod-01', 'IDLE', 0);
  }
}

// Auto-initialize SQLite database schema on module load
initDatabase();
