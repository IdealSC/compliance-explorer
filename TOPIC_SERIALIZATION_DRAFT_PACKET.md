# TOPIC_SERIALIZATION_DRAFT_PACKET.md

> **Stage:** 2 — Source-Anchored Draft Packet
>
> **Status:** Draft packet with Brian / ISC source inputs — NOT approved for implementation
>
> **Protocol:** [TOPIC_CONTENT_PRODUCTION_PROTOCOL.md](TOPIC_CONTENT_PRODUCTION_PROTOCOL.md)
>
> **Reference pattern:** [TOPIC_PACKAGING.md](TOPIC_PACKAGING.md)

---

## ⛔ Implementation Hold Notice

This Stage 2 packet is not approved topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/serialization` from this packet. A separate approved `TOPIC_SERIALIZATION.md` file is required before implementation.

---

## 1. Topic Selection Rationale

Serialization is the next recommended topic because it connects directly to Packaging, Distribution & 3PLs, Returns, Recalls, Importer / Distributor Responsibilities, and EU safety-feature expectations. It is also context-sensitive by jurisdiction, entity role, and lifecycle stage, making it a useful test case for the controlled topic-content protocol after Packaging.

---

## 2. Source Inventory

> All statuses below are **Brian-provided statuses**, not independently verified.

| Source Body / Source | Jurisdiction | Brian-Provided Status | Why It Matters | Public-Use Status |
|---|---|---|---|---|
| DSCSA (Title II of DQSA) / FD&C Act §582 | US | Verified | Mandates product identifiers (NDC, serial, lot, expiry) in 2D Data Matrix and package-level electronic tracing (TI, TS). | Candidate for approved source list |
| FMD (Directive 2011/62/EU) and Delegated Regulation (EU) 2016/161 | EU | Verified | Dictates MAH responsibilities for uploading Unique Identifiers (UI) to the EMVS / EU-Hub and decommissioning protocols. | Candidate for approved source list |
| 21 CFR 201.25 (Linear Barcode Rule) | US | Verified | Requires linear barcode encoding the NDC for clinical / bedside safety, operating concurrently with DSCSA requirements. | Candidate for approved source list |
| GS1 General Specifications and EPCIS | Both | Verified | Global standard for secure, interoperable electronic data exchange of tracking events — the "what, where, when, and why." | Candidate for approved source list |
| FDA Product Identifiers Under DSCSA QA | US | Verified | Defines product identifier composition, encoding, human-readable, package-level expectations. | Candidate for approved source list |
| FDA Standardization of Data and Documentation Practices for Product Tracing | US | Verified | Format and content for T3 transaction information, history, statement. | Candidate for approved source list |
| FDA Standards for the Interoperable Exchange of Information for Tracing of Certain Human Finished Prescription Drugs | US | Verified | Interoperability standards underpinning §582(g) Enhanced Drug Distribution Security. | Candidate for approved source list |
| FDA Wholesale Distributor Verification Requirement for Saleable Returned Drug Product and 2019 / 2023 enforcement policies | US | Verified | Operational rules for VRS-based saleable return verification. | Candidate for approved source list |
| FDA Enhanced Drug Distribution Security at the Package Level Under DSCSA (§582(g)) | US | Draft reference — verify final form before publication | Defines the package-level interoperable T3 endpoint of DSCSA's 10-year ramp. | Draft reference — verify before publication |
| FDA DSCSA Implementation: Identification of Suspect Product and Notification | US | Verified | Operational suspect product handling, FDA Form 3911 reporting. | Candidate for approved source list |
| FDA DSCSA Annual Reporting by Wholesale Distributors and 3PLs | US | Verified | §582(d)(3) reporting cadence and content. | Candidate for approved source list |
| FDA DSCSA Compliance Policy (post–Nov 2024 stabilization and staggered exemption windows) | US | Draft reference — verify current enforcement posture | Defines effective enforcement reality during the ramp. | Draft reference — verify before publication |
| 21 CFR 205 — State Licensing of Wholesale Prescription Drug Distributors | US | Verified | Federal floor for state distributor licensing; data integrity at distributor level. | Candidate for approved source list |
| EMA / European Commission Q&A on Safety Features for Medicinal Products for Human Use | EU | Verified | Authoritative interpretation of Delegated Reg 2016/161. | Candidate for approved source list |
| EMVO User Requirements Specification and Onboarding documentation | EU | Reference standard | Hub-side onboarding requirements for MAHs and parallel distributors. | Internal reference only |
| EU GDP (2013/C 343/01) Chapter 5 — Operations | EU | Verified | Storage, segregation, and operational standards. | Candidate for approved source list |
| ISO/IEC 16022 (Data Matrix) and ISO/IEC 15415 (print-quality grading) | Both | Reference standard | Symbology and print-quality specifications. | Internal reference only |

---

## 3. Supply Chain Ownership Notes

> **Brian / ISC draft ownership inputs — requires Stage 3 review before public use.**

- **EPCIS data exchange:** Technical onboarding and continuous management of EPCIS connections with 3PLs, wholesalers, and dispensers; range planning, event posting, exception queue management.
- **Physical receipt and verification:** Executing physical receipt and verifying it against electronic Transaction Information (TI) and Transaction Statements (TS).
- **Quarantine and segregation:** Immediately physically segregating suspect, illegitimate, expired, or recalled product.
- **Master data:** NDC and GTIN allocation per GS1 Healthcare GTIN allocation rules; product hierarchy from saleable unit through case and pallet; PC (PPN or NTIN) for EU presentations.
- **Serial number management:** Range planning, allocation, no-reuse policy, lot-to-serial reconciliation.
- **Line-side execution coordination:** Oversight of CDMO / CMO print-and-verify and aggregation execution — even where SC does not own the line, SC owns the data flow.
- **Trading partner connectivity:** ATP confirmation per §582(a) before transacting; T3 capture and transmission per §582(b)(1) and (c)(1).
- **Saleable return verification:** VRS configuration and operational handling per §582(c)(4)(D).
- **Suspect / illegitimate product handling per §582(c)(4):** Quarantine, investigation, FDA notification (Form 3911), disposition.
- **Country reporting:** EMVO upload for EU presentations; country-specific portals where applicable.
- **Recall execution:** Pulling lot- and serial-level distribution data from serialized records.
- **Annual reporting:** Under DSCSA §582(d)(3) for distributors and §584 for 3PLs.

---

## 4. Adjacent Ownership Notes

> **Brian / ISC draft adjacent-ownership inputs — requires Stage 3 review before public use.**

### Quality

- Disposition (release / reject) and suspect / illegitimate product investigations, including OOS and recalls.
- CSV / CSA per FDA Computer Software Assurance for Production and Quality System Software guidance for serialization software, hub integrations, and VRS.
- IQ / OQ / PQ for serialization line equipment, print-and-verify, and aggregation stations.
- Change control on master data, line moves, software releases, vendor migrations.
- Exception and deviation handling: failed verifications, aggregation mismatches, T3 reconciliation breaks.
- Audit and inspection support — DSCSA inspections, EU GMP / GDP inspections.

### Regulatory

- Notification to authorities. If a product is deemed illegitimate, Regulatory / Quality must notify FDA and immediate trading partners within 24 hours using Form FDA 3911.
- NDC registration; PC (PPN / NTIN) publication for EU.
- EU MAH master-data uploads to EMVO before pack release.
- Country regulatory filings that cite serialization data and labeling.
- Recall communications: serial-driven distribution lookups feed targeted notifications.

### 3PL / Distributor

- Providing warehousing and logistics without taking ownership of the product.
- T3 receipt, storage, downstream transmission per §582(b)(1) and (c)(1).
- ATP verification at every transaction.
- Saleable return verification per §582(c)(4)(D).
- Aggregation handling: parent-child integrity at receipt and shipping.
- §582(d)(3) and §584 annual reporting where applicable.

### Serialization Provider

- Value Added Network (VAN) routing and maintenance of the serialized data repository.
- Hub services: data normalization, country reporting connectors, EMVO and NMVO connectivity for EU.
- API / EDI / EPCIS integration with trading partners.
- Master data management within the hub.
- Change management for new country requirements.

### MAH / NDA Holder

- Overall responsibility for placing the product on the market, generating the Serialized National Identifier (SNI), and uploading serial data to the respective national / regional hubs, including EMVS for EU.
- Master data ownership: NDC / PC, GTIN, product hierarchy, serial range allocation.
- Serialization architecture and policy.
- Service-provider selection and contracting.
- Recall, withdrawal, suspect product responses.
- Authorized Trading Partner registration and FDA Establishment Registration.

### CDMO / CMO

- Applying the physical 2D Data Matrix, linear barcodes, and human-readable interpretations during packaging operations.
- Line equipment serialization capability and qualification.
- Master data exchange with sponsor — fields, timing, failure handling.
- Quality / Technical Agreement provisions on serialization roles, sample / retain handling, reject and rework treatment, batch reconciliation.
- Sponsor sign-off on serialized batches before release.

---

## 5. Jurisdiction Notes

> **Brian / ISC draft jurisdiction inputs — requires Stage 3 review before public use.**

### US

- Requires a 2D Data Matrix on the lowest saleable unit encoding the NDC, serial number, lot number, and expiration date.
- Heavy focus on the passing of electronic Transaction Information (TI) and Transaction Statements (TS) between trading partners — track-and-trace model.
- Verification triggered on suspect product (§582(c)(4)) and on saleable returns (§582(c)(4)(D)).
- Authorized Trading Partner regime under §582(a) governs who can transact.
- Annual reporting for wholesale distributors and 3PLs (§582(d)(3) and §584).
- 21 CFR 201.25 linear barcode requirement runs concurrently with DSCSA — both must be present.
- State Boards of Pharmacy and 21 CFR 205 add a state-level layer.

### EU

- Requires a Unique Identifier (UI) containing product code, serial number, batch number, expiry date, and the national reimbursement number where required, uploaded to a centralized router: European Hub / EMVS.
- Focus is on endpoint verification and decommissioning at point of dispense — verification model, not full track-and-trace.
- Two safety features mandated: UI plus anti-tampering device (ATD).
- Wholesaler verification is risk-based, not mandatory at every transaction.
- MAH uploads UI master data to EMVO before pack release.
- Live since Feb 9, 2019; ongoing Q&A revisions from Commission and EMA.

### Both

- Strict master data governance and reliance on GS1 standards: GTINs, SGTINs.
- 2D GS1 Data Matrix at the saleable presentation level.
- Demand immediate isolation and reporting of suspected falsified / illegitimate medicines.
- GS1 EPCIS as the dominant event-based exchange standard.
- Serialization service providers operate across both regimes.

---

## 6. Entity Role Notes

> **Draft entity-role inputs — requires Brian / ISC review before public use.**

### NDA Holder

- Must affix product identifiers and initiate the TI / TS data stream.
- Originates the first T3 transaction at first sale.
- Authorized Trading Partner under §581(2)(A); FDA Establishment Registration in place.

### MAH

- Responsible for uploading UI data to the repositories system before release for sale and managing decommissioning during recalls.
- Accountable for FMD compliance in each EU member state where the product is marketed.
- May contract with a serialization service provider for EMVO connectivity, but accountability does not transfer.

### Licensed US Distributor

- Must verify Authorized Trading Partner (ATP) status by checking state or federal licenses before transacting.
- Wholesale distributor under DSCSA §581(29) and 21 CFR 205: state licensing.
- T3 capture, storage, transmission per §582(b)(1) and (c)(1).
- Saleable return verification per §582(c)(4)(D).
- Suspect product handling per §582(c)(4).
- §582(d)(3) annual reporting.
- VAWD / NABP DSAC accreditation often required commercially even though not federally mandated.

### Importer

- Must verify that imported batches have undergone full qualitative and quantitative analysis in the EU for EU markets and physically segregate products received from third countries not intended for the local market.
- For US: FDA importer of record for entry; the trading-partner obligation lies with the entity that introduces product into US commerce, typically the NDA holder or licensed importer-distributor.
- Pre-launch importation requires PLAIR for non-approved product.

### 3PL

- Must report licensure status, facility names, and addresses annually to FDA under FD&C Act §584(b).
- Defined in DSCSA §581(22) — provides logistics services without taking ownership.
- ATP responsibilities under §582(a).
- T3 storage but not T3 origination because there is no ownership change.
- Cannot take ownership without becoming a wholesale distributor.

### CDMO Relationship

- Governed by the Quality / Technical Agreement, which must explicitly detail labeling compliance and batch certification requirements.
- CDMO is the manufacturer of record for the physical product; the NDA holder is the DSCSA trading partner originating T3.
- Line equipment ownership and qualification varies by deal.
- Master data exchange agreements specify fields, timing, and failure-handling.
- Serial number range assignment ownership — typically sponsor allocates and assigns ranges.

---

## 7. Lifecycle Notes

> **Brian / ISC draft lifecycle inputs — requires Stage 3 review before public use.**

### Preclinical

- Brian input: Not applicable for serialization or track-and-trace requirements.

### Late-stage Clinical

- IMPs require packaging, labeling, and QP certification, but commercial serialization, including DSCSA / FMD barcodes, does not strictly apply until the product is intended for commercial introduction.
- Some sponsors voluntarily serialize for chain-of-custody and to ease commercial transition.

### Pre-commercial

- Master data setup, including GTIN / GLN assignment via Global Data Synchronization Network (GDSN); EPCIS onboarding.
- NDC application; product hierarchy decisions: case-level aggregation yes/no, pallet aggregation yes/no.
- Line qualification: vendor selection, IQ / OQ / PQ.
- Service provider selection and integration; EMVO onboarding for EU is typically a 3–6 month, launch-blocking process.
- ATP registration / FDA Establishment Registration.
- Pilot runs with serialized product through full T3 path.
- Quality agreements with CMO / CDMO covering serialization.
- SOPs, training, change-control framework live.

### Launch

- Uploading UI to EMVS for EU or generating and transmitting T3 data streams alongside the first physical shipment for US.
- Trading partner connectivity testing with launch wholesalers.
- VRS configuration and saleable return readiness.
- Recall execution capability validated.

### Post-commercial

- Handling saleable returns, which mandates verification of the product identifier before restocking.
- Change management: packaging changes, line moves, software releases, label updates, each of which can require re-upload to EMVO.
- New country expansion — each new country is a new regime and a project.
- Annual reporting cadence under §582(d)(3) and §584.
- VRS volume management and exception handling.
- Aggregation governance: discrepancies, reconciliation, parent-child re-aggregation events.
- Continuous improvement on master data quality, exception rates, latency.

---

## 8. Related Topic Notes

> **Brian / ISC draft related-topic inputs — requires Stage 3 review before public use.**

### Packaging

- The 2D Data Matrix and linear barcode must remain intact and readable under normal conditions of use, including friction from cartoning and cold-chain environmental stress.
- Print-quality grading per ISO/IEC 15415.
- Aggregation requires case-level and pallet-level barcoding.
- EU FMD anti-tampering device interacts with the serialization step at point of pack closure.

### Labeling & Artwork

- Must accommodate dual barcoding: linear for 21 CFR 201.25 and 2D Data Matrix for DSCSA.
- Bar code zone reservation and clear-zone management.
- Human-readable text formatting: font size, position, country requirements.
- Multilingual EU labels with UI placement constraints.

### Distribution & 3PLs

- FEFO logic must be hardcoded alongside DSCSA checks.
- ATP verification at every transaction.
- 3PL warehouse-level aggregation maintenance.
- Saleable return verification: VRS for US; decommissioning logic for EU.

### Returns

- Dispensers and distributors must associate the saleable return product with the transaction information and transaction statement originally associated with it.
- VRS — Verification Router Service for US saleable returns under §582(c)(4)(D).
- EU FMD: once decommissioned at dispense, product cannot be re-dispensed.

### Recalls

- Requires decommissioning of the unique identifier in all relevant national / supranational repositories in the EU and a 24-hour verification response protocol in the US.
- Serialization data is a pre-built recall communication tool — package-level identification supports targeted recall to specific trading partners.
- 21 CFR Part 7 plus serialized data improves speed and completeness of recall execution.

### Importer / Distributor Responsibilities

- Verifying ATP status and ensuring appropriate environmental conditions during transit are logged and reviewed before release.
- Importer does not displace the trading-partner obligation.
- Distributor obligations anchored in DSCSA §582(b) plus 21 CFR 205.

### Release & Disposition Handoffs

- Physical receipt data from the 3PL must be provided to QA to support final batch disposition.
- QA must release the serialized batch with the SGTIN range tied to the released lot.
- Handoff from CMO / CDMO to NDA holder includes serialized batch record plus master data plus reconciliation.
- T3 origination at first commercial transaction; data integrity at this point is foundational.
- Reject / rework / retain / sample handling is a serial-level reconciliation activity.

---

## 9. Internal Editorial Risk Notes — Not Public Copy

> **These are stress-test issues from Brian's editorial review process. They are not approved for public wording. They may inform common pitfalls or what-to-ask-next prompts after Brian / ISC review.**

### EPCIS / ALCOA+ Risk

- **Stress-test issue:** While supply chain owns the data exchange, they frequently fail to apply ALCOA+ principles to mapping failures. If an EPCIS event fails to post contemporaneously with the physical shipment, the product is technically adulterated in transit.
- **Status:** Requires Brian / ISC review. Not approved for public wording.

### Electronic Segregation Validation Risk

- **Stress-test issue:** Electronic segregation via WMS / ERP is permitted, but the gap lies in validation. If the electronic segregation is not validated to provide equivalent security to a physical cage, this represents a significant EU GDP Chapter 5 compliance risk.
- **Status:** Requires Brian / ISC review. Not approved for public wording.

### QA Release Status Mismatch Risk

- **Stress-test issue:** QA often signs paper release documents but fails to ensure the system status in the 3PL portal reflects "RELEASED," causing supply chain to bypass DSCSA controls to meet shipping deadlines.
- **Status:** Requires Brian / ISC review. Not approved for public wording.

### 3PL Investigation Boundary Risk

- **Stress-test issue:** 3PLs cannot conduct suspect product investigations for the pharmacy or MAH. The entity taking ownership must complete the investigation.
- **Status:** Requires Brian / ISC review. Not approved for public wording.

### MAH Delegation Risk

- **Stress-test issue:** MAHs frequently delegate EMVS uploads to their CDMO but forget they cannot delegate the legal responsibility. If the CDMO's server fails to upload the data, the MAH is liable for distributing falsified-status medicines.
- **Status:** Requires Brian / ISC review. Not approved for public wording.

### Small-Footprint Barcode Exemption Risk

- **Stress-test issue:** Firms often attempt to claim an exemption under 21 CFR 201.25 due to "small footprint" blister cards. The FDA will reject this if the firm has not proven that redesigning the package or using an overwrap is technologically unfeasible.
- **Status:** Requires Brian / ISC review. Not approved for public wording.

### Manual Quarantine Risk

- **Stress-test issue:** If a pharmacy returns stock and the 3PL's scanners are down, the SOP must enforce a "Manual Quarantine." Returning unverified stock to active inventory because of an IT failure is a critical DSCSA compliance risk.
- **Status:** Requires Brian / ISC review. Not approved for public wording.

---

## 10. Known Source Gaps and Open Questions

> **All items below are open — requires Brian / ISC review before topic drafting.**

### Operational Risk Questions

- **Commercial Override Hazards:** Does the Quality Agreement with the 3PL explicitly forbid them from picking / packing an order unless the system status is electronically verified as "RELEASED," or can a sales representative force a manual override?
- **Destruction Protocols:** When a product is rejected / recalled and subsequently decommissioned, does the Supply Chain SOP clearly delegate who issues the financial "Destruction Order" to the 3PL to ensure the product is permanently destroyed and the data trail reflects that status?
- **CSP Insolvency:** If the Cloud Service Provider handling the EPCIS / serial data repository goes insolvent, does the Quality System define how the data is completely returned and secured to maintain the legal obligation for 6-year record retention?

### Regulatory and Source-Landscape Gaps

- Final FDA DSCSA Compliance Policy posture after the post–November 2024 stabilization period and the staggered exemption windows — current enforcement reality as of publication date needs verification.
- FDA inspection and enforcement patterns specific to §582(g) Enhanced Drug Distribution Security — recent Warning Letter or 483 themes.
- Industry VRS volume and exception-rate trends.
- Current GS1 EPCIS revision in production use across major hubs.
- EU Commission and EMA Q&A revisions on safety features.
- LATAM coverage if needed: Brazil ANVISA, Argentina ANMAT.
- Russia / EAEU Chestny ZNAK regime coverage.
- China NMPA serialization status.
- Saudi Arabia RSD requirements.
- ATP de-listing precedents and case examples.
- State Board of Pharmacy enforcement actions touching serialization data integrity.
- Treatment of parallel imports / parallel distribution under EU FMD.

---

## 11. Drafting Implications for Future TOPIC_SERIALIZATION.md

> **This section maps available input material to the eventual five public sections. Do not draft final public copy.**

### Section 1 — What This Is

Available input:
- Source inventory (17 sources with Brian-provided statuses)
- US vs EU jurisdiction notes (track-and-trace vs verification model distinction)
- Master data and EPCIS context from ownership notes

### Section 2 — Ownership Boundaries

Available input:
- 12 supply chain ownership themes
- 6 adjacent-ownership subsections (Quality, Regulatory, 3PL/Distributor, Serialization Provider, MAH/NDA Holder, CDMO/CMO)
- 7 editorial risk notes that may inform common pitfalls

### Section 3 — Applicability

Available input:
- US jurisdiction notes (7 bullets)
- EU jurisdiction notes (6 bullets)
- Both-jurisdiction notes (5 bullets)
- 6 entity role profiles with detailed inputs
- 5 lifecycle stage profiles

### Section 4 — Regulatory Chain

Available input:
- 17 source candidates spanning Law → Regulation → Standard → Guidance
- US chain anchored on DSCSA / FD&C Act §582
- EU chain anchored on FMD Directive 2011/62/EU and Delegated Reg 2016/161
- GS1 standards spanning both jurisdictions

### Section 5 — What It Touches Next

Available input:
- 7 related-topic subsections with handoff descriptions
- Cross-references to Packaging, Labeling, Distribution, Returns, Recalls, Importer/Distributor, Release/Disposition

---

## 12. Brian / ISC Review Checklist

> **All items must be reviewed before advancing to Stage 3.**

| # | Review Item | Status |
|---|---|---|
| 1 | Source inventory reviewed — all statuses confirmed or corrected | ☐ Not started |
| 2 | Supply chain ownership notes reviewed — scope confirmed | ☐ Not started |
| 3 | Adjacent ownership notes reviewed — boundaries confirmed | ☐ Not started |
| 4 | US jurisdiction notes reviewed — accuracy confirmed | ☐ Not started |
| 5 | EU jurisdiction notes reviewed — accuracy confirmed | ☐ Not started |
| 6 | Entity role notes reviewed — profiles confirmed | ☐ Not started |
| 7 | Lifecycle notes reviewed — stage assignments confirmed | ☐ Not started |
| 8 | Related topic notes reviewed — handoffs confirmed | ☐ Not started |
| 9 | Editorial risk notes reviewed — disposition decided (use / modify / discard) | ☐ Not started |
| 10 | Source gaps reviewed — which gaps block publication vs. which are deferred | ☐ Not started |
| 11 | Operational risk questions reviewed — which inform public content | ☐ Not started |
| 12 | Draft reference sources verified or marked for deferral | ☐ Not started |
| 13 | Tone and wording reviewed for public suitability | ☐ Not started |
| 14 | Brian approves advancement to Stage 3 | ☐ Not started |

---

## 13. Stage Gate

### Current Stage

**Stage 2 — Source-Anchored Draft Packet**

### Next Gate

**Stage 3 — Brian / ISC Review**

Brian must review this packet and explicitly approve advancement before `TOPIC_SERIALIZATION.md` can be created.

### Gate Requirements

1. All 14 review checklist items addressed
2. Source statuses confirmed or corrected
3. Editorial risk notes dispositioned
4. Source gaps triaged (block vs. defer)
5. Explicit Brian approval for Stage 3 advancement

---

## ⛔ Implementation Hold Notice

This Stage 2 packet is not approved topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/serialization` from this packet. A separate approved `TOPIC_SERIALIZATION.md` file is required before implementation.

---

## Revision History

| Date | Change | Author |
|---|---|---|
| Phase 5.2-B | Initial draft packet created (Stage 1) | System |
| Phase 5.2-C | Updated with Brian / ISC source notes. Advanced to Stage 2. 17 sources inventoried, ownership notes structured, jurisdiction/entity/lifecycle notes added, 7 editorial risk notes captured, source gaps documented. | System |

---

> **Next step:** Brian / ISC reviews this Stage 2 packet and approves advancement to Stage 3 before `TOPIC_SERIALIZATION.md` can be drafted.
