---
title: "Implementation Summary: Properties Panel"
description: "The row-grid half of the phase shipped and holds under replay — desktop 52px to 34px on one line, the property name on the flexible track. The information-architecture half never started, and eight lane edits made under this phase's hold belong to other phases."
trigger_phrases:
  - "002 implementation summary"
  - "properties panel shipped"
  - "column manager row grid"
importance_tier: "critical"
contextType: "verification"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/002-properties-panel"
    last_updated_at: "2026-08-30T20:30:00Z"
    last_updated_by: "phase-reconciliation"
    recent_action: "Row grid fixed: desktop 52px to 34px on one line, name takes the 1fr track; replay holds"
    next_safe_action: "Run the section 4A condition census; AC-004, AC-005 and AC-007 have no measurement"
    blockers:
      - "The two phone rules for .db-column-manager-row are still two, at styles.css:17413 and :17533"
      - "Nothing measures the panel height cap, the delete confirmation or the primary line"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "styles.css"
      - "src/views/column-manager-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-002-summary"
      parent_session_id: null
    completion_pct: 86
    open_questions:
      - "Does the duplicate phone rule at styles.css:17413 get collapsed, or declared as intentional"
    answered_questions:
      - "Measurement or static trace on the 96px track? The trace was right — it was never on the checkbox"
---
# Implementation Summary: Properties Panel

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 002-properties-panel |
| **Completed** | Not complete — In Progress |
| **Level** | 2 |
| **Status** | **Shipped + verified, awaiting device — 6 of 7 criteria.** 0 of 65 tasks checked; 0 of 12 `acceptance-criteria.md` rows Met. *Moved from **In Progress** 2026-09-02 to match `spec.md`, which §3.1 and the cross-doc status rule both require; the fraction is `goal.md`'s checklist, which is what §3.2 derives from, and the two zeros beside it are unchanged.* |
| **State** | The row grid shipped and re-asserts green today. The information architecture — what the row shows, where delete lives, the height cap — has not started |

**This document exists because the phase's continuity block said `completion_pct: 0` and "Phase cut
from measured architecture findings; not started" while the tree contained nine lane edits and a
commit.** The row-grid work is real; the phase is not close to done.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

One coherent fix to the property row's grid, landed in `248326a`,
*"fix(views): the properties row keeps its shape in every regime"* — the one commit in this program
whose message is about this phase's subject.

### Two cascade defects, both root-caused

**Desktop.** A block late in the stylesheet showed the mobile reorder arrows with no phone guard,
after an earlier block had hidden them. Later and same specificity, so it won everywhere — putting an
eighth child into a seven-track row. Measured **52px tall against a declared 30px minimum**, with the
delete button wrapped onto an implicit second row. Removing the unguarded `display` leaves the phone
rule to do its job. **Desktop is now 34px on one row.**

**Phone.** Two rules declared eight tracks in *different orders* and the later won, handing
`minmax(96px, 1fr)` to whichever child landed third. With the drag handle hidden that is the **type
icon**, so an 18px glyph took the track meant for the name, and the name fell to `auto` and clipped.
The orders now match.

This also settled a disagreement the phase had recorded between a measurement and a static trace —
`goal.md`: *"ONE MEASUREMENT AND ONE INFERENCE DISAGREE — RESOLVE IT, DO NOT PICK."* **The trace was
right.** The 96px track was never on the checkbox.

### The eight-column frame

`styles.css:11676-11698`. Eight columns, each claimed by an explicit `grid-column`, so hiding a child
leaves its column empty instead of shifting every later child one position left. The two
platform-specific columns collapse to zero width where they do not apply, so one frame describes
every regime.

| Column | Child | Desktop track | Phone track |
|---|---|---|---|
| 1 | `.db-column-drag` | `18px` | `0` |
| 2 | `.db-mobile-reorder-controls` | `0` | `auto` |
| 3 | `.db-checkbox` | `20px` | `20px` |
| 4 | `.db-column-type` | `18px` | `18px` |
| 5 | `.db-column-name-wrap` | `minmax(120px, 1fr)` | `minmax(96px, 1fr)` |
| 6-8 | the three `.clickable-icon` buttons | `auto auto auto` | `auto auto auto` |

### Files changed

| File | Action | Purpose |
|---|---|---|
| `styles.css` | Modified | The eight-column frame, the unguarded `display` removed, both phone track orders reconciled |
| `tools/lane/css-lane.json` | Modified | Nine journal entries for this phase's hold |
| `screenshots/` (24 PNGs + `manifest.json`) | Modified | Recapture; the column-manager panel images move as expected |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

**One acquire, eight edits, one release** — 2026-08-29 19:34:47Z to 21:25:37Z, recorded in
`tools/lane/css-lane.json`. The release note reads *"row-state cluster landed; recaptured"*.

*(Correction to the parent record: `roadmap.md` §5.1 describes this as "Nine lane holds". The journal
holds **one** hold containing eight edits, not nine holds. Ten entries total for this phase.)*

**Only two of the eight edits are this phase's subject.** D7 says a lane hold permits editing a file
and grants no scope, so the rest are recorded here as what they are — work done under this phase's
hold, owned elsewhere:

| Lane edit | Subject | Whose |
|---|---|---|
| "properties row columns 6-8 claimed explicitly" | the row grid | **002** |
| "row-main takes its track instead of sizing to content" | row layout | **002** (list-row adjacent) |
| "sheet z-index reverted with its portal"; "sheet portal restored with modal layer, height guard, and a sibling scrim" | sheet presentation | `003` |
| "phone list constrained to the screen"; "phone list card stacks title above fields" | list rhythm | `005` |
| "phone select-col size override guarded so one role paints one size" | checkbox ownership | `004` |
| "status-badge given box-sizing (same content-box defect as the list row, 138 instances)" | shared box model | `005` |
| "reduced-motion blocks no longer null every transform" | accessibility | unowned |
| "filter conditions placed on a two-line grid" | filter panel | unowned |
| "selected rows painted, hover strengthened, checkbox border raised to 3:1" | row state | `004` |

**The verification the lane contract demanded did not all happen.** `goal.md` requires four steps
before release, in order: full recapture at both viewports at 3, 12 and 40 properties; a **named
human** opening every changed PNG and signing off in `checklist.md`; `008`'s replay re-asserting the
earlier phases; and cascade re-confirmation of both collapsed duplicate pairs. Step 1 happened at a
single viewport pair rather than across 3/12/40 properties, step 2 has **no signature in
`checklist.md`**, step 3 exists as a standing gate lane, and step 4 is incomplete — see Limitation 1.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Claim all eight columns explicitly rather than reorder a positional list | Which children are visible varies three independent ways at once — drag handle on desktop, arrows on phone, edit and delete gone in read-only. A positional list cannot survive that; it is what put the type icon on the name's track |
| Resolve the phone pair by matching **order**, not by collapsing to one rule | The recorded defect was track order, not track count, and the phase's own `goal.md` says so: *"The rules' real conflict is track order, not count. That distinction changes the fix."* The collapse T-023 asks for was left undone — recorded as Limitation 1 rather than claimed |
| Believe the static trace over the measurement | They disagreed about whether the 96px track sat on the checkbox or the type icon. With the drag handle hidden the third laid-out child is the type icon, which the fix confirmed |
| Report **no** criterion Met | Two `replay` entries pass with real pre-fix numbers, but neither meets its criterion's stated threshold. The gap is named per row below rather than rounded up |
| ~~Set `completion_pct` to 40, not 0 and not 100~~ | **Superseded 2026-09-02.** The judgment was sound and the figure is no longer judged: `roadmap.md` §3.2 derives it from `goal.md`'s checklist, **6 of 7 rows ticked = 86**, and every continuity block in this folder now carries that — 43 was the last judged value. Kept because the reasoning records why it was never 0 or 100: 0 is refuted by a landed, independently re-asserted fix; 100 is forbidden by D3 with nothing operator-confirmed, and half the phase — the information architecture — has not started |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

One command was run from the final state. **Exit status read directly into `echo $?`, never through a
pipe.** It reads `styles.css`, which was **clean in the working tree at `0ab9a35`**, so it measures
committed state rather than another session's edit in flight. Concurrent sessions moved `HEAD` to
`ff3d241` while this was being written; `git diff 0ab9a35..ff3d241 -- styles.css` is **empty**, so the
numbers still describe the current stylesheet.

| Command | Result | Exit |
|---|---|---|
| `npm run replay` | **PASS — all 8 results still hold** | **0** |

Two of the eight entries belong to this phase, both with a recorded pre-fix number — a genuine
red-before-green, satisfying D2:

| Claim | Pre-fix | Recorded | Now |
|---|---|---|---|
| the properties row stays on one line | **2** | 1 | **1** |
| the property name takes the flexible track, not the type icon | **0** | 1 | **1** |

Verbatim:

> `held   002-properties-panel`
> `       the properties row stays on one line`
> `       recorded 1, now 1`
> `held   002-properties-panel`
> `       the property name takes the flexible track, not the type icon`
> `       recorded 1, now 1`

### Why this closes no acceptance criterion

The two replay entries measure less than the two criteria they resemble. Stated precisely, because
the difference is the whole point of this program:

| Criterion | Its threshold | What replay measures | Gap |
|---|---|---|---|
| **AC-001** | computed `grid-row-start` = 1 **for all children**, **and** row `height <= 36px`, **both viewports** | `getComputedStyle(row).gridTemplateRows` splits into **1** track | No per-child `grid-row-start`; no row height; desktop only |
| **AC-003** | name computed content width **>= 120px desktop / >= 96px phone**, **and** its right edge inside the panel content box | name width **> 3x** the type icon's width — a ratio | No px floor; no right-edge containment; desktop only |

Both also run against `tools/screenshots/scenarios/panels.mjs:344`, a **hand-written fixture**. Per
D10 that is the one legitimately hand-written class of artefact, and its child order was checked
element by element against `src/views/column-manager-renderer.ts:209-296` and matches. But per D1 it
still does not drive the production path: it proves the **stylesheet** lays the row out correctly,
not that the **renderer** emits that DOM. The fixture also covers only the **read-write desktop**
regime — the phone and read-only regimes it is measured against are not in it.

### Acceptance criteria

**0 of 12 Met.** AC-001 to AC-006 are `Unmet`; AC-007 to AC-012 are `Blocked` for want of a failing
number. No cell was changed.

### One thing verified by reading, that closes nothing

**The `nth-of-type` mapping for columns 6-8 is sound, and it was checked rather than assumed.**
`styles.css:11696-11698` keys the three trailing actions with `.clickable-icon:nth-of-type(1..3)`,
which counts among siblings **of the same element type**. Reading
`src/views/column-manager-renderer.ts:209-296`, the row's direct children are a `span`
(`.db-column-drag`), a `span` (`.db-mobile-reorder-controls`, whose two buttons are its own children),
an `input` (`createCheckbox` returns `HTMLInputElement`, `src/views/checkbox.ts:26-37`), a `span`
(`.db-column-type`), a `div` (`.db-column-name-wrap`), then the three buttons. So the three
`.clickable-icon` elements are the only `button` children and map to 6, 7, 8 correctly — and in
read-only, where the `if (!actions.isReadOnly)` branch at `:286` omits edit and delete, the surviving
wrap toggle is still `nth-of-type(1)` and still column 6.

### Not run, and why

`npm run gate` and `npm run storybook:placement` were **not** run. `tools/storybook/verify-placement.mjs`
carries **175 uncommitted added lines** from a concurrent session, alongside edits to
`src/views/card-field-renderer.ts` and `tools/live/renderer-coverage.json`. A shared harness run
against a moving tree describes neither state — `roadmap.md` §7.1 declines the same measurement for
the same reason. The gate's reported 16-green/exit-0 is **carried from the parent roadmap, not
re-observed here**, and is not cited as this phase's evidence.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The duplicate phone rule was never collapsed — the defect this phase was built to fix still
   exists in the file.** T-023 requires resolving the two `.is-phone .note-database-container
   .db-column-manager-row` rules "to a single declaration". Both are still there, now at
   **`styles.css:17413` and `styles.css:17533`**, and they still disagree: `17413` declares
   `minmax(120px, 1fr)` on column 5, `17533` declares `minmax(96px, 1fr)`. Identical selector, so the
   later wins and the phone floor is **96px**; every declaration in `17413` is dead. The *order*
   conflict that caused the visible bug is genuinely fixed. The *duplication* is not, and the phase's
   own `goal.md` warned against exactly this: *"This packet exists because two such pairs were never
   reconciled; do not leave a third behind."*

2. **Half the phase has not started.** Its second subject is information architecture — what the
   primary line shows, where delete lives and what confirms it, and the panel's own height cap. None of
   it moved:
   - **AC-004** (panel `height <= min(560px, 0.7 x visible bounds)` at 40 properties) — the positioner
     still writes an inline `maxHeight` taking the full bounds. Nothing measures it.
   - **AC-007** (the primary line measured at 402px and 1440px) — no decision recorded, nothing measured.

   **AC-005 is a separate case and is dealt with in Limitation 3.**

3. **AC-005's recorded failing evidence is contradicted by the source, and the criterion may already
   be satisfied.** Its evidence cell reads *"fails: `db-column-delete-btn` deletes on one click from
   the row itself."* Half of that is true: `src/views/column-manager-renderer.ts:297` is
   `deleteBtn.onclick = () => actions.deleteColumn(col);`, a single click with nothing in between. But
   the threshold is a **conjunction** — no element may *both* invoke `deleteColumn` on a single click
   *and* have no confirmation — and the second half does not hold. Both wirings of `actions.deleteColumn`
   (`src/views/database-view.ts:856` and `:4938`) route to `ColumnOperations.deleteColumn`, and every
   one of its four branches at `src/views/column-operations.ts:326-372` — computed, rollup, virtual
   field, and the general case — `await`s `confirmWithModal` and returns early if declined. The general
   branch even offers a secondary "column only" choice.

   The confirmation is **not** this phase's work: `git log -S 'column.confirmDelete'` reaches
   `2d10e6f` (2026-08-28 23:46), a naming-conventions commit that predates this packet's own planning
   commit `a08ff7c` (2026-08-29 19:11). So the evidence cell was **wrong when it was written**.

   This is exactly D5 — *a criterion can fail a correct implementation* — and the same shape as the
   blank-cell criterion the parent `goal.md` dissects as theatre. **AC-005 is left `Unmet` anyway**,
   because its threshold requires a *driven* single click observed against `deleteColumn`, and no
   command here drove one. Reading the source is not driving it. Recorded so the next reader does not
   inherit a failing number that never described the code.

4. **The §4A condition matrix never ran.** T-002 through T-008 asked for every emitted child of
   `.db-column-manager-row` enumerated under six conditions — read-only, required, file field,
   computed, phone, desktop — with emitted count diffed against laid-out count per breakpoint. The
   fix was reasoned from the two cascade traces instead. It is right, and it is right about the two
   regimes that were traced; **the read-only regime was never measured**, only read (see Verification).

5. **No instrument for this panel exists in the placement harness.**
   `tools/storybook/verify-placement.mjs` contains **zero** references to `column-manager`. The only
   automated coverage is the two `replay` entries and four screenshots. Ten of twelve criteria have
   nothing that could produce their number.

6. **`tasks.md` is stale in the same direction the continuity block was.** All 65 boxes are unchecked,
   including ones this commit substantively satisfies. They were deliberately left alone: this pass
   reconciles the summary and the continuity block, and ticking implementation tasks is a wider claim
   than the evidence supports for the majority of them.

7. **No human signed the recapture.** `goal.md` step 2 requires a **named human** opening every changed
   PNG and signing off in `checklist.md`. There is no such signature. `248326a` moved 24 PNGs including
   all four `panel-column-manager` images, and `screenshots:verify` never opens an image, so nothing
   has looked at them.

8. **UNKNOWN — whether the fix survives the phone regime on a real device.** Everything here was
   measured on a desktop-width hand-written fixture. The phone track swap is the half of the fix that
   the operator actually reported ("opens Properties on a phone and can read every property name"), and
   it is the half with no measurement at all. **What would settle it:** a `replay` entry, or a
   placement-harness section, that loads the fixture with `.is-phone` on the body and asserts the name's
   computed content width against the 96px floor and its right edge against the panel content box —
   plus, per D3, the operator opening the panel on a phone.

9. **Nothing here is operator-confirmed.** Per D3, shipped, verified and operator-confirmed differ and
   only the third closes. The operator called this the worst surface in the plugin; nobody has reported
   back that it improved.
<!-- /ANCHOR:limitations -->
