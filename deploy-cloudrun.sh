#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-}"
REGION="${REGION:-us-central1}"
REPO="${REPO:-web-apps}"
SERVICE="${SERVICE:-library-connekto}"
API_BASE_URL="${API_BASE_URL:-https://libraryconnekto-api-324578194548.us-central1.run.app/api/v1}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "PROJECT_ID is required (export PROJECT_ID=your-gcp-project)" >&2
  exit 1
fi

gcloud config set project "${PROJECT_ID}"
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com

# Create repo if not exists
if ! gcloud artifacts repositories describe "${REPO}" --location "${REGION}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${REPO}" --repository-format=docker --location "${REGION}"
fi

COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE}:${COMMIT_SHA}"

echo "Building ${IMAGE}"
docker build --build-arg VITE_API_BASE_URL="${API_BASE_URL}" -t "${IMAGE}" .

echo "Pushing ${IMAGE}"
docker push "${IMAGE}"

echo "Deploying to Cloud Run: ${SERVICE}"
gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --cpu=1 \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=10
