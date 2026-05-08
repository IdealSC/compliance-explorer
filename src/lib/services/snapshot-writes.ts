/**
 * Report Snapshot Write Service — Server-side persistence for report snapshots.
 *
 * Provides write and read functions for report snapshot lifecycle:
 * create snapshot, list snapshots, get by ID, create export audit events.
 *
 * Each write function enforces:
 * 1. Database mode check (no-op in JSON mode)
 * 2. RBAC permission check (throws AuthorizationError if denied)
 * 3. Immutability guard (append-only — no UPDATE or DELETE)
 * 4. SHA-256 checksum generation
 * 5. Audit event creation on success
 *
 * GOVERNANCE: Report snapshots are OUTPUT records only.
 * They do NOT create, modify, approve, publish, supersede, or archive
 * active regulatory reference data, operational data, source records,
 * draft changes, or version history.
 */
import { createHash } from 'crypto';
import { getDb } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { reportSnapshots } from '@/db/schema';
import { requirePermission, getSessionContext, safeUserId } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import { assertAppendOnly } from './immutability-guard';
import { generateSnapshotId } from './id-generator';

// ── Result Types ────────────────────────────────────────────────

export interface SnapshotWriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR';
  data?: T;
  auditEventId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult<T = Record<string, unknown>>(): SnapshotWriteResult<T> {
  return {
    success: false,
    error: 'Persistent report snapshots require database mode. Set DATA_SOURCE=database in environment.',
    code: 'JSON_MODE',
  };
}

const GOVERNANCE_DISCLAIMER =
  'This report is generated from sample/demonstration data. Not validated for regulatory decisions. Not legal advice. Not a validated GxP system.';

const SAMPLE_DATA_DISCLAIMER =
  'This export contains demonstration data only. Not validated for regulatory, legal, or compliance decisions.';

// ── Checksum ────────────────────────────────────────────────────

/**
 * Compute a SHA-256 checksum for a report snapshot payload.
 * Covers core immutable fields for tamper detection.
 */
export function computeSnapshotChecksum(payload: {
  reportDefinitionId: string;
  reportName: string;
  exportFormat: string;
  generatedBy: string;
  generatedAt: string;
  recordCount: number;
  filtersApplied: string;
}): string {
  const canonical = [
    payload.reportDefinitionId,
    payload.reportName,
    payload.exportFormat,
    payload.generatedBy,
    payload.generatedAt,
    String(payload.recordCount),
    payload.filtersApplied,
  ].join('|');

  return createHash('sha256').update(canonical).digest('hex');
}

// ── Metadata Builder ────────────────────────────────────────────

export interface SnapshotMetadataInput {
  reportDefinitionId: string;
  reportName: string;
  reportType: string;
  dataScope: string;
  sourceDatasets: string[];
  filtersApplied: Record<string, string>;
  recordCount: number;
  exportFormat: 'csv' | 'json' | 'print' | 'preview';
}

export function buildReportSnapshotMetadata(input: SnapshotMetadataInput) {
  const ctx = getSessionContext();
  const generatedAt = new Date().toISOString();

  const checksum = computeSnapshotChecksum({
    reportDefinitionId: input.reportDefinitionId,
    reportName: input.reportName,
    exportFormat: input.exportFormat,
    generatedBy: ctx.userName ?? ctx.userEmail ?? 'unknown',
    generatedAt,
    recordCount: input.recordCount,
    filtersApplied: JSON.stringify(input.filtersApplied),
  });

  return {
    stableReferenceId: generateSnapshotId(),
    reportDefinitionId: input.reportDefinitionId,
    reportName: input.reportName,
    reportType: input.reportType,
    generatedBy: ctx.userName ?? ctx.userEmail ?? 'unknown',
    generatedByUserId: safeUserId(ctx),
    generatedByEmail: ctx.userEmail,
    generatedByName: ctx.userName,
    generatedByRoles: ctx.roles.length > 0 ? JSON.stringify(ctx.roles) : null,
    generatedAt: new Date(generatedAt),
    dataScope: input.dataScope,
    filtersApplied: input.filtersApplied,
    sourceDatasets: input.sourceDatasets,
    includesSampleData: true,
    recordCount: input.recordCount,
    exportFormat: input.exportFormat,
    snapshotStatus: 'exported' as const,
    governanceDisclaimer: GOVERNANCE_DISCLAIMER,
    sampleDataDisclaimer: SAMPLE_DATA_DISCLAIMER,
    checksum,
    checksumAlgorithm: 'sha256',
  };
}

// ── Permission Check ────────────────────────────────────────────

/**
 * Validate report export permissions server-side.
 * Returns { allowed, reason } without throwing.
 */
export function validateReportExportPermission(): { allowed: boolean; reason?: string } {
  try {
    requirePermission(PERMISSIONS.REPORTS_EXPORT);
    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'User does not have reports.export permission.' };
  }
}

// ── 1. Create Report Snapshot ───────────────────────────────────

export async function createReportSnapshot(
  input: SnapshotMetadataInput,
): Promise<SnapshotWriteResult<{ snapshotId: string; checksum: string }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REPORTS_EXPORT);

  // Enforce append-only constraint
  assertAppendOnly('report_snapshots', 'INSERT');

  const metadata = buildReportSnapshotMetadata(input);
  const db = getDb();

  // Determine audit action based on export format
  const auditAction = getExportAuditAction(metadata.exportFormat);

  // B1 FIX: Write audit event FIRST to get its ID, then INSERT the snapshot
  // with the audit event ID already set. This avoids any UPDATE on the
  // immutable report_snapshots table.
  const auditEventId = await insertAuditEvent({
    entityType: 'report_snapshot',
    entityId: metadata.stableReferenceId,
    action: auditAction,
    previousValue: null,
    newValue: JSON.stringify({
      reportId: metadata.reportDefinitionId,
      format: metadata.exportFormat,
      recordCount: metadata.recordCount,
      checksum: metadata.checksum,
    }),
    sourceReference: metadata.stableReferenceId,
  });

  await db.insert(reportSnapshots).values({
    stableReferenceId: metadata.stableReferenceId,
    reportDefinitionId: metadata.reportDefinitionId,
    reportName: metadata.reportName,
    reportType: metadata.reportType,
    generatedByUserId: metadata.generatedByUserId,
    generatedBy: metadata.generatedBy,
    generatedByEmail: metadata.generatedByEmail,
    generatedByName: metadata.generatedByName,
    generatedByRoles: metadata.generatedByRoles,
    generatedAt: metadata.generatedAt,
    dataScope: metadata.dataScope,
    filtersApplied: metadata.filtersApplied,
    sourceDatasets: metadata.sourceDatasets,
    sourceReferences: metadata.sourceDatasets, // C1 FIX: populate from available data
    includesSampleData: metadata.includesSampleData,
    recordCount: metadata.recordCount,
    exportFormat: metadata.exportFormat,
    snapshotStatus: metadata.snapshotStatus,
    governanceDisclaimer: metadata.governanceDisclaimer,
    sampleDataDisclaimer: metadata.sampleDataDisclaimer,
    checksum: metadata.checksum,
    checksumAlgorithm: metadata.checksumAlgorithm,
    relatedAuditEventId: auditEventId, // B1 FIX: set inline, no UPDATE needed
  });

  return {
    success: true,
    data: {
      snapshotId: metadata.stableReferenceId,
      checksum: metadata.checksum!,
    },
    auditEventId,
  };
}

// ── 2. Get Report Snapshots (List) ──────────────────────────────

export async function getReportSnapshots(
  limit = 50,
): Promise<SnapshotWriteResult<{ snapshots: typeof reportSnapshots.$inferSelect[] }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REPORTS_VIEW);

  const db = getDb();
  const rows = await db
    .select()
    .from(reportSnapshots)
    .orderBy(desc(reportSnapshots.generatedAt))
    .limit(limit);

  return { success: true, data: { snapshots: rows } };
}

// ── 3. Get Report Snapshot by ID ────────────────────────────────

export async function getReportSnapshotById(
  snapshotId: string,
): Promise<SnapshotWriteResult<{ snapshot: typeof reportSnapshots.$inferSelect }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REPORTS_VIEW);

  const db = getDb();
  const [row] = await db
    .select()
    .from(reportSnapshots)
    .where(eq(reportSnapshots.stableReferenceId, snapshotId));

  if (!row) {
    return { success: false, error: `Snapshot not found: ${snapshotId}`, code: 'NOT_FOUND' };
  }

  // Record view audit event
  const auditEventId = await insertAuditEvent({
    entityType: 'report_snapshot',
    entityId: snapshotId,
    action: 'report_snapshot_viewed',
    previousValue: null,
    newValue: null,
    sourceReference: snapshotId,
  });

  return { success: true, data: { snapshot: row }, auditEventId };
}

// ── 4. Get Snapshots by Report Definition ID ────────────────────

export async function getReportSnapshotsByReportId(
  reportDefinitionId: string,
  limit = 25,
): Promise<SnapshotWriteResult<{ snapshots: typeof reportSnapshots.$inferSelect[] }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REPORTS_VIEW);

  const db = getDb();
  const rows = await db
    .select()
    .from(reportSnapshots)
    .where(eq(reportSnapshots.reportDefinitionId, reportDefinitionId))
    .orderBy(desc(reportSnapshots.generatedAt))
    .limit(limit);

  return { success: true, data: { snapshots: rows } };
}

// ── Helpers ─────────────────────────────────────────────────────

function getExportAuditAction(format: string): string {
  switch (format) {
    case 'csv': return 'report_export_csv';
    case 'json': return 'report_export_json';
    case 'print': return 'report_export_print';
    default: return 'report_snapshot_created';
  }
}
