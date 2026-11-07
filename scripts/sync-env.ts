import fs from 'node:fs';
import path from 'node:path';

async function main() {
  console.log('⚡ [PactRoom] Scanning Switch / Mattermost for active room & bot credentials...');

  const envPath = path.resolve(process.cwd(), '.env');
  const mmUrl = process.env.SWITCH_MATTERMOST_URL || 'http://localhost:60015';
  const adminToken = process.env.SWITCH_MATTERMOST_TOKEN || 'gtrp6bar1bfgpgt51g6cywybnr';
  const teamName = process.env.SWITCH_TEAM_NAME || 'switch';
  const channelPrefix = process.env.SWITCH_CHANNEL_NAME || 'pactroom-api-contracts';

  // 1. Fetch team
  const teamRes = await fetch(`${mmUrl}/api/v4/teams/name/${teamName}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (!teamRes.ok) {
    console.error(`❌ Could not connect to Mattermost team '${teamName}' at ${mmUrl}`);
    process.exit(1);
  }
  const team = (await teamRes.json()) as { id: string; name: string };

  // 2. Fetch active channels
  const channelsRes = await fetch(`${mmUrl}/api/v4/teams/${team.id}/channels`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (!channelsRes.ok) {
    console.error(`❌ Could not fetch channels from team ${team.name}`);
    process.exit(1);
  }
  const channels = (await channelsRes.json()) as Array<{
    id: string;
    name: string;
    display_name: string;
    create_at: number;
    delete_at?: number;
  }>;

  const activeChannels = channels
    .filter((c) => (!c.delete_at || c.delete_at === 0) && (
      c.name.startsWith(channelPrefix) ||
      c.name.startsWith('pactroom-api-contracts') ||
      c.display_name.includes('pactroom-api-contracts')
    ))
    .sort((a, b) => b.create_at - a.create_at);

  if (activeChannels.length === 0) {
    console.warn(`⚠ No active '${channelPrefix}' channel found in Mattermost.`);
    console.warn(`   Tip: In Switch Console, import pactroom.template.yaml first!`);
    process.exit(1);
  }

  const activeRoom = activeChannels[0];
  console.log(`✓ Active Switch Room detected: '${activeRoom.display_name}' (${activeRoom.name})`);
  console.log(`   ID: ${activeRoom.id}`);

  // 3. Update .env
  if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');

    const updateOrAdd = (key: string, val: string) => {
      const reg = new RegExp(`^${key}=.*$`, 'm');
      if (reg.test(content)) {
        content = content.replace(reg, `${key}=${val}`);
      } else {
        content = content.trimEnd() + `\n${key}=${val}\n`;
      }
    };

    updateOrAdd('SWITCH_CHANNEL_ID', activeRoom.id);
    updateOrAdd('SWITCH_CHANNEL_NAME', activeRoom.name);

    fs.writeFileSync(envPath, content, 'utf8');
    console.log(`✓ Successfully injected SWITCH_CHANNEL_ID=${activeRoom.id} into .env!`);
  } else {
    console.warn(`⚠ .env not found at ${envPath}`);
  }

  console.log(`\n🎉 Environment synchronized! Ready for demo video.`);
}

main().catch((e) => {
  console.error(`❌ Sync error:`, e.message);
  process.exit(1);
});
