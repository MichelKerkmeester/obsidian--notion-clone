---
title: "Feature Specification: Phase 10: Sheet Copy: Touch Idiom"
description: "Four strings that instruct a pointer gesture reach a phone sheet renderer, and the dictionary spells its ellipsis two ways; this phase takes the sheet-reachable pointer-gesture count to zero."
trigger_phrases:
  - "071 phase 10"
  - "sheet copy touch idiom"
  - "double-click on a phone"
  - "ellipsis spelling i18n"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 10: Sheet Copy: Touch Idiom

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

`../sheet-notion-audit.md` §3.16 is the audit's cross-cutting content finding, and it is countable rather than aesthetic. **Four strings that name a pointer gesture reach a phone sheet renderer**, each producer grep-confirmed: `panel.emptyFilters` (*"Click \"Add condition\" below to start filtering."*) reaches `filter-panel-renderer.ts`; `panel.emptySorts` (*"Click \"Add sort\" below to add multi-sort rules."*) reaches `sort-panel-renderer.ts`; `panel.doubleClickEdit` (*"Double-click to edit"*) is applied to every property row's name at `column-manager-renderer.ts:383`; and `viewConfig.computedSync.manualHint` reaches `view-config-panel-renderer.ts`. A phone has no click, no double-click and no hover, so all four instruct a gesture the device cannot perform.\n\nTwo smaller inconsistencies travel with them. The EN dictionary spells its ellipsis **two ways — 13 ASCII `...` against 10 U+2026 `…`** — to the point that `panel.searchProperties` ("Search properties") and `viewConfig.sourceRules.searchProperties` ("Search properties...") ship in the same app. And one concept has two words: `panel.field` = **"Field"** labels the filter and sort sheets' own controls while `filter.field` = **"Property"** sits in the same dictionary, against Notion's uniform *property* and against our own `panel.addColumn` = "Add property".\n\nThis is the smallest and safest packet in the audit's set — it touches a dictionary and no layout — which is why it is ordered **first** for the implementation leg.

**Key Decisions**: Scope is strings reaching a **phone sheet renderer**, grep-confirmed. The seven further pointer-gesture strings belonging to cells and the desktop table are explicitly out of scope: a desktop gesture named in a desktop surface is correct copy, not a defect. All three locales move together. Every count is ours, from `src/i18n.ts` counted directly — no Notion asset supplies a number and none could, at 299x678.

**Critical Dependencies**: None on other packets. The audit's §3.16 and §0.

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

**Phase 10** of the Sheet family alignment to Notion x Anytype specification, opened by
`../sheet-notion-audit.md` under the operator's 2026-09-09 ~22:30 ruling — *"Check more sheets
align closer to notion, input, content, wise etc"*, *"Ui improvement is focus here"*.

**Scope Boundary**: `src/i18n.ts` and the four sheet renderers that consume the affected keys. Not the cell or desktop-table strings, not any layout, and not any control's behaviour.

**Dependencies**: None on other packets. The audit's §3.16 and §0.

**Deliverables**: a zero pointer-gesture count on sheet-reachable strings, one ellipsis spelling, one word for a property on the sheet surfaces, all three locales in step, and an assertion that holds each.

**Changelog**: When this phase closes, add an entry to `../changelog/` named
`071-010-sheet-copy-touch-idiom.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
A phone user opening an empty Filter sheet is told to *click* something *below*. A phone user resting on a property row is told to *double-click* to edit it. Neither gesture exists on the device, and no gate has ever looked: the sheet-grammar lane measures geometry and control types, and no clause reads a string. Notion's own iOS copy names no pointer gesture anywhere in the harvest — an absence that is structural and survives the 299x678 ceiling intact.

### Purpose
Every string a phone sheet shows describes something the phone can do, the dictionary spells its ellipsis one way, and a property is called by one word — each held by an assertion so the next such string is caught when it is written.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The four pointer-gesture strings that reach a phone sheet renderer
- The EN dictionary's ellipsis spelling, and the zh-CN and zh-TW entries for any key that changes
- The sheet-facing label for a property on the filter and sort sheets
- An assertion that holds the pointer-gesture count at zero for sheet-reachable strings

### Out of Scope
- The seven pointer-gesture strings belonging to cells and the desktop table — `cell.doubleClickRename`, `cell.clickToEdit`, `cell.doubleClickEditFormula`, `cell.doubleClickConfigureRollup`, `formula.errorHint`, `timeline.clickToSetDates`, `modal.groupOrderHint`. **Do not touch them**
- Any layout, control type or geometry change
- The `AND (all)` / `OR (any)` gloss — tied to audit §6 ADR-B, Proposed

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/i18n.ts` | Modify | The four sheet-reachable strings, the ellipsis spelling, the property label, across all three locales |
| `tools/live/sheet-grammar.mjs` | Modify | A clause holding the sheet-reachable pointer-gesture count at 0 (RED before GREEN) |
| `src/i18n.test.ts` | Modify | Unit clause for the ellipsis spelling and the locale-parity rule |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read `../sheet-notion-audit.md` §0 and §3.16 before any edit; every count in this packet is ours, from `src/i18n.ts` counted directly |
| REQ-002 | **0** strings reaching a phone sheet renderer name a pointer gesture (today: 4), held by an assertion rather than by inspection |
| REQ-003 | The **seven** cell and desktop-table pointer-gesture strings are unchanged |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | The EN dictionary uses **one** ellipsis spelling (today: 13 ASCII `...` and 10 U+2026 `…`) |
| REQ-005 | A property is called by one word on the filter and sort sheets (today: `panel.field` = "Field" beside `filter.field` = "Property") |
| REQ-006 | No key that loses a pointer gesture in EN retains one in zh-CN or zh-TW |
| REQ-007 | Recapture the two empty states that change, phone-only, light and dark |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The sheet-reachable pointer-gesture count is 0, held by an assertion that goes red when a fifth is added
- **SC-002**: The EN dictionary has one ellipsis spelling
- **SC-003**: The seven out-of-scope strings are byte-identical after the change
- **SC-004**: The operator's own device read reports the copy correct (D3 — no agent ticks this row)
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | A pointer-gesture assertion written as a naive substring sweep would catch the seven out-of-scope strings too | The clause fails for the wrong reason, or is loosened until it holds nothing | The clause is scoped to keys **reachable from a sheet renderer**, derived from the grep in T002 rather than from the whole dictionary. T002 produces that key list before T003 writes the clause |
| Risk | Changing the ellipsis character in a key used by a test fixture | An unrelated test breaks on a string compare | T005 runs the full vitest suite immediately after the sweep and fixes fixture expectations in the same change |
| Risk | zh-CN and zh-TW may express a gesture idiomatically rather than with a translated "click" | A locale keeps the instruction while EN loses it | T004 reads all three locales for each changed key rather than sweeping EN alone |
| Dependency | None on other packets | This packet can land first and independently | Ordered first for the implementation leg |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

- No control changes, no layout moves, no behaviour differs. This is a dictionary change plus the assertion that keeps it true.
- Every changed string keeps its meaning; the empty states still tell the user what to do, in terms the device supports.

## 8. EDGE CASES

- A string that names a gesture available on **both** platforms ("Drag to reorder", `panel.dragToSort`) is correct on a phone and is **not** in scope — dragging is a touch gesture.
- `viewConfig.computedSync.manualHint` names a button by its label as well as a gesture; only the gesture is removed, the button's name stays so the sentence still resolves.
- A key used by both a sheet and a desktop surface must satisfy the sheet; if that costs the desktop its precision, the key splits rather than being weakened.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Low | One dictionary, one lane clause, one unit test |
| Risk | Low | No layout or behaviour is touched; the only real risk is an over-broad assertion |
| Research | Low | The audit completed the reference and current-state reading |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| The assertion catches the seven out-of-scope strings | Medium | Medium | Scope the clause to the sheet-reachable key list T002 produces |
| A fixture breaks on an ellipsis compare | Medium | Low | T005 runs vitest immediately and fixes expectations in the same change |
| A locale keeps a gesture EN dropped | Low | Low | T004 reads all three locales per key |

## 11. USER STORIES

- As the operator, I want a sheet on my phone to tell me to tap something rather than to click it, so the app stops reading as a desktop app someone shrank.

## 12. OPEN QUESTIONS

- Does the sheet-facing property label read "Property" everywhere, aligning with Notion and with our own `panel.addColumn`, or is "Field" retained as a deliberate distinction the operator wants kept?
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Audit**: `../sheet-notion-audit.md` §3.16, §0
- **Predecessor**: `../005-filter-sort-group-sheets/`

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE

**Reference**: Notion supplies no counter-example to cite here, only an **absence**: no Notion iOS capture in the 1,315-file harvest names a pointer gesture. That absence is structural and survives the resolution ceiling intact. Every figure below is from `src/i18n.ts`, EN block (lines 23-1840), counted directly.
**All Notion iOS captures in this repository are 299x678** (`sips`-confirmed over a 400-file sample
of all 1,315 files, and over all 171 files in the five folders this family leans on). The Notion
column below is therefore **structural only**; every number in the Target column is **ours**, from
`node tools/live/sheet-grammar.mjs`, from `styles.css` read directly, or from `src/i18n.ts` counted
directly — or it is marked `TBD` and listed in the audit's §5.

| Property | Current (ours, measured) | Notion (ref, observed structure) | Target |
|---|---|---|---|
| Pointer-gesture strings reaching a phone sheet | **4** — `panel.emptyFilters`, `panel.emptySorts`, `panel.doubleClickEdit`, `viewConfig.computedSync.manualHint`, each producer grep-confirmed | **0** — no Notion iOS capture names click, double-click or hover | **0**, held by an assertion |
| `panel.emptyFilters` | *"Click \"Add condition\" below to start filtering."* | Notion's empty filter state is terse and names no gesture | Rewritten without a pointer gesture or a spatial "below" |
| `panel.emptySorts` | *"Click \"Add sort\" below to add multi-sort rules."* | as above | as above |
| `panel.doubleClickEdit` | *"Double-click to edit"*, applied to every property row name at `column-manager-renderer.ts:383` | Notion's property rows carry a chevron, not a gesture hint | Removed or replaced with a touch-true affordance |
| `viewConfig.computedSync.manualHint` | names *click* and a button label | not applicable | Gesture removed, button name kept so the sentence resolves |
| Cell and desktop-table gesture strings | **7** | not applicable | **Unchanged** — explicitly out of scope |
| Ellipsis spelling | **13** ASCII `...` and **10** U+2026 `…` in the EN block | not measurable, and not a Notion question | **One** spelling, 23/23 |
| Property label | `panel.field` = "Field" beside `filter.field` = "Property" | Notion says *property* uniformly | One word on the sheet surfaces |
| Locale parity | 3 locales | not applicable | No key loses a gesture in EN and keeps it in zh-CN or zh-TW |
<!-- /ANCHOR:gap-table -->
