/**
 * POST /api/ai/suggestions/[id]/accept-to-draft — Convert citation suggestion to draft.
 *
 * Phase 3.9: Human-controlled, citation-only conversion of a reviewed
 * AI suggestion into a DraftRegulatoryChange record.
 *
 * GOVERNANCE:
 * - Only citation suggestions may be converted
 * - Requires AI_SUGGESTION_ACCEPT_TO_DRAFT + DRAFT_EDIT permissions
 * - Creates draft/staging record only — no active reference data is modified
 * - The resulting draft enters standard review → approval → publish pipeline
 * - Full audit trail: suggestion → draft → review → approval → publish
 *
 * RBAC: ai.suggestion.acceptToDraft + draft.edit (Compliance Editor, Admin)
 * Zod validated: AcceptToDraftSchema
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { isDatabaseMode } from '@/lib/data-source';
import { acceptAiSuggestionToDraft } from '@/lib/services/ai-suggestion-writes';
import { resolveSession } from '@/auth/session';
import { validateRequestBody } from '@/lib/validation';
import { AcceptToDraftSchema } from '@/validation/ai-suggestions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for AI suggestion conversion.', code: 'JSON_MODE' },
          { status: 503 },
        );
      }

      const { id } = await params;

      // Zod validation
      const parseResult = await validateRequestBody(AcceptToDraftSchema, request);
      if ('error' in parseResult) return parseResult.error;
      const { data } = parseResult;

      const result = await acceptAiSuggestionToDraft(
        id,
        data.relatedUpdateId,
        data.changeReason ?? undefined,
      );

      if (!result.success) {
        const status =
          result.code === 'NOT_FOUND' ? 404
            : result.code === 'FORBIDDEN' ? 403
              : result.code === 'INVALID_TRANSITION' ? 409
                : result.code === 'NOT_ELIGIBLE' ? 422
                  : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }

      return NextResponse.json({
        success: true,
        draftChangeId: result.data?.draftChangeId,
        suggestionId: result.data?.suggestionId,
        auditEventId: result.auditEventId,
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] POST /api/ai/suggestions/[id]/accept-to-draft error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
