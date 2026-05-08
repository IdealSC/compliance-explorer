/**
 * GET /api/ai/suggestions/metrics — AI Suggestion Workbench Metrics.
 *
 * Returns summary metrics for the review workbench.
 * Works in both JSON and database modes.
 *
 * RBAC: ai.suggestion.view
 *
 * Phase 3.7: AI Suggestion Review Workbench
 */
import { NextResponse } from 'next/server';
import { AuthorizationError, requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { getAiSuggestions } from '@/lib/data';
import { getAiSuggestionsFromDb, computeWorkbenchMetrics } from '@/lib/services/ai-suggestion-reads';
import { resolveSession } from '@/auth/session';

export async function GET() {
  return resolveSession(async () => {
    try {
      requirePermission(PERMISSIONS.AI_SUGGESTION_VIEW);

      let records: Record<string, unknown>[];

      if (isDatabaseMode()) {
        const result = await getAiSuggestionsFromDb();
        if (!result.success) {
          return NextResponse.json({ error: result.error, code: result.code }, { status: 500 });
        }
        records = (result.data?.records ?? []) as Record<string, unknown>[];
      } else {
        // JSON fallback
        records = getAiSuggestions() as unknown as Record<string, unknown>[];
      }

      const metrics = computeWorkbenchMetrics(records);

      return NextResponse.json({
        metrics,
        dataSource: isDatabaseMode() ? 'database' : 'json',
        aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice.',
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/ai/suggestions/metrics error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
