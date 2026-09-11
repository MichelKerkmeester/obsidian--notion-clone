---
title: "Implementation Plan: Phase 14: Fuzzy File-Suggest Sheets Visual Parity"
description: "The six-step loop for the shared FuzzySuggestModal chrome across five call sites: define, plan, create, screenshot, verify, remediate."
trigger_phrases:
  - "implementation plan"
  - "076 phase 14 plan"
  - "014 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 14: Fuzzy File-Suggest Sheets Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | `createSurfaceShell` plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/sheet-grammar.mjs`, the constructed capture pipeline, an image judge |

### Overview

Five FuzzySuggestModal call sites share one shell mechanism and no `076` target. This child confirms real sharing (T001), applies the frame ruling, and takes the representative surface through the loop.

### Reference mapping

Anytype's desktop search palette is the only reference on file, read structurally (row anatomy only, not frame — no phone-form-factor reference exists for this family).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] DEFINE table complete; shared-chrome confirmed across all five call sites; every reference path resolves or is recorded as a gap

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

- The shared `createSurfaceShell` chrome (exact file named by T001)
- `styles.css` — card-container removal, divider rules, search-field styling
- `tools/live/sheet-grammar.mjs` — new clauses
- `verification.md` — created at VERIFY

### Pattern

Producer + stylesheet + lane clause, applied once to shared chrome rather than five times.
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
| A | DEFINE | T001-T003 | `spec.md` §13 | Shared chrome confirmed; every row has a target and a Source |
| B | PLAN | T004-T005 | this file §3 + lane clauses | Shell file, stylesheet region and one clause per row named |
| C | CREATE | T006-T008 | Commits | Each clause RED then GREEN, numbers recorded |
| D | SCREENSHOT | T009 | The capture set | Both themes current and looked at, across all five call sites |
| E | VERIFY | T010-T011 | `verification.md` | Lane green and judge ≥ 14/16 with no 0 |
| F | REMEDIATE | T012-T013 | `verification.md` iterations | Any row < 2 opens a fix cycle; done needs two consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | New sheet-grammar clauses, checked against all five call sites | `tools/live/sheet-grammar.mjs` |
| Capture | Phone, light + dark, all five call sites | `npm run screenshots`, `npm run screenshots:verify` |
| Image judge | Eight-row rubric on the representative capture | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The css-lane triplet on `styles.css` | Internal | One holder at a time | This child acquires it in its own turn |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the shared-chrome fix regresses one of the five call sites, or the judge fails a third consecutive iteration on the same rubric row.
- **Procedure**: revert this child's shell/stylesheet/lane commits and release the css-lane triplet. A wrong target re-opens at DEFINE.

<!-- /ANCHOR:rollback -->
