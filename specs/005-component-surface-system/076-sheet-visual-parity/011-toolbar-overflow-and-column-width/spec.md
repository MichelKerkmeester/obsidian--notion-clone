---
title: "Feature Specification: Phase 11: Toolbar Overflow and Column Width Visual Parity"
description: "The toolbar's overflow surface and the column-width sheet, the last two surfaces the operator meets, against their references and the landed 075 labelled-button and vertical-scroll-lock rulings."
trigger_phrases:
  - "076 phase 11"
  - "toolbar overflow and column width visual parity"
  - "011 define table"
  - "toolbar overflow and column width image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/011-toolbar-overflow-and-column-width"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 011: the six-step loop and the DEFINE table"
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
      - "src/views/toolbar-primitives.ts"
      - "src/views/column-width.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "011-toolbar-overflow-and-column-width-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "No Notion capture in this repository shows a column-width adjustment surface — Notion's mobile table does not expose one. 011 may not claim a Notion target for it; its target is our own internal consistency with 001's card and row vocabular"
      - "T001 records which views-table frames actually show the toolbar strip"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 11: Toolbar Overflow and Column Width Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

The toolbar's overflow surface and the column-width sheet, the last two surfaces the operator meets, against their references and the landed 075 labelled-button and vertical-scroll-lock rulings.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: `../010-picker-sheets-visual-parity/` must have passed its judge twice before this child starts (D4). This is the last child; when it closes, the parent's map goes complete.

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
| **Predecessor** | `../010-picker-sheets-visual-parity/spec.md` |
| **Successor** | None |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 11** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Toolbar Overflow and Column Width and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The toolbar's overflow surface and the column-width sheet, the last two surfaces the operator meets, against their references and the landed 075 labelled-button and vertical-scroll-lock rulings.

### Purpose

The Toolbar Overflow and Column Width reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-toolbar-utilities` — `constructedScenario("toolbar-utilities", { renderer: "toolbar", toolbarPopover })`, harness branch `scenario.renderer === "toolbar"` at `tools/live/render-assertion-harness.ts:3227`
- `constructed-column-width-adjuster` — harness branch `scenario.renderer === "column-width-adjuster"` at `tools/live/render-assertion-harness.ts:3627`. Captures `screenshots/notion-clone/panels/constructed-column-width-adjuster-mobile-{light,dark}.png`
- Fixtures `chrome-utilities-popover` and `panel-column-width-sheet` declare `fixtureOf` at these; no scenario work is owed
- `tools/live/run-phone-toolbar-scroll.mjs` and `tools/live/phone-toolbar-scroll.ts` already exercise the overflow strip's scroll behaviour and are `011`'s regression set

### Producers

- `src/views/toolbar-renderer.ts` — the utilities/overflow surface
- `src/views/toolbar-primitives.ts`
- `src/views/column-width.ts`
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

As the operator, I open the Toolbar Overflow and Column Width on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- No Notion capture in this repository shows a **column-width adjustment** surface — Notion's mobile table does not expose one. `011` may not claim a Notion target for it; its target is our own internal consistency with `001`'s card and row vocabulary, recorded as such (D3)
- T001 records which `views-table` frames actually show the toolbar strip

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

> **Frame ruling (D7, operator, 2026-09-11):** no card containers anywhere in this sheet — rows group with hairline dividers on the plain sheet background; where the table below still names a card, D7 overrides it at CREATE time even though this scaffolded table is not rewritten here.

### References

- `screenshots/notion/ios/flows/view-options/notion-ios-flow-view-options-02-794591f5-*.webp` — the sheet the toolbar's overflow leads to, for card and row grammar
- `screenshots/notion/ios/views/notion-ios-views-table-*` (7 files) — the table surface carrying the toolbar, to be read at T001 for the toolbar strip itself
- `screenshots/notion/ios/database/notion-ios-database-database-*` — the database chrome, for the overflow affordance
- The operator's own reference for `075` (an Obsidian Bases calendar phone toolbar with icon+label buttons) — `roadmap.md` §4 row 83

### What the reference cannot answer

- No Notion capture in this repository shows a **column-width adjustment** surface — Notion's mobile table does not expose one. `011` may not claim a Notion target for it; its target is our own internal consistency with `001`'s card and row vocabulary, recorded as such (D3)
- T001 records which `views-table` frames actually show the toolbar strip

### The table

T001-T004 complete this table. The column-width block has no external reference and is targeted on internal consistency; the toolbar block inherits `075`'s landed labelled-button and vertical-scroll-lock rulings as floors.

| Element | Ours today | Notion (structural) | Target |
|---|---|---|---|
| Toolbar: overflow strip | Horizontal scroll, vertical locked (`075`) | To be read at T001 | `075`'s clauses re-run unchanged: horizontal overflow, **0** vertical movement |
| Toolbar: buttons | Icon + label (`075`) | To be read at T001 | `075`'s landed grammar unchanged; box ≥ 44px |
| Toolbar: overflow sheet | To be measured at T002 | Card of labelled rows with leading icons | Matches `001`'s card and navigation-row vocabulary |
| Column width: frame | To be measured at T002 | **No reference exists** | `001`'s card and header vocabulary; justified on internal consistency, not parity (D3) |
| Column width: control | To be measured at T002 | **No reference exists** | Control box ≥ 44px; value legible; `TBD — needs operator capture` |
| Column width: actions | To be measured at T002 | **No reference exists** | Terminal action card matching `001` |
| Both themes | — | — | Strip, card, canvas and control tokens each distinct in light and dark |

### The lane clauses these rows become

- **L1** `075`'s toolbar clauses re-run unchanged: horizontal overflow present, vertical movement 0
- **L2** every toolbar button carries an icon and a label with a box ≥ 44px
- **L3** the overflow sheet's rows carry a leading icon and a label, in `001`'s card grammar
- **L4** the column-width sheet uses `001`'s card and header vocabulary
- **L5** the column-width control's box measures ≥ 44px

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
