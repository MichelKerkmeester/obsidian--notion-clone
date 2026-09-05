---
title: "Implementation Summary: Toolbar and View Controls"
description: "L0, the capture-read gate, is complete: the Anytype captures were measured per-pixel and the packet was trued up against them, which struck three planned changes, closed two open questions and retired one risk before a line of code was written."
trigger_phrases:
  - "implementation summary"
  - "053 implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/053-toolbar-and-view-controls"
    last_updated_at: "2026-09-05T18:30:00Z"
    last_updated_by: "design-trueup-t001"
    recent_action: "Completed L0: measured the captures, wrote design-trueup.md"
    next_safe_action: "Execute T002, the red-first threshold measurements"
    blockers: []
    key_files:
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/design-trueup.md"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/toolbar-surface-inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-053-trueup"
      parent_session_id: null
    completion_pct: 8
    open_questions: []
    answered_questions:
      - "T001: the rail does not move, so the sticky-offset risk is void"
      - "T001: the settings landing applies on phone"
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 053-toolbar-and-view-controls |
| **Completed** | L0 only — 2026-09-05. L1-L5 are open |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**No code. One leg of documentation, and it made the packet smaller.** L0 is goal D1's
capture-read gate, carried unsatisfied through three drafting sessions whose runtimes could not
render images. T001 satisfied it: the 120-file catalogue, the 600-file menu sweep and the 118-file
iOS set were measured per-pixel rather than described, and the packet was trued against what they
show. The read overturned two of `050`'s seven contradictions, corrected one of its adopted values,
closed three surfaces the inventory had marked `no capture`, and disproved one clause in this
packet's own completion criteria.

### The capture read (T001)

`design-trueup.md` measures every toolbar surface and states, per row, what the design takes and
what it refuses. The eight contradictions it resolved are indexed in `toolbar-surface-inventory.md`
§8.2; the per-row record of files opened is §8.1, and it covers **24 of 24** rows.

Two findings carry most of the weight. **The chip rail exists and is photographed** — `050` C2 said
it appears on no capture, and it is on eleven, fully measurable at 28px with a leading direction
arrow, a 1px group separator, unfilled filter chips and a right-aligned `Clear`. **The per-view
default exists and is in the New menu** — `050` C7 said the product has none, having looked in the
view-settings panel; `Default Type for this View` and `Template for this View` are one surface over.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `design-trueup.md` | Created | The measurement of record: the system table, the four contrast refusals, 24 rows and the roll-up |
| `toolbar-surface-inventory.md` | Modified | §8 added (per-row capture record, the eight contradictions, §5's questions answered); T10, T13, T14, T16, T17, T19, T24 and the §4 calculations row trued |
| `spec.md` | Modified | REQ-102 and REQ-106 restated; B2 and B6 rewritten; the sticky-offset risk retired; two of three open questions closed |
| `acceptance-criteria.md` | Modified | AC-112 → **Met**; AC-102, AC-106, AC-107 restated with their `050` thresholds intact |
| `plan.md` | Modified | L3 loses the band move and the direction colour; L5 gains the presets' new home; ADR-001's summary reconciled to Accepted |
| `tasks.md` | Modified | T001 ticked with evidence; T004, T005, T006, T008, T009 capture fields replaced with measured files |
| `decision-record.md` | Modified | ADR-001 amended a second time on the measurements |
| `goal.md` | Modified | D7 and completion criteria 2 and 5 trued; the "could not look at the captures" deviation closed |
| `implementation-summary.md` | Created | This file |

**No file under `src/`, `styles.css` or `tools/` was touched.** L0 is a documentation leg by
definition, and the write authority for this session was the packet docs only.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

**Measured, not eyeballed.** Every geometric figure comes from a per-pixel run-length scan — band
detection over an ink profile for row pitch, border-to-border scans for widths, colour histograms
for fills — and every contrast figure from the WCAG relative-luminance formula. That method exists
because `050` records the failure mode it prevents: its own first pass called a grey funnel blue.

**Cross-checked before it was quoted.** The 1:1 pixel claim was re-proved rather than inherited —
the 32px toolbar icon pitch and the 360px panel width each measure the same in two different
folders by two different methods. The icon-state test that decides the dual-mode rejection was run
on light theme across three views where `050` ran it on dark, and reproduced its numbers exactly
(`ink=52, sat=0` funnel; `ink=80, sat=80` sort).

**Negative controls were run, not assumed.** The chip rail's conditionality is asserted from ten
positive files *and* five negative ones — the same five sets' Grid, Gallery, Kanban, Calendar and
Graph views, scanned at the same coordinates and found empty. And the one duplicate capture in the
set-controls context was found by hashing all 59 files, not by looking.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Withdraw the chip rail's move into the toolbar band | The capture places Anytype's rail below a full-content-width divider in its own band — which is where `active-view-controls-renderer.ts` already renders it. There is nothing to move, so the change, the risk row and the header-height measurement all go |
| Demote the direction colour to a redundant signal | Anytype never carries direction by colour: a `↓` glyph on desktop, the word `Ascending` on the phone. And its own chip pair measures 3.14:1 accent-on-tint with a 1.19:1 fill against its bar. Direction rides the glyph and the word; colour may be third and never only |
| Move the presets section to the New menu | `anytype-menu-set-new-object-light.png` is the captured home for a per-view creation default, and it is where the reader already is when they create a row |
| Keep the `condition panel` role at 440-560px against a measured 360px | The measurement covers a different row. Anytype fits 360px by splitting one condition across three stacked popovers; ours carries property, operator, value, group, NOT and remove on one line |
| Keep the chip radius at 8px against a measured full pill | r≈14 is off our 4/6/8 scale, and mixing pill and square corners in one interface degrades both. The 26px → 28px height change is adopted, because there the measurement and our own coarse-pointer floor agree |
| Refuse four Anytype colour pairs outright | 1.14:1 open-trigger fill (corrected 2026-09-05 from 1.20:1, to match `050` §2 and `052` C1), 3.14:1 chip label, 2.03:1 inactive tab, 3.74:1 New label. The geometry is taken and the palette is not; this is an Obsidian plugin and the theme owns the ramp |
| Keep the calendar and timeline option triggers despite capture evidence for merging | Anytype has one settings trigger per view and reaches every per-layout option through it. Merging would move surfaces carrying the Project Manager parity, which parent goal D5 forbids without a recapture read. The evidence is recorded so a later phase can revisit rather than rediscover |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `orchestrator.js <folder> --strict`, run from the primary checkout | **PASS** — first `RESULT: PASSED`, 0 errors |
| Baseline comparison | The packet validated **PASSED, 0 errors** at HEAD before this session, so the delta is a like-for-like comparison, not a pre-existing failure absorbed |
| AC-112's threshold (24 of 24 rows carry a record or a named gap) | **PASS** — `toolbar-surface-inventory.md` §8.1, every named capture resolving under `screenshots/anytype/` |
| Every capture filename cited resolves on disk | **PASS** — checked by path, including the six rows that resolve to a named gap rather than a file |
| Contrast figures | **PASS** — computed from sampled hexes with the WCAG relative-luminance formula, not estimated |
| Code, styles and tooling untouched | **PASS** — the scoped diff contains only the nine packet documents above |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Six rows remain `design inferred from source, not seen`** — T5, T6, T9, T18, T20 and T22.
   Three of them cannot be captured in principle: Anytype ships no multi-database switcher, no
   chart layout and no timeline layout. T6 and T9 were reachable and were not reached. T18, the
   sort-conflict confirm, is unreachable by a still sweep by construction.

2. **The sort direction chooser is unseen inside a captured row.**
   `anytype-menu-set-sort-direction-{light,dark}.png` is byte-identical to its `-added-` pair
   (md5 `909659cd…`), so that interaction never landed. The direction *button* is measured; what
   opens behind it is not. It is the only duplicate among the 59 set-controls menus, found by
   hashing all of them.

3. **The chip rail's exact predicate is not decidable from stills.** It is present on all five
   sets' List views and absent on their Grid, Gallery, Kanban, Calendar and Graph views, while the
   menu sweep's Grid *does* carry it. That it auto-hides is certain; what precisely triggers it is
   not, and this document does not guess.

4. **Two `050` REQ-012 caveats survive unchanged.** Only one inline width exists in the sweep, so a
   measured collapse and a fixed breakpoint remain indistinguishable — "measures its own natural
   width" stays source-derived. And hover was never captured, so the inline toolbar's missing icons
   may be hover-revealed rather than absent.

5. **The README and the pixels disagree about the sort trigger, and the disagreement is recorded
   rather than resolved.** The capture methodology calls it "a state indicator, not an opener";
   the pixels show it identical in every state. Both can be true if the state rides a surface no
   capture reached. Either reading rejects a dual-mode trigger, so the design is unaffected.

6. **Nothing here is implemented.** L0 is a gate, not a leg of the build. T002's red numbers and
   T003's primitives are the next work, and every threshold this document restated still has to be
   observed failing before it is written.
<!-- /ANCHOR:limitations -->
