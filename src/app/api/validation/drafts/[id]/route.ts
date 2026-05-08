/**
 * GET /api/validation/drafts/[id] — Get validation review for a specific draft.
 *
 * GOVERNANCE: Read-only. Returns single validation review by draft change ID.
 * Does NOT modify any data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { resolveSession } from '@/auth/session';
import { getDraftValidationReviewByDraftChange } from '@/lib/services/validation-writes';
import { AuthorizationError } from '@/auth/rbac';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json({ review: null, mode: 'json' });
      }

      const { id } = await params;

      const result = await getDraftValidationReviewByDraftChange(id);

      if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404
          : result.code === 'FORBIDDEN' ? 403
          : result.code === 'JSON_MODE' ? 503
          : 400;
        return NextResponse.json({ error: result.error }, { status });
      }

      return NextResponse.json({ review: result.created, mode: 'database' });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  });
}
