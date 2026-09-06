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
    last_updated_at: "2026-09-06T14:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Ticked six goal criteria and T001/T002 against what landed at 5aeb7087"
    next_safe_action: "Await the operator device read on the three reported sheets"
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
    completion_pct: 86
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

- [x] No surface presenting as a bottom sheet on the phone bypasses `applySheetChrome`.
      **Today: 3 known bypasses** — `db-mobile-column-width-panel` (`database-view.ts:11412`),
      `db-icon-picker-popover` (`icon-picker-popover.ts:57`), `db-color-picker-popup`
      (`option-color-picker.ts:43`), all built with `doc.body.createDiv`. Target 0, counted against
      the ranked inventory rather than against this grep.
      **Met, re-measured 2026-09-06 at `main` `5aeb7087`.** The `surface` predicate is not a grep:
      `hasSheetSurface` (`src/views/sheet-grammar.ts:73`) requires the panel to carry
      `.db-mobile-bottom-sheet` — the class `applySheetChrome` toggles
      (`mobile-bottom-sheet.ts:64`) — to sit directly on `document.body`, and a
      `.db-mobile-sheet-scrim` to exist. `node tools/live/sheet-grammar.mjs` run this session reads
      `surface: true` on all **14** registered surfaces, the three former bypasses among them
      (`column-width`, `icon-picker`, `option-color-picker`), 2041 PASS / 0 FAIL, exit 0.
      AC-001 carries the producer census behind it: `rg -n 'doc\.body\.createDiv|document\.body\.createDiv' src/views`
      lists six producers and each reaches the screen through `applySheetChrome` or
      `positionToolbarPopover`.
- [x] The column-width adjuster carries all seven grammar elements. **Today: 0 of 7** — the
      operator's capture shows a bare bottom strip, its title starting at x=0 and its slider clipped
      by the left edge.
      **Met.** Landed as T005 on `worktrees/039-column-width-sheet`; `openColumnWidthAdjuster`
      (`src/views/column-width.ts:347`) builds the shared body and calls `buildShellHeader`. Lane
      row this session: `column-width` **8 of 8** columns PASS (surface, handle, header, rows,
      segmented, keyboard, safeArea, dropdown), close target 44.0x44.0, nothing past the right edge,
      and its title centred to within 0.01px of the frame.
- [x] A field focused inside a sheet stays inside the reduced `visualViewport` rect, proven by a
      negative control that places it below the reduced bottom with the inset publisher disabled.
      **Today: the keyboard covers the whole adjuster**, per report 40b.
      **Met.** `tools/storybook/verify-placement.mjs` mounts the real `openColumnWidthAdjuster` on a
      390x844 hasTouch/isMobile/is-phone page, focuses the width field and drives both a
      host-declared `--keyboard-height` and a host-silent `visualViewport.height` shrink, requiring
      the panel's bottom edge and the focused field to clear a **331px** keyboard (the figure
      measured off `report-40b-column-width-keyboard.png`) and to return to the floor when it
      closes. The negative control is the one this row asks for: the pre-fix panel's own rectangle
      (`position: fixed; bottom: 0` and nothing else) driven through the identical simulation,
      **observed red** — parked at the screen bottom, the field under the keyboard. T006 carries the
      full account.
- [x] The settings sheet closes from its grab band, and no label in its body wraps against its
      control. **Today: the handle does nothing and "Leave empty to scan the vault root." is clipped
      at the right edge.**
      **Met.** T007's fix (`dbdec603`) took the grab band and title out of the scroller into a fixed
      header with a 44px close routed through `overlayStack.dismissPanel`, leaving
      `.db-view-config-body` the only scroller. **Observed red** first in
      `tools/live/sheet-rebuild.mjs`'s "settings sheet chrome survives its own scroll" case: the
      grab band went 48px to **0px** after a 200px scroll of 1461px of content in a 760px sheet, at
      which point no press could start the gesture; green after, holding 48px through the same
      scroll. The clipping half is closed by the overflow sweep rather than by eye: `settings` is in
      `sheet-grammar.mjs`'s sweep on both Chrome and WebKit, twice — once with the fixtures' own
      strings, once with every vault-derived string replaced by one unbreakable word — and passes
      `scrollWidth <= clientWidth` with nothing past its right edge in all four passes. T015 put the
      body itself on the shared row grammar; the lane reads `settings` 8 of 8.
- [x] The Add view sheet renders every control on a shared row type, with **Title property** as a
      dropdown row. **Today: 0 controls on a row type** — three bare inputs, a select rendered as a
      text input, a bare checkbox and a flat icon list.
      **Met.** T008 rebuilt `showAddViewMenu` (`toolbar-renderer.ts:1354`): header via
      `createSheetHeader`, every field wrapped in `db-panel-row`, the key-field native `select`
      replaced by `createDropdownField`, the duplicate control a `db-checkbox` on a row, the Create
      rows chevroned. **Observed red** on the unchanged tree: `add-view — header: false`,
      `rows: false`, `dropdown: false`, `no List view row: false`. Lane this session: `add-view`
      **8 of 8** plus `no List view row: true`, close target 44.0x44.0.
- [x] `npm run gate` exits 0 with `sheet-grammar` registered, and the negative control was observed
      red on one surface and green again after restore. **Today: the lane does not exist.**
      **Met.** The lane exists and is registered in `tools/gate.mjs` as the `sheet-grammar` check.
      `checklist.md` CHK-021 records the gate read without a pipe at the phase's own landings
      (`npm run gate; echo $?` → 0, 26 of 26 green, then 25 green after the list-renderer
      retirement removed the `list-window` lane); the landing record for the tree this row is
      re-derived against, `main` `5aeb7087`, reads `npm run gate` 26 green / 0 red. The negative
      control is built into the lane and ran again this session: `PASS sort-panel green before the
      removal`, `PASS handle red on sort-panel after the removal`, `PASS every other row still
      green`, `PASS re-mount clean — handle green again`. Six further controls run beside it and
      each was **observed red** on its injection before returning green: the stacking control, the
      four host-modal chrome injections, the title-centring two-slot restore (27.67px off centre),
      the frame-shape neutralisation, the edge-control token override (60.0x60.0) and the
      overflow sweep's 600px child (374 to 608 and back).
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

### 2026-09-06 amendment: the grammar half of the 10:04 iOS stacked-sheet report

**Operator, 2026-09-06 10:04, iOS 0.0.29** (`../roadmap.md` §4 row 59): *"This sheet is really bad
bugged on current ios …"*. Two of the four defects that capture shows are this packet's grammar,
not `048`'s stacking geometry: **a duplicate close control** — an oversized circular `×` floating
above the child's header beside the header's own, so a stacked child draws two where the grammar
allows one — and **a header/body ink split**, the child's body painting a lighter surface than its
own header, so a single sheet reads as two stacked surfaces before any stacking is involved. The
other two, roughly 200 CSS px of dead space above the title and the parent Properties sheet
bleeding through with a "14" count badge, are `048`'s.

**Recorded here, fixed there.** The criterion and the numbers live in `048/goal.md` and
`048/tasks.md` T024, because the leg is one leg and splitting a capture across three task lists
would make each half unverifiable. This entry exists so a later reader looking for why the header
grammar failed on device finds the pointer instead of nothing. The shell both defects render
through is `051`'s `surface-shell.ts`, which is why the leg is sequenced after `051`'s side-sheet
work.
<!-- /ANCHOR:log -->
