'use client';

import { SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterEmptyStateProps {
  /** Primary message shown in bold */
  label?: string;
  /** Optional clarifying context */
  context?: string;
  className?: string;
}

/**
 * Standardized empty state for filter-driven pages.
 *
 * Displays a consistent message explaining that no sample records
 * match the current filters, with governance-safe context that
 * absence of sample data does not imply absence of real-world obligations.
 */
export function FilterEmptyState({
  label = 'No sample records match the current filters.',
  context = 'This does not mean there are no real-world obligations, risks, or responsibilities for this area. Try clearing filters or selecting a different business function.',
  className,
}: FilterEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)} role="status">
      <SearchX className="h-8 w-8 text-muted-foreground/40 mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground/70 mt-1.5 max-w-md leading-relaxed">{context}</p>
    </div>
  );
}
