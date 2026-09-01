---
title: "Tasks: Relation Inverse Module"
description: "Tasks for RelationInverse.ts locked exports, SYNC_WRITES_DEFAULT false, optional Vitest setup.ts, and RelationInverse unit fixtures."
trigger_phrases:
  - "relation inverse tasks"
  - "RelationInverse"
  - "buildRelationInverse"
  - "vitest setup"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations/001-relation-inverse-module"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored RelationInverse module child from synthesis ranks 1 and 8 and final-plan step 2"
    next_safe_action: "Implement RelationInverse.ts plus RelationInverse.test.ts and setup.ts if missing"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-relation-inverse-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Relation Inverse Module

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

T003–T005 are **one atomic diff**. Do not ship `RelationInverse.ts` without the fixtures that lock empty / dangling / self-relation behavior.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 1 and 8 plus `research/final-plan.md` step 2 (module, locked exports, inverted scan, `SYNC_WRITES_DEFAULT = false`) [15m]
- [ ] T002 Confirm live lines `RelationRollup.ts:10-16,28-32,36,50-56,69-75,71,73-74`, `RelationLinks.ts:15-19,23-26`, `DataSource.ts:229-232`, `EuroFormat.ts:1-10`, and whether `src/__tests__/setup.ts` already exists [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/data/RelationInverse.ts`**: durable-why header only; no class; no plugin hooks; no `vault.*write*` / `processFrontMatter`; export `RelationInverseContext` (no `sourceDatabase`), `RelationInverseEdge`, `RelationInverseResult { inboundByPath, sourcePaths }`, `buildRelationInverse`, `SYNC_WRITES_DEFAULT = false`, `sourceDatabaseIds`, and a tiny membership-merge helper with no view imports; algorithm = `RelationRollup.ts:28-32` filter → `getRecordsForDatabase` (`DataSource.ts:229-232`) → parse (`RelationLinks.ts:23-26`) → `getFirstLinkpathDest` (`:71`) → skip null → `seenPaths` → `recordsByPath` membership (`src/data/RelationInverse.ts`) [M]
- [ ] T004 **Harness** — land with T003: reuse 007's empty `src/__tests__/setup.ts` if present, else add it. No `package.json` `"test"` script (`src/__tests__/setup.ts`) [S]
- [ ] T005 **Unit tests** — land with T003: empty inbound; cardinality-1 is still a list; many-to-one union; dangling skip; cross-db miss; multi-DB same-key fan-in; self-relation once; alias/`#` strip (`RelationLinks.ts:15-19`); `SYNC_WRITES_DEFAULT === false` (`src/data/RelationInverse.test.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T006 `npx vitest run src/data/RelationInverse.test.ts` green (SC-001) [S]
- [ ] T007 Confirm no write APIs in `RelationInverse.ts` and no diff in `RelationRollup.ts` / `DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts` / `RelationLinks.ts` / `types.ts` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T005 shipped as one diff
- [ ] T006 green
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1, 8
- **Parent final-plan**: `../research/final-plan.md` step 2 (tests also step 6 harness)
<!-- /ANCHOR:cross-refs -->
