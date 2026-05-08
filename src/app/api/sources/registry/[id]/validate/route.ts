/**
 * GET /api/sources/registry/[id]/validate
 *
 * Returns source publishing readiness assessment (read-only, no write).
 * Checks: source exists, validation status, source status,
 * legal review complete, checklist completeness.
 *
 * Requires: source.view permission.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError, requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { validateSourceReadyForPublishing } from '@/lib/services/source-writes';
import { resolveSession } from '@/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      requirePermission(PERMISSIONS.SOURCE_VIEW);
      const { id } = await params;
      const result = await validateSourceReadyForPublishing(id);
      return NextResponse.json(result);
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/sources/registry/[id]/validate error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
