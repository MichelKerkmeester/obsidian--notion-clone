---
title: "Tasks: Create-Entry Unique-ID Stamp"
description: "Same-seam tasks for planCreateEntry stamp, DatabaseView wiring, core-template allocate-once, create-then-persist, paired rollback, and paste inherit."
trigger_phrases:
  - "create entry stamp tasks"
  - "stampUniqueId"
  - "unique id rollback"
  - "paste unique id"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/007-unique-id-stamp/003-create-entry-stamp"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored create-entry stamp child from synthesis ranks 1, 3, 4, 6, 8 and final-plan steps 4-7"
    next_safe_action: "Stamp in planCreateEntry and wire DatabaseView create-then-persist with paired rollback"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-create-entry-stamp"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Create-Entry Unique-ID Stamp

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

T003–T007 are **one atomic create-plan seam**. Do not ship the stamp without wiring, core-template allocate-once, persist+rollback, and paste verify.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm children 001–002 left `nextUniqueId` and a round-tripping `DatabaseConfig.uniqueId`; read synthesis ranks 1, 3, 4, 6, 8 and final-plan steps 4–7 [15m]
- [ ] T002 Confirm live lines `CreateEntryPlan.ts:78-98`, `:170-172`, `:304-316`; `DatabaseView.ts:3543`, `:3554-3557`, `:3560-3635`, `:3638-3671`, `:3654-3659`, `:6076-6088`, `:6147-6152`, `:8737-8906` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Call site 3 — `CreateEntryPlan.ts`**: extend `CreateEntryPlanInput` (`78-98`) with `uniqueId?: UniqueIdConfig`; after `plan.filename = resolveFilename(ctx)` (`170-172`), if `input.uniqueId` is set, field is not computed/rollup (`312-316`), and `plan.frontmatter[field]` is empty, `nextUniqueId` then write value + `input.uniqueId.counter = nextCounter` and freeze `padWidth`/`field` (`src/data/CreateEntryPlan.ts`) [S]
- [ ] T004 **Wiring — `buildCreateEntryPlan` (`3638-3671`)**: optional `stampUniqueId` (default true); pass `this.getActiveDb()?.uniqueId` by reference; do not read uniqueId off `ViewConfig` (`src/views/DatabaseView.ts`) [S]
- [ ] T005 **Core-template once (`3554-3557`)**: first call `stampUniqueId: false`; second call stamps and copies the stamped field into `defaults` (`3654-3659`); non-core / paste (`8759`) stamps on the single call (`src/views/DatabaseView.ts`) [S]
- [ ] T006 **Create-then-persist + rollback (`3560-3635`)**: after successful `createNote`, `saveViewEntryConfig(..., { skipHistory: true })` (`6147-6152`); outer catch always `replaceDatabaseConfig` if unique-id was bumped; persist failure after create: restore + `trashNote` (mirror `3612-3621`); never persist-then-create (`src/views/DatabaseView.ts`) [S]
- [ ] T007 **Paste inherit (`8737-8906`)**: verify plan-map stamps before `createNote` so `configChanged` at `8790` is true; edit only if paste-with-rename double-stamps; `FileRenamePlan.ts:19-22` stays path-only (`src/views/DatabaseView.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T008 Manual: YAML `database.uniqueId: { prefix: "INV" }`; two rows → `INV-001` / `INV-002`; reload continues; missing block → no stamp; pre-existing notes unstamped (SC-001 / SC-004) [S]
- [ ] T009 Core-template create increments once; failed `createNote` leaves counter unchanged in memory and on disk; persist failure does not leave a live note with a rolled-back counter (SC-002 / SC-003) [S]
- [ ] T010 Rename does not change the property (`FileRenamePlan.ts:19-22`); paste writes one final counter; `npx vitest run src/data/UniqueIdStamp.test.ts` still green; diff stays UniqueIdStamp + types + DataSource + CreateEntryPlan + DatabaseView + tests/setup (final-plan step 9) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T007 shipped as one create-plan seam
- [ ] Manual T008–T010 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1, 3, 4, 6, 8
- **Parent final-plan**: `../research/final-plan.md` steps 4–7 (diff gate step 9)
<!-- /ANCHOR:cross-refs -->
