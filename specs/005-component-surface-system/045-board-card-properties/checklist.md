---
title: "Verification Checklist: Board Card Properties"
description: "Acceptance criteria with the failing number recorded first, so a pass means the card's field model actually moved."
trigger_phrases:
  - "045 board card properties checklist"
  - "card field verification"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Board Card Properties

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. A criterion
with an empty "today" cell is not accepted.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Inputs deciding a board card's field set | 3, none of them the board's own: the table's `hiddenColumns` via `getVisibleColumns`, `columnOrder`, and two hard-coded type exclusions | 1 — the view's own list | [x] `ViewConfig.boardCardFields` (`types.ts`) + `resolveBoardCardFields` (`board-card-fields.ts`), the one call site in `renderCard` |
| C2 | Card field sets expressible for two views over one database | 1 — both views read the same visible-column set | 2 distinct | [x] `board-card-fields.test.ts` "gives two views over the same database different card fields..." |
| C3 | `status`/`select` columns renderable in the card meta grid | 0 — removed unconditionally at `board-renderer.ts:1481-1482` | operator's choice | [x] `board-renderer-hierarchy.test.ts` "renders a status column in the meta grid when the stored list makes it visible" |
| C4 | Board captures changed by the upgrade, with no stored list | not yet measured; target is the whole point | 0 of N `pixelHash`/`layoutHash` moved | [x] `tasks.md` T011 — 0 of 7 existing board scenarios moved pixelHash/layoutHash; 6 unrelated re-encode-noise PNGs restored to HEAD bytes |
| C5 | `038` board parity fixtures moved with a stored list present and extensions off | not yet measured | 0 | [x] `board-renderer-parity.test.ts` "does not let a stored card field list move the reference card's fixed slots"; `render-assertions.mjs` PASS |
| C6 | Properties control surfaces | 0 — the control does not exist | 2: desktop popover, phone sheet | [x] `renderBoardCardProperties` mounts into `ViewConfigPanelRenderer`'s shared body, which is the same panel the anchored desktop popover and the `.is-phone` bottom sheet both present — one render tree, two surfaces via existing CSS |

**C4 and C5 are the two that can silently go wrong. C1 is the defect; C2, C3 and C6 are the
feature.**

### Blank Failing Numbers

C4 and C5 have no "today" number because both measure the effect of a change that has not been
made. They are recorded as `not yet measured` rather than left blank, and each names the artifact
that will carry the number — a capture pair for C4, `038`'s landed fixtures for C5. Neither may be
ticked from a passing test alone.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [x] CHK-001 [P0] The three current field-selection rules are cited by file:line, not paraphrased
      — `spec.md` §2, `tasks.md` T001, tripwire `board-renderer-hierarchy.test.ts:634`
- [x] CHK-002 [P0] The reference card's fixed slot set is recorded as the boundary, with the
      vendored source cited — `tasks.md` T002, tripwire `board-renderer-parity.test.ts:660`
- [x] CHK-003 [P0] The persisted shape is written down before it is written into `types.ts`
      — `plan.md` §3 Key Components, then `tasks.md` T003's red evidence
- [x] CHK-004 [P1] The differential test exists before the renderer swap lands
      — `board-card-fields.test.ts`'s `it.each(SCHEMA_SHAPES)` differential, T010, red before T005
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [x] CHK-010 [P0] `npm run lint` and `tsc --noEmit` exit 0 — `tsc --noEmit` exits 0. `npm run lint`
      exits 1 at 172 problems (159 errors, 13 warnings), unchanged from the pre-045 baseline on
      `origin/main` (confirmed by stashing this diff and re-running lint on the bare rebased tree:
      also 172). `lint` is not a `npm run gate` lane (only `lint:tools` is); this packet introduces
      zero new lint findings.
- [x] CHK-011 [P0] No console errors while opening, editing and closing the Properties control
      — `npm run story:smoke`: 20 stories × 2 themes = 40 renders, 0 errors, including the new
      `Editable`/`ReadOnly` stories for this panel. No live-Obsidian manual click-through was run.
- [x] CHK-012 [P1] A stored key absent from the schema is skipped, never fatal and never blanking
      — `board-card-fields.test.ts` "uses stored order and visibility, drops unknown keys, and
      appends new columns hidden"
- [x] CHK-013 [P1] The resolver has one call site; `renderReferenceCard` is not one of them
      — `rg -n resolveBoardCardFields\( src/views/board-renderer.ts` returns exactly one line
      (inside `renderCard`, which starts at line 1269; `renderReferenceCard` starts at line 401)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## TESTING

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row that is not operator-only is `Met` with
      observed evidence — AC-001 through AC-004 are `Met`; AC-005 stays `Unmet`. The lane its
      Verification cell names now exists AND measures this surface directly (5 of 7 elements
      green), but `rows`/`segmented` are red for the pre-existing settings-body reason, not a
      registered all-green row for this surface, so the named check still does not exist. Not
      fully satisfied; see `acceptance-criteria.md` §3.
- [x] CHK-021 [P0] `npm run gate` exits 0, read without a pipe — `npm run gate >/tmp/gate045.log
      2>&1; echo $?` → `0`; 25 green, 0 red. Re-run at T013's landing (`npm run gate` piped to a log,
      exit read separately): 26 green, 0 red — the extra lane is `sheet-grammar`, registered between
      the two passes by `044`'s own landing, not something this task added.
- [x] CHK-022 [P1] Empty list, deleted key, and a schema whose only field is the title, all covered
      — `board-card-fields.test.ts`: "keeps an empty array...", "drops unknown keys...", and the
      new "the title field is the only column in the schema" shape in `SCHEMA_SHAPES`
- [x] CHK-023 [P1] A malformed stored list loads as absent rather than throwing
      — `board-card-fields.test.ts` "returns undefined for a missing or malformed value"
- [x] CHK-024 [P1] A constructed scenario carries a non-default list, so the feature is photographed
      — done (`tasks.md` T013): `constructed-board-card-properties` (the panel, desktop + phone)
      and `constructed-board-card-properties-hidden` (the same list applied to a real extensions
      card) both captured and read; `constructed-state-assertions.mjs` proves the panel's checkbox
      states, red before the harness branch existed
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [x] CHK-FIX-001 [P0] Finding class recorded: `cross-consumer`. Board and table share one
      visible-column producer; this removes a consumer rather than changing the producer.
      Confirmed at the verification pass too: `getVisibleColumns` itself was not touched, but the
      board kept exactly one call to it (`BoardRenderer.legacyVisibleColumnKeys`, computed once per
      render) purely to reproduce its old auto-hidden-empty-column behaviour for the derived
      (list-absent) path — a migration-fidelity read, not a rendering decision.
- [x] CHK-FIX-002 [P0] Producer inventory run — `rg -n 'getVisibleColumns|getColumns\(' src`:
      before (base `466eb370`) 51, after 52. The +1 is the `legacyVisibleColumnKeys` read above;
      the old inline call at the pre-change `renderCard` was removed in the same diff.
- [x] CHK-FIX-003 [P0] Consumer inventory run for `hiddenColumns`, `columnOrder`, `showEmptyFields`
      — `rg -c 'hiddenColumns|columnOrder|showEmptyFields' src tools`: before 185, after 202 (+17,
      almost entirely new test fixtures and the derived-path fallback check; the table's own
      reading of `hiddenColumns` is unchanged).
- [x] CHK-FIX-004 [P0] N/A recorded rather than ticked: no path, parser, redaction or security
      surface
- [x] CHK-FIX-005 [P1] Matrix axes listed: {list absent, present} × {extensions on, off} ×
      {key exists, deleted} × {desktop, phone} = 16 rows. Covered across test files rather than one
      literal table: `board-card-fields.test.ts` (absent/present × key exists/deleted, both
      extensions-agnostic since the resolver has no extensions flag), `board-renderer-parity.test.ts`
      (extensions-off × list present, proving REQ-007), `board-renderer-hierarchy.test.ts`
      (extensions-on × both list states), `board-card-properties-panel.test.ts` (desktop vs
      read-only/phone-shaped rows). No single row combination is untested; no consolidated 16-row
      table was written this session.
- [x] CHK-FIX-006 [P1] N/A — no process-wide state read
- [x] CHK-FIX-007 [P1] Evidence pinned to a fix SHA — `b52a4471` (`feat(board): let a view choose
      which properties its cards show`), branch `worktrees/045-board-card-properties`
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## SECURITY

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] The stored list holds field keys only, never values — `BoardCardField` is
      `{ key: string; visible: boolean }` (`types.ts`); `toBoardCardFieldList` only ever writes
      `.key`/`.visible`, never a cell value
- [x] CHK-032 [P1] N/A — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [x] CHK-040 [P1] Spec/plan/tasks agree on requirement numbering — REQ-001..008 consistent across
      `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md`
- [x] CHK-041 [P1] The resolver's comment says why the board stopped reading the table's hidden
      columns — `board-card-fields.ts`'s module header: "That made hiding a table column silently
      edit every card. This resolver is the only decision now..."
- [x] CHK-042 [P1] `../roadmap.md` §5 carries the measured result — done post-landing (`tasks.md`
      T014): §5.A's `045` row and the two prose paragraphs naming its worktree now read Landed on
      main `ff1dacec`, with AC-005/T013's `044` sheet-grammar wait and the two open questions named
- [ ] CHK-043 [P2] `src/views/README.md` names the resolver as the card field-set owner — not done.
      `README.md` is a high-level overview pointing to `CODE.md` for detail, and `CODE.md` lists
      renderer categories in PascalCase (`BoardRenderer.ts`) rather than individual utility modules
      (no comparable entry exists for `resolveRecordOpenTarget` either); adding one module here
      would be an inconsistent, unprecedented edit to a shared doc outside this packet's scope
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [x] CHK-050 [P1] Temp files in scratch/ only — no repo-local `scratch/` used; working files stayed
      in the session scratchpad outside the repo
- [x] CHK-051 [P1] scratch/ cleaned before completion — no repo-local scratch files exist; `git
      status --short --ignored` shows nothing under `scratch/` or a stray temp/log path
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 12/13 — CHK-020 open (AC-005 unmet) |
| P1 Items | 15 | 14/15 — CHK-024 open |
| P2 Items | 1 | 0/1 — CHK-043 not done, reason recorded |

The original totals recorded here (11/14/1) undercounted the checklist's own items; corrected to
the actual per-section counts above rather than left inconsistent with the checked boxes.

**Verification Date**: 2026-09-05 (verification pass)
<!-- /ANCHOR:summary -->
