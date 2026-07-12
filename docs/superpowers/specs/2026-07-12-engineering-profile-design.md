# Engineering Profile Homepage Design

**Date:** 2026-07-12
**Status:** Approved for implementation planning

## Goal

Bring Tanzim's engineering skills into the research-led homepage without turning the hero into a resume or weakening the site's research identity. A visitor should be able to scan the top of the homepage and understand three years of production software and AI engineering experience, while the existing Experience and Engineering sections retain the supporting evidence.

## Design Principles

- Balance backend and cloud engineering, AI and LLM engineering, and systems and open-source work.
- Give capabilities and named technologies equal visual weight.
- Keep the top-level snapshot concise and leave quantified outcomes in Experience.
- Use a curated homepage inventory rather than the exhaustive global skills list.
- Do not surface older identity-mismatched areas such as Solidity or Web3 on the homepage.
- Preserve the static, JavaScript-independent homepage and canonical site shell.

## Information Architecture

Add a compact `Engineering profile` section immediately after the Identity section and before About.

This placement keeps the profile near the top while preventing the hero from becoming crowded. The section serves as the summary layer; the existing Experience and Engineering sections remain the evidence layer later on the page.

The section contains:

1. An eyebrow and concise heading.
2. A one-sentence introduction.
3. Four ordered skill groups.
4. Two quiet navigation links: `Work experience` and `Engineering projects`.

## Public Copy

### Introduction

> Three years of production software and AI engineering, alongside hands-on systems and open-source work.

### Skill Groups

#### Backend and APIs

Production services and data-heavy analytics workflows.

`C#/.NET · EF Core · REST APIs · Microservices`

#### AI and agent systems

LLM/RAG workflows and research tools connected to real software systems.

`Python · LangGraph · MCP · RAG · LLM evaluation`

#### Systems and open source

Developer tools, program analysis, and multi-language open-source contributions.

`Rust · Go · TypeScript · Java · C++`

#### Cloud, data, and reliability

Deploying, tuning, and observing cloud-native services and data stores.

`AWS · PostgreSQL · MongoDB · Docker · Kubernetes · OpenTelemetry`

## Visual Design

- Use the existing dossier section language, spacing tokens, typography, rules, and color system.
- Present the four groups as a four-column desktop grid.
- Collapse to a two-by-two grid on tablet widths.
- Stack the groups vertically on narrow mobile screens.
- Use the serif face for group titles, restrained body copy for capability statements, and the monospace face for technologies.
- Do not add proficiency bars, percentage ratings, decorative logos, or a new visual language.
- Keep the two destination links visually subordinate to the skill groups.

## Content and Component Boundaries

- Add a curated `engineering_profile` collection to `_data/research.yml`.
- Render the collection in `index.html` as semantic static markup.
- Add all shared styling to `assets/css/overhaul.css`.
- Do not render `_data/profile.yml`'s exhaustive `technical_skills` list on the homepage.
- Do not change the dedicated Work, Projects, Contributions, or About pages in this pass.
- Do not duplicate IQVIA performance metrics or project descriptions in the new section.

The section must remain useful when JavaScript is disabled. Missing optional links must not prevent the skill groups from rendering; required group fields are title, summary, and technologies.

## Verification Contract

Extend the homepage shell tests to verify:

- The `engineering-profile` section appears immediately after `identity` and before `about`.
- Exactly four ordered skill groups render.
- Each group has a non-empty title, capability statement, and technology list.
- The curated technology lists match the approved content.
- Solidity and Web3 do not appear within the homepage engineering profile.
- The Work experience and Engineering projects links resolve to the existing routes.
- The section does not create horizontal overflow at 320px.

Run `scripts/verify-ui.sh full`, then inspect the built homepage at desktop and 320px widths in both light and dark themes. Verify typography, wrapping, section rhythm, focus states, and the transition into About.

## Success Criteria

- Visitors can identify Tanzim's balanced engineering profile near the top of the homepage.
- Capabilities and concrete technologies receive equal emphasis.
- The research-led identity remains dominant.
- Evidence remains traceable to the existing Experience and Engineering sections.
- The full UI verification suite and production deployment checks pass.

## Out of Scope

- A site-wide skills taxonomy rewrite.
- Proficiency scores or self-rated expertise.
- New performance claims.
- Reordering or redesigning the existing Experience and Engineering records.
- Changes to archive or project-page content.
