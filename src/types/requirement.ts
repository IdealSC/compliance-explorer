/**
 * Requirement — Primary object from the Compliance Matrix sheet.
 * 61 fields mapped 1:1 from workbook columns.
 * Matrix Row ID (e.g., CM-0001) is the unique identifier.
 */
export interface Requirement {
  // ── Identity ──────────────────────────────────────────────
  matrixRowId: string;                              // CM-0001 … CM-0110
  rowType: string | null;                           // "Framework source row" | "Crosswalk source row"

  // ── Regulatory Classification ─────────────────────────────
  regulatoryDomain: string | null;                  // e.g., "Supply Chain Resilience / Quality Risk Management"
  jurisdictionRegion: string | null;                // e.g., "United States"
  regulatorAuthority: string | null;                // e.g., "US Congress / FDA"
  lawRegulationFrameworkStandardName: string | null; // e.g., "FD&C Act § 506C(j) (amended by CARES Act)"
  specificCitationSectionClause: string | null;
  sourceType: string | null;                        // Law | Guidance | Framework | Standard
  regulatoryTier: string | null;                    // e.g., "Tier 1 (Statutory Law)"

  // ── SCOR / Category Hierarchy ─────────────────────────────
  scorPhase: string | null;                         // PLAN | SOURCE | MAKE | DELIVER | RETURN | ENABLE
  level1Category: string | null;
  level2Subcategory: string | null;
  level3RequirementArea: string | null;
  level4DetailedRequirement: string | null;         // Narrative
  level5GranularObligation: string | null;          // Narrative

  // ── Requirement Content ───────────────────────────────────
  exactRequirementOrSourceLanguage: string | null;  // Long narrative
  plainEnglishInterpretation: string | null;        // Long narrative

  // ── Applicability ─────────────────────────────────────────
  whoMustComply: string | null;
  businessFunctionImpacted: string | null;          // Semicolon-delimited multi-value
  exampleBusinessOwner: string | null;
  operationalProcessImpacted: string | null;

  // ── Actions & Controls ────────────────────────────────────
  requiredAction: string | null;
  requiredControl: string | null;
  requiredEvidenceDocumentation: string | null;
  reportingRequirement: string | null;
  monitoringRequirement: string | null;
  frequencyTiming: string | null;
  triggeringEvent: string | null;
  applicabilityConditions: string | null;
  exceptionsExemptions: string | null;

  // ── Cross-References ──────────────────────────────────────
  relatedStandards: string | null;
  relatedLawsRegulations: string | null;
  relatedInternalPoliciesOrProcedures: string | null;
  dependencies: string | null;
  potentialConflictsOrAmbiguities: string | null;

  // ── Risk & Severity ───────────────────────────────────────
  riskOfNonCompliance: string | null;               // Long narrative
  severityPriority: string | null;                  // Critical | High | Medium

  // ── Implementation ────────────────────────────────────────
  implementationNotes: string | null;
  practicalExampleForBusinessLeader: string | null;

  // ── Source Provenance ─────────────────────────────────────
  sourceNoteSourceReference: string | null;
  sourceFile: string | null;
  confidenceLevel: string | null;                   // High | Medium | Low
  openQuestionsMissingInformation: string | null;

  // ── Review & Validation (app-oriented fields) ─────────────
  reviewStatus: string | null;
  accuracyEnhancementNote: string | null;
  externalVerificationUrl: string | null;
  recommendedEnhancementControlGap: string | null;
  targetRemediationOwner: string | null;
  actionRequired: string | null;
  validationDate: string | null;

  // ── App Display & Filtering ───────────────────────────────
  primaryPersonaViewer: string | null;              // "Supply Chain Leader" | "Quality Leader"
  lifecycleStage: string | null;                    // e.g., "Planning / Resilience"
  processType: string | null;
  status: string | null;                            // e.g., "Reviewed – App Ready Pending Legal Sign-Off"
  actionability: string | null;                     // "Reporting Obligation" | "Monitoring Requirement" | etc.
  digitalSystemOwner: string | null;
  controlType: string | null;                       // e.g., "Notification / Reporting"
  evidenceCriticality: string | null;               // Critical | High | Medium | Low
  uiDisplaySummary: string | null;                  // Preformatted card summary
  needsReviewFlag: boolean;                         // Parsed from "TRUE"/"FALSE"
  launchCriticalFlag: boolean;                      // Parsed from "TRUE"/"FALSE"
}
