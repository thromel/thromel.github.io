# Manual Testing Script

## Core Smoke Checks
1. Open Home page and verify no visual flicker during load.
2. Confirm typography renders with `Plus Jakarta Sans` body style and readable serif accents.
3. Verify no JavaScript errors in browser console.

## Theme and Visual State
1. Click theme toggle in bottom corner.
2. Refresh the page and confirm theme persists.
3. Navigate to `Work`, `Research`, and `Projects` and confirm theme remains consistent.

## Navigation and Accessibility
1. Press `Tab` from top of page and confirm skip links appear.
2. Activate `Skip to main content` and confirm focus jumps to page content.
3. Activate `Skip to navigation` and confirm focus moves to main nav.
4. Confirm active nav item has visual active state and `aria-current`.

## Home IA and Scanning
1. Confirm highlight cards appear below hero intro.
2. Confirm section pill nav appears below OSS summary.
3. Click each section pill (`News`, `Publications`, `Research`, `Work`, `Projects`, `Skills`) and verify smooth scroll to section.
4. Scroll through sections and confirm the currently visible section pill highlights.

## Mobile UX (<= 768px)
1. Open responsive mode.
2. Tap hamburger button and confirm drawer opens.
3. Tap overlay and close button; confirm drawer closes in both cases.
4. Press `Escape` (if keyboard available) and confirm drawer closes.
5. Verify touch targets feel comfortable for nav links, theme toggle, and back-to-top.

## Back-to-Top and Progress
1. Scroll down and confirm progress bar width updates.
2. Confirm back-to-top button appears after scrolling.
3. Click back-to-top and verify smooth return to page top.

## OSS Summary
1. On Home page, confirm OSS summary appears when GitHub API succeeds.
2. If API is rate-limited, confirm summary remains hidden without layout breakage.

## Regression Spot Checks
1. Open `About`, `Contributions`, `News`, and `Learning`.
2. Confirm header/footer render correctly and theme toggle works.
3. Confirm no broken layout shifts on mobile and desktop.
