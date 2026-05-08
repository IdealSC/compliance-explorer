import { cn } from '@/lib/utils';

const DRAFT_STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  ready_for_review: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  returned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const DRAFT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  ready_for_review: 'Ready for Review',
  returned: 'Returned',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
};

interface DraftStatusBadgeProps {
  status: string;
  className?: string;
}

export function DraftStatusBadge({ status, className }: DraftStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        DRAFT_STATUS_STYLES[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {DRAFT_STATUS_LABELS[status] || status}
    </span>
  );
}
