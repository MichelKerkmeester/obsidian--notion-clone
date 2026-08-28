# Design review — temporal lane

> Sonnet 5 (xhigh), read-only, judged against `sk-design` references. Findings are the reviewer's; line citations were spot-checked, not exhaustively verified.

## Verdict

The calendar view (month/week/day) is the more mature surface here: it has a coherent shadow-elevation model, a working roving-tabindex keyboard grid, and thoughtful overflow handling for busy days. The timeline view is visually similar on the surface (it reuses calendar event styling patterns) but was clearly built with its own, uncoordinated shadow and sizing values, and its year/quarter scale math has a real density bug that undermines the view's actual purpose. Overall: solid mid-fidelity work with one significant scale-legibility defect and a handful of clear inconsistencies between the two views that should share a system but don't.

## Findings

### [P0] Year-scale timeline requires ~20,000px of horizontal scroll to show a year
- **What**: `getTimelineColumnWidthSpec` gives year scale a per-unit default width of 56px (`src/data/CalendarTimelineModel.ts:159-160`), but for year scale `unit` is `"day"` and `totalUnits` is the day-count of the year (`CalendarTimelineModel.ts:342-351`). `CalendarTimelineRenderer.ts:263` writes this width straight into `--db-timeline-unit-width`, which `.db-timeline-body`/`.db-timeline-events` multiply by `--db-timeline-units` (`styles.css:15497,15662,15899`). Result: ~365 × 56px ≈ 20,440px of canvas for one year, while month tick labels land every 30 days ≈ 1,680px apart (`formatTimelineTickLabel`, `CalendarTimelineModel.ts:797,981-983`).
- **Where**: `src/data/CalendarTimelineModel.ts:153-168`, `342-351`; `src/views/CalendarTimelineRenderer.ts:263`.
- **Why it's wrong**: Defeats the stated purpose of a year overview — a viewport of ~1,400px shows roughly 1/15th of the axis at a time. Quarter scale, by contrast, uses 15px/day × ~91 days ≈ 1,365px — a sane width. The two scales are internally inconsistent by a factor of ~15, which is diagnosis-table.md's "layout spread thin" pattern turned inside-out (spread absurdly *wide* instead).
- **Fix**: For scales whose grid unit is "day" but whose ticks are coarser (quarter/year), either widen the tick step to match, or size `--db-timeline-unit-width` from the tick interval rather than the raw day count so year renders at a width comparable to quarter's.

### [P1] Timeline invents its own shadow scale instead of using the project's elevation tokens
- **What**: The calendar view consistently uses `var(--db-elevation-1/2/3)` for hover/move/resize states (`styles.css:14941-14947` hover, `14972-14978` moving/resizing, `15347` timed-event rest, `15362-15363` moving). The timeline view instead hardcodes its own values: `--db-timeline-event-shadow: 0 2px 7px rgba(0,0,0,.09)` at rest (`styles.css:15446-15447`), `0 4px 12px rgba(0,0,0,.13)` on hover (`16120-16124`), `0 12px 26px rgba(0,0,0,.18)` moving (`16112-16118`), `0 6px 16px rgba(0,0,0,.28)` resizing (`16195-16201`).
- **Where**: `styles.css:15446-15447, 16074-16098, 16112-16124, 16195-16201` vs. the token definitions at `styles.css:112-114` (light) and `398-400` (dark).
- **Why it's wrong**: SKILL.md's NEVER #8 and depth-and-detail.md §3 both say never mix two elevation systems in one project — it makes elevation unreadable. Worse, the dark-theme block re-tunes `--db-elevation-1/2/3` to much stronger alphas for dark surfaces (`0.30/0.45/0.48`, `styles.css:398-400`) but the timeline's hardcoded rgba values never get that recalibration, so timeline cards will look nearly flat/shadowless in dark mode while calendar cards read correctly.
- **Fix**: Replace `--db-timeline-event-shadow`'s four ad hoc values with the matching `--db-elevation-N` tokens.

### [P1] Timed-event resize handle is a 5px-tall grab zone on a card that can be 14px tall
- **What**: `.db-calendar-time-resize-handle { height: 5px; }` (`styles.css:15365-15372`) is the only grab affordance for resizing a timed event's start/end, and `EVENT_CARD_MIN_HEIGHT = 14` (`src/data/CalendarLayoutModel.ts:148`) means the shortest events render at 14px total.
- **Where**: `styles.css:15365-15372`; `src/data/CalendarLayoutModel.ts:148-149`.
- **Why it's wrong**: interaction-craft.md §3 sets 32px as the absolute floor even for dense pointer UIs. 5px is more than 6× under that, and Fitts's Law (ux-laws.md §2) says a target this small at this density is "a miss waiting to happen" — compounded here because the target sits on a card that's itself barely taller than the handle.
- **Fix**: Keep the visible handle thin but expand the hit area with a negative-inset pseudo-element (per interaction-craft.md/ux-laws.md's stated technique) to ~10-12px of actual grab tolerance without changing the card's visual height.

### [P1] Day/overflow popovers use `role="dialog"` with no focus management or Escape handling
- **What**: The month "+N" day popover (`CalendarRenderer.ts:499-502`) and the week/day all-day overflow popover (`CalendarRenderer.ts:821`) are both marked `role="dialog"`, but they open on `mouseenter`/click, close on outside-click only, never receive focus, and have no Escape-key handler — unlike the mini-calendar popover, which does wire up Escape (`CalendarRenderer.ts:1785-1789`).
- **Where**: `src/views/CalendarRenderer.ts:499-502, 821, 1785-1789`.
- **Why it's wrong**: review-checklist.md §3/§4 flags "role without required attributes" and hover-triggered interactive content unreachable by keyboard (WCAG 4.1.2, 2.1.1). A screen reader announces these as modal dialogs that a keyboard user has no way to open or dismiss.
- **Fix**: Either drop `role="dialog"` for a non-modal `role="group"`/`role="menu"` pattern, or make it a real dialog: move focus in on open, trap it, and close on Escape like the mini-calendar already does.

### [P2] `getTimelineColumnWidthSpec("day")`'s default sits below its own minimum
- **What**: `{ defaultWidth: 48, min: 60, max: 180 }` (`src/data/CalendarTimelineModel.ts:155-156`). `resolveTimelineUnitWidth` clamps to `min`, so the declared default (48) is dead — the real effective default is 60.
- **Where**: `src/data/CalendarTimelineModel.ts:155-156, 170-175`.
- **Why it's wrong**: This is exactly the "off-scale value nobody checked" failure SKILL.md's scale system exists to prevent — the stored constant doesn't match the range that governs it.
- **Fix**: Set `defaultWidth: 60` to match what's actually rendered.

### [P2] Heavy overlap is bounded in calendar, unbounded in timeline
- **What**: Month view caps visible lanes (default ≤15, `getMonthVisibleLaneLimit`, `CalendarRenderer.ts:2160-2181`) and collapses the rest into a "+N" popover. Timeline lanes give every event its own permanent row with no cap (`assignTimelineRows`, `src/data/CalendarTimelineModel.ts:764-771`).
- **Where**: `CalendarRenderer.ts:2160-2181` vs. `CalendarTimelineModel.ts:764-771`.
- **Why it's wrong**: Two different answers to the same design question ("what happens when a lot of events land in one place") inside one feature family — inconsistent, and a busy timeline group can grow arbitrarily tall with no disclosure pattern.
- **Fix**: At minimum, decide whether this is intentional (row stability during drag) and document it; consider a collapse/expand affordance for groups past a row threshold.

### [P2] `.is-today` background rules are dead code
- **What**: `.db-calendar-day.is-today { background: var(--background-primary); }` (`styles.css:14421-14423`) and `.db-calendar-week-day-col.is-today { background: transparent; }` (`styles.css:14685-14687`) both set the exact value the element already has with no class applied — there is no other rule painting a background on the base `.db-calendar-day`/`.db-calendar-week-day-col`.
- **Where**: `styles.css:14421-14423, 14685-14687`.
- **Why it's wrong**: Reads as an abandoned attempt at column/cell-level "today" emphasis. The actual signal today relies on is the circular badge on the date number (`styles.css:14425-14436`) — which is adequate on its own — but the dead rule suggests unfinished work.
- **Fix**: Either remove the no-op declarations or finish the intended treatment (e.g., a subtle tint) — see hierarchy.md's "emphasize by de-emphasizing."

## What's genuinely good

- **Multi-day continuation fades** (`styles.css:14903-14934`): the mask-image gradients that fade a spanning all-day bar into the next/previous week row are a real depth-and-detail.md-quality touch — better than a hard-cut bar.
- **Global focus ring is correctly built and correctly reaches these views**: `box-shadow`-based, respects radius, applies to `[tabindex]` and `button` alike (`styles.css:501-514`, ring defined at `styles.css:123`) — exactly interaction-craft.md's rule, and it covers the roving-tabindex grid cells and timeline event buttons without any calendar-specific override needed.
- **Keyboard grid navigation** (`src/views/CalendarKeyboardNavigation.ts:19-110`) is a clean, correct implementation of the ARIA APG grid pattern — Arrow/Home/End/PageUp/PageDown, roving tabindex, `scrollIntoView`.
- **"+N" overflow popovers for busy days** (`CalendarRenderer.ts:425-472, 776-810`) are a proper disclosure pattern rather than silent clipping, matching depth-and-detail.md §7's "break the default component shape" guidance for dense components.

## Needs visual confirmation

- `.db-calendar-month-dates` at 11px stacks `color: var(--text-muted)` with `opacity: 0.85` (`styles.css:15040-15052`) — plausibly under 4.5:1 in some Obsidian themes; can't compute without live theme values.
- `.db-calendar-week-hour-label` is `top: {offset}px; transform: translateY(-50%)` (`styles.css:14655-14663`), so the first visible hour tick is centered on row 0 and pokes half its height above the grid — may or may not visually collide with the sticky header above it.
- Timed-event drag/resize uses `mousedown`/`mousemove` exclusively (`CalendarRenderer.ts:1513` et seq.), unlike the month create-drag which explicitly uses `pointerdown`/`pointermove` (`CalendarRenderer.ts:390`). Whether this still works on Obsidian's mobile/touch webview needs a device check.
- Whether the 14px-minimum compact event card (`EVENT_CARD_MIN_HEIGHT`, `CalendarLayoutModel.ts:148`) actually renders legible text or visibly clips at that floor.
