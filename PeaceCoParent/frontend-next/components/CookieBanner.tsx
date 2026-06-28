'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-t px-5 py-3"
      style={{ background: 'rgba(248,244,238,0.97)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
      <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
        We use essential cookies to keep you signed in.{' '}
        <Link href="/privacy" className="font-medium underline underline-offset-2"
          style={{ color: 'var(--green-deep)' }}>
          Privacy policy
        </Link>
      </p>
      <button onClick={accept}
        className="pcp-btn-primary flex-shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold">
        Got it
      </button>
    </div>
  );
}
