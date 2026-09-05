---
title: "State and Feedback Vocabulary"
description: "The seven-state vocabulary every surface maps onto, the per-surface must-render / renders-today table with file:line evidence, the motion spec, and the token map to design-system.md — plus the Anytype patterns this phase adopts and the componentization plan."
trigger_phrases:
  - "state feedback vocabulary"
  - "051 vocabulary"
  - "motion spec"
  - "empty state flavours"
  - "toast pattern"
importance_tier: "high"
contextType: "reference"
---
# State and Feedback Vocabulary

The deliverable `spec.md` §3 names. Everything here is either read from source with a `file:line`,
or quoted from `../047-competitor-references-and-pm-alignment/research/research.md` and
`../../../screenshots/anytype/README.md` with the capture named. No cell is inferred.

---

## 1. THE VOCABULARY

Seven states, named once (goal D1). The undo affordance is an action slot on success and error,
never a state of its own.

| State | Meaning | Component | Today's producer |
|-------|---------|-----------|------------------|
| `empty.no-source` | The view's source is missing or deleted | `EmptyStateRenderer` | **None** — `getEmptyStateReason` maps `sourceCount === 0` to `no-matching-data` (`empty-state-renderer.ts:210`); the embed's own missing-config path uses `read-failed` (`embedded-database-renderer.ts:693-700`), a third shape for the same fact |
| `empty.no-matches` | Source exists; search/filters/limits matched nothing | `EmptyStateRenderer` | `search-empty` / `filter-empty` / `filter-and-search-empty` / `limit-empty` / `no-matching-data` (`empty-state-renderer.ts:210-216`) |
| `empty.deleted-relation` | The grouping field is gone from the schema | `EmptyStateRenderer` | **None** — board re-groups silently via `getDefaultBoardField` (`database-view.ts:2678`, `:2890`, `:3378`) |
| `loading` | Data pending | `db-skeleton-loader` (`database-view.ts:11847`; CSS `styles.css:2709-2755`) | Exists; already `role="status"` (`:11847`) |
| `error` | Operation or read failed | Toast (transient) + `read-failed` card (persistent) | Cards at `database-view.ts:1444-1455`, `:6928-6938`; errors surface as 247 raw `new Notice(...)` call sites with no action slot |
| `success.notice` | Operation completed | Toast | Raw `Notice`, no action; auto-dismiss variants `new Notice(msg, 8000)` at `column-rename-modal.ts:106` |
| `destructive.confirm` | Destructive/bulk action needs a decision | Confirm primitive | `modals/confirm-modal.ts:35-98`, `044` grammar 0/7, 19 callers (spec §5 row "Confirm") |

**The two undo shapes today, to become one component:** `showOperationResult`
(`showOperationResult`, called at `database-view.ts:9433-9437` — success rail with Undo, error rail with Retry, 2200ms
auto-dismiss, CSS `styles.css:2662-2700`) and the selection bar's Undo button
(`database-view.ts:7719`). Both route to the same history stack (`undoLastEdit`); the
component unifies the presentation, not the stack.

**The promise the vocabulary must keep:** `notice.galleryMigrated` ends *"Undo to keep it a
gallery."* (`src/i18n.ts:1455`) — but it is raised through plain `new Notice(...)`
(`database-view.ts:2744`, `embedded-database-renderer.ts:764`), which cannot carry a button. The
notice has promised an undo the surface cannot deliver since the string was written.

---

## 2. PER-SURFACE TABLE

`spec.md` §5 is the authoritative table; this section is its reading guide and carries the
per-renderer call-site census behind it. A surface's **Must** set is derived from its own
conditions, not copied from a sibling.

| Renderer | Shared-component call sites (`emptyStateRenderer.*`) | Private state code | Notes |
|----------|------------------------------------------------------|--------------------|-------|
| Table | `table-renderer.ts:225, 272, 314` (`renderTableRow`) | none | Grouped and ungrouped paths both default `no-matching-data` |
| Board | `board-renderer.ts:256, 863, 1119, 1194` | none | `:256` renders when `groups.length === 0`; per-column `empty-group` carries an actions-once tracker (`:856-866`) |
| Gallery | `gallery-renderer.ts:150, 220` | none | Retiring surface; inheritance only (goal D7) |
| Calendar | `calendar-renderer.ts:248, 263, 631, 646, 667` via `renderEmpty` `:2510` | none | Distinct reasons already: `no-date-field`, `no-events`, `read-failed` |
| Timeline | `calendar-timeline-renderer.ts:459, 488` via `:4236-4249` | `renderTimelineEmptyRange` `:4246-4256` (`no-events-in-range`) | Add affordance gated on `openDateConfig` |
| Chart | **none** | `renderEmptyState` `chart-renderer.ts:601-604`, `db-chart-empty`, reasons `chart-aggregation.ts:64`; own action builder `:609-641` | The absorption target (REQ-055-4) |
| Embedded | `embedded-database-renderer.ts:693, 1204, 1222`, diagnostics at `:1990` | none | Owns the migration and delete notices (`:764`, `:3208`) |
| Full view | `database-view.ts:1444, 6910, 6928`; hero `:7190` (`renderHero`, presets `empty-state-renderer.ts:100-134`) | none | Hero is the no-database first-run surface |

Empty-state CSS lives at `styles.css:7586-7642+` (`.db-empty`, `.db-empty-card`, `.db-empty-hero`).

---

## 3. ANYTYPE PATTERNS WORTH TAKING

Each row names its capture or research section. Where a capture does not exist, the pattern is
code-derived and the gap is stated — never guessed at a screen (`050` goal D1's discipline).

| Pattern | What Anytype does | Source | What we take | Where it lands |
|---------|-------------------|--------|--------------|----------------|
| Two-flavour empty states | "target" (source missing/deleted) vs "view" (source exists, nothing matches), each with a per-layout add affordance | `047` §9 | Exactly REQ-055-3; our third flavour (deleted-relation) is Anytype's deleted-group-relation state, also `047` §9 | `empty-state-renderer.ts` |
| Deleted group relation state | A board whose grouping column was deleted renders a dedicated state pointing at view settings | `047` §9 | REQ-055-3's third state replaces the silent `getDefaultBoardField` fallback | `database-view.ts:2678`/`:2890`/`:3378`'s caller |
| Never-empty menus | `objectContext` is capability-gated per selection; the fully-restricted case renders "No available actions"; caps at >1 and >10 selections | `047` §9 | 050 REQ-008 verbatim; the fallback row is the vocabulary's guarantee that no menu renders empty | `row-menu.ts`, `bulk-edit-field-menu.ts` |
| Per-format condition rows on mobile sheets | Android filter sheets render one condition row per relation format | `047` §10 (from `anytype-kotlin`, code-derived; no capture) | **Not this phase** — 050 REQ-013's leg; named here so the boundary is explicit | — |
| Subtle, centralized motion | **`047` §10 is superseded on both halves** (`design-trueup.md` C1, C2). There is no `0.1s` exit — the toast's enter and exit share one `transition-duration: 0.2s` (`anytype-ts/src/scss/notification/common.scss:21`, `:25`) — and the "centralized helper" is three constants (`_mixins.scss:2`, `:5-7`) plus 18 hand-typed `0.3s` and 96 bare `ease` against 2 `ease-out`. The no-animation hatch is real: `.noAnimation { transition: none !important; }` (`common.scss:89`) | `anytype-ts/src/scss/`, read directly | The motion-token set (§4), measured rather than quoted (ADR-005); the chained-menu no-animation rule maps onto our owned-menu submenu suppression | `styles.css` token block |
| Never-empty view tab row | Removing a view pre-selects the next view | `047` §5 | Already true of our view handling; recorded so it is not re-derived | — |
| Inline undo | **Partly observed, in a different placement.** No toast appears in any capture, but iOS carries `Undo/Redo` as a persistent **menu row** (`mobile/anytype-mobile-sheet-object-more-dark.png`), which does not depend on catching a transient. The toast's *geometry*, meanwhile, is a complete source read — 384px wide, 12px bottom-right, 12px radius, 16px padding, 70px min-height, action row `gap: 8px` at `margin-top: 12px` that **auto-hides when empty**, collapsed stack with only the first card rendering content (`notification/common.scss:6`, `:20`, `:38-39`, `:50-52`) | `mobile/anytype-mobile-sheet-object-more-dark.png`; `anytype-ts/src/scss/notification/common.scss` | The measured geometry, at our on-scale neighbours (64px min-height). **Severity is ours** — the reference toast has one visual and no severity axis. The persistent-undo placement is recorded, not built | `toast.ts` |

Capture files that inform the empty-state design directly:
`anytype-inlinecollection-empty-dark.png` (the "view" flavour with its `+ New Object` row — the
model for our per-layout add affordance), `anytype-collection-grid-populated-dark.png` (populated
contrast), and — since `964a0b2a` — the **118 real iOS simulator captures** under
`screenshots/anytype/mobile/`, which supersede `mobile/official/` as the mobile reference (the
official creative remains marketing, good evidence of intent and weak evidence of pixels). T001
read them: the desktop's no-empty-block finding is **desktop-scoped**, and the phone renders a
**three-tier ladder** — message only, illustration plus one line, illustration plus title plus
body plus action (`design-trueup.md` §3). The deleted-relation state is still **not captured** on
either platform; its design stays code-derived from `047` §9 with the gap named here.

---

## 4. MOTION SPEC

| Token | Value | Used for | Replaces |
|-------|-------|----------|----------|
| `--db-motion-fast` | `120ms ease` | Tone transitions: hover, active, focus; menu rows | **42** `transition:` declarations carrying `120ms` (`grep -o "transition:[^;]*" styles.css | grep -c 120ms`), which hold **78** `120ms` occurrences between them — one population, two units; the existing `--db-transition-fast` (`styles.css:113`), which reaches **7** uses, is renamed to this or aliased. Kept at 120ms against Anytype's neighbouring `0.15s` (`_mixins.scss:2`) because an established project value outranks a neighbouring measurement |
| `--db-motion-surface` | **`200ms ease-out`** | Small floating surfaces: popovers, dropdowns, toasts | **Measured** (ADR-005): Anytype puts menu, popup and sidebar on one `0.2s` constant (`_mixins.scss:5-7`) with a decelerating curve (`:9`). The 3 hand-typed `180ms` declarations **and** the 3 written as `0.2s` all migrate onto it; 180ms was three strays, not a token, so the measurement wins |
| `--db-motion-sheet` | `260ms ease-out` | Sheet + scrim entrance; surfaces with ~760px of travel | Existing `--db-sheet-enter` (`styles.css:121`) — renamed, value and comment kept |
| `--db-motion-emphatic` | `1.1s ease-in-out infinite` | Skeleton shimmer only (`styles.css:2749`) | The shimmer's inline duration. Anytype's loops run `1.2s`/`2s` `linear`; same order, and a sheen is not a progress measure |
| `--db-motion-scale-from` | `0.98` | Entrance scale for any floating surface: popover, toast | Our popover's inline `0.98` (`styles.css:360`) against Anytype's popup `0.95` (`popup/common.scss:18`) — both inside the 0.95-1.05 bound, so the established value holds. A token because the toast needs the same number. Anytype's toast `scale3d(0.75)` (`notification/common.scss:25`) is **refused**: outside the bound, on the one surface this phase builds |

**Easings:** `ease` for tone, `ease-out` for entrances, matching the existing `db-sheet-scrim-in`
and sheet transition (`styles.css:272, 385`). **No new easing curves, and Anytype's are not
ported**: `design-system.md` declares no easing vocabulary, so one bespoke `cubic-bezier` beside
the keywords would be a second system of the same kind. `$easeInQuint`
(`anytype-ts/src/scss/_mixins.scss:1`) is additionally a curve whose name says the opposite of its
shape — it is `cubic-bezier(0.22, 1, 0.36, 1)`, an ease-**out** — so porting it by name would
reverse the direction (`design-trueup.md` §2).

**Reduced motion — ours alone.** `prefers-reduced-motion` occurs **0 times** in
`specs/context/anytype-ts/src`, so there is no counterpart to adopt and no counterpart to measure
against (`design-trueup.md` C5). The reset at `styles.css:918-947` covers container descendants and takes a
real zero on `.db-surface` (the body-mounted-menu case proven by
`owned-menu-reduced-motion.test.ts`). Every new token consumer is named in the reset in the same
change that introduces the token; the coverage test's anchor-text mechanism extends to the toast
and confirm. The shimmer's `infinite` loop must appear in the reset or it never stops for a
reduced-motion reader.

**Residual inventory (re-measured at T001, not swept).** 87 `transition:` and 21 `animation:`
declarations in `styles.css`. Two corrections to the original census, both from
`design-trueup.md` C6 and C8.

**First, 42 and 78 are the same population counted in different units** and the earlier census used
them interchangeably. `120ms` appears in **42 `transition:` declarations**, and those declarations
contain **78 `120ms` occurrences**, because one declaration may list several properties each with
its own duration. Quote the declaration count when talking about sites to migrate, and the
occurrence count when talking about literals to replace.

**Second, the census only counted `ms` spellings and so missed 16 durations written in seconds.**

| Notation | Population on `transition:` |
|---|---|
| `ms` | 78×`120ms` (across 42 declarations) · 4×`150ms` · 3×`180ms` · 1×`160ms` · 1×`100ms` · 1×`80ms` |
| `s` — **previously uncounted** | 10×`0.15s` · 3×`0.2s` · 2×`0.1s` · 1×`0.3s` |

So the real populations, combining both spellings: **150ms → 14** (not 4), **200ms → 3**,
**100ms → 3**, **300ms → 1**. The 200ms group is a second, independent reason
`--db-motion-surface` lands at 200ms rather than 180ms.

On animations: 3×`2.2s` · 3×`1.2s` · 2×`160ms` · 1×`1.1s` (shimmer) · 1×`800ms` · 1×`700ms` ·
1×`650ms` · 1×`220ms`. The multi-second ones are schedules, not state feedback, and stay out of
scope; the two `160ms` were missing from the earlier list.

Migration is per-file through the parent's serialized CSS lane (goal D6); every stray above is
recorded here so a later lane pass finds the census rather than re-measuring.

---

## 5. TOKEN MAP TO `design-system.md`

| Contract | design-system.md anchor | What conformance means here |
|----------|--------------------------|------------------------------|
| Toast is a `menu`-role surface | §3 role vocabulary | Dismisses on outside click/Escape; roving focus returning to trigger; `data-db-surface="menu"` stamped; registers a `producer` id so CI finds it |
| Empty card and toast carry the token snapshot when portalled | §4.2 | Semantics travel with the surface; never a `--db-*` write to a host root |
| Confirm buttons and toast rows are row-grammar rows | §6 | Built through `createMenuRow`/the canonical builder where they are rows; never styled through a container |
| Confirm declares its presentation | §7 | `sheet` on phone, existing `DbModal` declaration otherwise — never inferred from an anchor |
| Motion tokens join the `--db-*` block | §2, §4.2 | Declared on the same nine selectors as the other tokens, dark-theme override included (`styles.css:425-433` block gains the four) |
| One component, many callers | §1 one-paragraph version | A surface asks for a state; it does not build one. Post-landing, new per-surface state markup is a review finding |

---

## 6. COMPONENTIZATION PLAN

| Component | One of what | Many callers of what | Consumed by |
|-----------|-------------|----------------------|-------------|
| `EmptyStateRenderer` (extended) | One card component, one reason precedence | Every renderer's empty conditions; chart's `db-chart-empty` retired | All 8 current renderers + chart = 9; gallery inherits |
| `toast.ts` (new) | One toast component with severity + action slot | Every notice call site; the rail and the selection-bar undo become placements | The named call sites in `plan.md` first; 247-site residue named as follow-up |
| Confirm primitive (existing `ConfirmModal`) | One confirm path | 19 `confirmWithModal` callers — unchanged API, shared header inside | Every destructive flow; the most common stacked child (`048` M-4) |
| Motion tokens | One token set in one block | Every transition/animation this program owns | `styles.css` consumers, migrated per-file |
| Scroll restore (050 item 5) | One per-view state field | Every view type's switch path | `view-state-store.ts` |
| Capability gate (050 item 8) | One predicate + one fallback row | `row-menu.ts`, `bulk-edit-field-menu.ts`, future menus | The owned-menu family |
| "Load more" (050 item 14) | One inline paging row | Embedded views | `embedded-database-renderer.ts` |

**The confirm primitive is `051-modal-and-sheet-componentization`'s, not this phase's** — resolved
at landing 2026-09-05, when the real `051` was written and this folder was renamed from `051` to
`055`. `051` ADR-003 promotes `openAndWait` (`modals/confirm-modal.ts:45`, module entry `:98`) to
the family's exported confirm and asserts `044`'s seven grammar elements on it. This phase's
`destructive.confirm` state **consumes** that primitive through its unchanged signature and
inherits the grammar without touching the component. `053`'s sort-conflict confirm consumes the same
one. Three packets, one confirm — which is the point of the componentization ask.

---

## RECONCILIATION, 2026-09-05 (later): the iOS simulator captures landed

`964a0b2a` landed **118 files — 59 states in light and dark — of Anytype's official open-source iOS
client**, built from source and run on a simulator, under `screenshots/anytype/mobile/`. Real iOS
chrome, indexed with a written description per file in `screenshots/anytype/README.md`. The pixels
are unread here; T001 opens them.

**Two of this phase's seven states gain a captured reference, and one true-up finding is narrowed.**

| State | Was | Now readable in |
|---|---|---|
| `empty.no-matches` | `design-trueup.md` REQ-009: an empty inline collection renders **no empty-state block at all**, just a `+ New Object` row — "there is nothing to adopt; ours is better" | On the phone Anytype **does** render one. `anytype-mobile-sheet-view-filters-empty` is indexed as "**Empty state and the `+`**", and `anytype-mobile-sheet-cell-multiselect-empty` reads **"No options — create first option to start"**. So the desktop finding stands and is now *desktop-scoped*: the product renders an empty state on the phone and not in a desktop inline collection. **The multi-select string is worth taking on its own merits** — it names the create action rather than the absence, which is what an empty state is for, and it is a better model than our word "Empty" |
| `destructive.confirm` | No confirm surface in any of the 151 desktop captures | **Still none.** No destructive confirm appears in the 59 mobile states either. The confirm stays **design inferred from source code, not seen**, and it stays `051`'s primitive |
| `success.notice` / `undo` | "No Anytype capture shows an undo surface and no `047` finding names one" | **Now partly false.** `anytype-mobile-sheet-object-more` is indexed as carrying **Undo/Redo** rows in the object's `···` menu. That is not a toast with an action — it is undo as a *menu row*, which is a different placement from ours and from the one this phase proposes. Worth reading before the toast leg decides where an undo affordance lives |
| `empty.deleted-relation` | The one real gap; no capture | **Still no capture.** Nothing in the mobile set shows a board grouped by a deleted relation. Stays code-derived |
| `loading` / `error` | No capture | **Still none** |

**And one thing the mobile set settles about item 14's page limit.** `anytype-mobile-set-grid` is
indexed as "horizontally scrolling grid over the catalogue's 28 typed columns" against the same
326-record space — so the phone renders a large set without a `Load more` row visible in the index's
description. That is not evidence of absence, but it is the screen to check first when T001 trues
the 60-row page limit, because 326 records is well past 60.

### Closed at T001, 2026-09-05

The pixels above are no longer unread. `design-trueup.md` is the reading, and it settles each row:
the phone empty states resolve into a **three-tier ladder**; the confirm is **still uncaptured on
both platforms** and stays `051`'s primitive; undo is confirmed as an iOS **menu row**, a placement
recorded but not built here; the deleted-relation state, `loading` and `error` remain uncaptured.
The `Load more` check was made and **no phone figure was taken** — a viewport is not a scroll to
the end — so the 60 stands from `anytype-set-gallery-view-dark.png`'s `Page limit  60 ›`.

One finding the mobile set added that the index could not: **destructive treatment is
platform-split.** A per-pixel scan of the desktop `···` menu returns **0 reddish pixels** on
`Move to Bin`, and 0 again on `Empty Bin`, while iOS renders `Delete` in `#FF4A4D` beside a red
trash glyph at 5.75:1. We adopt the icon-beside-colour pairing and keep `mod-warning`, which the
host theme owns (`design-trueup.md` C3).

