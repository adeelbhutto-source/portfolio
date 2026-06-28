import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | PeaceCoParent',
  description: 'Terms and conditions for using PeaceCoParent.',
};

const SECTIONS = [
  { n: 1,  h: 'Acceptance of terms', t: 'By accessing or using PeaceCoParent ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These Terms apply to all users, including free and paid accounts.' },
  { n: 2,  h: 'Description of service', t: 'PeaceCoParent is a communication and organisational tool for co-parents. It provides timestamped messaging, a shared calendar, expense tracking, document storage, activity report export, child profile management, and message coaching. PeaceCoParent is not a legal service, therapeutic service, or any form of professional advisory service.' },
  { n: 3,  h: 'No professional advice', t: 'PeaceCoParent does not provide legal advice, legal representation, therapeutic counselling, financial advice, or any other form of professional advice. Nothing in the Service, including coaching suggestions, reports, records, or any other output, constitutes professional advice of any kind. You should consult a qualified attorney, therapist, financial advisor, or other relevant professional for advice specific to your situation. Use of this Service does not create any attorney-client, therapist-client, or other professional relationship.' },
  { n: 4,  h: 'Message coaching — important limitations', t: 'The coaching feature ("PeaceCoach") provides communication suggestions only. All coaching suggestions are guidance only — they are not legal advice, therapeutic advice, or professional recommendations of any kind. You are solely responsible for all content you choose to send, regardless of whether it was suggested or influenced by coaching. PeaceCoach does not guarantee that following its suggestions will improve any legal, personal, or court outcome. Message content is processed by a third-party coaching service with no data retention. Sender names are anonymised before coaching review.' },
  { n: 5,  h: 'Documentation and reports', t: 'PeaceCoParent allows you to export activity reports ("reports") containing your communication history, expenses, and calendar events. These reports are timestamped and tamper-evident for organisational purposes. PeaceCoParent makes no representation, warranty, or guarantee that any report, record, or document produced by the Service will be accepted, admitted, or considered by any court, tribunal, mediator, authority, or third party. You are solely responsible for how you use and present any documentation from the Service.' },
  { n: 6,  h: 'User responsibility for content', t: 'You are solely responsible for all content you create, send, upload, or store through the Service. PeaceCoParent does not review, endorse, or take responsibility for user-generated content. You agree not to use the Service to harass, threaten, or intimidate others; submit false or misleading information; alter records you did not create; violate any applicable law or regulation; upload illegal, harmful, or infringing content; or attempt to reverse-engineer or compromise the platform.' },
  { n: 7,  h: 'Tamper-evident records', t: 'Messages and expenses cannot be edited or deleted once submitted. This design helps produce consistent records for documentation purposes. It does not guarantee legal admissibility. Calendar events may be edited or deleted by the parent who created them, and deleted events are retained in system logs.' },
  { n: 8,  h: 'Eligibility', t: 'You must be at least 18 years old to create an account. PeaceCoParent is intended for parents, legal guardians, attorneys, mediators, and other authorised adults involved in co-parenting arrangements.' },
  { n: 9,  h: 'Account registration', t: 'You are responsible for maintaining the confidentiality of your login credentials. Provide accurate, current information and notify us immediately of any unauthorised access at hello@peacecoparent.com.' },
  { n: 10, h: 'Attorney and caregiver access', t: 'Attorneys and mediators granted read-only access may view messages, expenses, documents, and calendar events for the purpose of providing professional services to their client. Caregivers may view child profile information. Both access types may be revoked by the account holder at any time. PeaceCoParent does not verify the professional credentials of any person granted access.' },
  { n: 11, h: 'Payments and subscriptions', t: 'Paid plans are billed monthly. Payments are processed securely by Stripe. You may cancel at any time from your Account settings — cancellation takes effect at the end of the current billing period. We offer a 30-day money-back guarantee for first-time paid subscriptions. For billing questions, contact hello@peacecoparent.com.' },
  { n: 12, h: 'Disclaimers', t: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. PEACECOPARENT DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. PEACECOPARENT IS NOT A LAW FIRM, DOES NOT PROVIDE LEGAL ADVICE, AND IS NOT RESPONSIBLE FOR ANY LEGAL OUTCOMES RELATED TO YOUR USE OF THE SERVICE. COACHING SUGGESTIONS ARE NOT PROFESSIONAL ADVICE.', mono: true },
  { n: 13, h: 'Limitation of liability', t: 'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PEACECOPARENT AND ITS OWNER(S) SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR ANY NEGATIVE LEGAL OUTCOME, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE AMOUNTS YOU HAVE PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100 IF YOU HAVE PAID NOTHING.', mono: true },
  { n: 14, h: 'Indemnification', t: 'You agree to indemnify, defend, and hold harmless PeaceCoParent and its owner(s) from and against any claims, damages, losses, liabilities, costs, and expenses arising out of or related to: (a) your use of the Service; (b) your violation of these Terms; (c) content you submit, send, or upload; or (d) your violation of any third-party rights.' },
  { n: 15, h: 'Intellectual property', t: 'The PeaceCoParent platform, brand, and software are the intellectual property of PeaceCoParent. You retain ownership of the content you create. By using the Service, you grant PeaceCoParent a limited, non-exclusive licence to process your content solely for the purpose of providing the Service.' },
  { n: 16, h: 'Privacy and data', t: 'Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. We process data in accordance with applicable privacy laws, including GDPR for users in the EU/EEA/UK. If you are in the EU/EEA/UK, you have the right to access, rectify, erase, restrict, and port your personal data, and to object to processing. To exercise any of these rights, contact us at hello@peacecoparent.com. In the event of a personal data breach that poses a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours and affected users without undue delay.' },
  { n: 17, h: 'Governing law', t: 'These Terms are governed by the laws of Norway. Any disputes shall be resolved in Norwegian courts, unless mandatory consumer protection laws in your country of residence require otherwise. Users in the EU/EEA retain all rights under applicable EU consumer and data protection law.' },
  { n: 18, h: 'Changes to terms', t: 'We may update these Terms from time to time. We will notify registered users by email at least 14 days before material changes take effect. Continued use of the Service after changes take effect constitutes your acceptance of the updated Terms.' },
  { n: 19, h: 'Contact', t: 'Questions about these Terms? Email hello@peacecoparent.com.' },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--sans)', color: 'var(--ink)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 56px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: '#F1ECDF', fontWeight: 400, lineHeight: 1 }}>P</span>
          </div>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>PeaceCoParent</span>
        </Link>
        <Link href="/" style={{ fontSize: 13.5, color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>← Back to peacecoparent.com</Link>
      </div>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '72px 56px 100px' }}>
        <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Trust · last updated May 12, 2026</div>
        <h1 className="pcp-display" style={{ fontSize: 'clamp(48px, 7vw, 80px)', lineHeight: 0.98, letterSpacing: '-0.035em', marginTop: 18, marginBottom: 0 }}>
          Terms of <em>service.</em>
        </h1>

        {/* Lead warning */}
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--clay-tint)', borderRadius: 12, border: '1px solid #E8B898', fontSize: 17, lineHeight: 1.55, color: '#7A2E1E', marginBottom: 48 }}>
          <span style={{ fontWeight: 700, color: 'var(--warn)' }}>Important: </span>
          PeaceCoParent provides communication and organisational tools only. It is not a legal service and does not provide legal, therapeutic, or professional advice. Coaching suggestions are guidance only. You are responsible for all content you send.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {SECTIONS.map(s => (
            <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 24 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--clay)', letterSpacing: '.04em', paddingTop: 4 }}>
                {String(s.n).padStart(2, '0')}
              </div>
              <div>
                <h2 className="pcp-display" style={{ fontSize: 26, letterSpacing: '-0.015em', marginBottom: 12, fontWeight: 400, color: 'var(--ink)' }}>{s.h}</h2>
                <p style={{ fontSize: s.mono ? 12 : 15, lineHeight: 1.65, color: 'var(--ink-soft)', fontFamily: s.mono ? 'var(--mono)' : 'inherit', letterSpacing: s.mono ? '.03em' : 'normal' }}>
                  {s.t}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 56px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-mute)', letterSpacing: '.04em' }}>
        <div>© 2026 PeaceCoParent</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Privacy Policy</Link>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>peacecoparent.com</Link>
        </div>
      </footer>
    </div>
  );
}
