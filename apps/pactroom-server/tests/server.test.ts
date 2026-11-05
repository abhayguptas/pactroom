import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { createServerApp } from '../src/app.js';
import { sqlite } from '../src/db/database.js';

describe('PactRoom Server & Switch Agent Protocol Bridge', { timeout: 30000 }, () => {
  let app: any;
  const rootDir = path.resolve(__dirname, '../../../..');
  const backendWorkspace = path.resolve(rootDir, 'workspaces/backend-api');
  const frontendWorkspace = path.resolve(rootDir, 'workspaces/frontend-consumer');

  beforeAll(() => {
    app = createServerApp();
  });

  afterAll(async () => {
    // Restore clean baseline state on disk
    try {
      const resetScript = path.resolve(backendWorkspace, 'scripts/reset-baseline.ts');
      if (fs.existsSync(resetScript)) {
        const { BASELINE_SCHEMA_CONTENT } = await import('../../../workspaces/backend-api/src/routes/v1.js');
        fs.writeFileSync(path.resolve(backendWorkspace, 'src/schemas/orders.ts'), BASELINE_SCHEMA_CONTENT, 'utf-8');
      }
    } catch (e) {}
  });

  describe('Part 1: SQLite Database Schema & Persistence (Five Core Tables)', () => {
    it('1. switch_rooms stores room ID, {team}-api-contracts name, bridge, agents, and rules', () => {
      const room = sqlite.prepare('SELECT * FROM switch_rooms WHERE id = ?').get('room-pactflow-api-contracts') as any;
      expect(room).toBeDefined();
      expect(room.name).toBe('pactflow-api-contracts');
      expect(room.team).toBe('pactflow');
      expect(room.bridge).toBe('Slack');
      expect(room.status).toBe('ACTIVE');

      const agents = JSON.parse(room.active_agents);
      expect(agents).toContain('pactflow-watch');
      expect(agents).toContain('pactflow-verify');
      expect(agents).toContain('pactflow-sync');

      expect(room.rules).toContain('Zero Breaking Changes Released Uncoordinated');
      expect(room.rules).toContain('Human-in-the-Loop Gate');
    });

    it('2. contract_negotiations tracks API change states from DETECTED through RESOLVED', () => {
      const negId = `test_neg_${Date.now()}`;
      const now = new Date().toISOString();

      // Test state transitions
      sqlite.prepare(`
        INSERT INTO contract_negotiations (
          id, room_id, status, source_workspace, target_workspace,
          detected_endpoint, diff_summary, breaking_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        negId,
        'room-pactflow-api-contracts',
        'DETECTED',
        'workspaces/backend-api',
        'workspaces/frontend-consumer',
        'GET /api/v1/orders/:id',
        'Detected uncommitted total_amount_cents refactor',
        1,
        now,
        now
      );

      let record = sqlite.prepare('SELECT * FROM contract_negotiations WHERE id = ?').get(negId) as any;
      expect(record.status).toBe('DETECTED');

      // Transition to VERIFYING_CONSUMERS
      sqlite.prepare('UPDATE contract_negotiations SET status = ? WHERE id = ?').run('VERIFYING_CONSUMERS', negId);
      record = sqlite.prepare('SELECT * FROM contract_negotiations WHERE id = ?').get(negId) as any;
      expect(record.status).toBe('VERIFYING_CONSUMERS');

      // Transition to BREAKING_FOUND
      sqlite.prepare('UPDATE contract_negotiations SET status = ? WHERE id = ?').run('BREAKING_FOUND', negId);
      record = sqlite.prepare('SELECT * FROM contract_negotiations WHERE id = ?').get(negId) as any;
      expect(record.status).toBe('BREAKING_FOUND');

      // Transition to AWAITING_HUMAN_DECISION
      sqlite.prepare('UPDATE contract_negotiations SET status = ? WHERE id = ?').run('AWAITING_HUMAN_DECISION', negId);
      record = sqlite.prepare('SELECT * FROM contract_negotiations WHERE id = ?').get(negId) as any;
      expect(record.status).toBe('AWAITING_HUMAN_DECISION');

      // Transition to PATCHING_REPOS -> RESOLVED
      sqlite.prepare('UPDATE contract_negotiations SET status = ?, chosen_option = ? WHERE id = ?').run('RESOLVED', 'OPTION_A', negId);
      record = sqlite.prepare('SELECT * FROM contract_negotiations WHERE id = ?').get(negId) as any;
      expect(record.status).toBe('RESOLVED');
      expect(record.chosen_option).toBe('OPTION_A');
    });

    it('3. consumer_breakages records real compiler failures with file, line, and code snippet', () => {
      const breakageId = `brk_test_${Date.now()}`;
      const now = new Date().toISOString();

      sqlite.prepare(`
        INSERT INTO consumer_breakages (
          id, negotiation_id, workspace, tool, file_path, line_number,
          column_number, error_code, code_snippet, raw_terminal_output, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        breakageId,
        'neg_default',
        'workspaces/frontend-consumer',
        'tsc',
        'src/components/CheckoutSummary.tsx',
        22,
        35,
        'TS2339',
        "Property 'total_amount_cents' does not exist on type 'OrderResponse'",
        'src/components/CheckoutSummary.tsx(22,35): error TS2339: Property total_amount_cents does not exist',
        now
      );

      const record = sqlite.prepare('SELECT * FROM consumer_breakages WHERE id = ?').get(breakageId) as any;
      expect(record).toBeDefined();
      expect(record.file_path).toBe('src/components/CheckoutSummary.tsx');
      expect(record.line_number).toBe(22);
      expect(record.error_code).toBe('TS2339');
      expect(record.code_snippet).toContain("Property 'total_amount_cents' does not exist");
    });

    it('4. room_decisions stores immutable decisions log with mutual human approvals', () => {
      const decisionId = `dec_test_${Date.now()}`;
      const now = new Date().toISOString();

      sqlite.prepare(`
        INSERT INTO room_decisions (
          id, room_id, negotiation_id, decision_type, title, description,
          approved_by_backend_human, approved_by_frontend_human, schema_version,
          applied_patch_diff, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        decisionId,
        'room-pactflow-api-contracts',
        'neg_default',
        'OPTION_A',
        'Option A: Backend Backward-Compatible Adapter',
        'Dual-write total_amount_cents and pricing_breakdown',
        'alex-backend-lead',
        'sam-frontend-lead',
        'v1.1.0-adapter',
        '+ total_amount_cents: z.number().optional()',
        now
      );

      const record = sqlite.prepare('SELECT * FROM room_decisions WHERE id = ?').get(decisionId) as any;
      expect(record).toBeDefined();
      expect(record.approved_by_backend_human).toBe('alex-backend-lead');
      expect(record.approved_by_frontend_human).toBe('sam-frontend-lead');
      expect(record.schema_version).toBe('v1.1.0-adapter');
    });

    it('5. agent_execution_logs stores real command runs, git diff, duration, and exit code', () => {
      const logId = `log_test_${Date.now()}`;
      const now = new Date().toISOString();

      sqlite.prepare(`
        INSERT INTO agent_execution_logs (
          id, negotiation_id, agent_role, agent_name, command, workspace,
          git_diff_output, exit_code, duration_ms, stdout, stderr, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        'neg_default',
        'verify',
        'pactflow-verify',
        'npx tsc --noEmit && npx vitest run',
        'workspaces/frontend-consumer',
        'diff --git a/src/schemas/orders.ts',
        0,
        1420,
        'Done in 1.4s without errors',
        '',
        now
      );

      const record = sqlite.prepare('SELECT * FROM agent_execution_logs WHERE id = ?').get(logId) as any;
      expect(record).toBeDefined();
      expect(record.agent_role).toBe('verify');
      expect(record.command).toContain('tsc --noEmit');
      expect(record.duration_ms).toBe(1420);
      expect(record.exit_code).toBe(0);
    });
  });

  describe('Part 2: Switch Agent Protocol & Real-Time HTTP/SSE Endpoints', () => {
    it('GET /health returns 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('pactroom-server');
    });

    it('GET /api/status returns operational status, active room, and stats', async () => {
      const res = await request(app).get('/api/status');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('operational');
      expect(res.body.room.name).toBe('pactflow-api-contracts');
      expect(res.body.stats).toHaveProperty('activeBreakages');
      expect(res.body.stats).toHaveProperty('bindingDecisions');
      expect(res.body.workspaces.backend.path).toBe('workspaces/backend-api');
      expect(res.body.workspaces.frontend.path).toBe('workspaces/frontend-consumer');
    });

    it('GET /api/rooms returns list of rooms from switch_rooms table', async () => {
      const res = await request(app).get('/api/rooms');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.rooms)).toBe(true);
      expect(res.body.rooms.length).toBeGreaterThanOrEqual(1);
      expect(res.body.rooms[0].name).toBe('pactflow-api-contracts');
    });

    it('POST /api/switch/command executes !list-agents, !roles, and !list-documents', async () => {
      // !list-agents
      const resAgents = await request(app).post('/api/switch/command').send({ command: '!list-agents' });
      expect(resAgents.status).toBe(200);
      expect(resAgents.body.output).toContain('pactflow-watch');
      expect(resAgents.body.output).toContain('pactflow-verify');
      expect(resAgents.body.output).toContain('pactflow-sync');

      // !roles
      const resRoles = await request(app).post('/api/switch/command').send({ command: '!roles' });
      expect(resRoles.status).toBe(200);
      expect(resRoles.body.output).toContain('PactRoom Role Definitions');

      // !list-documents
      const resDocs = await request(app).post('/api/switch/command').send({ command: '!list-documents' });
      expect(resDocs.status).toBe(200);
      expect(resDocs.body.output).toContain('OpenAPI 3.1 Live Spec');
    });

    it('POST /api/switch/message handles agent mentions (@watch, @verify, @sync)', async () => {
      const res = await request(app).post('/api/switch/message').send({
        content: '@watch check local uncommitted backend changes',
        senderName: 'Backend Dev'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.negotiation).toBeDefined();
    });

    it('GET /api/events connects and streams Server-Sent Events', async () => {
      const server = app.listen(0);
      const port = (server.address() as any).port;

      const contentType = await new Promise<string>((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/api/events`, (res) => {
          const type = res.headers['content-type'] || '';
          req.destroy();
          server.close(() => resolve(type));
        });
        req.on('error', (err) => {
          server.close(() => reject(err));
        });
      });

      expect(contentType).toContain('text/event-stream');
    });
  });

  describe('Part 3: Real Auto-Patch Engine & Child Process Verification', () => {
    it('POST /api/scan triggers real watch inspection and compares schemas', async () => {
      const res = await request(app).post('/api/scan').send({});
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.diffResult).toBeDefined();
      expect(typeof res.body.diffResult.hasBreakingChanges).toBe('boolean');
    });

    it('POST /api/negotiate/decision executes real Auto-Patch Engine (Option A) and proves tests pass', async () => {
      const res = await request(app).post('/api/negotiate/decision').send({
        option: 'OPTION_A',
        approvedByBackend: 'alex-backend-owner',
        approvedByFrontend: 'sam-frontend-guardian'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.patchResult.decisionType).toBe('OPTION_A');
      expect(res.body.patchResult.verificationPassed).toBe(true);
      expect(res.body.patchResult.schemaVersion).toBe('v1.1.0-adapter');
      expect(res.body.negotiation.status).toBe('RESOLVED');

      // Verify recorded in room_decisions table
      const decision = sqlite.prepare('SELECT * FROM room_decisions WHERE id = ?').get(res.body.patchResult.decisionId) as any;
      expect(decision).toBeDefined();
      expect(decision.approved_by_backend_human).toBe('alex-backend-owner');

      // Verify recorded in agent_execution_logs table
      const logs = sqlite.prepare('SELECT * FROM agent_execution_logs WHERE agent_role = ? ORDER BY timestamp DESC LIMIT 1').get('sync') as any;
      expect(logs).toBeDefined();
      expect(logs.exit_code).toBe(0);
    });

    it('GET /api/breakages and GET /api/decisions expose database persistence', async () => {
      const breakagesRes = await request(app).get('/api/breakages');
      expect(breakagesRes.status).toBe(200);
      expect(Array.isArray(breakagesRes.body.breakages)).toBe(true);

      const decisionsRes = await request(app).get('/api/decisions');
      expect(decisionsRes.status).toBe(200);
      expect(Array.isArray(decisionsRes.body.decisions)).toBe(true);
      expect(decisionsRes.body.decisions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
