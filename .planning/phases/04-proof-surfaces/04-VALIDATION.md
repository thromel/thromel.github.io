---
phase: 4
slug: proof-surfaces
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for GitHub-driven proof surfaces during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright tests plus manual proof-surface smoke checks |
| **Config file** | none — repo still uses ad hoc local Playwright setup |
| **Quick run command** | `npx playwright test tests/proof-surfaces.spec.js` |
| **Full suite command** | `npx playwright test tests/proof-surfaces.spec.js tests/readability-hierarchy.spec.js tests/homepage-hierarchy.spec.js tests/navbar-layout.spec.js tests/shell-behavior.spec.js` |
| **Fresh render command** | `PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" bundle exec jekyll build` |
| **Estimated runtime** | ~45 seconds automated, plus ~10 minutes manual smoke |

---

## Sampling Rate

- **After every task commit touching shared proof-state CSS or JavaScript helpers:** Run the relevant static grep checks plus `node -c` for any modified JavaScript files.
- **After homepage or contributions runtime changes:** Run `npx playwright test tests/proof-surfaces.spec.js`.
- **After each plan wave:** Run `npx playwright test tests/proof-surfaces.spec.js tests/readability-hierarchy.spec.js tests/homepage-hierarchy.spec.js tests/navbar-layout.spec.js tests/shell-behavior.spec.js`.
- **Before `$gsd-verify-work`:** Fresh build, full suite green, then run the proof-surfaces portion of `manual-testing-script.md`.
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | OSS-01 | static grep | `rg -n "proof-surface|proof-state|data-state=\\\"loading\\\"|data-state=\\\"error\\\"|data-state=\\\"empty\\\"" assets/css/overhaul.css assets/css/components/oss-summary.css` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | OSS-03 | syntax + grep | `node -c assets/js/github-proof.js && rg -n "classifyGitHubStatus|setProofState|setProofMessage|normalizeRepositoryName" assets/js/github-proof.js` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | OSS-01 | static grep | `rg -n "oss-summary-status|data-state=\\\"loading\\\"|GitHub data is unavailable right now|assets/js/oss-summary.js" index.html assets/js/oss-summary.js` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | OSS-02 | syntax + grep | `node -c assets/js/contributions.js && rg -n "setContributionsState|loading-state|error-state|empty-state|contributions-section" assets/js/contributions.js contributions.html` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | OSS-03 | static grep | `rg -n "rate-limit|GitHub is rate-limited right now|Unable to fetch contributions right now|GitHub data is unavailable right now" assets/js/oss-summary.js assets/js/contributions.js` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 3 | OSS-01 | playwright | `npx playwright test tests/proof-surfaces.spec.js --grep "homepage"` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 3 | OSS-02 | playwright | `npx playwright test tests/proof-surfaces.spec.js --grep "contributions"` | ❌ W0 | ⬜ pending |
| 04-03-03 | 03 | 3 | OSS-03 | manual-doc sync | `rg -n "Proof Surfaces|proof-surfaces.spec.js|homepage OSS|Contributions|slow|failure|rate-limit" manual-testing-script.md` | ✅ | ⬜ pending |
| 04-03-04 | 03 | 3 | OSS-01, OSS-02, OSS-03 | playwright + shell | `npx playwright test tests/proof-surfaces.spec.js tests/readability-hierarchy.spec.js tests/homepage-hierarchy.spec.js tests/navbar-layout.spec.js tests/shell-behavior.spec.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `assets/js/github-proof.js` — shared proof-state helper must exist before plan 2 can reuse it cleanly
- [ ] `assets/js/contributions.js` — contributions runtime must move out of the page before syntax checks and browser tests can target it directly
- [ ] `tests/proof-surfaces.spec.js` — dedicated proof-surface runtime checks do not exist yet
- [ ] Playwright runtime availability — local setup still requires `npm install --no-save @playwright/test` until a committed toolchain manifest exists
- [ ] Fresh rendered build path remains documented — local rendered verification currently depends on the Homebrew Ruby/Bundler toolchain

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Homepage OSS proof row feels stable before data arrives | OSS-01 | Perceived trust depends on pacing and first-paint continuity, not just DOM state | Reload `Home` on desktop and mobile and confirm the OSS area does not pop in as a new layout block after the fetch completes |
| Proof-surface fallback copy is useful during GitHub outages | OSS-03 | Message usefulness and next-step clarity are content judgments | Simulate failure or rate-limit behavior and confirm the fallback still leaves useful repo/profile links visible |
| Contributions success, empty, and failure states feel like one system | OSS-02 | Shared card language and state coherence are visual/system judgments | On `Contributions`, compare loading, empty, error, and success states and confirm they feel like the same surface rather than separate page fragments |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing runtime checks
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
