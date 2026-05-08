import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  intake: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  metadata_review: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  validation_pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  validated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  staged: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  superseded: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  archived: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function SourceStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', STATUS_STYLES[status] || 'bg-gray-100 text-gray-600', className)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
