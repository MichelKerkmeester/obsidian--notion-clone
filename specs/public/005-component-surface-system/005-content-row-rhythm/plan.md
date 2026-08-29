---
title: "Implementation Plan: Content Row Rhythm and Header Rail"
description: "Approach, gates and rollback for the sizing contract that fixes ragged list rows and the overflowing header rail in one pass."
trigger_phrases:
  - "005 row rhythm plan"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Content Row Rhythm and Header Rail

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Ordered so the harness can prove each step, and so the sizing decision is made once from data rather
than twice from two defect reports.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, no output, read without a pipe |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, count not reduced |
| Census | census script | Stage 6 artefact differs from Stage 2 in the asserted numbers |
| Rhythm and overflow | browser harness | every criterion, each with a recorded prior failure |
| Negative control | harness, per check | deleting a chip or a field moves an asserted number |
| Captures | `npm run screenshots` then **human review** | diffs explained, not merely regenerated |
| Capture manifest | `npm run screenshots:verify` | exit 0 — a partial recapture cannot satisfy it |
| Catalogue | `npm run story:smoke` | row and rail stories render at production mount points |

Lint stays report-only at its existing baseline.

**`screenshots:verify` is not a visual gate.** It proves a capture was regenerated after its
hand-maintained source list changed. It never opens an image. The human review is the visual gate and
it is not optional.

### The `styles.css` lane — take, hold, release

`styles.css` is one serialized lane (parent `spec.md` §4). This packet is third in the order, after
`000` and `004`.

| Moment | Rule |
|---|---|
| **Take** | Start of Stage 4 (*Implement, rows first*). Not earlier: Stage 1 touches only harness files, and Stages 2 and 3 census and decide against an unedited stylesheet |
| **Hold** | Stages 4, 5 and 6. `004` unblocks from `000` on the same edge as this packet and also edits `styles.css`; the two are serialized by this rule and nothing else — there is no lock file |
| **Release** | Only after all four release conditions below, in order |

1. **Full recapture** at four widths per view type, both themes, then `npm run screenshots:verify`
   exit 0. The recapture is only meaningful once Stage 1 has removed `--db-card-field-width` and
   `--db-timeline-row` from `runtime-vars.css`: until then list fields render 30px narrow and every
   timeline band collapses to `auto`, as it has in every capture ever taken.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` never opens
   an image and cannot be this step.
3. **`008`'s early replay re-asserts `000` and `004`** against the released tree. They closed against
   a snapshot this packet has just edited, and this packet collapses seven rail blocks that render in
   **all seven view types** — the blast radius is the whole application chrome.
4. **Cascade re-confirmation** — every duplicated selector touched has its computed winner recorded
   before and after, the three-act `mask-image` reversal explicitly. Each deletion cites its entry in
   the cascade audit `000` produced: a block that looks dead here has already been shown elsewhere in
   this stylesheet to be load-bearing through a duplicate class.

---

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**One declared sizing authority per axis.** Every row and rail names whether the container or the
child decides. Where the container decides, the child carries `min-width: 0`. Where the child
decides, the nearest ancestor is a scroller. Rows get a rhythm token and land on whole multiples of
it. Each of the 31 `max-content` survivors names its scroller in the contract document — **which is the
input to A6, not its closing condition** (review finding F8). A6 closes on the runtime sweep: 0
elements painting outside the container that bounds them, at 4 widths x 7 view types, with every
legitimate overflow scrolling rather than growing.

*Why not per-element patching.* That is today's behaviour and the documented trap — 31
`width: max-content` declarations and 245 `min-width: 0` declarations that only partly contain them,
with no rule saying which wins.

*Why not make everything a container-sized flex child.* That loses the horizontal scroll that wide
tables and the board actually need.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1 — Widen the harness before measuring anything

**This is a gate, not a task** (review finding F3). The desktop page currently runs a "render without
the stylesheet" substitution and reports green, so a census taken through it is an artefact of the
harness rather than a measurement of the product. AC-008's probe — `.db-list-row` computing
`min-height: 44px` and a `--db-*` token resolving non-empty, on **both** pages at all four widths —
is the exit condition. Nothing downstream may record a desktop number until it passes.

`tools/screenshots/capture.mjs:71-72` has two devices; add 320 and 768. Teach
`tools/storybook/verify-placement.mjs` to render a view at a chosen width — today it bundles only
`popover-position` and `mobile-bottom-sheet`, renders no view, and loads `styles.css` on the phone
page alone (`verify-placement.mjs:220`). Remove `--db-card-field-width` and `--db-timeline-row` from
`tools/screenshots/runtime-vars.css`; the first contradicts production by 30px, the second is an
invalid `grid-row` length. Nothing here changes product behaviour, so it lands while the numbers are
still red — and it must, because every later claim depends on the harness being able to fail.

### Phase 2 — The sizing census

Seven view types × four widths × three field counts, over a 20-row fixture: 84 states. Record every
element overflowing its parent's content box, and the row-height histogram with its standard
deviation. Output is a committed artefact. This is the step that settles §9's open question about
which direction wrapping actually moves the heights, and it produces every "today" number in
`checklist.md` §1.

### Phase 3 — The intrinsic-sizing contract

Written before any edit, argued against the alternatives:

- *Per-element patching* is today's behaviour and the documented trap — 31 `width: max-content`
  declarations (`rg -c 'width:\s*max-content' styles.css`) and 245 `min-width: 0` declarations that
  only partly contain them, with no rule saying which wins.
- *Make everything a container-sized flex child* loses the horizontal scroll that wide tables and the
  board actually need.
- **Chosen: one declared authority per axis.** Every row and rail names whether the container or the
  child decides. Where the container decides, the child carries `min-width: 0`. Where the child
  decides, the nearest ancestor is a scroller. Rows get a rhythm token and land on whole multiples of
  it. Each of the 31 `max-content` survivors names its scroller in the contract document.

### Phase 4 — Implement, rows first

**Takes the `styles.css` lane here.**

Rows before the rail, because the row work is contained to the list family and the rail is shared by
every view type — a rail regression is seven defects, a row regression is one. `--db-header-height`
is published from the runtime in this stage, since the rail's containment depends on a header height
that is currently a `34px` fallback.

### Phase 5 — Collapse the rail declarations

Seven blocks to one intentional declaration per property. The `mask-image` reversal
(`styles.css:18577` → `19096` → `19101`) resolves to a single rule matching the `is-overflowing` class
the renderer sets at `active-view-controls-renderer.ts:153`, or the class and its JavaScript go
together. Each deletion cites its entry in the cascade audit `000` produced; a block that looks dead
here has already been shown elsewhere in this stylesheet to be load-bearing through a duplicate class.

### Phase 6 — Re-run the census unchanged

The same script, same 84 states. Criteria are the delta between the Stage 2 and Stage 6 artefacts.

### Phase 7 — Captures and catalogue

**Releases the `styles.css` lane here**, and only after the four release conditions in §2.

Full recapture at four widths per view, both themes, then a human looks at the changed PNGs. Storybook
gains a row-state row and a rail-state row at production mount points.

---

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom (`vitest.config.ts`), so every DOM assertion lives
in `tools/storybook/verify-placement.mjs` or its successor. A vitest test in this spec may assert
source text; it may not claim to have measured a rectangle.

The census is the measurement instrument. The same script runs unchanged at Stage 2 and Stage 6 over
the same 84 states, and every criterion is the delta between the two artefacts — so a criterion
cannot be satisfied by changing how it is measured. The negative controls run before the criteria are
trusted, not after.

`screenshots:verify` is not a visual gate. It proves a capture was regenerated after its
hand-maintained source list changed; it never opens an image. The human review is the visual gate and
it is not optional.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`000-surface-contract-and-truthful-harness` — the honest harness only, not the factory. This spec also
consumes `000`'s cascade audit: every rail deletion in Stage 5 cites an entry in it.

Predecessor `004-checkbox-ownership`. Blocks nothing; it runs while the overlay lane is occupied,
which is the reason it is scheduled here at all.

Holds the serialized `styles.css` lane for Stages 4 and 5, releasing it at Stage 7's recapture.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Each stage is separately revertable and lands as its own commit.

- Stages 1 and 2 touch only harness and tooling files. Reverting restores the previous two-width,
  view-blind checks.
- Stage 3 writes a document and changes nothing.
- Stage 4's row rhythm is a token plus the rules that consume it; reverting the token returns rows to
  `min-height: 44px` and content-driven heights.
- Stage 5 is the only step that deletes CSS. Every deleted block is recorded verbatim in the cascade
  audit before removal, so restoration is a copy rather than an archaeology exercise.

If publishing `--db-header-height` moves sticky offsets in a way the captures cannot justify, revert
Stage 4's header publication alone — the row rhythm does not depend on it, and the rail work can stand
on the `34px` fallback while the measurement is reworked.

**CSS lane.** This spec holds `styles.css` for Stages 4 and 5 and releases it at Stage 7's recapture.
No other spec may hold the file in that window.

---

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 7A. DEPENDENCY GRAPH

```
Stage 1 widen harness ──▶ Stage 2 census ──▶ Stage 3 sizing contract
                                                      │
                                        Stage 4 rows ─┴─▶ Stage 5 rail
                                                            │
                                                Stage 6 re-run census
                                                            │
                                            Stage 7 captures + catalogue
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Stage 1 widen harness | `000` honest harness | 320 and 768 devices, view rendering at a chosen width, unpinned `runtime-vars.css` | Stage 2 |
| Stage 2 census | Stage 1 | The committed 84-state artefact and every "today" number | Stages 3 to 6 |
| Stage 3 sizing contract | Stage 2 | One declared authority per axis; all 31 `max-content` declarations classified | Stages 4 and 5 |
| Stage 4 rows | Stage 3 | Rhythm token, list-row contract, published `--db-header-height` | Stage 5 |
| Stage 5 rail | Stage 4, `000` cascade audit | One declaration per property; the `mask-image` reversal resolved | Stage 6 |
| Stage 6 re-run census | Stages 4 and 5 | The delta artefact the criteria are read from | Stage 7 |
| Stage 7 captures and catalogue | Stage 6 | Full recapture reviewed by a human; row and rail stories | Lane release |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 7B. CRITICAL PATH

1. **Stage 1 — widen the harness** - CRITICAL. The census inherits the harness's lies unless the pins
   go first.
2. **Stage 2 — the census** - CRITICAL. Every criterion's failing number comes from this artefact, and
   it settles the open question about wrap direction.
3. **Stage 5 — collapse the rail** - CRITICAL and highest-risk, which is why it is deliberately last.

**Total Critical Path**: Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5 → Stage 6. Stage 7 gates the
lane release.

**Parallel Opportunities**:
- Stage 3's contract document can be drafted while the Stage 2 census script runs, but it is not
  finalised until the artefact exists.
- The row work in Stage 4 and the rail work in Stage 5 touch different CSS regions, but they are
  deliberately serialized: a rail regression is seven defects, a row regression is one.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 7C. MILESTONES

| Milestone | Description | Success Criteria | Target |
|---|---|---|---|
| M1 | Harness can see the widths | Capture devices include 320, 402, 768 and 1440; the harness renders a view; `runtime-vars.css` pins no value this spec measures | End of Stage 1 |
| M2 | The numbers exist | The 84-state artefact is committed, and every criterion in `checklist.md` §1 has a recorded failing number | End of Stage 2 |
| M3 | The decision is written down | Every row and rail names its sizing authority; all 31 `max-content` declarations classified | End of Stage 3 |
| M4 | Rows land on a rhythm | A1 deviation 0; A2 residual 0; `--db-header-height` assigned in `src/` | End of Stage 4 |
| M5 | The header contains itself | A3 zero overflow at 4 widths across all 7 view types; A4 rail scrolls; A7 zero inert declarations | End of Stage 5 |
| M6 | Proven by delta | Stage 6 artefact differs from Stage 2 in the asserted numbers; negative controls hold | End of Stage 6 |
| M7 | Seen by a person | Full recapture at 4 widths per view, both themes, reviewed by a human; operator has looked at list rows and the filter rail on a device | End of Stage 7 |

<!-- /ANCHOR:milestones -->
---

## 8. RISK

**The rail is shared, not the calendar's.** It is a direct child of `.db-header`
(`active-view-controls-renderer.ts:66-69`) and renders in every view type. The defect was reported
against the calendar; a fix validated only against the calendar would ship six untested surfaces.
Stage 2 and Stage 6 both run all seven view types for this reason.

**The stylesheet reverses itself.** `architecture-findings.md` §4 records 87 duplicated selectors and
124 overridden values, and the rail contributes one of the named examples. Stage 5 is the highest-risk
step in this spec and it is deliberately last.

**The census could contradict the defect report.** §9 of `spec.md` records that static reading
predicts the opposite wrap behaviour to the one reported. If Stage 2 confirms the source reading, the
fix changes shape — it becomes an overflow-containment fix rather than a line-box fix. That is a
design decision to take with the operator at the Stage 3 boundary, not a discrepancy to reconcile
silently.

**Research gate.** Standing. If a criterion fails twice without a new hypothesis, read AnyType and
AppFlowy under `external/` for behaviour only — how a row degrades when its fields outnumber its
width, whether a filter rail scrolls, wraps or collapses. Both are AGPL/source-available against this
plugin's MIT: never copy code, CSS values or token scales. Notion is the visual target and is not a
source.

---

---

## 9. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] `../architecture-findings.md` read for the measurement behind the task's requirement
- [ ] `000` confirmed landed: the honest harness, and the cascade audit for any Stage-5 deletion
- [ ] Stage 1 has landed and `runtime-vars.css` pins no value this task measures
- [ ] The Stage-2 census artefact carries this task's state, and the criterion's failing number is
      recorded from it
- [ ] The serialized CSS lane is held by this phase, for Stages 4 and 5

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Harness before census, census before contract, contract before code, rows before the rail, and the rail last because it is shared by all seven view types |
| TASK-SCOPE | Content row sizing and the header rail. No `openSurface()` dependency; overlay placement is `001`, the properties panel row grid is `002`, checkboxes are `004` |
| TASK-EVIDENCE | Every criterion's number comes from the census artefact. A criterion whose "today" number does not come from that artefact is not accepted |
| TASK-MEASURE | The census script is unchanged between Stage 2 and Stage 6. A criterion may not be satisfied by changing how it is measured |
| TASK-CSS | This phase holds `styles.css` for Stages 4 and 5; every deletion cites its cascade-audit entry, and the lane is released at Stage 7's full recapture with human review |
| TASK-VIEWS | All seven view types at both census runs. A calendar-only validation would ship six untested surfaces |

### Status Reporting Format

Report per task: `TNN <status> — <Stage 2 number> -> <Stage 6 number>`, where status is one of
`complete`, `in progress`, `not started`, `blocked`. A criterion task with no Stage-2 number is
reported as `not started`, whatever its code state.

### Blocked Task Protocol

A task is BLOCKED when `000` has not landed, when Stage 1 has not removed the harness pins, when its
census state is missing from the artefact, or when the CSS lane is held elsewhere. On BLOCK: record
the blocker in `tasks.md` and stop that task. If the Stage-2 census contradicts the defect report on
wrap direction, that is an operator decision at the Stage-3 boundary — take it explicitly, never
reconcile it silently. When a criterion fails twice without a new hypothesis, open the standing
research gate in `spec.md` §5A rather than retrying.

---

## 10. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`checklist.md`](checklist.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md)
- Predecessor: [`../004-checkbox-ownership/spec.md`](../004-checkbox-ownership/spec.md)
- Harness dependency: [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- [`acceptance-criteria.md`](acceptance-criteria.md)
