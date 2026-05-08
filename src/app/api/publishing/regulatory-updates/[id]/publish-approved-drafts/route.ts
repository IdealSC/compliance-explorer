/**
 * POST /api/publishing/regulatory-updates/[id]/publish-approved-drafts
 *
 * Publish all approved draft changes linked to a regulatory update.
 * After all are published, the update is operationalized.
 *
 * Requires: reference.publish (database mode)
 */
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { publishApprovedDraftsForUpdate, AuthorizationError } from '@/lib/services/publishing-writes';
import { resolveSession } from '@/auth/session';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
  
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for publishing.' },
          { status: 503 },
        );
      }
  
      const result = await publishApprovedDraftsForUpdate(id);
  
      if (!result.success) {
        const status =
          result.code === 'NOT_FOUND' ? 404
          : result.code === 'VALIDATION_ERROR' ? 422
          : result.code === 'JSON_MODE' ? 503
          : 400;
        return NextResponse.json({ error: result.error, data: result.data }, { status });
      }
  
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      console.error('[API] Batch publishing error:', error);
      return NextResponse.json({ error: 'Internal server error during batch publishing.' }, { status: 500 });
    }
  
  });
}
