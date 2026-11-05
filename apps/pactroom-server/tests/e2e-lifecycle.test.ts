import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sqlite } from '../src/db/database.js';
import { switchBridge } from '../src/protocol/switch-bridge.js';
import {
  runGitStatus,
  runGitDiff,
  runTscVerification,
  runVitestSuite,
  executeChildProcess
} from '../src/runners/process-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');
const backendWorkspace = path.resolve(rootDir, 'workspaces/backend-api');
const frontendWorkspace = path.resolve(rootDir, 'workspaces/frontend-consumer');

describe('PactRoom Monorepo Full E2E Lifecycle & Validation Suite', { timeout: 30000 }, () => {
  beforeAll(async () => {
    // Ensure clean baseline before test run starts
    await switchBridge.resetAllWorkspacesToBaseline();
  });

  afterAll(async () => {
    // Restore clean baseline after test run finishes
    await switchBridge.resetAllWorkspacesToBaseline();
  });

  it('Step 1: Clean Baseline Verification — tsc and vitest pass 100% with 0 breaking changes', async () => {
    // Check Machine A Backend
    const backendTsc = await runTscVerification('workspaces/backend-api');
    expect(backendTsc.passed).toBe(true);
    expect(backendTsc.exitCode).toBe(0);

    const backendVitest = await runVitestSuite('workspaces/backend-api');
    expect(backendVitest.passed).toBe(true);
    expect(backendVitest.exitCode).toBe(0);

    // Check Machine B Frontend
    const frontendTsc = await runTscVerification('workspaces/frontend-consumer');
    expect(frontendTsc.passed).toBe(true);
    expect(frontendTsc.exitCode).toBe(0);

    const frontendVitest = await runVitestSuite('workspaces/frontend-consumer');
    expect(frontendVitest.passed).toBe(true);
    expect(frontendVitest.exitCode).toBe(0);

    // Run watch agent: should confirm 0 breaking changes
    const diffResult = await switchBridge.runWatchAgent();
    expect(diffResult.hasBreakingChanges).toBe(false);
    expect(diffResult.breakingCount).toBe(0);
  });

  it('Step 2: Real Uncommitted Disk Mutation on Machine A — Git working tree becomes DIRTY', async () => {
    // Run mutate-breaking script on workspaces/backend-api
    const mutateRun = await executeChildProcess(
      'node',
      'workspaces/backend-api',
      'npx',
      ['tsx', 'scripts/mutate-breaking.ts']
    );
    expect(mutateRun.passed).toBe(true);

    // Verify git working tree is dirty on disk
    const gitStatus = await runGitStatus('workspaces/backend-api');
    expect(gitStatus.stdout).toMatch(/(M | M |\?\?)/);

    const gitDiff = await runGitDiff('workspaces/backend-api');
    expect(gitDiff.stdout).toContain('pricing_breakdown');
    expect(gitDiff.stdout).toContain('-'); // Removals present in diff
  });

  it('Step 3: @pact-watch AST Diffing Engine detects breaking changes without commit or push', async () => {
    const diffResult = await switchBridge.runWatchAgent();

    // Must detect breaking changes
    expect(diffResult.hasBreakingChanges).toBe(true);
    expect(diffResult.breakingCount).toBeGreaterThan(0);

    // Must isolate removed/renamed total_amount_cents with RFC 6901 pointer
    const breakingTotal = diffResult.changes.find(
      (c) => (c.fieldPath.includes('total_amount_cents') || c.impactSummary.includes('total_amount_cents')) && c.isBreaking
    );
    expect(breakingTotal).toBeDefined();
    expect(breakingTotal?.isBreaking).toBe(true);
    expect(breakingTotal?.jsonPointer).toBeDefined();

    // Negotiation state updated in memory and DB
    const activeNeg = switchBridge.getActiveNegotiation();
    expect(activeNeg?.status).toBe('AWAITING_HUMAN_DECISION'); // verify & sync were triggered
    expect(activeNeg?.breakingCount).toBe(diffResult.breakingCount);
  });

  it('Step 4: @pact-verify Cross-Machine Verification captures real TS2339 failure in SQLite', async () => {
    // Run verify agent directly
    const verifyResult = await switchBridge.runVerifyAgent();
    expect(verifyResult.passed).toBe(false);
    expect(verifyResult.breakagesCount).toBeGreaterThan(0);

    // Query SQLite consumer_breakages table
    const breakages = sqlite
      .prepare(
        'SELECT * FROM consumer_breakages WHERE workspace = ? AND error_code LIKE ?'
      )
      .all('workspaces/frontend-consumer', '%2339%') as any[];

    expect(breakages.length).toBeGreaterThan(0);
    const primaryBreakage = breakages[0];

    expect(primaryBreakage.error_code).toContain('2339');
    expect(primaryBreakage.code_snippet).toBeDefined();
  });

  it('Step 5: Human Gate Enforcement — auto_approve: false prevents unapproved disk writes', async () => {
    const activeNeg = switchBridge.getActiveNegotiation();
    expect(activeNeg?.status).toBe('AWAITING_HUMAN_DECISION');

    // Confirm that frontend has not yet been modified prior to human approval
    const frontendOrdersFile = path.resolve(frontendWorkspace, 'src/schemas/orders.ts');
    const content = fs.readFileSync(frontendOrdersFile, 'utf-8');
    // Prior to Option B, total_amount_cents is still non-optional
    expect(content).toContain('total_amount_cents: z.number().int().nonnegative');
  });

  it('Step 6: Mutual Human Approval of Option B — Auto-Patch executes and tsc/vitest pass 100%', async () => {
    // Approve Option B (Synchronized Frontend Migration)
    const patchResult = await switchBridge.resolveNegotiation(
      'OPTION_B',
      'backend-lead-alex',
      'frontend-lead-sam'
    );

    expect(patchResult.success).toBe(true);
    expect(patchResult.decisionType).toBe('OPTION_B');
    expect(patchResult.schemaVersion).toBe('v2.0.0-synchronized');
    expect(patchResult.verificationPassed).toBe(true);

    // Verify Frontend Consumer passes tsc --noEmit with 0 errors
    const frontendTsc = await runTscVerification('workspaces/frontend-consumer');
    expect(frontendTsc.passed).toBe(true);
    expect(frontendTsc.exitCode).toBe(0);

    // Verify Frontend Consumer Vitest passes 100%
    const frontendVitest = await runVitestSuite('workspaces/frontend-consumer');
    expect(frontendVitest.passed).toBe(true);
    expect(frontendVitest.exitCode).toBe(0);

    // Verify Backend Microservice Vitest passes 100%
    const backendVitest = await runVitestSuite('workspaces/backend-api');
    expect(backendVitest.passed).toBe(true);
    expect(backendVitest.exitCode).toBe(0);

    // Verify SQLite room_decisions recorded binding record
    const decision = sqlite
      .prepare('SELECT * FROM room_decisions WHERE id = ?')
      .get(patchResult.decisionId) as any;

    expect(decision).toBeDefined();
    expect(decision.decision_type).toBe('OPTION_B');
    expect(decision.schema_version).toBe('v2.0.0-synchronized');
    const backendApprover = decision.approved_by_backend_human || decision.approved_by_backend;
    const frontendApprover = decision.approved_by_frontend_human || decision.approved_by_frontend;
    expect(backendApprover).toBe('backend-lead-alex');
    expect(frontendApprover).toBe('frontend-lead-sam');

    // Verify SQLite agent_execution_logs recorded successful patch execution
    const logs = sqlite
      .prepare('SELECT * FROM agent_execution_logs WHERE agent_role = ? ORDER BY timestamp DESC LIMIT 1')
      .get('sync') as any;

    expect(logs).toBeDefined();
    expect(logs.exit_code).toBe(0);
    expect(logs.git_diff_output).toBeDefined();
  });

  it('Step 7: Reset Baseline & Restoration — Workspaces return to clean baseline state', async () => {
    const resetOk = await switchBridge.resetAllWorkspacesToBaseline();
    expect(resetOk).toBe(true);

    // Confirm watch agent returns clean 0 breaking changes
    const diffResult = await switchBridge.runWatchAgent();
    expect(diffResult.hasBreakingChanges).toBe(false);
    expect(diffResult.breakingCount).toBe(0);

    // Re-verify tsc --noEmit passes on both workspaces
    const bTsc = await runTscVerification('workspaces/backend-api');
    expect(bTsc.passed).toBe(true);

    const fTsc = await runTscVerification('workspaces/frontend-consumer');
    expect(fTsc.passed).toBe(true);
  });
});
