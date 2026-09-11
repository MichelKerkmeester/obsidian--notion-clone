---
title: "Implementation Plan: Phase 16: View-Specific Toolbar Option Popovers Visual Parity"
description: "The six-step loop for the four view-toolbar option popovers and their stacked children: define, plan, create, screenshot, verify, remediate."
trigger_phrases:
  - "implementation plan"
  - "076 phase 16 plan"
  - "016 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 16: View-Specific Toolbar Option Popovers Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Reference images: see spec.md §Reference images — the planner reads every image before writing lane clauses.

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | Four view-toolbar renderers plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/sheet-grammar.mjs`, the constructed capture pipeline, an image judge |

### Overview

Four view-toolbar option popovers share a renderer shape but not a reference set — calendar has both Notion and Anytype references, the other three have none. This child confirms chrome sharing (T001), unifies the popover grammar, and judges the mini-calendar/calendar anchor surface, checking the other three for internal consistency.

### Reference mapping

Anytype's calendar day/month-select menus and Notion's database-calendar captures anchor the target; timeline and chart toolbars inherit the same target by internal consistency, recorded as internally-derived rather than externally sourced.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] DEFINE table complete; chrome-sharing across all four toolbars confirmed; no-reference surfaces recorded explicitly

### Definition of Done
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] `npm run screenshots` exit 0; captures current and looked at for all four toolbars
- [ ] Judge ≥ 14/16, no row at 0, twice consecutively on an unchanged tree, on the anchor surface
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] The operator row present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Files to change

- `src/views/calendar-toolbar-renderer.ts`, `calendar-timeline-toolbar-renderer.ts`, `chart-toolbar-renderer.ts`, `calendar-mini-calendar-renderer.ts`
- `styles.css` — shared popover chrome, card-container removal
- `tools/live/sheet-grammar.mjs` — new clauses
- `verification.md` — created at VERIFY

### Pattern

Producer + stylesheet + lane clause, applied once to a confirmed-shared chrome primitive across four call sites.
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
| A | DEFINE | T001-T004 | `spec.md` §13 | Chrome sharing confirmed; every row has a target and a Source, including explicit `none` rows |
| B | PLAN | T005-T006 | this file §3 + lane clauses | Renderer files, stylesheet region and one clause per row named |
| C | CREATE | T007-T009 | Commits | Each clause RED then GREEN, numbers recorded |
| D | SCREENSHOT | T010 | The capture set | All four toolbars, both themes, current and looked at |
| E | VERIFY | T011-T012 | `verification.md` | Lane green and judge ≥ 14/16 with no 0 on the anchor surface; other three checked for consistency |
| F | REMEDIATE | T013-T014 | `verification.md` iterations | Any row < 2 opens a fix cycle; done needs two consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | New sheet-grammar clauses across all four toolbars | `tools/live/sheet-grammar.mjs` |
| Capture | All four toolbars' options popovers, both themes | `npm run screenshots`, `npm run screenshots:verify` |
| Image judge | Eight-row rubric on the anchor surface; internal-consistency notes on the other three | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The css-lane triplet on `styles.css` | Internal | One holder at a time | This child acquires it in its own turn |
| `010`'s date-picker target, for cross-check with the mini-calendar popover | Internal | In progress | Confirm no divergence in shared calendar chrome |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the shared-chrome fix regresses one of the four toolbars, or the judge fails a third consecutive iteration on the same rubric row.
- **Procedure**: revert this child's renderer/stylesheet/lane commits and release the css-lane triplet. A wrong target re-opens at DEFINE.

<!-- /ANCHOR:rollback -->
