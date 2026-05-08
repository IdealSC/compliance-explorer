/**
 * AI Suggestion Types — Phase 3.6.
 *
 * GOVERNANCE: AI suggestions are DRAFT-ONLY governance records.
 * They are NOT active reference data, legal advice, or compliance certifications.
 * No AI model integration exists in Phase 3.6.
 */

// ── Enums ───────────────────────────────────────────────────────

export type AiSuggestionType =
  | 'citation'
  | 'obligation'
  | 'interpretation'
  | 'crosswalk'
  | 'control'
  | 'evidence'
  | 'business_function'
  | 'risk'
  | 'other';

export type AiSuggestionStatus =
  | 'generated'
  | 'human_review_required'
  | 'accepted_to_draft'
  | 'rejected'
  | 'superseded'
  | 'expired';

export type AiReviewerDecision =
  | 'accepted'
  | 'rejected'
  | 'needs_revision';

export type AiPromptStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'retired';

// ── AI Extraction Suggestion ────────────────────────────────────

export interface AiExtractionSuggestion {
  id: number | string;
  stableReferenceId: string;

  // Source linkage
  sourceRecordId: string;
  sourceFileId: string | null;
  intakeRequestId: string | null;

  // Classification
  suggestionType: AiSuggestionType;
  suggestionStatus: AiSuggestionStatus;

  // Source evidence
  sourceExcerpt: string;
  sourceLocation: string | null;

  // Suggested content (draft-only)
  suggestedCitation: string | null;
  suggestedObligationText: string | null;
  suggestedPlainEnglishInterpretation: string | null;
  suggestedBusinessFunctions: string[] | null;
  suggestedControls: string[] | null;
  suggestedEvidence: string[] | null;
  suggestedStandards: string[] | null;

  // Confidence
  confidenceScore: number;
  confidenceExplanation: string | null;

  // Model provenance
  modelName: string;
  modelVersion: string;
  promptVersion: string;

  // Generation
  generatedBy: string;
  generatedAt: string;

  // Review
  reviewedByUserId: string | null;
  reviewedByEmail: string | null;
  reviewedAt: string | null;
  reviewerDecision: AiReviewerDecision | null;
  reviewerNotes: string | null;

  // Linkage
  relatedDraftChangeId: string | null;

  // Flags
  legalReviewRequired: boolean;

  // Reference
  sourceReference: string | null;
  auditEventIds: string[] | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ── AI Prompt Version ───────────────────────────────────────────

export interface AiPromptVersion {
  id: number | string;
  stableReferenceId: string;

  promptName: string;
  promptPurpose: string | null;
  promptVersion: string;
  promptText: string;
  promptStatus: AiPromptStatus;

  approvedByUserId: string | null;
  approvedByEmail: string | null;
  approvedAt: string | null;

  modelFamily: string | null;
  riskLevel: string | null;
  governanceNotes: string | null;

  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
