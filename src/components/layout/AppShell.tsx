'use client';

import { PublicNav } from './PublicNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
