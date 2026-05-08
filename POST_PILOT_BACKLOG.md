# Post-Pilot Backlog

> **Phase 4.2 — Classified Findings and Improvement Backlog**
>
> **Created:** 2026-05-07
> **Source:** Phase 4.1 Controlled Production Pilot (Day-0 through Day-5)
> **Author:** Brian Adams (Technical Owner)

---

## Classification Key

| Priority | Description |
|---|---|
| P0 | Critical blocker — must fix before any rollout |
| P1 | High — should fix before broader rollout |
| P2 | Medium — should fix before graduation |
| P3 | Low — nice to have, can defer |

---

## 1. Critical Blockers

**None identified.** The pilot completed with zero blocking issues.

---

## 2. Governance / Safety Fixes

| ID | Finding | Source | Role Affected | Risk | Gov. Impact | Phase | Complexity | Priority | Before Rollout? |
|---|---|---|---|---|---|---|---|---|---|
| GOV-01 | PATCH handlers silently accept unknown fields, allowing operators to send incorrect field names without error | Day-2 deviation D-D2-01 | All API users | Medium | Medium — could mask validation bypass attempts | 4.3 | Low | P2 | Recommended |
| GOV-02 | Demo auth must be disabled for production (`DEMO_AUTH_ENABLED=false`) | LC1 | All users | High | High — demo auth bypasses OIDC | 4.3 | Trivial | P1 | Yes |
| GOV-03 | OIDC end-to-end login verification at production URL | LC2 | All users | High | High — required for real identity verification | 4.3 | Low | P1 | Yes |

---

## 3. UI / UX Clarity Improvements

| ID | Finding | Source | Role Affected | Risk | Gov. Impact | Phase | Complexity | Priority | Before Rollout? |
|---|---|---|---|---|---|---|---|---|---|
| UX-01 | Validation review status not visible inline in draft detail view — requires separate API call | Day-2 operator experience | Approver | Low | Low | 4.3 | Medium | P2 | No |
| UX-02 | No publishing confirmation dialog with pre-publish checklist in UI | Day-3 operator experience | Publisher | Low | Low — API validates, but UI should reinforce | 4.3 | Medium | P2 | No |
| UX-03 | Audit event timeline not visualized in draft provenance view | Day-5 evidence review | Auditor | None | None | 4.4 | Medium | P3 | No |
| UX-04 | Source support assessment requires API-only PATCH (no inline UI form) | Day-2 operator experience | Approver | Low | Low | 4.3 | Medium | P2 | No |
| UX-05 | Citation accuracy comparison lacks side-by-side source text viewer | Day-2 operator experience | Reviewer | Low | Low | 4.4 | High | P3 | No |
| UX-06 | Negative test results not displayable in UI — API-only verification | Day-4 testing | Admin | None | None | 4.4 | Low | P3 | No |

---

## 4. Workflow Efficiency Improvements

| ID | Finding | Source | Role Affected | Risk | Gov. Impact | Phase | Complexity | Priority | Before Rollout? |
|---|---|---|---|---|---|---|---|---|---|
| WF-01 | Validation review creation endpoint is nested (`/drafts/[id]/reviews`) — not discoverable without documentation | Day-5 evidence review (D-D4-03) | Approver | None | None | 4.3 | Trivial | P2 | No |
| WF-02 | No batch validation (each gate requires separate PATCH) | Day-2 operator experience | Approver | None | None | 4.4 | Medium | P3 | No |
| WF-03 | Suggestion review action names differ from body field names (`action: "reject"` vs. `reviewerDecision: "rejected"`) | Day-4 testing (D-D4-01) | All API users | Low | None | 4.3 | Low | P2 | Recommended |

---

## 5. Reporting / Evidence Improvements

| ID | Finding | Source | Role Affected | Risk | Gov. Impact | Phase | Complexity | Priority | Before Rollout? |
|---|---|---|---|---|---|---|---|---|---|
| RPT-01 | Audit integrity verification window capped at 100 events | Day-3 deviation D-D3-03 | Auditor | Low | Low — performance tradeoff | 4.4 | Low | P3 | No |
| RPT-02 | Report snapshot metadata could include pilot phase and day number for traceability | Day-5 evidence review | Auditor | None | None | 4.3 | Trivial | P3 | No |
| RPT-03 | No automated pilot test report generation (currently manual evidence capture) | Day-4/Day-5 experience | Admin | None | None | 4.4 | High | P3 | No |

---

## 6. Operational Improvements

| ID | Finding | Source | Role Affected | Risk | Gov. Impact | Phase | Complexity | Priority | Before Rollout? |
|---|---|---|---|---|---|---|---|---|---|
| OPS-01 | API field reference guide needed for pilot operators | Lesson LL-01 | All operators | Low | Low | 4.2 | Trivial | P1 | ✅ **COMPLETE** — [API_FIELD_GUIDE.md](API_FIELD_GUIDE.md) |
| OPS-02 | Full API endpoint path documentation needed | Lesson LL-02 | All operators | Low | Low | 4.2 | Low | P1 | ✅ **COMPLETE** — [ENDPOINT_REFERENCE.md](ENDPOINT_REFERENCE.md) |
| OPS-03 | Automated E1–E10 + N1–N12 test suite (scripted) | Lesson LL-04 | Admin | None | None — improves verification | 4.3 | Medium | P2 | Recommended |
| OPS-04 | Database backup verification before pilot operations | Day-0 checklist | Admin | Medium | Low | 4.3 | Low | P2 | Yes |

---

## 7. New Capability Requests

| ID | Finding | Source | Role Affected | Risk | Gov. Impact | Phase | Complexity | Priority | Before Rollout? |
|---|---|---|---|---|---|---|---|---|---|
| CAP-01 | Batch citation generation across multiple sources | Anticipated efficiency need | Editor | Low | Low — same per-citation governance | 4.4+ | Medium | P3 | No |
| CAP-02 | Confidence threshold filtering for AI suggestions | Anticipated quality improvement | Editor | None | None | 4.3 | Low | P3 | No |
| CAP-03 | Participant activity dashboard | Multi-user pilot need | Admin | None | None | 4.4 | Medium | P3 | No |
| CAP-04 | Digital stakeholder sign-off workflow | Sign-off collection need | All stakeholders | Low | Low | 4.5 | High | P3 | No |
| CAP-05 | Citation diff viewer (before/after edit comparison) | Publishing workflow enhancement | Reviewer | None | None | 4.4 | Medium | P3 | No |

---

## 8. Deferred AI Expansion Ideas

> [!CAUTION]
> These items are **explicitly out of scope** and require formal PROJECT_CONTROL_BASELINE amendment, separate risk assessment, and explicit stakeholder approval before any implementation work begins.

| ID | Finding | Source | Role Affected | Risk | Gov. Impact | Phase | Complexity | Priority | Before Rollout? |
|---|---|---|---|---|---|---|---|---|---|
| DEF-01 | Obligation extraction from regulatory text | Anticipated future need | Editor | **High** | **High** — new AI scope | TBD | High | Deferred | N/A |
| DEF-02 | Interpretation extraction from regulatory text | Anticipated future need | Editor | **High** | **High** — new AI scope | TBD | High | Deferred | N/A |
| DEF-03 | OCR / document file parsing | Anticipated future need | Editor | Medium | Medium | TBD | High | Deferred | N/A |
| DEF-04 | Automatic draft mapping (AI-to-draft without human) | Not recommended | — | **Critical** | **Critical** — bypasses human review | — | — | **Not recommended** | N/A |
| DEF-05 | Automatic approval | Not recommended | — | **Critical** | **Critical** — bypasses SoD | — | — | **Not recommended** | N/A |
| DEF-06 | Automatic publishing | Not recommended | — | **Critical** | **Critical** — bypasses controlled publishing | — | — | **Not recommended** | N/A |

---

## Backlog Summary

| Category | Count | P0 | P1 | P2 | P3 | Before Rollout? |
|---|---|---|---|---|---|---|
| Critical Blockers | 0 | 0 | — | — | — | — |
| Governance / Safety | 3 | 0 | 2 | 1 | 0 | 2 required, 1 recommended |
| UI / UX | 6 | 0 | 0 | 3 | 3 | 0 |
| Workflow | 3 | 0 | 0 | 3 | 0 | 1 recommended |
| Reporting | 3 | 0 | 0 | 0 | 3 | 0 |
| Operational | 4 | 0 | 2 | 2 | 0 | 2 required, 1 recommended |
| New Capability | 5 | 0 | 0 | 0 | 5 | 0 |
| Deferred AI | 6 | 0 | 0 | 0 | 6 | N/A |
| **Total** | **30** | **0** | **4** | **9** | **17** | **4 required, 3 recommended** |

### Pre-Rollout Required Items (4)

1. **GOV-02** — `DEMO_AUTH_ENABLED=false` (P1) — ⏳ at deployment
2. **GOV-03** — OIDC end-to-end verification (P1) — ⏳ at deployment
3. **OPS-01** — API field reference guide (P1) — ✅ **COMPLETE** ([API_FIELD_GUIDE.md](API_FIELD_GUIDE.md))
4. **OPS-02** — API endpoint path documentation (P1) — ✅ **COMPLETE** ([ENDPOINT_REFERENCE.md](ENDPOINT_REFERENCE.md))

### Pre-Rollout Recommended Items (3)

5. **GOV-01** — Strict PATCH validation (P2)
6. **WF-03** — Consistent action/field naming (P2)
7. **OPS-03** — Automated test suite (P2)

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-05-07 | Post-pilot backlog created from Phase 4.1 retrospective | System |
| 2026-05-07 | Phase 4.3: OPS-01 and OPS-02 marked COMPLETE (API_FIELD_GUIDE.md, ENDPOINT_REFERENCE.md delivered) | System |

---

> **Governance Notice:** Items in Category 8 (Deferred AI Expansion) are not approved for implementation. Any work on these items requires formal scope expansion approval per PROJECT_CONTROL_BASELINE.md Section 4.0 prerequisites.
