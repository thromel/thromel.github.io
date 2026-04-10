# Requirements: thromel.github.io

**Defined:** 2026-04-09
**Core Value:** Visitors can quickly understand Romel's work through a credible, readable, and consistent portfolio experience.

## v1 Requirements

### Shared UI System

- [x] **UI-01**: Visitor experiences one consistent theme system across shared pages without duplicate toggles or conflicting theme states
- [x] **UI-02**: Visitor can use one consistent shared navigation shell across desktop and mobile pages
- [x] **UI-03**: Shared pages and shared states use the current design-token vocabulary so cards, buttons, and emphasis feel consistent

### Homepage Hierarchy

- [ ] **HOME-01**: Visitor sees the homepage headline and core message before the portrait on mobile
- [ ] **HOME-02**: Visitor can scan the homepage hero without competing primary actions or overcrowded controls
- [ ] **HOME-03**: Visitor can move from hero to supporting homepage sections through a clearer visual hierarchy and pacing

### Readability

- [ ] **READ-01**: Visitor can comfortably read dense homepage and internal-page text on desktop without metadata-sized body copy
- [ ] **READ-02**: Visitor can comfortably read dense homepage and internal-page text on mobile without cramped line length or spacing
- [ ] **READ-03**: Visitor sees clear typographic hierarchy across news, timeline, subtitle, and metadata-heavy surfaces after readability adjustments

### Dynamic Proof Surfaces

- [ ] **OSS-01**: Visitor sees the homepage open-source summary render with stable loading, success, and failure presentation
- [ ] **OSS-02**: Visitor sees the contributions page render loading, empty, error, and success states using the shared card language
- [ ] **OSS-03**: Visitor still gets useful proof-of-work context when GitHub API data is unavailable or rate-limited

### Verification and Maintenance

- [ ] **QUAL-01**: Maintainer can run repeatable regression checks for the shared shell on desktop and mobile
- [ ] **QUAL-02**: Maintainer can verify GitHub-driven async states for the homepage OSS summary and contributions page
- [ ] **QUAL-03**: Maintainer has documentation that points future UI work toward the canonical shared shell and away from conflicting legacy layers

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
| HOME-01 | Phase 2 | Pending |
| HOME-02 | Phase 2 | Pending |
| HOME-03 | Phase 2 | Pending |
| READ-01 | Phase 3 | Pending |
| READ-02 | Phase 3 | Pending |
| READ-03 | Phase 3 | Pending |
| OSS-01 | Phase 4 | Pending |
| OSS-02 | Phase 4 | Pending |
| OSS-03 | Phase 4 | Pending |
| QUAL-01 | Phase 5 | Pending |
| QUAL-02 | Phase 5 | Pending |
| QUAL-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-09*
*Last updated: 2026-04-09 after initial definition*
