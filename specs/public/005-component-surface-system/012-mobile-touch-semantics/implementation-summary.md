---
title: "Implementation Summary: Mobile Touch Semantics in the Table"
description: "A touch in the table now means what a touch means. The gesture is read from the event rather than the device, and the 44px row height is a declined criterion with its shortfall on record."
trigger_phrases:
  - "012 touch semantics summary"
  - "tap edits cell shipped"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/012-mobile-touch-semantics"
    last_updated_at: "2026-08-31T18:30:00Z"
    last_updated_by: "sk-design"
    recent_action: "Title-cell check rebuilt on the real opener; four controls installed"
    next_safe_action: "Operator drags a finger across the table on device"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-012"
      parent_session_id: null
    completion_pct: 80
    open_questions: []
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 012-mobile-touch-semantics |
| **Shipped** | 2026-08-30 |
| **Level** | 1 |
| **State** | Shipped and harness-verified; gate 20 green at exit 0. Every check in this phase's section now carries a recorded red. Not operator-confirmed |

<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A tap in the table now selects the cell it lands on. Before this, a second tap anywhere painted a
rectangle of selected cells between it and wherever you last touched, because a finger was running
the desktop pointer grammar with the anchor preserved on every press — shift-click with no way to
stop holding shift.

A tap on the row's main item opens the record sheet, and it does so across the whole cell rather than
through the 24px icon that was previously the only way in. Which cell counts as the main item is
decided by visible column order, so it stays correct when the note-name column is hidden.

The record sheet's grab band no longer steals its own header. It had been answering every press aimed
at the title and cutting both 44px header actions down to 26px of reachable area — and since renaming
opens on a double-click, the second tap never arrived, which is why renaming appeared to have been
removed on a phone.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `src/views/table-cell-gesture.ts` | Created | One home for the press-grammar decision, read from `pointerType` |
| `src/views/table-record-peek.ts` | Modified | Title-cell tap shared by both table hosts; main-item-ness from visible column order |
| `src/views/database-view.ts` | Modified | Routes cell presses through the shared module |
| `src/views/embedded-database-renderer.ts` | Modified | The same, so the two hosts cannot drift apart again |
| `styles.css` | Modified | One block: the record sheet's grab band stops at its own header |
| `tools/storybook/verify-placement.mjs` | Modified | Seven checks, each demonstrated red first |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The phase opened with an inventory rather than a fix, and three of its four findings changed what got
built. The range was being painted by two taps and not by a drag, which meant the drag path was
already correct and did not need touching. There were two pointer owners rather than three. And the
record sheet was already reachable — through a target 24px wide, which reframed the work from "add a
way in" to "widen the one that exists".

The decision about where the grammar lives was settled by measurement, not preference. The plugin
already had two device predicates and they disagree; both are right, because one is about layout and
the other about presentation and neither is about input. A mouse-driven split pane under 760px reads
as touch, and a tablet with a trackpad needs two answers on one device. `pointerdown` carries
`pointerType` and is dispatched before the synthesised mouse events, so reading it there is correct
by construction rather than by tuning a threshold.

Every check was installed with a control and watched failing before it was trusted — seven of seven.
Capture churn was measured rather than assumed: a run with no source change at all moves four PNGs,
so four is the floor, and none of the movers is a table or field capture.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|---|---|
| Read the gesture from `pointerType` on the event, not from a device predicate | No device predicate can answer it. A narrow pane reads as touch with a mouse attached, and a tablet with a trackpad needs two answers at once. The event is dispatched on the same target before the compatibility mouse events, so a mouse keeps the pointer grammar at every width by construction |
| Put the decision in one shared module | Two files had independently decided that touch means shift is held. The branch is what drifted, so the branch is what got a single home |
| Key main-item-ness on visible column order | A name-based test breaks the moment the note-name column is hidden, which is a supported configuration |
| Escalate the row height instead of gating on it | The floor is unreachable from CSS at any density, and density is a preference the reader sets. Gating on a number the change cannot reach would have made the criterion decorative |
| Revert the thumb-target expansion rather than ship it | It measures as a no-op: the cell clips its overflow so the pseudo-element is cut back, and the next row's area starts exactly where this one's box ends. A rule that measures as a no-op advertises a fix that is not there |
| Leave the row-checkbox range defect alone and record it | Removing it without a replacement gesture would have left a phone unable to range-select rows at all. Recorded so the successor phase inherited a finding rather than a rediscovery |
| Record the gate as FAIL despite the red belonging elsewhere | Attribution explains a red; it does not clear one. Claiming it would absorb another phase's unrecaptured stylesheet edit, which this lane's own history explicitly forbids |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|---|---|
| AC-1 a tap never extends | **PASS.** A harness span of 8 rows by 2 columns gave 16 cells; now 1, anchor equal to focus |
| AC-2 a mouse still extends at 390px | **PASS.** 24 cells across 8 rows by 3 columns, anchor held at `file.name` |
| AC-3 the reader routes real events | **PASS.** rest=mouse, touch=touch, mouse=mouse, pen=touch — four values from one binding |
| AC-4 the tap truth table | **PASS. 5 of 5 rows** |
| AC-5 the whole title cell opens the record | **PASS, and the outcome half now measured.** A press at the bare-cell point resolves to `open-record`, and the shipped `openRecordDetailPanel` builds a real sheet: `held "note-5.md"`, title `34`, 2 field rows, `390x189`, `db-mobile-bottom-sheet`, and a different row opens a different record. The 40px figure is restated at the dynamically located point — bare cell exists only 1px left of the button |
| AC-6 a tap does not fight the sheet | **PASS.** Cell centre resolves to the scrim with `pointer-events: auto`; control observed red |
| AC-6b a tap does not scroll the table | **UNVERIFIED.** Not measurable without a live Obsidian `App` |
| AC-7 the long-press row menu survives | **PASS.** 100ms fires 0; 600ms fires 1 |
| AC-8 the phase gate | **PASS, 2026-08-31.** `gate: PASS — 20 green, 0 red for a declared reason`, exit 0 read from `$?`. The `screenshots-fresh` leg that held it at exit 1, 12 of 13 is green; the earlier reading and its attribution are kept in `acceptance-criteria.md` §4.2 as the record of that run |
| Controls | **11 of 11 observed red.** Seven were tabulated in §4.1; the section had grown to eleven, and the four missing controls were installed and watched on 2026-08-31. Provenance is now machine-checked by `PHASE_CONTROLS` in `verify-placement.mjs` rather than asserted in prose |
| Placement, last run | 240 checks, 238 green, 2 red for a declared reason, exit 0 |
| Row height against the thumb floor | **DECLINED by the operator with the shortfall stated.** 34px default, 40px at the loosest, against 44px. WCAG 2.5.8's 24px AA met; 2.5.5's 44px AAA not met |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The 44px thumb target is a declined criterion, not an achieved one.** The default row is 34px
   and even the loosest density is 40px. The number is confirmed three independent ways — the
   stylesheet's density values, the operator's screenshot at a 102 device-pixel row pitch at DPR 3,
   and the harness rendering the title cell at 169×34 on every run. The operator was shown the
   shortfall and chose density, because raising it would override a preference the reader set. The
   harness reports the 33px reach on every run so the number stays visible.

2. **AC-6b was never measured.** Whether a tap that opens an editor also scrolls the table needs a
   live Obsidian `App`. It is recorded as UNVERIFIED rather than passed.

3. **The phase gate held at exit 1 on another lane's red, and that leg has since gone green.** 204
   captures were stale against a stylesheet edit this phase did not make and a lane it never held.
   The red was left with its owner rather than cleared by attribution; the 2026-08-31 run reads 20
   green at exit 0. The scoping objection survives the green: a per-phase criterion keyed to a
   whole-tree number is hostage to every other lane, and it will go red again for reasons this phase
   neither causes nor can repair.

4. **This phase's own evidence contained an overclaim, now corrected.** The AC-1 control was said to
   reproduce the operator's screenshot "exactly". The control gives 8 rows by 2 columns and the
   screenshot measures 7 by 2. The repair is unaffected — the defect was never the block's height —
   but the word was wrong and is recorded as having been wrong.

5. **The grab band's height is disputed across the program.** This phase measured 35px after its
   edit; a later audit measured 32px on the shipped build and derived it from the stylesheet's
   arithmetic. Four heights are on record. The parent roadmap carries the conflict and notes that the
   operator's accepted trade-off does not depend on which is right.

6. **Row-checkbox range selection still carried the same defect when this phase closed.** It was
   deliberately out of scope and was handed to the successor phase rather than fixed here.

<!-- /ANCHOR:limitations -->
