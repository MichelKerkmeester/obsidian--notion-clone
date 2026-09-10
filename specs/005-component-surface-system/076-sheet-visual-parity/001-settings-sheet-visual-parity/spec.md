---
title: "Feature Specification: Phase 1: Settings Sheet Visual Parity"
description: "The Settings sheet is one large white card wrapped around a form of bordered text inputs and helper paragraphs; Notion's equivalent is a table of contents built from several inset cards of navigation rows."
trigger_phrases:
  - "076 phase 1"
  - "settings sheet visual parity"
  - "001 define table"
  - "settings sheet image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 001: the six-step loop and the DEFINE table"
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
      - "src/views/view-config-panel-renderer.ts"
      - "styles.css"
      - "src/i18n.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "001-settings-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "No destructive row is visible in either View options capture; the content continues below the fold. Where Notion puts Delete view on this sheet is unreadable at 299x678 and 001 may not claim a position for it from the reference"
      - "Every value in the reference is structural. No pixel size, no hex and no font size may be taken from a 299x678 thumbnail (D3)"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T001 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 1: Settings Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

The Settings sheet is one large white card wrapped around a form of bordered text inputs and helper paragraphs; Notion's equivalent is a table of contents built from several inset cards of navigation rows.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: none — this is the first child, and the operator named its sheet. `../002-properties-sheet-visual-parity/` inherits this child's settled vocabulary.

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
| **Predecessor** | None |
| **Successor** | `../002-properties-sheet-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 1** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Settings Sheet and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The Settings sheet is one large white card wrapped around a form of bordered text inputs and helper paragraphs; Notion's equivalent is a table of contents built from several inset cards of navigation rows.

### Purpose

The Settings Sheet reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-view-config` — `constructedScenario("view-config", { renderer: "view-config", viewConfigVariant })` in `tools/screenshots/constructed-scenarios.mjs`, mounted by `mountConstructed` → `window.__mountConstructed` → `runRenderAssertions`, harness branch `scenario.renderer === "view-config"` at `tools/live/render-assertion-harness.ts:3412`. Captures `screenshots/notion-clone/panels/constructed-view-config-mobile-{light,dark}.png`
- Fixtures `panel-view-config`, `panel-view-config-sheet` and `panel-settings-side-sheet` all declare `fixtureOf: "constructed-view-config"`, so the constructed capture is already the authority and no scenario work is owed

### Producers

- `src/views/view-config-panel-renderer.ts` — builds every row of the sheet
- `styles.css` — the sheet's card, section and row tokens
- `src/i18n.ts` — the `settings.*.desc` helper strings the redesign removes or moves

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

As the operator, I open the Settings Sheet on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- No destructive row is visible in either View options capture; the content continues below the fold. **Where Notion puts Delete view on this sheet is `unreadable at 299x678`** and `001` may not claim a position for it from the reference
- Every value in the reference is structural. No pixel size, no hex and no font size may be taken from a 299x678 thumbnail (D3)

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

- `screenshots/notion/ios/flows/view-options/notion-ios-flow-view-options-02-794591f5-*.webp` — **the primary reference.** Notion's View options sheet, at rest
- `screenshots/notion/ios/flows/view-options/notion-ios-flow-view-options-03-e4dfff31-*.webp` — the same sheet with the View name field focused and the keyboard up
- `screenshots/notion/ios/database/notion-ios-database-database-14-d1de51a5-*.webp` — the Layout screen a `Layout ›` row opens: a selection grid plus one card of toggle/value rows
- `screenshots/notion/ios/database/notion-ios-database-database-15-cc8b241a-*.webp` — the Property visibility screen a `Properties ›` row opens (this is `002`'s reference too)
- `screenshots/notion/ios/database/notion-ios-database-database-01-2cb53019-*.webp` — the Data source actions sheet: two cards of one-tap action rows, no chevrons
- Anytype: `047` research plus `screenshots/anytype/**` — consulted for tie-breaks only, under D15

### What the reference cannot answer

- No destructive row is visible in either View options capture; the content continues below the fold. **Where Notion puts Delete view on this sheet is `unreadable at 299x678`** and `001` may not claim a position for it from the reference
- Every value in the reference is structural. No pixel size, no hex and no font size may be taken from a 299x678 thumbnail (D3)

### The table

The Notion column below is structural and was read this session from the captures named above. **Every number in the Target column is ours** — measured from our own tree with `node tools/live/sheet-grammar.mjs` and from `styles.css` read directly — or is marked `TBD — needs operator capture`. T001-T004 complete the Target column; the Ours and Notion columns are already read.

| Element | Ours today | Notion (structural) | Target |
|---|---|---|---|
| Sheet frame | One flat sheet, one full-bleed white card | Grey sheet canvas; content in **separate inset cards** with visible gaps; hairline dividers only *within* a card | ≥ 3 distinct cards, gap between cards ≥ 8px, radius ≥ 8px, canvas token distinct from card token in **both** themes |
| Header | Drag handle, centred title `Settings`, `✕` top-right | Drag handle, centred bold title, **`Done` top-right**, nothing top-left | Handle present; title centred within 1px; one trailing control; `TBD — needs operator capture` on whether it reads `Done` or `✕` |
| Section: name | `Name` label above a **bordered text input** | A bordered **View name** input, the sheet's only one, above the cards | Exactly **1** bordered text input in the whole sheet |
| Section: description | `Description` label above a bordered **textarea** with placeholder | **Not present.** Notion has no description field on this sheet | Removed from the sheet, or demoted to a row that opens its own editor |
| Navigation row | — (the concept does not exist today) | Leading icon · label · **grey value text** · chevron. `Layout` → `Table ›`, `Properties` → `2 shown ›`, `Filter` → `None ›`, `Sort` → `None ›`, `Group` → `None ›`, `Automations` → `None ›` | ≥ 5 rows carrying leading icon + trailing value + chevron; each opens a sheet, none edits in place |
| Database cover | `Database cover  Not set` with a trailing bare icon button | A navigation row with its state as trailing text | Row carries a leading icon and a chevron; **0** bare icon buttons |
| Source folder | Label, **bordered text input**, then a helper paragraph | Bordered inputs are for naming and searching only, never for choosing | Becomes a navigation row with the folder as trailing value; helper paragraph removed |
| Source rules | Label, a helper paragraph, an empty-state line, then **three bare icons** (`+`, folder-plus, `>_`) | Add affordances are **full-width labelled rows with a leading icon**, never a strip of bare glyphs | **0** bare icon buttons; each add affordance is a labelled row ≥ 44px tall |
| Helper text | Multi-line explanatory paragraphs under several fields | **No row carries an explanatory paragraph.** At most one grey subtitle line, observed once | **0** prose runs > 80 characters in the sheet body |
| One-tap actions | Mixed in with the form | Their own card at the end: `Lock database`, `Copy link to view`, `Duplicate view` — leading icon, **no chevron**, no trailing value | Action rows sit in a terminal card and carry no chevron |
| Destructive row | — | `unreadable at 299x678` — below the fold in both captures | `TBD — needs operator capture`; no position claimed from the reference |
| Both themes | — | — | Card, canvas, divider and secondary-text tokens each resolve to distinct values in light and dark; no elevation inversion (the defect `sheet-design-review.md` found on `071/007`) |

### The lane clauses these rows become

- **L1** the sheet renders ≥ 3 distinct cards with a gap ≥ 8px between them — RED today at 1 card
- **L2** the sheet contains exactly 1 bordered text input — RED today at 14 input/textarea constructions in the producer
- **L3** ≥ 5 rows carry a leading icon, a trailing value and a chevron — RED today at 0
- **L4** the sheet contains 0 bare icon buttons — RED today at ≥ 3 (the Source rules strip)
- **L5** no prose run in the sheet body exceeds 80 characters — RED today at the Source-rules and New-note-folder helper paragraphs
- **L6** card and canvas background tokens differ in both themes, and the card is not darker than its canvas in dark theme

### Contradictions with landed `071` rulings

Raised as **Proposed ADRs** in `../../roadmap.md` §7 under D15 before this child implements. A `071` child is never amended from here.

- `071/007-settings-sheet-strict-alignment` landed a card-grouping shell whose provisional fill token, per `sheet-design-review.md`, produced **no perceptible result in either theme**. `001` re-tunes that token to a measurable difference rather than reopening `007`. If the re-tune changes `007`'s landed metrics, it is raised as a Proposed ADR in `roadmap.md` §7, not applied to `007`

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
