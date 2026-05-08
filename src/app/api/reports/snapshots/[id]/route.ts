/**
 * GET /api/reports/snapshots/[id] — Get a specific report snapshot by stable reference ID.
 *
 * Requires reports.view permission.
 * Records a snapshot_viewed audit event.
 *
 * GOVERNANCE: Read-only. Does not modify any data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getReportSnapshotById } from '@/lib/services/snapshot-writes';
import { resolveSession } from '@/auth/session';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
  
      if (!id || id.trim().length === 0) {
        return NextResponse.json({ error: 'Snapshot ID is required' }, { status: 400 });
      }
  
      const result = await getReportSnapshotById(id);
  
      if (!result.success) {
        if (result.code === 'JSON_MODE') {
          return NextResponse.json({ error: result.error }, { status: 503 });
        }
        if (result.code === 'NOT_FOUND') {
          return NextResponse.json({ error: result.error }, { status: 404 });
        }
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
  
      return NextResponse.json({ data: result.data });
    } catch (err) {
      if (err instanceof Error && err.name === 'AuthorizationError') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      console.error('[API] GET /api/reports/snapshots/[id] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
