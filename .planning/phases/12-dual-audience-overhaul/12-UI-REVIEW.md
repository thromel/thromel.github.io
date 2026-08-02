# Phase 12 — UI Review

**Audited:** 2026-08-02

**Baseline:** Approved `12-UI-SPEC.md`, `12-CONTEXT.md`, and abstract six-pillar standards

**Screenshots:** Captured with Playwright MCP at desktop, tablet, 390px, 375px, and 320×800 in light and dark themes

**Verification:** `scripts/verify-ui.sh full` passed 42/42 tests under Node 20; the findings below identify contract gaps that the current suite does not cover

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 2/4 | Homepage copy is exact, but secondary routes still publish hype, incomplete evidence anatomy, and undifferentiated publication states. |
| 2. Visuals | 2/4 | The research-first shell is coherent, but faux thumbnails, an oversized institutional mark, an unstyled proof board, and a giant technology inventory break the ledger contract. |
| 3. Color | 2/4 | Contract tokens are present, but dark-theme pagination fails contrast and copper is used beyond its reserved signal role. |
| 4. Typography | 2/4 | The canonical scale is disciplined, but 29 built routes render multiple H1s and authored SVGs/page copy introduce off-contract type. |
| 5. Spacing | 2/4 | Token values are correct, but the 320×800 first screen, mobile header, tablet trace breakpoint, and record geometry miss explicit measurements. |
| 6. Experience Design | 2/4 | Core interactions work, but no-JS contributions report a false busy state and several accessibility/performance contracts remain unverified or unmet. |

**Overall: 12/24**

**Classification:** No task-completion blocker was found. Every defect below is a **WARNING** that degrades contract fidelity or accessibility and should be fixed before the phase is accepted.

---

## Top 3 Priority Fixes

1. **Normalize long-form document hierarchy** — Posts and showcases can announce the same page title twice, producing 29 multi-H1 routes and extremely tall openings — remove authored title H1s during migration (or make layouts own the sole H1), then assert exactly one H1 on every built HTML file.
2. **Make the 320×800 first screen actually fit** — The CV path ends below the viewport and the closed mobile header computes to 73px instead of 64px — remove the hidden second-row gap, reduce the mobile register to the specified 1px/hidden treatment, and regression-test each element's bottom edge at 320×800.
3. **Close the interaction-accessibility cluster** — Dark pagination is 1.70:1, no-JS contributions remain `aria-busy`, the skip target suppresses its outline, and the wordmark target is only 25.6px tall — repair the token/state/focus/target rules and extend axe/state coverage to dark mode and JavaScript-disabled browsing.

---

## Detailed Findings

### Pillar 1: Copywriting (2/4)

**What passes:** The homepage contains exactly the contracted Alberta status, thesis, former-IQVIA bridge, interest line, and Research/Engineering/CV paths. Its evidence, agenda, experience, output, OSS, and milestone counts also match the approved selective-homepage contract (`index.html`).

- **WARNING — Unsupported promotional language remains public.** The post title promises “10x Productivity” (`_posts/2025-01-20-leveraging-ai-tools-software-engineering.md:3,9`); the learning data says “world-class” (`_data/learning.yml:274`); and project copy uses “Production-Ready” and “cutting-edge” (`_showcase/projects/go-database.md:4,24,40,48,56`). Replace these with observable scope, method, or outcome language.
- **WARNING — Publication states are not separated as contracted.** `publications.html:14-33` renders one chronological list, while peer-reviewed/submitted/under-review status is buried inside item citation fragments. Add semantic status-family headings and render explicit truthful status text beside each record, as required by `12-UI-SPEC.md:254,269,281-294`.
- **WARNING — Project index records do not enforce the promised evidence anatomy.** `projects.html:15-36` emits type, title, excerpt, date, and technologies, but not consistent problem, role, result/current status, verified date, and direct proof. The resulting 16 records depend on uneven prose. Introduce structured fields and omit unsupported fields instead of inferring them.
- **WARNING — Several secondary routes lack page-specific descriptions.** Education, achievements, news, and learning expose only sparse front matter, so `_layouts/default.html:7` falls back to a generic site description. Add concise route-specific descriptions that state what evidence each index contains.

### Pillar 2: Visuals (2/4)

**What passes:** The seven-region homepage has a clear research-first focal point, uses open ledgers instead of a dashboard, preserves light/dark hierarchy, and has no horizontal overflow from 320px through 1440px.

- **WARNING — Generic faux thumbnails were reintroduced despite an explicit prohibition.** `projects.html:22-23,35-36` renders `card_image`/`thumbnail`, and the TCP Vegas, Go Database, and LLM-contract records point to synthetic card SVGs. `assets/images/cards/tcp-vegas-card.svg:1-30` uses a decorative gradient, pill, large rounded rectangles, and display labels rather than real project evidence. Use a real diagram/screenshot or the contract's text-only fallback (`12-UI-SPEC.md:371`). Evidence: [TCP Vegas project image](../../ui-reviews/12-20260802-audit/tcp-vegas-image.png).
- **WARNING — A research affiliation logo dominates the record.** `_data/research.yml:48-50` supplies the UIUC Block I and `research.html:25` renders it in a live 338×240 media area, far beyond the 48px normal-flow maximum in `12-UI-SPEC.md:375`. Constrain institutional marks to 48px and reserve the media column for substantive evidence. Evidence: [first research record](../../ui-reviews/12-20260802-audit/research-first-record.png).
- **WARNING — The ctxhelm proof board is structurally present but visually unimplemented.** `_showcase/projects/ctxhelm.md:64-100` emits `ctxhelm-proof-*` classes for stages and metrics, but `assets/css/overhaul.css` defines none of them; the result is a clumped sequence with no board grammar. Add canonical, responsive ledger styling or simplify it to semantic text. `needs_human_review: true`. Evidence: [ctxhelm proof board](../../ui-reviews/12-20260802-audit/ctxhelm-proof-board.png).
- **WARNING — The experience page ends in a giant technology inventory.** `experience.html:57-60` expands the roughly 35 entries in `_data/profile.yml:537-584` into a full “Technical range” ledger. This competes with the two selected experience records and recreates the prohibited technology-cloud behavior. Reduce it to a small role-relevant working set or move it behind contextual project evidence.
- **WARNING — A public debug route bypasses the page grammar.** `debug.html:2-21` has an empty title, no H1, starts at H3, and contains an inline 10px style; `_config.yml:88-102` does not exclude it. Remove it from the built site or convert it to the canonical layout.

### Pillar 3: Color (2/4)

**What passes:** Both root palettes match the approved paper/ink/green/copper values, text links use the green accent, and the canonical stylesheet uses no normal-hierarchy box shadows.

- **WARNING — Active pagination fails dark-theme text contrast.** `assets/css/overhaul.css:1102` forces white text over `var(--focus)`; in dark mode that is white on `#FFB86B`, measured at **1.70:1** against the required 4.5:1. Use `var(--accent-contrast)`/dark ink for this fill or stop using copper as a filled control. Evidence: [dark blog pagination](../../ui-reviews/12-20260802-audit/blog-dark-pagination.png).
- **WARNING — Copper exceeds its reserved signal role.** Beyond the focus treatment and short register mark, `var(--focus)` colors engineering evidence indices (`assets/css/overhaul.css:624`), the open-source ledger heading (`:756`), pagination (`:1102`), status-page display type (`:1150`), and a 4px mobile bar (`:1267-1273`). The contract reserves copper for focus, a single register line, and research-status boundaries (`12-UI-SPEC.md:235,240`). Move ordinary hierarchy back to ink/green.
- **WARNING — The 60/30/10 surface distribution is visibly secondary-heavy.** A viewport-area proxy measured elevated bands at approximately 51% on desktop and 57.5% on mobile, versus the intended 30% secondary share; `.home-selected-evidence` through `.home-contact` alternate large `var(--paper-elevated)` bands (`assets/css/overhaul.css:574-581`). Reduce the number or height of full-width elevated regions. `needs_human_review: true`.

### Pillar 4: Typography (2/4)

**What passes:** The canonical CSS restricts UI text to 14/16/24px plus the approved display clamp and uses only 400/600 weights. Sans, serif, and mono roles are otherwise recognizable.

- **WARNING — 29 built routes have more than one H1.** `_layouts/post.html:5-22` and `_layouts/showcase.html:5-35` each create the page H1, while authored content repeats it (for example `_posts/2025-01-20-leveraging-ai-tools-software-engineering.md:9` and `_showcase/projects/go-database.md:32`). One route has three H1s. This breaks the explicit single-H1 contract and produces duplicated 56px title blocks. Evidence: [duplicate post title](../../ui-reviews/12-20260802-audit/post-duplicate-h1.png).
- **WARNING — Mono carries a full sentence-like paragraph.** `.home-identity__interests` is a 68ch paragraph in the mono stack (`assets/css/overhaul.css:556-563`), while the spec limits mono to short dates, indices, statuses, and labels (`12-UI-SPEC.md:51,219`). Render it as concise labelled metadata or return the sentence to sans.
- **WARNING — Faux SVG cards ship their own type system.** `assets/images/cards/tcp-vegas-card.svg:1-30` includes sizes from 24px to 74px, weight 700, and typography embedded outside the canonical tokens. Removing the faux cards also eliminates this competing type layer.
- **WARNING — Uppercase metadata runs past the contract's short-label intent.** `.contribution-record__area` uses the uppercase mono eyebrow treatment (`assets/css/overhaul.css:360,389`), while `contributions.html:15` generates labels such as “Merged contribution · [multi-word area]” that span five to seven words. Shorten the eyebrow and move the area into normal metadata.

### Pillar 5: Spacing (2/4)

**What passes:** The declared 4/8/16/24/32/48/64px tokens are implemented, and no arbitrary pixel/rem margin, padding, or gap values were found in the canonical stylesheet.

- **WARNING — The 320×800 first-screen acceptance criterion fails.** Live measurement places the three paths at 688.5–732.5px, 740.5–784.5px, and 792.5–836.5px; the CV action ends 36.5px below the viewport. The existing test only checks that each item's top is below 900px at 1280×900 (`tests/research-first-shell.spec.js:66-102`). Add the specified 320×800 case and assert element bottoms. Evidence: [320×800 homepage](../../ui-reviews/12-20260802-audit/home-320-light.png).
- **WARNING — The closed mobile header is 73px instead of 64px.** At 320px, `.site-header__frame` retains an 8px grid gap while its hidden second-row navigation collapses (`assets/css/overhaul.css:1197-1219,1247`), leaving a 64px row plus gap and rule. Remove the gap in the closed state. The mobile register is also 4px (`:1267-1273`), not the specified 1px/disappearing treatment.
- **WARNING — Tablet and trace breakpoints do not match the contract.** The 720–959px identity uses a 3/2 split with 32px gap (`assets/css/overhaul.css:1204`) instead of balanced 3/3 or 2/4 with 24px gutters; the section index remains beside the heading until 719px (`:1255-1259`) even though the spec moves it above below 960px. Evidence: [tablet homepage](../../ui-reviews/12-20260802-audit/home-tablet-light.png).
- **WARNING — Record geometry is consistently looser than specified.** Multiple evidence/publication/project/contribution records use 32px padding or 16px mobile field gaps where the contract defines 24px record padding and 24px mobile evidence-row gaps (`12-UI-SPEC.md:175,199`). Normalize record components to the spacing table rather than compensating route by route.

### Pillar 6: Experience Design (2/4)

**What passes:** Theme first paint and persistence work; the mobile menu opens, closes on Escape and route selection, restores focus, and remains available without JavaScript. The contribution script handles loading, success, empty, rate-limit, error, timeout, retry, cancellation, and single-flight behavior. Asset budgets, LCP, CLS, reduced motion, and 320–1440px reflow tests pass.

- **WARNING — No-JavaScript contributions falsely remain busy forever.** The static HTML starts with `data-state="loading"`, `aria-busy="true"`, “Checking…”, and an em dash (`contributions.html:20-25`) alongside the no-JS fallback. With JavaScript disabled, assistive technology receives both “unavailable” and a perpetually loading region. Make static markup neutral/unavailable and let JavaScript opt into loading. The current no-JS test verifies only evidence/fallback/retry visibility (`tests/site-integrity.spec.js:239-246`).
- **WARNING — Most new-tab links lack an accessible indication.** Core examples include `research.html:12,38,52`, `publications.html:29`, `contributions.html:15`, `education.html:26`, `achievements.html:19`, `learning.html:31,42`, and `cv.html:13`. `rel="noopener noreferrer"` is present, but link names do not announce “opens in new tab” as required by `12-UI-SPEC.md:303`. Add visually hidden text or an equivalent accessible-name pattern.
- **WARNING — Machine-readable dates are missing on multiple indices.** Publications, education, achievements, and blog index dates are plain text (`publications.html:19`, `education.html:28`, `achievements.html:13-20`, `blog/index.html:21`); post/showcase layouts also use spans (`_layouts/post.html:10`, `_layouts/showcase.html:9`). Use `<time datetime="…">` throughout.
- **WARNING — Skip-target focus is deliberately hidden.** Global controls get the two-tone treatment, but `.site-main:focus { outline: 0; }` (`assets/css/overhaul.css:217`) suppresses visible focus after the skip link targets main, contrary to `12-UI-SPEC.md:321-325`. Apply a non-obscured target focus indicator.
- **WARNING — The home wordmark misses the 44px target minimum.** `.site-brand` has no minimum block size (`assets/css/overhaul.css:253-259`); live measurement is about 109.5×25.6px on desktop and 171.7×25.6px on mobile. Give the link a 44px minimum height without increasing the 64px header.
- **WARNING — Image stability metadata is incomplete.** A source scan found 38 of 40 `<img>` tags without explicit width/height; maintained route examples include `research.html:25`, `publications.html:22`, `projects.html:23,36`, `experience.html:21,40`, and `education.html:20`. Add intrinsic dimensions/aspect ratios to prevent layout instability on slow paths.
- **WARNING — INP is required but not measured.** `12-UI-SPEC.md:398` sets INP ≤200ms, while `tests/quality-gates.spec.js:112-130` checks only LCP and CLS. The axe loop also covers only the default/light state (`tests/quality-gates.spec.js:28-36`), which is why dark pagination escaped. Add INP instrumentation and theme/state variants to release gates.

---

## Verification Evidence

- Screenshot directory: `.planning/ui-reviews/12-20260802-audit/` (binary formats are ignored by `.planning/ui-reviews/.gitignore`).
- Representative captures: [desktop light](../../ui-reviews/12-20260802-audit/home-desktop-light-fold-actual.png), [desktop dark](../../ui-reviews/12-20260802-audit/home-desktop-dark-fold.png), [mobile light](../../ui-reviews/12-20260802-audit/home-mobile-light.png), [mobile dark](../../ui-reviews/12-20260802-audit/home-mobile-dark.png), [mobile menu](../../ui-reviews/12-20260802-audit/home-320-menu-open.png), [research](../../ui-reviews/12-20260802-audit/research-desktop-light.png), [projects](../../ui-reviews/12-20260802-audit/projects-desktop-light.png), [publications](../../ui-reviews/12-20260802-audit/publications-desktop-light.png), and [contributions mobile dark](../../ui-reviews/12-20260802-audit/contributions-mobile-dark.png).
- Full test command: `PATH="/opt/homebrew/opt/node@20/bin:$PATH" PORT=4320 PLAYWRIGHT_WORKERS=2 scripts/verify-ui.sh full` — 42/42 passed.
- Asset/performance evidence: canonical CSS gzip 6,632 bytes; combined first-party JS gzip 2,747 bytes; homepage mobile transfer 221,076 bytes; Lighthouse LCP 112ms, CLS 0, TBT 0. INP was not collected.

---

## Files Audited

- Contract and phase evidence: `.planning/phases/12-dual-audience-overhaul/12-UI-SPEC.md`, `12-CONTEXT.md`, `12-RESEARCH.md`, `12-VALIDATION.md`, `12-01-PLAN.md`, `12-01-SUMMARY.md`
- Canonical shell: `_layouts/default.html`, `_includes/navbar.html`, `_includes/footer.html`, `assets/css/overhaul.css`, `assets/js/site-shell.js`
- Homepage and route templates: `index.html`, `research.html`, `publications.html`, `projects.html`, `experience.html`, `contributions.html`, `education.html`, `achievements.html`, `learning.html`, `blog/index.html`, `cv.html`, `debug.html`
- Long-form layouts/content: `_layouts/post.html`, `_layouts/showcase.html`, representative `_posts/`, `_research/`, `_publications/`, and `_showcase/` entries including ctxhelm, TCP Vegas, Go Database, and LLM contract analysis
- Structured data and visuals: `_data/profile.yml`, `_data/research.yml`, `_data/contributions.yml`, `_data/learning.yml`, `assets/images/cards/*.svg`, representative project/research images
- Interaction and gates: `assets/js/contribution-count.js`, `tests/research-first-shell.spec.js`, `tests/site-integrity.spec.js`, `tests/secondary-routes.spec.js`, `tests/quality-gates.spec.js`, `scripts/verify-ui.sh`

---

## Re-Audit — 2026-08-02

**Scope:** Independent adversarial re-audit of the frozen Phase 12 implementation after remediation of the original review.

**Frozen source digest:** `22e0ffcaea0c079a6dd47b035dceb652b506d8540962c717bcd6a4fdfdcc1cd7`

**Screenshots:** Fresh Playwright-MCP captures at 320×800, 390×844, 720×900, 768×1024, 1280×900, and 1440×900, including light/dark, JavaScript-off contributions, blocked-shell recovery, project/publication archives, one post, and the ctxhelm proof board.

**Verification:** `PATH="/opt/homebrew/opt/node@20/bin:$PATH" PORT=4333 PLAYWRIGHT_WORKERS=2 scripts/verify-ui.sh full` passed **62/62** tests on the final frozen snapshot.

### Re-Audit Verdict

**REMEDIATE — 23/24.** All **27/27 original warnings are resolved** and no task-completion blocker remains. One newly isolated visual-contract warning remains: the desktop/tablet homepage notebook margin is 4px, while the approved design contract specifies a 1px rule. This is a narrow visual-fidelity fix, but the re-audit does not average the Visuals score upward while the measurable mismatch remains.

### Re-Audit Pillar Scores

| Pillar | Score | Evidence-based finding |
|--------|-------|------------------------|
| 1. Copywriting | 4/4 | Public prose is concrete and evidence-led; publication states, route descriptions, project anatomy, and all contracted homepage labels are explicit. The built-prose hype gate passes. |
| 2. Visuals | 3/4 | Purposeful imagery, open ledgers, the constrained affiliation mark, ctxhelm board, and responsive hierarchy pass; the homepage identity register remains 4px instead of the contracted 1px. |
| 3. Color | 4/4 | Light/dark semantic palettes, restrained elevated surfaces, spruce action roles, copper boundary roles, and dark active-pagination contrast pass automated and rendered checks. |
| 4. Typography | 4/4 | The canonical four-role/two-weight system is enforced, interests use body sans, metadata labels are short, and all 58 built HTML documents have exactly one H1. |
| 5. Spacing | 4/4 | Header, 320px first screen, 720/768 tablet split, section traces, record padding, and desktop/tablet/mobile gutters match the declared geometry. |
| 6. Experience Design | 4/4 | Keyboard/theme/menu behavior, fail-open navigation, no-JS and all async contribution states, static new-tab names, semantic dates, image stability, Axe, zoom, Lighthouse, and a PerformanceEventTiming INP candidate pass. |

**Overall: 23/24**

### Original Warning Disposition — 27/27 Resolved

| # | Original warning | Status | Re-audit evidence |
|---|------------------|--------|-------------------|
| 1 | Unsupported promotional language | **RESOLVED** | The built-prose superlative gate passes (`tests/site-integrity.spec.js:287-300`). Source scan found only a Docker article URL and an xv6 debugger command, not promotional user-facing claims. |
| 2 | Publication states not separated | **RESOLVED** | `publications.html:17-26` separates active review records from theses/public manuscripts, and every row exposes explicit status text. |
| 3 | Project anatomy incomplete | **RESOLVED** | All 16 rendered records contain scope, role, outcome, status, date, methods, and a repository link or explicit repository disclosure (`_includes/project-record.html:12-21`); independent scan found `anatomy_bad=0`. |
| 4 | Generic secondary-route descriptions | **RESOLVED** | Route-specific description assertions pass for Education, Achievements, News, and Learning (`tests/site-integrity.spec.js:181-193`). |
| 5 | Faux project thumbnails | **RESOLVED** | The three synthetic card SVGs are deleted. The final project render loaded 10 purposeful diagrams/screenshots with nonzero intrinsic width; records without a real visual use the text-only fallback. |
| 6 | Oversized UIUC logo | **RESOLVED** | Normal-flow institution/employer marks are constrained to 48px (`assets/css/overhaul.css:1034-1043`), and responsive route screenshots show no dominant logo. |
| 7 | Unstyled ctxhelm proof board | **RESOLVED** | Canonical responsive ledger styling now exists at `assets/css/overhaul.css:1158-1209,1492-1504`; the targeted final screenshot shows a coherent 2-column evidence board. |
| 8 | Giant technology inventory | **RESOLVED** | Experience now ends with a contextual 16-item working set rather than the prior ~35-item cloud (`experience.html:58`; `tests/records-and-contributions.spec.js:135-146`). |
| 9 | Public debug route | **RESOLVED** | `_config.yml:104` excludes `debug.html`; the 58-file built-site scan and `tests/site-integrity.spec.js:119-128` confirm no debug output. |
| 10 | Dark pagination contrast | **RESOLVED** | Active pagination uses accent plus semantic contrast ink (`assets/css/overhaul.css:1227-1230`); the measured WCAG-AA gate passes (`tests/quality-gates.spec.js:46-74`). |
| 11 | Copper overuse | **RESOLVED** | Engineering indices and ordinary proof hierarchy now use spruce; remaining copper usage is limited to focus/register/status boundaries and alerts (`tests/research-first-shell.spec.js:199-235`). The remaining 1px-rule issue is classified separately below. |
| 12 | Secondary-heavy surface distribution | **RESOLVED** | Only selected evidence uses an elevated homepage band; the surface-role assertion passes (`tests/research-first-shell.spec.js:199-235`). |
| 13 | Multiple H1s on 29 routes | **RESOLVED** | Independent scan: `html=58`, `h1_bad=0`; the all-built-routes gate passes (`tests/site-integrity.spec.js:119-128`). |
| 14 | Mono interest paragraph | **RESOLVED** | `.home-identity__interests` now uses 16px/400 body sans (`assets/css/overhaul.css:569-577`) and the computed-style assertion passes. |
| 15 | Faux SVG typography | **RESOLVED** | The synthetic card assets and their off-contract embedded typography are deleted; only purposeful evidence graphics remain in record slots. |
| 16 | Overlong uppercase contribution labels | **RESOLVED** | The eyebrow is now the two-word `Merged change`; ecosystem details moved into normal body metadata (`contributions.html:13-16`). |
| 17 | 320×800 first-screen overflow | **RESOLVED** | Fresh runtime bottoms were 623.94, 675.94, and 727.94px; `scrollWidth=clientWidth=320`. The exact first-screen gate passes (`tests/research-first-shell.spec.js:112-144`). |
| 18 | 73px mobile header/register | **RESOLVED** | Fresh runtime header height is 64px and the mobile identity border is 0; the menu/wordmark remain 44px targets (`assets/css/overhaul.css:1346-1408`). |
| 19 | Tablet geometry and trace breakpoint | **RESOLVED** | At 768px the hero is an equal 2-column split with a 24px gap, and the index stacks above its heading below 960px (`tests/research-first-shell.spec.js:169-197`). Fresh 720/768 captures confirm the layout. |
| 20 | Loose record geometry | **RESOLVED** | Record padding is 24px and tested gutters are 32px desktop / 24px tablet / 24px mobile (`tests/research-first-shell.spec.js:238-260`). |
| 21 | False busy no-JS contribution state | **RESOLVED** | Static markup is `data-state="unavailable" aria-busy="false"`; the retry control is JS-only (`contributions.html:20-25`). Fresh JavaScript-off runtime confirmed the fallback is visible, no checking copy appears, and width remains 390px. |
| 22 | New-tab change not announced | **RESOLVED** | Independent built-site scan: 447 `_blank` links, 0 missing accessible indication; static-name and opener-protection gates pass (`tests/site-integrity.spec.js:258-285`). |
| 23 | Missing/misaligned machine-readable dates | **RESOLVED** | Independent scan: 139 `<time>` elements, 0 missing `datetime`; date-drift and range assertions pass (`tests/site-integrity.spec.js:148-179`). |
| 24 | Hidden skip-target focus | **RESOLVED** | Main receives a visible copper focus outline (`assets/css/overhaul.css:215-220`), and the skip-link focus test passes. |
| 25 | Undersized home wordmark target | **RESOLVED** | `.site-brand` has `min-height: 44px` (`assets/css/overhaul.css:256-265`); fresh 320px runtime measured 44px. |
| 26 | Missing image dimensions | **RESOLVED** | Independent scan: 59 images, 0 missing width/height; long-form lazy/decode/intrinsic-size tests pass (`tests/site-integrity.spec.js:131-146`). |
| 27 | INP not measured | **RESOLVED** | `site-shell.js:107-145` observes `PerformanceEventTiming` interaction entries; real menu/theme interactions produce a nonzero candidate ≤200ms (`tests/quality-gates.spec.js:77-94`). |

### Re-Audit Regression Findings

Three defects surfaced during the remediation re-audit and were repaired before the frozen sample:

1. **RESOLVED — Shell-script failure could hide mobile navigation.** A 2-second fail-open path and script-error handler now restore the static navigation (`_layouts/default.html:39-45,90`; `tests/research-first-shell.spec.js:146-167`). Fresh blocked-script runtime produced `html.shell-failed`, a visible grid navigation, and no 320px overflow.
2. **RESOLVED — Incomplete GitHub search results could be displayed as exact.** `assets/js/contribution-count.js` now classifies `incomplete_results`; success, incomplete, empty, rate-limit, error, timeout, retry, and single-flight cases pass (`tests/records-and-contributions.spec.js:148-201`).
3. **RESOLVED — Legacy project-card selectors remained after component removal.** The selector family is deleted and guarded by `tests/secondary-routes.spec.js:117-130`.

### Remaining Finding

- **WARNING — Desktop/tablet notebook margin is four times the contracted thickness.** `assets/css/overhaul.css:540-545` renders `.home-identity__copy` with `border-left: 4px solid var(--focus)`, while the approved visual grammar specifies a static **1px** notebook margin rule beside the identity copy (`12-UI-SPEC.md:65`) and permits 1px rules as the spacing exception (`12-UI-SPEC.md:190-204`). The line disappears correctly below 720px, so mobile behavior is resolved. Change the desktop/tablet border to 1px and add a computed-width assertion at 720/768/1280px.

**Remaining blockers:** 0
**Remaining warnings:** 1
**Original warnings open:** 0

### Exact Re-Audit Evidence

- Full command: `PATH="/opt/homebrew/opt/node@20/bin:$PATH" PORT=4333 PLAYWRIGHT_WORKERS=2 scripts/verify-ui.sh full` — **62/62 passed** in 30.7s.
- Suites: `tests/profile-links.spec.js`, `tests/quality-gates.spec.js`, `tests/records-and-contributions.spec.js`, `tests/research-dossier.spec.js`, `tests/research-first-shell.spec.js`, `tests/secondary-routes.spec.js`, and `tests/site-integrity.spec.js`.
- Independent built scan: `html=58 h1_bad=0`; `images=59 image_bad=0`; `blank_links=447 blank_label_bad=0`; `times=139 missing_datetime=0`; `projects=16 anatomy_bad=0`; `publication_groups=2`; static contribution state `unavailable`, `aria-busy=false`.
- Runtime 320×800: header 64px; wordmark 44px; path bottoms 623.94/675.94/727.94px; `scrollWidth=clientWidth=320`.
- Runtime no-JS Contributions at 390px: `state=unavailable`; `aria-busy=false`; fallback visible; checking copy absent; no horizontal overflow.
- Runtime blocked shell at 320px after 2.3s: class `shell-failed`; navigation `display:grid`; no horizontal overflow.
- Served CSS hash matched the frozen file: `5a642a19a039e28df63ce6b4ab4c844c2722e0c2c43c972806cbf070933778ae`.
- Screenshot directory: `.planning/ui-reviews/12-20260802-reaudit/` (binary formats remain ignored by `.planning/ui-reviews/.gitignore`).
- Representative final captures: [320px light](../../ui-reviews/12-20260802-reaudit/final-home-320-light.png), [390px dark](../../ui-reviews/12-20260802-reaudit/final-home-390-dark.png), [720px tablet](../../ui-reviews/12-20260802-reaudit/final-home-720-light.png), [768px tablet](../../ui-reviews/12-20260802-reaudit/final-home-768-light.png), [desktop light](../../ui-reviews/12-20260802-reaudit/final-home-1280-light.png), [desktop dark](../../ui-reviews/12-20260802-reaudit/final-home-1440-dark.png), [blocked shell](../../ui-reviews/12-20260802-reaudit/final-home-320-shell-blocked.png), [projects](../../ui-reviews/12-20260802-reaudit/final-projects-1280-light.png), [publications](../../ui-reviews/12-20260802-reaudit/final-publications-1280-light.png), [ctxhelm board](../../ui-reviews/12-20260802-reaudit/final-ctxhelm-proof-board.png), [no-JS contributions](../../ui-reviews/12-20260802-reaudit/final-contributions-390-nojs-dark.png), [blog dark](../../ui-reviews/12-20260802-reaudit/final-blog-1280-dark.png), and [single-H1 post](../../ui-reviews/12-20260802-reaudit/final-post-single-h1.png).

### Final Recommendation

**REMEDIATE.** Change the one remaining 4px homepage identity margin to the contracted 1px rule, add the focused breakpoint assertion, rerun the 62-test suite, and re-sample the 720/768/1280 homepage. No other blocker or warning remains from this re-audit.

---

## Second Independent Re-Audit — 2026-08-02

**Scope:** Fresh adversarial audit after the one remaining visual-contract warning was remediated, including an explicit regression pass for current touch-target, text-flow, browser-theme, production-boundary, evidence-boundary, and dual-audience requirements.

**Frozen implementation digest:** `a37eb723a613d716443435e68d52a2154eae6e52251930fae1346f8295d9bc1b`

**Verification:** `PATH="/opt/homebrew/opt/node@20/bin:$PATH" PORT=4335 PLAYWRIGHT_WORKERS=2 scripts/verify-ui.sh full` passed **64/64** tests independently on this digest.

### Final Verdict

**ACCEPT — 24/24.** The prior 4px-versus-1px warning is resolved. All 27 original warnings and all three remediation-cycle regression findings remain closed. The second audit found **zero blockers and zero warnings** in the newly frozen implementation.

### Final Pillar Scores

| Pillar | Score | Final evidence |
|--------|-------|----------------|
| 1. Copywriting | 4/4 | Homepage copy, status language, project anatomy, publication grouping, route descriptions, and non-public manuscript wording remain concrete and contract-accurate. |
| 2. Visuals | 4/4 | The identity register is now the specified fine 1px rule; purposeful imagery, ledger hierarchy, affiliation-mark scale, proof board, and light/dark rendered compositions pass at every requested viewport. |
| 3. Color | 4/4 | Light/dark semantic tokens, restrained copper and spruce roles, contrast, opaque header, and browser `theme-color` synchronization all pass. |
| 4. Typography | 4/4 | Four size roles, two weights, short mono labels, balanced headings, pretty body wrapping, and exactly one H1 across all 58 built documents pass. |
| 5. Spacing | 4/4 | The 64px shell row, 44px targets, 320px first screen, 24/32px gutters, 720/768 tablet split, record geometry, 1px notebook rule, and no-overflow checks pass. |
| 6. Experience Design | 4/4 | Both audience paths, theme persistence, menu/focus behavior, no-JS and async states, evidence boundaries, production-artifact exclusion, Axe, 200% reflow, INP, Lighthouse, and static integrity pass. |

**Overall: 24/24**

### Prior Residual Warning

- **RESOLVED — Homepage notebook margin thickness.** `.home-identity__copy` now uses `border-left: 1px solid var(--focus)` (`assets/css/overhaul.css:555-560`). Fresh computed-style measurements returned exactly **1px** at 720, 768, 1280, and 1440px, and **0px** at 320 and 390px. The focused regression covers 720/768/1280 (`tests/research-first-shell.spec.js:169-187`), while the existing mobile assertion preserves disappearance below 720px.

### Requested Explicit Checks

| Check | Result | Evidence |
|-------|--------|----------|
| Desktop light / desktop dark | **PASS** | Fresh 1280×900 light and 1440×900 dark renders retain the split hero, solid text surfaces, restrained register, compact horizontal header, and ledger hierarchy. |
| 320 / 390 mobile | **PASS** | Fresh 320×800 light and 390×844 dark renders have no horizontal overflow. At 320px the three path bottoms are 623.94, 675.94, and 727.94px; the shell row is 64px and the notebook rule is absent. |
| 720 / 768 tablet | **PASS** | Fresh 720×900 light and 768×1024 dark renders show balanced columns, 24px gutter, stacked section trace, and a computed 1px notebook rule without wrapping the horizontal header. |
| Touch targets | **PASS** | Across all six sampled widths, the minimum tested target dimensions were 44×44px and every menu/theme, audience-path, contact, and footer target returned `touch-action: manipulation`; the release assertion is at `tests/quality-gates.spec.js:114-132`. |
| Text wrapping | **PASS** | Across all six widths, the H1 computed to `text-wrap: balance` and the experience bridge to `text-wrap: pretty`; anchored content keeps a scroll margin beyond the sticky header (`tests/quality-gates.spec.js:133-142`). |
| Browser theme color | **PASS** | Light first paint returned `#f5f1e8`; toggling changed the page, accessible label, persisted override, and `meta[name="theme-color"]` to dark `#0c1513`; reload retained dark. The first-paint and runtime paths agree (`_layouts/default.html:6,58-59`; `assets/js/site-shell.js:4,26-27`). |
| Public-artifact boundary | **PASS** | The SHIFT record remains `data-publicity="abstract-only"`, says `Submitted to TACL 2026 · manuscript not public`, displays the explicit abstract-only boundary, links to an `Abstract-level summary`, and makes no published-manuscript claim (`research.html:21,37`; `tests/research-dossier.spec.js:37-43`). |
| Professor path | **PASS** | Research resolves from header, hero, and footer to `/research/`; the route presents six question-led records with explicit publicity/status data and no audience-mode filter. |
| Recruiter path | **PASS** | Engineering resolves from header, hero, and footer to `/projects/`; all 16 project records expose Role and Outcome fields and remain available alongside the research path. |
| No regressions | **PASS** | Independent 64/64 release suite, zero serious/critical Axe violations, performance gates, no-JS routes, async GitHub cases, semantic integrity, asset resolution, and production-output exclusion all pass. |

### Integrity Rescan

- Built HTML: `58`; routes with H1 count other than one: `0`.
- Images: `59`; missing intrinsic width/height: `0`.
- New-tab links: `447`; missing accessible context-change label: `0`.
- Semantic times: `139`; missing `datetime`: `0`.
- Theme-color defaults missing or incorrect: `0`.
- Project records: `16`; incomplete required anatomy: `0`.
- Forbidden workspace/generated roots published into `_site`: `0` (`tests/site-integrity.spec.js:118-143`).
- Registry audit: not applicable; `components.json` is absent and the approved spec declares no third-party registries.
- Served CSS matched the frozen file at SHA-256 `61b023a9cd8c09ce87b47c7167ea04309aeeb11fd4e86090ff15326b3caee944`.

### Final Screenshot Evidence

Fresh captures are stored under `.planning/ui-reviews/12-20260802-second-audit/` and remain excluded by `.planning/ui-reviews/.gitignore`:

- Home: [320 light](../../ui-reviews/12-20260802-second-audit/home-320-light.png), [390 dark](../../ui-reviews/12-20260802-second-audit/home-390-dark.png), [720 light](../../ui-reviews/12-20260802-second-audit/home-720-light.png), [768 dark](../../ui-reviews/12-20260802-second-audit/home-768-dark.png), [1280 light](../../ui-reviews/12-20260802-second-audit/home-1280-light.png), and [1440 dark](../../ui-reviews/12-20260802-second-audit/home-1440-dark.png).
- Professor path: [Research desktop light](../../ui-reviews/12-20260802-second-audit/research-1280-light.png), [Research mobile dark](../../ui-reviews/12-20260802-second-audit/research-390-dark.png), and [explicit non-public boundary](../../ui-reviews/12-20260802-second-audit/research-nonpublic-boundary.png).
- Recruiter path: [Projects desktop dark](../../ui-reviews/12-20260802-second-audit/projects-1280-dark.png) and [Projects mobile light](../../ui-reviews/12-20260802-second-audit/projects-390-light.png).

### Final Recommendation

**ACCEPT.** Phase 12 meets the approved six-pillar UI contract on the final frozen digest. No UI remediation remains.
