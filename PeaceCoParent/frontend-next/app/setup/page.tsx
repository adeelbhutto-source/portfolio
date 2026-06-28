'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { apiFetch } from '@/lib/api';
import Logo from '@/components/Logo';
import Script from 'next/script';
import type { Family, FamilyMember } from '@/types/shared';

type Tab = 'create' | 'join';

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  const bg = done || active ? 'var(--green)' : 'var(--border)';
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold text-white transition-colors"
      style={{ background: bg }}>
      {done
        ? <svg width="11" height="11" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        : <span style={{ color: done || active ? 'white' : 'var(--ink-soft)' }}>{n}</span>}
    </div>
  );
}

function StepBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      <StepDot n={1} active={step === 1} done={step > 1} />
      <div className="h-0.5 flex-1 transition-colors"
        style={{ background: step > 1 ? 'var(--green)' : 'var(--border)' }} />
      <StepDot n={2} active={step === 2} done={step > 2} />
      <div className="h-0.5 flex-1 transition-colors"
        style={{ background: step > 2 ? 'var(--green)' : 'var(--border)' }} />
      <StepDot n={3} active={step === 3} done={step >= 3} />
    </div>
  );
}

function FamilySetupForm() {
  const { user, family, setFamilyData } = useAuth();
  const { supported: pushSupported, status: pushStatus, subscribe } = usePushNotifications();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => searchParams.get('code') ? 'join' : 'create');

  // Redirect users who already have a family — they don't need setup
  useEffect(() => {
    if (family) router.replace('/dashboard');
  }, [family, router]);

  const [familyName, setFamilyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdFamily, setCreatedFamily] = useState<Family | null>(null);
  const [copied, setCopied] = useState(false);

  const [inviteCode, setInviteCode] = useState(searchParams.get('code') ?? '');
  const [joining, setJoining] = useState(false);
  const [showEmailInvite, setShowEmailInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [joinError, setJoinError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!familyName.trim()) { setCreateError('Family name cannot be empty'); return; }
    setCreateError(''); setCreating(true);
    try {
      const data = await apiFetch<{ family: Family; familyMember: FamilyMember }>('/family/create', {
        method: 'POST',
        body: JSON.stringify({ familyName: familyName.trim() }),
      });
      setFamilyData(data.family, data.familyMember);
      setCreatedFamily(data.family);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create family');
    } finally { setCreating(false); }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError(''); setJoining(true);
    try {
      const data = await apiFetch<{ family: Family; familyMember: FamilyMember }>('/family/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
      });
      setFamilyData(data.family, data.familyMember);
      router.push('/dashboard');
    } catch (err: unknown) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join family');
    } finally { setJoining(false); }
  }

  function copyCode() {
    if (!createdFamily) return;
    const joinUrl = `${window.location.origin}/join/${createdFamily.inviteCode}`;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function shareCode() {
    if (!createdFamily) return;
    const joinUrl = `${window.location.origin}/join/${createdFamily.inviteCode}`;
    if (navigator.share) {
      navigator.share({ title: 'Join me on PeaceCoParent', text: 'Hi! I\'ve set up our co-parenting account.', url: joinUrl })
        .catch(() => { navigator.clipboard.writeText(joinUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); });
    } else {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function sendInviteEmail(e: React.FormEvent) {
    e.preventDefault();
    setSendingInvite(true);
    setInviteError('');
    try {
      await apiFetch('/family/invite-email', { method: 'POST', body: JSON.stringify({ email: inviteEmail.trim() }) });
      setInviteSent(true);
      setShowEmailInvite(false);
      setInviteEmail('');
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite. Please try again.');
    } finally {
      setSendingInvite(false);
    }
  }

  /* ── Family created — step 3 ── */
  if (createdFamily) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
        style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center"><Logo size="md" /></div>
          <StepBar step={3} />

          <div className="rounded-[24px] border p-8 shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: 'var(--green-tint)' }}>
                <svg width="24" height="24" fill="none" stroke="var(--green-deep)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-center text-[24px]"
              style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
              Family created!
            </h2>
            <p className="mb-1 text-center text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              Your account is ready. Share this code with your co-parent when you&apos;re ready — or skip for now.
            </p>
            <p className="mb-6 text-center text-[12px]" style={{ color: 'var(--ink-soft)' }}>
              The code never expires.
            </p>

            <div className="mb-4 rounded-[16px] border p-5 text-center"
              style={{ background: 'var(--green-tint)', borderColor: 'var(--green-tint)' }}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--green-deep)' }}>
                Invite code
              </p>
              <p className="select-all tracking-[0.25em]"
                style={{ fontFamily: 'var(--serif)', fontSize: '38px', color: 'var(--green-deep)', fontWeight: 400 }}>
                {createdFamily.inviteCode}
              </p>
            </div>

            <div className="mb-4 flex gap-2">
              <button onClick={copyCode}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all"
                style={{
                  background: copied ? 'var(--green-tint)' : 'none',
                  border: `1.5px solid ${copied ? 'var(--green)' : 'var(--border)'}`,
                  color: copied ? 'var(--green-deep)' : 'var(--ink-soft)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {copied ? '✓ Copied!' : 'Copy invite link'}
              </button>
              <button onClick={shareCode}
                className="pcp-btn-secondary flex-1 rounded-xl py-2.5 text-[13px] font-semibold">
                Share link
              </button>
            </div>

            {inviteSent ? (
              <div className="mb-4 rounded-xl px-4 py-3 text-center text-[13px] font-semibold"
                style={{ background: 'var(--green-tint)', color: 'var(--green-deep)' }}>
                ✓ Invite email sent!
              </div>
            ) : showEmailInvite ? (
              <div className="mb-4">
                <form onSubmit={sendInviteEmail} className="flex gap-2">
                  <input
                    type="email" required autoFocus
                    value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="co-parent@email.com"
                    className="pcp-input flex-1 text-[13px]"
                    style={{ padding: '9px 12px', borderRadius: '10px' }}
                  />
                  <button type="submit" disabled={sendingInvite}
                    className="pcp-btn-primary rounded-[10px] px-4 py-2 text-[13px] font-semibold disabled:opacity-60">
                    {sendingInvite ? '…' : 'Send'}
                  </button>
                  <button type="button" onClick={() => { setShowEmailInvite(false); setInviteError(''); }}
                    className="pcp-btn-secondary rounded-[10px] px-3 py-2 text-[13px]">✕</button>
                </form>
                {inviteError && (
                  <p className="mt-2 text-[12px]" style={{ color: '#dc2626' }}>{inviteError}</p>
                )}
              </div>
            ) : (
              <button onClick={() => setShowEmailInvite(true)}
                className="mb-4 w-full rounded-xl border py-2.5 text-[13px] font-semibold transition-all"
                style={{ border: '1.5px solid var(--border)', color: 'var(--ink-soft)', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                ✉ Email invite to co-parent
              </button>
            )}

            {pushSupported && pushStatus === 'default' && (
              <div className="mb-4 rounded-[14px] border p-4"
                style={{ background: 'oklch(96% 0.03 240)', borderColor: 'oklch(88% 0.06 240)' }}>
                <p className="mb-1 text-[13px] font-bold" style={{ color: 'var(--ink)' }}>
                  Get notified about new messages
                </p>
                <p className="mb-3 text-[12px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  Enable notifications so you never miss a message or expense approval.
                </p>
                <button onClick={subscribe}
                  className="w-full rounded-xl py-2 text-[13px] font-bold text-white"
                  style={{ background: 'oklch(55% 0.15 240)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Enable Notifications
                </button>
              </div>
            )}
            <button onClick={() => router.push('/dashboard')}
              className="pcp-btn-primary w-full rounded-xl py-3 text-[15px] font-bold">
              Start using PeaceCoParent →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2 — create or join ── */
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-5 flex justify-center"><Logo size="md" /></div>
          <h2 className="text-[22px]"
            style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
            Set up your space, {user?.name?.split(' ')[0]}
          </h2>
          <p className="mx-auto mt-1.5 max-w-xs text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            Start right away — invite your co-parent whenever you&apos;re ready.
          </p>
        </div>

        <StepBar step={2} />

        <div className="rounded-[24px] border p-7 shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {/* Tab toggle */}
          <div className="mb-6 flex rounded-[14px] p-1 gap-1"
            style={{ background: 'var(--bg-deep)' }}>
            {(['create', 'join'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 rounded-[10px] py-2 text-[14px] font-semibold transition-all"
                style={{
                  background: tab === t ? 'var(--card)' : 'none',
                  color: tab === t ? 'var(--ink)' : 'var(--ink-soft)',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>
                {t === 'create' ? 'Create family' : 'Join family'}
              </button>
            ))}
          </div>

          {tab === 'create' && (
            <div>
              <p className="mb-4 text-[13px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                Create a family account — you&apos;ll get an invite code to share with the other parent.
              </p>
              {createError && (
                <div className="mb-4 rounded-xl px-4 py-3 text-[13px]"
                  style={{ background: 'oklch(95% 0.03 25)', color: 'oklch(40% 0.12 25)', border: '1px solid oklch(88% 0.06 25)' }}>
                  {createError}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
                    Family name
                  </label>
                  <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)}
                    required placeholder="e.g. Smith Family"
                    className="pcp-input" />
                </div>
                <button type="submit" disabled={creating}
                  className="pcp-btn-primary w-full rounded-xl py-3 text-[15px] font-bold disabled:opacity-60">
                  {creating ? 'Creating…' : 'Create family'}
                </button>
              </form>
            </div>
          )}

          {tab === 'join' && (
            <div>
              <p className="mb-4 text-[13px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                Enter the 8-character invite code the other parent shared with you.
              </p>
              {joinError && (
                <div className="mb-4 rounded-xl px-4 py-3 text-[13px]"
                  style={{ background: 'oklch(95% 0.03 25)', color: 'oklch(40% 0.12 25)', border: '1px solid oklch(88% 0.06 25)' }}>
                  {joinError}
                </div>
              )}
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
                    Invite code
                  </label>
                  <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required maxLength={8} placeholder="ABCD1234"
                    className="pcp-input font-mono text-[16px] font-bold tracking-widest uppercase" />
                </div>
                <button type="submit" disabled={joining || inviteCode.trim().length !== 8}
                  className="pcp-btn-primary w-full rounded-xl py-3 text-[15px] font-bold disabled:opacity-60">
                  {joining ? 'Joining…' : 'Join family'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <>
      <Script id="google-ads-conversion" strategy="afterInteractive">{`
        gtag('event', 'conversion', {'send_to': 'AW-18147018788/yxGRCMyCpK0cEKSQls1D'});
      `}</Script>
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-[14px]"
        style={{ background: 'var(--bg)', color: 'var(--ink-soft)' }}>
        Loading…
      </div>
    }>
      <FamilySetupForm />
    </Suspense>
    </>
  );
}
