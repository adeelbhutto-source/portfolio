'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { apiFetch } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, Pill, SectionHeader } from '@/components/V3';
import { fmtDate } from '@/lib/format';

type Role = 'user' | 'assistant';
type Msg = { role: Role; content: string };

type CoachMode = {
  label: string;
  icon: React.ReactNode;
  desc: string;
  prompt: string;
  placeholder: string;
};

const MODES: CoachMode[] = [
  {
    label: 'Calm Rewrite',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    desc: 'Reduce emotional tone',
    prompt: 'Please help me rewrite the following message to sound calmer, more factual, and child-focused. Here is my draft:\n\n',
    placeholder: 'Paste your draft message here…',
  },
  {
    label: 'Court-Safe',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    desc: 'Neutral & documentable',
    prompt: 'Please rewrite this message so it is clear, factual, and appropriate for documentation. Remove emotional language. Here is my draft:\n\n',
    placeholder: 'Paste the message you want to make more neutral…',
  },
  {
    label: 'Boundary',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    desc: 'Firm but calm limits',
    prompt: 'Help me communicate a clear, calm boundary around this situation without escalating the conflict. The situation is:\n\n',
    placeholder: 'Describe the boundary you need to set…',
  },
  {
    label: 'Apology',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
    desc: 'Sincere & appropriate',
    prompt: 'Help me write a sincere, child-focused apology for this situation:\n\n',
    placeholder: 'Describe what happened and what you want to apologize for…',
  },
  {
    label: 'Financial',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    desc: 'Expense disagreements',
    prompt: 'Help me respond to this expense disagreement in a calm, factual, and child-focused way. The situation is:\n\n',
    placeholder: 'Describe the expense disagreement…',
  },
  {
    label: 'Schedule change',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    desc: 'Resolve timing issues',
    prompt: 'Help me address this scheduling conflict calmly and propose a clear solution. The situation is:\n\n',
    placeholder: 'Describe the schedule conflict…',
  },
  {
    label: 'Medical',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    desc: 'Health coordination',
    prompt: 'Help me communicate about a medical situation in a clear, calm, child-focused way. The situation is:\n\n',
    placeholder: 'Describe the medical situation or disagreement…',
  },
  {
    label: 'New partner',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    desc: 'Sensitive introductions',
    prompt: 'Help me navigate this situation about a new partner in a sensitive, child-focused way. The situation is:\n\n',
    placeholder: 'Describe the situation around new partner introductions…',
  },
];

const STARTERS = [
  'Review this before I send — does it escalate?',
  'Rewrite this calmer and more factual',
  'My co-parent broke an agreement — respond?',
  'Write a child-focused pickup-change message',
  'Set a boundary without starting a fight',
  'Help me document this incident clearly and factually',
];

type HistoryMsg = { role: string; content: string; created_at: string };

function TypingDots() {
  return (
    <div className="flex items-center gap-[5px] px-3.5 py-2.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="inline-block h-[7px] w-[7px] animate-bounce rounded-full bg-[var(--green)]"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}


export default function AiCoach() {
  const { tier, loading: tierLoading } = useSubscription();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [riskScores, setRiskScores] = useState<(number | null)[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState<CoachMode | null>(null);
  const [showModeComposer, setShowModeComposer] = useState(false);
  const [showAllModes, setShowAllModes] = useState(false);
  const [history, setHistory] = useState<HistoryMsg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (tier === 'free' || tierLoading) return;
    apiFetch<{ messages: HistoryMsg[] }>('/coaching/history')
      .then(d => setHistory(d.messages))
      .catch(() => {});
  }, [tier, tierLoading]);

  // Hard paywall for free users — backend also enforces requireTier('personal')
  if (!tierLoading && tier === 'free') {
    return (
      <AppLayout>
        <div className="mx-auto max-w-[480px] py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'var(--green-tint)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01"/>
            </svg>
          </div>
          <h2 className="mb-3 text-[24px]" style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
            Message Coach
          </h2>
          <p className="mb-6 text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            The coach scans your drafts for escalation patterns — blame, threats, guilt-loading — and rewrites them calmer. Available on the Personal plan.
          </p>
          <Link href="/pricing" className="pcp-btn-primary inline-block rounded-full px-8 py-3.5 text-[15px] font-semibold no-underline">
            Upgrade to Personal →
          </Link>
          <p className="mt-3 text-[12px]" style={{ color: 'var(--ink-soft)' }}>$14/month · Both parents included · Cancel anytime</p>
        </div>
      </AppLayout>
    );
  }

  async function send(text: string, displayText?: string) {
    if (!text.trim() || loading) return;
    const now = Date.now();
    if (now - lastSentRef.current < 3000) return;
    lastSentRef.current = now;
    setError('');
    const userMsg: Msg = { role: 'user', content: displayText ?? text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    const apiMessages = [...messages, { role: 'user', content: text.trim() }];
    try {
      const { reply, riskScore } = await apiFetch<{ reply: string; riskScore: number | null }>('/coaching/message', {
        method: 'POST',
        body: JSON.stringify({ messages: apiMessages }),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setRiskScores((prev) => [...prev, riskScore]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  }

  function selectMode(mode: CoachMode) {
    setActiveMode(mode);
    setShowModeComposer(true);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function clearMode() {
    setActiveMode(null);
    setShowModeComposer(false);
    setInput('');
  }

  function handleModeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeMode) return;
    const combined = activeMode.prompt + input.trim();
    send(combined, input.trim());
    setActiveMode(null);
    setShowModeComposer(false);
  }

  // History items (user messages only)
  const historyItems = history.filter(m => m.role === 'user').slice(-5);

  return (
    <AppLayout>
      <div className="pb-8">

        <PageHero
          eyebrow="Conflict prevention · the moment before send"
          title={<>The <em>message coach.</em></>}
          subtitle="Paste, type, or pick a mode. The coach scans for absolutes, threats, guilt-loading and stonewalling — and offers a calmer rewrite that says the same thing. You always get to send the original."
        />

        {/* Main 2-column grid */}
        <style>{`
          @media (max-width: 768px) {
            .coach-layout { grid-template-columns: 1fr !important; }
            .coach-trust-strip { display: none !important; }
          }
        `}</style>
        <div className="coach-layout" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>

          {/* ── Left column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Chat card */}
            <Card pad={0}>
              {/* Mode chips */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                alignItems: 'center',
              }}>
                <span className="pcp-eyebrow" style={{ color: 'var(--ink-mute)', marginRight: 6 }}>Mode:</span>
                {MODES.slice(0, showAllModes ? undefined : 6).map((m) => {
                  const isActive = activeMode?.label === m.label;
                  return (
                    <span key={m.label} onClick={() => selectMode(m)} style={{
                      padding: '4px 10px', borderRadius: 999,
                      background: isActive ? 'var(--green)' : 'transparent',
                      color: isActive ? '#F1ECDF' : 'var(--ink-soft)',
                      border: isActive ? 'none' : '1px solid var(--border)',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {m.label}
                    </span>
                  );
                })}
                {!showAllModes && (
                  <span onClick={() => setShowAllModes(true)} style={{
                    padding: '4px 10px', borderRadius: 999, border: '1px dashed var(--border)',
                    fontSize: 12, color: 'var(--ink-mute)', cursor: 'pointer',
                  }}>+{MODES.length - 6} more</span>
                )}
                {messages.length > 0 && (
                  <button onClick={() => { setMessages([]); setRiskScores([]); setInput(''); }} style={{
                    marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'var(--sans)', padding: '2px 6px',
                  }}>
                    New chat
                  </button>
                )}
              </div>

              {/* Scrollable chat thread */}
              <div ref={chatContainerRef} style={{
                minHeight: 340, maxHeight: 520, overflowY: 'auto',
                padding: '18px 18px 8px',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                {messages.length === 0 && (
                  <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px', color: 'var(--ink-soft)' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'var(--green-tint)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5">
                        <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
                      </svg>
                    </div>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)', margin: '0 0 6px' }}>
                      PeaceCoach is ready
                    </p>
                    <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6, maxWidth: 300 }}>
                      Paste a draft to get a calmer rewrite, or ask anything about your co-parenting situation.
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  const riskScore = isUser ? (riskScores[Math.floor(i / 2)] ?? null) : null;
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      marginBottom: 10,
                    }}>
                      {!isUser && (
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--green-tint)', marginRight: 8, marginTop: 2,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
                          </svg>
                        </div>
                      )}
                      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4 }}>
                        <div style={{
                          borderRadius: 18,
                          borderBottomRightRadius: isUser ? 4 : 18,
                          borderBottomLeftRadius: isUser ? 18 : 4,
                          padding: '10px 14px',
                          fontSize: 14, lineHeight: 1.55,
                          background: isUser ? 'var(--green)' : 'var(--card)',
                          color: isUser ? '#fff' : 'var(--ink)',
                          border: isUser ? 'none' : '1px solid var(--border)',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                          {msg.content}
                        </div>
                        {riskScore !== null && (
                          <Pill tone={riskScore >= 7 ? 'warn' : riskScore >= 4 ? 'clay' : 'green'}>
                            RISK {riskScore}/10
                          </Pill>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--green-tint)', marginTop: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
                      </svg>
                    </div>
                    <div style={{ borderRadius: 18, borderBottomLeftRadius: 4, padding: '10px 14px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {error && (
                <div style={{ padding: '0 18px 8px', fontSize: 12, color: 'var(--warn)' }}>{error}</div>
              )}

              {/* Compose area */}
              <div style={{ borderTop: '1px solid var(--border-soft)', padding: '12px 16px' }}>
                {showModeComposer && activeMode ? (
                  <form onSubmit={handleModeSubmit}>
                    <p style={{
                      marginBottom: 8, padding: '8px 12px',
                      background: 'var(--bg)', borderRadius: 8,
                      borderLeft: '3px solid var(--green)',
                      fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5,
                    }}>
                      {activeMode.prompt.replace(/\n\n$/, '')}
                    </p>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleModeSubmit(e as unknown as React.FormEvent); } }}
                      placeholder={activeMode.placeholder}
                      rows={3}
                      className="pcp-input resize-none"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Btn kind="primary" type="submit" disabled={!input.trim() || loading}>
                        {loading ? 'Analyzing…' : `Get ${activeMode.label} →`}
                      </Btn>
                      <button type="button" onClick={clearMode} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--sans)',
                      }}>
                        ← Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                      rows={2}
                      placeholder="Paste a draft message or ask anything…"
                      disabled={loading}
                      className="pcp-input flex-1 resize-none"
                      style={{ flex: 1, opacity: loading ? 0.6 : 1, minHeight: 56 }}
                    />
                    <button
                      onClick={() => send(input)}
                      disabled={!input.trim() || loading}
                      style={{
                        borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 600,
                        color: 'white', background: 'var(--green)',
                        border: 'none', cursor: (!input.trim() || loading) ? 'default' : 'pointer',
                        opacity: (!input.trim() || loading) ? 0.45 : 1,
                        fontFamily: 'var(--sans)', flexShrink: 0, lineHeight: 1.4,
                      }}
                    >
                      {loading ? '…' : 'Send'}
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* History card */}
            <Card pad={0}>
              <div style={{ padding: '18px 22px 12px', borderBottom: '1px solid var(--border-soft)' }}>
                <SectionHeader
                  eyebrow="History"
                  title="Recent reviews"
                  action={<Btn kind="ghost">See all</Btn>}
                />
              </div>
              {historyItems.length > 0 ? (
                historyItems.map((item, i) => {
                  // Derive tone: pair with next assistant message from full history
                  const assistantAfter = history.slice(history.indexOf(item) + 1).find(m => m.role === 'assistant');
                  const hasFlag = assistantAfter?.content?.toLowerCase().includes('risk') || assistantAfter?.content?.toLowerCase().includes('flag');
                  const tone: 'green' | 'warn' | 'mute' = hasFlag ? 'warn' : item.content.length < 8 ? 'mute' : 'green';
                  const iconBg = tone === 'green' ? 'var(--green-tint)' : tone === 'warn' ? 'var(--warn-tint)' : 'var(--bg-soft)';
                  const iconColor = tone === 'green' ? 'var(--green)' : tone === 'warn' ? 'var(--warn)' : 'var(--ink-mute)';
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 22px',
                      borderTop: '1px solid var(--border-soft)',
                      fontSize: 13.5,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: iconBg,
                          color: iconColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                          </svg>
                        </span>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            &ldquo;{item.content.length > 50 ? item.content.slice(0, 50) + '…' : item.content}&rdquo;
                          </div>
                          <div className="pcp-mono" style={{ color: 'var(--ink-mute)', fontSize: 11 }}>{fmtDate(item.created_at)}</div>
                        </div>
                      </div>
                      <span style={{ color: 'var(--ink-mute)' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '20px 22px', borderTop: '1px solid var(--border-soft)', textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
                  No previous reviews yet. Start by typing a message above.
                </div>
              )}
            </Card>
          </div>

          {/* ── Right column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Dark green tips card */}
            <div style={{
              background: 'var(--green-deep)',
              color: '#E8E4D6',
              padding: 22,
              borderRadius: 18,
              border: '1px solid #2B3B30',
            }}>
              <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>Conflict prevention tips</div>
              <div style={{
                fontFamily: 'var(--serif)',
                fontSize: 22,
                marginTop: 6,
                color: '#F1ECDF',
                letterSpacing: '-0.01em',
              }}>
                Four habits that <em>change everything.</em>
              </div>
              <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
                {[
                  { n: 1, t: 'State facts, not feelings — describe what happened, not how it made you feel.' },
                  { n: 2, t: 'Use child-centric language: "What works best for the kids?" reframes the whole exchange.' },
                  { n: 3, t: 'Wait 30 minutes before sending any emotionally charged message.' },
                  { n: 4, t: 'Keep messages short. Long messages invite long arguments.' },
                ].map(tip => (
                  <div key={tip.n} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 12 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 999,
                      background: '#3B5847', color: '#C8D8B8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--serif)', fontSize: 13,
                      flexShrink: 0,
                    }}>{tip.n}</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#C8C2B0' }}>{tip.t}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick starts card */}
            <Card>
              <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Quick starts</div>
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                {STARTERS.slice(0, 5).map((q, i) => (
                  <div
                    key={i}
                    onClick={() => send(q)}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-soft)',
                      borderRadius: 10,
                      fontSize: 13,
                      color: 'var(--ink-soft)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green)';
                      (e.currentTarget as HTMLDivElement).style.color = 'var(--ink)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                      (e.currentTarget as HTMLDivElement).style.color = 'var(--ink-soft)';
                    }}
                  >
                    <span>{q}</span>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: 6 }}>
                      <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
              </div>
            </Card>

            {/* Slim trust strip */}
            <div className="coach-trust-strip" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              background: 'var(--bg)',
              borderRadius: 12,
              fontFamily: 'var(--mono)',
              fontSize: 10.5,
              color: 'var(--ink-mute)',
              letterSpacing: '.06em',
            }}>
              <span>8 MODES</span>
              <span>·</span>
              <span>ANY LANGUAGE</span>
              <span>·</span>
              <span>&lt;5s RESPONSE</span>
              <span>·</span>
              <span>NAMES ANONYMIZED</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
