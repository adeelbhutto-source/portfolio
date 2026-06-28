'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

const NAV_MAIN = [
  {
    label: 'Dashboard', href: '/dashboard',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    label: 'Messages', href: '/messages',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
  {
    label: 'Calendar', href: '/calendar',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: 'Expenses', href: '/expenses',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  },
  {
    label: 'Documents', href: '/documents',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  },
  {
    label: 'Reports', href: '/court-report',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
];

const NAV_TOOLS = [
  {
    label: 'Coaching', href: '/coach',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></svg>,
  },
  {
    label: 'Peace Score', href: '/peace-score',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    label: 'Children', href: '/children',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    label: 'Calls', href: '/calls',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14"/><rect x="3" y="6" width="12" height="12" rx="2"/></svg>,
  },
  {
    label: 'Attorney', href: '/attorney',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  },
  {
    label: 'Settings', href: '/account',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  },
];

function NavItem({ href, label, icon, active, onClick }: {
  href: string; label: string; icon: React.ReactNode; active: boolean; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium no-underline transition-all duration-150"
      style={active
        ? { background: 'rgba(248,244,238,0.08)', color: '#F1ECDF', borderLeft: '2.5px solid var(--clay)', paddingLeft: '10px' }
        : { color: 'rgba(248,244,238,0.6)', background: 'none', borderLeft: '2.5px solid transparent', paddingLeft: '10px' }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(248,244,238,0.05)'; (e.currentTarget as HTMLAnchorElement).style.color = '#F1ECDF'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'none'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,244,238,0.6)'; } }}
    >
      <span style={{ opacity: active ? 1 : 0.85, flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="pcp-sidebar-scroll flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]"
        style={{ color: 'rgba(248,244,238,0.35)', fontFamily: 'var(--mono)' }}>The Work</div>
      {NAV_MAIN.map(l => (
        <NavItem key={l.href} href={l.href} label={l.label} icon={l.icon}
          active={pathname === l.href || (l.href === '/court-report' && pathname === '/court-report')}
          onClick={onNavigate} />
      ))}
      <div className="mb-1.5 mt-3 px-3 text-[10px] font-bold uppercase tracking-[0.1em]"
        style={{ color: 'rgba(248,244,238,0.35)', fontFamily: 'var(--mono)' }}>The Coach</div>
      {NAV_TOOLS.map(l => (
        <NavItem key={l.href} href={l.href} label={l.label} icon={l.icon}
          active={pathname === l.href}
          onClick={onNavigate} />
      ))}
    </nav>
  );
}

export default function AppLayout({ children, fullWidth, noPadding }: AppLayoutProps) {
  const { user, familyMember, logout } = useAuth();
  const { tier } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';
  const color = familyMember?.color ?? 'var(--green)';

  async function handleLogout() {
    setUserOpen(false);
    await logout();
    router.push('/');
  }

  const sidebarBg = 'var(--green-deep)';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', fontFamily: 'var(--sans)' }}>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-10 hidden h-screen w-[240px] flex-shrink-0 flex-col lg:flex"
        style={{ background: sidebarBg }}>
        {/* Logo → dashboard */}
        <Link href="/dashboard" className="flex items-center gap-2.5 border-b px-5 py-6 no-underline transition-opacity hover:opacity-90"
          style={{ borderColor: 'oklch(36% 0.02 80)' }}>
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] text-[17px] text-white"
            style={{ background: '#F1ECDF', fontFamily: 'var(--serif)' }}>
            <span style={{ color: 'var(--green-deep)', fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1 }}>P</span>
          </div>
          <div>
            <div className="text-[14px] font-semibold" style={{ color: '#F1ECDF', fontFamily: 'var(--sans)' }}>PeaceCoParent</div>
            <div className="text-[10px]" style={{ color: 'rgba(248,244,238,0.45)', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>CALM CO-PARENTING</div>
          </div>
        </Link>

        <SidebarContent />

        {/* Upgrade banner (free tier) */}
        {tier === 'free' && (
          <div className="px-3 pb-2">
            <Link href="/pricing"
              className="flex items-center justify-between gap-2 rounded-[12px] px-3 py-3 no-underline transition-all hover:opacity-95 hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, var(--green), var(--green-deep))' }}>
              <div>
                <div className="text-[12px] font-bold text-white leading-tight">Upgrade to Personal</div>
                <div className="text-[10px] font-medium mt-0.5" style={{ color: 'oklch(85% 0.05 155)' }}>Coach · Unlimited expenses</div>
              </div>
              <span className="flex-shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">$14/mo</span>
            </Link>
          </div>
        )}

        {/* User */}
        <div className="border-t px-4 py-3" style={{ borderColor: 'oklch(36% 0.02 80)' }}>
          <div className="relative">
            <button
              onClick={() => setUserOpen(o => !o)}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left transition-all"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(34% 0.02 80)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                style={{ background: color }}>{initials}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--bg)' }}>
                  {user?.name?.split(' ')[0]}
                </p>
                <p className="text-[11px] capitalize" style={{ color: 'oklch(55% 0.02 80)' }}>{tier} plan</p>
              </div>
              <svg width="10" height="10" fill="none" stroke="oklch(55% 0.02 80)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {userOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-[16px] shadow-xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{user?.name}</p>
                    <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>{user?.email}</p>
                  </div>
                  {[
                    { to: '/profile', label: 'Edit profile' },
                    { to: '/account', label: 'Account settings' },
                  ].map(item => (
                    <Link key={item.to} href={item.to} onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-[13px] text-[var(--ink-soft)] no-underline transition-colors hover:bg-[var(--bg)] hover:text-[var(--ink)]">
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout}
                    className="w-full border-t px-4 py-2.5 text-left text-[13px] transition-colors"
                    style={{ borderColor: 'var(--border)', background: 'none', color: 'oklch(55% 0.14 25)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-[240px] flex-col shadow-2xl" style={{ background: sidebarBg }}>
            <div className="flex items-center justify-between border-b p-5"
              style={{ borderColor: 'oklch(36% 0.02 80)' }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[15px] text-white"
                  style={{ background: 'var(--green)', fontFamily: 'var(--serif)' }}>P</div>
                <span className="text-[13px] font-semibold" style={{ color: 'var(--bg)' }}>PeaceCoParent</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: 'oklch(34% 0.02 80)', border: 'none', color: 'oklch(65% 0.02 80)', cursor: 'pointer' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Mobile topbar — logo + avatar only */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 lg:hidden"
          style={{ background: 'color-mix(in srgb, var(--bg) 95%, transparent)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <div className="flex h-7 w-7 items-center justify-center rounded-[7px]"
              style={{ background: 'var(--green)', fontFamily: 'var(--serif)' }}>
              <span style={{ color: '#F1ECDF', fontSize: 14, lineHeight: 1 }}>P</span>
            </div>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>PeaceCoParent</span>
          </Link>
          <div className="relative">
            <button onClick={() => setUserOpen(o => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{ background: color, border: 'none', cursor: 'pointer' }}>
              {initials}
            </button>
            {userOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-[16px] shadow-xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                    <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{user?.name}</p>
                    <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>{user?.email}</p>
                  </div>
                  {[{ to: '/profile', label: 'Edit profile' }, { to: '/account', label: 'Account settings' }].map(item => (
                    <Link key={item.to} href={item.to} onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-[13px] no-underline" style={{ color: 'var(--ink-soft)' }}>
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout}
                    className="w-full border-t px-4 py-2.5 text-left text-[13px]"
                    style={{ borderColor: 'var(--border)', background: 'none', color: 'oklch(55% 0.14 25)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className={noPadding ? 'flex flex-1 flex-col' : 'flex-1 p-4 pb-24 md:pb-6 md:p-6 lg:p-8'} style={{ overflowX: 'clip' }}>
          <div className={noPadding || fullWidth ? 'h-full' : 'max-w-5xl'}>
            {children}
          </div>
          {!noPadding && (
            <p className="mt-8 max-w-5xl px-0 text-[11px] leading-relaxed text-[var(--ink-soft)] opacity-50">
              PeaceCoParent provides communication and organizational tools only — not legal, therapeutic, or professional advice. Coaching suggestions are guidance only. You are responsible for all content you send. Records are not guaranteed to be accepted by any court or authority.
            </p>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t lg:hidden"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {[
            { href: '/dashboard', label: 'Home', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { href: '/messages', label: 'Messages', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
            { href: '/calendar', label: 'Calendar', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            { href: '/coach', label: 'Coach', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg> },
            { href: '/expenses', label: 'Expenses', icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          ].map(({ href, label, icon }) => {
            const active = pathname === href || (href === '/coach' && pathname?.startsWith('/coach'));
            return (
              <Link key={href} href={href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 no-underline transition-colors"
                style={{ color: active ? 'var(--green)' : 'var(--ink-mute)' }}>
                <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
                <span style={{ fontSize: 9.5, fontFamily: 'var(--mono)', letterSpacing: '0.04em', fontWeight: active ? 700 : 500 }}>
                  {label.toUpperCase()}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
