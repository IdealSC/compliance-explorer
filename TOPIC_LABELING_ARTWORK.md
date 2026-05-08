# Topic: Labeling & Artwork

**Phase:** 5.2-M — Draft Topic File
**Date:** 2026-05-08
**Classification:** Product Design — Topic Content Draft
**Status:** Draft topic file — Brian / ISC review required before implementation
**Author:** Brian Adams + Design Partner
**Route:** `/topics/labeling-artwork`
**Source control:** Derived from `TOPIC_LABELING_ARTWORK_STAGE_3_REVIEW.md`
**Implementation status:** Do not implement yet

---

## ⛔ Implementation Hold Notice

This topic file is not yet implemented in the public app. Antigravity must not populate `/topics/labeling-artwork` from this file until Brian / ISC approves implementation in a separate phase.

---

## Topic Header

**Breadcrumb:** Topics / Labeling & Artwork

**Title:** Labeling & Artwork

**One-Sentence Summary:** Labeling & Artwork is the product-presentation, printed-component, barcode-placement, version-control, and market-readiness layer that connects approved label content to packaging execution and distribution readiness.

**Current Context:** `[US + EU] [NDA Holder / MAH] [Pre-commercial]`

**Ownership Posture:** Shared ownership. Supply chain typically owns artwork timeline coordination, printed-component availability, label cut-over execution, CDMO / CMO coordination, packaging supplier readiness, barcode readability coordination, component change timing, and distribution-readiness impact. Regulatory, Quality, Commercial / Brand, the MAH / NDA holder, CDMO / CMO, artwork vendors, packaging suppliers, and serialization providers own adjacent decisions that determine whether label content is approved, artwork masters are controlled, and printed components are executable.

**Most Important Handoff:** Supply Chain ↔ Regulatory ↔ Quality ↔ MAH / NDA Holder ↔ CDMO / CMO ↔ Artwork Vendor ↔ Packaging Supplier ↔ Serialization Provider

**Source Cue:** Source-backed orientation · FDA / EMA / European Commission / ISO / GS1 references listed below

**Section Anchors:** What this is | Ownership boundaries | Applicability | Regulatory chain | What it touches next

---

## 90-Second Scan

**What it is:** Labeling & Artwork covers the lifecycle of approved label content through artwork design, printed-component production, barcode placement, version control, cut-over management, and market-specific execution. It is the bridge between what Regulatory approves and what physically appears on the product at the packaging line.

**Why it matters to supply chain:** Labeling and artwork readiness is often a critical-path dependency for commercial launch. Printed components must be designed, approved, produced, inspected, version-controlled, and available before packaging can execute. A label change can cascade into artwork revisions, supplier reprints, line revalidation, serialization updates, inventory segregation, and distribution holds.

**What supply chain typically owns:** Artwork timeline and cut-over execution, printed-component availability, launch inventory impact, CDMO / CMO execution coordination, packaging supplier readiness, barcode readability coordination, component change timing, and distribution-readiness impact.

**Where ownership crosses functions:** The MAH / NDA holder owns approved label content and artwork master authority. Regulatory owns submission content and change pathways. Quality owns artwork approval, incoming inspection, line clearance, and change control. Commercial / Brand owns trade dress and marketing copy. The CDMO executes physical label application, variable-data printing, and vision-system verification. Artwork vendors own typesetting and proof generation. Packaging suppliers own printing, cutting, and delivering labels and cartons. Serialization providers own serial-range allocation and master data alignment.

**What changes by US vs EU:** US emphasis includes prescription-drug labeling format, linear barcode expectations under 21 CFR 201.25, medication-error risk reduction, and printed-component controls under 21 CFR 211.122 and 211.130. EU emphasis includes outer-pack safety features, anti-tampering devices, Unique Identifier placement, multi-language packs, QRD conventions, readability expectations, and printed-material handling controls under EudraLex Volume 4.

**What to look at next:** Packaging, Serialization, Distribution & 3PLs, Returns / Recalls, Importer / Distributor Responsibilities, Release & Disposition Handoffs, Controlled Temperature Transport.

---

## 1. What This Is

Labeling & Artwork is the regulated, cross-functional system that turns approved label content into physical printed components that appear on pharmaceutical products. It spans the lifecycle from approved label text through artwork master design, printed-component production, barcode placement, human-readable text, version control, and market-specific cut-over management.

For senior supply chain leaders, labeling and artwork matters because it sits at the intersection of regulatory approval, quality control, packaging execution, serialization, and distribution readiness. A labeling change — whether triggered by a safety update, a market expansion, or a routine revision — can affect artwork vendors, packaging suppliers, CDMO packaging lines, serialization configurations, inventory segregation, and 3PL stock management. The physical label is also where two barcode systems coexist on the same surface: the linear barcode encoding the NDC (US) and the 2D Data Matrix encoding the serial number under DSCSA (US) and FMD (EU).

**Key terms:**

- **Artwork master**: The controlled, approved electronic file from which all printed components are produced.
- **Printed component**: Any physical labeling item — label, carton, insert, leaflet — that must be specified, produced, inspected, and reconciled.
- **Label cut-over**: The managed transition from one approved label version to another, coordinated across supply, production, inventory, and distribution.
- **Linear barcode**: The traditional barcode encoding the NDC, typically expected under 21 CFR 201.25.
- **2D Data Matrix**: The two-dimensional barcode carrying product identifier, serial number, lot, and expiry under DSCSA and FMD requirements.
- **Anti-Tampering Device (ATD)**: A physical feature on EU outer packaging that shows evidence of opening, typically expected under Directive 2011/62/EU.
- **Human-readable text (HR text)**: The printed text accompanying barcode symbology — product name, NDC/GTIN, serial number, lot, expiry — that must be legible.
- **QRD template**: The Quality Review of Documents template used to format EU labels and SmPC content.
- **Label reconciliation**: The controlled accounting of printed components issued, used, damaged, and returned at the packaging line, typically addressed under 21 CFR 211.122 and 211.130.
- **Line clearance**: The verified removal of all labeling and packaging materials from a previous batch before starting the next, typically addressed under EudraLex Volume 4, Chapters 5 and 6.

**Common pitfall:** Electronic proof approval alone does not capture printer color drift. Physical color draw-downs are typically expected so two strengths do not end up looking alike under pharmacy lighting — the kind of drift that can be treated as an accuracy finding in data-integrity assessments.

---

## 2. Ownership Boundaries

### Ownership Posture

Shared ownership.

Supply chain typically owns the operational execution side of labeling and artwork: artwork timeline coordination, printed-component availability, label cut-over execution, CDMO / CMO coordination, packaging supplier readiness, barcode readability coordination, component change timing, launch inventory impact, and distribution-readiness impact. Supply chain does not usually own approved label content, artwork master approval, incoming inspection disposition, or regulatory change-pathway decisions. The core leadership task is to make sure labeling and artwork dependencies are visible, timed correctly, and governed by the right adjacent owners.

### Ownership Table

| Supply chain typically owns | Adjacent ownership | Other / handoff risk |
|---|---|---|
| Artwork timeline and cut-over execution | MAH / NDA Holder: approved label content (SPL, SmPC, PIL); submission of label changes (CBE-0, CBE-30, PAS; Type IA, IB, II); sponsor sign-off on artwork master and printed components | The MAH or NDA holder is typically regarded as the party accountable for ensuring label content aligns with the approved dossier. Misalignment between approval timing and component ordering creates cut-over risk. |
| Printed component availability | Regulatory: submission content (USPI, SmPC, SPL); defining regulatory pathway for changes; country-specific labeling overlays and timing alignment; market-authorization-aligned label review and approval | Late-breaking regulatory changes near PDUFA or CHMP opinion can force artwork revisions after components are already ordered or produced. |
| Launch inventory impact | Quality: approval of master artwork; verification of CDMO line clearance; change control on artwork and printed components; audit and inspection support for labeling records | Quality units typically perform incoming inspection, including AQL sampling, of printed components per 21 CFR 211.122. |
| CDMO / CMO execution coordination | CDMO: physical label application; printing variable data (lot, expiry, 2D Data Matrix); validation of camera vision systems; pack-line execution (print-and-verify, drop-on-demand); component receipt inspection vs. approved master; reject and rework handling for printed components; print-quality verification per ISO/IEC 15415 and 15416 | Quality Agreements between MAH / NDA holder and CDMO typically specify who verifies the final printed component against the approved master and who owns the investigation when there is a discrepancy in the variable-data print. |
| Packaging supplier readiness | Packaging Supplier: printing, cutting, delivering labels and cartons; color matching including physical draw-downs; component lot ID and traceability to approved master | Supplier changes may require qualification, change control, quality review, and regulatory assessment. |
| Barcode readability coordination | Serialization Provider: serial-range allocation affecting HR text; master data alignment (NDC, GTIN, product code, lot, expiry) | Barcode readability depends on unvarnished whitespace, substrate, and print quality — shared across artwork, supplier, and CDMO. Cross-link: Serialization. |
| Component change timing | Artwork Vendor: typesetting, proof generation, die-line alignment; artwork master version control; multi-language layout for EU presentations | Artwork vendor capacity and proof-cycle timing can become critical path during rapid label changes. |
| Distribution-readiness impact | Commercial / Brand: trade dress, Pantone palettes, marketing copy; brand consistency across markets | Distribution readiness depends on correct labeled product being available in the right market configuration at the right time. |

### Decision Rights

**Supply chain usually decides or leads:**

- Artwork timeline and cut-over schedule
- Printed-component ordering and availability tracking
- Label cut-over coordination across supply, production, inventory, and distribution
- Escalation when labeling and artwork dependencies threaten supply continuity or commercial execution

**Supply chain strongly influences:**

- CDMO / CMO packaging schedule and component supply model
- Packaging supplier readiness and reprint lead times
- Distribution-readiness timing for labeled product
- Inventory segregation during label cut-overs

**Supply chain does not usually own:**

- Approved label content or regulatory submission strategy
- Artwork master approval or quality sign-off
- Incoming inspection disposition of printed components
- Vision-system validation or line qualification
- Legal interpretation of labeling obligations

### Key Handoffs

| Handoff | Why it matters | Typical owner |
|---|---|---|
| Supply Chain ↔ MAH / NDA Holder | Label content approval timing directly affects artwork timeline, component ordering, and cut-over execution. | MAH / NDA Holder |
| Supply Chain ↔ Regulatory | Regulatory pathway for label changes (CBE-0, CBE-30, PAS; Type IA, IB, II) determines urgency and scope of artwork revisions. | Regulatory |
| Supply Chain ↔ Quality | Incoming inspection, artwork approval, line clearance, and change control are quality-system gating points for labeling. | Quality |
| Supply Chain ↔ CDMO / CMO | Packaging-line execution, variable-data printing, vision-system verification, and reject handling depend on component readiness and master data alignment. | CDMO / CMO |
| Supply Chain ↔ Artwork Vendor / Packaging Supplier | Proof cycles, print production, color matching, and delivery timing are operational dependencies owned by vendors but coordinated by supply chain. | Artwork Vendor / Packaging Supplier |

### Common Blindspot

The most common blindspot is assuming that an approved artwork master means the labeling is ready. In practice, the artwork master must flow through printed-component production, incoming inspection, CDMO receipt verification, line clearance, and variable-data print validation before the labeled product is ready for distribution. Each step introduces a potential delay or quality hold that supply chain needs to track.

---

## 3. Applicability

### Current Context Highlight

Current selected context: `US + EU · NDA Holder / MAH · Pre-commercial`

For this context, Labeling & Artwork should be treated as a high-priority shared-ownership topic. The key supply chain focus is readiness: artwork timeline clarity, printed-component supply, label cut-over planning, CDMO / CMO coordination, barcode placement confirmation, and distribution-readiness alignment before commercial execution begins. Dual-market artwork coordination — US labeling format alongside EU multi-language packs, ATD placement, and QRD conventions — is a common launch-delay driver.

---

### A. Jurisdiction Comparison

#### United States

US labeling and artwork expectations are shaped by prescription-drug labeling format requirements, linear barcode expectations under 21 CFR 201.25 with DSCSA 2D Data Matrix coexistence, visual differentiation guidance (tall-man lettering, contrasting colors, whitespace) under FDA Safety Considerations for Container Labels, medication-error risk reduction, printed-component controls under 21 CFR 211.122 and 211.130, patient labeling requirements under 21 CFR 208, and NDA labeling content expectations under 21 CFR 314.50.

**Supply chain should pay attention to:**

- Linear barcode encoding NDC under 21 CFR 201.25 coexisting with 2D Data Matrix under DSCSA
- Visual differentiation — tall-man lettering, contrasting colors, whitespace
- Medication Guide and Patient Package Insert requirements under 21 CFR 208
- 21 CFR 211.122 and 211.130 address the control of labeling material issuance, use, and reconciliation at the line
- Electronic records expectations under 21 CFR 11 for artwork-file storage

#### European Union

EU labeling and artwork expectations are shaped by outer-pack safety features and anti-tampering requirements under Directive 2011/62/EU and Delegated Regulation (EU) 2016/161, mandatory labeling content under Directive 2001/83/EC Articles 54–69, readability expectations under the EMA Readability Guideline, QRD templates for label and SmPC formatting, multi-language packs or clusters, and printed-material handling controls under EudraLex Volume 4 Chapters 5 and 6.

**Supply chain should pay attention to:**

- The FMD framework calls for physical Anti-Tampering Devices on outer packaging under Directive 2011/62/EU and Delegated Regulation (EU) 2016/161
- Multi-language packs or clusters are highly common and add change-control complexity
- Directive 2001/83/EC Articles 54–69 define the content elements expected on EU labels and Patient Information Leaflets
- The EMA Readability Guideline sets expectations for label and PIL readability in EU markets
- QRD templates apply to label and SmPC formatting
- EudraLex Volume 4 Chapters 5 and 6 address the handling, segregation, and line clearance expectations for printed packaging materials

#### What Stays Consistent Across US and EU

- Strict version control of physical labels and artwork masters
- Traceability of label master to printed component to packaged unit
- Print-quality grading aligned with ISO/IEC 15415 and 15416 (cross-link: Serialization)
- Readable barcodes, printed-component reconciliation, and line clearance
- Supplier execution and market-specific cut-over management

---

### B. Entity Role Impact

#### NDA Holder / MAH

For the NDA holder or MAH, accountability typically includes ensuring the physical label aligns with the dossier approved by the agency. The NDA holder or MAH owns the artwork master, submission content, and change-control authority, and signs off on printed components prior to packaging release.

**Supply chain focus:** Artwork timeline coordination · Label cut-over planning · Printed-component availability · CDMO / CMO execution coordination · Distribution-readiness alignment

#### Licensed US Distributor

As a licensed US distributor, the company does not own label content but encounters labeling-related complaints, recall execution under 21 CFR Part 7, and ATP intersection with labeling under DSCSA §582(a) (cross-link: Serialization).

**Supply chain focus:** Product identification and traceability · Labeling-related complaint handling · Recall support · ATP compliance intersection

#### Importer

As an importer, labeling relevance depends on destination market. In the EU, importers may apply or confirm local-language overlays. In the US, importers verify label requirements before introduction into commerce.

**Supply chain focus:** Import labeling state · Local-language overlays · Customs and regulatory handoffs · Label verification before distribution

#### 3PL

As a 3PL, the company stores, picks, and ships pre-labeled product. 3PLs encounter labeling at receipt, return, and recall verification. Some 3PLs perform secondary labeling or country-specific overlay services under MAH direction; this typically calls for explicit Quality Agreement provisions.

**Supply chain focus:** Pre-labeled product handling · Returns and recall verification · Secondary labeling provisions where applicable · Stock segregation during cut-overs

#### CDMO Relationship

In a CDMO relationship, the CDMO executes physical label application, variable-data printing, vision-system verification, pack-line print-and-verify, and component receipt inspection. Line equipment ownership and qualification varies by deal. Reject, rework, retain, and sample handling at serial / lot level are operational considerations.

**Supply chain focus:** Packaging schedule and component supply model · Quality Agreement boundaries · Variable-data print verification ownership · Reject and rework handling · Line qualification status

---

### C. Lifecycle Stage

#### Preclinical

Commercial labeling and artwork frameworks are usually not central in preclinical, when bench-stage product is governed by laboratory or research-use labeling instead.

#### Late-Stage Clinical

Focus shifts to blinding and Investigational Use Only (IUO) statements. Investigational product is typically governed by EudraLex Volume 4 Annex 13 (EU) and 21 CFR 312.6 (US) for labeling. Some sponsors begin commercial artwork master development in parallel with late-stage clinical execution.

#### Pre-Commercial and Launch

High risk of concurrent artwork versions near PDUFA date or CHMP opinion. Rapid-response print capabilities and tight artwork master version control are typically expected during the pre-commercial window. EMVO and DSCSA Tier 3 readiness intersect labeling execution (cross-link: Serialization). Pack-line print-and-verify validation is typically expected to be complete before first commercial production.

#### Post-Commercial

Managing safety updates, label expansions, country additions, routine artwork maintenance, change control, and vendor migrations. Exhausting old label stock during a CBE-0 safety-warning change can result in distribution that may be treated as misbranded under FD&C Act §502. Destruction or quarantine of obsolete stock is typically expected once the safety warning takes effect.

---

## 4. Regulatory Chain

### Source Chain

```
Law (FD&C Act / EU Directive 2001/83/EC / EU Directive 2011/62/EU)
  → Regulation (21 CFR 201, 208, 211, 314 / Delegated Reg. 2016/161 / EudraLex Vol. 4)
    → Standard (ISO/IEC 15415, 15416 / GS1 General Specifications)
      → Guidance (FDA Safety Considerations for Container Labels / EMA Readability Guideline / QRD Templates / FDA Quality Agreements)
```

### Key Sources

| Layer | Source / Standard | Jurisdiction | Why it matters |
|---|---|---|---|
| Law | FD&C Act §502 — Misbranded drugs | US | Anchor for old-stock-exhaustion risk and misbranding framework |
| Law | Directive 2001/83/EC, Title V, Art. 54–69 | EU | Foundational EU labeling provisions for outer and immediate packaging |
| Law | Directive 2011/62/EU (FMD) | EU | Foundational for ATD and UI inclusion on outer packaging |
| Regulation | 21 CFR 201 (Subparts A, B, C) and §201.25 | US | Prescription-drug labeling format and linear barcode expectations |
| Regulation | 21 CFR 208 — Medication Guides / PPI | US | US patient labeling requirements |
| Regulation | 21 CFR 211.122 and 211.130 | US | Labeling material issuance, use, and reconciliation |
| Regulation | 21 CFR 314.50 — NDA labeling content | US | Submission-side anchor for US label content |
| Regulation | 21 CFR 11 — Electronic Records | US | Anchor for ALCOA+ artwork-file storage expectations |
| Regulation | 21 CFR 312.6 — IND labeling | US | US clinical labeling reference |
| Regulation | Delegated Regulation (EU) 2016/161 | EU | Safety feature and UI technical requirements |
| Regulation | EudraLex Vol. 4, Ch. 5 and Ch. 6 | EU | Handling, segregation, and line clearance for printed packaging materials |
| Regulation | EudraLex Vol. 4, Annex 13 — IMPs | EU | EU clinical labeling reference |
| Standard | ISO/IEC 15415 — 2D barcode grading | Both | Print-quality grading for 2D Data Matrix (cross-link: Serialization) |
| Standard | ISO/IEC 15416 — Linear barcode grading | Both | Print-quality grading for linear barcodes |
| Standard | GS1 General Specifications | Both | Underlying barcode encoding standards |
| Guidance | FDA Safety Considerations for Container Labels (2022) | US | Enforceable expectations for whitespace and color differentiation |
| Guidance | EMA Readability Guideline | EU | EU readability expectations for labels and PILs |
| Guidance | QRD templates and convention | EU | EU label formatting conventions |
| Guidance | Commission Implementing rules — SmPC format | EU | EU SmPC format and content |
| Guidance | FDA Quality Agreements guidance | US | CDMO Quality Agreement anchor |

**Source confidence note:** Source list reflects Brian / ISC Stage 3 classification and requires final citation-format review before implementation. This is not a claim of exhaustive coverage. View full source details in Sources & Standards.

---

## 5. What It Touches Next

### Connected Topics

| Connected Topic | How it connects |
|---|---|
| **Packaging** | Carton structural integrity is typically expected to support ATD application without premature tearing. Label adhesion, substrate, and cold-chain stress affect readability. |
| **Serialization** | Artwork design typically allocates sufficient unvarnished whitespace for the 2D Data Matrix and human-readable text to achieve a passing barcode grade. Linear barcode (21 CFR 201.25) coexists with 2D (DSCSA). EU UI placement under Delegated Regulation 2016/161 is part of labeling. |
| **Distribution & 3PLs** | 3PLs receive pre-labeled product and execute against label content. 3PLs handle returns and recalls from labeling errors. Country-specific labeling cut-overs typically call for coordinated stock segregation between Supply Chain and 3PL operations. |
| **Returns / Recalls** | Labeling mix-ups are a frequently cited cause of Class I and Class II recalls. Recall execution relies on label-driven traceability. |
| **Importer / Distributor Responsibilities** | Importers verify label compliance for destination market. EU importers may apply local-language overlays. |
| **Release & Disposition Handoffs** | QA release is conditional on printed component conformance. Reconciliation of printed components under 21 CFR 211.122 and 211.130 is a gating check. |
| **Controlled Temperature Transport** | Label readability and adhesion under cold conditions affect product identification. Print-quality grading under transport conditions is relevant for cold-chain products. |

### Ownership Handoffs

| Handoff | Direction | Why it matters |
|---|---|---|
| Supply Chain → CDMO / CMO | Label cut-over timing and component supply must align with packaging schedule | Misaligned cut-over creates old-label / new-label co-existence risk on the line |
| Regulatory → Supply Chain | Late-breaking PI changes require rapid artwork and component response | Late changes near PDUFA or CHMP opinion compress supply chain execution windows |
| Quality → Supply Chain | Incoming inspection results gate component release to the line | Rejected lots require reprint and can delay packaging campaigns |

### Common Pitfalls

- ERP cut-over to a new bill of materials before the CDMO has flushed the old version creates a window where in-transit work-in-process can be at risk against 21 CFR 211.130 expectations. System effectivity dates typically need to align with physical reality, not just the purchasing schedule.
- A packaging supplier's certificate of analysis does not substitute for incoming inspection. 21 CFR 211.122 typically calls for representative sampling of each shipment of labeling, with reduced testing only justified by formal supplier qualification.
- An approved artwork master is not enough — the camera or vision system verifying the printed result also requires validation. Without it, a smeared digit on a critical field such as expiry can pass the line undetected.

### What to Ask Next

- Have label cut-over dates been aligned with artwork approval, component availability, supplier production, and CDMO packaging calendars?
- Are barcode placement, clear zones, color, substrate, and print-quality expectations confirmed before printed components are ordered?
- Are obsolete printed components quarantined or destroyed when safety-related labeling changes take effect?
- Are artwork masters, printed components, and QA release records traceable across each packaging campaign?
- Are 3PLs prepared for country-specific cut-over, returns, recalls, and label-related stock segregation?

### Suggested Next Pages

→ [Packaging](/topics/packaging)
→ [Serialization](/topics/serialization)
→ [Distribution & 3PLs](/topics/distribution-3pls)
→ [Returns](/topics/returns)
→ [Recalls](/topics/recalls)
→ [Importer / Distributor Responsibilities](/topics/importer-distributor-responsibilities)
→ [Release & Disposition Handoffs](/topics/release-disposition-handoffs)
→ [Controlled Temperature Transport](/topics/controlled-temperature-transport)

---

## Context-Specific Display Notes

Future implementation may adjust emphasis based on operating context:

| Context | Emphasis may shift toward |
|---|---|
| US + EU · NDA Holder / MAH · Pre-commercial | Dual-market artwork coordination, ATD and DSCSA barcode coexistence, label cut-over planning, launch-readiness dependencies |
| US · Licensed US Distributor · Post-commercial | Labeling-related complaint handling, recall execution from labeling errors, ATP intersection, product identification |
| EU · MAH · Pre-commercial | Multi-language pack coordination, ATD placement, QRD template compliance, EMVO readiness intersection |
| EU · Importer · Launch | Local-language overlay application, import labeling verification, market-specific cut-over coordination |
| US + EU · CDMO Relationship · Launch | Variable-data print verification ownership, vision-system validation, line clearance, Quality Agreement boundaries for printed-component inspection |

These are display-emphasis notes. They do not constitute applicability determinations.

---

## Internal Notes Not for Public Display

The following items were classified as Keep internal and were not used directly in public-facing sections:

- NotebookLM adversarial interjections (in-transit WIP cut-over risk, packaging supplier COA vs. incoming inspection, vision-system integrity) were not used as raw adversarial language. Where the classification provided a public-safe Common Pitfall rewrite, that rewrite was used in Section 5 common pitfalls.
- ALCOA+ / data-integrity flags (physical color profile shifts, native electronic artwork storage) were not used as raw adversarial language. Where the classification provided a public-safe Common Pitfall rewrite, that rewrite was used in Section 1 common pitfall.
- Operational risk questions (roll-label splicing controls) were retained as internal-only diligence prompts. No public version was created.
- Only public-safe Common Pitfall rewrites from the Stage 3 classification were eligible for public draft use.

Original adversarial language — including terms such as "direct violation," "violation," "liable," "adulterated," "misbranded product," "critical violation," and "fast track to a 483" — was not used in any public-facing section.

---

## Source Gaps Withheld From Public Copy

The following Source gap themes were withheld from public topic copy pending Brian / ISC verification:

1. **Bright stock controls** — quarantine and issuance of regional labels at 3PL. Withheld pending source verification.
2. **Barcode grading liability** — CMO vs. MAH under Quality Agreement. Withheld pending source verification.
3. **Vision-system validation evidence** — 21 CFR Part 11 and FDA/EU guidance level. Withheld pending source verification.
4. **Artwork vault status** — non-Part-11 repository migration pathway. Withheld pending source verification.
5. **Roll-splicing controls** — validated controls at printer. Withheld pending source verification.
6. **Late-breaking PI changes** — rapid-response print capability. Withheld pending source verification.
7. **Multi-language EU clusters** — change-control complexity. Withheld pending source verification.
8. **Post-Nov 2024 enforcement landscape** — current FDA/EU themes. Withheld pending source verification.

**Excluded:** Health Canada (GUI-0001) / ANVISA RDC No. 301 — non-US/EU jurisdiction content, outside current scope.

No source gaps were resolved. No external sources were verified. No withheld items were used as public content.

---

## Implementation Notes

- This file is ready for Brian / ISC review as a draft topic file.
- It is not authorized for app implementation.
- `/topics/labeling-artwork` remains placeholder-only until a separate implementation phase.
- A fidelity audit will be required after implementation to verify the implemented version matches this controlled draft.
- No Source gap or Exclude rows were used as public content.
- Keep-internal rows were not used directly; only public-safe Common Pitfall rewrites were used where the classification provided them.
- The five public sections follow the locked section order from `TOPIC_PAGE_TEMPLATE.md`.

---

## Acceptance Criteria

1. [x] `TOPIC_LABELING_ARTWORK.md` exists.
2. [x] The five required public sections are present and in order.
3. [x] Content is derived only from Approved rows, Revise reframes, and public-safe Common Pitfall rewrites.
4. [x] Source gap rows are withheld from public copy.
5. [x] Exclude rows are not used.
6. [x] Original NotebookLM adversarial language is not used as public copy.
7. [x] No app code changed.
8. [x] `/topics/labeling-artwork` remains placeholder-only.
9. [x] No source, citation, or obligation records were added to the app.
10. [x] Brian / ISC review is required before implementation.

---

## Stage Gate

| Field | Value |
|---|---|
| Topic | Labeling & Artwork |
| File | `TOPIC_LABELING_ARTWORK.md` |
| Status | Draft topic file — Brian / ISC review required before implementation |
| Stage | 5.2-M — Draft Topic File |
| Source | `TOPIC_LABELING_ARTWORK_STAGE_3_REVIEW.md` |
| Implementation | Not authorized |
| Next phase | Brian / ISC review → Implementation phase |

---

> **Governance Notice:** This document is a controlled topic draft derived from the Labeling & Artwork Stage 3 classification. It does not constitute legal advice or approved regulatory interpretation. All content remains subject to Brian / ISC final acceptance before any public use or app implementation.
