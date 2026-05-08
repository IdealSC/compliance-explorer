/**
 * Operational Write Service — Server-side persistence for operational compliance data.
 *
 * Provides write functions for controls, evidence, and owner actions.
 * Each function enforces:
 * 1. Database mode check (no-op in JSON mode)
 * 2. RBAC permission check (throws AuthorizationError if denied)
 * 3. Entity existence validation
 * 4. Whitelisted field update only (never touches reference linkage)
 * 5. Audit event creation on success
 *
 * GOVERNANCE: These functions only update OPERATIONAL fields.
 * Controlled regulatory reference data (obligations, regulations,
 * citations, standards, crosswalk mappings) is never modified.
 */
import { getDb } from '@/db';
import { eq } from 'drizzle-orm';
import {
  complianceControls,
  evidenceRequirements,
  ownerActions,
} from '@/db/schema';
import { requirePermission, AuthorizationError } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import type { ControlStatus } from '@/types/complianceControl';
import type { EvidenceStatus } from '@/types/evidenceRequirement';
import type { ActionStatus } from '@/types/ownerAction';

// ── Result Types ────────────────────────────────────────────────

export interface WriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR';
  updated?: T;
  auditEventId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult(): WriteResult {
  return {
    success: false,
    error: 'Database mode required for persistence. Set DATA_SOURCE=database in environment.',
    code: 'JSON_MODE',
  };
}

function notFoundResult(entityType: string, id: string): WriteResult {
  return {
    success: false,
    error: `${entityType} with stableReferenceId "${id}" not found.`,
    code: 'NOT_FOUND',
  };
}

// ── Control Writes ──────────────────────────────────────────────

/**
 * Update a control's operational status.
 */
export async function updateControlStatus(
  stableRefId: string,
  status: ControlStatus,
): Promise<WriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.CONTROLS_EDIT);

  const db = getDb();
  const [existing] = await db
    .select({ controlStatus: complianceControls.controlStatus })
    .from(complianceControls)
    .where(eq(complianceControls.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('Control', stableRefId);

  const previousValue = existing.controlStatus;
  await db
    .update(complianceControls)
    .set({ controlStatus: status })
    .where(eq(complianceControls.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'compliance_control',
    entityId: stableRefId,
    action: 'control_status_updated',
    previousValue,
    newValue: status,
  });

  return { success: true, updated: { controlStatus: status }, auditEventId };
}

/**
 * Update a control's operational notes and review dates.
 */
export async function updateControlNotes(
  stableRefId: string,
  notes: string | null,
  nextReviewDate?: string | null,
): Promise<WriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.CONTROLS_EDIT);

  const db = getDb();
  const [existing] = await db
    .select({ notes: complianceControls.notes, nextReviewDate: complianceControls.nextReviewDate, lastReviewedDate: complianceControls.lastReviewedDate })
    .from(complianceControls)
    .where(eq(complianceControls.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('Control', stableRefId);

  const todayDate = new Date().toISOString().split('T')[0];
  const updates: Record<string, unknown> = {
    notes,
    lastReviewedDate: todayDate,
  };
  if (nextReviewDate !== undefined) {
    updates.nextReviewDate = nextReviewDate;
  }

  await db
    .update(complianceControls)
    .set(updates)
    .where(eq(complianceControls.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'compliance_control',
    entityId: stableRefId,
    action: 'control_notes_updated',
    previousValue: JSON.stringify({ notes: existing.notes ?? null, lastReviewedDate: existing.lastReviewedDate ?? null }),
    newValue: JSON.stringify({ notes, lastReviewedDate: todayDate }),
  });

  return { success: true, updated: updates, auditEventId };
}

// ── Evidence Writes ─────────────────────────────────────────────

/**
 * Update an evidence requirement's operational status.
 */
export async function updateEvidenceStatus(
  stableRefId: string,
  status: EvidenceStatus,
): Promise<WriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.EVIDENCE_EDIT);

  const db = getDb();
  const [existing] = await db
    .select({ evidenceStatus: evidenceRequirements.evidenceStatus })
    .from(evidenceRequirements)
    .where(eq(evidenceRequirements.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('Evidence', stableRefId);

  const previousValue = existing.evidenceStatus;
  await db
    .update(evidenceRequirements)
    .set({ evidenceStatus: status })
    .where(eq(evidenceRequirements.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'evidence_requirement',
    entityId: stableRefId,
    action: 'evidence_status_updated',
    previousValue,
    newValue: status,
  });

  return { success: true, updated: { evidenceStatus: status }, auditEventId };
}

/**
 * Update an evidence requirement's notes and collection dates.
 */
export async function updateEvidenceNotes(
  stableRefId: string,
  notes: string | null,
  lastCollectedDate?: string | null,
  nextDueDate?: string | null,
): Promise<WriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.EVIDENCE_EDIT);

  const db = getDb();
  const [existing] = await db
    .select({ notes: evidenceRequirements.notes })
    .from(evidenceRequirements)
    .where(eq(evidenceRequirements.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('Evidence', stableRefId);

  const updates: Record<string, unknown> = { notes };
  if (lastCollectedDate !== undefined) updates.lastCollectedDate = lastCollectedDate;
  if (nextDueDate !== undefined) updates.nextDueDate = nextDueDate;

  await db
    .update(evidenceRequirements)
    .set(updates)
    .where(eq(evidenceRequirements.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'evidence_requirement',
    entityId: stableRefId,
    action: 'evidence_notes_updated',
    previousValue: existing.notes ?? null,
    newValue: notes,
  });

  return { success: true, updated: updates, auditEventId };
}

// ── Owner Action Writes ─────────────────────────────────────────

/**
 * Update an owner action's status.
 */
export async function updateActionStatus(
  stableRefId: string,
  status: ActionStatus,
): Promise<WriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.ACTIONS_EDIT);

  const db = getDb();
  const [existing] = await db
    .select({ actionStatus: ownerActions.actionStatus })
    .from(ownerActions)
    .where(eq(ownerActions.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('OwnerAction', stableRefId);

  const previousValue = existing.actionStatus;
  await db
    .update(ownerActions)
    .set({ actionStatus: status })
    .where(eq(ownerActions.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'owner_action',
    entityId: stableRefId,
    action: 'action_status_updated',
    previousValue,
    newValue: status,
  });

  return { success: true, updated: { actionStatus: status }, auditEventId };
}

/**
 * Update an owner action's notes.
 */
export async function updateActionNotes(
  stableRefId: string,
  notes: string | null,
): Promise<WriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.ACTIONS_EDIT);

  const db = getDb();
  const [existing] = await db
    .select({ notes: ownerActions.notes })
    .from(ownerActions)
    .where(eq(ownerActions.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('OwnerAction', stableRefId);

  await db
    .update(ownerActions)
    .set({ notes })
    .where(eq(ownerActions.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'owner_action',
    entityId: stableRefId,
    action: 'action_notes_updated',
    previousValue: existing.notes ?? null,
    newValue: notes,
  });

  return { success: true, updated: { notes }, auditEventId };
}

/**
 * Update an owner action's due date.
 */
export async function updateActionDueDate(
  stableRefId: string,
  dueDate: string | null,
): Promise<WriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.ACTIONS_EDIT);

  const db = getDb();
  const [existing] = await db
    .select({ dueDate: ownerActions.dueDate })
    .from(ownerActions)
    .where(eq(ownerActions.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('OwnerAction', stableRefId);

  await db
    .update(ownerActions)
    .set({ dueDate })
    .where(eq(ownerActions.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'owner_action',
    entityId: stableRefId,
    action: 'action_due_date_updated',
    previousValue: existing.dueDate ?? null,
    newValue: dueDate,
  });

  return { success: true, updated: { dueDate }, auditEventId };
}
