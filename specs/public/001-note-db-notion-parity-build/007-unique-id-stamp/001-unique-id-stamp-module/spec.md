---
title: "Feature Specification: Unique-ID Stamp Module"
description: "Create a zero-runtime-import UniqueIdStamp.ts allocator with UniqueIdConfig, parseUniqueIdConfig, and nextUniqueId (pad-3 defaults), plus the missing Vitest setup and UniqueIdStamp unit tests."
trigger_phrases:
  - "unique id stamp module"
  - "UniqueIdStamp"
  - "parseUniqueIdConfig"
  - "nextUniqueId"
  - "INV-001"
  - "pad width 3"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/007-unique-id-stamp/001-unique-id-stamp-module"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored UniqueIdStamp module child from synthesis ranks 1 and 5 and final-plan step 1"
    next_safe_action: "Implement UniqueIdStamp.ts and its vitest harness"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-unique-id-stamp-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Unique-ID Stamp Module

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
| **Phase** | 1 of 3 |
| **Predecessor** | None |
| **Successor** | 002-unique-id-config-persist |
| **Handoff Criteria** | Module exports UniqueIdConfig, parseUniqueIdConfig, and nextUniqueId; unit cases green; types.ts and DataSource.ts untouched |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 3** — Parent: [`../spec.md`](../spec.md) · Successor: `002-unique-id-config-persist`. Independent of phases `006-link-scheme-fields` and `008-derived-inverse-relations` (`depends_on: none`).

This child is synthesis ranked items 1 (module) and 5 (defaults) plus `research/final-plan.md` step 1 and the harness half of step 8. Defaults live in the pure formatter and parser; they are not a later task. Do not attach `uniqueId` to `DatabaseConfig` here — that is child 002.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork writes frontmatter in `planCreateEntry` (`CreateEntryPlan.ts:119-173`) but has no sequential identity allocator. Notion auto-assigns a data-source-scoped unique ID at page create (`TASK-1234`). AppFlowy and Anytype only inject view defaults and mint UUIDs, so the finance sequence is Notion-specific parity. A create-time `INV-001` stamp is Effort S only if the math lives in a EuroFormat-shaped leaf that later call sites can import without pulling Obsidian APIs.

### Purpose
Create `src/data/UniqueIdStamp.ts` as a zero-runtime-import module (`EuroFormat.ts:1-42` precedent) exporting `UniqueIdConfig`, `parseUniqueIdConfig`, and `nextUniqueId`, with documented defaults (missing prefix → `001`, pad 3, field `unique-id`) and unit tests that the existing `vitest.config.ts` can actually load.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/UniqueIdStamp.ts`: durable-why header only (stable identity at create; do not couple to file name). Zero runtime imports; type-only imports allowed.
- Export `UniqueIdConfig` with `prefix?: string`, `counter: number`, `padWidth?: number`, `field: string`. Parse/normalize must fill defaults so a YAML stub `{ prefix: "INV" }` does not throw (`research/final-plan.md` trap 6).
- Export `parseUniqueIdConfig(raw): UniqueIdConfig | undefined`. Absent/non-object → `undefined` (opt-in). Present object → `counter=0`, `prefix=""` after `prefix.trim()`, `padWidth=3`, `field="unique-id"`.
- Export `nextUniqueId(cfg)`: `Number.isFinite(cfg.counter) && cfg.counter >= 0` else counter `0`; pad default 3 when `padWidth` missing or `< 1`; `prefix.trim()` then `prefix ? `${prefix}-${number}` : number` (do not honor a trailing hyphen — would emit `INV--001`). Returns `{ value, nextCounter }`. Does not persist.
- Bootstrap `src/__tests__/setup.ts` (empty stub required by `vitest.config.ts`; currently missing so vitest is unloadable) and `src/data/UniqueIdStamp.test.ts`.
- Unit cases from final-plan step 1: `INV`+0 → `INV-001` / `nextCounter=1`; missing prefix → `001`; `{}` → field `unique-id`; non-object → `undefined`.

### Out of Scope
- `types.ts` `DatabaseConfig` attachment and `DataSource.ts` parse/serialize (child `002-unique-id-config-persist`).
- `CreateEntryPlan.ts` stamp and `DatabaseView.ts` wiring, core-template guard, persist/rollback, paste (child `003-create-entry-stamp`).
- A 13th `ColumnDef.type`, `ColumnTypes.ts` edits, config UI modal, read-only cells, lookup URLs, lock files, vault scans.
- A `package.json` `"test"` script (run `npx vitest run src/data/UniqueIdStamp.test.ts`).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/UniqueIdStamp.ts` | Create | Pure allocator: `UniqueIdConfig`, `parseUniqueIdConfig`, `nextUniqueId` |
| `src/__tests__/setup.ts` | Create | Empty Vitest stub required by `vitest.config.ts` |
| `src/data/UniqueIdStamp.test.ts` | Create | Unit tests for parse defaults and nextUniqueId formatting |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `src/data/UniqueIdStamp.ts` exists as a EuroFormat-shaped leaf | Zero runtime imports; durable-why header only; exports `UniqueIdConfig`, `parseUniqueIdConfig`, `nextUniqueId`; compiles under the fork TypeScript config |
| REQ-002 | Opt-in parse with documented defaults | `parseUniqueIdConfig` returns `undefined` for absent/non-object input; a present object fills `counter=0`, empty prefix, `padWidth=3`, `field="unique-id"`; `{ prefix: "INV" }` does not throw |
| REQ-003 | `nextUniqueId` formats prefix + pad-3 sequence | `INV` + counter 0 → value `INV-001` and `nextCounter=1`; missing/empty prefix → `001`; pad `< 1` or omitted → 3; `prefix.trim()` so a trailing hyphen does not emit `INV--001` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Vitest can load and run UniqueIdStamp tests | `src/__tests__/setup.ts` exists; `npx vitest run src/data/UniqueIdStamp.test.ts` executes the step-1 unit cases; no new `package.json` script |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npx vitest run src/data/UniqueIdStamp.test.ts` is green on `INV`+0 → `INV-001`, missing prefix → `001`, `{}` → field `unique-id`, non-object → `undefined`.
- **SC-002**: `UniqueIdStamp.ts` imports nothing at runtime (`EuroFormat.ts:1-42` model).
- **SC-003**: `types.ts`, `DataSource.ts`, `CreateEntryPlan.ts`, and `DatabaseView.ts` are untouched in this child's diff.

### Acceptance Scenarios

- **Given** `parseUniqueIdConfig({ prefix: "INV" })`, **when** `nextUniqueId` runs with the parsed config, **then** the value is `INV-001` and `nextCounter` is `1`.
- **Given** a present empty object `{}`, **when** parse runs, **then** field is `unique-id`, pad is 3, and the first value is `001`.
- **Given** `null` or a string, **when** parse runs, **then** the result is `undefined` (opt-in).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | `UniqueIdConfig.field` required in the sketch vs optional in Scenario 5 | Parser throws on `{ prefix: "INV" }` | Parse/normalize fills defaults; formatter must not throw |
| Risk | User-supplied trailing hyphen | Emits `INV--001` | `prefix.trim()` then include hyphen only when prefix is non-empty |
| Risk | Vitest unloadable | Step-1 accept cases cannot run | Empty `src/__tests__/setup.ts` required by `vitest.config.ts` |
| Dependency | None on child 002/003 | — | This module is the type owner; 002 imports the type |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: opt-in parse (`undefined` when the block is absent), prefix-less format is `001`, pad 3 as a documented fork extension over Notion's unpadded `TASK-3`, field key `unique-id`.
<!-- /ANCHOR:questions -->
