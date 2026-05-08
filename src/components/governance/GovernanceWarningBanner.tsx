import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GovernanceWarningBannerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Amber governance notice banner.
 * Used on governance pages to clarify that proposed/draft data
 * is not active regulatory reference data.
 */
export function GovernanceWarningBanner({ children, className }: GovernanceWarningBannerProps) {
  return (
    <div data-governance-banner className={cn('flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3', className)}>
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{children}</p>
    </div>
  );
}
