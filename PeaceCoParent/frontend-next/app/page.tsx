'use client';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────────────────────── */
type SampleMessage = { flag: string; draft: string; rewrite: string; time: string; pattern: string };
type Tweak = { headline: string; sentTone: 'green' | 'warm' | 'cool'; showStamps: boolean; showFlagChip: boolean; heroExample: number; pricingEmphasis: 'both-parents' | 'half-price' };

/* ─── Data ──────────────────────────────────────────────────────────────── */
const SAMPLE_MESSAGES: SampleMessage[] = [
  { flag: 'Blame · absolutes', draft: 'You ALWAYS show up late. The kids noticed AGAIN. This is on you and you know it.', rewrite: 'Pickup was 20 minutes late today and the kids were expecting you at 4. Could we agree on a 10-minute buffer rule going forward?', time: '11:47 PM', pattern: 'blame · absolutes' },
  { flag: 'Personal attack · guilt-loading', draft: "If you actually cared about her you wouldn't have skipped the recital. She cried in the car.", rewrite: "She was disappointed not to see you at the recital. I'd like to share the school calendar so we can both plan around things like this.", time: '10:02 PM', pattern: 'guilt-loading' },
  { flag: 'Stonewalling · escalates conflict', draft: "I'm not paying for any of this. Figure it out yourself. I'm done.", rewrite: "The dental bill is more than I expected. Can we look at it together this week and split it the way our agreement says?", time: '7:14 AM', pattern: 'stonewalling · contempt' },
  { flag: 'Threat language · custody risk', draft: "Don't bring HER around my kid. EVER. I'm serious.", rewrite: "I'd like to talk about how and when new partners get introduced to the kids. Can we set a time this week?", time: '6:48 PM', pattern: 'threat · ultimatum' },
];

const FAQS = [
  { q: 'Does my co-parent need to use it too?', a: 'No. You can use PeaceCoParent alone to keep your own records clean, get coaching on your drafts, and have court-ready documentation — even if your co-parent refuses to join. It works one-sided.' },
  { q: 'What if they refuse to use it?', a: 'PeaceCoParent still works as a one-sided tool. The coach catches what YOU send, your records stay clean, and your future self has the receipts.' },
  { q: 'Will my messages really stay private?', a: "Your drafts never leave the device in plain form. Stored messages are end-to-end encrypted. Only you and your co-parent can read your threads." },
  { q: 'Can I cancel anytime?', a: 'Yes. No card needed for the trial. You can export everything to PDF before you go.' },
  { q: 'How does the coach work, technically?', a: 'Before you send, the draft is scanned for patterns that escalate conflict — blame, absolutes, threats, guilt-loading. You see the flag AND a calmer rewrite. You decide.' },
  { q: 'Is it admissible in court?', a: 'We provide court-ready PDF exports of every conversation, with timestamps and unedited originals. Lawyers and judges use them.' },
];

type Headline = { eyebrow: string; pre: string; suf: string; em: string; sub: string };
const HEADLINES: Record<string, Headline> = {
  'before-you-send-it': {
    eyebrow: 'The same message · two outcomes',
    pre: 'Before', suf: 'you', em: 'send it.',
    sub: "Other apps save the message you'll regret. We catch it before you send it.",
  },
};

const TWEAKS: Tweak = {
  headline: 'before-you-send-it',
  sentTone: 'green',
  showStamps: true,
  showFlagChip: true,
  heroExample: 0,
  pricingEmphasis: 'both-parents',
};

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const ArrowIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SparkIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5v3.2M8 11.3v3.2M1.5 8h3.2M11.3 8h3.2M3.4 3.4l2.3 2.3M10.3 10.3l2.3 2.3M3.4 12.6l2.3-2.3M10.3 5.7l2.3-2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const CheckIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7.5 6 11l5.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const XIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const PlusIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const CalIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="3" y="4.5" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M3 8.5h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const PhoneIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M4 4c0-1 .8-1.5 1.5-1.5h2L9 6 7 7.5c.8 2 2.5 3.7 4.5 4.5L13 10l3.5 1.5v2c0 .7-.5 1.5-1.5 1.5C8 15 4 11 4 4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);
const DocIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M5 2.5h7l4 4V17a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 5 17V3a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M12 2.5V7h4M7.5 10.5h6M7.5 13.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const LockIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="3.5" y="9" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

/* ─── Logo ──────────────────────────────────────────────────────────────── */
function PCPLogo({ tone = 'dark', size = 22 }: { tone?: 'dark' | 'light'; size?: number }) {
  const iconBg = tone === 'dark' ? 'var(--green)' : '#F1ECDF';
  const iconFg = tone === 'dark' ? '#F1ECDF' : 'var(--green-deep)';
  const textColor = tone === 'dark' ? 'var(--ink)' : '#F1ECDF';
  const iconSize = Math.round(size * 2);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: textColor }}>
      <div style={{ width: iconSize, height: iconSize, borderRadius: Math.round(iconSize * 0.28), background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: Math.round(iconSize * 0.58), color: iconFg, fontWeight: 400, lineHeight: 1 }}>P</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: 'var(--sans)', fontSize: size * 0.82, fontWeight: 700, letterSpacing: '-0.02em', color: textColor }}>PeaceCoParent</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: size * 0.5, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: textColor, opacity: 0.5, marginTop: 2 }}>Calm co-parenting</span>
      </div>
    </div>
  );
}

/* ─── Nav ───────────────────────────────────────────────────────────────── */
function PCPNav({ scheme = 'light' }: { scheme?: 'light' | 'dark' }) {
  const dark = scheme === 'dark';
  const linkStyle: React.CSSProperties = { opacity: 0.8, textDecoration: 'none', color: 'inherit' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', color: dark ? '#F1ECDF' : 'var(--ink)', position: 'relative', zIndex: 5 }}>
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <PCPLogo tone={dark ? 'light' : 'dark'} size={22}/>
      </Link>
      <div className="pcp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, fontWeight: 500 }}>
        <a href="#how-it-works" style={linkStyle}>How it works</a>
        <Link href="/pricing" style={linkStyle}>Pricing</Link>
        <Link href="/compare" style={linkStyle}>Compare</Link>
        <a href="#faq" style={linkStyle}>FAQ</a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/login" className="pcp-nav-signin" style={{ fontSize: 14, fontWeight: 500, opacity: 0.85, textDecoration: 'none', color: 'inherit' }}>Sign in</Link>
        <Link href="/register">
          <button style={{ background: dark ? '#F1ECDF' : 'var(--green)', color: dark ? 'var(--green-deep)' : '#F4EFE3', border: 'none', padding: '11px 18px', borderRadius: 999, fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>
            Start free trial
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ─── CTA Button ────────────────────────────────────────────────────────── */
function CTABtn({ children, kind = 'primary', tone = 'light', icon, big = false, href = '/register' }: {
  children: React.ReactNode; kind?: 'primary' | 'ghost'; tone?: 'light' | 'dark'; icon?: React.ReactNode; big?: boolean; href?: string;
}) {
  const dark = tone === 'dark';
  const primary = kind === 'primary';
  const pad = big ? '15px 24px' : '11px 18px';
  const fs = big ? 15 : 13.5;
  let bg = '', color = '', border = 'none';
  if (primary && dark)  { bg = '#F1ECDF'; color = '#14301F'; }
  else if (primary)     { bg = 'var(--clay)'; color = '#F4EFE3'; }
  else if (dark)        { bg = 'transparent'; color = '#F1ECDF'; border = '1px solid rgba(241,236,223,.35)'; }
  else                  { bg = 'transparent'; color = 'var(--ink)'; border = '1px solid var(--ink)'; }
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <button style={{ background: bg, color, border, padding: pad, fontSize: fs, fontWeight: 600, letterSpacing: '0.005em', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: big ? 10 : 8, cursor: 'pointer', fontFamily: 'inherit' }}>
        {children}{icon}
      </button>
    </Link>
  );
}

/* ─── MessageDuet ───────────────────────────────────────────────────────── */
function MessageDuet({ draft, rewrite, flag, time = '11:47 PM', size = 'lg', showStamps = true, showFlag = true, sentTone = 'green' }: {
  draft: string; rewrite: string; flag: string; time?: string; size?: 'lg' | 'md'; showStamps?: boolean; showFlag?: boolean; sentTone?: 'green' | 'warm' | 'cool';
}) {
  const isLg = size === 'lg';
  const sentMap = {
    green: { bg: 'var(--green-tint)', border: '#BCC9AC', stamp: 'var(--green)', text: 'var(--green-deep)', avatar: 'var(--green)', avatarFg: '#F1ECDF', dash: '#BCC9AC' },
    warm:  { bg: '#F2E0CC', border: '#E0C8A8', stamp: 'var(--clay)', text: '#5A3E2A', avatar: 'var(--clay)', avatarFg: '#F1ECDF', dash: '#E0C8A8' },
    cool:  { bg: '#D8E0E0', border: '#B8C5C5', stamp: '#3A5560', text: '#1F353D', avatar: '#3A5560', avatarFg: '#F1ECDF', dash: '#B8C5C5' },
  };
  const s = sentMap[sentTone];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', alignItems: 'stretch' }}>
      {/* NOT SENT */}
      <div style={{ background: '#FFFEFA', border: '1px solid var(--border)', borderRadius: 18, padding: isLg ? '24px 24px 20px' : '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
        {showStamps && (
          <div style={{ position: 'absolute', top: 16, right: 16, transform: 'rotate(-6deg)', padding: '4px 10px', border: '1.5px solid var(--warn)', color: 'var(--warn)', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', borderRadius: 3, opacity: 0.85 }}>
            NOT SENT
          </div>
        )}
        <div className="pcp-eyebrow" style={{ color: 'var(--warn)', fontSize: 10.5 }}>What you almost sent</div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: '#E8DCC9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12, color: 'var(--ink)' }}>Y</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}><span style={{ fontWeight: 600, color: 'var(--ink)' }}>You</span><span style={{ color: 'var(--ink-mute)' }}> · {time}</span></div>
        </div>
        <p style={{ marginTop: 14, fontSize: isLg ? 17 : 15, lineHeight: 1.5, color: '#7A4A2A', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>"{draft}"</p>
        {showFlag && flag && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--warn)', letterSpacing: '.05em' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--warn)', display: 'inline-block' }}/>{flag}
          </div>
        )}
      </div>

      {/* PAUSE */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 1, flex: 1, background: 'var(--border)' }}/>
        <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--green)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px var(--bg), 0 0 0 7px var(--border)' }}>
          <SparkIcon size={18}/>
        </div>
        <div style={{ width: 1, flex: 1, background: 'var(--border)' }}/>
        <div style={{ position: 'absolute', bottom: -4, fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--green)', letterSpacing: '.1em', whiteSpace: 'nowrap', padding: '2px 6px', background: 'var(--bg)' }}>PAUSE</div>
      </div>

      {/* SENT */}
      <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 18, padding: isLg ? '24px 24px 20px' : '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
        {showStamps && (
          <div style={{ position: 'absolute', top: 16, right: 16, transform: 'rotate(4deg)', padding: '4px 10px', border: `1.5px solid ${s.stamp}`, color: s.stamp, fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', borderRadius: 3, background: 'rgba(255,255,250,.4)' }}>
            SENT
          </div>
        )}
        <div className="pcp-eyebrow" style={{ color: s.stamp, fontSize: 10.5 }}>What you sent instead</div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: s.avatar, color: s.avatarFg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12 }}>Y</div>
          <div style={{ fontSize: 13, color: s.text }}><span style={{ fontWeight: 600 }}>You</span><span style={{ opacity: 0.65 }}> · {time}</span></div>
        </div>
        <p style={{ marginTop: 14, fontSize: isLg ? 17 : 15, lineHeight: 1.55, color: s.text }}>{rewrite}</p>
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px dashed ${s.dash}`, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 11, color: s.stamp, letterSpacing: '.05em' }}>
          <CheckIcon size={12}/> Delivered
        </div>
      </div>
    </div>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────── */
function PCPFooter() {
  return (
    <div style={{ background: 'var(--bg-deep)', color: 'var(--ink-soft)', padding: '64px 0 28px', borderTop: '1px solid var(--border)' }}>
      <div className="pcp-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 380 }}>
            <PCPLogo tone="dark" size={24}/>
            <p style={{ marginTop: 18, fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.35, color: 'var(--ink)', fontStyle: 'italic' }}>
              "The best message in a co-parenting thread is the one nobody had to read."
            </p>
          </div>
          <div style={{ display: 'flex', gap: 64, fontSize: 13.5, flexWrap: 'wrap' }}>
            {([
              ['Product', [['Message Coach', '/coach'], ['Shared calendar', '/dashboard'], ['Expenses', '/expenses'], ['Reports', '/reports'], ['Peace Score', '/peace-score']]],
              ['Company', [['Pricing', '/pricing'], ['Compare', '/compare'], ['Blog', '/blog'], ['For lawyers', '/attorney']]],
              ['Legal', [['Privacy', '/privacy'], ['Terms', '/terms'], ['Sign in', '/login']]],
            ] as [string, [string, string][]][]).map(([h, items]) => (
              <div key={h}>
                <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)', marginBottom: 14 }}>{h}</div>
                {items.map(([label, href]) => (
                  <div key={label} style={{ marginBottom: 9, opacity: 0.85 }}>
                    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{label}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 56, paddingTop: 22, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11.5, opacity: 0.7, letterSpacing: '.04em', flexWrap: 'wrap', gap: 12 }}>
          <div>© 2026 PeaceCoParent — Built for the moment before send.</div>
          <div>Not a substitute for legal or therapeutic advice.</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
function Hero({ tweaks }: { tweaks: Tweak }) {
  const ex = SAMPLE_MESSAGES[tweaks.heroExample] || SAMPLE_MESSAGES[0];
  const h = HEADLINES[tweaks.headline] || HEADLINES['before-you-send-it'];
  return (
    <div style={{ background: 'var(--bg)', paddingBottom: 80, position: 'relative' }}>
      <div className="pcp-wrap">
        <PCPNav scheme="light"/>
        <div style={{ paddingTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 24, height: 1, background: 'var(--clay)', display: 'inline-block' }}/>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>{h.eyebrow}</div>
          </div>

          <h1 className="pcp-display" style={{ marginTop: 24, fontSize: 'clamp(64px, 11vw, 156px)', lineHeight: 0.9, letterSpacing: '-0.045em' }}>
            {h.pre}<br/>{h.suf} <em>{h.em}</em>
          </h1>

          <div style={{ marginTop: 56 }}>
            <MessageDuet draft={ex.draft} rewrite={ex.rewrite} flag={ex.flag} time={ex.time} size="lg" showStamps={tweaks.showStamps} showFlag={tweaks.showFlagChip} sentTone={tweaks.sentTone}/>
          </div>

          <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 60, alignItems: 'center' }}>
            <p style={{ fontSize: 23, lineHeight: 1.4, fontWeight: 300, color: 'var(--ink-soft)', maxWidth: 720 }}>{h.sub}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <CTABtn big icon={<ArrowIcon/>} href="/register">Start 7 days free</CTABtn>
                <CTABtn kind="ghost" big href="#how-it-works">See how it works</CTABtn>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-mute)', letterSpacing: '.06em' }}>
                NO CARD · BOTH PARENTS · 3-MIN SETUP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Trust Strip ───────────────────────────────────────────────────────── */
function TrustStrip() {
  return (
    <div style={{ background: 'var(--bg-deep)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '28px 0' }}>
      <div className="pcp-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'center' }}>
          {[
            { icon: '🔒', title: 'End-to-end encrypted', desc: "We can't read your messages. Neither can anyone else." },
            { icon: '⚖️', title: 'Court-ready exports', desc: 'Verified, timestamped logs your attorney can use.' },
            { icon: '📵', title: 'Private calling', desc: 'Call your co-parent without sharing your phone number.' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>{t.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{t.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 3, lineHeight: 1.45 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Premise ───────────────────────────────────────────────────────────── */
function Premise() {
  return (
    <div style={{ background: 'var(--green-deep)', color: '#E8E4D6', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 1100px 600px at 80% 30%, rgba(232,153,104,.10), transparent 60%)', pointerEvents: 'none' }}/>
      <div className="pcp-wrap" style={{ position: 'relative' }}>
        <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>The premise</div>
        <h2 className="pcp-display" style={{ marginTop: 14, fontSize: 'clamp(32px, 6vw, 78px)', lineHeight: 0.98, letterSpacing: '-0.03em', color: '#F1ECDF', maxWidth: 1100 }}>
          Other apps save the message you&apos;ll regret.<br/>
          <em style={{ color: 'var(--clay-soft)' }}>We help you not send it.</em>
        </h2>
        <div className="pcp-premise-grid" style={{ marginTop: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="pcp-premise-card" style={{ background: '#1A2A20', borderRadius: 22, padding: '36px 32px', border: '1px solid #2B3B30' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{ width: 52, height: 52, borderRadius: 999, background: '#3B5847', color: '#9BAE9F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 24, flexShrink: 0 }}>1</div>
              <div className="pcp-eyebrow" style={{ color: '#9BAE9F' }}>Message one — every other app</div>
            </div>
            <div className="pcp-display" style={{ fontSize: 'clamp(20px, 5vw, 28px)', lineHeight: 1.2, color: '#E8E4D6' }}>&ldquo;You ALWAYS show up late. The kids notice. This is on you.&rdquo;</div>
            <div style={{ marginTop: 16, fontSize: 14.5, lineHeight: 1.55, color: '#9BAE9F' }}>Sent. Stored. Timestamped. Surfaces six months later in a custody hearing, in front of a lawyer, on a screen you can&apos;t unsend.</div>
          </div>
          <div className="pcp-premise-card" style={{ background: '#234232', borderRadius: 22, padding: '36px 32px', border: '1px solid #C97042', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, background: 'radial-gradient(circle, rgba(232,153,104,.22), transparent 60%)' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, position: 'relative' }}>
              <div style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--clay)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 24, flexShrink: 0 }}>2</div>
              <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>Message two — PeaceCoParent</div>
            </div>
            <div className="pcp-display" style={{ fontSize: 'clamp(20px, 5vw, 28px)', lineHeight: 1.2, color: '#F1ECDF', position: 'relative' }}>&ldquo;Pickup was 20 minutes late today and the kids were waiting. Could we agree on a 10-minute buffer rule?&rdquo;</div>
            <div style={{ marginTop: 16, fontSize: 14.5, lineHeight: 1.55, color: '#C8C2B0', position: 'relative' }}>Calmer. Specific. Solvable. Sent on purpose. Read on purpose. Doesn&apos;t haunt anybody.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── More Duets ────────────────────────────────────────────────────────── */
function MoreDuets({ tweaks }: { tweaks: Tweak }) {
  const others = SAMPLE_MESSAGES.filter((_, i) => i !== tweaks.heroExample).slice(0, 3);
  return (
    <div id="how-it-works" style={{ background: 'var(--bg-soft)', padding: '120px 0', borderTop: '1px solid var(--border)' }}>
      <div className="pcp-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>More moments, both versions</div>
            <h2 className="pcp-display" style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.025em', marginTop: 14, maxWidth: 880 }}>
              Real messages real co-parents <em>didn&apos;t send.</em>
            </h2>
          </div>
          <div className="pcp-mono" style={{ color: 'var(--ink-mute)', maxWidth: 260, textAlign: 'right' }}>
            ANONYMIZED · NAMES + PRONOUNS CHANGED · SHARED WITH PERMISSION
          </div>
        </div>
        <div style={{ display: 'grid', gap: 32 }}>
          {others.map((m, i) => (
            <MessageDuet key={i} draft={m.draft} rewrite={m.rewrite} flag={m.flag} time={m.time} size="md" showStamps={tweaks.showStamps} showFlag={tweaks.showFlagChip} sentTone={tweaks.sentTone}/>
          ))}
        </div>
        <p style={{ marginTop: 56, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--ink-soft)', maxWidth: 760, lineHeight: 1.5 }}>
          You always get to send the original. About 7 in 10 people pick the rewrite anyway — usually because it&apos;s what they were trying to say in the first place.
        </p>
      </div>
    </div>
  );
}

/* ─── Why It Matters ────────────────────────────────────────────────────── */
function WhyItMatters() {
  return (
    <div style={{ background: 'var(--bg)', padding: '120px 0' }}>
      <div className="pcp-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 60, alignItems: 'center' }}>
          <div className="pcp-why-img" style={{ width: '100%', height: 540, borderRadius: 22, overflow: 'hidden', position: 'relative' }}>
            <img src="/photo-banner.jpg" alt="Parent with children" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '72% center' }}/>
          </div>
          <div>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Why the moment matters</div>
            <h3 className="pcp-display" style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: 0.98, letterSpacing: '-0.03em', marginTop: 16 }}>
              You can&apos;t unsend<br/>a message.<br/><em>But you can stop one.</em>
            </h3>
            <p style={{ marginTop: 24, fontSize: 18, lineHeight: 1.55, color: 'var(--ink-soft)', maxWidth: 540 }}>
              Kids don&apos;t need their parents to like each other. They need the messages between them not to set the temperature of the home. The coach makes that possible on the days when you really don&apos;t want to be the bigger person.
            </p>
            <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {([['11×', 'more cortisol in kids who hear conflict between parents'], ['~30s', 'is enough pause to step back from a regretted message'], ['6 mo', 'avg time between a hot message and seeing it in court']] as [string, string][]).map(([n, t], i) => (
                <div key={i} style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div className="pcp-display" style={{ fontSize: 46, lineHeight: 1, color: 'var(--green)', letterSpacing: '-0.03em' }}>{n}</div>
                  <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.4, color: 'var(--ink-soft)' }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Bento ─────────────────────────────────────────────────────────────── */
function Bento() {
  return (
    <div style={{ background: 'var(--bg-deep)', padding: '120px 0', borderTop: '1px solid var(--border)' }}>
      <div className="pcp-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Beyond the coach</div>
            <h2 className="pcp-display" style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.025em', marginTop: 14, maxWidth: 820 }}>
              And yes — it does the <em>filing-cabinet stuff,</em> too.
            </h2>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-soft)', maxWidth: 280, textAlign: 'right' }}>
            The coach is why you&apos;re here. Everything else is so you never have to think about it.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: 16 }}>
          {/* Big tile — calendar */}
          <div style={{ gridColumn: '1/2', gridRow: '1/3', background: 'var(--card)', borderRadius: 22, padding: 32, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalIcon/></div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 26, letterSpacing: '-0.01em' }}>Shared calendar</div>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--ink-soft)', maxWidth: 460 }}>Pickup, drop-off, dentist, away weekends. Conflict warnings before they happen.</p>
            {/* Calendar mock */}
            <div style={{ marginTop: 8, padding: 20, background: 'var(--bg-soft)', borderRadius: 16, border: '1px solid var(--border)', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>May 2026</div>
                <div className="pcp-mono" style={{ color: 'var(--ink-mute)' }}><span style={{ color: 'var(--green)' }}>● You</span> &nbsp;<span style={{ color: 'var(--clay)' }}>● Marcus</span></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', marginBottom: 8 }}>
                {['M','T','W','T','F','S','S'].map((d,i)=><div key={i} style={{ textAlign:'center' }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {([{n:6,p:'A'},{n:7,p:'A'},{n:8,p:'A'},{n:9,p:'B'},{n:10,p:'B',conflict:true},{n:11,p:'B'},{n:12,p:'B'},{n:13,p:'A'},{n:14,p:'A'},{n:15,p:'A'},{n:16,p:'B'},{n:17,p:'B'},{n:18,p:'B'},{n:19,p:'B'}] as {n:number;p:string;conflict?:boolean}[]).map((d,i)=>(
                  <div key={i} style={{ aspectRatio:'1',padding:6,borderRadius:8,background:d.p==='A'?'var(--green-tint)':'var(--clay-tint)',color:d.p==='A'?'var(--green)':'var(--warn)',fontFamily:'var(--mono)',fontSize:11,fontWeight:600,position:'relative',display:'flex',alignItems:'flex-start' }}>
                    {d.n}{d.conflict&&<span style={{ position:'absolute',bottom:4,right:4,width:6,height:6,borderRadius:999,background:'var(--warn)',display:'block' }}/>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12,padding:'10px 12px',background:'var(--warn-tint)',borderRadius:10,fontSize:12.5,color:'var(--warn)',display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ width:6,height:6,borderRadius:999,background:'var(--warn)',display:'inline-block' }}/>Conflict — May 10: pickup overlaps with school play (5pm)
              </div>
            </div>
          </div>
          {/* Small tiles */}
          {([
            { icon: <PhoneIcon/>, t: 'Private calling', d: "Call without sharing your number. We log the call, never the audio." },
            { icon: <span style={{ fontFamily:'var(--mono)',fontSize:14,fontWeight:600 }}>$</span>, t: 'Expenses + splits', d: "Receipts, IRS summaries, no 'I sent Venmo' debates." },
            { icon: <DocIcon/>, t: 'Court export', d: "A PDF your lawyer will actually thank you for." },
            { icon: <LockIcon/>, t: 'End-to-end private', d: "Drafts never leave your device. We can't read your threads." },
          ] as {icon:React.ReactNode;t:string;d:string}[]).map((it, i) => (
            <div key={i} style={{ background: 'var(--card)', borderRadius: 22, padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 230 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.icon}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '-0.01em' }}>{it.t}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{it.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Pricing ───────────────────────────────────────────────────────────── */
function Pricing({ tweaks }: { tweaks: Tweak }) {
  const emphHeadline = tweaks.pricingEmphasis === 'half-price'
    ? <><em>Half the price.</em> Twice the parents.</>
    : <>Both parents. <em>Half the price.</em></>;
  return (
    <div id="pricing" style={{ background: 'var(--bg-soft)', padding: '120px 0', borderTop: '1px solid var(--border)' }}>
      <div className="pcp-wrap">
        <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Pricing — one plan, both parents</div>
        <h2 className="pcp-display" style={{ fontSize: 'clamp(28px, 5vw, 64px)', lineHeight: 1.02, letterSpacing: '-0.025em', marginTop: 14, maxWidth: 1100 }}>{emphHeadline}</h2>
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 80px 1fr', alignItems: 'stretch' }}>
          {/* Others */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 22, padding: 36 }}>
            <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)' }}>OurFamilyWizard · TalkingParents</div>
            <div className="pcp-display" style={{ fontSize: 54, marginTop: 8, letterSpacing: '-0.03em', color: 'var(--ink-soft)' }}>$200<span style={{ fontSize: 22, color: 'var(--ink-mute)' }}>/yr · per parent</span></div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-mute)' }}>= $400/year per family</div>
            <div style={{ marginTop: 28, display: 'grid', gap: 10 }}>
              {([['Both parents charged separately', false], ['Coaching before send', false], ['Court-ready PDF exports', true], ['Shared calendar', true], ['Private calling', false]] as [string, boolean][]).map(([t, ok], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: 'var(--ink-soft)' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: ok ? 'var(--green-tint)' : 'var(--warn-tint)', color: ok ? 'var(--green)' : 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ok ? <CheckIcon size={11}/> : <XIcon size={10}/>}</span>{t}
                </div>
              ))}
            </div>
          </div>
          {/* Center */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 1, flex: 1, background: 'var(--border)' }}/>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--green)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px var(--bg-soft), 0 0 0 7px var(--border)' }}><ArrowIcon size={16}/></div>
            <div style={{ width: 1, flex: 1, background: 'var(--border)' }}/>
          </div>
          {/* Us */}
          <div style={{ background: 'var(--green-deep)', color: '#E8E4D6', borderRadius: 22, padding: 36, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, background: 'radial-gradient(circle, rgba(232,153,104,.16), transparent 60%)' }}/>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>PeaceCoParent — family plan</div>
            <div className="pcp-display" style={{ fontSize: 54, marginTop: 8, letterSpacing: '-0.03em', color: '#F1ECDF' }}>$14<span style={{ fontSize: 22, color: '#9BAE9F' }}>/mo · both parents</span></div>
            <div style={{ marginTop: 6, fontSize: 13, color: '#9BAE9F' }}>7-day free trial · no credit card needed</div>
            <div style={{ marginTop: 28, display: 'grid', gap: 10 }}>
              {['One subscription covers both parents', 'Message coach before every send', 'Court-ready PDF exports', 'Shared calendar + conflict warnings', 'Private calling (no number shared)', 'Pattern dashboard + weekly insight'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: '#E8E4D6' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--clay)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon size={11}/></span>{t}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <CTABtn tone="dark" big icon={<ArrowIcon/>} href="/register">Start 7-day free trial</CTABtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Social Proof ──────────────────────────────────────────────────────── */
function SocialProof() {
  const quotes = [
    { text: "I was skeptical my ex would even join. But I used it alone for 2 months and my records were so clean that my lawyer asked what app I was using.", name: 'Sarah M.', detail: 'Mother of two · Portland, OR' },
    { text: "The Coach caught a message I would have regretted sending at 11pm. I sent the rewrite instead. No fight. That alone was worth it.", name: 'James K.', detail: 'Father · Oslo, Norway' },
    { text: "I showed the PDF export to my mediator. She said it was the clearest communication record she'd seen in 15 years.", name: 'Anonymous', detail: 'User since 2025 · Pilot program' },
  ];
  return (
    <div style={{ background: 'var(--bg-soft)', padding: '100px 0', borderTop: '1px solid var(--border)' }}>
      <div className="pcp-wrap">
        <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>What people say</div>
        <h2 className="pcp-display" style={{ fontSize: 'clamp(28px, 4vw, 52px)', lineHeight: 1.02, letterSpacing: '-0.025em', marginTop: 14, maxWidth: 720 }}>
          Built for the <em>moment after the lawyer call.</em>
        </h2>
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {quotes.map((q, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.55, color: 'var(--ink)', fontStyle: 'italic' }}>
                &ldquo;{q.text}&rdquo;
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 16, flexShrink: 0 }}>
                  {q.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{q.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-mute)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>{q.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, padding: '24px 32px', background: 'var(--green-tint)', borderRadius: 16, border: '1px solid #BCC9AC', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 20, flexShrink: 0 }}>🔒</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--green-deep)' }}>Messages cannot be edited or deleted once sent.</div>
            <div style={{ fontSize: 13.5, color: 'var(--green-deep)', opacity: 0.75, marginTop: 2 }}>This ensures 100% record integrity — the same thread you see is the same thread a judge or mediator sees. No gaps, no edits, no way to manipulate the record.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────────── */
function FAQ() {
  return (
    <div id="faq" style={{ background: 'var(--bg)', padding: '120px 0' }}>
      <div className="pcp-wrap">
        <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Common questions</div>
        <h2 className="pcp-display" style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: 1.04, letterSpacing: '-0.02em', marginTop: 14 }}>
          Things people ask <em>before</em> they trust us.
        </h2>
        <div className="pcp-faq-grid" style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border)' }}>
          {FAQS.map((f, i) => (
            <div key={i} className="pcp-faq-item" style={{ padding: '28px 32px 28px 0', borderBottom: '1px solid var(--border)', borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none', paddingLeft: i % 2 === 1 ? 32 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{f.q}</div>
                <span style={{ color: 'var(--ink-mute)', flexShrink: 0 }}><PlusIcon size={14}/></span>
              </div>
              <div style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-soft)' }}>{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Final CTA ─────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <div style={{ background: 'var(--green-deep)', color: '#F1ECDF', padding: '140px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 1000px 500px at 50% 100%, rgba(232,153,104,.18), transparent 60%)' }}/>
      <div className="pcp-wrap" style={{ position: 'relative' }}>
        <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>The next message</div>
        <h2 className="pcp-display" style={{ marginTop: 18, fontSize: 'clamp(40px, 8vw, 108px)', lineHeight: 0.96, letterSpacing: '-0.04em', color: '#F1ECDF' }}>
          doesn&apos;t have to land<br/>like the <em style={{ color: 'var(--clay-soft)' }}>last one.</em>
        </h2>
        <div style={{ marginTop: 48, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <CTABtn tone="dark" big icon={<ArrowIcon/>} href="/register">Start 7-day free trial</CTABtn>
          <CTABtn tone="dark" kind="ghost" big href="/login">Sign in</CTABtn>
        </div>
        <div style={{ marginTop: 22, fontFamily: 'var(--mono)', fontSize: 12, color: '#9BAE9F', letterSpacing: '.08em' }}>
          NO CARD · BOTH PARENTS · CANCEL ANYTIME
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="pcp-page" style={{ fontFamily: 'var(--sans)' }}>
      {/* Sticky CTA bar — mobile only */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bg)', borderTop: '1px solid var(--border)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }} className="pcp-sticky-cta">
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--sans)' }}>
          <strong style={{ color: 'var(--ink)' }}>7 days free.</strong> No card needed.
        </div>
        <Link href="/register" style={{ textDecoration: 'none' }}>
          <button style={{ background: 'var(--clay)', color: '#F4EFE3', border: 'none', padding: '11px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            Start free →
          </button>
        </Link>
      </div>
      <style>{`
        @media (max-width: 768px) {
          /* Nav */
          .pcp-nav-links { display: none !important; }
          .pcp-nav-signin { display: none !important; }

          /* Section padding: 120px → 64px */
          div[style*="padding: 120px 0"],
          div[style*="padding: 140px 0"] { padding: 64px 0 !important; }

          /* WhyItMatters 2-col */
          div[style*="1fr 1.15fr"] { grid-template-columns: 1fr !important; }
          .pcp-why-img { height: 260px !important; }

          /* Stats 3-col → 1-col */
          div[style*="repeat(3,1fr)"],
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }

          /* Bento 3-col */
          div[style*="2fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
          }
          div[style*="2fr 1fr 1fr"] > div:first-child {
            grid-column: 1 !important;
            grid-row: auto !important;
            min-height: 300px !important;
          }

          /* FAQ 2-col */
          .pcp-faq-grid { grid-template-columns: 1fr !important; }
          .pcp-faq-item {
            border-right: none !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          /* Premise cards */
          .pcp-premise-grid {
            grid-template-columns: 1fr !important;
            margin-top: 36px !important;
          }
          .pcp-premise-card {
            padding: 24px 20px !important;
            border-radius: 16px !important;
          }

          /* Footer flex → stack */
          div[style*="justify-content: space-between"][style*="flex-wrap: wrap"] {
            flex-direction: column !important;
            gap: 32px !important;
          }

          /* Hero sub-grid 1.3fr 1fr → stack (catch-all for Hero bottom) */
          div[style*="1.3fr 1fr"] { grid-template-columns: 1fr !important; }

          /* Show sticky CTA on mobile, add bottom padding */
          .pcp-sticky-cta { display: flex !important; }
          .pcp-page { padding-bottom: 68px; }
        }

        @media (min-width: 769px) {
          .pcp-sticky-cta { display: none !important; }
        }

        @media (max-width: 480px) {
          /* Extra small: tighter section padding */
          div[style*="padding: 120px 0"],
          div[style*="padding: 140px 0"] { padding: 48px 0 !important; }
          div[style*="padding: 80px 0"] { padding: 40px 0 !important; }
        }
      `}</style>
      <Hero tweaks={TWEAKS}/>
      <TrustStrip/>
      <Premise/>
      <MoreDuets tweaks={TWEAKS}/>
      <WhyItMatters/>
      <Bento/>
      <SocialProof/>
      <Pricing tweaks={TWEAKS}/>
      <FAQ/>
      <FinalCTA/>
      <PCPFooter/>
    </div>
  );
}
