---
title: "Implementation Plan: Phase 18: Board Visual Parity (ClickUp)"
description: "The six-step loop for the board's column header, column body and card anatomy retargeted to ClickUp: define, plan, create, screenshot, verify, remediate."
trigger_phrases:
  - "implementation plan"
  - "076 phase 18 plan"
  - "018 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 18: Board Visual Parity (ClickUp)

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Reference images: see spec.md §Reference images — the planner reads every image before writing lane clauses.

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | `board-renderer.ts`, `card-field-renderer.ts` plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/render-assertions.mjs` (board-geometry pass, extended), the constructed capture pipeline, an image judge |

### Overview

The board's column header, column body and card anatomy retarget from Anytype (`056` ADR-001) to ClickUp, per the operator's 2026-09-11 board-specific ruling. `012`'s single-column field rule and `013`'s property-visibility mechanism both stay untouched.

### Reference mapping

ClickUp's iOS board reference (`clickup-board-column-headers-reference.png`) is the primary source for every board-specific row; the ClickUp harvest under `screenshots/clickup/ios/views/**` is checked for additional states. Anytype's kanban reference remains `012`'s own, not reused here.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] DEFINE table complete; every ClickUp-sourced row resolves to a real capture; `012`'s and `045`'s guards confirmed unaffected by the planned Files to Change
- [ ] Proposed ADR against `056` ADR-001 drafted in `../../roadmap.md` §7

### Definition of Done
- [ ] Every lane clause RED-then-GREEN, both numbers recorded
- [ ] `npm run screenshots` exit 0; board captures (phone + desktop, both themes) current and looked at
- [ ] Judge ≥ 14/16, no row at 0, twice consecutively on an unchanged tree, against the ClickUp reference
- [ ] `012`'s lane clauses and `board-card-properties-panel.test.ts` re-run unchanged and green
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] The operator row present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Files to change

- `src/views/board-renderer.ts` — column header markup/logic (pill, count, collapse, add), collapsed-column vertical pill, column body tint/outline
- `src/views/card-field-renderer.ts` — card title row and meta row anatomy (read first, per `012`'s own precedent, before any stylesheet change)
- `styles.css` — status-colour tint tokens, header pill styling, collapsed-pill rotation
- `tools/live/render-assertions.mjs` — new clauses extending the existing board-geometry pass
- `../../roadmap.md` — Proposed ADR entry against `056` ADR-001, §7
- `verification.md` — created at VERIFY

### The scenario and its mount function

Same as `012`: `constructed-board` — `constructedScenario("board", { renderer: "board" })` in `tools/screenshots/constructed-scenarios.mjs:763-770`, mounted by `mountConstructed` -> `window.__mountConstructed` -> `runRenderAssertions`, harness branch `scenario.renderer === "board"`.

### Pattern

Producer + stylesheet + lane clause, extending `012`'s already-established board-geometry pass rather than opening a new one. No new runtime pattern.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — presentational only. No security, path handling, persistence or shared-policy boundary touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A | DEFINE | T001-T004 | `spec.md` §13 + roadmap ADR | Every row has a ClickUp-sourced target; `012`/`045` guards confirmed safe; Proposed ADR drafted |
| B | PLAN | T005-T006 | this file §3 + lane clauses | Producer functions, stylesheet region and one clause per row named |
| C | CREATE | T007-T009 | Commits | Each clause RED then GREEN, numbers recorded; `012` clauses re-confirmed unchanged in the same run |
| D | SCREENSHOT | T010 | The capture set | Phone + desktop, light + dark, current and looked at |
| E | VERIFY | T011-T012 | `verification.md` | Lane green and judge ≥ 14/16 with no 0 against the ClickUp reference |
| F | REMEDIATE | T013-T014 | `verification.md` iterations | Any row < 2 opens a fix cycle; done needs two consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | New header/body/anatomy clauses, extending the board-geometry pass; every existing `012`/`056` clause re-run unchanged | `tools/live/render-assertions.mjs` |
| Unit | `board-card-properties-panel.test.ts` stays green, unmodified | Vitest |
| Capture | Board view, phone + desktop, light + dark | `npm run screenshots`, `npm run screenshots:verify` |
| Image judge | Eight-row rubric vs. the ClickUp reference | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The css-lane triplet on `styles.css` | Internal | One holder at a time | This child acquires it in its own turn, after `017` |
| `012`'s landed single-column rule | Internal | Shipped, green | Must not regress — its own lane clauses re-run unmodified |
| `045`'s mechanism | Internal | Shipped, green | `board-card-properties-panel.test.ts` re-run unmodified |
| `019`'s drag-feel child | Internal | Sibling, same file | Sequenced after this child on `board-renderer.ts`, not parallel |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the header/body/anatomy change regresses `012`'s or `056`'s clauses that cannot be closed inside this child's Files to Change; or the judge fails a third consecutive iteration on the same rubric row.
- **Procedure**: revert this child's `board-renderer.ts`/`card-field-renderer.ts`/`styles.css`/lane commits, release the css-lane triplet, and revert the roadmap ADR entry's status to withdrawn. A wrong target re-opens at DEFINE.

<!-- /ANCHOR:rollback -->
