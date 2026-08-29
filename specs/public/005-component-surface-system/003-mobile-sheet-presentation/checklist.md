---
title: "Verification Checklist: Mobile Sheet Presentation"
description: "Acceptance criteria with the failing number recorded first, so a pass means the sheet actually moved."
trigger_phrases:
  - "003 mobile sheet checklist"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Mobile Sheet Presentation

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. A criterion
with an empty "today" cell is not accepted. Every measurement is taken on the real renderer at the
production mount point, on a phone profile, with a navbar present.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | `elementFromPoint(centreX, navbarCentreY)` returns the sheet while a sheet is open | returns `DIV.mobile-navbar` — even at `z-index: 9999` | returns the sheet | [ ] |
| C2 | Sheet bottom edge equals viewport bottom, offset `0px`, for **both** mechanisms | 49px anchored / 0px modal — two mechanisms, two answers | `0px` for both | [ ] |
| C3 | After a field commit: node identity unchanged, top edge moved `0px`, a subsequent viewport resize still repositions | node survives; repositioning dead from the first commit (`anchorEl.isConnected` false, `place()` no-ops) | all three hold | [ ] |
| C4 | With `visualViewport` reduced to simulate the keyboard, the focused field stays inside the visible rect | not asserted anywhere; phone checks never call the positioner | field rect inside visible rect | [ ] |
| C5 | Scrim covers the full viewport including the navbar band | no sheet scrim exists | full-viewport scrim | [ ] |
| C6 | Removing the navbar from the harness changes an asserted number | moves 1.35px — the `50` fallback at `popover-position.ts:291` | material move | [ ] |

**C1 and C2 are the operator's reported defect. C3 is the glitch. C6 is the check that C1-C5 are not
theatre.**

### Blank Failing Numbers — Blocked, Not Merely Unmet

`acceptance-criteria.md` AC-007 to AC-014 have no recorded failing number (review finding F16). Each
is `Blocked` until the number is there, and the provenance table in that file names what produces it
and at which phase. Two gate irreversible work: **Phase 4 may not delete the shared `is-phone`
bounds branch until every affected popover has a recorded *before* bound**, and **Phase 3 may not
collapse the two predicates until the 601-760px disagreement has been swept at 600, 620, 660, 700,
720 and 760**. No number may be invented.

AC-007, AC-008 and AC-009 were also rewritten under review finding F8: they previously closed on a
branch being deleted, on two symbols reaching zero callers, and on an inventory being complete. All
three now close on measured presentations.

### Negative Controls

| # | Control | Evidence |
|---|---|---|
| N1 | Reverting the portal reproduces `DIV.mobile-navbar` as the C1 hit result | [ ] |
| N2 | Restoring the `is-phone` bounds branch reproduces the 49px anchored offset | [ ] |
| N3 | Restoring the second phone predicate reproduces a disagreement in the 601-760px band | [ ] |
| N4 | Reverting the anchor-lifetime fix reproduces a dead `place()` after the first field commit | [ ] |
| N5 | Deleting the navbar from the harness moves C1 and C6, not merely C6 | [ ] |
| N6 | Re-pinning `--db-mobile-sheet-bottom` in `runtime-vars.css` changes a capture | [ ] |
| N15 | Deleting the `is-phone` bounds branch without a recorded *before* bound leaves a non-sheet popover under the navbar with nothing to compare against — AC-007 measures the shared blast radius, not the deletion | [ ] |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

| # | Item | Evidence |
|---|---|---|
| D1 | `000` has landed: `.db-surface` is a token root and the Storybook stub no longer forces desktop or throws on `Modal` | [ ] |
| D2 | This spec holds the serialized `styles.css` lane alone for its sheet, scrim and safe-area rules | [ ] |
| D3 | No spec path, requirement id, task id or checklist id appears in any code comment | [ ] |

- [ ] **CHK-001** [P0] `../architecture-findings.md` read for the measurements behind C1-C6
- [ ] **CHK-002** [P0] Every criterion's failing "today" value confirmed against the current tree
      before any change
- [ ] **CHK-003** [P0] D1 satisfied: `000` has landed, `.db-surface` is a token root, the Storybook
      stub no longer forces desktop or throws on `Modal`
- [ ] **CHK-004** [P0] D2 satisfied: this spec holds the serialized `styles.css` lane alone
- [ ] **CHK-005** [P0] Stage 1 landed — removing the navbar from the harness moves an asserted number
      by more than 1.35px

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] **CHK-010** [P0] Exactly one code path writes `--db-mobile-sheet-bottom`
- [ ] **CHK-011** [P0] Both old phone predicates have zero callers; one exported predicate remains
- [ ] **CHK-012** [P0] The `is-phone` bounds branch and the `50` fallback are absent from source
- [ ] **CHK-013** [P1] D3 satisfied: no spec path, requirement id, task id or checklist id appears in
      any code comment
- [ ] **CHK-014** [P1] A surface declaring `sheet` that does not reach the contract fails at build,
      not silently at `0px`

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## TESTING

| Gate | Evidence |
|---|---|
| `npx tsc --noEmit` exit 0, read without a pipe | [ ] |
| `npm run build` exit 0 | [ ] |
| `npx vitest run` exit 0, count not reduced | [ ] |
| Browser harness, all criteria, navbar and safe-area present | [ ] |
| Full recapture **and a human reviewed the changed PNGs** | [ ] |
| Phone captures taken with a navbar in frame | [ ] |
| `npm run story:smoke`, sheet states at the production mount point | [ ] |
| `--db-radius-lg` resolves non-empty on the portalled node | [ ] |
| Working tree clean after a full run | [ ] |

- [ ] **CHK-020** [P0] Navbar hit test asserted in `tools/storybook/verify-placement.mjs`, driving the
      real positioner rather than `applySheetChrome` alone
- [ ] **CHK-021** [P0] Geometry asserted for both mechanisms in one check
- [ ] **CHK-022** [P0] Keyboard asserted via a reduced `visualViewport`
- [ ] **CHK-023** [P0] N1-N6 all hold
- [ ] **CHK-024** [P0] No DOM assertion added to a vitest suite — the runner has no jsdom

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

| # | Item | Evidence |
|---|---|---|
| I1 | Every positioner sheet has a census row with a measured `bottom` | [ ] |
| I2 | All 20 `DbModal` subclasses have a census row, including the 2 that inherit the constructor default | [ ] |
| I3 | All 3 `FuzzySuggestModal` subclasses classified: sheet, not-a-sheet, or out of scope with a reason | [ ] |
| I4 | Anchor-survival recorded per surface, not sampled | [ ] |
| I5 | Non-sheet anchored popovers' current bottom bound recorded before the branch is deleted | [ ] |
| I6 | The delta between the runtime log and the static list is written down | [ ] |
| I7 | Every line number this packet cites was re-resolved through its symbol and `rg` command before being relied on; moved numbers recorded old to new (review finding F11) | [ ] |
| I8 | No criterion closed on a branch being deleted, a symbol reaching zero callers, or a surface being added to an inventory (review finding F8) | [ ] |
| I9 | No number taken from the desktop harness page before `000` repaired its `styles.css` load was re-used (review finding F3) | [ ] |

- [ ] **CHK-030** [P0] C1: the hit test returns the sheet — recorded `DIV.mobile-navbar` even at
      `z-index: 9999`
- [ ] **CHK-031** [P0] C2: bottom offset `0px` for both mechanisms — recorded 49px anchored, 0px modal
- [ ] **CHK-032** [P0] C3: node identity unchanged, top edge moved `0px`, a later resize still
      repositions — recorded repositioning dead from the first commit
- [ ] **CHK-033** [P0] C4: focused field inside the reduced `visualViewport` rect — recorded not
      asserted anywhere
- [ ] **CHK-034** [P0] C5: scrim covers the full viewport including the navbar band — recorded no
      sheet scrim exists
- [ ] **CHK-035** [P0] C6: removing the navbar moves an asserted number — recorded 1.35px, i.e. nothing
- [ ] **CHK-036** [P0] REQ-005 landed in one of its two forms; the choice is recorded with the census
      rows that justify it, before the code was written
- [ ] **CHK-037** [P0] No adjacent defect owned by `001`, `002` or `006` was "improved" outside this
      scope
- [ ] **CHK-038** [P0] `styles.css` lane taken at Phase 4 and released at Phase 6, with all four
      release conditions met in order
- [ ] **CHK-039** [P0] Full recapture taken **with a navbar present** — a condition no capture has
      ever had — and a **named human** signed off on every changed PNG. `screenshots:verify` never
      opens an image and cannot be this step
- [ ] **CHK-044** [P0] `008`'s early replay re-asserted `000`, `004`, `005`, `001` and `002` against
      the tree this packet released, and all five re-closed. A portal changes stacking and
      containment for everything mounted near it
- [ ] **CHK-045** [P0] AC-007 to AC-014 each have their failing number recorded from the named
      producer before the stage that owes it is reported complete (review finding F16)

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

- [ ] **CHK-050** [P0] The `is-phone` bounds branch recorded verbatim in the census before deletion
- [ ] **CHK-051** [P0] The anchor-lifetime decision and its reason recorded before implementation
- [ ] **CHK-052** [P1] `implementation-summary.md` written once work starts
- [ ] **CHK-053** [P1] Each criterion's failing and passing numbers recorded

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] **CHK-060** [P0] `styles.css` not split; every sheet, scrim and safe-area edit made while this
      phase holds the lane
- [ ] **CHK-061** [P1] Phone screenshot scenarios include a navbar in frame
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
| Browser harness, all criteria, navbar and safe-area present | not run |
| Full recapture **and a human reviewed the changed PNGs** | not run |
| Phone captures taken with a navbar in frame | not run |
| `npm run story:smoke`, sheet states at the production mount point | not run |
| `--db-radius-lg` resolves non-empty on the portalled node | not run |
| Operator confirmation on a phone | not run |

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:arch-verify -->
## L3+: ARCHITECTURE VERIFICATION

- [ ] **CHK-070** [P0] The fix is a portal, not a number: phone sheets mount on `document.body`
- [ ] **CHK-071** [P0] One phone predicate with one threshold drives every sheet decision, modal and
      anchored
- [ ] **CHK-072** [P0] One presentation contract declares portal target, scrim, safe-area padding and
      keyboard behaviour, and both `DbModal` and the positioner satisfy it
- [ ] **CHK-073** [P0] The portalled node is tokened — `000`'s token root verified here, not assumed

<!-- /ANCHOR:arch-verify -->
---

<!-- ANCHOR:perf-verify -->
## L3+: PERFORMANCE VERIFICATION

- [ ] **CHK-080** [P1] The contract adds no listener the positioner and `DbModal` did not already own
- [ ] **CHK-081** [P1] The scrim attaches with the sheet and is removed with it
- [ ] **CHK-082** [P1] Anchor re-resolution, if chosen, queries the DOM only after a rebuild

<!-- /ANCHOR:perf-verify -->
---

<!-- ANCHOR:deploy-ready -->
## L3+: DEPLOYMENT READINESS

- [ ] **CHK-090** [P0] Each stage landed as its own revertable commit
- [ ] **CHK-091** [P0] Rollback rehearsed: reverting the portal restores container-mounted sheets and
      the recorded `is-phone` branch
- [ ] **CHK-092** [P0] The blast radius of the deleted bounds branch is a recorded number per non-sheet
      popover, not an assumption
- [ ] **CHK-093** [P0] The CSS lane released only after the full recapture and human review

<!-- /ANCHOR:deploy-ready -->
---

<!-- ANCHOR:compliance-verify -->
## L3+: COMPLIANCE VERIFICATION

- [ ] **CHK-100** [P0] MIT licence integrity preserved — nothing copied from the AGPL/source-available
      references under `external/`
- [ ] **CHK-101** [P1] No write to the operator's vault beyond the declared testbed

<!-- /ANCHOR:compliance-verify -->
---

<!-- ANCHOR:docs-verify -->
## L3+: DOCUMENTATION VERIFICATION

- [ ] **CHK-110** [P0] I1-I6 complete: the census is written down per surface, not sampled
- [ ] **CHK-111** [P0] The delta between the runtime log and the static list is named, not summarised
      as a count
- [ ] **CHK-112** [P1] `validate.sh <spec-folder> --strict` run and its exit code read without a pipe

<!-- /ANCHOR:docs-verify -->
---

<!-- ANCHOR:sign-off -->
## L3+: SIGN-OFF

This spec does not close on gate passage alone — that is precisely what 1.3.1 did. It closes when the
measurements in section 1 have moved from their recorded failing values, the negative controls hold,
the anchor-lifetime fix in R5 has landed in one of its two forms, and **the operator has confirmed on
a phone that the sheet covers the bottom navigation bar.**

- [ ] **CHK-120** [P0] Every criterion moved from its recorded failing value
- [ ] **CHK-121** [P0] N1-N6 hold
- [ ] **CHK-122** [P0] REQ-005 landed in one of its two forms
- [ ] **CHK-123** [P0] Operator confirmed on a phone that the sheet covers the bottom navigation bar
- [ ] **CHK-124** [P0] CSS lane released to the next phase

<!-- /ANCHOR:sign-off -->
