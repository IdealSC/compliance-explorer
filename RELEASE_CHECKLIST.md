# Release Checklist — Compliance Operating Map

> Complete this checklist before every production deployment.
> All items must pass or have documented exceptions.

---

## Pre-Release Gate

### Build & Validation

- [ ] `npm run build` — 0 TypeScript errors
- [ ] `npm run typecheck` — 0 type errors
- [ ] `npm run smoke-test` — all checks pass
- [ ] `npm run predeploy` — all checks pass
- [ ] Route count verified in build output (79+ routes)

### Environment Configuration

- [ ] `DATA_SOURCE=database`
- [ ] `NEXT_PUBLIC_DATA_SOURCE=database`
- [ ] `DEMO_AUTH_ENABLED=false`
- [ ] `AUTH_SECRET` is set (unique per environment)
- [ ] `AUTH_URL` matches deployment domain
- [ ] `AUTH_OIDC_ISSUER` is set
- [ ] `AUTH_OIDC_ID` is set
- [ ] `AUTH_OIDC_SECRET` is set
- [ ] `DATABASE_URL` is set and reachable
- [ ] No `NEXT_PUBLIC_DATABASE_URL` exists
- [ ] No `NEXT_PUBLIC_AUTH_SECRET` exists
- [ ] No `NEXT_PUBLIC_AUTH_OIDC_SECRET` exists
- [ ] No `NEXT_PUBLIC_AI_*` variables exist
- [ ] No `NEXT_PUBLIC_AZURE_OPENAI_*` variables exist

### Identity & Access

- [ ] OIDC login verified (sign in / sign out)
- [ ] OIDC callback URL registered in IdP
- [ ] Group-to-role mapping tested
- [ ] Demo auth confirmed disabled
- [ ] Viewer role — read-only verified
- [ ] Editor role — create/edit verified
- [ ] Approver role — review/publish verified
- [ ] Auditor role — audit log access verified
- [ ] Admin role — system access verified
- [ ] Separation of duties — editors cannot approve own drafts

### Database & Migrations

- [ ] Database backup verified before migration
- [ ] Migrations generated: `npm run db:generate`
- [ ] Migration SQL reviewed manually
- [ ] Migrations applied: `npm run db:migrate`
- [ ] No `db:reset` or `db:seed` on production
- [ ] Rollback SQL prepared (or backup restoration documented)

### Governance & Compliance Controls

- [ ] Controlled publishing: draft → review → publish workflow verified
- [ ] Active reference data is NOT directly editable
- [ ] Prior versions superseded (not deleted) on publish
- [ ] Separation of duties enforced across roles
- [ ] Source validation workflow functional
- [ ] Audit events written for all state transitions

### Audit Trail

- [ ] Audit log write verified (create, update, approve, publish actions)
- [ ] Audit checksums present (SHA-256)
- [ ] Audit events immutable (cannot edit or delete)
- [ ] Audit attribution includes user identity

### Report Snapshots & Export

- [ ] Report snapshot created with ID and checksum
- [ ] Snapshot history displays records
- [ ] CSV export includes snapshot metadata
- [ ] JSON export includes snapshot metadata
- [ ] Export requires `reports.export` permission
- [ ] Print exports include provenance

### Data Integrity

- [ ] Source validation lifecycle verified
- [ ] Version history shows publication records
- [ ] As-of trace query returns historical state
- [ ] Data quality dashboard displays active issues

### Security

- [ ] Security headers present (check browser DevTools):
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
  - [ ] `Permissions-Policy` present
- [ ] Error responses do not contain stack traces
- [ ] API error messages are generic (no internal details)
- [ ] `DATABASE_URL` not visible in client bundle
- [ ] No environment secrets in browser JavaScript

### Infrastructure

- [ ] Database backup confirmed and restorable
- [ ] Rollback plan documented
- [ ] Monitoring/alerting configured (if applicable)
- [ ] Logging operational

### Source File Metadata (Phase 3.3)

- [ ] `STORAGE_PROVIDER` set to expected value (`none` or configured provider)
- [ ] No `NEXT_PUBLIC_STORAGE_*` variables in environment
- [ ] `source_files` table migration applied (if database mode)
- [ ] Source file metadata API responds (GET `/api/sources/registry/[id]/files`)
- [ ] File metadata lifecycle (register → archive) tested
- [ ] Parent record validation prevents cross-record file access
- [ ] PATCH protected field rejection verified

### AI Provider Integration (Phase 3.8)

- [ ] `AI_PROVIDER` set to expected value (`none` or `azure_openai`)
- [ ] `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` set appropriately
- [ ] If `azure_openai`: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT` configured
- [ ] If `none`: AI generation endpoint returns 503 with `FEATURE_DISABLED`
- [ ] No `NEXT_PUBLIC_AI_*` or `NEXT_PUBLIC_AZURE_OPENAI_*` variables in environment
- [ ] AI generation creates audit trail (requested, per-citation, completed/failed)
- [ ] Generated citations are draft-only with `suggestionType: 'citation'`
- [ ] Generated citations do not populate obligation, interpretation, or mapping fields
- [ ] Accept-to-draft remains blocked at Zod schema level
- [ ] `legalReviewRequired: true` on all generated citations
- [ ] Only Compliance Editor (and Admin) can generate citations
- [ ] AI generation requires database mode (returns 503 in JSON mode)

---

### AI Citation → Draft Conversion (Phase 3.9)

- [ ] Eligible AI suggestion converts to DraftRegulatoryChange (as Compliance Editor)
- [ ] Draft created at draft/staging status only — not active reference data
- [ ] Provenance stamp `[AI Citation Suggestion: ...]` present in draft `changeReason`
- [ ] AI-linked badge visible on `/draft-mapping` for converted drafts
- [ ] Duplicate conversion blocked — re-conversion returns 409
- [ ] 8-gate eligibility enforced server-side
- [ ] Only citation-type suggestions eligible (non-citation types blocked at schema level)
- [ ] Conversion audit event created with suggestion ID linkage
- [ ] Converted draft requires standard review → approval → publishing pipeline

### Draft Validation Workbench (Phase 3.10)

- [ ] Validation review created for AI-linked draft changes
- [ ] Source support assessment updates stored correctly
- [ ] Citation accuracy assessment updates stored correctly
- [ ] Legal review completion requires `VALIDATION_LEGAL_REVIEW` permission
- [ ] "Ready for Review" status requires 5-gate preconditions
- [ ] "Ready for Review" badge displayed on `/draft-mapping` and `/review-approval`
- [ ] "Ready for Review" ≠ approved (governance warning displayed)
- [ ] Validation does NOT call AI providers
- [ ] Validation does NOT auto-approve or auto-publish
- [ ] Single-field-per-PATCH enforced on validation review updates
- [ ] Audit events created for all validation status changes

### Pilot Readiness (Phase 3.11)

- [x] AI_CITATION_GOVERNANCE_TRACEABILITY.md reviewed and complete
- [x] AI_CITATION_PILOT_READINESS_CHECKLIST.md reviewed and complete
- [x] AI_CITATION_PILOT_RISK_REGISTER.md reviewed — no blocking risks

### Production Pilot Approval (Phase 3.12)

- [x] E1–E10 staging pilot executed — 10/10 PASS
- [x] Audit integrity verified — 100/100 events, 0 failed
- [x] Report snapshot created with SHA-256 checksum
- [x] CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md created and signed (Technical Owner)
- [x] PILOT_CONDITIONAL_APPROVAL_RECORD.md — all conditions (C1–C5) satisfied
- [ ] `DEMO_AUTH_ENABLED=false` confirmed in production environment
- [ ] OIDC login verified end-to-end in production
- [ ] Named participants assigned and verified in production IdP
- [ ] `npm run predeploy` passes in production environment
- [ ] Database backup verified before production pilot

### Production Pilot Launch Planning (Phase 4.0)

- [x] CONTROLLED_PRODUCTION_PILOT_LAUNCH_PLAN.md created (Sections A–S)
- [x] Day-0 launch checklist executed — GO WITH CONDITIONS (CONTROLLED_PRODUCTION_PILOT_DAY0_RECORD.md)
- [x] Deployment-time verification checklist passed (12/12 PASS)
- [x] OIDC identity verification — config verified; runtime deferred to production deploy
- [x] Azure OpenAI verification completed (11/11 PASS)
- [x] Database backup/recovery plan verified (Neon continuous snapshots)
- [ ] Named pilot users onboarded (Section J)
- [x] Day-1 to Day-5 operating schedule **COMPLETE** — Day-0 GO, Day-1 NOMINAL, Day-2 NOMINAL, Day-3 NOMINAL (publish), Day-4 NOMINAL (12/12 negative), Day-5 COMPLETE PILOT (CONTROLLED_PRODUCTION_PILOT_DAY5_RECORD.md)

## Sign-Off

| Area | Status | Reviewer | Date |
|---|---|---|---|
| Build & Validation | | | |
| Environment | | | |
| Identity & Access | | | |
| Database & Migrations | | | |
| Governance Controls | | | |
| Audit Trail | | | |
| Reports & Export | | | |
| Data Integrity | | | |
| Security | | | |
| Source File Metadata | | | |
| AI Provider Integration | | | |
| AI Citation → Draft Conversion | | | |
| Draft Validation Workbench | | | |
| Pilot Readiness | | | |
| Production Pilot Approval | | | |
| Production Pilot Launch | | | |
| Infrastructure | | | |

**Release Decision:** ___ APPROVE / BLOCK ___

**Release Version:** ___

**Production Pilot Approval Reference:** [CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md](CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md)

**Production Pilot Launch Plan Reference:** [CONTROLLED_PRODUCTION_PILOT_LAUNCH_PLAN.md](CONTROLLED_PRODUCTION_PILOT_LAUNCH_PLAN.md)

**Notes:**

**Phase 4.2 Retrospective References:**
- [CONTROLLED_PRODUCTION_PILOT_RETROSPECTIVE.md](CONTROLLED_PRODUCTION_PILOT_RETROSPECTIVE.md) — Formal pilot retrospective
- [STAKEHOLDER_BRIEFING_PACKAGE.md](STAKEHOLDER_BRIEFING_PACKAGE.md) — Stakeholder sign-off package
- [POST_PILOT_BACKLOG.md](POST_PILOT_BACKLOG.md) — 30 classified findings (0 P0, 4 P1, 9 P2, 17 P3)
- Graduation recommendation: **GRADUATE WITH CONDITIONS** (5 conditions)
- Pre-rollout required items: GOV-02 (demo auth), GOV-03 (OIDC), OPS-01 (field guide), OPS-02 (endpoint docs)

**Phase 4.3 Deployment Readiness References:**
- [PRODUCTION_DEPLOYMENT_READINESS_RECORD.md](PRODUCTION_DEPLOYMENT_READINESS_RECORD.md) — Deployment readiness + checklist
- [API_FIELD_GUIDE.md](API_FIELD_GUIDE.md) — OPS-01 ✅ COMPLETE
- [ENDPOINT_REFERENCE.md](ENDPOINT_REFERENCE.md) — OPS-02 ✅ COMPLETE
- [STAKEHOLDER_SIGNOFF_TRACKER.md](STAKEHOLDER_SIGNOFF_TRACKER.md) — Sign-off collection tracker (1/5 signed)
- Pre-rollout documentation: **2/2 complete**
- Deployment-time items: **2 pending** (GOV-02, GOV-03)
- Predeploy: **PASS**

**Phase 4.4 Deployment Execution References:**
- [PRODUCTION_DEPLOYMENT_EXECUTION_RECORD.md](PRODUCTION_DEPLOYMENT_EXECUTION_RECORD.md) — Full deployment verification (16 sections)
- Environment vars: **14/16 verified** (2 deploy-time: AUTH_URL, DEMO_AUTH_ENABLED)
- Secret exposure: **0/8 PASS**
- Audit integrity: **100/100 PASS**
- OIDC config: **Verified** (AUTH_OIDC_ID/AUTH_OIDC_SECRET confirmed per auth.config.ts)
- Deployment-day conditions: **10 documented**
- Decision: **READY WITH CONDITIONS**

**Phase 4.5 Deployment Day References:**
- [PRODUCTION_DEPLOYMENT_DAY_RECORD.md](PRODUCTION_DEPLOYMENT_DAY_RECORD.md) — Deployment day execution (16 sections)
- Predeploy: **4th consecutive PASS** (4.0, 4.3, 4.4, 4.5)
- Audit integrity: **100/100 unbroken since Phase 3.12**
- Activation conditions: **11 documented** (7 infrastructure, 2 config, 2 personnel)
- Decision: **ACTIVATE WITH CONDITIONS**

**Phase 4.5.1 Condition Closure References:**
- [PRODUCTION_ACTIVATION_CONDITION_CLOSURE_RECORD.md](PRODUCTION_ACTIVATION_CONDITION_CLOSURE_RECORD.md) — Condition closure assessment (13 sections)
- Predeploy: **5th consecutive PASS** (4.0, 4.3, 4.4, 4.5, 4.5.1)
- Conditions closed: **2/11** (AC-5 DEMO_AUTH config, AC-6 AUTH_URL config)
- Conditions open: **9** (all operational — 4 infrastructure, 3 verification, 2 personnel)
- All development work: **COMPLETE**
- Decision: **ACTIVATE WITH CONDITIONS** (unchanged — awaiting infrastructure)

**Phase 4.5.2 Production Hosting Deployment:**
- [PRODUCTION_HOSTING_DEPLOYMENT_RECORD.md](PRODUCTION_HOSTING_DEPLOYMENT_RECORD.md) — Hosting deployment record (13 sections)
- Hosting platform: **Vercel** (idealsc account)
- Production URL: **https://compliance-explorer.vercel.app**
- Predeploy: **6th consecutive PASS** (4.0, 4.3, 4.4, 4.5, 4.5.1, 4.5.2)
- OIDC login: **VERIFIED** (Brian Adams, demoUser=false)
- Demo auth: **DISABLED** (HTTP 403)
- Security headers: **7/7 verified** (HSTS preload, XFO DENY, X-CTO nosniff, etc.)
- Env vars: **15/15 SET** on Vercel production
- Secret exposure: **0/7 leaks**
- Conditions closed: **9/11**
- Conditions open: **2/11** (personnel only — 1 sign-off + 1 participant)
- OIDC secret: **Rotated** (Google Console no longer shows existing secrets)
- Code changes: **0**
- Decision: **HOSTING VERIFIED WITH CONDITIONS**

**Phase 4.5.3 Multi-User Pilot Activation:**
- [MULTI_USER_PILOT_ACTIVATION_RECORD.md](MULTI_USER_PILOT_ACTIVATION_RECORD.md) — Activation record (10 sections)
- Stakeholder sign-offs: **2/5** (Technical Owner + Business Sponsor — minimum met)
- Participant 1: keukajeep@gmail.com — **OIDC verified, demoUser=false**
- Participant 2: badams@idealsupplychain.com — **OIDC verified, demoUser=false**
- Multi-user: **2 distinct OIDC identities, 2 distinct user IDs**
- Role assignment: **viewer** (least privilege, correct fallback)
- Demo role switching: **UNAVAILABLE** (DEMO_AUTH=false)
- Governance briefing: **COMPLETED** (8 points acknowledged)
- Conditions closed: **11/11** ✅
- Code changes: **0**
- Decision: **ACTIVATE LIMITED MULTI-USER PILOT** ✅

**Phase 4.6 Multi-User Pilot Operations:**
- [LIMITED_MULTI_USER_PILOT_OPERATIONS_RECORD.md](LIMITED_MULTI_USER_PILOT_OPERATIONS_RECORD.md) — Operations record (13 sections)
- Day 1 monitoring: **11/11 checks PASS**
- Multi-user session: **COMPLETED** (2 identities, data consistency, RBAC enforcement)
- Predeploy: **7th consecutive PASS**
- Audit integrity: **100/100** (maintained since Phase 3.12)
- Graduation conditions: **3/5 MET** (GC-1 ✅, GC-2 ✅, GC-3 ⚠ 2/4, GC-4 ⚠ 1/3, GC-5 ✅)
- User feedback: **10 items** (7 positive, 3 neutral, 0 needs work)
- Stop conditions: **0 triggered**
- Code changes: **0**
- Decision: **READY FOR BROADER ROLLOUT ASSESSMENT**

### Phase 4.7: Graduation Condition Closure ✅

- [x] Sign-off closure (GC-3)
  - [x] Compliance Owner sign-off collected (Brian Adams, dual-role)
  - [x] Legal Reviewer sign-off collected (Brian Adams, dual-role)
  - [x] 4/4 sign-offs: Technical Owner + Business Sponsor + Compliance Owner + Legal Reviewer
- [x] Publication closure (GC-4)
  - [x] Publication 2: PE-mow5elxv-j7tk (SRC-006 CARES Act) — full governance chain
  - [x] Publication 3: PE-mow5frq5-i39y (SRC-003 ICH Q10) — full governance chain
  - [x] 3/3 publications complete with 7/7 validation gates, SoD enforcement, controlled publishing
- [x] Governance verification
  - [x] Audit integrity: **100/100** (still unbroken)
  - [x] 8th consecutive predeploy PASS
  - [x] 0 code changes
  - [x] 0 stop conditions triggered
  - [x] 0 security issues
- [x] All graduation conditions: **5/5 MET** (GC-1 ✅, GC-2 ✅, GC-3 ✅ 4/4, GC-4 ✅ 3/3, GC-5 ✅)
- [x] GRADUATION_CONDITION_CLOSURE_RECORD.md created
- [x] All governance records updated
- Decision: **READY FOR FULL GRADUATION ASSESSMENT** ✅
