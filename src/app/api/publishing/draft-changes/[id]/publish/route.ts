/**
 * POST /api/publishing/draft-changes/[id]/publish — Publish a single approved draft change.
 *
 * Creates a new versioned active regulatory reference record from an approved draft.
 * Enforces: reference.publish, 3-level SoD, full precondition validation.
 *
 * GOVERNANCE: Never overwrites existing active reference data.
 * Creates new versioned records and supersedes prior versions.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { publishDraftChange, AuthorizationError } from '@/lib/services/publishing-writes';
import { resolveSession } from '@/auth/session';

export async function POST(
  request: NextRequest,
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
  
      const body = await request.json().catch(() => ({}));
      const result = await publishDraftChange(id, {
        publicationSummary: body.publicationSummary,
      });
  
      if (!result.success) {
        const status =
          result.code === 'NOT_FOUND' ? 404
          : result.code === 'FORBIDDEN' ? 403
          : result.code === 'SoD_VIOLATION' ? 409
          : result.code === 'CONFLICT' ? 409
          : result.code === 'VALIDATION_ERROR' ? 422
          : result.code === 'JSON_MODE' ? 503
          : 400;
        return NextResponse.json({ error: result.error }, { status });
      }
  
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      console.error('[API] Publishing error:', error);
      return NextResponse.json({ error: 'Internal server error during publishing.' }, { status: 500 });
    }
  
  });
}
