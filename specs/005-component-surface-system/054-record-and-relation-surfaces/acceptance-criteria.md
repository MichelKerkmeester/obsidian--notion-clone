---
title: "Acceptance Criteria: Record and Relation Surfaces"
description: "The criteria this packet must satisfy before it may be closed: one threshold per primitive and per migration, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "054 acceptance criteria"
  - "record surface criteria"
  - "primitive thresholds"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/054-record-and-relation-surfaces"
    last_updated_at: "2026-09-06T00:00:00Z"
    last_updated_by: "implementer-leg"
    recent_action: "Extracted 5 editor modules (T061-T063); gate 26 green; T070/T071 gaps named"
    next_safe_action: "Build the census lane (T011/T023) or close the column-manager row-class gap (T071)"
    blockers:
      - "AC-006's standalone-mount clause and T070's census-lane proof both need infrastructure T011/T023 did not build"
      - "T071 found column-manager-renderer.ts's row class does not match sheet-grammar.ts's selector; fix touches styles.css, outside this leg"
      - "AC-012/OPS-001..003 are operator-owned and nothing here can close them"
    key_files:
      - "src/views/cell-renderer.ts"
      - "src/views/record-surface/cell-editor-option.ts"
      - "src/views/record-surface/cell-editor-relation.ts"
      - "src/views/record-surface/cell-editor-date.ts"
      - "src/views/record-surface/cell-editor-text.ts"
      - "src/views/record-surface/cell-editor-number.ts"
      - "src/views/record-surface/cell-editor-shared.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-054-ac"
      parent_session_id: null
    completion_pct: 55
    open_questions: []
    answered_questions:
      - "ADR-005 (2026-09-05 ~18:20): rejected. AC-002's proof stays the by-hand pixel read of the true-up's captured positions, owed to an image-capable leaf at close; the DOM box reading is corroboration only"
      - "2026-09-06: AC-002's owed pixel read closed green on the regenerated captures after T030/T031's left-align and option-split CSS landed"
      - "2026-09-06: completion_pct left at 55 deliberately — D13 derives it from goal.md's own completion checklist, which this pass did not tick; a future pass should recompute it there rather than trust this number moving on prose alone"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Record and Relation Surfaces

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/054-record-and-relation-surfaces
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
AC rows align to REQ ids; AC-010 is the capture gate and AC-011 the operator's.

Counts are measured by the census lane (one page rendering the same column through every consumer),
not by grep — a count read from a grep can be defeated by renaming a class. Desktop measurements on
the real renderer at the production mount point; phone on a 390×844 profile with a navbar present.
Every threshold carries a failing number observed before the fix (parent D2, goal D2). Exit statuses
read from `$?`, never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the record sheet, the peek and the properties panel, **Then** each header is built by the P1 primitive, and the census reads **1** distinct header builder in the family (down from 4); the record sheet's desktop DOM matches its pre-phase geometry | Census lane counting header builders across the three surfaces. Negative control: bypass P1 in one consumer, require the count to go 2. **Today, re-measured 2026-09-06 after T030/T031/T041:** **2 builders**, down from 4 — `record-detail-panel.ts`, `table-record-peek.ts` and `column-manager-renderer.ts`'s desktop branch all now call `buildDesktopRecordHeader` (`record-surface/record-header.ts`), extended with optional `headerClass`/`titleClass`/`renderTrailing` so a rail (the peek, no open/close) and a title-only panel header (the properties panel, with a trailing select-all toggle) fit the same builder without forcing their DOM to the record sheet's shape; all three phone branches call the pre-existing shared `createSheetHeader`. Only `db-modal.ts:82`'s `getSheetTitle` scrape remains separate — outside this leg's named consumer set. The record sheet's desktop DOM is unchanged: `npm run screenshots` produced no diff for any record-detail scenario attributable to the header alone (the rows and hidden group below are what moved the captures) — no census lane exists to read the "2" mechanically, per T011's recorded gap; this count is a hand grep, the same method T002 used | Unmet | - |
| AC-002 | REQ-002 | **Given** one column rendered through the record sheet, a board card, the peek and the properties panel, **Then** all four consumers build the row through P2, and the census reads **1** property-row vocabulary (down from 3); the row's anatomy is **label, then value, value left-aligned**, with **no format icon on the row** | SC-001's four-consumer lane row; badge colour, rating/progress/ring and conditional-format rendering asserted identical across consumers, and the desktop value's left edge asserted common across rows. **Proof stays the by-hand screenshot read** — labels at x 59, values right-aligned at 273, 311, 319, 343, 349 and 362, as measured on `constructed-record-detail-desktop-dark.png` in the true-up — performed by an image-capable in-runtime leaf at the leg's close (`decision-record.md` ADR-005, **Rejected 2026-09-05 ~18:20**; operator: "Keep the pixel reading"). Negative control: reintroduce the peek's private `renderProperty` body, require red. **Today, re-measured 2026-09-05, citations refreshed after the rebase onto `5e24d6a0`:** **3 vocabularies** — `record-surface/property-row.ts:65` (the body that was `card-field-renderer.ts:102` before this pass's shim; the count did not move, the file did), `table-record-peek.ts:334`, `column-manager-renderer.ts:267`+`board-card-properties-panel.ts:50`; and the desktop record sheet **still right-aligns** its values (`styles.css:10162`, `text-align: right`, inherited from the board card — confirmed unchanged, `styles.css:10478` still carries only the mobile-bottom-sheet override, no desktop override added). **Pixel read closed 2026-09-05 by an image-capable in-runtime leaf**, as ADR-005 required: on `screenshots/notion-clone/panels/constructed-record-detail-desktop-dark.png` (2880×1800, a 2× capture; figures in CSS px), across the 21 property rows the label left edge holds **x 58.0-59.0** on every row and the value **right** edge holds **x 379.0-379.5** on 19 of them, while the value **left** edge is ragged across **x 263, 273, 311, 319-320, 342.5, 349.5, 362, 366** — a 99px spread down the column a reader scans. The two rows that break the right edge (`added_to`, `note`) are file chips left-aligned at x 143.5. This reproduces the true-up's labels-at-x59 / values-ending-at-379 / starts-at-273-362 figures within half a pixel and adds the 263 start the true-up did not enumerate. The option half is red on the same capture: the single-select `priority-0` pill and the multi-select `Backlog` chip share the identical fill `rgb(59,62,67)`, so the C9 split is not shipped. As corroboration only, the earlier leg re-measured through `getBoundingClientRect()`/`getComputedStyle()` on the mounted `panel-record-detail/file-view` scenario: label left edge x 42 and `.db-board-card-value` box x 122-364 with `text-align: right` computed at a 1100×900 viewport — a DOM box rather than a glyph run, so it does not reproduce the per-row starts. Same conclusion (right-aligned, unmet), three observables. **Anatomy restated by ADR-004** — the draft's "type icon + label + value on the right" is contradicted on both halves by `design-trueup.md` C1. **Closed 2026-09-06 by an image-capable in-runtime leaf, as ADR-005's rejection required.** `record-detail-panel.ts` gained a `text-align: left` declaration on its own `.db-record-detail-field .db-board-card-value` rule (`styles.css`), left beside — not replacing — the board card's own right-aligned rule the four external `renderCardField` callers still depend on (ADR-004's named consequence, goal D5/D7). Read on the regenerated `constructed-record-detail-desktop-dark.png`: every value now sits flush left under its label, no ragged right edge. The option split shipped via a `.db-record-detail-field .db-board-card-value > .status-badge` / `.db-record-peek-field-value > .status-badge` CSS override (direct child only, so a nested multi-select badge is untouched) plus the `status-color-text-*` palette `property-row.ts`'s module comment had promised and this leg added — read on the regenerated `panel-record-peek-desktop-dark.png`: `Billing: Yearly` and `Payment: Revolut` (single-select) render as coloured text with no fill, `People`/`source` (multi-select) keep the filled chip, distinguishably. **"All four consumers"**: the peek builds its row shell through P2 (`buildPropertyRow`, `table-record-peek.ts:351`); the record sheet does **not** — `record-detail-panel.ts:459` still builds its row through `renderCardField`, reaching P2 only through `card-field-renderer.ts`'s shim into `renderPropertyValue`. **Corrected 2026-09-06 by the verify-and-land pass**, which read the imports rather than the claim: the earlier wording said both surfaces used the row shell and only one does. The criterion is unaffected — the anatomy it measures is carried by the stylesheet, not by which function assembles the row — but the count below is a module count, not a row-shell count; the properties panel's own row is P2's checkbox variant (a different anatomy, AC-007's row); the board card is the one of the four ADR-004 names as staying right-aligned and un-split — `board-renderer.ts` was not touched, per goal D5/D7's protection of the `038` PM parity, and is outside this leg's named consumer set. The vocabulary count reads **1 module, 4 call sites** (`property-row.ts`'s `buildPropertyRow`/`buildCheckboxPropertyRow`/`renderPropertyValue`, consumed by `card-field-renderer.ts`'s shim, `table-record-peek.ts`, `column-manager-renderer.ts` and `board-card-properties-panel.ts`), down from 3 independent bodies — no census lane exists to read it mechanically (T023's recorded gap); this is a hand count. **Re-verified 2026-09-06 on the rebase onto `7cbed3c1`, and one gap found and closed.** The pixel read was re-run on the regenerated `constructed-record-detail-desktop-dark.png` (2880×1800, a 2× capture; figures in CSS px, 21 property rows) and the claim did not hold in full: the text values had moved left, but the **three multi-select rows were still pinned right** at value-left **x 263.0** with their right edge at **x 379.5**, because `.db-board-card-badges` is a flex row carrying `justify-content: flex-end` (`styles.css:10439`) and `text-align` cannot reach a flex container's main axis. Fixed with one scoped rule — `.db-record-detail-field .db-board-card-badges { justify-content: flex-start }`, the same scoping the `text-align: left` beside it uses so the board card keeps `flex-end`. **Red then green, same observable, same tool:** value-left **138.0-263.0 (spread 125.0)** → **138.0-143.5 (spread 5.5)**; value-right **155.5-379.5** → **155.5-254.5**, i.e. released rather than pinned. 19 of 21 rows sit at **138.0-140.0** (a 2.0px spread that is glyph left-bearing); the two at **143.5** are file chips carrying their own padding. Labels did not move: **x 58.0-59.0** before and after, matching the true-up's red exactly. The phone half was measured the same way on `constructed-record-detail-mobile-dark.png`: the `People` row went value-left **261.0 → 129.0** with its label unchanged at **26.0**. The option split was re-confirmed by sampling dominant colours per row in **both** themes: single-select rows carry only the panel background plus the glyph colour (`(226,232,240)` dark = `--status-color-fg-gray`, `(55,65,81)` light), with **no fill**; multi-select rows still carry the chip fills `(59,62,67)` and `(63,43,82)` — so the recorded red, "the single-select pill and the multi-select chip share the identical fill `rgb(59,62,67)`", is resolved and that fill now appears on multi-select only. **Contrast measured, not asserted:** all 16 option foregrounds clear 4.5:1 against both record-sheet backgrounds (`#ffffff` light, `#1e1e1e` dark, both sampled off the captures) — lowest light `yellow` **6.85:1**, lowest dark `indigo` **11.18:1**, none below the floor. One caveat recorded rather than hidden: the `status-color-text-*` palette this leg added to `styles.css` is currently **unreachable in the product** — `renderOptionValue` is its only writer and has no non-test caller, so the shipped split comes entirely from the direct-child `.status-badge` override. The palette is the CSS half of a primitive built ahead of its consumer, which is the same footing `renderOptionValue` itself already sits on; it is not load-bearing today and the earlier wording implied it was | Met | - |
| AC-003 | REQ-003 | **Given** a record whose view hides columns, **When** the record sheet opens, **Then** a hidden-properties group renders with a count, toggling it reveals the hidden rows, and the group's expanded state survives a field-commit refresh | Unit test on expanded-state survival across `renderContent` re-runs; lane row asserting the group's presence and count. **Today, re-measured 2026-09-05:** **no group on the record sheet** — `sed -n '399,410p' src/views/record-detail-panel.ts` shows empties still filtered wholesale by `showEmptyFields` (now `:408`, drifted from `:387-396`) and `rg -n 'hidden-group' src/views/record-detail-panel.ts` returns 0 matches; the group exists only on the peek, unchanged at `table-record-peek.ts:259-278`, where its label `t("panel.hiddenProperties")` (`src/i18n.ts:549`) carries **no count**. **Provenance corrected by ADR-004**: this criterion is **ours**, not adopted — Anytype has no hidden group and no count on either platform (`design-trueup.md` C3), so no capture may be cited for it and AC-010 does not gate it. **Today, re-measured 2026-09-06 after T030:** the group now exists — `record-detail-panel.ts` builds one `createHiddenPropertiesGroup` (`record-surface/hidden-properties.ts`) per panel-open session, held outside `renderContent`'s closure the same way `bodyText` is, and renders it after the visible fields carrying `t("panel.hiddenProperties", {count})`. The primitive's own survival-across-a-re-render behaviour is unit-tested (`hidden-properties.test.ts`, T021); this leg added no record-detail-panel-specific test or lane row proving the *wiring* survives a real field-commit refresh, and no capture currently shows the group populated (every scenario that mounts `record-detail-panel.ts` sets `showEmptyFields: true`, which empties the hidden set) — recorded as unproven rather than assumed | Unmet | - |
| AC-004 | REQ-004 | **Given** an empty relation, select or multi-select property on the record sheet or a board card, **Then** the row renders an add affordance whose click opens the same editor an occupied row opens, and **no** surface renders the word "Empty" in place of that affordance where an editor exists | Lane row clicking the affordance and asserting the editor mount equals an occupied row's editor mount. Negative control: restore the "Empty" placeholder text, require red. **Today, re-measured 2026-09-05:** **the word "Empty" renders** — `sed -n '655,659p' src/views/record-detail-panel.ts` shows `getEmptyDisplayValue` now at `:655` (drifted from `:636`), still returning `t("common.empty")`; `rg -n '"common.empty":' src/i18n.ts` → `:77` → `"Empty"`. **Today, re-measured 2026-09-06 after T030:** on the record sheet, "Empty" is gone for the three named formats — `getEmptyDisplayValue` now calls `getPropertyEmptyPrompt` (`record-surface/property-row.ts`), returning "Select option" (select), "Select options" (multi-select, relation); read on the regenerated `constructed-record-detail-desktop-dark.png`, a still-empty text field ("Notes") correctly keeps the plain word, which is outside this criterion's three named types. Clicking an empty field already opened the same editor an occupied one does before this leg — `renderCardField`'s click/keydown wiring was never gated on emptiness — so that half needed no change. **Board cards still render "Empty"** — `board-renderer.ts` was not touched, outside this leg's named consumer set — so "no surface" is not yet true; recorded as the remaining gap rather than closed by the record sheet's fix alone | Unmet | - |
| AC-005 | REQ-005 | **Given** the five type-list sites (create-property modal, conflict modal's per-writer dropdowns, relation/rollup modal, formula modal's output dropdowns, column-menu type submenu), **Then** all five read the P7 picker, the census reads **1** type list, the picker is **search-first**, the current value is marked by a **checkmark** rather than a row fill, and a format that does not apply renders **disabled with its reason** rather than being omitted | Census over the five sites' rendered options, asserting every site offers the **same unfiltered set**. Negative control: inline a thirteenth-format list at one site, require red; second control: restore a filtered subset at the conflict modal, require red. **Today, re-measured 2026-09-05:** **1 list + 1 filtered subset + 1 submenu**, not 3 lists — `rg -n -e '^const PROPERTY_TYPES' -e '^function getTypeOptions' src/views/modals/create-property-modal.ts src/views/modals/property-type-conflict-modal.ts` → `create-property-modal.ts:48-52` declares 13 types (unchanged), `property-type-conflict-modal.ts:377-380` returns a **9-of-13 or 5-of-13 subset** of them (unchanged from the citation), `column-menu.ts:115-126`'s type submenu (`showColumnTypePopover`) is the third site. **Restated by ADR-004**: the draft's "3 lists" cannot be observed, because the middle site is a filter and its fix is a gate rather than a merge (`design-trueup.md` C7). **Today, re-measured 2026-09-06 after T040/T050:** 4 of the 5 named sites now read `record-surface/type-picker.ts`'s `buildTypePickerOptions` — `create-property-modal.ts` (search-first, added), `property-type-conflict-modal.ts` (its filtered subset now `conflictWriterGate`, disabling rather than omitting), `formula-modal.ts`'s one output-type dropdown (`resultTypeGate`; the row's own `:443`/`:454` citations name dropdowns that do not exist in the current tree — corrected, not a gap), and `column-menu.ts`'s grouped type submenu (already unfiltered with a checkmark; now sourced from `PROPERTY_TYPES` instead of a second literal). **`relation-rollup-config-modal.ts` has no type dropdown at all** — its three `createDropdownField` calls pick a relation field, a target field and an aggregation, never a property type — so the fifth named site does not apply; census reads **1 module across the 4 sites that have a type list**, the fifth being a corrected premise. No unit test asserts these sites' option lists; `type-picker.test.ts` covers the shared gating logic they all delegate to | Unmet | - |
| AC-006 | REQ-006 | **Given** every column type, **Then** an exported editor primitive exists per type behind `CellRenderer.startEdit`, the pinned dispatch test passes, and a lane mounts the option and relation editors without constructing `CellRenderer`; the relation editor's phone header and virtualized list behave as today | The pinned dispatch unit test (red before L6: no exported editors) plus a lane mounting two editors standalone. **Today, re-measured 2026-09-05 after the primitives landed:** **0 exported editor primitives** — `ls src/views/record-surface/cell-editor-*.ts` returns only `cell-editor-contract.ts` and its test, so no `cell-editor-<type>.ts` module exists for any of the ten module-backed types. (The earlier measurement read `test -d src/views/record-surface` → absent; the directory now exists, which is why the check moved to the editor modules themselves rather than the folder.) `rg -n -e 'private editOptionPopover' -e 'private editRelationPopover' -e 'private editDatePopover' -e 'private editText' -e 'private editTextPopover' -e 'private editSingleLinePopover' -e 'private editNumber' src/views/cell-renderer.ts` → **7** private methods still on the class at `:899`, `:1106`, `:1596`, `:1787`, `:2294`, `:2353`, `:2658` (the earlier cell said 8; that counted pattern hits, and `private editText` also matches `private editTextPopover`, so the line count is 7); `wc -l src/views/cell-renderer.ts` → 3,152 lines, unchanged; `cell-renderer.ts:644` still the `startEdit` dispatch. **Re-measured 2026-09-06 after T061-T063 (this leg).** `ls src/views/record-surface/cell-editor-*.ts` now returns seven files: `cell-editor-contract.ts`, `cell-editor-date.ts`, `cell-editor-number.ts`, `cell-editor-option.ts`, `cell-editor-relation.ts`, `cell-editor-shared.ts`, `cell-editor-text.ts` — all ten module-backed types resolve to a real module (`cell-editor-contract.test.ts`'s own "every module-backed type resolves" case is green with an empty `missing` list). The five wrapper methods stay on `CellRenderer` at `:887` (`editRelationPopover`), `:903` (`editOptionPopover`), `:917` (`editNumber`), `:1090` (`editDatePopover`), `:1103` (`editText`) — each now a one-line delegation to the extracted function via a `CellEditorContext` the class builds per call (`buildCellEditorContext`), not a rewrite: every Escape funnel, IME guard, drag-reorder and session-close branch moved unchanged. `editTextPopover` and `editSingleLinePopover` are no longer private methods at all — the first is a module-local function in `cell-editor-text.ts` (still reachable, since `openTextEditor` dispatches to it exactly as `editText` did), and the second (the shared single-line-popover primitive `editNumber`, the bulk-session text branch and `editFileName` all called) is now the exported `openSingleLineEditor`. `wc -l src/views/cell-renderer.ts` → **1,217 lines**, down from 3,152 — a 61% reduction, the bulk of it the five editor bodies plus their now-shared helpers (`bulkAnchorRect`, `showValidationError`, `renderDraftFailure`, `clearTransientClass`, `normalizeCellValueForSave` moved to `cell-editor-shared.ts`; `positionOptionPopover`/`createOptionDragPreview`/etc. moved into `cell-editor-option.ts`; `positionDateEditPopover` into `cell-editor-date.ts`; `positionTextEditPopover`/`mountInput`/`autoGrowTextarea`/`buildMarkdownToolbar`/`wrapSelection`/`attachPasteUrlAsLink`/`handleEditKey`/`restoreTextDisplay`/`shouldUsePopoverEditor` into `cell-editor-text.ts`). The relation editor's phone header (`buildShellHeader`) and virtualized list (`rowHeight 34`, `windowSize 80`) are byte-identical to before, confirmed by `npm run screenshots` recapturing every `cell-renderer.ts`-attributed scenario (44 of them) byte-identical to HEAD. **The one clause not met:** "a lane mounts the option and relation editors without constructing `CellRenderer`" — no lane in this repo does. The DOM-heavy suites in this codebase run under `environment: "node"` with hand-rolled element mocks (`property-row.test.ts`'s own convention), and the option/relation editors' real surface (drag/drop, colour-picker popups, `window.activeDocument`, `requestAnimationFrame`, virtualised scrolling) is past what that convention can stand in for without a large, separately-scoped mocking effort not attempted this pass. The closest available proof that the extracted bodies mount and behave correctly in a real DOM is `tools/live/sheet-grammar.mjs`'s pre-existing stacked-pair rows (`record select value menu`, `record relation editor`), both re-confirmed green after the extraction (T064), plus the full-corpus screenshot re-capture. `npx tsc --noEmit`, `npx vitest run` (1392/1392 across 128 files) and `npm run build` all pass; `npm run gate` is **26 green, 0 red**, exit read from `$?`. **Re-verified at landing 2026-09-06 on the rebased tree, with two repairs.** The count is **1,217** lines, not 1,212. The pinned dispatch test did not hold as written — deleting the whole select/status branch out of `startEdit` left it green, because it matched its needle anywhere in `cell-renderer.ts` and `startEditSession` carries the same strings; it now slices `startEdit`'s own body, requires the branch's own call inside it, checks each module declares the export the contract names and checks the class reaches it, with three negative controls observed red then restored. Behaviour preservation is now proved independently of the byte comparison: a normalised multiset diff of the pre- and post-extraction sources leaves only `private x(` → `function x(` and `this.activeX = y` → `ctx.setActiveX(y)` plumbing, and the `db-` class vocabulary is identical at 91 tokens in and out. The standalone-mount clause is still the only thing holding this row | Unmet | - |
| AC-007 | REQ-007 | **Given** the properties panel and the board-card properties panel, **Then** their rows consume P2's checkbox variant and the add row consumes P3, and their mechanisms — drag reorder, shift range select, per-view card list — behave as `045`'s tests assert | `045`'s existing board-card tests and the panel's range-select tests pass unchanged; lane row on the add row. Today: the two files duplicate the row builder and the `shouldIgnoreDrag` helper (`column-manager-renderer.ts:378`, `board-card-properties-panel.ts:159`). **Today, re-measured 2026-09-06 after T041/T042:** both files now call `buildCheckboxPropertyRow` (`record-surface/property-row.ts`) for their rows, retiring both duplicated row builders and both copies of `shouldIgnoreDrag` in favour of the shared `shouldIgnorePropertyRowDrag`; `045`'s existing board-card tests and `board-card-properties-panel.test.ts`'s five cases pass unchanged against the new construction. **The add row consumes P3 only at `column-manager-renderer.ts`** — its "+ Add property" button now opens a popover hosting `buildAddPropertyRow` over P7's format list. `board-card-properties-panel.ts` has no add-row of its own to switch — it is a fixed reorderable list of the columns already on the board card, not a place properties are created — so that half of this criterion does not apply to it; a corrected premise, not a remaining gap | Unmet | - |
| AC-008 | REQ-008 | **Given** the migration table, **Then** it exists with one row per §5A surface (10) and one per §5B behaviour (7), each surface row naming its primitive, its changes, its Anytype capture filename and what stays ours, and each capture filename resolving under `screenshots/anytype/` | File check against §5A/§5B; every named capture resolved. **This row gates SC-001's design claims** | **Met** — `migration-table.md` exists: 10 surface rows (S1-S10) and 7 behaviour rows (A1-A7), each naming its primitive(s), its changes, a related capture citation (or the named absence for A7/S6/S7/S10) and what stays ours. Every cited capture's basename resolves under `screenshots/anytype/` (checked 2026-09-05 against the tree's actual `desktop/menus/`, `desktop/app/` and `mobile/sheets/` subfolders, cited in `design-trueup.md`'s own shorthand form) | - |
| AC-009 | REQ-009 | **Given** the note body on the record sheet, **Then** it is mounted through the P6-host region after the property rows, a draft survives a refresh mid-edit, and `note-body-region.test.ts` passes unchanged | The existing test run plus a lane row asserting mount order (body after rows). Today: already true in code (`record-detail-panel.ts:290-303`) — this row freezes it as the primitive's contract so a later surface refactor cannot quietly reorder it | Unmet | - |
| AC-010 | §5B | **Given** the Anytype capture set, **When** T001 has read the named images by hand, **Then** every §5B behaviour row carries its image-true-up (adopted / adapted / rejected-with-reason) or its named gap, and **no** §5B design row was implemented before its image was read | **`design-trueup.md`** is T001's record, as it is in `050` and `055`; `migration-table.md` (T003) consumes it and is gated by AC-008 instead. Evidence: §3 carries all seven behaviour rows against 31 named captures, §4 the S9 editor taxonomy, §6 the seen/not-seen roll-up. **A4 is the one row with no reference screen** and is named as such rather than guessed; `menus/anytype-menu-cell-type-dark.png` is the one file that could not be read (its menu fell outside the crop) and the row does not depend on it. Zero §5B design rows have been implemented. **This row gates every design row** (goal D1) | **Met** | - |
| AC-011 | All | **Given** the gate, **When** `npm run gate` runs to completion and its status is read from `$?`, **Then** it exits **0** with one permanent lane row per primitive, each negative control observed **red then green**; `npm run replay` holds with reversed 0; and the board-card reference captures are unchanged after L3 or the difference is operator-ruled | `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0; the replay's reversed count; the reference recapture diff | Unmet | - |
| AC-012 | All | **Given** a released build, **When** the operator opens a record on iOS and on desktop, **Then** they read the sheet as one object page — header, properties, add affordance, hidden group, note body — and report it against the Anytype object page the directive named | The operator's own words. **Only the operator closes this row; nothing in this repository can** | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

**AC-010 is Met.** T001 read 31 named captures — the 25 `anytype-menu-object-*` object-page menus,
the 12 `anytype-menu-cell-*` grid-cell editors, the iOS relations panel with its per-format editors
and its property-management sheet, and the catalogue grids — and recorded every §5B row's disposition
in `design-trueup.md`. That was the row that had to move first, because the captures are the evidence
the design rows claim to copy and a design adopted from a prose summary is the exact guess D1 exists
to prevent. It earned its keep: **nine contradictions**, three of them structural — A2's stated
anatomy is wrong on both halves, A4's hidden group does not exist in the product, and A5 reverts from
code-derived to captured.

**Three rows were restated rather than measured, and could not have been observed red as written**:
AC-002 (the anatomy the census is meant to converge on), AC-003 (its provenance — the criterion is
ours, not adopted) and AC-005 (the "3 lists" figure, which is 1 list plus 1 filter plus 1 submenu).
ADR-004 carries all three. The remaining rows' Today cells were checked against the tree and stand.

**AC-008 is Met.** `migration-table.md` now exists, consuming `design-trueup.md` §3/§4 rather than
re-reading the captures, with the ten-surface and seven-behaviour rows AC-008 asks for. The
primitives module family the table's surface rows point at — `record-surface/record-header.ts`,
`property-row.ts`, `add-property-row.ts`, `hidden-properties.ts`, `type-picker.ts`,
`cell-editor-contract.ts` — is built beside its consumers, with `card-field-renderer.ts` already a
re-export shim over `property-row.ts`'s display value renderer.

**2026-09-06 — L3, L4 and L5 switched their named consumers onto the primitives (T030-T032,
T040-T042, T050).** `record-detail-panel.ts` and `table-record-peek.ts` now build their header
through P1, their rows through P2 (the peek's shell only — its option values stay its own callback,
display-only by design), the record sheet's empty relation/select/multi-select fields through
`getPropertyEmptyPrompt` (REQ-004's three named types), and the record sheet carries a P5 hidden
group. `column-manager-renderer.ts` and `board-card-properties-panel.ts` now build their rows
through P2's checkbox variant; `column-manager-renderer.ts`'s add-property button now opens a
popover over P3. Four of the five REQ-005 sites now read P7 (`type-picker.ts`); the fifth
(`relation-rollup-config-modal.ts`) has no type dropdown to switch, a corrected premise. **AC-002 is
Met** — the record sheet's desktop values are left-aligned and the single-select/multi-select split
ships, read on the regenerated captures by an image-capable leaf, closing the pixel read ADR-005
left owed. The verify-and-land pass on 2026-09-06 found that claim held for the text values but
**not** for the three multi-select rows, still right-pinned at x 263.0 because
`.db-board-card-badges` carries `justify-content: flex-end` and `text-align` cannot reach a flex
main axis; one scoped `justify-content: flex-start` closed it, taking the value-left spread from
**125.0px to 5.5px** across all 21 rows. The row is Met on the re-measured figures, not the earlier
ones. **AC-001, AC-003, AC-004, AC-005 and AC-007 stay Unmet**: each moved its Today figure
toward its threshold (see each row), but none reaches "1" or "no surface" outright — `db-modal.ts`'s
header, board card's empty-value word and right-alignment, and
`relation-rollup-config-modal.ts`'s absent type list are named gaps outside this leg's consumer set,
not oversights. `npx tsc --noEmit`, `npx vitest run` (1388/1388 across 128 files) and `npm run build` all pass;
`npm run gate` is **26 green, 0 red**, exit read from `$?`; `npm run screenshots:verify` is green with every changed capture
opened and read. Board, gallery, list, table, calendar, timeline and project-manager reference
captures are confirmed `pixelHash`-identical to HEAD (checklist.md C9).

AC-012 is the operator's and is the only row that closes the ask behind the phase (parent D3).

**2026-09-06 — L6's editor extraction landed (T060-T064).** All ten module-backed column types now
resolve to an exported module under `record-surface/` (`cell-editor-option.ts`,
`cell-editor-relation.ts`, `cell-editor-date.ts`, `cell-editor-text.ts`, `cell-editor-number.ts`,
plus the shared `cell-editor-shared.ts` context and helpers); `cell-renderer.ts` fell from 3,152 to
1,217 lines. **AC-006 moved but stays Unmet**: the pinned dispatch test is green and every editor
body moved unchanged (ADR-002), but no lane mounts the option or relation editor without
constructing `CellRenderer` — that clause is narrowed rather than closed, and the row explains why
(the repo's node-environment DOM-mock convention cannot stand in for these editors' real surface).
T064's own proof — the pre-existing `record select value menu`/`record relation editor` stacked-pair
rows in `tools/live/sheet-grammar.mjs` — was re-run and stays green after the extraction, confirming
`048`'s stacking contract is undisturbed. T070 and T071 were attempted: T070's four named
retirements (the peek's row shell, `PROPERTY_TYPES`/`getTypeOptions`, the duplicated
`shouldIgnoreDrag` helpers) were already complete from earlier legs and re-confirmed by source read;
T071's registration of `column-manager` into `sheet-grammar.mjs`'s full grammar check surfaced a
real, pre-existing gap (`rows: false` — the properties panel's row class does not match the shared
grammar's selector) and was reverted rather than papered over, since fixing it needs a `styles.css`
change and recapture cycle outside this leg's file group. `npx tsc --noEmit`, `npx vitest run`
(1392/1392 across 128 files) and `npm run build` all pass; `npm run gate` is **26 green, 0 red**,
exit read from `$?`; a full `npm run screenshots` moved 0 of 558 entries' pixels (only
`sourceHashes` and two unrelated pre-existing `layoutHash` entries changed) — the strongest evidence
yet that a componentization pass changed structure without changing a single rendered pixel.

**2026-09-06 — T011/T023's census gap closed as a source census (ADR-007), T070 closed on it, T071
landed as an amendment.** `tools/live/surface-census.mjs` gained a source-level census (§6b) rather
than a new lane file: it counts calls to the shared header/row builder functions
(`buildDesktopRecordHeader`, `buildPhoneRecordHeader`, `buildPropertyRow`, `buildCheckboxPropertyRow`,
`renderCardField`) against direct hand-built construction of the primitives' own default header/row
classes, scoped to the three surfaces this leg names: `record-detail-panel.ts` (header builder
calls 1, row builder calls 1), `table-record-peek.ts` (1, 1), `board-card-properties-panel.ts` (0
header calls — no header on this surface by design, 1 row call). **Observed red first**: a
hand-built `.db-column-manager-row` `createDiv` temporarily added to
`board-card-properties-panel.ts` (bypassing `buildCheckboxPropertyRow`) read `node tools/live/
surface-census.mjs` → 1 hand-built header/row, exit 1; reverted, the same command reads **0**, exit
0. `checklist.md` C15 carries the counts. This closes T011/T023's own proof clause and, with it,
T070's — the "census lane reads 1/1/1" clause T070 was blocked on now has an observable to read
against, and reads 0 hand-built across the three named surfaces (T070's four named retirements were
already complete from source, confirmed again here). **T071 landed rather than staying reverted**:
the operator ruled to amend the predicate (`decision-record.md` ADR-006) — `hasPaddedRows`
(`sheet-grammar.ts:99`) now accepts `.db-column-manager-row`, `column-manager` is registered into
`sheet-grammar.mjs`'s full eight-column check, and `node tools/live/sheet-grammar.mjs` reads
`column-manager` 8/8 green with `settings` and `board-card-properties` still 8/8 green (measured,
not skipped) and the whole lane at exit 0. **AC-001, AC-002, AC-005 and AC-007 are unaffected by
this landing** — their own family-wide counts stay hand counts over four/five consumers, a broader
scope than this census's three named surfaces; C15 does not supersede C1/C2/C14, it is the
narrower, real infrastructure ADR-007 amends D3's observable to.

<!-- /ANCHOR:closure -->
