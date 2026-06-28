import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Co-Parenting Advice & Resources | PeaceCoParent',
  description: 'Practical advice for separated parents on communication, documentation, and peaceful co-parenting.',
  alternates: { canonical: 'https://peacecoparent.com/blog' },
};

const ARTICLES = [
  { href: '/blog/co-parenting-with-a-narcissist', title: 'Co-Parenting With a Narcissist: How to Protect Yourself and Your Records', excerpt: 'When co-parenting feels like a battleground, the normal rules do not apply. Here is what actually works — and how to protect your legal position.', read: '9 min', date: 'May 19, 2026', featured: true },
  { href: '/blog/peace-score-co-parenting-2026', title: 'How Peace Score Is Changing Co-Parenting in 2026', excerpt: 'A new automated metric that shows whether your co-parenting communication is improving — or just getting quieter.', read: '7 min', date: 'May 14, 2026' },
  { href: '/blog/how-to-stop-fighting-with-co-parent-over-text', title: 'How to Stop Fighting With Your Co-Parent Over Text', excerpt: 'Texting your co-parent turns into a fight almost every time. Here is what actually works to stop the cycle.', read: '5 min', date: 'May 7, 2026' },
  { href: '/blog/co-parenting-communication-tips', title: 'Co-Parenting Communication Tips That Actually Work', excerpt: 'Practical strategies based on what real co-parents do — not theory.', read: '6 min', date: 'May 7, 2026' },
  { href: '/blog/how-to-document-co-parenting-for-court', title: 'How to Document Co-Parenting Communication for Court', excerpt: 'If your situation ever goes to court or mediation, documentation is everything. Here is how to do it right.', read: '7 min', date: 'May 7, 2026' },
  { href: '/blog/ourfamilywizard-vs-peacecoparent', title: 'OurFamilyWizard vs PeaceCoParent — Honest Comparison', excerpt: 'Both apps claim to help co-parents. Here is an honest look at differences in pricing, features, and who each one is for.', read: '8 min', date: 'May 1, 2026' },
];

export default function BlogPage() {
  const [featured, ...rest] = ARTICLES;
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--sans)', color: 'var(--ink)' }}>
      <style>{`
        @media (max-width: 640px) {
          .blog-nav { padding: 16px 18px !important; }
          .blog-hero-content { padding: 28px 18px 0 !important; }
          .blog-featured-section { padding: 36px 14px 24px !important; }
          .blog-featured-card { grid-template-columns: 1fr !important; gap: 20px !important; padding: 20px !important; }
          .blog-featured-image { height: 160px !important; }
          .blog-grid-section { padding: 16px 14px 60px !important; }
          .blog-article-grid { grid-template-columns: 1fr !important; }
          .blog-footer { padding: 20px 18px !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ background: 'var(--green-deep)', color: '#E8E4D6', position: 'relative', overflow: 'hidden', paddingBottom: 60 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 1000px 500px at 30% 100%,rgba(232,153,104,.10),transparent 60%)' }}/>
        <div style={{ position: 'relative' }}>
          {/* Nav */}
          <div className="blog-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 56px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--green-deep)', lineHeight: 1 }}>P</span>
              </div>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: '#F1ECDF' }}>PeaceCoParent</span>
            </Link>
            <Link href="/register">
              <button style={{ background: '#F1ECDF', color: 'var(--green-deep)', border: 'none', borderRadius: 999, padding: '11px 20px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>Start free trial</button>
            </Link>
          </div>
          <div className="blog-hero-content" style={{ padding: '40px 56px 0', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
            <div className="pcp-eyebrow" style={{ color: 'var(--clay-soft)' }}>Resources · The Folio</div>
            <h1 className="pcp-display" style={{ marginTop: 18, fontSize: 'clamp(48px,7vw,96px)', lineHeight: 0.96, letterSpacing: '-0.04em', color: '#F1ECDF' }}>
              Co-parenting,<br/>without the noise.
            </h1>
            <p style={{ marginTop: 22, fontSize: 18, color: '#9BAE9F', maxWidth: 540, margin: '22px auto 0' }}>
              Practical advice for separated parents. Written by co-parents, therapists, and one family-law attorney. No fluff.
            </p>
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="blog-featured-section" style={{ padding: '60px 56px 40px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Link href={featured.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="blog-featured-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 22, padding: 36, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36, alignItems: 'center' }}>
              <div>
                <span style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--clay)', color: '#F1ECDF', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', marginBottom: 16 }}>FEATURED</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '.06em', marginBottom: 14 }}>
                  <span>{featured.read} read</span><span>·</span><span>{featured.date}</span>
                </div>
                <h2 className="pcp-display" style={{ fontSize: 'clamp(28px,3vw,44px)', lineHeight: 1.04, letterSpacing: '-0.025em' }}>{featured.title}</h2>
                <p style={{ marginTop: 14, fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.55, maxWidth: 460 }}>{featured.excerpt}</p>
                <div style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green)', color: '#F1ECDF', borderRadius: 999, padding: '11px 20px', fontSize: 14, fontWeight: 600 }}>
                  Read article <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <div className="blog-featured-image" style={{ height: 280, background: 'repeating-linear-gradient(135deg,#C8D2BD 0 38px,#B2BFA5 38px 76px,#9CAB8B 76px 114px,#869871 114px 152px)', borderRadius: 18, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 70%,transparent,rgba(20,30,20,.35))' }}/>
                <div style={{ position: 'absolute', left: 16, bottom: 14, fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.1em', color: 'rgba(255,255,255,.9)', padding: '5px 9px', background: 'rgba(0,0,0,.25)', borderRadius: 5 }}>COVER · PEACE SCORE</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Article grid */}
      <div className="blog-grid-section" style={{ padding: '20px 56px 100px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="pcp-eyebrow" style={{ color: 'var(--clay)', marginBottom: 10 }}>More articles</div>
          <h2 className="pcp-display" style={{ fontSize: 40, lineHeight: 1.02, letterSpacing: '-0.02em', marginBottom: 28 }}>Recently <em>published.</em></h2>
          <div className="blog-article-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {rest.map((a) => (
              <Link key={a.href} href={a.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '.06em' }}>
                    <span>{a.read} read</span><span>{a.date}</span>
                  </div>
                  <h3 className="pcp-display" style={{ fontSize: 24, lineHeight: 1.15, letterSpacing: '-0.015em' }}>{a.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5, flex: 1 }}>{a.excerpt}</p>
                  <div style={{ color: 'var(--green)', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Read article <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="blog-footer" style={{ background: 'var(--bg-deep)', borderTop: '1px solid var(--border)', padding: '28px 56px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-mute)', letterSpacing: '.04em' }}>
        <div>© 2026 PeaceCoParent</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Home</Link>
          <Link href="/pricing" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Pricing</Link>
        </div>
      </div>
    </div>
  );
}
