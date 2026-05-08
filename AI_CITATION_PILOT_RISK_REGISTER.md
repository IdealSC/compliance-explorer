# AI-Assisted Citation Pilot Risk Register

> **Phase 3.11 — Pilot Readiness**
>
> This document identifies, classifies, and mitigates risks associated with operating the AI-assisted citation suggestion workflow in a controlled pilot. Each risk includes severity, likelihood, detection method, mitigation, and impact on pilot go/no-go decision.
>
> **Disclaimer:** AI citation suggestions are draft-only governance records. They do NOT represent legal advice, approved interpretations, or active regulatory reference data.

---

## Risk Matrix Legend

| Severity | Definition |
|---|---|
| **Critical** | Could result in incorrect active regulatory data, compliance violation, or audit failure |
| **High** | Could result in data quality issues, workflow confusion, or trust erosion |
| **Medium** | Could cause operational friction, user confusion, or pilot delay |
| **Low** | Minor operational concern with limited impact |

| Likelihood | Definition |
|---|---|
| **Likely** | Expected to occur during pilot under normal conditions |
| **Possible** | Could occur given foreseeable conditions |
| **Unlikely** | Requires specific failure conditions; not expected |
| **Remote** | Requires multiple simultaneous failures |

---

## Risk Register

### R1: AI-Hallucinated Citation Reference

| Attribute | Value |
|---|---|
| **Risk** | AI model generates a citation reference that does not exist in the source text or refers to a non-existent regulation |
| **Severity** | Critical |
| **Likelihood** | Likely |
| **Detection** | Human review at Stage 5 (AI Suggestion Review) and Stage 7 (Validation Workbench — citation accuracy assessment) |
| **Mitigation** | (1) Mandatory human review before conversion, (2) `legalReviewRequired: true` on all AI output, (3) Citation accuracy assessment gate in validation, (4) Source text excerpt included with suggestions for cross-reference |
| **Owner** | Legal Reviewer + Compliance Editor |
| **Go/No-Go** | Mitigated by design — human review chain prevents hallucinated citations from reaching active reference data. **Proceed.** |

---

### R2: Rubber-Stamp Review Bypass

| Attribute | Value |
|---|---|
| **Risk** | Human reviewers accept AI suggestions without adequate scrutiny |
| **Severity** | High |
| **Likelihood** | Possible |
| **Detection** | Audit trail review — rapid acceptance patterns, minimal reviewer notes, skipped validation steps |
| **Mitigation** | (1) 8-gate eligibility check enforces minimum review state, (2) Legal review flag requires explicit completion, (3) 5-gate validation preconditions for "Ready for Review" status, (4) SoD prevents single-user push to publication |
| **Owner** | Compliance Approver (monitoring) |
| **Go/No-Go** | Mitigated by workflow design. Monitor during pilot. **Proceed with monitoring plan.** |

---

### R3: Draft Mistaken for Approved Reference Data

| Attribute | Value |
|---|---|
| **Risk** | Pilot users treat AI-linked draft records as authoritative reference data before completing review → approval → publishing |
| **Severity** | Critical |
| **Likelihood** | Possible |
| **Detection** | (1) Governance banners on all relevant pages, (2) "Ready for Review" badge (not "Approved"), (3) AI-linked provenance badge on draft cards |
| **Mitigation** | (1) Draft status clearly labeled in UI, (2) Governance warning text in ValidationDetailDrawer, (3) AI disclaimer on all suggestion outputs, (4) Publishing requires separate approval chain |
| **Owner** | Compliance Editor + Legal Reviewer |
| **Go/No-Go** | Mitigated by UI labeling and workflow gates. **Proceed.** |

---

### R4: AI Provider Credential Exposure

| Attribute | Value |
|---|---|
| **Risk** | Azure OpenAI API key or endpoint leaked to client bundle via `NEXT_PUBLIC_` variable |
| **Severity** | Critical |
| **Likelihood** | Remote |
| **Detection** | (1) Predeploy script scans for `NEXT_PUBLIC_AI_*` and `NEXT_PUBLIC_AZURE_OPENAI_*`, (2) Smoke test validates no client exposure |
| **Mitigation** | (1) Predeploy script blocks deployment if detected, (2) CI/CD runs predeploy, (3) Manual review of `.env` configuration |
| **Owner** | Platform Admin |
| **Go/No-Go** | Mitigated by automated detection. **Proceed.** |

---

### R5: Prompt Drift / Unauthorized Prompt Modification

| Attribute | Value |
|---|---|
| **Risk** | AI citation prompt is modified to extract obligations, interpretations, or other prohibited entity types |
| **Severity** | Critical |
| **Likelihood** | Unlikely |
| **Detection** | (1) Prompt Version Registry records all prompt versions, (2) Code review of prompt changes, (3) Drift Watchlist in PROJECT_CONTROL_BASELINE.md |
| **Mitigation** | (1) Prompt changes require code deployment, (2) No runtime prompt editing capability, (3) Zod schema enforces `suggestionType: 'citation'` only, (4) PROJECT_CONTROL_BASELINE.md prohibits scope expansion without new phase |
| **Owner** | Compliance Editor + Platform Admin |
| **Go/No-Go** | Mitigated by code-level controls. **Proceed.** |

---

### R6: Audit Trail Gap

| Attribute | Value |
|---|---|
| **Risk** | A governance action (generation, review, conversion, validation, approval, publication) fails to produce an audit event |
| **Severity** | High |
| **Likelihood** | Unlikely |
| **Detection** | (1) End-to-end pilot test comparing action log to audit trail, (2) Audit integrity verification endpoint |
| **Mitigation** | (1) All service writes use `insertAuditEvent()` pattern, (2) Audit events are transactional (within same DB transaction where possible), (3) Checksums enable tamper detection |
| **Owner** | Auditor + Platform Admin |
| **Go/No-Go** | Verify during E2E pilot test (Checklist E8). **Proceed if verified.** |

---

### R7: RBAC Misconfiguration — Overprivileged Pilot User

| Attribute | Value |
|---|---|
| **Risk** | A pilot user has excessive permissions (e.g., can both edit and approve) |
| **Severity** | High |
| **Likelihood** | Possible |
| **Detection** | (1) IdP group membership audit, (2) Role matrix review against RBAC definitions |
| **Mitigation** | (1) Pre-pilot RBAC review (Checklist D), (2) SoD enforcement in publishing service, (3) Minimal group assignment — no overlapping editor/approver groups |
| **Owner** | Platform Admin |
| **Go/No-Go** | Verify during RBAC readiness check (Checklist D). **Proceed if verified.** |

---

### R8: AI Service Outage — Provider Unavailability

| Attribute | Value |
|---|---|
| **Risk** | Azure OpenAI endpoint is unreachable or returns errors during pilot |
| **Severity** | Medium |
| **Likelihood** | Possible |
| **Detection** | (1) Generation endpoint returns 502 `GENERATION_FAILED`, (2) Audit event records the failure |
| **Mitigation** | (1) `AI_REQUEST_TIMEOUT_MS` prevents hung requests, (2) Failure is logged and audited, (3) All other workflows continue unaffected — AI is additive, not blocking, (4) Feature flag can be disabled instantly |
| **Owner** | Platform Admin |
| **Go/No-Go** | AI outage is non-blocking to pilot. **Proceed.** |

---

### R9: Duplicate Draft Conversion

| Attribute | Value |
|---|---|
| **Risk** | Same AI suggestion converted to draft multiple times, creating duplicate regulatory change records |
| **Severity** | High |
| **Likelihood** | Remote |
| **Detection** | (1) Eligibility gate checks suggestion status — `accepted_to_draft` prevents re-conversion, (2) Duplicate conversion guard implemented in Phase 3.9 |
| **Mitigation** | (1) 8-gate eligibility includes "not already converted" check, (2) Status transition to `accepted_to_draft` is atomic |
| **Owner** | Compliance Editor |
| **Go/No-Go** | Mitigated by design. **Proceed.** |

---

### R10: Validation Badge Misinterpretation

| Attribute | Value |
|---|---|
| **Risk** | "Ready for Review" badge on `/draft-mapping` or `/review-approval` is misinterpreted as approval |
| **Severity** | Medium |
| **Likelihood** | Possible |
| **Detection** | User feedback, governance banner text on validation drawer |
| **Mitigation** | (1) Badge renamed from "Validated" to "Ready for Review" (Phase 3.10 QA fix), (2) Governance warning text in ValidationDetailDrawer, (3) Badge is advisory — does not gate publishing |
| **Owner** | Compliance Editor + Legal Reviewer |
| **Go/No-Go** | Mitigated by UI labeling. **Proceed with user orientation.** |

---

### R11: Source Validation Gate Bypass

| Attribute | Value |
|---|---|
| **Risk** | AI citations generated for unvalidated source records |
| **Severity** | High |
| **Likelihood** | Remote |
| **Detection** | (1) `AI_REQUIRE_SOURCE_RECORD_VALIDATED=true` (default), (2) Citation service checks source validation status |
| **Mitigation** | (1) Server-side validation gate in `generateCitationSuggestions()`, (2) Returns 409 `SOURCE_NOT_VALIDATED` if gate fails, (3) Environment variable is `true` by default |
| **Owner** | Platform Admin |
| **Go/No-Go** | Mitigated by default configuration. **Proceed.** |

---

### R12: JSON Mode Data Loss

| Attribute | Value |
|---|---|
| **Risk** | Pilot runs in `DATA_SOURCE=json` mode, causing all writes to be discarded silently |
| **Severity** | High |
| **Likelihood** | Unlikely |
| **Detection** | (1) All write APIs return 503 `JSON_MODE` when not in database mode, (2) Predeploy validates `DATA_SOURCE` |
| **Mitigation** | (1) Pre-pilot environment check (Checklist A), (2) API responses clearly indicate JSON mode, (3) Predeploy script validates |
| **Owner** | Platform Admin |
| **Go/No-Go** | Verify during environment readiness (Checklist A). **Proceed if verified.** |

---

### R13: Unauthorized AI Feature Activation

| Attribute | Value |
|---|---|
| **Risk** | AI citation feature enabled in production without authorization |
| **Severity** | High |
| **Likelihood** | Unlikely |
| **Detection** | (1) Feature flag requires explicit `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=true`, (2) Default is `false`, (3) Provider configuration required separately |
| **Mitigation** | (1) Feature disabled by default, (2) Requires both feature flag AND provider configuration, (3) Environment variable changes require deployment access |
| **Owner** | Platform Admin |
| **Go/No-Go** | Mitigated by default-off design. **Proceed.** |

---

### R14: Incomplete Provenance Chain

| Attribute | Value |
|---|---|
| **Risk** | Published regulatory change lacks traceability back to AI suggestion origin |
| **Severity** | Medium |
| **Likelihood** | Unlikely |
| **Detection** | (1) Audit trail search by entity type chain, (2) Provenance stamp in `changeReason` field |
| **Mitigation** | (1) `[AI Citation Suggestion: {id}]` stamp embedded in draft `changeReason`, (2) `sourceReference` field in audit events links across entities, (3) AI-linked badge in UI identifies AI-originated drafts |
| **Owner** | Auditor |
| **Go/No-Go** | Verify during E2E test (Checklist E4, E8). **Proceed if verified.** |

---

### R15: Demo Auth in Pilot Environment

| Attribute | Value |
|---|---|
| **Risk** | Pilot runs with `DEMO_AUTH_ENABLED=true`, allowing unauthenticated role switching |
| **Severity** | Critical |
| **Likelihood** | Remote |
| **Detection** | (1) Predeploy script warns when demo auth is active in production mode, (2) Demo role switcher visible in UI |
| **Mitigation** | (1) Pre-pilot environment check (Checklist A), (2) Predeploy blocks production deployment with demo auth |
| **Owner** | Platform Admin |
| **Go/No-Go** | Verify during environment readiness (Checklist A). **Block if detected.** |

---

### R16: Scope Creep — Non-Citation AI Expansion

| Attribute | Value |
|---|---|
| **Risk** | Future development adds obligation extraction, interpretation generation, or other AI capabilities without proper phase authorization |
| **Severity** | Critical |
| **Likelihood** | Unlikely (during pilot) |
| **Detection** | (1) Drift Watchlist in PROJECT_CONTROL_BASELINE.md, (2) CI/CD code review, (3) Zod schema enforcement |
| **Mitigation** | (1) PROJECT_CONTROL_BASELINE.md explicitly prohibits scope expansion without new phase, (2) Drift Watchlist identifies prohibited imports, (3) `suggestionType: 'citation'` enforced at schema level |
| **Owner** | Compliance Approver + Platform Admin |
| **Go/No-Go** | Mitigated by governance baseline. **Proceed.** |

---

## Risk Summary

| Risk | Severity | Likelihood | Go/No-Go Impact |
|---|---|---|---|
| R1: Hallucinated Citation | Critical | Likely | Proceed — mitigated by human review chain |
| R2: Rubber-Stamp Review | High | Possible | Proceed with monitoring |
| R3: Draft ≠ Approved Confusion | Critical | Possible | Proceed — mitigated by UI labeling |
| R4: Credential Exposure | Critical | Remote | Proceed — mitigated by automated detection |
| R5: Prompt Drift | Critical | Unlikely | Proceed — mitigated by code controls |
| R6: Audit Gap | High | Unlikely | Proceed if E2E verified |
| R7: RBAC Misconfiguration | High | Possible | Proceed if RBAC verified |
| R8: AI Outage | Medium | Possible | Proceed — non-blocking |
| R9: Duplicate Conversion | High | Remote | Proceed — mitigated by design |
| R10: Badge Misinterpretation | Medium | Possible | Proceed with orientation |
| R11: Source Gate Bypass | High | Remote | Proceed — mitigated by default |
| R12: JSON Mode Data Loss | High | Unlikely | Proceed if env verified |
| R13: Unauthorized AI Activation | High | Unlikely | Proceed — default-off |
| R14: Incomplete Provenance | Medium | Unlikely | Proceed if E2E verified |
| R15: Demo Auth in Pilot | Critical | Remote | **Block if detected** |
| R16: Scope Creep | Critical | Unlikely | Proceed — governance baseline |

**Overall Assessment:** All risks are mitigated by existing controls or can be verified during pre-pilot checklist execution. No blocking risks identified at this time, contingent on successful completion of the Pilot Readiness Checklist.

---

## Revision History

| Date | Change | Phase |
|---|---|---|
| Phase 3.11 | Initial risk register created | 3.11 |
