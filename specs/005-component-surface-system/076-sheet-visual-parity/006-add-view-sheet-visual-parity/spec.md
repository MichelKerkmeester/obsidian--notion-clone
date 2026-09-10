---
title: "Feature Specification: Phase 6: Add View Sheet Visual Parity"
description: "The Add view sheet against Notion's Layout screen: a selection grid of layout tiles with the active one outlined, then one card of setting rows carrying toggles and trailing values."
trigger_phrases:
  - "076 phase 6"
  - "add view sheet visual parity"
  - "006 define table"
  - "add view sheet image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/006-add-view-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 006: the six-step loop and the DEFINE table"
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
      - "src/views/toolbar-renderer.ts"
      - "src/views/dropdown-field.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "006-add-view-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "The reference shows Notion's Layout screen, which is where a view's type is changed. Whether Notion's create a new view flow uses the same screen is not established by these captures; T001 reads the new-database family and records the answe"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 6: Add View Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

The Add view sheet against Notion's Layout screen: a selection grid of layout tiles with the active one outlined, then one card of setting rows carrying toggles and trailing values.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: `../005-group-sheet-visual-parity/` must have passed its judge twice before this child starts (D4). `../007-property-editor-sheet-visual-parity/` inherits this child's settled vocabulary.

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
| **Predecessor** | `../005-group-sheet-visual-parity/spec.md` |
| **Successor** | `../007-property-editor-sheet-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 6** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Add View Sheet and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The Add view sheet against Notion's Layout screen: a selection grid of layout tiles with the active one outlined, then one card of setting rows carrying toggles and trailing values.

### Purpose

The Add View Sheet reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-toolbar-add-view` — `constructedScenario("toolbar-add-view", { renderer: "toolbar", toolbarPopover: "add-view" })`, harness branch `scenario.renderer === "toolbar"` at `tools/live/render-assertion-harness.ts:3227`. Captures `screenshots/notion-clone/**/constructed-toolbar-add-view-mobile-{light,dark}.png`
- Fixture `add-view-popover` declares `fixtureOf: "constructed-toolbar-add-view"`; no scenario work is owed
- `src/views/add-view-popover-layout.test.ts` already pins this surface's layout and is the regression set T001 reads first

### Producers

- `src/views/toolbar-renderer.ts` — the add-view popover/sheet
- `src/views/dropdown-field.ts`
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

As the operator, I open the Add View Sheet on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- The reference shows Notion's **Layout** screen, which is where a view's type is changed. Whether Notion's *create a new view* flow uses the same screen is not established by these captures; T001 reads the `new-database` family and records the answer or marks it `unreadable at 299x678`

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

- `screenshots/notion/ios/database/notion-ios-database-database-14-d1de51a5-*.webp` — the Layout screen with **List** selected: a 3×3 tile grid, then one card of four rows (`Show data source title` toggle, `Show page icon` toggle, `Open pages in` → `Side peek ›`, `Load limit` → `50 ›`)
- `screenshots/notion/ios/database/notion-ios-database-database-12-5db722f5-*.webp` — the same screen with **Chart** selected, plus a full-width blue action pill and a `? Learn about charts` row
- `screenshots/notion/ios/flows/view-options/notion-ios-flow-view-options-02-794591f5-*.webp` — the sheet the `Layout ›` row is reached from, for header and card grammar
- `screenshots/notion/ios/database/notion-ios-database-new-database-*` (7 files) — to be read at T001 for the create-a-view path

### What the reference cannot answer

- The reference shows Notion's **Layout** screen, which is where a view's type is changed. Whether Notion's *create a new view* flow uses the same screen is not established by these captures; T001 reads the `new-database` family and records the answer or marks it `unreadable at 299x678`

### The table

T001-T004 complete this table. The reference paths and the observed Notion column below are read; the Ours column must be measured from the current capture and producer at T002, and every Target number derived from our own tree.

| Element | Ours today | Notion (structural) | Target |
|---|---|---|---|
| Sheet frame | To be measured at T002 | Push screen: centred title, **back chevron top-left**, nothing top-right | Handle and header match `001`'s settled vocabulary |
| Layout choice | To be measured at T002 | A **tile grid** (Table / Board / Timeline / Calendar / List / Gallery / Chart / Feed / Map / Dashboard), the active tile carrying a blue outline | Layout is chosen from a tile grid with a visible selected state, not a list of radio rows |
| Settings block | To be measured at T002 | **One card** of rows below the grid, hairline dividers, no section heading | 1 card; dividers within it only |
| Boolean setting | To be measured at T002 | Label, **no leading icon**, trailing **toggle** (`Show data source title`, `Show page icon`) | Booleans are inline toggles, never navigation rows |
| Value setting | To be measured at T002 | Label, trailing **grey value + chevron** (`Open pages in` → `Side peek ›`, `Load limit` → `50 ›`) | Value settings are navigation rows, matching `001` |
| Primary action | To be measured at T002 | A full-width **blue pill button**, not a row (`Edit chart`) | Where a primary action exists it is a pill, visually distinct from the rows |
| Help row | To be measured at T002 | `? Learn about …` with a leading question-mark icon | Help rows carry the same leading-icon grammar as `001`'s action rows |
| Both themes | — | — | Tile, selected-outline, card and canvas tokens each distinct in light and dark |

### The lane clauses these rows become

- **L1** layout choice renders as a tile grid with exactly 1 tile carrying a selected state
- **L2** the settings block renders as 1 card with hairline dividers and no section heading
- **L3** every boolean setting is a trailing toggle and every value setting a trailing value + chevron
- **L4** 0 bare icon buttons in the header
- **L5** `add-view-popover-layout.test.ts`'s existing assertions re-run unchanged and green

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
