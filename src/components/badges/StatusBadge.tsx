import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  'Reviewed – App Ready Pending Legal Sign-Off':
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Citation / Applicability Validation Required':
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Timing Clarification Required':
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

interface StatusBadgeProps {
  status: string | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-tight',
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {status}
    </span>
  );
}
