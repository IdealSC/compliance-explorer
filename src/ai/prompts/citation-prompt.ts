/**
 * Citation Prompt — Phase 3.8.
 *
 * Hardcoded v1.0.0 citation-only prompt for AI provider integration.
 * This is the ONLY approved prompt. It governs all citation extraction.
 *
 * GOVERNANCE:
 * - System instruction: "regulatory document analyst, not legal advisor"
 * - Citation extraction only — no obligations, interpretations, or legal advice
 * - Structured JSON output with source support
 * - Confidence score required per citation
 * - Empty citations array if none found (no hallucination)
 * - Version-tracked for audit provenance
 *
 * Future phases may introduce a prompt management UI. Until then,
 * prompt changes require code review and deployment.
 */
import type { CitationSuggestionInput } from '../providers/types';

// ── Prompt Version Metadata ─────────────────────────────────────

export const CITATION_PROMPT_VERSION = 'citation-v1.0.0';

export const CITATION_PROMPT_METADATA = {
  promptVersion: CITATION_PROMPT_VERSION,
  promptName: 'Citation Extraction — Regulatory Documents',
  promptStatus: 'approved' as const,
  approvedBy: 'system-governance',
  approvedAt: '2026-05-07T00:00:00Z',
  description:
    'Extracts candidate citation references from regulatory source text. ' +
    'Returns structured JSON with source support and confidence scores. ' +
    'Does not create obligations, interpretations, or legal advice.',
};

// ── System Prompt ───────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a regulatory document analyst assisting with citation extraction.

You are NOT a legal advisor. You do NOT provide legal advice, compliance certifications, or binding interpretations.

Your task is to extract candidate citation references from the provided regulatory source text. A citation is a reference to a specific section, clause, paragraph, or provision within a regulatory document.

RULES:
1. Extract ONLY citations that are explicitly supported by the provided source text.
2. Do NOT infer, create, or hallucinate citations not present in the text.
3. Do NOT extract obligations, requirements, duties, or mandates. Only extract references.
4. Do NOT provide interpretations or plain-English summaries of legal meaning.
5. Do NOT provide legal advice or compliance recommendations.
6. Include the exact source excerpt that supports each citation.
7. Provide a confidence score (0.0–1.0) for each citation.
8. If no citations are found in the text, return an empty citations array.
9. Respond ONLY with valid JSON matching the specified schema.

OUTPUT JSON SCHEMA:
{
  "citations": [
    {
      "suggestedCitation": "string — the citation reference (e.g., '21 CFR 211.68(a)')",
      "sourceExcerpt": "string — verbatim text from the source that supports this citation",
      "sourceLocation": "string | null — section, page, or paragraph location if identifiable",
      "confidenceScore": "number — 0.0 to 1.0",
      "confidenceExplanation": "string | null — brief explanation of confidence level",
      "notes": "string | null — any relevant context (not interpretation or advice)"
    }
  ]
}`;

// ── Message Builder ─────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

/**
 * Build the prompt messages for citation extraction.
 * Combines the governed system prompt with the user-provided source text.
 */
export function buildCitationMessages(input: CitationSuggestionInput): ChatMessage[] {
  const contextParts: string[] = [];

  if (input.sourceTitle) contextParts.push(`Source Title: ${input.sourceTitle}`);
  if (input.regulator) contextParts.push(`Regulator: ${input.regulator}`);
  if (input.jurisdiction) contextParts.push(`Jurisdiction: ${input.jurisdiction}`);
  if (input.sourceReference) contextParts.push(`Source Reference: ${input.sourceReference}`);
  if (input.sourceLocation) contextParts.push(`Section/Location: ${input.sourceLocation}`);

  const maxSuggestions = input.maxSuggestions ?? 10;

  const userContent = [
    contextParts.length > 0 ? `CONTEXT:\n${contextParts.join('\n')}` : '',
    `Return at most ${maxSuggestions} citation suggestions.`,
    '',
    'SOURCE TEXT:',
    '---',
    input.sourceExcerpt,
    '---',
    '',
    'Extract candidate citations from the source text above. Respond with valid JSON only.',
  ]
    .filter(Boolean)
    .join('\n');

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

/**
 * Get the prompt version record for audit provenance.
 * Returns metadata suitable for insertion into aiPromptVersions or audit events.
 */
export function getCitationPromptVersion() {
  return { ...CITATION_PROMPT_METADATA };
}
