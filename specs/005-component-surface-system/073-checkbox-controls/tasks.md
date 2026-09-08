---
title: "Tasks: Checkbox size on phone and removing radio-style inputs in favour of checkboxes"
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
# Tasks: Checkbox size on phone and removing radio-style inputs in favour of checkboxes

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
## Phase 1: Inventory (all Done before any conversion, per D1)

- [x] T001 Inventory every radio-style control with its real semantics (this file's ANCHOR:inventory)
- [x] T002 Cross-check the inventory against an independent producer-shape grep over `src/**.ts` — 3 = 3
- [x] T003 [P] Identify what renders the R3 screenshot's bare `0` — the value slot renders only the checkbox; the `0` was a sibling number property, repaired by 070; recorded, decision-record.md §5
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation (all Done)

- [x] T004 RED: the control-geometry pass (tools/live/touch-targets.mjs, third pass) mounts the board card + a table checkbox cell + the view-config panel on a forced-coarse 390×844 page; recorded: 94 glyphs at 28×28, hit 40×40, 3 radios, board 0/0/0 (the bench carries no checkbox column, so the pass mounts a capture-sized copy)
- [x] T005 Release the shared checkbox's coarse 28px minimum; a -15px `::before` pays the 44px target, cascade-ordered after the -6px base rule (styles.css)
- [x] T006 The select-column/divider/selection-clear trio: same release, its -8px inset → -15px (styles.css)
- [x] T007 Convert the 3 producers: toolbar placement + column-width presets (role=checkbox, the group holds the single-select) and the computed-sync cards (native radios → shared checkbox, value kept, re-tap re-asserts); ADR at each site and in decision-record.md §3
- [x] T008 Repair the shrink's one placement consequence: the select column's 28px-era 40px reserve and its sorted-state `<col>` hint (styles.css); the 64px reorderable step kept — its surplus is what clears the -15px inset of the move button
- [x] T009 GREEN: 94 glyphs in 14–18px, hit ≥44, 0 radios, board 36/18/0
- [x] T010 Unit test with a reverted-line proof: the -15px inset reverted → coverage test red; restored → green (checkbox-family-coverage.test.ts)
- [x] T011 Update the desktop expectations the conversion changed (view-config-panel-renderer.test.ts, column-width.test.ts) — exactly one card selected, no radio of either spelling, the grammar column's reason named
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification (machine checks Done; the device check is the operator's)

- [x] T012 `npx tsc --noEmit` 0; `npx vitest run` 153/1673 0; `npm run build` 0
- [x] T013 sheet-grammar 0; render-assertions 0; touch-targets 0 (ratchets 171/785, not grown); placement 413/415 + 2 declared
- [x] T014 `npm run screenshots` ×2 + decoded pixel delta: 91 real movers, all in both runs, named in the css-lane release; 1 jitter candidate (4px@1, one run) self-reverted; 4 fit-content canvases resized
- [x] T015 css-lane acquire → edit → release at f0948229bfcc; check-lane 0 (78 content-changed named); evidence 15/15 fresh after 12 stale artefacts were re-run by their own tools
- [x] T016 `npm run gate` once, exit 0 (log under tools/lane/gate-logs/, summary count read)
- [x] T017 scan-comments 0; scan-failing-values 0
- [ ] T018 Operator device confirmation — AC-005, the operator's phone; this row stays open until they say so
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]` — except T018, the operator device confirmation, which no agent may tick
- [x] No `[B]` blocked tasks remaining
- [x] Machine verification passed (the Verification table in implementation-summary.md)
- [ ] Device confirmation passed — awaiting the operator (AC-005)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

---

<!-- ANCHOR:inventory -->
## Producer Inventory (radio-style + checkbox)

### Radio-style producers (grep: `role="radio"`, `type="radio"`, recounted 2026-09-08)

| # | Producer | file:line | Shape | Semantics |
|---|----------|-----------|-------|-----------|
| R1 | New-record placement picker (`.obnotion-new-placement`) | `src/views/toolbar-renderer.ts:2469` (queries own `[role=radio]` at 2473) | button `role=radio` + `aria-checked` | exclusive choice (placement) |
| R2 | Column-width equal-columns option | `src/views/column-width.ts:413` | button `role=radio` + `aria-checked=false` | exclusive choice |
| R3 | Computed-sync-mode option cards | `src/views/view-config-panel-renderer.ts:1799-1804` (`radio.checked` 1802-1804) | native `input[type=radio]` name=`computed-sync-mode` | exclusive choice (sync mode) |

Radio-adjacent (records only, no conversion): `src/views/toolbar-renderer.ts:2211` (keyboard-focus selector string); `src/views/sheet-grammar.ts:154,162` (grammar rule exempts panels containing native radios — revisit when R3 converts); tests asserting desktop radios remain: `src/views/view-config-panel-renderer.test.ts:336,344-348`, `src/views/column-width.test.ts:155-158`.

Cross-check (SC-001): grep of producer shapes (`type: "radio"`, `type="radio"`, `role: "radio"`, `role="radio"`) over `src/**.ts` = 3 producer sites (R1, R2, R3); inventory rows = 3. Match.

### Checkbox producers (families, not every cell)

| Family | Primary file | Notes |
|--------|--------------|-------|
| Shared checkbox component | `src/views/checkbox.ts` | stamps `obnotion-checkbox`; app-wide appearance; glyph 18px (`styles.css:10147-10151`); hit area via ::before (`tools/live/touch-targets.mjs:109-111`) |
| Board card checkbox-property control ("Pinned", R3 evidence) | `src/views/board-renderer.ts` → `.obnotion-kanban-card-meta` field, `is-checkbox-field` (`styles.css:10122-10151`, `10719-10726`) | circle glyph scoped to the kanban card (`styles.css:10145-10151`) |
| Table select-col checkbox | `src/views/table-renderer.ts` + `styles.css:6542-6590` | owned + borrowed forms |
| Checkbox cell (table) | `src/views/cell-renderer.ts` / `.obnotion-checkbox-cell` (`styles.css:7780-7827`) | "Square, never a radio" (`card-field-renderer.stories.ts:59`) |
| Modal / option-label checkboxes | various modals, `styles.css:9660-9699`, `13502-13527` | `not(.obnotion-checkbox)` variants |
| One-offs: selection-clear / computed-preview / group-divider | `styles.css:3166, 5822, 8787` | single instances |

Owning tests: `checkbox-borrowed-ancestor.test.ts`, `checkbox-family-coverage.test.ts`, `checkbox.stories.ts`.

### The bare `0` under "Pinned"

Each card in the R3 screenshot shows the large circle plus the literal `0` beneath it. To confirm during implementation: the value slot of the checkbox-property field renders its raw/unchecked state (`.is-checkbox-field .obnotion-board-card-value`, `styles.css:10719-10726`). Fix = show the real value; if property reads are still dead, record as a finding and defer to the property-reads packet.
<!-- /ANCHOR:inventory -->

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

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks (the gate's lint:tools leg)
- [x] CHK-011 [P0] No console errors or warnings (every lane reads its own output; exit 0 throughout)
- [x] CHK-012 [P1] Error handling implemented (the computed-sync re-tap re-asserts; the geometry pass refuses rather than mis-measures)
- [x] CHK-013 [P1] Code follows project patterns (the shared checkbox factory; the lanes' premise/refusal conventions)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met — AC-001…AC-004 Met; AC-005 (device) open, which is what keeps this box unticked
- [ ] CHK-021 [P0] Manual testing complete — the operator's device pass is the manual leg; everything machine-checkable is recorded
- [x] CHK-022 [P1] Edge cases tested (desktop/sheet/phone branches of the computed-sync; the reverted-inset proof; the borrowed-ancestor and family-coverage suites)
- [x] CHK-023 [P1] Error scenarios validated (the geometry pass refuses on a lost premise; the placement and sheet-grammar negative controls)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests.
- [x] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests — not applicable: this packet ships no such fix; the row records that verdict
- [x] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed: 3 producer sites × 3 shapes (native radios, role=radio buttons, glyph-only role), stated in tasks.md's inventory
- [x] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state: the geometry pass forces the coarse pointer at the engine and proves its own premise before measuring
- [x] CHK-FIX-007 [P1] Evidence pinned: the control-geometry numbers, the placement count and the 78-capture release are stamped against f0948229bfcc
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets (none added; the packet touches styles, control roles and harness measurements)
- [x] CHK-031 [P0] Input validation implemented (beyond the above, not applicable; the lanes' premise checks carry the guard duty)
- [x] CHK-032 [P1] Auth/authz working correctly (untouched by this packet; the full suite stays green)
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized (spec status, this ledger, the acceptance criteria and the decision record state the same final state)
- [x] CHK-041 [P1] Code comments adequate (durable why at every conversion site and every arithmetic change; no artifact labels in code)
- [x] CHK-042 [P2] README updated (not applicable — no surface added; the css-lane release note is this packet's changelog)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only (the .pixel-delta-run*.json census files at the worktree root are removed before the packet commits)
- [x] CHK-051 [P1] scratch/ cleaned before completion (nothing to clean)
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 14 | 12 (CHK-020 and CHK-021 wait on the operator's device confirmation) |
| P1 Items | 10 | 10 |
| P2 Items | 1 | 1 |

**Verification Date**: 2026-09-08
<!-- /ANCHOR:summary -->

---



