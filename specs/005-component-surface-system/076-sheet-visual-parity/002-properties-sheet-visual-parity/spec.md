---
title: "Feature Specification: Phase 2: Properties Sheet Visual Parity"
description: "Every Properties row still renders as up-arrow, down-arrow, a filled blue checkbox, a type icon and a label; Notion's row is a drag handle, a type icon, a label and an eye."
trigger_phrases:
  - "076 phase 2"
  - "properties sheet visual parity"
  - "002 define table"
  - "properties sheet image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/002-properties-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 002: the six-step loop and the DEFINE table"
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
      - "src/views/column-manager-renderer.ts"
      - "src/views/record-surface/property-row.ts"
      - "src/views/checkbox.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "002-properties-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "The section headings read Shown in table / Hidden in table. The in table suffix suggests the string may be view-type-specific; no non-table-view capture exists here, so whether it varies is unreadable at 299x678"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 2: Properties Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

Every Properties row still renders as up-arrow, down-arrow, a filled blue checkbox, a type icon and a label; Notion's row is a drag handle, a type icon, a label and an eye.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: `../001-settings-sheet-visual-parity/` must have passed its judge twice before this child starts (D4). `../003-filter-sheet-visual-parity/` inherits this child's settled vocabulary.

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
| **Predecessor** | `../001-settings-sheet-visual-parity/spec.md` |
| **Successor** | `../003-filter-sheet-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 2** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Properties Sheet and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Every Properties row still renders as up-arrow, down-arrow, a filled blue checkbox, a type icon and a label; Notion's row is a drag handle, a type icon, a label and an eye.

### Purpose

The Properties Sheet reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-column-manager` — `constructedScenario("column-manager", { renderer: "column-manager" })`, mounted by `mountConstructed` → `window.__mountConstructed` → `runRenderAssertions`, harness branch `scenario.renderer === "column-manager"` at `tools/live/render-assertion-harness.ts:3480`. Captures `screenshots/notion-clone/panels/constructed-column-manager-mobile-{light,dark}.png`
- `src/views/record-surface/property-row.ts` is **shared with the record sheet** (`008`). A change here reaches `008`'s surface, so `002`'s lane must include `008`'s row clauses as a regression set (D2a)
- Fixture `panel-column-manager` declares `fixtureOf: "constructed-column-manager"`; no scenario work is owed

### Producers

- `src/views/column-manager-renderer.ts` — the sheet and its sections
- `src/views/record-surface/property-row.ts` — the shared row primitive that emits the arrows (`:405-411`) and the checkbox (`:417`)
- `src/views/checkbox.ts` — the control the row would stop using
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

As the operator, I open the Properties Sheet on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- The section headings read `Shown in table` / `Hidden in table`. The `in table` suffix suggests the string may be view-type-specific; **no non-table-view capture exists here**, so whether it varies is `unreadable at 299x678`

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

- `screenshots/notion/ios/flows/hiding-properties/` (frames 01-05) — **the primary reference.** Settings → Property visibility, the show/hide screen
- `screenshots/notion/ios/database/notion-ios-database-database-15-cc8b241a-*.webp` — the same screen: `Shown in table` / `Hidden in table` cards with inline bulk links
- `screenshots/notion/ios/database/notion-ios-database-properties-01-8bb9115f-*.webp` — the Properties list you navigate from
- `screenshots/notion/ios/database/notion-ios-database-property-editor-10-0568e792-*.webp` — the same list, second frame

### What the reference cannot answer

- The section headings read `Shown in table` / `Hidden in table`. The `in table` suffix suggests the string may be view-type-specific; **no non-table-view capture exists here**, so whether it varies is `unreadable at 299x678`

### The table

Read this session from the captures named above. The Notion column is structural; every Target number is ours or `TBD`. Notion's row has **four** elements and ours has five — but `071/009`'s target was a count (`≤4 interactive controls`) which our row already satisfies at 3. **This table targets identity and order, not count** (D1).

| Element | Ours today | Notion (structural) | Target |
|---|---|---|---|
| Row: leading edge | `↑` button then `↓` button | A single **six-dot drag grip** (2×3) | 1 reorder affordance at the leading edge, **0** arrow buttons; the survivor carries the keyboard path |
| Row: state control | A **filled blue checkbox**, ~28px | An **eye / eye-slash icon at the trailing edge**, tap to toggle. No checkbox. No toggle switch | State control sits at the **trailing** edge; 0 checkboxes in the row; box ≥ 44px |
| Row: type icon | Present, after the checkbox | Present, immediately before the label | Type icon immediately precedes the label, gap ≥ 4px (the `071/011` F-3 rhythm) |
| Row: label | Present, last | Present, between the type icon and the eye | Label reads the property name only, no storage key |
| Row order | arrow · arrow · checkbox · icon · label | **handle · type icon · label · eye** | Exactly that order, left to right |
| Primary property | A row like any other | The Title row's eye renders **greyed / disabled** — Title cannot be hidden | The required property's state control is visibly disabled, not merely inert |
| Sections | `SHOWN` / `HIDDEN` headings on a flat list | **Two separate rounded cards**, headed `Shown in table` and `Hidden in table`, with a visible gap between them | 2 cards, gap ≥ 8px, each with its own heading |
| Bulk action | `Hide all` / `Show all` at the right of the heading | Same position — inline blue link text on the section header row itself | Bulk link inline on the header, right-aligned, box ≥ 44px |
| Search | `Search properties` field at the top | `Search for a property…` filled rounded field, above both cards | Present, above the cards |
| Add affordances | `+ Add property` and `+ File property` as two adjacent rows | Own card below the list: `+ New property`, `? Learn about properties` | Add affordances in a terminal card, full-width labelled rows |
| Both themes | — | — | Card, canvas and eye-icon states each distinct in light and dark |

### The lane clauses these rows become

- **L1** each property row emits exactly 1 reorder affordance and 0 elements with icon `arrow-up`/`arrow-down` — RED today at 2 arrows
- **L2** each property row emits 0 checkboxes and carries its state control at the trailing edge — RED today at 1 checkbox at position 3
- **L3** the row's element order is handle, type icon, label, state — RED today
- **L4** the sheet renders 2 section cards with a gap ≥ 8px — RED today at 0 cards (flat list with headings)
- **L5** the required property's state control carries a disabled attribute or state class — RED today
- **L6** every row's state control box measures ≥ 44px

### Contradictions with landed `071` rulings

Raised as **Proposed ADRs** in `../../roadmap.md` §7 under D15 before this child implements. A `071` child is never amended from here.

- **Direct.** `071/009` landed the arrow pair and the checkbox as the Properties row, against a target that constrained the control **count** (`≤4`) and not their identity. The reference shows a grip and an eye. This is a contradiction with a landed ruling and is raised as a Proposed ADR in `roadmap.md` §7 before `002` implements
- `071/012` ADR-001 ruled the ↑↓ pair the survivor **on the sort sheet**, on the evidence that the grip carried no keyboard path. `002` may only introduce a grip that does carry one; otherwise it contradicts that ruling rather than being scoped away from it
- `roadmap.md` §7.18 ADR-D holds the Properties sheet's 34px row density against the 44px thumb floor. The eye control's ≥ 44px box interacts with it; `002` records which way it falls rather than silently re-deciding it

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
