# Full-Dossier Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four-block homepage with a detailed, research-led professional dossier covering research, publications, experience, engineering/open source, education, recognition, recent milestones, personal context, and contact.

**Architecture:** Keep Jekyll and the canonical shared shell. Render the homepage from existing `_data` files and collections, adding only concise homepage-specific structured fields where current records cannot be selected safely. Extend the existing Playwright suite first, then implement semantic Liquid markup and scoped styles in `assets/css/overhaul.css`.

**Tech Stack:** Jekyll/Liquid, HTML, CSS, Playwright, Axe, Lighthouse, GitHub Pages.

---

## File Map

- `index.html` — semantic homepage composition and Liquid rendering.
- `_data/research.yml` — research lanes, current trajectory, and homepage summaries.
- `_data/profile.yml` — existing positions, education, awards, personal links, and biography source.
- `_data/news.yaml` — existing milestone source.
- `_publications/**` — publication source records.
- `_showcase/projects/**` — project and image source records.
- `assets/css/overhaul.css` — canonical full-dossier layout and responsive styling.
- `tests/research-first-shell.spec.js` — homepage order, hero, and no-JavaScript contract.
- `tests/research-dossier.spec.js` — research status/publicity contract.
- `tests/records-and-contributions.spec.js` — publication, project, and media contract.
- `tests/quality-gates.spec.js` — accessibility, performance, and transfer budgets.

### Task 1: Lock the full-dossier information architecture

**Files:**
- Modify: `tests/research-first-shell.spec.js`

- [ ] **Step 1: Replace the four-block assertion with a ten-section contract**

Add a section order constant and assert the rendered sequence:

```js
const HOME_SECTIONS = [
  'identity', 'about', 'research', 'publications', 'experience',
  'engineering', 'education', 'recognition', 'milestones', 'contact',
];

const sections = page.locator('main > [data-home-section]');
await expect(sections).toHaveCount(HOME_SECTIONS.length);
await expect(sections.evaluateAll((nodes) => nodes.map((node) => node.dataset.homeSection)))
  .resolves.toEqual(HOME_SECTIONS);
```

- [ ] **Step 2: Assert the required evidence within each section**

Add browser assertions for six research lanes, four publication records, three experience roles, four IQVIA metrics, seven engineering records, three education records, seven recognitions, and four milestones.

```js
await expect(page.locator('[data-home-research-lane]')).toHaveCount(6);
await expect(page.locator('[data-home-publication]')).toHaveCount(4);
await expect(page.locator('[data-home-experience]')).toHaveCount(3);
await expect(page.locator('[data-home-metric]')).toHaveCount(4);
await expect(page.locator('[data-home-engineering]')).toHaveCount(7);
await expect(page.locator('[data-home-education]')).toHaveCount(3);
await expect(page.locator('[data-home-recognition]')).toHaveCount(7);
await expect(page.locator('[data-home-milestone]')).toHaveCount(4);
```

- [ ] **Step 3: Preserve the compact hero-name contract**

Keep the existing computed-size assertion at 1440px and 390px.

- [ ] **Step 4: Run the shell suite and confirm RED**

Run:

```bash
PATH="/Users/romel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
  bash scripts/verify-ui.sh shell
```

Expected: FAIL because the current homepage renders four old `data-home-block` sections and none of the new dossier records.

- [ ] **Step 5: Commit the failing contract**

```bash
git add tests/research-first-shell.spec.js
git commit -m "test: define full-dossier homepage contract"
```

### Task 2: Add concise homepage research metadata

**Files:**
- Modify: `_data/research.yml`
- Test: `tests/research-first-shell.spec.js`

- [ ] **Step 1: Add homepage identity and about copy**

Add `identity` and `about` objects with the approved role line, two-paragraph summary, markers, and personal copy. Keep these fields concise so `index.html` does not duplicate long prose.

```yaml
identity:
  role_line: "Researcher · software engineer · open-source contributor"
  summary: >-
    I study how AI agents behave in real software systems—what context they inspect,
    which actions they choose, how they recover, and what evidence they leave behind.
  bridge: >-
    My work connects software reliability, agent security, empirical software engineering,
    program analysis, developer tools, and production healthcare systems.
about:
  - "I grew up in Rajshahi and now live in Dhaka..."
  - "I keep a daily learning routine and tend to learn by building..."
```

- [ ] **Step 2: Expand research anchors to six lanes**

Preserve the existing three anchors and append `coding-agent-systems`, `history-aware-vibe-coding`, and `verified-schema-generation`, each with `label`, `title`, `question`, `description`, `status`, `context`, `last_verified`, and links.

- [ ] **Step 3: Keep primary visual truthfulness**

Only the existing three primary anchors receive images. The supporting three render as compact text records.

- [ ] **Step 4: Run the shell suite**

Expected: still FAIL because markup does not render the new data yet, but YAML build succeeds.

- [ ] **Step 5: Commit structured homepage data**

```bash
git add _data/research.yml
git commit -m "feat: structure full-dossier homepage content"
```

### Task 3: Replace the homepage markup

**Files:**
- Modify: `index.html`
- Test: `tests/research-first-shell.spec.js`

- [ ] **Step 1: Render identity and about sections**

Use semantic top-level sections with `data-home-section="identity"` and `data-home-section="about"`. Keep one `h1`, render the portrait with width/height, `fetchpriority="high"`, and preserve text-before-image source order.

- [ ] **Step 2: Render all six research lanes**

Loop over `site.data.research.anchors`. Add `data-home-research-lane`, render images only when `anchor.image` exists, and keep `data-publicity` and verified dates visible.

- [ ] **Step 3: Render four publication records**

Render the three collection records and a structured SHIFT research artifact from the research data. Add `data-home-publication`. Reuse real covers only when `item.cover` exists.

- [ ] **Step 4: Render all three experience roles and four IQVIA metrics**

Loop over `site.data.profile.positions`, rendering two to four selected evidence bullets per role. Render metrics as four `data-home-metric` cells with the approved values.

- [ ] **Step 5: Render the engineering/open-source ledger**

Create seven `data-home-engineering` records for RefactoringMiner, ctxhelm/HelmBench, ContextLedger, PatchSmith, curated contributions, systems builds, and applied ML builds. Link current systems to their canonical detail pages or repositories.

- [ ] **Step 6: Render education, recognition, and milestones**

Loop over all three education records. Select the seven approved awards by stable names. Render the four newest approved milestone entries from structured news/current trajectory data.

- [ ] **Step 7: Render collaboration/contact section**

Include email, GitHub, Scholar, LinkedIn, ORCID, and CV links under `data-home-section="contact"`.

- [ ] **Step 8: Run the shell suite and reach GREEN markup behavior**

Expected: all shell tests pass before visual styling.

- [ ] **Step 9: Commit semantic markup**

```bash
git add index.html tests/research-first-shell.spec.js
git commit -m "feat: build full-dossier homepage"
```

### Task 4: Implement the editorial layout

**Files:**
- Modify: `assets/css/overhaul.css`
- Test: `tests/research-first-shell.spec.js`
- Test: `tests/quality-gates.spec.js`

- [ ] **Step 1: Add scoped dossier layout primitives**

Add `.home-dossier-*` rules for the identity grid, section headers, research grid, ledgers, experience records, metric strip, education records, recognition columns, milestone ledger, and contact close.

- [ ] **Step 2: Preserve the compact name scale**

Use:

```css
.home-dossier-identity h1 {
  max-width: 15ch;
  font-size: clamp(2.75rem, 4vw, 3.6rem);
}
```

At the existing mobile breakpoint, cap it with `clamp(2.25rem, 10vw, 2.5rem)`.

- [ ] **Step 3: Add desktop editorial grids**

Use `minmax(0, 1fr)` everywhere. Research uses three columns only above 980px. Experience, publications, education, and engineering use ledgers rather than uniform cards.

- [ ] **Step 4: Add mobile collapse rules**

At 860px and below, collapse major grids to one column, retain a two-up metric grid where safe, and ensure every media element has bounded width.

- [ ] **Step 5: Verify dark mode and reduced motion**

Use existing tokens only; ensure new panels use `var(--paper-elevated)`, rules use `var(--rule)`, and accent text uses `var(--accent)`.

- [ ] **Step 6: Run the full suite**

Run `scripts/verify-ui.sh full`. Expected: all browser, Axe, budget, Lighthouse, and no-overflow tests pass.

- [ ] **Step 7: Commit styling**

```bash
git add assets/css/overhaul.css
git commit -m "style: refine full-dossier homepage"
```

### Task 5: Harden media, no-JavaScript, and responsive behavior

**Files:**
- Modify: `tests/research-first-shell.spec.js`
- Modify: `tests/quality-gates.spec.js`
- Modify: `index.html` only if failures expose missing attributes or landmarks.

- [ ] **Step 1: Assert all homepage images decode**

Scroll lazy images into view and assert `complete && naturalWidth > 0`.

- [ ] **Step 2: Assert no-JavaScript usefulness**

With JavaScript disabled, verify all ten sections, the primary navigation, and core contact links remain available.

- [ ] **Step 3: Assert responsive overflow from 320px through 1440px**

Reuse the existing overflow helper for widths 320, 390, 768, 1024, and 1440.

- [ ] **Step 4: Run the full suite**

Expected: complete GREEN run with zero failures.

- [ ] **Step 5: Commit regression hardening**

```bash
git add tests/research-first-shell.spec.js tests/quality-gates.spec.js index.html
git commit -m "test: harden full-dossier homepage"
```

### Task 6: Browser review and release

**Files:**
- No planned source edits; fix only evidence-backed issues found during review.

- [ ] **Step 1: Build and serve the production site**

Run Jekyll through `scripts/verify-ui.sh full`, then serve `_site` on an unused local port.

- [ ] **Step 2: Review desktop and mobile in Chrome**

Inspect 1440×1000, 390×844, light mode, dark mode, top/middle/bottom page composition, image loading, and navigation.

- [ ] **Step 3: Run final verification after any review fixes**

Run `scripts/verify-ui.sh full` again. Expected: all tests pass with fresh output.

- [ ] **Step 4: Commit any browser-review fixes**

Use a focused commit message only if additional changes were required.

- [ ] **Step 5: Push the feature branch commit to `main`**

```bash
git push origin HEAD:main
```

- [ ] **Step 6: Watch GitHub UI checks and Pages deployment**

Use `gh-axi run` to identify and watch both workflows until successful.

- [ ] **Step 7: Verify the live domain**

Open `https://tanzimhromel.com/` with a cache-busting query. Confirm all ten sections, image decoding, no overflow, and the deployed asset revision.
