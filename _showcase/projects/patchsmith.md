---
layout: showcase
title: "PatchSmith: a harness for repair agents"
subtitle: "System design notes for bounded patches, sandbox validation, and auditable repair runs"
category: projects
group: Projects
show: true
width: 8
date: 2026-06-12 00:00:00 +0600
excerpt: A system design write-up on PatchSmith, a local research harness for running software-repair agents without giving the model direct control over patching, validation, or evidence claims.
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

PatchSmith started from a fairly practical annoyance: coding agents can sound done long before the repair is actually inspectable.

The agent reads a few files, writes a patch, maybe runs a test, and the conversation ends with a green check mark. That is fine for a quick local chore. It is a weak basis for repair research. I want to know what repository snapshot was used, which files were shown to the agent, what exact patch it proposed, what command validated it, where the logs are, and what failed when the patch did not work.

So PatchSmith is not a repair agent. It is the harness around repair agents. The design is intentionally a little boring: clone or copy a repo, select context, ask a planner for a bounded patch, apply the patch through PatchSmith's own gate, run validation in a sandbox, and save the evidence.

The model gets to propose. PatchSmith owns the mutation.

## design goals

The first design goal was to keep the model out of the parts that decide whether a run counts. A planner can inspect files and return a patch plan, but it cannot silently rewrite the checkout, choose a different validation command after the fact, or summarize away a failed test.

The second goal was to make failed runs useful. A failed repair should still answer useful questions: did retrieval miss the right file, did the planner patch a symptom, did the sandbox reject the command, did the old span fail to apply, or did the focused test expose a real logic mistake?

The third goal was adapter pressure. I wanted DeepAgents, OpenAI-backed planners, deterministic baselines, and future runtimes to fit behind the same contract. Otherwise every experiment becomes a custom demo, and custom demos are hard to compare.

## system boundary

PatchSmith is CLI-first today. There is no hosted service, no queue, and no database required for the core loop. Runs write to local artifact directories. That keeps the research surface simple and makes the output easy to inspect in a repo checkout.

The boundary looks like this:

```text
input task
  -> controlled workspace
  -> context broker
  -> runtime planner
  -> bounded patch gate
  -> sandbox validation
  -> artifacts and reports
```

The important part is ownership. The planner owns reasoning. PatchSmith owns state changes, validation, and the final claim.

![PatchSmith component architecture](/assets/images/projects/patchsmith-component-architecture.svg)

## core contracts

PatchSmith is held together by a few plain contracts.

`RunRequest` is the envelope for a run: repository, issue text, optional issue URL, commit or branch, validation command, runtime, planner, context provider, sandbox mode, and reviewed context paths.

`ContextBundle` is the normalized context answer. It can come from native keyword search, native hybrid retrieval, graph retrieval, or a ctxhelm CLI call. The runtime does not need to know which provider won. It sees ranked files, related tests, validation hints, warnings, and diagnostics.

`AgentTask` is what the runtime receives. It contains the run id, workspace path, issue text, retrieved context, validation command, and runtime configuration.

`PatchPlan` is the model-facing repair contract. It is deliberately small:

```text
path: repository-relative file path
old: exact source text to replace
new: replacement text
summary: short explanation
```

That shape is limiting on purpose. It rules out broad, model-driven workspace edits. If the old span is not present, the patch is rejected. If the path escapes the repo, the patch is rejected. If the target is not a file, the patch is rejected.

`CommandResult` records validation: command, exit code, stdout, stderr, duration, timeout state, and command-policy decision. It is not a paragraph saying "tests passed." It is the thing a later reader can inspect.

## run lifecycle

The main loop lives in `RepairRunner`. It creates a run directory, clones or copies the repo, indexes the workspace, selects context, asks a runtime for a patch, validates the result, and writes reports.

![PatchSmith evidence loop](/assets/images/projects/patchsmith-evidence-loop.svg)

A run directory ends up with a shape like this:

```text
artifacts/runs/<run_id>/
  repo/
  context/
  feedback/
  logs/
  patches/
  report.md
  traces.jsonl
  final.diff
```

That directory is the product. The terminal output is temporary. The run directory is what lets me come back later and ask, "What actually happened here?"

## context selection

Context is a separate subsystem because repair failures often begin before the model writes any code. If the agent never sees the controlling file or the test that reproduces the bug, the rest of the run is mostly theater.

PatchSmith has a native selector with keyword, hybrid, and graph-backed modes. It also has a ctxhelm adapter. The adapter shape matters: ctxhelm stays read-only and returns context evidence; PatchSmith still owns patching and validation.

Reviewed context paths can also be promoted into the selected context. I added that because public issue work often has a small amount of human-reviewed reproduction evidence. If a repro points at a specific function, the harness should not force the model to rediscover that from scratch.

The context layer writes its own artifacts and trace events. When a repair fails, I can inspect whether the right source was even available to the planner.

## runtime boundary

The runtime boundary is intentionally narrow. A runtime takes an `AgentTask` and returns an `AgentResult`.

That result can come from a heuristic planner, a fake model used for deterministic tests, an OpenAI-backed planner, or DeepAgents. The rest of the workflow does not care. It still applies the patch through the same gate and runs the same sandbox validation.

This is the part I care about most for benchmark work. If each runtime gets special privileges, the comparison becomes meaningless. PatchSmith tries to make the runtime swappable without hiding the differences in traces.

## deepagents integration

DeepAgents is the most interesting runtime so far because it already packages several patterns that coding agents need for longer work: planning, virtual files, memory, skills, subagents, permissions, and structured output. The LangChain docs describe it as an agent harness built on LangGraph, with the usual tool-calling loop plus extra scaffolding for multi-step tasks. That framing matches how PatchSmith uses it. I do not need DeepAgents to be the whole product. I need it to be a good planner inside a repair system.

![PatchSmith DeepAgents contract](/assets/images/projects/patchsmith-deepagents-contract.svg)

The native DeepAgents planner gets a state-backed virtual filesystem. The files are read-only and limited to the selected context. PatchSmith injects a small repair skill, a memory file, optional source hints, and optional retry feedback.

There are two subagents:

- `failure-localizer`, for finding the source path that actually controls the reproduced behavior
- `patch-reviewer`, for checking ambiguous or multi-file repair plans before PatchSmith applies anything

The final answer still has to be a `PatchPlan`. DeepAgents can reason, inspect, and review. It cannot directly edit the checkout.

That constraint made the integration much more useful. Without it, DeepAgents is another powerful agent with a lot of freedom. With it, DeepAgents becomes a planner inside a repair harness.

The integration roughly maps DeepAgents concepts to PatchSmith responsibilities like this:

| DeepAgents concept | PatchSmith use |
| --- | --- |
| Todo planning | The planner has to keep a short repair plan before reading files or choosing an edit. |
| Virtual filesystem | Retrieved source, fixtures, source hints, and retry feedback appear as bounded files. |
| Skills | The repair contract is loaded as a small task-specific instruction set. |
| Subagents | Failure localization and patch review are delegated without filling the main planner context. |
| Structured output | The planner must return `PatchPlan`, not a free-form patch narrative. |
| Permissions | The planner reads context, but PatchSmith applies the edit outside the agent. |

I deliberately did not expose the full agent toolbox. DeepAgents can support shell-capable backends and richer filesystem operations, but PatchSmith keeps shell execution in its own sandbox runner. That is a product decision, not a missing feature. For repair evaluation, the validation command should be part of the harness, not something the model quietly changes when the first attempt fails.

## notes on building agents

Most agent advice sounds obvious until you build one and watch it fail in boring ways. PatchSmith follows a few rules that came from reading the DeepAgents and OpenAI agent docs, then stress-testing those ideas against repair tasks.

Start with one capable agent, then split only when the split buys something. OpenAI's agent guide makes this point directly: a single agent with clear tools is easier to evaluate and maintain, while multi-agent systems add coordination cost. PatchSmith uses one main DeepAgents planner and two narrow subagents. The subagents exist because they reduce context noise: one looks for the controlling failure path, the other reviews a proposed patch.

Treat tools as contracts, not conveniences. A tool should have a narrow job, clear input, and a reviewable output. PatchSmith's most important "tool" is not a glamorous LLM call; it is the old/new replacement gate. The model can be clever inside the plan, but the mutation surface stays plain.

Keep untrusted text away from irreversible actions. Issue bodies, stack traces, docs, and test output can all contain instructions that should not control the harness. PatchSmith turns those inputs into structured fields, selected context, source-hint files, and retry-feedback files. The planner can read them, but it still cannot write arbitrary files or choose its own success condition.

Use subagents for context quarantine, not decoration. The LangChain subagent docs emphasize that subagents help keep the main agent's context clean. That is exactly the repair use case. A failure-localizer can inspect noisy evidence and return a concise judgment. The main planner does not need every intermediate read.

Make traces a first-class output. OpenAI's Agents SDK tracing docs frame traces as records of model generations, tool calls, handoffs, guardrails, and custom events. PatchSmith keeps its own local version of that idea in `traces.jsonl`. I want the same debugging affordance without depending on a hosted dashboard.

Add guardrails where the state changes, not only where the text is generated. Output schemas are useful, but they are not enough. PatchSmith validates the proposed path and exact old span at patch time. It also keeps sandbox validation outside the planner. The guardrail is close to the thing it protects.

## challenges we faced

The hardest challenge was not getting an agent to produce code. That part happens quickly. The hard part was deciding when the patch should count.

Public issue repair makes this uncomfortable. A focused reproduction test can pass while the patch is still not something I would send upstream. Setup can be fragile. Dependency installation can fail for reasons unrelated to the repair. Docker networking can matter. A task can be useful for calibration and still be too narrow for a broad claim. PatchSmith had to make those caveats visible instead of flattening everything into "passed" or "failed."

The second challenge was keeping DeepAgents powerful without letting it own the whole run. DeepAgents naturally wants tools, files, memory, subagents, and sometimes shell access. That is exactly why it is useful. It is also why the boundary matters. PatchSmith gives it read-only context and a structured repair contract, then keeps patch application and validation outside the agent. That took some iteration because the most obvious integration path is also the least auditable one: give the agent tools and let it work.

The third challenge was retry design. A retry should learn from the failed attempt, but it should not inherit a half-broken workspace. The current loop writes a feedback brief, records the failed diff and sandbox signal, restores the checkout, and then asks the planner to try again. That sounds straightforward now. It was easy to get subtly wrong.

The fourth challenge was context. Sometimes the issue text points directly at the right file. Sometimes it points at a symptom. Sometimes a validation fixture is the best clue. This is where ctxhelm and the native context selector both matter: the repair planner should start with the files most likely to explain the failure, but the harness still has to record what it showed the planner in case the run fails.

The last challenge was presentation. Early versions of the project page looked too much like a scoreboard. That was accurate in one sense, but it pulled attention away from the system design. PatchSmith is more interesting as an architecture for controlled repair experiments than as a row of numbers.

## bounded patching

PatchSmith applies patches with one operation: replace this exact old text in this exact repo-relative file with this new text.

That sounds crude. It is also easy to audit. For early repair experiments, I prefer a patch gate that rejects too much over one that accepts clever, hard-to-review edits. A rejected patch is a clean failure. A broad silent rewrite is much harder to reason about.

The gate checks that the path stays inside the repository, the target exists, the target is a file, and the old span appears in the file. Then it writes the replacement and records a unified diff.

This is where PatchSmith draws the line between "the model suggested a patch" and "the workspace changed."

## sandbox validation

Validation is also owned by PatchSmith. The run request provides the command, and the sandbox runner executes it under the configured policy.

Local mode is useful for seeded tasks and fast development. Docker mode is useful when public issue tasks need more isolation or reproducible setup. Either way, the result is captured as data, not prose.

The sandbox does not make a grand judgment about software quality. It answers a narrower question: did the configured validation command pass for this patched workspace?

That distinction matters. A focused test can prove that one reproduced behavior now passes. It does not prove that the patch is upstream-ready.

## feedback retries

Retries are easy to get wrong. If a model fails, it is tempting to paste the test output back into a new prompt and hope for the best. PatchSmith makes that path explicit.

When a retry is allowed, the workflow writes a feedback brief. The brief includes the failed status, the sandbox signal, patch diagnostics, and the failed diff. Then PatchSmith restores the workspace before the next attempt.

The retry agent sees the failure, but it starts from a clean checkout. That keeps the second attempt from building on top of a broken first patch.

## artifacts and observability

PatchSmith writes a trace event for each meaningful step: ingest, index, retrieval, context broker, runtime, patch application, sandbox, analysis, retry, restore, and report writing.

The Markdown report is for humans. The JSONL trace is for debugging and later analysis. The diff is for code review. The logs are for validation. The context directory shows what the planner received.

This is the part that makes the project feel less like a demo and more like a measurement tool. When a run fails, I do not have to reconstruct the story from a chat transcript.

## evaluation lanes

PatchSmith has two kinds of tasks.

Seeded tasks are controlled bugs. They are good for development because the expected failure shape is known and the setup is cheap.

Public issue tasks are closer to real maintenance work. They need more care: repository snapshots, setup policy, reproduction evidence, focused validation, and caveats about what the focused command proves.

The benchmark direction is simple: keep tasks small enough to audit, but varied enough to expose different failure modes. I would rather have a small suite with clean artifacts than a large scoreboard nobody can reproduce.

## readiness checks

The platform also checks itself. A repair harness that cannot build, test, package, or regenerate its own reports is not a harness I want to trust.

The readiness layer runs ordinary engineering checks: Python compile checks, pytest, source distribution and wheel builds, Docker smoke, release hygiene, environment readiness, and artifact indexing.

Those checks are not exciting. They are there to keep the experiment machinery honest.

## tradeoffs

The bounded patch format is restrictive. It will struggle with large edits, file creation, generated code, and coordinated changes across many files. I am okay with that for now. The current goal is repair measurement, not maximum patch expressiveness.

The local artifact model is plain. There is no database query UI. That makes exploration less slick, but it keeps the evidence portable. A run is a folder you can inspect, copy, diff, or archive.

Focused validation is useful but narrow. It is the right first gate for public issue calibration, but it should not be confused with full upstream acceptance. PatchSmith keeps that boundary visible because repair benchmarks get misleading fast when they collapse every kind of validation into "solved."

## where ctxhelm fits

ctxhelm and PatchSmith solve adjacent problems.

ctxhelm is read-only. It helps an agent choose what to inspect first and how it might validate a change.

PatchSmith is the repair harness. It can use ctxhelm as a context broker, but PatchSmith still owns patch application, sandbox validation, artifacts, and claims.

That split is useful. Context routing and repair validation can improve independently, and the benchmark can ask which part actually changed the outcome.

## what I trust today

I trust PatchSmith as an R&D harness for focused repair experiments. I trust the DeepAgents integration enough to keep testing it first. I do not trust it yet as a broad repair benchmark.

That is not a bad place to be. The system has the shape I wanted: agents can propose repairs, the harness keeps them inside a contract, and every serious claim has to point back to files on disk.

## references

These are the online resources I used while shaping the DeepAgents and agent-building parts of the system:

- [Deep Agents overview, LangChain docs](https://docs.langchain.com/oss/python/deepagents/overview): planning, virtual filesystems, subagents, memory, permissions, and the "agent harness" framing.
- [Deep Agents customization, LangChain docs](https://docs.langchain.com/oss/python/deepagents/customization): `create_deep_agent` configuration, including model, tools, middleware, subagents, skills, memory, permissions, backend, and response format.
- [Deep Agents subagents, LangChain docs](https://docs.langchain.com/oss/python/deepagents/subagents): context isolation, custom subagents, descriptions, model choice, and when not to delegate.
- [langchain-ai/deepagents, GitHub](https://github.com/langchain-ai/deepagents): package-level feature list and relationship to LangGraph, LangChain, filesystem backends, skills, and human-in-the-loop controls.
- [Building multi-agent applications with Deep Agents, LangChain blog](https://www.langchain.com/blog/building-multi-agent-applications-with-deep-agents): subagent patterns, context preservation, specialization, multi-model routing, and parallel work.
- [OpenAI Agents SDK guide](https://developers.openai.com/api/docs/guides/agents): agent framing around planning, tool calls, specialist collaboration, orchestration, approvals, and state.
- [OpenAI practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/): starting simple, adding tools before splitting agents, using evals, and deciding when multi-agent orchestration is worth the cost.
- [OpenAI Agents SDK tracing](https://openai.github.io/openai-agents-python/tracing/): trace and span concepts for debugging agent runs.
- [OpenAI Agents SDK guardrails](https://openai.github.io/openai-agents-python/guardrails/): input, output, and tool guardrail patterns.
- [OpenAI safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety): tool approvals, guardrails, trace graders, evals, and isolating untrusted data from agent actions.

<p><a href="https://github.com/thromel/patchsmith" target="_blank">View PatchSmith on GitHub</a></p>
