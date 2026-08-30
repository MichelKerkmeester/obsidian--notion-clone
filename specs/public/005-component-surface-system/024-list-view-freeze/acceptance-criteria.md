---
title: "Acceptance Criteria: List View Freeze"
description: "Every criterion with its measured before-number, its after-number, the command that produced it, and the control that proved the check could fail."
trigger_phrases:
  - "list view freeze acceptance criteria"
  - "list render benchmark numbers"
  - "024 acceptance"
importance_tier: "critical"
contextType: "verification"
---
# Acceptance Criteria: List View Freeze

Every number below was produced by a command in this repository and read from its output, not
inferred. Where a check is claimed to be capable of failing, the run that made it fail is named.

---

## 1. THE MEASUREMENT

All benchmark rows come from:

```
node tools/bench/run-list.mjs --cols=21 --fill=0.3 --rows=400,800,1600 --repeats=1
```

Twenty-one properties and 30% fill, because that is the shape of the database in the report. The
bench drives the real `ListRenderer` through `esbuild` into headless Chrome, at desktop width and at
phone width with the class the stylesheet keys its mobile arm to.

Three trees were measured:

- **BEFORE** — `git show c31acf5^:src/views/list-renderer.ts`, byte-identical to `4830275`
- **SHIPPED** — `HEAD`, the tree carrying 1.3.4 and 1.3.5
- **FIXED** — this phase

---

## 2. CRITERIA

### AC-1 — Opening a list view does not block the main thread (REQ-001)

| rows | BEFORE | SHIPPED | FIXED |
|------|--------|---------|-------|
| desktop 400 | 417.9ms | 499.5ms | **18.0ms** |
| desktop 800 | 1,549.4ms | 1,839.9ms | **51.8ms** |
| desktop 1,600 | 6,777.0ms | 7,173.5ms | **84.5ms** |
| phone 400 | 72.7ms | 118.5ms | **21.1ms** |
| phone 800 | 185.2ms | 305.5ms | **44.2ms** |
| phone 1,600 | 639.8ms | 821.4ms | **85.2ms** |

**PASS**, and the multiplier above is **wrong** — corrected below and left in place so the error is
legible rather than quietly rewritten.

84.9× compares a render to a render. The repair works by taking a forced layout out of the row loop,
which does not delete that layout, it defers it: cost leaves `render` and arrives in `layout`. A
ratio that only reads the term the work moved *out of* credits the fix with the move as well as the
saving. The runner's budget had the same blind spot, and the two errors are the same error.

Re-derived with both terms, both trees measured through the same runner in one session at
`--cols=21 --fill=0.3 --rows=1600 --repeats=3`:

| desktop, 1,600 rows | render | forced layout | blocked main thread |
|---|---|---|---|
| pre-fix (`173819e^`) | 8,633.5ms | 12.5ms | **8,646.0ms** |
| fixed | 82.4ms | 164.2ms | **246.6ms** |

**The honest multiplier is 35.1×.** On render alone the same pair reports 104.8×, which is the shape
of the original error. On the phone: 1,027.7ms → 189.2ms, **5.4× blocked** against 14.9× on render
alone.

33.7× is not a smaller result, it is a true one. Seven-plus seconds of frozen application became a
quarter of a second either way.

The runner declares a 2,000ms budget and exits non-zero above it. **It was observed failing first**:
on `HEAD`, `list-bench: FAIL — 7173.5ms exceeds the 2000ms budget`, exit 1. On the fixed tree,
`list-bench: PASS — worst render 85.2ms`. Both of those messages name render only, because they
predate AC-8.

### AC-2 — Cost is linear in row count (REQ-002)

Per-row cost, 400 → 1,600 rows:

| | BEFORE | SHIPPED | FIXED |
|---|--------|---------|-------|
| desktop | ×4.05 SUPERLINEAR | ×3.59 SUPERLINEAR | **×1.17 LINEAR** |
| phone | ×2.20 SUPERLINEAR | ×1.73 SUPERLINEAR | **×1.01 LINEAR** |

**PASS.** `npm run bench:list` reports LINEAR at all eight shapes of the default matrix.

### AC-3 — A property starts in the same column on every card (REQ-003)

`node tools/storybook/verify-placement.mjs`, section 5k, measuring the renderer's own output:

```
PASS  on desktop the renderer gives every list card the same field-area width
PASS  on desktop the renderer starts a property in the same column on every card
PASS  on phone the renderer gives every list card the same field-area width
PASS  on phone the renderer starts a property in the same column on every card
```

**PASS.** The alignment `c31acf5` bought is intact.

### AC-4 — A reserved column costs one element (REQ-004)

| | field elements | of which reserved | DOM nodes |
|---|---|---|---|
| BEFORE (400 rows) | 2,400 | 0 | 13,207 |
| SHIPPED (400 rows) | 8,000 | 5,600 | 30,007 |
| FIXED (400 rows) | 8,000 | 5,600 | **18,807** |

**PASS.** The reserved columns remain; what they cost fell from three nodes each to one. At 1,600
rows the list holds 75,207 nodes rather than 120,007.

Asserted directly, not only counted:
`PASS  on desktop a reserved column costs one element and no rendered content —
14 reserved columns hold 0 child element(s)`.

### AC-5 — The check has been observed red (REQ-005)

Control run, `git show c31acf5^:src/views/list-renderer.ts` in place, same command:

```
FAIL  on desktop the renderer gives every list card the same field-area width
FAIL  on desktop the renderer starts a property in the same column on every card
FAIL  on desktop a reserved column costs one element and no rendered content
FAIL  on phone  a reserved column costs one element and no rendered content
```

**PASS.** Four of the six go red on the renderer that skips empty properties and green on this one,
which is the discrimination the check exists to provide.

**The two that do not are reported rather than hidden.** The phone arm cannot fail, because the
renderer's field area on a 402px phone measures 240px and fits one property per line — every property
sits at x=0 whichever way the renderer claims its column. The check now says so in its own output:

```
only 1 property fits per line here, so every one sits at x=0 and this cannot show a shuffle
— the column claim is load-bearing on the wider surface, not this one
```

A green that cannot go red is worth less than a red, and worth nothing at all if nobody is told.

### AC-7 — A slot is reserved only where a slot exists to reserve (REQ-007)

The reserved box costs one element on a grid, where it holds a track. On a wrapping flex line it
holds nothing, because `grid-column` means nothing there and the 240px field area fits one property
per line — every property sits at x=0 whichever way the renderer claims its slot, which this phase
already measured and reported. What the box does cost there is a wrapped line of zero height plus
the 6px row gap under it, once per gap in the data.

Measured on the reported shape — twenty-one properties, 30% fill, twelve cards, 402px — driving the
real `ListRenderer`:

| phone, 402px | list height | per card | reserved boxes |
|---|---|---|---|
| pre-reservation renderer (`c31acf5^`) | 2,122.7px | 169.9px | 0 |
| before this change | **3,130.7px** | **253.9px** | 168 |
| after | 2,122.7px | 169.9px | 0 |

**84.0px per card, 1,008px per list, 32.2% of the scrolling.** Recovered exactly: the phone now
measures the pre-reservation renderer's height to the tenth of a pixel.

The desktop is unchanged, which is the other half of the criterion:

| desktop, 1,280px | list height | field-area width | reserved boxes |
|---|---|---|---|
| before this change | 719.3px | 3,228px | 168 |
| after | 719.3px | 3,228px | 168 |

#### The predicate, and the two wrong ones it replaced

**Not `touchMode`.** `isTouchDevice` answers whether the surface takes touch input. It is true for a
tablet, a touchscreen laptop, and any pane narrower than 760px, and every one of those still puts
properties side by side and still needs their slots held.

**Not the phone class either**, which was the first implementation here and was wrong for a reason
only measurement found. `body.is-phone` is what the stylesheet keys its wrapping arm to, so it looks
like the exact question. It is not, because a phone rotated to landscape is still `is-phone` and
fits two properties per line. Measured across container widths under that class, with the four
unequal widths section 5k uses, and reporting how many columns the worst property lands in across
twelve cards:

| container | field area | properties per line | reserved by `is-phone` | worst | reserved by the final predicate | worst |
|---|---|---|---|---|---|---|
| 360px | 198px | 1 | 0 | 1 | 0 | 1 |
| 402px | 240px | 1 | 0 | 1 | 0 | 1 |
| 430px | 268px | 1 | 0 | 1 | 14 | 1 |
| 480px | 318px | 2 | 0 | **2** | 14 | 1 |
| 540px | 378px | 2 | 0 | **3** | 14 | 1 |
| 600–1024px | 387px | 2 | 0 | **3** | 14 | 1 |

Keying on the class would have traded 84px per card in portrait for the exact raggedness `c31acf5`
was written to remove, the moment the operator turned the phone sideways. A property in three
columns across twelve cards is the original bug.

**The predicate is the property itself: can two properties share a line at all.** On a grid, always —
every property has a column by index. On a wrapping line, only if the two narrowest declared widths
plus one column gap fit inside the measured field area. Both terms are read off the element:
`display` and `column-gap` from computed style, the field area from its rect. Nothing infers the
layout from a platform flag, a viewport threshold or a body class, so nothing can drift from the
stylesheet that actually decides it.

The pair is deliberately the *narrowest* one, which makes the uncertain cases resolve toward
reserving — see 430px above, where the check reserves although only one property fits. A needless
reservation costs height; a needless skip costs the alignment. Only one of those is a bug.

**It reads layout once per render, and the reason it is once is load-bearing.** An empty field area
measures 37.9px at every screen width, because its ancestors are still sizing to content that has
not arrived — so the decision cannot be taken before a row exists. It is therefore taken on the
first row *after* that row is built, and if the answer is "skip", that one row's reserved boxes are
removed. The fixup is bounded by the column count, never by the row count. The whole phase exists
because a layout read sat inside the row loop; this one sits behind a flag set on first use, and the
1,600-row phone render measures 68.6ms against 71.5ms before it was added — inside the noise.

**Both directions observed red**, `node tools/storybook/verify-placement.mjs`:

```
# renderer reserving unconditionally — the tree before this change
FAIL  on phone the wrapping card spends no line on a property it does not show
      12 cards over 48 field line(s), 14 of them carrying only reserved boxes
exit 1

# reservesColumns forced to false on every surface
FAIL  on desktop a reserved column costs one element and no rendered content
      0 reserved columns hold 0 child element(s)
exit 1
```

Each arm is red on exactly the surface it is about and green on the other. Final state:
**186/190, 4 red for a declared reason** — the baseline count, because the phone's third assertion
was replaced rather than added to.

### AC-8 — The budget asserts the blocked main thread (REQ-008)

`layoutMs` was measured, printed, and excluded from the verdict, which compared `worst.renderMs`
against the budget. That is the wrong half for this repair specifically: the fix moves a forced
layout out of the row loop, so it moves cost from the term under budget into the term that was not.
In the default matrix the excluded term is consistently the **larger** of the two — 71.1ms of layout
behind 25.7ms of render at 21 columns and 400 rows.

Observed failing first, with 5,000ms of layout injected per sample at 4 columns and 100 rows:

```
# before
  100%     4   100      2.6    2.6  5002.9  ...
list-bench: PASS — worst render 2.6ms is within the 2000ms budget          exit 0

# after
  100%     4   100      2.9    2.9  5005.7   5008.6  ...
list-bench: FAIL — 5008.6ms of blocked main thread (2.9ms render +
            5005.7ms layout) exceeds the 2000ms budget                     exit 1
```

The budget constant is unchanged at 2,000ms; what changed is what it is a budget *on*. The runner
now prints a `blocked` column, selects its worst sample by that column, and names both halves in the
verdict. `layoutMs` also became a median across repeats to match `renderMs`, because the budget adds
the two and a median plus a mean is a statistic of nothing.

**PASS.** Final state at the reported shape: `PASS — worst blocked main thread 246.6ms (82.4ms
render + 164.2ms layout)`, exit 0. The pre-fix tree through the same runner: `FAIL — 8646ms of
blocked main thread (8633.5ms render + 12.5ms layout)`, exit 1.

### AC-9 — No scaling verdict from one sample (REQ-009)

The verdict is `last.msPerRow / first.msPerRow` against a ×1.5 threshold. With one row count, last
and first are the same sample, the ratio is 1.00 by arithmetic, and the line reads LINEAR whatever
the renderer did. Observed on the pre-fix tree at `--rows=1600`, printed directly beneath a
7,462.6ms render:

```
   30%    21  1600   7462.6  7462.6    19.2  ...
  30% fill, 21 cols: LINEAR (per-row ×1.00)
```

After:

```
  30% fill, 21 cols: NO VERDICT — a slope needs two row counts and this run measured 1
```

**PASS.** The default matrix carries four row counts and still prints LINEAR at all eight shapes, so
nothing that could go red was traded away for this.

### AC-6 — Operator confirmation (REQ-006)

**NOT MET — this is the only criterion that matters and it is not mine to close.** Everything above
is a machine measuring a machine. The report was a person unable to use the application.

---

---

## 3. NO REGRESSION

Baselines from the brief, re-run from the final state:

| check | baseline | after | verdict |
|-------|----------|-------|---------|
| `npx vitest run` | 444 | 444 passed, exit 0 | unchanged |
| `verify-placement` | 186/190, 4 declared red | 186/190, 4 declared red | unchanged |
| `npm run gate` | 14 green, exit 0 | 14 green, exit 0 | unchanged |
| `npx tsc --noEmit` | — | exit 0 | clean |
| `npx eslint "tools/**/*.mjs"` | — | exit 0 | clean |
| `npm run bench:list` | — | PASS, LINEAR at all eight shapes, exit 0 | — |

`021-sheet-inline-edit-alignment` has since landed, so the `css-lane` red the first pass reported is
gone and the baseline is 14 green again. This pass took no CSS either; `styles.css` is untouched.

**Recapturing screenshots was required and is not cosmetic.** Sixteen shots declare
`src/views/list-renderer.ts` in their `sourceHashes`, so any edit to it marks them stale and turns
`screenshots-fresh` red. After `npm run screenshots`, **none of those sixteen changed by a single
byte** — which is the third demonstration of this phase's own finding that the list fixtures write
their own markup and cannot see the renderer. Six unrelated shots did change (calendar, timeline, one
popover); none of them lists the renderer as a dependency, and the churn is capture nondeterminism.

---

## 4. WHAT WAS NOT MEASURED

- **A live vault.** The bench excludes row preparation, the metadata cache, computed fields and
  relation rollups. A real database pays more per field than this reports, never less.
- **The operator's actual row count.** The freeze threshold sits between 400 and 1,600 rows on the
  desktop and above 1,600 on the phone. Which side the vault sits on was never captured, so the
  fix is justified by the shape of the curve rather than by a matching row count.
- **Expensive column types at scale.** `--kind=mixed` was run at 400 rows and cost 156ms against
  131ms for plain text, so the empty-value renderers are cheap. It was not run at 1,600.
- **Whether the desktop reservation is load-bearing at all.** It measures as redundant on the one
  shape that was checked, and that is written up in `spec.md` §8 rather than acted on. `wrap` and
  compact columns declare content-sized tracks and were not measured; they are the shapes where the
  answer could differ.
- **A wide wrapping surface, inside `verify-placement`.** It was measured — the table under AC-7 is
  a real sweep from 360px to 1,024px — but only by a probe written for this pass, not by a check
  that runs again. `verify-placement` renders the phone at 402px only, so the arm of section 5k that
  covers a wrapping line wide enough for two properties has never executed. The renderer is correct
  there and the check is written to handle it; neither statement is currently guarded.
- **A `wrap` or compact column on a wrapping line.** Both take their width from content, so the
  predicate declines to skip whenever one is present rather than trying to price it. That is the
  safe answer, not a measured one.
