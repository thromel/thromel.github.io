# Testing Map

Testing exists, but it is light, mostly browser-level, and not fully backed by a committed toolchain manifest.

## Automated Checks Present

- One Playwright regression spec exists at [`tests/navbar-layout.spec.js`](/Users/romel/Documents/GitHub/thromel.github.io/tests/navbar-layout.spec.js).
- That test checks homepage navigation layout, absence of an old `TR` marker, and desktop alignment assumptions.
- The Playwright spec expects a running local site at `http://127.0.0.1:4000`, so it is not self-starting.
- Browser console smoke checks are defined in [`browser-console-tests.js`](/Users/romel/Documents/GitHub/thromel.github.io/browser-console-tests.js).

## Manual QA Assets

- A documented smoke checklist exists in [`manual-testing-script.md`](/Users/romel/Documents/GitHub/thromel.github.io/manual-testing-script.md).
- The manual script covers theme persistence, skip links, mobile drawer behavior, scroll progress, back-to-top, OSS summary behavior, and regression spot checks on several pages.
- The UI audit already relied on rendered browser inspection of [`index.html`](/Users/romel/Documents/GitHub/thromel.github.io/index.html), [`projects.html`](/Users/romel/Documents/GitHub/thromel.github.io/projects.html), and [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html).

## Tooling Gaps

- There is no `package.json` at the repo root to declare Playwright or browser test dependencies.
- [`README.md`](/Users/romel/Documents/GitHub/thromel.github.io/README.md) mentions `npx axe-core`, `npx lighthouse`, `npx pa11y`, and `npx html-validate`, but those tools are not pinned in-repo.
- There is no CI configuration in the mapped source that clearly runs browser, accessibility, or performance checks on every change.

## Coverage Characteristics

- Current automated coverage is narrow and mostly centered on navbar regression behavior.
- There are no obvious unit tests for JavaScript modules such as [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js) or [`assets/js/oss-summary.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/oss-summary.js).
- There are no stylesheet regression tests for major CSS surfaces like [`assets/css/overhaul.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css).
- GitHub API failure and rate-limit behavior is only covered through runtime fallbacks in the UI, not through explicit automated tests.

## Practical Testing Workflow

- Start the site locally with Jekyll before running browser checks.
- Use the Playwright spec in [`tests/navbar-layout.spec.js`](/Users/romel/Documents/GitHub/thromel.github.io/tests/navbar-layout.spec.js) for a minimal regression signal.
- Use [`manual-testing-script.md`](/Users/romel/Documents/GitHub/thromel.github.io/manual-testing-script.md) for end-to-end visual and accessibility smoke checks after UI changes.
- For client-rendered pages like [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html), validate both success and GitHub API failure states in a real browser session.
