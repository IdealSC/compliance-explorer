/**
 * GET /api/ai/suggestions — List all AI extraction suggestions.
 *
 * Returns suggestions from DB (database mode) or JSON sample data.
 * RBAC: ai.suggestion.view
 *
 * GOVERNANCE:
 * AI suggestions are draft-only governance records. They are NOT active
 * reference data, legal advice, or compliance certifications.
 * No AI model is integrated in Phase 3.6.
 *
 * Phase 3.6: AI Suggestion Data Model Foundation
 */
import { NextResponse } from 'next/server';
import { AuthorizationError, requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { getAiSuggestions } from '@/lib/data';
import { getAiSuggestionsFromDb } from '@/lib/services/ai-suggestion-reads';
import { resolveSession } from '@/auth/session';

export async function GET() {
  return resolveSession(async () => {
    try {
      requirePermission(PERMISSIONS.AI_SUGGESTION_VIEW);

      if (isDatabaseMode()) {
        const result = await getAiSuggestionsFromDb();
        if (!result.success) {
          return NextResponse.json({ error: result.error, code: result.code }, { status: 500 });
        }
        return NextResponse.json({
          records: result.data?.records ?? [],
          dataSource: 'database',
          aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice.',
        });
      }

      // JSON fallback
      const records = getAiSuggestions();
      return NextResponse.json({
        records,
        dataSource: 'json',
        aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice.',
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/ai/suggestions error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
