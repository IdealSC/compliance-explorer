/**
 * GET /api/reports/snapshots — List report snapshots (requires reports.view)
 * POST /api/reports/snapshots — Create a report snapshot (requires reports.export)
 *
 * GOVERNANCE: Report snapshots are OUTPUT records. They do not modify
 * active regulatory reference data, operational data, or audit events.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getReportSnapshots, createReportSnapshot } from '@/lib/services/snapshot-writes';
import { parseSnapshotRequest } from '@/lib/services/snapshot-api-helpers';
import { resolveSession } from '@/auth/session';

// ── GET: List Snapshots ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  return resolveSession(async () => {  
    try {
      const limit = Number(req.nextUrl.searchParams.get('limit') ?? '50');
      const result = await getReportSnapshots(Math.min(limit, 100));
  
      if (!result.success) {
        if (result.code === 'JSON_MODE') {
          return NextResponse.json({ error: result.error }, { status: 503 });
        }
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
  
      return NextResponse.json({ data: result.data });
    } catch (err) {
      if (err instanceof Error && err.name === 'AuthorizationError') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      console.error('[API] GET /api/reports/snapshots error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}

// ── POST: Create Snapshot ───────────────────────────────────────

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
  
      return NextResponse.json({ data: result.data, auditEventId: result.auditEventId }, { status: 201 });
    } catch (err) {
      if (err instanceof Error && err.name === 'AuthorizationError') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      console.error('[API] POST /api/reports/snapshots error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
