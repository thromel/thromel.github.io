---
layout: showcase
title: "PatchSmith: a harness for repair agents"
subtitle: "System design and R&D notes for bounded patches, sandbox validation, and auditable repair runs"
category: projects
group: Projects
show: true
width: 8
date: 2026-06-12 00:00:00 +0600
excerpt: "PatchSmith is an auditable repair harness for coding agents: it gives an agent bounded context, accepts a structured patch proposal, validates it in a sandbox, and saves the evidence needed to inspect the repair claim later."
featured: true
showcase_style: agent-tooling
project_type: Research platform
card_image: /assets/images/projects/patchsmith-component-architecture.svg
technologies:
  - Python
  - DeepAgents
  - OpenAI
  - Coding Agents
  - Software Repair
  - Evaluation
  - Docker
  - Pytest
  - Observability
  - Release Engineering
  - Public Issue Benchmarks
---

# PatchSmith: a harness for repair agents

Coding agents often end with a confident little green check mark.

That is fine when the task is a local chore. It is not enough for repair
research. For a real repair attempt, I want to know the repository snapshot, the
files shown to the model, the exact patch proposed, the validation command, the
logs, the diff, the retry history, and the reason a failed attempt failed.

PatchSmith is the harness around repair agents. The agent proposes a bounded
patch. PatchSmith applies it through its own gate. A sandbox runs validation.
The result is not a chat transcript; it is an artifact directory someone else
can inspect.

**The model gets to propose. PatchSmith owns the mutation.**

For repair agents, the artifact directory matters more than the chat transcript.

<div class="patchsmith-proof-board">
  <div class="patchsmith-proof-board__header">
    <span class="patchsmith-proof-board__eyebrow">Core claim</span>
    <p>PatchSmith turns a repair attempt into inspectable evidence: context, patch, validation, traces, logs, cost, and claim boundary.</p>
  </div>
  <div class="patchsmith-proof-grid">
    <article>
      <span>Agent</span>
      <strong>proposes</strong>
      <p>Reads bounded context and returns a structured patch plan.</p>
    </article>
    <article>
      <span>Harness</span>
      <strong>applies</strong>
      <p>Checks paths and exact source spans before mutating the workspace.</p>
    </article>
    <article>
      <span>Sandbox</span>
      <strong>validates</strong>
      <p>Runs the configured command and records stdout, stderr, exit code, and timing.</p>
    </article>
  </div>
</div>

## A repair attempt, end to end

The smallest useful demo is a seeded logic bug:

```bash
patchsmith demo seeded-logic-bug
patchsmith inspect artifacts/demo/seeded_logic_bug/runs/<run_id>
```

The run is intentionally small. The issue says `add(2, 3)` should return `5`.
The broken source subtracts instead of adding. PatchSmith selects the relevant
source and test, asks the runtime for a bounded replacement, applies the patch,
and runs focused validation.

The output is not just "passed." It is a directory:

```text
artifacts/demo/seeded_logic_bug/runs/<run_id>/
  artifact_index.md
  context/selected_files.json
  final.diff
  logs/stderr.txt
  logs/stdout.txt
  metadata.json
  report.md
  traces.jsonl
```

A compact sample row looks like this:

| Field | Value |
| --- | --- |
| Task | `seeded_bugs_v1/task_001_logic_bug` |
| Runtime | `heuristic` demo path, with the same outer contract used by model runtimes |
| Context provider | `native_hybrid` |
| Validation | `python3 -m pytest` |
| Outcome | `patch_validated` |
| Claim boundary | `focused_validation_only` |

The diff is deliberately boring:

```diff
--- a/src/simple_calc.py
+++ b/src/simple_calc.py
@@ -1,5 +1,5 @@
 def add(left: int, right: int) -> int:
-    return left - right
+    return left + right
```

That is the point. The demo is not trying to impress with a hard bug. It is
there so the repair contract is visible in five minutes.

Static sample artifacts live in the repository:

- [validated seeded run](https://github.com/thromel/patchsmith/tree/main/docs/sample_artifacts/seeded_logic_bug)
- [empty diff blocked](https://github.com/thromel/patchsmith/tree/main/docs/sample_artifacts/empty_diff_blocked)
- [failed validation](https://github.com/thromel/patchsmith/tree/main/docs/sample_artifacts/failed_validation)

Those three rows show the shape I care about: success is inspectable, rejection
is inspectable, and failure is inspectable.

## The harness boundary

PatchSmith has one simple rule:

```text
propose -> apply -> validate
```

The planner owns reasoning. PatchSmith owns state changes, validation, artifacts,
and the final claim.

![PatchSmith repair pipeline](/assets/images/projects/patchsmith-repair-pipeline.svg)

That boundary prevents a common agent benchmark problem. If the same system
chooses context, edits the repository, changes the validation command, retries
silently, and declares success, the result is hard to audit. The benchmark starts
comparing privileges rather than repair behavior.

PatchSmith keeps the risky verbs separate:

| Step | Owner | Artifact |
| --- | --- | --- |
| Select context | Context broker | selected files, diagnostics, warnings |
| Propose patch | Runtime planner | `PatchPlan`, runtime traces, model metadata |
| Apply patch | PatchSmith patch gate | `final.diff`, patch diagnostics |
| Validate | Sandbox runner | stdout, stderr, exit code, duration |
| Explain outcome | Analysis/reporting layer | `report.md`, `metadata.json`, `traces.jsonl` |

This does not make agents magically correct. It makes their claims easier to
inspect after the terminal window is gone.

## Architecture

PatchSmith is CLI-first and file-artifact-first. There is no hosted service, no
queue, and no database required for the core loop.

![PatchSmith component architecture](/assets/images/projects/patchsmith-component-architecture.svg)

The main loop is:

```text
task manifest
  -> controlled workspace
  -> context broker
  -> AgentTask
  -> runtime planner
  -> bounded PatchPlan
  -> patch gate
  -> sandbox validation
  -> artifact directory
```

The most important contracts are small:

| Contract | Purpose |
| --- | --- |
| `RunRequest` | Repository, issue text, validation command, runtime, planner, sandbox mode, and context settings. |
| `ContextBundle` | Ranked files, related tests, warnings, diagnostics, and source hints. |
| `AgentTask` | The normalized task given to a runtime. |
| `PatchPlan` | A bounded edit: path, exact old span, replacement span, summary, and localization rationale. |
| `CommandResult` | Validation command, exit code, stdout, stderr, duration, and timeout state. |

The `PatchPlan` shape is intentionally restrictive:

```text
path: repository-relative file path
old: exact source text to replace
new: replacement text
summary: short explanation
failure_mechanism: why the behavior failed
target_rationale: why this span controls the failure
```

If the path escapes the repository, the patch is rejected. If the old span is
not present exactly, the patch is rejected. If the test fails after the patch is
applied, the run is not a success. Each outcome gets a different failure class.

## The run directory is the product

The evidence loop is the part that makes PatchSmith more than a prompt wrapper.

![PatchSmith evidence loop](/assets/images/projects/patchsmith-evidence-loop.svg)

A run should let a later reader answer practical questions:

- What source did the planner see?
- What did the planner propose?
- Did the patch apply cleanly?
- What validation command ran?
- Did the focused command pass?
- If it failed, was that retrieval, planning, patch application, sandbox setup, or validation?
- What claim is allowed by this evidence?

PatchSmith now treats failure categories as first-class report data. Examples
include `no_patch_generated`, `empty_diff`, `malformed_patch_plan`,
`old_span_not_found`, `unsafe_path_rejected`, `test_failure_after_patch`,
`test_environment_policy_blocked`, `timeout`, and `validated`.

That taxonomy matters because a failed run is still data. A setup failure should
not be counted as a model hallucination. A missing old span should not be counted
as a test failure. A focused test pass should not be inflated into upstream
acceptance.

## DeepAgents as planner, not product

DeepAgents is the most promising runtime so far because it packages several
things coding agents need for longer work: planning, virtual files, skills,
memory, subagents, permissions, and structured output.

PatchSmith does not use DeepAgents as the whole product. It uses DeepAgents as a
planner inside a repair harness.

![PatchSmith DeepAgents contract](/assets/images/projects/patchsmith-deepagents-contract.svg)

The integration gives DeepAgents a read-only virtual workspace:

```text
/.patchsmith/AGENTS.md
/.patchsmith/skills/patchsmith-repair/SKILL.md
/.patchsmith/source-hints.md
/.patchsmith/retry-feedback.md
/repo/<selected source files>
```

The main planner can use two narrow subagents:

| Subagent | Job |
| --- | --- |
| `failure-localizer` | Identify the file or function that controls the reproduced behavior. |
| `patch-reviewer` | Check that a proposed bounded replacement is minimal, in scope, and likely to satisfy the focused validation. |

The final output still has to be a `PatchPlan`. DeepAgents can reason, inspect,
delegate, and review. It cannot directly mutate the checkout or decide how it
passed.

That is the contribution of DeepAgents here: it gives the planner a richer
working environment while PatchSmith keeps the repair claim auditable.

## Context is part of the experiment

Many repair failures begin before code generation. If the planner never sees the
controlling file, the rest of the run may look polished while still being wrong.

PatchSmith keeps context selection outside the runtime. The same task can be run
with native keyword search, native hybrid retrieval, graph retrieval, or a
ctxhelm context-broker adapter. The runtime receives a normalized
`ContextBundle`; the run directory records where that context came from.

That separation lets the benchmark ask cleaner questions:

- Did ctxhelm route better context than the native selector?
- Did DeepAgents use the selected context better than a baseline planner?
- Did a retry fail because the planner repeated the same bad patch, or because context still missed the relevant file?
- Did a source hint change the result, and was that hint recorded?

Retrieval is not prompt decoration. It is part of the experiment.

## What PatchSmith is not

PatchSmith is not an autonomous GitHub issue fixer. It is not a hosted repair
service. It is not proof that a focused test pass equals an upstream-ready patch.
It is not a leaderboard claim that one agent beats another.

It is an auditable repair harness.

That positioning matters. SWE-agent, OpenHands, Agentless-style pipelines, and
plain prompt scripts are all useful comparison points. PatchSmith's emphasis is
different: preserve enough evidence to inspect the repair claim later, and keep
runtime privileges comparable when running experiments.

## Current status

The current state is useful, but bounded.

| Lane | What it proves | What it does not prove |
| --- | --- | --- |
| Seeded bug lane | PatchSmith can retrieve context, generate or accept a bounded patch, apply it, validate it, and write artifacts on controlled tasks. | Real public issue repair quality. |
| Public issue smoke lane | The setup, reproduction, and validation workflow can be calibrated with task-level caveats. | Broad GitHub issue solving. |
| DeepAgents seeded runs | A live planner can run through the PatchSmith contract and leave saved evidence. | General superiority over other coding agents. |
| Static artifact gallery | Success, rejection, and failure can be reviewed without rerunning anything. | A benchmark score. |

I trust PatchSmith today as an R&D harness for focused repair experiments. I do
not trust it yet as a broad claim that it can fix arbitrary public issues.

That restraint is part of the project. The harness should make overclaiming
harder, not easier.

## What failed runs teach

The strongest version of PatchSmith is not a prettier success counter. It is a
failure microscope.

```text
repair attempt
  -> no patch?
  -> malformed plan?
  -> unsafe path?
  -> old span missing?
  -> validation failed?
  -> setup failed?
  -> focused validation passed?
```

Those outcomes need different fixes. Retrieval misses suggest context work.
Malformed patch plans suggest runtime or schema work. Old-span misses suggest
patch formatting or stale context. Test failures suggest a wrong repair.
Environment failures suggest benchmark setup work.

That is why the run directory matters. It lets a failed attempt become an
engineering signal instead of a vanished chat transcript.

![PatchSmith run ledger](/assets/images/projects/patchsmith-run-ledger.svg)

## Next experiments

The next useful work is concrete:

1. Expand the public issue suite with benchmark manifests that record repository snapshot, issue provenance, reproduction command, focused validation, reviewed context, runtime, retry budget, cost, and claim boundary.
2. Run the same tasks across deterministic, OpenAI-backed, DeepAgents, and ctxhelm-backed context variants.
3. Add runtime fairness checks that enforce the same `AgentTask`, context bundle, validation command, retry budget, and mutation boundary across runtimes.
4. Keep token and cost gates active before running larger live-model suites.
5. Add richer but still bounded patch formats for multi-file edits once the single-replacement path is boringly reliable.
6. Publish more sample artifact bundles, especially rejected and failed runs.

The goal is not to make the blog sound more confident. The goal is to make the
evidence visible sooner.

## References

- [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770)
- [SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793)
- [Agentless: Demystifying LLM-based Software Engineering Agents](https://arxiv.org/abs/2407.01489)
- [OpenHands: An Open Platform for AI Software Developers as Generalist Agents](https://arxiv.org/abs/2407.16741)
- [DeepAgents documentation](https://docs.langchain.com/oss/python/deepagents/overview)
- [PatchSmith repository](https://github.com/thromel/patchsmith)
- [PatchSmith artifact gallery](https://github.com/thromel/patchsmith/blob/main/docs/artifact_gallery.md)
- [PatchSmith failure taxonomy](https://github.com/thromel/patchsmith/blob/main/docs/failure_taxonomy.md)

<p><a href="https://github.com/thromel/patchsmith" target="_blank">View PatchSmith on GitHub</a></p>
