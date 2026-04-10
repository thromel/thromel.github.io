---
phase: 2
slug: homepage-hierarchy
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-10
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for homepage hierarchy feedback during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright test plus manual homepage smoke checks |
| **Config file** | none — repo still uses ad hoc local Playwright setup |
| **Quick run command** | `npx playwright test tests/homepage-hierarchy.spec.js` |
| **Full suite command** | `npx playwright test tests/homepage-hierarchy.spec.js tests/navbar-layout.spec.js tests/shell-behavior.spec.js` |
| **Estimated runtime** | ~30 seconds automated, plus ~10 minutes manual smoke |

---

## Sampling Rate

- **After every task commit touching `index.html` or homepage CSS:** Run `npx playwright test tests/homepage-hierarchy.spec.js`
- **After each plan wave:** Run `npx playwright test tests/homepage-hierarchy.spec.js tests/navbar-layout.spec.js tests/shell-behavior.spec.js`
- **Before `$gsd-verify-work`:** Full suite must be green, then run the homepage portion of `manual-testing-script.md`
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | HOME-01 | static grep | `rg -n "hero-kicker|hero-primary-actions|hero-contact-row" index.html` | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | HOME-01 | static grep | `rg -n "hero-image-wrapper" assets/css/mobile-optimizations.css && ! rg -n "order:\\s*-1" assets/css/mobile-optimizations.css` | ✅ | ⬜ pending |
| 02-01-03 | 01 | 1 | HOME-02 | playwright | `npx playwright test tests/homepage-hierarchy.spec.js --grep "hero"` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | HOME-02 | static grep | `rg -n "home-support-stack|home-section-nav|section-pill" index.html assets/css/overhaul.css` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 2 | HOME-03 | static grep | `rg -n "id=\"homepage-(news|publications|research|work|projects|skills)\"" index.html` | ✅ | ⬜ pending |
| 02-02-03 | 02 | 2 | HOME-03 | playwright | `npx playwright test tests/homepage-hierarchy.spec.js --grep "section nav"` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | HOME-01 | playwright | `npx playwright test tests/homepage-hierarchy.spec.js` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | HOME-02 | manual-doc sync | `rg -n "Homepage hierarchy|hero|section nav|current focus|mobile" manual-testing-script.md` | ✅ | ⬜ pending |
| 02-03-03 | 03 | 3 | HOME-03 | playwright + shell | `npx playwright test tests/homepage-hierarchy.spec.js tests/shell-behavior.spec.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/homepage-hierarchy.spec.js` — add dedicated hierarchy assertions before browser verification can go green
- [ ] Playwright runtime availability — local setup still requires `npm install --no-save @playwright/test` until a committed toolchain manifest exists

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Headline and core copy clearly lead before the portrait on phone widths | HOME-01 | Visual hierarchy matters more than DOM order alone | Open the homepage at `390x844`, verify the hero text block appears and reads before the image, and confirm no CSS reorders the portrait ahead of the headline |
| Hero action density feels decisively lower than the current 4-text-link plus 5-icon-link cluster | HOME-02 | Relative clutter and scanning comfort are easiest to judge in a rendered browser | Compare the new first screen to the current audit notes; confirm the hero has one small primary action row and a quieter secondary contact row |
| Current focus, section nav, OSS proof, and news feel sequential instead of competing | HOME-03 | This is about pacing and attention flow, not just DOM presence | Scroll from the hero into the support band and confirm each surface has a clear role before the long-form sections begin |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing runtime checks
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
