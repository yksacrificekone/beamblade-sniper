export default async function handler(req, res) {
  const { username } = req.query;

  if (!username || username.length < 3 || username.length > 20) {
    return res.status(400).json({ available: false, error: 'Invalid length' });
  }

  // Roblox: letters, numbers, underscores; cannot start/end with underscore
  const valid = /^(?!_)[a-zA-Z0-9_]{3,20}(?<!_)$/.test(username);
  if (!valid) {
    return res.status(400).json({ available: false, error: 'Invalid format' });
  }

  try {
    // Method 1: validate endpoint (checks format + availability)
    const validateRes = await fetch(
      'https://auth.roblox.com/v1/usernames/validate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin': 'https://www.roblox.com',
          'Referer': 'https://www.roblox.com/',
        },
        body: JSON.stringify({
          username: username,
          birthday: '2000-01-01T00:00:00.000Z',
          context: 'Signup',
        }),
      }
    );

    if (validateRes.status === 429) {
      return res.status(429).json({ available: false, error: 'rate_limited', retryAfter: 2 });
    }

    if (!validateRes.ok) {
      // Fallback: try users search endpoint
      const searchRes = await fetch(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
          }
        }
      );
      const searchData = await searchRes.json();
      const exactMatch = searchData?.data?.some(
        u => u.name.toLowerCase() === username.toLowerCase()
      );
      return res.json({ available: !exactMatch, username });
    }

    const data = await validateRes.json();
    // code 0 = Username is valid and available
    // code 1 = Username already taken
    // code 2 = Invalid username (inappropriate, etc.)
    // code 3 = Username too short
    // code 10 = Username moderated
    const available = data.code === 0;

    return res.json({
      available,
      username,
      code: data.code,
      message: data.message,
    });
  } catch (err) {
    return res.status(500).json({ available: false, error: err.message });
  }
}
