---
title: "Implementation Plan: Create-Entry Unique-ID Stamp"
description: "Plan for planCreateEntry stamp, DatabaseView by-reference wiring, core-template allocate-once, create-then-persist, paired rollback, and paste inherit. One create-plan seam."
trigger_phrases:
  - "create entry stamp plan"
  - "stampUniqueId"
  - "unique id rollback"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/007-unique-id-stamp/003-create-entry-stamp"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Create-Entry Unique-ID Stamp

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork `Obsidian Plugin/src` |
| **Storage** | Frontmatter on the new note plus `DatabaseConfig.uniqueId.counter` via `saveViewEntryConfig` (`6147-6152`) |
| **Testing** | UniqueIdStamp unit tests stay green; manual YAML create/reload/rename |

### Overview
Call site 3 plus its only consumer land with persist+rollback. Stamp only on the **final** plan. Order: clone `beforeConfig` → allocate in the final plan → `createNote` → persist `{ skipHistory: true }`. On failure, paired restore (and `trashNote` if the note exists).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Children 001–002 specified; this child needs `nextUniqueId` and a round-tripping `uniqueId` block.
- [x] Final-plan steps 4–7 and synthesis ranks 1, 3, 4, 6, 8 read.
- [x] Persist-then-create ruled out; paste lifecycle is the model (`8737-8906`).

### Definition of Done
- [ ] Two sequential `planCreateEntry` calls with the same config object yield `INV-001` then `INV-002`.
- [ ] Core-template create increments once.
- [ ] Failed `createNote` leaves counter unchanged in memory and on disk.
- [ ] Paste stamps; rename does not change the property; missing block does not stamp.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
EuroFormat call site 3 (`CreateEntryPlan.ts`) plus existing consumer (`DatabaseView.ts`). Not a new subsystem.

### Key Components
- **`planCreateEntry`**: stamp after `:170-172`; mutate `input.uniqueId` in place; freeze `padWidth`/`field`.
- **`buildCreateEntryPlan`**: `stampUniqueId` flag; `getActiveDb()?.uniqueId` by reference.
- **`createEntry` / paste**: create-then-persist; paired rollback.

### Data Flow
Opt-in live `entry.config.uniqueId` → `planCreateEntry` → frontmatter field + in-memory `counter++` → `createNote` → `saveViewEntryConfig(..., { skipHistory: true })`. Debounce (`6076-6088`) writes the **final** counter, never a reread of disk mid-burst.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Producers: `CreateEntryPlan.ts` stamp, `DatabaseView.ts` wiring. Consumers: `createEntry` (`3554-3635`), paste (`8751-8906`). Unchanged: `FileRenamePlan.ts:19-22` (path only), `ColumnTypes.ts`, `DataSource.createNote` for non-database callers. Invariant: never persist-then-create; never restore the counter while a note still lives.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 002 left `DatabaseConfig.uniqueId` round-tripping.
- [ ] Confirm live lines `CreateEntryPlan.ts:78-98`, `:170-172`, `DatabaseView.ts:3554-3557`, `:3638-3671`, `:3560-3635`, `:8737-8906`.

### Phase 2: Core Implementation
- [ ] Extend input and stamp after `:170-172`.
- [ ] Wire `stampUniqueId` + by-reference `getActiveDb()?.uniqueId`.
- [ ] Core-template first call false, second stamps; copy into `defaults`.
- [ ] Create-then-persist + always-rollback + persist-failure trash; verify paste.

### Phase 3: Verification
- [ ] Manual YAML `prefix: "INV"` two-create + reload.
- [ ] Core-template once; failed create; paste; rename; missing block.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | UniqueIdStamp tests still green | Vitest |
| Manual | Two creates, reload, core-template, paste, rename, opt-in miss, failed create | Obsidian fork |
| Regression | `FileRenamePlan.ts:19-22` still path-only; no stamp on computed/rollup | Manual / code review |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-unique-id-stamp-module` | Internal | Planned first | No `nextUniqueId` |
| `002-unique-id-config-persist` | Internal | Planned second | Counter cannot survive reload |
| Paste path `8737-8906` | Internal | Exists | Copy its create-then-persist lifecycle |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Double-stamp on core-template; burned counter on `createNote` failure; duplicate on persist-failure rollback; paste double-stamp.
- **Procedure**: Revert `CreateEntryPlan.ts` and `DatabaseView.ts` together. Leave UniqueIdStamp + types/DataSource persist (children 001–002) intact.
<!-- /ANCHOR:rollback -->
