---
title: "Goal: Numeric Coercion Parity"
description: "The durable directive for how a row reads a numeric column, and the criteria that decide when it is done."
trigger_phrases:
  - "029 goal"
  - "coercion parity goal"
  - "numeric truncation directive"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/029-numeric-coercion-parity"
    last_updated_at: "2026-08-30T18:50:00Z"
    last_updated_by: "phase-author"
    recent_action: "Cell coercion switched to whole-string; 10 harness disagreements closed to 0"
    next_safe_action: "Refresh the 20 stale captures with npm run screenshots, then read them"
    blockers:
      - "screenshots-fresh is red on 20 captures this edit invalidated; the refresh writes outside this phase's scope"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-029"
      parent_session_id: null
    completion_pct: 85
    open_questions:
      - "Does sorting keep a leading-digits parse now that no display surface uses one"
    answered_questions:
      - "The card wins: a prefix parse invents a number the note does not hold"
      - "A stored number short-circuits both paths, so ordinary data is untouched"
---
# Goal: Numeric Coercion Parity

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A row prints the value the note holds, or says it cannot read it. It never prints a
plausible substitute.

**Why.** A numeric column holding `1000,24` rendered `1.000` in the table row — a figure that looks
correct and is wrong — while the card beside it rendered the text unchanged. `1.000,24` rendered as
`1`. A wrong number nobody can see is wrong is worse than an unformatted one, because the reader has
no reason to check it.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The card is correct. Refusing to invent a number outranks always producing one. |
| D2 | Read the whole value or none of it. A leading-digits parse is banned on display surfaces. |
| D3 | Failure prints the value, not a dash. A dash destroys the evidence that something is wrong. |
| D4 | Emptiness is tested before coercion. `Number("")` is `0`; the placeholder it would replace is load-bearing. |
| D5 | A neighbouring defect outside this scope is reported with its file and line, never patched from here. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

The parent packet's `goal.md` outranks this document. Its D1 governs the evidence here — the checks
construct both production renderers — and its D3 governs closure: shipped, verified and
operator-confirmed are three states, and only the third closes anything.

Sorting, the record detail panel, the editor's write path and the card itself are named in
`spec.md` §3 and §7 and are not this phase's to change.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] No display surface parses a leading numeric prefix. Measured: **10 disagreements → 0**.
- [x] A stored number is untouched. Measured: the all-numeric sample held **0 disagreements** before
      and after.
- [x] The check can fail. Measured: restoring `parseFloat` gave **exit 1**, both checks `FAIL`.
- [x] An empty computed result keeps its placeholder rather than gaining a `0`.
- [x] The unit suite is unreduced. Measured: **450 tests, exit 0**; none encoded the old behaviour.
- [ ] `npm run gate` exits 0, read from `$?`. Today **exit 1**: 20 captures fingerprint the edited
      file. Owned by this edit, and the refresh writes outside this phase's scope.
- [ ] The operator sees a hand-authored numeric field read as written, on device.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Volatile. Not part of the directive.

### What the measurement changed about the plan

The obvious fix — swap `parseFloat` for `Number` — is wrong, and the harness would not have caught
it. `parseFloat("")` is `NaN`; `Number("")` is `0`. `renderCell` deliberately skips its empty-value
branch for the Reports computed columns so an empty formula result falls through and picks up the
`-` in `renderNumberValue`. A direct swap would have turned that fail-closed placeholder into a
figure of `0`, on a column whose whole purpose is to report a remaining amount. No check in the
sample holds an empty value, so it would have shipped green.

That is the second time in this packet a green run has meant nothing about the case that mattered.
The emptiness test now runs before the coercion.

### The table cell was the minority of one

Four surfaces already read numbers whole through `toChartNumber` — the footer, rollups, charts and
the view model — and `relation-rollup.ts:204` records that a "regex strip-and-parse" was deliberately
replaced by it. The card made five. The table cell was the only display surface still parsing a
prefix, so this is a straggler being brought in line rather than a new convention.

### Sorting still parses a prefix, and that is now visible

`query-engine.ts:236` reads `parseFloat(stringifyValue(val)) || 0`, so a row can display `1.000,24`
and sort as `1`. The divergence is not new — every surface except the table cell already displayed
these values whole while the sort parsed a prefix. The cell was the one surface agreeing with the
sort, and it agreed by being wrong. What changed is that the disagreement is now visible where
someone will notice it. Left alone deliberately: it changes row order rather than text, and its
`|| 0` collapses "not a number" and "zero" into one key, which is a wider decision.

### Two neighbouring defects, reported not touched

`record-detail-panel.ts:407` carries a third `parseFloat` on the same family of values, gating only
the rating, progress and ring styles. And `cell-renderer.ts:1580` parses typed input with
`parseFloat` before a `Number.isFinite` check, so typing `1.000,24` into a cell validates and
**stores `1`**. That one writes data rather than displaying it, which makes it the more serious of
the two and the one least suited to a drive-by.

### The gate red is mine

`screenshots-fresh` lists 20 stale captures and every one names `src/views/cell-renderer.ts`. The
check compares source fingerprints rather than image bytes, on purpose, so editing the file makes
them stale whether or not a pixel moved — and these pixels almost certainly did not, since no fixture
holds a non-numeric string in a numeric column. Clearing it needs a **full** capture run: a `--only`
run does not rewrite the manifest, by design, so it cannot clear staleness. That writes
`screenshots/**`, which this phase does not hold, in a repository where other phases are working
concurrently, and the parent's D11 wants a person to look at a recapture. Reported rather than run.
<!-- /ANCHOR:log -->
