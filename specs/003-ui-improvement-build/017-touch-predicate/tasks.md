---
title: "Task Breakdown: One Canonical Touch Predicate"
description: "Tasks for 017-touch-predicate, one per requirement, each closed only with read evidence."
trigger_phrases:
  - "017 touch predicate tasks"
importance_tier: "high"
contextType: "planning"
---
# Task Breakdown: One Canonical Touch Predicate

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked. A task closes only with
evidence a reader can check.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

- [ ] **T-000** Read the decision-matrix rows for this phase's items and the phase note in
      `spec.md` §6 before editing anything.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

- [ ] **T-001** One predicate governs interaction. Any narrower sheet-only mode is explicitly named, tested and documented
- [ ] **T-002** No element receives a mobile class whose styling is gated behind a different threshold
- [ ] **T-003** The FAB no longer twitches during scroll. `reserveMobileFabInset` publishes the navbar height once per toolbar render with no resize, visualViewport or orientation listener
- [ ] **T-004** `012/spec.md` REQ-003 is read before touching the inset, so the existing fix is not duplicated

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [ ] **T-090** Run the full gate set from the final state, reading each exit code without a pipe.
- [ ] **T-091** Confirm the visual items on a physical device. A fixture capture cannot close them.
- [ ] **T-092** Confirm the scoped diff contains no task-created residue.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- Every P0 requirement met with cited evidence.
- Gates green from the final state.
- Desktop unchanged.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md)
- [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md)
- [`../013-mobile-ux-research/device-defect-inventory.md`](../013-mobile-ux-research/device-defect-inventory.md)

<!-- /ANCHOR:cross-refs -->
---

<!-- ANCHOR:verification -->
## VERIFICATION CHECKLIST

- [ ] [P0] `tsc --noEmit` exit 0, no output, read without a pipe
- [ ] [P0] `npm run build` exit 0
- [ ] [P0] `vitest run` all passing
- [ ] [P0] `screenshots:verify` exit 0
- [ ] [P1] lint at the 115 baseline, not above
- [ ] [P0] device confirmation recorded for every visual item

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read `RESULT:` lines rather than exit codes under `--recursive`; a fully passing tree still exits 2.
Validate through the hub symlink path — validation run from inside the plugin repo exits 0 printing
nothing, even for a packet missing required files. Never read `$?` through a pipe.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [ ] [P0] Decision-matrix rows for the owned items read
- [ ] [P0] Phase note in `spec.md` §6 read
- [ ] [P0] Predecessor phase landed, where the dependency order requires it

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

- [ ] [P0] `vitest run` green from the final state
- [ ] [P0] New CSS-reading tests carry the eslint disable header
- [ ] [P0] Mock elements in new tests implement `setCssProps`
- [ ] [P0] No test asserts a rule count that a media query would break

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] [P0] Every inventory item this phase owns is addressed, not a subset
- [ ] [P0] Items disputed in the matrix are resolved or explicitly deferred with a reason
- [ ] [P0] No adjacent defect was "improved" outside the declared scope

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## SECURITY

- [ ] [P0] No network call, telemetry or remote dependency added
- [ ] [P0] No secret, token or absolute personal path in any artifact
- [ ] [P0] No write to the operator's vault beyond the declared testbed

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] [P1] `implementation-summary.md` written once work starts
- [ ] [P1] Evidence recorded against each requirement
- [ ] [P1] Any deviation from the matrix's decision recorded with its reason

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] [P1] `styles.css` not split; edits made in the serialized CSS lane
- [ ] [P1] New portal classes registered in `portalSelectors`
- [ ] [P1] Screenshot scenarios added in the same change as any new surface

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Gate | Result |
|---|---|
| `tsc --noEmit` | not run |
| `npm run build` | not run |
| `vitest run` | not run |
| `screenshots:verify` | not run |
| device confirmation | not run |

<!-- /ANCHOR:summary -->
