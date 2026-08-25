---
title: "Tasks: Format Parse Persist"
description: "Additive parseConditionalFormats tasks for conditionTree, icon, bold, and optional color."
trigger_phrases:
  - "format parse persist tasks"
  - "parseconditionalformats"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons/002-format-parse-persist"
    last_updated_at: "2026-08-25T21:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored format-parse-persist child from synthesis rank 4 and final-plan step 5"
    next_safe_action: "Parse conditionTree/icon/bold/optional color in DataSource.parseConditionalFormats"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-format-parse-persist"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Format Parse Persist

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

T003 stays `[B]` until child 001 types and 009 `normalizeViewFilterTree` exist. Color-optional parse is the same file as T003 (final-plan merge of T014 into parse).
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 additive fields exist at `types.ts:143-152` and 009 `normalizeViewFilterTree` is importable (do not call `parseSourceRuleTree` at `SourceRules.ts:227-257`) (`src/data/types.ts`, `src/data/ViewFilterTree.ts`) [S]
- [ ] T002 Read `parseConditionalFormats` at `DataSource.ts:800-825` and the db-level copy at `:761-765` (`src/data/DataSource.ts`) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 [B] **Parse** — additive `conditionTree` via `normalizeViewFilterTree`; `icon` string ≤64 chars; `bold` boolean; keep requiring a parseable `condition` object; stop requiring `color` (if present it must still be in `OPTION_COLORS`, today's `:815`); unknown extra keys ignored (E10); invalid tree dropped, `condition` kept; leave `:761-765` as `{...rule.condition}` (`src/data/DataSource.ts:800-825`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 [B] Color-only JSON loads unchanged; tree+icon+bold JSON loads; color-omitted icon/bold JSON loads; malformed tree dropped with `condition` kept (`src/data/DataSource.ts`) [S]
- [ ] T005 [B] Grep CF parse for `parseSourceRuleTree` (must be empty); confirm extra keys ignored (E10) and db-level copy still `{...rule.condition}` (`761-765`) (`src/data/DataSource.ts`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` remaining after 009 + child 001
- [ ] `parseSourceRuleTree` not used
- [ ] Manual verification of T004–T005 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 4
- **Parent final-plan**: `../research/final-plan.md` step 5
<!-- /ANCHOR:cross-refs -->
