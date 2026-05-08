import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TopicPageLayout } from '@/components/topic';
import type { TopicPageContent } from '@/components/topic';

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

/* ─── Packaging Content (TOPIC_PACKAGING.md) ─────────────────────── */

const PACKAGING_CONTENT: TopicPageContent = {
  /* ── Section 1: What this is ─────────────────────────────────────── */
  whatThisIs: {
    leadParagraph:
      'Packaging is more than a box, bottle, blister, carton, vial tray, shipper, or label surface. In a regulated biopharma supply chain, packaging is the physical system that protects the product, supports product identification, carries approved labeling, enables distribution, and helps maintain product quality through storage and handling. It connects product presentation, component supply, artwork readiness, serialization, temperature protection, manufacturing execution, and distribution.\n\nFor senior supply chain leaders, packaging matters because it often becomes a critical-path dependency. Packaging components must be sourced, qualified, available, version-controlled, and coordinated with manufacturing, Quality, Regulatory, artwork, and distribution requirements. A packaging change can affect supplier readiness, regulatory filings, quality documentation, line trials, serialization, stability assumptions, distribution lanes, and 3PL execution.',
    keyTerms: [
      {
        term: 'Primary packaging',
        definition:
          'Packaging that directly contacts the product, such as a vial, syringe, bottle, stopper, blister, or closure system.',
      },
      {
        term: 'Secondary packaging',
        definition:
          'Packaging outside the primary container, such as cartons, labels, inserts, or wallet cards.',
      },
      {
        term: 'Tertiary / distribution packaging',
        definition:
          'Packaging used for shipping, storage, and transport, such as cases, pallets, insulated shippers, or temperature-controlled containers.',
      },
      {
        term: 'Packaging component',
        definition:
          'Any physical packaging item that must be specified, procured, controlled, and available for execution.',
      },
    ],
    supplyChainRelevance:
      'Packaging is not just procurement. It is a regulated cross-functional dependency that must stay aligned with product approval, quality controls, labeling, manufacturing execution, and distribution conditions.',
  },

  /* ── Section 2: Ownership boundaries ─────────────────────────────── */
  ownershipBoundaries: {
    table: [
      {
        supplyChainOwns:
          'Packaging component planning, lead times, inventory strategy, and availability',
        adjacentShared: 'Quality, Manufacturing, Packaging Engineering',
        otherFunctionOwns:
          'Component shortages, obsolete artwork/components, or unqualified suppliers can delay commercial readiness.',
      },
      {
        supplyChainOwns:
          'Supplier coordination for cartons, labels, shippers, inserts, trays, bottles, closures, or other packaging materials',
        adjacentShared: 'Supplier Quality, Procurement, Quality',
        otherFunctionOwns:
          'Supplier changes may require qualification, change control, quality review, and regulatory assessment.',
      },
      {
        supplyChainOwns:
          'Coordination of packaging readiness across CDMO, CMO, packaging site, 3PL, and distribution partners',
        adjacentShared:
          'Manufacturing, Technical Operations, CDMO / CMO, 3PL',
        otherFunctionOwns:
          'Assumptions can break when each partner believes another party owns readiness or approval.',
      },
      {
        supplyChainOwns:
          'Supply planning assumptions for packaging configurations, market packs, pack sizes, and country / region variants',
        adjacentShared:
          'Commercial, Regulatory, Artwork / Labeling, Demand Planning',
        otherFunctionOwns:
          'Wrong pack assumptions can create excess inventory, missed market needs, or relabeling/rework pressure.',
      },
      {
        supplyChainOwns:
          'Visibility to packaging dependencies that affect distribution, cold chain, returns, recalls, and serialization',
        adjacentShared: 'Distribution, Serialization Owner, Quality, 3PL',
        otherFunctionOwns:
          'Packaging decisions can affect scanability, temperature performance, returns handling, and recall execution.',
      },
      {
        supplyChainOwns:
          'Escalation of packaging-related critical path risks',
        adjacentShared:
          'Executive team, Quality, Regulatory, Manufacturing',
        otherFunctionOwns:
          'Packaging is often noticed too late because no single function owns the full cross-functional dependency map.',
      },
    ],
    decisionRights: {
      leads: [
        'Component supply plan and inventory strategy',
        'Packaging supplier coordination and readiness tracking',
        'Operational readiness milestones for packaging components',
        'Escalation when packaging dependencies threaten supply continuity or commercial execution',
      ],
      influences: [
        'Packaging configuration feasibility',
        'Timing of packaging artwork and component lock',
        'CDMO / CMO / packaging site readiness',
        'Distribution packaging assumptions',
        'Serialization and aggregation execution',
        'Market-specific pack planning',
      ],
      doesNotOwn: [
        'Final approved labeling content',
        'Regulatory filing strategy or market authorization content',
        'Quality approval of packaging components or suppliers',
        'Validation of packaging operations',
        'Final disposition or release decisions',
        'Legal interpretation of packaging obligations',
      ],
    },
    handoffs: [],
    handoffDetails: [
      {
        handoff: 'Supply Chain \u2194 Regulatory',
        whyItMatters:
          'Packaging configuration, pack size, labeling, and market presentation may need to align with approved product information or filing commitments.',
        typicalOwner: 'Regulatory',
      },
      {
        handoff: 'Supply Chain \u2194 Quality',
        whyItMatters:
          'Packaging components, suppliers, specifications, deviations, and changes usually need quality-system control.',
        typicalOwner: 'Quality',
      },
      {
        handoff: 'Supply Chain \u2194 Manufacturing / CDMO',
        whyItMatters:
          'Packaging readiness must align with packaging line capability, batch timing, component release, and operational execution.',
        typicalOwner: 'Manufacturing / CDMO',
      },
      {
        handoff: 'Supply Chain \u2194 Artwork / Labeling',
        whyItMatters:
          'Artwork timing affects component ordering, obsolescence risk, and packaging readiness.',
        typicalOwner: 'Artwork / Labeling + Regulatory',
      },
      {
        handoff: 'Supply Chain \u2194 3PL / Distribution',
        whyItMatters:
          'Packaging and shipper decisions affect storage, handling, temperature control, returns, recalls, and distribution execution.',
        typicalOwner: 'Supply Chain / 3PL',
      },
    ],
    commonBlindspot:
      'The most common blindspot is treating packaging as a late-stage purchasing activity. In practice, packaging decisions often become critical-path because they depend on approved labeling, supplier qualification, artwork version control, packaging line readiness, quality release, serialization, and distribution assumptions.',
  },

  /* ── Section 3: Applicability ────────────────────────────────────── */
  applicability: {
    contextHighlight:
      'For this context, Packaging should be treated as a high-priority shared-ownership topic. The key supply chain focus is readiness: packaging configuration clarity, component supply, supplier qualification status, artwork timing, CDMO / CMO coordination, serialization dependencies, and distribution packaging assumptions before commercial execution begins.',
    jurisdictionUSIntro:
      'US packaging expectations are shaped by FDA requirements for drug product labeling, cGMP controls, packaging and labeling operations, component control, tamper-evident packaging where applicable, and product-specific approved labeling. For supply chain, the practical issue is making sure the physical packaging configuration and packaging operations can support the approved product, quality system, and commercial distribution model.',
    jurisdictionUS: [
      'Packaging and labeling controls under finished drug cGMP expectations',
      'Component control and prevention of mix-ups, obsolete labeling, or incorrect packaging use',
      'Alignment between packaging components, approved labeling, artwork, and market presentation',
      'Tamper-evident or special packaging requirements where applicable',
      'Controlled temperature or storage labeling that affects distribution packaging and 3PL handling',
    ],
    jurisdictionEUIntro:
      'EU packaging expectations are shaped by the marketing authorization, outer and immediate packaging particulars, GMP expectations, GDP expectations, and, for many prescription medicines, safety features and anti-tampering requirements under the Falsified Medicines framework. For supply chain, the practical issue is making sure packaging presentation, serialization / safety features, market-specific language, and distribution execution align with the authorized product and EU supply chain rules.',
    jurisdictionEU: [
      'MAH responsibility for authorized product presentation and supply',
      'Country / language pack requirements and market-specific packaging variants',
      'Safety features and anti-tampering requirements where applicable',
      'GDP expectations for storage, transport, and distribution handling',
      'Coordination with EU importer, QP, wholesaler, and distribution partners',
    ],
    jurisdictionConsistent: [
      'Packaging must protect the product and support intended storage and handling',
      'Packaging components and suppliers need appropriate control through the quality system',
      'Packaging must align with approved labeling and product presentation',
      'Packaging changes can trigger quality, regulatory, manufacturing, and supply impacts',
      'Supply chain needs visibility to component availability, supplier readiness, and distribution implications',
    ],
    entityRoles: [
      {
        role: 'NDA Holder',
        description:
          'As an NDA holder, the company is closely tied to the approved product presentation, labeling, and commercial supply model. Supply chain should ensure packaging readiness is integrated with regulatory commitments, quality requirements, supplier readiness, CDMO / CMO execution, and distribution assumptions.',
        focusAreas:
          'Packaging configuration readiness \u00B7 Packaging-component sourcing and continuity \u00B7 CDMO / CMO / packaging site execution \u00B7 Artwork and component timing \u00B7 Change-impact visibility',
      },
      {
        role: 'MAH',
        description:
          'As a Marketing Authorization Holder in the EU, the company has responsibility for the authorized product in the market. Supply chain should coordinate packaging variants, safety features, language requirements, importer / QP / wholesaler interfaces, and distribution expectations with Regulatory and Quality.',
        focusAreas:
          'Market-specific pack requirements \u00B7 EU safety features and anti-tampering coordination \u00B7 Pack serialization readiness \u00B7 Importer / QP / wholesaler handoffs \u00B7 Distribution packaging and GDP alignment',
      },
      {
        role: 'Licensed US Distributor',
        description:
          'As a licensed US distributor, the packaging focus shifts toward distribution handling, storage, product identification, returns, saleable returns verification where applicable, and ensuring the distributed product remains in its intended condition.',
        focusAreas:
          'Storage and handling requirements \u00B7 3PL and distributor procedures \u00B7 Product identification and traceability \u00B7 Returns and recalls support \u00B7 Packaging damage or temperature-excursion handling',
      },
      {
        role: 'Importer',
        description:
          'As an importer, packaging relevance depends on whether the imported product is finished, labeled, partially packaged, or requires further processing. Supply chain should clarify importer responsibilities, product status at import, labeling / packaging state, release path, and handoff to Quality or QP where applicable.',
        focusAreas:
          'Import condition and product status \u00B7 Labeling / packaging state at import \u00B7 Customs and regulatory handoffs \u00B7 Temperature-controlled import handling \u00B7 Release and distribution readiness',
      },
      {
        role: '3PL',
        description:
          'As a 3PL, the company typically does not own packaging design or approval, but it may be responsible for storage, handling, returns, relabeling under controlled arrangements, damage reporting, temperature-controlled shipping, and recall execution support.',
        focusAreas:
          'Storage and handling execution \u00B7 Packaging damage controls \u00B7 Returns and recall support \u00B7 Temperature shipper handling \u00B7 Contractual responsibility clarity',
      },
      {
        role: 'CDMO Relationship',
        description:
          'In a CDMO relationship, the CDMO may execute packaging operations, but the sponsor / license holder usually still needs visibility to readiness, change control, quality agreements, component availability, and regulatory alignment.',
        focusAreas:
          'Packaging schedule and capacity \u00B7 Component supply model \u00B7 Quality agreement boundaries \u00B7 Change notification and approval pathways \u00B7 Batch packaging readiness',
      },
    ],
    lifecycleStages: [
      {
        stage: 'Preclinical',
        description:
          'Packaging is usually not a commercial packaging priority at this stage unless product stability, container closure, cold chain, or clinical supply assumptions are being established. Supply chain should monitor early choices that could become difficult to change later.',
        focusAreas:
          'Early product presentation assumptions \u00B7 Stability and storage implications \u00B7 Container / closure dependencies \u00B7 Future scalability concerns',
      },
      {
        stage: 'Late-Stage Clinical',
        description:
          'Packaging becomes more important because clinical, regulatory, commercial, and manufacturing assumptions begin converging. Supply chain should start identifying future commercial packaging configurations, suppliers, lead times, and operational risks.',
        focusAreas:
          'Early commercial pack assumptions \u00B7 Supplier and component lead times \u00B7 CDMO / CMO packaging capability \u00B7 Artwork and labeling timeline awareness \u00B7 Cold chain and distribution implications',
      },
      {
        stage: 'Pre-Commercial',
        description:
          'Packaging is a high-priority readiness topic. This is when pack configuration, components, artwork, supplier readiness, quality controls, serialization, distribution packaging, and manufacturing execution need coordinated visibility.',
        focusAreas:
          'Component readiness and inventory strategy \u00B7 Packaging supplier qualification status \u00B7 Artwork and labeling timeline \u00B7 Packaging line readiness \u00B7 Serialization / aggregation dependencies \u00B7 Distribution packaging assumptions',
      },
      {
        stage: 'Launch',
        description:
          'Launch is an execution-stability stage, not the whole product frame. Packaging focus shifts to readiness confirmation, supply continuity, deviation management, component availability, and rapid issue escalation.',
        focusAreas:
          'Final readiness checks \u00B7 Packaging component supply continuity \u00B7 Market pack execution \u00B7 Deviation and change control discipline \u00B7 3PL and distribution handoffs',
      },
      {
        stage: 'Post-Commercial',
        description:
          'After approval and commercial supply, packaging becomes an ongoing maintenance and change-management topic. Supply chain should monitor supplier performance, packaging changes, component obsolescence, complaints, recalls, returns, shortages, and market expansion needs.',
        focusAreas:
          'Change control \u00B7 Supplier performance \u00B7 Packaging complaints and defects \u00B7 Component lifecycle management \u00B7 Market expansions and pack variants \u00B7 Recall and return execution support',
      },
    ],
  },

  /* ── Section 4: Regulatory chain ─────────────────────────────────── */
  regulatoryChain: {
    plainLanguageFraming:
      'Packaging sits at the intersection of product approval, quality-system control, manufacturing execution, labeling, and distribution. Regulators and standards do not usually describe packaging as a single supply chain workstream. Instead, packaging expectations appear across drug labeling rules, GMP / GDP requirements, container and closure standards, tamper-evidence requirements, serialization / safety-feature rules, and internal quality-system artifacts.\n\nFor supply chain leaders, the practical question is not "Which regulation owns packaging?" The better question is: "Which source expectations shape the physical packaging system, and which function owns each handoff?"',
    chain: [
      {
        level: 'Law / Statute',
        description:
          'Sets the authority for drug safety, labeling, market authorization, distribution, and supply chain controls.',
      },
      {
        level: 'Regulation',
        description:
          'Defines enforceable requirements for labeling, GMP, packaging and labeling controls, distribution, safety features, or product authorization.',
      },
      {
        level: 'Standard / Compendial Expectation',
        description:
          'Provides recognized expectations for packaging, storage, container performance, risk management, or quality systems.',
      },
      {
        level: 'Guidance / Interpretation',
        description:
          'Explains regulatory expectations or practical implementation approaches.',
      },
      {
        level: 'Internal Execution Artifact',
        description:
          'Turns the expectation into work: SOPs, quality agreements, packaging specifications, artwork processes, supplier controls, batch records, distribution procedures.',
      },
    ],
    keySources: [
      {
        source: 'FD&C Act (21 USC §§ 351\u2013360)',
        type: 'Law',
        jurisdiction: 'US',
        relevance:
          'Authority for drug safety, labeling, adulteration, and misbranding',
      },
      {
        source: '21 CFR Part 211 (Subpart G)',
        type: 'Regulation',
        jurisdiction: 'US',
        relevance:
          'cGMP requirements for packaging and labeling controls',
      },
      {
        source: 'Directive 2001/83/EC',
        type: 'Law',
        jurisdiction: 'EU',
        relevance:
          'Authorization framework including labeling and packaging particulars',
      },
      {
        source: 'EU GMP Annex 15',
        type: 'Regulation',
        jurisdiction: 'EU',
        relevance:
          'Qualification and validation, including packaging processes',
      },
      {
        source: 'Delegated Regulation (EU) 2016/161',
        type: 'Regulation',
        jurisdiction: 'EU',
        relevance:
          'Safety features (serialization, anti-tampering) on packaging',
      },
      {
        source: 'USP General Chapters (e.g., \u27E8659\u27E9, \u27E81079\u27E9)',
        type: 'Standard',
        jurisdiction: 'US / Global',
        relevance:
          'Container closure, packaging, and good distribution practices',
      },
      {
        source: 'ICH Q1A (R2)',
        type: 'Guideline',
        jurisdiction: 'Global',
        relevance:
          'Stability testing — container closure and storage implications',
      },
      {
        source: 'ICH Q9',
        type: 'Guideline',
        jurisdiction: 'Global',
        relevance:
          'Quality risk management — applicable to packaging risk assessment',
      },
      {
        source: 'EU GDP Guidelines (2013/C 343/01)',
        type: 'Guideline',
        jurisdiction: 'EU',
        relevance:
          'Good distribution practice — storage, transport, packaging integrity',
      },
      {
        source: 'FDA Guidance: Container Closure',
        type: 'Guidance',
        jurisdiction: 'US',
        relevance:
          'Practical guidance for container closure system submissions',
      },
    ],
    confidenceNote:
      'This topic references primary sources across US and EU jurisdictions. Source coverage is oriented toward supply chain relevance, not exhaustive regulatory citation. View full source details in Sources & Standards.',
  },

  /* ── Section 5: What it touches next ─────────────────────────────── */
  whatItTouchesNext: {
    connectedTopics: [
      {
        topicName: 'Serialization',
        slug: 'serialization',
        connectionReason:
          'Packaging must support serialization identifiers (DSCSA in US, EU FMD safety features). Primary and secondary packaging surfaces carry serialized data.',
      },
      {
        topicName: 'Labeling & Artwork',
        slug: 'labeling-artwork',
        connectionReason:
          'Artwork content is printed on or applied to secondary packaging. Artwork timing directly affects packaging component readiness.',
      },
      {
        topicName: 'Cold Chain',
        slug: 'cold-chain',
        connectionReason:
          'Primary packaging affects cold chain qualification. Tertiary / distribution packaging (insulated shippers) supports temperature-controlled transport.',
      },
      {
        topicName: 'Distribution & 3PLs',
        slug: 'distribution-3pls',
        connectionReason:
          'Tertiary packaging must support distribution requirements, storage conditions, and 3PL handling procedures.',
      },
      {
        topicName: 'Child-Resistant / Special Packaging',
        slug: 'child-resistant-special-packaging',
        connectionReason:
          'PPPA and other special packaging requirements affect primary packaging design and component sourcing.',
      },
    ],
    handoffs: [
      {
        from: 'Quality',
        to: 'Supply Chain',
        description:
          'Packaging specifications handed off — component sourcing and supplier coordination begin',
      },
      {
        from: 'Regulatory',
        to: 'Supply Chain',
        description:
          'Approved artwork content handed off — print-ready artwork production and component ordering',
      },
      {
        from: 'Supply Chain',
        to: 'Manufacturing',
        description:
          'Qualified packaging components supplied — packaging line execution and batch packaging',
      },
      {
        from: 'Supply Chain',
        to: '3PL',
        description:
          'Distribution packaging and shipper specs confirmed — storage, handling, and shipping execution',
      },
    ],
    askNextPrompts: [
      'Is our container closure system qualified for the intended storage conditions?',
      'Have we confirmed serialization readiness on the packaging line for both DSCSA and EU FMD?',
      'Is dual-market artwork coordination on the critical path?',
      'Do we have qualified backup suppliers for primary packaging components?',
      'Has the CDMO / packaging site confirmed readiness for our commercial configuration?',
    ],
  },
};

/* ─── Packaging header props ─────────────────────────────────────── */

const PACKAGING_HEADER = {
  summary:
    'Packaging is the physical system that protects the product, carries required labeling, supports handling and distribution, and helps preserve product quality through the intended storage conditions.',
  ownershipPosture:
    'Shared ownership. Supply chain typically owns packaging readiness, component availability, supplier coordination, and operational handoffs. Quality, Regulatory, Manufacturing, Packaging Engineering, and Artwork / Labeling own adjacent decisions that determine whether the packaging system is approved, controlled, and executable.',
  primaryHandoff:
    'Supply Chain \u2194 Quality \u2194 Regulatory \u2194 Manufacturing / Packaging Engineering \u2194 Packaging Suppliers / CDMO / 3PL',
  sourceCue:
    'Source-backed orientation \u00B7 FDA / EMA / European Commission / USP / ICH references listed below',
};

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

  /* ── Packaging: populated content ─────────────────────────────── */
  if (topic.slug === 'packaging') {
    return (
      <TopicPageLayout
        slug={topic.slug}
        title={topic.title}
        summary={PACKAGING_HEADER.summary}
        ownershipPosture={PACKAGING_HEADER.ownershipPosture}
        primaryHandoff={PACKAGING_HEADER.primaryHandoff}
        sourceCue={PACKAGING_HEADER.sourceCue}
        content={PACKAGING_CONTENT}
      />
    );
  }

  /* ── All other topics: neutral placeholder ────────────────────── */
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
