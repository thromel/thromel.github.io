---
phase: 12
slug: dual-audience-overhaul
status: complete
created: 2026-08-02
---

# Phase 12 Context

## User Decisions

- This is a complete UI/UX overhaul, not another incremental polish pass.
- The site must work equally well for professors and engineering recruiters.
- Start the public introduction with the University of Alberta trajectory.
- State approximately three years of professional experience and former IQVIA experience.
- Use the exact research-interest family: AI4SE, LLM4Coding, Trustworthy AI, long-horizon coding agents, and AI for SRE.
- Do not use the phrase "open-source program analysis" as positioning copy.
- Do not mention GTA, GRA, or GRAF in the introduction. Keep those dated appointments in work experience.
- Keep a conventional horizontal header; do not use a vertical navigation rail.
- Replace the awkward light theme with a deliberate light palette and design dark mode independently.
- Link named institutions, employers, programs, products, papers, repositories, and other relevant evidence to authoritative destinations.

## Product Constraints

- Preserve Jekyll, static hosting, existing URLs, structured data, truthful content, and public-status boundaries.
- Keep `assets/css/overhaul.css` and `assets/js/site-shell.js` as the canonical UI layer.
- Retire or avoid parallel theme, navigation, and page-local styling systems.
- Preserve graceful GitHub API fallbacks and no-JavaScript usefulness.
- Reconstruct the design on current `origin/main`; do not transplant the stale dirty local tree wholesale.

## Resolved Direction

- One site, not separate professor and recruiter versions.
- Two permanent visible paths: Research and Engineering. They may use anchors and normal routes, but must never hide the other audience's evidence.
- Visual concept: "Alberta field notebook x systems evidence ledger" -- warm editorial paper, mineral ink, spruce links, restrained copper signals, fine rules, evidence indices, and purposeful artifact imagery.
- The homepage becomes a selective website abstract: identity and routes, selected evidence, research agenda, engineering experience, publications/open-source proof, recent news, and contact.
- The visual system should feel authored and memorable, but never like a startup dashboard, generic template, or decorative academic CV.

## Content Boundaries

- Use concrete questions, roles, outcomes, status labels, dates, and direct evidence links.
- Do not invent metrics, publications, affiliations, technologies, funding details, or deployment claims.
- Do not visually present submissions, work in progress, or research systems as peer-reviewed publications.
- Keep core content in semantic HTML and available before JavaScript runs.
