---
title: "Implementation Summary: Checkbox Ownership"
description: "Every checkbox the plugin renders now computes its own appearance rather than borrowing it from an ancestor: 211 of 211 across 12 families, 0 ancestor-owned, measured in the browser. The states matrix and the theme sweep are still unwritten, and no image is signed."
trigger_phrases:
  - "004 checkbox summary"
  - "checkbox ownership shipped"
  - "toggle switch shape shipped"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/004-checkbox-ownership"
    last_updated_at: "2026-08-30T18:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "State established from the tree: 211/211 own appearance, 0 ancestor-owned; roadmap 7.1 closed"
    next_safe_action: "Open the 16 changed PNGs and sign them off in checklist.md"
    blockers:
      - "No operator confirmation that circles are gone from board, gallery and list on device"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../../../../src/views/checkbox.ts"
      - "../../../../src/views/checkbox-family-coverage.test.ts"
      - "../../../../src/views/checkbox-borrowed-ancestor.test.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-004"
      parent_session_id: null
    completion_pct: 25
    open_questions:
      - "Can the base rule win against a hostile theme without !important; three themes still untested"
    answered_questions:
      - "db-list-row-checkbox is routed through the factory rather than deleted"
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 004-checkbox-ownership |
| **Shipped** | 2026-08-29 to 2026-08-30 |
| **Level** | 2 |
| **Status** | In Progress |
| **State** | Five of seven requirements measured green in the browser with two-sided controls. The per-state matrix and the third-party theme sweep do not exist, no image is signed off, and nothing is operator-confirmed |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

A checkbox is now the plugin's own control wherever it is mounted. It was the platform's round box in
a quarter of the places it appeared, and in the rest it only looked right because an ancestor
happened to be styling it — move the wrapper and the control changed.

| # | Delivered | Evidence |
|---|---|---|
| 1 | **One factory.** `createCheckbox(parent, { role })` at `src/views/checkbox.ts:26`, with `CheckboxRole = "row" \| "field"` — the role selects size and nothing else. 28 call sites across 17 files | `src/views/checkbox.ts:14`, `:26`; commit `65ab2b9` |
| 2 | **Appearance keyed to the control, not the ancestor.** The last live ancestor-keyed rule — the display-style popover redeclaring the whole switch under its own ancestor, drifted to a weaker border and a knob taken from the surface fill — was deleted so that popover inherits the one definition | lane entry 63; commit `c31acf5` |
| 3 | **The switch survives leaving the container.** Its radius read a token with no literal fallback, so a portalled switch computed `0px` and the pill became a square. Alignment for three switch rows was de-scoped off `.note-database-container` onto the row that travels with the control | lane entry 63; `c31acf5` |
| 4 | **`db-list-row-checkbox` resolved by routing, not deletion.** `src/views/list-renderer.ts:313-317` now creates it through the factory with `role: "row"`; the class survives as a hook and the appearance comes from the primitive | `src/views/list-renderer.ts:313` |
| 5 | **A thumb-sized switch.** Reachable at 34x18 under this phase's 28px floor; a coarse-pointer `::after` band takes it to 34x28 with the painted box unchanged, so no desktop capture moves | lane entry 63 |
| 6 | **The reorder button stopped overlapping the row checkbox.** Three rules fought over that button and a minimum-size block opened with `display: inline-flex` at the same weight as the `display: none` written later in the file, so a phone-only control rendered unstyled in every desktop list and gallery row | lane entry 64; `c31acf5` |
| 7 | **The select column re-derived.** Its own comment read `48 = button 24 + checkbox 16 + gap 8`; both controls had since grown to 28 and nobody recomputed it. `4 + 28 + 4 + 28 = 64`, matched in `getSelectionColumnWidth`'s touch branch | lane entry 64; `src/views/column-width.ts` in `c31acf5` |
| 8 | **Fixtures for the families nothing measured.** The census families that no capture fixture contained were rendered, so a green count is a count across families that actually contain a control | commits `098343f`, `4928626`, `a677e56`, `0f89218` |

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `src/views/checkbox.ts` | Created | The factory and its two size roles |
| `src/views/list-renderer.ts` | Modified | List-row checkbox routed through the factory |
| `src/views/column-width.ts` | Modified | Select column derived from what it holds, 48 -> 64 on touch |
| `styles.css` | Modified | Appearance keyed to the control; switch radius fallback; coarse-pointer band |
| `src/views/checkbox-family-coverage.test.ts` | Created | Every call site has a fixture; the switch is the only control outside the factory |
| `src/views/checkbox-borrowed-ancestor.test.ts` | Created | No creation site relies on a parent for its appearance |
| `tools/screenshots/scenarios/shared.mjs` | Modified | Fixtures for the families no capture contained |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Four lane holds across two days: `2026-08-29` 18:12-19:20 (the primitive), 21:25-21:35 (switch base
rules re-keyed), 21:45-22:20 (contrast, knob colour, disabled grey, phone menu targets), and
`2026-08-30` 07:57-08:16 (the four verifier findings and the reorder-button overlap). Commits
`65ab2b9`, `2e02019`, `1cc397c`, `098343f`, `4830275` and `c31acf5`.

**The churn was attributed rather than assumed, and the byte floor was measured first.** Lane entry
65 records two capture runs over identical sources moving 13 PNGs and 0 `layoutHash`es — so
`layoutHash` is the signal and bytes are not. The stylesheet edits were then reverted, captured,
restored and captured again: 16 files across 7 scenarios moved, each explained. **No switch surface
moved at all**, which is what those three edits predicted — the coarse-pointer band paints nothing,
and the other two change no computed value inside the container.

Each of the four repairs in the last hold was shown failing on its own before it was fixed: the two
halves of the portable-switch fix were separated and each reproduced the square pill independently.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Route `db-list-row-checkbox` through the factory rather than delete the class | REQ-005 permits either. The class is a behavioural hook the row logic reads; deleting it would have been a second change to prove. Routing gives the input the plugin's box and leaves the hook alone |
| The switch is the one control built outside the factory, and a test enforces it | A ninth raw creation site would be a family with no role and no shared appearance contract — invisible to both other checks. `checkbox-family-coverage.test.ts:248` fails on any new bare checkbox while allowing a known switch site to move file |
| Widen the switch's reach with a pseudo-element, not its painted box | 34x18 is the shape; growing the box to 28px tall would move every desktop capture. A coarse-pointer `::after` band hit-tests as the control and paints nothing |
| Leave the off-track fill unchanged when raising the switch boundary to 3:1 | Measured: no value satisfies the panel background and the on-state together. The boundary moved onto a control token that clears 3:1 in both themes; the fill was left, deliberately |
| Derive the select column from its contents rather than patch the number | The stale `48` was a derived value written in a comment that nothing recomputed when both controls grew to 28. The width now follows from what is in it, and `getSelectionColumnWidth`'s touch branch matches |
| Count one live defect among the ancestor-keyed rules, not the whole class | Only one unguarded ancestor-keyed appearance rule was still live. Calling the guarded ones fixes would inflate the phase |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

Run from the final state on 2026-08-30, exit codes read from `$?` without a pipe.

| Gate | Result |
|---|---|
| `npm run gate` | **16 green, 0 red, exit 0** |
| `node tools/storybook/verify-placement.mjs` | **218/223, 5 red for a declared reason, exit 0** at commit `ff3d241` — none of the five is a checkbox check. Any 212/216 in this packet predates `ff3d241`, which added seven card/cell numeric-formatting checks |
| `npx vitest run src/views/checkbox-family-coverage.test.ts src/views/checkbox-borrowed-ancestor.test.ts` | **2 files, 13 tests passed, exit 0** |

### The measured outcomes

| Property | Number, quoted from the run |
|---|---|
| Ownership | `211/211 controls across 12 families compute appearance:none` |
| Ancestor ownership | `appearanceOwnedByAncestor: 0` of 211, across 57 fixtures — `tools/live/checkbox-appearance.json`, measured `2026-08-30T16:12:15Z` |
| Row role shape | `181 controls across 10 families take 1 distinct shape(s): 16x16 r=4px` |
| Field role shape | `20 controls across 2 families take 1 distinct shape(s): 18x18 r=4px` |
| Switch shape | `10 controls across 1 families take 1 distinct shape(s): 34x18 r=9999px` — the pill, not the square it computed outside the container |
| Row reach | `painted 28x28, reachable 38x38 (want >= 28 on both axes)` |
| Field reach | `painted 28x28, reachable 38x38` |
| Switch reach | `painted 34x18, reachable 34x28` |
| Desktop overlap | `no reorder button is shown in 11 select cells, so nothing can collide — the table creates this button only on touch` |
| Phone overlap | `11 cells show both; narrowest gap 4px in a 65px cell` — was -14px in a 49px cell |
| Select-column parity | `right clearance takes 1 distinct value(s): 7px — the header and every row must coincide` |

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

**`roadmap.md` §7.1 records this phase's state as UNKNOWN with three sources disagreeing. Two of
the three are now settled from the tree, and the third was misread.**

| §7.1 source | Claim | What the tree says |
|---|---|---|
| Lane entry 63 | ancestor-keyed rules `1 -> 0`; toggles losing a property `10/10 -> 0/10`; switch `34x18 -> 34x28` | **Corroborated.** `checkbox-appearance.json` reads `appearanceOwnedByAncestor: 0`; the harness reads `painted 34x18, reachable 34x28` |
| Verifier | FAIL — 10 toggles still ancestor-owned; hit target 37x24 against a 28px floor; board, gallery, table and list fixtures contain zero checkboxes | **Refuted on all three, and stale.** 0 ancestor-owned; the reach is 34x28, not 37x24; and those fixtures now hold checkboxes — board-view 28, board-mobile 28, gallery-view 4, list-view 24, list-mobile 12, table-view 25, table-mobile 13, chrome-table-footer 25 |
| `acceptance-criteria.md` | AC-001 to AC-013 all "Unmet" | **Not a contradiction — a baseline nobody advanced.** Every "Measured today" cell is dated **2026-08-29** and describes the pre-fix tree: "23 of 84 checkboxes fall back to the platform box", "61 of 61 owned checkboxes lose their appearance when one named ancestor's class is removed". Those are the recorded failing numbers decision D2 requires, not a verdict on the fix |

The roadmap also says those evidence cells are blank. **They are not empty cells.** They carry the
literal text *"blank — see the F16 provenance table below"*, which is prose about a missing
measurement. A markdown parse finds no empty data cell in this file, which is why the parent
`goal.md` records this phase as scoring zero on that criterion.

**So the disagreement is resolved, with one caveat: the tree moved while it was being read.**
`verify-placement.mjs` carried an uncommitted diff from another phase at the first run and was
committed as `ff3d241` before the second. Both runs report the same checkbox numbers, and
`tools/live/renderer-coverage.json` is still uncommitted. §7.1's stated settlement condition — a run
from a quiet tree — is therefore met for the checkbox arms specifically, which is what it was asked
to settle, rather than for the whole tree.

**AC-001 to AC-013 are still written Unmet, and this summary does not change them.** They are
`acceptance-criteria.md`'s to close, each against its named negative control, and several of those
controls have never been run.

**REQ-004 has no assertion anywhere.** Checked, indeterminate, disabled and focus rendering a
measurably different box per family is asserted by no placement check and by neither unit test. The
grep for those state names across the placement run returns nothing. **UNKNOWN** — settled by adding
a per-family state matrix.

**AC-005's theme sweep does not exist.** Three third-party themes, at least one restyling native
checkboxes, have not been loaded. The open question the spec raises — whether the base rule can win
against a hostile theme without `!important`, given REQ-002 forbids an ancestor and therefore keeps
specificity low — is unanswered. **UNKNOWN** — settled by running the sweep.

**Nothing is ticked and no image is signed.** `tasks.md` carries 0 of 28 tasks checked and
`checklist.md` 0 of 40. The lane's first release note already recorded "per-image sign-off still
owed by the operator", and 16 changed PNGs from the last hold are still unsigned.

**`tasks.md` has duplicate task ids.** T20 and T21 each appear twice — once in the census stage and
once in the verification stage, naming different work. Recorded rather than renumbered: this
summary does not edit the task list.

**Three dead blocks remain in the stylesheet.** The select-column appearance block and its modal and
CSV-option equivalents are still guarded `:not(the shared checkbox class)` and are therefore dead
code. Nothing is visibly missing because the shared component supplies all of it, but the next
reader will believe they are live. Removing them is a separate, capture-affecting change; it is
outstanding item 4 in `tools/lane/css-lane.json`.

**Not operator-confirmed.** T25 — confirm on device that circles are gone from board, gallery and
list — has not happened. Per decision D3 that is the only thing that closes this phase, which is why
`completion_pct` stays at **85** rather than moving: five of seven requirements are measured green
with two-sided controls, REQ-004 and the theme sweep are unbuilt, and no device has seen it.

<!-- /ANCHOR:limitations -->
