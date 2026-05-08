/**
 * AI Provider Types — Phase 3.8.
 *
 * Strict contracts for citation suggestion generation.
 * Only citation extraction is supported. No obligations,
 * interpretations, mappings, or draft creation.
 *
 * GOVERNANCE:
 * - Input must include sourceExcerpt and sourceReference
 * - Output must include source support for every citation
 * - No obligation fields in output contract
 * - Malformed output must be rejected
 */

// ── Citation Suggestion Input ───────────────────────────────────

export interface CitationSuggestionInput {
  /** Source record stable reference ID */
  sourceRecordId: string;
  /** Verbatim text excerpt from the source document */
  sourceExcerpt: string;
  /** Human-readable source reference (e.g., "21 CFR 211.68") */
  sourceReference: string;

  // Optional context
  sourceFileId?: string | null;
  intakeRequestId?: string | null;
  sourceLocation?: string | null;
  regulator?: string | null;
  jurisdiction?: string | null;
  sourceTitle?: string | null;
  maxSuggestions?: number;
}

// ── Single Citation Output (from model) ─────────────────────────

export interface CitationOutputItem {
  suggestedCitation: string;
  sourceExcerpt: string;
  sourceLocation: string | null;
  confidenceScore: number;
  confidenceExplanation: string | null;
  notes: string | null;
}

// ── Provider Response ───────────────────────────────────────────

export interface CitationSuggestionResult {
  success: boolean;
  citations: CitationOutputItem[];
  modelName: string;
  modelVersion: string;
  promptVersion: string;
  error?: string;
  /**
   * Machine-readable error category for audit routing.
   * Values: PROVIDER_HTTP_ERROR, EMPTY_CONTENT, INVALID_JSON,
   *         OUTPUT_VALIDATION_FAILED, OBLIGATION_LANGUAGE_DETECTED
   */
  errorCode?: string;
  /** Raw model response stored if AI_STORE_MODEL_OUTPUTS=true */
  rawOutput?: string;
}

// ── Provider Interface ──────────────────────────────────────────

export interface AiProvider {
  /** Provider identifier */
  readonly name: string;

  /**
   * Generate citation suggestions from source text.
   * This is the ONLY supported extraction operation.
   *
   * Do NOT add obligation, interpretation, or mapping methods.
   */
  generateCitationSuggestions(input: CitationSuggestionInput): Promise<CitationSuggestionResult>;
}
