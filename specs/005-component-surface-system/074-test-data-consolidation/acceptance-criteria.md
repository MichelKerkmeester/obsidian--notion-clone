---
title: "Acceptance Criteria: Test Data Consolidation"
description: "The criteria this packet must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "074 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Test Data Consolidation

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 074-test-data-consolidation
**Level:** 2
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the project's fixture/test surfaces (`tools/screenshots/`, `tools/storybook/`, any smoke vault), When inventoried, Then every dataset is named with its current row/view/column coverage | Inventory table | Met — the Dataset Inventory table in `tasks.md` names all seven bodies with rows/columns/views/fates; counts read from the files, with the uncountable operator vault marked as theirs | - |
| AC-002 | REQ-002 | Given the inventory, When the consolidated testbed database is built, Then it covers every surviving view type, column type, grouping, filter, sort, formula and relation the inventory found | Database definition + coverage checklist | Met — the testbed note declares 28 columns (all 13 plugin column types + the 5 display variants), six views (table, board, calendar, timeline, chart — the survivors, ADR-0001 — plus a deliberately sorted-and-filtered second table, ADR-0004), grouping on board/timeline/chart, a computed formula, a relation, a rollup, and deliberately full-first/sparse-last records; asserted by `consolidation.test.mjs` and `catalogue.test.mjs`, confirmed by the generator's own report: 36 records, 13 column types, 24 neutral types, 6 views | - |
| AC-003 | REQ-003 | Given the consolidated database, When each harness (capture, story, phone-smoke) is rerun against it, Then each passes its own pre-existing pass/fail criteria | Harness command output, before/after | Met — capture: vitest 153 files/1672 → 154/1678, `render-assertions` (rhythm 36 rows, 1 distinct height, 35px ≤ 49; wrap lanes all PASS), the constructed/reference sweeps `npm run screenshots` ×2 (616/616; run 2 byte-identical to the commit) and `screenshots:verify` (616 match); story: `story-coverage` (19/40, 21 exempt) and placement (413/415, 2 declared) — the stories imported nothing from the catalogue, so their criteria hold unchanged; phone-smoke: sheet-teardown, sheet-rebuild, toolbar-collapse, cold-cache-property-read all green in the gate. Their pass/fail criteria were not loosened; the numbers were re-measured, not re-declared | - |
| AC-004 | REQ-004 | Given `070`'s fix lands, When the Finance databases are opened, Then their properties render populated, and this is documented as the kept second dataset | Recapture + spec note | Met — 070 landed at `a75a1ae2` (main head `f91370f1` carries it); the 070-built, operator-shaped Finance fixture (the second dataset, ADR-0005) renders populated properties in the cold-cache lane, green in the gate; kept, not folded, per ADR-0005 and documented for the operator in `testbed-proposal.md`. The operator's own on-device read of their Finance databases remains their row and was not ticked here | - |
| AC-005 | REQ-002 | Given the 2026-09-09 ~20:48 ruling (0.0.36: *"Also clean testbed only 1 database with table and boars views"* — the boards read), When the testbed's view set is cleaned at the source, Then the catalogue builds exactly ONE database whose view definitions are exactly one table view and one board view — no calendar, timeline, chart, second table, list or gallery view, and no second database or leftover per-view fixture | Registry RED→GREEN + regenerate | Met — **RED** `consolidation.test.mjs` 2 failed | 6 passed: 1 database (`testbed`), 6 views `[table, board, calendar, timeline, chart, table]`. **GREEN** `buildViews()` → exactly `["table", "board"]` (the table the everything-shown default, the board grouped by status); registry suite 8/8, `catalogue.test.mjs` 28/28 (full `vitest` 1587/1587), `catalogue.json` regenerated (−39 lines); the Testbed CSV's 36 rows and the 070 Finance second dataset untouched (0 CSV diff); no lane or capture mounted the retired views (0 manifest scenario references), 480 captures unchanged apart from one deterministic sub-perceptual mover (1539px @ Δ1, stable across runs) — gate 27 green, 0 red. This criterion amends AC-002's six-view shape; the earlier evidence there was true when measured and is superseded, not withdrawn | - |
| AC-006 | REQ-002 | Given the 2026-09-10 ~20:55 ruling (*"Testbed has ton of folder on iis still i wanted only 1 folder / database"*), When the generator's vault write runs, Then it produces exactly one folder — the consolidated note at the testbed root, the records inside it, `README.md`/`Attachments/` untouched and the Finance folder never written, the second run a no-op | Registry RED→GREEN + adoption smoke | Met — **RED** the new vault-write describe in `consolidation.test.mjs` ran 2 failed \| 9 passed against the untouched tree: the note sat in a nested `Database Testbed/Testbed/` wrapper (the very folder the operator's hand consolidation, same day, had removed) and the note's bytes at the root therefore read no views; the Finance-untouched assertion already held. **GREEN** the shared path helpers answer the testbed root itself (`emit-obsidian.ts`): describe 11/11, registry + `catalogue.test.mjs` 31/31, full `vitest` 1617/1617; adoption smoke: first run 37 written (1 note + 36 records) into exactly one folder, the note's `viewType` exactly 1×table + 1×board, Finance bytes untouched and reported "not produced by this catalogue, left untouched: Finance Reports", second run 0 written; `tsc` 0, `build` 0, `sheet-grammar` 0, `render-assertions` 0, `verify-placement` 0, `evidence --check-all` 16/16 fresh, **`npm run gate` 28 green, 0 red, exit 0**. This criterion amends the proposal's premise that the generator never writes the root note; `testbed-proposal.md` is amended to the adopted shape. What stays the operator's: the Finance databases' own on-device read | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** Yes

All four criteria verified 2026-09-08 (evidence in the Status cells above and the verification table in `implementation-summary.md`); AC-005 verified 2026-09-09 under the 0.0.36 ruling; AC-006 verified 2026-09-10 under the ~20:55 folder ruling. What stays human: the on-device read of the Finance databases — this packet deliberately leaves it unticked. The vault adoption itself happened by the operator's own action on 2026-09-10 (nine sub-database folders removed, backup kept; its path recorded in the 005 handover entry, not in this packet's code), and the generator now writes exactly the shape that consolidation produced.
<!-- /ANCHOR:closure -->
