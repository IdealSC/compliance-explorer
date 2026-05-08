import type { TopicPageContent } from '@/components/topic';

/* ─── Labeling & Artwork Content (TOPIC_LABELING_ARTWORK.md) ─────── */

export const LABELING_ARTWORK_CONTENT: TopicPageContent = {
  whatThisIs: {
    leadParagraph:
      'Labeling & Artwork is the regulated, cross-functional system that turns approved label content into physical printed components that appear on pharmaceutical products. It spans the lifecycle from approved label text through artwork master design, printed-component production, barcode placement, human-readable text, version control, and market-specific cut-over management.\n\nFor senior supply chain leaders, labeling and artwork matters because it sits at the intersection of regulatory approval, quality control, packaging execution, serialization, and distribution readiness. A labeling change \u2014 whether triggered by a safety update, a market expansion, or a routine revision \u2014 can affect artwork vendors, packaging suppliers, CDMO packaging lines, serialization configurations, inventory segregation, and 3PL stock management. The physical label is also where two barcode systems coexist on the same surface: the linear barcode encoding the NDC (US) and the 2D Data Matrix encoding the serial number under DSCSA (US) and FMD (EU).',
    keyTerms: [
      { term: 'Artwork master', definition: 'The controlled, approved electronic file from which all printed components are produced.' },
      { term: 'Printed component', definition: 'Any physical labeling item \u2014 label, carton, insert, leaflet \u2014 that must be specified, produced, inspected, and reconciled.' },
      { term: 'Label cut-over', definition: 'The managed transition from one approved label version to another, coordinated across supply, production, inventory, and distribution.' },
      { term: 'Linear barcode', definition: 'The traditional barcode encoding the NDC, typically expected under 21 CFR 201.25.' },
      { term: '2D Data Matrix', definition: 'The two-dimensional barcode carrying product identifier, serial number, lot, and expiry under DSCSA and FMD requirements.' },
      { term: 'Anti-Tampering Device (ATD)', definition: 'A physical feature on EU outer packaging that shows evidence of opening, typically expected under Directive 2011/62/EU.' },
      { term: 'Human-readable text (HR text)', definition: 'The printed text accompanying barcode symbology \u2014 product name, NDC/GTIN, serial number, lot, expiry \u2014 that must be legible.' },
      { term: 'QRD template', definition: 'The Quality Review of Documents template used to format EU labels and SmPC content.' },
      { term: 'Label reconciliation', definition: 'The controlled accounting of printed components issued, used, damaged, and returned at the packaging line, typically addressed under 21 CFR 211.122 and 211.130.' },
      { term: 'Line clearance', definition: 'The verified removal of all labeling and packaging materials from a previous batch before starting the next, typically addressed under EudraLex Volume 4, Chapters 5 and 6.' },
    ],
    supplyChainRelevance:
      'Electronic proof approval alone does not capture printer color drift. Physical color draw-downs are typically expected so two strengths do not end up looking alike under pharmacy lighting \u2014 the kind of drift that can be treated as an accuracy finding in data-integrity assessments.',
  },

  ownershipBoundaries: {
    table: [
      { supplyChainOwns: 'Artwork timeline and cut-over execution', adjacentShared: 'MAH / NDA Holder, Regulatory', otherFunctionOwns: 'The MAH or NDA holder is typically regarded as the party accountable for ensuring label content aligns with the approved dossier. Misalignment between approval timing and component ordering creates cut-over risk.' },
      { supplyChainOwns: 'Printed component availability', adjacentShared: 'Regulatory, Quality', otherFunctionOwns: 'Late-breaking regulatory changes near PDUFA or CHMP opinion can force artwork revisions after components are already ordered or produced.' },
      { supplyChainOwns: 'Launch inventory impact', adjacentShared: 'Quality', otherFunctionOwns: 'Quality units typically perform incoming inspection, including AQL sampling, of printed components per 21 CFR 211.122.' },
      { supplyChainOwns: 'CDMO / CMO execution coordination', adjacentShared: 'CDMO / CMO, Quality', otherFunctionOwns: 'Quality Agreements between MAH / NDA holder and CDMO typically specify who verifies the final printed component against the approved master and who owns the investigation when there is a discrepancy in the variable-data print.' },
      { supplyChainOwns: 'Packaging supplier readiness', adjacentShared: 'Packaging Supplier, Quality', otherFunctionOwns: 'Supplier changes may require qualification, change control, quality review, and regulatory assessment.' },
      { supplyChainOwns: 'Barcode readability coordination', adjacentShared: 'Serialization Provider', otherFunctionOwns: 'Barcode readability depends on unvarnished whitespace, substrate, and print quality \u2014 shared across artwork, supplier, and CDMO. Cross-link: Serialization.' },
      { supplyChainOwns: 'Component change timing', adjacentShared: 'Artwork Vendor', otherFunctionOwns: 'Artwork vendor capacity and proof-cycle timing can become critical path during rapid label changes.' },
      { supplyChainOwns: 'Distribution-readiness impact', adjacentShared: 'Commercial / Brand, 3PL', otherFunctionOwns: 'Distribution readiness depends on correct labeled product being available in the right market configuration at the right time.' },
    ],
    decisionRights: {
      leads: [
        'Artwork timeline and cut-over schedule',
        'Printed-component ordering and availability tracking',
        'Label cut-over coordination across supply, production, inventory, and distribution',
        'Escalation when labeling and artwork dependencies threaten supply continuity or commercial execution',
      ],
      influences: [
        'CDMO / CMO packaging schedule and component supply model',
        'Packaging supplier readiness and reprint lead times',
        'Distribution-readiness timing for labeled product',
        'Inventory segregation during label cut-overs',
      ],
      doesNotOwn: [
        'Approved label content or regulatory submission strategy',
        'Artwork master approval or quality sign-off',
        'Incoming inspection disposition of printed components',
        'Vision-system validation or line qualification',
        'Legal interpretation of labeling obligations',
      ],
    },
    handoffs: [],
    handoffDetails: [
      { handoff: 'Supply Chain \u2194 MAH / NDA Holder', whyItMatters: 'Label content approval timing directly affects artwork timeline, component ordering, and cut-over execution.', typicalOwner: 'MAH / NDA Holder' },
      { handoff: 'Supply Chain \u2194 Regulatory', whyItMatters: 'Regulatory pathway for label changes (CBE-0, CBE-30, PAS; Type IA, IB, II) determines urgency and scope of artwork revisions.', typicalOwner: 'Regulatory' },
      { handoff: 'Supply Chain \u2194 Quality', whyItMatters: 'Incoming inspection, artwork approval, line clearance, and change control are quality-system gating points for labeling.', typicalOwner: 'Quality' },
      { handoff: 'Supply Chain \u2194 CDMO / CMO', whyItMatters: 'Packaging-line execution, variable-data printing, vision-system verification, and reject handling depend on component readiness and master data alignment.', typicalOwner: 'CDMO / CMO' },
      { handoff: 'Supply Chain \u2194 Artwork Vendor / Packaging Supplier', whyItMatters: 'Proof cycles, print production, color matching, and delivery timing are operational dependencies owned by vendors but coordinated by supply chain.', typicalOwner: 'Artwork Vendor / Packaging Supplier' },
    ],
    commonBlindspot:
      'The most common blindspot is assuming that an approved artwork master means the labeling is ready. In practice, the artwork master must flow through printed-component production, incoming inspection, CDMO receipt verification, line clearance, and variable-data print validation before the labeled product is ready for distribution. Each step introduces a potential delay or quality hold that supply chain needs to track.',
  },

  applicability: {
    contextHighlight:
      'For this context, Labeling & Artwork should be treated as a high-priority shared-ownership topic. The key supply chain focus is readiness: artwork timeline clarity, printed-component supply, label cut-over planning, CDMO / CMO coordination, barcode placement confirmation, and distribution-readiness alignment before commercial execution begins. Dual-market artwork coordination \u2014 US labeling format alongside EU multi-language packs, ATD placement, and QRD conventions \u2014 is a common launch-delay driver.',
    jurisdictionUSIntro:
      'US labeling and artwork expectations are shaped by prescription-drug labeling format requirements, linear barcode expectations under 21 CFR 201.25 with DSCSA 2D Data Matrix coexistence, visual differentiation guidance (tall-man lettering, contrasting colors, whitespace) under FDA Safety Considerations for Container Labels, medication-error risk reduction, printed-component controls under 21 CFR 211.122 and 211.130, patient labeling requirements under 21 CFR 208, and NDA labeling content expectations under 21 CFR 314.50.',
    jurisdictionUS: [
      'Linear barcode encoding NDC under 21 CFR 201.25 coexisting with 2D Data Matrix under DSCSA',
      'Visual differentiation \u2014 tall-man lettering, contrasting colors, whitespace',
      'Medication Guide and Patient Package Insert requirements under 21 CFR 208',
      '21 CFR 211.122 and 211.130 address the control of labeling material issuance, use, and reconciliation at the line',
      'Electronic records expectations under 21 CFR 11 for artwork-file storage',
    ],
    jurisdictionEUIntro:
      'EU labeling and artwork expectations are shaped by outer-pack safety features and anti-tampering requirements under Directive 2011/62/EU and Delegated Regulation (EU) 2016/161, mandatory labeling content under Directive 2001/83/EC Articles 54\u201369, readability expectations under the EMA Readability Guideline, QRD templates for label and SmPC formatting, multi-language packs or clusters, and printed-material handling controls under EudraLex Volume 4 Chapters 5 and 6.',
    jurisdictionEU: [
      'The FMD framework calls for physical Anti-Tampering Devices on outer packaging under Directive 2011/62/EU and Delegated Regulation (EU) 2016/161',
      'Multi-language packs or clusters are highly common and add change-control complexity',
      'Directive 2001/83/EC Articles 54\u201369 define the content elements expected on EU labels and Patient Information Leaflets',
      'The EMA Readability Guideline sets expectations for label and PIL readability in EU markets',
      'QRD templates apply to label and SmPC formatting',
      'EudraLex Volume 4 Chapters 5 and 6 address the handling, segregation, and line clearance expectations for printed packaging materials',
    ],
    jurisdictionConsistent: [
      'Strict version control of physical labels and artwork masters',
      'Traceability of label master to printed component to packaged unit',
      'Print-quality grading aligned with ISO/IEC 15415 and 15416 (cross-link: Serialization)',
      'Readable barcodes, printed-component reconciliation, and line clearance',
      'Supplier execution and market-specific cut-over management',
    ],
    entityRoles: [
      { role: 'NDA Holder / MAH', description: 'For the NDA holder or MAH, accountability typically includes ensuring the physical label aligns with the dossier approved by the agency. The NDA holder or MAH owns the artwork master, submission content, and change-control authority, and signs off on printed components prior to packaging release.', focusAreas: 'Artwork timeline coordination \u00B7 Label cut-over planning \u00B7 Printed-component availability \u00B7 CDMO / CMO execution coordination \u00B7 Distribution-readiness alignment' },
      { role: 'Licensed US Distributor', description: 'As a licensed US distributor, the company does not own label content but encounters labeling-related complaints, recall execution under 21 CFR Part 7, and ATP intersection with labeling under DSCSA \u00A7582(a) (cross-link: Serialization).', focusAreas: 'Product identification and traceability \u00B7 Labeling-related complaint handling \u00B7 Recall support \u00B7 ATP compliance intersection' },
      { role: 'Importer', description: 'As an importer, labeling relevance depends on destination market. In the EU, importers may apply or confirm local-language overlays. In the US, importers verify label requirements before introduction into commerce.', focusAreas: 'Import labeling state \u00B7 Local-language overlays \u00B7 Customs and regulatory handoffs \u00B7 Label verification before distribution' },
      { role: '3PL', description: 'As a 3PL, the company stores, picks, and ships pre-labeled product. 3PLs encounter labeling at receipt, return, and recall verification. Some 3PLs perform secondary labeling or country-specific overlay services under MAH direction; this typically calls for explicit Quality Agreement provisions.', focusAreas: 'Pre-labeled product handling \u00B7 Returns and recall verification \u00B7 Secondary labeling provisions where applicable \u00B7 Stock segregation during cut-overs' },
      { role: 'CDMO Relationship', description: 'In a CDMO relationship, the CDMO executes physical label application, variable-data printing, vision-system verification, pack-line print-and-verify, and component receipt inspection. Line equipment ownership and qualification varies by deal. Reject, rework, retain, and sample handling at serial / lot level are operational considerations.', focusAreas: 'Packaging schedule and component supply model \u00B7 Quality Agreement boundaries \u00B7 Variable-data print verification ownership \u00B7 Reject and rework handling \u00B7 Line qualification status' },
    ],
    lifecycleStages: [
      { stage: 'Preclinical', description: 'Commercial labeling and artwork frameworks are usually not central in preclinical, when bench-stage product is governed by laboratory or research-use labeling instead.', focusAreas: 'Awareness of future labeling requirements' },
      { stage: 'Late-Stage Clinical', description: 'Focus shifts to blinding and Investigational Use Only (IUO) statements. Investigational product is typically governed by EudraLex Volume 4 Annex 13 (EU) and 21 CFR 312.6 (US) for labeling. Some sponsors begin commercial artwork master development in parallel with late-stage clinical execution.', focusAreas: 'IUO labeling \u00B7 Blinding requirements \u00B7 Early commercial artwork development' },
      { stage: 'Pre-Commercial and Launch', description: 'High risk of concurrent artwork versions near PDUFA date or CHMP opinion. Rapid-response print capabilities and tight artwork master version control are typically expected during the pre-commercial window. EMVO and DSCSA Tier 3 readiness intersect labeling execution (cross-link: Serialization). Pack-line print-and-verify validation is typically expected to be complete before first commercial production.', focusAreas: 'Artwork version control \u00B7 Rapid-response print \u00B7 EMVO / DSCSA readiness \u00B7 Pack-line validation' },
      { stage: 'Post-Commercial', description: 'Managing safety updates, label expansions, country additions, routine artwork maintenance, change control, and vendor migrations. Exhausting old label stock during a CBE-0 safety-warning change can result in distribution that may be treated as misbranded under FD&C Act \u00A7502. Destruction or quarantine of obsolete stock is typically expected once the safety warning takes effect.', focusAreas: 'Safety updates \u00B7 Label expansions \u00B7 Change control \u00B7 Old-stock exhaustion risk \u00B7 Vendor migrations' },
    ],
  },

  regulatoryChain: {
    plainLanguageFraming:
      'Labeling and artwork sits at the intersection of product approval, quality-system control, packaging execution, serialization, and distribution. Regulators and standards do not describe labeling and artwork as a single supply chain workstream. Instead, labeling expectations appear across drug labeling rules, GMP requirements, barcode standards, printed-component controls, safety-feature requirements, and internal quality-system artifacts.\n\nFor supply chain leaders, the practical question is not "Which regulation owns labeling?" The better question is: "Which source expectations shape the labeling system, and which function owns each handoff?"',
    chain: [
      { level: 'Law / Statute', description: 'Sets the authority for drug labeling, misbranding, market authorization, and safety-feature requirements.' },
      { level: 'Regulation', description: 'Defines enforceable requirements for labeling format, barcode encoding, printed-component controls, patient labeling, safety features, and clinical labeling.' },
      { level: 'Standard / Specification', description: 'Provides recognized expectations for barcode print quality, encoding, and symbology.' },
      { level: 'Guidance / Interpretation', description: 'Explains regulatory expectations or practical implementation approaches for labeling safety, readability, formatting, and quality agreements.' },
      { level: 'Internal Execution Artifact', description: 'Turns the expectation into work: SOPs, quality agreements, artwork processes, printed-component specifications, supplier controls, batch records.' },
    ],
    keySources: [
      { source: 'FD&C Act \u00A7502 \u2014 Misbranded drugs', type: 'Law', jurisdiction: 'US', relevance: 'Anchor for old-stock-exhaustion risk and misbranding framework' },
      { source: 'Directive 2001/83/EC, Title V, Art. 54\u201369', type: 'Law', jurisdiction: 'EU', relevance: 'Foundational EU labeling provisions for outer and immediate packaging' },
      { source: 'Directive 2011/62/EU (FMD)', type: 'Law', jurisdiction: 'EU', relevance: 'Foundational for ATD and UI inclusion on outer packaging' },
      { source: '21 CFR 201 (Subparts A, B, C) and \u00A7201.25', type: 'Regulation', jurisdiction: 'US', relevance: 'Prescription-drug labeling format and linear barcode expectations' },
      { source: '21 CFR 208 \u2014 Medication Guides / PPI', type: 'Regulation', jurisdiction: 'US', relevance: 'US patient labeling requirements' },
      { source: '21 CFR 211.122 and 211.130', type: 'Regulation', jurisdiction: 'US', relevance: 'Labeling material issuance, use, and reconciliation' },
      { source: '21 CFR 314.50 \u2014 NDA labeling content', type: 'Regulation', jurisdiction: 'US', relevance: 'Submission-side anchor for US label content' },
      { source: '21 CFR 11 \u2014 Electronic Records', type: 'Regulation', jurisdiction: 'US', relevance: 'Anchor for ALCOA+ artwork-file storage expectations' },
      { source: '21 CFR 312.6 \u2014 IND labeling', type: 'Regulation', jurisdiction: 'US', relevance: 'US clinical labeling reference' },
      { source: 'Delegated Regulation (EU) 2016/161', type: 'Regulation', jurisdiction: 'EU', relevance: 'Safety feature and UI technical requirements' },
      { source: 'EudraLex Vol. 4, Ch. 5 and Ch. 6', type: 'Regulation', jurisdiction: 'EU', relevance: 'Handling, segregation, and line clearance for printed packaging materials' },
      { source: 'EudraLex Vol. 4, Annex 13 \u2014 IMPs', type: 'Regulation', jurisdiction: 'EU', relevance: 'EU clinical labeling reference' },
      { source: 'ISO/IEC 15415 \u2014 2D barcode grading', type: 'Standard', jurisdiction: 'Both', relevance: 'Print-quality grading for 2D Data Matrix (cross-link: Serialization)' },
      { source: 'ISO/IEC 15416 \u2014 Linear barcode grading', type: 'Standard', jurisdiction: 'Both', relevance: 'Print-quality grading for linear barcodes' },
      { source: 'GS1 General Specifications', type: 'Standard', jurisdiction: 'Both', relevance: 'Underlying barcode encoding standards' },
      { source: 'FDA Safety Considerations for Container Labels (2022)', type: 'Guidance', jurisdiction: 'US', relevance: 'Enforceable expectations for whitespace and color differentiation' },
      { source: 'EMA Readability Guideline', type: 'Guidance', jurisdiction: 'EU', relevance: 'EU readability expectations for labels and PILs' },
      { source: 'QRD templates and convention', type: 'Guidance', jurisdiction: 'EU', relevance: 'EU label formatting conventions' },
      { source: 'Commission Implementing rules \u2014 SmPC format', type: 'Guidance', jurisdiction: 'EU', relevance: 'EU SmPC format and content' },
      { source: 'FDA Quality Agreements guidance', type: 'Guidance', jurisdiction: 'US', relevance: 'CDMO Quality Agreement anchor' },
    ],
    confidenceNote:
      'Source list reflects Brian / ISC Stage 3 classification and requires final citation-format review before implementation. This is not a claim of exhaustive coverage. View full source details in Sources & Standards.',
  },

  whatItTouchesNext: {
    connectedTopics: [
      { topicName: 'Packaging', slug: 'packaging', connectionReason: 'Carton structural integrity is typically expected to support ATD application without premature tearing. Label adhesion, substrate, and cold-chain stress affect readability.' },
      { topicName: 'Serialization', slug: 'serialization', connectionReason: 'Artwork design typically allocates sufficient unvarnished whitespace for the 2D Data Matrix and human-readable text to achieve a passing barcode grade. Linear barcode (21 CFR 201.25) coexists with 2D (DSCSA). EU UI placement under Delegated Regulation 2016/161 is part of labeling.' },
      { topicName: 'Distribution & 3PLs', slug: 'distribution-3pls', connectionReason: '3PLs receive pre-labeled product and execute against label content. 3PLs handle returns and recalls from labeling errors. Country-specific labeling cut-overs typically call for coordinated stock segregation between Supply Chain and 3PL operations.' },
      { topicName: 'Returns / Recalls', slug: 'returns', connectionReason: 'Labeling mix-ups are a frequently cited cause of Class I and Class II recalls. Recall execution relies on label-driven traceability.' },
      { topicName: 'Importer / Distributor Responsibilities', slug: 'importer-distributor-responsibilities', connectionReason: 'Importers verify label compliance for destination market. EU importers may apply local-language overlays.' },
      { topicName: 'Release & Disposition Handoffs', slug: 'release-disposition-handoffs', connectionReason: 'QA release is conditional on printed component conformance. Reconciliation of printed components under 21 CFR 211.122 and 211.130 is a gating check.' },
      { topicName: 'Controlled Temperature Transport', slug: 'controlled-temperature-transport', connectionReason: 'Label readability and adhesion under cold conditions affect product identification. Print-quality grading under transport conditions is relevant for cold-chain products.' },
    ],
    handoffs: [
      { from: 'Supply Chain', to: 'CDMO / CMO', description: 'Label cut-over timing and component supply must align with packaging schedule \u2014 misaligned cut-over creates old-label / new-label co-existence risk on the line' },
      { from: 'Regulatory', to: 'Supply Chain', description: 'Late-breaking PI changes require rapid artwork and component response \u2014 late changes near PDUFA or CHMP opinion compress supply chain execution windows' },
      { from: 'Quality', to: 'Supply Chain', description: 'Incoming inspection results gate component release to the line \u2014 rejected lots require reprint and can delay packaging campaigns' },
    ],
    commonPitfalls: [
      'ERP cut-over to a new bill of materials before the CDMO has flushed the old version creates a window where in-transit work-in-process can be at risk against 21 CFR 211.130 expectations. System effectivity dates typically need to align with physical reality, not just the purchasing schedule.',
      'A packaging supplier\u2019s certificate of analysis does not substitute for incoming inspection. 21 CFR 211.122 typically calls for representative sampling of each shipment of labeling, with reduced testing only justified by formal supplier qualification.',
      'An approved artwork master is not enough \u2014 the camera or vision system verifying the printed result also requires validation. Without it, a smeared digit on a critical field such as expiry can pass the line undetected.',
    ],
    askNextPrompts: [
      'Have label cut-over dates been aligned with artwork approval, component availability, supplier production, and CDMO packaging calendars?',
      'Are barcode placement, clear zones, color, substrate, and print-quality expectations confirmed before printed components are ordered?',
      'Are obsolete printed components quarantined or destroyed when safety-related labeling changes take effect?',
      'Are artwork masters, printed components, and QA release records traceable across each packaging campaign?',
      'Are 3PLs prepared for country-specific cut-over, returns, recalls, and label-related stock segregation?',
    ],
  },
};

export const LABELING_ARTWORK_HEADER = {
  summary:
    'Labeling & Artwork is the product-presentation, printed-component, barcode-placement, version-control, and market-readiness layer that connects approved label content to packaging execution and distribution readiness.',
  ownershipPosture:
    'Shared ownership. Supply chain typically owns artwork timeline coordination, printed-component availability, label cut-over execution, CDMO / CMO coordination, packaging supplier readiness, barcode readability coordination, component change timing, and distribution-readiness impact. Regulatory, Quality, Commercial / Brand, the MAH / NDA holder, CDMO / CMO, artwork vendors, packaging suppliers, and serialization providers own adjacent decisions that determine whether label content is approved, artwork masters are controlled, and printed components are executable.',
  primaryHandoff:
    'Supply Chain \u2194 Regulatory \u2194 Quality \u2194 MAH / NDA Holder \u2194 CDMO / CMO \u2194 Artwork Vendor \u2194 Packaging Supplier \u2194 Serialization Provider',
  sourceCue:
    'Source-backed orientation \u00B7 FDA / EMA / European Commission / ISO / GS1 references listed below',
};
