---
phase: 12
slug: dual-audience-overhaul
status: complete
verified: 2026-08-02
implementation_digest: a37eb723a613d716443435e68d52a2154eae6e52251930fae1346f8295d9bc1b
---

# Phase 12 Validation

## Result

ACCEPTED. The final frozen implementation passed the production suite and a second independent six-pillar UI audit with no remaining blocker or warning.

See `12-UI-REVIEW.md` for the complete initial-audit, remediation, and final-acceptance trail.

## Rendered interaction checks

- Desktop light and dark homepage rendering at 1280px and 1440px.
- Mobile homepage and research rendering at 320x800 and 390x844 with no horizontal overflow.
- Tablet rendering at 720px and 768px with the contracted 1px notebook rule and balanced columns.
- Mobile menu open, close, Escape, focus restoration, and JavaScript-off navigation.
- Research and Engineering audience paths, CV route, experience records, and contribution proof states.
- Light-theme paper/mineral palette and independently tuned dark theme.
- Theme-aware browser chrome, 44px component targets, intentional touch behavior, balanced headings, and pretty body wrapping.
- Live GitHub contribution success state with curated evidence retained as the primary proof surface.
- Production output excludes tests, internal documents, generated screenshots, manuscript tooling, and backup files.

## Automated evidence

`PATH="/Users/romel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/opt/ruby@3.3/bin:$PATH" PORT=4338 PLAYWRIGHT_WORKERS=2 npm run test:ui`

- 64 of 64 Playwright checks passed on the final implementation digest.
- No serious or critical Axe violations on core routes at phone and desktop widths.
- No horizontal overflow from 320px through 1440px on covered routes.
- Mobile Lighthouse passed LCP at or below 2.5 seconds and CLS at or below 0.1; real menu/theme interactions produced a field-compatible INP candidate at or below 200ms.
- Canonical CSS, JavaScript, image, and homepage-transfer budgets passed.
- Internal links, fragments, assets, new-tab protections and labels, sitemap, robots, legacy research routes, semantic dates, async states, JavaScript-off fallbacks, and production-output boundaries passed.

## Independent acceptance

- Frozen implementation digest: `a37eb723a613d716443435e68d52a2154eae6e52251930fae1346f8295d9bc1b`.
- Independent command: `PORT=4335 PLAYWRIGHT_WORKERS=2 scripts/verify-ui.sh full` — 64 of 64 passed.
- Final six-pillar score: 24 of 24.
- Final findings: 0 blockers, 0 warnings.
- Fresh evidence: 11 screenshots under `.planning/ui-reviews/12-20260802-second-audit/`.

## Important defect resolved during QA

The mobile navigation previously rendered open until the deferred shell script collapsed it, creating a slow-load layout shift. The HTML now starts closed only when the first-paint `js-enabled` contract is present; without JavaScript the same navigation remains visible and usable. Later audit cycles also caught and closed incomplete GitHub-result wording, stale project selectors, a 4px-versus-1px notebook-rule mismatch, public build-artifact leakage, and an over-broad technology label.
