# Integrations Map

This site is mostly static, but it depends on several external services, CDNs, and browser APIs at runtime.

## CDN and Asset Integrations

- Google Fonts is loaded in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html) for `Plus Jakarta Sans` and `Source Serif 4`.
- Font Awesome is loaded from `cdnjs` in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html).
- Academicons is loaded from `cdnjs` in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html).
- Devicon is loaded from `jsdelivr` in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html).

## Analytics and Tracking

- Google Analytics `gtag.js` is embedded in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html).
- The configured measurement ID is `G-P0TDZ6WNVT` in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html).

## GitHub API Usage

- Homepage OSS count fetches from GitHub Search API in [`assets/js/oss-summary.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/oss-summary.js).
- Contributions page fetches pull request data from GitHub Search API in [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html).
- Both integrations are unauthenticated browser-side requests and are therefore subject to rate limits.
- When those requests fail, the UI falls back by hiding sections or showing an error state instead of using server-side cached data.

## Content and Identity Integrations

- Profile identity, outbound links, and contact data are sourced from [`_data/profile.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/profile.yml).
- Navigation structure is sourced from [`_data/navigation.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/navigation.yml).
- Homepage display flags are sourced from [`_data/display.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/display.yml).
- Footer links in [`_includes/footer.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/footer.html) point to GitHub, LinkedIn, Google Scholar, ORCID, and a local CV PDF.

## Browser Storage and APIs

- Theme preference is persisted with `localStorage` in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html) and [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js).
- Navigation history is stored in `sessionStorage` by [`assets/js/app-navigation.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/app-navigation.js).
- Intersection Observer is used in [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js) and [`assets/js/common.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/common.js).

## Build and Authoring Integrations

- Markdown parsing is handled by `kramdown` configured in [`_config.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_config.yml).
- Syntax highlighting uses `rouge` configured in [`_config.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_config.yml).
- CV compilation requires `pdflatex` through [`scripts/compile-cv.sh`](/Users/romel/Documents/GitHub/thromel.github.io/scripts/compile-cv.sh).
- Figure generation uses Python scripts under [`figures/`](/Users/romel/Documents/GitHub/thromel.github.io/figures), for example [`figures/generate_all_figures.py`](/Users/romel/Documents/GitHub/thromel.github.io/figures/generate_all_figures.py).

## Missing or Implicit Integrations

- [`README.md`](/Users/romel/Documents/GitHub/thromel.github.io/README.md) references `npx`-based audits, but there is no committed Node manifest that pins those tools.
- Legacy JavaScript in [`assets/js/common.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/common.js), [`assets/js/app-navigation.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/app-navigation.js), and [`assets/js/advanced-interactions.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/advanced-interactions.js) assumes jQuery and some Bootstrap-style APIs, but the current layout does not document where those runtime libraries are loaded.
