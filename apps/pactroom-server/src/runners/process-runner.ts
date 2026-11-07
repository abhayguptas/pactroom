import { spawn } from 'child_process';
import path from 'path';
import { db } from '../db/database.js';
import { sseManager } from '../events/sse-manager.js';

export interface ProcessRunResult {
  id: string;
  tool: 'tsc' | 'vitest' | 'git' | 'node';
  workspace: string;
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  passed: boolean;
  durationMs: number;
}

export async function executeChildProcess(
  tool: 'tsc' | 'vitest' | 'git' | 'node',
  workspaceRelativePath: string,
  command: string,
  args: string[],
  negotiationId?: string
): Promise<ProcessRunResult> {
  const rootDir = process.cwd();
  // Ensure we resolve workspace correctly whether it's absolute (from env var) or relative
  let cwd: string;
  if (path.isAbsolute(workspaceRelativePath)) {
    cwd = workspaceRelativePath;
  } else if (rootDir.endsWith('pactroom-server') || rootDir.endsWith('apps')) {
    cwd = path.resolve(rootDir, '../../', workspaceRelativePath);
  } else {
    cwd = path.resolve(rootDir, workspaceRelativePath);
  }

  const startTime = Date.now();
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  sseManager.broadcast('terminal_output', {
    tool,
    workspace: workspaceRelativePath,
    text: `\n$ [${workspaceRelativePath}] ${command} ${args.join(' ')}\n`,
    stream: 'info'
  });

  return new Promise((resolve) => {
    let stdoutAcc = '';
    let stderrAcc = '';

    const child = spawn(command, args, {
      cwd,
      shell: true,
      env: {
        ...process.env,
        CI: 'true',
        FORCE_COLOR: '0',
        NODE_ENV: 'test'
      }
    });

    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stdoutAcc += text;
      sseManager.broadcast('terminal_output', {
        tool,
        workspace: workspaceRelativePath,
        text,
        stream: 'stdout'
      });
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderrAcc += text;
      sseManager.broadcast('terminal_output', {
        tool,
        workspace: workspaceRelativePath,
        text,
        stream: 'stderr'
      });
    });

    child.on('close', (code) => {
      const durationMs = Date.now() - startTime;
      const exitCode = code ?? 0;
      const passed = exitCode === 0;

      // Persist in SQLite
      try {
        const stmt = db.prepare(`
          INSERT INTO verification_runs (
            id, negotiation_id, workspace, tool, command, exit_code, stdout, stderr, passed, duration_ms
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          runId,
          negotiationId || null,
          workspaceRelativePath,
          tool,
          `${command} ${args.join(' ')}`,
          exitCode,
          stdoutAcc,
          stderrAcc,
          passed ? 1 : 0,
          durationMs
        );
      } catch (err) {
        console.error('Failed to log verification run to SQLite:', err);
      }

      sseManager.broadcast('verification_step', {
        runId,
        tool,
        workspace: workspaceRelativePath,
        passed,
        durationMs,
        exitCode
      });

      resolve({
        id: runId,
        tool,
        workspace: workspaceRelativePath,
        command: `${command} ${args.join(' ')}`,
        exitCode,
        stdout: stdoutAcc,
        stderr: stderrAcc,
        passed,
        durationMs
      });
    });

    child.on('error', (err) => {
      const durationMs = Date.now() - startTime;
      const errorText = `Failed to spawn process: ${err.message}\n`;
      stderrAcc += errorText;

      sseManager.broadcast('terminal_output', {
        tool,
        workspace: workspaceRelativePath,
        text: errorText,
        stream: 'stderr'
      });

      resolve({
        id: runId,
        tool,
        workspace: workspaceRelativePath,
        command: `${command} ${args.join(' ')}`,
        exitCode: 1,
        stdout: stdoutAcc,
        stderr: stderrAcc,
        passed: false,
        durationMs
      });
    });
  });
}

/**
 * Execute real `tsc --noEmit` on given workspace
 */
export async function runTscVerification(
  workspace: string,
  negotiationId?: string
): Promise<ProcessRunResult> {
  return executeChildProcess('tsc', workspace, 'npx', ['tsc', '--noEmit'], negotiationId);
}

/**
 * Execute real `vitest run` on given workspace
 */
export async function runVitestSuite(
  workspace: string,
  negotiationId?: string
): Promise<ProcessRunResult> {
  return executeChildProcess('vitest', workspace, 'npx', ['vitest', 'run'], negotiationId);
}

/**
 * Execute real `git diff` on given workspace
 */
export async function runGitDiff(
  workspace: string,
  targetRef?: string
): Promise<ProcessRunResult> {
  const args = targetRef ? ['diff', targetRef, '--', '.'] : ['diff', '--', '.'];
  return executeChildProcess('git', workspace, 'git', args);
}

/**
 * Execute real `git status --porcelain` on given workspace scoped to directory
 */
export async function runGitStatus(workspace: string): Promise<ProcessRunResult> {
  return executeChildProcess('git', workspace, 'git', ['status', '--porcelain', '-b', '.']);
}

