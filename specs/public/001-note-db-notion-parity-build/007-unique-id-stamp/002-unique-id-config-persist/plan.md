---
title: "Implementation Plan: Unique-ID Config Persist"
description: "Plan for uniqueId on DatabaseConfig plus parseDatabaseConfig and toDatabasePayload whitelist edits so the allocator block round-trips in the view-def file."
trigger_phrases:
  - "unique id persist plan"
  - "toDatabasePayload"
  - "parseDatabaseConfig uniqueId"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/007-unique-id-stamp/002-unique-id-config-persist"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Unique-ID Config Persist

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork `Obsidian Plugin/src` |
| **Storage** | View-def `database` object via `updateViewDefFile` → `enqueueWrite` (`DataSource.ts:991-1001`) |
| **Testing** | Compile + round-trip a stub through parse+payload; UniqueIdStamp unit tests stay green |

### Overview
Call site 1 (`types.ts`) and call site 2 (`DataSource.ts` parse **and** serialize) land together. `db_view` config **is** the `database` object (`parseDatabaseConfig` merges `fm` then `database`, `DataSource.ts:628-637`). No new persist subsystem.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Child 001 specified as the type owner.
- [x] Synthesis rank 2 and final-plan steps 2–3 read; whitelist drop recorded.
- [x] Settings-store path ruled out (`DatabaseView.ts:935-937`, `6127-6131`).

### Definition of Done
- [ ] `DatabaseConfig` has `uniqueId?: UniqueIdConfig` via `import type`.
- [ ] Parse + payload both carry `uniqueId`.
- [ ] Stub `{ prefix: "INV" }` round-trips; unset omits the key.
- [ ] `types.ts:50` and `ColumnTypes.ts` unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
EuroFormat call sites 1–2: type-only import + existing whitelist. One file for parse+serialize.

### Key Components
- **`types.ts:256-291`**: optional `uniqueId` on `DatabaseConfig`.
- **`parseDatabaseConfig` return `773-793`**: `parseUniqueIdConfig(source["uniqueId"] ?? database["uniqueId"])`.
- **`toDatabasePayload` `1041-1063`**: emit when present.

### Data Flow
View-def YAML `database.uniqueId` → parse → live `DatabaseConfig.uniqueId` → later `toDatabasePayload` → `f["database"]` via `processFrontMatter` (`991-1001`). Counter ticks still happen in child 003.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Producers: `types.ts` field, `DataSource.ts` parse/serialize. Consumers not in this child: `DatabaseView.getActiveDb().uniqueId` (child 003). Unchanged: `ColumnTypes.ts`, `CreateEntryPlan.ts`, `settings.ts`. Invariant: unknown keys stay dropped except the new `uniqueId` whitelist entry.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 left `UniqueIdStamp.ts` exporting `UniqueIdConfig` and `parseUniqueIdConfig`.
- [ ] Confirm live lines `types.ts:256-291`, `DataSource.ts:773-793`, `1041-1063`.

### Phase 2: Core Implementation
- [ ] Type-only import + `uniqueId?: UniqueIdConfig` on `DatabaseConfig`.
- [ ] Parse return + payload emit in the same `DataSource.ts` edit.

### Phase 3: Verification
- [ ] Round-trip `{ prefix: "INV" }`; omit when unset.
- [ ] `npx vitest run src/data/UniqueIdStamp.test.ts` still green; no 13th type.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Existing UniqueIdStamp tests still pass | Vitest |
| Compile | `uniqueId` on `DatabaseConfig`; no `ViewConfig` field | `tsc` / fork build |
| Manual | Optional: inspect a view-def file after a later create (child 003) | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-unique-id-stamp-module` | Internal | Planned first | No `UniqueIdConfig` / `parseUniqueIdConfig` |
| `updateViewDefFile` / `enqueueWrite` | Internal | Exists (`991-1001`, `99-120`) | Do not invent a second writer |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: `uniqueId` parses but never serializes; type duplicated; `ColumnDef.type` union widened.
- **Procedure**: Revert `types.ts` and `DataSource.ts` together. Leave `UniqueIdStamp.ts` (child 001) intact.
<!-- /ANCHOR:rollback -->
