/**
 * GET /api/publishing/publishable-drafts — List drafts eligible for publishing.
 *
 * Returns draft changes that have been approved for publication readiness
 * but have not yet been published as active reference records.
 *
 * Requires: review.view (database mode)
 */
import { NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { getPublishableDrafts, AuthorizationError } from '@/lib/services/publishing-writes';
import { resolveSession } from '@/auth/session';

export async function GET() {
  return resolveSession(async () => {  
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for publishing workflow.' },
          { status: 503 },
        );
      }
  
      const drafts = await getPublishableDrafts();
      return NextResponse.json({ drafts });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  
  });
}
