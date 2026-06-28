import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Pricing — Both Parents, One Price',
  description: 'PeaceCoParent costs $14/month and covers both parents completely. No per-seat fees. Free plan available. message coaching, timestamped activity reports, shared calendar.',
  alternates: { canonical: 'https://peacecoparent.com/pricing' },
  openGraph: {
    title: 'PeaceCoParent Pricing — $14/month covers both parents',
    description: 'One plan. Both parents. No per-seat fees. Free plan available — upgrade to unlock coaching and timestamped activity reports.',
    url: 'https://peacecoparent.com/pricing',
  },
};

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PeaceCoParent',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  url: 'https://peacecoparent.com',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', description: 'Messaging, calendar, 3 expense requests/month, child profiles' },
    { '@type': 'Offer', name: 'Personal', price: '14', priceCurrency: 'USD', description: 'message coaching, unlimited expenses, timestamped activity reports, Google Calendar sync. Covers both parents.' },
    { '@type': 'Offer', name: 'Professional', price: '39', priceCurrency: 'USD', description: 'Everything in Personal plus attorney & mediator access and priority support.' },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Do both parents need to pay?', acceptedAnswer: { '@type': 'Answer', text: 'No. One subscription covers both parents. When one parent upgrades, both get full access — no double billing.' } },
    { '@type': 'Question', name: 'Can I cancel anytime?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, cancel anytime with one click. No contracts, no fees. Your data stays accessible on the free tier.' } },
    { '@type': 'Question', name: 'Can I share my records with my attorney or mediator?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every message, expense and event is timestamped and exportable as a PDF. Personal+ plans generate clean reports without watermarks. You can also grant direct read-only access via the attorney portal.' } },
    { '@type': 'Question', name: 'What payment methods do you accept?', acceptedAnswer: { '@type': 'Answer', text: 'All major credit and debit cards via Stripe. Payments are encrypted and we never store card details.' } },
  ],
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={pricingJsonLd} />
      <JsonLd data={faqJsonLd} />
      {children}
    </>
  );
}
