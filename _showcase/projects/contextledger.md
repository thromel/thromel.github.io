---
layout: showcase
title: "ContextLedger: context accounting for coding agents"
subtitle: "A research notebook on OpenCode compaction, provenance, and live GPT-5.5 experiments"
category: projects
group: Projects
show: true
width: 8
date: 2026-06-15 00:00:00 +0600
excerpt: A research-blog style write-up on ContextLedger, my current experiment in making coding-agent context management measurable instead of trusting long-session summaries by vibes.
featured: true
showcase_style: agent-tooling
project_type: Research notebook
card_image: /assets/images/projects/contextledger-pipeline.svg
technologies:
  - TypeScript
  - OpenCode
  - OpenAI
  - GPT-5.5
  - Coding Agents
  - Context Management
  - Compaction
  - Benchmarking
  - Token Accounting
  - Evaluation
---

# ContextLedger: context accounting for coding agents

ContextLedger started from a small frustration that kept getting bigger.

Long coding-agent sessions do not usually fail because the model cannot write a `for` loop. They fail because the session gets heavy, the context gets compacted, and some boring fact disappears: a path, a failing test, a user constraint, a branch name, a decision we already made. After that, the agent still sounds coherent. It may even keep working. But it is now working from a damaged memory of the task.

I wanted to stop treating that as a vague "agent forgot" problem. The question behind ContextLedger is more concrete:

> Can a coding-agent harness account for context the way a database accounts for state?

Not every old message deserves to survive. But the facts that do survive should carry provenance, cost, recoverability, dependencies, and a reason for being there.

<section class="ctxhelm-proof-board contextledger-proof-board" aria-label="ContextLedger current proof summary">
  <div class="ctxhelm-proof-board__header">
    <p class="ctxhelm-proof-board__eyebrow">Current proof surface</p>
    <p>What is implemented, what the first live smoke showed, and what I am not claiming yet.</p>
  </div>
  <div class="ctxhelm-proof-grid">
    <article>
      <span>Harness</span>
      <strong>OpenCode</strong>
      <p>Working fork with ContextLedger wired into compaction and benchmark paths.</p>
    </article>
    <article>
      <span>Context unit</span>
      <strong>Typed events</strong>
      <p>Session facts carry source, token cost, file hints, recoverability, and dependency metadata.</p>
    </article>
    <article>
      <span>Runtime modes</span>
      <strong>2</strong>
      <p><code>augment</code> keeps the original compaction body; <code>replace</code> sends the ledger packet instead.</p>
    </article>
    <article>
      <span>Best live smoke</span>
      <strong>852</strong>
      <p>Compaction input tokens for <code>precision-frontier</code> replace mode on a noisy GPT-5.5 fixture.</p>
    </article>
    <article>
      <span>Recall</span>
      <strong>1.0</strong>
      <p>The bounded noisy fixture kept all required facts while using less input than the baseline.</p>
    </article>
    <article>
      <span>Boundary</span>
      <strong>No solve-rate</strong>
      <p>This is compaction evidence, not proof that agents finish more real tasks yet.</p>
    </article>
  </div>
</section>

![ContextLedger pipeline](/assets/images/projects/contextledger-pipeline.svg)

## where this started

The first version was not an OpenCode patch. It was a research question.

I was comparing how Codex CLI, Claude Code, and OpenCode manage context in long coding sessions. All three systems have useful instincts, but the interesting gap was the same: context management is mostly hidden inside prompts, summaries, tool traces, and UI state. A user can tell that a session got compressed. They usually cannot tell which facts were protected, which facts were dropped, or why.

That pushed the idea away from "add more memory" and toward context accounting.

The early sketch had a few requirements:

1. Preserve exact facts, not just pleasant summaries.
2. Track where a fact came from.
3. Keep code-specific anchors visible: paths, tests, symbols, commands, branch names, configuration keys.
4. Separate "important to remember" from "expensive to resend."
5. Make recall and precision measurable.

OpenCode became the best place to test the idea because it is hackable enough to modify the compaction path directly. That mattered. I did not want a sidecar demo that only looked good in isolation. I wanted to put the idea where real long-session damage happens.

## the first implementation

The first ContextLedger prototype converted old session history into typed context events.

An event can represent a user constraint, tool output, file reference, decision, validation result, synthetic summary line, or other session fact. The useful part is the metadata around the text:

- provenance: where the fact came from
- token cost: how expensive it is to keep
- recoverability: whether the fact can be recovered from the repository later
- must-preserve state: whether dropping it would likely corrupt the task
- file hints and spans: paths, line ranges, symbols, tests, and commands
- dependencies: facts that only make sense together

Then the compaction step can render a small `<context-ledger>` packet before the normal summary prompt.

The first mode was `augment`: keep OpenCode's normal old-history compaction body, but add the ledger packet as a structured reminder. That was a safe first integration because it did not take anything away from the original context manager.

It also exposed the first uncomfortable result: adding structured context can help recall, but it can also make the compaction input larger. If the baseline already remembers the fact, a ledger can become expensive decoration.

That was useful. A context system that cannot admit cost is not a context system.

## what broke early

The first experiments were too easy. Synthetic facts survived because the fixture was clean and the facts were obvious.

Real session history is messier. Old summaries contain multiple facts on one line. Tool outputs contain paths mixed with prose. Some lines are instructions; others are progress updates; others are noise that sounds important because it has technical words in it.

One bug made that obvious: serialized multi-line context was being treated as one event. The selector could keep the blob, but it could not reason cleanly about the individual facts inside it. We fixed that by splitting serialized multi-line user, system, and synthetic context into per-line events before selection.

That sounds small. It changed the experiment. Once each fact became selectable, we could ask sharper questions:

- Did we keep the exact file path?
- Did we keep the validation command?
- Did we keep the user's constraint?
- Did we drop the noisy paragraph that only looked relevant?

That is the kind of question a compaction system should answer.

## comparing against original OpenCode

The original OpenCode context manager is a strong baseline for a practical reason: it summarizes old history directly. It often keeps enough information to continue a task, especially when the important facts are recent or repeated.

ContextLedger is trying to win on a different axis.

The original path asks the model to summarize old context. ContextLedger first turns old context into typed, scored events, then asks which facts deserve to reach compaction. That gives us a place to attach policy, provenance, and evaluation.

The first comparison was not flattering enough to publish as a win:

- Baseline OpenCode compaction could already recover all required facts on the simple fixture.
- ContextLedger in `augment` mode also recovered them, but used more input.
- ContextLedger in early `replace` mode was cleaner than augment, but still not obviously better.

That forced the policy work.

## replace mode

`augment` was useful for integration. It was not the final shape I wanted.

If the ledger is doing real work, it should sometimes replace the raw old-history body instead of riding along beside it. So we added `mode: "augment" | "replace"`.

In `replace` mode, compaction receives the ledger packet instead of the selected old-history text. The goal is simple: keep the facts that matter, but stop paying for the entire messy body when it is mostly distractors.

This also made the comparison fairer. A context layer should not get credit for recall if it silently sends more context than the baseline.

## precision-frontier

The next policy was `precision-frontier`.

The name is a little grand for what it does, but the behavior is practical. It keeps exact anchors near the front and pushes low-value distractors down:

- file paths, tests, commands, branch names, symbols, IDs, and config keys get protected
- user constraints and decisions get protected
- facts with useful dependencies stay close together
- noisy status lines, repeated filler, broad claims, and irrelevant technical chatter get demoted

This is where ContextLedger began to look like a research artifact instead of a prompt trick. The system had a policy we could test, not just a nicer summary format.

## the first live GPT-5.5 smoke

On June 14, 2026, we ran a bounded noisy-compaction smoke with `openai/gpt-5.5` as the OpenCode compaction model.

The fixture was intentionally narrow. It was not a real software-repair benchmark. It tested whether the compaction step preserved exact facts under noise.

The scored rows were small enough to read directly:

- Original baseline: recall `1.0`, summary `309` tokens, compaction input `2199` tokens.
- ContextLedger augment with line splitting: recall `1.0`, summary `377` tokens, compaction input `5282` tokens.
- ContextLedger replace with line splitting: recall `1.0`, summary `437` tokens, compaction input `3472` tokens.
- ContextLedger precision-frontier replace: recall `1.0`, summary `291` tokens, compaction input `852` tokens.

The result I care about is not "ContextLedger beats OpenCode" in a broad sense. That would be too strong.

The honest result is narrower and more promising: on this noisy compaction fixture, `precision-frontier` replace mode kept full recall while cutting the compaction input far below the original baseline. It also produced the shortest summary of the tested variants.

That is the first result that feels like a real signal. Small, but real.

## the hard parts

The hardest part is not writing selectors.

The hardest part is avoiding fake confidence. Context systems are easy to make look good. Add a large summary, include more history, and recall improves. But if input cost doubles, precision drops, or the agent still fails the task later, the system did not really solve the problem.

So the current project has a few uncomfortable constraints:

- A benchmark-only win stays benchmark-only.
- A compaction win is not a solve-rate win.
- A live provider smoke proves routing and model behavior for that lane, not generality.
- A policy should be judged by recall, precision, cost, and downstream usefulness.
- Failed runs should remain visible because they are often the most useful runs.

There was also the practical blocker of live-provider access. An earlier OpenCode lane reached the provider but failed with `401 CreditsError: Insufficient balance`. That was useful in one way: it proved routing had reached OpenAI. It did not prove compaction quality. We waited until a real live completion existed before talking about GPT-5.5 evidence.

## what we have now

The current fork has the main pieces needed for a proper evaluation loop:

- ContextLedger config and schema support
- `augment` and `replace` compaction modes
- serialized multi-line fact splitting
- typed events with provenance, cost, recoverability, file hints, spans, and dependencies
- policy registration, including `precision-frontier`
- noisy compaction fixture generation
- OpenCode compaction tests for replacement behavior
- core tests for policy shape, config migration, line splitting, and noisy fixtures
- typecheck and focused test coverage across the touched OpenCode packages

I would still call this a research prototype. That is not a downgrade. It means the system has enough structure to ask better questions, and not enough evidence yet to pretend the questions are settled.

## goal right now

The current goal is to move from one promising live smoke to a real evaluation story.

The next experiments need to answer four questions:

1. Does `precision-frontier` keep its advantage across more noisy compaction scenarios?
2. Does lower compaction input translate into better downstream task behavior, or only cleaner summaries?
3. Where does original OpenCode compaction still win?
4. Can we define promotion gates strict enough that ContextLedger only changes runtime defaults when the evidence is wider than the fixture?

The best outcome is not a headline claim. The best outcome is a context manager with a measured boundary: when to use it, when not to use it, what it costs, and what it protects.

That is what I am trying to build now.
