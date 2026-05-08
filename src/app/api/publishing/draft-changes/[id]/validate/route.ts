/**
 * C5 FIX: Server-side publish readiness validation endpoint.
 *
 * GET /api/publishing/draft-changes/[id]/validate
 *
 * Returns server-authoritative validation results for a draft change,
 * including SoD checks, approval status, source references, and permission verification.
 */
import { NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { validateDraftReadyForPublication } from '@/lib/services/publishing-writes';
import { resolveSession } from '@/auth/session';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    const { id } = await params;
    if (!isDatabaseMode()) {
      return NextResponse.json(
        { error: 'Server-side validation requires database mode.', code: 'JSON_MODE' },
        { status: 503 },
      );
    }
  
    try {
      const result = await validateDraftReadyForPublication(id);
      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Validation failed', code: 'VALIDATION_ERROR' },
        { status: 422 },
      );
    }
  
  });
}
