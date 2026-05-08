/**
 * GET /api/version-history/as-of
 *
 * As-of traceability endpoint.
 * Returns the active version of a regulatory record as of a specific date.
 *
 * Query parameters:
 *   stableReferenceId (required) — the record to look up
 *   asOfDate (required) — YYYY-MM-DD date to query
 *
 * Requires: database mode + version.view permission.
 */
import { NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { getActiveVersionAsOf } from '@/lib/services/version-history-service';
import { resolveSession } from '@/auth/session';

export async function GET(request: Request) {
  return resolveSession(async () => {  
    if (!isDatabaseMode()) {
      return NextResponse.json(
        { error: 'As-of lookup requires database mode. Set DATA_SOURCE=database.', code: 'JSON_MODE' },
        { status: 503 },
      );
    }
  
    const { searchParams } = new URL(request.url);
    const stableReferenceId = searchParams.get('stableReferenceId');
    const asOfDate = searchParams.get('asOfDate');
  
    if (!stableReferenceId || !asOfDate) {
      return NextResponse.json(
        { error: 'Both stableReferenceId and asOfDate query parameters are required.' },
        { status: 400 },
      );
    }
  
    // Validate date format
    const parsedDate = new Date(asOfDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: `Invalid date format: "${asOfDate}". Use YYYY-MM-DD.` },
        { status: 400 },
      );
    }
  
    try {
      const result = await getActiveVersionAsOf(stableReferenceId, parsedDate);
      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'As-of lookup failed' },
        { status: 500 },
      );
    }
  
  });
}
