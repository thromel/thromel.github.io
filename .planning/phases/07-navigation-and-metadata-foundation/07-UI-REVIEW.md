---
phase: 07
slug: navigation-and-metadata-foundation
reviewed: 2026-05-31
status: complete
overall_score: 19/24
---

# Phase 07 UI Review

Retroactive 6-pillar audit of the implemented navigation and metadata foundation on the current `main` worktree.

## Scorecard

| Pillar | Score |
|--------|-------|
| Copywriting | 3/4 |
| Visuals | 3/4 |
| Color | 3/4 |
| Typography | 4/4 |
| Spacing | 3/4 |
| Experience Design | 3/4 |

Overall: 19/24

## Context

Phase 07 intended to reduce the header to the strongest primary routes, keep secondary routes reachable, preserve active states, and add page-specific metadata source text. The latest implementation goes beyond the original UI-SPEC in two user-facing ways:

- The original UI-SPEC asked for slash separators and the theme toggle at the end of `#site-navigation`.
- The executed summaries and current code intentionally replace slash separators with compact icon labels, add a portrait-backed wordmark, and move the theme toggle into a separate `.academic-utility` group outside the route navigation.

This review grades the implemented/current contract rather than penalizing intentional later improvements as failures, but the stale UI-SPEC is itself a documentation drift finding.

## Evidence

- Screenshots captured to `.planning/ui-reviews/07-20260531-191348/`:
  - `home-desktop-light.png`
  - `home-tablet-light.png`
  - `home-mobile-light.png`
  - `contributions-mobile-dark.png`
  - `projects-desktop-dark.png`
- Screenshot metrics: no horizontal overflow at 1440px, 768px, or 390px; `#site-navigation #themeToggle` is absent; primary nav links are Home, Research, Publications, Projects, Contributions, CV; footer secondary links are About, Education, Work, Achievements, News, Learning.
- Clean deterministic Playwright pass: `PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:4179 npx playwright test tests/navbar-layout.spec.js tests/v11-overhaul.spec.js --workers=1` passed 17/17.
- Full verifier caveat: `./scripts/verify-ui.sh full` executed all 56 test bodies successfully, but exited nonzero because Playwright workers timed out during teardown. Treat this as verification hygiene debt, not a rendered UI failure.
- Registry audit: no `components.json`; no shadcn or third-party registry blocks to inspect.

## Pillar Findings

### 1. Copywriting - 3/4

WARNING: Navigation copy is clear and compact. The primary route labels are recognizable for an academic portfolio and the footer labels preserve reachability without reading like a full sitemap. Page description front matter is covered by source tests.

WARNING: The remaining generic proof error copy, `Unable to fetch contributions right now. Please try again later.`, is serviceable but not as useful as the rate-limit copy. It tells the visitor that data failed but does not point to the curated contribution proof already on the page.

Evidence:

- `_data/navigation.yml` defines the primary and secondary route vocabulary.
- `tests/navbar-layout.spec.js` verifies primary routes, secondary routes, active states, no slash dividers, and page descriptions.
- `contributions.html` and `assets/js/contributions.js` define loading, empty, error, and rate-limit copy.

Recommended fix:

- Change the generic contribution error copy to guide visitors toward the curated repository links and selected contribution proof, matching the stronger rate-limit copy.

### 2. Visuals - 3/4

WARNING: The route hierarchy is substantially improved. The header now separates identity, route navigation, and display utility; the route group is not a full sitemap; the footer carries secondary navigation; active states are visible.

WARNING: The header is now visually heavier than the original Phase 07 contract. The glass shell, wordmark, route rail, and utility control create a polished current theme, but they no longer match the older "lighter because fewer links" contract. This is acceptable for the latest theme direction, but the spec should be updated.

WARNING: On 390px mobile, the sticky header occupies about 138px before content begins. It is coherent and non-overflowing, but it takes a large portion of the first viewport for an academic dossier.

Evidence:

- `_includes/navbar.html` separates `.academic-brand`, `#site-navigation.academic-nav`, and `.academic-utility`.
- `assets/css/overhaul.css` defines `.academic-shellbar` and mobile header wrapping rules.
- Fresh screenshots show the header is legible on desktop/mobile and the theme toggle is not inside route navigation.

Recommended fix:

- Reduce mobile shell height by either compressing the two-row route grid or using a smaller sticky treatment after scroll.

### 3. Color - 3/4

WARNING: The current evergreen/fig palette is cohesive, readable, and distinct from generic blue/purple SaaS styling. Dark mode uses softer green and pink accents with verified contribution-card contrast.

WARNING: `assets/css/overhaul.css` contains multiple historical theme blocks before the final Liquid Glass override. The final cascade wins, but the file now carries several token eras, which raises future drift risk and makes audit-by-source harder.

WARNING: The active nav, focus/hover states, tags, proof links, and card accents use the same accent family frequently. It is controlled enough in screenshots, but the system should keep avoiding accent overuse as more surfaces are added.

Evidence:

- Final light/dark tokens are defined in `assets/css/overhaul.css`.
- `tests/v11-overhaul.spec.js` checks dark-mode contribution-card readability.
- Screenshots show no one-note hue dominance; the fig secondary accent breaks up the green foundation.

Recommended fix:

- Consolidate obsolete earlier token blocks or annotate the active theme boundary so future edits do not accidentally target superseded color systems.

### 4. Typography - 4/4

WARNING: No blocking typography issue found. The serif display face gives the portfolio an academic identity, the sans body copy is comfortable, and route labels remain scannable after wrapping. Mobile nav text drops to 12px only in the narrowest treatment, but it remains readable in the captured 390px screenshots.

Evidence:

- `assets/css/overhaul.css` keeps the main academic typography tokenized with serif headings and sans body/navigation text.
- `tests/readability-hierarchy.spec.js` is part of the full verifier and all readability test bodies passed during the full run.
- Screenshots show strong hierarchy from page title to route labels to body copy.

Recommended fix:

- Keep the 12px mobile route label as the floor; do not shrink further if another route is added.

### 5. Spacing - 3/4

WARNING: Horizontal spacing is robust. Captured desktop, tablet, and mobile metrics report no overflow, and footer links wrap cleanly.

WARNING: Vertical density is the main spacing issue. The mobile shellbar plus sticky header pushes main content to y=162px on a 390px viewport. The result is usable, but the first viewport loses too much vertical scanning space.

WARNING: There are many repeated and layered spacing declarations in `assets/css/overhaul.css` due to accumulated theme passes. The final rules are working, but future maintenance cost is higher than necessary.

Evidence:

- Screenshot metrics: `hasOverflow: false` for desktop, tablet, mobile, dark mobile, and dark desktop cases.
- `assets/css/overhaul.css` mobile rules set the shellbar to two rows and hide nav icons under 520px.
- `tests/shell-behavior.spec.js` contains mobile no-overflow assertions across representative pages.

Recommended fix:

- Tune the mobile header to reclaim 24-36px of vertical space while preserving the separated utility control.

### 6. Experience Design - 3/4

WARNING: Core navigation behavior is strong. Active states work for all primary routes, secondary routes remain reachable, skip links still target `#site-navigation`, and the theme preference persists.

WARNING: Async proof surfaces have loading, empty, error, and rate-limit states, and deterministic tests cover those cases. However, one live, unmocked Contributions shell smoke timed out during this audit. The test architecture still allows live GitHub behavior to influence a generic shell test.

WARNING: The full verifier reported 56 test bodies passed but returned nonzero because Playwright workers timed out during teardown. This creates reviewer uncertainty even when UI behavior is correct.

Evidence:

- `_includes/navbar.html` keeps semantic `nav` for routes and moves the theme toggle into a separate `role="group"` display preference control.
- `assets/js/site-shell.js` preserves theme persistence.
- `tests/navbar-layout.spec.js` and `tests/v11-overhaul.spec.js` passed 17/17 in a clean deterministic run.
- `assets/js/contributions.js` and `assets/js/oss-summary.js` contain explicit async state handling.

Recommended fix:

- Mock or block GitHub requests in generic shell tests and keep live API behavior only in dedicated/manual smoke checks.
- Investigate the Playwright worker teardown timeout so `./scripts/verify-ui.sh full` exits cleanly again.

## Top Fixes

1. Update the Phase 07 UI-SPEC or add a superseding note so the documented contract matches the current route shell: no slash separators, portrait wordmark allowed, and theme toggle outside `#site-navigation`.
2. Reduce mobile sticky header height. The current design is usable, but 138px is too much persistent chrome for the first viewport.
3. Stabilize verification by mocking GitHub in generic shell tests and resolving the Playwright worker teardown timeout.

## Files Audited

- `.planning/phases/07-navigation-and-metadata-foundation/07-UI-SPEC.md`
- `.planning/phases/07-navigation-and-metadata-foundation/07-01-PLAN.md`
- `.planning/phases/07-navigation-and-metadata-foundation/07-02-PLAN.md`
- `.planning/phases/07-navigation-and-metadata-foundation/07-03-PLAN.md`
- `.planning/phases/07-navigation-and-metadata-foundation/07-01-SUMMARY.md`
- `.planning/phases/07-navigation-and-metadata-foundation/07-02-SUMMARY.md`
- `.planning/phases/07-navigation-and-metadata-foundation/07-03-SUMMARY.md`
- `_data/navigation.yml`
- `_includes/navbar.html`
- `_includes/footer.html`
- `_layouts/default.html`
- `assets/css/overhaul.css`
- `assets/js/site-shell.js`
- `assets/js/contributions.js`
- `assets/js/oss-summary.js`
- `tests/navbar-layout.spec.js`
- `tests/shell-behavior.spec.js`
- `tests/v11-overhaul.spec.js`

## Human Review Flags

- `needs_human_review: true` - The current glass header is visually polished but more decorative than the original Phase 07 minimal academic contract. This is a product direction decision, not a mechanical pass/fail.
- `needs_human_review: true` - Mobile sticky header height is acceptable but may feel too heavy to some academic/research visitors.
