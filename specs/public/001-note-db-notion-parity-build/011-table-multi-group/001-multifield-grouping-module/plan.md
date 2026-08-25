---
title: "Implementation Plan: Multi-Field Grouping Module"
description: "Same-diff plan for MultiFieldGrouping.ts, groupByFields on ViewConfig, and DataSource parse plus serialize."
trigger_phrases:
  - "multifield grouping plan"
  - "groupbyfields persist"
  - "buildGroupTree"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/001-multifield-grouping-module"
    last_updated_at: "2026-08-25T20:50:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored MultiFieldGrouping same-diff child from synthesis and final-plan"
    next_safe_action: "Implement MultiFieldGrouping.ts plus types and DataSource persist"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-multifield-grouping-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Multi-Field Grouping Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | View-config YAML only; `groupByFields` must round-trip via DataSource whitelist |
| **Testing** | Manual YAML round-trip plus tree checks; no new renderer |

### Overview
Land one EuroFormat-shaped leaf plus the type and persist seams in a single shippable diff so `groupByFields[]` cannot exist on `ViewConfig` and then vanish on save. `buildGroupTree` reuses the board's per-parent regroup; it must not reimplement empty/order/uncategorized.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1, 2, 5 and final-plan steps 1–2 read; same-diff persist coupling confirmed.
- [x] Locked resolver: `effectiveGroupFields` prefers `config.groupByFields` when non-empty.
- [x] Confirm there is no `src/views/table/TableRenderer.ts`.

### Definition of Done
- [ ] `MultiFieldGrouping.ts` exports the four functions; no renderer imports.
- [ ] `types.ts:362` has `groupByFields?`; `:368` untouched.
- [ ] DataSource parse `885` + serialize `1088` in the same commit.
- [ ] 1-field fallback, 2-field tree, computed drop warning, YAML round-trip all hold.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module + rebase-safe call sites (`src/data/EuroFormat.ts:1-42`). Pure functions, no plugin state, no renderer imports.

### Key Components
- **`MultiFieldGrouping.ts`**: `effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree`, `dropComputedGroupFields`.
- **`types.ts`**: optional `groupByFields?: string[]` beside `groupByField` (`:362`).
- **`DataSource.ts`**: whitelist parse `:885` and serialize `:1088`.

### Data Flow
Config + `vs()` → `effectiveGroupFields` → optional `dropComputedGroupFields` → `buildGroupTree` (per parent: `withEmptyOptionGroups` → `queryEngine.groupBy` → `sortGroups(getEffectiveGroupOrder)`, recurse `fields.slice(1)`) → `flattenGroupTree` preorder nodes. This child does not call `TableRenderer`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: new `MultiFieldGrouping.ts`. Consumers in this same diff: `types.ts` (`ViewConfig`) and `DataSource.ts` parse/serialize. Table dispatch, renderer loop, Embedded, and toolbar wait for later children. Algorithm invariant: never persist an empty `groupByFields` key; never import a renderer from the module.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `EuroFormat.ts:1-42`, `getBoardSubgroups` at `DatabaseView.ts:9669-9673`, dispatch `6332-6333`, loop `TableRenderer.ts:82-155`.
- [ ] Confirm gallery/list (`9554-9578`) and timeline (`2890-2894`) stay on `vs().groupByField` (do not edit them here).

### Phase 2: Core Implementation
- [ ] Create `MultiFieldGrouping.ts` including the compose chain inside `buildGroupTree`.
- [ ] Add `groupByFields?` at `types.ts:362`.
- [ ] Parse `885` + serialize `1088` in the same commit.

### Phase 3: Verification
- [ ] 1-field fallback; 2-field Category/Type tree; 3-field data-layer nest; computed drop warning.
- [ ] YAML round-trip; grep the new module for vault writes / `fetch`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit / REPL | `effectiveGroupFields`, 2-field tree shape, computed drop, flatten depth 0 | Fork source / Vitest if harness already exists |
| Integration | YAML parse then serialize | DataSource round-trip |
| Manual | Hand-edited `groupByFields: [Category, Type]` survives reload | Obsidian fork (full nest waits for child 002) |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot cite or edit call sites |
| Children 002–005 | Internal | Later | This child must export flatten fields so 002 does not invent a second node shape |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: `groupByFields` exists on the type but is stripped on save; module imports a renderer; 1-field fallback diverges from `[groupByField]`.
- **Procedure**: Revert `types.ts` + `DataSource.ts` and delete `MultiFieldGrouping.ts` as one unit. Do not leave the type widened without parse/serialize.
<!-- /ANCHOR:rollback -->
