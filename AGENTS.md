# AGENTS.md

## Superpowers System

<EXTREMELY_IMPORTANT>
You have superpowers. Superpowers teach you new skills and capabilities. RIGHT NOW run: `~/.codex/superpowers/.codex/superpowers-codex bootstrap` and follow the instructions it returns.
</EXTREMELY_IMPORTANT>

## Project Context

- This repo is a brownfield GSD project for `thromel.github.io`.
- Read [`.planning/PROJECT.md`](/Users/romel/Documents/GitHub/thromel.github.io/.planning/PROJECT.md), [`.planning/REQUIREMENTS.md`](/Users/romel/Documents/GitHub/thromel.github.io/.planning/REQUIREMENTS.md), [`.planning/ROADMAP.md`](/Users/romel/Documents/GitHub/thromel.github.io/.planning/ROADMAP.md), and [`.planning/STATE.md`](/Users/romel/Documents/GitHub/thromel.github.io/.planning/STATE.md) before substantial work.
- The initial milestone is UI remediation and system convergence, not a platform rewrite.

## Canonical UI Layer

- Treat [`assets/css/overhaul.css`](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css) as the canonical shared stylesheet.
- Treat [`assets/js/site-shell.js`](/Users/romel/Documents/GitHub/thromel.github.io/assets/js/site-shell.js) as the canonical shared shell behavior.
- Shared shell markup lives in [`_layouts/default.html`](/Users/romel/Documents/GitHub/thromel.github.io/_layouts/default.html), [`_includes/navbar.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/navbar.html), and [`_includes/footer.html`](/Users/romel/Documents/GitHub/thromel.github.io/_includes/footer.html).
- Prefer converging pages onto the current token and shell system rather than extending legacy theme/navigation layers.

## Brownfield Warnings

- Legacy parallel UI layers still exist in `assets/js/theme-toggle.js`, `assets/js/app-navigation.js`, `assets/js/advanced-interactions.js`, `assets/css/developer-theme.css`, and `assets/css/custom.css`.
- Do not reintroduce competing theme models, duplicate toggles, or `.navbar`-era assumptions unless explicitly removing or migrating them.
- `contributions.html` and some other pages still contain inline style/script islands; reduce them when practical, but preserve behavior while migrating.

## Verification Focus

- Verify desktop and mobile behavior for shared shell changes.
- Verify async GitHub-driven states for the homepage OSS summary and [`contributions.html`](/Users/romel/Documents/GitHub/thromel.github.io/contributions.html).
- Prefer repo-local planning artifacts and current source files over stale README-era assumptions.
