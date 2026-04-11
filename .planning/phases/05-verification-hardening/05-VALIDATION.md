---
phase: 5
slug: verification-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for repeatable shell regression checks, async-state verification, and maintainer-facing brownfield guidance.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright tests, browser-console smoke, and manual maintainer checks |
| **Config file** | none — Phase 5 intentionally stays within the repo's lightweight local-tooling model |
| **Quick run command** | `bash scripts/verify-ui.sh shell` |
| **Full suite command** | `bash scripts/verify-ui.sh full` |
| **Console smoke command** | open DevTools and run `testSite.runAll()` from `browser-console-tests.js` |
| **Fresh render command** | `PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" bundle exec jekyll build` |
| **Estimated runtime** | ~90 seconds automated, plus ~10 minutes manual smoke |

---

## Sampling Rate

- **After every task commit touching shell verification or test orchestration:** run the shell-focused verification mode.
- **After every task commit touching proof-surface smoke docs or browser-console smoke:** run the affected grep/syntax checks plus the relevant Playwright subset.
- **After each plan wave:** run the full UI verification mode.
- **Before `$gsd-verify-work`:** run the full UI verification mode, then complete the console/manual proof-surface smoke path from the updated docs.
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | QUAL-01 | static grep | `rg -n "bundle exec jekyll build|python3 -m http.server|npx playwright test|case \\\"\\$MODE\\\"|shell|full" scripts/verify-ui.sh` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | QUAL-01 | syntax + grep | `node -c tests/shell-behavior.spec.js && rg -n "Learning|skip-link|scrollProgress|backToTop|mobile drawer|theme toggle" tests/shell-behavior.spec.js` | ✅ | ⬜ pending |
| 05-01-03 | 01 | 1 | QUAL-01 | runner | `bash scripts/verify-ui.sh shell` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | QUAL-02 | static grep | `rg -n "oss-summary-status|contributions-proof|loading-state|error-state|empty-state|siteUX|scrollProgress|backToTop" browser-console-tests.js` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 2 | QUAL-02 | doc sync | `rg -n "scripts/verify-ui.sh|testSite.runAll\\(\\)|Proof Surfaces|browser console|rate-limit|full UI regression" manual-testing-script.md` | ✅ | ⬜ pending |
| 05-02-03 | 02 | 2 | QUAL-03 | doc grep | `rg -n "assets/css/overhaul.css|assets/js/site-shell.js|theme-toggle.js|app-navigation.js|developer-theme.css|custom.css|proof surfaces|verify-ui.sh" docs/ui-maintenance.md` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 3 | QUAL-03 | doc grep | `rg -n "verify-ui.sh|ui-maintenance.md|overhaul.css|site-shell.js|Playwright|Ruby 3.3|legacy" README.md` | ✅ | ⬜ pending |
| 05-03-02 | 03 | 3 | QUAL-03 | doc grep | `rg -n "Deferred follow-ups|PLAT-01|toolchain manifest|CI|artifact hygiene|legacy layers" docs/ui-maintenance.md` | ❌ W0 | ⬜ pending |
| 05-03-03 | 03 | 3 | QUAL-01, QUAL-02, QUAL-03 | full runner | `bash scripts/verify-ui.sh full` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/verify-ui.sh` — no single repo-local verification entrypoint exists yet
- [ ] Shell suite gap closure — `tests/shell-behavior.spec.js` does not yet cover skip links, scroll progress, back-to-top, or `Learning`
- [ ] `docs/ui-maintenance.md` — no single maintainer-facing brownfield UI guide exists yet
- [ ] `browser-console-tests.js` proof-surface alignment — console smoke does not yet assert the current proof-state anchors
- [ ] Local Playwright availability — repo still depends on `npm install --no-save @playwright/test` until future platform work formalizes toolchain management

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Verification runner feels maintainable for local use | QUAL-01 | command clarity and failure messaging are ergonomics judgments, not just file-content checks | run the new shell/full modes from a clean terminal and confirm the output is obvious about prerequisites, build, serve, and test phases |
| Proof-surface verification guidance matches the actual browser behavior | QUAL-02 | usefulness of the documentation depends on real maintainer flow | follow the updated manual + console smoke path on `Home` and `Contributions` and confirm it maps cleanly to loading, success, rate-limit, and error behavior |
| Canonical-shell and legacy-layer guardrails are easy to discover | QUAL-03 | documentation discoverability is a maintainer experience judgment | open `README.md` and the new maintainer guide and confirm a contributor can find the canonical files and brownfield warnings without reading planning artifacts first |

---

## Validation Sign-Off

- [ ] All tasks have automated verification or Wave 0 prerequisites
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers the missing repo-local runner and documentation surfaces
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
