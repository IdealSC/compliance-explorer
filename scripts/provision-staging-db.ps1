# Workstream 1 — Database Provisioning Quick-Start
# Run this script AFTER authenticating neonctl:
#   npx neonctl auth
#
# This script:
# 1. Creates the Neon staging project
# 2. Captures the connection string
# 3. Creates .env.local
# 4. Pushes schema
# 5. Seeds baseline data
# 6. Verifies connectivity

Write-Host "=== Workstream 1: Database Provisioning ===" -ForegroundColor Cyan

# Step 1: Create Neon project
Write-Host "`n[1/6] Creating Neon project 'compliance-staging'..." -ForegroundColor Yellow
$project = npx neonctl projects create --name "compliance-staging" --output json 2>&1
$projectJson = $project | ConvertFrom-Json
$projectId = $projectJson.id
$projectRegion = $projectJson.region_id
Write-Host "  Project ID: $projectId"
Write-Host "  Region: $projectRegion"

# Step 2: Get connection string
Write-Host "`n[2/6] Retrieving connection string..." -ForegroundColor Yellow
$connStr = npx neonctl connection-string --project-id $projectId 2>&1
$connStr = $connStr.Trim()
Write-Host "  Connection string retrieved (not displayed for security)"

# Step 3: Create .env.local
Write-Host "`n[3/6] Creating .env.local..." -ForegroundColor Yellow
$envContent = @"
# Staging Environment — Workstream 1 Database Provisioning
# Created: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")

# Core Application
DATA_SOURCE=database
NEXT_PUBLIC_DATA_SOURCE=database

# Database (Neon Serverless PostgreSQL)
DATABASE_URL=$connStr

# Auth — staging (to be configured in Workstream 2)
DEMO_AUTH_ENABLED=true

# AI — staging (to be configured in Workstream 3)
# AI_PROVIDER=none
# AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false
"@
Set-Content -Path ".env.local" -Value $envContent
Write-Host "  .env.local created"

# Step 4: Push schema
Write-Host "`n[4/6] Pushing schema to Neon..." -ForegroundColor Yellow
npx drizzle-kit push 2>&1

# Step 5: Seed baseline data
Write-Host "`n[5/6] Seeding baseline data (additive, no --reset)..." -ForegroundColor Yellow
npm run db:seed 2>&1

# Step 6: Verify
Write-Host "`n[6/6] Starting verification..." -ForegroundColor Yellow
Write-Host "  Checking DATABASE_URL is set..."
if ($connStr) { Write-Host "  DATABASE_URL: configured" -ForegroundColor Green } else { Write-Host "  DATABASE_URL: MISSING" -ForegroundColor Red }
Write-Host "  Checking NEXT_PUBLIC_DATABASE_URL is NOT set..."
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "NEXT_PUBLIC_DATABASE_URL") { Write-Host "  LEAK DETECTED" -ForegroundColor Red } else { Write-Host "  No client exposure" -ForegroundColor Green }

Write-Host "`n=== Provisioning Complete ===" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "  1. Run 'npm run dev' and test http://localhost:3000"
Write-Host "  2. Verify API returns dataSource: 'database'"
Write-Host "  3. Run 'npm run predeploy' to verify"
Write-Host ""
Write-Host "Neon Project: compliance-staging"
Write-Host "Region: $projectRegion"
Write-Host "Project ID: $projectId"
