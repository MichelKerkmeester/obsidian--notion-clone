---
title: "Goal: Phone Sheet Alignment"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "044 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/044-phone-sheet-alignment"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the durable directive from reports 40, 41 and 43"
    next_safe_action: "Execute against the completion criteria"
    blockers:
      - "Operator device confirmation is the only row that closes this phase"
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/database-view.ts"
      - "src/settings.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-044-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Settings body: local row grammar, or a wrapper restyling host Setting rows in place"
      - "Keyboard avoidance: unconditional in applySheetChrome, or opt-in per instance"
    answered_questions: []
---
# Goal: Phone Sheet Alignment

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every sheet and dropdown instance on the phone renders one shared bottom-sheet
grammar, and a non-conforming instance fails a check here rather than an operator on a device.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | The grammar has exactly seven elements: surface, handle with working drag-to-close, header with a close affordance, padded rows, segmented choices, keyboard avoidance, safe-area inset. Adding an eighth is an amendment; a surface satisfying six is non-conforming. |
| D2 | The sheet module owns all seven. An element a consumer can forget is an element some consumer will forget — that is the measured cause of all three reports, not three separate oversights. |
| D3 | `003` stays the portal owner and `016` stays the drag owner. This phase consumes both unchanged; `attachSheetDragToDismiss` and the flick constants are not touched, so `016`'s measurements stay valid. |
| D4 | The 35px grab band is an operator-confirmed accepted shortfall (`../roadmap.md` §4 row 10). It is reused, not reopened. Raising it to 48px needs the operator, because the shortfall was accepted with evidence in front of them. |
| D5 | Removing **List view** from the Add view picker belongs to `006-list-view-deprecation`. This phase owns the picker's shape and the assertion that the row is gone; it does not perform the removal. |
| D6 | Shipped, verified and operator-confirmed are three states. A green `sheet-grammar` lane does not close this phase — every previous sheet fix on this program passed its own gate and still reached the operator broken. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Three to seven bullets, each checkable without opening another file.

- [ ] No surface presenting as a bottom sheet on the phone bypasses `applySheetChrome`.
      **Today: 3 known bypasses** — `db-mobile-column-width-panel` (`database-view.ts:11412`),
      `db-icon-picker-popover` (`icon-picker-popover.ts:57`), `db-color-picker-popup`
      (`option-color-picker.ts:43`), all built with `doc.body.createDiv`. Target 0, counted against
      the ranked inventory rather than against this grep.
- [ ] The column-width adjuster carries all seven grammar elements. **Today: 0 of 7** — the
      operator's capture shows a bare bottom strip, its title starting at x=0 and its slider clipped
      by the left edge.
- [ ] A field focused inside a sheet stays inside the reduced `visualViewport` rect, proven by a
      negative control that places it below the reduced bottom with the inset publisher disabled.
      **Today: the keyboard covers the whole adjuster**, per report 40b.
- [ ] The settings sheet closes from its grab band, and no label in its body wraps against its
      control. **Today: the handle does nothing and "Leave empty to scan the vault root." is clipped
      at the right edge.**
- [ ] The Add view sheet renders every control on a shared row type, with **Title property** as a
      dropdown row. **Today: 0 controls on a row type** — three bare inputs, a select rendered as a
      text input, a bare checkbox and a flat icon list.
- [ ] `npm run gate` exits 0 with `sheet-grammar` registered, and the negative control was observed
      red on one surface and green again after restore. **Today: the lane does not exist.**
- [ ] **The operator opens the column-width adjuster, the settings sheet and the Add view sheet on
      iOS and reports each as aligned with the other sheets.** Only the operator closes this row;
      nothing in this repository can.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened from reports 40, 41, 43 | Done | Operator directives 2026-09-04 ~20:37-20:44 CEST, screenshots `report-40-column-width-sheet.png`, `report-40b-column-width-keyboard.png`, `report-41-settings-sheet.png`, `report-43-add-view-sheet.png` |
| Column-width leg | In Progress | `worktrees/039-column-width-sheet` |
| Settings leg | In Progress | `worktrees/040-settings-sheet` |
| Instance ranking | Pending | Blocked on `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md` |

### Deviations and findings

| Item | Note |
|------|------|
| Two legs started before this packet was written | The operator reported 40 and 41 before the phase existed, and both were dispatched immediately. The packet was opened around them rather than restarting them; the shared chrome (T004) is what they must both consume, and that is the risk this row records. |
| The inventory is a dependency written by another agent | T002 and T009 are `[B]` on it. The three reported sheets are named tasks now so the phase is not idle while it lands. |
| Report 43's sheet is `013-add-view-sheet`'s | `013` is marked Shipped + verified. That it shipped and still reads as "bad design" is itself evidence for D2: `013` satisfied its own criteria, which never included conformance to a grammar that had not been written down. |
<!-- /ANCHOR:log -->
