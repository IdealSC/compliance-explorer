/**
 * Risk — From the "Highest Risk" sheet.
 * 17 fields. Linked to Requirement via linkedMatrixRowId.
 */
export interface Risk {
  riskId: string;                     // RISK-001 …
  linkedMatrixRowId: string;          // Foreign key to Requirement.matrixRowId
  matrixRowId: string;                // Duplicate of linked ID (from workbook)
  severityPriority: string | null;    // Critical | High | Medium
  riskTheme: string | null;           // e.g., "Supply Chain Resilience & Shortages"
  obligation: string | null;          // Long narrative
  whyHighRisk: string | null;         // Long narrative
  owner: string | null;
  evidence: string | null;
  source: string | null;
  riskThemeCategory: string | null;   // e.g., "Shortage / Resilience"
  primaryFunction: string | null;     // e.g., "Supply Chain Leader"
  primaryScorPhase: string | null;    // PLAN | SOURCE | etc.
  primaryJurisdiction: string | null;
  reviewStatus: string | null;
  mitigationStatus: string | null;
  appDashboardUse: string | null;
}
