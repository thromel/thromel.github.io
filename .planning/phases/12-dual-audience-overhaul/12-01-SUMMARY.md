---
phase: 12
plan: 01
status: complete
completed: 2026-08-02
---

# Phase 12 Plan 01 Summary

## Objective

Research, specify, implement, and verify a complete dual-audience portfolio overhaul for professors and engineering recruiters without splitting the site into separate modes.

## Delivered

- Rebuilt the homepage as seven selective regions: identity, selected evidence, research agenda, engineering experience, publications/open-source proof, recent trajectory, and contact.
- Put the University of Alberta trajectory first, retained the exact research-interest family, stated about three years of professional experience and former IQVIA work, and kept GTA/GRA/GRAF out of the introduction.
- Replaced the old navigation model with a horizontal Research, Engineering, Publications, Experience, and CV shell plus an in-flow mobile disclosure and structured footer directory.
- Reworked the canonical visual layer in `assets/css/overhaul.css` around the approved field-notebook and evidence-ledger system, with independent light and dark palettes.
- Migrated research, publications, projects, experience, education, contributions, about, achievements, news, learning, posts, showcases, CV, 404, and offline surfaces onto the shared hierarchy.
- Added authoritative links for named institutions, employers, products, papers, repositories, collaborators, and evidence.
- Repaired missing images, broken research fragments, empty collection output, sitemap/robots domains, unsafe new-tab links, and legacy research compatibility routes.
- Made the GitHub contribution count single-flight, cancel-safe, timeout-aware, and useful across success, empty, rate-limit, error, timeout, retry, and JavaScript-off states.
- Removed 21 unreferenced legacy stylesheets, widget includes, data/PWA artifacts, and replaced the stale repository README and maintenance guidance.
- Fixed mobile implicit-grid collapse and a slow-first-paint navigation layout shift found during rendered QA.
- Refreshed the final pass against maintained Vercel, Anthropic, Impeccable, W3C, MDN, and web.dev guidance; added theme-aware browser chrome, intentional touch behavior, 44px component targets, balanced headings, and pretty body wrapping where applicable.
- Removed 53 obsolete Playwright screenshot artifacts and stopped the production build from publishing tests, internal docs, generated output, manuscript tooling, CSV sources, and backup files.
- Narrowed the experience working set to evidence-backed `SQL Server · MongoDB · AWS S3` and closed the final 1px notebook-rule mismatch.

## Canonical implementation files

- `index.html`
- `_layouts/default.html`
- `_includes/navbar.html`
- `_includes/footer.html`
- `_data/navigation.yml`
- `_data/research.yml`
- `assets/css/overhaul.css`
- `assets/js/site-shell.js`
- `assets/js/contribution-count.js`
- `research.html`
- `projects.html`
- `publications.html`
- `experience.html`
- `contributions.html`

## Verification evidence

- Production Jekyll build passed.
- `scripts/verify-ui.sh full` passed 64 of 64 browser checks with two workers on the final frozen implementation.
- Core routes produced no serious or critical Axe findings at phone and desktop widths.
- Covered routes have no horizontal overflow from 320px through 1440px.
- Mobile Lighthouse passed LCP at or below 2.5 seconds and CLS at or below 0.1.
- CSS, JavaScript, image, and homepage-transfer budgets passed.
- Internal links, fragments, assets, canonical metadata, sitemap, robots, new-tab safety, compatibility routes, async states, and JavaScript-off fallbacks passed.
- In-app browser checks covered desktop light, mobile dark, mobile menu open/close/Escape/focus restoration, audience routing, research records, experience, and live contribution success without console warnings or errors.
- The second independent six-pillar audit accepted the implementation at 24/24 with 0 blockers and 0 warnings; its separate 64/64 run and 11 fresh screenshots are recorded in `12-UI-REVIEW.md`.

## Known external dependency

The live merged-pull-request count uses GitHub's unauthenticated search API. Curated contribution records remain the primary proof and stay available whenever the live count cannot load.
