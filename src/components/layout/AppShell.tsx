'use client';

import * as React from 'react';
import { PublicNav } from './PublicNav';
import {
  OperatingContextProvider,
  OperatingContextSelector,
} from '@/components/context';

export function AppShell({ children }: { children: React.ReactNode }) {
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
