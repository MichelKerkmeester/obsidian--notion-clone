---
title: "Feature Specification: Desktop Dropdown Placement"
description: "Measure where every desktop dropdown, popover and menu actually lands, against where it should land, and repair the two seams that explain five of the six defects found."
trigger_phrases:
  - "desktop dropdown placement"
  - "dropdown in the wrong place"
  - "menu runs off the screen"
  - "menu covers the button"
  - "popover under the sidebar"
  - "015 dropdown placement"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/015-desktop-dropdown-placement"
    last_updated_at: "2026-08-30T21:15:00Z"
    last_updated_by: "criteria-adjudication"
    recent_action: "Criteria adjudicated against the captured run; 5 ticked, the sixth stays red"
    next_safe_action: "Fix the clamp in both host files; add a phone arm to the lifetime check"
    blockers:
      - "Calendar/timeline search panel: 240-292px under the sidebar, declared red (plan.md 7)"
      - "Third copy of the anchor idiom in embedded-database-renderer.ts, same file lock"
      - "Owed: probe merge into verify-placement.mjs, open in another session (tasks.md T18)"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
      - "probe-inventory.mjs"
      - "probe-desktop-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-015"
      parent_session_id: null
    completion_pct: 80
    open_questions:
      - "Anchorless open: entry guard returns and the panel renders unplaced, binds 34 call sites"
      - "getPlacementOptions drops align, gap and preferredSide into dead code (plan.md 7)"
      - "The dead-anchor guard runs on a phone too; what a scrimmed sheet should do is undecided"
    answered_questions:
      - "getPlacementOptions is not a root cause; its only consumer has zero callers"
---
# Feature Specification: Desktop Dropdown Placement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md). Related: `001-overlay-placement-and-menu-language`,
> which built the anchored positioner this phase found a second, impoverished copy of.

<!-- ANCHOR:problem -->
## 1. WHAT THIS PHASE FOUND

Desktop dropdown placement is not one mechanism with bugs in it. It is **five independent
placement paths**, and the defects cluster on the four that are not the maintained one.

| # | Path | Positioning | Clamped to | Height capped | Sites |
|---|---|---|---|---|---|
| A | `positionToolbarPopover` | `fixed` + containing-block correction | editing area | yes | 34 |
| B | `createOwnedMenu().showAt` | `fixed`, no correction | editing area | **no, now yes** | 14 |
| C | `chart-toolbar` `positionChildPopover` | `absolute` + container rect | editing area | yes | 1 |
| D | `cell-renderer` hand-placed editors | mixed | editing area | partly | 5 |
| E | hand-written `setCssProps` on a portal | `fixed`/`absolute` | **the window** | no | 4 |

Path A is correct on every check. The defects are in B and E.

## 2. WHY A GREP COULD NOT HAVE FOUND THIS

`probe-inventory.mjs` does not search for a function name. It enumerates the four primitives that
can put a box at a coordinate, then asserts that **no other code in `src/` writes a placement
coordinate**. That assertion fails today, and its failure list is the finding: sixteen coordinate
writes outside every primitive, of which four are real desktop dropdown surfaces that no search
for `positionToolbarPopover` would ever return — the calendar/timeline search results, the
anchorless column submenu, the formula autocomplete, and the calendar day popover.

Completeness is therefore a property of the extractor, not of anyone's diligence. A sixth
mechanism added later turns the closure assertion red instead of going unnoticed.

## 3. THE TWO SEAMS

**Seam 1 — the owned menu is a second placement policy that never learned the first one's rules.**
`positionToolbarPopover` writes `maxHeight` and `overflowY` on every placement. `showAt` wrote
neither, and `.db-owned-menu` declares neither, so a sixty-row menu measured 1808px against a 900px
editing area and put its last rows permanently out of reach. Capping is also what makes the
vertical clamp well-formed: until the height is bounded, `bounds.bottom - height - margin` can sit
above `bounds.top + margin` and the clamp has to invert.

**Seam 2 — three call sites destroyed the anchor before calling, so the flip had nothing to flip
against.** `column-menu`, `row-menu` and `embedded-database-renderer` each wrote the same four
lines: measure the trigger, add the downward gap, pass a point. `showAt` then flipped by
subtracting the menu's height from a `y` that already sat *below* the trigger, landing the menu's
bottom edge 4px below the trigger's bottom and covering the control entirely. No point-only
formulation can fix this, because a cursor and a trigger want different flip targets and the
difference is the trigger's own height — information the call site had and threw away. That is what
makes it a seam rather than three bugs.

The fix gives `showAt` a target that can carry an anchor. The cursor form is unchanged and still
correct; the anchor form clears its trigger on both sides.
<!-- /ANCHOR:problem -->

<!-- ANCHOR:scope -->
## 4. WHAT WAS NOT FIXED, AND WHY

- **The calendar/timeline search-results panel** clamps `left` against `window.innerWidth`, which
  spans both sidebars, and travels 240-292px under an open right sidebar. It is duplicated verbatim
  in `database-view.ts` and `embedded-database-renderer.ts`. Both files were held by another
  session throughout. Declared red in the probe with its reason.
- **`embedded-database-renderer.ts:2411`**, the third copy of the anchor idiom. Same lock.
- **`getPlacementOptions` dropping `align`, `gap` and `preferredSide`** is real as written but
  explains nothing: `openSurface` has zero callers. Left alone rather than speculatively completed.
- **Opening a panel with an already-dead anchor.** `positionToolbarPopover` returns at its entry
  guard, so the panel renders unplaced but visible. Distinct from anchor death mid-life, and
  deciding what an anchorless open should do binds all 34 call sites.
- **`showAt` passes `undefined` for the fixed containing block** where the panel path passes the
  computed one. Measured as a numeric no-op today, because body sits at the origin. Recorded
  because it stops being a no-op the day body gains a margin or a menu mounts somewhere else.
- **`styles.css`.** Not touched. Every repair is JavaScript, so the lane was never needed — it was
  free when this phase started and is now held by `012-mobile-touch-semantics`.

## 5. SCOPE

**In.** `src/views/popover-position.ts`, `src/views/owned-menu.ts`, `src/views/column-menu.ts`,
`src/views/row-menu.ts`, `src/views/modals/formula-modal.ts`, and this folder.

**Out.** `cell-renderer.ts`, `database-view.ts`, `embedded-database-renderer.ts`,
`eslint.config.mjs` (held by another session). `styles.css` (lane). 
`tools/storybook/verify-placement.mjs` (open elsewhere; the merge is owed).
<!-- /ANCHOR:scope -->
