export default async function handler(req, res) {
  const { username } = req.query;

  if (!username || username.length < 3 || username.length > 30) {
    return res.status(400).json({ available: false, error: 'Invalid length' });
  }

  // YouTube handles: letters, numbers, hyphens, underscores, periods
  const valid = /^[a-zA-Z0-9\-_.]{3,30}$/.test(username);
  if (!valid) {
    return res.status(400).json({ available: false, error: 'Invalid chars' });
  }

  try {
    // Check YouTube @handle page
    const response = await fetch(
      `https://www.youtube.com/@${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      }
    );

    // 404 = available, 200 = taken
    const available = response.status === 404;

    return res.json({ available, username, status: response.status });
  } catch (err) {
    return res.status(500).json({ available: false, error: err.message });
  }
}
