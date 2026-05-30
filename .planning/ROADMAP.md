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
- [x] **Phase 4: Proof Surfaces** - Bring GitHub-driven sections onto the current system with stable states (completed 2026-04-11)
- [x] **Phase 5: Verification Hardening** - Lock in repeatable checks and guidance for future UI work (completed 2026-04-11)
- [x] **Phase 05.1: Publications convergence and final UI polish** - Bring publications onto the canonical UI system and close the remaining near-miss polish gaps (completed 2026-04-12)
- [x] **Phase 6: Jon Barron-Inspired Theme Migration** - Convert the site to a narrow, text-first academic theme while preserving content, URLs, and verification. (completed 2026-04-30)
- [x] **Phase 7: Navigation and Metadata Foundation** - Simplify the academic shell navigation and set up page identity metadata. (completed 2026-05-17)
- [x] **Phase 8: Projects Page Polish** - Make project presentation compact, modern, and easier to scan. (completed 2026-05-30)
- [x] **Phase 9: Open Source Contributions Page** - Add curated contribution highlights and keep live GitHub activity as support. (completed 2026-05-30)
- [x] **Phase 10: SEO and Social Preview Completion** - Improve search/social previews through shared Jekyll metadata. (completed 2026-05-30)
- [x] **Phase 11: Dark Mode and Verification Hardening** - Refine dark mode across real surfaces and expand verification. (completed 2026-05-30)

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
**Plans**: 3/3 plans complete

Plans:
- [x] 04-01: Refactor shared async-state styling and loading/fallback presentation
- [x] 04-02: Modernize OSS summary and contributions page implementation onto current tokens
- [x] 04-03: Verify GitHub-driven states under success, slow, and failure conditions

### Phase 5: Verification Hardening
**Goal**: Leave the repo with repeatable regression checks and guidance that keep future UI work pointed at the right foundation.
**Depends on**: Phase 4
**Requirements**: QUAL-01, QUAL-02, QUAL-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Maintainer can run repeatable shell regression checks for desktop and mobile behavior.
  2. Maintainer can verify async GitHub-driven states through documented checks.
  3. Project documentation clearly identifies the canonical shared shell and warns against conflicting legacy layers.
**Plans**: 3/3 plans complete

Plans:
- [x] 05-01: Expand regression coverage for shell and responsive behavior
- [x] 05-02: Document async-state verification and brownfield UI guardrails
- [x] 05-03: Finalize maintainability notes and cleanup follow-up guidance

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Shell Convergence | 3/3 | Complete | 2026-04-10 |
| 2. Homepage Hierarchy | 3/3 | Complete | 2026-04-10 |
| 3. Readability Upgrade | 3/3 | Complete | 2026-04-11 |
| 4. Proof Surfaces | 3/3 | Complete | 2026-04-11 |
| 5. Verification Hardening | 3/3 | Complete | 2026-04-11 |
| 05.1. Publications convergence and final UI polish | 3/3 | Complete   | 2026-04-12 |
| 6. Jon Barron-Inspired Theme Migration | 8/8 | Complete | 2026-04-30 |
| 7. Navigation and Metadata Foundation | 3/3 | Complete | 2026-05-17 |
| 8. Projects Page Polish | 3/3 | Complete | 2026-05-30 |
| 9. Open Source Contributions Page | 3/3 | Complete | 2026-05-30 |
| 10. SEO and Social Preview Completion | 3/3 | Complete | 2026-05-30 |
| 11. Dark Mode and Verification Hardening | 3/3 | Complete | 2026-05-30 |

### Phase 05.1: Publications convergence and final UI polish (INSERTED)

**Goal:** Bring the publications surfaces onto the canonical UI system, fix misleading publication destinations, and finish the remaining final-polish gaps before milestone closeout.
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04
**Depends on:** Phase 5
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Visitor sees one responsive, canonical publications surface instead of duplicated desktop/mobile widget paths.
  2. Publication titles and CTAs lead to meaningful destinations instead of blank collection output pages.
  3. Publications and publication-adjacent homepage surfaces share the current typography, spacing, and CTA rhythm.
  4. Publications are inside the canonical repo-local verification boundary through the runner, smoke tooling, and maintainer docs.
**Plans**: 3/3 plans drafted

Plans:
- [x] 05.1-01: Converge publications markup and destination behavior onto the canonical system
- [x] 05.1-02: Apply final cross-surface polish to publications and homepage-adjacent pacing
- [x] 05.1-03: Close verification gaps for publications and final polish regressions


### Phase 6: Jon Barron-Inspired Theme Migration

**Goal**: Replace the current modern portfolio visual language with a compact academic homepage and row-based research/publication system inspired by jonbarron.info.
**Requirements**: JB-01, JB-02, JB-03, JB-04, JB-05, JB-06
**Depends on**: Phase 05.1
**UI hint**: yes
**Success Criteria**:
  1. Homepage uses narrow academic layout, intro plus circular portrait, compact grouped profile links, and compact sections.
  2. Publications and research surfaces use row-based media/content entries with stable links and readable metadata.
  3. Global shell is minimal and does not expose duplicate theme/nav/floating controls.
  4. Contributions and homepage GitHub proof surfaces retain deterministic loading, success, empty, and failure states.
  5. Full UI verification passes on desktop and mobile.
**Plans**: 8/8 plans complete

## Milestone v1.1: Portfolio UX Polish

### Phase 7: Navigation and Metadata Foundation

**Goal**: Make the academic shell easier to scan while preserving access to existing content and preparing page-level metadata.
**Requirements**: NAV-01, NAV-02, NAV-03
**Depends on**: Phase 6
**UI hint**: yes
**Success Criteria**:
  1. Header navigation is shorter and readable in one pass on desktop and mobile.
  2. Every current major page remains reachable through header, footer, or contextual links.
  3. Active-page state still matches page front matter after navigation changes.
  4. Core pages have a clear metadata source for later SEO/social work.
**Plans**: 3/3 plans complete

Plans:
- [x] 07-01: Define navigation groups and page metadata sources
- [x] 07-02: Render primary and secondary routes through the shared shell
- [x] 07-03: Verify active states, route reachability, and metadata readiness

### Phase 8: Projects Page Polish

**Goal**: Make project entries compact, evidence-focused, and visually stable across desktop and mobile.
**Requirements**: PROJ-01, PROJ-02, PROJ-03
**Depends on**: Phase 7
**UI hint**: yes
**Success Criteria**:
  1. Featured projects and archive projects read as distinct sections.
  2. Project media and summaries do not create tall, narrow, or unstable cards.
  3. Project tags are limited to the strongest technologies.
  4. Learning capstones are framed as milestone/capstone builds, not course listings.
**Plans**: 3/3 plans complete

Plans:
- [x] 08-01: Normalize project hierarchy and excerpts for compact display
- [x] 08-02: Refine projects page layout and responsive project components
- [x] 08-03: Verify project page readability and card sizing on desktop and mobile

### Phase 9: Open Source Contributions Page

**Goal**: Make open-source work understandable even before live GitHub data loads.
**Requirements**: OSS2-01, OSS2-02, OSS2-03
**Depends on**: Phase 8
**UI hint**: yes
**Success Criteria**:
  1. RefactoringMiner, EF Core, GenHTTP, deepagents, and TypeScript are visible as curated contribution targets.
  2. The page remains useful during GitHub loading, empty, error, and rate-limit states.
  3. Live PR activity supports the curated highlights instead of dominating the page.
  4. Homepage and contributions proof language stay consistent.
**Plans**: 3/3 plans complete

Plans:
- [x] 09-01: Create curated contribution data and page structure
- [x] 09-02: Integrate curated highlights with live GitHub proof states
- [x] 09-03: Verify contributions success, empty, error, and rate-limit paths

### Phase 10: SEO and Social Preview Completion

**Goal**: Improve how the portfolio appears in search results, social links, and page previews.
**Requirements**: SEO-01, SEO-02, SEO-03
**Depends on**: Phase 9
**UI hint**: no
**Success Criteria**:
  1. Core pages emit useful page-specific descriptions.
  2. Shared layout produces reliable canonical, Open Graph, and Twitter metadata.
  3. Social preview image paths resolve correctly on the built GitHub Pages site.
  4. Generated HTML can be checked without hand-inspecting every page.
**Plans**: 3/3 plans complete

Plans:
- [x] 10-01: Define metadata defaults and per-page descriptions
- [x] 10-02: Update shared layout/config for canonical and social previews
- [x] 10-03: Verify built HTML metadata for core pages

### Phase 11: Dark Mode and Verification Hardening

**Goal**: Refine dark mode across the real v1.1 surfaces and leave repeatable checks for the milestone.
**Requirements**: DARK-01, DARK-02, QUAL2-01
**Depends on**: Phase 10
**UI hint**: yes
**Success Criteria**:
  1. Dark mode has readable contrast on navigation, projects, contributions, tags, links, and proof states.
  2. Theme toggle behavior and saved preference still work.
  3. Full verification covers desktop, mobile, SEO metadata, and GitHub-driven async states.
  4. Screenshots or audit notes capture the final v1.1 visual state.
**Plans**: 3/3 plans complete

Plans:
- [x] 11-01: Tune dark-mode tokens and component states across v1.1 surfaces
- [x] 11-02: Extend verification for navigation, projects, contributions, metadata, and theme behavior
- [x] 11-03: Run full verification and record final UI evidence
