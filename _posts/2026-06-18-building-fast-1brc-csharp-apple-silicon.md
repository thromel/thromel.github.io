---
layout: post
title: "Building a fast 1BRC solver in C# on Apple Silicon"
date: 2026-06-18
categories: [performance-engineering, dotnet, systems]
tags: [csharp, dotnet, nativeaot, 1brc, performance, arm64, macos]
---

This is a long write-up about building a C# solver for the One Billion Row Challenge on Apple Silicon. I am going to start from the boring version, explain why it falls apart, then rebuild the system one layer at a time.

The final code is here: [thromel/1brc-csharp](https://github.com/thromel/1brc-csharp). The shorter case-study page is here: [1BRC C# on Apple Silicon](/showcase/projects/1brc-csharp/).

The result is not a generic "make C# fast" story. It is more specific than that. It is about reading a 13 GiB text file, parsing one billion rows, aggregating station statistics, and finding out that the big win on my machine was not the parser trick I expected. It was changing the file input path.

That surprise is the useful part.

## reading map

This article has two jobs. First, it teaches the system from the naive C# version up to the native table and parser. Second, it explains why the final promoted path is size-aware: `mmap` for smaller files, macOS `pread` for the full-size file on my machine.

If you only want the result, read the case-study page. If you want to rebuild the design, read in this order:

1. the challenge contract
2. the naive implementation
3. integer-tenth parsing
4. byte keys and native tables
5. line-aligned parallel ranges
6. the `mmap` versus `pread` evidence
7. rejected experiments
8. porting notes

## what 1BRC asks you to do

The input is a text file. Each line has a station name, a semicolon, and a temperature with one decimal digit:

```text
Hamburg;12.0
Dhaka;32.4
Edmonton;-18.7
```

The output is one record per station:

```text
{Dhaka=32.4/32.4/32.4, Edmonton=-18.7/-18.7/-18.7, Hamburg=12.0/12.0/12.0}
```

For every station, we need:

- the minimum temperature
- the mean temperature
- the maximum temperature

Then we sort stations by name.

The constraints make the problem interesting:

- station names are UTF-8
- station names can be 1 to 100 bytes
- there can be up to 10,000 unique stations
- there are one billion rows in the full challenge
- the result must be exact

The input format looks friendly. It is not friendly at this size.

## how I measured

The benchmark protocol mattered as much as the code. Every serious candidate had to pass correctness first, then output parity on generated data, then paired timing runs. I did not treat one good run as evidence.

The gates were:

| Gate | Purpose |
| --- | --- |
| Official fixtures | Catch formatting, parsing, rounding, and edge-case regressions. |
| Generated parity | Compare candidate output byte-for-byte against the current solver on canonical and high-cardinality generated files. |
| Bounded timing | Use 100M canonical and 10M high-cardinality data to reject parser/table changes quickly. |
| Full 1B timing | Promote I/O and scheduler decisions only after the full 13 GiB file agrees. |

That distinction is important. The `pread` path lost the bounded 100M lane and still won the full 1B lane. If I had collapsed those into one benchmark, I would have made the wrong default.

## the final pipeline, before we build it

Here is the shape we are walking toward:

```text
input file
  -> runtime policy chooses mmap or pread
  -> line-aligned worker ranges
  -> byte parser
  -> per-worker native station table
  -> merge partial tables
  -> decode station names once
  -> sort and format output
```

Most of the code exists to protect that shape. The parser does not own file I/O. The table does not know which input strategy supplied the bytes. The formatter does not run until aggregation is finished. Those boundaries are what made it possible to swap the full-size input path without rewriting the whole solver.

## the version everyone writes first

The natural C# version is easy to write:

```csharp
public readonly record struct Aggregate(int Min, int Max, long Sum, int Count)
{
    public Aggregate Add(int value)
    {
        return new Aggregate(
            Math.Min(Min, value),
            Math.Max(Max, value),
            Sum + value,
            Count + 1);
    }
}

var table = new Dictionary<string, Aggregate>(StringComparer.Ordinal);

foreach (var line in File.ReadLines("measurements.txt"))
{
    var separator = line.IndexOf(';');
    var station = line[..separator];
    var temperature = decimal.Parse(line[(separator + 1)..], CultureInfo.InvariantCulture);
    var tenths = (int)(temperature * 10);

    if (table.TryGetValue(station, out var aggregate))
    {
        table[station] = aggregate.Add(tenths);
    }
    else
    {
        table[station] = new Aggregate(tenths, tenths, tenths, 1);
    }
}
```

This is a good teaching implementation. It makes the algorithm obvious:

1. read a line
2. split station and temperature
3. parse the temperature
4. update a dictionary
5. sort at the end

It is also a performance disaster for the full challenge.

Each row creates or touches managed strings. `decimal.Parse` is a general-purpose parser. `File.ReadLines` decodes text before we know whether we need text. The dictionary is good software engineering for normal data sizes, but here it sits directly in the hottest loop. One billion rows turns every small convenience into a bill.

The first lesson is simple: the file is not text yet. It is bytes. We should only turn bytes into strings when we actually need strings.

## the data model: use integer tenths

Temperatures have one decimal digit. That means we do not need floating point while parsing.

Use integer tenths:

```text
12.3  ->  123
-5.0  ->  -50
0.0   ->  0
```

The aggregate can be plain integers:

```csharp
internal struct StationAggregate
{
    public int Min;
    public int Max;
    public long Sum;
    public int Count;

    public void Add(int temperature)
    {
        if (temperature < Min)
        {
            Min = temperature;
        }

        if (temperature > Max)
        {
            Max = temperature;
        }

        Sum += temperature;
        Count++;
    }
}
```

The mean is computed only at the end:

```csharp
static int RoundMean(long sum, int count)
{
    return (int)Math.Floor((sum / (double)count) + 0.5);
}
```

The current code formats carefully to match the challenge's expected one-decimal output, but the design idea is this: keep parser math cheap and exact enough for the contract.

## parsing temperature by shape

A 1BRC temperature has only a few shapes:

```text
1.2
12.3
-1.2
-12.3
```

So a parser does not need culture, decimal types, exponent handling, whitespace rules, or thousands separators. It can read bytes and assemble an integer.

A readable version looks like this:

```csharp
static unsafe int ParseTemperature(byte* p, out int bytesConsumed)
{
    var sign = 1;
    if (*p == (byte)'-')
    {
        sign = -1;
        p++;
        bytesConsumed = 1;
    }
    else
    {
        bytesConsumed = 0;
    }

    var value = *p - (byte)'0';
    p++;
    bytesConsumed++;

    if (*p != (byte)'.')
    {
        value = (value * 10) + (*p - (byte)'0');
        p++;
        bytesConsumed++;
    }

    p++;
    bytesConsumed++;

    value = (value * 10) + (*p - (byte)'0');
    bytesConsumed++;

    return sign * value;
}
```

The current parser is tighter because it can often read a word and use byte arithmetic, but the point is the same. The input grammar is tiny. Parse that grammar, not every number humans have ever written.

## station names: do not decode in the hot path

Station names are UTF-8. Sorting the final output needs strings, but aggregation does not.

During parsing, station names can stay as byte slices:

```csharp
internal readonly unsafe struct StationNameSlice
{
    public StationNameSlice(byte* pointer, int length)
    {
        Pointer = pointer;
        Length = length;
    }

    public byte* Pointer { get; }

    public int Length { get; }
}
```

With a memory-mapped file, the input bytes stay alive while we parse and merge. A table entry can point directly into the mapped file:

```csharp
entry.NamePointer = nameStart;
entry.NameLength = nameLength;
```

That is not safe for every input strategy. It is safe for mmap because the mapping owns the bytes. It is not safe for a reusable read buffer, because the next read overwrites the buffer. This difference becomes important later.

## finding the semicolon

Every row has a semicolon. Finding it is row framing.

The simplest byte parser does this:

```csharp
static unsafe int FindSemicolon(byte* start)
{
    var p = start;
    while (*p != (byte)';')
    {
        p++;
    }

    return (int)(p - start);
}
```

That works, but it checks one byte at a time. Station names are often short, so this is not terrible. Still, it is hot enough to matter.

A common trick is to read eight bytes at a time and detect whether any byte equals `;`.

```csharp
static unsafe int FindSemicolonInWord(byte* start)
{
    const ulong SemicolonBytes = 0x3B3B3B3B3B3B3B3BUL;
    const ulong LowBits = 0x0101010101010101UL;
    const ulong HighBits = 0x8080808080808080UL;

    var word = Unsafe.ReadUnaligned<ulong>(start);
    var comparison = word ^ SemicolonBytes;
    var mask = (comparison - LowBits) & ~comparison & HighBits;

    if (mask == 0)
    {
        return -1;
    }

    return BitOperations.TrailingZeroCount(mask) >> 3;
}
```

The trick works because after XOR, bytes equal to `;` become zero bytes. The `(x - lowBits) & ~x & highBits` expression marks zero bytes. Then `TrailingZeroCount` tells us the first matching byte.

The promoted parser checks the first few words inline, then sends uncommon long names to a no-inline tail helper. That shape matters because code size matters. The hot path should stay hot.

## building a station key

A table lookup needs a hash and a way to check identity.

One option is to hash the entire station name every time. That is correct, but it repeats work for long names. In this solver, the key uses:

- station-name length
- first 8 bytes
- last 8 bytes
- a hash derived from those fields

The simplified version looks like this:

```csharp
internal readonly unsafe struct StationKey
{
    public StationKey(int hash, ulong first, ulong last)
    {
        Hash = hash;
        First = first;
        Last = last;
    }

    public int Hash { get; }
    public ulong First { get; }
    public ulong Last { get; }

    public static StationKey Create(byte* name, int length)
    {
        var first = ReadUpToEightBytes(name, length);
        var last = length >= 8
            ? Unsafe.ReadUnaligned<ulong>(name + length - 8)
            : first;

        var mixed = first ^ BitOperations.RotateLeft(last, 42) ^ (uint)length;
        mixed ^= mixed >> 32;

        return new StationKey((int)mixed, first, last);
    }
}
```

On ARM64, the current code uses hardware CRC32C when available:

```csharp
if (Crc32.Arm64.IsSupported)
{
    hash = Crc32.Arm64.ComputeCrc32C((uint)length, first);
    hash = Crc32.Arm64.ComputeCrc32C(hash, last);
}
```

This is a hash, not a proof of equality. The table still checks the actual identity:

```csharp
entry.NameLength == nameLength &&
entry.First == key.First &&
entry.Last == key.Last &&
(nameLength <= 16 ||
 new ReadOnlySpan<byte>(name, nameLength)
     .SequenceEqual(new ReadOnlySpan<byte>(entry.NamePointer, nameLength)))
```

That last full comparison is only needed for names longer than 16 bytes after the cheap checks match. It protects correctness without making every row pay the full price.

## building the table

The original challenge caps unique stations at 10,000. That lets us use a fixed table. The current table uses 32,768 buckets, so the load factor stays comfortable.

A simplified open-addressing update looks like this:

```csharp
public unsafe void AddOrUpdate(byte* name, int nameLength, StationKey key, int temperature)
{
    var index = key.Hash & CapacityMask;

    while (true)
    {
        ref var entry = ref _entries[index];

        if (entry.NameLength == 0)
        {
            entry = new StationEntry(name, nameLength, key, temperature);
            return;
        }

        if (entry.Matches(name, nameLength, key))
        {
            entry.Add(temperature);
            return;
        }

        index = (index + 1) & CapacityMask;
    }
}
```

There are no locks here. Each worker has its own table. That is the real concurrency design.

Shared mutable state in a one-billion-row hot loop is expensive. Per-worker state is simpler and faster:

```text
worker 0 -> table 0
worker 1 -> table 1
worker 2 -> table 2
...
merge after workers finish
```

Merging is cheap compared with parsing one billion rows because there are only thousands of stations per worker, not hundreds of millions of rows.

## step one architecture: mmap plus line-aligned ranges

The first serious architecture was:

1. memory-map the file
2. split the byte range into worker ranges
3. move each split point to the next newline
4. parse each range on a fixed thread
5. merge partial tables
6. decode station names and format output

The split has to respect line boundaries. If a worker starts in the middle of a station name, everything after it is wrong.

The range partitioner is conceptually this:

```csharp
static unsafe InputRange[] CreateRanges(byte* basePointer, long length, int workers)
{
    var ranges = new InputRange[workers];

    for (var i = 0; i < workers; i++)
    {
        var rawStart = length * i / workers;
        var rawEnd = length * (i + 1) / workers;

        var start = i == 0
            ? 0
            : MoveToNextLine(basePointer, rawStart, length);

        var end = i == workers - 1
            ? length
            : MoveToNextLine(basePointer, rawEnd, length);

        ranges[i] = new InputRange(start, end);
    }

    return ranges;
}
```

`MoveToNextLine` is deliberately boring:

```csharp
static unsafe long MoveToNextLine(byte* basePointer, long offset, long length)
{
    while (offset < length && basePointer[offset] != (byte)'\n')
    {
        offset++;
    }

    return offset < length ? offset + 1 : length;
}
```

This split happens once per worker. It does not need to be clever.

## parsing a range

Inside each range, the parser walks bytes:

```csharp
static unsafe void ParseRangeInto(StationTable table, byte* start, byte* end)
{
    var cursor = start;

    while (cursor < end)
    {
        var nameStart = cursor;
        var nameLength = FindSemicolon(nameStart, end);
        cursor += nameLength + 1;

        var temperature = ParseTemperature(ref cursor, end);
        var key = StationKey.Create(nameStart, nameLength);

        table.AddOrUpdate(nameStart, nameLength, key, temperature);
    }
}
```

The current version has two paths:

- a fast path when there are enough readable bytes left
- a bounded path near the end of a shard

The fast path can safely do unaligned word reads because every 1BRC row is bounded by the station-name and temperature limits. Near the end of a range, the bounded path avoids reading beyond the range.

This is one of the small details that keeps unsafe code honest. The fastest path should be allowed to assume what is true, but only where it is true.

## why multiple cursors helped

One worker parsing one row at a time creates a chain of dependencies:

```text
find semicolon -> parse temperature -> build key -> table update -> next row
```

Modern CPUs can do more work if independent operations are available. The current parser splits a worker range into thirds and walks three cursors:

```csharp
var cursor0 = start;
var cursor1 = split1;
var cursor2 = split2;

while (allCursorsHaveRoom)
{
    ParseRowFast(table, ref cursor0);
    ParseRowFast(table, ref cursor1);
    ParseRowFast(table, ref cursor2);
}
```

This is not parallelism in the thread sense. It is instruction-level parallelism. While one row waits on a load or branch, the CPU may have useful work from another cursor.

We tested variants. Four cursors added complexity without enough speed. Three survived. This is the pattern of the whole project: keep the idea only if measurement pays for it.

## the first result was good but incomplete

At this point the solver had the shape I expected:

- memory-mapped input
- fixed worker threads
- byte parser
- integer temperatures
- byte-key table
- final string formatting
- NativeAOT publish

On bounded 100M-row runs, that was a strong direction. Parser and table changes showed up clearly. Most experiments could be accepted or rejected quickly.

But the full 1B file changed the profile.

Warm mmap runs on my machine were around 16 seconds. User time was not the whole story. System time was huge, and page faults dominated the shape. The parser was still important, but the full run was saying something else:

```text
the file input path is now the bottleneck candidate
```

That is where the project stopped being a parser exercise.

## mmap and pread in plain terms

With mmap, the operating system maps file pages into the process address space. The code reads memory addresses, and the OS brings pages in as needed.

That is elegant. It also means page faults become part of the runtime story.

With `pread`, the code explicitly asks the kernel to copy bytes from a file descriptor into a buffer at a given offset:

```csharp
pread(fd, buffer, byteCount, offset)
```

The program controls the chunking. The worker reads a chunk, parses complete rows, then reads the next chunk.

Neither model is universally better. mmap was better for bounded 100M runs. `pread` was much better for full 1B on this macOS ARM64 machine.

That is why the promoted solver does not pick one globally. It has a runtime policy:

```csharp
public static InputStrategy SelectInputStrategy(long inputLength)
{
    var configured = Environment.GetEnvironmentVariable("BRC_IO");

    if (string.Equals(configured, "pread", StringComparison.OrdinalIgnoreCase))
    {
        return InputStrategy.PRead;
    }

    if (string.Equals(configured, "mmap", StringComparison.OrdinalIgnoreCase))
    {
        return InputStrategy.MemoryMapped;
    }

    return OperatingSystem.IsMacOS() && inputLength >= 8L << 30
        ? InputStrategy.PRead
        : InputStrategy.MemoryMapped;
}
```

The exact thresholds are local tuning. The design is the important part: make the strategy explicit, overridable, and easy to retune.

## building the pread path

The `pread` path keeps the same parser and table idea, but changes byte ownership.

Each worker:

1. owns a line-aligned file range
2. allocates a reusable native buffer
3. reads up to 16 MiB from its current offset
4. finds the last complete line in the buffer
5. parses only complete rows
6. advances by the parsed byte count
7. repeats until the range is done

The loop is roughly:

```csharp
var offset = range.Start;

while (offset < range.End)
{
    var requested = (int)Math.Min(ChunkBytes, range.End - offset);
    var read = NativePRead.ReadFull(fileDescriptor, buffer, requested, offset);

    if (read == 0)
    {
        break;
    }

    var parseLength = read;

    if (offset + read < range.End)
    {
        parseLength = FindLastLineEnd(buffer, read);
        if (parseLength == 0)
        {
            throw new InvalidDataException("No complete row in chunk.");
        }
    }

    MeasurementParser.ParseRangeInto(table, buffer, buffer + parseLength);
    offset += parseLength;
}
```

The last-line scan matters. If we parse a partial row at the end of a chunk, the next chunk begins with the rest of that row and everything breaks. Instead, we parse up to the last newline and let the next read start at the unparsed row.

The `ReadFull` wrapper handles short reads:

```csharp
public static unsafe int ReadFull(int fd, byte* buffer, int byteCount, long offset)
{
    var total = 0;

    while (total < byteCount)
    {
        var read = Read(fd, buffer + total, byteCount - total, offset + total);
        if (read == 0)
        {
            break;
        }

        total += read;
    }

    return total;
}
```

This is not glamorous code. It is the code that made the full-size run fast.

## name ownership changes under pread

mmap lets the table point into the input file:

```text
table entry -> pointer into mapped file
```

`pread` cannot do that because every worker reuses its chunk buffer:

```text
chunk buffer contains rows 0..N
parse
chunk buffer now contains rows N..M
old station-name pointers are invalid
```

So the `pread` table copies station names when it first inserts them:

```csharp
private unsafe byte* StoreName(byte* name, int nameLength)
{
    if (!_copyNames)
    {
        return name;
    }

    if (_nameCursor == null || _nameEnd - _nameCursor < nameLength)
    {
        AllocateNameBlock(nameLength);
    }

    var stored = _nameCursor;
    Buffer.MemoryCopy(name, stored, nameLength, nameLength);
    _nameCursor += nameLength;
    return stored;
}
```

This would be a bad design if it copied every row. It does not. It copies when a station is inserted into a worker table. With up to 10,000 stations, that is a tiny amount of copying compared with one billion rows.

This is the kind of ownership distinction that makes unsafe code maintainable. The table has a `copyNames` mode. The parser does not need to know why.

## full-size result

On my 10-core Apple Silicon machine, the full canonical 1B file was about 13 GiB. The important claim is narrow: paired warm runs on this machine showed the macOS `mmap` path spending heavily in VM/page-fault behavior, and the native `pread` path removed most of that cost.

| Lane | Evidence |
| --- | --- |
| Bounded 100M | `pread` was still worse than `mmap`: `+0.033671s` median wall and `+0.135181s` median system time. |
| First full 1B parity run | `mmap`/`pread` wall: `16.227s`/`4.297s`; user: `13.198s`/`8.937s`; sys: `26.026s`/`3.902s`; major faults: `777206`/`76`. |
| Five paired warm full 1B runs | `pread` won `5/5`; candidate-minus-baseline medians were `-11.785s` wall, `-5.373s` user, `-26.445s` sys, and `-842044` major faults. |
| Worker-count follow-up | The full-size `pread` default moved to 8 workers after randomized pairs showed `4.08s` versus `4.18s` medians against the older 13-worker default. |

Wall time was not the only signal. System time and major-fault counts moved with it. That is what made the result convincing. If only one metric had moved, I would have treated it as suspect.

The final default is size-aware. Smaller files use `mmap`; macOS files at least 8 GiB use `pread`. That is not a claim that `pread` is better everywhere. It is a claim that this full-size run, on this machine, exposed a different bottleneck from the bounded benchmarks.

## experiments that looked good and lost

A large part of this project was rejecting good-looking ideas.

### SIMD temperature parsing

Temperature parsing looked like the obvious SIMD target. Temperatures are short and regular.

The catch is their addresses:

```text
StationName;12.3
VeryLongStationName;-4.5
X;0.1
```

The temperature starts after a variable-length station name. Four rows give four unrelated temperature pointers. To vectorize them, we would have to gather bytes into lanes manually. On this path, that setup cost more than scalar parsing.

The lesson: contiguous data vectorizes naturally. Scattered tiny fields often do not.

### 64-byte SIMD row framing

Another idea was to scan 64-byte blocks and discover semicolon and newline masks together:

```text
load 64 bytes
compare with ';'
compare with '\n'
extract masks
walk complete rows inside the block
```

This kept hash, temperature parsing, and table updates scalar. It attacked row framing, not scattered temperature math.

It still lost. Mask extraction and row bookkeeping cost more than the scalar delimiter path saved on this NativeAOT ARM64 build.

The lesson: SIMD is not free. The setup and extraction path has to be cheaper than the scalar work it replaces.

### station front cache

A direct-mapped station cache sounds reasonable:

```text
hash -> last table bucket
```

If stations repeat, maybe we can skip the table probe.

It lost because the table already averaged close to one probe on canonical data. The cache added another load and another equality check to almost every row.

The lesson: do not optimize a bottleneck you have already mostly removed.

### known-station direct path

The canonical generator has a known station list. That invites a direct aggregate array:

```text
known station -> direct slot
unknown station -> fallback table
```

I built a fallback-safe version. It passed correctness and matched output. It still lost. Exact known-name checks and separate aggregate handling cost more than the existing table lookup.

The lesson: specializing for a benchmark can still be slower if the generic path is already cheap.

### control-byte metadata

SwissTable-style control bytes can reduce expensive equality checks. The candidate kept the same table but added a byte of hash metadata per bucket.

It helped too little on high-cardinality data and hurt canonical data.

The lesson: extra metadata is an extra memory access. It has to save enough downstream work to pay for itself.

### dynamic microshards

Dynamic scheduling can reduce tail imbalance. The candidate split full-size `pread` work into many microshards and had persistent workers pull ranges.

The result was mixed. Some CPU counters improved, but full 1B wall time did not improve robustly enough. The simpler fixed-range scheduler stayed.

The lesson: lower CPU time is not automatically lower wall time. The promotion criterion has to match the goal.

## the validation loop

Every serious candidate went through this shape:

```text
official fixtures
generated output parity
paired timing
promotion or rejection note
```

The official fixtures catch correctness mistakes:

```sh
./test.sh csharp
```

For I/O changes on macOS, both paths need coverage:

```sh
BRC_IO=mmap ./test.sh csharp
BRC_IO=pread ./test.sh csharp
```

Generated files catch broader differences:

```sh
./calculate_average_csharp.sh measurements-100m.txt > baseline.out
./calculate_average_csharp.sh measurements-100m.txt > candidate.out
diff -u baseline.out candidate.out
```

Paired timing avoids comparing one lucky run against one unlucky run:

```text
baseline, candidate, baseline, candidate, ...
```

For parser changes, bounded 100M and high-cardinality 10M data were good kill gates. For I/O changes, full 1B was required because the hypothesis was specifically about the full-size mmap fault cost.

The benchmark must match the claim.

## how to build this system from scratch

If I were teaching someone to build this solver, I would do it in this order.

### stage 1: write the obvious version

Start with `File.ReadLines` and `Dictionary<string, Aggregate>`.

Do not optimize yet. Make the output correct. Learn the rounding rule. Run the official fixtures. This version is the reference you understand.

### stage 2: switch from decimal to integer tenths

Keep strings for now, but parse temperatures into integers:

```csharp
static int ParseTenths(ReadOnlySpan<char> text)
{
    var sign = 1;
    var index = 0;

    if (text[index] == '-')
    {
        sign = -1;
        index++;
    }

    var whole = text[index++] - '0';

    if (text[index] != '.')
    {
        whole = (whole * 10) + (text[index++] - '0');
    }

    index++;
    var fraction = text[index] - '0';

    return sign * ((whole * 10) + fraction);
}
```

This teaches the data shape without unsafe code.

### stage 3: parse bytes

Move from lines to bytes. At first, use `ReadOnlySpan<byte>` and a single-threaded parser. Find `;`, parse temperature, and decode station names only when inserting into a dictionary.

This stage shows how much text decoding costs.

### stage 4: keep station names as byte keys

Replace `Dictionary<string, Aggregate>` with a table keyed by byte slices. Store first word, last word, length, and hash. Decode only at the end.

This is the stage where the program stops being a normal text-processing script and becomes a systems program.

### stage 5: split by line boundaries

Partition the file into ranges and parse in parallel. Give each worker a table. Merge after parsing.

Do not share a dictionary across workers. That is the wrong fight.

### stage 6: publish NativeAOT

NativeAOT mattered for this project because startup, code generation, and direct native execution all affect short warm runs. Use the published binary for timing; a JIT build answers a different question.

```sh
./publish_aot.sh
./calculate_average_csharp.sh measurements.txt
```

### stage 7: profile full-size behavior

Do not assume the 100M profile predicts the 1B profile. It did not here.

Look at:

- wall time
- user time
- system time
- page faults
- RSS
- per-worker balance

When system time and faults dominate, parser changes are probably not the next big lever.

### stage 8: add an explicit I/O strategy boundary

Keep mmap and read-based paths behind a strategy selector. Do not scatter platform checks through the parser.

```csharp
return strategy switch
{
    InputStrategy.MemoryMapped => MMapSolver.Calculate(input),
    InputStrategy.PRead => PReadSolver.Calculate(input),
    _ => throw new InvalidOperationException()
};
```

This makes the system easier to port and easier to test.

## porting the solver

I would not port this by changing random constants.

On a new machine, I would first run the current code unchanged:

```sh
dotnet build OneBrc.CSharp/OneBrc.CSharp.csproj -c Release
./test.sh csharp
./publish_aot.sh
```

Then sweep worker counts:

```sh
BRC_THREADS=6 ./calculate_average_csharp.sh measurements.txt
BRC_THREADS=8 ./calculate_average_csharp.sh measurements.txt
BRC_THREADS=10 ./calculate_average_csharp.sh measurements.txt
BRC_THREADS=12 ./calculate_average_csharp.sh measurements.txt
```

Then compare input strategies where available:

```sh
BRC_IO=mmap ./calculate_average_csharp.sh measurements.txt
BRC_IO=pread ./calculate_average_csharp.sh measurements.txt
```

For Linux, I would add a Linux-specific read wrapper. For Windows, I would add a Windows-specific path. For x64 AVX2 or AVX-512, I would add a separate parser path rather than mixing those assumptions into the ARM64 parser.

The boundaries are already there:

- `RuntimeOptions` for policy
- `NativePRead` for macOS native I/O
- `MeasurementParser` for row parsing
- `StationKey` for hash and identity shortcuts
- `StationTable` for storage and name ownership

That is what maintainability means in this kind of code. Not removing unsafe code. Giving unsafe code a small address.

## what generalizes and what does not

The process generalizes better than the numbers.

These parts are worth carrying to another implementation:

- validate output before timing
- parse the 1BRC grammar directly instead of using general-purpose text APIs
- keep temperatures as integer tenths
- avoid per-row string allocation
- split work on newline boundaries
- keep one aggregation table per worker and merge afterward
- write down rejected experiments

These parts should be retuned:

- worker count
- input strategy
- chunk size
- table layout
- hash shortcuts
- SIMD choices

The `pread` result especially should not be copied blindly. Linux, Windows, x64, different Apple Silicon generations, different storage, and different .NET builds can all move the bottleneck. The right port is not "use my constants." The right port is "keep the boundaries, rerun the gates, and promote only what your machine proves."

## the part I would keep

The specific numbers are local. The process is more durable.

The project started as a parser exercise. It became an I/O exercise only after the full input proved that the mmap path was spending too much time in the kernel. If I had trusted only the 100M benchmark, I would have kept shaving cycles from the wrong place.

That is the real lesson.

Build the simple version. Make it correct. Replace abstractions only when you can explain the cost. Keep measurements paired. Write down failed ideas. Treat a different machine as a new experiment.

Performance work rewards humility more than cleverness. The machine does not care which optimization looked best in your head. It only cares where the time actually went.
