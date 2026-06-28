'use client';
import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [['Hvorfor oss', '#hvorfor'], ['Funksjoner', '#funksjoner'], ['Pris', '/no/pricing'], ['FAQ', '#faq']];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
        <path d="M12 7v4"/><path d="M8 14h.01M12 14h.01M16 14h.01"/>
      </svg>
    ),
    title: 'meldingscoach',
    desc: 'Les gjennom meldingen før du sender. Coachen hjelper deg omskrive den til å bli roligere, mer faktabasert og barnefokusert — med 8 spesialiserte modi.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: 'Felles kalender',
    desc: 'Samvær, henting, legetime, skolestart — én delt kalender begge foreldre ser i sanntid. Kobles til Google Kalender.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    title: 'Delte utgifter',
    desc: 'Logg barnebidrag og delte kostnader, last opp kvitteringer, be om godkjenning. Slutt på diskusjoner om hvem som betalte hva.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: 'Dokumentasjonsrapporter',
    desc: 'Eksporter hele kommunikasjonshistorikken som en ryddig, tidsstemplet PDF — tilgjengelig for advokat eller mekler når du trenger det.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      </svg>
    ),
    title: 'Advokat- og meklerportal',
    desc: 'Gi advokaten eller mekleren din lesetilgang direkte — ingen kontodeling, ingen videresending av skjermbilder. Kan trekkes tilbake når som helst.',
  },
];

const FAQS = [
  {
    q: 'Må den andre forelderen også betale?',
    a: 'Nei. Én plan dekker begge foreldre helt. Du betaler ca. 149 kr/mnd og den andre forelderen får full tilgang uten ekstra kostnad.',
  },
  {
    q: 'Er PeaceCoParent GDPR-compliant?',
    a: 'Ja. Vi er europeiske og behandler data i samsvar med GDPR. All data er kryptert under overføring og lagring. Du kan eksportere eller slette dataene dine når som helst.',
  },
  {
    q: 'Kan jeg dele rapportene med advokaten min?',
    a: 'Ja. Alle meldinger, utgifter og hendelser er tidsstemplet og kan eksporteres som PDF. Du kan også gi advokaten direkte lesetilgang via advokatportalen. PeaceCoParent er et organisasjonsverktøy og gir ikke juridisk rådgivning.',
  },
  {
    q: 'Hva er Peace Score?',
    a: 'Peace Score er et tall fra 0 til 100 basert på kommunikasjonen din de siste 30 dagene. Det viser om konfliktnivået går ned over tid — med en ukentlig trendgraf du kan dele med mekler eller advokat.',
  },
  {
    q: 'Kan jeg bruke det alene, uten den andre forelderen?',
    a: 'Ja. Du kan bruke PeaceCoParent på egenhånd fra dag én — loggføre hendelser, bruke coachen og bygge opp dokumentasjon. Du kan invitere den andre forelderen når dere er klare.',
  },
  {
    q: 'Kan jeg kansellere når som helst?',
    a: 'Ja, kanseller med ett klikk uten bindingstid. Dataene dine er tilgjengelige på gratisplanen etter kansellering. Vi tilbyr 30 dagers pengene-tilbake-garanti for førstegangskunder.',
  },
];

export default function NorwegianLandingPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg)', fontFamily: 'var(--sans)' }}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between px-4 sm:px-8"
        style={{ background: 'rgba(248,244,238,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/no" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[18px] text-white"
            style={{ background: 'var(--green)', fontFamily: 'var(--serif)' }}>P</div>
          <div>
            <div className="text-[15px] font-semibold text-[var(--ink)]">PeaceCoParent</div>
            <div className="text-[11px] text-[var(--ink-soft)]">Ro i samarbeidet</div>
          </div>
        </Link>

        <ul className="hidden list-none items-center gap-8 md:flex">
          {NAV_LINKS.map(([label, href]) => (
            <li key={label}>
              <a href={href} className="text-[14px] no-underline transition-colors text-[var(--ink-soft)] hover:text-[var(--ink)]">{label}</a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <Link href="/" className="hidden text-[12px] text-[var(--ink-soft)] no-underline hover:text-[var(--ink)] sm:block">🇬🇧 English</Link>
          <Link href="/login" className="hidden rounded-full px-[18px] py-2 text-[14px] font-medium no-underline transition-all sm:inline-flex"
            style={{ border: '1.5px solid var(--border)', color: 'var(--ink)' }}>
            Logg inn
          </Link>
          <Link href="/register" className="pcp-btn-primary rounded-full px-5 py-2 text-[14px] font-semibold no-underline">
            Start gratis
          </Link>
          <button className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-xl md:hidden"
            style={{ border: '1.5px solid var(--border)' }} onClick={() => setMobileOpen(v => !v)}>
            {[0,1,2].map(i => <span key={i} className="h-0.5 w-4 rounded-full" style={{ background: 'var(--ink)' }} />)}
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute left-0 right-0 top-full border-t px-5 pb-4 pt-3 md:hidden pcp-page border-[var(--border)]">
            {[...NAV_LINKS, ['🇬🇧 English', '/'], ['Logg inn', '/login'], ['Registrer deg', '/register']].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3 text-[14px] font-medium no-underline text-[var(--ink)]">{label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-14 px-8 py-16 md:grid-cols-2 md:gap-[60px] md:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold bg-[var(--green-tint)] text-[var(--green-deep)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
            Laget for norske familier
          </div>
          <h1 className="mb-5 leading-[1.05] tracking-tight"
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(40px, 5vw, 58px)', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Samarbeid uten{' '}
            <em className="not-italic text-[var(--green)]">konflikten.</em>
          </h1>
          <p className="mb-9 text-[17px] leading-relaxed" style={{ color: 'var(--ink-soft)', maxWidth: '460px' }}>
            PeaceCoParent hjelper separerte foreldre kommunisere rolig, holde oversikt over samvær og utgifter, og bygge dokumentasjon som beskytter begge — og barna.
          </p>
          <div className="mb-9 flex flex-wrap items-center gap-3">
            <Link href="/register" className="pcp-btn-primary rounded-full px-7 py-3.5 text-[16px] font-semibold no-underline">
              Start gratis — ingen betalingskort
            </Link>
            <Link href="/login" className="rounded-full px-7 py-3.5 text-[16px] font-medium no-underline transition-all"
              style={{ border: '1.5px solid var(--border)', color: 'var(--ink)' }}>
              Logg inn →
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">
            {['Gratis plan tilgjengelig', 'Ca. 149 kr/mnd dekker begge foreldre', 'Kanseller når som helst'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-[13px] text-[var(--ink-soft)]">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--green)]" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Right — mock cards */}
        <div className="flex flex-col gap-3.5">
          <div className="rounded-[18px] border p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] bg-[var(--card)] border-[var(--border)]">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--ink-soft)]">meldingscoach</div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'oklch(55% 0.1 25)' }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 10H1L6 1z" fill="oklch(72% 0.1 55)" /></svg>
              Før du sender
            </div>
            <div className="mb-3 rounded-xl px-3.5 py-2.5 text-[14px] leading-snug"
              style={{ background: 'oklch(94% 0.03 25)', color: 'oklch(40% 0.08 25)', borderBottomLeftRadius: '4px' }}>
              &ldquo;Du MÅ hente dem i tide. Ungene venter alltid på deg.&rdquo;
            </div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--green-deep)]">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="var(--green)" /><path d="M4 6l1.5 1.5L8 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Roligere forslag
            </div>
            <div className="rounded-xl px-3.5 py-2.5 text-[14px] leading-snug"
              style={{ background: 'var(--green-tint)', color: 'var(--green-deep)', borderBottomLeftRadius: '4px' }}>
              &ldquo;Kan vi bli enige om et fast hentetidspunkt? Det hjelper på rutinen til barna.&rdquo;
            </div>
            <button className="pcp-btn-primary mt-3 rounded-full px-4 py-2 text-[13px] font-semibold">
              Bruk denne versjonen
            </button>
          </div>
          <div className="rounded-[18px] border p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] bg-[var(--card)] border-[var(--border)]">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--ink-soft)]">Denne uken</div>
            {[
              { day: 'MAN', text: 'Henting skole · 14:30' },
              { day: 'ONS', text: 'Legetime · 10:00' },
              { day: 'FRE', text: 'Overlevering · 17:00' },
            ].map(({ day, text }) => (
              <div key={day} className="flex items-center gap-3 border-b py-2.5 text-[14px] last:border-0 last:pb-0"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}>
                <span className="w-7 flex-shrink-0 text-[11px] font-bold text-[var(--green)]">{day}</span>
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--green-tint)]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PEACE SCORE ── */}
      <section className="py-[90px]" style={{ background: 'var(--green-deep)' }}>
        <div className="mx-auto max-w-[1100px] px-8">
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.08em]"
                style={{ background: 'oklch(36% 0.06 155)', color: 'var(--green-tint)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />Nytt i 2026
              </div>
              <h2 className="mb-5 leading-[1.05] tracking-tight"
                style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--bg)', letterSpacing: '-0.02em' }}>
                Se om det faktisk<br /><em className="not-italic text-[var(--green-tint)]">blir bedre over tid.</em>
              </h2>
              <p className="mb-8 text-[17px] leading-relaxed" style={{ color: 'oklch(68% 0.04 155)', maxWidth: '420px' }}>
                Peace Score er et tall fra 0 til 100 basert på kommunikasjonen din de siste 30 dagene. Det viser om konfliktnivået går ned — med en ukentlig trendgraf du kan dele med mekler eller advokat.
              </p>
              <ul className="mb-8 flex flex-col gap-4">
                {[
                  ['Ukentlig trendgraf', '8 ukers oversikt. Grønt betyr rolig. Rødt betyr noe å jobbe med.'],
                  ['Nøkkelfaktorer', 'Appen viser hvilke meldinger som trekker scoren ned — så du vet nøyaktig hva du bør forbedre.'],
                  ['Del med advokat eller mekler', 'Advokaten eller mekleren din kan se Peace Score direkte i portalen — en synlig dokumentasjon av innsatsen din.'],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'oklch(36% 0.06 155)' }}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="var(--green-tint)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <div>
                      <span className="text-[14px] font-semibold text-[var(--bg)]">{title}</span>
                      <span className="text-[14px]" style={{ color: 'oklch(65% 0.03 155)' }}> — {desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-block rounded-full px-7 py-3.5 text-[15px] font-semibold no-underline"
                style={{ background: 'var(--bg)', color: 'var(--green-deep)' }}>
                Begynn å bygge Peace Score →
              </Link>
            </div>
            <div className="rounded-[22px] p-6" style={{ background: 'oklch(32% 0.04 155)', border: '1px solid oklch(40% 0.06 155)' }}>
              <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'oklch(60% 0.04 155)' }}>Din Peace Score</div>
              <div className="mb-4 flex items-center gap-5">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-[32px] font-black"
                  style={{ background: 'var(--green)', color: 'white', fontFamily: 'var(--serif)', letterSpacing: '-0.02em' }}>74</div>
                <div>
                  <div className="text-[22px] font-bold" style={{ fontFamily: 'var(--serif)', color: 'var(--bg)' }}>Rolig</div>
                  <div className="text-[13px]" style={{ color: 'oklch(60% 0.04 155)' }}>Opp 12 poeng fra forrige måned</div>
                </div>
              </div>
              <svg width="100%" viewBox="0 0 224 72" preserveAspectRatio="none">
                {[42, 38, 51, 58, 62, 69, 74].map((score, i) => {
                  const barH = Math.max(6, (score / 100) * 52);
                  const color = score >= 60 ? '#6b9e72' : score >= 40 ? '#d97706' : '#ef4444';
                  return (
                    <g key={i}>
                      <rect x={i * 32 + 4} y={58 - barH} width={24} height={barH} rx={4} fill={color} opacity={0.9} />
                      <text x={i * 32 + 16} y={70} textAnchor="middle" fontSize={10} fontWeight="700" fill="white">{score}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funksjoner" className="py-[90px] bg-[var(--green-tint)]">
        <div className="mx-auto max-w-[1100px] px-8">
          <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--green)]">Alt du trenger</div>
          <h2 className="mb-4 leading-[1.05] tracking-tight"
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px, 4vw, 44px)', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Laget for hverdagen<br />som separert forelder.
          </h2>
          <p className="mb-14 max-w-lg text-[17px] leading-relaxed text-[var(--ink-soft)]">
            Hver funksjon finnes fordi norske foreldre har bedt om det.
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-5 rounded-[20px] border p-8 bg-[var(--card)] border-[var(--border)] transition-all hover:-translate-y-0.5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--green-tint)' }}>
                  <div className="h-5 w-5">{f.icon}</div>
                </div>
                <div>
                  <h3 className="mb-2 text-[17px] font-semibold text-[var(--ink)]">{f.title}</h3>
                  <p className="text-[14px] leading-relaxed text-[var(--ink-soft)]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-[90px] bg-[var(--card)]">
        <div className="mx-auto max-w-[1100px] px-8">
          <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--green)]">Fra brukerne</div>
          <h2 className="mb-14 leading-[1.05] tracking-tight"
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px, 4vw, 44px)', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Ekte resultater fra<br />ekte foreldre.
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { quote: 'Peace Score gikk fra 34 til 71 på seks uker. Jeg skjønte ikke hvor ladet meldingene mine var før jeg faktisk så tallet.', name: 'Sarah M.', detail: 'Skilt forelder, 2 barn' },
              { quote: 'Advokaten min sa at Peace Score-grafen sparte oss for to timers møtetid. Hun kunne se trenden før vi engang satte oss ned.', name: 'James T.', detail: 'Forelder under mekling' },
              { quote: 'Jeg hadde prøvd andre apper, men de føltes alle kalde og kliniske. PeaceCoParent er det første som faktisk fikk meg til å ville kommunisere bedre.', name: 'Rachel K.', detail: 'Aleneforsørger, 2 barn' },
            ].map(t => (
              <div key={t.name} className="flex flex-col rounded-[20px] border p-8 pcp-page border-[var(--border)]">
                <div className="mb-5 text-[32px]" style={{ color: 'var(--green-tint)', fontFamily: 'var(--serif)', lineHeight: 1 }}>&ldquo;</div>
                <p className="mb-6 flex-1 text-[16px] leading-relaxed text-[var(--ink)]">{t.quote}</p>
                <div>
                  <div className="text-[14px] font-bold text-[var(--ink)]">{t.name}</div>
                  <div className="text-[13px] text-[var(--ink-soft)]">{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-[90px] bg-[var(--green-tint)]">
        <div className="mx-auto max-w-[720px] px-8">
          <div className="mb-3 text-center text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--green)]">Vanlige spørsmål</div>
          <h2 className="mb-12 text-center leading-[1.05] tracking-tight"
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Spørsmål og svar
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
              <div key={i} className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left text-[15px] font-semibold text-[var(--ink)]"
                  style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}>
                  {f.q}
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    className="ml-4 flex-shrink-0 text-[var(--ink-soft)] transition-transform"
                    style={{ transform: open === i ? 'rotate(180deg)' : 'none' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {open === i && (
                  <p className="px-6 pb-5 text-[14px] leading-relaxed text-[var(--ink-soft)]">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="py-[90px] text-center" style={{ background: 'var(--green-deep)' }}>
        <h2 className="mb-4 tracking-tight"
          style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 4vw, 50px)', color: 'var(--bg)', letterSpacing: '-0.02em' }}>
          Begynn å beskytte freden din i dag.
        </h2>
        <p className="mx-auto mb-9 max-w-[480px] text-[17px] leading-relaxed" style={{ color: 'oklch(80% 0.04 155)' }}>
          Skriv tryggere meldinger, logg utgifter og bygg ryddig dokumentasjon — selv før du inviterer den andre forelderen.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="rounded-full px-7 py-3.5 text-[16px] font-semibold no-underline transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--bg)', color: 'var(--green-deep)' }}>
            Start gratis — ingen betalingskort
          </Link>
          <Link href="/no/pricing" className="rounded-full px-7 py-3.5 text-[16px] font-medium no-underline"
            style={{ border: '1.5px solid oklch(70% 0.04 155)', color: 'var(--bg)' }}>
            Se priser
          </Link>
        </div>
        <p className="mt-5 text-[13px]" style={{ color: 'oklch(65% 0.04 155)' }}>
          Gratis plan tilgjengelig · Ca. 149 kr/mnd dekker begge foreldre · Kanseller når som helst
        </p>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--ink)', padding: '48px 2rem 32px' }}>
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-start justify-between gap-8 border-b pb-8"
          style={{ borderColor: 'oklch(38% 0.02 80)' }}>
          <div>
            <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-[10px] text-[18px] text-white"
              style={{ background: 'var(--green)', fontFamily: 'var(--serif)' }}>P</div>
            <div className="mb-1 text-[15px] font-semibold text-[var(--bg)]">PeaceCoParent</div>
            <div className="text-[13px]" style={{ color: 'oklch(60% 0.02 80)' }}>Ro i samarbeidet</div>
          </div>
          <div className="flex flex-wrap gap-6">
            {[['Personvern', '/privacy'], ['Vilkår', '/terms'], ['Priser', '/no/pricing'], ['Logg inn', '/login'], ['🇬🇧 English', '/']].map(([label, href]) => (
              <Link key={label} href={href} className="text-[14px] no-underline transition-colors hover:text-[var(--bg)]"
                style={{ color: 'oklch(60% 0.02 80)' }}>{label}</Link>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-[1100px] text-center text-[13px]" style={{ color: 'oklch(50% 0.02 80)' }}>
          © {new Date().getFullYear()} PeaceCoParent. Laget for familier som setter barna først.
        </p>
        <p className="mx-auto mt-3 max-w-[800px] text-center text-[11px] leading-relaxed" style={{ color: 'oklch(42% 0.02 80)' }}>
          PeaceCoParent tilbyr kommunikasjons- og organisasjonsverktøy — ikke juridisk, terapeutisk eller profesjonell rådgivning. Coaching-forslag er kun veiledende. Du er ansvarlig for alt innhold du sender. Rapporter og dokumentasjon garanteres ikke å bli akseptert av noen domstol eller myndighet.
        </p>
      </footer>
    </div>
  );
}
