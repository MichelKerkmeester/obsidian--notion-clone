# Deep Research Synthesis — iOS WebKit bottom-sheet Add actions

Lineage: `codex-luna`  
Topic: why tapping “Add condition” / “Add sort” can break or freeze the note-database bottom sheet on Obsidian mobile iOS after the entrance fix.  
Evidence policy: local claims use `[SOURCE: file:path:line]`; browser and ecosystem claims link directly to the cited page.

## 1. Executive Summary

The highest-fit explanation is a two-stage failure surface, not one isolated CSS transition defect:

1. The Add action crosses a destructive DOM handoff. Both renderers remove and recreate the panel synchronously, then refresh the surrounding view. That creates a stale-target/generation window in which the original touch/click, document-capture outside-dismissal, overlay live-panel lookup, and old placement callbacks can disagree about which panel owns the gesture. This is the strongest explanation for a failure on the Add tap itself (fit 5/5).
2. If Add succeeds, the first interaction with the new rule can trigger explicit focus and scrolling. The new-row “select” is a custom button/listbox. Its initial active option is focused and scrolled into view; searchable variants schedule input focus on the next task. On iOS, that can start keyboard/VisualViewport movement while a newly body-mounted, fixed sheet is still being positioned. This is the strongest explanation for a freeze/jump immediately after Add (fit 4/5 for the custom listbox path; fit 3/5 for delayed search focus).

VisualViewport/keyboard timing and `svh`/safe-area geometry are high-value conditional amplifiers. Document-capture dismissal and an Obsidian host-layer collision are medium-fit branches that must be confirmed with hit-testing. The current code does not support treating missing `transitionend`, passive listeners, global `touch-action:none`, or a native iOS `<select>` picker as the primary cause.

No available source proves the exact device root cause. The safe next action is a preview-only, generation-tagged trace that separates “Add click was lost or dismissed” from “Add succeeded and focus/viewport moved the new control.”

## 2. Research Question and Decision Standard

The question was to enumerate iOS-WebKit-specific mechanisms for the Add condition/Add sort failure, rank each against this repository with file:line evidence, cite WebKit bugs/MDN/Obsidian reports, and propose a preview diagnostic and fix for each mechanism.

“Fit” means how directly the mechanism intersects the inspected code path, not how severe the generic browser behavior sounds. A high fit still needs a device trace when the source describes a platform possibility rather than this exact application. Obsidian issue reports are explicitly analogies because Obsidian's mobile internals are private.

## 3. Scope, Boundaries, and Code Surface

The research inspected the Add handlers, mobile sheet entrance and ownership, overlay stack, auto-close adapter, placement/keyboard loop, custom dropdown, and root `styles.css`. No production code or spec was changed. No repository validation or generation tooling was run, and no nested executor was launched.

The key code seam is:

`Add click → save state → remove old panel/trap → create/focus new panel → render rows → refresh results`, with body-mounted sheet placement and document-level capture still active around it.

Relevant local evidence:

- Filter Add condition: `[SOURCE: file:src/views/filter-panel-renderer.ts:143-220]`
- Sort Add sort: `[SOURCE: file:src/views/sort-panel-renderer.ts:51-119]`
- Entrance: `[SOURCE: file:src/views/mobile-bottom-sheet.ts:100-115]`
- Sheet mount/live cleanup: `[SOURCE: file:src/views/mobile-bottom-sheet.ts:141-161]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:241-313]`
- Gesture listeners: `[SOURCE: file:src/views/mobile-bottom-sheet.ts:423-524]`
- Overlay capture/dismissal: `[SOURCE: file:src/views/overlay-stack.ts:137-215]`
- Auto-close registration: `[SOURCE: file:src/views/popover-auto-close.ts:39-59]`
- Placement/VisualViewport/keyboard: `[SOURCE: file:src/views/popover-position.ts:295-328]` `[SOURCE: file:src/views/popover-position.ts:365-437]` `[SOURCE: file:src/views/popover-position.ts:682-748]`
- Custom listbox and focus/scroll: `[SOURCE: file:src/views/dropdown-field.ts:187-372]`
- Motion, viewport units, safe area, and gesture CSS: `[SOURCE: file:styles.css:164-174]` `[SOURCE: file:styles.css:180-227]` `[SOURCE: file:styles.css:237-299]` `[SOURCE: file:styles.css:320-356]` `[SOURCE: file:styles.css:710-727]` `[SOURCE: file:styles.css:880-910]`

## 4. Method and Convergence Record

Five inline research iterations were completed in this session. Each produced an iteration narrative, delta record, and canonical state event inside this lineage. The new-information ratios were:

| Iteration | Focus | Ratio | Result |
|---:|---|---:|---|
| 1 | touch/click lifecycle, synchronous replacement, overlay boundary | 0.82 | High-fit stale-target seam identified. |
| 2 | entrance transition and `transitionend` lifecycle | 0.63 | Same-frame collapse and missing-event cleanup theories lowered. |
| 3 | VisualViewport, keyboard, body portal, placement generations | 0.46 | High-fit conditional viewport branch identified. |
| 4 | gesture arbitration, overscroll, passive listeners, host layers | 0.24 | Capture/host branches retained; passive/global touch-action lowered. |
| 5 | custom listbox focus/scroll, search autofocus, safe area/units | 0.04 | All questions dispositioned; synthesis became legal. |

Convergence used the configured threshold `0.05`, minimum three iterations, all-five-question disposition, and source-diversity coverage across repository, MDN/W3C, WebKit, and Obsidian ecosystem sources.

## 5. Browser Semantics That Matter

### Touch and synthetic click

MDN's touch-event guidance describes the compatibility path in which a touch can produce emulated mouse/click events, and default handling can be suppressed with `preventDefault()`: [Using Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events). The W3C touch-events specification supplies the event model: [Touch Events](https://www.w3.org/TR/touch-events/). This supports tracing `pointerdown/up`, `touchend` where available, and `click`; it does not prove that WebKit retargets this particular Add click.

### Transitions

MDN states that `transitionend` is not generated when a transition is removed, has zero duration/delay, or is canceled: [transitionend](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event). The entrance code applies the start class, reads layout, and then applies the visible class: `[SOURCE: file:src/views/mobile-bottom-sheet.ts:100-115]`. The inspected Add/placement path has no `transitionend` consumer, and reduced-motion deliberately removes or nearly removes transitions: `[SOURCE: file:styles.css:710-727]` `[SOURCE: file:styles.css:880-910]`. Therefore a missing event is a low-fit direct freeze cause, though final-state sampling remains a good regression guard.

### Visual viewport and keyboard

The VisualViewport API exposes a viewport that can differ from the layout viewport: [MDN VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport). The repository listens to resize/scroll and schedules placement through rAF, then computes a keyboard inset from visual viewport and `innerHeight`: `[SOURCE: file:src/views/popover-position.ts:295-328]` `[SOURCE: file:src/views/popover-position.ts:365-393]` `[SOURCE: file:src/views/popover-position.ts:682-748]`.

WebKit reports directly relevant timing hazards: [bug 265578](https://bugs.webkit.org/show_bug.cgi?id=265578) describes visual viewport height updating late during iOS keyboard animation; [bug 237851](https://bugs.webkit.org/show_bug.cgi?id=237851) records incorrect soft-keyboard `offsetTop` in web-app mode; [bug 254861](https://bugs.webkit.org/show_bug.cgi?id=254861) documents a resize/rAF ordering issue when the viewport is restored; and [bug 226689](https://bugs.webkit.org/show_bug.cgi?id=226689) reports iPadOS VisualViewport changes during keyboard scrolling. These reports make the branch credible, not conclusive.

### Focus and scrolling

`HTMLElement.focus()` can scroll an element unless `{preventScroll:true}` is supplied: [MDN focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus). `scrollIntoView()` can scroll containing ancestors even with `block:"nearest"`: [MDN scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView). That maps directly to `syncActiveOption(true)`: `[SOURCE: file:src/views/dropdown-field.ts:226-241]`. Searchable controls separately schedule an input focus with `setTimeout(..., 0)`: `[SOURCE: file:src/views/dropdown-field.ts:322-327]`.

### Gesture, overscroll, and listener options

The sheet panel is a scroll container with `overscroll-behavior:contain`; only the handle has `touch-action:none`: `[SOURCE: file:styles.css:262-299]` `[SOURCE: file:src/views/popover-position.ts:159-170]`. MDN documents that `touch-action` lets the browser arbitrate panning/zooming and that `overscroll-behavior` controls scroll chaining: [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action), [overscroll behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Overscroll_behavior). The current panel pointer listeners do not call `preventDefault`: `[SOURCE: file:src/views/mobile-bottom-sheet.ts:510-513]`. MDN listener options are the right reference for any future touch/wheel listener: [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

WebKit bug [240917](https://bugs.webkit.org/show_bug.cgi?id=240917) is specifically about an iOS `pointercancel` condition involving `touch-action: manipulation`; this repository does not use that value on the Add button, so it is a conditional lead/negative control rather than a direct match.

### Safe areas and host layers

The sheet combines `90svh`, safe-area padding, and a JavaScript keyboard-bottom calculation: `[SOURCE: file:styles.css:180-227]` `[SOURCE: file:src/views/popover-position.ts:365-393]`. MDN describes safe-area environment variables in [`env()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) and the layout/visual viewport context in the [viewport meta reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport).

Obsidian's public lifecycle guidance emphasizes ownership and cleanup: [lifecycle management](https://docs.obsidian.md/plugins/guides/lifecycle-management). It cannot identify private mobile layer classes. Public ecosystem reports are useful symptom analogies: Tasks [issue #3989](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3989) describes iOS modal button movement after dropdown focus; Obsidian help [issue #237](https://github.com/obsidianmd/obsidian-help/issues/237) describes iPadOS input-method focus loss; the [Kanban plugin](https://github.com/Trietment/obsidian-kanban) release history contains iPhone keyboard/panning/bottom-sheet fixes. None is proof of this repo's host interaction.

## 6. Ranked Mechanism Matrix

Fit is against this repository's actual code path: 5/5 is direct and high-risk; 1/5 is a ruled-out or regression-only branch.

| Rank | Mechanism and repo fit | Local evidence | Preview diagnostic to ship | Fix direction |
|---:|---|---|---|---|
| 1 | **Synchronous `touchend`/synthetic-click → destructive re-render (5/5).** The Add handler runs in a click path, removes/recreates the panel, then refreshes. A stale target or second event can cross generations. | `[SOURCE: file:src/views/filter-panel-renderer.ts:207-217]` `[SOURCE: file:src/views/sort-panel-renderer.ts:108-119]` | Generation-tag `pointerdown/up/cancel`, `touchend`/`click`, connected target, composed path, current panel identity, render start/end, remove, refresh, and overlay close reason. | Prefer a stable shell/keyed row update. If replacement remains, gate one Add action per generation, dispose/unregister old surface before removal, and reject stale callbacks/events. |
| 2 | **VisualViewport/keyboard timing moves the body-portalled sheet (4/5, conditional).** WebKit can expose late/noisy keyboard geometry while the sheet's placement loop is active. | `[SOURCE: file:src/views/popover-position.ts:295-328]` `[SOURCE: file:src/views/popover-position.ts:365-393]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:141-161]` | Log every viewport/resize/scroll/rAF sample with generation, `innerHeight`, visual viewport width/height/offset/scale, keyboard inset, panel rect, and stable-frame count. | One placement owner and generation; cancel old rAF/listeners; use one settled usable-height authority and wait for consecutive stable frames before final placement. |
| 3 | **Custom option focus plus `scrollIntoView` after the new row opens (4/5).** This is an explicit post-add operation on a new descendant of a fixed sheet. | `[SOURCE: file:src/views/dropdown-field.ts:226-241]` `[SOURCE: file:src/views/dropdown-field.ts:260-295]` | Development-only wrapper/trace for `focus` and `scrollIntoView`: target/generation, connected state, nearest scroll container, pre/post scroll positions, rects, active element, viewport metrics, and long tasks. | Focus with `preventScroll`; scroll only the local options viewport with a bounded calculation; skip initial scroll if already visible; cancel stale controls. |
| 4 | **Document-capture outside dismissal during a moving/rebuilt panel (3/5).** A capture listener resolves the live panel and dismisses when the event target is outside it; a handoff can make a valid gesture appear outside. | `[SOURCE: file:src/views/overlay-stack.ts:152-180]` `[SOURCE: file:src/views/overlay-stack.ts:190-215]` `[SOURCE: file:src/views/popover-auto-close.ts:39-59]` | Record capture-phase `target`, `composedPath`, live panel, `contains`, anchor, close reason, and panel generation; pair with `elementsFromPoint`. | Guard outside dismissal while an Add gesture/action is active, or defer it until click/render handoff; unregister old surface before removal and re-resolve the live panel. |
| 5 | **Obsidian private modal/keyboard layer or z-index collision (3/5, conditional).** Body portal and z-index 999/1000 can intersect host layers; ecosystem reports support the symptom family only. | `[SOURCE: file:styles.css:192-244]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:315-335]` | At the Add coordinates capture `elementsFromPoint`, `elementFromPoint`, composed path, computed z-index/pointer-events, host ancestors, active element, and keyboard CSS variables; repeat with no other plugins. | Use one supported host layer and explicit ownership/cleanup. Avoid private host selectors; fix only a measured hit-test or focus-layer conflict. |
| 6 | **Searchable dropdown's delayed input focus opens keyboard during placement (3/5).** `setTimeout(...,0)` deliberately crosses the render task and can race viewport settling. | `[SOURCE: file:src/views/dropdown-field.ts:298-327]` `[SOURCE: file:src/views/popover-position.ts:295-328]` | Tag timeout/dropdown generation; record input focus, keyboard inset, visual viewport, panel rect, and hit-test timeline. A/B with autofocus disabled. | Make autofocus explicit/user-intent gated; settle placement first; cancel timeout on teardown; no-op stale input. |
| 7 | **`svh` + safe-area + JS `innerHeight` disagreement (3/5, geometry amplifier).** CSS and JS can use different snapshots of usable height. | `[SOURCE: file:styles.css:180-227]` `[SOURCE: file:src/views/popover-position.ts:365-393]` | Log `svh`-derived computed max-height, safe-area padding, `innerHeight`, visual viewport, keyboard inset, client/scroll heights, panel/control rects, and hit-test for four frames. | Choose one settled usable-height contract; keep safe-area padding separate from keyboard offset; clamp once per stable frame and test target WebView units. |
| 8 | **Overscroll/touch-action/pointer cancellation (2/5).** The panel listeners ignore non-handle down events; only the handle is `touch-action:none`, so a stationary Add tap should remain clickable. | `[SOURCE: file:src/views/mobile-bottom-sheet.ts:423-524]` `[SOURCE: file:styles.css:262-299]` | Log pointer lifecycle, `pointercancel`, capture target, cancelability/defaultPrevented, computed touch-action, scrollTop, overscroll state, and whether the point is the handle. | Keep role-scoped touch-action and sheet overscroll containment; do not add global `touch-action:none` or `manipulation` without a trace. |
| 9 | **WKWebView transform-transition jank/flicker (2/5).** WebKit has transform-transition reports, but this path sets entrance transform once; repeated updates are mainly drag-related. | `[SOURCE: file:src/views/mobile-bottom-sheet.ts:100-115]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:423-524]` `[SOURCE: file:styles.css:320-348]` | Sample computed transform, rect, frame time, transition state, and panel generation during Add and drag; compare reduced motion and a no-transition preview flag. | Avoid frequent transform updates during entrance; settle geometry before transition; keep drag transform separate; provide final-state fallback. |
| 10 | **`transitionend` missing after same-frame class swap (1/5).** The entrance already forces layout and no inspected path consumes `transitionend`. | `[SOURCE: file:src/views/mobile-bottom-sheet.ts:100-115]` `[SOURCE: file:styles.css:320-348]` `[SOURCE: file:styles.css:880-910]` | Trace class changes, computed transition/duration, `transitionrun/start/end/cancel`, final class and hit-test; assert end state rather than waiting on the event. | Keep forced layout; if future cleanup needs completion, use event plus timeout/rAF/final-state fallback and handle reduced motion. |
| 11 | **Passive listener blocks `preventDefault` (1/5).** No touch/wheel listener or default cancellation is in the inspected Add path; panel pointer listeners do not cancel. | `[SOURCE: file:src/views/mobile-bottom-sheet.ts:510-513]` `[SOURCE: file:src/views/overlay-stack.ts:158-159]` | Record `cancelable` and `defaultPrevented`; inventory any future touch/wheel listener and its options. Do not change listener passivity in the diagnostic build. | No current-path change. If a future scroll listener needs cancellation, make it narrow, explicit, and role-scoped. |
| 12 | **Native iOS `<select>` picker (1/5 / ruled out for this path).** The new control is a custom button/listbox, not a native select. | `[SOURCE: file:src/views/dropdown-field.ts:187-195]` `[SOURCE: file:src/views/dropdown-field.ts:260-295]` | Log role/tag/host; use a native-select A/B only as a separate host control comparison. | Do not apply native-picker fixes to the custom listbox; fix its explicit focus/scroll lifecycle. |

## 7. Detailed Findings and Causal Scenarios

### Scenario A — Add itself is lost, duplicated, or dismissed

The filter and sort handlers synchronously mutate state, save, render a replacement panel, and refresh. The old panel and focus trap are removed at the beginning of render, and a new panel is appended/focused before the operation returns. `[SOURCE: file:src/views/filter-panel-renderer.ts:143-220]` `[SOURCE: file:src/views/sort-panel-renderer.ts:51-119]`

Touch compatibility can produce a later click from a touch sequence, so an event trace must show whether the click arrives, which node owns it, and whether that node is connected. The important claim is not that WebKit must retarget the click; it is that this code creates a measurable generation boundary exactly where a platform-delayed event and document capture can meet.

The overlay stack installs document capture listeners and asks a live panel resolver whether the target is outside the active surface. `[SOURCE: file:src/views/overlay-stack.ts:137-180]` If placement or replacement changes containment between capture and the later click, the overlay can close or restore focus while the Add action is still completing. `[SOURCE: file:src/views/overlay-stack.ts:190-215]`

### Scenario B — Add succeeds, then the first new-row dropdown looks frozen

The dropdown factory creates custom option buttons. On open, `syncActiveOption(true)` focuses the active option and calls `row.scrollIntoView({block:"nearest"})`; keyboard navigation repeats this path. `[SOURCE: file:src/views/dropdown-field.ts:226-241]` A focus scroll can move an ancestor or trigger host keyboard behavior even though no native select picker is involved. The initial listbox is normally a child of the sheet's `.note-database-container`, not a separate body portal: `[SOURCE: file:src/views/dropdown-field.ts:379-384]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:141-161]`.

Searchable variants add a second branch: an input focus is scheduled with `setTimeout(...,0)`. `[SOURCE: file:src/views/dropdown-field.ts:298-327]` That branch can legitimately open the iOS keyboard and then race VisualViewport placement. It explains a failure that begins when the new row's field opens, not a bare Add tap.

### Scenario C — Geometry is correct eventually but wrong during the handoff

The placement loop combines immediate placement, rAF placement, window/document/VisualViewport listeners, and keyboard inset calculation. `[SOURCE: file:src/views/popover-position.ts:295-328]` `[SOURCE: file:src/views/popover-position.ts:365-437]` On a synchronous replacement, old and new generations can both have pending callbacks unless disposal is proven. WebKit's visual viewport reports make a late or stale sample credible. A panel that is temporarily too high, too low, or covered can look like a freeze even if the event handler completed.

The CSS adds another snapshot: fixed sheet max-height uses `90svh`, while JS subtracts a keyboard inset from `innerHeight`, with safe-area padding layered on top. `[SOURCE: file:styles.css:192-227]` `[SOURCE: file:src/views/popover-position.ts:365-393]` The correct fix is a single settled geometry policy, not a browser-specific native-select workaround.

### Scenario D — Host layer wins the screen point

The sheet and scrim are intentionally high-z-index body-mounted surfaces, but the host may have its own modal/keyboard layer. `[SOURCE: file:styles.css:192-244]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:315-335]` A host-layer collision is only real if `elementsFromPoint()` or the event composed path shows a non-plugin winner at the Add coordinates. Public Obsidian reports make this worth tracing, not worth assuming.

## 8. Preview Diagnostic Contract

Ship one opt-in diagnostic flag in the preview build. Use a bounded ring buffer and redact note contents; record structural identifiers, not user data. The trace must be safe to leave enabled for one reproduction and must never add broad `preventDefault`, global `touch-action`, or a new focus operation.

### Required event schema

Each record should include:

- `traceId`, monotonic timestamp, build/version, iOS/WebKit user-agent summary, reduced-motion state, and surface kind (`filter`/`sort`);
- `panelGeneration`, stable panel ID, connected status, current live-panel ID, and action ID;
- pointer/touch/click event type, `pointerId`, target tag/role/class token, `composedPath` tokens, `cancelable`, `defaultPrevented`, capture target, and button coordinates;
- Add action start/end, state-save, render start/end, old-panel removal, new-panel mount, refresh, overlay dismissal reason, rAF callback generation, and disposer execution;
- `activeElement` token plus `focusin`/`focusout`, focus options, `scrollTop/clientHeight/scrollHeight` for document/app/sheet/options containers;
- `scrollIntoView` target/options/caller marker and pre/post target/panel/viewport rects;
- `innerWidth/innerHeight`, VisualViewport width/height/offsetTop/offsetLeft/scale, keyboard inset CSS variable, safe-area computed padding, computed max-height, and transition state;
- `elementFromPoint`/`elementsFromPoint` structural stack, z-index, pointer-events, host ancestor tokens, and a long-task/frame-time marker where available.

### Expected trace order and classification

The preview reducer should classify the first reproduction into one branch:

| Branch | Observable trace | First fix candidate |
|---|---|---|
| A — lifecycle | No click, disconnected/stale target, duplicate action, or render/refresh against old generation | Stable shell/generation gate and explicit teardown. |
| B — overlay | Capture sees target outside live panel or closes/restores focus during Add handoff | Defer/guard outside dismissal and unregister old surface first. |
| C — viewport | Add completes, then VisualViewport/keyboard or two generations move panel before stable frames | One placement owner and settled usable-height contract. |
| D — focus/scroll | `focus`/`scrollIntoView` changes non-local scroll or active element immediately before the symptom | `preventScroll`, local bounded scroll, and stale-timeout cancellation. |
| E — host/gesture | Hit-test winner is host layer, or pointercancel/capture/overscroll occurs before click | Host-layer contract or role-scoped gesture adjustment. |

The trace should be collected with keyboard initially closed and open, searchable and non-searchable controls, reduced motion on and off, and no other plugins. A successful trace should show Add completion, one current generation, stable panel rects for at least two frames, and the expected hit-test winner.

## 9. Fix Design Principles

1. **Make surface ownership explicit.** A panel generation owns its rAFs, VisualViewport/window listeners, timers, overlay registration, focus trap, and dropdowns. Teardown must be idempotent and happen before old DOM removal. This follows the official lifecycle ownership principle: [Obsidian lifecycle management](https://docs.obsidian.md/plugins/guides/lifecycle-management).
2. **Prefer continuity over destructive replacement.** Keep the sheet shell and its overlay identity stable while replacing only the keyed rule row subtree. If full replacement is required, use an action/generation token and reject events/callbacks from prior generations.
3. **Separate action completion from viewport settling.** Save/render/refresh may complete synchronously, but final placement should be owned by the current generation and based on a settled viewport sample. Do not let old and new rAF loops write geometry concurrently.
4. **Treat focus as a deliberate scroll request.** Use `focus({preventScroll:true})` for panel or option focus where accessibility permits, then scroll only the nearest intended local container. Cancel delayed searchable-input focus when its generation is gone.
5. **Keep browser gesture policy narrow.** Retain handle-only `touch-action:none` and panel `overscroll-behavior:contain` unless a trace proves otherwise. Never globally suppress touch or make a listener non-passive as a blind fix.
6. **Make animation completion non-essential.** Preserve the entrance forced layout. If later code needs a completion signal, use `transitionend` as an optimization with a timeout/rAF and final-state assertion, including reduced-motion.

## 10. Recommended Preview-to-Fix Sequence

1. Ship the diagnostic contract without changing event cancellation or focus behavior.
2. Reproduce bare Add condition and Add sort with keyboard closed; then open the new row's ordinary and searchable controls.
3. If Branch A/B appears, fix generation/ownership and overlay dismissal first; re-run before touching viewport CSS.
4. If Branch C/D appears, fix placement ownership, settled geometry, focus options, and local scrolling; keep the stable shell if possible.
5. If Branch E appears, document the host-layer winner and adjust only the supported surface/layer contract.
6. Use transition/reduced-motion and gesture traces as regression comparisons. Do not promote low-fit transitionend/passive/native-select hypotheses without a trace.

## 11. Recommendations

The recommended implementation order is:

- **P0 — instrument, then stabilize the lifecycle:** add generation IDs and idempotent teardown; keep the sheet/overlay shell stable or gate a single Add action; ensure `actions.refresh()` cannot leave old placement callbacks writing into a new panel.
- **P1 — make overlay dismissal generation-aware:** resolve the live panel at capture time, defer outside dismissal across the active Add handoff, and restore focus only to a still-connected intended anchor.
- **P1 — fix the explicit focus/scroll path:** build the new listbox before focusing; use `preventScroll`; only perform bounded local option scrolling when required; cancel stale searchable-input timers.
- **P1 — unify usable-height calculation:** choose one current-generation placement owner, separate safe-area padding from keyboard inset, and wait for stable VisualViewport samples before final geometry.
- **P2 — verify host and gesture conditions:** use hit-testing to decide whether a host layer or gesture arbitration is implicated; keep `touch-action` role-scoped and do not alter passive behavior without evidence.
- **P2 — preserve motion safeguards:** keep the forced layout entrance and reduced-motion branch, but make any future animation cleanup final-state/timer-safe rather than event-only.

## Eliminated Alternatives

| Alternative | Evidence-based disposition |
|---|---|
| Ordinary bottom-sheet dropdown is an independent body portal | **Eliminated for the default path.** The ordinary dropdown host resolves to the closest `.note-database-container`, and the sheet mount supplies that class. `[SOURCE: file:src/views/dropdown-field.ts:379-384]` `[SOURCE: file:src/views/mobile-bottom-sheet.ts:141-161]` Modal/settings branches remain separate host cases. |
| iOS native `<select>` picker is freezing the new row | **Eliminated for this control.** The row uses custom button/listbox elements. `[SOURCE: file:src/views/dropdown-field.ts:187-195]` `[SOURCE: file:src/views/dropdown-field.ts:260-295]` |
| Missing `transitionend` is directly stranding Add cleanup | **Eliminated as a current direct cause.** No inspected Add/placement path registers a `transitionend` consumer; reduced motion can also remove the event. `[SOURCE: file:src/views/popover-position.ts:295-328]` `[SOURCE: file:styles.css:880-910]` |
| Same-frame entrance class swap collapses the sheet animation | **Eliminated for the inspected entrance path.** `getBoundingClientRect()` is read between the start and visible classes. `[SOURCE: file:src/views/mobile-bottom-sheet.ts:100-115]` |
| There is no VisualViewport listener | **Eliminated.** The code subscribes and coalesces placement to rAF. `[SOURCE: file:src/views/popover-position.ts:295-328]` The remaining issue is timing/ownership, not absence. |
| Keyboard is the cause of every Add tap | **Eliminated as a universal explanation.** Add itself does not focus an input; keyboard movement is conditional on existing keyboard state or the searchable dropdown's delayed focus. `[SOURCE: file:src/views/dropdown-field.ts:322-327]` |
| Passive-listener behavior alone explains the freeze | **Eliminated as a direct match.** The inspected path uses pointer listeners and no default cancellation contract. `[SOURCE: file:src/views/mobile-bottom-sheet.ts:510-513]` |
| Global `touch-action:none` is needed | **Eliminated and unsafe as a default fix.** Only the handle uses it; making the sheet non-scrollable would damage normal interaction. `[SOURCE: file:styles.css:262-299]` |
| WebKit transform bugs prove the root cause | **Not proof.** WebKit reports justify a secondary visual trace, but this path sets the entrance transform once and the frequent transform updates are drag-related. `[SOURCE: file:src/views/mobile-bottom-sheet.ts:423-524]` [WebKit 228333](https://bugs.webkit.org/show_bug.cgi?id=228333) |

## Divergence Map

| Pivot | What the research tested | Final disposition |
|---|---|---|
| Events → transitions | Whether the entrance fix left a same-frame or transition-event hole | Saturated low-fit; keep final-state regression trace. |
| Transitions → viewport | Whether body-portal placement and keyboard geometry can move the new panel | Retained as high-fit conditional branch; settle-generation trace required. |
| Viewport → host/gesture | Whether overscroll, capture, passive behavior, or Obsidian layers redirect the gesture | Retain capture/host hit-test branches; lower passive/global touch-action. |
| Host/gesture → focus/scroll | Whether the new row's custom control explicitly moves focus/scroll after Add | Retained as strongest post-add follow-up branch. |
| Focus/scroll → synthesis | Whether another independent source class or question remained | No unanswered research question; only operational device trace remains. |

## 12. Open Questions

No research question remains unanswered at the evidence/disposition level. The following are operational unknowns for the preview build:

- Does the real report fail before Add's click handler completes, during the panel handoff, or only after opening the new custom control?
- Does the event target remain connected and belong to the current generation at `click` and overlay capture?
- Is a keyboard already open, or does delayed searchable-input focus create the first VisualViewport transition?
- Do old and new placement callbacks both write geometry after replacement?
- Which element wins `elementsFromPoint()` at the Add control and at the newly opened option?

These are deliberately diagnostic questions, not reasons to run another research iteration. They require a real iOS Obsidian reproduction.

## 13. Confidence and Limitations

Confidence is high for the code facts: synchronous panel replacement, document capture, body portal, placement listeners, custom option focus, delayed input focus, and CSS geometry are directly visible. Confidence is medium for platform interaction: WebKit reports support the timing/viewport mechanisms but do not reproduce this plugin. Confidence is low for any claim about Obsidian's private modal/keyboard DOM; ecosystem issues are clearly marked as analogies.

The synthesis does not claim that the entrance fix is wrong. It says the entrance path is not sufficient to explain the remaining failure and that the highest-value next evidence is an event/DOM-generation/focus/viewport/hit-test trace.

## 14. Preview Validation Matrix

| Case | Variables | Pass condition |
|---|---|---|
| Add condition, keyboard closed | iPhone/iPad iOS WebView; normal motion | One click, one action ID, current panel remains hit-testable. |
| Add sort, keyboard closed | Same, sort renderer | Same lifecycle invariants as filter. |
| New ordinary dropdown | Custom listbox, no search input | No document/app scroll; only local option scroll if needed. |
| New searchable dropdown | Autofocus on/off; keyboard closed initially | Delayed focus is current-generation only; viewport settles; panel remains visible. |
| Keyboard already open | Search field or host input before Add | Two stable viewport frames before final placement; no old-generation write. |
| Reduced motion | `prefers-reduced-motion` on/off | Final class, rect, and hit-test are identical modulo animation timing. |
| Host comparison | No other plugins, then normal Obsidian modal context | Hit-test winner and host ancestor are explained, not inferred. |
| Gesture boundary | Stationary tap, sheet scroll, handle drag | Add tap clicks; sheet scrolls; handle drag captures only its own gesture. |

## 15. Traceability and Acceptance

The research loop produced five iteration narratives (`iterations/iteration-001.md` through `iteration-005.md`), five delta records, canonical state events, a final findings registry with 21 findings, this resource map, and this synthesis. All artifacts are inside the requested lineage directory.

Acceptance for a code fix should require:

- no stale-generation event or placement write in the preview trace;
- one Add action per user gesture and no unexpected overlay dismissal;
- stable current panel and scrim hit-testing at the action point;
- no non-local scroll from initial custom-option focus;
- searchable focus either intentionally opens the keyboard or remains disabled/canceled;
- safe-area, keyboard inset, and usable height agree across stable frames;
- reduced-motion and gesture comparisons preserve final interaction state.

## 16. References

### Local code

`src/views/filter-panel-renderer.ts`, `src/views/sort-panel-renderer.ts`, `src/views/mobile-bottom-sheet.ts`, `src/views/overlay-stack.ts`, `src/views/popover-auto-close.ts`, `src/views/popover-position.ts`, `src/views/dropdown-field.ts`, and root `styles.css` are mapped with line ranges in [resource-map.md](resource-map.md) and in each finding above.

### Web platform and WebKit

- [MDN: Using Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events)
- [W3C: Touch Events](https://www.w3.org/TR/touch-events/)
- [MDN: VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport)
- [MDN: transitionend](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)
- [MDN: focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)
- [MDN: scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)
- [MDN: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action)
- [MDN: overscroll behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Overscroll_behavior)
- [MDN: addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [MDN: `env()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env)
- [WebKit 265578](https://bugs.webkit.org/show_bug.cgi?id=265578), [237851](https://bugs.webkit.org/show_bug.cgi?id=237851), [254861](https://bugs.webkit.org/show_bug.cgi?id=254861), [226689](https://bugs.webkit.org/show_bug.cgi?id=226689), [240917](https://bugs.webkit.org/show_bug.cgi?id=240917), [228333](https://bugs.webkit.org/show_bug.cgi?id=228333), [304741](https://bugs.webkit.org/show_bug.cgi?id=304741), [242510](https://bugs.webkit.org/show_bug.cgi?id=242510)

### Obsidian ecosystem

- [Obsidian lifecycle management](https://docs.obsidian.md/plugins/guides/lifecycle-management)
- [Tasks issue #3989](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3989)
- [Obsidian help issue #237](https://github.com/obsidianmd/obsidian-help/issues/237)
- [Obsidian Kanban](https://github.com/Trietment/obsidian-kanban)

## 17. Convergence Report

- Decision: **converged**.
- Iterations: 5 completed; minimum was 3.
- Threshold: `0.05`; final ratio `0.04`.
- Ratios: `0.82, 0.63, 0.46, 0.24, 0.04`.
- Key questions: 5/5 dispositioned.
- Source diversity: repository, MDN/W3C, WebKit, and Obsidian ecosystem all present.
- Findings: 21; ruled-out alternatives preserved in the required table.
- Remaining uncertainty: operational device trace only; no further research frontier.
- Scope: no nested dispatch, no repository/spec write-back, and no writes outside this lineage directory.
