---
title: "Tasks: Scheme Column Width"
description: "Tasks for ColumnWidth to measure scheme-hint text cells like link-mode labels."
trigger_phrases:
  - "scheme column width tasks"
  - "parseTextLink label"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/004-scheme-column-width"
    last_updated_at: "2026-08-25T19:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored column-width child from synthesis rank 5 and final-plan T013"
    next_safe_action: "Implement ColumnWidth scheme-hint measuring after the table same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-scheme-column-width"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Scheme Column Width

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
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` rank 5 plus `research/final-plan.md` T013 (`ColumnWidth.ts:17-31,48,101-105`) [10m]
- [ ] T002 Confirm child 001 `isTextLinkScheme` is importable [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Auto-width** — when `isTextLinkScheme(col.textLinkScheme)`, measure the visible raw label (not the assembled href), matching link-mode `parseTextLink` label behavior at `:22-26` (`src/views/ColumnWidth.ts:17-31`) [S]
- [ ] T004 **Wrap sites** — same diff as T003: apply the same label rule at `:48` and `:101-105`; leave unhinted and `textRenderMode === "link"` paths intact (`src/views/ColumnWidth.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Manual: auto-width a `https`-hinted column of short labels; confirm it does not size on `https://…`; compare unhinted and link-mode columns [S]
- [ ] T006 `npm run build`; `npm run lint`; no CSS file; `types.ts:50` untouched [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped as one diff
- [ ] Manual verification of T005 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->
