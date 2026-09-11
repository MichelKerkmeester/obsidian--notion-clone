---
title: "Implementation Summary: Phase 3: Filter Sheet Visual Parity"
description: "The CREATE-step record: the one-summary-row-over-a-detail-group rule shape on the filter sheet and the active-rule companion, the labelled nested Not rows, the new six-clause filter lane block with its RED and GREEN numbers, and the capture and gate evidence."
trigger_phrases:
  - "003-filter-sheet-visual-parity implementation summary"
  - "076 phase 3 implementation summary"
  - "filter sheet what shipped"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity"
    last_updated_at: "2026-09-11T06:10:00.000Z"
    last_updated_by: "301-loop-003-filter-sheet-visual-parity"
    recent_action: "CREATE iteration 1: headline row over detail group, lane RED to GREEN"
    next_safe_action: "Score T013's image judge on the ten moved captures"
    blockers:
      - "No judged row exists: this leg cannot open an image"
      - "T009 partial: the comparator still edits in place inside its detail row"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core + level2-verify | v2.2 -->
# Implementation Summary: Phase 3: Filter Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 003-filter-sheet-visual-parity |
| **Completed** | 2026-09-11 (CREATE step only — the image judge, LAND and the operator read run next in the loop graph) |
| **Level** | 2 |
| **Actual Effort** | One CREATE-node session, T006-T011 of `tasks.md`; T009 partial and T012-T014 open |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A phone rule in the filter sheet is now one summary row over a plain-canvas detail group instead of
three equal full-width rows followed by three action rows. The summary row reads the condition back
in one line — property, operator, value — carries the chevron and toggles the group in place; the
group holds the same three controls, one per hairline-separated row, so every edit stays one tap
away. The rule's own actions moved into a labelled group of their own, and the nested Not node
renders two labelled rows on a sheet where it used to put two glyph buttons in its header. The
active-rule companion a chip opens takes the same shape, because it is the same rule opened on its
own. No stylesheet rule changed: the detail rows keep `.obnotion-panel-row`, so the sheet's existing
hairline rule still draws between them, and the group is a plain canvas by construction.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/filter-panel-renderer.ts` | Modified | `renderStackedConditionRow` became `renderSheetConditionRule`: a `data-filter-leaf` wrapper holding a `data-filter-summary-row` over a `data-filter-detail-group` of three `data-filter-detail-row` controls, then a `data-filter-action-group`; the mobile branch no longer skips the companion (`options.compact` no longer routes around it); `renderFilterTreeNot` renders labelled rows on a sheet instead of two header icon buttons |
| `tools/live/filter-parity-clauses.mjs` | New | The six presentation clauses (L1-L6) plus their verdict and formatter. Reads the shipped markup and the marked one, so the RED baseline was measurable on the tree before any marker existed |
| `tools/live/filter-parity-clauses.test.mjs` | New | Unit tests for the verdict: the ceilings, the one presence, and the failure wording |
| `tools/live/sheet-grammar.mjs` | Modified | New `window.__filterSheetPresentation` probe (sheet, nested sheet, active-rule companion) and its run block; a surface that measures zero rules fails rather than passing silently |
| `src/views/filter-panel-renderer.test.ts` | Modified | The source-shape suite follows the renamed builder and pins the three markers (`data-filter-summary-row`, `data-filter-detail-group`, `data-filter-action-group`) |
| `tools/lane/css-lane.json` | Modified | A `076-003-filter-sheet-visual-parity` release entry naming the ten moved captures, with the measured review note and per-image sign-off recorded as owed |
| `specs/005-component-surface-system/operator-checklist.md` | Modified | Regenerated: it was stale against the phase goals at HEAD and is a required release artefact |
| `screenshots/**` (10 PNGs + manifest) | Modified | The filter sheet, the nested sheet, the sheet variant, the active-rule companion and the two dropdown chains that mount over the filter panel, in both themes |
| `main.js` | Modified | Build output for the changed renderer |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

1. **The clause reads the markup, not a marker.** A marker-only clause would have read zero on the
   very tree the RED baseline had to measure, and a check that cannot go red is not evidence. Each
   clause looks for the explicit marker first and falls back to the shape the marker replaces
   (a rule starts at the row carrying its field control; the rule's own span ends at the next rule's
   first row), so the same six numbers describe the tree before and after.
2. **One control per row, rather than routing the three through sub-sheets.** The operator,
   property and value controls already open pickers on a phone; what the sheet got wrong was putting
   them side by side, so the restructure moves them under a summary row instead of inventing a
   second picker layer. This is what keeps the harness's child-dropdown registry (the operator,
   field and value pickers the overflow sweep opens) working unchanged.
3. **No stylesheet edit.** The detail group needed hairlines and a plain canvas; the sheet's own
   `.obnotion-panel-row + .obnotion-panel-row::before` rule already draws between sibling rows at
   any depth, so the group inherits the treatment. A CSS change would have moved the lane's
   baselineHash and every capture on it for no visual gain.
4. **Collapse in place, not by re-render.** The summary row toggles `hidden` and `aria-expanded` on
   its group; rebuilding the sheet to hide three rows would drop the focus that asked for it.
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

Lane, `node tools/live/sheet-grammar.mjs`, measured with the new block wired (RED before any
producer change, GREEN after). Per rule where the clause reports per rule:

| Clause | RED | GREEN |
|--------|-----|-------|
| L1 rows editing one rule across three or more controls at once | 0 sheet / 0 nested / **1 companion** | 0 / 0 / 0 |
| L2 condition rows stacked per rule | **3** (9 sheet, 12 nested) | 0 (0, 0) |
| L3 plain-canvas detail groups per rule | **0** (3 bordered control boxes per rule instead) | 1 per rule (3 sheet, 4 nested) |
| L4 nested Not icon buttons with no visible word | **2** on the nested sheet | 0 |
| L5 operator controls edited off a detail row | **2/1/1** sheet, 3/2/1/1 nested | 0 |
| L6 action rows outside a labelled action group | **3** per rule (9 sheet, 10 nested) | 0 |

The 071 floor the sheet also owes stayed green throughout: 9/9 rows at 48px, the 16px inset, the
357px span, 0 native selects and the 4 labelled root actions.

Battery, all foreground, exit codes read:

| Command | Exit |
|---------|------|
| `npx tsc --noEmit` | 0 |
| `npx vitest run` | 0 — 161 files, 1623 tests passed, 0 failed |
| `npm run build` | 0 |
| `node tools/live/sheet-grammar.mjs` | 0 — 28 lanes |
| `node tools/live/render-assertions.mjs` | 0 |
| `node tools/storybook/verify-placement.mjs` | 0 — 418/420, 2 red for a declared reason |
| `npm run screenshots` | 0 — three passes, 504/504 each |
| `npm run screenshots:verify` | 0 — 504 entries match their sources |
| `node tools/live/evidence.mjs --check-all` | 0 — 16/16 fresh (after re-running `sheet-rebuild`) |
| `npm run gate` | 0 — 28 green, 0 red for a declared reason |
| `node tools/naming/scan-comments.mjs` | PASS |
| `node tools/naming/scan-failing-values.mjs` | 0 |

Captures: ten moved in BOTH compared runs (295k-389k changed pixels, max channel delta 122-209) and
the two `constructed-filter-panel-sheet-mobile-*` captures by dimension as well, since a rule now
spends four rows where it spent three. Two single-run movers outside the filter surfaces were
reverted and their manifest entries left at HEAD. The lane's release entry names all ten.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| Requirement | Evidence |
|-------------|----------|
| Touch targets | The `touch-targets` lane is green in the gate; the detail rows keep the same controls and classes the sheet already measured, and the summary row is the same `createMenuRow` primitive the sheet's action rows already clear the floor with |
| Keyboard and focus | Escape still closes the sheet through the existing focus trap; the summary row is a real button with `aria-expanded`, and collapsing does not rebuild the tree |
| Both themes | The light and dark captures of all five filter surfaces moved together and were verified as present, non-blank and theme-distinct by `screenshots:verify` |
| Rebuild path | `tools/live/sheet-rebuild.mjs` re-run against the changed renderer: PASS, stamped into `tools/live/sheet-rebuild.json`, and the evidence artefact is fresh again |
<!-- /ANCHOR:nfr-verify -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No image judge pass has run.** This node computes geometry and decoded pixel deltas and cannot
   open an image, so `verification.md` §4 holds no scored row. The eight-row rubric is owed to a
   judging node; nothing here claims a score.
2. **T009 is partial.** The comparator, property and value still edit in place inside their detail
   row rather than through a navigation picker, and no value Edit/clear row exists. The L5 clause
   measures the weaker property (an operator control outside a detail group), so the rubric's
   Controls row is the judge's call and is not claimed green.
3. **The unmarked L5 reading was 2/1/1 rather than the predicted 1 per rule** — the unmarked span
   absorbs one extra operator control from the tree. Recorded rather than smoothed; it does not
   change the RED verdict, and the marked reading is exactly 1 per rule.
4. **T012-T014 remain open**: the keyboard-inset assertion was not re-run by this node, and the
   operator row is untouched by construction.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:deviations -->
## Deviations from Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| `tasks.md` T009: route property/comparator/value through navigation pickers and add a value Edit/clear row | The three controls moved into the detail group and kept their existing picker behaviour | Removing the inline controls would have unregistered the operator/field/value child pickers the overflow sweep opens (`sheet-grammar.mjs` §2b), which is a harness contract this leg did not own. The smaller move produces the reading the task's own GREEN names for L5 and leaves the picker routing for a leg that can also move that registry |
| `tasks.md` T006: expect L5=1 per rule | Measured 2/1/1 on the sheet and 3/2/1/1 on the nested tree | The failing value is evidence, not a constant to overwrite; the deviation is recorded here and in `tasks.md` |
| A new stylesheet block for the detail group | No CSS change | The sheet's own adjacent-row hairline rule already draws inside the group; a stylesheet edit would move the lane's baselineHash for identical pixels |
| `tools/lane/css-lane.json`: the newest entry was another packet's release | Appended a `076-003` release entry naming the ten movers | The lane's check compares the newest entry's `reviewed` array against the changed captures; the review is this leg's to record |
| `specs/005-component-surface-system/operator-checklist.md` was not in the task list | Regenerated it | `operator-list` is a gate lane and was red at HEAD because the plan commit added a phase goal without regenerating the checklist |
| `implementation-summary.md` was not in the task list | Written | `FILE_EXISTS` and `LEVEL_MATCH` require it for a level-2 packet; the sibling `002` carries one and validates PASSED |
<!-- /ANCHOR:deviations -->

---
