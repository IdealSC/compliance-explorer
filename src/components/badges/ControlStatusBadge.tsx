import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  designed: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  implemented: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  operating: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  needs_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  deficient: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  retired: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400',
};

interface ControlStatusBadgeProps {
  status: string;
  className?: string;
}

export function ControlStatusBadge({ status, className }: ControlStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
