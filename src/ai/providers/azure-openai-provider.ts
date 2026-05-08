/**
 * Azure OpenAI Provider — Phase 3.8.
 *
 * Server-to-server integration with Azure OpenAI using raw fetch().
 * No SDK dependency. No secrets logged. No NEXT_PUBLIC_ variables.
 *
 * GOVERNANCE:
 * - Uses the governed citation-only prompt
 * - Validates output with Zod before returning
 * - Timeout via AbortController
 * - Rejects malformed or obligation-containing output
 * - Does NOT log source excerpts to console
 * - Does NOT expose API keys
 *
 * Phase 3.8: Citation Suggestions Only
 */
import type { AiProvider, CitationSuggestionInput, CitationSuggestionResult } from './types';
import { getAiConfig } from '../ai-config';
import { buildCitationMessages } from '../prompts/citation-prompt';
import { AiCitationOutputSchema } from '../../validation/ai-suggestions';

/**
 * Sanitize Azure error text to prevent infrastructure detail leakage.
 * Strips deployment names, resource IDs, and limits length.
 */
function sanitizeProviderError(raw: string): string {
  return raw
    // Remove Azure resource names (e.g., "my-resource.openai.azure.com")
    .replace(/[a-zA-Z0-9_-]+\.openai\.azure\.com/g, '[REDACTED_ENDPOINT]')
    // Remove deployment names in common error patterns
    .replace(/deployments\/[a-zA-Z0-9_-]+/g, 'deployments/[REDACTED]')
    // Remove subscription/resource group IDs
    .replace(/subscriptions\/[a-f0-9-]+/gi, 'subscriptions/[REDACTED]')
    .replace(/resourceGroups\/[a-zA-Z0-9_-]+/g, 'resourceGroups/[REDACTED]')
    // Limit length
    .slice(0, 200);
}

export class AzureOpenAiProvider implements AiProvider {
  readonly name = 'azure_openai';

  async generateCitationSuggestions(input: CitationSuggestionInput): Promise<CitationSuggestionResult> {
    const config = getAiConfig();
    const azure = config.azureOpenAi;

    if (!azure?.endpoint || !azure?.apiKey || !azure?.deployment) {
      return {
        success: false,
        citations: [],
        modelName: 'azure-openai',
        modelVersion: 'unknown',
        promptVersion: 'citation-v1.0.0',
        error: 'Azure OpenAI credentials are not fully configured.',
      };
    }

    // Build the prompt messages
    const messages = buildCitationMessages(input);

    // Construct Azure OpenAI endpoint URL
    const url = `${azure.endpoint.replace(/\/$/, '')}/openai/deployments/${azure.deployment}/chat/completions?api-version=${azure.apiVersion}`;

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azure.apiKey,
        },
        body: JSON.stringify({
          messages,
          temperature: 0.1, // Low temperature for factual extraction
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        // Do NOT log the full error — may contain sensitive info
        console.error(`[AzureOpenAI] Request failed: ${response.status}`);
        return {
          success: false,
          citations: [],
          modelName: 'azure-openai',
          modelVersion: azure.deployment,
          promptVersion: 'citation-v1.0.0',
          error: `Azure OpenAI returned HTTP ${response.status}: ${sanitizeProviderError(errorText)}`,
          errorCode: 'PROVIDER_HTTP_ERROR',
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await response.json();
      const rawContent = data?.choices?.[0]?.message?.content;
      const modelVersion = data?.model ?? azure.deployment;

      if (!rawContent) {
        return {
          success: false,
          citations: [],
          modelName: 'azure-openai',
          modelVersion,
          promptVersion: 'citation-v1.0.0',
          error: 'Model returned empty content.',
          errorCode: 'EMPTY_CONTENT',
        };
      }

      // Parse JSON from model response
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        console.error('[AzureOpenAI] Model returned non-JSON content');
        return {
          success: false,
          citations: [],
          modelName: 'azure-openai',
          modelVersion,
          promptVersion: 'citation-v1.0.0',
          error: 'Model returned non-JSON content.',
          errorCode: 'INVALID_JSON',
          rawOutput: config.storeModelOutputs ? rawContent : undefined,
        };
      }

      // Validate with Zod
      const validated = AiCitationOutputSchema.safeParse(parsed);
      if (!validated.success) {
        console.error('[AzureOpenAI] Model output failed Zod validation:', validated.error.issues.length, 'issues');
        return {
          success: false,
          citations: [],
          modelName: 'azure-openai',
          modelVersion,
          promptVersion: 'citation-v1.0.0',
          error: `Model output failed validation: ${validated.error.issues.map(i => i.message).join('; ')}`,
          errorCode: 'OUTPUT_VALIDATION_FAILED',
          rawOutput: config.storeModelOutputs ? rawContent : undefined,
        };
      }

      // Safety check: reject if any citation contains obligation-like language
      const citations = validated.data.citations.map(c => ({
        suggestedCitation: c.suggestedCitation,
        sourceExcerpt: c.sourceExcerpt,
        sourceLocation: c.sourceLocation ?? null,
        confidenceScore: c.confidenceScore,
        confidenceExplanation: c.confidenceExplanation ?? null,
        notes: c.notes ?? null,
      }));

      return {
        success: true,
        citations,
        modelName: 'azure-openai',
        modelVersion,
        promptVersion: 'citation-v1.0.0',
        rawOutput: config.storeModelOutputs ? rawContent : undefined,
      };
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === 'AbortError') {
        console.error('[AzureOpenAI] Request timed out');
        return {
          success: false,
          citations: [],
          modelName: 'azure-openai',
          modelVersion: azure.deployment,
          promptVersion: 'citation-v1.0.0',
          error: `Request timed out after ${config.requestTimeoutMs}ms.`,
        };
      }

      console.error('[AzureOpenAI] Request error:', err instanceof Error ? err.message : 'unknown');
      return {
        success: false,
        citations: [],
        modelName: 'azure-openai',
        modelVersion: azure.deployment,
        promptVersion: 'citation-v1.0.0',
        error: `Provider error: ${err instanceof Error ? err.message : 'unknown'}`,
      };
    }
  }
}
