'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors hover:text-fg ${
      pathname === path ? 'text-accent' : 'text-muted'
    }`;

  const mobileLinkClass = (path: string) =>
    `rounded-md px-3 py-2 text-base font-medium transition-colors hover:text-fg hover:bg-surface-2 ${
      pathname === path ? 'text-accent' : 'text-muted'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border-25">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="font-display text-h3 font-semibold tracking-tight text-fg" aria-label="Lumen home">
              Lumen
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="/gallery" className={linkClass('/gallery')}>Gallery</Link>
            <Link href="/collections" className={linkClass('/collections')}>Collections</Link>
            <Link href="/about" className={linkClass('/about')}>About</Link>
            <Link href="/contact" className={linkClass('/contact')}>Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="hidden md:flex md:items-center md:gap-4">
              {session ? (
                <>
                  <Link href="/favourites" className={linkClass('/favourites')}>Favourites</Link>
                  <Link href="/payment" className={linkClass('/payment')}>Purchases</Link>
                  {session.role === 'admin' && (
                    <Link href="/admin" className={linkClass('/admin')}>Admin</Link>
                  )}
                  <button onClick={logout} className="text-sm font-medium text-muted transition-colors hover:text-fg">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={linkClass('/login')}>Login</Link>
                  <Button href="/signup" variant="primary">Sign up</Button>
                </>
              )}
            </div>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden glass border-t border-border-25 animate-fade-in">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 flex flex-col gap-1">
            <Link href="/gallery" className={mobileLinkClass('/gallery')} onClick={() => setMobileOpen(false)}>Gallery</Link>
            <Link href="/collections" className={mobileLinkClass('/collections')} onClick={() => setMobileOpen(false)}>Collections</Link>
            <Link href="/about" className={mobileLinkClass('/about')} onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/contact" className={mobileLinkClass('/contact')} onClick={() => setMobileOpen(false)}>Contact</Link>

            <div className="my-2 h-px bg-border-25" />

            {session ? (
              <>
                <Link href="/favourites" className={mobileLinkClass('/favourites')} onClick={() => setMobileOpen(false)}>Favourites</Link>
                <Link href="/payment" className={mobileLinkClass('/payment')} onClick={() => setMobileOpen(false)}>Purchases</Link>
                {session.role === 'admin' && (
                  <Link href="/admin" className={mobileLinkClass('/admin')} onClick={() => setMobileOpen(false)}>Admin</Link>
                )}
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="rounded-md px-3 py-2 text-left text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={mobileLinkClass('/login')} onClick={() => setMobileOpen(false)}>Login</Link>
                <Button href="/signup" variant="primary" className="mt-1 w-full justify-center">Sign up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
