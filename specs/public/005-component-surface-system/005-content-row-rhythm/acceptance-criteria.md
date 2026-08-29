---
title: "Acceptance Criteria: Content Row Rhythm and Header Rail"
description: "The criteria this packet must satisfy before it may be closed, each carrying its exact measurement, its threshold, its census provenance, and the negative control that proves the check can fail."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "005 row rhythm criteria"
  - "proof tuple"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/005-content-row-rhythm"
    last_updated_at: "2026-08-29T18:00:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Applied review findings F3, F8, F11 and F16"
    next_safe_action: "Widen the harness, then run the 84-state census"
    blockers:
      - "000-surface-contract-and-truthful-harness honest harness must land first"
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-005"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Content Row Rhythm and Header Rail

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.
>
> Each is a number measured on the real renderer at the production mount point. Rows marked *census
> records it* carry a static source fact today and take their failing number from the Stage-2
> artefact **before** the criterion is accepted — the same rule `000` applies to its own table.
>
> **Banned.** No criterion may count call sites, assert a class is present, or assert a rule count.
> Every one of 1.3.1's criteria was of that form and every one passed while the UI stayed broken.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-content-row-rhythm
**Level:** 3
**Status:** Draft
**Date:** 2026-08-29
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

### The nine dimensions

The four original conditions are necessary and not sufficient. This packet's aliasing risk is the
**ordinal**: a row is currently reachable only as *the fourth row*, and a chip only as *the second
chip*. Both are re-emitted on every data change and every filter edit, so a measurement taken before
a reflow and asserted after one is measuring a different logical thing while every number still
looks plausible.

Five dimensions close the hole — semantic identity (row = record id, chip = filter clause),
transition trace (wrap toggle, view switch, data change, width change **while** the measurement is
live), action outcome (removing a chip removes its filter), resource ownership (one scroll owner for
the rail), negative-control mutation. The proof tuple is `producer x runtime branch x mount/host x
environment x transition x semantic outcome x negative control`.

### Criteria table

| AC-ID | REQ | Measurement — producer → mount → transition → observation | Today | Target | NC | Status | Waiver |
|---|---|---|---|---|---|---|---|
| AC-001 (A1) | REQ-002 | Render 20 list rows with wrapping off through the production renderer; read each row's `getBoundingClientRect().height`; compute the standard deviation | *census records it* — No row height is declared anywhere; `min-height: 44px` is a floor (`styles.css:9602`). Census records the deviation | 0 | N3 | Unmet | - |
| AC-002 (A2) | REQ-002 | With wrapping on, read each row height and divide by the declared line box; record the residual | *census records it* — No rhythm unit exists; `--db-font-*-line-height` are ratios, not lengths (`styles.css:41-51`). Census records the residuals | residual 0 | N3 | Unmet | - |
| AC-003 (A3) | REQ-005 | For every descendant of `.db-header`, compare `getBoundingClientRect().right` with the header's content-box right, at 4 widths, in all seven view types | *census records it* — The rail's only containment is `overflow-x: auto` on `.db-active-view-controls-scroll` (`styles.css:1338`); the clear button and the rail box itself are outside it. Census records the overflow in px | 0 | N4 | Unmet | - |
| AC-004 (A4) | REQ-003 | Overfill the rail; read `scrollWidth`, `clientWidth` and the parent's width before and after | *census records it* — The renderer already computes exactly this at `active-view-controls-renderer.ts:153`; nothing asserts it. Census records both numbers | true, parent width delta 0 | N6 | Unmet | - |
| AC-005 (A5) | REQ-006, REQ-007 | Switch view type through the production affordance; read the header's height before and after each switch | *census records it* — `--db-header-height` is never assigned in `src/`; the only assignment is `runtime-vars.css:24`. Census records the per-view heights | <= 8px | N7 | Unmet | - |
| AC-006 (A6) | REQ-003 | **Rewritten under review finding F8 — "resolve each declaration and classify it" is a classification task, and its target of "0 unclassified" is satisfied by finishing the spreadsheet.** At each of 320, 402, 768 and 1440 CSS px, in all seven view types, find every element that computes an intrinsic `max-content` width at runtime and compare its `getBoundingClientRect()` left and right edges with its nearest scrolling ancestor's content box. Where no scrolling ancestor exists, compare against the nearest ancestor with a bounded width. Then overfill each such container and re-read the container's own width | **0 elements paint outside the content box of the container that bounds them**, at every width, in every view type — and for each container that legitimately overflows, `scrollWidth > clientWidth` with the **parent's width delta 0** (it scrolls rather than grows). The static count of 31 declarations is the *input* that makes the runtime sweep exhaustive; it is not the measurement | **31 declarations** on the current tree, from `rg -c 'width:\s*max-content' styles.css` — a static count, not a measurement. **The per-element overflow in px is blank; see the F16 provenance table below.** No element has ever been resolved at runtime, because `verify-placement.mjs` renders no view at all | N8 | Unmet | - |
| AC-007 (A7) | REQ-001, REQ-004 | Delete a chip from the rail and re-measure; delete a field from a row and re-measure; then scan every declaration this spec touches for one a later block beats | No such check exists; per `000` REQ-006 an assertion that survives deletion is theatre. Inert declarations today: `.db-list-field-wrap` `width` beaten by `flex-basis` (`9719` vs `9703`); `mask-image` set at `18577`, unset at `19096` | both move; and for every declaration this spec touches, mutating its value moves a measured number at some width — **0 declarations survive the mutation test unchanged** | N1, N2 | Unmet | - |
| AC-008 | REQ-008 | **Rewritten under review finding F8 — "the harness can see the widths" closes on capability existing.** Prove the harness is measuring the shipped cascade by reading a value that cannot exist without it: on **both** the desktop page and the phone page, at 320, 402, 768 and 1440, render a production list view and read `.db-list-row`'s computed `min-height` and a `--db-*` token that only `styles.css` declares | on both pages at all four widths, `.db-list-row` computes `min-height: 44px` — the value only `styles.css` supplies — and the probed `--db-*` token resolves non-empty. **0 pages and 0 widths where the probe returns the user-agent default or an empty token.** A harness that cannot fail this check cannot produce an admissible number for any other criterion here | *blank — see the F16 provenance table below.* `tools/screenshots/capture.mjs:71-72` defines exactly two devices, 1440 desktop and 402 mobile; `tools/storybook/verify-placement.mjs` renders no view at all and loads `styles.css` on the phone page only (`verify-placement.mjs:220`), so the desktop probe cannot even be attempted today | N9 | Unmet | - |
| AC-009 | REQ-001 | **Semantic identity.** Every asserted row resolves to its record id and every asserted chip to its filter clause, read from the model — never by `nth-child`, ordinal, or label text. Re-resolve after a sort change and after a filter edit | every asserted row and chip maps to the id or clause it claims, before and after a reflow, **and driving the remove control on the chip asserted to be clause C removes clause C from the model, and opening the row asserted to be record R opens R — 0 misattributed actions**; 0 assertions resolved by ordinal | *census* — nothing in the current harness identifies a row or a chip at all, because `verify-placement.mjs` renders no view. The id-to-node map is the Stage-2 census deliverable | N10 | Unmet | - |
| AC-010 | REQ-002, REQ-003 | **Transition trace.** `render → measure → toggle wrap / switch view / change data / change width → reconcile → re-measure → act → observe`. Re-run AC-001 through AC-005 after each transition rather than once at load | every criterion's number holds after every transition; 0 numbers taken only at first paint | *trace* — every current measurement is a single static read. The header rail's own defect class is a reflow defect: the rail grows instead of scrolling only once its content exceeds the width, which a fixed-width single read never reaches | N11 | Unmet | - |
| AC-011 | REQ-004 | **Action outcome.** Click a chip's remove control and assert the filter clause left the model; drag the rail and assert `scrollLeft` moved with the parent width unchanged; open a row and assert the record it opened is the record its id claims | every driven action produces its asserted model or scroll delta; 0 actions asserted by node presence alone | *trace* — recorded in `../architecture-findings.md` §3: **nothing drives a click, drag or commit** in any current harness | N12 | Unmet | - |
| AC-012 | REQ-003 | **Resource ownership.** Assert exactly one element in the header owns horizontal scrolling, that no ancestor of it also scrolls, and that row listeners are released when a row is re-emitted | exactly 1 scrolling owner in the header subtree; listener count after 20 re-emissions equals the count after 1; **and a horizontal drag in the header moves exactly one `scrollLeft` while the header's own width delta stays 0 — 0 nested scrollers competing for the same gesture** | *census* — the rail's only containment today is `overflow-x: auto` on `.db-active-view-controls-scroll` (`styles.css:1338`), with the clear button and the rail box outside it, so the scroll owner and the overflow source are different elements. Owner counts are the Stage-2 census deliverable | N13 | Unmet | - |
| AC-013 | REQ-001 | **Negative-control mutation.** Substitute exactly one tuple coordinate — measure at 1440 only, resolve a row by ordinal, skip the reflow transition, render without `styles.css`, or restore one inert declaration — and rerun | each single substitution fails at least one **value** assertion; a failure caused only by a missing node does not count | no such control exists. The harness's own blind spot proves the need: `verify-placement.mjs` loads `styles.css` on the phone page only (`verify-placement.mjs:220`), so the desktop page is already running a "render without the stylesheet" substitution and reporting green | N14 | Unmet | - |

### F8 audit — every criterion re-tested for the "passes on today's broken tree" shape

Review finding F8 named `005/AC-006` directly. The audit below re-reads every other row here for the
same four shapes — closing on a **thing existing**, on a **deletion**, on a **classification**, or on
a **count**.

| AC-ID | Shape found | Disposition |
|---|---|---|
| AC-001 | Outcome. A standard deviation over measured row heights | Kept unchanged |
| AC-002 | Outcome. A residual against a declared line box | Kept unchanged |
| AC-003 | Outcome. Measured right edges against the header's content box | Kept unchanged |
| AC-004 | Outcome. `scrollWidth` against `clientWidth`, with the parent's width delta | Kept unchanged |
| AC-005 | Outcome. A measured header height across a driven view switch | Kept unchanged |
| AC-006 | **Classification.** "Resolve the element and walk its ancestors" with a target of "0 unclassified" — finishing the spreadsheet satisfies it | **Rewritten.** Now closes on what the user sees: 0 elements painting outside the container that bounds them, at 4 widths x 7 view types, and every legitimate overflow scrolling rather than growing. The 31 is preserved as the static input |
| AC-007 | **Count**, in part — "0 inert declarations" counts declarations | **Threshold reworded** to the measurement it meant: 0 declarations survive the mutation test unchanged. The pass condition is that a number moves, per declaration |
| AC-008 | **Thing existing.** "The harness can see the widths this spec is about" is a capability claim | **Rewritten.** Now closes on a stylesheet-dependent probe returning a non-default value on **both** harness pages at all four widths. A harness that cannot fail this cannot produce an admissible number for anything else here |
| AC-009 | **Count.** "0 assertions resolved by ordinal" is a property of the test suite | **Threshold extended.** Identity now closes on the driven outcome: the chip asserted to be clause C removes clause C, the row asserted to be record R opens R |
| AC-010 | Outcome. Every criterion's number re-taken after each transition | Kept unchanged |
| AC-011 | Outcome. A model or scroll delta per driven action | Kept unchanged |
| AC-012 | **Count.** Owner counts are countable mechanism | **Threshold extended.** Adds the user-visible consequence: one drag moves exactly one `scrollLeft` and the header's own width does not change |
| AC-013 | Substitution control. Outcome-shaped by construction — each substitution must fail a **value** assertion | Kept unchanged |

**Rule going forward.** No row here may be marked `Met` because 31 declarations were classified, a
rail block was collapsed, a harness gained a device profile, or a census artefact was produced. Those
are inputs. The closing evidence is a measured value that moved, or a driven action that landed on
the row or clause it claimed.

### Failing-number provenance — the blank cells (review finding F16)

`../architecture-findings.md` §9 condition 3 makes a criterion invalid until it has been
**demonstrated to fail on the current tree, with the failing number recorded**. **Every criterion in
this packet has a blank cell** — AC-001 to AC-005 say *census records it*, AC-006 and AC-007 hold
static source facts rather than runtime measurements, and AC-008 to AC-013 are marked *trace* or
*census*. That is not an oversight: `verify-placement.mjs` renders no view at all, so nothing in this
packet has ever been measured.

Until the numbers are there these are unenforceable prose: a passing measurement would prove only
that a value sits inside a threshold, never that it moved.

**No number below may be invented, estimated, or carried across from another packet.** The cell is
filled by running the named producer and pasting what it printed.

| AC-ID | What produces the failing number | Stage of this phase that produces it | State until the cell is filled |
|---|---|---|---|
| AC-001 | The census script's row-height histogram over a 20-row list fixture with wrapping off, and its standard deviation | Stage 2 (the sizing census), 84 states | **Blocked.** No row height is declared anywhere and `min-height: 44px` is only a floor, so the spread has never been measured |
| AC-002 | The same histogram with wrapping on, divided by the declared line box, giving the per-row residual | Stage 2 | **Blocked.** No rhythm unit exists; `--db-font-*-line-height` are ratios, not lengths |
| AC-003 | The census sweep recording, per view type and width, every `.db-header` descendant whose right edge exceeds the header's content box, and by how many px | Stage 2 | **Blocked.** This is also the number that settles which of the two contradictory readings of the rail defect is right |
| AC-004 | Overfilling the rail and recording `scrollWidth`, `clientWidth` and the parent's width before and after | Stage 2 | **Blocked.** The renderer already computes exactly this at `active-view-controls-renderer.ts:153` and nothing asserts it |
| AC-005 | Driving a view switch through the production affordance and reading the header's height before and after, per view type | Stage 2 | **Blocked, and gated on Stage 1.** `--db-header-height` is never assigned in `src/`; the only assignment is `runtime-vars.css:24`, so a capture-derived number would be measuring the harness's stub |
| AC-006 | The runtime sweep: every element computing an intrinsic `max-content` width, its rect against its bounding container's content box, at 4 widths x 7 view types — plus the overfill re-read of each container's own width | Stage 2, using the view rendering Stage 1 adds | **Blocked.** The 31 is a static `rg -c` count. No element has been resolved at runtime because the harness renders no view |
| AC-007 | Per declaration this spec touches: mutate its value and record which measured number moved, at which width | Stage 2 for the *before*, Stage 6 for the *after* | **Blocked.** Two inert declarations are known by reading (`.db-list-field-wrap` `width` beaten by `flex-basis`, `mask-image` set then unset) but neither has been shown inert by measurement |
| AC-008 | The stylesheet-dependent probe on both harness pages at all four widths: `.db-list-row` computed `min-height` and a `--db-*` token | Stage 1 (widen the harness), which is a gate | **Blocked, and blocking everything.** Until this passes, no other number in this packet is admissible — a desktop page with no stylesheet returns the user-agent default for every one of them |
| AC-009 | The id-to-node map: every asserted row joined to its record id and every chip to its filter clause, re-resolved after a sort change and a filter edit | Stage 2 | **Blocked.** Nothing in the current harness identifies a row or a chip at all |
| AC-010 | Re-running AC-001 to AC-005 after each of: wrap toggle, view switch, data change, width change — rather than once at load | Stage 6 (re-run the census unchanged) | **Blocked.** Every current measurement is a single static read, and the rail's defect only appears once content exceeds the width |
| AC-011 | Driving a chip removal, a rail drag and a row open, and recording the model or scroll delta each produced | Stage 6 | **Blocked.** Nothing drives a click, drag or commit in any current harness (`../architecture-findings.md` §3) |
| AC-012 | Counting scrolling owners in the header subtree, and the listener count after 1 and after 20 row re-emissions | Stage 2 for the owner count, Stage 6 for the listener count | **Blocked.** The scroll owner and the overflow source are different elements today, and neither has been counted |
| AC-013 | Running each single-coordinate substitution against the finished suite and recording which value assertion each one broke | Stage 6, after the rest have their numbers | **Blocked.** A substitution control has nothing to break until the assertions it substitutes into exist |

**Enforcement.** A blank cell is not a `Waived` row and not a soft warning. This phase may not move
`Planned → In Progress` while a cell above is blank for a stage that has already run — that gate is
`000`'s blank-cell checker, and this table is what it reads. Stage 3 may not write the sizing
contract before Stage 2 has filled AC-001 to AC-007 and AC-009, and Stage 2 may not run before
AC-008 passes.

### Citations are selectors, not line numbers (review finding F11)

`styles.css` is 19,261 lines. `000` deletes dead blocks and re-orders the cascade audit before this
phase starts, and this phase then collapses seven rail blocks into one. **Every `styles.css:NNNN`
here is a hint with a date on it, not an address.** All were confirmed correct on 2026-08-29 and are
kept because a number that was true on a known date is evidence about the tree on that date. The
durable anchor is the selector.

**Resolve, never trust.** If the command and the line number disagree, the command is right. This
packet is the one most exposed to the drift: it names a three-act cascade reversal by line number,
and the whole argument is the **order** of the three.

| Cited as | Durable anchor | Command that finds it |
|---|---|---|
| `styles.css:9602` | `.note-database-container .db-list-row` — `min-height: 44px`, a floor and not a row height | `rg -n '^\.note-database-container \.db-list-row \{' styles.css` |
| `styles.css:41-51` | the `--db-font-*-line-height` ratios inside the nine-selector token root | `rg -n 'db-font-.*-line-height' styles.css` |
| `styles.css:1332`, `:1338` | `.db-active-view-controls` and `.db-active-view-controls-scroll` — the rail box and the only contained element | `rg -n 'db-active-view-controls' styles.css` |
| `styles.css:18577` → `:19096` → `:19101` | the three-act `mask-image` reversal on `.db-active-view-controls-scroll`: gradient, then `none`, then re-applied under `.is-overflowing` | `rg -n -A6 '\.db-active-view-controls-scroll' styles.css` — read the hits **in order**; the last matching declaration wins |
| `styles.css:9703` vs `:9719` | `.db-list-field`'s `flex: 0 0 150px` beating `.db-list-field-wrap`'s `width` | `rg -n 'db-list-field' styles.css` |
| `styles.css:9668`, `:17873` | `.db-list-row-meta` — `flex-wrap: nowrap` on desktop, and its phone override | `rg -n 'db-list-row-meta' styles.css` |
| `styles.css:9738` | `.db-list-field-wrap .db-list-field-value` | `rg -n 'db-list-field-value' styles.css` |
| `styles.css:609` | `.note-database-container .db-header` | `rg -n '^\.note-database-container \.db-header \{' styles.css` |
| `styles.css:17698` | the `var(--db-header-height, 34px)` fallback in `.db-gallery-card` | `rg -n 'db-header-height' styles.css` |
| `styles.css:16316`, `:16554` | `grid-row: var(--db-timeline-row, 1)` — the two readers of the variable the harness sets to a length | `rg -n 'db-timeline-row' styles.css tools/screenshots/runtime-vars.css` |
| the 31 `max-content` declarations | the static input to AC-006 | `rg -c 'width:\s*max-content' styles.css` returns `31` on the 2026-08-29 tree |
| `active-view-controls-renderer.ts:153` | where the renderer already computes `scrollWidth > clientWidth + 1` and sets `is-overflowing` | `rg -n 'is-overflowing' src/` |
| `capture.mjs:71-72` | the two capture device profiles, 1440 and 402 | `rg -n -e devices -e viewport tools/screenshots/capture.mjs` |
| `verify-placement.mjs:220` | the sole `addStyleTag` for `styles.css`, on the phone page | `rg -n 'addStyleTag' tools/storybook/verify-placement.mjs` |
| `runtime-vars.css:24`, `:43`, `:63` | `--db-header-height`, `--db-mobile-sheet-bottom` and `--db-timeline-row`, pinned in the capture harness | `rg -n -e db-header-height -e db-mobile-sheet-bottom -e db-timeline-row tools/screenshots/runtime-vars.css` |
| `types.ts:238` | the seven view types the census matrix is built from | `rg -n 'ViewType' src/data/types.ts` |

**When a number moves, do not silently correct it.** Record the old number, the new number and the
edit that moved it. For the `mask-image` reversal in particular, record all three acts and which one
computed the winner, before and after the collapse.

### The desktop harness measures a document with no cascade (review finding F3)

This is the finding this packet is most exposed to, and AC-013 already names it as its own negative
control.

`tools/storybook/verify-placement.mjs:220` is the **only** `addStyleTag` call for `styles.css` and it
targets the phone page. The desktop geometry checks therefore run against a document that does not
contain the cascade the defect lives in. **The desktop page is already running a "render without the
stylesheet" substitution and reporting green** — which is exactly the substitution AC-013 exists to
catch, running permanently, unlabelled, against the harness's own desktop results.

Concretely, on a page with no `styles.css`:

- `.db-list-row` has no `min-height`, so AC-001's row-height spread measures unstyled text blocks.
- No `--db-*` token resolves, so AC-002 has no line box and AC-005 has no header height.
- No `overflow-x: auto` exists on the rail, so AC-003 and AC-004 measure a container that was never
  a scroller.
- No `width: max-content` declaration applies, so AC-006's sweep finds **zero** elements — a clean
  pass that means nothing.

**Every desktop number in this packet is therefore inadmissible until `000` loads `styles.css` on the
desktop page.** A number recorded before that repair is discarded, not re-used. AC-008 is the gate
that proves the repair landed, and it is written as a probe precisely so it can fail: it asks for a
value that cannot exist without the stylesheet.

Two consequences for ordering:

1. **Stage 1 is a gate, not a task.** Widening the harness and fixing the three pinned variables
   lands before any measurement. A census taken through a harness that cannot fail is an artefact of
   the harness.
2. **`009`'s live probe is the cross-check.** It is the only instrument outside this program's own
   reach. A harness number and a live number that disagree is a blocking failure for this packet.

### The `styles.css` lane — when this packet takes it and what it must run to release it

`styles.css` is a single serialized lane (parent `spec.md` §4). This packet is third in the execution
order, after `000` and `004`.

**Takes the lane** at the start of Stage 4 (*Implement, rows first*). Not earlier: Stage 1 touches
only harness files, and Stages 2 and 3 census and decide against an unedited stylesheet.

**Holds it** through Stages 4, 5 and 6. No other phase may edit `styles.css` in that window. This
packet and `004` both unblock from `000` on the same edge and both edit `styles.css`; they are
serialized by this rule and nothing else — there is no lock file.

**Releases the lane** only when all four of these have happened, in order:

1. **Full recapture** at four widths per view type, both themes, then `npm run screenshots:verify`
   exit 0. Note that the recapture is only meaningful after Stage 1 removed `--db-card-field-width`
   and `--db-timeline-row` from `runtime-vars.css`: until then list fields render 30px narrow and
   **every timeline band collapses to `auto` in every capture ever taken**.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` proves a
   capture was regenerated after its hand-maintained source list changed and **never opens an
   image**, so it cannot be this step.
3. **`008`'s early replay re-asserts every previously-closed phase** — `000` and `004` — against the
   released tree. They closed against a snapshot this packet has just edited, and this packet
   collapses seven rail blocks that render in **all seven view types**, so the blast radius is the
   whole application chrome.
4. **Cascade re-confirmation.** Every duplicated selector this packet touched has its computed winner
   recorded before and after — the three-act `mask-image` reversal explicitly, and every rail block
   the collapse removed. A block that looks dead here has already been shown elsewhere in this
   stylesheet to be load-bearing through a duplicate class, so each deletion cites its entry in the
   cascade audit `000` produced.

### Proof-tuple coverage

A blank cell is a coverage gap and blocks closure, even when the criterion's number is valid.

| AC-ID | Producer | Runtime branch | Mount / host | Environment | Transition | Semantic outcome | Negative control |
|---|---|---|---|---|---|---|---|
| AC-001 | production renderer | list, wrap off | production mount | 320/402/768/1440 | 20 rows rendered | equal row heights | N3 |
| AC-002 | production renderer | list, wrap on | production mount | 320/402/768/1440 | wrap applied | rhythm multiple | N3 |
| AC-003 | production renderer | all seven view types | production mount | 4 widths | view switched | nothing paints outside | N4 |
| AC-004 | production renderer | rail overfilled | production mount | 4 widths | content added | scrolls, does not grow | N6 |
| AC-005 | production renderer | all seven view types | production mount | 4 widths | view switched | header height stable | N7 |
| AC-006 | n/a (cascade) | every declaration | resolved at runtime | 4 widths | static read | scrolling ancestor exists | N8 |
| AC-007 | production renderer | list + rail | production mount | 4 widths | chip and field deleted | numbers move | N1, N2 |
| AC-008 | harness | n/a | both harness pages | 320/402/768/1440 | n/a | harness can see it | N9 |
| AC-009 | production renderer | list + rail | production mount | 4 widths | sort change, filter edit | row = record id | N10 |
| AC-010 | production renderer | all seven view types | production mount | 4 widths | wrap, view, data, width | numbers hold after reflow | N11 |
| AC-011 | production renderer | list + rail | production mount | desktop + coarse pointer | click, drag | model / scroll delta | N12 |
| AC-012 | production renderer | rail + list | production mount | 4 widths | 20 re-emissions | one scroll owner, no leaks | N13 |
| AC-013 | substituted | substituted | substituted | substituted | substituted | assertion fails | N14 |

### Negative controls

`N1`-`N5` are the controls already registered in `checklist.md`. `N6`-`N14` are added by this
hardening; register them in `checklist.md` when its verification protocol is next revised.

| # | Control | What it proves |
|---|---|---|
| N1 | Deleting a chip from the rail moves an asserted rail number | AC-007 is connected to the rail |
| N2 | Deleting a field from a row moves an asserted row number | AC-007 is connected to the row |
| N3 | Reverting the row rhythm token reproduces the recorded Stage 2 deviation | AC-001 and AC-002 measure the rhythm |
| N4 | Reverting the rail containment reproduces the recorded Stage 2 overflow | AC-003 measures containment |
| N5 | Removing `--db-card-field-width` from `runtime-vars.css` changes a captured width | Captures read the computed value |
| N6 | Removing `overflow-x: auto` makes the rail grow and the parent width move | AC-004 distinguishes scroller from grower |
| N7 | Assigning a different `--db-header-height` per view reproduces a header step above 8px | AC-005 measures the header, not the token |
| N8 | Re-adding one unclassified `width: max-content` without a scrolling ancestor fails the sweep | AC-006 resolves ancestors at runtime |
| N9 | Removing the 320 and 768 profiles hides an overflow the census recorded | AC-008 measures harness reach |
| N10 | Resolving a row by ordinal mis-identifies it after a sort change | AC-009 asserts identity |
| N11 | Measuring only at first paint hides the rail's grow-instead-of-scroll defect | AC-010 observes the reflow |
| N12 | Stubbing the filter write makes the chip-removal assertion fail | AC-011 asserts an outcome |
| N13 | Adding a second scrolling ancestor in the header fails the owner count | AC-012 counts owners |
| N14 | Each single-coordinate substitution fails a value assertion — including rendering without `styles.css` | The suite is connected to every coordinate |

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

Work has not started. Every row is `Unmet`, and **every row also has a blank failing-number cell**,
so every row is `Blocked` as well (review finding F16). That is not an oversight:
`verify-placement.mjs` renders no view at all, so nothing in this packet has ever been measured. The
provenance table above names, for each row, the artefact that produces its number and the stage that
produces it.

**AC-006 was rewritten under review finding F8.** It previously asked for every `width: max-content`
declaration to be resolved and classified, with a target of "0 unclassified" — a classification task
that finishing the spreadsheet satisfies. It now closes on what the user sees: **0 elements painting
outside the container that bounds them**, at 4 widths x 7 view types, with every legitimate overflow
scrolling rather than growing (parent width delta 0). The static count of **31 declarations** is
preserved as the input that makes the runtime sweep exhaustive.

**AC-008 was rewritten for the same reason.** "The harness can see the widths this spec is about"
closed on a capability existing. It now closes on a stylesheet-dependent probe — `.db-list-row`
computing `min-height: 44px` and a `--db-*` token resolving non-empty — on **both** harness pages at
all four widths. A harness that cannot fail that probe cannot produce an admissible number for
anything else here.

AC-007 records the two inert declarations found by reading; both still need a measurement.
AC-009 to AC-013 are the five dimensions added because an ordinally identified row passes the
original four conditions while pointing at a different record after any reflow.

**No desktop number is admissible until `000` loads `styles.css` on the desktop page** (review
finding F3). On a page with no cascade, AC-006's sweep finds zero elements — a clean pass that means
nothing — and AC-001 to AC-005 measure unstyled blocks. AC-008 is the gate that proves the repair
landed. Every `styles.css` line number here is a dated hint; the selector plus the command in the
citation table is the address (review finding F11), and for the three-act `mask-image` reversal the
**order** of the three is the whole argument.

This spec does not close on gate passage alone. It closes when the measurements above have moved from
their recorded Stage-2 values, every proof-tuple cell is filled, negative controls N1-N14 hold, and
**the operator has looked at list rows and the filter rail on a device** — the two defects that
started it.
<!-- /ANCHOR:closure -->
