# Phase 7: Navigation and Metadata Foundation - Research

**Researched:** 2026-05-17
**Status:** Ready for planning
**Planning mode:** Continue without `CONTEXT.md`; use roadmap, v1.1 research, current shell code, and user-approved UI-spec creation.

## Research Goal

Answer the planning question for Phase 7:

What does this repo need in order to make the academic shell navigation easier to scan while preserving route access and preparing metadata for the later SEO/social phase?

## Current Runtime Reality

### The header is a sitemap

`_data/navigation.yml` currently drives `_includes/navbar.html` with one flat `pages` list:

- Home
- About
- Education
- Work
- Research
- Projects
- Achievements
- News
- Contributions
- Learning

The rendered header is slash-separated and wraps, which matches the academic style, but it now exposes too many equal-weight routes. This is the issue Phase 7 should fix.

### The footer is too small to carry secondary routes

`_includes/footer.html` currently exposes only copyright, Email, and GitHub. That means moving routes out of the header would make them harder to reach unless the footer gains a secondary route row.

### Active-page state depends on route names

`_includes/navbar.html` marks a nav item current when `item.name == page.navbar_title`, with a fallback for Home. Any navigation data model must preserve a stable name that matches `navbar_title`, even if the display label changes.

### Publications is a first-class route but not in the current header list

`publications.html` has `navbar_title: Publications`, but `_data/navigation.yml` does not include a matching Publications item. A navigation cleanup should add Publications as a primary academic route.

### Page descriptions are inconsistent

Most top-level HTML pages have `layout`, `title`, and `navbar_title`, but not `description`. `_config.yml` has a generic `description: Personal Academic Homepage`. Phase 10 will handle actual SEO/social emission; Phase 7 only needs a reliable metadata source.

## Recommended Target State

### Navigation data

Split navigation into two groups while preserving backwards compatibility if useful:

- `primary_pages`: header routes for the first scan.
- `secondary_pages`: footer or secondary route row.

Recommended primary header:

- Home
- Research
- Publications
- Projects
- Contributions
- CV

Recommended secondary route row:

- About
- Education
- Work
- Achievements
- News
- Learning

Why:

- The header foregrounds work evidence: research, publications, projects, open source, CV.
- Existing pages remain reachable without turning the header into a full sitemap.
- The route set matches the current academic direction and upcoming Phase 8-10 work.

### Navigation rendering

Update `_includes/navbar.html` to prefer `site.data.navigation.primary_pages`, falling back to `pages` only if the new group is missing. Update `_includes/footer.html` to render `secondary_pages` in a second line.

Keep:

- `id="site-navigation"`
- `class="academic-nav"`
- slash-separated text links
- one theme toggle
- `aria-current="page"` logic tied to stable route names

### Metadata foundation

Add `description` front matter to core pages that will matter for SEO/social previews:

- `index.html`
- `research.html`
- `publications.html`
- `projects.html`
- `contributions.html`
- `cv.html`
- `experience.html`
- `about.html`

Do not complete all SEO tags in this phase. Phase 10 owns canonical/Open Graph/Twitter output. Phase 7 only makes the source data available.

## Existing Patterns To Reuse

- `_data/navigation.yml` already centralizes route labels and URLs.
- `_includes/navbar.html` already owns active-state rendering and the theme toggle.
- `_includes/footer.html` already uses the academic slash-separated style.
- `tests/navbar-layout.spec.js` and `tests/shell-behavior.spec.js` already test the shared shell with Playwright.
- `scripts/verify-ui.sh shell` already runs shell-focused checks.

## Risks And Mitigations

### Risk: Hidden pages become undiscoverable

Mitigation: add a visible footer route row and test that secondary links exist.

### Risk: Active page highlighting breaks for relabeled links

Mitigation: keep `name` as the stable `navbar_title` match field and use optional `label` only for display.

### Risk: Navigation cleanup becomes a full content IA rewrite

Mitigation: only regroup current routes. Do not rename pages, change URLs, or rewrite body content.

### Risk: Phase 7 duplicates Phase 10 SEO work

Mitigation: only add front-matter description sources and tests that the source exists. Do not implement full Open Graph/Twitter preview output here.

## Validation Architecture

### Automated Baseline

- `scripts/verify-ui.sh shell`
- `tests/navbar-layout.spec.js`
- `tests/shell-behavior.spec.js`

### New or Updated Checks

- Header contains the approved primary route set.
- Header does not contain secondary-only routes.
- Footer contains secondary route links.
- Active state works for Home, Research, Publications, Projects, Contributions, and CV.
- Core pages have `description:` front matter.

### Manual Check

Preview `/`, `/publications`, `/projects`, `/contributions`, `/cv`, and `/about` on desktop and mobile. Confirm the header reads as a compact academic nav and the footer clearly carries secondary routes.

## Research Complete

Phase 7 should create three plans:

1. Define navigation groups and page metadata sources.
2. Render primary/secondary navigation through the shared shell.
3. Add verification for route reachability, active state, and metadata readiness.
