---
title: "Goal: Stacked Sheets"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "048 goal"
  - "stacked sheets goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/048-stacked-sheets"
    last_updated_at: "2026-09-05T09:35:00Z"
    last_updated_by: "code-agent"
    recent_action: "Closed the stacking model, the migrations and the lane rows against measured evidence"
    next_safe_action: "Cut 0.0.24 and collect the operator device confirmation"
    blockers:
      - "Operator device confirmation is the only row that closes this phase"
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/overlay-stack.ts"
      - "src/views/popover-position.ts"
      - "src/views/dropdown-field.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-048-goal"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions: []
---
# Goal: Stacked Sheets

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A sheet opened from inside another sheet reads as one stack — the child overlays the
parent in place, the parent dims and scales back and does not move, and the child carries the same
header, close and scroll grammar as a first sheet.

**Why.** `044` gave a first sheet its grammar and the operator confirmed the buttons work on 0.0.23.
The next report was about the second sheet: *"stacked sheets dont look or work right"*. Nothing in
the plugin models a stack. `overlay-stack.ts` is a LIFO dismissal registry that carries a `parentId`
nothing ever reads, every sheet takes the same `z-index: var(--db-layer-modal, 1000)`, and one
shared `.db-mobile-sheet-scrim` node sits behind all of them at once.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Operator-owned, open.** An Obsidian `Modal` opened from inside a sheet — create property, a confirm, a date picker — either presents as a sheet on the phone or the phone flow uses a sheet instead of the modal. **Recommendation: present as a sheet**, because `DbModal` already declares a presentation and the alternative forks every one of these flows into a phone branch and a desktop branch. See §3 of `spec.md`. |
| D2 | The parent does not move. A child opening changes the parent's opacity and scale only; its bounding box is unchanged, |Δ| ≤ 1px on every edge. A parent that slides is the defect this packet exists for. |
| D3 | Exactly one scrim, and it belongs to the topmost sheet. Two sheets open means one scrim between them, not one behind both. |
| D4 | The keyboard inset belongs to the topmost sheet only. Two sheets holding different `--db-mobile-sheet-bottom` values is the defect `popover-position.ts:447-461` already records in prose. |
| D5 | A stacked child carries `044`'s grammar unchanged: a header with a title and a 44px close, 16px row inset, 16px title. A child with no header is non-conforming however it was opened. |
| D6 | The stack owns depth; no surface computes its own. `overlay-stack.ts`'s `parentId` becomes load-bearing rather than decorative, and depth is read from it. |
| D7 | Dismissing a child returns to the parent with its state intact — scroll position, draft values, focus. A child close that rebuilds the parent is a regression, not a refresh. |
| D8 | `003` stays the portal owner, `016` stays the drag owner, `044` stays the grammar owner. This packet consumes all three unchanged and adds the stacking layer above them. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] **The inventory exists and is code-derived.** Every surface that can open while another sheet
      is open, grouped parent → child → opener kind → current → target, each row citing a
      `file:line` opener. **Today: no such document exists**; `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md`
      censuses surfaces one at a time and never asks which opens over which.
- [x] **A parent sheet's bounding box does not move when a child opens**, measured on both edges.
      **Today: unmeasured, and no code path reads the parent when a child mounts** —
      `setSheetMount` (`mobile-bottom-sheet.ts:274`) appends the child to the body and touches
      nothing else.
- [x] **Exactly one scrim while two sheets are open, and it sits between them.** **Today: 1 scrim
      behind both** — `setScrim` (`mobile-bottom-sheet.ts:478`) reuses a single
      `.db-mobile-sheet-scrim` node for however many sheets are open, by design.
- [x] **Every stacked child carries a header with a 44px close.** **Today: 5 surfaces call
      `createSheetHeader` or its equivalent** (`filter-panel-renderer.ts:259`,
      `sort-panel-renderer.ts:113`, `toolbar-renderer.ts:1386`, `create-linked-view-modal.ts:59`,
      `view-config-panel-renderer.ts:388`) **and not one of them is a stacked child.**
- [x] **The topmost sheet holds the keyboard inset and the sheet beneath it holds zero**, proven by
      a negative control. **Today: each sheet writes its own `--db-mobile-sheet-bottom` at its own
      placement time** (`popover-position.ts:406`), which is why the operator's filter sheet sits
      at the top of the screen while its own dropdown sits at the bottom.
- [x] **`npm run gate` exits 0 with a permanent lane row per stacked pair, each observed red before
      green.** **Today: `sheet-grammar`'s registry holds 8 surfaces and every one of them is a
      first sheet** (`tools/live/sheet-grammar.mjs:46-68`); no stacked pair is registered.
- [ ] **The operator opens the Properties sheet, the filter sheet's operator dropdown and its
      property picker on iOS and reports each as one stack rather than two sheets.** Only the
      operator closes this row; nothing in this repository can.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened from the 0.0.23 device check | Done | Operator 2026-09-05 07:02 CEST, iPhone, build 0.0.23; screenshots `../scratch/device-2026-09-05/stacked-properties-create-property.png`, `stacked-filter-operator-dropdown.png`, `stacked-filter-property-picker.png` |
| Gate | Done | `npm run gate` `$?` 0, 25 lanes green, 0 red |
| Operator confirmation | Pending | AC-009; ships in 0.0.24 |
| Level chosen | Done | `recommend-level.sh --loc 600 --files 13 --architectural` → Level 2, 64/100, confidence 82%; phase score 10/50 against a threshold of 25, so a standard child |
| Stacked-surface inventory | Done | T001, `stacked-surface-inventory.md` §3 |
| Stacking model | Done | T005-T009; depth, one scrim between the top two, top-only inset, parent treatment |
| Per-child migrations | Done | T010-T016; K1/K3/K4 migrated, K2/K5/K6 already closed by `044` and the gantt leg |
| Lane row per stacked pair | Done | T017-T019; **31 pairs**, three at depth 3, 253 red before 0 green |

### Deviations and findings

| Item | Note |
|------|------|
| D1 was answered ACCEPTED rather than deferred | `decision-record.md` ADR-001. Modals opened from a sheet present as sheets, which covers all 19 `DbModal` subclasses in one change and closes the `fullscreen` question with them. |
| The K5 native `Menu` row was already closed | `rg "new Menu\("` returns nothing in `src`; `calendar-timeline-renderer.ts` reaches `createOwnedMenuForEvent` on the tree this packet opened against. Recorded rather than re-migrated. |
| K2 and K6 needed no work | `044`'s closing leg had already given the owned menu and the date, icon and colour pickers a `createSheetHeader`. The inventory listed them because it was written against the state before that leg landed. |
| Three defects were found by building the model, not by the reports | The dim was written and never rendered (specificity), a press inside a child closed the parent (a hand-kept exemption list), and re-placing a parent detached it. Each is fixed at its producer and recorded in `decision-record.md` or `implementation-summary.md`. |
| The inventory is not written into `003`'s document | This packet's write authority is its own folder. `003/sheet-and-dropdown-inventory.md` is cited as the per-surface census and extended along the stacking axis here rather than edited in place, so neither document restates the other. |
| `044`'s three named `applySheetChrome` bypasses read differently now | `icon-picker-popover.ts:229` and `option-color-picker.ts:104` both reach `positionToolbarPopover` in the current tree, which applies the chrome. Recorded, not re-adjudicated: the count is `044`'s to close. |
| The native `<select>` in the Add view sheet is gone | `003`'s inventory §8 records one at `toolbar-renderer.ts:1371`. `rg 'createEl\("select"' src` returns nothing today, so `044` T008's dropdown swap landed. One fewer stacked child of a native kind. |
<!-- /ANCHOR:log -->
