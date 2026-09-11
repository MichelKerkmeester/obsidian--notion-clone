---
title: "Feature Specification: Phase 3: Filter Sheet Visual Parity"
description: "The filter sheet stacks a condition onto three full-width bordered pills; Notion collapses a condition to one summary row and puts property, operator and value in one merged card on a drill-in screen. The active-rule popover still renders the old three-in-a-row and no 071 child ever named it."
trigger_phrases:
  - "076 phase 3"
  - "filter sheet visual parity"
  - "003 define table"
  - "filter sheet image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 003: the six-step loop and the DEFINE table"
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
      - "src/views/filter-panel-renderer.ts"
      - "src/views/active-rule-popover-renderer.ts"
      - "src/views/dropdown-field.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "003-filter-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "Notion's AND/OR conjunction control was never observed. Every capture here is a single-condition state, so where the conjunction lives and how it looks is unreadable at 299x678. 003 may not claim a Notion position for it, and 071/008's deci"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 3: Filter Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

The filter sheet stacks a condition onto three full-width bordered pills; Notion collapses a condition to one summary row and puts property, operator and value in one merged card on a drill-in screen. The active-rule popover still renders the old three-in-a-row and no 071 child ever named it.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: `../002-properties-sheet-visual-parity/` must have passed its judge twice before this child starts (D4). `../004-sort-sheet-visual-parity/` inherits this child's settled vocabulary.

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
| **Predecessor** | `../002-properties-sheet-visual-parity/spec.md` |
| **Successor** | `../004-sort-sheet-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 3** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Filter Sheet and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The filter sheet stacks a condition onto three full-width bordered pills; Notion collapses a condition to one summary row and puts property, operator and value in one merged card on a drill-in screen. The active-rule popover still renders the old three-in-a-row and no 071 child ever named it.

### Purpose

The Filter Sheet reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-filter-panel` and `constructed-filter-panel-nested` — `constructedScenario("filter-panel", { renderer: "filter-panel", filterDepth })`, harness branch `scenario.renderer === "filter-panel"` at `tools/live/render-assertion-harness.ts:3345`. Captures `screenshots/notion-clone/panels/constructed-filter-panel{,-nested}-mobile-{light,dark}.png`
- `constructed-active-rule-filter` — `constructedScenario("active-rule-filter", { renderer: "active-rule-popover", ruleKind: "filter" })`, harness branch `scenario.renderer === "active-rule-popover"` at `tools/live/render-assertion-harness.ts:3314`. Captures `screenshots/notion-clone/components/constructed-active-rule-filter-mobile-{light,dark}.png`. **This is the capture the operator cited.** `071/008` (`64af87ee`) touched the `constructed-filter-panel*` captures only, so this surface kept the old grammar
- Both are production mounts. Fixtures `panel-filter-conditions`, `panel-filter-nested-group` and `chrome-active-rule-popover-filter` all declare `fixtureOf` at these; no scenario work is owed

### Producers

- `src/views/filter-panel-renderer.ts` — the filter sheet
- `src/views/active-rule-popover-renderer.ts` — **the second surface**, still three-in-a-row
- `src/views/dropdown-field.ts` — the control the operator choice would stop using inline
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

As the operator, I open the Filter Sheet on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- **Notion's AND/OR conjunction control was never observed.** Every capture here is a single-condition state, so where the conjunction lives and how it looks is `unreadable at 299x678`. `003` may not claim a Notion position for it, and `071/008`'s decision to retain the conjunction control by default stays Proposed rather than being resolved here

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

> **Frame ruling (D7, operator, 2026-09-11):** no card containers anywhere in this sheet — rows group with hairline dividers on the plain sheet background; where the table below still names a card, D7 overrides it at CREATE time even though this scaffolded table is not rewritten here.

### References

- `screenshots/notion/ios/database/notion-ios-database-filters-01-1d5d6adc-*.webp` — the top-level Filter sheet, one-rule state
- `screenshots/notion/ios/database/notion-ios-database-sort-05-1c2f52ce-*.webp` — the same sheet, **no-filters** state (mislabelled into the sort family; it is a filter capture)
- `screenshots/notion/ios/database/notion-ios-database-filters-02-890dd17e-*.webp` — the condition collapsed to **one summary row**: `Title Is "Monday"  1 ›`
- `screenshots/notion/ios/database/notion-ios-database-filters-03-5843bb8a-*.webp`, `-04-1f10ae24-*.webp`, `-07-8b59d2b6-*.webp` — the detail editor: property, operator and value as **three rows in one merged grouped card**
- `screenshots/notion/ios/database/notion-ios-database-filters-08-d6d8022a-*.webp` — the `Comparator` sub-sheet: operator choice is a **drill-in list**, not an inline dropdown

### What the reference cannot answer

- **Notion's AND/OR conjunction control was never observed.** Every capture here is a single-condition state, so where the conjunction lives and how it looks is `unreadable at 299x678`. `003` may not claim a Notion position for it, and `071/008`'s decision to retain the conjunction control by default stays Proposed rather than being resolved here

### The table

Read this session. The Notion column is structural; every Target number is ours or `TBD`. Note that this table is a **second** redesign of a surface `071/008` already redesigned once: `008`'s stacked rows are the current state in the Ours column, not the old three-in-a-row.

| Element | Ours today | Notion (structural) | Target |
|---|---|---|---|
| Sheet frame | Grey canvas, drag handle, centred `Filter`, `✕` top-right | Grey canvas, iOS grabber, centred title, **back chevron top-left**, nothing top-right (sub-pickers get a blue `Done`) | Handle present; title centred within 1px; leading control is a back chevron where the sheet is pushed |
| Condition, at list level | Fully expanded: three bordered pills stacked | **One summary row** — `Title Is "Monday"  1 ›` — in its own card | A condition renders as 1 row at list level; the detail opens on tap |
| Condition, in detail | (does not exist) | Property, operator and value as **three rows in one merged card**: one shared rounded outline, hairline dividers between rows | 1 card containing 3 rows; **0** separately-bordered pills |
| Operator choice | Inline dropdown pill with a chevron | A drill-in `Comparator` sub-sheet, flat list, `Done` top-right | Operator opens a sheet; 0 inline dropdowns for it |
| Value | Bordered pill with a chevron | Placeholder `Value` + an `Edit` link when empty; the value text + `Edit` + a small circular `⊗` clear when filled | Value row carries a clear affordance when filled |
| Per-condition actions | Three labelled rows repeated per condition: `Add rule group`, `Negate rule`, `Remove rule` | One action card below the editor: `🗑 Remove` (red) · `⧉ Duplicate` · `⇄ Turn into group` | Actions sit in **one** card below the detail editor, not repeated inline per condition at list level |
| Add affordance | Header strip of 4 bare icons (`+`, group, negate, trash) | Own card: `+ Add filter rule`, `⊞ Add filter group` with a subtitle — full-width labelled rows | **0** bare icon buttons in the header; add affordances are labelled rows |
| Conjunction | `AND (all)` dropdown in the header row | `unreadable at 299x678` — never observed | `TBD — needs operator capture`; no Notion claim made (D3) |
| Destructive | `Remove rule` per condition | `🗑 Delete filter` in its **own** card at the very bottom, distinct from the per-rule `Remove` | Two distinct destructive scopes, visually separated |
| Active-rule popover | **One row of three dropdowns** (`Field 3` · `equals` · `Backlog`) | Same grammar as the sheet — the reference has no separate popover idiom | The popover renders the same condition grammar as the sheet; **0** rows carrying 3 side-by-side dropdowns |
| Both themes | — | — | Card, canvas, divider and the red destructive token each distinct in light and dark |

### The lane clauses these rows become

- **L1** the active-rule filter popover renders 0 rows carrying 3 side-by-side dropdown controls — RED today at 1
- **L2** a condition at list level renders as 1 row — RED today at 3 (the stacked pills) on the sheet
- **L3** the detail editor renders 3 rows inside 1 card with 1 shared outline — RED today at 3 separate outlines
- **L4** the sheet header carries 0 bare icon buttons — RED today at 4
- **L5** operator choice opens a sheet: 0 inline dropdown controls for the operator — RED today at 1 per condition
- **L6** per-condition action rows appear at most once per condition detail, not at list level — RED today at 3 per condition

### Contradictions with landed `071` rulings

Raised as **Proposed ADRs** in `../../roadmap.md` §7 under D15 before this child implements. A `071` child is never amended from here.

- `071/008` landed the stacked three-pill condition as its target and the reference read here shows Notion collapsing to one summary row with a merged detail card. `008` is not reopened: the difference is recorded as a Proposed ADR in `roadmap.md` §7 and `003` implements the reference
- `071/008` retained the AND/OR conjunction control by default as a **held-Proposed** contradiction (`071/spec.md`, audit §6). D3's gap keeps it Proposed: nothing observed here can resolve it

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
