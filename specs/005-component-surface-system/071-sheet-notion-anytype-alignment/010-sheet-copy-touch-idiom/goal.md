---
title: "Goal: Sheet Copy: Touch Idiom"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "010-sheet-copy-touch-idiom goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/010-sheet-copy-touch-idiom"
    last_updated_at: "2026-09-09T22:50:00Z"
    last_updated_by: "sheet-notion-audit"
    recent_action: "Scaffolded from the sheet-notion audit's gap tables"
    next_safe_action: "Execute tasks.md T001-T008"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-notion-audit.md"
      - "src/i18n.ts"
      - "src/views/filter-panel-renderer.ts"
      - "src/views/sort-panel-renderer.ts"
      - "src/views/column-manager-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "010-sheet-copy-touch-idiom-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the operator want the sheet-facing property label to read 'Property' everywhere, aligning with Notion and with our own `panel.addColumn`, or is 'Field' retained as a deliberate distinction?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Copy: Touch Idiom

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** No string that reaches a phone sheet instructs a pointer gesture, the dictionary spells its ellipsis one way, and the sheet-facing label for a property is one word — closing the audit's §3.16 finding that four sheet-reachable strings tell a phone user to click or double-click.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The scope is strings that reach a **phone sheet renderer**, grep-confirmed. The seven further pointer-gesture strings that belong to cells and the desktop table are explicitly out of scope and must not be touched |
| D2 | Every count in this packet is ours, from `src/i18n.ts` counted directly. No Notion asset supplies a number, and none could — every Notion iOS capture here is 299x678 |
| D3 | Non-English dictionaries are updated in the same change; a key whose English loses "double-click" must not keep it in zh-CN or zh-TW |
| D4 | Only the operator's own device recheck may close the alignment judgement; no agent ticks the device row |

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
- [ ] 0 strings that reach a phone sheet renderer name a pointer gesture (today: 4), asserted by a lane or unit clause
- [ ] The EN dictionary spells its ellipsis one way (today: 13 ASCII `...` and 10 U+2026 `…`)
- [ ] The sheet-facing property label is one word across the filter and sort sheets
- [ ] The three locales agree: no key loses a pointer gesture in EN and keeps it in zh-CN or zh-TW
- [ ] Recaptured phone-only light and dark for the two empty states that change
- [ ] Operator's own device re-read reports the copy correct (no agent ticks this row)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-09, worktree `worktrees/272-sheet-notion-audit` |
| Reference inventory | Done | `../sheet-notion-audit.md` §3.16. Notion supplies no counter-example to cite here, only the absence: no Notion iOS capture in the harvest names a pointer gesture. That absence is structural and survives 299x678 |
| Current-state measurement | Done | `src/i18n.ts` EN block (lines 23-1840) counted directly: 4 pointer-gesture strings reach a sheet renderer, 13 ASCII `...` against 10 U+2026 `…`, and `panel.field`="Field" beside `filter.field`="Property" |
| Producer confirmation | Done | Each of the four keys grep-traced to its renderer: `panel.emptyFilters`→`filter-panel-renderer.ts`, `panel.emptySorts`→`sort-panel-renderer.ts`, `panel.doubleClickEdit`→`column-manager-renderer.ts:383`, `viewConfig.computedSync.manualHint`→`view-config-panel-renderer.ts` |
| Gap table | Done | `spec.md` §13 |
| Implementation | Not started | Deferred to `tasks.md` |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it |

### Deviations and findings

| Item | Note |
|------|------|
| The count is exactly four, and the boundary matters | Eleven EN strings name a pointer gesture. Seven belong to cells and the desktop table (`cell.doubleClickRename`, `cell.clickToEdit`, `cell.doubleClickEditFormula`, `cell.doubleClickConfigureRollup`, `formula.errorHint`, `timeline.clickToSetDates`, `modal.groupOrderHint`) and are **out of scope** — a desktop pointer gesture named in a desktop surface is correct copy, not a defect. Only the four that reach a sheet are in scope |
| This is the smallest and safest packet in the audit's set | It touches a dictionary and no layout, so it is ordered first for the implementation leg: it can land and be verified without interacting with any other packet's producer change |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. Where a Notion reading contradicts a landed decision, this packet records it as Proposed in `../sheet-notion-audit.md` §6 rather than resolving it |
<!-- /ANCHOR:log -->
