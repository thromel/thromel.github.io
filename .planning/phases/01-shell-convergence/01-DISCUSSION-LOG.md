# Phase 1: Shell Convergence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 1-Shell Convergence
**Areas discussed:** Theme behavior, Legacy cleanup strategy, Phase-1 scope on page islands, Interaction baseline

---

## Theme behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Dark by default | Preserve current first-visit behavior and persist manual override | |
| System preference first | Follow system preference on first visit, then persist manual override | ✓ |
| Light by default | Force a light-first experience before manual override | |

**User's choice:** Agent-selected recommended default after user delegated the decision
**Notes:** Best fit for a polished shared shell. It resolves the current hard-coded dark default while keeping manual control.

---

## Legacy cleanup strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Hard-cut canonical shell | Remove or isolate conflicting shared-shell runtime paths now | ✓ |
| Temporary compatibility bridge | Keep both models alive while migrating over time | |
| Document-only quarantine | Leave legacy shell code untouched and rely on documentation | |

**User's choice:** Agent-selected recommended default after user delegated the decision
**Notes:** The phase goal is convergence. A compatibility bridge would prolong the split system and muddy Phase 1 planning.

---

## Phase-1 scope on page islands

| Option | Description | Selected |
|--------|-------------|----------|
| Shared shell only | Restrict work to layout/include/script/css entrypoints and ignore page-local leaks | |
| Shell plus blocking leaks | Fix shared shell first, then touch only page-local/include-local leaks that directly block convergence | ✓ |
| Normalize all page islands now | Pull broad page-specific cleanup into Phase 1 | |

**User's choice:** Agent-selected recommended default after user delegated the decision
**Notes:** This keeps Phase 1 strict enough to avoid scope creep, but not so narrow that obvious shell conflicts remain in place.

---

## Interaction baseline

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal reliable shell | Keep only the current core shell behaviors in the canonical baseline | ✓ |
| Preserve app-like shell motion | Carry gestures, route transitions, and motion-heavy ideas into the canonical baseline | |
| Leave motion scripts dormant only | Avoid decision now and just keep old interaction layers around | |

**User's choice:** Agent-selected recommended default after user delegated the decision
**Notes:** Phase 1 should prioritize clarity and reliability. Motion experiments can be reconsidered after shell convergence is done.

---

## the agent's Discretion

- Exact sequence of CSS, JS, and include cleanup work
- Whether dormant legacy shell files are deleted or simply isolated from active load paths
- Small compatibility adjustments needed for shell-adjacent utilities

## Deferred Ideas

- Re-evaluate advanced motion or app-like navigation after the shared shell is stable
- Broader page-level polish outside shell-blocking leaks belongs in later roadmap phases
