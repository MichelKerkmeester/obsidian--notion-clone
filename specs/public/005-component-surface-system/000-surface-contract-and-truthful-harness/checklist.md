---
title: "Verification Checklist: Surface Contract and Truthful Harness"
description: "Acceptance criteria with the failing number recorded first, so a pass means something changed."
trigger_phrases:
  - "000 surface contract checklist"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Surface Contract and Truthful Harness

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Each row in Criteria records the failing measurement from the current tree **before** work starts. A
criterion with an empty "today" cell is not accepted.

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| A1 | Computed radius, padding, font-size, shadow equal at production mount point and inside the container | 29/29 differ | 0 differ | [ ] |
| A2 | `--db-radius-lg` resolves non-empty on every plugin-created element | empty on 25/29 | 0 empty | [ ] |
| A3 | No selector declares conflicting values for one property | 87 selectors / 124 conflicts | 0 | [ ] |
| A4 | Removing `.mobile-navbar` from the harness moves an asserted number | moves 1.35px (fallback artefact) | material move | [ ] |
| A5 | No harness hardcodes a runtime-computed value — **all four named** | `--db-mobile-sheet-bottom: 0px` (`:43`), `--db-header-height: 40px` (`:24`), `--db-card-field-width: 120px` (`:29`), `--db-timeline-row: 34px` (`:63`, a length where a grid line index is required) | 0 pinned | [ ] |
| A6 | Every surface-creating module has a story or a written exemption | 5 invisible to the gate | 0 invisible | [ ] |
| A7 | The contract scan **exits non-zero on a reintroduced bypass, then 0 once removed** — both statuses read, in that order | no check, so neither exit status has ever been observed | both observed | [ ] |
| A8 | Registry equality — exit criterion consumed by `001` | *census*; produced by the Stage-2 birth observer vs the typed registry | equality, raw-mount control fails | [ ] |
| A9 | Anchor lease proven under a wholesale refresh — exit criterion consumed by `003` | *trace*; produced by the Stage-5 transition harness | re-anchors and still repositions | [ ] |
| A10 | Substituting any one proof-tuple coordinate fails a value assertion | no such control; produced by the Stage-1 substitution harness | 6/6 substitutions fail a value | [ ] |
| A11 | Harness numbers agree with `009`'s live numbers; uncorroborated set named | *trace*; produced by the Stage-1.5 cross-check runner | every pair agrees; list written | [ ] |
| A12 | CI fails on the old `wr.width > 320` predicate and passes on the inverted one; the guard survives a rebase | old predicate live and green at `verify-placement.mjs:170`, run every push via `gates.yml:67` | inverted, guarded, rebase-tested | [ ] |
| A13 | Desktop page loads `styles.css` **and a desktop measurement moves** | `:220` loads it on the phone page only; desktop checks at `:130-178` have no cascade | ≥1 moved, before and after recorded | [ ] |
| A14 | No harness file assigns a custom property the runtime also assigns | 4 known violations; no general scan exists | scan flags 4 pre-repair, 0 after | [ ] |
| A15 | Capture fingerprint covers `runtime-vars.css`, `preview.ts`, `verify-placement.mjs` | `capture.mjs:205` covers `styles.css` only | all 3 edits report stale | [ ] |
| A16 | Every recorded value carries its input hashes | *census*; nothing records hashes today | 100% carry hashes | [ ] |
| A17 | The five borrowed-ancestor checkbox parents stay classed | 5 unguarded sites | guard fails on each removal | [ ] |
| A18 | No phase moves `Planned` → `In Progress` with a blank *census*/*trace* cell | prose rule, no enforcement | transition refused while blank | [ ] |

### Negative Controls

| # | Control | Evidence |
|---|---|---|
| N1 | Each geometry check fails when its subject is deleted from the harness DOM | [ ] |
| N2 | The contract scan fails on a deliberately reintroduced violation | [ ] |
| N3 | Reverting the token-root line reproduces the original 29/29 divergence | [ ] |
| N6 | Re-pinning `--db-mobile-sheet-bottom` in `runtime-vars.css` changes a capture | [ ] |
| N7 | Restoring one deleted duplicate block changes a computed winner at a real mount | [ ] |
| N8 | Renaming a covered module's exported factory hides it from the coverage join | [ ] |
| N9 | A raw `document.body.appendChild` of a surface-shaped node fails registry equality | [ ] |
| N10 | Forcing `refresh()` while a surface is open reproduces the dead `place()` | [ ] |
| N11 | Stubbing the model write makes the driven action's assertion fail | [ ] |
| N12 | Registering a second dismissal owner for one surface fails the owner count | [ ] |
| N13 | Each of the six single-coordinate substitutions fails a value assertion | [ ] |
| N14 | Re-pinning any one of the four named variables makes the pinning scan fail | [ ] |
| N15 | A deliberately wrong live value fails the cross-check pairing | [ ] |
| N16 | Restoring `wr.width > 320` makes the inversion guard fail | [ ] |
| N17 | Removing the desktop `styles.css` load returns the changed measurement to its pre-load value | [ ] |
| N18 | Reverting the fingerprint extension makes a harness edit stop reporting stale | [ ] |
| N19 | Editing an input file after a measurement makes the reader report that value stale | [ ] |
| N20 | Removing the parent class at any one of the five checkbox call sites fails the guard | [ ] |
| N21 | A blanked *census*/*trace* cell blocks the `Planned` → `In Progress` transition | [ ] |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [ ] **CHK-001** [P0] `../architecture-findings.md` and `../adversarial-review.md` read for the
      measurements and findings behind A1-A18
- [ ] **CHK-002** [P0] Every criterion's failing "today" value confirmed against the current tree
      before any change, and every *census*/*trace* row names its producing artefact and stage
- [ ] **CHK-003** [P0] The serialized `styles.css` lane is held by this phase alone
- [ ] **CHK-004** [P0] Stage 1 harness repairs landed before any product-code change
- [ ] **CHK-005** [P0] **T0 landed first**: the `verify-placement.mjs` widthless-caller assertion is
      inverted before the census, the cascade audit or any product change
- [ ] **CHK-006** [P0] `009`'s transport proof passed and its baseline probe run is recorded — or a
      written note that it stopped at its stop condition and every claim here is uncorroborated

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] **CHK-010** [P0] Every floating surface is created through `openSurface()`; no other path remains
- [ ] **CHK-011** [P0] Every visual rule addresses `[data-db-surface]`, not an ancestor class
- [ ] **CHK-012** [P1] No spec path, requirement id, task id or phase number in any code comment
- [ ] **CHK-013** [P1] The `createDiv` instrumentation shim is removed before the phase closes
- [ ] **CHK-014** [P1] Every citation this phase adds to a file the program edits names a selector or
      symbol plus the command that finds it, not a bare line number. Measurement citations stay verbatim

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## TESTING

- [ ] **CHK-020** [P0] `npx tsc --noEmit` exit 0, read without a pipe
- [ ] **CHK-021** [P0] `npm run build` exit 0
- [ ] **CHK-022** [P0] `npx vitest run` exit 0, test count not reduced
- [ ] **CHK-023** [P0] Browser harness: all criteria measured at both mount points, navbar and
      safe-area present
- [ ] **CHK-024** [P0] N1 holds — every geometry check fails when its subject is deleted
- [ ] **CHK-025** [P0] N2 holds — the contract scan fails on a deliberately reintroduced violation
- [ ] **CHK-026** [P0] N3 holds — reverting the token-root line reproduces the 29/29 divergence
- [ ] **CHK-027** [P0] `npm run story:smoke` green at production mount points
- [ ] **CHK-028** [P0] N6-N13 each demonstrated and recorded separately
- [ ] **CHK-029** [P0] N14-N21 each demonstrated and recorded separately

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] **CHK-030** [P0] A1: computed values equal at both mount points — recorded 29/29 differ, now 0
- [ ] **CHK-031** [P0] A2: `--db-radius-lg` non-empty everywhere — recorded empty on 25/29, now 0
- [ ] **CHK-032** [P0] A3: no conflicting declarations — recorded 87 selectors / 124 conflicts, now 0
- [ ] **CHK-033** [P0] A4: removing `.mobile-navbar` moves an asserted number — recorded 1.35px
      fallback artefact, now a material move
- [ ] **CHK-034** [P0] A5: no pinned runtime value — recorded 4 pinned (`--db-mobile-sheet-bottom`,
      `--db-header-height`, `--db-card-field-width`, `--db-timeline-row`), now 0
- [ ] **CHK-035** [P0] A6: every surface-creating module covered — recorded 5 invisible, now 0
- [ ] **CHK-036** [P0] A7: the contract scan **exits non-zero on a reintroduced bypass and 0 once it is
      removed** — both statuses read, in that order. Its existence is not the criterion
- [ ] **CHK-037** [P0] All 33 positioner sites and 11 menus migrated; census rerun shows zero
      surfaces outside the factory
- [ ] **CHK-038** [P0] No adjacent defect owned by a later phase was "improved" outside this scope
- [ ] **CHK-039** [P0] A11: every reachable surface has a harness/live pair that agrees, and the
      uncorroborated list names a reason per entry
- [ ] **CHK-039a** [P0] A12: CI fails on the old predicate, passes on the inverted one, and the guard
      survived a rebase onto `main`
- [ ] **CHK-039b** [P0] A13: at least one desktop measurement moved because `styles.css` loaded, with
      both values recorded
- [ ] **CHK-039c** [P0] A14 and A15: the pinning scan reports 0, and all three harness files now force
      a recapture
- [ ] **CHK-039d** [P0] A16: every recorded value carries its input hashes, handed to `008`
- [ ] **CHK-039e** [P0] A17: the checkbox-parent guard fails on each of the five removals
- [ ] **CHK-039f** [P0] A18: the blank-cell checker refuses a blanked cell and permits a filled one
- [ ] **CHK-039g** [P0] The two named exit criteria are recorded before their handoffs open —
      registry equality for `001`, the proven anchor lease for `003`

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

- [ ] **CHK-050** [P0] Every deleted CSS block recorded verbatim in the cascade audit before removal
- [ ] **CHK-051** [P1] `implementation-summary.md` written once work starts
- [ ] **CHK-052** [P1] Each criterion's post-change measurement recorded against its failing value
- [ ] **CHK-053** [P1] Any story exempted from coverage carries a written reason

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] **CHK-060** [P0] `styles.css` not split; every edit made while this phase holds the lane
- [ ] **CHK-061** [P1] Storybook stories live at their production mount point, not inside a
      convenience wrapper
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
| Browser harness, all criteria | not run |
| **Live cross-check against `009` — every pair agrees** | not run |
| **Inversion guard: fails on the old predicate, survives a rebase** | not run |
| **Harness pinning scan reports 0** | not run |
| **Blank-cell checker refuses a blanked cell** | not run |
| **Checkbox-parent guard fails on each of the five removals** | not run |
| Full recapture **and a human reviewed the changed PNGs** | not run |
| `npm run story:smoke` at production mount points | not run |
| Working tree clean after a full run | not run |

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:arch-verify -->
## L3+: ARCHITECTURE VERIFICATION

- [ ] **CHK-070** [P0] One creation path: `openSurface()` owns mount point, role stamp, stack
      registration and placement
- [ ] **CHK-071** [P0] Tokens travel with the surface: `.db-surface` in the token-root selector list
      — find it with `rg -n '^\.note-database-container,' styles.css` rather than a line number,
      which T11 invalidates — resolving on `document.body`
- [ ] **CHK-072** [P0] The ancestry grammar is retired — no rule depends on a container class for a
      surface's own layout
- [ ] **CHK-073** [P0] `003`'s portal requirement is satisfiable: a body-mounted surface carries its
      tokens

<!-- /ANCHOR:arch-verify -->
---

<!-- ANCHOR:perf-verify -->
## L3+: PERFORMANCE VERIFICATION

- [ ] **CHK-080** [P1] `openSurface()` adds no listener the positioner and overlay stack did not
      already own
- [ ] **CHK-081** [P1] No census instrumentation ships in the built bundle

<!-- /ANCHOR:perf-verify -->
---

<!-- ANCHOR:deploy-ready -->
## L3+: DEPLOYMENT READINESS

- [ ] **CHK-090** [P0] Each stage landed as its own revertable commit
- [ ] **CHK-091** [P0] Rollback rehearsed: reverting Stage 4 and Stage 5 together restores
      ancestry-derived tokens without stranding a surface
- [ ] **CHK-092** [P0] The CSS lane released only after the full recapture and human review

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

- [ ] **CHK-110** [P0] The census delta — the surfaces static analysis missed — is written down and
      named, not summarised as a count
- [ ] **CHK-111** [P0] The cascade audit lists all 87 duplicated selectors with each classified
      intentional or dead
- [ ] **CHK-112** [P1] `validate.sh <spec-folder> --strict` run and its exit code read without a pipe

<!-- /ANCHOR:docs-verify -->
---

<!-- ANCHOR:sign-off -->
## L3+: SIGN-OFF

This spec does not close on gate passage alone. It closes when the measurements in Criteria have
moved from their recorded failing values, the negative controls hold, **every harness number has been
confirmed against an instrument this phase did not repair**, and the surfaces this spec touches have
been looked at on a device by the operator.

- [ ] **CHK-120** [P0] Every criterion moved from its recorded failing value
- [ ] **CHK-121** [P0] N1-N3, N6-N13 and N14-N21 all hold
- [ ] **CHK-122** [P0] Operator device confirmation recorded
- [ ] **CHK-123** [P0] CSS lane released to the next phase
- [ ] **CHK-124** [P0] The live cross-check was re-run from the final state and still agrees; its
      uncorroborated list is unchanged or its growth is explained
- [ ] **CHK-125** [P0] `008` has received this phase's matrix **and** its input-hash records

<!-- /ANCHOR:sign-off -->
