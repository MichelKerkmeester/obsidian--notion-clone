---
title: "Task Breakdown: Overlay Placement and Menu Language"
description: "Tasks for 001-overlay-placement-and-menu-language, one per requirement, each closed only with read evidence and a recorded number."
trigger_phrases:
  - "001 overlay placement tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Overlay Placement and Menu Language

<!-- SPECKIT_LEVEL: 3 -->
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
## PHASE 1: SETUP [Census]

- [ ] **T-000** Read [`../architecture-findings.md`](../architecture-findings.md) §7 and §9, and
      [`spec.md`](spec.md) §2, before opening any source file.
- [ ] **T-001** Confirm `000-surface-contract-and-truthful-harness` has landed and the factory
      stamps `data-db-surface`. This phase cannot start otherwise.
- [ ] **T-002** Build the trigger census of `spec.md` §4: trigger, role, anchor, mount, options, for
      every toolbar button, header affordance, cell affordance, context menu and submenu, desktop
      and phone.
- [ ] **T-003** Reconcile the census against the 33 `positionToolbarPopover` call sites, the 11
      production owned menus and the `column-menu.ts` subpopover — **in both directions.** Record
      every trigger with no call site and every call site with no trigger as a finding.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Placement contract

- [ ] **T-010** [REQ-001] Write the placement contract per role: bounds, flip, clamp, sidebar avoidance,
      popped-out window. One authority, expressed as roles, not as numbers at call sites.
- [ ] **T-011** [REQ-002] Define per-role sizing. Menu role sizes from 292px. Record which of the 15
      bespoke call sites map onto an existing role and which justify a new one.
- [ ] **T-012** [REQ-002] Establish that the 520px default is unreachable — no code path may produce a
      four-item menu at that width.
- [ ] **T-013** [REQ-003] Confirm the bounds definition against `getVisiblePopoverBounds`
      (`popover-position.ts:271`), including the popped-out-window fallback branch that nothing
      currently exercises.
- [ ] **T-014** [A1] Record the failing rect for every censused surface at 1440, 1024 and 768, both
      sidebar states — 6 configurations each. Record the overflow in px per axis, starting with
      More tools.
- [ ] **T-015** [A7] Record the measured width of Filter, Sort and Column Manager today.

### Row grammar

- [ ] **T-020** [A3] Record the failing measurement: the canonical row's computed `display` and the
      label and value rects, inside `.db-owned-menu` and in a bare `div`.
- [ ] **T-021** [REQ-004] Collapse `renderTitleActionsPopoverRow` and `renderViewTabPopoverRow` onto
      `createMenuRow` first. They are line-for-line identical apart from the close call, so they are
      the cheapest proof the substitution preserves behaviour.
- [ ] **T-022** [REQ-004] Retire the remaining `render*Row` methods and the row-class grammars they emit
      in `toolbar-renderer.ts`, one commit per grammar so a regression bisects to a grammar.
- [ ] **T-023** [REQ-004] Make a row carry its own layout, so its computed layout survives a change of
      container. The container-keyed `display: flex` is retired.
- [ ] **T-024** [A4] Record the failing measurement: opening a chevron row today produces zero new
      surface nodes.
- [ ] **T-025** [REQ-005] Make `submenu: true` open a real submenu through the same factory that produced
      its parent.
- [ ] **T-026** [REQ-005] Retire `column-menu.ts`'s body-mounted subpopover **onto** the factory-backed
      submenu, only after T-025 passes A4. The working mechanism stays until the honest one works.

### Panel parity

- [ ] **T-030** [A2] Record the failing measurement: the distinct-value count for padding, radius,
      shadow, row height and font-size across every pair in each role.
- [ ] **T-031** [A5] Record the failing measurement: Filter's and Sort's role attribute, tab-cycle
      exit target and Escape behaviour.
- [ ] **T-032** [REQ-006] Give Filter, Sort, Column Manager and view-config one role, and with it one
      focus behaviour and one keyboard contract.
- [ ] **T-033** [A6] Run the class-deletion sweep. Record the four values that move when
      `db-filter-panel` is removed from the Sort panel.
- [ ] **T-034** [REQ-007] Resolve Sort's dual-class dependency — declared explicitly or eliminated, never
      left implicit.

### Landing the changes

- [ ] **T-040** Land the source changes for the placement contract across all 33 call sites.
- [ ] **T-041** [REQ-008] Delete the dead panel layout block at `styles.css:9829-9852` — re-resolve it with `rg -n -B8 -A16 'max-width: min\(760px, calc\(100vw - 72px\)\)' styles.css` rather than trusting the line number — or make it live. Closes on AC-008's before/after computed-geometry diff (0 moving values across the 8 panel selectors and every positioner surface), never on the deletion itself.
      A block the positioner overwrites inline must not read as authoritative.
- [ ] **T-042** [REQ-008] Delete the `db-anchored-popover` marker, or give it a rule.
- [ ] **T-043** Hold the serialized CSS lane for the whole phase. Confirm no other spec is editing
      `styles.css`.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [ ] **T-050** Extend `tools/storybook/verify-placement.mjs`: 1024 and 768 widths, sidebar-closed
      state, popped-out-window layout, the container-relative pair for A3, the class-deletion sweep
      for A6. Keep bundling the shipped positioner rather than reimplementing it.
- [ ] **T-051** Assert A1 through A7, each having been demonstrated to fail first with its number
      written into `spec.md` §6.
- [ ] **T-052** Full screenshot recapture at 4 widths x sidebar states, then `screenshots:verify`.
- [ ] **T-053** A human opens every changed PNG. `screenshots:verify` never opens an image.
- [ ] **T-054** Storybook: one story per role with its members side by side, at the production mount
      point, not inside a convenience wrapper.
- [ ] **T-090** Run the full gate set from the final state, reading each exit code without a pipe.
- [ ] **T-091** Confirm the visual outcomes on a device. Gate passage alone has already been shown
      to be insufficient evidence in this program.
- [ ] **T-092** Confirm the scoped diff contains no task-created residue.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- Every requirement REQ-001 to REQ-008 met with cited evidence.
- Every criterion A1-A7 has both its failing and its passing number recorded.
- Gates green from the final state; captures re-taken and reviewed by a person.
- No surface depends on an undeclared piggyback.

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
- [ ] [P0] human PNG review recorded
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

- [ ] [P0] `../architecture-findings.md` §7 and §9 read
- [ ] [P0] `000-surface-contract-and-truthful-harness` landed
- [ ] [P0] Trigger census complete and reconciled in both directions
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
- [ ] [P0] Mock elements in new tests implement `setCssProps`
- [ ] [P0] No criterion is closed on a `styles.css` string match
- [ ] [P0] Every harness check demonstrated to fail before it is trusted

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] [P0] All 33 call sites addressed, not a subset
- [ ] [P0] All 14 row grammars in `toolbar-renderer.ts` retired, not the two easy duplicates only
- [ ] [P0] No adjacent defect "improved" outside the declared scope

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## SECURITY

- [ ] [P0] No network call, telemetry or remote dependency added
- [ ] [P0] No secret, token or absolute personal path in any artifact
- [ ] [P0] No code, CSS value or token scale copied from `external/` — AGPL against this plugin's MIT

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] [P1] `implementation-summary.md` written once work starts
- [ ] [P1] Failing and passing numbers recorded against every criterion
- [ ] [P1] Any deviation from the contract recorded with its reason

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] [P1] `styles.css` not split; edits made in the serialized CSS lane
- [ ] [P1] Screenshot scenarios added in the same change as any new surface
- [ ] [P1] Each row grammar retired in its own commit

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
