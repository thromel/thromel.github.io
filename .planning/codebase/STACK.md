# Stack Map

This repository is a static personal site built with Jekyll and served from GitHub Pages style infrastructure.

## Core Runtime

- Static site generator: `jekyll` from [`Gemfile`](/Users/romel/Documents/GitHub/thromel.github.io/Gemfile)
- Ruby dependency manager: Bundler via [`Gemfile.lock`](/Users/romel/Documents/GitHub/thromel.github.io/Gemfile.lock)
- Site configuration: [`_config.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_config.yml)
- Collections configured in [`_config.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_config.yml): `news`, `posts`, `publications`, `showcase`

## Ruby / Jekyll Dependencies

- `jekyll ~> 4.2.0` in [`Gemfile`](/Users/romel/Documents/GitHub/thromel.github.io/Gemfile)
- Plugins in [`Gemfile`](/Users/romel/Documents/GitHub/thromel.github.io/Gemfile): `jekyll-email-protect`, `jekyll-paginate`, `jekyll-feed`, `jekyll-seo-tag`
- Additional gems in [`Gemfile`](/Users/romel/Documents/GitHub/thromel.github.io/Gemfile): `webrick`, `kramdown-parser-gfm`, `csv`, `logger`, `base64`, `bigdecimal`

## Frontend Stack

- HTML pages with Liquid templating in [`index.html`](/Users/romel/Documents/GitHub/thromel.github.io/index.html), [`about.html`](/Users/romel/Documents/GitHub/thromel.github.io/about.html), [`projects.html`](/Users/romel/Documents/GitHub/thromel.github.io/projects.html), [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html), and related pages
- Shared layout in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html)
- Reusable partials in [`_includes/navbar.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/navbar.html) and [`_includes/footer.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/footer.html)
- Main current CSS layer: [`assets/css/overhaul.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css)
- Mobile and component CSS layers: [`assets/css/mobile-optimizations.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/mobile-optimizations.css), [`assets/css/components/oss-summary.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/components/oss-summary.css)
- Legacy CSS layers still present: [`assets/css/developer-theme.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/developer-theme.css), [`assets/css/custom.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/custom.css), [`assets/css/global.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/global.css)
- Current shell JavaScript: [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js)
- Legacy or parallel JavaScript layers: [`assets/js/theme-toggle.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/theme-toggle.js), [`assets/js/common.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/common.js), [`assets/js/app-navigation.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/app-navigation.js), [`assets/js/advanced-interactions.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/advanced-interactions.js)

## Content and Data Formats

- YAML data files in [`_data/profile.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/profile.yml), [`_data/navigation.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/navigation.yml), [`_data/display.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/display.yml)
- Markdown blog content in [`_posts/`](/Users/romel/Documents/GitHub/thromel.github.io/_posts)
- Markdown showcase content in [`_showcase/`](/Users/romel/Documents/GitHub/thromel.github.io/_showcase)
- Standalone research landing pages in [`research/`](/Users/romel/Documents/GitHub/thromel.github.io/research)
- LaTeX sources for CV and figures in [`_posts/cv.tex`](/Users/romel/Documents/GitHub/thromel.github.io/_posts/cv.tex), [`_posts/cv_software_engineer.tex`](/Users/romel/Documents/GitHub/thromel.github.io/_posts/cv_software_engineer.tex), and [`figures/`](/Users/romel/Documents/GitHub/thromel.github.io/figures)

## Browser / Platform Features

- Theme persistence via `localStorage` in [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js)
- Mobile drawer navigation and scroll affordances in [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js)
- GitHub API driven contribution summaries in [`assets/js/oss-summary.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/oss-summary.js) and [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html)
- PWA-adjacent assets in [`manifest.json`](/Users/romel/Documents/GitHub/thromel.github.io/manifest.json), [`sw.js`](/Users/romel/Documents/GitHub/thromel.github.io/sw.js), and [`offline.html`](/Users/romel/Documents/GitHub/thromel.github.io/offline.html)

## Tooling Observations

- There is no `package.json` or locked Node toolchain in the repo root.
- [`README.md`](/Users/romel/Documents/GitHub/thromel.github.io/README.md) mentions Node-based commands, but the repository currently behaves like a Ruby-first static site with ad hoc browser tooling.
- [`scripts/compile-cv.sh`](/Users/romel/Documents/GitHub/thromel.github.io/scripts/compile-cv.sh) assumes a local `pdflatex` installation and writes PDFs into `assets/pdf`.
