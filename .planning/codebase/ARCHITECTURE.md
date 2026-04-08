# Architecture Map

This codebase is a Jekyll-driven static portfolio with a split architecture: a newer site shell for layout and theming, and an older interaction/theme stack that still exists in parallel.

## Rendering Flow

1. Jekyll reads global config from [`_config.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_config.yml).
2. Pages such as [`index.html`](/Users/romel/Documents/GitHub/thromel.github.io/index.html), [`about.html`](/Users/romel/Documents/GitHub/thromel.github.io/about.html), and [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html) select [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html).
3. The default layout includes [`_includes/navbar.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/navbar.html) and [`_includes/footer.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/footer.html).
4. Liquid templates pull structured content from [`_data/profile.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/profile.yml), [`_data/navigation.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/navigation.yml), and [`_data/display.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/display.yml).

## Current Shell Layer

- [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html) defines the current head tags, theme bootstrap script, shell CSS, and deferred JS entrypoints.
- [`_includes/navbar.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/navbar.html) owns desktop navigation, mobile drawer markup, and active state wiring.
- [`_includes/footer.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/footer.html) owns footer navigation, social links, and back-to-top markup.
- [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js) is the main shell controller for theme toggling, mobile drawer behavior, scroll progress, back-to-top visibility, and homepage section navigation.
- [`assets/css/overhaul.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css) is the main active design-token and component stylesheet.

## Legacy / Parallel UI Layer

- [`assets/js/theme-toggle.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/theme-toggle.js) implements a second theme system based on `dark-theme` and `light-theme` classes instead of `data-theme`.
- [`assets/js/app-navigation.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/app-navigation.js) assumes a `.navbar` structure and adds app-style route transitions, stack history, and gestures.
- [`assets/js/advanced-interactions.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/advanced-interactions.js) adds jQuery-driven effects, page transitions, and motion-heavy enhancements.
- [`assets/js/common.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/common.js) also creates scroll indicators, back-to-top buttons, and theme-transition hooks, overlapping with the newer shell.
- [`assets/css/developer-theme.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/developer-theme.css) and [`assets/css/custom.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/custom.css) use a different token system from [`assets/css/overhaul.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css).

## Page-Level Composition

- [`index.html`](/Users/romel/Documents/GitHub/thromel.github.io/index.html) is a hand-authored homepage composed of hero content, current-focus cards, an OSS summary container, news, publications, research, education, work, and project sections.
- [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html) is a client-rendered page that fetches GitHub data and injects contribution timeline cards at runtime.
- [`research.html`](/Users/romel/Documents/GitHub/thromel.github.io/research.html) and pages under [`research/`](/Users/romel/Documents/GitHub/thromel.github.io/research) represent a parallel content path for research landing pages outside collections.
- Blog content is routed through posts in [`_posts/`](/Users/romel/Documents/GitHub/thromel.github.io/_posts) and a listing page at [`blog/index.html`](/Users/romel/Documents/GitHub/thromel.github.io/blog/index.html).

## Content Architecture

- The site is data-heavy rather than CMS-backed.
- [`_data/profile.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/profile.yml) acts as the main source for hero content, positions, education, research, publications, links, and metadata.
- [`_showcase/projects/`](/Users/romel/Documents/GitHub/thromel.github.io/_showcase/projects) contains showcase items referenced from homepage and project views.
- Collections declared in [`_config.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_config.yml) provide output routing, while many top-level `.html` pages still contain bespoke markup and inline styling.

## Architectural Tension

- The current layout and shell use semantic IDs like `#site-navigation`, `#mobileMenuToggle`, and `data-theme`.
- Legacy code still targets `.navbar`, `.navbar-brand`, and root theme classes like `dark-theme`.
- The result is not a clean replacement architecture; it is a partially migrated system with both old and new assumptions still present in source.
