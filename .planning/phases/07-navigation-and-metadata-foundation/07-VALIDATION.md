---
phase: 07
slug: navigation-and-metadata-foundation
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-17
---

# Phase 7 - Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Playwright and source checks |
| Shell command | `bash scripts/verify-ui.sh shell` |
| Full command | `bash scripts/verify-ui.sh full` |
| Targeted specs | `tests/navbar-layout.spec.js`, `tests/shell-behavior.spec.js` |
| Fresh render command | `PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" bundle exec jekyll build` |
| Estimated runtime | 2-3 minutes for shell, 4-6 minutes for full |

## Sampling Rate

- After changing `_data/navigation.yml`, `_includes/navbar.html`, `_includes/footer.html`, or `assets/css/overhaul.css`, run `bash scripts/verify-ui.sh shell`.
- After changing page front matter, run `bundle exec jekyll build` and the metadata source check added in Plan 07-03.
- Before closing the phase, run `bash scripts/verify-ui.sh full`.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 07-01-01 | 01 | 1 | NAV-01, NAV-02 | source grep | `rg -n "primary_pages|secondary_pages|Publications|CV" _data/navigation.yml` | passed |
| 07-01-02 | 01 | 1 | NAV-02 | source grep | `rg -n "^description:" index.html research.html publications.html projects.html contributions.html cv.html experience.html about.html` | passed |
| 07-02-01 | 02 | 2 | NAV-01, NAV-03 | Playwright | `bash scripts/verify-ui.sh shell` | passed |
| 07-02-02 | 02 | 2 | NAV-02 | Playwright | `PLAYWRIGHT_TEST_BASE_URL="http://127.0.0.1:4000" npx playwright test tests/navbar-layout.spec.js` | passed |
| 07-03-01 | 03 | 3 | NAV-01, NAV-02, NAV-03 | full runner | `bash scripts/verify-ui.sh full` | passed |

## Manual-Only Verifications

| Behavior | Requirement | Test Instructions |
|----------|-------------|-------------------|
| Header feels compact | NAV-01 | Open `/`, `/projects`, and `/contributions` at desktop and mobile widths; confirm the header reads as a short route set rather than a sitemap. |
| Secondary routes remain discoverable | NAV-02 | Open the footer and verify About, Education, Work, Achievements, News, and Learning are visible and reachable. |
| Active state is intuitive | NAV-03 | Visit each primary route and verify only the matching header item receives the active state. |

## Validation Sign-Off

- [x] Navigation data grouping verified
- [x] Header and footer route rendering verified
- [x] Active-page state verified
- [x] Page description source verified
- [x] Full UI runner green before phase close
