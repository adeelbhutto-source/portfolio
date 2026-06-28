'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export type Tier = 'free' | 'personal' | 'professional' | 'enterprise';

interface SubState {
  tier: Tier;
  status: string;
  loading: boolean;
}

export function useSubscription() {
  const [state, setState] = useState<SubState>({ tier: 'free', status: 'active', loading: true });

  useEffect(() => {
    apiFetch<{ tier: Tier; status: string }>('/subscriptions/me')
      .then((d) => setState({ tier: d.tier, status: d.status, loading: false }))
      .catch(() => setState({ tier: 'free', status: 'active', loading: false }));
  }, []);

  const isPaid = state.tier !== 'free';
  const isPro = state.tier === 'professional' || state.tier === 'enterprise';

  async function upgrade(tier: Tier) {
    const data = await apiFetch<{ url: string }>('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
    window.location.href = data.url;
  }

  async function openPortal() {
    const data = await apiFetch<{ url: string }>('/subscriptions/portal');
    window.location.href = data.url;
  }

  return { ...state, isPaid, isPro, upgrade, openPortal };
}
