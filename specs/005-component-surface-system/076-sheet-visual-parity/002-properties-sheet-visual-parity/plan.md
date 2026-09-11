---
title: "Implementation Plan: Phase 2: Properties Sheet Visual Parity"
description: "The six-step loop for the Properties Sheet: define, plan, create, screenshot, verify, remediate — with the mount path, the six lane clauses and the judge named."
trigger_phrases:
  - "implementation plan"
  - "076 phase 2 plan"
  - "002 six step loop"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 2: Properties Sheet Visual Parity

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

Every Properties row still renders as up-arrow, down-arrow, a filled blue checkbox, a type icon and a
label, on a flat canvas with zero card grouping; Notion's row is a drag affordance, a type icon, a
label and a trailing eye, grouped into inset cards. The state control moves from a leading checkbox
to a trailing eye/eye-slash icon; the sheet gains the same card grouping `076/001` landed the
vocabulary for; the row's hardcoded 30px height is swapped for the shared 44px token. The reorder
arrows are **unchanged** — `071/012` ADR-001 is extended, not contradicted (`spec.md` §13.13).

### Reference mapping

Every Notion iOS capture in this repository is **299×678**, a Mobbin thumbnail. The Notion column of
`spec.md` §13 is **structural only**; every number in its Target column is ours, `076/001`'s own
reused token, or `TBD — needs operator capture` (parent D3).

> Runs through the parent's loop graph: see `../plan.md` §6A "Running a child through the loop" for
> the node/edge tables, the verdict-file and state-record schemas, and what happens at GATE and
> ESCALATE (`../decision-record.md` D6).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready

- [ ] DEFINE table complete; every reference path resolves
- [ ] Every production surface enumerated (D2a) — including the board-groups panel's shared row
- [ ] Every numeric target ours, `076/001`'s reused token, or `TBD` (D3)

### Definition of Done

- [ ] Every lane clause (L1-L6) RED-then-GREEN with both numbers recorded
- [ ] `npm run screenshots` exit 0; `npm run screenshots:verify` 0 stale; both themes opened and looked at
- [ ] Judge ≥ 14/16, no row at 0, **twice consecutively on an unchanged tree**
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] The operator row present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Files to change

- `src/views/record-surface/property-row.ts` — `buildCheckboxPropertyRow` (`:384-439`): remove the
  checkbox (`:417`), add a trailing eye/eye-slash icon button reading `checked`/`checkboxDisabled`
  the same way the checkbox did, with a measurable contrast drop when disabled
- `src/views/column-manager-renderer.ts` — `renderSection` (`:126-156`) and its container: apply the
  card treatment to `.obnotion-column-manager-section` (mirroring `076/001`'s `.obnotion-settings-card`
  token reuse) and to the add-row wrapper (`:159-210`); the 1-card/0-heading vs 2-card/2-heading
  branch already exists and is unchanged at the logic level
- `src/views/checkbox.ts` — unchanged; the properties-panel row stops calling `createCheckbox`, the
  module itself still serves other callers
- `styles.css` — `.obnotion-column-manager-row` (`:14336-14344`): `min-height: 30px` →
  `min-height: var(--obnotion-sheet-row-min-height)`. `.obnotion-column-manager-section` (no rule
  today): add `background`/`border-radius`/`margin` reusing `076/001`'s `.obnotion-settings-card`
  declaration verbatim (`--background-primary`, `--obnotion-radius-lg`, `--obnotion-sheet-inset` /
  `--obnotion-space-5`). `.obnotion-column-manager-section-title` (`:13670-13674`): drop
  `text-transform: uppercase`, add the `in table` suffix at the call site (i18n, not CSS).
  `.obnotion-column-manager-add-row`: same card background as the sections
- `tools/live/sheet-grammar.mjs` — the clauses in §13.11 (L1-L6)
- `verification.md` — created/appended at VERIFY

### The scenario and its mount function

The capture that the judge scores comes from this scenario, mounting the shipped renderer:

The judged image is the full-sheet variant `screenshots/notion-clone/panels/constructed-column-manager-sheet-mobile-{light,dark}.png` (same run, emitted beside the viewport shot): the sheet expanded past its 90svh cap to its own content height, so the cards a viewport crop keeps below the fold are scored.

- `constructed-column-manager` — `constructedScenario("column-manager", { renderer: "column-manager" })`
  in `tools/screenshots/constructed-scenarios.mjs`, mounted by `mountConstructed` →
  `window.__mountConstructed` → `runRenderAssertions`, harness branch
  `scenario.renderer === "column-manager"`. Captures
  `screenshots/notion-clone/panels/constructed-column-manager-mobile-{light,dark}.png` — confirmed
  current this session (804×1748, opened and read for §13.9's before-state)
- `src/views/record-surface/property-row.ts`'s `buildCheckboxPropertyRow` is **shared** with the
  board-groups panel (`styles.css:10338`). `005-group-sheet-visual-parity` re-checks this row's
  clauses before it closes (`spec.md` §3, §6)
- Fixture `panel-column-manager` declares `fixtureOf: "constructed-column-manager"`; no scenario work
  is owed

### Pattern

Producer plus stylesheet, reusing a token `076/001` already landed for the card treatment. No new
runtime pattern, no new CSS custom property.

### Data flow

Unchanged. Only the state control's position/kind, the section/add-row paint, and the row's
min-height token move.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — a presentational change to the surfaces named above. No security, path handling,
env precedence, schema boundary, persistence, public response or shared policy is touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A-B | DEFINE + PLAN | T001-T002 | `spec.md` §13, this file §3, closed out | Written; what remains is transcription and the lane |
| C | CREATE | T003-T008 | Commits | Each clause RED with its number, then the producer, then GREEN with its number |
| D | SCREENSHOT | T009 | The capture set | `npm run screenshots` exit 0; light **and** dark current and looked at |
| E | VERIFY | T010-T011 | `verification.md` | Lane green **and** judge ≥ 14/16 with no 0; operator row left open |
| F | REMEDIATE | T012-T013 | `verification.md` iterations | Any row < 2 opens a RED→fix→GREEN→recapture→re-judge cycle; done needs **two** consecutive passes |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | L1-L6 of `spec.md` §13.11, plus the `071` regression set and the board-groups shared-row clauses | `tools/live/sheet-grammar.mjs` |
| Unit | A revert-proof contract for the checkbox→eye row-shell change | Vitest |
| Capture | Phone light + dark through the production mount path | `npm run screenshots`, `npm run screenshots:verify` |
| Real-app (WebKit) | Where the rebuild harness covers this sheet | `node tools/live/sheet-rebuild.mjs` |
| **Image judge** | The eight-row rubric, our capture beside R-1/R-2 | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone (D5, not agent-tickable) |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `076/001`'s judge passing twice | Internal | Sequential (D4) | This child does not start CREATE |
| `076/001`'s card-fill token (shared, `--background-primary`) and its open ADR-K | Internal | ADR-K Proposed, not yet fixed | This child's cards inherit the same dark-theme inversion until `001` lands the fix; recorded as a shared risk (`spec.md` §6), not blocking DEFINE/PLAN |
| The css-lane triplet on `styles.css` | Internal | One holder at a time | Edits serialise or conflict |
| The operator's C-1..C-6 / settings capture | External | **Not supplied** | Structural targets unaffected; the one child-specific provisional (13.12) waits |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close (D1) |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a `071` clause or the board-groups panel's shared-row clause regresses and cannot be
  closed inside this child's files; or the judge fails a third consecutive iteration on the same
  rubric row, which means the target is wrong rather than the implementation.
- **Procedure**: revert this child's producer and stylesheet commits — the surface returns to its
  shipped shape, green on the existing lane — and release the css-lane triplet. The new clauses go
  red and are reverted in the same commit. A wrong target re-opens at DEFINE, not at CREATE.
<!-- /ANCHOR:rollback -->
