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

validate_bpp_fields() {
  local name="$1"
  local browser="$2"
  local value="$3"

  if ! node - "$browser" "$value" <<'NODE' >/dev/null 2>&1
const browser = process.argv[2]
const raw = process.argv[3]
const parsed = JSON.parse(raw)

if (!parsed || typeof parsed !== "object") {
  throw new Error("invalid root")
}

if (!parsed[browser] || typeof parsed[browser] !== "object") {
  throw new Error(`missing top-level '${browser}' object`)
}

const config = parsed[browser]

const required = {
  chrome: ["extId", "refreshToken", "clientId", "clientSecret"],
  firefox: ["apiKey", "apiSecret"]
}[browser]

if (!required) {
  throw new Error("unknown browser")
}

for (const key of required) {
  if (typeof config[key] !== "string" || config[key].trim() === "") {
    throw new Error(`missing ${key}`)
  }
}
NODE
  then
    echo "${name} has invalid BPP structure for '${browser}'."
    echo "Expected JSON like: {\"${browser}\": {...required fields...}}."
    exit 1
  fi
}

validate_bpp_fields "SUBMIT_KEYS_CHROME" "chrome" "${SUBMIT_KEYS_CHROME}"
validate_bpp_fields "SUBMIT_KEYS_FIREFOX" "firefox" "${SUBMIT_KEYS_FIREFOX}"
