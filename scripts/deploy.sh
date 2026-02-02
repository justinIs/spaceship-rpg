#!/usr/bin/env bash
set -euo pipefail

# --- Configuration (override via env vars) ---
# AWS_PROFILE       - AWS CLI profile (required if not default)
# S3_BUCKET         - Target S3 bucket name (required)
# S3_PREFIX         - Path prefix in the bucket (optional, e.g. "spaceship-rpg")
# CLOUDFRONT_DIST_ID - CloudFront distribution ID (optional, triggers invalidation)
# BUILD_DIR         - Build output directory (default: dist)

# Load .env if present (won't override existing env vars)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/.env.deploy" ]]; then
  set -a
  source "$SCRIPT_DIR/.env.deploy"
  set +a
fi

BUILD_DIR="${BUILD_DIR:-dist}"
S3_PREFIX="${S3_PREFIX:-}"

# Build the full S3 destination
if [[ -n "$S3_PREFIX" ]]; then
  # Strip leading/trailing slashes for consistency
  S3_PREFIX="${S3_PREFIX#/}"
  S3_PREFIX="${S3_PREFIX%/}"
  S3_DEST="s3://$S3_BUCKET/$S3_PREFIX/"
else
  S3_DEST="s3://$S3_BUCKET/"
fi

# --- Validation ---
if [[ -z "${S3_BUCKET:-}" ]]; then
  echo "Error: S3_BUCKET is required."
  echo ""
  echo "Usage:"
  echo "  S3_BUCKET=my-bucket ./scripts/deploy.sh"
  echo "  S3_BUCKET=my-bucket AWS_PROFILE=myprofile ./scripts/deploy.sh"
  echo ""
  echo "Optional:"
  echo "  CLOUDFRONT_DIST_ID=E1234  - invalidate CloudFront cache after deploy"
  echo "  BUILD_DIR=dist            - custom build output directory"
  exit 1
fi

AWS_ARGS=()
if [[ -n "${AWS_PROFILE:-}" ]]; then
  AWS_ARGS+=(--profile "$AWS_PROFILE")
fi

# --- Summary ---
echo "==> Deploy Configuration"
echo "    S3_BUCKET:          $S3_BUCKET"
echo "    S3_PREFIX:          ${S3_PREFIX:-<none>}"
echo "    S3_DEST:            $S3_DEST"
echo "    AWS_PROFILE:        ${AWS_PROFILE:-<default>}"
echo "    BUILD_DIR:          $BUILD_DIR"
echo "    CLOUDFRONT_DIST_ID: ${CLOUDFRONT_DIST_ID:-<none>}"
echo ""

# --- Confirm ---
read -rp "Proceed with deploy? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

# --- Build ---
echo "==> Building project..."
if [[ -n "$S3_PREFIX" ]]; then
  VITE_BASE_PATH="/$S3_PREFIX/" npm run build
else
  npm run build
fi

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Error: Build directory '$BUILD_DIR' not found. Did the build fail?"
  exit 1
fi

# --- Upload ---
echo "==> Syncing $BUILD_DIR -> $S3_DEST"

# HTML files: no-cache so updates are picked up immediately
aws s3 sync "$BUILD_DIR" "$S3_DEST" \
  "${AWS_ARGS[@]}" \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html" \
  --delete

# Everything else: long cache (assets are hashed by Vite)
aws s3 sync "$BUILD_DIR" "$S3_DEST" \
  "${AWS_ARGS[@]}" \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

echo "==> Upload complete."

# --- CloudFront invalidation (optional) ---
if [[ -n "${CLOUDFRONT_DIST_ID:-}" ]]; then
  echo "==> Invalidating CloudFront distribution $CLOUDFRONT_DIST_ID..."
  aws cloudfront create-invalidation \
    "${AWS_ARGS[@]}" \
    --distribution-id "$CLOUDFRONT_DIST_ID" \
    --paths "$(if [[ -n "$S3_PREFIX" ]]; then echo "/$S3_PREFIX/*"; else echo "/*"; fi)" \
    --query 'Invalidation.Id' \
    --output text
  echo "==> Invalidation created."
fi

echo "==> Done. Site: http://$S3_BUCKET.s3-website-us-east-1.amazonaws.com"
