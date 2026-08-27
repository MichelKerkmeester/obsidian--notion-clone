---
title: "Feature Specification: Create-Entry Unique-ID Stamp"
description: "Stamp unique IDs in planCreateEntry, wire DatabaseView by reference, allocate once across the core-template rebuild, and persist the counter after create with paired rollback so paste inherits the stamp."
trigger_phrases:
  - "create entry unique id"
  - "planCreateEntry stamp"
  - "stampUniqueId"
  - "core-template allocate once"
  - "unique id rollback"
  - "paste unique id"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/007-unique-id-stamp/003-create-entry-stamp"
    last_updated_at: "2026-08-25T21:35:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Create-Entry Unique-ID Stamp

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `007-unique-id-stamp` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 3 |
| **Predecessor** | 002-unique-id-config-persist |
| **Successor** | None |
| **Handoff Criteria** | Two sequential creates yield INV-001 then INV-002; core-template increments once; failed createNote leaves counter unchanged in memory and on disk |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-unique-id-config-persist`. Same create-plan seam: do not ship the stamp without wiring, core-template allocate-once, persist+rollback, and paste inherit.

This child is synthesis ranked items 1 (stamp site), 3, 4, 6, and 8 plus `research/final-plan.md` steps 4–7. `buildCreateEntryPlan` (`DatabaseView.ts:3638-3671`) is the sole caller of `planCreateEntry`. Persist-then-create is forbidden (burns a number). Create-then-persist matches paste (`8737-8906`).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Even after children 001–002, creates never allocate. `planCreateEntry` overlays source rules then sets `plan.filename = resolveFilename(ctx)` (`CreateEntryPlan.ts:170-172`) and returns. `createEntry` rebuilds the plan when `template?.engine === "core"` (`DatabaseView.ts:3554-3557`), so a naive stamp increments twice. The outer catch (`3628-3634`) restores config only when `registeredGroupOption` is true. `uniqueId` lives on `DatabaseConfig`, not `ViewConfig` (`3638-3642`); passing `config.uniqueId` is a type error. Same-tick creates must increment the in-memory counter (`synthesis` rank 3) because `saveConfigImmediately` (`6076-6088`) can flush a stale pending save.

### Purpose
Stamp after the source-rule overlay when `input.uniqueId` is set, the field is empty, and the field is not computed/rollup (`CreateEntryPlan.ts:312-316`); pass `this.getActiveDb()?.uniqueId` **by reference**; skip the first core-template plan (`stampUniqueId: false`); persist with `saveViewEntryConfig(..., { skipHistory: true })` after a successful `createNote`; always roll back a bumped counter; on persist failure after create, restore **and** `trashNote` (mirror `3612-3621`).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `CreateEntryPlanInput` (`78-98`): `uniqueId?: UniqueIdConfig`. After `plan.filename = resolveFilename(ctx)` (`170-172`), if `input.uniqueId` is set, field is not computed/rollup (`312-316`), and `plan.frontmatter[field]` is empty: `nextUniqueId` then `plan.frontmatter[field] = value; input.uniqueId.counter = nextCounter`; freeze `padWidth`/`field` on `input.uniqueId`. Schemaless write is already legal (`304-310`).
- `DatabaseView.buildCreateEntryPlan` (`3638-3671`): new optional `stampUniqueId` arg (default `true`); pass `this.getActiveDb()?.uniqueId` by reference when stamping. Do **not** read uniqueId off the `ViewConfig`. `getCreateContextConfig` (`4014-4026`) merges folders/rules/schema only.
- Core-template once (`3554-3557`): first `buildCreateEntryPlan(..., { stampUniqueId: false })` only feeds `resolveCoreRecordTemplate(template, plan.filename)`; second call stamps. Skip-if-present is necessary but not sufficient — the second call seeds `contextFrontmatter` from column defaults + template + `defaults` (`3654-3659`), not from the first plan. Copy the stamped field into `defaults` on the second call as defense; templates already strip `db_view`/`database` (`RecordTemplate.ts:25-26`), not arbitrary keys.
- Create-then-persist (`3560-3635`): clone `beforeConfig` (already at `3543`) → stamp in the **final** plan → `createNote` (`3561-3567`; `DataSource.ts:328-358`) → `saveViewEntryConfig(entry, mutation, { skipHistory: true })` (`6147-6152`). Never persist-then-create.
- Rollback: on `createNote` failure always `replaceDatabaseConfig(entry.config, beforeConfig)` if `uniqueId` was bumped (not only `registeredGroupOption`). On persist failure after a successful create: restore config **and** `trashNote` (mirror `3612-3621`). Never restore the counter while leaving the note.
- Paste (`8737-8906`): already clones `before` at `8737`, maps `buildCreateEntryPlan` at `8751-8762` / `8759`, persists once at `8790-8796`, restores `before` at `8872-8887`. Verify the plan-map stamps before `createNote` so `configChanged` at `8790` is true. Edit only if paste-with-rename double-stamps (`8764-8767` is path-only via `FileRenamePlan.ts:19-22`).
- Rapid same-device creates: increment in-memory in `planCreateEntry`; never re-read the last disk counter inside a burst; debounced save writes the final counter (`6076-6088`).
- Manual accept: YAML `database.uniqueId: { prefix: "INV" }`; two creates → `INV-001` / `INV-002`; reload continues; rename does not change the property; pre-existing notes unstamped; missing block → no stamp.

### Out of Scope
- `UniqueIdStamp.ts` / tests (child 001) and `types.ts` / `DataSource.ts` persist shape (child 002).
- Stamp inside `DataSource.createNote` (non-database callers).
- Config UI modal, read-only cells, lookup URLs, lock files, vault scans, 13th type, `settings.ts` persist, persist-then-create.
- Reverting the counter on undo (`pushHistory({ type: "created", file })` at `3623` plus `skipHistory` leaves a hole; invoice identity).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/CreateEntryPlan.ts` | Modify | Call site 3: input field + stamp after line 172 |
| `src/views/DatabaseView.ts` | Modify | Wiring, core-template once, create-then-persist, paired rollback; verify paste |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Stamp at create after the source-rule overlay | `planCreateEntry` writes the id when `input.uniqueId` is set and `plan.frontmatter[field]` is empty; two sequential calls with the same config object yield `INV-001` then `INV-002`; already-set field does not increment |
| REQ-002 | Live `DatabaseConfig` advances by reference | `buildCreateEntryPlan` passes `this.getActiveDb()?.uniqueId` by reference via `stampUniqueId` (default true); `entry.config.uniqueId.counter` advances; `ViewConfig` is not the source |
| REQ-003 | Core-template rebuild allocates once | First `buildCreateEntryPlan` uses `stampUniqueId: false`; second stamps; a core-template create increments the counter once |
| REQ-004 | Create-then-persist with paired rollback | After successful `createNote`, `saveViewEntryConfig(..., { skipHistory: true })`; failed `createNote` leaves counter unchanged in memory **and** on disk; persist failure restores config and `trashNote` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Paste and rename inherit correctly | Bulk/paste stamps via `buildCreateEntryPlan` (`8751-8779` / `8759`); `configChanged` at `8790` is true so one `updateViewDefFile` writes the final counter; rename (`FileRenamePlan.ts:19-22`) does not change the property |
| REQ-006 | Opt-in, schemaless, skip computed/rollup | Missing `uniqueId` block → no stamp; schemaless YAML write (`304-310`) does not crash create; never stamp computed/rollup keys (`312-316`, `DatabaseView.ts:3656`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Two creates on a finance DB with `uniqueId: { prefix: "INV" }` yield `INV-001` then `INV-002`; reload continues the sequence.
- **SC-002**: A core-template create increments the counter once.
- **SC-003**: Failed `createNote` leaves the counter unchanged in memory and on disk; persist failure does not leave a live note with a rolled-back counter.
- **SC-004**: Pre-existing notes stay unstamped; missing `uniqueId` block does not stamp; rename leaves the property unchanged.

### Acceptance Scenarios

- **Given** `database.uniqueId` with `prefix: "INV"`, **when** the user creates two rows, **then** the properties are `INV-001` and `INV-002`.
- **Given** `template?.engine === "core"`, **when** `createEntry` rebuilds the plan at `3554-3557`, **then** the counter advances once.
- **Given** `createNote` throws, **when** the outer catch runs, **then** `replaceDatabaseConfig` always restores `beforeConfig` if unique-id was bumped.
- **Given** paste creates several rows, **when** persist runs at `8790-8796`, **then** one write stores the final counter.
- **Given** no `uniqueId` block, **when** a row is created, **then** no unique-id property is written.
- **Given** a stamped note, **when** renamed, **then** the unique-id property is unchanged.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Persist-then-create | Burned number plus extra disk rollback if `createNote` throws | Create-then-persist (match paste) |
| Risk | Core-template double plan | Two allocations, one discarded | `stampUniqueId: false` on the first call; copy stamp into `defaults` |
| Risk | `uniqueId` read off `ViewConfig` | Type error; session config never mutates | `this.getActiveDb()?.uniqueId` by reference (`783-785` / `entry.config`) |
| Risk | Debounced save writes a stale counter | Duplicate ids on rapid creates | Synchronous in-memory increment in `planCreateEntry` |
| Risk | Rollback only on `registeredGroupOption` | Burned id on a normal create failure | Always `replaceDatabaseConfig` when unique-id was bumped |
| Risk | Two devices before iCloud merge | Duplicate ids (`spec.md` §6) | Document best-effort; no locks |
| Dependency | Children 001 and 002 | No allocator / no persist shape | Start after uniqueId round-trips |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: opt-in, pad 3 already frozen on first allocate, `skipHistory` (do not reissue after undo), leave `text` cells editable, YAML config is enough (no modal), accept `DatabaseView.ts` as wiring for call site 3.
<!-- /ANCHOR:questions -->
