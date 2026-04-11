# UI Maintenance Guide

## Canonical Shared Layer

Treat these files as the current shared UI foundation:

- `assets/css/overhaul.css` — canonical shared stylesheet and design-token layer
- `assets/js/site-shell.js` — canonical shared shell behavior for theme, mobile nav, scroll progress, back-to-top, and homepage section pills
- `_layouts/default.html` — shared page shell and script loading path
- `_includes/navbar.html` — shared navigation markup and mobile drawer structure
- `_includes/footer.html` — shared footer and back-to-top control

If a UI change affects multiple pages, start here before touching page-local islands.

## Verification Commands

Use the repo-local runner for repeatable checks:

- `bash scripts/verify-ui.sh shell` — shell-focused browser regressions
- `bash scripts/verify-ui.sh full` — full UI regression suite

Current prerequisites:

- `npm install --no-save @playwright/test` if Playwright is not already present locally
- Homebrew Ruby 3.3 available at `/opt/homebrew/opt/ruby@3.3/bin` for the Jekyll build path this repo currently relies on

## Smoke Tooling

Browser-console smoke lives in `browser-console-tests.js`.

Recommended flow:

1. Run the Playwright path first with `bash scripts/verify-ui.sh shell` or `bash scripts/verify-ui.sh full`.
2. Open the target page in a browser.
3. Paste `browser-console-tests.js` into DevTools or run it as a saved browser snippet.
4. Call `testSite.runAll()`.

The console smoke should be used as a lightweight confirmation layer, not as a replacement for the Playwright suites.

## Proof Surfaces

The current GitHub-driven proof surfaces live in:

- homepage OSS summary via `index.html` and `assets/js/oss-summary.js`
- contributions proof surface via `contributions.html` and `assets/js/contributions.js`
- shared proof-state helpers in `assets/js/github-proof.js`

Key proof-surface anchors:

- `#oss-summary`
- `#oss-summary-status`
- `#contributions-proof`
- `#loading-state`
- `#error-state`
- `#empty-state`
- `#contributions-section`

When verifying proof surfaces, use:

- `tests/proof-surfaces.spec.js`
- the `Proof Surfaces` section in `manual-testing-script.md`
- `testSite.runAll()` from `browser-console-tests.js`

## Brownfield Guardrails

Do not casually extend or reintroduce the older parallel layers unless the task is explicitly about retiring or migrating them:

- `assets/js/theme-toggle.js`
- `assets/js/app-navigation.js`
- `assets/js/advanced-interactions.js`
- `assets/css/developer-theme.css`
- `assets/css/custom.css`

Why this matters:

- these files use older theme/navigation assumptions that do not match the current `data-theme` model
- several target `.navbar`-era selectors that do not match the canonical shared markup
- they increase the chance of duplicate toggles, selector drift, and conflicting shell behavior

## Practical Editing Rules

- Prefer converging page behavior onto `assets/css/overhaul.css` and `assets/js/site-shell.js` rather than creating new cross-page layers.
- Keep page-local styling and scripting islands contained unless the work is explicitly migrating them into shared assets.
- Verify desktop and mobile behavior for any shared shell change.
- Verify async GitHub states whenever a change touches the homepage OSS summary or `contributions.html`.

## Maintainer Routing

Use these files as the practical entrypoints:

- `manual-testing-script.md` — step-by-step manual verification path
- `browser-console-tests.js` — console smoke checks
- `scripts/verify-ui.sh` — repo-local verification runner
- `AGENTS.md` — project-specific guardrails for canonical shell ownership and brownfield warnings

## Deferred follow-ups

The items below are intentionally outside the v1 UI remediation milestone. Do not fold them into routine UI edits without opening a later milestone or explicit follow-up phase.

- `PLAT-01` in `.planning/REQUIREMENTS.md` is the place to formalize a committed toolchain manifest for Playwright, accessibility tooling, and performance tooling, then wire those checks into CI.
- The current repo-local runner (`bash scripts/verify-ui.sh full`) is the canonical local path today, but CI-backed verification belongs in the later platform milestone rather than in ad hoc UI cleanup work.
- legacy layers still need explicit retirement planning: `assets/js/theme-toggle.js`, `assets/js/app-navigation.js`, `assets/js/advanced-interactions.js`, `assets/css/developer-theme.css`, `assets/css/custom.css`, and remaining inline page islands should be removed or migrated in a dedicated pass.
- artifact hygiene also remains deferred work: generated LaTeX outputs, duplicate PDFs, and stray filesystem artifacts should be cleaned up alongside a clear ignore/build policy instead of being mixed into unrelated UI fixes.
- GitHub proof surfaces currently depend on unauthenticated browser-side API access. Any move toward cached, build-time, or server-assisted data architecture should be handled as explicit future work, not as a silent change inside shell maintenance.
