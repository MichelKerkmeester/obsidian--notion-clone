---
title: "Implementation Plan: Phase 5: Group Sheet Visual Parity"
description: "The six-step loop for the Group Sheet: define, plan, create, screenshot, verify, remediate — with the mount path, the lane clauses and the judge named."
trigger_phrases:
  - "implementation plan"
  - "076 phase 5 plan"
  - "005 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 5: Group Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Reference images: see spec.md §Reference images — the planner reads every image before writing lane clauses.

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | The plugin's own sheet renderers plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/sheet-grammar.mjs`, the constructed capture pipeline, and an image judge |

### Overview

DEFINE found two bound producers where the scaffold named one (D2a): **Surface A**, `toolbar-renderer.ts`'s Group/Sub-group popover-as-sheet (the field picker — already close to the composed target), and **Surface B**, `board-groups-panel.ts`'s Manage groups sheet (per-group visibility, reorder, hide-empty — carrying the real gaps: no `Visible groups`/`Hidden groups` partition, no inter-row dividers, an 8px flat inset instead of the shared 16px, a 30px row floor instead of the family's 44px, and a checkbox where every sibling control of the same setting is a toggle). Surface A's registered capture (`scenarios/panels.mjs:333`, `id: "group"`) is a **hand-authored fixture that mirrors the renderer's own markup rather than mounting it** — it carries no `fixtureOf` pointing at a `constructed-*` counterpart, unlike every sibling fixture in that file, and is drift-blind because its template never reads the sources it lists (D2b, T003). The prior scaffold's cited contradiction, ADR-G (`roadmap.md` §7), is **resolved**, not escalated: `screenshots/notion/ios/flows/group-2/…-03/-04.webp` is the populated Notion grouped-result screen the earlier audit reported missing, filed under a flow name neither prior read checked.

### Reference mapping

Every Notion iOS capture in this repository is **299×678**, a Mobbin thumbnail. The Notion column of `spec.md` §13 is **structural only**; every number in its Target column is ours or `TBD — needs operator capture` (parent D3).

> Runs through the parent's loop graph: see `../plan.md` §6A "Running a child through the loop" for the node/edge tables, the verdict-file and state-record schemas, and what happens at GATE and ESCALATE (`../decision-record.md` D6).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready

- [x] DEFINE table complete; every reference path resolves
- [x] Every production surface enumerated (D2a) — two named, one carrying a fixture instead of a production mount (T003)
- [x] Every numeric target ours or `TBD` (D3)
- [x] Declared deviation recorded: Frame capped at 1 (ceiling ≤ 15/16) pending ADR-I, following `001`/`002`'s own precedent

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

- `src/views/toolbar-renderer.ts` — Surface A, the Group/Sub-group popover-as-sheet
- `src/views/board-groups-panel.ts` — Surface B, the board's Manage groups sheet
- `styles.css` — inset, divider, row-floor and toggle-control rules for Surface B; join it to the shared `.obnotion-mobile-bottom-sheet` selector lists it is currently missing from
- `tools/screenshots/constructed-scenarios.mjs` — adds Surface A's missing `constructed-*` mount (T003, D2b) — none of this child's other work may proceed on Surface A before this lands
- `tools/screenshots/scenarios/panels.mjs` — wires the existing `group` fixture's `fixtureOf` to the new constructed scenario, matching every sibling fixture's own convention
- `tools/live/sheet-grammar.mjs` — the clauses in §13
- `verification.md` — created at VERIFY

### The scenario and its mount function

Two scenarios, one per surface, each mounting the shipped renderer:

- **Surface B (registered today).** `constructedScenario("board-groups-panel", { boardGroupsPanel: true })` — `render-assertion-harness.ts:2889` clicks the real board's own column-options button then its `Manage groups` row, the same two taps a reader makes. Captures `screenshots/notion-clone/panels/constructed-board-groups-panel-mobile-{light,dark}.png`. The judged image is the full-sheet variant `constructed-board-groups-panel-sheet-mobile-{light,dark}.png` (same run, emitted beside the viewport shot): the sheet expanded past its 90svh cap to its own content height, so the cards a viewport crop keeps below the fold are scored.
- **Surface A (fixture only — T003).** `scenarios/panels.mjs:333` (`id: "group"`) is registered and current, but its `html()` is a hand-typed template that mirrors `ToolbarRenderer`'s group-popover markup rather than mounting it — no entry for it exists in `constructed-scenarios.mjs`. The mount path already exists in the lane harness: `render-assertion-harness.ts:3278` clicks `.obnotion-group-btn` when `scenario.toolbarPopover === "group"` (the `toolbarPopover` opt-in documented at `:286-291`), which is exactly `renderGroupPopover`'s own trigger — no new click-through logic needed. T003 adds `constructedScenario("group-popover", { renderer: "toolbar", toolbarPopover: "group", … })` mirroring `board-groups-panel`'s own registration shape, producing `constructed-group-popover-mobile-{light,dark}.png` plus its own full-sheet variant for the judge, and points the existing `group` fixture's `fixtureOf` at it — the same convention `panel-sort-calendar-empty` (two entries above it in the same file) already follows.

### Pattern

Producer plus stylesheet plus one new scenario registration. No new runtime pattern.

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
| A-B | DEFINE + PLAN | T001-T002 (transcription + lane setup; content already written into `spec.md` §13 / this file §3) | `spec.md` §13, this file §3, the lane clauses | Every row has a target; every reference resolves; every number ours or `TBD`; both surfaces enumerated; producer, stylesheet region, both scenarios **and their mount functions** all named |
| C | CREATE | T003-T010 | Commits | Each clause RED with its number, then the producer, then GREEN with its number, across both surfaces |
| D | SCREENSHOT | T011 | The capture set | `npm run screenshots` exit 0; both surfaces, light **and** dark, current and looked at |
| E | VERIFY | T012-T013 | `verification.md` | Lane green **and** judge ≥ 14/16 with no 0 on both surfaces; operator row left open |
| F | REMEDIATE | (§ Phase F) | `verification.md` iterations | Any row < 2 on either surface opens a RED→fix→GREEN→recapture→re-judge cycle; each surface needs **two** consecutive passes |
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
| ADR-I (shared close-glyph) resolving | External (operator) | Unresolved, same as `001`/`002` | Frame stays capped at 1; ceiling ≤ 15/16, not a blocker to passing at 14 |
| `076/002`'s ADR-L (arrow-pair reorder survives) | Internal precedent | Landed | Extended, not re-litigated, for Surface B's reorder control |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a `071` clause regresses and cannot be closed inside this child's files; or the judge fails a third consecutive iteration on the same rubric row, which means the target is wrong rather than the implementation.
- **Procedure**: revert this child's producer and stylesheet commits — the surface returns to its shipped shape, green on the existing lane — and release the css-lane triplet. The new clauses go red and are reverted in the same commit. A wrong target re-opens at DEFINE, not at CREATE.
<!-- /ANCHOR:rollback -->
