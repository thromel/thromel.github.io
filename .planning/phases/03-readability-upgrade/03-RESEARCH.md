# Phase 3: Readability Upgrade - Research

**Researched:** 2026-04-11
**Status:** Ready for planning
**Planning mode:** Continue without `CONTEXT.md` using roadmap requirements, the Phase 00 audit, and implemented Phase 1/2 source as the decision baseline.

## Research Goal

Answer the planning question for Phase 3:

What does this repo need in order to make dense academic content comfortable to read on desktop and mobile without drifting into the broader proof-surface redesign planned for Phase 4?

## Current Readability Reality

### The shared text scale is still too compressed for dense content

- `assets/css/overhaul.css` defines:
  - `--text-sm: 12px`
  - `--text-base: 13px`
  - `--text-lg: 14px`
- Those values are reasonable for metadata, but several high-volume reading surfaces still use them as primary reading copy.
- The Phase 00 UI review explicitly called out homepage news cards, timeline cards, and metadata-heavy sections as too compressed for comfortable scanning.

### The smallest problem is not isolated to one page

Representative dense surfaces currently tied to the compressed scale:

- Homepage:
  - `.news-description`
  - `.timeline-description`
  - `.timeline-subtitle`
  - `.current-focus-card p`
  - `.project-description`
- Shared internal pages:
  - `.timeline-title`, `.timeline-date`, `.timeline-description`
  - `.resource-description`
  - `.learning-link-title`
  - `.skill-item`
  - `.section-subtitle`
- Page-local islands:
  - `about.html` uses inline `.about-bio` typography
  - `contributions.html` uses inline stat/meta/label sizing that still leans on small text tokens

Planning implication:

- Phase 3 cannot be solved only by raising one global token or only by tweaking one page. It needs one shared readability floor plus one pass over the densest surfaces and page-local typography islands.

### Phase 2 fixed pacing, not the reading floor

- Phase 2 already improved homepage hierarchy by:
  - reducing the hero action cluster
  - moving the portrait behind the copy on mobile
  - adding section-pill wayfinding and a calmer support band
- Phase 2 intentionally did not change the core reading scale across timelines, news, learning resources, or metadata-heavy surfaces.

Planning implication:

- Phase 3 should build directly on Phase 2’s calmer homepage rather than touching hero architecture again.

## Reusable Patterns Already In The Repo

### Most dense surfaces already converge through shared selectors

The shared stylesheet already owns the majority of readability-sensitive surfaces:

- `.timeline-*`
- `.news-*`
- `.project-description`
- `.learning-item*`
- `.resource-description`
- `.skill-item`
- `.section-title`
- `.section-subtitle`

Planning implication:

- Phase 3 should do as much work as possible in `assets/css/overhaul.css` and only touch page files when inline style islands override the shared floor.

### Mobile overrides already exist for dense components

`assets/css/mobile-optimizations.css` already contains targeted rules for:

- `.timeline-title`
- `.timeline-date`
- `.timeline-subtitle`
- `.timeline-description`
- `.project-description`
- `.skill-item`

Planning implication:

- Phase 3 should keep mobile readability changes in the existing mobile override layer instead of adding another responsive typography system.

## Boundaries That Matter

### Phase 3 should improve reading comfort, not redesign async-state behavior

In-scope:

- shared text token floor
- line-height tuning for dense copy
- clearer hierarchy between body text, subtitles, and metadata
- tighter but more legible spacing for timelines, news items, and dense cards
- page-local typography adjustments in `about.html` and `contributions.html` where shared selectors do not reach

Out-of-scope for this phase:

- redesigning OSS summary runtime behavior
- changing GitHub fetch logic or contributions state transitions
- migrating `contributions.html` onto a new shared card/token system
- revisiting homepage hero architecture or section-pill behavior

### Contributions belongs here only as a readability pass

- `contributions.html` still has page-local typography and inline style decisions.
- Readability can and should improve:
  - stats labels
  - loading/error/empty copy
  - repo/meta/label text
  - timeline item reading comfort
- The larger token/system convergence and async-state redesign still belongs to Phase 4.

Planning implication:

- Phase 3 should explicitly forbid behavioral GitHub changes and shared-system rewrites on the contributions page.

## Recommended Implementation Approach

### A. Raise the shared reading floor before touching individual pages

Recommended target state:

- Increase the lower end of the shared type scale so dense copy no longer defaults to metadata-sized text.
- Preserve an academic, restrained feel by keeping labels and badges smaller than body copy even after the floor rises.
- Retune line-height alongside font-size so the site feels easier to scan rather than merely larger.

Why:

- This is the only scalable way to improve the timeline, news, project, learning, and shared section surfaces together.

### B. Re-establish hierarchy inside dense cards and timelines

Recommended target state:

- Body descriptions read as body text.
- Subtitles read as secondary support, not as another metadata line.
- Dates and auxiliary metadata remain smaller, but no longer collapse into illegible 12px noise.
- Section subtitles and support copy remain visually subordinate to titles while staying comfortable to read.

Why:

- `READ-03` is about preserving hierarchy after the size increase, not just making everything bigger.

### C. Limit page-local work to the places shared selectors cannot fix

Recommended page-local targets:

- `about.html`
  - `.about-bio`
  - responsive bio sizing
- `contributions.html`
  - `.stat-label`
  - `.contribution-repo`
  - `.contribution-meta`
  - `.contribution-label`
  - loading/error/empty text blocks

Why:

- This keeps the phase focused and avoids turning Phase 3 into a broad page rewrite.

### D. Validate readability with rendered-browser assertions, not grep alone

Recommended validation surface:

- Add `tests/readability-hierarchy.spec.js`
- Cover representative pages and surfaces:
  - Home
  - About
  - Learning
  - Contributions
- Assert both:
  - minimum readable font floors on dense copy
  - relative hierarchy between titles, body text, and metadata

Why:

- Readability is partly token-level and partly rendered-browser behavior. The browser check is what protects Phase 3 from superficial “token changed, problem solved” work.

## Risks And Mitigations

### Risk: Raising the global floor makes pills, labels, and compact controls feel bloated

Mitigation:

- Limit the upward shift to reading-oriented tokens and selectors.
- Preserve explicit compact treatments for badges, pill labels, and microcopy when they are genuinely metadata.

### Risk: Phase 3 bleeds into Phase 4 on contributions/OSS work

Mitigation:

- Keep contributions changes strictly typographic and spacing-oriented.
- Do not change fetch logic, state sequencing, or async fallback behavior in this phase.

### Risk: Mobile readability improvements accidentally create oversized cards

Mitigation:

- Pair font-size increases with spacing review in `assets/css/mobile-optimizations.css`.
- Verify representative mobile surfaces in a rendered browser at `390x844`.

## Validation Architecture

### Automated Baseline

- Add a dedicated readability spec:
  - `tests/readability-hierarchy.spec.js`
- Keep existing regression coverage intact:
  - `tests/homepage-hierarchy.spec.js`
  - `tests/navbar-layout.spec.js`
  - `tests/shell-behavior.spec.js`

### Manual Baseline

- Expand `manual-testing-script.md` with:
  - homepage news and timeline readability checks
  - about-page longform reading checks
  - learning resource density checks
  - contributions stats/meta readability checks
  - desktop and mobile comparisons

## Planning Conclusion

Phase 3 should be planned as a typography-and-spacing convergence pass, not as a visual redesign. The repo already has:

- a stable shell and homepage pacing from Phases 1 and 2
- shared selectors that control most dense reading surfaces
- clear audit evidence that the current scale bottoms out too low

The right plan is to:

1. raise the shared reading floor,
2. apply that new floor deliberately to timelines, news, learning, project, and metadata-heavy surfaces,
3. patch the two main page-local typography islands (`about.html`, `contributions.html`), and
4. leave behind rendered-browser readability checks before Phase 4 changes the proof surfaces.
