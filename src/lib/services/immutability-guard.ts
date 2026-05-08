/**
 * Immutability Guard — Service-layer enforcement for append-only tables.
 *
 * GOVERNANCE: The following tables are append-only in production.
 * No UPDATE or DELETE operations are permitted through the service layer.
 *
 * - audit_events
 * - publication_events
 * - regulatory_versions
 * - report_snapshots
 *
 * This module provides runtime guards that service functions can invoke
 * before performing write operations. True DDL-level enforcement
 * (PostgreSQL policies/triggers) is deferred to a future phase.
 */
import { createHash } from 'crypto';

// ── Immutable Tables ────────────────────────────────────────────

export const IMMUTABLE_TABLES = [
  'audit_events',
  'publication_events',
  'regulatory_versions',
  'report_snapshots',
] as const;

export type ImmutableTable = (typeof IMMUTABLE_TABLES)[number];

// ── Error Class ─────────────────────────────────────────────────

export class ImmutabilityViolationError extends Error {
  public readonly tableName: string;
  public readonly operation: string;

  constructor(tableName: string, operation: 'UPDATE' | 'DELETE') {
    super(
      `Immutability violation: ${operation} operations are not permitted on append-only table "${tableName}". ` +
      `This table is part of the governed audit trail and must remain insert-only.`,
    );
    this.name = 'ImmutabilityViolationError';
    this.tableName = tableName;
    this.operation = operation;
  }
}

// ── Guard Functions ─────────────────────────────────────────────

/**
 * Assert that an operation on a governed table is append-only safe.
 * - INSERT operations always pass (append-only is satisfied).
 * - UPDATE/DELETE operations throw ImmutabilityViolationError for immutable tables.
 *
 * Call this before any DML operation on governed tables to self-document
 * and enforce the immutability constraint at the service layer.
 */
export function assertAppendOnly(
  tableName: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE' = 'UPDATE',
): void {
  // INSERT is always allowed on append-only tables
  if (operation === 'INSERT') return;

  if ((IMMUTABLE_TABLES as readonly string[]).includes(tableName)) {
    throw new ImmutabilityViolationError(tableName, operation);
  }
}

// ── Checksum Utilities ──────────────────────────────────────────

/**
 * Compute a SHA-256 checksum for an audit event payload.
 * The checksum covers the core immutable fields to enable tamper detection.
 */
export function computeAuditChecksum(payload: {
  entityType: string;
  entityId: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
  sourceReference?: string | null;
}): string {
  const canonical = [
    payload.entityType,
    payload.entityId,
    payload.action,
    payload.previousValue ?? '',
    payload.newValue ?? '',
    payload.changedBy,
    payload.changedAt,
    payload.sourceReference ?? '',
  ].join('|');

  return createHash('sha256').update(canonical).digest('hex');
}

/**
 * Verify an audit event's checksum against its stored value.
 * Returns true if the checksum matches, false if tampered or missing.
 */
export function verifyAuditChecksum(event: {
  entityType: string;
  entityId: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string | Date;
  sourceReference?: string | null;
  checksum: string | null;
}): { valid: boolean; expected: string; actual: string | null } {
  if (!event.checksum) {
    return { valid: false, expected: 'missing', actual: null };
  }

  const changedAtStr =
    event.changedAt instanceof Date
      ? event.changedAt.toISOString()
      : event.changedAt;

  const expected = computeAuditChecksum({
    ...event,
    changedAt: changedAtStr,
  });

  return {
    valid: expected === event.checksum,
    expected,
    actual: event.checksum,
  };
}
