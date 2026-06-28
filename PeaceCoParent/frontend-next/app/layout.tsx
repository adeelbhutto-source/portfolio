import type { Metadata, Viewport } from 'next';
import { DM_Sans, DM_Serif_Display, Newsreader, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { JsonLd } from '@/components/JsonLd';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
  weight: '400',
  style: ['normal', 'italic'],
});

const BASE = 'https://peacecoparent.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'PeaceCoParent — Co-parent without the conflict',
    template: '%s | PeaceCoParent',
  },
  description: 'Catch the message before you regret it. PeaceCoach reviews your drafts, logs everything court-ready, shared calendar — $14/mo, both parents.',
  keywords: [
    'co-parenting app', 'co-parent app', 'shared custody app',
    'OurFamilyWizard alternative', 'OurFamilyWizard cheaper', 'best co-parenting app 2026',
    'peaceful parenting app', 'peaceful parent app', 'peaceful co-parenting', 'calm co-parenting app',
    'co-parenting tools', 'co-parent communication', 'child custody app',
    'message coach', 'co-parenting documentation app', 'separated parents app',
    'co-parenting software', 'custody management app', 'peace score co-parenting',
    'conflict tracking co-parenting', 'attorney portal co-parenting',
  ],
  authors: [{ name: 'PeaceCoParent' }],
  creator: 'PeaceCoParent',
  publisher: 'PeaceCoParent',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE,
    siteName: 'PeaceCoParent',
    title: 'PeaceCoParent — Co-parenting without the conflict',
    description: 'message coaching, shared calendar, and timestamped activity reports. One plan covers both parents — $14/month.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'PeaceCoParent — Co-parenting without the conflict' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PeaceCoParent — Co-parenting without the conflict',
    description: 'message coaching, shared calendar, and timestamped activity reports. $14/month covers both parents.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: BASE },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${dmSans.variable} ${dmSerif.variable} ${newsreader.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MGKGXV9M');` }} />
        {/* End Google Tag Manager */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1M9X4VQF6X" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1M9X4VQF6X');
          gtag('config', 'AW-18147018788');
        `}} />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--sans), system-ui, sans-serif' }}>
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MGKGXV9M" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Organization', name: 'PeaceCoParent', url: 'https://peacecoparent.com', logo: 'https://peacecoparent.com/icon.png', sameAs: [], description: 'Co-parenting app with message coaching, tamper-evident records, and shared tools for separated parents.' }} />
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'PeaceCoParent', url: 'https://peacecoparent.com', potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: 'https://peacecoparent.com/blog?q={search_term_string}' }, 'query-input': 'required name=search_term_string' } }} />
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'PeaceCoParent', applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', url: 'https://peacecoparent.com', offers: { '@type': 'Offer', price: '14', priceCurrency: 'USD', description: 'Both parents included' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '47' } }} />
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'Does my co-parent also need to pay?', acceptedAnswer: { '@type': 'Answer', text: 'No — one plan covers both parents completely. You pay $14/month and your co-parent gets full access at no extra cost.' } }, { '@type': 'Question', name: 'How does the message coach work?', acceptedAnswer: { '@type': 'Answer', text: 'Before you send a message, PeaceCoach reviews it for emotional triggers and conflict-prone language. It suggests a calmer rewrite — you choose whether to use it or send your original.' } }, { '@type': 'Question', name: 'Can I use the records in court?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — you can export a clean, timestamped PDF of your full communication history, expenses, and events at any time.' } }, { '@type': 'Question', name: 'Can I cancel anytime?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Cancel anytime with no penalties. Your data remains accessible on the free tier after cancellation. We offer a 30-day money-back guarantee for first-time paid subscriptions.' } }] }} />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}