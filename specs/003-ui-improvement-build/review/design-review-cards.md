# Design review — cards lane

> Sonnet 5 (xhigh), read-only, judged against `sk-design` references. Findings are the reviewer's; line citations were spot-checked, not exhaustively verified.

## Verdict

The card views share a coherent skeleton — same field-grid pattern, same roving-tabindex/ARIA wiring, same cover-button convention — but the new `role="row"`/`aria-keyshortcuts` interaction layer has outrun its visual affordances, and the three renderers (Board, Gallery, List) have drifted into small, verifiable inconsistencies with each other for what should be identical states (hover elevation, empty-group styling, cover placeholder size, drop-shadow tokens). None of it is unusable, but it reads as three siblings that stopped talking to each other partway through the accessibility pass.

## Findings

### [P1] "Open note" button is below the touch-target floor on every card, and the codebase's own fix wasn't applied to it
- **What**: `.db-board-card-open` and `.db-gallery-card-open` are 24×24px with `padding: 0`; `.db-list-row-open` is 26×26px, also zero padding. All three sit under both WCAG 2.5.5's 44px and `interaction-craft.md`'s 32px "dense pointer UI" floor.
- **Where**: `styles.css:8547-8552` (Board), `styles.css:9146-9151` (Gallery), `styles.css:9560-9572` (List).
- **Why it's wrong**: `review-checklist.md` §3 flags clickable elements under 44×44 as a SERIOUS accessibility finding; `interaction-craft.md` §3 says to expand hit areas with padding or a negative-inset pseudo-element, never by growing the visual box. The codebase already does exactly that for sibling controls — `.db-card-mobile-move-btn`, `.db-board-group-toggle`, `.db-gallery-group-toggle`, `.db-toolbar-icon-button`, etc. all get a `::before { inset: -8px }` hit-area expansion under `@media (pointer: coarse), (max-width: 760px)` (`styles.css:17330-17349`), but `.db-board-card-open` / `.db-gallery-card-open` / `.db-list-row-open` are not in that selector list.
- **Fix**: Add the three `-open` classes to the existing `::before { inset: -8px }` block at `styles.css:17330-17349` (and the accompanying `position: relative` list at `17270-17281`), matching the pattern already proven for `.db-card-mobile-move-btn`.

### [P1] Card hover reuses the floating-popover shadow weight, and Board/Gallery disagree on it
- **What**: `.db-board-card:hover` sets `box-shadow: var(--db-elevation-2)` for a 1px `translateY` lift. `--db-elevation-2` (`styles.css:113`, `0 10px 28px …, 0 3px 8px …`) is the exact token used for `.db-dropdown-popover`, `.db-column-menu-subpopover`, `.db-cell-option-popover`, etc. (`styles.css:340-348`, 34 usages total). `.db-gallery-card:hover` uses `var(--db-elevation-1)` for the identical gesture.
- **Where**: `styles.css:8466-8470` (Board) vs. `styles.css:9061-9066` (Gallery).
- **Why it's wrong**: `depth-and-detail.md` §3 — "choose by asking where on the z-axis does this sit... a single shadow carrying all the depth needs roughly .2; three stacked shadows each carry a fraction." Giving a resting card the same shadow weight as a modal-adjacent floating menu collapses the elevation system's meaning, and the two sibling card types now disagree about how a hover feels.
- **Fix**: Use `--db-elevation-1` for the Board card hover, matching Gallery.

### [P1] List's drag-drop indicator shadow is an off-token value, unlike Board/Gallery's
- **What**: `.db-list-row.is-drop-before`/`.is-drop-after` use a hardcoded `0 5px 16px rgba(0, 0, 0, 0.08)` third shadow layer. Gallery's equivalent state reuses `var(--db-elevation-2)` for the same semantic moment.
- **Where**: `styles.css:9410-9420` (List) vs. `styles.css:9075-9085` (Gallery).
- **Why it's wrong**: `SKILL.md` §4 Always-rule 1 — every value comes from a defined scale/token, "or each one named and justified." This is a third, un-named shadow value for one semantic state across three otherwise-parallel components.
- **Fix**: Replace the literal `rgba(...)` with `var(--db-elevation-2)` to match Gallery.

### [P2] Empty-column vs. empty-group treatment diverges across the three views
- **What**: Board's empty column slot uses an accent-tinted dashed border (`interactive-accent` 45%) plus a 3% accent background tint. Gallery/List empty-group placeholders use a plain neutral dashed border with a transparent background.
- **Where**: `styles.css:7065-7070` (Board) vs. `styles.css:7072-7078` (Gallery/List).
- **Why it's wrong**: Same semantic state — "this group/column has no cards" — rendered with two different levels of visual insistence depending on which view you're in. `hierarchy.md` calls for a deliberate tier decision, not an accidental one.
- **Fix**: Pick one treatment (the neutral dashed version is quieter and more consistent with `EmptyStateRenderer`'s general cards elsewhere) and apply it uniformly.

### [P2] Cover placeholder icon size disagrees between Board and Gallery
- **What**: `.db-board-card-cover-placeholder svg` is 24×24; `.db-gallery-cover-placeholder svg` is 28×28, for the identical "no cover image" affordance.
- **Where**: `styles.css:8597-8600` vs. `styles.css:9103-9106`.
- **Fix**: Standardize on one size (28px reads better against the larger cover area typical of both).

### [P2] Cover `cursor: zoom-in` promises an in-place preview; the click actually navigates away
- **What**: `.db-board-card-cover-button` / `.db-gallery-cover-button` set `cursor: zoom-in`, but the click handler calls `window.open(image.target)` for external images or `app.workspace.openLinkText(...)` for internal ones — a full navigation, not a lightbox.
- **Where**: cursor at `styles.css:8608`, `styles.css:9117`; handlers at `BoardRenderer.ts:911-922`, `GalleryRenderer.ts:578-585`.
- **Why it's wrong**: a cursor is a "second signal" (`SKILL.md` §4 rule 5) and here it signals a gentler interaction than what happens — especially for the external-image path, which leaves Obsidian entirely for a new browser tab.
- **Fix**: either implement an actual in-app image preview, or swap the cursor to the default pointer to match the navigation it triggers. *(Needs visual confirmation of how jarring the external-tab jump feels in practice.)*

### [P2] Draggable cards give no cursor affordance for dragging
- **What**: All three card types set `cursor: pointer` even though the whole card is `draggable = true` for reordering.
- **Where**: `styles.css:8460` (Board), `:9024` (Gallery), `:9394` (List); drag wiring at `BoardRenderer.ts:733`, `GalleryRenderer.ts` `setupReorderDrag`, `ListRenderer.ts` `setupReorderDrag`.
- **Why it's wrong**: the board's own column-header drag handle correctly uses `cursor: grab` (`styles.css:8265`); individual cards, which carry the same capability, give no such cue.
- **Fix**: `cursor: grab` on hover of a draggable, non-read-only card (outside interactive sub-elements).

## What's genuinely good

- **Truncation is done right**: card field values use `-webkit-line-clamp: 2` rather than a hard `overflow: hidden` cutoff, so long values degrade to two lines instead of being sliced mid-glyph (`styles.css:8689-8697`).
- **Concentric radius on the Board cover**: the cover's negative margin exactly cancels the card's own padding, so the cover's top radius and the card's outer radius line up without a visible gap (`styles.css:8582-8590` against `8455-8464`) — a correct application of `depth-and-detail.md`'s concentric-radius rule.
- **Roving-tabindex/nested-field keyboard model is real, not decorative**: `CardRovingTabindex.ts` implements genuine 1D and 2D (board-column-aware) arrow navigation plus a nested nav level for in-card fields (`CardRovingTabindex.ts:189-279`), and the generic `:is([tabindex]):focus-visible` rule (`styles.css:17459-17467`) does correctly catch cards and fields alike — I initially suspected a missing focus ring here and it checks out.
- **Existing touch-target-expansion pattern is well-built** — the `::before { inset: -8px }` technique used for toolbar/group-toggle/mobile-move controls (`styles.css:17330-17349`) is exactly the technique the interaction-craft reference recommends; it's just not reaching the card open-buttons (see P1 above).

## Needs visual confirmation

- Whether the `--db-elevation-2` hover shadow on Board cards actually reads as "floating away from the board" at runtime, or whether Obsidian's surrounding chrome mutes it enough that it's a non-issue in practice.
- How jarring the external-image `window.open()` on cover click feels against the `zoom-in` cursor promise.
- Whether the right-aligned field-value convention (`.db-board-card-value { text-align: right }`, `styles.css:8682-8687`, applied to all field types, not just numbers) reads as a deliberate compact key-value style or as a database-y misalignment for text-heavy fields — this is a rendering judgment I can't make from CSS alone.
