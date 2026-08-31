---
title: "Feature Specification: Remaining Freezes"
description: "Six freeze reports across five surfaces resolve to one shared trigger and one unbounded render; the previous fix closed one of three instances of the same forced-layout defect, and the card-pipeline hypothesis is refuted by measurement."
trigger_phrases:
  - "board view freezes"
  - "sort sheet freezes obsidian"
  - "filter sheet freeze"
  - "non table views freeze"
  - "full view refresh on sheet close"
  - "028 remaining freezes"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/028-remaining-freezes"
    last_updated_at: "2026-08-30T21:20:00Z"
    last_updated_by: "goal-reconcile"
    completion_pct: 30
    recent_action: "Criteria audited at f64dd87; 1 of 5 met, board hoist landed elsewhere, freeze open"
    next_safe_action: "Operator answers Q1-Q3 in spec.md section 7; no build starts before that"
    blockers:
      - "The operator reports the table view works, but measurement shows the table is the slowest surface here and still carries the unfixed per-row forced layout; four reconciliations were tested and all four failed"
      - "The operator's actual row count and column count are still unconfirmed; the freeze threshold is derived from a synthetic bench at a CPU throttle chosen as a phone stand-in, not from their device"
---
# Feature Specification: Remaining Freezes
<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:problem -->
## 1. THE REPORTS

Six, on version 1.3.7, after `024` shipped:

| # | Surface | Report |
|---|---------|--------|
| 1 | List view | "List view still bugged and freezes" |
| 2 | Sort sheet | "if you press add sort it disappears and app freezes" |
| 3 | Sort sheet | "Closing sort sheet also bugs things out" |
| 4 | Filter sheet | "Same problem with filter sheet" |
| 5 | Board view | "Board view is also completely bugged and freezes" |
| 6 | Calendar and others | "Same for calendar and other non table views" |

The last one is the most useful sentence in the set. It names a **boundary** — every non-table view
freezes, the table does not — rather than a list, and a boundary gives this phase a negative control
the surfaces alone would not.

---

## 2. THE SHARED TRIGGER

All four sheet reports route through one method: **`DatabaseView.refresh()`** in `database-view.ts`
(`grep -n 'refresh(options' src/views/database-view.ts`).

This cited line 11421 and the method is now at 11490. A line number in a file that grows is a claim
that expires without anyone touching it, so the symbol is named instead of its address.

It removes every top-level rendered result and calls `render()` again:

```
this.containerEl_.querySelectorAll(
  ":scope > .db-table, … :scope > .db-list, :scope > .db-list-grouped, …"
).forEach(el => el.remove());
try { this.render(); } finally { this.hideSkeletonLoader(); }
```

Every row is destroyed and rebuilt. The call sites that reach it from the two sheets:

| Interaction | Call site | Reaches |
|---|---|---|
| Press "+ Add sort" | `sort-panel-renderer.ts:88` — `actions.refresh()` | `refresh({ viewport: "reset-top" })` |
| Change a rule's field or direction | `sort-panel-renderer.ts:176`, `:194` | `refresh({ viewport: "reset-top" })` |
| Remove a rule | `sort-panel-renderer.ts:204` | `refresh({ viewport: "reset-top" })` |
| Sheet's own close action | `database-view.ts:2816` | `refresh()` |
| Toolbar button toggles it shut | `database-view.ts:2810` (`toggleHeaderPopover`) | `refresh()` |
| Click outside the sheet | `database-view.ts:2916` (`closeHeaderPopovers`) | `refresh()` |

The filter panel is wired identically at `database-view.ts:2801` and `:2787`.

**The sheets are not defective.** They are doorways onto a render that is too slow on the operator's
data. This is also the only explanation offered so far for why *closing* a sheet freezes, which is
otherwise a strange thing for a dismissal to do.

**It costs two rebuilds, not one — and not the three claimed here before it was counted.** Open a
sort sheet, add a rule, close it: the toggle that opens it does not refresh, the add does, and the
close does. The third rebuild this section originally claimed does not happen. It was read off the
call graph, which shows that an outside click reaches `closeHeaderPopovers` *and* that the panel's
own close reaches `refresh()` — but whichever runs first clears the four panel flags, and
`closeHeaderPopovers` returns early when they are all false. Reachable is not the same as executed,
which is the whole reason this claim needed an instrument rather than a reading.

Counted rather than inferred, by wrapping `DatabaseView.render` and driving the real
`toggleHeaderPopover`, `closeHeaderPopovers` and panel action closures — the harness is
`tools/bench/panel-refresh-bench.ts`, run by `tools/bench/run-panel-refresh.mjs`:

| round trip | open | change | dismiss | total |
|---|---|---|---|---|
| sort, dismissed by the toolbar button | 0 | 1 | 1 | **2** |
| sort, dismissed by an outside click | 0 | 1 | 1 | **2** |
| filter, dismissed by the toolbar button | 0 | 1 | 1 | **2** |
| filter, dismissed by an outside click | 0 | 1 | 1 | **2** |

At the threshold established in §4 that is on the order of **4.7 seconds** of unresponsive
application for one three-step interaction — the same per-rebuild cost this section already used to
reach 7 seconds, taken twice instead of three times. It is a smaller number than this document first
claimed and it is still a freeze.

**The dismissal rebuild is now conditional, and the round trip costs one.** Every sort and filter
mutation already re-renders the view as it mutates, so the rebuild on the way out was repeating the
entire row build to produce an identical result. `DatabaseView` now tracks whether a header-panel
change is still unpainted — set when a panel opens, cleared by every full render — and the three
dismissal paths rebuild only when something is owed. The column manager and view config panel are
excluded and keep rebuilding unconditionally, because their mutations are not all self-painting.

One coupled repair was required, not optional. The filter panel debounces a typed value by 220ms and
`clearPendingRefresh` **dropped** that pending refresh when the panel hid; the unconditional
dismissal rebuild was the only thing painting it. Making the dismissal conditional without also
flushing that timer silently discards a value typed and dismissed inside the window — confirmed by
running exactly that combination, which cut the round trip to one rebuild and left the view showing
`value: ""` against a state of `value: "ab"`. `flushPendingRefresh` now runs the owed refresh
instead of cancelling it.

**What still costs a rebuild, deliberately.** Opening a panel marks the view as owing a repaint, and
only the sort and filter panels may clear that debt without rendering. So opening a panel and
dismissing it without changing anything still costs one full rebuild, and the column manager and
view config panel still rebuild on every dismissal. Driving those to zero means trusting every panel
to repaint its own mutations, which is an audit this did not do — and the harness asserts the
exclusion holds rather than leaving it as a comment.

**This is a 2× reduction, not a fix.** It removes a repeated rebuild; it does not make a rebuild
affordable. At the §4 shape one rebuild is still ~2,300ms of blocked main thread at 6× throttle, so
a database large enough to freeze before this change is still large enough to freeze after it: the
threshold moves from roughly 2,300 rows to roughly 2,300 rows, because the per-rebuild cost is
unchanged and it is a single rebuild that already exceeds the budget. The
row-count question in §7 still gates the work that would actually bound the cost.

### 2A. "It disappears"

Report 2 says the sheet *disappears* before the freeze. The add handler renders the panel, then
calls `actions.refresh()`, and `refresh()` re-renders the panel a second time at `:11458`. Two of
the three panel renders in that click are redundant. Whether the disappearance is that churn, an
anchor lost when the toolbar is rebuilt (`positionToolbarPopover` at `sort-panel-renderer.ts:90`
with `this.anchorEl` possibly disconnected), or simply the app not painting for several seconds, is
**not established**. It is a secondary symptom of the freeze and should be re-checked after the
freeze is fixed, not chased first.
<!-- /ANCHOR:problem -->

---

## 3. WHAT `024` FIXED, AND WHAT IT LEFT

`024` found a real quadratic and closed it: `isTouchDevice()` measures its container with
`getBoundingClientRect()`, which forces a synchronous layout; called once per row inside the loop
appending to that container, every row made the browser lay out every row before it. Hoisting it to
a per-render `touchMode` field measured **8,646.0ms → 246.6ms blocked at 1,600 rows, 35.1×**.

That fix is correct and it is not in question here. What matters is its scope: **it edited
`list-renderer.ts` and nothing else.** Its own summary, §2, says so —

> **The same quadratic in `TableRenderer`.** Already measured and written up. Fixing it is a
> different phase with a different blast radius.

— and that different phase is this one. The board renderer is not mentioned there at all, and it
carries the same construct.

`024` also concluded *"Both renderers are linear once the forced layout leaves the loop."* That
holds at the row counts it measured. It stops holding above them; see §4.

---

## 4. THE ROW COUNT

Every freeze number this program has produced came from a bench whose default stops at 400 rows and
whose highest recorded run was 1,600. **The curve bends above 1,600**, so the ceiling sat exactly
below the evidence.

Run: `npm run bench:list -- --rows=400,1600,3200,6400,12800 --cols=21 --fill=0.3 --repeats=3`,
exit **1**.

| desktop, 21 cols, 30% fill | render | layout | blocked | ms/row |
|---|---|---|---|---|
| 400 | 18.3 | 39.9 | 58.2 | 0.0458 |
| 1,600 | 81.3 | 161.8 | 243.1 | 0.0508 |
| 3,200 | 202.1 | 344.0 | 546.1 | 0.0632 |
| 6,400 | 517.3 | 642.7 | 1,160.0 | 0.0808 |
| 12,800 | 1,493.7 | 1,384.0 | **2,877.7** | 0.1167 |

`30% fill, 21 cols: SUPERLINEAR (per-row ×2.55)` on desktop and **×3.21** at phone width, against
the harness's own 2,000ms budget:

```
list-bench: FAIL — 2877.7ms of blocked main thread (1493.7ms render + 1384ms layout)
exceeds the 2000ms budget
```

### 4A. At phone-class CPU

The bench's "phone" surface is a 390px viewport in desktop Chrome on an M-series Mac. It is not a
phone CPU, and the operator interacts through bottom sheets, so the device that froze is a phone.
Re-measured under CDP `Emulation.setCPUThrottlingRate` (`acceptance-criteria.md` §1 names the
driver), 21 columns, 30% fill:

| rows | 1× | 4× | **6×** |
|---|---|---|---|
| 400 | 45.1ms | 193.8ms | 292.3ms |
| 1,600 | 196.1ms | 836.0ms | **1,290.5ms** |
| 3,200 | 429.2ms | 1,789.0ms | **2,990.0ms** |

Interpolating between the last two, the list crosses 2,000ms at **≈2,300 rows**. One interaction is
three rebuilds, so a sort-sheet round trip at that shape costs **≈7 seconds**.

**So the operator's vault needs roughly two to three thousand rows at their 21 columns — not the
twelve thousand a 1× reading would suggest.** The throttle multiplier is a stand-in and is stated as
such; §7 asks for the real number.

It is scale. That makes this a **virtualisation** question rather than a micro-optimisation one:
nothing bounds the work. `ListRenderer.render` iterates `for (const row of rows)` with no cap
(`list-renderer.ts:171`), and no view virtualises. Rows are capped only inside groups, via
`getGroupVisibleCount` — and the table does exactly the same, so it is not the boundary.

---

## 5. THE FORCED-LAYOUT AUDIT

33 non-test call sites of `isTouchDevice(container)`, each of which reaches
`getBoundingClientRect()` through `getContainerWidth` (`touch-environment.ts:30`). Classified by
whether they sit in a per-item build loop:

| Site | Enclosing | Status |
|---|---|---|
| `list-renderer.ts:161` | `render` | **Fixed by `024`** — hoisted to `touchMode` |
| `list-renderer.ts:184` | `renderGrouped` | **Fixed by `024`** — hoisted to `touchMode` |
| **`board-renderer.ts:770`** | `renderCard` (`:730`), called from loops at `:334`, `:583`, `:657` | **PER CARD — live** |
| **`table-renderer.ts:790`** | `renderRow` | **PER ROW — live** |
| **`table-record-peek.ts:90`** | `attachTitleOpenAffordance`, per title cell | **PER ROW — live** |
| remaining 28 | per-render, per-event, or per-popover | Not per-item |

Two details matter.

**Board is `024`'s defect in `024`'s shape.** `board-renderer.ts:770` reads
`!this.actions.isReadOnly && !isTouchDevice(this.boardEl)` inside the function that builds a card,
called from three loops that append to the same `cards` container. That is the same
measure-inside-the-appending-loop construct, in a file `024` never opened. It explains report 5
without needing a new theory.

**The table's is worse, not better.** `table-renderer.ts:790` reads
`isTouchDevice(this.renderContainer) && (…)`. The touch call is the **left** operand, so unlike list
and board — which short-circuit behind `!isReadOnly` — it runs unconditionally on every row. This is
the single strongest piece of evidence against the reported boundary, and §7 is where it goes.

---

## 6. THE CARD-PIPELINE HYPOTHESIS IS REFUTED

The natural reading of "table works, everything else freezes" is the two cell pipelines: the table
renders through `cell-renderer.ts`, and list, board, gallery and the record panel all render through
`card-field-renderer.ts` (`list-renderer.ts:38`, `board-renderer.ts:45`, `gallery-renderer.ts:41`,
`record-detail-panel.ts:42`). That split is this program's own architecture finding, and it predicts
exactly the observed boundary.

**It does not survive measurement.** Real `ListRenderer` against real `TableRenderer`, one matched
shape, 21 columns, 30% fill, 390px:

| rows | list blocked | table blocked | table nodes | ratio |
|---|---|---|---|---|
| 400 | 45.1ms | 65.1ms | 12,122 | list is 0.7× |
| 1,600 | 196.1ms | 293.8ms | 48,122 | list is 0.7× |
| 3,200 | 429.2ms | 712.6ms | 96,122 | list is 0.6× |
| 6,400 | 1,049.6ms | 2,037.7ms | 192,122 | list is 0.5× |
| 12,800 | 2,665.3ms | **5,641.7ms** | 384,122 | list is 0.5× |

The table is slower at every row count, builds ~10% *fewer* DOM nodes, and drifts worse
(**×4.5 per-row** against the list's ×3.2). And this flatters the table twice over: its `renderCell`
is stubbed to `td.setText(…)`, constant time, so the real `cell-renderer.ts` cost is entirely absent;
and its per-row forced layout is the unconditional one from §5.

If cost through the card pipeline were the cause, the table would freeze first. **It is not the
cause, and this phase should not be spent in `card-field-renderer.ts`.**

Also rejected, each with evidence:

- **`syncCardRoving` scanning per card** — one `querySelectorAll` and one linear pass over the
  result (`card-roving-tabindex.ts:368-377`). Linear and cheap.
- **A `ResizeObserver` feedback loop** — `observeTouchEnvironment` re-renders on touch-mode change,
  but the callback at `database-view.ts:1345` returns unless the boolean actually flips.
- **`findVisibleAnchor` forcing layout per row** — it early-returns on the first visible candidate
  and performs no interleaved DOM writes (`database-viewport.ts:161-175`).
- **The table paginating or virtualising** — it does not; it caps rows only within groups, as the
  card views do.
- **Column visibility differing** — both draw from the same
  `getVisibleColumns(config, rows, this.vs(), this.pendingShowColumns)` (`database-view.ts:690` for
  the table, `:458`/`:738`/`:763`/`:795` for the card views).

---

<!-- ANCHOR:questions -->
## 7. THE OPEN CONTRADICTION — RESOLVE BEFORE BUILDING

**Measurement and the report disagree.** The table is the slowest surface measured here and carries
an unfixed unconditional per-row forced layout; the operator reports it works. Both cannot be true
of the same data, and all four available reconciliations failed (§6).

Three possibilities remain, and they lead to different builds:

1. **The table view is a different database, or a filtered subset with far fewer rows.** Then the
   boundary is an artefact, the defect is plain scale, and the answer is virtualisation.
2. **The table view hides most of its columns while the list shows all 21 properties.** The column
   source is shared, but the *saved per-view config* is not. A 3-column table against a 21-column
   list would flip every ratio in §6.
3. **It is genuinely the same data and the same shape.** Then something is still unfound, and
   building virtualisation now would aim at the wrong target.

**Ask the operator, before Stage 2:**

- **Q1.** How many notes does the database that freezes contain?
- **Q2.** In the table view that works, how many columns are visible — and is it the same database
  and the same filters as the list view that freezes?
- **Q3.** Which device, and does the table stay responsive on that same device with that same data?

`plan.md` gates Stage 2 on these. Do not invent the numbers.
<!-- /ANCHOR:questions -->

---

<!-- ANCHOR:scope -->
## 8. SCOPE

**In scope.** The shared trigger in `refresh()`; bounding the per-render row work; the two live
per-item forced layouts at `board-renderer.ts:770` and `table-renderer.ts:790`; the redundant sheet
re-renders in §2A; extending the bench past the ceiling that hid this.

**Out of scope.** `card-field-renderer.ts`, refuted in §6. The `table-record-peek.ts:90` per-cell
call, which is real but sits on the surface the operator says works — record it, do not fix it here.
CSS: this phase takes no lane. Anything under `020`–`025`, `026` or `027`, which belong to other
agents.
<!-- /ANCHOR:scope -->

---

## 9. STATE AT HANDOVER

Nothing in `src/` was changed. No commit. The two benches were run, not edited; the comparative
driver in §6 lives outside the repository and is reproduced in `acceptance-criteria.md` §1 so its
numbers can be re-derived.

| | |
|---|---|
| `npm run bench:list` (defaults) | PASS, LINEAR at all 8 shapes, worst 95.6ms — the ceiling that hid this |
| `npm run bench:list -- --rows=…12800 --cols=21 --fill=0.3` | **FAIL, exit 1**, 2,877.7ms, SUPERLINEAR ×2.55 |
| `src/` working tree | unmodified |
