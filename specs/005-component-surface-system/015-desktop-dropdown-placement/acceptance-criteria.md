---
title: "Acceptance Criteria: Desktop Dropdown Placement"
description: "Every acceptance criterion for desktop dropdown placement, each with its threshold, its recorded failing number and its negative control."
trigger_phrases:
  - "015 acceptance criteria"
  - "desktop dropdown placement criteria"
  - "dropdown viewport origin measurement"
importance_tier: "important"
contextType: "implementation"
---
# Acceptance Criteria: Desktop Dropdown Placement

Each criterion carries a number with a threshold, was demonstrated failing on the unfixed tree with
the failing number recorded, and is measured in a real browser against the shipped stylesheet, with
the leaf deliberately off the viewport origin.

**"Against the shipped modules" is true of AC-1 to AC-3 and false of AC-4, AC-5 and AC-7**, and the
sentence used to say it of all of them. The three in section 5d of the probe are *transcriptions*:
the arithmetic copied out of a private renderer method, because calling it needs a live Obsidian
`App`. All three ticks are withdrawn below. AC-4 is the severe case — its copy passes an argument
the source does not — and AC-5 and AC-7 are the milder one, where the copy is faithful today and
nothing stops the source drifting away from it tomorrow.

**Harness.** `probe-desktop-placement.mjs` in this folder. 31 checks, **31 pass, none declared
red** — `DECLARED_RED` is now empty. `node probe-desktop-placement.mjs` exits 0; an undeclared
failure exits 1. The same two checks also live in `tools/storybook/verify-placement.mjs`, which the
gate runs.

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

**Live path.** `filter-panel-renderer.ts:624` — the filter panel's date value picker commits a draft
on every segment edit; the commit calls `actions.refresh()`, which rebuilds the panel and destroys
the trigger button, while the picker is mounted on the container and survives.

## AC-4 — the anchorless column submenu clears the right sidebar — **WITHDRAWN**

**Threshold.** `panel.right <= editing area right`.

**Failing first.** Right edge at **1328** against an editing area ending at **1140** — **188px under
an open right sidebar**. Clamped against `view.innerWidth=1440`, which spans both sidebars.

**After.** Right edge **1080**. Clamped against `bounds.right=1140`. The hardcoded 320px height
assumption was also replaced with the panel's measured height.

**Withdrawn: the number above measures a transcription that disagrees with the source.** The probe
(`probe-desktop-placement.mjs:637`) and its `verify-placement` twin clamp against
`getVisiblePopoverBounds(**null**)`. The shipped `column-menu.ts:616` calls
`getVisiblePopoverBounds(**panel**)`. That is not a cosmetic difference: the function intersects the
container's own rect into its result and returns the viewport when the intersection degenerates
(`popover-position.ts:515`), so a body-portalled fixed panel that has not yet laid out — which is
what this one is, one line before its own `height || 320` fallback admits the same thing — gets
`[0..1440]`, the whole viewport, the exact bound the repair removed. This folder measured it:
`bounds(sub)` for a 292px five-row submenu returns `[0..1440]`.

So AC-4 is not green-but-blind. It is **green over a defect already measured in the shipped path**.
The 1080 is the copy's answer, and the copy is not what runs.

**What would settle it.** A probe that calls `getVisiblePopoverBounds` with a freshly created,
not-yet-laid-out panel and asserts the editing area rather than the viewport comes back; then the
same assertion against the real `openColumnSubmenu`, which needs a shimmed `App`.

## AC-5 — the formula autocomplete stays inside its field — **WITHDRAWN**

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

**Withdrawn: the clamp is transcribed, so the check cannot fail when the source loses it.** The copy
**does** match the source, which was checked rather than assumed —
`formula-modal.ts:1357-1358` reads `propertySuggestEl.parentElement?.clientWidth ?? textarea.clientWidth`,
and the probe's `suggest` is a direct child of its modal, so `modal.clientWidth` is that same
quantity. The arithmetic is right. What is unproven is that the shipped file still holds it: delete
the clamp from `formula-modal.ts` and the probe places its own copy correctly and still prints 0px.

**Two further values come from the harness rather than the product.** The modal is a hand-built div
pinned at `width: 800px` — the real modal is sized by Obsidian's `app.css`, which this page never
loads — and `shouldDisableInlineSuggestions()` suppresses the box below a 760px modal, a threshold
the probe never approaches from either side.

**What would settle it.** Drive the shipped `showSuggestionBox` at a host-sized modal, and assert
both the clamp and the 760px suppression.

## AC-6 — the phone does not move

**Threshold.** Both phone checks hold before and after.

**Measured.** Owned menu still a full-width bottom sheet: `[0..390]` on a 390px viewport, bottom
844 = viewport height, `max-height: 759.6px`, `overflow-y: auto`, height 389 against a 760 cap.
Identical before and after. Every change is inside a desktop-only branch — the phone returns from
`showAt` before reaching it.

---

## AC-7 — the calendar/timeline search results clear the right sidebar — **WITHDRAWN**

**Threshold.** `panel.right <= editing area right`, **at two anchor positions**. One cannot tell a
clamp from a coincidence: the overhang grew with the anchor, so a panel that happens to fit at one x
can still run under the sidebar at another, and a single-position check would report that as fixed.

**Failing first.** Right edge **1380** against an editing area ending at **1140** — **240px under
the sidebar** with the anchor at x=600, and **1432, a 292px overhang**, at x=1000. Clamped against
`window.innerWidth=1440`, which spans both sidebars.

**After.** `[652..1132]` at x=600 and `[652..1132]` at x=1000 — **0px past** an editing area ending
at 1140, clamped against `bounds.right=1140`. Both anchors land identically because the clamp, not
the anchor, is now what decides the right edge.

**Control.** The statement this replaced, re-run in place, still puts the right edge at **1380 (240px
past)** at x=600 and **1432 (292px)** at x=1000. It is kept as a permanent negative control rather
than a one-off, so the check cannot quietly become decoration.

**The repair.** `window.innerWidth`/`innerHeight` span the sidebars, so a panel clamped to them
slides underneath an open right sidebar and is still "in bounds" by the arithmetic while being
entirely off screen. All four terms moved to `getVisiblePopoverBounds(null)` — the width cap, the
left floor `8` (which is a *window*-relative margin and would have permitted x=8, under the **left**
sidebar), the right clamp, and the vertical `innerHeight - 80`. Fixing only the right clamp would
have left three window-relative terms in a method whose defect is that it measures the window.

`null` rather than a container is deliberate and was measured, not assumed. `getVisiblePopoverBounds`
intersects the container's own rect into the result, and this panel is created on
`window.activeDocument.body` precisely to escape the view — so a container would narrow it, and on a
narrow embedded database it would narrow it a lot. Measured on the harness page: `bounds(null)` and
`bounds(container)` are both `[300..1140]`; `bounds(anchor)` collapses to the anchor at
`[900..1100]`; and `bounds(panel)` returns the **whole viewport, `[0..1440]`**, because a rect
intersected with itself trips the degenerate guard. Passing `null` loses nothing, because the caller
already sources its document from `window.activeDocument`.

**Both copies moved together.** The method is duplicated verbatim in `database-view.ts:6953` and
`embedded-database-renderer.ts:1323` — both later in their files than the `:6890`/`:1305` this
folder used to record. They were byte-identical before the edit and are byte-identical after it;
repairing one would have left the other reporting the same 1380. The declaration was removed from
both harnesses, because a declared red that has been fixed is a check that can no longer fail.

**What this check still cannot do.** Both harnesses *transcribe* the arithmetic rather than calling
the method, which needs a live Obsidian `App`. Verified in both directions: reverting the
transcription to `window.innerWidth` turns the check red and the run to **exit 1**, so it is not
decoration — but reverting the **source** while leaving the transcription fixed leaves the run at
**exit 0**. A source-only regression here is invisible to the gate. That is the standing cost of a
transcribed probe, and it is the reason the transcription carries its file and line.

**Which is why the tick is withdrawn, on the sentence above rather than on anything new.** A
criterion that cannot go red when the code it names regresses is evidence about the harness. What
survives, confirmed by reading rather than by running: `database-view.ts:6953` and
`embedded-database-renderer.ts:1323` both carry the repaired form and are byte-identical to each
other. The clamp was made. Nothing in the gate keeps it made.

AC-4, AC-5 and AC-7 all fail for this one reason, so one fix retires all three: lift the clamp into
a function the harness can import, or give the probe a shimmed `App` so the private methods can be
called. Until then the phase's real result is AC-1 to AC-3, which drive shipped modules and measure
their inputs rather than declaring them.

---

## GATE

| Check | Baseline | After |
|---|---|---|
| `npx tsc --noEmit` | exit 0 | **exit 0** |
| `npx vitest run` | 434 passed | **450 passed across 59 files, exit 0** |
| `npm run build` | — | **exit 0** |
| `node tools/storybook/verify-placement.mjs` | 220/224, 4 declared red, exit 0 | **221/224, 3 declared red, exit 0** · re-run 2026-08-31 after the clamp lift and the phone arm: **242/243, 1 declared red, exit 0** |
| `node probe-desktop-placement.mjs` | 30/31, 1 declared red | **31/31, none declared, exit 0** |
| `node probe-inventory.mjs` | 16 writes outside a primitive, unclassified | **16 writes across 7 files, all classified, baseline holds, exit 0** |
| `npm run gate` | 16 green, exit 0 | **15 green, `screenshots-fresh` red, exit 1 — see below** |

The vitest baseline moved 434 → 450 under other sessions, not this work. The `verify-placement`
baseline is quoted at its current size; it was 82 checks when this folder first recorded it and is
224 now, having grown under other sessions throughout.

**`evidence` is red on the first gate run after any source edit, and green on the second.**
`tools/live/renderer-coverage.json` pins a hash of `database-view.ts` and
`embedded-database-renderer.ts`; the `evidence` lane checks that stamp, and the `render-assertions`
lane — which runs *after* it — rewrites it. Observed both ways here: red on run 1, green on run 2
with no source change between them. Worth knowing before reading a single run as a regression.

`verify-placement.mjs` grew from 80 to 82 checks *during* this phase, under another session's
edits. Both new checks pass. It was not touched here.

## SCREENSHOTS — four are now this phase's debt, and the rest are not

**Four captures are stale because of this repair, and saying otherwise would be false.** The clamp
fix edited `embedded-database-renderer.ts`, and `tools/screenshots/scenarios/chrome.mjs:697` declares
that file as a `source` of the `chrome-selection-status-bar` scenario. So its four captures —
desktop/mobile × dark/light — now fail the freshness gate, and `npm run gate` is **15 green with
`screenshots-fresh` red, exit 1**:

    screenshots/components/chrome-selection-status-bar-desktop-dark.png
    screenshots/components/chrome-selection-status-bar-desktop-light.png
    screenshots/components/chrome-selection-status-bar-mobile-dark.png
    screenshots/components/chrome-selection-status-bar-mobile-light.png

The pixels cannot have moved — the capture is hand-written fixture markup and this change is
placement arithmetic in a calendar/timeline search panel, which that scenario does not render — so
this is a **source-hash bookkeeping** red rather than a visual one. It is still a real red, and it is
this phase's. Clearing it means `npm run screenshots` plus a person opening the four PNGs, which the
repository rule requires and a non-interactive run cannot do; `screenshots/` was also outside this
work's write scope. Recorded as owed rather than argued away.

The **other** stale captures, and the earlier 276, remain not attributable to this work. When this
folder first recorded it, `npm run screenshots:verify` exited 1 with **276 stale captures across 10
sources**, eight naming a file this phase edited (`owned-menu.ts`, `popover-position.ts`). Those were
not attributable, for two independently sufficient reasons:

1. **The screenshot harness executes no `src/` code.** Every capture scenario is hand-written fixture
   markup rendered against the stylesheet; the `sources:` array is declared bookkeeping, not an
   execution dependency. These changes are pure JavaScript placement logic and cannot move a pixel.

   **Scoped deliberately, because the unscoped form of this sentence is wrong.** It is true of
   `tools/screenshots/` and of nothing else. `tools/storybook/verify-placement.mjs` esbuilds fifteen
   shipped `src/views` modules — including the two this phase edited — and is the harness every
   criterion above runs in; `tools/bench/` imports the real `TableRenderer` and `ListRenderer`. Read
   as a property of "the harness", this reason would also excuse the placement checks from noticing
   a placement change, which is the opposite of what they exist for.
2. **The captures were already stale at HEAD.** Staleness is a sha256 of the working-tree file
   against `manifest.json`. For `owned-menu.ts` the manifest records `fc6cc3fbce07` while the
   *committed* HEAD version hashes to `616176134d75` — they disagree before any edit in this
   session. Same for `popover-position.ts` (`a8d064a82be6` vs `f203a188d0b5`).

Recapturing was therefore declined rather than deferred: `styles.css` is under a held lane and
three other source files are mid-flight in other sessions, so a recapture now would photograph four
sessions' uncommitted work and stamp it as this phase's. The churn floor was not measured for the
same reason — the measurement mutates 276 shared PNGs, and reason (1) already answers the question
it exists to answer.
