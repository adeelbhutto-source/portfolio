/**
 * V3 shared UI primitives — used across all app pages.
 * Maps to the design handoff's: PageHero, Card, Btn, Pill, Avatar, SectionHeader
 */
import React from 'react';
import Link from 'next/link';

/* ─── PageHero mobile styles ────────────────────────────────────────────── */
const PAGE_HERO_STYLE = `
  @media (max-width: 640px) {
    .pcp-page-hero { padding: 20px 18px !important; }
    .pcp-page-hero h1 { font-size: 32px !important; }
    .pcp-page-hero-inner { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
  }
`;

/* ─── PageHero ─────────────────────────────────────────────────────────── */
export function PageHero({ eyebrow, title, subtitle, action, size = 'md' }: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md';
}) {
  const sm = size === 'sm';
  return (
    <>
      <style>{PAGE_HERO_STYLE}</style>
      <div className="pcp-page-hero" style={{ background: 'var(--green-deep)', color: '#E8E4D6', borderRadius: 22, padding: sm ? '24px 28px' : '32px 36px', position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 700px 400px at 100% 0%, rgba(200,216,184,.07), transparent 60%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: 0, left: 32, width: sm ? 60 : 80, height: 3, background: 'var(--clay)' }}/>
        <div className="pcp-page-hero-inner" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {eyebrow && <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>{eyebrow}</div>}
            <h1 className="pcp-display" style={{ marginTop: eyebrow ? 8 : 0, fontSize: sm ? 36 : 48, lineHeight: 1.02, letterSpacing: '-0.02em', color: '#F1ECDF' }}>{title}</h1>
            {subtitle && <p style={{ marginTop: 14, fontSize: sm ? 14 : 15.5, lineHeight: 1.5, color: '#9BAE9F', maxWidth: 700 }}>{subtitle}</p>}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      </div>
    </>
  );
}

/* ─── Card ─────────────────────────────────────────────────────────────── */
export function Card({ children, pad = 22, style }: {
  children: React.ReactNode;
  pad?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, padding: pad, overflow: 'hidden', minWidth: 0, ...style }}>
      {children}
    </div>
  );
}

/* ─── Btn ──────────────────────────────────────────────────────────────── */
export function Btn({ children, kind = 'primary', tone = 'light', icon, iconRight, big = false, danger = false, onClick, disabled, type = 'button', href }: {
  children?: React.ReactNode;
  kind?: 'primary' | 'outline' | 'ghost';
  tone?: 'light' | 'dark';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  big?: boolean;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  href?: string;
}) {
  const dark = tone === 'dark';
  let bg = '', color = '', border = 'none';
  if (danger)            { bg = 'var(--warn-tint)'; color = 'var(--warn)'; }
  else if (kind === 'primary' && dark) { bg = '#F1ECDF'; color = '#14301F'; }
  else if (kind === 'primary')         { bg = 'var(--green)'; color = '#F4EFE3'; }
  else if (kind === 'outline')         { bg = 'transparent'; color = 'var(--ink)'; border = '1px solid var(--border)'; }
  else if (kind === 'ghost' && dark)   { bg = 'transparent'; color = '#F1ECDF'; border = '1px solid rgba(241,236,223,.35)'; }
  else                                 { bg = 'transparent'; color = 'var(--ink)'; border = '1px solid var(--ink)'; }

  const style: React.CSSProperties = { background: bg, color, border, padding: big ? '13px 22px' : '10px 16px', fontSize: big ? 14 : 13.5, fontWeight: 600, letterSpacing: '0.005em', borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: 'var(--sans)' };

  if (href) return <Link href={href} style={{ ...style, textDecoration: 'none' }}>{icon}{children}{iconRight}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} style={style}>{icon}{children}{iconRight}</button>;
}

/* ─── Pill ─────────────────────────────────────────────────────────────── */
export function Pill({ children, tone = 'neutral', size = 'sm' }: {
  children: React.ReactNode;
  tone?: 'neutral' | 'green' | 'clay' | 'warn' | 'dark' | 'pink';
  size?: 'sm' | 'lg';
}) {
  const tones: Record<string, { bg: string; color: string }> = {
    neutral: { bg: 'var(--bg-deep)', color: 'var(--ink-soft)' },
    green:   { bg: 'var(--green-tint)', color: 'var(--green)' },
    clay:    { bg: 'var(--clay-tint)', color: 'var(--warn)' },
    warn:    { bg: 'var(--warn-tint)', color: 'var(--warn)' },
    dark:    { bg: 'rgba(255,255,255,.10)', color: '#E8E4D6' },
    pink:    { bg: '#F4D5DC', color: '#A93753' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: t.bg, color: t.color, padding: size === 'lg' ? '6px 12px' : '4px 10px', borderRadius: 999, fontFamily: 'var(--mono)', fontWeight: 600, fontSize: size === 'lg' ? 12 : 11, letterSpacing: '.06em' }}>
      {children}
    </span>
  );
}

/* ─── Avatar ───────────────────────────────────────────────────────────── */
export function Avatar({ name = '?', tone = 'pink', size = 28 }: {
  name?: string;
  tone?: 'pink' | 'green' | 'clay' | 'cream' | 'dark';
  size?: number;
}) {
  const tones: Record<string, { bg: string; fg: string }> = {
    pink:  { bg: '#D85C82', fg: '#F1ECDF' },
    green: { bg: 'var(--green)', fg: '#F1ECDF' },
    clay:  { bg: 'var(--clay)', fg: '#F1ECDF' },
    cream: { bg: '#E8DCC9', fg: 'var(--ink)' },
    dark:  { bg: '#1A2A20', fg: '#C8D8B8' },
  };
  const t = tones[tone] || tones.pink;
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: t.bg, color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: size * 0.42, fontWeight: 500, flexShrink: 0 }}>
      {(name || '?').slice(0, 1).toUpperCase()}
    </div>
  );
}

/* ─── SectionHeader ────────────────────────────────────────────────────── */
export function SectionHeader({ eyebrow, title, action }: {
  eyebrow?: string;
  title: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, gap: 16 }}>
      <div>
        {eyebrow && <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>{eyebrow}</div>}
        <div className="pcp-display" style={{ fontSize: 22, marginTop: eyebrow ? 4 : 0, letterSpacing: '-0.015em' }}>{title}</div>
      </div>
      {action}
    </div>
  );
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
export const Icon = {
  plus:     (s=14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  check:    (s=14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5 6 11l5.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x:        (s=14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  arrow:    (s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  download: (s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 3v8m0 0L4.5 7.5M8 11l3.5-3.5M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  upload:   (s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 11V3m0 0L4.5 6.5M8 3l3.5 3.5M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search:   (s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  send:     (s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M14 2 7 9M14 2l-4.5 12-2.5-5L2 6l12-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  spark:    (s=14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M7 1.5v2.8M7 9.7v2.8M1.5 7h2.8M9.7 7h2.8M3.2 3.2 5 5M9 9l1.8 1.8M3.2 10.8 5 9M9 5l1.8-1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  shield:   (s=18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2 3 4.5v6c0 4 3 6.6 7 7.5 4-.9 7-3.5 7-7.5v-6L10 2Z" stroke="currentColor" strokeWidth="1.4"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  children: (s=18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="13.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M12 16c0-2 1.5-3.2 3.5-3.2s2.5 1 2.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  lock:     (s=18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3.5" y="9" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.4"/></svg>,
  pulse:    (s=18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M2 10h3l2-5 3 10 3-7 2 2h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  briefcase:(s=18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="6" width="14" height="10" rx="1.4" stroke="currentColor" strokeWidth="1.4"/><path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6" stroke="currentColor" strokeWidth="1.4"/></svg>,
  video:    (s=18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="11" height="10" rx="1.4" stroke="currentColor" strokeWidth="1.4"/><path d="m13 10 5-3v6l-5-3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  phone:    (s=18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M4 4c0-1 .8-1.5 1.5-1.5h2L9 6 7 7.5c.8 2 2.5 3.7 4.5 4.5L13 10l3.5 1.5v2c0 .7-.5 1.5-1.5 1.5C8 15 4 11 4 4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
};
