'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface NavItem {
  href: string;
  label: string;
}

const publicNavItems: NavItem[] = [
  { href: '/', label: 'Start Here' },
  { href: '/map', label: 'Landscape Map' },
  { href: '/topics', label: 'Topics' },
  { href: '/applicability', label: 'What Applies to Us' },
  { href: '/ownership', label: 'Ownership by Role' },
  { href: '/sources', label: 'Sources & Standards' },
];

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function PublicNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile nav on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Main nav bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Compass className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-base font-semibold tracking-tight">
              ISC Compliance Explorer
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {publicNavItems.map(({ href, label }) => {
              const isActive = isActiveRoute(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-public-nav"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-public-nav"
            className="lg:hidden relative z-40 border-t border-border bg-background px-4 py-3 space-y-1"
            aria-label="Mobile navigation"
          >
            {publicNavItems.map(({ href, label }) => {
              const isActive = isActiveRoute(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'block px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </header>
  );
}
