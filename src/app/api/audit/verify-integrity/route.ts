/**
 * GET /api/audit/verify-integrity
 *
 * Phase 2.6 B2 FIX: Audit integrity verification endpoint.
 * Samples or scans audit events and verifies SHA-256 checksums
 * to detect tampering.
 *
 * Optional query parameters:
 *   limit (number) — max events to verify (default 100)
 *   entityType (string) — filter by entity type
 *
 * Requires: database mode + audit.view permission.
 */
import { NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { getDb } from '@/db';
import { auditEvents } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { verifyAuditChecksum } from '@/lib/services/immutability-guard';
import { insertAuditEvent } from '@/lib/services/audit-writer';
import { resolveSession } from '@/auth/session';

export async function GET(request: Request) {
  return resolveSession(async () => {  
    if (!isDatabaseMode()) {
      return NextResponse.json(
        { error: 'Integrity verification requires database mode. Set DATA_SOURCE=database.', code: 'JSON_MODE' },
        { status: 503 },
      );
    }
  
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10) || 100, 1000);
    const entityTypeFilter = searchParams.get('entityType') ?? undefined;
  
    try {
      const db = getDb();
  
      // Fetch events with checksums
      let query = db
        .select({
          id: auditEvents.id,
          stableReferenceId: auditEvents.stableReferenceId,
          entityType: auditEvents.entityType,
          entityId: auditEvents.entityId,
          action: auditEvents.action,
          previousValue: auditEvents.previousValue,
          newValue: auditEvents.newValue,
          changedBy: auditEvents.changedBy,
          changedAt: auditEvents.changedAt,
          sourceReference: auditEvents.sourceReference,
          checksum: auditEvents.checksum,
        })
        .from(auditEvents)
        .orderBy(desc(auditEvents.changedAt))
        .limit(limit);
  
      if (entityTypeFilter) {
        query = query.where(eq(auditEvents.entityType, entityTypeFilter)) as typeof query;
      }
  
      const events = await query;
  
      // Verify each event
      let verified = 0;
      let failed = 0;
      let skipped = 0; // Events without checksums (pre-Phase 2.6)
      const failures: { stableReferenceId: string; entityType: string; entityId: string; action: string }[] = [];
  
      for (const event of events) {
        if (!event.checksum) {
          skipped++;
          continue;
        }
  
        const isValid = verifyAuditChecksum({
          entityType: event.entityType,
          entityId: event.entityId,
          action: event.action,
          previousValue: event.previousValue,
          newValue: event.newValue,
          changedBy: event.changedBy,
          changedAt: event.changedAt instanceof Date
            ? event.changedAt.toISOString()
            : String(event.changedAt),
          sourceReference: event.sourceReference,
          checksum: event.checksum,
        });
  
        if (isValid) {
          verified++;
        } else {
          failed++;
          failures.push({
            stableReferenceId: event.stableReferenceId,
            entityType: event.entityType,
            entityId: event.entityId,
            action: event.action,
          });
        }
      }
  
      // Write audit event for the check itself
      const action = failed > 0 ? 'immutability_check_failed' : 'immutability_check_passed';
      try {
        await insertAuditEvent({
          entityType: 'immutability_check',
          entityId: `integrity-scan-${Date.now().toString(36)}`,
          action,
          previousValue: null,
          newValue: JSON.stringify({ verified, failed, skipped, total: events.length }),
          reason: failed > 0
            ? `Integrity check FAILED: ${failed} event(s) with mismatched checksums`
            : `Integrity check passed: ${verified} event(s) verified, ${skipped} skipped (no checksum)`,
        });
      } catch {
        // Best-effort audit of the check itself
      }
  
      return NextResponse.json({
        integrity: failed === 0 ? 'PASS' : 'FAIL',
        summary: {
          total: events.length,
          verified,
          failed,
          skipped,
        },
        failures: failures.length > 0 ? failures : undefined,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Integrity verification failed' },
        { status: 500 },
      );
    }
  
  });
}
