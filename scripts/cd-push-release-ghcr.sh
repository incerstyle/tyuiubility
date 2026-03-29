#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"
: "${RELEASE_TAG:?RELEASE_TAG is required}"

OWNER_LC="$(echo "${GITHUB_REPOSITORY%%/*}" | tr '[:upper:]' '[:lower:]')"
REF="ghcr.io/${OWNER_LC}/tyuiubility:${RELEASE_TAG}"

oras push "${REF}" \
  --artifact-type application/vnd.tyuiubility.extension.package.v1 \
  --annotation "org.opencontainers.image.source=https://github.com/${GITHUB_REPOSITORY}" \
  --annotation "org.opencontainers.image.revision=${GITHUB_SHA}" \
  --annotation "org.opencontainers.image.version=${RELEASE_TAG}" \
  build/chrome-mv3-prod.zip:application/zip \
  build/firefox-prod.zip:application/zip
