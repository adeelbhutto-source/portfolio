'use client';
import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { API_URL } from '@/lib/env';

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      router.push('/login?reset=1');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4"
        style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'oklch(95% 0.03 25)' }}>
            <svg width="24" height="24" fill="none" stroke="oklch(55% 0.18 25)" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </div>
          <p className="mb-4 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Invalid or missing reset link.
          </p>
          <Link href="/forgot-password" className="text-[13px] font-semibold no-underline"
            style={{ color: 'var(--green-deep)' }}>
            Request a new one →
          </Link>
        </div>
      </div>
    );
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
          <h1 className="mb-1.5 text-[28px]"
            style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
            Set new password
          </h1>
          <p className="mb-6 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Choose a strong password for your account.
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
                New password
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required autoFocus placeholder="At least 8 characters"
                className="pcp-input" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold"
                style={{ color: 'var(--ink)' }}>
                Confirm password
              </label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                required placeholder="Repeat your new password"
                className="pcp-input" />
            </div>
            <button type="submit" disabled={loading}
              className="pcp-btn-primary w-full rounded-[14px] py-3 text-[15px] font-bold disabled:opacity-50">
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-[14px]"
        style={{ background: 'var(--bg)', color: 'var(--ink-soft)' }}>
        Loading…
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
