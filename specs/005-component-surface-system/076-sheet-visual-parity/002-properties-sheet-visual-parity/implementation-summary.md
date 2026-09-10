---
title: "Implementation Summary: Phase 2: Properties Sheet Visual Parity"
description: "The CREATE-step record: the checkbox-to-eye row shell, the shown/hidden section cards, the add-property terminal card and the 44px row-height token swap, with lane RED/GREEN numbers and gate evidence."
trigger_phrases:
  - "002-properties-sheet-visual-parity implementation summary"
  - "076 phase 2 implementation summary"
  - "properties sheet what shipped"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core + level2-verify | v2.2 -->
# Implementation Summary: Phase 2: Properties Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 002-properties-sheet-visual-parity |
| **Completed** | 2026-09-11 (CREATE step only — LAND and JUDGE run next in the loop graph) |
| **Level** | 2 |
| **Actual Effort** | One CREATE-node session, T001-T010 of `tasks.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The Properties sheet's row shell drops its leading checkbox for a trailing eye/eye-slash visibility
toggle; the shown/hidden sections and the add-property row gain the settings-card treatment
`076/001` already landed the token for; the row gains the shared 44px min-height floor; the section
heading loses its uppercase transform and gains "in table" copy. The reorder affordance is
unchanged — the arrow pair stays, extending `071/012` ADR-001 rather than introducing a grip.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/record-surface/property-row.ts` | Modified | `buildCheckboxPropertyRow`: removed the leading checkbox, added the trailing eye/eye-slash toggle; renamed `checkboxDisabled`/`onCheckboxClick`/`onCheckboxChange` to `stateControlDisabled`/`onToggle` |
| `src/views/column-manager-renderer.ts` | Modified | `renderSection` now wraps the zero-hidden state in its own (headerless) card, matching the ≥1-hidden branch's two-card shape; section titles read the new `panel.shownInTable`/`hiddenInTable` keys |
| `src/views/board-groups-panel.ts` | Modified | Call-site rename only (`onToggle`), following the shared row shell's new option names |
| `src/views/board-card-properties-panel.ts` | Modified | Call-site rename only (`stateControlDisabled`/`onToggle`) |
| `src/i18n.ts` | Modified | Added `panel.shownInTable`/`panel.hiddenInTable` (en, zh-CN, zh-TW) — new keys rather than repurposing the shared `panel.shownSection`/`hiddenSection` the record sheet's hidden-group and the board's group-by popover also read |
| `styles.css` | Modified | `.obnotion-column-manager-row` grid loses its checkbox track, gains a trailing `auto` eye track; `.obnotion-column-manager-eye` is new; `.obnotion-column-manager-section`/`.obnotion-column-manager-add-row` gain the settings-card fill/radius/margin, scoped to `.obnotion-mobile-bottom-sheet`; the row-to-add-row hairline is dropped where a card now separates them; the row gains the 44px min-height floor in that same scope; the section-title uppercase transform is removed |
| `tools/live/sheet-grammar.mjs` | Modified | Added the `window.__propertiesVisualParityGrammar` measurement and its L1-L6 consumption block; updated `window.__columnManagerRowModel`'s expected section-title text to the new keys; updated the divider-boundary clause and its negative control to expect a card gap (not a hairline) at the add-row seam |
| `tools/live/render-assertion-harness.ts` | Modified | Two pre-existing assertions read `input[type='checkbox']`/`.checked` to describe the row's visibility state; both now read `.obnotion-column-manager-eye` and the stub's `data-icon` attribute instead |
| `tools/storybook/obsidian-stub.mjs` | Modified | Added a plain `eye` icon (only `eye-off` existed) — its absence drew a placeholder diamond in the first capture |
| `tools/screenshots/scenarios/panels.mjs` | Modified | Three hand-authored fixtures (`panel-column-manager`, `panel-board-groups`, `panel-board-card-properties`) had their row markup updated to the new anatomy — the new CSS grid, applied to their unchanged stale markup, had broken the checkbox onto its own implicit row |
| `src/views/record-surface/property-row.test.ts`, `src/views/column-manager-renderer.test.ts`, `src/views/board-groups-panel.test.ts`, `src/views/board-card-properties-panel.test.ts` | Modified | Updated to the new option names and the eye-toggle DOM shape |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|----------|-----------|
| New i18n keys (`panel.shownInTable`/`hiddenInTable`) instead of editing the shared `panel.shownSection`/`hiddenSection` | Those shared keys are also read by the record sheet's hidden-properties group and the board's group-by popover; an "in table" suffix would misword both. `tasks.md` named the shared keys; this deviates from the letter to keep the intent (this sheet's own heading copy) without a cross-surface regression |
| Renamed `checkboxDisabled`/`onCheckboxClick`/`onCheckboxChange` to `stateControlDisabled`/`onToggle` | The row shell no longer has a checkbox; keeping checkbox-shaped names on a button-based control would mislead the next reader. `tasks.md` suggested this rename as an example ("e.g."); taken as the actual name |
| Updated the three hand-authored screenshot fixtures' row markup | The DEFINE recorded "no scenario work is owed" for these fixtures, meaning no new capture registration — it did not anticipate that the new CSS grid would visibly break their *unedited* markup into two lines (the orphaned checkbox had no grid-column left to land in). Fixing the row anatomy is a narrow, mechanical change inside the already-touched shared CSS surface, not new scope |
| Added a plain `eye` icon to `obsidian-stub.mjs` | The first capture showed a placeholder diamond for every visible row's toggle — the stub only carried `eye-off`. Additive, matches the file's own stated maintenance procedure ("kept by measurement... mounting every constructed scenario and collecting the ids that fell through") |
| Symlinked this worktree's `node_modules` and `specs/context` to the primary checkout | Both were absent (not merely stale) in this worktree, unlike a sibling worktree created the same session which has them correctly symlinked — a provisioning gap, not a deliberate state. Without them, `verify-placement.mjs` and `npm run screenshots` cannot run at all. Disclosed here rather than worked around silently |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Test Type | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| Unit (Vitest) | Pass | 1617/1617 | Full suite, including the four updated row-shell test files |
| Lane (`sheet-grammar.mjs`) | Pass | L1-L6 RED-then-GREEN, `git stash`-verified | Also: updated 071 row-model/divider clauses green; board-groups/071 regression set green |
| `render-assertions.mjs` | Pass | 0 failures | The board-groups checkbox-count assertion (now eye-count) verified RED-then-GREEN via `git stash` |
| `verify-placement.mjs` | Pass | 418/420, 2 declared reds (pre-existing, unrelated) | |
| `touch-targets.mjs` | Pass | No ratchet up (fixture baseline 169, constructed baseline 785) | |
| Screenshots | Pass | 482/482 captured (x3 runs), `screenshots:verify` 0 stale | 28 real movers named in the css-lane release; 2 one-run jitters restored |
| `npm run gate` | Pass | 28 green, 0 red for a declared reason | css-lane acquired/edited/released as `076-002-properties-sheet-visual-parity` |
| Naming scans | Pass | `scan-comments.mjs` and `scan-failing-values.mjs` both exit 0 | |
| Image judge | Not run | — | CREATE-node self-score recorded in `verification.md`: 13/16, driven by `076/001`'s own open dark-card-contrast defect (ADR-K) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| NFR ID | Target | Actual | Status |
|--------|--------|--------|--------|
| (§7, this child) | Touch targets ≥ 44px on every control this child adds or moves | Eye toggle: 44x44px within `.obnotion-mobile-bottom-sheet` (matches `hidden-properties.ts`'s landed pattern) | Pass |
| (§7, this child) | No contrast regression in either theme | Light: pass. Dark: card-vs-canvas contrast is dim, but this is `076/001`'s inherited, tracked ADR-K — not a new regression this child introduces | Pass (regression), Known gap (absolute contrast) |
| (§7, this child) | No new dependency, no new runtime pattern | Confirmed — reuses `076/001`'s card token and `hidden-properties.ts`'s eye-button idiom | Pass |
<!-- /ANCHOR:nfr-verify -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Dark-theme card contrast** — inherited from `076/001`'s open Proposed ADR-K; the shared
   `--obnotion-settings-card-fill` token computes close to the canvas fill in dark theme. Not this
   child's token to change; tracked at `../../roadmap.md` §7.19/§13.7.
2. **Hidden-section and add-row cards not visually confirmed in the judged capture** — the fixture's
   16-row list scrolls past the phone viewport before either renders. Confirmed structurally via
   `L4`/`L6`'s computed-style assertions instead.
3. **L3 (required-column contrast) reads N/A on this fixture** — `column-manager`'s mounted config
   carries no `titleField`, so no row is ever disabled here. The disabled-state wiring is covered by
   a direct Vitest assertion instead of a live-lane measurement.
4. **The three hand-authored screenshot fixtures's card CSS is absent** — `panel-column-manager`
   renders the desktop anchored presentation (no `.obnotion-mobile-bottom-sheet` class), so it never
   carried the card treatment even after this fix; only its row anatomy (checkbox → eye) was
   corrected.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:deviations -->
## Deviations from Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| `tasks.md` T006: update `panel.shownSection`/`hiddenSection` | Added new `panel.shownInTable`/`hiddenInTable` keys instead | Those shared keys are read by two other, out-of-scope surfaces (record sheet's hidden-group, board's group-by popover); editing them in place would have miscopied both |
| `tasks.md` T005/T007 architecture note cites `styles.css:14336-14344` for the row min-height edit | Added a scoped override inside the existing `.obnotion-column-manager.obnotion-mobile-bottom-sheet .obnotion-column-manager-row` rule instead | The cited line is the desktop-wide base rule; swapping it in place (even with a CSS-variable fallback) risked reaching desktop and the two other shared-shell consumers (board-groups, board-card-properties) unintentionally. The scoped override reaches only the Properties sheet |
| No task named the render-assertion-harness.ts checkbox-count assertions, the obsidian-stub.mjs missing `eye` icon, or the three screenshot fixtures' broken row markup | Fixed all three | Each was a genuine regression the shared CSS/producer change caused in an adjacent, previously-passing surface; found while running the named verification commands, not invented scope |
<!-- /ANCHOR:deviations -->

---
