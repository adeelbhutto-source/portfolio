'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, SectionHeader, Icon } from '@/components/V3';
import { useToast } from '@/components/ui';
import { API_URL } from '@/lib/env';

const REPORT_FEATURES = [
  'All messages with timestamps',
  'All expenses with receipts',
  'Full calendar history',
  'Tamper-evident with digital audit trail',
  'Formatted for attorneys and mediators',
];

const REPORT_TYPES = [
  {
    id: 'full',
    label: 'Full Report',
    desc: 'All messages, expenses and calendar events',
    icon: (
      <svg width="20" height="20" fill="none" stroke="var(--green-deep)" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'messages',
    label: 'Messages Only',
    desc: 'Full message history with coach flags',
    icon: (
      <svg width="20" height="20" fill="none" stroke="oklch(52% 0.12 280)" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    id: 'expenses',
    label: 'Expenses Only',
    desc: 'All shared expenses with receipts',
    icon: (
      <svg width="20" height="20" fill="none" stroke="oklch(52% 0.12 75)" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
];

export default function CourtReport() {
  const { tier } = useSubscription();
  const isFree = tier === 'free';
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().split('T')[0];
  });
  const [end, setEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('full');
  const toast = useToast();

  async function handleGenerate() {
    if (start > end) {
      toast.error('Start date must be before end date');
      return;
    }
    setGenerating(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Not authenticated. Please log in again.');
      const params = new URLSearchParams({
        start: new Date(start + 'T00:00:00Z').toISOString(),
        end: new Date(end + 'T23:59:59Z').toISOString(),
        type: selectedType,
      });
      const res = await fetch(`${API_URL}/reports/court-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? 'Failed to generate report');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PeaceCoParent_Report_${start}_to_${end}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast.success('Report downloaded successfully.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <AppLayout>
      <style>{`
        @media (max-width: 640px) {
          .cr-banner   { flex-direction: column !important; align-items: flex-start !important; }
          .cr-types    { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <PageHero
        eyebrow="Court-ready documentation"
        title={<>Reports — <em>always ready.</em></>}
        subtitle="Every message, expense, and event is timestamped and tamper-evident. Export a clean, organised PDF whenever you need it — for mediation, your attorney, or your own records."
        action={<Btn kind="primary" tone="dark" icon={Icon.download(12)} onClick={handleGenerate} disabled={generating}>{generating ? 'Generating…' : 'Download latest'}</Btn>}
      />

      {/* Auto-prepared banner */}
      <div className="cr-banner" style={{ background: 'var(--green)', color: '#F1ECDF', borderRadius: 22, padding: '24px 28px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: '#1A2A20', color: '#C8D8B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>Auto-prepared report ready</div>
            <div style={{ fontSize: 13, color: '#C8C2B0', marginTop: 4 }}>Latest period · messages, expenses, calendar events</div>
          </div>
        </div>
        <Btn tone="dark" kind="primary" icon={Icon.download(13)} onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating…' : 'Download PDF'}
        </Btn>
      </div>

      {/* Free plan warning */}
      {isFree && (
        <div className="mb-4 flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'oklch(94% 0.05 75)', border: '1px solid oklch(88% 0.08 75)' }}>
          <svg width="16" height="16" fill="none" stroke="oklch(52% 0.12 75)" strokeWidth="2" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p className="text-[12px] font-semibold" style={{ color: 'oklch(42% 0.12 75)' }}>Free plan — PDF includes a watermark</p>
            <p className="mt-0.5 text-[12px]" style={{ color: 'oklch(52% 0.12 75)' }}>
              Upgrade to Personal for clean, watermark-free reports.{' '}
              <Link href="/pricing" className="font-semibold underline">Upgrade here</Link>
            </p>
          </div>
        </div>
      )}

      {/* Generate card */}
      <Card style={{ marginBottom: 18 }}>
        <SectionHeader eyebrow="Custom report" title="Generate a new export" />
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 720, marginBottom: 18 }}>
          Choose what to include and the date range. Download as a clean, timestamped PDF.
        </p>

        <div className="cr-types" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
          {REPORT_TYPES.map((rt) => (
            <button key={rt.id} onClick={() => setSelectedType(rt.id)}
              style={{ padding: 20, background: selectedType === rt.id ? 'var(--green-tint)' : 'var(--bg-soft)', border: selectedType === rt.id ? '2px solid var(--green)' : '1px solid var(--border)', borderRadius: 14, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: selectedType === rt.id ? 'var(--green)' : 'var(--bg-deep)', color: selectedType === rt.id ? '#F1ECDF' : 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                {rt.icon}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17, letterSpacing: '-0.005em' }}>{rt.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>{rt.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, alignItems: 'flex-end' }}>
          <div>
            <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)', marginBottom: 6 }}>From date</div>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="pcp-input" style={{ padding: '12px 14px', fontFamily: 'var(--mono)' }} />
          </div>
          <div>
            <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)', marginBottom: 6 }}>To date</div>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="pcp-input" style={{ padding: '12px 14px', fontFamily: 'var(--mono)' }} />
          </div>
          <Btn kind="primary" big icon={Icon.download(14)} onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Download PDF'}
          </Btn>
        </div>
      </Card>

      {/* What you'll get */}
      <Card>
        <SectionHeader eyebrow="In every report" title="What you'll get" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            'All messages, with timestamps + coach flag history',
            'All expenses with receipts (PDF-embedded)',
            'Full calendar history, conflicts noted',
            'Tamper-evident audit trail at the back',
            'Formatted for attorneys and mediators',
            'Peace Score summary + trend chart',
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icon.check(12)}
              </span>
              <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--clay-tint)', border: '1px solid #E8B898', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#7A2E1E' }}>
          <span style={{ color: 'var(--warn)', flexShrink: 0 }}>{Icon.spark(14)}</span>
          <span>PeaceCoParent provides organisational documentation tools only. Reports are not legal advice and aren&apos;t guaranteed to be accepted by any court or authority — consult a qualified attorney.</span>
        </div>
      </Card>
    </AppLayout>
  );
}
