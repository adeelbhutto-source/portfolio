import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'OurFamilyWizard vs PeaceCoParent — Honest Comparison (2026)',
  description: 'Both apps claim to help co-parents. Here is an honest look at the differences in pricing, coaching features, and who each one is actually for in 2026.',
  alternates: { canonical: 'https://peacecoparent.com/blog/ourfamilywizard-vs-peacecoparent' },
  openGraph: { title: 'OurFamilyWizard vs PeaceCoParent — Honest Comparison (2026)', description: 'An honest look at pricing, coaching, conflict tracking, and who each app is actually for.', type: 'article', publishedTime: '2026-05-01T00:00:00.000Z', authors: ['https://peacecoparent.com'] },
};

const others = [
  { href: '/blog/how-to-stop-fighting-with-co-parent-over-text', title: 'How to Stop Fighting With Your Co-Parent Over Text' },
  { href: '/blog/co-parenting-communication-tips', title: 'Co-Parenting Communication Tips That Actually Work' },
  { href: '/blog/how-to-document-co-parenting-for-court', title: 'How to Document Co-Parenting Communication for Court' },
];

export default function Article() {
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: 'OurFamilyWizard vs PeaceCoParent — Honest Comparison (2026)', description: 'Both apps claim to help co-parents. Here is an honest look at the differences in pricing, coaching features, and who each one is actually for in 2026.', datePublished: '2026-05-01', dateModified: '2026-05-01', author: { '@type': 'Organization', name: 'PeaceCoParent', url: 'https://peacecoparent.com' }, publisher: { '@type': 'Organization', name: 'PeaceCoParent', logo: { '@type': 'ImageObject', url: 'https://peacecoparent.com/icon.png' } }, mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://peacecoparent.com/blog/ourfamilywizard-vs-peacecoparent' } }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://peacecoparent.com' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://peacecoparent.com/blog' }, { '@type': 'ListItem', position: 3, name: 'OurFamilyWizard vs PeaceCoParent', item: 'https://peacecoparent.com/blog/ourfamilywizard-vs-peacecoparent' }] }} />
    <div className="min-h-screen pcp-page">
      <div className="bg-[var(--ink)] px-6 pb-12 pt-16">
        <div className="mx-auto max-w-[720px]">
          <Link href="/blog" className="mb-6 inline-block text-[14px] text-[var(--green-tint)] no-underline">← All articles</Link>
          <div style={{ fontSize: '13px', color: 'oklch(55% 0.02 80)', marginBottom: '8px' }}>8 min read · Updated May 2026</div>
          <div style={{ fontSize: '13px', color: 'oklch(55% 0.02 80)', marginBottom: '16px' }}>By PeaceCoParent Editorial Team</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 5vw, 44px)', color: 'var(--bg)', margin: 0, lineHeight: 1.15 }}>
            OurFamilyWizard vs PeaceCoParent — Honest Comparison (2026)
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-[720px] px-6 py-12">
        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-[clamp(24px,4vw,48px)]">

          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            If you are looking for a co-parenting app, you have probably come across OurFamilyWizard. It has been around since 2001 and is frequently recommended by family law attorneys. It is the market leader. But market leader does not always mean best fit — especially when New technology has changed what co-parenting tools can actually do.
          </p>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Pricing</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 16px' }}>
            OurFamilyWizard charges per parent. Their Essentials plan starts at around $12.50 per parent per month (billed annually) — so a co-parenting couple pays approximately $25 per month combined. Premium plans go up to $18–25 per parent, making the combined cost $36–50 per month. (Prices may vary — check OurFamilyWizard&apos;s website for current pricing.)
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            PeaceCoParent charges $14 per month for both parents combined. One subscription, both parents fully covered. That is up to $36 per month less than OurFamilyWizard — and asking your co-parent to pay separately for a tool you want to share is a practical barrier that PeaceCoParent removes entirely.
          </p>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Core features</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            Both apps cover the essentials: shared calendar, co-parent messaging, expense tracking and reimbursement requests, document storage, and PDF export for documentation purposes. If this is all you need, both apps deliver.
          </p>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>coaching — where PeaceCoParent pulls ahead</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 16px' }}>
            OurFamilyWizard has ToneMeter™, which gives a real-time tone score as you type. It is useful, but it does not rewrite anything — it shows you a number and leaves the work to you.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 16px' }}>
            PeaceCoParent&apos;s coach (PeaceCoach) does several things ToneMeter does not:
          </p>
          <ul style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '10px' }}><strong>Full rewrite suggestions</strong> — not just a score. PeaceCoach explains what is triggering in your message and offers a complete calmer version you can use with one tap.</li>
            <li style={{ marginBottom: '10px' }}><strong>Memory across sessions</strong> — PeaceCoach remembers your previous conversations. Over time it recognizes recurring conflict patterns, like repeated disputes over pickup times or expenses, and references them when relevant. OurFamilyWizard&apos;s ToneMeter starts fresh every time.</li>
            <li style={{ marginBottom: '10px' }}><strong>Escalation risk scores</strong> — every message you send gets a score from 0 to 10. Low risk is shown in green, medium in yellow, high in red. You see clearly how charged your message is before it is sent.</li>
            <li style={{ marginBottom: '10px' }}><strong>Conflict trend tracking</strong> — your dashboard shows whether your conflict level has been rising, falling, or stable over the past week compared to the previous week. This is the kind of long-term pattern insight that no other co-parenting app offers.</li>
            <li><strong>Eight coaching modes</strong> — calm rewrite, court-safe rewrite, boundary setting, financial dispute, schedule conflict, high-conflict response, incident documentation, and child-focused reply.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Secure video calls</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            PeaceCoParent Professional includes private video and audio calls between co-parents. No phone numbers shared, every call logged with a timestamp, and access restricted to your family only. OurFamilyWizard offers a similar feature at higher per-parent pricing.
          </p>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>What OurFamilyWizard still has that PeaceCoParent is building toward</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            OurFamilyWizard has been in family courts for over two decades. Many judges and attorneys know it by name and are comfortable accepting its records in legal proceedings. PeaceCoParent is newer and building that track record. Both apps generate timestamped, tamper-evident PDF records — in most cases the content of those records matters more than which platform produced them. But if you are in a court-ordered situation where a specific platform has been mandated, you may have limited choice.
          </p>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Who each app is for</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 16px' }}>
            <strong>OurFamilyWizard</strong> is best suited for high-conflict situations where a court has specifically recommended or ordered the platform, and where legal documentation is the primary concern.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            <strong>PeaceCoParent</strong> is best for co-parents who want to actually communicate better over time, not just document more. If you want proactive coaching support, conflict pattern tracking, and a fair price for both parents, PeaceCoParent is the stronger choice.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' }} />
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: 0 }}>
            OurFamilyWizard built the category. PeaceCoParent is building what comes next — an app that does not just store your communication history, but actively helps you make it better. For most co-parents choosing an app on their own, PeaceCoParent offers more capability at half the price.
          </p>
        </div>

        <div style={{ marginTop: '40px', background: 'var(--green-deep)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--bg)', margin: '0 0 12px' }}>Try PeaceCoParent free</h3>
          <p style={{ color: 'oklch(68% 0.04 155)', fontSize: '16px', margin: '0 0 24px' }}>coaching with memory, conflict trend tracking, and timestamped activity reports. $14/month covers both parents.</p>
          <Link href="/register" style={{ display: 'inline-block', background: 'var(--bg)', color: 'var(--green-deep)', borderRadius: '999px', padding: '14px 32px', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>Start Free — No Credit Card</Link>
          <Link href="/pricing" style={{ display: 'inline-block', marginTop: '12px', color: 'oklch(75% 0.05 155)', fontSize: '14px', textDecoration: 'none' }}>See plans &amp; pricing →</Link>
        </div>

        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>More articles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {others.map(a => <Link key={a.href} href={a.href} style={{ display: 'block', background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--ink)', fontSize: '15px', fontWeight: 600 }}>{a.title} →</Link>)}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
