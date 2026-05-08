/**
 * POST /api/validation/drafts/[id]/reviews — Create validation review for a draft.
 *
 * GOVERNANCE: Creates advisory validation metadata only.
 * Does NOT approve, publish, or activate reference data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { resolveSession } from '@/auth/session';
import { createDraftValidationReview } from '@/lib/services/validation-writes';
import { CreateValidationReviewSchema } from '@/validation/validation-workbench';
import { AuthorizationError } from '@/auth/rbac';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for validation operations.' },
          { status: 503 },
        );
      }

      const { id } = await params;
      const body = await request.json();

      // Validate input
      const parsed = CreateValidationReviewSchema.safeParse({
        ...body,
        draftChangeId: id,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
          { status: 422 },
        );
      }

      const result = await createDraftValidationReview(parsed.data);

      if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404
          : result.code === 'FORBIDDEN' ? 403
          : result.code === 'DUPLICATE' ? 409
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
