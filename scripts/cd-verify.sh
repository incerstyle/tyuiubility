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

validate_json_secret() {
  local name="$1"
  local value="$2"

  if ! node -e 'JSON.parse(process.argv[1])' "$value" >/dev/null 2>&1; then
    echo "${name} must be valid JSON. Check the secret value for truncation or missing brackets/quotes."
    exit 1
  fi
}

validate_json_secret "SUBMIT_KEYS_CHROME" "${SUBMIT_KEYS_CHROME}"
validate_json_secret "SUBMIT_KEYS_FIREFOX" "${SUBMIT_KEYS_FIREFOX}"
