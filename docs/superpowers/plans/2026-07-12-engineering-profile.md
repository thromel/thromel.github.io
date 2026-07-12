# Engineering Profile Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a concise, balanced engineering-skills snapshot near the top of the homepage while preserving the existing Experience and Engineering sections as the evidence layer.

**Architecture:** Define four curated homepage skill groups in `_data/research.yml`, render them as a static dossier section directly after Identity, and style them through the canonical `assets/css/overhaul.css`. Extend the existing Playwright shell contract before implementation so section order, content boundaries, links, and responsive behavior remain machine-checkable.

**Tech Stack:** Jekyll, Liquid, YAML, CSS, Playwright, repository-local UI verification scripts

---

## File Map

- Modify `_data/research.yml`: own the curated four-group engineering profile content.
- Modify `index.html`: render the semantic homepage section and its links.
- Modify `assets/css/overhaul.css`: define four-column, two-column, and single-column layouts using existing design tokens.
- Modify `tests/research-first-shell.spec.js`: lock down order, copy, technology lists, exclusions, and destination links.
- Reference `docs/superpowers/specs/2026-07-12-engineering-profile-design.md`: approved content and scope boundary.

### Task 1: Add the failing homepage contract

**Files:**
- Modify: `tests/research-first-shell.spec.js`
- Reference: `docs/superpowers/specs/2026-07-12-engineering-profile-design.md`

- [ ] **Step 1: Update the expected homepage order**

Change `HOME_SECTIONS` to require the new section immediately after Identity:

```js
const HOME_SECTIONS = [
  'identity', 'engineering-profile', 'about', 'research', 'publications',
  'experience', 'education', 'engineering', 'recognition', 'milestones', 'contact',
];
```

- [ ] **Step 2: Add the engineering-profile assertions**

Inside `home presents the complete professional dossier in a deliberate order`, add:

```js
const engineeringProfile = page.locator('[data-home-engineering-profile]');
await expect(engineeringProfile).toHaveCount(1);
await expect(engineeringProfile.locator('[data-home-engineering-skill]')).toHaveCount(4);
await expect(engineeringProfile.locator('[data-home-engineering-skill] h3').allTextContents()).resolves.toEqual([
  'Backend and APIs',
  'AI and agent systems',
  'Systems and open source',
  'Cloud, data, and reliability',
]);
await expect(engineeringProfile).toContainText('Three years of production software and AI engineering');
await expect(engineeringProfile).toContainText('C#/.NET · EF Core · REST APIs · Microservices');
await expect(engineeringProfile).toContainText('Python · LangGraph · MCP · RAG · LLM evaluation');
await expect(engineeringProfile).toContainText('Rust · Go · TypeScript · Java · C++');
await expect(engineeringProfile).toContainText('AWS · PostgreSQL · MongoDB · Docker · Kubernetes · OpenTelemetry');
await expect(engineeringProfile).not.toContainText(/Solidity|Web3/i);
await expect(engineeringProfile.getByRole('link', { name: 'Work experience' })).toHaveAttribute('href', '/experience');
await expect(engineeringProfile.getByRole('link', { name: 'Engineering projects' })).toHaveAttribute('href', '/projects');
```

- [ ] **Step 3: Run the focused shell contract and verify it fails**

Run:

```bash
PATH="/Users/romel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" bash scripts/verify-ui.sh shell
```

Expected: FAIL because `engineering-profile` is absent from the rendered homepage and the section count/order no longer matches.

### Task 2: Add curated content and static markup

**Files:**
- Modify: `_data/research.yml`
- Modify: `index.html`
- Test: `tests/research-first-shell.spec.js`

- [ ] **Step 1: Add the curated homepage data**

Add this collection to `_data/research.yml` before `engineering:`:

```yaml
engineering_profile:
  intro: >-
    Three years of production software and AI engineering, alongside hands-on
    systems and open-source work.
  groups:
    - id: backend-apis
      title: "Backend and APIs"
      summary: "Production services and data-heavy analytics workflows."
      technologies:
        - C#/.NET
        - EF Core
        - REST APIs
        - Microservices
    - id: ai-agent-systems
      title: "AI and agent systems"
      summary: "LLM/RAG workflows and research tools connected to real software systems."
      technologies:
        - Python
        - LangGraph
        - MCP
        - RAG
        - LLM evaluation
    - id: systems-open-source
      title: "Systems and open source"
      summary: "Developer tools, program analysis, and multi-language open-source contributions."
      technologies:
        - Rust
        - Go
        - TypeScript
        - Java
        - C++
    - id: cloud-data-reliability
      title: "Cloud, data, and reliability"
      summary: "Deploying, tuning, and observing cloud-native services and data stores."
      technologies:
        - AWS
        - PostgreSQL
        - MongoDB
        - Docker
        - Kubernetes
        - OpenTelemetry
```

- [ ] **Step 2: Render the section after Identity**

Insert this block between the closing Identity `</section>` and the About section in `index.html`:

```liquid
<section class="home-dossier home-dossier-engineering-profile" data-home-section="engineering-profile" data-home-engineering-profile aria-labelledby="engineering-profile-title">
  <div class="site-frame">
    <div class="home-dossier-section-heading">
      <div><p class="eyebrow">Engineering profile</p><h2 id="engineering-profile-title">What I build with</h2></div>
      <p>{{ site.data.research.engineering_profile.intro }}</p>
    </div>
    <ol class="home-engineering-profile-grid">
      {% for group in site.data.research.engineering_profile.groups %}
      <li><article data-home-engineering-skill data-skill-group="{{ group.id }}">
        <h3>{{ group.title }}</h3>
        <p>{{ group.summary }}</p>
        <p class="home-engineering-profile-grid__technologies">{{ group.technologies | join: ' · ' }}</p>
      </article></li>
      {% endfor %}
    </ol>
    <p class="record-links home-engineering-profile__links"><a href="{{ '/experience' | relative_url }}">Work experience</a><a href="{{ '/projects' | relative_url }}">Engineering projects</a></p>
  </div>
</section>
```

- [ ] **Step 3: Build and confirm the contract still fails only on styling-independent mismatches**

Run:

```bash
PATH="/Users/romel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" bash scripts/verify-ui.sh shell
```

Expected: PASS for section order and content assertions. If another existing shell assertion fails, correct only the new markup or its exact approved content.

### Task 3: Add responsive canonical styling

**Files:**
- Modify: `assets/css/overhaul.css`
- Test: `tests/research-first-shell.spec.js`

- [ ] **Step 1: Add the desktop engineering-profile styles**

Add these rules beside the other full-dossier homepage components:

```css
.home-dossier-engineering-profile { padding-block: var(--space-4); }
.home-engineering-profile-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
.home-engineering-profile-grid li { min-width: 0; }
.home-engineering-profile-grid article { height: 100%; padding: var(--space-3); border-top: 3px solid var(--accent); background: var(--paper-elevated); }
.home-engineering-profile-grid h3 { font-size: clamp(1.05rem, 1.4vw, 1.3rem); }
.home-engineering-profile-grid article > p:not(.home-engineering-profile-grid__technologies) { margin: 0.65rem 0 0; font-size: 0.86rem; }
.home-engineering-profile-grid__technologies { margin: var(--space-2) 0 0; color: var(--muted); font-family: var(--mono); font-size: 0.67rem; line-height: 1.55; overflow-wrap: anywhere; }
.home-engineering-profile__links { margin-top: var(--space-3); }
```

- [ ] **Step 2: Add tablet and mobile grid rules**

Inside `@media (max-width: 860px)`, add:

```css
.home-engineering-profile-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
```

Inside `@media (max-width: 700px)`, add:

```css
.home-engineering-profile-grid { grid-template-columns: 1fr; }
```

- [ ] **Step 3: Run the shell suite**

Run:

```bash
PATH="/Users/romel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" bash scripts/verify-ui.sh shell
```

Expected: all shell checks pass, including the existing 320px horizontal-overflow contract.

- [ ] **Step 4: Commit the feature**

```bash
git add _data/research.yml index.html assets/css/overhaul.css tests/research-first-shell.spec.js
git commit -m "feat: add homepage engineering profile"
```

### Task 4: Complete release verification and publish

**Files:**
- Verify: `_site/index.html`
- Verify: `tests/research-first-shell.spec.js`

- [ ] **Step 1: Run the authoritative full UI suite**

Run:

```bash
PATH="/Users/romel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" bash scripts/verify-ui.sh full
```

Expected: all checks pass, including accessibility, image decoding, route safety, mobile overflow, and Lighthouse.

- [ ] **Step 2: Inspect the built homepage**

Serve `_site`, then verify desktop and 320px views in light and dark themes. Confirm:

- The new section follows Identity and leads naturally into About.
- Four cards have balanced visual weight and readable technology wrapping.
- The hero remains the dominant identity surface.
- Both links work and keyboard focus remains visible.
- `document.documentElement.scrollWidth` does not exceed `clientWidth`.

- [ ] **Step 3: Run repository safety checks**

```bash
git diff --check
git status --short --branch
git fetch origin main
git rev-list --left-right --count origin/main...HEAD
```

Expected: no whitespace errors, no unrelated files, and no remote commits missing locally.

- [ ] **Step 4: Push the verified commits to main**

```bash
git push origin HEAD:main
```

Expected: the design, implementation plan, and feature commits update `origin/main`.

- [ ] **Step 5: Verify CI and production**

Use `gh-axi run list` and `gh-axi run view <id>` until UI checks and Pages deployment complete successfully. Inspect `https://tanzimhromel.com/` and repeat the section-order, link, content, and 320px overflow checks against production.
