/**
 * Provider Router — Phase 3.8.
 *
 * Factory function that returns the correct AiProvider instance
 * based on the AI_PROVIDER environment variable.
 *
 * Unknown or unconfigured providers always fall back to NoopProvider.
 */
import type { AiProvider } from './providers/types';
import { getAiProviderType } from './ai-config';
import { NoopProvider } from './providers/noop-provider';
import { AzureOpenAiProvider } from './providers/azure-openai-provider';

let _cachedProvider: AiProvider | null = null;

/**
 * Get the active AI provider instance.
 * Returns NoopProvider if AI_PROVIDER is 'none' or unrecognized.
 */
export function getAiProvider(): AiProvider {
  if (_cachedProvider) return _cachedProvider;

  const providerType = getAiProviderType();

  switch (providerType) {
    case 'azure_openai':
      _cachedProvider = new AzureOpenAiProvider();
      break;
    case 'none':
    default:
      _cachedProvider = new NoopProvider();
      break;
  }

  return _cachedProvider;
}

/**
 * Reset cached provider — for testing only.
 * @internal
 */
export function _resetProviderCache(): void {
  _cachedProvider = null;
}
