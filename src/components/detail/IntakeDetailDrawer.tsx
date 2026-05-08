'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  X, Inbox, CheckCircle2, Circle, AlertTriangle, Scale, Clock,
  ArrowRight, User, FileText, Globe, Building2, Calendar,
  Link2, Clipboard, ChevronDown, ChevronUp, Shield,
} from 'lucide-react';
import type { SourceIntakeRequest, SourceIntakeChecklistItem, IntakeStatus, IntakePriority } from '@/types/sourceIntake';

// ── Status Badge ────────────────────────────────────────────────

const STATUS_COLORS: Record<IntakeStatus, string> = {
  submitted: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  triage: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  metadata_review: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  assigned: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  validation_pending: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  legal_review_required: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  ready_for_source_record: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  converted_to_source_record: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
  closed: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

function IntakeStatusBadge({ status }: { status: IntakeStatus }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[status] ?? ''}`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

// ── Priority Badge ──────────────────────────────────────────────

const PRIORITY_COLORS: Record<IntakePriority, string> = {
  critical: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  low: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

function PriorityBadge({ priority }: { priority: IntakePriority }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[priority] ?? ''}`}>
      {priority}
    </Badge>
  );
}

// ── Checklist Item Status Icon ──────────────────────────────────

function ChecklistIcon({ status }: { status: string }) {
  switch (status) {
    case 'complete': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
    case 'incomplete': return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
    case 'needs_review': return <Clock className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    case 'not_applicable': return <Circle className="h-3.5 w-3.5 text-gray-400 shrink-0" />;
    default: return <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
}

// ── Drawer ──────────────────────────────────────────────────────

interface IntakeDetailDrawerProps {
  intake: SourceIntakeRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataSource: 'json' | 'database';
  onRefresh?: () => void;
}

export function IntakeDetailDrawer({
  intake,
  open,
  onOpenChange,
  dataSource,
  onRefresh,
}: IntakeDetailDrawerProps) {
  const [checklistItems, setChecklistItems] = React.useState<SourceIntakeChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [showChecklist, setShowChecklist] = React.useState(true);

  // Load checklist items when drawer opens
  React.useEffect(() => {
    if (!intake || !open) return;

    // If intake has embedded checklist items (JSON mode), use those
    if (intake.checklistItems && intake.checklistItems.length > 0) {
      setChecklistItems(intake.checklistItems);
      return;
    }

    // Otherwise load from API
    setChecklistLoading(true);
    fetch(`/api/sources/intake/${intake.stableReferenceId ?? intake.id}/checklist`)
      .then(res => res.json())
      .then(data => {
        setChecklistItems(data.items ?? []);
      })
      .catch(() => setChecklistItems([]))
      .finally(() => setChecklistLoading(false));
  }, [intake, open]);

  // Reset error on open
  React.useEffect(() => {
    if (open) setActionError(null);
  }, [open]);

  if (!intake) return null;

  const isDb = dataSource === 'database';
  const id = intake.stableReferenceId ?? intake.id;

  async function doAction(url: string, method: string, body?: Record<string, unknown>) {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        setActionError(data.error ?? 'Request failed');
        return;
      }
      onRefresh?.();
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  const completeCount = checklistItems.filter(i => i.status === 'complete').length;
  const totalItems = checklistItems.length;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg border-l border-border bg-background shadow-2xl transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
        role="dialog"
        aria-label="Intake request details"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Inbox className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-tight truncate">{intake.intakeTitle}</h2>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{id}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors shrink-0"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* ── A. Governance Warning ──────────────────────────── */}
          <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs">
            <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-amber-700 dark:text-amber-400">
              <strong>Governance notice:</strong> This intake request does not create obligations, draft mappings, or active reference data. Materials must pass through the controlled publishing workflow.
            </div>
          </div>

          {/* ── B. Status & Priority ──────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2">
            <IntakeStatusBadge status={intake.intakeStatus} />
            <PriorityBadge priority={intake.priority} />
            <Badge variant="outline" className="text-[10px]">
              {intake.intakeType.replace(/_/g, ' ')}
            </Badge>
            {intake.legalReviewRequired && (
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30">
                <Scale className="h-3 w-3 mr-1" /> Legal review
              </Badge>
            )}
            {intake.complianceReviewRequired && (
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30">
                Compliance review
              </Badge>
            )}
          </div>

          {/* ── C. Description ────────────────────────────────── */}
          {intake.intakeDescription && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</div>
              <p className="text-xs text-foreground/80 leading-relaxed">{intake.intakeDescription}</p>
            </div>
          )}

          {/* ── D. Source Classification ──────────────────────── */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Source Classification</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {intake.sourceType && (
                <div className="flex items-center gap-1.5"><FileText className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Type:</span> {intake.sourceType.replace(/_/g, ' ')}</div>
              )}
              {intake.regulator && (
                <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Regulator:</span> {intake.regulator}</div>
              )}
              {intake.jurisdiction && (
                <div className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Jurisdiction:</span> {intake.jurisdiction}</div>
              )}
              {intake.issuingAuthority && (
                <div className="flex items-center gap-1.5 col-span-2"><Building2 className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Authority:</span> {intake.issuingAuthority}</div>
              )}
              {intake.publicationDate && (
                <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Published:</span> {intake.publicationDate}</div>
              )}
              {intake.effectiveDate && (
                <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Effective:</span> {intake.effectiveDate}</div>
              )}
            </div>
          </div>

          {/* ── E. Workflow ───────────────────────────────────── */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Workflow</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {intake.submittedByName && (
                <div className="flex items-center gap-1.5"><User className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Submitted by:</span> {intake.submittedByName}</div>
              )}
              {intake.submittedAt && (
                <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Submitted:</span> {new Date(intake.submittedAt).toLocaleDateString()}</div>
              )}
              {intake.assignedToName && (
                <div className="flex items-center gap-1.5"><User className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Assigned to:</span> {intake.assignedToName}</div>
              )}
              {intake.triagedAt && (
                <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Triaged:</span> {new Date(intake.triagedAt).toLocaleDateString()}</div>
              )}
            </div>
          </div>

          {/* ── F. Triage / Rejection Notes ───────────────────── */}
          {intake.triageNotes && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Triage Notes</div>
              <p className="text-xs text-foreground/80 leading-relaxed p-2 rounded bg-muted/50">{intake.triageNotes}</p>
            </div>
          )}
          {intake.rejectionReason && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 text-red-600">Rejection Reason</div>
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed p-2 rounded bg-red-500/5 border border-red-500/20">{intake.rejectionReason}</p>
            </div>
          )}

          {/* ── G. Related Records ────────────────────────────── */}
          {(intake.relatedSourceRecordId || intake.sourceUrl || intake.sourceReference) && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">References</div>
              <div className="space-y-1 text-xs">
                {intake.relatedSourceRecordId && (
                  <div className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-emerald-500" /> <span className="text-muted-foreground">Source Record:</span> <span className="font-mono">{intake.relatedSourceRecordId}</span></div>
                )}
                {intake.sourceUrl && (
                  <div className="flex items-center gap-1.5"><Link2 className="h-3 w-3 text-blue-500" /> <a href={intake.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{intake.sourceUrl}</a></div>
                )}
                {intake.sourceReference && (
                  <div className="flex items-center gap-1.5"><Clipboard className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Ref:</span> {intake.sourceReference}</div>
                )}
              </div>
            </div>
          )}

          {/* ── H. Checklist ──────────────────────────────────── */}
          <div className="space-y-2">
            <button
              onClick={() => setShowChecklist(!showChecklist)}
              className="flex items-center justify-between w-full text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span>Intake Checklist {totalItems > 0 && `(${completeCount}/${totalItems})`}</span>
              {showChecklist ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showChecklist && (
              <div className="space-y-1.5">
                {checklistLoading && (
                  <p className="text-xs text-muted-foreground italic">Loading checklist...</p>
                )}
                {!checklistLoading && checklistItems.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No checklist items.</p>
                )}
                {!checklistLoading && checklistItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 p-2 rounded border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <ChecklistIcon status={item.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{item.itemLabel}</span>
                        {item.requiredForTriage && (
                          <Badge variant="outline" className="text-[8px] px-1 py-0">triage req</Badge>
                        )}
                        {item.requiredForSourceRecordCreation && (
                          <Badge variant="outline" className="text-[8px] px-1 py-0">source req</Badge>
                        )}
                      </div>
                      {item.itemDescription && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.itemDescription}</p>
                      )}
                      {item.notes && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 italic">{item.notes}</p>
                      )}
                      {item.completedByEmail && item.completedAt && (
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          Completed by {item.completedByEmail} on {new Date(item.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[9px] shrink-0">
                      {item.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}

                {/* Progress bar */}
                {totalItems > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Completion</span>
                      <span>{Math.round((completeCount / totalItems) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${(completeCount / totalItems) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── I. Actions (DB mode only) ─────────────────────── */}
          {isDb && intake.intakeStatus !== 'closed' && intake.intakeStatus !== 'converted_to_source_record' && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</div>

              {actionError && (
                <div className="text-xs text-red-600 dark:text-red-400 p-2 rounded bg-red-500/5 border border-red-500/20">
                  {actionError}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {/* Transition buttons based on current status */}
                {intake.intakeStatus === 'submitted' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    disabled={actionLoading}
                    onClick={() => doAction(`/api/sources/intake/${id}/status`, 'PATCH', { status: 'triage' })}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" /> Move to Triage
                  </Button>
                )}
                {intake.intakeStatus === 'triage' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    disabled={actionLoading}
                    onClick={() => doAction(`/api/sources/intake/${id}/status`, 'PATCH', { status: 'metadata_review' })}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" /> Metadata Review
                  </Button>
                )}
                {intake.intakeStatus === 'metadata_review' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    disabled={actionLoading}
                    onClick={() => doAction(`/api/sources/intake/${id}/status`, 'PATCH', { status: 'assigned' })}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" /> Mark Assigned
                  </Button>
                )}
                {intake.intakeStatus === 'assigned' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    disabled={actionLoading}
                    onClick={() => doAction(`/api/sources/intake/${id}/status`, 'PATCH', { status: 'validation_pending' })}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" /> Validation Pending
                  </Button>
                )}
                {intake.intakeStatus === 'validation_pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      disabled={actionLoading}
                      onClick={() => doAction(`/api/sources/intake/${id}/status`, 'PATCH', { status: 'ready_for_source_record' })}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Ready for Source Record
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 text-rose-600"
                      disabled={actionLoading}
                      onClick={() => doAction(`/api/sources/intake/${id}/status`, 'PATCH', { status: 'legal_review_required' })}
                    >
                      <Scale className="h-3 w-3 mr-1" /> Requires Legal Review
                    </Button>
                  </>
                )}
                {intake.intakeStatus === 'legal_review_required' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    disabled={actionLoading}
                    onClick={() => doAction(`/api/sources/intake/${id}/status`, 'PATCH', { status: 'validation_pending' })}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" /> Return to Validation
                  </Button>
                )}
                {intake.intakeStatus === 'ready_for_source_record' && (
                  <Button
                    size="sm"
                    className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={actionLoading}
                    onClick={() => {
                      if (confirm('Convert this intake to a source record? This creates a new source record but does NOT create obligations, draft mappings, or active reference data.')) {
                        doAction(`/api/sources/intake/${id}/convert-to-source-record`, 'POST');
                      }
                    }}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" /> Convert to Source Record
                  </Button>
                )}

                {/* Reject (available from most statuses) */}
                {['submitted', 'triage', 'metadata_review', 'assigned', 'validation_pending'].includes(intake.intakeStatus) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 text-red-600 border-red-500/30 hover:bg-red-500/5"
                    disabled={actionLoading}
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) {
                        doAction(`/api/sources/intake/${id}/status`, 'PATCH', { status: 'rejected', reason });
                      }
                    }}
                  >
                    Reject
                  </Button>
                )}

                {/* Close (from rejected or converted) */}
                {['rejected', 'converted_to_source_record'].includes(intake.intakeStatus) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    disabled={actionLoading}
                    onClick={() => doAction(`/api/sources/intake/${id}/status`, 'PATCH', { status: 'closed' })}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── J. Metadata Timestamps ────────────────────────── */}
          <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground space-y-0.5">
            <p>Created: {new Date(intake.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(intake.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
