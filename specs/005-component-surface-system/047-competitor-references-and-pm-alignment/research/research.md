---
title: "Research: Anytype UI/UX as a Design Source for the Note-Database Plugin"
description: "Screen-by-screen extraction of Anytype's sets/collections, views, filters, relations, navigation, and stacking model, ranked by fit against src/views/* and the 044/048 sheet grammar, with concrete adoption items."
---

# Research: Anytype UI/UX and Interaction Logic as a Design Source

<!-- SPECKIT_TEMPLATE_SOURCE: research | v1 -->

**Spec folder:** `specs/005-component-surface-system/047-competitor-references-and-pm-alignment`
**Loop:** `/deep:research:auto` · single-executor fan-out lineage `anytype-glm`
**Executor:** cli-opencode, model `llmgateway/glm-5.3-flash`, reasoning effort `max`
**Iterations:** 20 / 20 (stop policy: forced `max-iterations`; convergence treated as telemetry only per operator override)
**Findings:** 89 · **Question coverage:** 13 / 13 touched · **Avg newInfoRatio:** ≈0.86
**Capture home (screenshots, populated in parallel):** `screenshots/anytype/`

---

## 1. Executive Summary

Anytype's UI is coherent because exactly one data model backs every surface: an **Object** has
one **Type**, N **Properties**, and N links; there is no folder tree, only **Views** (saved
filter/sort/layout configurations) as the organizing surface. Two container kinds exist —
**Query** (rule-driven, formerly "Set") and **Collection** (hand-curated membership) — and a
**Type is itself a built-in Query**, which is why every object list, no matter how it was
reached, behaves like a view. Six-to-seven documented layouts (grid, gallery, list, kanban,
calendar, graph, plus Timeline in code) share one toolbar grammar, one filter/sort chip system,
and one three-tier panel-stacking model (menus → popups → OS windows).

Against our plugin's surfaces (`src/views/*`, the 044 phone-sheet grammar, the 048 stacking
model), 14 concrete, file-scoped adoption items emerge, ranked High to Medium fit — none require
new architecture, all slot into renderers or state stores we already have. Four categories are
explicit non-adoptions (cross-view drag writes, sidebar widgets, the full template system,
dynamic current-user/current-object filters) because they conflict with Obsidian's ownership of
the sidebar or our single-user, file-backed model.

## 2. Research Charter & Scope

**In scope:** sets/collections and their six-to-seven views; view switching and view settings;
filters/sorts (panel layout, condition rows, pickers); relations/properties (types, editors,
relation panel, type picker); object creation flows; inline sets inside pages; navigation
(sidebar, widgets, home, search); context menus; empty/loading states; motion and panel/sheet
stacking on desktop and mobile; the underlying data model that makes these flows coherent.

**Out of scope:** implementation. This packet's deliverable is findings and ranked adoption
proposals only — no plugin code was changed by this research lineage.

**Sources authorized:** `docs.anytype.io` (official docs), `github.com/anyproto/anytype-ts`
(desktop/web client source — primary code source used), `anytype-kotlin` (Android client
source), `anytype-swift` (iOS client source — not reached this run, see §12), community docs and
reviews (secondary), and this repo's own surfaces (`src/views/*`, specs 044 and 048) for the fit
ranking.

## 3. Methodology & Sources

20 forced iterations (`stop-policy=max-iterations`; the 0.05 newInfoRatio convergence threshold
was never crossed — average ratio ≈0.86 across the run — and was treated as telemetry only per
the operator's explicit 20-iteration override of this packet's normal research cap). Each
iteration picked one focus from a 13-question bank (`deep-research-strategy.md`), read primary
sources, and wrote findings to `iterations/iteration-NNN.md` plus a structured
`deltas/iter-NNN.jsonl` delta.

**Source families reached (4):** official docs (6 pages), `anytype-ts` (10 files — dataview
block/cell components, view entry files, system menus), `anytype-kotlin` (2 trees — Android
presentation layer, not deeply read, see §12), and local repo surfaces (4 files — `src/views/*`
verified against `styles.css` and `database-view.ts`).

**Quality guards observed:** source diversity satisfied (4 families, not single-sourced); every
iteration's focus mapped to a tracked question; no finding rests on a single weak source — every
finding cites at least one primary source (official docs or client source code).

## 4. Data Model Foundations (Q1)

- Everything is an **Object** with exactly one **Type**, N **Properties**, and N links; there is
  no folder tree — Views are the organization surface.
- Two container kinds: **Query** (formerly "Set") — rule-driven and live, created by choosing a
  source (a Type or a Property) then filters/sorts/layout; deleting a Query never deletes the
  underlying objects. **Collection** — hand-curated membership with manual upkeep; removing an
  item offers unlink (keep object) vs move-to-bin (delete object).
- The load-bearing identity: **a Type is itself a built-in Query** — every type already has
  views. Standalone Queries exist specifically to group objects across types.
- **Views are saved filter/sort/layout configurations**, switchable in one click, pinnable as
  sidebar widgets, and embeddable inline inside any page.
- Documentation terminology has drifted across releases (Spaces→Channels, Sets→Queries) —
  capture manifests for the 047 hand-off must record the app version so readers can map
  vocabulary correctly.

## 5. View System — Screen-by-Screen Extraction (Q2, Q3)

- Six documented layouts plus **Timeline** as a seventh found in code. Switching views remounts
  the component on a `key=view{id}` prop; positional views (calendar/timeline/graph/board)
  self-subscribe to their own data, while list-shaped views (grid/gallery/list) share one fetch
  pipeline.
- **Toolbar anatomy:** view-selector dropdown + a sortable tab row (right-click copy/remove,
  drag-and-drop reorder via dnd-kit, horizontal) + an add-view icon, then a search field,
  filter/sort/settings icons, and a split "New" button.
- New views inherit the current view's shape with filters emptied, and **land directly in view
  settings ~50ms after the switch** — a deliberate configure-immediately affordance.
- Filter and Sort toolbar icons are **dual-mode**: they toggle existing chips when chips already
  exist, or open the add-relation menu when none exist yet.
- The toolbar collapses to a "small" mode by measuring its own natural width against available
  space; inline (embedded) sets get a persisted, collapsible right-hand section.
- View switching writes both local view metadata and an RPC call; removing a view pre-selects
  the next view so the tab row is never left without a selection.

### Board / Kanban
Columns are group subscriptions; column order is view configuration. A deleted group relation
renders a dedicated empty state that points at view settings. Drag uses an off-screen clone as
the drag image, cached-rect hit-testing inside `requestAnimationFrame`, and `isOver` plus
left/right/top/bottom edge classes; the "add card" control is always the top drop target.
Cross-column drag carries the entire multi-select and commits as **one** property write (not one
write per card). The horizontal scrollbar is sticky and synced to scroll position, with edge
bleed via negative margins; sizing comes from `J.Size.dataview.board` design tokens.

### Calendar
Its own toolbar (month/year selects spanning years 0–3000, arrows, a "Today" button); each day
cell self-loads its own objects; a "today scroll" positions the current week at the bottom of the
viewport; clicking a day merges the view's default object properties with that day's date, then
opens the creation config popup.

### Grid / Table
Full-page grids are react-virtualized (48px rows, `InfiniteLoader`); inline (embedded) grids use
plain 40px rows with a "Load more" row instead of virtualization. One `gridTemplateColumns`
string keeps header, footer, and selection column in sync. Column widths persist per relation
with format-aware minimum floors. The sticky header is implemented via a second React root
mounted on a cloned DOM node. Open cell editors flip to right-aligned when within 92px of the
viewport's right edge.

## 6. Filters, Sorts & Search (Q4)

- One chip surface serves both sorts and filters: a leading, direction-colored sort chip, then
  filter chips, an add-chip control, and a "Clear all" action. The whole row is a per-view toggle
  that auto-hides when empty.
- Chip anatomy: relation-type icon + name + a **short condition** label + a formatted value (date
  conditions render relative, e.g. "N days ago"). Inactive chips render name-only. Left-click
  opens an anchored values-menu that both replaces the filter and reloads; right-click offers
  Clear vs Delete. Advanced (compound) filter chips always sort first in the row.
- View search is a separate, debounced full-text subscription that feeds a transient id-based
  filter — it is intentionally orthogonal to saved filters, not merged with them.

## 7. Relations, Properties & Type System (Q5)

- Nine relation formats; properties exist independently of types (a property can be reused
  across many types).
- The object header's **featured block** shows the type cell, a "set of" cell (for Query/
  Collection-typed objects), and featured relations laid out in either Line or Column mode per
  type, with in-place ("noInplace") menu editing.
- The type cell's menu offers: open the type, change the type (which applies that type's default
  template), or "turn set into collection" (converts a live Query into a hand-curated
  Collection, freezing current membership).
- An empty "set of" cell auto-opens the source picker (choose the Type or Property the Query
  reads from).
- Links and backlinks render as counts that open a picker menu on click.

## 8. Object Creation, Templates & Inline Sets (Q6, Q7)

- Creation entry points are plural and contextual; the landing state is either inline name
  editing or a configuration popup, depending on which view type triggered creation. Board
  creation defaults new cards into the "empty" group; calendar creation inherits the clicked
  day. New objects retain a backlink to the view/context that created them.
- **Templates:** a type's default template can be overridden per-view; templates apply only at
  creation time and remain switchable until the object's first edit; templates support
  lock/duplicate/bin; creation offers a pre-filled-name vs empty-name choice. Sorted
  subscriptions stash their auto-repositioning behind a `positionLock` while the name is being
  typed, so the row doesn't jump mid-keystroke.
- **Inline sets** reuse the same dataview block with an `isInline` flag: collapsible controls,
  "Load more" paging instead of virtualization, and responsive classes (`isVertical` at ≤50%
  width, `isNarrow` at ≤250px) with re-anchored empty states.
- Inline views support dynamic filter values (Current User, This Object); creating a "new inline
  query" also silently saves it as a standalone object in the space; a single page can host
  multiple independent inline views that compose into a dashboard.

## 9. Navigation, Context Menus, Empty & Loading States (Q8, Q9, Q10)

- **Navigation:** two sidebars, each with independently tunable sections. Widgets are either a
  static link or a "live lens" with five layout options and an object-count cap. Quick search
  opens as a dedicated window; opening a result from it redirects focus to the main window.
  Three separate search surfaces (quick search, in-view search, relation picker search) share one
  underlying picker component, and each surface adds its own "create new" entries.
- **Context menus:** `objectContext` is organized into four fixed sections; every menu item is
  capability-gated per the selected object (restrictions, layout rules, permissions). Numeric
  selection caps apply: selecting more than 1 object disables open/link/pin actions, more than 10
  disables "open in new tab." Toggle items derive their label from current state. Submenus are
  hover-opened and pre-filtered, and still carry their own "create" entries. A "No available
  actions" fallback exists for the fully-restricted case.
- **Empty/loading states:** two empty-state flavors — "target" (the view's source itself is
  missing/deleted) and "view" (the source exists but has no matching objects) — each with a
  per-layout "add" affordance. A full-body dots loader shows while a page is opening. Distinct
  states exist for a deleted object and for a deleted group-relation (used for a board's grouping
  column). An onboarding layer wraps first-run empty states. Mobile substitutes a shimmer
  skeleton instead of the dots loader.

## 10. Motion & Panel/Sheet Stacking — Desktop and Mobile (Q11)

- **Three-tier layering:** `S.Menu` (anchored, replaceable, `closeAll` operates per menu family,
  guarded by an `isAnimating` flag) sits below `S.Popup` (heavyweight modal dialogs), which sits
  below native OS windows (the standalone quick-search window, for example).
- Motion is centralized through one `animationProps` helper plus `AnimatePresence`, observed at
  0.2s (enter) / 0.1s (exit) durations, with explicit no-animation paths reserved for chained
  menus (so opening menu B from menu A doesn't double-animate). A global interaction lock is held
  during active drags and while any menu is open, preventing conflicting gestures.
- **Mobile (Android, from anytype-kotlin):** filter sheets render one condition row per relation
  format; reordering uses a dedicated full-screen "modify order" mode rather than inline
  drag-and-drop; lists use `RecyclerView` with diff adapters. iOS/Swift internals were not read
  this run (see §12 Open Questions).

## 11. Recommendations — Adoption Items Ranked by Fit

Verified against this repo directly (`styles.css` at repo root; the add-view flow in
`database-view.ts`) before ranking:

| # | Adoption item | Fit | Files that would change |
|---|---|---|---|
| 1 | Filter/sort chip row with state-dependent trigger icons (dual-mode toolbar icons) | High | `src/views/filter-panel-renderer.ts`, `src/views/sort-panel-renderer.ts`, `src/views/toolbar-renderer.ts`, `styles.css` |
| 2 | Land in view settings ~50ms after creating/duplicating a view | High | `src/views/database-view.ts`, `src/views/view-config-panel-renderer.ts` |
| 3 | Board sticky horizontal scrollbar with edge bleed | High | `src/views/board-renderer.ts`, `styles.css` |
| 4 | Duplicate-view action plus view-tab right-click context menu | High | `src/views/active-view-controls-renderer.ts` |
| 5 | Per-view scroll-position restore | Med-high | `src/views/view-state-store.ts` |
| 6 | Cell-editor anti-clip flip near the right edge (92px threshold) | High | cell editors, `src/views/popover-position.ts` |
| 7 | Sort-conflict confirmation on manual drag reorder | High | `src/views/board-renderer.ts`, `src/views/table-renderer.ts` |
| 8 | Capability-gated context menu with a never-empty fallback and selection-count caps | High | `src/views/row-menu.ts`, `src/views/bulk-edit-field-menu.ts` |
| 9 | Two-flavor empty state (missing source vs. no matching objects) plus a deleted-relation state | High | `src/views/empty-state-renderer.ts` |
| 10 | Per-view "new row" default presets (template-lite slice) | Med-high | `src/views/view-config-panel-renderer.ts` |
| 11 | `positionLock` while editing a name in a sorted view (prevents mid-type row jumps) | Med-high | `src/views/table-renderer.ts` |
| 12 | Measured toolbar "small" collapse mode for embedded/inline views | Med-high | `src/views/embedded-database-renderer.ts` |
| 13 | Per-format filter condition rows on phone sheets, gated by our own sheet grammar | High (mobile) | filter/sort renderers, `src/views/sheet-grammar.ts` gates |
| 14 | Inline "Load more" row instead of virtualized paging for embedded views | Medium | `src/views/embedded-database-renderer.ts` |

**Stacking insight for the 048 phase:** our `overlay-stack.ts` already occupies the same tier as
Anytype's `S.Menu`, but lacks `closeAll`-by-family, replace-without-animation, and
`isAnimating`-style guards — a concrete, small upgrade. The open 048 question of "modals as
sheets vs. replace" is the same tier-boundary choice Anytype already made between `S.Menu` and
`S.Popup`, in different terminology.

**Explicit non-adoptions** (documented so they are not silently retried later):
cross-view drag that writes a property (would need a real 046-style multi-view use case first);
sidebar widgets and live lenses (Obsidian owns the sidebar surface); the full template system
(the per-view "new row" preset in item #10 is the adopted slice, not the whole system);
This-Object / Current-User dynamic filter values (we are single-user and file-backed, so these
have no referent); group-subscription board columns (no server middleware exists in this plugin;
client-side grouping is the correct fit instead).

## Eliminated Alternatives

Negative knowledge from the research process itself — approaches tried while sourcing evidence
that did not pan out, so a future run does not repeat them:

| Approach | Reason Eliminated | Evidence | Iteration(s) |
|---|---|---|---|
| Legacy `docs.anytype.io/collections-and-sets/*` doc URLs | 404 — docs migrated; the sitemap must be walked first, not guessed | Direct fetch returned 404 | 1 |
| Reading only official docs for UI behavior | Docs contain no motion/animation or panel-stacking detail at all | Confirmed absent across all fetched doc pages | 2 |
| Guessing a `component/dataview` contents-API path | 404 — path guessing on the GitHub contents API is unreliable and costly | Direct fetch returned 404 | 3 |
| Recursive git-tree fetch of large directories | Truncates at ~52KB / ~733KB; loses tail content silently | Output truncation observed twice | 4, 18 |
| Guessing `dataview/filter.tsx` / `sort.tsx` as the filter/sort UI source | 404 — filter/sort editing lives in system menus under `component/menu/`, not a dataview subfolder | Direct fetch returned 404 | 6 |
| Guessing `view/board/index.tsx` as the board view entry | 404 — view entries are flat files (`view/board.tsx`), not per-view directories | Direct fetch returned 404 | 7 |
| Deep-reading `anytype-kotlin` `presentation/` sheet internals | Not reached this run — Material `BottomSheet` specifics remain unknown, deferred to a follow-up iteration | Time/iteration budget spent on higher-priority desktop findings instead | 20 (deferred) |

## Divergence Map

This lineage ran under `convergence_mode: default` (not `divergent`) with `stop_policy:
max-iterations` — the 20-iteration count was a forced, non-negotiable depth requirement from the
operator, not a convergence-driven or divergence-driven stopping decision. No Council pivot
occurred and none was needed: newInfoRatio stayed high (avg ≈0.86, never near the 0.05
threshold) through iteration 15, then declined through iterations 16-20 (0.7, 0.5, 0.9, 0.7, 0.6)
as the focus moved from primary desktop surfaces to mobile/Android and edge-case verification —
a normal broadening pattern, not evidence of an exhausted topic.

**Remaining frontier**, i.e. surfaces this run touched lightly or not at all and that a follow-up
lineage should pick up first: iOS/Swift client internals (`anytype-swift`, not reached this run);
`S.Menu` manager internals (layering grammar here was derived from call sites, not the manager's
own source); Android `presentation/` sheet internals (Material `BottomSheet` specifics); the
graph-view layout algorithm (mentioned in scope but not extracted screen-by-screen this run).

## 12. Open Questions

All 13 charter questions (Q1-Q13) were touched and answered within this run's scope — none are
open in the "unanswered" sense. The items below are follow-up questions this run's own findings
surfaced, not gaps in the original charter:

- iOS/Swift sheet-stacking behavior — does it match the Android `presentation/`-layer pattern
  (dedicated reorder screen, per-format condition rows) or diverge, given iOS's native sheet
  detents?
- `S.Menu` manager internals — is `closeAll`-by-family implemented as a registry keyed by menu
  type, or by a simpler tag scheme our `overlay-stack.ts` upgrade (§11) could copy directly?
- Graph-view layout: force-directed, or a different algorithm — worth a dedicated pass if the
  047/048 work ever extends to a graph surface.
- How does Anytype's Timeline layout (found in code as a 7th layout, undocumented) differ from
  the plugin's existing gantt work in `048-stacked-sheets`'s sibling packets?

## 13. Hand-off Notes for the 047 Phase

- Screenshots landing in `screenshots/anytype/` (populated in parallel by another agent) should
  be indexed using this document's vocabulary — note the terminology drift in §4 (DM-6:
  Spaces→Channels, Sets→Queries) and record the captured app version in the manifest so future
  readers can map old vs. new naming.
- Fidelity-comparison work in the 047 phase can reuse these findings as named-element checklists:
  chip-row anatomy (§6), toolbar anatomy (§5), the empty/loading-state matrix (§9), board drag
  vocabulary (§5 Board subsection), and the grid column-sizing contract (§5 Grid subsection).
- No plugin code was changed by this research lineage; every item in §11 is a proposal for the
  operator to sequence, not a completed change.

## 14. Convergence Report

- **Stop reason:** `maxIterationsReached` (20/20), per the operator's explicit 20-iteration
  override of this packet's normal research cap; the 0.05 newInfoRatio convergence threshold was
  never crossed and was treated as telemetry only for the whole run.
- **Total iterations:** 20 · **Findings:** 89 · **Source families:** 4 (official docs — 6 pages;
  `anytype-ts` — 10 files; `anytype-kotlin` — 2 trees; local repo — 4 files).
- **Questions answered:** 13 / 13 (Q1-Q12 answered directly; Q13 delivered as the §11 adoption
  matrix).
- **newInfoRatio series (iterations 1-20):** 1.0, 0.9, 0.8, 0.95, 0.95, 0.9, 0.95, 0.9, 0.95,
  0.95, 0.85, 0.8, 1.0, 0.9, 0.95, 0.7, 0.5, 0.9, 0.7, 0.6 — average ≈0.86.
- **Quality guards:** source diversity satisfied; every iteration's focus mapped to a tracked
  question; no finding rests on a single weak source.
- **Executor route-proof:** `target_agent: cli-opencode` (inline detached fan-out executor,
  model `llmgateway/glm-5.3-flash`, reasoning effort `max`), lineage label `anytype-glm`,
  session `fanout-anytype-glm-1788590123471-qp1mid`. Two prior lineage attempts were aborted
  before producing a canonical `research.md` (see §15) and are not part of this deliverable.

## 15. Run History (Executor Substitutions)

Three lineage attempts ran before this document's source lineage completed; documented here
because the substitutions were evidence-driven, not preference-driven, and the archived
artifacts remain on disk under `research_archive/` for audit:

1. **`anytype-glm` (cli-opencode, attempt 1) — archived, `research_archive/anytype-glm-cli-opencode-aborted-wrong-max-iterations-6/`.**
   Killed after 2 solid iterations when its self-authored `deep-research-config.json` showed
   `maxIterations: 6` instead of the required 20. Root cause: the fan-out config's per-lineage
   iteration-count field is `iterations`, not `iters`; the wrong key name was silently dropped by
   the schema (no `.strict()` validation on that object), so the executor fell back to a guessed
   default. Fixed by correcting the field name.
2. **`anytype-glm-pi` (cli-pi, model `glm-5.3-flash`) — archived, `research_archive/anytype-glm-pi-cli-pi-opencode-go-quota-exhausted/`.**
   All 6 dispatch attempts failed within seconds with `429: GoUsageLimitError — Monthly usage
   limit reached. Resets in 2 days.` cli-pi's closed model roster (`PI_MODEL_PROVIDERS` in
   `executor-config.ts`) routes the bare `glm-5.3-flash` literal exclusively through the
   `opencode-go` provider — a different, separately-quota'd account from the `llmgateway`
   DevPass gateway `cli-opencode` uses for the same model name. This is a hard external quota
   wall (confirmed via captured stderr), not a configuration defect, and was not retried.
3. **`anytype-glm` (cli-opencode, attempt 2) — this document's source lineage.**
   Relaunched with the corrected `iterations: 20` field on the same `llmgateway/glm-5.3-flash`
   route already proven to work in attempt 1. Ran cleanly to `maxIterationsReached` at 20/20 with
   zero salvage failures.

A mid-run coordinator message additionally proposed `llmgateway/glm-5.3-flash` on cli-pi as a
"corrected" preferred route; this was checked directly against the live `executor-config.ts`
source (`PI_SUPPORTED_MODELS` / `PI_MODEL_PROVIDERS`) and found to contain no `llmgateway` entry
for cli-pi at all, and the proposed fallback (`opencode-go/glm-5.3-flash` on cli-pi) is the same
route already confirmed quota-exhausted in attempt 2 above. Per the coordinator's own stated
condition — restart only if no iteration record exists yet — and with attempt 2 already 4+
iterations deep and healthy at the time, the run was kept on cli-opencode rather than disrupted
a third time.

## 16. References

**Official documentation:** `docs.anytype.io` (6 pages fetched across the run; the legacy
`/collections-and-sets/*` URL scheme is dead — see Eliminated Alternatives).

**Client source (primary evidence for UI behavior, motion, and stacking):**
`github.com/anyproto/anytype-ts` (desktop/web client — dataview block/cell components under
`src/ts/component/block/` and `src/ts/component/cell/`, view entry files under `view/*.tsx`,
system menus under `component/menu/`), `github.com/anyproto/anytype-kotlin` (Android client —
`presentation/` layer, partially read, see §12), `github.com/anyproto/anytype-swift` (iOS client
— not reached this run, see §12).

**This repository:** `src/views/*` (verified against `styles.css` and `database-view.ts` before
ranking in §11), `specs/005-component-surface-system/044-phone-sheet-alignment` (phone sheet
grammar), `specs/005-component-surface-system/048-stacked-sheets` (stacking model),
`screenshots/anytype/` (capture home, populated in parallel — this lineage did not write there).

**Generated artifacts from this run:** `research/resource-map.md` (emitted from converged
iteration deltas), `research/lineages/anytype-glm/` (full iteration trail: `deep-research-
state.jsonl`, `deep-research-strategy.md`, `iterations/iteration-001.md` through
`iteration-020.md`, `deltas/iter-001.jsonl` through `iter-020.jsonl`, `findings-registry.json`,
`research.md`).

## 17. Machine State (do not hand-edit)

Reducer-owned anchors are refreshed from `findings-registry.json`, `deep-research-state.jsonl`,
and `deep-research-strategy.md` under `research/` and `research/lineages/anytype-glm/`. This
section exists so a future re-run of the reducer can locate and refresh those anchors without
mutating the synthesis above.

<!-- ANCHOR:deep-research-anytype-ui-ux-source -->
<!-- ANCHOR:findings -->
<!-- ANCHOR:convergence-report -->
