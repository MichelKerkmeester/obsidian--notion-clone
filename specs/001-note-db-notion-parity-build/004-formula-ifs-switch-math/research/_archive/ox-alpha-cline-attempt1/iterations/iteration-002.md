# Iteration 002 — Reference Repos: AppFlowy + Anytype (Q2, Q3)

Focus: how the two cloned reference implementations deliver this capability, with path:line citations.
Repo roots: `specs/obsidian/002-note-db-notion-parity-build/context/{appflowy,anytype-ts}`.

## Findings

### F8. NEGATIVE FINDING — neither clone ships a per-cell expression language
- **AppFlowy** (commit `5cf3a36`): the `FieldType` enum has **no Formula variant** — `RichText…Media` only [SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/src/entities/field_entities.rs:427–441]. Zero matches for `sqrt`/`"if"`/`"switch"` function tables anywhere under `frontend/rust-lib`. AppFlowy's historical formula field lives in the external `collab-database` crate, which is not vendored in this clone. What flowy-database2 does have is **Calculations**: a closed aggregate dispatch — `Average | Max | Median | Min | Sum | Count | CountEmpty | CountNonEmpty` [SOURCE: …/src/services/calculations/service.rs:17–27; enum at …/src/entities/calculation/calculation_entities.rs:69].
- **Anytype** (`anytype-ts/src/ts`): `FormulaType` is likewise a **closed numeric enum of aggregates** — `None, Count, CountValue, CountDistinct, CountEmpty, CountNotEmpty, PercentEmpty, PercentNotEmpty, MathSum, MathAverage, MathMedian, MathMin, MathMax, Range` [SOURCE: context/anytype-ts/src/ts/interface/block/dataview.ts:104–119].

→ Implication for phase 004: there is no copy-pasteable IFS/SWITCH/sqrt expression evaluator in either repo. What they DO offer is battle-tested **UX patterns** (below) plus confirmation that our fork's free-form Excel-style engine is already more expressive than both references on this axis.

### F9. Anytype computes formulas client-side as pure functions over records — same shape as our wrappers
The whole engine is one switch, `getFormulaResult(subId, viewRelation)`, mapping `FormulaType → inline computation` using plain JS `Math.*`, reduce, sort [SOURCE: context/anytype-ts/src/ts/lib/dataview.ts:981–1170]. Examples directly reusable as behavioral specs:
- Sum ignores non-numerics: `acc + (Number(it[relationKey]) || 0)` (:1126–1128) — identical coercion idiom to our `sum` [SOURCE: data/ComputedField.ts:159].
- Median handles odd/even split explicitly (:1131–1143).
- Empty-input convention: `min()` returns `null` when no non-empty values (:1007–1010) — supports returning `null` (not throwing) for no-match IFS/SWITCH.
- Percent variants format at the edge: `float(x*100/total)+'%'` (:1103–1108).

### F10. Anytype UX: type-gated, sectioned, short-label picker (directly transplantable)
- Options are **gated by relation type**: `formulaByType(relationKey, type)` gives Number rows the Math section (Sum/Average/Median/Min/Max/Range), Date rows Min/Max/Range, Checkbox rows count/percent variants [SOURCE: context/anytype-ts/src/ts/lib/relation.ts:163–253].
- The picker is a two-level sectioned menu: sections `None/Count/Percent/Math/Date`, filtered to sections that have options [SOURCE: context/anytype-ts/src/ts/lib/util/menu.ts:1406–1425].
- Footer cell renders short labels and opens the menu on click [SOURCE: context/anytype-ts/src/ts/component/block/dataview/view/grid/foot/cell.tsx:36–80].

→ For phase 004 UI/UX: when surfacing IFS/SWITCH/math aliases in any formula help/autocomplete surface, group by section (Conditionals / Math) with short labels, and document argument shapes per entry — mirrors Anytype's proven pattern without adding a new UI paradigm.

### F11. AppFlowy UX: footer calculation row + i18n'd label extension
- Flutter side keeps a dedicated `calculations` application layer (listener/service/bloc) and presentation widgets `calculations_row.dart`, `calculation_selector.dart`, `calculation_type_item.dart` [SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/calculations/].
- Labels are centralized in an extension with **long + short forms** (`label` / `shortLabel`) over localized keys [SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/application/calculations/calculation_type_ext.dart:5–34].

→ Reinforces F10: name+shortLabel+i18n discipline for new function names; the fork's `i18n.ts` (`t()`, used for all `formula.error.*` strings [SOURCE: data/ComputedField.ts:476–506]) is the natural home if docs/help strings are added.

### F12. Both references keep evaluation read-only — corroborates iCloud-safety posture
AppFlowy's calculation service reads cells and formats a string [SOURCE: …/calculations/service.rs:31–84]; Anytype reads subscribed records and returns display values [F9]. Neither writes back to source data. Our spec's display-only constraint matches industry practice on both references.

## Ruled Out
- Porting an evaluator from either repo — none exists in the clones (F8).
- Aggregate-only scope expansion (median/range etc.) — out of spec scope; recorded as candidate backlog only.
