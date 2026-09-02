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

**Reconciled against evidence on 2026-09-02: 17 ticked with citations, 11 left open (0 not done by
decision, 2 operator-owned, rest unfound).**

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

- [x] **T1** Enumerate every `type: "checkbox"` creation site in source — REQ-006.
      *Evidence to close:* Row per site with file, line, class or classlessness, and the parent's class at creation time
      **Evidence:** `tools/live/checkbox-inventory.json` — `totals.sites: 10`, and every entry in
      `sites[]` carries `file`, `line`, `classes`, the parent `chain` at creation time and
      `computedClass`. Producer `tools/live/checkbox-inventory.mjs`, which exits 2 rather than
      reporting clean when the scan matches nothing (`:293-297`).
- [ ] **T2** Enumerate every CSS rule that could style a checkbox — REQ-002.
      *Evidence to close:* Row per rule with its selector and whether it declares `appearance`
- [x] **T3** Join the two sets — REQ-006.
      *Evidence to close:* Three named lists: classes with no rule, rules with no class, and inputs styled only through a parent
      **Evidence:** all three lists are emitted by name in
      `tools/live/checkbox-inventory.json`: `unmentioned` (named by a class the stylesheet never
      mentions) `[]`, `noAppearanceRule` (mentioned, but by no rule removing the native appearance)
      `[]`, and the per-site `borrowed` field (styled only through a parent), `null` on all 10.
      Joined at `tools/live/checkbox-inventory.mjs:288-302`.
- [x] **T4** Confirm `db-list-row-checkbox` has no rule anywhere — REQ-005.
      *Evidence to close:* `src/views/list-renderer.ts:271` creates it; zero matching selectors in `styles.css`
      **Evidence:** `grep -n db-list-row-checkbox styles.css` returns **no match** (re-resolved
      2026-09-02); the creation site has moved to `src/views/list-renderer.ts:693`, where the class
      is now passed as `cls` to the primitive rather than carrying the appearance itself.
- [ ] **T5** Name all ten classless inputs and mark which are unstyled — REQ-006.
      *Evidence to close:* Five unstyled (`column-manager-renderer.ts:150`, `:237`, `view-config-panel-renderer.ts:2032`, `chart-toolbar-renderer.ts:985`, `toolbar-renderer.ts:1280`) and five parent-styled, each with the selector that reaches it
- [x] **T6** Record computed `appearance`, `border-radius` and box size per family at the production mount point — REQ-002.
      *Evidence to close:* Computed values, not declared ones — the defect is the gap between them
      **Evidence:** `tools/live/checkbox-appearance.json` `rows[]` — **258 checkboxes over 61
      fixtures**, each row carrying its `chain` (the production mount point) and a `measured`
      object of computed `appearance`, `radius`, `width` and `height`, read in the browser rather
      than parsed from declarations.

### Stage 2 — record the failing numbers

- [x] **T7** Fill the "today" column for B1 through B6 in `checklist.md` — REQ-002, REQ-004, REQ-007.
      *Evidence to close:* No criterion has an empty "today" cell before Stage 3 begins
      **Evidence:** `checklist.md:45-50` — all six Today cells hold a measured value
      (B1 `platformBox: 0`, B2 the three distinct shapes with counts, B3
      `appearanceOwnedByAncestor: 0`, B4 the unmeasured-with-reason cell, B5 `such a theme reaches
      11 of 12 families today`, B6 `all 53 mobile checkboxes measure 28x28`). No cell is blank.
- [x] **T8** Measure the current hit target per family under a coarse pointer — REQ-007.
      *Evidence to close:* A number per family; none is asserted anywhere today
      **Evidence:** `checklist.md:50` (B6) records the coarse-pointer pass — phone-named fixtures
      measured with `hasTouch` at 390x844, **all 53 mobile checkboxes measure 28x28**, against the
      earlier fine-pointer misreading of `list-mobile` at 16x16.
      `tools/live/checkbox-appearance.json` `shapes` carries the number per family at both pointer
      modes: `16x16 r=4px`, `18x18 r=4px`, `28x28 r=4px`, `34x18 r=9999px`.
- [x] **T9** Measure appearance at all three mount points for one family — REQ-002.
      *Evidence to close:* The mount-point delta recorded as a number, establishing B3's baseline
      **Evidence:** the delta is a number in `tools/live/checkbox-appearance.json` `totals` —
      `mountGroups: 7`, `mountShapeSplits: 0`, `appearanceOwnedByAncestor: 0` — over the roots the
      census finds (`note-database-container`, `… db-width-default`, `note-database-modal`,
      `… db-invalid-events-modal`). Ticked on `goal.md` criterion 3, red under the same control
      that splits the role groups.
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

- [x] **T10** Implement `createCheckbox(parent, { role })` — REQ-001.
      *Evidence to close:* Single creation path; the fixed role set is enumerated in one place
      **Evidence:** `src/views/checkbox.ts:26` `createCheckbox(parent, options)`, with the role
      set enumerated once at `:14` — `export type CheckboxRole = "row" | "field"`.
- [x] **T11** Base appearance applied unconditionally, no ancestor in the selector — REQ-002.
      *Evidence to close:* A checkbox created on `document.body` computes the same appearance as one inside a board card
      **Evidence:** `styles.css:20319` `input[type="checkbox"].db-checkbox { … appearance: none }`
      — reached through the input's own class, with no ancestor in the selector. Measured:
      `tools/live/checkbox-appearance.json` `totals.appearanceSelfOwned: 258`,
      `appearanceOwnedByAncestor: 0`, `platformBox: 0` over 61 fixtures. Ticked on `goal.md`
      criterion 1, whose ownership claim — *no checkbox or switch borrows its appearance from an
      ancestor*, **was 10, now 0** — is the half a host cannot satisfy on the plugin's behalf.
- [x] **T12** Role selects size only — REQ-003.
      *Evidence to close:* Role does not appear in any radius, colour, border or glyph declaration; grep the role tokens against the rule set
      **Evidence:** `grep -n 'db-checkbox-row\|db-checkbox-field' styles.css` returns exactly two
      rules, `styles.css:20356` and `:20362`, each declaring only `width`, `height` and `flex`.
      Radius, colour, border and glyph are all on the roleless base rule at `:20319`.

### Stage 4 — migration

- [ ] **T13** Migrate the five parent-styled classless inputs **first**, one row each as AC-012a to
      AC-012e: `table-renderer.ts:514`, `:785`, `cell-renderer.ts:489`, `card-field-renderer.ts:184`,
      `record-detail-panel.ts:339` — resolve with `rg -n 'type: "checkbox"' src/views/`, not by line
      number — REQ-006.
      *Evidence to close:* Per site, **both** halves of the two-sided control: T20's pre-fix strip
      moved a computed value, and the post-fix strip moves **nothing**. A post-fix pass with a blank
      pre-fix cell leaves the row `Blocked`
- [x] **T14** Migrate the five unstyled classless inputs — REQ-006.
      *Evidence to close:* Each computes `appearance: none` where it previously computed the platform default
      **Evidence:** `tools/live/checkbox-appearance.json` `totals.platformBox: 0` of 258 (the
      recorded failing value was 23, per `goal.md` criterion 1 — *was 23, recorded 0, now 0*), and
      `tools/live/checkbox-inventory.json` `totals.classless: 2`, both of which are the factory
      itself (`src/views/checkbox.ts:34`) and a story file, not a shipped surface. Sample call
      sites now routed: `src/views/column-manager-renderer.ts:164` and `:251`.
- [x] **T15** Migrate all twelve classed families — REQ-001.
      *Evidence to close:* Every family's computed `appearance`, radius and box size read at its
      production mount point and matching its declared role. The census rerun is the input that makes
      the set exhaustive; a count of zero bypasses does not close AC-008
      **Evidence:** the census was rerun — `tools/live/checkbox-inventory.json`
      (measured 2026-09-01) reports `sites: 10`, `unmentioned: 0`, `noAppearanceRule: 0` — and the
      measurement is `tools/live/checkbox-appearance.json`: **258 checkboxes, 258 self-owned**,
      `distinctShapes: 4`, `roleGroups: 4`, `roleShapeSplits: 0`, each row carrying its computed
      appearance, radius and box size at its production chain.
- [x] **T16** Resolve `db-list-row-checkbox`: route it through the primitive or delete the class — REQ-005.
      *Evidence to close:* The rendered list row's checkbox computes the same `appearance`, radius and
      box size as its role-mate — 0 differing properties — with a hit rect at least 28x28 under a
      coarse pointer. "No callers" is a call count and does not close AC-008
      **Evidence:** routed through the primitive — `src/views/list-renderer.ts:693`
      `createCheckbox(controls, { role: "row", cls: "db-list-row-checkbox" })`, so the class now
      names the row and the appearance comes from the role.
      0 differing properties: `tools/live/checkbox-appearance.json` `totals.roleShapeSplits: 0`
      across the `db-checkbox-row` group. The coarse-pointer floor is `styles.css:20368`
      `@media (pointer: coarse) { … min-width: 28px; min-height: 28px }`, measured at 28x28 in the
      touch pass (`checklist.md:50`), and `tools/live/touch-targets.mjs:93-95` declares the
      checkbox so the inset `::before` target is measured directly rather than by bounding box.
- [ ] **T17** Delete checkbox rules the primitive supersedes — REQ-002.
      *Evidence to close:* Each deletion quoted verbatim in the Stage 1 join before removal; recapture shows the intended change only

### Stage 5 — states and touch

- [x] **T18** Checked, indeterminate, disabled and focus for every family — REQ-004.
      *Evidence to close:* Four measurable differences per family, not per surface
      **Evidence:** `tools/live/checkbox-appearance.json` `states[]` — one row per SHAPE, each
      recording `checkedDiffers`, `indeterminateDiffers`, `disabledDiffers`, `focusDiffers` over a
      wide signature (background, border, image, shadow, opacity); `totals.stateFailures: 0`,
      `stateFamilies: 4`. Ticked on `goal.md` criterion 4, which records what it found — **the
      toggle switch had no focus indicator at all**, fixed, and watched red by renaming the
      selector: `focus NO`. `indeterminate` is `n/a` for the switch with its reason recorded.
- [x] **T19** Hit target at least 28x28 under a coarse pointer, every family — REQ-007.
      *Evidence to close:* Measured rect per family, decoupled from the visual box the role selects
      **Evidence:** `styles.css:20368` raises the box under `@media (pointer: coarse)` to
      `min-width/min-height: 28px` independently of the role's 16px/18px size rules
      (`:20356`, `:20362`), and `tools/live/touch-targets.mjs:93-95` measures the checkbox's
      `::before` surface directly *because a bounding box does not include it*. Result:
      **all 53 mobile checkboxes measure 28x28** (`checklist.md:50`), with the 28x28 shape carried
      in `checkbox-appearance.json` `shapes`. Ticked on `goal.md` criterion 6.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

Stage 6 — prove it, including against themes the plugin does not control.

- [x] **T20** Computed-appearance assertions per family in `tools/storybook/verify-placement.mjs` — REQ-002.
      *Evidence to close:* `vitest` is `environment: "node"` with no jsdom, so the assertion lives here, not in a unit test
      **Evidence:** the assertions exist and are browser-driven, but they landed in
      `tools/live/checkbox-appearance.mjs` rather than in `verify-placement.mjs` — recorded here
      rather than silently re-pointed. `tools/live/checkbox-appearance.json` carries the per-family
      result: `rows[]` 258 computed appearances at their production chains, `shapes` 4,
      `appearanceOwnedByAncestor: 0`. No DOM assertion was added to a vitest suite.
- [x] **T21** Set-equality assertion for radius and box size within a role — REQ-003.
      *Evidence to close:* Distinct-value set has cardinality 1 across board, gallery, list, table, modal and panel
      **Evidence:** `tools/live/checkbox-appearance.json` `totals.roleGroups: 4`,
      `roleShapeSplits: 0` — `(switch) @ fine 34x18 r=9999px across 4 fixtures`,
      `db-checkbox-field @ fine 18x18 r=4px across 5`, `db-checkbox-row @ fine 16x16 r=4px across
      10`, `db-checkbox-row @ touch 28x28 r=4px across 3`. Ticked on `goal.md` criterion 2, which
      records the pointer mode as an axis rather than a violation and **watched it fail** with one
      surface given a different radius for the same role: `16x16 r=9999px / 16x16 r=4px … <-- one
      role, more than one box`.
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
