/**
 * DraftValidationReview — Pre-review validation metadata for draft changes.
 *
 * Phase 3.10: Legal/Compliance Validation Workbench.
 *
 * Validation reviews are advisory metadata that track:
 * - Source support quality assessment
 * - Citation accuracy assessment (for AI-linked drafts)
 * - Legal review requirements and completion
 * - Validator decisions and findings
 *
 * Validation does NOT approve, publish, or activate reference data.
 * Validated drafts must still go through review → approval → publish.
 */
export interface DraftValidationReview {
  /** Stable reference ID, e.g. "DVR-xxx-xxxx" */
  id: string;
  /** stableReferenceId of the draft change being validated */
  draftChangeId: string;
  /** AI suggestion ID if the draft originated from AI citation conversion */
  aiSuggestionId: string | null;
  /** Linked source record ID */
  sourceRecordId: string | null;
  /** Linked source file ID */
  sourceFileId: string | null;

  // ── Status ──────────────────────────────────────────────────
  validationStatus: 'not_started' | 'in_validation' | 'validated_for_review' | 'returned_for_revision' | 'rejected' | 'legal_review_required';
  validationType: 'legal' | 'compliance' | 'source_support' | 'ai_assisted_citation' | 'general';

  // ── Assessment ──────────────────────────────────────────────
  sourceSupportStatus: 'not_checked' | 'supported' | 'partially_supported' | 'unsupported' | 'missing_source';
  citationAccuracyStatus: 'not_checked' | 'accurate' | 'partially_accurate' | 'inaccurate' | 'not_applicable';

  // ── Legal / compliance ──────────────────────────────────────
  legalReviewRequired: boolean;
  legalReviewCompleted: boolean;
  complianceReviewCompleted: boolean;

  // ── Reviewer ────────────────────────────────────────────────
  reviewerDecision: string | null;
  reviewerNotes: string | null;
  validationFindings: string | null;
  requiredCorrections: string | null;
  reviewedByName: string | null;
  reviewedByEmail: string | null;
  reviewedAt: string | null;

  // ── Timestamps ──────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
}
