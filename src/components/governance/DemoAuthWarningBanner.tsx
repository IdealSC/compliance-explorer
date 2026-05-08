/**
 * Demo Auth Warning Banner — Shows a strong warning when demo auth
 * is enabled in a production environment.
 *
 * Phase 2.9: Security Hardening
 *
 * GOVERNANCE: This banner does not break local demo mode. It only
 * appears when NODE_ENV=production AND DEMO_AUTH_ENABLED=true.
 */
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoAuthWarningBannerProps {
  className?: string;
}

/**
 * Server component that reads environment directly.
 * Only renders the warning in unsafe production configurations.
 */
export function DemoAuthWarningBanner({ className }: DemoAuthWarningBannerProps) {
  const isProduction = process.env.NODE_ENV === 'production';
  const demoAuthEnabled = process.env.DEMO_AUTH_ENABLED !== 'false';

  // Only show in production with demo auth — never in dev/local
  if (!isProduction || !demoAuthEnabled) return null;

  return (
    <div
      data-demo-auth-warning
      className={cn(
        'flex items-start gap-3 rounded-lg border-2 border-red-500/40 bg-red-500/10 px-4 py-3',
        className,
      )}
    >
      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
      <div className="text-sm">
        <p className="font-bold text-red-800 dark:text-red-300">
          ⚠️ Demo Authentication Enabled in Production
        </p>
        <p className="text-red-700 dark:text-red-400 text-xs mt-1 leading-relaxed">
          Demo authentication uses plain-text cookies and is <strong>not secure</strong>.
          Do not use this configuration for real compliance data. Set{' '}
          <code className="font-mono bg-red-500/10 px-1 rounded">DEMO_AUTH_ENABLED=false</code>{' '}
          and configure a production identity provider (NextAuth/Auth.js/OIDC) before deployment.
        </p>
      </div>
    </div>
  );
}
