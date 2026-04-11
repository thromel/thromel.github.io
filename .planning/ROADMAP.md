# Roadmap: thromel.github.io

## Overview

This roadmap turns an already-working portfolio site into a more coherent brownfield system. The first milestone is not about adding new product breadth; it is about converging the shared shell, fixing the highest-impact UI audit findings, stabilizing GitHub-driven proof surfaces, and leaving behind verification artifacts that make future UI work safer.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Shell Convergence** - Make the current shell the only shared UI foundation (completed 2026-04-10)
- [x] **Phase 2: Homepage Hierarchy** - Simplify the homepage first impression and restore mobile-first clarity (completed 2026-04-10)
- [x] **Phase 3: Readability Upgrade** - Raise reading comfort and hierarchy across dense content surfaces (completed 2026-04-11)
- [ ] **Phase 4: Proof Surfaces** - Bring GitHub-driven sections onto the current system with stable states
- [ ] **Phase 5: Verification Hardening** - Lock in repeatable checks and guidance for future UI work

## Phase Details

### Phase 1: Shell Convergence
**Goal**: Eliminate conflicting shared-shell behavior so theme, navigation, and token usage flow through one canonical layer.
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, UI-02, UI-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Visitor experiences one theme model across shared pages with no duplicate toggle behavior or contradictory theme states.
  2. Visitor can use one shared navigation shell consistently on desktop and mobile pages.
  3. Shared layouts and shared states read from the current token vocabulary instead of a competing legacy system.
**Plans**: 3/3 plans complete

Plans:
- [x] 01-01: Inventory and isolate conflicting shell, theme, and navigation code paths
- [x] 01-02: Normalize shared layout and include files around the canonical shell layer
- [x] 01-03: Verify shell behavior across representative pages and breakpoints

### Phase 2: Homepage Hierarchy
**Goal**: Make the homepage communicate the site's message faster and with less visual competition, especially on mobile.
**Depends on**: Phase 1
**Requirements**: HOME-01, HOME-02, HOME-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Visitor sees the homepage message before the portrait on mobile.
  2. Visitor can scan the hero without competing clusters of actions or decorative noise.
  3. Visitor moves from hero to supporting sections through clearer pacing and section hierarchy.
**Plans**: 3/3 plans complete

Plans:
- [x] 02-01: Rework homepage hero structure and mobile order
- [x] 02-02: Simplify action density and section pacing on the homepage
- [x] 02-03: Validate desktop and mobile hierarchy with rendered-browser checks

### Phase 3: Readability Upgrade
**Goal**: Improve comfort and hierarchy on dense reading surfaces without losing the site's academic tone.
**Depends on**: Phase 2
**Requirements**: READ-01, READ-02, READ-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Visitor can read dense homepage and internal-page content comfortably on desktop.
  2. Visitor can read dense homepage and internal-page content comfortably on mobile.
  3. News, timeline, subtitle, and metadata-heavy surfaces preserve hierarchy after typography changes.
**Plans**: 3/3 plans complete

Plans:
- [x] 03-01: Retune shared typography and spacing tokens for dense content
- [x] 03-02: Apply readability adjustments to timeline, news, and metadata-heavy surfaces
- [x] 03-03: Verify cross-page typography hierarchy on desktop and mobile

### Phase 4: Proof Surfaces
**Goal**: Make live GitHub-driven proof-of-work surfaces feel trustworthy, stable, and visually aligned with the rest of the site.
**Depends on**: Phase 3
**Requirements**: OSS-01, OSS-02, OSS-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Visitor sees the homepage OSS summary render with stable loading, success, and failure behavior.
  2. Visitor sees the contributions page use the shared card language across loading, empty, error, and success states.
  3. Visitor still gets useful context when GitHub API data is unavailable or rate-limited.
**Plans**: 3 plans

Plans:
- [ ] 04-01: Refactor shared async-state styling and loading/fallback presentation
- [ ] 04-02: Modernize OSS summary and contributions page implementation onto current tokens
- [ ] 04-03: Verify GitHub-driven states under success, slow, and failure conditions

### Phase 5: Verification Hardening
**Goal**: Leave the repo with repeatable regression checks and guidance that keep future UI work pointed at the right foundation.
**Depends on**: Phase 4
**Requirements**: QUAL-01, QUAL-02, QUAL-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Maintainer can run repeatable shell regression checks for desktop and mobile behavior.
  2. Maintainer can verify async GitHub-driven states through documented checks.
  3. Project documentation clearly identifies the canonical shared shell and warns against conflicting legacy layers.
**Plans**: 3 plans

Plans:
- [ ] 05-01: Expand regression coverage for shell and responsive behavior
- [ ] 05-02: Document async-state verification and brownfield UI guardrails
- [ ] 05-03: Finalize maintainability notes and cleanup follow-up guidance

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Shell Convergence | 3/3 | Complete | 2026-04-10 |
| 2. Homepage Hierarchy | 3/3 | Complete | 2026-04-10 |
| 3. Readability Upgrade | 3/3 | Complete | 2026-04-11 |
| 4. Proof Surfaces | 0/3 | Not started | - |
| 5. Verification Hardening | 0/3 | Not started | - |
