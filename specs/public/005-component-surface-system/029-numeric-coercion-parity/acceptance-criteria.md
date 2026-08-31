---
title: "Acceptance Criteria: Numeric Coercion Parity"
description: "Each requirement against the number the harness produced for it, the control that moves that number, and what is still not proven."
trigger_phrases:
  - "029 acceptance criteria"
  - "coercion parity criteria"
  - "truncation criteria"
importance_tier: "critical"
contextType: "planning"
---
# Acceptance Criteria: Numeric Coercion Parity

**Provenance.** Every number below was printed by `tools/storybook/verify-placement.mjs` driving
`renderCardField` and `new CellRenderer(...).renderCell` — the shipped modules, bundled, over one
record and one column. None is copied from a diff. The before-states are not quoted from source
either: each was reproduced by putting `parseFloat` back and reading what the run printed.

**Reading.** Baseline **218/223, exit 0, 5 declared reds**. After **220/224, exit 0, 4 declared
reds** — one more check than before, because the retired `KNOWN` entry was replaced by an assertion
and a second, literal one was added.

---

## AC-1 — a row prints a value it cannot read rather than a truncation of it

**Threshold.** For a number column holding the text `1.000,24`, the cell renders exactly
`"1.000,24"`.

**Before.** `cell renders "1" for the stored text "1.000,24", want "1.000,24"`.

**After.** `cell renders "1.000,24" for the stored text "1.000,24", want "1.000,24"`.

**Why a literal and not just the comparison.** AC-2 counts disagreements, so it reports green if both
renderers ever drift the same way. This one names the string, and names the value that made the drift
dangerous: a leading-digits parse reads `1.000,24` as `1` and `1000,24` as `1.000` — both plausible,
both wrong.

**State.** Met.

## AC-2 — a card and a cell agree on the divergent sample

**Threshold.** Byte-identical text from both renderers for every value in the sample
`"1000.24"`, `"1.000,24"`, `"1000,24"`, `"12abc"`, `"abc"`, `NaN`, across number and currency
columns. **Zero disagreements out of 12 pairs.**

**Before.** `12 pairs compared, 10 disagreements: number "1.000,24" card="1.000,24" cell="1",
currency "1.000,24" card="1.000,24" cell="€ 1", number "1000,24" card="1000,24" cell="1.000",
currency "1000,24" card="1000,24" cell="€ 1.000", number "12abc" card="12abc" cell="12",
currency "12abc" card="12abc" cell="€ 12", number "abc" card="abc" cell="-", currency "abc"
card="abc" cell="-", number "NaN" card="NaN" cell="-", currency "NaN" card="NaN" cell="-"`.

**After.** `12 pairs compared, 0 disagreements`.

**State.** Met.

## AC-3 — a stored number is untouched

**Threshold.** The all-numeric sample — `1000.24`, `4975.32`, `0`, `-81.8`, `1000000`, `1.234567`,
`1500` across both column types, 14 pairs — stays at **zero disagreements**.

**Before.** `14 pairs compared across number and currency columns, 0 disagreements`.

**After.** `14 pairs compared across number and currency columns, 0 disagreements`.

**Why an unchanged number is the evidence here.** This is the blast-radius control, not a formatting
check. Both renderers short-circuit on `typeof value === "number"`, so the coercion is unreachable for
a YAML number and the count must not move. A change that reached ordinary data would move it. The
criterion is that it did not.

**State.** Met.

## AC-4 — an empty computed result keeps its placeholder

**Threshold.** A value that `isEmptyValue` accepts, or one that is only whitespace, still renders `-`
and never `0`.

**Before.** `parseFloat(String(""))` is `NaN`, which is what produced the `-`.

**After.** `hasNothingToPrint` runs before the coercion and returns `NaN` for the same inputs.

**Why this is a criterion at all.** `Number("")` and `Number(null)` are `0`. `renderCell` skips its
empty-value branch when `isReportsComputedColumn(col)` is true, specifically so an empty Reports
formula result falls through to `renderNumberValue` for the `-` there. A direct `parseFloat` → `Number`
swap would have rendered `0` on a column reporting a remaining amount, and **no check in the sample
holds an empty value**, so it would have shipped green.

**Not measured by the harness.** The sample holds no empty value, and adding one is a change to a
fixture another phase owns. Established by reading the bypass at `cell-renderer.ts:269` and the
coercion table for both functions. Recorded as reasoned, not measured — `UNKNOWN` would overstate the
doubt and "measured" would overstate the evidence.

**State.** Met, by construction rather than by a number.

## AC-5 — the check can fail

**Threshold.** Restoring `parseFloat` in `toDisplayNumber` reddens AC-1 and AC-2, and the run exits
non-zero.

**Measured.** **exit 1.** Both report `FAIL`, not `RED (declared)`:
`a card and a cell agree when the column holds text or a non-finite number` at `12 pairs compared,
6 disagreements`, and `a row prints a value it cannot read as a number rather than a truncation of it`
at `cell renders "1" for the stored text "1.000,24", want "1.000,24"`. Run at 218/224.

**Note on the count.** Six disagreements under the control rather than the original ten, because the
control restores only the coercion and leaves the narrowed fallback in place — so `"abc"` and `NaN`
still agree. That isolates the truncation, which is the defect this phase is named for.

**State.** Met.

## AC-6 — the captures this edit invalidated are refreshed

**Threshold.** `npm run gate` exits 0, read from `$?`.

**Measured.** **exit 1.** Fifteen of sixteen green; `screenshots-fresh` red with 20 stale captures,
**every one naming `src/views/cell-renderer.ts`** and no other source. That naming is the evidence of
ownership: this red is caused by this edit, not inherited.

**Why it is open rather than fixed.** The check compares source fingerprints rather than image bytes,
deliberately, so the file being edited makes them stale whether or not a pixel moved — and none
plausibly did, since no fixture holds a non-numeric string in a numeric column. Clearing it requires a
**full** capture run: `capture.mjs` rewrites the manifest only on a full run, by design, so a
`--only` run cannot clear staleness. That writes `screenshots/**`, outside this phase's declared
scope, while other phases work concurrently, and the parent's D11 asks that a recapture be looked at
by a person.

**State.** Open. `npm run screenshots`, then the gate, then eyes on the diff.

## AC-7 — nothing in the suite encoded the old behaviour

**Threshold.** `npx vitest run` exits 0 with no reduction in count, and any test asserting the
truncation is reported rather than edited.

**Measured.** `Test Files 59 passed (59)`, `Tests 450 passed (450)`, exit 0. Nothing needed changing.

**The near miss.** `reports-display.test.ts:70` asserts `formatReportsNumber` returns `-` for `null`,
`undefined`, `""`, `"not a formula result"`, `NaN` and `Infinity`. It constrains `reports-display.ts`,
which is untouched, and `formatNumber` reaches it only with an already-numeric argument. So it did not
fail — but it is the contract AC-4 is protecting, stated as a test.

**State.** Met.

---

## HARNESS-SUPPLY CLASSIFICATION

Asked of every row: *if this value came from the device instead of the harness, would the check still
pass — and could it still fail?* **It holds up. Nothing is withdrawn.**

This phase is the cleanest evidence shape in the packet, and the reason is structural rather than
careful: **it compares text, not geometry.** `"1.000,24"` is the same eleven characters on a phone, on
a desktop, under any theme, at any font size, with or without Obsidian's `app.css`, whatever
`--keyboard-height` the host publishes. None of the five channels in the supply inventory can reach a
string comparison. A pinned variable changes a colour or a length; it does not change what
`Number("1.000,24")` returns.

| # | Class | Why |
|---|---|---|
| AC-1 | Sound | A named literal through the shipped `renderCell`. The string is the assertion; there is no measured quantity for a harness to supply |
| AC-2 | Sound | 12 pairs, byte-identical text, both sides produced by bundled production modules — `renderCardField` and `CellRenderer.renderCell`. Neither is a stub, and the comparison is renderer-against-renderer rather than renderer-against-expectation |
| AC-3 | Sound | The blast-radius control, and an unchanged number is the right evidence: both renderers short-circuit on `typeof value === "number"`, so the coercion is unreachable for ordinary data and the count must not move |
| AC-5 | Sound | The negative control, observed: restoring `parseFloat` reddens AC-1 and AC-2 and the run exits 1. Red-then-green on the same instrument, in the same session |
| AC-7 | Sound | 450 tests, exit 0, and the near miss at `reports-display.test.ts:70` reported rather than edited |
| AC-4 | **Unprotected** | See below |
| AC-6 | Open, already | The stale captures name `cell-renderer.ts` and no other source, which is ownership evidence rather than inherited red |

### AC-4 is true and has no control

The claim is confirmed in source, not merely reasoned: `cell-renderer.ts:400-402` reads
`return this.hasNothingToPrint(value) ? Number.NaN : Number(value);`, so the guard does run ahead of
the coercion and an empty computed result keeps its `-` rather than becoming `0`. The row's own note
is accurate and its "Met, by construction rather than by a number" is the right label.

What it does not have is an assertion. The sample holds no empty value, so **no run of this suite can
turn AC-4 red** — and the row itself says a direct `parseFloat` → `Number` swap "would have shipped
green" for exactly that reason. That is a check-shaped gap, not a harness-supply one: no device value
is being substituted, there is simply nothing watching. It is recorded here rather than left implicit
because this phase demonstrated at AC-5 that it knows how to build the control, and the distance
between AC-4 and AC-5 is one fixture entry.

**What is owed:** one empty-value pair in the comparison sample — a `""` or whitespace value on a
Reports computed column — so the `-` is asserted rather than argued. Until then AC-4 is a correct
statement about the code with no regression protection, and a later edit to `toDisplayNumber` would
not be caught by anything in this phase.
