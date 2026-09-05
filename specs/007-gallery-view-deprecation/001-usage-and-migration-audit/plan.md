---
title: "Implementation Plan: Gallery Usage and Migration Audit"
description: "How the three lists this phase owes are derived: grep the string, then read every viewType assignment, then classify each capture scenario by what it actually mounts."
trigger_phrases:
  - "implementation plan"
  - "gallery audit plan"
  - "007 phase 1 plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Gallery Usage and Migration Audit

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API, Node tooling under `tools/` |
| **Framework** | None — the plugin builds through esbuild |
| **Storage** | Vault markdown and JSON settings; `viewType` is persisted vault data |
| **Testing** | Vitest for units, `npm run gate` for the 25-lane gate |

### Overview

Three lists, three derivations. The **surface list** comes from grepping the literal `"gallery"` and
then reading every site that assigns `viewType` or narrows `DatabaseViewType`, because `030` missed
the importer by stopping at the literal. The **capture classification** comes from reading each of
the 24 manifest entries' scenario definition and recording which renderers it mounts. The
**declared-loss list** comes from diffing what the gallery's six config fields express against what
the board's equivalents can hold.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Parent `spec.md` §4's inventory read, so this phase extends it rather than repeating it
- [ ] `030-gallery-view-deprecation/spec.md` §7 read — it already asks the union question
- [ ] `006-list-view-deprecation/005-usage-and-migration-audit/implementation-summary.md` read for
      the shape of the equivalent list-view audit

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Every list carries the command that produced it
- [ ] `implementation-summary.md` holds the three lists; `scratch/` holds the raw output
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Read-only audit. No production code path is added, changed or removed by this phase.

### Key Components

- **The minting surfaces**: `main.ts:146`/`:182` (settings-load sanitizer), plus whatever the
  `viewType`-assignment sweep adds. The `.base` importer at `:1571-1641` is **not** one — `:1577`
  already lands `cards` on `board` — and confirming that is part of the sweep rather than an
  assumption.
- **The withdrawal surfaces**: `toolbar-renderer.ts:91`/`:1311` and
  `view-config-panel-renderer.ts:510`/`:515` — already filtered by `030`, verified rather than
  changed.
- **The migration**: `src/data/gallery-migration.ts` and its single call site,
  `database-view.ts:2718` declared, `:11663` called.
- **The measurement surface**: `tools/live/renderer-coverage.json`, `tools/bench/gallery-render-bench.ts`,
  `tools/screenshots/constructed-scenarios.mjs:237`, `tools/screenshots/scenarios/core.mjs`,
  `tools/screenshots/scenarios/shared.mjs`, `tools/live/render-assertion-harness.ts`,
  `tools/storybook/verify-placement.mjs`.

### Data Flow

`viewType` is written into vault files and settings JSON. It is read back by `data-source.ts` when
parsing a view, coerced by the sanitizer on settings load, minted by the `.base` importer, offered
(or not) by the two pickers, and dispatched on by both render hosts. The audit walks that path in
that order.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `main.ts` settings sanitizer | Coerces an unknown `viewType` to `table` but explicitly re-accepts `gallery` | not a consumer of this phase — enumerated only | `rg -n 'viewType !== "gallery"' src/main.ts` |
| `main.ts` `.base` importer | Mints `gallery` from an imported `cards` view | enumerated only | `rg -n 'galleryImageField' src/main.ts` |
| `gallery-migration.ts` | Decides what a gallery becomes | enumerated only; `002` changes it | `rg -n 'applyGalleryMigration\|planGalleryMigration' src` |
| `embedded-database-renderer.ts` | Renders the gallery with no migration call | enumerated only; the asymmetry is the finding | `rg -n 'applyGalleryMigration' src/views/embedded-database-renderer.ts` returns nothing |
| `screenshots/manifest.json` | 24 gallery-touching entries | classified only | the classification script in `scratch/` |
| `renderer-coverage.json` | Pins the renderer and bench | enumerated only; `003` changes it | `rg -n gallery tools/live/renderer-coverage.json` |

Required inventories:
- Same-class producers: `rg -n '"gallery"' src tools --glob '!*.test.*'`.
- Consumers of changed symbols: `rg -n 'galleryImageField|galleryImageFit|galleryCardSize|galleryCardSizePreset|galleryImageAspectRatio|galleryImageAspectRatioPreset' . --glob '*.ts' --glob '*.mjs' --glob '*.json'`.
- Matrix axes: host (standalone, embedded codeblock) × entry point (picker, sanitizer, importer) ×
  state (has cover field, has none).
- Algorithm invariant: a view whose `viewType` is not in `DatabaseViewType` coerces to `table`. That
  is the behaviour a premature deletion would expose, and it is why `002` ships before `003`.
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
| Unit | None added — this phase writes no production code | n/a |
| Integration | None added | n/a |
| Manual | Re-running each recorded command and getting the same list | ripgrep, `node`, `jq` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `030-gallery-view-deprecation`'s shipped withdrawal | Internal | Green | None — it shipped in August |
| The operator's vault, for real usage counts | External | Yellow | REQ-005 reports unavailable rather than zero |
| `006`'s equivalent audit, as a shape reference | Internal | Green | None |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: none applies. This phase writes only spec documents.
- **Procedure**: `git revert` the docs commit.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
001 Audit ──► 002 Redirect+Migrate ──► [release] ──► 003 Remove ──► 004 Docs+Release
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| 001 Audit | None | 002, 003, 004 |
| 002 Redirect+Migrate | 001 | 003 |
| 003 Remove | 002 **shipped in a release**, not merely merged | 004 |
| 004 Docs+Release | 003 | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | Read the parent inventory and `030`; under an hour |
| Core Implementation | Medium | The three derivations; 2-4 hours, most of it the capture classification |
| Verification | Low | Re-run each recorded command; under an hour |
| **Total** | | **3-6 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] No `src/` or `tools/` file is in the diff
- [ ] No feature flag needed — nothing ships
- [ ] No monitoring needed — nothing runs

### Rollback Procedure
1. `git revert` the docs commit.
2. Confirm no `src/` or `tools/` file was touched.
3. No smoke test applies.
4. No stakeholder notice applies.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A.
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Surface     │────►│  Declared    │────►│  Measurement │
│  list        │     │  loss list   │     │  inventory   │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
 ┌─────▼──────────┐
 │  Capture       │
 │  classification│
 └────────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| Surface list | None | Every `file:line` that accepts or mints `gallery` | `002`'s REQ set |
| Capture classification | Surface list (for which renderers exist) | gallery-only vs board-shared per entry | `003`'s manifest edits |
| Declared loss list | Surface list | Every setting a board cannot hold | `004`'s CHANGELOG |
| Measurement inventory | Surface list | Every lane, pin, bench and spec that reads the gallery | `003`'s removal set |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **Surface list** - 1-2 hours - CRITICAL
2. **Capture classification** - 1-2 hours - CRITICAL
3. **Declared loss list** - 1 hour - CRITICAL

**Total Critical Path**: 3-5 hours

**Parallel Opportunities**:
- The measurement inventory and the declared-loss list can run simultaneously once the surface list
  exists.
- The vault usage count is independent of all three and can run first or last.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Surface list complete | Every accepting/minting site has a `file:line`, and the sweep covered `viewType` assignment rather than only the literal | Phase 1 |
| M2 | Captures classified | All 24 entries labelled; every shared one names its board contribution | Phase 1 |
| M3 | Losses declared | Each loss named individually, ready to be quoted in `004`'s CHANGELOG | Phase 1 |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

### ADR-001: Audit before removal, as a separate phase

**Status**: Accepted

**Context**: `030` withdrew the gallery without enumerating what else accepts it, and two minting
surfaces survived. `006` hit the same class for the list and its audit child found them.

**Decision**: the audit is its own phase with its own closure gate, rather than a first task inside
the removal phase.

**Consequences**:
- The removal phase cannot start on an unknown surface count.
- One extra phase boundary, and therefore one extra validation run. Mitigation: the boundary is
  cheap and the alternative already failed once.

**Alternatives Rejected**:
- **Audit as T001 of the removal phase**: it makes the audit's completeness a judgment call inside a
  phase whose incentive is to get to the deletion.

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
