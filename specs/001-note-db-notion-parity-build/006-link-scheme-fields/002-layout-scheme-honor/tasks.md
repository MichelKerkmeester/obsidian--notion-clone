---
title: "Tasks: Layout Scheme Honor"
description: "Tasks for Board, Gallery, List, and record-detail to honor textLinkScheme through the shared helper."
trigger_phrases:
  - "layout scheme honor tasks"
  - "board gallery list detail"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/006-link-scheme-fields/002-layout-scheme-honor"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored layout-honor child from synthesis rank 3 and final-plan T011"
    next_safe_action: "Implement Board/Gallery/List/RecordDetail one-liners after the table same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-layout-scheme-honor"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Layout Scheme Honor

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

T003–T006 are **one atomic diff** (final-plan T011). Do not ship Board without Gallery / List / detail.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` rank 3 plus `research/final-plan.md` T011 (line-number corrections `:1070` / `:373`) [10m]
- [ ] T002 Confirm child 001 exported `renderDelayedExternalLink` and `assembleSchemeLinkTarget` are importable [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 Board: at the `textRenderMode === "link"` branch (`BoardRenderer.ts:1070`), if `isTextLinkScheme` && assemble ≠ `null`, call the shared helper with raw label + assembled target; else keep today's branch (`src/views/BoardRenderer.ts`) [S]
- [ ] T004 [P] Gallery: same delegation at `GalleryRenderer.ts:594` (`src/views/GalleryRenderer.ts`) [S]
- [ ] T005 [P] List: same delegation at `ListRenderer.ts:554` (`src/views/ListRenderer.ts`) [S]
- [ ] T006 Record detail: same delegation at `RecordDetailPanel.ts:373` (`src/views/RecordDetailPanel.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T007 Click a hinted https / mailto / tel property on Board, Gallery, List, and record-detail; unhinted layouts unchanged [S]
- [ ] T008 Grep the four files for a copied 280 ms timer — expect zero new copies; `npm run build` and `npm run lint` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T006 shipped as one diff
- [ ] Manual verification of T007 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->
