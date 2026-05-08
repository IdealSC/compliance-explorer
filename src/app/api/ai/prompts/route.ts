/**
 * GET /api/ai/prompts — List all AI prompt versions.
 *
 * RBAC: ai.suggestion.view
 *
 * GOVERNANCE:
 * Prompt versions are governance records that control AI extraction behavior.
 * No AI model is integrated in Phase 3.6.
 *
 * Phase 3.6: AI Suggestion Data Model Foundation
 */
import { NextResponse } from 'next/server';
import { AuthorizationError, requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { getAiPromptVersions } from '@/lib/data';
import { getAiPromptVersionsFromDb } from '@/lib/services/ai-suggestion-reads';
import { resolveSession } from '@/auth/session';

export async function GET() {
  return resolveSession(async () => {
    try {
      requirePermission(PERMISSIONS.AI_SUGGESTION_VIEW);

      if (isDatabaseMode()) {
        const result = await getAiPromptVersionsFromDb();
        if (!result.success) {
          return NextResponse.json({ error: result.error, code: result.code }, { status: 500 });
        }
        return NextResponse.json({
          records: result.data?.records ?? [],
          dataSource: 'database',
        });
      }

      // JSON fallback
      const records = getAiPromptVersions();
      return NextResponse.json({ records, dataSource: 'json' });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/ai/prompts error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
