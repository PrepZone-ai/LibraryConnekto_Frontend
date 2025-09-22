Param(
  [string]$ProjectId,
  [string]$Region = "us-central1",
  [string]$Repo = "web-apps",
  [string]$Service = "library-connekto",
  [string]$ApiBaseUrl = ""
)

if (-not $ProjectId) {
  Write-Error "-ProjectId is required"; exit 1
}

$ErrorActionPreference = "Stop"

# Configure gcloud
& gcloud config set project $ProjectId | Out-Host
& gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com | Out-Host

# Ensure repository exists (ignore error if exists)
try {
  & gcloud artifacts repositories create $Repo --repository-format=docker --location=$Region | Out-Host
} catch {}

# Build & push image locally
$Commit = (git rev-parse --short HEAD) 2>$null
if (-not $Commit) { $Commit = (Get-Date -Format "yyyyMMddHHmmss") }
$Image = "$Region-docker.pkg.dev/$ProjectId/$Repo/$Service:$Commit"

Write-Host "Building Docker image: $Image"
& docker build --build-arg VITE_API_BASE_URL=$ApiBaseUrl -t $Image . | Out-Host

Write-Host "Pushing Docker image"
& docker push $Image | Out-Host

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run: $Service"
& gcloud run deploy $Service `
  --image=$Image `
  --region=$Region `
  --platform=managed `
  --allow-unauthenticated `
  --port=8080 `
  --cpu=1 `
  --memory=512Mi `
  --min-instances=0 `
  --max-instances=10 | Out-Host
