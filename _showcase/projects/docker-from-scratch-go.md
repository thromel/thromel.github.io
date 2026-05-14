---
layout: showcase
title: "Go Container Runtime: Docker from Scratch"
subtitle: "A freelance learning project for Linux containers, networking, and Go systems programming"
category: projects
group: Freelance Learning Capstones
project_type: "Freelance learning project"
show: true
width: 8
date: 2026-01-05 00:00:00 +0600
excerpt: "A freelance learning project where I am building a small Docker-like runtime in Go: process isolation, namespaces, filesystem setup, container networking, and command-line behavior."
featured: true
showcase_style: learning-capstone
technologies:
  - Go
  - Docker
  - Containers
  - Linux Namespaces
  - Linux Networking
  - Systems Programming
---

I am building a small Docker-like runtime in Go. I am not trying to recreate Docker as a product. I want to understand what happens under a simple command: process isolation, filesystems, namespaces, networking, lifecycle management, and the command-line shape around all of it.

This is the kind of project that makes systems work feel less abstract. It forces me to read how Linux behaves, draw the boundary around a process, and then check whether the boundary actually holds.

## Capstone scope

The first milestone is a Go command-line program that starts and manages an isolated process. That means dealing with parent and child processes, cleanup, arguments, and failure behavior.

The next milestone is Linux namespaces. A process needs its own view of parts of the system, and I want that isolation to be visible in the code instead of treated as magic.

A runtime also needs a filesystem view. This part is about preparing the execution environment and keeping the implementation small enough that I can inspect each step.

Networking is its own milestone. I want to understand how a container talks to the host and the outside world: virtual interfaces, network namespaces, port exposure, and the debugging steps when traffic does not move.

The runtime should also be a usable command-line tool. Clear subcommands, readable errors, and predictable cleanup matter here.

Later follow-ups can use the same Go base for service and workflow exercises: retries, scheduled work, workflow state, and small orchestration patterns. I am keeping those separate from the runtime itself.

## What I plan to ship

- A small Go command-line runtime that can run a Docker-like isolated process.
- Experiments for namespaces, filesystem setup, networking, and cleanup behavior.
- Debug notes for the failure cases: bad isolation, missing filesystem setup, broken networking, and cleanup mistakes.
- Follow-up service and workflow exercises that reuse the Go systems base.

## Why I care

Containers are everywhere in backend work, but most of the time I only see the polished interface. Building a small runtime gives me a better feel for what can break. It also matches the habits I need in open source work on RefactoringMiner, EF Core, GenHTTP, deepagents, and TypeScript-related code: read carefully, make a narrow change, and verify the behavior.
