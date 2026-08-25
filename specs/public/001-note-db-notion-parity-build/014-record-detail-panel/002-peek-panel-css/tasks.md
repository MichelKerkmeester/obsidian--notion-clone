---
title: "Tasks: Peek Panel CSS"
description: "Tasks to append one styles.css block for peek panel, hover OPEN, and phone-persistent OPEN with theme variables only."
trigger_phrases:
  - "peek panel css tasks"
  - "db-record-open-btn"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel/002-peek-panel-css"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored peek-panel CSS child from synthesis ranks 4 and 6 and final-plan step 4"
    next_safe_action: "Append the delimited styles.css block after class names from child 001"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-peek-panel-css"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Peek Panel CSS

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

- [ ] T001 Read parent `research/synthesis.md` ranks 4 and 6 plus `research/final-plan.md` step 4; confirm class names from child `001-table-record-peek-module` [15m]
- [ ] T002 Confirm container `position: relative; overflow: auto` at `styles.css:63-125`, hover idiom `:770`, calendar detail `:7543-7618` (do not edit), theme vars `:35-45` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Append a delimited block at EOF of `styles.css`** — selectors only under `.note-database-container` (and `body.is-phone` for OPEN). Rules: `.db-record-open-btn` `opacity: 0`; `tr:hover .db-record-open-btn { opacity: 1 }` (idiom `:770`); `body.is-phone .db-record-open-btn { opacity: 1 }`; `td.db-title-cell { position: relative }`; `.db-record-peek-panel` absolute right dock `top:0; right:0; bottom:0; width: min(360px, 100%)`, `overflow-y: auto`, wrap, z-index 998; `.db-record-peek-field` wrap (no `nowrap` / ellipsis). Theme variables only (`:35-45` / `:7547-7548, 7600`). Zero `.db-toolbar*` / `.db-record-detail-*` (`styles.css`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 `git diff styles.css` is one appended block; grep of that diff for `toolbar` / `patchToolbarNew` / `.db-record-detail-` is empty [S]
- [ ] T005 Confirm phone rule and z-index 998 (below calendar `:7544`) are present [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T004–T005 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 4, 6
- **Parent final-plan**: `../research/final-plan.md` step 4
<!-- /ANCHOR:cross-refs -->
