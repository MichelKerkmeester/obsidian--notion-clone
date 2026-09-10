---
title: "Feature Specification: Phase 4: Sort Sheet Visual Parity"
description: "The sort sheet's rule is two rows and a labelled delete after 071/012; Notion merges the two rows into one card, picks direction through a drill-in sub-sheet, and separates per-rule delete from whole-config delete. The active-rule sort popover kept the old grammar."
trigger_phrases:
  - "076 phase 4"
  - "sort sheet visual parity"
  - "004 define table"
  - "sort sheet image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/004-sort-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 004: the six-step loop and the DEFINE table"
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
      - "src/views/sort-panel-renderer.ts"
      - "src/views/active-rule-popover-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "004-sort-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "Notion's sort-rule reorder affordance was never observed. Only single-rule states were captured. 004 may not claim one, and 071/012 ADR-001's Notion half stays PROVISIONAL exactly as that ADR left it (audit §5 C-4)"
      - "Four files in the sort family show other surfaces entirely (Settings sheets, a chart layout screen) and are not usable as sort references; T001 records which"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 4: Sort Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

The sort sheet's rule is two rows and a labelled delete after 071/012; Notion merges the two rows into one card, picks direction through a drill-in sub-sheet, and separates per-rule delete from whole-config delete. The active-rule sort popover kept the old grammar.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: `../003-filter-sheet-visual-parity/` must have passed its judge twice before this child starts (D4). `../005-group-sheet-visual-parity/` inherits this child's settled vocabulary.

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
| **Predecessor** | `../003-filter-sheet-visual-parity/spec.md` |
| **Successor** | `../005-group-sheet-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 4** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Sort Sheet and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The sort sheet's rule is two rows and a labelled delete after 071/012; Notion merges the two rows into one card, picks direction through a drill-in sub-sheet, and separates per-rule delete from whole-config delete. The active-rule sort popover kept the old grammar.

### Purpose

The Sort Sheet reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-sort-panel` and `constructed-sort-panel-calendar` — `constructedScenario("sort-panel", { renderer: "sort-panel" })`, harness branch `scenario.renderer === "sort-panel"` at `tools/live/render-assertion-harness.ts:3388`. Captures `screenshots/notion-clone/panels/constructed-sort-panel*-mobile-{light,dark}.png`
- `constructed-active-rule-sort` — `constructedScenario("active-rule-sort", { renderer: "active-rule-popover", ruleKind: "sort" })`, harness branch at `tools/live/render-assertion-harness.ts:3314`. Captures `screenshots/notion-clone/components/constructed-active-rule-sort-mobile-{light,dark}.png`. The same second-surface gap as `003` (D2a)
- Fixtures `panel-sort-rules`, `panel-sort-calendar-empty` and `chrome-active-rule-popover-sort` declare `fixtureOf` at these; no scenario work is owed

### Producers

- `src/views/sort-panel-renderer.ts` — the sort sheet
- `src/views/active-rule-popover-renderer.ts` — **the second surface**
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

As the operator, I open the Sort Sheet on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- **Notion's sort-rule reorder affordance was never observed.** Only single-rule states were captured. `004` may not claim one, and `071/012` ADR-001's Notion half stays PROVISIONAL exactly as that ADR left it (audit §5 C-4)
- Four files in the sort family show other surfaces entirely (Settings sheets, a chart layout screen) and are not usable as sort references; T001 records which

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

- `screenshots/notion/ios/database/notion-ios-database-sort-01-84653307-*.webp` — the sort rule: property row and direction row **merged into one card**, a red `Delete` card below it, and an `Add sort` / `Delete sort` card at the bottom
- `screenshots/notion/ios/database/notion-ios-database-sort-02-21c3130a-*.webp` — the direction sub-sheet: `Ascending` / `Descending` as a flat drill-in list with `Done` top-right
- `screenshots/notion/ios/navigation/notion-ios-navigation-sort-15-fe199502-*.webp` — a further sort surface, to be read at T001

### What the reference cannot answer

- **Notion's sort-rule reorder affordance was never observed.** Only single-rule states were captured. `004` may not claim one, and `071/012` ADR-001's Notion half stays PROVISIONAL exactly as that ADR left it (audit §5 C-4)
- Four files in the sort family show other surfaces entirely (Settings sheets, a chart layout screen) and are not usable as sort references; T001 records which

### The table

Read this session. The Ours column is the **post-`071/012`** state — the stacked two-row rule and labelled delete already landed. The Notion column is structural; every Target number is ours or `TBD`.

| Element | Ours today | Notion (structural) | Target |
|---|---|---|---|
| Sheet frame | Grey canvas, handle, centred `Sort`, `✕` | Grabber, centred title, back chevron top-left, **no header icon buttons** | Handle present; 0 bare icon buttons in the header |
| Rule: property row | Its own row, with a leading picker and the arrow pair | Leading **type icon** · label · chevron | Type icon leads; the row opens a property picker |
| Rule: direction row | Its own row, indented to 42px | **Same card** as the property row, indented, no leading icon, chevron | Property and direction render in **1** card, not 2 rows in 2 boxes |
| Direction control | The plugin's own picker (0 native selects) | A drill-in **sub-sheet** with two flat rows and `Done` top-right — not a segmented control, not an inline dropdown | Direction opens a sheet; 0 inline dropdowns for it |
| Per-rule delete | A labelled `is-warning` row inside the rule block | A **red `Delete` row in its own card**, directly below the rule card | Delete sits in its own card below the rule, not inside it |
| Whole-config actions | `+ Add sort` | `+ Add sort` and `🗑 Delete sort` together in **one bottom card** | Two rows, one terminal card, distinct from the per-rule delete |
| Reorder | The `↑↓` arrow pair (`071/012` ADR-001) | `unreadable at 299x678` — never observed | Unchanged from `071/012` unless the operator's C-4 capture arrives; `TBD — needs operator capture` |
| Calendar hint | 74-character hint string | Not applicable — Notion has no equivalent | Unchanged; regression-checked at ≤ 80 characters |
| Active-rule popover | **One row of three dropdowns** | Same grammar as the sheet | The popover renders the sheet's rule grammar; **0** rows carrying 3 side-by-side dropdowns |
| Both themes | — | — | Card, canvas, divider and the red destructive token each distinct in light and dark |

### The lane clauses these rows become

- **L1** the active-rule sort popover renders 0 rows carrying 3 side-by-side dropdown controls — RED today at 1
- **L2** a sort rule's property and direction render inside 1 card with 1 shared outline — RED today at 2 separate boxes
- **L3** direction choice opens a sheet: 0 inline dropdown controls for direction — RED today at 1
- **L4** the per-rule delete renders in its own card below the rule card — RED today at inside the rule block
- **L5** the sheet carries a terminal card containing both add and whole-config delete — RED today at add only
- **L6** `071/012`'s clauses re-run unchanged and green: 1 reorder affordance, ≤ 4 controls per row, ≤ 80-character prose

### Contradictions with landed `071` rulings

Raised as **Proposed ADRs** in `../../roadmap.md` §7 under D15 before this child implements. A `071` child is never amended from here.

- `071/012` ADR-001 chose the `↑↓` pair as the one reorder affordance and held its Notion half PROVISIONAL pending capture C-4. D3's gap confirms C-4 is still missing, so **the ruling stands unchanged** and `004` does not touch reorder
- `071/012` put the labelled delete **inside** the rule block; the reference puts it in its own card below. Raised as a Proposed ADR in `roadmap.md` §7 before `004` implements

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
