import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ background: 'var(--bg)' }}>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: 'var(--green-tint)' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '36px', color: 'var(--green-deep)' }}>
          404
        </span>
      </div>
      <h1 className="mb-3 text-[32px]"
        style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}>
        Page not found
      </h1>
      <p className="mb-8 max-w-sm text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard"
          className="pcp-btn-secondary rounded-full px-6 py-2.5 text-[14px] font-semibold no-underline">
          Go to dashboard
        </Link>
        <Link href="/"
          className="pcp-btn-primary rounded-full px-6 py-2.5 text-[14px] font-semibold no-underline">
          Go home
        </Link>
      </div>
    </div>
  );
}
