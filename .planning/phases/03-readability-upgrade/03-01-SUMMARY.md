---
phase: 03-readability-upgrade
plan: 01
subsystem: ui
tags:
  - readability
  - typography
  - mobile
  - css
requires:
  - phase: 02-homepage-hierarchy
    provides: stable homepage hierarchy and canonical shell layout
provides:
  - "Raised shared reading tokens to a 14px/15px/16px floor for `--text-sm`, `--text-base`, and `--text-lg`"
  - "Retuned dense shared selectors such as `section-subtitle`, `timeline-description`, `news-description`, and `project-description`"
  - "Aligned mobile and sub-375px overrides so the reading floor does not collapse on narrow phones"
affects:
  - "Phase 3 readability upgrade"
  - "Phase 4 proof surfaces"
  - "Phase 5 verification hardening"
tech-stack:
  added: []
  patterns:
    - "Dense body copy now reads from the shared `--text-base` floor instead of a metadata-sized token set."
    - "Mobile readability overrides may compress layout, but they must not shrink the shared reading floor below the Phase 3 threshold."
key-files:
  created: []
  modified:
    - assets/css/overhaul.css
    - assets/css/mobile-optimizations.css
key-decisions:
  - "Raised the shared text floor in the canonical stylesheet rather than patching individual pages with isolated font-size overrides."
  - "Fixed the hidden sub-375px token override in `overhaul.css` so the new floor survives the smallest-phone breakpoint."
patterns-established:
  - "Dense reading surfaces should default to at least `--text-base` with relaxed line-height, while metadata remains at `--text-sm` or below."
  - "Breakpoint-specific token overrides are part of the readability contract and must be checked when typography phases land."
requirements-completed:
  - READ-01
  - READ-02
duration: 2 min
completed: 2026-04-11
---

# Phase 3 Plan 01: Shared Readability Floor Summary

**The shared type system now has a real body-text floor, and the mobile layers no longer pull dense content back into metadata-sized copy**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-11T10:14:04Z
- **Completed:** 2026-04-11T10:15:59Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Raised the canonical text tokens in [assets/css/overhaul.css](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css) so shared body copy now starts from a readable 15px floor instead of 13px.
- Retuned dense shared selectors such as `section-subtitle`, `timeline-description`, `news-description`, `project-description`, `learning-section-copy`, and `resource-description` around the higher floor and calmer line-height.
- Updated [assets/css/mobile-optimizations.css](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/mobile-optimizations.css) so timeline, project, learning, and current-focus copy keep the same reading baseline on phones.

## Verification

- `rg -n -- "--text-sm:|--text-base:|--text-lg:|--leading-relaxed:|\\.section-subtitle|\\.timeline-description|\\.news-description|\\.project-description" assets/css/overhaul.css` → passed
- `rg -n "timeline-description|timeline-subtitle|project-description|skill-item|resource-description|learning-section-copy|current-focus-card p|news-description|learning-link-title" assets/css/mobile-optimizations.css assets/css/overhaul.css` → passed

## Task Commits

This plan was executed inline during the Phase 3 workstream, so no separate per-task commit was created before phase completion.

## Files Created/Modified

- `assets/css/overhaul.css` - raises the shared reading tokens and retunes dense shared selectors for body copy, subtitles, timelines, learning surfaces, and metadata hierarchy
- `assets/css/mobile-optimizations.css` - keeps the new readability floor intact on mobile and extra-small breakpoints

## Decisions Made

- Kept the readability pass anchored to the canonical token layer instead of inventing page-local typography systems.
- Treated the hidden 375px `:root` token override as part of the bug surface, because leaving it in place would have silently undone the phase goal on the narrowest phones.

## Deviations from Plan

### Auto-fixed Issues

**1. Hidden small-phone token override**
- **Found during:** Static verification after the first shared-token patch
- **Issue:** A later `@media (max-width: 375px)` block still dropped `--text-base` and `--text-sm` to `12px` and `11px`
- **Fix:** Raised that override to `14px` and `13px` so the new body floor survives on the smallest-phone breakpoint
- **Files modified:** `assets/css/overhaul.css`
- **Verification:** `rg -n -- "--text-base:|--text-sm:" assets/css/overhaul.css`

---

**Total deviations:** 1 auto-fixed
**Impact on plan:** Necessary correctness fix. No scope expansion beyond enforcing the planned shared readability floor.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Shared typography now has a stable floor, so page-local readability fixes can land without fighting contradictory token assumptions.
- Phase `03-02` could safely tune `About` and `Contributions` without re-opening the shared-scale decision.

---
*Phase: 03-readability-upgrade*
*Completed: 2026-04-11*
