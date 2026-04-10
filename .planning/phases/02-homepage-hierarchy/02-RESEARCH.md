# Phase 2: Homepage Hierarchy - Research

**Researched:** 2026-04-10
**Status:** Ready for planning

## Research Goal

Answer the planning question for Phase 2:

What does this repo need in order to make the homepage communicate faster, especially on mobile, without drifting into the broader typography and async-state phases?

## Current Homepage Reality

### The first screen is content-rich but hierarchy-poor

- `index.html` currently renders the homepage hero as one dense cluster: name, tagline, two biography paragraphs, research-interest pills, four text links, five icon links, and a portrait.
- The DOM order in `index.html` already puts content before the portrait, but `assets/css/mobile-optimizations.css` reverses that on phones by applying `order: -1` to `.hero-image-wrapper`.
- The homepage therefore leads with the least informative element on mobile even though the actual source order is already better.

### Action density is the clearest hero-level problem

- The hero currently exposes:
  - one inline CTA inside the personal paragraph (`More about me`)
  - four text links in `.hero-links` (`email`, `meeting`, `research`, `CV`)
  - five icon-only links in `.hero-social`
- That produces too many first-screen exits before visitors have absorbed the site’s message.
- This directly matches the Phase 00 audit finding that the homepage mixes portrait, tags, four text actions, and five icon actions in one overloaded cluster.

### The page moves too quickly from one attention surface to the next

- The current homepage order is:
  1. hero
  2. current-focus panel
  3. GitHub-driven `oss-summary`
  4. recent news widget
  5. publications
  6. research
  7. education
  8. work
  9. projects
  10. learning
  11. technical skills
- There is no explicit wayfinding layer between the homepage intro and the long list of major sections.
- `assets/js/site-shell.js` already supports `.home-section-nav` active-pill behavior, but `index.html` does not currently render that markup and the homepage sections do not have matching anchor IDs.

## Reusable Patterns Already In The Repo

### Research and Projects already use a stronger intro model

- `research.html` and `projects.html` both use the `page-intro` pattern with:
  - a short kicker
  - a clear, high-signal headline
  - one explanatory paragraph
  - a small action row
- Those pages feel more intentional because the copy hierarchy is clearer and the action count is lower.

Planning implication:

- Phase 2 should move the homepage toward that structure rather than creating a third distinct homepage-only intro system.

### The CSS already contains dormant homepage-support patterns

`assets/css/overhaul.css` already defines:

- `hero-primary-actions`
- `hero-contact-row`
- `hero-proof-grid`
- `hero-proof-card`
- `home-section-nav`
- `section-pill`
- `hero-highlights`

Planning implication:

- Phase 2 can reuse existing class vocabulary and shell behavior instead of inventing new global tokens or new homepage-specific JavaScript.

## Boundaries That Matter

### Phase 2 should improve hierarchy, not solve every homepage issue

In-scope:

- hero narrative order
- action density
- portrait positioning
- spacing and pacing between the intro and the main sections
- homepage-specific wayfinding

Out-of-scope for this phase:

- site-wide typography retuning (`READ-*`, Phase 3)
- GitHub async-state redesign or fallback logic (`OSS-*`, Phase 4)
- shared shell/theme convergence (already handled in Phase 1)

### OSS summary can move spatially, but not behaviorally

- `assets/js/oss-summary.js` still hides the section completely when GitHub is unavailable.
- Phase 2 may reposition the summary inside a calmer homepage support stack.
- Phase 2 should not rewrite the fetch logic, add loading states, or redesign fallback behavior. Those belong to Phase 4.

## Recommended Implementation Approach

### A. Make the hero explicitly intro-first

Recommended target state:

- Keep the hero content before the portrait in both DOM order and mobile visual order.
- Introduce a clearer headline stack:
  - short kicker
  - name
  - concise supporting tagline
  - primary bio paragraph
- Keep the personal note and `More about me` as a secondary supporting line, not a peer to the main actions.

Why:

- This addresses `HOME-01` directly.
- It aligns the homepage with the stronger `page-intro` style already used elsewhere in the repo.

### B. Split primary actions from secondary contact paths

Recommended target state:

- Hero primary actions should be reduced to two high-signal destinations:
  - `Research`
  - `CV`
- Email, meeting, and social/profile links should move into a quieter secondary contact row below the primary actions.
- The hero should not present icon-only links as equal peers to the main CTA pair.

Why:

- This directly addresses `HOME-02`.
- It preserves the same destinations while lowering first-screen decision noise.

### C. Add explicit homepage wayfinding using the existing shell contract

Recommended target state:

- Add stable section IDs to the homepage’s major sections.
- Render `.home-section-nav` with `.section-pill` anchors for the primary scannable destinations:
  - `News`
  - `Publications`
  - `Research`
  - `Work`
  - `Projects`
  - `Skills`
- Reuse the existing `initHomeSectionNav()` behavior in `assets/js/site-shell.js`.

Why:

- This addresses `HOME-03` without adding new JavaScript.
- The repo already has both the CSS and shell behavior waiting for this markup.

### D. Create one calmer support band below the hero

Recommended target state:

- Treat `current-focus`, `home-section-nav`, and the existing `oss-summary` as one intro-support sequence instead of three disconnected interruptions.
- Keep `current-focus` as the first support surface.
- Keep `oss-summary` visually lightweight and behaviorally unchanged.
- Push the news widget below the wayfinding layer so the visitor gets orientation before the longer feed surfaces begin.

Why:

- This improves pacing without crossing into the Phase 4 proof-surface redesign.

## Risks And Mitigations

### Risk: Phase 2 accidentally creates another parallel homepage system

Mitigation:

- Reuse existing classes and patterns (`page-intro`, `hero-primary-actions`, `hero-contact-row`, `home-section-nav`) instead of adding a third independent hero vocabulary.

### Risk: Moving the OSS summary leaves awkward spacing when GitHub data is unavailable

Mitigation:

- Structure the support band so the summary can disappear without collapsing the surrounding rhythm.
- Keep layout spacing controlled by the parent support wrapper, not by the summary element alone.

### Risk: Mobile hero improvements regress the desktop composition

Mitigation:

- Use separate mobile rules in `assets/css/mobile-optimizations.css` for ordering and stacking.
- Keep desktop layout adjustments scoped under `.homepage-classic`.

## Validation Architecture

### Automated Baseline

- Add a dedicated homepage hierarchy spec rather than overloading the existing shell spec:
  - `tests/homepage-hierarchy.spec.js`
- Keep Phase 1 shell verification intact:
  - `tests/shell-behavior.spec.js`
  - `tests/navbar-layout.spec.js`

### Manual Baseline

- Expand `manual-testing-script.md` with:
  - mobile hero content-before-image checks
  - action-count sanity checks
  - section-pill navigation checks
  - first-scroll pacing checks between hero, current focus, news, and the long-form sections

## Planning Conclusion

Phase 2 should not invent a new homepage direction from scratch. The repo already contains the ingredients for a better answer:

- a stronger `page-intro` pattern on secondary pages
- dormant `home-section-nav` styles and shell behavior
- dormant `hero-primary-actions` and `hero-contact-row` patterns

The right plan is to converge the homepage onto those patterns, cut the first-screen action count, preserve content-first mobile order, and add lightweight wayfinding before the dense section stack begins.
