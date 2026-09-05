---
title: "Implementation Summary: Stacked Sheets"
description: "What this packet has produced so far — the packet itself and its code-derived stacked-surface inventory — and what remains unbuilt."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
  - "048 implementation summary"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/048-stacked-sheets"
    last_updated_at: "2026-09-05T09:35:00Z"
    last_updated_by: "code-agent"
    recent_action: "Landed the stacking model and its lane rows"
    next_safe_action: "Cut 0.0.24 and have the operator re-check the three captures — AC-009"
    blockers:
      - "AC-009 is operator-owned: nothing in this repository can close it"
    key_files:
      - "stacked-surface-inventory.md"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/overlay-stack.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-048-impl"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions:
      - "Level 2, standard child: recommend-level.sh 64/100, phase score 10/50 against a 25 threshold"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 048-stacked-sheets |
| **Completed** | Code complete 2026-09-05; AC-009 open, and it is the operator's |
| **Level** | 2 |
| **Fix commits** | `265f736f` the depth model · `915591c2` the per-child migrations · `f1fffff2` the lane |
| **Ships in** | 0.0.24 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A depth model, the migrations that consume it, and one lane row per stacked pair. The mechanism the
inventory named was an absence — nothing modelled a stack — so the work is mostly a small amount of
new state in one place and a large amount of surface stopping to compute its own.

### The model

`OverlayStack` gains the readers its `parentId` never had: the depth of a surface, the surface
beneath one, whether a panel is the top sheet, and whether a node lies inside a surface stacked
above another. Registration merges rather than replaces, so a sheet registered first by the mount
and again by its popover adapter keeps one identity and one parent instead of two entries.

`setSheetMount` registers every sheet and derives its parent from whatever sheet was on top when it
mounted. One `syncSheetStack` pass then owns everything depth decides: a per-sheet z-index so a child
paints above its parent instead of tying with it, the marking that dims and pulls back every surface
below the top, a zero inset on every sheet that is not the top, and the single scrim moved to sit
between the top two rather than behind all of them.

`styles.css` renders that: `--db-sheet-z-index` and `--db-sheet-scrim-z-index`, the parent's dim and
its content's scale-back, a flex column for dropdown, relation and modal sheets so their chrome stays
put while the list scrolls, and a mask at the cut.

### The migrations

Every stacked child now carries `044`'s header. K1 dropdowns build one when their anchor is inside a
sheet, and the same change stops a dropdown being constructed inside its parent and portalled out.
K3 modals get one from `attachSheetChromeToModal`, which covers all 19 `DbModal` subclasses at once —
`ConfirmModal` and `CreatePropertyModal` included — and hides the host's own close button. The three
`FuzzySuggestModal`s get the same. The Properties sheet's hand-built header, which had no close at
all, becomes `createSheetHeader` with its All checkbox passed through `beforeClose`. K2 and K6 needed
nothing: `044`'s closing leg had already given the owned menu and the three field pickers a header,
and `rg "new Menu\("` returns nothing, so the K5 row was closed before this packet opened.

### Three defects the work surfaced, each fixed at its producer

1. **The dim was written and never rendered.** `.db-mobile-bottom-sheet.db-overlay-enter` sets
   `opacity: 1` at the same two-class weight and sits later in the file. The marking class is now
   doubled, which is the move `styles.css` already documents for the sheet's own z-index.
2. **A press inside a stacked child closed the parent.** The record panel treated any press outside
   itself as a dismissal, exempting a hand-kept list of child surface classes that no new child is on.
   It now asks the stack, which knows what is above what.
3. **Re-placing a parent destroyed it.** A parent whose anchor had gone re-resolved down the anchored
   branch, stripping its sheet chrome and detaching it under its own child. Only the top sheet
   re-places now (ADR-003).

A fourth was caught before it could ship: the scrim was repositioned on every sync, and because the
sheet module watches the body for removals, that mutation woke the watcher, which called back into
the reposition. The move is now conditional, and the lane asserts zero body mutations across two idle
frames so the loop cannot return unnoticed.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/overlay-stack.ts` | Modified | Depth, the surface beneath, top-sheet and inside-above predicates; merging registration |
| `src/views/mobile-bottom-sheet.ts` | Modified | Depth-aware mount, one scrim between the top two, the shared stack-change event, modal chrome with a header |
| `src/views/popover-position.ts` | Modified | Keyboard inset to the top sheet only; only the top sheet re-places on a depth change |
| `src/views/record-detail-panel.ts` | Modified | A press inside a surface stacked above is not an outside press |
| `src/views/dropdown-field.ts` | Modified | Header on a stacked dropdown, body host, scroll affordance |
| `src/views/modals/db-modal.ts` | Modified | D1: sheet presentation with the shared header; chrome taken down on every close path |
| `src/views/column-manager-renderer.ts`, `view-config-panel-renderer.ts`, `cell-renderer.ts` | Modified | Hand-built headers onto `createSheetHeader` |
| `src/views/markdown-file-suggest-modal.ts`, `image-file-suggest-modal.ts`, `src/main.ts` | Modified | K4 suggest modals present and place as sheets |
| `src/views/owned-menu.ts`, `column-width.ts`, `popover-auto-close.ts`, `modals/create-linked-view-modal.ts` | Modified | Close wiring through the stack rather than beside it |
| `styles.css` | Modified | Per-depth ordering, parent treatment, scroll fade, modal sheet layout |
| `tools/live/sheet-grammar.mjs` | Modified | 31 stacked pairs, a rendered-style stacking control, settle and entrance guards |
| `tools/storybook/verify-placement.mjs` | Modified | Handler count read as a per-menu increment, not a total |
| `src/views/overlay-stack.test.ts` | Modified | Depth, rebuilt-parent and inside-above units |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first, on the same lane. The 31 stacked pairs were registered and run against the pre-fix tree
before any of the model existed: **253 failing assertions**. The same lane against the fixed tree:
**0**. Every discriminating column moved — parent box, parent treatment, scrim position, all four
header columns, keyboard ownership, depth, and the scroll affordance.

Two columns did **not** move, and they are named rather than counted: `exactly one scrim` was already
green because the old code really did keep one shared node — the defect was where it sat — and
`child drag leaves parent in place` was green because the old code never transformed a parent at all.
Both stay in the lane as regression guards.

The lane's own instrument was corrected twice on the way. Its stacking control originally removed the
class its predicate read, which would have agreed with itself whatever the stylesheet did; it now
reads rendered opacity and transform. And its baseline was snapshotted mid-entrance, reporting the
tail of the parent's own animation as movement the child caused; it now waits for two frames at the
same offset.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| D1 ACCEPTED — modals present as sheets | ADR-001. The mechanism already existed on `DbModal`; the alternative forks twenty subclasses into a phone branch and a desktop branch. |
| Every surface below the top is pushed back, not only the one beneath | ADR-002. Phone sheets are bottom-anchored and shorter than the screen, so a depth-3 chain leaves the outermost one visible — which the operator's own capture shows. |
| A sheet beneath another never re-places | ADR-003. It is why REQ-002 and REQ-005 do not fight: the parent is not asked for a keyboard number and told to ignore it, it is not asked. |
| The submenu lane row models a dropdown, not a second owned menu | `createColumnMenuSubpopover` builds a body-mounted listbox through the shared positioner. Registering a menu there would pin a shape production never mounts. |
| Beat the entrance rule on specificity, not on position | The stylesheet already documents that move for the sheet's z-index; a position-dependent fix breaks on the next rule appended after it. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | exit 0 — 1148 tests across 108 files |
| `npm run build` | exit 0 |
| `npm run gate`, `$?` read without a pipe | **exit 0 — 25 lanes green, 0 red** |
| `sheet-grammar`, pre-fix tree, same 31 pairs | **253 failing assertions** |
| `sheet-grammar`, fixed tree | **0 failing assertions**; stacking control 0.88 → 1 → 0.88 |
| `npm run screenshots` | 550 captured; 7 content-changed, opened and read; 19 byte-only reverted to HEAD |
| `check-lane.mjs` | exit 0 — release names all 7 changed captures |
| `evidence.mjs --check-all` | 15 of 15 artefacts describe this tree |
| Operator confirmation | **Open. AC-009, and nothing in this repository can close it. Ships in 0.0.24** |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Nobody has seen this on a phone.** Every number above is headless Chrome against the production
   render path at 390×844 with `is-phone`. That is the strongest evidence available in this
   repository and it is not a device.
2. **AC-006 is partial.** The parent's survival is asserted through it staying mounted, within 1px,
   and un-re-placed; its `scrollTop` and draft values are not read back across a child's life.
3. **Two lane columns were green before the fix** — `exactly one scrim` and `child drag leaves parent
   in place`. They guard against regression; they are not evidence this packet changed them.
4. **Two independent owned menus still share one backdrop press.** `verify-placement` records it:
   each menu owns its own document handler, so one press dismisses both. Production reaches a submenu
   through the positioner rather than a second owned menu, so this is recorded in `003` rather than
   fixed here.
5. **The parent's scale-back is one step at every depth.** A per-level ramp was not built because no
   requirement asks for one and nothing measures it (ADR-002).
<!-- /ANCHOR:limitations -->

---
