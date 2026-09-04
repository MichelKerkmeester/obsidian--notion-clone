# Iteration 001 — iOS touch/click lifecycle at Add condition/Add sort

## Focus

Trace the complete action boundary from a finger tap through pointer/click dispatch, overlay-stack capture, synchronous panel replacement, and the immediate result refresh. The question is whether the current code creates a stale-target or retargeting window that is specific enough to explain an iOS-only break/freeze.

## Actions Taken

1. Read the filter and sort renderer paths, including the exact Add button handlers and the full render teardown/rebuild sequence.
2. Read the mobile sheet lifecycle, live-sheet MutationObserver, body portal, and document-capture overlay stack.
3. Compared the event model with MDN touch/pointer guidance, the W3C Touch Events click-emulation rule, and a WebKit pointer-cancel report.

## Findings

### F-001 — synchronous remove/recreate/refresh is the highest-fit event race (fit 5/5, confidence 0.84)

Both Add handlers mutate state, save, synchronously call the renderer, and then call `actions.refresh()` in the same `onclick` task. The renderer removes the current panel before creating the next panel, so the button node that received the gesture is not stable across the action. On a single-touch sequence, browsers commonly synthesize mouse/click events; therefore a delayed or retargeted click is a credible iOS-specific trigger, but this source-backed mechanism is still an inference rather than proof that WebKit retargets this exact node. `[SOURCE: file:src/views/filter-panel-renderer.ts:143-220]` `[SOURCE: file:src/views/filter-panel-renderer.ts:207-217]` `[SOURCE: file:src/views/sort-panel-renderer.ts:51-119]` `[SOURCE: file:src/views/sort-panel-renderer.ts:108-119]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events]` `[SOURCE: https://www.w3.org/TR/touch-events/]`

Preview diagnostic: assign every panel a monotonically increasing `data-sheet-generation`; capture `pointerdown`, `touchstart`, `touchend`, `pointerup`, `click`, `pointercancel`, `MutationObserver`, `render-start`, `render-end`, and `refresh-start/end` with `performance.now()`, `event.timeStamp`, `event.detail`, `event.target.isConnected`, `closest('.db-mobile-bottom-sheet')`, current renderer `getPanel()`, and generation. Record whether the Add action fires once or more than once and whether the final hit-test target is the new panel, scrim, or an Obsidian element.

Fix direction: make the sheet shell stable across Add actions and patch only the rule rows, or defer the destructive panel replacement to a post-click frame after the originating event has completed. If full replacement is retained, use one pointer/click action gate keyed by gesture plus generation, reject disconnected/stale targets, and schedule the expensive refresh separately. Do not “fix” this by blindly adding both touchend and click handlers.

### F-002 — overlay-stack capture is a plausible amplifier, not the primary defect (fit 3/5, confidence 0.70)

The overlay stack owns a document-capture `pointerdown` listener. It treats the live panel or anchor as inside, then otherwise dismisses the top surface before the later click event. `getPanel()` correctly resolves a rebuilt panel, but that only helps after the new node exists; it cannot repair a pointerdown whose hit-test landed outside during viewport movement or panel removal. `[SOURCE: file:src/views/overlay-stack.ts:152-180]` `[SOURCE: file:src/views/overlay-stack.ts:137-140]` `[SOURCE: file:src/views/popover-auto-close.ts:39-59]`

Preview diagnostic: log capture-phase target, `isConnected`, `event.defaultPrevented`, live panel identity, anchor identity, `contains(target)`, stack top, dismissal reason, and the subsequent click target. Add an assertion that an Add gesture cannot produce `outside-pointerdown` for a target that was inside the panel at pointerdown.

Fix direction: keep the live-panel resolver, but make outside dismissal click-safe: mark the active action gesture, ignore dismissal for that gesture until `click`/`pointercancel` resolves, and clear the mark on a bounded timeout. Also make the Add handler stop propagation after a verified inside action if the host contract allows it. Do not remove the capture listener globally.

### F-003 — the bottom-sheet dropdown is not independently body-portalled (fit 1/5, confidence 0.92)

For ordinary note-database container anchors, `getDropdownPopoverHost()` returns the closest `.note-database-container`; `setSheetMount()` adds that class to the body-mounted sheet. Thus the new row's custom listbox is a child of the sheet, and the ordinary dropdown does not explain an outside-click dismissal by itself. The modal/settings branches intentionally use `body`, so those are separate host-layer cases. `[SOURCE: file:src/views/dropdown-field.ts:187-195]` `[SOURCE: file:src/views/dropdown-field.ts:379-384]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:141-161]` `[SOURCE: file:src/views/overlay-stack.ts:171-180]`

Diagnostic: log dropdown host and `panel.contains(dropdown)` in the preview trace. Treat a false result as a regression or a different surface, not as the default explanation for the bottom sheet.

### F-004 — pointer-cancel/gesture arbitration can explain lost movement, but not yet an Add click (fit 2/5, confidence 0.73)

The sheet installs pointer listeners on the whole panel, rejects non-handle `pointerdown`, and uses pointer capture for a drag. The panel itself has no explicit `touch-action`; only the handle has `touch-action:none`. MDN says a browser may issue `pointercancel` when it takes a pan/zoom gesture, while WebKit bug 240917 documents an iOS-specific missing `pointercancel` case for `touch-action: manipulation`. This repo does not use `manipulation`, and the Add button is not the drag handle, so the bug is a diagnostic lead rather than a ranked root cause. `[SOURCE: file:src/views/mobile-bottom-sheet.ts:423-524]` `[SOURCE: file:styles.css:262-299]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action]` `[SOURCE: https://bugs.webkit.org/show_bug.cgi?id=240917]`

Diagnostic: record `pointerdown/move/up/cancel`, `pointerId`, capture target, `cancelable`, `defaultPrevented`, computed `touch-action`, scrollTop, and whether the Add target is the handle pseudo-hit area. If Add taps show no `pointercancel` and a normal click, lower this mechanism.

## Questions Answered

- Q1: partially answered. The synchronous destructive render is a high-fit seam; exact iOS retargeting and any duplicate invocation require the preview event trace.
- Q4: initial disposition. Pointer arbitration is possible around the scrollable sheet but the current `touch-action` placement makes it a lower-fit explanation for the button itself.

## Questions Remaining

- Q1: Does the iOS device emit a click after the old node is removed, and what node receives it?
- Q2: Can entrance transitions be canceled or left half-applied during the same render cycle?
- Q3: Do keyboard/VisualViewport updates move the body-mounted panel between pointerdown and click?
- Q4: Does an Obsidian host layer participate in the final hit test?
- Q5: Does the next custom dropdown focus/scroll operation cause the visible freeze?

## Assessment

`newInfoRatio=0.82`. Novelty is high because the code-level task ordering was connected to the platform click-emulation boundary and because the normal bottom-sheet dropdown host was ruled out as an independent portal. Confidence is moderate: no live iOS trace was available, so the ranking is fit-to-code, not a confirmed root cause.

## Reflection

The most useful distinction is “Add tap itself” versus “first field interaction after Add.” The former points to event/lifecycle and overlay capture; the latter points toward viewport/focus and the custom listbox. Broad host-layer claims should wait for elementFromPoint and focus traces.

## Recommended Next Focus

Inspect transition lifecycle and the exact visual state of old/new panels across forced layout, same-frame class swaps, removal, `requestAnimationFrame`, and missing `transitionend`/`transitioncancel` behavior.

## Ruled Out / Dead Ends

- Ordinary bottom-sheet dropdown body-portaling is ruled out as the default explanation (F-003); verify only for modal/settings surfaces.
- A WebKit `touch-action: manipulation` bug is not a direct match because this repo does not set that value on the Add path; keep as a negative control.

## SCOPE VIOLATIONS

None. No researched repository file was modified.
