# Phase 4: Proof Surfaces - Research

**Researched:** 2026-04-11
**Status:** Ready for planning
**Planning mode:** Continue without `CONTEXT.md` or `UI-SPEC.md`, using roadmap requirements, the Phase 00 audit, completed Phase 1-3 decisions, and current homepage/contributions source as the decision baseline.

## Research Goal

Answer the planning question for Phase 4:

What does this repo need in order to make the live GitHub-driven proof surfaces feel trustworthy, stable, and visually aligned with the canonical UI system, without drifting into broader platform/tooling work planned for Phase 5?

## Current Proof-Surface Reality

### The homepage OSS summary is success-only and silently disappears on failure

- `index.html` renders `#oss-summary` with `style="display: none;"`.
- `assets/js/oss-summary.js` only shows the block after a successful merged-PR count request.
- If the GitHub request fails, rate-limits, or returns zero merged pull requests, the section stays hidden and the catch block does nothing.
- The Phase 00 audit explicitly called out this behavior as a credibility problem near the top of the homepage.

Planning implication:

- Phase 4 must give the homepage proof surface a stable first-paint shell and explicit loading/fallback presentation. Hiding the whole surface until success is not acceptable anymore.

### Contributions has explicit states, but they are page-local and only loosely systematized

- `contributions.html` already has `loading`, `error`, `empty`, and `success` containers.
- The page still owns its CSS and JavaScript inline, so the behavior is isolated rather than part of a reusable proof-surface system.
- The runtime fetch/filter/render logic lives directly in the page and does not share helpers with `assets/js/oss-summary.js`.
- The current error state is generic. It does not distinguish between "GitHub unavailable/rate-limited" and other failures, and it does not leave behind reusable runtime hooks for other proof surfaces.

Planning implication:

- Phase 4 should keep the contributions page behaviorally familiar, but move it onto a more explicit shared state model and canonical token language.

### The repo already has the right visual direction, just not a shared async-state system

The current system already has:

- canonical shell styling in `assets/css/overhaul.css`
- a homepage support-stack card language that Phase 2 introduced
- a readability baseline from Phase 3
- deterministic Playwright patterns from the existing shell, homepage, and readability suites

What it does not have:

- shared async-state selectors for proof surfaces
- a shared GitHub proof runtime/helper layer
- page-specific browser tests for success, slow, empty, and failure states

Planning implication:

- Phase 4 should build on the existing card and token system rather than inventing a new proof-of-work visual language.

## Reusable Patterns Already In The Repo

### Shared homepage support surfaces already define the target visual language

`assets/css/overhaul.css` already gives the homepage support stack a coherent card treatment:

- `.home-support-stack`
- `.current-focus`
- `.news-widget`
- `.timeline-item`

Planning implication:

- The homepage OSS summary should be brought closer to this same raised-card/support-band rhythm instead of remaining a hidden inline-only fragment.

### Playwright route-mocking is already accepted in this repo

`tests/readability-hierarchy.spec.js` already mocks the GitHub search API for the contributions page.

Planning implication:

- Phase 4 can and should use route-based browser mocks for homepage and contributions proof states instead of depending on live GitHub availability.

### Contributions already exposes state anchors worth preserving

The page has stable DOM anchors:

- `#loading-state`
- `#error-state`
- `#empty-state`
- `#contributions-section`
- `#contributions-timeline`

Planning implication:

- Phase 4 should prefer evolving these into a clearer shared state model rather than renaming everything gratuitously.

## Boundaries That Matter

### In scope for Phase 4

- stable loading, success, empty, and failure presentation for homepage OSS summary and contributions
- shared proof-surface styling using the canonical token system
- moving page-local proof-surface runtime toward shared helpers and explicit state transitions
- deterministic rendered-browser coverage for proof-surface states
- manual smoke guidance for success, slow, and failure behavior

### Out of scope for Phase 4

- replacing browser-side GitHub fetches with a backend service or build-time prefetch pipeline
- adding CI-backed Playwright installation or a committed toolchain manifest
- broader verification/documentation cleanup beyond proof-surface checks
- homepage hero, readability, or shell redesign already completed in earlier phases

### Contributions should be modernized, not rewritten into a different product surface

- The page already does the basic job: fetch PRs, group by repo, and show merged/open work.
- The main gap is state clarity, shared styling, and maintainability.

Planning implication:

- Phase 4 should preserve the core data model and page purpose, while improving state handling and system convergence.

## Recommended Implementation Approach

### A. Introduce a shared proof-surface foundation first

Recommended target state:

- Add shared proof-surface and async-state selectors in the canonical CSS layer for:
  - proof-surface shell
  - loading/error/empty state panels
  - metric rows
  - auxiliary link rows
- Add a small shared GitHub proof helper in JavaScript for:
  - response classification
  - state switching
  - reusable message handling

Why:

- Without a shared foundation, the homepage and contributions implementations will keep drifting apart.

### B. Give the homepage OSS summary a stable shell instead of a hidden-on-failure block

Recommended target state:

- `#oss-summary` stays rendered on first paint.
- The runtime drives explicit `loading`, `success`, `empty`, and `error` states.
- Repo links remain useful even when the merged count cannot be fetched.
- Failure copy distinguishes "GitHub unavailable/rate-limited" from successful data.

Why:

- `OSS-01` and `OSS-03` are mostly about trust. The user should always see a coherent proof surface, not conditional disappearance.

### C. Move contributions onto the same state model and shared token language

Recommended target state:

- Page-local inline proof-surface runtime moves into a dedicated script file.
- Contributions states still map to loading/error/empty/success, but the transitions are explicit and testable.
- Stats, timeline, and support states all read as one shared proof surface.
- Rate-limit/unavailable failures tell the visitor what happened and still leave a useful next step.

Why:

- `OSS-02` is about consistent state presentation, not just data rendering.

### D. Verify with mocked success, slow, empty, and failure states

Recommended validation surface:

- Add `tests/proof-surfaces.spec.js`
- Mock the GitHub search API for both homepage and contributions
- Cover:
  - homepage success
  - homepage failure/rate-limit fallback
  - contributions slow-loading visibility
  - contributions success
  - contributions empty/failure states

Why:

- These flows are nondeterministic in live browsing. Phase 4 needs deterministic browser evidence to be safe.

## Risks And Mitigations

### Risk: The homepage proof surface becomes visually noisy again

Mitigation:

- Keep the OSS summary inside the Phase 2 support-band rhythm.
- Reuse subdued card and chip treatments instead of adding another accent-heavy banner style.

### Risk: Contributions behavior regresses while refactoring inline runtime into shared helpers

Mitigation:

- Keep the current data model: GitHub search request, merged/open filtering, grouping by repository.
- Change state handling and presentation architecture first; avoid changing the basic content model.

### Risk: The repo still depends on unauthenticated GitHub API limits

Mitigation:

- Make failure and rate-limit states explicit and useful.
- Use deterministic route mocks in Playwright so verification does not depend on live rate-limit conditions.

## Validation Architecture

### Automated Baseline

- Add `tests/proof-surfaces.spec.js`
- Keep the existing regression suites:
  - `tests/readability-hierarchy.spec.js`
  - `tests/homepage-hierarchy.spec.js`
  - `tests/navbar-layout.spec.js`
  - `tests/shell-behavior.spec.js`

### Manual Baseline

- Expand `manual-testing-script.md` with a dedicated proof-surfaces section
- Include explicit checks for:
  - homepage OSS summary first-paint stability
  - homepage fallback copy when GitHub is unavailable
  - contributions loading visibility during slow responses
  - contributions empty/error/success state clarity

## Planning Conclusion

Phase 4 should be planned as a shared async-state convergence pass for the site's two GitHub-driven proof surfaces. The repo already has the canonical shell, calmer homepage pacing, and a stronger readability baseline. What it still lacks is:

1. a reusable proof-surface presentation model,
2. a deterministic runtime state model for homepage and contributions,
3. explicit fallback behavior when GitHub is slow or unavailable, and
4. browser verification that proves those states work.

The right plan is to:

1. establish the shared proof-surface CSS and helper runtime,
2. modernize homepage OSS summary and contributions onto those primitives, and
3. leave behind mocked browser tests plus manual smoke guidance before Phase 5 formalizes broader verification and maintenance work.
