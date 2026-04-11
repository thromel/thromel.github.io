# Phase 5: Verification Hardening - Research

**Researched:** 2026-04-11
**Status:** Ready for planning
**Planning mode:** Continue without `CONTEXT.md` or `UI-SPEC.md`, using roadmap requirements, completed Phase 1-4 decisions, current verification assets, and current documentation as the decision baseline.

## Research Goal

Answer the planning question for Phase 5:

What does this repo need in order to leave behind a repeatable UI regression path and maintainer-facing guidance for the canonical shell and GitHub proof surfaces, without drifting into the v2 platform work around committed manifests or CI?

## Current Verification Reality

### The repo now has meaningful browser coverage, but the verification path is still scattered

The current repo already has five useful Playwright specs:

- `tests/navbar-layout.spec.js`
- `tests/shell-behavior.spec.js`
- `tests/homepage-hierarchy.spec.js`
- `tests/readability-hierarchy.spec.js`
- `tests/proof-surfaces.spec.js`

That is a strong improvement over the original state, but the workflow is still distributed across:

- a fresh Jekyll build command using the Homebrew Ruby 3.3 path
- a manual local server step
- ad hoc `npx playwright test ...` commands
- a separate manual smoke checklist
- a separate browser-console smoke file

Planning implication:

- Phase 5 should establish one repo-local verification entrypoint before adding more documentation layers. Right now the checks are real, but they are not yet packaged into a repeatable maintainer flow.

### Shared shell coverage still misses some core behaviors that only exist in manual or console smoke

`tests/shell-behavior.spec.js` already covers:

- one canonical theme toggle
- stored-theme persistence
- mobile drawer open/close behavior

But some still-important shared shell behaviors are only documented manually or in browser-console smoke:

- skip-link presence and target behavior
- scroll progress existence and response to scrolling
- back-to-top visibility and return-to-top behavior
- broader representative-page coverage beyond `Home`, `About`, and `Contributions`

Planning implication:

- Phase 5 should broaden shell regression coverage to the remaining shared behaviors rather than inventing a separate second shell test surface.

### Async-state verification exists, but the smoke tooling and docs are not yet aligned to the current proof-surface contract

The repo now has deterministic async-state coverage in `tests/proof-surfaces.spec.js`, and `manual-testing-script.md` already includes a dedicated `Proof Surfaces` section.

However:

- `browser-console-tests.js` still treats the homepage OSS area as a generic container existence check rather than the explicit proof-surface contract now used by the site
- the manual script still expects the maintainer to assemble the build, serve, and test steps manually
- the async-state verification flow is spread across several files rather than centered in a single maintainer-oriented guide

Planning implication:

- Phase 5 should align the console smoke tooling, manual smoke guidance, and maintainer docs around the actual proof-state model that Phase 4 introduced.

### Canonical shell guidance exists in AGENTS, but developer-facing docs still drift from repo reality

`AGENTS.md` is already clear about:

- the canonical shared CSS and JS layer (`assets/css/overhaul.css`, `assets/js/site-shell.js`)
- the shared layout/include boundaries
- the legacy theme/navigation files that should not be reintroduced
- the need to verify desktop/mobile shell and async GitHub states

But `README.md` still presents a more transitional or aspirational picture:

- it describes a "Liquid Glass" design philosophy rather than the repo's current canonical shell framing
- it implies a more formal Node/tooling story than the repo actually commits
- it does not currently act as the clearest maintainer onboarding path for the brownfield shell and verification model

Planning implication:

- Phase 5 should refresh the maintainer-facing documentation so the canonical shell and brownfield guardrails are discoverable outside the planning artifacts and AGENTS instructions.

### The phase boundary matters: Phase 5 should harden the workflow, not jump ahead to v2 platform work

The requirements already reserve this separate future platform scope:

- `PLAT-01`: committed toolchain manifest and CI-backed checks
- `PLAT-02`: broader platform/offline follow-up

Planning implication:

- Phase 5 should not promise a committed `package.json`, CI pipeline, or backend/service rewrite for GitHub data.
- The right level is a repo-local runner, broader in-repo browser coverage, and better documentation that makes the existing lightweight workflow reproducible.

## Reusable Patterns Already In The Repo

### The shell, hierarchy, readability, and proof-surface suites already establish the right testing style

The Playwright suites in the repo already demonstrate the accepted pattern:

- fixed desktop/mobile viewport pairs (`1280x720`, `390x844`)
- fallback page paths for Jekyll output
- DOM-state assertions instead of vague visual checks
- route mocking for GitHub-driven surfaces

Planning implication:

- Phase 5 should extend this current style rather than introducing a different testing framework or a second browser-test harness.

### Browser-console smoke is already accepted as a lightweight maintainer check

`browser-console-tests.js` is already structured as a quick, copy-pasteable DevTools smoke test surface.

Planning implication:

- Phase 5 can strengthen this file for current shell and proof-surface expectations instead of replacing it with heavier tooling.

### The repo already has the right documentation anchor points

The current maintainability surface is split across:

- `manual-testing-script.md`
- `README.md`
- `AGENTS.md`
- `.planning/codebase/TESTING.md`
- `.planning/codebase/CONCERNS.md`

Planning implication:

- Phase 5 should consolidate and cross-link these entrypoints around a small set of maintainer-facing truths:
  1. what the canonical shell is,
  2. how to run the UI regressions,
  3. how to verify async proof surfaces, and
  4. which legacy files or cleanup tasks are deferred and why.

## Boundaries That Matter

### In scope for Phase 5

- add a repo-local verification runner that packages the current Jekyll + Playwright flow into a repeatable command path
- expand shared shell/browser regression coverage for the remaining core responsive behaviors
- align manual smoke guidance and browser-console smoke tooling with the current proof-surface state model
- create maintainer-facing docs that explicitly identify the canonical shared shell and legacy layers to avoid
- document deferred cleanup and platform follow-ups without attempting to complete them now

### Out of scope for Phase 5

- committing a Node manifest or formalizing CI-backed browser/accessibility/performance checks
- rewriting all remaining legacy CSS/JS layers out of the repo
- changing the browser-side GitHub data model to a backend or build-time prefetch system
- bulk-cleaning the current worktree or performing unrelated artifact hygiene cleanup already outside the milestone

## Recommended Implementation Approach

### A. Introduce one repo-local verification runner first

Recommended target state:

- Add a shell runner such as `scripts/verify-ui.sh`
- Build the site with the currently required Ruby 3.3 path
- Serve `_site` locally in-process
- Run at least:
  - a shell-focused regression mode
  - a full UI regression mode
- Fail with clear instructions if `@playwright/test` is not already installed locally

Why:

- `QUAL-01` is about repeatability. Right now the commands are known, but they still live in maintainer memory rather than in one repo-local entrypoint.

### B. Expand shell coverage around the behaviors still checked manually

Recommended target state:

- Extend the shell regression suite to cover:
  - skip links
  - scroll progress
  - back-to-top
  - one more representative shared-shell page such as `Learning`
- Keep theme toggle and mobile drawer assertions in the same canonical shell test surface

Why:

- The repo already has real browser safety nets. Phase 5 should finish the shared shell baseline instead of inventing another scattered set of shell checks.

### C. Align async-state verification docs and smoke tooling with the current proof-surface contract

Recommended target state:

- Update `browser-console-tests.js` so it knows about the current proof-surface anchors and state model
- Update `manual-testing-script.md` to reference the repo-local runner and the proof-surface/browser-console flow
- Add one maintainer-oriented UI maintenance or verification guide that ties together shell commands, proof-surface checks, and brownfield warnings

Why:

- `QUAL-02` is not just about having tests. It is about giving maintainers a practical way to verify the GitHub-driven states without reverse-engineering the current setup.

### D. Refresh maintainer-facing docs, then explicitly route deferred work forward

Recommended target state:

- Refresh `README.md` to match the actual brownfield shell, verification, and local-development reality
- Point maintainers to the canonical shell files and the verification runner
- Document deferred follow-ups such as:
  - committed Node manifest + CI
  - broader legacy-layer retirement
  - artifact-hygiene cleanup

Why:

- `QUAL-03` is about preventing future drift. The repo should make it easy to find the right foundation and hard to accidentally treat stale README-era assumptions as truth.

## Risks And Mitigations

### Risk: Phase 5 accidentally expands into package-manager or CI platform work

Mitigation:

- Keep the runner shell-based and local-first.
- Document Playwright installation as a prerequisite instead of introducing a committed manifest that belongs to `PLAT-01`.

### Risk: Documentation work drifts into broad editorial rewrite

Mitigation:

- Limit README changes to shell/testing/maintainer setup sections.
- Put detailed brownfield guardrails in a focused maintainer doc rather than rewriting the whole top-level project narrative.

### Risk: README updates collide with existing unrelated local edits

Mitigation:

- Make README alignment its own execution plan and require careful read-first handling of the current file state before editing.
- Keep the execution scope to the sections directly relevant to verification and canonical shell guidance.

## Validation Architecture

### Automated Baseline

- shell-focused mode via a repo-local runner (to be added in Phase 5)
- full UI regression mode via the same runner
- existing Playwright suites retained:
  - `tests/navbar-layout.spec.js`
  - `tests/shell-behavior.spec.js`
  - `tests/homepage-hierarchy.spec.js`
  - `tests/readability-hierarchy.spec.js`
  - `tests/proof-surfaces.spec.js`

### Manual Baseline

- browser-console smoke via `browser-console-tests.js`
- `manual-testing-script.md`
- targeted proof-surface checks for homepage OSS summary and contributions
- explicit brownfield guidance in maintainer-facing documentation

## Planning Conclusion

Phase 5 should be planned as the convergence step that makes the current verification and documentation surfaces truly repeatable for maintainers. The repo already has:

1. a canonical shell,
2. meaningful Playwright coverage,
3. deterministic proof-surface tests, and
4. working manual smoke guidance.

What it still lacks is:

1. one repo-local command path for UI verification,
2. broader shell coverage for the remaining shared behaviors,
3. smoke tooling and docs that reflect the current proof-surface contract, and
4. maintainer-facing documentation that points clearly at the canonical shell and deferred cleanup/platform work.

The right Phase 5 plan is therefore:

1. add the repo-local verification runner and finish the shared shell regression baseline,
2. align async-state verification docs and smoke tooling with the current system, and
3. refresh maintainer docs plus deferred cleanup guidance without crossing into v2 toolchain formalization.
