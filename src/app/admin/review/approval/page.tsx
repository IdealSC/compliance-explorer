'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DraftStatusBadge, LegalReviewMarker, ReviewStatusBadge } from '@/components/badges';
import { SimulationDisclaimer, SampleDataBanner, DiffDisplay } from '@/components/governance';
import { getDraftChanges, getRegulatoryUpdates, getDraftValidationReviews } from '@/lib/data';
import { ReviewActionPanel } from '@/components/review/ReviewActionPanel';
import { Check, RotateCcw, Eye, ShieldAlert, Database, RefreshCw, Rocket, AlertTriangle } from 'lucide-react';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';
import { PublishActionPanel } from '@/components/publishing/PublishActionPanel';
import { ValidationStatusBadge } from '@/components/validation/ValidationStatusBadge';

// ── Types ───────────────────────────────────────────────────────

interface ApprovalReviewData {
  stableReferenceId: string;
  reviewTargetType: string;
  reviewTargetId: string;
  relatedUpdateId: string | null;
  relatedDraftChangeId: string | null;
  reviewStatus: string;
  reviewDecision: string | null;
  reviewComments: string | null;
  reviewedByName: string | null;
  reviewedByEmail: string | null;
  submittedAt: string;
  sourceReference: string | null;
  legalReviewRequired: boolean;
  approvalReference: string | null;
}

export default function ReviewApprovalPage() {
  const allDrafts = React.useMemo(() => getDraftChanges(), []);
  const updates = React.useMemo(() => getRegulatoryUpdates(), []);
  const updateMap = React.useMemo(() => new Map(updates.map((u) => [u.id, u])), [updates]);
  const validationReviews = React.useMemo(() => getDraftValidationReviews(), []);
  const validationMap = React.useMemo(
    () => new Map(validationReviews.map((r) => [r.draftChangeId, r])),
    [validationReviews],
  );

  const isDbMode = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_DATA_SOURCE === 'database'
    : false;

  // ── Database mode: persistent review records ──────────────────
  const [reviews, setReviews] = React.useState<ApprovalReviewData[]>([]);
  const [loadingReviews, setLoadingReviews] = React.useState(false);
  const [dbError, setDbError] = React.useState<string | null>(null);

  const fetchReviews = React.useCallback(async () => {
    if (!isDbMode) return;
    setLoadingReviews(true);
    setDbError(null);
    try {
      const res = await fetch('/api/review/approval-reviews');
      const data = await res.json();
      if (res.ok && data.reviews) {
        setReviews(data.reviews);
      } else {
        setDbError(data.error || 'Failed to load reviews.');
      }
    } catch {
      setDbError('Network error loading reviews.');
    } finally {
      setLoadingReviews(false);
    }
  }, [isDbMode]);

  React.useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Database mode: publishable drafts (Phase 2.5B) ────────────
  interface PublishableDraftData {
    draftStableReferenceId: string;
    proposedChangeSummary: string;
    affectedEntityType: string;
    affectedEntityId: string | null;
    sourceReference: string | null;
    draftStatus: string;
    reviewStableReferenceId: string;
    reviewStatus: string;
    approvedByName: string | null;
    approvalReference: string | null;
  }

  const [publishableDrafts, setPublishableDrafts] = React.useState<PublishableDraftData[]>([]);
  const [loadingPublishable, setLoadingPublishable] = React.useState(false);

  const fetchPublishableDrafts = React.useCallback(async () => {
    if (!isDbMode) return;
    setLoadingPublishable(true);
    try {
      const res = await fetch('/api/publishing/publishable-drafts');
      const data = await res.json();
      if (res.ok && data.drafts) {
        setPublishableDrafts(data.drafts);
      }
    } catch {
      // Non-critical — publishing section just shows empty
    } finally {
      setLoadingPublishable(false);
    }
  }, [isDbMode]);

  React.useEffect(() => {
    fetchPublishableDrafts();
  }, [fetchPublishableDrafts]);

  // ── JSON mode: simulated workflow ─────────────────────────────
  const [localStatuses, setLocalStatuses] = React.useState<Record<string, string>>({});

  const getStatus = (draftId: string, original: string) => localStatuses[draftId] || original;

  const reviewable = React.useMemo(() => {
    return allDrafts.filter((d) => {
      const status = getStatus(d.draftId, d.draftStatus);
      return status === 'ready_for_review' || localStatuses[d.draftId] !== undefined;
    });
  }, [allDrafts, localStatuses]);

  const pendingCount = isDbMode
    ? reviews.filter((r) => ['pending', 'in_review', 'legal_review_required'].includes(r.reviewStatus)).length
    : reviewable.filter((d) => getStatus(d.draftId, d.draftStatus) === 'ready_for_review').length;

  const simulateAction = (draftId: string, newStatus: string) => {
    setLocalStatuses((prev) => ({ ...prev, [draftId]: newStatus }));
  };

  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // ── Database mode: find matching draft data for context ───────
  const getDraftForReview = (review: ApprovalReviewData) => {
    if (review.reviewTargetType === 'draft_change') {
      return allDrafts.find((d) => d.draftId === review.reviewTargetId);
    }
    return null;
  };

  const getUpdateForReview = (review: ApprovalReviewData) => {
    if (review.reviewTargetType === 'regulatory_update') {
      return updates.find((u) => u.id === review.reviewTargetId);
    }
    if (review.relatedUpdateId) {
      return updates.find((u) => u.id === review.relatedUpdateId);
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review & Approval"
        description="Review pending draft changes and approve, return, or reject proposed modifications to controlled regulatory data."
        badge={{ label: `${pendingCount} pending`, variant: 'secondary' }}
      />

      <SampleDataBanner />

      {/* Phase 2.5B governance banner */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2.5">
        <ShieldAlert className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
          <strong>Phase 2.5B — Controlled Publishing:</strong> Approved drafts can now be published as versioned active reference records.
          {' '}Publishing creates new versions and preserves prior records — <em>it never overwrites active reference data.</em>
          {' '}Three-level separation of duties is enforced (creator ≠ approver ≠ publisher).
          {!isDbMode && ' Publishing requires database mode.'}
        </p>
      </div>

      {/* ─── DATABASE MODE ─────────────────────────────────────── */}
      {isDbMode && (
        <div className="space-y-3">
          {/* Refresh button */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchReviews}
              disabled={loadingReviews}
              className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-[10px] font-semibold hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loadingReviews ? 'animate-spin' : ''}`} />
              Refresh Queue
            </button>
            <Badge variant="outline" className="text-[10px]">
              <Database className="h-3 w-3 mr-1" />
              Database Mode — Persistent Reviews
            </Badge>
          </div>

          {dbError && (
            <p className="text-xs text-red-600">{dbError}</p>
          )}

          {reviews.length === 0 && !loadingReviews && (
            <FilterEmptyState label="No approval review records found. Submit a draft for review to create one." />
          )}

          {reviews.map((review) => {
            const draft = getDraftForReview(review);
            const parentUpdate = getUpdateForReview(review);
            const isExpanded = expandedId === review.stableReferenceId;

            return (
              <Card
                key={review.stableReferenceId}
                className={
                  review.reviewStatus === 'approved_for_publication' ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                  : review.reviewStatus === 'rejected' ? 'border-red-500/30 bg-red-500/[0.02]'
                  : review.reviewStatus === 'returned_for_revision' ? 'border-amber-500/30 bg-amber-500/[0.02]'
                  : review.reviewStatus === 'in_review' ? 'border-blue-500/30 bg-blue-500/[0.02]'
                  : review.reviewStatus === 'legal_review_required' ? 'border-purple-500/30 bg-purple-500/[0.02]'
                  : ''
                }
              >
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-primary font-bold">{review.stableReferenceId}</span>
                        <ReviewStatusBadge status={review.reviewStatus} />
                        <Badge variant="outline" className="text-[10px] py-0">{review.reviewTargetType.replace(/_/g, ' ')}</Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">{review.reviewTargetId}</span>
                        {review.reviewTargetType === 'draft_change' && validationMap.get(review.reviewTargetId) && (
                          <ValidationStatusBadge status={validationMap.get(review.reviewTargetId)!.validationStatus} />
                        )}
                      </div>
                      <CardTitle className="text-sm leading-snug">
                        {draft?.proposedChangeSummary
                          || parentUpdate?.updateTitle
                          || `Review for ${review.reviewTargetId}`}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Type</span>
                      <p className="mt-0.5 text-foreground capitalize">{review.reviewTargetType.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Submitted</span>
                      <p className="mt-0.5 text-muted-foreground">{review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reviewer</span>
                      <p className="mt-0.5 text-foreground">{review.reviewedByName || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source</span>
                      <p className="mt-0.5 text-muted-foreground">{review.sourceReference || draft?.sourceReference || '—'}</p>
                    </div>
                  </div>

                  {parentUpdate && (
                    <LegalReviewMarker required={parentUpdate.legalReviewRequired} />
                  )}

                  {/* Expandable draft detail */}
                  {draft && (
                    <>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : review.stableReferenceId)}
                        className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        {isExpanded ? 'Hide draft details' : 'View draft details'}
                      </button>

                      {isExpanded && (
                        <DiffDisplay previousValue={draft.previousValue} proposedValue={draft.proposedValue} />
                      )}

                      {isExpanded && draft.changeReason && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Change Reason</span>
                          <p className="mt-0.5 text-xs text-muted-foreground">{draft.changeReason}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Persistent review action panel */}
                  <ReviewActionPanel
                    reviewId={review.stableReferenceId}
                    reviewStatus={review.reviewStatus}
                    reviewTargetType={review.reviewTargetType}
                    reviewTargetId={review.reviewTargetId}
                    reviewedByName={review.reviewedByName}
                    reviewComments={review.reviewComments}
                    approvalReference={review.approvalReference}
                    legalReviewRequired={review.legalReviewRequired}
                    onUpdated={fetchReviews}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── PUBLISHING SECTION (Database Mode) ──────────────── */}
      {isDbMode && publishableDrafts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-foreground">Ready for Publication</h2>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              {publishableDrafts.length} publishable
            </Badge>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
              The following drafts have been approved for publication readiness and are eligible for controlled publishing.
              Publishing will create new versioned active reference records. This action cannot be undone.
            </p>
          </div>

          {publishableDrafts.map((pd) => (
            <Card key={pd.draftStableReferenceId} className="border-emerald-500/20">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-primary font-bold">{pd.draftStableReferenceId}</span>
                      <Badge variant="outline" className="text-[10px] py-0 bg-emerald-500/10 text-emerald-700">
                        Approved for Publication Readiness
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0">{pd.affectedEntityType.replace(/_/g, ' ')}</Badge>
                    </div>
                    <CardTitle className="text-sm leading-snug">{pd.proposedChangeSummary}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <PublishActionPanel
                  draftStableReferenceId={pd.draftStableReferenceId}
                  proposedChangeSummary={pd.proposedChangeSummary}
                  affectedEntityType={pd.affectedEntityType}
                  sourceReference={pd.sourceReference}
                  draftStatus={pd.draftStatus}
                  approvedByName={pd.approvedByName}
                  approvalReference={pd.approvalReference}
                  onPublished={() => {
                    fetchPublishableDrafts();
                    fetchReviews();
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── JSON MODE ─────────────────────────────────────────── */}
      {!isDbMode && (
        <div className="space-y-3">
          <SimulationDisclaimer />

          <div className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 px-3 py-2">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Persistent review decisions require database mode. All actions below are simulated locally.</span>
          </div>

          {reviewable.map((d) => {
            const status = getStatus(d.draftId, d.draftStatus);
            const parentUpdate = updateMap.get(d.relatedUpdateId);
            const isExpanded = expandedId === d.draftId;

            return (
              <Card
                key={d.draftId}
                className={
                  status === 'approved' ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                  : status === 'rejected' ? 'border-red-500/30 bg-red-500/[0.02]'
                  : status === 'returned' ? 'border-amber-500/30 bg-amber-500/[0.02]'
                  : ''
                }
              >
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-primary font-bold">{d.draftId}</span>
                        <DraftStatusBadge status={status} />
                        <Badge variant="outline" className="text-[10px] py-0">{d.changeType}</Badge>
                        <Badge variant="outline" className="text-[10px] py-0">{d.affectedEntityType}</Badge>
                      </div>
                      <CardTitle className="text-sm leading-snug">{d.proposedChangeSummary}</CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source</span>
                      <p className="mt-0.5 text-muted-foreground">{d.sourceReference || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Submitted By</span>
                      <p className="mt-0.5 text-foreground">{d.submittedBy || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Submitted Date</span>
                      <p className="mt-0.5 text-muted-foreground">{d.submittedDate || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Required Approver</span>
                      <p className="mt-0.5 text-foreground">{d.requiredApprover || '—'}</p>
                    </div>
                  </div>

                  {parentUpdate && (
                    <LegalReviewMarker required={parentUpdate.legalReviewRequired} />
                  )}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : d.draftId)}
                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    {isExpanded ? 'Hide draft details' : 'View draft details'}
                  </button>

                  {isExpanded && (
                    <DiffDisplay previousValue={d.previousValue} proposedValue={d.proposedValue} />
                  )}

                  {isExpanded && d.changeReason && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Change Reason</span>
                      <p className="mt-0.5 text-xs text-muted-foreground">{d.changeReason}</p>
                    </div>
                  )}

                  {status === 'ready_for_review' && (
                    <div className="flex gap-2 pt-1 border-t border-border mt-2">
                      <button
                        onClick={() => simulateAction(d.draftId, 'approved')}
                        className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Check className="h-3 w-3" /> Simulate Approval
                      </button>
                      <button
                        onClick={() => simulateAction(d.draftId, 'returned')}
                        className="flex items-center gap-1 rounded-md bg-amber-500/10 px-3 py-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" /> Simulate Return
                      </button>
                      <button
                        onClick={() => simulateAction(d.draftId, 'rejected')}
                        className="flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Simulate Reject
                      </button>
                    </div>
                  )}

                  {status !== 'ready_for_review' && localStatuses[d.draftId] && (
                    <p className="text-[10px] text-muted-foreground italic pt-1">
                      Simulated action: {status} (local state only — active data unchanged)
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {reviewable.length === 0 && (
            <FilterEmptyState label="No draft changes are pending review." />
          )}
        </div>
      )}
    </div>
  );
}
