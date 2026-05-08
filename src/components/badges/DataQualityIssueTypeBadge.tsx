'use client';

import { Badge } from '@/components/ui/badge';
import type { DataQualityIssueType } from '@/types';

const labels: Record<DataQualityIssueType, string> = {
  missing_source_reference: 'Missing Source',
  missing_metadata: 'Missing Metadata',
  low_confidence: 'Low Confidence',
  stale_review: 'Stale Review',
  missing_control: 'Missing Control',
  missing_evidence: 'Missing Evidence',
  expired_evidence: 'Expired Evidence',
  rejected_evidence: 'Rejected Evidence',
  deficient_control: 'Deficient Control',
  stalled_draft: 'Stalled Draft',
  legal_review_needed: 'Legal Review',
  broken_crosswalk: 'Broken Crosswalk',
  unmapped_business_function: 'Unmapped Function',
  version_gap: 'Version Gap',
  audit_gap: 'Audit Gap',
  duplicate_or_legacy_route_confusion: 'Legacy Naming',
  empty_business_function_mapping: 'Empty Function',
  other: 'Other',
};

export function DataQualityIssueTypeBadge({ type }: { type: DataQualityIssueType }) {
  return (
    <Badge variant="secondary" className="text-[9px] font-semibold">
      {labels[type] ?? type.replace(/_/g, ' ')}
    </Badge>
  );
}
