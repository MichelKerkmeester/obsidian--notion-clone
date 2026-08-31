---
title: "Acceptance Criteria: Production Surface Integration and Release Observability"
description: "The criteria this packet must satisfy before it may be closed, each carrying its exact measurement, its threshold, the command and stage that produces its number, and the negative control that proves the check can fail."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "008 integration criteria"
  - "handoff replay criteria"
  - "release decision matrix"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/008-integration-and-release-observability"
    last_updated_at: "2026-08-29T18:10:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Harness audit: AC-010 stands, but freshness certifies vintage and not validity"
    next_safe_action: "Add a replay claim asserting no result was measured against a pinned variable"
    blockers:
      - "000 must land its registry, cascade audit and input-hash recorder first"
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-008"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Production Surface Integration and Release Observability

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.
>
> This phase is the program's release gate, so its first criterion is about itself: **a replay that
> cannot fail is more expensive than no replay, because it carries more authority.** No row below may
> be recorded until AC-006's six controls have each been demonstrated failing.
>
> **This packet ships in two deliverables** (`spec.md` §3). Deliverable **A** — the handoff replay,
> the CSS lane ledger and the capture-review sign-off — closes before `001` starts and gates every
> subsequent lane release. Deliverable **B** — the full grid, the parity traces and the retirements —
> closes the program. The `Deliv` column says which, and A's rows may not be left open while B runs.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 008-integration-and-release-observability
**Level:** 3
**Status:** Draft
**Date:** 2026-08-29
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

### The nine dimensions

The four original conditions — production mount, thresholded number or hit test, a current-tree
failure recorded first, and a harness that can distinguish — are necessary and not sufficient. This
phase exists because of a fifth insufficiency the others share: **they are all local in time.** A
phase's evidence describes the tree that existed when it closed, and `styles.css` is one serialized
lane that four more phases will edit afterwards.

Every criterion below therefore carries the five added dimensions — semantic identity, transition
trace, action outcome, resource ownership, negative-control mutation — **and a sixth this phase
introduces: temporal validity.** A result is admissible only if it was produced after the last edit
to the lane it depends on. The proof tuple is `producer x runtime branch x mount/host x environment
x transition x semantic outcome x negative control`, and this phase is the only place the whole tuple
is driven at once.

### An outcome, not an existence

A criterion that closes the moment a mechanism exists is not a criterion, it is a build step
(`../adversarial-review.md` F8). Three rows below were of that shape and have been rewritten:

- **AC-008** used to close on "one recorded review per phase". A recorded review is a filing action.
  It now closes on a rehearsal in which a **red** review actually blocked a release with the pipeline
  green — the behaviour the criterion is for.
- **AC-009** used to close on "100% of captures attributable". Attribution is bookkeeping. It now
  closes on a demonstrated **rejection**: a capture whose recorded stylesheet hash differs from the
  current tree is refused by the gate.
- **AC-010** used to close on comparing hashes. It now closes on a demonstrated rejection of a
  deliberately staled result, and it **consumes `000`'s recorder** rather than inventing a mechanism
  (F17).

The new rows AC-011, AC-012 and AC-013 are written outcome-first from the start: each closes on a
seeded violation being refused, never on its mechanism existing.

### Where every number comes from

`../adversarial-review.md` F16 is correct that a blank failing-number cell is an invitation. Every
row below therefore carries a **Produced by** cell naming the command that yields the number and the
stage at which it is yielded. `000` is building a checker that blocks a phase moving to `In Progress`
while any *census* or *trace* cell is blank; **this packet is subject to it**, so no row may be worked
before its named producer has run and written the value into the `Measured today` cell.

Two rows are exempt because their producer has already run and their number is on the current tree:
AC-003 (87 / 124, from `000`'s predecessor audit) and AC-006 (no controls exist, from reading
`.github/workflows/gates.yml`). AC-008 carries a historical counterexample rather than a census.

### Criteria table

| AC-ID | REQ | Deliv | Measurement — producer → mount → transition → observation | Threshold | Measured today | Produced by (command · stage) | NC | Status | Waiver |
|---|---|---|---|---|---|---|---|---|---|
| AC-001 (G1) | REQ-001 | B | Drive every registry entry through its real producer and every runtime branch, at each declared mount, in both themes, on desktop, phone and the intermediate touch band, across every §4A transition, asserting a semantic outcome. Count cells that were never driven | 0 matrix holes; every cell either green or explicitly dispositioned | *census* — no replay runner exists on the current tree. The static inventory it must cover is 33 `positionToolbarPopover` call sites, 11 production owned menus, 12 checkbox families and the content-row and record-target triggers | `npm run integration:replay -- --holes-only` · Phase 1, first run against `000`'s landed registry. The cell records the hole count of that first run, before any cell is fixed | N1 | Unmet | - |
| AC-002 (G2) | REQ-002 | A, B | Compare the set of observed surface roots with the set of registry entries, in both directions; count terminal close and owner-teardown events per handle | observed set **equals** registry set; 0 unregistered roots; 0 unexercised entries; exactly 1 terminal event per handle | *census* — no registry exists until `000` lands. Today the two dismissal systems already disagree about what a surface is: `overlayStack` reaches 25 popovers through `popover-auto-close.ts:37`, while `createOwnedMenu`'s 10 menus dismiss through their own listeners (`owned-menu.ts:138-139`) | `npm run integration:registry --json` · Phase 2, first run the day `000`'s registry lands. The cell records that run's unregistered-root and unexercised-entry counts | N1 | Unmet | - |
| AC-003 (G3) | REQ-003 | A, B | After each phase releases the `styles.css` lane, and again on the final file, resolve the computed winner for every duplicated selector at real production mounts, per theme and per media context; diff against `000`'s recorded audit | 0 duplicates with an **unknown** context; 0 computed winners changed without a recorded disposition | **87 selectors, 124 conflicts** on the current tree. Examples measured: `.db-toolbar-right` `justify-content: flex-end → flex-start`; `.note-database-container` `padding: <tokens> → 0 12px 24px`; `.db-active-view-controls-scroll` `mask-image: <gradient> → none` | Already produced — `000`'s cascade audit on the pre-change tree. Re-produced by `npm run integration:cascade` · Phase 3, at every lane handoff and on the final file | N8 | Unmet | - |
| AC-004 (G4) | REQ-004 | B | For every role, drive nested open, outside / Escape / back dismissal, wholesale refresh, anchor replacement, viewport and keyboard resize, and owner teardown; after each, re-resolve the surface and re-count owners, listeners and nodes | every transition carries an assertion; 0 stale anchors; exactly 1 owner of each kind throughout; listener and node counts return to the pre-open baseline | *trace* — no harness performs any transition. The known mechanism is `updateCellDOM` falling through to `default: this.refresh()` (`database-view.ts:8615-8616`), after which `anchorEl.isConnected` is false and `place()` (`popover-position.ts:100`) no-ops permanently | `npm run integration:replay -- --transitions` · Phase 5, on the pre-fix tree first. The cell records the stale-anchor and leaked-listener counts of that baseline run — the failing numbers this criterion must move from | N3 | Unmet | - |
| AC-005 (G5) | REQ-005 | B | For every portalled, shadow and top-layer sample, read the host's computed custom properties and `documentElement` / `body` class lists before open and while open; compare the surface's own token snapshot against its container-resolved reference | host values **byte-identical** before and during open; snapshot equals the container-resolved reference on every asserted token | *trace* — never asserted. The measured baseline this must move from is **29/29 probed overlay classes compute differently between the two mount points, and 25/29 have no tokens at all on body** | `npm run integration:replay -- --isolation` · Phase 5, on the pre-fix tree first. The cell records the leaked-property count of that baseline run | N7 | Unmet | - |
| AC-006 (G6) | REQ-006 | A, B | Run each of the six controls in turn: raw `document.body` mount, fixture wrapper substituted for the production mount, stale anchor retained across a refresh, `.mobile-navbar` removed, layout viewport substituted for `visualViewport`, and a capture-only placement claim with no driven action | all 6 make the run exit non-zero, each recorded separately | no such controls exist; the 1.3.1 gate set contained none, which is why it passed | Already produced — read from `.github/workflows/gates.yml` (13 steps, none a negative control). Re-produced by `npm run integration:controls` · Phase 1, before any real result is recorded | N1-N6 | Unmet | - |
| AC-007 (G7) | REQ-007 | B | Per migrated family, trace the old and new paths side by side across placement, dismissal, focus, tokens, refresh and cleanup; then re-run the full prior matrix. Then attempt a removal whose trace disagrees and confirm the gate refuses it | all six dimensions agree, per family, before removal; the prior matrix re-runs green after each removal; **and a disagreeing trace is demonstrated to block a removal** | *census* — nothing has been retired yet. The families to trace are the 3 no-option positioner paths and the 15 compact sites (`000`), the 15 bespoke callers and 10 owned-menu callers (`001`), and the sheet-capable surfaces (`003`) | `npm run integration:parity --json` · Phase 4, one run per family as each family's migration lands. The cell records the per-family agreement count of the first run | N9 | Unmet | - |
| AC-008 (G8) | REQ-008 | B | Rehearse the gate: with the pipeline green, submit a **red** operator device review and attempt a release. Then record a real review per phase, with its scope named before the review rather than after | the rehearsed red review **blocks** the release, evidenced by a non-zero gate exit; and one recorded review per phase, each naming the surfaces and the device; 0 releases proposed over a red review | recorded on the current tree as a counterexample: **1.3.1 passed tsc, build, 410 tests, 196 captures, a Storybook catalogue and 13 geometry checks, and the operator installed it and saw essentially no change** | Already produced — the 1.3.1 release record. The blocking behaviour is produced by the rehearsal in `npm run integration:release-decision -- --rehearse-red` · Phase 5 | N10 | Unmet | - |
| AC-009 | REQ-009 | A | Deliberately stale one capture — change `styles.css` by one byte without recapturing — and run the attribution gate. Then confirm every capture in the set is attributable to a stylesheet hash and a producer set | the staled capture is **rejected**, evidenced by a non-zero exit naming it; and 100% of the remaining captures attributable | *trace* — the capture pipeline **already records per-source hashes**: `screenshots/manifest.json` stores `sourceHashes` per scenario including `styles.css`, plus a top-level `generatedFrom.stylesheet` (`styles.css@9732449e4746` as read today), written by `tools/screenshots/capture.mjs:204,226`. What is missing is (a) the producer set beyond the **hand-maintained** `sources` list, (b) any fingerprint of the harness files `runtime-vars.css`, `.storybook/preview.ts` and `verify-placement.mjs`, and (c) any look at the image itself — `verify.mjs`'s only PNG operation is `existsSync` | `npm run screenshots:verify --json` · Phase 1 for the baseline (which fields exist today), and the rejection demonstration at Phase 5 after the recapture | N11 | Unmet | - |
| AC-010 | REQ-009, REQ-006 | A | **Temporal validity, consuming `000`'s recorder.** Every replay result carries the input hashes `000`'s input-hash recorder produced for it. Take a green result, edit one input in the lane it depends on, and re-check admissibility | the staled result is **rejected**, evidenced by a non-zero exit naming the differing input; 0 results carried forward across a lane edit; 0 gates satisfied by a stale artefact | *trace* — no replay result exists yet, so none has a vintage. The recorder itself is **not** new construction: the same hash convention is already in this repository at `tools/screenshots/verify.mjs:45-48` (sha256 truncated to 12), and `000` generalises it once for the whole program. This phase reads it and builds nothing | `npm run replay` then `node tools/live/evidence.mjs --check-all` | N11 | **Met** | Closed by wiring, not by argument. The replay had no vintage at all: it imported nothing from the recorder and wrote no artefact, so its eight results could not be dated and the freshness lane could not see them. It now stamps `tools/live/replay.json` with the fingerprints of the five files that decide its answer -- the three stylesheets, the fixtures, and its own claim list. **N11 observed:** appending one line to `styles.css` takes the artefact to `STALE tools/live/replay.json` and the freshness check to exit 1; restoring it byte-identical returns exit 0 across 10 artefacts, up from 9. It stamps on a failing run too, because writing only the green one would leave the last passing record standing while the lane was red |
| AC-011 (G9) | REQ-010 | A | **The handoff replay catches a reversal.** With a phase already closed, reintroduce a known cascade reversal into its surface — restoring one duplicate block `000`'s audit classified dead is the cheapest — then run the handoff replay for the next lane release | the replay **fails**, exits non-zero, and names **only** that phase's cells; the same run passes with the reversal removed. Runtime recorded and inside the handoff budget | *census* — no handoff replay exists. The gap it closes is measured: **87 selectors and 124 conflicts** already live in this file, so a reversal is the documented norm rather than a hypothetical | `npm run integration:handoff -- --seed-reversal <selector>` · Phase 3, on the first handoff after `000` closes. The cell records which cells reddened and which did not, plus the wall-clock runtime | N12 | Unmet | - |
| AC-012 (G10) | REQ-011 | A | **The lane refuses a non-holder.** With the ledger recording one phase as holder, modify `styles.css` as a different phase and run `npm run lane:check`. Separately, attempt `lane:acquire` while the lane is held | the modification is **refused** with a non-zero exit naming both phases and the drifted hash; the second acquire is **refused**; a `verify` run on an unmodified tree exits 0 | *census* — no ledger and no check exist. The rule is prose at `../spec.md` §4, and `004` and `005` both unblock after `000`, so two concurrent edits to a 19,261-line file (`wc -l styles.css`) are permitted today | `npm run lane:check` · Phase 2, immediately after the ledger lands and before `000` releases the lane. The cell records the exit code and message of the seeded non-holder edit | N13 | Unmet | - |
| AC-013 (G11) | REQ-012 | A | **The capture review gates the lane.** Recapture after a real stylesheet change, author `capture-review.md`, then delete one row and attempt `npm run lane:release` | the release is **refused**, the lane stays held, and the message names the unreviewed PNG; restoring the row lets the release succeed | *census* — no sign-off artefact exists anywhere in the program. `screenshots:verify` passes on file existence and recorded source hashes; it never opens an image, so a capture showing the wrong thing passes today exactly as it did in 1.3.1 | `npm run lane:capture-review` · Phase 2, on the first lane release after the checker lands. The cell records the changed-PNG count of that release and the exit code of the seeded incomplete review | N14 | Unmet | - |

### Harness-dependency audit of the one `Met` row, 2026-08-31

Twelve of the thirteen rows are `Unmet`, so there is little here to re-audit. **AC-010 is the
exception, and it is worth the space, because an observability criterion satisfied by a
harness-supplied value would be the sharpest instance of the failure this audit exists to find.**

**AC-010 stands. It is not satisfied by a harness-supplied value.** Its mechanism is file hashing:
`replay.mjs` stamps `tools/live/replay.json` with sha256 prefixes of `styles.css`,
`tools/screenshots/theme.css`, `tools/screenshots/runtime-vars.css`, `tools/screenshots/scenarios.mjs`
and `tools/live/replay.mjs`. Hashes come from the filesystem, not from the DOM, so no CSS variable,
stubbed action, hand-built host node or absent stylesheet can reach the assertion. N11 was observed
in both directions — one appended line takes the artefact to `STALE` and the freshness check to exit
1; restoring it byte-identical returns exit 0. The row keeps its `Met`.

**What it must not be read as proving.** A freshness gate certifies **vintage, not validity**.
`tools/screenshots/runtime-vars.css` is one of the five files AC-010 fingerprints, and it is also the
file that pins `--db-layer-sticky` to 25 where production resolves 40, `--db-status-bg` to a hover
background where production is transparent, `--db-number-color` to `text-normal` where production is
`text-accent`, `--db-calendar-row-height` to 44px where production is `auto`, and
`--db-week-grid-height` to a viewport expression where production is 1152px. A replay result computed
against those pins is a result about the harness. AC-010 confirms it is a **current** result about the
harness, and every downstream gate then treats it as admissible.

That is the precise shape of this program's two operator-reported regressions: the number was fresh,
the gate was green, and the value under test was one the harness had supplied. AC-010 is not the
cause — it is doing its own job correctly — but it is the mechanism that makes a harness-derived
result carry authority, so its scope belongs on the row rather than in a reader's head.

**The claim to add**, and it is cheap because the replay already reads every input it needs: for each
claim in `CLAIMS`, record whether the value it asserts resolves through any custom property that
`runtime-vars.css` declares, and fail the run when a claim asserts an absolute number that does.
That converts "this result is current" into "this result is current **and** was not measured against
a pin", which is the property every consumer of `replay.json` already assumes it has.

**Why the other twelve rows need no re-audit.** Each is `Unmet` with its producer named and unrun, so
none carries a green that could be resting on anything. The exposure this audit looks for is created
by *closing* a criterion, and this phase has closed one.

**A finding for `000`, from the child phases.** Auditing `010`, `011`, `012` and `013` surfaced two
supplies the harness inventory does not list, and both belong in it:
1. **Surfaces built by the check rather than by their production opener.** `verify-placement.mjs:575`
   mounts a `div.db-record-detail-panel` by hand, drives it through the production placement path,
   and thereby inherits none of `openRecordDetailPanel`'s lifecycle — notably not
   `onResize = () => close()`. Production placement plus fixture lifecycle reads as production.
2. **`var(host-token, fallback)` readings.** Any computed pixel that resolves through an Obsidian
   token — `--size-4-2`, `--size-4-4`, `--icon-s` — takes the fallback in every harness run, because
   `app.css` is absent. Relative comparisons survive this; quoted absolutes are fallback values.

---

### Proof-tuple coverage

A blank cell is a coverage gap and blocks release, even when the criterion's number is valid. This
phase's matrix **is** the coverage table for the whole program; a hole here is a hole in the release.

| AC-ID | Producer | Runtime branch | Mount / host | Environment | Transition | Semantic outcome | Negative control |
|---|---|---|---|---|---|---|---|
| AC-001 | every registry entry | every branch | local, body, shadow, top layer | both themes, desktop, phone, touch band | all §4A | driven action result | N1 |
| AC-002 | every registry entry | every branch | declared mount + document | both themes | open → close | set equality | N1 |
| AC-003 | n/a (cascade) | every media context | every real mount | both themes | after every lane holder | one intentional winner | N8 |
| AC-004 | every registry entry | every branch | declared mount | desktop + phone | all §4A | identity and ownership survive | N3 |
| AC-005 | portal, shadow, top layer | every branch | body, shadow root, top layer | both themes | open → theme → close | host untouched, snapshot correct | N7 |
| AC-006 | substituted | substituted | substituted | substituted | substituted | run fails | N1-N6 |
| AC-007 | old path + new path | every branch in family | declared mount | both themes, desktop + phone | all §4A | six dimensions agree, and a disagreement blocks | N9 |
| AC-008 | production, on device | real device branch | real host | real theme, real chrome | real use | a red review blocks release | N10 |
| AC-009 | capture pipeline | n/a | n/a | every captured profile | recapture | a staled capture is rejected | N11 |
| AC-010 | every recorded result | n/a | n/a | n/a | lane edit | a staled result is rejected | N11 |
| AC-011 | every closed phase's recorded criteria | every branch those criteria named | the mounts those criteria named | the environments those criteria named | lane handoff | a seeded reversal reddens only its own cells | N12 |
| AC-012 | the lane ledger | acquire / verify / release | `styles.css` working tree | any | lane acquire and release | a non-holder edit is refused | N13 |
| AC-013 | the capture pipeline | n/a | PNG bytes | every captured profile | lane release | an incomplete sign-off refuses the release | N14 |

### Negative controls

All fourteen are new; this phase has no prior register. `N1`-`N6` are AC-006's six and are the
precondition for every other row. `N12`-`N14` are the controls for Deliverable A's three new
criteria, and they are the precondition for trusting the handoff gate at all.

| # | Control | What it proves |
|---|---|---|
| N1 | A raw `document.body` mount in a fixture fails registry equality | The registry is an authority, not documentation |
| N2 | A fixture wrapper standing in for the production mount fails the run | The replay measures production, not a projection |
| N3 | A stale anchor retained across a refresh fails the transition assertion | Transitions are observed, not assumed |
| N4 | Removing `.mobile-navbar` moves an asserted phone number by more than 1.35px | The phone rows are connected to the host chrome |
| N5 | Substituting the layout viewport for `visualViewport` fails the keyboard-clearance assertion | The right viewport API is being read |
| N6 | A capture-only placement claim, with no driven action, fails the outcome assertion | A frame is not an outcome |
| N7 | Writing one plugin variable to `documentElement` fails the host-isolation read | AC-005 asserts isolation |
| N8 | Restoring one deleted duplicate block changes a computed winner at a real mount | AC-003 measures winners, not source order |
| N9 | Removing a compatibility path whose parity trace disagrees is refused by the gate | AC-007 gates removal on the trace |
| N10 | A red operator review blocks release in a rehearsal, with the pipeline green | AC-008 is a gate, not a formality |
| N11 | A result whose recorded input hashes differ from the current tree is rejected as stale, demonstrated by editing one input byte and re-running admissibility | AC-009 and AC-010 measure vintage, and the rejection is observed rather than assumed |
| N12 | A cascade reversal seeded into an already-closed phase's surface reddens that phase's cells in the handoff replay **and nothing else**; removing it turns them green again | AC-011's replay can distinguish. A run that reddens everything is as useless as one that reddens nothing |
| N13 | A `styles.css` edit attributed to a phase that does not hold the lane exits non-zero, and an unmodified tree exits 0 | AC-012 enforces ownership rather than reporting it, and does not fire on branches that never touch the file |
| N14 | Deleting one row from an otherwise complete `capture-review.md` refuses the lane release; restoring it allows the release | AC-013 checks coverage of the changed set, not the presence of a file |

### Status values

| Value | Meaning |
|---|---|
| `Met` | Verified. The evidence named was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is `Waived` or
`Superseded`, naming a decision record that exists in `decision-record.md`. A waiver naming an ADR
that is not there fails validation.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

**Deliverable A's runner is built, green and gated; Deliverable B is unbuilt.** `npm run replay`
re-asserts 8 landed results across 5 phases and exits 0 in 4,267 ms. Every row is nonetheless still
`Unmet`, because every threshold includes a negative control and **not one of N1-N14 has ever been
observed**. See `implementation-summary.md` for the four rows whose green half is recorded.
**This packet closes twice.** Deliverable A closes when
AC-002, AC-009, AC-010, AC-011, AC-012 and AC-013 are `Met` — before `001` starts, and before any
phase after `000` releases the CSS lane. Deliverable B closes when the remaining rows are `Met`, and
it closes the program.

AC-001, AC-002, AC-007, AC-011, AC-012 and AC-013 are marked *census* because the registry, the
ledger and the sign-off they reconcile against do not exist yet; AC-004, AC-005, AC-009 and AC-010
are marked *trace* because no harness performs a transition, asserts host isolation, or checks an
artefact's vintage. AC-003, AC-006 and AC-008 carry values read from the current tree. **Every one of
those cells names the command and the stage that will fill it**, and none may be worked before its
named producer has run — the rule `000`'s blank-cell checker enforces.

No number is invented for any of them. One number previously written here was wrong and has been
corrected: AC-009 said the capture pipeline "records no hash", and it does — `screenshots/manifest.json`
carries per-scenario `sourceHashes` including `styles.css`, written at `tools/screenshots/capture.mjs:204,226`.
The real gaps are the hand-maintained source list, the unfingerprinted harness files, and the fact
that nothing ever opens the image.

This phase closes the program, and it does not close on gate passage — that is exactly what 1.3.1
did. It closes when the six negative controls have been demonstrated failing, the matrix has no
holes, the registry is equal in both directions, no cascade context is unknown on the final file,
every retired path has an agreeing parity trace, **a red operator review has been shown to actually
block a release**, and **the operator has confirmed on device that each original defect is resolved.**
<!-- /ANCHOR:closure -->
