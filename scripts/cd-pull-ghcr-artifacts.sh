#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"

OWNER_LC="$(echo "${GITHUB_REPOSITORY%%/*}" | tr '[:upper:]' '[:lower:]')"
REF_SHA="ghcr.io/${OWNER_LC}/tyuiubility:sha-${GITHUB_SHA}"

echo "Pulling ${REF_SHA}"
oras pull "${REF_SHA}"

# ORAS may restore files either in root or preserving the original build/ path.
mkdir -p build
if [[ -f "chrome-mv3-prod.zip" ]]; then mv -f "chrome-mv3-prod.zip" "build/chrome-mv3-prod.zip"; fi
if [[ -f "firefox-prod.zip" ]]; then mv -f "firefox-prod.zip" "build/firefox-prod.zip"; fi

if [[ ! -f "build/chrome-mv3-prod.zip" ]] || [[ ! -f "build/firefox-prod.zip" ]]; then
  echo "Expected packaged artifacts were not found after GHCR pull."
  find . -maxdepth 4 -type f | sort
  exit 1
fi
