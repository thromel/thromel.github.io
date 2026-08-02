# UI Maintenance Guide

## Canonical shared layer

- `assets/css/overhaul.css` — the single shared design system and responsive layout layer
- `assets/js/site-shell.js` — theme preference, labelled mobile menu, skip-link focus, shell readiness, and interaction timing
- `assets/js/contribution-count.js` — compact, retryable GitHub merged-PR count
- `_layouts/default.html`, `_includes/navbar.html`, `_includes/footer.html` — shared markup and first-paint theme setup
- `_includes/publication-record.html`, `_includes/project-record.html`, `_includes/experience-date.html` — canonical archive and date anatomy
- `_data/research.yml` — dual-audience homepage records, research agenda, evidence anchors, supporting systems, and collaboration copy
- `_includes/current-status.html` — ISO-range currentness rendered from `site.time`

Keep shared work in these files. The former parallel theme, navigation, reveal, widget, and full-PR-feed layers were retired. The shared header permanently exposes Research, Engineering, Publications, Experience, and CV; secondary routes live in the footer.

## Evidence and currentness

- Each research anchor must retain a question, status, context, ISO `last_verified`, and direct artifact links.
- SHIFT remains an abstract-level, non-public manuscript summary unless a public artifact is explicitly available.
- Positions use `start_date`, `start_label`, optional `end_date`/`end_label`, `end_date_exclusive`, and `display_date`. The deployed date comes from the static build, so `.github/workflows/refresh-pages.yml` rebuilds Pages daily.
- Contribution cards point to direct pull requests. The live count is supporting context only and must retain loading, success, incomplete, empty, rate-limit, error, timeout, and retry behavior, plus a useful JavaScript-off fallback.
- Project records require explicit problem, role, outcome, status, repository disclosure, date, methods, and a detailed evidence record.

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

The full suite validates desktop/mobile and light/dark behavior, JavaScript-off and blocked-shell fallbacks, audience paths, GitHub-count states, direct contribution proof, one-H1/date/image/static-new-tab semantics, internal and placeholder links, no serious/critical Axe violations, gzip/image/homepage-transfer budgets, mobile Lighthouse LCP/CLS, a PerformanceEventTiming-based INP candidate, and workflow contracts.

## CI

- `.github/workflows/ui-checks.yml` runs the locked Jekyll and Playwright suite on pull requests and `main`.
- `.github/workflows/refresh-pages.yml` triggers the legacy GitHub Pages build daily and on demand. It requires the repository to keep its current branch-based Pages source.
