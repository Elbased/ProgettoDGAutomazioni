#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -z "${ZEPHYRUS_BANNER_SHOWN:-}" ]]; then
  echo "=========================================="
  echo " ZephyrusTech - Avvio Progetto"
  echo "=========================================="
fi

export ZEPHYRUS_BANNER_SHOWN=1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Please install the LTS version and re-run this script."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found after Node.js check."
  exit 1
fi

if [[ ! -d "node_modules" ]]; then
  echo "Installing npm dependencies..."
  npm install
fi

echo "Starting ZephyrusTech Dev Server..."

(
  sleep 3
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:3002/#presentation" >/dev/null 2>&1 || true
  elif command -v open >/dev/null 2>&1; then
    open "http://localhost:3002/#presentation" >/dev/null 2>&1 || true
  else
    echo "Open http://localhost:3002/#presentation in your browser."
  fi
) &

npm run dev -- --host --port 3002
