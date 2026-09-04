# Iteration 005 — focus, custom listbox scroll, and viewport units

## Focus

Trace what happens after an Add action when the user opens or changes the first control in the newly rendered rule. The key distinction is that this repo renders custom button/listbox controls, not native `<select>` elements, and those controls deliberately focus and scroll the active option.

## Actions Taken

1. Read the renderer's `panel.focus()` calls, the custom dropdown host/options, active-option synchronization, searchable input timeout, and overlay focus restoration.
2. Rechecked sheet CSS max-height, `svh`, safe-area padding, and JS keyboard/viewport placement.
3. Compared focus/scroll behavior with MDN and with public Obsidian plugin reports about iOS dropdown focus, modal buttons, keyboard panning, and input-method focus loss.

## Findings

### F-017 — focusing the rebuilt panel can scroll the document/viewport (fit 2/5, confidence 0.86)

Both renderers call `panel.focus()` immediately after creating the new panel and before rendering all rule rows. Unlike `overlay-stack`'s focus restoration, these calls do not pass `{preventScroll:true}`. MDN documents that `HTMLElement.focus()` can be invoked with `preventScroll`; the default behavior may scroll the focused element into view. For a fixed body-mounted panel this is unlikely to open the keyboard, but it can change scroll anchoring or trigger a VisualViewport/host placement cycle precisely while the new panel is being measured. `[SOURCE: file:src/views/filter-panel-renderer.ts:166-182]` `[SOURCE: file:src/views/sort-panel-renderer.ts:77-92]` `[SOURCE: file:src/views/overlay-stack.ts:204-207]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus]`

Preview diagnostic: log focusin/focusout, activeElement before/after render, `panel.focus()` call time, `scrollTop` for document/app container/sheet, VisualViewport metrics, and panel rect over two rAFs. Record whether `document.activeElement === currentPanel` and whether the focus call changed any scroll position.

Fix direction: focus the stable sheet shell with `{preventScroll:true}` after rows are built, then restore the saved sheet scrollTop. If accessibility requires a specific new control to receive focus, focus it with `preventScroll:true` and perform a deliberate local scroll only when it is outside the sheet's visible content box.

### F-018 — active-option focus plus `scrollIntoView` is the strongest post-add interaction trigger (fit 4/5, confidence 0.88)

The new rule's “select” is a custom dropdown button. Opening it creates a listbox and calls `syncActiveOption(true)`, which focuses the selected option and calls `row.scrollIntoView({block:"nearest"})`; keyboard navigation repeats the same operation. This is not a native iOS `<select>` picker issue. It is a focus/scroll operation on a newly created, possibly transformed or fixed descendant of a body-mounted scroll container. MDN confirms that `scrollIntoView()` may scroll containing ancestors and that `block:"nearest"` minimizes movement but does not guarantee that no ancestor/visual viewport will move. `[SOURCE: file:src/views/dropdown-field.ts:187-195]` `[SOURCE: file:src/views/dropdown-field.ts:226-241]` `[SOURCE: file:src/views/dropdown-field.ts:322-327]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus]`

Preview diagnostic: in development only, wrap `Element.prototype.scrollIntoView` to log caller target, connected state, nearest scroll container, pre/post `scrollTop`, target/panel rects, activeElement, keyboard/VisualViewport metrics, and current generation. Log a focus sequence (`pointerdown → focusin → scroll → visualViewport → click`) and flag any scroll outside the sheet or any option from an obsolete generation.

Fix direction: avoid `scrollIntoView` for initial listbox activation when the active row is already inside the local options viewport; otherwise use an explicit local options-container scroll calculation and `focus({preventScroll:true})`. Keep `block:"nearest"` only as a fallback, and reject calls for disconnected/stale generations.

### F-019 — searchable-dropdown delayed input focus can legitimately invoke the keyboard (fit 3/5, confidence 0.87)

For searchable dropdowns, the code schedules `searchInput.focus()` with `setTimeout(..., 0)` after creating and positioning the popup. That focus is intentionally delayed beyond the Add/render task, so it can race the sheet's next-frame placement and iOS keyboard animation. It is a strong explanation for a freeze/jump observed only after opening a large-options field, but not for a bare Add tap. `[SOURCE: file:src/views/dropdown-field.ts:187-212]` `[SOURCE: file:src/views/dropdown-field.ts:298-327]` `[SOURCE: file:src/views/popover-position.ts:295-328]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport]`

Preview diagnostic: tag the timeout with panel/dropdown generation; record focus time, activeElement, whether the keyboard height CSS variable changes, VisualViewport resize/scroll, panel bottom/max-height, and final hit-test at the input/options row. Compare with a searchable dropdown whose autofocus is disabled.

Fix direction: let the dropdown open and settle the sheet for one or two frames before focusing the search field; then re-place from the settled viewport. Provide an explicit user setting/feature flag for autofocus in preview, and never let a stale timeout focus a removed input.

### F-020 — `svh`/safe-area are geometry amplifiers, not native-select bugs (fit 3/5, confidence 0.82)

The sheet CSS uses `90svh`, `env(safe-area-inset-bottom)`, and a keyboard-bottom custom property; JS also computes a max-height from `innerHeight - keyboard`. MDN documents safe-area environment variables as device-dependent space reservations, while the meta viewport guidance distinguishes visual and layout viewport behavior. A mismatch can leave the panel visible but put the new control or bottom action outside the effective hit-test/scroll box. This overlaps F-011 and should be fixed through one settled height authority, not a new native-select workaround. `[SOURCE: file:styles.css:180-227]` `[SOURCE: file:src/views/popover-position.ts:365-393]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env]` `[SOURCE: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport]`

Preview diagnostic: log CSS and JS viewport values, computed max-height/padding-bottom, content/client/scroll heights, panel and control rects, safe-area inset, keyboard inset, and `elementsFromPoint` at the control center.

Fix direction: expose one settled usable-height variable, keep safe-area padding separate from keyboard offset, and test `svh`/`dvh` on the target Obsidian WebView before changing units.

### F-021 — Obsidian ecosystem evidence supports focus/keyboard amplification (fit 3/5, confidence 0.73)

A current Tasks plugin issue reports that tapping a dropdown in an iOS task-edit modal moves the modal buttons because a `:focus-within` rule adds keyboard accommodation even for a status dropdown that does not open the keyboard. A separate Obsidian help report describes iPadOS input-method focus loss. These are analogous host symptoms, not proof of this repo's root cause, but they justify treating “dropdown focus invokes host mobile layout” as a first-class preview branch. `[SOURCE: https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3989]` `[SOURCE: https://github.com/obsidianmd/obsidian-help/issues/237]` `[SOURCE: https://github.com/Trietment/obsidian-kanban]`

Preview diagnostic: report whether the failure reproduces with no other plugins, with a native Obsidian modal open, and with the custom listbox's initial focus/autofocus disabled. Include the host class/ancestor and keyboard CSS variable at each focus transition.

Fix direction: do not use `:focus-within`-style host assumptions for this sheet; classify text-input focus separately from button/listbox focus and coordinate with the host layer through the supported surface.

## Questions Answered

- Q1: answered with a disposition, not a root-cause claim. The synchronous remove/recreate/refresh and overlay capture are the highest-fit Add-tap mechanisms; a generation-tagged event trace is the diagnostic gate.
- Q2: answered. Forced-layout entrance and absence of transitionend consumers make transition lifecycle a low-fit direct cause; retain event sampling as a regression guard.
- Q3: answered with a conditional disposition. Body-portalled placement plus iOS VisualViewport/keyboard timing and old/new rAF overlap is high-fit when a keyboard/host viewport transition is present; settle-and-generation diagnostics confirm it.
- Q4: answered. Passive listeners and global touch-action are low-fit; gesture arbitration, capture dismissal, and a private host-layer hit-test collision are conditional medium-fit branches.
- Q5: answered. Custom active-option focus/scrollIntoView is the strongest post-add follow-up trigger, searchable-input autofocus is next, and panel.focus/viewport units are amplifiers.

## Questions Remaining

- No unanswered research question remains. The only operational unknown is the device trace that selects among the ranked branches.

## Assessment

`newInfoRatio=0.04`. The remaining information is confirmatory and convergent: the new-row control is custom, focus/scroll operations are explicit, and the preview diagnostics now cover event identity, placement generations, hit-testing, focus, viewport, and host layers. All source-diversity guards pass, with public Obsidian reports clearly labeled as analogy.

## Reflection

The likely user-visible sequence is not “iOS cannot click a button.” It is either (a) the Add gesture crossing a destructive DOM handoff and outside-dismissal boundary, or (b) Add succeeding and the first custom dropdown focus/scroll causing a viewport/host-layer move that makes the sheet look frozen. One preview trace can separate these.

## Recommended Next Focus

Synthesis is now legal at the configured 0.05 threshold: write the ranked mechanism matrix, the single preview instrumentation contract, fixes in priority order, eliminated alternatives, and explicit confidence/unknowns.

## Ruled Out / Dead Ends

- Native iOS `<select>` picker behavior is not the current control: the new row uses custom button/listbox elements.
- A direct transitionend failure is not supported by the inspected code because no consumer waits for the event.
- Passive-listener and global touch-action explanations are not direct matches.

## SCOPE VIOLATIONS

None. No researched repository file was modified.
