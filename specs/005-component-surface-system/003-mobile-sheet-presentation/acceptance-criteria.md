---
title: "Acceptance Criteria: Mobile Sheet Presentation"
description: "The criteria this packet must satisfy before it may be closed, each carrying its exact measurement, its threshold, the failing value measured on the current tree, and the negative control that proves the check can fail."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "003 mobile sheet criteria"
  - "anchor lease"
  - "proof tuple"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/003-mobile-sheet-presentation"
    last_updated_at: "2026-08-31T00:00:00Z"
    last_updated_by: "harness-dependence-audit"
    recent_action: "Classified 14 criteria for harness dependence; 5 rest on the hand-built navbar"
    next_safe_action: "Drive visualViewport for C4 instead of injecting --keyboard-height"
    blockers:
      - "000-surface-contract-and-truthful-harness must land first"
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-003"
      parent_session_id: null
    completion_pct: 50
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Mobile Sheet Presentation

> **ALL CRITERIA IN THIS PACKET ARE REOPENED — 2026-08-29.**
>
> A portal was implemented, asserted green by four harness checks, committed, and shipped to the
> operator's phone, where the sheet rendered as unstyled text over the view AND still sat above the
> navigation bar. Both halves of the claim were false on device.
>
> The four checks passed because every one of them measured a mechanism — mount point, token class,
> hit test, restore — and not one asked whether the surface still looked like a sheet.
>
> **The root cause is bigger than this packet.** All 196 captures render static markup; none of them
> calls the plugin's presentation code. `applySheetChrome` is invoked by no capture, so a change to
> it is invisible to every screenshot in the repository.
>
> No criterion here may be marked met again without: a render through the production code path, an
> image a person has opened, and confirmation on the operator's device.



<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.
>
> Each is measured on the real renderer at the production mount point on a phone profile, with a
> navbar present, and each currently fails. **A criterion is not accepted until its failing number
> has been recorded here from the current tree.** Class names and call counts are not criteria.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 003-mobile-sheet-presentation
**Level:** 3
**Status:** Draft
**Date:** 2026-08-29
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

### The nine dimensions

This packet is where the temporally stale surface is not a hypothetical: it is the reported glitch.
The sheet's node survives a field commit, its geometry still measures, its rectangle still looks
right — and from the first commit onward it is anchored to a node that no longer exists, so
`place()` (`popover-position.ts:100`) no-ops permanently. A harness that measured the sheet once,
found the number correct, and stopped would have reported the defect fixed.

The four original conditions cannot see that. Five dimensions can:

| Dimension | What this packet must pin down |
|---|---|
| Semantic identity | The sheet is anchored to a **logical** `AnchorRef` — scope plus row path / cell key / event key plus stable record identity — and the DOM node is only a render-epoch cache |
| Transition trace | `open → anchored(A) → anchor-missing(pending) → anchored(B) → close`, driven by renderer commit, not by a MutationObserver |
| Action outcome | The tap that lands on the sheet edits the field it claims to edit, and the tap that lands on the navbar band lands on the sheet |
| Resource ownership | One scoped lease owns scrim, drag handle, scroll and keyboard suppression, Escape/back dismissal and restoration — and the host's own variables and class list are unchanged |
| Negative-control mutation | Removing the navbar, restoring the `is-phone` branch, skipping the commit transition or aliasing the anchor each fail a value assertion |

The proof tuple is `producer x runtime branch x mount/host x environment x transition x semantic
outcome x negative control`.

### Criteria table

| AC-ID | REQ | Measurement — producer → mount → transition → observation | Threshold | Measured today | NC | Status | Waiver |
|---|---|---|---|---|---|---|---|
| AC-001 (C1) | REQ-001 | Open a sheet through its production producer on a phone profile with a real `.mobile-navbar`; call `document.elementFromPoint(centreX, navbarCentreY)` | the returned node is the sheet or a descendant of it, across the navbar's full band | returns `.mobile-navbar` — **even at `z-index: 9999`** | N1 | Unmet | - |
| AC-002 (C2) | REQ-004 | Measure `sheet.getBoundingClientRect().bottom` against the visual viewport bottom, for a positioner sheet **and** a `DbModal` sheet, in one check | bottom edge equals viewport bottom, offset `0px`, for **both** mechanisms | **49px** anchored, **0px** modal — they disagree | N2 | Unmet | - |
| AC-003 (C3) | REQ-005 | Open a sheet, commit a field, commit a second field, then resize; compare node identity, top edge, and whether the resize repositioned it | node identity unchanged, top edge moved `0px`, and a subsequent viewport resize still repositions it | node survives; repositioning is **dead from the first commit** because `anchorEl.isConnected` is false | N4 | Unmet | - |
| AC-004 (C4) | REQ-004 | Reduce `visualViewport` to simulate the keyboard; read the focused field's rect against the visible rect | the focused field's rect is fully inside the reduced visible rect | not asserted anywhere; the phone checks never call the positioner | N7 | Unmet | - |
| AC-005 (C5) | REQ-006 | Open a sheet; measure the scrim's `getBoundingClientRect()` against the full viewport including the navbar band | scrim covers the full viewport including the navbar band | **no sheet scrim exists** | N8 | Unmet | - |
| AC-006 (C6) | REQ-008 | Remove `.mobile-navbar` from the harness DOM; rerun every phone assertion and diff | at least one asserted number moves by `> 1.35px`; C1's hit result changes as well as C6's number | moves **1.35px** — the `50` fallback at `popover-position.ts:291`, i.e. nothing | N5 | Unmet | - |
| AC-007 | REQ-002 | **Rewritten under review finding F8 — it closed on two code fragments being gone, not on an outcome.** For every anchored popover the phone census reaches — sheets and non-sheets alike — open it on a phone profile with a real `.mobile-navbar` and read `getBoundingClientRect()` against the visual viewport, before and after the branch is deleted | after the deletion: **0 popovers have any edge outside the visual viewport**, and **0 non-sheet popovers are wholly or partly obscured by the navbar band** (`elementFromPoint` at each one's centre returns that popover). The per-popover bottom-bound delta across the deletion is recorded for every popover, and any delta that pushes a non-sheet popover under the navbar rejects the deletion for that popover and forces a per-role bound instead | *blank — see the F16 provenance table below.* No single runtime number covers "every anchored popover on a phone", and the census has not run. `getVisiblePopoverBounds` is shared by every anchored popover, not only sheets, so the blast radius must be measured before the deletion rather than discovered after it | N2 | Unmet | - |
| AC-008 | REQ-003 | **Rewritten under review finding F8 — "both old symbols reach zero callers" is a call count, which the doctrine bans.** Sweep the disagreement band at 600, 620, 660, 700, 720 and 760 CSS px. At each width open one `DbModal`-presented surface and one positioner-presented surface and measure both: computed bottom offset, width as a fraction of the viewport, and whether `elementFromPoint` over the navbar band returns the surface | at every one of the six widths the two mechanisms return the **same** presentation — identical bottom offset, identical width fraction, identical hit result. **0 widths where the modal path and the anchored path disagree**, against a band that is 160px wide today | *blank — see the F16 provenance table below.* Two predicates disagree in the 601-760px band today (`isTouchDevice()` at 760px container width, `isMobileBottomSheet()` at 600px window width, the latter module-private so no caller can ask); `Platform.isPhone` is used **zero times** in the repository. No width in the band has ever been measured | N3 | Unmet | - |
| AC-009 | REQ-007 | **Rewritten under review finding F8 — an inventory is a classification, not an outcome.** Open every sheet-capable surface the runtime census reaches on a phone profile with a navbar — every positioner sheet, all 20 `DbModal` subclasses — the **2** that inherit `"sheet"` from the constructor default named explicitly alongside the **18** that pass one — and all 3 `FuzzySuggestModal` subclasses — and for each measure its computed bottom offset, its portal parent, and whether `elementFromPoint` over the navbar band returns it | **0 surfaces whose measured presentation differs from the presentation its role declares**, and for every surface that declares `sheet`: bottom offset `0px` and the navbar-band hit returning that surface. The inventory is the *input* that makes this exhaustive; the closing evidence is the measured presentation of each row | *blank — see the F16 provenance table below.* The 3 `FuzzySuggestModal` subclasses (`src/main.ts:2947`, `src/views/image-file-suggest-modal.ts:22`, `src/views/markdown-file-suggest-modal.ts:16`) bypass `DbModal`'s presentation entirely and are invisible to static analysis, so no measured presentation exists for them at all | N9 | Unmet | - |
| AC-010 | REQ-005 | **Semantic identity — the anchor lease.** With a sheet open, assert the handle holds a logical `AnchorRef` (scope + row path / cell key / event key + stable record identity) and that its DOM node reference is re-resolved at every renderer commit, never retained across one | the handle's `AnchorRef` is unchanged across a wholesale `refresh()`; the resolved node after the refresh is a different object; the sheet's declared state is `anchored(B)`, not `anchored(A)` | *census* — no logical anchor exists on the current tree. The handle holds a raw `HTMLElement`, which is why `anchorEl.isConnected` goes false and `place()` (`popover-position.ts:100`) no-ops. The lease design is the Stage-2 deliverable | N10 | Unmet | - |
| AC-011 | REQ-005 | **Transition trace.** Drive the full lifecycle: `open → anchored(A) → force renderer commit → anchor-missing(pending) → anchored(B) → close`. Assert each state is entered, and that the pending window is bounded rather than indefinite | every state observed in order; the pending window expires into an explicit close or fallback rather than retaining the last rectangle; after `anchored(B)` a viewport resize still repositions | *trace* — the surgical cases in `updateCellDOM` (`src/views/database-view.ts:8597-8619`) cover table, board, gallery and list only. Calendar and timeline — the only two views that can have the record-detail sheet open — fall through to `default: this.refresh()` (`:8615-8616`) | N11 | Unmet | - |
| AC-012 | REQ-001, REQ-004 | **Action outcome.** Tap at the navbar band and assert the sheet's own handler ran and the field it claims to edit changed; tap the scrim and assert the sheet closed and the model did not change | the navbar-band tap produces the sheet's model delta; the scrim tap produces a close with a zero model delta; 0 outcomes asserted by node presence alone | *trace* — recorded in `../architecture-findings.md` §3: **nothing drives a click, drag or commit** in any current harness, and the phone checks call only `applySheetChrome`, never the positioner | N12 | Unmet | - |
| AC-013 | REQ-004, REQ-006 | **Resource ownership and host isolation.** While a sheet is open, count owners of scrim, drag handle, scroll suppression, keyboard suppression, Escape/back dismissal; read the host's computed custom properties and `documentElement`/`body` class lists before open and while open; after close, re-read them and re-count listeners and nodes | exactly 1 owner of each kind; host computed custom properties and class lists **byte-identical** before and during open; after close, listener count, node count, scroll position and focus all return to the pre-open baseline, **and a tap at the coordinates the sheet occupied reaches the element underneath while the page scrolls again — 0 sheets leave an inert or scroll-locked region behind** | *census* — `applySheetChrome` (`src/views/mobile-bottom-sheet.ts`) handles only the sheet class and the grab handle; the plugin's sole backdrop anywhere is `db-mobile-column-width-backdrop` (`src/views/database-view.ts:10983`), for the column-width drag. No lease, no restoration and no host-isolation assertion exist | N13 | Unmet | - |
| AC-014 | REQ-008 | **Negative-control mutation.** Substitute exactly one tuple coordinate — remove the navbar, restore the `is-phone` branch, run the modal branch instead of the anchored branch, skip the commit transition, alias the anchor to a stale node, or pin `--db-mobile-sheet-bottom` again — and rerun | each single substitution fails at least one **value** assertion; a failure caused only by a missing node does not count | no such control exists. The existing suite already demonstrates the gap: with a navbar the sheet bottom offset is 49px, without it 50.35px, so **harness and device agree and both are wrong** | N14 | Unmet | - |

**C1 and C2 are the operator's defect.** C3 is the glitch. C6 is the check that the other five are
not theatre. **AC-010 and AC-011 are the ones C3 cannot replace**: C3 proves the sheet stops
repositioning, and only the anchor lease proves the fix survives the *next* view that falls through
to `default`.

### Proof-tuple coverage

A blank cell is a coverage gap and blocks closure, even when the criterion's number is valid.

| AC-ID | Producer | Runtime branch | Mount / host | Environment | Transition | Semantic outcome | Negative control |
|---|---|---|---|---|---|---|---|
| AC-001 | production | anchored sheet | body portal, navbar present | phone, safe area | open | sheet wins the hit test | N1 |
| AC-002 | production | anchored **and** modal | body portal | phone, safe area | open | one offset, both mechanisms | N2 |
| AC-003 | production | anchored sheet | body portal | phone | commit, commit, resize | still repositions | N4 |
| AC-004 | production | anchored sheet | body portal | phone, keyboard | visual viewport reduced | field stays visible | N7 |
| AC-005 | production | both | body portal | phone, safe area | open | scrim covers navbar band | N8 |
| AC-006 | harness | anchored sheet | body portal | phone | navbar removed | C1 and C6 both move | N5 |
| AC-007 | production | every anchored popover | declared mount | phone | open | blast radius recorded | N2 |
| AC-008 | production | modal + anchored | declared mount | 601-760px band | open | one predicate | N3 |
| AC-009 | production | positioner, `DbModal`, `FuzzySuggestModal` | declared mount | phone | open | every surface routed | N9 |
| AC-010 | production | calendar + timeline | body portal | phone | wholesale refresh | logical anchor survives | N10 |
| AC-011 | production | calendar + timeline | body portal | phone | full state sequence | bounded pending window | N11 |
| AC-012 | production | anchored sheet | body portal, navbar present | phone | open → tap → close | model delta / clean close | N12 |
| AC-013 | production | both | body portal | phone, both themes | open → close → teardown | one lease, host untouched | N13 |
| AC-014 | substituted | substituted | substituted | substituted | substituted | assertion fails | N14 |

### Negative controls

`N1`-`N6` are the controls already registered in `checklist.md`. `N7`-`N14` are added by this
hardening; register them in `checklist.md` when its verification protocol is next revised.

| # | Control | What it proves |
|---|---|---|
| N1 | Reverting the portal reproduces `DIV.mobile-navbar` as the C1 hit result | AC-001 measures the portal, not the z-index |
| N2 | Restoring the `is-phone` bounds branch reproduces the 49px anchored offset | AC-002 and AC-007 measure the branch |
| N3 | Restoring the second phone predicate reproduces a disagreement in the 601-760px band | AC-008 measures the predicate |
| N4 | Reverting the anchor-lifetime fix reproduces a dead `place()` after the first field commit | AC-003 measures repositioning |
| N5 | Deleting the navbar from the harness moves C1 and C6, not merely C6 | AC-006 is connected to the navbar |
| N6 | Re-pinning `--db-mobile-sheet-bottom` in `runtime-vars.css` changes a capture | Captures read the computed value |
| N7 | Restoring the layout-viewport read in place of `visualViewport` reproduces a field under the keyboard | AC-004 reads the right viewport |
| N8 | Clamping the scrim to the container reproduces a navbar band the scrim does not cover | AC-005 measures the scrim, not its class |
| N9 | Adding a `FuzzySuggestModal` subclass without routing it fails the inventory equality | AC-009 is an equality, not a count |
| N10 | Replacing the logical `AnchorRef` with the raw node reproduces the dead `place()` after refresh | AC-010 measures the lease |
| N11 | Removing the bounded pending window leaves an actionable sheet attached to a stale rectangle | AC-011 measures the state machine |
| N12 | Stubbing the field write makes the navbar-band tap's assertion fail | AC-012 asserts an outcome |
| N13 | Writing one plugin variable to `documentElement` fails the host-isolation read | AC-013 asserts isolation |
| N14 | Each single-coordinate substitution fails a value assertion | The suite is connected to every coordinate |

### F8 audit — every criterion re-tested for the "passes on today's broken tree" shape

Review finding F8 named `001/AC-008` and `005/AC-006`; the audit below re-reads every row here for
the same four shapes — closing on a **thing existing**, on a **deletion**, on a **classification**,
or on a **count**. Three rows here were of that shape and all three are rewritten.

| AC-ID | Shape found | Disposition |
|---|---|---|
| AC-001 | Outcome. A hit test with a declared pass condition | Kept unchanged |
| AC-002 | Outcome. A measured offset against the viewport, for both mechanisms | Kept unchanged |
| AC-003 | Outcome. Node identity, a measured edge and whether repositioning still happens | Kept unchanged |
| AC-004 | Outcome. A rect inside the reduced visible rect | Kept unchanged |
| AC-005 | Outcome. A measured scrim rect against the full viewport | Kept unchanged |
| AC-006 | Outcome. A deletion test whose pass condition is that a number **moves by more than 1.35px** | Kept unchanged |
| AC-007 | **Deletion.** Closed on a branch and a fallback being gone, with the blast radius merely "known" | **Rewritten.** Now closes on every anchored popover measured against the visual viewport before and after the deletion: 0 edges outside it, 0 non-sheet popovers obscured by the navbar, per-popover deltas recorded |
| AC-008 | **Count.** "Both old symbols reach zero callers" is a call count, banned outright by `../architecture-findings.md` §9 | **Rewritten.** Now closes on a six-width sweep of the 601-760px band: the modal path and the anchored path must return an identical presentation at every width, 0 disagreements |
| AC-009 | **Classification.** An inventory in which every surface "carries a row" | **Rewritten.** Now closes on the measured presentation of every row: 0 surfaces whose measured presentation differs from its declared role. The inventory makes the sweep exhaustive; it does not close the criterion |
| AC-010 | Outcome. A logical anchor surviving a wholesale refresh, with a different resolved node afterwards | Kept unchanged |
| AC-011 | Outcome. Observed states in order, and a bounded pending window that expires into a close | Kept unchanged |
| AC-012 | Outcome. A model delta from a navbar-band tap, and a clean close from a scrim tap | Kept unchanged |
| AC-013 | **Count**, in part — owner counts are countable mechanism, though the host-isolation half is a byte comparison | **Threshold extended.** Adds the user-visible consequence: the vacated region is tappable and the page scrolls again after close |
| AC-014 | Substitution control. Outcome-shaped by construction — each substitution must fail a **value** assertion | Kept unchanged |

**Rule going forward.** No row here may be marked `Met` because a branch was deleted, a symbol
reached zero callers, or a surface was added to an inventory. Those are inputs. The closing evidence
is a measured presentation, a hit test that returned the right node, or a driven action that landed.

### Failing-number provenance — the blank cells (review finding F16)

`../architecture-findings.md` §9 condition 3 makes a criterion invalid until it has been
**demonstrated to fail on the current tree, with the failing number recorded**. The rows below hold
a source fact rather than a number. Until the number is there they are unenforceable prose: a
passing measurement would prove only that a value sits inside a threshold, never that it moved.

**No number below may be invented, estimated, or carried across from another packet.** The cell is
filled by running the named producer and pasting what it printed.

| AC-ID | What produces the failing number | Stage of this phase that produces it | State until the cell is filled |
|---|---|---|---|
| AC-007 | The phone census opening **every** anchored popover, sheet and non-sheet, and recording each one's rect against the visual viewport and its navbar-band hit result — the *before* half of the deletion diff | Phase 2 (runtime census), recorded per surface by T9 | **Blocked.** Phase 4 may not delete the `is-phone` bounds branch until every affected popover has a recorded *before* bound. `getVisiblePopoverBounds` is shared, so an unmeasured deletion moves non-sheet popovers on a phone too |
| AC-008 | The six-width band sweep at 600, 620, 660, 700, 720 and 760 CSS px, measuring the modal path and the anchored path side by side at each | Phase 3 (collapse the two predicates), *before* the collapse | **Blocked.** Phase 3 may not collapse the predicates before the disagreement it is collapsing has been measured — otherwise the fix is unfalsifiable |
| AC-009 | The runtime census opening every sheet-capable surface on a phone profile with a navbar and recording portal parent, computed bottom, rect and navbar-band hit result | Phase 2, driven at runtime because static grep provably misses the 3 `FuzzySuggestModal` subclasses | **Blocked.** A surface with no measured presentation cannot be shown to have been routed |
| AC-010 | Holding a sheet open across a wholesale `refresh()` and recording whether the handle's anchor survives, what the resolved node is afterwards, and the declared state | Phase 5 (anchor lifetime), on the harness Phase 1 gave a navbar | **Blocked.** No logical anchor exists today; the handle holds a raw `HTMLElement`, which is the defect |
| AC-011 | Driving the full lifecycle and recording which states were entered, in what order, and what the pending window did when it expired | Phase 5 | **Blocked.** No harness drives a renderer commit while a sheet is open |
| AC-012 | Driving a navbar-band tap and a scrim tap and recording the model delta each produced | Phase 6 | **Blocked.** Nothing drives a click, drag or commit in any current harness, and the phone checks call only `applySheetChrome`, never the positioner (`../architecture-findings.md` §3) |
| AC-013 | Counting owners while a sheet is open; reading the host's computed custom properties and class lists before, during and after; re-counting listeners, nodes, scroll position and focus after close | Phase 4 for the owner counts, Phase 6 for the post-close baseline | **Blocked.** No lease, no restoration and no host-isolation assertion exists to count |
| AC-014 | Running each single-coordinate substitution against the finished suite and recording which value assertion each one broke | Phase 6, after AC-001 to AC-013 have their numbers | **Blocked.** A substitution control has nothing to break until the assertions it substitutes into exist |

**Enforcement.** A blank cell is not a `Waived` row and not a soft warning. This phase may not move
`Planned → In Progress` while a cell above is blank for a stage that has already run — that gate is
`000`'s blank-cell checker, and this table is what it reads. A row whose cell is still blank at
closure blocks closure exactly as an `Unmet` row does.

### Citations are selectors, not line numbers (review finding F11)

`styles.css` is 19,261 lines and three phases edit it before this one starts. **Every
`styles.css:NNNN` and every `src/**/*.ts:NNNN` here is a hint with a date on it, not an address.**
All were confirmed correct on 2026-08-29 and are kept because a number that was true on a known date
is evidence about the tree on that date. The durable anchor is the selector or the symbol.

**Resolve, never trust.** If the command and the line number disagree, the command is right.

| Cited as | Durable anchor | Command that finds it |
|---|---|---|
| `styles.css:159` | `bottom: var(--db-mobile-sheet-bottom, 0px) !important` inside `.db-mobile-bottom-sheet` — the only reader of the variable | `rg -n 'db-mobile-sheet-bottom' styles.css` |
| `runtime-vars.css:43` | the capture harness pinning `--db-mobile-sheet-bottom: 0px` — the exact value the defect lives in | `rg -n 'db-mobile-sheet-bottom' tools/screenshots/runtime-vars.css` |
| `popover-position.ts:289-294`, `:291` | the `is-phone` bounds branch and its hardcoded `50` navbar fallback | `rg -n 'mobile-navbar' src/views/popover-position.ts` |
| `popover-position.ts:299-305` | `isMobileBottomSheet()` — module-private, 600px window threshold | `rg -n 'isMobileBottomSheet' src/` |
| `popover-position.ts:115` | the sole writer of `--db-mobile-sheet-bottom`, inside the `mobileSheet` branch | `rg -n 'db-mobile-sheet-bottom' src/` |
| `popover-position.ts:100`, `:68` | `place()`'s early return on a disconnected anchor | `rg -n 'isConnected' src/views/popover-position.ts` |
| `touch-environment.ts:46-55`, `:22` | `isTouchDevice()` and `TOUCH_LAYOUT_MAX_WIDTH = 760` | `rg -n -e TOUCH_LAYOUT_MAX_WIDTH -e isTouchDevice src/data/touch-environment.ts` |
| `database-view.ts:8597-8619`, `:8615-8616` | `updateCellDOM`'s switch and its `default: this.refresh()` fall-through | `rg -n 'updateCellDOM' src/views/database-view.ts` then read to the switch default |
| `database-view.ts:10983` | `db-mobile-column-width-backdrop`, the plugin's only backdrop anywhere | `rg -n 'db-mobile-column-width-backdrop' src/ styles.css` |
| `mobile-bottom-sheet.ts:31` | `applySheetChrome` — sheet class and grab handle only, no scrim | `rg -n 'applySheetChrome' src/` |
| `main.ts:2947`, `image-file-suggest-modal.ts:22`, `markdown-file-suggest-modal.ts:16` | the 3 `FuzzySuggestModal` subclasses that bypass `DbModal` presentation | `rg -n 'FuzzySuggestModal' src/` |
| `obsidian-stub.mjs:52-57`, `:80`, `:90` | the stub hardcoding `Platform` to desktop and throwing on `Modal` / `FuzzySuggestModal` | `rg -n -e Platform -e Modal tools/storybook/obsidian-stub.mjs` |

**When a number moves, do not silently correct it.** Record the old number, the new number and the
edit that moved it.

### No criterion rests on a pre-repair harness measurement (review finding F3)

`tools/storybook/verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it
targets the **phone** page. That is the half this packet needs, so the desktop blindness bites less
here than elsewhere — but two consequences still apply.

**First, the desktop half of AC-007 and AC-008.** Both sweep behaviour across a width band, and the
upper end of the 601-760px band and the non-sheet popover census reach desktop-shaped layouts. Any
number this packet records from the **desktop** harness page before `000` repairs its stylesheet
load is discarded rather than re-used.

**Second, the phone page is loaded but not driven.** The phone checks call only `applySheetChrome`
and never the positioner, so the offset math the whole packet is about has never been exercised even
on the page that does have the cascade. Phase 1 fixing this is a gate, not a task: if the harness
cannot distinguish a navbar from no navbar, work stops there.

`009`'s live probe is the only instrument outside this program's own reach. A harness number and a
`009` number that disagree is a blocking failure for this packet, not a curiosity — and this packet
is the one where that matters most, because a phone harness and a real phone differ by exactly the
`.mobile-navbar` the defect is about.

### The `styles.css` lane — when this packet takes it and what it must run to release it

`styles.css` is a single serialized lane (parent `spec.md` §4). This packet is sixth in the
execution order, after `000`, `004`, `005`, `001` and `002`, and it is the riskiest change in the
program: it moves surfaces to a different place in the document.

**Takes the lane** at the start of Phase 4 (*Presentation contract, then the portal*), which builds
the scrim and the sheet's own rules. Not earlier: Phases 1 to 3 are harness, census and predicate
work and must run against an unedited stylesheet.

**Holds it** through Phases 4 and 5. No other phase may edit `styles.css` in that window.

**Releases the lane** only when all four of these have happened, in order:

1. **Full recapture, with a navbar present** — a condition no capture has ever had — then
   `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` proves a
   capture was regenerated after its hand-maintained source list changed and **never opens an
   image**, so it cannot be this step. It matters more here: `runtime-vars.css:43` pinned
   `--db-mobile-sheet-bottom` to `0px` for every capture ever taken, so the captures could never
   have shown this defect and a reviewer has no prior mental image to compare against.
3. **`008`'s early replay re-asserts every previously-closed phase** — `000`, `004`, `005`, `001`
   and `002` — against the released tree. They closed against a snapshot this packet has just
   edited, and a portal changes stacking and containment for everything mounted near it.
4. **Cascade re-confirmation** — every duplicated selector this packet touched has its computed
   winner recorded; a changed winner carries a written disposition.

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

**No row in the table above was `Met` when this audit ran** — this packet reopened all of them on
2026-08-29 — **so no tick was withdrawn and `completion_pct` does not move.**

The supplies, by number: **1** `--keyboard-height`, set by the harness at
`verify-placement.mjs:819`, `:4724` and `:4753`, and by nothing in `src/`. **2** values
`runtime-vars.css` pins where the runtime computes them. **3** production actions replaced by
stubs. **4** host chrome the harness builds by hand. **5** Obsidian's `app.css`, absent except for
one `button` rule.

**9 sound · 5 harness-dependent · 0 unknown.**

**The navbar is the supply that runs through this packet.** Every criterion whose subject is "the
sheet covers the navigation bar" is measured against a hand-written
`<div class="mobile-navbar" style="position:fixed;left:0;right:0;bottom:0;height:72px">`
(`verify-placement.mjs:409`) carrying no `app.css` rule, no stacking context of its own and no
z-index. That div is a stand-in for the element the operator's defect is about. The harness has
done real work here — `contain: strict` and `isolation: isolate` are reproduced verbatim from
`app.css` at `verify-placement.mjs:166`, and `.app-container.mod-static-nav` models the non-floating
configuration — but a hit test against a stand-in is a hit test against a stand-in.

**One supply is now spent.** `--db-mobile-sheet-bottom` is no longer pinned; `runtime-vars.css`
records its removal in the file's closing comment. C2's exposure is narrower than it was.

| AC-ID | Class | Supply | On a device |
|---|---|---|---|
| AC-001 | **Harness-dependent** | 4, 5 | The headline. `elementFromPoint` over the navbar band must return the sheet. Here the competitor is a bare fixed `div` with no z-index and no host rule; a body-portalled sheet beats it almost by default. **On a device the competitor is Obsidian's real navbar, carrying whatever `app.css` gives it — plausibly its own stacking context, in which case the portal's z-index is compared inside a different stack and can lose.** The criterion is right and the instrument cannot decide it. This is the check that was green while the operator's phone showed the defect |
| AC-002 | Sound | — | Bottom edge against the visual viewport for both mechanisms, and the two must agree. Both offsets are produced by plugin arithmetic and the disagreement between them is a plugin fact. The recorded 49px is scaled by the hand-built 72px navbar and should be re-recorded, but "both mechanisms return one offset" holds under any navbar |
| AC-003 | Sound | — | Node identity, a top edge that moved 0px, and whether a later resize still repositions. `anchorEl.isConnected` going false after a wholesale `refresh()` is plugin state end to end, and it fails on a device for exactly the reason it fails here |
| AC-004 | **Harness-dependent** | 1 | The criterion as written is sound: reduce `visualViewport` and assert the focused field stays inside the reduced rect. **The instrument that would answer it injects the variable instead** — `verify-placement.mjs:4724` and `:4753` set `--keyboard-height: 336px` on the document element, and nothing in `src/` ever sets it. The plugin's own `keyboardInset()` takes `max(host variable, visual-viewport shrink)`, so driving the viewport exercises the robust path and injecting the variable exercises the fragile one. Drive `visualViewport`; do not set the variable |
| AC-005 | **Harness-dependent** | 4 | The scrim's own rectangle is plugin geometry and the containment that bounds it is reproduced from `app.css` — that half is sound. The criterion's subject, though, is coverage **of the navbar band**, and the band is the stand-in div's. A scrim proven to cover 72px of hand-built chrome is not a scrim proven to cover Obsidian's bar. The recorded value — no sheet scrim exists at all — is a source fact and stands |
| AC-006 | Sound | — | Harness-measuring by construction: the row exists to prove the other five are not theatre. Note the `> 1.35px` threshold is calibrated to the 72px stand-in and the hardcoded `50` fallback at `popover-position.ts:291`; it is not a device number, and the cell already says harness and device agree and both are wrong |
| AC-007 | **Harness-dependent** | 4 | "0 non-sheet popovers wholly or partly obscured by the navbar band", decided by `elementFromPoint` at each popover's centre. Same stand-in, same objection as AC-001, over a wider population. The per-popover bottom-bound deltas across the deletion are plugin arithmetic and are worth recording either way |
| AC-008 | Sound | — | The six-width sweep of the 601-760px band. Two of the three observables — computed bottom offset and width as a fraction of the viewport — are plugin arithmetic, and the predicate disagreement between `isTouchDevice()` and `isMobileBottomSheet()` is a plugin fact. Only the third, the navbar-band hit, inherits the stand-in; the criterion can still fail for the right reason through the other two |
| AC-009 | Sound | — | Measured presentation against declared role for every positioner sheet, all 20 `DbModal` subclasses and the 3 `FuzzySuggestModal` subclasses. Bottom offset and portal parent are the plugin's; the navbar hit is one observable of three |
| AC-010 | Sound | — | The anchor lease surviving a wholesale `refresh()`, with a different resolved node afterwards. Pure plugin state, and `000`'s exit criterion consumed here |
| AC-011 | Sound | — | Observed states in order and a bounded pending window. Plugin state machine |
| AC-012 | **Harness-dependent** | 3, 4 | Two supplies at once. The tap lands on the navbar band — the stand-in — and it must produce "the sheet's model delta", which in the harness means asserting against `editCell: () => {}` (`verify-placement.mjs:2434`, `:4268`, `:4523`). The scrim half is sound. As written the row cannot close honestly on either instrument |
| AC-013 | Sound | — | **The best-built row in the packet.** Reading the host's computed custom properties and class lists before, during and after the open is a *differential on one document*, so a missing `app.css` cancels out of both sides. The added consequence — the vacated region is tappable and the page scrolls again — is observable without any host rule |
| AC-014 | Sound | — | A substitution suite over its own coordinates. One coordinate, "pin `--db-mobile-sheet-bottom` again", now requires re-adding a pin that has been removed; still runnable, and worth keeping as a regression guard on the removal |

**What would settle AC-001, AC-005 and AC-007 together.** They are one question — does a portalled
sheet win against Obsidian's real navigation bar — and no harness fixture can answer it. `009`'s
live probe against the running app is the instrument, and `000`'s AC-013 is the criterion that
requires the pairing. Until that pair exists for the navbar band, this packet's headline is
uncorroborated and should be listed as such rather than left silent.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 2b. THE FIVE STATEFUL DIMENSIONS — 2026-09-01

| Dimension | Where this packet answers it | Evidence |
|---|---|---|
| **Semantic identity** | The sheet holds the record it was opened on | `010`'s refresh case: opened on `A.md`, still holds `A.md` after a rebuild, resolved by column key |
| **Transition trace** | Open → keyboard → close, and open → press → dismissed | `010`'s keyboard sequence `844 → 508 → 844`, plus the backdrop press driven here |
| **Action outcome** | *new here* — the press does something, not merely lands somewhere | `sheet still mounted after the press=false, backdrop still present=false`. Red with the outside handler removed: both `true` — a dimmed surface swallowing taps |
| **Resource ownership** | The scrim and sheet come down together, and the handler count is bounded | `sheet-teardown` for the producer parity; here, `1 capturing pointerdown handler with one menu open, 2 with two` |
| **Negative-control mutation** | The scrim's pointer opt-out, plus the handler removal above | `012`'s registered control: `{scrimCapturesPointer: false}` reads `none` and the press resolves to `<td>` |

**Everything previously measured about the backdrop established that it can RECEIVE a press** — that
it arrives with the sheet, leaves with it, is modal by default, and takes a press aimed at a cell.
None of it established that receiving one does anything. **A backdrop that swallows every tap and
dismisses nothing is the freeze this program opened for**, and it passes every one of those checks.

The press is driven where a thumb reaching past the sheet actually lands — above the sheet's top
edge, not at the backdrop's centre, which would land on the sheet and be a different gesture.

### Recorded, not asserted: two stacked menus dismiss together

Measured: with two owned menus open, one backdrop press closes **both** — `top dismissed=true,
beneath survived=false`.

That follows from the factory's design rather than contradicting it. `createOwnedMenu` adds its own
capturing `pointerdown` per menu and treats any press outside ITSELF as dismissal — its comment says
so: *"the sheet's backdrop is a rectangle, not a handler … an outside press like any other"*. Two
menus, two handlers, one press, both gone.

**Whether the plugin ever stacks two independent owned menus is not established here** — a submenu
portals a `db-column-menu-subpopover` rather than opening a second owned menu. So the check asserts
the *mechanism*, which is decidable (one handler per open menu), and this consequence is recorded as
a question with its number rather than as a defect nobody has shown a reader can reach.

---

## 3. CLOSURE STATEMENT

**Closeable:** No

Work has not started. Every row is `Unmet`. AC-001 to AC-006 carry the failing number measured on
the current tree.

**AC-007, AC-008 and AC-009 were rewritten under review finding F8.** They closed on a branch being
deleted, on two symbols reaching zero callers, and on an inventory being complete — a deletion, a
call count and a classification, none of which is an outcome and the second of which
`../architecture-findings.md` §9 bans outright. They now close on measurements: every anchored
popover inside the visual viewport and clear of the navbar across the deletion; the modal and
anchored paths returning an identical presentation at all six widths of the disagreement band; and
0 surfaces whose measured presentation differs from its declared role.

**AC-007 through AC-014 have no recorded failing number and are `Blocked`, not merely `Unmet`**
(review finding F16). Each is listed in the provenance table above with the artefact that produces
its number and the stage that produces it. A criterion with a blank cell can be satisfied without
proving anything moved, so it blocks closure the same way an unmet one does. Two of them gate
irreversible work: Phase 4 may not delete the shared `is-phone` bounds branch until every affected
popover has a recorded *before* bound, and Phase 3 may not collapse the two predicates until the
disagreement it is collapsing has been measured across the band.

Every line number here is a dated hint; the selector or symbol plus the command in the citation table
is the address (review finding F11). The phone harness page loads `styles.css` but has never driven
the positioner, and no desktop number recorded before `000`'s repair is admissible (review finding
F3).

This spec does not close on gate passage alone — that is precisely what 1.3.1 did. It closes when
the measurements above have moved from their recorded failing values, every proof-tuple cell is
filled, negative controls N1-N14 hold, the anchor lease in REQ-005 has landed with its bounded
pending window, and **the operator has confirmed on a phone that the sheet covers the bottom
navigation bar.**
<!-- /ANCHOR:closure -->
