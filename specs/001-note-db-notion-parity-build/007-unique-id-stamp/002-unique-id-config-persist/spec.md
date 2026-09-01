---
title: "Feature Specification: Unique-ID Config Persist"
description: "Attach UniqueIdConfig to DatabaseConfig and round-trip database.uniqueId through parseDatabaseConfig and the toDatabasePayload whitelist so the allocator counter survives reload."
trigger_phrases:
  - "unique id config persist"
  - "DatabaseConfig uniqueId"
  - "toDatabasePayload uniqueId"
  - "parseDatabaseConfig uniqueId"
  - "db_view counter persist"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Unique-ID Config Persist

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `007-unique-id-stamp` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 3 |
| **Predecessor** | 001-unique-id-stamp-module |
| **Successor** | 003-create-entry-stamp |
| **Handoff Criteria** | uniqueId round-trips through parse and payload; ColumnDef.type union unchanged; no stamp yet |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-unique-id-stamp-module` · Successor: `003-create-entry-stamp`. Depends on child 001's `UniqueIdConfig` and `parseUniqueIdConfig`.

This child is synthesis ranked item 2 and `research/final-plan.md` steps 2–3. Parse and serialize are **one file and one diff**: `toDatabasePayload` (`DataSource.ts:1041-1063`) is a whitelist, so `uniqueId` silently vanishes unless both sides change. Do not stamp rows here.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion owns the unique-ID counter server-side (only `prefix` is configurable). The fork must store `{ field, prefix, counter, padWidth }` inside the view-definition `database` object or reload restarts the sequence. `parseDatabaseConfig` merges `fm` then `database` (`DataSource.ts:628-637`) and returns a closed object at `773-793`. `toDatabasePayload` at `1041-1063` drops unknown keys. A `settings.ts` counter path is a ghost: `isShowingFileDatabase()` is hardcoded `true` (`DatabaseView.ts:935-937`) and `saveViewEntryConfig` writes only when `entry.sourcePath` is a `TFile` (`6127-6131`).

### Purpose
Add `uniqueId?: UniqueIdConfig` to `DatabaseConfig` (`types.ts:256-291`) via a type-only import from `UniqueIdStamp.ts`, parse it with `parseUniqueIdConfig(source["uniqueId"] ?? database["uniqueId"])` in the `parseDatabaseConfig` return, and emit it from `toDatabasePayload` when present so a YAML stub `{ prefix: "INV" }` round-trips.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `src/data/types.ts:256-291`: `uniqueId?: UniqueIdConfig` on `DatabaseConfig`. `import type { UniqueIdConfig } from "./UniqueIdStamp"` — do not duplicate the interface. No change to the `ColumnDef.type` union at `types.ts:50`.
- `src/data/DataSource.ts` `parseDatabaseConfig` return (`773-793`): `uniqueId: parseUniqueIdConfig(source["uniqueId"] ?? database["uniqueId"])`.
- `src/data/DataSource.ts` `toDatabasePayload` (`1041-1063`): emit `uniqueId` when present; omit the key when unset.
- Writes already go `updateViewDefFile` → `enqueueWrite` → `f["database"] = this.toDatabasePayload(dbConfig)` (`991-1001`). No new write path.
- Negative check: do not edit `ColumnTypes.ts:125-138`; `text` already stores `INV-001`.

### Out of Scope
- `UniqueIdStamp.ts` implementation (child 001).
- `planCreateEntry` stamp, `DatabaseView` wiring, core-template guard, counter increment on create, paste, rollback (child 003).
- `settings.ts` counter path; lock files; sidecar files; vault scans.
- Config UI modal + i18n (ranked item 9, out of this phase).
- A 13th column type.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/types.ts` | Modify | `uniqueId?: UniqueIdConfig` on `DatabaseConfig` via type-only import (call site 1) |
| `src/data/DataSource.ts` | Modify | Parse in `parseDatabaseConfig` return (`773-793`) **and** serialize in `toDatabasePayload` (`1041-1063`) (call site 2, one file) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `DatabaseConfig` carries `uniqueId` without duplicating the interface | `types.ts:256-291` has `uniqueId?: UniqueIdConfig`; type-only import from `./UniqueIdStamp`; compiles; `ColumnDef.type` at `types.ts:50` unchanged |
| REQ-002 | Parse fills defaults and stays opt-in | `parseDatabaseConfig` sets `uniqueId: parseUniqueIdConfig(source["uniqueId"] ?? database["uniqueId"])` at the return (`773-793`); missing/non-object → no `uniqueId` (opt-in); present stub `{ prefix: "INV" }` yields filled defaults |
| REQ-003 | Payload whitelist emits `uniqueId` when present | `toDatabasePayload` (`1041-1063`) includes `uniqueId` when set and omits the key when unset so the whitelist cannot drop a parsed block |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | No 13th type and no settings-store path | `ColumnTypes.ts` untouched; no `settings.ts` counter; persistence stays the existing `updateViewDefFile` → `enqueueWrite` path (`991-1001`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A view-def YAML stub `database.uniqueId: { prefix: "INV" }` parses to a filled `UniqueIdConfig` and serializes back with `prefix: "INV"` plus defaults (`counter`, `padWidth`, `field`).
- **SC-002**: A database without a `uniqueId` block still omits the key in `toDatabasePayload`.
- **SC-003**: `types.ts:50` and `ColumnTypes.ts:125-138` are unchanged.

### Acceptance Scenarios

- **Given** `database.uniqueId: { prefix: "INV" }` on a view-def file, **when** `parseDatabaseConfig` then `toDatabasePayload` run, **then** the payload contains `uniqueId` with prefix `INV` and default pad/field/counter.
- **Given** no `uniqueId` key, **when** parse+payload run, **then** the payload has no `uniqueId` field.
- **Given** this child's diff, **when** inspected, **then** `CreateEntryPlan.ts` and `DatabaseView.ts` are untouched.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Serialize omitted | Parsed `uniqueId` never writes; reload restarts at 0 | Same-diff REQ-003 with parse |
| Risk | Settings-store persist invented | Dead code: `isShowingFileDatabase()` is `true` (`935-937`) | File-backed `updateViewDefFile` only |
| Risk | Duplicate `UniqueIdConfig` in types.ts | Two shapes drift | Type-only import from UniqueIdStamp |
| Dependency | Child 001 exports | Cannot type or parse | Start after UniqueIdStamp.ts exists |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: opt-in (no block → no key), YAML `database.uniqueId` is sufficient for v1 (no modal), `uniqueId` lives on `DatabaseConfig` not `ViewConfig`.
<!-- /ANCHOR:questions -->
