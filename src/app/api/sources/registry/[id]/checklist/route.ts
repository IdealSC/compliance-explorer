/**
 * GET /api/sources/registry/[id]/checklist
 *
 * Get validation checklist items for a source record.
 * Requires: source.view permission.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { getSourceValidationChecklist } from '@/lib/services/source-writes';
import { resolveSession } from '@/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      const result = await getSourceValidationChecklist(id);
  
      if (!result.success) {
        const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }
  
      return NextResponse.json({ items: result.data });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/sources/registry/[id]/checklist error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
