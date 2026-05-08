# TOPIC_SERIALIZATION_DRAFT_PACKET.md

> **Stage:** 1 — Draft Content Preparation
>
> **Status:** Draft candidate — NOT approved for implementation
>
> **Protocol:** [TOPIC_CONTENT_PRODUCTION_PROTOCOL.md](TOPIC_CONTENT_PRODUCTION_PROTOCOL.md)
>
> **Reference pattern:** [TOPIC_PACKAGING.md](TOPIC_PACKAGING.md)

---

## ⛔ Implementation Hold Notice

This draft packet is not approved topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/serialization` from this packet. A separate approved `TOPIC_SERIALIZATION.md` file is required before implementation.

---

## 1. Topic Selection Rationale

Serialization is the next recommended topic because it connects directly to Packaging, Distribution & 3PLs, Returns, Recalls, Importer / Distributor Responsibilities, and EU safety-feature expectations. It is also context-sensitive by jurisdiction, entity role, and lifecycle stage, making it a useful test case for the controlled topic-content protocol after Packaging.

---

## 2. Drafting Inputs Required From Brian / ISC

The following inputs are required before this topic can advance to Stage 2 (Source-Anchored Draft).

### Source Inputs

- [ ] Approved US serialization / traceability source references
- [ ] Approved EU serialization / safety-feature source references
- [ ] Any ISC interpretation notes
- [ ] Any source references that should be marked draft / verify before publication
- [ ] Any source gaps requiring editor review

### Ownership Inputs

- [ ] What supply chain owns directly
- [ ] What Quality owns
- [ ] What Regulatory owns
- [ ] What 3PL / distributor owns
- [ ] What serialization provider owns
- [ ] What MAH / NDA holder owns
- [ ] What CDMO / CMO owns, if relevant

### Applicability Inputs

- [ ] US vs EU differences
- [ ] NDA Holder implications
- [ ] MAH implications
- [ ] Licensed US Distributor implications
- [ ] Importer implications
- [ ] 3PL implications
- [ ] CDMO relationship implications
- [ ] Pre-commercial implications
- [ ] Launch implications
- [ ] Post-commercial implications

### Related-Topic Inputs

- [ ] Packaging — relationship notes
- [ ] Labeling & Artwork — relationship notes
- [ ] Distribution & 3PLs — relationship notes
- [ ] Returns — relationship notes
- [ ] Recalls — relationship notes
- [ ] Importer / Distributor Responsibilities — relationship notes
- [ ] Release & Disposition Handoffs — relationship notes

---

## 3. Source Inventory Placeholder

> **Instruction:** Do not populate source names until Brian / ISC provides approved references. Use placeholder rows only.

| Source Body | Source / Regulation / Guidance | Jurisdiction | Status | Relevance Note | Brian Review Needed |
|---|---|---|---|---|---|
| _TBD_ | _US serialization / traceability law_ | US | Source gap — editor review needed | _Pending Brian input_ | Yes |
| _TBD_ | _US serialization / traceability regulation_ | US | Source gap — editor review needed | _Pending Brian input_ | Yes |
| _TBD_ | _US serialization / traceability guidance_ | US | Source gap — editor review needed | _Pending Brian input_ | Yes |
| _TBD_ | _EU safety features legislation_ | EU | Source gap — editor review needed | _Pending Brian input_ | Yes |
| _TBD_ | _EU safety features delegated regulation_ | EU | Source gap — editor review needed | _Pending Brian input_ | Yes |
| _TBD_ | _EU safety features guidance_ | EU | Source gap — editor review needed | _Pending Brian input_ | Yes |
| _TBD_ | _Serialization standards (GS1, etc.)_ | Global | Source gap — editor review needed | _Pending Brian input_ | Yes |
| _TBD_ | _Additional source TBD_ | _TBD_ | Source gap — editor review needed | _Pending Brian input_ | Yes |

**Allowed status values:**

- ✅ Verified
- ⚠️ Draft reference — verify before publication
- ❌ Source gap — editor review needed

---

## 4. Ownership Boundary Questions

> **Instruction:** These are questions for Brian / ISC to answer. Do not convert questions into claims.

- What does supply chain own in serialization readiness?
- Who owns serialization master data?
- Who owns commissioning / decommissioning responsibilities?
- Who owns aggregation assumptions?
- Who owns verification and exception handling?
- Who owns 3PL serialization execution?
- Who owns saleable returns verification, if applicable?
- Who owns EU safety-feature processes?
- Where does Quality own procedural control?
- Where does Regulatory own market authorization / product information alignment?
- Who owns serialization CMO/CDMO integration requirements?
- Who owns serialization data exchange standards and format agreements?
- Who owns serialization exception triage and resolution?

---

## 5. Applicability Questions

> **Instruction:** These are questions for Brian / ISC to answer. Do not answer them.

### Jurisdiction

**US:**
- What are the key US serialization / traceability requirements?
- What US timelines or phase-in milestones are relevant?
- What US enforcement or compliance expectations apply?

**EU:**
- What are the key EU safety-feature / serialization requirements?
- How does the EU repository system affect entity roles?
- What EU timelines or milestones are relevant?

**US + EU:**
- What is different between US and EU serialization regimes?
- What is similar?
- What traps exist for companies operating in both?

### Entity Role

**NDA Holder:**
- What does the NDA holder own in US serialization?

**MAH:**
- What does the MAH own in EU safety features?

**Licensed US Distributor:**
- What serialization responsibilities fall to the US distributor?

**Importer:**
- What serialization responsibilities fall to the importer (US or EU)?

**3PL:**
- What serialization-adjacent activities does a 3PL perform?
- Does the 3PL ever own serialization directly?

**CDMO Relationship:**
- What serialization responsibilities flow to the CDMO?
- Who owns the serialization master data when manufacturing is outsourced?

### Lifecycle Stage

**Preclinical:**
- Are there serialization considerations at this stage?

**Late-stage Clinical:**
- What serialization readiness activities should begin?

**Pre-commercial:**
- What serialization infrastructure must be in place?
- What testing or qualification is expected?

**Launch:**
- What serialization operational readiness is required at launch?
- What are the critical serialization failure modes at launch?

**Post-commercial:**
- What ongoing serialization obligations apply?
- How does serialization affect returns, recalls, and product tracing?

---

## 6. Regulatory Chain Questions

> **Instruction:** This structures the source-to-artifact chain for later population. Do not populate with actual sources unless provided by Brian / ISC.

### Chain Structure

```
Law → Regulation → Standard → Guidance → Internal Artifact
```

### US Chain (Placeholder)

| Level | Source | Status |
|---|---|---|
| Law | _TBD — Brian input required_ | Source gap — editor review needed |
| Regulation | _TBD — Brian input required_ | Source gap — editor review needed |
| Standard | _TBD — Brian input required_ | Source gap — editor review needed |
| Guidance | _TBD — Brian input required_ | Source gap — editor review needed |
| Internal Artifact | _TBD — Brian input required_ | Source gap — editor review needed |

### EU Chain (Placeholder)

| Level | Source | Status |
|---|---|---|
| Law | _TBD — Brian input required_ | Source gap — editor review needed |
| Regulation | _TBD — Brian input required_ | Source gap — editor review needed |
| Standard | _TBD — Brian input required_ | Source gap — editor review needed |
| Guidance | _TBD — Brian input required_ | Source gap — editor review needed |
| Internal Artifact | _TBD — Brian input required_ | Source gap — editor review needed |

---

## 7. Related Topic Map

> **Instruction:** Use approved route labels only. Do not write relationship explanations beyond neutral placeholders.

| Related Topic | Route | Relationship Direction | Relationship Note |
|---|---|---|---|
| Packaging | `/topics/packaging` | Bidirectional | Relationship note pending Brian review. |
| Labeling & Artwork | `/topics/labeling-artwork` | Adjacent | Relationship note pending Brian review. |
| Distribution & 3PLs | `/topics/distribution` | Downstream | Relationship note pending Brian review. |
| Returns | `/topics/returns` | Downstream | Relationship note pending Brian review. |
| Recalls | `/topics/recalls` | Downstream | Relationship note pending Brian review. |
| Importer / Distributor Responsibilities | `/topics/importer-distributor` | Adjacent | Relationship note pending Brian review. |
| Release & Disposition Handoffs | `/topics/release-disposition` | Adjacent | Relationship note pending Brian review. |
| Controlled Temperature Transport | `/topics/controlled-temperature` | Tangential | Relationship note pending Brian review. |

---

## 8. Known Context-Sensitive Issues

> **Instruction:** These are placeholder questions identifying areas likely to require context-specific treatment. Do not answer them.

- Does the answer change for US vs EU?
- Does the answer change for MAH vs licensed US distributor?
- Does the answer change when a 3PL performs serialization-adjacent activities?
- Does the answer change post-commercial for returns or recalls?
- Does the answer change if serialization execution is outsourced?
- Does the answer change for importers in either jurisdiction?
- Does the answer change for clinical vs commercial product?
- Does the answer change based on the serialization vendor relationship?
- Does the answer change for parallel distribution (EU)?
- Does the answer change based on aggregation hierarchy depth?

---

## 9. Open Questions / Source Gaps

> **Instruction:** Track all unresolved questions and source gaps here. These must be resolved before the topic can advance to Stage 2.

| # | Question / Gap | Category | Status | Resolution |
|---|---|---|---|---|
| 1 | Which US serialization law(s) are the controlling source? | Source | Open | Awaiting Brian input |
| 2 | Which EU safety features regulation(s) are the controlling source? | Source | Open | Awaiting Brian input |
| 3 | Does ISC have interpretation notes on US vs EU serialization differences? | Interpretation | Open | Awaiting Brian input |
| 4 | What ownership boundaries does Brian assign to supply chain vs Quality vs Regulatory? | Ownership | Open | Awaiting Brian input |
| 5 | What serialization standards (GS1, ISO, etc.) should be referenced? | Source | Open | Awaiting Brian input |
| 6 | What are the critical handoff points between serialization and packaging? | Relationship | Open | Awaiting Brian input |
| 7 | How should CDMO/CMO serialization responsibilities be framed? | Ownership | Open | Awaiting Brian input |
| 8 | What lifecycle-stage distinctions matter most for serialization? | Applicability | Open | Awaiting Brian input |
| 9 | Are there any source references that should be marked "draft — verify before publication"? | Source status | Open | Awaiting Brian input |
| 10 | Any additional related topics beyond the 8 identified? | Relationship | Open | Awaiting Brian input |

---

## 10. Draft Approval Checklist

> **Instruction:** All items must be completed before advancing to Stage 2. Brian / ISC must check each item.

| # | Requirement | Status |
|---|---|---|
| 1 | All source inputs provided | ☐ Not started |
| 2 | All ownership inputs provided | ☐ Not started |
| 3 | All applicability inputs provided | ☐ Not started |
| 4 | All related-topic inputs provided | ☐ Not started |
| 5 | Source inventory populated with status markers | ☐ Not started |
| 6 | Ownership boundary questions answered | ☐ Not started |
| 7 | Applicability questions answered | ☐ Not started |
| 8 | Regulatory chain sources identified | ☐ Not started |
| 9 | Context-sensitive issues reviewed | ☐ Not started |
| 10 | Open questions resolved or marked as known gaps | ☐ Not started |
| 11 | Brian approves advancement to Stage 2 | ☐ Not started |

---

## 11. Implementation Hold Notice

> ⛔ **This draft packet is not approved topic content. It must not be implemented in the public app. Antigravity must not populate `/topics/serialization` from this packet. A separate approved `TOPIC_SERIALIZATION.md` file is required before implementation.**

---

## Revision History

| Date | Change | Author |
|---|---|---|
| Phase 5.2-B | Initial draft packet created | System |

---

> **Next step:** Brian / ISC reviews this packet, provides source and ownership inputs, and approves advancement to Stage 2 (Source-Anchored Draft).
