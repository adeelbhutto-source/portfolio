'use client';
import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/env';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5 6 11l5.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const justReset = params.get('reset') === '1';
  const pendingCode = params.get('code') ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push(pendingCode ? `/setup?code=${pendingCode}` : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const features = [
    'message coach — review before send',
    'Shared calendar with conflict warnings',
    'Court-ready records, always ready',
    '$14/month covers both parents',
  ];

  return (
    <div className="pcp-auth-page" style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--sans)', color: 'var(--ink)' }}>
      {/* LEFT — dark pitch */}
      <div style={{ flex: '1 1 50%', background: 'var(--green-deep)', color: '#E8E4D6', padding: '48px 56px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="hidden lg:flex">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 800px 600px at 20% 20%, rgba(232,153,104,.08), transparent 60%)' }}/>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56, position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--green-deep)', fontWeight: 400, lineHeight: 1 }}>P</span>
          </div>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#F1ECDF' }}>PeaceCoParent</span>
        </Link>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', paddingBottom: 32 }}>
          <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>Welcome back</div>
          <h1 className="pcp-display" style={{ marginTop: 18, fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 0.94, letterSpacing: '-0.035em', color: '#F1ECDF' }}>
            Before<br/>you <em>send it.</em>
          </h1>
          <p style={{ marginTop: 22, fontSize: 17, color: '#9BAE9F', maxWidth: 420, lineHeight: 1.55 }}>
            The co-parenting app that catches the message before it leaves you — your records, calendar, and Peace Score all in one place.
          </p>
          <div style={{ marginTop: 32, display: 'grid', gap: 12, maxWidth: 460 }}>
            {features.map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: '#E8E4D6' }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--clay)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckIcon/></span>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ position: 'relative', padding: '18px 20px', background: 'rgba(255,255,255,.04)', borderRadius: 14, border: '1px solid #234232', maxWidth: 460 }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: '#F1ECDF', lineHeight: 1.4 }}>
            &ldquo;PeaceCoParent helped me stop dreading every message exchange. The coach alone is worth it.&rdquo;
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--clay)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 15 }}>S</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#F1ECDF' }}>Sarah M.</div>
              <div className="pcp-mono" style={{ fontSize: 10.5, color: '#9BAE9F' }}>MOTHER OF TWO · PORTLAND</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="pcp-auth-form" style={{ flex: '1 1 50%', background: 'var(--bg)', padding: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
          {/* Mobile logo */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }} className="flex lg:hidden">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: '#F1ECDF', fontWeight: 400 }}>P</span>
            </div>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>PeaceCoParent</span>
          </Link>

          {/* Tab switcher */}
          <div style={{ display: 'inline-flex', padding: 4, background: 'var(--bg-deep)', borderRadius: 999, marginBottom: 32 }}>
            <div style={{ padding: '8px 20px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, background: 'var(--card)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>Sign in</div>
            <Link href={pendingCode ? `/register?code=${pendingCode}` : '/register'} style={{ padding: '8px 20px', borderRadius: 999, fontSize: 13.5, fontWeight: 500, color: 'var(--ink-mute)', textDecoration: 'none' }}>
              Create account
            </Link>
          </div>

          <h2 className="pcp-display" style={{ fontSize: 44, letterSpacing: '-0.02em', lineHeight: 1 }}>Welcome <em>back.</em></h2>
          <p style={{ marginTop: 12, fontSize: 14.5, color: 'var(--ink-soft)', marginBottom: 28 }}>Sign in to your PeaceCoParent account.</p>

          {justReset && (
            <div style={{ marginBottom: 18, padding: '12px 16px', background: 'var(--green-tint)', border: '1px solid #BCC9AC', borderRadius: 12, fontSize: 14, color: 'var(--green-deep)' }}>
              Password reset successfully. Sign in with your new password.
            </div>
          )}
          {error && (
            <div style={{ marginBottom: 18, padding: '12px 16px', background: 'var(--warn-tint)', border: '1px solid #E8B898', borderRadius: 12, fontSize: 14, color: '#7A2E1E' }}>
              {error}
            </div>
          )}

          {/* Google */}
          <a href={`${API_URL}/auth/google`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 999, padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none', cursor: 'pointer' }}>
            <GoogleIcon/>
            Continue with Google
          </a>

          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-mute)' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            <span style={{ fontSize: 12.5 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: 22, display: 'grid', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email address</label>
              <input
                type="email" autoFocus autoComplete="email" required
                value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: '100%', padding: '13px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <input
                type="password" autoComplete="current-password" required
                value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                style={{ width: '100%', padding: '13px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ background: 'var(--green)', color: '#F1ECDF', border: 'none', borderRadius: 999, padding: '15px 24px', fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? 'Signing in…' : <>Sign in <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
            </button>
          </form>

          <p style={{ marginTop: 22, textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)' }}>
            New here?{' '}
            <Link href={pendingCode ? `/register?code=${pendingCode}` : '/register'} style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
              Create a free account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--ink-mute)', fontSize: 14, fontFamily: 'var(--sans)' }}>
        Loading…
      </div>
    }>
      <LoginForm/>
    </Suspense>
  );
}
