import Link from 'next/link';
import {
  Globe,
  Building2,
  Clock,
  ChevronRight,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

import type {
  TopicPageProps,
  WhatThisIsContent,
  OwnershipBoundariesContent,
  ApplicabilityContent,
  RegulatoryChainContent,
  WhatItTouchesNextContent,
} from './types';

/* ─── Section anchor definitions ──────────────────────────────────── */

const SECTIONS = [
  { id: 'what-this-is', label: 'What this is' },
  { id: 'ownership-boundaries', label: 'Ownership boundaries' },
  { id: 'applicability', label: 'Applicability' },
  { id: 'regulatory-chain', label: 'Regulatory chain' },
  { id: 'what-it-touches-next', label: 'What it touches next' },
] as const;

/* ─── Placeholder helpers ─────────────────────────────────────────── */

function PlaceholderNotice({ section }: { section: string }) {
  return (
    <div className="topic-placeholder">
      <p className="topic-placeholder-text">
        Template placeholder — {section} content requires approved topic
        content.
      </p>
    </div>
  );
}

/* ─── Section 1: What this is ─────────────────────────────────────── */

function SectionWhatThisIs({ data }: { data?: WhatThisIsContent }) {
  if (!data) return <PlaceholderNotice section="what-this-is" />;

  return (
    <div className="topic-section-body">
      <p className="topic-lead-paragraph">{data.leadParagraph}</p>

      {data.keyTerms.length > 0 && (
        <div className="topic-key-terms">
          <h4 className="topic-key-terms-label">Key terms</h4>
          <dl className="topic-key-terms-list">
            {data.keyTerms.map(({ term, definition }) => (
              <div key={term} className="topic-key-term">
                <dt className="topic-key-term-name">{term}</dt>
                <dd className="topic-key-term-def">{definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <p className="topic-sc-relevance">
        <span className="topic-sc-relevance-label">
          Why this matters for supply chain:
        </span>{' '}
        {data.supplyChainRelevance}
      </p>
    </div>
  );
}

/* ─── Section 2: Ownership boundaries ─────────────────────────────── */

function SectionOwnershipBoundaries({
  data,
}: {
  data?: OwnershipBoundariesContent;
}) {
  if (!data) return <PlaceholderNotice section="ownership boundaries" />;

  return (
    <div className="topic-section-body">
      {/* 3-column table */}
      <div className="topic-ownership-table-wrap">
        <table className="topic-ownership-table">
          <thead>
            <tr>
              <th>Supply Chain Owns</th>
              <th>Adjacent / Shared</th>
              <th>Other Function Owns</th>
            </tr>
          </thead>
          <tbody>
            {data.table.map((row, i) => (
              <tr key={i}>
                <td>{row.supplyChainOwns}</td>
                <td>{row.adjacentShared}</td>
                <td>{row.otherFunctionOwns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Handoff callouts */}
      {data.handoffs.length > 0 && (
        <div className="topic-handoffs">
          <h4 className="topic-subsection-label">Key handoffs</h4>
          <ul className="topic-handoff-list">
            {data.handoffs.map((h, i) => (
              <li key={i} className="topic-handoff-item">
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common blindspot */}
      {data.commonBlindspot && (
        <div className="topic-blindspot">
          <h4 className="topic-subsection-label">Common blindspot</h4>
          <p className="topic-blindspot-text">{data.commonBlindspot}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Section 3: Applicability ────────────────────────────────────── */

function SectionApplicability({ data }: { data?: ApplicabilityContent }) {
  if (!data) return <PlaceholderNotice section="applicability" />;

  return (
    <div className="topic-section-body">
      {/* Context reminder */}
      <div className="topic-context-reminder">
        <span className="topic-context-reminder-label">
          Your current context:
        </span>
        <div className="topic-context-reminder-chips">
          <span className="topic-context-chip">
            <Globe className="topic-chip-icon" aria-hidden="true" />
            US + EU
          </span>
          <span className="topic-context-chip">
            <Building2 className="topic-chip-icon" aria-hidden="true" />
            NDA Holder
          </span>
          <span className="topic-context-chip">
            <Clock className="topic-chip-icon" aria-hidden="true" />
            Pre-commercial
          </span>
        </div>
      </div>

      {/* Jurisdiction comparison */}
      <div className="topic-jurisdiction">
        <h4 className="topic-subsection-label">By jurisdiction</h4>
        <div className="topic-jurisdiction-table-wrap">
          <table className="topic-jurisdiction-table">
            <thead>
              <tr>
                <th>US</th>
                <th>EU</th>
              </tr>
            </thead>
            <tbody>
              {data.jurisdictionUS.map((us, i) => (
                <tr key={i}>
                  <td>{us}</td>
                  <td>{data.jurisdictionEU[i] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entity roles */}
      {data.entityRoles.length > 0 && (
        <div className="topic-entity-roles">
          <h4 className="topic-subsection-label">By entity role</h4>
          <ul className="topic-role-list">
            {data.entityRoles.map(({ role, description }) => (
              <li key={role} className="topic-role-item">
                <span className="topic-role-name">{role}:</span>{' '}
                {description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lifecycle stages */}
      {data.lifecycleStages.length > 0 && (
        <div className="topic-lifecycle">
          <h4 className="topic-subsection-label">By lifecycle stage</h4>
          <ul className="topic-lifecycle-list">
            {data.lifecycleStages.map(({ stage, description }) => (
              <li key={stage} className="topic-lifecycle-item">
                <span className="topic-lifecycle-name">{stage}:</span>{' '}
                {description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Context highlight */}
      {data.contextHighlight && (
        <div className="topic-context-highlight">
          <p className="topic-context-highlight-text">
            {data.contextHighlight}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Section 4: Regulatory chain ─────────────────────────────────── */

function SectionRegulatoryChain({
  data,
}: {
  data?: RegulatoryChainContent;
}) {
  if (!data) return <PlaceholderNotice section="regulatory chain" />;

  return (
    <div className="topic-section-body">
      {/* Source chain visualization */}
      {data.chain.length > 0 && (
        <div className="topic-source-chain">
          <h4 className="topic-subsection-label">Source chain</h4>
          <div className="topic-chain-levels">
            {data.chain.map(({ level, description }, i) => (
              <div
                key={level}
                className="topic-chain-level"
                style={{ paddingLeft: `${i * 1.25}rem` }}
              >
                <span className="topic-chain-level-name">{level}</span>
                <span className="topic-chain-level-desc">
                  ({description})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key sources table */}
      {data.keySources.length > 0 && (
        <div className="topic-key-sources">
          <h4 className="topic-subsection-label">Key sources</h4>
          <div className="topic-sources-table-wrap">
            <table className="topic-sources-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Relevance</th>
                </tr>
              </thead>
              <tbody>
                {data.keySources.map(({ source, type, relevance }) => (
                  <tr key={source}>
                    <td>{source}</td>
                    <td>
                      <span className="topic-source-type-badge">{type}</span>
                    </td>
                    <td>{relevance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confidence note */}
      {data.confidenceNote && (
        <p className="topic-confidence-note">{data.confidenceNote}</p>
      )}

      <Link href="/sources" className="topic-inline-link">
        View full source details in Sources &amp; Standards
        <ExternalLink className="topic-inline-link-icon" aria-hidden="true" />
      </Link>
    </div>
  );
}

/* ─── Section 5: What it touches next ─────────────────────────────── */

function SectionWhatItTouchesNext({
  data,
}: {
  data?: WhatItTouchesNextContent;
}) {
  if (!data) return <PlaceholderNotice section="connected topics" />;

  return (
    <div className="topic-section-body">
      {/* Connected topics */}
      {data.connectedTopics.length > 0 && (
        <div className="topic-connected">
          <h4 className="topic-subsection-label">Connected topics</h4>
          <div className="topic-connected-grid">
            {data.connectedTopics.map(
              ({ topicName, slug, connectionReason }) => (
                <Link
                  key={slug}
                  href={`/topics/${slug}`}
                  className="topic-connected-card"
                >
                  <span className="topic-connected-name">{topicName}</span>
                  <span className="topic-connected-reason">
                    {connectionReason}
                  </span>
                  <ChevronRight
                    className="topic-connected-arrow"
                    aria-hidden="true"
                  />
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {/* Ownership handoffs */}
      {data.handoffs.length > 0 && (
        <div className="topic-handoff-section">
          <h4 className="topic-subsection-label">Ownership handoffs</h4>
          <ul className="topic-handoff-transfer-list">
            {data.handoffs.map((h, i) => (
              <li key={i} className="topic-handoff-transfer">
                <span className="topic-handoff-from">{h.from}</span>
                <ArrowRight
                  className="topic-handoff-arrow"
                  aria-hidden="true"
                />
                <span className="topic-handoff-to">{h.to}</span>
                <span className="topic-handoff-desc">{h.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What to ask next */}
      {data.askNextPrompts.length > 0 && (
        <div className="topic-ask-next">
          <h4 className="topic-subsection-label">What to ask next</h4>
          <ul className="topic-ask-list">
            {data.askNextPrompts.map((prompt, i) => (
              <li key={i} className="topic-ask-prompt">
                &ldquo;{prompt}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Main Layout Component ───────────────────────────────────────── */

export function TopicPageLayout({
  slug,
  title,
  summary,
  ownershipPosture,
  primaryHandoff,
  sourceCue,
  content,
}: TopicPageProps) {
  return (
    <article className="topic-page">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="topic-header">
        {/* Breadcrumb */}
        <nav className="topic-breadcrumb" aria-label="Breadcrumb">
          <Link href="/topics" className="topic-breadcrumb-link">
            Topics
          </Link>
          <ChevronRight
            className="topic-breadcrumb-sep"
            aria-hidden="true"
          />
          <span className="topic-breadcrumb-current">{title}</span>
        </nav>

        {/* Title + summary */}
        <h1 className="topic-title">{title}</h1>
        <p className="topic-summary">{summary}</p>

        {/* Context chips */}
        <div className="topic-context-chips">
          <span className="topic-context-chip">
            <Globe className="topic-chip-icon" aria-hidden="true" />
            US + EU
          </span>
          <span className="topic-context-chip">
            <Building2 className="topic-chip-icon" aria-hidden="true" />
            NDA Holder
          </span>
          <span className="topic-context-chip">
            <Clock className="topic-chip-icon" aria-hidden="true" />
            Pre-commercial
          </span>
        </div>

        {/* Ownership posture + handoff + source cue */}
        <div className="topic-header-meta">
          <div className="topic-header-meta-item">
            <span className="topic-header-meta-label">
              Ownership posture
            </span>
            <p className="topic-header-meta-value">{ownershipPosture}</p>
          </div>
          <div className="topic-header-meta-item">
            <span className="topic-header-meta-label">
              Most important handoff
            </span>
            <p className="topic-header-meta-value">{primaryHandoff}</p>
          </div>
          <div className="topic-header-meta-item">
            <span className="topic-header-meta-label">Source cue</span>
            <p className="topic-header-meta-value">{sourceCue}</p>
          </div>
        </div>

        {/* Section anchors */}
        <nav className="topic-anchors" aria-label="Page sections">
          {SECTIONS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className="topic-anchor-link">
              {label}
            </a>
          ))}
        </nav>
      </header>

      {/* ── Sections ────────────────────────────────────────────── */}
      <section id="what-this-is" className="topic-section">
        <h2 className="topic-section-title">What this is</h2>
        <SectionWhatThisIs data={content.whatThisIs} />
      </section>

      <section id="ownership-boundaries" className="topic-section">
        <h2 className="topic-section-title">Ownership boundaries</h2>
        <SectionOwnershipBoundaries data={content.ownershipBoundaries} />
      </section>

      <section id="applicability" className="topic-section">
        <h2 className="topic-section-title">Applicability</h2>
        <SectionApplicability data={content.applicability} />
      </section>

      <section id="regulatory-chain" className="topic-section">
        <h2 className="topic-section-title">Regulatory chain</h2>
        <SectionRegulatoryChain data={content.regulatoryChain} />
      </section>

      <section id="what-it-touches-next" className="topic-section">
        <h2 className="topic-section-title">What it touches next</h2>
        <SectionWhatItTouchesNext data={content.whatItTouchesNext} />
      </section>
    </article>
  );
}
