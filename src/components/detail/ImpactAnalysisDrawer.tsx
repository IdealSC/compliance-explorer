'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImpactSeverityBadge, ImpactStatusBadge, ChangeTypeBadge, LegalReviewMarker, ConfidenceIndicator } from '@/components/badges';
import { SampleDataBanner } from '@/components/governance';
import type { RegulatoryImpactAnalysis } from '@/types';
import { Calendar, Building2, ShieldCheck, Users, FileText, AlertTriangle, Scale, ClipboardList, Target, Layers, CheckCircle2, XCircle, Clock, ArrowRight, Link2 } from 'lucide-react';

interface ImpactAnalysisDrawerProps {
  analysis: RegulatoryImpactAnalysis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  not_started: <Clock className="h-3 w-3 text-slate-400" />,
  in_progress: <Clock className="h-3 w-3 text-sky-500" />,
  complete: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
  blocked: <XCircle className="h-3 w-3 text-red-500" />,
};

export function ImpactAnalysisDrawer({ analysis, open, onOpenChange }: ImpactAnalysisDrawerProps) {
  if (!analysis) return null;
  const a = analysis;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            <ImpactSeverityBadge severity={a.impactSeverity} />
            <ImpactStatusBadge status={a.impactStatus} />
            <ChangeTypeBadge type={a.changeType} />
            <LegalReviewMarker required={a.governanceReview.legalReviewRequired} />
            <ConfidenceIndicator level={a.governanceReview.confidenceLevel} />
          </div>
          <SheetTitle className="text-base">{a.updateTitle}</SheetTitle>
          <p className="text-xs text-muted-foreground">{a.id} · Assessment layer — does not modify active reference data</p>
        </SheetHeader>

        <div className="space-y-5 py-4">
          <SampleDataBanner />

          {/* A. Regulatory Change Summary */}
          <Section title="Regulatory Change Summary" icon={<FileText className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem label="Source" value={a.sourceName} />
              <DetailItem label="Source Type" value={a.sourceType} />
              <DetailItem label="Regulator" value={a.regulator} />
              <DetailItem label="Jurisdiction" value={a.jurisdiction} />
              <DetailItem label="Publication Date" value={a.publicationDate} />
              <DetailItem label="Effective Date" value={a.effectiveDate} />
              <DetailItem label="Change Type" value={a.changeType?.replace(/_/g, ' ')} />
              {a.sourceReference && (
                <DetailItem label="Source Reference" value={
                  <a href={a.sourceReference} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{a.sourceReference}</a>
                } />
              )}
            </DetailGrid>
          </Section>

          {/* B. Impacted Obligations */}
          {a.impactedObligationIds.length > 0 && (
            <Section title={`Impacted Obligations (${a.impactedObligationIds.length})`} icon={<Target className="h-4 w-4" />}>
              <div className="flex flex-wrap gap-1.5">
                {a.impactedObligationIds.map(id => (
                  <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>
                ))}
              </div>
            </Section>
          )}

          {/* C. Impacted Standards / Crosswalks */}
          {a.impactedStandards.length > 0 && (
            <Section title={`Impacted Standards (${a.impactedStandards.length})`} icon={<Layers className="h-4 w-4" />}>
              <div className="space-y-2">
                {a.impactedStandards.map((s, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{s.standardName}</span>
                      <ReviewStatusBadge status={s.reviewStatus} />
                    </div>
                    <p className="text-xs text-muted-foreground">{s.mappingImpact}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* C2. Impacted Crosswalks */}
          {a.impactedCrosswalkIds.length > 0 && (
            <Section title={`Impacted Crosswalks (${a.impactedCrosswalkIds.length})`} icon={<Link2 className="h-4 w-4" />}>
              <div className="flex flex-wrap gap-1.5">
                {a.impactedCrosswalkIds.map(id => (
                  <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>
                ))}
              </div>
            </Section>
          )}

          {/* D. Impacted Controls */}
          {a.impactedControls.length > 0 && (
            <Section title={`Impacted Controls (${a.impactedControls.length})`} icon={<ShieldCheck className="h-4 w-4" />}>
              <div className="space-y-2">
                {a.impactedControls.map((c, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-1.5">
                    <span className="text-xs font-semibold">{c.controlName}</span>
                    <p className="text-xs text-muted-foreground">{c.controlImpact}</p>
                    <DetailGrid>
                      <DetailItem label="Owner" value={c.owner} />
                      <DetailItem label="Required Action" value={c.requiredAction} />
                      <DetailItem label="Risk if Not Updated" value={c.riskIfNotUpdated} />
                    </DetailGrid>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* E. Impacted Evidence */}
          {a.impactedEvidence.length > 0 && (
            <Section title={`Impacted Evidence (${a.impactedEvidence.length})`} icon={<ClipboardList className="h-4 w-4" />}>
              <div className="space-y-2">
                {a.impactedEvidence.map((e, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-1.5">
                    <span className="text-xs font-semibold">{e.evidenceItem}</span>
                    <p className="text-xs text-muted-foreground">{e.evidenceImpact}</p>
                    <DetailGrid>
                      <DetailItem label="Owner" value={e.businessOwner} />
                      <DetailItem label="Update Required" value={e.requiredUpdate} />
                      <DetailItem label="Timing" value={e.timing} />
                    </DetailGrid>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* F. Business Function Impact */}
          {a.impactedBusinessFunctions.length > 0 && (
            <Section title={`Business Function Impact (${a.impactedBusinessFunctions.length})`} icon={<Building2 className="h-4 w-4" />}>
              <div className="space-y-2">
                {a.impactedBusinessFunctions.map((bf, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">{bf.functionName}</span>
                      <span className="text-[10px] text-muted-foreground">{bf.owner}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{bf.impactSummary}</p>
                    {bf.requiredActions.length > 0 && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Required Actions</span>
                        <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                          {bf.requiredActions.map((ra, j) => <li key={j}>{ra}</li>)}
                        </ul>
                      </div>
                    )}
                    <DetailGrid>
                      <DetailItem label="Risk if Not Completed" value={bf.riskIfNotCompleted} />
                      {bf.dependencies.length > 0 && <DetailItem label="Dependencies" value={bf.dependencies.join('; ')} />}
                    </DetailGrid>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* G. Owner Action Plan */}
          {a.impactedOwners.length > 0 && (
            <Section title={`Owner Action Plan (${a.impactedOwners.length})`} icon={<Users className="h-4 w-4" />}>
              <div className="space-y-2">
                {a.impactedOwners.map((oa, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      {STATUS_ICON[oa.status]}
                      <span className="text-xs font-semibold flex-1">{oa.action}</span>
                    </div>
                    <DetailGrid>
                      <DetailItem label="Owner" value={oa.owner} />
                      <DetailItem label="Function" value={oa.businessFunction} />
                      <DetailItem label="Due" value={oa.dueDate ? new Date(oa.dueDate + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null} />
                      {oa.dependency && <DetailItem label="Dependency" value={oa.dependency} />}
                      <DetailItem label="Risk" value={oa.riskIfNotCompleted} />
                      <DetailItem label="Status" value={oa.status.replace(/_/g, ' ')} />
                    </DetailGrid>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* G2. Risk Changes */}
          {a.impactedRisks.length > 0 && (
            <Section title={`Risk Changes (${a.impactedRisks.length})`} icon={<AlertTriangle className="h-4 w-4" />}>
              <div className="space-y-2">
                {a.impactedRisks.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-1.5">
                    <p className="text-xs font-semibold">{r.riskDescription}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{r.previousLevel || 'New'}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <RiskLevelBadge level={r.proposedLevel} />
                    </div>
                    <p className="text-[10px] text-muted-foreground"><strong>Mitigation:</strong> {r.mitigationRequired}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* H. Governance Review */}
          <Section title="Governance Review" icon={<Scale className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem label="Legal Review Required" value={a.governanceReview.legalReviewRequired ? 'Yes' : 'No'} />
              <DetailItem label="Confidence Level" value={a.governanceReview.confidenceLevel} />
              <DetailItem label="Required Approver" value={a.governanceReview.requiredApprover} />
              <DetailItem label="Review Status" value={a.governanceReview.reviewStatus.replace(/_/g, ' ')} />
            </DetailGrid>
            {a.governanceReview.openQuestions.length > 0 && (
              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Open Questions</span>
                <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                  {a.governanceReview.openQuestions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
            )}
            {a.governanceReview.relatedDraftChangeIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">Related Drafts:</span>
                {a.governanceReview.relatedDraftChangeIds.map(id => (
                  <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>
                ))}
              </div>
            )}
            {a.governanceReview.relatedAuditEventIds.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">Audit Events:</span>
                {a.governanceReview.relatedAuditEventIds.map(id => (
                  <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>
                ))}
              </div>
            )}
          </Section>

          {/* Required Actions & Next Steps */}
          {a.requiredActions.length > 0 && (
            <Section title="Required Actions" icon={<AlertTriangle className="h-4 w-4" />}>
              <ul className="text-xs text-foreground space-y-1 list-disc list-inside">
                {a.requiredActions.map((ra, i) => <li key={i}>{ra}</li>)}
              </ul>
            </Section>
          )}

          {a.recommendedNextSteps.length > 0 && (
            <Section title="Recommended Next Steps" icon={<CheckCircle2 className="h-4 w-4" />}>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {a.recommendedNextSteps.map((ns, i) => <li key={i}>{ns}</li>)}
              </ul>
            </Section>
          )}

          {/* Metadata */}
          <div className="border-t border-border pt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
            <span>Created: {new Date(a.createdAt).toLocaleDateString()}</span>
            {a.reviewedBy && <span>Reviewed by: {a.reviewedBy}</span>}
            {a.reviewedAt && <span>Reviewed: {new Date(a.reviewedAt).toLocaleDateString()}</span>}
          </div>

          <p className="text-[10px] text-muted-foreground text-center pt-2">
            Pilot v1.3 · Impact analysis assessment layer · Not legal advice
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Helper Components ────────────────────────────────────── */

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">{children}</div>;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-xs text-foreground mt-0.5">{value}</dd>
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    reviewed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    under_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    not_reviewed: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
    no_impact: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function RiskLevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Low: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[level] || 'bg-gray-100 text-gray-600'}`}>
      {level}
    </span>
  );
}
