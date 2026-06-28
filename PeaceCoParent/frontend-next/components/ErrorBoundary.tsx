'use client';
import { Component, type ReactNode } from 'react';
import Link from 'next/link';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error) {
    console.error('[ErrorBoundary]', err);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
        style={{ background: 'var(--bg)' }}>
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'oklch(95% 0.03 25)' }}>
          <svg width="28" height="28" fill="none" stroke="oklch(55% 0.18 25)" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h1 className="mb-2 text-[24px]"
          style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
          Something went wrong
        </h1>
        <p className="mb-7 max-w-sm text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          {this.state.message || 'An unexpected error occurred. Try refreshing the page.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="pcp-btn-secondary rounded-full px-5 py-2.5 text-[14px] font-semibold">
            Try again
          </button>
          <Link href="/"
            className="pcp-btn-primary rounded-full px-5 py-2.5 text-[14px] font-semibold no-underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }
}
