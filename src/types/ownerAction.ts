/**
 * OwnerActionItem — Action item assigned to a business owner
 * to operationalize a compliance control or evidence requirement.
 *
 * Owner actions are OPERATIONAL data. They do not modify
 * regulatory reference data.
 */

export type ActionStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'overdue';

export type ActionPriority = 'low' | 'medium' | 'high' | 'critical';

export interface OwnerActionItem {
  /** Unique identifier, e.g. "ACT-001" */
  id: string;
  actionTitle: string;
  actionDescription: string;
  owner: string;
  businessFunction: string;

  // ── Linkage (read-only references) ───────────────────────────
  relatedControlIds: string[];
  relatedEvidenceIds: string[];
  relatedObligationIds: string[];
  relatedImpactAnalysisIds: string[];

  // ── Status & Priority ────────────────────────────────────────
  actionStatus: ActionStatus;
  priority: ActionPriority;
  dueDate: string | null;
  dependency: string | null;
  riskIfNotCompleted: string;
  sourceReference: string | null;

  // ── Operational Notes ─────────────────────────────────────────
  notes: string | null;

  // ── Metadata ─────────────────────────────────────────────────
  createdAt: string;
}
