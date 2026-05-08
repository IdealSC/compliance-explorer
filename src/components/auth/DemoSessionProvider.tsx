'use client';

/**
 * Session Context Provider — Client-side access to the current user session.
 *
 * Supports two modes:
 * 1. Demo mode (demoUser=true): switchUser available via demo-login API
 * 2. SSO mode (demoUser=false): switchUser is a no-op; use Auth.js signOut
 *
 * The server passes the session user via props to this provider,
 * which makes it available to all client components without
 * importing server-only auth modules.
 *
 * Phase 3.1: Renamed from DemoSessionProvider. Backward-compatible.
 */
import * as React from 'react';
import type { RoleId } from '@/auth/roles';

export interface ClientSessionUser {
  id: string;
  name: string;
  email: string;
  roles: RoleId[];
  demoUser: boolean;
}

interface SessionCtx {
  user: ClientSessionUser | null;
  permissions: string[];
  switchUser: (email: string) => Promise<void>;
}

const SessionContext = React.createContext<SessionCtx>({
  user: null,
  permissions: [],
  switchUser: async () => {},
});

export function useSession() {
  return React.useContext(SessionContext);
}

interface Props {
  initialUser: ClientSessionUser | null;
  initialPermissions: string[];
  children: React.ReactNode;
}

export function SessionProvider({ initialUser, initialPermissions, children }: Props) {
  const [user, setUser] = React.useState(initialUser);
  const [permissions, setPermissions] = React.useState(initialPermissions);

  const switchUser = React.useCallback(async (email: string) => {
    // Only allow role switching in demo mode
    if (!user?.demoUser) return;

    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      // Reload to pick up new server-side session
      window.location.reload();
    }
  }, [user?.demoUser]);

  return (
    <SessionContext.Provider value={{ user, permissions, switchUser }}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * @deprecated Use SessionProvider. Kept for backward compatibility during migration.
 */
export const DemoSessionProvider = SessionProvider;
