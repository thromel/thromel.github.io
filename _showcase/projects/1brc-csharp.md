---
layout: showcase
title: "1BRC C# on Apple Silicon"
subtitle: "A .NET 10 NativeAOT performance case study: byte parsing, native aggregation, ARM64 tuning, and a size-aware macOS pread path"
category: projects
group: Performance Engineering
show: true
width: 8
date: 2026-06-18 00:00:00 +0600
excerpt: "A C#/.NET 10 systems-performance project for the One Billion Row Challenge. The promoted solver keeps smaller inputs on mmap, but switches full-size macOS runs to pread after paired 1B measurements showed the mmap fault path dominating wall time."
featured: true
project_type: Systems performance case study
card_image: /assets/images/projects/1brc-csharp-architecture.svg
technologies:
  - C#
  - .NET 10
  - NativeAOT
  - Apple Silicon
  - ARM64
  - macOS
  - mmap
  - pread
  - Unsafe Code
  - Benchmarking
---

# 1BRC C# on Apple Silicon

I built a standalone C# solver for the [One Billion Row Challenge](https://github.com/gunnarmorling/1brc), then treated every improvement as something that had to survive correctness checks and paired timings. The full 1B file changed the bottleneck.

For bounded 100M data, the memory-mapped parser stayed better. For the full 13 GiB canonical file on my 10-core Apple Silicon machine, warm `mmap` runs spent so much time in system work and page faults that a native macOS `pread` path won decisively. The current solver is size-aware instead of treating that result as a universal rule.

![1BRC C# solver architecture](/assets/images/projects/1brc-csharp-architecture.svg)

## at a glance

| Area | Decision |
| --- | --- |
| Challenge contract | Parse `station-name;temperature\n`, aggregate min/mean/max by station, sort station names, and match exact one-decimal output. |
| Runtime | `net10.0`, NativeAOT publish path, unsafe byte parsing, native-memory aggregation tables. |
| Primary machine | 10-core Apple Silicon on macOS. These defaults are local tuning, not portable constants. |
| Current input policy | Smaller files use `mmap`; macOS files at least 8 GiB use the native `pread` pipeline by default. |
| Public artifacts | [Source repository](https://github.com/thromel/1brc-csharp), [long engineering write-up](/blog/2026/06/18/building-fast-1brc-csharp-apple-silicon/), [research notes](https://github.com/thromel/1brc-csharp/blob/7c102a8ac93204edfc8fbd0075de3bbb0753c557/RESEARCH_NOTES.md#L202-L210). |

## measured result

The key result is local and bounded: on this macOS ARM64 machine, full-size `mmap` was dominated by VM/page-fault behavior, and the native `pread` path removed most of that cost. That does not mean `pread` is generally better than `mmap`.

| Benchmark lane | Result |
| --- | --- |
| Official fixtures | Passed all 12 fixtures in both `mmap` and forced `pread` modes. |
| Generated parity | Matched generated canonical 100M, high-cardinality 10M, and full 1B output. |
| Bounded 100M | `pread` stayed rejected for smaller files: median wall was `+0.033671s` versus `mmap`, with `+0.135181s` median system time. |
| First full 1B parity run | `mmap`/`pread` wall: `16.227s`/`4.297s`; user: `13.198s`/`8.937s`; sys: `26.026s`/`3.902s`; major faults: `777206`/`76`. |
| Five paired warm full 1B runs | Candidate-minus-baseline median deltas: `-11.785s` wall, `-5.373s` user, `-26.445s` sys, `-842044` major faults, with `5/5` wall-time wins. |
| Worker-count follow-up | The promoted full-size `pread` default moved from 13 workers to 8 workers after randomized pairs showed `4.08s` versus `4.18s` medians and `6/7` wins. |

The exact experiment trail is preserved in `RESEARCH_NOTES.md` in the source repo, not rewritten into a victory lap after the fact.

## system shape

The solver has two input strategies and one shared parsing/aggregation core.

```text
Program
  -> OneBrcSolver
       -> RuntimeOptions
       -> mmap path: RangePartitioner + WorkerScheduler
       -> pread path: PReadRangePartitioner + PReadWorkerScheduler + NativePRead
       -> MeasurementParser
       -> StationKey + StationTable + StationEntry
       -> ResultFormatter
```

The parser reads the file as bytes:

```text
station-name;temperature\n
```

Temperature values stay as integer tenths:

```text
12.3  ->  123
-5.0  ->  -50
```

Station names are not decoded while parsing. A table entry keeps a pointer, length, first word, last word, hash, and aggregate state. The formatter decodes station names only after aggregation, when it has to sort and print the final result.

## what I owned

This was not a package integration exercise. I wrote the solver boundary, runtime policy, parser, key representation, native station table, line-aligned partitioners, macOS `pread` wrapper, merge path, validation scripts, benchmark notes, and the rejection log.

The core engineering choices were:

- start with fixture parity before timing anything
- use byte parsing instead of line/string processing
- aggregate temperatures as integer tenths
- keep station identity as byte slices until final output
- use per-worker native tables to avoid locks in the hot loop
- split work only at newline boundaries
- promote a candidate only after paired measurements support it
- keep architecture-specific code behind explicit boundaries

## why the full-size path changed

The first good architecture used a memory-mapped file. It split mapped bytes into line-aligned ranges, gave each worker its own table, and merged those tables after parsing. That shape was strong on bounded data because station keys could point directly into the mapped file.

The full 1B file behaved differently. Warm runs showed high system time and hundreds of thousands of major faults. The useful rewrite was a macOS `pread` pipeline that streams each line-aligned worker range through reusable 16 MiB native chunks. Because those buffers are overwritten, the table copies station names only when a station is first inserted. That cost is per unique station per worker, not per row.

That is the ownership diagram:

```text
mmap
  file mapping owns bytes
  StationTable keys point into the mapping

pread
  reusable worker buffers own bytes only temporarily
  StationTable copies newly inserted station names into native arenas
```

## what lost

Several ideas looked plausible, passed correctness, and still did not earn promotion:

- SIMD temperature parsing lost because temperature bytes sit behind variable-length station names.
- 64-byte SIMD row framing lost because mask extraction and row bookkeeping cost more than the scalar delimiter scan saved.
- station front caches lost because the native table already averaged close to one probe on canonical data.
- known-station direct aggregation lost because exact matching and separate aggregate handling added work.
- control-byte metadata helped too little on high-cardinality data and hurt canonical data.
- dynamic microshards reduced some CPU counters but did not robustly improve full-size wall time.
- read-ahead advice and alternate read geometry were flat after the 8-worker `pread` promotion.

The rejection trail matters. It is easy to write fast-looking code. The hard part is deleting or reverting the ideas that the machine does not support.

## limits

This is a strong local result, not a general state-of-the-art claim across all 1BRC machines and languages. The fastest x64 submissions use AVX2, AVX-512, and platform-specific tricks that are not the same problem as macOS ARM64 C# NativeAOT.

The current default is tuned for my Apple Silicon machine. A different CPU, OS, storage stack, or .NET runtime should be treated as a fresh experiment. The repo keeps `BRC_THREADS`, `BRC_IO=mmap`, and `BRC_IO=pread` so another machine can rerun the same decision process instead of inheriting my heuristic blindly.

The next responsible optimization step is profiling the promoted full-size `pread` path with a permissions-enabled Time Profiler or hardware counters. After the second review pass, parser and table rewrites are lower priority until profiling points at them again.

## where to read next

The long build narrative teaches the system from the boring version up to the current solver: [Building a fast 1BRC solver in C# on Apple Silicon](/blog/2026/06/18/building-fast-1brc-csharp-apple-silicon/).

The implementation, validation commands, architecture notes, and experiment log are in [thromel/1brc-csharp](https://github.com/thromel/1brc-csharp).
