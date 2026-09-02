---
title: "Implementation Summary: Sheet Menu Grammar and Motion"
description: "What changed, in which file, and the evidence each change is carrying."
trigger_phrases:
  - "027 implementation summary"
  - "sheet menu grammar changes"
importance_tier: "critical"
contextType: "implementation"
---
# Implementation Summary: Sheet Menu Grammar and Motion

<!-- SPECKIT_TEMPLATE_SOURCE: implementation-summary | v2.2 -->

<!-- ANCHOR:how-delivered -->
**State: shipped in the working tree, verified, not committed, not operator-confirmed.**
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:what-built -->
## 1. THE CHANGES

### `styles.css` — CSS lane held as `027`, taken free, released

| Change | Why |
|---|---|
| `--db-sheet-enter: 260ms` and `--db-menu-row-gap: 8px` on the token root | One duration for the sheet and the backdrop it arrives with; one gap the row and its divider inset both read |
| `.db-mobile-sheet-scrim` added to the token-root selector list | The backdrop is a bare div on the body, outside every other surface in that list. Without it the only way to give it the duration was to repeat the literal |
| `justify-content: flex-start` on `.db-menu-item.db-menu-item` | The one declaration the host's `button` rule was supplying. This is the whole of report 1 |
| `gap` on that rule switched to the token | The divider inset derives from it; two literals would drift |
| `.db-mobile-bottom-sheet .db-menu-item::after` hairline, gated on `:has(+ .db-menu-item)` | Report 2's dividers. Drawn on the row so a caller cannot forget it, `::after` rather than a border because the row carries a rounded highlight that would clip one |
| `--db-menu-divider-inset`, overridden for rows with a check slot | Two row shapes have two label columns; one number would put a hairline through the middle of one of their icon gutters |
| `.db-mobile-bottom-sheet.db-overlay-enter` rewritten: `opacity: 1`, `translate3d(0, 100%, 0)`, `transition: none` | The full-height start state, and the transition removed from the rule that *introduces* it — otherwise the step into the start state interpolates too |
| `.db-mobile-bottom-sheet.db-overlay-enter.is-visible` carries the transition | The transition belongs to the state being moved to |
| `@keyframes db-sheet-scrim-in` + `animation` on the scrim | The dim arrives with the sheet instead of a frame before it |
| `.db-mobile-sheet-scrim { animation: none }` inside the reduced-motion block | An animation ignores a transition reset, so it needed naming separately |
| `overflow-x: hidden !important` on `.db-mobile-bottom-sheet` | Report 6. Declaring only `overflow-y` couples the other axis to it |
| `.db-mobile-bottom-sheet.db-mobile-bottom-sheet { z-index: … !important }` | Report 5. Beats the two later same-`!important` rules on specificity rather than on position |

### `src/views/mobile-bottom-sheet.ts`

- **`playSheetEntrance(panel)`** — adds the start class, commits it by reading a layout property,
  then flips synchronously. This is what makes the entrance run at all.
- **`attachSheetDragToDismiss` is last-wins per panel**, through a module-level `WeakMap` of
  disposers. The positioner now wires a generic gesture on every sheet it presents, and the record
  panel wires its own afterwards; without this the record sheet would carry two and one drag would
  answer with two closes.

### `src/views/owned-menu.ts`

- Uses `playSheetEntrance`. The frame-scheduled flip it replaced is gone, along with the now-unused
  `view` binding.

### `src/views/popover-position.ts`

- Uses `playSheetEntrance` **on the sheet branch only**. The anchored branch keeps its
  frame-scheduled flip: it has the same never-runs defect, and a desktop popover starting to animate
  for the first time is not this phase's change to make silently.
- Attaches drag-to-dismiss to every sheet it presents, closing through
  `overlayStack.dismissPanel(panel)` — the same close the backdrop and Escape already run through.
  A panel that never registered springs back rather than being left parked below the screen.
- Releases the gesture in the existing `cleanup`.

### `tools/storybook/verify-placement.mjs`

- **`HOST_BARE_CONTROLS`** — Obsidian's `button` rule, verbatim from `app.css`, loaded on all 17
  pages. This is the durable change; the rest of the file's checks now run against a document that
  contains what the device contains.
- New section **5c-iii**: the row grammar, driven through the shipped `ColumnMenu` and
  `ToolbarRenderer.showAddViewMenu`, 11 checks.
- New section **5c-iv**: the entrance, on the one page in the file that lets motion run, plus a
  reduced-motion counterpart. 5 checks.
- `ColumnMenu` added to the bundle's exports.
- Two pages were missing `reducedMotion: "reduce"`; both now have it.

### `tools/screenshots/scenarios/chrome.mjs`

- New `chrome-owned-menu-sheet` scenario: the phone presentation of the owned menu, showing the
  left column, the hairlines, the chevron row and an icon-less row. Its own note states what it
  proves and what it does not.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:verification -->
## 2. EVIDENCE

| Gate | Baseline | After |
|---|---|---|
| `npx tsc --noEmit` | exit 0 | exit 0 |
| `npx vitest run` | 444 | 444 |
| `npm run storybook:placement` | 186/190, 4 declared reds | **202/206, the same 4 declared reds** |
| `npm run screenshots:verify` | 224 current | **228 current**, none blank or theme-identical |
| `evidence --check-all` | 8/8 | 8/8, all re-run |
| `npm run gate` | 14 green | **13 green, 1 red** — `comments`, owned by another agent's untracked `tools/bench/` files |

*2026-09-02: that gate row is a past run, not the current gate.* `tools/gate.mjs` declares **25**
lanes today, so 14 was the roster at the time and neither figure describes what `npm run gate` runs
now. The row is kept as the measurement it was; re-reading this phase against the gate means running
it again rather than comparing to 14.

Each of the 16 new checks was confirmed to go red against the reverted code, and that same run turned
five pre-existing alignment checks red as well. Those five are the packet's central finding and are
tabulated in `acceptance-criteria.md` §4.

Twenty-three capture files changed. The new sheet scenario and the record-detail sheet were opened
and inspected; the record sheet is unchanged in appearance, and the new one shows the intended
grammar.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 3. WHAT IS STILL OPEN

- **Operator confirmation on a phone.** Everything here is a browser measurement of the shipped
  modules; it is not the device.
- **The Add-view form above the create rows.** The rows are fixed. Whether the fields, captions and
  checkbox above them want the same treatment is a design question, not a defect, and it is wider
  than what was reported.
- **The desktop popover entrance.** Same defect, deliberately untouched. Worth a decision rather than
  a drive-by.
<!-- /ANCHOR:limitations -->
