---
title: "Acceptance Criteria: Properties Panel"
description: "The criteria this packet must satisfy before it may be closed, each carrying its exact measurement, its threshold, the failing value measured on the current tree, and the negative control that proves the check can fail."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "002 properties panel criteria"
  - "proof tuple"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/002-properties-panel"
    last_updated_at: "2026-08-31T00:00:00Z"
    last_updated_by: "harness-dependence-audit"
    recent_action: "Classified 12 criteria for harness dependence; 2 rest on host control heights"
    next_safe_action: "Model app.css input and button heights before trusting the 36px row threshold"
    blockers:
      - "001-overlay-placement-and-menu-language must land first"
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-002"
      parent_session_id: null
    completion_pct: 43
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Properties Panel

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.
>
> Each is measured on the real renderer at the production mount point, expressed as a number with a
> threshold, and recorded here with its failing value from the current tree before it is trusted.
> **A criterion with no recorded failing number is not accepted.** Class names and rule counts are
> banned as criteria.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 002-properties-panel
**Level:** 2
**Status:** Draft
**Date:** 2026-08-29
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

### The nine dimensions

The four original conditions are necessary and not sufficient. A **semantically aliased row** passes
all four: the measurement is real, the baseline fails, deleting the subject moves the metric — and
the harness is still asserting against *the third row* rather than *the property called Status*.
This panel is the packet where that failure is most likely to be invisible, because its layout is
positional: a track list, not named areas. The measured proof is already on the tree — hiding the
drag handle on phone shifts every subsequent child one track left, so the same DOM index means a
different property depending on the viewport.

Five dimensions close the hole — semantic identity, transition trace, action outcome, resource
ownership, negative-control mutation — and the proof tuple is `producer x runtime branch x
mount/host x environment x transition x semantic outcome x negative control`.

### Criteria table

| AC-ID | REQ | Measurement — producer → mount → transition → observation | Threshold | Measured today | NC | Status | Waiver |
|---|---|---|---|---|---|---|---|
| AC-001 (B1) | REQ-002 | Open the panel through its production producer; for every laid-out child of a property row read computed `grid-row-start`, and read the row's `getBoundingClientRect().height` | computed `grid-row-start` = 1 for all children, and row `height <= 36px`, both viewports | **fails: 8 children into 7 tracks on desktop; measured height 52px against a declared `min-height: 30px`, trash on an implicit second row** | N1 | Unmet | - |
| AC-002 (B2) | REQ-001, REQ-007 | Count declared grid tracks and laid-out children at every breakpoint and every condition in the §4A matrix | equality at every breakpoint x every condition in the §4A matrix | **fails: desktop 7 declared vs 8 laid out; phone 8 declared vs 7 laid out** (`.db-column-drag` is `display: none` on phone) | N2 | Unmet | - |
| AC-003 (B3) | REQ-004 | Measure the property-name element's computed content width and its right edge against the panel's content box | computed content width `>= 120px` desktop, `>= 96px` phone, and `nameEl.getBoundingClientRect().right <= panelContentBox.right` | **fails: the phone name track measures 22px** | N3 | Unmet | - |
| AC-004 (B4) | REQ-005 | Open the panel with 40 properties; read its `getBoundingClientRect().height` against the visible bounds | measured `height <= min(560px, 0.7 * visibleBounds.height)` with 40 properties, both viewports | **fails: the inline `maxHeight` written by the positioner takes the full available bounds** | N4 | Unmet | - |
| AC-005 (B5) | REQ-006 | For every element in the row's primary line, drive a single click and observe whether `deleteColumn` runs with no interposed confirmation | no element in the row's primary line both invokes `deleteColumn` on a single click and has no confirmation | **fails: `db-column-delete-btn` deletes on one click from the row itself** | N5 | Unmet | - |
| AC-006 (B6) | REQ-001, REQ-007 | For each condition in §4A, remove that condition's child and read the grid area each surviving child resolves to | for each condition in §4A, the grid area resolved by each surviving child is unchanged from the read-write case | **fails: hiding the drag handle on phone shifts every subsequent child one track left** | N6 | Unmet | - |
| AC-007 | REQ-003 | **Rewritten under review finding F8 — it closed on a document existing, not on an outcome.** With the chosen primary line in place, drive the panel at 402px phone and 1440px desktop and measure: every primary-line control's rect against the panel content box; the property name's computed content width; the number of primary-line controls a user must scroll horizontally to reach; and, for each control moved behind the overflow, the number of interactions needed to reach it | at both viewports: **0 primary-line controls extend past the panel content box**, the name meets AC-003's width floor (`>= 120px` desktop, `>= 96px` phone), **0 primary-line controls require horizontal scrolling**, and every overflowed control is reachable in **`<= 1` additional interaction**. The written decision is the *input* to this measurement, not its closing condition | *blank — see the F16 provenance table below.* The present state is "whatever eight controls the renderer happens to emit", and its consequence is already recorded next to AC-001 and AC-003 (52px row, 22px phone name track) — but no measurement of the primary line as a primary line has been taken | N7 | Unmet | - |
| AC-008 | REQ-001 | **Semantic identity.** Every assertion names the property by its stable column id, resolved from the model — never by DOM index, never by row ordinal, never by label text. Re-read after a reorder | every asserted row maps to the column id it claims, before and after a reorder, **and driving the delete control on the row asserted to be property X removes property X from the model — 0 misattributed actions**; 0 assertions resolved by index or position | *census* — every current identification is positional by construction, because the row is a track list. The failing consequence is recorded in AC-006: the same index means a different property on phone than on desktop. The id-to-row map is the Phase-1 census deliverable | N8 | Unmet | - |
| AC-009 | REQ-007 | **Transition trace.** `open → add / rename / reorder / delete a property → reconcile → observe → action → close`. With the panel open, apply each mutation, then re-run AC-002's track/child equality and AC-008's id resolution | track/child equality holds after every mutation; every surviving row still resolves to its own column id; the panel is still placed inside its bounds | *trace* — no harness mutates the schema while the panel is open. The mechanism that makes this dangerous is already recorded: `styles.css:2036` hides `.db-mobile-reorder-controls` and `styles.css:18776` — the same selector, later — sets `display: inline-flex`, so the emitted child count is decided by cascade order rather than by the condition | N9 | Unmet | - |
| AC-010 | REQ-006 | **Action outcome.** Drive delete, rename and reorder; assert the model changed, that delete required its interposed confirmation, and that cancelling the confirmation left the model untouched | every driven action produces its asserted model delta; cancel produces a zero delta; 0 actions asserted by node presence alone | *trace* — recorded in `../architecture-findings.md` §3: **nothing drives a click, drag or commit** in any current harness, so no outcome has ever been asserted here | N10 | Unmet | - |
| AC-011 | REQ-005 | **Resource ownership.** While the panel is open, count its dismissal, scroll and focus owners; after close, re-count listeners and surface-root nodes against the pre-open baseline | exactly 1 owner of each kind while open; listener and node counts return to the pre-open baseline after close, **and after close a click at the coordinates the panel occupied reaches the element underneath and the host's scroll position is where it was before the open — 0 panels leave an inert or scroll-locked region behind** | *census* — the panel is placed by the shared positioner and dismissed by whichever of the two containment systems its producer happened to register with (`src/views/overlay-stack.ts`, `src/views/interaction-scope.ts`). Owner counts are the Phase-1 census deliverable | N11 | Unmet | - |
| AC-012 | REQ-007 | **Negative-control mutation.** Substitute exactly one tuple coordinate — resolve a row by index instead of column id, render at the other viewport, skip the mutation transition, or emit the row through the pre-fix positional grammar — and rerun | each single substitution fails at least one **value** assertion; a failure caused only by a missing node does not count | no such control exists. The two phone rules that already fight (`styles.css:16879` vs `:16995`, the later winning with a different track order, giving the checkbox a 96px track and the property name 22px) are exactly the substitution this control has to catch | N12 | Unmet | - |

**B2 and B6 are the phase's negative controls.** B2 fails today in both directions at once — an
over-fill on desktop and an under-fill on phone — so a harness that reports it passing has been
measured wrong rather than fixed. B6 is a deletion test by construction: it asserts that removing a
child cannot change what the remaining children mean, which is the one property a positional track
list cannot have. **AC-012 generalises both**: deletion is one of six substitutions, and identity
aliasing is the one B2 and B6 cannot see.

### Proof-tuple coverage

A blank cell is a coverage gap and blocks closure, even when the criterion's number is valid.

| AC-ID | Producer | Runtime branch | Mount / host | Environment | Transition | Semantic outcome | Negative control |
|---|---|---|---|---|---|---|---|
| AC-001 | production | read-write | declared mount | desktop + phone | static read | one row, bounded height | N1 |
| AC-002 | production | every §4A condition | declared mount | every breakpoint | static read | declared = emitted | N2 |
| AC-003 | production | read-write | declared mount | desktop + phone | static read | name legible | N3 |
| AC-004 | production | 40 properties | declared mount | desktop + phone | static read | panel bounded | N4 |
| AC-005 | production | read-write | declared mount | desktop + phone | single click | no bare destructive click | N5 |
| AC-006 | production | every §4A condition | declared mount | desktop + phone | child removed | areas stable | N6 |
| AC-007 | n/a | n/a | n/a | n/a | recorded decision | IA chosen | N7 |
| AC-008 | production | every §4A condition | declared mount | desktop + phone | reorder | row = column id | N8 |
| AC-009 | production | all | declared mount | desktop + phone | add/rename/reorder/delete | identity + layout survive | N9 |
| AC-010 | production | all | declared mount | desktop + phone | open → action → confirm/cancel | model delta | N10 |
| AC-011 | production | all | declared mount | desktop + phone | open → close | one owner, zero leaks | N11 |
| AC-012 | substituted | substituted | substituted | substituted | substituted | assertion fails | N12 |

### Negative controls

This packet's `checklist.md` registers its controls as prose (B2 and B6). The register below is the
numbered form; add it to `checklist.md` when its verification protocol is next revised.

| # | Control | What it proves |
|---|---|---|
| N1 | Restoring the implicit second row reproduces the 52px measurement | AC-001 measures the wrap, not the declaration |
| N2 | Emitting one extra child reproduces the desktop 7-vs-8 mismatch | AC-002 counts what was laid out |
| N3 | Restoring the later phone rule (`styles.css:16995`) reproduces the 22px name track | AC-003 measures the computed winner |
| N4 | Removing the independent height cap lets the positioner's inline `maxHeight` win again | AC-004 measures the panel, not the positioner |
| N5 | Removing the confirmation makes a single click delete again | AC-005 asserts the interposed step |
| N6 | Hiding the drag handle on phone shifts every subsequent child one track left | AC-006 is a deletion test by construction |
| N7 | n/a — closes on the recorded decision | — |
| N8 | Resolving a row by index instead of column id mis-identifies it across the viewport change | AC-008 asserts identity |
| N9 | Adding a property while the panel is open without reconciling reproduces the track mismatch | AC-009 observes the transition |
| N10 | Stubbing the model write makes the driven action's assertion fail | AC-010 asserts an outcome |
| N11 | Registering a second dismissal owner for the panel fails the owner count | AC-011 counts owners |
| N12 | Each of the six single-coordinate substitutions fails a value assertion | The suite is connected to all six coordinates |

### F8 audit — every criterion re-tested for the "passes on today's broken tree" shape

Review finding F8 named `001/AC-008` and `005/AC-006`; the audit below re-reads every row here for
the same four shapes — closing on a **thing existing**, on a **deletion**, on a **classification**,
or on a **count**.

| AC-ID | Shape found | Disposition |
|---|---|---|
| AC-001 | Outcome. Computed `grid-row-start` and a measured row height | Kept unchanged |
| AC-002 | Outcome. Declared tracks against **laid-out** children — the laid-out half is a runtime measurement, not a declaration read | Kept unchanged |
| AC-003 | Outcome. A computed content width and a right edge against the content box | Kept unchanged |
| AC-004 | Outcome. A measured panel height against the visible bounds | Kept unchanged |
| AC-005 | Outcome. A driven click and whether `deleteColumn` ran | Kept unchanged |
| AC-006 | Outcome. A deletion test whose pass condition is that resolved grid areas **do not** move | Kept unchanged |
| AC-007 | **Thing existing.** Closed on a decision being written down before implementation | **Rewritten.** Now closes on the primary line measured at both viewports: 0 controls past the content box, 0 needing horizontal scroll, the name at its width floor, overflow reachable in one interaction. The written decision is the input |
| AC-008 | **Count.** "0 assertions resolved by index" is a property of the test suite, not the product | **Threshold extended.** Identity now closes on the driven outcome: the delete on the row asserted to be property X removes property X |
| AC-009 | Outcome, once AC-008's extension lands — the mutation transition is re-run against a driven action | Kept |
| AC-010 | Outcome. A model delta per driven action, and a zero delta on cancel | Kept unchanged |
| AC-011 | **Count.** Owner counts are countable mechanism | **Threshold extended.** Adds the user-visible consequence: the vacated region is clickable and the host's scroll position is restored |
| AC-012 | Substitution control. Outcome-shaped by construction — each substitution must fail a **value** assertion | Kept unchanged |

**Rule going forward.** No row here may be marked `Met` on the strength of a class being present, a
rule pair being collapsed to one declaration, a decision document existing, or a population being
classified. Those are inputs. The closing evidence is a measured value that moved, or a driven
action that landed on the property it claimed.

### Failing-number provenance — the blank cells (review finding F16)

`../architecture-findings.md` §9 condition 3 makes a criterion invalid until it has been
**demonstrated to fail on the current tree, with the failing number recorded**. The rows below hold
a source fact rather than a number. Until the number is there they are unenforceable prose: a
passing measurement would prove only that a value sits inside a threshold, never that it moved.

**No number below may be invented, estimated, or carried across from another packet.** The cell is
filled by running the named producer and pasting what it printed.

| AC-ID | What produces the failing number | Stage of this phase that produces it | State until the cell is filled |
|---|---|---|---|
| AC-007 | The primary-line measurement described in its row, run against **today's** emitted row: every control's rect against the panel content box, the name's content width, the horizontal-scroll count, and the interaction count for anything already behind an overflow | Phase 1 records the *before* set; Phase 2 chooses the primary line against it; Phase 4 records the *after* set | **Blocked.** Phase 2 may not choose a primary line before the current one has been measured — the decision would then be taken against an impression |
| AC-008 | The id-to-row map: every emitted row joined to the column id its model entry carries, at both viewports and under every §4A condition, plus the count of rows whose asserted identity comes only from position | Phase 1 row-grid audit | **Blocked.** Every current identification is positional by construction, and AC-006 already records the consequence — the same index means a different property on phone than on desktop |
| AC-009 | The mutation trace: the panel held open while a property is added, renamed, reordered and deleted, with AC-002's track/child equality and AC-008's id resolution re-read after each | Phase 4, on the harness `000` repaired | **Blocked.** No harness mutates the schema while the panel is open. The mechanism that makes this dangerous is already recorded — `styles.css:2036` against `:18776` decides the emitted child count by cascade order rather than by the condition |
| AC-010 | Driving delete, rename and reorder and recording the model delta each produced, plus the delta produced by cancelling the confirmation | Phase 4 | **Blocked.** Nothing drives a click, drag or commit in any current harness (`../architecture-findings.md` §3) |
| AC-011 | The owner census: dismissal, scroll and focus owners counted while the panel is open; listener count, node count and host scroll position re-read after close against the pre-open baseline | Phase 1 for the owner counts, Phase 4 for the post-close baseline | **Blocked.** The panel is dismissed by whichever of the two containment systems its producer happened to register with, and that has never been counted |
| AC-012 | Running each of the six single-coordinate substitutions against the finished suite and recording which value assertion each one broke | Phase 4, after AC-001 to AC-011 have their numbers | **Blocked.** A substitution control has nothing to break until the assertions it substitutes into exist |

**Enforcement.** A blank cell is not a `Waived` row and not a soft warning. This phase may not move
`Planned → In Progress` while a cell above is blank for a stage that has already run — that gate is
`000`'s blank-cell checker, and this table is what it reads. A row whose cell is still blank at
closure blocks closure exactly as an `Unmet` row does.

### Citations are selectors, not line numbers (review finding F11)

`styles.css` is 19,261 lines; `000` deletes dead blocks and re-orders the cascade audit, and `001`
edits the file before this phase starts. **Every `styles.css:NNNN` here is a hint with a date on it,
not an address.** All were confirmed correct on 2026-08-29 and are kept because a number that was
true on a known date is evidence about the tree on that date. The durable anchor is the selector.

**Resolve, never trust.** If the command and the line number disagree, the command is right. This
matters more here than anywhere else in the program: this packet's whole argument rests on *which of
two identical selectors comes later*, and a stale line number would silently invert that reading.

| Cited as | Durable anchor | Command that finds it |
|---|---|---|
| `styles.css:2036` / `:18776` | the duplicate `.note-database-container .db-mobile-reorder-controls` pair — the earlier hides it, the **later** sets `display: inline-flex` and wins | `rg -n 'db-mobile-reorder-controls' styles.css` — read the hits in order; the last one is the winner |
| `styles.css:16879` / `:16995` | the duplicate `.is-phone .note-database-container .db-column-manager-row` pair, both declaring 8 tracks in different order; the later wins | `rg -n '\.is-phone \.note-database-container \.db-column-manager-row' styles.css` |
| `styles.css:16966-16976` | `.db-column-drag` set to `display: none` on phone | `rg -n 'db-column-drag' styles.css` |
| `styles.css:11159` | the desktop `.db-column-manager-row` grid declaration | `rg -n -A6 '^\.note-database-container \.db-column-manager-row \{' styles.css` |
| `styles.css:9847` | the `padding` in the panel layout block `001` deletes; the positioner overwrites the rest inline | `rg -n -B8 -A16 'max-width: min\(760px, calc\(100vw - 72px\)\)' styles.css` |
| `column-manager-renderer.ts:134` | the panel's production producer — one of the three positioner call sites passing no options | `rg -n 'positionToolbarPopover' src/views/column-manager-renderer.ts` |
| `db-column-delete-btn` | the one-click delete in the row's primary line | `rg -n 'db-column-delete-btn' src/ styles.css` |

**When a number moves, do not silently correct it.** Record the old number, the new number and the
edit that moved it. The duplicate pairs are this packet's evidence and their *order* is the finding.

### No criterion rests on a pre-repair desktop measurement (review finding F3)

`tools/storybook/verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it
targets the **phone** page. The desktop geometry checks therefore run against a document with no
plugin cascade at all, so every desktop number that harness has produced is structurally irrelevant.

This packet is unusually exposed. AC-001, AC-002 and AC-006 all read desktop values, and the desktop
defect *is* a cascade defect: the 8-children-into-7-tracks result exists only because
`.db-mobile-reorder-controls` is hidden at one line and shown at a later one. **On a page with no
stylesheet the defect cannot appear at all** — the harness would report a clean row and be wrong in
exactly the way 1.3.1 was.

`000` repairs the load. Until it has, **no desktop failing number and no desktop passing number for
this packet is admissible**, and a number recorded before the repair is discarded rather than
re-used. A harness number that disagrees with the `009` live probe is a blocking failure here.

### The `styles.css` lane — when this packet takes it and what it must run to release it

`styles.css` is a single serialized lane (parent `spec.md` §4). This packet is fifth in the
execution order, after `000`, `004`, `005` and `001`.

**Takes the lane** at the start of Phase 3 (*Replace positional tracks with named areas; resolve
both duplicate rule pairs*). Not earlier: Phase 1's audit and Phase 2's decision must be taken
against an unedited stylesheet, or the audit records a tree nobody shipped.

**Holds it** through Phase 3 and Phase 4. No other phase may edit `styles.css` in that window.

**Releases the lane** only when all four of these have happened, in order:

1. **Full recapture.** `npm run screenshots` at both viewports and 3, 12 and 40 properties, then
   `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` proves a
   capture was regenerated after its hand-maintained source list changed and **never opens an
   image**, so it cannot be this step.
3. **`008`'s early replay re-asserts every previously-closed phase** — `000`, `004`, `005` and
   `001` — against the released tree. They closed against a snapshot this packet has just edited,
   and nothing obliges an edit here to preserve their results. A phase that closed earlier and does
   not re-close now blocks this release.
4. **Cascade re-confirmation.** Both duplicate pairs this packet collapses are recorded with their
   computed winner before and after, and any other duplicated selector this packet touched carries
   the same record. A changed winner needs a written disposition.

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

### Harness-dependence audit — 2026-08-31

The pass before this one asked of each criterion whether it was green. This one asks a different
question: **if the value came from the device instead of the harness, would the check still pass —
and could it still fail?**

**No row in the table above was `Met` when this audit ran, so no tick was withdrawn and
`completion_pct` does not move.**

The supplies, by number: **1** `--keyboard-height`, injected by the harness. **2** values
`runtime-vars.css` pins where the runtime computes them. **3** production actions replaced by
stubs. **4** host chrome built by hand. **5** Obsidian's `app.css`, absent except for one `button`
rule copied into `HOST_BARE_CONTROLS` (`verify-placement.mjs:69`).

**10 sound · 2 harness-dependent · 0 unknown.**

**The panel came through better than expected, and the reason is worth stating.** Its row is not an
intrinsic layout the host can push around: `styles.css § .db-column-manager-row` declares
`grid-template-columns: 18px 0 20px 18px minmax(120px, 1fr) auto auto auto`, the phone rules declare
their own lists, and the three trailing actions claim `grid-column: 6/7/8` by name. Track counts,
grid areas and the name-width floor are **written down in the plugin's own stylesheet**, so a host
rule cannot move them. That is exactly the class of geometry this audit is required to leave alone.

What the host does reach is **height**, and the two rows that read one are the two flagged below.

| AC-ID | Class | Supply | On a device |
|---|---|---|---|
| AC-001 | **Harness-dependent** | 5 | Two thresholds in one row. `grid-row-start = 1` for every child is pure plugin grid and sound — the recorded 8-children-into-7-tracks failure is real in both worlds. **`height <= 36px` is not.** The row's height is `max(min-height: 30px, tallest child)`, and its tallest children are `.clickable-icon` buttons, which take `height: var(--input-height)` from `app.css`. The harness gives them no host height, so the row measures shorter here than it ever will on a phone. The recorded 52px is a real grid defect; the 36px threshold is a number this document has never measured under the cascade that decides it. Split the row, or model the host input and button heights before trusting the second half |
| AC-002 | Sound | — | Declared track count against laid-out child count. Both sides are the plugin's: the declared list is in `styles.css`, and `.db-column-drag` is hidden by a plugin rule. The recorded desktop-7-vs-8 and phone-8-vs-7 hold under any host sheet |
| AC-003 | Sound | — | The floors the threshold names — `>= 120px` desktop, `>= 96px` phone — **are literally the `minmax()` floors the plugin declares**, so the criterion cannot be satisfied by a host contribution. **The recorded 22px is harness-scaled and optimistic**: a name track can only fall under its own floor when the fixed and `auto` tracks overflow the container, and the three `auto` tracks are buttons the host pads wider than the harness does. A device squeezes the name harder than 22px, not less. Re-record the number; keep the criterion |
| AC-004 | Sound | — | The subject is whether the positioner clamps. If it clamps, the height is bounded whatever the rows measure; the recorded failure — the inline `maxHeight` taking the full bounds — is plugin behaviour |
| AC-005 | Sound | — | Whether a single click reaches `deleteColumn` with nothing interposed. `deleteColumn` is the plugin's own function, not one of the stubbed actions |
| AC-006 | Sound | — | Remove a condition's child, read the grid area each survivor resolves to. The fix and the failure both live in the explicit `grid-column` claims. A positional list shifting under a hidden child is a plugin property end to end |
| AC-007 | **Harness-dependent** | 5 | "0 primary-line controls extend past the panel content box" and "0 require horizontal scrolling". Whether a control overflows depends on its intrinsic width, and its intrinsic width is content plus `padding: var(--size-4-1) var(--size-4-3)` from the host's `button` rule. **Here the controls are narrower than any device produces, so a row of them fits when it would not fit on a phone.** This is a masked green: the check passes because the harness made the controls small |
| AC-008 | Sound | — | Column-id resolution and a driven delete that removes property X. The delete path is the plugin's |
| AC-009 | Sound | — | Re-runs AC-002's track equality and AC-008's identity after each schema mutation. Both are sound, so the composition is |
| AC-010 | Sound | — | Model deltas for delete, rename and reorder, plus a cancel that leaves the model untouched. All plugin state |
| AC-011 | Sound | — | Owner counts, listener and node counts, and a click reaching the element underneath after close |
| AC-012 | Sound | — | A substitution suite over its own coordinates |

**One stale citation, recorded not repaired.** AC-012's evidence cell cites "`styles.css:16879` vs
`:16995`" as the two fighting phone rules. Those line numbers now land in the timeline block. The
real pair is `.is-phone .note-database-container .db-column-manager-row` declared twice, the later
winning with a `minmax(96px, 1fr)` name track — resolvable with
`rg -n '\.is-phone .*\.db-column-manager-row' styles.css`. This is the citation drift `000`'s goal
predicted for every `styles.css` line number in the program; cite the selector plus the grep.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Work has not started. Every row is `Unmet`. AC-001 to AC-006 carry the failing value measured on the
current tree.

**AC-007 was rewritten under review finding F8.** It previously closed on a decision document
existing. A document is not an outcome, and the criterion would have been satisfied by writing the
argument down whether or not a user could then read a property name. It now closes on the primary
line measured at both viewports: 0 controls past the panel content box, 0 needing horizontal scroll,
the name at its width floor, and anything moved behind an overflow reachable in one interaction.

**AC-007 through AC-012 have no recorded failing number and are `Blocked`, not merely `Unmet`**
(review finding F16). Each is listed in the provenance table above with the artefact that produces
its number and the stage that produces it. A criterion with a blank cell can be satisfied without
proving anything moved, so it blocks closure the same way an unmet one does, and it blocks the stage
that owes it from being reported complete.

Every `styles.css` line number here is a dated hint; the selector plus the command in the citation
table is the address (review finding F11) — and in this packet the *order* of two identical
selectors is the finding, so a stale number would invert the reading. No desktop harness number
recorded before `000` loads `styles.css` on the desktop page is admissible (review finding F3); the
desktop defect is itself a cascade defect and cannot appear on a page with no stylesheet.

AC-005 changes what a single click does and closes on operator device confirmation, not on a
capture. The packet closes when every number has moved from its recorded failing value, every
provenance cell is filled, every proof-tuple cell is filled, N1-N12 hold, the human PNG review is
signed off, and `008`'s replay has re-asserted `000`, `004`, `005` and `001` against the tree this
packet released.
<!-- /ANCHOR:closure -->
