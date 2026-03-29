#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"

OWNER_LC="$(echo "${GITHUB_REPOSITORY%%/*}" | tr '[:upper:]' '[:lower:]')"
REF_SHA="ghcr.io/${OWNER_LC}/tyuiubility:sha-${GITHUB_SHA}"
REF_LATEST="ghcr.io/${OWNER_LC}/tyuiubility:latest"

oras push "${REF_SHA}" \
  --artifact-type application/vnd.tyuiubility.extension.package.v1 \
  --annotation "org.opencontainers.image.source=https://github.com/${GITHUB_REPOSITORY}" \
  --annotation "org.opencontainers.image.revision=${GITHUB_SHA}" \
  build/chrome-mv3-prod.zip:application/zip \
  build/firefox-prod.zip:application/zip

oras push "${REF_LATEST}" \
  --artifact-type application/vnd.tyuiubility.extension.package.v1 \
  --annotation "org.opencontainers.image.source=https://github.com/${GITHUB_REPOSITORY}" \
  --annotation "org.opencontainers.image.revision=${GITHUB_SHA}" \
  build/chrome-mv3-prod.zip:application/zip \
  build/firefox-prod.zip:application/zip
