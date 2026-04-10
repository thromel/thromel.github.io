---
phase: 02-homepage-hierarchy
plan: 01
subsystem: ui
tags:
  - homepage
  - hero
  - mobile
  - css
requires:
  - phase: 01-shell-convergence
    provides: canonical shared shell and responsive homepage section-nav runtime
provides:
  - "Intro-first homepage hero with `hero-kicker`, `hero-primary-actions`, and `hero-contact-row`"
  - "Mobile homepage hero that keeps text before the portrait without CSS reordering hacks"
  - "Calmer first-screen action hierarchy with Research and CV as the only primary actions"
affects:
  - "Phase 2 homepage hierarchy"
  - "Phase 3 readability upgrade"
  - "Phase 5 verification hardening"
tech-stack:
  added: []
  patterns:
    - "Homepage hero hierarchy now uses `hero-primary-actions` for primary exits and `hero-contact-row` for quieter secondary links."
    - "Mobile text-first scanning is preserved by DOM order and responsive layout, not `order: -1` overrides."
key-files:
  created: []
  modified:
    - index.html
    - assets/css/overhaul.css
    - assets/css/mobile-optimizations.css
key-decisions:
  - "Kept only `Research` and `CV` in the primary action row so the homepage no longer promotes every outbound path at the same weight."
  - "Removed portrait-first mobile overrides from the shared hero rules and reinforced text-first alignment with homepage-specific mobile tuning."
patterns-established:
  - "Homepage hero copy stays first in the DOM across breakpoints."
  - "Primary CTA rows stay small and explicit; email and profile links belong in softer secondary lanes."
requirements-completed:
  - HOME-01
  - HOME-02
duration: 6 min
completed: 2026-04-10
---

# Phase 2 Plan 01: Homepage Hero Summary

**Homepage hero now leads with message and copy first, with a reduced primary action row and a quieter secondary contact lane**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-10T13:00:31Z
- **Completed:** 2026-04-10T13:06:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added a new homepage hero kicker and split the old flat hero action cluster into `hero-primary-actions` and `hero-contact-row`.
- Kept `More about me` inline with the supporting copy while leaving the portrait as a secondary visual on desktop and a supporting visual below the copy on mobile.
- Removed the mobile portrait-first override and added homepage-specific mobile alignment so the hero reads left-to-right on desktop and top-to-bottom on phones.

## Verification

- `rg -n "hero-kicker|hero-primary-actions|hero-contact-row|/assets/pdf/cv\\.pdf|href=\\\"\\{\\{ 'research' \\| relative_url \\}\\}\\\"" index.html assets/css/overhaul.css` → passed
- `rg -n "order:\\s*-1" assets/css/mobile-optimizations.css` → no matches
- `npx playwright test tests/homepage-hierarchy.spec.js` → `2 passed`

## Task Commits

This plan was executed inline during the Phase 2 workstream, so no separate per-task commit was created before phase completion.

## Files Created/Modified

- `index.html` - refactors the homepage hero into an intro-first content stack with a distinct primary action lane and secondary contact row
- `assets/css/overhaul.css` - styles the calmer homepage hero hierarchy and its desktop/mobile spacing
- `assets/css/mobile-optimizations.css` - removes portrait-first mobile ordering and keeps the homepage hero left-aligned and text-first on phones

## Decisions Made

- Kept the homepage hero within the repo's existing intro/action vocabulary instead of inventing another homepage-only button system.
- Let the portrait remain a support element rather than converting it into a decorative top block on mobile.

## Deviations from Plan

None - plan intent and artifact scope were preserved.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The homepage now has a stable hero hierarchy that later pacing and readability work can build on.
- Phase `02-02` could safely group the support surfaces without fighting the old flat hero action cluster.

---
*Phase: 02-homepage-hierarchy*
*Completed: 2026-04-10*
