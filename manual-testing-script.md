# Manual Testing Script

## Automated baseline

1. Run `npm ci` and `npm run test:ui:install` on a fresh checkout.
2. Run `npm run test:ui`.
3. Treat a passing full suite as the baseline before visual review.

## Visual review

1. Check Home at 1440px and 390px: four blocks only, readable evidence rows, no horizontal overflow, and a labelled mobile menu.
2. Check Research: SREGym, ML-hosting RCE, and SHIFT all show a question, status, context, verification date, and meaningful artifacts. Confirm SHIFT says its manuscript is not public.
3. Check Publications, Projects, and Contributions: citations lead the publication page, project titles are not repeated, and contribution cards link to individual pull requests.
4. Mock or throttle GitHub when possible: confirm the compact count has loading, success, empty, rate-limit, error, timeout, and refresh behavior without a full PR feed.
5. Toggle system and stored light/dark preferences; confirm the initial page reflects the expected preference and keyboard focus remains visible.
6. Check the CV, ML-hosting research detail, blog/showcase, 404, and offline routes for the same shell and no overflow.
