---
title: "Decision Record: Sheet Polish"
description: "The packet's one boundary ruling: the icon picker's Remove stays Proposed for the shared sheet header, and the picker carries its controls in its own body instead."
trigger_phrases:
  - "014-sheet-polish decision record"
  - "icon picker remove promotion"
  - "proposed shared header slot"
importance_tier: "important"
contextType: "decision"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/014-sheet-polish"
    last_updated_at: "2026-09-10T04:50:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Recorded the Proposed ruling at the packet's boundary check; the promotion is not done"
    next_safe_action: "A ruling that extends mountPickerSheetHeader's contract takes the promotion"
    blockers: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: the icon picker's `Remove` and the shared sheet header

---

<!-- ANCHOR:question -->
## 1. THE QUESTION

Notion's icon picker sits `Remove` top-left in the sheet header, the title centred, `Close`
top-right. Ours builds `Remove`, `Random` and a settings button into the same body div as the
search field. Promoting `Remove` into the sheet header would match Notion — does it require
changing the shared header builder, and if so, what happens to the item?

## 2. THE FACTS, READ BEFORE THE RULING

- The picker's phone header is built by `mountPickerSheetHeader` (`src/views/popover-host.ts`),
  which calls `buildShellHeader` (`src/views/surface-shell.ts`), which wraps the shared
  `createSheetHeader` (`src/views/mobile-bottom-sheet.ts`) and adds the shell's leading and
  trailing slots around it.
- `createSheetHeader` already carries a `beforeClose?(header)` hook, and `buildShellHeader`
  passes it through; the shell's leading slot (`SHELL_HEADER_LEADING_CLASS`) exists and is
  populated today by the back control. So the promotion does **not** require editing
  `mobile-bottom-sheet.ts` or `surface-shell.ts` themselves.
- It **does** require extending `mountPickerSheetHeader`'s option contract — a new leading-slot
  pass-through that its three cousin pickers (colour, date, and any later one) then share —
  which is the same shared-picker-host surface `007` REQ-006 draws its boundary around. That file
  is outside this packet's implementation scope (`icon-picker-popover.ts`, `styles.css`).
<!-- /ANCHOR:question -->

<!-- ANCHOR:ruling -->
## 3. THE RULING

**Recorded Proposed, not done.** The `Remove`-into-sheet-header promotion waits for a ruling that
extends `mountPickerSheetHeader`'s contract; it is not slipped into this packet. This packet
satisfies the requirement by relocating all three controls within the picker's own body: the
search row now carries the tabs and the search field alone, and `Remove`, `Random` and the
settings button read on their own 44px action row directly beneath it — the same
touch-box discipline the promotion's, and the clause (0 of the three among the search's
siblings) passes on the actual shipped markup either way.
<!-- /ANCHOR:ruling -->

## 4. WHAT PROMOTION WOULD NEED, WHEN IT IS TAKEN

1. `mountPickerSheetHeader` gains a leading-slot option (a mount callback or a passthrough of
   `buildShellHeader`'s leading slot), keeping the colour and date pickers' calls untouched.
2. The icon picker hands it the `Remove` control; the clause then also drops `Remove` from the
   action row, and the Reaction-variant note in the packet's spec (a picker carrying no
   `Remove` at all) becomes the common case rather than the exception.
3. The shared header's centring clause re-measured: a leading slot wider than the close changes
   the centring the title-centring contract asserts, which is precisely why the promotion
   belongs to the builder's own ruling, not to a P3 packet.

## 5. RECORD

| Field | Value |
|-------|-------|
| Item | The icon picker's `Remove` promoted into the shared sheet header's leading slot |
| Status | **Proposed** — recorded, not implemented |
| Introduced by | The packet's requirement, decided at its T003 boundary check |
| Date | 2026-09-10 |
| Evidence | `git diff --numstat src/views/mobile-bottom-sheet.ts` = 0 changed lines; `src/views/surface-shell.ts` and `src/views/popover-host.ts` equally untouched; the relocation clause green in `tools/live/sheet-grammar.mjs` |
