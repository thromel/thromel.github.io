---
phase: 1
slug: shell-convergence
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-10
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright test plus browser/manual shell smoke checks |
| **Config file** | none — repo currently has test files but no committed Node manifest |
| **Quick run command** | `npx playwright test tests/navbar-layout.spec.js` |
| **Full suite command** | `npx playwright test tests/navbar-layout.spec.js tests/shell-behavior.spec.js` |
| **Estimated runtime** | ~20 seconds automated, plus ~10 minutes manual smoke |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/navbar-layout.spec.js` when the touched files affect the active shell runtime or shared nav markup.
- **After every plan wave:** Run `npx playwright test tests/navbar-layout.spec.js tests/shell-behavior.spec.js`
- **Before `$gsd-verify-work`:** Full suite must be green, then run the manual shell smoke in `manual-testing-script.md`
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | UI-01 | static grep | `rg -n "prefers-color-scheme|localStorage.getItem\\('theme'\\)|data-theme" _layouts/default.html` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | UI-01 | static grep | `rg -n "themeChanged|matchMedia\\('\\(prefers-color-scheme: dark\\)'\\)|window\\.siteUX" assets/js/site-shell.js` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 1 | UI-01 | static grep | `rg -n "\\[data-theme=|--color-|--text-|--space-|--radius-" about.html` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 1 | UI-03 | static grep | `rg -n "\\[data-theme=|--color-|--text-|--space-|--radius-" contributions.html` | ✅ | ⬜ pending |
| 01-02-03 | 02 | 1 | UI-02 | static grep | `rg -n "\\.site-header|\\.site-nav|\\[data-theme=|\\.scroll-progress|\\.theme-toggle" _includes/critical-css.html` | ✅ | ⬜ pending |
| 01-03-01 | 03 | 2 | UI-01 | playwright | `npx playwright test tests/navbar-layout.spec.js tests/shell-behavior.spec.js` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | UI-02 | manual-doc sync | `rg -n "About|Contributions|theme toggle|mobile drawer|skip links" browser-console-tests.js manual-testing-script.md` | ✅ | ⬜ pending |
| 01-03-03 | 03 | 2 | UI-03 | playwright + grep | `npx playwright test tests/shell-behavior.spec.js && rg -n "duplicate toggle|data-theme" browser-console-tests.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/shell-behavior.spec.js` — add representative shell assertions for Home, About, and Contributions before Wave 2 verification
- [ ] Playwright runtime availability — this repo has test files but no committed package manifest, so execution depends on the local environment until Phase 5 formalizes the toolchain

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| First-visit theme respects OS preference before any click | UI-01 | Automated tests in this repo do not currently simulate a clean first-visit storage state plus OS-preference visual confirmation | Open a fresh browser context, clear `localStorage.theme`, load `/`, and confirm `<html data-theme>` and the visual theme match the browser color scheme |
| Mobile drawer touch target comfort and overlay feel | UI-02 | Visual/tactile quality is easier to judge in a rendered browser than by DOM-only assertions | Open responsive mode at <=768px, use hamburger, overlay, and close button on `/`, `/about`, and `/contributions` |
| Contributions state cards still feel visually consistent after token migration | UI-03 | Phase 1 only performs minimal token convergence, not a full Phase 4 redesign | Load `/contributions`, confirm loading/error/empty/success containers still render legibly under both themes without undefined-token breakage |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
