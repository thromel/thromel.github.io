---
phase: 07
slug: navigation-and-metadata-foundation
status: ready
created: 2026-05-17
---

# Phase 7 UI Design Contract

## Intent

Make the academic shell easier to scan without making the site feel smaller. The header should expose the strongest evidence routes. The footer should carry the secondary routes clearly enough that no page becomes hidden.

## Layout Contract

### Header

- Keep one centered academic navigation block with `id="site-navigation"` and class `academic-nav`.
- Keep slash separators between links.
- Render only primary routes in the header:
  - Home
  - Research
  - Publications
  - Projects
  - Contributions
  - CV
- Keep one theme toggle at the end of the header navigation.
- Do not add a drawer, logo mark, hamburger menu, floating controls, or app-style navbar.

### Footer

- Keep the current copyright/contact line.
- Add a secondary route row below it:
  - About
  - Education
  - Work
  - Achievements
  - News
  - Learning
- Use the same quiet slash-separated text style as the academic shell.
- Secondary route row must wrap cleanly on 390px mobile width.

## Interaction Contract

- `aria-current="page"` must remain on the active primary nav item when the active page is in the header.
- Secondary footer links do not need `aria-current`, but they must remain normal reachable links.
- Theme toggle behavior and saved preference must not change.
- Skip links must still target `#main-content` and `#site-navigation`.

## Visual Contract

- Header should be visually lighter than before because it has fewer links, not because it uses a new visual language.
- Footer secondary links should be visible but quieter than the header.
- Keep the current typography, color tokens, and academic page width.
- Avoid adding cards, dropdowns, badges, hover panels, or oversized route labels.

## Metadata Contract

- Core pages should have `description` front matter.
- Descriptions should be one sentence and page-specific.
- Phase 7 does not need to emit complete Open Graph or Twitter tags; Phase 10 owns preview output.

## Verification Contract

- Desktop and mobile should have no horizontal overflow.
- Header should include every primary route and exclude secondary-only routes.
- Footer should include every secondary route.
- Active state should be verified on representative primary routes.
- Metadata source should be verified with a deterministic source check.
