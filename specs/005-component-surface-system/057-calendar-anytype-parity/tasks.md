---
title: "Tasks: Calendar Anytype Parity"
description: "The ordered legs that retarget the calendar to Anytype, true-up first, the operator's scale ruling second, red-first third."
trigger_phrases:
  - "057 tasks"
  - "calendar anytype parity tasks"
  - "calendar true-up task"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "authored the task list, t001 true-up through leg e verification"
    next_safe_action: "Dispatch T001 to an image-capable leaf and put T003's scale question to the operator"
    blockers:
      - "T005 onward are blocked on T001, T002 and the operator's ADR-002 ruling"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "screenshots/anytype/desktop/sets"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-tasks"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "An absence is established across all twenty set captures, never from one"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Calendar Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->

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

- [ ] T001 **The calendar capture true-up, by an image-capable leaf reading the captures px by px.**
      Read all 20 `screenshots/anytype/desktop/sets/<use-case>/anytype-<use-case>-calendar-{light,dark}.png`
      and the 24 `screenshots/anytype/desktop/menus/anytype-menu-calendar-*` and
      `anytype-menu-set-layout-calendar-*` files. Record every value for `spec.md` section 4's nine
      anatomy elements in `design-trueup.md`, each with its capture filename. A value not read off a
      screen is labelled **design inferred**; a leg with no image capability records **"pixel read
      owed"** rather than substituting a DOM reading (`054` ADR-005). **Two absences must be
      established rather than assumed**: A4's unscheduled area and A6's scale switch, each read
      across all twenty set captures before absence is recorded. `050` generalised a single panel
      five times and was corrected five times. (`design-trueup.md`)
- [ ] T002 **The red-first measurement pass.** Fill every `Today` cell in `checklist.md` with a
      figure read off the current tree, before any code is written. At minimum:
      `grep -o 'db-calendar[a-z-]*' src/views/calendar-renderer.ts | sort -u | wc -l`;
      `grep -o 'db-calendar[a-z-]*' styles.css | sort -u | wc -l`;
      `grep -o "pm-gantt[a-z-]*" src/views/calendar-timeline-renderer.ts styles.css | sort -u | wc -l`
      as REQ-009's baseline; and the pass counts of `calendar-keyboard-navigation.test.ts` and
      `calendar-search-placement.test.ts` as REQ-010's. A `Today` cell written after the fix is a
      cell nobody can check. (`checklist.md`)
- [ ] T003 **Put the scale question to the operator as ADR-002.** Present what T001 found — one
      Anytype calendar layout, no captured scale switch — against what we ship: three scales
      (`calendar-renderer.ts:82`), a scale control/menu/popover/segment class family, a week body
      with all-day rows, hour gutters and timed events, and `calendar-keyboard-navigation.test.ts`.
      Record the ruling. Never infer it. (`decision-record.md`)
- [ ] T004 [P] **Disposition the unscheduled backlog drawer** (`db-calendar-backlog*`,
      `calendar-renderer.ts:160-163`) against T001's output: matched to a captured Anytype
      counterpart, or kept as ours with a written argument. (`spec.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T005 **Leg A — the renderer.** Retarget the month grid (A1), the day cells (A2), the event
      chips (A3), the today marker (A7) and the day menu (A9) to T001's recorded values. Implement
      ADR-002's scale ruling — if it removes the week and day scales, that deletion is its own
      clearly-labelled leg landed last, so reverting it does not unwind the retarget.
      (`src/views/calendar-renderer.ts`)
- [ ] T006 **Leg B — navigation.** The captured toolbar (A5): month and year selects, arrows, a
      Today button, and the "today scroll" that positions the current week at the bottom of the
      viewport. Where our toolbar and `053`'s view toolbar overlap, name the boundary before
      editing either. (`src/views/calendar-toolbar-renderer.ts`)
- [ ] T007 **Leg C — the stylesheet, under the parent's serialized CSS lane.** The 133-rule
      calendar block. (`styles.css`)
- [ ] T008 **Leg D — the phone calendar, every value labelled.** There is no iOS Anytype calendar
      reference and there will not be one. Each phone value carries **"design inferred from
      desktop"** and names the desktop capture it came from. `044`'s seven-element grammar binds
      every sheet this leg opens. (`src/views/calendar-renderer.ts`, `styles.css`)
- [ ] T009 **The date-property picker** against
      `anytype-menu-set-layout-calendar-date-property-{light,dark}-full.png` (A8). If it changes
      which date property a calendar reads by default, that is a data-visible change and the leg
      names its reversal. (`src/views/calendar-renderer.ts`)
- [ ] T010 **Follow the tests.** `calendar-renderer.test.ts` follows the retargeted shape.
      `calendar-keyboard-navigation.test.ts` and `calendar-search-placement.test.ts` must stay green
      **without modification** — REQ-010's guard. (`src/views/calendar-renderer.test.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T011 **Leg E — the gate.** `npm run gate`, exit status read from `$?` and never through a
      pipe. Then `node tools/live/sheet-grammar.mjs`: 12 surfaces and 31 stacked pairs green.
- [ ] T012 **The gantt did not move.** Re-read T002's `pm-gantt-*` baseline and the gantt capture
      hashes. `037`'s in-repo parity was 60 of 60 classes with zero divergence at `30c4b746` and
      must stay so. Any move is explained by a named gap, never rebaselined silently. (REQ-009)
- [ ] T013 **Count the unlabelled phone values.** Every phone-calendar value must carry **"design
      inferred from desktop"** with its source capture. The count of unlabelled ones must be **0**.
      (REQ-007)
- [ ] T014 **Capture and document.** Recapture the calendar, run `npm run screenshots:verify`, and
      write `implementation-summary.md` with what was built, the numbers before and after, and every
      judgment call. Refresh `../changelog/` for this phase.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] ADR-002 carries a status other than Proposed
- [ ] Every `acceptance-criteria.md` row is Met, Waived by a named ADR, or Superseded by one
- [ ] The operator's row (AC-010) is the only one that may stay open, and an agent never ticks it
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Thresholds with their failing values**: See `checklist.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Sibling**: `../056-board-anytype-parity/` — the board half of the same operator ruling
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
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md — nine anatomy elements, ten REQ rows
- [ ] CHK-002 [P0] Technical approach defined in plan.md — five legs, gated twice
- [ ] CHK-003 [P1] Dependencies identified and available — `047` section 5 written, the grammar lane
      green; T001's image-capable leaf and the operator's ADR-002 ruling are the two still Red
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npm run lint` and the TypeScript build pass, exit read from `$?`
- [ ] CHK-011 [P0] No console errors on a calendar render with the `049` mock catalogue loaded
- [ ] CHK-012 [P1] The invalid-event repair path (`getCalendarInvalidEventCount` /
      `openCalendarInvalidEvents`) survives the retarget unchanged
- [ ] CHK-013 [P1] The renderer keeps its scale-split structure unless ADR-002 removes two scales
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row is Met, Waived or Superseded
- [ ] CHK-021 [P0] Manual read of the retargeted calendar against the captures, desktop
- [ ] CHK-022 [P1] Edge cases from `spec.md` section 8: empty month, overflowing day, month-edge
      span, DST boundary, unparseable date
- [ ] CHK-023 [P1] A record still lands in exactly one day cell, and the same one it did before
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep — `rg -n 'db-calendar' src/views/ styles.css`
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests — `rg -n 'updateCalendarScale|calendarScale|db-calendar-backlog'` is the inventory ADR-002's answer acts on
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases. **Partially applicable and recorded as such**: the parser case is real here — date parsing at a DST and month-edge boundary — and is CHK-022's; there is no path or redaction surface
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed — `plan.md` FIX ADDENDUM lists four axes, one of which (phone) has no capture at all
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state — the system clock is the one here, and the today marker reads it
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation: date parsing keeps its existing invalid-event handling; this
      packet does not widen what it accepts
- [ ] CHK-032 [P1] Auth/authz working correctly. **N/A**: an Obsidian plugin reading a local vault
      has no auth surface. Recorded rather than ticked
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments carry the durable why, not the packet number
- [ ] CHK-042 [P2] `screenshots/anytype/README.md` gains the iOS-calendar absence under "Views not
      captured, and why", if it does not already name it
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 0/11 |
| P1 Items | 13 | 0/13 |
| P2 Items | 6 | 0/6 |

**Verification Date**: not yet verified — the packet was authored 2026-09-05 and no task has run.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All ADRs have status — ADR-002 must not stay Proposed at closure
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented — `spec.md` section 4's anatomy table is it
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] NFR-P01: calendar render over the `049` 326-record catalogue within 10% of the
      pre-leg baseline, same machine, same session
- [ ] CHK-111 [P1] If A2's per-cell self-loading is adopted, its cost is measured rather than
      assumed cheap
- [ ] CHK-112 [P2] Load testing beyond the 326-record catalogue. Deferred: the catalogue is the
      program's declared test environment (`049`)
- [ ] CHK-113 [P2] Benchmarks recorded in `implementation-summary.md`
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented — `plan.md` section 7 and L2, including the one
      irreversible leg
- [ ] CHK-121 [P0] Feature flag configured. **N/A and deliberately so**: `056` goal D6 forbids
      shipping board affordances default-off and the same posture applies here. A scale removal is
      landed as its own revertible leg instead of hidden behind a flag
- [ ] CHK-122 [P1] Monitoring: the gate's 25 lanes and the grammar lane
- [ ] CHK-123 [P1] Runbook: `plan.md` L2 Enhanced Rollback
- [ ] CHK-124 [P2] Release cadence row added to `../roadmap.md` section 5.3 when this ships
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Accessibility review: every declined parity value names WCAG 1.4.11, WCAG 1.4.3
      or the 44px touch floor, with its measured ratio or size (goal D3)
- [ ] CHK-131 [P1] Dependency licenses compatible. **N/A**: no dependency is added
- [ ] CHK-132 [P2] OWASP Top 10. **N/A**: no network or auth surface
- [ ] CHK-133 [P2] Data handling: the calendar reads and writes an existing date property
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] API documentation. **N/A**: no public API changes
- [ ] CHK-142 [P2] User-facing documentation updated if the scales change, which is operator-visible
- [ ] CHK-143 [P2] `design-trueup.md` is the knowledge transfer, and it carries the phone gap so a
      later session does not go looking for a capture that does not exist
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | The ADR-002 scale ruling | [ ] Open — asked at T003 | |
| Operator | Device confirmation, desktop and phone | [ ] Open — the phone half is read knowing it was inferred | |
| Fresh reviewer | In-repo verification | [ ] Open — never self-certified (parent D4) | |
<!-- /ANCHOR:sign-off -->
