---
title: "Feature Specification: Phase 17: Utility DbModal Sheets Visual Parity"
description: "Sixteen DbModal-derived utility modals (import/export, trash, formula, status presets, and more) plus toast and bulk-edit field menu share DbModal's sheet presentation and carry zero reference of any kind — the largest single coverage gap the audit found."
trigger_phrases:
  - "076 phase 17"
  - "utility modal sheets visual parity"
  - "017 define table"
  - "DbModal utility sheet visual parity"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/017-utility-modal-sheets-visual-parity"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Scaffolded from the coverage audit; nothing started"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T005"
    blockers:
      - "No card container per the 076 frame ruling"
      - "None of the 18 surfaces this child bundles has any Notion, Anytype or ClickUp reference — the target is composed entirely from DbModal's own shared chrome and the frame ruling, recorded explicitly as internally-derived"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/modals/base-import-confirm-modal.ts"
      - "src/views/toast.ts"
      - "src/views/bulk-edit-field-menu.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "017-utility-modal-sheets-visual-parity-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether every listed DbModal subclass truly shares one chrome primitive without per-modal overrides — T001 diffs all 16 before any target is written"
    answered_questions:
      - "Toast and bulk-edit field menu are bundled here rather than split out, since both are also zero-reference and small enough not to warrant their own 14-task packet on their own"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 17: Utility DbModal Sheets Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

Sixteen `DbModal`-derived utility surfaces — `CsvMarkdownImportModal`, `TrashManagerModal`, `AddDatabaseModal`, `BaseImportConfirmModal`, `ColumnRenameModal`, `ComputedFrontmatterCleanupModal`, `CreateLinkedViewModal`, `CreateRecordIconFieldModal`, `CsvMarkdownExportModal`, `DeleteDatabaseModal`, `FormulaModal`, `InvalidTimeEventsModal`, `PropertyTypeConflictModal`, `RelationRollupConfigModal`, `StatusOptionsModal`, `StatusPresetManagerModal`, the anonymous trash restore-confirm modal in `settings.ts`, and `ChartDrilldownModal` — plus `Toast` and `Bulk-edit field menu`, are every one of them `none / none` in `071/001`'s inventory: no story, no Notion reference, no Anytype reference. This is the single largest concentration of zero-reference surfaces the coverage audit found (18 of the 47 rows the inventory's own summary records as carrying no reference at all). None is targeted by any prior `076` child because each shares `DbModal`'s declared sheet presentation rather than being its own bespoke surface.

**The gate that closes this child is an image judge, not a lane** (parent D1), scored on a representative sample (import confirm, formula modal, status options — chosen for anatomy variety: confirm-only, form-heavy, and list-based) rather than all 18 individually, since they share one chrome primitive per T001's confirmation. Pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree.

**Critical dependencies**: `009-menu-and-confirm-visual-parity` owns `ConfirmModal`/`confirm-sheet.ts` specifically — this child's modals are DbModal subclasses that are *not* the shared confirm primitive, confirmed by producer file before this child claims them.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | Scaffolded — opened 2026-09-11 from the coverage audit, nothing started |
| **Created** | 2026-09-11 |
| **Branch** | `worktrees/302-sheet-inventory-coverage` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `076-sheet-visual-parity` |
| **Predecessor** | `../016-view-toolbar-options-visual-parity/spec.md` |
| **Successor** | `../018-board-visual-parity-clickup/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 17** opened from the coverage audit (`../coverage-audit.md`), which found 18 surfaces — the full `DbModal` utility family plus `Toast` and `Bulk-edit field menu` — with zero reference of any kind and no `076` child.

**Scope boundary**: `DbModal`'s own shared sheet presentation (frame, header, primary/secondary action row) as inherited by all 18 surfaces. Not each modal's own form content (CSV column mapping, formula syntax, status colour pickers) — those stay each modal's own concern, unaffected by this child's chrome fix.

**Deliverables**: a completed DEFINE table recording every one of the 18 surfaces and their shared-chrome status, one lane clause per measurable chrome row, producer/stylesheet changes, current captures of the representative sample, and `verification.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Eighteen surfaces inherit `DbModal`'s declared sheet presentation and none has ever been read against any reference, any frame ruling, or any rubric. `071/001`'s inventory records every one of them as `none / none`, and its own summary line ("Rows with no reference at all: 47") confirms this child accounts for well over a third of that total. Left unaddressed, the largest share of "every sheet" the operator asked to be inventoried would have no coverage plan at all.

### Purpose

Every `DbModal`-derived utility sheet shares one consistent chrome — plain background, dividers where content groups, a clear primary/secondary action row — composed from the frame ruling and DbModal's own existing structure rather than an external reference, since none exists.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

All eighteen, per `071/001`'s inventory, `none / none` on every row:

| # | Surface | Producer |
|---|---------|----------|
| 1 | CsvMarkdownImportModal | `src/main.ts:2915` |
| 2 | TrashManagerModal | `src/settings.ts:583` |
| 3 | AddDatabaseModal | `src/views/modals/add-database-modal.ts:30` |
| 4 | BaseImportConfirmModal | `src/views/modals/base-import-confirm-modal.ts:48` |
| 5 | ColumnRenameModal | `src/views/modals/column-rename-modal.ts:37` |
| 6 | ComputedFrontmatterCleanupModal | `src/views/modals/computed-frontmatter-cleanup-modal.ts:26` |
| 7 | CreateLinkedViewModal | `src/views/modals/create-linked-view-modal.ts:35` |
| 8 | CreateRecordIconFieldModal | `src/views/modals/create-record-icon-field-modal.ts:24` |
| 9 | CsvMarkdownExportModal | `src/views/modals/csv-markdown-export-modal.ts:23` |
| 10 | DeleteDatabaseModal | `src/views/modals/delete-database-modal.ts:34` |
| 11 | FormulaModal | `src/views/modals/formula-modal.ts:182` |
| 12 | InvalidTimeEventsModal | `src/views/modals/invalid-time-events-modal.ts:67` |
| 13 | PropertyTypeConflictModal | `src/views/modals/property-type-conflict-modal.ts:80` |
| 14 | RelationRollupConfigModal | `src/views/modals/relation-rollup-config-modal.ts:33` |
| 15 | StatusOptionsModal | `src/views/modals/status-options-modal.ts:110` |
| 16 | StatusPresetManagerModal | `src/views/modals/status-preset-manager-modal.ts:33` |
| 17 | Trash restore-confirm (anonymous DbModal) | `src/settings.ts:680` |
| 18 | ChartDrilldownModal | `archive/deprecated-views/chart/chart-renderer.ts:1009` |

Plus, bundled for the same zero-reference reason and small individual footprint:
- `Toast` — `src/views/toast.ts:96`
- `Bulk-edit field menu` — `src/views/bulk-edit-field-menu.ts:24`
- Stacked: "import confirm dropdown chain" (over filter-panel, shares `CsvMarkdownImportModal`'s family)

### Producers

- `DbModal`'s own base class (T001 names the exact file/export)
- `src/views/toast.ts`
- `src/views/bulk-edit-field-menu.ts`

### Out of Scope

- Each modal's own form content and business logic (CSV mapping, formula syntax, status colour pickers, etc.)
- `ConfirmModal`/`confirm-sheet.ts` — `009`'s own scope, a different producer family despite superficial similarity
- `ChartDrilldownModal`'s archived renderer, unless its DbModal chrome usage is confirmed live rather than dead code (T001 checks this first)
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 — Blockers (MUST complete)

- **REQ-001** No card container beyond DbModal's own single sheet frame — dividers between content sections, plain background (076 frame ruling)
- **REQ-002** T001 confirms all 18 surfaces genuinely share one DbModal chrome primitive; any surface found with a bespoke override is named and handled as its own task, not silently unified
- **REQ-003** `ChartDrilldownModal`'s archived status is confirmed before it is included or excluded from the fix (it lives under `archive/deprecated-views/`)
- **REQ-004** The image judge scores ≥ 14/16 with no row at 0, twice consecutively, on the representative sample (import confirm, formula modal, status options)

### P1 — Required

- **REQ-005** Every DEFINE row records `none` explicitly for reference, rather than a fabricated pixel value
- **REQ-006** The operator's device row is present and unticked
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

| ID | Criterion | Measured by |
|----|-----------|-------------|
| SC-001 | No card container beyond the single DbModal sheet frame renders on any of the 18 surfaces | Lane clause, new |
| SC-002 | Shared-chrome confirmation recorded for all 18, with any divergence named | `spec.md` §13, T001 |
| SC-003 | Judge ≥ 14/16, no row at 0, twice on an unchanged tree, on the representative sample | `verification.md` |
| SC-004 | `ChartDrilldownModal`'s live/archived status resolved before inclusion | `spec.md` §13, T001 |
| SC-005 | The operator reads a utility modal on their own iPhone and reports it aligned | Operator — no agent ticks this |
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Impact | Mitigation |
|------|--------|------------|
| 18 surfaces assumed to share chrome but several diverge | A single fix misses multiple surfaces silently | T001 diffs all 18 producer files before any shared-chrome edit; divergent ones become named follow-up tasks |
| `ChartDrilldownModal` is dead code under `archive/` | Wasted effort fixing an unreachable surface | T001 confirms whether it is still constructed anywhere before including it in the producer edit |
| Zero external reference for the entire child | Target composed from DbModal's own structure and the frame ruling alone, with no rubric anchor beyond internal consistency | Recorded explicitly per row; judged for internal consistency against the sheet family established by `001`-`016`, not against a fabricated external source |
<!-- /ANCHOR:risks -->

---

## 7. NON-FUNCTIONAL REQUIREMENTS

Touch targets unaffected by a background/divider-only change. No contrast regression in either theme.

---

## 8. EDGE CASES

- A modal with a single action (e.g. `DeleteDatabaseModal`'s confirm-only body)
- A modal with a long scrollable form (e.g. `FormulaModal`, `StatusPresetManagerModal`)
- `Toast`'s auto-dismiss timing, unaffected by a chrome-only fix

---

## 9. COMPLEXITY ASSESSMENT

Level 2. Eighteen call sites sharing (pending T001) one base chrome, presentational only.

---

## 10. RISK MATRIX

| Area | Likelihood | Impact | Net |
|---|---|---|---|
| Several of the 18 modals carry bespoke overrides | Medium-High | Medium | T001's diff is exhaustive, not sampled, before any edit |
| Dead-code surface (`ChartDrilldownModal`) wastes effort | Low | Low | T001 confirms live construction first |
| No external reference to anchor the rubric | High (certain) | Low | Judged for internal family consistency instead; recorded as the explicit basis, not hidden |

---

## 11. USER STORIES

As the operator, I open any utility modal — import, export, trash, formula, status preset — and see the same plain-background sheet chrome every other surface in the app now uses.

---

## 12. OPEN QUESTIONS

- Whether `Toast` truly belongs in this bundle (it is not a `DbModal` subclass, just another zero-reference surface) or deserves its own trivial child — kept here for now since it is a single, small, chrome-only fix with no rubric conflict

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

- **Operator screenshot**: none on file naming any of these 18 surfaces
- **Notion**: none in this repository for any of these surfaces
- **Anytype**: none in this repository for any of these surfaces
- **ClickUp**: not consulted — these are Obsidian-native utility modals with no board or generic-sheet analog in the ClickUp harvest at time of audit
- **Internal reference**: the sheet-chrome grammar already landed by `001`-`016` (plain background, dividers, grab handle, 16pt inset, 44pt+ rows) — the only "reference" available, and named as such rather than presented as an external source

### What the reference cannot answer

- Everything at the pixel level — there is no external reference for any of these 18 surfaces. Every numeric target is either already in DbModal's own shared chrome or `TBD — needs operator capture`

### The table

| Element | Ours today | Reference (structural) | Target | Source |
|---|---|---|---|---|
| Frame | `TBD — T001` | n/a (no external reference) | Single DbModal sheet frame, no nested card container | Internal (076 frame ruling + landed `001`-`016` grammar) |
| Content dividers | `TBD — T001` | n/a | Hairline dividers between form sections, per frame ruling | Internal (frame ruling) |
| Action row | `TBD — T001` | n/a | Primary/secondary action pinned per DbModal's existing pattern, unchanged unless T001 finds inconsistency | Internal (DbModal's own existing structure) |
| Shared-chrome confirmation | `TBD — T001` | n/a | All 18 surfaces confirmed sharing one chrome primitive, or divergence named per surface | Internal (T001 finding) |
| `ChartDrilldownModal` live/archived | `TBD — T001` | n/a | Confirmed live or excluded from this child's producer edit | Internal (T001 finding) |
<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`, `../decision-record.md`
- **Coverage source**: `../coverage-audit.md`
- **Related sibling**: `../009-menu-and-confirm-visual-parity/spec.md` (owns `ConfirmModal`/`confirm-sheet.ts` specifically, not this child's DbModal subclasses)
- **Frame ruling**: `scratchpad/loop/076-frame-ruling.md`
