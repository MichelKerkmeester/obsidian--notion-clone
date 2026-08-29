# Baseline finding: table render is quadratic in the live DOM

The research reached a deliberate UNKNOWN and set a decision gate: support windowing only if
same-condition measurements concentrate cost in table DOM and layout. The gate has now been run.

## 1. WHAT WAS MEASURED

The real `TableRenderer` — its skeleton, row loop and cell loop — driven in headless Chrome through
the Obsidian DOM shim, at four row counts and two column counts, five repeats after a discarded
warm-up, reporting medians.

Excluded deliberately: row preparation, the metadata cache, computed fields, relation rollups and
the refresh coordinator, all of which need a live vault. Cell *content* is constant-time by design,
which isolates structural cost. This is one input to the gate, not the whole gate.

## 2. RESULT

| columns | rows | median | ms/row | DOM nodes | forced layout |
|---:|---:|---:|---:|---:|---:|
| 4 | 100 | 20.6 ms | 0.206 | 1,537 | 1.1 ms |
| 4 | 2,000 | **12,100 ms** | 6.050 | 30,037 | 28.9 ms |
| 16 | 100 | 52.2 ms | 0.522 | 2,797 | 4.1 ms |
| 16 | 2,000 | **31,912 ms** | 15.96 | 54,097 | 73.8 ms |

Per-row cost rises about thirtyfold between 100 and 2,000 rows at both column counts. A 2,000-row,
16-column table takes over half a minute to render.

**Layout is not the cost.** Forced layout after render is 28.9 ms and 73.8 ms against renders of
12 and 32 seconds. The time is inside the JavaScript render loop.

## 3. CAUSE

Building the table into the **live document**. The same renderer, same rows, built off-document and
attached once:

| columns | rows | attached | detached | ratio |
|---:|---:|---:|---:|---:|
| 4 | 2,000 | 12,100 ms | **122.8 ms** | **99×** |
| 16 | 2,000 | 31,912 ms | **175.2 ms** | **182×** |

Detached scaling is near-linear: per-row ×2.79 and ×1.72, against ×32.9 and ×29.1 attached.

Each row appended to an attached table forces style and layout work, which is what produces the
quadratic term. This is a property of the insertion pattern, not of the row loop, which reads as
linear on inspection.

## 4. WHAT THIS MEANS FOR THE GATE

Cost does concentrate in table DOM, so the gate's condition is met — but the conclusion it was
expected to license is wrong. **Windowing is not the right first fix.** It reduces N against a
quadratic curve; detaching removes the curve. On these numbers, off-document construction is worth
roughly two orders of magnitude at realistic sizes, at a fraction of windowing's blast radius —
windowing touches scroll anchoring, sticky headers, fixed column widths, keyboard traversal and
every screenshot fixture.

Windowing may still be worth doing afterwards for memory and node count. It should be re-argued
against a detached baseline, not this one.

## 5. FIXED, AND RE-MEASURED

Both render paths now build the `tbody` off-document and attach it once. Same bench, same
conditions:

| columns | rows | before | after | speedup |
|---:|---:|---:|---:|---:|
| 4 | 500 | 422.8 ms | 14.8 ms | 29× |
| 4 | 2,000 | 12,100 ms | **116.7 ms** | **104×** |
| 16 | 1,000 | 6,622 ms | 66.6 ms | 99× |
| 16 | 2,000 | 31,912 ms | **171.3 ms** | **186×** |

Per-row drift fell from ×32.9 and ×29.1 to ×2.16 and ×1.75. The quadratic term is gone.

The catch below did not bite: column widths are measured from `tableWrap` *before* the body is
built, so nothing in the row loop depends on being attached. That ordering was verified, not
assumed.

What remains: forced layout is now the larger share (196 ms against a 171 ms render at 16×2,000),
and the checker still reports SUPERLINEAR because ×2.16 exceeds its 1.5 threshold. Both are honest
and both are two orders of magnitude below where this started. Layout is the next thing to look at
if table size ever matters again.

## 6. THE CATCH THAT WAS WAITING (kept for the record)

`renderTable` measures available width from the DOM (`getAvailableTableWidth(tableWrap)`) and uses
it for column sizing. A detached container reports zero width, so a naive "build it all off-document"
change would silently break column widths — a regression that looks like a layout bug, not a
performance change.

The shape that likely works: keep the container attached so measurements stay valid, build the
**row body** into a fragment, and attach that in one operation. That needs verifying, not assuming;
the bench in `tools/bench/` is the instrument for it, and any candidate must be compared against the
same conditions recorded here.

## 7. REPRODUCING

```
node tools/bench/run.mjs
```

Raw samples land in `tools/bench/dist/samples.json`. Conditions: headless Chrome via the system
browser, this working tree, cells constant-time, five repeats after warm-up.
