/**
 * Mattermost Bridge — Posts PactRoom engine results into real Switch rooms
 * via the Mattermost REST API (Switch's messaging transport layer).
 *
 * This bridge is OPTIONAL. If environment variables are not set, it degrades
 * gracefully and logs a warning. The Studio dashboard continues to work via SSE.
 *
 * Environment Variables:
 *   SWITCH_MATTERMOST_URL   — Mattermost base URL (default: http://localhost:49388)
 *   SWITCH_MATTERMOST_TOKEN — Bot access token (auto-discovered or manual)
 *   SWITCH_CHANNEL_ID       — Mattermost channel ID for the pactroom-api-contracts room
 */

import fs from 'node:fs';
import path from 'node:path';

export interface MattermostConfig {
  url: string;
  token: string;
  channelId: string;
}

let config: MattermostConfig | null = null;
let available = false;
let botUserId = '';
let listenerInterval: NodeJS.Timeout | null = null;
const seenPostIds = new Set<string>();

/**
 * Auto-inject an environment variable directly into the local .env file.
 */
function autoInjectEnv(key: string, value: string): void {
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '../../.env'),
      path.resolve(__dirname, '../../../../.env'),
      path.resolve(__dirname, '../../../.env')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(content)) {
          content = content.replace(regex, `${key}=${value}`);
        } else {
          content = content.trimEnd() + `\n${key}=${value}\n`;
        }
        fs.writeFileSync(p, content, 'utf8');
        console.log(`[mattermost-bridge] ⚡ Auto-injected ${key}=${value} into ${p}`);
        break;
      }
    }
  } catch (err: any) {
    // Non-fatal if filesystem is read-only
  }
}

/**
 * Dynamically resolves the latest active non-deleted channel matching pactroom-api-contracts.
 */
export async function resolveActiveChannelId(
  targetUrl?: string,
  targetToken?: string
): Promise<string | null> {
  const url = targetUrl || config?.url || process.env.SWITCH_MATTERMOST_URL || 'http://localhost:60015';
  const token = targetToken || config?.token || process.env.SWITCH_MATTERMOST_TOKEN || 'gtrp6bar1bfgpgt51g6cywybnr';
  const teamName = process.env.SWITCH_TEAM_NAME || 'switch';
  const channelName = process.env.SWITCH_CHANNEL_NAME || 'pactroom-api-contracts';

  try {
    const teamRes = await fetch(`${url}/api/v4/teams/name/${teamName}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!teamRes.ok) return null;
    const teamData = (await teamRes.json()) as { id?: string };
    if (!teamData.id) return null;

    const channelsRes = await fetch(`${url}/api/v4/teams/${teamData.id}/channels`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!channelsRes.ok) return null;

    const channels = (await channelsRes.json()) as Array<{
      id: string;
      name: string;
      display_name?: string;
      create_at: number;
      delete_at?: number;
    }>;

    const matching = channels
      .filter((c) => (!c.delete_at || c.delete_at === 0) && (
        c.name.startsWith(channelName) ||
        c.name.startsWith('pactroom-api-contracts') ||
        (c.display_name && c.display_name.includes('pactroom-api-contracts'))
      ))
      .sort((a, b) => b.create_at - a.create_at);

    if (matching.length > 0) {
      const resolvedId = matching[0].id;
      if (config) {
        config.channelId = resolvedId;
      }
      process.env.SWITCH_CHANNEL_ID = resolvedId;
      autoInjectEnv('SWITCH_CHANNEL_ID', resolvedId);
      console.log(`[mattermost-bridge] ✓ Dynamic Auto-Resolve: Active Switch room '${matching[0].name}' -> ID: ${resolvedId}`);
      return resolvedId;
    }
  } catch (err: any) {
    console.warn(`[mattermost-bridge] Failed to resolve active channel: ${err.message}`);
  }

  return null;
}

/**
 * Initialize the Mattermost bridge with explicit config or environment variables.
 * Automatically resolves the channel ID by team name & channel name if not provided.
 * Returns true if the bridge is ready to post messages.
 */
export async function initMattermostBridge(
  overrides?: Partial<MattermostConfig>
): Promise<boolean> {
  const candidateUrls = [
    overrides?.url,
    process.env.SWITCH_MATTERMOST_URL,
    'http://localhost:60015',
    'http://localhost:49388',
    'http://localhost:8065'
  ].filter((u): u is string => Boolean(u));

  const candidateTokens = [
    overrides?.token,
    process.env.SWITCH_MATTERMOST_TOKEN,
    'gtrp6bar1bfgpgt51g6cywybnr',
    'yo791i4ozpb1by947xiwy5au3w'
  ].filter((t): t is string => Boolean(t));

  let connectedUrl = '';
  let connectedToken = '';

  for (const url of candidateUrls) {
    for (const token of candidateTokens) {
      try {
        const userRes = await fetch(`${url}/api/v4/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const user = (await userRes.json()) as { id?: string; username?: string };
          botUserId = user.id || '';
          connectedUrl = url;
          connectedToken = token;
          console.log(`[mattermost-bridge] ✓ Connected as @${user.username || 'unknown'} (id: ${botUserId}) to ${url}`);
          break;
        }
      } catch {
        // try next combination
      }
    }
    if (connectedUrl) break;
  }

  if (!connectedUrl) {
    console.warn(`[mattermost-bridge] Cannot reach Mattermost at any candidate URL (${candidateUrls.join(', ')}). Bridge disabled.`);
    available = false;
    return false;
  }

  // Auto-resolve latest active non-deleted channel
  let channelId = overrides?.channelId || '';
  const resolved = await resolveActiveChannelId(connectedUrl, connectedToken);
  if (resolved) {
    channelId = resolved;
  } else if (process.env.SWITCH_CHANNEL_ID) {
    channelId = process.env.SWITCH_CHANNEL_ID;
  }

  if (!channelId) {
    console.warn('[mattermost-bridge] No active SWITCH_CHANNEL_ID found. Bridge standing by — messages will appear in Studio.');
    available = false;
    return false;
  }

  config = { url: connectedUrl, token: connectedToken, channelId };
  available = true;
  console.log(`[mattermost-bridge] ✓ Bridge ACTIVE — posting to channel ${channelId}`);
  return true;
}

/**
 * Post a message to the Switch room via Mattermost.
 * Silently no-ops if the bridge is not configured.
 */
export async function postToSwitchRoom(
  message: string,
  threadId?: string
): Promise<string | null> {
  return postToSwitchRoomAs(undefined, message, threadId);
}

/**
 * Post a message to the Switch room as a specific bot user (using their token).
 * Falls back to the admin bot token if the agent token is not provided.
 * Automatically auto-heals if the target channel was deleted or refreshed.
 */
export async function postToSwitchRoomAs(
  agentToken: string | undefined,
  message: string,
  threadId?: string
): Promise<string | null> {
  if (!available || !config) {
    // Attempt dynamic connection if called while server running
    const ok = await initMattermostBridge();
    if (!ok || !config) return null;
  }

  const token = agentToken || config.token;

  try {
    const payload: Record<string, string> = {
      channel_id: config.channelId,
      message
    };
    if (threadId) {
      payload.root_id = threadId;
    }

    let res = await fetch(`${config.url}/api/v4/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errBody = await res.text();
      // Auto-heal if channel was deleted (400) or missing (404)
      if (res.status === 400 || res.status === 404) {
        console.warn(`[mattermost-bridge] Post error (${res.status}: ${errBody.slice(0, 80)}...). Auto-resolving active channel...`);
        const freshChannelId = await resolveActiveChannelId(config.url, config.token);
        if (freshChannelId && freshChannelId !== config.channelId) {
          config.channelId = freshChannelId;
          payload.channel_id = freshChannelId;
          console.log(`[mattermost-bridge] 🔄 Auto-healing: retrying post to active channel ${freshChannelId}`);
          res = await fetch(`${config.url}/api/v4/posts`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        }
      }

      if (!res.ok) {
        const finalBody = await res.text();
        console.error(`[mattermost-bridge] Post-as failed (${res.status}): ${finalBody}`);
        return null;
      }
    }

    const post = (await res.json()) as { id?: string };
    return post.id || null;
  } catch (err: any) {
    console.error(`[mattermost-bridge] Post-as error: ${err.message}`);
    return null;
  }
}

/**
 * Check if the Mattermost bridge is active and ready to post.
 */
export function isBridgeAvailable(): boolean {
  return available;
}

/**
 * Get the current bridge config (for diagnostics).
 */
export function getBridgeConfig(): { url: string; channelId: string; available: boolean } | null {
  if (!config) return null;
  return { url: config.url, channelId: config.channelId, available };
}

/**
 * Start listening for incoming human messages and approvals in the Switch channel.
 * Forwards user messages to the callback so the Human Approval Gate and commands trigger.
 */
export function startMattermostListener(
  onMessage: (content: string, senderName: string, senderId: string) => void | Promise<void>
): void {
  if (!available || !config || listenerInterval) return;

  // Pre-populate seenPostIds with existing posts so we don't replay history on startup
  fetch(`${config.url}/api/v4/channels/${config.channelId}/posts?per_page=10`, {
    headers: { Authorization: `Bearer ${config.token}` }
  })
    .then(async (res) => {
      if (res.ok) {
        const data = (await res.json()) as { order?: string[] };
        data.order?.forEach((id) => seenPostIds.add(id));
      }
    })
    .catch(() => {});

  let lastCheckTime = Date.now();

  listenerInterval = setInterval(async () => {
    if (!config || !available) return;
    try {
      const res = await fetch(`${config.url}/api/v4/channels/${config.channelId}/posts?since=${lastCheckTime - 3000}`, {
        headers: { Authorization: `Bearer ${config.token}` }
      });
      if (!res.ok) {
        if (res.status === 400 || res.status === 404) {
          const freshId = await resolveActiveChannelId(config.url, config.token);
          if (freshId && freshId !== config.channelId) {
            config.channelId = freshId;
          }
        }
        return;
      }

      const data = (await res.json()) as { order?: string[]; posts?: Record<string, any> };
      if (!data.order || !data.posts) return;

      lastCheckTime = Date.now();

      for (const postId of data.order.slice().reverse()) {
        if (seenPostIds.has(postId)) continue;
        seenPostIds.add(postId);

        if (seenPostIds.size > 2000) {
          const first = seenPostIds.values().next().value;
          if (first) seenPostIds.delete(first);
        }

        const post = data.posts[postId];
        if (!post) continue;

        // Skip messages from the bot itself or other automated agents
        if (post.user_id === botUserId || post.props?.from_bot === 'true' || post.props?.from_bot === true) continue;

        const msg = (post.message || '').trim();
        if (!msg) continue;

        // Forward message to Switch Bridge
        try {
          await onMessage(msg, post.props?.override_username || 'Developer', post.user_id);
        } catch (err: any) {
          console.error('[mattermost-bridge] Message dispatch error:', err.message);
        }
      }
    } catch {
      // transient network error, retry next interval
    }
  }, 2000);

  console.log('[mattermost-bridge] ✓ Two-way room listener ACTIVE — listening for approvals and commands in Switch room');
}

export function stopMattermostListener(): void {
  if (listenerInterval) {
    clearInterval(listenerInterval);
    listenerInterval = null;
  }
}

