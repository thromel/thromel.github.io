# Architecture Map

This codebase is a Jekyll-driven static portfolio with one canonical shared UI layer.

## Rendering Flow

1. Jekyll reads global config from `_config.yml`.
2. Pages such as `index.html`, `about.html`, and `contributions.html` select `_layouts/default.html`.
3. The default layout includes `_includes/navbar.html` and `_includes/footer.html`.
4. Liquid templates pull structured content from `_data/profile.yml`, `_data/navigation.yml`, `_data/research.yml`, and `_data/contributions.yml`.

## Canonical Shared Layer

- `_layouts/default.html` — head tags, theme bootstrap, shell CSS/JS
- `_includes/navbar.html` / `_includes/footer.html` — shared navigation shell
- `assets/js/site-shell.js` — theme preference, labelled mobile menu, skip-link focus, longform TOC, interaction timing
- `assets/js/contribution-count.js` — compact merged-PR count with graceful fallbacks
- `assets/css/overhaul.css` — sole design-token and component stylesheet
- `_includes/project-record.html`, `_includes/publication-record.html`, `_includes/secondary-record.html`, `_includes/case-study-summary.html`, `_includes/research-detail-summary.html` — archive and storytelling anatomy

## Page Composition

- `index.html` is a selective dual-audience homepage abstract driven by `_data/research.yml`.
- Primary routes: Research, Engineering (`projects.html`), Publications, Experience, CV.
- Secondary footer routes: Contributions, About, Education, Achievements, News, Learning, Posts.
- Showcase/case-study longform lives under `_showcase/projects/` via `_layouts/showcase.html`.
- Research summaries live under `research/` and may source structured detail metadata from `_data/research.yml` `detail_pages`.

## Retired Layers

Former parallel theme, navigation, reveal, widget, and full-PR-feed CSS/JS layers were removed. Do not reintroduce them. Treat `docs/ui-maintenance.md` as the active maintenance contract.
