'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { PublicNav } from './PublicNav';
import {
  OperatingContextProvider,
  OperatingContextSelector,
} from '@/components/context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  /* Admin routes use their own layout (AdminSidebar + content area).
     Skip public nav, context bar, and the public content wrapper. */
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <React.Suspense fallback={null}>
      <OperatingContextProvider>
        <div className="min-h-screen flex flex-col">
          <PublicNav />
          <OperatingContextSelector />
          <main className="flex-1 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </OperatingContextProvider>
    </React.Suspense>
  );
}
