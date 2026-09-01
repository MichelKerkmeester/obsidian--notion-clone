---
title: "Acceptance Criteria: Overlay Placement and Menu Language"
description: "The criteria this packet must satisfy before it may be closed, each carrying its exact measurement, its threshold, the failing value measured on the current tree, and the negative control that proves the check can fail."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "001 overlay placement criteria"
  - "proof tuple"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/001-overlay-placement-and-menu-language"
    last_updated_at: "2026-08-31T00:00:00Z"
    last_updated_by: "harness-dependence-audit"
    recent_action: "Classified 13 criteria for harness dependence; 4 rest on the absent host sheet"
    next_safe_action: "Load Obsidian app.css into the menu census before recording any row number"
    blockers:
      - "000-surface-contract-and-truthful-harness must land first"
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-001"
      parent_session_id: null
    completion_pct: 50
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Overlay Placement and Menu Language

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.
>
> Each is measured on the real renderer at the production mount point, expressed as a number or a
> hit test with a threshold, and recorded here with its failing value from the current tree before
> it is trusted. **A criterion with no recorded failing number is not accepted.** Class names and
> call counts are banned as criteria.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 001-overlay-placement-and-menu-language
**Level:** 3
**Status:** Draft
**Date:** 2026-08-29
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

### The nine dimensions

The four original conditions are necessary and not sufficient. A **temporally stale or semantically
aliased surface** passes all four: the first measurement is real, the baseline fails, deleting the
subject moves the metric, and the harness is still watching a row that no longer means what it did.
This packet is the one most exposed to that class, because a menu row is re-emitted every time the
toolbar re-renders and there are **14 hand-rolled row grammars** against one canonical builder.

Five dimensions close the hole — semantic identity, transition trace, action outcome, resource
ownership, negative-control mutation — and the proof tuple is `producer x runtime branch x
mount/host x environment x transition x semantic outcome x negative control`. A missing coordinate
is a coverage gap even when the number is valid.

### Criteria table

| AC-ID | REQ | Measurement — producer → mount → transition → observation | Threshold | Measured today | NC | Status | Waiver |
|---|---|---|---|---|---|---|---|
| AC-001 (A1) | REQ-001, REQ-003 | Open each censused surface through its production producer; read `getBoundingClientRect()` and compare against the bounds `getVisiblePopoverBounds` returns (`popover-position.ts:271`) | `rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom` at 1440, 1024 and 768 CSS px, sidebar open and closed — 6 configurations per surface | **fails: More tools clips.** Record the overflow in px per axis per configuration before any edit | N1 | Unmet | - |
| AC-002 (A2) | REQ-006 | For every pair of surfaces sharing a role, compare computed `padding`, `border-radius`, `box-shadow`, row `height` and `font-size` at the production mount point | set equality across all five, over every pair in the role — the set of distinct values per property has cardinality 1 | **fails.** Record the distinct-value count per property per role | N2 | Unmet | - |
| AC-003 (A3) | REQ-004 | Build a canonical `createMenuRow` row; measure it inside `.db-owned-menu` and inside a bare `div` on `document.body` | `display`, `align-items`, and the label and value `getBoundingClientRect()` are equal in both parents | **fails: `display` computes `flex` inside `.db-owned-menu` and `block` outside** (`styles.css:258` is the only flex declaration). Record both rects | N3 | Unmet | - |
| AC-004 (A4) | REQ-005 | Click a row declaring `submenu: true`; count new surface roots, resolve the new root's `data-db-surface` role, then apply AC-001's bounds test to it | the submenu node's `data-db-surface` role resolves through the same factory as the parent, **and** A1's bounds test passes for it | **fails: no submenu opens.** `submenu: true` draws a chevron only; record that opening a chevron row produces zero new surface nodes | N4 | Unmet | - |
| AC-005 (A5) | REQ-006 | Open Filter and Sort; read the `role` attribute, Tab from the last focusable, press Escape, read `document.activeElement` | asserted, not inspected: equal `role` attribute; Tab from the last focusable returns to the first in both; Escape closes and returns focus to the trigger in both | **fails:** Filter `role="dialog"` with a trap; Sort has no role and no trap. Record the tab-cycle exit target for each | N5 | Unmet | - |
| AC-006 (A6) | REQ-007 | For each class in each panel's class list, delete that one class and re-measure | for each class in each panel's list, delete it and re-measure width, height, padding, radius, shadow and z-index; every deletion must move a number | **fails: removing `db-filter-panel` from the Sort panel changes its width, max-height and phone clamp.** Record the four values that move | N6 | Unmet | - |
| AC-007 (A7) | REQ-002 | Drive every menu-role surface the census reaches; read `getBoundingClientRect().width` at the production mount point | measured `rect.width <= 320` for every menu-role surface reached in the census | **fails: 3 call sites reach the 520px default.** Record the measured width of Filter, Sort and Column Manager | N7 | Unmet | - |
| AC-008 | REQ-008 | **Rewritten under review finding F8 — it closed on a deletion, not an outcome.** Open all eight panels the block selects (`db-filter-panel`, `db-view-config-panel`, `db-column-manager`, `db-database-popover`, `db-group-popover`, `db-export-popover`, `db-chart-options-popover`, `db-view-tab-popover`) and every positioner-produced surface, through their production producers at the production mount point. Record computed `position`, `top`, `right`, `width`, `max-height` and `padding` at 1440, 1024 and 768 CSS px, sidebar open and closed. Remove the block and the marker. Re-record | every recorded value is identical before and after the removal — **0 of 8 panels and 0 positioner surfaces move a computed value** — **and** all eight still satisfy AC-001's containment test afterwards. If any value moves, the block or the marker is live: the removal is rejected and the moving value is what the replacement rule must declare | *blank — see the F16 provenance table below.* The dead-by-inspection reading stands (`popover-position.ts:88-98` overwrites `position`, `top`, `right`, `width`; `maxHeight` at `126`, `160`, `177`; the `db-anchored-popover` marker matches no rule anywhere in `styles.css`), but inspection is not a measurement and this row may not be accepted on it | N8 | Unmet | - |
| AC-009 | REQ-004 | **Semantic identity.** With a menu open, assert each row resolves to its declared logical action key — not its index, not its label text, not its rectangle. Re-emit the toolbar, then re-resolve every row by the same key | every row resolves to the same action key before and after re-emission, **and driving each row by its key after the re-emission produces the same model delta it produced before** — 0 rows where the key resolves but the outcome differs, 0 rows identified by index or position | *census* — no row carries a logical key today. **14 hand-rolled row grammars** exist against one canonical `createMenuRow`, which has exactly **one** production caller (`owned-menu.ts:109`); `toolbar-renderer.ts` alone hand-rolls 9 row builders, two of them near line-for-line duplicates. The key census is the Phase-1 deliverable | N9 | Unmet | - |
| AC-010 | REQ-001, REQ-005 | **Transition trace.** `open → toolbar re-render → reconcile → observe → action → close`. With a menu open, force the producing renderer to re-emit, then re-run AC-001's bounds test and AC-009's identity resolution, then drive the action | surface id unchanged; bounds test still passes; the action resolves to the same key it did before the re-render | *trace* — no harness re-renders anything while a surface is open. The known mechanism is `updateCellDOM` falling through to `default: this.refresh()` (`database-view.ts:8615-8616`), after which `anchorEl.isConnected` is false and `place()` (`popover-position.ts:100`) no-ops permanently | N10 | Unmet | - |
| AC-011 | REQ-004, REQ-005 | **Action outcome.** Click each menu row and each submenu row; assert the model or render change the row promises — a sort applied, a filter added, a column hidden — not that a node appeared | every driven row produces its asserted model/render delta; 0 rows asserted by node presence alone | *trace* — recorded in `../architecture-findings.md` §3: **nothing drives a click, drag or commit** in any current harness. `submenu: true` is decorative: it draws a chevron and sets ARIA, and the handle has no way to open a nested menu | N11 | Unmet | - |
| AC-012 | REQ-005, REQ-006 | **Resource ownership.** Open a menu, open its submenu, then dismiss with Escape and with an outside click; count dismissal, focus and keyboard owners while open, and listeners plus surface-root nodes after close | exactly 1 dismissal owner across the whole LIFO group; Escape closes the innermost only **and leaves the parent open and still driving its actions**; listener and node counts return to the pre-open baseline, **and a click at the coordinates the surface occupied reaches the element underneath — 0 surfaces leave an inert region behind** | *census* — the only production nested menu is built by hand as a separate body-mounted popover (`column-menu.ts:577`), so parent and child are owned by different mechanisms today. Owner counts are the Phase-1 census deliverable | N12 | Unmet | - |
| AC-013 | REQ-007 | **Negative-control mutation.** Substitute exactly one tuple coordinate — build the row with a hand-rolled grammar instead of `createMenuRow`, mount it in a bare `div`, skip the re-render transition, or resolve it by index instead of key — and rerun | each single substitution fails at least one **value** assertion; a failure caused only by a missing node does not count | no such control exists; every 1.3.1 criterion was a class name or a call count and every one passed | N13 | Unmet | - |

**A4 and A6 are the harness's negative controls.** A4 fails today by producing nothing to measure,
so the check proves it can distinguish. A6 is a deletion test by construction: if removing a class
moves no number, the class is decorative and the criterion has told us so. **AC-013 generalises
both**: deletion is only one of six substitutions, and the other five are the ones a stale or
aliased surface survives.

### Proof-tuple coverage

A blank cell is a coverage gap and blocks closure, even when the criterion's number is valid.

| AC-ID | Producer | Runtime branch | Mount / host | Environment | Transition | Semantic outcome | Negative control |
|---|---|---|---|---|---|---|---|
| AC-001 | production | compact, bespoke, no-option | declared mount | 1440/1024/768, sidebar open + closed | static read | rect inside bounds | N1 |
| AC-002 | production | all in role | declared mount | both themes | static read | role parity | N2 |
| AC-003 | `createMenuRow` | n/a | `.db-owned-menu` + bare `div` | both themes | static read | layout travels with row | N3 |
| AC-004 | production | submenu branch | declared mount | desktop | open → open nested | nested surface exists and is placed | N4 |
| AC-005 | production | panel role | declared mount | desktop | open → Tab → Escape | focus returns to trigger | N5 |
| AC-006 | production | panel role | declared mount | desktop + phone | class deleted | a number moves | N6 |
| AC-007 | production | no-option branch | declared mount | desktop | open | width within role | N7 |
| AC-008 | n/a (cascade) | n/a | n/a | n/a | census + recapture | block dead or live | N8 |
| AC-009 | production | all row grammars | declared mount | both themes | re-emit | action key stable | N9 |
| AC-010 | production | all | declared mount | both themes | refresh while open | identity + bounds survive | N10 |
| AC-011 | production | all rows + submenu rows | declared mount | desktop + phone | open → action | model/render delta | N11 |
| AC-012 | production | nested | declared mount | desktop + phone | open → nested → dismiss | one owner, zero leaks | N12 |
| AC-013 | substituted | substituted | substituted | substituted | substituted | assertion fails | N13 |

### Negative controls

This packet's `checklist.md` registers its controls as prose (A4 and A6). The register below is the
numbered form; add it to `checklist.md` when its verification protocol is next revised.

| # | Control | What it proves |
|---|---|---|
| N1 | Shrinking the harness viewport below a surface's width reproduces the recorded overflow | AC-001 measures containment, not a fixed rectangle |
| N2 | Reverting one role's sizing to a bespoke number raises its distinct-value count above 1 | AC-002 measures parity, not presence |
| N3 | Removing `styles.css:258`'s flex declaration reproduces `display: block` outside the menu | AC-003 measures the container-keyed grammar |
| N4 | A chevron row that opens nothing produces zero new surface roots | AC-004 counts surfaces, not chevrons |
| N5 | Removing Filter's focus trap makes Tab leave the panel | AC-005 asserts behaviour, not the attribute |
| N6 | Removing `db-filter-panel` from Sort moves width, max-height and the phone clamp | AC-006 is a deletion test by construction |
| N7 | Restoring the `preferredWidth ?? 520` fallback (`popover-position.ts:74`) reproduces a 520px menu | AC-007 measures the reachable default |
| N8 | Restoring the deleted panel layout block changes no computed value at any real mount | The block was dead |
| N9 | Resolving a row by index instead of key mis-identifies it after a re-emission | AC-009 asserts identity, not position |
| N10 | Forcing `refresh()` while a menu is open reproduces the dead `place()` | AC-010 observes the transition |
| N11 | Stubbing the action handler makes the driven row's assertion fail | AC-011 asserts an outcome |
| N12 | Registering a second dismissal owner for a nested menu fails the owner count | AC-012 counts owners |
| N13 | Each of the six single-coordinate substitutions fails a value assertion | The suite is connected to all six coordinates |

### F8 audit — every criterion re-tested for the "passes on today's broken tree" shape

Review finding F8 named `AC-008` here. The audit below re-reads every other row for the same four
shapes: closing on a **thing existing**, on a **deletion**, on a **classification**, or on a
**count**. `../architecture-findings.md` §9 already bans class names and call counts; F8 is the
reminder that a criterion can be numeric and still be about a mechanism rather than a result.

| AC-ID | Shape found | Disposition |
|---|---|---|
| AC-001 | Outcome. A rectangle compared with the bounds the user can see | Kept unchanged |
| AC-002 | Outcome. Set equality over five computed values | Kept unchanged |
| AC-003 | Outcome. Computed layout compared across two parents | Kept unchanged |
| AC-004 | Mixed. `data-db-surface` role resolution is an attribute read; the bounds test beside it is an outcome | Kept, with a bound: the attribute half **cannot close this row on its own**. AC-004 closes only when at least one submenu row has also been driven to its asserted model delta under AC-011 |
| AC-005 | Mixed. `role` attribute equality is an attribute read; the Tab cycle and the focus return are outcomes | Kept. The threshold already says *asserted, not inspected* — the two measured behaviours are the closing condition and the attribute equality is an input to them |
| AC-006 | Outcome. A deletion test whose pass condition is that a **number moves** | Kept unchanged |
| AC-007 | Outcome. A measured width against a threshold | Kept unchanged |
| AC-008 | **Deletion.** Closed on a block being removed and a marker being gone | **Rewritten.** Now closes on 8 panels and every positioner surface reporting an identical computed geometry across the removal, plus containment afterwards |
| AC-009 | **Count.** "0 rows identified by index" is a property of the test suite, not of the product | **Threshold extended.** Identity now closes on the driven outcome: after a re-emission, the row's key must produce the same model delta it produced before |
| AC-010 | Outcome, once AC-009's extension lands — the transition is re-run against a driven action | Kept |
| AC-011 | Outcome. A model or render delta per driven row | Kept unchanged |
| AC-012 | **Count.** Owner counts are countable mechanism | **Threshold extended.** Adds the user-visible consequence: the parent stays interactive after an inner Escape, and the vacated region is clickable again after close |
| AC-013 | Substitution control. Outcome-shaped by construction — each substitution must fail a **value** assertion | Kept unchanged |

**Rule going forward.** No row in this table may be marked `Met` on the strength of a class being
present, a call site being migrated, a block being deleted, or a population being classified. Those
are inputs. The closing evidence is a measured value that moved, or a driven action that landed.

### Failing-number provenance — the blank cells (review finding F16)

`../architecture-findings.md` §9 condition 3 makes a criterion invalid until it has been
**demonstrated to fail on the current tree, with the failing number recorded**. The rows below are
marked *census* or *trace* and their `Measured today` cell holds a source fact, not a number. Until
the number is there they are unenforceable prose: a passing measurement would prove only that a
value sits inside a threshold, never that it moved.

**No number below may be invented, estimated, or carried across from another packet.** The cell is
filled by running the named producer and pasting what it printed.

| AC-ID | What produces the failing number | Stage of this phase that produces it | State until the cell is filled |
|---|---|---|---|
| AC-008 | The before/after computed-geometry diff over the eight panel selectors and every positioner surface, at 3 widths x 2 sidebar states, run in the browser harness | Phase 1 census records the *before* table; Phase 5 records the *after* table in the same run | **Blocked.** Not `Unmet` — unenforceable. The removal in Phase 5 may not be made until the *before* table exists |
| AC-009 | The row-key census: every production row driven, its declared logical action key recorded, the toolbar re-emitted, every row re-resolved. Produces a count of rows that fail to re-resolve and a count identified only by position | Phase 1, extended by Phase 3 once `createMenuRow` carries a key | **Blocked.** Phase 3 may not retire a hand-rolled grammar before the failing count for that grammar is recorded |
| AC-010 | The transition trace: a menu held open while its producing renderer is forced to re-emit, with AC-001's bounds and AC-009's identity re-read on the far side. Produces the surviving-surface count and the post-re-emission bounds | Phase 6, on the harness `000` repaired — not before | **Blocked.** No transition number exists today because no harness re-renders while a surface is open |
| AC-011 | Driving every menu row and every submenu row and recording which produced its asserted model or render delta. Produces the delta-per-row table and the count of rows asserted by node presence alone | Phase 6 | **Blocked.** Nothing drives a click, drag or commit in any current harness (`../architecture-findings.md` §3) |
| AC-012 | The owner census: dismissal, focus and keyboard owners counted while a menu and its submenu are open, and listener plus node counts re-read after close against the pre-open baseline | Phase 1 for the owner counts, Phase 6 for the post-close baseline | **Blocked.** Parent and child are owned by different mechanisms today (`column-menu.ts:577` builds the only production nested menu by hand) |
| AC-013 | Running each of the six single-coordinate substitutions against the finished suite and recording which value assertion each one broke | Phase 6, after AC-001 to AC-012 have their numbers | **Blocked.** A substitution control has nothing to break until the assertions it substitutes into exist |

**Enforcement.** A blank cell is not a `Waived` row and not a soft warning. This phase may not move
`Planned → In Progress` while a cell above is blank for a stage that has already run — that gate is
`000`'s blank-cell checker, and this table is what it reads. A row whose cell is still blank at
closure blocks closure exactly as an `Unmet` row does.

### Citations are selectors, not line numbers (review finding F11)

`styles.css` is 19,261 lines, `000` deletes dead blocks and re-orders the cascade audit before this
phase starts, and this phase then edits the file itself. **Every `styles.css:NNNN` in this packet is
a hint with a date on it, not an address.** The line numbers were all confirmed correct on
2026-08-29 and are kept because a number that was true on a known date is evidence about the tree on
that date. The durable anchor is the selector or the symbol.

**Resolve, never trust.** If the command below and the line number disagree, the command is right.

| Cited as | Durable anchor | Command that finds it |
|---|---|---|
| `styles.css:258` | `.db-owned-menu .db-menu-item` — the only `display: flex` declaration for a menu row anywhere | `rg -n '^\.db-owned-menu \.db-menu-item \{' styles.css` |
| `styles.css:205` | `.db-menu-item` — colour and padding, no layout | `rg -n '^\.db-menu-item \{' styles.css` |
| `styles.css:9829-9852` | the eight-selector panel layout block, opening on `.note-database-container .db-filter-panel,` and closing after `.note-database-container .db-view-tab-popover` | `rg -n -B8 -A16 'max-width: min\(760px, calc\(100vw - 72px\)\)' styles.css` |
| `styles.css:17206-17215` | the phone `max-height` clamp list that omits `db-sort-panel` | `rg -n -A10 '^\.is-phone \.note-database-container \.db-filter-panel,' styles.css` |
| `styles.css:5071-5073` | the 292px column-menu sub-popover, the one menu width that reads correctly | `rg -n 'width: 292px' styles.css` |
| `db-anchored-popover` (no line — no rule exists) | the dead marker every positioner call adds | `rg -n 'db-anchored-popover' styles.css` returns **no match, exit 1**; `rg -n 'db-anchored-popover' src/` finds the writer |
| `popover-position.ts:47-51` | the compact preset object, `preferredWidth: 292` | `rg -n 'preferredWidth' src/views/popover-position.ts` |
| `popover-position.ts:73-74` | the `preferredWidth ?? 520` default and the `maxWidth` that mirrors it | `rg -n '520' src/views/popover-position.ts` |
| `popover-position.ts:88-98`, `:126`, `:160`, `:177` | the inline writes that overwrite the panel block | `rg -n -e 'style\.' -e maxHeight src/views/popover-position.ts` |
| `popover-position.ts:100` | the `place()` early return on a disconnected anchor | `rg -n 'isConnected' src/views/popover-position.ts` |
| `owned-menu.ts:109` | the sole production caller of `createMenuRow` | `rg -n 'createMenuRow' src/` |
| `column-menu.ts:577`, `:598` | the hand-built body-mounted submenu, the only real nested menu in production | `rg -n -e subpopover -e submenu src/views/column-menu.ts` |
| `database-view.ts:8615-8616` | the `default: this.refresh()` fall-through that strands the anchor | `rg -n 'updateCellDOM' src/views/database-view.ts` then read to the switch default |
| `verify-placement.mjs:164-171` | the assertion that certifies the 520px default | `rg -n 'widthless caller' tools/storybook/verify-placement.mjs` |

**When a number moves, do not silently correct it.** Record the old number, the new number and the
edit that moved it, so the packet keeps its history of what the tree looked like when the criterion
was written.

### No criterion rests on a pre-repair desktop measurement (review finding F3)

`tools/storybook/verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it
targets the **phone** page. The desktop geometry checks therefore run against a document with no
plugin cascade at all. Every desktop number this harness has ever produced is structurally
irrelevant to what the user sees, in the same way the `.note-database-container` wrapper made the
Storybook catalogue incapable of showing the token defect.

`000` repairs that load. Until it has, **no row in this packet may be closed on a desktop harness
measurement**, and that reaches most of them: AC-001 measures at 1440, 1024 and 768; AC-002, AC-004,
AC-005, AC-006 and AC-007 are all desktop reads.

The order this imposes:

1. `009` stands up the live probe first, so `000`'s harness claims have an instrument outside
   `000`'s own reach to be checked against.
2. `000` loads `styles.css` on the desktop page and inverts `verify-placement.mjs:164-171`.
3. Only then may this packet record a desktop failing number. A number recorded before step 2 is
   discarded, not re-used — it was measured in a document the product never renders in.

A desktop harness number and a `009` live number that disagree is a blocking failure for this
packet, not a curiosity to note.

### The `styles.css` lane — when this packet takes it and what it must run to release it

`styles.css` is a single serialized lane (parent `spec.md` §4). This packet is fourth in the
execution order, after `000`, `004` and `005`.

**Takes the lane** at the start of Phase 5 (*Implement source and `styles.css`, including both
deletions*). It may not be taken earlier: Phases 1 to 4 are census, contract and decision work and
must complete against an unedited stylesheet, or the census records a tree nobody shipped.

**Holds it** through Phase 5 and Phase 6. No other phase may edit `styles.css` in that window.

**Releases the lane** only when all four of these have happened, in order:

1. **Full recapture.** `npm run screenshots` across the four widths and both sidebar states this
   packet names, then `npm run screenshots:verify`.
2. **Human capture review, signed off.** A named person opens every changed PNG and records the
   sign-off in `checklist.md`. `screenshots:verify` proves a capture was regenerated after its
   hand-maintained source list changed; **it never opens an image**, so it cannot be this step.
3. **`008`'s early replay re-asserts every previously-closed phase.** `000`, `004` and `005` closed
   against a stylesheet snapshot this packet has just edited, and nothing obliges an edit here to
   preserve their results — 87 selectors are declared more than once and 124 property values are
   already overridden by a later block, with no compiler warning when a new one joins them. The
   replay re-runs their evidence against the released tree. A phase that closed earlier and does not
   re-close now blocks this release.
4. **Cascade re-confirmation** per the parent's `any → 008` handoff row: every selector this packet
   touched that is declared more than once has its computed winner recorded, and a winner that
   changed carries a written disposition.

**If the lane is released and a later phase's edit reverses something here**, the same replay is
what catches it — which is why step 3 runs at every handoff and not once at the end.

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
`completion_pct` does not move.** What is recorded instead is which criteria are compromised
*before* anyone runs them.

The supplies, by number: **1** `--keyboard-height`, injected by the harness and set by nothing in
`src/`. **2** values `runtime-vars.css` pins where the runtime computes them. **3** production
actions replaced by no-op or counting stubs. **4** host chrome built by hand. **5** Obsidian's
`app.css`, absent except for one `button` rule copied verbatim into `HOST_BARE_CONTROLS`
(`verify-placement.mjs:69`).

**9 sound · 4 harness-dependent · 0 unknown.**

**This packet holds the third case, and it is the `justify-content` defect one property over.**
`createMenuRow` builds a **`<button>`** (`menu-row.ts:92`). Obsidian's `app.css` declares
`display: inline-flex`, `align-items: center`, `justify-content: center`, `padding`,
`border-radius`, `height` and `font-size` on every bare button. The plugin's row rule outranks that
type selector on every property **both** name — and on the properties only the host names, the
host's value applies uncontested. A row measured in a page built from `styles.css` alone is measured
against Chromium defaults at exactly the mounts where the plugin declares nothing.

| AC-ID | Class | Supply | On a device |
|---|---|---|---|
| AC-001 | Sound | — | Containment is relational: the rect and the bounds are both read from the same DOM, and the plugin owns the clamp. The harness's hand-built chrome sets the scale, not the relation, and `contain: strict` is reproduced verbatim from `app.css` (`verify-placement.mjs:166`). A surface that escapes its bounds escapes them anywhere |
| AC-002 | **Harness-dependent** | 5 | Set equality over computed `padding`, `border-radius`, `box-shadow`, row `height` and `font-size`. **Four of those five are declared by the host's `button` rule**, and menu rows are buttons. Here, a role-mate the plugin never styled reads Chromium defaults, the set has cardinality > 1, and the row goes red for the right reason. **On a device the host supplies one identical value to every unstyled role-mate, the set collapses to cardinality 1, and the criterion passes with the defect fully present.** This is a masked green, not a wrong number |
| AC-003 | **Harness-dependent** | 5 | The sharpest instance. The recorded value is "`display` computes `flex` inside `.db-owned-menu` and `block` outside". `block` is the default for a bare element — **the row is a `<button>`, so a device computes `inline-flex` there**, and `align-items` computes `center` on both sides because the host declares it. Of the two properties the threshold names, **one can no longer differ on a device at all**, and the other differs between two values neither of which is `block`. The recorded failing number is not the product's and the threshold is half-masked |
| AC-004 | Sound | — | A submenu either opens or does not. Node count, role resolution and the bounds test are all the plugin's |
| AC-005 | Sound | — | `role` attribute, tab cycle and `document.activeElement`. Attributes and focus order the plugin sets |
| AC-006 | Sound | — | Panels are containers, not bare controls, so the host's `button` rule does not reach the measured properties. Deleting a class and watching a number move is a differential on one document |
| AC-007 | Sound | — | Menu width is declared outright by the plugin — the 292px that reads correctly and the 520px default that does not. The host declares no width on a plugin class |
| AC-008 | Sound | — | `position`, `top`, `right`, `width` and `maxHeight` are written inline by the positioner; `padding` is read on panels, not on rows |
| AC-009 | **Harness-dependent** | 3 | The identity half — every row resolves to its declared action key across a re-emission — is plugin-internal and sound. The threshold conjoins it with "**driving each row by its key produces the same model delta it produced before**", and in the harness the drivable actions are stubs (`verify-placement.mjs:2434-2437`, `:3398-3401`). A model delta asserted against `() => {}` is the `editFileName` counting-stub failure. Split the row, or wire real handlers |
| AC-010 | Sound | — | Surface id, the bounds test and key resolution across a forced re-emit are all the plugin's. Inherits AC-009's outcome exposure only where it re-runs it |
| AC-011 | **Harness-dependent** | 3 | "A sort applied, a filter added, a column hidden" are model changes, and the harness has no model to change. The criterion is written correctly — it bans asserting on node presence — and is unrunnable against stubs |
| AC-012 | Sound | — | Owner counts, LIFO dismissal, listener and node counts, and a click reaching the element underneath. All plugin-owned |
| AC-013 | Sound | — | A substitution suite. One coordinate — "mount it in a bare `div`" — reads AC-003's observable and would stop failing on a device, but that turns the row **red**, not green: a substitution that no longer fails breaches the threshold loudly. A phantom red announces itself; a masked green does not |

**What would settle AC-002 and AC-003.** Load Obsidian's real `app.css` into the menu census the way
`verify-placement.mjs` already loads `HOST_BARE_CONTROLS`, and re-record both rows before either is
trusted. The single `button` rule the harness models today is the right idea applied to one
instrument: `token-census.mjs:53` loads `styles.css` alone and `surface-census.mjs:66-68` adds only
theme and runtime vars, so a number from either is not comparable with a number from
`verify-placement.mjs` for the same surface.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Work has not started. Every row is `Unmet`. AC-001 to AC-007 carry the failing value measured on the
current tree.

**AC-008 was rewritten under review finding F8.** It previously closed on a deletion — the dead panel
layout block and the `db-anchored-popover` marker being gone. A deletion is not an outcome, and a
criterion that closes on one would have been satisfied whether or not the user saw a different
result. It now closes on a measured consequence: eight panels and every positioner surface reporting
an identical computed geometry across the removal, and still passing containment afterwards.

**AC-008 through AC-013 have no recorded failing number and are `Blocked`, not merely `Unmet`**
(review finding F16). Each is listed in the provenance table above with the artefact that produces
its number and the stage that produces it. A criterion with a blank cell can be satisfied without
proving anything moved, so it blocks closure the same way an unmet one does, and it blocks the stage
that owes it from being reported complete.

Every `styles.css` line number in this packet is a dated hint; the selector plus the command in the
citation table is the address (review finding F11). No desktop harness number recorded before `000`
loads `styles.css` on the desktop page is admissible (review finding F3).

The packet closes when every number has moved from its recorded failing value, every provenance cell
is filled, every proof-tuple cell is filled, N1-N13 hold, the human PNG review is signed off, and
`008`'s replay has re-asserted `000`, `004` and `005` against the tree this packet released.
<!-- /ANCHOR:closure -->
