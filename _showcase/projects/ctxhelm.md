---
layout: showcase
title: "ctxhelm: agent-native context compiler"
subtitle: "Local-first context plans, release proof, and source-free agent evaluation"
category: projects
group: Projects
show: true
width: 8
date: 2026-05-10 00:00:00 +0800
excerpt: A technical write-up on ctxhelm, a released Rust tool that helps coding agents inspect the right files before editing, and HelmBench, the source-free benchmark I am building to see whether that context changes real agent behavior.
featured: true
showcase_style: agent-tooling
card_image: /assets/images/projects/ctxhelm-system-architecture.svg
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
  - HelmBench
  - CLI
---

# ctxhelm: engineering an agent-native context compiler

ctxhelm solves a problem I kept running into while using coding agents: the agents were rarely blocked by editing. They were blocked by context. They would grep around, open plausible files, read too much, miss the one test that mattered, and then make a change that looked reasonable but had the wrong shape for the repository.

I did not want to build another "chat with your repo" product. Codex, Claude Code, Cursor, OpenCode, and similar tools already own the editing loop. ctxhelm sits underneath them. It is a local, read-only context compiler that answers one narrow question:

> For this task, what should the agent inspect first, and how should it validate the change?

Given a task and a repository, ctxhelm produces a small, inspectable plan: likely files, related tests, validation commands, risks, warnings, and optional source-bearing packs.

For example, a task might start like this:

```bash
ctxhelm prepare-task "fix the login redirect test" --repo .
```

Illustrative output:

```text
Inspect first:
- src/auth/middleware.rs
  Reason: owns redirect behavior
- tests/auth_redirect.rs
  Reason: likely validation target
- src/session.rs
  Reason: direct callee from middleware

Validate:
- cargo test auth_redirect

Risks:
- redirect destination may be shared by login and session-expiry flows
```

The current public release, `v2.4.0`, can scan a repository, build a safe inventory, extract symbols, combine lexical, graph, related-test, history, memory, feedback, and optional local semantic signals, then return a plan or a budgeted Markdown/JSON pack. It also exposes the same path through MCP. You can install it from GitHub release archives or the public Apple Silicon Homebrew tap.

<section class="ctxhelm-proof-board" aria-label="ctxhelm current proof summary">
  <div class="ctxhelm-proof-board__header">
    <p class="ctxhelm-proof-board__eyebrow">Current proof surface</p>
    <p>What is shipped, measured, blocked, and deliberately not claimed.</p>
  </div>
  <div class="ctxhelm-proof-grid">
    <article>
      <span>Release</span>
      <strong>v2.4.0</strong>
      <p>GitHub archives, checksum proof, release gate, public archive install, and Homebrew formula verification.</p>
    </article>
    <article>
      <span>Retrieval</span>
      <strong>+0.1938</strong>
      <p>Average Recall@10 lift for the agent-evidence channel over lexical on measured source-free corpora.</p>
    </article>
    <article>
      <span>Codex reads</span>
      <strong>1.00</strong>
      <p>Retry-enabled ctxhelm lanes reached full target-read coverage versus baseline <code>0.7083333333333333</code>.</p>
    </article>
    <article>
      <span>HelmBench</span>
      <strong>10 tasks</strong>
      <p>RefactoringMiner Codex matrix passed the quality gate with native and guided runs both at <code>100.0%</code> success.</p>
    </article>
    <article>
      <span>Boundaries</span>
      <strong>Read-only</strong>
      <p>No editing, no hidden source in proof reports, no raw prompts, no transcripts, and no release claims from failed clients.</p>
    </article>
    <article>
      <span>Still open</span>
      <strong>Cross-agent</strong>
      <p>Claude is availability-blocked, Cursor real-client proof is not claimed, and semantic remains opt-in.</p>
    </article>
  </div>
</section>

That sounds clean in hindsight. Building it was not. The hard part was not parsing files. The hard part was keeping the system honest: no source leakage in evals, no vague release claims, no pretending that every client integration worked when only some of them produced machine-checkable evidence.

## Current status after the latest R&D cycle

ctxhelm is now public-release ready. I trust it for demos, pilots, and my own agent workflows. I do not think it is an enterprise code-search platform, and I do not want to dress it up as one.

The parts I trust most:

- `v2.4.0` is published with release archives, audit and manifest files, checksum verification, public archive install proof, Homebrew formula verification, and a clean release gate.
- The four-repo product proof reports zero protected target misses across RefactoringMiner, ctxhelm, ReAgent, and VeriSchema.
- The agent-evidence retrieval channel beats or matches lexical on measured corpora, with average Recall@10 delta `+0.19379663`.
- Codex CLI real-client proof is current: retry-enabled ctxhelm lanes reached `1.00` average target-read coverage versus baseline `0.7083333333333333`, with no evidence misses, evidence-only targets, under-read targets, forbidden commands, client failures, or rate limits.
- Memory reuse is guarded by source-free Codex outcome suites, including cases where memory improves target reads and reduces irrelevant reads.
- Release-gate hygiene is now stricter: distribution metadata smoke writes to a temp path by default, and the release gate fails if validation leaves a dirty worktree.

The parts I am still careful about:

- Claude Code is not current retrieval-quality proof right now. The latest comparable suite is availability-blocked by rate limits and client failures.
- Cursor real-client outcome proof is not claimed until local auth and machine-checkable tool-call evidence are stable.
- Semantic retrieval remains diagnostic and opt-in. The R&D cycle rejected repeated semantic default-promotion attempts because they did not produce stable no-regress lift.
- ctxhelm does not replace Sourcegraph, Cursor, Claude Code, Codex, or OpenCode. It focuses on local, source-free evidence routing and outcome measurement for those agents.

![ctxhelm system architecture](/assets/images/projects/ctxhelm-system-architecture.svg)

## The actual problem

Generic RAG is too blunt for code. If the task says "fix the login redirect test," an embedding search for "authentication redirect behavior" might find something useful. It might also miss the exact test, the route constant, the middleware wrapper, or the commit that introduced the failure.

Code has sharper clues than prose:

- exact identifiers such as `requireSession`, `AUTH_COOKIE_NAME`, or `SQLSTATE 23505`
- file names, route names, test names, config keys, and stack frames
- imports, callers, fixtures, mocks, and package boundaries
- files that often change together
- tests that prove a source file still behaves correctly

The retrieval unit is not just a chunk. It might be a test, symbol, caller, fixture, route, commit hint, or validation command.

So ctxhelm does not start from "top-k chunks." It starts from a task. It asks what kind of task it is, gathers several kinds of evidence, and returns a plan with reasons attached.

## The boundary I care about

ctxhelm is read-only. It does not edit code, run project test commands on its own, commit files, or mutate global agent configuration. That is not a lack of ambition. It is the product boundary.

Agents already have permission models for reads, writes, shell commands, and approvals. If ctxhelm tried to become another agent, it would compete with those systems. By staying read-only, it can fit behind several tools without forcing the user into a new workflow.

The daily flow should be boring:

1. The user asks an existing agent to fix or explain something.
2. The agent calls `prepare_task`.
3. ctxhelm returns likely files, tests, warnings, validation commands, and pack options.
4. The agent reads files and edits with its own tools.
5. If needed, the agent asks for a brief, standard, or deep pack.

That is the whole idea.

## A tiny end-to-end case

The login redirect example is useful because it shows the product boundary.

1. The user asks an agent to fix the login redirect test.
2. The agent calls `prepare_task` with an explicit repository.
3. ctxhelm recommends the middleware, redirect test, session helper, and route file, each with a reason.
4. The agent reads those files with its own tools.
5. The agent asks for a standard pack only if the plan is not enough.
6. The agent runs the suggested test.
7. Feedback records recommended, read, edited, and validated metadata without storing source.

The user-facing consequence is simple: the agent starts with the files and tests that are most likely to matter instead of wandering through the repository.

## Retrieval pipeline

![ctxhelm retrieval pipeline](/assets/images/projects/ctxhelm-retrieval-pipeline.svg)

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

Then the compiler fuses the candidates: it combines evidence from different sources into one ranked, diversified list. The score includes more than similarity: role, reason, line hints, graph distance, test confidence, memory count, feedback count, generated-file penalties, and source-read policy.

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

## Architecture

The code is split into a Rust workspace. I kept the crates small because the project touches several concerns that are easy to blur together.

| Crate | What it owns |
| --- | --- |
| `ctxhelm-core` | Shared contracts, privacy status, typed plans, packs, candidates, and report shapes. |
| `ctxhelm-index` | Repository inventory, search/index state, symbols, graph edges, memory, feedback, and semantic metadata. |
| `ctxhelm-compiler` | Task planning, candidate fusion, budget allocation, pack rendering, inspector output, cards, evals, and release proof summaries. |
| `ctxhelm-mcp` | MCP tools, resources, and prompts. |
| `ctxhelm` | The CLI for setup, diagnostics, indexing, packs, evals, release checks, and `serve-mcp`. |

The contract layer matters more than it looks. If an agent receives a `ContextCandidate`, it should not care whether that candidate came from lexical search, a Tree-sitter symbol, a graph edge, a memory card, or a historical eval. The output shape stays stable while the retrieval internals change.

## Repository intelligence

The first thing ctxhelm does is build a safe inventory. It respects `.gitignore`, `.ctxhelmignore`, and `.cursorignore`. It excludes sensitive and generated files by default. It records metadata such as path, role, language, package boundary, hash, and diagnostics.

Everything else builds on that inventory.

Lexical search is still the workhorse. Embeddings are more fashionable, but exact terms still win surprisingly often in code. A function name, failing assertion text, or route literal can be the best clue in the whole task.

Tree-sitter gives the next layer: functions, classes, methods, types, constants, test cases, and imports. That helps the agent find the function or test case, not just the file, without requiring every repository to have a perfect language-server setup.

The graph layer adds relationships: imports, related tests, co-change hints, memory edges, feedback edges, and optional precision overlays. The graph is useful, but dangerous. Recursive graph expansion is how a small bug fix turns into a giant prompt. ctxhelm treats graph evidence as a ranking signal first and a context-expansion signal second.

Memory and feedback are local. A memory card can say "this repo uses service factories" or "these tests need fake timers," but it carries freshness and review state. Feedback records which files were recommended, read, edited, or validated. It does not store raw prompts or source text.

Semantic retrieval is optional. The default policy is local and cloud-disabled. There is a deterministic local semantic path for testing policy behavior, and stronger local embedding backends can be enabled explicitly. Remote semantic providers should be an explicit policy choice, not an accidental default.

## Contracts

ctxhelm has a few core contract types.

| Contract | Why it exists |
| --- | --- |
| `ContextPlan` | The small first answer, designed for agents to inspect before asking for source. |
| `ContextCandidate` | The evidence record, designed to keep ranking reasons inspectable. |
| `ContextPack` | The source-bearing object, designed for budgeted context expansion. |
| `Inspector` | The audit view, designed to debug selection without copying source. |

## Storage and privacy

![ctxhelm storage and contracts](/assets/images/projects/ctxhelm-storage-contracts.svg)

The storage design is intentionally plain: local metadata, local reports, local state. This is not a hosted index.

The rule is simple:

- Packs may include source because the user or agent explicitly asked for task context.
- Evals, inspector exports, feedback summaries, release proof, and retrieval-health reports do not include source.
- Feedback stores what was recommended, read, edited, or validated, not raw prompts or source text.

That makes public evidence possible. I can say that Claude Code called `prepare_task` and `get_pack` against an explicit repository without publishing the task prompt, raw MCP traffic, terminal logs, or source snippets.

This constraint also keeps the project honest. It is harder to debug when you refuse to dump everything, but it is the right default for a local developer tool.

## Graph retrieval without context bloat

I use "GraphRAG-style" carefully here. ctxhelm does use graph signals, but it does not blindly walk the graph and stuff the result into the prompt.

Graph signals are ranking evidence first and expansion evidence second. For an auth redirect bug, the graph might connect middleware, redirect tests, session helpers, and route definitions.

The useful output is not "here is the whole auth subsystem." It is a bounded set of files with reasons:

```text
auth middleware: owns redirect behavior
redirect test: likely validation target
session helper: direct callee
login route: redirect destination
```

Graph context is useful when it is bounded. Otherwise it becomes expensive noise.

## MCP integration

The MCP surface is small on purpose, and it prefers an explicit `repo` argument. That detail matters because some clients launch MCP servers from a directory that is not the active repository.

| Tool | What it does |
| --- | --- |
| `prepare_task` | Returns the initial plan. |
| `search` | Finds safe files and symbols. |
| `related` | Expands around a file, symbol, or current diff. |
| `get_pack` | Builds a budgeted pack. |
| `related_tests` | Finds likely tests and commands. |
| `current_diff` | Returns safe changed-path metadata. |

One bug from real integration work shaped the design: relying on the server's current working directory is unsafe. The deterministic smoke tests intentionally run from the wrong directory to prove explicit-repo routing still works.

That detail is small, but it decides whether the tool works in a real agent session.

## Evaluation

![ctxhelm evaluation loop](/assets/images/projects/ctxhelm-eval-loop.svg)

I do not trust context tooling without evals. It is too easy to add a graph, embedding, or reranker and convince yourself it helped because the output looks smarter.

ctxhelm uses historical tasks and source-free reports to check whether retrieval is getting better. The eval stack covers fixed-budget retrieval, lexical baselines, signal ablations, protected-target misses, retrieval-health reports, feedback summaries, MCP protocol tests, release gates, and HelmBench runs with real agents.

| Evaluation area | What is checked | Source leakage? |
| --- | --- | --- |
| Historical retrieval | Recall against past tasks and protected targets | No |
| Signal ablations | Lexical vs graph vs feedback vs semantic channels | No |
| MCP protocol tests | Deterministic client/server behavior | No |
| Release gates | Archive, install, `doctor`, `--help`, first-pack behavior | No |
| Client evidence | Codex real-client consumption proof, Claude availability status, Cursor/OpenCode setup proof | No raw prompts or source |
| HelmBench matrices | Native vs ctxhelm-guided coding-agent runs on public regression tasks | No raw prompts, transcripts, terminal logs, or source |

In the release proof snapshots, the agent-evidence retrieval channel beats or matches lexical on measured corpora. The latest Codex outcome suite asks the question I care about more: did the agent actually read the useful files? In the retry-enabled breadth suite, ctxhelm-guided lanes reached full target-read coverage while the baseline stayed below that level.

That distinction matters. A retrieval win is useful, but it is not the same as a coding-agent outcome win.

HelmBench asks the next layer of the same question: after the agent reads the context, does it edit and validate better? The latest local HelmBench proof includes a completed, source-free 10-task RefactoringMiner Codex matrix with a passing quality gate. It is still a small public-suite proof, not a universal benchmark, but it is no longer just a partial matrix.

## Release proof

Release proof is how I keep the project from making claims the archive cannot reproduce.

The public release path is archive-first. For `v2.4.0`, I verified checksums, manifest and audit files, temporary install, `doctor`, `--help`, first-pack behavior, GitHub release assets, and the public Homebrew formula.

The same release proof records:

- public release freshness
- deterministic MCP protocol behavior
- Homebrew formula renderability from the exact archive digest
- public Homebrew tap install and `brew test`
- crates package boundary checks
- Codex real-client evidence for explicit-repo `prepare_task` and `get_pack`
- Claude availability blockers when rate limits prevent comparable evidence
- Cursor and OpenCode setup/MCP protocol proof without overstating real-client outcome proof
- HelmBench launch-readiness reports that separate smoke proof, failed diagnostic matrices, and launch-grade gates

I like this part because it prevents soft claims. If a client works, there should be evidence. If it does not produce evidence yet, the release notes should say that.

## HelmBench

HelmBench exists because retrieval metrics were not enough. I can make ctxhelm rank the right file and still lose if the agent ignores it, edits only half the changed paths, or skips the test that would have caught the mistake.

So HelmBench runs agents in isolated workdirs. It records source-free read, edit, and validation events. It infers edited files from git state. It publishes reports without raw source, prompts, transcripts, terminal logs, or adapter commands.

The first serious public suite uses regression-style coding tasks. It compares native agent runs with ctxhelm-guided runs on task success, validation coverage, recommendation recall, follow-through, context precision, edited-file recall, irrelevant reads, tool calls, and token estimates.

The benchmark has already changed ctxhelm. One failed matrix showed that ctxhelm could point the agent at the right changed paths, but the agent still under-edited companion files: docs, Docker files, tests, helper classes. The fix was not a clever new ranking trick. It was clearer coverage guidance: treat recommended changed-path queues as checklists before deciding the edit set.

The current Codex RefactoringMiner matrix is the strongest HelmBench result so far. Across 10 tasks, Codex native and Codex plus `ctxhelm_mcp` both solved `100.0%` of tasks with `100.0%` validation coverage. The ctxhelm-guided row improved recommendation recall from `0.0%` to `97.5%`, recommendation follow-through from `70.0%` to `100.0%`, context precision from `71.1%` to `74.4%`, edited-file recall from `95.0%` to `100.0%`, and irrelevant reads from `33.8%` to `28.4%`.

That is now launch-grade evidence for the harness and for Codex-guided navigation on this public suite. It is not a claim that ctxhelm always improves every agent. HelmBench also keeps failed and mixed runs visible. Earlier Claude and stricter-guidance matrices exposed outcome regressions, higher tool-call costs, and cases where lower read waste was not worth worse task success.

## What works today

ctxhelm is useful when the task crosses file boundaries or when validation matters. It can produce a first-pass plan, recommend target files with reasons, surface related tests, build context packs, expose everything through MCP, and report retrieval and real-agent consumption quality without leaking source.

Good fit:

- cross-file bug fixes
- validation-heavy changes
- tasks involving tests, routes, fixtures, or package boundaries
- agent sessions where the first read matters
- local teams that want source-free proof of what an agent was shown, read, edited, and validated

Poor fit:

- tiny edits in the current file
- hosted enterprise search
- shared team memory across many developers
- full compiler-grade code intelligence

## Trade-offs

| Decision | Why I chose it | Cost |
| --- | --- | --- |
| Rust | One local binary, strong contracts, fast scanning, predictable CLI/MCP behavior. | More upfront type and build-system overhead than a Python or TypeScript prototype. |
| Lexical-first retrieval | Exact identifiers are often the best code signal. | Conceptual queries need semantic support. |
| Tree-sitter first | Broad parsing without requiring LSP setup. | Less precise than a full compiler or SCIP index. |
| Local source-free reports | Safe to publish and inspect. | Less convenient than dumping raw traces. |
| Read-only compiler | Fits existing agents and their permission models. | ctxhelm cannot fix code directly. |
| Progressive packs | Keeps agents from starting with huge prompts. | The agent must ask for deeper context when needed. |

## What I learned

The hard part is not indexing code. Everyone can index code.

The hard part is deciding what evidence is worth showing an agent, under a budget, for a specific task. That requires retrieval, graph reasoning, privacy policy, test mapping, pack ordering, and evaluation to work together.

I keep coming back to one question:

> What is the smallest evidence set that makes the agent more likely to make the right change?

That is the real project. ctxhelm does not help agents write code. It helps them look in the right place before they write code. HelmBench then checks whether that guidance survived contact with real agent behavior.

<p><a href="https://github.com/thromel/ctxhelm" target="_blank">View ctxhelm on GitHub</a> · <a href="https://github.com/thromel/helmbench" target="_blank">View HelmBench on GitHub</a></p>
