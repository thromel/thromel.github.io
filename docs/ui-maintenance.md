# UI Maintenance Guide

## Canonical shared layer

- `assets/css/overhaul.css` — the single shared design system and responsive layout layer
- `assets/js/site-shell.js` — theme preference, labelled mobile menu, and skip-link focus behavior
- `assets/js/contribution-count.js` — compact, retryable GitHub merged-PR count
- `_layouts/default.html`, `_includes/navbar.html`, `_includes/footer.html` — shared markup and first-paint theme setup
- `_data/research.yml` — research agenda, three evidence anchors, supporting systems, and collaboration copy
- `_includes/current-status.html` — ISO-range currentness rendered from `site.time`

Keep shared work in these files. The former parallel theme, navigation, reveal, and full-PR-feed layers were retired.

## Evidence and currentness

- Each research anchor must retain a question, status, context, ISO `last_verified`, and direct artifact links.
- SHIFT remains an abstract-level, non-public manuscript summary unless a public artifact is explicitly available.
- Positions use `start_date`, `end_date_exclusive`, and `display_date`. The deployed date comes from the static build, so `.github/workflows/refresh-pages.yml` rebuilds Pages daily.
- Contribution cards point to direct pull requests. The live count is supporting context only and must retain loading, success, empty, rate-limit, error, timeout, and refresh behavior.

## Verification

Install the locked tooling once:

```bash
npm ci
npm run test:ui:install
```

Then use:

```bash
npm run test:ui:shell  # shared shell contract
npm run test:ui        # complete browser, accessibility, performance, and release checks
```

The full suite validates desktop/mobile behavior, JavaScript-off content, GitHub-count states, direct contribution proof, no serious/critical axe violations, gzip/image/homepage-transfer budgets, and workflow contracts.

## CI

- `.github/workflows/ui-checks.yml` runs the locked Jekyll and Playwright suite on pull requests and `main`.
- `.github/workflows/refresh-pages.yml` triggers the legacy GitHub Pages build daily and on demand. It requires the repository to keep its current branch-based Pages source.
