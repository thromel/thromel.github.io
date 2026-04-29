# Jon Barron Theme Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `thromel.github.io` from the current card/chrome-heavy academic portfolio into a Jon Barron-inspired minimal academic site while preserving Jekyll, content URLs, accessibility, and async proof surfaces.

**Architecture:** Keep `_layouts/default.html`, `_includes/navbar.html`, `_includes/footer.html`, `assets/css/overhaul.css`, and `assets/js/site-shell.js` as the canonical shared layer, but retune them toward a narrow 800px academic document. Use semantic div/article markup rather than copying Jon Barron's table implementation. Preserve existing data sources (`_data/profile.yml`, `_publications`, `_data/news.yaml`, page front matter) and progressively migrate visual surfaces onto a small set of reusable classes: `academic-page`, `academic-intro`, `academic-link-row`, `academic-section`, `academic-list`, and `academic-publication`.

**Tech Stack:** Jekyll/Liquid, static HTML, CSS in `assets/css/overhaul.css`, existing browser-side JavaScript in `assets/js/site-shell.js`, Playwright tests invoked through `scripts/verify-ui.sh`.

---

## Reference Theme Contract

Source: `https://jonbarron.info/` and `https://github.com/jonbarron/jonbarron.github.io`.

The migration should adopt these qualities:

- Centered academic page with approximately `800px` max width.
- Lato/Verdana/Helvetica-style typography, 14px body copy, 22px section headings, 32px centered name.
- White background, black body copy, blue links (`#1772d0`), orange hover (`#f09228`).
- Intro block with text on the left, circular portrait on the right, stacked on mobile.
- Slash-separated contact/profile link row instead of button clusters and icon rows.
- Research/publication entries as compact rows with a fixed media thumbnail and dense metadata.
- Highlighted selected work using pale yellow (`#ffffd0`) rather than shadows, gradients, or card chrome.
- Minimal or absent global navigation and footer chrome.

The migration should not adopt these implementation details literally:

- Do not use layout tables for new structure.
- Do not inline large amounts of CSS or JavaScript in page bodies.
- Do not remove accessibility landmarks, skip links, responsive behavior, or deterministic verification.
- Do not copy Jon Barron's content, media, or identity assets.

## File Structure

**Modify:**
- `_layouts/default.html` - reduce global shell wrappers, load Lato, keep landmarks, make theme default light, expose optional compact shell controls.
- `_includes/navbar.html` - replace large navigation chrome with a minimal text nav or hide it on the homepage while keeping an accessible navigation landmark.
- `_includes/footer.html` - collapse footer into a minimal text footer/link row.
- `assets/css/overhaul.css` - retune tokens and create the academic layout/component vocabulary.
- `assets/css/mobile-optimizations.css` - remove or override rules that conflict with the narrow academic layout.
- `assets/css/components/oss-summary.css` - restyle proof surfaces as inline academic notes, not cards.
- `assets/js/site-shell.js` - keep mobile nav/theme behavior only if controls remain; otherwise guard missing elements cleanly.
- `index.html` - rebuild the homepage as an academic intro plus compact sections.
- `_includes/widgets/publication_item.html` - convert publications to Jon Barron-style media/content rows.
- `publications.html` - make archive use the same row component without card wrappers.
- `research.html`, `projects.html`, `experience.html`, `education.html`, `achievements.html`, `news.html`, `learning.html`, `about.html`, `contributions.html` - converge page intros and list surfaces to the academic vocabulary.
- `tests/*.spec.js` - update assertions from old chrome/card classes to the new academic contract.
- `scripts/verify-ui.sh` - add or adjust a migration verification mode if needed.
- `docs/ui-maintenance.md` - document the new canonical academic theme and rejected legacy patterns.
- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md` - add a new migration milestone and requirements before implementation if using GSD tracking.

**Create:**
- `tests/jon-barron-theme.spec.js` - verifies reference-inspired layout invariants: width, typography, link rows, publication rows, mobile stacking, and absence of duplicate chrome.
- Optional: `docs/design/jon-barron-theme-contract.md` - concise design contract if the team wants an inspectable design artifact outside the implementation plan.

**Do not modify unless explicitly needed:**
- `_publications/*/*.md` - only data fixes if a publication lacks cover, links, or abstract needed by the new row.
- `assets/images/**` - use existing portrait/publication images.
- Legacy files `assets/js/theme-toggle.js`, `assets/js/app-navigation.js`, `assets/js/advanced-interactions.js`, `assets/css/developer-theme.css`, `assets/css/custom.css` - do not extend them; remove references only if currently loaded.

---

### Task 1: Create Migration Tracking Requirements

**Files:**
- Modify: `.planning/PROJECT.md`
- Modify: `.planning/REQUIREMENTS.md`
- Modify: `.planning/ROADMAP.md`
- Modify: `.planning/STATE.md`

- [ ] **Step 1: Add the design decision to `.planning/PROJECT.md`**

Add a row to the Key Decisions table:

```markdown
| Adopt a Jon Barron-inspired minimal academic theme for v2 | The user wants the portfolio to shift from a modern card-heavy site to a narrow, text-first academic homepage that foregrounds research and publications | Pending |
```

- [ ] **Step 2: Add v2 migration requirements to `.planning/REQUIREMENTS.md`**

Append under a new `## v2 Theme Migration Requirements` section:

```markdown
### Jon Barron-Inspired Academic Theme

- [ ] **JB-01**: Visitor sees a narrow, text-first academic homepage with intro copy, circular portrait, and slash-separated identity links.
- [ ] **JB-02**: Visitor sees research and publication work as compact media/content rows rather than large cards or timelines.
- [ ] **JB-03**: Visitor can navigate core pages through minimal text links without competing app-like navbar, drawer, theme toggle, gradients, or floating controls.
- [ ] **JB-04**: Visitor can read secondary pages in the same narrow academic typography and spacing system.
- [ ] **JB-05**: Visitor still gets useful GitHub proof-of-work context when async data loads, fails, is empty, or is rate-limited.
- [ ] **JB-06**: Maintainer can run repeatable checks for the academic theme on desktop and mobile.
```

- [ ] **Step 3: Add the migration phase to `.planning/ROADMAP.md`**

Append a new phase after Phase 05.1:

```markdown
- [ ] **Phase 6: Jon Barron-Inspired Theme Migration** - Convert the site to a narrow, text-first academic theme while preserving content, URLs, and verification.
```

Then add details:

```markdown
### Phase 6: Jon Barron-Inspired Theme Migration
**Goal**: Replace the current modern portfolio visual language with a compact academic homepage and row-based research/publication system inspired by jonbarron.info.
**Depends on**: Phase 05.1
**Requirements**: JB-01, JB-02, JB-03, JB-04, JB-05, JB-06
**UI hint**: yes
**Success Criteria**:
  1. Homepage uses narrow academic layout, intro + circular portrait, slash-separated profile links, and compact sections.
  2. Publications and research surfaces use row-based media/content entries with stable links and readable metadata.
  3. Global shell is minimal and does not expose duplicate theme/nav/floating controls.
  4. Contributions and homepage GitHub proof surfaces retain deterministic loading, success, empty, and failure states.
  5. Full UI verification passes on desktop and mobile.
**Plans**: 0/6 plans complete
```

- [ ] **Step 4: Update `.planning/STATE.md`**

Set status to active migration planning:

```yaml
status: active
stopped_at: Phase 6 planned
last_activity: 2026-04-30 -- Jon Barron-inspired theme migration planning
```

- [ ] **Step 5: Commit planning artifacts**

Run:

```bash
git add .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/ROADMAP.md .planning/STATE.md
git commit -m "docs: plan jon barron theme migration"
```

Expected: commit succeeds with only planning files staged.

---

### Task 2: Add Theme Contract Tests Before Styling

**Files:**
- Create: `tests/jon-barron-theme.spec.js`
- Modify: `scripts/verify-ui.sh`

- [ ] **Step 1: Create failing theme contract tests**

Create `tests/jon-barron-theme.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP = { width: 1280, height: 720 };
const MOBILE = { width: 390, height: 844 };

async function expectNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(
    dimensions.scrollWidth,
    `${label} should not overflow horizontally. Viewport ${dimensions.width}px, scroll width ${dimensions.scrollWidth}px.`,
  ).toBeLessThanOrEqual(dimensions.width + 1);
}

test.describe('Jon Barron-inspired academic theme', () => {
  test('homepage uses a narrow academic document and minimal identity row on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const shell = page.locator('.academic-page');
    await expect(shell).toHaveCount(1);

    const maxWidth = await shell.evaluate((node) => Number.parseFloat(getComputedStyle(node).maxWidth));
    expect(maxWidth).toBeLessThanOrEqual(820);

    await expect(page.locator('.academic-intro')).toHaveCount(1);
    await expect(page.locator('.academic-name')).toHaveText('Tanzim Hossain Romel');
    await expect(page.locator('.academic-portrait img')).toHaveCSS('border-radius', /50%|9999px/);

    const linkRow = page.locator('.academic-link-row').first();
    await expect(linkRow).toBeVisible();
    await expect(linkRow).toContainText('Email');
    await expect(linkRow).toContainText('CV');
    await expect(linkRow).toContainText('Scholar');
    await expect(linkRow).toContainText('Github');

    await expect(page.locator('.theme-toggle')).toHaveCount(0);
    await expect(page.locator('.back-to-top')).toHaveCount(0);
    await expect(page.locator('.mobile-nav-drawer')).toHaveCount(0);
  });

  test('homepage intro stacks text above portrait on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const copy = page.locator('.academic-intro__copy');
    const portrait = page.locator('.academic-portrait');
    await expect(copy).toBeVisible();
    await expect(portrait).toBeVisible();

    const [copyBox, portraitBox] = await Promise.all([copy.boundingBox(), portrait.boundingBox()]);
    expect(copyBox).not.toBeNull();
    expect(portraitBox).not.toBeNull();
    expect(copyBox.y).toBeLessThan(portraitBox.y);

    await expectNoHorizontalOverflow(page, 'Homepage mobile academic intro');
  });

  test('publications render as compact media rows, not cards', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE_URL}/publications`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.academic-publication')).toHaveCount(3);
    await expect(page.locator('.publication-card')).toHaveCount(0);
    await expect(page.locator('.academic-publication__media')).toHaveCount(3);
    await expect(page.locator('.academic-publication__title a')).toHaveCount(3);

    const firstMediaWidth = await page.locator('.academic-publication__media').first().evaluate((node) => node.getBoundingClientRect().width);
    expect(firstMediaWidth).toBeGreaterThanOrEqual(130);
    expect(firstMediaWidth).toBeLessThanOrEqual(180);
  });

  test('secondary pages share academic sections', async ({ page }) => {
    await page.setViewportSize(DESKTOP);

    for (const path of ['/about', '/research', '/projects', '/experience', '/learning', '/contributions']) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.academic-page')).toHaveCount(1);
      await expect(page.locator('.academic-section').first(), `${path} should expose an academic section.`).toBeVisible();
      await expectNoHorizontalOverflow(page, path);
    }
  });
});
```

- [ ] **Step 2: Add the new spec to full verification**

In `scripts/verify-ui.sh`, add `tests/jon-barron-theme.spec.js` to the `full` specs array before existing hierarchy tests:

```bash
  full)
    SPECS=(
      "tests/jon-barron-theme.spec.js"
      "tests/publications-data.spec.js"
      "tests/publications-surface.spec.js"
      "tests/proof-surfaces.spec.js"
      "tests/readability-hierarchy.spec.js"
      "tests/homepage-hierarchy.spec.js"
      "tests/navbar-layout.spec.js"
      "tests/shell-behavior.spec.js"
    )
    ;;
```

- [ ] **Step 3: Run tests and confirm expected failure**

Run:

```bash
./scripts/verify-ui.sh full
```

Expected: `tests/jon-barron-theme.spec.js` fails because `.academic-page`, `.academic-intro`, and `.academic-publication` do not exist yet. Existing tests may also fail later as the old shell is intentionally removed.

- [ ] **Step 4: Commit failing test contract**

Run:

```bash
git add tests/jon-barron-theme.spec.js scripts/verify-ui.sh
git commit -m "test: add academic theme contract"
```

Expected: commit succeeds. The suite is allowed to fail at this point because this is the red step.

---

### Task 3: Simplify Shared Shell and Base Tokens

**Files:**
- Modify: `_layouts/default.html`
- Modify: `_includes/navbar.html`
- Modify: `_includes/footer.html`
- Modify: `assets/css/overhaul.css`
- Modify: `assets/js/site-shell.js`
- Modify: `tests/shell-behavior.spec.js`
- Modify: `tests/navbar-layout.spec.js`

- [ ] **Step 1: Replace font loading and remove first-paint dark theme script**

In `_layouts/default.html`, replace the current Google Fonts link with Lato:

```html
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
```

Remove the inline script that sets `data-theme`. Keep skip links, `#main-content`, analytics, and `site-shell.js`.

- [ ] **Step 2: Wrap main content in the academic shell**

In `_layouts/default.html`, replace the current body content wrapper with:

```html
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <a href="#site-navigation" class="skip-link">Skip to navigation</a>

    {% include navbar.html %}

    <main id="main-content" class="academic-page" role="main">
        {{ content }}
    </main>

    {% include footer.html %}

    <script src="{{ '/assets/js/site-shell.js' | relative_url }}" defer></script>
    <script src="{{ '/assets/js/oss-summary.js' | relative_url }}" defer></script>
</body>
```

Do not include `.theme-toggle`, `.back-to-top`, `.mobile-nav-drawer`, or `.mobile-nav-overlay`.

- [ ] **Step 3: Replace navbar with minimal link row**

Replace `_includes/navbar.html` with:

```html
<header class="academic-header">
  <nav id="site-navigation" class="academic-nav" role="navigation" aria-label="Main navigation">
    {% assign nav_items = site.data.navigation.pages %}
    {% for item in nav_items %}
      <a href="{{ item.url | relative_url }}"{% if item.name == page.navbar_title or (item.name == 'Home' and page.navbar_title == nil) %} aria-current="page"{% endif %}>{{ item.name }}</a>{% unless forloop.last %}<span aria-hidden="true">/</span>{% endunless %}
    {% endfor %}
  </nav>
</header>
```

- [ ] **Step 4: Replace footer with minimal footer**

Replace `_includes/footer.html` with:

```html
<footer class="academic-footer">
  <p>
    <span>&copy; {{ 'now' | date: '%Y' }} {{ site.data.profile.primary_name }}</span>
    <span aria-hidden="true">/</span>
    <a href="mailto:{{ site.data.profile.email }}">Email</a>
    <span aria-hidden="true">/</span>
    <a href="https://github.com/{{ site.data.profile.github }}" target="_blank" rel="noopener noreferrer">Github</a>
  </p>
</footer>
```

- [ ] **Step 5: Retune base CSS tokens**

At the top of `assets/css/overhaul.css`, replace the token block and base body/link typography with this contract. Keep later component CSS temporarily; it will be removed or overridden in later tasks.

```css
:root {
  --color-bg: #ffffff;
  --color-text-primary: #000000;
  --color-text-secondary: #333333;
  --color-text-muted: #555555;
  --color-accent: #1772d0;
  --color-accent-hover: #f09228;
  --color-highlight: #ffffd0;
  --color-border: #dddddd;
  --font-sans: "Lato", Verdana, Helvetica, sans-serif;
  --text-body: 14px;
  --text-section: 22px;
  --text-name: 32px;
  --container-max: 800px;
  --media-thumb: 160px;
}

* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: var(--color-text-primary);
  background: var(--color-bg);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body, p, a, li, td, th, tr, strong {
  font-family: var(--font-sans);
  font-size: var(--text-body);
}

a {
  color: var(--color-accent);
  text-decoration: none;
  border-bottom: 0;
}

a:hover,
a:focus {
  color: var(--color-accent-hover);
  text-decoration: none;
  border-bottom: 0;
}

p {
  margin: 0 0 1em;
  color: var(--color-text-primary);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.25;
}

h2 {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: var(--text-section);
  font-weight: 400;
}

.academic-page {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 16px 40px;
}

.academic-header,
.academic-footer {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 16px;
}

.academic-nav,
.academic-footer p,
.academic-link-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  margin: 0;
  text-align: center;
}

.academic-section {
  padding: 16px 0;
}

.academic-section > h2,
.academic-section__title {
  margin-bottom: 12px;
}

.highlight,
.academic-highlight {
  background: var(--color-highlight);
}

.skip-link {
  position: absolute;
  left: -999px;
  top: 8px;
  z-index: 1000;
  padding: 8px 10px;
  background: #fff;
  color: #000;
  border: 1px solid var(--color-border);
}

.skip-link:focus {
  left: 8px;
}

@media (max-width: 640px) {
  .academic-page,
  .academic-header,
  .academic-footer {
    padding-left: 12px;
    padding-right: 12px;
  }
}
```

- [ ] **Step 6: Guard `site-shell.js` against removed controls**

Edit `assets/js/site-shell.js` so every theme toggle, mobile drawer, scroll progress, and back-to-top setup first checks whether required DOM elements exist. Use this pattern for each feature block:

```javascript
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  // Existing theme toggle setup stays here.
}
```

Expected: no JavaScript error if theme toggle and mobile drawer markup are absent.

- [ ] **Step 7: Update shell tests for minimal shell**

In `tests/shell-behavior.spec.js`, replace theme toggle and mobile drawer assertions with minimal shell assertions:

```javascript
await expect(page.locator('#site-navigation')).toHaveCount(1);
await expect(page.locator('.academic-nav')).toHaveCount(1);
await expect(page.locator('.theme-toggle')).toHaveCount(0);
await expect(page.locator('.mobile-nav-drawer')).toHaveCount(0);
await expect(page.locator('.back-to-top')).toHaveCount(0);
```

Remove tests that require theme persistence, drawer open/close, scroll progress width, or back-to-top visibility.

- [ ] **Step 8: Run shell verification**

Run:

```bash
./scripts/verify-ui.sh shell
```

Expected: shell tests pass after old chrome expectations are removed.

- [ ] **Step 9: Commit shell simplification**

Run:

```bash
git add _layouts/default.html _includes/navbar.html _includes/footer.html assets/css/overhaul.css assets/js/site-shell.js tests/shell-behavior.spec.js tests/navbar-layout.spec.js
git commit -m "style: simplify shell for academic theme"
```

---

### Task 4: Convert Homepage to Academic Intro and Compact Sections

**Files:**
- Modify: `index.html`
- Modify: `assets/css/overhaul.css`
- Modify: `tests/homepage-hierarchy.spec.js`
- Modify: `tests/jon-barron-theme.spec.js`

- [ ] **Step 1: Replace homepage hero with academic intro**

Replace the opening `.homepage-classic` and `.hero-section` block in `index.html` with:

```html
<section class="academic-intro" aria-label="Profile introduction">
  <div class="academic-intro__copy">
    <p class="academic-name">{{ site.data.profile.primary_name }}</p>
    <p>
      I'm a software engineer at <a href="{{ site.data.profile.current_company.url }}" target="_blank" rel="noopener noreferrer">{{ site.data.profile.current_company.name }}</a> and a software engineering researcher. I work on AI/ML security, LLM systems, empirical software engineering, and production backend systems.
    </p>
    <p>
      I completed my B.Sc. in Computer Science and Engineering at <a href="https://cse.buet.ac.bd" target="_blank" rel="noopener noreferrer">BUET</a>. I will start an M.Sc. in Computing Science at the <a href="https://www.ualberta.ca/en/computing-science/index.html" target="_blank" rel="noopener noreferrer">University of Alberta</a> in September 2026.
    </p>
    <p class="academic-link-row" aria-label="Profile links">
      <a href="mailto:{{ site.data.profile.email }}">Email</a><span aria-hidden="true">/</span>
      <a href="/assets/pdf/cv.pdf" target="_blank" rel="noopener noreferrer">CV</a><span aria-hidden="true">/</span>
      <a href="{{ 'about' | relative_url }}">Bio</a><span aria-hidden="true">/</span>
      <a href="https://scholar.google.com/citations?user={{ site.data.profile.gscholar }}" target="_blank" rel="noopener noreferrer">Scholar</a><span aria-hidden="true">/</span>
      <a href="https://github.com/{{ site.data.profile.github }}" target="_blank" rel="noopener noreferrer">Github</a><span aria-hidden="true">/</span>
      <a href="https://www.linkedin.com/in/{{ site.data.profile.linkedin }}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    </p>
  </div>
  <div class="academic-portrait">
    <a href="{{ site.data.profile.portrait_url | relative_url }}">
      <img src="{{ site.data.profile.portrait_url | relative_url }}" alt="{{ site.data.profile.primary_name }} profile photo">
    </a>
  </div>
</section>
```

- [ ] **Step 2: Convert current focus and section nav into one compact note**

Replace `.home-support-stack`, `.current-focus`, and `.home-section-nav` with:

```html
<section class="academic-section academic-current" aria-labelledby="current-focus-title">
  <h2 id="current-focus-title">Current Focus</h2>
  <p>I am currently focused on <span class="academic-highlight">The Choice Can Be the Attack</span>, VeriSchema, RefactoringMiner, and reading <em>Designing Data-Intensive Applications</em>.</p>
  <p class="academic-link-row" aria-label="Homepage sections">
    <a href="#homepage-news">News</a><span aria-hidden="true">/</span>
    <a href="#homepage-publications">Publications</a><span aria-hidden="true">/</span>
    <a href="#homepage-research">Research</a><span aria-hidden="true">/</span>
    <a href="#homepage-work">Work</a><span aria-hidden="true">/</span>
    <a href="#homepage-projects">Projects</a><span aria-hidden="true">/</span>
    <a href="#homepage-skills">Skills</a>
  </p>
</section>
```

- [ ] **Step 3: Convert news widget to academic list**

Replace the homepage news widget with:

```html
<section id="homepage-news" class="academic-section">
  <h2>News</h2>
  <div class="academic-list">
    {% assign sorted_news = site.data.news | sort: 'date' | reverse %}
    {% for item in sorted_news limit:3 %}
    <p><strong>{{ item.date | date: "%b %Y" }}:</strong> {{ item.title }}{% if item.description %}. {{ item.description | truncate: 120 }}{% endif %}</p>
    {% endfor %}
  </div>
  <p><a href="{{ 'news' | relative_url }}">View all news</a></p>
</section>
```

- [ ] **Step 4: Add homepage academic CSS**

Append to `assets/css/overhaul.css`:

```css
.academic-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 37%;
  align-items: center;
  gap: 20px;
  padding: 20px 0 12px;
}

.academic-intro__copy {
  min-width: 0;
}

.academic-name {
  margin: 0 0 12px;
  text-align: center;
  font-size: var(--text-name);
  line-height: 1.15;
}

.academic-portrait {
  padding: 2.5%;
}

.academic-portrait img {
  display: block;
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
}

.academic-current {
  padding-top: 8px;
}

.academic-list p {
  margin-bottom: 0.65em;
}

@media (max-width: 640px) {
  .academic-intro {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .academic-intro__copy {
    order: 1;
  }

  .academic-portrait {
    order: 2;
    padding: 0;
  }

  .academic-portrait img {
    max-width: 190px;
  }
}
```

- [ ] **Step 5: Update homepage tests**

In `tests/homepage-hierarchy.spec.js`, replace old `.hero-primary-actions`, `.home-section-nav`, and `.hero-content--intro` expectations with:

```javascript
await expect(page.locator('.academic-intro')).toHaveCount(1);
await expect(page.locator('.academic-link-row').first()).toContainText('CV');
await expect(page.locator('.academic-link-row').first()).toContainText('Scholar');
await expect(page.locator('.academic-current')).toContainText('Current Focus');
```

For mobile ordering, compare `.academic-intro__copy` and `.academic-portrait` bounding boxes.

- [ ] **Step 6: Run homepage and contract tests**

Run:

```bash
./scripts/verify-ui.sh full
```

Expected: homepage-related tests pass. Publication and secondary-page tests may still fail until later tasks complete.

- [ ] **Step 7: Commit homepage migration**

Run:

```bash
git add index.html assets/css/overhaul.css tests/homepage-hierarchy.spec.js tests/jon-barron-theme.spec.js
git commit -m "style: convert homepage to academic intro"
```

---

### Task 5: Convert Publications and Research Rows

**Files:**
- Modify: `_includes/widgets/publication_item.html`
- Modify: `publications.html`
- Modify: `index.html`
- Modify: `research.html`
- Modify: `assets/css/overhaul.css`
- Modify: `tests/publications-surface.spec.js`
- Modify: `tests/jon-barron-theme.spec.js`

- [ ] **Step 1: Replace publication item markup**

Replace `_includes/widgets/publication_item.html` with:

```html
{% assign item = include.item %}
{%- if item.pub_date -%}
  {%- assign publication_year = item.pub_date -%}
{%- elsif item.date -%}
  {%- assign publication_year = item.date | date: "%Y" -%}
{%- else -%}
  {%- assign publication_year = "" -%}
{%- endif -%}

{%- assign primary_href = item.primary_link -%}
{%- assign primary_label = item.primary_label | default: "project page" -%}
{%- assign primary_is_external = false -%}
{%- if item.primary_external or primary_href contains '://' or primary_href contains 'mailto:' -%}
  {%- assign primary_is_external = true -%}
{%- endif -%}

{%- capture publication_venue -%}
  {%- if item.pub_pre -%}{{ item.pub_pre }}{% endif -%}
  {%- if item.pub -%}<em>{{ item.pub }}</em>{% endif -%}
  {%- if item.pub_post -%}{{ item.pub_post }}{% endif -%}
  {%- if item.pub_last -%} {{ item.pub_last }}{% endif -%}
{%- endcapture -%}
{%- assign publication_venue = publication_venue | strip -%}

<article class="academic-publication{% if item.highlight %} academic-publication--highlight{% endif %}">
  <div class="academic-publication__media">
    {%- if item.cover -%}
      <img src="{{ item.cover | relative_url }}" alt="{{ item.title }}">
    {%- else -%}
      <svg class="bubble-visual-hash" data-bubble-visual-hash="{{ item.id }}" viewBox="0 0 300 200" aria-hidden="true"></svg>
    {%- endif -%}
  </div>

  <div class="academic-publication__body">
    <h3 class="academic-publication__title">
      {% if primary_href %}
      <a href="{% if primary_is_external %}{{ primary_href }}{% else %}{{ primary_href | relative_url }}{% endif %}"{% if primary_is_external %} target="_blank" rel="noopener noreferrer"{% endif %}>{{ item.title }}</a>
      {% else %}
      {{ item.title }}
      {% endif %}
    </h3>

    {% if item.authors %}
    <p class="academic-publication__authors">{% include widgets/author_list.html authors=item.authors %}</p>
    {% endif %}

    {% if publication_venue != "" or publication_year != "" %}
    <p class="academic-publication__venue">{{ publication_venue }}{% if publication_venue != "" and publication_year != "" %}, {% endif %}{{ publication_year }}</p>
    {% endif %}

    {% if primary_href or item.links %}
    <p class="academic-publication__links">
      {% if primary_href %}
      <a href="{% if primary_is_external %}{{ primary_href }}{% else %}{{ primary_href | relative_url }}{% endif %}"{% if primary_is_external %} target="_blank" rel="noopener noreferrer"{% endif %}>{{ primary_label }}</a>
      {% endif %}
      {% for link in item.links %}
        {%- assign raw_href = link[1].url | default: link[1] -%}
        {%- assign raw_target = link[1].target -%}
        {%- assign raw_is_external = false -%}
        {%- if raw_href contains '://' or raw_href contains 'mailto:' -%}
          {%- assign raw_is_external = true -%}
        {%- endif -%}
        {%- unless raw_href == primary_href -%}
          {% if primary_href or forloop.index0 > 0 %}<span aria-hidden="true">/</span>{% endif %}
          <a href="{% if raw_is_external %}{{ raw_href }}{% else %}{{ raw_href | relative_url }}{% endif %}"{% if raw_is_external %} target="_blank" rel="noopener noreferrer"{% elsif raw_target %} target="{{ raw_target }}"{% endif %}>{{ link[0] }}</a>
        {%- endunless -%}
      {% endfor %}
    </p>
    {% endif %}

    {% if item.abstract %}
    <p class="academic-publication__summary">{{ item.abstract }}</p>
    {% endif %}
  </div>
</article>
```

- [ ] **Step 2: Replace publications page wrapper**

In `publications.html`, replace `.section-publications` markup with:

```html
<section class="academic-section academic-publications-page">
  <h1 class="academic-page-title">Publications</h1>
  <p>Selected papers, research summaries, and artifacts across software engineering, security, and applied machine learning.</p>

  {% for year in pubs_by_year %}
  <section class="academic-section publication-year-group" id="year-{{ year.name }}">
    <h2>{{ year.name }}</h2>
    <div class="academic-publication-list">
      {% for item in year.items %}
        {% include widgets/publication_item.html item=item %}
      {% endfor %}
    </div>
  </section>
  {% endfor %}
</section>
```

- [ ] **Step 3: Replace homepage publication preview with row component**

In `index.html`, replace the homepage publications timeline with:

```html
<section id="homepage-publications" class="academic-section">
  <h2>Publications</h2>
  <p>Recent papers and research artifacts.</p>
  <div class="academic-publication-list">
    {% for pub in homepage_publications limit:3 %}
      {% include widgets/publication_item.html item=pub %}
    {% endfor %}
  </div>
  <p><a href="{{ 'publications' | relative_url }}">All publications</a></p>
</section>
```

- [ ] **Step 4: Add publication row CSS**

Append to `assets/css/overhaul.css`:

```css
.academic-page-title {
  margin: 20px 0 12px;
  text-align: center;
  font-size: var(--text-name);
  font-weight: 400;
}

.academic-publication-list {
  display: grid;
  gap: 10px;
}

.academic-publication {
  display: grid;
  grid-template-columns: var(--media-thumb) minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  padding: 16px;
}

.academic-publication--highlight {
  background: var(--color-highlight);
}

.academic-publication__media {
  width: var(--media-thumb);
  height: var(--media-thumb);
  position: relative;
  overflow: hidden;
}

.academic-publication__media img,
.academic-publication__media svg,
.academic-publication__media video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.academic-publication__title {
  margin: 0 0 4px;
  font-size: var(--text-body);
  font-weight: 700;
  line-height: 1.35;
}

.academic-publication__authors,
.academic-publication__venue,
.academic-publication__links,
.academic-publication__summary {
  margin: 0 0 4px;
}

.academic-publication__summary {
  margin-top: 8px;
}

@media (max-width: 640px) {
  .academic-publication {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 12px;
    padding: 12px 0;
  }

  .academic-publication__media {
    width: 96px;
    height: 96px;
  }
}
```

- [ ] **Step 5: Update publications tests**

In `tests/publications-surface.spec.js`, replace `.publication-card`, `.publication-title`, and `.publication-link--primary` selectors with:

```javascript
await expect(archiveSection.locator('.academic-publication')).toHaveCount(PUBLICATION_DESTINATIONS.length);
const archiveTitlePaths = await collectPathnames(archiveSection.locator('.academic-publication__title a'));
const archivePrimaryPaths = await collectPathnames(archiveSection.locator('.academic-publication__links a:first-child'));
```

Update homepage assertions similarly under `#homepage-publications`.

- [ ] **Step 6: Run publications tests**

Run:

```bash
./scripts/verify-ui.sh full
```

Expected: publication destination tests pass; remaining secondary-page assertions may still fail until Task 6.

- [ ] **Step 7: Commit publication rows**

Run:

```bash
git add _includes/widgets/publication_item.html publications.html index.html assets/css/overhaul.css tests/publications-surface.spec.js tests/jon-barron-theme.spec.js
git commit -m "style: convert publications to academic rows"
```

---

### Task 6: Converge Secondary Pages to Academic Sections

**Files:**
- Modify: `about.html`
- Modify: `research.html`
- Modify: `projects.html`
- Modify: `experience.html`
- Modify: `education.html`
- Modify: `achievements.html`
- Modify: `news.html`
- Modify: `learning.html`
- Modify: `contributions.html`
- Modify: `assets/css/overhaul.css`
- Modify: `tests/readability-hierarchy.spec.js`
- Modify: `tests/proof-surfaces.spec.js`
- Modify: `tests/jon-barron-theme.spec.js`

- [ ] **Step 1: Apply the page intro pattern to each secondary page**

For each secondary page, replace modern `.page-intro`, `.section-intro`, or hero wrappers with this pattern:

```html
<section class="academic-section">
  <h1 class="academic-page-title">PAGE_TITLE</h1>
  <p>ONE_SENTENCE_PAGE_DESCRIPTION.</p>
</section>
```

Use these exact titles and descriptions:

```text
About: Biography, background, research interests, and the personal context behind my work.
Research: Research projects and papers across software engineering, security, blockchain, and applied machine learning.
Projects: Selected software, research, and systems projects.
Work: Professional engineering experience and selected responsibilities.
Education: Academic background, coursework, and recognitions.
Achievements: Awards, recognitions, and notable milestones.
News: Recent updates about research, work, writing, and open source.
Learning: Books, courses, and learning notes I recommend or revisit.
Contributions: Open-source contribution activity and selected pull requests.
```

- [ ] **Step 2: Convert repeated cards/timelines to academic lists**

For repeated entries on secondary pages, use this structure:

```html
<article class="academic-entry">
  <h2><a href="ENTRY_URL">ENTRY_TITLE</a></h2>
  <p class="academic-entry__meta">ENTRY_METADATA</p>
  <p>ENTRY_DESCRIPTION</p>
</article>
```

When an entry has no URL, omit the anchor and keep plain text in `h2`.

- [ ] **Step 3: Preserve contribution async hooks**

In `contributions.html`, keep the DOM IDs and data attributes consumed by `assets/js/contributions.js` and `assets/js/github-proof.js`. Wrap them in academic sections:

```html
<section class="academic-section proof-surface" data-state="loading">
  <h2>Recent GitHub Activity</h2>
  <div id="contributions-status" class="proof-state" aria-live="polite">Loading recent contribution activity...</div>
  <div id="contributions-list" class="academic-list"></div>
</section>
```

If the existing JavaScript expects different IDs, keep the existing IDs and add classes rather than renaming the IDs.

- [ ] **Step 4: Add secondary-page CSS**

Append to `assets/css/overhaul.css`:

```css
.academic-entry {
  padding: 10px 0;
}

.academic-entry + .academic-entry {
  border-top: 1px solid transparent;
}

.academic-entry h2,
.academic-entry h3 {
  margin: 0 0 4px;
  font-size: var(--text-body);
  font-weight: 700;
}

.academic-entry__meta {
  margin: 0 0 4px;
  color: var(--color-text-muted);
}

.proof-surface {
  background: transparent;
  border: 0;
  box-shadow: none;
  padding: 16px 0;
}

.proof-state,
.proof-links {
  margin: 0 0 8px;
  color: var(--color-text-primary);
}

.proof-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
```

- [ ] **Step 5: Update readability and proof tests**

Update old card/timeline selectors in `tests/readability-hierarchy.spec.js` and `tests/proof-surfaces.spec.js` to assert:

```javascript
await expect(page.locator('.academic-page')).toHaveCount(1);
await expect(page.locator('.academic-section').first()).toBeVisible();
await expect(page.locator('.proof-surface')).toHaveCount(1);
```

Keep async state assertions for loading, empty, success, rate-limit, and generic failure.

- [ ] **Step 6: Run full verification**

Run:

```bash
./scripts/verify-ui.sh full
```

Expected: secondary-page layout tests and proof-surface state tests pass.

- [ ] **Step 7: Commit secondary-page convergence**

Run:

```bash
git add about.html research.html projects.html experience.html education.html achievements.html news.html learning.html contributions.html assets/css/overhaul.css tests/readability-hierarchy.spec.js tests/proof-surfaces.spec.js tests/jon-barron-theme.spec.js
git commit -m "style: converge secondary pages to academic theme"
```

---

### Task 7: Remove Conflicting Legacy Visual Weight

**Files:**
- Modify: `assets/css/overhaul.css`
- Modify: `assets/css/mobile-optimizations.css`
- Modify: `assets/css/components/oss-summary.css`
- Modify: `_layouts/default.html`
- Modify: `docs/ui-maintenance.md`

- [ ] **Step 1: Remove or neutralize old app-like selectors**

In `assets/css/overhaul.css`, remove or override rules for old large-surface selectors that are no longer used:

```css
.hero-section,
.current-focus,
.home-support-stack,
.news-widget,
.timeline,
.card,
.btn,
.site-header,
.site-footer,
.theme-toggle,
.back-to-top,
.mobile-nav-drawer,
.mobile-nav-overlay {
  box-shadow: none;
  background-image: none;
}
```

Prefer deleting dead blocks if the selectors are no longer referenced by `rg`.

- [ ] **Step 2: Confirm no legacy scripts/styles are loaded**

Run:

```bash
rg "theme-toggle|app-navigation|advanced-interactions|developer-theme|custom.css|mobile-nav-drawer|back-to-top" _layouts _includes *.html assets/css assets/js
```

Expected: no references in loaded layout/page paths except comments or unused legacy files.

- [ ] **Step 3: Update UI maintenance docs**

In `docs/ui-maintenance.md`, add:

```markdown
## Jon Barron-Inspired Academic Theme Guardrails

- `assets/css/overhaul.css` remains the canonical stylesheet, but the active design target is now a narrow academic document: 800px max width, Lato typography, blue/orange links, compact publication rows, and minimal slash-separated navigation.
- Do not reintroduce card-heavy homepage sections, floating theme toggles, mobile drawers, gradient backgrounds, or duplicate navigation systems unless the project explicitly changes direction again.
- New research/publication surfaces should use `.academic-publication`; new secondary-page entries should use `.academic-entry`; new page wrappers should use `.academic-section` inside `.academic-page`.
- GitHub-driven proof surfaces must preserve loading, success, empty, rate-limit, and failure states even when styled minimally.
```

- [ ] **Step 4: Run dead-reference check**

Run:

```bash
rg "hero-section|current-focus|news-widget|timeline-item|publication-card|themeToggle|mobileMenuToggle|backToTop" . --glob '!_site/**'
```

Expected: only legacy backup files, old tests already edited away, or intentionally retained migration notes appear. Active layout/page files should not depend on these classes.

- [ ] **Step 5: Commit cleanup**

Run:

```bash
git add assets/css/overhaul.css assets/css/mobile-optimizations.css assets/css/components/oss-summary.css _layouts/default.html docs/ui-maintenance.md
git commit -m "style: remove legacy visual chrome from academic theme"
```

---

### Task 8: Final Verification and Acceptance Pass

**Files:**
- Modify: `.planning/REQUIREMENTS.md`
- Modify: `.planning/ROADMAP.md`
- Modify: `.planning/STATE.md`
- Optional Modify: `00-UI-REVIEW.md`

- [ ] **Step 1: Run full automated verification**

Run:

```bash
./scripts/verify-ui.sh full
```

Expected: all Playwright suites pass.

- [ ] **Step 2: Run manual browser smoke checks**

Serve the site:

```bash
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

Open and inspect:

```text
http://127.0.0.1:4000/
http://127.0.0.1:4000/publications
http://127.0.0.1:4000/research
http://127.0.0.1:4000/contributions
http://127.0.0.1:4000/about
```

Expected visual checks:

```text
- Page feels like an 800px centered academic document.
- Homepage name is centered and prominent, but not oversized.
- Portrait is circular and appears to the right on desktop, below copy on mobile.
- Profile links are slash-separated text links, not buttons/icons.
- Publications are compact media rows with 160px desktop media.
- No floating dark-mode button, back-to-top button, mobile drawer, gradients, or card-heavy chrome appears.
- GitHub proof surfaces remain understandable during loading/failure.
- No horizontal scrolling at 390px width.
```

- [ ] **Step 3: Update planning requirements as complete**

In `.planning/REQUIREMENTS.md`, mark `JB-01` through `JB-06` as complete.

- [ ] **Step 4: Update roadmap phase status**

In `.planning/ROADMAP.md`, mark Phase 6 complete and record the completion date:

```markdown
- [x] **Phase 6: Jon Barron-Inspired Theme Migration** - Convert the site to a narrow, text-first academic theme while preserving content, URLs, and verification. (completed 2026-04-30)
```

- [ ] **Step 5: Update project state**

In `.planning/STATE.md`, set:

```yaml
status: ready_to_complete
stopped_at: Phase 6 complete
last_activity: 2026-04-30 -- Jon Barron-inspired theme migration complete
```

- [ ] **Step 6: Commit final verification state**

Run:

```bash
git add .planning/REQUIREMENTS.md .planning/ROADMAP.md .planning/STATE.md docs/ui-maintenance.md
git commit -m "docs: complete academic theme migration"
```

Expected: commit succeeds after tests pass and manual checks are complete.

---

## Acceptance Criteria

- `./scripts/verify-ui.sh full` passes.
- Homepage matches the reference direction: narrow academic document, intro copy, circular portrait, centered name, slash-separated links.
- Publications and homepage publication previews use `.academic-publication` rows, not `.publication-card`, `.timeline-item`, or large card layouts.
- Shared shell has one minimal nav landmark and no floating theme toggle, back-to-top button, scroll progress, or mobile drawer.
- Secondary pages use `.academic-page` and `.academic-section` consistently.
- Contributions and OSS summary keep loading, success, empty, rate-limit, and failure behavior.
- Documentation explicitly states the new academic theme guardrails.

## Risks and Mitigations

- **Risk:** Removing the mobile drawer may make many nav links wrap awkwardly.
  **Mitigation:** Keep slash-separated links and allow wrapping; verify no horizontal overflow at 390px.

- **Risk:** Existing tests encode the previous design too strongly.
  **Mitigation:** Update tests to verify behavior and new design invariants, not old class names.

- **Risk:** CSS dead code remains and quietly affects pages.
  **Mitigation:** Use `rg` checks in Task 7 and prefer deleting unused blocks after the page migration is complete.

- **Risk:** Jon Barron's original implementation is table-based and not accessibility-forward.
  **Mitigation:** Adopt visual semantics only; keep semantic sections, landmarks, alt text, skip links, and browser verification.

- **Risk:** The site loses too much of Romel's current multi-page portfolio depth.
  **Mitigation:** Preserve all existing URLs and content, but make the homepage and lists quieter.

## Self-Review

- **Spec coverage:** JB-01 is covered by Task 4. JB-02 is covered by Task 5. JB-03 is covered by Task 3 and Task 7. JB-04 is covered by Task 6. JB-05 is covered by Task 6. JB-06 is covered by Task 2 and Task 8.
- **Placeholder scan:** No `TBD`, `TODO`, `implement later`, or undefined edge-case instructions remain.
- **Type/class consistency:** New class vocabulary is consistent across tasks: `academic-page`, `academic-intro`, `academic-link-row`, `academic-section`, `academic-entry`, `academic-publication`, and `academic-publication-list`.
