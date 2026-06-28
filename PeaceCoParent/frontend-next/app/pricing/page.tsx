'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSubscription, type Tier } from '@/hooks/useSubscription';
import { apiFetch } from '@/lib/api';

const PLANS = [
  {
    id: 'free' as Tier, name: 'Free', price: '$0', priceSub: 'forever',
    features: [['Messaging + calendar', true], ['3 expense requests/month', true], ['Child profiles', true], ['Basic documentation', true], ['Message Coach', false], ['Unlimited expenses', false], ['Activity reports', false]],
    cta: 'Current plan', featured: false,
  },
  {
    id: 'personal' as Tier, name: 'Personal', price: '$14', priceSub: 'per month · both parents',
    tag: 'Most popular',
    features: [['Everything in Free', true], ['Message Coach', true], ['Unlimited expenses', true], ['Timestamped activity reports', true], ['Google Calendar sync', true], ['Conflict trend dashboard', true], ['Attorney + mediator access', false]],
    cta: 'Get Personal', featured: true,
  },
  {
    id: 'professional' as Tier, name: 'Professional', price: '$39', priceSub: 'per month · both parents',
    features: [['Everything in Personal', true], ['Attorney + mediator access', true], ['Unlimited activity reports', true], ['Priority support', true], ['Dedicated onboarding', true], ['Phone support', true]],
    cta: 'Get Professional', featured: false,
  },
];

const FAQS = [
  ['Do both parents need to pay?', "No. One subscription covers both parents — always. You sign up, and you invite your co-parent with an 8-character code. They create a free account and they're in."],
  ['Can I cancel anytime?', 'Yes. No card needed for the trial. You can export everything to PDF before you go. 30-day money-back on paid plans.'],
  ['Can I share records with my attorney?', "Yes — on Professional. They get read-only access with a one-click join. Available on Free and Personal plans only as PDF exports."],
  ['What payment methods do you accept?', 'All major credit and debit cards via Stripe. Apple Pay and Google Pay on web.'],
  ['What if my co-parent refuses to use it?', "The coach still catches what YOU send, your records stay clean, and your future self has the receipts. It works one-sided."],
  ['Is there a free trial?', '7 days, no card required. You can use every Personal feature, and your data is preserved if you upgrade or downgrade.'],
];

function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5 6 11l5.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function XIcon() {
  return <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export default function PricingPage() {
  const { user } = useAuth();
  const { tier: currentTier } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCta(planId: Tier) {
    if (!user) { window.location.href = '/register'; return; }
    setError(''); setLoading(planId);
    try {
      const data = await apiFetch<{ url: string }>('/subscriptions/checkout', { method: 'POST', body: JSON.stringify({ tier: planId }) });
      if (!data.url) { setError('Could not start checkout. Please try again.'); return; }
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setLoading(null); }
  }

  async function handleManage() {
    setPortalLoading(true);
    try {
      const data = await apiFetch<{ url: string }>('/subscriptions/portal');
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setPortalLoading(false); }
  }

  return (
    <div className="pcp-page" style={{ minHeight: '100vh', fontFamily: 'var(--sans)', color: 'var(--ink)' }}>
      <style>{`
        @media (max-width: 640px) {
          .pr-nav { padding: 16px 18px !important; }
          .pr-hero { padding: 32px 18px 28px !important; }
          .pr-callout-section { padding: 0 14px 28px !important; }
          .pr-plans-section { padding: 0 14px 48px !important; }
          .pr-plans-grid { grid-template-columns: 1fr !important; }
          .pr-plans-grid > div { transform: none !important; }
          .pr-faq-section { padding: 48px 14px 60px !important; }
          .pr-faq-grid { grid-template-columns: 1fr !important; border-top: none !important; }
          .pr-faq-item { border-left: none !important; padding-left: 0 !important; padding-right: 0 !important; border-right: none !important; }
          .pr-footer { padding: 20px 18px !important; }
        }
      `}</style>
      {/* Nav */}
      <div className="pr-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 56px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: Math.round(40 * 0.28), background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: '#F1ECDF', fontWeight: 400, lineHeight: 1 }}>P</span>
            </div>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>PeaceCoParent</span>
          </div>
        </Link>
        {user
          ? <Link href="/dashboard" style={{ fontSize: 14, color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>← Back to dashboard</Link>
          : <Link href="/login" style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        }
      </div>

      {/* Hero */}
      <div className="pr-hero" style={{ padding: '56px 56px 48px', textAlign: 'center' }}>
        <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Pricing — one plan, both parents</div>
        <h1 className="pcp-display" style={{ marginTop: 18, fontSize: 'clamp(48px, 8vw, 104px)', lineHeight: 0.96, letterSpacing: '-0.04em' }}>
          One price.<br/><em>Both parents.</em>
        </h1>
        <p style={{ marginTop: 24, fontSize: 19, lineHeight: 1.5, color: 'var(--ink-soft)', maxWidth: 560, margin: '24px auto 0' }}>
          No per-parent fees. No contracts. Cancel anytime.
          {currentTier !== 'free' && <><br/><span style={{ color: 'var(--green)', fontWeight: 600 }}>You&apos;re on the {currentTier} plan.</span></>}
        </p>
      </div>

      {/* Callout strip */}
      <div className="pr-callout-section" style={{ padding: '0 56px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', background: 'var(--green-tint)', border: '1.5px solid #BCC9AC', borderRadius: 22, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div className="pcp-eyebrow" style={{ color: 'var(--green)' }}>One plan, two parents</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 6, color: 'var(--green-deep)', letterSpacing: '-0.01em' }}>
              One subscription covers both parents — always.
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--green-deep)', opacity: 0.75, marginTop: 4 }}>No per-parent fees. No per-user billing.</div>
          </div>
          <span style={{ padding: '6px 14px', background: 'var(--green)', color: '#F1ECDF', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em' }}>~50% LESS THAN OFW</span>
        </div>
      </div>

      {error && (
        <div style={{ maxWidth: 1080, margin: '0 auto 24px', padding: '14px 20px', background: 'var(--warn-tint)', border: '1px solid #E8B898', borderRadius: 12, fontSize: 14, color: '#7A2E1E', textAlign: 'center' }}>{error}</div>
      )}

      {/* Plans */}
      <div className="pr-plans-section" style={{ padding: '0 56px 80px' }}>
        <div className="pr-plans-grid" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, alignItems: 'stretch' }}>
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentTier;
            const dark = plan.featured;
            return (
              <div key={plan.id} style={{ background: dark ? 'var(--green-deep)' : 'var(--card)', color: dark ? '#E8E4D6' : 'var(--ink)', border: dark ? '1px solid var(--green-soft)' : '1px solid var(--border)', borderRadius: 22, padding: 32, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: dark ? '0 30px 60px rgba(20,30,20,.18)' : 'none', transform: dark ? 'scale(1.02)' : 'none' }}>
                {dark && <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, background: 'radial-gradient(circle, rgba(232,153,104,.18), transparent 60%)' }}/>}
                {plan.tag && (
                  <div style={{ position: 'absolute', top: 16, right: 16, padding: '6px 12px', background: 'var(--clay)', color: '#F1ECDF', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em' }}>{plan.tag.toUpperCase()}</div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: 16, left: 16, padding: '4px 10px', background: dark ? 'rgba(255,255,255,.1)' : 'var(--green-tint)', color: dark ? '#F1ECDF' : 'var(--green)', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em' }}>CURRENT PLAN</div>
                )}
                <div style={{ position: 'relative', paddingTop: isCurrent || plan.tag ? 28 : 0 }}>
                  <div className="pcp-eyebrow" style={{ color: dark ? 'var(--clay-soft)' : 'var(--ink-mute)' }}>{plan.name}</div>
                  <div className="pcp-display" style={{ fontSize: 72, letterSpacing: '-0.04em', color: dark ? '#F1ECDF' : 'var(--ink)', lineHeight: 1, marginTop: 8 }}>{plan.price}</div>
                  <div className="pcp-mono" style={{ fontSize: 11, color: dark ? '#9BAE9F' : 'var(--ink-mute)', marginTop: 6, letterSpacing: '.04em' }}>{plan.priceSub.toUpperCase()}</div>
                  {plan.id !== 'free' && (
                    <div style={{ fontSize: 11.5, color: dark ? 'rgba(155,174,159,0.8)' : 'var(--ink-mute)', marginTop: 6, lineHeight: 1.5 }}>
                      Billed monthly. Cancel anytime.<br/>One subscription covers both parents.
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, display: 'grid', gap: 10 }}>
                  {plan.features.map(([t, ok]) => (
                    <div key={t as string} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: ok ? (dark ? '#E8E4D6' : 'var(--ink)') : (dark ? '#6B7A6F' : 'var(--ink-mute)'), textDecoration: !ok ? 'line-through' : 'none' }}>
                      <span style={{ width: 20, height: 20, borderRadius: 999, background: ok ? (dark ? 'var(--clay)' : 'var(--green-tint)') : (dark ? 'rgba(255,255,255,.06)' : 'var(--bg-deep)'), color: ok ? '#F1ECDF' : (dark ? '#6B7A6F' : 'var(--ink-mute)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {ok ? <CheckIcon/> : <XIcon/>}
                      </span>
                      {t as string}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => !isCurrent && handleCta(plan.id)}
                  disabled={isCurrent || loading === plan.id}
                  style={{ background: isCurrent ? 'rgba(255,255,255,.08)' : dark ? '#F1ECDF' : 'var(--green)', color: isCurrent ? (dark ? '#9BAE9F' : 'var(--ink-mute)') : dark ? 'var(--green-deep)' : '#F1ECDF', border: 'none', borderRadius: 999, padding: '14px 20px', fontSize: 14, fontWeight: 600, cursor: isCurrent ? 'default' : 'pointer', fontFamily: 'inherit', opacity: loading === plan.id ? 0.7 : 1 }}>
                  {loading === plan.id ? 'Redirecting…' : isCurrent ? 'Current plan' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {currentTier !== 'free' && (
          <div style={{ maxWidth: 1180, margin: '24px auto 0', textAlign: 'center' }}>
            <button onClick={handleManage} disabled={portalLoading} style={{ background: 'none', border: 'none', color: 'var(--ink-mute)', fontSize: 13.5, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
              {portalLoading ? 'Loading…' : 'Manage or cancel subscription'}
            </button>
          </div>
        )}

        <div style={{ maxWidth: 1080, margin: '32px auto 0', textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)' }}>
          Comparing to OurFamilyWizard?{' '}
          <Link href="/compare" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--green)' }}>See the full side-by-side →</Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="pr-faq-section" style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--border)', padding: '80px 56px 100px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Common questions</div>
          <h2 className="pcp-display" style={{ fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.025em', marginTop: 14, maxWidth: 720 }}>
            What people <em>actually ask.</em>
          </h2>
          <div className="pr-faq-grid" style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid var(--border)' }}>
            {FAQS.map(([q, a], i) => (
              <div key={i} className="pr-faq-item" style={{ padding: '24px 28px 24px 0', borderBottom: '1px solid var(--border)', borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none', paddingLeft: i % 2 === 1 ? 28 : 0 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '-0.01em' }}>{q}</div>
                <div style={{ marginTop: 10, fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pr-footer" style={{ background: 'var(--bg-deep)', borderTop: '1px solid var(--border)', padding: '28px 56px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-mute)', letterSpacing: '.04em' }}>
        <div>© 2026 PeaceCoParent</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Terms</Link>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Home</Link>
        </div>
      </div>
    </div>
  );
}
