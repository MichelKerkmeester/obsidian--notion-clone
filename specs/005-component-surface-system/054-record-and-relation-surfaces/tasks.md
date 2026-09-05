---
title: "Task Breakdown: Record and Relation Surfaces"
description: "Eight legs from capture true-up to retirement sweep, each task naming its proof, with operator rows that stay unticked."
trigger_phrases:
  - "054 tasks"
  - "record surface tasks"
  - "editor extraction tasks"
importance_tier: "high"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks | v2.2 -->
# Task Breakdown: Record and Relation Surfaces

<!-- SPECKIT_LEVEL: 3 -->

> **Proof column.** Every task names the proof that closes it — a lane row, a unit test, a census
> number, or a capture read by hand. A task whose proof cannot be stated is not a task yet.
> **Red first.** The measurement tasks T002 run before the legs; a leg whose threshold was never
> seen failing does not start.
> **Operator rows.** OPS rows are confirmed on the operator's device only. An agent never ticks one.

---

<!-- ANCHOR:ai-exec -->
## AI Execution Protocol

### Pre-Task Checklist

Before starting any task, verify:

1. [ ] `spec.md` scope unchanged, and §5A's ten surfaces still the ones on disk
2. [ ] Current leg identified in `plan.md`'s leg table (`L1`-`L7`, grouped under the four phases below)
3. [ ] Task dependencies satisfied — Phase 1's measurements before any leg; primitives before consumers; ADR-002's pinned dispatch test before the first editor moves
4. [ ] Relevant P0/P1 checklist items identified in `checklist.md`
5. [ ] No blocking issues in `decision-record.md`
6. [ ] Previous session context reviewed (the parent's `handover.md`, then this packet's log)

### Execution Rules

| Rule | Description |
|------|-------------|
| TASK-SEQ | Complete tasks in dependency order — the Phase 1 measurements gate every leg (goal D2) |
| TASK-SCOPE | Stay within the leg's named file group; one leg, one file group (goal D7) |
| TASK-VERIFY | Verify against `acceptance-criteria.md`; read exit statuses from `$?`, never through a pipe |
| TASK-DOC | Update the task checkbox and its `checklist.md` evidence cell in the same pass |
| TASK-MOVE | ADR-002 binds L6: method bodies move **unchanged** behind the pinned dispatch contract, one editor per leg. No behavioural edit inside a move — the accumulated fixes in those bodies (Escape funnels, IME guards, session close routing) were each earned by an operator report and are not re-litigated by an extraction |
| TASK-SYNC | A leg that changes a registered `sheet-grammar` pair's markup updates `tools/live/sheet-grammar.mjs` in the same commit, never after; a leg that changes what a board card draws re-reads the reference captures before it closes |

### Status Reporting Format

```
## Status Update - <timestamp>
- **Task**: T### - <description>
- **Leg**: <L1-L7, phase 1-4>
- **Status**: [IN_PROGRESS | COMPLETED | BLOCKED]
- **Evidence**: <command, lane output, census number, or capture read>
- **Blockers**: [None | description]
- **Next**: T### - <next task>
```

### Blocked Task Protocol

A task that cannot proceed stops and records, in this order: the failing command and its output, the
contract it conflicts with (`044`/`048`/`003`/`006`/`023`/`045`), and the smallest unblocking
decision. Two failed attempts on the same failure without new evidence is the stop signal — escalate
in the parent program's escalation format rather than retrying. A task blocked on the operator
(OPS-001..003) is marked `[B]` with the owner named, never self-closed.
<!-- /ANCHOR:ai-exec -->

---

<!-- ANCHOR:setup -->
## Phase 1 — Setup and measurement (before any leg)
<!-- /ANCHOR:setup -->

- [x] T001 [P0] Open, by hand, every capture §5B names and every capture that supersedes one, and
      record adopted / adapted / rejected-with-reason per behaviour row. **Deliverable corrected:**
      T001's record is **`design-trueup.md`**, as it is in `050` and `055`; `migration-table.md` is
      T003's and consumes it. Writing T001's record into T003's file was a circular dependency in the
      draft.
      **Proof — done 2026-09-05.** `design-trueup.md` exists and carries all seven §5B rows plus the
      S9 editor taxonomy against **31 named captures**: the 25 `anytype-menu-object-*` object-page
      menus, the 12 `anytype-menu-cell-*` grid-cell editors, the iOS relations panel with its
      per-format editors and its property-management sheet, and the catalogue grids. Every filename
      resolves under `screenshots/anytype/`. **Nine contradictions** are recorded in §1 and ruled on
      by `decision-record.md` ADR-004, three of them structural (A2's anatomy, A4's absent group,
      A5's reversion to captured). **Two named gaps, never silent:** A4 has no reference screen on
      either platform and says so, and `menus/anytype-menu-cell-type-dark.png` could not be read —
      its menu fell outside the crop — with the same menu legible in
      `menu-object-type-picker-dark.png`, which the row does not depend on. AC-010 is **Met**. The
      three `spec.md` §10 open questions are answered in `design-trueup.md` §5.
- [x] T002 [P0] Measure the red numbers on the current tree and write them into `checklist.md`'s
      Today cells: header-builder census (4), property-row vocabulary census (3), type-list census
      (3), the record sheet's hidden-group absence, the "Empty" placeholder in
      `getEmptyDisplayValue`, and the exported-editor count (0).
      **Proof:** `checklist.md` Today cells carry the numbers and the command or lane that read
      them; the census lane (built here as a throwaway harness if the permanent one is not ready
      yet) fails or reports the counts as recorded.
      **Done 2026-09-05.** Every number re-confirmed unchanged (C1 4, C2 3-at-4-sites, C3
      1-list+1-filter+1-submenu, C4 absent, C5 "Empty", C6 0) via `rg`/`sed` against the current
      tree, with several stale `file:line` citations corrected in the same pass (`getEmptyDisplayValue`
      `:636`→`:655`; the empty-filter `:387-396`→`:399-410`; `column-manager-renderer.ts` row builder
      `:265`→`:267`; `board-card-properties-panel.ts` row `:48`→`:50`; `property-type-conflict-modal.ts`
      `getTypeOptions` and `create-property-modal.ts`'s `PROPERTY_TYPES` citations in `checklist.md` C3
      corrected from `:364-369`/`:69-74`, both drifted, to the confirmed `:377`/`:48`). The two
      geometry rows (C8, C9) were measured live through a throwaway script mounting
      `panel-column-manager/file-view` and `panel-record-detail-docked/file-view` via
      `tools/live/render-assertion-bundle.mjs`: the properties panel's desktop rect (x 28.52, y
      25.17, w 540.96, h 604.51) and the board-card `pixelHash` baseline from `screenshots/manifest.json`
      (current at HEAD, `npm run screenshots:verify` exit 0). The same script re-read the docked
      record panel now that 006's docking landed (`ae46da94`) and found it currently green against
      `chrome-geometry-measure.mjs`'s floors — not a red this leg needs to fix. AC-002's per-row
      pixel figures (measured on a PNG capture) could not be re-observed under this leg's
      no-image-read constraint; the DOM box/`text-align` reading recorded here was proposed
      formally in `decision-record.md` ADR-005 as a substitute observable, then **Rejected**
      2026-09-05 (~18:20) — operator: "Keep the pixel reading." AC-002's proof stays the by-hand
      pixel read, owed to an image-capable leaf at the leg's close; this leg's DOM reading stands
      only as corroboration. **Observed, not fixed:** AC-007/C7's "four external callers" citation for
      `renderCardField` reads as **3** today (`board-renderer.ts:2185`, `gallery-renderer.ts:691`,
      `record-detail-panel.ts:474`, plus its own test file) — outside T002's named scope, named here
      rather than corrected in passing.
- [ ] T003 [P0] Write `migration-table.md`: one row per §5A surface (10) and one per §5B behaviour
      (7), columns surface → primitive → changes → Anytype pattern with capture filename → stays
      ours. The behaviour rows **consume `design-trueup.md` §3 and §4** rather than re-reading the
      captures; A4's row records its named gap and cites no capture. **Proof:** AC-008's file check
      passes against the table.

---

<!-- ANCHOR:legs -->
## Phase 2 — Primitives

### L1 — P1 header primitive
<!-- /ANCHOR:legs -->

- [ ] T010 [P0] Build `record-surface/record-header.ts` with phone and desktop variants; the phone
      variant delegates to `createSheetHeader` (`mobile-bottom-sheet.ts:160`), the desktop variant
      reproduces the record sheet's current desktop DOM (icon + title + open + close). Register the
      module in `record-surface/index.ts`'s contract table. **Proof:** unit test on both variants'
      DOM; no existing capture moved.
- [ ] T011 [P1] Write the census lane row for header builders across the three surfaces, observed
      red (4) from T002's number. **Proof:** lane row exists and reports 4 today.

### L2 — P2/P3/P5 display primitives

- [ ] T020 [P0] Build `record-surface/property-row.ts`: display and interactive variants, anatomy
      per A2 (type icon via `property-type-icon.ts`, label, value; option badges via
      `resolveOptionDisplay`; rating/progress/ring via `number-display-renderer.ts`; conditional
      format callback). `card-field-renderer.ts` becomes a re-export shim. **Proof:** unit tests on
      the variants; `renderCardField`'s four external callers pass their existing tests through the
      shim.
- [ ] T021 [P0] Build `record-surface/hidden-properties.ts`: collapsed group with count, toggle,
      expanded state carried across refreshes. **Proof:** unit test asserting survival across a
      simulated `renderContent` re-run; red before (no such module).
- [ ] T022 [P0] Build `record-surface/add-property-row.ts` with the search-first picker (A5):
      search over existing properties, create-new falling through to `CreatePropertyModal`.
      **Proof:** unit test on the search filter and the create-new fall-through.
- [ ] T023 [P1] Census lane row for property-row vocabularies, observed red (3). **Proof:** lane row
      reports 3 today.

## Phase 3 — Consumers

### L3 — Record sheet and peek switch

- [ ] T030 [P0] Switch `record-detail-panel.ts` onto P1, P2, P3, P5: primitive header, primitive
      rows, the add-property affordance replacing the "Empty" word for editable types (REQ-004),
      the hidden group replacing the `showEmptyFields` all-or-nothing filter as the hidden
      affordance (REQ-003; `showEmptyFields` stays as the render/not-render switch). Mount P6-host
      after the rows, unchanged. **Proof:** lane row on the record sheet asserting header, rows,
      add affordance, hidden group, body order; the "Empty"-word negative control red then green;
      note-body regression test green.
- [ ] T031 [P0] Switch `table-record-peek.ts` onto P1 (desktop rail variant) and P2's display
      variant; retire its private `renderProperty` body. **Proof:** the badge-rendering unit tests
      pass; `panel-record-peek` capture re-read and byte-compared via `pixelHash`.
- [ ] T032 [P0] Re-read the board-card reference captures after this leg (cards draw P2 rows now).
      **Proof:** `pixelHash` identical, or the difference carried to the operator for a ruling
      (plan §5's parity posture). If differences exist, STOP the leg close until ruled.

### L4 — Properties panel, board-card properties, P7

- [ ] T040 [P0] Build `record-surface/type-picker.ts`: the thirteen formats
      (`column-types.ts:135-149`'s labels), icons via `property-type-icon.ts`, gating reasons
      (rollup needs a relation — carried from `create-property-modal.ts:139-150`'s precedent;
      conflict modal's source-kind subsets from `property-type-conflict-modal.ts:364-369`).
      **Proof:** unit test on the list, the icons and the gating.
- [ ] T041 [P0] Switch `column-manager-renderer.ts` rows onto P2's checkbox variant and its add row
      onto P3; keep `createSheetHeader` for the phone header and P1's desktop variant for the
      desktop header. **Proof:** the panel's range-select and drag tests pass; the desktop panel's
      rect asserted unchanged by the lane.
- [ ] T042 [P0] Switch `board-card-properties-panel.ts` onto P2's checkbox variant. **Proof:**
      `045`'s tests pass unchanged (mechanism frozen by its ADR-002); no card-hide behaviour change.

### L5 — Type-list sites

- [ ] T050 [P0] Wire P7 into `create-property-modal.ts`, `property-type-conflict-modal.ts` (both
      `getTypeOptions` subsets), `relation-rollup-config-modal.ts`, `formula-modal.ts`'s three
      output-type dropdowns (`:274`, `:443`, `:454` — type dropdowns only, per ADR-003), and
      `column-menu.ts`'s type submenu. **Proof:** census reads 1 type list across the five sites;
      each site's dropdown renders the same options as before the switch (unit-test the option
      lists before and after).

## Phase 4 — Extraction, retirement and gate

### L6 — Editor extraction (ADR-002)

- [ ] T060 [P0] Pin the dispatch contract: a unit test asserting `CellRenderer.startEdit`'s
      type → editor mapping (checkbox, status, select, multi-select, relation, number, currency,
      date, datetime, files, text, markdown text, computed, rollup, file.name) from
      `cell-renderer.ts:687-739`'s dispatch. **Proof:** test observed red against the un-extracted
      tree (no exported editor modules), then green with wrappers delegating — the only leg allowed
      to be red-first at start by design, with the red being the *absence* of the modules, not a
      broken behaviour.
- [ ] T061 [P0] Extract the option editor (`editOptionPopover`, `:1106`) to
      `record-surface/cell-editor-option.ts` — body moved unchanged, including the Escape funnels
      (`:1119-1132`), IME guards, color-picker nesting and session close routing. **Proof:** the
      dispatch test green; a lane mounts the editor standalone (no `CellRenderer`); existing
      option-editor tests green.
- [ ] T062 [P0] Extract the relation editor (`editRelationPopover`, `:899`) to
      `record-surface/cell-editor-relation.ts` — body moved unchanged, including the phone
      `createSheetHeader` (`:941`) and the virtualized list (`rowHeight 34`, `windowSize 80`,
      `:963-965`). **Proof:** dispatch test green; lane mounts it standalone; relation-editor tests
      green.
- [ ] T063 [P0] Extract the date editor (`editDatePopover`, `:1787`) to
      `record-surface/cell-editor-date.ts`; then text (`editText` `:2294`, `editTextPopover`
      `:2353`, `editSingleLinePopover` `:2658`) to `cell-editor-text.ts`; then number
      (`editNumber`, `:1596`) to `cell-editor-number.ts`. One extraction per leg; no behavioural
      edit inside a move. **Proof:** dispatch test green after each; the mobile date popover's
      inline-dock branch (`:1825-1838`) carried unchanged.
- [ ] T064 [P1] The lane mounts the option and relation editors over a record sheet instance,
      registering the stacked pair per `048`'s lane — row added, not a new stacking mechanism.
      **Proof:** `sheet-grammar` registry carries the pair and reports it green with `048`'s
      model.

### L7 — Retirement, registry, gate

- [ ] T070 [P0] Retire the per-surface duplicates: the peek's `renderProperty` body, the hand-built
      headers, `PROPERTY_TYPES` and `getTypeOptions`, the duplicated `shouldIgnoreDrag` helpers —
      and sweep `styles.css` for the rules only those builders referenced. **Proof:** the census
      lane reads 1/1/1 on headers/rows/type-lists; the retired class names have no live rule
      (`grep` empty); `npm run screenshots:verify` exit 0 with the changed captures opened and
      read.
- [ ] T071 [P0] Register the phone surfaces this phase changed in `sheet-grammar.mjs`'s registry
      where not already registered; run the whole gate.
      **Proof:** `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, every negative control observed
      red then green; `npm run replay` holds with reversed 0.

---

## Operator rows — device confirmation

Nothing in this repository closes these. An agent never ticks one.

- [ ] OPS-001 [P0] **iOS.** The operator opens a record from the table, board and calendar on the
      phone and reads the sheet as one object page — header, properties, add affordance, hidden
      group, note body — against the Anytype object page.
- [ ] OPS-002 [P0] **Desktop.** The operator edits properties through the record sheet, a board
      card and the peek and reports no surface where a property looks or edits differently from the
      others.
- [ ] OPS-003 [P0] **Both.** The operator confirms the formula workbench, the rollup configuration
      and every aggregation behave exactly as before this phase (the ADR-003 exclusion, read as the
      surface it protects).

---

## Verification summary

| Category | Total | Done |
|----------|-------|------|
| Setup/measurement | 3 | 2 |
| L1 | 2 | 0 |
| L2 | 4 | 0 |
| L3 | 3 | 0 |
| L4 | 3 | 0 |
| L5 | 1 | 0 |
| L6 | 5 | 0 |
| L7 | 2 | 0 |
| Operator | 3 | 0 (never agent-ticked) |
