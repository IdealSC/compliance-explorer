/**
 * GET /api/ai/suggestions/[id] — Get a single AI extraction suggestion.
 *
 * RBAC: ai.suggestion.view
 *
 * Phase 3.6: AI Suggestion Data Model Foundation
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError, requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { getAiSuggestions } from '@/lib/data';
import { getAiSuggestionByIdFromDb } from '@/lib/services/ai-suggestion-reads';
import { resolveSession } from '@/auth/session';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      requirePermission(PERMISSIONS.AI_SUGGESTION_VIEW);

      const { id } = await params;

      if (isDatabaseMode()) {
        const result = await getAiSuggestionByIdFromDb(id);
        if (!result.success) {
          const status = result.code === 'NOT_FOUND' ? 404 : 500;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
        return NextResponse.json({
          record: result.data?.record,
          dataSource: 'database',
          aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice.',
        });
      }

      // JSON fallback — find by stableReferenceId
      const records = getAiSuggestions();
      const record = records.find((r) => r.stableReferenceId === id);
      if (!record) {
        return NextResponse.json({ error: `AI suggestion "${id}" not found.`, code: 'NOT_FOUND' }, { status: 404 });
      }

      return NextResponse.json({
        record,
        dataSource: 'json',
        aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice.',
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/ai/suggestions/[id] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
