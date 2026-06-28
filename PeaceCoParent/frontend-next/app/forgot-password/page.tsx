'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { API_URL } from '@/lib/env';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        <div className="rounded-[24px] border p-8 shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: 'var(--green-tint)' }}>
                <svg width="24" height="24" fill="none" stroke="var(--green-deep)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h1 className="mb-2 text-[22px]"
                style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
                Check your inbox
              </h1>
              <p className="mb-6 text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                If <strong style={{ color: 'var(--ink)' }}>{email}</strong> has an account,
                we sent a reset link. Check your spam folder too.
              </p>
              <Link href="/login" className="text-[13px] font-semibold no-underline"
                style={{ color: 'var(--green-deep)' }}>
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-1.5 text-[28px]"
                style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
                Forgot password?
              </h1>
              <p className="mb-6 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
                We&apos;ll send a reset link to your email.
              </p>

              {error && (
                <div className="mb-4 rounded-xl px-4 py-3 text-[13px]"
                  style={{ background: 'oklch(95% 0.03 25)', color: 'oklch(40% 0.12 25)', border: '1px solid oklch(88% 0.06 25)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold"
                    style={{ color: 'var(--ink)' }}>
                    Email address
                  </label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required autoFocus placeholder="you@example.com"
                    className="pcp-input"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="pcp-btn-primary w-full rounded-[14px] py-3 text-[15px] font-bold disabled:opacity-50">
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="mt-5 text-center text-[13px]" style={{ color: 'var(--ink-soft)' }}>
                <Link href="/login" className="font-semibold no-underline" style={{ color: 'var(--green-deep)' }}>
                  ← Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
