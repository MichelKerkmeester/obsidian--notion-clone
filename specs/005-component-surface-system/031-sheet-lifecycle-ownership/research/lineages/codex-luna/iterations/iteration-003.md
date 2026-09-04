# Iteration 003 — VisualViewport, keyboard, and body-portalled placement

## Focus

Determine whether the sheet can become unreachable or appear frozen because iOS changes the visual viewport, keyboard inset, or body geometry between the Add gesture and the rebuilt panel's placement. Distinguish a real hit-test failure from a harmless animation/position jump.

## Actions Taken

1. Read the fixed body portal, scrim, `placeSheet`, `keyboardInset`, `resolveKeyboardInset`, and `positionToolbarPopover` scheduling paths.
2. Read the sheet CSS for `svh`, keyboard bottom, safe-area padding, z-index, and max-height.
3. Compared the two-source geometry logic with MDN VisualViewport/meta-viewport guidance and WebKit reports for late resize, stale `offsetTop`, early resize callbacks, and noisy keyboard viewport events.

## Findings

### F-009 — viewport/keyboard timing is a high-fit conditional cause (fit 4/5, confidence 0.86)

The sheet is moved to `document.body`, made `position:fixed`, and placed using an Obsidian `--keyboard-height` value plus a VisualViewport fallback. The positioner subscribes to window resize, document scroll capture, `visualViewport.resize`, and `visualViewport.scroll`, then applies a frame-scheduled placement. This is the correct shape for a keyboard-aware surface, but it has a timing dependency: the browser may fire a resize before the final visual viewport dimensions are observable. WebKit reports late visual-viewport height updates during iOS keyboard animation, intermittent `offsetTop:0` in web-app mode, and a resize callback that needs rAF before the height is trustworthy. `[SOURCE: file:src/views/popover-position.ts:295-328]` `[SOURCE: file:src/views/popover-position.ts:365-393]` `[SOURCE: file:src/views/popover-position.ts:682-748]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport]` `[SOURCE: https://bugs.webkit.org/show_bug.cgi?id=265578]` `[SOURCE: https://bugs.webkit.org/show_bug.cgi?id=237851]` `[SOURCE: https://bugs.webkit.org/show_bug.cgi?id=254861]`

This is conditional: the Add handlers do not focus an input themselves, so it ranks highest when the keyboard is already open, when the first post-add field opens a searchable dropdown, or when Obsidian's own layer changes the inset at the same time as the render.

Preview diagnostic: at every Add gesture and every placement callback, capture panel generation/identity, `document.activeElement`, `window.innerHeight`, `document.documentElement.clientHeight`, `visualViewport.{width,height,offsetTop,offsetLeft,scale}`, computed `--keyboard-height`, computed safe-area padding, `getBoundingClientRect()` for panel/scrim/anchor, `panel.scrollTop`, and `elementFromPoint()` at the Add button. Log the values at event time, next rAF, and a second rAF; mark placement stale if the panel is disconnected or no longer equals the renderer's `getPanel()`.

Fix direction: make placement settle in a two-rAF (or stable-snapshot) loop after viewport/keyboard events, and apply one authoritative bottom/max-height calculation from the settled values. Keep the host CSS variable primary, but do not commit an early VisualViewport fallback that is contradicted on the next frame. Explicitly cancel the old panel's pending placement before synchronous removal and ignore stale generation callbacks.

### F-010 — old and new placement loops can overlap for at least one frame (fit 4/5, confidence 0.79)

`positionToolbarPopover()` schedules an immediate `place()`, a next-frame `place()`, and listener-driven frames. Renderer Add removes the old panel and creates a new one in the same call stack. The old positioner's cleanup is normally reached when its `schedule()` sees `!panel.isConnected` or when the MutationObserver observes removal, while the new positioner starts immediately. That creates a bounded but real overlap in which old/new callbacks can read viewport geometry, release drag state, and compete over shared scrim/dock bookkeeping. The code does guard disconnected panels, but it does not carry a renderer generation token into the position callback. `[SOURCE: file:src/views/filter-panel-renderer.ts:151-182]` `[SOURCE: file:src/views/sort-panel-renderer.ts:59-92]` `[SOURCE: file:src/views/popover-position.ts:119-128]` `[SOURCE: file:src/views/popover-position.ts:295-328]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:241-313]`

Preview diagnostic: log every `place`, `schedule`, cleanup, scrim toggle, dock claim/release, and drag teardown with `panel === renderer.getPanel()`, `isConnected`, a generation ID, and rAF sequence. Fail the trace if a disconnected/obsolete panel writes style or if more than one generation reports itself as active after the new panel is created.

Fix direction: have the renderer explicitly dispose the old position/overlay registration before removing its node, or give the positioner an owner token and make all callbacks no-op unless the token is current. Keep the MutationObserver as a leak backstop, not as the primary handoff between generations.

### F-011 — `svh` plus JS `innerHeight` can produce a covered or over-constrained sheet (fit 3/5, confidence 0.78)

The stylesheet caps the body-mounted sheet with `calc(90svh - var(--db-mobile-sheet-bottom)) !important` and adds safe-area padding. JavaScript also computes a max-height from `view.innerHeight - keyboard`. `svh` represents the small viewport, while the JS value can reflect a different phase of iOS keyboard/UI animation; a CSS `!important` rule can also win over a non-important inline max-height. A sheet can therefore be visually present but place its Add button behind the keyboard/home indicator or reduce its scrollable area enough that the apparent tap lands outside. `[SOURCE: file:styles.css:180-227]` `[SOURCE: file:styles.css:332-348]` `[SOURCE: file:styles.css:192-227]` `[SOURCE: file:src/views/popover-position.ts:365-393]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env]`

Preview diagnostic: compare inline `style.maxHeight`, computed `max-height`, panel rect top/bottom, content scrollHeight/clientHeight, safe-area inset, keyboard inset, and the Add button rect. Record whether the button is inside the panel rect and whether the scrim or Obsidian navbar wins `elementFromPoint` at its center.

Fix direction: define one CSS custom property for the settled usable visual height and use it consistently; avoid competing `svh` and `innerHeight` authorities. Keep safe-area padding additive to content, not a second keyboard displacement. Use `dvh` only with a tested fallback; the diagnostic must prove the target WebKit build's unit behavior first.

### F-012 — noisy VisualViewport events can cause visible jitter but are not by themselves a freeze (fit 2/5, confidence 0.76)

WebKit bug 226689 records iOS/iPadOS cases where VisualViewport height and resize events change while the viewport is not actually changing during keyboard scrolling. The repo coalesces each source to one rAF, which limits work but still allows repeated reads/writes during an unstable sequence. The likely symptom is a sheet that jumps or the button moves under the finger, not a permanent deadlock. `[SOURCE: file:src/views/popover-position.ts:298-328]` `[SOURCE: file:src/views/popover-position.ts:425-431]` `[SOURCE: https://bugs.webkit.org/show_bug.cgi?id=226689]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport]`

Preview diagnostic: count placement frames per 250ms, record geometry deltas, and correlate them with `pointerdown`/`click`; flag more than two materially different panel rects during one Add gesture. Compare with a build that ignores VisualViewport scroll but retains resize and host inset.

Fix direction: coalesce to a settled snapshot and suppress placement writes while the action gesture is active unless the panel would leave the safe hit-test region. Do not remove viewport listeners wholesale; they are needed for keyboard recovery.

## Questions Answered

- Q3: partially answered. The body portal and dual inset source make viewport timing a high-fit conditional mechanism, especially with an open keyboard or searchable dropdown; stale-generation and stable-frame diagnostics are required for confirmation.

## Questions Remaining

- Q1: prove Add click/gesture ordering on device.
- Q4: inspect touch-action/overscroll/passive semantics and actual Obsidian host hit-testing.
- Q5: trace focus and `scrollIntoView` after adding/opening a row.

## Assessment

`newInfoRatio=0.46`. The new information is the concrete overlap between body-portal lifecycle and iOS VisualViewport timing, plus a measurable `svh`/JS max-height authority conflict. Confidence is high that the mechanism is plausible in the affected state, but only moderate that it explains a keyboard-free Add tap because the Add path itself does not focus an input.

## Reflection

The viewport code already contains sensible rAF coalescing and a host-variable-first policy. The remaining risk is settling and ownership: old/new generations do not share a visible token, and iOS can report geometry in phases that make a single rAF too early.

## Recommended Next Focus

Audit gesture arbitration, overscroll/touch-action, passive listener defaults, z-index/elementFromPoint, and the boundary with Obsidian's own mobile modal/keyboard layers.

## Ruled Out / Dead Ends

- A generic “no VisualViewport listener” explanation is ruled out; the repo has listeners and rAF coalescing. The risk is stale/early values and competing generations.
- A keyboard-only root cause for every Add tap is not established because neither Add handler focuses an input; retain it as a conditional high-fit branch.

## SCOPE VIOLATIONS

None. No researched repository file was modified.
