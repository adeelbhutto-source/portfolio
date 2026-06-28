import Link from 'next/link';

export default function Logo({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const box =
    size === 'lg' ? 'h-11 w-11 rounded-[11px] text-[20px]' :
    size === 'md' ? 'h-10 w-10 rounded-[10px] text-[18px]' :
                   'h-9 w-9 rounded-[9px] text-[16px]';

  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline">
      <div
        className={`flex flex-shrink-0 items-center justify-center text-white ${box}`}
        style={{ background: 'var(--green)', fontFamily: 'var(--serif)' }}
      >
        P
      </div>
      <div>
        <div className="text-[14px] font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
          PeaceCoParent
        </div>
        <div className="text-[11px] leading-tight" style={{ color: 'var(--ink-soft)' }}>
          Calm co-parenting
        </div>
      </div>
    </Link>
  );
}
