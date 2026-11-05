import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * 1. SwitchRooms Table
 * Stores the room ID, room name ({team}-api-contracts), connected chat bridge
 * (Slack, Discord, Mattermost, Teams), active agents (watch, verify, sync), and room rules.
 */
export const switchRooms = sqliteTable('switch_rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. 'pactflow-api-contracts'
  team: text('team').notNull().default('pactflow'),
  bridge: text('bridge').notNull().default('Slack'), // Slack | Discord | Mattermost | Teams
  activeAgents: text('active_agents').notNull(), // JSON string: ['watch', 'verify', 'sync']
  rules: text('rules').notNull(),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull()
});

/**
 * 2. ContractNegotiations Table
 * Tracks each detected uncommitted API change from:
 * DETECTED -> VERIFYING_CONSUMERS -> BREAKING_FOUND -> AWAITING_HUMAN_DECISION -> PATCHING_REPOS -> RESOLVED
 */
export const contractNegotiations = sqliteTable('contract_negotiations', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => switchRooms.id),
  status: text('status').notNull(), // 'DETECTED' | 'VERIFYING_CONSUMERS' | 'BREAKING_FOUND' | 'AWAITING_HUMAN_DECISION' | 'PATCHING_REPOS' | 'RESOLVED'
  sourceWorkspace: text('source_workspace').notNull().default('workspaces/backend-api'),
  targetWorkspace: text('target_workspace').notNull().default('workspaces/frontend-consumer'),
  detectedEndpoint: text('detected_endpoint'), // e.g. 'GET /api/v1/orders/:id'
  diffSummary: text('diff_summary'),
  baselineSchemaJson: text('baseline_schema_json'),
  candidateSchemaJson: text('candidate_schema_json'),
  breakingCount: integer('breaking_count').default(0),
  chosenOption: text('chosen_option'), // 'OPTION_A' | 'OPTION_B'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  resolvedAt: text('resolved_at')
});

/**
 * 3. ConsumerBreakages Table
 * Stores the real TypeScript tsc and vitest failures detected on Machine B,
 * including exact file paths, line numbers, code snippets, and raw terminal output.
 */
export const consumerBreakages = sqliteTable('consumer_breakages', {
  id: text('id').primaryKey(),
  negotiationId: text('negotiation_id').notNull().references(() => contractNegotiations.id),
  workspace: text('workspace').notNull().default('workspaces/frontend-consumer'),
  tool: text('tool').notNull(), // 'tsc' | 'vitest'
  filePath: text('file_path').notNull(), // exact file path
  lineNumber: integer('line_number').notNull(), // exact line number
  columnNumber: integer('column_number'),
  errorCode: text('error_code').notNull(), // e.g. 'TS2339'
  codeSnippet: text('code_snippet').notNull(),
  rawTerminalOutput: text('raw_terminal_output').notNull(),
  createdAt: text('created_at').notNull()
});

/**
 * 4. RoomDecisions Table
 * Stores the immutable Switch Room Decisions log—recording which human developers
 * approved Option A (Backend Backward-Compatible Adapter) or Option B (Synchronized Frontend Consumer Patch),
 * the exact timestamp, and the binding schema version.
 */
export const roomDecisions = sqliteTable('room_decisions', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => switchRooms.id),
  negotiationId: text('negotiation_id').notNull().references(() => contractNegotiations.id),
  decisionType: text('decision_type').notNull(), // 'OPTION_A' | 'OPTION_B'
  title: text('title').notNull(),
  description: text('description').notNull(),
  approvedByBackendHuman: text('approved_by_backend_human').notNull(),
  approvedByFrontendHuman: text('approved_by_frontend_human').notNull(),
  schemaVersion: text('schema_version').notNull(), // e.g. 'v1.1.0-compat' or 'v2.0.0-synchronized'
  appliedPatchDiff: text('applied_patch_diff'),
  timestamp: text('timestamp').notNull()
});

/**
 * 5. AgentExecutionLogs Table
 * Stores every real command executed by watch, verify, and sync, including actual
 * git diff output, execution duration in milliseconds, exit codes, and applied patch diffs.
 */
export const agentExecutionLogs = sqliteTable('agent_execution_logs', {
  id: text('id').primaryKey(),
  negotiationId: text('negotiation_id').references(() => contractNegotiations.id),
  agentRole: text('agent_role').notNull(), // 'watch' | 'verify' | 'sync'
  agentName: text('agent_name').notNull(),
  command: text('command').notNull(),
  workspace: text('workspace').notNull(),
  gitDiffOutput: text('git_diff_output'),
  appliedPatchDiff: text('applied_patch_diff'),
  exitCode: integer('exit_code').notNull(),
  durationMs: integer('duration_ms').notNull(),
  stdout: text('stdout').notNull(),
  stderr: text('stderr').notNull(),
  timestamp: text('timestamp').notNull()
});

// Infer types from Drizzle schema
export type SwitchRoom = typeof switchRooms.$inferSelect;
export type InsertSwitchRoom = typeof switchRooms.$inferInsert;

export type ContractNegotiation = typeof contractNegotiations.$inferSelect;
export type InsertContractNegotiation = typeof contractNegotiations.$inferInsert;

export type ConsumerBreakage = typeof consumerBreakages.$inferSelect;
export type InsertConsumerBreakage = typeof consumerBreakages.$inferInsert;

export type RoomDecision = typeof roomDecisions.$inferSelect;
export type InsertRoomDecision = typeof roomDecisions.$inferInsert;

export type AgentExecutionLog = typeof agentExecutionLogs.$inferSelect;
export type InsertAgentExecutionLog = typeof agentExecutionLogs.$inferInsert;

