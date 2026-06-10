#!/usr/bin/env bash
set -euo pipefail

echo "==> Hytrade backend build (v3)"

if [ ! -f src/server.js ]; then
  echo "FATAL: src/server.js missing — wrong root directory or old repo checkout"
  exit 1
fi

if [ -f index.js ] && grep -q "Hytrade API v2.0 Server Started" index.js; then
  echo "FATAL: Old v2 index.js detected — Render must deploy Satendra-Soraiya/hytrade-4 branch main"
  exit 1
fi

npm ci || npm install
node scripts/seed-instruments.js || true

echo "==> Build OK (v3 entry: src/server.js)"
