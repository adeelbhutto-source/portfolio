'use client';
import { useState } from 'react';
import { useSubscription, type Tier } from '@/hooks/useSubscription';

interface Props {
  onClose: () => void;
  reason?: string;
  recommendedTier?: Tier;
}

const TIERS: { id: Tier; name: string; price: string; features: string[]; cta: string }[] = [
  {
    id: 'personal', name: 'Personal', price: '$14/mo', cta: 'Upgrade to Personal',
    features: ['Conflict prevention coach', 'Unlimited expense records', 'Clean documentation reports', 'Both parents covered — one price'],
  },
  {
    id: 'professional', name: 'Professional', price: '$39/mo', cta: 'Upgrade to Professional',
    features: ['Everything in Personal', 'Attorney & mediator access', 'Bulk report generation', 'Priority support'],
  },
];

export default function UpgradeModal({ onClose, reason, recommendedTier = 'personal' }: Props) {
  const { upgrade } = useSubscription();
  const [loading, setLoading] = useState<Tier | null>(null);
  const [error, setError] = useState('');

  async function handleUpgrade(tier: Tier) {
    setLoading(tier);
    setError('');
    try {
      await upgrade(tier);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not start checkout. Please try again.');
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-[24px] shadow-2xl"
        style={{ background: 'var(--card)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5" style={{ background: 'var(--ink)' }}>
          <div className="mb-1 text-[20px]"
            style={{ fontFamily: 'var(--serif)', color: 'var(--bg)' }}>
            Protect your peace
          </div>
          <div className="text-[14px]" style={{ color: 'oklch(60% 0.02 80)' }}>
            {reason ?? 'Unlock full conflict prevention for both parents.'}
          </div>
        </div>

        <div className="space-y-3 p-6">
          {error && (
            <div className="rounded-xl px-4 py-3 text-[13px]"
              style={{ background: 'oklch(95% 0.03 25)', color: 'oklch(40% 0.12 25)', border: '1px solid oklch(88% 0.06 25)' }}>
              {error}
            </div>
          )}

          {TIERS.map(t => (
            <div key={t.id} className="rounded-[16px] border-[1.5px] p-5"
              style={{
                borderColor: t.id === recommendedTier ? 'var(--green)' : 'var(--border)',
                boxShadow: t.id === recommendedTier ? '0 0 0 3px var(--green-tint)' : undefined,
              }}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {t.id === recommendedTier && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: 'var(--green-tint)', color: 'var(--green-deep)' }}>
                      RECOMMENDED
                    </span>
                  )}
                  <span className="text-[15px] font-bold" style={{ color: 'var(--ink)' }}>{t.name}</span>
                </div>
                <span className="text-[16px] font-bold" style={{ color: 'var(--green-deep)' }}>{t.price}</span>
              </div>
              <ul className="mb-4 flex flex-col gap-2">
                {t.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--ink)' }}>
                    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'var(--green-tint)' }}>
                      <svg width="9" height="9" fill="none" stroke="var(--green-deep)" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleUpgrade(t.id)} disabled={loading !== null}
                className="pcp-btn-primary w-full rounded-xl py-2.5 text-[14px] font-semibold disabled:opacity-60">
                {loading === t.id ? 'Redirecting to Stripe…' : t.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="pb-5 text-center">
          <button onClick={onClose} className="text-[13px] transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', fontFamily: 'inherit' }}>
            Continue with free plan
          </button>
        </div>
      </div>
    </div>
  );
}
