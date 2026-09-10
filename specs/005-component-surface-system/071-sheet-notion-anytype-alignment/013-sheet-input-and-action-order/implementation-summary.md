---
title: "Implementation Summary: Sheet Input and Action Order"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/013-sheet-input-and-action-order"
    last_updated_at: "2026-09-10T02:05:00Z"
    last_updated_by: "implement-013-sheet-input-and-action-order"
    recent_action: "All four surfaces reordered, RED→GREEN on the lane, gate 28/0"
    next_safe_action: "Operator device read (D3) closes the packet; a fresh verifier lands the commit"
    blockers: []
    key_files:
      - "src/views/confirm-sheet.ts"
      - "src/views/date-value-picker.ts"
      - "src/views/toolbar-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "013-sheet-input-and-action-order-implementation"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "ADR-C: rows against tiles for the layout choice stays Proposed (the packet's goal.md question, unresolved here by design)"
    answered_questions:
      - "Where do the toolbar overflow menu's per-column preset inputs move to — their own sheet, or behind a row? Behind a row: a chevron row swaps the record popover for a presets popover at the same trigger (decision-record.md ADR-002)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: implementation-summary | v2.2 -->

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 013-sheet-input-and-action-order |
| **Status** | Implemented — 2026-09-10, awaiting the operator's device read (D3) |
| **Completed** | 2026-09-10 |
| **Level** | 3 |
| **Worktree** | `worktrees/279-sheet-action-order` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Four sheets now present their controls in the order the action needs, and the order
is held by clauses, not by inspection. The confirm card's stacked actions read
destructive-then-Cancel, the reading all four captured reference patterns agree on,
while the side-by-side footer keeps its own order. The date picker's body leads
with the calendar, keeps Today/Tomorrow/Next week as its shortcut group, follows
with the typed segments, and closes with Clear as its own plain row outside that
group. The add-view popover leads with its create rows — one tap makes the view —
and asks its four optional questions beneath. The record popover hosts zero
free-text inputs: its per-column presets answered from a chevron row that swaps to
a presets popover at the same trigger, landed destination-first so the lane proved
fifteen inputs answering there while fifteen still sat in the record popover.

The order facts are asserted by a new lane probe (`window.__sheetInputOrderProbe`)
read through four order clauses in `tools/live/sheet-grammar.mjs`, alongside the
date picker's keyboard-inset placement clause and the confirm card's two-variant
order pair. Every clause went red first with the target facts failing and nothing
else.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:red-green -->
## RED → GREEN, clause by clause

| Surface | RED reading (pre-change) | GREEN reading (final) |
|---------|--------------------------|------------------------|
| Confirm, stacked | Cancel first: `{"first":{"text":"Cancel","cls":""},"last":{"text":"Delete","cls":"mod-warning"}}` | `{"first":{"text":"Delete","cls":"mod-warning"},"last":{"text":"Cancel","cls":""}}` |
| Confirm, side-by-side | (guard clause, green throughout) | Cancel first, confirm last — unchanged |
| Confirm geometry (the landed clauses) | — | inset 275.3/35/35/275.3px, radius 16px ×4, `flex-direction: column`, action heights 50/44px (pre-reorder the same pair printed 44/50), negative control still red-then-green |
| Date picker, order | `calendarBeforeSegments: false` (calendar last) | `true` — calendar, then shortcuts, then typed segments |
| Date picker, Clear | 4 presets, `clearInPresets: true`, no Clear outside the group | 3 presets `["Today","Tomorrow","Next week"]`, `clearOutsideGroup: true` |
| Date picker, placement | published `--obnotion-keyboard-inset` 0px; post-reorder calendar bottom 1305.9px inside the sheet's lifted floor 1451.9px (pre-reorder: 1391.9px inside 1393.9px) | same clause, reordered sheet |
| Add view | `choicesBeforeForm: false`; `namePlaceholder: ""` | `true`; still `""` — the name-input lines are absent from the diff, the clause prints the empty placeholder |
| Record popover, destination | no presets row, no presets popover, 0 inputs there | row + popover found, 15 inputs answering there (proven while the record surface still carried its 15 — destination before source) |
| Record popover, surface | 15 free-text inputs sharing the action rows | 0; the 15 live one hop deeper |

The first lane run printed 7 failures — exactly the new clauses, every landed row
green — and the final run exits 0 (2360 clause lines).
<!-- /ANCHOR:red-green -->

---

<!-- ANCHOR:how-verified -->
## How It Was Verified

From the final state: `npx tsc --noEmit` exit 0; `npx vitest run` 1606/1606
(includes the new confirm-sheet unit, 3/3, proven 2F/1P red before the builder
changed, and the amended toolbar-surface contract clause); `npm run build` 0;
`node tools/live/sheet-grammar.mjs` 0; `node tools/live/render-assertions.mjs` 0;
`node tools/storybook/verify-placement.mjs` 420 checks, 418 passed + 2 red for a
declared reason (the storybook's watched-red ratchet), exit 0.

`npm run screenshots` ran twice, 480/480 both times. 24 movers, deterministic
across both runs (identical changedPixels and maxDelta), kept and recorded in a
css-lane acquire/edit/release triplet whose baselineHash is
`aa57d141259c` (the first twelve of sha256 of `styles.css`): 4 constructed-add-view,
8 constructed-date-picker(+datetime), 8 field-date-value-picker(+datetime) — those
differ in size, because the reordered popover's intrinsic height changed — and 4
constructed-modal-sheet-confirm(+stacked). 2 one-run jitters at maxDelta 1
(board-mobile-desktop 2px, board-view-desktop 8px) restored to their committed
blobs; the second run reproduced the committed bytes for both, so the working
manifest already matched. `node tools/live/evidence.mjs --check-all` reported 13
of 16 artefacts stale against the edited tree; all 13 writers were re-run (exit 0
each) and the check then exited 0. `npm run gate` once: 28 green, 0 red.
`node tools/naming/scan-comments.mjs` 0, `node tools/naming/scan-failing-values.mjs` 0.

One verifier was amended, recorded: the storybook add-view clause measured
`choices.top - form.bottom` as a signed subtraction, which the reorder legitimately
negates (-344px desktop, -412px phone — the recorded red); it now reads the
separation either way round, since which group leads is this packet's ruling and
the clause's subject is the distance.
<!-- /ANCHOR:how-verified -->

---

<!-- ANCHOR:provisional -->
## Provisional Until the Device Read (D3)

The four surfaces' correctness is lane-proven; how they *feel* is not, until the
operator's own device read (the audit's C-1..C-6, the goal's standing device row —
no agent ticks it). Until then these numbers are provisional: the Clear row's 8px
side padding and 8px top gap; the calendar divider's 6px bottom margin under its
new lead position; the presets popover's compact-menu width and the presets row's
`settings-2` icon; the record popover's pendant — its before/after is the lane's
printed 15→0 plus the destination's 15, not an image, because the constructed
corpus has no scenario for that popover. Adding one is outside this packet's
frozen Files-to-Change; the gap is recorded here, the same precedent the copy
packet's leg set for the filter's empty state.
<!-- /ANCHOR:provisional -->

---

<!-- ANCHOR:continuation -->
## Continuation Notes

- Nothing in this packet resolves the layout-rows-versus-tiles question; the
  layout choice still renders as rows and its decision stays Proposed (goal.md D4,
  the audit's §6 ADR-C).
- The record popover's presets row carries its values only as a label; the presets
  popover's title and the row's key are new strings, translated in all three
  locales (en/zh-CN/zh-TW).
- The sheet-inventory document (`001`'s inventory.md) was regenerated by its own
  tool because this packet's edits shifted `toolbar-renderer.ts`'s line anchors;
  two lines changed, both line numbers.
- Not pushed. A fresh verifier lands it.
<!-- /ANCHOR:continuation -->
