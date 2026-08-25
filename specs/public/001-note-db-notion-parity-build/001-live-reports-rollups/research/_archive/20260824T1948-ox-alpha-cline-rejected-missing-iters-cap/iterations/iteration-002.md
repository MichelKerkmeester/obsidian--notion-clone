# Iteration 002 — AppFlowy evidence (Q4)

**Focus:** How AppFlowy models and renders live totals in flowy-database2 (Rust) + Flutter UI.
**Status:** complete

## Findings (paths relative to `specs/obsidian/002-note-db-notion-parity-build/context/appflowy/frontend`)

### F2.1 AppFlowy has NO Notion-style parent-row rollup field — live totals live in a view-level calculation bar
- Repo-wide grep for `rollup|Rollup` under `rust-lib/flowy-database2/src` returns **zero hits** (verified via `grep -rln`).
- Instead, `services/calculations/` implements per-view, per-field aggregate "calculations" — the moral equivalent of the fork's `SummaryRenderer.ts` footer, not of `RelationRollup.ts`.
- **Parity insight:** the fork is already *ahead* of AppFlowy on this axis: it has both per-row relation rollups AND footer summaries. The spec's config-only plan needs no AppFlowy-derived code path; AppFlowy's contribution is UX + architecture patterns.

### F2.2 Aggregation surface: 8 kinds, computed in parallel, formatted server-side
- `rust-lib/flowy-database2/src/services/calculations/service.rs:17-31` — `Average | Max | Median | Min | Sum | Count | CountEmpty | CountNonEmpty`, dispatched off a numeric `CalculationType` enum (`entities/macros.rs:54-63`: 0=Average … ).
- Numeric reductions use rayon parallel iteration with `(sum, len)` tuple reduce (:21-38); results are formatted to two decimals (`format!("{:.2}", ...)` :37) or empty string when no values — the fork's null-cell behavior matches AppFlowy's empty-string behavior.

### F2.3 Live recalculation is event-driven through a task scheduler + cache, never file-rewriting
- `services/calculations/controller.rs:202-235` — `handle_cell_changed` pulls cached cells for the field, recalculates, updates the stored Calculation, and emits `CalculationValueNotification` over `DatabaseViewChangedNotifier` (:18, :150).
- Events enter via a priority `TaskDispatcher` (`gen_task` :86-99, `process` :117-133: RowChanged / CellUpdated / FieldDeleted / FieldTypeChanged), with QoS levels (`QualityOfService::Background` :343).
- Per-view cache: `calculations_by_field_cache = AnyTypeCache::<String>::new()` (:65).
- **Pattern worth borrowing (config-era note, future-pack evidence):** coalesced background recalculation + notification push keeps totals live without synchronous recompute on every keystroke — analogous to the fork's existing `RefreshCoordinator.mark(paths)` (`views/DatabaseView.ts:2157`) but with explicit task prioritization.

### F2.4 Flutter renders calculations as an always-visible footer row with click-to-change aggregation
- `appflowy_flutter/lib/plugins/database/grid/presentation/widgets/calculations/calculate_cell.dart:15-27` — `CalculateCell(fieldInfo, width, calculation)` rendered under each column.
- Supporting widgets: `calculation_selector.dart`, `calculation_type_item.dart`, `remove_calculation_button.dart`, `calculations_row.dart` (same directory) — i.e., users click the footer cell to pick/change the aggregation type inline.
- Application layer: `grid/application/calculations/calculations_bloc.dart` + `database/application/calculations/calculations_listener.dart` (notification → bloc state).
- **UX enrichment for Reports:** the fork's SummaryRenderer footer could adopt AppFlowy's affordance of exposing *which* aggregation is active and letting the operator change it from the view, instead of YAML-only configuration.

### F2.5 Relation field exists but only as a link column
- `services/field/type_options/relation_type_option/relation.rs` + `relation_entities.rs` — stores target database id; no aggregation over related records anywhere in flowy-database2 (consistent with F2.1).

## Ruled out / failed this iteration
- Searched for a Rust rollup/lookup field implementation to cite as a second model — none exists in this snapshot; AppFlowy cannot serve as evidence for per-row rollup semantics, only footer-calculation semantics and refresh architecture.

## Novelty justification
First external-repo evidence in lineage: establishes that per-row rollups (fork) vs footer calculations (AppFlowy) are distinct parity axes, and supplies a concrete event-driven recalculation architecture with citations.
