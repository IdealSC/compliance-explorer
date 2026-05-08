'use client';

/* ─── Operating Context Provider ─────────────────────────────────────
   Phase 5.1-E: React context for the three-dimension operating context.
   Manages state, localStorage persistence, and URL search param sync.
   ──────────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  type OperatingContext,
  CONTEXT_DEFAULTS,
  parseContextFromParams,
  contextToParams,
  isDefaultContext,
  STORAGE_KEY,
} from '@/lib/operating-context';

/* ─── Context shape ───────────────────────────────────────────────── */

interface OperatingContextValue {
  context: OperatingContext;
  setContext: (ctx: OperatingContext) => void;
  updateDimension: <K extends keyof OperatingContext>(
    key: K,
    value: OperatingContext[K]
  ) => void;
  hasInteracted: boolean;
  resetToDefaults: () => void;
}

const Ctx = React.createContext<OperatingContextValue | null>(null);

/* ─── Hook ────────────────────────────────────────────────────────── */

export function useOperatingContext(): OperatingContextValue {
  const value = React.useContext(Ctx);
  if (!value) {
    throw new Error(
      'useOperatingContext must be used within <OperatingContextProvider>'
    );
  }
  return value;
}

/* ─── Provider ────────────────────────────────────────────────────── */

export function OperatingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /* Initialise from URL params → localStorage → defaults */
  const [context, setContextState] = React.useState<OperatingContext>(() => {
    // URL params take priority (shareable links)
    const fromUrl = parseContextFromParams(searchParams);
    const urlHasParams =
      searchParams.has('jurisdiction') ||
      searchParams.has('entityRole') ||
      searchParams.has('stage');

    if (urlHasParams) return fromUrl;

    // Then try localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<OperatingContext>;
          return {
            jurisdiction: parsed.jurisdiction ?? CONTEXT_DEFAULTS.jurisdiction,
            entityRole: parsed.entityRole ?? CONTEXT_DEFAULTS.entityRole,
            stage: parsed.stage ?? CONTEXT_DEFAULTS.stage,
          };
        }
      } catch {
        /* corrupt localStorage — ignore */
      }
    }

    return CONTEXT_DEFAULTS;
  });

  const [hasInteracted, setHasInteracted] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) !== null;
    }
    return false;
  });

  /* Persist to localStorage on change */
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    } catch {
      /* storage full or disabled — ignore */
    }
  }, [context]);

  /* Sync URL search params on context change */
  React.useEffect(() => {
    // Skip URL sync on admin routes
    if (pathname.startsWith('/admin')) return;

    const newParams = contextToParams(context);
    const paramString = newParams.toString();

    // Build new URL
    const newUrl = paramString ? `${pathname}?${paramString}` : pathname;

    // Only replace if URL actually changed
    const currentParams = new URLSearchParams(searchParams.toString());
    const currentRelevant = new URLSearchParams();
    for (const key of ['jurisdiction', 'entityRole', 'stage']) {
      const v = currentParams.get(key);
      if (v) currentRelevant.set(key, v);
    }

    if (currentRelevant.toString() !== paramString) {
      router.replace(newUrl, { scroll: false });
    }
  }, [context, pathname, router, searchParams]);

  /* Handlers */
  const setContext = React.useCallback((ctx: OperatingContext) => {
    setContextState(ctx);
    setHasInteracted(true);
  }, []);

  const updateDimension = React.useCallback(
    <K extends keyof OperatingContext>(key: K, value: OperatingContext[K]) => {
      setContextState((prev) => ({ ...prev, [key]: value }));
      setHasInteracted(true);
    },
    []
  );

  const resetToDefaults = React.useCallback(() => {
    setContextState(CONTEXT_DEFAULTS);
  }, []);

  const value = React.useMemo(
    () => ({ context, setContext, updateDimension, hasInteracted, resetToDefaults }),
    [context, setContext, updateDimension, hasInteracted, resetToDefaults]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
