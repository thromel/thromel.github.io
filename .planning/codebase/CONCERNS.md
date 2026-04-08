# Concerns Map

The main risk in this repo is not one broken file. It is the overlap of two UI systems plus several operational gaps around testing and artifact hygiene.

## 1. Parallel Theme and Shell Systems

- [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js) uses `data-theme` and expects a single built-in theme toggle button from [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html).
- [`assets/js/theme-toggle.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/theme-toggle.js) uses `dark-theme` and `light-theme` classes and can create an extra floating toggle button at runtime.
- [`assets/css/overhaul.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css) and [`assets/css/developer-theme.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/developer-theme.css) do not share the same token model.
- This makes theme-related regressions likely when touching navigation, color tokens, or page-level inline styles.

## 2. Legacy Selector Drift

- The active navigation markup in [`_includes/navbar.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/navbar.html) uses `.site-nav` and drawer IDs.
- Legacy JS in [`assets/js/app-navigation.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/app-navigation.js) and CSS in [`assets/css/custom.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/custom.css) still target `.navbar`, `.navbar-brand`, and Bootstrap-style structures.
- That mismatch suggests dead code, partially dead code, or hidden coupling that can resurface when legacy files are reintroduced.

## 3. Page-Level Inline Styling and Script Islands

- [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html) contains large inline `<style>` and `<script>` blocks and still uses legacy tokens like `--glass-bg`, `--glass-border`, and `--accent-primary`.
- [`about.html`](/Users/romel/Documents/GitHub/thromel.github.io/about.html) also includes page-local styles using the older token set.
- These pages are harder to refactor consistently than pages that fully rely on shared assets.

## 4. Runtime GitHub API Dependence

- [`assets/js/oss-summary.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/oss-summary.js) and [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html) depend on unauthenticated browser-side GitHub Search API calls.
- Those calls are rate-limited and can fail independently of site health.
- The site degrades gracefully, but the user experience is still partially controlled by external API quota and latency.

## 5. Testing and Toolchain Gaps

- The main automated test surface is just [`tests/navbar-layout.spec.js`](/Users/romel/Documents/GitHub/thromel.github.io/tests/navbar-layout.spec.js).
- There is no committed Node manifest for Playwright, axe, Lighthouse, or html-validate even though [`README.md`](/Users/romel/Documents/GitHub/thromel.github.io/README.md) documents those tools.
- This makes reproducing browser QA dependent on local environment state rather than the repository itself.

## 6. Artifact Hygiene

- Generated LaTeX outputs live beside source in [`_posts/`](/Users/romel/Documents/GitHub/thromel.github.io/_posts).
- Generated PDFs and duplicates also appear under [`assets/pdf/`](/Users/romel/Documents/GitHub/thromel.github.io/assets/pdf).
- Miscellaneous `.DS_Store` files exist in [`_includes/.DS_Store`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/.DS_Store) and [`assets/css/.DS_Store`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/.DS_Store).
- The dirty working tree already shows that generated artifacts can accumulate quickly.

## 7. Documentation Drift

- [`README.md`](/Users/romel/Documents/GitHub/thromel.github.io/README.md) describes a polished design system and Node-based tooling, but the current implementation is more transitional and relies on manual knowledge.
- Future work should treat the source tree, not the README, as the ground truth unless the README is updated in lockstep.
