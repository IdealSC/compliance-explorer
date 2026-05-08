/**
 * RegulatoryVersion — Version record for a controlled regulatory reference item.
 *
 * Each version captures a point-in-time snapshot of a regulatory obligation,
 * including what changed, who approved it, and when it became effective.
 * Used to build per-record timelines and support audit provenance.
 */
export interface RegulatoryVersion {
  /** Unique version record ID, e.g. "VER-001" */
  versionId: string;
  /** Stable reference ID of the parent record (e.g. "CM-0001") */
  stableReferenceId: string;
  /** Semantic version number, e.g. "1.0", "1.1", "2.0" */
  versionNumber: string;
  /** Lifecycle status of this version */
  recordStatus: 'active' | 'draft' | 'pending_review' | 'superseded' | 'archived';
  /** Date this version became effective (ISO date) */
  effectiveDate: string | null;
  /** Date this version was superseded (ISO date) */
  supersededDate: string | null;
  /** Summary of what changed from the prior version */
  changeSummary: string;
  /** Name or role of the approver */
  approvedBy: string | null;
  /** Timestamp of approval (ISO datetime) */
  approvedAt: string | null;
  /** Version ID of the prior version */
  previousVersionId: string | null;
  /** Source citation or reference for this version */
  sourceReference: string | null;
}
