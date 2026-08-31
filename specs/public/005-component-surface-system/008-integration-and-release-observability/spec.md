---
title: "Feature Specification: Production Surface Integration and Release Observability"
description: "Two deliverables: a minimal handoff replay that lands early and runs at every CSS lane handoff, and the full release gate that runs last — plus the lane-ownership and capture-review sign-off mechanisms the program was relying on convention for."
trigger_phrases:
  - "integration and release observability"
  - "cross-phase replay"
  - "handoff replay"
  - "css lane ownership"
  - "capture review sign-off"
  - "release decision matrix"
  - "compatibility retirement"
  - "008 integration"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/008-integration-and-release-observability"
    last_updated_at: "2026-08-30T18:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Deliverable A replay re-verified green; 0 of 13 criteria Met"
    next_safe_action: "Seed a cascade reversal and observe N12 redden only its own phase"
    blockers:
      - "Every negative control N1-N14 is unrun; each needs a seeded input mutation"
      - "Deliverable B has no mechanism: no tools/integration/ and no integration:* command"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-008"
      parent_session_id: null
    completion_pct: 40
    open_questions:
      - "Does the replay stay trustworthy while its claim list is hand-written"
    answered_questions: []
---
# Feature Specification: Production Surface Integration and Release Observability

> Phase chain: parent [`../spec.md`](../spec.md), predecessor every other child phase. Root causes
> and measurements live in [`../architecture-findings.md`](../architecture-findings.md); the review
> that restructured this phase is [`../adversarial-review.md`](../adversarial-review.md); the contract
> this phase replays is [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md);
> the real-app evidence path is [`../009-live-verification/spec.md`](../009-live-verification/spec.md).

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

**No child phase can know that a later stylesheet edit preserved its result.** `styles.css` is one
serialized lane, 19,261 lines (`wc -l styles.css`), fingerprinted by all 196 captures, and every
phase in this program holds it in turn. A phase that measures its own surfaces green, releases the
lane, and then watches three more phases edit the same file has proven something about a tree that no
longer exists.

**This phase ships in two parts, and the first part is early.** As originally written, 008's replay
was the program's only cross-phase gate and it did not exist until the very end — so phase `000`
could close, phase `002` could reverse its token root four weeks later, and nothing would fire until
release (`../adversarial-review.md` F7). The replay is therefore split: **Deliverable A**, a minimal
handoff replay that lands before `001` starts and runs at **every** lane handoff, re-asserting every
previously-closed phase's criteria against the current tree; and **Deliverable B**, the full release
gate that runs last and owns every compatibility retirement.

This phase also owns the two mechanisms the program was leaving to convention: **who holds the CSS
lane**, recorded in a file and enforced by a check rather than by prose (F6), and **the capture-review
sign-off**, because `screenshots:verify` never opens an image and the human review that compensates
had no artefact, no reviewer field and no gate (F9).

**Key Decisions**: the handoff replay lands early and is cheap by design; the full grid stays at
release; the CSS lane is owned by a recorded holder and enforced by `npm run lane:check`; a lane
release without a complete `capture-review.md` fails; a red operator review blocks release regardless
of how green the pipeline is.

**Critical Dependencies**: `000`'s registry, handle, anchor lease, cascade audit and **input-hash
recorder** (which `000` now builds, so this phase consumes it rather than inventing it — F17). Every
sibling phase's local evidence. `009`'s live-verification transport for the device half.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 008-integration-and-release-observability |
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | **Partial — Deliverable A only.** In the tree: `tools/live/replay.mjs`, the `replay` package script, and a `replay` gate lane at `tools/gate.mjs:55`. The release decision and the compatibility retirements stay last and are untouched. `tasks.md` carries 0 of 37 ticked. **Completion figure: UNKNOWN** — this phase has no `goal.md` criteria checklist, so the rule in `../roadmap.md` §3.2 has nothing to count and the `completion_pct` below is an unrevised phase-cut value. Writing that checklist settles it. |
| **Created** | 2026-08-29 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `000` for Deliverable A; every other child phase for Deliverable B |
| **Successor** | None — Deliverable B is the program's release gate |
| **Blocks** | Deliverable A blocks every lane release after `000`'s. Deliverable B blocks program release and every compatibility retirement |
| **CSS lane** | Holds `styles.css` last, for the deletions the cascade audit proved dead. Owns the lane ledger from Deliverable A onward without holding the lane itself |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Release 1.3.1 passed every gate and changed nothing. The program's answer is to measure at the
production mount point with thresholds and negative controls — but that answer is still local. Each
phase measures its own surfaces, on its own tree, at its own moment.

Four facts make local evidence insufficient here.

**The stylesheet is a shared serialized lane.** 87 selectors are declared more than once and 124
property values are overridden by a later block. A value that computed correctly for `004` in week
one can be reversed by a `002` edit in week four with no compiler warning, no failing unit test and
no changed screenshot in `004`'s own set.

**A gate that arrives at the end is not a gate on the weeks before it.** This was the original
design's central hole. Every phase between `000` and `006` was permitted to close independently, and
the only mechanism that could detect a silent reversal was a runner that had not been built yet. The
cost of discovering a `000`-reversal at release rather than at the `000` → `004` handoff is the whole
program.

**Phase evidence is mount-local and transition-free.** `003` is the sharpest case: portal ancestry,
host navbar geometry, visual viewport, keyboard and scroll ownership and real device chrome are not
represented by its own fixture. `001` and `002` can each pass at their own mount without proving that
a later role or rhythm rule preserved the result. `004` and `005` are the most vulnerable of all,
because selector and value precedence can change underneath a locally passing harness.

**Compatibility paths accumulate.** `000` deliberately deletes nothing; `001` migrates families
behind an adapter. Somebody has to prove old and new agree before the old one goes, and no phase that
owns the new path should be the one to certify the removal of the old.

### Purpose

Own the cross-phase replay and the release decision, so that "every gate is green" becomes a claim
about the tree being shipped rather than about a tree that existed when each phase closed — and make
that claim **continuously**, at each handoff, rather than once at the end.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The two deliverables

This phase is two pieces of work with different schedules, different exit criteria and different
blast radii. Conflating them is what produced F7.

| | **Deliverable A — the handoff replay** | **Deliverable B — the release gate** |
|---|---|---|
| **When** | Built as soon as `000`'s registry lands (`000` Stage 6); operational **before `001` starts**, and its first run gates the first lane handoff out of `000` | Built and run last, after `006` closes |
| **What** | A minimal, fast replay that re-asserts **every previously-closed phase's criteria against the current tree**, plus the CSS lane ledger and the capture-review checker | The full §4A grid, parity traces, compatibility retirements, dead-block deletions, final captures, operator device review |
| **Runs** | At **every** CSS lane handoff, and on every push in its per-push subset | Per release candidate |
| **Exit criterion** | A **deliberately reintroduced cascade reversal** in an already-closed phase's surface **fails** the handoff replay — demonstrated, with the negative control that proves the run can distinguish (AC-011) | Every §4A coordinate driven, six negative controls failing, registry equality both ways, zero unknown cascade contexts on the final file, one agreeing parity trace per retirement, operator device confirmation (AC-001 … AC-008) |
| **Blocks** | Every lane release by `004`, `005`, `001`, `002`, `003`, `006` and by this phase itself. A phase may not release the lane without a green handoff replay | Program release, and every compatibility retirement |
| **Does not block** | `000`, which runs before it exists — `000`'s own honesty is carried by its negative controls and by the `009` live cross-check | Anything before the release candidate |
| **Cost ceiling** | Must run inside a lane handoff without anyone deciding to skip it. Minimal by construction: registry equality, the closed phases' recorded criteria, and the cascade winners — not the full grid | No ceiling; it runs once per candidate |

**Why A is minimal.** A handoff gate that takes an hour is a handoff gate that gets skipped, and this
repository already has that scar (`.github/workflows/gates.yml` exists precisely because "checks run
by hand when someone remembers" stopped running). Deliverable A re-runs recorded criteria and
computed winners. It does not drive the full producer × branch × mount × environment × transition
grid; that is Deliverable B's job, once.

**The residual gap, stated rather than hidden.** Deliverable A cannot exist before `000`'s registry
does, so `000`'s own lane hold is not covered by it. That window is guarded by `000`'s own negative
controls and by the `009` live cross-check the parent added to the `000` → `004` handoff. Deliverable
A's first run is the `000` → next-phase handoff, and from that point every handoff is covered.

### In Scope — Deliverable A

- **`tools/integration/handoff-replay.mjs`**: re-asserts every closed phase's recorded criteria
  against the current tree, plus registry equality and the cascade winners, and refuses any result
  whose recorded input hashes do not match the tree (REQ-009, AC-010, AC-011).
- **The CSS lane ledger and its check** (§4B): a recorded holder, an exclusive acquire, and a check
  that fails when `styles.css` is modified by a phase that does not hold the lane.
- **The capture-review sign-off artefact and its checker** (§4C): per lane release, every changed
  PNG, the reviewer, the date and a per-image verdict; a lane release without it fails.
- **The per-push subset** wired into `.github/workflows/gates.yml`: registry equality, lane
  ownership, and the negative controls that prove A can fail.

### In Scope — Deliverable B

- **The replay matrix runner**: a registry-driven drive across every surface family — menus, panels,
  dialogs, sheets, checkboxes, content rows and record targets — including the checkbox and
  content-row triggers that are not floating surfaces at all.
- **Mount samples**: `local`, `bodyPortal`, and explicit `shadowRoot` and `topLayer` samples, with
  the per-role accessibility and fallback proof that `000` made a precondition of opting in.
- **Environment coverage**: both themes, desktop, phone, the intermediate touch band, safe-area
  insets, real host chrome including `.mobile-navbar`, and `visualViewport` rather than the layout
  viewport.
- **Semantic and lifecycle coverage**: driven actions and their model or render outcomes, hit tests,
  focus return, outside / Escape / back dismissal, cleanup, wholesale refresh, anchor replacement,
  nested surfaces and owner teardown.
- **Cascade evidence on the final file**, after the last deletion.
- **The negative-control suite**: raw bypasses, fixture wrappers, stale anchors, missing navbar,
  wrong visual viewport, and capture-only placement each demonstrated to fail the run.
- **Compatibility retirement** (migration step 8): removing the legacy positioner and menu paths one
  disposition at a time, behind a byte-exact `styles.css` checkpoint.
- **Deletion of the CSS blocks `000`'s cascade audit proved dead**, including the dead panel layout
  block and the `db-anchored-popover` marker, once the replay can distinguish dead from live.
- **Full captures and the human and device review**, wired to `009`'s transport where it reaches.

### Out of Scope

- Any per-surface defect owned by a sibling phase. This phase measures and removes; it does not
  redesign. A replay failure is reported back to the owning phase, not patched here.
- Introducing new roles, mounts or tokens. `000` owns the contract.
- **Building the input-hash recorder.** `000` builds it once, cheaply, for the whole program. This
  phase **consumes** it (§4B, AC-010). If `000`'s recorder does not exist, Deliverable A is blocked;
  it does not grow a second implementation.
- Authoring any sibling phase's `capture-review.md`. This phase owns the schema and the checker; the
  releasing phase authors its own file.
- The live-verification transport itself — that is `009`. This phase is one of its consumers.

### Files to Change

| File Path | Change Type | Deliverable | Description |
|---|---|---|---|
| `tools/lane/css-lane.json` | Create | A | The lane ledger: current holder, acquisition hash and commit, and the release history (§4B) |
| `tools/lane/check-lane.mjs` | Create | A | `acquire` / `verify` / `release` for the CSS lane; the check that fails a non-holder edit (§4B) |
| `tools/lane/check-capture-review.mjs` | Create | A | Parses a phase's `capture-review.md` against the changed-PNG set and fails an incomplete sign-off (§4C) |
| `tools/lane/README.md` | Create | A | Required by `tools/naming/scan-folder-docs.mjs` (`SCAN_ROOTS` includes `tools`; below its `THRESHOLD = 3` a folder owes `README.md` only) |
| `tools/integration/handoff-replay.mjs` | Create | A | The minimal handoff replay: closed phases' recorded criteria, registry equality, cascade winners, input-hash admissibility |
| `tools/integration/replay-matrix.mjs` | Create | B | The registry-driven replay runner: producer x branch x mount x environment x transition x outcome, with the negative-control suite |
| `tools/integration/cascade-replay.mjs` | Create | A (shared) | Computed-winner replay at real production mounts, per theme and media context; called by the handoff replay and again on the final file |
| `tools/integration/compat-parity.mjs` | Create | B | Old-path / new-path parity trace per migrated family: placement, dismissal, focus, tokens, refresh, cleanup |
| `tools/integration/README.md`, `tools/integration/CODE.md` | Create | A | Four source files puts this folder at or above `scan-folder-docs.mjs`'s `THRESHOLD = 3`, which owes both docs |
| `.github/workflows/gates.yml` | Modify | A, then B | Add lane ownership, registry equality and the negative controls per push; the handoff replay per lane release; the full grid per candidate |
| `package.json` | Modify | A, then B | `lane:check`, `lane:acquire`, `lane:release`, `integration:handoff`, `integration:registry`, `integration:controls`, `integration:replay`, `integration:cascade`, `integration:parity` |
| `styles.css` | Modify | B | Delete only the blocks `000`'s audit classified dead **and** the replay confirms inert |
| `src/views/popover-auto-close.ts` | Modify | B | Retire the compatibility shim once its call sites are migrated and parity holds |
| `src/views/popover-position.ts` | Modify | B | Retire the legacy public entry point once every family is migrated |
| `src/views/owned-menu.ts` | Modify | B | Retire the legacy handle surface once every menu family is migrated |

### Inventory Method

The registry from `000` is the authority; this phase does not build a second one. The replay drives
**every registry entry** and asserts equality in both directions: every entry produces exactly one
root in its declared mount and document, and every observed root maps to an entry. A registry entry
that the scenario never exercises is a failure, not an omission — an unexercised declaration is
indistinguishable from a dead one.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001 — One replay, every coordinate.** *(Deliverable B.)* The matrix drives every registry
  entry through its real producer and every runtime branch, at each declared mount, in both themes,
  on desktop and phone and in the intermediate touch band, across every transition in §4A, asserting
  a semantic outcome. A missing coordinate is a coverage gap and blocks release even when every
  number present is valid.

- **REQ-002 — Registry equality in both directions.** *(A and B.)* Every observed surface root
  carries a registry id; every registry entry births exactly one root at its declared mount and
  document; every handle has exactly one terminal close or owner-teardown event. Unregistered roots
  and unexercised entries both block.

- **REQ-003 — Cascade evidence after every lane holder.** *(A, then B on the final file.)* The
  computed winner is replayed at real production mounts, per theme and per media context, after each
  phase releases `styles.css` and again on the final file. A duplicate whose context is **unknown**
  blocks release; it is never resolved by taking the last declaration.

- **REQ-004 — Transition semantics are asserted, not assumed.** *(Deliverable B.)* Refresh, anchor
  replacement, nested open, outside / Escape / back dismissal, viewport and keyboard resize, and owner
  teardown each carry an assertion. A surface that survives a transition with a stale anchor, a
  duplicate owner or a leaked listener fails.

- **REQ-005 — Boundary isolation is asserted.** *(Deliverable B.)* For every portalled, shadow and
  top-layer sample, the host's computed custom properties and root class lists are byte-identical
  before and during open, and the surface's own token snapshot matches its container-resolved
  reference. Any leak blocks.

- **REQ-006 — The negative-control suite must fail the run.** *(A for its own subset, B for all
  six.)* Raw mount bypass, a fixture wrapper standing in for the production mount, a stale anchor, a
  missing navbar, the layout viewport substituted for `visualViewport`, and a capture-only placement
  claim each make the run fail. A suite in which none of them fails is not evidence.

- **REQ-007 — Migration parity gates every retirement.** *(Deliverable B.)* A compatibility path is
  removed only after its family's old and new traces agree on placement, dismissal, focus, tokens,
  refresh and cleanup, and only after the full prior matrix has been re-run. Removal is one
  disposition at a time, and a regression restores the byte-exact checkpoint rather than being
  patched forward.

- **REQ-008 — The operator's device review is a release gate, not a formality.** *(Deliverable B.)*
  Gate passage alone has already been shown insufficient in this repository. A red device review
  blocks release regardless of the pipeline's colour, and the review's scope is named per phase rather
  than left to "have a look".

- **REQ-010 — The handoff replay exists before the second lane holder and runs at every handoff.**
  *(Deliverable A.)* No phase may release the `styles.css` lane without a green handoff replay that
  re-asserts **every previously-closed phase's recorded criteria against the current tree**. The
  replay must be demonstrated to fail on a deliberately reintroduced reversal in an already-closed
  phase's surface, and to redden only that phase's cells.

- **REQ-011 — The CSS lane has a recorded owner and an enforcing check.** *(Deliverable A.)* Lane
  ownership is a file, not a sentence. Acquisition is exclusive; a `styles.css` modification that does
  not correspond to the recorded holder fails `npm run lane:check`; release is refused unless the
  handoff replay is green and the capture-review sign-off is complete. The mechanism is specified in
  §4B and must be implementable without further decisions.

- **REQ-012 — Every lane release carries a capture-review sign-off.** *(Deliverable A.)*
  `screenshots:verify` compares recorded source fingerprints and **never opens an image**
  (`tools/screenshots/verify.mjs:45-48` hashes source files; the only PNG operation anywhere in it is
  an existence check). The compensating human review therefore gets an artefact, a reviewer, a date
  and a per-image verdict, and a lane release without a complete one fails. The mechanism is specified
  in §4C.

### P1 - Required (complete OR user-approved deferral)

- **REQ-009 — Capture and replay results are admissible only against their recorded inputs.**
  *(Deliverable A, consuming `000`.)* Every evidence artefact this phase reads or writes carries the
  input hashes it was produced against, recorded by **`000`'s input-hash recorder** — this phase does
  not build one. An artefact whose recorded hashes differ from the current tree is inadmissible, and
  the rejection must be demonstrated on a deliberately staled artefact. Deferrable only with a written
  ADR, because without it every green result is of unknown vintage.

<!-- /ANCHOR:requirements -->
---

## 4A. THE REPLAY MATRIX

The grid below is **Deliverable B**. Deliverable A drives the Cascade row and the recorded criteria
of already-closed phases only; every other row waits for the release candidate.

| Axis | Minimum coverage | The failure it catches | Deliverable |
|---|---|---|---|
| Producer | Every registry entry, plus a raw-bypass control | Hidden construction and unregistered surfaces | B (A: registry equality only) |
| Runtime branch | Every branch the producer can take, including callback-time and dynamic-host paths | A branch that only exists in production | B |
| Mount / host | `local`, `bodyPortal`, explicit `shadowRoot`, explicit `topLayer` | Lost tokens, style leakage, wrong stacking or dismissal | B |
| Role | menu, panel, dialog, sheet, checkbox, row, target | Parent-selector aliasing and wrong semantics | B |
| Environment | Desktop, phone, intermediate touch, both themes, safe area, host navbar, `visualViewport` | Device-only geometry and host overlap | B |
| Transition | Nested open, outside / Escape / back, wholesale refresh, anchor replacement, viewport and keyboard resize, owner teardown | Stale anchors, duplicate owners, leaks | B |
| Cascade | After every stylesheet lane change and on the final file | Later-phase regression and silent override | **A** and B |
| Closed-phase criteria | Every criterion an already-closed phase recorded, re-asserted against the current tree | A later phase silently reversing an earlier one | **A** |
| Outcome | Hit test, driven action, model and render result, focus return, cleanup | Real-looking geometry with broken behaviour | B |

---

## 4B. THE CSS LANE — OWNERSHIP MECHANISM

The parent says "exactly one phase holds `styles.css` at a time." Until now that was prose. `004` and
`005` both unblock after `000`, so two autonomous runners could edit the same 19,261-line file
concurrently and produce the exact 87-selector / 124-conflict pattern this program exists to remove
(`../adversarial-review.md` F6). This section replaces the convention with a file and a command.

### The file that records ownership

**`tools/lane/css-lane.json`** — git-tracked, one object, read and written only by
`tools/lane/check-lane.mjs`.

```json
{
  "lane": "styles.css",
  "holder": "004-checkbox-ownership",
  "acquiredAt": "2026-09-14T09:12:00Z",
  "baselineHash": "9732449e4746",
  "baselineCommit": "030d6b0",
  "history": [
    {
      "holder": "000-surface-contract-and-truthful-harness",
      "acquiredAt": "2026-09-02T09:00:00Z",
      "releasedAt": "2026-09-13T16:20:00Z",
      "releaseHash": "9732449e4746",
      "handoffReplay": "replay/handoff/000-1.json",
      "captureReview": "specs/public/005-component-surface-system/000-surface-contract-and-truthful-harness/capture-review.md#release-1"
    }
  ]
}
```

- `holder` is the phase **folder name**, or `null` when the lane is free.
- `baselineHash` is `sha256(styles.css)` truncated to 12 characters — deliberately the same function
  the capture pipeline already uses (`tools/screenshots/verify.mjs:45-48`), so there is one hash
  convention in this repository rather than two that can disagree.
- `baselineCommit` is diagnostic only; the content hash is the authority, because it works on an
  uncommitted working tree, which is where a concurrent edit actually happens.

### The command that enforces it

**`node tools/lane/check-lane.mjs <acquire|verify|release> --phase <folder>`**, exposed as
`npm run lane:acquire`, `npm run lane:check` and `npm run lane:release`.

| Sub-command | Behaviour | Exits non-zero when |
|---|---|---|
| `acquire` | Writes `holder`, `acquiredAt`, `baselineHash`, `baselineCommit` | `holder` is non-null and is not the requesting phase — **this is the concurrency block**: `005` cannot acquire while `004` holds |
| `verify` | Recomputes `sha256(styles.css)[0..12]` and compares it to `baselineHash` | The hash differs **and** `holder` is `null` (edited while the lane was free), or the hash differs **and** `--phase` is not `holder` (edited by a phase that does not hold the lane) |
| `release` | Appends a `history` entry and sets `holder` to `null` | The requesting phase is not `holder`; **or** the handoff replay artefact named by `--replay` is absent or not green; **or** `check-capture-review.mjs` exits non-zero for this release (§4C) |

`verify` is the gate. It runs in `.github/workflows/gates.yml` on every push with `--phase` taken from
`LANE_PHASE`, and it runs in every phase's own quality-gate block. When the hash matches the baseline
the file has not moved since acquisition and the check passes regardless of who asks — so the check
costs nothing on the branches that are not touching the stylesheet.

**The failure mode, stated exactly.** A phase that edits `styles.css` without acquiring the lane
cannot have written `baselineHash`, so the file's current hash differs from whatever the ledger
records. `verify` reports:

```
lane: styles.css has drifted from the recorded baseline
  ledger holder : 004-checkbox-ownership (acquired 2026-09-14T09:12:00Z at 9732449e4746)
  requesting    : 005-content-row-rhythm
  current hash  : 1f4c9a0b77de
  -> 005-content-row-rhythm does not hold the styles.css lane. Acquire it or revert the edit.
```

and exits 1.

**The handoff procedure.** Releasing phase: full recapture → author `capture-review.md` for this
release (§4C) → `npm run integration:handoff` → `npm run lane:release --phase <self> --replay
replay/handoff/<self>-<n>.json`. The release is refused unless all three succeed. Next phase:
`npm run lane:acquire --phase <self>`, which fails while `holder` is still set — so a refused release
is also a blocked acquisition, and the lane cannot be silently taken.

**The residual case, named.** Two agents running as the same identity on the same branch can both
attempt to edit. `acquire` blocks the second one from starting legitimately; if it edits anyway, the
drift is caught at the next `verify` — at the latest at the offending phase's own gate block, and at
the very latest on push. This mechanism prevents a silent concurrent edit; it does not prevent a
determined one, and no file-based mechanism in a single working tree can.

---

## 4C. THE CAPTURE REVIEW — SIGN-OFF MECHANISM

`screenshots:verify` is cited as a gate in four places across this program while its own
documentation says it cannot detect a visual regression (`../adversarial-review.md` F9). What it
actually does is compare recorded source fingerprints: `tools/screenshots/verify.mjs:45-48` hashes
each source file and `screenshots/manifest.json` stores those hashes per scenario. The only operation
it performs on a PNG is `existsSync`. So it proves a capture was regenerated after its
**hand-maintained** source list changed. It cannot prove the capture shows the right thing, and the
human review that was supposed to compensate had no artefact, no reviewer field and no gate.

### The file

**`specs/public/005-component-surface-system/<phase-folder>/capture-review.md`** — authored by the
releasing phase, one `## Release N` section per lane release, checked by
`tools/lane/check-capture-review.mjs`.

```markdown
## Release 1

- **Reviewer:** <name>
- **Date:** 2026-09-13
- **styles.css:** `9732449e4746`
- **Changed PNGs:** 14

| PNG | Before | After | Verdict | Note |
|---|---|---|---|---|
| screenshots/components/add-view-popover-desktop-dark.png | 0e3f76e3ca85 | 44a1b2c3d4e5 | expected-change | radius is 8px at the body mount now |
| screenshots/panels/filter-panel-phone-light.png | 7c1de40ab993 | 7c1de40ab993 | correct | unchanged, listed because its source hash moved |
| screenshots/views/timeline-desktop-dark.png | 22ab90ff1c04 | 9de3c7714a80 | pre-existing-defect (F12) | timeline bands still resolve `grid-row: 34px` |
```

**Verdict vocabulary is closed**: `correct`, `expected-change`, `regression`, `pre-existing-defect`.
`regression` fails the check. `pre-existing-defect` must name a finding id, so the reviewer discharges
a known harness defect once rather than re-adjudicating it at every release — the cognitive tax F12
predicted.

### The check

**`node tools/lane/check-capture-review.mjs --phase <folder> --release <n>`**, exposed as
`npm run lane:capture-review` and invoked by `check-lane.mjs release`.

1. `lane:acquire` snapshots `{png-path: sha256[0..12]}` for all 196 captures into
   `tools/lane/capture-baseline.json`.
2. At release the checker recomputes those hashes and diffs them: that set is **the changed PNGs**,
   derived from bytes rather than from the hand-maintained source list, which closes the
   `screenshots:verify` hole rather than reproducing it.
3. It parses the named release section and exits **1** when any of these holds:
   - a changed PNG has no row;
   - a row names a PNG that is not in the changed set (a stale row from a previous release);
   - a verdict is outside the closed vocabulary;
   - any verdict is `regression`;
   - `Reviewer` or `Date` is empty;
   - the recorded `styles.css` hash is not the current one;
   - a `pre-existing-defect` verdict names no finding id.
4. Exit **0** only when every changed PNG carries a non-`regression` verdict from a named reviewer on
   a date, against the current stylesheet.

**A lane release without it fails**: `check-lane.mjs release` shells this checker and refuses to null
`holder` on a non-zero exit. The capture review is therefore not a ceremony that can be forgotten —
it is the thing standing between a phase and the lane it wants to hand over.

**What this does not claim.** A verdict is a human judgement recorded under a name. This mechanism
makes the judgement mandatory, attributable and complete; it does not make it correct. It closes F9's
"no gate, no sign-off, no tooling" — not the deeper problem that a tired reviewer can type
`expected-change` 14 times.

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Full thresholds, recorded values, provenance and negative controls are in
[`acceptance-criteria.md`](acceptance-criteria.md).

**Vitest is not evidence for any criterion here.** `vitest` runs `environment: "node"` with no jsdom
(`vitest.config.ts:16`), so the 410-test suite exercises pure logic only and no DOM assertion in this
program can live in it. It appears in this phase's quality gates as a **regression guard** — it
catches a broken import or a changed pure function — and a green suite is evidence for nothing in the
table below. `../adversarial-review.md` O3 records this because every phase lists it as a gate and the
listing invites the mistake.

| # | Requirement | Deliverable | Criterion | Measured today |
|---|---|---|---|---|
| **G1** | REQ-001 | B | Every registry entry is driven across every §4A coordinate | *census* — no replay runner exists |
| **G2** | REQ-002 | A, B | Observed-root set equals registry-entry set, in both directions | *census* — no registry exists until `000` lands |
| **G3** | REQ-003 | A, B | Zero duplicated selectors with an unknown context after the final lane holder | **87 selectors, 124 conflicts** on the current tree |
| **G4** | REQ-004 | B | Every transition carries an assertion, and none leaves a stale anchor or duplicate owner | *trace* — no harness performs a transition |
| **G5** | REQ-005 | B | Host computed variables and root class lists unchanged during every portalled open | *trace* — never asserted |
| **G6** | REQ-006 | A, B | All six negative controls fail the run | no such controls exist |
| **G7** | REQ-007 | B | Every retired compatibility path has a recorded parity trace | *census* — nothing has been retired yet |
| **G8** | REQ-008 | B | A red operator device review actually blocked a release in a rehearsal | 1.3.1 shipped without any device review and the defect survived |
| **G9** | REQ-010 | A | A reintroduced cascade reversal in a closed phase's surface fails the handoff replay, reddening only that phase's cells | no handoff replay exists; today nothing would fire until release |
| **G10** | REQ-011 | A | A `styles.css` edit by a phase that does not hold the lane is refused | no ledger and no check exist; the rule is prose in `../spec.md` §4 |
| **G11** | REQ-012 | A | A lane release with an unreviewed changed PNG is refused | no sign-off artefact exists; `screenshots:verify` passes on file existence |

### Acceptance Scenarios

1. **Given** the full registry, **when** the replay matrix runs, **then** every entry births exactly
   one root at its declared mount and every observed root carries an id.
2. **Given** a fixture that appends a surface-shaped node to `document.body` directly, **when** the
   replay runs, **then** it fails on an unregistered root.
3. **Given** a phase is releasing the `styles.css` lane, **when** the handoff replay runs, **then**
   every already-closed phase's recorded criteria are re-asserted against the current tree and a
   reversal in any of them blocks the release.
4. **Given** an open sheet on a phone profile and a wholesale view refresh, **when** the renderer
   commits, **then** the handle re-anchors, the hit test over the navbar band still returns the sheet,
   and no listener has leaked.
5. **Given** a migrated family whose old path is still present, **when** the parity trace runs,
   **then** placement, dismissal, focus, tokens, refresh and cleanup agree, and only then may the old
   path be removed.
6. **Given** a green pipeline and a red operator device review, **when** release is proposed,
   **then** release is blocked.
7. **Given** the ledger records `004` as the holder, **when** `005` modifies `styles.css` and any gate
   runs, **then** `lane:check` exits non-zero naming both phases and the drifted hash.
8. **Given** a recapture that changed 14 PNGs and a `capture-review.md` listing 13, **when** the
   releasing phase runs `lane:release`, **then** the release is refused and the lane stays held.
9. **Given** a replay result recorded before the last `styles.css` edit, **when** the handoff replay
   checks admissibility, **then** the result is rejected as stale rather than carried forward.

### Verification

- **Handoff replay** — run at every lane handoff, from `000`'s release onward.
- **Lane ownership** — `npm run lane:check` per push and in every phase's own gate block.
- **Capture-review sign-off** — `npm run lane:capture-review`, invoked by `lane:release`.
- **Replay matrix** — the whole §4A grid, run from the final state.
- **Negative controls** — all six demonstrated failing, plus N12-N14 for the new mechanisms.
- **Cascade replay** — after every lane holder and on the final file.
- **Parity traces** — one per retired compatibility path, recorded before the removal commit.
- **Captures** — full recapture with the stylesheet hash and producer set recorded, then the
  capture-review sign-off.
- **Device** — the operator's review through `../009-live-verification`, or by hand where `009`
  cannot reach.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Dependency | `000`'s registry, handle and anchor lease | Without them there is nothing to replay | Deliverable A cannot start before `000` Stage 6; Deliverable B needs every sibling |
| Dependency | `000`'s input-hash recorder | Without it no result has a provable vintage | REQ-009 consumes it; this phase does not build a second one, and says so in §3 Out of Scope |
| Dependency | Every sibling phase's local evidence | The replay re-runs their samples, it does not invent them | Each phase hands its matrix rows forward at close; the handoff replay re-asserts them at every subsequent handoff |
| Dependency | `009-live-verification` for the device half | Without it, device review stays a manual ritual | `009` now runs first; manual review is the documented fallback on phone |
| Risk | The handoff replay is too slow and gets skipped | The early gate degenerates into the late gate, and F7 returns | Deliverable A is minimal by construction: recorded criteria, registry equality and cascade winners only. Its runtime is recorded and is a closure criterion |
| Risk | The replay becomes a second harness that also cannot fail | The program repeats its own mistake one level up | REQ-006: six negative controls, each demonstrated failing, before any replay result is trusted; N12 does the same job for the handoff replay |
| Risk | The lane ledger is edited by hand and drifts from reality | The enforcement becomes theatre | The ledger is written only by `check-lane.mjs`; a hand edit that does not match `sha256(styles.css)` fails `verify` on the next run |
| Risk | Retiring a compatibility path breaks a surface nobody drove | A defect ships exactly as 1.3.1 did | REQ-002 makes an unexercised registry entry a failure; REQ-007 gates removal on a parity trace |
| Risk | The full grid is too slow to run per push | It degrades into a release-only ritual and rots | Split: lane check, registry equality and the negative controls per push; the handoff replay per lane release; the full grid per release candidate |
| Risk | A red device review is overridden because the pipeline is green | The program's founding failure, repeated | REQ-008 makes the device review a blocking gate with named scope, and G8 closes on a rehearsal in which it actually blocked |

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance

- **NFR-P01**: The per-push subset — lane ownership, registry equality and the negative controls —
  completes inside the existing gate budget.
- **NFR-P02**: The handoff replay completes inside a lane handoff without anyone deciding to skip it.
  Its measured runtime is recorded and is part of Deliverable A's closure.
- **NFR-P03**: The full grid is resumable per axis, so a failure in one environment does not force a
  full re-run.

### Security

- **NFR-S01**: No network call, telemetry or remote dependency. Local Obsidian DOM APIs and the local
  browser only.
- **NFR-S02**: `external/` AnyType and AppFlowy are read for behaviour only — AGPL/source-available
  against this plugin's MIT, so no code, CSS value or token scale is copied.
- **NFR-S03**: The replay writes nothing into the operator's vault outside the declared testbed.

### Reliability

- **NFR-R01**: A byte-exact `styles.css` checkpoint exists before the first deletion and is retired
  only after release.
- **NFR-R02**: Every retirement is its own revertable commit with its parity trace recorded in the
  message body's referenced artefact.
- **NFR-R03**: The replay is deterministic: the same tree produces the same matrix result, and any
  flake is treated as an unmodelled coordinate rather than retried.
- **NFR-R04**: The lane ledger and the capture baseline are written only by `check-lane.mjs`, and a
  gate run leaves them unmodified — `gates.yml` already fails on a dirty tree after a full run.

---

## 8. EDGE CASES

### Data Boundaries

- A registry entry whose producer is only reachable through a dynamic host selection must still be
  driven; the replay resolves producers through the registry, not through import graphs.
- A surface family with no floating surface at all — checkboxes, content rows — is still a registry
  entry with a role, a mount and an outcome.
- A capture whose bytes changed but whose scenario source list did not is still a changed PNG: §4C
  derives the changed set from PNG hashes, not from the source list.

### Error Scenarios

- A replay failure inside a sibling phase's scope is reported to that phase and blocks release; it is
  not patched here, because a patch by the replay owner destroys the independence the replay exists
  for.
- A capture that cannot be attributed to a stylesheet hash and producer set is treated as stale.
- An operator review that cannot be obtained is a blocker, not a pass by default.
- A `lane:release` refused by the capture-review checker leaves the lane **held**, not free. There is
  no partial release.

### State Transitions

- Retirement order is a total order recorded before the first removal; removing two dispositions in
  one commit is forbidden even when they look independent.
- The final cascade replay runs on the file **after** the last deletion, not before it.
- The lane has exactly three states — free, held, and held-with-a-refused-release. The third is not a
  fourth state to design around; it is `held` with a failing gate.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 24/25 | Two deliverables on different schedules; every registry entry, four mounts, seven roles, six environments, seven transitions, compatibility retirement, plus two new enforcement mechanisms |
| Risk | 22/25 | Owns the last CSS deletions and every retirement; a wrong call here ships the program's defect |
| Research | 10/20 | The matrix is specified by `../007-architecture-research`; the mechanisms are specified in §4B and §4C; the work is construction and execution |
| Multi-Agent | 9/15 | The grid parallelises by axis, but the CSS lane and the retirement order are strictly serial |
| Coordination | 15/15 | Deliverable A gates every sibling's lane release; Deliverable B gates the release |
| **Total** | **80/100** | **Level 3** |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | The replay cannot fail | H | M | Six negative controls, each demonstrated failing before any result is trusted |
| R-002 | A retirement strands a surface nobody drove | H | M | Registry equality treats an unexercised entry as a failure; parity trace gates removal |
| R-003 | A "dead" CSS block was live | H | M | The replay confirms inertness at real mounts before deletion; byte-exact checkpoint restores |
| R-004 | The full grid is too slow and gets skipped | M | H | Split per-push subset from per-handoff replay from per-release grid; resumable by axis |
| R-005 | Device review is skipped or overridden | H | M | REQ-008 blocking gate with named scope; `009` reduces its cost |
| R-006 | The replay drifts from the registry as the registry grows | M | M | The runner reads the registry; it holds no list of its own |
| R-007 | Deliverable A slips and the program reverts to a single end gate | H | M | A is scheduled before `001` and blocks every lane release; a slipped A is a stopped program, not a deferred one |
| R-008 | The capture review is completed truthfully but carelessly | M | H | The verdict vocabulary is closed and `pre-existing-defect` must cite a finding, so the cheapest honest path is also the most informative one |

---

## 11. USER STORIES

### US-001: A green pipeline that means something (Priority: P0)

**As a** maintainer, **I want** the release gate to replay every surface at its production mount
after the last stylesheet edit, **so that** "all gates green" describes the tree being shipped rather
than seven trees that no longer exist.

**Acceptance Criteria**:
1. Given the final tree, When the replay matrix runs, Then every registry entry is driven across
   every §4A coordinate (G1).
2. Given a raw-mount bypass in a fixture, When the replay runs, Then it fails (G6).

### US-002: A removal that cannot strand a surface (Priority: P0)

**As a** maintainer, **I want** every compatibility path retired only against a recorded parity
trace, **so that** the cleanup at the end of the program does not reintroduce the defect the program
was written to fix.

**Acceptance Criteria**:
1. Given a migrated family, When its parity trace is run, Then placement, dismissal, focus, tokens,
   refresh and cleanup agree between the old and new paths (G7).
2. Given a parity failure, When removal is proposed, Then the removal is blocked and the byte-exact
   checkpoint is restored.

### US-003: A reversal caught in the week it happened (Priority: P0)

**As a** maintainer, **I want** every closed phase's criteria re-asserted at every lane handoff,
**so that** a later phase reversing an earlier one costs a handoff rather than a quarter.

**Acceptance Criteria**:
1. Given a closed phase and a reintroduced reversal in its surface, When the next handoff replay
   runs, Then it fails and names that phase's cells (G9).
2. Given a phase that has not acquired the lane, When it modifies `styles.css`, Then `lane:check`
   refuses (G10).
3. Given a recapture with an unreviewed changed PNG, When the phase attempts to release the lane,
   Then the release is refused (G11).

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- Which subset of the grid is cheap enough to run on every push without rotting into a skipped gate?
  The split in NFR-P01 is a proposal; the measured runtime decides it.
- What exactly does `000`'s input-hash recorder emit, and is its shape a per-artefact
  `{path: sha256[0..12]}` map? REQ-009 and AC-010 assume that shape because it matches the one already
  in `screenshots/manifest.json`. If `000` chooses differently, this phase adapts to `000` rather than
  the reverse.
- Does the intermediate touch band need its own environment row, or is it covered by driving both
  phone predicates? `003`'s reclassification list answers this once it exists.
- Can the operator's device review be partially automated through `009` on desktop while remaining
  manual on phone, and does a partially automated review still satisfy REQ-008?
- Should the handoff replay also fingerprint the harness files — `runtime-vars.css`,
  `.storybook/preview.ts`, `verify-placement.mjs` — which today no capture fingerprints
  (`../adversarial-review.md` O2)? It is cheap here and would close O2 without a new phase.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Root causes and measurements**: [`../architecture-findings.md`](../architecture-findings.md)
- **Review that restructured this phase**: [`../adversarial-review.md`](../adversarial-review.md)
- **Contract replayed**: [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- **Live verification transport**: [`../009-live-verification/spec.md`](../009-live-verification/spec.md)
- **Design system**: [`../design-system.md`](../design-system.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
