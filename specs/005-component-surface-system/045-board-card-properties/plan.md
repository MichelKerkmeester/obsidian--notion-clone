---
title: "Implementation Plan: Board Card Properties"
description: "Add one per-view field list, derive it once from today's three implicit rules so nothing changes on upgrade, then move the board renderer off the table's visible-column set and build the Properties control on top."
trigger_phrases:
  - "board card properties plan"
  - "045 plan"
  - "card field list migration"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Board Card Properties

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None — direct DOM |
| **Storage** | The database's own view config JSON, through the existing `ViewConfigMutation` writer. One new optional field on `ViewConfig`; no migration script, no new file |
| **Testing** | Vitest for the resolver and the migration, `render-assertions`/`replay` for the rendered card, capture pairs for the no-visible-change proof |

### Overview

The work is a decoupling before it is a feature. Today `board-renderer.ts:1439` asks for
`getColumns(config)` and receives the table's visible columns, then subtracts the title field, the
grouped field and every `select`/`status` column. Three implicit rules, one shared input, no
per-view state. The plan adds the state first, derives it from those three rules so the upgrade is
invisible, and only then builds a control that edits it.

The order matters because the risky part is the derivation, not the UI. A wrong derivation changes
every existing board card at once and no unit test will notice; a missing toggle is obvious. So the
migration lands and is proved by a capture pair before the panel exists.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented — the three implicit rules are cited by file:line in `spec.md` §2
- [ ] Success criteria measurable — SC-002 and SC-003 are DOM comparisons, not opinions
- [ ] Dependencies identified — `038` REQ-007's parity boundary and `044`'s row grammar

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing — `npm run gate` exits 0, including `038`'s board parity fixtures unchanged
- [ ] Docs updated (spec/plan/tasks), parent map and `../roadmap.md` §5 carry the phase
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

A resolver between the config and the renderer, the same shape `resolveRecordOpenTarget` took in
`006-record-open-target`: one function that folds stored state plus defaults into the answer, and
one call site that uses it. The renderer stops making the decision; it renders what it is handed.

### Key Components
- **`ViewConfig` field list (`src/data/types.ts`)**: an ordered array of `{ key, visible }`, optional
  and absent by default. Absent means "derive"; present means "the operator owns this".
- **`resolveBoardCardFields(config, columns)`**: returns the ordered visible `ColumnDef[]`. When the
  list is absent it reproduces today's three rules exactly; when present it returns the stored order
  filtered to keys that still exist in the schema.
- **`board-renderer.ts` `renderCard`**: calls the resolver instead of filtering `getColumns` inline.
  `renderReferenceCard` does not — REQ-007 keeps the 1:1 path on its fixed slot set.
- **Properties panel**: a row per field with a toggle and an order affordance, rendered into the
  board's existing view-config surface on desktop and its sheet on the phone.

### Data Flow

View config → `resolveBoardCardFields` → the ordered `ColumnDef[]` the card's meta grid iterates.
The Properties panel writes back through the existing `ViewConfigMutation` path, which already
carries `sourceInstanceId` so a peer view does not react to its own write. The table's
`hiddenColumns` is no longer read by the board at all, and that removal is the change with the
widest blast radius in this phase.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `getVisibleColumns` (`database-view.ts:477`, `:808`, `:833`, `:865`) | Producer of the shared visible-column set for table, board, gallery and timeline | Unchanged — the board stops being one of its consumers, the function keeps its other three | `rg -n 'getColumns\(' src/views/board-renderer.ts` returns only the resolver's input |
| `board-renderer.ts:1439`, `:1478-1483` | Consumer that applies the three implicit rules inline | Update — replaced by the resolver | `board-renderer-hierarchy.test.ts` plus a new resolver spec |
| `board-renderer.ts:391` `renderReferenceCard` / `:552` `getReferenceCardFields` | The 1:1 reference path with a fixed five-slot map | Unchanged, deliberately | `038`'s parity fixtures byte-identical; SC-002 |
| `ViewConfig` (`src/data/types.ts:454`) | Persisted per-view schema | Update — one optional field added | `settings.test.ts` round-trip; an old config with no field still loads |
| `renderViewConfigPanel` consumers (`database-view.ts`, `embedded-database-renderer.ts:2082`) | Config surfaces | Update — Properties section added, read-only in a codeblock embed | Embed read-only path already gated by `persistMode === "codeblock"` |
| `hiddenColumns` (`types.ts:517`) | Policy read by table and board today | Update the *reader set*, not the field | The field's meaning for the table is unchanged; the board no longer reads it |
| `gallery-renderer.ts:361` | Same-shape consumer, out of scope | Not a consumer of this change | Named in `spec.md` §10 as an open question rather than silently generalised |

Required inventories:
- Same-class producers: `rg -n 'getVisibleColumns|getColumns\(' src`
- Consumers of changed symbols: `rg -n 'hiddenColumns|columnOrder|showEmptyFields' src tools --glob '*.ts' --glob '*.mjs'`
- Matrix axes: {list absent, list present} × {extensions on, extensions off} × {field exists, field
  deleted from schema} × {desktop, phone}. Sixteen rows; the {extensions off} half must produce the
  reference DOM in all of them.
- Algorithm invariant: with the list absent, `resolveBoardCardFields` returns exactly the set the
  current inline filter returns, for every schema. That is the migration's whole correctness claim
  and it is testable as a differential against the pre-change function.
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
| Unit | `resolveBoardCardFields` — absent list reproduces the old filter for every schema shape; present list filters to existing keys; deleted key skipped without blanking | Vitest, differential against the pre-change filter |
| Integration | A constructed board scenario with a non-default list, mounted through `043`'s seam | `render-assertions`, `tools/live/render-assertion-harness.ts` |
| Manual | The operator arranging card properties on the phone | Device |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `038-board-kanban-port` parity fixtures | Internal | Green — landed and released through 0.0.20 | None; they are the control this phase must not move |
| `044-phone-sheet-alignment` row grammar | Internal | Yellow — opened, not started | The phone control waits; the desktop popover does not |
| `ViewConfigMutation` writer | Internal | Green | None |
| `043-constructed-capture` harness seam | Internal | Green | The constructed scenario falls back to a unit test if unavailable |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: existing board cards change appearance on upgrade, or `038`'s parity fixtures move.
- **Procedure**: the stored list is optional and additive, so reverting the renderer change restores
  the old behaviour and leaves any written list inert on disk. No data reversal is needed; a config
  carrying an unknown field loads unchanged.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 read the three rules ──► T003 persisted shape ──► T004 resolver ──► T005 renderer swap
                                                                   │
                                                                   ├──► T006 desktop panel
                                                                   └──► T007 phone sheet (needs 044)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Everything |
| Shape + resolver | Setup | Renderer swap, both panels |
| Renderer swap | Resolver | Verification |
| Panels | Resolver | Verification |
| Verify | All | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 1 hour |
| Core Implementation | Med | 5-8 hours |
| Verification | Med | 2-3 hours, most of it the capture pair and the differential test |
| **Total** | | **8-12 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Backup created — N/A. The change is additive to the config; no existing field is rewritten
- [ ] Feature flag configured — `boardExtensionsEnabled` already exists and already gates local
      extensions; this control reuses it rather than adding a second flag
- [ ] Monitoring alerts set — `038`'s board parity fixtures stay in the gate as the tripwire

### Rollback Procedure
1. Revert the `board-renderer.ts` resolver swap.
2. Re-run `npm run gate` and confirm `038`'s parity fixtures are unchanged from their landed values.
3. Recapture the board scenarios and read the PNGs; a silent field-set change is exactly the failure
   mode this step exists for.
4. Leave any written field lists on disk — they are ignored by the reverted renderer and become
   live again if the change is re-landed.

### Data Reversal
- **Has data migrations?** No. The derivation is computed at read time, not written on upgrade.
- **Reversal procedure**: N/A.
<!-- /ANCHOR:enhanced-rollback -->

---
