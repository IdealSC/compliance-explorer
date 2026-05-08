'use client';

/**
 * ValidationDetailDrawer — Phase 3.10 Validation Workbench.
 *
 * Detail panel for reviewing and validating a draft change.
 * Sections:
 *   A. Draft Summary — ID, status, entity type, proposed/previous values
 *   B. AI Provenance — AI-linked marker if applicable
 *   C. Source Support — source assessment status
 *   D. Validation Status — current status, legal/compliance flags
 *   E. Reviewer Notes — findings, corrections, decision
 *   F. Governance Warning — "validation does not approve/publish"
 *
 * GOVERNANCE: This component displays advisory validation metadata only.
 * No approval, publication, or active-data mutation occurs from this drawer.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DraftStatusBadge } from '@/components/badges';
import {
  ValidationStatusBadge,
  SourceSupportBadge,
  CitationAccuracyBadge,
} from './ValidationStatusBadge';
import {
  X,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Scale,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
} from 'lucide-react';
import type { DraftValidationReview, DraftRegulatoryChange } from '@/types';

interface ValidationDetailDrawerProps {
  review: DraftValidationReview;
  draft: DraftRegulatoryChange | null;
  onClose: () => void;
  isDbMode: boolean;
}

export function ValidationDetailDrawer({
  review,
  draft,
  onClose,
  isDbMode,
}: ValidationDetailDrawerProps) {
  const isAiLinked = !!review.aiSuggestionId || review.validationType === 'ai_assisted_citation';
  const aiProvenanceMatch = draft?.changeReason?.match(/\[AI Citation Suggestion: ([^\]]+)\]/);
  const aiSuggestionRef = aiProvenanceMatch ? aiProvenanceMatch[1] : review.aiSuggestionId;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-label="Validation detail drawer">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-background border-l border-border overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Validation Review</span>
            <span className="font-mono text-xs text-muted-foreground">{review.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* ── A. Draft Summary ──────────────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Draft Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-primary font-bold">{review.draftChangeId}</span>
                {draft && <DraftStatusBadge status={draft.draftStatus} />}
                <ValidationStatusBadge status={review.validationStatus} />
                {isAiLinked && (
                  <Badge variant="outline" className="text-[10px] py-0 bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Linked
                  </Badge>
                )}
              </div>

              {draft && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Entity Type</span>
                    <p className="mt-0.5 capitalize">{draft.affectedEntityType?.replace(/_/g, ' ') ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Change Type</span>
                    <p className="mt-0.5 capitalize">{draft.changeType?.replace(/_/g, ' ') ?? '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Proposed Change</span>
                    <p className="mt-0.5 text-foreground">{draft.proposedChangeSummary}</p>
                  </div>
                  {draft.sourceReference && (
                    <div className="col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Reference</span>
                      <p className="mt-0.5 text-muted-foreground">{draft.sourceReference}</p>
                    </div>
                  )}
                </div>
              )}

              {!draft && (
                <p className="text-xs text-muted-foreground italic">Draft details not available in current data set.</p>
              )}
            </CardContent>
          </Card>

          {/* ── B. AI Provenance ──────────────────────────────── */}
          {isAiLinked && (
            <Card className="border-violet-500/20 bg-violet-500/[0.02]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                    AI Provenance
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiSuggestionRef && (
                  <div className="text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Suggestion ID</span>
                    <p className="mt-0.5 font-mono text-violet-700 dark:text-violet-300">{aiSuggestionRef}</p>
                  </div>
                )}
                <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                  <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    This draft was created from an AI-generated citation suggestion.
                    AI output is not legal advice and must be independently verified against authoritative source material.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── C. Source & Citation Assessment ───────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Source & Citation Assessment
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Support</span>
                  <div className="mt-1">
                    <SourceSupportBadge status={review.sourceSupportStatus} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Citation Accuracy</span>
                  <div className="mt-1">
                    <CitationAccuracyBadge status={review.citationAccuracyStatus} />
                  </div>
                </div>
              </div>

              {review.sourceRecordId && (
                <div className="text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Record</span>
                  <p className="mt-0.5 font-mono text-muted-foreground">{review.sourceRecordId}</p>
                </div>
              )}

              {['unsupported', 'missing_source'].includes(review.sourceSupportStatus) && (
                <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2">
                  <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-red-800 dark:text-red-300 leading-relaxed">
                    Source support issue detected. This draft requires additional source documentation before proceeding to formal review.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── D. Validation Status ──────────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Validation Status
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Status</span>
                  <div className="mt-1">
                    <ValidationStatusBadge status={review.validationStatus} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Validation Type</span>
                  <p className="mt-0.5 capitalize">{review.validationType.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  {review.legalReviewRequired ? (
                    review.legalReviewCompleted
                      ? <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      : <AlertTriangle className="h-3 w-3 text-amber-500" />
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    Legal: {review.legalReviewRequired
                      ? (review.legalReviewCompleted ? 'Complete' : 'Required')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {review.complianceReviewCompleted
                    ? <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    : <span className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                  }
                  <span className="text-[10px] text-muted-foreground">
                    Compliance: {review.complianceReviewCompleted ? 'Complete' : 'Pending'}
                  </span>
                </div>
              </div>

              {review.reviewedByName && (
                <div className="text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reviewed By</span>
                  <p className="mt-0.5">
                    {review.reviewedByName}
                    {review.reviewedAt && (
                      <span className="text-muted-foreground ml-1">
                        — {new Date(review.reviewedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── E. Reviewer Notes & Findings ──────────────────── */}
          {(review.reviewerNotes || review.validationFindings || review.requiredCorrections || review.reviewerDecision) && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Reviewer Assessment
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {review.reviewerDecision && (
                  <div className="text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Decision</span>
                    <p className="mt-0.5 text-foreground">{review.reviewerDecision}</p>
                  </div>
                )}
                {review.reviewerNotes && (
                  <div className="text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notes</span>
                    <p className="mt-0.5 text-muted-foreground whitespace-pre-wrap">{review.reviewerNotes}</p>
                  </div>
                )}
                {review.validationFindings && (
                  <div className="text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Findings</span>
                    <p className="mt-0.5 text-muted-foreground whitespace-pre-wrap">{review.validationFindings}</p>
                  </div>
                )}
                {review.requiredCorrections && (
                  <div className="text-xs border-l-2 border-amber-500/50 pl-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">Required Corrections</span>
                    <p className="mt-0.5 text-amber-800 dark:text-amber-200 whitespace-pre-wrap">{review.requiredCorrections}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Workflow Status Indicator (JSON mode info) ────── */}
          {!isDbMode && (
            <div className="flex items-start gap-2 rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 px-3 py-2">
              <AlertTriangle className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                Validation actions require database mode. Displaying sample data in read-only mode.
              </p>
            </div>
          )}

          {/* ── Validation Actions (DB mode only visual) ─────── */}
          {isDbMode && !['validated_for_review', 'rejected'].includes(review.validationStatus) && (
            <Card className="border-primary/20">
              <CardContent className="pt-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Available Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {review.validationStatus === 'not_started' && (
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 cursor-default">
                      <Play className="h-3 w-3 mr-1" /> Start Validation
                    </Badge>
                  )}
                  {review.validationStatus === 'in_validation' && (
                    <>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 cursor-default">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Ready for Review
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-700 cursor-default">
                        <Scale className="h-3 w-3 mr-1" /> Legal Review
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 cursor-default">
                        <RotateCcw className="h-3 w-3 mr-1" /> Return
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-700 cursor-default">
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Badge>
                    </>
                  )}
                  {review.validationStatus === 'legal_review_required' && (
                    <>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 cursor-default">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Ready for Review
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 cursor-default">
                        <Play className="h-3 w-3 mr-1" /> Resume Validation
                      </Badge>
                    </>
                  )}
                  {review.validationStatus === 'returned_for_revision' && (
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 cursor-default">
                      <Play className="h-3 w-3 mr-1" /> Re-enter Validation
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── F. Governance Warning ──────────────────────────── */}
          <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-blue-800 dark:text-blue-300 leading-relaxed">
              <strong>Governance:</strong> Validation is advisory review metadata only.
              It does not approve, publish, activate, or modify controlled regulatory reference data.
              Validated drafts must still proceed through the review → approval → publishing pipeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
