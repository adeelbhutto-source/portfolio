'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { apiFetch } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, Pill, SectionHeader, Icon } from '@/components/V3';
import { fmtDate } from '@/lib/format';

type PeaceScoreData = {
  score: number | null;
  label: string;
  total: number;
  history: { week: string; score: number; sessions: number }[];
  keyFactors: { content: string; risk_score: number; created_at: string }[];
};

const SCORE_LABELS = [
  { min: 80, label: 'Peaceful', color: 'var(--green)', bg: 'var(--green-tint)', desc: 'Your communication is consistently calm and child-focused.' },
  { min: 60, label: 'Calm',     color: 'var(--green-deep)', bg: 'var(--green-tint)', desc: 'Generally positive with occasional friction.' },
  { min: 40, label: 'Neutral',  color: '#d97706', bg: 'oklch(96% 0.06 75)', desc: 'Some escalation present but manageable.' },
  { min: 20, label: 'Tense',    color: '#ea580c', bg: 'oklch(95% 0.05 35)', desc: 'Conflict patterns are showing up regularly.' },
  { min: 0,  label: 'High conflict', color: '#dc2626', bg: 'oklch(95% 0.04 20)', desc: 'Communication is frequently escalating.' },
];

function getScoreStyle(score: number) {
  return SCORE_LABELS.find(s => score >= s.min) ?? SCORE_LABELS[SCORE_LABELS.length - 1];
}

export default function PeaceScorePage() {
  const { tier, loading: tierLoading } = useSubscription();
  const [data, setData] = useState<PeaceScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tierLoading) return;
    if (tier === 'free') { setLoading(false); return; }
    apiFetch<PeaceScoreData>('/coaching/peace-score')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tier, tierLoading]);

  if (!tierLoading && tier === 'free') {
    return (
      <AppLayout>
        <div className="mx-auto max-w-[480px] py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'var(--green-tint)' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 36, color: 'var(--green-deep)', fontWeight: 400 }}>?</span>
          </div>
          <h2 className="mb-3 text-[24px]" style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
            Peace Score
          </h2>
          <p className="mb-6 text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            Peace Score tracks whether your co-parenting communication is improving over time. Available on the Personal plan.
          </p>
          <Link href="/pricing" className="pcp-btn-primary inline-block rounded-full px-8 py-3.5 text-[15px] font-semibold no-underline">
            Upgrade to Personal →
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <style>{`
        @media (max-width: 640px) {
          .ps-guide-row { grid-template-columns: 60px 1fr !important; gap: 10px !important; }
          .ps-guide-row > div:last-child { display: none !important; }
          .ps-factor-row { grid-template-columns: 1fr !important; gap: 6px !important; }
          .ps-factor-row > div:last-child { text-align: left !important; }
          .ps-score-big { padding: 22px 18px !important; }
          .ps-score-big .pcp-display { font-size: 56px !important; }
        }
      `}</style>
      <PageHero
        eyebrow="Communication health · last 30 days"
        title={<>How your <em>communication is going.</em></>}
        subtitle="A 0–100 number that summarises whether your co-parenting messages are getting calmer, or just quieter. Updates after every message and every coaching session."
      />

      {loading ? (
        <div className="flex flex-col gap-5">
          {[1,2,3].map(i => <div key={i} className="h-32 animate-pulse rounded-[22px]" style={{ background: 'var(--bg-deep)' }} />)}
        </div>
      ) : !data?.score ? (
        <Card style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 999, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
            </svg>
          </div>
          <div className="pcp-display" style={{ fontSize: 24 }}>Not enough data yet</div>
          <p style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-soft)', maxWidth: 400, margin: '10px auto 0' }}>
            Use the Message Coach or send messages to start building your Peace Score. You need at least 2 interactions.
          </p>
          <div style={{ marginTop: 20 }}>
            <Btn kind="primary" href="/coach">Open Coach</Btn>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Big score card */}
          {(() => {
            const scoreStyle = getScoreStyle(data.score);
            return (
              <div className="ps-score-big" style={{ background: 'var(--green-tint)', border: '1px solid #BCC9AC', borderRadius: 22, padding: '36px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 600px 300px at 50% 0%, rgba(46,89,68,.08), transparent 70%)', pointerEvents: 'none' }}/>
                <div className="pcp-eyebrow" style={{ color: 'var(--green)', position: 'relative' }}>Your Peace Score</div>
                <div className="pcp-display" style={{ fontSize: 80, color: 'var(--green-deep)', letterSpacing: '-0.05em', lineHeight: 1, marginTop: 12, position: 'relative' }}>{data.score}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--green-deep)', marginTop: 8, position: 'relative' }}>
                  {data.label}
                </div>
                <div style={{ fontSize: 14, color: 'var(--green-deep)', opacity: .75, marginTop: 10, position: 'relative' }}>
                  {scoreStyle.desc} Based on {data.total} interaction{data.total !== 1 ? 's' : ''} in the last 30 days.
                </div>
              </div>
            );
          })()}

          {/* Score guide */}
          <Card>
            <SectionHeader eyebrow="Score guide" title="What your score means" />
            <div style={{ display: 'grid', gap: 8 }}>
              {SCORE_LABELS.map((s, i) => {
                const range = s.min === 0 ? '0–19' : s.min === 20 ? '20–39' : s.min === 40 ? '40–59' : s.min === 60 ? '60–79' : '80–100';
                const isActive = data.score !== null && data.score >= s.min && (SCORE_LABELS[i-1]?.min ?? 101) > data.score;
                return (
                  <div key={s.label} className="ps-guide-row" style={{ display: 'grid', gridTemplateColumns: '90px 110px 1fr', gap: 16, padding: '10px 14px', background: isActive ? 'var(--green-tint)' : 'transparent', border: isActive ? '1px solid #BCC9AC' : '1px solid transparent', borderRadius: 10, alignItems: 'center' }}>
                    <div className="pcp-mono" style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{range}</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 17, letterSpacing: '-0.005em' }}>{s.label}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 8-week trend */}
          {data.history.length >= 2 && (
            <Card>
              <SectionHeader eyebrow="8-week trend" title="Where you've been"
                action={(() => {
                  const last = data.history[data.history.length - 1].score;
                  const prev = data.history[data.history.length - 2].score;
                  const diff = last - prev;
                  return <Pill tone={diff >= 0 ? 'green' : 'clay'}>{diff >= 0 ? '↑' : '↓'} {Math.abs(diff)} pts vs last week</Pill>;
                })()}
              />
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.history.length}, 1fr)`, gap: 14, alignItems: 'flex-end', height: 200, marginTop: 18 }}>
                {data.history.map((w, i) => {
                  const barH = Math.max(8, (w.score / 100) * 140);
                  const isLast = i === data.history.length - 1;
                  const scoreStyle = getScoreStyle(w.score);
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div className="pcp-display" style={{ fontSize: 18, color: isLast ? 'var(--green-deep)' : scoreStyle.color }}>{w.score}</div>
                      <div style={{ width: '100%', height: barH, background: isLast ? 'var(--green)' : scoreStyle.color, opacity: isLast ? 1 : 0.5, borderRadius: 8 }}/>
                      <div className="pcp-mono" style={{ fontSize: 9, color: 'var(--ink-mute)' }}>W{w.week}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* High-risk drafts */}
          {data.keyFactors.length > 0 && (
            <Card>
              <SectionHeader eyebrow="Caught — not sent" title="High-risk drafts the coach intercepted" />
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 720, marginBottom: 14 }}>
                These are your own drafts that the coach flagged. None of them were sent — the coach suggested a calmer rewrite instead.
              </p>
              <div style={{ display: 'grid', gap: 10 }}>
                {data.keyFactors.map((f, i) => (
                  <div key={i} className="ps-factor-row" style={{ display: 'grid', gridTemplateColumns: '90px 1fr 130px', gap: 16, alignItems: 'center', padding: '12px 14px', background: '#FBE8DC', borderRadius: 12, border: '1px solid var(--clay-tint)' }}>
                    <Pill tone="warn">RISK {f.risk_score}/10</Pill>
                    <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: '#7A2E1E' }}>&ldquo;{f.content.length > 80 ? f.content.slice(0, 80) + '…' : f.content}&rdquo;</div>
                    <div className="pcp-mono" style={{ color: 'var(--warn)', fontSize: 11, textAlign: 'right' }}>{fmtDate(f.created_at)}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* How it works */}
          <Card>
            <SectionHeader eyebrow="Method" title="How the score is calculated" />
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 880 }}>
              Each message — sent OR drafted — gets an <em style={{ fontFamily: 'var(--serif)' }}>escalation risk</em> score from 0 (calm) to 10 (highly aggressive).
              Your Peace Score is the inverse weekly average: a 0 risk = 100 score, a 5 risk = 50 score.
              The goal isn&apos;t a perfect 100 — it&apos;s a number that <em style={{ fontFamily: 'var(--serif)' }}>trends upward</em> over time.
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <Btn kind="primary" href="/coach">Open Coach</Btn>
              <Btn kind="outline" href="/messages">Open messages</Btn>
            </div>
          </Card>

        </div>
      )}
    </AppLayout>
  );
}
