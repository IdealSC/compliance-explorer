/**
 * Crosswalk — From the "Crosswalk Summary" sheet.
 * 10 fields. Maps regulatory themes across multiple requirements.
 */
export interface Crosswalk {
  crosswalkId: string;                    // CW-001 …
  crosswalkArea: string | null;
  linkedLawsStandardsGuidance: string | null;
  businessMeaning: string | null;
  primaryEvidenceControl: string | null;
  sourceCoverage: string | null;
  primaryScorPhase: string | null;
  primaryPersonaViewer: string | null;
  relatedAppView: string | null;
  linkedMatrixRowIdsFilterLogic: string | null;
}
