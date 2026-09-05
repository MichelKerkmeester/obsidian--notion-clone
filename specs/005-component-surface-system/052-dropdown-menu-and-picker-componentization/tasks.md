---
title: "Task Breakdown: Dropdown, Menu and Picker Componentization"
description: "T001 reads the Anytype captures and trues the grammar document; T002 records every red; the legs migrate the family primitive-first; every task names its proof."
trigger_phrases:
  - "052 tasks"
  - "menu componentization tasks"
  - "picker host tasks"
importance_tier: "high"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Task Breakdown: Dropdown, Menu and Picker Componentization

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:ai-exec -->
## AI Execution Protocol

### Pre-Task Checklist

Before starting any task, verify:

1. [ ] `spec.md` scope unchanged
2. [ ] Current leg identified in `plan.md` §3b's phase table
3. [ ] Task dependencies satisfied (Phase 1 before Phase 2; primitives before consumers)
4. [ ] Relevant P0/P1 checklist items identified in `checklist.md`
5. [ ] No blocking issues in `decision-record.md`
6. [ ] Previous session context reviewed (the parent's `handover.md`, then this packet's log)

### Execution Rules

| Rule | Description |
|------|-------------|
| TASK-SEQ | Complete tasks in dependency order — T001/T002 gate the legs (goal D1, D2) |
| TASK-SCOPE | Stay within the task's named file group; one leg, one file (goal D6) |
| TASK-VERIFY | Verify against `acceptance-criteria.md`; read exit statuses from `$?` |
| TASK-DOC | Update the task checkbox and its `checklist.md` evidence cell in the same pass |
| TASK-SYNC | Wait at leg boundaries: a leg that changes registered pair markup updates `sheet-grammar.mjs` in the same commit, never after |

### Status Reporting Format

```
## Status Update - <timestamp>
- **Task**: T### - <description>
- **Leg**: <Phase 1-4>
- **Status**: [IN_PROGRESS | COMPLETED | BLOCKED]
- **Evidence**: <command, lane output, or capture read>
- **Blockers**: [None | description]
- **Next**: T### - <next task>
```

### Blocked Task Protocol

A task that cannot proceed stops and records, in this order: the failing command and its output,
the contract it conflicts with (`044`/`048`/`001`), and the smallest unblocking decision. Two
failed attempts on the same failure without new evidence is the stop signal — escalate in the
parent program's escalation format rather than retrying. A task blocked on the operator (device
confirmation, the create-option rollout breadth) is marked `[B]` with the owner named, never
self-closed.

<!-- /ANCHOR:ai-exec -->

<!-- ANCHOR:phase-1 -->
## Phase 1 — Evidence and primitives

T001-T006. Exit criterion: the submenu lane row observed red then green; the host's search
oracle-tested; `sheet-grammar` pairs unchanged.

- [x] T001 Read the Anytype captures and correct every G-row the pixels disagree with
      (`design-trueup.md`, `anytype-menu-grammar.md`). Scope grew with the evidence: the sweep now
      holds **150 clipped desktop menus** in `screenshots/anytype/desktop/menus/` and **59 iOS states** in
      `screenshots/anytype/mobile/`, so the read covered the menu classes rather than the six files
      this task originally named. **Proof (observed 2026-09-05)**: `design-trueup.md` written as the
      read of record — §2 carries the measured geometry set and five width tiers, §3 all sixteen
      G-rows, §4 re-evidences all 25 census surfaces, §5 re-counts the widths, §6 confirms `050`'s
      four inherited items; **103 cited capture filenames all resolve** under `screenshots/anytype/`;
      `anytype-menu-grammar.md` §5 carries the dated correction table for the fourteen rows that
      changed; AC-009 and AC-005 are `Met`. **Eleven contradictions found**, the load-bearing ones
      being: hover states *were* captured 37 times (the README's caveat is false), hover-open and
      innermost-only Escape are proved by the sweep's own procedure, the create row sits **first**
      rather than last (ADR-004), the checkmark is **trailing** rather than leading, and the census
      baselines were 71/45/9 against a measured 70/44/8.
- [x] T002 Record every red: per checklist row C1-C10, measure today's value on the current tree
      (`checklist.md`). **Proof**: every `Today` cell carries a figure or a counted fact with the
      command that produced it (`grep -c`, lane output), not an estimate. **T001 note**: C2 is already
      correct at 70; **C7 is not** — it says 9 distinct widths including 240, against a measured 8 at
      14 production sites, with 240 a story value only (`design-trueup.md` C9). Correct C7 here.
      **Proof (observed 2026-09-05)**: C2, C4 and C7 reproduced unchanged (70/76, 3, 8 distinct at 14
      sites — C7 had already been corrected by a prior landing); C1 and C3 reconfirmed by grep against
      `owned-menu.ts`; C5, C6 and C8 had drifted line citations (functions/constructions moved since
      they were written) and are corrected with fresh `grep -n` reads, each dated; C9 measured live —
      `node tools/live/sheet-grammar.mjs` exits 0, 564 PASS/0 FAIL — and its "8 first-sheet rows"
      baseline corrected to the current 12 (`044` registered the four dropdown families on top of the
      original 8 since this cell was written), pairs unchanged at 31; C10 reconfirmed no family lane
      rows exist anywhere in `tools/gate.mjs` or `tools/live|lane/*.mjs`. `acceptance-criteria.md`
      AC-006 carried the same stale citations as C6 and is corrected alongside it. No threshold was
      unobservable as written, so no Proposed ADR was needed.
- [ ] T003 Baseline the row-vocabulary count per file (`grep -c "db-menu-item"`) and the bespoke
      width list, and store them in `checklist.md` C2/C7's evidence cells. **Proof**: the numbers
      in the checklist reproduce from the commands recorded beside them. Measured at T001 and to be
      reproduced here: **70** row sites outside `menu-row.ts` (`toolbar-renderer.ts` 44,
      `column-menu.ts` 19, `dropdown-field.ts` 4, `cell-renderer.ts` 3; 76 including `menu-row.ts`'s
      own 6), and **8** distinct `preferredWidth` literals — 124, 252, 280, 292, 318, 360, 420, 520 —
      at **14** production call sites.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2 — Primitive legs (plan §8 leg 1)

- [ ] T004 Menu primitive submenu handle (`src/views/owned-menu.ts`, `src/views/menu-row.ts`):
      `OwnedMenuHandle` gains a way to open a nested menu through the same factory, registered in
      `overlayStack` with `parentId`; `ArrowRight`/`Enter`/pointer open it, **and hover opens it
      behind `@media (hover: hover)`** (ADR-004, decided against the sweep's own procedure); Escape
      closes the innermost only — **observed** in that procedure, not inferred; the phone path is a
      stacked sheet per `048` (ADR-001), and the parent row **keeps its highlight and rotates its
      chevron `›` → `⌄`** while the child is open (`design-trueup.md` G8, G16). Placement: flush
      beside the parent with a 2px gap, child top aligned to the opening row, flipping to the
      parent's left at the viewport edge — one implementation shared with `050` item 6.
      **Proof (D2)**:
      red-first — a lane assertion that no nested menu opens from a `submenu: true` row FAILs
      before T004 and PASSes after; `sheet-grammar.mjs`'s `record column submenu` pair stays green.
- [ ] T005 Never-empty fallback row in the menu primitive (`src/views/owned-menu.ts`): a menu whose
      eligible-row set is empty renders the G3 fallback instead of a blank sheet — **the instruction
      shape**, naming the action rather than the absence, per the two captured strings
      (`design-trueup.md` G3). **Proof**: unit test with a zero-eligible-row predicate; red-first on
      today's tree, where the only file that can violate it is `bulk-edit-field-menu.ts:31-45`
      (`050` REQ-008's narrowing — `row-menu.ts` cannot render empty and is asserted, not built).
- [ ] T006 Extract the picker host (`src/views/popover-host.ts`): active-picker registry, phone
      sheet-header construction, shared search + empty state + create-affordance slot, geometric
      grid navigator (ADR-003), width roles. `dropdown-field.ts` (`src/views/dropdown-field.ts`)
      is the first consumer; its public API and `048`'s 11 registered dropdown pairs stay
      class-stable. The search field is **first in the panel** and the create row **directly beneath
      it, above the list** (ADR-004); the affordance stays reachable when the list is empty.
      **Proof**: `npx vitest run` green; `node tools/live/sheet-grammar.mjs` via the
      gate unchanged; the host's search unit-tested against `filterDropdownOptions`'s recorded
      behaviour (same visible rows, same section hiding, same empty row).
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3 — Consumer legs (plan §8 legs 2-3)

- [ ] T007 View-tab context menu onto the primitive (`src/views/toolbar-renderer.ts:1229`): the
      hand-built `db-view-tab-popover` panel becomes `createOwnedMenu`; its rows via `addRow`;
      touch move-rows preserved; `danger` tone maps to `warning`. `050` item 4 lands its
      duplicate/rename/remove here. **Proof**: lane row asserting the menu mounts
      `db-owned-menu` with a sheet header on the phone profile; `add view property picker` /
      `all views overflow menu` pairs stay green; screenshot of the migrated menu opened and read.
- [ ] T008 Toolbar action panels onto the primitive (`src/views/toolbar-renderer.ts` M14 —
      utilities, title actions, database switcher, export, new-template): menus-of-actions become
      `createOwnedMenu`; control surfaces keep panel shape with primitive rows for menu-like rows.
      **Proof**: checklist C2's row count drops by the leg's migrated sites, measured with the same
      `grep -c` as T003; `chrome-utilities-popover` capture re-taken and read.
- [ ] T009 Column-menu submenus onto the primitive submenu (`src/views/column-menu.ts` M3-M5): the
      `createColumnMenuSubpopover` lifecycle (`column-menu.ts:568-633`) is deleted; type submenu becomes
      primitive rows; number-style and text-render keep their bespoke controls inside the
      submenu's body. **Proof**: `grep -n "createColumnMenuSubpopover" src/views/column-menu.ts`
      returns nothing; the depth-3 `record column submenu` pair green; keyboard path
      (`ArrowRight`) and phone path both exercised in the lane.
- [ ] T010 Cell option editor rows via the row builder (`src/views/cell-renderer.ts:1123`): the
      option rows and their checkmark render through the shared row/host; drag-reorder and the
      add-option row keep their behaviour (ADR-002 makes the add row the reference create
      affordance). **Proof**: `record relation editor`/`record option colour picker` pairs green;
      the option-commit transaction flow covered by existing `vitest` suites unchanged.
- [ ] T011 Relation editor onto the picker host (`src/views/cell-renderer.ts:899`): search, list,
      footer onto the host; checkmark unified **and moved trailing** (G14) — the `✓` text node at
      `cell-renderer.ts:1420`, `:1478`, `:1483` is deleted rather than restyled, because a text glyph
      cannot carry the `menuitemcheckbox` semantics `menu-row.ts` already gives us; width becomes the
      declared picker role.
      **Proof**: windowing behaviour unchanged (the host does not own the list's window);
      `field-relation-values` capture re-taken and read.
- [ ] T012 Date, colour and icon pickers onto the host (`src/views/date-value-picker.ts`,
      `src/views/option-color-picker.ts`, `src/views/icon-picker-popover.ts`): the colour picker keeps
      its 12-swatch grid — Anytype's is a 224px labelled list and is declined (ADR-005) — and gains
      the **trailing tick** plus **named colours as accessible names**, since a swatch identified by
      hue alone is colour-only signalling. Registries,
      headers, grid nav and widths move to the host; presets, catalogues and colour dots keep
      their behaviour. **Proof**: one `activePickers` WeakMap remains in `src/views/` (the host's),
      counted by `grep -c "activePickers = new WeakMap"`; the two geometric navigators collapse to
      one (`grep -c "function getColorNavigationTarget\|function getIconNavigationTarget"` → 0);
      `field-date-value-picker`, `field-icon-picker`, `field-option-color-picker` captures re-taken
      and read.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase 4 — Widths, lanes, docs

- [ ] T013 Width-role mapping completed (`src/views/popover-host.ts`, `src/views/cell-renderer.ts`):
      every row of `componentization-plan.md` §3 lands as a named role or carries its written
      reason. **Proof**: `grep -rn "preferredWidth: [0-9]" src/views/` excluding the host's own
      role definitions returns only call sites whose plan row says "stays"; checklist C8 updated.
- [ ] T014 Gate rows per migrated family (`tools/live/sheet-grammar.mjs` and the family lane):
      one row per family, each negative control observed red then green. **Proof**:
      `SURFACE_PHASE=052-dropdown-menu-and-picker-componentization npm run gate`, `$?` read
      directly, exit 0; the red observations recorded in `checklist.md` C10 before their greens.
- [ ] T015 True the docs: `componentization-plan.md` dispositions and `anytype-menu-grammar.md`
      dispositions reconciled against what landed; `checklist.md` and `acceptance-criteria.md`
      statuses updated with evidence. **Proof**: every AC row's Status cell names its evidence;
      `validate.sh --strict` passes.
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:completion -->
## Completion

- [ ] All Phase 1-4 tasks complete or deferred with a recorded operator deferral
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run` all exit 0, read from `$?`
- [ ] `npm run gate` exits 0; `npm run screenshots:verify` exits 0 with changed captures read
- [ ] `044`'s grammar rows and `048`'s 31 stacking pairs still pass
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-references

- Migration rows: `componentization-plan.md` §1-§3
- Grammar patterns: `anytype-menu-grammar.md` G1-G16
- Overlapping `050` items: `spec.md` §7, confirmed at T001 in `design-trueup.md` §6
- Capture read of record: `design-trueup.md` — T001's output
- Red-first protocol: `checklist.md` VERIFICATION PROTOCOL
<!-- /ANCHOR:cross-refs -->
