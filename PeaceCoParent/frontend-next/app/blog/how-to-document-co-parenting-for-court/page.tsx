import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'How to Document Co-Parenting Communication for Court',
  description: 'If your co-parenting situation ever goes to court or mediation, documentation is everything. Here is how to do it right.',
  alternates: { canonical: 'https://peacecoparent.com/blog/how-to-document-co-parenting-for-court' },
  openGraph: { title: 'How to Document Co-Parenting Communication for Court', description: 'Documentation is the difference between a case you can prove and one you cannot.', type: 'article', publishedTime: '2026-04-29T00:00:00.000Z', authors: ['https://peacecoparent.com'] },
};

const others = [
  { href: '/blog/how-to-stop-fighting-with-co-parent-over-text', title: 'How to Stop Fighting With Your Co-Parent Over Text' },
  { href: '/blog/co-parenting-communication-tips', title: 'Co-Parenting Communication Tips That Actually Work' },
  { href: '/blog/ourfamilywizard-vs-peacecoparent', title: 'OurFamilyWizard vs PeaceCoParent — Honest Comparison' },
];

export default function Article() {
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Document Co-Parenting Communication for Court', description: 'If your co-parenting situation ever goes to court or mediation, documentation is everything. Here is how to do it right.', datePublished: '2026-04-29', dateModified: '2026-04-29', author: { '@type': 'Organization', name: 'PeaceCoParent', url: 'https://peacecoparent.com' }, publisher: { '@type': 'Organization', name: 'PeaceCoParent', logo: { '@type': 'ImageObject', url: 'https://peacecoparent.com/icon.png' } }, mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://peacecoparent.com/blog/how-to-document-co-parenting-for-court' } }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://peacecoparent.com' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://peacecoparent.com/blog' }, { '@type': 'ListItem', position: 3, name: 'How to Document Co-Parenting Communication for Court', item: 'https://peacecoparent.com/blog/how-to-document-co-parenting-for-court' }] }} />
    <div className="min-h-screen pcp-page">
      <div className="bg-[var(--ink)] px-6 pb-12 pt-16">
        <div className="mx-auto max-w-[720px]">
          <Link href="/blog" className="mb-6 inline-block text-[14px] text-[var(--green-tint)] no-underline">← All articles</Link>
          <div style={{ fontSize: '13px', color: 'oklch(55% 0.02 80)', marginBottom: '8px' }}>7 min read · April 29, 2026</div>
          <div style={{ fontSize: '13px', color: 'oklch(55% 0.02 80)', marginBottom: '16px' }}>By PeaceCoParent Editorial Team</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 5vw, 44px)', color: 'var(--bg)', margin: 0, lineHeight: 1.15 }}>
            How to Document Co-Parenting Communication for Court
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-[720px] px-6 py-12">
        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-[clamp(24px,4vw,48px)]">
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>Nobody wants to think about court when they are just trying to manage pickups and school schedules. But the reality is that co-parenting disputes escalate — sometimes quickly and unexpectedly. And when they do, documentation is the difference between a case you can prove and one you cannot.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Why documentation matters</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>Family court judges see dozens of cases. They cannot read the minds of parents who come before them. What they can read are records — timestamps, messages, receipts, logs. When one parent shows up with organized, timestamped documentation and the other shows up with screenshots of screenshots, the difference in credibility is immediate.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>What to document</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}><strong>Custody schedule adherence</strong> — every pickup and dropoff. Time scheduled, time it actually happened, any changes requested. If the other parent is consistently late or frequently cancels, this creates a pattern that becomes visible over time.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}><strong>Communication</strong> — all significant exchanges about the children. Keep these in one place so you can find them when you need them.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}><strong>Expenses</strong> — shared costs for the children, receipts, and when you requested reimbursement and what the response was.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}><strong>Your own compliance</strong> — document your own adherence to the custody arrangement. This is often overlooked. When you can show that you consistently followed the agreement, it strengthens your position significantly.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>How to document effectively</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>Use timestamps automatically. The best documentation is timestamped by a system, not by you. Messages sent through a documented platform, expenses logged with dates — these are harder to dispute than notes you wrote yourself.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>Be factual, not emotional. &quot;He was 45 minutes late for pickup on April 3rd&quot; is documentation. &quot;He never cares about the kids&quot; is opinion. Only facts hold up in court.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>The mistake most parents make with screenshots</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>The most common documentation mistake is relying on screenshots. It makes sense — screenshots feel like proof. But in a contested legal situation, they are some of the weakest evidence you can present.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>They can be cropped. They can be taken out of context. The timestamps can be questioned. A skilled attorney will point out that there is no way to verify a screenshot has not been altered. And a judge who has seen hundreds of family court cases knows exactly how easy it is to cherry-pick screenshots that tell only one side of the story.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>What holds up is a continuous, system-generated record. Not something you manually assembled. A log where the timestamps are created by the platform, not by you, and where the full context of every conversation is preserved. The format of your documentation matters as much as its content.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>What format judges and attorneys want</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>Most attorneys will tell you the same thing: they want a clean PDF. Timestamped. Organized. Easy to read. A 200-page printout of WhatsApp screenshots is not useful. A clean, formatted report showing dates, messages, and expenses in chronological order is.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}><Link href="/register" style={{ color: 'var(--green-deep)', fontWeight: 600 }}>PeaceCoParent</Link> generates exactly this format — a clean, timestamped PDF that you can export at any time, covering any date range you choose.</p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' }} />
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: 0 }}>Documentation is not paranoia. It is preparation. And in co-parenting situations that involve the wellbeing of children, preparation is an act of love.</p>
        </div>
        <div style={{ marginTop: '40px', background: 'var(--green-deep)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--bg)', margin: '0 0 12px' }}>Try PeaceCoParent free</h3>
          <p style={{ color: 'oklch(68% 0.04 155)', fontSize: '16px', margin: '0 0 24px' }}>message coaching, shared calendar, and timestamped activity reports. $14/month covers both parents.</p>
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
