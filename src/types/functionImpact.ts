/**
 * FunctionImpact — From the "Function Impact" sheet.
 * One row per business function.
 */
export interface FunctionImpact {
  functionImpactId: string;               // FI-001 …
  businessFunction: string | null;
  whatTheyNeedToUnderstand: string | null;
  whatTheyNeedToActOn: string | null;
  primaryControlsEvidence: string | null;
  highestRiskQuestions: string | null;
  primaryPersonaViewer: string | null;
  primaryScorPhases: string | null;
  digitalSystemEvidenceDependencies: string | null;
  linkedMatrixRowIdFilter: string | null;

  // ── Source Provenance (governance-ready) ───────────────────
  sourceFile: string | null;
  lastReviewedDate: string | null;
  confidenceLevel: string | null;         // High | Medium | Low
}
