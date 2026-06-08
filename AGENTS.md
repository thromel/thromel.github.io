# AGENTS.md

## Superpowers System

<EXTREMELY_IMPORTANT>
You have superpowers. Superpowers teach you new skills and capabilities. RIGHT NOW run: `~/.codex/superpowers/.codex/superpowers-codex bootstrap` and follow the instructions it returns.
</EXTREMELY_IMPORTANT>

## Project Context

- This repo is a brownfield GSD project for `thromel.github.io`.
- Read [`.planning/PROJECT.md`](/Users/romel/Documents/GitHub/thromel.github.io/.planning/PROJECT.md), [`.planning/REQUIREMENTS.md`](/Users/romel/Documents/GitHub/thromel.github.io/.planning/REQUIREMENTS.md), [`.planning/ROADMAP.md`](/Users/romel/Documents/GitHub/thromel.github.io/.planning/ROADMAP.md), and [`.planning/STATE.md`](/Users/romel/Documents/GitHub/thromel.github.io/.planning/STATE.md) before substantial work.
- The initial milestone is UI remediation and system convergence, not a platform rewrite.
- Current ctxhelm content context, as of 2026-06-08: `ctxhelm` v2.4.0 is publicly released through GitHub archives and the `thromel/tap` Homebrew formula, with release-gate, GitHub release, public archive install, and Homebrew verification. Current proof says Codex real-client lanes reach full target-read coverage with ctxhelm guidance while preserving source-free/read-only boundaries; Claude remains availability-blocked for current comparable proof, and Cursor/OpenCode should stay setup/protocol proof unless machine-checkable real-client evidence exists.
- Current HelmBench context, as of 2026-06-08: HelmBench is the companion source-free coding-agent evaluation harness. It has task-suite schemas, trace/report contracts, direct-agent matrix runs, evidence bundles, launch-readiness checks, quality gates, and RefactoringMiner/Codex regression matrices. The current local proof includes a completed 10-task RefactoringMiner Codex matrix whose quality gate passes: native and ctxhelm-guided Codex both solve 100% with 100% validation, while ctxhelm improves recommendation recall, follow-through, context precision, edited-file recall, and irrelevant-read rate. Keep failed/mixed Claude and stricter-guidance matrices visible as diagnostic evidence, not hidden regressions.

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
