---
title: "Decision Record: Sheet Input and Action Order"
description: "ADR-001 records the confirm card's stacked action order as destructive-then-Cancel, citing the four captured reference patterns; ADR-002 records where the toolbar overflow menu's per-column preset inputs went, answering the goal's second open question; ADR-003 records the picker's chosen reading order and what it deliberately kept."
trigger_phrases:
  - "013 decision record"
  - "confirm action order decision"
  - "new note presets destination"
  - "date picker reading order"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/013-sheet-input-and-action-order"
    last_updated_at: "2026-09-10T02:05:00Z"
    last_updated_by: "implement-013-sheet-input-and-action-order"
    recent_action: "Recorded the confirm order, the presets' destination and the picker's reading order"
    next_safe_action: "Operator device read (D3) closes the packet"
    blockers: []
    key_files:
      - "src/views/confirm-sheet.ts"
      - "src/views/toolbar-renderer.ts"
      - "src/views/date-value-picker.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "013-sheet-input-and-action-order-implementation"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "ADR-C: does the add-view layout choice become a grid of icon cards, matching the reference, or stay as rows? Held Proposed — the packet's own edit note documents a real defect in our former tiles that the reference's per-layout icons may not share"
    answered_questions:
      - "Where do the toolbar overflow menu's per-column preset inputs move to — their own sheet, or behind a row? Behind a row: a chevron row swaps the record popover for a presets popover at the same trigger (ADR-002)"
---
# Decision Record: Sheet Input and Action Order

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: In the stacked confirm the destructive action leads and Cancel closes the column; the side-by-side footer keeps its trailing confirm

Accepted 2026-09-10, worktree `worktrees/279-sheet-action-order`.

The reference evidence is four of four captured stacked confirms, each read for
structure only (all 299x678, `../sheet-notion-audit.md` §3.4): the sheet-level
Delete/Cancel pair, the Replace/Cancel pair, the Delete-view/Cancel pair, and the
flow's Permanently-delete/Cancel pair. Every one reads destructive action first,
Cancel beneath. Our card had the geometry converged — centred, inset ≥16px, 16px
radii, full-width column, both actions at 44px+ — but the builder created the
cancel button first, so under a column layout Cancel rendered on top, and no clause
asserted which.

**Decision.** In the stacked variant the confirm button is the first child of the
actions row and Cancel is the last; an optional secondary action sits between them.
The side-by-side variant — the footer every other modal shares — is unchanged:
Cancel, then the confirm, trailing. The clause asserts both readings, so a future
fix to one cannot silently flip the other.

**Geometry, regression-checked rather than re-designed.** The card's inset, radii,
stacking and action heights all re-read their landed values after the reorder:
inset 275.3/35/35/275.3px, radius 16px on all four corners, actions
`flex-direction: column`, action heights 50px and 44px — the same two heights the
pre-reorder row printed as 44px then 50px, now in the new order. Every action stays
at or above the 44px floor and the card's negative control (both declared classes
stripped) still registers.

**Unit-held.** `src/views/confirm-sheet.test.ts` (created) drives the shipped
builder against a minimal element shim: the stacked order, the side-by-side
order, and the secondary action's middle position. Proven red-then-green by the
same proofs the lane ran: the tests failed 2/1 before the builder changed and
passed 3/3 after, which is the mutation proof the clause asks for — the only
differences between the two runs are the two button constructions themselves.

**Visual numbers are provisional.** The device read (D3, the packet's standing
operator row) is what closes the alignment judgement; until it comes back, the
order's correctness is the lane's printed facts, not a device verdict.
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The record popover's per-column presets move behind a row that swaps to their own popover at the same trigger

Accepted 2026-09-10, worktree `worktrees/279-sheet-action-order`. This answers the
goal's second open question — their own sheet, or behind a row? — in favour of
**behind a row**.

**Why.** No reference menu in the harvest carries a free-text field, so the target
is the record popover hosting zero of them; the question was only where the
fifteen-or-so per-column new-row defaults go. Their own sheet would spend a whole
surface on fields nobody fills daily. A row costs one hop and keeps the fields'
exact control: same `.obnotion-new-preset-row` rows, same placeholder, same
oninput behaviour, one wrapper deeper, headed by the shared shell header under the
new key (`toolbar.newRowPresets`, translated in all three locales).

**The mechanism, and why it replaces rather than stacks.** The chevron row's
handler closes the record popover and opens the presets popover from the very
trigger the record popover itself uses, so there is exactly one popover of this
pair alive at any depth — the same dismissal dance the record popover already
runs, and no third stacking tier for the lane's replace-instead-of-stack rule to
adjudicate. Tapping the chevron again walks the same path: the record popover's
toggle comes back.

**Destination before source, as in the properties-sheet precedent.** The
destination landed first and the lane proved it with the record surface still
carrying the fields: the row found, the presets popover found, all fifteen inputs
answering there while fifteen still sat in the record popover. Only then were the
inline fields removed, and the clause turned to the recorded target: zero free-text
inputs on the record surface, fifteen in their own popover.

**Visual numbers are provisional** on the same standing device read as ADR-001.
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The date picker's body reads calendar, then the shortcut presets, then the typed segments, then Clear — and keeps its segment inputs

Accepted 2026-09-10, worktree `worktrees/279-sheet-action-order`.

**The reference's order** is field, calendar, then its value rows, with a plain
Clear row at the very bottom; the reference picker never types a date into boxes.
Our picker had three numeric boxes ahead of the calendar, with Clear riding as the
fourth member of the shortcut group.

**Decision.** The calendar div leads the popover's body; the Today/Tomorrow/Next
week group follows it; the typed `YYYY-MM-DD` segments follow the shortcuts;
Clear closes the sheet as its own plain, full-width row of the same tap-target
vocabulary, outside the group's role. Two clauses pin the two facts the packet
owns — the calendar precedes the segments in document order, and Clear is not a
member of the presets group — while the placement clause reads the published
keyboard inset with the reordered sheet mounted (published, 0px on the harness) and
holds the calendar inside the sheet's lifted box.

**What was deliberately kept, recorded not proposed.** The segment inputs stay,
because the packet's own gap table assigns them exactly this role: not the primary
path, but they follow the calendar — which is what this reorder makes true. The
shortcuts' resolved-date sublines stay. The Between-shortcuts-and-typed-fields
order is ours alone (the reference has no shortcuts to order against): additive
choices before entry, the unset last. The reference's end-date, format, remind and
timezone rows are features we lack and remain not adopted, per the audit's own
not-adopted list.
<!-- /ANCHOR:adr-003 -->
