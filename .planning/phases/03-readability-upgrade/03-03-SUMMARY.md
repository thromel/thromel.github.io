---
phase: 03-readability-upgrade
plan: 03
subsystem: testing
tags:
  - playwright
  - readability
  - mobile
  - verification
requires:
  - phase: 03-01
    provides: raised shared reading floor across desktop and mobile selectors
  - phase: 03-02
    provides: readable About and Contributions page-local surfaces
provides:
  - "Dedicated Playwright coverage for readability hierarchy across Home, About, Learning, and Contributions"
  - "A mocked GitHub contribution response so async proof-surface hierarchy can be checked without live API dependence"
  - "Manual smoke guidance aligned to the same readability contract asserted in Playwright"
affects:
  - "Phase 3 readability upgrade"
  - "Phase 4 proof surfaces"
  - "Phase 5 verification hardening"
tech-stack:
  added: []
  patterns:
    - "Readability phases leave behind rendered-browser checks for desktop and mobile, not just static selector diffs."
    - "GitHub-driven proof surfaces may be mocked in browser tests when the phase goal is UI hierarchy rather than live API correctness."
key-files:
  created:
    - tests/readability-hierarchy.spec.js
  modified:
    - manual-testing-script.md
    - assets/css/overhaul.css
    - contributions.html
key-decisions:
  - "Mocked the GitHub search response in Playwright so the Contributions hierarchy test is deterministic and does not depend on rate limits or network timing."
  - "Kept fresh rendered verification on rebuilt `_site` output, using the Homebrew Ruby toolchain already required by this repo's locked Bundler version."
patterns-established:
  - "Readability regressions should assert minimum body-copy floors plus title/body/metadata separation on representative dense surfaces."
  - "Manual smoke guidance should mirror the automated readability checks across Home, About, Learning, and Contributions."
requirements-completed:
  - READ-01
  - READ-02
  - READ-03
duration: 3 min
completed: 2026-04-11
---

# Phase 3 Plan 03: Readability Verification Summary

**Phase 3 now has a repeatable browser contract for dense reading surfaces, including a deterministic async-state check for Contributions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-11T10:17:00Z
- **Completed:** 2026-04-11T10:19:35Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added [tests/readability-hierarchy.spec.js](/Users/romel/Documents/GitHub/thromel.github.io/tests/readability-hierarchy.spec.js) to assert readable body floors and title/body/metadata hierarchy on `Home`, `About`, `Learning`, and `Contributions` at desktop (`1280x720`) and mobile (`390x844`) breakpoints.
- Mocked the GitHub contributions query inside the Playwright spec so `contribution-meta`, `contribution-repo`, and stat-label hierarchy can be verified without live API flakiness.
- Updated [manual-testing-script.md](/Users/romel/Documents/GitHub/thromel.github.io/manual-testing-script.md) to include a dedicated Readability Hierarchy section and the new full-suite command.

## Verification

- `node -c tests/readability-hierarchy.spec.js` → passed
- `PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" bundle exec jekyll build` → passed
- `npx playwright test tests/readability-hierarchy.spec.js` → `2 passed`
- `npx playwright test tests/readability-hierarchy.spec.js tests/homepage-hierarchy.spec.js tests/navbar-layout.spec.js tests/shell-behavior.spec.js` → `11 passed`

## Task Commits

This plan was executed inline during the Phase 3 workstream, so no separate per-task commit was created before phase completion.

## Files Created/Modified

- `tests/readability-hierarchy.spec.js` - adds rendered-browser readability checks for desktop and mobile across the representative page set
- `manual-testing-script.md` - aligns manual smoke guidance with the readability contract and expanded representative page set
- `assets/css/overhaul.css` - auto-fixes a rendered-browser hierarchy gap in resource titles exposed by the first Playwright pass
- `contributions.html` - auto-fixes the repository-line hierarchy gap exposed by the first mobile Contributions Playwright pass

## Decisions Made

- Kept the readability contract in its own Playwright file instead of folding it into the broader shell suite.
- Treated the first failing rendered pass as a genuine hierarchy bug report and fixed CSS until the assertions held, rather than loosening the checks.

## Deviations from Plan

### Auto-fixed Issues

**1. Resource titles tied with resource descriptions**
- **Found during:** First `npx playwright test tests/readability-hierarchy.spec.js` run
- **Issue:** `resource-title` rendered at the same font size as `resource-description`, so title/body hierarchy was not actually visible
- **Fix:** Raised `resource-title` in `assets/css/overhaul.css` to `var(--text-lg)` with a clearer line-height
- **Files modified:** `assets/css/overhaul.css`
- **Verification:** `npx playwright test tests/readability-hierarchy.spec.js`

**2. Mobile contribution repository line tied with metadata**
- **Found during:** First `npx playwright test tests/readability-hierarchy.spec.js` run
- **Issue:** `contribution-repo` rendered at the same size as `contribution-meta` on mobile, weakening the title/body/metadata separation
- **Fix:** Raised `contribution-repo` in `contributions.html` to `var(--text-base)`
- **Files modified:** `contributions.html`
- **Verification:** `npx playwright test tests/readability-hierarchy.spec.js`

---

**Total deviations:** 2 auto-fixed
**Impact on plan:** Necessary correctness fixes surfaced by the new browser contract. No scope creep beyond making the planned readability hierarchy real in rendered output.

## Issues Encountered

- The repo still relies on a local Playwright install (`npm install --no-save @playwright/test`) rather than a committed toolchain manifest.
- Fresh local Jekyll builds still require `PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"` because the system Ruby cannot satisfy the locked Bundler requirement.

## User Setup Required

- For a fresh local verification, run `PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" bundle exec jekyll build` before Playwright.
- If Playwright is not already available locally, run `npm install --no-save @playwright/test`.

## Next Phase Readiness

- Phase `04` can now modernize proof surfaces with a concrete readability contract already guarding the current baseline.
- Phase `05` can formalize broader verification coverage on top of an existing page-level readability suite instead of starting from scratch.

---
*Phase: 03-readability-upgrade*
*Completed: 2026-04-11*
