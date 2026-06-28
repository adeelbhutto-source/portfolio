import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Priser — Begge foreldre, én pris | PeaceCoParent',
  description: 'PeaceCoParent koster ca. 149 kr/mnd og dekker begge foreldre. Ingen per-bruker-gebyr. Gratis plan tilgjengelig.',
  alternates: { canonical: 'https://peacecoparent.com/no/pricing' },
};

const PLANS = [
  {
    name: 'Gratis',
    price: '0 kr',
    period: 'for alltid',
    features: ['Meldinger og kalender', '3 utgiftsforespørsler/mnd', 'Barneprofiler', 'Grunnleggende dokumentasjon'],
    excluded: ['coach', 'Ubegrensede utgifter', 'Aktivitetsrapporter'],
    cta: 'Kom i gang gratis',
    featured: false,
    href: '/register',
  },
  {
    name: 'Personlig',
    price: '~149 kr',
    period: 'per mnd · begge foreldre',
    badge: 'Mest populær',
    features: ['Alt i Gratis', 'meldingscoach', 'Ubegrensede utgifter', 'Tidsstemplede aktivitetsrapporter', 'Google Kalender-synk'],
    excluded: ['Advokat- og meklerportal'],
    cta: 'Velg Personlig',
    featured: true,
    href: '/register',
  },
  {
    name: 'Profesjonell',
    price: '~389 kr',
    period: 'per mnd',
    features: ['Alt i Personlig', 'Advokat- og meklerportal', 'Ubegrensede aktivitetsrapporter', 'Prioritert support'],
    excluded: [],
    cta: 'Velg Profesjonell',
    featured: false,
    href: '/register',
  },
];

const FAQ = [
  { q: 'Må den andre forelderen også betale?', a: 'Nei. Én plan dekker begge foreldre. Når én forelder oppgraderer, får begge full tilgang — ingen dobbelt fakturering.' },
  { q: 'Kan jeg kansellere når som helst?', a: 'Ja, kanseller med ett klikk. Ingen binding, ingen gebyrer. Dataene dine er tilgjengelige på gratisplanen etter kansellering.' },
  { q: 'Er prisen i norske kroner?', a: 'Betaling skjer i USD via Stripe ($14/mnd for Personlig, $39/mnd for Profesjonell). Ca. 149 kr og 389 kr basert på gjeldende kurs. Vi jobber med NOK-fakturering.' },
  { q: 'Er det GDPR-compliant?', a: 'Ja. Vi er europeiske og behandler data i samsvar med GDPR. All data er kryptert under overføring og lagring.' },
];

export default function NorwegianPricingPage() {
  return (
    <div className="min-h-screen pcp-page">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border)] px-8 backdrop-blur-sm"
        style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)' }}>
        <Link href="/no" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[16px] text-white"
            style={{ background: 'var(--green)', fontFamily: 'var(--serif)' }}>P</div>
          <span className="text-[15px] font-semibold text-[var(--ink)]">PeaceCoParent</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-[13px] text-[var(--ink-soft)] no-underline hover:text-[var(--ink)]">🇬🇧 English</Link>
          <Link href="/no" className="text-[14px] font-medium text-[var(--ink-soft)] no-underline">← Tilbake</Link>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-5 py-16 pb-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--green)]">Enkel prissetting</div>
          <h1 className="mb-3 leading-tight tracking-tight text-[var(--ink)]"
            style={{ fontFamily: 'var(--serif)', fontSize: '40px', letterSpacing: '-0.02em' }}>
            Én pris. Begge foreldre.
          </h1>
          <p className="mx-auto max-w-md text-[16px] leading-relaxed text-[var(--ink-soft)]">
            Ingen per-forelder-gebyr. Ingen binding. Kanseller når som helst.
          </p>
        </div>

        {/* One-plan banner */}
        <div className="mb-8 rounded-[22px] border border-[var(--green-tint)] bg-[var(--card)] p-5 text-center shadow-[0_0_0_4px_var(--green-tint)]">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--green)]">Én plan, to foreldre</div>
          <div className="text-[16px] font-bold text-[var(--ink)]">Én plan dekker begge foreldre — alltid</div>
          <div className="text-[13px] text-[var(--ink-soft)]">Ingen per-bruker-gebyr. Ingen ekstra kostnad for den andre forelderen.</div>
        </div>

        {/* Plans */}
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PLANS.map(plan => (
            <div key={plan.name} className="relative flex flex-col rounded-[24px] p-7 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--card)',
                border: plan.featured ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                boxShadow: plan.featured ? '0 0 0 4px var(--green-tint)' : undefined,
              }}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[12px] font-bold text-white"
                  style={{ background: 'var(--green)' }}>{plan.badge}</div>
              )}
              <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--green)' }}>{plan.name}</div>
              <div className="mb-1 leading-none" style={{ fontFamily: 'var(--serif)', fontSize: '40px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                {plan.price}
              </div>
              <div className="mb-6 text-[13px] text-[var(--ink-soft)]">{plan.period}</div>

              <ul className="mb-7 flex flex-1 flex-col gap-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-[var(--ink)]">
                    <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[var(--green-tint)]">
                      <svg width="9" height="9" fill="none" stroke="var(--green-deep)" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
                {plan.excluded.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-[var(--border)] line-through">
                    <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full pcp-page">
                      <svg width="8" height="8" fill="none" stroke="oklch(80% 0.012 80)" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}
                className="block w-full rounded-full py-3 text-center text-[14px] font-semibold no-underline transition-all"
                style={{
                  background: plan.featured ? 'var(--green)' : 'none',
                  color: plan.featured ? 'white' : 'var(--ink)',
                  border: plan.featured ? 'none' : '1.5px solid var(--border)',
                }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-xl">
          <h2 className="mb-6 text-center text-[22px] text-[var(--ink)]"
            style={{ fontFamily: 'var(--serif)', letterSpacing: '-0.02em' }}>
            Vanlige spørsmål
          </h2>
          <div className="flex flex-col gap-3">
            {FAQ.map(item => (
              <details key={item.q} className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-semibold text-[var(--ink)]">
                  {item.q}
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="ml-4 flex-shrink-0 text-[var(--ink-soft)]">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-soft)]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
