# Compact Typography, Humanized Copy, and Portrait Implementation Plan

> **For Codex:** Use the executing-plans workflow and complete each task in order. Follow test-driven development for behavior and rendered-style changes.

**Goal:** Make headings consistently smaller across the site, keep the homepage name on one line at every supported viewport, refresh formulaic public copy, and replace the homepage portrait with the user-provided photo.

**Architecture:** Keep the existing Jekyll layouts and canonical `overhaul.css` design system. Add rendered-browser assertions before changing typography, update only public-facing summaries and introductions, and serve one optimized WebP portrait through the existing homepage and profile data paths.

**Tech Stack:** Jekyll, Liquid, CSS, Playwright, shell verification scripts, ImageMagick/sips.

---

## Task 1: Add failing typography and copy checks

**Files:**
- Modify: `tests/research-first-shell.spec.js`
- Modify: `tests/secondary-routes.spec.js`

1. Add homepage checks at 1440px, 390px, and 320px proving the full name renders on one line without horizontal overflow and never exceeds the approved 48px maximum.
2. Add representative secondary-route checks proving rendered `h1`, `h2`, and `h3` sizes stay at or below 52px, 36px, and 23.2px.
3. Add Education-specific checks for the page title and degree headings.
4. Add copy assertions for the approved humanized homepage wording and absence of superseded phrases.
5. Run the focused Playwright tests and confirm they fail for the expected current typography/copy.

## Task 2: Implement the compact type scale

**Files:**
- Modify: `assets/css/overhaul.css`

1. Set the shared scale to `h1: clamp(2rem, 3.75vw, 3.25rem)`, `h2: clamp(1.55rem, 2.4vw, 2.25rem)`, and `h3: clamp(1.15rem, 1.6vw, 1.45rem)`.
2. Set phone `h1` to `clamp(1.9rem, 9vw, 2.6rem)`.
3. Set the homepage name to `clamp(1.75rem, 3.4vw, 3rem)`, remove its width cap, and keep it on one line without overflow.
4. Reduce page-specific heading overrides that exceed the shared scale while preserving hierarchy.
5. Re-run the focused typography checks.

## Task 3: Humanize the scoped public copy

**Files:**
- Modify: `index.html`
- Modify: `_data/research.yml`
- Modify: `about.md`
- Modify: `research.md`
- Modify: `publications.md`
- Modify: `projects.md`
- Modify: `contributions.html`
- Modify: `cv.md`
- Modify: `education.md`
- Modify: `experience.md`
- Modify: `achievements.html`
- Modify: `news.html`

1. Rewrite formulaic homepage summaries and section introductions in a direct, natural first-person voice.
2. Rewrite only core page titles or introductions that read mechanically.
3. Preserve research claims, project titles, publication metadata, dates, collaborators, metrics, and technical detail exactly.
4. Run the focused copy checks and inspect the diff for accidental claim changes.

## Task 4: Replace and optimize the homepage portrait

**Files:**
- Add/replace: `assets/images/photos/romel.webp`
- Modify: `index.html`
- Modify: `_data/profile.yml`
- Modify: `assets/css/overhaul.css`
- Modify: `tests/research-first-shell.spec.js`

1. Generate a high-quality, metadata-stripped WebP from `/Users/romel/Downloads/IMG_7699 Copy.JPG`, sized for the rendered portrait rather than shipping the full source image.
2. Keep the existing stable asset path so all consumers receive the new portrait.
3. Update intrinsic image dimensions, alt text, caption, and object positioning for the new composition.
4. Add an asset-dimension/load assertion and visually inspect desktop and mobile crops.

## Task 5: Verify, commit, and publish

**Files:**
- Verify all modified files.

1. Run `scripts/verify-ui.sh full`.
2. Serve the built site and inspect the homepage plus representative secondary pages at desktop, tablet, and 320px mobile widths.
3. Confirm no horizontal overflow, the name stays on one line, the portrait crop is sound, images load, and all major headings remain readable.
4. Review `git diff`, commit the implementation, push the branch to `main`, monitor CI, and verify the live site.
