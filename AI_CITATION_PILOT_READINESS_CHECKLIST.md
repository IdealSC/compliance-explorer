# AI-Assisted Citation Pilot Readiness Checklist

> **Phase 3.11 — Pilot Readiness**
>
> Complete this checklist before initiating a limited pilot of the AI-assisted citation suggestion workflow. All items must pass or have documented exceptions with risk acceptance.
>
> **Disclaimer:** AI citation suggestions are draft-only governance records. They do NOT represent legal advice, approved interpretations, or active regulatory reference data.

---

## A. Environment Readiness

- [ ] `DATA_SOURCE=database` — full persistence enabled
- [ ] `NEXT_PUBLIC_DATA_SOURCE=database` — client-side mode matches
- [ ] `DEMO_AUTH_ENABLED=false` — demo auth disabled for pilot
- [ ] OIDC configured and tested (AUTH_SECRET, AUTH_OIDC_ISSUER, AUTH_OIDC_ID, AUTH_OIDC_SECRET)
- [ ] OIDC callback URL registered in identity provider
- [ ] Group-to-role mapping verified (`AUTH_GROUP_ROLE_MAP`)
- [ ] `AI_PROVIDER=azure_openai` (or intended provider) — AI provider configured
- [ ] `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=true` — feature flag enabled for pilot environment ONLY
- [ ] `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT` configured (server-only)
- [ ] No `NEXT_PUBLIC_AI_*` or `NEXT_PUBLIC_AZURE_OPENAI_*` variables in environment
- [ ] `AI_REQUIRE_SOURCE_RECORD_VALIDATED=true` — source validation gate active
- [ ] `AI_MAX_SOURCE_CHARS` set to appropriate limit (default: 12000)
- [ ] `AI_REQUEST_TIMEOUT_MS` set (default: 30000)
- [ ] Database migrations applied (`npm run db:migrate`)
- [ ] Audit logging verified (create action → check `/audit-log`)
- [ ] `npm run predeploy` passes in pilot environment

**Owner:** Platform Admin
**Verification:** Run `npm run predeploy`, verify OIDC login, check environment variables

---

## B. Data Governance Readiness

- [ ] Pilot source set identified (limited, known-good regulatory source materials)
- [ ] Source records created in source registry with proper metadata
- [ ] Source records validated (status: `validated`) — required for AI citation generation
- [ ] Source file metadata registered for pilot sources (file name, type, size, hash)
- [ ] File hashes captured for integrity tracking
- [ ] Source references present (jurisdiction, regulator, document identifiers)
- [ ] Legal hold / retention requirements reviewed for pilot data
- [ ] No production seed (`db:seed`) or reset (`db:reset`) in pilot environment
- [ ] Pilot data is separated from production reference data (if shared database)

**Owner:** Compliance Editor + Legal Reviewer
**Verification:** Navigate to `/source-registry`, verify pilot sources are validated

---

## C. AI Governance Readiness

- [ ] Citation-only prompt approved by compliance stakeholder
- [ ] Prompt version recorded in AI Prompt Version Registry (`/ai-suggestions` → prompts)
- [ ] Prompt does NOT extract obligations, interpretations, controls, evidence, or mappings
- [ ] Prompt includes disclaimers that output is not legal advice
- [ ] Model/provider configured and tested (Azure OpenAI deployment confirmed)
- [ ] Feature flag enabled only in pilot environment — not in production
- [ ] Human review is mandatory — no auto-acceptance possible
- [ ] No obligation extraction capability exists in the system
- [ ] No auto-draft capability exists (conversion requires explicit human action)
- [ ] No auto-publish capability exists (publishing requires approval chain)
- [ ] AI output includes `legalReviewRequired: true` on all generated suggestions
- [ ] AI output includes `suggestionType: 'citation'` — no other types accepted

**Owner:** Compliance Editor + Platform Admin
**Verification:** Generate a test citation, verify it appears as `pending_review` with `legalReviewRequired: true`

---

## D. RBAC & SoD Readiness

- [ ] Compliance Editor pilot users assigned (can generate, can convert to draft)
- [ ] Legal Reviewer assigned (can review, reject; can mark legal review complete; cannot convert or publish)
- [ ] Compliance Approver assigned (can review/approve; cannot generate citations)
- [ ] Auditor assigned (read-only access to audit trail, version history, reports)
- [ ] Admin reviewed — no excessive group mapping
- [ ] Compliance Editor CANNOT approve their own drafts (SoD verified)
- [ ] Compliance Editor CANNOT publish (no `reference.publish` permission)
- [ ] Legal Reviewer CANNOT convert suggestions to draft (no `ai.suggestion.acceptToDraft`)
- [ ] Legal Reviewer CANNOT publish (no `reference.publish` permission)
- [ ] Auditor CANNOT generate, review, convert, approve, or publish
- [ ] No single user holds both Editor and Approver roles
- [ ] Publishing enforces `reference.publish` permission and SoD chain

**Owner:** Platform Admin
**Verification:** Test each role's access to `/ai-suggestions`, `/draft-mapping`, `/review-approval`, `/validation-workbench`

---

## E. End-to-End Testing

### E1. AI Citation Generation
- [ ] As Compliance Editor: POST to `/api/ai/citation-suggestions/generate` with validated source
- [ ] Verify citations appear in `/ai-suggestions` as `pending_review`
- [ ] Verify audit event created for generation

### E2. AI Suggestion Rejection
- [ ] As Legal Reviewer or Approver: reject a suggestion with reviewer notes
- [ ] Verify suggestion status → `rejected` (terminal)
- [ ] Verify audit event created for rejection

### E3. AI Suggestion Expiration
- [ ] Expire a suggestion (if applicable)
- [ ] Verify suggestion status → `expired` (terminal)
- [ ] Verify audit event created

### E4. AI Suggestion → Draft Conversion
- [ ] As Compliance Editor: convert an eligible reviewed suggestion to draft
- [ ] Verify draft created in `/draft-mapping` with provenance stamp `[AI Citation Suggestion: ...]`
- [ ] Verify AI-linked badge visible on draft card
- [ ] Verify duplicate conversion blocked on retry
- [ ] Verify audit event includes suggestion ID linkage

### E5. Draft Validation (Advisory)
- [ ] Create validation review for the AI-linked draft
- [ ] Assess source support status
- [ ] Assess citation accuracy status
- [ ] Complete legal review (as Legal Reviewer) if flagged
- [ ] Mark as "Ready for Review" — verify 5-gate preconditions enforced
- [ ] Verify validation badge appears on `/draft-mapping` and `/review-approval`
- [ ] Verify "Ready for Review" ≠ approved

### E6. Review & Approval
- [ ] Submit draft for review (as Editor)
- [ ] Approve draft (as Approver — different user than creator)
- [ ] Verify SoD blocks same-user approval
- [ ] Verify audit event with approver identity

### E7. Controlled Publishing
- [ ] Publish approved change (as Approver with `reference.publish`)
- [ ] Verify new version created in `/version-history`
- [ ] Verify prior version superseded (if applicable)
- [ ] Verify audit event with publication provenance

### E8. Audit Trail Verification
- [ ] Navigate to `/audit-log`
- [ ] Filter by entity type and action
- [ ] Verify events exist for: generation, review, conversion, validation, approval, publication
- [ ] Verify each event includes: userId, userEmail, userName, roles, action, checksum

### E9. Report Snapshot
- [ ] Export a report from `/reports`
- [ ] Verify snapshot created with ID, checksum, timestamp
- [ ] Verify CSV/JSON includes governance disclaimer

### E10. AI Disabled Mode
- [ ] Set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false`
- [ ] Verify POST to `/api/ai/citation-suggestions/generate` returns 503 `FEATURE_DISABLED`
- [ ] Verify all other pages still function normally

**Owner:** Compliance Editor + Legal Reviewer + Compliance Approver + Auditor
**Verification:** Complete all E1–E10 scenarios, document results

---

## F. Rollback & Containment Plan

- [ ] Feature flag off switch documented: set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false`
- [ ] Provider config removal documented: set `AI_PROVIDER=none`
- [ ] Access group removal documented: remove pilot users from Editor IdP group
- [ ] Existing audit events, report snapshots, and version history preserved (immutable — cannot be deleted)
- [ ] Existing draft changes preserved — can be individually rejected/closed via review workflow
- [ ] No destructive deletion required or possible for governance records
- [ ] Rollback procedure tested on staging
- [ ] Escalation path defined for AI-related incidents

**Owner:** Platform Admin + Compliance Approver
**Verification:** Test feature flag toggle and confirm generation endpoint returns 503

---

## Sign-Off

| Section | Status | Reviewer | Date |
|---|---|---|---|
| A. Environment | | | |
| B. Data Governance | | | |
| C. AI Governance | | | |
| D. RBAC & SoD | | | |
| E. E2E Testing | | | |
| F. Rollback Plan | | | |

**Pilot Decision:** ___ APPROVE / BLOCK ___

**Pilot Scope:** ___

**Notes:**

---

## Revision History

| Date | Change | Phase |
|---|---|---|
| Phase 3.11 | Initial pilot readiness checklist created | 3.11 |
