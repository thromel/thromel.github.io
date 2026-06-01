---
layout: showcase
title: "ctxpack: Repo Context Packer"
subtitle: "Engineering a local-first context compiler for AI coding agents"
category: projects
group: Projects
show: true
width: 8
date: 2026-05-10 00:00:00 +0800
excerpt: A technical write-up on ctxpack, a Rust tool that helps coding agents choose better repository context using safe inventory, lexical search, symbols, graph edges, memory, feedback, and release-gated evaluation.
featured: true
showcase_style: agent-tooling
card_image: /assets/images/projects/ctxpack-system-architecture.svg
technologies:
  - Rust
  - MCP
  - Coding Agents
  - Hybrid Retrieval
  - Graph Signals
  - Tree-sitter
  - Evaluation
  - Privacy
  - Release Engineering
  - CLI
---

# ctxpack: engineering a context compiler for coding agents

ctxpack is my attempt to solve a problem I kept running into while using coding agents: the agents were rarely blocked by editing. They were blocked by context. They would grep around, open plausible files, read too much, miss the one test that mattered, and then make a change that looked reasonable but had the wrong shape for the repository.

I did not want to build another "chat with your repo" product. Codex, Claude Code, Cursor, OpenCode, and similar tools already own the editing loop. ctxpack sits underneath them. It is a local, read-only context broker that answers a narrower question:

> For this task, what should the agent inspect first, and how should it validate the change?

The current public release is `v1.1.4`. It can scan a repository, build a safe inventory, extract symbols, combine lexical, graph, test, history, memory, feedback, and optional local semantic signals, then return a small context plan or a budgeted Markdown/JSON pack. It also exposes the same path through MCP.

That sounds clean in hindsight. It was not clean while building it. The hard part was not parsing files. The hard part was keeping the system honest: no source leakage in evals, no vague release claims, no pretending that every client integration worked when only some of them produced machine-checkable evidence.

![ctxpack system architecture](/assets/images/projects/ctxpack-system-architecture.svg)

## The actual problem

Generic RAG is too blunt for code. If the task says "fix the login redirect test," an embedding search for "authentication redirect behavior" might find something useful. It might also miss the exact test, the route constant, the middleware wrapper, or the commit that introduced the failure.

Code has sharper clues than prose:

- exact identifiers such as `requireSession`, `AUTH_COOKIE_NAME`, or `SQLSTATE 23505`
- file names, route names, test names, config keys, and stack frames
- imports, callers, fixtures, mocks, and package boundaries
- files that often change together
- tests that prove a source file still behaves correctly

So ctxpack does not start from "top-k chunks." It starts from a task. It asks what kind of task it is, gathers several kinds of evidence, and returns a plan with reasons attached.

## The boundary I care about

ctxpack is read-only. It does not edit code, run project test commands on its own, commit files, or mutate global agent configuration. That is not a lack of ambition. It is the product boundary.

Agents already have permission models for reads, writes, shell commands, and approvals. If ctxpack tried to become another agent, it would compete with those systems. By staying read-only, it can fit behind several tools without forcing the user into a new workflow.

The daily flow should be boring:

1. The user asks an existing agent to fix or explain something.
2. The agent calls `prepare_task`.
3. ctxpack returns likely files, tests, warnings, validation commands, and pack options.
4. The agent reads files and edits with its own tools.
5. If needed, the agent asks for a brief, standard, or deep pack.

That is the whole idea.

## Components

The code is split into a Rust workspace. I kept the crates small because the project touches several concerns that are easy to blur together.

| Crate | What it owns |
| --- | --- |
| `ctxpack-core` | Shared contracts, privacy status, typed plans, packs, candidates, and report shapes. |
| `ctxpack-index` | Inventory, ignore policy, lexical search, symbols, dependencies, graph edges, storage, memory, feedback, semantic metadata, and workspace state. |
| `ctxpack-compiler` | Task planning, candidate fusion, budget allocation, pack rendering, inspector output, cards, evals, and release proof summaries. |
| `ctxpack-mcp` | MCP tools, resources, and prompts. |
| `ctxpack` | The CLI for setup, diagnostics, indexing, packs, evals, release checks, and `serve-mcp`. |

The contract layer matters more than it looks. If an agent receives a `ContextCandidate`, it should not care whether that candidate came from lexical search, a Tree-sitter symbol, a graph edge, a memory card, or a historical eval. The output shape stays stable while the retrieval internals change.

## Repository intelligence

The first thing ctxpack does is build a safe inventory. It respects `.gitignore`, `.ctxpackignore`, and `.cursorignore`. It excludes sensitive and generated files by default. It records metadata such as path, role, language, package boundary, hash, and diagnostics.

Everything else builds on that inventory.

Lexical search is still the workhorse. I know embeddings are more fashionable, but exact terms win surprisingly often in code. A function name, failing assertion text, or route literal can be the best clue in the whole task.

Tree-sitter gives the next layer: functions, classes, methods, types, constants, test cases, and imports. That is enough to build useful symbol cards and dependency hints without requiring every repository to have a perfect language-server setup.

The graph layer adds relationships: imports, related tests, co-change hints, memory edges, feedback edges, and optional precision overlays. The graph is useful, but dangerous. Recursive graph expansion is how a small bug fix turns into a giant prompt. ctxpack treats graph evidence as a ranking signal first and a context-expansion signal second.

Memory and feedback are local. A memory card can say "this repo uses service factories" or "these tests need fake timers," but it carries freshness and review state. Feedback records which files were recommended, read, edited, or validated. It does not store raw prompts or source text.

Semantic retrieval is optional. The default policy is local and cloud-disabled. There is a deterministic local semantic path for testing policy behavior, and stronger local embedding backends can be enabled explicitly. I do not want a developer tool to quietly ship source code to a remote embedding API.

## Retrieval pipeline

![ctxpack retrieval pipeline](/assets/images/projects/ctxpack-retrieval-pipeline.svg)

The pipeline begins with task classification. A bug fix, refactor, review, test-writing task, and architecture question need different evidence.

For a bug fix, tests and recent changes often matter more than semantic similarity. For a refactor, callers and interfaces matter. For architecture questions, repo maps, docs, graph neighborhoods, and memory cards become more useful.

Candidate generation pulls from:

- explicit paths and current diff anchors
- lexical matches
- symbols and tests
- graph neighbors
- git co-change hints
- memory and feedback metadata
- optional local semantic candidates

Then the compiler fuses the candidates. The score includes more than similarity: role, reason, line hints, graph distance, test confidence, memory count, feedback count, generated-file penalties, and source-read policy. The final pack is diversified so one large file does not crowd out everything else.

The most important output is usually not a long pack. It is the initial plan:

```text
target files
related tests
validation commands
risk flags
warnings
pack options
```

That lets an agent read the real files itself before asking for more context.

## Contracts

ctxpack has a few core contract types.

`ContextPlan` is the small first answer. It tells the agent what to inspect, what to test, what risks were detected, and whether a brief, standard, or deep pack is available.

`ContextCandidate` is the evidence record behind a file, symbol, test, doc, or history item. It carries scores, source families, reasons, and line hints.

`ContextPack` is the source-bearing object. It is the thing you ask for when a plan is not enough.

`Inspector` is the audit view. It explains the selection without copying source text. That is useful for debugging the packer and for release proof.

## Storage and privacy

![ctxpack storage and contracts](/assets/images/projects/ctxpack-storage-contracts.svg)

The storage design is intentionally plain: local metadata, local reports, local state. This is not a hosted index.

The source boundary is the part I am most careful about:

- A context pack may include source snippets because the user or agent asked for task context.
- Eval reports, feedback, retrieval-health summaries, inspector exports, memory metadata, and release proof do not include source text.

That makes public evidence possible. I can say that Claude Code called `prepare_task` and `get_pack` against an explicit repository without publishing the task prompt, raw MCP traffic, terminal logs, or source snippets.

This constraint also keeps the project honest. It is harder to debug when you refuse to dump everything, but it is the right default for a local developer tool.

## Graph retrieval without context bloat

I use "GraphRAG-style" carefully here. ctxpack does use graph signals, but it does not blindly walk the graph and stuff the result into the prompt.

Suppose the task is an auth redirect bug. Lexical search might find `redirect`. Symbol extraction might find middleware functions. Test mapping might find redirect tests. History might find files that changed with the middleware. Graph expansion might add the session helper or route file.

The good output is not "here is the whole auth subsystem." The good output is four or five files with reasons:

```text
auth middleware: owns redirect behavior
redirect test: likely validation target
session helper: direct callee
login route: redirect destination
```

Graph context is useful when it is bounded. Otherwise it becomes expensive noise.

## MCP integration

The MCP surface is small on purpose.

| Tool | What it does |
| --- | --- |
| `prepare_task` | Returns the initial plan. |
| `search` | Finds safe files and symbols. |
| `related` | Expands around a file, symbol, or current diff. |
| `get_pack` | Builds a budgeted pack. |
| `related_tests` | Finds likely tests and commands. |
| `current_diff` | Returns safe changed-path metadata. |

One bug from real integration work shaped the design: some clients launch MCP servers from a directory that is not the active repository. That means relying on the server's current working directory is unsafe. The protocol now prefers an explicit `repo` argument, and the deterministic smoke tests intentionally run from the wrong directory.

That kind of detail is not glamorous, but it is what decides whether the tool works in a real agent session.

## Evaluation

![ctxpack evaluation loop](/assets/images/projects/ctxpack-eval-loop.svg)

I do not trust context tooling without evals. It is too easy to add a graph, embedding, or reranker and convince yourself it helped because the output looks smarter.

ctxpack uses historical tasks and source-free reports to check whether retrieval is actually improving. The eval stack includes fixed-budget historical retrieval, lexical baselines, signal ablations, protected-target miss accounting, retrieval-health reports, feedback summaries, deterministic MCP protocol tests, and release gates.

The current README snapshot says the agent-evidence retrieval channel beats or matches lexical on every measured corpus, with average Recall@10 delta `+0.19379663`. I would not generalize that too far. It means the measured release corpus improved. It does not mean every possible query improves.

That distinction matters. A tool like this should say when it helps, when it is neutral, and when it does not have enough evidence.

## Release proof

The public `v1.1.4` release is archive-first. The release path verifies checksums, manifest and audit files, temporary install, `doctor`, `--help`, and first-pack behavior.

The same release proof records:

- public release freshness
- deterministic MCP protocol behavior
- Homebrew formula renderability from the exact archive digest
- crates package boundary checks
- Claude Code real-client evidence for `prepare_task` and `get_pack`
- Codex CLI optional skip status, because that client did not produce machine-checkable evidence

I like this part because it prevents soft claims. If a client works, there should be evidence. If it does not produce evidence yet, the release notes should say that.

## Trade-offs

| Decision | Why I chose it | Cost |
| --- | --- | --- |
| Rust | One local binary, strong contracts, fast scanning, predictable CLI/MCP behavior. | Slower iteration than a Python or TypeScript prototype. |
| Lexical-first retrieval | Exact identifiers are often the best code signal. | Conceptual queries need semantic support. |
| Tree-sitter first | Broad parsing without requiring LSP setup. | Less precise than a full compiler or SCIP index. |
| Local source-free reports | Safe to publish and inspect. | Less convenient than dumping raw traces. |
| Read-only broker | Fits existing agents and their permission models. | ctxpack cannot fix code directly. |
| Progressive packs | Keeps agents from starting with huge prompts. | The agent must ask for deeper context when needed. |

## What works today

ctxpack is useful when the task crosses file boundaries or when validation matters. It can produce a first-pass plan, recommend target files with reasons, surface related tests, build context packs, expose everything through MCP, and report retrieval quality without leaking source.

It is not useful for every task. If the edit is a tiny change in the current file, the agent can just read the current file. It is also not a full enterprise code search system, hosted team memory product, or complete LSP/SCIP precision engine. Those would be different projects or later layers.

## What I learned

The hard part is not indexing code. Everyone can index code.

The hard part is deciding what evidence is worth showing an agent, under a budget, for a specific task. That requires retrieval, graph reasoning, privacy policy, test mapping, pack ordering, and evaluation to work together.

I keep coming back to one question:

> What is the smallest evidence set that makes the agent more likely to make the right change?

That is the real project.

<p><a href="https://github.com/thromel/ctxpack" target="_blank">View the public repository on GitHub</a></p>
