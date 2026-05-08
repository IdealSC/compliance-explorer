/**
 * PATCH /api/staging/draft-changes/[id]/status
 *
 * Change the draft status of a draft change.
 * Supports: ready_for_review (mark ready / submit), returned, draft
 * Blocked: approved, rejected (Phase 2.5)
 *
 * Requires: draft.edit (for ready_for_review) or reference.review (for returned)
 * Requires: DATA_SOURCE=database
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import {
  markDraftReadyForReview,
  submitDraftForReview,
  returnDraftToDraft,
} from '@/lib/services/staging-writes';
import { resolveSession } from '@/auth/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      const body = await request.json();
      const { status, action, reason } = body as { status?: string; action?: string; reason?: string };
  
      // Determine which operation to perform
      const targetAction = action ?? status;
  
      if (!targetAction || typeof targetAction !== 'string') {
        return NextResponse.json(
          { error: 'action or status is required. Allowed: ready_for_review, submit, returned.' },
          { status: 400 },
        );
      }
  
      // Block Phase 2.5 actions
      if (['approved', 'rejected'].includes(targetAction)) {
        return NextResponse.json(
          { error: `"${targetAction}" requires the approval workflow (Phase 2.5). Phase 2.4 supports: ready_for_review, submit, returned.` },
          { status: 400 },
        );
      }
  
      let result;
  
      switch (targetAction) {
        case 'ready_for_review':
          result = await markDraftReadyForReview(id);
          break;
        case 'submit':
        case 'submit_for_review':
          result = await submitDraftForReview(id);
          break;
        case 'returned':
        case 'return':
        case 'return_to_draft':
          result = await returnDraftToDraft(id, reason);
          break;
        default:
          return NextResponse.json(
            { error: `Unknown action "${targetAction}". Allowed: ready_for_review, submit, returned.` },
            { status: 400 },
          );
      }
  
      if (!result.success) {
        const httpStatus = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status: httpStatus });
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
      console.error('[API] PATCH /api/staging/draft-changes/[id]/status error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
