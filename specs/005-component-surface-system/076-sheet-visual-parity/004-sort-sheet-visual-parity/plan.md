---
title: "Implementation Plan: Phase 4: Sort Sheet Visual Parity"
description: "The six-step loop for the Sort Sheet: define, plan, create, screenshot, verify, remediate — with the mount path, the lane clauses and the judge named."
trigger_phrases:
  - "implementation plan"
  - "076 phase 4 plan"
  - "004 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 4: Sort Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | The plugin's own sheet renderers plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/sheet-grammar.mjs`, the constructed capture pipeline, and an image judge |

### Overview

The sort sheet's rule is two rows and a labelled delete after 071/012; Notion merges the two rows into one card, picks direction through a drill-in sub-sheet, and separates per-rule delete from whole-config delete. The active-rule sort popover kept the old grammar.

### Reference mapping

Every Notion iOS capture in this repository is **299×678**, a Mobbin thumbnail. The Notion column of `spec.md` §13 is **structural only**; every number in its Target column is ours or `TBD — needs operator capture` (parent D3).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready

- [ ] DEFINE table complete; every reference path resolves
- [ ] Every production surface enumerated (D2a)
- [ ] Every numeric target ours or `TBD` (D3)

### Definition of Done

- [ ] Every lane clause RED-then-GREEN with both numbers recorded
- [ ] `npm run screenshots` exit 0; `npm run screenshots:verify` 0 stale; both themes opened and looked at
- [ ] Judge ≥ 14/16, no row at 0, **twice consecutively on an unchanged tree**
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] The operator row present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Files to change

- `src/views/sort-panel-renderer.ts` — the sort sheet
- `src/views/active-rule-popover-renderer.ts` — **the second surface**
- `styles.css`
- `tools/live/sheet-grammar.mjs` — the clauses in §13
- `verification.md` — created at VERIFY

### The scenario and its mount function

The capture that the judge scores comes from these scenarios, each mounting the shipped renderer:

- `constructed-sort-panel` and `constructed-sort-panel-calendar` — `constructedScenario("sort-panel", { renderer: "sort-panel" })`, harness branch `scenario.renderer === "sort-panel"` at `tools/live/render-assertion-harness.ts:3388`. Captures `screenshots/notion-clone/panels/constructed-sort-panel*-mobile-{light,dark}.png`
- `constructed-active-rule-sort` — `constructedScenario("active-rule-sort", { renderer: "active-rule-popover", ruleKind: "sort" })`, harness branch at `tools/live/render-assertion-harness.ts:3314`. Captures `screenshots/notion-clone/components/constructed-active-rule-sort-mobile-{light,dark}.png`. The same second-surface gap as `003` (D2a)
- Fixtures `panel-sort-rules`, `panel-sort-calendar-empty` and `chrome-active-rule-popover-sort` declare `fixtureOf` at these; no scenario work is owed

### Pattern

Producer plus stylesheet. No new runtime pattern.

### Data flow

Unchanged. Only arrangement, grouping, labelling and control kind move.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — a presentational change to the surfaces named above. No security, path handling, env precedence, schema boundary, persistence, public response or shared policy is touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A | DEFINE | T001-T004 | `spec.md` §13 | Every row has a target; every reference resolves; every number ours or `TBD` |
| B | PLAN | T005-T008 | this file §3 + the lane clauses | Producer, stylesheet region, scenario **and mount function**, and one clause per measurable row are all named |
| C | CREATE | T009-T013 | Commits | Each clause RED with its number, then the producer, then GREEN with its number |
| D | SCREENSHOT | T020-T021 | The capture set | `npm run screenshots` exit 0; light **and** dark current and looked at |
| E | VERIFY | T022-T024 | `verification.md` | Lane green **and** judge ≥ 14/16 with no 0; operator row left open |
| F | REMEDIATE | T025-T026 | `verification.md` iterations | Any row < 2 opens a RED→fix→GREEN→recapture→re-judge cycle; done needs **two** consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | Every measurable row of §13, plus the `071` regression set | `tools/live/sheet-grammar.mjs` |
| Unit | A revert-proof contract per new class or string rule | Vitest |
| Capture | Phone light + dark through the production mount path | `npm run screenshots`, `npm run screenshots:verify` |
| Real-app (WebKit) | Where the rebuild harness covers this sheet, on an emulated iPhone | `node tools/live/sheet-rebuild.mjs` |
| **Image judge** | The eight-row rubric, our capture beside the reference | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone (D5, not agent-tickable) |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The previous child's judge passing twice | Internal | Sequential (D4) | This child does not start |
| The css-lane triplet on `styles.css` | Internal | One holder at a time | Edits serialise or conflict |
| The operator's C-1..C-6 / settings capture | External | **Not supplied** | Structural targets unaffected; `TBD` cells wait |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close (D1) |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a `071` clause regresses and cannot be closed inside this child's files; or the judge fails a third consecutive iteration on the same rubric row, which means the target is wrong rather than the implementation.
- **Procedure**: revert this child's producer and stylesheet commits — the surface returns to its shipped shape, green on the existing lane — and release the css-lane triplet. The new clauses go red and are reverted in the same commit. A wrong target re-opens at DEFINE, not at CREATE.
<!-- /ANCHOR:rollback -->
