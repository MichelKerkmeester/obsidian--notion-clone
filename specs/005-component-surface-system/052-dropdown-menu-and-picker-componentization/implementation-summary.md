---
title: "Implementation Summary: Dropdown, Menu and Picker Componentization"
description: "T001 is landed and nothing else is. The design true-up measured all 150 desktop menu captures and 59 iOS states against the packet's sixteen grammar rows and twenty-five family surfaces, and eleven drafted premises turned out to be wrong — including a caveat five documents had been repeating and three census baselines that could not have been observed red."
trigger_phrases:
  - "052 implementation summary"
  - "menu componentization what shipped"
  - "menu grammar true-up result"
  - "052 validation evidence"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/052-dropdown-menu-and-picker-componentization"
    last_updated_at: "2026-09-05T16:10:00Z"
    last_updated_by: "design-trueup"
    recent_action: "Read the 150 menu and 59 iOS captures at T001 and trued up every grammar row"
    next_safe_action: "Execute T002 and T003 against the corrected census figures, then T004"
    blockers:
      - "AC-010 is operator-owned and nothing in this repository can close it"
      - "checklist.md C7 still carries the 9-widths-including-240 figure and was outside this change's write scope"
    key_files:
      - "specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization/design-trueup.md"
      - "src/views/owned-menu.ts"
      - "src/views/menu-row.ts"
      - "src/views/dropdown-field.ts"
      - "src/views/cell-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-052-trueup"
      parent_session_id: null
    completion_pct: 7
    open_questions: []
    answered_questions:
      - "Do Anytype's hover-open submenus adopt on desktop? Yes — and hover-open is proved by the sweep's own procedure, not inferred."
      - "Where does the create affordance sit? First, under the search field and above the list. Last-in-section is for escalation."
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
| **Spec Folder** | 052-dropdown-menu-and-picker-componentization |
| **Status** | Draft |
| **Completed** | Not complete — T001 only, 2026-09-05 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

No code. One document, and the first thing it found was that a sentence five documents in this
program had been repeating is false.

**Hover states were captured, 37 times.** `screenshots/anytype/README.md` says under "Still not
reachable" that no hover state was captured, and `050` §2, this packet's G8 and G16, and `spec.md`
§6's risk row all inherited it. But **37 of the 150 menus in `menus/` were reached by hovering a row
of their parent** — the index's own "How it was reached" column says `▸ hover "align"` — and each of
those files photographs the parent row *in its hover state*. Measured: `#232323`, 28px tall, inset
~10px inside a 16px content inset, **1.14:1** against its own panel. The grammar was on disk the
whole time, and it is refused on contrast rather than for want of evidence.

The same 37 captures close both of this packet's submenu questions from the crawler's procedure
rather than from a pixel. The sweep could only open a submenu by hovering its parent, so
**hover-open is observed**; and the README records that one Escape closes the child and leaves the
parent open, which is **ADR-001's innermost-only dismissal, observed**. `spec.md` §11 loses a
question it had marked code-derived.

### The design true-up

`design-trueup.md` carries one row per grammar pattern and one row per family surface. Each says
whether the surface was **seen**, names the file it was read from, quotes the measured values, and
states what our tree does today. Where no capture exists the row says **design inferred from source
code, not seen** rather than inventing a screen — four grammar gaps and five census surfaces are in
that state and each is named.

Two findings change what the legs will build. **The create affordance sits first, not last.**
ADR-002 said the action row "sits last in its section"; the only capture that shows the row —
`menus/anytype-menu-object-more-add-link-to-object-dark.png` — puts `＋ Create Object` between the
search field and the first result, which is the only position where it is reachable while the query
that would create the thing is still on screen. Last-in-section is where Anytype puts an
*escalation* (`Add advanced filter`), which is a different act. And **the checkmark is trailing**:
ours are two grammars for one affordance and both are leading, where every captured tick sits at the
16px right inset — which is also what frees the leading slot for the format icon G12 and G15 both
need.

Three census baselines were wrong, and a threshold whose failing value is asserted wrongly cannot be
observed red. The hand-built row count is **70** outside `menu-row.ts` and not 71, with
`toolbar-renderer.ts` at **44** and not 45; the bespoke width literals are **8** at 14 production
call sites and not 9, because `chart-toolbar-renderer.ts:927` passes 280 and the only 240 in the
tree is a story value. `checklist.md` C2 already carried the right row count; four other documents
did not.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `specs/.../052-.../design-trueup.md` | Created | T001's output: the measured geometry set, five width tiers, sixteen grammar rows, twenty-five re-evidenced surfaces, eleven contradictions and four refusals |
| `specs/.../052-.../implementation-summary.md` | Created | This document |
| `specs/.../052-.../anytype-menu-grammar.md` | Modified | Fourteen G-rows trued against the pixels; §3's unsettled list rewritten; §5 added as the T001 correction table |
| `specs/.../052-.../decision-record.md` | Modified | ADR-004 (create-row placement; ADR-001 and ADR-003 confirmed) and ADR-005 (which measured values the family adopts and which it refuses) |
| `specs/.../052-.../acceptance-criteria.md` | Modified | AC-009 and AC-005 to `Met`; corrected baselines in AC-002, AC-003 and AC-007; hover added to AC-001's paths |
| `specs/.../052-.../spec.md` | Modified | The corrected census in the summary, §2 and REQ-002/REQ-003/SC-003; two risk rows closed; §7's four overlaps extended; one open question closed |
| `specs/.../052-.../componentization-plan.md` | Modified | Every M and P row cites a capture that resolves or says it has none; §3's width table re-counted against the measured tiers; §4's contract gains seven clauses |
| `specs/.../052-.../plan.md` | Modified | The three ADRs annotated, the dependency rows, the Phase 1 status and the submenu's fourth path |
| `specs/.../052-.../tasks.md` | Modified | T001 ticked with its evidence; T002-T006, T011 and T012 carry the measured values |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Measure, then decide — `../050-anytype-adoption/design-trueup.md`'s method, unchanged, and
`../055-states-feedback-and-motion/design-trueup.md`'s shape.

The captures were opened, not inferred from filenames. Geometry came from a per-pixel scan: panel
frames located by their `#292929` border ring, row bands from a per-row ink profile inside the
frame, dividers from full-inset runs of the border colour, and insets from the first and last ink
column of each band. Contrast was recomputed from the sampled RGB rather than quoted — which is how
`050` §2's `#A3A3A3` figure was found to be 7.11:1 rather than 7.95:1, immaterial to any decision
but wrong.

**One fact made the width table quotable and would otherwise have corrupted it.** Every file in
`menus/` is the menu's bounding box plus a **12px shadow margin on each side**, so the panel frame
sits at x = 12 and the panel width is the clip width minus 24. A naive read of the file dimensions
reports a 280px menu where the panel is 256px. Finding it is what let this read reproduce `050`'s
256 from a different capture of the same menu, which is the cross-check that licenses the rest.

Two evidence classes were kept apart. The desktop set is 1 device pixel to 1 CSS pixel; the iOS set
is 3×, so every phone figure is stated in points with the raw band beside it. And where a fact came
from the sweep's *procedure* rather than from a pixel — hover-open, the Escape order, the sort
icon's lack of a menu — it is labelled as procedural evidence, because that is a different claim
from a measurement and it deserves its own name.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Hover-open submenus adopt on desktop, behind `@media (hover: hover)` (ADR-004) | Proved by the sweep's own procedure — 37 submenus were reachable only by hovering. Click and `ArrowRight` are retained, because a coarse pointer has no hover |
| The create row renders first, under the search and above the list (ADR-004) | The only capture that shows the row puts it there. A create row below the results is off screen exactly when a long list makes creation likeliest |
| Last-in-section is reserved for escalation | `Add advanced filter` sits last, below a divider — an escalation out of the surface, not a creation inside it |
| The checkmark moves trailing, one grammar (ADR-005) | Every captured tick is at the 16px right inset, and it frees the leading slot for the format icon. The `✓` text node is deleted rather than restyled, because a glyph cannot carry `menuitemcheckbox` semantics |
| iOS's second checkmark grammar is refused | One product, two ticks for one affordance, is the exact defect G14 exists to close |
| `#232323` is refused as a hover or selection fill (ADR-005) | **1.14:1** on its own panel, against WCAG 1.4.11's 3:1 for a non-text element that is the only thing marking state. `050` refused it on a preselect; this read is the first to measure it on a hover |
| The 360px panel tier is adopted by agreement, not by change | It is already the top of our `panel` role. The measurement and the established value are the same number, so nothing moves |
| Anytype's 224px and 256px menu tiers are declined | Our documented `menu` role is 292px and `050` already declined 256. A themed host with the user's own font stack has no business at 224 |
| Our `condition panel` at 552px is **not** narrowed to Anytype's 360 | Anytype stacks the condition across two surfaces where our row carries property, operator, value, group, NOT and remove on one line. Different row shape, different floor |
| The colour picker keeps its 12-swatch grid | Anytype's is a 224px labelled list — a different surface, not a wider one. Swapping ours is a redesign no requirement here asks for; the trailing tick and named colours transfer |
| Pickers group only when the list mixes kinds | The filter property picker is flat on both platforms; `sheet-relation-add` groups because it mixes formats with existing properties. That is a rule a renderer can apply |
| The `Create` pill's ~35pt height is refused | Below the 44pt iOS floor and `044`'s 44px close. `055` refused the same pill for the same reason |
| The 28px row deviates from the spacing scale, and is adopted anyway | It is simultaneously Anytype's measured row and `design-system.md` §9's coarse-pointer floor. A measurement and an established value agree; the scale default loses to both |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Spec-folder validation, `orchestrator.js --strict` | PASS — first `RESULT:` line for this folder |
| Graph metadata re-derived after the doc edits | PASS — `GENERATED_METADATA_INTEGRITY` and `GENERATED_METADATA_DRIFT` clean |
| Every cited capture filename resolves under `screenshots/anytype/` | PASS — **103 distinct references across the packet's nine docs, zero missing** |
| Every grammar row cites a capture or names its gap | PASS — 16 G-rows, of which 4 carry a named gap labelled *design inferred from source code, not seen* |
| Every census surface re-evidenced | PASS — 25 rows in `design-trueup.md` §4; 5 named as having no Anytype capture (M4, M5, M12, M15, M7's desktop half) |
| Row census re-measured on the current tree | PASS — `grep -rn "db-menu-item" src/views/*.ts \| grep "cls"` → **76**; **70** outside `menu-row.ts` (44 / 19 / 4 / 3) |
| Width census re-measured | PASS — **8** distinct `preferredWidth` literals at **14** production call sites; 240 present only in `popover-position.stories.ts:40` |
| Duplication baselines re-measured | PASS — 3 `activePickers` WeakMaps (`:71`, `:29`, `:50`); 2 navigators (`option-color-picker.ts:138`, `icon-picker-popover.ts:284`) |
| Contrast recomputed for every colour adopted or refused | PASS — `#E1E1E1` 13.71:1 and `#A3A3A3` 7.11:1 adopted as roles' analogues; `#232323` **1.14:1 refused** |
| Panel scale cross-checked against `050` | PASS — `object-more` measures 256 × 504 here against `050`'s 256 from a different capture of the same menu |
| Scope: only the packet's own docs modified | PASS — `git status` shows the nine files above and nothing else |
| Code changed | None. This packet's legs have not started |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **`checklist.md` C7 is now wrong and was not edited.** It records "9 distinct values ... 420, 360,
   318, 292, 280, 252, 240, 124, 520" against a measured 8 at 14 production sites, with 240 a story
   value only. Editing `checklist.md` was outside this change's write scope; **T003 owns the
   correction** and `tasks.md` now says so. C2 is already right at 70, which is what made the
   contradiction visible in the first place.
2. **Four grammar patterns still have no capture** — a fully-gated action menu (G3's "No available
   actions" wording), the state-naming toggle label (G7), a right-click on a desktop view tab (M7),
   and submenu nesting deeper than depth 2. The first is procedural: `menus.mjs` refuses destructive
   and mutating actions by name, and a fully-restricted selection was never constructed.
3. **Five census surfaces have no Anytype counterpart at all** — number-display styles, text render
   modes, the timeline row menu, the chip-edit popover, and the desktop view-tab menu. Four are
   surfaces Anytype does not ship, so no amount of further capture would answer them.
4. **The submenu's hover path needs a lane assertion that it does *not* fire on a coarse pointer.**
   AC-001 now names four paths where it named three, and the fourth is the only one whose correct
   behaviour on a phone profile is absence. `plan.md` §5 records it; no lane row exists yet.
5. **`goal.md` was not edited.** Its D1 and D3 clauses describe the capture read as outstanding.
   They are satisfied by `design-trueup.md`, but the goal document sits above this packet's write
   scope for this change and reconciling it belongs with the phase's closure at T015.
6. **No number was taken from `mobile-official/`.** Those twenty files are App Store and Google Play
   marketing creative — good evidence of intent, weak evidence of pixels — and the iOS simulator set
   supersedes them for every phone figure quoted here.
<!-- /ANCHOR:limitations -->
