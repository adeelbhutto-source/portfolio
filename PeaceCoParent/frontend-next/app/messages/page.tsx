'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { fetchMessages, reviewMessage, sendMessage, markRead } from '@/api/messages';
import { apiFetch, apiFetchRaw } from '@/lib/api';
import type { Message, AiReviewResponse } from '@/types/shared';
import AppLayout from '@/components/AppLayout';
import { fmtTime, fmtDateCompact } from '@/lib/format';

const POLL_MS = 5000;

// ── Primitives ────────────────────────────────────────────────────────────────

// Renders [ATTACH:docId:filename] tags as clickable attachments in chat
function AttachmentBubble({ docId, fileName, isMe }: { docId: string; fileName: string; isMe: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isImage = /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(fileName);

  async function load() {
    if (url || loading || !docId) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ downloadUrl: string }>(`/documents/${docId}/download`);
      setUrl(data.downloadUrl);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <div
      onClick={load}
      style={{
        marginTop: 6,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${isMe ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`,
        background: isMe ? 'rgba(255,255,255,0.12)' : 'var(--bg)',
        cursor: url ? 'default' : 'pointer',
        maxWidth: 220,
      }}
    >
      {url && isImage ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={fileName} style={{ width: '100%', display: 'block', borderRadius: 10 }} />
        </a>
      ) : (
        <a
          href={url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={!url ? (ev) => { ev.preventDefault(); load(); } : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', textDecoration: 'none' }}
        >
          <svg width="14" height="14" fill="none" stroke={isMe ? 'rgba(255,255,255,0.8)' : 'var(--green)'} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
          <span style={{ fontSize: 12, color: isMe ? 'rgba(255,255,255,0.85)' : 'var(--ink)', fontWeight: 600 }}>
            {loading ? 'Loading…' : url ? fileName : `📎 ${fileName}`}
          </span>
        </a>
      )}
    </div>
  );
}

function AiBadge({ flag, reason }: { flag: string; reason: string | null }) {
  if (flag === 'ok') return null;
  const isWarn = flag === 'warning';
  return (
    <div style={{
      marginTop: 4,
      borderRadius: 20,
      padding: '2px 10px',
      fontSize: 11,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: isWarn ? 'rgba(251,146,60,0.12)' : 'rgba(239,68,68,0.12)',
      color: isWarn ? '#c2410c' : '#dc2626',
      border: `1px solid ${isWarn ? 'rgba(251,146,60,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }}>
      <span style={{ fontWeight: 700 }}>{isWarn ? 'coach:' : 'Blocked:'}</span> {reason}
    </div>
  );
}

function Banner({
  color, label, body, action, onDismiss,
}: {
  color: 'sky' | 'red';
  label: string;
  body: string;
  action?: { label: string; onClick: () => void };
  onDismiss: () => void;
}) {
  const isRed = color === 'red';
  return (
    <div style={{
      borderTop: `1px solid ${isRed ? 'rgba(239,68,68,0.25)' : 'rgba(251,146,60,0.25)'}`,
      background: isRed ? 'rgba(239,68,68,0.06)' : 'rgba(251,146,60,0.06)',
      padding: '10px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: 680, margin: '0 auto' }}>
        <span style={{
          flexShrink: 0,
          width: 22, height: 22,
          borderRadius: '50%',
          background: isRed ? 'rgba(239,68,68,0.15)' : 'rgba(251,146,60,0.15)',
          color: isRed ? '#dc2626' : '#c2410c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 900,
        }}>
          {isRed ? '!' : 'PC'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: isRed ? '#dc2626' : '#c2410c' }}>
            {label}
          </p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: isRed ? '#b91c1c' : '#9a3412' }}>
            {body}
          </p>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            style={{
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 700,
              color: isRed ? '#dc2626' : '#c2410c',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            {action.label}
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{
            flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1, padding: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Messages() {
  const { user, familyMember } = useAuth();
  const { isPaid } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<AiReviewResponse | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<{ reason: string; suggestion: string | null } | null>(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const myColor = familyMember?.color ?? '#6366f1';

  const load = useCallback(async () => {
    try {
      const msgs = await fetchMessages();
      setMessages(msgs);
      setLoadError('');
      msgs
        .filter((m) => m.senderId !== user?.id && !m.readAt)
        .forEach((m) => markRead(m.id).catch(() => {}));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Not in a family') || msg.includes('403')) {
        setLoadError('no-family');
      } else {
        console.error('[messages] load failed:', err);
        setLoadError('Could not load messages. Will retry automatically.');
      }
    }
  }, [user?.id]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Coaching review only for paid users — skip if message is attachment-only
  useEffect(() => {
    const textOnly = body.replace(/\[ATTACH:[^\]]+\]/g, '').trim();
    if (!isPaid || !textOnly || textOnly.length < 2) {
      setReview(null);
      setReviewError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setReviewing(true);
      setReviewError(null);
      try {
        const r = await reviewMessage(body);
        setReview(r);
      } catch (err: unknown) {
        setReview(null);
        setReviewError(err instanceof Error ? err.message : 'Coaching review unavailable');
      } finally {
        setReviewing(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [body, isPaid]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setError('');
    setBlocked(null);
    setSuggestion(null);
    setSending(true);
    try {
      const result = await sendMessage(body.trim());
      setMessages((prev) => [...prev, result.message]);
      setBody('');
      setReview(null);
      if (result.aiSuggestion) setSuggestion(result.aiSuggestion);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('blocked') || msg.includes('coach')) {
        setBlocked({ reason: msg, suggestion: null });
      } else {
        setError(msg || 'Failed to send');
      }
    } finally {
      setSending(false);
    }
  }

  const filteredMessages = search.trim()
    ? messages.filter(
        (m) =>
          m.body.toLowerCase().includes(search.toLowerCase()) ||
          m.senderName?.toLowerCase().includes(search.toLowerCase()),
      )
    : messages;

  type Group = { day: string; messages: Message[] };
  const groups: Group[] = [];
  for (const m of filteredMessages) {
    const day = fmtDateCompact(m.createdAt);
    if (!groups.length || groups[groups.length - 1].day !== day) {
      groups.push({ day, messages: [m] });
    } else {
      groups[groups.length - 1].messages.push(m);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'other');
      const res = await apiFetchRaw('/documents/upload', { method: 'POST', body: formData });
      const data = await res.json() as { documentId?: string; name?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'File upload failed. Try again.');
        return;
      }
      const fileName = data.name ?? file.name;
      const docId = data.documentId ?? '';
      // Embed attachment tag in message body — rendered inline in chat
      setBody(prev => prev + (prev ? '\n' : '') + `[ATTACH:${docId}:${fileName}]`);
    } catch {
      setError('File upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const isSendBlocked = false; // Users can always send — coach flags but never truly blocks

  // ── Derived: co-parent info from first non-me message ────────────────────
  const coParentMsg = messages.find((m) => m.senderId !== user?.id);
  const coParentName = coParentMsg?.senderName ?? 'Co-parent';
  const coParentColor = coParentMsg?.senderColor ?? 'var(--green)';

  return (
    <AppLayout noPadding>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          fontFamily: 'var(--serif)',
          fontSize: 20,
          color: 'var(--ink)',
        }}>
          Messages
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="/court-report"
            className="pcp-btn-secondary"
            style={{ borderRadius: 9999, fontSize: 13, padding: '6px 16px', textDecoration: 'none' }}
          >
            Export records
          </a>
        </div>
      </div>

      {loadError === 'no-family' && (
        <div style={{ padding: '12px 24px', background: 'var(--green-tint)', borderBottom: '1px solid #BCC9AC', fontSize: 13, color: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <span>You haven&apos;t invited your co-parent yet — messages will appear here once they join.</span>
          <Link href="/setup" style={{ fontWeight: 700, color: 'var(--green)', textDecoration: 'none', flexShrink: 0 }}>Invite co-parent →</Link>
        </div>
      )}
      {loadError && loadError !== 'no-family' && (
        <div style={{ padding: '8px 20px', background: 'oklch(96% 0.04 25)', borderBottom: '1px solid oklch(88% 0.06 25)', fontSize: 12, color: 'oklch(45% 0.18 25)' }}>
          {loadError}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .msg-col1, .msg-col3 { display: none !important; } }
        @media (max-width: 900px) { .msg-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .msg-height { height: calc(100vh - 176px) !important; } }
      `}</style>

      {/* ── 3-column layout ───────────────────────────────────────────────── */}
      <div className="msg-grid msg-height" style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr 280px',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden',
      }}>

        {/* ── Column 1: Thread list ────────────────────────────────────── */}
        <div className="msg-col1" style={{
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <svg
                width="14" height="14" fill="none" stroke="var(--ink-soft)" strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages…"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: 9999,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  padding: '7px 12px 7px 30px',
                  fontSize: 13,
                  color: 'var(--ink)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Thread items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Single active thread representing the family conversation */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px',
              background: 'var(--green-tint)',
              borderLeft: '3px solid var(--green)',
              cursor: 'pointer',
            }}>
              {/* Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: coParentColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--serif)',
              }}>
                {coParentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--sans)' }}>
                    {coParentName}
                  </span>
                  {messages.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--ink-soft)', flexShrink: 0, marginLeft: 6 }}>
                      {fmtTime(messages[messages.length - 1].createdAt)}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 12, color: 'var(--ink-soft)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginTop: 2,
                }}>
                  {messages.length > 0
                    ? messages[messages.length - 1].body
                    : 'No messages yet'}
                </div>
              </div>
              {/* Unread dot */}
              {messages.some((m) => m.senderId !== user?.id && !m.readAt) && (
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--green)', flexShrink: 0,
                }} />
              )}
            </div>

            {/* Empty state for thread list */}
            {messages.length === 0 && !search && (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green-tint)]">
                  <svg width="18" height="18" fill="none" stroke="var(--green)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <p className="text-[12px] text-[var(--ink-soft)]">No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Column 2: Chat area ──────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Chat header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 20px',
            background: 'var(--card)',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: coParentColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 15, fontWeight: 700,
              fontFamily: 'var(--serif)',
            }}>
              {coParentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--sans)' }}>
                {coParentName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" fill="none" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Tamper-proof · Timestamped
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>

            {groups.length === 0 && !search && (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--ink-soft)' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--green-tint)', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="24" height="24" fill="none" stroke="var(--green)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink)', margin: '0 0 6px' }}>
                  No messages yet
                </p>
                <p style={{ fontSize: 13, margin: 0, maxWidth: 260 }}>
                  Start drafting and reviewing messages today, even before your co-parent joins.
                </p>
              </div>
            )}

            {groups.length === 0 && search && (
              <div style={{ margin: 'auto', textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
                No messages found for &ldquo;{search}&rdquo;
              </div>
            )}

            {groups.map((g) => (
              <div key={g.day}>
                {/* Date divider */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  margin: '16px 0 12px',
                }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{
                    fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    {g.day}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                {g.messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                      }}>
                        {!isMe && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, marginBottom: 3,
                            color: m.senderColor ?? 'var(--green)',
                          }}>
                            {m.senderName}
                          </span>
                        )}
                        {/* Bubble */}
                        <div style={{
                          borderRadius: 18,
                          borderBottomRightRadius: isMe ? 4 : 18,
                          borderBottomLeftRadius: isMe ? 18 : 4,
                          padding: '10px 14px',
                          fontSize: 14,
                          lineHeight: 1.5,
                          background: isMe ? 'var(--green)' : 'var(--card)',
                          color: isMe ? '#fff' : 'var(--ink)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          boxShadow: isMe ? '0 2px 8px rgba(99,132,84,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
                          wordBreak: 'break-word',
                        }}>
                          {(() => {
                            const attachRegex = /\[ATTACH:([^:]+):([^\]]+)\]/g;
                            const parts: React.ReactNode[] = [];
                            let last = 0;
                            let match;
                            const body = m.body;
                            while ((match = attachRegex.exec(body)) !== null) {
                              if (match.index > last) {
                                parts.push(body.slice(last, match.index));
                              }
                              parts.push(
                                <AttachmentBubble key={match.index} docId={match[1]} fileName={match[2]} isMe={isMe} />
                              );
                              last = match.index + match[0].length;
                            }
                            if (last < body.length) parts.push(body.slice(last));
                            return parts.length > 0 ? parts : body;
                          })()}
                        </div>
                        {/* Meta row */}
                        <div style={{
                          display: 'flex',
                          flexDirection: isMe ? 'row-reverse' : 'row',
                          alignItems: 'center',
                          gap: 5,
                          marginTop: 3,
                        }}>
                          <span style={{ fontSize: 10, color: 'var(--ink-soft)' }}>
                            {fmtTime(m.createdAt)}
                          </span>
                          {isMe && m.readAt && (
                            <span style={{ fontSize: 10, color: 'var(--green)' }}>Read</span>
                          )}
                          {m.aiFlag && m.aiFlag !== 'ok' && (
                            <span style={{
                              borderRadius: 4,
                              padding: '1px 6px',
                              fontSize: 10,
                              background: m.aiFlag === 'warning' ? 'rgba(251,146,60,0.15)' : 'rgba(239,68,68,0.12)',
                              color: m.aiFlag === 'warning' ? '#c2410c' : '#dc2626',
                            }}>
                              {m.aiFlag === 'warning' ? 'flagged' : 'blocked'}
                            </span>
                          )}
                        </div>
                        {m.aiFlag && m.aiFlag !== 'ok' && m.aiFlagReason && (
                          <AiBadge flag={m.aiFlag} reason={m.aiFlagReason} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Coaching suggestion banner */}
          {suggestion && (
            <Banner
              color="sky"
              label="coach suggestion"
              body={suggestion}
              action={{ label: 'Use this', onClick: () => { setSuggestion(null); setBody(suggestion); } }}
              onDismiss={() => setSuggestion(null)}
            />
          )}

          {/* Blocked banner */}
          {blocked && (
            <Banner
              color="red"
              label="Message not sent"
              body={blocked.reason}
              onDismiss={() => setBlocked(null)}
            />
          )}

          {/* Compose area */}
          <div style={{
            background: 'var(--card)',
            borderTop: '1px solid var(--border)',
            padding: '10px 16px',
            flexShrink: 0,
          }}>
            {/* Coaching review feedback */}
            {body.length >= 15 && (
              <div style={{ marginBottom: 10 }}>
                {reviewing && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-soft)', margin: 0 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-soft)', display: 'inline-block' }} />
                    coach reviewing…
                  </p>
                )}
                {!reviewing && review?.flag === 'ok' && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#16a34a', margin: 0 }}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Looks good — clear and constructive
                  </p>
                )}
                {!reviewing && review?.flag === 'warning' && (
                  <div style={{
                    background: 'rgba(251,146,60,0.08)',
                    border: '1px solid rgba(251,146,60,0.25)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    marginBottom: 4,
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#c2410c', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                      ⚠ WARNING: High risk of conflict.
                    </p>
                    {review.suggestion && (
                      <>
                        <div style={{
                          background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)',
                          borderRadius: 7, padding: '8px 10px', fontSize: 13, color: '#7c2d12', marginBottom: 7,
                        }}>
                          &ldquo;{review.suggestion}&rdquo;
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button type="button" onClick={() => setBody(review.suggestion!)}
                            style={{ borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#fff', background: '#ea580c', border: 'none', cursor: 'pointer' }}>
                            Use rewrite →
                          </button>
                          <details style={{ display: 'inline' }}>
                            <summary style={{ fontSize: 11, color: '#9a3412', cursor: 'pointer', listStyle: 'none' }}>Show details</summary>
                            <p style={{ fontSize: 11, color: '#9a3412', marginTop: 4 }}>{review.reason}</p>
                          </details>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {!reviewing && review?.flag === 'blocked' && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    marginBottom: 4,
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#dc2626', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                      🚫 BLOCKED: Too aggressive to send.
                    </p>
                    {review.suggestion && (
                      <>
                        <div style={{
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: 7, padding: '8px 10px', fontSize: 13, color: '#7f1d1d', marginBottom: 7,
                        }}>
                          &ldquo;{review.suggestion}&rdquo;
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button type="button" onClick={() => setBody(review.suggestion!)}
                            style={{ borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#fff', background: '#dc2626', border: 'none', cursor: 'pointer' }}>
                            Use rewrite →
                          </button>
                          <details style={{ display: 'inline' }}>
                            <summary style={{ fontSize: 11, color: '#b91c1c', cursor: 'pointer', listStyle: 'none' }}>Show details</summary>
                            <p style={{ fontSize: 11, color: '#b91c1c', marginTop: 4 }}>{review.reason}</p>
                          </details>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {!reviewing && reviewError && !review && (
                  <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: 0 }}>Coaching review unavailable</p>
                )}
              </div>
            )}

            {error && (
              <p style={{ marginBottom: 8, fontSize: 12, color: '#dc2626' }}>{error}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              onChange={handleFileUpload}
            />
            <form onSubmit={handleSend}>
              {/* Textarea wrapper */}
              <div style={{
                background: 'var(--bg)',
                borderRadius: 14,
                border: `1.5px solid ${body ? 'var(--green)' : 'var(--border)'}`,
                padding: '10px 12px 8px',
                transition: 'border-color 0.15s',
              }}>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  aria-label="Message to co-parent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as unknown as React.FormEvent);
                    }
                  }}
                  rows={3}
                  placeholder={isPaid ? 'Type a message… Coach will review before sending' : 'Type a message…'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    resize: 'none',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: 14,
                    color: 'var(--ink)',
                    fontFamily: 'var(--sans)',
                    lineHeight: 1.5,
                  }}
                />
                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6 }}>
                  {/* Attach icon */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ background: 'none', border: 'none', cursor: uploading ? 'default' : 'pointer', padding: 2, color: uploading ? 'var(--green)' : 'var(--ink-soft)', display: 'flex', opacity: uploading ? 0.6 : 1 }}
                    title={uploading ? 'Uploading…' : 'Attach file'}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  {/* Coach hint */}
                  <span style={{ flex: 1, fontSize: 11, color: 'var(--ink-soft)' }}>
                    {isPaid
                      ? (reviewing ? 'Reviewing…' : body.length > 0 && body.length < 15 ? 'Keep typing…' : body.length >= 15 ? '' : 'Coach will review before sending')
                      : ''}
                  </span>
                  {/* Char count */}
                  <span style={{ fontSize: 10, color: body.length > 4800 ? '#dc2626' : 'var(--ink-soft)' }}>
                    {body.length}/5000
                  </span>
                  {/* Send */}
                  <button
                    type="submit"
                    disabled={sending || !body.trim() || isSendBlocked}
                    className="pcp-btn-primary"
                    style={{
                      borderRadius: 9999,
                      padding: '6px 18px',
                      fontSize: 13,
                      fontWeight: 700,
                      opacity: sending || !body.trim() || isSendBlocked ? 0.5 : 1,
                      cursor: sending || !body.trim() || isSendBlocked ? 'default' : 'pointer',
                      background: isSendBlocked ? 'rgba(239,68,68,0.5)' : undefined,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {sending ? '…' : 'Send'}
                  </button>
                </div>
              </div>
            </form>

            <p style={{ margin: '6px 0 0', fontSize: 10, color: 'var(--ink-soft)' }}>
              All messages are timestamped and tamper-evident. Cannot be deleted.
            </p>
          </div>
        </div>

        {/* ── Column 3: Coach panel ─────────────────────────────────── */}
        <div className="msg-col3" style={{
          background: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--green-tint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" fill="none" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Message Review</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Coach checks before you send</div>
            </div>
          </div>

          {/* Panel body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

            {/* Free users — upgrade prompt */}
            {!isPaid ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'var(--green-tint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <svg width="22" height="22" fill="none" stroke="var(--green)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)', margin: '0 0 8px' }}>
                  Message Review
                </p>
                <p style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 20px' }}>
                  Get real-time suggestions to keep messages calm, clear, and child-focused — included in the Personal plan.
                </p>
                <Link href="/pricing"
                  className="pcp-btn-primary"
                  style={{ borderRadius: 9999, fontSize: 13, padding: '8px 20px', display: 'inline-block', textDecoration: 'none' }}>
                  Upgrade — $14/month
                </Link>
                <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 10 }}>Both parents included</p>
              </div>
            ) : (
              <>
                {/* Empty state */}
                {!review && !reviewing && (
                  <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--ink-soft)' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'var(--green-tint)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}>
                      <svg width="22" height="22" fill="none" stroke="var(--green)" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink)', margin: '0 0 6px' }}>
                      Your Coach is ready
                    </p>
                    <p style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                      Start typing a message and the coach will review it before you send.
                    </p>
                  </div>
                )}

                {/* Analysing spinner */}
                {reviewing && (
                  <div style={{ textAlign: 'center', paddingTop: 40 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: '2px solid var(--green-tint)',
                      borderTopColor: 'var(--green)',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 12px',
                    }} />
                    <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>Analysing your message…</p>
                  </div>
                )}

                {/* Review results */}
                {!reviewing && review && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{
                      background: review.flag === 'blocked' ? 'rgba(239,68,68,0.07)' : review.flag === 'warning' ? 'rgba(251,146,60,0.07)' : 'var(--green-tint)',
                      border: `1px solid ${review.flag === 'blocked' ? 'rgba(239,68,68,0.2)' : review.flag === 'warning' ? 'rgba(251,146,60,0.2)' : 'var(--green-tint)'}`,
                      borderRadius: 10, padding: '10px 12px',
                    }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-soft)', margin: '0 0 5px' }}>
                        Your message
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--ink)', margin: 0, lineHeight: 1.45 }}>{body}</p>
                    </div>

                    {review.reason && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: review.flag === 'blocked' ? 'rgba(239,68,68,0.1)' : review.flag === 'warning' ? 'rgba(251,146,60,0.1)' : 'var(--green-tint)',
                        color: review.flag === 'blocked' ? '#dc2626' : review.flag === 'warning' ? '#c2410c' : 'var(--green-deep)',
                        borderRadius: 9999, padding: '4px 10px', fontSize: 12,
                      }}>
                        <span style={{ fontWeight: 700 }}>
                          {review.flag === 'blocked' ? 'Blocked' : review.flag === 'warning' ? 'Warning' : 'Looks good'}
                        </span>
                        {review.reason && <>{' · '}{review.reason}</>}
                      </div>
                    )}

                    {review.suggestion && (
                      <div style={{ background: 'var(--green-tint)', border: '1px solid var(--green-tint)', borderRadius: 10, padding: '10px 12px' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-deep)', margin: '0 0 5px' }}>
                          Suggested revision
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--ink)', margin: '0 0 10px', lineHeight: 1.45 }}>
                          &ldquo;{review.suggestion}&rdquo;
                        </p>
                        <button type="button" onClick={() => setBody(review.suggestion!)}
                          className="pcp-btn-primary" style={{ borderRadius: 9999, fontSize: 12, padding: '5px 14px' }}>
                          Use this version
                        </button>
                      </div>
                    )}

                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-soft)', margin: '0 0 6px' }}>
                        Peace score
                      </p>
                      <span style={{
                        fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1,
                        color: review.flag === 'ok' ? 'var(--green)' : review.flag === 'blocked' ? '#dc2626' : '#f97316',
                      }}>
                        {review.flag === 'ok' ? '100' : review.flag === 'blocked' ? '0' : '50'}
                      </span>
                      <div style={{ marginTop: 8, height: 6, borderRadius: 9999, background: 'var(--bg-deep)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 9999, transition: 'width 0.4s ease',
                          width: review.flag === 'ok' ? '100%' : review.flag === 'blocked' ? '0%' : '50%',
                          background: review.flag === 'ok' ? 'var(--green)' : review.flag === 'blocked' ? '#dc2626' : '#f97316',
                        }} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 5, marginBottom: 0 }}>
                        {review.flag === 'ok' ? 'Clear and constructive' : review.flag === 'blocked' ? 'Will be blocked' : 'Consider revising'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Spin keyframe — injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
