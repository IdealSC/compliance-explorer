import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Topics — ISC Compliance Explorer',
  description:
    'Look up a regulatory topic and understand what it means for supply chain.',
};

/* ─── Approved topic inventory (TOPIC_PAGE_TEMPLATE.md §10) ──────── */

const topics = [
  { slug: 'packaging', title: 'Packaging', priority: 'high' as const },
  {
    slug: 'labeling-artwork',
    title: 'Labeling & Artwork',
    priority: 'high' as const,
  },
  {
    slug: 'serialization',
    title: 'Serialization',
    priority: 'high' as const,
  },
  {
    slug: 'importation-plair',
    title: 'Importation / PLAIR',
    priority: 'high' as const,
  },
  { slug: 'cold-chain', title: 'Cold Chain', priority: 'high' as const },
  {
    slug: 'distribution-3pls',
    title: 'Distribution & 3PLs',
    priority: 'high' as const,
  },
  { slug: 'returns', title: 'Returns', priority: 'medium' as const },
  { slug: 'recalls', title: 'Recalls', priority: 'medium' as const },
  { slug: 'shortages', title: 'Shortages', priority: 'medium' as const },
  {
    slug: 'outsourced-manufacturing',
    title: 'Outsourced Manufacturing',
    priority: 'medium' as const,
  },
  {
    slug: 'release-disposition-handoffs',
    title: 'Release & Disposition Handoffs',
    priority: 'medium' as const,
  },
  {
    slug: 'child-resistant-special-packaging',
    title: 'Child-Resistant / Special Packaging',
    priority: 'low' as const,
  },
  {
    slug: 'controlled-temperature-transport',
    title: 'Controlled Temperature Transport',
    priority: 'low' as const,
  },
  {
    slug: 'importer-distributor-responsibilities',
    title: 'Importer / Distributor Responsibilities',
    priority: 'low' as const,
  },
];

/* ─── Page ────────────────────────────────────────────────────────── */

export default function TopicsPage() {
  return (
    <div className="topic-page">
      {/* Header */}
      <header className="topic-header">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              background: 'var(--topic-accent-light)',
            }}
          >
            <BookOpen
              style={{
                width: '1.25rem',
                height: '1.25rem',
                color: 'var(--topic-accent)',
              }}
              aria-hidden="true"
            />
          </div>
          <h1 className="topic-title" style={{ marginBottom: 0 }}>
            Topics
          </h1>
        </div>
        <p className="topic-summary">
          Look up a regulatory topic and understand what it means for supply
          chain. Each topic page follows a consistent five-section structure:
          what the topic is, who owns what, how applicability changes it, where
          it sits in the regulatory chain, and what it connects to next.
        </p>
      </header>

      {/* Topic grid */}
      <div className="topic-connected-grid" style={{ marginTop: '0.5rem' }}>
        {topics.map(({ slug, title }) => (
          <Link
            key={slug}
            href={`/topics/${slug}`}
            className="topic-connected-card"
          >
            <span className="topic-connected-name">{title}</span>
            <span className="topic-connected-reason">
              Five-section topic orientation page
            </span>
            <ChevronRight
              className="topic-connected-arrow"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
