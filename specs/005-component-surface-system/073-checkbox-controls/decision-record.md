---
title: "Decision Record: Checkbox Controls (Size and Radio Removal)"
description: "The documented assumptions and behaviour decisions behind the phone checkbox sizing and the radio-to-checkbox conversion."
trigger_phrases:
  - "decision record"
  - "073 decisions"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/073-checkbox-controls"
    last_updated_at: "2026-09-08T14:50:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Assumptions and ADRs recorded; gates green"
    next_safe_action: "Wait for the operator's device confirmation, then close"
    blockers: []
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "073-checkbox-controls-decision-record"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions: []
---

# Decision Record: Checkbox Controls (Size and Radio Removal)

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:band -->
## 1. THE REFERENCE SIZE BAND (DOCUMENTED ASSUMPTION)

The reference captures under `screenshots/notion` and `screenshots/anytype` carry no
machine-readable glyph dimensions in their manifests, so the band is a stated assumption, not a
parsed measurement: **a checkbox glyph of 14–18px, inside a hit target of at least 44×44px on the
phone.** The reading behind it: Notion's own checkbox draws roughly a 16px box inside a
44px-scale touch area on the phone, and Anytype's sits in the same interval; this project's
pre-existing roles already author 16px (row), 18px (field) and a 14px reference-matched circle
on the kanban card, and every one of those precedents was measured from the same reference
family. The lane therefore asserts the band 14–18px inclusive, not a single number, and treats
anything outside it as a finding.

Before this packet the phone painted none of those sizes: the shared checkbox's
`pointer: coarse` block forced `min-width/min-height: 28px` on every owned glyph, so the board
card's 14px circle shipped at 28px — double the reference, and exactly the "too big" the
operator's R3 report names. Measured before/after on a forced-coarse 390×844 page, across 94
production-rendered checkbox glyphs in the board, table and view-config mounts:

| Measure | Before | After |
|---|---|---|
| Painted glyph box | 28×28 (every owned checkbox) | 14–18px, per its authored role |
| Hit area (glyph + `::before`) | 40×40 (28px box, -6px inset) | 44×44 minimum (14px box, -15px inset; 16→46, 18→48) |
| Radio-shaped controls (3 mounts) | 3 | 0 |
| Board card checkbox fields / bare-`0` fields | 0 measured (bench) / — | 36 fields, 18 checked, 0 rendering a bare `0` |
<!-- /ANCHOR:band -->

---

<!-- ANCHOR:inset -->
## 2. THE TARGET IS PAID IN INSET, NOT PIXELS (ADR)

**Decision:** the phone keeps the reference's glyph size and pays the 44px touch target with an
invisible `::before` inset of -15px, the idiom the shared checkbox already used at -6px.

**Why:** shrinking the glyph and keeping the 28px box are contradictory; growing the box defeats
the report. The inset is the part a bounding box cannot see, so the new control-geometry pass in
`tools/live/touch-targets.mjs` measures the pseudo-element's computed box directly rather than
trusting either number. The -15px is not stylistic: 14px + 2×15 = 44 exactly, which is why the
board card's 14px circle — the control in the R3 screenshot — clears the target with zero to
spare while 16 and 18px roles get 46 and 48.

**Cascade:** the -15px rule lives AFTER the -6px base rule, because the cascade reads equal
specificity by file order and the pointer, not that order, must decide. A first draft placed it
inside the existing coarse block, twenty lines above the base rule, where -6px would have won.

**Scope note:** the toggle switch (34×18, its own `::after` -6px inset) is untouched. Its track
proportions already match the reference switch, its target arithmetic was measured when it
landed, and the lane's assertions cover glyph boxes, not tracks.
<!-- /ANCHOR:inset -->

---

<!-- ANCHOR:adr-single-select -->
## 3. SINGLE-SELECT BY BEHAVIOUR, NOT BY THE RADIO GLYPH (ADR)

**Decision:** every exclusive-choice control in the app keeps its single-select semantics through
the group's behaviour, and no control surface carries a radio any more — neither
`input[type=radio]` nor `role="radio"`.

**Why:** the operator's directive is "we shouldn't have radio inputs, only checkboxes". The
placement picker, the column-width presets and the settings sheet's computed-sync segmented
options never drew a radio glyph — they are text options with an active highlight — so their
"radio-ness" was purely the ARIA spelling. Those become `role="checkbox"` + `aria-checked`,
with the group activating one option and clearing the others exactly as before; the screen
reader gains a checkbox-reading where it had a radio-reading, and nothing visual moves. The
computed-sync cards' three native `input[type=radio]` boxes become the shared checkbox
component (`createCheckbox`, role field), keeping their `value` so the reflect loop reads the
same thing it always did; tapping the already-selected card re-asserts it rather than clearing
it, which is the behaviour the radio set had and a bare checkbox would lose.

**Consequence, recorded:** the sheet-grammar predicate that returned false whenever a panel
carried a native radio now passes vacuously for that guard — no panel can carry one. The
desktop settings panel's grammar column reads the same `false` it read before, for a different
reason: its switch deliberately keeps its own class on desktop, one raw input short of the
family. Both facts are asserted where they changed.
<!-- /ANCHOR:adr-single-select -->

---

<!-- ANCHOR:column -->
## 4. THE SELECT COLUMN'S 28PX-ERA RESERVE

Shrinking the checkbox to 16px left the phone's select column sized for a control that no longer
exists: 40px of column around a 16px box, which the placement lane's own check states as "a
second control's worth of room with no second control in it" (sorted cell minus widest control:
24px, against its 16px allowance). Three connected decisions:

- The sorted state's column drops 40 → 28px: the 16px checkbox, the 1px border, the 4px pin and
  7px of breathing room — the same 12px of non-checkbox allowance the 40 carried.
- The auto-layout release gains `col.obnotion-select-colgroup`, because a `<col>` width floors
  the column in auto layout: the 40px hint would have won over the 28px cell rule silently.
- The reorderable state keeps 64px, its 16px-scale step. That is not inertia: 4 + 28 + 4 + 16 = 52,
  and the 12px surplus is what keeps the checkbox's -15px inset exactly 1px clear of the move
  button instead of swallowing its right 11px. The derivation comment on the 64 states this.

The desktop select column keeps its 40px: the same 28px-box-plus-12 arithmetic, undisturbed.
<!-- /ANCHOR:column -->

---

<!-- ANCHOR:zero -->
## 5. THE BARE `0` UNDER "PINNED" (FINDING, NOT A FIX)

The R3 screenshot shows each board card with the large circle and a bare `0` beneath it. The
value slot of a checkbox-property card field renders only the shared checkbox
(`record-surface/property-row.ts`'s checkbox branch creates the input and nothing else), so the
`0` was never this control's text. After the property-reads repair landed (a75a1ae2), the
capture-sized board mount reads 36 checkbox fields, 18 of them checked, and 0 card fields of any
type rendering a literal `0`: the screenshot's `0` was a sibling number property showing its
stored value through the then-broken read path, which 070 already fixed. Recorded here so the
next reader does not go looking for a missing label.
<!-- /ANCHOR:zero -->

---

<!-- ANCHOR:verification-side-note -->
## 6. VERIFICATION SIDE-NOTE

The engine-parity disagreement report re-measured at this packet's stylesheet: 50 elements
disagree between Chrome and WebKit, the same count the committed report recorded, all intrinsic
text-width differences in inputs and buttons. It is re-stamped, informational, and outside the
gate; it is mentioned here only because its freshness was re-earned during this packet and the
next reader deserves to know the 50 is not new.
<!-- /ANCHOR:verification-side-note -->
