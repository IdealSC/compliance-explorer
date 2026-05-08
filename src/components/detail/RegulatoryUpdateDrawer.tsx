'use client';

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StageBadge, ChangeTypeBadge, LegalReviewMarker, ConfidenceIndicator, EffectiveDateDisplay } from '@/components/badges';
import { StageUpdatePanel } from '@/components/staging/StagingUpdatePanel';
import { AlertTriangle, Lock, ExternalLink, Database } from 'lucide-react';
import { getRequirementMap } from '@/lib/data';
import type { RegulatoryUpdate } from '@/types';
import * as React from 'react';

interface Props {
  update: RegulatoryUpdate | null;
  open: boolean;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

export function RegulatoryUpdateDrawer({ update, open, onClose }: Props) {
  const reqMap = React.useMemo(() => getRequirementMap(), []);
  if (!update) return null;

  const linkedReqs = update.relatedObligationIds
    .map((id) => reqMap.get(id))
    .filter(Boolean);

  const isDbMode = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_DATA_SOURCE === 'database'
    : false;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-primary">{update.id}</span>
            <StageBadge stage={update.currentStage} />
            <ChangeTypeBadge type={update.changeType} />
            <LegalReviewMarker required={update.legalReviewRequired} />
          </div>
          <SheetTitle className="text-base font-semibold leading-snug">{update.updateTitle}</SheetTitle>
          <SheetDescription className="text-xs">
            {update.regulator} · {update.jurisdiction}
          </SheetDescription>
        </SheetHeader>

        {/* Governance warning */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 mb-4">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            This proposed update is <strong>not active regulatory reference data</strong> until reviewed and approved.
          </p>
        </div>

        <Separator />

        <div className="space-y-6 py-5 px-1">
          {/* Draft / Staging Controls */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary/70 pb-1">
              <Database className="h-3 w-3 text-primary/60" /> Draft / Staging Controls
            </h3>
            <StageUpdatePanel
              entityId={update.id}
              currentStage={update.currentStage}
              isDatabaseMode={isDbMode}
            />
            <p className="text-[10px] text-muted-foreground italic">
              Stage updates do not modify active regulatory reference data. Approval and publication require the formal governance workflow.
            </p>
            {isDbMode && ['review', 'approved', 'rejected'].includes(update.currentStage) && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Database className="h-3 w-3" />
                Review decisions for this update are available on the{' '}
                <a href="/review-approval" className="text-primary hover:underline font-medium">Review &amp; Approval</a> page.
              </p>
            )}
          </section>

          <Separator />

          {/* Source Details */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary/70 pb-1">
              <Lock className="h-3 w-3 text-primary/60" /> Source Details
            </h3>
            <Row label="Source Document" value={update.sourceName} />
            <div className="grid grid-cols-2 gap-3">
              <Row label="Source Type" value={update.sourceType} />
              <Row label="Regulator" value={update.regulator} />
              <Row label="Jurisdiction" value={update.jurisdiction} />
              <Row label="Publication Date" value={update.publicationDate} />
            </div>
            {update.sourceReference && (
              <a href={update.sourceReference} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                <ExternalLink className="h-3 w-3" /> Open source document ↗
              </a>
            )}
          </section>

          <Separator />

          {/* Change Summary */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary/70 pb-1">Change Summary</h3>
            <p className="text-sm text-foreground leading-relaxed">{update.changeSummary}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <ConfidenceIndicator level={update.confidenceLevel} />
              <EffectiveDateDisplay date={update.effectiveDate} />
            </div>
          </section>

          <Separator />

          {/* Impacted Obligations */}
          {linkedReqs.length > 0 && (
            <>
              <section className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary/70 pb-1">
                  Impacted Obligations ({linkedReqs.length})
                </h3>
                <div className="space-y-1.5 border-l-2 border-primary/20 pl-3">
                  {linkedReqs.map((req) => req && (
                    <div key={req.matrixRowId} className="flex items-start gap-2 py-1">
                      <span className="font-mono text-[10px] text-primary font-bold shrink-0 mt-px">{req.matrixRowId}</span>
                      <span className="text-xs text-muted-foreground line-clamp-2">{req.uiDisplaySummary || req.level3RequirementArea}</span>
                    </div>
                  ))}
                </div>
              </section>
              <Separator />
            </>
          )}

          {/* Impacted Crosswalks */}
          {update.relatedCrosswalkIds.length > 0 && (
            <>
              <section className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary/70 pb-1">Impacted Crosswalks</h3>
                <div className="flex gap-1.5 flex-wrap">
                  {update.relatedCrosswalkIds.map((id) => (
                    <Badge key={id} variant="outline" className="font-mono text-[10px]">{id}</Badge>
                  ))}
                </div>
              </section>
              <Separator />
            </>
          )}

          {/* Business Functions */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary/70 pb-1">Impacted Business Functions</h3>
            <div className="flex gap-1.5 flex-wrap">
              {update.impactedBusinessFunctions.map((fn) => (
                <Badge key={fn} variant="secondary">{fn}</Badge>
              ))}
            </div>
          </section>

          <Separator />

          {/* Governance Status */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary/70 pb-1">Governance Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <Row label="Current Stage" value={update.currentStage.replace('_', ' ')} />
              <Row label="Assigned Reviewer" value={update.assignedReviewer} />
              <Row label="Intake Date" value={update.intakeDate} />
              <Row label="Legal Review Required" value={update.legalReviewRequired ? 'Yes' : 'No'} />
            </div>
          </section>
        </div>

        <Separator />
        <div className="py-3 px-1">
          <p className="text-[10px] text-muted-foreground">Pilot v1.2 · Governance workflow demo · Not legal advice</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
