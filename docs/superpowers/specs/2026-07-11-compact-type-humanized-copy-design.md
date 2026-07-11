# Compact typography and humanized copy design

**Date:** 2026-07-11  
**Status:** Approved design, awaiting written-spec review

## Objective

Reduce oversized headings throughout the site, keep the homepage name on one line at every supported width, and edit core public-facing copy so it reads like Tanzim wrote it rather than a generated portfolio summary.

The screenshots show two related problems. Global heading sizes make page titles and record titles dominate the content, and the homepage name wraps even though the available desktop width can hold it comfortably.

## Typography scale

Use one compact shared scale in `assets/css/overhaul.css`:

- `h1`: `clamp(2rem, 3.75vw, 3.25rem)`; maximum 52px.
- `h2`: `clamp(1.55rem, 2.4vw, 2.25rem)`; maximum 36px.
- `h3`: `clamp(1.15rem, 1.6vw, 1.45rem)`; maximum 23.2px.
- Phone `h1`: `clamp(1.9rem, 9vw, 2.6rem)`; maximum 41.6px.

Page-specific record selectors must not exceed the shared scale. Existing publication, project, contribution, education, experience, research-card, milestone, and homepage ledger selectors should be reduced where they currently override `h2` or `h3` with larger values.

Body text, navigation text, metadata, metrics, and button sizes stay unchanged unless a heading change exposes a local spacing problem.

## Homepage name

The homepage `h1` uses:

- `font-size: clamp(1.75rem, 3.4vw, 3rem)`; maximum 48px.
- `max-width: none`.
- `white-space: nowrap`.
- Slightly tighter letter spacing if needed to fit at 320px.

At 320px, the rendered heading must fit inside its content column without horizontal overflow. The name remains one visual line on desktop and mobile.

The header wordmark remains unchanged.

## Humanizer scope

Apply the humanizer to newly written or recently redesigned public-facing summary copy on:

- Homepage section headings, section introductions, identity summary, about copy, engineering summaries, recognition summaries, milestones, and contact text.
- Core route titles and introductions on About, Research, Publications, Projects, Contributions, CV, Education, Experience, Achievements, and News when the current wording is formulaic or editorially artificial.

Do not rewrite:

- Publication titles, paper abstracts, venue names, or submission statuses.
- Project titles or technical claims.
- Quantitative outcomes, dates, collaborator names, or publicity boundaries.
- Long-form research pages, project write-ups, blog posts, or CV source in this pass.

Humanized text should use first person where natural, prefer plain verbs, remove promotional phrasing, avoid repeated em dashes and forced lists of three, and keep technical claims precise. Copy should remain concise enough for the existing layout.

Examples of approved direction:

- `I study how AI agents behave in real software systems—what context they inspect...` becomes `I study AI agents in real software systems. I want to know what they read, which actions they take, how they recover from failures, and whether their evidence holds up.`
- `A builder who wants claims to leave receipts` becomes `I learn by building`.
- `Six connected lanes cover live-system evaluation...` becomes `My current work falls into six related areas.`
- `A compact currentness ledger for research, education, and professional direction` becomes `Recent changes to my research and academic plans.`

## Responsive behavior

- All supported routes must remain free of horizontal overflow from 320px through 1440px.
- Long degree, project, publication, and research titles may wrap naturally.
- Only the homepage personal name is forced to one line.
- The homepage must preserve text-before-portrait order on phones.
- Existing desktop and mobile navigation behavior remains unchanged.

## Verification

Add browser tests before implementation for:

- Shared `h1`, `h2`, and `h3` maximum computed sizes on representative routes.
- Education page title and degree-title sizes, matching the screenshot regression.
- Homepage name uses `white-space: nowrap`, renders as a single line at 320px, 390px, and 1440px, and fits its content box.
- Core routes remain free of horizontal overflow.
- Existing Axe, Lighthouse, transfer-budget, image, and no-JavaScript gates still pass.
- Humanized homepage copy is present and obsolete formulaic phrases are absent.

The authoritative final command remains `scripts/verify-ui.sh full`.

## Non-goals

- Changing the typefaces or color system.
- Shrinking body copy or navigation.
- Rewriting authored long-form articles.
- Changing site information architecture, routes, or data claims.
- Adding JavaScript to manage typography.

## Success criteria

The Education page and other secondary pages should no longer feel typographically oversized. Record titles should support the content rather than overpower it. The homepage name should read as a compact signature on one line, and the revised summary copy should sound direct, specific, and personal.
