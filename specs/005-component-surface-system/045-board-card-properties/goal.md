---
title: "Goal: Board Card Properties"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "045 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/045-board-card-properties"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the durable directive from the operator's board-properties ask"
    next_safe_action: "Execute against the completion criteria"
    blockers:
      - "Reference-fidelity boundary with 038 REQ-007 must hold before anything else lands"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/data/types.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-045-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the gallery share the mechanism, or get its own"
      - "Does the control reach the reference card's five semantic slots"
    answered_questions: []
---
# Goal: Board Card Properties

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A board view owns an ordered, per-field visibility list for its cards, edited from a
Notion-style Properties control, so arranging a card no longer means editing the table.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | The list is per view and lives on `ViewConfig`. It is not `hiddenColumns` and not `columnOrder`. The board stops reading the table's visible-column set in the same change that adds the list — a period where both are read would make the behaviour unexplainable. |
| D2 | Absent means derive. A view with no stored list reproduces today's three implicit rules exactly, so upgrading changes nothing until the operator touches the control. |
| D3 | Cover and title are always present and are not list entries. `boardImageField` and `titleField` keep their current meanings. |
| D4 | **Reference fidelity outranks this feature.** The default board is `038`'s one-to-one kanban copy with a fixed five-slot map. This control renders only where `boardExtensionsEnabled` is on, and a stored list must have zero effect on the reference path. If the two ever conflict, the reference wins and this control is narrowed. |
| D5 | Gallery is a question, not scope. The mechanism may generalise; committing it here would widen the packet past what was asked. |
| D6 | The migration's correctness is proved by a capture pair, not by a unit test. A card that quietly lost a field is invisible to every test anyone would write for this feature. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Three to seven bullets, each checkable without opening another file.

- [ ] Two board views over one database render different card field sets in different orders, with
      the database's table column visibility unchanged. **Today: not expressible** —
      `board-renderer.ts:1439` reads the same `getVisibleColumns` result the table reads.
- [ ] A `status` column can be made to render in the card's meta grid. **Today: impossible** —
      `board-renderer.ts:1481-1482` removes every `select` and `status` column from the grid
      unconditionally, routing them to the title chips instead.
- [ ] An existing view with no stored list renders a byte-identical card after the change.
      **Today: N/A, nothing has changed yet** — the proof is a before/after capture pair with
      `pixelHash` and `layoutHash` unchanged, not a unit test.
- [ ] With `boardExtensionsEnabled` off, a stored properties list has zero effect and `038`'s board
      parity fixtures are unchanged. **Today: trivially true; the point is that it stays true.**
- [ ] The Properties control opens on desktop and on the phone, the phone one built from `044`'s
      sheet row grammar with an explicit move affordance. **Today: the control does not exist.**
- [ ] **The operator arranges a board card's properties on a phone and reports it as close to
      Notion's.** Only the operator closes this row.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Operator directive 2026-09-04 ~20:40 CEST, verbatim: "Also make it possible to adjust visible properties in board card like notion" |
| Current field-selection rules read | Done | `board-renderer.ts:1439` (`getColumns`), `:1475` (title chips), `:1478-1483` (three exclusions), `database-view.ts:477`/`:808`/`:833`/`:865` (shared `getVisibleColumns`) |
| Reference slot set read | Done | `board-renderer.ts:552` `getReferenceCardFields` → `time`, `progress`, `due`, `tags`, `people`; `specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts:10` `KanbanCardProps` |
| Persisted shape | Pending | `tasks.md` T003 |

### Deviations and findings

| Item | Note |
|------|------|
| The ask reads as a feature and is mostly a decoupling | The operator asked for a Properties control. Building it on today's field selection would give a control that edits the table. The decoupling is the work; the control is the visible part of it. |
| Four overlapping visibility concepts already exist | `hiddenColumns`, `columnOrder`, `showEmptyFields` and the renderer's own type exclusions. Adding a fifth without removing the board's use of the first two is how this stays confusing, which is why D1 pairs the addition with the removal. |
| `030` retired the gallery | So "gallery cards may share the mechanism" is a question about surviving renderers, and it is recorded as one rather than acted on. |
<!-- /ANCHOR:log -->
