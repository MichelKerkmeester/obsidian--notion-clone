---
title: "Tasks: Phone toolbar icon+label buttons matching the Notion/Anytype/Bases reference, with horizontal overflow scroll"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phone toolbar icon+label buttons matching the Notion/Anytype/Bases reference, with horizontal overflow scroll

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
## Phase 1: Red

- [x] T001 Write `tools/live/phone-toolbar-scroll.ts`: mount the full phone toolbar (`.is-phone`, `showDatabaseChrome: true`), every optional control enabled, measure row height/single-line, label presence, ≥44px, scroll overflow, last-control reachability, scrollbar hidden
- [x] T002 Write `tools/live/run-phone-toolbar-scroll.mjs`: bundle and run T001's harness at a 402px viewport in real Chrome
- [x] T003 Run the new lane against the unmodified codebase and confirm it fails for the right reasons (no labels, 28px controls, no overflow at 398/398)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Add `appendToolbarControlLabel` to `toolbar-primitives.ts`; call it from `createControlClusterButton` (filter/sort/columns)
- [x] T005 Call `appendToolbarControlLabel` from the three `createIconButton` call sites in `toolbar-renderer.ts` (settings, utilities/"more", group — group's call sits after `appendSvg` so the icon precedes the label)
- [x] T006 `styles.css`: base `.obnotion-toolbar-control-label { display: none }`; `.is-phone`-scoped rule turns it on and widens the six control classes to `min-width: 44px; height: 44px; padding: 0 var(--obnotion-space-4); gap: var(--obnotion-space-3)`; `.is-phone .obnotion-toolbar { flex-wrap: nowrap }` pins D1
- [x] T007 Measure the operator's reference screenshot for label size/spacing; record the measurement table and documented tolerance in `plan.md`
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T008 Rerun the new lane; confirm green (52px row, 44px controls, scrolls, last control reachable)
- [x] T009 Revert one CSS line, confirm red, restore, confirm green again (red→green discipline proven)
- [x] T010 Rerun `run-toolbar-collapse-sweep.mjs` (009) and `sheet-grammar.mjs` (044); confirm both PASS unaffected
- [x] T011 Add six `RAISED` entries to `tools/live/touch-targets.mjs` locking the 44px floor for the labelled controls; confirm PASS
- [x] T012 `npx tsc --noEmit`, `npx vitest run`, `npm run build`, `render-assertions.mjs`, `verify-placement.mjs` — all exit 0
- [x] T013 `npm run screenshots` twice; judge every mover by decoded pixel delta; revert the one jitter-only capture (`table-frozen-column-mobile-light.png`, maxDelta 1, moved in one run only); append the acquire/edit/release triplet to `tools/lane/css-lane.json`
- [x] T014 `node tools/live/evidence.mjs --check-all`; re-run every stale lane until all 15 artifacts report fresh
- [x] T015 `npm run gate` once, foreground; confirm 26 green, 0 red
- [x] T016 `scan-comments.mjs`, `scan-failing-values.mjs` — both exit 0
- [x] T017 Record the desktop-vs-phone decision as ADR-001 in `decision-record.md`
- [x] T018 Update `acceptance-criteria.md`, `implementation-summary.md`, `plan.md`, this file with the real evidence; leave AC-006 unticked (operator-owned)
- [x] T019 Lock the phone strip to horizontal-only scroll (operator 0.0.36 vertical-scroll report): extend `phone-toolbar-scroll.ts` + `run-phone-toolbar-scroll.mjs` with the vertical containment assertions (scrollHeight − clientHeight = 0, `overflow-y` hidden, `touch-action` pan-x, `overscroll-behavior-x` contain, forced `scrollTop` reads back 0, every control's box inside the strip) — red at 6px of travel, `auto`/`auto`/`auto`; fix at the source in `styles.css` (`overflow-y: hidden` on both phone rules, `touch-action: pan-x`, `overscroll-behavior-x: contain`, padding-bottom 2 → 8px so the 8px touch halo stays inside the strip's box, row 52 → 58px with every control fully visible); screenshots ×2 deterministic (12 movers, identical both runs, 0 jitter), evidence 15/15 fresh, touch-targets unchanged, gate 27/0
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All agent-owned tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [ ] Manual verification passed — operator device check (AC-006), intentionally left open
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
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

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete
- [ ] CHK-022 [P1] Edge cases tested
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests.
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed.
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation implemented
- [ ] CHK-032 [P1] Auth/authz working correctly
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments adequate
- [ ] CHK-042 [P2] README updated (if applicable)
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
| P0 Items | [X] | [ ]/[X] |
| P1 Items | [Y] | [ ]/[Y] |
| P2 Items | [Z] | [ ]/[Z] |

**Verification Date**: 2026-09-08
<!-- /ANCHOR:summary -->

---



