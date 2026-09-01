---
title: "Implementation Summary: Content Row Rhythm and Header Rail"
description: "List rows shipped across three lane cycles and measured by the phase's own census; the header rail is untouched and none of the thirteen criteria has been closed."
trigger_phrases:
  - "005 row rhythm summary"
  - "list row border-box shipped"
  - "view census shipped"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/005-content-row-rhythm"
    last_updated_at: "2026-08-30T18:40:00Z"
    last_updated_by: "summary-author"
    recent_action: "List rows shipped over three lane cycles; census now holds AC-003 and AC-006 numbers"
    next_safe_action: "Collapse the rail blocks, resolve the mask reversal, then re-run the census"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../../../../tools/live/view-census.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-005"
      parent_session_id: null
    completion_pct: 57
    open_questions: []
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 005-content-row-rhythm |
| **Shipped** | 2026-08-30 |
| **Level** | 3 |
| **Status** | In Progress |
| **State** | One of the two defects is shipped and instrumented. The header rail is untouched, 0 of 13 criteria are Met, and no negative control has run |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

The phase opened on two defects that ask one question — does the container own the size, or the
child? It answered that question for the list row and never reached the header rail.

Along the way the census it built refuted the report that started it. The operator described ragged
rows; the source suggested the opposite; the measurement says neither. **The raggedness is
horizontal.** Every list row was uniformly 26px too wide, at every width and on every row, which is
what a row whose right edge is off-screen looks like.

| # | Change | Effect |
|---|---|---|
| 1 | `.db-list-row` declares `box-sizing: border-box` (`styles.css:10076`) | Overflow **26px → 0px** at 320/402/768/1440. On today's tree **0** elements carrying `db-list-row` escape their container anywhere in the census |
| 2 | The list meta row's tracks are declared by the renderer | `listFieldTrackTemplate` (`src/views/column-width.ts:42`) is applied at `src/views/list-renderer.ts:386`, and each field takes an explicit `gridColumn` at `:399`. A container rule cannot read a per-column width that lives on the field |
| 3 | An empty property holds its column (`styles.css:10149`, `.db-list-field.is-placeholder`) | Measured on the sparse fixture, built the way `capture.mjs` builds a page: phone **6 distinct card widths → 1**, and Payment and Billing each **landing in 2 columns → 1**. Desktop was already 1 and 1 |
| 4 | `tools/live/view-census.mjs`, the phase's own instrument | Renders every view fixture at four widths and records containment, row-height spread, and a cascade probe. Nothing in this repository had rendered a view at 320 or 768 before it |

The single reason #4 exists is that **no criterion in this packet could be measured without it.**
`verify-placement.mjs` rendered no view at all.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `styles.css` | Modified | `border-box` on the list row; the `is-placeholder` rule |
| `src/views/column-width.ts` | Modified | `listFieldTrackTemplate` — a track list derived from each column's own declared width |
| `src/views/list-renderer.ts` | Modified | Applies the track template and assigns each field its column |
| `src/views/column-width.test.ts` | Modified | 10 assertions over the track template, including the empty-field case |
| `tools/live/view-census.mjs` | Created | The 4-width, 7-view census |
| `tools/live/view-census.json` | Created | Its artefact, fingerprinted against `styles.css` |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

**Three stylesheet-lane cycles, and the census came first in each.** The lane journal records them
at `tools/lane/css-lane.json` — acquire/release at 19:20→19:29Z, 22:20→23:24Z on 2026-08-29, and
08:19→08:31Z on 2026-08-30, each release naming what landed and what the recapture moved.

**The measurement chose the fix, and it corrected an earlier one.** Cycle 2 claimed a column by
index, which decides nothing where the row is not a grid — and on a phone the meta row is a wrapping
flex line that ignores `grid-column` outright. Cycle 3 replaced it with a rule the renderer marks.
The release note attributes the recapture rather than assuming it: **4 `layoutHash` moves, all
`list-sparse-fields`**, which is the only fixture rendering a row that omits a subset of its
properties and therefore the only one a placeholder rule can reach.

**A number that described no phone was withdrawn rather than kept.** An earlier reading of 14
x-positions came from a page missing `--capture-max-width`, where the container measured 948px
inside a 402px viewport. It is recorded in the lane journal as superseded.

**The wrong axis was measured first.** "Ragged" sounded vertical, so height was measured, and
nothing was found. The defect was in `width`.

Delivered across `37f1cd8` (border-box and the census) and `c31acf5` (track template and the
placeholder rule). `4928626` carries `tools/live/portal-safety.mjs`, the instrument this phase's
second release note claims.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Fix the row with `border-box`, not by removing its padding | The row is the only class in the plugin computing `content-box` while carrying padding and a percentage width. Every other component declares `border-box` individually; this generalises a rule the file already learned once |
| Let the renderer declare the tracks, not the stylesheet | The per-column width lives on the field. A container rule cannot read it, so a stylesheet-only fix would have had to guess a width the configuration already knows |
| Hide the placeholder rather than skip the field | Skipping pulled every later field left, because the column is an index and not a count. A hidden field that takes no pointer holds the index without painting |
| Build the census before writing any contract | Every criterion here was blocked on a harness that rendered no view. Writing the sizing contract first would have argued from the source rather than from the product |
| Record the 948px reading as superseded instead of deleting it | It is the kind of number that gets re-derived by the next reader. Naming why it was wrong is cheaper than finding it again |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

Read from the final state on 2026-08-30. Exit statuses read from `$?` directly, never through a pipe.

| Check | Result |
|---|---|
| `npx vitest run` | **450 passed, 59 files, exit 0** |
| `node tools/storybook/verify-placement.mjs` | **218/223, 5 red for a declared reason, exit 0** |
| `node tools/live/evidence.mjs --check-all` | **9 of 9 artefacts still describe this tree, exit 0** — including `view-census.json`, which is what makes its numbers admissible |
| `rg -c 'width:\s*max-content' styles.css` | **32**, exit 0 |

### What the census says today

Read from `tools/live/view-census.json`, measured `2026-08-30T16:12:32Z` over **57 fixtures** at
320/402/768/1440, and confirmed fresh by the command above.

| Criterion | Number measured | Target | Verdict |
|---|---|---|---|
| AC-004 — the rail scrolls rather than grows | 4 of 4 widths `scrolls: true`, `growsContainer: false`, `fadeAppears: true` | true, parent width delta 0 | Passing, **never observed red** |
| AC-006 — nothing paints outside the container that bounds it | **256 growing** of 560 escaping records | 0 | **Failing number now recorded** |
| AC-003 — no `.db-header` descendant beyond the header content box | **21** header records; `.db-header` itself passes its container by **4px** at all four widths, not scrolling in two fixtures; the sort and filter groups pass the scroll box by **186.3px** and **706.8px** at 320, both scrolling | 0 | **Failing number now recorded** |
| AC-008 — the probe proves the cascade loaded | `probeBlind: 0` — `--db-radius-sm` resolves to `4px` in every fixture at every width | non-default on both pages | Token half backed; the `min-height: 44px` half is unmeasured |
| AC-001 — horizontal containment of the list row | **0** `db-list-row` elements escape anywhere | 0 | The 26px fix holds on this tree |

**Two blank cells the packet declared are no longer blank.** `acceptance-criteria.md`'s F16
provenance table states that every criterion has a blank failing number because nothing had ever
been measured. AC-003 and AC-006 now have theirs. The table has not been edited here — that document
was authored by the phase architect and is left to its owner.

### No criterion is marked Met, and that is the finding

All 13 rows remain `Unmet`. Not one negative control N1-N14 has been run; AC-013's own body records
that no such control exists. Under this program's D2 — a criterion needs a threshold and a failing
number, observed red before green — a measurement that was never red closes nothing. AC-004 is the
clearest case: it passes, and the rail was never touched, so it certifies a mechanism that already
worked.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

**The header rail is untouched, and it is half the phase.** Re-resolved on this tree rather than
quoted: `.db-active-view-controls*` still carries **9 rule blocks** (`styles.css:1618`, `1624`,
`1652`, `17305`, `19234`, `19714`, `19720`, `19731`, `19736`), and the three-act `mask-image`
reversal is intact — a gradient at `19235`, `none` at `19732`, re-applied under `.is-overflowing` at
`19737`. The addresses recorded in this folder's `goal.md` (18577 → 19096 → 19101) were correct on
2026-08-29 and have since drifted, which is the phase's own warning arriving on schedule.

**A derived number in this packet has gone stale.** AC-006 records **31** `width: max-content`
declarations and names `rg -c` as the producer. Run today that producer returns **32**. The count is
only the static input to a runtime sweep, so nothing rests on it — but it is the same failure shape
the program already paid for once with `48 = 24 + 16 + 8`, and it is recorded rather than silently
corrected.

**AC-001 is not closed by the sd 0 its own cell reports.** That uniformity is a property of the
fixtures, not of the product: both list fixtures hardcode a fully populated field set on every row
while the shipped default drops empty fields, and the synthesised matrix emits field classes the
renderer never builds. Rebuilt with faithful markup the heights are **76.3px x7 and 52.9px x1,
sd 7.7**. Vertical raggedness is unrefuted, not refuted.

**Stage 1 is incomplete despite the census running.** `tools/screenshots/capture.mjs:88-91` still
defines exactly **two** devices, 1440 and 402. The four widths live only inside `view-census.mjs`,
so the capture set — which is what a human reviews — still cannot show 320 or 768. T1 is unmet.

**Two of Stage 1's blockers were cleared by other phases, not by this one.** The three harness pins
are gone from `tools/screenshots/runtime-vars.css`, which now documents their removal rather than
declaring them, and `verify-placement.mjs` loads `styles.css` on seventeen pages including its
desktop ones — the phase's stated "biggest exposure" is closed. `020-harness-fidelity-repair` did
most of that work. This phase inherits the benefit and cannot claim it.

**`024` subsequently amended this phase's mechanism.** The column reservation shipped here was
unconditional. `31dce9a` made it conditional through `reservesColumns`
(`src/views/list-renderer.ts:152`), because on a wrapping line at one property per line there is no
column to hold and the reservation cost 84px per card. The rule in the stylesheet is this phase's;
the predicate deciding when it applies is `024`'s.

**Zero of 25 tasks are checked in `tasks.md`** while the work above is in the tree and in the lane
journal. The checkbox state is not evidence of anything here; the journal and the census are.

**`roadmap.md` §5 is stale about this folder.** It records the continuity as "still reads not
started". The continuity block was advanced to 45% on 2026-08-30 at 11:30Z, before that line was
written.

**Nothing here is operator-confirmed.** Per D3 the program closes on the device, and no one has
scrolled a list on one. `completion_pct: 45` is derived, not felt: one of two defects shipped and
instrumented, 0 of 13 criteria Met, 0 negative controls run.

<!-- /ANCHOR:limitations -->
