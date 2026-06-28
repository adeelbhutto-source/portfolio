import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PeaceCoParent vs OurFamilyWizard — Full Comparison 2026',
  description: 'Compare PeaceCoParent and OurFamilyWizard side by side. coaching, pricing, features, and more.',
};

const FEATURES = [
  { f: 'Monthly price (both parents)',  us: { v: '$14 total', hi: true },   them: { v: '$25–50 total', neg: true } },
  { f: 'message coaching',           us: { v: '8 modes + full rewrite', hi: true }, them: { v: 'ToneMeter score only', neg: true } },
  { f: 'session memory across sessions',     us: { v: 'Yes — remembers past conflicts', hi: true }, them: { v: 'No — starts fresh', neg: true } },
  { f: 'Peace Score (0–100)',           us: { v: 'Yes — weekly trend chart', hi: true }, them: { v: 'No', neg: true } },
  { f: 'Escalation risk per message',   us: { v: 'Yes — 0–10 score, color coded', hi: true }, them: { v: 'No', neg: true } },
  { f: 'Attorney / mediator portal',    us: { v: 'Yes — with Peace Score', hi: true }, them: { v: 'Basic read access', mute: true } },
  { f: 'Shared calendar',               us: { v: 'Yes + Google Calendar sync', hi: true }, them: { v: 'Yes', pos: true } },
  { f: 'Expense tracking',              us: { v: 'Yes + receipt upload', hi: true }, them: { v: 'Yes + OFWpay', pos: true } },
  { f: 'Timestamped PDF export',        us: { v: 'Yes', pos: true },        them: { v: 'Yes', pos: true } },
  { f: 'Secure video calls',            us: { v: 'Yes — logged and private', hi: true }, them: { v: 'Yes', pos: true } },
  { f: 'Long-term court track record',  us: { v: 'Building fast', mute: true }, them: { v: '20+ years established', pos: true } },
  { f: 'One price covers both parents', us: { v: 'Yes', hi: true },         them: { v: 'No — per-parent billing', neg: true } },
];

type CellData = { v: string; hi?: boolean; pos?: boolean; neg?: boolean; mute?: boolean };

function CheckIcon() { return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5 6 11l5.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function XIcon() { return <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function ArrowIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

function Cell({ data }: { data: CellData }) {
  if (data.hi)   return <div className="cmp-table-cell" style={{ padding: '18px 22px', background: 'var(--green-tint)', color: 'var(--green-deep)', fontSize: 14.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ color: 'var(--green)' }}><CheckIcon/></span>{data.v}</div>;
  if (data.pos)  return <div className="cmp-table-cell" style={{ padding: '18px 22px', fontSize: 14.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ color: 'var(--green-mute)' }}><CheckIcon/></span>{data.v}</div>;
  if (data.neg)  return <div className="cmp-table-cell" style={{ padding: '18px 22px', fontSize: 14.5, color: 'var(--warn)', display: 'flex', alignItems: 'center', gap: 10 }}><XIcon/>{data.v}</div>;
  return <div className="cmp-table-cell" style={{ padding: '18px 22px', fontSize: 14.5, color: 'var(--ink-mute)' }}>{data.v}</div>;
}

export default function ComparePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--sans)', color: 'var(--ink)' }}>
      <style>{`
        @media (max-width: 640px) {
          .cmp-nav { padding: 16px 18px !important; }
          .cmp-hero-content { padding: 28px 18px 0 !important; }
          .cmp-hero-nav-links { display: none !important; }
          .cmp-price-cards { padding: 0 14px !important; margin-top: -20px !important; grid-template-columns: 1fr !important; }
          .cmp-price-cards > div:nth-child(2) { display: none !important; }
          .cmp-table-section { padding: 40px 14px 40px !important; }
          .cmp-table-header { grid-template-columns: 1fr 1fr 1fr !important; }
          .cmp-table-row { grid-template-columns: 1fr 1fr 1fr !important; }
          .cmp-table-cell { padding: 10px 10px !important; font-size: 12px !important; }
          .cmp-table-row > div:first-child { font-size: 12px !important; padding: 10px 10px !important; }
          .cmp-switch-section { padding: 30px 14px 40px !important; }
          .cmp-switch-box { padding: 28px 18px !important; }
          .cmp-switch-step { grid-template-columns: 48px 1fr !important; gap: 12px !important; }
          .cmp-honest-section { padding: 0 14px 40px !important; }
          .cmp-honest-box { padding: 24px 18px !important; }
          .cmp-cta-section { padding: 60px 18px !important; }
          .cmp-footer { padding: 20px 18px !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ background: 'var(--green-deep)', color: '#E8E4D6', position: 'relative', overflow: 'hidden', paddingBottom: 96 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 1100px 600px at 50% 100%,rgba(232,153,104,.10),transparent 60%)' }}/>
        <div style={{ position: 'relative' }}>
          <div className="cmp-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 56px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--green-deep)', lineHeight: 1 }}>P</span>
              </div>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: '#F1ECDF' }}>PeaceCoParent</span>
            </Link>
            <div className="cmp-hero-nav-links" style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
              <Link href="/pricing" style={{ color: 'rgba(248,244,238,.7)', textDecoration: 'none' }}>Pricing</Link>
              <Link href="/blog" style={{ color: 'rgba(248,244,238,.7)', textDecoration: 'none' }}>Blog</Link>
            </div>
            <Link href="/register">
              <button style={{ background: '#F1ECDF', color: 'var(--green-deep)', border: 'none', borderRadius: 999, padding: '11px 20px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>Start free trial</button>
            </Link>
          </div>
          <div className="cmp-hero-content" style={{ padding: '48px 56px 0', textAlign: 'center', maxWidth: 960, margin: '0 auto' }}>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>Full comparison · 2026</div>
            <h1 className="pcp-display" style={{ marginTop: 22, fontSize: 'clamp(48px,7vw,92px)', lineHeight: 0.96, letterSpacing: '-0.035em', color: '#F1ECDF' }}>
              PeaceCoParent <em style={{ color: 'var(--clay-soft)' }}>vs</em><br/>OurFamilyWizard
            </h1>
            <p style={{ marginTop: 28, fontSize: 19, lineHeight: 1.5, color: '#C8C2B0', maxWidth: 680, margin: '28px auto 0', fontWeight: 300 }}>
              OurFamilyWizard built the category over 20 years.{' '}
              <em style={{ fontFamily: 'var(--serif)', color: '#F1ECDF' }}>PeaceCoParent is what comes next</em>{' '}
              — a message coach that catches conflict before it leaves your hand, at half the price.
            </p>
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/register">
                <button style={{ background: '#F1ECDF', color: 'var(--green-deep)', border: 'none', borderRadius: 999, padding: '15px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Try PeaceCoParent free <ArrowIcon/>
                </button>
              </Link>
            </div>
            <div style={{ marginTop: 24, fontFamily: 'var(--mono)', fontSize: 11.5, color: '#8AA092', letterSpacing: '.08em' }}>NO CARD · BOTH PARENTS · 30-DAY MONEY-BACK</div>
          </div>
        </div>
      </div>

      {/* Price cards */}
      <div className="cmp-price-cards" style={{ padding: '0 56px', marginTop: -40, position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 80px 1fr', alignItems: 'stretch' }}>
          <div style={{ background: 'var(--green-deep)', color: '#E8E4D6', borderRadius: 22, padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, background: 'radial-gradient(circle,rgba(232,153,104,.18),transparent 60%)' }}/>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>PeaceCoParent</div>
            <div className="pcp-display" style={{ fontSize: 'clamp(56px,8vw,96px)', letterSpacing: '-0.04em', color: '#F1ECDF', lineHeight: 1, marginTop: 8 }}>$14<span style={{ fontSize: 16, color: '#9BAE9F', fontFamily: 'var(--sans)' }}>/month</span></div>
            <div style={{ marginTop: 10, fontSize: 14, color: '#C8C2B0' }}><em style={{ fontFamily: 'var(--serif)', color: 'var(--clay-soft)' }}>One subscription</em> covers <strong style={{ color: '#F1ECDF' }}>both parents</strong></div>
            <div style={{ marginTop: 18, padding: '8px 12px', background: 'rgba(232,153,104,.18)', color: 'var(--clay-soft)', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '.06em' }}>~50% LESS THAN OFW</div>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 1, flex: 1, background: 'var(--border)' }}/>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--green)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 700, boxShadow: '0 0 0 6px var(--bg),0 0 0 7px var(--border)' }}>VS</div>
            <div style={{ width: 1, flex: 1, background: 'var(--border)' }}/>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 22, padding: '36px 32px' }}>
            <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)' }}>OurFamilyWizard</div>
            <div className="pcp-display" style={{ fontSize: 'clamp(56px,8vw,96px)', letterSpacing: '-0.04em', color: 'var(--ink-soft)', lineHeight: 1, marginTop: 8 }}>$25<span style={{ color: 'var(--ink-mute)' }}>–50</span><span style={{ fontSize: 16, color: 'var(--ink-mute)', fontFamily: 'var(--sans)' }}>/month</span></div>
            <div style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-soft)' }}>Both parents combined — <strong style={{ color: 'var(--ink)' }}>billed separately</strong></div>
            <div style={{ marginTop: 18, padding: '8px 12px', background: 'var(--warn-tint)', color: 'var(--warn)', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '.06em' }}><XIcon/> TWO SUBSCRIPTIONS</div>
          </div>
        </div>
      </div>

      {/* Feature table */}
      <div className="cmp-table-section" style={{ padding: '80px 56px 80px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="pcp-eyebrow" style={{ color: 'var(--clay)', marginBottom: 14 }}>Side by side</div>
          <h2 className="pcp-display" style={{ fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.025em' }}>Every feature, head to head.</h2>
          <div style={{ marginTop: 32, border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', background: 'var(--card)' }}>
            <div className="cmp-table-header" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', background: 'var(--green-deep)' }}>
              <div className="pcp-eyebrow" style={{ padding: '18px 22px', color: '#9BAE9F' }}>Feature</div>
              <div className="pcp-eyebrow" style={{ padding: '18px 22px', color: 'var(--clay-soft)' }}>PeaceCoParent</div>
              <div className="pcp-eyebrow" style={{ padding: '18px 22px', color: '#9BAE9F' }}>OurFamilyWizard</div>
            </div>
            {FEATURES.map((row, i) => (
              <div key={i} className="cmp-table-row" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--card)' : 'var(--bg-soft)' }}>
                <div style={{ padding: '18px 22px', fontSize: 14.5, color: 'var(--ink)', fontWeight: 500, display: 'flex', alignItems: 'center' }}>{row.f}</div>
                <Cell data={row.us}/><Cell data={row.them}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Switching */}
      <div className="cmp-switch-section" style={{ padding: '60px 56px 80px', background: 'var(--bg)' }}>
        <div className="cmp-switch-box" style={{ maxWidth: 1080, margin: '0 auto', background: 'var(--green-tint)', borderRadius: 28, padding: '48px 56px', border: '1px solid #BCC9AC' }}>
          <div className="pcp-eyebrow" style={{ color: 'var(--green)' }}>Switching from OurFamilyWizard?</div>
          <h2 className="pcp-display" style={{ fontSize: 'clamp(32px,4vw,56px)', lineHeight: 1.02, letterSpacing: '-0.025em', marginTop: 14, color: 'var(--green-deep)' }}>It takes about ten minutes.</h2>
          <div style={{ marginTop: 36, display: 'grid', gap: 0 }}>
            {([['Export your OFW data','In OurFamilyWizard, go to Settings → Export. Download your message history and expense records as PDF.'],['Create your PeaceCoParent account','Sign up free at peacecoparent.com. No credit card. Add your kids and set your custody schedule — takes about 2 minutes.'],['Invite your co-parent','Send your 8-character invite code. They create a free account and join your family. One subscription covers both of you.'],['Upload your existing documents','In Documents, upload the exported OFW PDFs. Everything is preserved, timestamped, and searchable.']] as [string,string][]).map(([t,d],i)=>(
              <div key={i} className="cmp-switch-step" style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 20, alignItems: 'flex-start', padding: '20px 0', borderTop: i > 0 ? '1px solid rgba(46,89,68,.18)' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--green)', color: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 22 }}>{i+1}</div>
                <div><div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--green-deep)', letterSpacing: '-0.01em' }}>{t}</div><div style={{ marginTop: 4, fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{d}</div></div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href="/register"><button style={{ background: 'var(--green)', color: '#F1ECDF', border: 'none', borderRadius: 999, padding: '15px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Start switching — it&apos;s free <ArrowIcon/></button></Link>
          </div>
        </div>
      </div>

      {/* Honest */}
      <div className="cmp-honest-section" style={{ padding: '0 56px 80px', background: 'var(--bg-soft)', borderTop: '1px solid var(--border)', paddingTop: 60 }}>
        <div className="cmp-honest-box" style={{ maxWidth: 920, margin: '0 auto', background: 'var(--card)', borderRadius: 22, padding: '40px 48px', border: '1px solid var(--border)' }}>
          <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)' }}>Being honest</div>
          <h3 className="pcp-display" style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: 12 }}>When OurFamilyWizard is actually the right choice.</h3>
          <p style={{ marginTop: 24, fontSize: 16.5, lineHeight: 1.6, color: 'var(--ink-soft)' }}>If a judge has <strong style={{ color: 'var(--ink)' }}>specifically court-ordered OurFamilyWizard by name</strong> in your case, use OurFamilyWizard. That is not something we can change.</p>
          <p style={{ marginTop: 16, fontSize: 16.5, lineHeight: 1.6, color: 'var(--ink-soft)' }}>For everyone else, PeaceCoParent offers more capability, better coaching, and a fairer price — and your records are still court-ready if you ever need them.</p>
        </div>
      </div>

      {/* Final CTA */}
      <div className="cmp-cta-section" style={{ background: 'var(--green-deep)', color: '#F1ECDF', padding: '100px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 900px 500px at 50% 100%,rgba(232,153,104,.18),transparent 60%)' }}/>
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          <h2 className="pcp-display" style={{ fontSize: 'clamp(40px,6vw,80px)', lineHeight: 0.98, letterSpacing: '-0.035em', color: '#F1ECDF' }}>One plan. Both parents.<br/><em style={{ color: 'var(--clay-soft)' }}>Half the price.</em></h2>
          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/register"><button style={{ background: '#F1ECDF', color: 'var(--green-deep)', border: 'none', borderRadius: 999, padding: '15px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Start free <ArrowIcon/></button></Link>
          </div>
          <div style={{ marginTop: 20, fontFamily: 'var(--mono)', fontSize: 12, color: '#9BAE9F', letterSpacing: '.08em' }}>CANCEL ANYTIME · 30-DAY MONEY-BACK GUARANTEE</div>
          <div style={{ marginTop: 48, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 22px', background: 'rgba(232,153,104,.10)', border: '1px dashed var(--clay)', borderRadius: 999, color: '#E8E4D6', fontSize: 13.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>Switching from OFW? Use code</span>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13, padding: '4px 10px', background: 'var(--clay)', color: '#F1ECDF', borderRadius: 999, letterSpacing: '.06em' }}>OFW30FREE</span>
            <span style={{ color: '#9BAE9F' }}>· 30 days free Professional</span>
          </div>
        </div>
      </div>

      <div className="cmp-footer" style={{ background: 'var(--bg-deep)', borderTop: '1px solid var(--border)', padding: '28px 56px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-mute)', letterSpacing: '.04em' }}>
        <div>© 2026 PeaceCoParent</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/pricing" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Pricing</Link>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Home</Link>
        </div>
      </div>
    </div>
  );
}
