---
phase: 12
slug: dual-audience-overhaul
status: complete
created: 2026-08-02
---

# Phase 12 UI/UX Research

## Conclusion

The strongest shared pattern is an evidence-first editorial portfolio: institutional identity and one research thesis arrive first, while a recruiter can reach a small number of role-and-outcome engineering records immediately. Research and engineering should be visible paths through one information architecture, not separate modes or a client-side filter.

## Faculty Audience

- Strong researcher sites open with role, institution, a specific research mission, and direct CV, paper, code, or profile links.
- Research themes are easier to evaluate when framed as questions or claims and connected to concrete artifacts.
- Selected outputs need readable contribution summaries and explicit status; active work should precede archives.
- MIT Communication Lab describes the homepage as a website abstract and recommends compact poster-like project explanations: https://mitcommlab.mit.edu/aeroastro/2023/04/24/create-content-for-your-personal-website-using-good-communication-techniques/
- Berkeley recommends a simple shallow menu, neutral foundations, restrained accents, and ample whitespace: https://townsendcenter.berkeley.edu/blog/personal-academic-webpages-how-tos-and-tips-better-site
- Direct exemplars reviewed: https://schasins.com/, https://jonbarron.info/, https://cs.stanford.edu/people/pliang/, https://cseweb.ucsd.edu/~npolikarpova/, and https://faculty.washington.edu/ajko/.

## Engineering Recruiter Audience

- GitHub recommends highlighting roughly three to five relevant projects because hiring reviewers may only spend a few minutes scanning: https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume
- Engineering evidence is most useful when it names the problem or context, the candidate's exact role, the outcome, methods or stack, and a direct proof destination.
- Selected work should carry the strongest systems rather than a large technology cloud or decorative contribution graph.
- Direct hybrid or engineering exemplars reviewed: https://willcrichton.net/, https://brittanychiang.com/, https://leerob.com/, https://jvns.ca/, and https://simonwillison.net/.

## Accessibility and Performance

- WCAG 2.2 AA requires 4.5:1 normal-text contrast, 3:1 large-text contrast, visible keyboard focus, a 24 CSS-pixel minimum target size, and lossless reflow at 320 CSS pixels: https://www.w3.org/TR/WCAG22/ and https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- Practical controls should target 44 to 48 CSS pixels even where WCAG's minimum is smaller.
- Current Core Web Vitals good thresholds are LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1 at the 75th percentile: https://web.dev/articles/vitals
- Decorative gradients must not be the only contrast surface behind essential text.
- Give images intrinsic dimensions, prioritize the first-view portrait, lazy-load below-fold images, and keep the page useful before scripts enhance it.

## Current Guidance Refresh — 2026-08-02

The final audit refreshed the design contract against maintained frontend-agent guidance and current platform documentation rather than installing another permanent toolchain:

- Vercel's current Web Interface Guidelines emphasize semantic controls, visible focus, reduced motion, non-obscured anchored headings, intentional touch behavior, balanced heading wraps, pretty body wraps, image dimensions, dark-mode browser metadata, and release checks for long content and narrow screens: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
- Anthropic's maintained frontend-design skill reinforces a distinct visual point of view, deliberate typography, and production-grade responsive behavior rather than generic portfolio styling: https://github.com/anthropics/skills/tree/main/skills/frontend-design
- Impeccable 4.0.4 adds a useful bounded workflow for portfolio surfaces: inspect once across desktop and mobile, repair the full batch, confirm once, and stop polishing without new evidence: https://github.com/pbakaus/impeccable
- W3C's WCAG 2.2 guidance, updated February 11, 2026, keeps 24×24 CSS pixels as the minimum target-size baseline while allowing inline-text and adequately spaced exceptions: https://www.w3.org/WAI/WCAG22/understanding/ and https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- MDN documents `theme-color` as progressive browser-UI metadata; the site now synchronizes it with the user's explicit light/dark choice: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color
- web.dev's INP guidance, updated September 2, 2025, retains 200ms as the good-response threshold and recommends measuring real interaction flows: https://web.dev/articles/optimize-inp

Applicable rules were added to the canonical shell: theme-aware browser chrome, `touch-action: manipulation`, an intentional tap highlight, 44px component targets, balanced headings, pretty body copy, anchored-heading offset, and a public-build boundary that excludes tests, internal documentation, generated screenshots, and manuscript tooling. Product-specific advice that conflicts with a personal evidence portfolio—such as generic second-person marketing copy—was not adopted.

## Design Implications

- First screen: Alberta status, concise research thesis, approximately three years of experience/former IQVIA bridge, exact research-interest line, and three clear actions for Research, Engineering, and CV.
- Use a horizontal header with a dedicated CV action and a mobile disclosure button.
- Use a warm paper canvas, mineral text, spruce primary accent, restrained copper secondary accent, and a separately tuned deep mineral dark theme.
- Typography should mix an editorial display serif, a highly legible sans, and monospace only for dates and evidence labels.
- Use one memorable evidence-trace motif: index numbers, fine rules, verified dates, and direct artifact links.
- Keep motion small and structural; respect reduced motion and avoid scroll-reveal dependencies, animated blobs, glassmorphism, particles, and parallax.

## Proposed Homepage Order

1. Identity and audience routes
2. Selected research and engineering evidence
3. Three connected research questions
4. Engineering experience and outcomes
5. Publications and open-source proof
6. Recent news and education trajectory
7. Collaboration and contact

## Verification Targets

- WCAG 2.2 AA serious/critical Axe gate across core routes and both themes.
- No horizontal overflow from 320px through 1440px and at 200 percent zoom.
- Touch targets at least 44px for primary controls.
- CSS at or below 25KB gzip and initial JavaScript at or below 20KB gzip.
- LCP at or below 2.5 seconds and CLS at or below 0.1 in the local Lighthouse gate.
- All important homepage content present with JavaScript disabled; async GitHub states remain enhancement-only.
