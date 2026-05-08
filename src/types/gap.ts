/**
 * Gap — From the "Gaps & Questions" sheet.
 */
export interface Gap {
  gapId: string;                         // GAP-001 …
  gapQuestion: string | null;
  whyItMatters: string | null;
  suggestedOwner: string | null;
  sourceBasis: string | null;
  priority: string | null;               // Critical | High | Medium
  gapCategory: string | null;
  status: string | null;                 // Open | Closed
  linkedMatrixRowIdFilter: string | null;
  appTreatment: string | null;

  // ── Source Provenance (governance-ready) ───────────────────
  sourceFile: string | null;
  lastReviewedDate: string | null;
  confidenceLevel: string | null;         // High | Medium | Low
}
