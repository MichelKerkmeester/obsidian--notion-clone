# Iteration 3 — REFERENCE COMPOSITION

## Gap class

REFERENCE COMPOSITION — audit every DEFINE Source field, D7 frame application, stacking rule, and board reference scope.

## Evidence (path:line + quote)

- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:390-399 — D9 requires every sheet DEFINE table to name Anytype, Notion, or ClickUp per element and explain why.
- specs/005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity/spec.md:300-305 — 001 uses “Where it comes from,” not the required Source and Source reason fields.
- specs/005-component-surface-system/076-sheet-visual-parity/003-filter-sheet-visual-parity/spec.md:238-250 — 003 omits Source and still targets “1 card containing 3 rows.”
- specs/005-component-surface-system/076-sheet-visual-parity/007-property-editor-sheet-visual-parity/spec.md:244-268 — 007 omits Source while choosing between an inline type list and a three-level sheet chain.
- specs/005-component-surface-system/076-sheet-visual-parity/013-board-card-properties-visual-parity/spec.md:221-226 — 013 has Source but no Source reason or evidence-rung column.
- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:295-318 — D7 says plain sheet background, hairline dividers, and “No rounded or lighter container of any kind around a row or a value.”
- specs/005-component-surface-system/076-sheet-visual-parity/006-add-view-sheet-visual-parity/spec.md:218,235-249 — D7 is deferred to CREATE while the target still requires “1 card.”
- specs/005-component-surface-system/076-sheet-visual-parity/goal.md:85-100 — the parent binding still contains “several inset cards,” “Shown / Hidden cards,” and “one card of settings rows.”
- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:400-416 — D9 makes ClickUp lead boards and requires stacked sheets for sub-menus and pickers.
- src/views/surface-shell.ts:346-353,510-541 — panel and condition-panel roles deliberately replace a third surface in place.
- src/views/overlay-stack.ts:119-130 — a depth-two parent offers a replacement before a new sheet is registered; parents without the callback still stack.
- tools/live/sheet-grammar.mjs:403-412,428 — the property-type picker is replace-in-place while record submenu and import chains remain stacked.
- specs/005-component-surface-system/076-sheet-visual-parity/012-board-card-fields/spec.md:235-247 — 012 retains Anytype for its single-column field layout as an explicit exception.
- specs/005-component-surface-system/076-sheet-visual-parity/018-board-visual-parity-clickup/spec.md:84-94 — 018 selects ClickUp for board chrome and excludes 012.
- specs/005-component-surface-system/076-sheet-visual-parity/019-board-card-drag-feel-clickup/spec.md:84-92 — 019 selects ClickUp for drag presentation and excludes static chrome.

## Finding

The composition contract is only partially transcribed. Source headers are absent from 002 through 012 (001 uses a differently named provenance column); 013 through 019 have Source but not the required reason/rung/measurement fields. D7 is a resolved target rule, yet several targets and the parent goal still describe card containers. D9's 012 board exception is sound but must be repeated in parent bindings. D9's stacked-picker hard constraint and the role-scoped replace-in-place code conflict specifically at the property-type picker and need Proposed ADR-N.

## Proposed text (ready to paste)

Replace every child section 13 target-table header with:

| Row ID | Element | Ours today | Target | Source | Source reason | Evidence rung | Measurement kind | State | Theme | Capture IDs | Lane clause | Rubric rows |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

Use Source values Operator, Anytype, Notion, ClickUp, Internal, or None. A None row must say “no reference in repository”; structural evidence never authorizes a pixel number; operator evidence outranks the product references.

**D7 target normalization.** The word card is permitted only in a quoted reference description. It must not appear in a target container, lane, acceptance criterion, judge expectation, or completion binding. Replace it with plain sheet background, divider-separated group, terminal action group, recessed search control, or full-width selection band. Assert cardContainers = 0 for every sheet.

**Proposed ADR-N.** D9 requires stacked sheets for sub-menus and pickers, while surface-shell.ts replaces a third child for panel and condition-panel roles and 007 targets an inline property-type list. The operator must choose: every picker stacks; navigation pickers stack while form-role property type is an explicit inline/replacement exception; or 007 changes to the stacked target. Until chosen, 007 and 010 keep both candidate lanes and cannot close the stacking row.

**Proposed ADR-P.** ClickUp leads 018 and 019 and future board chrome/motion. 012 remains the settled Anytype exception for the single-column board-card field layout. Repeat this exception in the parent goal, coverage matrix, and board child acceptance criteria.

## Confidence

High for missing/incomplete provenance and stale D7 target language; high for the 012 exception; medium for the operator's intended picker-stacking exception.
