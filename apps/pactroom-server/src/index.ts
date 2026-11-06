import { createServerApp } from './app.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { switchBridge } from './protocol/switch-bridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');
const backendWorkspace = process.env.BACKEND_WORKSPACE || 'workspaces/backend-api';
const backendWorkspaceDir = path.isAbsolute(backendWorkspace)
  ? backendWorkspace
  : path.resolve(rootDir, backendWorkspace);
const backendSchemasDir = path.resolve(backendWorkspaceDir, 'src/schemas');

const PORT = process.env.PACTROOM_SERVER_PORT
  ? parseInt(process.env.PACTROOM_SERVER_PORT, 10)
  : 3002;
const app = createServerApp();

app.listen(PORT, () => {
  console.log(`[pactroom-server] Engine & Switch Protocol Bridge running on http://localhost:${PORT}`);
  console.log(`[pactroom-server] SSE Live Event Stream: http://localhost:${PORT}/api/events`);

  // Active filesystem watcher on Machine A (workspaces/backend-api/src/schemas)
  if (fs.existsSync(backendSchemasDir)) {
    let debounceTimer: NodeJS.Timeout | null = null;
    let isProcessing = false;

    fs.watch(backendSchemasDir, (_eventType, filename) => {
      if (!filename || (!filename.endsWith('.ts') && !filename.endsWith('.json'))) return;
      if (isProcessing) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        isProcessing = true;
        console.log(`[pactroom-watcher] Real disk edit detected in ${filename}. Invoking @watch agent...`);
        try {
          await switchBridge.runWatchAgent();
        } catch (err) {
          console.error('[pactroom-watcher] Error in automatic watch execution:', err);
        } finally {
          isProcessing = false;
        }
      }, 600);
    });

    console.log(`[pactroom-watcher] Actively watching for real file edits in: ${backendSchemasDir}`);
  }
});


