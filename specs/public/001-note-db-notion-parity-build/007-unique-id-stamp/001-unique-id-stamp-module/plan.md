---
title: "Implementation Plan: Unique-ID Stamp Module"
description: "Plan for UniqueIdStamp.ts (UniqueIdConfig, parseUniqueIdConfig, nextUniqueId), empty Vitest setup.ts, and UniqueIdStamp unit tests. No DatabaseConfig or create-plan edits."
trigger_phrases:
  - "unique id stamp plan"
  - "UniqueIdStamp"
  - "parseUniqueIdConfig"
  - "nextUniqueId"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Unique-ID Stamp Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None in this child — `nextUniqueId` does not persist |
| **Testing** | Vitest (`vitest.config.ts` points at missing `src/__tests__/setup.ts`) |

### Overview
Land one EuroFormat-shaped leaf plus the harness it needs so pad-3 / opt-in parse / prefix formatting are proven before any call site imports the type. `UniqueIdConfig` is defined here once; child 002 type-only-imports it onto `DatabaseConfig`. Range of this diff is three new files.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1 and 5 plus final-plan step 1 read; defaults are this module, not a later task.
- [x] Locked: opt-in parse, pad 3, prefix-less `001`, `prefix.trim()`.
- [x] Vitest gap recorded: `setup.ts` missing, no `package.json` test script.

### Definition of Done
- [ ] `UniqueIdStamp.ts` exports the three symbols with zero runtime imports.
- [ ] `npx vitest run src/data/UniqueIdStamp.test.ts` green on the step-1 cases.
- [ ] No edits to `types.ts`, `DataSource.ts`, `CreateEntryPlan.ts`, `DatabaseView.ts`, `ColumnTypes.ts`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module (`EuroFormat.ts:1-42`): pure exports, no plugin state, durable-why header only.

### Key Components
- **`parseUniqueIdConfig(raw)`**: gate for opt-in. Non-object → `undefined`. Object → filled defaults including `prefix.trim()`.
- **`nextUniqueId(cfg)`**: increment math only. Caller later writes `cfg.counter = nextCounter` on the live config (child 003). First allocate in 003 also freezes `padWidth`/`field` on that live object so `INV-1` and `INV-001` cannot drift.
- **Tests**: table cases, no Obsidian import.

### Data Flow
YAML stub or in-memory object → `parseUniqueIdConfig` → `UniqueIdConfig` → `nextUniqueId` → `{ value, nextCounter }`. Persistence and stamping are later children.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Producers: new `UniqueIdStamp.ts`. Consumers in this child: `UniqueIdStamp.test.ts` only. Later consumers (not this diff): `types.ts` (type-only), `DataSource.ts` (`parseUniqueIdConfig`), `CreateEntryPlan.ts` (`nextUniqueId`). Algorithm invariant: never persist here; never throw on `{ prefix: "INV" }`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm live fork `EuroFormat.ts:1-42` header precedent and missing `src/__tests__/setup.ts`.
- [ ] Record that `npx vitest run` currently fails on missing setupFiles.

### Phase 2: Core Implementation
- [ ] Create `UniqueIdStamp.ts` with interface, parse, and `nextUniqueId`.
- [ ] Create empty `src/__tests__/setup.ts` and `UniqueIdStamp.test.ts`.

### Phase 3: Verification
- [ ] `npx vitest run src/data/UniqueIdStamp.test.ts` green.
- [ ] Confirm zero runtime imports and no call-site file edits.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | parse defaults, `INV-001`, prefix-less `001`, non-object `undefined`, trailing-hyphen trim | Vitest (`npx vitest run src/data/UniqueIdStamp.test.ts`) |
| Integration | Not this child | — |
| Manual | None — no create path yet | — |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot match EuroFormat header |
| Vitest already in fork `package.json` | Internal | Configured; setup missing | Tests unloadable until `setup.ts` exists |
| Child 002 / 003 | Internal | Later | This child must own the interface so 002 does not duplicate it |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Parser throws on a YAML stub; pad-less `INV-1` mixes with `INV-001` in tests; module imports `obsidian`.
- **Procedure**: Delete the three new files as a unit. Do not leave `setup.ts` if tests are removed unless another phase already needs it.
<!-- /ANCHOR:rollback -->
