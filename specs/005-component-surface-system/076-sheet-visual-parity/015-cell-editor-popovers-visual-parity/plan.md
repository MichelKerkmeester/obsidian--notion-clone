---
title: "Implementation Plan: Phase 15: Inline Cell-Editor Popovers Visual Parity"
description: "The six-step loop for the two inline cell-editor popovers: define, plan, create, screenshot, verify, remediate."
trigger_phrases:
  - "implementation plan"
  - "076 phase 15 plan"
  - "015 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 15: Inline Cell-Editor Popovers Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Reference images: see spec.md §Reference images — the planner reads every image before writing lane clauses.

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | `cell-renderer.ts` plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/sheet-grammar.mjs`, the constructed capture pipeline, an image judge |

### Overview

`cell-editor-text` and `cell-editor-select` share `cell-renderer.ts:601`'s mount point and have never been read against a reference. This child records the form-factor mismatch against Anytype's full mobile cell sheets, applies the frame ruling at the popover's own scale, and takes it through the loop.

### Reference mapping

Anytype's mobile cell sheets are the only reference on file, read structurally (control kind only) — the form factor mismatch (full sheet vs. inline popover) is recorded rather than resolved by 1:1 copying.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] DEFINE table complete; form-factor mismatch recorded; every reference path resolves or is recorded as a gap

### Definition of Done
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] `npm run screenshots` exit 0; captures current and looked at
- [ ] Judge ≥ 14/16, no row at 0, twice consecutively on an unchanged tree
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] The operator row present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Files to change

- `src/views/cell-renderer.ts` — both editor kinds' popover chrome
- `styles.css` — card-container removal, control layout
- `tools/live/sheet-grammar.mjs` — new clauses
- `verification.md` — created at VERIFY

### Pattern

Producer + stylesheet + lane clause, applied to one shared mount point for both editor kinds.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — presentational only.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A | DEFINE | T001-T003 | `spec.md` §13 | Form-factor mismatch recorded; every row has a target and a Source |
| B | PLAN | T004-T005 | this file §3 + lane clauses | Producer, stylesheet region and one clause per row named |
| C | CREATE | T006-T008 | Commits | Each clause RED then GREEN, numbers recorded |
| D | SCREENSHOT | T009 | The capture set | Both editor kinds, both themes, current and looked at |
| E | VERIFY | T010-T011 | `verification.md` | Lane green and judge ≥ 14/16 with no 0 |
| F | REMEDIATE | T012-T013 | `verification.md` iterations | Any row < 2 opens a fix cycle; done needs two consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | New sheet-grammar clauses for both editor kinds | `tools/live/sheet-grammar.mjs` |
| Capture | Table view with each editor open, both themes | `npm run screenshots`, `npm run screenshots:verify` |
| Image judge | Eight-row rubric vs Anytype's cell-sheet reference (structural) | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The css-lane triplet on `styles.css` | Internal | One holder at a time | This child acquires it in its own turn |
| `008`'s property-row target, for cross-check | Internal | In progress | Confirm no divergence for shared property types |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the popover fix regresses cell editing behaviour, or the judge fails a third consecutive iteration on the same rubric row.
- **Procedure**: revert this child's producer/stylesheet/lane commits and release the css-lane triplet. A wrong target re-opens at DEFINE.

<!-- /ANCHOR:rollback -->
