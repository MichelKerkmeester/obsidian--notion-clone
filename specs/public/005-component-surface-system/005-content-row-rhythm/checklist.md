---
title: "Verification Checklist: Content Row Rhythm and Header Rail"
description: "Acceptance criteria with the failing number recorded first, so a pass means something changed."
trigger_phrases:
  - "005 row rhythm checklist"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Content Row Rhythm and Header Rail

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number read from the census artefact, never on a command that was
merely run.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. A criterion
with an empty "today" cell is not accepted. Cells reading *census* take their number from the Stage 2
artefact; the static source fact beside them is why the criterion is expected to fail, not the
measurement itself.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| A1 | Standard deviation of 20 sibling list row heights, wrapping off | *census* — no row height declared; `min-height: 44px` is a floor (`styles.css:9602`) | 0 | [ ] |
| A2 | Every row height a whole multiple of the line box, wrapping on | *census* — no rhythm unit exists; line-heights are ratios (`styles.css:41-51`) | residual 0 | [ ] |
| A3 | Descendants of `.db-header` past the header **content box**, 4 widths × 7 view types | *census* — only `.db-active-view-controls-scroll` is contained (`styles.css:1338`) | 0 | [ ] |
| A4 | Rail scrolls: `scrollWidth > clientWidth`, parent width unchanged | *census* — computed at `active-view-controls-renderer.ts:153`, asserted nowhere | true, parent width delta 0 | [ ] |
| A5 | Header height delta across view switches | *census* — `--db-header-height` unassigned in `src/`; only `runtime-vars.css:24` sets it | ≤ 8px (`--db-space-4`) | [ ] |
| A6 | **Nothing sized `max-content` paints outside the container that bounds it**, 4 widths x 7 view types; every legitimate overflow scrolls rather than grows *(rewritten under review finding F8 — the old form closed on a classification)* | 31 declarations from `rg -c 'width:\s*max-content' styles.css` — a static input; per-element overflow in px is **blank** and comes from Stage 2 | 0 overflowing elements; parent width delta 0 | [ ] |
| A7 | Inert declarations in the touched regions | `.db-list-field-wrap` `width` beaten by `flex-basis` (`9719` vs `9703`); `mask-image` set at `18577`, unset at `19096` | 0 | [ ] |

### Blank Failing Numbers — Every Row Is Blocked, Not Merely Unmet

**Every criterion in this packet has a blank "today" cell** (review finding F16), because
`verify-placement.mjs` renders no view at all and nothing here has ever been measured. The provenance
table in `acceptance-criteria.md` names, per row, what produces the number and at which stage. No
number may be invented. Stage 3 may not write the sizing contract before Stage 2 fills AC-001 to
AC-007 and AC-009, and **Stage 2 may not run before AC-008's stylesheet probe passes.**

A6 and A8 were also rewritten under review finding F8: A6 closed on a classification and A8 on a
harness capability existing. Both now close on measurements.

### Negative Controls

| # | Control | Evidence |
|---|---|---|
| N1 | Deleting a chip from the rail moves an asserted rail number | [ ] |
| N2 | Deleting a field from a row moves an asserted row number | [ ] |
| N3 | Reverting the row rhythm token reproduces the recorded Stage 2 deviation | [ ] |
| N4 | Reverting the rail containment reproduces the recorded Stage 2 overflow | [ ] |
| N5 | Removing `--db-card-field-width` from `runtime-vars.css` changes a captured width | [ ] |
| N15 | Rendering the desktop page without `styles.css` makes A6's sweep find **zero** elements — a clean pass that means nothing. The check must distinguish that from a real pass (review finding F3) | [ ] |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

| # | Check | Evidence |
|---|---|---|
| H1 | Capture devices include 320, 402, 768 and 1440 | [ ] |
| H2 | The browser harness renders a view, not only a positioner | [ ] |
| H3 | `runtime-vars.css` pins no value this spec measures | [ ] |
| H4 | `styles.css` loads on the desktop harness page, not the phone page alone | [ ] |
| H5 | Every assertion added here fails when its subject is deleted from the harness DOM | [ ] |

- [ ] **CHK-001** [P0] `../architecture-findings.md` read for the measurements behind A1-A7
- [ ] **CHK-002** [P0] `000` landed: the honest harness, and the cascade audit available for Stage-5
      deletions
- [ ] **CHK-003** [P0] Stage 1 landed: H1-H4 all hold before the census runs
- [ ] **CHK-004** [P0] The Stage-2 census artefact is committed and every criterion's failing number
      is recorded from it
- [ ] **CHK-005** [P0] The serialized `styles.css` lane is held by this spec for Stages 4 and 5

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] **CHK-010** [P0] Every row and rail names its sizing authority; where the container decides, the
      child carries `min-width: 0`
- [ ] **CHK-011** [P0] All 31 `width: max-content` declarations classified; each survivor names its
      scrolling ancestor
- [ ] **CHK-012** [P0] The row-rhythm token exists and `min-height: 44px` is expressed in it
- [ ] **CHK-013** [P0] `--db-header-height` is assigned in `src/`, not only in `runtime-vars.css`
- [ ] **CHK-014** [P0] The rail has one intentional declaration per property; the `mask-image`
      reversal is resolved, or the `is-overflowing` class and its JavaScript are removed together
- [ ] **CHK-015** [P1] No inert declaration left in the touched regions

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## TESTING

| Gate | Evidence |
|---|---|
| `npx tsc --noEmit` exit 0, no output, read without a pipe | [ ] |
| `npm run build` exit 0 | [ ] |
| `npx vitest run` exit 0, count not reduced | [ ] |
| Census re-run; every criterion a delta against Stage 2 | [ ] |
| Browser harness, all criteria | [ ] |
| **Full** recapture, 4 widths × 7 view types × both themes | [ ] |
| `npm run screenshots:verify` exit 0 | [ ] |
| **A human reviewed the changed PNGs** | [ ] |
| `npm run story:smoke` at production mount points | [ ] |
| Working tree clean after a full run | [ ] |
| CSS lane released; no other spec held `styles.css` during Stages 4-5 | [ ] |

- [ ] **CHK-020** [P0] The census script is unchanged between Stage 2 and Stage 6
- [ ] **CHK-021** [P0] Every criterion is a delta between the two artefacts
- [ ] **CHK-022** [P0] N1-N5 all hold, run before the criteria are trusted
- [ ] **CHK-023** [P0] No DOM assertion added to a vitest suite — the runner has no jsdom
- [ ] **CHK-024** [P0] All seven view types covered at both census runs

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] **CHK-030** [P0] A1: standard deviation of 20 sibling list row heights is 0 — Stage-2 value
      recorded from the census, not asserted from source
- [ ] **CHK-031** [P0] A2: every row height a whole multiple of the line box, residual 0
- [ ] **CHK-032** [P0] A3: zero `.db-header` descendants past the header content box, 4 widths x 7 view
      types
- [ ] **CHK-033** [P0] A4: rail scrolls — `scrollWidth > clientWidth` with parent width delta 0
- [ ] **CHK-034** [P0] A5: header height delta across view switches at most 8px (`--db-space-4`)
- [ ] **CHK-035** [P0] A6: **zero elements sized `max-content` painting outside the container that
      bounds them**, 4 widths x 7 view types, every legitimate overflow scrolling with parent width
      delta 0 — recorded 31 declarations as the static input, per-element overflow from Stage 2
- [ ] **CHK-036** [P0] A7: zero inert declarations in the touched regions — recorded
      `.db-list-field-wrap` `width` beaten by `flex-basis`, and `mask-image` set then unset
- [ ] **CHK-037** [P0] The wrap-direction open question is answered from the artefact, with numbers
- [ ] **CHK-038** [P0] A8's stylesheet probe passed on **both** harness pages at all four widths
      before any other number was recorded — `.db-list-row` computing `min-height: 44px` and a
      `--db-*` token resolving non-empty (review finding F3)
- [ ] **CHK-039** [P0] No number taken from the desktop harness page before `000` repaired its
      `styles.css` load was re-used. On a page with no cascade A6's sweep finds zero elements
- [ ] **CHK-044** [P0] Every blank failing-number cell named in `acceptance-criteria.md`'s provenance
      table is filled from its named producer. No number invented (review finding F16)
- [ ] **CHK-045** [P0] Every `styles.css` line number cited was re-resolved through its selector and
      `rg` command; the three-act `mask-image` reversal read **in order** and the computed winner
      recorded before and after the collapse (review finding F11)
- [ ] **CHK-046** [P0] No criterion closed on 31 declarations being classified, a rail block being
      collapsed, a harness gaining a device profile, or a census artefact existing (review finding F8)
- [ ] **CHK-047** [P0] `styles.css` lane taken at Stage 4 and released at Stage 7, with all four
      release conditions met in order, including a **named human** signing off on every changed PNG
      and `008`'s early replay re-closing `000` and `004`

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## SECURITY

| # | Check | Evidence |
|---|---|---|
| S1 | All seven view types covered, not the five in the original brief | [ ] |
| S2 | No adjacent defect "improved" outside the declared scope | [ ] |
| S3 | No spec path, requirement id, task id or phase number in any code comment | [ ] |
| S4 | No code, CSS value or token scale copied from AnyType or AppFlowy | [ ] |
| S5 | No network call, telemetry or remote dependency added | [ ] |

- [ ] **CHK-040** [P0] S5 holds: no network call, telemetry or remote dependency added
- [ ] **CHK-041** [P0] No secret, token or absolute personal path in any artifact
- [ ] **CHK-042** [P0] S4 holds: no code, CSS value or token scale copied from the
      AGPL/source-available references under `external/` into this MIT plugin

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] **CHK-050** [P0] The Stage-2 and Stage-6 census artefacts are both committed
- [ ] **CHK-051** [P0] The sizing contract document names, for every row and rail, which side decides
      and why
- [ ] **CHK-052** [P0] Every deleted rail block is quoted verbatim from the cascade audit before
      removal
- [ ] **CHK-053** [P1] `implementation-summary.md` written once work starts
- [ ] **CHK-054** [P1] Each criterion's Stage-2 and Stage-6 numbers recorded

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] **CHK-060** [P0] `styles.css` not split; every edit made while this spec holds the lane
- [ ] **CHK-061** [P1] Census scratch output is not committed outside the artefact
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
| Census re-run; every criterion a delta against Stage 2 | not run |
| Browser harness, all criteria | not run |
| **Full** recapture, 4 widths x 7 view types x both themes | not run |
| `npm run screenshots:verify` exit 0 | not run |
| **A human reviewed the changed PNGs** | not run |
| `npm run story:smoke` at production mount points | not run |
| Operator looked at list rows and the filter rail on a device | not run |

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:arch-verify -->
## L3+: ARCHITECTURE VERIFICATION

- [ ] **CHK-070** [P0] One declared sizing authority per axis, written down for every row and rail
- [ ] **CHK-071** [P0] Scroller or grower, never both: every `max-content` survivor names its scroller
- [ ] **CHK-072** [P0] The rail is declared once — one intentional declaration per property
- [ ] **CHK-073** [P0] Rows land on a declared rhythm rather than a free-standing floor

<!-- /ANCHOR:arch-verify -->
---

<!-- ANCHOR:perf-verify -->
## L3+: PERFORMANCE VERIFICATION

- [ ] **CHK-080** [P1] The census ships nothing; its script is not loaded at runtime
- [ ] **CHK-081** [P1] `--db-header-height` is measured once per layout change, not per row

<!-- /ANCHOR:perf-verify -->
---

<!-- ANCHOR:deploy-ready -->
## L3+: DEPLOYMENT READINESS

- [ ] **CHK-090** [P0] Each stage landed as its own revertable commit
- [ ] **CHK-091** [P0] Rollback rehearsed: reverting the header publication alone leaves the row
      rhythm intact
- [ ] **CHK-092** [P0] The CSS lane released at Stage 7's recapture; no other spec held `styles.css`
      during Stages 4-5

<!-- /ANCHOR:deploy-ready -->
---

<!-- ANCHOR:compliance-verify -->
## L3+: COMPLIANCE VERIFICATION

- [ ] **CHK-100** [P0] MIT licence integrity preserved — nothing copied from AnyType or AppFlowy
- [ ] **CHK-101** [P1] No write to the operator's vault beyond the declared testbed

<!-- /ANCHOR:compliance-verify -->
---

<!-- ANCHOR:docs-verify -->
## L3+: DOCUMENTATION VERIFICATION

- [ ] **CHK-110** [P0] The census artefact records all 84 states, not a sample
- [ ] **CHK-111** [P0] The classification of all 31 `max-content` declarations is written down
- [ ] **CHK-112** [P1] `validate.sh <spec-folder> --strict` run and its exit code read without a pipe

<!-- /ANCHOR:docs-verify -->
---

<!-- ANCHOR:sign-off -->
## L3+: SIGN-OFF

This spec does not close on gate passage alone. It closes when the measurements in section 1 have
moved from their recorded failing values, the negative controls hold, and **the operator has looked at
list rows and the filter rail on a device** — the two defects that started it.

`screenshots:verify` green is not evidence that anything looks right. It proves a capture was
regenerated after its hand-maintained source list changed, and it never opens an image.

- [ ] **CHK-120** [P0] Every criterion moved from its recorded Stage-2 value
- [ ] **CHK-121** [P0] N1-N5 hold
- [ ] **CHK-122** [P0] Operator looked at list rows and the filter rail on a device
- [ ] **CHK-123** [P0] CSS lane released

<!-- /ANCHOR:sign-off -->
