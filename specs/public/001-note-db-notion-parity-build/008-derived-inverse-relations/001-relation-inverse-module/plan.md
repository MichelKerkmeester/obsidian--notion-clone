---
title: "Implementation Plan: Relation Inverse Module"
description: "Plan for RelationInverse.ts (locked fan-in exports, SYNC_WRITES_DEFAULT false, sourceDatabaseIds), optional empty Vitest setup.ts, and RelationInverse unit tests. No RelationRollup or view edits."
trigger_phrases:
  - "relation inverse plan"
  - "RelationInverse"
  - "buildRelationInverse"
  - "SYNC_WRITES_DEFAULT"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations/001-relation-inverse-module"
    last_updated_at: "2026-08-25T21:40:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Relation Inverse Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None in this child — inverse is display-only derived data (`types.ts:69` class) |
| **Testing** | Vitest (`vitest.config.ts` points at `src/__tests__/setup.ts`) |

### Overview
Land one EuroFormat-placement leaf plus the harness it needs so empty / dangling / self-relation / alias-strip behavior is proven before any call site imports it. `RelationInverseContext` has no `sourceDatabase` because fan-in is all DBs. Range of this diff is the new module, its test file, and `setup.ts` only if missing.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1 and 8 plus final-plan step 2 read; self-relation is this module, not a later task.
- [x] Locked: `SYNC_WRITES_DEFAULT = false`, no write branch, no `buildRelationRollups` callee.
- [x] Vitest gap recorded: share 007's `setup.ts` or add the empty stub.

### Definition of Done
- [ ] `RelationInverse.ts` exports the locked symbols with no write APIs.
- [ ] `npx vitest run src/data/RelationInverse.test.ts` green on the step-2 cases.
- [ ] No edits to `RelationRollup.ts`, `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts`, `RelationLinks.ts`, `types.ts`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module (`EuroFormat.ts:1-10` placement): durable-why header, no plugin state, no writes. Imports allowed (`App`, `parseRelationValues`, types, `NoteRecord`).

### Key Components
- **`buildRelationInverse(context)`**: one pass over fan-in edges. Index relation columns by `targetDatabaseId` (`RelationRollup.ts:28-32` filter); iterate `getRecordsForDatabase` (`DataSource.ts:229-232`); parse → resolve → skip null → `seenPaths` → membership → append.
- **`RelationInverseResult`**: `inboundByPath` plus `sourcePaths` and `sourceDatabaseIds` for later refresh. A tiny helper next to the builder merges those sets for the two view copies (no view imports).
- **Tests**: fixture edges in memory; no vault writes.

### Data Flow
`context.databases` + `getRecordsForDatabase` → parse stored wikilinks → resolve via `metadataCache.getFirstLinkpathDest` → `inboundByPath` / `sourcePaths` / `sourceDatabaseIds`. Persistence is forbidden here.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Producers: new `RelationInverse.ts`. Consumers in this child: `RelationInverse.test.ts` only. Later consumers (not this diff): `RelationRollup.ts` (child 002) and the two `buildRowsWithRelations` copies (child 003). Algorithm invariant: never write the target; never call `buildRelationRollups` from the inverse.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm live fork `RelationRollup.ts:10-16,28-32,36,50-56,69-75,71,73-74`, `RelationLinks.ts:15-19,23-26`, `DataSource.ts:229-232`, `EuroFormat.ts:1-10`.
- [ ] Record whether `src/__tests__/setup.ts` already exists from 007.

### Phase 2: Core Implementation
- [ ] Create `RelationInverse.ts` with locked exports and the inverted scan.
- [ ] Create `RelationInverse.test.ts`; add empty `setup.ts` only if missing.

### Phase 3: Verification
- [ ] `npx vitest run src/data/RelationInverse.test.ts` green.
- [ ] Confirm no write APIs and no call-site file edits.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | empty, cardinality-1 list, many-to-one, dangling, cross-db miss, multi-DB same-key fan-in, self-relation once, alias/`#` strip, `SYNC_WRITES_DEFAULT === false` | Vitest (`npx vitest run src/data/RelationInverse.test.ts`) |
| Integration | Not this child (`aggregateRollup` round-trip is child 002) | — |
| Manual | None — no rollup or view wiring yet | — |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot match scan contracts |
| Existing `parseRelationValues` / rollup scan | Internal | Exists | Inverse must reuse, not reimplement |
| Vitest already in fork `package.json` | Internal | Configured; setup may be missing | Tests unloadable until `setup.ts` exists |
| Child 002 / 003 | Internal | Later | This child must own the exports so 002 does not duplicate the scan |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Module writes a target note; calls `buildRelationRollups`; `SYNC_WRITES_DEFAULT` is true; tests cannot load.
- **Procedure**: Delete `RelationInverse.ts` and `RelationInverse.test.ts` as a unit. Leave `setup.ts` if 007 (or another phase) already needs it.
<!-- /ANCHOR:rollback -->
