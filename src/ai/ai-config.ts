/**
 * AI Configuration — Server-side only.
 *
 * Reads AI-related environment variables and provides typed accessors.
 * All AI features are DISABLED by default. Both AI_PROVIDER and
 * AI_FEATURE_CITATION_SUGGESTIONS_ENABLED must be explicitly set.
 *
 * GOVERNANCE:
 * - No NEXT_PUBLIC_ AI variables — secrets never reach the client bundle
 * - Default posture: AI_PROVIDER=none, all features disabled
 * - Provider credentials are validated only when features are enabled
 *
 * Phase 3.8: Controlled AI Provider Integration — Citation Suggestions Only
 */

// ── Provider Types ──────────────────────────────────────────────

export type AiProviderType = 'none' | 'azure_openai';

const VALID_PROVIDERS: AiProviderType[] = ['none', 'azure_openai'];

// ── Configuration Interface ─────────────────────────────────────

export interface AiConfig {
  // Provider
  provider: AiProviderType;

  // Feature flags
  citationSuggestionsEnabled: boolean;

  // Limits
  maxSourceChars: number;
  requestTimeoutMs: number;

  // Privacy
  storePromptInputs: boolean;
  storeModelOutputs: boolean;

  // Source governance
  requireSourceRecordValidated: boolean;

  // Azure OpenAI (only when provider = azure_openai)
  azureOpenAi: {
    endpoint: string;
    apiKey: string;
    deployment: string;
    apiVersion: string;
  } | null;
}

// ── Config Accessor ─────────────────────────────────────────────

let _cachedConfig: AiConfig | null = null;

/**
 * Get the current AI configuration.
 * Reads from environment variables on first access, then caches.
 */
export function getAiConfig(): AiConfig {
  if (_cachedConfig) return _cachedConfig;

  const rawProvider = (process.env.AI_PROVIDER ?? 'none').toLowerCase();
  const provider: AiProviderType = VALID_PROVIDERS.includes(rawProvider as AiProviderType)
    ? (rawProvider as AiProviderType)
    : 'none';

  const citationSuggestionsEnabled = process.env.AI_FEATURE_CITATION_SUGGESTIONS_ENABLED === 'true';
  const maxSourceChars = parseInt(process.env.AI_MAX_SOURCE_CHARS ?? '12000', 10) || 12000;
  const requestTimeoutMs = parseInt(process.env.AI_REQUEST_TIMEOUT_MS ?? '30000', 10) || 30000;
  const storePromptInputs = process.env.AI_STORE_PROMPT_INPUTS === 'true';
  const storeModelOutputs = process.env.AI_STORE_MODEL_OUTPUTS !== 'false'; // default true
  const requireSourceRecordValidated = process.env.AI_REQUIRE_SOURCE_RECORD_VALIDATED !== 'false'; // default true

  // Azure OpenAI credentials (only populated when provider matches)
  let azureOpenAi: AiConfig['azureOpenAi'] = null;
  if (provider === 'azure_openai') {
    azureOpenAi = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT ?? '',
      apiKey: process.env.AZURE_OPENAI_API_KEY ?? '',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? '',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2024-02-01',
    };
  }

  _cachedConfig = {
    provider,
    citationSuggestionsEnabled,
    maxSourceChars,
    requestTimeoutMs,
    storePromptInputs,
    storeModelOutputs,
    requireSourceRecordValidated,
    azureOpenAi,
  };

  return _cachedConfig;
}

// ── Convenience Accessors ───────────────────────────────────────

/** Is any AI feature enabled? */
export function isAiEnabled(): boolean {
  const config = getAiConfig();
  return config.citationSuggestionsEnabled && config.provider !== 'none';
}

/** Is citation suggestion generation available? */
export function isCitationSuggestionsEnabled(): boolean {
  const config = getAiConfig();
  return config.citationSuggestionsEnabled && config.provider !== 'none';
}

/** Is a real AI provider configured (not noop)? */
export function isProviderConfigured(): boolean {
  const config = getAiConfig();
  if (config.provider === 'none') return false;
  if (config.provider === 'azure_openai') {
    return !!(config.azureOpenAi?.endpoint && config.azureOpenAi?.apiKey && config.azureOpenAi?.deployment);
  }
  return false;
}

/** Get the provider type string */
export function getAiProviderType(): AiProviderType {
  return getAiConfig().provider;
}

/**
 * Reset cached config — for testing only.
 * @internal
 */
export function _resetAiConfigCache(): void {
  _cachedConfig = null;
}
