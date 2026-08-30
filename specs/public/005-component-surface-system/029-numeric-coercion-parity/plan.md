---
title: "Implementation Plan: Numeric Coercion Parity"
description: "Establish the blast radius before editing, narrow the fallback so the placeholder it exists for survives, then prove the check can fail."
trigger_phrases:
  - "029 coercion plan"
  - "whole-string coercion approach"
  - "cell renderer number plan"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Numeric Coercion Parity

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Four stages, and the first can end the phase.

Establish what the coercion touches. If it reaches beyond hand-authored strings in a numeric column,
stop and report — an unsafe fix reported is a better outcome than a shipped one nobody could show
was correct, which is the failure this packet exists to answer.

Then observe the defect red through the production renderers. Then narrow the fallback rather than
replacing it, because the `-` it prints is load-bearing somewhere the diff does not show. Then prove
the check can go red, or it is decoration.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Unit | `npx vitest run` | exit 0, no reduction in count |
| Gate | `npm run gate` | exit 0, read from `$?` and never through a pipe |
| Placement | `node tools/storybook/verify-placement.mjs` | the parity checks green; no previously-green check reddens |
| Captures | `npm run screenshots:verify` | current |

`npx vitest run` is load-bearing beyond its usual weight here. The suite is large enough that a test
may encode the behaviour being removed, and such a test is a finding to report rather than a file to
quietly edit.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**Two call sites, one rule, expressed once.** The `currency` branch and `renderNumberValue` each
carried the same two-part decision — how to read the value, and what to print when it is not a
number. Both now call `toDisplayNumber` and `nonNumericText`, which share `hasNothingToPrint`.

**The order inside the coercion is the whole design.** `hasNothingToPrint` runs before `Number()`,
because `Number("")` and `Number(null)` are `0` where the `parseFloat` they replace gave `NaN`.
Emptiness first is what keeps an empty computed result on its placeholder instead of promoting it to
a zero. The predicate is `isEmptyValue(value) || String(value).trim() === ""` — `isEmptyValue` because
`String(null)` is the printable text `"null"`, and the trim because whitespace should not become `0`.

**The coercion is `Number(value)`, not `Number(String(value))`.** The card coerces the value itself,
and matching it exactly is the point; stringifying first would diverge on a boolean.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

1. **Landed.** Establish the blast radius. Name every caller of both coercion sites and of
   `formatNumber`; check whether sorting, aggregation and footers share the path. **Stop condition** —
   if it reaches past hand-authored strings in a numeric column, report and do not edit.
2. **Landed.** Observe red. Reproduce the declared `KNOWN` divergence through the production
   renderers and record the output verbatim.
3. **Landed.** Narrow the coercion and the fallback. Read the whole value; print the value itself
   when it is not a number; keep `-` only when there is nothing to print.
4. **Landed.** Prove the check can fail. Restore `parseFloat`, confirm red, restore the fix, confirm
   green.
5. **Outstanding.** Refresh the 20 captures this edit invalidated, and have a person look at them.
6. **Outstanding.** Operator confirmation on device.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING

The assertion drives `renderCardField` and `new CellRenderer(...).renderCell` — the shipped modules,
bundled — over one record and one column. Neither renderer can make that comparison on its own, which
is why it lives in the harness rather than in a unit test.

Two checks, deliberately not one. The parity check counts disagreements and would report green if
both renderers ever drifted the same way. The literal check names the string `1.000,24` and so pins
the direction. A pair where one measures agreement and one measures truth is the only shape that
catches both failures.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Why |
|---|---|
| `019-card-field-value-formatting` | Built the card side and the parity check, and declared this divergence in `KNOWN` rather than repairing it |
| `026` render assertions | Established that a check not constructing a production renderer proves nothing; this phase inherits that standard |
| `reports-display.ts` | Unchanged, and depended on. Its `-` is reached through the empty-value bypass in `renderCell` |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK

Two files, no data migration, no stylesheet. Reverting `toDisplayNumber` to `parseFloat(String(value))`
and `nonNumericText` to `"-"` restores the previous rendering exactly; the `KNOWN` entry would then
have to come back or the run reports an unexpected fail. Nothing persists — the change is display
only, and no stored value is read or written differently.
<!-- /ANCHOR:rollback -->
