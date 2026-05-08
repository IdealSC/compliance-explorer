'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { EvidenceStatusBadge, ConfidenceIndicator } from '@/components/badges';
import { SampleDataBanner } from '@/components/governance';
import { OperationalUpdatePanel } from '@/components/operational/OperationalUpdatePanel';
import type { EvidenceRequirement } from '@/types';
import { fmt } from '@/lib/format';
import { ClipboardList, Lock, AlertTriangle, Calendar, Scale } from 'lucide-react';
import Link from 'next/link';
import { Section, DetailGrid, DetailItem } from '@/components/detail/DrawerPrimitives';

interface EvidenceDetailDrawerProps {
  evidence: EvidenceRequirement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvidenceDetailDrawer({ evidence, open, onOpenChange }: EvidenceDetailDrawerProps) {
  if (!evidence) return null;
  const e = evidence;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SampleDataBanner />
        <SheetHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            <EvidenceStatusBadge status={e.evidenceStatus} />
            <Badge variant="outline" className="text-[10px]">{e.evidenceType.replace(/_/g, ' ')}</Badge>
            {e.confidenceLevel && <ConfidenceIndicator level={e.confidenceLevel} />}
          </div>
          <SheetTitle className="text-base leading-tight">{e.evidenceName}</SheetTitle>
          <p className="text-xs text-muted-foreground">{e.evidenceDescription}</p>
          <Badge variant="secondary" className="text-[10px] font-mono w-fit">{e.id}</Badge>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* A. Ownership */}
          <Section title="Ownership" icon={<ClipboardList className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem label="Owner" value={e.evidenceOwner} />
              <DetailItem label="Business Function" value={e.businessFunction} />
            </DetailGrid>
          </Section>

          {/* B. Collection & Retention */}
          <Section title="Collection & Retention" icon={<Calendar className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem label="Required Frequency" value={e.requiredFrequency} />
              <DetailItem label="Retention Requirement" value={e.retentionRequirement} />
              <DetailItem label="Last Collected" value={fmt(e.lastCollectedDate)} />
              <DetailItem label="Next Due" value={fmt(e.nextDueDate)} />
              <DetailItem label="Governance Status" value={e.governanceStatus} />
            </DetailGrid>
          </Section>

          {/* B½. Operational Update */}
          <OperationalUpdatePanel
            entityType="evidence"
            entityId={e.id}
            isDatabaseMode={process.env.NEXT_PUBLIC_DATA_SOURCE === 'database'}
            fields={{
              status: {
                current: e.evidenceStatus,
                options: [
                  { value: 'not_started', label: 'Not Started' },
                  { value: 'requested', label: 'Requested' },
                  { value: 'collected', label: 'Collected' },
                  { value: 'under_review', label: 'Under Review' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'missing', label: 'Missing' },
                ],
              },
              notes: { current: e.notes },
              date1: { label: 'Last Collected Date', field: 'lastCollectedDate', current: e.lastCollectedDate },
              date2: { label: 'Next Due Date', field: 'nextDueDate', current: e.nextDueDate },
            }}
          />

          {/* C. Risk */}
          {(e.evidenceStatus === 'missing' || e.evidenceStatus === 'expired' || e.evidenceStatus === 'rejected') && (
            <Section title="Risk" icon={<AlertTriangle className="h-4 w-4" />}>
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3">
                <p className="text-xs text-red-800 dark:text-red-300">
                  <strong>Evidence {e.evidenceStatus}.</strong> Failure to collect this evidence may result in inability to demonstrate compliance with linked obligations and controls.
                </p>
              </div>
            </Section>
          )}

          {/* D. Regulatory Linkage */}
          <Section title="Regulatory Linkage" icon={<Lock className="h-4 w-4" />}>
            <p className="text-[10px] text-muted-foreground mb-2">
              These are read-only references to controlled regulatory data. Evidence tracking does not modify the underlying obligations or regulations.
            </p>
            <DetailGrid>
              <DetailItem label="Controls" value={
                e.relatedControlIds.length > 0
                  ? e.relatedControlIds.map(id => (
                      <Link key={id} href={`/controls-evidence?search=${id}`} className="text-primary hover:underline mr-1">{id}</Link>
                    ))
                  : '—'
              } />
              <DetailItem label="Obligations" value={
                e.relatedObligationIds.length > 0
                  ? e.relatedObligationIds.map(id => (
                      <Link key={id} href={`/obligations?search=${id}`} className="text-primary hover:underline mr-1">{id}</Link>
                    ))
                  : '—'
              } />
              {e.relatedImpactAnalysisIds.length > 0 && (
                <DetailItem label="Impact Analyses" value={
                  e.relatedImpactAnalysisIds.map(id => (
                    <Link key={id} href={`/impact-analysis?search=${id}`} className="text-primary hover:underline mr-1">{id}</Link>
                  ))
                } />
              )}
            </DetailGrid>
            {e.sourceReference && (
              <div className="mt-2">
                <span className="text-[10px] text-muted-foreground font-semibold">Source: </span>
                <span className="text-[10px] text-muted-foreground">{e.sourceReference}</span>
              </div>
            )}
          </Section>

          {/* E. Governance Notes */}
          <Section title="Governance Notes" icon={<Scale className="h-4 w-4" />}>
            {e.notes ? (
              <p className="text-xs text-muted-foreground">{e.notes}</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">No governance notes recorded.</p>
            )}
          </Section>
        </div>

        {/* Footer disclaimer */}
        <div className="border-t border-border pt-3 mt-2">
          <p className="text-[10px] text-muted-foreground">
            Evidence tracking is operational compliance data. It does not modify active regulatory reference data. Not legal advice.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}


