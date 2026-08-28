# Design review — chrome lane

> Sonnet 5 (xhigh), read-only, judged against `sk-design` references. Findings are the reviewer's; line citations were spot-checked, not exhaustively verified.

## Verdict

The application chrome is more disciplined than most Obsidian plugin forks: toolbar controls are grouped into semantically-labeled clusters with divider rules, the view tablist implements a correct ARIA roving-tabindex pattern, hit areas are deliberately expanded with invisible pseudo-elements, and there's real investment in reduced-motion and forced-colors support. But the craft is uneven across the two "identical-looking" panels (filter vs. sort) and between two implementations of the same control (toggle switches), which suggests different authors/passes touched similar code without a shared checklist. A keyboard-only desktop user has no way to reorder view tabs at all — a genuine, confirmed gap, not a guess.

## Findings

### [P1] View tabs cannot be reordered from the keyboard on desktop
- **What**: Reordering view tabs is drag-and-drop-only on non-touch devices; the "move up/down" menu items that would give a keyboard alternative are gated to touch devices only.
- **Where**: `src/views/ToolbarRenderer.ts:760` (`canReorder = ... && !isTouchDevice(...)`, drag wired at `887-914`) vs. `src/views/ToolbarRenderer.ts:1129-1138` (`if (isTouchDevice(this.toolbarRoot) && actions.moveView ...)` gates the move-up/move-down/move-first/move-last rows).
- **Why it's wrong**: The two code paths are mutually exclusive by device type, so desktop keyboard/AT users get neither. Violates `review-checklist.md` §3 (missing keyboard handlers, WCAG 2.1.1) and `interaction-craft.md` §5.
- **Fix**: Drop the `isTouchDevice` guard on the move-up/down/first/last context-menu rows so they render on desktop too (they already exist and work — just hidden).

### [P1] Toggle switches in the view-config panel aren't click-through-label
- **What**: `renderSwitch` builds the row as a plain `<div>` with a separate `<div class="db-view-config-label">` — no `<label for>` association, so clicking the setting name does nothing; only the 34×18px switch itself responds.
- **Where**: `src/views/ViewConfigPanelRenderer.ts:2008-2028`.
- **Why it's wrong**: Directly contradicts `interaction-craft.md` §2, "Clicking an input's label should focus the input." The same file's own toolbar code gets this right elsewhere — `renderGroupVisibilitySwitch` and `renderGroupDateModeSwitch` in `src/views/ToolbarRenderer.ts:1690-1708` wrap both marker and label text in a real `<label>` around the `<input>`. This is an inconsistent implementation of the same widget, not a missing pattern.
- **Fix**: Change `row` to `panel.createEl("label", { cls: "db-view-config-row" })` in `renderSwitch`, matching the group-popover version.

### [P1] Sort panel skips the dialog semantics and focus trap the filter panel has
- **What**: `FilterPanelRenderer` creates its popover with `role: "dialog"`, an `aria-label`, and an active focus trap with Escape-to-close (`src/views/FilterPanelRenderer.ts:130-146`, `trapFocus` import at line 14). `SortPanelRenderer` renders a structurally identical popover — it even shares the `db-filter-panel` CSS class — with none of that: no `role`, no `aria-label`, no focus trap, no Escape handling (`src/views/SortPanelRenderer.ts:39-42`). `DatabaseView.ts` never calls `trapFocus` for the sort panel either (confirmed by grep), so this isn't compensated upstream.
- **Why it's wrong**: Two controls that look and behave alike to a sighted mouse user (`ux-laws.md` §5, Similarity) diverge completely for keyboard/screen-reader users. Violates `review-checklist.md` §3 (focus trap / Escape parity) and Jakob's Law expectations set by the adjacent filter button.
- **Fix**: Port the `trapFocus`/`role="dialog"`/`aria-label` setup from `FilterPanelRenderer.render` into `SortPanelRenderer.render`.

### [P2] Several dense controls lack the hit-area trick the toolbar already uses
- **What**: The toolbar's primary icon buttons get an invisible `::before` with `inset: -8px` to enlarge the click target without growing the visual box (`styles.css:18270-18278`, applied to `.db-toolbar-icon-button` etc.). That trick is not applied to the filter/sort row remove button (`.db-panel-button`, `height: 28px`, **no width or padding set** — `styles.css:10869-10878`), nor to `.db-source-rule-icon-button` (fixed `width/height: 26px`, `styles.css:10581-10594`), nor to `.db-view-tab-add`/`.db-view-tab-more` (`height: 24px; min-width: 24px`, `styles.css:1568-1575`).
- **Why it's wrong**: 24-26px controls sit below the 32px dense-UI floor and well below the 44px thumb floor in `interaction-craft.md` §3, and the "×" remove button has no explicit width at all, so its hit box is whatever the host's default `<button>` padding gives a single glyph. Fitts's Law (`ux-laws.md` §2) makes this a real precision tax in filter/sort rows that already invite frequent add/remove.
- **Fix**: Add the same `::before { inset: -8px }` treatment to these three selectors, or size them to at least 32px like the rest of the panel's dropdowns/inputs (which are consistently 28-30px).

### [P2] Failure state is visually indistinguishable from "nothing here yet"
- **What**: `read-failed` (a genuine data-read error) renders through the same `renderCard`/`renderTableRow` path as `no-matching-data`/`filter-empty` — identical accent-tinted card, identical border/background treatment (`src/views/EmptyStateRenderer.ts:167-171` copy table feeds the same `renderCard` at `227-260`; CSS at `styles.css:6871-6884`). Only the icon changes (`triangle-alert` vs. `inbox`/`list-filter`).
- **Why it's wrong**: `SKILL.md` §4 ALWAYS-5 wants a second signal beyond color for state, which the icon technically satisfies, but pairing a hard failure with the same calm "let's get started" blue tint undersells that something broke — a user skimming past it may not register the difference.
- **Fix**: Give `read-failed` (and any other error-class reason) a distinct tone, e.g. swap the icon-chip tint from `interactive-accent` to a warning/error token, or add a "Retry" primary action distinct from the create/select actions the positive empty states use.

## What's genuinely good

- Toolbar right side is organized into named clusters (`db-toolbar-query-cluster`, `-properties-cluster`, `-utilities-cluster`, `-creation-cluster`) separated by a real divider rule (`styles.css:18193-18205`, wired in `src/views/ToolbarRenderer.ts:320-331`) — proximity and common-region grouping done correctly instead of one flat row of buttons.
- The view tablist is a real APG tablist: `role="tab"`, `aria-selected`, `aria-controls`, roving `tabindex`, and Arrow/Home/End key handling (`src/views/ToolbarRenderer.ts:749-835`, `865-885`).
- Icon buttons use the `::before { inset: -8px }` hit-area technique instead of enlarging the visible box (`styles.css:18270-18278`) — this is exactly the pattern `interaction-craft.md` §3 prescribes, just applied unevenly (see P2 above).
- The empty/first-run hero (`src/views/EmptyStateRenderer.ts:262-293`) has a real hierarchy — icon chip, title, description, primary CTA, then a labeled preset grid with 2-line-clamped descriptions — and three responsive steps that collapse the 4-column grid to 2 then 1 and force actions full-width (`styles.css:6975-7110`).
- Reduced-motion and forced-colors are handled as first-class states, not afterthoughts: the skeleton-loader shimmer is disabled under `prefers-reduced-motion` (`styles.css:2153-2167` + `18669-18681`), and there's a dedicated `forced-colors: active` focus-ring override (`styles.css:18712-18723`).

## Needs visual confirmation

- Actual rendered size of the "×" filter/sort remove button given it has no explicit width/padding in this stylesheet — depends on Obsidian's host default `<button>` padding, which isn't in this repo.
- Contrast of `--text-faint` at 11px (`db-source-rules-empty`, `db-empty-card-diagnostics`) against panel backgrounds in both Obsidian light and dark themes.
- Whether the active-tab background (`color-mix(background-modifier-hover 72%, transparent)`) reads as clearly "selected" versus a hovered-but-inactive tab at a glance.
- Behavior of the resize-observer-driven tab overflow collapse at real narrow widths — the logic is sound on paper but needs a live narrow-viewport check for flicker/jank.
