# Production QA Checklist — Compliance Operating Map

> **Phase 2.9 / 3.1 / 3.2 / 3.8 — QA validation before production deployment.**
>
> Each section should be tested in order. Mark items ✅ or ❌ as you go.
> See also: [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for the release gate checklist.

---

## A. Build & Environment

- [ ] `npm install` — dependencies install without errors
- [ ] Environment variables validated (see `.env.example`)
  - [ ] `DATA_SOURCE` is `json` or `database`
  - [ ] `NEXT_PUBLIC_DATA_SOURCE` matches `DATA_SOURCE`
  - [ ] `DATABASE_URL` set when `DATA_SOURCE=database`
  - [ ] `DEMO_AUTH_ENABLED` set appropriately
  - [ ] No `NEXT_PUBLIC_DATABASE_URL` exists
  - [ ] No `NEXT_PUBLIC_AI_*` or `NEXT_PUBLIC_AZURE_OPENAI_*` variables exist
  - [ ] AI configuration validated (see `.env.example` — AI Provider section)
    - [ ] `AI_PROVIDER` is `none` or `azure_openai`
    - [ ] `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` is `false` or `true`
    - [ ] If `AI_PROVIDER=azure_openai`: Azure credentials are set
    - [ ] If `AI_PROVIDER=none`: AI generation endpoints return 503
- [ ] `npm run build` — 0 TypeScript errors
- [ ] `npm run typecheck` — 0 type errors
- [ ] `npm run smoke-test` — all checks pass (with env vars configured)
- [ ] `npm run predeploy` — all gates pass
- [ ] `npm start` — app starts and serves on configured port
- [ ] Route count: 56+ routes (verify in build output)
- [ ] No console errors on startup (warnings acceptable)
- [ ] No `NEXT_PUBLIC_DATABASE_URL`, `NEXT_PUBLIC_AUTH_SECRET`, or `NEXT_PUBLIC_AUTH_OIDC_SECRET` set

---

## B. JSON Mode (DATA_SOURCE=json)

- [ ] App loads without database connection
- [ ] Home page renders with dashboard data
- [ ] No write operations persist
- [ ] Sample data banners visible on governance pages
- [ ] API write endpoints return 503 with `JSON_MODE` code
- [ ] No database connection errors in logs

---

## C. Database Mode (DATA_SOURCE=database)

- [ ] Database connects successfully
- [ ] `npm run db:seed` completes without errors
- [ ] Home page loads with seeded data
- [ ] Operational pages load from database:
  - [ ] `/action-center`
  - [ ] `/controls-evidence`
  - [ ] `/risks`
- [ ] Draft creation works:
  - [ ] `/draft-mapping` — create a draft change
  - [ ] Draft appears in draft workspace
- [ ] Review workflow works:
  - [ ] `/review-approval` — submit for review
  - [ ] Review decision (approve/reject/revise)
- [ ] Controlled publishing works:
  - [ ] Publish approved draft
  - [ ] New version created in version history
  - [ ] Prior version superseded
  - [ ] Audit events written
- [ ] Version history updates:
  - [ ] `/version-history` shows publication records
  - [ ] Publication provenance displayed
- [ ] As-of trace works:
  - [ ] `/as-of-trace` — query historical state
- [ ] Source validation works:
  - [ ] `/source-registry` — create source record
  - [ ] Validate source action
  - [ ] Reject source action
- [ ] Report snapshot works:
  - [ ] `/reports` — generate report
  - [ ] Snapshot created with ID and checksum
  - [ ] Snapshot history tab shows record
  - [ ] CSV export includes snapshot metadata
  - [ ] JSON export includes snapshot metadata

---

## D. RBAC (Role-Based Access Control)

Test with each demo persona by switching roles:

### Viewer
- [ ] Can view all read-only pages
- [ ] Cannot create drafts
- [ ] Cannot approve reviews
- [ ] Cannot export reports (if reports.export is restricted)

### Business Owner
- [ ] Can edit operational data (action center, controls, evidence)
- [ ] Cannot create regulatory drafts
- [ ] Cannot approve reviews

### Compliance Editor
- [ ] Can create and edit drafts
- [ ] Can manage source registry
- [ ] Cannot approve own drafts (SoD)

### Compliance Approver
- [ ] Can review and approve/reject drafts
- [ ] Can publish approved changes
- [ ] Cannot edit drafts (SoD)

### Auditor
- [ ] Can view audit log
- [ ] Can view reports
- [ ] Cannot edit any data
- [ ] Cannot approve reviews

### Admin
- [ ] Has system configuration access
- [ ] Cannot bypass SoD controls

### AI Permissions (Phase 3.8)
- [ ] Compliance Editor can access AI generation panel
- [ ] Viewer cannot access AI generation
- [ ] Business Owner cannot access AI generation
- [ ] Compliance Approver cannot generate citations (can review/reject only)
- [ ] Auditor cannot generate citations (audit view only)
- [ ] Legal Reviewer cannot generate citations (review/reject only)
- [ ] Risk Reviewer cannot generate citations (view/audit only)
- [ ] All generated citations are flagged `legalReviewRequired: true`
- [ ] Low-confidence citations (< 0.7) auto-flagged `human_review_required`

---

## E. Governance Safety

- [ ] Active reference data is NOT directly editable
  - [ ] Requirements table is read-only
  - [ ] Crosswalks table is read-only
- [ ] Publishing creates new version records
- [ ] Prior versions are superseded (not deleted)
- [ ] Audit events are written for all state transitions
- [ ] Audit checksums are present (SHA-256)
- [ ] Audit events cannot be edited or deleted
- [ ] Report snapshots are immutable after creation
- [ ] Source validation does not auto-publish
- [ ] Draft → Review → Publish workflow enforced

---

## F. Security

### Secrets & Exposure
- [ ] `DATABASE_URL` not visible in browser DevTools
- [ ] No environment secrets in client JavaScript bundle
- [ ] Error responses do not contain stack traces
- [ ] API error messages are generic (no internal details)

### Authentication
- [ ] Demo auth disabled before production (`DEMO_AUTH_ENABLED=false`)
- [ ] Production auth provider configured and tested
- [ ] Role switcher removed or clearly demo-only

### OIDC Validation (Phase 3.1)
- [ ] `AUTH_SECRET` is set
- [ ] `AUTH_URL` matches deployment domain
- [ ] OIDC credentials configured (`AUTH_OIDC_ISSUER`, `AUTH_OIDC_ID`, `AUTH_OIDC_SECRET`)
- [ ] OIDC callback URL registered in IdP
- [ ] OIDC login → redirect → session established
- [ ] OIDC group-to-role mapping verified
- [ ] Users with no matching group default to `viewer`
- [ ] Session identity visible in app (not "anonymous")
- [ ] Audit events include OIDC user identity

### API Security
- [ ] Unauthorized API calls return 403
- [ ] Invalid payloads return 400
- [ ] Missing records return 404
- [ ] Database-required operations return 503 in JSON mode
- [ ] All write APIs enforce server-side `requirePermission()`
- [ ] No API route allows direct mutation of active reference data

### Response Headers
- [ ] `X-Content-Type-Options: nosniff` present
- [ ] `X-Frame-Options: DENY` present
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` present
- [ ] `Permissions-Policy` present
- [ ] CSP configured at CDN/proxy level (not in middleware)

### Exports
- [ ] CSV exports require `reports.export` permission
- [ ] JSON exports require `reports.export` permission
- [ ] Print exports include snapshot provenance
- [ ] All exports create snapshot records before delivery

---

## G. Regression — Key Pages Render

Verify all key pages load without errors:

- [ ] `/` — Operating Map (home)
- [ ] `/executive-dashboard`
- [ ] `/data-quality`
- [ ] `/source-registry`
- [ ] `/reports`
- [ ] `/action-center`
- [ ] `/controls-evidence`
- [ ] `/impact-analysis`
- [ ] `/obligations`
- [ ] `/requirements`
- [ ] `/business-functions`
- [ ] `/supply-chain`
- [ ] `/launch-critical`
- [ ] `/crosswalk`
- [ ] `/regulatory-updates`
- [ ] `/draft-mapping`
- [ ] `/review-approval`
- [ ] `/audit-log`
- [ ] `/version-history`
- [ ] `/as-of-trace`
- [ ] `/risks`
- [ ] `/gaps`
- [ ] `/evidence`
- [ ] `/sources`

---

## Source File Metadata (Phase 3.3)

- [ ] File metadata registration works in database mode
- [ ] File metadata registration blocked in JSON mode
- [ ] File count badge displays correctly on source cards
- [ ] Source files populate in drawer after registration
- [ ] Archive confirmation prompt appears before archive
- [ ] Archive transitions file to `archived` status
- [ ] Error feedback appears for failed registration
- [ ] RBAC: Only `source.intake` / `source.validate` roles can register/change files
- [ ] Audit events created for register, update, status change, verify, archive
- [ ] PATCH rejects protected fields (id, stableReferenceId, sourceRecordId, etc.)
- [ ] GET/PATCH validate parent record ownership (cross-record access blocked)

## Storage Security (Phase 3.3)

- [ ] `STORAGE_PROVIDER` defaults to `none`
- [ ] No `NEXT_PUBLIC_STORAGE_*` variables present in `.env`
- [ ] Predeploy detects `NEXT_PUBLIC_STORAGE_*` leaks
- [ ] Predeploy validates `STORAGE_PROVIDER` value
- [ ] Storage secrets are server-side only

## AI Provider Integration (Phase 3.8)

### AI Configuration
- [ ] `AI_PROVIDER` defaults to `none` (disabled)
- [ ] `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` defaults to `false`
- [ ] Both flags must be explicitly enabled for citation generation
- [ ] AI generation requires database mode (returns 503 in JSON mode)

### AI Generation
- [ ] Citation generation panel visible on `/ai-suggestions`
- [ ] Generation requires source record ID, reference, and excerpt
- [ ] Source excerpt limited to 12,000 characters
- [ ] Generated citations are `draft-only` — not active reference data
- [ ] Generated citations have `suggestionType: 'citation'`
- [ ] Generated citations do not populate obligation fields
- [ ] Accept-to-draft button is permanently disabled
- [ ] Accept-to-draft blocked at Zod schema level

### AI Security
- [ ] No `NEXT_PUBLIC_AI_*` variables in environment
- [ ] No `NEXT_PUBLIC_AZURE_OPENAI_*` variables in environment
- [ ] AI provider credentials not visible in browser DevTools
- [ ] AI provider credentials not logged to console
- [ ] AI provider credentials not included in audit events
- [ ] Smoke-test detects AI secret exposure
- [ ] Predeploy detects AI secret exposure

### AI Audit Trail
- [ ] `ai_citation_generation.requested` audit event on generation start
- [ ] `ai_suggestion.citation_created` audit event per citation
- [ ] `ai_citation_generation.completed` audit event on success
- [ ] `ai_citation_generation.failed` audit event on failure
- [ ] Audit events include user identity, roles, model version, prompt version

### AI Governance Banners
- [ ] Generation panel shows citation-only warning
- [ ] Generation panel shows accept-to-draft disabled notice
- [ ] Generation panel shows mandatory human review notice
- [ ] Detail drawer shows "not legal advice" disclaimer
- [ ] Detail drawer accept button disabled with governance message

---

## Sign-Off

| Check | Result | Tester | Date |
|---|---|---|---|
| Build & Environment | | | |
| JSON Mode | | | |
| Database Mode | | | |
| RBAC | | | |
| Governance | | | |
| Security | | | |
| Source File Metadata | | | |
| Storage Security | | | |
| AI Configuration | | | |
| AI Generation | | | |
| AI Security | | | |
| AI Audit Trail | | | |
| AI Governance Banners | | | |
| Regression | | | |

**Overall Status:** ___ PASS / FAIL ___

