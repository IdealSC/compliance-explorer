/* ─── Topic Page Template — Type Definitions ─────────────────────────
   Phase 5.1-C: Reusable type interfaces for the 5-section topic page
   structure defined in TOPIC_PAGE_TEMPLATE.md.
   Phase 5.1-D: Extended with optional fields for richer approved content.
   ──────────────────────────────────────────────────────────────────── */

/** A key term with inline definition (Section 1). */
export interface KeyTerm {
  term: string;
  definition: string;
}

/** Section 1 — What this is. */
export interface WhatThisIsContent {
  /** 2–3 sentence lead paragraph. */
  leadParagraph: string;
  /** 3–5 key terms the reader may not know. */
  keyTerms: KeyTerm[];
  /** One sentence connecting the topic to supply chain execution. */
  supplyChainRelevance: string;
}

/** A single row in the 3-column ownership table (Section 2). */
export interface OwnershipRow {
  supplyChainOwns: string;
  adjacentShared: string;
  otherFunctionOwns: string;
}

/** A structured handoff with context (Section 2). */
export interface HandoffDetail {
  handoff: string;
  whyItMatters: string;
  typicalOwner: string;
}

/** Decision rights breakdown (Section 2). */
export interface DecisionRights {
  leads: string[];
  influences: string[];
  doesNotOwn: string[];
}

/** Section 2 — Ownership boundaries. */
export interface OwnershipBoundariesContent {
  /** 3-column table rows: Owns / Adjacent / Other. */
  table: OwnershipRow[];
  /** 2–3 specific handoff callouts (simple text). */
  handoffs: string[];
  /** Structured handoff details with context. */
  handoffDetails?: HandoffDetail[];
  /** Decision rights breakdown. */
  decisionRights?: DecisionRights;
  /** One common misunderstanding about who owns what. */
  commonBlindspot: string;
}

/** Section 3 — How applicability changes it. */
export interface ApplicabilityContent {
  /** Introductory paragraph for US jurisdiction. */
  jurisdictionUSIntro?: string;
  /** US-specific attention items. */
  jurisdictionUS: string[];
  /** Introductory paragraph for EU jurisdiction. */
  jurisdictionEUIntro?: string;
  /** EU-specific attention items. */
  jurisdictionEU: string[];
  /** Items that stay consistent across jurisdictions. */
  jurisdictionConsistent?: string[];
  /** Entity role impact descriptions (role → description + optional focus areas). */
  entityRoles: { role: string; description: string; focusAreas?: string }[];
  /** Lifecycle stage impact descriptions (stage → description + optional focus areas). */
  lifecycleStages: { stage: string; description: string; focusAreas?: string }[];
  /** Context-specific highlight based on current selection. */
  contextHighlight?: string;
}

/** A key source in the regulatory chain (Section 4). */
export interface KeySource {
  source: string;
  type: string;
  /** Jurisdiction (e.g. "US", "EU", "Global"). */
  jurisdiction?: string;
  relevance: string;
}

/** Section 4 — Where it sits in the regulatory chain. */
export interface RegulatoryChainContent {
  /** Plain-language framing paragraph. */
  plainLanguageFraming?: string;
  /** Source chain levels: Law → Regulation → Standard → Guidance. */
  chain: { level: string; description: string }[];
  /** Key sources with optional jurisdiction. */
  keySources: KeySource[];
  /** Advisory note about source completeness. */
  confidenceNote: string;
}

/** A connected topic link (Section 5). */
export interface ConnectedTopic {
  topicName: string;
  slug: string;
  connectionReason: string;
}

/** An ownership handoff between functions (Section 5). */
export interface OwnershipHandoff {
  from: string;
  to: string;
  description: string;
}

/** Section 5 — What it touches next. */
export interface WhatItTouchesNextContent {
  /** 3–5 related topic pages with one-sentence connection. */
  connectedTopics: ConnectedTopic[];
  /** 2–3 cross-functional handoff descriptions. */
  handoffs: OwnershipHandoff[];
  /** Common pitfalls — operational orientation callouts. */
  commonPitfalls?: string[];
  /** 2–3 "what to ask next" question prompts. */
  askNextPrompts: string[];
}

/** Full content payload for a topic page. */
export interface TopicPageContent {
  whatThisIs?: WhatThisIsContent;
  ownershipBoundaries?: OwnershipBoundariesContent;
  applicability?: ApplicabilityContent;
  regulatoryChain?: RegulatoryChainContent;
  whatItTouchesNext?: WhatItTouchesNextContent;
}

/** Top-level topic page props consumed by TopicPageLayout. */
export interface TopicPageProps {
  /** URL slug (e.g. "packaging"). */
  slug: string;
  /** Display title (e.g. "Packaging"). */
  title: string;
  /** One-sentence plain-language summary. */
  summary: string;
  /** Advisory ownership posture sentence. */
  ownershipPosture: string;
  /** Most important cross-functional handoff. */
  primaryHandoff: string;
  /** Source cue line (e.g. "Source-backed orientation · FDA / EMA…"). */
  sourceCue: string;
  /** Section content — all optional for incremental population. */
  content: TopicPageContent;
}
