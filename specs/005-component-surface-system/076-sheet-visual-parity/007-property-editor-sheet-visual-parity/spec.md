---
title: "Feature Specification: Phase 7: Add / Edit Property Sheet Visual Parity"
description: "Notion's New property sheet is a bordered name field plus an inline type list in the same sheet, not a name field and a chevron to a separate picker; and its delete row is not uniformly red."
trigger_phrases:
  - "076 phase 7"
  - "add / edit property sheet visual parity"
  - "007 define table"
  - "add / edit property sheet image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/007-property-editor-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 007: the six-step loop and the DEFINE table"
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
      - "src/views/modals/create-property-modal.ts"
      - "src/views/record-surface/type-picker.ts"
      - "src/views/record-surface/add-property-row.ts"
      - "src/views/property-type-icon.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "007-property-editor-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "Notion's delete-row styling is inconsistent across sheets. Delete property renders plain dark in the one Edit-property capture, while Delete view and Delete color setting render red elsewhere. One capture cannot generalise: 007 may not assu"
      - "The Edit-property capture is a relation property. No standard Text or Number Edit-property screen exists here, so which rows a simple property's editor carries is unreadable at 299x678"
      - "Whether tapping the static name row reveals a bordered input is not observable"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 7: Add / Edit Property Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

Notion's New property sheet is a bordered name field plus an inline type list in the same sheet, not a name field and a chevron to a separate picker; and its delete row is not uniformly red.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: `../006-add-view-sheet-visual-parity/` must have passed its judge twice before this child starts (D4). `../008-record-sheet-visual-parity/` inherits this child's settled vocabulary.

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
| **Predecessor** | `../006-add-view-sheet-visual-parity/spec.md` |
| **Successor** | `../008-record-sheet-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 7** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Add / Edit Property Sheet and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Notion's New property sheet is a bordered name field plus an inline type list in the same sheet, not a name field and a chevron to a separate picker; and its delete row is not uniformly red.

### Purpose

The Add / Edit Property Sheet reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-modal-sheet-property-editor` and `constructed-modal-sheet-property-editor-stacked` — `constructedModalSheetScenario("property-editor", …)`, mounted by `mountConstructedModalSheet` → `window.__mountConstructedModalSheet` (its own bundle entry, not `__mountConstructed`). Captures `screenshots/notion-clone/panels/constructed-modal-sheet-property-editor*-mobile-{light,dark}.png`
- `constructed-depth3-property-type-picker` and `constructed-depth3-property-type-picker-replaced` — `constructedDepth3Scenario`/`constructedDepth3ReplaceScenario`, mounted by `mountConstructedDepth3Stack` / `mountConstructedDepth3Replace`. These photograph the **three-level chain** the current design creates, which is the thing the reference says should not exist (D2a)
- All four are production mounts; no scenario work is owed

### Producers

- `src/views/modals/create-property-modal.ts`
- `src/views/record-surface/type-picker.ts`
- `src/views/record-surface/add-property-row.ts`
- `src/views/property-type-icon.ts`
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

As the operator, I open the Add / Edit Property Sheet on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- **Notion's delete-row styling is inconsistent across sheets.** `Delete property` renders plain dark in the one Edit-property capture, while `Delete view` and `Delete color setting` render red elsewhere. One capture cannot generalise: `007` may **not** assume every destructive row is red, and records which convention it picks and why
- The Edit-property capture is a **relation** property. No standard Text or Number Edit-property screen exists here, so which rows a simple property's editor carries is `unreadable at 299x678`
- Whether tapping the static name row reveals a bordered input is not observable

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

- `screenshots/notion/ios/flows/adding-a-new-property/` frame 03 (= `database/notion-ios-database-database-11-1589e7c8-*.webp`) — **the primary reference.** The New property sheet: a bordered name field, an `AI Autofill` section, then a `Type` section that is a **flat inline list** of type rows with **no chevrons**
- `screenshots/notion/ios/database/notion-ios-database-properties-01-8bb9115f-*.webp` — the Properties list you navigate from: type icon · name · chevron per row, then a card with `+ New property` and `? Learn about properties`
- `screenshots/notion/ios/database/notion-ios-database-properties-05-086606f1-*.webp` — the only Edit-property capture: a static name+type row with a trailing `ⓘ`, a `Wrap content` toggle row, a `Delete property` row, then a help card

### What the reference cannot answer

- **Notion's delete-row styling is inconsistent across sheets.** `Delete property` renders plain dark in the one Edit-property capture, while `Delete view` and `Delete color setting` render red elsewhere. One capture cannot generalise: `007` may **not** assume every destructive row is red, and records which convention it picks and why
- The Edit-property capture is a **relation** property. No standard Text or Number Edit-property screen exists here, so which rows a simple property's editor carries is `unreadable at 299x678`
- Whether tapping the static name row reveals a bordered input is not observable

### The table

Read this session. The Notion column is structural; every Target number is ours or `TBD`. The load-bearing finding is that Notion keeps type selection **in the same sheet**, which is what removes the three-level chain the depth3 scenarios photograph.

| Element | Ours today | Notion (structural) | Target |
|---|---|---|---|
| Sheet frame | To be measured at T002 | Grabber, centred bold title, back chevron top-left where pushed, **nothing top-right — no Done/Save**, changes apply live | Header matches `001`'s settled vocabulary; `TBD` on whether a Done control is kept |
| Name entry | To be measured at T002 | A **bordered / filled rounded field** with the type icon **inside** the field and placeholder `Property name` | 1 bordered field; its icon sits inside it, not in a leading column |
| Type choice | A navigation row opening a picker — which creates a **three-level sheet chain** | An **inline flat list** in the same sheet under a `Type` heading; each row is type icon · label · **no chevron**, one-tap terminal | Type list renders in the same sheet; **0** chevrons on type rows; sheet depth ≤ 2 |
| Section headings | To be measured at T002 | Plain small grey labels (`AI Autofill`, `Type`), the `Type` one carrying a small search glyph | Headings are grey labels above their card, not rows |
| Edit: name + type | To be measured at T002 | A static row: leading icon · name · trailing `ⓘ`, **no chevron** | Recorded from the reference; `TBD` on the tap behaviour |
| Edit: options | To be measured at T002 | `Wrap content` with a trailing **toggle**, in the same card as the delete row | Booleans are trailing toggles, matching `006` |
| Edit: delete | To be measured at T002 | `Delete property` as a labelled row **grouped with the config row**, rendered **plain, not red**, in this one capture | `007` picks a convention and records the reasoning; **no claim** that Notion is uniformly red or uniformly plain (D3) |
| Help row | To be measured at T002 | `? Learn about relations` in its own terminal card | Help rows in a terminal card, matching `001` |
| Both themes | — | — | Field, card, canvas and the chosen delete token each distinct in light and dark |

### The lane clauses these rows become

- **L1** choosing a property type does not open a third sheet level: the mounted chain depth is ≤ 2 — RED today at 3
- **L2** the type list renders in the same sheet as the name field, with 0 chevrons on its rows
- **L3** the name field is 1 bordered input carrying its type icon inside it
- **L4** boolean options render as trailing toggles
- **L5** the sheet honours the published keyboard inset with the name field focused — the `071/003` R6 defect, regression-checked

### Contradictions with landed `071` rulings

Raised as **Proposed ADRs** in `../../roadmap.md` §7 under D15 before this child implements. A `071` child is never amended from here.

- `071/003` and the depth-3 cap work landed a design in which the property-type picker is a **separate** sheet level. The reference shows the type list inline in the same sheet. Raised as a Proposed ADR in `roadmap.md` §7 before `007` implements, because collapsing the level changes what the depth-cap scenarios photograph

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
