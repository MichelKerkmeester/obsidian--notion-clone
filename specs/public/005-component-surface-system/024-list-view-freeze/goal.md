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
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored; SC-001 restated on blocked main thread rather than render alone"
    next_safe_action: "Operator confirms on device that the list view opens"
    blockers:
      - "Non-table views still freeze on device; 028 is investigating whether a second cause remains"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-024-goal"
      parent_session_id: null
    completion_pct: 95
    open_questions:
      - "How many rows does the operator's database actually hold"
      - "Is the desktop reservation worth keeping now that it measures as redundant"
    answered_questions:
      - "c31acf5 is not the cause; the same list took 6,777ms on the commit before it"
---
# Goal: List View Freeze

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Opening a list view does not block the main thread at any row count the operator's
vault can hold, and the column alignment the renderer buys survives the fix.

It took **7,174ms** on 1,600 rows shaped like the operator's database. Per-row cost rose ×3.59 from
400 to 1,600 rows, so this was never a large constant — it was the wrong shape.

**The root cause.** `renderRow` called `isTouchDevice(this.container)` for every row, and that
measures the container with `getBoundingClientRect()`. A forced synchronous layout, inside a loop
that is simultaneously appending rows **to the very container being measured**. Every row made the
browser lay out everything built so far. Quadratic in row count.

**The leading suspect was exonerated by measurement, and that is the part to keep.** `c31acf5` was
the obvious cause and survived inspection. It died on measurement: the renderer at `4830275` is
byte-identical to the renderer at `c31acf5^`, and that renderer takes **6,777ms** on the same 1,600
rows. What the commit actually did was triple the field elements — 2,400 to 8,000 — for 6% on desktop
and 28% on the phone. A real regression, fixed here, and not the freeze.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The budget asserts the **whole blocked main thread**, render plus forced layout. Render alone is the wrong half for this repair, because the fix moves cost from the term under budget into the term that was not. |
| D2 | The reservation predicate is the property itself — can two properties share a line — read off the field area's computed display and measured width. Not a platform flag, not a viewport threshold, not a body class. |
| D3 | No windowing. Both renderers are linear once the forced layout leaves the loop, and an asymptote that is already linear does not need one. |
| D4 | No scaling verdict from a single sample. |
| D5 | Measure before fixing. A leading suspect that survives inspection can still die on measurement. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] Opening a list view stays inside the declared 2,000ms budget on the **blocked main thread**.
      Was 8,646.0ms desktop and 1,027.7ms phone at the reported shape; now 246.6ms and 189.2ms.
- [ ] Per-row cost reports LINEAR at every measured shape, replacing SUPERLINEAR, and a run with one
      row count prints no verdict at all.
- [ ] A property starts in the same column on every card, asserted against the renderer's own output
      rather than a fixture.
- [ ] A reserved column costs one element and carries no rendered content.
- [ ] A slot is reserved only where a slot exists to reserve, on every surface and at every width.
      The first attempt keyed this on the phone class and was measured breaking alignment the moment
      the phone turned sideways.
- [ ] The operator confirms on device that the list view opens. **Today it does not** — every
      non-table view freezes, which is `028`'s subject, so this criterion is open regardless of the
      numbers above.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**95%: shipped and measured, awaiting the device.** Took no stylesheet lane.

### Three checks covered this code and each was blind in a different direction

The screenshot fixture writes its own markup and imports nothing from `src/`, so it reported green
while the renderer tripled its output. The unit test asserted that the renderer's **source text**
contained a string — a spelling, not a property, which **passes for a broken implementation and fails
for a correct one spelled differently**, which is exactly what it did. And the geometry check was the
right instrument pointed at the wrong thing: real x-positions in a real browser, read off
hand-written markup.

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

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Forced layout out of the row loop | Shipped, measured | 8,646.0ms → 246.6ms blocked |
| Budget asserts the right term | Fixed | Observed failing first with 5,000ms of injected layout |
| Surface-conditional reservation | Shipped | Predicate read off the element, not a flag |
| Renderer-driven alignment check | Shipped | Section 5k, three assertions |
| Operator confirmation | Open, and currently contradicted on device | `028` |

### Deviations and findings

| Item | Note |
|------|------|
| SC-001 was stated on render alone | The half AC-8 declares wrong for this repair; its 200ms threshold would fail a correct implementation at 246.6ms. Restated on the blocked main thread |
| Missing `plan.md` and `tasks.md` | Level 1 requires both; `validate.sh --strict` reports 5 errors on this folder |
| Continuity block is 2,806 bytes | Against a 2,048 cap, and `recent_action`/`next_safe_action` in `spec.md` are flagged non-compact. Left for the phase author: the content is real and trimming it is a content decision |
<!-- /ANCHOR:log -->
