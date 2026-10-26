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

# `bash verify/run.sh demo` verifies the --mode demo build instead: the labelled
# example is listed, so the whole donor path (safety gate -> reveal) gets driven.
MODE="${1:-prod}"
case "$MODE" in
  prod) DIST="dist";      BUILD="npm run build";      export OSA_DEMO=0 ;;
  demo) DIST="dist-demo"; BUILD="npm run build:demo"; export OSA_DEMO=1 ;;
  *) echo "usage: bash verify/run.sh [prod|demo]"; exit 2 ;;
esac

command -v node >/dev/null || { echo "node is required"; exit 1; }
[ -d node_modules/playwright ] || {
  echo "Playwright is not installed. Run: npm install && npx playwright install chromium"
  exit 1
}

echo "==> Building ($MODE)"
$BUILD

echo "==> Preparing $SITE"
mkdir -p "$SITE"
cp -r "$DIST"/. "$SITE/"

echo "==> Serving on 127.0.0.1:$PORT"
SERVE_ROOT="$ROOT" python3 verify/ghpages_server.py "$PORT" &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
  rm -rf "$ROOT"
}
trap cleanup EXIT

for _ in $(seq 1 20); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/onesmallask/" 2>/dev/null; then break; fi
  sleep 0.25
done

echo "==> Running checks"
BASE_URL="http://127.0.0.1:$PORT/onesmallask/" node verify/check.mjs
