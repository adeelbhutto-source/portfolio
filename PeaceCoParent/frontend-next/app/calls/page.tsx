'use client';
import { useState, useEffect, useRef } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { apiFetch } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, SectionHeader, Icon } from '@/components/V3';
import Link from 'next/link';

export default function CallsPage() {
  const { isPro } = useSubscription();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [calling, setCalling] = useState(false);
  const [callData, setCallData] = useState<{ roomUrl: string; token: string } | null>(null);
  const [error, setError] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    apiFetch<{ available: boolean }>('/calls/status')
      .then(d => setAvailable(d.available))
      .catch(() => setAvailable(false));
  }, []);

  async function startCall() {
    setCalling(true);
    setError('');
    try {
      const data = await apiFetch<{ roomUrl: string; token: string }>('/calls/start', { method: 'POST' });
      setCallData(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not start call');
    } finally {
      setCalling(false);
    }
  }

  async function endCall() {
    try { await apiFetch('/calls/end', { method: 'POST' }); } catch {}
    setCallData(null);
  }

  return (
    <AppLayout>
      <style>{`
        @media (max-width: 640px) {
          .calls-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <PageHero
        eyebrow="Private calling"
        title={<>Talk without <em>sharing your number.</em></>}
        subtitle="Audio or video. We log the call (date, length, who initiated) so it counts as documentation. We never record the audio — that's between you."
        action={isPro && available ? <Btn kind="primary" tone="dark" icon={Icon.video(14)} onClick={startCall} disabled={calling}>{calling ? 'Starting…' : 'Start a call'}</Btn> : undefined}
      />

      {/* Upgrade gate */}
      {!isPro && (
        <div className="calls-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <Card style={{ padding: 36, textAlign: 'center', minHeight: 380 }}>
            <div style={{ width: 84, height: 84, borderRadius: 999, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              {Icon.video(36)}
            </div>
            <div className="pcp-display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>
              Professional plan <em>required.</em>
            </div>
            <p style={{ marginTop: 12, fontSize: 14.5, color: 'var(--ink-soft)', maxWidth: 420, margin: '12px auto 0' }}>
              Secure video and audio calls are included in the Professional plan. Your co-parent gets access too.
            </p>
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
              <Btn kind="primary" big href="/pricing?plan=professional">Upgrade to Professional</Btn>
            </div>
          </Card>
          <Card style={{ background: 'var(--green-tint)', border: '1px solid #BCC9AC' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--green)' }}>{Icon.shield(20)}</span>
              <div style={{ fontSize: 13.5, color: 'var(--green-deep)', lineHeight: 1.55 }}>
                <b style={{ fontWeight: 700 }}>What gets logged.</b> Date, time, length, who initiated, who joined.<br/>
                <b style={{ fontWeight: 700 }}>What doesn&apos;t.</b> The audio or video itself — only that it happened.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Daily.co not configured */}
      {isPro && available === false && (
        <div className="mb-4 flex items-start gap-3 rounded-[16px] px-5 py-4" style={{ background: 'oklch(94% 0.05 75)', border: '1px solid oklch(88% 0.08 75)' }}>
          <svg width="18" height="18" fill="none" stroke="oklch(52% 0.12 75)" strokeWidth="2" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'oklch(42% 0.12 75)' }}>Video calls temporarily unavailable</p>
            <p className="mt-0.5 text-[12px]" style={{ color: 'oklch(52% 0.12 75)' }}>
              We are experiencing a technical issue. Please try again later or contact hello@peacecoparent.com.
            </p>
          </div>
        </div>
      )}

      {/* Active call */}
      {callData && (
        <div className="mb-6 overflow-hidden rounded-[22px] border" style={{ borderColor: 'var(--border)' }}>
          <iframe
            ref={iframeRef}
            title="Video call with co-parent"
            src={callData.token ? `${callData.roomUrl}?token=${callData.token}` : callData.roomUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            style={{ width: '100%', height: '600px', border: 'none' }}
          />
          <div className="flex justify-center p-4" style={{ background: 'var(--card)' }}>
            <button onClick={endCall} className="rounded-full bg-red-500 px-8 py-3 text-[15px] font-bold text-white">End Call</button>
          </div>
        </div>
      )}

      {/* Start call — two column layout */}
      {isPro && available && !callData && (
        <div className="calls-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <Card style={{ padding: 36, textAlign: 'center', minHeight: 380 }}>
            <div style={{ width: 84, height: 84, borderRadius: 999, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              {Icon.video(36)}
            </div>
            <div className="pcp-display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>
              Call <em>your co-parent.</em>
            </div>
            <p style={{ marginTop: 12, fontSize: 14.5, color: 'var(--ink-soft)', maxWidth: 420, margin: '12px auto 0' }}>
              Start a private video or audio call. Your numbers stay hidden. They&apos;ll receive a notification to join.
            </p>
            {error && <p className="mt-4 text-[14px]" style={{ color: 'var(--warn)' }}>{error}</p>}
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <Btn kind="primary" big icon={Icon.video(14)} onClick={startCall} disabled={calling}>
                {calling ? 'Starting…' : 'Start video call'}
              </Btn>
              <Btn kind="outline" big onClick={startCall} disabled={calling}>Audio only</Btn>
            </div>
            <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '.06em' }}>
              TIMESTAMPED · PRIVATE · DOCUMENTED
            </div>
          </Card>

          <Card pad={0}>
            <div style={{ padding: '18px 22px 12px' }}>
              <SectionHeader eyebrow="Last 30 days" title="Call history" />
            </div>
            <div style={{ padding: '0 22px 18px', display: 'grid', gap: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No calls yet. Start your first call above.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Privacy note */}
      {isPro && (
        <div style={{ marginTop: 18 }}>
          <Card style={{ background: 'var(--green-tint)', border: '1px solid #BCC9AC' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--green)' }}>{Icon.shield(20)}</span>
              <div style={{ fontSize: 13.5, color: 'var(--green-deep)', lineHeight: 1.55 }}>
                <b style={{ fontWeight: 700 }}>What gets logged.</b> Date, time, length, who initiated, who joined.{' '}
                <b style={{ fontWeight: 700 }}>What doesn&apos;t.</b> The audio or video itself. You&apos;ll never hear your own call played back in court — only that it happened.
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
