/**
 * Audit Event Writer — INSERT-only audit trail service.
 *
 * All writes to the audit_events table go through this module.
 * Audit events are append-only — no UPDATE or DELETE operations.
 *
 * GOVERNANCE: This is the single point of audit event creation.
 * Every operational write must call insertAuditEvent() on success.
 *
 * Phase 2.6: SHA-256 checksums are computed at insert time and stored
 * for tamper detection. See immutability-guard.ts for verification.
 */
import { getDb, type AppDatabase } from '@/db';
import { auditEvents } from '@/db/schema';
import { getSessionContext, safeUserId } from '@/auth/rbac';
import { computeAuditChecksum, assertAppendOnly } from './immutability-guard';

export interface AuditEventInput {
  entityType: string;
  entityId: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  reason?: string;
  approvalReference?: string;
  sourceReference?: string | null; // B2 FIX: Publishing provenance traceability
}

/**
 * Generate a stable reference ID for audit events.
 * Format: AE-{timestamp36}-{random4}
 */
function generateAuditRefId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `AE-${ts}-${rand}`;
}

/**
 * Insert an audit event into the database.
 * Captures the current session context automatically.
 * Computes and stores a SHA-256 checksum for tamper detection (Phase 2.6).
 *
 * @param input - The audit event data
 * @param txDb - Optional transaction/db override for atomic operations (C4 FIX)
 * @returns The stable reference ID of the created event
 */
export async function insertAuditEvent(
  input: AuditEventInput,
  // C4 FIX: Accept transaction object for atomic publishing operations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  txDb?: AppDatabase | any,
): Promise<string> {
  const db = txDb ?? getDb();
  const ctx = getSessionContext();
  const refId = generateAuditRefId();

  // Phase 2.6 B1 FIX: Enforce append-only constraint at runtime.
  // This guard confirms the operation type is INSERT. If any code path
  // ever attempts UPDATE or DELETE on audit_events, it will throw.
  assertAppendOnly('audit_events', 'INSERT');

  // Session ID: request-scoped marker for correlating actions within one session.
  // Uses a timestamp + random suffix since demo sessions don't have persistent session IDs.
  const sessionMarker = `SES-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const changedBy = ctx.userName ?? ctx.userEmail ?? 'unknown';
  const changedAt = new Date().toISOString();

  // Phase 2.6: Compute SHA-256 checksum for tamper detection
  const checksum = computeAuditChecksum({
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    previousValue: input.previousValue,
    newValue: input.newValue,
    changedBy,
    changedAt,
    sourceReference: input.sourceReference,
  });

  await db.insert(auditEvents).values({
    stableReferenceId: refId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    previousValue: input.previousValue,
    newValue: input.newValue,
    changedBy,
    // FK constraint: changedByUserId references users.id.
    // safeUserId() returns null for demo users to avoid constraint violations.
    changedByUserId: safeUserId(ctx),
    changedByEmail: ctx.userEmail,
    roles: ctx.roles.length > 0 ? JSON.stringify(ctx.roles) : null,
    changedAt: new Date(changedAt),
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    sourceReference: input.sourceReference ?? null, // B2 FIX
    checksum, // Phase 2.6: SHA-256 tamper detection
    sessionId: sessionMarker,
  });

  return refId;
}
