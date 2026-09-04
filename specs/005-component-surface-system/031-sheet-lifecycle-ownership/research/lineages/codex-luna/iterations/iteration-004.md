# Iteration 004 — gesture arbitration, overscroll, and Obsidian host layers

## Focus

Rank the mechanisms that can make a valid Add tap disappear into browser gesture handling, scroll chaining, a document-capture outside dismissal, or an Obsidian-owned modal/keyboard layer. Keep “the browser may cancel a drag” separate from “a simple button tap freezes.”

## Actions Taken

1. Read the panel/handle pointer listeners, CSS `touch-action` and `overscroll-behavior`, overlay-stack capture, and z-index/stacking rules.
2. Checked every relevant listener for touch versus pointer event type, `preventDefault`, and explicit passive options.
3. Compared the surface with MDN gesture/passive/overscroll guidance, WebKit's iOS pointer-cancel report, official Obsidian lifecycle guidance, and public Obsidian plugin issue/release reports.

## Findings

### F-013 — gesture arbitration is a medium-fit conditional cause (fit 2/5, confidence 0.84)

The sheet is a scroll container (`overflow-y:auto`) with `overscroll-behavior:contain`; only the handle hit area has `touch-action:none`. The Add button and row controls therefore retain browser-default touch behavior, while the panel-level pointer listeners ignore non-handle `pointerdown` and do not call `preventDefault`. MDN says default panning/zooming belongs to the browser and can result in `pointercancel`; `overscroll-behavior:contain` controls scroll chaining at a boundary. This can explain a drag/scroll gesture being canceled or the sheet moving under the finger, but a stationary tap should still produce a click. `[SOURCE: file:src/views/mobile-bottom-sheet.ts:423-524]` `[SOURCE: file:styles.css:262-299]` `[SOURCE: file:src/views/popover-position.ts:159-170]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Overscroll_behavior]` `[SOURCE: https://bugs.webkit.org/show_bug.cgi?id=240917]`

Preview diagnostic: capture `pointerdown/move/up/cancel`, `touchstart/move/end/cancel`, `click`, `cancelable`, `defaultPrevented`, `pointerType`, pointer capture target, computed `touch-action`/`overscroll-behavior`, panel scrollTop/max, and movement threshold. Mark the gesture as a tap only when movement stays below a small threshold; correlate missing click with `pointercancel`, scrollTop changes, or an outside dismissal.

Fix direction: use explicit role-scoped touch-action (`none` only on the handle; `pan-y` on the sheet if supported by the tested WebKit) and preserve `overscroll-behavior:contain` for scroll chaining. Do not put `touch-action:none` on the entire sheet or globally suppress scrolling to make Add reliable.

### F-014 — passive-listener behavior is a low-fit direct explanation (fit 1/5, confidence 0.94)

The inspected path registers `pointerdown/move/up/cancel`, `keydown`, `resize`, and `scroll`, not `touchstart`/`touchmove`/`wheel`, and no listener calls `preventDefault` for the Add gesture. The passive-listener rule matters when an application needs to cancel a touch/wheel default action, but there is no such cancellation contract here. MDN documents `passive` as a declaration that the handler will not call `preventDefault`; it does not make a normal pointer click silently freeze. `[SOURCE: file:src/views/mobile-bottom-sheet.ts:510-513]` `[SOURCE: file:src/views/overlay-stack.ts:158-159]` `[SOURCE: file:src/views/popover-position.ts:317-327]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener]`

Preview diagnostic: record `event.cancelable` and `defaultPrevented` for the whole sequence and use a development-only listener wrapper only if the build adds touch/wheel listeners. If there are no touch/wheel handlers and no prevented events, close this branch.

Fix direction: no production change in the current path. If a future drag implementation needs to cancel a touch default, declare `{passive:false}` on the narrowly-scoped listener and call `preventDefault()` only after the gesture crosses its drag threshold; do not add a document-wide non-passive listener.

### F-015 — an Obsidian host-layer/z-index collision is plausible but unproven (fit 3/5, confidence 0.64)

The sheet and scrim are body siblings with z-indexes 1000 and 999, isolation, fixed positioning, and pointer-events enabled on the scrim. The dropdown inside an ordinary sheet is a child of that sheet, but Obsidian's private mobile modal, keyboard, navbar, and selection layers can establish independent stacking contexts or alter the final hit test. Official Obsidian guidance emphasizes explicit ownership and cleanup for global listeners/resources; it does not document the private layer ordering. Public ecosystem evidence shows analogous iOS UI failures: Tasks reports an iOS modal's buttons jumping when a dropdown receives focus, and Kanban release notes describe separate iPhone fixes for keyboard panning, bottom-sheet placement, and bottom-bar overlap. These reports establish host/platform sensitivity, not this repo's cause. `[SOURCE: file:styles.css:192-244]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:315-335]` `[SOURCE: https://docs.obsidian.md/plugins/guides/lifecycle-management]` `[SOURCE: https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3989]` `[SOURCE: https://github.com/Trietment/obsidian-kanban]`

Preview diagnostic: at the Add button center and panel/scrim edges record `document.elementsFromPoint()` with each element's class/id, `z-index`, `position`, `pointer-events`, `transform`, and `isConnected`; record `activeElement`, Obsidian ancestor/class markers, and whether a native `.modal`, mobile navbar, keyboard accessory, or selection surface is above the plugin sheet. Run with no other plugins and with the suspected host layer open.

Fix direction: choose one host layer per surface. If the trace shows Obsidian's layer above the plugin, use the supported Obsidian Modal/component surface or a host-approved portal rather than escalating arbitrary z-index. If the plugin must remain body-portalled, publish a single layer contract and remove the scrim/positioner when the surface closes.

### F-016 — document capture is a timing amplifier, not a passive-listener bug (fit 3/5, confidence 0.82)

`overlay-stack` installs `pointerdown` in capture phase and dismisses the top surface whenever the target is not inside the live panel or anchor. This listener is intentionally not passive because it does not cancel the pointer; its risk is ordering and hit-testing. A viewport move or old/new generation gap can make an intended inside target look outside, and the dismissal runs before the later click. `[SOURCE: file:src/views/overlay-stack.ts:152-180]` `[SOURCE: file:src/views/overlay-stack.ts:190-215]` `[SOURCE: file:src/views/popover-auto-close.ts:39-59]`

Preview diagnostic: log capture-phase target and composed path, `livePanel(surface)`, `anchor`, `contains`, stack top, close reason, and final click. Pair this with `elementsFromPoint` so a host layer can be distinguished from a stale panel.

Fix direction: defer or guard outside dismissal for the active Add gesture, preserve `getPanel()` live resolution, and clear the guard on `click`, `pointercancel`, or a short timeout. Ensure every rebuilt surface unregisters before its node is removed.

## Questions Answered

- Q4: answered with a ranked disposition. Current pointer/touch code makes passive listeners and global touch-action low-fit. Gesture arbitration and document capture are medium-fit conditional causes; an Obsidian host-layer collision is a measurable medium-fit possibility, supported by analog plugin reports but not proven here.

## Questions Remaining

- Q1: device event trace still needed.
- Q3: settle viewport/keyboard branch against the host-layer trace.
- Q5: determine whether custom listbox focus/scroll is the post-add trigger.

## Assessment

`newInfoRatio=0.24`. This iteration materially rules out a broad passive-listener explanation and separates drag cancellation from tap loss. It adds the required Obsidian ecosystem evidence while explicitly limiting it to analogy. Confidence is high for the repo listener inventory and moderate for host-layer risk because Obsidian's private z-order cannot be inferred from public docs.

## Reflection

The most useful preview signal is `elementsFromPoint` plus a composed event path. It can decide among stale panel, scrim/outside dismissal, Obsidian host element, and browser gesture cancellation without requiring private Obsidian internals.

## Recommended Next Focus

Trace focus, activeElement changes, custom listbox `scrollIntoView`, panel scroll restoration, 100vh/svh, safe-area, and the exact behavior when Add is followed by opening the new row's dropdown.

## Ruled Out / Dead Ends

- Passive listeners are not a direct match because the Add path has no touch/wheel listener or default cancellation.
- Global `touch-action:none` is not justified; only the handle is intentionally non-scrollable and the Add control is outside it.
- Public Obsidian reports cannot prove a private host-layer collision; use them to justify the diagnostic, not to claim root cause.

## SCOPE VIOLATIONS

None. No researched repository file was modified.
