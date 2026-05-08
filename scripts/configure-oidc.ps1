# Workstream 2: OIDC Configuration Script
# Run this AFTER registering the Google OIDC app at:
#   https://console.cloud.google.com/apis/credentials
#
# Prerequisites:
# - Workstream 1 complete (DATABASE_URL, DATA_SOURCE=database)
# - Google OAuth 2.0 Client ID and Secret from console
# - Callback URI registered: http://localhost:3000/api/auth/callback/oidc

Write-Host "=== Workstream 2: OIDC Configuration ===" -ForegroundColor Cyan

# Step 1: Generate AUTH_SECRET
Write-Host "`n[1/5] Generating AUTH_SECRET..." -ForegroundColor Yellow
$authSecret = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
Write-Host "  AUTH_SECRET generated (44 chars)"

# Step 2: Collect OIDC credentials
Write-Host "`n[2/5] OIDC credentials required..." -ForegroundColor Yellow
$clientId = Read-Host "Enter Google OAuth Client ID"
$clientSecret = Read-Host "Enter Google OAuth Client Secret" -AsSecureString
$clientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret))

# Step 3: Read current .env.local and update
Write-Host "`n[3/5] Updating .env.local..." -ForegroundColor Yellow
$currentEnv = Get-Content ".env.local" -Raw

# Remove old auth lines if present
$lines = (Get-Content ".env.local") | Where-Object { 
    $_ -notmatch "^DEMO_AUTH_ENABLED=" -and 
    $_ -notmatch "^AUTH_SECRET=" -and 
    $_ -notmatch "^AUTH_URL=" -and 
    $_ -notmatch "^AUTH_OIDC_ISSUER=" -and 
    $_ -notmatch "^AUTH_OIDC_ID=" -and 
    $_ -notmatch "^AUTH_OIDC_SECRET=" -and
    $_ -notmatch "^NEXTAUTH_URL="
}

# Append OIDC config
$oidcConfig = @"

# Authentication (Workstream 2 - OIDC mode)
DEMO_AUTH_ENABLED=false
AUTH_SECRET=$authSecret
AUTH_URL=http://localhost:3000
AUTH_OIDC_ISSUER=https://accounts.google.com
AUTH_OIDC_ID=$clientId
AUTH_OIDC_SECRET=$clientSecretPlain
"@

$newContent = ($lines -join "`n") + "`n" + $oidcConfig
Set-Content -Path ".env.local" -Value $newContent
Write-Host "  .env.local updated with OIDC configuration"

# Step 4: Verify no client-side leaks
Write-Host "`n[4/5] Checking for client-side secret leaks..." -ForegroundColor Yellow
$envContent = Get-Content ".env.local" -Raw
$leaks = @("NEXT_PUBLIC_AUTH_SECRET", "NEXT_PUBLIC_AUTH_OIDC_SECRET", "NEXT_PUBLIC_AUTH_OIDC_ID", "NEXT_PUBLIC_DATABASE_URL")
$leakFound = $false
foreach ($leak in $leaks) {
    if ($envContent -match $leak) {
        Write-Host "  LEAK DETECTED: $leak" -ForegroundColor Red
        $leakFound = $true
    }
}
if (-not $leakFound) {
    Write-Host "  No client-side secret leaks detected" -ForegroundColor Green
}

# Step 5: Run predeploy
Write-Host "`n[5/5] Running predeploy verification..." -ForegroundColor Yellow
npm run predeploy 2>&1

Write-Host "`n=== OIDC Configuration Complete ===" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "  1. Run 'npm run dev'"
Write-Host "  2. Navigate to http://localhost:3000"
Write-Host "  3. Click Sign In -> authenticate with Google"
Write-Host "  4. Verify session contains email, name, roles"
Write-Host "  5. Verify demo role switcher is NOT visible"
