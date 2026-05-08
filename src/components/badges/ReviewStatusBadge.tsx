import { cn } from '@/lib/utils';

const REVIEW_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  in_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  approved_for_publication: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  returned_for_revision: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  legal_review_required: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  in_review: 'In Review',
  approved_for_publication: 'Approved for Publication Readiness',
  returned_for_revision: 'Returned for Revision',
  rejected: 'Rejected',
  legal_review_required: 'Legal Review Required',
};

interface ReviewStatusBadgeProps {
  status: string;
  className?: string;
}

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        REVIEW_STATUS_STYLES[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {REVIEW_STATUS_LABELS[status] || status}
    </span>
  );
}
