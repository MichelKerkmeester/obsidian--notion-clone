---
title: "Verification Checklist: Checkbox Ownership"
description: "Acceptance criteria with the failing number recorded first, so a pass means the checkboxes actually changed."
trigger_phrases:
  - "004 checkbox ownership checklist"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Checkbox Ownership

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a computed number that was read, never on a declared value or a command
that was merely run.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. A criterion
with an empty "today" cell is not accepted. Every measurement is taken on the real renderer at the
production mount point, computed rather than declared.

**Re-derived 2026-08-31 from `tools/live/checkbox-appearance.json`**, which the gate's `evidence`
lane confirms is fingerprinted against today's `styles.css`. Two rows are settled by it, four are
not, and the four are left unticked rather than carried along by the two — the "today" column of
every row had gone stale, which is not the same as every row having been met.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| B1 | Every `input[type="checkbox"]` the plugin creates computes `appearance: none` | **211 of 211 controls across 59 fixtures self-own appearance; `platformBox: 0`** (was recorded as "1 of 12 families") | 12 of 12 | [x] `checkbox-appearance.json` totals |
| B2 | Radius and box size identical within a role across board, gallery, list, table, modal and panel | **3 distinct shapes: 16x16 r=4px (181), 18x18 r=4px (20), 34x18 r=9999px (10)**. The old "11 of 12 fall back to the platform box" is refuted — `platformBox: 0`. Whether 3 shapes across 3 roles satisfies "identical WITHIN a role" is not answerable from totals | distinct-value set has cardinality 1 *per role* | [ ] needs the artefact grouped by role, which it does not currently emit |
| B3 | Appearance identical at all three mount points | **`appearanceOwnedByAncestor: 0`** — nothing is decided by ancestry any more (was "differs by construction") | 0 delta | [x] `checkbox-appearance.json` totals |
| B4 | Checked, indeterminate, disabled and focus each produce a measurable difference for every family | **unmeasured.** The artefact records resting appearance only, so the old "only ancestor-styled families have state rules" is neither confirmed nor refuted | 4 states x 12 families | [ ] needs a state-sweep the current instrument does not perform |
| B5 | Unchanged under three third-party themes, at least one restyling native checkboxes | untested; such a theme reaches 11 of 12 families today | 0 changed | [ ] |
| B6 | Hit target at least 28x28 under a coarse pointer for every family | **contested.** `../roadmap.md` §7.1 records the switch reaching 34x28; the artefact measures its box at **34x18**. Both can be true — a box is not a reach, and padding or a pseudo-element can extend one — but nothing here measures reach, so the criterion is not evidenced either way | 12 of 12 | [ ] needs a reach measurement, not a box measurement |

**B1 is the operator's reported defect. B2 is the criterion that fails when a family is missed — which
is how the previous attempt passed while circles remained.**

### The Five Borrowed-Ancestor Sites — One Row Each

`acceptance-criteria.md` AC-012a to AC-012e (review finding F13). Each is classless and computes
correctly today only because the call site classes its **parent** one or two lines earlier. They pass
every check right now. Resolve them with `rg -n 'type: "checkbox"' src/views/`, not by line number.

| # | Site | Borrowed class | Pre-fix strip moved | Post-fix strip moved | Evidence |
|---|---|---|---|---|---|
| AC-012a | `src/views/table-renderer.ts:514` | `db-select-inner` (parent classed `:513`) | | must be **nothing** | [ ] |
| AC-012b | `src/views/table-renderer.ts:785` | `db-select-inner` (parent classed `:783`) | | must be **nothing** | [ ] |
| AC-012c | `src/views/cell-renderer.ts:489` | `db-checkbox-cell` (parent classed `:487`) | | must be **nothing** | [ ] |
| AC-012d | `src/views/card-field-renderer.ts:184` | `db-checkbox-cell` (parent classed `:183`) | | must be **nothing** | [ ] |
| AC-012e | `src/views/record-detail-panel.ts:339` | `db-checkbox-cell` (parent classed `:338`) | | must be **nothing** | [ ] |

**Both columns are required.** The pre-fix column must record a computed value that **moved** when
the wrapper class was stripped — that is what proves the borrowed dependency is real and the check is
connected. A blank pre-fix cell leaves the row `Blocked`, not `Met`, however clean the post-fix
result looks: a site that never depended on the wrapper is indistinguishable from one that was fixed.

Phase 4 migrates these five **first**, and may not migrate any of them before its pre-fix cell is
filled. Nothing about them looks broken, which is exactly why a "fix what looks broken" pass skips
them — and why they sit unprotected between `000` Stage 1 and this migration.

### Blank Failing Numbers — Blocked, Not Merely Unmet

`acceptance-criteria.md` AC-007 to AC-013, including AC-012a to AC-012e, have no recorded failing
number (review finding F16). Each is `Blocked` until the number is there, and the provenance table in
that file names what produces it and at which phase. No number may be invented.

AC-007 and AC-008 were also rewritten under review finding F8: they previously closed on a class being
deleted with zero callers and on a census reporting zero checkboxes created outside the primitive — a
deletion and a call count. Both now close on computed appearance.

### Negative Controls

| # | Control | Evidence |
|---|---|---|
| N1 | Reverting the base appearance rule reproduces the 1-of-12 measurement | [ ] |
| N2 | Removing `.db-checkbox-cell` from a wrapper in the harness changes **no** family's appearance | [ ] |
| N3 | Removing `.db-select-inner` from a wrapper in the harness changes **no** family's appearance | [ ] |
| N4 | Mounting a checkbox on `document.body` produces the same computed appearance as inside a board card | [ ] |
| N5 | Deleting one family from the harness moves an asserted number | [ ] |
| N6 | A role token appearing in a radius, colour, border or glyph declaration fails a check | [ ] |
| N16 | **Before** migration, stripping `db-select-inner` or `db-checkbox-cell` from the wrapper **moves** a computed value at each of the five sites — without this half, N2 and N3 passing afterwards proves nothing | [ ] |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

| # | Item | Evidence |
|---|---|---|
| D1 | `000` has landed: the harness no longer wraps subjects in a token-supplying container by default | [ ] |
| D2 | This spec holds the serialized `styles.css` lane alone | [ ] |
| D3 | No `openSurface()` dependency was introduced — this spec must stay off the overlay critical path | [ ] |
| D4 | No spec path, requirement id, task id or checklist id appears in any code comment | [ ] |

- [ ] **CHK-001** [P0] `../architecture-findings.md` read for the measurements behind B1-B6
- [ ] **CHK-002** [P0] The Stage-1 join is complete: source sites and CSS rules enumerated and joined
- [ ] **CHK-003** [P0] Every criterion's failing "today" value recorded before any product code is
      written
- [ ] **CHK-004** [P0] D1 satisfied: `000` has landed and the harness no longer wraps subjects in a
      token-supplying container by default
- [ ] **CHK-005** [P0] D2 satisfied: this spec holds the serialized `styles.css` lane alone

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] **CHK-010** [P0] `createCheckbox(parent, { role })` is the only code path producing an
      `input[type="checkbox"]`
- [ ] **CHK-011** [P0] No ancestor appears in the base appearance selector
- [ ] **CHK-012** [P0] No role token appears in a radius, colour, border or glyph declaration
- [ ] **CHK-013** [P0] D3 satisfied: no `openSurface()` dependency introduced
- [ ] **CHK-014** [P1] D4 satisfied: no spec path, requirement id, task id or checklist id appears in
      any code comment
- [ ] **CHK-015** [P1] The base rule wins on selector merit rather than a blanket `!important`

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## TESTING

| Gate | Evidence |
|---|---|
| `npx tsc --noEmit` exit 0, read without a pipe | [ ] |
| `npm run build` exit 0 | [ ] |
| `npx vitest run` exit 0, count not reduced | [ ] |
| Browser harness, all criteria, at production mount points | [ ] |
| Full recapture **and a human reviewed the changed PNGs** | [ ] |
| Every family captured in every state | [ ] |
| `npm run story:smoke`, family-by-state matrix at production mount points | [ ] |
| Three third-party themes exercised, one restyling native checkboxes | [ ] |
| Working tree clean after a full run | [ ] |

- [ ] **CHK-020** [P0] Computed-appearance assertion per family in
      `tools/storybook/verify-placement.mjs`
- [ ] **CHK-021** [P0] Set-equality assertion for radius and box size within a role
- [ ] **CHK-022** [P0] Mount-point parity asserted across all three mount points
- [ ] **CHK-023** [P0] Coarse-pointer hit target asserted per family
- [ ] **CHK-024** [P0] N1-N6 all hold
- [ ] **CHK-025** [P0] No DOM assertion added to a vitest suite — the runner has no jsdom

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

| # | Item | Evidence |
|---|---|---|
| I1 | All twelve source classes have a join row | [ ] |
| I2 | All ten classless creation sites have a join row, marked unstyled or parent-styled | [ ] |
| I3 | `db-list-row-checkbox` resolved: routed through the primitive, or deleted with zero callers | [ ] |
| I4 | The nine families the previous attempt missed each have a row: board card, board column, board subgroup, gallery card, gallery group, list row, list group, group divider, selection-clear | [ ] |
| I5 | Every deleted CSS rule quoted verbatim in the join before removal | [ ] |
| I6 | Census rerun shows zero checkboxes created outside `createCheckbox` — the *input* to AC-008, which closes on the ten sites' computed appearance, not on this count | [ ] |
| I7 | Each of AC-012a to AC-012e has **both** a pre-fix and a post-fix strip result recorded (review finding F13) | [ ] |
| I8 | Every line number this packet cites was re-resolved through its selector or symbol and `rg` command before being relied on; moved numbers recorded old to new (review finding F11) | [ ] |
| I9 | No criterion closed on a class being added, a site being migrated, a class being deleted, or a census reporting zero (review finding F8) | [ ] |
| I10 | No measurement taken from the desktop harness page before `000` repaired its `styles.css` load was re-used. Every criterion here reads a computed value, and on a stylesheet-less page all twelve families compute the platform default (review finding F3) | [ ] |

- [ ] **CHK-030** [P0] B1: every plugin checkbox computes `appearance: none` — recorded 1 of 12
      families, now 12 of 12
- [ ] **CHK-031** [P0] B2: distinct radius and box-size values within a role has cardinality 1 —
      recorded families diverge, 11 of 12 fall back to the platform box
- [ ] **CHK-032** [P0] B3: appearance identical at all three mount points — recorded differs by
      construction, now 0 delta
- [ ] **CHK-033** [P0] B4: four states x 12 families each a measurable difference — recorded only
      ancestor-styled families have state rules
- [ ] **CHK-034** [P0] B5: unchanged under three third-party themes, one restyling native checkboxes —
      recorded untested, such a theme reaches 11 of 12 families today
- [ ] **CHK-035** [P0] B6: hit target at least 28x28 under a coarse pointer, every family — recorded
      not asserted anywhere
- [ ] **CHK-036** [P0] The five accidentally-working classless inputs were migrated first, not skipped
- [ ] **CHK-037** [P0] No adjacent defect owned by another phase was "improved" outside this scope
- [ ] **CHK-038** [P0] `styles.css` lane taken at Phase 3 and released at Phase 6, with all four
      release conditions met in order
- [ ] **CHK-039** [P0] A **named human** signed off on every changed PNG. `screenshots:verify` never
      opens an image, and the operator's defect is visible shape
- [ ] **CHK-044** [P0] `008`'s early replay re-asserted `000` against the tree this packet released
      and `000` re-closed. This is the program's first lane handoff and the first real test of the
      replay itself
- [ ] **CHK-045** [P0] Cascade re-confirmation recorded: four ancestor-scoped rules replaced by one
      unconditional rule moves the specificity landscape, so a previously losing declaration can
      start winning

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## SECURITY

- [ ] **CHK-040** [P0] No network call, telemetry or remote dependency added
- [ ] **CHK-041** [P0] No secret, token or absolute personal path in any artifact
- [ ] **CHK-042** [P0] `external/` AnyType and AppFlowy read for behaviour only — no code, CSS value
      or token scale copied from AGPL/source-available sources into this MIT plugin

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## DOCUMENTATION

This spec is the program's method test. Record the answer explicitly:

| # | Question | Evidence |
|---|---|---|
| M1 | Did the criteria written to the doctrine catch what 1.3.1's criteria missed? | [ ] |
| M2 | Did any criterion pass while the operator still saw the defect? | [ ] |
| M3 | If M2 is yes, what would have caught it, and does that change how `001`, `002` and `003` are written? | [ ] |

- [ ] **CHK-050** [P0] Every deleted CSS rule quoted verbatim in the join before removal
- [ ] **CHK-051** [P0] The doctrine verdict M1-M3 written down whichever way it falls
- [ ] **CHK-052** [P1] `implementation-summary.md` written once work starts
- [ ] **CHK-053** [P1] Each criterion's failing and passing numbers recorded
- [ ] **CHK-054** [P1] Any theme that defeats the base appearance recorded as a finding, not hidden

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] **CHK-060** [P0] `styles.css` not split; every checkbox edit made while this phase holds the lane
- [ ] **CHK-061** [P1] Storybook stories mounted where production mounts them, not inside a
      convenience container
- [ ] **CHK-062** [P1] Working tree clean after a full run

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Gate | Result |
|---|---|
| `npx tsc --noEmit` exit 0 | not run |
| `npm run build` exit 0 | not run |
| `npx vitest run` exit 0, count not reduced | not run |
| Browser harness, all criteria, at production mount points | not run |
| Full recapture **and a human reviewed the changed PNGs** | not run |
| Every family captured in every state | not run |
| `npm run story:smoke`, family-by-state matrix at production mount points | not run |
| Three third-party themes exercised, one restyling native checkboxes | not run |
| Operator confirmation on device | not run |
| Doctrine verdict recorded | not run |

<!-- /ANCHOR:summary -->
---

## CLOSING CONDITION

This spec does not close on gate passage alone — that is precisely what the previous attempt did. It
closes when the measurements in section 1 have moved from their recorded failing values, the negative
controls hold — including the pre-fix half of N16 for each of AC-012a to AC-012e — every family in
section 3 has a join row, every blank failing-number cell named in `acceptance-criteria.md`'s
provenance table is filled, the `styles.css` lane has been released through all four conditions with
`008`'s replay re-closing `000`, **the operator confirms on device that the circles are gone from
board, gallery and list**, and the doctrine verdict in section 6 is written down whichever way it
falls.
