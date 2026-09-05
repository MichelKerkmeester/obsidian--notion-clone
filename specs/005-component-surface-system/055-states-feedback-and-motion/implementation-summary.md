---
title: "Implementation Summary: States, Feedback and Motion"
description: "T001 is landed and nothing else is. The design true-up measured every state, feedback shape and motion token against the captures and against anytype-ts source, and nine of the packet's drafted premises turned out to be wrong — including two that could not have been observed red as written."
trigger_phrases:
  - "055 implementation summary"
  - "states feedback what shipped"
  - "design true-up result"
  - "055 validation evidence"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/055-states-feedback-and-motion"
    last_updated_at: "2026-09-05T15:40:00Z"
    last_updated_by: "design-trueup"
    recent_action: "Read the captures and the motion source at T001 and trued up every state row"
    next_safe_action: "Execute T002 against the thresholds ADR-004 and ADR-005 restated"
    blockers:
      - "AC-012 is operator-owned and nothing in this repository can close it"
      - "state-feedback-vocabulary.md §4's duration census is superseded by design-trueup.md and was outside this change's write scope"
    key_files:
      - "specs/005-component-surface-system/055-states-feedback-and-motion/design-trueup.md"
      - "src/views/empty-state-renderer.ts"
      - "src/views/modals/confirm-modal.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-055-trueup"
      parent_session_id: null
    completion_pct: 8
    open_questions: []
    answered_questions:
      - "Is Anytype's destructive treatment one decision? No — it is two, split by platform, and both are measured."
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
| **Spec Folder** | 055-states-feedback-and-motion |
| **Status** | Draft |
| **Completed** | Not complete — T001 only, 2026-09-05 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

No code. One document, and it changed the packet more than it confirmed it. T001 measured every
state, feedback shape and motion token against the capture sweep and against `anytype-ts`'s own
stylesheet, and **nine drafted premises turned out to be wrong** — two of them badly enough that
their thresholds could not have been observed red as written, which is what goal D2 requires before
any leg may start.

### The design true-up

`design-trueup.md` carries one row per state, and each row says whether the surface was **seen**,
names the file it was read from, quotes the values, and states what our tree does today. Where
neither a capture nor a source line exists, the row says **design inferred from source code, not
seen** rather than inventing a screen — four rows are in that state and each is named.

Three findings changed what the legs will build. Anytype's **destructive treatment is platform-split
and the desktop half has none**: a per-pixel scan of the desktop `···` menu returns zero reddish
pixels on `Move to Bin`, and zero again on `Empty Bin`, while iOS renders `Delete` in `#FF4A4D`
beside a red trash glyph. Anytype ships **no reduced-motion story at all** — `prefers-reduced-motion`
occurs zero times in its source — so AC-007 is not adopting anything, it is doing something the
reference build does not do. And **`047` §10's motion finding is wrong in both halves**: the toast's
enter and exit share one `0.2s`, and the "centralized helper" is three constants plus 18 hand-typed
durations.

The empty-state reading is the one that most directly serves the operator's componentize directive.
`050` recorded that Anytype renders no empty-state block; that is true, and it is **desktop-scoped**.
The iOS client renders three different shapes, and the tier tracks how actionable the state is — a
grey line when the list is empty by configuration, an illustration over one line when nothing can be
done from here, and illustration plus title plus body plus an action when the user can make the
first one. That ladder is now the empty-state design, and it replaced "one card shape for twelve
reasons".

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `specs/.../055-states-feedback-and-motion/design-trueup.md` | Created | T001's output: the measured true-up, nine contradictions, the motion table and the refusals |
| `specs/.../055-states-feedback-and-motion/implementation-summary.md` | Created | This document |
| `specs/.../055-states-feedback-and-motion/decision-record.md` | Modified | ADR-004 (the `050` restatements bind, and the citation now resolves) and ADR-005 (the motion set is measured; `--db-motion-surface` becomes 200ms) |
| `specs/.../055-states-feedback-and-motion/acceptance-criteria.md` | Modified | Seven Verification cells carry measured figures instead of drafted ones |
| `specs/.../055-states-feedback-and-motion/spec.md` | Modified | The motion table, the corrected census, the confirm and notice rows, and one open question closed |
| `specs/.../055-states-feedback-and-motion/tasks.md` | Modified | T001 ticked; three red-first premises restated; four Capture fields corrected |
| `specs/.../055-states-feedback-and-motion/plan.md` | Modified | Definition of Ready, the L4 leg's token values, M1, and the ADR pointer |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Measure, then decide — `../050-anytype-adoption/design-trueup.md`'s method, unchanged.

Two evidence classes, kept apart because they answer different questions. A still capture answers
*what does the state look like*, so every state row cites a PNG in `screenshots/anytype/` and the
images were opened and read, not inferred from filenames — the file named
`anytype-menu-set-sort-empty-dark.png` is not an empty state at all, which only reading it shows. A
still cannot answer *how does it move*, so every motion value is a `file:line` read of
`specs/context/anytype-ts/src/scss/` and none is attributed to a capture.

Colour was sampled with a per-pixel scan rather than by eye, and every contrast ratio was recomputed
from the sampled RGB. That is what turned "the destructive row is presumably red" into a measured
zero, and what caught the iOS `Create` pill's border at 2.21:1 against WCAG 1.4.11's 3:1 — a
refusal that would have been missed at a glance, because a light-grey outline on a dark sheet looks
fine until it is measured.

Where the packet's own figures disagreed with each other, both were re-measured on the current tree
rather than one being picked.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| `--db-motion-surface` moves from `180ms` to `200ms ease-out` (ADR-005) | Anytype puts menu, popup and sidebar on one `0.2s` constant with a decelerating curve. Our 180ms was three stray literals, not an established token, and a measurement outranks a stray |
| `--db-motion-fast` stays `120ms ease` | An established project value with 42 declarations on it beats Anytype's neighbouring `0.15s`. Both sit in the same band, so consistency decides |
| `--db-motion-scale-from: 0.98` is added as a token | Our popover and the new toast need the same number, and a scale written twice drifts — the argument the sheet duration's own comment already makes |
| `$easeInQuint` is not ported | `design-system.md` declares no easing vocabulary, and a bespoke curve beside the keywords would be a second system. The constant's name also says the opposite of its shape |
| The empty-state design is a three-tier ladder, not one card | Measured on the iOS client, and the tier tracks how actionable the state is — which is a rule a renderer can apply, not a style |
| Empty-state copy names the action, not the absence | *"Nothing found. Create first option to start."* against our *"There are no records in this view yet."* — the second states the absence twice and names nothing to do |
| Destructive signal pairs colour with an icon; `#FF4A4D` is not adopted | This is a themed host and `mod-warning` is the user's theme's. What transfers is that Anytype's red row is never red alone |
| The iOS `Create` pill is refused | Its border measures 2.21:1 against WCAG 1.4.11's 3:1, and at 35.7pt it is under the 44pt touch floor — the same class of refusal `050` made at 1.14:1 |
| Anytype's toast `scale3d(0.75)` is refused | Outside the 0.95-1.05 deformation bound, on the one surface this phase builds |
| ADR-003 stays unused locally | `051` ADR-003 owns the confirm primitive; a local ADR-003 beside it would read as the same ruling |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Spec-folder validation, `orchestrator.js --strict` | PASS — first `RESULT:` line for this folder |
| Graph metadata re-derived after the doc edits | PASS — `GENERATED_METADATA_INTEGRITY` and `GENERATED_METADATA_DRIFT` clean |
| Every state row cites a capture, a source line, or names its gap | PASS — 8 rows, 4 of them labelled *design inferred from source code, not seen* |
| Every motion value carries a `file:line` | PASS — `_mixins.scss`, `notification/common.scss`, `popup/common.scss`, `menu/common.scss`, `common.scss` |
| Duration census re-measured on the current tree | PASS — 87 `transition:` / 21 `animation:` declarations; 42 declarations carrying 78 `120ms` occurrences; 7 `var(--db-transition-fast)` uses; 16 further durations in seconds |
| Contrast recomputed for every colour adopted or refused | PASS — `#F3F3F3` 14.85:1, `#909090` 5.16:1, `#FF4A4D` 5.75:1 adopted; `#555555` border 2.21:1 refused |
| Scope: only the packet's own docs modified | PASS — `git status` shows the seven files above and nothing else |
| Code changed | None. This packet's legs have not started |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **`state-feedback-vocabulary.md` §4's census is now superseded and was not edited.** It carries
   the 42-versus-78 confusion, the `8 uses` figure and the `ms`-only stray list. The corrected
   figures live in `design-trueup.md` and in `acceptance-criteria.md` AC-007/AC-008. Editing that
   file was outside this change's write scope; reconciling it is the first thing the L4 leg should
   do.
2. **`checklist.md` is unfilled.** T001 wrote its measured figures into the Verification cells of
   `acceptance-criteria.md`, where a threshold is audited. `checklist.md` remains the per-leg record
   of red-then-green and is filled as each leg lands, not up front.
3. **Four states have no capture on either platform** — `empty.deleted-relation`, `loading`,
   `error` and `destructive.confirm`. Two need none. The confirm's absence is procedural: the
   capture sweep refuses destructive actions by name, so no confirmation was ever raised.
4. **No phone figure was taken for the page limit.** `anytype-mobile-set-grid` shows no `Load more`
   row, but a viewport is not a scroll to the end, so the 60 stands from the desktop gallery panel.
5. **The persistent-undo placement is recorded, not designed.** iOS carries `Undo/Redo` as a menu
   row, which does not depend on catching a toast before it dismisses. That is a real answer to a
   real weakness in ours, and it is out of this phase's scope.
<!-- /ANCHOR:limitations -->
