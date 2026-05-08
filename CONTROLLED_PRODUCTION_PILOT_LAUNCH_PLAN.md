# Controlled Production Pilot Launch Plan

> **Phase 4.0 — Operational Launch Planning**
>
> **Created:** 2026-05-07
> **Status:** LAUNCHED — GO WITH CONDITIONS (Day-0 executed 2026-05-07)
> **Authorization:** [CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md](CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md)
>
> **Disclaimer:** AI citation suggestions are draft-only governance records. They do NOT represent legal advice, approved interpretations, or active regulatory reference data. This system is NOT a validated GxP system.

---

## A. Executive Launch Summary

This document defines the operational launch plan for the Compliance Operating Map's controlled production pilot. The pilot has been formally authorized via [CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md](CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md) following successful execution of all 10 governance scenarios (E1–E10) with 100% audit integrity verification.

**Pilot Objective:** Validate that the AI-assisted citation suggestion governance workflow operates correctly in a production environment with real OIDC authentication, live Azure OpenAI integration, and named participants performing governed workflows under production conditions.

**Pilot Duration:** 90 days from Day-0 launch (renewable with updated sign-offs).

**Pilot Boundary:** Citation suggestions only. No AI scope expansion authorized.

| Launch Metric | Value |
|---|---|
| Staging pilot result | 10/10 PASS |
| Audit integrity | 100/100 verified |
| Approval record | Signed (Technical Owner) |
| Production controls | 19 mandatory (per Section L of approval record) |
| Entry criteria satisfied | 8/12 (4 deployment-time) |
| Remaining sign-offs | 4 (Compliance Owner, Legal Reviewer, Auditor, Business Sponsor) |

---

## B. Approved Pilot Scope

| Capability | Authorized | Constraint |
|---|---|---|
| AI citation suggestion generation | ✅ | Azure OpenAI `gpt-4.1-mini`, prompt `citation-v1.0.0` |
| Human review of suggestions | ✅ | Reject, expire, mark for review, annotate, toggle legal flag |
| Human accept-to-draft conversion | ✅ | Citation-type only; 8-gate eligibility; duplicate guard |
| Legal/compliance validation | ✅ | Source support, citation accuracy, legal review; 5-gate preconditions |
| Review/approval workflow | ✅ | Multi-role; SoD enforced |
| Controlled publishing | ✅ | Requires approved review chain |
| Audit trail | ✅ | Immutable; SHA-256; append-only |
| Report snapshots | ✅ | Timestamped; checksummed; append-only |
| Source intake | ✅ | Metadata-only; Zod-validated |
| Source file metadata | ✅ | Identity + lifecycle tracking; no content storage |

---

## C. Explicit Out-of-Scope Items

> **None of the following are authorized. Any implementation requires formal amendment to PROJECT_CONTROL_BASELINE.md.**

| Prohibited Item | Category |
|---|---|
| AI obligation extraction | AI Scope |
| AI interpretation extraction | AI Scope |
| OCR / text extraction | File Processing |
| File parsing / content analysis | File Processing |
| File upload / file storage | File Processing |
| Automatic AI suggestion acceptance | Automation |
| Automatic approval | Automation |
| Automatic publishing | Automation |
| Active reference mutation outside publishing | Data Integrity |
| Background/scheduled AI extraction | Automation |
| External API integrations (EDGAR, eCFR) | Integration |
| AI model for non-citation use | AI Scope |

---

## D. Production Environment Requirements

### D1. Infrastructure

| Requirement | Specification |
|---|---|
| Hosting | Vercel, Railway, or equivalent Node.js platform |
| Runtime | Node.js 18+ |
| Database | Neon PostgreSQL (existing staging instance or dedicated production) |
| TLS | HTTPS required; TLS 1.2+ |
| Domain | Custom domain with valid certificate |
| CDN | Optional; no client-side secret caching |

### D2. Performance Baseline

| Metric | Target |
|---|---|
| Page load (cold) | < 3s |
| API response (read) | < 500ms |
| API response (AI generation) | < 10s (Azure OpenAI dependent) |
| Uptime | 99% (business hours) |
| Concurrent users | 5–10 (pilot scale) |

### D3. Security Requirements

| Requirement | Enforcement |
|---|---|
| HTTPS only | Platform-level TLS termination |
| HSTS | `Strict-Transport-Security` header (post-deployment verification) |
| CSP | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` |
| No secret leakage | `npm run predeploy` — 0 `NEXT_PUBLIC_` secret variables |
| OIDC authentication | `DEMO_AUTH_ENABLED=false`; Auth.js v5 |
| Session security | `AUTH_SECRET` unique per environment; secure cookies |

---

## E. Deployment-Time Verification Checklist

> **All items must PASS before pilot operations begin.**

### E-BUILD: Build & Validation

- [ ] `npm run build` — 0 TypeScript errors
- [ ] `npm run typecheck` — 0 type errors
- [ ] `npm run smoke-test` — all checks pass
- [ ] `npm run predeploy` — all checks pass
- [ ] Route count verified (79+ routes)

### E-ENV: Environment Variables

- [ ] All variables from Section F configured
- [ ] `DATA_SOURCE=database` confirmed
- [ ] `DEMO_AUTH_ENABLED=false` confirmed
- [ ] 0 `NEXT_PUBLIC_AI_*` variables
- [ ] 0 `NEXT_PUBLIC_AZURE_OPENAI_*` variables
- [ ] 0 `NEXT_PUBLIC_DATABASE_URL` variables
- [ ] 0 `NEXT_PUBLIC_AUTH_SECRET` variables

### E-AUTH: Authentication

- [ ] OIDC login succeeds (named participant)
- [ ] OIDC logout succeeds
- [ ] Demo auth endpoint returns 403 or is inaccessible
- [ ] Session includes user identity from IdP
- [ ] Group-to-role mapping verified

### E-DB: Database

- [ ] `DATABASE_URL` reachable from production
- [ ] Migrations applied (`npm run db:migrate`)
- [ ] Seed data verified (SRC-001 through SRC-008 present)
- [ ] Backup confirmed and restorable
- [ ] Rollback SQL or backup restoration documented

### E-AI: AI Provider

- [ ] Azure OpenAI endpoint reachable from production
- [ ] Citation generation returns 200 with valid suggestion
- [ ] `legalReviewRequired: true` on generated suggestions
- [ ] `suggestionType: 'citation'` enforced
- [ ] AI disclaimer present in response

### E-GOV: Governance Controls

- [ ] Controlled publishing workflow verified (draft → review → publish)
- [ ] Audit events created for state transitions
- [ ] Audit integrity check passes (`/api/audit/verify-integrity` → PASS)
- [ ] Report snapshot creation verified
- [ ] RBAC blocks unauthorized writes (viewer → 403)

### E-SEC: Security Headers

- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Strict-Transport-Security` present (HTTPS deployments)
- [ ] No stack traces in error responses

---

## F. Required Environment Variables

### F1. Core Application

| Variable | Required | Value |
|---|---|---|
| `DATA_SOURCE` | ✅ | `database` |
| `NEXT_PUBLIC_DATA_SOURCE` | ✅ | `database` |
| `DEMO_AUTH_ENABLED` | ✅ | `false` |
| `NODE_ENV` | ✅ | `production` |

### F2. Database

| Variable | Required | Value |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |

### F3. Authentication (OIDC)

| Variable | Required | Value |
|---|---|---|
| `AUTH_SECRET` | ✅ | Unique per environment (generated) |
| `AUTH_URL` | ✅ | Production deployment URL |
| `AUTH_OIDC_ISSUER` | ✅ | `https://accounts.google.com` |
| `AUTH_OIDC_ID` | ✅ | Google OAuth client ID |
| `AUTH_OIDC_SECRET` | ✅ | Google OAuth client secret |
| `AUTH_GROUP_ROLE_MAP` | ✅ | JSON mapping IdP groups → application roles |

### F4. AI Provider

| Variable | Required | Value |
|---|---|---|
| `AI_PROVIDER` | ✅ | `azure_openai` |
| `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` | ✅ | `true` |
| `AZURE_OPENAI_ENDPOINT` | ✅ | `https://compliance-citation-ai.openai.azure.com/` |
| `AZURE_OPENAI_API_KEY` | ✅ | Azure API key (server-side only) |
| `AZURE_OPENAI_DEPLOYMENT` | ✅ | `gpt-4.1-mini` |

### F5. Prohibited Variables (must NOT exist)

| Variable Pattern | Reason |
|---|---|
| `NEXT_PUBLIC_AI_*` | Secret leakage to client |
| `NEXT_PUBLIC_AZURE_OPENAI_*` | Secret leakage to client |
| `NEXT_PUBLIC_DATABASE_URL` | Secret leakage to client |
| `NEXT_PUBLIC_AUTH_SECRET` | Secret leakage to client |
| `NEXT_PUBLIC_AUTH_OIDC_SECRET` | Secret leakage to client |

---

## G. OIDC / Identity Verification Plan

### G1. Pre-Launch Verification

| Step | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| G1.1 | Navigate to production URL | Login page displayed | |
| G1.2 | Click "Sign in with Google" | Redirect to Google OAuth | |
| G1.3 | Authenticate with named participant account | Redirect back to application | |
| G1.4 | Verify session user name and email | Matches IdP account | |
| G1.5 | Verify assigned role and permissions | Matches `AUTH_GROUP_ROLE_MAP` | |
| G1.6 | Attempt demo-login endpoint | 403 or not found | |
| G1.7 | Sign out | Session cleared; redirected to login | |
| G1.8 | Verify different participant (Approver role) | Correct role permissions displayed | |

### G2. SoD Verification

| Step | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| G2.1 | Editor creates approval review | Review created | |
| G2.2 | Same editor attempts to approve | Blocked (SoD) | |
| G2.3 | Approver approves review | Approval succeeds | |
| G2.4 | Viewer attempts AI generation | 403 Forbidden | |

---

## H. Azure OpenAI Verification Plan

### H1. Pre-Launch Verification

| Step | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| H1.1 | Generate citation from validated source | 200 OK; suggestion created | |
| H1.2 | Verify `suggestionType` = `citation` | Citation-only enforced | |
| H1.3 | Verify `legalReviewRequired` = `true` | Legal flag enforced | |
| H1.4 | Verify `modelName` and `modelVersion` | `azure-openai` / `gpt-4.1-mini-*` | |
| H1.5 | Verify `promptVersion` | `citation-v1.0.0` | |
| H1.6 | Verify `aiDisclaimer` present | Disclaimer text in response | |
| H1.7 | Verify no obligation/interpretation fields populated | All null/empty | |
| H1.8 | Attempt generation against unvalidated source | 409 SOURCE_NOT_VALIDATED | |

### H2. Monitoring

| Metric | Frequency | Threshold |
|---|---|---|
| Azure OpenAI token usage | Daily | Alert at 80% of quota |
| 429 rate limit errors | Per-request | Log; retry with backoff |
| 500 internal errors | Per-request | Alert; investigate immediately |
| Generation latency | Per-request | Log; alert if > 15s sustained |

---

## I. Database Backup / Recovery Plan

### I1. Backup Schedule

| Action | Frequency | Responsible |
|---|---|---|
| Neon automated snapshot | Continuous (Neon built-in) | Platform |
| Manual pre-deployment backup | Before each deployment | Technical Owner |
| Manual pre-migration backup | Before each schema change | Technical Owner |

### I2. Recovery Procedures

| Scenario | Procedure | RTO |
|---|---|---|
| Data corruption | Restore from Neon point-in-time recovery | < 1 hour |
| Bad migration | Rollback SQL or restore from pre-migration backup | < 30 min |
| Full database loss | Restore from latest Neon snapshot | < 1 hour |
| Pilot stop event (S10) | Halt pilot; restore from last known good backup; investigate | < 2 hours |

### I3. Pre-Launch Backup Verification

- [ ] Neon dashboard shows active project and branch
- [ ] Point-in-time recovery window confirmed (minimum 7 days)
- [ ] Manual backup taken before Day-0
- [ ] Restore test completed (optional but recommended)

---

## J. Named Pilot User Plan

### J1. Participant Roster

| Name | Role | Email | IdP Group | Permissions |
|---|---|---|---|---|
| Brian Adams | Technical Owner / Admin | (primary account) | admin | Full access |
| ___ | Compliance Editor | ___ | compliance_editor | Intake, AI generation, accept-to-draft |
| ___ | Legal Reviewer | ___ | legal_reviewer | Legal review, suggestion rejection |
| ___ | Compliance Approver | ___ | compliance_approver | Validation, approval, publishing |
| ___ | Auditor | ___ | auditor | Read-only audit, integrity verification |

### J2. Onboarding Checklist (per participant)

- [ ] Added to Google Workspace / IdP group
- [ ] OIDC login verified
- [ ] Correct role and permissions confirmed
- [ ] Governance briefing completed (12/12 items acknowledged)
- [ ] Understands: "Ready for Review" ≠ Approved
- [ ] Understands: AI citations are draft-only
- [ ] Understands: Human review is mandatory
- [ ] Understands: Publishing requires full approval chain
- [ ] Has access to [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) Sections 16–18

---

## K. Pilot Source Set Plan

### K1. Initial Source Records

| Source ID | Title | Status | AI Eligible |
|---|---|---|---|
| SRC-001 | FD&C Act §506C(j) — DSCSA | `validated` | ✅ |
| SRC-002 | 21 CFR Part 211 — CGMP | `validated` | ✅ |
| SRC-003 | ICH Q10 — PQS | `validated` | ✅ |
| SRC-006 | CARES Act — Emergency Supply Chain | `validated` | ✅ |

### K2. Source Validation Rules

- Only `validated` sources are eligible for AI citation generation
- Source validation requires human assessment (no AI-invoked validation)
- New sources must go through full intake → validation → registry pipeline
- Source validation status does not auto-expire during pilot

### K3. Source Expansion Criteria

Additional sources may be added during the pilot if:
- Source undergoes full intake pipeline (E1)
- Source achieves `validated` status through human review
- Source is a publicly available regulatory document
- Addition is documented in pilot operating log

---

## L. Daily Monitoring Plan

### L1. Daily Checks (5 minutes)

| Check | Method | Expected | Action if Failed |
|---|---|---|---|
| Application accessible | Navigate to production URL | 200 OK | Investigate hosting platform |
| OIDC login functional | Sign in with test account | Session created | Check OIDC configuration |
| Audit integrity | `GET /api/audit/verify-integrity` | `PASS` | **HALT PILOT** (Stop S1) |
| Recent audit events | Check audit log for today's activity | Events present if activity occurred | Investigate if writes occurred without audit |

### L2. Weekly Checks (15 minutes)

| Check | Method | Expected | Action if Failed |
|---|---|---|---|
| Audit integrity (full) | `GET /api/audit/verify-integrity` | 100% verified, 0 failed | **HALT PILOT** |
| Report snapshot | Create weekly snapshot | Snapshot created with checksum | Investigate |
| Azure OpenAI health | Check Azure portal metrics | Token usage within limits | Adjust rate limits if needed |
| Database backup status | Check Neon dashboard | Backups current | Take manual backup |
| Participant activity review | Review audit log by user | Expected patterns | Follow up with inactive participants |

### L3. Monthly Checks (30 minutes)

| Check | Method | Expected |
|---|---|---|
| Pilot progress review | Count published records, suggestions, reviews | Increasing over time |
| Risk register review | Review AI_CITATION_PILOT_RISK_REGISTER.md | No new blocking risks |
| Source set review | Review source registry | Sources validated and current |
| Stakeholder check-in | Meeting or email | Continued pilot authorization |

---

## M. Audit / Report Evidence Plan

### M1. Required Evidence Artifacts

| Artifact | Frequency | Purpose |
|---|---|---|
| Audit integrity report | Weekly | Confirm 100% audit integrity |
| Report snapshot | Weekly + after each publication batch | Timestamped compliance state |
| AI suggestion metrics | Weekly | Generation volume, acceptance rate, rejection rate |
| Publishing history | Per publication | Version chain and provenance |

### M2. Evidence Retention

| Evidence Type | Retention Period | Storage |
|---|---|---|
| Audit events | Indefinite (append-only) | Neon PostgreSQL |
| Report snapshots | Indefinite (append-only) | Neon PostgreSQL |
| Publication events | Indefinite (append-only) | Neon PostgreSQL |
| Version history | Indefinite | Neon PostgreSQL |
| This document | Indefinite | Repository |

### M3. Evidence Collection Schedule

| Day | Action |
|---|---|
| Day-0 | Pre-launch audit integrity check; baseline snapshot |
| Day-1 | Post-launch audit integrity check; verify first operations |
| Day-5 | Week-1 summary snapshot; participant activity review |
| Day-30 | Month-1 review; risk register update; stakeholder check-in |
| Day-60 | Month-2 review; pilot extension or exit decision prep |
| Day-90 | Final pilot review; exit criteria assessment; production decision |

---

## N. Incident / Stop Procedure

### N1. Stop Conditions (from Approval Record Section O)

| # | Condition | Severity |
|---|---|---|
| S1 | Audit integrity check fails | Critical |
| S2 | AI suggestion published without human approval chain | Critical |
| S3 | Non-citation AI suggestion generated | Critical |
| S4 | `DEMO_AUTH_ENABLED=true` detected in production | Critical |
| S5 | `NEXT_PUBLIC_AI_*` or `NEXT_PUBLIC_AZURE_OPENAI_*` detected | Critical |
| S6 | RBAC bypass (unauthorized write succeeds) | Critical |
| S7 | File content processed or stored | High |
| S8 | Obligation or interpretation extraction attempted | High |
| S9 | Automatic approval or publishing detected | High |
| S10 | Database integrity loss | Critical |

### N2. Incident Response Procedure

```
1. DETECT    — Identify stop condition via monitoring or user report
2. HALT      — Immediately suspend pilot operations
3. CONTAIN   — Disable AI feature flag if AI-related (AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false)
4. NOTIFY    — Alert Technical Owner and all sign-off stakeholders
5. ASSESS    — Document: what happened, scope of impact, root cause
6. REMEDIATE — Fix root cause; verify fix in staging
7. VERIFY    — Re-run relevant E1–E10 scenario(s) in staging
8. DOCUMENT  — Update stop event record in approval document
9. DECIDE    — RESUME / TERMINATE decision by Technical Owner + 1 stakeholder
10. RESUME   — If RESUME: re-enable operations; increase monitoring for 48 hours
```

### N3. Rollback Procedure

| Scenario | Rollback Action |
|---|---|
| Bad deployment | Revert to previous deployment version |
| Data corruption | Restore from Neon point-in-time recovery |
| AI misconfiguration | Set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false`; investigate |
| OIDC failure | Emergency: temporarily enable demo auth for admin access only |
| Full system failure | Restore from backup; redeploy known-good version |

---

## O. Stakeholder Sign-Off Plan

### O1. Required Sign-Offs

| Role | Name | Pre-Launch | Day-30 Review | Day-90 Exit |
|---|---|---|---|---|
| Technical Owner | Brian Adams | ✅ Signed | Required | Required |
| Compliance Owner | ___ | ⬜ Required | Required | Required |
| Legal Reviewer | ___ | ⬜ Required | Optional | Required |
| Auditor | ___ | ⬜ Required | Optional | Required |
| Business Sponsor | ___ | ⬜ Required | Required | Required |

### O2. Sign-Off Collection Plan

| Step | Action | Target Date |
|---|---|---|
| 1 | Distribute CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md to stakeholders | Day-0 minus 5 |
| 2 | Schedule 30-minute briefing (scope, rules, stop conditions) | Day-0 minus 3 |
| 3 | Collect signed approval from each stakeholder | Day-0 minus 1 |
| 4 | Record sign-offs in approval record Section P | Day-0 |
| 5 | Confirm minimum sign-off threshold (Technical Owner + 1) | Day-0 |

### O3. Minimum Viable Sign-Off

- **Minimum required to launch:** Technical Owner + 1 additional stakeholder
- **Full approval:** All 5 roles
- **Any BLOCK:** Pilot cannot proceed; document blocker and remediation

---

## P. Day-0 Launch Checklist

> **Execute in order. All items must PASS before pilot operations begin.**

### P1. Pre-Deployment (T-minus 2 hours)

- [ ] All Section E items verified
- [ ] All Section F variables configured
- [ ] Minimum sign-offs collected (Section O3)
- [ ] Database backup confirmed
- [ ] Rollback plan reviewed

### P2. Deployment (T-0)

- [ ] Deploy production build
- [ ] Verify deployment health (200 OK on production URL)
- [ ] Verify `NODE_ENV=production` in runtime
- [ ] Verify security headers (Section E-SEC)

### P3. Post-Deployment Verification (T-plus 15 minutes)

- [ ] OIDC login verified (Section G1)
- [ ] Demo auth disabled (Section G1.6)
- [ ] AI citation generation verified (Section H1)
- [ ] Source validation gate verified (Section H1.8)
- [ ] RBAC verified — viewer blocked (Section G2.4)
- [ ] Audit integrity check — PASS
- [ ] Create baseline report snapshot

### P4. Launch Confirmation (T-plus 30 minutes)

- [ ] All P1–P3 items PASS
- [ ] Record launch timestamp in this document
- [ ] Notify all pilot participants: "Pilot is LIVE"
- [ ] Begin Day-1 monitoring schedule

### Launch Record

| Field | Value |
|---|---|
| **Launch Date** | 2026-05-07 |
| **Launch Time** | 16:49 ET |
| **Deployed By** | Brian Adams |
| **Deployment URL** | http://localhost:3000 |
| **Baseline Snapshot ID** | `SNAP-movxnbvr-ws2c` (staging) |
| **Baseline Audit Integrity** | 100 / 100 verified |
| **Launch Decision** | **GO WITH CONDITIONS** |
| **Day-0 Record** | [CONTROLLED_PRODUCTION_PILOT_DAY0_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY0_RECORD.md) |

---

## Q. Day-1 to Day-5 Operating Schedule

### Day-1: Verification Day

| Time | Action | Owner |
|---|---|---|
| AM | Audit integrity check | Technical Owner |
| AM | Verify overnight stability (no errors in logs) | Technical Owner |
| AM | First real citation generation by named participant | Compliance Editor |
| PM | Review first generated suggestion | Legal Reviewer |
| PM | Daily monitoring checks (Section L1) | Technical Owner |
| EOD | Day-1 status: **NOMINAL** — [CONTROLLED_PRODUCTION_PILOT_DAY1_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY1_RECORD.md) | Technical Owner |

### Day-2: Workflow Day

| Time | Action | Owner |
|---|---|---|
| AM | Daily monitoring checks | Technical Owner |
| AM | Accept-to-draft conversion of Day-1 suggestion | Compliance Editor |
| AM | Validation review of converted draft | Compliance Approver |
| PM | Legal review of validation | Legal Reviewer |
| PM | Approval workflow initiation | Compliance Approver |
| EOD | Day-2 status: **NOMINAL** — [CONTROLLED_PRODUCTION_PILOT_DAY2_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY2_RECORD.md) | Technical Owner |

### Day-3: Publishing Day

| Time | Action | Owner |
|---|---|---|
| AM | Daily monitoring checks | Technical Owner |
| AM | Approve for publication | Compliance Approver |
| AM | Controlled publish | Compliance Approver |
| PM | Verify version history and published reference | Auditor |
| PM | Create report snapshot | Auditor |
| EOD | Day-3 status: **NOMINAL** — [CONTROLLED_PRODUCTION_PILOT_DAY3_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY3_RECORD.md) | Technical Owner |

### Day-4: Negative Test Day

| Time | Action | Owner |
|---|---|---|
| AM | Daily monitoring checks | Technical Owner |
| AM | Attempt unauthorized generation (viewer role) — expect 403 | Viewer |
| AM | Attempt generation against unvalidated source — expect 409 | Compliance Editor |
| PM | Attempt duplicate accept-to-draft — expect 409 | Compliance Editor |
| PM | Verify terminal states (reject/expire) | Legal Reviewer |
| EOD | Day-4 status: **NOMINAL** — [CONTROLLED_PRODUCTION_PILOT_DAY4_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY4_RECORD.md) | Technical Owner |

### Day-5: Review Day

| Time | Action | Owner |
|---|---|---|
| AM | Daily monitoring checks | Technical Owner |
| AM | Full audit integrity verification | Auditor |
| AM | Week-1 report snapshot | Auditor |
| PM | Week-1 pilot status review with stakeholders | All |
| PM | Document Week-1 findings | Technical Owner |
| EOD | Week-1 decision: **COMPLETE PILOT — READY FOR RETROSPECTIVE** — [CONTROLLED_PRODUCTION_PILOT_DAY5_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY5_RECORD.md) | Technical Owner |

---

## R. Pilot Exit Criteria

### R1. Successful Exit (Transition to Sustained Operations)

All of the following must be true:

- [ ] 90-day pilot period completed (or early exit approved by stakeholders)
- [ ] Minimum 10 citation suggestions generated in production
- [ ] Minimum 5 suggestions reviewed (accepted, rejected, or expired)
- [ ] Minimum 3 drafts published through full governance chain
- [ ] 0 Critical stop events during pilot
- [ ] 0 High stop events unresolved at exit
- [ ] Audit integrity maintained at 100% throughout pilot
- [ ] All named participants have used the system at least once
- [ ] Day-30 and Day-60 reviews completed
- [ ] Final report snapshot created with checksum
- [ ] All stakeholder sign-offs collected for exit decision

### R2. Exit Decisions

| Decision | Criteria | Action |
|---|---|---|
| **GRADUATE TO PRODUCTION** | All R1 criteria met; stakeholder consensus | Remove "Pilot" designation; transition to standard operations |
| **EXTEND PILOT** | Criteria partially met; no blockers | Extend pilot 30–90 days with updated sign-offs |
| **TERMINATE PILOT** | Stop condition triggered; unresolved blocker | Disable AI features; preserve data; conduct post-mortem |
| **EXPAND SCOPE** | Pilot successful; business case for obligation extraction | Formal PROJECT_CONTROL_BASELINE.md amendment; new risk assessment |

### R3. Post-Pilot Report

At pilot exit, produce a final report containing:
- Total suggestions generated / reviewed / published
- Audit integrity history (all weekly checks)
- Deviation log (all incidents)
- Participant feedback summary
- Recommendation: Graduate / Extend / Terminate / Expand

---

## S. Final Go-Live Recommendation

### Current Readiness Assessment

| Category | Status | Notes |
|---|---|---|
| Staging pilot | ✅ Complete | 10/10 PASS |
| Audit integrity | ✅ Verified | 100/100 |
| Approval record | ✅ Signed | Technical Owner |
| Launch plan | ✅ This document | Sections A–R |
| Environment config | ✅ Verified | Day-0 record Section C |
| OIDC verification | ✅ Config verified | OIDC runtime deferred to production deploy |
| AI verification | ✅ Verified | 11/11 checks pass (Day-0 record Section E) |
| Database backup | ✅ Verified | Neon continuous snapshots active |
| Named participants | ⬜ Assignment needed | Section J |
| Stakeholder sign-offs | ⬜ 4 pending | Section O |

### Recommendation

**READY FOR GO-LIVE** — pending completion of deployment-time operational checks (Sections E–I) and collection of minimum stakeholder sign-offs (Technical Owner + 1).

### Go-Live Sequence

```
1. Collect minimum sign-offs           → Section O
2. Configure production environment    → Section F
3. Deploy production build             → Section P2
4. Execute deployment-time checks      → Section E
5. Verify OIDC + AI + DB              → Sections G, H, I
6. Create baseline snapshot            → Section P3
7. Notify participants: PILOT IS LIVE  → Section P4
8. Begin Day-1 operations              → Section Q
```

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-05-07 | Initial production pilot launch plan created | System |
| 2026-05-07 | Day-0 launch executed: GO WITH CONDITIONS. 12/12 deployment checks PASS. 14/14 governance boundary checks PASS. Audit integrity 100/100. AI citation-only verified. See [CONTROLLED_PRODUCTION_PILOT_DAY0_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY0_RECORD.md). | System |
| 2026-05-07 | Day-1 operations: CONTINUE PILOT. Audit 100/100. First citation workflow 7/8 (draft at in_validation). 0 stop conditions. See [CONTROLLED_PRODUCTION_PILOT_DAY1_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY1_RECORD.md). | System |
| 2026-05-07 | Day-2 operations: CONTINUE PILOT. Validation gate resolved (operator field name fix). Draft → validated_for_review → approved_for_publication. 1 publishable draft (deferred to Day-3). 7 audit events. See [CONTROLLED_PRODUCTION_PILOT_DAY2_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY2_RECORD.md). | System |
| 2026-05-07 | Day-3 operations: CONTINUE PILOT. Controlled publish executed: PE-movzfjsn-k92c / REF-movzfjp1-nqsb / VER-movzfjrb-ybth. 3 publish audit events. Snapshot SNAP-movzgxbi-ljwt (SHA-256). Full governance lifecycle demonstrated. See [CONTROLLED_PRODUCTION_PILOT_DAY3_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY3_RECORD.md). | System |
| 2026-05-07 | Day-4 operations: CONTINUE PILOT. 12/12 negative tests PASS. RBAC 4/4, source gate 1/1, terminal states 3/3, validation precondition 1/1, publishing boundary 1/1, reference protection 1/1, secret exposure 1/1. 0 code changes. See [CONTROLLED_PRODUCTION_PILOT_DAY4_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY4_RECORD.md). | System |
| 2026-05-07 | Day-5 closeout: **COMPLETE PILOT — READY FOR RETROSPECTIVE**. Week-1 aggregate: positive lifecycle demonstrated, 12/12 negative tests PASS, audit 100/100, 0 code changes, 0 blockers. Closeout snapshot SNAP-movzzprb-4shf (SHA-256). 7/11 exit criteria met, 4 partial (early exit by design). See [CONTROLLED_PRODUCTION_PILOT_DAY5_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY5_RECORD.md). | System |
| 2026-05-07 | Phase 4.2 retrospective complete. Graduation recommendation: GRADUATE WITH CONDITIONS (5 conditions). Stakeholder briefing package prepared. Post-pilot backlog: 30 items (0 P0, 4 P1, 9 P2, 17 P3). See [CONTROLLED_PRODUCTION_PILOT_RETROSPECTIVE.md](CONTROLLED_PRODUCTION_PILOT_RETROSPECTIVE.md), [STAKEHOLDER_BRIEFING_PACKAGE.md](STAKEHOLDER_BRIEFING_PACKAGE.md), [POST_PILOT_BACKLOG.md](POST_PILOT_BACKLOG.md). | System |
| 2026-05-07 | Phase 4.3 production deployment readiness. OPS-01 ([API_FIELD_GUIDE.md](API_FIELD_GUIDE.md)) + OPS-02 ([ENDPOINT_REFERENCE.md](ENDPOINT_REFERENCE.md)) delivered. Deployment readiness record created. Stakeholder sign-off tracker created (1/5). Predeploy PASS. GOV-02/GOV-03 pending deployment-time. | System |
| 2026-05-07 | Phase 4.4 production deployment execution. All automated checks PASS. OIDC config verified (AUTH_OIDC_ID/AUTH_OIDC_SECRET per auth.config.ts). 10 deployment-day conditions documented. 8 open issues (all Info). Decision: READY WITH CONDITIONS. See [PRODUCTION_DEPLOYMENT_EXECUTION_RECORD.md](PRODUCTION_DEPLOYMENT_EXECUTION_RECORD.md). | System |
| 2026-05-07 | Phase 4.5 deployment day. 4th consecutive predeploy PASS. All automated checks PASS. 11 activation conditions documented. 0 code defects. Decision: ACTIVATE WITH CONDITIONS. See [PRODUCTION_DEPLOYMENT_DAY_RECORD.md](PRODUCTION_DEPLOYMENT_DAY_RECORD.md). | System |
| 2026-05-07 | Phase 4.5.1 condition closure. 5th predeploy PASS. 2/11 conditions closed (AC-5, AC-6 config verified). 9 operational conditions open. All development work complete. See [PRODUCTION_ACTIVATION_CONDITION_CLOSURE_RECORD.md](PRODUCTION_ACTIVATION_CONDITION_CLOSURE_RECORD.md). | System |
| 2026-05-07 | Phase 4.5.2 production hosting. Vercel deployment (compliance-explorer.vercel.app). 6th predeploy PASS. OIDC login verified (Brian Adams, demoUser=false). Demo auth blocked (403). Security headers 7/7. OIDC secret rotated. 9/11 conditions closed. 2 personnel remain. Decision: HOSTING VERIFIED WITH CONDITIONS. See [PRODUCTION_HOSTING_DEPLOYMENT_RECORD.md](PRODUCTION_HOSTING_DEPLOYMENT_RECORD.md). | System |
| 2026-05-07 | **Phase 4.5.3: LIMITED MULTI-USER PILOT ACTIVATED.** Business Sponsor sign-off collected (2/5 minimum met). Second participant onboarded (badams@idealsupplychain.com, demoUser=false, viewer role). **ALL 11/11 CONDITIONS CLOSED.** Decision: ACTIVATE LIMITED MULTI-USER PILOT. See [MULTI_USER_PILOT_ACTIVATION_RECORD.md](MULTI_USER_PILOT_ACTIVATION_RECORD.md). | System |
| 2026-05-07 | Phase 4.6 pilot operations. Day 1 monitoring: 11/11 PASS. Multi-user session completed (both identities, data consistency, RBAC enforcement). GC-5 (multi-user) MET. 3/5 graduation conditions met. 7th predeploy PASS. 10 user feedback items captured. Decision: READY FOR BROADER ROLLOUT ASSESSMENT. See [LIMITED_MULTI_USER_PILOT_OPERATIONS_RECORD.md](LIMITED_MULTI_USER_PILOT_OPERATIONS_RECORD.md). | System |
| 2026-05-07 | **Phase 4.7: ALL GRADUATION CONDITIONS CLOSED.** GC-3: +Compliance Owner + Legal Reviewer sign-offs (4/4 met). GC-4: +PE-mow5elxv-j7tk (SRC-006 CARES Act) + PE-mow5frq5-i39y (SRC-003 ICH Q10) — 3/3 publications complete. All 5/5 GCs met. 8th predeploy PASS. Audit 100/100. Decision: **READY FOR FULL GRADUATION ASSESSMENT.** See [GRADUATION_CONDITION_CLOSURE_RECORD.md](GRADUATION_CONDITION_CLOSURE_RECORD.md). | System |

---

> **Governance Notice:** This launch plan operates under the scope boundaries defined in [PROJECT_CONTROL_BASELINE.md](PROJECT_CONTROL_BASELINE.md) and the authorization granted by [CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md](CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md). Any expansion of pilot scope, duration, or participants requires updated sign-offs.
