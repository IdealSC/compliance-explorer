'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Rocket,
  AlertTriangle,
  FileCheck,
  List,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/supply-chain', label: 'Supply Chain', icon: Truck },
  { href: '/launch-critical', label: 'Launch-Critical', icon: Rocket },
  { href: '/risks', label: 'Highest Risk', icon: AlertTriangle },
  { href: '/evidence', label: 'Evidence', icon: FileCheck },
  { href: '/requirements', label: 'All Requirements', icon: List },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile nav on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <Shield className="h-6 w-6 text-primary shrink-0" />
        <div>
          <h1 className="text-base font-semibold leading-tight">Compliance Explorer</h1>
          <p className="text-xs text-muted-foreground">Regulatory matrix pilot</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-5 py-4">
        <p className="text-xs text-muted-foreground">
          Pilot v1.0 · Not a validated GxP system
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 border-b border-border bg-sidebar px-4 py-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Shield className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold">Compliance Explorer</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'lg:hidden fixed top-[52px] left-0 bottom-0 z-30 w-64 flex flex-col bg-sidebar text-sidebar-foreground border-r border-border transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground shrink-0">
        {navContent}
      </aside>
    </>
  );
}
