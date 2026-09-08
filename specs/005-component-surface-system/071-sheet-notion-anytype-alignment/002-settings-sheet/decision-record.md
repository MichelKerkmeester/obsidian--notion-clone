---
title: "Decision Record: Settings Sheet Redesign"
description: "The decisions this phase took and the alternatives they beat."
trigger_phrases:
  - "decision record"
  - "002-settings-sheet decisions"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/002-settings-sheet"
    last_updated_at: "2026-09-08T19:15:00Z"
    last_updated_by: claude-run3
    recent_action: "Recorded the five implementation decisions"
    next_safe_action: "None — decisions accepted; revise only on new evidence"
    blockers: []
    key_files:
      - "styles.css"
      - "src/views/view-config-sheet-row-grammar.test.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "002-settings-sheet-run3"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Settings Sheet Redesign

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/002-settings-sheet
**Status:** Accepted
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:context -->
## 2. CONTEXT

The 0.0.30 device report called the phone Settings sheet "really bad ui": a two-column grid
squeezed the label and control into separate columns and the dropdown control opened an
overflowing native select list. The 0.0.31 guard-row fix stopped the worst of it, but the
operator's R5 note (2026-09-08 08:10) stands: "Also settings sheet has really bad ui. Actually
all sheets should mimic notion way closer." This packet is the settings-sheet leg of that
alignment.

The measurement constraint: the third-party Notion/Anytype reference captures carry no
readable measurements (their manifests hold filenames only), and this harness verifies by
printing numbers, not by viewing images. The redesign therefore asserts the operator's
Notion-shape directives as measured targets and proves them with the lane.
<!-- /ANCHOR:context -->

---

<!-- ANCHOR:decisions -->
## 3. DECISIONS

### D-001: Scope the column override to editor rows; do not touch the producer

**Decision:** Implement the compact/editor row split entirely in `styles.css`, keyed on the
field-variant classes the renderer already lands (`-field-stack` vs the
dropdown/checkbox/switch/summary/readonly variants). `src/views/view-config-panel-renderer.ts`
is unchanged.

**Alternatives:**
- *Add a row-direction modifier class in the producer* — clearer intent at the DOM, but it
  duplicates information the variant classes already carry, and a producer change would have
  widened the recapture and evidence blast radius for zero behavioral gain.

**Consequence:** the grammar lives in the variant-class contract between renderer and
stylesheet. That contract is now load-bearing; the unit test
(`src/views/view-config-sheet-row-grammar.test.ts`) reads `styles.css` so a silent change to
the override bites in CI.

### D-002: Assert pitch on compact rows; exempt editor rows

**Decision:** The 44–52px row-pitch assertion applies to control rows only (measured 48.0px);
editor rows (text, textarea, range, stacked fields) keep label-above-control at ≥90% width.

**Alternatives:**
- *One pitch number for every row* — false for multi-line editors; it would have forced either
  clamping editors (worse usability) or weakening the assertion until it said nothing.

### D-003: Measure horizontal fit as scrollWidth − borderLeft == clientWidth

**Decision:** The phone sheet carries a 1px left border (side-sheet grammar) that counts into
`scrollWidth` but not into the content box. The no-overflow assertion at 402px subtracts it.

**Alternatives:**
- *Plain `scrollWidth == clientWidth`* — reports a permanent 1px "overflow" that is actually the
  border, which would either mandate padding hacks or a lying assertion.

**Consequence:** the 1px-left/0px-right asymmetry is shipped deliberately and recorded as a
finding for the 004/005/006 legs.

### D-004: Divider token fallback (#333333)

**Decision:** Where the host's `--background-modifier-border`-derived subtle divider token
resolves to nothing (the lane harness skips the theme by design; host themes may too), the
divider token falls back to a 1px #333333 rule.

**Alternatives:**
- *Require the host token, fail soft to 0px* — the pre-fix behavior; invisible dividers are
  exactly the "section grouping" gap the redesign closes.

### D-005: Reference measurements stay `TBD` rather than invented

**Decision:** The reference columns of the gap table (`spec.md` §13) state that the third-party
captures carry no numbers. The Target column carries the operator's directives, and the lane
asserts those.

**Alternatives:**
- *Estimate measurements from the reference PNGs* — no image-viewing in this harness; guessed
  numbers would be unreadable-then-uncited decoration.
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:consequences -->
## 4. CONSEQUENCES

- The compact/editor field-variant contract is load-bearing; the unit test guards it.
- 071 legs 004/005/006 inherit the extent-minus-border predicate, the divider token fallback,
  and the left-border asymmetry note.
- The gap table's reference columns remain honest `TBD`s until a numbers-printing measurement
  pass over the third-party captures exists.
<!-- /ANCHOR:consequences -->
