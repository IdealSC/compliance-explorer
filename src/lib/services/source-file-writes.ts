/**
 * Source File Metadata Write Service — Server-side persistence for source file metadata.
 *
 * Provides write functions for source file metadata lifecycle management:
 * register, update metadata, change status, verify hash, archive.
 *
 * Each function enforces:
 * 1. Database mode check (no-op in JSON mode)
 * 2. RBAC permission check (throws AuthorizationError if denied)
 * 3. Entity existence validation
 * 4. Whitelisted field update only
 * 5. Audit event creation on success
 *
 * GOVERNANCE: Source file metadata is INTAKE/GOVERNANCE data.
 * No file content is parsed, extracted, or analyzed.
 * File metadata does NOT automatically create or update active reference data.
 *
 * Phase 3.3: Object Storage & Source File Metadata
 */
import { getDb } from '@/db';
import { eq, inArray } from 'drizzle-orm';
import { sourceFiles, sourceRecords } from '@/db/schema';
import { requirePermission, getSessionContext } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import { generateSourceFileId } from './id-generator';
import { getStorageProvider } from '@/config/storage';
import type { SourceFile, SourceFileStatus } from '@/types/sourceRecord';

// ── Result Types ────────────────────────────────────────────────

export interface SourceFileWriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'INVALID_TRANSITION';
  data?: T;
  auditEventId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult<T = Record<string, unknown>>(): SourceFileWriteResult<T> {
  return {
    success: false,
    error: 'Database mode required for persistence. Set DATA_SOURCE=database in environment.',
    code: 'JSON_MODE',
  };
}

function notFoundResult<T = Record<string, unknown>>(entityType: string, id: string): SourceFileWriteResult<T> {
  return {
    success: false,
    error: `${entityType} with id "${id}" not found.`,
    code: 'NOT_FOUND',
  };
}

// ── Status Transition Guard ─────────────────────────────────────

const VALID_TRANSITIONS: Record<SourceFileStatus, SourceFileStatus[]> = {
  registered: ['pending_upload', 'archived'],
  pending_upload: ['uploaded', 'failed', 'archived'],
  uploaded: ['verified', 'quarantined', 'failed', 'archived'],
  verified: ['archived'],
  quarantined: ['archived', 'uploaded'],
  failed: ['registered'],
  archived: [], // terminal
};

function isValidTransition(from: SourceFileStatus, to: SourceFileStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ── Row Mapper ──────────────────────────────────────────────────

function mapDbRowToSourceFile(row: typeof sourceFiles.$inferSelect): SourceFile {
  return {
    id: row.stableReferenceId,
    sourceRecordId: row.sourceRecordId,
    fileName: row.fileName,
    fileDisplayName: row.fileDisplayName,
    mimeType: row.mimeType,
    fileSizeBytes: row.fileSizeBytes,
    fileHash: row.fileHash,
    hashAlgorithm: row.hashAlgorithm,
    storageProvider: row.storageProvider,
    storagePath: row.storagePath,
    uploadStatus: row.uploadStatus as SourceFileStatus,
    uploadedBy: row.uploadedByEmail ?? row.uploadedByName ?? null,
    uploadedByEmail: row.uploadedByEmail,
    uploadedAt: row.uploadedAt?.toISOString() ?? null,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ── 1. Register Source File Metadata ────────────────────────────

export interface RegisterSourceFileInput {
  sourceRecordId: string;
  fileName: string;
  fileDisplayName?: string | null;
  mimeType: string;
  fileSizeBytes: number;
  fileHash?: string | null;
  hashAlgorithm?: string | null;
  storagePath?: string | null;
  storageBucket?: string | null;
  notes?: string | null;
}

export async function registerSourceFile(
  input: RegisterSourceFileInput,
): Promise<SourceFileWriteResult<SourceFile>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_INTAKE);

  const db = getDb();
  const ctx = getSessionContext();

  // Validate parent source record exists
  const [parentRecord] = await db
    .select({ id: sourceRecords.id })
    .from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, input.sourceRecordId))
    .limit(1);

  if (!parentRecord) {
    return notFoundResult('Source record', input.sourceRecordId);
  }

  const stableRefId = generateSourceFileId();
  const storageProvider = getStorageProvider();

  await db.insert(sourceFiles).values({
    stableReferenceId: stableRefId,
    sourceRecordId: parentRecord.id,
    fileName: input.fileName,
    fileDisplayName: input.fileDisplayName ?? null,
    mimeType: input.mimeType,
    fileSizeBytes: input.fileSizeBytes,
    fileHash: input.fileHash ?? null,
    hashAlgorithm: input.hashAlgorithm ?? (input.fileHash ? 'sha256' : null),
    storageProvider,
    storagePath: input.storagePath ?? null,
    storageBucket: input.storageBucket ?? null,
    uploadStatus: 'registered',
    uploadedBy: null,
    uploadedByEmail: ctx.userEmail,
    uploadedByName: ctx.userName,
    notes: input.notes ?? null,
  });

  const auditEventId = await insertAuditEvent({
    entityType: 'source_file',
    entityId: stableRefId,
    action: 'source_file_registered',
    previousValue: null,
    newValue: JSON.stringify({
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      sourceRecordId: input.sourceRecordId,
      storageProvider,
    }),
  });

  // Fetch created record
  const [created] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  return {
    success: true,
    data: mapDbRowToSourceFile(created),
    auditEventId,
  };
}

// ── 2. Update Source File Metadata ──────────────────────────────

export interface UpdateSourceFileMetadataInput {
  fileDisplayName?: string | null;
  notes?: string | null;
}

export async function updateSourceFileMetadata(
  stableRefId: string,
  input: UpdateSourceFileMetadataInput,
): Promise<SourceFileWriteResult<SourceFile>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_INTAKE);

  const db = getDb();

  // Find existing record
  const [existing] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  if (!existing) {
    return notFoundResult('Source file', stableRefId);
  }

  // Build update set — whitelisted fields only
  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  const changedFields: string[] = [];

  if (input.fileDisplayName !== undefined) {
    updates.fileDisplayName = input.fileDisplayName;
    changedFields.push('fileDisplayName');
  }
  if (input.notes !== undefined) {
    updates.notes = input.notes;
    changedFields.push('notes');
  }

  if (changedFields.length === 0) {
    return {
      success: false,
      error: 'No updateable fields provided.',
      code: 'VALIDATION_ERROR',
    };
  }

  await db
    .update(sourceFiles)
    .set(updates)
    .where(eq(sourceFiles.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_file',
    entityId: stableRefId,
    action: 'source_file_metadata_updated',
    previousValue: JSON.stringify(
      changedFields.reduce(
        (acc, f) => ({ ...acc, [f]: (existing as Record<string, unknown>)[f] }),
        {},
      ),
    ),
    newValue: JSON.stringify(
      changedFields.reduce(
        (acc, f) => ({ ...acc, [f]: (input as Record<string, unknown>)[f] }),
        {},
      ),
    ),
  });

  // Fetch updated record
  const [updated] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  return {
    success: true,
    data: mapDbRowToSourceFile(updated),
    auditEventId,
  };
}

// ── 3. Update Source File Status ────────────────────────────────

export async function updateSourceFileStatus(
  stableRefId: string,
  newStatus: SourceFileStatus,
  reason?: string,
): Promise<SourceFileWriteResult<SourceFile>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  const db = getDb();

  // Find existing record
  const [existing] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  if (!existing) {
    return notFoundResult('Source file', stableRefId);
  }

  const currentStatus = existing.uploadStatus as SourceFileStatus;

  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      success: false,
      error: `Invalid status transition: "${currentStatus}" → "${newStatus}". Allowed: ${VALID_TRANSITIONS[currentStatus].join(', ') || 'none (terminal)'}`,
      code: 'INVALID_TRANSITION',
    };
  }

  await db
    .update(sourceFiles)
    .set({
      uploadStatus: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(sourceFiles.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_file',
    entityId: stableRefId,
    action: 'source_file_status_changed',
    previousValue: currentStatus,
    newValue: newStatus,
    reason,
  });

  // Fetch updated record
  const [updated] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  return {
    success: true,
    data: mapDbRowToSourceFile(updated),
    auditEventId,
  };
}

// ── 4. Verify Source File ───────────────────────────────────────

export async function verifySourceFile(
  stableRefId: string,
  fileHash: string,
): Promise<SourceFileWriteResult<SourceFile>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  const db = getDb();

  const [existing] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  if (!existing) {
    return notFoundResult('Source file', stableRefId);
  }

  const currentStatus = existing.uploadStatus as SourceFileStatus;
  if (!isValidTransition(currentStatus, 'verified')) {
    return {
      success: false,
      error: `Cannot verify file in "${currentStatus}" status. File must be in "uploaded" status.`,
      code: 'INVALID_TRANSITION',
    };
  }

  await db
    .update(sourceFiles)
    .set({
      uploadStatus: 'verified',
      fileHash,
      hashAlgorithm: 'sha256',
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(sourceFiles.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_file',
    entityId: stableRefId,
    action: 'source_file_verified',
    previousValue: currentStatus,
    newValue: JSON.stringify({
      status: 'verified',
      fileHash,
      hashAlgorithm: 'sha256',
    }),
  });

  const [updated] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  return {
    success: true,
    data: mapDbRowToSourceFile(updated),
    auditEventId,
  };
}

// ── 5. Archive Source File ──────────────────────────────────────

export async function archiveSourceFile(
  stableRefId: string,
  reason?: string,
): Promise<SourceFileWriteResult<SourceFile>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VALIDATE);

  const db = getDb();

  const [existing] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  if (!existing) {
    return notFoundResult('Source file', stableRefId);
  }

  const currentStatus = existing.uploadStatus as SourceFileStatus;
  if (!isValidTransition(currentStatus, 'archived')) {
    return {
      success: false,
      error: `Cannot archive file in "${currentStatus}" status.`,
      code: 'INVALID_TRANSITION',
    };
  }

  await db
    .update(sourceFiles)
    .set({
      uploadStatus: 'archived',
      updatedAt: new Date(),
    })
    .where(eq(sourceFiles.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'source_file',
    entityId: stableRefId,
    action: 'source_file_archived',
    previousValue: currentStatus,
    newValue: 'archived',
    reason,
  });

  const [updated] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  return {
    success: true,
    data: mapDbRowToSourceFile(updated),
    auditEventId,
  };
}

// ── 6. Read Operations ─────────────────────────────────────────

export async function getSourceFileById(
  stableRefId: string,
): Promise<SourceFileWriteResult<SourceFile>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  const db = getDb();

  const [row] = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, stableRefId))
    .limit(1);

  if (!row) {
    return notFoundResult('Source file', stableRefId);
  }

  return {
    success: true,
    data: mapDbRowToSourceFile(row),
  };
}

export async function getSourceFilesForRecord(
  sourceRecordStableRefId: string,
): Promise<SourceFileWriteResult<SourceFile[]>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  const db = getDb();

  // Find parent source record by stable ref ID
  const [parentRecord] = await db
    .select({ id: sourceRecords.id })
    .from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, sourceRecordStableRefId))
    .limit(1);

  if (!parentRecord) {
    return notFoundResult('Source record', sourceRecordStableRefId);
  }

  const rows = await db
    .select()
    .from(sourceFiles)
    .where(eq(sourceFiles.sourceRecordId, parentRecord.id));

  return {
    success: true,
    data: rows.map(mapDbRowToSourceFile),
  };
}

export async function getSourceFilesFromDb(): Promise<SourceFileWriteResult<SourceFile[]>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  const db = getDb();
  const rows = await db.select().from(sourceFiles);

  return {
    success: true,
    data: rows.map(mapDbRowToSourceFile),
  };
}

// ── 7. Batch Load by Source Record IDs ──────────────────────────

/**
 * Load source files for multiple source records in a single query.
 * Used by the source registry page to populate file counts and drawer data.
 * Returns a Map of sourceRecord stableRefId → SourceFile[].
 *
 * GOVERNANCE: Read-only operation. Does not create or modify data.
 */
export async function getSourceFilesByRecordIds(
  sourceRecordStableRefIds: string[],
): Promise<SourceFileWriteResult<Map<string, SourceFile[]>>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.SOURCE_VIEW);

  if (sourceRecordStableRefIds.length === 0) {
    return { success: true, data: new Map() };
  }

  const db = getDb();

  // Resolve stable ref IDs → DB UUIDs
  const parentRows = await db
    .select({ id: sourceRecords.id, stableRefId: sourceRecords.stableReferenceId })
    .from(sourceRecords)
    .where(inArray(sourceRecords.stableReferenceId, sourceRecordStableRefIds));

  if (parentRows.length === 0) {
    return { success: true, data: new Map() };
  }

  const uuidToStableRef = new Map(parentRows.map(r => [r.id, r.stableRefId]));
  const dbUuids = parentRows.map(r => r.id);

  // Batch-load all files for these source records
  const fileRows = await db
    .select()
    .from(sourceFiles)
    .where(inArray(sourceFiles.sourceRecordId, dbUuids));

  // Group by parent stableRefId
  const result = new Map<string, SourceFile[]>();
  for (const stableRefId of sourceRecordStableRefIds) {
    result.set(stableRefId, []);
  }
  for (const row of fileRows) {
    const parentStableRef = uuidToStableRef.get(row.sourceRecordId);
    if (parentStableRef) {
      const files = result.get(parentStableRef) ?? [];
      files.push(mapDbRowToSourceFile(row));
      result.set(parentStableRef, files);
    }
  }

  return { success: true, data: result };
}

// ── 8. Parent Record Ownership Validation ───────────────────────

/**
 * Validate that a source file belongs to the specified parent source record.
 * Used by API routes for defense-in-depth against cross-record file access.
 *
 * Returns true if the file's parent source record matches the given stableRefId.
 * Returns false (with error info) if mismatched, not found, or JSON mode.
 */
export async function validateFileOwnership(
  fileStableRefId: string,
  parentSourceRecordStableRefId: string,
): Promise<SourceFileWriteResult<boolean>> {
  if (!isDatabaseMode()) return jsonModeResult();

  const db = getDb();

  // Lookup the source record's DB UUID
  const [parentRecord] = await db
    .select({ id: sourceRecords.id })
    .from(sourceRecords)
    .where(eq(sourceRecords.stableReferenceId, parentSourceRecordStableRefId))
    .limit(1);

  if (!parentRecord) {
    return notFoundResult('Source record', parentSourceRecordStableRefId);
  }

  // Lookup the file
  const [fileRow] = await db
    .select({ sourceRecordId: sourceFiles.sourceRecordId })
    .from(sourceFiles)
    .where(eq(sourceFiles.stableReferenceId, fileStableRefId))
    .limit(1);

  if (!fileRow) {
    return notFoundResult('Source file', fileStableRefId);
  }

  if (fileRow.sourceRecordId !== parentRecord.id) {
    return {
      success: false,
      error: 'Source file not found for this source record.',
      code: 'NOT_FOUND',
    };
  }

  return { success: true, data: true };
}

