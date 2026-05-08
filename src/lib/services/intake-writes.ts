/**
 * Source Intake Write Service — Server-side persistence for source intake workflow.
 *
 * Provides write functions for source intake lifecycle management:
 * create, update metadata, change status, assign, mark legal review,
 * reject, close, checklist management, and conversion to source record.
 *
 * Each function enforces:
 * 1. Database mode check (no-op in JSON mode)
 * 2. RBAC permission check (throws AuthorizationError if denied)
 * 3. Entity existence validation
 * 4. Whitelisted field update only
 * 5. Audit event creation on success
 *
 * GOVERNANCE:
 * Intake requests are WORKFLOW DATA only. They track the process of
 * evaluating, triaging, and routing source materials for review.
 * They do NOT automatically create obligations, draft mappings,
 * active reference data, or published records.
 *
 * Phase 3.4: Controlled Source Intake Workflow
 */
import { getDb } from '@/db';
import { eq } from 'drizzle-orm';
import { sourceIntakeRequests, sourceIntakeChecklistItems } from '@/db/schema';
import { requirePermission, getSessionContext, safeUserId } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import { generateSourceIntakeRequestId, generateIntakeChecklistItemId } from './id-generator';
import { createSourceRecord, type CreateSourceInput } from './source-writes';
import type {
  IntakeType,
  IntakeStatus,
  IntakePriority,
  MetadataCompletenessStatus,
  IntakeChecklistItemStatus,
} from '@/types/sourceIntake';

// ── Result Types ────────────────────────────────────────────────

export interface IntakeWriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'INVALID_TRANSITION';
  data?: T;
  auditEventId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult<T = Record<string, unknown>>(): IntakeWriteResult<T> {
  return {
    success: false,
    error: 'Database mode required for persistence. Set DATA_SOURCE=database in environment.',
    code: 'JSON_MODE',
  };
}

function notFoundResult<T = Record<string, unknown>>(entityType: string, id: string): IntakeWriteResult<T> {
  return {
    success: false,
    error: `${entityType} with id "${id}" not found.`,
    code: 'NOT_FOUND',
  };
}

// ── Workflow Transitions ────────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<IntakeStatus, IntakeStatus[]> = {
  submitted: ['triage', 'rejected'],
  triage: ['metadata_review', 'rejected'],
  metadata_review: ['assigned', 'rejected'],
  assigned: ['validation_pending', 'rejected'],
  validation_pending: ['legal_review_required', 'ready_for_source_record', 'rejected'],
  legal_review_required: ['validation_pending'],
  ready_for_source_record: ['converted_to_source_record'],
  converted_to_source_record: ['closed'],
  rejected: ['closed'],
  closed: [],
};

function isValidTransition(from: IntakeStatus, to: IntakeStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// ── Default Checklist Items ─────────────────────────────────────

const DEFAULT_INTAKE_CHECKLIST = [
  { label: 'Source identity captured', desc: 'Confirm source title, type, and document identity.', reqTriage: true, reqSource: true },
  { label: 'Source type selected', desc: 'Confirm the source type classification.', reqTriage: true, reqSource: true },
  { label: 'Jurisdiction captured', desc: 'Confirm jurisdiction and regulatory domain.', reqTriage: true, reqSource: true },
  { label: 'Regulator / issuing authority captured', desc: 'Verify the issuing authority is identified.', reqTriage: true, reqSource: true },
  { label: 'Publication date captured', desc: 'Verify the publication date.', reqTriage: false, reqSource: true },
  { label: 'Effective date captured', desc: 'Confirm effective date and transitional provisions.', reqTriage: false, reqSource: true },
  { label: 'Source URL or file reference captured', desc: 'Confirm the source URL or file reference is accessible.', reqTriage: false, reqSource: true },
  { label: 'Business impact initially assessed', desc: 'Assess initial business impact.', reqTriage: false, reqSource: false },
  { label: 'Legal review need assessed', desc: 'Determine if legal review is required.', reqTriage: true, reqSource: true },
  { label: 'Metadata completeness reviewed', desc: 'Review metadata for completeness.', reqTriage: false, reqSource: true },
  { label: 'Ready to create or link source record', desc: 'Final determination of source record readiness.', reqTriage: false, reqSource: true },
];

// ── 1. Create Source Intake Request ─────────────────────────────

export interface CreateIntakeInput {
  intakeTitle: string;
  intakeType: IntakeType;
  intakeDescription?: string | null;
  priority?: IntakePriority;
  sourceType?: string | null;
  regulator?: string | null;
  jurisdiction?: string | null;
  issuingAuthority?: string | null;
  publicationDate?: string | null;
  effectiveDate?: string | null;
  sourceUrl?: string | null;
  sourceFileName?: string | null;
  sourceReference?: string | null;
  businessFunctionsImpacted?: string | null;
  domainsImpacted?: string | null;
  intakeSummary?: string | null;
  relatedSourceRecordId?: string | null;
  relatedRegulatoryUpdateIds?: string | null;
  relatedDraftChangeIds?: string | null;
}

export async function createSourceIntakeRequest(
  input: CreateIntakeInput,
): Promise<IntakeWriteResult<{ stableReferenceId: string }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_INTAKE);

  const db = getDb();
  const ctx = getSessionContext();
  const stableRefId = generateSourceIntakeRequestId();

  await db.insert(sourceIntakeRequests).values({
    stableReferenceId: stableRefId,
    intakeTitle: input.intakeTitle,
    intakeType: input.intakeType,
    intakeStatus: 'submitted',
    priority: input.priority ?? 'medium',
    intakeDescription: input.intakeDescription ?? null,
    sourceType: input.sourceType ?? null,
    regulator: input.regulator ?? null,
    jurisdiction: input.jurisdiction ?? null,
    issuingAuthority: input.issuingAuthority ?? null,
    publicationDate: input.publicationDate ?? null,
    effectiveDate: input.effectiveDate ?? null,
    sourceUrl: input.sourceUrl ?? null,
    sourceFileName: input.sourceFileName ?? null,
    sourceReference: input.sourceReference ?? null,
    businessFunctionsImpacted: input.businessFunctionsImpacted ?? null,
    domainsImpacted: input.domainsImpacted ?? null,
    intakeSummary: input.intakeSummary ?? null,
    relatedSourceRecordId: input.relatedSourceRecordId ?? null,
    relatedRegulatoryUpdateIds: input.relatedRegulatoryUpdateIds ?? null,
    relatedDraftChangeIds: input.relatedDraftChangeIds ?? null,
    legalReviewRequired: false,
    complianceReviewRequired: false,
    metadataCompletenessStatus: 'not_started',
    submittedByUserId: safeUserId(ctx),
    submittedByEmail: ctx.userEmail ?? null,
    submittedByName: ctx.userName ?? null,
    submittedAt: new Date(),
  });

  // Create default checklist items
  const intakeRecord = await db
    .select()
    .from(sourceIntakeRequests)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableRefId))
    .limit(1);

  if (intakeRecord.length > 0) {
    for (const item of DEFAULT_INTAKE_CHECKLIST) {
      await db.insert(sourceIntakeChecklistItems).values({
        intakeRequestId: intakeRecord[0].id,
        itemLabel: item.label,
        itemDescription: item.desc,
        status: 'not_started',
        requiredForTriage: item.reqTriage,
        requiredForSourceRecordCreation: item.reqSource,
      });
    }
  }

  const auditEventId = await insertAuditEvent({
    entityType: 'source_intake_request',
    entityId: stableRefId,
    action: 'source_intake.created',
    previousValue: null,
    newValue: JSON.stringify({
      intakeTitle: input.intakeTitle,
      intakeType: input.intakeType,
      priority: input.priority ?? 'medium',
    }),
  });

  return { success: true, data: { stableReferenceId: stableRefId }, auditEventId };
}

// ── 2. Update Source Intake Metadata ────────────────────────────

const METADATA_UPDATE_WHITELIST = new Set([
  'intakeTitle',
  'intakeDescription',
  'intakeType',
  'priority',
  'sourceType',
  'regulator',
  'jurisdiction',
  'issuingAuthority',
  'publicationDate',
  'effectiveDate',
  'sourceUrl',
  'sourceFileName',
  'sourceReference',
  'businessFunctionsImpacted',
  'domainsImpacted',
  'intakeSummary',
  'relatedSourceRecordId',
  'relatedSourceFileIds',
  'relatedRegulatoryUpdateIds',
  'relatedDraftChangeIds',
  'triageNotes',
]);

export async function updateSourceIntakeRequest(
  stableReferenceId: string,
  updates: Record<string, unknown>,
): Promise<IntakeWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_INTAKE);

  const db = getDb();
  const existing = await db
    .select()
    .from(sourceIntakeRequests)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId))
    .limit(1);

  if (existing.length === 0) return notFoundResult('Source intake request', stableReferenceId);

  // Filter to whitelisted fields only
  const safeUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (METADATA_UPDATE_WHITELIST.has(key)) {
      safeUpdates[key] = value;
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return { success: false, error: 'No valid fields to update.', code: 'VALIDATION_ERROR' };
  }

  safeUpdates.updatedAt = new Date();

  await db
    .update(sourceIntakeRequests)
    .set(safeUpdates)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_intake_request',
    entityId: stableReferenceId,
    action: 'source_intake.updated',
    previousValue: JSON.stringify(
      Object.fromEntries(Object.keys(safeUpdates).filter(k => k !== 'updatedAt').map(k => [k, (existing[0] as Record<string, unknown>)[k]]))
    ),
    newValue: JSON.stringify(
      Object.fromEntries(Object.keys(safeUpdates).filter(k => k !== 'updatedAt').map(k => [k, safeUpdates[k]]))
    ),
  });

  return { success: true, auditEventId };
}

// ── 3. Update Source Intake Status ──────────────────────────────

export async function updateSourceIntakeStatus(
  stableReferenceId: string,
  newStatus: IntakeStatus,
  reason?: string,
): Promise<IntakeWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  const db = getDb();
  const existing = await db
    .select()
    .from(sourceIntakeRequests)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId))
    .limit(1);

  if (existing.length === 0) return notFoundResult('Source intake request', stableReferenceId);

  const currentStatus = existing[0].intakeStatus as IntakeStatus;

  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      success: false,
      error: `Invalid status transition: ${currentStatus} → ${newStatus}. Allowed: ${ALLOWED_TRANSITIONS[currentStatus].join(', ') || 'none'}.`,
      code: 'INVALID_TRANSITION',
    };
  }

  const ctx = getSessionContext();
  const updateFields: Record<string, unknown> = {
    intakeStatus: newStatus,
    updatedAt: new Date(),
  };

  // Auto-set triage metadata on triage transition
  if (newStatus === 'triage') {
    updateFields.triagedByUserId = safeUserId(ctx);
    updateFields.triagedAt = new Date();
  }

  // Auto-set rejection reason
  if (newStatus === 'rejected' && reason) {
    updateFields.rejectionReason = reason;
  }

  await db
    .update(sourceIntakeRequests)
    .set(updateFields)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_intake_request',
    entityId: stableReferenceId,
    action: newStatus === 'rejected' ? 'source_intake.rejected' : 'source_intake.status_changed',
    previousValue: JSON.stringify({ intakeStatus: currentStatus }),
    newValue: JSON.stringify({ intakeStatus: newStatus }),
    reason: reason ?? undefined,
  });

  return { success: true, auditEventId };
}

// ── 4. Assign Source Intake Request ─────────────────────────────

export async function assignSourceIntakeRequest(
  stableReferenceId: string,
  assignedToEmail: string,
  assignedToName: string,
  assignedToUserId?: string | null,
): Promise<IntakeWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  const db = getDb();
  const existing = await db
    .select()
    .from(sourceIntakeRequests)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId))
    .limit(1);

  if (existing.length === 0) return notFoundResult('Source intake request', stableReferenceId);

  await db
    .update(sourceIntakeRequests)
    .set({
      assignedToUserId: assignedToUserId ?? null,
      assignedToEmail,
      assignedToName,
      updatedAt: new Date(),
    })
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_intake_request',
    entityId: stableReferenceId,
    action: 'source_intake.assigned',
    previousValue: JSON.stringify({
      assignedToEmail: existing[0].assignedToEmail,
      assignedToName: existing[0].assignedToName,
    }),
    newValue: JSON.stringify({ assignedToEmail, assignedToName }),
  });

  return { success: true, auditEventId };
}

// ── 5. Mark Legal Review Required ───────────────────────────────

export async function markIntakeLegalReviewRequired(
  stableReferenceId: string,
  required: boolean,
): Promise<IntakeWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_REVIEW);

  const db = getDb();
  const existing = await db
    .select()
    .from(sourceIntakeRequests)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId))
    .limit(1);

  if (existing.length === 0) return notFoundResult('Source intake request', stableReferenceId);

  await db
    .update(sourceIntakeRequests)
    .set({
      legalReviewRequired: required,
      updatedAt: new Date(),
    })
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_intake_request',
    entityId: stableReferenceId,
    action: 'source_intake.legal_review_required',
    previousValue: JSON.stringify({ legalReviewRequired: existing[0].legalReviewRequired }),
    newValue: JSON.stringify({ legalReviewRequired: required }),
  });

  return { success: true, auditEventId };
}

// ── 6. Get Source Intake Requests ───────────────────────────────

export async function getSourceIntakeRequestsFromDb(): Promise<IntakeWriteResult<{ records: Record<string, unknown>[] }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  const db = getDb();
  const records = await db.select().from(sourceIntakeRequests).orderBy(sourceIntakeRequests.createdAt);

  // Attach checklist items to each record
  const enriched = [];
  for (const record of records) {
    const items = await db
      .select()
      .from(sourceIntakeChecklistItems)
      .where(eq(sourceIntakeChecklistItems.intakeRequestId, record.id));

    enriched.push({
      ...record,
      stableReferenceId: record.stableReferenceId,
      checklistItems: items.map(i => ({
        ...i,
        stableReferenceId: undefined,
      })),
    });
  }

  return { success: true, data: { records: enriched as unknown as Record<string, unknown>[] } };
}

// ── 7. Get Source Intake Request By ID ──────────────────────────

export async function getSourceIntakeRequestById(
  stableReferenceId: string,
): Promise<IntakeWriteResult<{ record: Record<string, unknown> }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  const db = getDb();
  const records = await db
    .select()
    .from(sourceIntakeRequests)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId))
    .limit(1);

  if (records.length === 0) return notFoundResult('Source intake request', stableReferenceId);

  const items = await db
    .select()
    .from(sourceIntakeChecklistItems)
    .where(eq(sourceIntakeChecklistItems.intakeRequestId, records[0].id));

  const record = {
    ...records[0],
    checklistItems: items,
  };

  return { success: true, data: { record: record as unknown as Record<string, unknown> } };
}

// ── 8. Get Source Intake Checklist ──────────────────────────────

export async function getSourceIntakeChecklist(
  stableReferenceId: string,
): Promise<IntakeWriteResult<{ items: Record<string, unknown>[] }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  const db = getDb();
  const intake = await db
    .select()
    .from(sourceIntakeRequests)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId))
    .limit(1);

  if (intake.length === 0) return notFoundResult('Source intake request', stableReferenceId);

  const items = await db
    .select()
    .from(sourceIntakeChecklistItems)
    .where(eq(sourceIntakeChecklistItems.intakeRequestId, intake[0].id));

  return { success: true, data: { items: items as unknown as Record<string, unknown>[] } };
}

// ── 9. Update Source Intake Checklist Item ──────────────────────

const CHECKLIST_UPDATE_WHITELIST = new Set([
  'status',
  'notes',
]);

export async function updateSourceIntakeChecklistItem(
  stableReferenceId: string,
  itemId: string,
  updates: Record<string, unknown>,
): Promise<IntakeWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_INTAKE);

  const db = getDb();

  // Validate parent intake exists
  const intake = await db
    .select()
    .from(sourceIntakeRequests)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId))
    .limit(1);

  if (intake.length === 0) return notFoundResult('Source intake request', stableReferenceId);

  // Find checklist item
  const items = await db
    .select()
    .from(sourceIntakeChecklistItems)
    .where(eq(sourceIntakeChecklistItems.id, itemId))
    .limit(1);

  if (items.length === 0) return notFoundResult('Checklist item', itemId);

  // Validate item belongs to this intake
  if (items[0].intakeRequestId !== intake[0].id) {
    return {
      success: false,
      error: 'Checklist item does not belong to this intake request.',
      code: 'VALIDATION_ERROR',
    };
  }

  // Filter to whitelisted fields
  const safeUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (CHECKLIST_UPDATE_WHITELIST.has(key)) {
      safeUpdates[key] = value;
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return { success: false, error: 'No valid fields to update.', code: 'VALIDATION_ERROR' };
  }

  const ctx = getSessionContext();
  safeUpdates.updatedAt = new Date();

  // Auto-set completion metadata
  if (safeUpdates.status === 'complete') {
    safeUpdates.completedByUserId = safeUserId(ctx);
    safeUpdates.completedByEmail = ctx.userEmail ?? null;
    safeUpdates.completedAt = new Date();
  }

  await db
    .update(sourceIntakeChecklistItems)
    .set(safeUpdates)
    .where(eq(sourceIntakeChecklistItems.id, itemId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_intake_request',
    entityId: stableReferenceId,
    action: 'source_intake.checklist_item_updated',
    previousValue: JSON.stringify({
      itemLabel: items[0].itemLabel,
      status: items[0].status,
    }),
    newValue: JSON.stringify({
      itemLabel: items[0].itemLabel,
      ...Object.fromEntries(Object.keys(safeUpdates).filter(k => k !== 'updatedAt' && k !== 'completedByUserId' && k !== 'completedByEmail' && k !== 'completedAt').map(k => [k, safeUpdates[k]])),
    }),
  });

  return { success: true, auditEventId };
}

// ── 10. Validate Intake Ready For Source Record ─────────────────

export function validateIntakeReadyForSourceRecord(
  intake: Record<string, unknown>,
  checklistItems: Record<string, unknown>[],
): { ready: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (intake.intakeStatus !== 'ready_for_source_record') {
    reasons.push(`Intake status must be 'ready_for_source_record', currently: ${String(intake.intakeStatus)}`);
  }

  if (!intake.intakeTitle) reasons.push('Missing intake title');
  if (!intake.intakeType) reasons.push('Missing intake type');

  // Check required-for-source-record checklist items
  const requiredItems = checklistItems.filter(i => i.requiredForSourceRecordCreation);
  const incompleteRequired = requiredItems.filter(i => i.status !== 'complete' && i.status !== 'not_applicable');

  if (incompleteRequired.length > 0) {
    reasons.push(`${incompleteRequired.length} required checklist item(s) not complete: ${incompleteRequired.map(i => String(i.itemLabel)).join(', ')}`);
  }

  return { ready: reasons.length === 0, reasons };
}

// ── 11. Convert Intake to Source Record ─────────────────────────

export async function convertIntakeToSourceRecord(
  stableReferenceId: string,
): Promise<IntakeWriteResult<{ sourceRecordId: string }>> {
  if (!isDatabaseMode()) return jsonModeResult();

  // Requires both source.validate AND source.intake
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  const db = getDb();
  const existing = await db
    .select()
    .from(sourceIntakeRequests)
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId))
    .limit(1);

  if (existing.length === 0) return notFoundResult('Source intake request', stableReferenceId);

  const intake = existing[0];

  if (intake.intakeStatus !== 'ready_for_source_record') {
    return {
      success: false,
      error: `Intake must be in 'ready_for_source_record' status to convert. Current status: ${intake.intakeStatus}`,
      code: 'INVALID_TRANSITION',
    };
  }

  // Validate checklist
  const items = await db
    .select()
    .from(sourceIntakeChecklistItems)
    .where(eq(sourceIntakeChecklistItems.intakeRequestId, intake.id));

  const validation = validateIntakeReadyForSourceRecord(
    intake as unknown as Record<string, unknown>,
    items as unknown as Record<string, unknown>[],
  );

  if (!validation.ready) {
    return {
      success: false,
      error: `Intake not ready for conversion: ${validation.reasons.join('; ')}`,
      code: 'VALIDATION_ERROR',
    };
  }

  // Map intake type to source type
  const sourceTypeMap: Record<string, string> = {
    new_source: 'regulation',
    updated_source: 'regulation',
    new_guidance: 'guidance',
    updated_guidance: 'guidance',
    standard_update: 'standard',
    regulator_notice: 'regulator_notice',
    internal_note: 'internal_note',
    source_file_metadata: 'internal_note',
    other: 'internal_note',
  };

  const createInput: CreateSourceInput = {
    sourceTitle: intake.intakeTitle,
    sourceType: (intake.sourceType ?? sourceTypeMap[intake.intakeType] ?? 'internal_note') as CreateSourceInput['sourceType'],
    regulator: intake.regulator,
    jurisdiction: intake.jurisdiction,
    issuingAuthority: intake.issuingAuthority,
    publicationDate: intake.publicationDate,
    effectiveDate: intake.effectiveDate,
    sourceUrl: intake.sourceUrl,
    sourceFileName: intake.sourceFileName,
    sourceReference: intake.sourceReference,
    legalReviewRequired: intake.legalReviewRequired,
    summary: intake.intakeSummary,
  };

  // Create source record via existing service (reuses RBAC + audit)
  const sourceResult = await createSourceRecord(createInput);

  if (!sourceResult.success) {
    return {
      success: false,
      error: `Failed to create source record: ${sourceResult.error}`,
      code: 'VALIDATION_ERROR',
    };
  }

  // Update intake status to converted
  await db
    .update(sourceIntakeRequests)
    .set({
      intakeStatus: 'converted_to_source_record',
      relatedSourceRecordId: sourceResult.data?.stableReferenceId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(sourceIntakeRequests.stableReferenceId, stableReferenceId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_intake_request',
    entityId: stableReferenceId,
    action: 'source_intake.converted_to_source_record',
    previousValue: JSON.stringify({ intakeStatus: 'ready_for_source_record' }),
    newValue: JSON.stringify({
      intakeStatus: 'converted_to_source_record',
      sourceRecordId: sourceResult.data?.stableReferenceId,
    }),
  });

  return {
    success: true,
    data: { sourceRecordId: sourceResult.data?.stableReferenceId ?? '' },
    auditEventId,
  };
}
