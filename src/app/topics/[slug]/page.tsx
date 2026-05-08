import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TopicPageLayout } from '@/components/topic';

/* ─── Approved topic inventory (TOPIC_PAGE_TEMPLATE.md §10) ──────── */

const TOPIC_INVENTORY: {
  slug: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
}[] = [
  { slug: 'packaging', title: 'Packaging', priority: 'high' },
  { slug: 'labeling-artwork', title: 'Labeling & Artwork', priority: 'high' },
  { slug: 'serialization', title: 'Serialization', priority: 'high' },
  {
    slug: 'importation-plair',
    title: 'Importation / PLAIR',
    priority: 'high',
  },
  { slug: 'cold-chain', title: 'Cold Chain', priority: 'high' },
  {
    slug: 'distribution-3pls',
    title: 'Distribution & 3PLs',
    priority: 'high',
  },
  { slug: 'returns', title: 'Returns', priority: 'medium' },
  { slug: 'recalls', title: 'Recalls', priority: 'medium' },
  { slug: 'shortages', title: 'Shortages', priority: 'medium' },
  {
    slug: 'outsourced-manufacturing',
    title: 'Outsourced Manufacturing',
    priority: 'medium',
  },
  {
    slug: 'release-disposition-handoffs',
    title: 'Release & Disposition Handoffs',
    priority: 'medium',
  },
  {
    slug: 'child-resistant-special-packaging',
    title: 'Child-Resistant / Special Packaging',
    priority: 'low',
  },
  {
    slug: 'controlled-temperature-transport',
    title: 'Controlled Temperature Transport',
    priority: 'low',
  },
  {
    slug: 'importer-distributor-responsibilities',
    title: 'Importer / Distributor Responsibilities',
    priority: 'low',
  },
];

/* ─── Metadata ────────────────────────────────────────────────────── */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = TOPIC_INVENTORY.find((t) => t.slug === slug);
  if (!topic) return { title: 'Topic Not Found — ISC Compliance Explorer' };
  return {
    title: `${topic.title} — ISC Compliance Explorer`,
    description: `Regulatory orientation for ${topic.title} — ownership, applicability, regulatory chain, and connected topics.`,
  };
}

export async function generateStaticParams() {
  return TOPIC_INVENTORY.map((t) => ({ slug: t.slug }));
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = TOPIC_INVENTORY.find((t) => t.slug === slug);
  if (!topic) notFound();

  return (
    <TopicPageLayout
      slug={topic.slug}
      title={topic.title}
      summary="This page is being aligned to the approved topic page template."
      ownershipPosture="Template placeholder — ownership content requires approved topic content."
      primaryHandoff="Template placeholder — handoff content requires approved topic content."
      sourceCue="Source-backed orientation · references require approved topic content"
      content={{}}
    />
  );
}
