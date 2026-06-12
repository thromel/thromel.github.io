---
layout: showcase
title: "PatchSmith: repair agents that leave receipts"
subtitle: "DeepAgents repair runs, public issue evidence, and local quality gates"
category: projects
group: Projects
show: true
width: 8
date: 2026-06-12 00:00:00 +0600
excerpt: A technical write-up on PatchSmith, a research platform for measuring software-maintenance agents through reproducible repair runs, DeepAgents traces, sandbox validation, and evidence gates.
featured: true
showcase_style: agent-tooling
project_type: Research platform
card_image: /assets/images/projects/patchsmith-repair-pipeline.svg
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

# PatchSmith: repair agents that leave receipts

PatchSmith is the other half of the context work. ctxhelm asks whether an agent can find the right files before editing. PatchSmith asks a messier question:

> After an agent reads, plans, edits, tests, retries, and writes artifacts, what can we honestly say happened?

I built it because most agent demos compress the interesting part into one green check mark. That is not enough for software maintenance. A repair run should leave behind the issue, the repository snapshot, the files the agent saw, the patch it proposed, the validation command, the failure if it failed, and the token and cost metadata if a live model was involved.

PatchSmith is a local research platform for that loop. It can run seeded repair tasks, materialized public issue tasks, DeepAgents-backed planners, OpenAI-backed planners, deterministic baselines, Docker smoke checks, quality gates, launch-readiness checks, and artifact indexing. The useful property is not that every run passes. The useful property is that failed and passing runs are both inspectable.

<section class="patchsmith-proof-board" aria-label="PatchSmith current proof summary">
  <div class="patchsmith-proof-board__header">
    <p class="patchsmith-proof-board__eyebrow">Current proof surface</p>
    <p>What is working in the saved evidence, and what I am deliberately not claiming.</p>
  </div>
  <div class="patchsmith-proof-grid">
    <article>
      <span>Status</span>
      <strong>ready</strong>
      <p>Project status, launch blockers, release hygiene, environment readiness, and quality gate are all green in the latest saved reports.</p>
    </article>
    <article>
      <span>Public repairs</span>
      <strong>3 / 3</strong>
      <p>DeepAgents validated the current focused public issue smoke lane for pytest and Requests tasks.</p>
    </article>
    <article>
      <span>Live model</span>
      <strong>89</strong>
      <p>Saved live-provider runs exist, with DeepAgents and OpenAI provider rows separated from offline fake-model evidence.</p>
    </article>
    <article>
      <span>DeepAgents</span>
      <strong>170</strong>
      <p>Package-backed DeepAgents runs are recorded, separate from compatibility-mode adapter evidence.</p>
    </article>
    <article>
      <span>Canonical cost</span>
      <strong>$0.261364</strong>
      <p>The latest three-task DeepAgents public issue run used 924,137 tokens across four model calls.</p>
    </article>
    <article>
      <span>Boundary</span>
      <strong>focused</strong>
      <p>This proves targeted validation on a small public smoke lane, not full upstream acceptance or arbitrary bug-fixing quality.</p>
    </article>
  </div>
</section>

![PatchSmith repair pipeline](/assets/images/projects/patchsmith-repair-pipeline.svg)

## Why this exists

The basic failure mode is easy to recognize if you have used coding agents for real bug work. The agent sounds confident, writes a plausible patch, maybe runs a test, and then the conversation moves on. Later you realize the test was too narrow, the patch was not grounded in the actual failing path, or the run had no reproducible artifact.

I wanted PatchSmith to be less theatrical:

- reproduce the failure before repair attempts count
- keep setup warnings visible instead of burying them in prose
- separate deterministic baselines from live model runs
- store traces and diffs next to each run
- report token use and estimated cost next to quality
- make launch readiness depend on saved evidence, not vibes

That last part matters. A project status page saying `ready` should be backed by JSON and Markdown artifacts that can be regenerated.

## The object under test

PatchSmith does not try to be one repair agent. It is the harness around repair agents.

The current system has several lanes:

| Lane | What it checks |
| --- | --- |
| Seeded repair tasks | Whether deterministic and model planners can repair controlled local bugs. |
| Public issue corpus | Whether curated real issues can be reproduced, repaired, and validated with focused commands. |
| Runtime adapters | Whether LangGraph, DeepAgents, OpenAI Agents, fake-model, and heuristic modes fit the same repair contract. |
| Artifact index | Whether saved runs, traces, metrics, failures, and reports are discoverable after the fact. |
| Quality and release gates | Whether the repo compiles, tests, builds, passes Docker smoke, and has current readiness evidence. |

The design rule is simple: every status line should point to a file.

## How a run moves through the system

![PatchSmith evidence loop](/assets/images/projects/patchsmith-evidence-loop.svg)

A public issue task starts as a curated record: repository, issue URL, reproduction expectation, focused validation command, setup policy, and reviewed source hints. PatchSmith materializes that into a local task directory, checks that setup and validation are runnable, then records failing reproduction evidence before a repair attempt is allowed to count.

The repair run then follows the same shape each time:

1. Index the repository snapshot.
2. Build native-hybrid context from retrieved files, tests, symbols, and reviewed hints.
3. Ask the runtime planner for a bounded repair plan.
4. Apply only the approved old/new replacement inside the target path.
5. Run the focused validation command in the configured sandbox.
6. Save the report, trace, final diff, validation output, token metadata, and failure category.

The boring steps are the product. They are what make the result reviewable.

## The DeepAgents part

DeepAgents became the most interesting runtime once I stopped treating it as a generic chat wrapper. PatchSmith gives DeepAgents a small, explicit workspace and asks it to operate inside a repair contract.

![PatchSmith DeepAgents contract](/assets/images/projects/patchsmith-deepagents-contract.svg)

The native planner uses `create_deep_agent` with a state-backed virtual filesystem. The files are read-only and bounded to the selected context. PatchSmith also provides memory text, a repair skill, and two named subagents:

| Piece | Role |
| --- | --- |
| Read-only virtual filesystem | Lets the planner inspect retrieved source and fixtures without wandering through the whole repo. |
| `failure-localizer` | Finds the controlling code path before a patch is drafted. |
| `patch-reviewer` | Reviews ambiguous or multi-file repair plans before PatchSmith applies anything. |
| `PatchPlan` schema | Forces a structured response with `path`, `old`, `new`, and `summary`. |
| Safety gate | Applies one bounded replacement only if the target path and span checks pass. |

This matters because the model is not allowed to write directly to the checkout. The model proposes. PatchSmith applies, tests, records, and rejects if the proposal does not satisfy the contract.

## What the latest public issue run proved

The current canonical public issue repair lane used the `deepagents` runtime with the `deepagents` planner, native-hybrid context, local sandbox mode, and one feedback retry allowed. The model provider was `deepagents_openai_chat`, using `gpt-5.4-mini-2026-03-17`.

![PatchSmith latest run ledger](/assets/images/projects/patchsmith-run-ledger.svg)

| Task | Repository | Validation command | Result |
| --- | --- | --- | --- |
| `pytest_14552_moved_file_filename` | `pytest-dev/pytest` | `python3 -m pytest testing/test_issue_14552_repro.py` | validated after one retry |
| `requests_7223_chardet_extra` | `psf/requests` | `python3 -m pytest tests/test_issue_7223_repro.py` | validated |
| `requests_7341_chunked_encoding_docs` | `psf/requests` | `python3 -m pytest tests/test_issue_7341_repro.py` | validated |

The run total was four model calls, 924,137 tokens, and an estimated `$0.261364`. The pytest task needed a feedback retry. The two Requests tasks validated on the first repair attempt. All three rows still carry the setup caveat that repair validation depends on Docker bridge networking.

That is a real result, but it is a narrow result. It says PatchSmith can run a small, reviewed public issue smoke lane through DeepAgents and save enough evidence to inspect the result. It does not say the patches are upstream-ready, that the full upstream suites pass, or that this setup beats every other repair agent.

## Readiness is also part of the system

The latest saved project status report, generated on June 12, 2026, says:

| Surface | Latest saved status |
| --- | --- |
| MVP progress | `100.0%` complete |
| Delivery audit | `ready_for_completion_review`, 21 of 21 passed |
| Quality gate | passed, 4 of 4 checks |
| Launch blockers | ready, 0 blockers and 0 warnings |
| Release hygiene | ready, 13 of 13 checks |
| Environment readiness | ready, 10 of 10 checks |
| Docker smoke | passed |
| Evidence freshness | fresh |

The quality gate is deliberately plain: compile Python sources, run `git diff --check`, run the pytest suite, and build the source distribution and wheel. This is not glamorous, but it prevents a demo-ready repair harness from quietly drifting into an unbuildable repo.

## What failed along the way

The current page would be misleading if it only showed the final 3/3 row. Earlier DeepAgents public issue attempts failed on the pytest task and on a Requests task. Some runs produced no patch. Some generated patches failed the sandbox test. The demo readiness report still lists runs requiring attention, grouped into categories such as `no_patch_generated`, `run_failed`, `sandbox_test_failed`, and `test_failure_after_patch`.

That is not cleanup noise. It is the point of PatchSmith.

Repair evaluation gets better when failure cases stay visible. A failed run tells me whether the context was wrong, the planner ignored a hint, the bounded replacement was too brittle, the validation command was too narrow, or the setup policy was not honest enough.

## Benchmark design from here

The next benchmark work should stay small enough to audit, but varied enough to matter. I would rather have a 20-task suite with clean artifacts than a 2,000-task number that nobody can reproduce locally.

The benchmark shape I want:

| Dimension | What to record |
| --- | --- |
| Task source | Public issue URL, repository snapshot, reproduction evidence, and curated validation command. |
| Runtime | Heuristic, fake model, LangGraph, DeepAgents, OpenAI Agents, and future adapters. |
| Context mode | Native hybrid, ctxhelm broker, source-hint variants, and ablations. |
| Outcome | Patch generated, focused validation, retry count, final diff, and failure category. |
| Cost | Model calls, input tokens, output tokens, total tokens, estimated cost, and wall time. |
| Review boundary | Whether the result is targeted validation, full suite validation, upstream-ready patch, or only diagnostic evidence. |

That last column is the one I care about most. It keeps a repair benchmark from turning into a scoreboard detached from what was actually checked.

## How this connects to ctxhelm

ctxhelm and PatchSmith are deliberately different.

ctxhelm is read-only. It helps an agent choose what to inspect. It measures whether context guidance changes the files an agent reads and the validation it follows.

PatchSmith is the repair harness. It lets an agent propose a patch, but it keeps application, testing, cost accounting, artifact writing, and readiness gates under PatchSmith control.

Together, they make one research loop:

1. ctxhelm asks whether better context routing gets the agent to the right evidence.
2. PatchSmith asks whether the repair attempt survives validation and leaves a credible trail.
3. The benchmark asks whether the result generalizes beyond one nice demo.

I do not think any of this proves that autonomous software repair is solved. I do think it gives me a better way to discuss repair agents without hand-waving over the part where the code actually changed.

## What I trust today

I trust PatchSmith as an R&D harness for focused repair experiments. I trust the DeepAgents integration enough to keep testing it first. I trust the current readiness reports because they are generated from saved artifacts and executable gates.

I do not yet trust it as a broad repair benchmark. The public issue lane is still small. Focused validation is useful, but it is not the same as full upstream validation. Cost numbers are model- and prompt-shape dependent. A stronger benchmark needs more repositories, more failure types, stronger baselines, and a stricter review story.

That is a good place to be. The system is no longer just a scaffold. It repairs a small public lane with live model evidence, records what happened, and tells me where the next benchmark has to get harder.

<p><a href="https://github.com/thromel/patchsmith" target="_blank">View PatchSmith on GitHub</a></p>
