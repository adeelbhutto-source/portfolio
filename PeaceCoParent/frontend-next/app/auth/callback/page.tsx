'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function AuthCallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const at = params.get('at');
    const rt = params.get('rt');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(`Google sign-in returned an error: ${errorParam}`);
      return;
    }
    if (!at || !rt) {
      setError('Sign-in tokens were missing. Please try signing in with Google again.');
      return;
    }

    window.history.replaceState({}, document.title, '/auth/callback');

    loginWithTokens(at, rt)
      .then(() => router.replace('/dashboard'))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to complete sign-in. Please try again.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', padding: 24 }}>
        <div style={{ background: 'var(--card)', borderRadius: 22, padding: 40, maxWidth: 440, textAlign: 'center', border: '1px solid var(--border)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'oklch(95% 0.04 25)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="oklch(50% 0.18 25)" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)', margin: '0 0 12px' }}>
            Sign-in failed
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 24px' }}>
            {error}
          </p>
          <Link href="/login" className="pcp-btn-primary" style={{ display: 'inline-block', borderRadius: 999, padding: '11px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
        <div style={{ fontSize: 14 }}>Signing you in…</div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
        <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Signing you in…</div>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
