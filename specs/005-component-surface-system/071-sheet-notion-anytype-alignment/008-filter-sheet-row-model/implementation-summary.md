---
title: "Implementation Summary: Filter Sheet Row Model"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/008-filter-sheet-row-model"
    last_updated_at: "2026-09-09T23:21:41Z"
    last_updated_by: "071-008-filter-sheet-row-model"
    recent_action: "Stacked filter condition rows, labelled actions; lane red-green; gate 28-0"
    next_safe_action: "Operator device re-read (D3); group's own row-span gap is a Proposed ADR"
    blockers:
      - "AC-011: the operator's own device re-read has not happened; no agent may tick it"
    key_files:
      - "src/views/filter-panel-renderer.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "src/views/filter-panel-renderer.test.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "008-filter-sheet-row-model-implementation"
      parent_session_id: null
    completion_pct: 86
    open_questions:
      - "Can the operator supply a full-resolution Notion Advanced-filter capture (audit C-1)"
      - "Should group's own sheet declare heightRole flush too, closing the row-span gap this phase left open (Proposed ADR, ../../roadmap.md §7.17)"
    answered_questions:
      - "ADR-B: the AND/OR conjunction control is retained, unchanged — confirmed, still Proposed"
      - "Which presentation stacks: the phone sheet only (isMobileBottomSheet-gated); the desktop anchored popover and the compact chip-rail editor keep the original single-row layout"
---
<!-- SPECKIT_TEMPLATE_SOURCE: implementation-summary | v2.2 -->
# Implementation Summary: Filter Sheet Row Model

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 008-filter-sheet-row-model |
| **Status** | Implemented — 2026-09-09; AC-007 Waived at the group boundary |
| **Completed** | 2026-09-09 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The phone Filter sheet's condition rows no longer pack property, operator, value and three icon
buttons onto one 48px row. Each condition now stacks its property, operator and value onto three
full-width rows — the property control gets the row's whole inner width instead of roughly a
quarter of it, so a 12+ character name renders whole where it used to crop to two characters plus
an ellipsis (`F…`, `gr…`). The rule's own actions — turn into group, negate, remove — move off the
condition row entirely and render as labelled rows beneath it, Remove in the same destructive red
(`is-warning`) three other producers already use. The sheet's row inset, which had drifted 9px off
the shared 16px inset every sibling sheet reads at (the rule-tree's own indent, applied once too
many at the sheet's own root), now sits on the shared inset. An empty condition value shows a
labelled "Value" placeholder instead of a bare `—` glyph, on every presentation, not only the
phone sheet. This is a layout and labelling change only: no filter evaluates differently, no
stored rule shape moved, every existing event handler keeps its target.

**One requirement narrows at the group boundary.** REQ-007 asked for filter, sort and group to
share one row span within ±2px. Filter now matches sort exactly (both declare the same
`heightRole: "flush"`, closing the same floating/flush content-height mismatch sort's own earlier
fix closed for itself), but group's own width was already the odd one out before this phase
touched anything — that mismatch was in the RED baseline (332/357/341px) — and it comes from
group's own floating/flush classification on a surface this phase's Files to Change never names.
Recorded as a Proposed ADR rather than silently widening the lane's tolerance or silently editing
group's own producer.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/filter-panel-renderer.ts` | Modified | `renderFilterRow` gates on `isMobileBottomSheet(containerEl.ownerDocument) && !options?.compact`; when true, `renderStackedConditionRow` builds the property/operator/value rows plus the labelled action rows (`createMenuRow`) instead of one `createConditionRow` call. The empty-value placeholder changed for every presentation. "+ Add condition" carries a new class for the sticky-footer CSS. The filter sheet's own `positionToolbarPopover` call now declares `heightRole: "flush"`, the same declaration sort already makes |
| `styles.css` | Modified | Phone-scoped (`.is-phone .obnotion-filter-panel.obnotion-mobile-bottom-sheet`): the stacked row's operator loses the shared row's 96px flex cap; the root `.obnotion-source-rule-node` loses its 2px+7px left border/indent (nested groups keep theirs); "+ Add condition" (`.obnotion-filter-add-condition`) is `position: sticky; bottom: 0` with the sheet's own surface-overlay fill and a 1px top hairline |
| `tools/live/sheet-grammar.mjs` | Modified | Four new clauses: controls-per-row (≤4), name legibility (a 24-char name written onto the mounted label, scrollWidth ≤ clientWidth), row-inset equality (promoted from a printed-only number), and filter/sort shared row span (±2px) — group is printed for the record, not asserted, per the finding above |
| `src/views/filter-panel-renderer.test.ts` | Modified | A revert-proof source-text pin for the stacked-row class contract: the `isMobileBottomSheet` gate, `renderStackedConditionRow`'s call, its class list, and the labelled actions' icon/warning markers. The `popover-position` mock gained a stub `isMobileBottomSheet` |
| `tools/lane/css-lane.json` | Modified | Takeover from `007-settings-sheet-strict-alignment` (its own edit and release were already in this history but the top holder/baselineHash fields were never advanced), then this leg's own acquire/edit/release triplet, release naming the 9 changed captures |
| `screenshots/notion-clone/panels/constructed-filter-panel-*.png`, `constructed-depth3-import-confirm-dropdown-*.png`, `screenshots/notion-clone/views/board-view-desktop-dark.png`, `screenshots/manifest.json` | Modified | The recaptures: 8 content movers (the redesigned surface, every presentation, and the one surface that mounts it as a backdrop), 1 pre-existing sub-pixel mover unrelated to this surface, kept per the lane's own rule; 1 jitter reverted |
| `tools/live/*.json` (10), `specs/.../001-sheet-story-coverage-audit/inventory.md` | Modified | The evidence artefacts and the generated line-number inventory that dated themselves to the pre-edit tree, re-derived by their own producing tools |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first, four clauses. Controls-per-row: 6/6/5 controls on the three condition rows (wanted ≤4).
Name legibility: a 24-character name written onto the mounted property label measured scrollWidth
119px against clientWidth 14px. Row inset: 2/2 divider-owing pairs at 25.0px against the shared
16.0px. Shared span: filter 332px against sort 357px and group 341px. All four recorded, matching
the scaffold's predictions.

T003's root-cause read named `.obnotion-source-rule-node` (border-left 2px + padding-left 7px) as
the rule-tree's own indent, applied at the sheet's root because the default 3-condition fixture
wraps its leaves in one AND group. The producer and stylesheet changes landed together and the
lane ran green: every condition row now carries 1 interactive control, the 24-character name
renders whole, every divider-owing pair sits at 16.0px, and filter converges with sort at 357px
(group's own 341px printed, not asserted, per the finding above).

The wider verification battery — not this phase's own lane clauses — surfaced a real regression:
`sheet-rebuild.mjs`'s real-touch pass found that five taps at one screen coordinate on "+ Add
condition" only reached it once, because a stacked condition can add 150-250px of height and the
footer moved out from under the thumb between taps. Fixed at the producer (the button is
`position: sticky`), reran, green.

Full battery, foreground, exit codes read: `npx tsc --noEmit` 0, `npm run build` 0, `npx vitest run`
1589/1589 across 157 files (exit 0 — includes the 3 new revert-proof pins, confirmed to fail when
the stacked branch is reverted and pass when restored). `sheet-grammar` 0 (every registered surface,
both engines, all eight grammar columns; the filter/sort shared-span clause green, group printed).
`render-assertions` 0. `touch-targets` 0 (145/703 under 28px, against recorded baselines of 169/785
— no ratchet up). `verify-placement` 0 (418/420, the 2 red for a declared reason).
`npm run screenshots` ran twice (480 entries, exit 0 both); pixel-delta against the committed blobs:
**8 content movers, every one moved in BOTH sampled runs at identical counts** —
constructed-filter-panel-mobile dark 985076px@Δ214 / light 1003833px@Δ209, -nested-mobile dark
821420px@Δ206 / light 841507px@Δ212, constructed-depth3-import-confirm-dropdown-mobile dark
697882px@Δ123 / light 721854px@Δ135 (a filter-panel-parented scenario), constructed-filter-panel-
desktop dark 547px@Δ70 / light 548px@Δ89 (the empty-value placeholder is shared by every
presentation) — kept, deterministic, this edit's own surface. One pre-existing, unrelated mover
also moved in both runs — board-view-desktop-dark, 4 isolated pixels at Δ1, no filter surface in
frame — kept per the lane's own rule (real, not one-run jitter) rather than chased further. One
capture reverted as jitter: chrome-owned-menu-sheet-mobile-dark.png moved bytes only (pixelHash
unchanged) in one run alone — `git checkout`, manifest bytes restored, `screenshots:verify` 0
(480 entries match their sources). The 10 stale evidence artefacts and the coverage inventory's
one shifted line number were re-derived by their own producing tools, then `evidence --check-all`
16/16 fresh. `check-lane` 0 (stylesheet unchanged since the release; release names all 9 changed
captures). `npm run gate` ran to the full 28 lanes: **28 green, 0 red**, exit 0.
`scan-comments` 0, `scan-failing-values` 0.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Stacking is gated on `isMobileBottomSheet`, not universal | The audit's evidence is the phone capture; the desktop anchored popover's 552px width and `PANEL_POPOVER`'s own sizing were tuned for the inline six-control row, and restacking it there was untested, unrequested surface this phase's scope never named. The compact chip-rail editor (`options.compact`) keeps its own existing floors for the same reason |
| The empty-value placeholder changed on every presentation, not only the phone sheet | The bare `—` glyph is the same code path (`rule.op === "empty" \|\| "notempty"`) regardless of platform; a labelled affordance is strictly better everywhere it appears, and forking it by platform would be a second, unrequested branch for no behavioural gain |
| Labelled actions reuse `createMenuRow`, not new markup | `.obnotion-menu-item` already carries its own 44px phone floor, hover, and `is-warning` red — the exact primitive the group sheet's own rows already use — so the family reads one way instead of growing a second row-with-icon-and-label implementation |
| "+ Add condition" is `position: sticky`, added after discovery rather than up front | The stacking change alone does not need it; the regression only exists because a stacked condition is now tall enough to move the footer out from under repeated taps, and `sheet-rebuild.mjs`'s real-touch pass is what found it |
| Filter declares `heightRole: "flush"` rather than relying on the auto height classifier | The classifier answered differently depending on how many conditions were mounted in a given fixture, which is exactly the fragility the row-span target exists to remove; a declared role converges filter with sort deterministically instead of by content-height luck |
| Group's row-span gap stays open rather than closed by force or by silence | Closing it needs group's own producer to declare the same role, which is a frame-shape decision on an already-verified sibling surface (071/005) outside this phase's Files to Change. The lane's assertion is scoped to what this phase owns (filter/sort) and group's own number is printed, not hidden |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| RED (T004-T007) | Lane exit 1, 4 failures — controls 6/6/5 > 4, name scrollWidth 119px > clientWidth 14px, row inset 25.0px, shared span 332/357/341px |
| GREEN (T008-T010) | Lane exit 0 — every condition row 1 control, a 24-char name fits, all divider-owing pairs at 16.0px, filter/sort share 357px (group 341px printed) |
| Nested-group fixture (T009) | Screenshot-confirmed: the NOT/group header, its own icon buttons and its own left-indent are unchanged; only the leaf condition's row stacks |
| Revert-proof unit (T012) | Stacked branch reverted → 3/10 new tests fail; restored → 10/10 pass, 1589/1589 whole suite |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run build` | PASS, exit 0 |
| `npx vitest run` | PASS, 1589/1589 (157 files) |
| `node tools/live/sheet-grammar.mjs` | PASS, exit 0, both engines |
| `node tools/live/sheet-rebuild.mjs` | PASS, exit 0 — a real tap-target regression found and fixed mid-verification |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 (145/703 under 28px, no ratchet up) |
| `node tools/storybook/verify-placement.mjs` | PASS, exit 0 (418/420, 2 declared red) |
| `npm run screenshots` ×2 + pixel-delta | PASS, 480 entries, exit 0 both; 8 deterministic two-run content movers (all this surface) kept, 1 pre-existing unrelated sub-pixel mover kept, 1 jitter restored; `screenshots:verify` 0 |
| `node tools/live/evidence.mjs --check-all` | PASS, 16/16 fresh |
| `node tools/lane/check-lane.mjs` | PASS, exit 0 — release names all 9 changed captures |
| `npm run gate` | PASS, 28 green, 0 red, exit 0 |
| `scan-comments` / `scan-failing-values` | PASS, 0 / 0 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **AC-007 is Waived, not Met.** Filter and sort share one row span; group does not, for reasons
   outside this phase's scope. Closing it needs an operator ruling on whether group's own sheet
   should also declare `heightRole: "flush"` — Proposed ADR, `../../roadmap.md` §7.17.
2. **AC-011 is the operator's own device read.** No agent ticks it; it stays open whatever the
   lane says.
3. **The 90svH cap and keyboard inset were not re-proven by a dedicated 5-row fixture.** Neither
   declaration changed in this phase, and `sheet-rebuild.mjs`'s real-touch pass measured a live
   rebuilt sheet's resting position directly — but a taller filter list's own cap behaviour is
   inferred from unchanged CSS mechanics plus that adjacent measurement, not asserted by a new
   red-then-green number.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:continuation -->
## Continuation Notes

The next leg should: (1) carry the operator's device re-read to close AC-011; (2) bring the group
row-span question to the operator — declare `heightRole: "flush"` on group's own sheet (a
`012-sort-and-group-sheet-rows` concern, not this phase's) or accept the two-of-three convergence
as final; (3) if a full-resolution Notion Advanced-filter capture (audit C-1) arrives, the §13 gap
table's structural Notion column can gain measured cells. `010-sheet-copy-touch-idiom` is next in
the implementation order the audit named (`010` → `008` → `009` → `011` → `012` → `013` → `014`);
`008` and `010` are independent of each other, so either order is safe.
<!-- /ANCHOR:continuation -->
