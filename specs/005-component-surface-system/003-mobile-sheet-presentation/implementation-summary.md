---
title: "Implementation Summary: Mobile Sheet Presentation"
description: "The phone sheet reaches the viewport floor and covers the navigation bar, with a real scrim and a grab band it no longer steals the header with. Three of eight requirements were delivered by a different design than the one specified, and none of it is operator-confirmed."
trigger_phrases:
  - "003 mobile sheet summary"
  - "sheet portal shipped"
  - "sheet scrim shipped"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/003-mobile-sheet-presentation"
    last_updated_at: "2026-08-30T18:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Portal, scrim, sheet layer and grab band recorded from git and the lane journal; 0% drift closed"
    next_safe_action: "Sweep 600-760px on both sheet paths, the evidence REQ-003 needs before collapsing"
    accepted_shortfalls:
      - "Record-sheet grab band 32px against the operator's 48px ask; accepted after the fit was measured"
    blockers:
      - "No operator confirmation that a sheet covers the navbar on a real handset"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../../../../src/views/mobile-bottom-sheet.ts"
      - "../../../../src/views/popover-position.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-003"
      parent_session_id: null
    completion_pct: 50
    open_questions:
      - "Does REQ-002 stand as written now that sheets bypass the shared bounds rather than delete it"
    answered_questions:
      - "The portal is required; paint containment on the workspace leaf defeats every z-index"
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 003-mobile-sheet-presentation |
| **Shipped** | 2026-08-29 to 2026-08-30 |
| **Level** | 3 |
| **Status** | In Progress |
| **State** | The headline requirement is shipped and harness-verified. Three of eight requirements were not delivered as specified, no task or checklist item is ticked, and the operator has not seen it on a handset |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

A phone sheet now reaches the bottom of the screen and covers Obsidian's navigation bar, which is
the requirement this phase is judged on. It arrives over a real scrim, and its grab band no longer
takes presses aimed at the sheet's own title and header actions.

| # | Delivered | Evidence |
|---|---|---|
| 1 | **The portal.** A sheet is moved to `document.body` on open and returned to its remembered parent and next sibling on close; if that parent died while the sheet was open the node is removed rather than reattached to a detached tree | `src/views/mobile-bottom-sheet.ts:123` (`setSheetMount`); commits `f3ffc91`, `4bd11b8` |
| 2 | **The token and scope carry.** The portalled root is marked `db-surface` *and* `note-database-container`, because most rules here are written `.note-database-container .db-thing` and a sheet that leaves the container stops matching them | `src/views/mobile-bottom-sheet.ts:150-151`; `4bd11b8` |
| 3 | **The sheet layer.** `position: fixed`, the modal z-index the rule never had, `bottom` read from `--db-mobile-sheet-bottom`, and a `max-height` that comes down by however far the bottom edge went up | `styles.css:177-212`; `f3ffc91`, `4bd11b8` |
| 4 | **The scrim — new construction.** A bare `div` sibling of the sheet on the body at 25% black, capturing presses by default, one z-index below the sheet. It had been a `::before` with `z-index: -1`, which cannot paint behind a host that establishes its own stacking context, so it tinted the sheet instead of dimming the app | `styles.css:222-229`, `src/views/mobile-bottom-sheet.ts:196` (`setScrim`); `4bd11b8` |
| 5 | **The grab band, and the header it stopped stealing.** A full-width band replaces a 36px bar. On the record sheet the band was reaching 50px — past the sheet's own header — so that surface got its own rule anchored to the sheet's top edge and ending at the handle's margin box | `styles.css:259-303`; `c31acf5`; lane entry 47 |
| 6 | **Header actions sized together.** A 10px centre stagger removed and the expand action raised from a 24px to a 44px target | lane entry 45 (`f85d2bebf330`) |
| 7 | **One overlay fill** across the sheet surfaces, and menu-row grammar keyed to the row so a row lays out the same in any container | lane entries 46, 47 |
| 8 | **A harness that can tell the difference (REQ-008).** The browser harness gained a `.mobile-navbar` and a real safe-area inset; `runtime-vars.css` stopped pinning `--db-mobile-sheet-bottom` to `0px`; the phone checks drive the real positioner instead of `applySheetChrome` alone | `tools/screenshots/runtime-vars.css:95-104` records the pin's removal; `37a5452`, `b890209` |

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `src/views/mobile-bottom-sheet.ts` | Modified | Portal, scrim construction, token and scope carry |
| `styles.css` | Modified | Sheet layer, scrim, grab band, record-sheet band override |
| `tools/screenshots/runtime-vars.css` | Modified | Pin removed so a capture shows the computed offset |
| `tools/storybook/verify-placement.mjs` | Modified | Leaf containment modelled; checks that drive the positioner |
| `tools/live/probe.mjs` | Created | Reads the host navbar's z-index from the running app |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

**Three attempts, and the first two passed their own checks.** That is the phase's real content.

`f3ffc91` portalled the sheet and gave it the modal layer, and its own commit message records the
check nearly certifying itself: written with the sheet's host created directly on the body, it
passed with the portal disabled, because the sheet won the hit test on DOM order alone. The negative
control caught it by staying green while the mechanism was switched off.

`b890209` then reversed the diagnosis. An independent review found the cause was neither change: the
positioner wrote the sheet's bottom offset from bounds that deliberately subtract the navigation bar
and the safe-area inset — 72 + 34 = 106px on a phone — so the sheet was parked 106px above the floor
regardless of where it was mounted. The three harness checks written for the portal had been green
throughout, and none of them drove the positioner, so the line that decides the outcome was never
executed by any check. They were replaced by three that call `positionToolbarPopover` and measure
where the sheet lands.

`37a5452` built the instrument that settles it. Obsidian's shipped stylesheet puts `contain: strict`
and `isolation: isolate` on `.workspace-leaf`; paint containment makes the leaf the containing block
for fixed-position descendants. Modelling a leaf that stops 80px above the screen bottom produced
the first check in this repository capable of showing the operator's defect, and it showed it: 17 of
18, the eighteenth declared red against the phase that owned it.

`4bd11b8` closed it. The portal *is* required — no z-index escapes paint containment at any value —
and it broke the sheet the first time because it left the subtree the rules are written against.
Carrying the container marker fixed that, and the scrim had to stop being a pseudo-element.

The 2026-08-30 lane work (entries 44-48) landed in the working tree at 04:52-05:18 UTC and was
committed inside `c31acf5`, whose message describes the checkbox, list-row and card-formatting work
of other phases and never mentions the sheet band. **Commit messages alone misattribute this phase.**
The band is in that diff and the lane journal is what proves whose it is.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| A portal, not a z-index | Measured, twice: `elementFromPoint` over the navbar returns the navbar at 9999, and a reviewer measured a sheet losing the hit test at the maximum integer. `contain: strict` on the workspace leaf makes it the containing block, so `bottom: 0` resolves against the leaf and lands 72-80px short |
| Carry `note-database-container` on the portalled root, not only `db-surface` | The token class alone shipped once and rendered the sheet as unstyled text over the view. Most rules are ancestor-scoped to that container, so the sheet has to *be* the ancestor they name until those rules are re-keyed |
| The scrim is a body sibling, not a `::before` | A pseudo-element with `z-index: -1` is trapped inside the sheet's own stacking context, which the sheet establishes from `isolation` and its entrance transform. It painted the surface 58% grey while its computed background said white |
| The scrim captures presses by default | A sheet that lets taps through is not a sheet — the surface behind stays live under a dimmed overlay, which reads as the app ignoring you. A caller that wants a non-blocking backdrop opts out at the call site |
| **The `is-phone` bounds branch was kept, not deleted** | REQ-002 says delete it. What shipped instead is `placeSheet()`, a separate path that writes the sheet's own offset, leaving the shared branch intact for the anchored popovers that legitimately need to clear the navbar. This is a deviation, recorded rather than smoothed over — see Known Limitations |
| The record sheet gets its own band rule | The shared band reached 50px on that surface, covering the title outright and the top 18px of both 44px header actions. A drag target that swallows a rename and two buttons is not a bigger target, it is a wrong one |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

Run from the final state on 2026-08-30, exit codes read from `$?` without a pipe.

| Gate | Result |
|---|---|
| `npm run gate` | **16 green, 0 red, exit 0** |
| `node tools/storybook/verify-placement.mjs` | **218/223, 5 red for a declared reason, exit 0** |

**The total is not the 216 written elsewhere in this packet, and the reason is dated rather than
environmental.** Commit `ff3d241` added seven card/cell numeric-formatting checks, one of which is
the fifth declared red, taking the harness from 216 to 223. It touches no sheet check. The run above
was taken twice — once while that change was still uncommitted and once at `ff3d241` — and both
report 218/223. Any 212/216 in this packet predates that commit.

### The six criteria, measured

| # | Criterion | Result |
|---|---|---|
| **C1** | The sheet wins the navbar band | **Met as geometry, not as a hit test.** `the sheet's rectangle covers the navigation bar's band — sheet 531-844 navbar 772-844`, and `a sheet reaches the screen bottom even when the workspace does not — sheet bottom=844 leaf bottom=764 viewport=844`. The surviving check is a rectangle comparison at `verify-placement.mjs:550-554`; the `elementFromPoint` instrument the spec names was removed in `b890209` and no check replaces it |
| **C2** | Bottom offset `0px` for both mechanisms | **Met.** Positioner path: `the sheet's bottom offset is zero, not the navbar-avoiding inset — computed bottom=0px`. Modal path: `sheet=true bottom=0px rect.bottom=844 viewport=844 width=390/390`. Was 49px anchored against 0px modal |
| **C3** | The sheet survives a field commit | **Partly met, and not by this phase.** `the grab handle survives a field refresh — after refreshRecordDetailPanel the sheet's first child is db-mobile-bottom-sheet-handle` and `LIFETIME a surface whose anchor was destroyed stops presenting as placed — visibility before=visible after=hidden`. That hide-on-dead-anchor behaviour arrived in `6179aef`, which is `015`'s commit. The resize half is **not** met: `openRecordDetailPanel` registers `onResize = close()`, a standing declared red |
| **C4** | The focused field stays visible under a keyboard | **Met, delivered by `010`.** `a declared keyboard height lifts the sheet clear of it — --keyboard-height:336px moved the sheet's bottom edge 844 -> 508 on an 844px screen (clearance 336px)` |
| **C5** | The scrim covers the full viewport | **Met.** `the scrim is a 25% black modal layer`; `the scrim blocks the app behind the sheet — a press 120px above the sheet lands on db-mobile-sheet-scrim`; `the scrim does not steal the grab band — a press on the band lands on the grab handle; sheet z=1000, scrim z=999` |
| **C6** | Removing the navbar moves an asserted number | **Met.** `phone bounds are derived from the navbar on the page, not the hardcoded fallback — bounds.bottom=738 expected=738 (viewport 844 - navbar 72 - inset 34); a fallback-derived bound would sit near 794`. The 1.35px artefact is gone; the sensitivity is 56px |

### The grab band is three surfaces, three numbers

Measured through the browser in the same run. They are not four records of one band and must not be
reconciled into one figure.

| Surface | Band | Reported by the run |
|---|---|---|
| **Record sheet** | **32px** | `band 32px (26 above the bar + 5 below), starting 1px from the sheet's top edge, reaching 120px sideways=true` and, separately, `band answers presses over y=1..32 of the sheet = 32px`, `band x=1..386 = 386px of a 390px sheet` |
| **Owned-menu sheet** | **44px** | `band 44px (14 above the bar + 29 below + the centre pixel; want >= 44) ... the band ends 44px from the sheet's top edge and the first row starts at 47px, 0 of 19 rows answered by the band` |
| **Add-view sheet** | **48px** | `usable band 48px (18px above + 29px below + the centre pixel; want >= 44) ... 0 of 12 controls answered by the band` |

**The record sheet is the surface the operator's decision is about, and that decision stands.** It
ships at 32px against a 48px ask, accepted with the constraint measured: 33px of chrome above its
header leaves nowhere for a taller band. The other two carry the shared rule that `020` re-anchored
and are above the 44px floor. Only the record sheet's 32px belongs in any sentence about the
accepted shortfall.

What the band stopped costing is measured too: `the sheet's grab band takes no press that was aimed
at the sheet's own header — 2 header action(s) and the title, 0 of them answered by something else`,
with `db-board-card-open=44px of 44px, db-cell-edit-close=44px of 44px (under the band they measured
26 of 44)`, and `two taps at the title's centre opened 1 rename editor(s) (want 1) — under the grab
band this was 0`.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

**REQ-003 did not ship.** Both phone predicates are still live and still disagree between 601px and
760px. `isMobileBottomSheet` is exported at `src/views/popover-position.ts:569` and called at `:102`
and `owned-menu.ts:168`; `isTouchDevice` is defined at `src/data/touch-environment.ts:46` with 54
references across `src/`; `Platform.isPhone` is used **zero** times, exactly as the spec found it.
The six-width sweep at 600, 620, 660, 700, 720 and 760 that AC-008 requires **has never been run** —
and the spec says it must be run *before* the collapse as well as after, or the fix is unfalsifiable.

**REQ-002 was satisfied by a different design, and the spec has not been amended.** The `is-phone`
branch is still at `src/views/popover-position.ts:509-513`, still subtracting navbar height and
safe-area inset, and the `50` fallback is still at `:511`. Sheets bypass it through `placeSheet()`
(`:323-351`), which writes `bottom` from the keyboard inset — zero when no keyboard is open. The
outcome the spec wanted is measured green; the mechanism it named is untouched. This is arguably the
better answer, because it avoids the shared-bounds blast radius the spec warned about — but that
makes it an amendment to propose, not a box to tick. **AC-007's blast-radius measurement became moot
rather than answered:** no before-and-after bound was ever recorded for a non-sheet popover.

**REQ-004's "one writer" did not ship.** `--db-mobile-sheet-bottom` has three writers today:
`popover-position.ts:335`, and `mobile-bottom-sheet.ts:134` and `:155`. Both mechanisms return 0px,
so the *value* is consistent; the contract that would make a non-conforming sheet a build error does
not exist.

**REQ-005's outcome exists but is not this phase's work.** The dead-anchor hide came from `6179aef`,
`015`'s placement repair. Neither design this spec offered — surgical `updateCellDOM` cases for
calendar and timeline, or identity-based anchor re-resolution — was built. `updateCellDOM` still
falls through to `default: this.refresh()` for calendar, timeline and chart.

**REQ-007's census was never run.** No artefact in `tools/live/` records a row per positioner sheet,
per `DbModal` subclass or per `FuzzySuggestModal` subclass with a measured `bottom` and the two
node/anchor survival booleans that T5-T10 require. `surface-census.json` is a class census from
`000` and does not answer this.

**C1's own instrument is gone.** The spec closes C1 on `elementFromPoint(centreX, navbarCentreY)`
returning the sheet. The harness asserts a rectangle overlap instead. Rectangle coverage is
necessary and is not sufficient — it is exactly the substitution the earlier attempt was caught
making. Restoring a hit test over the navbar band would settle it.

**No number for the host's real navbar z-index.** The sheet clears a navbar at 100 and 1000 and
loses at 5000; Obsidian's value cannot be read from a fixture. `probe.mjs --check navbar` reads it
from the running app and exits 2 while Obsidian is closed. `b890209` verified from the shipped app
bundle that the navbar declares no z-index at all, which makes the point moot in practice and
unproven at runtime.

**Nothing is ticked and nothing is signed.** `tasks.md` carries 0 of 27 tasks checked, `checklist.md`
0 of 58 items. Negative controls N1-N6 are all unchecked and there is no record of any of them being
run. The lane release the spec demands — a full recapture **with a navbar present**, a named human
opening every changed PNG, and `008`'s replay of `000`, `004`, `005`, `001` and `002` — has no
recorded sign-off; the only `capture-review.md` in the tree belongs to `000`.

**Not operator-confirmed.** The spec's own words: "DONE MEANS the operator opens a sheet on their
phone and it covers the nav bar." That has not happened. Every number above is a harness number, and
this program exists because a release passed every gate and changed nothing on device.

**Why 70%.** Four of eight requirements delivered and measured (001, 006, 008, and 004's value if
not its contract), two delivered by a different design or a different phase (002, 005), two not
delivered at all (003, 007) — against zero task closure, zero sign-off and zero device confirmation.
It is not 100 and cannot be: per decision D3 only operator confirmation closes anything.

<!-- /ANCHOR:limitations -->
