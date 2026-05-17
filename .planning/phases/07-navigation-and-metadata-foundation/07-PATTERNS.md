# Phase 7 Pattern Map

## Navigation Data Pattern

Source file: `_data/navigation.yml`

Current pattern:

- A YAML list of objects with `name` and `url`.
- `name` is the active-state key because pages use `navbar_title`.

Required continuation:

- Keep `name` stable for active-state matching.
- Use optional `label` only if display text needs to differ from the active-state key.
- Prefer adding `primary_pages` and `secondary_pages` over scattering route arrays in templates.

## Header Pattern

Source file: `_includes/navbar.html`

Current pattern:

- One `<nav id="site-navigation" class="academic-nav">`.
- Loop through navigation data.
- Add slash separators between links.
- Add one `#themeToggle` button after links.

Required continuation:

- Keep the same nav ID/class.
- Render `site.data.navigation.primary_pages`.
- Preserve `aria-current="page"` logic.
- Keep one theme toggle.

## Footer Pattern

Source file: `_includes/footer.html`

Current pattern:

- `<footer class="academic-footer">`.
- Slash-separated inline links.

Required continuation:

- Add a second quiet link row for secondary routes.
- Do not introduce a card, sitemap block, or multi-column footer.

## Styling Pattern

Source file: `assets/css/overhaul.css`

Current pattern:

- `.academic-nav`, `.academic-footer p`, and `.academic-link-row` share flex-wrap, center alignment, and slash-separated rhythm.
- Tokens use `--color-*`, `--text-*`, and `--container-max`.

Required continuation:

- Add minimal footer secondary styles if needed.
- Keep styles in `overhaul.css`.
- Do not revive `developer-theme.css`, `custom.css`, or `.navbar` assumptions.

## Testing Pattern

Source files:

- `tests/navbar-layout.spec.js`
- `tests/shell-behavior.spec.js`

Current pattern:

- Use Playwright with `PLAYWRIGHT_TEST_BASE_URL`.
- Use fixed desktop/mobile viewports.
- Assert DOM landmarks and route behavior rather than screenshots.

Required continuation:

- Extend `navbar-layout.spec.js` for route grouping and active state.
- Add a small source check for front-matter descriptions, either in an existing spec if built output exposes it or as a Node-backed test/spec helper.
