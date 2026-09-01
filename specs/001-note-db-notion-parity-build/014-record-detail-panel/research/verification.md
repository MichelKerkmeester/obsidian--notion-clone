# Verification: Record Detail Panel / Hover-Open UX
> Read-only plan verdict by GPT-5.6 Luna against research/synthesis.md + final-plan.md.

## Coverage
- Rank 1, **Title-cell hover OPEN**: covered by `003-title-open-affordance` T003, including the title-hidden fallback.
- Rank 2, **Side-peek overlay**: covered by `001-table-record-peek-module` T003 and `002-peek-panel-css` T003.
- Rank 3, **Header and collapsible hidden groups**: covered by `001-table-record-peek-module` T003.
- Rank 4, **Toolbar-safe theme-variable CSS**: covered by `002-peek-panel-css` T003.
- Rank 5, **OPEN isolation from title navigation and Page Preview**: covered by `001-table-record-peek-module` T003 and `003-title-open-affordance` T003/T005.
- Rank 6, **Phone/tap fallback**: covered by `002-peek-panel-css` T003.
- Rank 7, **Keyboard open/close and focus return**: Mod+Enter is covered by `004-peek-keyboard-open` T003; Esc capture and focus return are covered by `001-table-record-peek-module` T003.
- Rank 8, **Viewport/empty/hidden/scroll handling**: empty state, hidden-toggle guard, long-value handling, and panel scroll are covered by `001-table-record-peek-module` T003 and `002-peek-panel-css` T003. The original `PopoverPosition` viewport clamp/flip portion is explicitly listed as future/out of phase in the parent Phase Documentation Map and is replaced by the locked CSS-docked design.
- **No ranked-backlog recommendation has NO home.**

## Couplings
- The module and its required i18n keys remain together in `001-table-record-peek-module` T003–T004, explicitly marked as one atomic diff.
- The panel, hover-reveal, and phone-persistent OPEN CSS remain together in the single append-only CSS child `002-peek-panel-css`.
- The final-plan coupling between `renderCell` attachment and overlay lifecycle is kept in `003-title-open-affordance`: T003/T004 are explicitly one atomic diff. The selector, `closeActiveOverlays`, and `refresh()` sync are not split away from the attach hunk.
- Title-hidden fallback and OPEN/Page Preview isolation remain part of the same title-affordance child. No same-diff coupling is improperly split.

## Grounding
- **Bogus/misattributed citation:** `003-title-open-affordance/tasks.md` T003 says the table callback is wired from `TableRenderer` at `:586`. In the fork, `TableRenderer.ts:586` is `getCreatePosition()` returning `afterPath`; the callback wiring is at `DatabaseView.ts:586`, and `TableRenderer.ts:502` invokes `this.actions.renderCell(...)`. The cited line exists, but it does not support the stated claim.
- The other spot-checked fork citations in the child tasks correspond to real source locations, including the calendar exports, title-cell rendering, `ColumnConfig` helpers, keyboard branches, overlay lifecycle, and relevant CSS.

## Verdict
**CONCERNS** — coverage, coupling, and scope are faithful to the research, but `003-title-open-affordance/tasks.md` T003 contains one misattributed `TableRenderer:586` citation.
