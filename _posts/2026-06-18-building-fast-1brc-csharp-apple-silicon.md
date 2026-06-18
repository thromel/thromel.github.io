---
layout: post
title: "Building a fast 1BRC solver in C# on Apple Silicon"
date: 2026-06-18
categories: [performance-engineering, dotnet, systems]
tags: [csharp, dotnet, nativeaot, 1brc, performance, arm64, macos]
---

I spent a chunk of time building a C# implementation of the One Billion Row Challenge. The problem is simple enough to explain in one line: read a huge weather-measurement file and print min, mean, and max temperature per station.

The hard part is that the file has one billion rows.

That makes it a good performance exercise because the usual abstractions disappear quickly. You cannot allocate a string for every station name. You cannot parse every decimal through the standard library. You cannot casually build dictionaries and hope the garbage collector forgives you. The solution has to respect bytes, memory ownership, file I/O, CPU caches, and the operating system.

I wanted two things from this project:

1. a serious C# implementation that is correct on the original 1BRC fixtures
2. a research trail that explains why each optimization stayed or died

The final code lives here: [thromel/1brc-csharp](https://github.com/thromel/1brc-csharp).

## the problem shape

Every input row looks like this:

```text
Hamburg;12.0
Dhaka;32.4
Edmonton;-18.7
```

For each station, we need:

- minimum temperature
- average temperature, rounded to one decimal in the challenge's expected way
- maximum temperature

Then we sort station names and print the final map.

The constraints matter:

- station names are UTF-8 and can be 1 to 100 bytes
- there can be up to 10,000 unique stations
- temperatures have one decimal digit
- output must be exact

That last line is where many "fast" ideas die. If the output changes by one tenth, the run is wrong. If two UTF-8 station names compare incorrectly, the run is wrong. If a hash shortcut misses a collision case, the run is wrong.

So the first rule was boring and useful: correctness before timing.

## the first working architecture

The first good version treated the input as bytes, not text.

For smaller and medium-size files, the solver maps the file into memory, splits it into line-aligned ranges, and gives each worker a byte range. Each worker parses rows into its own native-memory table. After workers finish, the partial tables merge into a final table, and only then do we decode station names into strings for output.

That gives us a few important properties:

- no per-row string allocation
- no shared table updates while parsing
- no locks in the hot row loop
- final string decoding happens once per station, not once per row

The station table is a fixed-size open-addressing table. The original challenge allows up to 10,000 unique stations, so a 32,768-bucket table leaves enough room without resize logic. Each entry stores:

- pointer to station-name bytes
- name length
- first 8 bytes and last 8 bytes for quick identity checks
- hash
- min, max, sum, and count

Names longer than 16 bytes still get a full byte comparison on collision. The shortcuts are filters, not proof.

That distinction is important. Fast code can be aggressive, but it cannot be casual.

## parsing without pretending text is cheap

Temperature parsing is done as integer tenths. `12.3` becomes `123`, `-5.0` becomes `-50`, and the final formatter writes one decimal place.

That avoids floating-point work in the parser and keeps mean calculation exact enough for the challenge. It also makes min and max plain integer comparisons.

Station names are not decoded while parsing. The parser only needs to find the semicolon, compute a compact key, parse the temperature, and update a table entry.

The hot loop ended up with a few patterns that are common in fast 1BRC implementations:

- scan for `;` with word-sized byte tricks
- use a padded fast path when a row is far from a shard boundary
- keep a bounded tail path for correctness near the end of a range
- use multiple cursors inside a worker range to create instruction-level parallelism
- force the tiny table-update helpers inline when NativeAOT benefits from it

This was enough to get strong results on bounded 100M-row data. At that stage, the project still looked parser-bound.

Then the full 1B run changed the story.

## the benchmark trap

A 100M-row file is useful. It is fast enough to run many times, so it is good for killing bad ideas.

But it is not the same workload as the full 1B file.

On my 10-core Apple Silicon machine, warm 100M runs made parser and table changes easy to see. Full 1B runs exposed a different bottleneck: the memory-mapped path spent a large amount of time in kernel work and page faults.

That was the uncomfortable part of the project. I had been staring at parser micro-optimizations, but the big file was telling me to look at I/O.

The first full-size mmap runs were around 16 seconds. User time was not the whole story. System time was huge, and page faults dominated the profile shape.

This is the kind of moment where benchmark work becomes research instead of tuning. The next question was not "how do I parse a decimal faster?" It was "why is the operating system doing so much work for this input path?"

## why the winning change was pread

The winning full-size change was a native `pread` pipeline.

Instead of mapping the whole file, the solver partitions the file into line-aligned ranges. Each worker reads its range through a reusable 16 MiB native buffer. It parses complete rows from the buffer, carries the next offset forward, and reads the next chunk.

There is one important ownership change: with mmap, a station table can point directly into the mapped file because the file mapping outlives parsing and merging. With `pread`, chunk buffers are reused, so table entries must copy station-name bytes when a station is first inserted.

That sounds expensive, but it only happens once per unique station per worker, not once per row.

The payoff was large. On the full canonical 1B file, the promoted `pread` path moved warm runs from roughly 16 seconds to roughly 4 seconds on my machine. It also reduced system time, page faults, and memory pressure.

The important detail is that `pread` is not always better. On bounded 100M data, mmap still wins. That is why the production solver uses a size-aware default:

- use mmap for smaller files
- use `pread` on macOS for files at least 8 GiB
- keep `BRC_IO=mmap` and `BRC_IO=pread` as override knobs

The code has to admit that the best path depends on file size and machine behavior.

## what did not work

Most of the project was not the final code. It was rejecting plausible ideas.

SIMD temperature parsing looked attractive. The temperatures are tiny and regular. The problem is that the temperature pointers are scattered after variable-length station names. Building vector lanes from unrelated addresses is software gather work, and on this path it cost more than scalar parsing.

A 64-byte SIMD row-framing parser also looked promising. The idea was to discover semicolons and newlines over a contiguous block, then keep hash and temperature parsing scalar. It passed correctness, but mask extraction and row bookkeeping cost more than the scalar delimiter scan saved.

A station front cache sounded reasonable because many stations repeat. It lost because the main table was already close to one probe on canonical data. The cache added an extra load and equality check to almost every row.

A known-station direct path sounded even more tempting. The canonical generator has a fixed station list. The experiment built a fallback-safe direct aggregate path for those names. It still lost. Exact name checking and separate aggregate handling were more expensive than the existing table lookup.

A SwissTable-style control byte array helped a little on high-cardinality data, but hurt canonical data. For the main challenge shape, the extra metadata load did not pay for itself.

Dynamic microshards were also mixed. They reduced some CPU counters, but full 1B wall time did not improve enough to justify replacing the simpler fixed-range scheduler.

This was a useful reminder: a good idea in the abstract is not a good idea in a specific hot path until the measurements say so.

## validation discipline

The project used a promotion rule that saved a lot of time:

1. pass the official 1BRC fixtures
2. match current production output byte-for-byte on generated data
3. run paired timings
4. keep the candidate only if the result is strong enough for its risk

For small parser changes, 100M canonical and high-cardinality 10M data were enough to reject many candidates. For I/O changes, bounded data was not enough. The full 1B file had to be part of the decision.

That split matters. A 100M regression killed parser candidates because they were supposed to help the parser. A 100M `pread` regression did not kill the I/O experiment because the hypothesis was about the full-size mmap fault cost.

The benchmark must match the claim.

## how I would port it

I would not start by rewriting the parser.

On a new machine, I would first run the current solver unchanged:

```sh
dotnet build OneBrc.CSharp/OneBrc.CSharp.csproj -c Release
./test.sh csharp
./publish_aot.sh
```

Then I would sweep worker counts:

```sh
BRC_THREADS=6 ./calculate_average_csharp.sh measurements.txt
BRC_THREADS=8 ./calculate_average_csharp.sh measurements.txt
BRC_THREADS=10 ./calculate_average_csharp.sh measurements.txt
BRC_THREADS=12 ./calculate_average_csharp.sh measurements.txt
```

After that, I would compare I/O strategies if the platform supports them.

The current code isolates the machine-specific pieces:

- runtime policy in `RuntimeOptions`
- macOS `pread` in `NativePRead`
- ARM64 CRC32C use in `StationKey`
- parser logic in `MeasurementParser`
- storage ownership in `StationTable`

On Linux, I would add a separate read wrapper rather than mixing platform calls into the parser. On x64, I would consider a separate AVX2 or AVX-512 parser path. I would not fold that into the ARM64 path and hope the JIT or NativeAOT sorts it out.

Fast code stays maintainable when the unsafe parts have names and boundaries.

## the research lesson

The biggest lesson was not "use `pread`." That is too narrow.

The lesson was to let the evidence move the target.

At first, the project rewarded parser work: byte keys, native tables, line-aligned ranges, NativeAOT, and scalar fast paths. Later, the full input showed that the mmap path had become the real bottleneck. At that point, more parser cleverness was mostly noise.

This is easy to miss because parser optimizations feel more satisfying. They are local. You can stare at the loop and imagine the cycles. I/O behavior is messier. It involves the kernel, the file cache, page faults, scheduler behavior, and machine-specific thresholds.

But the full run did not care what felt elegant. It cared where the time went.

That is the part I want to keep from this project. Not a particular trick, but a way of working:

- prove correctness first
- benchmark against the claim you are making
- keep rejected ideas documented
- do not promote a change because it looks clever
- treat different machines as different experiments

Performance work is full of traps. The only reliable way through is to keep asking what the evidence actually proves.
