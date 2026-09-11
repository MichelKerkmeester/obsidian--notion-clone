---
title: "Feature Specification: Phase 5: Group Sheet Visual Parity"
description: "The group sheet carries a Shown/Hidden partition landed by 071/012 against a Notion screen that is not in this repository; the reference that does exist shows a two-row entry sheet and a flat checkmark property picker."
trigger_phrases:
  - "076 phase 5"
  - "group sheet visual parity"
  - "005 define table"
  - "group sheet image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/005-group-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 005: the six-step loop and the DEFINE table"
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
      - "src/views/board-groups-panel.ts"
      - "src/views/group-label-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "005-group-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "Notion's grouped Shown/Hidden result screen is not present in any capture in this repository. Per-group visibility controls, section headings and bulk actions at group level are all unreadable at 299x678. 005 may not build a shown/hidden pa"
      - "Two of the four group-family files show unrelated content entirely and are unusable"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 5: Group Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

The group sheet carries a Shown/Hidden partition landed by 071/012 against a Notion screen that is not in this repository; the reference that does exist shows a two-row entry sheet and a flat checkmark property picker.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: `../004-sort-sheet-visual-parity/` must have passed its judge twice before this child starts (D4). `../006-add-view-sheet-visual-parity/` inherits this child's settled vocabulary.

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
| **Predecessor** | `../004-sort-sheet-visual-parity/spec.md` |
| **Successor** | `../006-add-view-sheet-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 5** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Group Sheet and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The group sheet carries a Shown/Hidden partition landed by 071/012 against a Notion screen that is not in this repository; the reference that does exist shows a two-row entry sheet and a flat checkmark property picker.

### Purpose

The Group Sheet reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-board-groups-panel` — `constructedScenario("board-groups-panel", { boardGroupsPanel: true })`. Captures `screenshots/notion-clone/panels/constructed-board-groups-panel-mobile-{light,dark}.png`
- The **group sheet built by `toolbar-renderer.ts`** is the surface `071/015` opened for a missing screenshot scenario. `005`'s first task confirms whether that scenario now exists; if it does not, registering it is T001 and precedes everything else (D2b)

### Producers

- `src/views/toolbar-renderer.ts` — the group builder
- `src/views/board-groups-panel.ts` — the board's groups panel
- `src/views/group-label-renderer.ts`
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

As the operator, I open the Group Sheet on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- **Notion's grouped Shown/Hidden result screen is not present in any capture in this repository.** Per-group visibility controls, section headings and bulk actions at group level are all `unreadable at 299x678`. `005` may **not** build a shown/hidden partition *against Notion*. `071/012` already landed one; if it survives, the justification is our own internal consistency with the properties and record sheets, and `005` records it as such rather than as parity
- Two of the four group-family files show unrelated content entirely and are unusable

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

> **Frame ruling (D7, operator, 2026-09-11):** no card containers anywhere in this sheet — rows group with hairline dividers on the plain sheet background; where the table below still names a card, D7 overrides it at CREATE time even though this scaffolded table is not rewritten here.

### References

- `screenshots/notion/ios/database/notion-ios-database-group-by-13-c3125904-*.webp` — the `Group` entry sheet: one card with `Group by ›`, then a separate card with `? Learn about grouping`
- `screenshots/notion/ios/database/notion-ios-database-filters-12-6c740ed6-*.webp` — the `Group by` property picker (mislabelled into the filters family): a search field then a flat borderless card of rows with a **checkmark** on the active one and **no chevrons**
- `screenshots/notion/ios/database/notion-ios-database-group-by-07-b4e4ca0d-*.webp` — the Settings sheet's `Group` row echoing its value as trailing text, confirming `001`'s navigation-row pattern

### What the reference cannot answer

- **Notion's grouped Shown/Hidden result screen is not present in any capture in this repository.** Per-group visibility controls, section headings and bulk actions at group level are all `unreadable at 299x678`. `005` may **not** build a shown/hidden partition *against Notion*. `071/012` already landed one; if it survives, the justification is our own internal consistency with the properties and record sheets, and `005` records it as such rather than as parity
- Two of the four group-family files show unrelated content entirely and are unusable

### The table

Read this session, and the read came back thin on purpose: only one of four supplied group captures is on-target. The Notion column below is what is actually observable, and the rows the reference cannot answer say so. T001-T004 must not fill those cells from inference.

| Element | Ours today | Notion (structural) | Target |
|---|---|---|---|
| Sheet frame | Grey canvas, handle, centred title | Grabber, centred title, back chevron top-left | Handle present; title centred within 1px |
| Entry sheet | Goes straight to the property list and controls | **Two rows**: `Group by ›` in one card, `? Learn about grouping` in a separate card | Entry sheet is a short table of contents, matching `001`'s vocabulary |
| Property picker | Rows with per-row controls | A search field, then a **flat borderless card**: `None ✓`, then each property. Checkmark on the active one, **no chevrons** | Picker rows are terminal — checkmark, no chevron, no per-row control |
| Section partition | `Shown` / `Hidden` headings with bulk actions (`071/012`) | `unreadable at 299x678` — no populated grouped screen exists here | Retained or removed by **our own** consistency argument, recorded as such; **no Notion claim** (D3) |
| Per-group controls | Present | `unreadable at 299x678` | `TBD — needs operator capture` |
| Bulk actions | `Hide all` / `Show all` on the section headers | `unreadable at 299x678` | `TBD — needs operator capture` |
| Value echo | — | The Settings sheet's `Group` row shows the current property as trailing text | Consistent with `001`'s navigation row: the group value appears as trailing text on the settings row |
| Both themes | — | — | Card, canvas, divider and checkmark tokens each distinct in light and dark |

### The lane clauses these rows become

- **L1** the group sheet has a registered constructed scenario mounting the production renderer — RED if `071/015`'s finding is still open
- **L2** the entry sheet renders ≤ 3 rows before the property picker — RED today
- **L3** property-picker rows are terminal: 0 chevrons, 1 checkmark on the active row — RED today
- **L4** `071/012`'s group clauses re-run unchanged: ≥ 2 section headings, ≥ 2 bulk actions, ≤ 4 controls per group row
- **L5** the group sheet's canvas and card tokens differ in both themes

### Contradictions with landed `071` rulings

Raised as **Proposed ADRs** in `../../roadmap.md` §7 under D15 before this child implements. A `071` child is never amended from here.

- `071/012` ADR-003 landed the group sheet's Shown/Hidden partition citing Notion's own group sheet. The reference read this session finds **no such capture in this repository**. This does not mean the partition is wrong — it means its stated justification cannot be checked here. Recorded as a Proposed ADR in `roadmap.md` §7 so the claim is corrected rather than repeated

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
