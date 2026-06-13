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

## what this means by "agent"

Agent is an overloaded word. In this post I use it in a narrow way.

An LLM call is not an agent. It is a model invocation. A repair agent is the loop around that model: the prompt, tools, context, state, plan, tool calls, validation, retries, and stopping rules. That loop is where most engineering decisions live.

There are a few moving pieces worth naming:

| Term | Meaning in PatchSmith |
| --- | --- |
| Planner | The model-backed component that reads context and proposes a patch plan. |
| Runtime | The adapter that lets PatchSmith run a planner through a shared interface. |
| Tool | A capability exposed to the planner, such as virtual file reads or subagent calls. |
| Harness | The outer system that owns setup, mutation, validation, artifacts, and claims. |
| Evaluator | The code that turns saved run artifacts into reports and benchmark rows. |
| Guardrail | A check near a risky boundary, such as patch application or shell execution. |

DeepAgents is a planner harness. It gives the model a richer working environment than a single prompt: todos, virtual files, memory, skills, subagents, permissions, and structured output. PatchSmith is a repair harness. It gives the planner a task, controls what source it can see, applies the resulting patch safely, runs validation, and records what happened.

That split is the main design lesson. Agent frameworks are good at helping a model work. Product harnesses still have to decide what the model is allowed to do.

## the propose, apply, validate pattern

The simplest way to understand PatchSmith is as three separate verbs:

```text
propose -> apply -> validate
```

The agent proposes. PatchSmith applies. The sandbox validates.

I like this pattern because it avoids a common trap in agent systems: giving the model one large, vague tool called "fix the repository." That tool might read files, edit code, run tests, install dependencies, retry, and declare success. It can feel impressive in a demo. It is also hard to audit.

PatchSmith keeps the verbs separate:

```text
propose:
  DeepAgents reads bounded context and returns a PatchPlan.

apply:
  PatchSmith checks the path and exact old span, then writes one replacement.

validate:
  PatchSmith runs the configured command and records the result.
```

Each verb has a different failure mode. A proposal can be wrong. An apply step can reject the patch because the old span is not exact. A validation command can fail. Those are not the same failure, and a repair benchmark should not flatten them into one bucket.

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

The educational value here is less about Python dataclasses and more about interface discipline. In agent systems, a contract is a way to stop the model from smuggling ambiguity across boundaries.

For example, this is a weak repair output:

```text
I fixed the failing path handling bug in pathlib.
```

It sounds useful, but the harness cannot apply it. It also cannot tell whether the model changed source, tests, docs, or nothing at all.

This is better:

```text
path: src/_pytest/pathlib.py
old: <exact source span copied from that file>
new: <replacement source span>
summary: Use the moved file's original filename when importing by path.
failure_mechanism: import metadata was derived from the temporary path
target_rationale: this branch builds the module spec used by the failing import
```

The second shape does more than add structure. It lets the harness check the path, apply the diff, inspect the localization claim, and store a machine-readable explanation next to the patch. That is the difference between a model answer and a repair artifact.

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

Here is a more concrete version of the lifecycle:

```text
1. create run directory
2. clone or copy repository into repo/
3. index files and language hints
4. select context through a ContextBroker
5. build an AgentTask
6. call the selected runtime
7. emit runtime trace events
8. apply the bounded patch if one exists
9. run the validation command
10. analyze the repair outcome
11. schedule retry if allowed and useful
12. write final.diff, report.md, traces.jsonl, logs, and context artifacts
```

That is intentionally linear. I want the first version of a repair harness to be easy to reason about before making it distributed or asynchronous. A queue, API server, dashboard, or database can come later. The lifecycle should be correct without them.

There is one interesting wrinkle: feedback retries. On a retry, PatchSmith can refresh context using the failed validation output, merge that refreshed context with the original reviewed hints, and then rebuild the `AgentTask`. The retry is a second run through the context and planning boundary, with the failed patch reverted. It is not a blind re-prompt with error text pasted at the end.

That shape came from painful experience. If you let a retry edit on top of a failed patch, you can no longer tell whether the second attempt repaired the original bug or merely patched over the first attempt's mistake.

## context selection

Context is a separate subsystem because repair failures often begin before the model writes any code. If the agent never sees the controlling file or the test that reproduces the bug, the rest of the run is mostly theater.

PatchSmith has a native selector with keyword, hybrid, and graph-backed modes. It also has a ctxhelm adapter. The adapter shape matters: ctxhelm stays read-only and returns context evidence; PatchSmith still owns patching and validation.

Reviewed context paths can also be promoted into the selected context. I added that because public issue work often has a small amount of human-reviewed reproduction evidence. If a repro points at a specific function, the harness should not force the model to rediscover that from scratch.

The context layer writes its own artifacts and trace events. When a repair fails, I can inspect whether the right source was even available to the planner.

This is one place where repair agents differ from generic chat agents. Code tasks often have hard anchors:

- an exact failing assertion
- a stack frame
- a test filename
- a symbol name
- an import path
- a changed file in the current diff
- a reproduction fixture

Embeddings can be useful, but exact anchors still matter a lot. If the issue mentions `co_filename`, the system should not bury that under semantically similar prose. If a reviewed hint points at `src/_pytest/pathlib.py#import_path`, the planner should see that hint before exploring unrelated files.

PatchSmith's `ContextBundle` keeps those signals visible. It records targets, related tests, diagnostics, warnings, validation commands, and whether fallback was used. The planner receives source excerpts, but the harness also stores the context selection so a failed run can be debugged later.

The practical lesson: retrieval is part of the experiment, not a prompt-building detail. If context is wrong, the model may still produce a polished patch. That does not make the run good. It means the harness needs enough evidence to say, "The planner never saw the file that controlled the failure."

### context budgets

I have become fairly skeptical of "just give the model more code" as a default answer. More context can help, but it also makes failure analysis harder. If an agent saw fifty files and patched one of them, was that because the right evidence was present, or because the model guessed?

PatchSmith treats context as a budgeted artifact. A small task should get a small pack. A retry can widen context a little because the failed test is new information. Reviewed source hints stay near the top because they are not ordinary retrieval guesses.

This is also why ctxhelm fits naturally. ctxhelm can provide read-only context routing. PatchSmith can then ask whether that routing changed the repair outcome. The two systems stay separate enough to measure.

## runtime boundary

The runtime boundary is intentionally narrow. A runtime takes an `AgentTask` and returns an `AgentResult`.

That result can come from a heuristic planner, a fake model used for deterministic tests, an OpenAI-backed planner, or DeepAgents. The rest of the workflow does not care. It still applies the patch through the same gate and runs the same sandbox validation.

This is the part I care about most for benchmark work. If each runtime gets special privileges, the comparison becomes meaningless. PatchSmith tries to make the runtime swappable without hiding the differences in traces.

The runtime boundary is also where a lot of agent projects quietly lose rigor. One runtime gets shell access. Another runtime gets source hints in the prompt. Another runtime gets a retry. Another runtime gets a different validation command. At that point the benchmark is comparing harness privileges, not agent behavior.

PatchSmith is not perfect here, but the goal is clear: keep runtime-specific behavior inside the runtime adapter, and keep shared repair semantics outside it.

Shared semantics include:

- where the workspace lives
- how context is selected
- how the final patch is applied
- how validation is run
- how retries are budgeted
- how traces and reports are written

Runtime-specific behavior includes:

- how a planner reasons
- whether it uses todos
- whether it calls subagents
- how it formats intermediate thoughts
- how model metadata is collected

That separation lets a fake-model planner, a heuristic planner, and a DeepAgents planner all run through the same outer loop. It also makes failures easier to compare. If DeepAgents fails because its structured output was malformed, that is a planner/runtime issue. If every runtime fails because Docker cannot install dependencies, that is a task setup issue.

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

### how PatchSmith configures DeepAgents

The DeepAgents configuration in PatchSmith is small but opinionated. Conceptually it looks like this:

```python
create_deep_agent(
    model=chat_model,
    tools=[],
    system_prompt=deepagents_system_prompt(),
    subagents=[
        failure_localizer,
        patch_reviewer,
    ],
    skills=["/.patchsmith/skills/"],
    memory=["/.patchsmith/AGENTS.md"],
    backend=StateBackend(),
    permissions=read_only_permissions(selected_files),
    response_format=PatchPlan,
)
```

The empty tool list is deliberate. DeepAgents still has its own harness capabilities, such as planning, virtual files, skills, memory, and subagents. But PatchSmith does not hand it arbitrary project tools. The agent reads bounded files and returns a structured answer.

The virtual filesystem contains several kinds of files:

```text
/.patchsmith/AGENTS.md
/.patchsmith/skills/patchsmith-repair/SKILL.md
/.patchsmith/source-hints.md
/.patchsmith/retry-feedback.md
/repo/<selected source files>
```

`AGENTS.md` is durable repair guidance. The skill file is the task-specific repair workflow. Source hints come from reviewed reproduction evidence. Retry feedback appears only after a failed attempt. The selected source files are the actual files the planner can inspect.

This layout borrows the good parts of agent workspaces without giving up the harness boundary. The agent gets a place to read and plan. It does not get a place to freely mutate the host repository.

### why the patch plan includes localization

Early bounded patch plans only needed `path`, `old`, `new`, and `summary`. That was enough to apply a diff, but not enough to understand why the agent chose that diff.

For repair work, I want the planner to name the runtime mechanism it believes is failing. A patch can be syntactically valid and still target the wrong layer. For example, a file-path bug might be fixed at a path normalization call, a cache lookup, a module-spec construction branch, or a test fixture. Only one of those may actually control the observed behavior.

So the DeepAgents prompt asks for two extra fields:

```text
failure_mechanism: what runtime behavior caused the failure
target_rationale: why this file and span control that behavior
```

Those fields are not a formal proof. They are a localization claim. That claim is useful when reviewing failures. If the patch fails and the rationale names a downstream symptom, the next iteration should move earlier in the call path. If the rationale names the right mechanism but the old span is wrong, the failure is probably patch formatting rather than diagnosis.

This is one of the small lessons from building repair agents: ask the model for the thing you will need during debugging, not only the thing you need for happy-path execution.

### why subagents are narrow

DeepAgents can spawn general or specialized subagents. That is powerful, but broad subagents can become a second uncontrolled planner. PatchSmith uses two narrow subagents because each has a bounded job.

The `failure-localizer` answers a question like:

```text
Which file/function controls the reproduced behavior?
```

The `patch-reviewer` answers a different question:

```text
Is this bounded replacement minimal, in scope, and likely to satisfy the test?
```

Neither subagent needs to own the full repair. They help the main planner avoid two common mistakes: patching the wrong layer and returning a broad rewrite.

That is the educational pattern I would reuse elsewhere. Do not create subagents because "multi-agent" sounds better. Create them when a subtask has a different context window, a different failure mode, or a different review lens.

## notes on building agents

Most agent advice sounds obvious until you build one and watch it fail in boring ways. PatchSmith follows a few rules that came from reading the DeepAgents and OpenAI agent docs, then stress-testing those ideas against repair tasks.

Start with one capable agent, then split only when the split buys something. OpenAI's agent guide makes this point directly: a single agent with clear tools is easier to evaluate and maintain, while multi-agent systems add coordination cost. PatchSmith uses one main DeepAgents planner and two narrow subagents. The subagents exist because they reduce context noise: one looks for the controlling failure path, the other reviews a proposed patch.

Treat tools as contracts, not conveniences. A tool should have a narrow job, clear input, and a reviewable output. PatchSmith's most important "tool" is not a glamorous LLM call; it is the old/new replacement gate. The model can be clever inside the plan, but the mutation surface stays plain.

Keep untrusted text away from irreversible actions. Issue bodies, stack traces, docs, and test output can all contain instructions that should not control the harness. PatchSmith turns those inputs into structured fields, selected context, source-hint files, and retry-feedback files. The planner can read them, but it still cannot write arbitrary files or choose its own success condition.

Use subagents for context quarantine, not decoration. The LangChain subagent docs emphasize that subagents help keep the main agent's context clean. That is exactly the repair use case. A failure-localizer can inspect noisy evidence and return a concise judgment. The main planner does not need every intermediate read.

Make traces a first-class output. OpenAI's Agents SDK tracing docs frame traces as records of model generations, tool calls, handoffs, guardrails, and custom events. PatchSmith keeps its own local version of that idea in `traces.jsonl`. I want the same debugging affordance without depending on a hosted dashboard.

Add guardrails where the state changes, not only where the text is generated. Output schemas are useful, but they are not enough. PatchSmith validates the proposed path and exact old span at patch time. It also keeps sandbox validation outside the planner. The guardrail is close to the thing it protects.

### a small checklist for repair agents

If I were building a new repair agent from scratch, I would start with this checklist:

1. Can I reproduce or at least run a focused validation command before claiming repair?
2. Can I point to the exact repository snapshot used for the run?
3. Can I list the files the model was allowed to inspect?
4. Can I separate a retrieval failure from a planning failure?
5. Can I reject a patch that touches the wrong path?
6. Can I reject a patch whose old span does not exist?
7. Can I keep shell execution outside the model's direct control?
8. Can I retry from a clean workspace?
9. Can I inspect the previous failed diff and sandbox output?
10. Can I explain whether "validated" means focused test, full suite, or upstream acceptance?

Most of these questions are boring. That is the point. The boring parts are where agent demos usually get slippery.

### single-agent first, multi-agent later

OpenAI's practical agent guidance recommends starting with one capable agent and adding complexity only when needed. PatchSmith follows that pretty closely.

The first useful version is one planner:

```text
issue + selected files -> PatchPlan
```

Only after that works does it make sense to add subagents:

```text
main planner
  -> failure-localizer for diagnosis
  -> patch-reviewer for scope and safety
  -> PatchPlan back to PatchSmith
```

The reason is evaluation. A single planner has fewer moving parts. If it fails, the cause is easier to inspect. Once the base path is stable, subagents can be added where the trace shows repeated confusion.

This is why PatchSmith does not have a committee of agents. It has one main planner and two specific helpers.

### tools should be typed and boring

Good agent tools are more than functions the model can call. They are contracts.

A weak tool says:

```text
fix_bug(repo, issue)
```

A better tool says:

```text
read_file(path) -> file contents
propose_patch(context) -> PatchPlan
apply_text_replacement(path, old, new) -> diff or safety error
run_validation(command) -> CommandResult
```

PatchSmith does not expose those exact tools to the model, but the harness follows that shape internally. Each operation has a typed input, a typed output, and a clear owner.

The model can be probabilistic. The boundary should not be.

## challenges we faced

The hardest challenge was not getting an agent to produce code. That part happens quickly. The hard part was deciding when the patch should count.

Public issue repair makes this uncomfortable. A focused reproduction test can pass while the patch is still not something I would send upstream. Setup can be fragile. Dependency installation can fail for reasons unrelated to the repair. Docker networking can matter. A task can be useful for calibration and still be too narrow for a broad claim. PatchSmith had to make those caveats visible instead of flattening everything into "passed" or "failed."

The second challenge was keeping DeepAgents powerful without letting it own the whole run. DeepAgents naturally wants tools, files, memory, subagents, and sometimes shell access. That is exactly why it is useful. It is also why the boundary matters. PatchSmith gives it read-only context and a structured repair contract, then keeps patch application and validation outside the agent. That took some iteration because the most obvious integration path is also the least auditable one: give the agent tools and let it work.

The third challenge was retry design. A retry should learn from the failed attempt, but it should not inherit a half-broken workspace. The current loop writes a feedback brief, records the failed diff and sandbox signal, restores the checkout, and then asks the planner to try again. That sounds straightforward now. It was easy to get subtly wrong.

The fourth challenge was context. Sometimes the issue text points directly at the right file. Sometimes it points at a symptom. Sometimes a validation fixture is the best clue. This is where ctxhelm and the native context selector both matter: the repair planner should start with the files most likely to explain the failure, but the harness still has to record what it showed the planner in case the run fails.

The last challenge was presentation. Early versions of the project page looked too much like a scoreboard. That was accurate in one sense, but it pulled attention away from the system design. PatchSmith is more interesting as an architecture for controlled repair experiments than as a row of numbers.

There were also smaller implementation lessons.

One lesson was that exact old spans are fragile. Models sometimes reconstruct code from memory and drop a receiver like `self.`, change an argument name, or normalize whitespace. The patch may be logically close, but PatchSmith should still reject it if the old span is not exact. Otherwise the harness starts guessing what the model meant.

Another lesson was that retry prompts can accidentally encourage repeated mistakes. If the retry only says "tests failed," the model may return the same patch with slightly different wording. PatchSmith now writes a retry brief with the failed diff hash, sandbox signal, patch diagnostics, and an instruction not to repeat the same failed diff unchanged.

A third lesson was that context refresh matters after failure. The first attempt has the issue text. The second attempt has more information: the failed patch, the test output, and the place where the original context may have been too narrow. PatchSmith can widen context slightly on retry while preserving reviewed source hints.

The most annoying lesson was dependency setup. Public issues are messy. Sometimes the issue is good but the dependency environment is brittle. Sometimes the focused validation command is honest but still depends on Docker networking or package manager behavior. Those are not model failures. PatchSmith needs to classify them separately or the benchmark becomes unfair.

## bounded patching

PatchSmith applies patches with one operation: replace this exact old text in this exact repo-relative file with this new text.

That sounds crude. It is also easy to audit. For early repair experiments, I prefer a patch gate that rejects too much over one that accepts clever, hard-to-review edits. A rejected patch is a clean failure. A broad silent rewrite is much harder to reason about.

The gate checks that the path stays inside the repository, the target exists, the target is a file, and the old span appears in the file. Then it writes the replacement and records a unified diff.

This is where PatchSmith draws the line between "the model suggested a patch" and "the workspace changed."

There is a tradeoff here. A single text replacement is not expressive enough for every repair. Some bugs need new files. Some need coordinated edits. Some need generated snapshots. Some need a larger refactor.

But for early benchmarks, a narrow patch surface has three advantages.

First, it makes the safety gate simple. The harness can tell whether the old span exists and whether the path is safe.

Second, it makes review easier. A human can read the exact replacement and ask whether it matches the failure.

Third, it makes failure clearer. If the old span is missing, the patch failed to apply. If the test fails after the patch applies, the patch was not enough. Those are different outcomes.

I expect PatchSmith to support richer patch formats later. I do not want that until the narrow path is boringly reliable.

## sandbox validation

Validation is also owned by PatchSmith. The run request provides the command, and the sandbox runner executes it under the configured policy.

Local mode is useful for seeded tasks and fast development. Docker mode is useful when public issue tasks need more isolation or reproducible setup. Either way, the result is captured as data, not prose.

The sandbox does not make a grand judgment about software quality. It answers a narrower question: did the configured validation command pass for this patched workspace?

That distinction matters. A focused test can prove that one reproduced behavior now passes. It does not prove that the patch is upstream-ready.

This is also where command policy matters. A validation command is code execution. It may install packages, import local modules, write caches, or open sockets. Public issue tasks are not trusted just because they come from public repositories.

PatchSmith's sandbox layer is not a full security product, but it keeps the concern in the right place. The model does not choose arbitrary commands. The task provides a command. The sandbox runner executes it under a configured mode and records the result.

For local research, that distinction is enough to avoid the worst design mistake: letting the model decide how to prove itself right.

## feedback retries

Retries are easy to get wrong. If a model fails, it is tempting to paste the test output back into a new prompt and hope for the best. PatchSmith makes that path explicit.

When a retry is allowed, the workflow writes a feedback brief. The brief includes the failed status, the sandbox signal, patch diagnostics, and the failed diff. Then PatchSmith restores the workspace before the next attempt.

The retry agent sees the failure, but it starts from a clean checkout. That keeps the second attempt from building on top of a broken first patch.

The retry loop behaves like a small state machine:

```text
attempt starts
  -> planner returns patch or no patch
  -> patch is applied or rejected
  -> validation runs or is skipped
  -> outcome is analyzed
  -> retry allowed?
       yes:
         write feedback brief
         restore workspace
         refresh context
         start next attempt
       no:
         write final artifacts
```

That state machine is where a lot of practical agent quality comes from. A model can improve on retry only if the system gives it useful failure information and a clean environment. If either part is missing, retries become expensive noise.

The feedback brief is intentionally compact. It does not paste the whole run history back into the prompt. It includes the facts the planner needs: previous status, failed diff hash, sandbox output summary, patch diagnostics, and the current diff. Long context is not automatically better. A concise failure brief often beats a giant transcript.

## artifacts and observability

PatchSmith writes a trace event for each meaningful step: ingest, index, retrieval, context broker, runtime, patch application, sandbox, analysis, retry, restore, and report writing.

The Markdown report is for humans. The JSONL trace is for debugging and later analysis. The diff is for code review. The logs are for validation. The context directory shows what the planner received.

This is the part that makes the project feel less like a demo and more like a measurement tool. When a run fails, I do not have to reconstruct the story from a chat transcript.

A trace event is small. It has a node name, event type, status, summaries, timing, payload, and optional error. A simplified event might look like this:

```json
{
  "node_name": "test",
  "event_type": "sandbox_command",
  "status": "failed",
  "input_summary": "python3 -m pytest tests/test_issue.py",
  "output_summary": "exit_code=1",
  "payload": {
    "attempt": 1,
    "sandbox_mode": "docker",
    "exit_code": 1
  }
}
```

That is not enough to debug everything, but it is enough to navigate the run. The full stdout and stderr live in log files. The final diff lives in `final.diff`. The report ties the pieces together for a human reader.

This mirrors a broader lesson from the OpenAI tracing docs and similar agent tooling: traces should preserve the shape of the run. You should be able to see where the agent reasoned, where it called tools, where policy intervened, where validation failed, and where the final output came from.

PatchSmith keeps that local and file-based for now. A hosted tracing UI would be nicer, but the basic evidence should not depend on one.

## evaluation lanes

PatchSmith has two kinds of tasks.

Seeded tasks are controlled bugs. They are good for development because the expected failure shape is known and the setup is cheap.

Public issue tasks are closer to real maintenance work. They need more care: repository snapshots, setup policy, reproduction evidence, focused validation, and caveats about what the focused command proves.

The benchmark direction is simple: keep tasks small enough to audit, but varied enough to expose different failure modes. I would rather have a small suite with clean artifacts than a large scoreboard nobody can reproduce.

### what a good repair benchmark should record

A repair benchmark row needs more than a "solved" label. It should record the path from task to claim.

At minimum, I want:

| Field | Why it matters |
| --- | --- |
| Repository snapshot | Without a commit or local snapshot, the run cannot be reproduced. |
| Issue source | The task needs provenance, even if the benchmark uses a curated copy. |
| Reproduction evidence | The benchmark should know what behavior was supposed to fail. |
| Context provider | Retrieval quality is part of the experiment. |
| Runtime and planner | The outer adapter and model-backed planner should be separated. |
| Patch status | No patch, rejected patch, applied patch, or validated patch are different outcomes. |
| Validation command | The claim is only as strong as the command. |
| Retry count | Retries can be useful, but they spend budget and change the run. |
| Failure category | Setup failure, retrieval miss, no patch, patch rejection, and test failure are different. |
| Cost metadata | Live-model repair needs token and cost visibility. |
| Claim boundary | Focused validation, full-suite validation, and upstream acceptance are not the same. |

This makes the benchmark less flashy, but more honest. It also makes ablations possible. You can ask whether ctxhelm improved context, whether DeepAgents improved planning, whether retries helped, or whether most failures were actually environment setup.

### anti-patterns

The repair-agent benchmark anti-patterns are easy to fall into:

- counting a patch as solved without saving the diff
- hiding setup failures because they make the score look worse
- mixing offline fake-model runs with live-provider runs
- changing validation commands between runtimes
- allowing one runtime to use extra source hints
- reporting a focused test pass as if it were full upstream acceptance
- publishing aggregate scores without task-level artifacts

PatchSmith is a response to those anti-patterns. It does not make them impossible, but it makes them harder to hide.

## readiness checks

The platform also checks itself. A repair harness that cannot build, test, package, or regenerate its own reports is not a harness I want to trust.

The readiness layer runs ordinary engineering checks: Python compile checks, pytest, source distribution and wheel builds, Docker smoke, release hygiene, environment readiness, and artifact indexing.

Those checks are not exciting. They are there to keep the experiment machinery honest.

There is a meta point here. If you are building an evaluation harness, the harness itself is part of the experiment. Broken packaging, stale reports, dirty generated artifacts, or missing Docker smoke checks can invalidate the story around the agent.

That is why PatchSmith has portfolio/readiness commands at all. They are not separate from the research. They are the maintenance layer for the research.

## tradeoffs

The bounded patch format is restrictive. It will struggle with large edits, file creation, generated code, and coordinated changes across many files. I am okay with that for now. The current goal is repair measurement, not maximum patch expressiveness.

The local artifact model is plain. There is no database query UI. That makes exploration less slick, but it keeps the evidence portable. A run is a folder you can inspect, copy, diff, or archive.

Focused validation is useful but narrow. It is the right first gate for public issue calibration, but it should not be confused with full upstream acceptance. PatchSmith keeps that boundary visible because repair benchmarks get misleading fast when they collapse every kind of validation into "solved."

There are other tradeoffs I have not solved yet.

The first is patch expressiveness. One bounded replacement is easy to audit but too limited for many real changes. A future version probably needs a small patch language: file edits, file creation, maybe delete operations, all still bounded and reviewable.

The second is environment realism. Docker helps, but a public issue's real environment can include native dependencies, databases, network services, old package versions, or flaky upstream tests. A benchmark has to decide how much of that world to reproduce. More realism costs more time.

The third is model variance. Live model runs can change with provider updates, prompt changes, pricing changes, and reasoning settings. PatchSmith records model metadata, but reproducibility is still weaker than deterministic local tests.

The fourth is human curation. Public issue tasks need reviewed reproduction commands and source hints. That curation makes the benchmark better, but it also introduces judgment. The right answer is to keep the curation visible, not pretend it is absent.

The fifth is scale. A local artifact folder works well for a small suite. Larger runs need indexing, dashboards, and maybe a database. I still want the file artifacts to remain canonical. A dashboard should be a view over evidence, not the only place evidence exists.

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
