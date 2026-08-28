#!/usr/bin/env bash
# Full verification: build, serve exactly as GitHub Pages would, drive a real
# browser, tear down. Run from the repo root:  bash verify/run.sh
#
# The order matters. An earlier version deleted and re-copied the served
# directory while the browser was mid-assertion, which produced a spectacular
# set of false failures. Prepare first, serve second, never touch it after.
set -euo pipefail

PORT="${PORT:-8099}"
ROOT="/tmp/osa-verify-$$"
SITE="$ROOT/onesmallask"        # subpath, so we reproduce the real deploy shape

command -v node >/dev/null || { echo "node is required"; exit 1; }
[ -d node_modules/playwright ] || {
  echo "Playwright is not installed (it is deliberately not a dependency)."
  echo "Run: npm i -D playwright && npx playwright install chromium"
  exit 1
}

echo "==> Building"
npm run build

echo "==> Preparing $SITE"
mkdir -p "$SITE"
cp -r dist/. "$SITE/"

echo "==> Serving on 127.0.0.1:$PORT"
SERVE_ROOT="$ROOT" python3 verify/ghpages_server.py "$PORT" &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
  rm -rf "$ROOT"
}
trap cleanup EXIT

for _ in $(seq 1 20); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/onesmallask/"; then break; fi
  sleep 0.25
done

echo "==> Running checks"
BASE_URL="http://127.0.0.1:$PORT/onesmallask/" node verify/check.mjs
