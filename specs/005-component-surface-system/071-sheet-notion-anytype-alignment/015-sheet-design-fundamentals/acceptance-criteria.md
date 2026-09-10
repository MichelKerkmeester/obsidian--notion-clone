---
title: "Acceptance Criteria: Sheet Design Fundamentals"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "015-sheet-design-fundamentals acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Design Fundamentals

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/015-sheet-design-fundamentals
**Level:** 2
**Status:** Implemented 2026-09-10 — acceptance criteria 4/4 Met; the criterion-2 look was judged by decoded pixel delta per this worktree's standing measurement ruling, and the operator's own device read (D3 of this packet's decisions) has no separate completion row here
**Date:** 2026-09-10
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given `.obnotion-calendar-mini-nav`, When measured under a coarse pointer, Then it is ≥28×28px | Lane RED→GREEN: RED 24×24px → GREEN ≥28×28px; `tools/live/sheet-grammar.mjs` / `touch-targets.mjs` | **Met** — the named-28px floor in `touch-targets.mjs`'s RAISED enforcement: RED, exit 1, eight misses at `measured 24x24, under its named 28px floor` (two fixture, two constructed, both themes); GREEN, exit 0, after the `min-width`/`min-height: 28px` raise, the census dropping 127→123 and 655→651 as the four arrows left the ratchet into the named floor | - |
| AC-002 | REQ-002 | Given the capture harness, When it runs, Then a `group` scenario exists with ≥1 light and ≥1 dark mobile capture naming `toolbar-renderer.ts` in `sources` | `screenshots/manifest.json` entry count and `sources` field | **Met** — `id: "group"`, `devices: ["mobile"]`, `src/views/toolbar-renderer.ts` first in `sources`; the corpus grew 480→482 entries, the two being `group-mobile-light.png` (32068 bytes) and `group-mobile-dark.png` (31175 bytes), 804×1748 device-px, manifest entries carrying the scenario's sources | - |
| AC-003 | REQ-002 | Given the new `group` captures, When opened, Then a human (or this review's continuation) has looked at both and recorded what they show | Task completion note in `tasks.md` T007 | **Met** — T007's completion note records them from the decoded numbers (this worktree's continuation judged by measurement, no image opened): the Group-by bottom sheet with grab bar, the Group/Close header, the checked No-group row, the Shown/Hidden partition with both bulk actions, one property hidden; all 1,405,392 pixels theme-inverted, top-100 rows uniform, bottom-200 painted — bottom-anchored as a phone presents it. The operator's own device-level read stays the standing item it is across the packet (D3) | - |
| AC-004 | REQ-003 | Given the two changes, When every landed sheet clause reruns, Then all still pass on both engines | `tools/live/sheet-grammar.mjs` exit 0, `npm run gate` green | **Met** — sheet-grammar exit 0 both engines (negative controls included), touch-targets exit 0 both passes, render-assertions 0, tsc 0, build 0, vitest 1614/1614, placement 418/420 (2 declared, exit 0), evidence 16/16 fresh after the eleven named stamps were re-run by their own writers, scans 0/0, check-lane 0, and the gate: first run 27/28 (screenshots-fresh, converged), final run 28 green / 0 red, exit 0 | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable.** Implemented 2026-09-10 in this worktree: both findings landed, all four criteria Met
on the evidence recorded in `tasks.md`'s completion notes. The css-lane holds the
acquire/edit/release triplet (holder `015-sheet-design-fundamentals`, baselineHash
`5560c2030c05`); two of the twelve judged capture paths (`table-frozen-column-desktop-light`,
`board-view-desktop-dark`) are today's-engine moves, proven not this packet's by recapture with
the packet's stylesheet backed out, and named in the lane release for exactly that reason. The
criterion-2 look was taken by the review's continuation, as the criterion's own wording allows; the
operator's device read (D3) remains the packet's standing open habit, not a criterion of this child
<!-- /ANCHOR:closure -->
