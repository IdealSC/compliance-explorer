'use client';

/**
 * User Identity Panel — Sidebar footer component showing current user.
 *
 * Renders one of two modes:
 * 1. Demo mode: Full role switcher dropdown (DemoUserPanel)
 * 2. SSO mode: Simple identity display with sign-out (UserIdentityPanel)
 *
 * Phase 3.1: Added SSO mode. Demo panel unchanged.
 */
import * as React from 'react';
import { useSession, type ClientSessionUser } from './DemoSessionProvider';
import { DEMO_USERS } from '@/auth/demo-users';
import { ROLE_DEFINITIONS, type RoleId } from '@/auth/roles';
import { User, ChevronDown, FlaskConical, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

function RoleBadge({ roleId }: { roleId: RoleId }) {
  const def = ROLE_DEFINITIONS[roleId];
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
      {def?.label ?? roleId}
    </span>
  );
}

// ── SSO Identity Panel ──────────────────────────────────────────

function UserIdentityPanel({ user }: { user: ClientSessionUser }) {
  const handleSignOut = React.useCallback(async () => {
    // Redirect to Auth.js sign-out endpoint
    window.location.href = '/api/auth/signout';
  }, []);

  return (
    <div className="border-t border-border">
      {/* Current user display */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <User className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{user.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {user.roles.map((r) => (
              <RoleBadge key={r} roleId={r} />
            ))}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>

      {/* SSO badge */}
      <div className="flex items-center gap-1.5 px-4 pb-2">
        <Shield className="h-3 w-3 text-emerald-500" aria-hidden="true" />
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">SSO Authentication</span>
      </div>
    </div>
  );
}

// ── Demo User Panel ─────────────────────────────────────────────

function DemoRoleSwitcher({ user }: { user: ClientSessionUser }) {
  const { switchUser } = useSession();
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={panelRef} className="relative border-t border-border">
      {/* Current user display */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Switch demo user"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <User className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{user.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {user.roles.map((r) => (
              <RoleBadge key={r} roleId={r} />
            ))}
          </div>
        </div>
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {/* Demo badge */}
      <div className="flex items-center gap-1.5 px-4 pb-2">
        <FlaskConical className="h-3 w-3 text-amber-500" aria-hidden="true" />
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Demo Mode — Not production auth</span>
      </div>

      {/* Role switcher dropdown */}
      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1 mx-2 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50"
          role="listbox"
          aria-label="Select demo user"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Switch Demo User</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto py-1">
            {DEMO_USERS.map((u) => {
              const isActive = u.email === user.email;
              return (
                <button
                  key={u.email}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    if (!isActive) switchUser(u.email);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left text-xs transition-colors',
                    isActive ? 'bg-primary/5 text-primary' : 'hover:bg-accent'
                  )}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted shrink-0">
                    <User className="h-3 w-3" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <RoleBadge roleId={u.roles[0]} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Exported Component ──────────────────────────────────────────

/**
 * Adaptive user panel — renders demo switcher or SSO identity
 * based on the current session's demoUser flag.
 */
export function DemoUserPanel() {
  const { user } = useSession();

  if (!user) return null;

  if (user.demoUser) {
    return <DemoRoleSwitcher user={user} />;
  }

  return <UserIdentityPanel user={user} />;
}
