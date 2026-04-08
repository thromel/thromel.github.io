# Structure Map

This repository mixes site source, authored content, research artifacts, generated PDFs, and planning output in a single tree.

## Primary Top-Level Areas

- [`_config.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_config.yml): global Jekyll configuration, collections, plugins, and exclusions
- [`_data/`](/Users/romel/Documents/GitHub/thromel.github.io/_data): structured YAML content for profile data, navigation, books, learning, and display flags
- [`_layouts/`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts): shared page layouts, especially [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html)
- [`_includes/`](/Users/romel/Documents/GitHub/thromel.github.io/_includes): reusable fragments such as [`_includes/navbar.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/navbar.html) and [`_includes/footer.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/footer.html)
- [`assets/`](/Users/romel/Documents/GitHub/thromel.github.io/assets): CSS, JavaScript, images, and PDFs
- [`_posts/`](/Users/romel/Documents/GitHub/thromel.github.io/_posts): blog content plus LaTeX CV sources and generated LaTeX output files
- [`_showcase/`](/Users/romel/Documents/GitHub/thromel.github.io/_showcase): showcase markdown entries grouped under `projects`, `default`, and `cats`
- [`research/`](/Users/romel/Documents/GitHub/thromel.github.io/research): standalone research/project landing pages
- [`figures/`](/Users/romel/Documents/GitHub/thromel.github.io/figures): research figure sources, generated artifacts, and scripts
- [`tests/`](/Users/romel/Documents/GitHub/thromel.github.io/tests): browser-level regression checks
- [`scripts/`](/Users/romel/Documents/GitHub/thromel.github.io/scripts): helper scripts such as CV compilation

## Important Page Entry Points

- [`index.html`](/Users/romel/Documents/GitHub/thromel.github.io/index.html): homepage and highest-traffic custom page
- [`about.html`](/Users/romel/Documents/GitHub/thromel.github.io/about.html): biography-heavy page with inline styles
- [`experience.html`](/Users/romel/Documents/GitHub/thromel.github.io/experience.html): work history
- [`projects.html`](/Users/romel/Documents/GitHub/thromel.github.io/projects.html): projects landing page
- [`research.html`](/Users/romel/Documents/GitHub/thromel.github.io/research.html): research overview
- [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html): GitHub-backed contributions page
- [`learning.html`](/Users/romel/Documents/GitHub/thromel.github.io/learning.html): reading and learning content
- [`blog/index.html`](/Users/romel/Documents/GitHub/thromel.github.io/blog/index.html): paginated blog listing

## Styling and Behavior Files

- [`assets/css/overhaul.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css): largest and most current style surface
- [`assets/css/mobile-optimizations.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/mobile-optimizations.css): responsive overrides
- [`assets/css/developer-theme.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/developer-theme.css): legacy theme system
- [`assets/css/custom.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/custom.css): legacy layout and accessibility overrides
- [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js): current shell behavior
- [`assets/js/common.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/common.js): older shared interactions
- [`assets/js/app-navigation.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/app-navigation.js): app-style nav experiments
- [`assets/js/advanced-interactions.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/advanced-interactions.js): motion-heavy enhancements

## Content and Artifact Mixing

- [`_posts/cv.tex`](/Users/romel/Documents/GitHub/thromel.github.io/_posts/cv.tex) and related `.aux`, `.log`, `.out`, and `.pdf` files sit alongside normal blog posts in [`_posts/`](/Users/romel/Documents/GitHub/thromel.github.io/_posts).
- Generated CV outputs are also copied into [`assets/pdf/`](/Users/romel/Documents/GitHub/thromel.github.io/assets/pdf).
- Research paper figures, scripts, and summaries live together in [`figures/`](/Users/romel/Documents/GitHub/thromel.github.io/figures).
- Planning output currently lives under [`00-UI-REVIEW.md`](/Users/romel/Documents/GitHub/thromel.github.io/00-UI-REVIEW.md) and [`.planning/`](/Users/romel/Documents/GitHub/thromel.github.io/.planning).

## Structural Notes

- The source tree is not purely site source; it also functions as a workspace for authoring documents and figures.
- The repo contains some generated and duplicate files that are not fully excluded from source management, especially under [`_posts/`](/Users/romel/Documents/GitHub/thromel.github.io/_posts) and [`assets/pdf/`](/Users/romel/Documents/GitHub/thromel.github.io/assets/pdf).
- Vendor content exists under [`vendor/`](/Users/romel/Documents/GitHub/thromel.github.io/vendor), but it is excluded by Jekyll config and was not necessary for main site mapping.
