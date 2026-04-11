---
phase: 3
slug: readability-upgrade
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for readability and typography feedback during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright test plus manual cross-page readability smoke checks |
| **Config file** | none — repo still uses ad hoc local Playwright setup |
| **Quick run command** | `npx playwright test tests/readability-hierarchy.spec.js` |
| **Full suite command** | `npx playwright test tests/readability-hierarchy.spec.js tests/homepage-hierarchy.spec.js tests/navbar-layout.spec.js tests/shell-behavior.spec.js` |
| **Fresh render command** | `PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" bundle exec jekyll build` |
| **Estimated runtime** | ~40 seconds automated, plus ~10 minutes manual smoke |

---

## Sampling Rate

- **After every task commit touching shared typography or page-local readability styles:** Run `npx playwright test tests/readability-hierarchy.spec.js`
- **After each plan wave:** Run `npx playwright test tests/readability-hierarchy.spec.js tests/homepage-hierarchy.spec.js tests/navbar-layout.spec.js tests/shell-behavior.spec.js`
- **Before `$gsd-verify-work`:** Fresh build, full suite green, then run the readability portion of `manual-testing-script.md`
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | READ-01 | static grep | `rg -n -- "--text-sm:|--text-base:|--text-lg:|--leading-relaxed:" assets/css/overhaul.css` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | READ-02 | static grep | `rg -n "timeline-description|project-description|resource-description|skill-item" assets/css/mobile-optimizations.css` | ✅ | ⬜ pending |
| 03-01-03 | 01 | 1 | READ-01 | playwright | `npx playwright test tests/readability-hierarchy.spec.js --grep "font floors"` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | READ-03 | static grep | `rg -n "section-subtitle|timeline-date|timeline-subtitle|timeline-description|news-description|resource-description|current-focus-card p" assets/css/overhaul.css` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 2 | READ-01 | static grep | `rg -n "about-bio|stat-label|contribution-meta|contribution-label|loading-container" about.html contributions.html` | ✅ | ⬜ pending |
| 03-02-03 | 02 | 2 | READ-03 | playwright | `npx playwright test tests/readability-hierarchy.spec.js --grep "hierarchy"` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | READ-01 | playwright | `npx playwright test tests/readability-hierarchy.spec.js` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | READ-02 | manual-doc sync | `rg -n "Readability hierarchy|readability-hierarchy.spec.js|news|timeline|About|Learning|Contributions|mobile" manual-testing-script.md` | ✅ | ⬜ pending |
| 03-03-03 | 03 | 3 | READ-03 | playwright + shell | `npx playwright test tests/readability-hierarchy.spec.js tests/homepage-hierarchy.spec.js tests/shell-behavior.spec.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/readability-hierarchy.spec.js` — add representative desktop and mobile readability assertions before browser verification can go green
- [ ] Playwright runtime availability — local setup still requires `npm install --no-save @playwright/test` until a committed toolchain manifest exists
- [ ] Fresh rendered build path remains documented — local rendered verification currently depends on the Homebrew Ruby/Bundler toolchain

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dense homepage surfaces feel readable without losing the current academic tone | READ-01 | Comfort and “tone” are visual judgments, not just computed font sizes | Open the homepage on desktop, read current focus, recent news, and two timeline cards, and confirm the page feels calmer without turning into oversized marketing typography |
| Mobile dense content remains readable without feeling bloated | READ-02 | Mobile legibility depends on both font size and card spacing | Open `Home`, `Learning`, and `Contributions` at `390x844`; confirm descriptions, subtitles, and metadata are readable and cards do not feel overgrown |
| Titles, body copy, and metadata remain visually distinct after size increases | READ-03 | Hierarchy can regress when everything grows together | Compare section titles, body descriptions, and metadata lines on `Home` and `Contributions`; confirm dates and labels stay subordinate while remaining legible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing runtime checks
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
