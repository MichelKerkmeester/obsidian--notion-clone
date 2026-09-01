---
title: "Goal: Remaining Freezes"
description: "What would make phase 028 worth having done, and the criteria that decide it."
trigger_phrases:
  - "028 goal"
  - "remaining freezes goal"
  - "non-table view freeze"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/028-remaining-freezes"
    last_updated_at: "2026-09-01T02:10:00Z"
    last_updated_by: "timeline-freeze-diagnosis"
    recent_action: "Table sweep re-run: x0.01 is the windowing cliff; below it 4 cols read x1.79"
    next_safe_action: "Trace the sub-threshold superlinear term in the detached table build"
    blockers:
      - "The list needs virtualisation; at the operator shape it spends 2.0-4.9s blocked and no loop fix reaches it"
      - "Every fix is measured on a bench, never on the operator device"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../024-list-view-freeze/implementation-summary.md"
      - "../../../../tools/bench/timeline-render-bench.ts"
      - "../../../../tools/bench/calendar-render-bench.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-028-goal"
      parent_session_id: null
    completion_pct: 67
    open_questions:
      - "Why was the calendar reported freezing when its render is bounded and measures 30ms at 12,800 rows"
      - "Does virtualising the list belong in this phase or its own"
    answered_questions:
      - "The card pipeline is not the cause; the table is slower at every row count measured"
      - "Building the list body off-document does not help; no per-row layout read to coalesce"
      - "The timeline froze on a per-event touch probe that read the growing container; hoisting it restores linearity"
      - "The calendar renders a bounded window, so its cost does not scale with row count"
      - "Operator shape is 1,000-3,000 rows at 80-100% fill; the 2,000ms budget breaks at 1,300"
      - "The list remainder is layout over node count, not a loop: 3,722ms of 4,909ms at 3,000 rows"
---
# Goal: Remaining Freezes

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every view the operator opens — list, board, gallery, calendar, timeline — opens
without freezing, and adding a sort or closing a sheet never stops the app responding.

**The boundary was one defect. It is three.** Six reports read as one — every non-table view
freezes, the table does not — and that framing bought a control nothing could fake. It was wrong in
both directions. List, board and gallery shared a per-row scan over the whole row set to decide
whether a basename was shared; the table was fast because its default asks about one row. That is
fixed and measured (`../024-list-view-freeze`). The **timeline** carried a separate defect of the
same family — a touch probe per event, reading a container the events were still being appended to
— now found, fixed and guarded. The **calendar** has no render-cost defect at all: its window is
bounded, so its cost does not scale with row count in any scale it offers.

**What remains at scale is not a loop, and the operator's numbers now say it bites.** They confirmed
**1,000-3,000 rows at 80-100% fill**. At 21 columns and phone-class throttle the budget breaks at
**1,300 rows**, and 3,000 rows spend **4,908.6ms** blocked — of which 3,722.5ms is layout over
225,007 nodes. The shape is LINEAR, so the cost is proportional to how many nodes exist rather than
how they were built. That is a virtualisation question and nothing else reaches it.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The table is the control. Any candidate cause also on the table path is refuted by the table working. |
| D2 | No verdict from a range that stops below the bend. A run at or under 3,200 rows cannot see this. |
| D3 | Phone-class CPU, or the number is a Mac's. Quote throttled figures or none. |
| D4 | A refuted hypothesis stays recorded with its reason, so nobody spends the day again. |
| D5 | The operator's row count and fill rate have no substitute. A bench default in their place is what made 1,600 rows look like a ceiling. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] One full-view rebuild stays under 2,000ms at the operator's confirmed shape, at phone-class
      CPU. **Was no; is now yes.** The operator confirmed **1,000-3,000 rows at 80-100% fill**, and
      at that shape the list broke the budget at **1,300 rows** and reached **4,908.6ms at 3,000**.
      Windowed, the same shape measures **48.4ms at 3,000 rows and 50.3ms at 3,400** — node count
      flat at 2,184 rather than 225,007. The record of the breach is kept above because the fix is
      only legible against it.
- [x] The per-item forced layout is gone from `board-renderer.ts` and `table-renderer.ts`, each shown
      failing first. **Board is fixed** (`3485d7a`), asking once per render. **The table is fixed
      2026-09-01, and the reasoning that had left it open was wrong about which node was read.**
      The log said the table's per-row reads were harmless because it builds its body off-document.
      The reads are not on the body. `isTouchDevice(this.renderContainer)` reads the **render
      container**, which is attached, and it was asked twice per row — `getSelectionColumnWidth`,
      the reorder-button branch and `setupRowDrag`. Measured before the fix: **4005 of 4005 layout
      reads taken against a connected node over 2,000 rows**, which is every forced layout this
      renderer takes. After hoisting the question to where the container is bound: **3 of 3**.
      **The check had to be able to tell those apart**, which is why the bound-of-8 this phase
      specified was unusable and was recorded as such rather than written to lie. A geometry read on
      a detached node forces no layout, so a bound over the total would fail a correct
      implementation. The bound that survives is over the **connected** reads alone, and
      `countLayoutReadsSplit` in the render-assertion harness now keeps the two populations apart.
      Observed red at `4005 of 4005 … bound 8` on the tree as received, on both bags.
      **It buys no measured time here, and the row says so.** The table bench over 400 → 1,600 rows
      reports the same layout column before and after (17.9 / 36.7 / 73.8ms at 4 columns), because
      the document is not being mutated between those reads, so all but the first flush nothing.
      What changes is that the count is now bounded: the same code inside a render that *does* dirty
      the document pays 4,000 real layouts, and nothing was stopping that from arriving.
- [ ] The scaling verdict is not SUPERLINEAR at any measured shape up to 12,800 rows. **Confirmed
      LINEAR ×1.06 across the operator's own range** (1,000-3,000 rows, full fill, 6× throttle), so
      what remains is node count rather than a loop. **The list arm
      is closed:** SUPERLINEAR ×2.56 → LINEAR ×1.07 over 400 to 12,800 rows, 21 cols, full fill, with
      per-row cost flat at 0.057–0.063ms and the prior state restoring ×1.92 as control.
      **The table sweep was re-run 2026-09-01, and the stale ×4.5 is replaced by two numbers rather
      than one, because one of them is manufactured by a cliff.**
      *Over the full range* 400 → 12,800 rows the verdict is **SUBLINEAR ×0.01** at both 4 and 16
      columns. That number is not a scaling result: table windowing engages at 2,000 rows, so the
      sweep falls off a cliff — 16 columns go `124.2ms / 43,297 nodes` at 1,600 rows to
      `3.1ms / 422 nodes` at 3,200. Quoting ×0.01 as the answer would be quoting the threshold.
      *Below the threshold*, where the renderer still builds every row, the same tool over
      400 → 1,600 rows reports **4 columns: SUPERLINEAR ×1.79** and **16 columns: LINEAR ×1.45**.
      So the criterion as written is **not met**: there is a measured shape that reads SUPERLINEAR.
      **What that costs, stated so the row is not read as a freeze.** The worst un-windowed shape is
      1,600 rows: 78.1ms detached at 4 columns, 121.7ms at 16. The superlinear range is bounded above
      by the windowing threshold, so the worst case is bounded too — it is a real term, and it cannot
      grow past ~2,000 rows.
      **It is not the forced-layout term, and the sweep says so.** The reported layout time grows
      **linearly** with rows — 17.5 → 35.9 → 73.7ms at 4 columns for 400 → 800 → 1,600, which is ×4.2
      for ×4 rows. The per-row *total* rises at both column counts (0.0280 → 0.0500 at 4 columns,
      0.0533 → 0.0772 at 16); 16 columns is classified LINEAR only because the tool's threshold falls
      between ×1.45 and ×1.79. So this is one mild term of roughly n^1.2 present at both shapes,
      sitting outside layout, and it is in the build rather than in attachment — the detached numbers
      carry it too (9.6 → 78.1ms at 4 columns).
      **What would close it.** Either find and remove that term, or restate the criterion to bound
      absolute cost at the threshold rather than to forbid a shape. Restating is not taken here: the
      row was written to catch exactly this, and a measurement that fails it is the row working.
- [x] Opening, mutating and dismissing a sort or filter sheet costs **one** rebuild, not three.
      **Met by the tree, not by this phase:** `7ad775b` made opening and dismissing free and left the
      single rebuild on the mutation. This bounds the number of rebuilds, never the cost of the one.
- [x] The table remains the control: whatever is fixed explains why the table was already fine.
      **Now fully explained, by two different causes.** The one-row default explains list, board and
      gallery against the table. The timeline is explained by a second, unrelated defect of the same
      family — a geometry read per item over a growing attached container — which the table never had
      because it builds its body off-document. The calendar needed no explanation: it was never
      superlinear, so the report against it is not a render-cost defect at all.
- [x] Calendar and timeline have a measured cause, on a bench that exists. **Both benches now
      exist and both arms are answered, and the answers differ.** The timeline froze on a per-event
      touch probe reading the growing container: SUPERLINEAR ×1.95 → LINEAR ×0.98, 8,547.9ms →
      234.2ms blocked at 6,400 rows, desktop, 21 cols, full fill. The calendar does **not** scale
      with row count at all — its drawn window is bounded, so 12,800 rows cost 30.3ms and its DOM
      is a constant 325 nodes. Both renderers are now constructed by the gate check
      (`../026-production-render-assertions`), which reads 964 layout reads against a bound of 8 on
      the pre-fix tree and 5 after.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

### The timeline arm: found, measured, fixed, and guarded

**The timeline had the same family of defect as the list, in a renderer nobody had ever driven.**
`renderTimelineEvent` asked `isTouchDevice(this.timelineRoot)` once per event, and that question is
answered by reading the container's box. The events go into the attached timeline root, so every
event re-laid-out everything appended so far. Quadratic, in a renderer with no bench and no gate
assertion — the same combination that let the list's quadratic ship.

Measured on the same tree, desktop and phone, 21 columns, full fill, 400 to 6,400 rows:

| Reading | Before | After |
|---|---|---|
| Scaling verdict, desktop | SUPERLINEAR ×1.95 | LINEAR ×0.98 |
| Segments, desktop | 1.65 / 2.06 / **2.57** | 1.23 / 0.55 / 0.95 |
| Blocked at 6,400 rows, desktop | 8,547.9ms | 234.2ms |
| Blocked at 6,400 rows, phone | 3,725.4ms | 171.6ms |
| ms/row at 6,400 rows | 1.3349 | 0.0273 |
| Layout reads at 1,600 rows (gate check) | 964, bound 8 | 5, bound 8 |

The fix is the hoist the board already shipped: decide the touch question once per render, on the
container rather than on the element that grows during the loop. **The DOM is unchanged** — 21,846
nodes and 3,840 event bars before and after, at every row count and both widths — so this changed
cost, not output. LINEAR at every scale the renderer offers: day ×1.10, week ×0.98, month ×1.11.

**The read-only embed paid this too.** The old condition evaluated the touch probe *before* the
read-only guard, so an embedded timeline forced a layout per event for a mobile menu button it then
declined to render. The gate check exercises both bags, and the pre-fix control fails on both.

### Refuted: that the calendar and the timeline share a cause

They were reported together and this phase carried them as one unknown. They are not alike.

The calendar's cost **does not scale with row count in any scale it offers**. Its render draws a
window — one month, one week, one day — and caps what lands in it, so the DOM it builds is constant:
325 nodes and 84 segments at 400 rows and at 12,800 alike. Blocked main thread at 12,800 rows is
30.3ms, fitted ×0.64, and the gate check counts **zero** layout reads during its render.

So there is no render-cost defect in the calendar to find, and looking for one is how the next
session loses a day. Whatever the operator saw is either upstream of the renderer — the host's
rebuild path, which every sheet report already routes through — or not a cost problem at all. Note
what is genuinely untested: no bench drives the calendar through a live `App`, and a vault-resolving
field costs more there than here, never less.

### Two fixtures that measured nothing, and how they announced it

Both date-driven views anchor their drawn window on **today** when the config does not pin it, and
a fixture dated anywhere else renders an empty view very quickly. The first timeline run reported a
clean LINEAR ×0.61 while drawing **zero** event bars: every event sat before the window and came out
as a jump indicator. The day-scale calendar did the same. Both are now pinned — `timelineAnchor`,
`calendarMonth`, `calendarDay` — and both benches report the drawn-item count beside the row count
so an empty run is legible rather than fast. The gate check asserts that count is non-zero **before**
any per-item bound, because a window that drew nothing satisfies every such bound trivially.

This is the packet's own lens pointing at a bench rather than at a product check: the fixture, not
the renderer, supplied the number that made the first run look green.

### A harness gap, not a plugin defect

The day-scale calendar could not be measured at all until the DOM shim grew `show`/`hide`. Obsidian
patches them onto `HTMLElement`; the shim did not have them, and the only two call sites in the
plugin sit in the current-time line of the one view no bench had ever driven. The shim now carries
them, defined through inline `display` as the typed contract's `isShown()` wording requires.

**STATE: the timeline is solved on a bench; the calendar needed no fix.** Two things moved underneath it
from other work — the board renderer's per-card forced layout was hoisted (`3485d7a`), and the
sort/filter sheet's three rebuilds became one (`7ad775b`) — and the list's second superlinear term
was found and fixed in `024`. None of that has been confirmed on the operator's device.

**READ FIRST:** `../024-list-view-freeze/goal.md`, then this folder's `spec.md` and
`acceptance-criteria.md`.

### The defect that explained the boundary, and the half it does not explain

Deciding whether a row's basename is shared scanned every other row. List, board and gallery each
called it with the whole row set **and materialised that set per row**, so every row paid an
n-element allocation plus an n-element scan. It is worst in the ordinary case: with all-distinct
basenames the scan never matches and never exits early, so every row walks the whole set. The table
was fast because its default asks about a **single** row — a one-element array.

So the boundary that framed this phase was a default argument, not an architecture. Fixed by
indexing repeated basenames once per render in `src/views/file-title-display.ts`, consumed by the
three renderers. Measured on the same tree, 21 columns, full fill, 400 to 12,800 rows:

| Reading | Before | After |
|---|---|---|
| Scaling verdict | SUPERLINEAR ×2.56 | LINEAR ×1.07 |
| Per-row cost, 400 → 12,800 | rising | flat at 0.057–0.063ms |
| Render at 12,800 rows | 2,016ms | 784ms |
| Control: prior state restored | — | SUPERLINEAR ×1.92, render 1,459ms |

**Calendar and timeline never call that helper.** Their freeze is a different, undiagnosed defect,
and there is no bench for either. That is now the largest unknown in the packet, and the reports
that read as one bug are at least two.

### Refuted: building the list body off-document

The obvious next move was the pattern the table uses — build the body detached, attach once. It
moved the verdict from superlinear to superlinear and was reverted. **Nothing in those loops reads
layout per row**, and absent a read the browser coalesces invalidation rather than laying out per
append. The table's comment about off-document construction is true for tables and does not
generalise. Recorded so the next reader does not re-spend the day.

### Refuted: the card pipeline

The table renders through `cell-renderer.ts` and every other view through `card-field-renderer.ts`,
and that split is the architecture research's own root finding. It died on measurement. At one
matched shape — 21 columns, 30% fill, 390px, real `ListRenderer` against real `TableRenderer` — the
table is slower at **every** row count: 65.1ms against 45.1ms at 400 rows, 712.6ms against 429.2ms
at 3,200, 5,641.7ms against 2,665.3ms at 12,800 — while building 10% *fewer* DOM nodes, with its
cell renderer stubbed to constant time, which flatters it. If the card pipeline were the cause the
table would freeze first. **Do not spend this phase in `card-field-renderer.ts`.**

### What is left is linear, and large enough to matter

At 12,800 rows, 2,684ms of layout still comes from a **single forced read over 960,007 nodes**. That
is proportional to node count, not to how the nodes were built, so no change inside a row loop
touches it. Measured earlier at phone width, 21 columns, 6× throttle:

| rows | 100% fill | 30% fill |
|---|---|---|
| 400 | 624.1ms | 273.2ms |
| 800 | 1247.8ms | 545.9ms |
| 1600 | **2638.1ms** | 1226.6ms |
| 2400 | **4108.0ms** | — |

At full fill the budget breaks near 1,300 rows; the same 1,600 rows at 30% fill clear it. The
earlier note recording a crossing at roughly 2,300 rows was measuring a fill rate it did not state.
So the question to the operator is **row count and fill**, not row count alone.

### The sheet trigger, and why closing one froze

Every sheet report routes through `DatabaseView.refresh()`, which removes all top-level rendered
output and calls `render()` — a full rebuild of every row. The sheets were never broken; they were
doorways onto a render too slow on the operator's data, which is why *dismissing* one froze.
`7ad775b` cut three rebuilds to one: opening runs the panel renderers and sets a flag without
calling `refresh()`, mutating calls it exactly once, and all three dismissal routes are guarded on
that now-false flag. `spec.md` §2 and §2A describe the tree before it and are stale on this point.

### The table forced-layout check was specified, measured, and not built

This goal owed a check wrapping the table's render in the layout-read counter with a bound of 8, the
same bound the list branch holds. It was measured before being written, and it fails a correct
implementation. The counter patches `getBoundingClientRect` on `Element.prototype`, so it counts
every call whether or not the element is connected. The table asks whether it is on a touch surface
twice per row — the reorder button, then row drag — and each reads the container's rect. At two
thousand rows that is roughly four thousand counted reads against a bound of eight.

Those reads are not the quadratic. The table builds its body off-document and attaches it once, so
each read costs a layout of the document as it stands, not of the rows accumulated so far. Constant
work, N times: linear. The list froze because its rows went into the attached container, which made
every read re-lay out everything already appended.

So the table's safety is real but **accidental** — it rests on the body staying detached, not on the
call sites being few. The check that guards it already exists and asserts the right thing: no row
appended to a connected table. If anyone attaches the body before filling it, those same two reads
become quadratic immediately, and that check goes red the same day.

Recorded rather than built, because a bound of eight on a renderer that legitimately makes two reads
per row is the fourth criterion in this packet that would fail correct code — and the first of the
four introduced by a specification rather than by an implementation. Specifying a check is exactly
as error-prone as writing one.

### The operator's shape, and why the remaining work is virtualisation

The two numbers this phase could not proceed without are answered: **1,000-3,000 rows at 80-100%
fill**. Measured at 21 columns and 6× CPU throttle, which is the phone-class figure D3 requires:

| rows | blocked, desktop | blocked, phone |
|---|---|---|
| 1,000 | 1,654.1ms | 1,622.2ms |
| **1,300** | **2,022.9ms** | **2,066.3ms** |
| 1,600 | 2,432.9ms | 3,110.0ms |
| 2,000 | 3,006.6ms | 3,095.7ms |
| 3,000 | 4,765.2ms | 4,908.6ms |

**The budget breaks at 1,300 rows and the operator's range starts at 1,000.** Even the bottom of
their range spends 1.6s blocked, which is a visible stall rather than a freeze; the top spends
nearly five seconds.

The shape is **LINEAR ×1.06**. The quadratic really is gone, and that is exactly why no further
loop work helps: at 3,000 rows the render is 1,186.1ms and the **layout is 3,722.5ms**, over
225,007 nodes — roughly 75 nodes per row across 21 columns. Layout is three quarters of the cost and
it is proportional to how many nodes exist, not to how they were built.

So the remaining lever is **virtualisation**, and it is the only one. Cutting per-row node count
would help proportionally but the ratio is unforgiving: clearing 2,000ms at 3,000 rows means
rendering roughly a fifth of what is rendered now. A window does that; trimming nodes does not.

### Traps

A pipe makes `$?` the pipe's status — use `cmd >log 2>&1; echo $?`. The screenshot fixtures render
hand-written markup and import nothing from `src/`, so they cannot see any of this; `tools/bench/`
and `verify-placement.mjs` do bundle shipped code and are the instruments that can. The shipped
table bench stubs `renderCell` to `td.setText`, so it measures structure only and flatters the
table — say so wherever you quote it. `bench:list` defaults stop at 400 rows and the old ceiling was
1,600: **any run that does not pass `--rows` past 3,200 cannot see this defect at all.** `run-list.mjs`
now takes `--throttle`, and the flag moves the measurement rather than decorating it — the same shape
reads 97.1ms at 1× and 625.3ms at 6×.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Per-row basename scan | Fixed in `024`, measured | ×2.56 → ×1.07 to 12,800 rows; control returns ×1.92 |
| Board per-card forced layout | Hoisted elsewhere | `3485d7a`, asked once per render |
| Sheet rebuild count | Fixed elsewhere | `7ad775b`, three rebuilds to one |
| Off-document list body | Refuted, reverted | Superlinear before and after |
| Card pipeline hypothesis | Refuted | Table slower at every row count, with fewer nodes |
| Remaining layout at scale | Open, unbuilt | 2,684ms over 960,007 nodes at 12,800 rows |
| Timeline per-event touch probe | Fixed, measured, guarded | ×1.95 → ×0.98; 8,547.9ms → 234.2ms at 6,400 rows; gate reads 964 → 5 against a bound of 8 |
| Calendar render cost | Measured, no defect | Bounded window: 325 nodes and 30.3ms at 12,800 rows, ×0.64, zero layout reads |
| Calendar and timeline benches | Built | `tools/bench/calendar-render-bench.ts`, `tools/bench/timeline-render-bench.ts`, both through the shared card-bench driver |
| Operator confirmation | Open | Q1-Q3 unanswered |

### Deviations and findings

| Item | Note |
|------|------|
| The single-boundary reading is refuted | It held for list, board and gallery against the table, and explains nothing about calendar or timeline. The reports are at least two defects |
| Calendar and timeline are not one unknown | Measured separately, they behave oppositely: the timeline was quadratic in event count, the calendar does not scale with row count at all. Carrying them as one item is what kept both undiagnosed |
| Two fixtures passed while drawing nothing | Both views anchor on today when unpinned, so the first timeline run reported LINEAR ×0.61 over **zero** event bars. Anchors are pinned and the drawn-item count is now asserted non-zero ahead of every per-item bound |
| The shim, not the plugin, blocked the day scale | `show`/`hide` are Obsidian `HTMLElement` patches the shim lacked, and the only two call sites sit in the one view no bench drove. Added through inline `display`, per the typed contract's `isShown()` wording |
| The table bound-of-8 remains unbuilt | Unchanged by this work. The timeline's bound of 8 is a different case: it makes no legitimate per-item read, so the bound holds with margin at 5 |
| `completion_pct` introduced at 15 | This document carried no continuity block before today, so this is a first value rather than a raise. One criterion of six is met, and that one was met by another commit |
| Table bound-of-8 check not built | Specified, then measured as failing a correct implementation. The guard that already exists — no row appended to a connected table — asserts the right property |
| `spec.md` §2 and §2A are stale | They describe the three-rebuild tree that `7ad775b` replaced. Left for the phase author; the rest of `spec.md` still holds |
<!-- /ANCHOR:log -->

---

## THE CLOSE-FREEZE HAS AN OWNER NOW, AND IT IS NOT A RENDER COST

Operator report 27 — *sometimes* freezes on closing — is **not** this phase's kind of defect, and
carrying it here would have sent the next reader hunting a rebuild cost that is not there.

A research pass verified against the shipped bundle that `applySheetChrome` has six call sites and
only **two** ever pass `false`. Every sheet mounted through the shared positioner creates a
body-level scrim at `inset: 0` with `pointer-events: auto` and never removes it; two panels never
remove the sheet either. A dimmed, tap-swallowing overlay across the whole app is what a user calls
a freeze, and it is a lifecycle defect, not a render-cost one.

It belongs to `../031-sheet-lifecycle-ownership`. **What stays here** is the render-cost half: the
list at the operator's shape, which is now `../033-list-virtualisation`, and the table sweep that
still reads x4.5 and has never been re-run.

The intermittency that made this look like a render cost is explained too. A container-wide keyboard
inset does cost 55ms per write at 36,001 nodes under throttle, and that is size-dependent — but
three dropped frames is jank, not a hang. Adopting it would have closed report 27 against the wrong
mechanism.
