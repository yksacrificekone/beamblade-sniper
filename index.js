import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('bb_session');
    if (session) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, []);

  return (
    <div className="bg-mesh flex items-center justify-center min-h-screen">
      <div className="text-white/20 font-mono text-sm">Loading BeamBlade...</div>
    </div>
  );
}
