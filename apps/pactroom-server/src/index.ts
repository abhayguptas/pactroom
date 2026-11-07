import { createServerApp } from './app.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { switchBridge } from './protocol/switch-bridge.js';
import { initMattermostBridge, startMattermostListener } from './protocol/mattermost-bridge.js';

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

app.listen(PORT, async () => {
  console.log(`[pactroom-server] Engine & Switch Protocol Bridge running on http://localhost:${PORT}`);
  console.log(`[pactroom-server] SSE Live Event Stream: http://localhost:${PORT}/api/events`);

  // Initialize Mattermost bridge to post engine results into real Switch rooms
  const bridgeReady = await initMattermostBridge();
  if (bridgeReady) {
    console.log('[pactroom-server] ✓ Mattermost bridge ACTIVE — engine results will appear in Switch rooms');
    startMattermostListener((content, senderName, senderId) => {
      switchBridge.handleRoomMessage(content, senderName, senderId);
    });
  } else {
    console.log('[pactroom-server] ⚠ Mattermost bridge not configured — set SWITCH_MATTERMOST_TOKEN and SWITCH_CHANNEL_ID to enable');
  }

  // Ensure workspaces and database start in a clean baseline state
  try {
    await switchBridge.resetAllWorkspacesToBaseline();
    console.log('[pactroom-server] Baseline workspaces initialized cleanly.');
  } catch (err) {
    console.error('[pactroom-server] Baseline init note:', err);
  }

  // Filesystem watcher on Machine A: active by default, disable with ENABLE_FS_WATCHER=false
  const watcherEnabled = process.env.ENABLE_FS_WATCHER !== 'false';
  if (watcherEnabled && fs.existsSync(backendSchemasDir)) {
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

    console.log(`[pactroom-watcher] ✓ Actively watching for real file edits in: ${backendSchemasDir}`);
  } else if (!watcherEnabled) {
    console.log('[pactroom-watcher] File watcher disabled via ENABLE_FS_WATCHER=false');
  }
});


