---
layout: showcase
title: "1BRC C#: full-size performance work on Apple Silicon"
subtitle: "A project log for building, profiling, rejecting candidates, and shipping a fast .NET 10 solver"
category: projects
group: Research
show: true
width: 8
date: 2026-06-18 00:00:00 +0600
excerpt: "A C#/.NET 10 systems-performance project for the One Billion Row Challenge. The work starts with a byte parser and native hash table, then follows the evidence to a macOS pread pipeline after full-size runs exposed mmap page-fault cost."
featured: true
project_type: Performance research project
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

# 1BRC C#: full-size performance work on Apple Silicon

This is the project page for my C# implementation of the One Billion Row Challenge. The long build log is published as a project blog:

- [Building a fast 1BRC solver in C# on Apple Silicon](/blog/2026/06/18/building-fast-1brc-csharp-apple-silicon/)
- [Source code on GitHub](https://github.com/thromel/1brc-csharp)

The short version: I built a standalone .NET 10 solver, validated it against the official fixture suite, pushed it through many candidate optimizations, and ended up with a size-aware input strategy. On my 10-core Apple Silicon machine, bounded 100M-row runs still favor the memory-mapped parser, but the full 1B file exposed a different bottleneck. The macOS `pread` pipeline cut warm full-size runs from roughly 16 seconds to roughly 4 seconds by avoiding the mmap fault profile that dominated the large input.

## Why this belongs in Projects

The final code is only part of the work. The reasoning trail matters too:

- start with correctness before speed
- replace line/string processing with byte parsing
- use integer tenths instead of floating point in the hot path
- keep station names as byte slices until final output
- aggregate through per-worker native-memory tables
- split ranges only on line boundaries
- reject attractive ideas when paired timings do not support them
- change the input strategy after full-size evidence showed the real bottleneck

The result is a small systems project with a research notebook attached. The blog teaches the system from the ground up; the repository keeps the implementation, validation scripts, architecture notes, and experiment history.

## System shape

The production solver is organized around a few boundaries:

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

The parser reads rows as bytes:

```text
station-name;temperature\n
```

Temperature values become integer tenths:

```text
12.3  ->  123
-5.0  ->  -50
```

Station names are not decoded during parsing. A table entry keeps a pointer, length, first word, last word, hash, and aggregate state. Only the final formatter decodes station names for sorting and output.

## Main design decisions

The first working architecture used a memory-mapped file. It split the mapped bytes into line-aligned ranges, gave each worker its own table, and merged those tables after parsing. That design avoided locks in the hot loop and avoided one string allocation per row.

The table is fixed-size because the challenge caps unique stations at 10,000. The production table uses 32,768 buckets, enough room to keep probing cheap without resize logic.

The full-size `pread` path exists because the full input behaved differently from the 100M input. In the `pread` path, each worker reads its range through a reusable 16 MiB native buffer. Since those buffers are overwritten, the table copies station names only when a station is first inserted. That copy is per unique station per worker, not per row.

## What lost

Several candidates passed correctness and still lost:

- SIMD temperature parsing lost because temperature bytes sit behind variable-length station names.
- 64-byte SIMD row framing lost because mask extraction and row bookkeeping cost more than the scalar delimiter scan saved.
- station front caches lost because the native table already averaged close to one probe on canonical data.
- known-station direct aggregation lost because exact matching and separate aggregate handling added more work than the normal table path.
- control-byte metadata helped too little on high-cardinality data and hurt canonical data.
- dynamic microshards reduced some CPU counters but did not robustly improve full-size wall time.

That rejection trail is part of the project. It is easy to write fast-looking code. It is harder to show that the code should survive.

## Repro and porting notes

The repository includes:

- `README.md` for running and validating the solver
- `ARCHITECTURE.md` for component boundaries and porting notes
- `RESEARCH_NOTES.md` for experiment history
- `BRC_THREADS`, `BRC_IO=mmap`, and `BRC_IO=pread` controls for local calibration

The current defaults are tuned for my Apple Silicon machine. A different CPU or OS should be treated as a fresh experiment. The right path is to run the official fixtures, compare output parity on generated data, sweep worker counts, then profile the full-size file before changing parser or table code.

The project blog walks through the build in detail: [read the full write-up](/blog/2026/06/18/building-fast-1brc-csharp-apple-silicon/).
