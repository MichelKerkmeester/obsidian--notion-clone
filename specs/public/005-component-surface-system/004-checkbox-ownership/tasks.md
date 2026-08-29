---
title: "Task Breakdown: Checkbox Ownership"
description: "One task per requirement, each closed only with evidence that was read, not assumed."
trigger_phrases:
  - "004 checkbox ownership tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Checkbox Ownership

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**No task closes on "looks right".** Each task's evidence must name a number that was read or a
command whose output and exit status were read. The research gate is standing: if a criterion fails
twice without a new hypothesis, read AnyType and AppFlowy under `external/` for behaviour only —
never code, CSS values or token scales.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP [The join, and the failing numbers]

Stage 2 is a gate, not a task. No product code is written until the failing numbers are in
`checklist.md`.

### Stage 1 — the join

- [ ] **T1** Enumerate every `type: "checkbox"` creation site in source — REQ-006.
      *Evidence to close:* Row per site with file, line, class or classlessness, and the parent's class at creation time
- [ ] **T2** Enumerate every CSS rule that could style a checkbox — REQ-002.
      *Evidence to close:* Row per rule with its selector and whether it declares `appearance`
- [ ] **T3** Join the two sets — REQ-006.
      *Evidence to close:* Three named lists: classes with no rule, rules with no class, and inputs styled only through a parent
- [ ] **T4** Confirm `db-list-row-checkbox` has no rule anywhere — REQ-005.
      *Evidence to close:* `src/views/list-renderer.ts:271` creates it; zero matching selectors in `styles.css`
- [ ] **T5** Name all ten classless inputs and mark which are unstyled — REQ-006.
      *Evidence to close:* Five unstyled (`column-manager-renderer.ts:150`, `:237`, `view-config-panel-renderer.ts:2032`, `chart-toolbar-renderer.ts:985`, `toolbar-renderer.ts:1280`) and five parent-styled, each with the selector that reaches it
- [ ] **T6** Record computed `appearance`, `border-radius` and box size per family at the production mount point — REQ-002.
      *Evidence to close:* Computed values, not declared ones — the defect is the gap between them

### Stage 2 — record the failing numbers

- [ ] **T7** Fill the "today" column for B1 through B6 in `checklist.md` — REQ-002, REQ-004, REQ-007.
      *Evidence to close:* No criterion has an empty "today" cell before Stage 3 begins
- [ ] **T8** Measure the current hit target per family under a coarse pointer — REQ-007.
      *Evidence to close:* A number per family; none is asserted anywhere today
- [ ] **T9** Measure appearance at all three mount points for one family — REQ-002.
      *Evidence to close:* The mount-point delta recorded as a number, establishing B3's baseline
- [ ] **T20** Record the **pre-fix** parent-class strip for each of AC-012a to AC-012e — REQ-006.
      *Evidence to close:* Per site, the computed value that moved when `db-select-inner` or
      `db-checkbox-cell` was stripped from the wrapper. A site where nothing moved has been measured
      wrong, not found safe. Stage 4 may not migrate a site whose cell is blank
- [ ] **T21** Fill every blank failing-number cell named in `acceptance-criteria.md`'s provenance
      table — AC-007 to AC-013 — REQ-005, REQ-006.
      *Evidence to close:* Each cell holds a number produced by the named producer. No number invented

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Stage 3 — the primitive

- [ ] **T10** Implement `createCheckbox(parent, { role })` — REQ-001.
      *Evidence to close:* Single creation path; the fixed role set is enumerated in one place
- [ ] **T11** Base appearance applied unconditionally, no ancestor in the selector — REQ-002.
      *Evidence to close:* A checkbox created on `document.body` computes the same appearance as one inside a board card
- [ ] **T12** Role selects size only — REQ-003.
      *Evidence to close:* Role does not appear in any radius, colour, border or glyph declaration; grep the role tokens against the rule set

### Stage 4 — migration

- [ ] **T13** Migrate the five parent-styled classless inputs **first**, one row each as AC-012a to
      AC-012e: `table-renderer.ts:514`, `:785`, `cell-renderer.ts:489`, `card-field-renderer.ts:184`,
      `record-detail-panel.ts:339` — resolve with `rg -n 'type: "checkbox"' src/views/`, not by line
      number — REQ-006.
      *Evidence to close:* Per site, **both** halves of the two-sided control: T20's pre-fix strip
      moved a computed value, and the post-fix strip moves **nothing**. A post-fix pass with a blank
      pre-fix cell leaves the row `Blocked`
- [ ] **T14** Migrate the five unstyled classless inputs — REQ-006.
      *Evidence to close:* Each computes `appearance: none` where it previously computed the platform default
- [ ] **T15** Migrate all twelve classed families — REQ-001.
      *Evidence to close:* Every family's computed `appearance`, radius and box size read at its
      production mount point and matching its declared role. The census rerun is the input that makes
      the set exhaustive; a count of zero bypasses does not close AC-008
- [ ] **T16** Resolve `db-list-row-checkbox`: route it through the primitive or delete the class — REQ-005.
      *Evidence to close:* The rendered list row's checkbox computes the same `appearance`, radius and
      box size as its role-mate — 0 differing properties — with a hit rect at least 28x28 under a
      coarse pointer. "No callers" is a call count and does not close AC-008
- [ ] **T17** Delete checkbox rules the primitive supersedes — REQ-002.
      *Evidence to close:* Each deletion quoted verbatim in the Stage 1 join before removal; recapture shows the intended change only

### Stage 5 — states and touch

- [ ] **T18** Checked, indeterminate, disabled and focus for every family — REQ-004.
      *Evidence to close:* Four measurable differences per family, not per surface
- [ ] **T19** Hit target at least 28x28 under a coarse pointer, every family — REQ-007.
      *Evidence to close:* Measured rect per family, decoupled from the visual box the role selects

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

Stage 6 — prove it, including against themes the plugin does not control.

- [ ] **T20** Computed-appearance assertions per family in `tools/storybook/verify-placement.mjs` — REQ-002.
      *Evidence to close:* `vitest` is `environment: "node"` with no jsdom, so the assertion lives here, not in a unit test
- [ ] **T21** Set-equality assertion for radius and box size within a role — REQ-003.
      *Evidence to close:* Distinct-value set has cardinality 1 across board, gallery, list, table, modal and panel
- [ ] **T22** Screenshots of every family in every state — REQ-004.
      *Evidence to close:* Full capture set regenerated, and a human reviewed the changed PNGs
- [ ] **T23** Storybook family-by-state matrix at production mount points — REQ-002.
      *Evidence to close:* Every cell renders; no story wrapped in a convenience container
- [ ] **T24** Three third-party themes, at least one restyling native checkboxes — REQ-002.
      *Evidence to close:* Appearance unchanged under each; any theme that wins recorded as a finding, not hidden
- [ ] **T25** Confirm on device that circles are gone from board, gallery and list — REQ-001.
      *Evidence to close:* Operator observation. Gate passage alone does not close this spec
- [ ] **T26** Record whether the criteria doctrine held — REQ-001.
      *Evidence to close:* Explicit verdict: did criteria written this way catch what 1.3.1's criteria missed? This spec exists partly to answer that

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- Every requirement REQ-001 to REQ-007 met with cited evidence.
- Every criterion B1-B6 has both its failing and its passing number recorded.
- The negative controls N1-N6 in `checklist.md` hold, and every family in its §3 has a join row.
- Gates green from the final state, each exit status read without a pipe.
- **The operator confirms on device that the circles are gone from board, gallery and list.**
- The doctrine verdict in `checklist.md` §6 is written down whichever way it falls.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md)

<!-- /ANCHOR:cross-refs -->
