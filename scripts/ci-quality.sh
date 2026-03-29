#!/usr/bin/env bash
set -euo pipefail

pnpm lint
pnpm check-types
pnpm test:coverage
pnpm build
