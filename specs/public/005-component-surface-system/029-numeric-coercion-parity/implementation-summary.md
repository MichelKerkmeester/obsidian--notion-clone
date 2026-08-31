---
title: "Implementation Summary: Numeric Coercion Parity"
description: "What landed in the cell renderer, the numbers observed red and green, and the one gate this edit turned red."
trigger_phrases:
  - "029 implementation summary"
  - "coercion parity summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/029-numeric-coercion-parity"
    last_updated_at: "2026-08-30T18:55:00Z"
    last_updated_by: "phase-author"
    recent_action: "Whole-string coercion landed; red, green and control all observed and recorded"
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
    completion_pct: 71
    open_questions:
      - "Does sorting keep a leading-digits parse now that no display surface uses one"
    answered_questions:
      - "No existing test encoded the truncation; 450 tests pass unchanged"
---
# Implementation Summary: Numeric Coercion Parity

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Status** | In Progress — code landed and verified in the harness, captures owed, device unconfirmed |
| **Completed** | Not complete |
| **Level** | 1 |
| **Landed** | 2026-08-30, no lane required; no stylesheet touched |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Two call sites in `src/views/cell-renderer.ts` — the `currency` branch of `renderCell` and
`renderNumberValue` — stopped parsing a leading numeric prefix. Both now route through three small
private methods: `toDisplayNumber` reads the whole value or returns `NaN`, `nonNumericText` prints
the value itself when it is not a number, and `hasNothingToPrint` decides which case is which.

In `tools/storybook/verify-placement.mjs` the sibling phase's `KNOWN` declaration was retired, which
turns its existing parity check into a real assertion, and one literal check was added:
`a row prints a value it cannot read as a number rather than a truncation of it`.

Nothing was created and no formatter changed. `reports-display.ts`, `euro-format.ts` and
`card-field-renderer.ts` are untouched.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Blast radius first, then red, then the edit, then the control. The stop condition in the plan was
real: had the coercion reached past hand-authored strings in a numeric column, the answer would have
been a report rather than a patch.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| The card wins | It refuses to invent a number. Deriving `1` from `1.000,24` is wrong under every locale, and no display is improved by a fabricated value. |
| Print the value, not a dash, on failure | A dash destroys the evidence that something is wrong. The reader cannot tell a bad value from a missing one. |
| Test emptiness **before** coercing | `Number("")` is `0` where `parseFloat("")` is `NaN`. `renderCell` routes an empty Reports result into `renderNumberValue` precisely for the `-`, so a direct swap would have promoted a fail-closed placeholder to a figure of `0`. |
| `Number(value)`, not `Number(String(value))` | The card coerces the value itself; stringifying first diverges on a boolean, and matching the card exactly is the point. |
| Add a literal check beside the parity check | Counting disagreements reports green if both renderers drift the same way. One check measures agreement, the other measures truth. |
| Report sorting rather than fix it | `query-engine.ts:236` is a different file and a different concern — row order, not text — and its `|| 0` collapses "not a number" and "zero" into one key. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Command | Result |
|---|---|---|
| Red, before | `node tools/storybook/verify-placement.mjs` | `12 pairs compared, 10 disagreements`; 218/223, exit 0 |
| Green, after | `node tools/storybook/verify-placement.mjs` | `12 pairs compared, 0 disagreements`; **220/224, exit 0** |
| Blast-radius control | same run | all-numeric sample `0 disagreements` before **and** after |
| Negative control | `parseFloat` restored | **exit 1**, both checks `FAIL`, `cell renders "1" ... want "1.000,24"` |
| Unit | `npx vitest run` | **59 files, 450 tests, exit 0** |
| Types | `npx tsc --noEmit` (via gate) | green |
| Gate | `npm run gate`, `$?` read directly | **exit 1** — 15 of 16 green, `screenshots-fresh` red |

The negative control is the load-bearing one. Without it the pair of checks is decoration: they would
report green against any implementation that happened to agree with itself.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

- **The gate is red and it is this edit's fault.** `screenshots-fresh` lists 20 stale captures and
  every one names `src/views/cell-renderer.ts`. The check compares source fingerprints rather than
  image bytes, so editing the file makes them stale whether or not a pixel moved. Only a full capture
  run rewrites the manifest — a `--only` run does not, by design — and that writes `screenshots/**`,
  outside this phase's scope, with the parent's D11 asking that a recapture be looked at.
- **Sorting still parses a prefix.** A row can now display `1.000,24` and sort as `1`. Pre-existing
  on every other surface and newly visible here. `spec.md` §7.
- **A third `parseFloat` remains** at `record-detail-panel.ts:407`, gating the rating, progress and
  ring styles on the same family of values.
- **The inline editor still writes a truncation.** `cell-renderer.ts:1580` parses typed input with
  `parseFloat` and validates with `Number.isFinite`, so typing `1.000,24` stores `1`. That writes
  data rather than displaying it, which makes it the more serious of the two and the one least
  suited to a drive-by.
- **`Infinity` still diverges.** A stored `Infinity` renders `-` in the cell, because
  `formatReportsNumber` fails closed on a non-finite number, and `Infinity` on the card. Closing it
  means changing `reports-display.ts`, whose test asserts that fail-closed behaviour deliberately.
  Not in the harness sample, so no check covers it.
- **Whitespace is untouched, not fixed.** A whitespace-only value renders `-` in the cell and `0` on
  the card. Left exactly as it was rather than made to agree, because agreeing would mean fabricating
  a zero from whitespace.
- **Nothing is confirmed on device.** Under the parent's D3 that is the state that closes anything.
<!-- /ANCHOR:limitations -->
