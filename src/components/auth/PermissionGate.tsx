'use client';

/**
 * PermissionGate — Declarative permission guard for UI elements.
 *
 * Shows children only if the current user has the required permission(s).
 * Optionally renders a fallback message for permission-denied states.
 */
import * as React from 'react';
import { useSession } from './DemoSessionProvider';
import type { Permission } from '@/auth/permissions';
import { Lock } from 'lucide-react';

interface Props {
  /** Permission(s) required — user needs ANY of these */
  requires: Permission | Permission[];
  /** What to show when permission is denied */
  fallback?: React.ReactNode;
  /** If true, show a styled "requires permission" message instead of hiding */
  showDenied?: boolean;
  /** Label for the required permission (shown in denied state) */
  deniedLabel?: string;
  children: React.ReactNode;
}

export function PermissionGate({ requires, fallback, showDenied, deniedLabel, children }: Props) {
  const { permissions } = useSession();
  const required = Array.isArray(requires) ? requires : [requires];
  const hasAccess = required.some((p) => permissions.includes(p));

  if (hasAccess) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  if (showDenied) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 px-3 py-2">
        <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">
          {deniedLabel || `Requires ${required.join(' or ')}`}
        </span>
      </div>
    );
  }

  return null;
}
