---
title: "Decision Record: Record Detail Sheet and Menu Cards Redesign"
description: "The decisions this phase took and the alternatives they beat."
trigger_phrases:
  - "decision record"
  - "006-record-and-menu-sheets decisions"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/006-record-and-menu-sheets"
    last_updated_at: "2026-09-09T01:45:00Z"
    last_updated_by: "claude-run1"
    recent_action: "Recorded the five implementation decisions"
    next_safe_action: "None — decisions accepted; revise only on new evidence"
    blockers: []
    key_files:
      - "styles.css"
      - "src/views/record-sheet-row-grammar.test.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "006-record-and-menu-sheets-run1"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Record Detail Sheet and Menu Cards Redesign

---

<!-- ANCHOR:context -->
## 2. CONTEXT

The operator's R5 note (2026-09-08 08:10) stands: "Actually all sheets should mimic notion way
closer." This packet is the record-sheet leg of that alignment: the record detail sheet, the peek
that hands off to it on touch, and the record sheet's own menu-card children — the select value,
date, relation, option-colour, column-context and column-submenu stacks, reached from a cell or a
row — against the references Phase 1's inventory mapped to them.

The measurement constraint carries over unchanged from the settings leg: the third-party
Notion/Anytype reference captures carry no readable measurements (their manifests hold filenames
only), and this harness verifies by printing numbers, not by viewing images. The redesign
therefore asserts the operator's Notion-shape directives as measured targets and proves them with
the lane; the menu-card half's landed rulings (the handle-less anchored card, the 44px close, the
0.52 scrim without the scale cue, the route through the shared surface shell) are not reopened —
this leg inherits them and measures them where the record family actually mounts its menus.

<!-- /ANCHOR:context -->

---

<!-- ANCHOR:decisions -->
## 3. DECISIONS

### D-001: The surface owns the one shared 16px inset; the rows carry none

**Decision:** The phone record sheet spends one 16px content inset on the surface itself
(`padding-inline: var(--obnotion-sheet-inset)` on the sheet, replacing the anchored
presentation's 12px), and the property rows keep no horizontal padding of their own — so the
label's reading line, the hairline under each row and the disclosure's section dividers all take
their left edge from one value. The field rows' 4-side padding floor therefore gained a second
documented exception in the row-pitch contract (`src/views/sheet-grammar.ts`), after the Add-view
one: their vertical padding clears the 2px floor, and their horizontal answer is the surface's
own inset, which the record sheet's own grammar rows measure directly.

**Alternatives:**
- *Keep 12px on the panel and 4px on the rows* — the labels land at 16px but the row hairlines
  at 12px, a 4px disagreement between the line under a property and the heading of the next
  section, exactly the dent the settings leg's doctrine warns about.
- *Rows carry their own 16px inside a 16px panel* — labels at 32px or dividers at 16px beside
  24px labels; either way the surface reads two competing insets.

**Consequence:** the contract's documented-exception list is load-bearing (two entries now); the
record sheet's own grammar rows measure the inset the exception trusts, so a silent change to
either half bites in the lane.

### D-002: The 44px touch floor owns its own box

**Decision:** The five row shapes the pitch grammar measures — the property row, the disclosure
toggle, the add-property button, the disclosure row and the section heading — name
`box-sizing: border-box` themselves. Before, the same row measured 61.0px (a 44px floor counted
in a content-box assumption, plus the row's 8px/8px padding and 1px hairline; the last row 60.0px
for its missing hairline) in the lane's context and 44px wherever border-box happened to be
assumed — the floor drifted by the row's own padding between contexts, and nothing in the
stylesheet said which was right.

**Alternatives:**
- *Fix the harness's box-sizing* — a harness-only truth; the next context (a host theme, another
  Obsidian build) could assume the other way again.
- *Exempt the record rows from the pitch window* — the floor would assert nothing about the very
  rows it exists for.

**Consequence:** the pitch the lane asserts is the row's whole box in any context; on the
operator's device, where the host's border-box assumption already held, nothing moved.

### D-003: The disclosure's section headings sit on the shared inset behind their own 1px divider

**Decision:** The shown/hidden section headings — 13.0px in, no divider — now sit on the shared
16px inset and open their section behind their own 1px hairline at the same faint step
(`var(--obnotion-border-subtle)`, the #333333-fallback token) the property rows' hairlines and
the note's divider already use, with their spacing wider than the rows' own. The shown and hidden
groups read as lists under a heading rather than as one unbroken run.

**Alternatives:**
- *Full-bleed headings, after the settings sheet's own panel* — that leg's surface is flush and
  its rows carry the inset; the record sheet's surface owns the inset, so its divider would sit
  16px in either way. The two surfaces reach the same reference through their own, already-landed
  paddings; the shared invariant (one reading line, one faint step) is what transfers, not the
  mechanism.

### D-004: The record sheet's rows join the row-pitch contract as the second zero-horizontal-padding exception

**Decision:** `hasPaddedRows` now returns the record field row as unconditionally padded,
alongside the Add-view precedent, because the record sheet's grammar rows measure what the
4-side floor would double-count: the pitch against the whole box, the shared inset, the hairline.
The vertical padding still clears the 2px contract floor; the horizontal answer is the surface's
inset, which the record grammar asserts directly.

**Alternatives:**
- *Give the rows 2px of their own* — the labels 18px deep, the second inset the first redesign
  just removed.

### D-005: The menu-card half ships no new stylesheet; the lane proves the landed rulings where they mount

**Decision:** The menu-card half ships no new stylesheet. The 44px row floor, the 16px option
inset, the row hairlines and the handle-less anchored card the 061/067 rulings landed were
re-proven where the record family actually mounts its menus: the record sheet's own select value,
option colour, column context and column submenu pairs — 4 of the 6 record pairs, 3–16 option
rows each, every row 44.0px; the date and relation editors' grids are not option rows and report
none. The reference columns of the gap table stay `TBD` (the settings leg's ruling: the
third-party captures carry no readable measurements, the directives are the targets).

**Alternatives:**
- *Restate the 44px/16px declarations scoped to the record's children* — a second copy of a rule
  the family already lands, which a later token change would have to update twice.

**Consequence:** the record family's menu rows are now measured where they mount, not only on the
synthetic stand-in the row-pitch control mounts; the 002–005 legs' menus assert the same floor
through the same report (23 of the grammar's 34 stacked pairs report option rows, all 44.0px).

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:consequences -->
## 4. CONSEQUENCES

- The row-pitch contract's documented-exception list is load-bearing: the record field row's
  zero-horizontal-padding is a design, not an omission, and `hasPaddedRows` records it beside the
  Add-view precedent. The record sheet's own grammar rows are the measurements that trust it.
- The 44px pitch answers to the row's whole box; any future rule that ships padding beside the
  floor must either name the box or re-derive the window.
- The disclosure's section headings are the record sheet's section grammar: a heading that
  renames or moves loses its divider inset in the lane, not in review.
- The reference columns of the gap table remain honest `TBD`s until a numbers-printing measurement
  pass over the third-party captures exists (the settings leg's ruling, inherited unchanged).
- 067's seventeen outstanding capture reads: the five this release actually moved
  (`panel-record-detail-sheet-body-empty-desktop-light` 62,773px @214, its dark pair 57,300px
  @209, `constructed-depth3-column-submenu-mobile-…` 61,768/59,735px @133/127,
  `chrome-owned-menu-sheet-mobile-dark` 2,702px @5) are judged and named in this lane's release;
  the twelve that did not move here stay 067's, unchanged by this edit.

<!-- /ANCHOR:consequences -->
