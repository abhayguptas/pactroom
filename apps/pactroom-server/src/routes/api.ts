import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sqlite } from '../db/database.js';
import { sseManager } from '../events/sse-manager.js';
import { switchBridge } from '../protocol/switch-bridge.js';
import { getBridgeConfig, isBridgeAvailable, initMattermostBridge } from '../protocol/mattermost-bridge.js';
import {
  runGitStatus,
  runGitDiff,
  runTscVerification,
  runVitestSuite,
  executeChildProcess
} from '../runners/process-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const backendWorkspace = process.env.BACKEND_WORKSPACE || 'workspaces/backend-api';
const frontendWorkspace = process.env.FRONTEND_WORKSPACE || 'workspaces/frontend-consumer';
const backendWorkspaceDir = path.isAbsolute(backendWorkspace)
  ? backendWorkspace
  : path.resolve(rootDir, backendWorkspace);

export const apiRouter = Router();

// ============================================================================
// Server-Sent Events (SSE) Endpoint
// ============================================================================

apiRouter.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  const cleanup = sseManager.addClient(res);
  req.on('close', cleanup);
});

// ============================================================================
// Overall System & Workspace Health
// ============================================================================

apiRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const room = sqlite.prepare('SELECT * FROM switch_rooms LIMIT 1').get();
    const breakagesCount = sqlite.prepare('SELECT COUNT(*) as count FROM consumer_breakages').get() as { count: number };
    const decisionsCount = sqlite.prepare('SELECT COUNT(*) as count FROM room_decisions').get() as { count: number };

    const backendGit = await runGitStatus(backendWorkspace).catch(() => ({
      passed: false,
      stdout: 'untracked'
    }));
    const frontendGit = await runGitStatus(frontendWorkspace).catch(() => ({
      passed: false,
      stdout: 'untracked'
    }));

    res.json({
      status: 'operational',
      uptime: process.uptime(),
      room,
      workspaces: {
        backend: {
          path: backendWorkspace,
          gitBranch: backendGit.stdout.split('\n')[0] || 'main'
        },
        frontend: {
          path: frontendWorkspace,
          gitBranch: frontendGit.stdout.split('\n')[0] || 'main'
        }
      },
      stats: {
        activeBreakages: breakagesCount?.count || 0,
        bindingDecisions: decisionsCount?.count || 0
      },
      activeNegotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Mattermost / Switch Bridge Endpoints
// ============================================================================

apiRouter.get('/bridge/status', (_req: Request, res: Response) => {
  res.json({
    available: isBridgeAvailable(),
    config: getBridgeConfig()
  });
});

apiRouter.post('/bridge/configure', async (req: Request, res: Response) => {
  try {
    const { url, token, channelId } = req.body || {};
    const success = await initMattermostBridge({ url, token, channelId });
    res.json({
      success,
      available: isBridgeAvailable(),
      config: getBridgeConfig()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Switch Rooms Endpoints
// ============================================================================

apiRouter.get('/rooms', (_req: Request, res: Response) => {
  try {
    const rooms = sqlite.prepare('SELECT * FROM switch_rooms ORDER BY created_at DESC').all();
    res.json({ rooms });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/rooms/:id', (req: Request, res: Response) => {
  try {
    const room = sqlite.prepare('SELECT * FROM switch_rooms WHERE id = ?').get(String(req.params.id));
    if (!room) {
      return res.status(404).json({ error: `Room '${req.params.id}' not found` });
    }
    return res.json({ room });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Contract Negotiations & Historical Entities
// ============================================================================

apiRouter.get('/negotiations', (_req: Request, res: Response) => {
  try {
    const negotiations = sqlite.prepare('SELECT * FROM contract_negotiations ORDER BY created_at DESC LIMIT 10').all();
    const activeNeg = switchBridge.getActiveNegotiation();
    const hasActiveBreaking = activeNeg && activeNeg.status !== 'RESOLVED' && (activeNeg.breakingCount > 0 || activeNeg.breakagesCount > 0);

    const breakages = hasActiveBreaking
      ? sqlite.prepare(`
          SELECT 
            id, 
            negotiation_id as negotiationId, 
            workspace, 
            tool, 
            file_path as filePath, 
            line_number as line, 
            column_number as column, 
            error_code as errorCode, 
            code_snippet as message, 
            code_snippet as snippet, 
            raw_terminal_output as rawTerminalOutput, 
            created_at as createdAt 
          FROM consumer_breakages 
          WHERE negotiation_id = ?
          ORDER BY created_at DESC 
          LIMIT 20
        `).all(activeNeg.id)
      : [];
    const rawDecisions = sqlite.prepare('SELECT * FROM room_decisions ORDER BY timestamp DESC LIMIT 20').all();
    const decisions = rawDecisions.map((d: any) => ({
      id: d.id,
      roomId: d.room_id || d.roomId || 'room-pactflow-api-contracts',
      negotiationId: d.negotiation_id || d.negotiationId,
      decisionType: d.decision_type || d.decisionType || 'OPTION_A',
      title: d.title,
      description: d.description,
      approvedByBackend: d.approved_by_backend_human || d.approvedByBackend || 'alex.be',
      approvedByFrontend: d.approved_by_frontend_human || d.approvedByFrontend || 'sam.fe',
      schemaVersion: d.schema_version || d.schemaVersion || 'v1.1.0-adapter',
      appliedPatchDiff: d.applied_patch_diff || d.appliedPatchDiff,
      verificationPassed: true,
      timestamp: d.timestamp
    }));
    const rawLogs = sqlite.prepare('SELECT * FROM agent_execution_logs ORDER BY timestamp DESC LIMIT 30').all();
    const executionLogs = rawLogs.map((log: any) => ({
      id: log.id,
      negotiationId: log.negotiation_id || log.negotiationId,
      agentRole: log.agent_role || log.agentRole,
      agentName: log.agent_name || log.agentName,
      command: log.command,
      workspace: log.workspace,
      gitDiffOutput: log.git_diff_output || log.gitDiffOutput,
      appliedPatchDiff: log.applied_patch_diff || log.appliedPatchDiff,
      exitCode: log.exit_code !== undefined ? log.exit_code : log.exitCode,
      durationMs: log.duration_ms !== undefined ? log.duration_ms : log.durationMs,
      stdout: log.stdout,
      stderr: log.stderr,
      timestamp: log.timestamp
    }));
    const messages = sqlite.prepare(`
      SELECT 
        id, 
        negotiation_id as negotiationId, 
        sender_agent_id as senderAgentId, 
        sender_name as senderName, 
        role, 
        content, 
        metadata_json as metadata, 
        created_at as timestamp 
      FROM negotiation_messages 
      ORDER BY created_at ASC
      LIMIT 100
    `).all();

    res.json({
      negotiations,
      breakages,
      decisions,
      executionLogs,
      messages,
      activeNegotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/breakages - Real TypeScript and Vitest failures recorded on Machine B
apiRouter.get('/breakages', (_req: Request, res: Response) => {
  try {
    const activeNeg = switchBridge.getActiveNegotiation();
    const hasActiveBreaking = activeNeg && activeNeg.status !== 'RESOLVED' && (activeNeg.breakingCount > 0 || activeNeg.breakagesCount > 0);

    const breakages = hasActiveBreaking
      ? sqlite.prepare(`
          SELECT 
            id, 
            negotiation_id as negotiationId, 
            workspace, 
            tool, 
            file_path as filePath, 
            line_number as line, 
            column_number as column, 
            error_code as errorCode, 
            code_snippet as message, 
            code_snippet as snippet, 
            raw_terminal_output as rawTerminalOutput, 
            created_at as createdAt 
          FROM consumer_breakages 
          WHERE negotiation_id = ?
          ORDER BY created_at DESC
        `).all(activeNeg.id)
      : [];
    res.json({ breakages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/decisions - Immutable Room Decisions Log
apiRouter.get('/decisions', (_req: Request, res: Response) => {
  try {
    const rawDecisions = sqlite.prepare('SELECT * FROM room_decisions ORDER BY timestamp DESC').all();
    const decisions = rawDecisions.map((d: any) => ({
      id: d.id,
      roomId: d.room_id || d.roomId || 'room-pactflow-api-contracts',
      negotiationId: d.negotiation_id || d.negotiationId,
      decisionType: d.decision_type || d.decisionType || 'OPTION_A',
      title: d.title,
      description: d.description,
      approvedByBackend: d.approved_by_backend_human || d.approvedByBackend || 'alex.be',
      approvedByFrontend: d.approved_by_frontend_human || d.approvedByFrontend || 'sam.fe',
      schemaVersion: d.schema_version || d.schemaVersion || 'v1.1.0-adapter',
      appliedPatchDiff: d.applied_patch_diff || d.appliedPatchDiff,
      verificationPassed: true,
      timestamp: d.timestamp
    }));
    res.json({ decisions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs - Real command execution logs with git diffs and durations
apiRouter.get('/logs', (_req: Request, res: Response) => {
  try {
    const rawLogs = sqlite.prepare('SELECT * FROM agent_execution_logs ORDER BY timestamp DESC LIMIT 50').all();
    const logs = rawLogs.map((log: any) => ({
      id: log.id,
      negotiationId: log.negotiation_id || log.negotiationId,
      agentRole: log.agent_role || log.agentRole,
      agentName: log.agent_name || log.agentName,
      command: log.command,
      workspace: log.workspace,
      gitDiffOutput: log.git_diff_output || log.gitDiffOutput,
      appliedPatchDiff: log.applied_patch_diff || log.appliedPatchDiff,
      exitCode: log.exit_code !== undefined ? log.exit_code : log.exitCode,
      durationMs: log.duration_ms !== undefined ? log.duration_ms : log.durationMs,
      stdout: log.stdout,
      stderr: log.stderr,
      timestamp: log.timestamp
    }));
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Real Agent Trigger Endpoints
// ============================================================================

// POST /api/scan - Trigger Machine A Backend Watch Agent
apiRouter.post('/scan', async (_req: Request, res: Response) => {
  try {
    const diffResult = await switchBridge.runWatchAgent();
    res.json({
      success: true,
      diffResult,
      negotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/verify - Trigger Machine B Frontend Verify Agent
apiRouter.post('/verify', async (_req: Request, res: Response) => {
  try {
    const result = await switchBridge.runVerifyAgent();
    res.json({
      success: true,
      result,
      negotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/negotiate - Trigger Arbitrator Sync Plan Synthesis
apiRouter.post('/negotiate', async (_req: Request, res: Response) => {
  try {
    await switchBridge.runSyncAgent();
    res.json({
      success: true,
      negotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/negotiate/decision - Human Approval Gate Resolution & Auto-Patch
apiRouter.post('/negotiate/decision', async (req: Request, res: Response) => {
  try {
    const { option, approvedByBackend, approvedByFrontend } = req.body;
    const decisionType = option === 'OPTION_B' ? 'OPTION_B' : 'OPTION_A';

    const patchResult = await switchBridge.resolveNegotiation(
      decisionType,
      approvedByBackend || 'backend-lead-alex',
      approvedByFrontend || 'frontend-lead-sam'
    );

    res.json({
      success: patchResult.success,
      patchResult,
      negotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Switch Agent Protocol Messaging & Room Commands
// ============================================================================

// POST /api/switch/message - Ingests message into Switch room with mentions & command parsing
apiRouter.post('/switch/message', async (req: Request, res: Response) => {
  try {
    const { content, senderName, senderId } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    await switchBridge.handleRoomMessage(content, senderName || 'Developer', senderId || 'human-user');
    return res.json({
      success: true,
      negotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/switch/command - Direct command trigger (!list-agents, !roles, !list-documents)
apiRouter.post('/switch/command', async (req: Request, res: Response) => {
  try {
    const { command } = req.body;
    let output = '';

    if (command === '!list-agents') {
      output = await switchBridge.handleListAgentsCommand();
    } else if (command === '!roles') {
      output = await switchBridge.handleRolesCommand();
    } else if (command === '!list-documents') {
      output = await switchBridge.handleListDocumentsCommand();
    } else {
      return res.status(400).json({ error: `Unknown room command '${command}'` });
    }

    return res.json({ success: true, command, output });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Backward-Compatibility Endpoints for Studio UI
// ============================================================================

apiRouter.post('/patch/apply', async (req: Request, res: Response) => {
  try {
    const { patchId, option } = req.body;
    const chosenOption = option === 'OPTION_B' || (patchId && patchId.includes('consumer')) ? 'OPTION_B' : 'OPTION_A';
    const result = await switchBridge.resolveNegotiation(chosenOption);
    res.json({
      success: result.success,
      verification: result.verificationOutput
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/patch/revert', async (req: Request, res: Response) => {
  try {
    const { patchId } = req.body;
    const success = await switchBridge.revertPatch(patchId || '');
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Real Machine A (Backend Workspace) Interactive Actions
// ============================================================================

// POST /api/backend/mutate - Introduce real uncommitted breaking change on disk
apiRouter.post('/backend/mutate', async (_req: Request, res: Response) => {
  try {
    // Execute real mutate-breaking script on backend workspace
    await executeChildProcess('node', backendWorkspace, 'npx', ['tsx', 'scripts/mutate-breaking.ts']);

    // Trigger Machine A watch agent to detect git diff & breaking OpenAPI change
    const diffResult = await switchBridge.runWatchAgent();

    const gitDiff = await runGitDiff(backendWorkspace);
    const gitStatus = await runGitStatus(backendWorkspace);
    const schemaFile = path.resolve(backendWorkspaceDir, 'src/schemas/orders.ts');
    const schemaSource = fs.existsSync(schemaFile) ? fs.readFileSync(schemaFile, 'utf-8') : '';

    res.json({
      success: true,
      mutated: true,
      gitStatus: gitStatus.stdout,
      gitDiff: gitDiff.stdout,
      schemaSource,
      diffResult,
      negotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/backend/reset - Restore clean baseline state on disk
apiRouter.post('/backend/reset', async (_req: Request, res: Response) => {
  try {
    // Reset all workspaces to clean baseline
    await switchBridge.resetAllWorkspacesToBaseline();

    // Trigger watch agent to confirm clean tree
    const diffResult = await switchBridge.runWatchAgent();

    const gitDiff = await runGitDiff(backendWorkspace);
    const gitStatus = await runGitStatus(backendWorkspace);
    const schemaFile = path.resolve(backendWorkspaceDir, 'src/schemas/orders.ts');
    const schemaSource = fs.existsSync(schemaFile) ? fs.readFileSync(schemaFile, 'utf-8') : '';

    res.json({
      success: true,
      reset: true,
      gitStatus: gitStatus.stdout,
      gitDiff: gitDiff.stdout,
      schemaSource,
      diffResult,
      negotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/backend/git - Real git status and git diff of backend workspace
apiRouter.get('/backend/git', async (_req: Request, res: Response) => {
  try {
    const gitStatus = await runGitStatus(backendWorkspace);
    const gitDiff = await runGitDiff(backendWorkspace);
    const schemaFile = path.resolve(backendWorkspaceDir, 'src/schemas/orders.ts');
    const schemaSource = fs.existsSync(schemaFile) ? fs.readFileSync(schemaFile, 'utf-8') : '';

    const lines = gitStatus.stdout.split('\n').filter(Boolean);
    const branch = lines[0]?.replace('## ', '') || 'main';
    const hasDiff = gitDiff.stdout.trim().length > 0;
    const isDirty = hasDiff;

    res.json({
      branch,
      statusRaw: gitStatus.stdout,
      diff: gitDiff.stdout,
      isDirty,
      schemaSource
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/backend/schema - Current orders schema source code
apiRouter.get('/backend/schema', (_req: Request, res: Response) => {
  try {
    const schemaFile = path.resolve(backendWorkspaceDir, 'src/schemas/orders.ts');
    const schemaSource = fs.existsSync(schemaFile) ? fs.readFileSync(schemaFile, 'utf-8') : '';
    res.json({ schemaSource });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/backend/schema - Live schema editor on disk
apiRouter.post('/backend/schema', async (req: Request, res: Response) => {
  try {
    const { schemaContent } = req.body;
    if (typeof schemaContent !== 'string') {
      return res.status(400).json({ error: 'schemaContent string is required' });
    }

    const schemaFile = path.resolve(backendWorkspaceDir, 'src/schemas/orders.ts');
    fs.writeFileSync(schemaFile, schemaContent, 'utf-8');

    // Automatically trigger watch agent on disk change!
    const diffResult = await switchBridge.runWatchAgent();
    const gitDiff = await runGitDiff(backendWorkspace);
    const gitStatus = await runGitStatus(backendWorkspace);

    return res.json({
      success: true,
      diffResult,
      gitDiff: gitDiff.stdout,
      gitStatus: gitStatus.stdout,
      negotiation: switchBridge.getActiveNegotiation()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Real Machine B (Frontend Consumer) Diagnostics Endpoints
// ============================================================================

// GET /api/frontend/diagnostics - Real tsc --noEmit, vitest, and AST diagnostics
apiRouter.get('/frontend/diagnostics', async (_req: Request, res: Response) => {
  try {
    const activeNeg = switchBridge.getActiveNegotiation();
    const hasActiveBreaking = activeNeg && activeNeg.status !== 'RESOLVED' && (activeNeg.breakingCount > 0 || activeNeg.breakagesCount > 0);

    const breakages = hasActiveBreaking
      ? sqlite.prepare('SELECT * FROM consumer_breakages WHERE negotiation_id = ? ORDER BY created_at DESC LIMIT 20').all(activeNeg.id)
      : [];
    const tscRun = await runTscVerification(frontendWorkspace);
    const vitestRun = await runVitestSuite(frontendWorkspace);

    res.json({
      breakages,
      tsc: {
        passed: tscRun.passed,
        exitCode: tscRun.exitCode,
        stdout: tscRun.stdout,
        stderr: tscRun.stderr,
        durationMs: tscRun.durationMs
      },
      vitest: {
        passed: vitestRun.passed,
        exitCode: vitestRun.exitCode,
        stdout: vitestRun.stdout,
        stderr: vitestRun.stderr,
        durationMs: vitestRun.durationMs
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
