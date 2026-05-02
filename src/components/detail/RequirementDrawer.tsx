'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { SeverityBadge, FlagBadge, StatusBadge } from '@/components/badges';
import { Separator } from '@/components/ui/separator';
import type { Requirement } from '@/types';

interface RequirementDrawerProps {
  requirement: Requirement | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Renders a labeled field in the drawer.
 * - `required` fields show "Not specified" when null/empty (for important fields).
 * - Optional fields are omitted when null (reduces noise for metadata fields).
 */
function DetailRow({
  label,
  value,
  required = false,
}: {
  label: string;
  value: string | null | undefined;
  required?: boolean;
}) {
  if (!value && !required) return null;
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {value || (
          <span className="italic text-muted-foreground">Not specified</span>
        )}
      </dd>
    </div>
  );
}

/** Section header inside the drawer body */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary/70 pb-1">
      {children}
    </h3>
  );
}

export function RequirementDrawer({ requirement, open, onClose }: RequirementDrawerProps) {
  if (!requirement) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm font-bold text-primary">
              {requirement.matrixRowId}
            </span>
            <SeverityBadge severity={requirement.severityPriority} />
            <FlagBadge value={requirement.launchCriticalFlag} variant="launch-critical" />
            <FlagBadge value={requirement.needsReviewFlag} variant="needs-review" />
          </div>
          <SheetTitle className="text-base font-semibold leading-snug">
            {requirement.lawRegulationFrameworkStandardName || requirement.level3RequirementArea || 'Requirement Detail'}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {requirement.regulatoryDomain} · {requirement.jurisdictionRegion}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="space-y-6 py-5 px-1">

          {/* ── Section 1: Requirement Summary ── */}
          <section className="space-y-3">
            <SectionHeading>Requirement Summary</SectionHeading>
            <DetailRow label="UI Display Summary" value={requirement.uiDisplaySummary} required />
            <DetailRow label="Exact Requirement or Source Language" value={requirement.exactRequirementOrSourceLanguage} required />
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="SCOR Phase" value={requirement.scorPhase} />
              <DetailRow label="Regulatory Tier" value={requirement.regulatoryTier} />
              <DetailRow label="Lifecycle Stage" value={requirement.lifecycleStage} />
              <DetailRow label="Source Type" value={requirement.sourceType} />
              <DetailRow label="Primary Persona" value={requirement.primaryPersonaViewer} />
              <DetailRow label="Business Function" value={requirement.businessFunctionImpacted} />
            </div>
          </section>

          <Separator />

          {/* ── Section 2: Business Interpretation ── */}
          <section className="space-y-3">
            <SectionHeading>Business Interpretation</SectionHeading>
            <DetailRow label="Plain-English Interpretation" value={requirement.plainEnglishInterpretation} required />
            <DetailRow label="Practical Example for a Business Leader" value={requirement.practicalExampleForBusinessLeader} required />
            <DetailRow label="Implementation Notes" value={requirement.implementationNotes} />
            <DetailRow label="Open Questions / Missing Information" value={requirement.openQuestionsMissingInformation} />
          </section>

          <Separator />

          {/* ── Section 3: Required Action & Control ── */}
          <section className="space-y-3">
            <SectionHeading>Required Action &amp; Control</SectionHeading>
            <DetailRow label="Required Action" value={requirement.requiredAction} required />
            <DetailRow label="Required Control" value={requirement.requiredControl} required />
            <DetailRow label="Frequency / Timing" value={requirement.frequencyTiming} />
            <DetailRow label="Actionability" value={requirement.actionability} />
            <DetailRow label="Digital System Owner" value={requirement.digitalSystemOwner} />
          </section>

          <Separator />

          {/* ── Section 4: Evidence & Source ── */}
          <section className="space-y-3">
            <SectionHeading>Evidence &amp; Source</SectionHeading>
            <DetailRow label="Required Evidence / Documentation" value={requirement.requiredEvidenceDocumentation} required />
            <DetailRow label="Source Reference" value={requirement.sourceNoteSourceReference} />
            <DetailRow label="Source File" value={requirement.sourceFile} />
            <DetailRow label="Related Standards" value={requirement.relatedStandards} />
            <DetailRow label="Related Laws / Regulations" value={requirement.relatedLawsRegulations} />
            <DetailRow label="Related Internal Policies" value={requirement.relatedInternalPoliciesOrProcedures} />
          </section>

          <Separator />

          {/* ── Section 5: Risk / Review ── */}
          <section className="space-y-3">
            <SectionHeading>Risk / Review</SectionHeading>
            <DetailRow label="Risk of Non-Compliance" value={requirement.riskOfNonCompliance} required />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1">
                  <StatusBadge status={requirement.status} />
                </dd>
              </div>
              <DetailRow label="Confidence Level" value={requirement.confidenceLevel} />
              <DetailRow label="Review Status" value={requirement.reviewStatus} />
              <DetailRow label="Target Remediation Owner" value={requirement.targetRemediationOwner} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <Separator />
        <div className="py-3 px-1">
          <p className="text-[10px] text-muted-foreground">
            Pilot v1.0 · Content from source workbook · Not legal advice
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
