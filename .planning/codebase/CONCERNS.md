# Concerns Map

Active maintenance risks after the Phase 12 overhaul and v2.1 Depth & Continuity work.

## 1. External GitHub Count Dependence

- `assets/js/contribution-count.js` still depends on unauthenticated browser-side GitHub Search API calls.
- Curated contribution highlights remain the primary proof; the live count is supporting context only.
- Preserve loading, success, incomplete, empty, rate-limit, error, timeout, retry, and no-JS fallback behavior.

## 2. Evidence Currency

- Research anchors, contribution highlights, and homepage selected evidence must stay aligned with real artifacts and ISO `last_verified` dates.
- SHIFT must remain abstract-only unless a public manuscript artifact is explicitly available.
- Current-role rendering depends on build-time `site.time` plus the daily Pages refresh workflow.

## 3. Format Drift

- Keep secondary indexes on `_includes/secondary-record.html`.
- Keep featured engineering deep pages on the case-study front-matter contract and `_includes/case-study-summary.html`.
- Keep research summaries that need structured methods/artifacts on `_data/research.yml` `detail_pages` plus `_includes/research-detail-summary.html`.
- Do not reintroduce parallel theme, navigation, card-dashboard, or full live-PR-feed layers.

## 4. Verification Expectation

- Use the committed Node toolchain: `npm ci`, `npm run test:ui:install`, then `npm run test:ui`.
- CI is defined in `.github/workflows/ui-checks.yml`.
- Offline/PWA expansion remains deferred; do not revive a web app manifest without an explicit product decision.
