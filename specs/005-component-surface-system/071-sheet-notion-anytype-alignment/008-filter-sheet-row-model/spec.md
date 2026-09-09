---
title: "Feature Specification: Phase 8: Filter Sheet Row Model"
description: "The phone Filter sheet packs a condition's property, operator, value and three unlabelled icon buttons onto one 48px row, so the property name renders truncated to two characters; Notion stacks the same condition across three rows."
trigger_phrases:
  - "071 phase 8"
  - "filter sheet row model"
  - "filter property name truncated"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 8: Filter Sheet Row Model

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

The operator's 2026-09-09 ~22:30 ruling — *"Check more sheets align closer to notion, input,
content, wise etc"*, *"Ui improvement is focus here"* — sent `071` to audit every phone sheet at
the level of inputs and content. `../sheet-notion-audit.md` §3.9 names the Filter sheet the worst
surface in the app, and the evidence is our own capture rather than an opinion: in
`screenshots/notion-clone/panels/constructed-filter-panel-mobile-light.png` (804x1748, opened and
read) the three condition rows render their property as **`F…`**, **`gr…`** and **`is…`**, and a
value as **`Backl…`**. A user cannot tell which property a rule filters on.

The mechanism is layout, not truncation logic. `filter-panel-renderer.ts:555-604` builds one
`.obnotion-panel-row` per condition carrying a property dropdown, an operator dropdown, a value
control and three further icon buttons (`folder-plus`, `circle-slash-2`, `×`). Six controls share
one 48px row at a 402px frame; each dropdown gets roughly a quarter of the width. Notion's own
Advanced-filter sheet gives the same condition **three stacked rows inside one card** — property,
then operator indented, then value indented — with the rule's actions as **labelled rows** in a
second card (`screenshots/notion/ios/database/notion-ios-database-filters-03-*.webp`, `-04-*.webp`
and four frames of `flows/filtering-a-database/`).

Two further defects are ours and were measured, not read off an image. The lane prints each panel
sheet's first divider-owing row inset (`sheet-grammar.mjs:3998`) and **never asserts it**: filter's
rows sit **25.0px** from the sheet edge while sort's sit **16.0px**. And the three panel sheets
carry three different row spans on the same frame — filter **332px**, sort **357px**, group
**341px**.

**Key Decisions**: This phase does not touch row pitch, divider inset, section inset or the
native-select count — `005-filter-sort-group-sheets` converged those and the lane proves them, so
they are regression-checked here, not re-targeted. It does not remove the AND/OR conjunction
control: Notion has no inline equivalent, but removing a working control to match a screenshot is
a regression, and the question is held as a Proposed ADR (`../sheet-notion-audit.md` §6 ADR-B).
No numeric target is derived from a Notion asset — every Notion capture in this repository is
299x678 (§0 of the audit), so the Notion column here is structural and every number is ours.

**Critical Dependencies**: `005-filter-sort-group-sheets`'s landed row grammar (unchanged,
regression-checked); the audit's §3.9 gap table.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft — scaffolded, not implemented |
| **Created** | 2026-09-09 |
| **Branch** | `worktrees/272-sheet-notion-audit` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 8** of the Sheet family alignment to Notion x Anytype specification, opened by
`../sheet-notion-audit.md` §3.9 under the operator's 2026-09-09 ~22:30 ruling.

**Scope Boundary**: The Filter sheet's condition-row layout and its rule-action affordances
(`src/views/filter-panel-renderer.ts`, the `.obnotion-filter-panel` region of `styles.css`) — not
its filter semantics, not the nested-group data model, and not the row pitch or divider grammar
`005` converged.

**Dependencies**: `005-filter-sort-group-sheets`'s landed grammar; the audit's §3.9 and §0.

**Deliverables**: a stacked condition-row model, labelled rule actions, a 16px row inset shared
with the sibling panel sheets, and lane assertions for each — every one RED before GREEN.

**Changelog**: When this phase closes, add an entry to `../changelog/` named
`071-008-filter-sheet-row-model.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The Filter sheet passes every assertion it has and is unreadable. That is not a contradiction, it
is the audit's §1 Mechanism A: the sheet-grammar lane's eight "grammar columns" are boolean
presence checks (`surface`, `handle`, `header`, `rows`, `segmented`, `keyboard`, `safeArea`,
`dropdown`), and the row-grammar clause checks pitch, inset, hairline and native-select count. None
of them looks at how many controls share a row or whether a label fits inside its own box. So the
sheet scores 8/8, prints 3/3 rows inside the 44-52px band, mounts 0 native selects — and shows the
user `F…`.

### Purpose
A filter condition on a phone reads as three labelled rows whose property name is legible in full,
its rule actions are named rather than drawn as unlabelled glyphs, and the sheet's rows sit on the
same 16px inset and the same row span as the sort and group sheets beside it — with a lane clause
for each, so the next regression is caught by the gate rather than by the operator.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The condition row's layout: property, operator and value as three stacked rows within one rule block
- The rule's actions (remove, group, negate) as labelled rows rather than unlabelled icon buttons
- The empty-value affordance, today a bare `—` glyph
- The sheet's row inset (25.0px today) and row span (332px today), against the sibling sheets
- Lane assertions for each of the above, RED before GREEN

### Out of Scope
- Filter semantics, operator sets, and the nested-group data model — behaviour is unchanged
- Row pitch, divider inset, section inset, native-select count — `005` converged them; regression-checked here (REQ-006)
- The `AND (all)` / `OR (any)` conjunction control — Proposed only, `../sheet-notion-audit.md` §6 ADR-B
- The empty-state copy — owned by `010-sheet-copy-touch-idiom`, not duplicated here
- Card grouping / canvas backgrounds — owned by `007`, §6 ADR-A

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/views/filter-panel-renderer.ts` | Modify | Stack the condition's three controls; build the rule actions as labelled rows |
| `styles.css` | Modify | The stacked rule block's layout, the 16px row inset, the shared row span |
| `tools/live/sheet-grammar.mjs` | Modify | Assertions: controls-per-row, row inset, shared span (RED before GREEN) |
| `src/views/filter-panel-renderer.test.ts` | Modify | Revert-proof unit test for the stacked-row class contract |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read `../sheet-notion-audit.md` §0 (the 299x678 ceiling) and §3.9 before writing any assertion; no numeric target may be derived from a Notion asset |
| REQ-002 | A filter condition renders its property, operator and value on **three** rows, not one; no condition row carries more than **4** interactive controls |
| REQ-003 | The property control renders its property name without truncation at a 402px frame for a name of at least 12 characters — measured, not eyeballed |
| REQ-004 | The Filter sheet's divider-owing rows sit **16.0px** from the sheet edge, matching sort's measured 16.0px (today: 25.0px) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | The rule's remove / group / negate actions render as labelled rows; **0** unlabelled icon-only buttons remain on a condition row |
| REQ-006 | No regression on `005`'s row grammar: rows 44-52px, one 16px panel padding, 1px divider, 0 native selects, no sideways overflow at 402px |
| REQ-007 | Filter, sort and group share one row span within **±2px** (today: 332 / 357 / 341px) |
| REQ-008 | An empty condition value renders a labelled affordance rather than the bare `—` glyph (`filter-panel-renderer.ts:595`) |
| REQ-009 | Recapture the Filter sheet phone-only, light and dark, and record a measured before/after against §3.9 |

### P2 - Proposed, pending operator ruling

| ID | Requirement |
|----|-------------|
| REQ-010 | Whether the `AND (all)` / `OR (any)` conjunction control is retained — held Proposed, `../sheet-notion-audit.md` §6 ADR-B. **Default is retain.** No task removes it |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A 12-character property name renders in full on the Filter sheet at 402px, measured by the lane
- **SC-002**: No condition row carries more than 4 interactive controls, measured by the lane
- **SC-003**: No regression on `005`'s row-grammar and overflow assertions
- **SC-004**: The operator's own device read of the Filter sheet reports it legible and Notion-shaped (D3 — no agent ticks this row)
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Stacking three rows per condition makes the sheet taller; a 5-rule filter may exceed the 90svH cap | The sheet scrolls where it did not | The sheet already scrolls (`.obnotion-panel-row` inside a scroller); confirm the 90svH cap and the keyboard inset still hold — REQ-006's overflow clause covers the horizontal axis, T010 covers the vertical |
| Risk | The nested-group renderer (`createFilterTreeGroup`, `:415-445`) shares the row builder with the flat rule | A stacked flat rule could disturb the nested presentation | Change the leaf rule's layout only; the group header and its children keep their own structure. Assert the nested fixture separately (T009) |
| Risk | The 25.0px inset may come from the rule-tree's own left rule/indent rather than from padding | A padding-only fix would not move the measured number | T003 measures the producer of the 9px before changing anything, and records it; the fix targets whatever T003 names |
| Dependency | `005-filter-sort-group-sheets`'s landed grammar | Must not regress | REQ-006, verified by rerunning `005`'s own clauses unchanged |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

- The change is presentational. No filter evaluates differently, no stored rule shape changes, and
  every existing event handler keeps its target.
- Touch targets stay at or above 44px; the `×` glyph's expanded `::before` hit area
  (`styles.css:13820`) must survive or be replaced by a control that meets the floor on its own box.

## 8. EDGE CASES

- A condition on a checkbox column has a two-operator set and no free value; the value row is
  omitted rather than rendered empty, and REQ-002's "three rows" reads as "one row per control the
  condition actually has".
- A nested group with zero rules already renders `viewConfig.sourceRules.emptyGroup`; unchanged.
- A property name longer than the sheet's inner width still truncates — REQ-003's floor is 12
  characters, not "never truncates", because no width guarantees an arbitrary name.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Medium | One producer, one stylesheet region, one lane file, one unit test |
| Risk | Medium | Shared row builder between flat and nested rules |
| Research | Low | The audit's §3.9 completed the reference and current-state reading |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stacked rows regress `005`'s pitch band | Medium | Medium | REQ-006 regression check; RED-first task order |
| The nested-group presentation breaks | Medium | Medium | T009's separate nested fixture assertion |
| The row-span target fights the sort sheet's own width | Low | Low | REQ-007 is a shared target: whichever sheet moves, all three end equal |

## 11. USER STORIES

- As the operator, I want to read which property a filter rule tests without opening it, so the
  Filter sheet stops being the surface I cannot use on my phone.

## 12. OPEN QUESTIONS

- REQ-010 / ADR-B: is the AND/OR conjunction control retained? Default retain; operator may overrule.
- Can the operator supply a full-resolution Notion Advanced-filter capture (audit §5 C-1) so §3.9's
  numeric cells stop being `TBD`?
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Audit**: `../sheet-notion-audit.md` §3.9, §0, §6
- **Predecessor**: `../005-filter-sort-group-sheets/`

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE — Filter sheet, ours vs Notion

**Reference**: `screenshots/notion/ios/database/notion-ios-database-filters-03-*.webp`, `-04-*.webp`,
`-07-*.webp`, `-08-*.webp`, and `screenshots/notion/ios/flows/filtering-a-database/notion-ios-flow-filtering-a-database-02..06-*.webp`.
**All are 299x678** (`sips`-confirmed across the tree) — the Notion column below is **structural
only**, and every number in the Target column is ours, from `node tools/live/sheet-grammar.mjs` or
from `styles.css` read directly.

| Property | Current (ours, measured) | Notion (ref, observed structure) | Target |
|---|---|---|---|
| Controls per condition row | **6** (property, operator, value, folder-plus, circle-slash-2, ×) — `filter-panel-renderer.ts:555-604` | Property / operator / value on **3 stacked rows** in one card; actions in a **second card** as labelled rows | **≤4** interactive controls per row; condition spans 3 rows |
| Property name legibility | Truncated to **2 characters** (`F…`, `gr…`, `is…`) in `constructed-filter-panel-mobile-light.png` | Full property name plus its type icon on its own row | A **12-character** name renders untruncated at 402px |
| Rule actions | 3 **unlabelled** icon buttons on the row | **"Remove"** (red, trash), **"Duplicate"**, **"Turn into group"** — labelled rows | **0** icon-only buttons on a condition row |
| Empty value | Bare **`—`** glyph (`:595`) | Gray placeholder **"Value"** + an **"Edit"** link | A labelled affordance; 0 bare em-dash value cells |
| Row inset from sheet edge | **25.0px** (lane, printed at `sheet-grammar.mjs:3998`, **not asserted**) | Rows inset from the card edge; exact px **not measurable at 299x678** | **16.0px**, asserted — matching sort's measured 16.0px (internal-consistency target, not a Notion number) |
| Row span | **332px** (filter) vs **357px** (sort) vs **341px** (group) | Not measurable | One shared span, **±2px** |
| Conjunction control | `AND (all)` / `OR (any)` dropdown (`:328-330`) | **No inline AND/OR control in any capture**; nesting only | **No change** — Proposed, §6 ADR-B |
| Row pitch | 3/3 at **48px**, inside the 44-52 band | Not measurable | **No change** — regression-checked (REQ-006) |
| Panel padding | **16px / 16px** | Not measurable | **No change** |
| Native selects | **0** | Notion uses no native pickers either | **No change** — already converged |
| Add affordance | `+ Add condition`, `+ Add advanced filter` | **"Add filter rule"**, **"Add filter group"** (subtitle "A group to nest more filters") | Copy alignment only; low priority |
<!-- /ANCHOR:gap-table -->
