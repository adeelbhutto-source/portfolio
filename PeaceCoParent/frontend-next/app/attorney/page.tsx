'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useSubscription } from '@/hooks/useSubscription';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, Avatar, Pill, SectionHeader, Icon } from '@/components/V3';
import { useToast } from '@/components/ui';
import { fmtDate } from '@/lib/format';

interface AttorneyAccess {
  id: string;
  email: string;
  name: string | null;
  role: 'attorney' | 'mediator';
  expiresAt: string | null;
  grantedAt: string;
}

interface FamilyAccess {
  id: string;
  family_id: string;
  family_name: string;
  role: string;
  expires_at: string | null;
}

interface FamilyData {
  family: { id: string; name: string };
  peaceScore: { score: number; label: string; weeklyHistory: { week: string; score: number }[] } | null;
  messages: { body: string; created_at: string; sender_name: string }[];
}

const ROLE_LABELS: Record<string, string> = {
  attorney: 'Attorney',
  mediator: 'Mediator',
};

export default function AttorneyPage() {
  const { tier } = useSubscription();
  const toast = useToast();
  const isPro = tier === 'professional' || tier === 'enterprise';

  const [list, setList] = useState<AttorneyAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'attorney' | 'mediator'>('attorney');
  const [days, setDays] = useState('90');
  const [granting, setGranting] = useState(false);
  const [myAccess, setMyAccess] = useState<FamilyAccess[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyData | null>(null);
  const [loadingFamily, setLoadingFamily] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ attorneys: AttorneyAccess[] }>('/attorney/list');
      setList(data.attorneys);
    } catch {
      // not yet granted anyone — empty list is fine
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPro) load(); else setLoading(false);
    apiFetch<{ access: FamilyAccess[] }>('/attorney/my-access')
      .then(d => setMyAccess(d.access)).catch(() => {});
  }, [isPro, load]);

  async function viewFamily(familyId: string) {
    setLoadingFamily(true);
    try {
      const data = await apiFetch<FamilyData>(`/attorney/family/${familyId}`);
      setSelectedFamily(data);
    } catch { /* no access */ }
    finally { setLoadingFamily(false); }
  }

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setGranting(true);
    try {
      await apiFetch('/attorney/grant', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role,
          expiresInDays: days === '' ? null : Number(days),
        }),
      });
      toast.success(`Access granted to ${email.trim()}.`);
      setEmail(''); setDays('90'); setShowForm(false);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to grant access');
    } finally {
      setGranting(false);
    }
  }

  async function handleRevoke(id: string, name: string | null) {
    if (!window.confirm(`Revoke access for ${name ?? 'this person'}?`)) return;
    try {
      await apiFetch(`/attorney/${id}`, { method: 'DELETE' });
      setList(prev => prev.filter(a => a.id !== id));
      toast.success('Access revoked.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke access');
    }
  }

  return (
    <AppLayout>
      <style>{`
        @media (max-width: 640px) {
          .atty-layout { grid-template-columns: 1fr !important; }
          .atty-preview-stats { grid-template-columns: 1fr 1fr !important; }
          .atty-grant-form { flex-direction: column !important; }
          .atty-grant-form > div { min-width: unset !important; width: 100% !important; }
          .atty-access-row { grid-template-columns: auto 1fr auto !important; }
          .atty-access-row > div:nth-child(3) { display: none !important; }
        }
      `}</style>
      <PageHero
        eyebrow="Professional access"
        title={<>Your attorney sees <em>more than logs.</em></>}
        subtitle="Give your attorney or mediator read-only access to messages, expenses, calendar — and your Peace Score, weekly trend, and the coach-flagged drafts you didn't send. They get the whole picture, not just the receipts."
        action={isPro ? <Btn kind="primary" tone="dark" icon={Icon.plus(12)} onClick={() => setShowForm(true)}>Add person</Btn> : undefined}
      />

      {/* Upgrade gate */}
      {!isPro && (
        <div className="atty-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <Card style={{ padding: 48, textAlign: 'center', minHeight: 360 }}>
            <div style={{ width: 84, height: 84, borderRadius: 999, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              {Icon.briefcase(40)}
            </div>
            <div className="pcp-display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>
              Professional plan <em>required.</em>
            </div>
            <p style={{ marginTop: 12, fontSize: 14.5, color: 'var(--ink-soft)', maxWidth: 400, margin: '12px auto 0' }}>
              Attorney & mediator portal access is included in the Professional plan at $39/month.
            </p>
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
              <Btn kind="primary" big href="/pricing?plan=professional">Upgrade to Professional</Btn>
            </div>
          </Card>
          <Card style={{ background: 'var(--green-tint)', border: '1px solid #BCC9AC' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}>{Icon.shield(18)}</span>
              <div style={{ fontSize: 13.5, color: 'var(--green-deep)', lineHeight: 1.55 }}>
                <b style={{ fontWeight: 700 }}>Read-only access:</b> Your attorney or mediator can view messages, expenses, calendar events, and child profiles — but cannot send messages, create expenses, or modify any data.<br/><br/>
                <b style={{ fontWeight: 700 }}>What&apos;s also shared:</b> Your Peace Score, weekly trend chart, and coach-flagged drafts. This is the part no other co-parenting app offers.
              </div>
            </div>
          </Card>
        </div>
      )}

      {isPro && (
        <div className="atty-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Grant access card */}
            <Card>
              <SectionHeader eyebrow="Grant access" title="Who can see your records" action={<Btn kind="outline" icon={Icon.plus(11)} onClick={() => setShowForm(true)}>Invite</Btn>} />
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 600 }}>
                They must have a PeaceCoParent account (free is fine). We send them an email with a one-click join link.
              </p>
              {showForm && (
                <form onSubmit={handleGrant} className="atty-grant-form mt-4 flex flex-wrap items-end gap-3">
                  <div className="flex-1" style={{ minWidth: '200px' }}>
                    <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>Email address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="attorney@lawfirm.com" className="pcp-input" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>Role</label>
                    <select value={role} onChange={e => setRole(e.target.value as 'attorney' | 'mediator')} className="pcp-input" style={{ width: 'auto' }}>
                      <option value="attorney">Attorney</option>
                      <option value="mediator">Mediator</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>Days</label>
                    <input type="number" min="1" max="365" value={days} onChange={e => setDays(e.target.value)} placeholder="90" className="pcp-input" style={{ width: '80px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn type="submit" kind="primary" disabled={granting}>{granting ? 'Granting…' : 'Grant access'}</Btn>
                    <Btn kind="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
                  </div>
                </form>
              )}
            </Card>

            {/* Active access list */}
            <Card pad={0}>
              <div style={{ padding: '18px 22px 12px' }}>
                <SectionHeader eyebrow="Active access" title="Currently shared with" />
              </div>
              {loading ? (
                <div style={{ padding: '0 22px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[0,1].map(i => <div key={i} className="flex items-center gap-3"><div className="h-10 w-10 animate-pulse rounded-full" style={{ background: 'var(--bg-deep)' }}/><div className="flex-1 h-4 animate-pulse rounded" style={{ background: 'var(--bg-deep)' }}/></div>)}
                </div>
              ) : list.length === 0 ? (
                <div style={{ padding: '20px 22px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: 14 }}>No one has access yet. Invite an attorney or mediator above.</div>
              ) : list.map(a => {
                const expiry = a.expiresAt ? new Date(a.expiresAt) : null;
                const expired = expiry ? expiry < new Date() : false;
                return (
                  <div key={a.id} className="atty-access-row" style={{ padding: '16px 22px', borderTop: '1px solid var(--border-soft)', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 16, alignItems: 'center', opacity: expired ? 0.6 : 1 }}>
                    <Avatar name={(a.name ?? a.email).slice(0,1)} tone="dark" size={42}/>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 600 }}>{a.name ?? a.email}</div>
                      <div className="pcp-mono" style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>
                        {ROLE_LABELS[a.role].toUpperCase()} · {a.email}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Pill tone={expired ? 'warn' : 'green'}>{expired ? 'Expired' : 'Active'}</Pill>
                      <div className="pcp-mono" style={{ fontSize: 10.5, color: 'var(--ink-mute)', marginTop: 4 }}>
                        SINCE {fmtDate(a.grantedAt).toUpperCase()}
                      </div>
                    </div>
                    <Btn kind="ghost" onClick={() => handleRevoke(a.id, a.name)}>Revoke</Btn>
                  </div>
                );
              })}
            </Card>

            {/* Info note */}
            <Card style={{ background: 'var(--green-tint)', border: '1px solid #BCC9AC' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--green)', flexShrink: 0 }}>{Icon.shield(18)}</span>
                <div style={{ fontSize: 13.5, color: 'var(--green-deep)', lineHeight: 1.55 }}>
                  <b style={{ fontWeight: 700 }}>Read-only access:</b> Your attorney or mediator can view messages, expenses, calendar events, and child profiles — but cannot send messages, create expenses, or modify any data. Access can be revoked at any time.
                  <br/><br/>
                  <b style={{ fontWeight: 700 }}>What&apos;s also shared:</b> Your Peace Score, weekly trend chart, and coach-flagged drafts (the ones you didn&apos;t send).
                </div>
              </div>
            </Card>
          </div>

          {/* Dark preview card */}
          <Card style={{ background: 'var(--green-deep)', color: '#E8E4D6', border: '1px solid #2B3B30' }}>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>Their view · preview</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 6, color: '#F1ECDF', letterSpacing: '-0.01em' }}>
              What they see.
            </div>
            <div className="atty-preview-stats" style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 14, background: '#1A2A20', borderRadius: 10 }}>
                <div className="pcp-mono" style={{ fontSize: 9, color: '#9BAE9F' }}>PEACE SCORE</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: '#F1ECDF', lineHeight: 1.1, marginTop: 4 }}>—</div>
                <div className="pcp-mono" style={{ fontSize: 9, color: '#C8D8B8' }}>Updates with use</div>
              </div>
              <div style={{ padding: 14, background: '#1A2A20', borderRadius: 10 }}>
                <div className="pcp-mono" style={{ fontSize: 9, color: '#9BAE9F' }}>FLAGGED DRAFTS</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: '#F1ECDF', lineHeight: 1.1, marginTop: 4 }}>—</div>
                <div className="pcp-mono" style={{ fontSize: 9, color: 'var(--clay-soft)' }}>Coach caught, not sent</div>
              </div>
            </div>
            <div style={{ marginTop: 12, padding: 14, background: '#1A2A20', borderRadius: 10 }}>
              <div className="pcp-mono" style={{ fontSize: 9, color: '#9BAE9F', marginBottom: 8 }}>WHAT THEY ACCESS</div>
              {['Messages (all, timestamped)', 'Expenses + receipts', 'Calendar events', 'Peace Score + trend', 'coach-flagged drafts'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 11.5, color: '#C8C2B0' }}>
                  <span style={{ color: 'var(--clay-soft)' }}>{Icon.check(10)}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      {/* ATTORNEY VIEW — families I have access to */}
      {myAccess.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--green)' }}>
            Your attorney access
          </div>
          <div className="flex flex-col gap-3">
            {myAccess.map(a => (
              <div key={a.id} className="rounded-[20px] border p-6"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[17px] font-bold" style={{ color: 'var(--ink)' }}>{a.family_name}</div>
                    <div className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                      {a.role === 'mediator' ? 'Mediator' : 'Attorney'} access
                      {a.expires_at && ` · Expires ${fmtDate(a.expires_at)}`}
                    </div>
                  </div>
                  <button onClick={() => viewFamily(a.family_id)}
                    className="pcp-btn-primary rounded-full px-4 py-2 text-[13px] font-semibold"
                    disabled={loadingFamily}>
                    {loadingFamily ? 'Loading…' : 'View data'}
                  </button>
                </div>

                {selectedFamily?.family.id === a.family_id && (
                  <div>
                    {/* Peace Score */}
                    {selectedFamily.peaceScore && (
                      <div className="mb-4 rounded-[16px] border p-5"
                        style={{ background: 'var(--green-tint)', borderColor: 'var(--green-tint)' }}>
                        <div className="mb-3 flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full text-[24px] font-black flex-shrink-0"
                            style={{
                              background: selectedFamily.peaceScore.score >= 70 ? 'var(--green)' : selectedFamily.peaceScore.score >= 40 ? '#f59e0b' : '#ef4444',
                              color: 'white', fontFamily: 'var(--serif)',
                            }}>
                            {selectedFamily.peaceScore.score}
                          </div>
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.07em]" style={{ color: 'var(--green-deep)' }}>Peace Score</div>
                            <div className="text-[20px] font-bold" style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
                              {selectedFamily.peaceScore.label}
                            </div>
                            <div className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>Based on coaching history</div>
                          </div>
                        </div>
                        {selectedFamily.peaceScore.weeklyHistory.length >= 2 && (
                          <svg width="100%" viewBox={`0 0 ${selectedFamily.peaceScore.weeklyHistory.length * 40} 60`} preserveAspectRatio="none" style={{ display: 'block' }}>
                            {selectedFamily.peaceScore.weeklyHistory.map((w, i) => {
                              const barH = Math.max(4, (w.score / 100) * 48);
                              const color = w.score >= 70 ? 'var(--green)' : w.score >= 40 ? '#f59e0b' : '#ef4444';
                              return (
                                <g key={i}>
                                  <rect x={i * 40 + 6} y={56 - barH} width={28} height={barH} rx={4} fill={color} opacity={0.85} />
                                  <text x={i * 40 + 20} y={58} textAnchor="middle" fontSize={9} fill="var(--ink-soft)">{w.score}</text>
                                </g>
                              );
                            })}
                          </svg>
                        )}
                      </div>
                    )}
                    {/* Recent messages */}
                    <div className="text-[13px] font-semibold mb-2" style={{ color: 'var(--ink)' }}>
                      Recent messages ({selectedFamily.messages.length})
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto">
                      {selectedFamily.messages.slice(0, 10).map((m, i) => (
                        <div key={i} className="rounded-xl px-3.5 py-2.5 text-[13px]"
                          style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
                          <span className="font-semibold">{m.sender_name}:</span> {m.body.length > 80 ? m.body.slice(0, 80) + '…' : m.body}
                          <span className="ml-2 text-[11px]" style={{ color: 'var(--ink-soft)' }}>{fmtDate(m.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
