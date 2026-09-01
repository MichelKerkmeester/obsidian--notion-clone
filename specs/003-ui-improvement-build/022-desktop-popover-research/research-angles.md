# Research angles — desktop dropdowns and popovers

Operator-confirmed on screen. The target is twofold: **Notion**, and the plugin's OWN column menu,
which the operator singled out as correct. That menu is not a redesign target — it is the internal
pattern that already works and is not applied consistently.

## THE GOOD REFERENCE (do not redesign this)

`column-menu.ts:464,551` calls the shared positioner with explicit, tight sizing:
`{ preferredWidth: 292, minWidth: 292, maxWidth: 292, preferredSide: "right", gap: 6 }`.
Result: ~292px, hairline-divided groups, `[icon][label]` rows with an optional trailing value,
tight rhythm, rounded container. Notion's column menu and view-settings panel are the same grammar
at 275-390px.

## FOUR ROOT CAUSES TO TEST, NOT ASSUME

**A — Width is opt-in, and most callers never opted in.**
`preferredWidth` defaults to 520 in the positioner. Thirty-three call sites exist; roughly thirteen
pass no options at all — `toolbar-renderer.ts` (10 sites), `view-config-panel-renderer.ts` (5),
`sort-panel-renderer.ts`, `filter-panel-renderer.ts`, `column-manager-renderer.ts`. The observed
"More tools" popover is ~535px for four short items, consistent with the 520 default plus padding.
QUESTION: should the default shrink, should sizing become required, or should width derive from
content with a hard cap? What breaks in each case for the wide-by-design surfaces
(`chart-toolbar-renderer.ts` asks for 520/560)?

**B — The visible-bounds clamp targets the wrong element.**
`getVisiblePopoverBounds` clamps to `.app-container` or `.workspace`. `.workspace` INCLUDES the
right sidebar, so a popover overlapping the sidebar is behaving exactly as written.
QUESTION: what is the correct clamp target — the active workspace leaf, `.workspace-split.mod-root`,
or the database container itself? Which one survives split panes, popped-out windows, and the
embedded-in-a-note case where the scroll container lives on the host document?

**C — There is no shared menu-row component.**
Rows are centre-aligned in one popover and left-aligned in another; some items carry icons and
their siblings do not; there is no consistent `[icon][label][trailing value][chevron]` grammar; and
dropdown rows show no pointer cursor on hover.
QUESTION: what is the minimum row/section primitive that the column menu, the view-settings panel,
the toolbar menus and the cell editors can all consume without regressing the one surface that is
already right?

**D — Anchored placement is independently broken.**
The select-option editor renders roughly 500px right and 60px below its anchor cell. This is NOT
the width defect; it reproduces with correct sizing. The panel is created inside
`.note-database-container` via `getDropdownPopoverHost`, then positioned `fixed` from viewport
coordinates.
QUESTION: is the offset a containing-block problem (a transform, filter, backdrop-filter, contain
or will-change on an ancestor makes `position: fixed` resolve against that ancestor rather than the
viewport), a scroll-offset problem in the horizontally scrolling table, or a wrong-anchor problem?
Reproduce and identify which, with evidence, before proposing a fix.

**E — Native menus break the family.**
The board card "Move to…" menu is still a native Obsidian `Menu` and looks nothing like the custom
popovers sitting beside it. Eleven `new Menu(` sites remain across ten files.
QUESTION: given the operator has decided native menus are replaced, what is the smallest owned
primitive that covers all 55 `addItem` calls, 16 separators, and the three hierarchical submenu
triggers that currently reach `MenuItem`'s undocumented private `.dom` field?

## RULES

Every load-bearing claim needs a current-branch `file:line`. Mark inference as inference. Do not
propose a redesign of the column menu; explain what it does right and how to generalise it.
