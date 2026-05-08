/**
 * POST /api/reports/export — Create a report export with snapshot persistence + audit event.
 *
 * This endpoint is the primary export action for database mode.
 * It creates a report snapshot record, writes an audit event, and returns
 * the snapshot ID and checksum for inclusion in the export metadata envelope.
 *
 * Requires reports.export permission.
 *
 * GOVERNANCE: Report exports are OUTPUT records only. They do not modify
 * active regulatory reference data, operational data, source records,
 * draft changes, version history, or audit events (except creating audit records).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createReportSnapshot } from '@/lib/services/snapshot-writes';
import { parseSnapshotRequest } from '@/lib/services/snapshot-api-helpers';
import { resolveSession } from '@/auth/session';

export async function POST(req: NextRequest) {
  return resolveSession(async () => {  
    try {
      const body = await req.json();
  
      // C4 FIX: Use shared validation helper
      const parsed = parseSnapshotRequest(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
  
      const result = await createReportSnapshot(parsed.input);
  
      if (!result.success) {
        if (result.code === 'JSON_MODE') {
          return NextResponse.json({ error: result.error }, { status: 503 });
        }
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
  
      return NextResponse.json({
        data: result.data,
        auditEventId: result.auditEventId,
        message: 'Report export snapshot created successfully.',
      }, { status: 201 });
    } catch (err) {
      if (err instanceof Error && err.name === 'AuthorizationError') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      console.error('[API] POST /api/reports/export error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
