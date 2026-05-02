'use client';

import { SidebarNav } from './SidebarNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />
      <main className="flex-1 overflow-auto bg-background">
        {/* pt-[52px] on mobile accounts for the fixed mobile top bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pt-[68px] lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
