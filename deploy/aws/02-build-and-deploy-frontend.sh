#!/usr/bin/env bash
# Frontend build + S3 sync + CloudFront invalidation.
# Reference: AWS_Deploy.md, Section 12.
#
# Usage:
#   BUCKET=libraryconnekto-frontend \
#   CF_DIST_ID=EXXXXXXXXXXXXX \
#   API_BASE_URL=https://api.libraryconnekto.me/api/v1 \
#   AWS_REGION=ap-south-1 \
#   ./deploy/aws/02-build-and-deploy-frontend.sh
set -euo pipefail

BUCKET="${BUCKET:-libraryconnekto-frontend}"
API_BASE_URL="${API_BASE_URL:-https://api.libraryconnekto.me/api/v1}"
AWS_REGION="${AWS_REGION:-ap-south-1}"

if [[ -z "${CF_DIST_ID:-}" ]]; then
  echo "ERROR: set CF_DIST_ID env variable." >&2
  exit 1
fi

cd "$(dirname "$0")/../.."

echo "VITE_API_BASE_URL=$API_BASE_URL" > .env.production.local

echo "==> Installing dependencies"
npm ci

echo "==> Building bundle"
npm run build

echo "==> Syncing dist/ -> s3://$BUCKET"
aws s3 sync dist/ "s3://$BUCKET" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html" \
  --region "$AWS_REGION"

aws s3 cp dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --region "$AWS_REGION"

echo "==> Invalidating CloudFront $CF_DIST_ID"
aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST_ID" \
  --paths "/*"

echo "Done."
