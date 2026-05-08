/**
 * AuditEvent — Immutable record of a change to any governed entity.
 *
 * Audit events are append-only. They cannot be modified or deleted.
 * They form the foundational evidence chain for GxP audit readiness.
 */
export interface AuditEvent {
  /** Unique audit event ID, e.g. "AUD-001" */
  auditId: string;
  /** Type of entity that was changed */
  entityType: 'requirement' | 'crosswalk' | 'draft_change' | 'regulatory_update' | 'approval_review' | 'publication_event' | 'regulatory_reference_record' | 'version' | 'evidence' | 'risk' | 'gap' | 'compliance_control' | 'evidence_requirement' | 'owner_action' | 'immutability_check' | 'source_record' | 'source_checklist' | string;
  /** ID of the affected entity */
  entityId: string;
  /** Action that was performed */
  action: string;
  /** Previous value (for updates) */
  previousValue: string | null;
  /** New value (for updates) */
  newValue: string | null;
  /** Who made the change */
  changedBy: string;
  /** When the change occurred (ISO datetime) */
  changedAt: string;
  /** Reason for the change */
  reason: string | null;
  /** Reference to the approval that authorized this change */
  approvalReference: string | null;
  /** B2 FIX: Source reference for publishing provenance */
  sourceReference?: string | null;
}
