---
title: "Decision Record: Board Anytype Parity"
description: "The decisions this packet takes, starting with the reversal of the board half of the 2026-09-04 Project Manager 1:1 ruling."
trigger_phrases:
  - "056 decision record"
  - "board parity reversal adr"
  - "anytype board adr-001"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-05T23:40:00Z"
    last_updated_by: "design-leaf"
    recent_action: "added adr-005 on the gate lane and adr-006/007 for the operator R6/R7 rulings"
    next_safe_action: "Carry the superseding note into 038 and 047, then run T002"
    blockers:
      - "None: all four ADRs here are Accepted; the ungrouped-column string is the operator's"
    key_files:
      - "src/views/board-renderer.ts"
      - "specs/005-component-surface-system/038-board-kanban-port/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "The board half of the 2026-09-04 Project Manager 1:1 ruling is superseded; the gantt half is not"
      - "Parity by default is inherited from 051 ADR-007 without re-asking"
      - "045's card-property mechanism is kept and retargeted, not rebuilt"
      - "Four accessibility declines and one platform decline, each with its measured ratio"
---
# Decision Record: Board Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:decisions -->
## ADR-001: The board's parity target moves from Project Manager to Anytype

**Status**: **Accepted** — 2026-09-05 ~22:45, operator.

**Context.** On 2026-09-04 the operator ruled *"copy their board view 1:1 from Project Manager"*.
`038-board-kanban-port` did exactly that and shipped it in 0.0.16, 0.0.18, 0.0.19 and 0.0.20; its
T12 in-repo half was verified at `c563f08` with fourteen carried-forward elements matched to the
pixel. `../roadmap.md` section 4 rows 37 and 38 hold the operator-only halves of that comparison
for the board and the gantt respectively, and on 2026-09-05 the operator added *"align closer"* to
both, which `047-competitor-references-and-pm-alignment` picked up as T012-T014.

Then the operator saw Anytype. On 2026-09-05 ~22:45, verbatim:

> *"Board UI/UX should almost be 1:1 Anytype"*

> *"Same for calendar etc."*

and, asked to disambiguate how far "etc." reached:

> *"Board + calendar to Anytype; gantt stays PM"*

> *"Make sure we have phases for that"*

**Decision.** The board is rebuilt against Anytype's captured kanban. This **supersedes the board
half** of the 2026-09-04 Project Manager 1:1 ruling. The gantt half is untouched: `037`'s copy
stands, and rows 37/38's *"align closer"* now applies to the gantt alone.

**Why the split is coherent rather than arbitrary.** Anytype ships no timeline layout. There are
six set layouts in the capture sweep — Grid, Gallery, List, Kanban, Calendar, Graph — and no gantt
among them. There is no Anytype timeline to port the gantt to, so the gantt keeps the only 1:1
reference it has. The table is a third case and is neither: it stays ours, with Anytype grid
patterns adopted where the captures show them better, which `050`, `053` and `054` already carry.

**Consequences.**
- `038-board-kanban-port`'s shipped board is superseded, not deleted. Its documents keep their
  record as history and carry a superseding note pointing here.
- `047`'s T012-T014 narrow to the gantt. The board half of that leg was stopped on the night of
  2026-09-05 with two uncommitted files in worktree `impl-047-align`, disposable.
- `../roadmap.md` section 7.12 records this as a conflict resolved by the newer instruction, named
  rather than silently overwritten — section 7's own rule.
- Three shipped releases carry a board that is now off-target. Nothing is rolled back; the board is
  rebuilt forward.

**Alternatives rejected.**
- *Keep the Project Manager board and add Anytype touches.* Rejected: the operator said *"almost
  1:1 Anytype"*, and a hybrid is neither reference, which is exactly the state the align-closer
  rows were opened against.
- *Move the gantt too.* Rejected by the operator's own clarification, and impossible besides —
  there is no Anytype timeline layout in the capture sweep to move it to.
- *Reopen `038` rather than open a new phase.* Rejected: `038` shipped and verified a different
  target. Reopening it would make its record say two contradictory things at once. The operator
  also asked for phases explicitly — *"Make sure we have phases for that"*.

---

## ADR-002: Parity by default on the board, with accessibility as the only ground for declining

**Status**: **Accepted** — inherited from `051` ADR-007 (operator: *"Yes, parity by default"*,
2026-09-05 ~18:30), applied here without re-asking.

**Context.** `051` established the posture for the modal and sheet family: every value the captures
show is adopted, and the only permitted grounds for declining one are WCAG 1.4.11 (non-text
contrast), WCAG 1.4.3 (text contrast) and a 44px touch floor. The board is the same operator, the
same reference product and the same week.

**Decision.** The board adopts every captured value. A declined value names its accessibility
ground and its measured ratio or size. Taste is not a ground, and neither is "ours is fine".

**Consequences.**
- One decline is already known and recorded: the sticky scrollbar's colours. Anytype's
  `#B6B6B6`/`#EBEBEB` is a fixed light-theme pair, and this is an Obsidian plugin where the
  reader's theme owns scrollbar chrome. The **geometry** is adopted; the colours are not
  (`050/design-trueup.md` REQ-003). This is a platform ground rather than an accessibility one and
  is named as such rather than filed under WCAG.
- `050`'s two refusals carry over unchanged: the `#232323` row highlight at 1.14:1, and
  colour-only active-state signalling.

**Alternatives rejected.**
- *Adopt the scrollbar colours too.* Rejected: it would paint a fixed light-theme grey over every
  dark Obsidian theme, which is a worse outcome than the deviation.

---

## ADR-003: `045`'s card-property mechanism is kept and retargeted, not rebuilt

**Status**: **Accepted** — orchestrator decision, reversible default.

**Context.** `045-board-card-properties` shipped on main at `56a34199` and owns which properties
appear on a board card and the panel that configures them. A rebuild of the board could plausibly
absorb it.

**Decision.** The mechanism stays. Only the presentation of its property rows moves to the captured
card's row shape. `board-card-properties-panel.test.ts` staying green **without modification** is
the guard, and is written as AC-006.

**Consequences.**
- A leg that needs to edit that test to pass has broken the mechanism rather than retargeted the
  presentation, and must stop.
- `045`'s ADR-001 — which cites `007-gallery-view-deprecation` as the reason the gallery does not
  share this mechanism — is unaffected.

**Alternatives rejected.**
- *Fold the mechanism into the new card construction.* Rejected: it is shipped, tested and
  operator-visible; rebuilding it would put a working feature at risk for no captured reason.

---

## ADR-004: The four accessibility declines T001 measured, and the two values that look declinable and are not

**Status**: **Accepted** — 2026-09-05, on T001's capture read. ADR-002 is the posture; this is the
list it demanded.

**Context.** ADR-002 says every captured value is adopted and a decline must name WCAG and a number.
`design-trueup.md` sections 2 and 3 measured the board, and Anytype's **light theme** fails WCAG
1.4.3 on the board systematically rather than in one place. The dark theme passes everywhere it was
sampled, 4.96:1 to 13.71:1, and is adopted verbatim.

**Decision.** Four declines, each with its ratio, plus one platform decline carried from ADR-002.

- **E1 — the light-theme option colour as bare text (WCAG 1.4.3).** The column-header chip puts the
  raw option hue on the page background at ~13px. Five of the seven rendered colours are below
  4.5:1: yellow `#C09B26` **2.64:1**, amber `#B97C37` **3.50:1**, grey `#888888` **3.54:1**,
  ungrouped `#828282` **3.84:1**, red `#C45426` **4.52:1**. The replacement is **Anytype's own
  answer**, taken from its card chip: the tint fill plus the darkened text of the same hue, which
  measures **6.11:1** for that amber. The chip's shape, 24px height, 12px radius and 8px inset are
  adopted unchanged; only the unfilled treatment in light theme is declined.
- **E2 — the light-theme secondary text on the card (WCAG 1.4.3).** `#828282` on `#FFFFFF` =
  **3.84:1** carries the type line and every property value on every card. Anytype's dark-theme
  equivalent `#A3A3A3` on `#191919` = **6.97:1** passes, so the role and the rhythm are adopted and
  the hex is replaced by the lightest theme grey that clears 4.5:1. Same shape as `051` ADR-007 E2.
- **E3 — the destructive row (WCAG 1.4.1).** `Move to Bin` in `anytype-menu-kanban-card-menu-*`
  measures `#E1E1E1` dark / `#252525` light, **identical to every other row**; only the trash icon
  distinguishes it. `051` ADR-007 E3 already ruled on this family. Our destructive row keeps red
  plus the icon. Unchanged; recorded here because A12 is where it lands on the board.
- **E4 — the control glyphs (WCAG 1.4.11).** The phone's `···` measures `#A7A7A7` on `#FFFFFF` =
  **2.41:1** and is the only element identifying the column menu on a surface with no hover to
  reveal an alternative. The desktop `···` and `+` fail the same 3:1 bar at `#9B9B9B` = **2.78:1**.
  The geometry is adopted — 28 x 28px slot, 14 x 14px glyph, 15.3pt on phone — and the glyph colour
  is replaced by one clearing 3:1. Dark theme adopted verbatim at 6.72:1.
- **X1 — the scrollbar colours (platform, now with a number).** ADR-002 already declined
  `#B6B6B6`/`#EBEBEB`. T001 measured the pair at **1.70:1** thumb-on-track, so the platform argument
  now also has a WCAG figure. Filed as platform rather than accessibility, as ADR-002 asks.

**Two values that look declinable and are adopted anyway, with the reason.**

- **The 1px card border at 1.11:1 dark / 1.12:1 light.** A card is a control, so 1.4.11 appears to
  apply. It does not: the card is identified by its title, icon and content, and the border divides
  adjacent cards rather than identifying the control. A hairline that merely divides content does
  not carry the 3:1 bar. **Adopted verbatim, both themes.** Our existing hover shadow stays as a
  second signal and is labelled *design inferred*, since no capture holds a pointer.
- **The 20px chip and the 25px property row.** Neither is a touch target: on the phone the target
  is the **card**, at 74.7pt. The one phone control below the 44px floor is the `···`, at 15.3pt of
  ink, and a static capture cannot measure its hit area — so **our own 44px floor applies to it**.
  That is a floor added on top of parity, not a deviation from a measured value, and it is recorded
  so a later reader does not mistake it for one (`051` design-trueup section 8d, same distinction).

**Consequences.**
- Every decline above is a **light-theme** decline. The dark theme is adopted hex for hex.
- E1's fix is not a new palette. It is Anytype's own card-chip treatment applied to a place Anytype
  left bare, so parity is preserved at the level of the pattern even where the literal pixel is not.
- One divergence is **not** an accessibility decline and is escalated instead: the ungrouped column
  reads **"No value"** on desktop and **"Uncategorized"** on phone. Parity cannot be satisfied both
  ways; the operator picks the string. Recorded as an open question in `spec.md` section 12.

**Alternatives rejected.**
- *Adopt the light-theme option colours as-is and let the theme fix it.* Rejected: the ratios are
  measured against Anytype's own white, not against a hypothetical theme, and four of the five
  failures are below 4:1 rather than marginal.
- *Decline the whole light theme and ship dark-only parity.* Rejected: only five colour roles fail,
  and every geometric value in the light captures matches its dark twin to the pixel.

---

## ADR-005: The board's geometry pins go into an existing gate lane, not a new one

**Status**: **Accepted** — 2026-09-06, at the landing of T012/T013.

**Context.** T012 R10 found that nothing in the gate reads a board geometry value. `pixelHash` is a
coarse 16x16 bucketed grid — reverting the card radius from 8px to 2px and recapturing left it
identical — and `screenshots:verify` only proves a capture's declared sources have not moved. The
first landing closed R10 by adding a 27th gate lane, `tools/live/board-geometry.mjs`. The brief that
authorised the work said existing lanes only, and a new lane is not a free addition: every lane is a
process launch, a Chrome start and a bundle build on every gate run, and the count itself is quoted
as evidence across this program's documents.

**Decision.** The six pins move into `tools/live/render-assertions.mjs` as its own board geometry
pass, and `tools/live/board-geometry.mjs`, its stamped `board-geometry.json` and the `gate.mjs`
entry are deleted. The gate stays at 26 lanes.

**Why an existing lane can host it, concretely.** `render-assertions.mjs` already does every single
thing the new lane did. It builds the same bundle through `buildRenderAssertionBundle`, mounts the
same `board/file-view` scenario, requires the same production-render provenance marker before it
will assert on any DOM, and — this is the part that settles it — already runs a **second page** with
`styles.css`, `theme.css` and `runtime-vars.css` attached purely so it can measure computed
geometry, its row-rhythm pass, complete with a premise assertion that refuses to publish heights if
the token sheets did not attach. The geometry pass is a third page of exactly that shape at
`deviceScaleFactor: 2`. Nothing had to be invented, and the pass reads identical values to the
retired lane's.

**Consequences.**
- `render-assertions`' evidence stamp gains `styles.css` as an input, so a stylesheet edit dates it
  the way it dated `board-geometry.json`. Nothing else in the evidence lane changes: it discovers
  artefacts by scanning `tools/live/*.json`, so a deleted artefact is simply not asked about.
- The negative control moves with the pins and was re-run on the merged tree: card radius 8px to 2px
  turns `render-assertions` red at exit 1, naming the pin, then reverted.
- A failure here now says `render-assertions` rather than `board-geometry`, so the lane name is less
  specific than the failure. The printed row names the selector and both values, which is what a
  person reads anyway.

**Alternatives rejected.**
- *Keep the new lane and record the 27 count.* Rejected: the constraint was explicit, and the reason
  the existing lane could not host it turned out not to exist.
- *Pin the values in a vitest suite the way `src/views/calendar-pinned-values.test.ts` pins the
  calendar's.* Rejected on the finding that opened R10 in the first place. That file locates a named
  selector's own block in `styles.css` by string search and asserts one declaration literally — it
  reads what the stylesheet SAYS. The board defect was `height: 24px` **saying** the right thing and
  **painting** 26, because a 1px border sits outside a content-box height, and the property-row
  defect was the same shape. A declaration-reading test asserts the value that was already correct.
  These pins have to be read from a laid-out document or they check the wrong thing.

---

## ADR-006: The header chip takes Anytype's tint fill (R6)

**Status**: **Decided by the operator** — 2026-09-06 ~05:25. **Implemented** 2026-09-06.

**Context.** ADR-004's E1 declined Anytype's bare light-theme option colour on a WCAG 1.4.3 measure
and named the replacement as Anytype's own card-chip treatment: tint fill plus darkened text. T012
R6 found the landed board took only half of it — the chip stayed `background: transparent` and only
the text was darkened. That clears 4.5:1 (amber `#915608` on white, 5.93:1) but it is not the
pattern the ADR named, and it is a visible difference against the reference.

**Decision.** The operator, verbatim: *"Anytype tint fill"*.

**Consequences.** `.db-kanban-col-chip` gains the tint fill of the option's own hue, matching the
card chip's existing tint/text pair rather than introducing a third treatment. Contrast is measured
**per colour**: E1's 5.93:1 amber figure was one sample, not a guarantee for all seven option hues,
so each hue is re-measured against its own tint fill and any that fails is named as its own
exception rather than assumed to clear with the rest. It moves every board capture and is a
stylesheet edit, so it needs the CSS lane.

**Done.** `background: transparent` on `.db-kanban-col-chip` became `background:
var(--db-status-bg, transparent)` — the same custom property the card's own tag chip already reads,
so the header and the card share one fill rather than the header inventing a second treatment. No
new colour was introduced: every `--db-status-bg`/`--db-status-fg` pair this chip can select was
already declared for the tag-chip family, so the header simply started reading the fill half of a
pair it was already reading the text half of. Every tint stayed exactly the value `design-trueup.md`
section 3's A9 table measured off Anytype — all ten, both themes, unaltered — and only the text was
darkened, which is what the ruling asks for. Re-measured independently against WCAG 1.4.3, per
colour, both themes, text-on-tint **and** text-on-page: twenty-two pairs, every one at or above
4.5:1, **no exceptions to name**. Tightest is light teal `#1B7471` on `#CFEEED` at **4.52:1**;
widest is light blue `#0B35DA` on `#DDE3FB` at **6.49:1**. Confirmed visually on the recaptured
`constructed-board-desktop-{dark,light}`, `board-view-desktop-light` and `board-view-mobile-dark`:
each column header now reads as a filled pill (grey/blue/purple/olive/amber tint per column) rather
than bare coloured text on the page background, with the header chip measured off the capture at
**24px** tall and the card's property rhythm still at **25px**.

---

## ADR-007: The grey option pair is neutral (R7)

**Status**: **Decided by the operator** — 2026-09-06 ~05:25. **Implemented** 2026-09-06.

**Context.** `design-trueup.md` section 3 A9 measured Anytype's grey option pair as neutral: tint
`#E3E3E3`, text `#888888` light and `#A8A8A8` dark. The landed board derives a **red-tinted** grey
instead — `#7E5D5D` light, `#BAABAB` dark, hue 0 — which clears 4.5:1 (5.82:1 on white) but is a
different hue from the reference, and it is also the colour the ungrouped column takes, so the
divergence is visible on the empty-column captures as a warm chip.

**Decision.** The operator, verbatim: *"Neutral, match Anytype"*.

**Consequences.** `.db-kanban-view .status-color-gray` moves to the measured neutral pair. Contrast
must be re-measured after the move rather than assumed: `#888888` on white is 3.54:1, which is one
of the five ratios ADR-004 E1 declined, so the neutral hue and the contrast floor have to be
reconciled in the same leg — most likely by taking the neutral hue with a darkened text step, the
same shape ADR-006 takes for the fill.

**Done.** The trap named above is exactly what closing this row ran into and exactly how it was
closed: the source's own `#888888`/`#A8A8A8` text values are declined again, for the same reason
ADR-004 E1 declined them the first time, and a darkened neutral step is taken instead, the same
move ADR-006 took for the fill. Landed pair, kept a true neutral (equal R/G/B, zero saturation) at
every step rather than a same-hue derivation: light tint `#E3E3E3` / text `#656565` (4.54:1 on the
tint, 5.83:1 on `#FFFFFF`); dark tint `#414141` / text `#ADADAD` (4.55:1 on the tint, 7.99:1 on
`#171717`). Both tints are Anytype's own measured grey; only the text moved. `#656565`/`#ADADAD` are
further from mid-grey than the source's `#888888`/`#A8A8A8` precisely because this text sits on the
tint rather than on the page, which is the reconciliation this ADR anticipated. The ungrouped
("No value") column reads the same pair through
`.db-kanban-col-chip:not([class*="status-color-"])`, so the un-tagged bucket and the explicit grey
bucket cannot drift apart. Confirmed on `board-empty-column-desktop-light` and
`constructed-board-empty-column-mobile-light`: the ungrouped chip reads as a neutral grey pill with
no warm cast.

---

## ADR-008: The board scrolls as a page and hides desktop scrollbar chrome — an operator ground for declining a measured value

**Status**: **Accepted** — operator ruling, 2026-09-06 ~10:30, desktop, 0.0.29.

**The words.** *"Also for boards... Currently on mobile and desktop you scroll only a column. But I
want to just have page scrolling so you scroll down the page and not within a column only. also for
desktop hide or make the scrollbar invisible."*

**Context, with the numbers.** The landed board makes every column its own vertical scroller
(`.db-kanban-cards { overflow-y: auto }`, `styles.css:9569-9573`) inside a view that cannot scroll
(`.db-kanban-view { overflow: hidden; height: 100% }`, `:9447-9451`), and paints a **10px**
horizontal scrollbar on `.db-kanban-board` (`:9472-9474`) in an 8px reserved lane. That bar is not
an accident: `design-trueup.md` A10 measures Anytype's own sticky scrollbar at **10px tall, y
1199..1208 of a 1217px viewport, 8px above the bottom**, independently confirming `050` REQ-003,
and this packet's REQ-004/AC-004 and its third completion criterion ask for it to exist.

**The conflict, stated plainly.** ADR-002 says the board adopts every captured value and that the
**only** permitted grounds for declining are WCAG 1.4.11, WCAG 1.4.3 and the 44px touch floor —
*"taste is not a ground, and neither is 'ours is fine'"*. The operator's instruction is none of
those three. Two things that must both be true are not both true.

**Decision.** The instruction wins, and ADR-002's decline list gains a **third ground: an explicit
operator ruling**. This is recorded as its own ADR rather than as an edit to ADR-002's wording,
because *"the operator overruled the parity rule once, here, for the scrollbar"* and *"the parity
rule always allowed taste"* are different claims and the second one is false.

**Consequences.**
- AC-012 supersedes AC-004's visible sticky bar. AC-004 is not deleted and its measurement is not
  withdrawn — hiding a bar is not unmeasuring it, and the trueup's geometry stays exactly where it
  is so a later reinstatement has a number to return to.
- The per-column scrollers go; the page scrolls in their place on both platforms. Drag-and-drop
  between columns, the sticky column header and the load-more row all sit on the assumption that a
  column is its own scroll box, so each is re-measured in the same leg rather than assumed.
- `render-assertions.mjs`'s scrollbar pin is re-expressed at the ruling's threshold (T016), not
  deleted, for the same reason.
- Named in `../roadmap.md` §7 as a conflict on record, per §7's rule that a phase's disagreements
  are reported rather than tidied.

**Landed 2026-09-06 (T014-T016), on the second take. The first take is recorded here, not
overwritten, because what it got wrong is the more useful half of this entry.**

**First take, and why it did not deliver the ruling.** `.db-kanban-view` dropped `overflow:
hidden`; `.db-kanban-board` and `.db-kanban-cards` dropped `flex: 1; min-height: 0` (and the
latter its `overflow-y: auto`); `.db-kanban-col-header` was pinned `position: sticky`. Read on a
device at DPR 2, in a container with a definite height — which is what a real pane gives it, and
what the capture harness gives it too (`tools/screenshots/theme.css`: `#shot >
.note-database-container { height: 100% }`) — **nothing scrolled**. `.db-kanban-board` was still a
flex item at the default `flex-shrink: 1`, so it shrank back to the container's height; its own
`overflow-y: hidden` then clipped everything below. At 1440x900: board `scrollHeight 7750 /
clientHeight 900`, container `scrollHeight 908 / clientHeight 908`, a real trusted wheel of 600px
moving `scrollTop` 0, and the last card of a 35-card column unreachable by any means. The prior
behaviour — a per-column scroller — at least reached every card. **The regression was strictly
worse than the defect the operator reported.**

The check that certified it read `getComputedStyle(container).overflowY === "auto"` on a page
whose body had no height, so the keyword was true and the behaviour was never asked about. An
`overflow: auto` that scrolls nothing is exactly the shape a keyword read cannot see.

**Second take.** Both scroll axes belong to the container. `.db-kanban-view` keeps the base
`.note-database-container` `overflow: auto`; `.db-kanban-board` drops its own `overflow-x` and
`overflow-y` and takes `flex-shrink: 0`, so it is as tall and as wide as its columns and rides the
page. Both axes and not merely the vertical, because the reference's horizontal bar sits at the
**bottom of the viewport, over the cards** (`anytype-project-tracker-kanban-dark.png`, the bar at
y 1199..1208 of a 1217px window — the same geometry `design-trueup.md` A10 measured). Only a
pane-height scroller paints a bar there; a board-height scroller puts it thousands of pixels below
the fold. So the scrollbar rules move from `.db-kanban-board` to
`.note-database-container.db-kanban-view`, still `0` at rest and `10px` on hover or while an
`.is-scrolling` class is set, with touch guarded out through `:has(.db-kanban-board.is-touch)`.
The renderer's scroll listener moves to the container for the same reason — the board no longer
fires a scroll event to hear — and carries a teardown, since the container outlives a render and
a listener per render would stack.

**Measured green**, 1440x900 and 390x844 at DPR 2, against a board with one 35-card column:
`overflow-y` computes `visible` on the board, the column and the cards container; the container
measures `scrollHeight 7758 / clientHeight 908`; a trusted wheel of 600px moves the container 600
and the board and column 0; `PageDown` moves it 868; the end of the scroll is `6857 = scrollHeight
- clientHeight` with the last card fully inside the container box. The 10-per-group page limit and
its "Show 10 more" control still render on every column. At 390px the container reports
`scrollWidth 1383 / clientWidth 382`, a trusted horizontal wheel moves `scrollLeft` 300, and
scrolling to the end puts the last column's right edge exactly at the container's right edge — the
board's negative margins cut nothing off. Drag under scroll: with the container scrolled 400px, a
real `dragstart` on a `backlog` card followed by `dragover`+`drop` on `doing`'s cards container
tints the right column and calls `moveCardAndOrder` with `groupKey "doing"`, `fromGroup
"backlog"`; a same-column drag at the same offset lands immediately before the card it was aimed
at. Both hold structurally: the drop handler is bound per column, and
`getReferenceDragAfterElement` reads `event.clientY` against `getBoundingClientRect()`, so the
scroll offset cancels.

**The column-header pin is withdrawn. The reference does not pin its headers.** ADR-002 lets this
board adopt captured values and decline them on three named grounds; it does not license adding
chrome the reference does not have. Every kanban capture in this set —
`anytype-project-tracker-kanban-{dark,light}.png`, `anytype-set-kanban-view-dark.png`,
`anytype-mobile-set-kanban-{dark,light}.png` — shows the column header as flat page content in the
same rhythm as the page title above it, and **none** shows one held against the top or caught
mid-scroll. Absent a captured answer the first take inferred a pin from this app's own
table/group-header convention; that inference is the wrong default here, because the operator's
words are *"just have page scrolling so you scroll down the page"* and a header that stays while
the page moves under it is the one part of the page that would not. The pin was also inert: with
`overflow-x: auto` on `.db-kanban-board` the header's nearest scrollport was the board, which
never scrolled vertically, so `position: sticky; top: var(--db-board-header-top)` — computing to
`-3px` — could never engage against the page scroller. `.db-kanban-col-header` is now `static`,
and `render-assertions.mjs` pins it there so the inference cannot return unnoticed.

**The two card-text defects landed in the same edit.** The shared `.db-board-card-value` rule
(authored for the gallery card) sets `text-align: right; word-break: break-word`; the kanban card
inherited both through the shared class. `.db-kanban-card-meta .db-board-card-value` now overrides
to `text-align: left; word-break: normal; overflow-wrap: normal`, scoped to the kanban card only —
gallery's own alignment is untouched, and the checkbox row's own value keeps the shared right/
flex-end rule at higher selector specificity, since it holds a glyph rather than a text value.
Multi-word text still wraps up to two lines through the shared field's own
`-webkit-line-clamp: 2`; a single-token value now has nowhere to force a mid-word break, so
`text-overflow: ellipsis` truncates it at the line's edge instead.

**Evidence.** Seven `render-assertions.mjs` board-geometry pins (page-scroll reachability,
column/board scroll, scrollbar rest, scrollbar active, header position, value align, value wrap).
The page-scroll row is a reachability measurement, not an overflow-keyword read: it gives the
mounted container a pane's definite height, overfills a column by 30 cards, scrolls to the end and
asserts both that the scroll moved and that the last card came with it. Negative control run
against the first take's own stylesheet: `page scroll` `"auto" / 0 / false`, `column scroll`
`"visible" / "hidden"`, both scrollbar rows `"8px"`, `header position` `"sticky"` — five red.
Against the landed tree: `"auto" / 16239 / true`, `"visible" / "visible"`, `"0px"`, `"10px"`,
`"static"` — all green. `npx tsc --noEmit`, `npx vitest run` (141 files / 1501 tests, including
the cross-column dragstart-to-drop tests in `board-renderer-parity.test.ts`) and `npm run build`
all exit 0, unaffected by a scroll/scrollbar/alignment-only edit. `node
tools/screenshots/verify.mjs` reports 578 current after a full recapture; **30** board captures
moved pixelHash (the uneven column heights, the removed sticky-header background and the
left-aligned text all repaint), and every `screenshots/project-manager/*` capture and every other
non-board capture stayed pixelHash-identical — 16 byte-only re-encodes elsewhere in the sweep
(identical pixelHash, different bytes) were restored to their committed bytes rather than
recommitted as churn. Two exceptions are named rather than absorbed: the
`field-icon-picker-desktop-{dark,light}` captures moved pixels on this machine **against the
unmodified tree as well** — verified by rebuilding from `HEAD` sources and re-capturing, which
reproduced the same moved hash — so they are environment drift, not this edit, and were restored
along with their manifest `layoutHash`/`pixelHash` rather than committed.
<!-- /ANCHOR:decisions -->
