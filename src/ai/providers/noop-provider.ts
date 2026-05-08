/**
 * Noop AI Provider — Phase 3.8.
 *
 * Returns a safe error when AI_PROVIDER=none or no provider is configured.
 * This is the DEFAULT provider. The app must behave identically to
 * Phase 3.7 when this provider is active.
 */
import type { AiProvider, CitationSuggestionInput, CitationSuggestionResult } from './types';

export class NoopProvider implements AiProvider {
  readonly name = 'none';

  async generateCitationSuggestions(_input: CitationSuggestionInput): Promise<CitationSuggestionResult> {
    return {
      success: false,
      citations: [],
      modelName: 'none',
      modelVersion: 'none',
      promptVersion: 'none',
      error: 'AI provider is not configured. Set AI_PROVIDER and enable AI_FEATURE_CITATION_SUGGESTIONS_ENABLED to use citation generation.',
    };
  }
}
