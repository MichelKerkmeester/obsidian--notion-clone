---
title: "Implementation Plan: Phase 17: Utility DbModal Sheets Visual Parity"
description: "The six-step loop for the 18 zero-reference DbModal utility sheets plus toast and bulk-edit field menu: define, plan, create, screenshot, verify, remediate."
trigger_phrases:
  - "implementation plan"
  - "076 phase 17 plan"
  - "017 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 17: Utility DbModal Sheets Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | `DbModal`'s base class plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/sheet-grammar.mjs`, the constructed capture pipeline, an image judge |

### Overview

Eighteen DbModal-derived surfaces plus toast and bulk-edit field menu carry zero reference of any kind. This child confirms real chrome sharing across all 18 (T001), applies the frame ruling to DbModal's base chrome once, and judges a representative sample.

### Reference mapping

No external reference exists for this child. The target is composed from the sheet-chrome grammar already landed by `001`-`016` and the 076 frame ruling directly, recorded as internally-derived throughout.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] DEFINE table complete for all 18 surfaces; shared-chrome confirmation recorded; `ChartDrilldownModal`'s live/archived status resolved

### Definition of Done
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] `npm run screenshots` exit 0; representative-sample captures current and looked at
- [ ] Judge ≥ 14/16, no row at 0, twice consecutively on an unchanged tree
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] The operator row present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Files to change

- `DbModal`'s base chrome file (T001 names it exactly)
- `src/views/toast.ts`, `src/views/bulk-edit-field-menu.ts`
- `styles.css` — shared modal chrome, divider rules
- `tools/live/sheet-grammar.mjs` — new clauses
- `verification.md` — created at VERIFY

### Pattern

One base-class chrome fix reaching all 18 subclasses, plus two small standalone fixes (toast, bulk-edit menu). No new runtime pattern.
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
| A | DEFINE | T001-T004 | `spec.md` §13 | All 18 surfaces enumerated; shared-chrome and archived-status confirmed |
| B | PLAN | T005-T006 | this file §3 + lane clauses | Base chrome file, stylesheet region and one clause per row named |
| C | CREATE | T007-T009 | Commits | Each clause RED then GREEN, numbers recorded |
| D | SCREENSHOT | T010 | The capture set | Representative sample, both themes, current and looked at |
| E | VERIFY | T011-T012 | `verification.md` | Lane green and judge ≥ 14/16 with no 0 on the representative sample |
| F | REMEDIATE | T013-T014 | `verification.md` iterations | Any row < 2 opens a fix cycle; done needs two consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | New sheet-grammar clauses on the shared base chrome | `tools/live/sheet-grammar.mjs` |
| Capture | Import confirm, formula modal, status options (representative sample), both themes | `npm run screenshots`, `npm run screenshots:verify` |
| Image judge | Eight-row rubric on the representative sample, judged for internal consistency (no external reference) | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The css-lane triplet on `styles.css` | Internal | One holder at a time | This child acquires it in its own turn |
| The sheet-chrome grammar landed by `001`-`016` | Internal | Partially landed | This child's internal reference; a divergence there is a divergence here too |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the base-chrome fix regresses one or more of the 18 subclasses, or the judge fails a third consecutive iteration on the same rubric row.
- **Procedure**: revert this child's base-chrome/stylesheet/lane commits and release the css-lane triplet. A wrong target re-opens at DEFINE.

<!-- /ANCHOR:rollback -->
