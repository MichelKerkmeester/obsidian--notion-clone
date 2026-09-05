---
title: "Verification Checklist: Phone Sheet Alignment"
description: "Acceptance criteria with the failing number recorded first, so a pass means a sheet actually moved rather than a check being added."
trigger_phrases:
  - "044 phone sheet checklist"
  - "sheet grammar verification"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Phone Sheet Alignment

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. A criterion
with an empty "today" cell is not accepted. Every measurement is taken on the real renderer at the
production mount point, on a 390x844 phone profile, with a navbar present.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Surfaces presenting as a sheet that reach the screen through `applySheetChrome` | 6 modules call it; `db-mobile-column-width-panel`, `db-icon-picker-popover` and `db-color-picker-popup` do not — 3 known bypasses | 0 bypasses | [x] |
| C2 | Grammar elements present on the column-width adjuster | 0 of 7 — bare strip, title at x=0, slider clipped at the left edge, no handle, no header, no inset | 7 of 7 | [x] |
| C3 | Focused field rect inside the reduced `visualViewport` rect while typing a column width | field below the reduced bottom; the whole adjuster is covered by the keyboard | field fully inside | [x] |
| C4 | Settings sheet closes from a grab-band drag past the flick threshold | does not close — the operator reports the handle dead | closes | [x] |
| C5 | Settings body rows with a wrapped label or a right-clipped description | present — "Leave empty to scan the vault root." clipped at the right edge in the operator's capture | 0 | [x] |
| C6 | Add view sheet controls using a shared row type | 0 — three bare bordered inputs, a `select` rendered as a text input, a bare checkbox, a flat icon list | every control on a row type | [x] |
| C7 | `sheet-grammar` lane exit status, with a negative control observed red | lane does not exist | exit 0, control red then green | [x] |

**C2, C4 and C6 are the three operator reports. C7 is the check that C1-C6 are not theatre.**

### Blank Failing Numbers

C1's count is partial by construction: the three named bypasses were found by grep, and the ranked
inventory (`../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md`, concurrent) may add
more. The row closes on the inventory's number, not on this one. Recording it as partial now is
deliberate — a "today" cell filled in later is a cell nobody can check against the tree that
produced it.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [x] CHK-001 [P0] The three operator reports are quoted verbatim in `spec.md` §2, with the
      screenshot each came from named — confirmed present (`spec.md` REQ-002/004/005, each naming
      its operator report and screenshot)
- [x] CHK-002 [P0] `003`'s portal contract and `016`'s drag contract read, and what may not change
      recorded in `tasks.md` T001 — confirmed unchanged this session: `src/data/touch-environment.ts`
      (the collapsed phone predicate) carries zero diff against every base this phase rebased onto;
      `sheet-flick.test.ts` and the flick/drag constants in `mobile-bottom-sheet.ts` carry zero diff
- [x] CHK-003 [P0] The seven grammar elements written down once, before any consumer is edited —
      `src/views/sheet-grammar.ts`'s `SHEET_GRAMMAR_ELEMENTS`, T003
- [x] CHK-004 [P1] The `styles.css` lane holder named before the first stylesheet edit —
      `044-phone-sheet-alignment` acquired before any `.db-sheet-close`/`.db-add-view-key-field` edit,
      released with all 30 changed captures named (`tools/lane/css-lane.json`)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [x] CHK-010 [P0] `npm run lint` and `tsc --noEmit` exit 0 — `tsc --noEmit` exit 0; `npm run lint`
      172 problems, unchanged from the branch base (stashed this diff, base alone measured 172 too)
- [x] CHK-011 [P0] No console errors while opening and dismissing every reported sheet —
      `verify-placement.mjs` 402/403 (1 declared red, unrelated); `sheet-teardown.mjs` 12 producers,
      0 leaking, including the `attachSheetChromeToModal` regression found and fixed this session
- [x] CHK-012 [P1] The width field's clamp still refuses to rewrite a field being typed into —
      unchanged by this phase's own edits; column-width's `activeElement` guard is `039`'s own T005
- [x] CHK-013 [P1] Settings restyling touches only our own host wrapper classes, never `Setting`
      internals — `040`'s own T007 evidence: `.db-view-config-body`/`renderSheetClose` scoped to the
      plugin's own classes; this phase added `db-sheet-close` alongside its own class, additively
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## TESTING

- [x] CHK-020 [P0] Every `acceptance-criteria.md` row that is not operator-only is `Met` with
      observed evidence — AC-001 through AC-005 and AC-007 all `Met`; AC-006 stays `Unmet`
      (operator-only, by design)
- [x] CHK-021 [P0] `npm run gate` exits 0 with `sheet-grammar` registered, read without a pipe —
      `npm run gate; echo $?` → 0, 26/26 green including `sheet-grammar`
- [x] CHK-022 [P1] Rotation across the touch boundary re-applies the chrome rather than stranding it
      — unchanged by this phase; `DbModal.applyPresentation()`'s re-apply path carries zero diff
- [x] CHK-023 [P1] Two sheets opened in sequence — the second does not inherit the first's keyboard
      inset — `SHEET_KEYBOARD_INSET_VAR` is written per-placement by `placeSheet` on each sheet's own
      node, never shared; unchanged by this phase beyond that publish
- [x] CHK-024 [P1] `touch-targets` ratchet re-baselined with the raise attributed per class —
      fixture 279→199 (found stale at this phase's own branch base, not a raise this phase made);
      constructed 1223→1220, isolated to `db-icon-only-button`×2 the settings-sheet leg (040) resized
      between base and rebase tip (`tools/live/touch-targets-constructed-baseline.json`)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [x] CHK-FIX-001 [P0] Finding class recorded per report. Reports 40, 41 and 43 are provisionally
      `class-of-bug`: three surfaces, one missing conformance rule. Confirmed by the fix: one shared
      contract module (`sheet-grammar.ts`) and one shared header builder (`createSheetHeader`)
      resolved all three, plus the ranked non-conforming instances (T009)
- [x] CHK-FIX-002 [P0] Producer inventory run — `rg -n 'body\.createDiv' src` and
      `rg -n 'applySheetChrome' src`, both counts stated before and after — `applySheetChrome`
      callers unchanged in signature/count beyond the new `attachSheetChromeToModal` wrapper;
      `body.createDiv` bypasses this phase owns (column-width) closed by `039`
- [x] CHK-FIX-003 [P0] Consumer inventory run for `applySheetChrome`'s signature and the sheet class
      vocabulary across `src/`, `tools/` and `styles.css` — signature byte-identical (confirmed via
      diff against every rebase base); class vocabulary extended (`db-sheet-close`,
      `db-add-view-key-field`), never renamed
- [x] CHK-FIX-004 [P0] N/A recorded rather than ticked: no path, parser, redaction or security
      surface is touched by this phase — confirmed, N/A
- [x] CHK-FIX-005 [P1] Matrix axes listed: {instance} × {7 elements} × {light, dark} × {390x844,
      768x1024}, with the row count stated — `sheet-grammar.mjs` covers {6 instances} × {7 elements}
      on one phone profile (390x844, coarse pointer); the light/dark and second-viewport axes are
      the screenshot lane's, not this structural check's — 30 real content-changed captures read
      across both themes this session, not a second device width
- [x] CHK-FIX-006 [P1] Global-state variant executed — `visualViewport` and `document.body` are
      process-wide, and a second sheet must not read the first's state — `SHEET_KEYBOARD_INSET_VAR`
      is written per-node by `placeSheet`, never shared; `sheet-teardown.mjs`'s compounding case
      proves one producer's state cannot block another's cleanup
- [x] CHK-FIX-007 [P1] Evidence pinned to a fix SHA, not a branch-relative range — pinned to the
      final `styles.css` hash (`0d0d87c3b427`) and this session's own commits once made; not yet a
      merged SHA at authoring time
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## SECURITY

- [x] CHK-030 [P0] No hardcoded secrets — confirmed, none introduced
- [x] CHK-031 [P0] The width field rejects non-numeric input rather than applying `NaN` — unchanged
      by this phase; `applyWidth`'s `Number.isFinite` guard is `039`'s own T005
- [x] CHK-032 [P1] N/A — no auth or authorization surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [x] CHK-040 [P1] `spec.md`, `plan.md`, `tasks.md` and `acceptance-criteria.md` agree on the
      requirement numbering — REQ-001 through REQ-008 consistent across all four this session
- [x] CHK-041 [P1] The comment above the sheet module's grammar contract says why an element is
      owned centrally, not what the code does — `sheet-grammar.ts`'s module banner
- [x] CHK-042 [P1] `../roadmap.md` §4 rows 40, 41 and 43 carry the measured after-numbers — done in
      the landing session (tasks.md T014): rows 40/41 append the phase-closing gate/sheet-grammar/
      verify-placement numbers, row 43 rewritten from Open to Fixed with T008's evidence,
      `../roadmap.md` §5.A's `044` row and its cross-referencing prose, and `../spec.md`'s two
      Phase Documentation Map rows, all updated to Landed on main `dcff742e`
- [ ] CHK-043 [P2] `src/views/README.md` names the sheet module as the grammar owner — not done;
      `src/views/README.md`/`CODE.md` are curated summaries that name no individual file today, and
      adding one entry for this alone would invent a convention the folder doc doesn't otherwise use
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [x] CHK-050 [P1] Temp files in scratch/ only — no repo-local `scratch/` exists; every temp file
      this session (measurement worktrees, classification scripts) used the session scratchpad
      outside the repo, never a path under version control
- [x] CHK-051 [P1] scratch/ cleaned before completion — the two temporary measurement worktrees
      (`base-measure`, `rebase-tip-measure`) were removed with `git worktree remove --force`;
      confirmed by `git worktree list`
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 13/13 |
| P1 Items | 16 | 16/16 |
| P2 Items | 1 | 0/1 |

Open: CHK-043 (README naming, P2, no existing per-file convention to extend) — left for a
later pass rather than guessed at here.

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->
