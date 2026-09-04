# Resource Map — codex-luna

This map was emitted during synthesis. No resource map was present at initialization. All paths below are read-only research inputs; the only write surface was this lineage directory.

## Local repository evidence

| Area | Files and line ranges | Why it matters |
|---|---|---|
| Add render lifecycle | `src/views/filter-panel-renderer.ts:143-220`; `src/views/sort-panel-renderer.ts:51-119` | Add handlers save state, synchronously remove/recreate the panel, then refresh. |
| Sheet ownership and entrance | `src/views/mobile-bottom-sheet.ts:100-115,141-204,241-335,423-524` | Body portal, scrim, live-panel cleanup, entrance classes, and pointer gesture ownership. |
| Overlay dismissal | `src/views/overlay-stack.ts:137-215`; `src/views/popover-auto-close.ts:39-59` | Live panel resolution, document-capture pointerdown, outside dismissal, and focus restoration. |
| Placement and keyboard | `src/views/popover-position.ts:98-170,295-328,365-437,682-748` | Fixed sheet placement, rAF/VisualViewport listeners, keyboard inset, and overscroll. |
| New-row controls | `src/views/dropdown-field.ts:187-372` | Custom listbox buttons, active-option focus, `scrollIntoView`, and delayed search-input focus. |
| CSS geometry and motion | `styles.css:164-174,180-227,237-299,320-356,710-727,880-910` | Transitions, `svh`, safe-area padding, scrim/handle hit areas, reduced motion, and entrance state. |

## Browser standards and platform evidence

| Class | Source | Used for |
|---|---|---|
| MDN / standard | [Touch events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events); [W3C Touch Events](https://www.w3.org/TR/touch-events/) | Touch-to-mouse/click synthesis and default-action timing. |
| MDN | [Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events); [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action); [overscroll behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Overscroll_behavior) | Gesture arbitration, pointer cancellation, and scroll chaining. |
| MDN | [transitionend](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event) | Conditions in which a transition event is absent or canceled. |
| MDN | [VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport); [VirtualKeyboard API](https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API) | Keyboard/visual viewport changes and usable-height diagnostics. |
| MDN | [HTMLElement.focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus); [scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) | Focus scrolling, `preventScroll`, and ancestor scrolling. |
| MDN | [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener); [viewport meta](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport); [CSS `env()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) | Listener options, layout/visual viewport context, and safe-area variables. |
| WebKit | [265578](https://bugs.webkit.org/show_bug.cgi?id=265578); [237851](https://bugs.webkit.org/show_bug.cgi?id=237851); [254861](https://bugs.webkit.org/show_bug.cgi?id=254861); [226689](https://bugs.webkit.org/show_bug.cgi?id=226689) | Delayed, stale, or noisy VisualViewport/keyboard measurements on iOS/iPadOS. |
| WebKit | [240917](https://bugs.webkit.org/show_bug.cgi?id=240917) | iOS pointer-cancel behavior under a touch-action condition; used as a negative control/conditional lead. |
| WebKit | [228333](https://bugs.webkit.org/show_bug.cgi?id=228333); [304741](https://bugs.webkit.org/show_bug.cgi?id=304741); [242510](https://bugs.webkit.org/show_bug.cgi?id=242510) | Transform-transition jank/flicker and reduced-motion comparison branches. |

## Obsidian ecosystem context

| Source | Use and limitation |
|---|---|
| [Obsidian lifecycle management](https://docs.obsidian.md/plugins/guides/lifecycle-management) | Official ownership/cleanup guidance; does not expose private mobile layer internals. |
| [Tasks #3989](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3989) | iOS dropdown/modal button movement analogy; not proof of this plugin's cause. |
| [Obsidian help #237](https://github.com/obsidianmd/obsidian-help/issues/237) | iPadOS input-method focus-loss analogy; not a WebKit reproduction for this code. |
| [Obsidian Kanban](https://github.com/Trietment/obsidian-kanban) | Release-history analogies for iPhone keyboard, panning, and bottom-sheet fixes. |

## Coverage and gaps

- Covered source classes: repository code, MDN/W3C standards, WebKit bug reports, and Obsidian ecosystem reports.
- Remaining gap: no live iOS Obsidian device trace and no public source for Obsidian's private modal/keyboard DOM.
- The synthesis therefore ranks code fit and defines a preview diagnostic; it does not claim that a WebKit bug alone is the root cause.
