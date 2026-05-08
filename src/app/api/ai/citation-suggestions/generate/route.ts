/**
 * POST /api/ai/citation-suggestions/generate — Generate citation suggestions.
 *
 * Invokes the AI provider to extract candidate citations from source text.
 * Citations are stored as draft-only governance records.
 *
 * GOVERNANCE:
 * - Requires AI_SUGGESTION_GENERATE permission
 * - Requires database mode
 * - Requires AI feature to be enabled and provider configured
 * - Request body validated with GenerateCitationSuggestionsSchema
 * - Source record validation gate enforced by default
 * - All output is citation-only — no obligations
 * - Every operation is audited
 * - Accept-to-draft remains blocked
 * - AI output is NOT legal advice
 *
 * Phase 3.8: Controlled AI Provider Integration — Citation Suggestions Only
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { resolveSession } from '@/auth/session';
import { isDatabaseMode } from '@/lib/data-source';
import { isAiEnabled, isProviderConfigured } from '@/ai/ai-config';
import { GenerateCitationSuggestionsSchema } from '@/validation/ai-suggestions';
import { generateCitationSuggestions } from '@/ai/citation-suggestion-service';

export async function POST(request: NextRequest) {
  return resolveSession(async () => {
    try {
      // ── Gate: Database mode ─────────────────────────────────────
      if (!isDatabaseMode()) {
        return NextResponse.json(
          {
            error: 'Database mode is required for AI citation generation.',
            code: 'JSON_MODE',
            aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice.',
          },
          { status: 503 },
        );
      }

      // ── Gate: AI feature enabled ────────────────────────────────
      if (!isAiEnabled()) {
        return NextResponse.json(
          {
            error: 'AI citation suggestion feature is not enabled. Set AI_PROVIDER and AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=true.',
            code: 'FEATURE_DISABLED',
            aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice.',
          },
          { status: 503 },
        );
      }

      // ── Gate: Provider configured ───────────────────────────────
      if (!isProviderConfigured()) {
        return NextResponse.json(
          {
            error: 'AI provider is not fully configured. Check provider credentials.',
            code: 'PROVIDER_NOT_CONFIGURED',
            aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice.',
          },
          { status: 503 },
        );
      }

      // ── Parse and validate request body ─────────────────────────
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON in request body.', code: 'INVALID_BODY' },
          { status: 400 },
        );
      }

      const parsed = GenerateCitationSuggestionsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: 'Request validation failed.',
            code: 'VALIDATION_ERROR',
            details: parsed.error.issues.map(i => ({
              field: i.path.join('.'),
              message: i.message,
            })),
          },
          { status: 400 },
        );
      }

      // ── Generate citations ──────────────────────────────────────
      const result = await generateCitationSuggestions(parsed.data);

      if (!result.success) {
        const statusMap: Record<string, number> = {
          JSON_MODE: 503,
          FEATURE_DISABLED: 503,
          FORBIDDEN: 403,
          SOURCE_NOT_VALIDATED: 409,
          GENERATION_FAILED: 502,
        };
        const status = statusMap[result.code ?? ''] ?? 500;

        return NextResponse.json(
          {
            error: result.error,
            code: result.code,
            aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice.',
          },
          { status },
        );
      }

      // ── Success ─────────────────────────────────────────────────
      return NextResponse.json({
        success: true,
        suggestionIds: result.suggestionIds,
        count: result.count,
        auditEventId: result.auditEventId,
        aiDisclaimer: 'AI suggestions are draft-only governance records. Not legal advice. All citations require mandatory human review.',
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN' },
          { status: 403 },
        );
      }

      console.error('[API] POST /api/ai/citation-suggestions/generate error:', err);
      return NextResponse.json(
        { error: 'Internal server error.', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }
  });
}
