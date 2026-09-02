---
title: "Decision Record: Subtask Tree Port"
description: "Architecture decisions for the normalized subtask relation and its single write path."
trigger_phrases: ["040 decision record", "subtask tree port adr"]
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/040-subtask-tree-port"
    last_updated_at: "2026-09-02T23:59:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "ADR-001 and ADR-002 recorded, both Proposed"
    next_safe_action: "Accept both ADRs once the relation module and transaction helper land"
    blockers: []
    key_files: ["decision-record.md", "spec.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-040-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: Subtask Tree Port

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The subtask relation is a derivation over RowData, not a nested field

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-02 |
| **Deciders** | markdown-agent (scaffold), pending in-runtime implementer |

---

<!-- ANCHOR:adr-001-context -->
### Context

`obsidian-pm-main` keeps a recursive in-memory tree: `Task.subtasks: Task[]`
(`specs/context/obsidian-pm-main/src/types.ts:44-55`) plus a derived `TaskIndex`
(`specs/context/obsidian-pm-main/src/store/TaskIndex.ts:10-19`). This repo's authoritative shape is one
flat `RowData` per note (`src/data/types.ts:158-169`): `file`, `frontmatter`, `cache`, `computed`,
`computedErrors`. Porting the reference's nested tree literally onto `RowData` would create a second
persistence authority that can drift from the note on disk.

### Constraints

- `RowData` is read by every renderer, editor and migration in the codebase; adding a nested,
  potentially stale `subtasks` field risks silent divergence from frontmatter.
- The relation must support depth, ancestors, visibility and cycle detection, none of which `RowData`
  currently carries.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: build the subtask relation as a pure, DOM-free derivation over `RowData[]` in
`src/data/subtask-relation.ts`, rebuilt whenever the row-pipeline output changes, rather than adding a
field to `RowData`.

**How it works**: `subtask-relation.ts` reads each row's `parentId` (hydrated from frontmatter) and
produces a map of parent-to-ordered-children, depth, ancestor chains and visibility, without mutating
any `RowData`. Renderers consume this derived structure read-only; nothing writes into it directly.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Derivation over RowData[] (chosen)** | Single source of truth stays frontmatter; no drift risk; matches existing pipeline architecture | Requires rebuilding the index on every pipeline change (mitigated: existing pipeline already rebuilds on change) | 9/10 |
| Nested `subtasks: RowData[]` field on `RowData` | Closer literal match to the reference's `Task.subtasks` | Second tree that can disagree with frontmatter; every consumer of `RowData` must now reason about a recursive field | 3/10 |

**Why this one**: the reference's own architecture accepts a recursive in-memory tree because it owns
its own persistence layer end to end; this repo's persistence is the note file itself, so a derivation
keeps exactly one source of truth.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- No risk of a stale in-memory subtask tree disagreeing with what a user's note actually says.
- Every consuming surface (board, timeline, table/tree) reads the same derived structure through the
  same seam.

**What it costs**:
- The relation is rebuilt on every row-pipeline change rather than incrementally patched. Mitigation:
  the existing row-pipeline already rebuilds on every relevant change (search/filter/sort/limit), so
  this adds one more derivation stage to an already-rebuild-on-change pipeline (NFR-P01 measures this).

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Rebuild cost grows with row count | M | NFR-P01 measures rebuild time at 500+ rows before this ADR is accepted |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The port requires parent/child relations that `RowData` does not have today |
| 2 | **Beyond Local Maxima?** | PASS | Nested-field alternative explicitly considered and rejected above |
| 3 | **Sufficient?** | PASS | A pure derivation is the minimum needed; no new persistence format added |
| 4 | **Fits Goal?** | PASS | Matches parent `../goal.md` D4 (port, not a second data model) |
| 5 | **Open Horizons?** | PASS | Derivation pattern extends to future relation types without new persistence |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `src/data/subtask-relation.ts` (new): pure derivation function(s) over `RowData[]`.
- `src/data/row-pipeline.ts`: one new optional stage calling the derivation after row build.

**How to roll back**: delete `subtask-relation.ts` and the pipeline stage call; no frontmatter data is
touched by the derivation itself, so rollback has no data-migration step.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: A single atomic transaction helper is the only write path for parentId/subtaskIds

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-02 |
| **Deciders** | markdown-agent (scaffold), pending in-runtime implementer |

---

### Context

Reference tree operations (`TaskTreeOps.ts:38-68`, `:108-121`) mutate an in-memory tree directly. This
repo's persistence is per-note frontmatter, so a cross-parent move touches at least three notes (old
parent, new parent, moved child) that must update together or not at all, and a move must never create
a cycle.

### Constraints

- No renderer currently has a write path to frontmatter outside the existing row/source pipeline.
- A partial write (one parent updated, the other not) produces an orphaned or duplicated child
  reference that is difficult to detect later.

---

### Decision

**We chose**: route every `parentId`/`subtaskIds` write through one transaction helper in
`src/data/subtask-serialize.ts`, which validates for cycles before writing and applies all affected
notes' frontmatter changes together.

**How it works**: the helper takes a move/reorder request, walks the ancestor chain of the target
parent to check for the moved node among its own descendants (cycle check), and only if clear, writes
the child's `parentId`, both parents' `subtaskIds`, and the sibling rank in one call. A rejected cycle
check returns an error and writes nothing.

---

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Single transaction helper (chosen)** | One place to reason about atomicity and cycle safety; renderers stay read-only consumers | Slightly more indirection for callers | 9/10 |
| Each renderer writes its own frontmatter updates | Less code to route through a shared helper | Duplicated cycle-check logic; higher risk of one renderer's write path missing the atomicity guarantee | 3/10 |

**Why this one**: the reference plugin's own architecture channels all tree mutation through
`TaskTreeOps`, its single mutation module; this repo's equivalent is one transaction helper feeding the
existing frontmatter write path.

---

### Consequences

**What improves**:
- A cycle can never be committed to frontmatter, verified by SC-003.
- A cross-parent move is atomic by construction, verified by SC-002.

**What it costs**:
- Board and timeline action contracts must route move/reorder calls through this helper rather than
  writing directly. Mitigation: this is exactly the seam named in `spec.md` §3 (`board-renderer.ts:90-99`).

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A caller bypasses the helper and writes frontmatter directly | H | Code review against `spec.md`'s files-to-change list (AC-010); no other module in this phase writes `parentId`/`subtaskIds` |

---

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Cross-parent moves touching multiple notes need atomicity and cycle safety |
| 2 | **Beyond Local Maxima?** | PASS | Per-renderer write alternative considered and rejected |
| 3 | **Sufficient?** | PASS | One helper covers add/update/delete/reorder/move, matching `TaskTreeOps`'s scope |
| 4 | **Fits Goal?** | PASS | Matches parent `../goal.md` D4 and this packet's D2 |
| 5 | **Open Horizons?** | PASS | A single write path is the natural extension point for future relation writes |

**Checks Summary**: 5/5 PASS

---

### Implementation

**What changes**:
- `src/data/subtask-serialize.ts` (new): the atomic transaction helper.
- `src/views/board-renderer.ts`, `src/views/calendar-timeline-renderer.ts`: move/reorder calls route
  through the helper instead of writing frontmatter directly.

**How to roll back**: revert the helper and the two renderer call-site changes; no frontmatter written
during testing touches product notes.
<!-- /ANCHOR:adr-002 -->
