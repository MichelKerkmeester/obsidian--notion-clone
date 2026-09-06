---
title: "Tasks: Card Title and Title Formats"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "058 tasks"
  - "card title format tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Card Title and Title Formats

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Read the existing `titleField` mechanism and its callers, so this packet edits the read
      path rather than duplicating the picker. Findings recorded in `goal.md` §4 Progress:
      `ViewConfig.titleField` (`types.ts:570`), `NO_TITLE_FIELD` (`:354`), the picker in
      `view-config-panel-renderer.ts:1902-1920`, `resolveTitleFieldDisplay`
      (`title-field-display.ts:36-61`), and its callers in `board-renderer.ts` and
      `record-detail-panel.ts` (`:485-488`)
- [x] T002 [P] Check the Anytype and (queued) Notion references. Anytype: no separate title
      relation exists, the object Name is always the title (`screenshots/anytype/README.md:293`) —
      nothing to adopt. Notion: `047`'s Mobbin harvest has not landed; no `screenshots/notion/`
      directory exists — recorded as pending in `goal.md` D6
- [ ] T003 Measure the red: construct a currency-typed `titleField` view and record
      `resolveTitleFieldDisplay`'s current output (expected: the raw numeric string, e.g. `3537.32`,
      not `€ 3.537,32`), before any code change
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Widen `resolveTitleFieldDisplay`'s non-file branch (`title-field-display.ts:52-60`) to
      look up the chosen column's `type`/`numberDisplayStyle` and call the same formatter
      `cell-renderer.ts`'s `switch (displayType)` (`:301-325`) calls for that column — `number` and
      `currency` first; `date`/`datetime` if the column-lookup shape makes it free, else a named
      follow-up. The `file.*` and `text` branches stay byte-identical to today's output
- [ ] T005 Give `board-card-properties-panel.ts`'s Title fixed slot (`:43`) a click handler that
      opens the existing `titleField` picker (`view-config-panel-renderer.ts:1902-1920`), with a
      negative control proving the Cover row directly above it (`:42`) gains no handler
- [ ] T006 [P] Add the regression test locking the board/record-header/phone-sheet `titleField`
      agreement already true in code (`record-detail-panel.ts:485-488`), so a future edit to
      `getRecordEventTitleField` cannot silently fork the three surfaces again
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T007 Add a screenshot scenario per `screenshot-currency.md`: a board card and a record sheet
      header, both titled by a currency column, light and dark, desktop and phone
- [ ] T008 `npx tsc --noEmit`, `npm run build`, `npx vitest run` — all exit 0, read directly
- [ ] T009 `npm run gate` exits 0 with the new lane row observed red before green; `npm run replay`
      holds with reversed 0
- [ ] T010 `npm run screenshots:verify` exits 0; the new capture opened and read by a person, both
      themes
- [ ] T011 Leave the operator row open. An agent never ticks it
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` — except T011, which names the operator's own row and is never ticked
      by an agent
- [ ] No `[B]` blocked tasks remaining
- [ ] Every acceptance criterion in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`
      — except the operator-only row
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Predecessor**: See `../057-calendar-anytype-parity/`
- **Owners this packet reads but does not edit**: `../045-board-card-properties/`,
  `../054-record-and-relation-surfaces/`, `../056-board-anytype-parity/`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in `spec.md`
- [x] CHK-002 [P0] Technical approach defined in `plan.md`
- [x] CHK-003 [P1] Dependencies identified — `045`, `054`, `056` all read the shared resolver;
      none is edited by this packet
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Non-numeric values in a number/currency-typed title column fall back to the
      existing `nonNumericText` path, not a thrown error
- [ ] CHK-013 [P1] The `text`/`file.*` branches of `resolveTitleFieldDisplay` are byte-identical to
      today's output
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] The formatted-title unit test observed red before green
- [ ] CHK-022 [P1] The Title-slot affordance test and its Cover-row negative control both pass
- [ ] CHK-023 [P1] The cross-surface regression test (board/record header/phone sheet) passes
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each change classed: the resolver edit is `cross-consumer` (three readers),
      the Title-slot affordance is `instance-only`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory: `rg -n "stringifyValue" src/data src/views`
      run before and after, confirming no second title-formatting surface was missed.
- [ ] CHK-FIX-003 [P0] Consumer inventory for `resolveTitleFieldDisplay`/`TitleFieldDisplay`:
      `board-renderer.ts`, `record-detail-panel.ts`, `calendar-timeline-model.ts`, `data-source.ts`
      — each checked for whether the resolver's changed output reaches it correctly.
- [ ] CHK-FIX-004 [P0] Not applicable — no security, path, parser or redaction surface changes.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count listed in `plan.md`'s FIX ADDENDUM (5 × 3 = 15).
- [ ] CHK-FIX-006 [P1] Not applicable — no process-wide state read.
- [ ] CHK-FIX-007 [P1] Evidence pinned to the landing commit's own sha, once one exists.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] Not applicable — no input validation surface changes
- [x] CHK-032 [P1] Not applicable — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks/goal/acceptance-criteria/decision-record synchronized
- [ ] CHK-041 [P1] Code comments adequate, once T004/T005 land
- [x] CHK-042 [P2] Not applicable — no README-facing behavior beyond what `CHANGELOG.md` will record
      at release
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — none created
- [x] CHK-051 [P1] scratch/ cleaned before completion — not applicable, none created
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 6 | 3/6 (docs only; code rows pending T004-T010) |
| P1 Items | 8 | 4/8 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-09-06
<!-- /ANCHOR:summary -->

---
