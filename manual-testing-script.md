# Manual Testing Script

## Automated Command
1. If the repo does not already have Playwright installed locally, run `npm install --no-save @playwright/test`.
2. Run `npx playwright test tests/navbar-layout.spec.js tests/shell-behavior.spec.js`.

## Representative Pages
1. Test `Home`, `About`, and `Contributions` on desktop and mobile widths.
2. Verify no JavaScript errors in browser console on each page.
3. Confirm header, footer, and shell controls render consistently across the three pages.

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

## Mobile Drawer
1. Switch to a mobile viewport (`390x844` or equivalent).
2. On `Home`, tap the hamburger button and confirm the mobile drawer opens.
3. Close the mobile drawer with the overlay, then reopen it and close it with the close button.
4. Repeat the open and close flow on `About` and `Contributions`.
5. Press `Escape` when the drawer is open and confirm it closes.

## Scroll Progress and Back-to-Top
1. Scroll on each representative page and confirm the progress bar width updates.
2. Confirm the back-to-top button appears after scrolling.
3. Click back-to-top and verify smooth return to the top of the page.

## Contributions and Proof Surface Guardrails
1. On `Contributions`, confirm the page shell is usable before GitHub data finishes loading.
2. If the GitHub request succeeds, confirm stats and timeline render inside the shared shell.
3. If the GitHub request fails or rate-limits, confirm the page still keeps stable shell layout and readable loading or error states.
