export default async function handler(req, res) {
  const { username } = req.query;

  if (!username || username.length < 2 || username.length > 24) {
    return res.status(400).json({ available: false, error: 'Invalid length' });
  }

  const valid = /^[a-zA-Z0-9_.]{2,24}$/.test(username);
  if (!valid) {
    return res.status(400).json({ available: false, error: 'Invalid chars' });
  }

  try {
    // Check TikTok profile page - if 404, username is available
    const response = await fetch(
      `https://www.tiktok.com/@${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      }
    );

    // If profile page returns 200, username is taken
    // If 404, it's available
    const available = response.status === 404 || response.status === 400;

    return res.json({ available, username, status: response.status });
  } catch (err) {
    // If fetch fails, we can't determine - mark as uncertain
    return res.status(500).json({ available: false, error: err.message });
  }
}
