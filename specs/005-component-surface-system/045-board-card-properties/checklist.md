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
| C1 | Inputs deciding a board card's field set | 3, none of them the board's own: the table's `hiddenColumns` via `getVisibleColumns`, `columnOrder`, and two hard-coded type exclusions | 1 — the view's own list | [ ] |
| C2 | Card field sets expressible for two views over one database | 1 — both views read the same visible-column set | 2 distinct | [ ] |
| C3 | `status`/`select` columns renderable in the card meta grid | 0 — removed unconditionally at `board-renderer.ts:1481-1482` | operator's choice | [ ] |
| C4 | Board captures changed by the upgrade, with no stored list | not yet measured; target is the whole point | 0 of N `pixelHash`/`layoutHash` moved | [ ] |
| C5 | `038` board parity fixtures moved with a stored list present and extensions off | not yet measured | 0 | [ ] |
| C6 | Properties control surfaces | 0 — the control does not exist | 2: desktop popover, phone sheet | [ ] |

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

- [ ] CHK-001 [P0] The three current field-selection rules are cited by file:line, not paraphrased
- [ ] CHK-002 [P0] The reference card's fixed slot set is recorded as the boundary, with the
      vendored source cited
- [ ] CHK-003 [P0] The persisted shape is written down before it is written into `types.ts`
- [ ] CHK-004 [P1] The differential test exists before the renderer swap lands
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] CHK-010 [P0] `npm run lint` and `tsc --noEmit` exit 0
- [ ] CHK-011 [P0] No console errors while opening, editing and closing the Properties control
- [ ] CHK-012 [P1] A stored key absent from the schema is skipped, never fatal and never blanking
- [ ] CHK-013 [P1] The resolver has one call site; `renderReferenceCard` is not one of them
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## TESTING

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row that is not operator-only is `Met` with
      observed evidence
- [ ] CHK-021 [P0] `npm run gate` exits 0, read without a pipe
- [ ] CHK-022 [P1] Empty list, deleted key, and a schema whose only field is the title, all covered
- [ ] CHK-023 [P1] A malformed stored list loads as absent rather than throwing
- [ ] CHK-024 [P1] A constructed scenario carries a non-default list, so the feature is photographed
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] CHK-FIX-001 [P0] Finding class recorded: `cross-consumer`. Board and table share one
      visible-column producer; this removes a consumer rather than changing the producer.
- [ ] CHK-FIX-002 [P0] Producer inventory run — `rg -n 'getVisibleColumns|getColumns\(' src`, before
      and after counts stated
- [ ] CHK-FIX-003 [P0] Consumer inventory run for `hiddenColumns`, `columnOrder`, `showEmptyFields`
- [ ] CHK-FIX-004 [P0] N/A recorded rather than ticked: no path, parser, redaction or security
      surface
- [ ] CHK-FIX-005 [P1] Matrix axes listed: 16 rows, and the eight extensions-off rows must all
      produce the reference DOM
- [ ] CHK-FIX-006 [P1] N/A — no process-wide state read
- [ ] CHK-FIX-007 [P1] Evidence pinned to a fix SHA
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## SECURITY

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] The stored list holds field keys only, never values
- [ ] CHK-032 [P1] N/A — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] CHK-040 [P1] Spec/plan/tasks agree on requirement numbering
- [ ] CHK-041 [P1] The resolver's comment says why the board stopped reading the table's hidden
      columns
- [ ] CHK-042 [P1] `../roadmap.md` §5 carries the measured result
- [ ] CHK-043 [P2] `src/views/README.md` names the resolver as the card field-set owner
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
| P0 Items | 11 | 0/11 |
| P1 Items | 14 | 0/14 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-04
<!-- /ANCHOR:summary -->
