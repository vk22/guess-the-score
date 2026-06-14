#!/usr/bin/env bash
set -euo pipefail

: "${SYNC_SECRET:?SYNC_SECRET is required}"
: "${APP_URL:?APP_URL is required}"

curl -fsS -X POST \
  -H "x-sync-secret: ${SYNC_SECRET}" \
  "${APP_URL%/}/api/internal/sync-matches"
