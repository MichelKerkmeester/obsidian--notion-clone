# UI/UX design review — six-lane swarm

> Six independent Sonnet 5 (xhigh) reviewers, read-only, each judging one surface against the
> `sk-design` references (`review-checklist`, `hierarchy`, `color-system`, `depth-and-detail`,
> `interaction-craft`, `motion-principles`, `ux-laws`). Scope covered both the recent UI build
> and pre-existing features. No code was changed.

**Totals:** 2 P0 · 20 P1 · 18 P2 across six lanes.

| Lane | P0 | P1 | P2 | Report |
|------|----|----|----|--------|
| Design tokens / foundations | 0 | 4 | 3 | [tokens](design-review-tokens.md) |
| Table / grid | 0 | 3 | 4 | [table](design-review-table.md) |
| Cards (board, gallery, list) | 0 | 3 | 4 | [cards](design-review-cards.md) |
| Overlays / popovers / sheets | 1 | 4 | 2 | [overlays](design-review-overlays.md) |
| Chrome / toolbar / states | 0 | 3 | 2 | [chrome](design-review-chrome.md) |
| Calendar / timeline | 1 | 3 | 3 | [temporal](design-review-temporal.md) |

## The cross-cutting finding

Four of six lanes independently reported the same shape: **a correct solution exists in this
codebase, but was applied in only some of the places it belongs.** The individual findings are
symptoms; the consistency gap is the defect.

- The record-detail panel's child editors are cleared on the mobile path
  (`CellRenderer.ts:1751`, `:2313` hardcode `zIndex: "1000"`) and not on the desktop path,
  which resolves to `--db-layer-popover: 100` and renders behind the panel.
- The touch-target floor is applied across the card views but not to the open-note button.
- Elevation tokens are disciplined in the popover layer and bypassed by the timeline, which
  defines its own `--db-timeline-event-shadow` (5 definitions, 6 usages).
- Board and gallery disagree with list on drag-indicator shadow weight.

Fixing these one at a time will not hold. The durable change is to make the shared mechanism the
only path — one layer scale, one elevation scale, one touch-target floor — and delete the
parallel ones.

## Confirmed P0s

Both were verified against the real code before being recorded here.

**Record-detail panel hides its own cell editors.** `.db-record-detail-panel` is hardcoded
`z-index: 999` (`styles.css:8783`) while the editors it hosts resolve to `--db-layer-popover: 100`
(`styles.css:116`), so children paint behind their parent. The comment above the rule asserting
children sit at 1000–1002 no longer matches the code, and the hardcoded 999 bypasses the
`--db-layer-panel: 50` token that exists for this purpose.

**Year-scale timeline renders ~20,000px wide.** Year pairs `defaultWidth: 56` with `unit: "day"`
and a `totalUnits` of the year's day count (`CalendarTimelineModel.ts:159`, `:342-351`), giving
roughly 365 x 56px of canvas. Quarter renders about 1,365px. The coarser overview is ~15x wider
per unit than the finer one, so the year view cannot serve as an overview.

## Notable P1 themes

- **Elevation is inverted at the top of the scale.** `--db-elevation-3` (alpha 0.22 / 0.14) is
  fainter than `--db-elevation-2` (0.24 / 0.16) in light mode, so the highest tier reads as less
  lifted than the one beneath it.
- **Backdrop blur is inert.** Popovers declare `backdrop-filter` while painting over an opaque
  surface, so the effect never renders.
- **Tokens are minority-consumed.** Spacing and type-scale tokens exist but raw pixel values
  dominate; opacity has no scale at all.
- **Numeric cells are not right-aligned** and do not use tabular figures, so columns of numbers
  do not align on the decimal.
- **Disabled dropdown options still show the hover highlight** — the same disabled-state problem
  reported earlier by screenshot, in a different component.

## Reading these reports

Line citations are the reviewers' own and were spot-checked, not exhaustively verified. Sampling
found the substance reliable and the line numbers not always so: in the overlays P0 one cited
line was `flex-wrap` rather than a z-index, and the mobile hardcode was four lines off. Confirm
any citation before acting on it.

Findings that need visual confirmation are listed per report and cannot be settled from source
alone — the reviewers read CSS and DOM structure, not rendered pixels.
