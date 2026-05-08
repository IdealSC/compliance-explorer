'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Section, DetailGrid, DetailItem } from '@/components/detail/DrawerPrimitives';
import { DataQualitySeverityBadge, DataQualityStatusBadge, DataQualityIssueTypeBadge } from '@/components/badges';
import { ConfidenceIndicator } from '@/components/badges';
import { Scale, Lock, FileText, Target, Link2, Wrench, ShieldCheck } from 'lucide-react';
import { fmt } from '@/lib/format';
import type { DataQualityIssue } from '@/types';

function IdLinks({ ids, href }: { ids: string[]; href: string }) {
  if (ids.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {ids.map(id => (
        <Link key={id} href={`${href}?search=${id}`} className="text-primary hover:underline text-[10px] font-mono">
          {id}
        </Link>
      ))}
    </div>
  );
}

export function DataQualityDrawer({ issue, open, onOpenChange }: {
  issue: DataQualityIssue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!issue) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-sm">{issue.issueTitle}</SheetTitle>
          <SheetDescription className="text-[10px]">{issue.id}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* A. Issue Summary */}
          <Section title="Issue Summary" icon={<FileText className="h-3.5 w-3.5" />}>
            <div className="flex flex-wrap gap-1 mb-2">
              <DataQualityIssueTypeBadge type={issue.issueType} />
              <DataQualitySeverityBadge severity={issue.severity} />
              <DataQualityStatusBadge status={issue.status} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{issue.issueDescription}</p>
            <DetailGrid>
              <DetailItem label="Detected" value={fmt(issue.detectedAt)} />
              <DetailItem label="Last Reviewed" value={fmt(issue.lastReviewedAt)} />
              <DetailItem label="Due Date" value={fmt(issue.dueDate)} />
              <DetailItem label="Category" value={issue.category.replace(/_/g, ' ')} />
            </DetailGrid>
          </Section>

          {/* B. Affected Record */}
          <Section title="Affected Record" icon={<Target className="h-3.5 w-3.5" />}>
            <DetailGrid>
              <DetailItem label="Entity Type" value={issue.affectedEntityType.replace(/_/g, ' ')} />
              <DetailItem label="Entity ID" value={issue.affectedEntityId} />
              <DetailItem label="Label" value={issue.affectedEntityLabel} />
              <DetailItem label="Function" value={issue.businessFunction} />
              <DetailItem label="Owner" value={issue.owner} />
              <DetailItem label="Source Ref" value={issue.sourceReference ?? '—'} />
            </DetailGrid>
            <div className="flex items-center gap-3 mt-2">
              {issue.confidenceLevel && <ConfidenceIndicator level={issue.confidenceLevel} />}
              {issue.legalReviewRequired && (
                <Badge variant="outline" className="text-[9px] border-purple-400 text-purple-600 dark:text-purple-400 gap-0.5">
                  <Scale className="h-2.5 w-2.5" /> Legal Review Required
                </Badge>
              )}
            </div>
          </Section>

          {/* C. Related Compliance Map Links */}
          <Section title="Related Compliance Map Links" icon={<Link2 className="h-3.5 w-3.5" />}>
            <DetailGrid>
              <DetailItem label="Obligations" value={<IdLinks ids={issue.relatedObligationIds} href="/obligations" />} />
              <DetailItem label="Controls" value={<IdLinks ids={issue.relatedControlIds} href="/controls-evidence" />} />
              <DetailItem label="Evidence" value={<IdLinks ids={issue.relatedEvidenceIds} href="/controls-evidence" />} />
              <DetailItem label="Sources" value={<IdLinks ids={issue.relatedSourceIds} href="/source-registry" />} />
              <DetailItem label="Impacts" value={<IdLinks ids={issue.relatedImpactAnalysisIds} href="/impact-analysis" />} />
              <DetailItem label="Drafts" value={<IdLinks ids={issue.relatedDraftChangeIds} href="/draft-mapping" />} />
            </DetailGrid>
          </Section>

          {/* D. Recommended Remediation */}
          <Section title="Recommended Remediation" icon={<Wrench className="h-3.5 w-3.5" />}>
            <div className="space-y-2">
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">Recommended Action</div>
                <p className="text-xs leading-relaxed">{issue.recommendedAction}</p>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">Risk If Unresolved</div>
                <p className="text-xs leading-relaxed text-rose-600 dark:text-rose-400">{issue.riskIfUnresolved}</p>
              </div>
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  This recommendation is diagnostic only. It does not initiate, authorize, or execute any remediation action.
                </p>
              </div>
            </div>
          </Section>

          {/* E. Governance Notes */}
          <Section title="Governance & Context" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
            {issue.notes && (
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{issue.notes}</p>
            )}
            <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
              <Lock className="h-3 w-3 mt-0.5 shrink-0" />
              <span>
                Data quality findings are read-only diagnostic assessments. They do not modify controlled reference data, obligations, standards, controls, evidence, or audit logs. Findings are generated from sample/demonstration data only.
              </span>
            </div>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
