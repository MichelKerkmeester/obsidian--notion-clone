---
title: "Acceptance Criteria: Record Open Target"
description: "The criteria this packet must satisfy before it may be closed, each carrying its exact measurement, its threshold, the failing value measured or traced on the current tree, and the negative control that proves the check can fail."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "006 record open criteria"
  - "proof tuple"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/006-record-open-target"
    last_updated_at: "2026-08-31T00:00:00Z"
    last_updated_by: "harness-dependence-audit"
    recent_action: "Classified 13 criteria for harness dependence; 4 rest on stubbed open actions"
    next_safe_action: "Wire openRow to the shipped opener before driving the 20-affordance census"
    blockers:
      - "Depends on 003-mobile-sheet-presentation for the phone answer"
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-006"
      parent_session_id: null
    completion_pct: 43
    open_questions:
      - "Side panel, full-page modal, or both behind the setting"
    answered_questions: []
---
# Acceptance Criteria: Record Open Target

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.
>
> Each is measured on the real renderer at the production mount point. Rows marked *trace* take their
> failing number from the Stage-1 artefact; the source fact beside them is why the criterion is
> expected to fail.
>
> **Banned.** No criterion may count call sites, assert a class is present, or assert a rule count. A4
> counts *observed surfaces produced by driven affordances*, which is a behavioural measurement, not a
> static call count — the distinction is the whole point of `../architecture-findings.md` §9.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 006-record-open-target
**Level:** 3
**Status:** Draft
**Date:** 2026-08-29
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

### The nine dimensions

The four original conditions are necessary and not sufficient. The aliasing risk here is the worst
one in the program, because it is silent and it writes: **the surface can show, and edit, the wrong
record.** A peek opened from row 4, a background refresh that reorders the view, and an edit
committed into row 4's *new* occupant — every rectangle correct, every number plausible, the wrong
file changed. A geometry criterion cannot see that; only an identity criterion can.

Five dimensions close the hole — semantic identity (the surface shows the record whose id was
requested), transition trace (`open → refresh → reconcile → observe → edit → close`), action outcome
(the edit lands in the right file), resource ownership (the target owns its own dismissal and does
not strand the view's scope), negative-control mutation. The proof tuple is `producer x runtime
branch x mount/host x environment x transition x semantic outcome x negative control`.

### Criteria table

| AC-ID | REQ | Measurement — producer → mount → transition → observation | Threshold | Today | NC | Status | Waiver |
|---|---|---|---|---|---|---|---|
| AC-001 (A1) | REQ-002 | Seed a note whose body has a heading and a paragraph; drive **Open**; count the body characters present in the produced surface | body characters present `> 0` and matching the seeded body | **0** — the peek stringifies column values only (`table-record-peek.ts:262-271`) and never reads the file | N2 | Unmet | - |
| AC-002 (A2) | REQ-003 | Commit a field so the view re-renders; call `elementFromPoint` at the surface's centre | the returned node is inside the surface | *trace* — the peek dismisses on container scroll and window resize (`:227-228`); it is not a leaf and not a `Modal` | N1 | Unmet | - |
| AC-003 (A3) | REQ-005 | On a 402px phone profile, read the surface's `getBoundingClientRect().height` against the viewport height | `height >= 0.5 * viewport.height` | *trace* — the detail panel is clamped to `50vh` (`styles.css:9074-9076`, `60vh` desktop at `:9001`); the peek is a `min(360px, 100%)` dock with no phone rule at all (`styles.css:18328`) | N5 | Unmet | - |
| AC-004 (A4) | REQ-001 | Drive every affordance in the open-path census; record which surface each produced; compare with the configured target | count that produced a surface other than the configured target is **0** | **20 affordances resolve to 4 surfaces and there is no setting to disagree with** (`types.ts:636-657`) | N2 | Unmet | - |
| AC-005 (A5) | REQ-004 | Write the setting, reload the plugin, read it back, **then drive one affordance per target and observe which surface it produced** | written value equals read-back value, **and after the reload the driven affordance produces the surface the setting names — 0 mismatches across every target value the setting accepts.** A round-trip that persists a string nothing acts on does not close this row | no such setting exists, so no affordance can disagree with one; the observed spread it must replace is recorded in AC-004 — **20 affordances resolve to 4 surfaces** | N3 | Unmet | - |
| AC-006 (A6) | REQ-006 | Open a dropdown from inside the surface; call `elementFromPoint` over the dropdown | the returned node is the dropdown or a descendant | returns the peek — `z-index: 998` (`styles.css:18324`) is above `--db-layer-popover: 100` and `--db-layer-submenu: 110` (`styles.css:72-73`) | N4 | Unmet | - |
| AC-007 (A7) | REQ-007 | Open a record; assert the database view is still rendered in its own leaf | the view remains rendered, unless the user chose full-page | *trace* — `getLeaf(false)` reuses the active leaf (`data-source.ts:425`), navigating the view away | N6 | Unmet | - |
| AC-008 (A8) | REQ-003 | Delete the target surface from the harness DOM and rerun every assertion | at least one asserted number changes | no such check exists; per `000` REQ-006 an assertion that survives deletion is theatre | N1 | Unmet | - |
| AC-009 | REQ-002 | **Semantic identity.** Assert the surface displays the record whose **stable id** the affordance requested — read the id from the surface's own state and compare with the requested id — not the row that happens to occupy the same position | requested id equals displayed id, for every affordance, before and after a re-render — **0 surfaces displaying a record other than the one requested**, measured against a view whose order changed underneath the open surface | *trace* — the peek is built from the row object handed to it and holds no id it can be re-checked against. What the surface shows is decided by the caller's row reference, so identity has never been asserted; the Stage-1 drive records the pair for each of the 20 affordances | N7 | Unmet | - |
| AC-010 | REQ-003 | **Transition trace.** `open → background data change / sort change / field commit → reconcile → observe → edit → close`. Re-run AC-009's identity check and AC-002's hit test after each transition | displayed id unchanged after every transition, or the surface closes explicitly; the hit test still lands inside the surface | *trace* — the peek dismisses on container scroll and window resize (`:227-228`) but has no defined behaviour for a data change underneath it. No harness drives one | N8 | Unmet | - |
| AC-011 | REQ-002, REQ-004 | **Action outcome.** Edit a field inside the target and assert the write landed in the **file backing the requested id**, not in the file backing the row now at that position; then assert the setting change routes the next open to the newly chosen target | every edit writes to the requested record's file; 0 writes to an unrequested file; the setting change moves the observed target | *trace* — recorded in `../architecture-findings.md` §3: **nothing drives a click, drag or commit** in any current harness, so no write has ever been attributed to a record id | N9 | Unmet | - |
| AC-012 | REQ-006, REQ-007 | **Resource ownership.** With the target open, count its dismissal, focus and keyboard owners; assert the database view's own interaction scope is still registered and not stranded; after close, re-count listeners and nodes against the pre-open baseline | exactly 1 owner of each kind for the target; the view's scope still owns its own events; listener and node counts return to the pre-open baseline, **and after close the view scrolls, responds to a click at the coordinates the target occupied, and still answers its own keyboard shortcuts — 0 targets leave the view stranded** | *census* — the peek is neither a leaf nor a `Modal` and dismisses itself on container scroll and window resize (`:227-228`), so it owns dismissal privately; the view's scope ownership across an open has never been counted. Owner counts are the Stage-1 census deliverable | N10 | Unmet | - |
| AC-013 | REQ-001 | **Negative-control mutation.** Substitute exactly one tuple coordinate — open from a different affordance, run the phone branch instead of desktop, skip the refresh transition, alias the record id to its row position, or set the target to a value the resolver does not know — and rerun | each single substitution fails at least one **value** assertion; a failure caused only by a missing node does not count | no such control exists. The measured spread this must catch is already recorded: **20 affordances resolve to 4 surfaces** with no setting to disagree with | N11 | Unmet | - |

### F8 audit — every criterion re-tested for the "passes on today's broken tree" shape

Review finding F8 named `001/AC-008` and `005/AC-006`; the audit below re-reads every row here for
the same four shapes — closing on a **thing existing**, on a **deletion**, on a **classification**,
or on a **count**. This packet's banner already draws the distinction F8 turns on: AC-004 counts
*observed surfaces produced by driven affordances*, which is a behavioural measurement, not a static
call count.

| AC-ID | Shape found | Disposition |
|---|---|---|
| AC-001 | Outcome. Body characters present in the produced surface, against a seeded body | Kept unchanged |
| AC-002 | Outcome. A hit test after a driven re-render | Kept unchanged |
| AC-003 | Outcome. A measured height against the viewport | Kept unchanged |
| AC-004 | Outcome. A count of **driven observations**, each one a surface that was produced and identified — not a count of call sites | Kept unchanged. The banner already defends this distinction and it holds |
| AC-005 | **Thing existing**, in part. A setting that round-trips is a persisted string; nothing in the old threshold required anything to act on it | **Threshold extended.** The round-trip is now followed by a driven open per target: the affordance must produce the surface the setting names, 0 mismatches |
| AC-006 | Outcome. A hit test over a dropdown inside the target | Kept unchanged |
| AC-007 | Outcome. Whether the view is still rendered in its own leaf after a driven open | Kept unchanged |
| AC-008 | Negative control by construction — the pass condition is that a number **moves** when the subject is deleted | Kept unchanged |
| AC-009 | Outcome. Requested id against displayed id | **Threshold sharpened** to name the condition that makes it meaningful: the view's order must change underneath the open surface, or the check cannot distinguish identity from position |
| AC-010 | Outcome. Displayed id held across a driven data change, or an explicit close | Kept unchanged |
| AC-011 | Outcome, and the strongest one here — the write is attributed to a file, not to a node | Kept unchanged |
| AC-012 | **Count.** Owner counts are countable mechanism | **Threshold extended.** Adds the user-visible consequence: after close the view scrolls, responds to a click where the target was, and still answers its own shortcuts |
| AC-013 | Substitution control. Outcome-shaped by construction — each substitution must fail a **value** assertion | Kept unchanged |

**Rule going forward.** No row here may be marked `Met` because the peek module was deleted, a
setting was added, an affordance was routed, or a trace artefact exists. Those are inputs. The
closing evidence is a surface that was driven and identified, or a write that landed in the file the
requested id names.

### Failing-number provenance — the blank cells (review finding F16)

`../architecture-findings.md` §9 condition 3 makes a criterion invalid until it has been
**demonstrated to fail on the current tree, with the failing number recorded**. The rows below hold a
source fact rather than a number. Until the number is there they are unenforceable prose: a passing
measurement would prove only that a value sits inside a threshold, never that it moved.

**No number below may be invented, estimated, or carried across from another packet.** The cell is
filled by running the named producer and pasting what it printed.

| AC-ID | What produces the failing number | Stage of this phase that produces it | State until the cell is filled |
|---|---|---|---|
| AC-002 | Driving a field commit so the view re-renders, then `elementFromPoint` at the surface centre — recorded per target surface | Stage 1 (drive the affordances) | **Blocked.** The peek dismisses on container scroll and window resize and is neither a leaf nor a `Modal`, but what it does under a re-render has never been observed |
| AC-003 | Opening each target on a 402px phone profile and reading its `getBoundingClientRect().height` against the viewport height | Stage 1 | **Blocked.** The `50vh` clamp and the `min(360px, 100%)` dock are declarations; neither has been measured on a phone profile |
| AC-005 | Writing the setting, reloading, reading it back, then driving one affordance per target value and recording which surface each produced | Stage 3 (the resolver and the setting) | **Blocked.** No setting exists, so the *before* number is AC-004's spread — 20 affordances to 4 surfaces — and that is what the setting must collapse |
| AC-007 | Driving an open from each affordance and recording whether the database view is still rendered in its own leaf afterwards | Stage 1 | **Blocked.** `getLeaf(false)` reusing the active leaf is a source reading; no open has been driven and observed |
| AC-009 | Driving each of the 20 affordances, recording the **requested** record id and the **displayed** record id as a pair, then re-reading after a sort change reorders the view | Stage 1, extended in Stage 4 once every affordance goes through the resolver | **Blocked.** The peek is built from the row object handed to it and holds no id to be re-checked against, so identity has never been asserted for any affordance |
| AC-010 | Holding a target open while the underlying data changes, then re-running AC-009's identity check and AC-002's hit test | Stage 6 (re-run the trace unchanged) | **Blocked.** The peek has no defined behaviour for a data change underneath it, and no harness drives one |
| AC-011 | Editing a field inside the target and recording which file the write landed in, against the file backing the requested id; then changing the setting and recording which target the next open produced | Stage 6 | **Blocked, and this is the packet's most serious gap.** Nothing drives a click, drag or commit in any current harness, so **no write has ever been attributed to a record id** — and this packet's aliasing failure is the only one in the program that writes |
| AC-012 | Counting the target's dismissal, focus and keyboard owners while open; re-reading listener and node counts, view scroll, click response and shortcut handling after close | Stage 1 for the owner counts, Stage 6 for the post-close baseline | **Blocked.** The peek owns dismissal privately and the view's scope ownership across an open has never been counted |
| AC-013 | Running each single-coordinate substitution against the finished suite and recording which value assertion each one broke | Stage 6, after the rest have their numbers | **Blocked.** A substitution control has nothing to break until the assertions it substitutes into exist |

**Enforcement.** A blank cell is not a `Waived` row and not a soft warning. This phase may not move
`Planned → In Progress` while a cell above is blank for a stage that has already run — that gate is
`000`'s blank-cell checker, and this table is what it reads. Stage 2 may not take the target-policy
decision with the operator before Stage 1 has recorded what the twenty affordances actually do, and
**Stage 5 may not retire the peek before AC-002, AC-003, AC-007, AC-009 and AC-012 hold its *before*
numbers** — once it is gone there is nothing left to measure them against.

### Citations are selectors, not line numbers (review finding F11)

`styles.css` is 19,261 lines and five phases edit it before this one starts. **Every
`styles.css:NNNN` and `src/**/*.ts:NNNN` here is a hint with a date on it, not an address.** All were
confirmed correct on 2026-08-29 and are kept because a number that was true on a known date is
evidence about the tree on that date. The durable anchor is the selector or the symbol.

**Resolve, never trust.** If the command and the line number disagree, the command is right.

| Cited as | Durable anchor | Command that finds it |
|---|---|---|
| `styles.css:18319-18338`, `:18324`, `:18328` | `.note-database-container .db-record-peek-panel` — the right-docked peek, its literal `z-index: 998`, and its `width: min(360px, 100%)` with no phone rule | `rg -n -A20 '^\.note-database-container \.db-record-peek-panel \{' styles.css` |
| `styles.css:71-74`, `:72-73` | the layer scale — `--db-layer-panel: 50`, `--db-layer-popover: 100`, `--db-layer-submenu: 110`, `--db-layer-modal: 1000` | `rg -n 'db-layer-' styles.css` |
| `styles.css:9000`, comment at `:8994-8996` | the detail panel using `var(--db-layer-panel, 50)` — the sibling that already fixed this | `rg -n -A12 '^\.note-database-container \.db-record-detail-panel \{' styles.css` |
| `styles.css:9001`, `:9074-9076` | the detail panel's `60vh` desktop and `50vh` phone clamps | `rg -n 'db-record-detail-panel' styles.css` — read every hit |
| `table-record-peek.ts:262-271` | where the peek stringifies column values and never reads the file | `rg -n -e textContent -e createDiv src/views/table-record-peek.ts` |
| `table-record-peek.ts:227-228` | the peek's private dismissal on container scroll and window resize | `rg -n -e scroll -e resize src/views/table-record-peek.ts` |
| `data-source.ts:425` | `getLeaf(false)`, which reuses the active leaf and navigates the view away | `rg -n 'getLeaf' src/data/data-source.ts` |
| `types.ts:636-657` | the settings block where no open-target setting exists | `rg -n 'databaseFiles' src/data/types.ts` |
| `database-view.ts:8419-8437`, `:1717` | the touch route to the detail panel, and the unguarded `Mod+Enter` that reaches the peek on a phone | `rg -nF -e 'Mod+Enter' -e isTouchDevice src/views/database-view.ts` |
| `main.ts:689-724` | the database-definition-file opens that are explicitly out of scope | `rg -n -e openDatabaseFile -e definition src/main.ts` |

**When a number moves, do not silently correct it.** Record the old number, the new number and the
edit that moved it. The `998` in particular is evidence: it is the literal that beats two declared
tiers, and its value matters more than its address.

### No criterion rests on a pre-repair desktop measurement (review finding F3)

`tools/storybook/verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it
targets the **phone** page. The desktop geometry checks therefore run against a document with no
plugin cascade, and every desktop number that harness has produced is structurally irrelevant.

Two of this packet's criteria are directly exposed and one is exposed in a way that is easy to miss:

- **AC-006 cannot be evaluated at all without the cascade.** The whole finding is that a literal
  `z-index: 998` beats `--db-layer-popover: 100` and `--db-layer-submenu: 110`. On a page with no
  stylesheet **no z-index applies to anything**, so the hit test returns whatever the DOM order
  gives and reports a result that has nothing to do with the defect.
- **AC-003's phone half is fine** — the phone page does load `styles.css` — but its desktop
  comparison is not.
- **AC-001, AC-002, AC-004, AC-007 and AC-009 to AC-012 are behavioural** rather than geometric, so
  the missing cascade does not invalidate them directly. It still invalidates any *rect* they read
  along the way, and AC-002's `elementFromPoint` is exactly such a read.

`000` repairs the load. Until it has, **no desktop harness measurement in this packet is
admissible**, and one recorded before the repair is discarded rather than re-used. Cross-check every
surviving number against `009`'s live probe; a harness number and a live number that disagree is a
blocking failure.

### The `styles.css` lane — when this packet takes it and what it must run to release it

`styles.css` is a single serialized lane (parent `spec.md` §4). This packet is seventh in the
execution order and the last of the feature phases, after `000`, `004`, `005`, `001`, `002` and
`003`.

**Takes the lane** at the start of Stage 5 (*Retire the peek*), which removes or rewrites the peek's
fifteen `styles.css` rules and replaces the literal `z-index: 998` with a declared tier from the
scale. Not earlier: Stages 1 to 4 trace, decide, build the resolver and route the affordances, and
all four must run against an unedited stylesheet so the trace records the tree as shipped.

**Holds it** through Stages 5 and 6. No other phase may edit `styles.css` in that window.

**Releases the lane** only when all four of these have happened, in order:

1. **Full recapture** — one per target, side panel, full page and phone, both themes — then
   `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` proves a
   capture was regenerated after its hand-maintained source list changed and **never opens an
   image**, so it cannot be this step.
3. **`008`'s early replay re-asserts every previously-closed phase** — `000`, `004`, `005`, `001`,
   `002` and `003` — against the released tree. This is the last handoff before `008`'s full release
   gate, so it is also the last cheap opportunity to find a cascade reversal introduced anywhere in
   the program.
4. **Cascade re-confirmation** — every duplicated selector this packet touched has its computed
   winner recorded; a changed winner carries a written disposition. Replacing a literal `998` with a
   declared tier changes stacking for anything that was sitting between the two values, so this is a
   real check here rather than a formality.

**Ordering constraint that is not about the lane but binds the same stage.** Stage 5 may not retire
the peek before Stages 1 to 4 have recorded its *before* numbers for AC-002, AC-003, AC-007, AC-009
and AC-012. Deleting the module first would strand `Mod+Enter`; deleting it after Stage 4 recreates
the disagreement; and deleting it before the numbers exist leaves nothing to measure the fix against.

### Proof-tuple coverage

A blank cell is a coverage gap and blocks closure, even when the criterion's number is valid.

| AC-ID | Producer | Runtime branch | Mount / host | Environment | Transition | Semantic outcome | Negative control |
|---|---|---|---|---|---|---|---|
| AC-001 | production **Open** | every target | declared mount | desktop + phone | open | body rendered | N2 |
| AC-002 | production | every target | declared mount | desktop + phone | field commit | hit lands inside | N1 |
| AC-003 | production | every target | declared mount | 402px phone | open | at least half viewport | N5 |
| AC-004 | all 20 affordances | every target | declared mount | desktop + phone | open | target matches setting | N2 |
| AC-005 | settings write | n/a | n/a | reload | plugin reload | round-trips | N3 |
| AC-006 | production | dropdown inside target | declared mount | desktop + phone | nested open | dropdown on top | N4 |
| AC-007 | production | every target | leaf | desktop + phone | open | view survives | N6 |
| AC-008 | harness | every target | declared mount | desktop | subject deleted | a number moves | N1 |
| AC-009 | all 20 affordances | every target | declared mount | desktop + phone | open, re-render | requested id = displayed id | N7 |
| AC-010 | production | every target | declared mount | desktop + phone | data change, sort, commit | identity survives or closes | N8 |
| AC-011 | production | every target | declared mount | desktop + phone | open → edit → close | write lands in the right file | N9 |
| AC-012 | production | every target | declared mount | desktop + phone | open → close | one owner, view not stranded | N10 |
| AC-013 | substituted | substituted | substituted | substituted | substituted | assertion fails | N11 |

### Negative controls

`N1`-`N4` are the controls already registered in `checklist.md`. `N5`-`N11` are added by this
hardening; register them in `checklist.md` when its verification protocol is next revised.

| # | Control | What it proves |
|---|---|---|
| N1 | Deleting the target surface from the harness DOM moves an asserted number | AC-002 and AC-008 are connected to the surface |
| N2 | Reverting the resolver reproduces the recorded Stage 1 surface split | AC-001 and AC-004 measure the resolver |
| N3 | Setting an absent value reproduces today's per-affordance behaviour exactly | AC-005 measures the setting, not a default |
| N4 | Reintroducing the literal `998` fails the A6 hit test | AC-006 measures the stacking, not the class |
| N5 | Restoring the `50vh` clamp reproduces a phone surface under half the viewport | AC-003 measures the phone height |
| N6 | Restoring `getLeaf(false)` navigates the database view away | AC-007 measures leaf survival |
| N7 | Resolving the record by row position mis-identifies it after a sort change | AC-009 asserts identity |
| N8 | Changing the underlying data while the target is open without reconciling fails the identity check | AC-010 observes the transition |
| N9 | Redirecting the write to the row now at that position fails the file-attribution assertion | AC-011 attributes the write |
| N10 | Leaving the view's scope unregistered after a close fails the ownership count | AC-012 counts owners |
| N11 | Each single-coordinate substitution fails a value assertion | The suite is connected to every coordinate |

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

The supplies, by number: **1** `--keyboard-height`. **2** values `runtime-vars.css` pins. **3**
production actions replaced by no-op or counting stubs. **4** host chrome built by hand. **5**
Obsidian's `app.css`, absent except for one `button` rule.

**9 sound · 4 harness-dependent · 0 unknown.**

**This packet is the least style-exposed of the seven, and for a structural reason.** Its criteria
ask *what was produced*, *which record is displayed* and *where the write landed* — content and
identity, not computed geometry. A missing host stylesheet does not change which file an edit wrote
to. The exposure it does have is the other kind: **the actions it must drive are the stubbed ones**,
and its one leaf-lifetime criterion runs against a workspace the harness builds by hand.

| AC-ID | Class | Supply | On a device |
|---|---|---|---|
| AC-001 | Sound | — | Count the body characters present in the produced surface and match them against the seeded body. Content, not style. The recorded **0** — the peek stringifies column values and never reads the file (`table-record-peek.ts:262-271`) — is a source fact that holds anywhere |
| AC-002 | Sound | — | `elementFromPoint` at the surface's own centre after a re-render. Both the surface and the view underneath are the plugin's; no host element competes at that point |
| AC-003 | Sound | — | Surface height against viewport height on a phone profile. Every bound in play is plugin-declared — the detail panel's `50vh` and `60vh` clamps, and the peek's `min(360px, 100%)` dock with no phone rule at all. A host sheet does not move a `vh` clamp |
| AC-004 | **Harness-dependent** | 3 | "Drive every affordance in the open-path census; record which surface each produced." **In the harness the affordance is `openRow: () => undefined` / `openRow: () => {}`** (`verify-placement.mjs:2329`, `:2435`, `:3398`, `:4268`, `:4523`, `:4920`). A no-op produces no surface, so the count is of nothing, and a threshold of *"0 produced a surface other than the configured target"* is satisfied vacuously. **This is the exact shape of the `editFileName` false green**: a check proved a gesture reached the handler while nothing was ever created. The recorded finding — 20 affordances resolve to 4 surfaces, `types.ts:636-657` — comes from reading the open paths, not from driving them, and is sound as a source fact |
| AC-005 | **Harness-dependent** | 3 | The row is written correctly: it refuses to close on a round-trip alone and demands that the driven affordance produce the surface the setting names. That second half needs the real opener, and inherits AC-004's stub exactly |
| AC-006 | Sound | — | A dropdown opened inside the peek must paint above it. **Both sides of the comparison are plugin-declared numbers** — the peek's `z-index: 998` against `--db-layer-popover: 100` and `--db-layer-submenu: 110`. Note the layer variables this row reads are not among those `runtime-vars.css` pins, and `--db-layer-sticky` — which was pinned at 25 against a production 40 — has since been removed from that file |
| AC-007 | **Harness-dependent** | 4 | "Assert the database view is still rendered in its own leaf." A leaf is host machinery. The harness hand-writes `workspace-leaf`, `workspace-split mod-root` and their siblings (`verify-placement.mjs:178-186`) and resolves the `obsidian` module to `tools/storybook/obsidian-stub.mjs`, so `getLeaf(false)` behaves the way the stub behaves. Leaf reuse navigating the view away is a real defect (`data-source.ts:425`) and it is not observable against hand-built chrome |
| AC-008 | Sound | — | Harness-measuring by construction: delete the target from the harness DOM and require an asserted number to change. The row exists to prove the others are connected |
| AC-009 | Sound | — | Requested id against displayed id, before and after a re-render that changed the view's order. **This is the criterion the packet's worst risk needs** — a surface showing and editing the wrong record — and it reads model state, which no stylesheet and no host can supply |
| AC-010 | Sound | — | Displayed id unchanged across a background data change, a sort change and a field commit, or an explicit close. Plugin state throughout |
| AC-011 | **Harness-dependent** | 3 | "Assert the write landed in the file backing the requested id." There is no vault behind the harness and `editCell` is a stub, so no write can be attributed to a record id at all. The criterion is right and needs a real data source, not a better fixture. **It is also the packet's highest-value row** — a misattributed write is silent and permanent — and should be the one that gets the real driver first |
| AC-012 | Sound | — | Owner counts, the view's own interaction scope still registered, listener and node counts returning to baseline, and the view scrolling and answering its shortcuts after close. All plugin-owned state |
| AC-013 | Sound | — | A substitution suite over its own coordinates |

**What would settle the four.** All of AC-004, AC-005 and AC-011 need the same thing: `openRow` and
`editCell` wired to the shipped opener and the shipped writer, the way `editFileName` was wired to
the shipped renderer after it caused a false green. AC-007 needs a different instrument entirely —
leaf lifetime is `009`'s live probe or nothing.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 2b. THE FIVE STATEFUL DIMENSIONS — 2026-09-01

`000` asks every packet to map its criteria onto five dimensions, and this one carried none.

| Dimension | Where this packet answers it | Evidence |
|---|---|---|
| **Semantic identity** | The surface holds the record it was opened on, across a re-render | The record sheet survives a re-render with its node rebuilt and its identity intact, asserted by **column key rather than index**, with a control requiring a different record to close the sheet rather than re-point it |
| **Transition trace** | Open → replace → close, not open → close | The peek is a module singleton: opening a second closes the first. Measured across all three, because the replacement teardown is a different line from the explicit one and is the path a reader takes by clicking another row |
| **Action outcome** | Activating Open produces the rendered body, not a call count | `023` shipped the record body; the sheet's captures show it rendered below the property rows. The peek's own layer is asserted by paint order, not by class name |
| **Resource ownership** | *new here* — the peek takes four things and one of them is deferred | `0 before, 3 on open, 4 once the tick has passed, 0 after close`. Replacement does not stack: `4 → 4 → 0`. Red with the resize release removed: `1 after one open-and-close`, and the replacement case reports `5 → 6 → 3` |
| **Negative-control mutation** | Each row above names its own | The peek's `998` restored; the resize release removed; both tick defences removed together |

**The tick case needed BOTH defences removed to go red, and that is recorded rather than smoothed
over.** The peek adds its outside-click listener a tick late so the opening click cannot close the
panel. A peek closed inside that tick must never add it — and that is defended twice, by
`clearTimeout` in the close path and by a `!closed` guard inside the callback. Removing either alone
left the check green. Only removing both produced `1 outstanding after opening and closing within
the same tick`.

*So the check is honest about what it proves.* It does not prove either mechanism works; it proves
the property holds while at least one does. A single-line break here is genuinely survivable, which
is a fact about the code rather than a weakness in the check — but a control that had stopped at the
first green would have recorded a discriminating check that is not.

---

## 3. CLOSURE STATEMENT

**Closeable:** No

Work has not started. Every row is `Unmet`. AC-001, AC-004, AC-006 and AC-008 carry the value read
from the current tree.

**AC-005's threshold was extended under review finding F8.** A setting that round-trips is a
persisted string, and nothing in the old threshold required anything to act on it — the criterion
would have closed on the setting existing. It now closes on a driven open per target value after the
reload: the affordance must produce the surface the setting names, 0 mismatches. AC-009's and
AC-012's thresholds were sharpened the same way, to name the condition that makes each meaningful.

**AC-002, AC-003, AC-005, AC-007 and AC-009 to AC-013 have no recorded failing number and are
`Blocked`, not merely `Unmet`** (review finding F16). Each is listed in the provenance table above
with the artefact that produces its number and the stage that produces it. Two ordering constraints
follow: Stage 2 may not take the target-policy decision before Stage 1 has recorded what the twenty
affordances actually do, and **Stage 5 may not retire the peek before its *before* numbers exist** —
once the module is gone there is nothing left to measure them against.

AC-009 to AC-013 are the five dimensions added because this packet's
aliasing failure is the only one in the program that **writes**: an edit committed into the wrong
record leaves every rectangle correct and the wrong file changed. AC-011 is the row that catches it,
and its cell is blank: **no write has ever been attributed to a record id in any harness.**

Every line number here is a dated hint; the selector or symbol plus the command in the citation table
is the address (review finding F11) — the `998` in particular is evidence, and its value matters more
than its address. No desktop harness measurement recorded before `000` loads `styles.css` on the
desktop page is admissible (review finding F3); AC-006 cannot be evaluated at all without the
cascade, because on a stylesheet-less page no z-index applies to anything.

This spec does not close on gate passage alone. It closes when the measurements above have moved from
their recorded values, every proof-tuple cell is filled, negative controls N1-N11 hold, every
affordance row in `checklist.md` has an observed surface **and an attributed write**, and **the
operator has opened a record on desktop and on a phone and seen the page** — the defect that started
it.
<!-- /ANCHOR:closure -->
