---
title: "Verification Checklist: Record and Relation Surfaces"
description: "The primitive and migration thresholds with the failing measurement recorded first, so a pass means a surface actually changed rather than a check being added."
trigger_phrases:
  - "054 checklist"
  - "record surface verification"
  - "primitive thresholds red first"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Record and Relation Surfaces

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

One row per threshold, numbered to match the acceptance criteria. Counts are read by the census
lane — one page rendering the same column through every consumer — never by grep, which a renamed
class defeats. Desktop on the real renderer; phone on a 390×844 profile with a navbar present.

**T002 fills every `Today` cell.** A "today" cell written after the fix is a cell nobody can check
against the tree that produced it.

| # | Criterion | Today | Target | Evidence |
|---|-----------|-------|--------|----------|
| C1 | Distinct header builders across the record sheet, the peek and the properties panel | **2, re-measured 2026-09-06** — `record-detail-panel.ts`, `table-record-peek.ts` and `column-manager-renderer.ts`'s desktop branch now all call `buildDesktopRecordHeader` (`record-surface/record-header.ts`), the phone branches all call the pre-existing shared `createSheetHeader`; only `db-modal.ts:82`'s `getSheetTitle` scrape (out of this leg's named consumer set) still builds its own. `rg -n -e 'cls: "db-record-detail-header"' -e 'db-record-peek-header"' -e 'cls: "db-panel-header"' -e 'protected getSheetTitle' src/views/record-detail-panel.ts src/views/table-record-peek.ts src/views/column-manager-renderer.ts src/views/modals/db-modal.ts` now returns 0 hits in the three switched consumers and 1 in `db-modal.ts` | **1** (the P1 primitive) | [ ] |
| C2 | Distinct property-row vocabularies across the family | **1 module, 4 call sites, re-measured 2026-09-06** — `card-field-renderer.ts` (the pre-existing shim), `table-record-peek.ts`'s `renderProperty` and `column-manager-renderer.ts`/`board-card-properties-panel.ts`'s row builders now all call into `record-surface/property-row.ts` (`buildPropertyRow` for the peek, `buildCheckboxPropertyRow` for the two properties panels), retiring the peek's own row-shell construction and the two panels' duplicated drag/move/checkbox DOM and their duplicated `shouldIgnoreDrag` helper (now `shouldIgnorePropertyRowDrag`, one copy) | **1** (P2), with the peek's badge-fix copy retired | [ ] |
| C3 | Distinct property-type lists | **4 of 5 sites on P7, re-measured 2026-09-06** — `create-property-modal.ts`, `property-type-conflict-modal.ts` and `formula-modal.ts`'s dropdowns, plus `column-menu.ts`'s grouped type submenu, now all source from `record-surface/type-picker.ts`'s `PROPERTY_TYPES`/`buildTypePickerOptions`; the conflict modal's filtered subset is now a gate (disabled + reason) rather than a shorter list, matching A6/C7's correction. `relation-rollup-config-modal.ts` has no type dropdown at all — its three `createDropdownField` calls are a relation-field picker, a target-field picker and an aggregation picker, none a property-type list — so the row named for it in T050 does not apply; this is a citation correction, not a gap | **1** (P7) across all five consumer sites | [ ] |
| C4 | Hidden-properties group on the record sheet | **present, re-measured 2026-09-06** — `record-detail-panel.ts` now builds `createHiddenPropertiesGroup` (P5) once per panel session and renders it after the visible fields with a `t("panel.hiddenProperties", {count})` label; the group survives a `renderContent` re-run because the handle is held outside that closure, the same way `bodyText` is | present with a count; expanded state survives a refresh | [x] |
| C5 | Empty relation/select/multi-select affordance on the record sheet and board cards | **format-specific prompt, re-measured 2026-09-06** — `record-detail-panel.ts`'s `getEmptyDisplayValue` now calls `getPropertyEmptyPrompt` (`record-surface/property-row.ts`), returning "Select option" / "Select options" / "Select options" for select/multi-select/relation; every other empty format still reads `t("common.empty")`, which is correct — REQ-004 scopes to these three. Board cards (`board-renderer.ts`) were not touched — out of this leg's named consumer set — so the word "Empty" still ships there; recorded as a gap rather than silently left | an add affordance opening the occupied row's editor; "Empty" gone where an editor exists | [ ] |
| C6 | Exported per-type editor primitives | **0, unchanged** — cell-renderer.ts and the editors are this leg's explicit exclusion (T061-T064 are a different leg's) | one exported module per type; the pinned dispatch test green; two editors mountable standalone | [ ] |
| C7 | `renderCardField`'s four external callers after the shim | all working today through the private copy | same tests green through the P2 shim | [ ] |
| C8 | Properties panel desktop rect after the P1 desktop variant | **x 28.52, y 25.17, w 540.96, h 604.51 at a 1100×900 desktop viewport (table bench, 16 columns, 1 hidden), re-measured 2026-09-05** — throwaway `t002-geometry-measure.mjs` mounts `panel-column-manager/file-view` through `tools/live/render-assertion-bundle.mjs`'s `buildRenderAssertionBundle` and reads `.db-column-manager`'s `getBoundingClientRect()`. Upgrades the row from operator-verified to lane-measured. **Unchanged after T041's switch to P1/P2/P3 (2026-09-06)**: the header's tag changed (span → div for `.db-panel-title`, both flex items) and the row DOM moved through `buildCheckboxPropertyRow`, but no class, no geometry-affecting property and no CSS rule changed for this panel — `npm run screenshots` produced no diff for any column-manager scenario | unchanged, asserted by the lane | [ ] |
| C9 | Board-card reference captures after L3 | **current `pixelHash` baseline, re-read 2026-09-05** — `node -e '...'` over `screenshots/manifest.json` (generated at HEAD `cf5c7e95`, stylesheet fingerprint `styles.css@e2e6314a036a`): `board-view`/`constructed-board` carry 8 hashes across both themes and devices, e.g. `board-view` dark desktop `7d78d926dfe9`; `node tools/screenshots/verify.mjs` → exit 0, "554 entries match their sources", confirming the baseline is current rather than stale. Also read the docked record panel (`panel-record-detail-docked/file-view`, the surface 006's docking changed at `ae46da94`) with the same throwaway script: panel height 876px against a 924px pane (94.8%, above `RECORD_DOCK_MIN_PANE_FRACTION` 0.6), right edge 12px from the pane's right edge (within `RECORD_DOCK_EDGE_TOLERANCE` 13px) — currently green, not a pre-existing red this leg needs to fix. **Confirmed identical after L3's own CSS/DOM switch (2026-09-06)**: `tools/lane/check-lane.mjs`'s `pixelHash` compare over two full `npm run screenshots` passes reports zero content change to any board, gallery, list, table, calendar, timeline or project-manager capture — the record-surface CSS is scoped to `.db-record-detail-field`/`.db-record-peek-field-value` ancestors, which no other consumer's markup carries | identical, or operator-ruled | [x] |
| C10 | `migration-table.md` rows | **exists, 2026-09-05** — 10 surface rows (S1-S10) + 7 behaviour rows (A1-A7), every cited capture's basename resolved under `screenshots/anytype/`; behaviour rows carry `design-trueup.md`'s adopted/adapted/rejected-with-reason disposition | 10 surface rows + 7 behaviour rows, every capture filename resolved; behaviour rows carrying T001's image-true-up disposition | [x] |
| C11 | `npm run gate` exit status with every negative control observed red | not yet run for this phase | exit **0**, each control red then green | [ ] |
| C12 | `npm run replay` | not yet run for this phase | holds with reversed **0** | [ ] |
| C13 | `npm run screenshots:verify` after the retirement sweep | green at HEAD | exit **0**; every changed capture opened and read by a person | [ ] |
| C14 | Census lane reads on headers / rows / type lists at close | 4 / 3 / 3 | **1 / 1 / 1**, with the bypass negative controls seen red | [ ] |

**C1, C2 and C14 are the componentization ask. C4 and C5 are the Anytype object-page ask. C6 is the
edit-surface ask. C11-C13 are the checks that the rest are not theatre.**

### What the captures could not show

The model behind this document could not open image files, so §5B's behaviour designs stand on the
capture index's own descriptions and the research's findings — T001 opens every named image by hand
and records the true-up before any design row is implemented (goal D1, AC-010). A capture that
cannot be opened is recorded as a gap in `migration-table.md`, never silently consumed.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [x] CHK-001 [P0] The surface inventory is read from source, not from prior documents — ten
      surfaces at §5A with constructor `file:line` and header/row/editor citations
- [x] CHK-002 [P0] Every consumer file named in §3's Files-to-Change exists in this tree — checked
      against `src/views/` at authoring time
- [x] CHK-003 [P0] The level is derived, not guessed — `recommend-level.sh --loc 1800 --files 14` →
      Level 2, 50/100, confidence 90%; phase score 10/50 against a 25 threshold, so a standard
      child
- [x] CHK-004 [P0] What may not change is recorded: formulas/rollups/calculations (ADR-003), `044`'s
      grammar, `048`'s stacking, `023`'s note-body decision, `045`'s mechanism, `006`'s resolver,
      the PM 1:1 board and gantt (`spec.md` §3, §5B)
- [x] CHK-005 [P0] The 050 overlaps are references by item number, not duplicates — items 6, 9, 11
      named in `spec.md` §5C with the slice this phase takes
- [ ] CHK-006 [P0] T001 complete: every §5B capture opened by hand, dispositions recorded — 30 of
      the 31 named captures were read and every §5B row carries its disposition, but
      `menus/anytype-menu-cell-type-dark.png` could not be read (its menu fell outside the crop),
      so the row stays unticked on the word **every**. No §5B row depends on that file, which is
      why AC-010 is nonetheless `Met`
- [x] CHK-007 [P0] T002 complete: every Today cell above carries the measured number, **and the
      pixel read ADR-005 owed is now closed**: read on
      `screenshots/notion-clone/panels/constructed-record-detail-desktop-dark.png` (2880×1800, a 2×
      capture, figures below in CSS px) — across the 21 property rows the label left edge holds
      **x 58.0-59.0** on every row, and the value **right** edge holds **x 379.0-379.5** on 19 of
      them, while the value **left** edge is ragged across **x 263-366**. The two rows that break
      the right edge (`added_to`, `note`) are file chips left-aligned at x 143.5. Values are
      right-aligned with a ragged left edge, so AC-002's design half is confirmed **red** on the
      observable the operator kept
- [x] CHK-008 [P0] T003 complete: `migration-table.md` exists and passes AC-008's file check
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:implementation -->
## IMPLEMENTATION

- [x] CHK-010 [P0] The primitives module family exists under `src/views/record-surface/` with
      `index.ts`'s contract table (ADR-001), and no consumer hosts a primitive another consumer
      imports — `record-header.ts`, `property-row.ts`, `add-property-row.ts`,
      `hidden-properties.ts` and `cell-editor-contract.ts` exist. `index.ts` re-exports all five and
      its `RECORD_SURFACE_PRIMITIVES` table carries the **four built primitives** (P1, P2, P3, P5);
      `cell-editor-contract.ts` is the pinned dispatch ahead of P4's extraction rather than a
      primitive, so it is deliberately absent from the table and P4 has no row until an editor
      module lands. `card-field-renderer.ts`'s own value-rendering body was removed in favour of
      calling `property-row.ts`'s `renderPropertyValue`
- [ ] CHK-011 [P0] The editor extraction is mechanical per ADR-002: one editor per leg, the dispatch
      test green before and after each, no behavioural edit inside a moved body — **not started**;
      `cell-editor-contract.ts` pins the dispatch and is observed red (no extracted module exists
      for any of the ten module-backed types), which is the designed starting state, not this
      row's close
- [ ] CHK-012 [P0] Every phone surface added or changed carries `044`'s seven grammar elements, and
      every editor opened over the record sheet obeys `048`'s stacking model (goal D4 posture) —
      not applicable yet; no phone surface has switched onto a primitive this pass
- [x] CHK-013 [P1] The three spec open questions are resolved at T001 and recorded in
      `migration-table.md` §4 (desktop header DOM, quick-add placement, board-card add affordance)
- [x] CHK-014 [P0] ADR-003 held: the formula workbench, rollup aggregation list and computed engine
      untouched except their type dropdowns' wiring — none of `formula-modal.ts`,
      `relation-rollup-config-modal.ts` or the computed engine were touched this pass
- [x] CHK-015 [P0] No new architecture layer: the primitives are DOM builders and moved method
      bodies, not a rendering framework — every export in `record-surface/` is a plain function or
      a small closure-based factory, no class and no persisted state beyond a caller's closure
<!-- /ANCHOR:implementation -->

---

<!-- ANCHOR:verification -->
## VERIFICATION

- [ ] CHK-020 [P0] Every AC in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`, and each
      waiver names an ADR that exists in `decision-record.md`
- [ ] CHK-021 [P0] `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, status read from `$?`
- [ ] CHK-022 [P0] Every threshold's negative control was observed **red** before green, with every
      other row staying green while it was red
- [ ] CHK-023 [P0] `npx tsc --noEmit`, `npm run build` and `npx vitest run` all pass, exit statuses
      read (the repo's three verification gates)
- [ ] CHK-024 [P0] Board-card reference captures `pixelHash`-identical after L3, or operator-ruled
- [ ] CHK-025 [P1] Captures recaptured and read by a person across both themes
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:operator -->
## OPERATOR ROWS — DEVICE CONFIRMATION

Nothing in this repository closes these. An agent never ticks one.

- [ ] OPS-001 [P0] **iOS.** The operator reads the record sheet as one object page against the
      Anytype object page
- [ ] OPS-002 [P0] **Desktop.** The operator reports no surface where a property looks or edits
      differently from the same property on another surface
- [ ] OPS-003 [P0] **Both.** The operator confirms formulas, rollups and aggregations behave exactly
      as before
<!-- /ANCHOR:operator -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 18 | 10/18 (CHK-001 through CHK-005 are the authoring checks, verified at authoring time; CHK-007 closed with T002's re-measurement; CHK-008/CHK-010/CHK-014/CHK-015 close with this pass's primitives family) |
| P1 Items | 2 | 1/2 (CHK-013 closes with `migration-table.md`'s open-questions section) |
| Operator rows | 3 | 0/3 (never agent-ticked) |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->
