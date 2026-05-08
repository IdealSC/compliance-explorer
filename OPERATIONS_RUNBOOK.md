# Operations Runbook — Compliance Operating Map

> Operational procedures for production deployment, maintenance, and incident response.

---

## Table of Contents

1. [Health Verification](#1-health-verification)
2. [Database Connectivity](#2-database-connectivity)
3. [OIDC Login Verification](#3-oidc-login-verification)
4. [Audit Log Verification](#4-audit-log-verification)
5. [Controlled Publishing Verification](#5-controlled-publishing-verification)
6. [Report Snapshot Verification](#6-report-snapshot-verification)
7. [Secret Rotation](#7-secret-rotation)
8. [Failed Deployment Response](#8-failed-deployment-response)
9. [Application Rollback](#9-application-rollback)
10. [Failed Database Migration](#10-failed-database-migration)
11. [Disable Demo Auth](#11-disable-demo-auth)
12. [Admin Access Review](#12-admin-access-review)
13. [Source File Metadata Operations (Phase 3.3)](#13-source-file-metadata-operations-phase-33)
14. [Storage Provider Troubleshooting (Phase 3.3)](#14-storage-provider-troubleshooting-phase-33)
15. [Source Intake Workflow Operations (Phase 3.4)](#15-source-intake-workflow-operations-phase-34)
16. [AI Citation Governance Operations (Phase 3.8–3.11)](#16-ai-citation-governance-operations-phase-38311)
17. [Draft Validation Workbench Operations (Phase 3.10)](#17-draft-validation-workbench-operations-phase-310)
18. [AI Feature Flag / Rollback Procedure](#18-ai-feature-flag--rollback-procedure)

---

## 1. Health Verification

**Goal:** Confirm the app is running and serving content.

### Steps

1. Open the app root URL in a browser (e.g., `https://app.example.com`)
2. Verify the home page / Operating Map renders
3. Check the browser Network tab — responses should return `200`
4. Verify security headers in response:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
5. Check the deployment platform logs for startup errors

### Expected Result

- Home page loads with data
- No console errors in browser
- No startup errors in server logs

---

## 2. Database Connectivity

**Goal:** Confirm the app can reach the database.

### Steps

1. Run the smoke test: `npm run smoke-test`
2. Check "Database Connectivity" section — should show ✓
3. Alternatively, navigate to any database-backed page (e.g., `/audit-log`)
4. Verify data loads (not empty / no 500 errors)

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Smoke test fails DB check | `DATABASE_URL` missing or wrong | Verify connection string in env |
| Pages show 500 errors | Database unreachable | Check network/firewall, DB status |
| Empty data | Tables not seeded/migrated | Run `npm run db:migrate`, then `npm run db:seed` |
| SSL errors | Missing `sslmode=require` | Add `?sslmode=require` to connection string |

---

## 3. OIDC Login Verification

**Goal:** Confirm SSO login works end-to-end.

### Steps

1. Ensure `DEMO_AUTH_ENABLED=false` in environment
2. Navigate to the app — should redirect to OIDC sign-in
3. Sign in with IdP credentials
4. Verify redirect back to app with session active
5. Check the identity panel — should show OIDC user info
6. Verify role assignment matches IdP group membership

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Sign-in page 500 error | Missing `AUTH_SECRET` | Set `AUTH_SECRET` env var |
| Redirect loop | Missing OIDC credentials | Set `AUTH_OIDC_ISSUER/ID/SECRET` |
| "Callback error" | Wrong redirect URI in IdP | Register `https://domain/api/auth/callback/oidc` |
| Wrong role assigned | Group mapping mismatch | Check `AUTH_GROUP_ROLE_MAP` or IdP group membership |
| "Viewer" when expecting Admin | Group claim not included | Ensure IdP sends `groups` claim in token |

---

## 4. Audit Log Verification

**Goal:** Confirm audit events are written and displayed.

### Steps

1. Sign in as an authorized user
2. Perform an auditable action (e.g., create a draft, submit for review)
3. Navigate to `/audit-log`
4. Verify the action appears in the audit log
5. Check audit event fields:
   - Timestamp
   - User attribution (name, email)
   - Action type
   - Entity reference
   - Checksum (SHA-256)

### Expected Result

- Audit event appears within seconds of action
- User identity is correct (not "anonymous" or "demo")
- Checksum is present and non-empty

---

## 5. Controlled Publishing Verification

**Goal:** Confirm the draft → review → publish workflow enforces governance.

### Steps

1. **Create a draft** (as Editor): Navigate to `/draft-mapping`, create a draft
2. **Submit for review** (as Editor): Submit the draft
3. **Verify SoD**: Confirm the same user cannot approve their own draft
4. **Approve** (as Approver): Navigate to `/review-approval`, approve the draft
5. **Publish** (as Approver): Publish the approved change
6. **Verify version**: Navigate to `/version-history` — new version should appear
7. **Verify supersession**: Prior version should be marked as superseded
8. **Verify audit**: Check `/audit-log` for publish event

---

## 6. Report Snapshot Verification

**Goal:** Confirm report snapshots are created and exports include metadata.

### Steps

1. Navigate to `/reports`
2. Generate a report (any type)
3. Download as CSV — verify snapshot ID and checksum in export
4. Download as JSON — verify snapshot ID and checksum in export
5. Switch to "Snapshot History" tab — verify snapshot record appears
6. Verify snapshot includes: ID, type, timestamp, user, checksum

---

## 7. Secret Rotation

**Goal:** Rotate secrets without downtime.

### AUTH_SECRET Rotation

1. Generate a new secret: `openssl rand -base64 32`
2. Update `AUTH_SECRET` in environment
3. Redeploy the application
4. Existing sessions will be invalidated — users will need to re-authenticate
5. Verify OIDC login works with new secret

### AUTH_OIDC_SECRET Rotation

1. Generate a new client secret in your IdP (Entra ID, Okta, etc.)
2. Update `AUTH_OIDC_SECRET` in environment
3. Redeploy the application
4. Verify OIDC login works
5. Revoke the old client secret in your IdP

### DATABASE_URL Rotation

1. Create new database credentials (or rotate password)
2. Update `DATABASE_URL` in environment
3. Redeploy the application
4. Verify database connectivity: `npm run smoke-test`
5. Revoke old credentials

> **⚠️ Always test on staging first before rotating production secrets.**

---

## 8. Failed Deployment Response

**Goal:** Recover from a failed deployment.

### Steps

1. Check deployment platform logs for the error
2. Common failures:
   - **Build failure**: TypeScript error or missing dependency → fix and redeploy
   - **Startup error**: Missing environment variable → check env configuration
   - **Database error**: Connection refused → check DATABASE_URL and network
   - **OIDC error**: Missing credentials → check AUTH_OIDC_* variables
3. If the app is down, roll back to the previous deployment (see Section 9)
4. If build succeeded but app crashes, check runtime logs for the specific error

### Prevention

- Always run `npm run predeploy` before deploying
- Test on staging before production
- Keep the previous deployment available for rollback

---

## 9. Application Rollback

**Goal:** Revert to the previous working deployment.

### Vercel

1. Go to Vercel Dashboard → Project → Deployments
2. Find the last successful deployment
3. Click "..." → "Promote to Production"

### Azure App Service

1. Go to Azure Portal → App Service → Deployment Center
2. Use deployment slots to swap back to previous version
3. Or redeploy the previous Git commit

### Container

1. Tag the current (broken) image for reference
2. Pull and deploy the previous image tag
3. Restart the container

### Post-Rollback

1. Verify the app is serving correctly
2. Check database compatibility — if migrations were applied, they may need to be rolled back (see Section 10)
3. Investigate the failure root cause before re-attempting deployment

---

## 10. Failed Database Migration

**Goal:** Recover from a failed or breaking migration.

### Prevention

1. Always back up the database before migrations
2. Review generated SQL before applying
3. Test migrations on staging first

### Recovery Steps

1. **Check migration status** in `drizzle/migrations/` — identify which SQL file failed
2. **If partially applied**: Review which statements completed
3. **If rollback SQL exists**: Apply the rollback SQL against the database
4. **If no rollback SQL**: Restore from backup
5. **Never use `db:reset` on production** to fix migration issues — it truncates ALL data

### Backup Restoration

```bash
# Example (Neon):
# Use the Neon dashboard to restore from a point-in-time backup
# or restore from a manual pg_dump backup:
pg_restore -h host.neon.tech -U user -d dbname backup.dump
```

---

## 11. Disable Demo Auth

**Goal:** Switch from demo auth to production SSO.

### Steps

1. Set `DEMO_AUTH_ENABLED=false` in environment
2. Configure OIDC credentials:
   ```
   AUTH_SECRET=<generated secret>
   AUTH_OIDC_ISSUER=<your IdP discovery URL>
   AUTH_OIDC_ID=<client ID>
   AUTH_OIDC_SECRET=<client secret>
   ```
3. Set `AUTH_URL=https://your-domain`
4. Register callback URL in IdP: `https://your-domain/api/auth/callback/oidc`
5. Redeploy
6. Verify SSO login works
7. Verify demo role switcher is no longer visible

---

## 12. Admin Access Review

**Goal:** Audit who has administrative access.

### OIDC Group Review

1. Check your IdP (Entra ID, Okta, etc.) for the admin group membership
2. Review `AUTH_GROUP_ROLE_MAP` configuration — identify which IdP group maps to `admin`
3. Verify only authorized personnel are in the admin group
4. Remove any unnecessary admin group members

### Application-Level Review

1. Navigate to `/audit-log` and filter for admin-level actions
2. Review recent admin activity for unexpected operations
3. Cross-reference with known admin personnel

### Recommended Cadence

- Review admin access **monthly**
- Review after any personnel changes
- Document reviews in the compliance record

---

## 13. Source File Metadata Operations (Phase 3.3)

**Goal:** Manage source file metadata lifecycle.

### Registering File Metadata

1. Navigate to Source Registry → select a source record
2. Open the Source Detail Drawer
3. Click "Register File Metadata" (database mode only)
4. Enter file name, MIME type, size in bytes, and optional display name / notes
5. Click "Register" — this creates metadata only, no file is uploaded

### Archiving File Metadata

1. Open the Source Detail Drawer for the source record
2. Click the archive icon on the target file row
3. Confirm the archive action in the confirmation prompt
4. The file status transitions to `archived` (terminal state)

### Troubleshooting File Metadata

| Issue | Cause | Resolution |
|---|---|---|
| "Database mode required" | `DATA_SOURCE` is not `database` | Set `DATA_SOURCE=database` and restart |
| 403 on file registration | User lacks `source.intake` permission | Assign Analyst or Admin role |
| 409 on status change | Invalid lifecycle transition | Check current status — only valid transitions are allowed |
| Files not loading in drawer | Source files API returns `[]` | Verify the batch loader is running via registry GET API |

---

## 14. Storage Provider Troubleshooting (Phase 3.3)

**Goal:** Diagnose storage configuration issues.

### Storage Provider Defaults

| `STORAGE_PROVIDER` | Behavior |
|---|---|
| `none` (default) | Metadata-only, no storage SDK active |
| `local` | Requires `STORAGE_LOCAL_PATH` |
| `s3` | Requires `STORAGE_S3_BUCKET`, `STORAGE_S3_REGION` |
| `azure` | Requires `STORAGE_AZURE_CONTAINER`, `STORAGE_AZURE_CONNECTION_STRING` |
| `gcs` | Requires `STORAGE_GCS_BUCKET` |

### Common Storage Issues

| Issue | Resolution |
|---|---|
| `STORAGE_PROVIDER` not recognized | Ensure value is one of: `none`, `local`, `s3`, `azure`, `gcs` |
| Storage secrets in client bundle | Remove any `NEXT_PUBLIC_STORAGE_*` variables immediately |
| Predeploy fails on storage check | Verify `.env` does not contain `NEXT_PUBLIC_STORAGE_*` entries |
| File metadata shows `storageProvider: "none"` | Expected default — no real storage until provider is configured |

---

## 15. Source Intake Workflow Operations (Phase 3.4)

**Goal:** Manage the controlled intake pipeline for new regulatory materials.

### Submitting an Intake Request

1. Navigate to `/source-intake` (requires `source.intake` permission)
2. Click "New Intake Request" (database mode only)
3. Enter required fields: title, intake type
4. Optional: source type, regulator, jurisdiction, priority, description
5. Submit — the request enters `submitted` status
6. An audit event is created with the submitter's identity

### Triaging an Intake Request

1. Open the intake request detail drawer
2. Review the submitted metadata and checklist items
3. Transition status through: `submitted` → `triage` → `metadata_review` → `assigned`
4. Assign a reviewer using the assign action (requires `source.validate` permission)
5. Update checklist items as metadata is verified
6. Flag for legal review if required

### Converting to Source Record

1. Ensure the intake request is at `ready_for_source_record` status
2. Click "Convert to Source Record" in the detail drawer
3. Confirm the governance notice — conversion creates a source record at `intake` status only
4. The system creates a source record via `createSourceRecord()` and audits the conversion
5. The intake request transitions to `converted_to_source_record`

> **⚠️ Conversion does NOT:**
> - Create obligations or draft mappings
> - Extract citations from file content
> - Publish any reference data
> - Trigger automated processing of any kind

### Workflow Status Lifecycle

```
submitted → triage → metadata_review → assigned → validation_pending
  → legal_review_required (loopback to validation_pending)
  → ready_for_source_record → converted_to_source_record → closed
Rejection available from most active states → rejected → closed
```

### Troubleshooting Intake Workflow

| Issue | Cause | Resolution |
|---|---|---|
| "Database mode required" | `DATA_SOURCE` is not `database` | Set `DATA_SOURCE=database` and restart |
| 403 on intake creation | User lacks `source.intake` permission | Assign Analyst or Admin role |
| 403 on status transition | User lacks `source.validate` permission | Assign Compliance Editor or Admin role |
| 409 on status change | Invalid workflow transition | Check ALLOWED_TRANSITIONS — only valid next states are permitted |
| Convert button disabled | Intake not at `ready_for_source_record` | Complete checklist and transition to ready state |
| Checklist items not updating | Missing parent validation | Ensure the checklist item belongs to the specified intake request |

---

## 16. AI Citation Governance Operations (Phase 3.8–3.11)

**Goal:** Operate the end-to-end AI-assisted citation suggestion lifecycle.

### Generating Citation Suggestions

1. Navigate to `/ai-suggestions` (requires `ai.suggestion.generate` permission)
2. Select a validated source record to generate citations from
3. Initiate generation — the system calls the configured AI provider
4. Generated citations appear as `pending_review` with `legalReviewRequired: true`
5. Audit events are created for the generation request and each individual citation

### Reviewing AI Suggestions

1. Navigate to `/ai-suggestions` workbench
2. Open a suggestion in the detail drawer
3. Available actions: reject (with notes), expire, mark for review, update notes, toggle legal review
4. All review actions create audit events

### Converting to Draft (Phase 3.9)

1. Navigate to an eligible reviewed citation suggestion
2. Click "Convert to Draft" (requires `ai.suggestion.acceptToDraft` + `draft.edit`)
3. The system runs 8-gate eligibility validation before conversion
4. On success, a `DraftRegulatoryChange` is created at draft/staging status
5. The draft includes provenance stamp `[AI Citation Suggestion: {id}]`
6. Duplicate conversion is blocked — re-conversion returns 409

> **⚠️ Conversion does NOT:**
> - Create active reference data
> - Bypass review → approval → publishing pipeline
> - Auto-approve or auto-publish any record

### Troubleshooting AI Citations

| Issue | Cause | Resolution |
|---|---|---|
| 503 `FEATURE_DISABLED` | `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` not set to `true` | Enable feature flag in environment |
| 503 `PROVIDER_NOT_CONFIGURED` | Missing AI provider credentials | Configure `AZURE_OPENAI_ENDPOINT`, `API_KEY`, `DEPLOYMENT` |
| 409 `SOURCE_NOT_VALIDATED` | Source record not at `validated` status | Validate the source record first |
| 502 `GENERATION_FAILED` | AI provider returned an error | Check provider status, API key validity, deployment name |
| 422 `NOT_ELIGIBLE` | Suggestion fails eligibility gates | Review 8-gate criteria: status, type, expiry, duplication |
| 403 on generation | User lacks `ai.suggestion.generate` permission | Assign Compliance Editor or Admin role |
| 403 on conversion | User lacks `ai.suggestion.acceptToDraft` permission | Assign Compliance Editor or Admin role |

---

## 17. Draft Validation Workbench Operations (Phase 3.10)

**Goal:** Manage advisory pre-review validation for AI-linked and regular draft changes.

### Creating a Validation Review

1. Navigate to `/validation-workbench` (requires `validation.view` permission)
2. Click "Create Validation Review" for a target draft change
3. The review is created at `not_started` status
4. Audit event is created for the review creation

### Performing Validation

1. Open the validation detail drawer
2. Start validation (status: `not_started` → `in_validation`)
3. Assess source support status (adequate/partial/unsupported)
4. Assess citation accuracy status (AI-linked drafts only: verified/inaccurate/unverifiable)
5. Complete legal review if flagged (requires `VALIDATION_LEGAL_REVIEW` permission — Legal Reviewer only)
6. Add reviewer notes and findings

### Marking Ready for Review

1. The "Mark Ready for Review" action requires 5 preconditions:
   - Source support status has been assessed
   - Citation accuracy assessed (if AI-linked)
   - Legal review completed (if required)
   - Reviewer notes present (if partial/unsupported findings)
   - Draft not in terminal status
2. "Ready for Review" is advisory ONLY — it does NOT approve or publish

### Troubleshooting Validation

| Issue | Cause | Resolution |
|---|---|---|
| 503 on validation create | `DATA_SOURCE` is not `database` | Set `DATA_SOURCE=database` and restart |
| 403 on legal review | User lacks `VALIDATION_LEGAL_REVIEW` permission | Assign Legal Reviewer role |
| `PRECONDITION_FAILED` | Missing required assessments for "Ready for Review" | Complete all required fields per precondition list |
| 422 on multi-field PATCH | Attempted to update source support AND citation accuracy in same request | Send as separate PATCH requests |
| Badge shows "Ready for Review" but draft not approved | Expected — "Ready for Review" ≠ approved | Draft still requires review → approval → publishing |

---

## 18. AI Feature Flag / Rollback Procedure

**Goal:** Enable, disable, or roll back AI citation functionality.

### Enabling AI Citations (Pilot)

1. Set `AI_PROVIDER=azure_openai` (or intended provider)
2. Set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=true`
3. Configure provider credentials:
   ```
   AZURE_OPENAI_ENDPOINT=<endpoint>
   AZURE_OPENAI_API_KEY=<api-key>
   AZURE_OPENAI_DEPLOYMENT=<deployment-name>
   ```
4. Redeploy the application
5. Verify generation endpoint responds (POST to `/api/ai/citation-suggestions/generate`)

### Disabling AI Citations (Rollback)

1. Set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false`
2. Optionally set `AI_PROVIDER=none`
3. Redeploy the application
4. Verify generation endpoint returns 503 `FEATURE_DISABLED`
5. All existing suggestions, drafts, validations, and audit events are preserved (immutable)

### Emergency Rollback (Access Revocation)

1. Set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false`
2. Set `AI_PROVIDER=none`
3. Remove pilot users from IdP Compliance Editor group (revoke `ai.suggestion.generate`)
4. Redeploy
5. Existing governance records remain intact — they can be individually rejected/closed

> **⚠️ Rollback does NOT delete:**
> - Existing AI suggestions (they remain in their current status)
> - Converted draft changes (they remain in draft pipeline)
> - Audit events (immutable — cannot be deleted)
> - Validation reviews (they remain as advisory metadata)
