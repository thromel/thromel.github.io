# Editorial Dossier UI/UX Overhaul

Date: 2026-07-06
Branch: cursor/complete-ui-ux-overhaul-6853

## Motivation

`assets/css/overhaul.css` had grown to ~4,800 lines of stacked theme passes (base, education, v1.1, modern, liquid glass, navbar refinement, research-lab, mobile remediation, graphite dark). Effective values depended on cascade order, dark mode was maintained as a monolithic override block full of `!important`, and several pages (`cv.html`, `blog/index.html`, `offline.html`, `404.html`, `_layouts/post.html`) still carried Bootstrap-era markup, inline style islands, or a separate `prompt` layout.

## Direction

One single-pass "editorial research dossier" design system:

- **Tokens**: one `:root` block and one `[data-theme="dark"]` block define the entire palette, typography scale, radii, and elevation. Light theme is warm paper (`#f6f5f1`) with ink text and an indigo accent (`#2340bd`) plus a rust secondary accent (`#9a4a20`). Dark theme is deep graphite-blue (`#0e1014`) with periwinkle (`#96acff`) and amber (`#e2a56b`) accents. No per-component dark overrides are needed beyond a handful of token-driven rules.
- **Typography**: Source Serif 4 for display/headings and entry titles, IBM Plex Sans for body, IBM Plex Mono for metadata, kickers, dates, tags, and stats — the mono metadata layer is what gives the dossier feel.
- **Shell**: sticky frosted header with the existing shellbar/brand/nav-rail/theme-toggle markup contract, icon-only mobile command bar, scrolled state via `.is-scrolled`.
- **Components**: all existing class contracts preserved (`.academic-*`, `.homepage-*`, `.project-feature-*`, `.contribution-*`, `.proof-*`, `.education-*`, `.research-lane-*`, `.showcase-*`, ctxhelm/PatchSmith proof boards, JS-injected `.contribution-item` timeline).

## Page convergence

- `cv.html`: inline style island removed; uses `.academic-link-row` chips and a canonical `.cv-preview` frame.
- `blog/index.html`: Bootstrap grid, inline styles, sidebar, and page-local scroll-to-top script replaced with canonical `.blog-entry` rows and `.blog-pagination`.
- `_layouts/post.html`: Bootstrap card replaced with a canonical `.post-article` reading column.
- `offline.html` and `404.html`: converged onto the shared `default` layout via a `.status-page` component; the standalone `prompt` layout and its animation-library CDN island were deleted.
- `_includes/navbar.html`: Home is only marked `aria-current` on the real homepage instead of every page without `navbar_title`.

## Verification

- `./scripts/verify-ui.sh full` passes 61/61 Playwright tests (Jekyll build + desktop/mobile shell, homepage hierarchy, readability, proof surfaces with mocked GitHub success/empty/error/rate-limit states, publications data/surfaces, education, navbar layout, SEO metadata, dark-mode contrast).
- Two `v11-overhaul` project-count assertions were relaxed from an exact 7 to >=7 because an eighth featured project (1BRC) had been added to content on main before this overhaul; those two tests were already failing on the base branch.
- The orphaned `tests/home-hero.spec.js` (referencing pre-v2 `.homepage-classic` markup, not part of verify-ui.sh) was removed.
- Curated screenshot evidence lives in `output/playwright/overhaul-v2-evidence/`; the full light/dark x desktop/mobile matrix across home, projects, contributions, publications, research, education, blog, posts, showcase, CV, offline, and 404 can be regenerated with `scripts/capture-screens.js`.

## Addendum 2026-07-07: Homepage v3 re-design

The homepage was rebuilt end to end (`index.html` plus the homepage layer in `overhaul.css`) after feedback that the first pass kept too much of the old structure:

- **Hero**: grid-paper backdrop, serif lede ("dependable agentic systems"), compact support copy, CTA chip row, live-status chips (now/IQVIA, UAlberta 2026, UIUC internship), and an offset-frame portrait.
- **Stats strip**: four evidence numbers (45K+ repos analyzed, OSS ecosystems from `site.data.contributions.highlights | size`, systems built from `site.data.profile.projects | size`, 4 research lanes).
- **Numbered sections** (01 Research → 08 Toolbox) with a shared `home-section-head` (kicker + heading + mono view-all link).
- **Research focus**: 4 numbered hover cards (kept `.homepage-snapshot-item` contract and the exact collaboration strings tests assert).
- **Selected work**: one full-width feature card (ICSE 2027 study with badge) + three vertical cards (kept `.academic-entry--selected` / `.homepage-entry-media` contracts).
- **Open source**: new section with 3 curated highlight cards + the existing live `#oss-summary` proof surface.
- **Experience/Education**: vertical timelines with accent nodes and 56px logo wells (kept `#homepage-work` / `#homepage-education` IDs and `.academic-entry` items; `homepage-selected-work.spec.js` logo thresholds updated for the smaller wells).
- **Projects**: horizontal media cards; **News**: mono date ledger; **Skills**: category/chips table; new closing **contact CTA band** with a solid primary button.
- `./scripts/verify-ui.sh full` still passes 61/61; homepage evidence lives in `output/playwright/home-v3-evidence/`.

## Addendum 2026-07-07: Ship-safety, motion, and site-wide polish

Follow-up pass after homepage v3 covered performance, motion, inner-page consistency, and footer closure:

- **Ship-safety**: kill-switch `sw.js` clears legacy service-worker caches and only reloads when caches existed; registration is skipped when no legacy worker is present. Added `robots.txt`, static `sitemap.xml`, homepage JSON-LD `Person` schema, CDN `preconnect`, and `loading="lazy"` / `decoding="async"` / `fetchpriority="high"` on images.
- **Motion**: scroll-reveal via `[data-reveal]` + `IntersectionObserver` in `site-shell.js`, staggered stats strip, hero entrance animation, card hover polish, and `prefers-reduced-motion` / no-JS guards.
- **Inner pages**: shared `.page-hero` intro pattern on research, publications, and contributions; `data-reveal` on major sections.
- **Footer**: closing band with tagline, status note, social links, secondary nav, and source link.
- **Verification**: `scripts/verify-ui.sh` now builds with `JEKYLL_ENV=production`, clears `_site` before build, and frees the test port before serving — `./scripts/verify-ui.sh full` passes 61/61.
