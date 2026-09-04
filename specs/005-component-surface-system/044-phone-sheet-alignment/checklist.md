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
| C1 | Surfaces presenting as a sheet that reach the screen through `applySheetChrome` | 6 modules call it; `db-mobile-column-width-panel`, `db-icon-picker-popover` and `db-color-picker-popup` do not — 3 known bypasses | 0 bypasses | [ ] |
| C2 | Grammar elements present on the column-width adjuster | 0 of 7 — bare strip, title at x=0, slider clipped at the left edge, no handle, no header, no inset | 7 of 7 | [ ] |
| C3 | Focused field rect inside the reduced `visualViewport` rect while typing a column width | field below the reduced bottom; the whole adjuster is covered by the keyboard | field fully inside | [ ] |
| C4 | Settings sheet closes from a grab-band drag past the flick threshold | does not close — the operator reports the handle dead | closes | [ ] |
| C5 | Settings body rows with a wrapped label or a right-clipped description | present — "Leave empty to scan the vault root." clipped at the right edge in the operator's capture | 0 | [ ] |
| C6 | Add view sheet controls using a shared row type | 0 — three bare bordered inputs, a `select` rendered as a text input, a bare checkbox, a flat icon list | every control on a row type | [ ] |
| C7 | `sheet-grammar` lane exit status, with a negative control observed red | lane does not exist | exit 0, control red then green | [ ] |

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

- [ ] CHK-001 [P0] The three operator reports are quoted verbatim in `spec.md` §2, with the
      screenshot each came from named
- [ ] CHK-002 [P0] `003`'s portal contract and `016`'s drag contract read, and what may not change
      recorded in `tasks.md` T001
- [ ] CHK-003 [P0] The seven grammar elements written down once, before any consumer is edited
- [ ] CHK-004 [P1] The `styles.css` lane holder named before the first stylesheet edit
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] CHK-010 [P0] `npm run lint` and `tsc --noEmit` exit 0
- [ ] CHK-011 [P0] No console errors while opening and dismissing every reported sheet
- [ ] CHK-012 [P1] The width field's clamp still refuses to rewrite a field being typed into
- [ ] CHK-013 [P1] Settings restyling touches only our own host wrapper classes, never `Setting`
      internals — a host update must not silently unstyle the sheet
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## TESTING

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row that is not operator-only is `Met` with
      observed evidence
- [ ] CHK-021 [P0] `npm run gate` exits 0 with `sheet-grammar` registered, read without a pipe
- [ ] CHK-022 [P1] Rotation across the touch boundary re-applies the chrome rather than stranding it
- [ ] CHK-023 [P1] Two sheets opened in sequence — the second does not inherit the first's keyboard
      inset
- [ ] CHK-024 [P1] `touch-targets` ratchet re-baselined with the raise attributed per class
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] CHK-FIX-001 [P0] Finding class recorded per report. Reports 40, 41 and 43 are provisionally
      `class-of-bug`: three surfaces, one missing conformance rule.
- [ ] CHK-FIX-002 [P0] Producer inventory run — `rg -n 'body\.createDiv' src` and
      `rg -n 'applySheetChrome' src`, both counts stated before and after
- [ ] CHK-FIX-003 [P0] Consumer inventory run for `applySheetChrome`'s signature and the sheet class
      vocabulary across `src/`, `tools/` and `styles.css`
- [ ] CHK-FIX-004 [P0] N/A recorded rather than ticked: no path, parser, redaction or security
      surface is touched by this phase
- [ ] CHK-FIX-005 [P1] Matrix axes listed: {instance} × {7 elements} × {light, dark} × {390x844,
      768x1024}, with the row count stated
- [ ] CHK-FIX-006 [P1] Global-state variant executed — `visualViewport` and `document.body` are
      process-wide, and a second sheet must not read the first's state
- [ ] CHK-FIX-007 [P1] Evidence pinned to a fix SHA, not a branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## SECURITY

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] The width field rejects non-numeric input rather than applying `NaN`
- [ ] CHK-032 [P1] N/A — no auth or authorization surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] CHK-040 [P1] `spec.md`, `plan.md`, `tasks.md` and `acceptance-criteria.md` agree on the
      requirement numbering
- [ ] CHK-041 [P1] The comment above the sheet module's grammar contract says why an element is
      owned centrally, not what the code does
- [ ] CHK-042 [P1] `../roadmap.md` §4 rows 40, 41 and 43 carry the measured after-numbers
- [ ] CHK-043 [P2] `src/views/README.md` names the sheet module as the grammar owner
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 0/12 |
| P1 Items | 15 | 0/15 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-04
<!-- /ANCHOR:summary -->
