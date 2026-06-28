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

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: 'var(--border)' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'var(--warn)' };
  if (score <= 3) return { score, label: 'Fair', color: 'var(--clay)' };
  return { score, label: 'Strong', color: 'var(--ok)' };
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '13px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 };

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingCode = searchParams.get('code') ?? '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!terms) { setError('Please accept the terms of service to continue'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      await register(email.trim(), password, name);
      router.push(pendingCode ? `/setup?code=${pendingCode}` : '/setup');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pcp-auth-page" style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--sans)', color: 'var(--ink)' }}>
      {/* LEFT */}
      <div style={{ flex: '1 1 50%', background: 'var(--green-deep)', color: '#E8E4D6', padding: '48px 56px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="hidden lg:flex">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 800px 600px at 80% 80%,rgba(232,153,104,.08),transparent 60%)' }}/>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56, position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--green-deep)', lineHeight: 1 }}>P</span>
          </div>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#F1ECDF' }}>PeaceCoParent</span>
        </Link>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>7-day free trial</div>
          <h1 className="pcp-display" style={{ marginTop: 18, fontSize: 'clamp(48px,6vw,80px)', lineHeight: 0.94, letterSpacing: '-0.035em', color: '#F1ECDF' }}>
            Start protecting<br/>your peace.
          </h1>
          <p style={{ marginTop: 22, fontSize: 17, color: '#9BAE9F', maxWidth: 420, lineHeight: 1.55 }}>
            Start protecting your peace today — even before your co-parent joins.
          </p>
          <div style={{ marginTop: 32, display: 'grid', gap: 12, maxWidth: 460 }}>
            {['Review messages before sending to reduce escalation', 'Keep private records of events, expenses, and incidents', 'One subscription covers both parents when they join'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: '#E8E4D6' }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--clay)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5 6 11l5.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', padding: '18px 20px', background: 'rgba(255,255,255,.04)', borderRadius: 14, border: '1px solid #234232', maxWidth: 460 }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: '#F1ECDF', lineHeight: 1.4 }}>
            &ldquo;I finally stopped dreading every text from my co-parent. PeaceCoParent changed everything.&rdquo;
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--clay)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 15 }}>M</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#F1ECDF' }}>Marcus T.</div>
              <div className="pcp-mono" style={{ fontSize: 10.5, color: '#9BAE9F' }}>FATHER OF THREE · AUSTIN</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="pcp-auth-form" style={{ flex: '1 1 50%', background: 'var(--bg)', padding: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
          {/* Mobile logo */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }} className="flex lg:hidden">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: '#F1ECDF' }}>P</span>
            </div>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>PeaceCoParent</span>
          </Link>

          {/* Tab switcher */}
          <div style={{ display: 'inline-flex', padding: 4, background: 'var(--bg-deep)', borderRadius: 999, marginBottom: 32 }}>
            <Link href={pendingCode ? `/login?code=${pendingCode}` : '/login'} style={{ padding: '8px 20px', borderRadius: 999, fontSize: 13.5, fontWeight: 500, color: 'var(--ink-mute)', textDecoration: 'none' }}>
              Sign in
            </Link>
            <div style={{ padding: '8px 20px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, background: 'var(--card)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
              Create account
            </div>
          </div>

          <h2 className="pcp-display" style={{ fontSize: 44, letterSpacing: '-0.02em', lineHeight: 1 }}>Create your account.</h2>
          <p style={{ marginTop: 12, fontSize: 14.5, color: 'var(--ink-soft)', marginBottom: 28 }}>Free to start. No credit card needed.</p>

          {error && (
            <div style={{ marginBottom: 18, padding: '12px 16px', background: 'var(--warn-tint)', border: '1px solid #E8B898', borderRadius: 12, fontSize: 14, color: '#7A2E1E' }}>{error}</div>
          )}

          {pendingCode && (
            <div style={{ marginBottom: 18, padding: '12px 16px', background: 'var(--green-tint)', border: '1px solid #BCC9AC', borderRadius: 12, fontSize: 13, color: 'var(--green-deep)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="7" stroke="var(--green)" strokeWidth="1.5"/><path d="M8 7v4M8 5.5v.5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              You have an invite code — your account will be linked automatically after sign-up.
            </div>
          )}

          {/* Google */}
          <a href={`${API_URL}/auth/google`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 999, padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
            <GoogleIcon/> Sign up with Google
          </a>

          <div style={{ margin: '22px 0', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-mute)' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            <span style={{ fontSize: 12.5 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>First name</label><input type="text" required autoFocus autoComplete="given-name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Alex" style={inputStyle}/></div>
              <div><label style={labelStyle}>Last name</label><input type="text" required autoComplete="family-name" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" style={inputStyle}/></div>
            </div>
            <div>
              <label style={labelStyle}>Email address</label>
              <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@example.com" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" style={inputStyle}/>
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'var(--border)', transition: 'background 0.2s' }}/>)}
                  </div>
                  <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: 'var(--green)', cursor: 'pointer' }}/>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link href="/terms" target="_blank" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
              </span>
            </label>
            <button type="submit" disabled={loading || !terms} style={{ background: loading || !terms ? 'var(--green-mute)' : 'var(--green)', color: '#F1ECDF', border: 'none', borderRadius: 999, padding: '15px 24px', fontSize: 15, fontWeight: 600, cursor: loading || !terms ? 'default' : 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account…' : <>Create account <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
            </button>
          </form>
          <p style={{ marginTop: 22, textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)' }}>
            Already have an account?{' '}
            <Link href={pendingCode ? `/login?code=${pendingCode}` : '/login'} style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--ink-mute)', fontFamily: 'var(--sans)' }}>Loading…</div>}>
      <RegisterForm/>
    </Suspense>
  );
}
