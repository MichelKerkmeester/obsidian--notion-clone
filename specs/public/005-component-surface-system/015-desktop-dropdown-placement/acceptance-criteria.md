# Acceptance Criteria: Desktop Dropdown Placement

Each criterion carries a number with a threshold, was demonstrated failing on the unfixed tree with
the failing number recorded, and is measured in a real browser against the shipped modules and the
shipped stylesheet, with the leaf deliberately off the viewport origin.

**Harness.** `probe-desktop-placement.mjs` in this folder. 31 checks, 30 pass, 1 declared red.
`node probe-desktop-placement.mjs` exits 0; an undeclared failure exits 1.

**The guard that makes every other number mean something.** A probe whose leaf sits at the viewport
origin measures nothing: leaf-relative and viewport-relative coordinates coincide there, so the
offset under test is zero by construction. The page puts a 300px left sidebar before the root split
and asserts `leaf.left >= 200`. **Measured `leaf.left=300px`.** Two earlier phases of this program
were caught by exactly this.

---

## AC-1 — a tall owned menu is capped and every row is reachable

**Threshold.** Menu bottom within 1px of the editing area's bottom, and after scrolling to the end
the last row is fully inside it.

**Failing first.** A 60-row menu measured **1808px tall, running 912px past** the editing area
(`menu.bottom=1812`, `bounds.bottom=900`), with `max-height: none` and `overflow-y: visible`. Its
last row sat at `y=1778..1808` — off screen, unreachable by pointer or keyboard.

**After.** Height 892px, overflow **−4px**, `max-height: 892px`, `overflow-y: auto`. Scrolled to the
end the last row sits at `y=862..892` against a bound of 900.

**Control.** A 5-row menu overflows by **−702px** under the same call, so the check distinguishes a
tall menu from any menu.

**A check that had to be thrown away.** The obvious form — `scrollHeight <= clientHeight || overflow
is auto` — **passes on the broken menu**, because an uncapped element grows to fit and its
`scrollHeight` equals its `clientHeight` by definition. It was written, observed green against the
defect, and replaced with a hit-position measurement. Recorded because the same shape will be
tempting again.

## AC-2 — an anchor-derived menu that flips up clears its trigger

**Threshold.** Zero overlap with the trigger, and a 4px gap on the side it flipped to.

**Failing first.** Trigger at `y=780..808`, menu at `y=444..812`: the menu covered **28px of a 28px
trigger — all of it** — and the gap above the trigger measured **−32px** where +4px was wanted. A
36px error, exactly the trigger's height plus both gaps.

**After.** Menu at `y=408..776`. Overlap **0px**, gap **+4px**.

**Control.** The cursor form is unchanged: opened at `y=812`, the menu's bottom is still **812**.
The anchor form lands 36px higher. This matters — "fixing" the cursor form would have moved eleven
call sites nobody complained about.

## AC-3 — a surface whose anchor dies stops presenting as placed

**Threshold.** `visibility: hidden` once the reposition loop observes the dead anchor.

**Failing first.** Anchor destroyed while the surface stayed open; the panel **moved 0px**, stayed
connected, and stayed `visible` — painted at the dead anchor's last coordinate, over rebuilt
content, still focusable and still accepting input.

**After.** `visibility` goes `visible` → `hidden` on the next loop tick.

**Control.** A surface with a *live* anchor survives the same loop: `visibility: visible`, gap 6px.
Without this the criterion would be satisfied by a positioner that hides everything.

**A simulation that had to be corrected.** The first version re-called `positionToolbarPopover` with
a dead anchor. That hits the **entry guard**, which returns before `place()` runs, so the fix under
test never executed and the check reported a failure the running app does not have. The real
sequence is: place against a live anchor (installing the loop), destroy the anchor, let the loop
tick. Only the loop can observe this.

**Live path.** `filter-panel-renderer.ts:532` — the filter panel's date value picker commits a draft
on every segment edit; the commit calls `actions.refresh()`, which rebuilds the panel and destroys
the trigger button, while the picker is mounted on the container and survives.

## AC-4 — the anchorless column submenu clears the right sidebar

**Threshold.** `panel.right <= editing area right`.

**Failing first.** Right edge at **1328** against an editing area ending at **1140** — **188px under
an open right sidebar**. Clamped against `view.innerWidth=1440`, which spans both sidebars.

**After.** Right edge **1080**. Clamped against `bounds.right=1140`. The hardcoded 320px height
assumption was also replaced with the panel's measured height.

## AC-5 — the formula autocomplete stays inside its field

**Threshold.** `suggest.right <= container right`.

**Failing first.** **169px overhang** with the caret at x=700 of an 800px modal. `estimateCaretPosition`
already bounds the corner the box *starts* at and says nothing about the corner it *ends* at; the
CSS `max-width` caps the box's width, which does not move it.

**After.** Overhang **0px**.

**Control.** The pre-fix statement, re-run in place, still overhangs **169px**. The check can
distinguish.

**Second defect in the same path.** The box was positioned *before* its rows were added, so it was
measured at its `min-width` rather than its real width. Filling now precedes placing, and the reveal
precedes the measurement because a `display: none` element measures zero.

## AC-6 — the phone does not move

**Threshold.** Both phone checks hold before and after.

**Measured.** Owned menu still a full-width bottom sheet: `[0..390]` on a 390px viewport, bottom
844 = viewport height, `max-height: 759.6px`, `overflow-y: auto`, height 389 against a 760 cap.
Identical before and after. Every change is inside a desktop-only branch — the phone returns from
`showAt` before reaching it.

---

## DECLARED RED — calendar/timeline search results

**Threshold.** `panel.right <= editing area right`.

**Measured, unfixed.** Right edge **1380** against an editing area ending at **1140** — **240px
under the sidebar**, growing to **292px** as the anchor moves right. The control confirms the clamp
is the cause: the overhang tracks the anchor.

**Why not fixed.** The method is duplicated verbatim in `database-view.ts:6890` and
`embedded-database-renderer.ts:1305`. Both files were held by another session for this phase's whole
duration. The probe declares this red by name so the exit status stays meaningful and the next real
regression still fails the run.

---

## GATE

| Check | Baseline | After |
|---|---|---|
| `npx tsc --noEmit` | exit 0 | **exit 0** |
| `npx vitest run` | 434 passed | **434 passed, exit 0** |
| `npm run build` | — | **exit 0** |
| `node tools/storybook/verify-placement.mjs` | 79/80, 1 declared red, exit 0 | **81/82, 1 declared red, exit 0** |
| `node probe-desktop-placement.mjs` | 23/29 at first run | **30/31, 1 declared red, exit 0** |
| `node probe-inventory.mjs` | 16 writes outside a primitive, unclassified | **16 writes across 7 files, all classified, baseline holds, exit 0** |

`verify-placement.mjs` grew from 80 to 82 checks *during* this phase, under another session's
edits. Both new checks pass. It was not touched here.

## SCREENSHOTS — not recaptured, and not this phase's debt

`npm run screenshots:verify` exits 1 with **276 stale captures across 10 sources**. Eight name a
file this phase edited (`owned-menu.ts`, `popover-position.ts`). None are attributable to this work,
for two independently sufficient reasons:

1. **The harness executes no `src/` code.** Every scenario is hand-written fixture markup rendered
   against the stylesheet; the `sources:` array is declared bookkeeping, not an execution
   dependency. These changes are pure JavaScript placement logic and cannot move a pixel.
2. **The captures were already stale at HEAD.** Staleness is a sha256 of the working-tree file
   against `manifest.json`. For `owned-menu.ts` the manifest records `fc6cc3fbce07` while the
   *committed* HEAD version hashes to `616176134d75` — they disagree before any edit in this
   session. Same for `popover-position.ts` (`a8d064a82be6` vs `f203a188d0b5`).

Recapturing was therefore declined rather than deferred: `styles.css` is under a held lane and
three other source files are mid-flight in other sessions, so a recapture now would photograph four
sessions' uncommitted work and stamp it as this phase's. The churn floor was not measured for the
same reason — the measurement mutates 276 shared PNGs, and reason (1) already answers the question
it exists to answer.
