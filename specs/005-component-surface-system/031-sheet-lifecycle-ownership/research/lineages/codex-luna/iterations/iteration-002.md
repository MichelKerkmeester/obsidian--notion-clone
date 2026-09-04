# Iteration 002 — transition lifecycle and same-frame class swaps

## Focus

Test whether the post-entrance fix itself can still fail when a rebuilt panel is created and animated in the same task. Pay particular attention to the absence of `transitionend` listeners, reduced-motion CSS, and WebKit/WKWebView transform behavior.

## Actions Taken

1. Read `playSheetEntrance`, `applySheetChrome`, `positionToolbarPopover`, and the mobile-sheet CSS start/end rules.
2. Searched the relevant view/style surface for `transitionend` and `transitioncancel` consumers.
3. Compared the code with MDN transition-event semantics and WebKit reports covering reduced-motion events and iOS/WKWebView transform transitions.

## Findings

### F-005 — the current entrance code already separates the two style resolutions (fit 1/5, confidence 0.95)

`playSheetEntrance()` adds `.db-overlay-enter`, synchronously reads `getBoundingClientRect()`, and only then adds `.is-visible`. The mobile CSS makes the first class `transition:none` with `translateY(100%)`, while the combined visible rule introduces the transform transition. That is the standard forced-layout shape needed to avoid a same-frame class swap collapsing into one computed style. `[SOURCE: file:src/views/mobile-bottom-sheet.ts:100-115]` `[SOURCE: file:styles.css:320-348]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event]`

Preview diagnostic: for each new panel generation, attach temporary `transitionrun`, `transitionstart`, `transitionend`, and `transitioncancel` listeners; sample `getComputedStyle(panel).transform`, `opacity`, `visibility`, `isConnected`, and `getBoundingClientRect()` at creation, immediately after the forced read, and over the next four animation frames. Also log `matchMedia('(prefers-reduced-motion: reduce)').matches` and the final `elementFromPoint` at the Add button.

Fix direction: retain the forced read (or use two explicit rAF phases) and make any future teardown/focus code use a bounded timer/final-state check, never `transitionend` alone. The fix is diagnostic hardening, not another entrance rewrite.

### F-006 — missing `transitionend` is not a credible Add freeze in this repo (fit 1/5, confidence 0.94)

The inspected Add, sheet, positioner, overlay, and auto-close modules do not register a `transitionend` or `transitioncancel` handler. Therefore a WebKit omission of `transitionend` cannot directly strand a cleanup callback in this path. MDN explicitly says no `transitionend` is generated when a transition is removed, has zero duration, or is canceled; the repo's reduced-motion rules deliberately set transition duration to zero for `.db-surface` and near-zero for the container, and the comments state no code waits on an end event. `[SOURCE: file:src/views/mobile-bottom-sheet.ts:423-524]` `[SOURCE: file:src/views/popover-position.ts:295-328]` `[SOURCE: file:styles.css:880-910]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event]`

Diagnostic: a preview assertion should fail only if a future listener is installed without a timeout/final-state fallback. It should not treat “no transitionend” as a sheet failure when `isConnected`, `visibility`, transform, and hit-testing are correct.

Fix direction: no production change for this mechanism. Keep cleanup owned by explicit disposer/MutationObserver paths rather than animation events.

### F-007 — WKWebView transform instability is a secondary visual risk, not an Add-specific event failure (fit 2/5, confidence 0.72)

WebKit has documented iOS/WKWebView cases where CSS transform transitions become janky or jump to the end state after host UI snapshotting, and a newer WebKit report describes flicker when transforms are updated frequently during an active transition. This repo does not repeatedly update the entrance transform; it sets the start, forces layout, and sets the end once. The only frequent transform updates are the drag gesture, which is handle-driven and separate from Add. `[SOURCE: https://bugs.webkit.org/show_bug.cgi?id=228333]` `[SOURCE: https://bugs.webkit.org/show_bug.cgi?id=304741]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:423-524]` `[SOURCE: file:styles.css:332-348]`

Preview diagnostic: record transition events and transform samples during Add with a `PerformanceObserver` long-task slice and a flag showing whether any code writes `style.transform` more than once before the first visible frame. Compare a build with entrance transition disabled but identical DOM/render work. If only animation is wrong while hit-testing and state are correct, classify it as visual jank rather than an interaction freeze.

Fix direction: if reproduced, disable the transform entrance for the affected WebKit build or use an opacity-only/instant entrance; never update the transform during the same transition. Do not conflate this with the renderer lifecycle fix.

### F-008 — reduced-motion is a deliberate no-transition branch and should be a negative control (fit 1/5, confidence 0.90)

The reduced-motion rules remove sheet and overlay transitions and reset transforms. WebKit bug 242510 shows that iOS Safari has had reduced-motion rendering/event edge cases, including differences when the duration is zero or near zero. Because this repo has no transition-event dependency and the reduced-motion sheet is explicitly at rest, a user with Reduce Motion enabled should be used as a controlled comparison, not assumed to be frozen. `[SOURCE: file:styles.css:710-727]` `[SOURCE: file:styles.css:880-910]` `[SOURCE: https://bugs.webkit.org/show_bug.cgi?id=242510]`

Diagnostic: include the Reduce Motion bit in the preview report and compare Add success, final visibility, and `elementFromPoint` with the setting on/off. A failure only with reduced motion elevates CSS overrides; a failure in both settings returns focus to lifecycle/viewport.

## Questions Answered

- Q2: answered for this code path. The force-layout entrance is correctly staged, and no cleanup depends on `transitionend`; transition bugs remain a lower-fit visual fallback.

## Questions Remaining

- Q1: confirm device event ordering and whether the Add tap is duplicated/retargeted.
- Q3: measure viewport/keyboard updates while the new sheet is being placed.
- Q4: inspect actual hit-testing and host-layer event capture.
- Q5: trace focus and local listbox scroll after the new row is opened.

## Assessment

`newInfoRatio=0.63`. This iteration materially reduces the search space: “transitionend never fires” is not a root cause unless another uninspected consumer exists, while transform jank is plausible only as a visible animation symptom. Confidence is high for the code-path elimination and moderate for WebKit behavior because the cited bugs are not this exact Obsidian reproduction.

## Reflection

The prior entrance fix is stronger than the symptom report suggests. The next useful evidence is not another animation workaround; it is a trace proving whether the sheet reaches a hit-testable final state before the apparent freeze and whether viewport placement then moves it.

## Recommended Next Focus

Audit VisualViewport, keyboard inset, body-portalled fixed positioning, safe-area, and host resize/scroll events around Add and the first dropdown focus.

## Ruled Out / Dead Ends

- Missing `transitionend` as a direct Add freeze is ruled out for the inspected modules because no consumer exists.
- Same-frame entrance style collapse is largely ruled out by the forced layout and explicit start/end CSS; keep a transition trace as a regression guard.

## SCOPE VIOLATIONS

None. No researched repository file was modified.
