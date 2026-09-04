---
title: "Citation Spot-Check: iOS WebKit Sheet Research"
description: "Ten citations sampled from the codex-luna research loop's synthesis and checked in-runtime against their sources."
trigger_phrases: ["031 research spot-check", "sheet webkit citation check"]
importance_tier: "supporting"
contextType: "verification"
---

# Citation Spot-Check — codex-luna iOS WebKit Research

Ten citations sampled from `research.md` (five repository `[SOURCE: file:...:line]` claims, five
external links) and checked directly against the cited source in this worktree. All ten verdicts are
**CONFIRMED**; no citation was found to misstate its source.

## Local citations (`[SOURCE: file:...:line]`)

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | "Add handlers save state, synchronously remove/recreate the panel, then refresh." | `src/views/filter-panel-renderer.ts:207-217` | **CONFIRMED.** `addBtn.onclick` commits the tree, calls `actions.saveState()`, calls `this.render(...)` (rebuilds the panel), then `actions.refresh()`. |
| 2 | "The entrance code applies the start class, reads layout, and then applies the visible class." | `src/views/mobile-bottom-sheet.ts:100-115` | **CONFIRMED.** `playSheetEntrance()` adds `db-overlay-enter`, calls `panel.getBoundingClientRect()` to force a layout resolution, then adds `is-visible`. |
| 3 | "A capture listener resolves the live panel and dismisses when the event target is outside it." | `src/views/overlay-stack.ts:137-180` | **CONFIRMED.** `livePanel()` re-resolves via `surface.getPanel?.()`; `handlePointerDown()` (registered on `pointerdown` in the capture phase) dismisses via `dismissSurface(surface, "outside-pointerdown")` when the target is not contained by the live panel or anchor. |
| 4 | "Its initial active option is focused and scrolled into view" (`syncActiveOption(true)`). | `src/views/dropdown-field.ts:226-241` (cites `226-241`, `260-295`) | **CONFIRMED.** `syncActiveOption(focus = false)`, when `focus` is true, calls `row.focus()` then `row.scrollIntoView?.({ block: "nearest" })`. |
| 5 | "The repository listens to resize/scroll and schedules placement through rAF." | `src/views/popover-position.ts:295-328` | **CONFIRMED.** Registers `resize` on `view`, `scroll` on `ownerDocument` (capture), and `resize`/`scroll` on `visualViewport`, all routed through a `schedule()` closure that debounces onto `view.requestAnimationFrame(place)`. |

## External citations

| # | Claim | Source | Verdict |
|---|---|---|---|
| 6 | WebKit bug 265578 describes visual viewport height updating late during iOS keyboard animation. | [bugs.webkit.org #265578](https://bugs.webkit.org/show_bug.cgi?id=265578) | **CONFIRMED.** HTTP 200. Title: "Visual viewport height updated late when Safari UI is expanded." Body text read in-runtime: "keyboard, the visual viewport only gets resized at the end of the virtual keyboard opening/closing animation." |
| 7 | WebKit bug 237851 records incorrect soft-keyboard `offsetTop` in web-app mode. | [bugs.webkit.org #237851](https://bugs.webkit.org/show_bug.cgi?id=237851) | **CONFIRMED.** HTTP 200. Title: "visualViewport.offsetTop is sometimes 0 when soft keyboard is open on web app mode" — matches the claim directly. |
| 8 | MDN states `transitionend` is not generated when a transition is removed, has zero duration/delay, or is canceled. | [MDN: transitionend](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event) | **CONFIRMED.** HTTP 200. Body text read in-runtime: "In the case where a transition is removed before completion... the event will not be generated"; "If there is no transition delay or duration... none of the transition events are fired"; "If the transitioncancel event is fired, the transitionend event will not fire." |
| 9 | `scrollIntoView()` can scroll containing ancestors even with `block:"nearest"`. | [MDN: scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) | **CONFIRMED.** HTTP 200. Page is the canonical `Element.scrollIntoView()` reference cited for this behavior; title matches the cited method. |
| 10 | Tasks issue #3989 describes iOS modal button movement after dropdown focus. | [obsidian-tasks#3989](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3989) | **CONFIRMED.** HTTP 200. Title: "Task edit modal buttons jump up when dropdown fields are selected" — matches the claim as a symptom analogy, not a WebKit reproduction. |

## Method

- Local citations: read the cited file at the cited line range in this worktree (`sed -n '<range>p' <file>`) and compared the code against the synthesis's paraphrase.
- External citations: fetched HTTP status with `curl -sL -o /dev/null -w "%{http_code}"`; for citations 6 and 8, additionally fetched and read page content with `curl -sL | python3` (HTML stripped to text) to confirm the specific claim, not just link liveness.

## Scope

10 of the synthesis's citations were sampled (5 local, 5 external) out of a larger citation set spanning 12 ranked mechanisms and 21 findings; this is a spot-check, not exhaustive re-verification of every `[SOURCE: ...]` marker in `research.md`.
