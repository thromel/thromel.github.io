#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MODE="${1:-full}"
PORT="${PORT:-4000}"
BASE_URL="http://127.0.0.1:${PORT}"
SERVER_PID=""
SERVER_LOG=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi

  if [[ -n "${SERVER_LOG}" && -f "${SERVER_LOG}" ]]; then
    rm -f "${SERVER_LOG}"
  fi
}

fail() {
  echo "verify-ui: $*" >&2
  exit 1
}

wait_for_server() {
  local attempts=0

  while (( attempts < 50 )); do
    if curl --silent --fail "${BASE_URL}/" >/dev/null 2>&1; then
      return 0
    fi

    sleep 0.2
    attempts=$((attempts + 1))
  done

  if [[ -n "${SERVER_LOG}" && -f "${SERVER_LOG}" ]]; then
    echo "verify-ui: local server failed to become ready. Recent server output:" >&2
    tail -n 40 "${SERVER_LOG}" >&2 || true
  fi

  return 1
}

trap cleanup EXIT

if [[ ! -d "${REPO_ROOT}/node_modules/@playwright/test" ]]; then
  fail "missing @playwright/test. Run 'npm ci' followed by 'npm run test:ui:install' first."
fi

if [[ ! -d "${REPO_ROOT}/_site" ]]; then
  :
fi

if [[ -d "/opt/homebrew/opt/ruby@3.3/bin" ]]; then
  export PATH="/opt/homebrew/opt/ruby@3.3/bin:${PATH}"
fi

command -v bundle >/dev/null 2>&1 || fail "bundle is not available in PATH."
command -v python3 >/dev/null 2>&1 || fail "python3 is not available in PATH."
command -v curl >/dev/null 2>&1 || fail "curl is not available in PATH."

case "${MODE}" in
  shell)
    SPECS=(
      "tests/research-first-shell.spec.js"
    )
    ;;
  full)
    SPECS=(
      "tests/research-first-shell.spec.js"
      "tests/research-dossier.spec.js"
      "tests/records-and-contributions.spec.js"
      "tests/secondary-routes.spec.js"
    )
    ;;
  *)
    fail "unsupported mode '${MODE}'. Use 'shell' or 'full'."
    ;;
esac

cd "${REPO_ROOT}"

echo "verify-ui: building site for mode '${MODE}'..."
rm -rf "${REPO_ROOT}/_site"
export JEKYLL_ENV=production
bundle exec jekyll build

SERVER_LOG="$(mktemp -t verify-ui-server.XXXXXX.log)"
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
elif command -v lsof >/dev/null 2>&1; then
  lsof -ti:"${PORT}" | xargs -r kill >/dev/null 2>&1 || true
fi
python3 -m http.server "${PORT}" -d "${REPO_ROOT}/_site" >"${SERVER_LOG}" 2>&1 &
SERVER_PID=$!

wait_for_server || fail "local _site server did not become ready on ${BASE_URL}."

echo "verify-ui: running Playwright suites for mode '${MODE}'..."
PLAYWRIGHT_TEST_BASE_URL="${BASE_URL}" npx playwright test "${SPECS[@]}"
