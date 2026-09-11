---
title: "Implementation Plan: Phase 12: Board Card Fields Never Wrap Side by Side"
description: "The six-step loop for the board card's meta grid: define, plan, create, screenshot, verify, remediate — with the mount path, the corrected lane clauses and the judge named."
trigger_phrases:
  - "implementation plan"
  - "076 phase 12 plan"
  - "012 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 12: Board Card Fields Never Wrap Side by Side

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Reference images: see spec.md §Reference images — the planner reads every image before writing lane clauses.

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | The board's own card renderer plus the shared `card-field-renderer.ts` plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/render-assertions.mjs` (the existing board-geometry pass, extended), the constructed capture pipeline, and an image judge |

### Overview

The board card's meta grid lays two fields per row at ≥360px, truncating labels and clipping values; `render-assertions.mjs`'s own "meta grid" clause currently asserts and passes on that shape. This child makes the grid a single always-on column, corrects the lane clause in the same commit, and keeps `045`'s visible-label improvement and `056` ADR-008's value-alignment rule, both otherwise untouched.

### Reference mapping

The board's parity target is Anytype, not Notion (`056` ADR-001) — this child inherits that target rather than re-deriving one, since no Notion iOS capture in this repository shows a board card carrying a configured property (`spec.md` §13). `screenshots/anytype/mobile/app/anytype-mobile-set-kanban-{light,dark}.png` is read structurally: every property on its own full-width row, never two per row. Pixel figures come from our own `styles.css`, already in force for a single row, not from the capture.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready

- [ ] DEFINE table complete; every reference path resolves; the Anytype/Notion gap is recorded, not guessed past
- [ ] Every production surface enumerated (D2a): `constructed-board`, `constructed-board-subtask`, the `board-mobile` fixture, and Gallery/List's shared-renderer exposure checked and ruled out
- [ ] `045`'s mechanism guard (`board-card-properties-panel.test.ts`) confirmed unmodified by the plan

### Definition of Done

- [ ] The "meta grid" lane clause in `render-assertions.mjs` RED (old expectation) → corrected → GREEN (new expectation), in the same commit as the producer change, both numbers recorded
- [ ] L2-L4 (label overflow, row-pitch range, field-count parity) RED-then-GREEN, both numbers recorded
- [ ] `npm run screenshots` exit 0; `npm run screenshots:verify` 0 stale; board captures (phone + desktop, both themes) opened and looked at
- [ ] Judge ≥ 14/16, no row at 0, **twice consecutively on an unchanged tree**, against the Anytype reference
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] `board-card-properties-panel.test.ts` still green, unmodified
- [ ] The operator row present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Files to change

- `styles.css` — `.obnotion-kanban-card-meta`'s grid declaration and its 359.9px media query (`:10178-10188`, collapsed to a single always-on track); the label's ellipsis rule stays (`:10202-10209`), now scoped against the full card width; the value's line-clamp rule stays unchanged (`~10795-10805`, `056` ADR-008)
- `tools/live/render-assertions.mjs` — the "meta grid" assertion (~L1237-1249) inverted; three new clauses (label overflow, row-pitch range, field-count parity) added to the same board-geometry pass rather than a new one
- `verification.md` — created at VERIFY

### The scenario and its mount function

The capture that the judge scores comes from this scenario, mounting the shipped renderer:

- `constructed-board` — `constructedScenario("board", { renderer: "board" })` in `tools/screenshots/constructed-scenarios.mjs:763-770`, mounted by `mountConstructed` → `window.__mountConstructed` → `runRenderAssertions`, harness branch `scenario.renderer === "board"`. `sources` already lists `src/views/board-renderer.ts`, `tools/bench/board-render-bench.ts`, `src/views/card-field-renderer.ts` and `src/views/record-surface/property-row.ts` — unchanged by this child, since the producer edit stays inside files already named. Captures `screenshots/notion-clone/views/constructed-board-{mobile,desktop}-{light,dark}.png`
- The `board-mobile` fixture (`tools/screenshots/scenarios/core.mjs:464-476`) declares `fixtureOf: "constructed-board"`; no scenario work is owed
- The lane's own geometry page (`GEOMETRY_SCENARIO`, `render-assertions.mjs` ~L389) mounts the same `board`/`file-view` scenario at 1440×900 and again at 340px wide for the "meta grid" pass — this child's new clauses ride the same two evaluations rather than opening a third page

### Pattern

Stylesheet-only producer change plus a lane correction. No new runtime pattern; `card-field-renderer.ts`'s DOM shape is read to confirm before the CSS moves (§3's Out of Scope), not modified.

### Data flow

Unchanged. Only the meta grid's column count and the label's truncation threshold move.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — a presentational change to the board card's meta grid and its own lane clause. No security, path handling, env precedence, schema boundary, persistence, public response or shared policy is touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A | DEFINE | T001-T002 | `spec.md` §13 | Every row has a target; every reference resolves; the Notion gap recorded, not guessed past |
| B | PLAN | T003-T004 | this file §3 + the lane clauses | Producer, stylesheet region, scenario **and mount function**, and one clause per measurable row are all named |
| C | CREATE | T005-T007 | Commits | Each clause RED with its number, then the producer, then GREEN with its number — the lane's own "meta grid" clause corrected in the same commit it stops being satisfied by the old shape |
| D | SCREENSHOT | T008 | The capture set | `npm run screenshots` exit 0; phone + desktop, light **and** dark current and looked at |
| E | VERIFY | T009-T010 | `verification.md` | Lane green **and** judge ≥ 14/16 with no 0, against the Anytype reference; operator row left open |
| F | REMEDIATE | T011-T012 | `verification.md` iterations | Any row < 2 opens a RED→fix→GREEN→recapture→re-judge cycle; done needs **two** consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | The corrected "meta grid" clause plus L2-L4, and every existing `056`/`045` board clause re-run unchanged | `tools/live/render-assertions.mjs` |
| Unit | `board-card-properties-panel.test.ts` stays green, unmodified — the mechanism-freeze guard `056` ADR-003 wrote for this same surface | Vitest |
| Capture | Board view, phone + desktop, light + dark, through the production mount path | `npm run screenshots`, `npm run screenshots:verify` |
| **Image judge** | The eight-row rubric, our capture beside the Anytype mobile kanban reference | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone (D5, not agent-tickable) |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The css-lane triplet on `styles.css` | Internal | One holder at a time | This child acquires it in its own turn, after whichever of `001`-`011` currently holds or last released it |
| `045-board-card-properties`'s mechanism | Internal | Shipped, green | Must not regress — `board-card-properties-panel.test.ts` re-run unmodified is the guard |
| `056-board-anytype-parity`'s landed ADR-008 | Internal | Shipped | This child reinstates its column-count consequence; its value-alignment rule is otherwise untouched |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close (parent D1) |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the single-column grid regresses a `056`/`045` clause that cannot be closed inside this child's Files to Change; or the judge fails a third consecutive iteration on the same rubric row, which means the target itself is wrong rather than the implementation.
- **Procedure**: revert this child's `styles.css` and `render-assertions.mjs` commits — the grid returns to its shipped two-column shape, green on the pre-existing (uncorrected) lane clause — and release the css-lane triplet. The new clauses go red and are reverted in the same commit. A wrong target re-opens at DEFINE, not at CREATE.
<!-- /ANCHOR:rollback -->
