---
title: "Tasks: Grouped Table Flatten"
description: "Task list for table dispatch, depth-aware TableRenderer loop, indent CSS, drop-target gate, and full-path create defaults."
trigger_phrases:
  - "grouped table flatten tasks"
  - "depth-aware table loop"
  - "renderGroupedTable"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/002-grouped-table-flatten"
    last_updated_at: "2026-08-25T20:50:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored flatten-loop child from synthesis and final-plan"
    next_safe_action: "Implement table dispatch, TableRenderer loop, and indent CSS"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-grouped-table-flatten"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Grouped Table Flatten

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

T004 is **one loop edit** (indent + hide-subtree + drop-target gate + create defaults). Do not ship dispatch without that loop.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child `001-multifield-grouping-module` shipped module + persist; read parent `research/synthesis.md` ranks 3, 4, 8 plus `research/final-plan.md` steps 3–4 [15m]
- [ ] T002 Re-read `TableRenderer.ts:17-21, 82-155, 148-151, 470`, patch `:209-250`, dispatch `DatabaseView.ts:6332-6333, 9539-9545` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Table dispatch only** — `effectiveGroupFields(config, this.vs()).length > 0` then `renderGroupedTable` at `DatabaseView.ts:6332-6333`. In `renderGroupedTable` `:9539-9545`: `fields = dropComputedGroupFields(effectiveGroupFields(...))`; `flattened = flattenGroupTree(buildGroupTree(this.rows, fields, config, groupFn))`; `tableRenderer.renderGroupedTable(..., flattened, fields[0])`. Do not change gallery/list `:9554-9578` or timeline `:2890-2894`. Leave `tryPatchExternalTableRows` `:2241-2263` on `state.groupByField` (`src/views/DatabaseView.ts`) [S]
- [ ] T004 **Depth-aware loop + CSS + create** — same child as T003: extend `TableGroup` additively `depth?`, `path?`, `field?`, `collapseKey?`, `children?` (`TableRenderer.ts:17-21`). Loop `:82-155`: always header; class `db-group-header--depth-N`; `isGroupCollapsed(fields[0], collapseKey)` / `toggleGroupCollapsed` (`DatabaseView.ts:9845-9856`); if hidden, skip while `depth` is deeper than that ancestor; if `children.length`, skip the leaf table; if leaf: today's table + summaries + `getGroupVisibleCount` + expand. `setupGroupDropTarget` **only at depth 0** using `fields[0]` and the plain leaf `key` (not `collapseKey`). Create: merge `resolveGroupCreateDefaults` for every `(field, key)` in the path; `setupRow` `context.groups` = that array (`:470`); computed level ⇒ no create (`:149-150`). CSS: `padding-left: calc(16px * N)` on `--depth-N` (`styles.css:6171-6185`, `padding: 0` at `6184`); `.db-group-header + .db-group-header { margin-top: 5px }` beside `:6255-6257`; depth ≥ 1 not sticky; toggles 20×20 (`:6218-6219`); `tableMinWidth` per header (`:112`) (`src/views/TableRenderer.ts`, `styles.css`) [M]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 2-field Category/Type: indented headers; hiding Category conceals Type subtree; 1-field DOM/hide keys match today [S]
- [ ] T006 1-field external patch still succeeds; 2-field patch falls back to full render (`TableRenderer.ts:209-250`; `DatabaseView.ts:2199-2272`) [S]
- [ ] T007 Drop on a Type header does not write; new row in `Cat / Type` gets both properties; ≤360px no new media queries, overflow equal to today [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped together
- [ ] Manual verification of T005–T007 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 3, 4, 8
- **Parent final-plan**: `../research/final-plan.md` steps 3–4
<!-- /ANCHOR:cross-refs -->
