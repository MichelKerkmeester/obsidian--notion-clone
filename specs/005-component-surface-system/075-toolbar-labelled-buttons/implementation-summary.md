---
title: "Implementation Summary"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/075-toolbar-labelled-buttons"
    last_updated_at: "2026-09-08T09:46:00Z"
    last_updated_by: "code-agent"
    recent_action: "Implemented icon+label phone toolbar buttons, red-then-green new lane, gate 26 green"
    next_safe_action: "Awaiting the operator's own device confirmation (AC-006)"
    blockers: []
    key_files:
      - "src/views/toolbar-primitives.ts"
      - "src/views/toolbar-renderer.ts"
      - "styles.css"
      - "tools/live/phone-toolbar-scroll.ts"
      - "tools/live/run-phone-toolbar-scroll.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "075-toolbar-labelled-buttons-implementation"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "AC-001 through AC-005 met; AC-006 stays operator-owned"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 075-toolbar-labelled-buttons |
| **Completed** | 2026-09-08 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The phone toolbar's filter, sort, group, columns, settings and utilities ("more") buttons now carry
a visible text label beside their icon, matching the operator's Obsidian Bases calendar reference —
no more guessing what a bare icon means on a touch screen. When the labelled row no longer fits the
viewport it scrolls horizontally instead of wrapping to a second line or silently collapsing a
control out of reach, and every one of the six controls now measures at least 44x44px.

### Phone toolbar icon+label buttons matching the Notion/Anytype/Bases reference, with horizontal overflow scroll

Every one of the six controls already carried its name as an `aria-label` and a hover tooltip; what
it did not carry was a label a finger can read without pressing first. A new
`appendToolbarControlLabel` helper appends that same text as a visible span, reusing the existing
label text rather than introducing a second copy of it — and a `.is-phone`-scoped CSS rule is the
only thing that turns the span visible and widens the button to 44px, so desktop and the embedded/
codeblock toolbar ship exactly as they did before this change (see `decision-record.md` ADR-001 for
why that split is deliberate, not an oversight).

The horizontal scroll itself needed no new machinery: `.obnotion-toolbar-right` already scrolled
sideways with a hidden scrollbar before this packet. Widening its buttons is what makes that
existing behaviour engage in practice — a new `flex-wrap: nowrap` rule on the phone toolbar row
makes the "never wrap" decision explicit rather than accidental.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/toolbar-primitives.ts` | Modified | New `appendToolbarControlLabel` helper; called from `createControlClusterButton` |
| `src/views/toolbar-renderer.ts` | Modified | `appendToolbarControlLabel` called at the settings, utilities/"more" and group button call sites |
| `styles.css` | Modified | Base `.obnotion-toolbar-control-label` (hidden), `.is-phone`-scoped label + 44px sizing rule for the six controls, `.is-phone .obnotion-toolbar { flex-wrap: nowrap }` |
| `tools/live/phone-toolbar-scroll.ts` | Created | New lane's measurement harness — mounts the full phone toolbar, reads label presence, row geometry, scroll behaviour, touch-target height |
| `tools/live/run-phone-toolbar-scroll.mjs` | Created | New lane's Chrome runner, 402px viewport |
| `tools/live/touch-targets.mjs` | Modified | Six new `RAISED` entries locking the 44px floor for the labelled controls |
| `tools/lane/css-lane.json` | Modified | Acquire/edit/release triplet for this packet's stylesheet edit |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red-first: a new live lane (`tools/live/run-phone-toolbar-scroll.mjs`) was written and run against
the unmodified codebase, confirming it failed for the right reasons — no visible labels, 28px
controls, no scroll overflow at 402px. The production edit then turned that lane green, and a
one-line CSS revert (`height: 44px` back to `28px`) reproduced red before being restored, proving the
lane actually exercises the change rather than passing regardless of it.

The two pre-existing toolbar lanes (`009`'s `run-toolbar-collapse-sweep.mjs`, `044`'s
`sheet-grammar.mjs`) were rerun rather than assumed unaffected, and passed with identical switch
points before and after — both mount the embedded/desktop shape this packet's ADR-001 leaves
untouched. `touch-targets.mjs` gained six `RAISED` entries locking the new 44px floor. The full
verification set ran clean: `tsc --noEmit`, `vitest run`, `npm run build`, `render-assertions.mjs`,
`verify-placement.mjs` (413/415, 2 declared, unchanged), two `npm run screenshots` passes judged by
decoded pixel delta (one unrelated jitter capture found and reverted), every stale evidence artifact
re-run to freshness, and `npm run gate` once foreground at 26 green, 0 red.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Desktop and the embedded/codeblock toolbar stay icon-only (ADR-001) | The operator's request and D1's ruling both name phone specifically; Notion (desktop web) and Anytype (desktop) both keep their own dense toolbars icon-only with hover tooltips, the affordance a phone lacks; retrofitting labels into the embedded shape would require re-deriving `009`'s entire collapse-ladder sweep, a materially larger change this packet was not scoped for |
| Reuse the row's existing `overflow-x: auto` rather than build new scroll logic | `.obnotion-toolbar-right` already scrolled sideways with a hidden scrollbar before this packet; widening the buttons is what makes that existing behaviour engage, so no new scroll container or JS was needed |
| Label text sourced from the existing `aria-label`/tooltip string, not a new copy | One source of truth per control — a translator or a future rename only has to touch one string, not three |
| Design tokens (`--obnotion-space-3`, `--obnotion-space-4`, `--obnotion-font-md`) over bespoke pixel values | Matches this plugin's existing design-system convention even where the reference's own measurement would suggest a slightly different number (see `plan.md` §MEASUREMENT) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| New lane (`run-phone-toolbar-scroll.mjs`) | Red → Green. Red: labels missing on all 6 controls, 28px height, 398/398 (no overflow). Green: all 6 labelled, 44px height, 532/398 scrollWidth/clientWidth, last control reachable, single line, scrollbar hidden |
| Revert-confirms-red | `height: 44px` → `28px` reproduced the 44px-floor failure; restored, re-confirmed green |
| `run-toolbar-collapse-sweep.mjs` (009) | PASS — identical switch points before/after (250px label/cluster drop, 220px dropdown floor) |
| `sheet-grammar.mjs` (044) | PASS — 415 checks, unaffected |
| `touch-targets.mjs` | PASS — fixture baseline 171/171, constructed baseline 785/785, six new `RAISED` 44px entries hold |
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | 1671 tests passed, 153 files, exit 0 |
| `npm run build` | exit 0 |
| `render-assertions.mjs` | PASS |
| `verify-placement.mjs` | 413/415, 2 declared (baseline, unchanged) |
| `npm run screenshots` ×2 | 616 entries both runs, exit 0; 10 toolbar captures moved (real, byte-identical across both runs); 1 unrelated jitter capture found and reverted |
| `evidence.mjs --check-all` | 15/15 fresh after re-running every stale lane |
| `npm run gate` | 26 green, 0 red, exit 0 |
| `scan-comments.mjs` / `scan-failing-values.mjs` | exit 0 / exit 0 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Label size/spacing match the reference approximately, not pixel-for-pixel.** The reference is a
   website screenshot of a different application on a different device class; `plan.md` §MEASUREMENT
   records the measured values, the implemented values (existing design tokens), and why the two
   diverge for button count and touch-target height. AC-006, the operator's own device confirmation,
   is the closing condition this cannot self-certify.
2. **Desktop is unaffected by design, not by gap.** ADR-001 (`decision-record.md`) records the
   decision and the evidence; a future request to label the desktop row is a separate, larger change
   that touches `009`'s own collapse-ladder sweep baselines.
3. **Pre-existing, unrelated `engine-parity.mjs` Chrome/WebKit width disagreement.** Confirmed present
   on the unmodified tree before this change (stashed and reran to verify) — 50 elements across
   `add-view-popover`, `dropdown-field`, `calendar-week-time-grid`, `calendar-toolbar-options` and
   `panel-view-config-sheet`, none of them this packet's six controls. Not caused by, and out of
   scope for, this packet; left for a separate fix.
<!-- /ANCHOR:limitations -->

---


