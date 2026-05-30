# Complete UI/UX Audit and Overhaul Notes

Date: 2026-05-30
Branch: main

## Target Audience

Primary readers are faculty, research collaborators, open-source maintainers, and senior engineers or recruiters evaluating Tanzim Hossain Romel's credibility. They need fast evidence, not a marketing landing page. The interface should make the research direction, current systems work, public artifacts, and practical engineering track record easy to scan in under one minute, while still rewarding deeper reading.

Secondary readers include peers, future teammates, and admissions or scholarship reviewers. They need clear navigation, accessible text, reliable CV/publication paths, and enough visual polish to trust that the portfolio is maintained.

## Audit Findings From Rendered Baseline

Evidence captured with Playwright before the changes:

- `output/playwright/baseline/home-desktop.png`
- `output/playwright/baseline/home-mobile.png`
- `output/playwright/baseline/projects-desktop.png`
- `output/playwright/baseline/projects-mobile.png`
- `output/playwright/baseline/contributions-desktop.png`
- `output/playwright/baseline/contributions-mobile.png`
- `output/playwright/baseline/home-dark-desktop.png`
- `output/playwright/baseline/projects-dark-desktop.png`
- `output/playwright/baseline/contributions-dark-mobile.png`

Key findings:

- The compact academic direction was appropriate for the audience, but the light theme leaned too heavily on beige paper tones and felt older than the current content.
- Homepage hierarchy was readable, but the professional positioning was implicit. A direct evidence-oriented eyebrow helps visitors classify the site faster.
- Projects had good content but did not clearly separate current high-signal work from older or learning-rooted narratives. Mobile cards were especially tall and the old absolute "Ongoing" badge competed with the first project row.
- Contributions depended too heavily on live GitHub activity. Curated proof needed to be visible before the API finishes, fails, or rate-limits.
- Metadata coverage had page descriptions, but the shared layout did not emit canonical, Open Graph, and Twitter preview tags.
- Dark mode was functional, but needed to be verified against the real project and contribution surfaces after the theme refresh.

## Overhaul Direction

The new direction is an evidence-first academic dossier:

- Keep the narrow academic layout, real portrait, real project media, and row-based reading rhythm.
- Replace the beige-heavy palette with a cleaner slate, blue, and teal system that reads as academic but current.
- Use `IBM Plex Sans` for precise UI and metadata and `Source Serif 4` for academic headings.
- Present projects as current evidence first, then capstone/build narratives, then a compact project index.
- Present open-source work as curated contribution proof first, with live GitHub data as supporting evidence.
- Emit reliable social and canonical metadata from the shared default layout.
- Verify desktop, mobile, async GitHub states, SEO metadata, and dark-mode readability through Playwright.

## Verification Artifacts

Post-overhaul screenshots captured with Playwright:

- `output/playwright/after/home-desktop.png`
- `output/playwright/after/home-mobile.png`
- `output/playwright/after/projects-desktop.png`
- `output/playwright/after/projects-mobile.png`
- `output/playwright/after/contributions-desktop.png`
- `output/playwright/after/contributions-mobile.png`
- `output/playwright/after/projects-dark-desktop.png`
- `output/playwright/after/contributions-dark-mobile.png`

New automated coverage:

- `tests/v11-overhaul.spec.js` verifies project hierarchy and media sizing, curated contribution proof, GitHub rate-limit fallback, canonical/OG/Twitter metadata, and dark-mode card contrast.
- `scripts/verify-ui.sh full` includes the new v1.1 overhaul spec.

Final verification run:

- `./scripts/verify-ui.sh full` rebuilt the Jekyll site and passed 55 Playwright tests.
