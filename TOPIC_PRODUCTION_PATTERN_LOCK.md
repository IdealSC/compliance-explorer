# Topic Production Pattern Lock

**Phase:** 5.2-Q — Pattern Lock
**Date:** 2026-05-08
**Author:** Brian Adams + Design Partner
**Status:** Locked

---

## 1. Pattern Status

```
The controlled topic-production pattern is locked after successful completion of Packaging, Serialization, and Labeling & Artwork.
```

```
Future topics must follow this pattern unless Brian / ISC explicitly approves a deviation.
```

---

## 2. Completed Controlled Topics

| Topic | Route | Status | Closure Record |
|---|---|---|---|
| Packaging | `/topics/packaging` | Implemented | Packaging reference implementation / `TOPIC_PACKAGING.md` |
| Serialization | `/topics/serialization` | Implemented | `SERIALIZATION_TOPIC_CLOSURE_RECORD.md` |
| Labeling & Artwork | `/topics/labeling-artwork` | Implemented | `LABELING_ARTWORK_TOPIC_CLOSURE_RECORD.md` |

---

## 3. Standard Lifecycle Sequence

The following sequence is the default pattern for future topics:

1. **Stage 1** — Draft packet created
2. **Stage 2** — Source / input population
3. **Stage 3** — Review packet created
4. **Stage 3 classification decisions** applied
5. **Controlled topic markdown** drafted
6. **Topic draft reviewed** before implementation
7. **Topic route implemented**
8. **Fidelity / scope audit** completed
9. **Closure record** created

```
No public topic implementation occurs until the controlled topic markdown file exists and has passed pre-implementation review.
```

---

## 4. Required Artifacts by Stage

| Stage | Required Artifact | Purpose |
|---|---|---|
| Stage 1 | `TOPIC_<NAME>_DRAFT_PACKET.md` | Collect questions, source needs, ownership areas, applicability areas, related topics |
| Stage 2 | Updated draft packet | Populate Brian / ISC source notes and stress-test inputs |
| Stage 3 review | `TOPIC_<NAME>_STAGE_3_REVIEW.md` | Convert inputs into review/classification rows |
| Classification | Updated Stage 3 review packet | Apply Approved / Revise / Keep internal / Source gap / Exclude decisions |
| Topic draft | `TOPIC_<NAME>.md` | Controlled public-topic source file |
| Review report | `TOPIC_<NAME>_REVIEW_REPORT.md` | Confirm draft is ready before implementation |
| Implementation | Topic route/content files | Populate public route from approved topic markdown |
| Closure | `<NAME>_TOPIC_CLOSURE_RECORD.md` | Lock provenance and safety trail |

---

## 5. Brian / ISC Decision Gates

The following gates require explicit Brian / ISC approval before proceeding:

1. Approval to populate Stage 2 from source notes
2. Approval of Stage 3 classification rules and overrides
3. Approval to draft `TOPIC_<NAME>.md`
4. Approval after pre-implementation review
5. Approval to commit implementation
6. Approval to close the topic

```
Antigravity must stop before commit and wait for explicit approval whenever a phase report recommends commit.
```

---

## 6. Classification Rules

Five allowed classification labels:

| Label | Definition |
|---|---|
| **Approved** | Safe for public topic copy. |
| **Revise** | Useful but needs softened public-facing wording. |
| **Keep internal** | Useful for editorial judgment, QA stress-testing, risk review, or engagement diligence; not public copy unless converted into an approved public-safe pitfall. |
| **Source gap** | Withheld pending source verification, citation specificity, currentness, or applicability review. |
| **Exclude** | Out of scope, outside approved jurisdiction scope, duplicative, or not useful to the target user. |

```
When uncertain, use the more conservative label.
```

---

## 7. Drafting Rules

- Use Approved rows as source material.
- Use Revise rows only through reviewer-note reframes.
- Do not use Source gap rows as public topic content.
- Do not use Exclude rows.
- Do not use original NotebookLM / adversarial language directly in public-facing sections.
- Keep internal rows may be used only as public-safe Common Pitfall rewrites when such rewrites were approved.
- Do not add new regulatory interpretation.
- Do not research new sources during drafting unless separately authorized.
- Do not claim independent source verification.

---

## 8. Implementation Rules

- The approved `TOPIC_<NAME>.md` file is the source of truth.
- Implementation must not rewrite, improve, expand, or reinterpret content.
- Implement only the approved topic route.
- Do not populate other topic routes.
- Do not modify Packaging, Serialization, or Labeling & Artwork unless explicitly in scope.
- Do not modify `src/data`.
- Do not add source, citation, obligation, or regulatory mapping records.
- Do not add AI behavior, Q&A, or chatbot behavior.
- Do not modify admin/auth/data model.

---

## 9. Fidelity and Safety Audit Rules

Implementation must be audited before closure. Minimum checks:

| # | Check |
|---|---|
| 1 | Route renders populated content |
| 2 | Five public sections render in order: What this is · Ownership boundaries · Applicability · Regulatory chain · What it touches next |
| 3 | Internal control sections are not rendered publicly |
| 4 | Source gap material is not rendered as public content |
| 5 | Exclude material is not rendered |
| 6 | Original adversarial language is not rendered directly |
| 7 | Existing populated topics remain unchanged |
| 8 | Placeholder topics remain placeholder-only |
| 9 | Public navigation remains unchanged |
| 10 | Admin remains visually distinct |
| 11 | No `src/data` changes |
| 12 | No source/citation/obligation records added |
| 13 | Build passes |

---

## 10. Closure Record Requirements

Every implemented topic must receive a closure record including:

1. Topic status
2. Implementation commit
3. Source document chain
4. Controlled lifecycle history
5. Files involved
6. Fidelity / implementation verification result
7. Regulatory safety confirmation
8. Public/admin safety confirmation
9. Remaining source gaps
10. Excluded scope
11. Future maintenance notes
12. Closure statement

---

## 11. Public/Admin Separation Rules

- Public topic pages must not show admin metadata.
- Public topic pages must not show draft/review/audit/version labels unless intentionally part of public orientation copy.
- Admin routes must remain unchanged unless explicitly in scope.
- The public operating context selector must not appear in admin.
- Admin links must not appear on public topic pages.

---

## 12. Source/Citation/Obligation Safety Rules

- Topic content files may reference sources as draft/public copy.
- App source records must not be added unless a separate source-record phase is authorized.
- App citation records must not be added unless separately authorized.
- App obligation records must not be added unless separately authorized.
- `src/data` changes are out of scope for normal topic population unless explicitly approved.
- Any regulatory record mutation requires separate review and commit approval.

---

## 13. Common Scope Hazards

- Starting implementation before `TOPIC_<NAME>.md` exists.
- Treating Stage 2 packet content as public copy.
- Treating Keep internal notes as public content.
- Using Source gap rows in public sections.
- Copying adversarial language into public pages.
- Adding content beyond the approved topic file during implementation.
- Changing topic components unnecessarily.
- Accidentally modifying Packaging, Serialization, or Labeling & Artwork while adding a new topic.
- Adding `src/data` records during topic implementation.
- Committing untracked input-note files that were intentionally left local.

---

## 14. Next-Topic Readiness Criteria

Before starting another topic, confirm:

1. Current baseline is clean.
2. Prior topic closure record is committed.
3. Next topic is selected.
4. Stage 1 draft packet is authorized.
5. No source notes are treated as public copy.
6. No route implementation is started.
7. The topic follows the locked pattern unless Brian / ISC approves a deviation.

---

## 15. Locked Pattern Statement

```
The Packaging → Serialization → Labeling & Artwork sequence establishes the controlled topic-production pattern. Future topics must follow this lifecycle: draft packet, source/input population, Stage 3 classification, controlled topic markdown draft, pre-implementation review, implementation, fidelity verification, and closure record. Antigravity must not auto-generate regulatory content or implement topic pages before the required gates are complete.
```

---

> **Governance Notice:** This pattern lock is a controlled document. It reflects the production methodology used for the first three topics and serves as the baseline for future topic expansion. Deviations require explicit Brian / ISC approval.
