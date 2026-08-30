---
title: "Feature Specification: Mobile Touch Semantics in the Table"
description: "Give a touch in the table the meaning a touch has, rather than replaying the desktop pointer grammar: a tap edits the cell it lands on, a tap on the row's main item opens the record sheet, and dragging does not paint a selection range."
trigger_phrases:
  - "mobile touch semantics"
  - "tap to edit cell"
  - "range select on touch"
  - "drag selection phone"
  - "012 touch"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/012-mobile-touch-semantics"
    last_updated_at: "2026-08-30T09:12:00Z"
    last_updated_by: "sk-design"
    recent_action: "Code and harness half of the verifier findings landed: title tap shared by both table hosts, real title-ness in the cell renderer, selection paint deferred, 45 tracker ids stripped from comments, sheet grab band stopped at its own header, rename named in the row menu; 88 placement checks, 87 pass, 1 declared red"
    next_safe_action: "Operator decision on phone row height (44px target is unreachable from CSS: measured 33px reach, cell clips overflow and the row below owns the boundary) and on a taller sheet header (48px grab band does not fit above 33px of chrome); then one recapture covering the select-checkbox pin and this lane"
    blockers:
      - "screenshots-fresh red: 204 captures stale against styles.css, edited by 014 without recapture; gate exits 1 at 12/13"
    key_files:
      - "spec.md"
      - "device-range-select-on-touch.png"
      - "device-sheet-from-row.png"
      - "acceptance-criteria.md"
      - "../../../../src/views/table-cell-gesture.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-012"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Should a phone row be raised to 44px, against the user's density setting?"
      - "Should a second row-checkbox tap stop selecting the range between them?"
      - "Phone title rename has no reachable entry point; only dblclick and type-to-edit reach it (spec.md 6.2)"
    answered_questions:
      - "Whether both pointer owners route a title tap to the sheet: they do now. setupTitleCellTap moved to shared table-record-peek and is bound by both; isTitleCell keys off visible column order (acceptance-criteria.md 5.1)"
      - "Where the phone predicate belongs: nowhere. Input keys off per-event pointerType; isTouchDevice stays layout and isMobileBottomSheet stays presentation, and their 760/600 disagreement is correct."
      - "What painted the range: two taps, not a drag. Drag was already disabled on touch."
      - "How many pointer owners: two, not three. table-renderer binds no cell selection."
---
# Feature Specification: Mobile Touch Semantics in the Table

> Phase chain: parent [`../spec.md`](../spec.md). Sibling `011-mobile-menu-presentation` established
> that a phone needs its own presentation for menus; this is the same argument one layer down, for
> input rather than for surfaces.

## 1. THE REPORT

`device-range-select-on-touch.png` shows the table on a phone with a **selection range painted
across seven rows and two columns — 14 cells**, produced by a finger. The operator did not ask for a
range and has no way to act on one — the surrounding grammar (shift-click, drag-to-extend, copy a
block) is a desktop grammar with no touch equivalent in this plugin.

The 14 is measured off the image rather than counted by eye. The file is 1206 by 2622 device pixels,
which is a 402 by 874 CSS viewport at DPR 3. The block's outer border runs `y 1116-1121` at the top
and `y 1824-1829` at the bottom, so its border box is 714 device pixels — **238 CSS pixels, exactly
seven 34px rows**. Seven labels are enclosed: `33 • Sep '27`, `15 • Mar '26`, `03 • Mar '25`,
`17 • May '26`, `31 • Jul '27`, `13 • Jan '26`, `32 • Aug '27`. The columns are **Month** and
**Income**; `Expenses` sits outside the right border.

What the operator asked for instead, in their words:

> *"on mobile a tap in a cell will open edit state of that column. For the main item it will open
> the sheet (report item)."*

So: **a tap edits the cell it lands on. A tap on the row's title cell opens the record sheet.**
`device-sheet-from-row.png` is that sheet.

## 2. WHAT TO ESTABLISH BEFORE CHANGING ANYTHING

This is an input-semantics change across a surface with several pointer owners, and the failure mode
is binding a new meaning on top of an old one rather than instead of it.

- **Inventory every pointer entry point the table binds** before touching one. Range selection is
  referenced from `table-renderer.ts`, `database-view.ts` and `embedded-database-renderer.ts`; a fix
  applied in one of the three leaves the other two contradicting it. Long-press is already bound for
  the row menu (`attachLongPress`), so the gesture space is not empty.
- **Decide where the phone predicate belongs.** `isMobileBottomSheet(doc)` exists in
  `popover-position.ts` and is exported. Whether input should key off the same predicate as
  presentation is a real question, not a formality — a tablet with a pointer is the case that
  distinguishes them.
- **Establish what a tap currently does**, per column type, before deciding what it should do. Some
  cells already open an editor on tap; the defect may be narrower than "touch does the wrong thing".

## 3. CONSTRAINTS

- **Desktop must not change.** Range selection, shift-click and drag-to-extend are correct there and
  are covered by existing checks.
- **Do not remove the long-press row menu.** It is the only path to several row actions on a phone.
- A tap that opens an editor must not also scroll the table, and must not fight the sheet's own
  dismissal once one is open.
- Whatever is bound must be measurable without a device: the check has to drive the production
  handler, not a reproduction of it.

## 4. WHY THIS IS NOT COSMETIC

A painted range on a phone is not merely useless — it is a state the user cannot see the extent of,
cannot clear except by tapping elsewhere, and which changes what the next tap does. That is the
shape of a defect that produces "the app did something I did not ask for and I cannot undo it".

## 5. ACCEPTANCE CRITERIA

Written by the phase. Each needs a number or a hit test with a threshold, shown failing first, a
check that drives the production path, and an image a person opened.
See [`acceptance-criteria.md`](acceptance-criteria.md).

## 6. WHAT THIS REMOVES

Giving the whole title cell one meaning takes two behaviours away from a phone. Both follow from the
operator's sentence, and neither was stated anywhere until now. They are removals, so they are
recorded as removals rather than folded into the description of what was added.

### 6.1 A tap on the note name no longer opens the note

`setupTitleCellTap` (`table-record-peek.ts`, bound by both renderers) binds `click` on the `<td>`
**in the capture phase**. The note name is an `<a class="internal-link">` built by
`cell-renderer.ts`, a descendant of that cell, with its own `click` handler calling `openNote`.
Capture reaches the cell before the target, so on a touch gesture the handler resolves
`open-record`, calls `preventDefault()` and `stopPropagation()`, and the link's handler never runs.
Established by reading both handlers and the binding's third argument; the code carries the same
rationale in its own comment.

**A mouse is unaffected.** `resolveCellTapAction` returns `select-cell` for `mouse`/title, and the
handler returns on that before it stops anything, so the link keeps opening the note on a click.

**The replacement path** is the sheet's own header control: a `maximize-2` button labelled
`menu.openNote` (`record-detail-panel.ts`) that opens the record's note and closes the sheet. So the
note is one tap further away on a phone, not unreachable.

### 6.2 The title cell's rename editor is unreachable by tap on a phone

Renaming is bound to `dblclick` in the cell (the tooltip is literally `cell.doubleClickRename`) and
a phone has no second click — that much predates this phase. What this phase adds is that the
single tap, which previously fell through to `cell-renderer`'s own click handler, is now consumed by
the capture-phase handler in §6.1.

**There is no touch replacement, and this is the part worth flagging.** `editFileName` has three
call sites, and the two gestures that reach them are **double-click** (the cell's own `dblclick`
handler, and the sheet's title in `record-detail-panel.ts`) and **keyboard type-to-edit**
(`beginEditWithText`). A phone has neither. Routing through the sheet does not recover it, because
the sheet's title is bound to `dblclick` too, and the long-press row menu has no rename entry.

So on a phone the rename editor now has **no reachable entry point at all**. Whether that is
acceptable is an open question, not a decision this phase took.
