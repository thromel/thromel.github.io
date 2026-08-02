# Tanzim Hossain Romel — Portfolio

[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-0B6B57)](https://www.w3.org/TR/WCAG22/)
[![Performance](https://img.shields.io/badge/Core%20Web%20Vitals-Budgeted-0B6B57)](https://web.dev/articles/vitals)
[![Responsive](https://img.shields.io/badge/Reflow-320px-0B6B57)](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

Source for [tanzimhromel.com](https://tanzimhromel.com), an evidence-first research and engineering portfolio built with Jekyll and GitHub Pages.

The site presents one coherent profile for two audiences:

- Professors can quickly assess the University of Alberta trajectory, research questions, publications, collaborations, and direct artifacts.
- Engineering recruiters can quickly assess about three years of professional software-engineering experience, former IQVIA work, selected systems, outcomes, and open-source proof.

The public research focus is AI4SE, LLM4Coding, Trustworthy AI, long-horizon coding agents, and AI for SRE.

## Experience design

The visual direction is “Alberta field notebook × systems evidence ledger”: warm editorial paper, mineral ink, spruce actions, restrained copper signals, fine rules, and dated evidence records. Light and dark modes are independently tuned.

The homepage is deliberately selective. It acts as a website abstract and routes visitors to deeper Research, Engineering, Publications, Experience, and CV records instead of reproducing the complete CV.

Key interaction contracts:

- One horizontal header with permanent Research and Engineering paths.
- An in-flow mobile menu that remains usable without JavaScript and fails open if the shared shell cannot load.
- A labelled, persistent theme control with a stable first paint.
- Semantic evidence records that separate active work, submissions, publications, and merged engineering contributions.
- Curated contribution proof that remains useful when GitHub is slow, rate-limited, or unavailable.

## Architecture

```text
├── _data/
│   ├── profile.yml              # Background, experience, education, and links
│   ├── navigation.yml           # Header and footer information architecture
│   ├── research.yml             # Research agenda and selective homepage records
│   └── contributions.yml        # Curated open-source evidence
├── _includes/
│   ├── navbar.html              # Canonical header
│   ├── footer.html              # Canonical footer directory
│   ├── current-status.html      # Build-time currentness helper
│   ├── experience-date.html     # Semantic start/end date ranges
│   ├── publication-record.html  # Citation/status evidence record
│   └── project-record.html      # Scope/role/outcome project record
├── _layouts/
│   ├── default.html             # Metadata, first-paint theme, and shared shell
│   ├── post.html                # Writing layout
│   └── showcase.html            # Engineering case-study layout
├── _showcase/                   # Project and systems narratives
├── assets/
│   ├── css/overhaul.css         # Canonical tokens, components, and responsive rules
│   ├── js/site-shell.js         # Theme, mobile menu, and skip-link behavior
│   ├── js/contribution-count.js # Bounded GitHub count enhancement
│   └── images/                  # Local visual evidence and optimized media
├── tests/                       # Playwright, Axe, integrity, and quality gates
├── scripts/verify-ui.sh         # Canonical local verification entry point
└── .planning/                   # GSD project context and design contracts
```

Shared presentation belongs in [`assets/css/overhaul.css`](assets/css/overhaul.css). Shared shell behavior belongs in [`assets/js/site-shell.js`](assets/js/site-shell.js). Do not add a parallel theme, navigation layer, page framework, or client-side audience mode.

## Local development

### Prerequisites

- Ruby and Bundler for Jekyll
- Node.js 20–22 or 24+ and npm for browser verification
- A Playwright-supported Chromium installation

### Setup

```bash
git clone https://github.com/thromel/thromel.github.io.git
cd thromel.github.io
bundle install
npm ci
npm run test:ui:install
```

Start the development server:

```bash
bundle exec jekyll serve --livereload
```

Open `http://127.0.0.1:4000`.

## Verification

Run the complete production-build and browser suite:

```bash
bash scripts/verify-ui.sh full
```

Run the faster shell contract when working only on navigation or theme behavior:

```bash
bash scripts/verify-ui.sh shell
```

The full gate covers:

- Desktop and phone layouts, including 320px reflow and horizontal-overflow checks.
- Research, Engineering, CV, footer, mobile-menu, keyboard, and theme paths.
- JavaScript-off usefulness and GitHub success, incomplete, empty, rate-limit, error, timeout, and retry states.
- Serious and critical Axe findings across core routes in both themes.
- Exactly one H1 per built page, semantic dates, intrinsic image dimensions, and accessible new-tab names.
- Internal links, fragments, placeholder links, local assets, canonical metadata, sitemap, robots, and safe new-tab attributes.
- CSS, JavaScript, raster-image, homepage-transfer, LCP, CLS, and a PerformanceEventTiming-based INP candidate from trusted browser interactions.

Current implementation budgets are defined in [the Phase 12 UI specification](.planning/phases/12-dual-audience-overhaul/12-UI-SPEC.md):

- Canonical CSS: at most 25KB gzip.
- Initial first-party JavaScript: at most 20KB gzip.
- First-view portrait: at most 120KB.
- Any raster image: at most 500KB.
- Initial mobile homepage transfer: at most 1.5MB.
- LCP: at most 2.5 seconds.
- CLS: at most 0.1.
- INP candidate: at most 200 milliseconds.

## Accessibility

The maintained contract targets WCAG 2.2 AA and includes:

- Contrast-safe light and dark palettes.
- Visible keyboard focus and a skip link to the main landmark.
- Semantic headings, landmarks, lists, definitions, dates, and labelled controls.
- Practical 44px primary controls.
- Lossless reflow at 320 CSS pixels and useful layouts at 200% zoom.
- Reduced-motion handling and content that does not depend on animation.
- Intrinsic image dimensions and stable loading behavior.

Automated checks support review but do not replace screen-reader and cross-browser testing for high-risk changes.

## Content and evidence rules

- Link named institutions, employers, programs, products, papers, repositories, and direct proof to authoritative destinations.
- State the author’s contribution, status or outcome, methods, verification date, and evidence boundary when those facts are public and supportable.
- Do not present submissions, active research, or systems prototypes as peer-reviewed publications.
- Do not invent metrics, affiliations, funding, technologies, deployments, or outcomes to fill a layout.
- Preserve existing routes and redirects when restructuring a page.

## Contributing

1. Create a focused branch.
2. Read [`docs/ui-maintenance.md`](docs/ui-maintenance.md) and the active Phase 12 design contract.
3. Make shared UI changes through the canonical CSS, JavaScript, and shell files.
4. Run `bash scripts/verify-ui.sh full`.
5. Include screenshots and the verification result with visual pull requests.

## Technology

- Jekyll and Liquid
- Semantic HTML and token-driven CSS
- Small progressive-enhancement JavaScript modules
- GitHub Pages and GitHub Actions
- Playwright, Axe, and Lighthouse

## Contact

- [Email](mailto:tanhromel@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/thromel)
- [GitHub](https://github.com/thromel)
- [Google Scholar](https://scholar.google.com/citations?user=zHV4EU8AAAAJ)
- [ORCID](https://orcid.org/0009-0009-2432-8960)

## Acknowledgements

The repository began from Tianyu Lou’s [academic-homepage](https://github.com/luost26/academic-homepage) Jekyll template. Its current information architecture, visual system, shell, evidence records, and verification contracts are project-specific.

## License

[MIT](LICENSE)
