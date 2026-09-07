---
title: "Implementation Summary: Notion Sheet Refinement"
description: "Both legs landed: the tap that edits instead of selecting, the long-press entry, the anchored pill and its clamp, the ··· overflow, every editor claiming the bottom dock, and the confirm's declared card frame — verified live, gate green at 26/26."
trigger_phrases:
  - "061 implementation summary"
  - "notion sheet refinement shipped"
  - "cell menu landed"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/061-notion-sheet-refinement"
    last_updated_at: "2026-09-07T08:30:00Z"
    last_updated_by: "landing-verification"
    recent_action: "T008 and T012 closed; dock claim + focus-path selection fix, gate 26/26"
    next_safe_action: "AC-005 in the operator's own sitting, shared with 067 AC-011"
    blockers:
      - "AC-005 is the operator's own read, in the same sitting as 067 AC-011"
      - "AC-007 stays parked (ADR-006) behind an Anytype multi-section re-read the operator schedules"
    key_files:
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "src/views/record-surface/cell-editor-date.ts"
      - "src/views/record-surface/cell-editor-option.ts"
      - "src/views/record-surface/cell-editor-relation.ts"
      - "src/views/modals/confirm-modal.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-061-impl"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions:
      - "Embedded renderer's own bar left unchanged — a third producer, actions already hidden, no report against it"
      - "Card centred by translate, not inset+margin:auto — the latter stretched to fill the box on this engine"
      - "Card width fixed at 320px — a shrink-to-fit header grid skewed its own intrinsic width"
      - "Relation editor's own claim isolated via a narrow-split-pane page, not the phone-sheet fixture"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 061-notion-sheet-refinement |
| **Completed** | Implementation closed 2026-09-07 and landed on `main`; T008 and the focus-listener residual (T012) closed on a follow-up pass the same day; AC-005 remains (operator sitting) |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Both legs `plan.md` scoped, on top of the operator's 2026-09-06 19:00 ADR ruling (ADR-001 to
ADR-004 Accepted, ADR-006 Parked).

### Leg A — the cell action menu

- **The tap edits, never selects.** `database-view.ts`'s and `embedded-database-renderer.ts`'s
  per-cell press handlers now return before touching the selection whenever the gesture is touch —
  `resolveCellTapAction`'s `edit-cell` and touch `select-cell` answers both defer to the cell
  renderer's own click handler, which already opens the editor. Desktop's mouse grammar is
  untouched past that same early return.
- **Selection is a mode, entered by a long press.** A new `attachLongPress` on each `td` sets the
  anchor on the first hold and extends the range on a second; the row's own long-press-for-menu
  gesture now ignores a press landing inside any table cell (`isTableCellTarget`, added to
  `table-cell-gesture.ts`) so the two holds cannot both fire on one press.
- **No bottom-docked bar for a phone's cell selection.** `renderSelectionStatusBar` branches on
  `cellCount > 0 && isTouchDevice` before building anything and renders `.db-cell-selection-pill`
  instead — three children (count, Copy, `···`), `flex-wrap: nowrap`, 44px tall, every child's hit
  box ≥44×44. Row selection (the bulk-checkbox path) is untouched and keeps the bar on every
  platform.
- **The pill is anchored and clamped.** `positionCellSelectionPill` places it 8px above the union
  rect of the selected cells (or below when there is no room), clamps it inside the grid viewport
  with an 8px margin, and clamps its bottom edge clear of
  `max(safe-area-inset-bottom, --db-mobile-navbar-height) + 8px`. `toolbar-renderer.ts`'s
  `reserveMobileFabInset` now runs unconditionally on a phone rather than only when the New button
  renders, so the navbar height is always published.
- **The overflow is one method, two presentations.** `openCellSelectionActionsMenu` opens
  `createOwnedMenu`, which already becomes the shell's titled bottom sheet on a phone and an
  anchored menu on desktop with no branch of its own — carrying Copy TSV/Markdown/CSV, Paste, then
  Fill or Bulk-edit `<Column>` (context-dependent), then Clear last and alone with `warning: true`.
  Both the pill's `···` and the desktop bar's collapsed `···` call it. Desktop's bar collapses to
  five children (count, Copy, Paste, Clear, `···`) at its declared 30px, unchanged grammar.
- **Every cell editor claims the bottom dock.** `openTextPopoverEditor` claims and releases
  `claimBottomDock` exactly as `openSingleLineEditor` already did. The picker family's own inherited
  claim through the generic sheet-mount path turned out not to cover every case: `openDateEditor`'s
  mobile branch is an inline overlay, not a registered sheet, so it never inherited the claim at
  all, and `openOptionEditor` mounts its popover directly rather than through the sheet-mount path
  either. Both now carry the same explicit claim/release pair, and `openRelationEditor` gained one
  too even though its own `positionToolbarPopover` call already claims the dock as `"sheet"` on a
  true phone context — the explicit claim is what still covers a narrow split pane, where that
  inherited path does not apply.
- **The focus path stopped painting a selection a tap never asked for.** The press branch's own
  fix (T004) left a second producer: `CellRenderer.selectCell` focuses the `td` on the way into the
  editor, and this view's `focus` listener assigned a selection from any focus regardless of
  source. It now reads the same touch/mouse gesture tracker the press handler already uses and
  defers whenever the focus arrived from a touch tap — a keyboard tab-stop or a mouse click, which
  never fire a `pointerdown` on the cell first, are unaffected. Mirrored in the embedded renderer's
  identical listener.
- **Left open:** the embedded renderer's own `renderEmbedSelectionStatusBar` (a genuine third
  bar-shaped-chrome producer) is unchanged — its edit actions are already hidden for the embed
  context and no operator report names it; recorded rather than silently folded in.

### Leg B — the confirm card

- **A declared third frame shape.** `SheetChromeOptions`/`SurfaceShellOptions` gained
  `frameRole?: "card"`, threaded through `attachSheetChromeToModal` → `applySheetChrome` →
  `setSheetMount`, which toggles `.db-sheet-card`; `classifySheetFrameShape` bails out early for it
  rather than inferring a shape from height. `DbModal` gained a `getFrameRole()` hook (default
  `undefined`); `ConfirmModal` overrides it to `"card"`.
- **Stacked, full-width actions.** `buildConfirmSheetBody` gained `stackedActions`, applying
  `.db-confirm-stacked` to the actions row; `ConfirmModal` passes `stackedActions: true`. Button
  order and the `mod-warning`/`mod-cta` classes are unchanged.
- **Two real layout bugs found and fixed before this closed**, both specific to a shrink-to-fit
  sheet (the first of its kind in this codebase): a fixed box with all four insets set and
  `height: fit-content` stretched to fill the inset box on this engine rather than sizing to
  content, so centring is done by a fixed-position translate instead; and the shell header's
  `1fr auto 1fr` title-centring grid resolves each `1fr` track by its own content when the
  container itself is shrink-to-fit, so the empty leading slot against the 44px trailing close
  button pulled the title 22px off-centre — fixed with a `min-width` on the leading slot matching
  `--db-shell-edge-control-size`, additive and a no-op for every definite-width sheet.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/database-view.ts` | Update | Touch early-return, long-press entry, pill render/anchor/clamp, overflow menu, dock cleanup; focus listener now defers to the touch/mouse gesture tracker |
| `src/views/embedded-database-renderer.ts` | Update | Same touch early-return and long-press entry; row-menu long-press exclusion; same focus-listener gesture guard |
| `src/views/table-cell-gesture.ts` | Update | `isTableCellTarget` added |
| `src/views/record-surface/cell-editor-text.ts` | Update | `openTextPopoverEditor` claims/releases the bottom dock |
| `src/views/record-surface/cell-editor-date.ts` | Update | `openDateEditor` claims/releases the bottom dock |
| `src/views/record-surface/cell-editor-option.ts` | Update | `openOptionEditor` claims/releases the bottom dock |
| `src/views/record-surface/cell-editor-relation.ts` | Update | `openRelationEditor` claims/releases the bottom dock |
| `src/views/toolbar-renderer.ts` | Update | `reserveMobileFabInset` runs unconditionally on a phone |
| `src/views/mobile-bottom-sheet.ts` | Update | `frameRole` on `SheetChromeOptions`/`attachSheetChromeToModal`; `.db-sheet-card` toggle; classifier bail-out |
| `src/views/surface-shell.ts` | Update | `frameRole` on `SurfaceShellOptions`; `SHELL_CARD_INSET_PT` constant |
| `src/views/modals/db-modal.ts` | Update | `getFrameRole()` hook |
| `src/views/modals/confirm-modal.ts` | Update | `getFrameRole()` returns `"card"`; `stackedActions: true` |
| `src/views/confirm-sheet.ts` | Update | `stackedActions` option, `.db-confirm-stacked` class |
| `src/i18n.ts` | Update | `selection.bulkEditColumn`, `selection.moreActions` |
| `styles.css` | Update | `.db-sheet-card`, `.db-confirm-stacked`, `.db-cell-selection-pill` family, dock-taken hide rule, shell-header leading `min-width` |
| `tools/live/sheet-grammar.mjs` | Update | Confirm-card inset/radius/action-layout measurement + negative control |
| `tools/storybook/verify-placement.mjs` | Update | Standalone selection fixture switched to row selection (bar mechanics unchanged); pill section (shape, anchor, clamp, overflow reachability, dock-hide); a touch-tap-through-focus-path section; a dock-claim section covering date/option/relation editors plus an isolated relation-only narrow-split-pane check — all with self-contained or revert-and-restore negative controls |
| `src/views/table-cell-gesture.test.ts` | Update | Unit coverage for `isTableCellTarget`, rebuilt on a real minimal element tree (parent chain, real `closest()`/selector matching) rather than a fake whose `closest()` ignored its argument, so a wrong selector or a dropped `isHTMLElement` guard now fails the suite |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Read from the final tree, exit codes read from `$?` or a file:

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | 0 |
| `npx vitest run` | 1585/1585 green |
| `npm run build` | 0 |
| `node tools/live/sheet-grammar.mjs` | PASS, including the confirm-card measurement and its negative control |
| `node tools/live/render-assertions.mjs` | PASS |
| `node tools/storybook/verify-placement.mjs` | 403/406 (3 declared-red, pre-existing baseline), including the pill, touch-tap-through-focus, and dock-claim sections |
| `node tools/naming/scan-comments.mjs` | PASS — 0 artifact-id violations |
| `node tools/naming/scan-failing-values.mjs` | PASS |
| `npm run gate` (foreground, stdin `/dev/null`, exit read from file) | **PASS — 26/26 green** |

Every negative control was observed red before its row was called green:
`isTableCellTarget` (mutated to always-true, two assertions went red, restored); the pill's
bar-absence/child-count/nowrap/height/hit-box assertions (restoring the old fall-through path was
not re-exercised as a live control — covered instead by the touch early-return's own logic, since
the pill branch and the old bar branch cannot coexist in the new code); the navbar-clearance clamp
(dropping `--db-mobile-navbar-height` closed the gap from 552px to 96px, restoring it returned to
552px); the overflow reachability count (removing one row dropped the count by exactly one); the
confirm card's inset/radius/stacked-layout (stripping `.db-sheet-card`/`.db-confirm-stacked` went
flush-left with side-by-side actions).

On this follow-up pass: the touch-tap-through-focus-path assertions (reverting the focus listener's
gesture guard showed a live `cellSelection` right after the tap and a pill reading "1 cell
selected" after Escape closed the editor — the operator's own residual, reproduced); the
date/option editors' dock-claim assertions (reverting their `claimBottomDock` pair showed the pill
at `display: flex` while the editor was open, over the date editor's own Save/Cancel row); and the
relation editor's own claim, isolated in a narrow-split-pane page where `positionToolbarPopover`'s
inherited sheet-mount claim does not apply (reverting its pair left the dock unclaimed there, where
the phone-sheet page's own inherited claim would otherwise have hidden the gap). `table-cell-gesture.test.ts`'s
two new mutants — a dropped attribute clause in the selector, and a dropped `isHTMLElement` guard —
were both confirmed red against the mutated source and green against the shipped one.

The 32 Project Manager reference captures stayed `pixelHash`-identical throughout (parent D5).
Twelve screenshots moved content and were opened and read in both themes at the first landing: four
are this leg's own (the confirm card, standalone and stacked over the Properties sheet); eight are
`constructed-date-picker(-datetime)-*`, which mount the real component and read the actual date —
the session crossed a calendar day between the prior packet's capture and this one, and the only
difference is which day now reads as "today," unrelated to this edit. On this follow-up pass a full
recapture (604 screenshots) left every PNG byte-identical to what is committed; six files jittered
on the capture host (board, timeline and two Project Manager reference views, plus the desktop
option-editor screenshot and a view-config panel — none of them a scenario that renders an open
cell editor alongside a live selection pill, the only combination either fix could visibly change)
and were restored to their committed bytes rather than kept. Full accounting is in
`tools/lane/css-lane.json`'s release entry for this phase.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Row selection's bar is untouched | Neither the operator's report nor the four-product read was about row (checkbox) selection; ADR-004's whole text is about a *cell* selection. Touching it would have been unrequested scope |
| The embedded renderer's own bar is left unchanged | A genuine third bottom-docked-bar producer surfaced during the T003 inventory, but its edit actions are already hidden for the embed context and no report names it — recorded as an open item rather than silently absorbed |
| Confirm card centred by translate, not `inset` + `margin: auto` | The latter is the textbook technique and measures correctly on paper, but this engine stretches a `height: fit-content` box to fill an all-four-sides-inset box rather than sizing it to content — found by screenshot, not by the numeric lane check, which only asserts a `>=16px` floor and could not tell "small card" from "full height minus 32px" |
| Confirm card width is a fixed 320px, not `fit-content` | A CSS Grid `1fr auto 1fr` header inside a shrink-to-fit ancestor resolves its own intrinsic width from each track's content rather than its preferred size, so an asymmetric header (empty leading, populated trailing) skewed the card's own computed width and wrapped the title one letter per line, differently per theme |
| Shell header leading slot gets an explicit `min-width` | The `1fr` mirroring trick needs a definite container width to divide leftover space against; giving the empty leading slot the same floor as the trailing close button restores that symmetry for a shrink-to-fit card and changes nothing for a full-width sheet, where `1fr` still divides real leftover space |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Every threshold in `acceptance-criteria.md` re-read against the branch commit before the first edit | PASS |
| `npm run gate` | PASS — 26/26 green |
| AC-001 to AC-004, AC-006, AC-008 | Met |
| AC-007 | Waived (ADR-006) |
| AC-005 | Unmet — the operator's own read, in `067` AC-011's sitting |
| T010 | Closed at the landing — the two device questions are in `067` AC-011, no new operator row |
| T008 | **Closed.** The text editor's claim was confirmed live at the first landing; the date, option and relation editors now carry the same claim/release pair, each measured live |
| T012 (new) | **Closed.** The focus listener a plain tap reaches through `CellRenderer.selectCell`'s own `td.focus()` now defers to the same gesture tracker the press handler reads, and no longer paints a selection from a touch tap |
| Landing re-verification | The shipped `TableRenderer`/`CellRenderer` plus `DatabaseView`'s own `setupTableCellSelection`, driven in headless Chrome at 402x874 (`hasTouch`, forced coarse pointer) and at 1440x900 |
| Follow-up verification | The same shipped renderers, driven through `cellRenderer.startEdit`/`renderCell` and `DatabaseView.prototype.setupTableCellSelection` against a real `<td>` and a real `renderSelectionStatusBar`-built pill, in headless Chrome at 402x874 and, for the relation editor's isolated check, at 1000x700 with no touch/phone flags |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The embedded renderer's own selection bar is unchanged.** `renderEmbedSelectionStatusBar`
   builds the identical bottom-docked shape on a phone, with its paste/fill/clear actions already
   hidden for the embed context. No operator report names it and no reference capture shows an
   embed's own multi-cell selection, so it was left as a recorded open item rather than folded into
   this leg's scope.
2. **The single-editable-column "Bulk edit `<Column>`" branch of the overflow menu is implemented
   but not separately exercised by the live lane fixture**, which drives a mixed-column selection
   (the Fill branch). Both branches share the same `openCellSelectionActionsMenu` code path.
3. **AC-005 is not agent-closable.** It is the operator's own device read, shared with `067`
   AC-011's sitting. T010 was closed at the landing, which held write authority over `067`.
4. **Closed on this follow-up pass, recorded here rather than removed from the record.** The two
   defects the first landing left open — the bottom dock claimed by one editor family rather than
   all of them (T008), and a plain tap still painting a selection through the focus path rather than
   the press path (T012) — are both closed and measured live; see the Verification table above and
   `tasks.md`'s T008/T012 rows for the numbers.
5. **AC-007 stays parked**, per ADR-006, behind an Anytype multi-section capture re-read the
   operator schedules.
<!-- /ANCHOR:limitations -->

---
