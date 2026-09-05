---
title: "Tasks: Board Anytype Parity"
description: "The ordered legs that take the board from a Project Manager 1:1 copy to Anytype's kanban, true-up first and red-first second."
trigger_phrases:
  - "056 tasks"
  - "board anytype parity tasks"
  - "kanban true-up task"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "authored the task list, t001 true-up through leg e verification"
    next_safe_action: "Dispatch T001 to an image-capable leaf with the 62 kanban capture files"
    blockers:
      - "T004 onward are blocked on T001 and T002"
    key_files:
      - "src/views/board-renderer.ts"
      - "screenshots/anytype/desktop/sets"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-tasks"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "T001 requires an image-capable leaf; a text-only leaf records pixel read owed rather than substituting a DOM reading (054 ADR-005)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Board Anytype Parity

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

- [ ] T001 **The kanban capture true-up, by an image-capable leaf reading the captures px by px.**
      Read all 20 `screenshots/anytype/desktop/sets/<use-case>/anytype-<use-case>-kanban-{light,dark}.png`,
      the 36 `screenshots/anytype/desktop/menus/anytype-menu-kanban-*` and
      `anytype-menu-set-layout-kanban-*` files, and the 6
      `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-kanban-*` / `-view-layout-kanban-*`
      files. Record every value for `spec.md` section 4's thirteen anatomy elements in
      `design-trueup.md`, each with its capture filename. A value not read off a screen is labelled
      **design inferred** with its reason; a leg with no image capability records **"pixel read
      owed"** rather than substituting a DOM reading (`054` ADR-005). Read across the ten use cases
      before recording a value and record the spread when they disagree — `050` generalised a single
      panel five times and was corrected five times. (`design-trueup.md`)
- [ ] T002 **The red-first measurement pass.** Fill every `Today` cell in `checklist.md` with a
      figure read off the current tree, before any code is written. At minimum:
      `grep -o "pm-[a-z-]*" src/views/board-renderer.ts | sort -u | wc -l`;
      `grep -o "pm-kanban[a-z-]*" styles.css | sort -u | wc -l`;
      `rg -n "position: sticky" styles.css` scoped to the board block;
      `rg -n "boardExtensions" src/views/board-renderer.ts`;
      `grep -o "pm-gantt[a-z-]*" src/views/calendar-timeline-renderer.ts styles.css | sort -u | wc -l`
      as REQ-009's baseline. A `Today` cell written after the fix is a cell nobody can check against
      the tree that produced it. (`checklist.md`)
- [ ] T003 [P] **Disposition the seven local extensions** against T001's output: swimlanes, covers,
      WIP counts, summaries, batch order, touch menus, group controls
      (`src/views/board-renderer.ts:202-205`). Each gets `retire` or `fold` in `spec.md` section 4's
      table, with the capture that justifies a `fold` or the absence that justifies a `retire`.
      None stays default-off. (`spec.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 **Leg A — the renderer's element vocabulary.** Replace the `pm-kanban-*`, `pm-chip`,
      `pm-avatar` and `pm-progress` constructions with the Anytype-shaped elements T001 recorded:
      column header (A1), card (A2), cover (A3), property rows (A4), the new-record affordance
      (A5), column add (A6), grouping and the ungrouped column (A8), option colours (A9), the empty
      column and the deleted-relation state (A11). Preserve the one-write-per-drop invariant.
      (`src/views/board-renderer.ts`)
- [ ] T005 **Leg B — the card and its properties.** Retarget the property row shape to the captured
      card while leaving `045`'s selection mechanism and its panel's public surface untouched.
      `board-card-properties-panel.test.ts` must stay green **without modification**.
      (`src/views/board-card-fields.ts`, `src/views/board-card-properties-panel.ts`)
- [ ] T006 **Leg C — the stylesheet, under the parent's serialized CSS lane.** The board block, and
      the sticky horizontal scrollbar at the captured geometry: 10px tall, 8px above the viewport
      bottom, full content width, colours from the theme's scrollbar tokens rather than Anytype's
      fixed `#B6B6B6`/`#EBEBEB` light-theme pair (`050/design-trueup.md` REQ-003). (`styles.css`)
- [ ] T007 **Leg D — retire or fold the seven extensions** per T003's dispositions, deleting the
      CSS and the tests of anything retired rather than leaving them orphaned.
      (`src/views/board-renderer.ts`, `styles.css`)
- [ ] T008 **Re-point the board's own tests.** `board-renderer-parity.test.ts` asserts Project
      Manager parity today; it must assert the Anytype one. `board-renderer-hierarchy.test.ts`
      follows the new hierarchy. A test still asserting the superseded target is a contradiction,
      not a regression guard. (`src/views/board-renderer-parity.test.ts`,
      `src/views/board-renderer-hierarchy.test.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T009 **Leg E — the gate.** `npm run gate`, exit status read from `$?` and never through a
      pipe. Then `node tools/live/sheet-grammar.mjs`: 12 surfaces and 31 stacked pairs green, exit 0.
- [ ] T010 **The gantt did not move.** Re-read T002's `pm-gantt-*` baseline and the gantt capture
      hashes. Any move must be explained by a named gap from this packet, never rebaselined
      silently. (REQ-009)
- [ ] T011 **Capture and document.** Recapture the board, run `npm run screenshots:verify`, and
      write `implementation-summary.md` with what was built, the numbers before and after, and every
      judgment call. Refresh `../changelog/` for this phase.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
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

- [ ] CHK-001 [P0] Requirements documented in spec.md — thirteen anatomy elements, nine REQ rows
- [ ] CHK-002 [P0] Technical approach defined in plan.md — five legs, grouped by file
- [ ] CHK-003 [P1] Dependencies identified and available — `050` true-up written, `045` shipped,
      the grammar lane green; T001's image-capable leaf is the one still Red
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npm run lint` and the TypeScript build pass, exit read from `$?`
- [ ] CHK-011 [P0] No console errors on a board render with the `049` mock catalogue loaded
- [ ] CHK-012 [P1] The cover-load failure path still routes through `markCoverImageLoadError`
- [ ] CHK-013 [P1] The renderer keeps its existing construction pattern; this packet changes the
      vocabulary, not the architecture
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row is Met, Waived or Superseded
- [ ] CHK-021 [P0] Manual read of the rebuilt board against the captures, desktop and phone
- [ ] CHK-022 [P1] Edge cases from `spec.md` section 8: empty column, deleted group relation,
      over-length titles, past the page limit
- [ ] CHK-023 [P1] The multi-select cross-column drop still commits one property write, not one
      per card
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep — `rg -n 'pm-kanban|pm-chip|pm-avatar|pm-progress' src/views/ styles.css`
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests — the four board test files, the grammar lane, and the gantt's shared stylesheet
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases. **N/A here and recorded as such**: this packet changes presentation only; the one path-adjacent surface, cover-image resolution, is untouched
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed — `plan.md` FIX ADDENDUM lists four axes
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets — presentation-only packet, but the check still runs
- [ ] CHK-031 [P0] Input validation implemented — cover images continue to route through
      `isCoverImageBlocked` / `resolveCoverImage`; this packet does not weaken either
- [ ] CHK-032 [P1] Auth/authz working correctly. **N/A**: an Obsidian plugin reading a local vault
      has no auth surface. Recorded rather than ticked
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments carry the durable why, not the packet number
      (parent CLAUDE.md comment-hygiene hard block)
- [ ] CHK-042 [P2] `screenshots/anytype/README.md` updated if T001 finds a capture gap worth naming
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
- [ ] CHK-101 [P1] All ADRs have status (Proposed/Accepted)
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented — `spec.md` section 4's per-element migration table is it
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] NFR-P01: board render over the `049` 326-record catalogue within 10% of the
      pre-leg baseline, same machine, same session
- [ ] CHK-111 [P1] Scroll remains smooth with the sticky scrollbar attached, measured rather than felt
- [ ] CHK-112 [P2] Load testing beyond the 326-record catalogue. Deferred: the catalogue is the
      program's declared test environment (`049`)
- [ ] CHK-113 [P2] Benchmarks recorded in `implementation-summary.md`
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested — `plan.md` section 7 and L2
- [ ] CHK-121 [P0] Feature flag configured. **Inverted here**: goal D6 requires the opposite —
      **zero** board affordances shipping default-off. The check is that the flag count is 0
- [ ] CHK-122 [P1] Monitoring: the gate's 25 lanes and the grammar lane are the monitoring
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
- [ ] CHK-133 [P2] Data handling: the board writes an existing group property and nothing else
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] API documentation. **N/A**: no public API changes
- [ ] CHK-142 [P2] User-facing documentation updated if the board's affordances move visibly
- [ ] CHK-143 [P2] `design-trueup.md` is the knowledge transfer; a later session reads it rather
      than re-running the sweep
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Ruling and device confirmation | [ ] Open — the operator's own side-by-side against Anytype on iOS and desktop | |
| Fresh reviewer | In-repo verification | [ ] Open — never self-certified (parent D4) | |
<!-- /ANCHOR:sign-off -->
