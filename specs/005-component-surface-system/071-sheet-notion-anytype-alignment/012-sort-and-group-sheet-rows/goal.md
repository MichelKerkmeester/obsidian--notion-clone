---
title: "Goal: Sort and Group Sheet Rows"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "012-sort-and-group-sheet-rows goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/012-sort-and-group-sheet-rows"
    last_updated_at: "2026-09-09T22:50:00Z"
    last_updated_by: "sheet-notion-audit"
    recent_action: "Scaffolded from the sheet-notion audit's gap tables"
    next_safe_action: "Execute tasks.md T001-T010"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-notion-audit.md"
      - "src/views/sort-panel-renderer.ts"
      - "src/views/toolbar-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "012-sort-and-group-sheet-rows-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Which reorder affordance survives on the sort sheet — the ⋮⋮ drag handle or the ↑↓ arrow pair? Notion's group sheet uses a 6-dot grip alone, but no capture shows a Notion sort rule being reordered (audit C-4)"
      - "Does the group sheet's shown/hidden partition reuse `panel.shownSection`/`panel.hiddenSection`, or does a group need its own words?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sort and Group Sheet Rows

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A sort rule reads as two labelled rows with a named Delete rather than one row carrying five controls, the sheet keeps one reorder affordance rather than two, and the group sheet gains the Shown/Hidden partition and header-level bulk actions the properties and record sheets already use — closing the audit's §3.10 and §3.11 findings.

### Decisions

| ID | Decision |
|----|----------|
| D1 | No numeric target in this packet may be derived from a Notion asset. Every Notion iOS capture here is 299x678; the Notion column is structural and every number is ours |
| D2 | Row pitch, panel padding, divider grammar and the native-select count are regression-checked, not re-designed — `005` converged them and the lane proves them (sort 2/2 @48px, group 17/17 @44px, padding 16px/16px, 0 native selects) |
| D3 | The `×` glyph's expanded `::before` hit area (`styles.css:13820`) already clears the 44px floor. Replacing it with a labelled row is a **legibility** change, not a touch-target fix, and must not be justified as one |
| D4 | The reorder question is not decided in this scaffold. T004 measures both affordances and the packet records the choice with its evidence; if the operator supplies audit C-4, that capture decides it |
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
- [ ] A sort rule renders its property and direction on two rows with a labelled destructive Delete
- [ ] The sort sheet carries one reorder affordance, not two, with the choice recorded and evidenced
- [ ] The group sheet partitions its groups into Shown and Hidden with a bulk action on each header
- [ ] No group row carries more than 4 interactive controls
- [ ] No regression on `005`'s sort and group clauses, both engines
- [ ] Recaptured phone-only light and dark, with a measured before/after recorded
- [ ] Operator's own device re-read reports both sheets aligned (no agent ticks this row)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-09, worktree `worktrees/272-sheet-notion-audit` |
| Reference inventory | Done | `../sheet-notion-audit.md` §3.10 and §3.11. Sort: `screenshots/notion/ios/database/notion-ios-database-sort-01-*.webp`, `-02-*.webp` and five frames of `flows/sorting-a-database/` — a rule is a property row, a direction row indented beneath it, and a red labelled `Delete`, all in one card. Group: `flows/grouping-a-database/notion-ios-flow-grouping-a-database-03-*.webp` and `flows/group-2/notion-ios-flow-group-2-02..04-*.webp` — a `Groups` section header with a `Hide all` link, per-group rows of 6-dot grip + name + eye, and a sub-group view that splits into `Visible groups` / `Hidden groups`. All 299x678, read for structure only |
| Current-state measurement | Done | `node tools/live/sheet-grammar.mjs` PASS exit 0: sort 2/2 rows @48px, span 357px, row inset 16.0px, 0 native selects; group 17/17 rows @44px, span 341px, 1 section heading, padding 16px/16px |
| Visual read | Done | `screenshots/notion-clone/panels/constructed-sort-panel-mobile-light.png` (804x1748) opened: each rule row carries ↑, ↓, a field dropdown, a direction dropdown and a `×` — five controls; labels fit, which is why this is P2 and the filter sheet is P1 |
| Gap table | Done | `spec.md` §13 |
| Implementation | Not started | Deferred to `tasks.md` |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it |

### Deviations and findings

| Item | Note |
|------|------|
| Two reorder affordances ship on one row | `sort-panel-renderer.ts:182-205` builds a `⋮⋮` drag handle **and** an up/down button pair on every rule row. Notion's group sheet shows a 6-dot grip alone. No capture shows a Notion sort rule being reordered at all, so the audit records this as needing an operator capture (C-4) rather than asserting Notion's answer |
| A 150-character paragraph renders inside the sort sheet | `sortPanel.calendarHint` is emitted at `sort-panel-renderer.ts:124`. No Notion sheet in the harvest carries prose of that length. The target — sheet-body prose at or under 80 characters, or moved behind an info affordance — is ours, not Notion's |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. Where a Notion reading contradicts a landed decision, this packet records it as Proposed in `../sheet-notion-audit.md` §6 rather than resolving it |
<!-- /ANCHOR:log -->
