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

  let channelId = overrides?.channelId || process.env.SWITCH_CHANNEL_ID || '';
  const teamName = process.env.SWITCH_TEAM_NAME || 'switch';
  const channelName = process.env.SWITCH_CHANNEL_NAME || 'pactroom-api-contracts';

  // Auto-resolve channel: find the latest room matching channelName in team
  try {
    const teamRes = await fetch(`${connectedUrl}/api/v4/teams/name/${teamName}`, {
      headers: { Authorization: `Bearer ${connectedToken}` }
    });
    if (teamRes.ok) {
      const teamData = (await teamRes.json()) as { id?: string };
      if (teamData.id) {
        const channelsRes = await fetch(`${connectedUrl}/api/v4/teams/${teamData.id}/channels`, {
          headers: { Authorization: `Bearer ${connectedToken}` }
        });
        if (channelsRes.ok) {
          const channels = (await channelsRes.json()) as Array<{ id: string; name: string; create_at: number }>;
          const matching = channels
            .filter((c) => c.name.startsWith(channelName) || c.name.startsWith('pactroom-api-contracts'))
            .sort((a, b) => b.create_at - a.create_at);
          if (matching.length > 0) {
            channelId = matching[0].id;
            console.log(`[mattermost-bridge] ✓ Auto-resolved active Switch room '${matching[0].name}' -> ID: ${channelId}`);
          }
        }
      }
    }
  } catch (e: any) {
    console.warn(`[mattermost-bridge] Could not auto-resolve channel ID: ${e.message}`);
  }

  if (!channelId) {
    console.warn('[mattermost-bridge] No SWITCH_CHANNEL_ID set or resolvable. Bridge disabled — messages will only appear in Studio.');
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
  if (!available || !config) return null;

  try {
    const payload: Record<string, string> = {
      channel_id: config.channelId,
      message
    };
    if (threadId) {
      payload.root_id = threadId;
    }

    const res = await fetch(`${config.url}/api/v4/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[mattermost-bridge] Post failed (${res.status}): ${body}`);
      return null;
    }

    const post = (await res.json()) as { id?: string };
    return post.id || null;
  } catch (err: any) {
    console.error(`[mattermost-bridge] Post error: ${err.message}`);
    return null;
  }
}

/**
 * Post a message to the Switch room as a specific bot user (using their token).
 * Falls back to the admin bot token if the agent token is not provided.
 */
export async function postToSwitchRoomAs(
  agentToken: string | undefined,
  message: string,
  threadId?: string
): Promise<string | null> {
  if (!available || !config) return null;

  const token = agentToken || config.token;

  try {
    const payload: Record<string, string> = {
      channel_id: config.channelId,
      message
    };
    if (threadId) {
      payload.root_id = threadId;
    }

    const res = await fetch(`${config.url}/api/v4/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[mattermost-bridge] Post-as failed (${res.status}): ${body}`);
      return null;
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
      if (!res.ok) return;

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

