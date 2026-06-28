import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'How to Stop Fighting With Your Co-Parent Over Text',
  description: 'Texting your co-parent turns into a fight almost every time. Here is what actually works to stop the cycle.',
  alternates: { canonical: 'https://peacecoparent.com/blog/how-to-stop-fighting-with-co-parent-over-text' },
  openGraph: { title: 'How to Stop Fighting With Your Co-Parent Over Text', description: 'Texting your co-parent turns into a fight almost every time. Here is what actually works.', type: 'article', publishedTime: '2026-04-15T00:00:00.000Z', authors: ['https://peacecoparent.com'] },
};

export default function Article() {
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Stop Fighting With Your Co-Parent Over Text', description: 'Texting your co-parent turns into a fight almost every time. Here is what actually works to stop the cycle.', datePublished: '2026-04-15', dateModified: '2026-04-15', author: { '@type': 'Organization', name: 'PeaceCoParent', url: 'https://peacecoparent.com' }, publisher: { '@type': 'Organization', name: 'PeaceCoParent', logo: { '@type': 'ImageObject', url: 'https://peacecoparent.com/icon.png' } }, mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://peacecoparent.com/blog/how-to-stop-fighting-with-co-parent-over-text' } }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://peacecoparent.com' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://peacecoparent.com/blog' }, { '@type': 'ListItem', position: 3, name: 'How to Stop Fighting With Your Co-Parent Over Text', item: 'https://peacecoparent.com/blog/how-to-stop-fighting-with-co-parent-over-text' }] }} />
    <div className="min-h-screen pcp-page">
      <div className="bg-[var(--ink)] px-6 pb-12 pt-16">
        <div className="mx-auto max-w-[720px]">
          <Link href="/blog" className="mb-6 inline-block text-[14px] text-[var(--green-tint)] no-underline">← All articles</Link>
          <div style={{ fontSize: '13px', color: 'oklch(55% 0.02 80)', marginBottom: '8px' }}>5 min read · April 15, 2026</div>
          <div style={{ fontSize: '13px', color: 'oklch(55% 0.02 80)', marginBottom: '16px' }}>By PeaceCoParent Editorial Team</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 5vw, 44px)', color: 'var(--bg)', margin: 0, lineHeight: 1.15 }}>
            How to Stop Fighting With Your Co-Parent Over Text
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-[720px] px-6 py-12">
        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-[clamp(24px,4vw,48px)]">
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>Most co-parents will tell you the same thing: the arguments don&apos;t start in person. They start over text. You send what feels like a reasonable message. They respond with something that feels like an attack. You fire back. Before you know it, a conversation about school pickup has turned into a full-blown argument, and your kids are the ones who suffer for it.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>If this sounds familiar, you are not alone. And you are not a bad person. Texting is one of the worst mediums for sensitive communication. Tone is invisible. Emotions are invisible. All that&apos;s left are words stripped of context.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Wait before you send</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>The most powerful thing you can do is nothing. When you feel the urge to reply immediately, wait. Not forever, just long enough to breathe. Fifteen minutes is usually enough to separate the emotional reaction from the response you actually want to send.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>A message sent in anger takes two seconds. The damage it causes can last weeks.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Write it, then rewrite it</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>Write what you actually want to say. Get it out of your system. Then go back and rewrite it with one question in mind: if my child read this in ten years, would I be proud of it? This reframe changes everything. It moves the conversation from winning to what actually matters.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Stick to facts, not feelings</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>&quot;You are always late&quot; is a feeling disguised as a fact. &quot;Pickup was scheduled for 3pm and you arrived at 3:45pm&quot; is a fact. Facts are hard to argue with. Feelings invite counter-attacks. When you stick to what actually happened: dates, times, amounts — the other parent has much less to work with.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Use one channel for everything</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>When co-parenting communication is scattered across texts, emails, WhatsApp, and voicemails, it becomes impossible to track. Things get missed. Misunderstandings happen. Use one channel for all co-parenting communication. This also means you have a clear record of everything if things ever escalate.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>Let the coach catch you before you send</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>New tools let you paste your draft message and get a coaching review before you send. It scores the emotional escalation risk, explains what is triggering in your message, and suggests a calmer version. You still decide what to send — you just get a second opinion when emotions are highest.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>This is what <Link href="/register" style={{ color: 'var(--green-deep)', fontWeight: 600 }}>PeaceCoParent&apos;s Coach</Link> does. Paste your draft, choose a coaching mode, and get an instant rewrite. You are in control of every word — the coach just helps you say it without starting a war.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>What to do when the other parent is difficult</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>Sometimes you do everything right and the other parent still escalates. In that case, document everything. Every message. Every missed pickup. Every disagreement about expenses. If things ever go to court or mediation, having a clear, timestamped record of communication is invaluable.</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', margin: '40px 0 16px' }}>When your co-parent uses text as a weapon</h2>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>Some co-parents deliberately send provocative messages to get a reaction they can use against you. Accusatory, emotionally loaded texts designed to trigger a response that looks bad out of context. It is more common than people admit, and it is worth knowing how to handle it.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>In these situations, the goal shifts completely. You are no longer trying to have a productive conversation. You are building a record. Reply briefly and factually. Do not engage with the emotional content. &quot;Noted. I will confirm by Thursday.&quot; Full stop. Short, documented, unemotional responses are more useful to you long-term than anything that might feel satisfying in the moment.</p>
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 24px' }}>And if messages become threatening or constitute harassment, do not rely on screenshots — use a platform that timestamps and logs everything automatically, so the record cannot be disputed or taken out of context.</p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' }} />
          <p style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.8, margin: 0 }}>Fighting over text is not inevitable. It is a habit and habits can be broken. Start with one of these strategies today and see what changes.</p>
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
            {[
              { href: '/blog/co-parenting-communication-tips', title: 'Co-Parenting Communication Tips That Actually Work' },
              { href: '/blog/how-to-document-co-parenting-for-court', title: 'How to Document Co-Parenting Communication for Court' },
              { href: '/blog/ourfamilywizard-vs-peacecoparent', title: 'OurFamilyWizard vs PeaceCoParent — Honest Comparison' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display: 'block', background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--ink)', fontSize: '15px', fontWeight: 600 }}>{a.title} →</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
