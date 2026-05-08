# Labeling & Artwork — Stage 2 Source-Anchored Draft Packet

**Phase:** 5.2-J — Stage 2 Source-Anchored Draft Packet
**Date:** 2026-05-08
**Classification:** Product Design — Topic Draft Packet
**Status:** Stage 2 — Source-Anchored Draft Packet
**Author:** Brian Adams + Design Partner
**Route:** `/topics/labeling-artwork`
**Implementation status:** Do not implement

---

## ⛔ Implementation Hold Notice

This Stage 2 packet is not approved topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/labeling-artwork` from this packet. A separate approved `TOPIC_LABELING_ARTWORK.md` file is required before implementation.

---

## 1. Status

| Field | Value |
|---|---|
| Topic | Labeling & Artwork |
| Route | `/topics/labeling-artwork` |
| Stage | 2 — Source-Anchored Draft Packet |
| Previous stage | 1 — Draft Content Preparation (Phase 5.2-I, commit `f7459e4`) |
| Implementation | Not authorized |
| Public content | Not created |
| Source review | Brian / ISC input notes received |
| Brian / ISC classification | Not started — requires Stage 3 |

---

## 2. Source Inventory

Brian / ISC draft source inputs — requires Stage 3 review before public use.

### Primary Stress-Tested Anchors

| Source Body / Source | Jurisdiction | Brian-Provided Status | Why It Matters | Public-Use Status |
|---|---|---|---|---|
| 21 CFR 201 (Subparts A, B, C) and §201.25 | US | Brian-provided status: Verified | Dictates general labeling requirements, specific formatting for prescription drugs, and mandatory linear barcode (NDC) inclusion. | Candidate for approved source list |
| FMD Directive 2011/62/EU and Delegated Regulation (EU) 2016/161 | EU | Brian-provided status: Verified | Mandates inclusion of the Unique Identifier (UI) and physical Anti-Tampering Devices (ATD) on outer packaging. | Candidate for approved source list |
| FDA Safety Considerations for Container Labels and Carton Labeling to Minimize Medication Errors (2022 guidance) | US | Brian-provided status: Verified | Establishes enforceable expectations for whitespace, color differentiation, and layout to prevent wrong-drug errors. | Candidate for approved source list |
| EudraLex Volume 4, Chapter 5 (Production) and Chapter 6 (Quality Control) | EU | Brian-provided status: Verified | Governs strict handling, segregation, and line clearance for printed packaging materials to prevent mix-ups. | Candidate for approved source list |
| 21 CFR 211.122 (Materials examination and usage criteria) and 21 CFR 211.130 (Packaging and labeling operations) | US | Brian-provided status: Verified | Mandates strict control over the issuance, use, and reconciliation of labeling materials. | Candidate for approved source list |

### Supporting References

| Source Body / Source | Jurisdiction | Brian-Provided Status | Why It Matters | Public-Use Status |
|---|---|---|---|---|
| 21 CFR 208 — Medication Guides and Patient Package Inserts | US | Brian-provided status: Verified | US patient labeling requirements where applicable. | Candidate for approved source list |
| 21 CFR 314.50 — Content and format of an NDA, including labeling | US | Brian-provided status: Verified | Submission-side anchor for US label content. | Candidate for approved source list |
| 21 CFR 11 — Electronic Records; Electronic Signatures | US | Brian-provided status: Verified | Anchor for the ALCOA+ artwork-file storage flag in Section 8. | Candidate for approved source list |
| 21 CFR 312.6 — Labeling of an investigational new drug | US | Brian-provided status: Verified | US clinical labeling reference for lifecycle notes. | Candidate for approved source list |
| Directive 2001/83/EC, Title V, Articles 54–69 — Labelling and Package Leaflet | EU | Brian-provided status: Verified | Foundational EU labeling provisions, mandatory content, language, blue box. | Candidate for approved source list |
| Commission Implementing rules on the format of the SmPC | EU | Brian-provided status: Verified | EU SmPC format and content. | Candidate for approved source list |
| EMA Guideline on the Readability of the Labelling and Package Leaflet | EU | Brian-provided status: Verified | Operational EU readability expectations for label and PIL. | Candidate for approved source list |
| QRD (Quality Review of Documents) templates and convention | EU | Brian-provided status: Verified | Standard formatting and language conventions for EU label artifacts. | Candidate for approved source list |
| EudraLex Volume 4, Annex 13 — Investigational Medicinal Products | EU | Brian-provided status: Verified | EU clinical labeling reference for lifecycle notes. | Candidate for approved source list |
| FDA Contract Manufacturing Arrangements for Drugs: Quality Agreements | US | Brian-provided status: Verified | Anchor for CDMO Quality Agreement provisions. | Candidate for approved source list |
| FD&C Act §502 — Misbranded drugs and devices | US | Brian-provided status: Verified | Anchor for post-commercial old-stock-exhaustion adversarial flag. | Candidate for approved source list |

### Reference Standards

| Source Body / Source | Jurisdiction | Brian-Provided Status | Why It Matters | Public-Use Status |
|---|---|---|---|---|
| ISO/IEC 15415 — 2D barcode print-quality grading | Both | Brian-provided status: Reference standard | Cited in Serialization context. | Candidate for approved source list |
| ISO/IEC 15416 — Linear barcode print-quality grading | Both | Brian-provided status: Reference standard | Linear barcode grading complement to 15415. | Candidate for approved source list |
| GS1 General Specifications | Both | Brian-provided status: Reference standard | Underlying standards for both linear and 2D barcode encoding on labels. | Candidate for approved source list |

### Reserved — Stress-Test Source Candidates

| Source Body / Source | Jurisdiction | Brian-Provided Status | Why It Matters | Public-Use Status |
|---|---|---|---|---|
| *(reserved — stress-test source candidate)* | — | — | — | — |
| *(reserved — stress-test source candidate)* | — | — | — | — |
| *(reserved — stress-test source candidate)* | — | — | — | — |

**Note:** Rows belong in the Source Inventory when a source candidate exists at any status (Verified, Draft reference, or Source gap). Rows belong in the Open Questions / Source Gaps table (Section 11) when no source candidate exists yet — only a question or knowledge gap.

---

## 3. Supply Chain Ownership Notes

Brian / ISC draft ownership inputs — requires Stage 3 review before public use.

- **Artwork timeline and cut-over execution:** coordinating the phase-in / phase-out of printed components to align with the Master Production Schedule and regulatory implementation dates.
- **Printed component availability:** ensuring the packaging supplier delivers physical labels and cartons to the CDMO prior to batch execution.
- **Launch inventory impact:** calculating safety stock requirements during a labeling change to prevent stock-outs.
- **CDMO / CMO execution coordination:** scheduling artwork releases, packaging campaigns, and component cut-over to match CDMO production calendars.
- **Packaging supplier readiness:** lead-time management, supplier qualification status, and capacity confirmation for new artwork or new presentations.
- **Barcode readability coordination:** working with packaging supplier and CDMO so 2D Data Matrix and linear barcode placement, color, and substrate yield a passing print-quality grade at the line.
- **Component change timing:** sequencing artwork master updates, packaging supplier production runs, and CDMO inventory consumption to avoid stranded stock.
- **Distribution-readiness impact:** coordination with Distribution and 3PLs on country-specific labeling cut-overs, especially EU multi-language clusters, and on market-specific stock segregation.

---

## 4. Adjacent Ownership Notes

Brian / ISC draft adjacent-ownership inputs — requires Stage 3 review before public use.

### MAH / NDA Holder

- Approved label content — SPL in the US; SmPC and Patient Information Leaflet in the EU.
- Submission of label changes through the relevant regulatory pathway: US CBE-0, CBE-30, Prior Approval Supplement; EU Type IA, IB, II variations.
- Final accountability for label compliance with the approved dossier.
- Sponsor sign-off on artwork master and on printed components prior to packaging release.

### Regulatory

- Submission content: USPI, SmPC, SPL.
- Defining the regulatory pathway for changes: CBE-0, CBE-30, Prior Approval Supplement, or Type IA / IB / II variations.
- Country-specific labeling overlays and timing alignment with regulatory implementation dates.
- Market-authorization-aligned label review and approval.

### Quality

- Approval of the master artwork.
- Incoming inspection: AQL sampling of printed components.
- Verification of CDMO line clearance.
- Change control on artwork and printed components.
- Audit and inspection support for labeling and artwork records.

### Commercial / Brand

- Trade dress, Pantone color palettes, and marketing copy within regulatory confines.
- Brand consistency across markets where regulatory format requirements differ.

### CDMO / CMO

- Physical application of the label.
- Printing of variable data: lot, expiry, 2D Data Matrix at the line.
- Validation of automated camera vision systems, such as Systech or Antares.
- Pack-line execution: in-line print-and-verify, drop-on-demand, pre-printed components.
- Component receipt inspection: artwork conformance vs. approved master.
- Reject and rework handling for printed components.
- Print-quality verification per ISO/IEC 15415 and ISO/IEC 15416.

### Artwork Vendor

- Typesetting, proof generation, and structural die-line alignment.
- Artwork master version control where the vendor manages the file system.
- Multi-language layout for EU presentations.

### Packaging Supplier

- Printing, cutting, and delivering the physical labels and cartons.
- Color matching to the approved master, including physical color draw-downs.
- Component lot identification and traceability back to the approved artwork master.

### Serialization Provider

- Coordination of serial-range allocation that affects the human-readable text on the label.
- Master data alignment with label content: NDC, GTIN, product code, lot, expiry placement.

---

## 5. Jurisdiction Notes

Brian / ISC draft jurisdiction inputs — requires Stage 3 review before public use.

### US

- Requires a linear barcode encoding the NDC under 21 CFR 201.25 concurrently with the DSCSA 2D Data Matrix.
- High scrutiny on visual differentiation to prevent medication errors — tall-man lettering, contrasting colors for different strengths, whitespace, layout.
- 21 CFR 208 Medication Guide and Patient Package Insert requirements where applicable.
- 21 CFR 211.122 and 211.130 govern strict control over labeling material issuance, use, and reconciliation at the line.

### EU

- Requires physical Anti-Tampering Devices on the outer packaging under Directive 2011/62/EU and Delegated Regulation (EU) 2016/161.
- Multi-language packs or clusters are highly common.
- Mandatory content under Directive 2001/83/EC Articles 54–69; Patient Information Leaflet under Annex III.
- Readability obligations under the EMA Readability Guideline.
- QRD templates apply to label and SmPC formatting.
- EudraLex Volume 4 Chapter 5 and Chapter 6 govern handling, segregation, and line clearance for printed packaging materials.

### Both

- Strict version control of physical labels.
- Traceability of label master from artwork system to printed component to packaged unit.
- Print-quality grading aligned with ISO/IEC 15415 and ISO/IEC 15416 where applicable.

---

## 6. Entity Role Notes

Draft entity-role inputs — requires Brian / ISC review before public use.

### NDA Holder / MAH

Brian input — requires Stage 3 review before public use.

- Holds ultimate legal responsibility for ensuring the physical label perfectly matches the dossier approved by the agency.
- Owns the artwork master, regulatory submission content, and change-control authority.
- Signs off on printed components prior to packaging campaign release.

### Licensed US Distributor

Brian input — requires Stage 3 review before public use.

- Typically does not own label content but encounters labeling-related complaints: legibility, missing inserts, mis-prints.
- Handles recall execution under 21 CFR Part 7 when labeling errors trigger withdrawal.
- ATP responsibilities under DSCSA §582(a) intersect labeling at the saleable presentation.

### Importer

Brian input — requires Stage 3 review before public use.

- For products imported into the EU from third countries, may be responsible for applying or confirming local-language labeling overlays before product enters EU commerce.
- For US imports, the importer of record does not typically modify labeling but verifies that imported product meets US label requirements before introduction into commerce.

### 3PL

Brian input — requires Stage 3 review before public use.

- Does not modify labeling but stores, picks, and ships pre-labeled product.
- Encounters labeling at receipt verification, saleable return verification, and recall execution.
- Some 3PLs perform secondary labeling or country-specific overlay services under MAH direction; this requires explicit Quality Agreement provisions.

### CDMO Relationship

Brian input — requires Stage 3 review before public use.

- The Quality Agreement must explicitly define who verifies the final printed component against the approved master.
- The Quality Agreement should define who owns the investigation if there is a discrepancy in the variable-data print.
- Line equipment ownership and qualification varies by deal.
- Reject, rework, retain, and sample handling at the serial / lot level.

---

## 7. Lifecycle Notes

Brian input — requires Stage 3 review before public use.

### Preclinical

- Not applicable for commercial labeling and artwork.
- Bench-stage product is governed by laboratory or research-use labeling, not commercial regulatory frameworks.

### Late-Stage Clinical

- Focus is on blinding and strict inclusion of Investigational Use Only statements.
- Must comply with EudraLex Volume 4 Annex 13 or 21 CFR 312.6.
- Some sponsors begin commercial artwork master development in parallel with late-stage clinical, anticipating launch artwork needs.

### Pre-Commercial and Launch

- High risk of concurrent artwork versions as regulatory negotiations alter the final Prescribing Information weeks before PDUFA / CHMP dates.
- Requires rapid-response print capabilities and tight artwork master version control.
- EMVO master-data upload and DSCSA T3 readiness intersect labeling at the human-readable and barcode placement level.
- Pack-line print-and-verify validation must be complete before first commercial production.

### Post-Commercial

- Managing safety updates, label expansions, and country additions.
- Routine artwork master maintenance, change control on packaging supplier sites, and artwork vendor migrations.

---

## 8. Related Topic Notes

Brian / ISC draft related-topic inputs — requires Stage 3 review before public use.

### Packaging

- Structural integrity of the carton must support application of the ATD without tearing prematurely.
- Label adhesion, substrate selection, and cold-chain stress tolerance all touch labeling readability.

### Serialization

- Artwork must allocate sufficient unvarnished whitespace for the 2D Data Matrix and human-readable text to achieve a passing ISO/IEC 15415 barcode grade.
- Linear barcode placement under 21 CFR 201.25 must coexist with 2D Data Matrix placement under DSCSA.
- For EU presentations, UI placement under Delegated Regulation (EU) 2016/161 is part of the labeling design.

### Distribution & 3PLs

- 3PLs typically receive pre-labeled product and execute against label content: lot, expiry, NDC.
- 3PLs handle returns and recall execution that may originate from labeling errors.
- Country-specific labeling cut-overs require coordinated stock segregation between Supply Chain and 3PL operations.

### Returns / Recalls

- Labeling mix-ups remain a leading cause of Class I and Class II recalls globally.
- Recall execution under 21 CFR Part 7 and EU recall mechanisms relies on label-driven traceability.

### Importer / Distributor Responsibilities

- Importers verify that imported product carries label content compliant with the destination market.
- For EU imports, importers may apply or confirm local-language labeling overlays.

### Release & Disposition Handoffs

- QA release of a packaged batch is conditional on confirmed conformance of printed components to the approved master.
- Reconciliation of printed component receipt, issuance, use, and destruction is part of the batch record under 21 CFR 211.122 and 211.130.

### Controlled Temperature Transport

- Label readability and adhesion under refrigerated, frozen, and ultra-cold conditions is a packaging-engineering and labeling design consideration.
- ISO/IEC 15415 print-quality grading should be evaluated under expected transport conditions, not only at the line.

---

## 9. Internal Editorial Risk Notes — Not Public Copy

The following items are from Brian / ISC's NotebookLM compliance hub stress-test pass. They are preserved as internal editorial risk notes for Stage 3 classification. They are not approved for public wording.

### Adversarial Interjections

**Stress-test issue #1 — In-transit unlabeled WIP cut-over risk**

> While Supply Chain manages the physical cut-over timeline, they routinely fail to account for in-transit unlabeled WIP. If the ERP system cuts over to a new Bill of Materials while the CDMO is still processing the old version, there is a risk of a direct 21 CFR 211.130 mix-up violation during receipt. System effectivity dates must match physical reality, not just the purchasing schedule.

Status: Stress-test issue. Requires Brian / ISC review. Not approved for public wording. May inform common pitfalls or what-to-ask-next prompts later.

---

**Stress-test issue #2 — Packaging supplier COA vs. incoming inspection**

> Do not assume the packaging supplier's COA replaces the Quality Unit's incoming inspection. 21 CFR 211.122 requires representative sampling of each shipment of labeling. Relying solely on a printer's COA without a rigorous supplier qualification and reduced-testing justification is a fast track to a 483.

Status: Stress-test issue. Requires Brian / ISC review. Not approved for public wording. May inform common pitfalls or what-to-ask-next prompts later.

---

**Stress-test issue #3 — Electronic proof vs. physical color draw-down**

> Firms often assume an electronic PDF proof approval is sufficient. However, if the printer's physical color profile shifts during a run, resulting in two different strengths looking identical under harsh pharmacy lighting, this may violate the ALCOA+ principle of accurate representation of the approved master. Print proofs must include physical color draw-downs.

Status: Stress-test issue. Requires Brian / ISC review. Not approved for public wording. May inform common pitfalls or what-to-ask-next prompts later.

---

**Stress-test issue #4 — Old-stock exhaustion after CBE-0 safety change**

> Supply Chain frequently pushes to exhaust old label inventory to save margin. If a CBE-0 label change involves a critical safety warning, exhausting old stock can constitute distributing misbranded product under FD&C Act Section 502. Regulatory and Quality must enforce hard destruction orders for obsolete stock.

Status: Stress-test issue. Requires Brian / ISC review. Not approved for public wording. May inform common pitfalls or what-to-ask-next prompts later.

---

**Stress-test issue #5 — Vision-system integrity**

> The artwork may be approved, but the vision system checking it also needs validation. A perfect label is not enough if the CMO camera allows a smeared 8 to pass as a 3 in the expiry date.

Status: Stress-test issue. Requires Brian / ISC review. Not approved for public wording. May inform common pitfalls or what-to-ask-next prompts later.

---

### ALCOA+ / Data-Integrity Flags

Internal risk prompt — requires Brian / ISC review before any public use.

> Are the native electronic artwork files, such as Adobe Illustrator, stored in a 21 CFR Part 11 compliant vault with audit trails, or are they sitting in an uncontrolled SharePoint folder managed by the Commercial team? If the latter, the Original and Contemporaneous aspects of ALCOA+ are destroyed. There is no proof of who changed a warning statement.

Status: Internal risk prompt. Not public topic copy.

---

### Operational Risk Questions

Internal diligence prompt — not public topic copy.

> How is roll-label splicing controlled at the printer to prevent a roll of 10 mg labels being spliced onto a roll of 50 mg labels?

Status: Internal diligence prompt. Not public topic copy. Do not answer.

---

## 10. Known Source Gaps and Open Questions

| Question / Gap | Area | Status | Brian / ISC Notes |
|---|---|---|---|
| Bright stock controls: if the product is stored as bright stock (unlabeled vials) at the 3PL before final country-specific labeling, does the Quality System adequately control quarantine and issuance of regional labels? | Ownership / Quality | Open — requires Brian / ISC review before topic drafting | — |
| Barcode grading liability: who owns verification of GS1 barcode grading at the point of application? If the CMO applies the label but the ink smears during cartoning, what does the Quality Agreement define? | Ownership / Quality Agreement | Open — requires Brian / ISC review before topic drafting | — |
| Vision-system validation evidence: what level of validation evidence is required for camera-based label / print verification systems to satisfy both 21 CFR Part 11 and relevant FDA or EU guidance? | Quality / Validation | Open — requires Brian / ISC review before topic drafting | — |
| Artwork vault status: if artwork master files currently sit in a non-Part-11-compliant repository, what is the migration pathway and timeline? | Data Integrity / ALCOA+ | Open — requires Brian / ISC review before topic drafting | — |
| Roll-splicing controls: what validated controls at the printer prevent label-roll splicing across SKUs or strengths? | Operational Risk | Open — requires Brian / ISC review before topic drafting | — |
| Late-breaking PI changes: what rapid-response print capability is in place for a regulatory-driven label change inside the final weeks before PDUFA / CHMP? | Pre-commercial / Launch | Open — requires Brian / ISC review before topic drafting | — |
| Multi-language EU clusters: which markets are currently served by clustered labeling, and what is the change-control complexity of a single member-state regulatory update? | EU Applicability | Open — requires Brian / ISC review before topic drafting | — |
| Post-Nov 2024 enforcement landscape: any current FDA or EU enforcement themes specific to labeling and artwork — verify before publication | Enforcement / Source Gap | Open — requires Brian / ISC review before topic drafting | — |
| *(reserved — stress-test question)* | — | Open — requires Brian / ISC review before topic drafting | — |
| *(reserved — stress-test question)* | — | Open — requires Brian / ISC review before topic drafting | — |

**Note:** Rows here are questions or gaps for which no candidate source has yet been identified. Once a candidate source is identified — even if the source itself is unverified or in draft — the row migrates to the Source Inventory (Section 2).

---

## 11. Drafting Implications for Future TOPIC_LABELING_ARTWORK.md

This section maps available input material to the eventual five public sections. Do not draft final public copy.

### Section 1 — What This Is

Available input: Source inventory (19 sources across US, EU, and both jurisdictions), Supply Chain ownership themes (8 themes), jurisdiction comparison notes (US, EU, both). Sufficient material exists to draft the lead paragraph, key terms, and supply chain relevance statement.

### Section 2 — Ownership Boundaries

Available input: Supply Chain ownership notes (8 themes), adjacent ownership notes (8 functional areas with detailed bullets). Sufficient material exists to draft the ownership table, decision rights, key handoffs, and common blindspot.

### Section 3 — Applicability

Available input: Jurisdiction notes (US, EU, both), entity role notes (5 roles), lifecycle notes (4 stages). Sufficient material exists to draft jurisdiction comparison, entity role profiles, and lifecycle stage descriptions.

### Section 4 — Regulatory Chain

Available input: 5 primary anchors, 11 supporting references, 3 reference standards. Sufficient material exists to draft the 5-level regulatory chain and key sources table.

### Section 5 — What It Touches Next

Available input: Related topic notes (7 topics with relationship descriptions), stress-test outputs (5 adversarial interjections that may inform common pitfalls), open questions (8 gaps that may inform what-to-ask-next prompts). Sufficient material exists to draft connected topics, ownership handoffs, common pitfalls, and ask-next prompts.

---

## 12. Brian / ISC Review Checklist

- [ ] Source inventory reviewed
- [ ] Source statuses confirmed
- [ ] Stress-test outputs reviewed
- [ ] Internal-only notes separated
- [ ] Ownership boundaries reviewed
- [ ] Adjacent ownership notes reviewed
- [ ] US / EU notes reviewed
- [ ] Entity role notes reviewed
- [ ] Lifecycle notes reviewed
- [ ] Related-topic notes reviewed
- [ ] Source gaps reviewed
- [ ] Public-use suitability decisions pending Stage 3 classification
- [ ] `TOPIC_LABELING_ARTWORK_STAGE_3_REVIEW.md` authorized
- [ ] `TOPIC_LABELING_ARTWORK.md` not yet authorized
- [ ] `/topics/labeling-artwork` implementation not yet authorized

---

## 13. Stage Gate

Stage 2 is complete when the packet contains Brian / ISC source notes, ownership notes, applicability notes, related-topic notes, stress-test outputs, and open gaps, but before any public-use classification occurs.

The next controlled phase is Phase 5.2-K — Stage 3 Classification. That phase will classify each input as Approved, Revise, Keep internal, Source gap, or Exclude.

---

## ⛔ Implementation Hold Notice

This Stage 2 packet is not approved topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/labeling-artwork` from this packet. A separate approved `TOPIC_LABELING_ARTWORK.md` file is required before implementation.

---

> **Governance Notice:** This Stage 2 packet contains Brian / ISC source notes and stress-tested input material for the Labeling & Artwork topic. It does not constitute legal advice or approved regulatory interpretation. All content remains subject to Stage 3 classification and Brian / ISC review before any public use.
