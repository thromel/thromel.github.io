---
phase: 04-proof-surfaces
plan: 02
subsystem: ui
tags:
  - proof-surfaces
  - homepage
  - contributions
  - github
requires:
  - phase: 04-01
    provides: shared proof-surface selectors and GitHub proof helper
provides:
  - "An always-rendered homepage OSS proof surface with explicit loading, success, empty, and error states"
  - "A dedicated contributions runtime with explicit `loading`, `success`, `empty`, and `error` transitions"
  - "Useful fallback messaging and repository context for rate-limit and generic GitHub failures"
affects:
  - "Phase 4 proof surfaces"
  - "Phase 5 verification hardening"
tech-stack:
  added:
    - assets/js/contributions.js
  patterns:
    - "Proof surfaces remain visible even when GitHub is unavailable, instead of silently disappearing."
    - "Contributions runtime code now lives in a dedicated asset file rather than an inline page script island."
key-files:
  created:
    - assets/js/contributions.js
  modified:
    - index.html
    - assets/js/oss-summary.js
    - contributions.html
    - assets/css/overhaul.css
key-decisions:
  - "Kept repository links visible in both proof surfaces so failure states still leave the visitor with useful proof-of-work exits."
  - "Moved contributions retry behavior into the dedicated runtime and removed the old inline script instead of layering new logic on top of it."
patterns-established:
  - "Async proof surfaces should render a stable shell first, then swap state copy without collapsing the surrounding layout."
  - "GitHub failure handling should distinguish rate-limit guidance from generic outage copy when the UI can offer different next actions."
requirements-completed:
  - OSS-01
  - OSS-02
  - OSS-03
duration: 4 min
completed: 2026-04-11
---

# Phase 4 Plan 02: Homepage and Contributions Convergence Summary

**The two live GitHub surfaces now behave like part of the same system: they stay visible, classify failures explicitly, and preserve proof-of-work context**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-11T10:56:11Z
- **Completed:** 2026-04-11T11:00:10Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Replaced the old hidden-until-success OSS fragment in [index.html](/Users/romel/Documents/GitHub/thromel.github.io/index.html) with a persistent proof surface that exposes `#oss-summary-status`, shared `.proof-links`, and an initial `loading` state.
- Updated [assets/js/oss-summary.js](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/oss-summary.js) so the homepage summary now drives `loading`, `success`, `empty`, and `error` states explicitly and renders the required fallback copy when GitHub fails or rate-limits.
- Moved the contributions page off its inline runtime by creating [assets/js/contributions.js](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/contributions.js) and wiring [contributions.html](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html) onto the shared proof-surface markup.
- Preserved the existing merged/open filtering and repository grouping while making contributions stats, success rows, empty state, rate-limit state, and generic failure state all render through one explicit state machine.

## Verification

- `node -c assets/js/oss-summary.js` → passed
- `node -c assets/js/contributions.js` → passed
- `rg -n 'oss-summary-status|data-state="loading"|proof-links|GitHub data is unavailable right now|setProofState|classifyGitHubStatus' index.html assets/js/oss-summary.js assets/css/overhaul.css` → passed
- `rg -n "setContributionsState|renderContributionItem|loading-state|error-state|empty-state|contributions-section|GitHub is rate-limited right now|Unable to fetch contributions right now|assets/js/contributions\\.js|assets/js/github-proof\\.js|data-state=\"loading\"" contributions.html assets/js/contributions.js` → passed

## Task Commits

This plan was executed inline during the Phase 4 workstream, so no separate per-task commit was created before phase completion.

## Files Created/Modified

- `index.html` - converts the homepage OSS summary into a persistent proof surface with explicit state hooks
- `assets/js/oss-summary.js` - replaces hide-on-failure behavior with explicit proof-state transitions and fallback copy
- `contributions.html` - removes the inline runtime, applies shared proof-surface markup, and keeps the required state anchors
- `assets/js/contributions.js` - adds dedicated contributions state management, rendering, retry handling, and fallback classification
- `assets/css/overhaul.css` - promotes shared proof-state sub-element styling into the canonical layer so both surfaces can reuse the same markup

## Decisions Made

- Kept the homepage and contributions pages on the same `window.GitHubProof` classification path so they cannot drift into separate failure semantics again.
- Left repository links visible in both surfaces because a trustworthy failure state still needs a usable next action.

## Deviations from Plan

### Auto-fixed Issues

**1. Shared proof-state sub-elements were still homepage-scoped**
- **Found during:** Wave 2 integration while moving contributions onto the shared proof-surface markup
- **Issue:** `proof-state-icon`, `proof-state-copy`, `proof-state-label`, and `proof-state-text` only had homepage OSS component styling, which would have left the contributions state containers with incomplete shared presentation
- **Fix:** Promoted the shared proof-state sub-element styling into `assets/css/overhaul.css` while keeping homepage-specific refinements in the component stylesheet
- **Files modified:** `assets/css/overhaul.css`
- **Verification:** `rg -n "proof-state-icon|proof-state-copy|proof-state-label|proof-state-text" assets/css/overhaul.css assets/css/components/oss-summary.css`

**2. Homepage proof runtime assumed a parseable JSON body on every response**
- **Found during:** Static hardening before browser verification
- **Issue:** Early JSON parsing could have short-circuited rate-limit or generic failure classification when GitHub returned an unexpected body
- **Fix:** Added tolerant JSON parsing in the homepage and contributions runtimes so classification stays in control of failure handling
- **Files modified:** `assets/js/oss-summary.js`, `assets/js/contributions.js`
- **Verification:** `node -c assets/js/oss-summary.js && node -c assets/js/contributions.js`

---

**Total deviations:** 2 auto-fixed
**Impact on plan:** Necessary hardening to make the shared proof-state model actually reusable and failure-tolerant. No product-scope expansion.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both GitHub-driven surfaces now expose stable DOM states that Playwright can verify deterministically.
- Phase `04-03` could move directly into mocked browser verification instead of depending on live GitHub uptime.

---
*Phase: 04-proof-surfaces*
*Completed: 2026-04-11*
