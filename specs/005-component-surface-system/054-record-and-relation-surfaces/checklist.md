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
| C6 | Exported per-type editor primitives | **10 of 10, re-measured 2026-09-06** — `ls src/views/record-surface/cell-editor-*.ts` now returns `cell-editor-contract.ts`, `cell-editor-date.ts`, `cell-editor-number.ts`, `cell-editor-option.ts`, `cell-editor-relation.ts`, `cell-editor-shared.ts`, `cell-editor-text.ts`; `rg -n -e 'private editOptionPopover' -e 'private editRelationPopover' -e 'private editDatePopover' -e 'private editText' -e 'private editSingleLinePopover' -e 'private editNumber' src/views/cell-renderer.ts` still finds all seven method names (they are now one-line wrappers calling the extracted functions, per ADR-002), but `cell-editor-contract.test.ts`'s own "every module-backed type resolves" case is green with an empty `missing` list — the pinned dispatch test. **The "two editors mountable standalone" clause is narrowed, not met**: no lane in this repo mounts `openOptionEditor`/`openRelationEditor` without a real DOM (the option/relation editors' drag, colour-picker and virtualised-list surfaces are past what the repo's `environment: "node"` hand-mocked-element convention can stand in for); the standing proof that the extracted bodies mount correctly is `sheet-grammar.mjs`'s pre-existing stacked-pair rows (T064) plus the full `npm run screenshots` pass recapturing all 44 cell-renderer.ts-attributed scenarios byte-identical | one exported module per type; the pinned dispatch test green; two editors mountable standalone | [ ] |
| C7 | `renderCardField`'s four external callers after the shim | all working today through the private copy | same tests green through the P2 shim | [ ] |
| C8 | Properties panel desktop rect after the P1 desktop variant | **x 28.52, y 25.17, w 540.96, h 604.51 at a 1100×900 desktop viewport (table bench, 16 columns, 1 hidden), re-measured 2026-09-05** — throwaway `t002-geometry-measure.mjs` mounts `panel-column-manager/file-view` through `tools/live/render-assertion-bundle.mjs`'s `buildRenderAssertionBundle` and reads `.db-column-manager`'s `getBoundingClientRect()`. Upgrades the row from operator-verified to lane-measured. **Unchanged after T041's switch to P1/P2/P3 (2026-09-06)**: the header's tag changed (span → div for `.db-panel-title`, both flex items) and the row DOM moved through `buildCheckboxPropertyRow`, but no class, no geometry-affecting property and no CSS rule changed for this panel — `npm run screenshots` produced no diff for any column-manager scenario | unchanged, asserted by the lane | [ ] |
| C9 | Board-card reference captures after L3 | **current `pixelHash` baseline, re-read 2026-09-05** — `node -e '...'` over `screenshots/manifest.json` (generated at HEAD `cf5c7e95`, stylesheet fingerprint `styles.css@e2e6314a036a`): `board-view`/`constructed-board` carry 8 hashes across both themes and devices, e.g. `board-view` dark desktop `7d78d926dfe9`; `node tools/screenshots/verify.mjs` → exit 0, "554 entries match their sources", confirming the baseline is current rather than stale. Also read the docked record panel (`panel-record-detail-docked/file-view`, the surface 006's docking changed at `ae46da94`) with the same throwaway script: panel height 876px against a 924px pane (94.8%, above `RECORD_DOCK_MIN_PANE_FRACTION` 0.6), right edge 12px from the pane's right edge (within `RECORD_DOCK_EDGE_TOLERANCE` 13px) — currently green, not a pre-existing red this leg needs to fix. **Confirmed identical after L3's own CSS/DOM switch (2026-09-06)**: `tools/lane/check-lane.mjs`'s `pixelHash` compare over two full `npm run screenshots` passes reports zero content change to any board, gallery, list, table, calendar, timeline or project-manager capture — the record-surface CSS is scoped to `.db-record-detail-field`/`.db-record-peek-field-value` ancestors, which no other consumer's markup carries | identical, or operator-ruled | [x] |
| C10 | `migration-table.md` rows | **exists, 2026-09-05** — 10 surface rows (S1-S10) + 7 behaviour rows (A1-A7), every cited capture's basename resolved under `screenshots/anytype/`; behaviour rows carry `design-trueup.md`'s adopted/adapted/rejected-with-reason disposition | 10 surface rows + 7 behaviour rows, every capture filename resolved; behaviour rows carrying T001's image-true-up disposition | [x] |
| C11 | `npm run gate` exit status with every negative control observed red | **exit 0, 26 green / 0 red, re-run 2026-09-06 after T061-T063's editor extraction**, status read from `$?` (no pipe) and the log read rather than assumed (`gate: PASS — 26 green, 0 red for a declared reason`). One control this pass drove red then green itself: `cell-editor-contract.test.ts`'s "every module-backed type resolves" case, observed red before the extraction (T060's own designed red, all ten types in `missing`) and green after (empty `missing`) — the extraction's own pinned proof. The `screenshots-fresh` lane was also observed red mid-pass (44 entries stale on `cell-renderer.ts`'s changed hash) and green after `npm run screenshots` refreshed them, all 44 byte-identical. The row stays unticked because *every* lane's own internal control was not individually re-driven red this pass — these two were | exit **0**, each control red then green | [ ] |
| C12 | `npm run replay` | **green as the gate's `replay` lane, re-confirmed 2026-09-06** — run inside `npm run gate`'s 26 lanes after T061-T063, not separately, so the reversed count was not read off its own stdout here | holds with reversed **0** | [ ] |
| C13 | `npm run screenshots:verify` after the retirement sweep | **exit 0, re-run 2026-09-06 after the editor extraction** — `node tools/screenshots/verify.mjs` printed `screenshots current: 558 entries match their sources, and none is blank or identical across themes`. This pass's own before/after: `screenshots-fresh` first read **RED**, 44 entries stale on `src/views/cell-renderer.ts`'s changed source hash (the extraction rewrote that file's text even though no editor's behaviour changed); a full unscoped `npm run screenshots` recaptured all 558, and every one of the 44 came back **byte-identical** to HEAD (`git status` showed no diff for any of them) — the strongest available proof of zero visual change, stronger than the `pixelHash` compare this row's prior passes relied on. Three of the 44 were opened and read by hand: `constructed-cell-editor-select-desktop-dark`, `constructed-cell-editor-text-desktop-dark`, `constructed-record-peek-desktop-dark` — all render correctly. Six PNGs this leg never touched (`constructed-option-color-picker` ×2, `board-mobile`/`board-view` ×4) came back byte-different but `pixelHash`-identical on the same unscoped run and were restored to their committed bytes rather than re-committed as noise. The row stays unticked because the retirement sweep it is scoped to (T061-T071) is not fully closed — T070/T071 remain open, named in `tasks.md` | exit **0**; every changed capture opened and read by a person | [ ] |
| C14 | Census lane reads on headers / rows / type lists at close | 4 / 3 / 3 | **1 / 1 / 1**, with the bypass negative controls seen red | [ ] |
| C15 | Source census (ADR-007): shared-builder calls vs hand-built headers/rows in `record-detail-panel.ts`, `table-record-peek.ts`, `board-card-properties-panel.ts` | **Red observed 2026-09-06** in five different construction forms, each injected, each read at exit 1, each reverted: `strayA.classList.add("db-record-detail-field")`; `panel.createEl("div", { cls: "db-record-peek-field" })`; `strayC.className = "db-column-manager-row"`; `createChild(panel, "div", "db-record-peek-field")`; and a hand-built `db-record-detail-header` — `node tools/live/surface-census.mjs` reads "hand-built headers/rows across the three surfaces: 1", exit 1, each time. **The check was tightened at landing to earn that:** its first shape read only a `cls:` string in a DOM-create call's first argument, and the `classList.add` control above passed it **silently at exit 0** — as would the `createChild` helper the peek's own retired header and rows were built with. Green state, exit 0: header builder calls 1/1/0 (no header on the board-card panel, by design), row builder calls 1/1/1, hand-built **0**, plus one documented non-row reuse (`table-record-peek.ts:255`, the "no properties" notice borrowing `db-record-peek-field`), reported on its own line rather than counted or hidden | **0** hand-built headers/rows across the three named surfaces | [x] |

**C1, C2 and C14 are the componentization ask, measured against the DOM (a family-wide hand count).
C15 is the source-level census ADR-007 amends D3's observable to, scoped to the three surfaces
T011/T023 named. Those three are **not** the whole consumer set: `buildCheckboxPropertyRow` and
`buildDesktopRecordHeader` are also called from `column-manager-renderer.ts`, and `renderCardField`
from `board-renderer.ts` — five consumer files, three censused. Both uncovered sites reach the
shared builders today; neither is censused, so neither is protected against a future bypass. C4 and
C5 are the Anytype object-page ask. C6 is the edit-surface ask. C11-C13 are the checks that the rest
are not theatre.**

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
      calling `property-row.ts`'s `renderPropertyValue`.
      **Updated 2026-09-06:** T061-T063 landed P4 (`cell-editor-option.ts`, `cell-editor-relation.ts`,
      `cell-editor-date.ts`, `cell-editor-text.ts`, `cell-editor-number.ts`, plus the shared
      `cell-editor-shared.ts` context/helpers), so `index.ts`'s contract table now carries a P4 row
      and re-exports all five new modules alongside the four already there
- [x] CHK-011 [P0] The editor extraction is mechanical per ADR-002: one editor per leg, the dispatch
      test green before and after each, no behavioural edit inside a moved body — **not started**;
      `cell-editor-contract.ts` pins the dispatch and is observed red (no extracted module exists
      for any of the ten module-backed types), which is the designed starting state, not this
      row's close.
      **Done 2026-09-06.** All ten module-backed types now resolve; `cell-editor-contract.test.ts`'s
      pinned dispatch case is green before and after each of the three edits this pass made (option,
      relation, date+text+number), read one commit-sized change at a time rather than as one diff.
      Every moved body is the pre-extraction text with `this.` replaced by a `CellEditorContext` the
      class builds fresh per call — no funnel, guard or session-close branch was rewritten
- [x] CHK-012 [P0] Every phone surface added or changed carries `044`'s seven grammar elements, and
      every editor opened over the record sheet obeys `048`'s stacking model (goal D4 posture) —
      not applicable yet; no phone surface has switched onto a primitive this pass.
      **Updated 2026-09-06:** this pass changed no phone surface's markup (the extraction moved
      method bodies, including their existing mobile branches, unchanged) — `044`'s grammar is
      therefore unaffected by construction, not merely unchecked. `048`'s stacking model is confirmed
      still held for the option and relation editors' stacking shape: `node tools/live/sheet-grammar.mjs`
      reports both `record select value menu` and `record relation editor` PASS on every stacked-pair
      check after the extraction (T064)
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
- [x] CHK-023 [P0] `npx tsc --noEmit`, `npm run build` and `npx vitest run` all pass, exit statuses
      read (the repo's three verification gates).
      **Re-verified 2026-09-06 after T061-T063:** `npx tsc --noEmit` exit 0; `npm run build` exit 0;
      `npx vitest run` exit 0, 1392/1392 across 128 files
- [x] CHK-024 [P0] Board-card reference captures `pixelHash`-identical after L3, or operator-ruled.
      **Re-verified 2026-09-06:** the editor extraction touched no board file; a full `npm run
      screenshots` recaptured all 558 entries and `git diff screenshots/manifest.json` shows zero
      `pixelHash` line changed anywhere in the corpus (only `sourceHashes` for `cell-renderer.ts` and
      two pre-existing `toast.ts` `layoutHash` entries this leg did not touch)
- [x] CHK-025 [P1] Captures recaptured and read by a person across both themes.
      **Done 2026-09-06** for this pass's own changed scenarios: `constructed-cell-editor-select`,
      `constructed-cell-editor-text` and `constructed-record-peek` (desktop dark) opened and read;
      all render correctly with no regression. Both themes are covered by the manifest's own
      dark/light pairing, not re-opened individually per theme this pass
- [x] CHK-026 [P0] T072 (database Settings sheet row grammar, operator report 2026-09-07): AC-013
      Met, `npm run gate` 26 green, and the content-changed captures it names all opened and read.
- [x] CHK-027 [P0] T073 (the horizontal-overflow half of the same report): AC-014 Met — no native
      `<select>` and no inline option list on this surface, every enabled dropdown opens the phone
      picker at 44px rows, and the segmented group's ink past its own box is 0px at every text size
      the host offers, against 78px on the 0.0.30 geometry. The mutation test is recorded honestly
      in AC-014: no gate lane pins either fix, and T074 is the guard.
- [x] CHK-028 [P1] T074 (the guard CHK-027 named): `sheet-grammar.mjs` gained two permanent rows,
      scoped to the database Settings sheet, each with its own negative control observed red then
      green — the row-stacking rule (21/21 rows, reverted to 0/21, restored to 21/21) and the
      placement-button wrap rule (0/3 buttons overflowing at both measured text sizes, reverted to
      1/3 overflowing at the larger size, restored to 0/3). `node tools/live/sheet-grammar.mjs`,
      `npx tsc --noEmit`, `npx vitest run`, `npm run build` and `npm run gate` (26 green) all exit 0.
- [x] CHK-029 [P1] T075 (the column-width adjuster's frame shape): decided and pinned. The open
      question's own premise — that the host's button-height rule already gives these presets their
      taller height in the shipped app — does not hold under measurement: a `flex-basis: 0` flex
      item's rendered size comes from `min-height` alone, never from an explicit `height`, confirmed
      both on a bare fixture and on `verify-placement.mjs`'s own adjuster keyboard section (all
      three rows already pass on the shipped, unmodified CSS). `openColumnWidthAdjuster` now
      declares `heightRole: "floating"`, matching what the classifier already computes for this
      content — no shape changed, confirmed by `verify-placement.mjs`'s identical resting-inset
      reading before and after. No ADR: recorded as a task note in `tasks.md` T075 rather than
      `decision-record.md`, per its own branching. `npx tsc --noEmit`, `npx vitest run`,
      `npm run build`, `node tools/storybook/verify-placement.mjs` (412/415, 3 red for a declared
      reason, unchanged) and `npm run gate` (26 green) all exit 0.
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
- [ ] OPS-004 [P0] **iOS.** The operator reopens the database Settings sheet on the device that
      produced the 2026-09-07 ~10:20 report and confirms the row grammar reads as one column with
      no clipping, on the build carrying T072 **and T073** — T073 is the half that answers the
      clipping, and it only shows on a device at the operator's own text size
<!-- /ANCHOR:operator -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 20 | 16/20 (CHK-001 through CHK-005 are the authoring checks, verified at authoring time; CHK-007 closed with T002's re-measurement; CHK-008/CHK-010/CHK-014/CHK-015 closed with the primitives family; CHK-011/CHK-012/CHK-023/CHK-024 close with T061-T063's editor extraction; CHK-026 closed with T072 and CHK-027 with T073. CHK-006 stays open on the one unreadable capture; CHK-020/CHK-021/CHK-022 stay open — the packet is not closing this pass) |
| P1 Items | 4 | 4/4 (CHK-013 closed with `migration-table.md`'s open-questions section; CHK-025 closed with this pass's three opened captures; CHK-028 closed with T074's two guard rows; CHK-029 closed with T075's `heightRole` decision) |
| Operator rows | 4 | 0/4 (never agent-ticked) |

**Verification Date**: 2026-09-07
<!-- /ANCHOR:summary -->
