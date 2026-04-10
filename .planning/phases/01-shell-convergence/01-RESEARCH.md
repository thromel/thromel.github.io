# Phase 1: Shell Convergence - Research

**Researched:** 2026-04-10
**Status:** Ready for planning

## Research Goal

Answer the planning question for Phase 1:

What does this repo need in order to make the canonical shell the only live shared UI foundation without turning Phase 1 into a broad redesign?

## Current Runtime Reality

### The active shared shell is already narrow

- `_layouts/default.html` is the only shared layout loaded by top-level pages.
- `_layouts/default.html` loads `assets/css/overhaul.css`, `assets/css/mobile-optimizations.css`, `assets/js/site-shell.js`, and `assets/js/oss-summary.js`.
- `_includes/navbar.html` and `_includes/footer.html` define the active shared navigation, drawer, scroll progress bar, theme toggle, and back-to-top affordances.
- `assets/js/site-shell.js` already owns theme toggle behavior, mobile drawer behavior, scroll progress, back-to-top visibility, and homepage section navigation.

### The biggest active-path issue is theme initialization, not navigation markup

- `_layouts/default.html` currently bootstraps `data-theme` from `localStorage.theme` and otherwise forces `dark`.
- `assets/js/site-shell.js` also defaults to `dark`, and `initTheme()` immediately calls `applyTheme(readTheme())`.
- `applyTheme()` always writes the theme back to `localStorage`, so the repo currently persists the default on first load instead of persisting only a manual choice.
- This conflicts with locked decision `D-01`: first visit should follow system preference, then persist a manual override afterward.

### Legacy shell files are mostly dormant, but live page islands still leak old conventions

Repo-wide reference checks show no active imports for:

- `assets/js/theme-toggle.js`
- `assets/js/common.js`
- `assets/js/app-navigation.js`
- `assets/js/advanced-interactions.js`
- `assets/css/developer-theme.css`
- `assets/css/custom.css`
- `assets/css/search.css`
- `assets/css/syntax-highlighting.css`
- `assets/css/responsive-images.css`
- `assets/js/code-highlight.js`
- `_includes/critical-css.html`

That means Phase 1 does not need to migrate every legacy file into the canonical shell. It needs to keep them off the active path and eliminate the live places where old assumptions still affect rendered pages.

## Active Conflicts That Matter For Phase 1

### 1. Theme bootstrap and persistence are still wrong

Files:

- `_layouts/default.html`
- `assets/js/site-shell.js`

Observed conflict:

- The active shell uses `data-theme`, which is correct.
- The first-load behavior still forces dark mode and persists that forced default.
- The runtime does not distinguish between "resolved current theme" and "user override".

Planning implication:

- Phase 1 needs a two-path theme lifecycle:
  - Resolve current theme from saved override or `prefers-color-scheme`
  - Persist only explicit user toggles

### 2. A few live top-level pages still use old theme selectors or undefined token names

Files:

- `about.html`
- `contributions.html`

Observed conflict:

- `about.html` still uses `:root.light-theme` and `:root.dark-theme`.
- `about.html` and `contributions.html` both reference legacy variable names such as `--glass-bg`, `--glass-border`, `--accent-primary`, and `--font-size-*`, while the active shell stylesheet defines canonical tokens like `--color-*`, `--text-*`, `--space-*`, and `--radius-*`.

Planning implication:

- These two pages are in scope for Phase 1 only to the extent needed to stop top-level shared pages from depending on the old theme/token model.
- Deeper async-state redesign of `contributions.html` stays in Phase 4.

### 3. Dormant include/css assets still encode `.navbar` and root-class assumptions

Files:

- `_includes/critical-css.html`

Observed conflict:

- The file uses `.navbar`, `.navbar-brand`, and `:root.dark-theme` / `:root.light-theme`.
- It is not currently imported, so it does not block the active runtime.

Planning implication:

- Treat it as a dormant risk, not a primary runtime dependency.
- If the phase touches it at all, the goal should be to make it safe with canonical selectors or clearly quarantine it from future reuse.

## Recommended Implementation Approach

### A. Hard-cut the live theme runtime to one model

Recommended code direction:

- Keep `localStorage` key `theme`.
- Keep `<html data-theme="dark|light">` as the only live theme state.
- In `_layouts/default.html`, resolve first-load theme in this order:
  1. `localStorage.theme` if it is exactly `dark` or `light`
  2. `window.matchMedia('(prefers-color-scheme: dark)')`
  3. fallback `dark`
- In `assets/js/site-shell.js`, split:
  - theme resolution
  - theme application
  - persistence
- `initTheme()` should apply the resolved theme without automatically persisting it.
- `toggleTheme()` should persist the explicit user choice.
- `applyTheme()` should emit a `themeChanged` event after updating `data-theme` and the icon/button labels.

Why this is the right cut:

- It satisfies `D-01` and `D-02`.
- It does not preserve the root-class model.
- It lets future theme-aware utilities listen to one canonical event instead of reading legacy classes.

### B. Migrate only the live page-level shell leaks

Recommended Phase 1 page scope:

- `about.html`
- `contributions.html`

Recommended exact target state:

- Replace `:root.light-theme` / `:root.dark-theme` selectors with `[data-theme="light"]` / `[data-theme="dark"]`.
- Replace old variable names with canonical `overhaul.css` token names.
- Keep page logic and structure intact unless they directly block shell convergence.
- Do not turn Phase 1 into a large visual rewrite of contribution cards or about-page storytelling.

Why this is the right cut:

- It removes the remaining live top-level dependence on the old theme model.
- It honors `D-05` and `D-06`.

### C. Verify shell behavior on representative pages, not only home

Representative page matrix for Phase 1:

- `/`
- `/about`
- `/contributions`

Desktop checks:

- skip links exist
- theme toggle exists once
- desktop nav renders with canonical IDs/classes
- no contradictory `data-theme` state after toggle + reload

Mobile checks:

- drawer opens from `#mobileMenuToggle`
- overlay closes the drawer
- close button closes the drawer
- `Escape` closes the drawer when available
- back-to-top and scroll progress still appear/behave

Why this is the right cut:

- These pages exercise the active shell plus the most obvious page-level theme leaks.
- It creates a good Phase 1 boundary without absorbing the broader async-state work reserved for Phase 4.

## Files That Should Stay Out Of Phase 1 Unless New Evidence Appears

These files should be treated as dormant legacy paths for now:

- `assets/js/theme-toggle.js`
- `assets/js/common.js`
- `assets/js/app-navigation.js`
- `assets/js/advanced-interactions.js`
- `assets/css/developer-theme.css`
- `assets/css/custom.css`
- `assets/css/search.css`
- `assets/css/syntax-highlighting.css`
- `assets/css/responsive-images.css`
- `assets/js/code-highlight.js`

Reason:

- Current load-path searches do not show them being imported by the active shared layout.
- Spending Phase 1 effort migrating them would violate the phase boundary unless a representative page is found to load them.

## Risks And Mitigations

### Risk: first-load theme flicker or mismatch

Mitigation:

- Keep the inline bootstrap in `_layouts/default.html`.
- Make the inline bootstrap and `site-shell.js` use the same resolution rules.

### Risk: page-local CSS still relies on undefined legacy variables

Mitigation:

- Rewrite the live top-level page islands to canonical tokens instead of adding global token aliases.

### Risk: shell verification remains too manual

Mitigation:

- Reuse the existing Playwright test surface at `tests/navbar-layout.spec.js`.
- Add a representative shell-regression spec rather than introducing a new toolchain manifest in this phase.
- Reuse `browser-console-tests.js` and `manual-testing-script.md` as lightweight supporting checks.

## Validation Architecture

### Automated Baseline

- Existing automated test surface: `tests/navbar-layout.spec.js`
- Recommended Phase 1 expansion: add one shell-regression Playwright spec covering Home, About, and Contributions at desktop and mobile widths.
- Recommended automated command once the spec exists:
  - `npx playwright test tests/navbar-layout.spec.js tests/shell-behavior.spec.js`

### Browser-Level Smoke Support

- `browser-console-tests.js` already checks:
  - `#themeToggle`
  - `window.siteUX`
  - `#site-navigation`
  - `#mobileMenuToggle`
  - `#mobileNavDrawer`
  - loaded shell stylesheets
- Phase 1 should extend it to assert canonical `data-theme` behavior and absence of duplicate toggles.

### Manual Verification Layer

- Use `manual-testing-script.md` as the human smoke checklist.
- Phase 1 should keep that checklist focused on:
  - theme persistence
  - nav drawer
  - skip links
  - progress bar
  - back-to-top
  - Home / About / Contributions spot checks

## Planning Consequences

Recommended plan split:

1. `01-01` — Fix the active theme/bootstrap runtime so the canonical shell is the only live theme controller.
2. `01-02` — Remove live top-level page/include dependence on legacy theme selectors and token names.
3. `01-03` — Add representative shell verification for desktop and mobile behavior.

Recommended wave shape:

- Wave 1: `01-01`, `01-02`
- Wave 2: `01-03`

Reason:

- `01-01` and `01-02` can work in parallel if their write sets remain disjoint.
- `01-03` depends on the final shell behavior from both preceding plans.

---

*Phase: 01-shell-convergence*
*Research completed: 2026-04-10*
