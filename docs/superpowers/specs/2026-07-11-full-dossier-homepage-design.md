# Full-Dossier Homepage Design

**Date:** 2026-07-11  
**Status:** Approved design, awaiting written-spec review  
**Scope:** Replace the current four-block research-first homepage with a detailed, research-led professional dossier.

## Objective

The homepage must let a visitor understand Tanzim Hossain Romel's profile without opening several secondary pages. Research remains the organizing thread, but the page must also present substantial evidence about professional experience, engineering and open-source work, education, recognition, recent milestones, and personal background.

The result should feel like a carefully edited one-page CV built for the web: broader and deeper than the current homepage, but easier to scan than a literal CV document.

## Audience and Priority

The homepage serves research faculty, academic collaborators, open-source maintainers, and engineering recruiters. It should communicate the following hierarchy:

1. Research identity and current trajectory.
2. Research interests, active projects, and publication evidence.
3. Production engineering experience and quantified outcomes.
4. Open-source collaborations, research systems, and broader engineering range.
5. Education, recognition, recent milestones, and personal context.

Research receives the strongest visual and narrative emphasis. The other areas remain detailed enough to establish a complete professional picture.

## Design Direction

Continue the site's editorial research-dossier system rather than introducing a dashboard or generic portfolio-card aesthetic.

- Use the canonical `assets/css/overhaul.css` token system and shared shell.
- Keep the serif editorial hierarchy, monospaced evidence labels, restrained slate/blue palette, rules, and generous section spacing.
- Use asymmetrical editorial grids for large screens and a strict single-column flow on phones.
- Preserve light and dark themes.
- Keep the homepage name materially smaller than the original redesign: no more than 58 CSS pixels at 1440px and no more than 42 CSS pixels at 390px.
- Use existing, artifact-relevant images only. Do not add stock art or invent publication covers.
- Prefer ledgers, compact records, and evidence panels over repetitive marketing cards.

## Information Architecture

### 1. Identity and Current Trajectory

The opening section contains:

- Name and role line: researcher, software engineer, and open-source contributor.
- A two-paragraph summary connecting reliable agent systems, software engineering, program analysis, and production experience.
- Current markers for UIUC++ SRSE 2026, incoming University of Alberta M.Sc., BUET CSE, and Dhaka.
- Existing portrait with meaningful alt text.
- A concise next-step note covering the University of Alberta, U-A-Goose, Amii, and September 2026 start.
- Direct links to Research, CV, email, GitHub, Scholar, and LinkedIn.

The section must preserve the mobile reading order: identity and summary before the portrait.

### 2. About

Add a short personal section rather than a full biography. It should mention:

- Growing up in Rajshahi and currently living in Dhaka.
- Learning through building and maintaining a regular learning practice.
- Interest in moving between research questions and concrete systems.
- Preference for measurable, inspectable evidence over vague claims.

This section should stay to two compact paragraphs.

### 3. Research Agenda

Present six connected research lanes with status, a concrete question or claim, collaborators, and direct evidence links:

1. SREGym and AI for SRE — active UIUC++ SRSE 2026 work with Professor Tianyin Xu's group.
2. SHIFT and agent security — submitted to TACL 2026 with Chowdhury Rakin Haider.
3. ML model-hosting remote code execution — under review at ICSE 2027, covering five ecosystems, roughly 45,000 repositories, and more than 600 developer discussions.
4. Coding-agent context and repair — ContextLedger, ctxhelm/HelmBench, and PatchSmith.
5. History-aware vibe coding — emerging direction with Dr. Zhou Yang at the University of Alberta and Amii.
6. Verified schema generation — VeriSchema, multi-agent repair, and relational checks, targeting PVLDB.

The first three lanes are primary evidence records with visuals. The remaining three are compact supporting research records. Publicity boundaries must remain explicit, especially for SHIFT.

### 4. Publications and Research Artifacts

Show four detailed records:

- Remote Code Execution in ML Model Hosting Ecosystems.
- The Choice Can Be the Attack.
- Sentiment Analysis of Anonymous Crisis Reports in Bangladesh.
- Patient-Centric Blockchain Framework for EHR Management.

Each record includes title, authorship context, venue/status, year, a short contribution summary, and direct artifact links. Use the two existing publication covers where available; records without truthful media remain text-only.

The existing Publications page remains the canonical full citation archive.

### 5. Experience

Present all three roles with more than a title and date:

- Remote Research Intern, University of Illinois Urbana-Champaign.
- Software Development Engineer 1, IQVIA.
- Full Stack Engineer, Mindshare Bangladesh.

Each role contains context and two to four outcome-oriented bullets. IQVIA additionally surfaces four established metrics:

- 70% targeted filtering improvement.
- 60% selected query-time reduction.
- Export-workflow coverage raised to 95%.
- 35% deployment-time reduction.

Do not reproduce every CV bullet. Choose representative evidence across systems, data, cloud, LLM workflows, testing, observability, and collaboration.

### 6. Engineering and Open Source

Use a detailed ledger that covers:

- RefactoringMiner MCP and the JetBrains collaboration.
- ctxhelm and HelmBench, including release availability and bounded evaluation evidence.
- ContextLedger.
- PatchSmith.
- Curated contributions to EF Core, GenHTTP, deepagents, TypeScript, LangChain, and related repositories.
- Systems and performance projects: 1BRC C#, Go database engine, Go container runtime, compiler, ray tracer, TCP Vegas+, and EventFly.
- Applied ML and learning builds: Bangla digit recognition, image captioning, and mini deep-learning framework.

Current research systems receive detailed records with existing diagrams or thumbnails. Broader projects are grouped into compact linked inventories to keep the page readable.

### 7. Education

Show all three education records with meaningful context:

- University of Alberta M.Sc. — incoming September 2026, U-A-Goose, Dr. Zhou Yang, and Amii.
- BUET B.Sc. in CSE — CGPA 3.53/4.00, sessional GPA 3.86/4.00, thesis context, Dean's List, ML contest result, and Blockchain Olympiad finalist status.
- Rajshahi College HSC — 15th in Rajshahi Board, Talentpool Scholarship, A+ results, and 96.5% across Physics, Chemistry, and Higher Mathematics.

Use existing education logos with lazy loading and meaningful alt text.

### 8. Recognition

Surface seven recognitions in a compact two-column ledger on desktop and one column on mobile:

- IQVIA Impact Program — Silver.
- Second place in the BUET Bangla handwritten digit recognition contest, including 2nd of 120 and 95.9% accuracy.
- Blockchain Olympiad Bangladesh finalist.
- BUET Dean's List.
- National Physics Olympiad prize.
- National Chemistry Olympiad prize.
- Talentpool HSC Scholarship.

The Achievements page remains the full record.

### 9. Recent Milestones

Show a small maintained ledger sourced from current structured news data. Prioritize:

- SHIFT submission to TACL 2026.
- ML hosting RCE review status at ICSE 2027.
- UIUC++ SRSE internship start.
- Incoming University of Alberta M.Sc.
- IQVIA Impact Silver recognition when space allows.

This is a static, build-time section. It must not become a client-side feed.

### 10. Collaboration and Contact

Close with a concise invitation for research conversations, artifact review, open-source collaboration, and engineering work around software reliability, agent evaluation, security, and developer tools.

Include email, GitHub, Scholar, LinkedIn, ORCID, and CV links.

## Data and Rendering

Prefer existing structured data and collections:

- `_data/research.yml` for the research agenda and current contact framing.
- `_data/profile.yml` for positions, education, awards, profile links, and personal context.
- `_data/news.yaml` for recent milestones.
- `_publications/` for publication records.
- `_showcase/projects/` for project titles, excerpts, dates, technologies, images, and destinations.
- `_data/contributions.yml` for curated open-source evidence.

The homepage may use small Liquid filters and assignments to select records, but must not duplicate large bodies of authoritative content in `index.html`. If a homepage-specific summary cannot be derived cleanly, add a concise structured field to the relevant data source.

No new client-side data service or JavaScript framework is required.

## Responsive Behavior

- Desktop uses editorial two- and three-column grids with `minmax(0, 1fr)` tracks.
- Research cards may use three columns only when each record remains comfortably readable.
- At widths at or below 860px, all major records collapse to one column.
- Metric cells may remain two-up on phones if they fit without horizontal overflow.
- Section labels always precede their headings in source order.
- Images use bounded aspect ratios and `object-fit` rules; text must never depend on image loading.
- The homepage must have no horizontal overflow from 320px through 1440px.

## Accessibility

- Maintain a single page-level `h1` and logical heading order.
- Preserve the skip link and shared navigation landmarks.
- Every meaningful image has non-empty alt text; decorative images use empty alt text.
- Links must remain distinguishable without relying only on color.
- Dark and light themes must meet the existing serious/critical Axe gate.
- Respect reduced-motion preferences.
- Avoid hidden tabs, carousels, or accordions for core profile information.

## Performance

- Preserve the existing homepage first-party transfer budget of 1.5 MB.
- Keep individual raster assets below 500 KB.
- The portrait remains the only high-priority homepage image.
- All below-the-fold images use `loading="lazy"` and `decoding="async"`.
- Do not introduce a new frontend dependency or remote font dependency.

## Verification Contract

Extend the browser suite before implementation to verify:

- The homepage exposes all ten major sections in the approved order.
- Research includes six lanes and retains current status/publicity boundaries.
- The hero name scale remains bounded on desktop and mobile.
- Experience includes all three roles and the four approved IQVIA metrics.
- Engineering/open-source records include the named current systems and contribution proof.
- Education includes all three institutions.
- Recognition includes the seven approved entries.
- Publication visuals render only where real cover metadata exists.
- Homepage images load without broken sources.
- No horizontal overflow occurs from 320px through 1440px.
- Core pages retain no serious or critical Axe violations.
- Homepage transfer, LCP, and CLS budgets continue to pass.
- The page remains useful with JavaScript disabled.

The authoritative release command remains `scripts/verify-ui.sh full`.

## Non-Goals

- Replacing Jekyll or migrating to a SPA.
- Copying the complete CV verbatim onto the homepage.
- Removing the existing Research, Publications, Projects, Experience, Education, Achievements, News, or About pages.
- Introducing stock imagery, invented publication covers, or decorative media without evidence value.
- Adding a client-side activity feed, carousel, tabs, or dashboard navigation.
- Reworking the shared site shell beyond what the expanded homepage requires.

## Success Criteria

The design is successful when a first-time visitor can answer all of the following from the homepage alone:

- What does Tanzim research, and what is active now?
- What has he published or submitted?
- Where has he worked, and what outcomes did he produce?
- What open-source and engineering systems has he built?
- What is his educational trajectory?
- What recognitions and recent milestones establish credibility?
- Where is he from, how does he approach his work, and how can someone contact him?

The visitor should get those answers through a coherent research-led narrative, not a wall of disconnected cards.
