---
title: "Findings: Mobile Menu Presentation"
description: "What was measured, what changed, what could not be verified, and where the first attempt was wrong."
contextType: "analysis"
---
# Findings: Mobile Menu Presentation

## 1. THE STRUCTURAL CAUSE, CONFIRMED

Both paths were read before anything changed, and the spec's account of the first half is correct.

`positionToolbarPopover` (`src/views/popover-position.ts`) resolves `isMobileBottomSheet(ownerDocument)`
and calls `applySheetChrome(panel, mobileSheet)`, then takes a sheet branch inside `place()`.
`createOwnedMenu().showAt()` (`src/views/owned-menu.ts`) called `getVisiblePopoverBounds`, clamped
the caller's point, and called `setPosition` — it referenced neither the predicate nor the chrome, so
the sheet branch was unreachable from a menu. Not a styling gap; a path that was never wired.

The inventory holds: 11 construction sites, 14 `showAt` calls, three of which derive their point from
an anchor rect (`column-menu.ts:214`, `row-menu.ts:166`, `embedded-database-renderer.ts:2410`) and
eleven from a cursor.

**The design consequence.** On a phone the point is unusable in either shape — a menu placed at a
touch point covers the row it belongs to, and a menu placed under an anchor runs off the nearest
edge. So the point is discarded at the chokepoint rather than reinterpreted at fourteen call sites.
One change serves both shapes and no call site changes.

## 2. WHERE THE FIRST ATTEMPT WAS WRONG

**Wrong hypothesis, caught by measurement.** Reading the CSS, the obvious story was that the "More
tools" sheet centres its rows because `.db-menu-item` only gets `display: flex` inside
`.db-owned-menu`, and the utilities popover is not one. A browser probe against the working tree
refuted it: those rows measured `display: flex`, `text-align: start`, width 366, labels at x=40.
`.note-database-container .db-toolbar-menu-row` supplies the grammar, and the portalled sheet still
matches it because the portal marks the panel with the container class on the way out.

The real defect was one layer along, and the probe found it in the same run: `createMenuRow` — the
shared row component — produced `display: inline-block`, `text-align: center` and label lefts of
`[16, 71, 202]` in any container that is not the owned menu's shell. That is the screenshot's
signature exactly, and it is the general case rather than the instance. The utilities popover is not
rescued by design; it is rescued by a container marker another phase added for an unrelated reason.

**Rigged harness, caught by its own control.** The first version of the drag-to-dismiss check
reported `menu still mounted=false backdrop=left behind` and looked like a product bug. It was
harness state: an earlier check in the same page left a utilities panel open, the backdrop is shared
by every open sheet, and the code correctly declines to remove it while one remains. The page was
fixed and the assertion kept. Two habits caught it — the short-drag control asserting the opposite
outcome, and running each family of checks on its own page rather than inheriting the previous one's
DOM.

**Assumption corrected mid-flight.** "Fixtures import nothing from `src/`, so a TypeScript change
cannot move a capture" is true of rendering and false of freshness: `screenshots:verify` fingerprints
declared source dependencies, and 28 captures cite the four files touched here. See §6.

## 3. WHAT WAS MEASURED

Before-numbers come from the same extended harness run against `HEAD` (`4830275`) in a detached
worktree with the working tree's `styles.css` copied in, so the stylesheet is held constant and only
the code under test differs. Full table in [`acceptance-criteria.md`](acceptance-criteria.md).

| | before | after |
|---|---|---|
| phone menu bottom vs 844px viewport | 876 — 32px past the screen | 844 |
| phone menu width vs 390px viewport | 220 | 390 |
| 19-row menu height vs 760px cap | 872, `content=870 visible=870` (no scroll) | 760, `content=898 visible=759` |
| grab handle | absent | present |
| backdrop hit test above the sheet | `note-database-container` (tap reaches the table) | `db-mobile-sheet-scrim` |
| backdrop lifecycle | never present | present while open, gone after close |
| 140px / 40px handle drag | no handle to drive | dismisses / springs back |
| utilities row label left edges | `[25, 125, 252, 25]`, inline-block, centred | `[35, 35, 35, 35]`, flex, start |
| desktop menu at a requested `[400,200]` | `[400,200]`, width 220, no sheet | identical |
| record sheet checks | 8/8 | 8/8 |
| `verify-placement` total | 18/19 baseline, 1 declared red | 48/50, 2 declared red |

Icon evidence is not from the harness — its stub draws a placeholder for any id, so an invalid id is
invisible there. It is from the installed host bundle: `arrows-left-right` occurs **0** times in
`obsidian.asar`, `arrow-left-right` occurs 5 and `lucide-arrow-left-right` is in the icon class list.
It was the only `arrows-`-prefixed id in `src/` against twelve singular siblings.

## 4. WHAT CHANGED

- `src/views/popover-position.ts` — `placeSheet()` extracted from the anchored positioner's sheet
  branch and exported; `isMobileBottomSheet()` exported. The positioner calls the extracted function,
  so there is one implementation of "where does a sheet sit" and one definition of "what is a phone",
  rather than a copy of each in the menu.
- `src/views/owned-menu.ts` — `showAt` takes the sheet branch on a phone: sheet chrome, shared
  placement, the same entrance classes the panels use, and the drag gesture wired to the menu's own
  `close()`. `close()` takes the chrome down before removing the node.
- `src/views/mobile-bottom-sheet.ts` — the backdrop's lifecycle moved out of the move-the-node branch
  so a surface already mounted on the body gets one, and gets it removed on close; it survives while
  any other sheet is still open; and a caller can declare that it takes the pointer.
- `src/views/menu-row.ts` — an optional `cls` on the row, so a caller whose container styles its rows
  through a class of its own no longer has to hand-build the row to keep it.
- `src/views/toolbar-renderer.ts` — the utilities row delegates to `createMenuRow`; the icon id
  corrected.
- `tools/storybook/verify-placement.mjs` — eleven new checks on two new pages, and one declared red.

No `styles.css` edit. See §5.

## 5. THE CSS LANE, AND THE PATCH IT WAS HOLDING — NOW APPLIED

Throughout the implementation the lane was held by another phase that had `styles.css` open:
the file was written at 06:18 and 06:37, and `popover-position.ts` was overwritten under this phase
once — an `export` applied at 06:20 was gone by 06:43 and had to be re-applied. The lane's own rule
is that a phase without it asks rather than takes, so no stylesheet edit was made here and AC-12 was
left as a declared red with the patch written out for whoever held the lane.

The coordinator applied it, with the lane held. It is in the tree in exactly the form specified —
the five rules re-keyed from the ancestor to the row, **doubling the class rather than dropping the
ancestor** so specificity is unchanged:

```css
.db-menu-item.db-menu-item                      /* was .db-owned-menu .db-menu-item      (0,2,0) */
.db-menu-item-icon.db-menu-item-icon,
.db-menu-item-check.db-menu-item-check          /* was .db-owned-menu .db-menu-item-icon (0,2,0) */
.db-menu-item.db-menu-item:not(:has(.db-menu-item-icon)):not(:has(.db-menu-item-check))::before
                                                /*                                       (0,4,0) */
.is-phone .db-menu-item.db-menu-item            /* was .is-phone .db-owned-menu …        (0,3,0) */
.is-phone .db-menu-section.db-menu-section      /*                                       (0,3,0) */
```

A plain de-scope to `.db-menu-item` would have dropped to `(0,1,0)` and lost ties it currently wins —
the same trap as the `:not()` guard that moved 34 captures, in the opposite direction.

It fixes what it was written to fix: the family check moved from `display=inline-block
text-align=center label left edges=[16, 101, 16] spread=85px` to `display=flex text-align=left label
left edges=[40, 40, 40] spread=0px`. §7 is what it also does.

## 6. WHAT COULD NOT BE VERIFIED

- **The device.** Nothing here has been seen on the operator's phone. The harness reproduces
  Obsidian's workspace shape — sidebars, a `contain: strict` leaf, a fixed navigation bar, a
  safe-area inset — but it is not the app, and this program's own history is that the gap is where
  the failures live.
- **Which build the screenshots came from.** `device-more-tools-sheet.png` shows centred, ragged
  rows, and the current tree renders those same rows left-aligned and flexed. The portal marker that
  rescues them landed at `4bd11b8`, hours before the screenshot's `06:23` timestamp, so either the
  device was on an older build or something else is at work. The family defect in §2 is live either
  way, and is the durable reading of the report; the instance may already be fixed.
- **Capture freshness, over time rather than at a point.** Mid-run, `screenshots:verify` reported 232
  stale captures — 204 attributed to `styles.css` and 28 to the four files touched here. No capture
  was refreshed by this phase: the 204 covered every capture in the set, so the 28 could not have
  been refreshed without recapturing everything against another phase's unfinished stylesheet. The
  lane holder later ran a full capture, and the check now attributes **zero** stale captures to any
  `src/` file. The 204 that remain are `styles.css` alone and move with whoever holds the lane —
  which changed hands twice during this work, from `001` to `010` to `003`. The gate's green run is
  therefore a reading of one moment in a tree three phases are writing to, not a standing state.
- **Two gate checks were red mid-run for causes belonging elsewhere, and both cleared without this
  phase touching them.** `folder-docs` reported `tools/screenshots/.tmp — missing-readme`, a
  transient directory created at 06:45 by a capture run in flight. `lint:tools` reported three errors
  at lines 500, 634 and 652 of `verify-placement.mjs` — inside another phase's uncommitted section,
  above line 725 where this phase's section begins. Recorded because "it went green on its own" and
  "somebody fixed it" are different facts and only the first was observed here.
- **A pre-existing backdrop leak in the record sheet, measured not inferred.**
  `record-detail-panel.ts:169` closes with a bare `panel.remove()` and never calls
  `applySheetChrome(panel, false)`. A probe confirms the consequence: after that close the
  `.db-mobile-sheet-scrim` is still on the body at `rgba(0,0,0,0.4)`, so the app stays dimmed with
  nothing on top of it. This phase neither caused it nor changed it — the backdrop was only ever
  removed through `applySheetChrome`, which that path does not call. The fix is one line at the close
  site, and it belongs to whoever owns the record sheet.

## 7. THE RE-KEY'S BLAST RADIUS, MEASURED

§5 said the patch was unverified and named what verifying it required: the lane, a full
`npm run screenshots` read against the churn floor, and `npm run replay`. All three are now done, and
the honest result is that **the patch is not inert.**

**Method.** `styles.css` was copied twice into a scratch directory and the five re-keyed selectors
reversed in one copy, giving a pre-patch and a post-patch stylesheet differing by two bytes and
nothing else. Each of the 17 row shapes in the family was then built with its production row and icon
classes, mounted in a `.note-database-container` (or the owned-menu shell where that is where it
lives), and its computed box read under both stylesheets, at 1440px and at 390px with `is-phone`.

**Result: 14 of 17 shapes change on desktop, 15 of 17 on a phone.** Only the owned menu's own rows,
the warning row and — on desktop — the dropdown option are untouched. The changes group into three:

| effect | shapes | before → after |
|---|---|---|
| phone row height and inset | 15 | `min-height` 28/30/34/36px → **44px**; `padding-inline` 4/6/8/12px → **16px** |
| font size | 7 | `13.333px` (the button default they used to inherit) → **13px** (`--db-font-md`) |
| icon slot width | 8 | 10/18/22px → **16px**, because the icon rule's `flex: 0 0 16px` now reaches markers that used to size themselves |

Two shapes change more than that. `db-new-template-configure`, a `role="note"` caption, goes from
`inline-block`/`center`/44.6px wide to `flex`/`left`/304px wide. The relation option row's label
moves 6px → 266px on desktop, though that shape's probe markup is the least faithful of the
seventeen and the number should be re-taken against the real row before anyone acts on it.

**Whether this is damage is a design question, not a measurement.** Every one of those 15 phone rows
becoming a 44px target with a 16px inset is what the touch-target rule asks for and what makes these
surfaces match the menus beside them — it is plausibly the best thing in the patch. But it is a
change to roughly fifteen surfaces that nobody reviewed, made by a patch whose stated scope was "five
declarations", and it wants an operator's eye and a device before it is called an improvement.

**The capture set does not protect this.** 204 recaptured, 15 differ from the pre-recapture set, and
two consecutive identical runs move 7 by themselves — so the measured churn floor in this tree is 7,
not the 12 the program's trap list records. The eight beyond the floor are `add-view-popover` (4/4
variants, and it renders a `db-add-view-duplicate-action db-menu-item` row that the audit shows
changing) and `calendar-month-view` (4/4). Fifteen row shapes changed and eight captures noticed:
the fixtures render most of this family either not at all or not in a phone context. A row-family
audit like the one above, run as a check, would close that hole.

**Also worth recording: `npm run screenshots` has no lane.** Two of three capture runs died with
`ENOENT … tools/screenshots/.tmp/<name>.html`. `capture.mjs` creates one fixed `.tmp` directory at
line 167 and removes it at line 292, with no per-run isolation and no locking, so a second capture
run finishing anywhere in the middle of the first deletes the first's working directory. The same
collision explains the transient `tools/screenshots/.tmp — missing-readme` violation seen earlier.
The stylesheet is serialised; the capture set that fingerprints it is not.
