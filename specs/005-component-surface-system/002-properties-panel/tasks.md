---
title: "Task Breakdown: Properties Panel"
description: "Tasks for 002-properties-panel, one per requirement, each closed only with read evidence and a recorded number."
trigger_phrases:
  - "002 properties panel tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Properties Panel

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked. A task closes only with
evidence a reader can check. For any task carrying a criterion, the evidence includes **the failing
number from before the change and the passing number after** — a task that reports only the passing
number has not shown the check can distinguish.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP [Row-grid audit]

- [ ] **T-000** Read [`../architecture-findings.md`](../architecture-findings.md) §4 and §9, and
      [`spec.md`](spec.md) §2, before opening any source file.
- [ ] **T-001** Confirm `001-overlay-placement-and-menu-language` has landed. Until it does, the
      panel's width and height still come from the positioner and any row measurement is provisional.
- [ ] **T-002** Enumerate every emitted child of `.db-column-manager-row` from
      `column-manager-renderer.ts:176-296`, in source order.
- [ ] **T-003** Build §4's matrix: read-only, required, file field, computed, phone, desktop. For
      each cell record the emitted child count, the **laid-out** child count, the declared track
      count and the resolved grid row of every child.
- [ ] **T-004** [B2] Record the failing diff in both directions: desktop 7 declared vs 8 laid out;
      phone 8 declared vs 7 laid out.
- [ ] **T-005** [B1] Record the failing row height on desktop against the declared `min-height`, and
      which child resolves to grid row 2.
- [ ] **T-006** [B3] Record the failing name width at both breakpoints, and whether the name's right
      edge sits outside the panel's content box.
- [ ] **T-007** [B4] Record the panel's measured height at 40 properties, both viewports, against
      the threshold.
- [ ] **T-008** [B6] Record which children shift when the drag handle is hidden on phone.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Information architecture

- [ ] **T-010** [REQ-003] Decide what the primary line shows and what hides behind an overflow
      affordance. Record the reasoning — the panel is read far more often than it is edited — not
      only the outcome.
- [ ] **T-011** [REQ-004] Decide the name's minimum widths and its containment rule, and confirm they are
      satisfiable within the panel width `001` gives the role.
- [ ] **T-012** [REQ-006] Decide where delete lives and what confirms it. This changes what a single
      click does and is settled here, not during implementation.
- [ ] **T-013** [REQ-005] Decide the panel's own height cap, independent of the positioner's inline
      `maxHeight`.
- [ ] **T-014** Confirm the decision stays inside R3's bound: what the row shows and what hides. The
      editing flows behind those affordances are out of scope.

### Row template and rule resolution

- [ ] **T-020** [REQ-001] Replace the positional track list with named grid areas, in one change. A
      half-converted grid is worse than either whole.
- [ ] **T-021** [REQ-007] Give every condition in §4's matrix a declared area set, so removing a child
      removes its area rather than shifting the others.
- [ ] **T-022** Resolve `styles.css:2036` against `styles.css:18776` to a single declaration — re-resolve the pair with `rg -n 'db-mobile-reorder-controls' styles.css` and read the hits in order rather than trusting the line numbers, and record the computed winner before and after the collapse.
      Decide which behaviour is correct and delete the other; do not append a third rule.
- [ ] **T-023** Resolve `styles.css:16879` against `styles.css:16995` to a single declaration — re-resolve with `rg -n '\.is-phone \.note-database-container \.db-column-manager-row' styles.css` and read the hits in order, recording the computed winner before and after — the
      same way.
- [ ] **T-024** [REQ-002] Ensure no laid-out child resolves to grid row 2 under any condition.
- [ ] **T-025** [REQ-005] Apply the panel height cap.
- [ ] **T-026** [REQ-006] Land the delete-affordance change.
- [ ] **T-027** Hold the serialized CSS lane for the whole phase. Confirm no other spec is editing
      `styles.css`.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [ ] **T-030** Extend the browser harness: the panel rendered by the real
      `column-manager-renderer` at its production mount point, both viewports, the `is-phone` body
      class, every condition drivable, a per-child readout of resolved `grid-area` and
      `grid-row-start`, and property counts of 3, 12 and 40.
- [ ] **T-031** Assert B1 through B6, each having been demonstrated to fail first with its number
      written into `spec.md` §6.
- [ ] **T-032** Confirm the 40-property case is measured, not approximated — B4's threshold is
      unreachable at 12 properties.
- [ ] **T-033** Full screenshot recapture at both viewports x 3, 12 and 40 properties, then
      `screenshots:verify`.
- [ ] **T-034** A human opens every changed PNG. `screenshots:verify` never opens an image.
- [ ] **T-035** Storybook: one story per condition in §4's matrix, at the production mount point.
- [ ] **T-090** Run the full gate set from the final state, reading each exit code without a pipe.
- [ ] **T-091** Operator confirms on device that the panel reads correctly and that delete is no
      longer a one-tap hazard. R6 is behavioural; a capture cannot close it.
- [ ] **T-092** Confirm the scoped diff contains no task-created residue.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- Every requirement REQ-001 to REQ-007 met with cited evidence.
- Every criterion B1-B6 has both its failing and its passing number recorded.
- Both duplicate rule pairs resolved to one declaration each.
- Gates green from the final state; captures re-taken and reviewed by a person.
- Operator confirmation on device recorded for the delete-affordance change.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`checklist.md`](checklist.md)
- [`../architecture-findings.md`](../architecture-findings.md)
- [`../spec.md`](../spec.md)

<!-- /ANCHOR:cross-refs -->
---

<!-- ANCHOR:verification -->
## VERIFICATION CHECKLIST

- [ ] [P0] `npx tsc --noEmit` exit 0, no output, read without a pipe
- [ ] [P0] `npm run build` exit 0
- [ ] [P0] `npm test` all passing
- [ ] [P0] `npm run storybook:placement` green, every check having failed first
- [ ] [P0] `npm run storybook:coverage` green
- [ ] [P0] full recapture then `npm run screenshots:verify` exit 0
- [ ] [P0] human PNG review recorded at 3, 12 and 40 properties
- [ ] [P0] device confirmation recorded for the delete-affordance change
- [ ] [P1] lint at the existing baseline, not above

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read `RESULT:` lines rather than exit codes under `--recursive`; a fully passing tree still exits 2.
Validate through the hub symlink path — validation run from inside the plugin repo exits 0 printing
nothing, even for a packet missing required files. Never read an exit code through a pipe.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [ ] [P0] `../architecture-findings.md` §4 and §9 read
- [ ] [P0] `001-overlay-placement-and-menu-language` landed
- [ ] [P0] §4's matrix complete with four numbers in every cell
- [ ] [P0] Serialized CSS lane confirmed free

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] [P1] No `element.style.*` assignment with a string literal; use `setCssProps`
- [ ] [P1] No spec path, requirement id, task id or phase number in any code comment
- [ ] [P1] New modules carry the banner and numbered sections the comment scanner requires
- [ ] [P1] A folder reaching three source files carries both `README.md` and `CODE.md`

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## TESTING CHECKLIST

- [ ] [P0] `npm test` green from the final state
- [ ] [P0] No DOM assertion added to a vitest suite — the runner has no jsdom
- [ ] [P0] No criterion closed on a `styles.css` string match; a string match cannot say which of
      two identical selectors won
- [ ] [P0] Mock elements in new tests implement `setCssProps`
- [ ] [P0] Every harness check demonstrated to fail before it is trusted

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] [P0] Every condition in §4's matrix addressed, not the desktop read-write case only
- [ ] [P0] Both duplicate rule pairs resolved by deletion, not by appending a third rule
- [ ] [P0] No adjacent defect "improved" outside the declared scope

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## SECURITY

- [ ] [P0] No network call, telemetry or remote dependency added
- [ ] [P0] No secret, token or absolute personal path in any artifact
- [ ] [P0] No code, CSS value or token scale copied from `external/` — AGPL against this plugin's MIT
- [ ] [P0] No write to the operator's vault beyond the declared testbed

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] [P1] `implementation-summary.md` written once work starts
- [ ] [P1] Failing and passing numbers recorded against every criterion
- [ ] [P1] The information-architecture decision recorded with its reasoning, not only its outcome

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] [P1] `styles.css` not split; edits made in the serialized CSS lane
- [ ] [P1] Screenshot scenarios added in the same change as any new row condition

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | not run |
| `npm run build` | not run |
| `npm test` | not run |
| `npm run storybook:placement` | not run |
| `npm run storybook:coverage` | not run |
| `npm run screenshots:verify` | not run |
| human PNG review | not run |
| device confirmation | not run |

<!-- /ANCHOR:summary -->
