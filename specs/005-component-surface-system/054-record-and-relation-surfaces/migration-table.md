---
title: "Migration Table: Record and Relation Surfaces"
description: "One row per surface this family owns and one per Anytype behaviour it was measured against, each naming its primitive, what changes, and what stays ours."
trigger_phrases:
  - "054 migration table"
  - "record surface migration"
  - "surface to primitive mapping"
importance_tier: "high"
contextType: "planning"
---
# Migration Table: Record and Relation Surfaces

<!-- SPECKIT_TEMPLATE_SOURCE: migration-table | v1 -->

> Consumes `spec.md` §5A (the ten-surface inventory) and §5B (the seven Anytype behaviours),
> read through `design-trueup.md` §3 and §4 rather than re-reading the captures. Every capture
> filename below was verified to resolve under `screenshots/anytype/` by T001; this table adds
> no new claim about what a capture shows.

---

<!-- ANCHOR:surfaces -->
## 1. SURFACES (§5A) — ten rows, one per surface this family owns

| # | Surface | Primitive(s) | Changes | Related Anytype capture(s) | Stays ours |
|---|---------|--------------|---------|------------------------------|------------|
| S1 | Record sheet (`record-detail-panel.ts`) | P1 (header), P2 (rows), P3 (add affordance), P5 (hidden group), P6-host (note body, already extracted) | Header switches onto P1's desktop variant with the same DOM; empty relation/select/multi-select rows gain the add affordance in place of "Empty"; a hidden-properties group appears where none exists today | A1: `anytype-object-page-empty-dark.png`; A2: `menus/anytype-menu-object-properties-panel-dark.png`; A3: `menus/anytype-menu-object-relation-file-dark.png`; A4: `mobile/anytype-mobile-sheet-object-properties-settings-dark.png` (the disposition it does **not** adopt) | The desktop anchored panel's DOM under `006`'s resolver; the note body's mount order after the property rows; `showEmptyFields` as the render/not-render switch |
| S2 | Table record peek (`table-record-peek.ts`) | P1 (desktop rail variant), P2 (display variant), P5 (its own group, moved unchanged) | Its private `renderProperty` body retires in favour of P2's display variant; its hidden group becomes P5, same class names, same ARIA, now with a count | A2: `mobile/anytype-mobile-sheet-object-properties-dark.png`; A4: `mobile/anytype-mobile-sheet-object-properties-settings-dark.png` | Display-only by design — no editor entry point is added |
| S3 | Properties panel (`column-manager-renderer.ts`) | P1 (phone/desktop header, already split), P2 (checkbox variant), P3 (add row), P7 (type list, wired in L5) | Row builder switches onto P2's checkbox variant; add row switches onto P3, with `QUICK_ADD_FILE_FIELDS` staying beside it | A5: `mobile/anytype-mobile-sheet-relation-add-dark.png`; A6: `menus/anytype-menu-object-type-picker-dark.png` | Drag reorder, shift-range select, the phone/desktop header split it already has |
| S4 | Create property modal (`create-property-modal.ts`) | P7 (type list) | Its `PROPERTY_TYPES` dropdown is wired to P7 in L5; the modal's own label/key form is untouched | A6: `mobile/anytype-mobile-sheet-relation-new-format-dark.png` | The modal shell, the key-collision and file-field-name checks in `confirm()` |
| S5 | Property type conflict modal (`property-type-conflict-modal.ts`) | P7 (type list, gated) | `getTypeOptions`'s filtered subset becomes a **gate** on P7's full list (disabled rows carrying a reason) rather than a second list, per A6's correction | A6: `menus/anytype-menu-object-type-picker-change-type-dark.png` | The conflict-resolution flow itself; the writer table |
| S6 | Relation/rollup config modal (`relation-rollup-config-modal.ts`) | P7 (type dropdowns only) | Its three `createDropdownField` type dropdowns wire to P7 | None — A7 is not seen anywhere in the sweep | The aggregation list (12 options) and the impact preview — ADR-003 |
| S7 | Formula modal (`formula-modal.ts`) | P7 (output-type dropdowns only, `:274`/`:443`/`:454`) | Wiring only | None — A7 is not seen anywhere in the sweep | The 1,664-line workbench, its editor and preview — ADR-003, A7 |
| S8 | Board card properties panel (`board-card-properties-panel.ts`) | P2 (checkbox variant) | Row builder switches onto P2's checkbox variant, retiring its own copy of `column-manager-renderer.ts`'s row shape | A3: `menus/anytype-menu-object-relation-file-dark.png` (the empty-row prompt this surface's fields gain) | The visibility-toggle-only mechanism; `045`'s card-hiding contract |
| S9 | Cell editors (`cell-renderer.ts`) | P4 (one module per type behind `startEdit`, pinned by `cell-editor-contract.ts`) | Nine editor bodies move into `record-surface/cell-editor-*.ts` unchanged, one per leg; checkbox stays a toggle (no editor primitive, S9 finding #2) | The S9 taxonomy's 12 `menus/anytype-menu-cell-*-dark.png` and 12 iOS per-format editor captures (`design-trueup.md` §4) | `startEdit`'s dispatch contract; every accumulated defect fix inside a moved body (Escape funnels, IME guards, session close routing) |
| S10 | Note body region (`note-body-region.ts`) | P6-host (name only — already extracted and tested) | None expected; this row freezes the mount-after-rows contract so a later refactor cannot reorder it silently | None — no capture in the sweep shows a note body | `mountNoteBodyRegion`'s debounced-commit and caret-resume behaviour |

<!-- /ANCHOR:surfaces -->

---

<!-- ANCHOR:behaviours -->
## 2. BEHAVIOURS (§5B) — seven rows, one per Anytype behaviour measured

Each disposition and capture citation is `design-trueup.md`'s (§3, §4), not re-read here.

| # | Behaviour | Capture(s) | Disposition | What stays ours |
|---|-----------|------------|--------------|------------------|
| A1 | Object-page header: icon, title, featured relations inline under the title | `anytype-object-page-empty-dark.png`, `mobile/anytype-mobile-object-page-dark.png`, `menus/anytype-menu-object-featured-tag-dark.png` | **Adapted.** The featured-relations line (inline, middot-separated, secondary colour) is adopted into P1's job list for a later leg; the placement rule (properties off the object page) is named as a deliberate divergence, not adopted — S1 *is* the properties surface | Open-note button, our title-field resolution, our panel type sizing |
| A2 | Relation row layout: label, value, one row per relation | `menus/anytype-menu-object-properties-panel-dark.png`, `mobile/anytype-mobile-sheet-object-properties-dark.png`, 7× `menus/anytype-menu-object-relation-*-dark.png`, 120 catalogue grids | **Adapted.** P2's anatomy corrected to label-then-value, value left-aligned, no format icon, equal type size with colour carrying hierarchy, single-select as coloured text / multi-select as filled chip (built in `property-row.ts`, not yet wired to a consumer) | Our option palette, conditional formatting, rating/progress/ring displays, the board card's own right-alignment (`038` parity, goal D5) |
| A3 | Empty value affordance | `mobile/anytype-mobile-sheet-cell-multiselect-empty-dark.png`, `-cell-email-empty-dark.png`, `-grid-cell-objecttype-empty-dark.png`, `menus/anytype-menu-object-relation-file-dark.png` | **Adapted.** The second rung only (a format-specific prompt naming the action, on the record sheet and board cards) — not a `+` button, and the grid keeps rendering nothing | `showEmptyFields`'s show/hide switch; Anytype's placeholder greys refused (2.49:1, 2.88:1 — below the 4.5:1 floor) |
| A4 | Hidden relations group with a count | `mobile/anytype-mobile-sheet-object-properties-settings-dark.png` | **Rejected-with-reason, provenance corrected.** No reference screen exists on either platform — the surface that would carry one splits into a `Header`/`Properties panel` model instead, which is a type-level authoring decision goal D6 puts out of scope. P5 ships as **ours**, moved from the peek's existing disclosure, not adopted from Anytype | The peek's working ARIA disclosure, unchanged in shape |
| A5 | Add-relation search-first picker | `mobile/anytype-mobile-sheet-relation-add-dark.png`, `-new-dark.png`, `-new-format-dark.png`, plus 3 corroborating pickers | **Adopted.** Search field carrying create (placeholder names both jobs), formats before existing candidates — built in `add-property-row.ts` as a filtered format list plus a create fall-through, adapted to a data model with no cross-record "existing properties" to browse | `QUICK_ADD_FILE_FIELDS`'s quick-add row, staying beside the picker rather than replaced by it |
| A6 | Type change flow, one type list | `menus/anytype-menu-object-type-picker-dark.png`, `-change-type-dark.png`, `mobile/anytype-mobile-sheet-relation-new-format-dark.png` | **Adopted, deferred to L5.** P7 (not built this leg) will be the one search-first list behind all five sites, gated rather than filtered, with a checkmark for the current value | Our thirteen-type set and its order; no format Anytype has that we lack is added |
| A7 | Formulas, rollups, aggregations | Absence across 874 captures; `screenshots/anytype/README.md` | **Rejected-with-reason (ADR-003).** Nothing to adopt — Anytype has neither surface | The formula workbench, the rollup aggregation list, the computed engine, entirely |

<!-- /ANCHOR:behaviours -->

---

<!-- ANCHOR:status -->
## 3. STATUS AT THIS LEG'S CLOSE

**2026-09-05, primitives built beside their consumers, switching none of them:**
`record-surface/record-header.ts` (P1), `property-row.ts` (P2, with `card-field-renderer.ts` a
re-export shim over its display value renderer), `add-property-row.ts` (P3),
`hidden-properties.ts` (P5), and `cell-editor-contract.ts` (the pinned `startEdit` dispatch, ahead
of P4's extraction). No existing capture moved.

**2026-09-06, L3/L4/L5 switched (T030-T032, T040-T042, T050):** S1 (`record-detail-panel.ts`) and
S2 (`table-record-peek.ts`) now build through P1/P2, S1 additionally through P3's empty-value
prompt and P5's hidden group; S3 (`column-manager-renderer.ts`) and S8
(`board-card-properties-panel.ts`) now build through P2's checkbox variant, S3 additionally
through P3's add-property popover; `type-picker.ts` (P7) was built and wired into S4
(`create-property-modal.ts`), S5 (`property-type-conflict-modal.ts`), S7 (`formula-modal.ts`,
one output dropdown, not the three the row named) and the column-menu type submenu (not its own
numbered surface). **S6's row is corrected**: `relation-rollup-config-modal.ts` has no type
dropdown to wire — its three `createDropdownField` calls pick a relation field, a target field
and an aggregation — so P7 does not reach it. Every changed capture (28, all under
`screenshots/notion-clone/panels/`) was regenerated and read; board, gallery, list, table,
calendar, timeline and project-manager reference captures are confirmed `pixelHash`-identical
(`tools/lane/css-lane.json`'s 2026-09-06 release entry). S9 (`cell-renderer.ts`'s editors, P4) and
S10 (the note body, already extracted) are untouched — L6/L7 remain.

<!-- /ANCHOR:status -->

---

<!-- ANCHOR:open-questions -->
## 4. THE THREE OPEN QUESTIONS (`design-trueup.md` §5)

| Question | Answer |
|---|---|
| Does the record sheet's desktop anchored panel keep its current DOM under P1? | Yes. The panel's *placement* belongs to `006`'s resolver, not this packet; P1 changes the header's DOM and nothing about where the panel lands. |
| Does P3's search-first picker sit beside or replace S3's quick-add file-field row? | Beside. The picker leads with the format question; the quick-add row is a shortcut past that question for a fixed set, not a competing control. |
| Does a board card gain the add-property affordance? | The format-specific prompt, yes; a button, no. A grid cell — the densest surface — renders nothing for an empty value, and a board card is nearer that than a property list. |

<!-- /ANCHOR:open-questions -->
