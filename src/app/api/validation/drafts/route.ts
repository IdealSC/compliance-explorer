/**
 * GET /api/validation/drafts — List drafts with validation review metadata.
 *
 * GOVERNANCE: Read-only. Returns draft data with validation status overlay.
 * Does NOT modify any data.
 */
import { NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { resolveSession } from '@/auth/session';
import { getDraftValidationReviewsDb } from '@/lib/services/validation-writes';
import { AuthorizationError } from '@/auth/rbac';

export async function GET() {
  return resolveSession(async () => {
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json({ reviews: [], mode: 'json' });
      }

      const result = await getDraftValidationReviewsDb();

      if (!result.success) {
        const status = result.code === 'FORBIDDEN' ? 403
          : result.code === 'JSON_MODE' ? 503
          : 400;
        return NextResponse.json({ error: result.error }, { status });
      }

      return NextResponse.json({ reviews: result.created, mode: 'database' });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  });
}
