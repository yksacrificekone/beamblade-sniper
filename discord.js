export default async function handler(req, res) {
  const { username } = req.query;

  if (!username || username.length < 2 || username.length > 32) {
    return res.status(400).json({ available: false, error: 'Invalid length' });
  }

  // Discord username validation: lowercase letters, numbers, underscores, periods
  const valid = /^[a-z0-9_.]{2,32}$/.test(username);
  if (!valid) {
    return res.status(400).json({ available: false, error: 'Invalid chars' });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v9/unique-username/check-username-availability?username=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://discord.com',
          'Referer': 'https://discord.com/',
        },
      }
    );

    if (response.status === 429) {
      // Rate limited
      const retryAfter = response.headers.get('Retry-After') || 1;
      return res.status(429).json({ available: false, error: 'rate_limited', retryAfter: parseFloat(retryAfter) });
    }

    if (!response.ok) {
      return res.status(response.status).json({ available: false, error: `Discord API error: ${response.status}` });
    }

    const data = await response.json();
    return res.json({
      available: data.taken === false,
      username,
    });
  } catch (err) {
    return res.status(500).json({ available: false, error: err.message });
  }
}
