import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'How Peace Score Is Changing Co-Parenting in 2026',
  description: 'Peace Score is a new way to measure how your co-parenting communication is trending over time. Here is what it is, how it works, and why it matters.',
  alternates: { canonical: 'https://peacecoparent.com/blog/peace-score-co-parenting-2026' },
  openGraph: {
    title: 'How Peace Score Is Changing Co-Parenting in 2026',
    description: 'A new automated metric that shows whether your co-parenting communication is improving or getting worse over time.',
    type: 'article',
    publishedTime: '2026-05-01T00:00:00.000Z',
    authors: ['https://peacecoparent.com'],
  },
};

const others = [
  { href: '/blog/ourfamilywizard-vs-peacecoparent', title: 'OurFamilyWizard vs PeaceCoParent — Honest Comparison' },
  { href: '/blog/how-to-stop-fighting-with-co-parent-over-text', title: 'How to Stop Fighting With Your Co-Parent Over Text' },
  { href: '/blog/how-to-document-co-parenting-for-court', title: 'How to Document Co-Parenting Communication for Court' },
];

export default function Article() {
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: 'How Peace Score Is Changing Co-Parenting in 2026', description: 'Peace Score is a new way to measure how your co-parenting communication is trending over time. Here is what it is, how it works, and why it matters.', datePublished: '2026-05-01', dateModified: '2026-05-01', author: { '@type': 'Organization', name: 'PeaceCoParent', url: 'https://peacecoparent.com' }, publisher: { '@type': 'Organization', name: 'PeaceCoParent', logo: { '@type': 'ImageObject', url: 'https://peacecoparent.com/icon.png' } }, mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://peacecoparent.com/blog/peace-score-co-parenting-2026' } }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://peacecoparent.com' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://peacecoparent.com/blog' }, { '@type': 'ListItem', position: 3, name: 'How Peace Score Is Changing Co-Parenting in 2026', item: 'https://peacecoparent.com/blog/peace-score-co-parenting-2026' }] }} />
    <div className="min-h-screen pcp-page">
      <div className="bg-[var(--ink)] px-6 pb-12 pt-16">
        <div className="mx-auto max-w-[720px]">
          <Link href="/blog" className="mb-6 inline-block text-[14px] text-[var(--green-tint)] no-underline">← All articles</Link>
          <div style={{ fontSize: '13px', color: 'oklch(55% 0.02 80)', marginBottom: '8px' }}>7 min read · May 2026</div>
          <div style={{ fontSize: '13px', color: 'oklch(55% 0.02 80)', marginBottom: '16px' }}>By PeaceCoParent Editorial Team</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 5vw, 44px)', color: 'var(--bg)', margin: 0, lineHeight: 1.15 }}>
            How Peace Score Is Changing Co-Parenting in 2026
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[720px] px-6 py-12">
        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-[clamp(24px,4vw,48px)]">

          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            Most co-parenting tools are built to document conflict. They log your messages, timestamp your expenses, and produce a PDF if you ever need to go to court. That is useful. But it does not actually help you communicate better.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            Peace Score is a different approach. Instead of just recording what happened, it measures whether things are getting better or worse over time.
          </p>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>What is Peace Score?</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            Peace Score is a number between 0 and 100 that reflects the emotional tone of your co-parenting communication over the past 30 days. It is calculated by <Link href="/register" style={{ color: 'var(--green-deep)', fontWeight: 600 }}>PeaceCoParent</Link>&apos;s coach based on how escalating or calm your messages tend to be.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            Every time you use the coach to review a message before sending, it gives that message an escalation risk score from 0 to 10. Peace Score is the inverse average of those scores over 30 days, converted to a 0 to 100 scale.
          </p>
          <ul style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}><strong>80 to 100:</strong> Peaceful. Your communication is consistently calm and child-focused.</li>
            <li style={{ marginBottom: '8px' }}><strong>60 to 79:</strong> Calm. Generally positive with occasional friction.</li>
            <li style={{ marginBottom: '8px' }}><strong>40 to 59:</strong> Neutral. Some escalation present but manageable.</li>
            <li style={{ marginBottom: '8px' }}><strong>20 to 39:</strong> Tense. Conflict patterns are showing up regularly.</li>
            <li><strong>0 to 19:</strong> High conflict. Communication is frequently escalating.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Why a score matters more than a log</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            When you are in a high-conflict co-parenting situation, it is genuinely hard to tell whether things are improving. You remember the bad moments. You forget how many times the handover actually went fine. Emotions make it difficult to see the trend clearly.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            A score cuts through that. When you can see that your Peace Score went from 42 in January to 71 in March, you have a clear record of real progress. That matters for your own motivation — and a visible trend of improving communication can be useful context to share with a mediator or attorney.
          </p>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>The weekly chart and key factors</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            PeaceCoParent shows your Peace Score as a bar chart going back 8 weeks. You can see at a glance whether the last few weeks have been better or worse than before. Green bars are good. Yellow and red bars tell you something worth looking at.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            Below the chart, the app surfaces the specific messages that are pulling your score down. These are the three messages in the past month with the highest escalation risk. Seeing them named specifically, rather than feeling a vague sense that things are tense, makes it much easier to understand what patterns to work on.
          </p>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Sharing your Peace Score with a mediator or attorney</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            One of the most practical uses of Peace Score is in professional settings. PeaceCoParent&apos;s attorney and mediator portal lets you give read-only access to a professional, and that professional can now see your Peace Score and weekly trend alongside your message history.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            For a mediator, being able to see an 8-week Peace Score chart before a session is useful context. They can see whether the last two weeks have been calmer or more heated, and adjust accordingly. For an attorney, a trend of consistently improving Peace Scores is objective documentation of good-faith effort on your part.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            No other co-parenting app currently offers this kind of automated conflict trend analysis to legal professionals in real time.
          </p>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>How to start building your Peace Score</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 16px' }}>
            Peace Score is built automatically from your coaching history. Every message you review with PeaceCoach before sending contributes to your score. The more you use it, the more accurate and meaningful the score becomes.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            You need at least two scored messages before a Peace Score appears. After that, it updates automatically after every coaching session.
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>
            The goal is not a perfect score of 100. The goal is a score that trends upward over time — which means your communication is genuinely improving, one message at a time.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' }} />
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: 0 }}>
            Peace Score is available to all Personal and Professional plan users. It is built into your dashboard and updates automatically. No setup required.
          </p>
        </div>

        <div style={{ marginTop: '40px', background: 'var(--green-deep)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--bg)', margin: '0 0 12px' }}>Start building your Peace Score</h3>
          <p style={{ color: 'oklch(68% 0.04 155)', fontSize: '16px', margin: '0 0 24px' }}>coaching, conflict trend tracking, and timestamped activity reports. $14/month covers both parents.</p>
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
