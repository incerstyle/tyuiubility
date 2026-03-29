#!/usr/bin/env bash
set -euo pipefail

: "${RELEASE_TAG:?RELEASE_TAG is required}"

if ! echo "${RELEASE_TAG}" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Release tag must match vX.Y.Z. Got: ${RELEASE_TAG}"
  exit 1
fi

if [[ -z "${SUBMIT_KEYS_CHROME:-}" ]]; then
  echo "Missing SUBMIT_KEYS_CHROME secret"
  exit 1
fi

if [[ -z "${SUBMIT_KEYS_FIREFOX:-}" ]]; then
  echo "Missing SUBMIT_KEYS_FIREFOX secret"
  exit 1
fi
