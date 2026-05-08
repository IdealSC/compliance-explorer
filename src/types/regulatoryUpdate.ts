/**
 * RegulatoryUpdate — Tracks proposed or identified changes to the regulatory landscape.
 *
 * These records are NOT active regulatory reference data. They represent
 * incoming change signals that must go through the governance workflow
 * (intake → triage → draft_mapping → review → approved → published)
 * before any controlled data is modified.
 */
export interface RegulatoryUpdate {
  /** Unique identifier, e.g. "RU-001" */
  id: string;

  // ── Source Identification ─────────────────────────────────
  /** Descriptive title of the regulatory change */
  updateTitle: string;
  /** Name of the source document or publication */
  sourceName: string | null;
  /** Type of regulatory source */
  sourceType: 'law' | 'regulation' | 'guidance' | 'standard' | 'framework' | 'interpretation' | null;
  /** Issuing regulator or authority */
  regulator: string | null;
  /** Jurisdiction or region of applicability */
  jurisdiction: string | null;

  // ── Dates ─────────────────────────────────────────────────
  /** Date the source was officially published (ISO date) */
  publicationDate: string | null;
  /** Date the change becomes legally effective (ISO date) */
  effectiveDate: string | null;
  /** Date this update was ingested into the system (ISO date) */
  intakeDate: string;

  // ── Change Classification ─────────────────────────────────
  /** Type of change to the regulatory landscape */
  changeType: 'new' | 'amendment' | 'repeal' | 'guidance' | 'standard_update' | 'interpretation_update';
  /** Summary of what changed */
  changeSummary: string;
  /** URL or citation to the primary source */
  sourceReference: string | null;

  // ── Impact Assessment ─────────────────────────────────────
  /** Regulatory domains affected (e.g., "Supply Chain", "Quality") */
  impactedDomains: string[];
  /** Business functions affected */
  impactedBusinessFunctions: string[];

  // ── Workflow State ────────────────────────────────────────
  /** Current stage in the governance workflow */
  currentStage: 'intake' | 'triage' | 'draft_mapping' | 'review' | 'approved' | 'published' | 'rejected';
  /** Assigned reviewer (name or role) */
  assignedReviewer: string | null;

  // ── Quality Indicators ────────────────────────────────────
  /** Confidence in the accuracy of the change assessment */
  confidenceLevel: 'High' | 'Medium' | 'Low' | null;
  /** Whether legal/compliance review is required */
  legalReviewRequired: boolean;

  // ── Cross-References ──────────────────────────────────────
  /** Matrix row IDs of obligations potentially affected */
  relatedObligationIds: string[];
  /** Crosswalk IDs potentially affected */
  relatedCrosswalkIds: string[];
}
