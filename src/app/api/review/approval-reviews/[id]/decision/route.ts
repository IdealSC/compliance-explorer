/**
 * PATCH /api/review/approval-reviews/[id]/decision — Execute a review decision.
 *
 * Supports: start, return_for_revision, reject, legal_review_required, approve_for_publication
 *
 * GOVERNANCE: This route manages review decisions only.
 * "approve_for_publication" means approved for FUTURE publication readiness.
 * It does NOT publish, activate, supersede, or archive active reference data.
 * Any attempt to use 'published', 'activated', 'superseded', or 'archived'
 * as a decision action is explicitly blocked with a 400 response.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  startApprovalReview,
  returnDraftForRevision,
  rejectDraftReview,
  markLegalReviewRequired,
  approveDraftForPublicationReadiness,
  AuthorizationError,
} from '@/lib/services/review-writes';
import { isDatabaseMode } from '@/lib/data-source';
import { resolveSession } from '@/auth/session';

const BLOCKED_ACTIONS = ['publish', 'published', 'activate', 'activated', 'supersede', 'superseded', 'archive', 'archived'];

const VALID_ACTIONS = ['start', 'return_for_revision', 'reject', 'legal_review_required', 'approve_for_publication'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for review persistence.' },
          { status: 503 },
        );
      }
  
      const body = await request.json();
      const action = body.action as string;
  
      if (!action) {
        return NextResponse.json(
          { error: 'action is required. Valid actions: ' + VALID_ACTIONS.join(', ') },
          { status: 400 },
        );
      }
  
      // Explicitly block any publish/activate/supersede/archive attempts
      if (BLOCKED_ACTIONS.includes(action.toLowerCase())) {
        return NextResponse.json(
          { error: `Action "${action}" is not allowed. Publication, activation, supersession, and archival require the controlled publishing workflow (Phase 2.5B+). This endpoint only supports review decisions.` },
          { status: 400 },
        );
      }
  
      if (!VALID_ACTIONS.includes(action)) {
        return NextResponse.json(
          { error: `Invalid action "${action}". Valid actions: ${VALID_ACTIONS.join(', ')}` },
          { status: 400 },
        );
      }
  
      let result;
  
      switch (action) {
        case 'start':
          result = await startApprovalReview(id);
          break;
        case 'return_for_revision':
          result = await returnDraftForRevision(id, body.comments, body.reason);
          break;
        case 'reject':
          result = await rejectDraftReview(id, body.comments, body.reason);
          break;
        case 'legal_review_required':
          result = await markLegalReviewRequired(id, body.comments);
          break;
        case 'approve_for_publication':
          result = await approveDraftForPublicationReadiness(id, body.comments, body.approvalReference);
          break;
        default:
          return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
      }
  
      if (!result.success) {
        const status =
          result.code === 'NOT_FOUND' ? 404
          : result.code === 'FORBIDDEN' ? 403
          : result.code === 'CONFLICT' ? 409
          : result.code === 'TRANSITION_ERROR' ? 409
          : result.code === 'JSON_MODE' ? 503
          : 400;
        return NextResponse.json({ error: result.error }, { status });
      }
  
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  
  });
}
