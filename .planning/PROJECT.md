# thromel.github.io

## What This Is

This is Tanzim Hossain Romel's personal academic and professional portfolio site, built as a Jekyll-powered static website. It showcases research, projects, work history, publications, writing, and open-source contributions for visitors evaluating his work, interests, and credibility.

The current project is a brownfield modernization effort. The site already works and already carries valuable content, but the UI system is partially split between a newer shell and older legacy layers, and the next scope is to make the experience more consistent, readable, and reliable.

## Core Value

Visitors can quickly understand Romel's work through a credible, readable, and consistent portfolio experience.

## Requirements

### Validated

- ✓ Visitors can browse a multi-page portfolio covering home, about, work, research, projects, achievements, news, contributions, and learning content — existing
- ✓ Visitors can read structured profile, research, publication, and project content rendered from Jekyll pages, collections, and data files — existing
- ✓ Visitors can use a responsive site shell with desktop navigation, mobile drawer navigation, skip links, theme toggle, scroll progress, and back-to-top affordances — existing
- ✓ Visitors can access downloadable CV and external identity links such as GitHub, LinkedIn, Google Scholar, and ORCID — existing
- ✓ Visitors can see GitHub-backed open-source contribution signals on the homepage and contributions page when the API is available — existing

### Active

- [ ] Unify shared pages and dynamic sections around the current shell and token system centered on `assets/css/overhaul.css` and `assets/js/site-shell.js`
- [ ] Improve homepage hierarchy, especially on mobile, so the message leads before decorative elements and action density is reduced
- [ ] Raise baseline typography and spacing for dense reading surfaces so news, timelines, and metadata-heavy sections are easier to scan
- [ ] Stabilize GitHub-driven UI blocks with clearer loading, fallback, and token-consistent presentation
- [ ] Retire, isolate, or replace legacy theme and navigation layers that conflict with the current shell
- [ ] Establish repeatable regression checks for shell behavior, major responsive layouts, and key async states

### Out of Scope

- Full content rewrite or personal rebranding — the current voice and information architecture are already strong enough to preserve
- Migrating the site to a JavaScript SPA or replacing Jekyll — brownfield remediation should preserve the existing static publishing model
- Adding new backend services, auth, or CMS infrastructure — current scope is presentation, consistency, and maintainability
- Expanding PWA capabilities beyond what already exists — not necessary to resolve the current audit and architecture concerns

## Context

The site is a Jekyll codebase with shared layouts in `_layouts/`, reusable partials in `_includes/`, structured content in `_data/`, authored content in `_posts/` and `_showcase/`, and page-specific entry points such as `index.html`, `projects.html`, `research.html`, and `contributions.html`.

A fresh codebase map exists under `.planning/codebase/` and identifies the most important architectural tension: the repo contains a newer site shell using `data-theme`, `assets/js/site-shell.js`, and `assets/css/overhaul.css`, but older parallel layers still exist in `assets/js/theme-toggle.js`, `assets/js/app-navigation.js`, `assets/js/advanced-interactions.js`, `assets/css/developer-theme.css`, and `assets/css/custom.css`.

A retroactive UI audit in `00-UI-REVIEW.md` scored the site `17/24` and identified three highest-impact gaps:

1. Dense reading surfaces are too small for comfortable scanning.
2. The homepage hero is visually crowded and loses hierarchy on mobile.
3. GitHub-driven sections, especially `contributions.html`, do not fully align with the current design system.

The repo is already in active use and already has unrelated local changes, so planning and execution must avoid destructive cleanup or broad resets.

## Constraints

- **Tech stack**: Stay compatible with the current Jekyll + static hosting model — major stack migration is out of scope for this initiative
- **Brownfield**: Preserve existing URLs, content assets, and data-driven content flows — the site is already live and valuable
- **Design direction**: Treat `assets/css/overhaul.css` and `assets/js/site-shell.js` as the canonical shared UI direction — this reduces further system drift
- **Runtime integration**: GitHub contribution surfaces currently depend on unauthenticated browser-side API calls — fallback behavior must remain graceful
- **Verification**: Testing infrastructure is lightweight, so every phase must include explicit browser-level validation for responsive and async states

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Initialize this repo as a brownfield GSD project | The codebase already exists, already ships value, and now has a codebase map to anchor planning | — Pending |
| Use the fresh codebase map and UI audit as the project brief | They already define the architectural baseline and the most important near-term problems | — Pending |
| Treat `overhaul.css` + `site-shell.js` as the canonical shared layer | The repo needs convergence, not another parallel styling or shell system | — Pending |
| Skip separate domain research during initialization | The immediate scope is a targeted brownfield remediation with enough local evidence already gathered | — Pending |
| Prioritize consistency, readability, and reliability before adding new portfolio features | The current bottlenecks are experience quality and maintainability, not missing surface area | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-09 after initialization*
