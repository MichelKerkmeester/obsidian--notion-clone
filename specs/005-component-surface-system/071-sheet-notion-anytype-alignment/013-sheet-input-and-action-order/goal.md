---
title: "Goal: Sheet Input and Action Order"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "013-sheet-input-and-action-order goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/013-sheet-input-and-action-order"
    last_updated_at: "2026-09-09T22:50:00Z"
    last_updated_by: "sheet-notion-audit"
    recent_action: "Scaffolded from the sheet-notion audit's gap tables"
    next_safe_action: "Execute tasks.md T001-T011"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-notion-audit.md"
      - "src/views/toolbar-renderer.ts"
      - "src/views/date-value-picker.ts"
      - "src/views/confirm-sheet.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "013-sheet-input-and-action-order-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "ADR-C: does the add-view layout choice become a grid of icon cards, matching Notion, or stay as rows? Held Proposed — `toolbar-renderer.ts:1494-1502` documents a real defect in our own former tiles that Notion's cards may not share"
      - "Where do the toolbar overflow menu's per-column preset text inputs move to — their own sheet, or behind a row?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Input and Action Order

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Four sheets present their inputs in the order the action needs rather than the order the code happened to build them: the add-view sheet offers its create affordance before its optional settings, the date picker puts its calendar ahead of its numeric segment fields, the confirm card puts the destructive action above Cancel as Notion does in four of four captures, and the toolbar overflow menu stops mixing free-text fields among action rows.

### Decisions

| ID | Decision |
|----|----------|
| D1 | No numeric target in this packet may be derived from a Notion asset. Every Notion iOS capture here is 299x678; every ordering target is an **ordinal** structural fact, which survives that resolution, and every pixel number is ours |
| D2 | The confirm card's measured geometry is regression-checked, not re-designed: `061` converged the centred 16px inset, the 16px radii, the stacked full-width actions and the 44/50px heights, and the lane proves all of it. Only the **order** of the two children changes |
| D3 | The add-view name input keeps its deliberate absence of a placeholder. `toolbar-renderer.ts:1428-1430` records why — a placeholder is not a label and vanishes at the first keystroke — and Notion's use of one is not evidence against our reasoning |
| D4 | ADR-C (rows against tiles for the layout choice) is **not** resolved here. No task converts rows to tiles |
| D5 | Only the operator's own device recheck may close the alignment judgement; no agent ticks the device row |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Reference and current-state gap table complete (`spec.md` §13, from `../sheet-notion-audit.md`)
- [ ] The add-view sheet's create affordance precedes its optional settings in DOM order
- [ ] The date picker's calendar precedes its numeric segment inputs, and Clear leaves the presets group
- [ ] The confirm card's destructive action is the first child of the actions row and Cancel is the last
- [ ] The toolbar overflow menu carries no free-text input sharing a surface with its action rows
- [ ] No regression on the confirm card's landed geometry or on any sheet's row grammar
- [ ] Recaptured phone-only light and dark for each of the four surfaces
- [ ] Operator's own device re-read reports the four sheets aligned (no agent ticks this row)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-09, worktree `worktrees/272-sheet-notion-audit` |
| Reference inventory | Done | `../sheet-notion-audit.md` §3.4, §3.5, §3.12, §3.14. Confirm: four stacked patterns across `screenshots/notion/ios/sheets/notion-ios-sheets-delete-confirm-{01,02,03,06,07,14,15}-*.webp`, **4 of 4 put the destructive action above Cancel**. Add-view: `flows/changing-database-view/notion-ios-flow-changing-database-view-02-*.webp` — create first, name later via View options. Date: `sheets/notion-ios-sheets-date-picker-03-*.webp` — field row, calendar, then value rows, Clear last. All 299x678, read for structure only |
| Current-state measurement | Done | `node tools/live/sheet-grammar.mjs` PASS exit 0. Confirm card: inset ≥16px all four edges, radius 16px all four corners, actions `flex-direction: column`, every action ≥44px (`[44,50]`) — geometry converged, order not asserted |
| Root cause located | Done | `confirm-sheet.ts:93` creates the cancel button and `:107` the confirm button; under `flex-direction: column` the first child renders on top, so Cancel sits above the destructive action. A one-line producer change with no geometry consequence |
| Gap table | Done | `spec.md` §13 |
| Implementation | Not started | Deferred to `tasks.md` |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it |

### Deviations and findings

| Item | Note |
|------|------|
| The confirm's order was never asserted, only its geometry | `061` measured the card, the stacking and the heights and proved each red before green. Which of the two buttons comes first was not among them, so the inverted order has passed every run since |
| Our date picker asks a phone user to type a date into three numeric boxes | `date-value-picker.ts:189-231` builds `YYYY`, `MM` and `DD` as separate maxlength-capped numeric inputs ahead of the calendar. No Notion capture uses segment entry at all; Notion gives a tappable field and a calendar grid. This is the audit's clearest single 'input' finding under the operator's own wording |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. Where a Notion reading contradicts a landed decision, this packet records it as Proposed in `../sheet-notion-audit.md` §6 rather than resolving it |
<!-- /ANCHOR:log -->
