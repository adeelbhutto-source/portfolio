'use client';
import { useState, useEffect } from 'react';

const CURRENCIES = ['USD', 'NOK', 'EUR', 'GBP', 'SEK', 'DKK'] as const;
export type Currency = typeof CURRENCIES[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: '$ — US Dollar',
  NOK: 'kr — Norwegian Krone',
  EUR: '€ — Euro',
  GBP: '£ — British Pound',
  SEK: 'kr — Swedish Krona',
  DKK: 'kr — Danish Krone',
};

export { CURRENCIES };

function getStored(): Currency {
  if (typeof window === 'undefined') return 'USD';
  const v = localStorage.getItem('preferred_currency') as Currency | null;
  return v && (CURRENCIES as readonly string[]).includes(v) ? v : 'USD';
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    setCurrencyState(getStored());
    function onChanged() { setCurrencyState(getStored()); }
    window.addEventListener('currency-changed', onChanged);
    return () => window.removeEventListener('currency-changed', onChanged);
  }, []);

  function setCurrency(c: Currency) {
    localStorage.setItem('preferred_currency', c);
    setCurrencyState(c);
    window.dispatchEvent(new Event('currency-changed'));
  }

  return { currency, setCurrency, CURRENCIES, CURRENCY_LABELS };
}
