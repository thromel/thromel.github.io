---
phase: 05-verification-hardening
plan: 01
subsystem: testing
tags:
  - verification
  - playwright
  - shell
  - jekyll
requires:
  - phase: 04-proof-surfaces
    provides: deterministic browser verification and a proof-surface baseline to build on
provides:
  - "A repo-local UI verification runner that rebuilds, serves, and runs Playwright in shell or full modes"
  - "Expanded canonical shell browser coverage across Home, About, Learning, and Contributions"
  - "Automated checks for skip links, scroll progress, and back-to-top behavior"
affects:
  - "Phase 5 verification hardening"
  - "Milestone v1.0 completion"
tech-stack:
  added:
    - scripts/verify-ui.sh
  patterns:
    - "Repo-local browser verification should rebuild `_site`, serve static output, and run Playwright through one command."
    - "Shared shell regressions should assert canonical controls and affordances across representative shared pages."
key-files:
  created:
    - scripts/verify-ui.sh
  modified:
    - tests/shell-behavior.spec.js
key-decisions:
  - "Kept the repo on the current lightweight local-tooling model by failing clearly when `@playwright/test` is missing instead of auto-installing or adding a committed Node manifest."
  - "Expanded shell coverage only around shared-shell behavior so homepage hierarchy, readability, and proof-state checks remain owned by their dedicated suites."
patterns-established:
  - "Maintainers should start browser verification from `scripts/verify-ui.sh` in shell or full mode instead of reconstructing build-and-serve steps from memory."
  - "Shared shell tests in `tests/shell-behavior.spec.js` should cover canonical selectors such as skip links, `#site-navigation`, `#scrollProgress`, and `#backToTop`."
requirements-completed:
  - QUAL-01
duration: 2 min
completed: 2026-04-11
---

# Phase 5 Plan 01: Verification Runner Summary

**Repo-local UI runner plus shared shell browser coverage for skip links, scroll progress, and back-to-top behavior**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-11T12:13:04Z
- **Completed:** 2026-04-11T12:15:18Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created [scripts/verify-ui.sh](/Users/romel/Documents/GitHub/thromel.github.io/scripts/verify-ui.sh) as the repo-local verification entrypoint that builds the site, serves `_site`, and runs Playwright in `shell` or `full` mode.
- Expanded [tests/shell-behavior.spec.js](/Users/romel/Documents/GitHub/thromel.github.io/tests/shell-behavior.spec.js) to cover `Learning` as a representative shared-shell page while preserving the existing theme-toggle and mobile-drawer assertions.
- Added shared shell checks for skip links, navigation landmarks, scroll progress, and the back-to-top control so the canonical shell has broader desktop and mobile regression coverage.

## Verification

- `bash -n scripts/verify-ui.sh` → passed
- `node -c tests/shell-behavior.spec.js` → passed
- `rg -n "bundle exec jekyll build|python3 -m http.server|npx playwright test|case \"\\$MODE\"|shell|full" scripts/verify-ui.sh` → passed
- `rg -n "Learning|skip-link|scrollProgress|backToTop|mobile drawer|theme toggle" tests/shell-behavior.spec.js` → passed
- `bash scripts/verify-ui.sh shell` → `15 passed`

## Task Commits

This plan was executed inline during the Phase 5 workstream, so no separate per-task commit was created before phase completion.

## Files Created/Modified

- `scripts/verify-ui.sh` - adds the repeatable build, serve, and Playwright orchestration path for shell and full verification modes
- `tests/shell-behavior.spec.js` - expands canonical shell coverage to skip links, shared landmarks, scroll affordances, and the Learning page

## Decisions Made

- Kept the runner explicit about local prerequisites instead of auto-installing packages or pretending the repo already commits a Playwright toolchain manifest.
- Added only shared-shell assertions so the suite remains a shell contract rather than a catch-all page regression file.

## Deviations from Plan

None. The runner and shell-suite expansion landed as planned.

## Issues Encountered

None

## User Setup Required

- If Playwright is not already present locally, run `npm install --no-save @playwright/test`.
- Homebrew Ruby 3.3 must remain available at `/opt/homebrew/opt/ruby@3.3/bin` for the repo-local build path used by the runner.

## Next Phase Readiness

- Wave 2 can now document the runner and align manual smoke checks against the same canonical shell baseline.
- Future browser verification work can extend `scripts/verify-ui.sh` instead of inventing new ad hoc command sequences.

---
*Phase: 05-verification-hardening*
*Completed: 2026-04-11*
