# Design review — table lane

> Sonnet 5 (xhigh), read-only, judged against `sk-design` references. Findings are the reviewer's; line citations were spot-checked, not exhaustively verified.

## Verdict

The table view has real systemic craft — a density scale, a genuinely multi-column sort UI, box-shadow (not `outline`) focus rings, and read-only mode threaded consistently through every mutation affordance. But it falls short of "production-polished" in exactly the places a spreadsheet-metaphor grid has to earn its keep: numbers aren't distinguished from text, bulk selection is nearly invisible, there's no frozen column for wide tables, and one interactive affordance (`.is-narrow`) is dead CSS that does nothing. None of this is catastrophic, but it adds up to a grid that reads correctly at 5 rows and starts losing legibility exactly when it matters most — at 500 rows, many columns, or a large selection.

## Findings

### [P1] Numeric and currency cells are never right-aligned or given tabular figures
- **What**: `CellRenderer.ts:290` and `:360` add the class `db-numeric-value` to currency/number cells, but `styles.css` has **zero** rules for `.db-numeric-value` (confirmed via full-file grep — 0 matches). Numbers render left-aligned in default browser flow with proportional digits.
- **Where**: `src/views/CellRenderer.ts:290,360`; absent from `styles.css`.
- **Why it's wrong**: `diagnosis-table.md` §5: "Numeric table columns hard to compare → right-align them." `interaction-craft.md` §4 requires `font-variant-numeric: tabular-nums` "wherever a digit change must not shift the layout: tables, dashboards." The codebase clearly knows this rule — `styles.css:774` (group summaries) and `:7445` (footer aggregates) both apply `tabular-nums` correctly — it just never reached the body cells.
- **Fix**: add `.note-database-container .db-table td.db-numeric-value { text-align: right; font-variant-numeric: tabular-nums; }`.

### [P1] Header "select all" checkbox never shows indeterminate state
- **What**: `selectAll.checked = this.actions.areAllRowsSelected(rows)` is the only state set on the master checkbox; there is no `.indeterminate` assignment.
- **Where**: `src/views/TableRenderer.ts:475-479`.
- **Why it's wrong**: the same file implements correct tri-state logic for **group** checkboxes just 100 lines later — `getSelectionState(...)` feeding `checkbox.indeterminate = selection.indeterminate` at `TableRenderer.ts:586-595`. A partially-selected ungrouped table shows the header checkbox as fully unchecked, contradicting the pattern the codebase already knows how to build. This is a Jakob's-Law violation (`ux-laws.md` §6) — every mainstream table (Gmail, Sheets, Airtable) shows a dash for partial selection.
- **Fix**: compute `getSelectionState(rows.map(r=>r.file.path), selectedIds)` for the header checkbox the same way the group divider does, and set `.indeterminate`.

### [P1] No frozen/sticky leading column — row identity is lost on horizontal scroll
- **What**: `.db-select-col` and `.db-record-icon-col` carry no `position: sticky`. Only the `<thead>` (`styles.css:4562-4565`) and group divider rows (`:7262-7266`) stick vertically; nothing sticks horizontally.
- **Where**: `styles.css` — grepped every `position: sticky` occurrence; none targets the selection/icon/name column.
- **Why it's wrong**: the review brief explicitly asks whether "the spreadsheet metaphor stays legible" — in every reference implementation (Sheets, Excel, Airtable, Notion) the row-identifying column freezes so a user scrolled ten columns right can still tell which row they're editing. Here it can't.
- **Fix**: `position: sticky; left: 0; z-index: …` on `.db-select-col`/`.db-record-icon-col`, matching the existing vertical sticky pattern.

### [P2] No visual row-selected state beyond the tiny checkbox
- **What**: `applyGridSemantics` correctly writes `aria-selected` on every `<tr>` (`TableRenderer.ts:1057`), but no CSS rule keys off `aria-selected`, `tr[aria-selected="true"]`, or any selected-row class (confirmed by grep across `styles.css`).
- **Where**: `src/views/TableRenderer.ts:1057`; absent from `styles.css`.
- **Why it's wrong**: `hierarchy.md` §2 — the state that matters most for a bulk-edit workflow (which rows am I about to act on?) carries the least visual weight in the UI, forcing the eye to scan a 40px-wide checkbox column row by row rather than reading a tinted row.
- **Fix**: add a row background tint driven by `aria-selected="true"`, similar in spirit to `db-cell-range-selected` at `styles.css:5567-5573`.

### [P2] `.is-narrow` header treatment is dead CSS
- **What**: `isHeaderNarrow()` computes a real width threshold and toggles the class (`TableRenderer.ts:681-685,492`), but its only consumer, `styles.css:4717`, sets `display: inline-flex` on `.sort-indicator` — identical to the unconditional rule three lines above at `:4707`. The selector is a complete no-op.
- **Where**: `styles.css:4707` vs `:4717`.
- **Why it's wrong**: this is a lost feature, not a stylistic choice — narrow columns (icon + label + sort arrow + absolutely-positioned menu trigger at `:4658-4674`) have no compensating treatment, so crowding/overlap on narrow columns is unaddressed exactly where it would be worst.
- **Fix**: either restore the intended behavior (e.g., suppress the label or shrink the icon on `.is-narrow`) or remove the dead class and its computation.

### [P2] Column resize handle has no expanded hit-area, unlike its header siblings
- **What**: `.db-resize-handle` is a bare 4px-wide absolutely-positioned strip (`styles.css:4754-4762`) with no `::before` hit-area expansion. Its two siblings in the same header — `.db-column-menu-trigger` (`:4676-4684`, `inset: -11px`) and `.db-table-row-drag-handle` (`:4686-4688`, `inset: -14px`) — both use exactly this pattern.
- **Where**: `styles.css:4754-4762`.
- **Why it's wrong**: `interaction-craft.md` §3 / Fitts's Law (`ux-laws.md` §2): "expand the hit area with padding or a negative-inset pseudo-element rather than by growing the visual box." The codebase already applies this twice in the same component; the resize handle — the fussiest target to hit precisely — is the one left out.
- **Fix**: add a `::before { inset: -6px 0; }`-style expansion consistent with the sibling affordances.

### [P2] Static `tabIndex=0` on every editable cell, despite `role="grid"` semantics
- **What**: every editable `<td>` gets `td.tabIndex = 0` unconditionally (`CellRenderer.ts:203,499,534`), never toggled to `-1`. The table root sets `role="grid"` (`TableRenderer.ts:470`), and a comment elsewhere explicitly calls for "spreadsheet roving-tabindex" (`TableRenderer.ts:756`) — but the actual data cells never rove; only the record-icon gutter is forced to `-1`.
- **Where**: `src/views/CellRenderer.ts:203,499,534`; contrast with `src/views/CardRovingTabindex.ts`, a dedicated module solving this exact problem for cards.
- **Why it's wrong**: the ARIA `grid` pattern requires one tab stop for the whole widget with arrow-key internal navigation; this table exposes as many native tab stops as editable cells. `src/data/TableKeyboardNavigation.ts` intercepts Tab only while `hasSelection()` is true, so correctness depends on that gating always being active — a more fragile guarantee than the Card view's dedicated roving-tabindex module gives.
- **Fix**: apply the same roving-tabindex approach used in `CardRovingTabindex.ts` to table cells, or confirm/document why the interception-based approach is intentionally different.

## What's genuinely good

- **Redundant signal on date urgency** — color *and* a glyph (▲/◆/●), not color alone: `styles.css:6689-6715`. Directly satisfies the "never color alone" rule.
- **Focus and selection rings are `box-shadow`, never `outline`** — `styles.css:18107-18110`, `:5929-5931`, `:5602-5605`. Textbook `interaction-craft.md` compliance.
- **Header text is intentionally de-emphasized relative to cell data** via `color-mix(in srgb, var(--text-normal) 76%, var(--text-muted))` (`styles.css:4594`) against plain `var(--text-normal)` for cell values (`:4772`) — a real hierarchy decision, not an accident.
- **Read-only mode is threaded everywhere**, not bolted on: utility columns, drag handles, fill handles, and footer triggers all gate on `isReadOnly` individually (`TableRenderer.ts` throughout).
- **Multi-column sort with numbered badges** (`▲2`, `▼1`) at `TableRenderer.ts:499-506` is a more capable affordance than a typical single-sort table header.

## Needs visual confirmation

- Actual contrast ratio of `color-mix()`-derived header text (`:4594`) and urgency colors (`:6689-6715`) against the sticky header background — values are theme-variable at runtime and can't be computed statically.
- Whether Tab ever traps focus at the grid's first/last cell, or cleanly escapes to the next focusable element outside the table — depends on `move()`'s boundary behavior in `TableKeyboardNavigation.ts`, which I didn't trace end-to-end.
- Whether the header menu-trigger visually collides with the sort arrow/label on genuinely narrow (~96–140px) columns, given `.is-narrow` does nothing to prevent it.
- Whether the sticky header's lack of a shadow/elevation cue (only a hairline border, `:4562-4571`) reads as "flush with content" once real data scrolls underneath it.
