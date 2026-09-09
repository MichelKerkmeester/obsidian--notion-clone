---
title: "Implementation Plan: Phase 7: settings-sheet-strict-alignment"
description: "[2-3 sentences: what this implements and the technical approach]"
trigger_phrases:
  - "implementation plan"
  - "technical approach"
  - "architecture decisions"
  - "testing strategy"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 7: settings-sheet-strict-alignment

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | Plugin's own panel/sheet renderers |
| **Storage** | None (styles + one producer wrapper + captures only) |
| **Testing** | Vitest + the live lane harness (`tools/live/sheet-grammar.mjs`) |

### Overview
`002-settings-sheet` converged the Settings sheet's row-internal grammar (pitch, dividers,
sheet-native pickers) but never compared the sheet's overall silhouette against Notion's own
per-database "Settings" bottom sheet, which groups its rows into separate rounded cards on a
neutral canvas. This phase wraps the existing row sequence in a card container (a producer change,
`view-config-panel-renderer.ts`), styles the card/canvas contrast in `styles.css`, and proves the
shape with a new sheet-grammar lane assertion — red-first, then green — while regression-checking
every row-internal assertion `002` already owns.

### Reference mapping (REQ-001 evidence)
Quoted from this phase's own `spec.md` §13 gap table: the Notion reference that shows this sheet is
`screenshots/notion/ios/flows/database-settings/notion-ios-flow-database-settings-0{2,3,4,5}-*.webp`
(Mobbin flow "Database settings") — a 299x678px thumbnail, viewed directly, carrying no
native-resolution numbers. It shows 2-3 rounded card groups on a gray canvas, a section label
above its own card, and no visible close button. `002`'s own gap table cited `notion/ios/settings`
and `notion/web/settings`, which this phase's inventory found to be the *account-level* Settings
pages, a different surface — the per-database sheet was never actually opened before this phase.

The redesign targets the card/grouping shell only; row-internal grammar (pitch, divider inset,
control types) stays as `002` shipped it and is regression-checked, not re-targeted (spec.md §13).
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
- [ ] Tests passing (if applicable)
- [ ] Docs updated (spec/plan/tasks)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Producer/renderer + stylesheet, same shape as every other sheet family in this repository — no
new architectural pattern introduced.

### Key Components
- **`view-config-panel-renderer.ts`**: gains a card-wrapper container around each section's rows
- **`styles.css`**: card background/radius/gap tokens, canvas background, section-label placement
- **`tools/live/sheet-grammar.mjs`**: the card-grouping and footer-card lane assertions

### Data Flow
No data-flow change — this phase is presentational (DOM grouping + CSS), not a behavior or
persistence change. The sheet's existing rows, values and event handlers are unchanged; only their
DOM container and background styling change.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — this phase is a UI redesign of one sheet, not a bug fix touching security, path
handling, env precedence, schema boundaries, persistence, public responses, or shared policy.
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
| Lane (live) | Card-grouping shell, row-grammar regression, no-overflow | `tools/live/sheet-grammar.mjs` |
| Unit | Card-wrapper class contract (revert-proof) | `src/views/view-config-sheet-row-grammar.test.ts`, Vitest |
| Manual/device | Whole-surface read | Operator's own iPhone (D3, not agent-tickable) |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `002-settings-sheet`'s landed row grammar | Internal | Green | Card wrapper must not disturb it; regression check is REQ-003 |
| Operator's full-resolution Notion capture (Task 1) | External | Not yet supplied | Numeric card-radius/gap/inset targets stay `TBD`; structural requirements (REQ-002) do not depend on it |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: The card wrapper regresses `002`'s row-grammar lane assertions (REQ-003) and the
  regression cannot be closed without widening scope past this phase's Files to Change.
- **Procedure**: Revert `view-config-panel-renderer.ts`'s wrapper and `styles.css`'s card rules;
  the sheet returns to `002`'s shipped flat-list shape, which stays green on its own lane.
<!-- /ANCHOR:rollback -->
