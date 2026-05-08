# Labeling & Artwork — Stage 3 Unified Classification Packet

**Phase:** 5.2-L — Stage 3 Classification Decisions
**Date:** 2026-05-08
**Classification:** Product Design — Stage 3 Classification Packet
**Status:** Stage 3 — Classification Complete / Pending Brian Final Acceptance
**Author:** Brian Adams + Design Partner
**Route:** `/topics/labeling-artwork`
**Implementation status:** Do not implement

---

## ⛔ Implementation Hold Notice

This Stage 3 classification packet is not approved topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/labeling-artwork` from this packet. A separate approved `TOPIC_LABELING_ARTWORK.md` file is required before implementation.

---

## 1. Review Status

| Field | Value |
|---|---|
| Topic | Labeling & Artwork |
| Route | `/topics/labeling-artwork` |
| Stage | 3 — Classification Complete / Pending Brian Final Acceptance |
| Previous stage | 2 — Source-Anchored Draft Packet (Phase 5.2-J, commit `121b4b5`) |
| Classification packet | Phase 5.2-K, commit `8e47cec` |
| Implementation | Not authorized |
| Public content | Not created |
| Classification status | All rows classified — 18 specific overrides applied |

---

## 2. Decision Label Legend

### Approved
Safe for public topic copy. Use as orientation for senior supply chain leaders.

### Revise
Useful but wording is too strong, too detailed, too legalistic, or too operationally specific. Reframe before public use. Reviewer note includes proposed public-safe reframe when available.

### Keep internal
Useful for editorial judgment, QA, risk awareness, implementation planning, supplier audit checklists, or client engagement diligence. Do not appear publicly unless later converted into an approved public-safe Common Pitfall or what-to-ask-next prompt.

### Source gap
May be correct, but source, citation, current enforcement posture, exact wording, current revision, or applicability requires verification before publication.

### Exclude
Out of scope, outside the current US/EU focus, not useful to the target user, or belongs in another topic.

---

## 3. Classification Decision Rules

Stage 3 is not a legal interpretation exercise from scratch. It is a publication-readiness review of Brian / ISC input notes.

**Default rules:**
1. Core verified source anchors may be Approved.
2. Reference standards may be Approved.
3. Strong legal language should usually be Revise.
4. NotebookLM / adversarial interjections should usually be Keep internal.
5. ALCOA+ / data-integrity flags should usually be Keep internal or Source gap.
6. Operational risk questions should usually be Keep internal.
7. Current enforcement posture questions should be Source gap.
8. Non-US/EU jurisdiction content should be Exclude.

**Rule refinements:**
- **Rule 4 refinement:** Each Keep-internal interjection carries a paired Common Pitfall candidate or explicit "No public version — internal only."
- **Rule 3 refinement:** Trigger words for Revise: must, shall, mandates, requires, mandatory, ultimate legal responsibility, perfectly matches, violation, liable, adulterated, misbranded, direct violation, critical violation, fast track to a 483.
- **Rule 9:** Citations in Approved rows should be specific. Rows citing only a body name without a specific provision classify as Source gap.
- **Rule 10:** Approved rows should not duplicate content already in scope for Packaging or Serialization. Cross-link where overlap exists.

---

## 4. Unified Classification Table

| Section | Item | Decision | Reviewer Note |
|---|---|---|---|
| 1 — Sources | 21 CFR 201 (Subparts A, B, C) and §201.25 | Approved | Core verified source anchor. Foundational for linear barcode mandates. [Source: 21 CFR 201.25] |
| 1 — Sources | FMD Directive 2011/62/EU and Delegated Regulation (EU) 2016/161 | Approved | Core verified source anchor. Foundational for ATD and UI inclusion. [Source: Directive 2011/62/EU] |
| 1 — Sources | FDA Safety Considerations for Container Labels (2022) | Approved | Reference standard. Establishes enforceable expectations for whitespace and color differentiation. [Source: FDA Safety Considerations for Container Labels] |
| 1 — Sources | EudraLex Vol. 4, Ch. 5 (Production) and Ch. 6 (Quality Control) | Approved | Core verified source anchor. Governs handling, segregation, line clearance for printed packaging materials. [Source: EudraLex Vol. 4, Ch. 5–6] |
| 1 — Sources | 21 CFR 211.122 and 211.130 | Approved | Core verified source anchor. Labeling material issuance, use, reconciliation. [Source: 21 CFR 211.122, 211.130] |
| 1 — Sources | 21 CFR 208 — Medication Guides / PPI | Approved | Verified supporting reference. US patient labeling requirements. [Source: 21 CFR 208] |
| 1 — Sources | 21 CFR 314.50 — NDA labeling content | Approved | Verified supporting reference. Submission-side anchor for US label content. [Source: 21 CFR 314.50] |
| 1 — Sources | 21 CFR 11 — Electronic Records | Approved | Verified supporting reference. Anchor for ALCOA+ artwork-file storage. [Source: 21 CFR 11] |
| 1 — Sources | 21 CFR 312.6 — IND labeling | Approved | Verified supporting reference. US clinical labeling reference. [Source: 21 CFR 312.6] |
| 1 — Sources | Directive 2001/83/EC, Title V, Art. 54–69 | Approved | Verified supporting reference. Foundational EU labeling provisions. [Source: Directive 2001/83/EC, Art. 54–69] |
| 1 — Sources | Commission Implementing rules — SmPC format | Approved | Verified supporting reference. EU SmPC format and content. [Source: Commission Implementing rules on SmPC] |
| 1 — Sources | EMA Readability Guideline | Approved | Verified supporting reference. EU readability expectations. [Source: EMA Guideline on Readability] |
| 1 — Sources | QRD templates and convention | Approved | Verified supporting reference. EU label formatting conventions. [Source: QRD templates] |
| 1 — Sources | EudraLex Vol. 4, Annex 13 — IMPs | Approved | Verified supporting reference. EU clinical labeling reference. [Source: EudraLex Vol. 4, Annex 13] |
| 1 — Sources | FDA Quality Agreements guidance | Approved | Verified supporting reference. CDMO Quality Agreement anchor. [Source: FDA Contract Manufacturing Arrangements for Drugs: Quality Agreements] |
| 1 — Sources | FD&C Act §502 — Misbranded drugs | Revise | Anchor for old-stock-exhaustion adversarial flag. Proposed reframe per Override 4. [Source: FD&C Act §502] |
| 1 — Sources | ISO/IEC 15415 — 2D barcode grading | Approved | Reference standard. Cross-link to Serialization topic. [Source: ISO/IEC 15415] |
| 1 — Sources | ISO/IEC 15416 — Linear barcode grading | Approved | Reference standard. Linear barcode grading complement. [Source: ISO/IEC 15416] |
| 1 — Sources | GS1 General Specifications | Approved | Reference standard. Underlying barcode encoding standards. [Source: GS1 General Specifications] |
| 2 — SC owns | Artwork timeline and cut-over execution | Approved | Core SC ownership theme. Orientation-safe. |
| 2 — SC owns | Printed component availability | Approved | Core SC ownership theme. Orientation-safe. |
| 2 — SC owns | Launch inventory impact | Approved | Core SC ownership theme. Orientation-safe. |
| 2 — SC owns | CDMO / CMO execution coordination | Approved | Core SC ownership theme. Orientation-safe. |
| 2 — SC owns | Packaging supplier readiness | Approved | Core SC ownership theme. Orientation-safe. |
| 2 — SC owns | Barcode readability coordination | Approved | Core SC ownership theme. Orientation-safe. |
| 2 — SC owns | Component change timing | Approved | Core SC ownership theme. Orientation-safe. |
| 2 — SC owns | Distribution-readiness impact | Approved | Core SC ownership theme. Orientation-safe. |
| 3 — Adjacent | MAH / NDA: Approved label content — SPL (US), SmPC and PIL (EU) | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | MAH / NDA: Submission of label changes: CBE-0, CBE-30, PAS; Type IA, IB, II | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | MAH / NDA: Final accountability for label compliance with approved dossier | Revise | Trigger word: "accountability" implies legal determination. Reframe: "The MAH or NDA holder is typically regarded as the party accountable for ensuring label content aligns with the approved dossier." |
| 3 — Adjacent | MAH / NDA: Sponsor sign-off on artwork master and printed components | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Regulatory: Submission content — USPI, SmPC, SPL | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Regulatory: Defining regulatory pathway for changes | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Regulatory: Country-specific labeling overlays and timing alignment | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Regulatory: Market-authorization-aligned label review and approval | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Quality: Approval of master artwork | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Quality: Incoming inspection — AQL sampling of printed components | Revise | Trigger word: "inspection" in context implies regulatory obligation. Reframe: "Quality units typically perform incoming inspection, including AQL sampling, of printed components per 21 CFR 211.122." |
| 3 — Adjacent | Quality: Verification of CDMO line clearance | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Quality: Change control on artwork and printed components | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Quality: Audit and inspection support for labeling records | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Commercial / Brand: Trade dress, Pantone palettes, marketing copy | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Commercial / Brand: Brand consistency across markets | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | CDMO: Physical application of the label | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | CDMO: Printing variable data — lot, expiry, 2D Data Matrix | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | CDMO: Validation of camera vision systems (Systech, Antares) | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | CDMO: Pack-line execution — print-and-verify, drop-on-demand | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | CDMO: Component receipt inspection vs. approved master | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | CDMO: Reject and rework handling for printed components | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | CDMO: Print-quality verification per ISO/IEC 15415 and 15416 | Approved | Cross-link to Serialization topic per Rule 10. |
| 3 — Adjacent | Artwork Vendor: Typesetting, proof generation, die-line alignment | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Artwork Vendor: Artwork master version control | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Artwork Vendor: Multi-language layout for EU presentations | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Packaging Supplier: Printing, cutting, delivering labels and cartons | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Packaging Supplier: Color matching including physical draw-downs | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Packaging Supplier: Component lot ID and traceability to approved master | Approved | Orientation-safe factual statement. |
| 3 — Adjacent | Serialization Provider: Serial-range allocation affecting HR text | Approved | Cross-link to Serialization topic per Rule 10. |
| 3 — Adjacent | Serialization Provider: Master data alignment — NDC, GTIN, product code, lot, expiry | Approved | Cross-link to Serialization topic per Rule 10. |
| 4 — US vs EU | US: Linear barcode encoding NDC under 21 CFR 201.25 with DSCSA 2D Data Matrix | Approved | Specific citation. Orientation-safe. [Source: 21 CFR 201.25] |
| 4 — US vs EU | US: Visual differentiation — tall-man lettering, contrasting colors, whitespace | Approved | Orientation-safe. [Source: FDA Safety Considerations for Container Labels] |
| 4 — US vs EU | US: 21 CFR 208 Medication Guide and PPI requirements | Approved | Specific citation. Orientation-safe. [Source: 21 CFR 208] |
| 4 — US vs EU | US: 21 CFR 211.122 and 211.130 govern labeling material control | Revise | Trigger word: "govern." Reframe: "21 CFR 211.122 and 211.130 address the control of labeling material issuance, use, and reconciliation at the line." |
| 4 — US vs EU | EU: Physical ATD on outer packaging under Directive 2011/62/EU | Revise | Trigger word: "Requires." Reframe: "The FMD framework calls for physical Anti-Tampering Devices on outer packaging under Directive 2011/62/EU and Delegated Regulation (EU) 2016/161." |
| 4 — US vs EU | EU: Multi-language packs or clusters highly common | Approved | Orientation-safe factual statement. |
| 4 — US vs EU | EU: Mandatory content under Directive 2001/83/EC Art. 54–69 | Revise | Trigger word: "Mandatory." Reframe: "Directive 2001/83/EC Articles 54–69 define the content elements expected on EU labels and Patient Information Leaflets." |
| 4 — US vs EU | EU: Readability obligations under EMA Readability Guideline | Revise | Trigger word: "obligations." Reframe: "The EMA Readability Guideline sets expectations for label and PIL readability in EU markets." |
| 4 — US vs EU | EU: QRD templates apply to label and SmPC formatting | Approved | Orientation-safe factual statement. [Source: QRD templates] |
| 4 — US vs EU | EU: EudraLex Vol. 4 Ch. 5 and Ch. 6 — handling, segregation, line clearance | Revise | Trigger word: "govern." Reframe: "EudraLex Volume 4 Chapters 5 and 6 address the handling, segregation, and line clearance expectations for printed packaging materials." |
| 4 — US vs EU | Both: Strict version control of physical labels | Approved | Orientation-safe factual statement. |
| 4 — US vs EU | Both: Traceability of label master to printed component to packaged unit | Approved | Orientation-safe factual statement. |
| 4 — US vs EU | Both: Print-quality grading aligned with ISO/IEC 15415 and 15416 | Approved | Cross-link to Serialization topic per Rule 10. [Source: ISO/IEC 15415, 15416] |
| 5 — Entity roles | NDA / MAH: Holds ultimate legal responsibility for label matching dossier | Revise | Override 13. Strong legal language. Reframe: "For the NDA holder or MAH, accountability typically includes ensuring the physical label aligns with the dossier approved by the agency." |
| 5 — Entity roles | NDA / MAH: Owns artwork master, submission content, change-control authority | Approved | Orientation-safe factual statement. |
| 5 — Entity roles | NDA / MAH: Signs off on printed components prior to packaging release | Approved | Orientation-safe factual statement. |
| 5 — Entity roles | Licensed US Distributor: Does not own label content; encounters complaints | Approved | Orientation-safe factual statement. |
| 5 — Entity roles | Licensed US Distributor: Recall execution under 21 CFR Part 7 | Approved | Specific citation. Orientation-safe. [Source: 21 CFR Part 7] |
| 5 — Entity roles | Licensed US Distributor: ATP under DSCSA §582(a) intersects labeling | Approved | Cross-link to Serialization topic per Rule 10. [Source: DSCSA §582(a)] |
| 5 — Entity roles | Importer: EU — may apply or confirm local-language overlays | Approved | Orientation-safe factual statement. |
| 5 — Entity roles | Importer: US — verifies label requirements before introduction into commerce | Approved | Orientation-safe factual statement. |
| 5 — Entity roles | 3PL: Stores, picks, ships pre-labeled product | Approved | Orientation-safe factual statement. |
| 5 — Entity roles | 3PL: Encounters labeling at receipt, return, recall verification | Approved | Orientation-safe factual statement. |
| 5 — Entity roles | 3PL: Some perform secondary labeling under MAH direction; requires QA provisions | Revise | Trigger word: "requires." Reframe: "Some 3PLs perform secondary labeling or country-specific overlay services under MAH direction; this typically calls for explicit Quality Agreement provisions." |
| 5 — Entity roles | CDMO: QA must define who verifies printed component vs. approved master | Revise | Override 14. Strong legal language. Reframe: "Quality Agreements between MAH / NDA holder and CDMO typically specify who verifies the final printed component against the approved master and who owns the investigation when there is a discrepancy in the variable-data print." |
| 5 — Entity roles | CDMO: QA should define who owns variable-data print investigation | Revise | Consolidated with Override 14 above. Same reframe applies. |
| 5 — Entity roles | CDMO: Line equipment ownership and qualification varies by deal | Approved | Orientation-safe factual statement. |
| 5 — Entity roles | CDMO: Reject, rework, retain, sample handling at serial / lot level | Approved | Orientation-safe factual statement. |
| 6 — Lifecycle | Preclinical: Not applicable for commercial labeling | Revise | Override 15. "Not applicable" pattern. Reframe: "Commercial labeling and artwork frameworks are usually not central in preclinical, when bench-stage product is governed by laboratory or research-use labeling instead." |
| 6 — Lifecycle | Preclinical: Governed by lab/research-use labeling | Approved | Orientation-safe factual statement. |
| 6 — Lifecycle | Late-stage Clinical: Focus on blinding and IUO statements | Approved | Orientation-safe factual statement. |
| 6 — Lifecycle | Late-stage Clinical: Must comply with Annex 13 or 21 CFR 312.6 | Revise | Override 16. Strong legal language. Reframe: "Investigational product is typically governed by EudraLex Volume 4 Annex 13 (EU) and 21 CFR 312.6 (US) for labeling." |
| 6 — Lifecycle | Late-stage Clinical: Some sponsors begin commercial artwork master in parallel | Approved | Orientation-safe factual statement. |
| 6 — Lifecycle | Pre-commercial / Launch: High risk of concurrent artwork versions near PDUFA/CHMP | Approved | Orientation-safe factual statement. |
| 6 — Lifecycle | Pre-commercial / Launch: Requires rapid-response print and tight version control | Revise | Trigger word: "Requires." Reframe: "Rapid-response print capabilities and tight artwork master version control are typically expected during the pre-commercial window." |
| 6 — Lifecycle | Pre-commercial / Launch: EMVO and DSCSA T3 readiness intersect labeling | Approved | Cross-link to Serialization topic per Rule 10. |
| 6 — Lifecycle | Pre-commercial / Launch: Pack-line print-and-verify validation must be complete before first commercial production | Revise | Override 17. Strong legal language. Reframe: "Pack-line print-and-verify validation is typically expected to be complete before first commercial production." |
| 6 — Lifecycle | Post-commercial: Managing safety updates, label expansions, country additions | Approved | Orientation-safe factual statement. |
| 6 — Lifecycle | Post-commercial: Routine artwork maintenance, change control, vendor migrations | Approved | Orientation-safe factual statement. |
| 7 — Related topics | Packaging: Carton integrity must support ATD without premature tearing | Revise | Trigger word: "must." Reframe: "Carton structural integrity is typically expected to support ATD application without premature tearing." |
| 7 — Related topics | Packaging: Label adhesion, substrate, cold-chain stress affect readability | Approved | Orientation-safe factual statement. Cross-link to Packaging topic. |
| 7 — Related topics | Serialization: Artwork must allocate whitespace for 2D Data Matrix / HR text | Revise | Trigger word: "must." Reframe: "Artwork design typically allocates sufficient unvarnished whitespace for the 2D Data Matrix and human-readable text to achieve a passing barcode grade." Cross-link to Serialization. |
| 7 — Related topics | Serialization: Linear barcode (21 CFR 201.25) coexists with 2D (DSCSA) | Approved | Cross-link to Serialization topic per Rule 10. [Source: 21 CFR 201.25] |
| 7 — Related topics | Serialization: EU UI placement under Delegated Reg. 2016/161 part of labeling | Approved | Cross-link to Serialization topic per Rule 10. [Source: Delegated Reg. 2016/161] |
| 7 — Related topics | Distribution & 3PLs: 3PLs receive pre-labeled product; execute against label content | Approved | Orientation-safe factual statement. |
| 7 — Related topics | Distribution & 3PLs: 3PLs handle returns/recalls from labeling errors | Approved | Orientation-safe factual statement. |
| 7 — Related topics | Distribution & 3PLs: Country-specific cut-overs require coordinated stock segregation | Revise | Trigger word: "require." Reframe: "Country-specific labeling cut-overs typically call for coordinated stock segregation between Supply Chain and 3PL operations." |
| 7 — Related topics | Returns / Recalls: Labeling mix-ups — leading cause of Class I/II recalls | Revise | Override 18. Statement-of-fact too strong. Reframe: "Labeling mix-ups are a frequently cited cause of Class I and Class II recalls." |
| 7 — Related topics | Returns / Recalls: Recall execution relies on label-driven traceability | Approved | Orientation-safe factual statement. [Source: 21 CFR Part 7] |
| 7 — Related topics | Importer / Distributor: Importers verify label compliance for destination market | Approved | Orientation-safe factual statement. |
| 7 — Related topics | Importer / Distributor: EU importers may apply local-language overlays | Approved | Orientation-safe factual statement. |
| 7 — Related topics | Release & Disposition: QA release conditional on printed component conformance | Approved | Orientation-safe factual statement. |
| 7 — Related topics | Release & Disposition: Reconciliation of printed components under 211.122/211.130 | Approved | Orientation-safe. [Source: 21 CFR 211.122, 211.130] |
| 7 — Related topics | Controlled Temp. Transport: Label readability/adhesion under cold conditions | Approved | Orientation-safe. Cross-link to Controlled Temperature Transport topic. |
| 7 — Related topics | Controlled Temp. Transport: Print-quality grading under transport conditions | Approved | Orientation-safe. Cross-link to Controlled Temperature Transport topic. |
| 8 — Internal risk | In-transit unlabeled WIP cut-over risk (ERP effectivity vs. physical reality) | Keep internal | Override 5. NotebookLM adversarial interjection. Candidate for public Common Pitfall: "ERP cut-over to a new bill of materials before the CDMO has flushed the old version creates a window where in-transit work-in-process can be at risk against 21 CFR 211.130 expectations. System effectivity dates typically need to align with physical reality, not just the purchasing schedule." [Source: 21 CFR 211.130] |
| 8 — Internal risk | Packaging supplier COA vs. Quality Unit incoming inspection | Keep internal | Override 6. NotebookLM adversarial interjection. Candidate for public Common Pitfall: "A packaging supplier's certificate of analysis does not substitute for incoming inspection. 21 CFR 211.122 typically calls for representative sampling of each shipment of labeling, with reduced testing only justified by formal supplier qualification." [Source: 21 CFR 211.122] |
| 8 — Internal risk | Physical color profile shifts vs. electronic PDF proof approvals | Keep internal | Override 7. ALCOA+ flag. Candidate for public Common Pitfall: "Electronic proof approval alone does not capture printer color drift. Physical color draw-downs are typically expected so two strengths do not end up looking alike under pharmacy lighting — the kind of drift that can be treated as an ALCOA+ accuracy finding." [Source: FDA Safety Considerations for Container Labels] |
| 8 — Internal risk | Old-stock exhaustion after CBE-0 safety change | Revise | Override 4. Strong legal language. Proposed reframe: "Exhausting old label stock during a CBE-0 safety-warning change can result in distribution that may be treated as misbranded under FD&C Act §502. Destruction or quarantine of obsolete stock is typically expected once the safety warning takes effect." [Source: FD&C Act §502] |
| 8 — Internal risk | Vision-system integrity — smeared digit can pass undetected | Keep internal | Override 12. Adversarial interjection. Candidate for public Common Pitfall: "An approved artwork master is not enough — the camera or vision system verifying the printed result also requires validation. Without it, a smeared digit on a critical field such as expiry can pass the line undetected." |
| 8 — Internal risk | Native electronic artwork (Adobe Illustrator) storage — ALCOA+ | Keep internal | Override 8. ALCOA+ flag. Candidate for public Common Pitfall: "Native electronic artwork files held in an uncontrolled repository — for example a shared drive without audit trails — can compromise the 'Original' and 'Contemporaneous' aspects of ALCOA+, leaving no defensible record of who changed a warning statement." [Source: 21 CFR 11.10] |
| 8 — Internal risk | Roll-label splicing controls at the printer | Keep internal | Override 9. Operational risk question. Critical for 10mg vs 50mg mix-ups. Retain for supplier audit checklists. No public version — internal only. [Source: 21 CFR 211.122] |
| 9 — Source gaps | Bright stock controls — quarantine and issuance of regional labels at 3PL | Source gap | Requires Brian / ISC review to verify Quality System adequacy for unlabeled vial holding. |
| 9 — Source gaps | Barcode grading liability — CMO vs. MAH under Quality Agreement | Source gap | Override 10. Editor review needed — current QA/TA templates may not explicitly assign ISO/IEC 15415 grading liability. [Source: FDA Quality Agreements guidance] |
| 9 — Source gaps | Vision-system validation evidence — 21 CFR Part 11 and FDA/EU guidance | Source gap | Validation evidence level not yet anchored to a specific guidance document. |
| 9 — Source gaps | Artwork vault status — non-Part-11 repository migration pathway | Source gap | Migration timeline and pathway not documented. |
| 9 — Source gaps | Roll-splicing controls — validated controls at printer | Source gap | No specific guidance document identified for splicing validation. |
| 9 — Source gaps | Late-breaking PI changes — rapid-response print capability | Source gap | Operational capability, not source-anchored. Verify if industry guidance exists. |
| 9 — Source gaps | Multi-language EU clusters — change-control complexity | Source gap | No specific guidance identified for multi-language cluster change control. |
| 9 — Source gaps | Post-Nov 2024 enforcement landscape — current FDA/EU themes | Source gap | Current enforcement posture question (Rule 7). Verify before publication. |
| 9 — Source gaps | Health Canada (GUI-0001) / ANVISA RDC No. 301 | Exclude | Override 11. Non-US/EU jurisdiction content. Outside current scope. |

---

## 5. Count Summary

### Decision Counts

| Decision | Count |
|---|---:|
| Approved | 92 |
| Revise | 21 |
| Keep internal | 6 |
| Source gap | 8 |
| Exclude | 1 |
| **Total** | **128** |

### Section Subtotals

| Section | Rows |
|---|---:|
| 1 — Sources | 19 |
| 2 — SC owns | 8 |
| 3 — Adjacent | 30 |
| 4 — US vs EU | 13 |
| 5 — Entity roles | 15 |
| 6 — Lifecycle | 11 |
| 7 — Related topics | 16 |
| 8 — Internal risk | 7 |
| 9 — Source gaps | 9 |
| **Total** | **128** |

### Row-Count Discrepancy Note

The Phase 5.2-K baseline reported 118 review rows. This packet contains 128 rows. The difference of +10 is due to: (1) Section 9 was restructured — the 8 source gaps from the draft packet are now classified rows rather than separate-table references, plus the Exclude row (Health Canada / ANVISA) was added (+9); (2) one row in Section 8 (old-stock exhaustion) was split from a source-inventory-only row into both a source row and an internal-risk row (+1). Net: +10. All source content is traceable to the Stage 2 packet. No rows were dropped.

---

## 6. Stage-Gate Checklist

- [ ] Every row has one of the five decision labels.
- [ ] No row remains marked "Needs Brian / ISC decision."
- [ ] All 18 specific overrides have been applied.
- [ ] Every Keep-internal adversarial or ALCOA+ item has a Common Pitfall candidate or explicit internal-only note.
- [ ] Every Revise row includes a proposed public-safe reframe when available.
- [ ] Every Source gap row identifies what must be verified.
- [ ] Every Exclude row identifies why it is out of scope.
- [ ] No public topic copy has been drafted.
- [ ] `TOPIC_LABELING_ARTWORK.md` has not been created.
- [ ] `/topics/labeling-artwork` has not been populated.
- [ ] No app source, citation, obligation, or topic content has been changed.

---

## 7. Source Gap / Withheld Items Summary

8 rows classified as **Source gap:**

1. **Bright stock controls** — Quality System adequacy for unlabeled vial holding at 3PL not yet verified.
2. **Barcode grading liability** (Override 10) — QA/TA templates may not explicitly assign ISO/IEC 15415 grading liability at point of application.
3. **Vision-system validation evidence** — Validation evidence level not anchored to a specific guidance document.
4. **Artwork vault status** — Non-Part-11 repository migration pathway and timeline not documented.
5. **Roll-splicing controls** — No specific guidance document identified for splicing validation at printer.
6. **Late-breaking PI changes** — Rapid-response print capability not source-anchored; verify if industry guidance exists.
7. **Multi-language EU clusters** — No specific guidance identified for multi-language cluster change-control complexity.
8. **Post-Nov 2024 enforcement landscape** — Current enforcement posture question per Rule 7; verify before publication.

No source gaps were resolved. No external sources were verified.

---

## 8. Internal-Only Items Summary

7 rows classified as **Keep internal:**

1. **In-transit unlabeled WIP cut-over risk** (Override 5) — NotebookLM adversarial interjection. Common Pitfall candidate provided.
2. **Packaging supplier COA vs. incoming inspection** (Override 6) — NotebookLM adversarial interjection. Common Pitfall candidate provided.
3. **Physical color profile shifts vs. PDF proof** (Override 7) — ALCOA+ / data-integrity flag. Common Pitfall candidate provided.
4. **Vision-system integrity** (Override 12) — Adversarial interjection. Common Pitfall candidate provided.
5. **Native electronic artwork storage** (Override 8) — ALCOA+ / data-integrity flag. Common Pitfall candidate provided.
6. **Roll-label splicing controls** (Override 9) — Operational risk question. No public version — internal only.
7. **[Note]** The old-stock exhaustion item (Override 4) was classified as **Revise** (not Keep internal) because the proposed reframe is publication-ready with softened language.

All Keep-internal items carry either a paired Common Pitfall candidate or an explicit "No public version — internal only" note per Rule 4 refinement.

No internal-only material was converted into final public copy.

---

## 9. Next Phase Hold Notice

The next controlled phase is Phase 5.2-M — Drafting Authorization. Brian / ISC reviews this classification packet and authorizes drafting of `TOPIC_LABELING_ARTWORK.md` from approved and revised rows.

---

## ⛔ Implementation Hold Notice

This Stage 3 classification packet is not approved topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/labeling-artwork` from this packet. A separate approved `TOPIC_LABELING_ARTWORK.md` file is required before implementation.

---

> **Governance Notice:** This Stage 3 classification packet classifies Brian / ISC input notes for the Labeling & Artwork topic using the five-decision rubric and 18 specific overrides. It does not constitute legal advice or approved regulatory interpretation. All content remains subject to Brian / ISC final acceptance before any public use.
