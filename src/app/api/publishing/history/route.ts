/**
 * GET /api/publishing/history — Publication event history.
 *
 * Returns the full log of all publication events, most recent first.
 *
 * Requires: version.view (database mode)
 */
import { NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { getPublicationHistory, AuthorizationError } from '@/lib/services/publishing-writes';
import { resolveSession } from '@/auth/session';

export async function GET() {
  return resolveSession(async () => {  
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for publication history.' },
          { status: 503 },
        );
      }
  
      const events = await getPublicationHistory();
      return NextResponse.json({ events });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  
  });
}
