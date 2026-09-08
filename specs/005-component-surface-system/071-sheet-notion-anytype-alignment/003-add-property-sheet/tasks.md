---
title: "Tasks: Phase 3: add-property-sheet"
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
# Tasks: Phase 3: add-property-sheet

<!-- SPECKIT_LEVEL: 3 -->

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

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Read 001's inventory row for the add-property / property-type-picker family (producer, coverage, reference mapping) — `specs/005-component-surface-system/071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit/inventory.md` row 2: producer `src/views/modals/create-property-modal.ts`, references Notion `notion/ios/database` (properties-01/02 +13) / Anytype desktop + mobile, absorbed replace-in-place shape uncovered by any pixel reference
- [x] T002 Record the reference gap table into the packet spec §4b, current vs Notion vs Anytype per element (spec.md)
<!-- /ANCHOR:phase-1 -->

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Extend the `properties create property` lane in `tools/live/sheet-grammar.mjs`: device-keyboard clearance (sheet top ≥ header bottom, 336px visualViewport inset), sheet height ≤ viewport − keyboard − header, 21 rows at 44–52px pitch with icon + label, name field pinned above the list, 16px horizontal padding, in-sheet list scrolling, no horizontal overflow at 402×874
- [x] T005 Run the lane RED against the unfixed sheet and record the numbers — with styles.css stashed: pitch `min 0.0 / max 30.0`, 16px padding FAIL, list scroll `210>210`; keyboard clearance already held unfixed (top 84.4 ≥ 44.0) (tools/live/sheet-grammar.mjs)
- [x] T006 Extract the shared `renderCreatePropertyBody` (name/key pinned above a 21-row flat type list, gated-format reasons, label→key mirror, locked read-only row) and mount it from `CreatePropertyModal` (src/views/modals/create-property-modal.ts)
- [x] T007 Add the create-property stylesheet block: pinned fields, sole-scrolling list under a definite keyboard-aware height, 44px minimum-pitch rows, 16px inline padding (styles.css)
- [x] T008 Unit-test the choices underneath the geometry (src/views/modals/create-property-modal.test.ts)
<!-- /ANCHOR:phase-2 -->

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T008 RED→GREEN proof: reverting the gated-reason producer line fails 1 of 8 tests; restoring it passes 8/8; the stashed-styles lane failures above flip green (sheet top 238.4 ≥ 44.0, pitch 44.0/44.0, height 261.6 ≤ 464.0, no overflow 402×874)
- [x] T009 Edge cases: gated Rollup keeps its reason inline; locked entry point renders one read-only row; 402×874 no-overflow guard
- [x] T010 Full battery: `npx tsc --noEmit` 0 · `npx vitest run` 160/1731 · `npm run build` 0 · `sheet-grammar.mjs` 0 · `render-assertions.mjs` 0 · `touch-targets.mjs` 0 · `verify-placement.mjs` 413/415 (2 declared) · screenshots ×2 0/0 + pixel-delta (2 movers, both runs, kept) · 11 stale evidence writers re-run, `evidence --check-all` 15/15 · `npm run gate` 27 green / 0 red · `scan-comments` 0 · `scan-failing-values` 0 · css-lane acquire/edit/release + `check-lane.mjs` 0
- [x] T011 Documentation: acceptance criteria Met with observed evidence, implementation summary, decision record (ADR-0001–0004), goal completion criteria
<!-- /ANCHOR:phase-3 -->

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Manual verification passed — the program's harness battery (gate 27 green / 0 red) substitutes for hands-on; the operator's on-device read stays the operator's row
<!-- /ANCHOR:completion -->

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

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Dependencies identified and available (001's inventory row 2 landed; the reference harvests are in-repo)
<!-- /ANCHOR:pre-impl -->

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks — `scan-comments` 0, gate's style lanes green
- [x] CHK-011 [P0] No console errors or warnings — grammar/parity/teardown logs clean
- [x] CHK-012 [P1] Error handling implemented — gated formats carry reasons; locked entry points render one read-only row; confirm-side collision checks unchanged with the class
- [x] CHK-013 [P1] Code follows project patterns — the `.obnotion-modal*` ladder, the sheet grammar's producer contract, comment grammar (scan-comments: 0 artifact-id violations)
<!-- /ANCHOR:code-quality -->

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met — AC-001/002/003 Met, evidence observed (acceptance-criteria.md)
- [x] CHK-021 [P0] Manual testing complete — the grammar's device-path reproduction IS the manual check this program substitutes; operator device read outstanding (theirs to do)
- [x] CHK-022 [P1] Edge cases tested — gated format, locked entry point, 402×844/874 narrowness, keyboard inset 0 → 336
- [x] CHK-023 [P1] Error scenarios validated — revert-line red (1/8 failed → 8/8), stashed-styles lane red (3 assertions)
<!-- /ANCHOR:testing -->

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] `class-of-bug`: the keyboard-overlap defect was a whole-form replace-in-place trade; the fix class (pinned fields + sole-scrolling list + definite height) applies to the one producer of this surface
- [x] CHK-FIX-002 [P0] Producer inventory: `grep -rn 'CreatePropertyModal\|renderCreatePropertyBody' src/ tools/` — one producer, the shared builder; both readers are harness+plugin, no copies
- [x] CHK-FIX-003 [P0] Consumer inventory: the confirm step's collision checks stay with the class; every `CreatePropertyModal` caller keeps its contract (verified by the 1731-test suite)
- [x] CHK-FIX-004 [P0] Not a parser/security fix — the adversarial table tests of CHK-FIX-004 do not arise; the class here is layout, and its matrix is the lane's 10 assertions
- [x] CHK-FIX-005 [P1] Matrix: 21 formats × (interactive, locked-readonly, gated+reason) × 390×844 and 402×874 — the lane runs 21 rows, the unit suite covers the gated and locked arms, the 402×874 overflow assertion covers the narrow viewport
- [x] CHK-FIX-006 [P1] No process-wide state read — the builder is pure DOM; nothing to execute hostilely
- [x] CHK-FIX-007 [P1] Evidence pinned to the leg's tree: styles.css `8991c15f8106` (css-lane release), HEAD 00cb6686
<!-- /ANCHOR:fix-completeness -->

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — only structure/markup in this leg
- [x] CHK-031 [P0] Input validation implemented — key-collision and file-field-name checks unchanged and still with the confirm step (unit-covered)
<!-- /ANCHOR:security -->

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized — this file, acceptance-criteria.md, implementation-summary.md, decision-record.md, goal.md written this leg
- [x] CHK-041 [P1] Code comments adequate — comment grammar scanned, 0 violations
- [ ] CHK-042 [P2] README updated — nothing user-facing changed beyond the sheet itself; deferred
<!-- /ANCHOR:docs -->

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files: this leg's transient logs live in /tmp and scratchpad, the gate log at the worktree root is land-verify's own convention
- [x] CHK-051 [P1] scratch/ cleaned — nothing added under scratch/
<!-- /ANCHOR:file-org -->

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 11/11 |
| P1 Items | 9 | 9/9 |
| P2 Items | 2 | 1/2 (CHK-042 deferred: no README surface for this change) |

**Verification Date**: 2026-09-08
<!-- /ANCHOR:summary -->

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] Architecture decisions documented in decision-record.md (ADR-0001–0004, this packet)
- [x] CHK-101 [P1] All ADRs have status — Accepted ×4
- [x] CHK-102 [P1] Alternatives documented with rejection rationale — each ADR carries its rejected alternatives
- [x] CHK-103 [P2] Migration path — n/a: no data migration; the retired trigger-and-replace shape has no persisted state
<!-- /ANCHOR:arch-verify -->

<!-- ANCHOR:docs-verify -->
## Documentation Verification

- [x] CHK-140 [P1] Spec/plan/tasks synchronized — this leg's spec §4b, tasks and acceptance criteria carry the same numbers
- [x] CHK-141 [P2] No API documentation surface for this change
- [x] CHK-143 [P2] Knowledge transfer — the packet spec §4b, the implementation summary and the track handover carry the evidence
<!-- /ANCHOR:docs-verify -->
