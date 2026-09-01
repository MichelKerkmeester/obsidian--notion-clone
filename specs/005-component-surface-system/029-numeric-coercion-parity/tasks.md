---
title: "Task Breakdown: Numeric Coercion Parity"
description: "One task per requirement, each closing on a number that was read or a command whose exit status was read."
trigger_phrases:
  - "029 coercion tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Numeric Coercion Parity

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**No task closes on "looks right".** Each evidence line names a number that was read or a command
whose output and exit status were read. A pipe makes `$?` the pipe's status, so the gate is run
without one.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: ESTABLISH THE BLAST RADIUS

- [x] **T1** Confirm a stored number never reaches the coercion — REQ-003. **Stop condition.**
      *Evidence:* both sites read `typeof value === "number" ? value : <coerce>`, so a YAML number
      short-circuits. Held against the harness rather than the source alone: the all-numeric sample
      of 14 pairs read **0 disagreements** before and **0** after.
- [x] **T2** Name every caller of the two sites and of `formatNumber` — REQ-003.
      *Evidence:* `renderNumberValue` has three callers — `renderCell`'s `number` branch and two in
      `editNumber` that re-render an unchanged value on cancel or no-op; none reads the coerced
      number. `formatNumber` has one caller, `cell-renderer.ts:406`, already holding a number.
- [x] **T3** Check whether sorting, aggregation and footers share this path — REQ-003.
      *Evidence:* they do not. Footer, rollups and charts read through `toChartNumber`
      (`chart-aggregation.ts:217`), already whole-string `Number()`. Sorting is separate and still
      parses a prefix: `query-engine.ts:236`. Recorded in `spec.md` §7 as a finding.
- [x] **T4** Find what depends on the `-` — REQ-004.
      *Evidence:* `renderCell` bypasses its empty-value branch for `isReportsComputedColumn(col)` so
      an empty Reports result reaches `renderNumberValue` for its `-`. `Number("")` is `0` where
      `parseFloat("")` is `NaN`, so this decided the shape of the fix rather than being discovered
      by it.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

- [x] **T5** Observe the defect red through the production renderers — REQ-001, REQ-002.
      *Evidence:* `12 pairs compared, 10 disagreements`, including
      `number "1.000,24" card="1.000,24" cell="1"`. Run at 218/223, exit 0, 5 declared reds.
- [x] **T6** Read the whole value or none of it — REQ-001.
      *Evidence:* `toDisplayNumber` in `cell-renderer.ts`; both call sites route through it.
- [x] **T7** Print the value itself when it is not a number, and `-` only when there is nothing to
      print — REQ-001, REQ-004.
      *Evidence:* `nonNumericText` and `hasNothingToPrint`; emptiness is tested before the coercion.
- [x] **T8** Retire the `KNOWN` entry and add a literal check — REQ-002.
      *Evidence:* the entry is gone; `a row prints a value it cannot read as a number rather than a
      truncation of it` asserts the string `1.000,24`.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T9** Observe green — REQ-001, REQ-002, REQ-003.
      *Evidence:* `12 pairs compared, 0 disagreements`; the literal check reads
      `cell renders "1.000,24" ... want "1.000,24"`. Run at **220/224, exit 0**, 4 declared reds.
- [x] **T10** Prove the check can fail — REQ-005.
      *Evidence:* restoring `parseFloat` gave **exit 1** with both checks `FAIL`, not
      `RED (declared)`: `6 disagreements` and `cell renders "1" ... want "1.000,24"`. Restored after.
- [x] **T11** Run the unit suite and report anything encoding the old behaviour — REQ-003.
      *Evidence:* `59 files, 450 tests passed`, exit 0. Nothing asserted the truncation.
- [x] **T12** Run the gate without a pipe — REQ-006.
      *Evidence:* exit 1. 15 of 16 green; `screenshots-fresh` red on 20 captures, every one naming
      `src/views/cell-renderer.ts`. Owned by this edit, not inherited.
- [B] **T13** Refresh the captures this edit invalidated — REQ-006.
      *Blocked:* only a full capture run rewrites the manifest, and that writes `screenshots/**`,
      outside this phase's declared scope. The parent's D11 wants a person to look at a recapture.
      *Evidence to close:* `npm run screenshots` then `npm run gate` exit 0, captures eyeballed.
- [ ] **T14** Operator confirms on device — SC-003.
      *Evidence to close:* a hand-authored numeric field reads as written in the table row.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION

Twelve of fourteen closed. T13 is blocked on write scope rather than on knowledge — the command is
known and the reason it is not run is recorded. T14 is the only one no harness can answer, and under
the parent's D3 it is the one that closes anything.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](./spec.md) §7 — the blast radius, and sorting as a finding
- [`acceptance-criteria.md`](./acceptance-criteria.md) — each criterion against its measured number
- [`../019-card-field-value-formatting/spec.md`](../019-card-field-value-formatting/spec.md) — the
  card side, and the parity check this phase closes
<!-- /ANCHOR:cross-refs -->
