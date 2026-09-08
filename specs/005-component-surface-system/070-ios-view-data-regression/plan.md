---
title: "Implementation Plan: iOS view data regression"
description: "Reproduce the empty-property read in the headless harness, root-cause it against three named suspects, fix, and recapture."
trigger_phrases:
  - "implementation plan"
  - "070 plan"
  - "ios property read fix"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: iOS View Data Regression

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None (vanilla plugin, own view renderers) |
| **Storage** | Frontmatter in vault notes, read via Obsidian's `MetadataCache` |
| **Testing** | Vitest (`*.test.ts`), headless Chrome harness (`tools/live/*.mjs`) |

### Overview
Build a fixture mirroring the operator's real shapes (synthetic values), reproduce the empty-property read in the headless harness with the metadata cache both cold and warm, trace the read path through `data-source.ts` to find where property values are dropped on iOS, fix the confirmed cause, and recapture.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented
- [x] Success criteria measurable
- [x] Dependencies identified (Obsidian MetadataCache readiness timing)

### Definition of Done
- [ ] All acceptance criteria met
- [ ] `npx vitest run`, `npx tsc --noEmit`, `npm run build`, `npm run gate` all exit 0
- [ ] Docs updated (spec/plan/tasks/acceptance-criteria)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Existing plugin architecture: a data-source layer (`src/data/data-source.ts`) parses view config and produces row/column payloads consumed by per-view renderers (table, board, etc.)

### Key Components
- **`data-source.ts`**: parses `database:` frontmatter into `ViewConfig`/column defs, and rows into cell values (`parseViewConfig`, `toViewPayload`)
- **`title-field-display.ts`**: resolves the title/file-name display and its format (058), separate from general property columns
- **`legacy-plugin-data-migration.ts`**: bridges the renamed plugin's `data.json`, confirmed to hold settings only, not row data

### Data Flow
Vault note frontmatter → Obsidian `MetadataCache` → `data-source.ts` parse → `ViewConfig` + row payloads → view renderer (table/board/etc.) paints cells
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `data-source.ts` property parse (~line 800, ~line 988, `parseViewConfig`, `toViewPayload`) | Producer of the row/column payload every renderer paints from | Investigate; fix if confirmed | `rg -n "parseViewConfig|toViewPayload" src/data/data-source.ts` |
| `title-field-display.ts` | Title/format resolver added by 058 | Investigate; confirm it does not shadow general property reads | `rg -n "titleFormat|isFileTitle" src/data/title-field-display.ts src/views/board-renderer.ts` |
| `legacy-plugin-data-migration.ts` | data.json bridge for the note-database → obnotion rename | Investigate; confirm no race/clear on iOS load | `rg -n "data.json|migrate" src/data/legacy-plugin-data-migration.ts` |
| Table and board renderers (consumers) | Paint whatever the data-source payload hands them | Unchanged unless the root cause is found downstream of data-source | `rg -n "row\\.file|title\\.text|column" src/views/*-renderer.ts` |

Required inventories:
- Same-class producers: `rg -n "MetadataCache|getFileCache|frontmatter" src/data/*.ts`
- Consumers of changed symbols: run once the root-cause symbol is known, against `**/*.ts`
- Matrix axes: cache state (cold/warm) × view type (table/board) × property type (currency/checkbox/number/text)
- Algorithm invariant: a property value present in frontmatter and mapped by a `database:` column definition must render in every view type, regardless of cache warmth
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `data-source.ts` parse/read functions | Vitest |
| Integration | Full view render against a fixture, cold and warm cache | `tools/live/render-assertion-harness.ts` |
| Manual | Operator's own phone, Finance Reports and Database Testbed | iOS, device row |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Obsidian `MetadataCache` cold-start timing | External | Yellow — timing-sensitive, must be reproduced deterministically | A flaky cold-cache repro would hide a first-load-only defect |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: The fix regresses a currently-passing property read on desktop or another platform
- **Procedure**: `git revert` the fix commit; the read path was never removed, only corrected, so reverting restores the pre-fix (broken-on-iOS, working-elsewhere) state without further data risk
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Phase 1 (Fixture + cold-cache repro) ──► Phase 2 (Root cause + fix) ──► Phase 3 (Recapture + device row)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Fixture + repro | None | Root cause |
| Root cause + fix | Fixture + repro | Recapture |
| Recapture + device row | Root cause + fix | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Fixture + cold-cache repro | Medium | 2-4 hours |
| Root cause + fix | Medium-High | 3-6 hours |
| Recapture + device row | Low | 1 hour (excluding operator's own device time) |
| **Total** | | **6-11 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] No data migration involved — this is a read-path fix only
- [ ] Recapture confirms no other view type regresses

### Rollback Procedure
1. Revert the fix commit
2. Rerun `npm run gate` to confirm the pre-fix baseline is restored
3. Re-open this packet with the reverted state recorded

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A
<!-- /ANCHOR:enhanced-rollback -->

---
