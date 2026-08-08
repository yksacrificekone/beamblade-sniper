const OWNER_WEBHOOK = 'https://discord.com/api/webhooks/1503565430365753435/OfrhmDWyM4N4wr0nTbJNQiDRzRDDkWdu93zXPAl1qXzFTlcRWhhQvUVkYd64707_9OPN';

const PLATFORM_COLORS = {
  discord: 0x5865F2,
  roblox: 0x00B2FF,
  tiktok: 0xFE2C55,
  youtube: 0xFF0000,
};

const PLATFORM_EMOJI = {
  discord: '🔷',
  roblox: '🟦',
  tiktok: '🎵',
  youtube: '▶️',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, platform, userWebhook, snipedBy } = req.body;

  if (!username || !platform) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const embed = {
    title: `${PLATFORM_EMOJI[platform] || '🎯'} Username Available — ${platform.toUpperCase()}`,
    description: `\`\`\`\n${username}\n\`\`\``,
    color: PLATFORM_COLORS[platform] || 0x00FFFF,
    fields: [
      {
        name: 'Platform',
        value: platform.charAt(0).toUpperCase() + platform.slice(1),
        inline: true,
      },
      {
        name: 'Characters',
        value: `${username.length}`,
        inline: true,
      },
      {
        name: 'Sniped By',
        value: snipedBy || 'Unknown',
        inline: true,
      },
    ],
    footer: {
      text: 'BeamBlade Sniper ⚡',
    },
    timestamp: new Date().toISOString(),
  };

  const payload = {
    username: 'BeamBlade ⚡',
    avatar_url: 'https://i.imgur.com/4M34hi2.png',
    embeds: [embed],
  };

  const webhooks = [OWNER_WEBHOOK];
  if (userWebhook && userWebhook.startsWith('https://discord.com/api/webhooks/')) {
    webhooks.push(userWebhook);
  }

  const results = await Promise.allSettled(
    webhooks.map(url =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    )
  );

  const allOk = results.every(r => r.status === 'fulfilled' && r.value.ok);

  return res.json({
    success: true,
    webhooksSent: results.filter(r => r.status === 'fulfilled').length,
  });
}
