# Conventions Map

This repo has a few strong conventions, but they are mixed with older patterns that have not been fully retired.

## Jekyll and Content Conventions

- Top-level pages use front matter with `layout`, `title`, and `navbar_title`, as seen in [`index.html`](/Users/romel/Documents/GitHub/thromel.github.io/index.html) and [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html).
- [`_data/navigation.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/navigation.yml) explicitly notes that `name` must match a page's `navbar_title` for active navigation highlighting to work.
- Content is centralized in [`_data/profile.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_data/profile.yml) instead of being spread across many page-local config files.
- Collections are declared in [`_config.yml`](/Users/romel/Documents/GitHub/thromel.github.io/_config.yml) and used for posts, publications, news, and showcase items.

## Current UI Conventions

- The current shell uses `data-theme="dark|light"` on the root element, set in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html) and controlled by [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js).
- Navigation markup uses semantic IDs and classes like `#site-navigation`, `#mobileMenuToggle`, `.site-header`, `.site-nav`, and `.nav-links` in [`_includes/navbar.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/navbar.html).
- The preferred active stylesheet appears to be [`assets/css/overhaul.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css) with token names like `--color-bg`, `--color-text-primary`, `--text-base`, and `--space-4`.

## Legacy UI Conventions Still Present

- Older styles and scripts use root classes like `:root.dark-theme` and `:root.light-theme`, especially in [`assets/css/developer-theme.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/developer-theme.css) and [`assets/js/theme-toggle.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/theme-toggle.js).
- Legacy tokens include `--accent-primary`, `--glass-bg`, `--glass-border`, `--text-muted`, and `--bg-tertiary`, visible in [`assets/css/developer-theme.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/developer-theme.css), [`assets/css/custom.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/custom.css), [`about.html`](/Users/romel/Documents/GitHub/thromel.github.io/about.html), and [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html).
- Older interaction files target `.navbar` and Bootstrap-like structures, especially [`assets/js/app-navigation.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/app-navigation.js) and [`assets/css/custom.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/custom.css).

## Authoring Conventions

- Large pages often include inline `<style>` and `<script>` blocks instead of moving all behavior into `assets/`, as seen in [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html) and [`about.html`](/Users/romel/Documents/GitHub/thromel.github.io/about.html).
- External links commonly use `target="_blank"` directly in page templates, for example in [`index.html`](/Users/romel/Documents/GitHub/thromel.github.io/index.html) and [`_includes/footer.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/footer.html).
- The repo stores authored LaTeX, generated PDFs, and generated logs side by side, particularly in [`_posts/`](/Users/romel/Documents/GitHub/thromel.github.io/_posts) and [`figures/`](/Users/romel/Documents/GitHub/thromel.github.io/figures).

## Practical Convention Summary

- Follow the current shell when changing global navigation, theme behavior, or layout composition.
- Treat [`assets/css/overhaul.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css) and [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js) as the default direction for new work.
- Expect to encounter legacy conventions during maintenance, because the repo is in transition rather than fully standardized.
