---
title: "Implementation Plan: Phase 13: Board Card Properties Sheet Visual Parity"
description: "The six-step loop for the board's field-visibility sheet: define, plan, create, screenshot, verify, remediate."
trigger_phrases:
  - "implementation plan"
  - "076 phase 13 plan"
  - "013 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 13: Board Card Properties Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Reference images: see spec.md §Reference images — the planner reads every image before writing lane clauses.

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | `board-card-properties-panel.ts` plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/sheet-grammar.mjs`, the constructed capture pipeline, an image judge |

### Overview

The board's field-visibility sheet already has a story and captures but no `076` visual target. This child confirms whether its row shell is shared with `002`'s column manager, applies the frame ruling (no card container, dividers on plain background), and takes it through the loop.

### Reference mapping

Notion's properties-list captures are the base row grammar; ClickUp's Views sheet informs row anatomy per the operator's mix-and-match rule; Anytype's toggleable-list captures are structurally adjacent. No single source outranks the others here — this is a sheet, not a board surface.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] DEFINE table complete; row-shell sharing with `002` confirmed (T001); every reference path resolves
- [ ] Every production surface enumerated

### Definition of Done
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] `npm run screenshots` exit 0; captures current and looked at
- [ ] Judge ≥ 14/16, no row at 0, twice consecutively on an unchanged tree
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] `board-card-properties-panel.test.ts` still green, unmodified
- [ ] The operator row present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Files to change

- `src/views/board-card-properties-panel.ts` — frame/header/divider markup, pending T001's shell-sharing finding
- `styles.css` — card-container removal, divider rules
- `tools/live/sheet-grammar.mjs` — new clauses for this sheet's rows
- `verification.md` — created at VERIFY

### Pattern

Same shape as `002`/`007`: producer + stylesheet + lane clause. No new runtime pattern.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — presentational only. No security, path handling, or persistence boundary touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A | DEFINE | T001-T003 | `spec.md` §13 | Every row has a target and a Source; row-shell sharing confirmed |
| B | PLAN | T004-T005 | this file §3 + lane clauses | Producer, stylesheet region and one clause per row named |
| C | CREATE | T006-T008 | Commits | Each clause RED then GREEN, numbers recorded |
| D | SCREENSHOT | T009 | The capture set | `npm run screenshots` exit 0; both themes current and looked at |
| E | VERIFY | T010-T011 | `verification.md` | Lane green and judge ≥ 14/16 with no 0 |
| F | REMEDIATE | T012-T013 | `verification.md` iterations | Any row < 2 opens a fix cycle; done needs two consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | New sheet-grammar clauses for this sheet | `tools/live/sheet-grammar.mjs` |
| Unit | `board-card-properties-panel.test.ts` unmodified | Vitest |
| Capture | Phone, light + dark, production mount path | `npm run screenshots`, `npm run screenshots:verify` |
| Image judge | Eight-row rubric vs the DEFINE table's chosen references | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The css-lane triplet on `styles.css` | Internal | One holder at a time | This child acquires it in its own turn |
| `002`'s row shell, if shared | Internal | Landed in `002` | Coordinate rather than duplicate a fix |
| `045-board-card-properties`'s mechanism | Internal | Shipped, green | Must not regress |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the row-shell change regresses `002` or the board-groups panel; or the judge fails a third consecutive iteration on the same rubric row.
- **Procedure**: revert this child's producer/stylesheet/lane commits and release the css-lane triplet. A wrong target re-opens at DEFINE, not at CREATE.

<!-- /ANCHOR:rollback -->
