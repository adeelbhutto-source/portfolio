'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { fetchEvents } from '@/api/events';
import { fetchExpenses } from '@/api/expenses';
import { fetchMessages } from '@/api/messages';
import { apiFetch } from '@/lib/api';
import type { CalendarEvent, Expense, Message } from '@/types/shared';
import AppLayout from '@/components/AppLayout';
import { Card, Btn, Pill, Avatar } from '@/components/V3';
import { fmtDate, fmtDateCompact, fmtDateLong, fmtMoney } from '@/lib/format';

/* ─── HELPERS ──────────────────────────────────────── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return fmtDateCompact(iso);
}

/* ─── WIDGET SHELL ─────────────────────────────────── */
function Widget({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] border p-6 ${className}`}
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      {children}
    </div>
  );
}

function WidgetHeader({ label, title, action }: { label: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="h-5 w-0.5 rounded-full" style={{ background: 'var(--clay)' }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-mute)', fontFamily: 'var(--mono)' }}>{label}</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)', fontFamily: 'var(--serif)' }}>{title}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function ViewAll({ href, label = 'View All' }: { href: string; label?: string }) {
  return (
    <Link href={href} style={{ flexShrink: 0, borderRadius: 999, border: '1px solid var(--border)', padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)', textDecoration: 'none', fontFamily: 'var(--sans)' }}>
      {label}
    </Link>
  );
}

function ItemRow({ title, sub, badge }: { title: string; sub: string; badge?: { label: string; pending?: boolean } }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-[13px] last:mb-0 transition-colors"
      style={{ background: 'var(--bg)' }}>
      <div>
        <div className="font-semibold" style={{ color: 'var(--ink)' }}>{title}</div>
        <div style={{ color: 'var(--ink-soft)' }}>{sub}</div>
      </div>
      {badge && (
        <span className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
          style={badge.pending
            ? { background: 'oklch(93% 0.06 75)', color: 'oklch(45% 0.1 75)' }
            : { background: 'var(--green-tint)', color: 'var(--green-deep)' }}>
          {badge.label}
        </span>
      )}
    </div>
  );
}

function EmptyRow({ children, action }: { children: string; action?: { label: string; href: string } }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center">
      <p className="mb-3 text-[13px] leading-relaxed text-[var(--ink-soft)]">{children}</p>
      {action && (
        <Link href={action.href} className="pcp-btn-primary inline-flex rounded-full px-3.5 py-1.5 text-[12px] font-semibold no-underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}

/* ─── JOIN WITH CODE ───────────────────────────────── */
function JoinWithCode() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length !== 8) return;
    setLoading(true);
    setError('');
    try {
      await apiFetch('/family/join', { method: 'POST', body: JSON.stringify({ inviteCode: c }) });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[22px] border-[1.5px] p-6" style={{ background: 'var(--green-tint)', borderColor: 'var(--green-tint)' }}>
      <div className="mb-1.5 text-[16px] font-bold" style={{ color: 'var(--ink)' }}>Join your co-parent</div>
      <div className="mb-4 text-[13px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        Enter the 8-character invite code from the other parent.
      </div>
      <form onSubmit={handleJoin} className="flex gap-2">
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD1234"
          maxLength={8}
          className="pcp-input flex-1 font-mono text-[15px] font-bold uppercase tracking-widest"
        />
        <button
          type="submit"
          disabled={code.trim().length !== 8 || loading}
          className="pcp-btn-primary rounded-xl px-4 py-2.5 text-[13px] font-semibold disabled:opacity-40"
        >
          {loading ? '…' : 'Join'}
        </button>
      </form>
      {error && <p className="mt-2 text-[12px]" style={{ color: '#e53e3e' }}>{error}</p>}
    </div>
  );
}

/* ─── PEACE SCORE WIDGET ───────────────────────────── */
function PeaceScoreWidget({ score, delta, status }: { score: number; delta: number; status: string }) {
  return (
    <div style={{
      background: '#1A2A20',
      borderRadius: 16,
      padding: '18px 22px',
      minWidth: 220,
      border: '1px solid #2B3B30',
    }}>
      <div className="pcp-eyebrow" style={{ color: '#9BAE9F' }}>Peace Score</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
        <div className="pcp-display" style={{ fontSize: 64, color: '#F1ECDF', letterSpacing: '-0.04em', lineHeight: 1 }}>{score}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#9BAE9F' }}>/100</div>
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: '#C8D8B8', marginTop: 4 }}>{status}</div>
      <div className="pcp-mono" style={{ marginTop: 8, fontSize: 11, color: delta < 0 ? 'var(--clay-soft)' : '#C8D8B8' }}>
        {delta < 0 ? '↓' : '↑'} {Math.abs(delta)} pts vs last week
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ───────────────────────────────── */
function DashboardInner() {
  const { user, family, familyMember } = useAuth();
  const { tier, openPortal } = useSubscription();
  const { supported: pushSupported, status: pushStatus, subscribe } = usePushNotifications();
  const router = useRouter();
  const params = useSearchParams();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [copied, setCopied] = useState(false);
  const [conflictTrend, setConflictTrend] = useState<{ recentAvg: number | null; trend: string; sessionsWeek: number } | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [peaceScore, setPeaceScore] = useState<{
    score: number | null; label: string;
    history: { week: string; score: number; sessions: number }[];
    keyFactors: { content: string; risk_score: number; created_at: string }[];
  } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const justUpgraded = params.get('upgraded') === '1';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = fmtDateLong(new Date());

  useEffect(() => {
    if (!family) return;
    const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    let anyFailed = false;
    Promise.allSettled([
      fetchEvents(past, future).then(setEvents).catch(() => { anyFailed = true; }),
      fetchExpenses().then(setExpenses).catch(() => { anyFailed = true; }),
      fetchMessages().then(setMessages).catch(() => { anyFailed = true; }),
      apiFetch<{ children: { id: string }[] }>('/family/children').then(d => setHasChildren(d.children.length > 0)).catch(() => {}),
    ]).then(() => { if (anyFailed) setLoadError(true); });
    if (tier !== 'free') {
      apiFetch<{ recentAvg: number | null; trend: string; sessionsWeek: number }>('/coaching/trend')
        .then(setConflictTrend).catch(() => {});
      apiFetch<{ score: number | null; label: string; history: { week: string; score: number; sessions: number }[]; keyFactors: { content: string; risk_score: number; created_at: string }[] }>('/coaching/peace-score')
        .then(setPeaceScore).catch(() => {});
    }
  }, [family, tier]);

  const upcomingEvents = events
    .filter(e => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').slice(0, 3);
  const recentExpenses = expenses.slice(-3).reverse();
  const unreadMessages = messages.filter(m => m.senderId !== user?.id && !m.readAt);
  const recentMessages = [...messages]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  const isParent1 = familyMember?.role === 'parent1';

  const nextAction = unreadMessages.length > 0
    ? { label: `${unreadMessages.length} unread message${unreadMessages.length > 1 ? 's' : ''}`, href: '/messages' }
    : pendingExpenses.length > 0
    ? { label: `${pendingExpenses.length} expense${pendingExpenses.length > 1 ? 's' : ''} waiting for approval`, href: '/expenses' }
    : upcomingEvents.length > 0
    ? { label: `Next: ${upcomingEvents[0].title}`, href: '/calendar' }
    : null;

  const onboardingComplete = !!family && hasChildren && events.length > 0;
  const showWelcome = !onboardingComplete && showOnboarding;

  // Week number helper
  const weekNum = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  })();

  // Events this week
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const eventsThisWeek = events.filter(e => {
    const d = new Date(e.startDate);
    return d >= now && d <= weekEnd;
  });

  async function redeemPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMsg(null);
    try {
      await apiFetch('/promo/redeem', { method: 'POST', body: JSON.stringify({ code: promoCode.trim() }) });
      setPromoMsg({ ok: true, text: 'Promo code applied!' });
      setPromoCode('');
      setTimeout(() => router.refresh(), 1000);
    } catch (err: unknown) {
      setPromoMsg({ ok: false, text: err instanceof Error ? err.message : 'Invalid code' });
    } finally {
      setPromoLoading(false);
    }
  }

  async function copyInviteLink() {
    const code = family?.inviteCode ?? '';
    await navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppLayout>
      <style>{`
        @media (max-width: 768px) {
          /* Hero */
          .dash-hero { padding: 20px 18px !important; border-radius: 16px !important; }
          .dash-hero-grid { grid-template-columns: 1fr !important; }
          .dash-hero-grid > a, .dash-hero-grid > div:last-child { display: none !important; }
          .dash-hero h1 { font-size: 32px !important; margin-top: 6px !important; }

          /* Stat strip — 2 cols, compact */
          .dash-stat-strip { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .dash-stat-card { padding: 12px !important; border-radius: 14px !important; gap: 10px !important; }
          .dash-stat-num { font-size: 22px !important; }
          .dash-stat-sub { display: none !important; }
          .dash-stat-label { font-size: 9.5px !important; }

          /* Row grids → stack */
          .dash-row1 { grid-template-columns: 1fr !important; }
          .dash-row2 { grid-template-columns: 1fr !important; }

          /* Invite banner */
          .dash-invite { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .dash-invite-inner { flex-direction: column !important; width: 100% !important; gap: 10px !important; }
          .dash-invite-code { width: 100% !important; text-align: center !important; }

          /* Onboarding */
          .pcp-onboarding-banner { padding: 14px 16px !important; }
        }
      `}</style>
      {loadError && (
        <div className="mb-4 rounded-xl px-4 py-3 text-[13px]"
          style={{ background: 'oklch(95% 0.03 25)', color: 'oklch(40% 0.12 25)', border: '1px solid oklch(88% 0.06 25)' }}>
          Something went wrong loading your data. Try refreshing the page.
        </div>
      )}
      {justUpgraded && (
        <div className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3 text-[13px]"
          style={{ background: 'var(--green-tint)', color: 'var(--green-deep)', border: '1px solid var(--green)' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Plan upgraded — all features unlocked.
        </div>
      )}

      {/* 1. Onboarding banner (dismissible) */}
      {showWelcome && (
        <div style={{
          marginBottom: 18,
          padding: '16px 18px',
          background: 'var(--green-tint)',
          border: '1px solid #BCC9AC',
          borderRadius: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 999,
              background: 'var(--green)', color: '#F1ECDF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
              flexShrink: 0,
            }}>
              {onboardingComplete ? '5/5' : !family ? '1/5' : !hasChildren ? '3/5' : '4/5'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-deep)' }}>Finish setting up</div>
              <div style={{ fontSize: 12, color: 'var(--green-deep)', opacity: 0.7 }}>
                Invite co-parent · add children · add first event
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn kind="primary" href="/setup">Continue setup</Btn>
            <Btn kind="ghost" onClick={() => setShowOnboarding(false)}>Dismiss</Btn>
          </div>
        </div>
      )}

      {/* 2. Hero band — compact */}
      <div className="dash-hero" style={{
        background: 'var(--green-deep)',
        color: '#E8E4D6',
        borderRadius: 16,
        padding: '16px 24px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 18,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 600px 200px at 100% 0%, rgba(232,153,104,.08), transparent 60%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#9BAE9F', fontFamily: 'var(--sans)' }}>
              {greeting}, <strong style={{ color: '#F1ECDF' }}>{user?.name?.split(' ')[0] ?? 'there'}</strong>
              <span style={{ marginLeft: 10, fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.5, letterSpacing: '0.04em' }}>{today}</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#9BAE9F' }}>
              {nextAction ? nextAction.label : (family?.name ?? 'Welcome to PeaceCoParent')}
            </div>
          </div>
          {peaceScore?.score != null ? (
            <Link href="/peace-score" style={{ textDecoration: 'none' }} className="hidden md:block">
              <PeaceScoreWidget
                score={peaceScore.score}
                delta={peaceScore.history.length >= 2
                  ? peaceScore.history[peaceScore.history.length - 1].score - peaceScore.history[peaceScore.history.length - 2].score
                  : 0}
                status={peaceScore.label}
              />
            </Link>
          ) : (
            <div className="hidden md:block" style={{
              background: '#1A2A20', borderRadius: 16, padding: '18px 22px',
              minWidth: 180, border: '1px solid #2B3B30',
            }}>
              <div className="pcp-eyebrow" style={{ color: '#9BAE9F' }}>Peace Score</div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--green)', display: 'inline-block' }} className="animate-pulse"/>
                <span style={{ fontSize: 12, color: '#9BAE9F' }}>Builds with use</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 4-column stat strip */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3 mb-4">
        {[
          {
            label: 'Awaiting approval',
            n: String(pendingExpenses.length),
            sub: `expense${pendingExpenses.length !== 1 ? 's' : ''} pending`,
            tone: 'clay',
            icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 20 20">
                <rect x="3" y="6" width="14" height="10" rx="1.4"/>
                <path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6"/>
              </svg>
            ),
          },
          {
            label: 'New messages',
            n: String(unreadMessages.length),
            sub: unreadMessages.length > 0 ? `unread · ${timeAgo(unreadMessages[0]?.createdAt ?? new Date().toISOString())}` : 'all caught up',
            tone: 'green',
            icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 20 20">
                <path d="M3 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6l-4 4V4Z"/>
              </svg>
            ),
          },
          {
            label: 'Calendar this week',
            n: String(eventsThisWeek.length),
            sub: eventsThisWeek.length > 0 ? `event${eventsThisWeek.length !== 1 ? 's' : ''} · next 7 days` : 'nothing scheduled',
            tone: 'clay',
            icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 20 20">
                <rect x="3" y="4" width="14" height="14" rx="1.4"/>
                <line x1="3" y1="8" x2="17" y2="8"/>
                <line x1="7" y1="2" x2="7" y2="5"/>
                <line x1="13" y1="2" x2="13" y2="5"/>
              </svg>
            ),
          },
          {
            label: 'Drafts caught',
            n: String(conflictTrend?.sessionsWeek ?? 0),
            sub: 'this week · coach',
            tone: 'green',
            icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 20 20">
                <path d="M7 1.5v2.8M7 9.7v2.8M1.5 7h2.8M9.7 7h2.8M3.2 3.2 5 5M9 9l1.8 1.8M3.2 10.8 5 9M9 5l1.8-1.8" strokeLinecap="round"/>
              </svg>
            ),
          },
        ].map((s, i) => {
          const toneMap: Record<string, { bg: string; ic: string }> = {
            clay:  { bg: 'var(--clay-tint)',  ic: 'var(--warn)' },
            green: { bg: 'var(--green-tint)', ic: 'var(--green)' },
          };
          const tone = toneMap[s.tone];
          return (
            <div key={i} style={{
              background: 'var(--card)',
              border: '1px solid var(--border-soft)',
              borderRadius: 16,
              padding: 18,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 14,
              alignItems: 'center',
            }} className="dash-stat-card">
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: tone.bg, color: tone.ic,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div className="pcp-eyebrow dash-stat-label" style={{ color: 'var(--ink-mute)', fontSize: 10.5 }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                  <div className="pcp-display dash-stat-num" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--ink)' }}>{s.n}</div>
                  <div className="dash-stat-sub" style={{ fontSize: 11.5, color: 'var(--ink-mute)' }}>{s.sub}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Row 1: Inbox preview + Hot drafts */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-[1.6fr_1fr]">

        {/* Inbox preview */}
        <Card pad={0}>
          <div style={{
            padding: '18px 22px 14px',
            borderBottom: '1px solid var(--border-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>
                Inbox{unreadMessages.length > 0 ? ` · ${unreadMessages.length} new` : ''}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 2, letterSpacing: '-0.01em' }}>Latest messages</div>
            </div>
            <Btn kind="ghost" href="/messages">Open inbox</Btn>
          </div>
          {recentMessages.length === 0 ? (
            <div style={{ padding: '20px 22px' }}>
              <EmptyRow action={{ label: 'Open messages', href: '/messages' }}>
                Draft or review a message before sending — reduce escalation from the start.
              </EmptyRow>
            </div>
          ) : (
            recentMessages.map((m, i) => {
              const isMe = m.senderId === user?.id;
              const senderInitial = (isMe ? user?.name : m.senderName)?.charAt(0).toUpperCase() ?? '?';
              return (
                <Link key={m.id} href="/messages" style={{ textDecoration: 'none', display: 'block', minWidth: 0, overflow: 'hidden' }}>
                  <div style={{
                    padding: '14px 22px',
                    borderTop: '1px solid var(--border-soft)',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}>
                    <Avatar
                      name={senderInitial}
                      tone={isMe ? 'green' : 'pink'}
                      size={32}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)' }}>
                          {isMe ? 'You' : m.senderName}
                        </div>
                        <div className="pcp-mono" style={{ color: 'var(--ink-mute)', fontSize: 11 }}>{timeAgo(m.createdAt)}</div>
                      </div>
                      <div style={{ marginTop: 4, fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.body}
                      </div>
                      {!isMe && !m.readAt && (
                        <div style={{ marginTop: 6 }}>
                          <Pill tone="clay">Unread</Pill>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </Card>

        {/* Hot drafts */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>The coach caught</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginTop: 2, letterSpacing: '-0.01em' }}>
                {conflictTrend?.sessionsWeek ?? 0} high-risk draft{(conflictTrend?.sessionsWeek ?? 0) !== 1 ? 's' : ''}<br/>
                <em style={{ color: 'var(--ink-mute)' }}>this week.</em>
              </div>
            </div>
            {conflictTrend && (
              <Pill tone="clay">
                {conflictTrend.trend === 'falling' ? '↓' : conflictTrend.trend === 'rising' ? '↑' : '→'} vs prev
              </Pill>
            )}
          </div>
          <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            {peaceScore?.keyFactors && peaceScore.keyFactors.length > 0 ? (
              peaceScore.keyFactors.slice(0, 3).map((f, i) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  background: '#FBE8DC',
                  borderRadius: 12,
                  border: '1px solid var(--clay-tint)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Pill tone="warn">RISK {f.risk_score}/10</Pill>
                    <span className="pcp-mono" style={{ color: 'var(--warn)', fontSize: 11 }}>{fmtDate(f.created_at)}</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: '#7A2E1E', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                    &ldquo;{f.content.length > 60 ? f.content.slice(0, 60) + '…' : f.content}&rdquo;
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px 14px', background: 'var(--green-tint)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--green-deep)' }}>No high-risk drafts this week.</div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>Keep it up.</div>
              </div>
            )}
          </div>
          {tier === 'free' && (
            <div style={{ marginTop: 14 }}>
              <Btn kind="primary" href="/pricing">Unlock Coach →</Btn>
            </div>
          )}
        </Card>
      </div>

      {/* 5. Row 2: Calendar + Expenses */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">

        {/* Calendar preview */}
        <Card pad={0}>
          <div style={{ padding: '18px 22px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Up next</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginTop: 2, letterSpacing: '-0.01em' }}>Calendar</div>
            </div>
            <Btn kind="ghost" href="/calendar">View month</Btn>
          </div>
          <div style={{ padding: '0 22px 18px', display: 'grid', gap: 10 }}>
            {upcomingEvents.length === 0 ? (
              <EmptyRow action={{ label: 'Add event', href: '/calendar' }}>
                Add pickups, handovers, doctor visits — so both parents always know the plan.
              </EmptyRow>
            ) : (
              upcomingEvents.map((ev, i) => {
                const d = new Date(ev.startDate);
                const dayName = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()];
                const dayNum = d.getDate();
                return (
                  <div key={ev.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr',
                    gap: 12,
                    padding: '10px 12px',
                    background: 'var(--bg-soft)',
                    borderRadius: 10,
                  }}>
                    <div style={{
                      width: 44, padding: '4px 0', textAlign: 'center',
                      background: i === 0 ? 'var(--green-tint)' : 'var(--bg-deep)',
                      color: i === 0 ? 'var(--green)' : 'var(--ink-mute)',
                      borderRadius: 8,
                    }}>
                      <div className="pcp-mono" style={{ fontSize: 9 }}>{dayName}</div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1 }}>{dayNum}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{ev.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2 }}>
                        {ev.allDay ? 'All day' : fmtDateCompact(ev.startDate)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Expenses */}
        <Card pad={0}>
          <div style={{ padding: '18px 22px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>
                {pendingExpenses.length > 0 ? `${pendingExpenses.length} awaiting approval` : 'Shared costs'}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginTop: 2, letterSpacing: '-0.01em' }}>Expenses</div>
            </div>
            <Btn kind="ghost" href="/expenses">All expenses</Btn>
          </div>
          <div style={{ padding: '0 22px 18px', display: 'grid', gap: 8 }}>
            {recentExpenses.length === 0 ? (
              <EmptyRow action={{ label: 'Log an expense', href: '/expenses' }}>
                No shared expenses yet. Add one so money conversations stay clear.
              </EmptyRow>
            ) : (
              recentExpenses.map(e => (
                <div key={e.id} style={{
                  padding: '10px 12px',
                  background: 'var(--bg-soft)',
                  borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{e.title}</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--clay)' }}>{fmtMoney(e.amount, e.currency)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>
                    {e.status === 'pending' ? 'Awaiting approval' : 'Approved'} · {fmtDateCompact(e.createdAt ?? new Date().toISOString())}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 6. Invite co-parent banner (bottom, only if not connected) */}
      {isParent1 && family && (
        <div className="dash-invite" style={{
          background: 'var(--green-tint)',
          border: '1px solid #BCC9AC',
          borderRadius: 18,
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 18,
          marginBottom: 18,
        }}>
          <div>
            <div className="pcp-eyebrow" style={{ color: 'var(--green)' }}>One plan · both parents</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, marginTop: 2, letterSpacing: '-0.01em', color: 'var(--green-deep)' }}>
              Invite your co-parent — they pay nothing.
            </div>
          </div>
          <div className="dash-invite-inner" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="dash-invite-code" style={{
              padding: '10px 16px',
              background: '#FFFEFA',
              border: '1px solid var(--green)',
              borderRadius: 10,
              fontFamily: 'var(--mono)',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--green-deep)',
              letterSpacing: '.18em',
            }}>
              {family.inviteCode}
            </div>
            <Btn
              kind="primary"
              icon={<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M14 2 7 9M14 2l-4.5 12-2.5-5L2 6l12-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>}
              onClick={copyInviteLink}
            >
              {copied ? 'Copied!' : 'Send invite'}
            </Btn>
          </div>
        </div>
      )}

      {/* JoinWithCode for users without family */}
      {!family && <JoinWithCode />}

      {/* Push notifications prompt */}
      {pushSupported && pushStatus === 'default' && (
        <div className="rounded-[22px] border-[1.5px] p-6 mb-5"
          style={{ background: 'oklch(96% 0.03 240)', borderColor: 'oklch(88% 0.06 240)' }}>
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: 'oklch(50% 0.1 240)' }}>Notifications</div>
          <div className="mb-2 text-[16px] font-bold" style={{ color: 'var(--ink)' }}>Stay in the loop</div>
          <div className="mb-4 text-[13px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            Get notified about new messages, expense approvals, and upcoming events.
          </div>
          <button onClick={subscribe}
            className="w-full rounded-xl py-2.5 text-[13px] font-bold text-white transition-all"
            style={{ background: 'oklch(55% 0.15 240)', border: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
            Enable Notifications
          </button>
        </div>
      )}

      {/* Upgrade / Billing */}
      {tier === 'free' ? (
        <div className="rounded-[22px] border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--green-deep)' }}>Upgrade</div>
          <div className="mb-3 text-[16px] font-bold leading-snug" style={{ color: 'var(--ink)' }}>
            Unlock coaching for $14/month
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            {['Conflict prevention coach', 'Both parents included, one price'].map(f => (
              <div key={f} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--ink-soft)' }}>
                <svg width="13" height="13" fill="none" stroke="var(--green)" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                {f}
              </div>
            ))}
          </div>
          <Link href="/pricing" className="block w-full rounded-[12px] py-2.5 text-center text-[13px] font-bold no-underline transition-all"
            style={{ background: 'var(--green)', color: 'white' }}>
            See plans →
          </Link>
          <form onSubmit={redeemPromo} className="mt-3 flex gap-2">
            <input
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Promo code"
              className="pcp-input flex-1 font-mono text-[12px] font-bold uppercase tracking-widest"
            />
            <button type="submit" disabled={promoLoading || !promoCode.trim()}
              className="rounded-xl px-3 py-2 text-[12px] font-bold disabled:opacity-40"
              style={{ background: 'var(--green-tint)', color: 'var(--green-deep)', border: '1.5px solid var(--green-tint)', cursor: 'pointer', fontFamily: 'inherit' }}>
              {promoLoading ? '…' : 'Apply'}
            </button>
          </form>
          {promoMsg && (
            <p className="mt-1.5 text-center text-[12px]" style={{ color: promoMsg.ok ? 'var(--green-deep)' : '#f87171' }}>
              {promoMsg.text}
            </p>
          )}
        </div>
      ) : (
        <Widget>
          <WidgetHeader label="Billing" title={`${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`} />
          <p className="mb-4 text-[13px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            All features unlocked. Both parents included.
          </p>
          <button onClick={openPortal}
            className="pcp-btn-secondary w-full rounded-xl py-3 text-[13px] font-semibold">
            Manage Billing
          </button>
        </Widget>
      )}
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-[14px]" style={{ color: 'var(--ink-soft)' }}>
        Loading…
      </div>
    }>
      <DashboardInner />
    </Suspense>
  );
}
