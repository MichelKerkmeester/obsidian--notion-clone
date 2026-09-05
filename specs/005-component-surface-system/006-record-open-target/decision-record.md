---
title: "Decision Record: Record Open Target"
description: "ADR-001 records the operator's ruling that an open with no anchor element is fixed once at the resolver, as a pane-docked placement, rather than per calling affordance."
trigger_phrases:
  - "006 decision record"
  - "record panel dock"
  - "anchorless open placement"
  - "record open placement decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/006-record-open-target"
    last_updated_at: "2026-09-05T15:40:00Z"
    last_updated_by: "code-agent"
    recent_action: "Recorded the fix-for-all-callers ruling and the docked placement it selects"
    next_safe_action: "None — the ADR, AC-014 and AC-015 agree with the shipped resolver"
    blockers: []
    key_files:
      - "src/views/record-open-target.ts"
      - "src/views/popover-position.ts"
      - "src/views/record-detail-panel.ts"
      - "specs/005-component-surface-system/roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "record-open-dock-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: Record Open Target

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: An open with no anchor docks to its pane, decided once at the resolver

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

**Acceptance evidence**: `resolveRecordOpenTarget` in `src/views/record-open-target.ts` returns a
`placement` beside its `target` on every path, `docked` exactly when the resolved surface is one of
this plugin's own, the host is not a phone, and the affordance carried no element. `placeContainerDock`
and the pure `resolveContainerDockPlacement` in `src/views/popover-position.ts` place the surface
against the pane's trailing edge at the pane's height. `openRecordDetailPanel` takes the placement and
passes the pane as `dockTo`; the anchor is still passed for focus return and outside-press
containment, which is what it was always doing correctly. AC-014 and AC-015 in
`acceptance-criteria.md` carry the geometry. `roadmap.md` §4 row 52 carries the ruling.

---

<!-- ANCHOR:adr-001-context -->
### Context

`roadmap.md` §4 row 48 reported a board card opening the record panel as a strip at the top of the
window. That row was closed by giving the board's reference card the anchored call its sibling card
already made. The repair was correct and it was local, and the report was not really about the board.

`openRecordAt` treats "this affordance has no element to point at" by handing the positioner the view
container as the anchor. A container fills its pane, so nothing fits above or below it: the anchored
arithmetic finds no space on either side, takes its no-room fallback, pins the surface to the top of
the viewport, and leaves the height to whatever the content measures at that moment. Measured in
headless Chrome on the shipped renderer, one board and two anchors: container anchor `top 12 · bottom
84 · height 72` against a 900px viewport, against card anchor `top 535 · bottom 706 · height 171`.

Fixing the board card left every other affordance with no element on the same path. Read on the tree
at `e6729a7b`, those are the row context menu's open item (`row-menu.ts:89`), the timeline event
menu's open item (`calendar-timeline-renderer.ts:3846`), the gallery card's open button
(`gallery-renderer.ts:327`), the board card's own open button (`board-renderer.ts:1499`), the open
action inside the record panel (`record-detail-panel.ts:373`), and the `else openRow(row)` fallbacks
in the calendar, timeline and board press handlers.

Two claims in the report did not survive reading the code, and are recorded here so the next reader
does not re-derive them. **Calendar and timeline event presses are not affected**: they pass the
pressed element — `item`, `eventEl`, `titleEl`, `rect`, `diamond`, `trigger` — through
`openRecordDetail`, and reach `openRow` only where a host wires no `openRecordDetail` at all.
**There is no anchorless keyboard open**: the Mod+Enter path passes `context.td`
(`database-view.ts:1768`). The gallery is being retired and takes the fix by sitting on the seam,
without a change of its own.

<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**The operator ruled: fix it for all callers.** Not per affordance, and not by giving each caller an
element to point at.

Placement is decided where the target is decided. `ResolvedOpenTarget` gains a `placement` of
`anchored` or `docked`, stated on every path so no caller has to infer one, and the surfaces that are
real workspace leaves keep `anchored` because they take no placement from this plugin at all.

A docked surface is placed from a rectangle it is given rather than from an element it points at —
the same shape as the phone sheet, which has always worked for the same reason. It takes the
intersection of its pane and the visible bounds: the pane alone would let it slide under a sidebar
that overlaps the pane, and the viewport alone would let it sit over a neighbouring split. Its height
is **written, not capped**. That is the whole repair, and it is the part a reader is most likely to
undo: the broken path already set a generous `max-height` and still rendered 72px inside it, because
a cap does not make a short panel tall.

Three cases are deliberately left alone. **A phone stays anchored**, because its panel is a bottom
sheet placed from the viewport and never asked the anchor anything. **An anchored open is untouched**
— the arithmetic was extracted into `resolveAnchoredPopoverBox` without a change to what it computes.
**A pane that reports no area falls back to the visible bounds**, the rule this module already
applies to its own container: an empty rect is missing information, not a constraint of zero.

<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**Positive.** Every anchorless affordance is fixed by one change, including the ones nobody has
reported yet and the ones a later phase adds. The geometry became a number a check can read: it was
previously computed inside a DOM closure, which is why a panel rendering at 72px was invisible to
every gate in a repository with twenty-six lanes.

**Negative.** There are now two placement answers for one surface, and a reader who sees only the
anchored one may reintroduce the container-as-anchor call. The resolver's `placement` is the guard:
a call site that wants to place a record surface has to say which it is.

**Neutral.** The anchor is still passed on the docked path. It carries focus return and decides what
counts as a press inside the panel, and on this path it is the container — so an outside press is one
outside the whole view. That is pre-existing behaviour, unchanged here, and it is not obviously right;
it is recorded rather than repaired, because the ruling was about placement.

**A stylesheet cap is deliberately overridden, and it reads backwards.** `styles.css:10273` caps
`.db-record-detail-panel` at `max-height: 60vh`. The dock writes an inline `max-height` in px, and an
inline author declaration outranks a non-`!important` author rule, so the dock wins — at a 900px
viewport it occupies 876px where the stylesheet asks for 540px. That is intended: a dock that stopped
at 60vh would sit exactly on AC-014's floor rather than clear of it. It is recorded because the
opposite pattern holds two sections away in the same file — the phone sheet's `90svh !important`
outranks *its* inline height — so which declaration binds is not a rule a reader can carry between
the two surfaces. AC-003 owns the phone half of this question.

<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives considered

**Give every anchorless caller an element to point at.** Rejected: it is the board fix repeated six
times, it re-opens the next affordance the same way, and the elements would be invented for the
positioner's benefit rather than pressed by anyone.

**Anchor to the pane's corner instead of docking.** Rejected: it keeps content deciding the height,
which is the defect. A short panel would still be a strip, just a strip in a different corner.

**Fold an anchorless open to a workspace tab.** Rejected: it silently changes what the reader asked
for. The setting says panel; a fold to a leaf would make the context menu disagree with the button
beside it, which is the drift this packet's resolver exists to end.

<!-- /ANCHOR:adr-001-alternatives -->
<!-- /ANCHOR:adr-001 -->
