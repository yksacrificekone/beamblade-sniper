import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function hashPassword(password) {
  // Simple client-side hash (djb2) - good enough for local-only auth
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('bb_session');
    if (session) router.replace('/dashboard');
  }, []);

  const handleSubmit = () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('All fields required.');
      return;
    }
    setLoading(true);

    const key = `bb_user_${username.toLowerCase()}`;
    const hashed = hashPassword(password);

    setTimeout(() => {
      if (mode === 'signup') {
        const existing = localStorage.getItem(key);
        if (existing) {
          setError('Username already taken.');
          setLoading(false);
          return;
        }
        localStorage.setItem(key, JSON.stringify({ username, passwordHash: hashed }));
        localStorage.setItem('bb_session', username);
        router.push('/dashboard');
      } else {
        const stored = localStorage.getItem(key);
        if (!stored) {
          setError('User not found.');
          setLoading(false);
          return;
        }
        const parsed = JSON.parse(stored);
        if (parsed.passwordHash !== hashed) {
          setError('Wrong password.');
          setLoading(false);
          return;
        }
        localStorage.setItem('bb_session', username);
        router.push('/dashboard');
      }
    }, 400);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <>
      <Head>
        <title>BeamBlade Sniper — Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='26' font-size='26'>⚡</text></svg>" />
      </Head>

      <div className="bg-mesh min-h-screen flex flex-col items-center justify-center px-4 relative">
        {/* Ambient orbs */}
        <div style={{
          position: 'fixed', top: '-15%', left: '-10%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed', bottom: '-20%', right: '-10%',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div className="mb-8 text-center fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div style={{
              width: 42, height: 42,
              background: 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(0,255,255,0.3)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 0 20px rgba(0,255,255,0.1)',
            }}>⚡</div>
            <div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 22,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00FFFF, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}>BEAMBLADE</div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                color: 'rgba(0,255,255,0.5)',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                marginTop: -2,
              }}>USERNAME SNIPER</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="glass fade-in-up" style={{
          width: '100%',
          maxWidth: 420,
          padding: '36px 32px',
          border: '1px solid rgba(255,255,255,0.07)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Scanline effect */}
          <div className="scanline" />

          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            padding: 3,
            marginBottom: 28,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 6,
                  border: 'none',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: mode === m
                    ? 'linear-gradient(135deg, rgba(0,255,255,0.12), rgba(139,92,246,0.12))'
                    : 'transparent',
                  color: mode === m ? '#00FFFF' : 'rgba(255,255,255,0.3)',
                  boxShadow: mode === m ? '0 0 10px rgba(0,255,255,0.05)' : 'none',
                }}
              >
                {m === 'login' ? '→ Login' : '+ Sign Up'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                color: 'rgba(0,255,255,0.5)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}>Username</label>
              <input
                className="input-glass"
                type="text"
                placeholder="your_handle"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={handleKey}
                autoComplete="username"
              />
            </div>

            <div>
              <label style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                color: 'rgba(0,255,255,0.5)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}>Password</label>
              <input
                className="input-glass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKey}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: '#ef4444',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 6,
                padding: '8px 12px',
              }}>⚠ {error}</div>
            )}

            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '12px 0',
                borderRadius: 8,
                fontSize: 13,
                marginTop: 4,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : mode === 'login' ? '→ ENTER BEAM' : '+ CREATE ACCOUNT'}
            </button>
          </div>

          <div style={{
            marginTop: 20,
            textAlign: 'center',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.05em',
          }}>
            Sessions persist locally on this device.
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 24,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.1)',
          letterSpacing: '0.1em',
        }}>BEAMBLADE v1.0 — FOR AUTHORIZED USE</div>
      </div>
    </>
  );
}
