---
layout: showcase
title: "ctxpack: Repo Context Packer"
subtitle: "A local-first context compiler for AI coding agents"
category: projects
group: Projects
show: true
width: 8
date: 2026-05-10 00:00:00 +0800
excerpt: An ongoing Rust project that turns repository tasks into compact, evidence-labeled context plans and packs for Codex, Claude Code, Cursor, OpenCode, and other MCP-compatible coding agents.
featured: true
showcase_style: agent-tooling
card_image: /assets/images/projects/ctxpack-context-map.svg
technologies:
  - Rust
  - MCP
  - Coding Agents
  - Context Engineering
  - Symbol Indexing
  - Evaluation
  - Git
  - CLI
---

# ctxpack: Repo Context Packer

ctxpack is an ongoing local-first tool for making coding agents better at choosing repository context. Instead of becoming another chat UI or autonomous editor, it acts as a read-only context broker behind existing tools such as Codex, Claude Code, Cursor, OpenCode, and other MCP-compatible agents.

The project is built around a context compiler: given a software task, it identifies likely target files, related tests, git co-change hints, validation commands, matched symbols, and budgeted snippets, then emits small structured plans or Markdown/JSON context packs for the agent to consume.

![ctxpack context compiler flow](/assets/images/projects/ctxpack-context-map.svg)

## Current Implementation

- Rust workspace with separate CLI, core contracts, index, compiler, and MCP crates.
- Agent-native setup through `AGENTS.md`, Cursor rules, Claude command scaffolding, OpenCode config guidance, and a local MCP server.
- Local safe inventory that respects ignore files and excludes sensitive/generated files by default.
- Lexical repository search, symbol extraction for TypeScript/JavaScript, Python, Rust, and Go, related-test detection, and git co-change hints.
- `prepare-task` context-plan compilation with target files, matched symbols, line ranges, related tests, validation commands, risk flags, and privacy status.
- Materialized `get-pack` output in Markdown and JSON for brief, standard, and deep budgets, with source-linked snippets around matched evidence.
- MCP tools, resources, and prompts for `prepare_task`, `get_pack`, search, related tests, and current-diff style workflows.
- Source-free evaluation traces and a dogfood checklist so retrieval behavior can be measured without leaking source code.
- CLI coverage for `init`, `index`, `prepare-task`, `get-pack`, `search`, `symbols`, `related-tests`, `co-changes`, `eval traces`, `eval checklist`, and `serve-mcp`.

## Direction

The goal is to make agents retrieve less irrelevant context, read better evidence earlier, and validate changes with the right tests. The project stays local-first and read-only by default: no cloud indexing, no cloud reranking, and no autonomous code editing.

## What Works Now

The MVP can scan a repository, build a safe file inventory, extract useful symbols, run lexical search, infer related tests, use git history for co-change hints, and compile task-conditioned context plans. The MCP layer exposes that work to existing coding agents, while the CLI remains mostly plumbing for setup, debugging, and evaluation.

<p><a href="https://github.com/thromel/ctxpack" target="_blank">View the public repository on GitHub</a></p>
