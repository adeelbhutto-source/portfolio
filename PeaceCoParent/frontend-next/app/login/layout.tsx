import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to PeaceCoParent — your co-parenting dashboard for messages, calendar, expenses and timestamped activity reports.',
  alternates: { canonical: 'https://peacecoparent.com/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
