---
title: "Acceptance Criteria: Surface Contract and Truthful Harness"
description: "The criteria this packet must satisfy before it may be closed, each carrying its exact measurement, its threshold, the failing number measured on the current tree, and the negative control that proves the check can fail."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "000 surface contract criteria"
  - "proof tuple"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/000-surface-contract-and-truthful-harness"
    last_updated_at: "2026-08-31T00:00:00Z"
    last_updated_by: "harness-dependence-audit"
    recent_action: "Classified 20 criteria for harness dependence; 2 compromised, 1 unknown"
    next_safe_action: "Run scan-pinned-values.mjs and read whether it skips runtime-assigned pins"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-000"
      parent_session_id: null
    completion_pct: 20
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Surface Contract and Truthful Harness

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.
>
> Every row records the value measured on the current tree. **A criterion is not accepted until its
> failing number is recorded from the current tree.** Where no runtime number exists yet the cell is
> marked *census* or *trace* and the criterion closes on the named artefact — no number is invented.
>
> **A *census* or *trace* cell must also name what will produce its number and at which stage.** A
> blank cell with no named producer is not a deferred measurement, it is an unowned one, and AC-020's
> checker refuses to move a phase from `Planned` to `In Progress` while one exists.
>
> **A harness number is not evidence on its own.** Every criterion below whose value can also be read
> by `../009-live-verification`'s live probe is paired with that reading, and the pair must agree.
> This phase repairs the harness it then measures through; the running app is the one instrument it
> cannot influence.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 000-surface-contract-and-truthful-harness
**Level:** 3
**Status:** Draft
**Date:** 2026-08-29
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
Each row's **Measured today** cell is the failing value read from the current tree before work
started; a row with an empty cell is not accepted.

### The nine dimensions

The four original conditions — measured at the production mount point, a number or hit test with a
threshold, demonstrated failing on today's tree with the failing number recorded, and a harness that
can distinguish — are necessary and **not sufficient**. A *temporally stale or semantically aliased
surface* satisfies all four: the first measurement is real, the baseline fails, deleting the subject
moves the metric, and the harness is still watching the wrong logical row, an anchor rectangle from
a previous render epoch, or an action that lands somewhere else after a later transition.

Five dimensions close that hole, and every criterion below carries them:

| Dimension | What the criterion must pin down |
|---|---|
| Semantic identity | The asserted surface/row/checkbox/target is the intended **logical** entity, not merely a rectangle that matches |
| Transition trace | `open → mutate/refresh/theme/viewport → reconcile → observe → action → close`, not a single static read |
| Action outcome | The click, key, drag or selection changes the intended model or render state |
| Resource ownership | Exactly one dismissal, scroll, keyboard and focus owner; no leaked listener or node after close |
| Negative-control mutation | Substituting **one** coordinate must fail a meaningful assertion, not merely remove a node |

**The proof tuple** is `producer x runtime branch x mount/host x environment x transition x semantic
outcome x negative control`. A missing coordinate is a coverage gap even when the number is valid,
which is why §2 carries a coverage matrix as well as a criteria table.

### The tenth condition: an instrument this phase did not repair

The five dimensions above still assume the instrument is honest. This phase **rewrites** the
instrument in Stage 1 and then asserts every row below through it. A repair that is subtly wrong in a
way that makes every check pass — a `.mobile-navbar` at the wrong z-index, a `styles.css` loaded into
a cascade context production never has — satisfies all nine dimensions and reproduces 1.3.1 exactly,
in a different costume.

`../009-live-verification` runs before this phase and supplies the second witness: the running
Obsidian, read through the CLI's renderer `eval`. Nothing in this phase can reach it. **AC-013 makes
the pairing a criterion, and a disagreement between the two instruments blocks this phase.** Where the
probe structurally cannot reach a surface, that surface is recorded as *uncorroborated* with its
reason — silence is not corroboration.

### Criteria table

| AC-ID | REQ | Measurement — producer → mount → transition → observation | Threshold | Measured today | NC | Status | Waiver |
|---|---|---|---|---|---|---|---|
| AC-001 (A1) | REQ-002, REQ-003 | Open each of the 29 probed overlay classes through its **production producer**; at the production mount point read `getComputedStyle` for `border-radius`, `padding`, `font-size`, `box-shadow`; compare against the same class rendered inside `.note-database-container` | 0 of 29 classes differ on any of the four properties | **29/29 differ.** `--db-radius-lg` *empty* on body vs `8px` in container; `.db-owned-menu` border-radius **0px** vs 8px; `.db-menu-item` border-radius **0px** vs 4px; `.db-menu-item` font-size **14px** vs 13px | N3 | Unmet | - |
| AC-002 (A2) | REQ-002 | For every element the plugin creates during the scripted drive, resolve `--db-radius-lg` on the element itself, at its real mount parent | 0 elements resolve it empty | **empty on 25/29** | N3 | Unmet | - |
| AC-003 (A3) | REQ-004 | Replay the computed winner for each duplicated selector at each real production mount, per theme and per media context; a selector is single-valued when exactly one intentional winner exists in each active cascade context | 0 selectors with an **unknown** context; 0 unintentional conflicts. Intentional context variants are dispositioned, not deleted | **87 selectors, 124 conflicts** | N7 | Unmet | - |
| AC-004 (A4) | REQ-005, REQ-006 | Delete `.mobile-navbar` from the harness DOM, rerun the geometry checks, diff every asserted number | at least one asserted number moves by `> 1.35px` | moves the offset **1.35px** — i.e. nothing. `popover-position.ts:291` falls back to a hardcoded 50, so harness and device agree and both are wrong | N1 | Unmet | - |
| AC-005 (A5) | REQ-005, REQ-015 | Grep every harness stylesheet and fixture for a literal value the runtime computes; then re-capture and confirm the capture reflects the computed value or the declared fallback, not the literal. **All four are enumerated by name and all four must go** | 0 pinned runtime-computed values, counted against the named four | **4 pinned, not 1.** `--db-mobile-sheet-bottom: 0px` (`runtime-vars.css:43`) — computed at `popover-position.ts:115`, pinned to the sheet defect's correct answer. `--db-header-height: 40px` (`:24`) — **never assigned anywhere in `src/`**; the sole consumer `styles.css:17698` takes its `34px` fallback in production. `--db-card-field-width: 120px` (`:29`) — set conditionally at `card-field-renderer.ts:108`, so the unset branch never renders. `--db-timeline-row: 34px` (`:63`) — a **type error**: the runtime assigns a unitless grid line index (`calendar-timeline-renderer.ts:588`, `:660`) and `styles.css:16316`/`:16554` read it as `grid-row: var(--db-timeline-row, 1)`, so every timeline capture ever taken renders an invalid value's fallback | N6, N14 | Unmet | - |
| AC-006 (A6) | REQ-005 | Join the runtime birth log (AC-008) against the story registry; a module is covered when a story drives its **production producer** at the production mount point | 0 uncovered modules, or a written exemption per module | **5 modules structurally invisible to the gate** — the coverage regex only matches `export function create*/render*` | N8 | Unmet | - |
| AC-007 (A7) | REQ-001, REQ-007 | Reintroduce a floating surface created outside `openSurface()` in a fixture, run the CI contract scan, then remove it and rerun. **The criterion is the pair of exit statuses in that order, read without a pipe — never the scan's existence** | scan exits non-zero with the bypass present, exits 0 without it | no such check exists, so **neither exit status has ever been observed**. The scan being wired up would satisfy a mechanism claim of exactly the shape all of 1.3.1's criteria had; this row is closed by the two observed exit codes | N2 | Unmet | - |
| AC-008 | REQ-001, REQ-007, REQ-008 | **Semantic identity.** Drive every registered affordance through its real producer and runtime branches; assert every observed surface root carries a registry id, and every registry entry births exactly one root in its declared mount and document | observed-root set **equals** registry-entry set; 0 unregistered roots; 0 unexercised entries | *census* — no registry exists on the current tree, so no runtime number exists. The static inventory it must reconcile against is 33 `positionToolbarPopover` call sites and 11 production owned menus. **Produced by:** the Stage-2 birth-observer log reconciled against the typed registry, at Stage 2, re-run at Stage 6. **Exit criterion, consumed by `001`** — not tradable for the A1/A2/A7 subset at the handoff | N9 | Unmet | - |
| AC-009 | REQ-010, REQ-005 | **Transition trace.** With a surface open, apply each transition in turn — wholesale view refresh, theme change, viewport resize, visual-viewport reduction — then re-resolve the surface by its registry id and re-read AC-001's four properties | surface id unchanged across every transition; the four properties re-equal their post-fix values after each one | *trace* — no harness performs any transition. The known failure mode is `updateCellDOM` falling through to `default: this.refresh()` (`database-view.ts:8615-8616`), after which `anchorEl.isConnected` is false and `place()` (`popover-position.ts:100`) no-ops permanently. **Produced by:** the Stage-5 anchor-lease transition harness driving each transition under an open surface, at Stage 5. **Exit criterion, consumed by `003`** — closed on the lease being proven under a wholesale refresh, not on the state machine existing | N10 | Unmet | - |
| AC-010 | REQ-005, REQ-006 | **Action outcome.** For each role, drive the affordance a user drives — click a row, press Enter, dismiss with Escape — and assert the resulting model or render change, not the presence of a node | every driven action produces its asserted model/render delta; 0 actions asserted by node presence alone | *trace* — recorded in `../architecture-findings.md` §3: **nothing drives a click, drag or commit** in any current harness. **Produced by:** the Stage-5 action-driving harness, at Stage 5, cross-checked against `009`'s driven interactions where the probe can reach the same affordance | N11 | Unmet | - |
| AC-011 | REQ-008, REQ-009 | **Resource ownership.** While a surface is open, count the dismissal, scroll-lock, keyboard and focus owners bound to it; after close, re-count listeners and surface-root nodes against the pre-open baseline | exactly 1 owner of each kind while open; listener count and node count return to the pre-open baseline after close | *census* — two containment systems already exist side by side (`src/views/overlay-stack.ts`, `src/views/interaction-scope.ts`) and no gate counts owners or leaks. **Produced by:** the Stage-2 census owner-count instrumentation, at Stage 2, re-measured after Stage 4 retires `owned-menu.ts`'s private listener pair | N12 | Unmet | - |
| AC-012 | REQ-006, REQ-011 | **Negative-control mutation.** For each of the six tuple coordinates, substitute exactly one — wrong producer, wrong runtime branch, wrong mount, wrong environment, skipped transition, aliased identity — and rerun the suite | each single substitution fails at least one **value** assertion; a failure caused only by a missing node does not count | no such control exists; the 1.3.1 gate set contained none. **Produced by:** the substitution harness built alongside the Stage-1 repairs, at Stage 1, exercised against every criterion from Stage 1.5 onward | N13 | Unmet | - |
| AC-013 | REQ-012 | **Independent instrument.** For every surface `../009-live-verification`'s probe can reach, run the repaired harness and the live probe against the same tree and record both numbers as a pair. Surfaces the probe cannot reach go on an uncorroborated list with a reason | every reachable surface has a pair and the two agree within the criterion's own threshold; **a disagreement fails this criterion**; the uncorroborated list is written with a reason per entry | *trace* — no live pair exists on this tree; `009` has not run. The divergence the pairing must survive is the recorded **29/29**. **Produced by:** the cross-check runner joining Stage-1 harness output against `009`'s recorded probe run, at Stage 1.5, re-run from the final state at Stage 7 | N15 | Unmet | - |
| AC-014 | REQ-013 | **The defect-certifying assertion, inverted and held.** Run CI against the pre-inversion `verify-placement.mjs`, then against the inverted one; then rebase the branch onto `main` once and rerun the inversion guard | CI fails on the old `wr.width > 320` predicate and passes on the inverted one; the guard fails when the old predicate returns and survives a rebase — all statuses read without a pipe | the old predicate is live and **green** today: `verify-placement.mjs:170` asserts `pass: wr.width > 320` under the name *"widthless caller still defaults wide (preset is the fix, not a global change)"*, run on every push by `.github/workflows/gates.yml:67` (`npm run storybook:placement`). It is a four-line change in a file `001`, `002`, `003` and `005` all edit later, so a rebase can silently restore it | N16 | Unmet | - |
| AC-015 | REQ-014 | **The desktop page has a cascade, and it changed a number.** Load `styles.css` on the desktop page beside the existing phone-only load, then diff every desktop measurement against its pre-load value | at least one desktop measurement differs; both the before and after values recorded. **An unchanged number fails this criterion** | `verify-placement.mjs:220` is the sole `addStyleTag` for `styles.css` and it targets the phone page; the desktop geometry checks at `:130-178` run against a document with no stylesheet, so **no desktop number has ever been cascade-dependent** and every desktop result to date is structurally irrelevant to the shipped product | N17 | Unmet | - |
| AC-016 | REQ-015 | **No harness pins what the runtime computes.** Scan every harness stylesheet and fixture for an assignment of a custom property that `src/` also assigns; the four known cases are the scan's first fixtures | 0 pinned properties; the scan flags all four on the pre-repair tree and zero after | 4 known violations, enumerated in AC-005; the general scan does not exist, so a fifth would be invisible. **Produced by:** the harness pinning scan, at Stage 1 | N14 | Unmet | - |
| AC-017 | REQ-015 | **The capture fingerprint covers the harness.** Edit each of `tools/screenshots/runtime-vars.css`, `.storybook/preview.ts` and `tools/storybook/verify-placement.mjs` in turn and run `npm run screenshots:verify` | each of the three edits reports the affected captures stale | `tools/screenshots/capture.mjs:205` fingerprints `[...scenario.sources, "styles.css"]`, and no scenario lists a harness file, so **all three edits currently trigger no recapture and no staleness failure** — a harness change that alters what every capture shows is invisible to the gate | N18 | Unmet | - |
| AC-018 | REQ-016 | **Evidence is content-addressed at the moment it is measured.** Every criterion value recorded by this phase carries the hashes of the files it was measured against; edit one of those files and rerun the reader | 100% of recorded values carry input hashes; a value whose inputs have changed is reported stale | *census* — nothing records input hashes today, so every existing green result in this repository is of unknown vintage by construction. This capability was `008`'s AC-010 and is moved here, because vintage cannot be reconstructed after the fact. **Produced by:** the input-hash recorder wrapping the measurement writer, at Stage 1, consumed by `008`'s AC-010 | N19 | Unmet | - |
| AC-019 | REQ-017 | **The borrowed-ancestor checkboxes keep their ancestors.** Remove the parent class at each of the five call sites in turn and run the guard | the guard fails on each of the five removals and passes with all five in place | 5 unguarded sites — the inputs are created classless and are styled only because the call site classes their parent one line earlier: `table-renderer.ts:514`, `:785`, `cell-renderer.ts:489`, `card-field-renderer.ts:184`, `record-detail-panel.ts:339`. `004` owns the fix and does not start until after this phase, while `004` and `005` both unblock here — so a wrapper change in either could break them with no failing test. **Produced by:** the checkbox-parent guard, at Stage 2 | N20 | Unmet | - |
| AC-020 | REQ-019 | **No phase starts work with a blank failing number.** Blank a *census*/*trace* "today" cell in any phase, attempt to move that phase from `Planned` to `In Progress`, then restore the cell and retry | the transition is refused while a cell is blank and permitted once every cell is filled with a value and a named producer | the rule is prose in every phase's `acceptance-criteria.md` — "each takes its failing value from the Stage-2 artefact before the criterion is accepted" — and **nothing enforces it**. Without the before-number a passing criterion proves a number is within threshold, not that it moved. **Produced by:** the blank-cell checker, at Stage 1 | N21 | Unmet | - |

### Proof-tuple coverage

A blank cell is a coverage gap and blocks closure, even when the criterion's number is valid.

| AC-ID | Producer | Runtime branch | Mount / host | Environment | Transition | Semantic outcome | Negative control |
|---|---|---|---|---|---|---|---|
| AC-001 | production | both mount paths | body + container | both themes | static read | computed appearance | N3 |
| AC-002 | production | both mount paths | body + container | both themes | static read | token resolves | N3 |
| AC-003 | n/a (cascade) | all media contexts | every real mount | both themes | after each lane change | one intentional winner | N7 |
| AC-004 | harness | phone | body, navbar present | safe-area inset | navbar removed | geometry moves | N1 |
| AC-005 | harness | phone | capture fixture | safe-area inset | re-capture | computed not pinned | N6 |
| AC-006 | production | all | production positions | both themes | open | module driven | N8 |
| AC-007 | bypass fixture | n/a | any | CI | scan | scan exits non-zero | N2 |
| AC-008 | production | all branches | local, body, shadow, top layer | both themes | open → close | registry equality | N9 |
| AC-009 | production | all | declared mount | both themes | refresh, theme, viewport, keyboard | identity survives | N10 |
| AC-010 | production | all | declared mount | desktop + phone | open → action → close | model/render delta | N11 |
| AC-011 | production | all | declared mount | desktop + phone | open → close → teardown | one owner, zero leaks | N12 |
| AC-012 | substituted | substituted | substituted | substituted | substituted | assertion fails | N13 |
| AC-013 | production, both instruments | all reachable | body + container, harness **and** real app | fixture vs operator's real theme and plugin set | open | two readings agree | N15 |
| AC-014 | harness | desktop | n/a (CI) | CI, pre- and post-rebase | invert → rebase → rerun | predicate inverted and held | N16 |
| AC-015 | harness | desktop | desktop page | with and without the stylesheet | load → re-measure | a number moved | N17 |
| AC-016 | harness files | n/a | n/a | scan | pre- and post-repair | 0 pinned properties | N14 |
| AC-017 | capture pipeline | n/a | n/a | each harness file edited | edit → verify | staleness reported | N18 |
| AC-018 | every recorded value | all | all | all | measure → edit input → re-read | vintage detectable | N19 |
| AC-019 | 5 call sites | table, cell, card, detail panel | production | desktop + phone | parent class removed | guard fails | N20 |
| AC-020 | phase status writer | n/a | n/a | n/a | Planned → In Progress | transition refused | N21 |

### Negative controls

`N1`-`N3` are the controls already registered in `checklist.md`. `N6`-`N13` were added by the
nine-dimension hardening and `N14`-`N21` by the adversarial-review remediation; all of them are now
registered in `checklist.md`.

| # | Control | What it proves |
|---|---|---|
| N1 | Each geometry check fails when its subject is deleted from the harness DOM | The check is connected to the subject |
| N2 | The contract scan fails on a deliberately reintroduced violation | The scan can fail |
| N3 | Reverting the token-root line reproduces the original 29/29 divergence | AC-001 and AC-002 measure the token root, not something adjacent |
| N6 | Re-pinning `--db-mobile-sheet-bottom` in `runtime-vars.css` changes a capture | The capture reads the computed value |
| N7 | Restoring one deleted duplicate block changes a computed winner at a real mount | The cascade audit measured the winner, not the source order |
| N8 | Renaming a covered module's exported factory hides it from the coverage join | Coverage is a runtime join, not a regex |
| N9 | A raw `document.body.appendChild` of a surface-shaped node in a fixture fails registry equality | The registry is an authority, not documentation |
| N10 | Forcing `refresh()` while a surface is open reproduces the dead `place()` | AC-009 observes the transition, not a static frame |
| N11 | Stubbing the model write makes the driven action's assertion fail | AC-010 asserts an outcome, not a node |
| N12 | Registering a second dismissal owner for one surface fails the owner count | AC-011 counts owners, not listeners in aggregate |
| N13 | Each of the six single-coordinate substitutions fails a value assertion | The suite is connected to all six coordinates |
| N14 | Re-pinning any one of the four named variables makes the pinning scan fail | The scan reads assignments, not a hardcoded list of four |
| N15 | Feeding the cross-check a deliberately wrong live value fails the pairing | AC-013 compares the two instruments rather than reporting whichever it read last |
| N16 | Restoring `wr.width > 320` makes the inversion guard fail | AC-014 watches the predicate, not the file's mtime |
| N17 | Removing the desktop `styles.css` load returns the changed measurement to its pre-load value | AC-015's moved number came from the cascade, not from an unrelated edit |
| N18 | Reverting the fingerprint extension makes a harness edit stop reporting stale | AC-017 measures the fingerprint set, not the capture count |
| N19 | Editing an input file after a measurement makes the reader report that value stale | AC-018 addresses content, not a timestamp |
| N20 | Removing the parent class at any one of the five call sites fails the guard | AC-019 watches all five, not the first one it finds |
| N21 | A blanked *census*/*trace* cell blocks the status transition | AC-020 is a gate, not a lint warning |

### Status values

| Value | Meaning |
|---|---|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is `Waived` or
`Superseded`, naming a decision record that exists in `decision-record.md`. A waiver naming an ADR
that is not there fails validation.

### Harness-dependence audit — 2026-08-31

The pass before this one asked of each criterion whether it was green. This one asks a different
question: **if the value came from the device instead of the harness, would the check still pass —
and could it still fail?** A criterion whose green rests on a variable the harness injects, a value
it pins, an action it stubs, host chrome it hand-builds, or Obsidian's absent `app.css` is evidence
about the harness, not about the product.

**No row in the table above was `Met` when this audit ran, so no tick was withdrawn and
`completion_pct` does not move.** What the audit records instead is which criteria are compromised
*before* anyone runs them, so the green they eventually produce is read for what it is.

The five supplies, referred to below by number: **1** `--keyboard-height`, set by the harness
(`verify-placement.mjs:819`, `:4724`, `:4753`) and by nothing in `src/`. **2** values
`runtime-vars.css` pins where the runtime computes them. **3** production actions replaced by no-op
or counting stubs. **4** host chrome the harness builds by hand. **5** Obsidian's `app.css`, absent
except for one `button` rule copied verbatim into `HOST_BARE_CONTROLS` (`verify-placement.mjs:69`).

**17 sound · 2 harness-dependent · 1 unknown.**

| AC-ID | Class | Supply | On a device |
|---|---|---|---|
| AC-001 | Sound | — | The comparison is plugin-cascade at both mounts, so a host rule reaching both cancels and the difference persists. **The recorded absolute values do not survive.** `token-census.mjs:53` loads `styles.css` alone; `.db-menu-item` is a `<button>` (`menu-row.ts:92`), so `border-radius: 0px` and `font-size: 14px` are Chromium defaults. A device reads `var(--button-radius)` and `var(--font-ui-small)` there. Re-record the numbers, keep the criterion |
| AC-002 | Sound | — | `--db-*` is never declared by the host. A custom property resolving empty resolves empty everywhere |
| AC-003 | **Unknown** | 5 | The audit resolves the computed winner among *duplicated plugin selectors*. Without `app.css` in the page, "each active cascade context" is incomplete: a host rule that beats both duplicates makes neither the winner, and the audit cannot see that. **Settled by** re-resolving the 87 selectors with a real `app.css` loaded, and recording whether any winner changes |
| AC-004 | Sound | — | Harness-measuring by construction: the criterion exists to test whether the harness's navbar is load-bearing. Note the threshold is calibrated to the hand-built 72px navbar (`verify-placement.mjs:409`); a device navbar is a different height and `> 1.35px` is not a device number |
| AC-005 | Sound | — | The subject is four harness files. Recorded state is stale in the phase's favour: all four are now removed from `runtime-vars.css` (see its closing comment). Left as recorded — this pass does not raise a completion |
| AC-006 | Sound | — | A registry join over `src/`; no host or harness input |
| AC-007 | Sound | — | Two exit statuses from a scan. The subject is the scan |
| AC-008 | Sound | — | Observed-root set against registry-entry set. Both are the plugin's |
| AC-009 | Sound | — | Re-reads AC-001's four properties for *invariance across a transition*. A differential on one document, so a host contribution cancels |
| AC-010 | **Harness-dependent** | 3 | "Drive the affordance a user drives and assert the resulting model change." In the harness the affordances are `openRow: () => undefined`, `editCell: () => {}` and their siblings (`verify-placement.mjs:2329`, `:2434-2437`, `:3398-3401`, `:4268`, `:4523`). A model delta asserted against a no-op is the `editFileName` counting-stub failure with a different name. **On a device this cannot fail for the right reason: there is no model to fail against.** The criterion is only admissible once the drive runs through real handlers |
| AC-011 | Sound | — | Listener and node counts before, during and after. Plugin-owned throughout |
| AC-012 | Sound | — | A substitution suite over its own coordinates |
| AC-013 | Sound | — | **This is the criterion that answers the question this audit asks.** Pairing every harness number with `009`'s live probe is the only row in the program that can catch a supply the inventory has not yet named. It should be treated as the phase's gate, not as one row among twenty |
| AC-014 | Sound | — | The subject is `verify-placement.mjs` itself |
| AC-015 | Sound | — | The subject is which page loads the stylesheet. Recorded state is stale in the phase's favour — `styles.css` now loads on the desktop page (`verify-placement.mjs:246`) — and is left as recorded |
| AC-016 | **Harness-dependent** | 2 | **The checker implements the opposite of the criterion.** AC-016 says: flag a harness file that assigns a custom property `src/` also assigns. `scan-pinned-values.mjs:128` reads `if (runtime.has(prop) \|\| sheet.declared.has(prop)) continue;` — it **skips** exactly that population and flags the complement, properties nothing assigns. Three variables still pinned in `runtime-vars.css` are assigned by `src/` through `setProperty`: `--db-table-header-top` (2 sites), `--db-board-column-width` (2), `--db-gallery-card-width` (3). All three are skipped. A green scan is evidence for a rule the criterion did not state, and the pin the criterion was written to catch survives it |
| AC-017 | Sound | — | The subject is the capture fingerprint. Recorded state is stale in the phase's favour — the three harness files now appear in the fingerprint loop at `verify-placement.mjs:3171` — and is left as recorded |
| AC-018 | Sound | — | Content-addressing is a property of the recorder |
| AC-019 | Sound | — | A source guard over five call sites, not a computed read |
| AC-020 | Sound | — | A checker over this table's own cells |

**The one that matters most.** AC-016 is not a weak criterion; it is a criterion with a checker that
cannot fail for its stated reason. That is the shape this whole audit exists to find, and finding it
in the phase that owns harness honesty is the useful result. Either the criterion adopts the scan's
rule — flag a pin for a property *nothing* assigns — or the scan gains a second pass for the
population the criterion names. Both rules are worth having; only one is implemented, and the
criterion names the other.

**A latent sixth pin, recorded so it is not rediscovered.** `--db-mobile-bar-height` is pinned at
`runtime-vars.css:55` and assigned nowhere in `src/`; its only consumer is `styles.css:18251`, which
reads it with a `48px` fallback — the same value. **Nothing is wrong today**, because the pin and the
fallback agree. It is the `--db-header-height` shape with a value that happens to match, and it goes
silently wrong the day either side changes.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Work has not started. All twenty criteria are `Unmet`. AC-001 to AC-007 each carry the failing value
measured on the current tree. AC-008 to AC-012 are the five dimensions added because a stale or
aliased surface passes the original four conditions; they are marked *census* or *trace* because the
registry, the transition harness and the owner count do not exist yet, and each now names the
artefact and stage that will produce its number.

AC-013 to AC-020 answer an independent adversarial review of this program. AC-013 is the structural
one: **this phase repairs the harness it then measures through, and that circularity is the shape of
the failure the whole program exists to remove.** The running app, reached through
`../009-live-verification`, is the one instrument this phase cannot influence, so a harness number
and a live number that disagree is a blocking failure rather than a judgement call. AC-014 is the
most urgent: a CI check is green today for asserting the defect is correct, and it runs on every
push. AC-015 to AC-017 close the harness blindnesses the earlier revision under-scoped — a desktop
page with no cascade at all, four pinned runtime values rather than one, and a capture fingerprint
that ignores the harness. AC-018 to AC-020 are ownership moves: input hashes come **into** this phase
from `008` because vintage cannot be reconstructed later, the five borrowed-ancestor checkboxes get a
guard for the window between this phase and `004`, and the blank-cell rule stops being prose.

This packet does not close on gate passage: it closes when every number above has moved from its
recorded failing value, every proof-tuple cell is filled, negative controls N1-N3 and N6-N21 hold,
every harness number is paired with its live counterpart or listed as uncorroborated with a reason,
the two named exit criteria are recorded for `001` and `003`, and the operator has looked at the
touched surfaces on a device.
<!-- /ANCHOR:closure -->
