import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up Free — No Credit Card Needed',
  description: 'Create your free PeaceCoParent account in under a minute. No credit card needed. Start organising co-parenting with a shared calendar, messaging, and expense tracking.',
  alternates: { canonical: 'https://peacecoparent.com/register' },
  openGraph: {
    title: 'Sign Up Free | PeaceCoParent',
    description: 'Start co-parenting more calmly — free account, no credit card required.',
    url: 'https://peacecoparent.com/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
