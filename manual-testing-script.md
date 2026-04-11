# Manual Testing Script

## Automated Command
1. If the repo does not already have Playwright installed locally, run `npm install --no-save @playwright/test`.
2. Run `npx playwright test tests/proof-surfaces.spec.js tests/readability-hierarchy.spec.js tests/homepage-hierarchy.spec.js tests/navbar-layout.spec.js tests/shell-behavior.spec.js`.
3. For proof-surface-only verification, run `npx playwright test tests/proof-surfaces.spec.js`.
4. For readability-only verification, run `npx playwright test tests/readability-hierarchy.spec.js`.
5. For homepage-only verification, run `npx playwright test tests/homepage-hierarchy.spec.js`.

## Representative Pages
1. Test `Home`, `About`, `Learning`, and `Contributions` on desktop and mobile widths.
2. Verify no JavaScript errors in browser console on each page.
3. Confirm header, footer, and shell controls render consistently across the four pages.

## Theme and Visual State
1. Open `Home` and verify no visual flicker during first paint.
2. Click the theme toggle and confirm `data-theme` changes.
3. Refresh the page and confirm theme persists.
4. Repeat the theme toggle check on `About` and `Contributions`.

## Navigation and Accessibility
1. Press `Tab` from the top of each page and confirm skip links appear.
2. Activate `Skip to main content` and confirm focus jumps to page content.
3. Activate `Skip to navigation` and confirm focus moves to `#site-navigation`.
4. Confirm the active nav item has visual active state and `aria-current`.

## Home-Specific Shell Checks
1. Confirm highlight cards appear below the hero intro.
2. Confirm the section pill nav appears below the OSS summary area.
3. Click each section pill (`News`, `Publications`, `Research`, `Work`, `Projects`, `Skills`) and verify smooth scroll to section.
4. Scroll through the homepage and confirm the currently visible section pill highlights.

## Homepage Hierarchy
1. Run `npx playwright test tests/homepage-hierarchy.spec.js`.
2. On `Home` desktop, confirm the hero has one primary action row with only `Research` and `CV`.
3. Switch to a mobile viewport (`390x844`) and verify the hero text block appears before the portrait.
4. Confirm the secondary contact row feels quieter than the primary actions and does not read like a second CTA row.
5. Confirm the `home-section-nav` section nav appears below the intro support band, after current focus and before the longer homepage sections.
6. Click the pills and verify the URL hash and scroll position move to `homepage-news`, `homepage-publications`, `homepage-research`, `homepage-work`, `homepage-projects`, and `homepage-skills`.

## Readability Hierarchy
1. Run `npx playwright test tests/readability-hierarchy.spec.js`.
2. On `Home` desktop and mobile, confirm `news-description`, `timeline-description`, and current-focus copy read comfortably without shrinking below the surrounding body text floor.
3. On `About`, confirm the biography card reads as long-form body copy rather than dense footnote text, and that the title still leads the page.
4. On `Learning`, confirm `learning-section-copy`, `resource-description`, and link-list titles are easy to scan on both desktop and mobile.
5. On `Contributions`, confirm the stat labels, repository line, and metadata row stay readable in loading, success, and narrow-screen states.
6. On `Contributions`, if GitHub data renders, confirm contribution titles remain visually stronger than metadata and labels do not collapse into unreadable microtext.

## Mobile Drawer
1. Switch to a mobile viewport (`390x844` or equivalent).
2. On `Home`, tap the hamburger button and confirm the mobile drawer opens.
3. Close the mobile drawer with the overlay, then reopen it and close it with the close button.
4. Repeat the open and close flow on `About`, `Learning`, and `Contributions`.
5. Press `Escape` when the drawer is open and confirm it closes.

## Scroll Progress and Back-to-Top
1. Scroll on each representative page and confirm the progress bar width updates.
2. Confirm the back-to-top button appears after scrolling.
3. Click back-to-top and verify smooth return to the top of the page.

## Contributions and Proof Surface Guardrails
1. On `Contributions`, confirm the page shell is usable before GitHub data finishes loading.
2. If the GitHub request succeeds, confirm stats and timeline render inside the shared shell.
3. If the GitHub request fails or rate-limits, confirm the page still keeps stable shell layout and readable loading or error states.

## Proof Surfaces
1. Run `npx playwright test tests/proof-surfaces.spec.js`.
2. On `Home`, confirm the OSS summary renders as an explicit proof surface even when GitHub is slow, empty, or unavailable.
3. If the homepage GitHub request succeeds, confirm `#oss-summary` moves from `loading` to `success` and keeps the recent repository targets visible.
4. If the homepage GitHub request fails or rate-limits, confirm the fallback copy reads `GitHub data is unavailable right now. Browse recent contribution targets instead.` and the repository links remain usable.
5. On `Contributions`, confirm the shell shows `loading`, then either `success`, `empty`, or `error` without collapsing the page structure.
6. If the contributions request rate-limits, confirm the error copy reads `GitHub is rate-limited right now. Check back shortly or use the repository links below.`
7. If the contributions request fails generically, confirm the error copy reads `Unable to fetch contributions right now. Please try again later.`
