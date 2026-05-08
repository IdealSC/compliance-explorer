/**
 * GET  /api/review/approval-reviews/[id] — Get a single review by stable reference ID.
 * PATCH /api/review/approval-reviews/[id] — Update review fields (comments, approval reference).
 *
 * GOVERNANCE: Reads/updates review records only.
 * Does NOT publish, activate, supersede, or archive active reference data.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getApprovalReviewByTarget,
  updateApprovalReviewComments,
  AuthorizationError,
} from '@/lib/services/review-writes';
import { isDatabaseMode } from '@/lib/data-source';
import { getDb } from '@/db';
import { approvalReviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { resolveSession } from '@/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      if (!isDatabaseMode()) {
        return NextResponse.json({ review: null, mode: 'json' });
      }
  
      requirePermission(PERMISSIONS.REVIEW_VIEW);
      const db = getDb();
      const [row] = await db
        .select()
        .from(approvalReviews)
        .where(eq(approvalReviews.stableReferenceId, id));
  
      if (!row) {
        return NextResponse.json({ error: 'Approval review not found.' }, { status: 404 });
      }
  
      return NextResponse.json({ review: row, mode: 'database' });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  
  });
}

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
  
      if (body.reviewComments !== undefined) {
        const result = await updateApprovalReviewComments(id, body.reviewComments);
        if (!result.success) {
          const status = result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error }, { status });
        }
        return NextResponse.json(result);
      }
  
      return NextResponse.json(
        { error: 'No updateable fields provided. Supported: reviewComments.' },
        { status: 400 },
      );
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  
  });
}
