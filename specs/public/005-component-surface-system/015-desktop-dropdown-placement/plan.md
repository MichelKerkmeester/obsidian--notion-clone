---
title: "Implementation Plan: Desktop Dropdown Placement"
description: "The approach that was taken: enumerate the primitives that can place a box and assert nothing else writes a coordinate, then repair the two seams the failure list exposed."
trigger_phrases:
  - "015 dropdown placement plan"
  - "placement closure assertion"
  - "anchor not point"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Desktop Dropdown Placement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This document is a record, not a forecast.** The work shipped before the plan was written.

The operator asked for a fresh pass on desktop dropdown placement. What the pass found is that
placement is **not one mechanism with bugs in it**. It is five independent paths, and the maintained
one is correct on every check — every defect lived in the four that are not it.

Six defects were measured. Five were fixed at two seams. The sixth is measured, declared and left
unfixed with its reason, because the files it lives in were held by another session for the whole
phase.

**No stylesheet change was needed.** Every repair is JavaScript, so the serialized CSS lane was never
taken.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Baseline | Observed |
|---|---|---|
| Types | exit 0 | **exit 0** |
| Unit tests | 434 passed | **434 passed, exit 0** |
| Build | — | **exit 0** |
| Placement harness | 79/80, 1 declared red, exit 0 | **81/82, 1 declared red, exit 0** |
| Placement probe | 23/29 at first run | **30/31, 1 declared red, exit 0** |
| Inventory closure | 16 writes outside a primitive, unclassified | **16 writes across 7 files, all classified, baseline holds, exit 0** |

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**Five paths, and the maintained one is not the problem.**

| # | Path | Positioning | Clamped to | Height capped | Sites |
|---|---|---|---|---|---|
| A | `positionToolbarPopover` | `fixed` plus containing-block correction | editing area | yes | 34 |
| B | `createOwnedMenu().showAt` | `fixed`, no correction | editing area | no, now yes | 14 |
| C | chart toolbar `positionChildPopover` | `absolute` plus container rect | editing area | yes | 1 |
| D | cell-renderer hand-placed editors | mixed | editing area | partly | 5 |
| E | hand-written `setCssProps` on a portal | `fixed`/`absolute` | **the window** | no | 4 |

**Seam 1 — the owned menu is a second placement policy that never learned the first's rules.** The
panel path writes `maxHeight` and `overflowY` on every placement; `showAt` wrote neither and
`.db-owned-menu` declares neither. Capping is also what makes the vertical clamp well-formed: until
the height is bounded, `bounds.bottom − height − margin` can sit above `bounds.top + margin` and the
clamp has to invert.

**Seam 2 — three call sites destroyed the anchor before calling.** Each had hand-written the same
four lines: measure the trigger, add the downward gap, pass a point. `showAt` then flipped by
subtracting the menu's height from a `y` that already sat *below* the trigger, landing the menu's
bottom 4px below the trigger's bottom and covering the control entirely.

**No point-only formulation can fix that**, because a cursor and a trigger want different flip
targets and the difference is the trigger's own height — information the call site had and threw
away. That is what makes it a seam rather than three bugs. The fix gives `showAt` a target that can
carry an anchor; the cursor form is unchanged and still correct.

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

**Step 1 — build a closure assertion rather than a search.** `probe-inventory.mjs` does not look for a
function name. It enumerates the four primitives that can put a box at a coordinate, then asserts
that **no other code in `src/` writes a placement coordinate**. That assertion failed, and its
failure list is the finding.

**Step 2 — repair seam 1**: cap the height and set the overflow on the menu path, which also makes
the vertical clamp well-formed.

**Step 3 — repair seam 2**: let `showAt` take an anchor, and stop three call sites from throwing the
trigger's height away.

**Step 4 — repair the three remaining independent defects**: the dead-anchor surface, the anchorless
submenu's clamp, and the formula autocomplete's overhang.

**Step 5 — measure and declare the one that could not be touched.**

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

**Completeness is a property of the extractor, not of anyone's diligence.** A grep could not have
found this: the failure list contains four real desktop dropdown surfaces that no search for
`positionToolbarPopover` would ever return — the calendar/timeline search results, the anchorless
column submenu, the formula autocomplete, and the calendar day popover. A sixth mechanism added later
turns the closure assertion red instead of going unnoticed.

**Two checks had to be thrown away or corrected, and both are recorded because the same shapes will
be tempting again.**

The obvious cap check — `scrollHeight <= clientHeight || overflow is auto` — **passes on the broken
menu**, because an uncapped element grows to fit and its `scrollHeight` equals its `clientHeight` by
definition. It was written, observed green against the defect, and replaced with a hit-position
measurement.

The dead-anchor simulation first re-called `positionToolbarPopover` with a dead anchor. That hits the
**entry guard**, which returns before `place()` runs, so the fix under test never executed and the
check reported a failure the running app does not have. The real sequence is: place against a live
anchor to install the loop, destroy the anchor, then let the loop tick. **Only the loop can observe
this.**

**Controls distinguish the fix from a blanket behaviour.** A 5-row menu overflows by −702px under the
same call, so the cap check separates a tall menu from any menu. A surface with a *live* anchor
survives the reposition loop at `visibility: visible`, so the dead-anchor criterion is not satisfied
by a positioner that hides everything.

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`001-overlay-placement-and-menu-language` built the anchored positioner this phase found a second,
impoverished copy of. Path A is that work and is correct throughout.

**Another session held files this phase needed for the whole of it**: `database-view.ts`,
`embedded-database-renderer.ts` and `cell-renderer.ts`. That lock is why one defect is declared
rather than fixed, and why the probe's merge into the shared placement harness is owed rather than
done.

The stylesheet lane was **not** taken. It was free when the phase started and passed to the touch
phase during it; every repair here is JavaScript.

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Five files changed and each repair is independently revertible: the height cap, the anchor-carrying
target, the dead-anchor visibility, the submenu clamp and the autocomplete's fill-then-place order.

The anchor change is the one with reach — it alters the shape `showAt` accepts, and three call sites
were simplified to use it. The cursor form is untouched and was measured unchanged, which is what
keeps the revert bounded: **"fixing" the cursor form instead would have moved eleven call sites
nobody complained about.**

Five things were deliberately not fixed, and each is recorded rather than left silent:

- **The calendar/timeline search-results panel** clamps against `window.innerWidth`, which spans both
  sidebars, and travels 240px under an open right sidebar, growing to 292px as the anchor moves
  right. Duplicated verbatim in two files held by another session. **Declared red in the probe with
  its reason.**
- **A third copy of the anchor idiom** in the embedded renderer, behind the same lock.
- **`getPlacementOptions` dropping `align`, `gap` and `preferredSide`** is real as written but
  explains nothing: its only consumer has zero callers. Left alone rather than speculatively
  completed.
- **Opening a panel with an already-dead anchor.** The entry guard returns and the panel renders
  unplaced but visible. Distinct from anchor death mid-life, and deciding what an anchorless open
  should do binds all 34 call sites.
- **`showAt` passing `undefined` for the fixed containing block** where the panel path passes the
  computed one. A numeric no-op today because body sits at the origin. Recorded because it stops
  being a no-op the day body gains a margin or a menu mounts elsewhere.

<!-- /ANCHOR:rollback -->

---

## 8. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../001-overlay-placement-and-menu-language/spec.md`](../001-overlay-placement-and-menu-language/spec.md)
