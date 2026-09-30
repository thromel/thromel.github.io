---
layout: page
title: "The Choice Can Be the Attack: Auditing Aligned Backdoors in LLM Agents"
description: Abstract-level summary of SHIFT, submitted to TACL 2026 on aligned backdoor attacks in LLM agents.
importance: 5
category: research
---

*Agent security · abstract-level summary*

Submitted to TACL 2026 with [Chowdhury Rakin Haider](https://cse.buet.ac.bd/faculty/faculty_detail/rakinhaider){:target="_blank" rel="noopener noreferrer"}. The manuscript is not public, so this record is deliberately limited to an abstract-level summary.

- **Status:** Submitted to TACL 2026
- **Public boundary:** Abstract-level summary · manuscript not public
- **Methods:** known-trigger audit · matched task pairs · choice-feature accounting
- **Last verified:** 2026-07-10

LLM agents can be backdoored without visibly failing the task. A trigger can make an agent prefer one valid option over another, such as a brand, vendor, or tool, while the final answer still looks acceptable. SHIFT, the Structured Hidden Influence Test, is a known-trigger audit for this kind of choice steering.

SHIFT reruns matched tasks with and without the trigger, records the valid options and their features, and checks whether the changed choice favors the attacker's target after accounting for ordinary option quality. The current draft positions SHIFT as a practical validation audit for structured choice settings where the auditor can observe the options but not the model internals.

Related: [ctxhelm case study]({{ '/projects/ctxhelm/' | relative_url }})
