/**
 * Reusable page header for app pages.
 * Provides consistent visual treatment: dark warm-text background,
 * label badge, title, optional description, and optional action slot.
 */
import { ReactNode } from 'react';

interface PageHeaderProps {
  label: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ label, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-[24px]" style={{ background: 'var(--ink)' }}>
      {/* Top accent strip */}
      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, var(--green), var(--green-deep))' }} />
      <div className="flex flex-col gap-5 px-7 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--green-tint)] opacity-80">
            {label}
          </div>
          <h1
            className="mb-2.5 leading-[1.05] text-[var(--bg)]"
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(24px, 5vw, 34px)',
              letterSpacing: '-0.02em',
              fontWeight: 400,
            }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-[14px] leading-relaxed" style={{ color: 'oklch(70% 0.02 80)', maxWidth: '540px' }}>
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
