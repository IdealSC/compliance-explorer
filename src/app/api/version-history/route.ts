/**
 * GET /api/version-history
 *
 * Returns version history from the database.
 * Optional query parameter: ?stableReferenceId=X to filter by record.
 *
 * Falls back to JSON sample data when in JSON mode.
 * Requires: version.view permission.
 */
import { NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { getVersionHistoryFromDb } from '@/lib/services/version-history-service';
import { getVersionHistory } from '@/lib/data';
import { requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { resolveSession } from '@/auth/session';

export async function GET(request: Request) {
  return resolveSession(async () => {  
    // Phase 2.6 C3 FIX: Enforce RBAC at the route level for both DB and JSON paths
    requirePermission(PERMISSIONS.VERSION_VIEW);
  
    const { searchParams } = new URL(request.url);
    const stableReferenceId = searchParams.get('stableReferenceId') ?? undefined;
  
    try {
      if (isDatabaseMode()) {
        const versions = await getVersionHistoryFromDb(stableReferenceId);
        return NextResponse.json({ versions, source: 'database' });
      }
  
      // JSON mode fallback
      let versions = getVersionHistory();
      if (stableReferenceId) {
        versions = versions.filter((v) => v.stableReferenceId === stableReferenceId);
      }
      return NextResponse.json({ versions, source: 'json' });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Failed to fetch version history' },
        { status: 500 },
      );
    }
  
  });
}
