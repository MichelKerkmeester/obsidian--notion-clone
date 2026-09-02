---
title: "Goal: Subtask Tree Port"
description: "Port obsidian-pm-main's recursive subtask model near one-to-one into this repo's per-note frontmatter model, and the criteria that decide when it is done."
trigger_phrases: ["040 goal", "subtask tree port goal", "parentId subtaskIds goal"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/040-subtask-tree-port"
    last_updated_at: "2026-09-02T23:59:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Packet opened from 036 adoption plan row 4"
    next_safe_action: "Write the relation-fixture check that fails on the current renderer (plan.md step 1)"
    blockers: []
    key_files: ["spec.md", "plan.md", "acceptance-criteria.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-040-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Goal: Subtask Tree Port

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Port `obsidian-pm-main`'s recursive subtask model — normalized parent index,
`parentId`/`subtaskIds` hydrate and serialize, cycle-safe move and reorder, depth and expand UI, inline
add, progress display — near one-to-one into this repo's per-note frontmatter model, per
`../036-obsidian-pm-ui-harvest`'s adoption plan row 4 (`../036-obsidian-pm-ui-harvest/research/research.md:401`)
and the parent program's `../goal.md` D4/D5.

### Decisions

| ID | Decision |
|----|----------|
| D1 | **The relation is a derivation, never a persisted second tree.** `RowData` (`src/data/types.ts:158-169`) stays the flat one-record-per-note shape; the parent index, depth, ancestors and visibility are rebuilt from `RowData[]` and from frontmatter, never stored as a nested `subtasks` field. A relation that could drift from the note on disk is a data-loss bug, not a convenience. |
| D2 | **One write path.** A single atomic transaction helper in `src/data/subtask-serialize.ts` is the only code that writes `parentId`/`subtaskIds` to frontmatter. No renderer writes these fields directly. A move either fully commits (both parents, child, ranks) or fully rejects (cycle detected); no partial write. |
| D3 | **Explicit and derived progress are distinct fields, and derived never overwrites explicit.** Ported from `SubtasksPanel.ts:23-48`'s done/total display, adapted so an author-set value is never silently replaced by a computed one. |
| D4 | **Table view, bottom sheets, and formulas/rollups/summaries/calculations stay ours**, unmodified by this port, per `../036-obsidian-pm-ui-harvest/research/research.md:404-419`'s do-not-borrow list. |
| D5 | **Every claim about `obsidian-pm-main` cites a `file:line`; every claim about this repo's code cites a local `file:line` that was actually read**, per the parent program's evidence standard. A citation not re-verified at port time is treated as unconfirmed, not as fact. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

None of these is ticked. None may be ticked by the runtime that wrote the fix — only an in-runtime
verifier that reads the actual test/gate output ticks a row (D3 of the parent program's own goal.md).

- [ ] **A relation-fixture test observed failing red, then passing green.** Where recorded:
      `src/data/subtask-relation.test.ts`; the failing value is the exit/assertion output from
      `plan.md` step 1, run before `subtask-relation.ts` exists.
- [ ] **Hydrate/serialize round-trips a 3-level fixture with no field loss.** Where recorded: SC-001 in
      `acceptance-criteria.md`, evidenced by the round-trip test's before/after diff.
- [ ] **A cross-parent move updates both parents' `subtaskIds`, the child's `parentId`, and sibling
      ranks atomically, in one observed transaction.** Where recorded: SC-002, evidenced by a
      before/after diff of the relation state around the move call.
- [ ] **A cycle-creating move is rejected and leaves the relation byte-for-byte unchanged.** Where
      recorded: SC-003, evidenced by re-reading the fixture after the rejected call and diffing
      against the pre-call state.
- [ ] **Explicit and derived progress are asserted as distinct, and derived never overwrites
      explicit.** Where recorded: SC-004.
- [ ] **`npm run gate` prints `gate: PASS` and exits 0 on the final state, read directly (not through a
      pipe).** Where recorded: SC-005, task T017.
- [ ] **`styles.css` lane released with a recapture read**, naming the changed depth/expand/progress
      captures in a `reviewed` array. Where recorded: task T014-T015.
- **Operator-only** (device confirmation, separate from the runtime checks above — shipped, verified
  and operator-confirmed are three states; only the third closes a row):
  - [ ] Operator confirms the subtask tree — expand/collapse, inline add, cross-parent drag, progress
        display — on an installed build, on device.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile section below; not part of the directive.

**LOG.** Scaffolded 2026-09-02 by the markdown agent from `../036-obsidian-pm-ui-harvest`'s adoption
plan row 4. No implementation has run. `037-timeline-gantt-port`, `038-board-kanban-port` and
`039-calendar-parity-port` (orders 1-3) have not been observed opened as of this scaffold; this
packet's renderer-seam line citations (`board-renderer.ts:90-99,750-789`;
`calendar-timeline-renderer.ts:391-445,704-738`) should be re-verified against current disk state
before editing if any of those siblings land first, per `spec.md` R-004.
<!-- /ANCHOR:log -->
