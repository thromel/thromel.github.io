---
title: "Choice as an Attack: Auditing Aligned Backdoor Attacks in LLM Agents"
description: In review at ACL ARR (October 2026). Abstract-level summary of
  SHIFT, a known-trigger audit for aligned backdoor attacks in LLM agents.
img: /assets/img/publication_preview/shift-audit.webp
img_alt: "Schematic diagram of SHIFT showing Clean and Triggered tasks passing through a black-box LLM Agent into Shift Detection and Attribution layers."
importance: 5
category: research
---

*Agent security · abstract-level summary · in review*

Submitted to ACL Rolling Review (ARR) October 2026 with Kawshik Kumar Paul and [Chowdhury Mohammad Rakin Haider](https://cse.buet.ac.bd/faculty/faculty_detail/rakinhaider), and currently **in review**. The manuscript is not yet public (a non-anonymous preprint is planned during review), so this record is limited to an abstract-level summary.

- **Status:** In review at ACL ARR (October 2026)
- **Authors:** Tanzim Hossain Romel, Kawshik Kumar Paul, Chowdhury Mohammad Rakin Haider
- **Public boundary:** Abstract-level summary · manuscript not public (preprint planned during review)
- **Keywords:** backdoor attacks · LLM agents · auditing · choice steering · aligned backdoors · tool routing · conditional logit · agent security
- **Last verified:** 2026-11-25

Backdoor attacks can trigger LLM agents to prefer one valid option over others, without noticeably failing the task. The Structured Hidden Influence Test (SHIFT) is a known-trigger audit of choice-steering that analyzes only the valid options, their features, and the final choices, while remaining agnostic to the model internals.

SHIFT combines a **Shift Detection Layer**—which identifies a shift in choice by comparing matched non-triggered and triggered tasks—with an **Attribution Layer** that checks whether the detected movement favors the attacker's target after accounting for ordinary option quality. Across simulations with known ground truth as well as shopping and tool-routing evaluations, the Shift Detection Layer detects trigger effects in 75–100% of tested trigger-trained shopping cases (0% on clean models) and 62.5–100% of tested trigger-trained tool-routing cases, while the Attribution Layer points toward the attacker's target when relevant option features are logged.

Related: [Publication record](/publications/romel2026shift/) · [ctxhelm case study](/projects/ctxhelm/)
