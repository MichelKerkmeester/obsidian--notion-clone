---
title: "Tasks: Unique-ID Config Persist"
description: "Tasks for uniqueId on DatabaseConfig plus parseDatabaseConfig and toDatabasePayload whitelist edits. Parse and serialize are one atomic DataSource.ts diff."
trigger_phrases:
  - "unique id persist tasks"
  - "toDatabasePayload"
  - "DatabaseConfig uniqueId"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/007-unique-id-stamp/002-unique-id-config-persist"
    last_updated_at: "2026-08-25T21:35:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored uniqueId persist child from synthesis rank 2 and final-plan steps 2-3"
    next_safe_action: "Add uniqueId to DatabaseConfig and wire parseDatabaseConfig plus toDatabasePayload"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-unique-id-config-persist"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Unique-ID Config Persist

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

T004 parse and T005 serialize are **one atomic `DataSource.ts` diff**. Do not ship parse without payload.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 left `UniqueIdStamp.ts` exporting `UniqueIdConfig` and `parseUniqueIdConfig`; read synthesis rank 2 and final-plan steps 2–3 [15m]
- [ ] T002 Confirm live lines `types.ts:256-291`, `DataSource.ts:773-793`, `1041-1063`, whitelist drop, and `updateViewDefFile` at `991-1001` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Call site 1 — `types.ts:256-291`**: `import type { UniqueIdConfig } from "./UniqueIdStamp"`; add `uniqueId?: UniqueIdConfig` on `DatabaseConfig`; do not duplicate the interface; do not change `ColumnDef.type` at `types.ts:50` (`src/data/types.ts`) [S]
- [ ] T004 **Parse** — same `DataSource.ts` diff as T005: in `parseDatabaseConfig` return (`773-793`) set `uniqueId: parseUniqueIdConfig(source["uniqueId"] ?? database["uniqueId"])` (`src/data/DataSource.ts`) [S]
- [ ] T005 **Serialize** — same diff as T004: in `toDatabasePayload` (`1041-1063`) emit `uniqueId` when present and omit it when unset (`src/data/DataSource.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T006 Round-trip stub `{ prefix: "INV" }` through parse+payload; omit the key when unset (SC-001 / SC-002) [S]
- [ ] T007 Confirm `ColumnTypes.ts` untouched, no `settings.ts` counter path, `npx vitest run src/data/UniqueIdStamp.test.ts` still green [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T004–T005 shipped as one `DataSource.ts` diff
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 2
- **Parent final-plan**: `../research/final-plan.md` steps 2–3
<!-- /ANCHOR:cross-refs -->
