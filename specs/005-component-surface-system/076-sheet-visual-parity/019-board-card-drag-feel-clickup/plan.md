---
title: "Implementation Plan: Phase 19: Board Card Drag Feel (ClickUp)"
description: "The six-step loop for the board's drag presentation layer: define, plan, create, screenshot, verify, remediate — judged on a mid-drag capture, a new evidence shape for this programme."
trigger_phrases:
  - "implementation plan"
  - "076 phase 19 plan"
  - "019 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 19: Board Card Drag Feel (ClickUp)

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Reference images: see spec.md §Reference images — the planner reads every image before writing lane clauses.

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | `board-renderer.ts`'s touch-drag handlers plus `styles.css` |
| **Storage** | None — presentational, layered on `069`'s existing persistence |
| **Testing** | Vitest, `tools/live/board-touch-drag.mjs` (extended with DOM-state checkpoints), the constructed capture pipeline (mid-drag), an image judge |

### Overview

`069`'s drag mechanism works but has no ClickUp-style presentation. This child adds ghost, placeholder, target-highlight and auto-scroll on top of it, verified by scripted DOM-state assertions and a mid-drag image judge — a new evidence shape since every prior `076` child judges a static frame.

### Reference mapping

ClickUp's card-drag reference (`clickup-board-card-drag-reference.png`) is the sole source; every row is sourced to it or to `069`'s own landed mechanism (unchanged).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] DEFINE table complete; `069`'s mechanism confirmed unaffected by the planned Files to Change; haptics availability confirmed or the requirement dropped with a recorded reason

### Definition of Done
- [ ] Every DOM-state lane clause RED-then-GREEN, both numbers recorded
- [ ] `npm run screenshots` exit 0; mid-drag captures (both themes) current and looked at
- [ ] Judge ≥ 14/16, no row at 0, twice consecutively on an unchanged tree, against the ClickUp reference
- [ ] `069`'s existing lane clauses re-run unchanged and green
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] The operator row present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Files to change

- `src/views/board-renderer.ts` — drag-start (ghost, placeholder), drag-move (highlight, auto-scroll), drag-end (drop animation); sequenced after `018`'s edits to the same file
- `tools/live/board-touch-drag.mjs` — new DOM-state checkpoint assertions during a scripted drag
- `styles.css` — ghost rotation/shadow, placeholder dim, target-outline tokens (both themes)
- `verification.md` — created at VERIFY

### Mid-drag capture mechanism

`board-touch-drag.mjs`'s scripted drag pauses at a named DOM-state checkpoint (ghost mounted, mid-move, over target column) before triggering the capture — never a wall-clock `sleep`, since that produces a flaky frame.

### Pattern

Producer + stylesheet + a new DOM-state-checkpoint lane pattern, extending the existing touch-drag script rather than replacing it.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — presentational, layered on an existing working mechanism. No security, persistence or shared-policy boundary touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A | DEFINE | T001-T003 | `spec.md` §13 | Every row sourced to ClickUp or `069`'s mechanism; haptics availability confirmed |
| B | PLAN | T004-T005 | this file §3 + lane clauses | Producer functions, stylesheet region, checkpoint mechanism and one clause per row named |
| C | CREATE | T006-T008 | Commits | Each clause RED then GREEN, numbers recorded; `069`'s clauses re-confirmed unchanged |
| D | SCREENSHOT | T009 | The mid-drag capture set | Both themes, current, looked at |
| E | VERIFY | T010-T011 | `verification.md` | Lane green and judge ≥ 14/16 with no 0 on the mid-drag capture |
| F | REMEDIATE | T012-T013 | `verification.md` iterations | Any row < 2 opens a fix cycle; done needs two consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live, DOM-state) | Ghost/placeholder/highlight/auto-scroll presence at named checkpoints during a scripted drag; `069`'s move+persist clauses re-run unchanged | `tools/live/board-touch-drag.mjs` |
| Capture | Mid-drag, both themes, at the checkpoint pause | `npm run screenshots`, `npm run screenshots:verify` |
| Image judge | Eight-row rubric on the mid-drag capture vs. the ClickUp reference | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-interaction read, including feel/timing a static capture cannot show | The operator's own iPhone |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `018`'s board chrome landing first (same file) | Internal | Sequenced predecessor | Reduces merge risk on `board-renderer.ts` |
| `069`'s working drag mechanism | Internal | Shipped, green | Must not regress — its own lane clauses re-run unmodified |
| The css-lane triplet on `styles.css` | Internal | One holder at a time | Acquired in its own turn, after `018` |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the presentation layer regresses `069`'s move/persist mechanism, or the judge fails a third consecutive iteration on the same rubric row.
- **Procedure**: revert this child's `board-renderer.ts`/`board-touch-drag.mjs`/`styles.css` commits and release the css-lane triplet. `069`'s mechanism is restored to its pre-existing bare presentation. A wrong target re-opens at DEFINE.

<!-- /ANCHOR:rollback -->
