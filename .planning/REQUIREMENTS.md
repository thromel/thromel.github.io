# Requirements: thromel.github.io

**Defined:** 2026-04-09
**Core Value:** Visitors can quickly understand Romel's work through a credible, readable, and consistent portfolio experience.

## v1 Requirements

### Shared UI System

- [x] **UI-01**: Visitor experiences one consistent theme system across shared pages without duplicate toggles or conflicting theme states
- [x] **UI-02**: Visitor can use one consistent shared navigation shell across desktop and mobile pages
- [x] **UI-03**: Shared pages and shared states use the current design-token vocabulary so cards, buttons, and emphasis feel consistent

### Homepage Hierarchy

- [x] **HOME-01**: Visitor sees the homepage headline and core message before the portrait on mobile
- [x] **HOME-02**: Visitor can scan the homepage hero without competing primary actions or overcrowded controls
- [x] **HOME-03**: Visitor can move from hero to supporting homepage sections through a clearer visual hierarchy and pacing

### Readability

- [x] **READ-01**: Visitor can comfortably read dense homepage and internal-page text on desktop without metadata-sized body copy
- [x] **READ-02**: Visitor can comfortably read dense homepage and internal-page text on mobile without cramped line length or spacing
- [x] **READ-03**: Visitor sees clear typographic hierarchy across news, timeline, subtitle, and metadata-heavy surfaces after readability adjustments

### Dynamic Proof Surfaces

- [x] **OSS-01**: Visitor sees the homepage open-source summary render with stable loading, success, and failure presentation
- [x] **OSS-02**: Visitor sees the contributions page render loading, empty, error, and success states using the shared card language
- [x] **OSS-03**: Visitor still gets useful proof-of-work context when GitHub API data is unavailable or rate-limited

### Verification and Maintenance

- [x] **QUAL-01**: Maintainer can run repeatable regression checks for the shared shell on desktop and mobile
- [x] **QUAL-02**: Maintainer can verify GitHub-driven async states for the homepage OSS summary and contributions page
- [x] **QUAL-03**: Maintainer has documentation that points future UI work toward the canonical shared shell and away from conflicting legacy layers

### Final UI Polish

- [x] **PUB-01**: Visitor sees one responsive publications surface that uses the canonical shell/token language instead of duplicated desktop/mobile widget branches
- [x] **PUB-02**: Publication titles and CTAs land on meaningful destinations instead of blank collection output pages
- [x] **PUB-03**: Publications and publication-adjacent homepage surfaces match the current typography, spacing, and CTA rhythm of the rest of the site
- [x] **PUB-04**: Publications are included in the canonical repo-local verification boundary, smoke tooling, and maintainer guidance

## v2 Theme Migration Requirements

### Jon Barron-Inspired Academic Theme

- [x] **JB-01**: Visitor sees a narrow, text-first academic homepage with intro copy, circular portrait, and slash-separated identity links.
- [x] **JB-02**: Visitor sees research and publication work as compact media/content rows rather than large cards or timelines.
- [x] **JB-03**: Visitor can navigate core pages through minimal text links without competing app-like navbar, drawer, theme toggle, gradients, or floating controls.
- [x] **JB-04**: Visitor can read secondary pages in the same narrow academic typography and spacing system.
- [x] **JB-05**: Visitor still gets useful GitHub proof-of-work context when async data loads, fails, is empty, or is rate-limited.
- [x] **JB-06**: Maintainer can run repeatable checks for the academic theme on desktop and mobile.

## v2 Requirements

### Content Evolution

- **CONT-01**: Maintainer can refresh site positioning or rewrite major sections of copy as a separate editorial pass
- **CONT-02**: Maintainer can expand portfolio storytelling with new case-study or research-detail formats

### Platform Improvements

- **PLAT-01**: Maintainer can formalize CI-backed browser, accessibility, and performance checks with a committed toolchain manifest
- **PLAT-02**: Maintainer can revisit offline/PWA capabilities if they become part of the site's core value

## Out of Scope

| Feature | Reason |
|---------|--------|
| SPA migration or framework rewrite | Brownfield remediation should preserve the live Jekyll/static architecture |
| New backend services or CMS | Current milestone is about presentation, consistency, and maintainability rather than new infrastructure |
| Full content rewrite or personal rebrand | The current content already works; the immediate gap is UI coherence and readability |
| Expanded PWA feature work | Existing audit and architecture concerns are higher priority |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 1 | Complete |
| UI-02 | Phase 1 | Complete |
| UI-03 | Phase 1 | Complete |
| HOME-01 | Phase 2 | Complete |
| HOME-02 | Phase 2 | Complete |
| HOME-03 | Phase 2 | Complete |
| READ-01 | Phase 3 | Complete |
| READ-02 | Phase 3 | Complete |
| READ-03 | Phase 3 | Complete |
| OSS-01 | Phase 4 | Complete |
| OSS-02 | Phase 4 | Complete |
| OSS-03 | Phase 4 | Complete |
| QUAL-01 | Phase 5 | Complete |
| QUAL-02 | Phase 5 | Complete |
| QUAL-03 | Phase 5 | Complete |
| PUB-01 | Phase 05.1 | Complete |
| PUB-02 | Phase 05.1 | Complete |
| PUB-03 | Phase 05.1 | Complete |
| PUB-04 | Phase 05.1 | Complete |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-09*
*Last updated: 2026-04-12 after Phase 05.1 planning kickoff*
