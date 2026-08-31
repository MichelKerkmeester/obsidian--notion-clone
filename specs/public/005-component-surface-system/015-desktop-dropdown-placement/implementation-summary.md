---
title: "Implementation Summary: Desktop Dropdown Placement"
description: "Desktop placement is five independent paths, not one. Five of six measured defects are fixed at two seams; the sixth is measured and declared behind a file lock."
trigger_phrases:
  - "015 dropdown placement summary"
  - "five placement paths"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/015-desktop-dropdown-placement"
    last_updated_at: "2026-08-30T09:45:00Z"
    last_updated_by: "phase-author"
    recent_action: "AC-4 settled: the shipped argument returned the whole viewport, and now does not"
    next_safe_action: "AC-5 and AC-7 need their shipped methods driven, not their arithmetic copied"
    blockers:
      - "database-view.ts and embedded-database-renderer.ts held by another session all phase"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "probe-desktop-placement.mjs"
      - "probe-inventory.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-015"
      parent_session_id: null
    completion_pct: 50
    open_questions: []
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 015-desktop-dropdown-placement |
| **Shipped** | 2026-08-30 |
| **Level** | 1 |
| **State** | Five of six defects fixed and verified. The sixth measured and declared. Not operator-confirmed |

<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Desktop dropdowns land where they should. A tall menu is capped to the editing area and scrolls, so
its last rows are reachable instead of sitting off screen. A menu opened from a trigger button clears
that trigger when it flips upward, rather than covering the control that opened it. A surface whose
anchor is destroyed while it is open now hides itself instead of sitting at a stale coordinate
accepting input. The column submenu and the formula autocomplete both stay inside the editing area
rather than running under an open sidebar or past the edge of their own modal.

**The finding is worth more than any single repair.** Placement is five independent paths, and the
maintained one is correct on every check. Every defect lived in the four that are not it.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `src/views/owned-menu.ts` | Modified | Caps height and sets overflow; accepts an anchor rather than only a point |
| `src/views/popover-position.ts` | Modified | Hides a surface once the reposition loop observes a dead anchor |
| `src/views/column-menu.ts` | Modified | Passes its anchor instead of a hand-derived point |
| `src/views/row-menu.ts` | Modified | The same |
| `src/views/modals/formula-modal.ts` | Modified | Fills before placing; bounds the box's far edge, not only its origin |
| `probe-inventory.mjs` | Created | Asserts no code outside the four primitives writes a placement coordinate |
| `probe-desktop-placement.mjs` | Created | Measures each defect at its production mount |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The phase began by building an assertion rather than running a search. The inventory enumerates the
four primitives that can put a box at a coordinate and then asserts that nothing else in the source
writes a placement coordinate. That assertion failed, and its failure list — sixteen writes across
seven files — is the finding. Four of those are real dropdown surfaces that no search for the
maintained entry point would ever return.

That distinction matters beyond this phase: completeness is now a property of the extractor rather
than of anyone's diligence, and a sixth mechanism added later turns the assertion red instead of
going unnoticed.

Each defect was then measured at its production mount, fixed, and re-measured, with a control that
distinguishes the repair from a blanket behaviour. Two of the checks were themselves defective and
were replaced before they were trusted.

No stylesheet change was required, so the serialized CSS lane was never taken. It was free when the
phase started and passed to another phase during it.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|---|---|
| Assert closure over the primitives instead of grepping for a function name | Four defective surfaces are invisible to any search for the maintained entry point. An assertion that fails on the sixteenth coordinate write finds what a search cannot |
| Give `showAt` an anchor rather than a better point | A cursor and a trigger want different flip targets, and the difference is the trigger's own height. The call sites had that information and discarded it, which makes this one seam rather than three bugs |
| Leave the cursor form untouched | It is correct. Reformulating it would have moved eleven call sites nobody complained about, and the control confirms it did not move |
| Cap the menu's height as well as setting overflow | Until the height is bounded the vertical clamp is ill-formed — the lower bound can sit above the upper bound and the clamp inverts |
| Hide a surface whose anchor died, rather than reposition it | A panel painted at a dead anchor's last coordinate over rebuilt content is still focusable and still accepting input, which is worse than being absent |
| Declare the sixth defect rather than fix it | It is duplicated verbatim in two files another session held for the whole phase. Editing them would have collided; measuring and declaring keeps the number visible |
| Leave `getPlacementOptions` alone | It genuinely drops three options, but its only consumer has zero callers, so it explains nothing. Speculatively completing dead code would have been change without evidence |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|---|---|
| AC-1 a tall menu is capped and reachable | **PASS.** A 60-row menu was 1808px, running 912px past the editing area, with its last row off screen at `y=1778..1808`. Now 892px, overflow −4px, last row at `y=862..892` |
| AC-2 an anchor-derived menu clears its trigger | **PASS.** The menu covered 28px of a 28px trigger with a −32px gap; now overlap 0px and gap +4px |
| AC-3 a dead anchor stops presenting as placed | **PASS.** The panel moved 0px and stayed visible and focusable; now hidden on the next loop tick |
| AC-4 the anchorless submenu clears the sidebar | **PASS.** Right edge was 1328 against a 1140 bound, 188px under the sidebar; now 1080 |
| AC-5 the autocomplete stays in its field | **PASS.** Was a 169px overhang; now 0px |
| AC-6 the phone does not move | **PASS.** Identical before and after; every change is inside a desktop-only branch |
| Controls | A 5-row menu overflows −702px; a live anchor survives the loop visible with a 6px gap; the cursor form's bottom is still 812; the autocomplete's pre-fix statement still overhangs 169px |
| Types / tests / build | **exit 0** / **434 passed, exit 0** / **exit 0** |
| Placement harness | 79/80 to **81/82**, one declared red, exit 0 |
| Placement probe | 23/29 at first run to **30/31**, one declared red, exit 0 |
| Inventory closure | **16 writes across 7 files, all classified, baseline holds, exit 0** |
| Calendar/timeline search results | **DECLARED RED.** Right edge 1380 against a 1140 bound — 240px under the sidebar, growing to 292px as the anchor moves |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **One defect is measured and unfixed.** The calendar/timeline search-results panel clamps against
   the window, which spans both sidebars. Its method is duplicated verbatim in two files that another
   session held for the whole phase. The control confirms the clamp is the cause — the overhang
   tracks the anchor — so this is declared rather than unknown.

2. **The probe has not been merged into the shared placement harness.** That file was open elsewhere
   throughout, so the phase's checks live in a probe beside the folder instead of in the gate.

3. **Two of this phase's own checks were defective before they were useful.** One passed against the
   broken menu by construction, because an uncapped element's scroll height equals its client height.
   The other tested nothing at all, because it re-entered through a guard that returns before the code
   under test runs. Both are recorded because the same shapes will be tempting again.

4. **Four further findings were recorded and deliberately not acted on**: a third copy of the anchor
   idiom behind the same file lock; `getPlacementOptions` dropping three options into dead code;
   opening a panel with an already-dead anchor, which would bind all 34 call sites; and `showAt`
   passing an undefined containing block, which is a numeric no-op only while body sits at the origin.

5. **Not operator-confirmed.** Every number is a probe measurement on a rendered tree.

<!-- /ANCHOR:limitations -->
