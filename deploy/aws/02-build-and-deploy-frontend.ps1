<#
.SYNOPSIS
  Build the React/Vite frontend and deploy it to S3 + invalidate CloudFront.
  Reference: AWS_Deploy.md, Section 12.

.PARAMETER Bucket
  S3 bucket name (default libraryconnekto-frontend)
.PARAMETER DistributionId
  CloudFront distribution ID. Pulled from ../../LibraryConnekto_Backend/deploy/aws/scripts/aws-state.json
  if not supplied.
.PARAMETER ApiBaseUrl
  Override VITE_API_BASE_URL (defaults to https://api.libraryconnekto.me/api/v1).

.EXAMPLE
  .\02-build-and-deploy-frontend.ps1
#>
[CmdletBinding()]
param(
  [string]$Bucket = "libraryconnekto-frontend",
  [string]$DistributionId,
  [string]$ApiBaseUrl = "https://api.libraryconnekto.me/api/v1",
  [string]$Region = "ap-south-1"
)

$ErrorActionPreference = "Stop"

# Try to read CloudFront ID from backend provisioning state file if not given.
if (-not $DistributionId) {
  $statePath = Join-Path $PSScriptRoot "..\..\..\LibraryConnekto_Backend\deploy\aws\scripts\aws-state.json"
  if (Test-Path $statePath) {
    $state = Get-Content $statePath -Raw | ConvertFrom-Json
    if ($state.cloudfront_id) { $DistributionId = $state.cloudfront_id }
    if ($state.bucket_name)    { $Bucket = $state.bucket_name }
  }
}
if (-not $DistributionId) {
  throw "DistributionId not supplied and not found in aws-state.json. Pass -DistributionId."
}

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $projectRoot
Write-Host "Working directory: $projectRoot" -ForegroundColor Cyan

# 1. Build production bundle
$envFile = Join-Path $projectRoot ".env.production.local"
"VITE_API_BASE_URL=$ApiBaseUrl" | Set-Content -Path $envFile -Encoding UTF8

Write-Host "`n[1/3] Installing dependencies"
npm ci

Write-Host "`n[2/3] Building bundle"
npm run build

# 2. Upload to S3 with proper cache-control
Write-Host "`n[3/3] Syncing dist/ -> s3://$Bucket"
aws s3 sync dist/ "s3://$Bucket" `
  --delete `
  --cache-control "public,max-age=31536000,immutable" `
  --exclude "index.html" `
  --region $Region

aws s3 cp dist/index.html "s3://$Bucket/index.html" `
  --cache-control "no-cache,no-store,must-revalidate" `
  --region $Region

# 3. CloudFront invalidation
Write-Host "Invalidating CloudFront $DistributionId"
$inv = aws cloudfront create-invalidation `
  --distribution-id $DistributionId `
  --paths "/*"
Write-Host $inv

Write-Host "`nDeployment complete." -ForegroundColor Green
