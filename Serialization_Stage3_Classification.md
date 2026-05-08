# Serialization — Stage 3 Classification Table

**Status:** Stage 3 — Classification Complete / Pending Brian Final Acceptance

---

## ⛔ Implementation Hold Notice

This Stage 3 classification table is not approved public topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/serialization` from this file. A separate approved `TOPIC_SERIALIZATION.md` file is required before implementation.

---

## Source Materials Used

- `TOPIC_SERIALIZATION_DRAFT_PACKET.md`
- `TOPIC_SERIALIZATION_STAGE_3_REVIEW.md`
- Brian / ISC Stage 3 Classification Brief (`Serialization_Stage3_Brief.md`)
- Brian / ISC Stage 3 Review Packet first-pass recommendations

The Brian / ISC Classification Brief is treated as the authoritative editorial instruction for this Stage 3 classification pass. It does not itself constitute public topic copy.

---

## Decision Label Legend

| Label | Definition |
|---|---|
| **Approved** | Approved for public topic copy. Use as orientation for senior supply chain leaders. |
| **Revise** | Useful but wording is too strong, too legalistic, too detailed, or too operationally specific. Reframe before public use. Reviewer note must include the proposed reframe. |
| **Keep internal** | Useful for editorial judgment, QA, risk awareness, implementation planning, or client engagement diligence. Do not appear publicly unless later converted into approved public wording. |
| **Source gap** | May be correct, but source, citation, current enforcement posture, exact wording, or current revision requires verification before publication. |
| **Exclude** | Out of scope, not useful to the target user, belongs in a different topic, or outside the current US/EU scope. |

---

## Unified Classification Table

### Section 1 — Sources (17 rows)

| Section | Item | Decision | Reviewer note |
|---|---|---|---|
| 1 — Sources | DSCSA / FD&C Act §582 (US, Verified) — product identifiers in 2D Data Matrix and package-level electronic tracing | Approved | Use as US primary source anchor. Verify exact citation formatting before publication. |
| 1 — Sources | FMD Directive 2011/62/EU and Delegated Regulation (EU) 2016/161 (EU, Verified) — MAH responsibilities for UI uploads to EMVS / EU-Hub and decommissioning protocols | Approved | Use as EU primary source anchor. |
| 1 — Sources | 21 CFR 201.25 Linear Barcode Rule (US, Verified) — linear barcode encoding NDC for clinical / bedside safety | Approved | Operates concurrently with DSCSA. |
| 1 — Sources | GS1 General Specifications and EPCIS (Both, Verified) — global standard for interoperable electronic exchange of tracking events | Approved | Reference standard. |
| 1 — Sources | FDA Product Identifiers Under DSCSA QA (US, Verified) | Approved | Authoritative on identifier composition, encoding, human-readable expectations. |
| 1 — Sources | FDA Standardization of Data and Documentation Practices for Product Tracing (US, Verified) | Approved | Format and content for T3 transaction information, history, statement. |
| 1 — Sources | FDA Standards for the Interoperable Exchange of Information for Tracing (US, Verified) | Approved | Underpins §582(g). |
| 1 — Sources | FDA Wholesale Distributor Verification Requirement for Saleable Returned Drug Product and 2019 / 2023 enforcement policies (US, Verified) | Approved | Operational rules for VRS-based saleable return verification. |
| 1 — Sources | FDA Enhanced Drug Distribution Security at the Package Level Under DSCSA §582(g) (US, Draft reference) | Source gap | Verify final form and current enforcement posture before publication. |
| 1 — Sources | FDA DSCSA Implementation: Identification of Suspect Product and Notification (US, Verified) | Approved | Operational suspect product handling, FDA Form 3911. |
| 1 — Sources | FDA DSCSA Annual Reporting by Wholesale Distributors and 3PLs (US, Verified) | Approved | §582(d)(3) cadence and content. |
| 1 — Sources | FDA DSCSA Compliance Policy (post–Nov 2024 stabilization and staggered exemptions) (US, Draft reference) | Source gap | Verify current enforcement posture before publication. |
| 1 — Sources | 21 CFR 205 — State Licensing of Wholesale Prescription Drug Distributors (US, Verified) | Approved | Federal floor for state distributor licensing. |
| 1 — Sources | EMA / European Commission Q&A on Safety Features for Medicinal Products for Human Use (EU, Verified) | Approved | Authoritative interpretation of Delegated Reg 2016/161. |
| 1 — Sources | EMVO User Requirements Specification and Onboarding documentation (EU, Reference) | Approved | Hub-side onboarding requirements. |
| 1 — Sources | EU GDP 2013/C 343/01 Chapter 5 — Operations (EU, Verified) | Approved | Storage, segregation, and operational standards underlying segregation-validation expectations. |
| 1 — Sources | ISO/IEC 16022 (Data Matrix) and ISO/IEC 15415 (print-quality grading) (Both, Reference) | Approved | Symbology and print-quality specifications. |

### Section 2 — SC Owns (14 rows)

| Section | Item | Decision | Reviewer note |
|---|---|---|---|
| 2 — SC owns | EPCIS data exchange — onboarding and continuous management with 3PLs / wholesalers / dispensers; range planning, event posting, exception queues | Approved | Core SC ownership. |
| 2 — SC owns | *(NotebookLM adversarial)* EPCIS event lagging physical shipment is technically adulterating in transit | Keep internal | Candidate for public Common Pitfall: "EPCIS event posting that lags physical movement creates traceability gaps that can be treated as data-integrity findings in inspection." |
| 2 — SC owns | Physical receipt and verification against electronic Transaction Information and Statements | Approved | Standard SC ownership. |
| 2 — SC owns | Quarantine and segregation of suspect, illegitimate, expired, or recalled product | Approved | Standard SC ownership. |
| 2 — SC owns | *(NotebookLM adversarial)* Electronic segregation must be validated equivalent to physical cage; otherwise direct violation of EU GDP Chapter 5 | Keep internal | Candidate for public Common Pitfall: "Electronic segregation in the WMS or ERP without validation equivalent to physical segregation can result in inspection findings against EU GDP Chapter 5 expectations." |
| 2 — SC owns | Master data — NDC and GTIN allocation, hierarchy, PC for EU presentations | Approved | Core SC ownership. |
| 2 — SC owns | Serial number management — range planning, no-reuse, lot-to-serial reconciliation | Approved | Core SC ownership. |
| 2 — SC owns | Line-side execution coordination — oversight of CDMO print-and-verify and aggregation; SC owns the data flow even where it does not own the line | Approved | Useful orientation. |
| 2 — SC owns | Trading partner connectivity — ATP confirmation per §582(a); T3 capture and transmission per §582(b)(1) and (c)(1) | Approved | Anchored in DSCSA. |
| 2 — SC owns | Saleable return verification — VRS configuration and operational handling per §582(c)(4)(D) | Approved | Anchored in DSCSA. |
| 2 — SC owns | Suspect / illegitimate product handling per §582(c)(4) — quarantine, investigation, FDA Form 3911, disposition | Approved | Anchored in DSCSA. |
| 2 — SC owns | Country reporting — EMVO upload for EU presentations; country-specific portals where applicable | Approved | Standard SC ownership. |
| 2 — SC owns | Recall execution — pulling lot- and serial-level distribution data from serialized records | Approved | Core orientation. |
| 2 — SC owns | Annual reporting under DSCSA §582(d)(3) for distributors and §584 for 3PLs | Approved | Anchored in DSCSA. |

### Section 3 — Adjacent (35 rows)

| Section | Item | Decision | Reviewer note |
|---|---|---|---|
| 3 — Adjacent | Disposition (release / reject) and suspect / illegitimate product investigations including OOS and recalls | Approved | Standard quality ownership. |
| 3 — Adjacent | *(NotebookLM adversarial)* QA paper release vs. 3PL portal status — SC bypasses DSCSA controls to meet shipping deadlines | Keep internal | Candidate for public Common Pitfall: "Paper release that does not propagate to the 3PL system status creates pressure for manual workarounds that can compromise DSCSA controls at the shipping interface." |
| 3 — Adjacent | CSV / CSA per FDA Computer Software Assurance guidance for serialization software, hub integrations, VRS | Approved | Useful orientation. |
| 3 — Adjacent | IQ / OQ / PQ for serialization line equipment, print-and-verify, and aggregation stations | Approved | Standard quality ownership. |
| 3 — Adjacent | Change control on master data, line moves, software releases, vendor migrations | Approved | Standard quality ownership. |
| 3 — Adjacent | Exception and deviation handling — failed verifications, aggregation mismatches, T3 reconciliation breaks | Approved | Standard quality ownership. |
| 3 — Adjacent | Audit and inspection support — DSCSA inspections, EU GMP / GDP inspections | Approved | Standard quality ownership. |
| 3 — Adjacent | Notification to authorities — Form FDA 3911 within 24 hours for illegitimate product | Revise | Reframe absolute timing: "For illegitimate product, notification to FDA and immediate trading partners is generally expected within 24 hours using Form FDA 3911." |
| 3 — Adjacent | NDC registration; PC (PPN / NTIN) publication for EU | Approved | Standard regulatory ownership. |
| 3 — Adjacent | EU MAH master-data uploads to EMVO before pack release | Approved | Core EU orientation. |
| 3 — Adjacent | Country regulatory filings citing serialization data and labeling | Approved | Standard regulatory ownership. |
| 3 — Adjacent | Recall communications — serial-driven distribution lookups feed targeted notifications | Approved | Useful orientation. |
| 3 — Adjacent | Warehousing and logistics services without taking ownership of product | Approved | Defining feature of 3PL role. |
| 3 — Adjacent | *(NotebookLM adversarial)* 3PLs cannot conduct suspect product investigations — entity taking ownership must complete the investigation | Keep internal | Candidate for public Common Pitfall: "Suspect product investigations sit with the entity that takes ownership of the product, not with the 3PL providing logistics services." |
| 3 — Adjacent | T3 receipt, storage, downstream transmission per §582(b)(1) and (c)(1) | Approved | Anchored in DSCSA. |
| 3 — Adjacent | ATP verification at every transaction | Approved | Core US orientation. |
| 3 — Adjacent | Saleable return verification per §582(c)(4)(D) | Approved | Anchored in DSCSA. |
| 3 — Adjacent | Aggregation handling — parent-child integrity at receipt and shipping | Approved | Standard 3PL ownership. |
| 3 — Adjacent | §582(d)(3) and §584 annual reporting where applicable | Approved | Anchored in DSCSA. |
| 3 — Adjacent | Value Added Network (VAN) routing and serialized data repository maintenance | Approved | Standard provider role. |
| 3 — Adjacent | Hub services — data normalization, country reporting connectors, EMVO and NMVO connectivity | Approved | Standard provider role. |
| 3 — Adjacent | API / EDI / EPCIS integration with trading partners | Approved | Standard provider role. |
| 3 — Adjacent | Master data management within the hub | Approved | Standard provider role. |
| 3 — Adjacent | Change management for new country requirements | Approved | Useful orientation. |
| 3 — Adjacent | Overall responsibility for placing product on market, generating SNI, uploading serial data to repositories | Revise | Reframe: "For an MAH or NDA holder, serialization typically includes placing product on the market, generating the serialized identifier, and ensuring serial data reaches the relevant national or regional repositories." |
| 3 — Adjacent | Master data ownership — NDC / PC, GTIN, product hierarchy, serial range allocation | Approved | Standard MAH ownership. |
| 3 — Adjacent | Serialization architecture and policy | Approved | Standard MAH ownership. |
| 3 — Adjacent | Service-provider selection and contracting | Approved | Standard MAH ownership. |
| 3 — Adjacent | Recall, withdrawal, suspect product responses | Approved | Standard MAH ownership. |
| 3 — Adjacent | ATP registration and FDA Establishment Registration | Approved | Standard MAH ownership. |
| 3 — Adjacent | Applying physical 2D Data Matrix, linear barcodes, human-readable interpretations during packaging | Approved | Defining feature of CDMO/CMO role. |
| 3 — Adjacent | Line equipment serialization capability and qualification | Approved | Standard CDMO role. |
| 3 — Adjacent | Master data exchange with sponsor — fields, timing, failure handling | Approved | Standard CDMO role. |
| 3 — Adjacent | Quality / Technical Agreement provisions on serialization roles, sample / retain handling, reject and rework, batch reconciliation | Approved | Standard CDMO ownership. |
| 3 — Adjacent | Sponsor sign-off on serialized batches before release | Approved | Standard CDMO/sponsor handoff. |

### Section 4 — US vs EU (18 rows)

| Section | Item | Decision | Reviewer note |
|---|---|---|---|
| 4 — US vs EU | 2D Data Matrix on lowest saleable unit encoding NDC, serial, lot, expiry | Approved | Core US orientation. |
| 4 — US vs EU | Heavy focus on TI / TS exchange between trading partners — track-and-trace model | Approved | Core orientation distinction (US vs EU). |
| 4 — US vs EU | Verification triggered on suspect product (§582(c)(4)) and saleable returns (§582(c)(4)(D)) | Approved | Standard US orientation. |
| 4 — US vs EU | Authorized Trading Partner regime under §582(a) | Approved | Core US orientation. |
| 4 — US vs EU | Annual reporting for wholesale distributors (§582(d)(3)) and 3PLs (§584) | Approved | Standard US orientation. |
| 4 — US vs EU | 21 CFR 201.25 linear barcode runs concurrently with DSCSA — both required | Approved | Important orientation point. |
| 4 — US vs EU | State Boards of Pharmacy and 21 CFR 205 add a state-level layer | Approved | Standard US orientation. |
| 4 — US vs EU | UI containing PC, serial, batch, expiry, NRN where required — uploaded to EU Hub / EMVS | Approved | Core EU orientation. |
| 4 — US vs EU | Endpoint verification and decommissioning at point of dispense — verification model | Approved | Core orientation distinction. |
| 4 — US vs EU | Two safety features mandated: UI plus anti-tampering device (ATD) | Approved | Standard EU orientation. |
| 4 — US vs EU | Wholesaler verification is risk-based, not mandatory at every transaction | Approved | Important orientation — distinguishes from US. |
| 4 — US vs EU | MAH uploads UI master data to EMVO before pack release | Approved | Standard EU orientation. |
| 4 — US vs EU | Live since Feb 9, 2019; ongoing Q&A revisions from Commission and EMA | Approved | Standard background. |
| 4 — US vs EU | Strict master data governance and reliance on GS1 standards (GTINs, SGTINs) | Approved | Core orientation. |
| 4 — US vs EU | 2D GS1 Data Matrix at saleable presentation level | Approved | Core orientation. |
| 4 — US vs EU | Demand immediate isolation and reporting of suspected falsified / illegitimate medicines | Approved | Core orientation. |
| 4 — US vs EU | GS1 EPCIS as the dominant event-based exchange standard | Approved | Standard background. |
| 4 — US vs EU | Serialization service providers operate across both regimes | Approved | Useful orientation. |

### Section 5 — Entity Roles (27 rows)

| Section | Item | Decision | Reviewer note |
|---|---|---|---|
| 5 — Entity roles | NDA Holder: must affix product identifiers and initiate the TI / TS data stream | Revise | Reframe: "For a US NDA holder, serialization typically includes ensuring product identifiers are applied and that transaction data moves with the first commercial transaction." |
| 5 — Entity roles | NDA Holder: originates the first T3 transaction at first sale | Revise | Reframe: "The NDA holder typically originates the first T3 transaction at first commercial sale." |
| 5 — Entity roles | NDA Holder: Authorized Trading Partner under §581(2)(A); FDA Establishment Registration | Approved | Standard ATP / registration framing. |
| 5 — Entity roles | MAH: responsible for uploading UI data to repositories before release for sale and managing decommissioning during recalls | Revise | Reframe: "For an EU MAH, serialization typically includes uploading UI data to the repositories before release and managing decommissioning during recalls." |
| 5 — Entity roles | *(NotebookLM adversarial)* MAHs cannot delegate legal responsibility — if CDMO's server fails, MAH liable for distributing falsified-status medicines | Keep internal | Candidate for public Common Pitfall: "Delegating EMVS upload execution to a CDMO does not transfer the underlying responsibility — upload failures upstream are typically treated as MAH responsibility under the EU framework." |
| 5 — Entity roles | MAH: accountable for FMD compliance in each EU member state where the product is marketed | Revise | Reframe: "FMD accountability typically applies to the MAH for each EU member state where the product is marketed." |
| 5 — Entity roles | MAH: may contract with a serialization service provider for EMVO connectivity, but accountability does not transfer | Approved | Useful orientation. |
| 5 — Entity roles | Licensed US Distributor: must verify ATP status before transacting | Revise | Reframe: "For a licensed US distributor, ATP verification is typically performed before transacting with another trading partner." |
| 5 — Entity roles | Licensed US Distributor: wholesale distributor under DSCSA §581(29) and 21 CFR 205 | Approved | Standard framing. |
| 5 — Entity roles | Licensed US Distributor: T3 capture, storage, transmission per §582(b)(1) and (c)(1) | Approved | Standard framing with citations. |
| 5 — Entity roles | Licensed US Distributor: saleable return verification per §582(c)(4)(D) | Approved | Standard framing. |
| 5 — Entity roles | Licensed US Distributor: suspect product handling per §582(c)(4) | Approved | Standard framing. |
| 5 — Entity roles | Licensed US Distributor: §582(d)(3) annual reporting | Approved | Standard framing. |
| 5 — Entity roles | Licensed US Distributor: VAWD / NABP DSAC accreditation often required commercially | Revise | Reframe: "VAWD / NABP DSAC accreditation often appears in customer or contracting requirements as a commercial expectation, rather than as a federal regulatory requirement." |
| 5 — Entity roles | Importer: must verify imported batches qualitative / quantitative analysis (EU); physically segregate third-country product | Revise | Reframe: "For EU markets, importers typically verify qualitative and quantitative analysis of imported batches and segregate product received from third countries not intended for the local market." |
| 5 — Entity roles | Importer: for US, FDA importer of record; trading-partner obligation lies with the entity introducing product into US commerce | Approved | Important clarification on US importer role. |
| 5 — Entity roles | Importer: pre-launch importation requires PLAIR for non-approved product | Approved | Standard framing. |
| 5 — Entity roles | 3PL: must report licensure status, facility names, and addresses annually under FD&C Act §584(b) | Revise | Reframe: "3PLs typically report licensure status, facility names, and addresses to FDA annually under FD&C Act §584(b)." |
| 5 — Entity roles | 3PL: DSCSA §581(22) — provides logistics services without taking ownership | Approved | Defining feature. |
| 5 — Entity roles | 3PL: ATP responsibilities under §582(a) | Approved | Standard framing. |
| 5 — Entity roles | 3PL: T3 storage but not T3 origination (no ownership change) | Approved | Important clarification. |
| 5 — Entity roles | 3PL: cannot take ownership without becoming a wholesale distributor | Approved | Important clarification. |
| 5 — Entity roles | CDMO Relationship: governed by Quality / Technical Agreement detailing labeling compliance and batch certification | Approved | Standard framing. |
| 5 — Entity roles | CDMO Relationship: CDMO is manufacturer of record; NDA holder is DSCSA trading partner originating T3 | Approved | Important clarification. |
| 5 — Entity roles | CDMO Relationship: line equipment ownership and qualification varies by deal | Approved | Useful orientation. |
| 5 — Entity roles | CDMO Relationship: master data exchange agreements specify fields, timing, failure-handling | Approved | Useful orientation. |
| 5 — Entity roles | CDMO Relationship: serial number range assignment ownership — typically sponsor allocates | Approved | Standard framing. |

### Section 6 — Lifecycle (23 rows)

| Section | Item | Decision | Reviewer note |
|---|---|---|---|
| 6 — Lifecycle | Preclinical: not applicable for serialization or track-and-trace | Revise | Reframe: "Serialization is usually not central in preclinical supply unless the company is voluntarily using serialization-like controls for chain-of-custody or future readiness." |
| 6 — Lifecycle | Late-stage Clinical: IMPs require packaging / labeling / QP cert; commercial serialization does not strictly apply | Revise | Reframe: "Investigational product is typically governed by clinical trial labeling rules; commercial serialization usually applies only when product is intended for commercial introduction." |
| 6 — Lifecycle | Late-stage Clinical: some sponsors voluntarily serialize for chain-of-custody and ease of commercial transition | Approved | Useful orientation. |
| 6 — Lifecycle | Pre-commercial: master data setup — GTIN / GLN via GDSN; EPCIS onboarding | Approved | Core pre-commercial activity. |
| 6 — Lifecycle | Pre-commercial: NDC application; product hierarchy decisions (case-level and pallet aggregation) | Approved | Core pre-commercial activity. |
| 6 — Lifecycle | Pre-commercial: line qualification — vendor selection, IQ / OQ / PQ | Approved | Core pre-commercial activity. |
| 6 — Lifecycle | Pre-commercial: service provider selection and integration; EMVO onboarding 3–6 months and launch-blocking | Revise | Reframe: "Service provider selection and integration; EMVO onboarding typically takes 3–6 months and can become a critical path item for launch timing." |
| 6 — Lifecycle | Pre-commercial: ATP registration / FDA Establishment Registration | Approved | Core pre-commercial activity. |
| 6 — Lifecycle | Pre-commercial: pilot runs through full T3 path | Approved | Core pre-commercial activity. |
| 6 — Lifecycle | Pre-commercial: quality agreements with CMO / CDMO covering serialization | Approved | Core pre-commercial activity. |
| 6 — Lifecycle | Pre-commercial: SOPs, training, change-control framework live | Approved | Core pre-commercial activity. |
| 6 — Lifecycle | Launch: uploading UI to EMVS (EU) or generating and transmitting T3 streams alongside first physical shipment (US) | Approved | Core launch milestone. |
| 6 — Lifecycle | Launch: trading partner connectivity testing with launch wholesalers | Approved | Core launch milestone. |
| 6 — Lifecycle | Launch: VRS configuration and saleable return readiness | Approved | Core launch milestone. |
| 6 — Lifecycle | Launch: recall execution capability validated | Approved | Core launch milestone. |
| 6 — Lifecycle | Post-commercial: saleable returns mandate verification of product identifier before restocking | Approved | Standard post-commercial activity. |
| 6 — Lifecycle | *(NotebookLM adversarial)* Manual quarantine when scanners are down; returning unverified stock to active inventory = critical DSCSA violation | Keep internal | Candidate for public Common Pitfall: "Returning unverified stock to active inventory because of a system or scanner outage creates a saleable-return verification gap that can be treated as a DSCSA finding." |
| 6 — Lifecycle | Post-commercial: change management — packaging, lines, software releases, label updates (each can require EMVO re-upload) | Approved | Standard post-commercial activity. |
| 6 — Lifecycle | Post-commercial: new country expansion — each new country a new regime and project | Approved | Useful orientation. |
| 6 — Lifecycle | Post-commercial: annual reporting cadence under §582(d)(3) and §584 | Approved | Standard post-commercial activity. |
| 6 — Lifecycle | Post-commercial: VRS volume management and exception handling | Approved | Standard post-commercial activity. |
| 6 — Lifecycle | Post-commercial: aggregation governance — discrepancies, parent-child re-aggregation events | Approved | Standard post-commercial activity. |
| 6 — Lifecycle | Post-commercial: continuous improvement on master data quality, exception rates, latency | Approved | Standard post-commercial activity. |

### Section 7 — Related Topics (27 rows)

| Section | Item | Decision | Reviewer note |
|---|---|---|---|
| 7 — Related topics | Packaging: 2D Data Matrix and linear barcode must remain intact and readable under normal use including cartoning friction and cold-chain stress | Revise | Reframe: "Codes need to remain intact and readable across normal conditions of use, including cartoning friction and cold-chain environmental stress." |
| 7 — Related topics | Packaging: print-quality grading per ISO/IEC 15415 | Approved | Standard reference. |
| 7 — Related topics | Packaging: aggregation requires case-level and pallet-level barcoding | Approved | Standard packaging concept. |
| 7 — Related topics | Packaging: EU FMD anti-tampering device interaction with serialization at pack closure | Approved | Useful orientation. |
| 7 — Related topics | Labeling & Artwork: dual barcoding — linear (21 CFR 201.25) plus 2D Data Matrix (DSCSA) | Approved | Important orientation point. |
| 7 — Related topics | *(NotebookLM adversarial)* 21 CFR 201.25 small-footprint exemption — FDA will reject without proven technological infeasibility | Keep internal | Candidate for public Common Pitfall: "Small-footprint exemption claims under 21 CFR 201.25 are typically reviewed against demonstrated technological infeasibility — design or overwrap alternatives are usually expected to be considered first." |
| 7 — Related topics | Labeling & Artwork: bar code zone reservation and clear-zone management | Approved | Standard concept. |
| 7 — Related topics | Labeling & Artwork: human-readable text formatting (font size, position, country requirements) | Approved | Standard concept. |
| 7 — Related topics | Labeling & Artwork: multilingual EU labels with UI placement constraints | Approved | Standard EU concept. |
| 7 — Related topics | Distribution & 3PLs: FEFO logic must be hardcoded alongside DSCSA checks | Revise | Reframe: "FEFO logic typically operates alongside DSCSA verification at the distribution interface." |
| 7 — Related topics | Distribution & 3PLs: ATP verification at every transaction | Approved | Core US orientation. |
| 7 — Related topics | Distribution & 3PLs: 3PL warehouse-level aggregation maintenance | Approved | Standard concept. |
| 7 — Related topics | Distribution & 3PLs: saleable return verification — VRS for US, decommissioning logic for EU | Approved | Useful orientation. |
| 7 — Related topics | Returns: dispensers and distributors must associate saleable return with the original TI / TS | Revise | Reframe: "Saleable returns are typically associated with the original transaction information and statement before return to saleable inventory." |
| 7 — Related topics | Returns: VRS for US saleable returns under §582(c)(4)(D) | Approved | Standard reference. |
| 7 — Related topics | Returns: EU FMD — once decommissioned at dispense, product cannot be re-dispensed | Approved | Important EU orientation. |
| 7 — Related topics | Recalls: decommissioning UI in repositories (EU); 24-hour verification protocol (US) | Approved | Standard reference. |
| 7 — Related topics | Recalls: serialization data is a pre-built recall communication tool — package-level identification supports targeted recall | Approved | Useful orientation. |
| 7 — Related topics | Recalls: 21 CFR Part 7 plus serialized data improves speed and completeness of recall execution | Approved | Useful orientation. |
| 7 — Related topics | Importer / Distributor: verifying ATP status and ensuring environmental conditions during transit are logged and reviewed before release | Approved | Standard orientation. |
| 7 — Related topics | Importer / Distributor: importer does not displace the trading-partner obligation | Approved | Important clarification. |
| 7 — Related topics | Importer / Distributor: distributor obligations anchored in §582(b) plus 21 CFR 205 | Approved | Standard reference. |
| 7 — Related topics | Release & Disposition: physical receipt data from 3PL must be provided to QA to support final batch disposition | Approved | Standard orientation. |
| 7 — Related topics | Release & Disposition: QA must release serialized batch with the SGTIN range tied to the released lot | Revise | Reframe: "QA release of a serialized batch typically ties to the SGTIN range associated with the released lot." |
| 7 — Related topics | Release & Disposition: handoff from CMO / CDMO to NDA holder includes serialized batch record plus master data plus reconciliation | Approved | Standard orientation. |
| 7 — Related topics | Release & Disposition: T3 origination at first commercial transaction; data integrity at this point is foundational | Approved | Core orientation. |
| 7 — Related topics | Release & Disposition: reject / rework / retain / sample handling is a serial-level reconciliation activity | Approved | Useful orientation. |

### Section 8 — Open Questions (15 rows)

| Section | Item | Decision | Reviewer note |
|---|---|---|---|
| 8 — Open questions | Commercial Override Hazards — Quality Agreement with 3PL forbidding pick / pack without electronically verified "RELEASED" status | Keep internal | Engagement diligence prompt; not public topic copy. |
| 8 — Open questions | Destruction Protocols — SOP delegation of "Destruction Order" issuance for rejected / recalled product | Keep internal | Engagement diligence prompt; not public topic copy. |
| 8 — Open questions | CSP Insolvency — data return and security to maintain 6-year record retention | Keep internal | Engagement diligence prompt; not public topic copy. |
| 8 — Open questions | FDA DSCSA Compliance Policy posture after Nov 2024 stabilization | Source gap | Verify current enforcement posture before publication. |
| 8 — Open questions | FDA inspection / enforcement patterns specific to §582(g) | Source gap | Verify recent Warning Letter / 483 themes. |
| 8 — Open questions | Industry VRS volume and exception-rate trends | Source gap | Verify with current GS1 Healthcare US / industry data. |
| 8 — Open questions | Current GS1 EPCIS revision in production use across major hubs | Source gap | Verify current revision before publication. |
| 8 — Open questions | EU Commission / EMA Q&A revisions on safety features | Source gap | Verify current revision before publication. |
| 8 — Open questions | LATAM coverage (Brazil ANVISA, Argentina ANMAT) | Exclude | Out of current US/EU scope; defer for future jurisdiction expansion. |
| 8 — Open questions | Russia / EAEU Chestny ZNAK regime | Exclude | Out of current US/EU scope; defer for future jurisdiction expansion. |
| 8 — Open questions | China NMPA serialization status | Exclude | Out of current US/EU scope; defer for future jurisdiction expansion. |
| 8 — Open questions | Saudi Arabia RSD requirements | Exclude | Out of current US/EU scope; defer for future jurisdiction expansion. |
| 8 — Open questions | ATP de-listing precedents and case examples | Source gap | Verify before any public reference. |
| 8 — Open questions | State Board of Pharmacy enforcement actions touching serialization | Source gap | Verify before any public reference. |
| 8 — Open questions | Treatment of parallel imports / parallel distribution under EU FMD | Source gap | Verify before any public reference. |

---

## Stage-Gate Checklist

- [x] Every row in every section has a decision label applied.
- [x] No rows are blank.
- [x] Total row count equals 176.
- [x] Every Keep-internal NotebookLM / adversarial item has a Common Pitfall candidate or explicit "internal only" note.
- [x] Every Revise row includes a proposed reframe.
- [x] Every Source gap row identifies what must be verified.
- [x] Every Exclude row identifies why it is out of scope.
- [ ] No public topic copy has been drafted.
- [ ] No implementation has occurred.
- [ ] No app source, citation, obligation, or topic content has been changed.

---

## Counts Summary

| Decision | Count | Notes |
|---|---:|---|
| Approved | 135 | Core orientation content. |
| Revise | 17 | Heavy "must" or legalistic wording requiring reframe; includes commercial-expectation and critical-path timing reframes. |
| Keep internal | 10 | NotebookLM interjections and operational risk questions. |
| Source gap | 10 | Time-sensitive enforcement, revision, or industry-data items. |
| Exclude | 4 | Non-US/EU jurisdiction items. |
| **Total** | **176** | Matches section subtotals: 17 + 14 + 35 + 18 + 27 + 23 + 27 + 15. |

### Section Subtotals

| Section | Rows |
|---|---:|
| 1 — Sources | 17 |
| 2 — SC owns | 14 |
| 3 — Adjacent | 35 |
| 4 — US vs EU | 18 |
| 5 — Entity roles | 27 |
| 6 — Lifecycle | 23 |
| 7 — Related topics | 27 |
| 8 — Open questions | 15 |
| **Total** | **176** |

---

## ⛔ Implementation Hold Notice

This Stage 3 classification table is not approved public topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/serialization` from this file. A separate approved `TOPIC_SERIALIZATION.md` file is required before implementation.
