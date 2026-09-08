---
title: "Decision Record: the settings sheet's reference row grammar"
description: "ADR-001 records that the sheet's plain rows flip to the reference's one-line list grammar while the wide editors keep 002's stacked shape; ADR-002 records the divider as a measured ::before, not a border; ADR-003 records the flex-basis-0 field; ADR-004 records the css-lane takeover riding this leg's single commit."
trigger_phrases:
  - "004 decision record"
  - "view config row direction"
  - "label left control right"
  - "settings sheet divider"
  - "css lane takeover"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/004-view-config-sheet"
    last_updated_at: "2026-09-08T22:25:00Z"
    last_updated_by: "implement-004-view-config-sheet"
    recent_action: "Recorded the four decisions this redesign shipped under"
    next_safe_action: "None here; 005 (filter-sort-group sheets) reuses this row grammar"
    blockers: []
    key_files:
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "tools/lane/css-lane.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "004-view-config-sheet-implementation"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Decision Record: the settings sheet's reference row grammar

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Plain rows read as the reference's list; wide editors keep the stacked shape

The sheet's rows had exactly one shape since 002 landed: control under label, whatever the control.
The reference's short settings — a label and the value it answers — are a list row, and 002's own
finding said so twice: the wide controls (a multi-line editor, a range with a number, the placement
group) are the reason a column stacking was chosen, not a reason every row must stack. So the rule
splits by shape, not by surface: a row whose control fits its line reads label-left/control-right;
the five wide-editor shapes (`.obnotion-view-config-field-stack`, the `textarea` row, the read-only
multi-line value, the range+number pair, the placement group) keep the stacked shape via `:has`
exceptions, because their width is the finding's own reason. Both shapes live in one rule set —
there is no second implementation of "a settings row" to drift. 002's 2026-09-05 column-stacking
decision stands for the editors it was made for and is retired for everything else; where Notion
and Anytype disagree on this family, that same adopted inset-list grammar decided, per the packet
rule that the shared grammar wins.
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The divider is a measured ::before, not a border

The lane's divider predicate wants a geometry answer — 1px tall, 16px in from the sheet's left,
flush right, extent equal to the row's width minus the inset, a non-transparent colour — and a
`border-top` cannot answer it: the lane reads the pseudo's computed style, so a hairline painted by
a border reads as no divider at all. The `::before` is positioned on the row (and on a section
heading that follows anything), which also frees the heading's own rule of its old full-bleed
`border-top` and its `:first-of-type` exception — a heading that opens the sheet simply has no
previous sibling, so `:not(:first-child)` and "owes a divider" stay the same question in both the
stylesheet and the lane. The colour reads the subtle-divider token with a literal rgba stand-in,
because the harness (and any surface mounted outside the token's scope) defines no
`--background-modifier-border` for the token's `color-mix` to resolve; production, which defines
both, gets the token.
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The one-line field takes the row's remainder at flex-basis 0

A percentage-width control inside an auto-basis field lets the control's intrinsic width claim the
row and wrap the pair — the failure the pre-redesign 54.0–78.3px pitches were made of. With
`flex: 1 1 0` the field's claim starts at zero, the label keeps its intrinsic width, the pair stays
on one line at any content, `min-width: 0` lets the control (not the row) absorb the squeeze, and
`justify-content: flex-end` right-grounds what the field holds — the same grounded-right value the
unscoped container rule already gives the desktop panel, now also true on the phone without it.
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The css-lane takeover rides this leg's single commit

The lane's own README asks the holder handover to be "one commit of its own, so the handover is a
point in history rather than a detail inside an unrelated diff". This leg's instruction commits its
changed files by name in one trailers-stamped commit, and the takeover is part of that diff — a
recorded deviation, chosen so the leg ships exactly what its brief ordered. The takeover's acquire
(pre-edit hash), edit (post-edit hash) and release (named reviewed captures) are nevertheless
separate, auditable history entries in `tools/lane/css-lane.json`; only the commit boundary differs
from the doctrine.
<!-- /ANCHOR:adr-004 -->
