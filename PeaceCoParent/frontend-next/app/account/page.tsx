'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { apiFetch, clearTokens } from '@/lib/api';
import { API_URL } from '@/lib/env';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, Avatar, SectionHeader } from '@/components/V3';
import { useToast } from '@/components/ui';

export default function Account() {
  const { user, logout } = useAuth();
  const { tier, openPortal } = useSubscription();
  const { supported: pushSupported, status: pushStatus, subscribe } = usePushNotifications();
  const router = useRouter();
  const toast = useToast();

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Not logged in');
      const res = await fetch(`${API_URL}/account/export`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'peacecoparent-data.json'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally { setExporting(false); }
  }

  async function handleDelete() {
    if (deleteConfirm !== 'DELETE MY ACCOUNT') return;
    setDeleting(true); setDeleteError('');
    try {
      await apiFetch('/account', { method: 'DELETE', body: JSON.stringify({ confirm: 'DELETE MY ACCOUNT' }) });
      clearTokens(); logout(); router.push('/');
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Failed');
      setDeleting(false);
    }
  }

  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  const fieldStyle: React.CSSProperties = { marginTop: 6, padding: '11px 14px', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--ink)' };

  return (
    <AppLayout>
      <style>{`
        @media (max-width: 640px) {
          .acct-layout { grid-template-columns: 1fr !important; }
          .acct-name-fields { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <PageHero
        eyebrow="Account"
        title={<>Settings.</>}
        subtitle="Profile, plan, notifications, data — and the parts of your account only you can manage."
        size="sm"
      />

      <div className="acct-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Profile */}
          <Card>
            <SectionHeader eyebrow="Profile" title="Your account" action={<Btn kind="outline" href="/profile">Edit profile</Btn>}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Avatar name={user?.name ?? '?'} tone="pink" size={56}/>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{user?.email}</div>
              </div>
            </div>
            <div className="acct-name-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)' }}>Display name</div>
                <div style={fieldStyle}>{user?.name ?? '—'}</div>
              </div>
              <div>
                <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)' }}>Email 🔒</div>
                <div style={fieldStyle}>{user?.email ?? '—'}</div>
              </div>
            </div>
          </Card>

          {/* Plan */}
          <Card>
            <SectionHeader eyebrow="Plan + billing" title={`${tierLabel} plan`} action={tier !== 'free' ? <Btn kind="outline" onClick={openPortal}>Manage / cancel</Btn> : <Btn kind="primary" href="/pricing">Upgrade →</Btn>}/>
            <div style={{ padding: '18px 20px', background: tier === 'free' ? 'var(--bg-soft)' : 'var(--green-tint)', border: `1px solid ${tier === 'free' ? 'var(--border)' : '#BCC9AC'}`, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18 }}>
              <div>
                <div className="pcp-eyebrow" style={{ color: tier === 'free' ? 'var(--ink-mute)' : 'var(--green)' }}>Current plan</div>
                <div className="pcp-display" style={{ fontSize: 28, color: tier === 'free' ? 'var(--ink)' : 'var(--green-deep)', marginTop: 4, letterSpacing: '-0.015em' }}>{tierLabel}</div>
                <div style={{ fontSize: 13, color: tier === 'free' ? 'var(--ink-soft)' : 'var(--green-deep)', marginTop: 4, opacity: 0.8 }}>
                  {tier === 'free' ? 'Basic features only' : 'Both parents · All features included'}
                </div>
              </div>
              {tier !== 'free' && (
                <div style={{ textAlign: 'right' }}>
                  <div className="pcp-display" style={{ fontSize: 36, color: 'var(--green-deep)', letterSpacing: '-0.025em' }}>
                    {tier === 'professional' ? '$39' : '$14'}<span style={{ fontSize: 14, color: 'var(--green)' }}>/mo</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <SectionHeader eyebrow="Notifications" title="What to ping you about"/>
            {!pushSupported ? (
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>Push notifications are not supported in this browser.</p>
            ) : pushStatus === 'granted' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--green-tint)', border: '1px solid #BCC9AC', borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--green)', flexShrink: 0 }}/>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-deep)' }}>Notifications enabled</span>
              </div>
            ) : pushStatus === 'denied' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#f59e0b', flexShrink: 0 }}/>
                <span style={{ fontSize: 13, color: '#92400e' }}>Notifications blocked — enable them in your browser settings.</span>
              </div>
            ) : (
              <Btn kind="primary" onClick={subscribe}>Enable push notifications</Btn>
            )}
          </Card>

          {/* Privacy */}
          <Card>
            <SectionHeader eyebrow="Your data (GDPR)" title="Privacy controls"/>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 14 }}>
              Download everything we have on you. Stored messages are end-to-end encrypted — even we can&apos;t read them.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Btn kind="outline" onClick={handleExport} disabled={exporting}>
                {exporting ? 'Preparing…' : 'Export my data (JSON)'}
              </Btn>
              <Btn kind="ghost" href="/privacy">Privacy policy</Btn>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Security */}
          <Card>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Security</div>
            <div style={{ marginTop: 12, display: 'grid', gap: 0 }}>
              {[
                ['Password', 'Change your login password', '/forgot-password'],
                ['Sessions', 'Manage active sessions', null],
              ].map(([k, v, href], i) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{k as string}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{v as string}</div>
                  </div>
                  {href ? (
                    <Link href={href as string} style={{ fontSize: 12, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Change →</Link>
                  ) : (
                    <span style={{ color: 'var(--ink-mute)' }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Sign out */}
          <Card>
            <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)' }}>Session</div>
            <div style={{ marginTop: 12 }}>
              <Btn kind="outline" onClick={async () => { await logout(); router.push('/'); }}>
                Sign out
              </Btn>
            </div>
          </Card>

          {/* Danger zone */}
          <Card style={{ borderColor: 'var(--warn-tint)' }}>
            <div className="pcp-eyebrow" style={{ color: 'var(--warn)' }}>Danger zone</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, marginTop: 6, color: 'var(--warn)' }}>Permanently delete account</div>
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--warn-tint)', borderRadius: 10, fontSize: 13, color: '#7A2E1E', lineHeight: 1.5 }}>
              This cannot be undone. Your profile, messages, and documents will be permanently deleted.
            </div>
            {deleteError && <p style={{ fontSize: 13, color: 'var(--warn)', margin: '8px 0 0' }}>{deleteError}</p>}
            <input
              type="text"
              placeholder='Type "DELETE MY ACCOUNT" to confirm'
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              style={{ width: '100%', borderRadius: 10, border: '1.5px solid #fca5a5', padding: '11px 14px', fontSize: 14, fontFamily: 'var(--sans)', background: '#fff', color: 'var(--ink)', outline: 'none', marginTop: 12 }}
            />
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== 'DELETE MY ACCOUNT' || deleting}
              style={{ width: '100%', borderRadius: 10, border: '1.5px solid var(--warn)', background: 'none', color: 'var(--warn)', padding: '12px 0', fontSize: 14, fontWeight: 600, fontFamily: 'var(--sans)', cursor: deleteConfirm !== 'DELETE MY ACCOUNT' || deleting ? 'not-allowed' : 'pointer', opacity: deleteConfirm !== 'DELETE MY ACCOUNT' || deleting ? 0.4 : 1, marginTop: 10 }}
            >
              {deleting ? 'Deleting…' : 'Delete my account'}
            </button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
