---
title: "Implementation Summary"
description: "The miniature calendar's month arrows raised to a named 28px coarse-pointer floor, and the toolbar's Group-by sheet — redesigned by 012, never photographed — registered its first capture; the lane proves both, the corpus moved with them."
trigger_phrases:
  - "implementation summary"
  - "015-sheet-design-fundamentals implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/015-sheet-design-fundamentals"
    last_updated_at: "2026-09-10T22:30:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Implemented T001-T009; both findings landed RED→GREEN; gate 28/0"
    next_safe_action: "Operator device read (D3) remains the family's standing habit"
    blockers: []
    key_files:
      - "styles.css"
      - "tools/live/touch-targets.mjs"
      - "tools/screenshots/scenarios/panels.mjs"
      - "tools/lane/css-lane.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "015-sheet-design-fundamentals-implementation"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Where the named-28px assertion lives: `touch-targets.mjs`'s RAISED mechanism — the harness's one unconditional floor enforcement — chosen over the general census's movement ratchet, which counts totals and cannot catch a control resting at a constant under-floor size; the three 28px siblings stay census-enforced, so the precedent followed was the mechanism, not the list"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 015-sheet-design-fundamentals |
| **Completed** | 2026-09-10 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The design review's two cross-sheet findings — the ones no single landed child owned — both
landed, each held by a lane clause. No producer changed; `main.js` is untouched, because neither
finding lives in shipped code.

**The miniature calendar's touch floor** (`styles.css`, `tools/live/touch-targets.mjs`): the
`.obnotion-calendar-mini-nav` prev/next month arrows — the date picker's, the sort sheet's
calendar-empty state's, and the filter's date-value picker's — declare a 24px box at their base
rule and had no coarse-pointer rule at all. They are raised inside the existing
`@media (pointer: coarse)` floor-raise block, by `min-width`/`min-height: 28px` — a min wins over
the declared 24px without touching it, the same defeat the block's three 28px siblings were
written for, so the desktop presentation keeps its density and only the touch surface's metal
rewrites it. The enforcement is also new, and it is the packet's second deliverable: a
named-28px entry in `touch-targets.mjs`'s RAISED mechanism. The RAISED mechanism applies a
control's own floor instead of the file's default and exits 1 when the control misses — an
unconditional, named check. That is what the general census cannot be: its ratchet counts
movement, so a control resting at a constant under-floor size never moves the count and never
fails. The three 28px siblings themselves are census-enforced, not named entries, so the
precedent followed here is the mechanism, not the list.

**The Group-by sheet's first capture** (`tools/screenshots/scenarios/panels.mjs`): the toolbar's
Group-by sheet, redesigned by 012 and never photographed by any scenario, registered as
`id: "group"` beside its sort/filter siblings — phone-only (`devices: ["mobile"]`, which is
exactly the two captures the packet's tasks name), full-viewport, `src/views/toolbar-renderer.ts`
first in `sources` (with `popover-position.ts`, `mobile-bottom-sheet.ts` and `surface-shell.ts`
for the shell chrome the markup mirrors). The fixture reproduces what `populateGroupPopover`
draws in its reachable nobody-grouped-yet state: grab bar, the shell header with its 44px close,
the `Group by` section, the checked No-group row, then the `Shown` section with its `Hide all`
bulk action and three property rows, and the `Hidden` section with `Show all` and one hidden
property — both sides of the 012 Shown/Hidden partition and both bulk actions in frame, which is
what the review's finding (b) said no design review had ever been able to look at.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `styles.css` | Modified | The coarse-pointer 28px floor raise for the calendar's month arrows, inside the existing floor-raise block, by min-width/min-height |
| `tools/live/touch-targets.mjs` | Modified | The named-28px RAISED enforcement entry, with the mechanism's contract stated where the entry is declared |
| `tools/live/touch-targets.json` | Re-stamped | The census stamp, by its own writer — 840 elements across 68 fixtures, 123/651 under 28px against the recorded 169/785 |
| `tools/screenshots/scenarios/panels.mjs` | Modified | The `group` fixture scenario, beside its sort/filter siblings, in the file's established bottom-sheet fixture shape |
| `tools/lane/css-lane.json` | Modified | The acquire/edit/release triplet: holder `015-sheet-design-fundamentals`, baselineHash `5560c2030c05`, all twelve judged paths named in the release's `reviewed` |
| `screenshots/**` (10 PNGs modified + 2 new, + `manifest.json`, + `README.md`) | Recaptured | Three passes; judged by decoded pixel delta against the committed blobs, no image opened |
| `specs/.../001-sheet-story-coverage-audit/inventory.md` | Regenerated | The registry-derived coverage table, by its own writer — its `group` row's Captures column now carries the scenario; its own vitest contract required it |
| Packet docs | Modified | Tasks T001-T009 ticked with completion notes, the four AC rows Met, the goal's criteria and log, the spec and closure statement, a landing note on the `071` row in §5.A |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first, both findings. The named-28px assertion ran against the untouched tree and exited 1
with eight misses, each `measured 24x24, under its named 28px floor` — two fixture scenarios,
two constructed, both themes — while the untouched-tree census itself exits 0, which is exactly
the "reports but does not enforce" gap the task named. The coverage gap was confirmed the same
way the task asked: the scenarios grep exits 1, and `001/inventory.md`'s group row lists the
toolbar-adjacent captures that never show the sheet. Then the raise landed, the same assertion
exited 0, and the census dropped 127→123 (fixture) and 655→651 (constructed): the four arrows
left the movement ratchet into the named floor.

The corpus moved in three passes. The first two are the judged pair: the eight date-pair mobile
captures moved 248px@Δ112-132 each, identical counts in both passes, and their changed-pixel
bands are the two arrow boxes alone — two column bands at the row's edges on the one 16px
(device-px) row band, the centred month label's region contributing zero changed pixels, so the
`‹ August 2026 ›` centring is proven undisturbed rather than eyeballed. Three further movers
were proven not this packet's by recapturing the same scenarios with the packet's stylesheet
backed out of the tree: `table-frozen-column-desktop-light` (37px@32) and
`board-view-desktop-dark` (8px@1 — which the third, convergence pass then returned to its
committed pixels exactly, settling it as the chronic single-unit wiggle) are today's engine;
`board-mobile-desktop-dark` (2px@1, one judged run) was restored to its committed bytes, its
manifest row already matching. The lane was signed as an acquire/edit/release triplet with all
twelve judged paths in the release's `reviewed` — ten of which the comparator itself classifies
as byte-only moves, its own coarse-grid pixelHash absorbing the small paint deltas, named anyway
because this packet's evidence for its own deliverables is the decoded numbers.

The freshness check initially reported eleven stale stamps — ten census-class writers keyed to
the stylesheet hash plus capture-device-parity keyed to the manifest — and each was re-run by
its own writer, all exit 0, evidence 16/16 fresh. One committed blob (board-mobile-desktop-dark)
predated this packet's edits and tripped the gate's screenshots-fresh lane on the first run; the
convergence pass synced its source fingerprints, and the final gate ran 28 green, 0 red.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The named-28px assertion lives in the RAISED mechanism, not the census | The census's ratchet tolerates any constant under-floor size; a named miss exits 1 the moment the control's own box shrinks, which is the guarantee the task asked for ("not swept in by the general sub-28px census, which reports but does not enforce") |
| The raise uses `min-width`/`min-height`, not `width`/`height` | The base rule declares an explicit 24px box; a min wins over it without touching it, the same defeat the block's siblings were written for, and the desktop density survives by construction |
| The group scenario is a fixture, phone-only, in `panels.mjs` | The task's RED grep greps the scenarios files for `id: "group"`, its GREEN names exactly `group-mobile-{light,dark}.png`, and the file's established bottom-sheet precedents (the view-config, record-detail and column-width sheets) already carry the `devices: ["mobile"]` + viewport-capture shape; a fixture also photographs the state by hand faithfully, where a constructed mount would have needed new harness state (the hidden-columns set) |
| The fixture photographs the nobody-grouped-yet state | It is a reachable, truthful state of the shipped producer whose markup needs no invented option-order rows; it shows the partition and both bulk actions, which is what the finding demands |
| The criterion-2 look was judged, not eyeballed | This worktree's standing ruling: every visual judgement is a script that prints numbers. The records are the theme inversion, the uniform top band, the painted bottom band, and the 248-pixel arrow-box deltas |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| RED, named-28px assertion (`tools/live/touch-targets.mjs`) | exit 1 — eight misses, all `obnotion-calendar-mini-nav measured 24x24, under its named 28px floor` (two fixture, two constructed, both themes) |
| GREEN, same assertion | exit 0 — the eight named misses clear; census 127→123 fixture, 655→651 constructed |
| `node tools/live/sheet-grammar.mjs` | exit 0 — every landed sheet clause, both engines, negative controls included |
| `node tools/live/render-assertions.mjs` | exit 0 |
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | exit 0 — 1614/1614 (the storybook inventory's registry-identity test passing after `001/inventory.md` was regenerated by its own writer) |
| `npm run build` | exit 0 |
| `node tools/storybook/verify-placement.mjs` | exit 0 — 418/420, 2 red for a declared reason |
| `npm run screenshots` | exit 0 ×3, 482 entries each (two judged passes + one convergence pass) |
| Decoded-pixel judgment | eight owned movers (248px@Δ112-132, the two arrow boxes alone, centring proven), two today's-engine movers (proven by recapture with the packet's stylesheet backed out), one 2px@1 one-run jitter restored; two additions, the packet's own captures |
| `node tools/live/evidence.mjs --check-all` | exit 0 — 16/16 fresh after the eleven named stamp writers re-ran, all exit 0 |
| `node tools/lane/check-lane.mjs` | exit 0 — the release names all content-changed captures; the lane's 10 "bytes but not pixelHash" paths are the comparator's own coarse-grid semantics, judged anyway and named |
| `node tools/naming/scan-comments.mjs`, `scan-failing-values.mjs` | exit 0 / exit 0 |
| `npm run gate` | final run exit 0 — **28 green, 0 red for a declared reason** (first run 27/28: screenshots-fresh, converged) |
| Validation orchestrator `--strict` | 015: RESULT: PASSED · 071 (first RESULT): PASSED · 005: RESULT: PASSED |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The criterion-2 look was the review-continuation's, taken by measurement.** The packets'
   standing device read (D3 of this packet's decisions) has no separate criterion here, but the
   operator's own eyes on the two new captures — and on the eight moved ones — remain the
   family's standing habit; nothing in this worktree waits on it.
2. **Two of the twelve judged movers are not this packet's** (`table-frozen-column-desktop-light`
   37px@32, `board-view-desktop-dark` 8px@1): they reproduce with the packet's stylesheet backed
   out, so they are the day's engine, not the edit. They are named in the lane release for
   exactly that reason; whoever next reads those two images compares them against this note.
3. **The group fixture is hand-written markup** and can drift from `populateGroupPopover`'s
   output the way every fixture in the corpus can; the packet's dependency table records that
   012's producer changing again means this fixture may need a matching update, the same as any
   other capture's source.

---
<!-- /ANCHOR:limitations -->
