---
title: "Goal: List View Freeze"
description: "What would make phase 024 worth having done, and the criteria that decide it."
trigger_phrases:
  - "024 goal"
  - "list view freeze goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/024-list-view-freeze"
    last_updated_at: "2026-08-31T05:15:00Z"
    last_updated_by: "goal-reconcile"
    recent_action: "AC-2 met: basename index lands LINEAR x1.07 to 12,800 rows; control returns x1.92"
    next_safe_action: "Answer the width half of AC-5 with a standing check; leave AC-6 to the device"
    blockers:
      - "Non-table views still freeze on device; 028 owns the remaining cause"
      - "No standing check reserves-by-width under is-phone; AC-5 measured it once by hand"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-024-goal"
      parent_session_id: null
    completion_pct: 70
    open_questions:
      - "How many rows does the operator's database hold, and at what fill rate"
      - "Is the desktop reservation worth keeping now that it measures as redundant"
    answered_questions:
      - "c31acf5 is not the cause; the same list took 6,777ms on the commit before it"
      - "The superlinear term was a per-row basename scan, not the hoisted forced layout"
---
# Goal: List View Freeze

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Opening a list view does not block the main thread at any row count the operator's
vault can hold, and the column alignment the renderer buys survives the fix.

**Two superlinear terms, months apart.** First, `isTouchDevice()` read the container's rect
once per row inside the loop appending to it — hoisted, 8,646.0ms to 246.6ms at 1,600 rows. Second,
and why the verdict stayed SUPERLINEAR above that: **deciding whether a row's basename is shared
scanned every other row**, over a set built per row. Indexed once per render the curve flattens;
the table was fast only because its default asks about one row.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The budget asserts the **whole blocked main thread**, render plus forced layout. Render alone is the wrong half. |
| D2 | The reservation predicate is the property itself: can two properties share a line, read off the field area rather than a platform flag. |
| D3 | No windowing decided from the row loop. What remains at scale is layout over node count — `028`'s. |
| D4 | No scaling verdict from a single sample, and none from a range that stops below the bend. |
| D5 | Measure before fixing. A suspect that survives inspection can still die on measurement. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] Opening a list view stays inside the declared 2,000ms budget on the **blocked main thread**.
      **Met, by the bench:** 8,646.0ms → 246.6ms at 1,600 rows, 21 cols, 30% fill, observed failing
      first with 5,000ms injected layout. `phone` rows are phone width on a Mac CPU; throttled 6×
      it reads 1,290.5ms.
- [x] Per-row cost reports LINEAR at every measured shape; a one-row-count run prints no verdict.
      **Met.** Indexing repeated basenames once per render moves the verdict **SUPERLINEAR ×2.56 →
      LINEAR ×1.07** over 400 to 12,800 rows, 21 cols, full fill; per-row cost holds at
      **0.057–0.063ms**, render at 12,800 falls **2,016ms → 784ms**, and restoring the prior state
      returns **×1.92**.
- [x] A property starts in the same column on every card, asserted against renderer output, not a
      fixture. **Met:** 4 properties over 12 cards, worst in 1 column; 12 cards, 1 meta width
      of 616px.
- [x] A reserved column costs one element and no rendered content. **Met:** 14 columns, 0 children.
- [ ] A slot is reserved only where a slot exists to reserve, on every surface and at every width.
      **The width half has no standing check** — the captured run covers desktop and one 402px
      phone, neither being the case this was written about. The check it owes is in the log.
- [ ] The operator confirms on device that the list view opens. **Operator, NOT MET.** The bench
      numbers describe the row loop, not whether it opens.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

### The second quadratic, and why it hid behind the first

The hoisted forced layout was real and it was not the whole defect. Above 1,600 rows the verdict
went back to SUPERLINEAR, and the reason was a helper nobody suspected: deciding whether a row's
basename is shared scanned every other row, and list, board and gallery each called it with the
whole row set **and materialised that set per row**. An n-element allocation plus an n-element scan,
once per row.

Three properties of it are worth carrying forward:

- **It is worst on ordinary data.** With all-distinct basenames the scan never matches, so it never
  exits early and every row walks the entire set. Duplicate-heavy data is the fast case.
- **It explains the table.** The table's default asks about a single row — a one-element array — so
  the table paid a one-element scan where the card views paid an n-element one. The
  table-versus-everything-else boundary that framed this whole investigation was a default argument,
  not an architecture.
- **The fix is an index, not a loop change.** Repeated basenames are indexed once per render in
  `src/views/file-title-display.ts` (`buildDuplicateNameIndex`), and the three renderers consume it.

Measured on the same tree, 21 columns, full fill, 400 to 12,800 rows: **SUPERLINEAR ×2.56 → LINEAR
×1.07**, per-row cost flat at **0.057–0.063ms** across a 32-fold row change, render at 12,800 rows
**2,016ms → 784ms**. Restoring the whole prior state returns **SUPERLINEAR ×1.92** at 1,459ms, which
is the control that makes the verdict mean something.

### A competing theory was tested and falsified

Building the list body off-document — the pattern the table uses — was the obvious next move. It
moved the verdict from superlinear to superlinear, and was reverted. The reason it cannot work here:
**nothing in those loops reads layout per row**, and absent a read the browser coalesces
invalidation rather than laying out per append. The table's comment about off-document construction
is true for tables and does not generalise. Record it refuted, or the next reader spends a day on it.

### What remains at scale is not this loop

At 12,800 rows there is still **2,684ms of layout from a single forced read over 960,007 nodes**.
That is proportional to how many nodes exist, not to how they were built, so no change inside the
row loop touches it. It is a virtualisation question and it is unanswered; `028` owns it, and it
needs the operator's row count **and fill rate** — at full fill the budget breaks near 1,300 rows,
while the same 1,600 rows at 30% fill cost 1,227ms and clear it.

### Three checks covered this code and each was blind in a different direction

The screenshot fixture writes its own markup and imports nothing from `src/`, so it reported green
while the renderer tripled its output. The unit test asserted that the renderer's **source text**
contained a string — a spelling, not a property, which **passes for a broken implementation and
fails for a correct one spelled differently**, which is exactly what it did. And the geometry check
was the right instrument pointed at the wrong thing: real x-positions in a real browser, read off
hand-written markup.

Add today's: the production-renderer lane that does exist bounds **layout reads** and **row
appends**. A per-row scan over the row set moves neither, so the second quadratic was invisible to
the one check built to catch the first. That belongs to `026`, and it is recorded there.

### The fixture also overstates the phone's field area

It omits the row controls the renderer always builds. On a 402px phone the renderer's field area
measures **240px**, not the fixture's wider box, and at 240px exactly one property fits per line — so
**the column alignment `c31acf5` was written to buy is not observable on a phone at that width.** The
"fourteen x-positions on twelve cards" that justified it was measured on a fixture whose field area
is roughly twice the real one.

A later review priced the consequence: on a phone an empty div takes a whole wrapped line plus the
6px row gap under it, which is **84px of dead height per card** — a twelve-card list measuring 3,131px
where the pre-reservation renderer measures 2,123px. Half the scrolling was boxes nobody can see.

### A second measurement, recorded and not acted on

Forcing the reservation off on every surface left both desktop alignment checks **green**: the track
template and the explicit per-index grid column already determine placement, and only the assertion
that counts reservations went red — which it does by construction when there are none. The original
"observed red" control ran `c31acf5^`, which removed all three mechanisms at once, so it proved the
commit as a whole buys the alignment and never which part of it does. Worth 22,400 empty divs at
1,600 rows. Not done here: scope is frozen, and `wrap` and compact modes declare tracks that collapse
when empty and were not measured. **That is a phase, not an aside.**

### The width check AC-5 still owes

Drive the real `ListRenderer` through section 5k's shape — 4 unequal-width properties, 12 cards each
missing a different subset — on a body carrying `is-mobile is-phone` at container widths 360, 402,
430, 480, 540 and 1024px. At each width assert the worst property lands in exactly 1 column across
the 12 cards, and that reserved placeholders are present wherever the field area fits two properties.

**Phrase the reservation half as "reserved wherever two properties can share a line, and never where
none can"** — not as the criterion's literal "only where a slot exists to reserve", which the shipped
predicate deliberately violates. `shouldReserveColumns` tests the two *narrowest* declared widths
plus one column gap, so in the uncertain band it over-reserves on purpose: 14 reservations at 430px
where only one property fits. Written literally, this criterion fails a correct implementation.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Forced layout out of the row loop | Shipped, measured | 8,646.0ms → 246.6ms blocked at 1,600 rows |
| Per-row basename scan indexed | Shipped, measured | ×2.56 → ×1.07 to 12,800 rows; control returns ×1.92 |
| Budget asserts the right term | Fixed | Observed failing first with 5,000ms of injected layout |
| Surface-conditional reservation | Shipped | Predicate read off the element, not a flag |
| Renderer-driven alignment check | Shipped | Section 5k, three assertions |
| Reservation by width under `is-phone` | Open | Measured once by hand; no script guards it |
| Remaining layout at scale | Handed to `028` | 2,684ms over 960,007 nodes at 12,800 rows |
| Operator confirmation | Open, and currently contradicted on device | `028` |

### Deviations and findings

| Item | Note |
|------|------|
| Off-document list body | Tested and refuted: superlinear before, superlinear after, reverted. No per-row layout read means nothing to coalesce around |
| SC-001 was stated on render alone | The half AC-1 declares wrong for this repair; its 200ms threshold would fail a correct implementation at 246.6ms. Restated on the blocked main thread |
| AC-2 reopened, then closed | It was withdrawn because a LINEAR verdict came from a matrix that stopped at 1,600 rows, below the bend. It closes here on a 12,800-row sweep with a restore-the-state control, not by re-quoting the old run |
| Missing `plan.md` and `tasks.md` | Both present now; `validate.sh --strict` on this folder reports `Errors: 0` |
| Log claimed 95% while continuity said 70 | The claim is removed. The operator row is what moves this number, and the device has not been touched |
<!-- /ANCHOR:log -->
