/**
 * Source Registry Write Service — Server-side persistence for source records.
 *
 * Provides write functions for source record lifecycle management:
 * create, update metadata, change status, validate, reject, and
 * checklist item management.
 *
 * Each function enforces:
 * 1. Database mode check (no-op in JSON mode)
 * 2. RBAC permission check (throws AuthorizationError if denied)
 * 3. Entity existence validation
 * 4. Whitelisted field update only
 * 5. Audit event creation on success
 *
 * GOVERNANCE: Source records are INTAKE/GOVERNANCE data.
 * They do NOT automatically create or update active regulatory reference data.
 * Materials must pass through the controlled publishing workflow.
 */
import { getDb } from '@/db';
import { eq } from 'drizzle-orm';
import { sourceRecords, sourceValidationChecklists } from '@/db/schema';
import { requirePermission, getSessionContext, safeUserId } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import { generateSourceRecordId } from './id-generator';
import type {
  SourceType,
  SourceStatus,
  ValidationStatus,
  ChecklistItemStatus,
  SourceRecord,
  SourceValidationChecklistItem,
} from '@/types/sourceRecord';

// ── Result Types ────────────────────────────────────────────────

export interface SourceWriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR';
  data?: T;
  auditEventId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult<T = Record<string, unknown>>(): SourceWriteResult<T> {
  return {
    success: false,
    error: 'Database mode required for persistence. Set DATA_SOURCE=database in environment.',
    code: 'JSON_MODE',
  };
}

function notFoundResult<T = Record<string, unknown>>(entityType: string, id: string): SourceWriteResult<T> {
  return {
    success: false,
    error: `${entityType} with id "${id}" not found.`,
    code: 'NOT_FOUND',
  };
}

function toJsonText(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return JSON.stringify(val);
  return String(val);
}

/** Default checklist items created on source intake */
const DEFAULT_CHECKLIST_ITEMS = [
  { label: 'Source identity verified', desc: 'Confirm the source title, type, and document identity match the registered entry.' },
  { label: 'Issuing authority confirmed', desc: 'Verify the issuing authority is correctly identified and authoritative.' },
  { label: 'Jurisdiction applicability confirmed', desc: 'Confirm the jurisdiction and regulatory domain are applicable to our operations.' },
  { label: 'Publication date verified', desc: 'Verify the publication date against the official source.' },
  { label: 'Effective date confirmed', desc: 'Confirm the effective date and any transitional provisions.' },
  { label: 'Version/revision verified', desc: 'Verify the version or revision number matches the current authoritative version.' },
  { label: 'Source URL/reference accessible', desc: 'Confirm the source URL or file reference is accessible and retrievable.' },
  { label: 'Content completeness reviewed', desc: 'Review the source content for completeness and identify any gaps.' },
  { label: 'Legal/regulatory scope assessed', desc: 'Assess whether legal review is required based on regulatory scope and impact.' },
];

// ── 1. Create Source Record ─────────────────────────────────────

export interface CreateSourceInput {
  sourceTitle: string;
  sourceType: SourceType;
  regulator?: string | null;
  jurisdiction?: string | null;
  issuingAuthority?: string | null;
  publicationDate?: string | null;
  effectiveDate?: string | null;
  sourceUrl?: string | null;
  sourceFileName?: string | null;
  sourceVersion?: string | null;
  summary?: string | null;
  sourceReference?: string | null;
  legalReviewRequired?: boolean;
}

export async function createSourceRecord(
  input: CreateSourceInput,
): Promise<SourceWriteResult<{ stableReferenceId: string }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_INTAKE);

  const db = getDb();
  const stableRefId = generateSourceRecordId();

  // Insert source record with whitelisted fields only
  await db.insert(sourceRecords).values({
    stableReferenceId: stableRefId,
    sourceTitle: input.sourceTitle,
    sourceType: input.sourceType,
    sourceStatus: 'intake',
    validationStatus: 'not_started',
    regulator: input.regulator ?? null,
    jurisdiction: input.jurisdiction ?? null,
    issuingAuthority: input.issuingAuthority ?? null,
    publicationDate: input.publicationDate ?? null,
    effectiveDate: input.effectiveDate ?? null,
    sourceUrl: input.sourceUrl ?? null,
    sourceFileName: input.sourceFileName ?? null,
    sourceVersion: input.sourceVersion ?? null,
    summary: input.summary ?? null,
    sourceReference: input.sourceReference ?? null,
    legalReviewRequired: input.legalReviewRequired ?? false,
  });

  // Create default checklist items
  for (const item of DEFAULT_CHECKLIST_ITEMS) {
    await db.insert(sourceValidationChecklists).values({
      sourceRecordId: (
        await db.select({ id: sourceRecords.id }).from(sourceRecords)
          .where(eq(sourceRecords.stableReferenceId, stableRefId))
      )[0].id,
      itemLabel: item.label,
      itemDescription: item.desc,
      status: 'not_started',
      requiredForValidation: true,
    });
  }

  const auditEventId = await insertAuditEvent({
    entityType: 'source_record',
    entityId: stableRefId,
    action: 'source_record_created',
    previousValue: null,
    newValue: JSON.stringify({ sourceTitle: input.sourceTitle, sourceType: input.sourceType }),
    sourceReference: input.sourceReference ?? null,
  });

  return { success: true, data: { stableReferenceId: stableRefId }, auditEventId };
}

// ── 2. Update Source Metadata ───────────────────────────────────

export interface UpdateSourceMetadataInput {
  sourceTitle?: string;
  regulator?: string | null;
  jurisdiction?: string | null;
  issuingAuthority?: string | null;
  publicationDate?: string | null;
  effectiveDate?: string | null;
  lastRetrievedDate?: string | null;
  sourceUrl?: string | null;
  sourceFileName?: string | null;
  sourceVersion?: string | null;
  summary?: string | null;
  keyChanges?: string | null;
  knownLimitations?: string | null;
  sourceReference?: string | null;
  notes?: string | null;
}

export async function updateSourceRecordMetadata(
  stableRefId: string,
  input: UpdateSourceMetadataInput,
): Promise<SourceWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_INTAKE);

  const db = getDb();
  const [existing] = await db
    .select({ sourceTitle: sourceRecords.sourceTitle, sourceStatus: sourceRecords.sourceStatus })
    .from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('SourceRecord', stableRefId);

  // Whitelisted fields only — never sourceType or status fields
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.sourceTitle !== undefined) updates.sourceTitle = input.sourceTitle;
  if (input.regulator !== undefined) updates.regulator = input.regulator;
  if (input.jurisdiction !== undefined) updates.jurisdiction = input.jurisdiction;
  if (input.issuingAuthority !== undefined) updates.issuingAuthority = input.issuingAuthority;
  if (input.publicationDate !== undefined) updates.publicationDate = input.publicationDate;
  if (input.effectiveDate !== undefined) updates.effectiveDate = input.effectiveDate;
  if (input.lastRetrievedDate !== undefined) updates.lastRetrievedDate = input.lastRetrievedDate;
  if (input.sourceUrl !== undefined) updates.sourceUrl = input.sourceUrl;
  if (input.sourceFileName !== undefined) updates.sourceFileName = input.sourceFileName;
  if (input.sourceVersion !== undefined) updates.sourceVersion = input.sourceVersion;
  if (input.summary !== undefined) updates.summary = input.summary;
  if (input.keyChanges !== undefined) updates.keyChanges = input.keyChanges;
  if (input.knownLimitations !== undefined) updates.knownLimitations = input.knownLimitations;
  if (input.sourceReference !== undefined) updates.sourceReference = input.sourceReference;
  if (input.notes !== undefined) updates.notes = input.notes;

  await db.update(sourceRecords).set(updates).where(eq(sourceRecords.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_record',
    entityId: stableRefId,
    action: 'source_record_metadata_updated',
    previousValue: JSON.stringify({ sourceTitle: existing.sourceTitle }),
    newValue: JSON.stringify(updates),
  });

  return { success: true, data: updates, auditEventId };
}

// ── 3. Update Source Status ─────────────────────────────────────

const ALLOWED_STATUS_TRANSITIONS: Record<string, SourceStatus[]> = {
  intake: ['metadata_review', 'rejected'],
  metadata_review: ['validation_pending', 'intake', 'rejected'],
  validation_pending: ['validated', 'metadata_review', 'rejected'],
  validated: ['staged', 'active'],
  staged: ['active', 'validated'],
  active: ['superseded', 'archived'],
  superseded: ['archived'],
  archived: [],
  rejected: ['intake'],
};

export async function updateSourceStatus(
  stableRefId: string,
  newStatus: SourceStatus,
  reason?: string,
): Promise<SourceWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  const db = getDb();
  const [existing] = await db
    .select({ sourceStatus: sourceRecords.sourceStatus })
    .from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('SourceRecord', stableRefId);

  const allowed = ALLOWED_STATUS_TRANSITIONS[existing.sourceStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition from "${existing.sourceStatus}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`,
      code: 'VALIDATION_ERROR',
    };
  }

  await db.update(sourceRecords)
    .set({ sourceStatus: newStatus, updatedAt: new Date() })
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_record',
    entityId: stableRefId,
    action: 'source_record_status_changed',
    previousValue: existing.sourceStatus,
    newValue: newStatus,
    reason,
  });

  return { success: true, data: { sourceStatus: newStatus }, auditEventId };
}

// ── 4. Update Validation Status ─────────────────────────────────

/**
 * C2 FIX: Validation status transition guard.
 * Prevents arbitrary transitions — e.g., skipping directly to 'validated'
 * (which must go through markSourceValidated with checklist check).
 */
const ALLOWED_VALIDATION_TRANSITIONS: Record<string, string[]> = {
  not_started: ['incomplete_metadata', 'source_verified'],
  incomplete_metadata: ['not_started', 'source_verified'],
  source_verified: ['citation_review_needed', 'legal_review_needed'],
  citation_review_needed: ['source_verified', 'legal_review_needed'],
  legal_review_needed: ['citation_review_needed', 'source_verified'],
  // 'validated' can only be set via markSourceValidated() which checks checklist
  validated: ['rejected'],
  rejected: ['not_started'],
};

export async function updateSourceValidationStatus(
  stableRefId: string,
  newStatus: ValidationStatus,
  reason?: string,
): Promise<SourceWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  // C2 FIX: Block direct transition to 'validated' — must use markSourceValidated()
  if (newStatus === 'validated') {
    return {
      success: false,
      error: 'Cannot set validation status to "validated" directly. Use the Validate action, which checks checklist completeness.',
      code: 'VALIDATION_ERROR',
    };
  }

  const db = getDb();
  const [existing] = await db
    .select({ validationStatus: sourceRecords.validationStatus })
    .from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('SourceRecord', stableRefId);

  // C2 FIX: Enforce allowed transition
  const allowed = ALLOWED_VALIDATION_TRANSITIONS[existing.validationStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition validation status from "${existing.validationStatus}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`,
      code: 'VALIDATION_ERROR',
    };
  }

  await db.update(sourceRecords)
    .set({ validationStatus: newStatus, updatedAt: new Date() })
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_record',
    entityId: stableRefId,
    action: 'source_record_validation_status_changed',
    previousValue: existing.validationStatus,
    newValue: newStatus,
    reason,
  });

  return { success: true, data: { validationStatus: newStatus }, auditEventId };
}

// ── 5. Update Checklist Item ────────────────────────────────────

export async function updateChecklistItem(
  itemId: string,
  status: ChecklistItemStatus,
  notes?: string | null,
): Promise<SourceWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  const db = getDb();
  const [existing] = await db
    .select({
      id: sourceValidationChecklists.id,
      status: sourceValidationChecklists.status,
      itemLabel: sourceValidationChecklists.itemLabel,
      sourceRecordId: sourceValidationChecklists.sourceRecordId,
    })
    .from(sourceValidationChecklists)
    .where(eq(sourceValidationChecklists.id, itemId));

  if (!existing) return notFoundResult('ChecklistItem', itemId);

  // C1 FIX: Capture reviewedBy for checklist traceability
  const ctx = getSessionContext();
  const updates: Record<string, unknown> = {
    status,
    reviewedAt: new Date(),
    reviewedBy: safeUserId(ctx),
  };
  if (notes !== undefined) updates.notes = notes;

  await db.update(sourceValidationChecklists)
    .set(updates)
    .where(eq(sourceValidationChecklists.id, itemId));

  // Find the stableReferenceId for the parent source record
  const [parent] = await db
    .select({ stableReferenceId: sourceRecords.stableReferenceId })
    .from(sourceRecords)
    .where(eq(sourceRecords.id, existing.sourceRecordId));

  const parentRefId = parent?.stableReferenceId ?? 'unknown';

  const auditEventId = await insertAuditEvent({
    entityType: 'source_checklist',
    entityId: parentRefId,
    action: 'source_checklist_item_updated',
    previousValue: JSON.stringify({ item: existing.itemLabel, status: existing.status }),
    newValue: JSON.stringify({ item: existing.itemLabel, status }),
  });

  return { success: true, data: { status }, auditEventId };
}

// ── 6. Mark Legal Review Required ───────────────────────────────

export async function markSourceLegalReviewRequired(
  stableRefId: string,
  reason?: string,
): Promise<SourceWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_REVIEW);

  const db = getDb();
  const [existing] = await db
    .select({ legalReviewRequired: sourceRecords.legalReviewRequired })
    .from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('SourceRecord', stableRefId);

  await db.update(sourceRecords)
    .set({
      legalReviewRequired: true,
      validationStatus: 'legal_review_needed',
      updatedAt: new Date(),
    })
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_record',
    entityId: stableRefId,
    action: 'source_record_legal_review_required',
    previousValue: String(existing.legalReviewRequired),
    newValue: 'true',
    reason,
  });

  return { success: true, data: { legalReviewRequired: true }, auditEventId };
}

// ── 7. Mark Source Validated ────────────────────────────────────

export async function markSourceValidated(
  stableRefId: string,
): Promise<SourceWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  const db = getDb();

  // Get source record UUID
  const [source] = await db
    .select({ id: sourceRecords.id, sourceStatus: sourceRecords.sourceStatus })
    .from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  if (!source) return notFoundResult('SourceRecord', stableRefId);

  // C4 FIX: Prevent markSourceValidated from regressing active/superseded/archived records
  const validatableStatuses = ['intake', 'metadata_review', 'validation_pending'];
  if (!validatableStatuses.includes(source.sourceStatus)) {
    return {
      success: false,
      error: `Cannot validate source in "${source.sourceStatus}" state. Only records in intake, metadata_review, or validation_pending states can be validated.`,
      code: 'VALIDATION_ERROR',
    };
  }

  // Check all required checklist items are complete
  const checklistItems = await db
    .select()
    .from(sourceValidationChecklists)
    .where(eq(sourceValidationChecklists.sourceRecordId, source.id));

  const requiredIncomplete = checklistItems.filter(
    (c) => c.requiredForValidation && c.status !== 'complete' && c.status !== 'not_applicable',
  );

  if (requiredIncomplete.length > 0) {
    return {
      success: false,
      error: `Cannot validate: ${requiredIncomplete.length} required checklist item(s) incomplete: ${requiredIncomplete.map((c) => c.itemLabel).join(', ')}`,
      code: 'VALIDATION_ERROR',
    };
  }

  await db.update(sourceRecords)
    .set({
      sourceStatus: 'validated',
      validationStatus: 'validated',
      updatedAt: new Date(),
      approvedAt: new Date(),
    })
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_record',
    entityId: stableRefId,
    action: 'source_record_validated',
    previousValue: source.sourceStatus,
    newValue: 'validated',
  });

  return { success: true, data: { sourceStatus: 'validated', validationStatus: 'validated' }, auditEventId };
}

// ── 8. Reject Source Record ─────────────────────────────────────

export async function rejectSourceRecord(
  stableRefId: string,
  reason: string,
): Promise<SourceWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  if (!reason || reason.trim().length === 0) {
    return { success: false, error: 'Reason is required for rejection.', code: 'VALIDATION_ERROR' };
  }

  const db = getDb();
  const [existing] = await db
    .select({ sourceStatus: sourceRecords.sourceStatus, notes: sourceRecords.notes })
    .from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('SourceRecord', stableRefId);

  // C3 FIX: Preserve existing notes instead of overwriting
  const rejectionNote = `[Rejected ${new Date().toISOString()}]: ${reason}`;
  const updatedNotes = existing.notes
    ? `${existing.notes}\n\n${rejectionNote}`
    : rejectionNote;

  await db.update(sourceRecords)
    .set({
      sourceStatus: 'rejected',
      validationStatus: 'rejected',
      updatedAt: new Date(),
      notes: updatedNotes,
    })
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_record',
    entityId: stableRefId,
    action: 'source_record_rejected',
    previousValue: existing.sourceStatus,
    newValue: 'rejected',
    reason,
  });

  return { success: true, data: { sourceStatus: 'rejected' }, auditEventId };
}

// ── 9. Get Source Record By ID (DB mode) ────────────────────────

export async function getSourceRecordById(
  stableRefId: string,
): Promise<SourceWriteResult<SourceRecord>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  const db = getDb();
  const [row] = await db.select().from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  if (!row) return notFoundResult('SourceRecord', stableRefId);

  const checklistRows = await db.select().from(sourceValidationChecklists)
    .where(eq(sourceValidationChecklists.sourceRecordId, row.id));

  const record = mapDbRowToSourceRecord(row, checklistRows);
  return { success: true, data: record };
}

// ── 10. Get All Source Records (DB mode) ────────────────────────

export async function getSourceRecordsFromDb(): Promise<SourceWriteResult<SourceRecord[]>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  const db = getDb();
  const rows = await db.select().from(sourceRecords);

  // Fetch all checklists in one query for efficiency
  const allChecklists = await db.select().from(sourceValidationChecklists);
  const checklistMap = new Map<string, typeof allChecklists>();
  for (const cl of allChecklists) {
    const arr = checklistMap.get(cl.sourceRecordId) ?? [];
    arr.push(cl);
    checklistMap.set(cl.sourceRecordId, arr);
  }

  const records = rows.map((row) =>
    mapDbRowToSourceRecord(row, checklistMap.get(row.id) ?? []),
  );

  return { success: true, data: records };
}

// ── 11. Get Validation Checklist ────────────────────────────────

export async function getSourceValidationChecklist(
  stableRefId: string,
): Promise<SourceWriteResult<SourceValidationChecklistItem[]>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  const db = getDb();
  const [source] = await db.select({ id: sourceRecords.id }).from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, stableRefId));

  if (!source) return notFoundResult('SourceRecord', stableRefId);

  const items = await db.select().from(sourceValidationChecklists)
    .where(eq(sourceValidationChecklists.sourceRecordId, source.id));

  const mapped: SourceValidationChecklistItem[] = items.map((i) => ({
    id: i.id,
    sourceRecordId: i.sourceRecordId,
    itemLabel: i.itemLabel,
    itemDescription: i.itemDescription,
    status: i.status as ChecklistItemStatus,
    requiredForValidation: i.requiredForValidation,
    reviewedBy: null, // TODO: resolve user name from reviewedBy UUID
    reviewedAt: i.reviewedAt?.toISOString() ?? null,
    notes: i.notes,
  }));

  return { success: true, data: mapped };
}

// ── 12. Validate Source Ready For Publishing ────────────────────

export interface SourceReadinessCheck {
  check: string;
  passed: boolean;
  detail: string;
}

export async function validateSourceReadyForPublishing(
  sourceRefId: string,
): Promise<{ ready: boolean; checks: SourceReadinessCheck[] }> {
  const checks: SourceReadinessCheck[] = [];

  if (!isDatabaseMode()) {
    checks.push({ check: 'database_mode', passed: false, detail: 'Source validation requires database mode' });
    return { ready: false, checks };
  }

  const db = getDb();
  const [source] = await db.select().from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, sourceRefId));

  if (!source) {
    checks.push({ check: 'source_exists', passed: false, detail: `No source record found for "${sourceRefId}"` });
    return { ready: false, checks };
  }

  checks.push({ check: 'source_exists', passed: true, detail: `Source: ${source.sourceTitle}` });

  // Validation status
  const isValidated = source.validationStatus === 'validated';
  checks.push({
    check: 'validation_status',
    passed: isValidated,
    detail: isValidated ? 'Source is validated' : `Validation status: ${source.validationStatus}`,
  });

  // Source status
  const statusOk = ['validated', 'staged', 'active'].includes(source.sourceStatus);
  checks.push({
    check: 'source_status',
    passed: statusOk,
    detail: statusOk ? `Source status: ${source.sourceStatus}` : `Source status "${source.sourceStatus}" is not ready for publishing`,
  });

  // Legal review
  if (source.legalReviewRequired) {
    const legalOk = source.validationStatus !== 'legal_review_needed';
    checks.push({
      check: 'legal_review_complete',
      passed: legalOk,
      detail: legalOk ? 'Legal review completed' : 'Legal review is still required',
    });
  } else {
    checks.push({ check: 'legal_review_complete', passed: true, detail: 'Legal review not required' });
  }

  // Checklist completeness
  const clItems = await db.select().from(sourceValidationChecklists)
    .where(eq(sourceValidationChecklists.sourceRecordId, source.id));

  const requiredIncomplete = clItems.filter(
    (c) => c.requiredForValidation && c.status !== 'complete' && c.status !== 'not_applicable',
  );
  const clOk = requiredIncomplete.length === 0;
  checks.push({
    check: 'checklist_complete',
    passed: clOk,
    detail: clOk
      ? `All ${clItems.filter((c) => c.requiredForValidation).length} required items complete`
      : `${requiredIncomplete.length} required checklist item(s) incomplete`,
  });

  const ready = checks.every((c) => c.passed);
  return { ready, checks };
}

// ── DB Row → SourceRecord Mapper ────────────────────────────────

function parseJsonArray(val: string | null): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRowToSourceRecord(row: any, checklists: any[]): SourceRecord {
  return {
    id: row.stableReferenceId,
    sourceTitle: row.sourceTitle,
    sourceType: row.sourceType as SourceType,
    regulator: row.regulator,
    jurisdiction: row.jurisdiction,
    issuingAuthority: row.issuingAuthority,
    publicationDate: row.publicationDate,
    effectiveDate: row.effectiveDate,
    lastRetrievedDate: row.lastRetrievedDate,
    sourceUrl: row.sourceUrl,
    sourceFileName: row.sourceFileName,
    sourceVersion: row.sourceVersion,
    sourceStatus: row.sourceStatus as SourceStatus,
    validationStatus: row.validationStatus as ValidationStatus,
    confidenceLevel: row.confidenceLevel,
    owner: null,
    reviewer: null,
    approver: null,
    legalReviewRequired: row.legalReviewRequired,
    relatedObligationIds: parseJsonArray(row.relatedObligationIds),
    relatedRegulatoryUpdateIds: parseJsonArray(row.relatedRegulatoryUpdateIds),
    relatedDraftChangeIds: parseJsonArray(row.relatedDraftChangeIds),
    relatedCrosswalkIds: parseJsonArray(row.relatedCrosswalkIds),
    relatedControlIds: parseJsonArray(row.relatedControlIds),
    relatedEvidenceIds: parseJsonArray(row.relatedEvidenceIds),
    relatedReportIds: parseJsonArray(row.relatedReportIds),
    summary: row.summary,
    keyChanges: row.keyChanges,
    knownLimitations: row.knownLimitations,
    missingMetadata: parseJsonArray(row.missingMetadata),
    sourceReference: row.sourceReference,
    validationChecklist: checklists.map((c) => ({
      id: c.id,
      sourceRecordId: c.sourceRecordId,
      itemLabel: c.itemLabel,
      itemDescription: c.itemDescription,
      status: c.status as ChecklistItemStatus,
      requiredForValidation: c.requiredForValidation,
      reviewedBy: null,
      reviewedAt: c.reviewedAt?.toISOString() ?? null,
      notes: c.notes,
    })),
    sourceFiles: [], // Phase 3.3: populated separately via source-file-writes
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    notes: row.notes,
  };
}
