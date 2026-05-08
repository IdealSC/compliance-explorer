/**
 * POST /api/review/approval-reviews — Create an approval review record.
 * GET  /api/review/approval-reviews — List approval reviews (optional filters).
 *
 * GOVERNANCE: Creates/reads review records only.
 * Does NOT publish, activate, supersede, or archive active reference data.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  createApprovalReview,
  getApprovalReviews,
  AuthorizationError,
} from '@/lib/services/review-writes';
import { isDatabaseMode } from '@/lib/data-source';
import { resolveSession } from '@/auth/session';

export async function POST(request: NextRequest) {
  return resolveSession(async () => {  
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for review persistence.' },
          { status: 503 },
        );
      }
  
      const body = await request.json();
  
      if (!body.reviewTargetType || !body.reviewTargetId) {
        return NextResponse.json(
          { error: 'reviewTargetType and reviewTargetId are required.' },
          { status: 400 },
        );
      }
  
      const validTypes = ['regulatory_update', 'draft_change'];
      if (!validTypes.includes(body.reviewTargetType)) {
        return NextResponse.json(
          { error: `reviewTargetType must be one of: ${validTypes.join(', ')}` },
          { status: 400 },
        );
      }
  
      const result = await createApprovalReview({
        reviewTargetType: body.reviewTargetType,
        reviewTargetId: body.reviewTargetId,
        relatedUpdateId: body.relatedUpdateId ?? null,
        relatedDraftChangeId: body.relatedDraftChangeId ?? null,
        sourceReference: body.sourceReference ?? null,
        legalReviewRequired: body.legalReviewRequired ?? false,
        requiredReviewerRole: body.requiredReviewerRole ?? null,
      });
  
      if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404
          : result.code === 'FORBIDDEN' ? 403
          : result.code === 'JSON_MODE' ? 503
          : 400;
        return NextResponse.json({ error: result.error }, { status });
      }
  
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  
  });
}

export async function GET(request: NextRequest) {
  return resolveSession(async () => {  
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json({ reviews: [], mode: 'json' });
      }
  
      const { searchParams } = new URL(request.url);
      const reviewStatus = searchParams.get('status') ?? undefined;
      const reviewTargetType = searchParams.get('targetType') ?? undefined;
  
      const reviews = await getApprovalReviews({ reviewStatus, reviewTargetType });
      return NextResponse.json({ reviews, mode: 'database' });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  
  });
}
