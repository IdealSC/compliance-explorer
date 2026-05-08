import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TopicPageLayout } from '@/components/topic';
import type { TopicPageContent } from '@/components/topic';
import { ContextEmphasis } from '@/components/context';
import { LABELING_ARTWORK_CONTENT, LABELING_ARTWORK_HEADER } from './labeling-artwork-content';

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

/* ─── Serialization Content (TOPIC_SERIALIZATION.md) ─────────────── */

const SERIALIZATION_CONTENT: TopicPageContent = {
  whatThisIs: {
    leadParagraph:
      'Serialization in the pharmaceutical supply chain means assigning a unique product identifier \u2014 typically a serial number encoded alongside lot number, expiry date, and product code \u2014 to each saleable unit, and then connecting that identifier to electronic data systems that support tracing, verification, and exception management.\n\nIn the United States, the Drug Supply Chain Security Act (DSCSA) requires product identifiers on each package, encoded in a 2D Data Matrix, with electronic transaction data (Transaction Information, Transaction History, Transaction Statement) exchanged between trading partners. This is a track-and-trace model. In the European Union, the Falsified Medicines Directive (FMD) requires a Unique Identifier uploaded to the European Medicines Verification System (EMVS) and verified at point of dispense. This is a verification and decommissioning model.\n\nFor supply chain leaders, serialization matters because it connects packaging execution, master data, trading partner relationships, distribution operations, returns handling, and recall capability. It is not a one-time project \u2014 it is an ongoing operational layer.',
    keyTerms: [
      { term: 'Product identifier', definition: 'The combination of NDC/GTIN, serial number, lot number, and expiry date encoded on each saleable unit.' },
      { term: 'Unique Identifier (UI)', definition: 'The EU equivalent \u2014 product code, serial number, batch number, and expiry \u2014 uploaded to EMVS.' },
      { term: 'EPCIS', definition: 'Electronic Product Code Information Services \u2014 the GS1 standard for interoperable electronic exchange of tracking events.' },
      { term: 'Transaction Information / Transaction Statement (TI / TS)', definition: 'The data elements exchanged between US trading partners under DSCSA.' },
      { term: 'Verification / decommissioning', definition: 'The EU process of checking a product\u2019s identifier against the repository and marking it as dispensed.' },
      { term: 'Aggregation', definition: 'The parent-child relationship between individual units, cases, and pallets.' },
      { term: 'Authorized Trading Partner (ATP)', definition: 'Under DSCSA, an entity authorized to engage in transactions \u2014 verification required before transacting.' },
      { term: 'VRS', definition: 'Verification Router Service \u2014 the system used to verify product identifiers for saleable returns in the US.' },
    ],
    supplyChainRelevance:
      'EPCIS event posting that lags physical movement creates traceability gaps that can be treated as data-integrity findings in inspection. Contemporaneous event posting is typically expected.',
  },

  ownershipBoundaries: {
    table: [
      { supplyChainOwns: 'EPCIS data exchange \u2014 onboarding and continuous management with 3PLs, wholesalers, and dispensers; range planning, event posting, exception queues', adjacentShared: 'IT, Serialization Provider, Quality', otherFunctionOwns: 'Event posting that lags physical movement creates traceability gaps.' },
      { supplyChainOwns: 'Physical receipt and verification against electronic Transaction Information and Statements', adjacentShared: 'Quality, 3PL / Distributor', otherFunctionOwns: 'Verification failures require quarantine and investigation paths.' },
      { supplyChainOwns: 'Quarantine and segregation of suspect, illegitimate, expired, or recalled product', adjacentShared: 'Quality', otherFunctionOwns: 'Electronic segregation in the WMS or ERP without validation equivalent to physical segregation can result in inspection findings.' },
      { supplyChainOwns: 'Master data \u2014 NDC and GTIN allocation, hierarchy, product code for EU presentations', adjacentShared: 'Regulatory, IT', otherFunctionOwns: 'Master data errors propagate through the entire serialization chain.' },
      { supplyChainOwns: 'Serial number management \u2014 range planning, no-reuse, lot-to-serial reconciliation', adjacentShared: 'IT, CDMO / CMO', otherFunctionOwns: 'Serial number governance failures create downstream verification failures.' },
      { supplyChainOwns: 'Line-side execution coordination \u2014 oversight of CDMO print-and-verify and aggregation', adjacentShared: 'CDMO / CMO, Quality', otherFunctionOwns: 'Supply chain owns the data flow even where it does not own the packaging line.' },
      { supplyChainOwns: 'Trading partner connectivity \u2014 ATP confirmation and T3 capture and transmission', adjacentShared: '3PL / Distributor, Serialization Provider', otherFunctionOwns: 'Connectivity must be tested before first commercial transaction.' },
      { supplyChainOwns: 'Saleable return verification \u2014 VRS configuration and operational handling', adjacentShared: 'Quality, 3PL / Distributor', otherFunctionOwns: 'VRS must be operational before saleable returns enter the commercial flow.' },
      { supplyChainOwns: 'Suspect / illegitimate product handling \u2014 quarantine, investigation, FDA Form 3911, disposition', adjacentShared: 'Quality, Regulatory', otherFunctionOwns: 'Suspect product investigations sit with the entity that takes ownership, not with the 3PL providing logistics services.' },
      { supplyChainOwns: 'Country reporting \u2014 EMVO upload for EU presentations; country-specific portals where applicable', adjacentShared: 'Regulatory, Serialization Provider', otherFunctionOwns: 'Each new country is a new regime and project.' },
      { supplyChainOwns: 'Recall execution \u2014 pulling lot- and serial-level distribution data from serialized records', adjacentShared: 'Quality, Regulatory', otherFunctionOwns: 'Serialization data is a pre-built recall communication tool.' },
      { supplyChainOwns: 'Annual reporting under DSCSA for distributors and 3PLs', adjacentShared: 'Quality, Regulatory', otherFunctionOwns: 'Reporting cadence and content must be tracked.' },
    ],
    decisionRights: {
      leads: [
        'EPCIS data exchange operations and trading partner onboarding',
        'Serial number range planning and lot-to-serial reconciliation',
        'Saleable return verification configuration',
        'Trading partner connectivity testing',
        'Recall execution data assembly',
        'Exception queue management',
      ],
      influences: [
        'Master data setup and hierarchy decisions',
        'Line-side serialization execution coordination',
        'Service provider selection and integration',
        'Country reporting coordination',
        'Annual reporting preparation',
        'Suspect product handling workflows',
      ],
      doesNotOwn: [
        'Quality disposition of serialized batches',
        'Regulatory product code registration and filings',
        'Serialization system validation (CSV / CSA)',
        'Line equipment IQ / OQ / PQ',
        'Serialization architecture and policy decisions',
        'Legal interpretation of serialization obligations',
      ],
    },
    handoffs: [],
    handoffDetails: [
      { handoff: 'Supply Chain \u2194 Quality', whyItMatters: 'Disposition, suspect product investigations, deviation handling, and validation of serialization systems require quality-system control.', typicalOwner: 'Quality' },
      { handoff: 'Supply Chain \u2194 Regulatory', whyItMatters: 'NDC registration, product code publication, country filings, and ATP registration require regulatory ownership.', typicalOwner: 'Regulatory' },
      { handoff: 'Supply Chain \u2194 CDMO / CMO', whyItMatters: 'Line-side execution, print-and-verify, aggregation, master data exchange, and batch reconciliation require coordinated quality and technical agreements.', typicalOwner: 'CDMO / CMO' },
      { handoff: 'Supply Chain \u2194 3PL / Distributor', whyItMatters: 'T3 receipt, storage, downstream transmission, aggregation handling, and saleable return verification require connected systems and clear contractual boundaries.', typicalOwner: '3PL / Distributor' },
      { handoff: 'Supply Chain \u2194 Serialization Provider', whyItMatters: 'Hub services, data normalization, country reporting connectors, EMVO / NMVO connectivity, and API / EDI / EPCIS integration require provider execution.', typicalOwner: 'Serialization Provider' },
    ],
    commonBlindspot:
      'Paper release that does not propagate to the 3PL system status creates pressure for manual workarounds that can compromise serialization controls at the shipping interface. Quality release status and 3PL system status should be aligned before distribution.',
  },

  applicability: {
    contextHighlight:
      'For this context, Serialization should be treated as a high-priority shared-ownership topic. The key supply chain focus is readiness: master data setup, trading partner connectivity, service provider integration, CDMO / CMO coordination, EMVO onboarding, VRS configuration, and pilot runs through the full transaction data path before commercial launch.',
    jurisdictionUSIntro:
      'US serialization expectations are shaped by the Drug Supply Chain Security Act (DSCSA), which requires product identifiers encoded in a 2D Data Matrix on each lowest saleable unit, with electronic transaction data exchanged between trading partners. The model is track-and-trace: Transaction Information and Transaction Statements move with the product through the supply chain.',
    jurisdictionUS: [
      '2D Data Matrix on lowest saleable unit encoding NDC, serial, lot, and expiry',
      'TI / TS exchange between trading partners at every transaction',
      'Verification triggered on suspect product and saleable returns',
      'Authorized Trading Partner regime \u2014 ATP verification before transacting',
      'Annual reporting for wholesale distributors and 3PLs',
      '21 CFR 201.25 linear barcode running concurrently with DSCSA \u2014 both required',
      'State Boards of Pharmacy and 21 CFR 205 adding a state-level layer',
    ],
    jurisdictionEUIntro:
      'EU serialization expectations are shaped by the Falsified Medicines Directive (FMD) and Delegated Regulation (EU) 2016/161, which require a Unique Identifier uploaded to the European Medicines Verification System (EMVS) and verified at point of dispense. The model is verification and decommissioning: the MAH uploads UI data to repositories, and pharmacies verify before dispensing.',
    jurisdictionEU: [
      'UI containing product code, serial, batch, and expiry uploaded to EU Hub / EMVS',
      'Endpoint verification and decommissioning at point of dispense',
      'Two safety features mandated: UI plus anti-tampering device (ATD)',
      'Wholesaler verification is risk-based, not mandatory at every transaction',
      'MAH uploads UI master data to EMVO before pack release',
      'Live since February 9, 2019, with ongoing Q&A revisions from Commission and EMA',
    ],
    jurisdictionConsistent: [
      'Strict master data governance and reliance on GS1 standards (GTINs, SGTINs)',
      '2D GS1 Data Matrix at saleable presentation level',
      'Immediate isolation and reporting of suspected falsified or illegitimate medicines',
      'GS1 EPCIS as the dominant event-based exchange standard',
      'Serialization service providers operate across both regimes',
    ],
    entityRoles: [
      { role: 'NDA Holder', description: 'For a US NDA holder, serialization typically includes ensuring product identifiers are applied and that transaction data moves with the first commercial transaction. The NDA holder typically originates the first T3 transaction at first commercial sale. The NDA holder is an Authorized Trading Partner under \u00A7581(2)(A) and requires FDA Establishment Registration.', focusAreas: 'Product identifier application \u00B7 First T3 origination \u00B7 ATP registration \u00B7 CDMO coordination \u00B7 Master data and serial number governance' },
      { role: 'MAH', description: 'For an EU MAH, serialization typically includes uploading UI data to the repositories before release and managing decommissioning during recalls. FMD accountability typically applies to the MAH for each EU member state where the product is marketed. Delegating EMVS upload execution to a CDMO does not transfer the underlying responsibility \u2014 upload failures upstream are typically treated as MAH responsibility under the EU framework. The MAH may contract with a serialization service provider for EMVO connectivity, but accountability does not transfer.', focusAreas: 'UI upload to EMVS \u00B7 Country-by-country FMD accountability \u00B7 Service provider contracting \u00B7 Recall decommissioning \u00B7 Master data ownership' },
      { role: 'Licensed US Distributor', description: 'A licensed US distributor is a wholesale distributor under DSCSA \u00A7581(29) and 21 CFR 205. For a licensed US distributor, ATP verification is typically performed before transacting with another trading partner. Distributors handle T3 capture, storage, and transmission, saleable return verification, suspect product handling, and annual reporting under \u00A7582(d)(3). VAWD / NABP DSAC accreditation often appears in customer or contracting requirements as a commercial expectation, rather than as a federal regulatory requirement.', focusAreas: 'ATP verification \u00B7 T3 operations \u00B7 Saleable return VRS \u00B7 Suspect product handling \u00B7 Annual reporting \u00B7 Commercial accreditation expectations' },
      { role: 'Importer', description: 'For EU markets, importers typically verify qualitative and quantitative analysis of imported batches and segregate product received from third countries not intended for the local market. For the US, the FDA importer of record has obligations, but the trading-partner obligation lies with the entity introducing product into US commerce. Pre-launch importation requires a Pre-Approval Inspection and Regulatory (PLAIR) process for non-approved product.', focusAreas: 'Import verification \u00B7 Segregation of third-country product \u00B7 Trading-partner obligation clarity \u00B7 PLAIR for pre-launch' },
      { role: '3PL', description: 'A 3PL under DSCSA \u00A7581(22) provides logistics services without taking ownership of product. 3PLs typically report licensure status, facility names, and addresses to FDA annually under FD&C Act \u00A7584(b). 3PLs have ATP responsibilities under \u00A7582(a), handle T3 storage but not T3 origination (no ownership change), and cannot take ownership without becoming a wholesale distributor.', focusAreas: 'Logistics without ownership \u00B7 Annual \u00A7584 reporting \u00B7 ATP obligations \u00B7 T3 storage \u00B7 Ownership boundary clarity' },
      { role: 'CDMO Relationship', description: 'The CDMO relationship is governed by the Quality / Technical Agreement detailing labeling compliance and batch certification. The CDMO is the manufacturer of record; the NDA holder is the DSCSA trading partner originating T3. Line equipment ownership and qualification varies by deal. Master data exchange agreements specify fields, timing, and failure-handling. Serial number range assignment is typically sponsor-allocated.', focusAreas: 'Quality agreement boundaries \u00B7 Line equipment qualification \u00B7 Master data exchange \u00B7 Serial range assignment \u00B7 Batch reconciliation' },
    ],
    lifecycleStages: [
      { stage: 'Preclinical', description: 'Serialization is usually not central in preclinical supply unless the company is voluntarily using serialization-like controls for chain-of-custody or future readiness.', focusAreas: 'Awareness of future serialization requirements \u00B7 Early architecture decisions if applicable' },
      { stage: 'Late-Stage Clinical', description: 'Investigational product is typically governed by clinical trial labeling rules; commercial serialization usually applies only when product is intended for commercial introduction. Some sponsors voluntarily serialize for chain-of-custody and ease of commercial transition.', focusAreas: 'Voluntary serialization for transition readiness \u00B7 Clinical labeling alignment \u00B7 Future commercial architecture awareness' },
      { stage: 'Pre-Commercial', description: 'Pre-commercial is the highest-intensity serialization readiness stage. Activities include master data setup (GTIN / GLN via GDSN, EPCIS onboarding), NDC application, product hierarchy decisions (case-level and pallet aggregation), line qualification (vendor selection, IQ / OQ / PQ), ATP registration and FDA Establishment Registration, pilot runs through the full T3 path, quality agreements with CMO / CDMO covering serialization, and SOPs, training, and change-control framework. Service provider selection and integration, including EMVO onboarding, typically takes 3\u20136 months and can become a critical path item for launch timing.', focusAreas: 'Master data \u00B7 Line qualification \u00B7 Trading partner connectivity \u00B7 EMVO onboarding \u00B7 Pilot runs \u00B7 Quality agreements \u00B7 SOPs and training' },
      { stage: 'Launch', description: 'Launch is the execution-stability stage. Activities include uploading UI to EMVS (EU) or generating and transmitting T3 streams alongside first physical shipment (US), trading partner connectivity testing with launch wholesalers, VRS configuration and saleable return readiness, and recall execution capability validation.', focusAreas: 'First commercial transaction \u00B7 Trading partner go-live \u00B7 VRS readiness \u00B7 Recall capability confirmation' },
      { stage: 'Post-Commercial', description: 'Post-commercial serialization is ongoing operational maintenance. Activities include saleable return verification, change management (packaging, lines, software releases, label updates \u2014 each can require EMVO re-upload), new country expansion, annual reporting cadence, VRS volume management and exception handling, aggregation governance (discrepancies, parent-child re-aggregation events), and continuous improvement on master data quality, exception rates, and latency. Returning unverified stock to active inventory because of a system or scanner outage creates a saleable-return verification gap that can be treated as a finding.', focusAreas: 'Saleable returns \u00B7 Change management \u00B7 Country expansion \u00B7 Annual reporting \u00B7 VRS operations \u00B7 Aggregation governance \u00B7 Continuous improvement' },
    ],
  },

  regulatoryChain: {
    plainLanguageFraming:
      'Serialization sits at the intersection of product identification, supply chain security, anti-counterfeiting, and distribution controls. Regulators and standards do not describe serialization as a single supply chain workstream. Instead, serialization expectations appear across drug supply chain security legislation, product identification rules, GMP and GDP requirements, verification and decommissioning rules, and data exchange standards.\n\nFor supply chain leaders, the practical question is not "Which regulation owns serialization?" The better question is: "Which source expectations shape the serialization system, and which function owns each handoff?"',
    chain: [
      { level: 'Law / Statute', description: 'Sets the authority for drug supply chain security, product identification, trading partner obligations, and anti-counterfeiting controls.' },
      { level: 'Regulation', description: 'Defines enforceable requirements for product identifiers, verification, data exchange, reporting, safety features, and distribution controls.' },
      { level: 'Standard / Specification', description: 'Provides recognized expectations for data encoding, exchange formats, print quality, and interoperability.' },
      { level: 'Guidance / Interpretation', description: 'Explains regulatory expectations or practical implementation approaches for tracing, verification, suspect product handling, and reporting.' },
      { level: 'Internal Execution Artifact', description: 'Turns the expectation into work: SOPs, quality agreements, master data, trading partner agreements, VRS configuration, exception procedures.' },
    ],
    keySources: [
      { source: 'DSCSA / FD&C Act \u00A7582', type: 'Law', jurisdiction: 'US', relevance: 'Authority for product identifiers, transaction data, ATP, verification, and reporting' },
      { source: 'FMD Directive 2011/62/EU', type: 'Law', jurisdiction: 'EU', relevance: 'Authority for safety features and anti-counterfeiting on medicinal products' },
      { source: 'Delegated Regulation (EU) 2016/161', type: 'Regulation', jurisdiction: 'EU', relevance: 'MAH responsibilities for UI uploads, EMVS, and decommissioning protocols' },
      { source: '21 CFR 201.25', type: 'Regulation', jurisdiction: 'US', relevance: 'Linear barcode encoding NDC \u2014 runs concurrently with DSCSA' },
      { source: '21 CFR 205', type: 'Regulation', jurisdiction: 'US', relevance: 'Federal floor for state wholesale distributor licensing' },
      { source: 'GS1 General Specifications / EPCIS', type: 'Standard', jurisdiction: 'Both', relevance: 'Global standard for product identification and interoperable event-based data exchange' },
      { source: 'FDA Product Identifiers Under DSCSA QA', type: 'Guidance', jurisdiction: 'US', relevance: 'Identifier composition, encoding, and human-readable expectations' },
      { source: 'FDA Standardization of Data and Documentation Practices for Product Tracing', type: 'Guidance', jurisdiction: 'US', relevance: 'Format and content for T3 transaction information, history, and statement' },
      { source: 'FDA Standards for Interoperable Exchange of Information for Tracing', type: 'Guidance', jurisdiction: 'US', relevance: 'Underpins \u00A7582(g) interoperability requirements' },
      { source: 'FDA Wholesale Distributor Verification Requirement for Saleable Returned Drug Product', type: 'Guidance', jurisdiction: 'US', relevance: 'Operational rules for VRS-based saleable return verification' },
      { source: 'FDA DSCSA Implementation: Identification of Suspect Product and Notification', type: 'Guidance', jurisdiction: 'US', relevance: 'Suspect product handling and FDA Form 3911' },
      { source: 'FDA DSCSA Annual Reporting by Wholesale Distributors and 3PLs', type: 'Guidance', jurisdiction: 'US', relevance: '\u00A7582(d)(3) and \u00A7584 reporting cadence and content' },
      { source: 'EMA / European Commission Q&A on Safety Features', type: 'Guidance', jurisdiction: 'EU', relevance: 'Authoritative interpretation of Delegated Regulation 2016/161' },
      { source: 'EMVO User Requirements Specification and Onboarding', type: 'Reference', jurisdiction: 'EU', relevance: 'Hub-side onboarding requirements' },
      { source: 'EU GDP 2013/C 343/01 Chapter 5 \u2014 Operations', type: 'Guideline', jurisdiction: 'EU', relevance: 'Storage, segregation, and operational standards' },
      { source: 'ISO/IEC 16022 (Data Matrix) / ISO/IEC 15415 (print quality)', type: 'Standard', jurisdiction: 'Both', relevance: 'Symbology specification and print-quality grading' },
    ],
    confidenceNote:
      'Source list reflects Brian / ISC Stage 3 classification and requires final citation-format review before implementation. Source coverage is oriented toward supply chain relevance, not exhaustive regulatory citation. View full source details in Sources & Standards.',
  },

  whatItTouchesNext: {
    connectedTopics: [
      { topicName: 'Packaging', slug: 'packaging', connectionReason: 'Codes need to remain intact and readable across normal conditions of use, including cartoning friction and cold-chain environmental stress. Print-quality grading per ISO/IEC 15415. Aggregation requires case-level and pallet-level barcoding. EU FMD anti-tampering device interaction with serialization at pack closure.' },
      { topicName: 'Labeling & Artwork', slug: 'labeling-artwork', connectionReason: 'Dual barcoding \u2014 linear (21 CFR 201.25) plus 2D Data Matrix (DSCSA) \u2014 must be accommodated on the artwork. Bar code zone reservation and clear-zone management. Human-readable text formatting. Multilingual EU labels with UI placement constraints. Small-footprint exemption claims under 21 CFR 201.25 are typically reviewed against demonstrated technological infeasibility \u2014 design or overwrap alternatives are usually expected to be considered first.' },
      { topicName: 'Distribution & 3PLs', slug: 'distribution-3pls', connectionReason: 'FEFO logic typically operates alongside DSCSA verification at the distribution interface. ATP verification at every transaction. 3PL warehouse-level aggregation maintenance. Saleable return verification \u2014 VRS for US, decommissioning logic for EU.' },
      { topicName: 'Returns', slug: 'returns', connectionReason: 'Saleable returns are typically associated with the original transaction information and statement before return to saleable inventory. VRS for US saleable returns under \u00A7582(c)(4)(D). EU FMD \u2014 once decommissioned at dispense, product cannot be re-dispensed.' },
      { topicName: 'Recalls', slug: 'recalls', connectionReason: 'Decommissioning UI in repositories (EU); 24-hour verification protocol (US). Serialization data is a pre-built recall communication tool \u2014 package-level identification supports targeted recall. 21 CFR Part 7 plus serialized data improves speed and completeness of recall execution.' },
      { topicName: 'Importer / Distributor Responsibilities', slug: 'importer-distributor-responsibilities', connectionReason: 'Verifying ATP status and ensuring environmental conditions during transit are logged and reviewed before release. The importer does not displace the trading-partner obligation. Distributor obligations anchored in \u00A7582(b) plus 21 CFR 205.' },
      { topicName: 'Release & Disposition Handoffs', slug: 'release-disposition-handoffs', connectionReason: 'Physical receipt data from 3PL must be provided to QA to support final batch disposition. QA release of a serialized batch typically ties to the SGTIN range associated with the released lot. Handoff from CMO / CDMO to NDA holder includes serialized batch record plus master data plus reconciliation. T3 origination at first commercial transaction \u2014 data integrity at this point is foundational. Reject, rework, retain, and sample handling is a serial-level reconciliation activity.' },
    ],
    handoffs: [
      { from: 'Quality', to: 'Supply Chain', description: 'Serialized batch disposition and release status \u2014 distribution authorization and T3 origination eligibility' },
      { from: 'Regulatory', to: 'Supply Chain', description: 'NDC / product code registration and ATP registration \u2014 master data foundation for serialization operations' },
      { from: 'CDMO / CMO', to: 'Supply Chain', description: 'Serialized batch record, master data, and reconciliation \u2014 data integrity at the manufacturing-to-distribution interface' },
      { from: 'Supply Chain', to: '3PL / Distributor', description: 'Trading partner connectivity and T3 data streams \u2014 receipt, storage, and downstream transmission of transaction data' },
      { from: 'Serialization Provider', to: 'Supply Chain', description: 'Hub connectivity, country reporting, and exception alerts \u2014 operational visibility into serialization data flows' },
    ],
    commonPitfalls: [
      'EPCIS event posting that lags physical movement creates traceability gaps.',
      'Electronic segregation without validation equivalent to physical segregation can result in inspection findings.',
      'Paper release that does not propagate to the 3PL system status creates manual workaround pressure.',
      'Suspect product investigations sit with the entity that takes ownership, not with the 3PL.',
      'Delegating EMVS upload execution to a CDMO does not transfer the underlying responsibility.',
      'Returning unverified stock to active inventory during a system outage creates a saleable-return verification gap.',
    ],
    askNextPrompts: [
      'Have product identifiers, artwork space, and print-quality expectations been coordinated before packaging execution?',
      'Are transaction data flows tested with the first commercial trading partners?',
      'Are saleable return and suspect-product paths understood before post-commercial operations begin?',
      'Are serialized batch records, master data, and QA release status aligned before distribution?',
      'Is EMVO onboarding on the critical path for EU launch timing?',
    ],
  },
};

const SERIALIZATION_HEADER = {
  summary:
    'Serialization is the product identification, data exchange, verification, and exception-management layer that connects packaging execution to commercial distribution across the pharmaceutical supply chain.',
  ownershipPosture:
    'Shared ownership. Supply chain typically owns serialized data exchange, trading partner connectivity, master data coordination, serial number management, saleable return verification support, and recall execution data. Quality, Regulatory, IT, CDMO / CMO, 3PL / Distributor, Serialization Provider, and MAH / NDA Holder own adjacent decisions that determine whether serialization is compliant, connected, and operational.',
  primaryHandoff:
    'Supply Chain \u2194 Quality \u2194 Regulatory \u2194 CDMO / CMO \u2194 3PL / Distributor \u2194 Serialization Provider',
  sourceCue:
    'Source-backed orientation \u00B7 DSCSA / FD&C \u00A7582 \u00B7 EU FMD / Delegated Regulation (EU) 2016/161 \u00B7 GS1 / EPCIS \u00B7 FDA / EMA / ISO references listed below',
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
      <ContextEmphasis>
        <TopicPageLayout
          slug={topic.slug}
          title={topic.title}
          summary={PACKAGING_HEADER.summary}
          ownershipPosture={PACKAGING_HEADER.ownershipPosture}
          primaryHandoff={PACKAGING_HEADER.primaryHandoff}
          sourceCue={PACKAGING_HEADER.sourceCue}
          content={PACKAGING_CONTENT}
        />
      </ContextEmphasis>
    );
  }

  /* ── Serialization: populated content ─────────────────────────── */
  if (topic.slug === 'serialization') {
    return (
      <ContextEmphasis>
        <TopicPageLayout
          slug={topic.slug}
          title={topic.title}
          summary={SERIALIZATION_HEADER.summary}
          ownershipPosture={SERIALIZATION_HEADER.ownershipPosture}
          primaryHandoff={SERIALIZATION_HEADER.primaryHandoff}
          sourceCue={SERIALIZATION_HEADER.sourceCue}
          content={SERIALIZATION_CONTENT}
        />
      </ContextEmphasis>
    );
  }

  /* ── Labeling & Artwork: populated content ─────────────────────── */
  if (topic.slug === 'labeling-artwork') {
    return (
      <ContextEmphasis>
        <TopicPageLayout
          slug={topic.slug}
          title={topic.title}
          summary={LABELING_ARTWORK_HEADER.summary}
          ownershipPosture={LABELING_ARTWORK_HEADER.ownershipPosture}
          primaryHandoff={LABELING_ARTWORK_HEADER.primaryHandoff}
          sourceCue={LABELING_ARTWORK_HEADER.sourceCue}
          content={LABELING_ARTWORK_CONTENT}
        />
      </ContextEmphasis>
    );
  }

  /* ── All other topics: neutral placeholder ────────────────────── */
  return (
    <ContextEmphasis>
      <TopicPageLayout
        slug={topic.slug}
        title={topic.title}
        summary="This page is being aligned to the approved topic page template."
        ownershipPosture="Template placeholder — ownership content requires approved topic content."
        primaryHandoff="Template placeholder — handoff content requires approved topic content."
        sourceCue="Source-backed orientation · references require approved topic content"
        content={{}}
      />
    </ContextEmphasis>
  );
}
