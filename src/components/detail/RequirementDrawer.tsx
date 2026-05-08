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
import { Lock, Pencil } from 'lucide-react';
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

/** Confidence level badge with color coding */
function ConfidenceBadge({ level }: { level: string | null }) {
  if (!level) return null;
  const colors: Record<string, string> = {
    High: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    Medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    Low: 'bg-red-500/15 text-red-700 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[level] || 'bg-muted text-muted-foreground'}`}>
      {level} confidence
    </span>
  );
}

/** Record status badge with governance colors */
function RecordStatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const colors: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    draft: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    pending_review: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
    superseded: 'bg-zinc-500/15 text-zinc-500',
    archived: 'bg-zinc-500/15 text-zinc-500',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'bg-muted text-muted-foreground'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

/** Governance-aware section header with icon */
function SectionHeading({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'controlled' | 'operational' | 'default' }) {
  const icon = variant === 'controlled'
    ? <Lock className="h-3 w-3 text-primary/60" aria-hidden="true" />
    : variant === 'operational'
      ? <Pencil className="h-3 w-3 text-amber-500/60" aria-hidden="true" />
      : null;

  return (
    <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary/70 pb-1">
      {icon}
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
            <ConfidenceBadge level={requirement.confidenceLevel} />
            <RecordStatusBadge status={requirement.recordStatus ?? null} />
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

          {/* ═══ CONTROLLED REGULATORY DATA ═══ */}

          {/* ── Section 1: Regulatory Source Record ── */}
          <section className="space-y-3">
            <SectionHeading variant="controlled">Regulatory Source Record</SectionHeading>
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
            <SectionHeading variant="controlled">Business Interpretation</SectionHeading>
            <DetailRow label="Plain-English Interpretation" value={requirement.plainEnglishInterpretation} required />
            <DetailRow label="Practical Example for a Business Leader" value={requirement.practicalExampleForBusinessLeader} required />
            <DetailRow label="Implementation Notes" value={requirement.implementationNotes} />
            <DetailRow label="Open Questions / Missing Information" value={requirement.openQuestionsMissingInformation} />
          </section>

          <Separator />

          {/* ── Section 3: Required Action & Control ── */}
          <section className="space-y-3">
            <SectionHeading variant="controlled">Required Action &amp; Control</SectionHeading>
            <DetailRow label="Required Action" value={requirement.requiredAction} required />
            <DetailRow label="Required Control" value={requirement.requiredControl} required />
            <DetailRow label="Frequency / Timing" value={requirement.frequencyTiming} />
            <DetailRow label="Actionability" value={requirement.actionability} />
            <DetailRow label="Digital System Owner" value={requirement.digitalSystemOwner} />
          </section>

          <Separator />

          {/* ── Section 4: Evidence & Source ── */}
          <section className="space-y-3">
            <SectionHeading variant="controlled">Evidence &amp; Source</SectionHeading>
            <DetailRow label="Required Evidence / Documentation" value={requirement.requiredEvidenceDocumentation} required />
            <DetailRow label="Source Reference" value={requirement.sourceNoteSourceReference} />
            <DetailRow label="Source File" value={requirement.sourceFile} />
            <DetailRow label="Related Standards" value={requirement.relatedStandards} />
            <DetailRow label="Related Laws / Regulations" value={requirement.relatedLawsRegulations} />
            <DetailRow label="Related Internal Policies" value={requirement.relatedInternalPoliciesOrProcedures} />
            {requirement.externalVerificationUrl && (
              <div className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Primary Source
                </dt>
                <dd>
                  <a
                    href={requirement.externalVerificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Open primary source document ↗
                  </a>
                </dd>
              </div>
            )}
          </section>

          <Separator />

          {/* ═══ OPERATIONAL COMPLIANCE DATA ═══ */}

          {/* ── Section 5: Operational Status & Review ── */}
          <section className="space-y-3">
            <SectionHeading variant="operational">Operational Status &amp; Review</SectionHeading>
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
              <DetailRow label="Review Status" value={requirement.reviewStatus} />
              <DetailRow label="Owner" value={requirement.exampleBusinessOwner} />
              <DetailRow label="Target Remediation Owner" value={requirement.targetRemediationOwner} />
              <DetailRow label="Action Required" value={requirement.actionRequired} />
              <DetailRow label="Validation Date" value={requirement.validationDate} />
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
