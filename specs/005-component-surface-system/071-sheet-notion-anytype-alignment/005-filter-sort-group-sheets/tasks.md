---
title: "Tasks: Phase 5: filter-sort-group-sheets"
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
# Tasks: Phase 5: filter-sort-group-sheets

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
## Phase 1: Setup (evidence gathered before any edit)

- [x] T001 [P] Read the gap table this spec already carries (`spec.md` §4b, written from the two prior GLM runs) — filter, sort and group each cite their Phase 1 reference-mapping row
- [x] T002 [P] Run `node tools/live/sheet-grammar.mjs` on the inherited worktree state: filter and sort rows green, group overflow sweep red on WebKit (370 vs 366px, both as-built and long-name passes)
- [x] T003 [P] Run `npx vitest run` on the inherited state: 4 failing (view-config segmented verdict, sheet-inventory registered count, unresolved group producer, stale committed inventory.md), 1 non-reproducing
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Diagnose the group popover's overflow against live measurement rather than the inherited floors-vs-min-width hypothesis (which only applies to filter/sort's condition rows, absent from the group popover's markup) — traced to the drag handle's `::before` band assuming the popover's full 374px width while the popover's own 8px `::-webkit-scrollbar` (`.obnotion-container`'s desktop rule) shrinks the flex row the handle centres in by 8px once the popover's content is tall enough to scroll (`styles.css`)
- [x] T005 Hide the desktop-style scrollbar on this family's three sheets — `scrollbar-width: none` plus `::-webkit-scrollbar { display: none; }` on `.obnotion-filter-panel.obnotion-mobile-bottom-sheet`, `.obnotion-sort-panel.obnotion-mobile-bottom-sheet` and `.obnotion-group-popover.obnotion-mobile-bottom-sheet` (`styles.css`, beside the family's shared inset rule)
- [x] T006 Give the `group` sheet-grammar registry row a curated producer (`private renderGroupPopover`, `src/views/toolbar-renderer.ts`) so the coverage inventory can resolve it (`tools/storybook/sheet-inventory.mjs`)
- [x] T007 Move the inventory's pinned registered-row count from 17 to 18 to match the `group` row this phase's own gap table already named (`tools/storybook/sheet-inventory.test.mjs`)
- [x] T008 Regenerate the committed coverage inventory so it matches the registries it is derived from (`specs/.../001-sheet-story-coverage-audit/inventory.md`, via `node tools/storybook/sheet-inventory.mjs`)
- [x] T009 Update the desktop settings panel's `segmented` grammar expectation from `false` to `true`, following `sheet-grammar.ts`'s widened `hasSegmentedToggleRows` predicate (accepts the shared `obnotion-toggle-switch` class alongside `obnotion-checkbox`, needed for the group popover's own switch rows to read as segmented) — a side effect on an unregistered desktop verdict, not a live regression (`src/views/view-config-panel-renderer.test.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T010 `node tools/live/sheet-grammar.mjs` — PASS, both overflow sweep failures cleared, run 3× with no flake
- [x] T011 `npx vitest run` — 1727/1727 passed, run 3× with no flake (the "possibly flaky 5th failure" from the inherited state does not reproduce)
- [x] T012 `node tools/live/sheet-rebuild.mjs` (the `85ff504` freeze-fix regression check) — PASS, every rebuilt sheet still has the bar it opened with
- [x] T013 `npx tsc --noEmit`, `npm run build`, `node tools/live/render-assertions.mjs`, `node tools/live/touch-targets.mjs`, `node tools/storybook/verify-placement.mjs` — all exit 0 (verify-placement: 413/415, 2 declared reds, matching its own baseline)
- [x] T014 `npm run screenshots` twice, judge movers by decoded pixel delta (`tools/screenshots/pixel-hash.mjs`): 14 real, reproducible movers from hiding the family's scrollbar (filter-panel, filter-panel-nested, sort-panel, sort-panel-calendar, active-rule-filter, active-rule-sort, import-confirm-dropdown, each light/dark); 1 pure capture-encoder jitter reverted (`git checkout --`)
- [x] T015 Take over the CSS lane from its released holder (`072-linked-view-blocks-ux`) with the acquire/edit/release triplet, naming the 14 reviewed captures
- [x] T016 `node tools/live/evidence.mjs --check-all`, then `npm run gate` once, foreground, stdin from `/dev/null` — 27/27 green
- [x] T017 `node tools/naming/scan-comments.mjs` and `scan-failing-values.mjs` — exit 0
- [x] T018 Operator report 2026-09-09 ~20:40 (0.0.36, iPhone): the sort sheet presents floating — 8px side insets and a gap underneath — while filter and group span the viewport. Root cause: no panel sheet declared a frame role, so the mounted classifier answered each body's own height; the sort sheet's ~240px body never crosses its flush cutoff. Fix at the producer: `popover-position.ts` learns a `heightRole` pass-through, the sort sheet's mount declares `flush`. New sheet-grammar clause RED (8/8/8, floating) → GREEN (0/0/0, flush) at 390px; `FRAME_SHAPE_SURFACES` sort-panel row amended floating→flush (declared), column-width becomes the floating representative + negative-control target. Captures ×2 exit 0: 4 sort-capture movers, identical counts both runs; board-mobile-desktop-dark 1px@1 one run = jitter, restored + manifest bytes patched (181633). css-lane acquire/edit/release triplet (takeover from 067's release at unchanged 4261be904bfb, no styles.css edit). Evidence re-run 15/15 fresh; gate 27/0 exit 0; `tools/live/sheet-grammar.mjs` 0; renderer-coverage.json stamp refreshed by its own writer. AC-004 recorded Met; operator device recheck stays open per D3 (`src/views/popover-position.ts`, `src/views/sort-panel-renderer.ts`, `tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Manual verification passed
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

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks
- [x] CHK-011 [P0] No console errors or warnings
- [x] CHK-012 [P1] Error handling implemented
- [x] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met
- [x] CHK-021 [P0] Manual testing complete
- [x] CHK-022 [P1] Edge cases tested
- [x] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class: `class-of-bug` — the scrollbar/handle-centring conflict is a mechanism shared by every phone sheet that carries `.obnotion-container` and can scroll, not a group-only defect
- [x] CHK-FIX-002 [P0] Same-class producer inventory: `grep -n "createConditionRow\|appendConditionPart" src/views/*.ts` confirmed only filter/sort call the condition-floor helper the inherited diagnosis blamed; the scrollbar/handle mechanism itself was checked against all three families in this phase's own scope (filter, sort, group) and fixed on all three
- [x] CHK-FIX-003 [P0] Consumer inventory: `tools/storybook/sheet-inventory.mjs` (producer map), `tools/storybook/sheet-inventory.test.mjs` (pinned count), the committed `inventory.md`, and `src/views/view-config-panel-renderer.test.ts` (the desktop `segmented` side effect) all updated together
- [ ] CHK-FIX-004 [P0] N/A — no security/path/parser/redaction surface in this change
- [x] CHK-FIX-005 [P1] Matrix axes: 2 engines (Chrome, WebKit) × 2 passes (as-built, long-name) × 3 families (filter, sort, group) for the overflow sweep; listed before the fix, not after
- [ ] CHK-FIX-006 [P1] N/A — no process-wide/global state read by this change
- [x] CHK-FIX-007 [P1] Evidence pinned to the worktree's own HEAD (`e75a979c`) and this change's own commit, not a moving branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] Input validation implemented
- [ ] CHK-032 [P1] N/A — no auth/authz surface in this change
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
- [x] CHK-041 [P1] Code comments adequate
- [ ] CHK-042 [P2] N/A — no README surface for this change
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only
- [x] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 8/9 (1 N/A) |
| P1 Items | 9 | 7/9 (2 N/A) |
| P2 Items | 1 | 0/1 (N/A) |

**Verification Date**: 2026-09-09
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [x] CHK-101 [P1] All ADRs have status (Proposed/Accepted)
- [x] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] N/A — no migration path for a CSS-only fix
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] N/A — no response-time NFR for this change
- [ ] CHK-111 [P1] N/A — no throughput NFR for this change
- [ ] CHK-112 [P2] N/A — no load-testing surface
- [ ] CHK-113 [P2] N/A — no performance benchmark surface
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [x] CHK-120 [P0] Rollback procedure documented (decision-record.md, ADR-001 Implementation)
- [ ] CHK-121 [P0] N/A — no feature flag for this change
- [ ] CHK-122 [P1] N/A — no monitoring/alerting surface
- [ ] CHK-123 [P1] N/A — no runbook surface
- [ ] CHK-124 [P2] N/A — no deployment runbook beyond the packet's own release cadence
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] N/A — no security review surface
- [ ] CHK-131 [P1] N/A — no new dependency
- [ ] CHK-132 [P2] N/A — no OWASP surface
- [ ] CHK-133 [P2] N/A — no data-handling surface
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [x] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] N/A — no API surface
- [ ] CHK-142 [P2] N/A — no user-facing documentation beyond the packet's own captures
- [x] CHK-143 [P2] Knowledge transfer documented (parent `handover.md` entry)
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Implementation | Technical Lead | [x] Approved | 2026-09-09 |
| Operator | Product Owner | [ ] Pending — device recheck row (per parent goal D3) | |
| Verification chain | QA Lead | [x] Approved | 2026-09-09 |
<!-- /ANCHOR:sign-off -->
