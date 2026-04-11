---
phase: 05-verification-hardening
plan: 02
subsystem: testing
tags:
  - smoke
  - documentation
  - proof-surfaces
  - shell
requires:
  - phase: 05-01
    provides: repo-local verification runner and expanded shell coverage
provides:
  - "Console smoke checks aligned to the current shell and proof-state contract"
  - "Manual verification guidance that starts from the repo-local runner"
  - "A practical maintainer guide for canonical shell ownership and brownfield guardrails"
affects:
  - "Phase 5 verification hardening"
  - "Milestone v1.0 completion"
tech-stack:
  added:
    - docs/ui-maintenance.md
  patterns:
    - "Manual and console smoke verification should mirror the same proof-state anchors asserted in Playwright."
    - "Maintainer docs should name the canonical shell files directly and list the legacy layers that should not be extended casually."
key-files:
  created:
    - docs/ui-maintenance.md
  modified:
    - browser-console-tests.js
    - manual-testing-script.md
key-decisions:
  - "Made the repo-local runner the first step in the manual workflow so shell and proof-state verification start from one repeatable command path."
  - "Mirrored the canonical-shell and legacy-layer guidance from `AGENTS.md` into maintainer docs instead of creating a second conflicting narrative."
patterns-established:
  - "Console smoke should check concrete proof-surface anchors such as `#oss-summary-status`, `#contributions-proof`, `#loading-state`, `#error-state`, and `#empty-state`."
  - "UI maintenance guidance should route contributors to `assets/css/overhaul.css`, `assets/js/site-shell.js`, and `scripts/verify-ui.sh` before page-local experimentation."
requirements-completed:
  - QUAL-02
  - QUAL-03
duration: 3 min
completed: 2026-04-11
---

# Phase 5 Plan 02: Smoke And Maintainer Guide Summary

**Console smoke, manual verification, and maintainer docs now describe the same canonical shell and proof-surface contract**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-11T12:15:18Z
- **Completed:** 2026-04-11T12:18:05Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Updated [browser-console-tests.js](/Users/romel/Documents/GitHub/thromel.github.io/browser-console-tests.js) so the smoke checks cover current shell affordances plus the homepage and contributions proof-state anchors.
- Revised [manual-testing-script.md](/Users/romel/Documents/GitHub/thromel.github.io/manual-testing-script.md) so the manual flow starts from [scripts/verify-ui.sh](/Users/romel/Documents/GitHub/thromel.github.io/scripts/verify-ui.sh) and explicitly uses `testSite.runAll()` as the browser-console follow-up.
- Created [docs/ui-maintenance.md](/Users/romel/Documents/GitHub/thromel.github.io/docs/ui-maintenance.md) as the practical guide for canonical shell ownership, proof-surface verification, and brownfield guardrails.

## Verification

- `rg -n "oss-summary-status|contributions-proof|loading-state|error-state|empty-state|siteUX|scrollProgress|backToTop" browser-console-tests.js` → passed
- `rg -n "verify-ui.sh|testSite.runAll\\(\\)|Proof Surfaces|browser console|full UI regression|shell-focused browser regressions" manual-testing-script.md` → passed
- `rg -n "assets/css/overhaul.css|assets/js/site-shell.js|theme-toggle.js|app-navigation.js|developer-theme.css|custom.css|Proof Surfaces|verify-ui.sh|browser-console-tests.js" docs/ui-maintenance.md` → passed
- `bash scripts/verify-ui.sh full` → `25 passed`

## Task Commits

This plan was executed inline during the Phase 5 workstream, so no separate per-task commit was created before phase completion.

## Files Created/Modified

- `browser-console-tests.js` - updates console smoke coverage to current shell controls and proof-state anchors
- `manual-testing-script.md` - routes manual verification through the repo-local runner and browser-console smoke flow
- `docs/ui-maintenance.md` - provides the practical maintainer guide for canonical shell files, proof surfaces, and legacy-layer warnings

## Decisions Made

- Treated manual checks, console smoke, and Playwright as one aligned verification surface instead of three separate narratives.
- Kept the maintainer guide practical and file-specific so future contributors can orient themselves without reopening earlier phase decisions.

## Deviations from Plan

None. The smoke tooling and maintainer-guide layer landed as scoped.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The README can now point maintainers at one stable guide instead of describing transitional shell assumptions directly.
- Phase closeout can document deferred platform and cleanup work without re-explaining the canonical shell foundation.

---
*Phase: 05-verification-hardening*
*Completed: 2026-04-11*
