/**
 * PATCH /api/staging/regulatory-updates/[id]/stage
 *
 * Change the workflow stage of a regulatory update.
 * Stages 'approved' and 'published' are blocked (Phase 2.5).
 *
 * Requires: reference.draft.edit permission
 * Requires: DATA_SOURCE=database
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { updateRegulatoryUpdateStage } from '@/lib/services/staging-writes';
import { resolveSession } from '@/auth/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      const body = await request.json();
      const { stage } = body as { stage?: string };
  
      if (!stage || typeof stage !== 'string') {
        return NextResponse.json(
          { error: 'stage is required and must be a string.' },
          { status: 400 },
        );
      }
  
      const result = await updateRegulatoryUpdateStage(id, stage);
  
      if (!result.success) {
        const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }
  
      return NextResponse.json({
        success: true,
        entityId: result.entityId,
        updated: result.updated,
        auditEventId: result.auditEventId,
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN', permission: err.permission },
          { status: 403 },
        );
      }
      console.error('[API] PATCH /api/staging/regulatory-updates/[id]/stage error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
