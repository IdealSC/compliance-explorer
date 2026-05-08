'use client';

/**
 * ValidationStatusBadge — Phase 3.10.
 *
 * Color-coded badge for draft validation review statuses.
 * Used in the Validation Workbench, Draft Mapping, and Review & Approval pages.
 */

import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  not_started: {
    label: 'Not Started',
    className: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/30',
  },
  in_validation: {
    label: 'In Validation',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  validated_for_review: {
    label: 'Ready for Review',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  returned_for_revision: {
    label: 'Returned',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
  },
  legal_review_required: {
    label: 'Legal Review',
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
  },
};

const SOURCE_CONFIG: Record<string, { label: string; className: string }> = {
  not_checked: { label: 'Not Checked', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' },
  supported: { label: 'Supported', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  partially_supported: { label: 'Partial', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  unsupported: { label: 'Unsupported', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  missing_source: { label: 'Missing', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
};

const CITATION_CONFIG: Record<string, { label: string; className: string }> = {
  not_checked: { label: 'Not Checked', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' },
  accurate: { label: 'Accurate', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  partially_accurate: { label: 'Partial', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  inaccurate: { label: 'Inaccurate', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  not_applicable: { label: 'N/A', className: 'bg-gray-500/10 text-gray-500 dark:text-gray-500' },
};

export function ValidationStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={`text-[10px] py-0 ${config.className}`}>
      {config.label}
    </Badge>
  );
}

export function SourceSupportBadge({ status }: { status: string }) {
  const config = SOURCE_CONFIG[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={`text-[10px] py-0 ${config.className}`}>
      Source: {config.label}
    </Badge>
  );
}

export function CitationAccuracyBadge({ status }: { status: string }) {
  const config = CITATION_CONFIG[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={`text-[10px] py-0 ${config.className}`}>
      Citation: {config.label}
    </Badge>
  );
}
