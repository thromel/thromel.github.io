# Phase 1: Shell Convergence - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 converges the shared shell onto one canonical theme, navigation, and token system. It does not add new portfolio capabilities or do broad visual redesign work; it removes conflicting shared-shell behavior and cleans up only the page-local leaks that directly block shell convergence.

</domain>

<decisions>
## Implementation Decisions

### Theme behavior
- **D-01:** First-visit theme behavior should follow the user's system color preference, with manual override persisted afterward in `localStorage`.
- **D-02:** The canonical theme model for the project is `data-theme="dark|light"` on the root element; root class approaches like `dark-theme` and `light-theme` should not remain part of the active shared shell.

### Legacy cleanup strategy
- **D-03:** Phase 1 should hard-cut to the canonical shared shell rather than introducing a long-lived compatibility bridge.
- **D-04:** Legacy runtime shell paths that conflict with the canonical shell should be removed from the active path or isolated so they cannot silently compete with the current layout.

### Phase-1 scope on page islands
- **D-05:** Phase 1 should update shared shell files first and only touch page-local or include-local shell/token leaks when they directly interfere with theme, navigation, or shared token convergence.
- **D-06:** Broad page-specific visual cleanup that does not block shell convergence stays in later phases, especially homepage hierarchy, readability, and proof-surface polish phases.

### Interaction baseline
- **D-07:** The canonical shell baseline should stay minimal and reliable: theme toggle, mobile drawer, scroll progress, back-to-top, and homepage section nav are enough for Phase 1.
- **D-08:** App-like gestures, route transitions, magnetic motion, and similar experiments should not be preserved in the canonical shell baseline during this phase.

### the agent's Discretion
- Exact refactor order between JavaScript, CSS, and include cleanup
- Whether conflicting legacy files are deleted, quarantined, or left dormant once they are removed from active paths
- Small accessibility or markup cleanup needed to support the canonical shell

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase contract
- `.planning/ROADMAP.md` § `Phase 1: Shell Convergence` — goal, requirements, and success criteria for this phase
- `.planning/REQUIREMENTS.md` § `Shared UI System` — the v1 requirements this phase must satisfy
- `.planning/PROJECT.md` § `Constraints` and `Key Decisions` — brownfield limits and canonical-shell direction

### Audit and architecture evidence
- `00-UI-REVIEW.md` — highest-impact shell-related problems and design-system inconsistencies
- `.planning/codebase/ARCHITECTURE.md` — split between the newer shell and the legacy parallel UI layer
- `.planning/codebase/CONCERNS.md` — explicit risks around theme duplication, selector drift, and shell conflicts
- `.planning/codebase/CONVENTIONS.md` — current-vs-legacy token and shell conventions

### Canonical shared shell sources
- `_layouts/default.html` — current shared style/script load path and initial theme bootstrap
- `_includes/navbar.html` — canonical shared navigation markup and mobile drawer structure
- `_includes/footer.html` — canonical footer and back-to-top shell markup
- `assets/js/site-shell.js` — canonical shared shell behavior
- `assets/css/overhaul.css` — canonical shared design token and component system
- `assets/css/mobile-optimizations.css` — mobile behavior that must remain compatible with the canonical shell

### Legacy conflict sources to evaluate during Phase 1
- `assets/js/theme-toggle.js` — conflicting root-class theme model and duplicate floating toggle behavior
- `assets/js/common.js` — legacy scroll/back-to-top/theme-transition behavior that overlaps with the canonical shell
- `assets/js/app-navigation.js` — dormant `.navbar`-based app-navigation layer that conflicts conceptually with the current shell
- `assets/js/advanced-interactions.js` — dormant motion-heavy interaction layer that should not define the shell baseline
- `assets/css/developer-theme.css` — legacy token system and root-class theme styling
- `assets/css/custom.css` — `.navbar`-based layout and shell overrides from the prior system
- `_includes/critical-css.html` — legacy critical CSS using the older theme and navbar vocabulary

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `_layouts/default.html`: already loads the canonical CSS and script entrypoints for the shared shell
- `_includes/navbar.html`: already provides the canonical desktop nav, mobile drawer, and active-link structure
- `_includes/footer.html`: already provides footer shell elements and the back-to-top button
- `assets/js/site-shell.js`: already owns the active theme toggle, mobile drawer, scroll progress, back-to-top behavior, and homepage section navigation
- `assets/css/overhaul.css`: already defines the active `data-theme` token system and shared component styling
- `assets/css/mobile-optimizations.css`: already contains responsive shell behavior that should remain aligned with the canonical layer

### Established Patterns
- The active shell uses `data-theme` plus `localStorage` key `theme` rather than root classes
- Shared shell behavior is loaded through deferred scripts in `_layouts/default.html`
- Navigation markup uses `.site-nav`, `.nav-links`, `#mobileMenuToggle`, `#mobileNavDrawer`, and `#mobileNavOverlay`
- The current default layout only loads `site-shell.js` and `oss-summary.js`; the older jQuery-based shell scripts are present in the repo but not loaded through the main layout

### Integration Points
- `_layouts/default.html` is the highest-leverage point for theme bootstrap and shared shell script/style loading
- `_includes/navbar.html` and `_includes/footer.html` are the markup contract that canonical shell behavior depends on
- `_includes/critical-css.html`, `about.html`, and `contributions.html` are the most obvious non-canonical shell/token islands that may need touch-up if they interfere with convergence
- Legacy utilities like `assets/js/code-highlight.js` still inspect `light-theme` / `dark-theme`, so theme-model changes may need compatibility review beyond the primary shell files

</code_context>

<specifics>
## Specific Ideas

- First visit should feel polished and adaptive, so following system preference is better than forcing dark mode before the user expresses a preference.
- Phase 1 should create a firm shared-shell foundation instead of carrying two live theme/navigation models forward.
- This phase should be disciplined: fix shell-blocking leaks now, but defer broader page polish and content-presentation work to later roadmap phases.

</specifics>

<deferred>
## Deferred Ideas

- Revisit richer motion or app-like navigation only after the canonical shell is stable and the core UI audit issues are addressed.
- Broader page-level token normalization for non-shell surfaces belongs in later phases where those pages are already the focus.

</deferred>

---

*Phase: 01-shell-convergence*
*Context gathered: 2026-04-10*
