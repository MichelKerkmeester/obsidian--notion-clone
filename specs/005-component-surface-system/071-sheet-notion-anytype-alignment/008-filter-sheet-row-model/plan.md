---
title: "Implementation Plan: Phase 8: filter-sheet-row-model"
description: "Stack the filter condition's three controls onto three rows, label its rule actions, and put the sheet on the family's shared 16px inset and row span — each proved by a new lane clause, RED before GREEN."
trigger_phrases:
  - "implementation plan"
  - "technical approach"
  - "architecture decisions"
  - "testing strategy"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 8: filter-sheet-row-model

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | Plugin's own panel/sheet renderers |
| **Storage** | None (producer layout + styles + captures only) |
| **Testing** | Vitest + the live lane harness (`tools/live/sheet-grammar.mjs`) |

### Overview
`005-filter-sort-group-sheets` put the Filter sheet's rows on the Notion row grammar — pitch,
inset, hairline, no native selects — and the lane proves all of it. It never asked how many
controls share a row. `filter-panel-renderer.ts:555-604` puts six on one, and at 402px the
property dropdown gets about a quarter of the width, so the property name renders as two
characters plus an ellipsis. This phase stacks the condition's property, operator and value onto
three rows inside one rule block, moves the rule's three icon buttons out to labelled rows, and
brings the sheet onto the 16px row inset and the shared row span its two sibling sheets already
use — adding a lane clause for each, because none of these properties has ever been asserted.

### Reference mapping (REQ-001 evidence)
From `../sheet-notion-audit.md` §3.9 and §0. Notion's Advanced-filter sheet
(`screenshots/notion/ios/database/notion-ios-database-filters-03-*.webp`, `-04-*.webp`, and four
frames of `flows/filtering-a-database/`) stacks a rule across three rows in one card and carries
its actions as labelled rows — "Remove" (red), "Duplicate", "Turn into group" — in a second card.
**Every Notion iOS asset in this repository is 299x678**, so that reading is structural and no
number in this plan comes from it. The two numeric targets (16.0px inset, ±2px shared span) are
ours: the sort sheet already measures 16.0px, and the three sheets' spans are 332 / 357 / 341px
today, printed by the lane.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented
- [x] Success criteria measurable
- [x] Dependencies identified

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Docs updated (spec/plan/tasks)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Producer/renderer + stylesheet, the same shape every other sheet family here uses. No new pattern.

### Key Components
- **`filter-panel-renderer.ts`**: the leaf condition builder (`:555-604`) gains a stacked block; the rule-action buttons become labelled rows
- **`styles.css`**: the stacked block's layout, the row inset, the shared span
- **`tools/live/sheet-grammar.mjs`**: three new clauses — controls-per-row, row inset, shared span

### Data Flow
Unchanged. No filter evaluates differently and no stored rule shape moves; only the DOM
arrangement of the controls that read and write those rules changes.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — a UI layout change on one sheet. No security, path handling, env precedence,
schema boundary, persistence, public response or shared policy is touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase
checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | Controls-per-row, name legibility, row inset, shared span, `005` regression | `tools/live/sheet-grammar.mjs` |
| Unit | Stacked-row class contract (revert-proof) | `src/views/filter-panel-renderer.test.ts`, Vitest |
| Manual/device | Whole-surface read | Operator's own iPhone (D3, not agent-tickable) |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `005-filter-sort-group-sheets`'s landed row grammar | Internal | Green | Must not regress; REQ-006 |
| Operator's full-resolution Notion Advanced-filter capture (audit §5 C-1) | External | Not supplied | Structural requirements are unaffected; only §13's `TBD` numeric cells wait on it |
| `007`'s card-grouping decision (audit §6 ADR-A) | Internal | **LANDED 2026-09-09** (`a56020f7`+`48dbd5d9`; 2/2 cards, radius ≥8px, distinct backgrounds, gap ≥8px, its four card metrics provisional until its own T001 operator capture) | Not blocking: no packet here adds a card or canvas treatment. Once `007`'s metrics are retuned, ADR-A decides whether the treatment propagates to these families |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: The stacked rule block regresses `005`'s row-grammar or overflow clauses (REQ-006) and the regression cannot be closed inside this phase's Files to Change.
- **Procedure**: Revert `filter-panel-renderer.ts`'s stacked block and the `styles.css` rules that scope it; the sheet returns to `005`'s shipped one-row condition, which stays green on its own lane. The new lane clauses go red and are reverted with it, in the same commit.
<!-- /ANCHOR:rollback -->
