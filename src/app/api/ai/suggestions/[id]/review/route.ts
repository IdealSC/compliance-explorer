/**
 * PATCH /api/ai/suggestions/[id]/review — Update AI suggestion review status.
 *
 * Supports: reject, expire, mark_for_review, update_notes, toggle_legal_review.
 * Does NOT support: accept-to-draft (deferred to Phase 3.9).
 *
 * RBAC: ai.suggestion.review / ai.suggestion.reject
 * Zod validated per action type.
 *
 * Phase 3.7: AI Suggestion Review Workbench
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { isDatabaseMode } from '@/lib/data-source';
import {
  rejectAiSuggestion,
  expireAiSuggestion,
  markAiSuggestionForReview,
  updateAiSuggestionReviewerNotes,
  toggleAiSuggestionLegalReview,
} from '@/lib/services/ai-suggestion-writes';
import { resolveSession } from '@/auth/session';
import { validateRequestBody } from '@/lib/validation';
import { z } from 'zod';

// Combined schema for all review actions
const ReviewActionSchema = z.object({
  action: z.enum(['reject', 'expire', 'mark_for_review', 'update_notes', 'toggle_legal_review']),
  reviewerNotes: z.string().trim().min(1).max(2000).optional(),
  reason: z.string().optional(),
  legalReviewRequired: z.boolean().optional(),
}).strict().refine(
  (data) => {
    // Reject requires reviewerNotes
    if (data.action === 'reject' && (!data.reviewerNotes || data.reviewerNotes.trim().length === 0)) {
      return false;
    }
    // update_notes requires reviewerNotes
    if (data.action === 'update_notes' && (!data.reviewerNotes || data.reviewerNotes.trim().length === 0)) {
      return false;
    }
    // toggle_legal_review requires legalReviewRequired boolean
    if (data.action === 'toggle_legal_review' && data.legalReviewRequired === undefined) {
      return false;
    }
    return true;
  },
  {
    message: 'Missing required fields for the specified action.',
    path: ['reviewerNotes'],
  },
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for AI suggestion review.', code: 'JSON_MODE' },
          { status: 503 },
        );
      }

      const { id } = await params;

      // Zod validation
      const parseResult = await validateRequestBody(ReviewActionSchema, request);
      if ('error' in parseResult) return parseResult.error;
      const { data } = parseResult;

      let result;
      switch (data.action) {
        case 'reject':
          result = await rejectAiSuggestion(id, data.reviewerNotes!);
          break;
        case 'expire':
          result = await expireAiSuggestion(id, data.reason);
          break;
        case 'mark_for_review':
          result = await markAiSuggestionForReview(id, data.reason);
          break;
        case 'update_notes':
          result = await updateAiSuggestionReviewerNotes(id, data.reviewerNotes!);
          break;
        case 'toggle_legal_review':
          result = await toggleAiSuggestionLegalReview(id, data.legalReviewRequired!, data.reason);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid action.', code: 'VALIDATION_ERROR' },
            { status: 400 },
          );
      }

      if (!result.success) {
        const status =
          result.code === 'NOT_FOUND' ? 404
            : result.code === 'FORBIDDEN' ? 403
              : result.code === 'INVALID_TRANSITION' ? 409
                : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }

      return NextResponse.json({
        success: true,
        ...result.data,
        auditEventId: result.auditEventId,
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] PATCH /api/ai/suggestions/[id]/review error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
