/**
 * Evidence — From the "Evidence Register" sheet.
 * 11 fields.
 */
export interface Evidence {
  evidenceId: string;                   // EVD-001 …
  evidenceArtifact: string | null;
  regulatoryDriver: string | null;
  primaryProcess: string | null;
  evidenceOwner: string | null;
  systemRepository: string | null;
  minimumReviewCadence: string | null;
  inspectionUse: string | null;
  relatedMatrixRowsNotes: string | null;
  evidenceCriticality: string | null;   // Critical | High | Medium | Low
  appUse: string | null;
}
