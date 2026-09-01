# Iteration 004 — Notion canonical behavior (Q6) + EuroFormat integration shape (Q8)

**Focus:** Canonical Notion rollup semantics from official docs; minimal rebase-safe code-integration shape.
**Status:** complete

## Findings

### F4.1 Notion rollup calculation taxonomy ([SOURCE: https://www.notion.com/help/relations-and-rollups])
- General: `Show original` ("just shows all related pages in the same cell"), `Show unique values`, `Count all`, `Count values`, `Count unique values`, `Count empty`, `Count not empty`, `Percent empty`, `Percent not empty`.
- Number-only: `Sum`, `Average`, `Median`, `Min`, `Max`, `Range` (`Max` − `Min`). Date-only: `Earliest date`, `Latest date`, `Date range`.
- "Rollups can only be sorted when they output a numeric value."
- **Parity mapping to fork** (`data/types.ts:44`): `Show original`≈`list`, `Sum`≈`sum`, `Average`≈`avg`, `Count values`≈`count`. Fork's `count` counts *records with resolved relation targets* (`RelationRollup.ts:99`) — closer to Notion's per-row COUNT of related pages than to `Count values` (which counts non-empty target property values); worth documenting in YAML comments when keys are uncertain.
- Missing on relations today (successor-pack evidence, matches spec's out-of-scope note): percent family, unique-values, min/max/range/median, date family — exactly Anytype's FormulaType set (iteration 003) and AppFlowy's CalculationType minus date ops (iteration 002).

### F4.2 No rollup-of-rollup in Notion either
- Official FAQ: rolling up a rollup is not possible "as this could create unintended loops" [SOURCE: notion.com/help/relations-and-rollups]. The fork independently enforces the same rule at `RelationRollup.ts:96`. Confirmed cross-system invariant.
- Workaround ecosystem confirms demand for chaining (Stack Overflow threads on formula-of-rollup and API nulls) — relevant only to later phases, not this config phase.

### F4.3 EuroFormat integration shape (Q8)
- Pattern precedent: `data/EuroFormat.ts:1-42` — one isolated formatting module, header comment stating the durable why ("Kept in one module so it stays a small, rebasable diff"), consumed at exactly two call sites: `views/CellRenderer.ts:13` and `views/SummaryRenderer.ts:7`.
- Because those two call sites already route through EuroFormat, **rollup cells and footer totals already render nl-NL/euro formatted** — a Reports rollup of currency amounts needs no further code for consistent money display.
- If any future enrichment ever needed code (e.g., new aggregation kind or click-through UX), the rebase-safe shape is: new sibling module under `src/data/` + import-and-delegate edits at ≤3 call sites (`CellRenderer`, `SummaryRenderer`, optionally `RelationRollup.aggregateRollup`). For THIS phase that path stays unexercised by design (REQ-004).

### F4.4 Footer summaries already compose over rollup columns
- `views/SummaryRenderer.ts:76-79` — numeric rollup columns (`count|sum|avg`) qualify as numeric summary columns and therefore gain the full footer menu `SUM, AVERAGE, MEDIAN, MIN, MAX, RANGE, STDDEV` (:85) computed over the *rollup results across rows* (:423-426 reads row.computed).
- **Enrichment:** Reports can get a month-over-month comparison view today without any YAML beyond adding footer summaries on the rollup columns — e.g., SUM footer over the Expenses rollup column gives vault-wide monthly expenses total across all Report rows.

## Ruled out / failed this iteration
- Sought official Notion wording on "rollup across databases" and mobile-specific restrictions — neither appears on the help page; treating both as UNKNOWN rather than inferring (mobile rendering of rollup cells in the fork remains unverified from iteration 001).

## Novelty justification
First web-sourced evidence in lineage; fixes the exact Notion→fork calculation mapping, establishes the rollup-of-rollup invariant across all three implementations, and proves EuroFormat coverage of rollup rendering already exists.
