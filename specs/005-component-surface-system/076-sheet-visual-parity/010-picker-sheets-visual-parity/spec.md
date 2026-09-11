---
title: "Feature Specification: Phase 10: Date, Icon, Colour and Property-Type Pickers Visual Parity"
description: "Four picker sheets against their references, including the icon picker's crowded search row that 071/014 recorded and the date picker's CSS-specificity leak that the design review found."
trigger_phrases:
  - "076 phase 10"
  - "date, icon, colour and property-type pickers visual parity"
  - "010 define table"
  - "date, icon, colour and property-type pickers image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/010-picker-sheets-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 010: the six-step loop and the DEFINE table"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T004"
    blockers:
      - "No number may come from a 299x678 reference asset (D3)"
      - "The child does not close until the image judge passes twice on an unchanged tree (D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/date-value-picker.ts"
      - "src/views/date-picker-model.ts"
      - "src/views/icon-picker-popover.ts"
      - "src/views/option-color-picker.ts"
      - "src/views/record-surface/type-picker.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "010-picker-sheets-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "T001 records, per picker, which frames are on-target — the reference reads taken this session found roughly a third of files mislabelled by Mobbin family name"
      - "Three date-picker frames is a thin sample for a surface with a calendar grid, a time mode and a range mode; T001 states which modes are observable and which are unreadable at 299x678"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 10: Date, Icon, Colour and Property-Type Pickers Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

Four picker sheets against their references, including the icon picker's crowded search row that 071/014 recorded and the date picker's CSS-specificity leak that the design review found.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: `../009-menu-and-confirm-visual-parity/` must have passed its judge twice before this child starts (D4). `../011-toolbar-overflow-and-column-width/` inherits this child's settled vocabulary.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Scaffolded — nothing started |
| **Created** | 2026-09-10 |
| **Branch** | `worktrees/290-sheet-parity-program` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `076-sheet-visual-parity` |
| **Predecessor** | `../009-menu-and-confirm-visual-parity/spec.md` |
| **Successor** | `../011-toolbar-overflow-and-column-width/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 10** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Date, Icon, Colour and Property-Type Pickers and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Four picker sheets against their references, including the icon picker's crowded search row that 071/014 recorded and the date picker's CSS-specificity leak that the design review found.

### Purpose

The Date, Icon, Colour and Property-Type Pickers reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-date-picker` and `constructed-date-picker-datetime` — harness branch `scenario.renderer === "date-picker"` at `tools/live/render-assertion-harness.ts:3724`
- `constructed-icon-picker` — harness branch at `tools/live/render-assertion-harness.ts:3741`
- `constructed-option-color-picker` — harness branch `scenario.renderer === "color-picker"` at `tools/live/render-assertion-harness.ts:3767`
- `constructed-depth3-property-type-picker` — `constructedDepth3Scenario` via `mountConstructedDepth3Stack`. **`007` may collapse this chain**, so `010` runs after `007` and inherits whatever depth `007` lands (D2a)
- All are production mounts; no scenario work is owed

### Producers

- `src/views/date-value-picker.ts`
- `src/views/date-picker-model.ts`
- `src/views/icon-picker-popover.ts`
- `src/views/option-color-picker.ts`
- `src/views/record-surface/type-picker.ts` — **shared with `007`**
- `styles.css`

### Out of Scope

- Behaviour, semantics, persistence and data shape
- Desktop presentations, except as a regression check
- Reopening any `071` landing. A contradiction becomes a Proposed ADR in `../../roadmap.md` §7 (D15), never an amendment made here
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 — Blockers (MUST complete)

- **REQ-001** Every numeric target in §13 is measured from our own tree or marked `TBD — needs operator capture`. None is derived from a 299×678 reference asset (D3)
- **REQ-002** Every production surface rendering this grammar is enumerated before any file is named (D2a)
- **REQ-003** Every lane clause runs RED with its failing number recorded before the producer moves
- **REQ-004** The image judge scores ≥ 14/16 with no row at 0, **twice consecutively on an unchanged tree** (D1)

### P1 — Required

- **REQ-005** Phone light and dark captures are current, and both were opened and looked at
- **REQ-006** The `071` clauses this sheet already carries re-run unchanged and green
- **REQ-007** The operator's device row is present and unticked (D5)
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

| ID | Criterion | Measured by |
|----|-----------|-------------|
| SC-001 | Every row of §13 has a target, and every reference path resolves | `spec.md` §13 |
| SC-002 | Every lane clause green, each with its RED number recorded beside it | `tools/live/sheet-grammar.mjs` |
| SC-003 | Judge ≥ 14/16, no row at 0, twice on an unchanged tree | `verification.md` |
| SC-004 | The operator reads the sheet on their own iPhone and reports it aligned | Operator — **no agent ticks this** |
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Impact | Mitigation |
|------|--------|------------|
| A green lane over an unchanged picture — the failure that opened this programme | The sheet ships looking the same | D1: the judge is a required gate; every rubric row is written about identity and appearance, not count |
| A second surface renders the same grammar and is missed | Half the sheet is fixed | D2a: §3 enumerates every producer before §13 names a file |
| A number is read off a 299×678 thumbnail | A target that is precise and wrong | D3: structural reference only; every number is ours or `TBD` |
| `styles.css` contention with another child | Two changes each pass alone and conflict merged | D4: one child at a time, one css-lane holder |
<!-- /ANCHOR:risks -->

---

## 7. NON-FUNCTIONAL REQUIREMENTS

Touch targets ≥ 44px on every control this child adds or moves. No contrast regression in either theme. No new dependency, no new runtime pattern.

---

## 8. EDGE CASES

- The sheet at its longest content, against the 90svH cap and the published keyboard inset
- The sheet with the keyboard up
- Empty and single-item states for every list this sheet renders
- Both themes, each read on its own rather than assumed from the other

---

## 9. COMPLEXITY ASSESSMENT

Level 2. One surface family, presentational, with a shared stylesheet and a shared row vocabulary. The complexity is in the verification loop, not the change.

---

## 10. RISK MATRIX

| Area | Likelihood | Impact | Net |
|---|---|---|---|
| Visual regression on a sibling sheet sharing a primitive | Medium | High | Regression clauses re-run in the same lane run |
| The target itself is wrong | Low | High | Three failed judge iterations on one rubric row re-opens DEFINE rather than patching CREATE |

---

## 11. USER STORIES

As the operator, I open the Date, Icon, Colour and Property-Type Pickers on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- T001 records, per picker, which frames are on-target — the reference reads taken this session found roughly a third of files mislabelled by Mobbin family name
- Three date-picker frames is a thin sample for a surface with a calendar grid, a time mode and a range mode; T001 states which modes are observable and which are `unreadable at 299x678`

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

> **Frame ruling (D7, operator, 2026-09-11):** no card containers anywhere in this sheet — rows group with hairline dividers on the plain sheet background; where the table below still names a card, D7 overrides it at CREATE time even though this scaffolded table is not rewritten here.

### References

- `screenshots/notion/ios/sheets/notion-ios-sheets-date-picker-03-cb9d8cab-*.webp`, `-04-fd9402ee-*.webp`, `-09-cfca14fb-*.webp` — the date picker
- `screenshots/notion/ios/sheets/notion-ios-sheets-icon-picker-01-0c4e7197-*.webp`, `-02`, `-05`, `-06`, `-07` — five icon-picker frames
- `screenshots/notion/ios/database/notion-ios-database-color-picker-04-e5accf4d-*.webp` — the colour picker
- `screenshots/notion/ios/sheets/notion-ios-sheets-cover-icon-01-b1b9d218-*.webp`, `-02-4dd0854f-*.webp` — the cover/icon surface
- The `Type` section of `screenshots/notion/ios/database/notion-ios-database-database-11-1589e7c8-*.webp` — the inline type list `007` targets

### What the reference cannot answer

- T001 records, per picker, which frames are on-target — the reference reads taken this session found roughly a third of files mislabelled by Mobbin family name
- Three date-picker frames is a thin sample for a surface with a calendar grid, a time mode and a range mode; T001 states which modes are observable and which are `unreadable at 299x678`

### The table

T001-T004 complete this table, one block per picker. `010` runs after `007` and inherits the property-type picker's landed depth rather than re-deciding it.

| Element | Ours today | Notion (structural) | Target |
|---|---|---|---|
| Date: frame | To be measured at T002 | To be read at T001 | Handle and header match `001`'s settled vocabulary |
| Date: calendar grid | To be measured at T002 | To be read at T001 | Every mini-nav control ≥ 44px — the `071/015` finding, which is this child's floor |
| Date: time and range | To be measured at T002 | To be read at T001 | `TBD` where the reference cannot show the mode |
| Date: specificity | `071/013`'s reordered picker carries a CSS-specificity leak (`sheet-design-review.md`) | — | The leak is closed and asserted, not merely restyled around |
| Icon: search row | Crowded (`071/014` P3 finding) | To be read at T001 | Search row's controls each ≥ 44px with a legible gap; no clipped placeholder |
| Icon: grid | To be measured at T002 | To be read at T001 | Grid cells ≥ 44px; empty state legible in both themes |
| Colour: swatches | To be measured at T002 | To be read at T001 | Swatch box ≥ 44px; selected state visible in both themes |
| Type picker | Inherited from `007` | Inherited from `007` | **Identical** to whatever `007` lands; `type-picker.ts` is shared |
| Both themes | — | — | Grid, swatch, selected-state and canvas tokens each distinct in light and dark |

### The lane clauses these rows become

- **L1** every picker control's box measures ≥ 44px — RED today on the calendar mini-nav at 24px (`071/015`)
- **L2** the icon picker's search row carries no clipped text and its controls clear the touch floor
- **L3** the date picker's styling carries no specificity leak from `071/013`'s reorder
- **L4** the property-type picker is structurally identical to `007`'s landed type list
- **L5** each picker's selected state is visible in both themes

### Contradictions with landed `071` rulings

Raised as **Proposed ADRs** in `../../roadmap.md` §7 under D15 before this child implements. A `071` child is never amended from here.

- `071/014` recorded the icon picker's crowded search row as P3 residue and `071/015` opened the 24px mini-nav target. Both are inherited here as **floors**, not re-decisions

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
