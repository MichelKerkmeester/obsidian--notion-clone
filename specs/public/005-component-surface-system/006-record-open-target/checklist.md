---
title: "Verification Checklist: Record Open Target"
description: "Acceptance criteria with the failing number recorded first, so a pass means something changed."
trigger_phrases:
  - "006 record open target checklist"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Record Open Target

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on an observation from the driven trace, never on a reading of the source.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. A criterion
with an empty "today" cell is not accepted. Cells reading *trace* take their number from the Stage 1
artefact; the source fact beside them is why the criterion is expected to fail, not the measurement
itself.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| A1 | Body characters from the seeded note present in the surface | **0** — values are `textContent` of column values only (`table-record-peek.ts:262-271`); the file is never read | all of them | [ ] |
| A2 | After a field commit re-renders the view, `elementFromPoint` at the surface centre returns a node inside the surface | *trace* — peek dismisses on scroll and resize (`table-record-peek.ts:227-228`); not a leaf, not a `Modal` | true | [ ] |
| A3 | Surface height on a 402px phone | *trace* — detail panel clamped to `50vh` (`styles.css:9074-9076`); peek is `min(360px, 100%)` with **no phone rule** (`styles.css:18328`) | ≥ 50% of viewport | [ ] |
| A4 | Affordances producing a surface other than the configured target | **20 affordances → 4 surfaces, no setting exists** (`src/data/types.ts:636-657`) | 0 | [ ] |
| A5 | Setting round-trip across a plugin reload, **and after the reload a driven affordance produces the surface the setting names** *(threshold extended under review finding F8 — a round-trip alone closes on a persisted string nothing acts on)* | no setting exists; the spread it must collapse is A4's 20 affordances to 4 surfaces | written = read-back **and** 0 affordances producing a surface other than the one named | [ ] |
| A6 | Dropdown opened inside the surface wins the hit test over it | returns the surface — `z-index: 998` (`styles.css:18324`) beats `--db-layer-popover: 100` and `--db-layer-submenu: 110` (`styles.css:72-73`) | returns the dropdown | [ ] |
| A7 | Database view still rendered after an open, unless full-page was chosen | *trace* — `getLeaf(false)` reuses the active leaf (`data-source.ts:425`) | still rendered | [ ] |
| A8 | Deleting the target surface from the harness DOM moves an asserted number | no such check exists | moves | [ ] |

### Blank Failing Numbers — Blocked, Not Merely Unmet

`acceptance-criteria.md` AC-002, AC-003, AC-005, AC-007 and AC-009 to AC-013 have no recorded failing
number (review finding F16). Each is `Blocked` until the number is there, and the provenance table in
that file names what produces it and at which stage. No number may be invented.

Two ordering constraints follow. **Stage 2 may not take the target-policy decision with the operator
before Stage 1 has recorded what the twenty affordances actually do.** And **Stage 5 may not retire
the peek before AC-002, AC-003, AC-007, AC-009 and AC-012 hold its *before* numbers** — once the
module is gone there is nothing left to measure them against.

AC-011's cell is the one to watch: **no write has ever been attributed to a record id in any
harness**, and this packet's aliasing failure is the only one in the program that writes.

### Negative Controls

| # | Control | Evidence |
|---|---|---|
| N1 | Deleting the target surface from the harness DOM moves an asserted number | [ ] |
| N2 | Reverting the resolver reproduces the recorded Stage 1 surface split | [ ] |
| N3 | Setting an absent value reproduces today's per-affordance behaviour exactly | [ ] |
| N4 | Reintroducing the literal `998` fails the A6 hit test | [ ] |
| N12 | Running A6 on a harness page with no `styles.css` loaded returns a hit result unrelated to the defect — no z-index applies to anything, so the check must be able to tell that apart from a real pass (review finding F3) | [ ] |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [ ] **CHK-001** [P0] `../architecture-findings.md` read, and `spec.md` §3A's census read
- [ ] **CHK-002** [P0] `000` landed: the factory, the token root and the Storybook `Modal` stub
- [ ] **CHK-003** [P0] `003-mobile-sheet-presentation` landed — without the portal A3 cannot pass
- [ ] **CHK-004** [P0] The Stage-1 driven trace artefact is committed, with a record per affordance
- [ ] **CHK-005** [P0] The Stage-2 target-policy decision is recorded with its reason; no code was
      written before it closed
- [ ] **CHK-006** [P0] The serialized `styles.css` lane is held by this spec for Stage 5

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] **CHK-010** [P0] One resolver decides the target; no affordance decides for itself
- [ ] **CHK-011** [P0] The hardcoded touch branch at `database-view.ts:8425` is retired
- [ ] **CHK-012** [P0] `Mod+Enter` and the **Open** button resolve identically on the same device
- [ ] **CHK-013** [P0] The literal `z-index: 998` is replaced by a declared tier from the scale
- [ ] **CHK-014** [P0] No surface remains that the resolver does not own
- [ ] **CHK-015** [P1] S3 holds: no spec path, requirement id, task id or phase number in any code
      comment

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## TESTING

| Gate | Evidence |
|---|---|
| `npx tsc --noEmit` exit 0, no output, read without a pipe | [ ] |
| `npm run build` exit 0 | [ ] |
| `npx vitest run` exit 0, count not reduced | [ ] |
| Trace re-run; every criterion a delta against Stage 1 | [ ] |
| Browser harness, all criteria | [ ] |
| Setting persists across a reload | [ ] |
| **Full** recapture: each target, both themes | [ ] |
| `npm run screenshots:verify` exit 0 | [ ] |
| **A human reviewed the changed PNGs** | [ ] |
| `npm run story:smoke` at production mount points | [ ] |
| Working tree clean after a full run | [ ] |
| CSS lane released; no other spec held `styles.css` during Stage 5 | [ ] |

- [ ] **CHK-020** [P0] The trace script is unchanged between Stage 1 and Stage 6
- [ ] **CHK-021** [P0] Every criterion is a delta between the two artefacts
- [ ] **CHK-022** [P0] N1-N4 all hold, run before the criteria are trusted
- [ ] **CHK-023** [P0] No DOM assertion or hit test added to a vitest suite — the runner has no jsdom
- [ ] **CHK-024** [P0] The setting round-trips across a plugin reload

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

Every row is driven, not read. A row closes with the surface that was observed.

| # | Affordance | Observed surface | Evidence |
|---|---|---|---|
| C1 | Table title click | | [ ] |
| C2 | Table **Open** button, desktop | | [ ] |
| C3 | Table **Open** button, touch | | [ ] |
| C4 | `Mod+Enter` on a focused table cell, desktop | | [ ] |
| C5 | `Mod+Enter` on a focused table cell, touch device with a keyboard | | [ ] |
| C6 | List row body click | | [ ] |
| C7 | List **Open** button | | [ ] |
| C8 | Board card body click | | [ ] |
| C9 | Board **Open** button | | [ ] |
| C10 | Gallery card body click | | [ ] |
| C11 | Gallery **Open** button | | [ ] |
| C12 | `Enter` / `Space` on a focused card | | [ ] |
| C13 | Calendar event click | | [ ] |
| C14 | Calendar backlog item | | [ ] |
| C15 | Timeline event click | | [ ] |
| C16 | Timeline backlog item | | [ ] |
| C17 | Chart drilldown row | | [ ] |
| C18 | Chart **Open all** | | [ ] |
| C19 | Row context menu "Open note" | | [ ] |
| C20 | Detail panel's own "Open note" | | [ ] |

| # | Check | Evidence |
|---|---|---|
| B1 | `databaseFilesAlwaysOpenInNewTab` behaviour unchanged | [ ] |
| B2 | `databaseFilesPreventDuplicateTabs` behaviour unchanged | [ ] |
| B3 | Database-definition-file opens at `main.ts:689-724` untouched | [ ] |
| B4 | Field-link opens inside cell values unaffected | [ ] |
| B5 | Hover preview unaffected | [ ] |
| B6 | Every line number this packet cites was re-resolved through its selector or symbol and `rg` command before being relied on; moved numbers recorded old to new (review finding F11) | [ ] |
| B7 | No criterion closed on the peek module being deleted, a setting existing, an affordance being routed, or a trace artefact existing (review finding F8) | [ ] |
| B8 | No desktop harness measurement taken before `000` repaired its `styles.css` load was re-used. A6 cannot be evaluated at all without the cascade (review finding F3) | [ ] |

- [ ] **CHK-030** [P0] A1: the seeded note's body characters are present in the surface — recorded 0
- [ ] **CHK-031** [P0] A2: the surface survives a view re-render
- [ ] **CHK-032** [P0] A3: phone surface height at least half the viewport
- [ ] **CHK-033** [P0] A4: zero affordances produce a surface other than the configured target —
      recorded 20 affordances resolving to 4 surfaces with no setting
- [ ] **CHK-034** [P0] A5: the setting round-trips — recorded no such setting exists
- [ ] **CHK-035** [P0] A6: a dropdown inside the surface wins the hit test — recorded the surface wins
      at `z-index: 998`
- [ ] **CHK-036** [P0] A7: the database view is still rendered after an open, unless full-page was
      chosen
- [ ] **CHK-037** [P0] A8: deleting the target surface from the harness DOM moves an asserted number
- [ ] **CHK-038** [P0] S2 holds: no adjacent defect "improved" outside the declared scope
- [ ] **CHK-039** [P0] Every blank failing-number cell named in `acceptance-criteria.md`'s provenance
      table is filled from its named producer. No number invented (review finding F16)
- [ ] **CHK-044** [P0] Stage 5 did not retire the peek before AC-002, AC-003, AC-007, AC-009 and
      AC-012 held its *before* numbers
- [ ] **CHK-045** [P0] `styles.css` lane taken at Stage 5 and released at Stage 7, with all four
      release conditions met in order, including a **named human** signing off on every changed PNG
- [ ] **CHK-046** [P0] `008`'s early replay re-asserted `000`, `004`, `005`, `001`, `002` and `003`
      against the tree this packet released, and all six re-closed. This is the last handoff before
      `008`'s full release gate
- [ ] **CHK-047** [P0] Cascade re-confirmation recorded: replacing the literal `998` with a declared
      tier changes stacking for anything that sat between the two values

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## SECURITY

- [ ] **CHK-040** [P0] S5 holds: no network call, telemetry or remote dependency added
- [ ] **CHK-041** [P0] No secret, token or absolute personal path in any artifact
- [ ] **CHK-042** [P0] S4 holds: no code, CSS value or token scale copied from AnyType or AppFlowy;
      Notion used as a visual target only

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] **CHK-050** [P0] The Stage-1 and Stage-6 trace artefacts are both committed
- [ ] **CHK-051** [P0] The target-policy decision is recorded with its reason
- [ ] **CHK-052** [P0] The peek module and its fifteen CSS rules are archived verbatim before deletion
- [ ] **CHK-053** [P1] `implementation-summary.md` written once work starts
- [ ] **CHK-054** [P1] Each criterion's Stage-1 and Stage-6 observations recorded

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] **CHK-060** [P0] `styles.css` not split; every peek-rule edit made while this spec holds the lane
- [ ] **CHK-061** [P1] Trace scratch output is not committed outside the artefact
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
| Trace re-run; every criterion a delta against Stage 1 | not run |
| Browser harness, all criteria | not run |
| Setting persists across a reload | not run |
| **Full** recapture: each target, both themes | not run |
| `npm run screenshots:verify` exit 0 | not run |
| **A human reviewed the changed PNGs** | not run |
| `npm run story:smoke` at production mount points | not run |
| Operator opened a record on desktop and on a phone | not run |

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:arch-verify -->
## L3+: ARCHITECTURE VERIFICATION

- [ ] **CHK-070** [P0] One policy, one resolver: every affordance in `spec.md` §3A calls it
- [ ] **CHK-071** [P0] The target is a real Obsidian surface — a leaf or a `Modal` owned by the
      workspace, with a lifetime independent of the view's render cycle
- [ ] **CHK-072** [P0] The target shows the note's rendered body, not a property list
- [ ] **CHK-073** [P0] The resolver's boundary is asserted: record opens in, database-definition-file
      opens out

<!-- /ANCHOR:arch-verify -->
---

<!-- ANCHOR:perf-verify -->
## L3+: PERFORMANCE VERIFICATION

- [ ] **CHK-080** [P1] The resolver performs no I/O and is not on a render hot path
- [ ] **CHK-081** [P1] Chart **Open all** opens no more leaves than it does today

<!-- /ANCHOR:perf-verify -->
---

<!-- ANCHOR:deploy-ready -->
## L3+: DEPLOYMENT READINESS

- [ ] **CHK-090** [P0] Each stage landed as its own revertable commit
- [ ] **CHK-091** [P0] An absent setting value reproduces today's per-affordance behaviour exactly
- [ ] **CHK-092** [P0] Rollback rehearsed: reverting Stage 4 restores the per-affordance choices with
      the resolver left in place unused
- [ ] **CHK-093** [P0] The CSS lane released at Stage 7's recapture

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

- [ ] **CHK-110** [P0] The trace artefact records all twenty affordances, driven not read
- [ ] **CHK-111** [P0] The delta between the driven trace and `spec.md` §3A's static table is named
- [ ] **CHK-112** [P1] `validate.sh <spec-folder> --strict` run and its exit code read without a pipe

<!-- /ANCHOR:docs-verify -->
---

<!-- ANCHOR:sign-off -->
## L3+: SIGN-OFF

This spec does not close on gate passage alone. It closes when the measurements in section 1 have
moved from their recorded failing values, the negative controls hold, section 3 has an observed
surface in every row, and **the operator has opened a record on desktop and on a phone and seen the
page** — the defect that started it.

`screenshots:verify` green is not evidence that anything looks right. It proves a capture was
regenerated after its hand-maintained source list changed, and it never opens an image.

- [ ] **CHK-120** [P0] Every criterion moved from its recorded Stage-1 value
- [ ] **CHK-121** [P0] N1-N4 hold
- [ ] **CHK-122** [P0] Every row in Fix Completeness's affordance coverage has an observed surface
- [ ] **CHK-123** [P0] Operator opened a record on desktop and on a phone and saw the page
- [ ] **CHK-124** [P0] CSS lane released

<!-- /ANCHOR:sign-off -->
