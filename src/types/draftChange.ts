/**
 * DraftRegulatoryChange — A proposed modification to controlled regulatory data.
 *
 * Draft changes are created during the draft_mapping stage of a RegulatoryUpdate.
 * They represent what WOULD change in the active compliance matrix if approved.
 * Draft changes NEVER directly modify active regulatory reference data.
 */
export interface DraftRegulatoryChange {
  /** Unique identifier, e.g. "DRC-001" */
  draftId: string;
  /** ID of the parent RegulatoryUpdate (e.g. "RU-001") */
  relatedUpdateId: string;

  // ── Target Entity ─────────────────────────────────────────
  /** Type of entity being modified */
  affectedEntityType: 'obligation' | 'crosswalk' | 'citation' | 'interpretation' | 'control' | 'evidence' | 'function_impact';
  /** ID of the affected entity (e.g. "CM-0001", "CW-01") */
  affectedEntityId: string | null;

  // ── Change Details ────────────────────────────────────────
  /** Type of change being proposed */
  changeType: 'new' | 'update' | 'supersede' | 'citation_update' | 'interpretation_update' | 'crosswalk_update' | 'control_update' | 'evidence_update' | 'function_impact_update';
  /** Human-readable summary of the proposed change */
  proposedChangeSummary: string;
  /** Previous field value (for updates/supersedes) */
  previousValue: string | null;
  /** Proposed new value */
  proposedValue: string | null;

  // ── Provenance ────────────────────────────────────────────
  /** Source citation or reference for this change */
  sourceReference: string | null;
  /** Reason the change is being proposed */
  changeReason: string | null;

  // ── Workflow ──────────────────────────────────────────────
  /** Required approver role or name */
  requiredApprover: string | null;
  /** Current status of this draft */
  draftStatus: 'draft' | 'ready_for_review' | 'returned' | 'approved' | 'rejected';
  /** Who submitted this draft */
  submittedBy: string | null;
  /** Date submitted (ISO date) */
  submittedDate: string | null;
}
