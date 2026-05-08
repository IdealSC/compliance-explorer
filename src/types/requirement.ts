/**
 * Requirement — Primary object from the Compliance Matrix sheet.
 * Matrix Row ID (e.g., CM-0001) is the unique identifier.
 *
 * ┌────────────────────────────────────────────────────────────────┐
 * │  DATA GOVERNANCE TIERS                                        │
 * │                                                               │
 * │  🔒 REGULATORY REFERENCE DATA (Controlled)                   │
 * │     Immutable source-of-truth fields derived from laws,       │
 * │     regulations, standards, and guidance documents.           │
 * │     Changes require Compliance Approver authorization         │
 * │     and produce a new version record.                         │
 * │                                                               │
 * │  ✏️  OPERATIONAL COMPLIANCE DATA (Editable)                   │
 * │     Company-specific operational state: owners, status,       │
 * │     action items, implementation progress. Editable by        │
 * │     Business Owners and Compliance Editors.                   │
 * │                                                               │
 * │  📊 APP DISPLAY & FILTERING (Computed/UI)                     │
 * │     Derived fields for UI rendering, filtering, and           │
 * │     persona-based navigation. Not independently governed.     │
 * └────────────────────────────────────────────────────────────────┘
 */
export interface Requirement {

  // ═══════════════════════════════════════════════════════════════
  // 🔒 REGULATORY REFERENCE DATA — Controlled, version-tracked
  //    Do not modify without Compliance Approver authorization.
  // ═══════════════════════════════════════════════════════════════

  // ── Identity ──────────────────────────────────────────────
  matrixRowId: string;                              // CM-0001 … CM-0110 (stable reference ID)
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
  exactRequirementOrSourceLanguage: string | null;  // Long narrative — source regulatory text
  plainEnglishInterpretation: string | null;        // Long narrative — controlled interpretation

  // ── Applicability ─────────────────────────────────────────
  whoMustComply: string | null;
  businessFunctionImpacted: string | null;          // Semicolon-delimited multi-value
  exampleBusinessOwner: string | null;
  operationalProcessImpacted: string | null;

  // ── Actions & Controls (source-derived) ───────────────────
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

  // ── Risk & Severity (source-derived) ──────────────────────
  riskOfNonCompliance: string | null;               // Long narrative
  severityPriority: string | null;                  // Critical | High | Medium

  // ── Implementation Guidance (source-derived) ──────────────
  implementationNotes: string | null;
  practicalExampleForBusinessLeader: string | null;

  // ── Source Provenance ─────────────────────────────────────
  sourceNoteSourceReference: string | null;
  sourceFile: string | null;
  confidenceLevel: string | null;                   // High | Medium | Low
  openQuestionsMissingInformation: string | null;

  // ── Version & Lifecycle (governance-ready) ────────────────
  /** Semantic version of this regulatory reference record, e.g. "1.0" */
  versionNumber: string | null;
  /** Lifecycle status of this reference record */
  recordStatus: string | null;                      // "active" | "draft" | "pending_review" | "superseded" | "archived"
  /** Date the source law/standard was officially published */
  publicationDate: string | null;                   // ISO date
  /** Date the obligation became legally binding */
  effectiveDate: string | null;                     // ISO date
  /** Date this record was replaced by a newer version */
  supersededDate: string | null;                    // ISO date
  /** matrixRowId of the prior version of this record */
  previousVersionId: string | null;
  /** Summary of what changed from the prior version */
  changeSummary: string | null;
  /** Reason the change was made (e.g., new guidance, correction) */
  changeReason: string | null;

  // ═══════════════════════════════════════════════════════════════
  // ✏️  OPERATIONAL COMPLIANCE DATA — Editable by authorized users
  //    Company-specific status, assignments, and review state.
  // ═══════════════════════════════════════════════════════════════

  // ── Review & Validation ────────────────────────────────────
  reviewStatus: string | null;
  accuracyEnhancementNote: string | null;
  externalVerificationUrl: string | null;
  recommendedEnhancementControlGap: string | null;
  targetRemediationOwner: string | null;
  actionRequired: string | null;
  validationDate: string | null;

  // ═══════════════════════════════════════════════════════════════
  // 📊 APP DISPLAY & FILTERING — Computed / UI-oriented
  //    Derived fields for rendering, navigation, and filtering.
  // ═══════════════════════════════════════════════════════════════

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
