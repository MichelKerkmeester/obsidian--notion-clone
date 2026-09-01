---
title: "Feature Specification: Content Row Rhythm and Header Rail"
description: "One sizing decision — does the container own the size or the child — applied to list rows and to the shared header rail, so rows land on a declared rhythm and the rail scrolls instead of growing."
trigger_phrases:
  - "content row rhythm"
  - "ragged list rows"
  - "calendar filter bubbles overflow"
  - "intrinsic sizing contract"
  - "header rail scroller"
  - "005 row rhythm"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/005-content-row-rhythm"
    last_updated_at: "2026-08-30T18:40:00Z"
    last_updated_by: "summary-author"
    recent_action: "List rows shipped over three lane cycles; the header rail is untouched and unmeasured"
    next_safe_action: "Collapse the rail's 9 blocks, resolve the mask reversal, then re-run the census"
    blockers: []
    key_files:
      - "spec.md"
      - "implementation-summary.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "../../../../src/views/list-renderer.ts"
      - "../../../../src/views/column-width.test.ts"
      - "../../../../tools/live/view-census.mjs"
      - "../../../../tools/storybook/verify-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-005"
      parent_session_id: null
    completion_pct: 43
    open_questions: []
    answered_questions: []
---
# Feature Specification: Content Row Rhythm and Header Rail

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `004-checkbox-ownership`, successor
> `001-overlay-placement-and-menu-language`. Root causes, the corrected inventory and the criteria
> doctrine live in [`../architecture-findings.md`](../architecture-findings.md); this spec cites it
> and does not restate it.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

Two operator defects — ragged list rows and calendar filter bubbles overflowing — ask one question:
does the container own the size, or does the child? Today the child does, everywhere: 31
`width: max-content` declarations against 245 `min-width: 0` declarations that only partly contain
them. One sizing contract answers both, and the header rail turns out to be shared by all seven view
types rather than owned by the calendar.

**Key Decisions**: one declared sizing authority per axis, with `min-width: 0` where the container
decides and a scrolling ancestor where the child does; a declared row-rhythm token replacing the
free-standing `min-height: 44px` floor; the rail's seven declaration blocks collapsed to one per
property; `--db-header-height` published from the runtime instead of resolving to a fallback.

**Critical Dependencies**: `000-surface-contract-and-truthful-harness` — the honest harness only, not
the factory. This phase blocks nothing and runs while the overlay lane is occupied. It holds
`styles.css` for Stages 4 and 5.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 005-content-row-rhythm |
| **Level** | 3 |
| **Depends on** | `000-surface-contract-and-truthful-harness` — the honest harness only, not the factory |
| **Blocks** | nothing; it runs while the overlay lane is occupied |
| **CSS lane** | holds `styles.css` for the sizing contract and the rail deduplication |
| **Priority** | P0 |
| **Status** | **Partial — list rows landed and instrumented, the header rail untouched.** In the tree: renderer-declared tracks via `listFieldTrackTemplate` at `src/views/list-renderer.ts:390`. `tasks.md` carries 0 of 36 ticked against work the tree contains. **Completion figure: UNKNOWN** — this phase has no `goal.md` criteria checklist, so the rule in `../roadmap.md` §3.2 has nothing to count and the `completion_pct` below is an unrevised phase-cut value. Writing that checklist settles it. |
| **Created** | 2026-08-29 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `004-checkbox-ownership` |
| **Successor** | `001-overlay-placement-and-menu-language` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Two operator defects, one question.

**List rows are ragged.** A row is `display: grid` with `width: max-content` and `min-width: 100%`
(`styles.css:9602`) — it grows to whatever its children demand. Its fields are rigid: `.db-list-field`
is `flex: 0 0 var(--db-card-field-width, 150px)` (`styles.css:9703`). The meta row is
`flex-wrap: nowrap; width: max-content; overflow: visible` on desktop (`styles.css:9668`) and
`flex-wrap: wrap; overflow: hidden` on a phone (`styles.css:17873`). Nothing anywhere declares a row
height. `min-height: 44px` is a floor, not a rhythm, so a row is as tall as its tallest child made
it and no two rows are obliged to agree.

**Calendar filter bubbles overflow.** The bubbles are the sort and filter chips on
`.db-active-view-controls`, which is created as a direct child of `.db-header`
(`active-view-controls-renderer.ts:66-69`) and is therefore **shared by every view type, not owned by
the calendar**. That rail is declared in seven blocks: `.db-active-view-controls` at `styles.css:1332`,
`16773` (inside `@media (max-width: 760px)`, opened at `16758`) and `19079`;
`.db-active-view-controls-scroll` at `1338`, `18577` and `19096`, plus its `.is-overflowing` modifier
at `19101`. **`18577` sets a gradient `mask-image` on the scroller and `19096` sets it back to
`none`** — the later block wins, and the mask now survives only under `.is-overflowing`, a class
toggled from JavaScript at `active-view-controls-renderer.ts:153` on
`scrollWidth > clientWidth + 1`.

**The shared question.** Does the container own the size, or does the child? Today the child does,
everywhere: **31 `width: max-content` declarations** across the stylesheet, against 245 `min-width: 0`
declarations that only partly contain them. A row grows because its fields insist on 150px each; a
rail overflows because its chips insist on their content width and nothing upstream is a scroller.
One sizing decision answers both.

**A rule that is already inert.** `.db-list-field-wrap` (`styles.css:9719`) sets
`width: max-content; max-width: none`, but the element it modifies still carries `flex: 0 0 150px`
from `.db-list-field`, and flex-basis beats `width` for a flex item's main size. Only `max-width: none`
and the sibling `overflow: visible` (`styles.css:9738`) survive — so a wrapped field does not widen,
it **paints outside its own box**. This is the same class of defect as the mask reversal: a
declaration that reads as intentional and does nothing.

---

### Why this is one spec and not two

The two defects ask the same question, the answer is a single sizing contract, and the edits land in
the same CSS regions and the same serialized lane. Splitting them would mean two censuses over the
same view matrix, two passes over `styles.css` that cannot run concurrently, and two screenshot
recaptures of the same 196 fingerprinted images — more overhead than either fix contains in code.

**Split this spec only if different people ship the two halves.** Nothing else justifies the cost.

---

### Purpose

One sizing decision — does the container own the size or the child — applied to list rows and to the
shared header rail, so rows land on a declared rhythm and the rail scrolls instead of growing.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- The intrinsic-sizing contract: one declared authority per axis for every content row and the header
  rail
- A row-rhythm token, and list row heights expressed as whole multiples of it
- Classification of all 31 `width: max-content` declarations as scroller-backed or grower
- Collapsing the header rail's seven declaration blocks to one per property, including the
  `mask-image` reversal
- Containing every `.db-header` descendant inside the header's content box
- Publishing `--db-header-height` from the runtime
- Harness widening: 320 and 768 capture devices, view rendering at a chosen width, and removing the
  `runtime-vars.css` pins this spec measures

### Out of Scope

- Anything requiring `openSurface()`. This spec needs the honest harness from `000` and nothing else,
  which is why it runs while the overlay lane is occupied
- Overlay placement and menu grammar — `001`
- The properties panel row grid — `002`; the finding generalises, the fix here does not
- Checkbox appearance — `004`
- What a row or a chip *does*. This phase changes how they are sized and contained, not their
  behaviour

### Files to Change

The complete list is the output of the Stage-2 census artefact. The files known before the census are:

| File Path | Change Type | Description |
|---|---|---|
| `styles.css` | Modify | The sizing contract for `.db-list-row` (`styles.css:9602`), `.db-list-field` (`styles.css:9703`), the meta row (`styles.css:9668`, `styles.css:17873`) and the inert `.db-list-field-wrap` (`styles.css:9719`, `styles.css:9738`); the rhythm token beside the line-height ratios at `styles.css:41-51`; the rail's seven blocks at `styles.css:1332`, `styles.css:1338`, `styles.css:16316`, `styles.css:18577` and their siblings; the header's negative margins at `styles.css:609`; the sticky offsets that consume `--db-header-height` at `styles.css:17698` |
| `active-view-controls-renderer.ts` | Modify | The rail is a direct child of `.db-header` (`active-view-controls-renderer.ts:66-69`); the `is-overflowing` toggle at `active-view-controls-renderer.ts:153` either matches one surviving rule or is removed with it |
| `card-field-renderer.ts` | Modify | The per-column `col.wrap` boolean (`src/data/types.ts:90`) applied at `card-field-renderer.ts:109`, once the census settles which direction wrapping actually moves the heights |
| Header height publisher (`src/`) | Create | `--db-header-height` assigned from the measured runtime value; it is currently assigned nowhere in `src/` |
| `tools/screenshots/capture.mjs` | Modify | Add 320 and 768 to the two devices at `tools/screenshots/capture.mjs:71-72` |
| `tools/screenshots/runtime-vars.css` | Modify | Delete the `--db-card-field-width` pin and the invalid `--db-timeline-row` pin at `tools/screenshots/runtime-vars.css:24` and its neighbours |
| `tools/storybook/verify-placement.mjs` | Modify | Render a view at a chosen width; load `styles.css` on the desktop page as well as the phone page (`verify-placement.mjs:220`) |
| Census script | Create | The 84-state census, committed with its artefact |

<!-- /ANCHOR:scope -->
---

### What was measured, and what it measures now

Recorded 2026-08-30, list rows only. The header rail is untouched.

**Raggedness is horizontal, and the fix was half-landed.** `listFieldTrackTemplate`
(`src/views/column-width.ts:42`) and the renderer's `grid-column: index + 1` are both present and
both correct: the index comes from the unfiltered field list, so an omitted property leaves its
column empty. That decides nothing where the row is not a grid, and on a phone
`.is-phone .note-database-container .db-list-row-meta` is `display: flex; flex-wrap: wrap`, which
ignores `grid-column` outright. Both defects reported against the earlier pass were real: the phone
was left on flex, and a property's position there was still a count.

Measured on `list-sparse-fields` — twelve cards each missing a different subset — on a page built
the way `capture.mjs` builds one:

| | before | after |
|---|---|---|
| desktop, distinct card widths | 1 | 1 |
| desktop, worst property spread | 1 column | 1 column |
| **phone, distinct card widths** | **6** (304/226/283/218/118/266px) | **1** (304px) |
| **phone, worst property spread** | **2 columns** (Payment and Billing) | **1 column** |

The fix is in the renderer rather than in a track list: a property with no value is still built and
marked `is-placeholder`, so its column is claimed by index in whichever regime the row is in.
Negative control: reverting the fixture to drop the field returns the phone to 6 widths and 2
columns while the desktop stays green, which is the check correctly reporting that half of this was
fixed before and half was not.

**A superseded number.** An earlier reading of 13 to 14 distinct x-positions came from a page with
no `--capture-max-width`, where the plugin container measured 948px inside a 402px viewport. That
described a width no phone has. The measurements above set it.

**The row matrix asserted against classes that cannot exist.** `tools/live/view-census.mjs`
synthesised its rows from `db-list-row-field`, `db-list-row-field-label` and
`db-list-row-field-value` — **zero stylesheet rules and zero creation sites each**. Every height,
standard deviation and spill count it has ever reported was a measurement of unstyled divs. Its
second axis was inert for the same reason: it toggled an inline `flex-wrap` on an element that has
been a grid since the column fix. The matrix now builds `db-list-field` and its real nesting, and
the axis is the device, which is what changes the regime. `screenshot-fixtures.test.ts` gained the
guard the fixtures already had, and the whole-word matcher it needed — the substring version passed
because this suite's own comment naming the invented classes made them look real.

---

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001 — One sizing authority per axis, declared.** For every content row and for the header rail, it
  is written down whether the container or the child decides the size. Where the container decides, the
  child carries `min-width: 0` so it can actually shrink. Where the child decides, the nearest ancestor
  is a scroller, never a grower.

- **REQ-002 — Rows land on a declared rhythm.** A row-height unit is declared as a token and a row's height
  is a whole multiple of it. `min-height: 44px` becomes a rhythm expressed in that unit rather than a
  free-standing floor.

- **REQ-003 — Scroller or grower, never both.** An element with `width: max-content` must have an
  overflow-scrolling ancestor inside the header or the view canvas. All 31 `max-content` declarations
  are classified against this rule; each survivor names its scroller. Reproduce the count with
  `rg -c 'width:\s*max-content' styles.css`.

  **The classification is not the acceptance condition** (review finding F8). A6 closes on the
  runtime sweep: **0 elements painting outside the content box of the container that bounds them**,
  at 320, 402, 768 and 1440 CSS px across all seven view types, and for every container that
  legitimately overflows, `scrollWidth > clientWidth` with the **parent's width delta 0**. A
  completed classification with an element still painting outside its scroller has not satisfied
  this requirement.

- **REQ-004 — The rail is declared once.** The rail's seven blocks are reduced to one intentional
  declaration per property. The `mask-image` reversal at `18577` → `19096` → `19101` resolves to one
  rule whose behaviour matches the `is-overflowing` class the renderer actually sets, or the class is
  removed along with the JavaScript that sets it.

- **REQ-005 — Nothing inside the header paints outside it.** No descendant of `.db-header` has a right edge
  beyond the header's **content box**. The header's own box is 24px wider than the container's
  (`margin-left: -12px; margin-right: -12px`, `styles.css:609`) and pads 12px back in, so the border box
  and the content box differ by 12px per side; the census measures the content box.

- **REQ-006 — The header does not resize when the view does.** Switching view type changes the header's
  measured height by at most one step on the spacing scale.

- **REQ-007 — `--db-header-height` becomes real.** It is read at `styles.css:17698` with a `34px` fallback
  and **is never assigned anywhere in `src/`**. Its only assignment in the repository is
  `tools/screenshots/runtime-vars.css:24`, at `40px`. The runtime publishes the measured value; the
  harness stops supplying it. This is `000`'s criterion A5 in this spec's own territory.

- **REQ-008 — The harness can see the widths this spec is about.** `tools/screenshots/capture.mjs:71-72`
  defines exactly two devices — 1440 desktop and 402 mobile. 320 and 768 are added, and
  `tools/storybook/verify-placement.mjs` gains the ability to render a view at a chosen width; today it
  bundles only `popover-position` and `mobile-bottom-sheet` and renders no view at all, and it loads
  `styles.css` on the phone page only (`verify-placement.mjs:220`).

---

### P1 - Required (complete OR user-approved deferral)

None. Every requirement above is a blocker: each one is load-bearing for a criterion in Section 5,
and the spec records no deferral for any of them.

<!-- /ANCHOR:requirements -->
---

## 4A. INVENTORY METHOD

**Automatic and exhaustive, not a sample.**

Render **each of the seven view types** — `table`, `board`, `gallery`, `list`, `chart`, `calendar`,
`timeline` (`src/data/types.ts:238`) — at **320, 402, 768 and 1440** logical pixels, with **1, 6 and
20 visible fields**, over a fixture of **20 rows**. That is 84 render states.

For each state record two things:

1. **Every element whose right edge exceeds its parent's content box**, with the element's class, the
   parent's class, and the overflow in pixels.
2. **The height histogram of sibling rows** — every distinct height and its count, plus the standard
   deviation.

The census is a script, its output is a committed artefact, and it runs again unchanged after the
implementation. A criterion whose "today" number does not come from this artefact is not accepted.

**Known harness lies the census must not inherit.** `runtime-vars.css` pins
`--db-card-field-width: 120px` (line 29) where the stylesheet's fallback is `150px`, so captures render
list fields 30px narrower than production. It pins `--db-timeline-row: 34px` (line 63), but
`--db-timeline-row` is a **grid line index**, not a length — `styles.css:16316` and `16554` use it as
`grid-row: var(--db-timeline-row, 1)` and the renderer sets it as `String(rowIndex)`
(`calendar-timeline-renderer.ts:588,660`). `grid-row: 34px` is invalid, so every timeline band falls
back to `auto` in every capture. The census runs against the production values.

---

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

### Acceptance Criteria

Each is a number measured on the real renderer at the production mount point. Rows marked
*census records it* carry a static source fact today and take their failing number from §5's artefact
**before** the criterion is accepted — the same rule `000` applies to its own table.

| # | Criterion | Today |
|---|---|---|
| **A1** | With 20 rows and wrapping off, the standard deviation of list row heights is **0** | No row height is declared anywhere; `min-height: 44px` is a floor (`styles.css:9602`). Census records the deviation |
| **A2** | With wrapping on, every row height is a whole multiple of the line box | No rhythm unit exists; `--db-font-*-line-height` are ratios, not lengths (`styles.css:41-51`). Census records the residuals |
| **A3** | No descendant of `.db-header` has a right edge beyond the header's content box, at 4 widths, in **all seven view types** | The rail's only containment is `overflow-x: auto` on `.db-active-view-controls-scroll` (`styles.css:1338`); the clear button and the rail box itself are outside it. Census records the overflow in px |
| **A4** | The rail scrolls rather than grows: `scrollWidth > clientWidth` with the parent's width unchanged | The renderer already computes exactly this at `active-view-controls-renderer.ts:153`; nothing asserts it. Census records both numbers |
| **A5** | Switching view type changes header height by at most one step on the spacing scale (`--db-space-4`, 8px) | `--db-header-height` is never assigned in `src/`; the only assignment is `runtime-vars.css:24`. Census records the per-view heights |
| **A6** | **Nothing sized `max-content` paints outside the container that bounds it** — 0 overflowing elements at 4 widths x 7 view types, and every container that legitimately overflows scrolls rather than grows (parent width delta 0). *Rewritten under review finding F8: "resolve and classify each declaration" was a classification task satisfied by finishing the spreadsheet* | **31 declarations** on the current tree, from `rg -c 'width:\s*max-content' styles.css` — a static count, and the input that makes the runtime sweep exhaustive, not the measurement. The per-element overflow in px is **blank**: no element has been resolved at runtime because `verify-placement.mjs` renders no view |
| **A7** | Deleting a chip from the rail changes an asserted number; deleting a field from a row changes an asserted number | No such check exists; per `000` R6 an assertion that survives deletion is theatre |

**Banned.** No criterion may count call sites, assert a class is present, or assert a rule count.
Every one of 1.3.1's criteria was of that form and every one passed while the UI stayed broken.

---

### Acceptance Scenarios

1. **Given** a 20-row list fixture with wrapping off, **When** sibling row heights are measured,
   **Then** their standard deviation is 0 (A1).
2. **Given** any of the seven view types at 320, 402, 768 or 1440, **When** the header's descendants
   are measured, **Then** none has a right edge beyond the header's content box (A3).
3. **Given** the header rail with more chips than fit, **When** it is measured, **Then**
   `scrollWidth > clientWidth` with the parent's width unchanged (A4).

<!-- /ANCHOR:success-criteria -->
---

## 5A. VERIFICATION METHOD

- **Measured tests** — browser harness only. `vitest` runs `environment: "node"` with no jsdom
  (`vitest.config.ts`), so **every DOM assertion lives in
  `tools/storybook/verify-placement.mjs`** or its successor. A vitest test in this spec may assert
  source text; it may not claim to have measured a rectangle.
- **Negative controls** — A7 is run before the criteria are trusted, not after.
- **The desktop harness has no cascade, and that is this packet's biggest exposure.**
  `verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it targets the phone
  page, so **the desktop page is already running a "render without the stylesheet" substitution and
  reporting green** — the exact substitution A13 exists to catch, running permanently and unlabelled.
  On such a page `.db-list-row` has no `min-height`, no `--db-*` token resolves, the rail has no
  `overflow-x`, and **A6's sweep finds zero elements: a clean pass that means nothing.** `000`
  repairs the load; until it has, no desktop number here is admissible, and one recorded before the
  repair is discarded rather than re-used. A8 is the gate that proves the repair landed — it is
  written as a probe for a value that cannot exist without the stylesheet, precisely so it can fail.
- **Line numbers are dated hints; the selector is the address.** Every `styles.css:NNNN` here was
  confirmed correct on 2026-08-29 and is kept as evidence about the tree on that date. `000` deletes
  dead blocks and this phase collapses seven rail blocks, so resolve through the table in
  `acceptance-criteria.md` rather than by number. The three-act `mask-image` reversal
  (`18577` → `19096` → `19101`) matters most: the **order** of the three is the whole argument, so
  read `rg -n -A6 '\.db-active-view-controls-scroll' styles.css` in order and record which act
  computed the winner, before and after the collapse.
- **The `styles.css` lane.** Taken at the start of Stage 4 and held through Stage 6; Stage 1 touches
  only harness files and Stages 2 and 3 census and decide against an unedited stylesheet. Released
  only after a full recapture, a **named human** signing off on every changed PNG, `008`'s early
  replay re-asserting `000` and `004` against the released tree, and cascade re-confirmation for
  every duplicated selector touched. `004` unblocks from `000` on the same edge as this packet and
  also edits `styles.css`; the two are serialized by this rule and nothing else.
- **Screenshots** — 4 widths per view type, both themes, ending in **a human looking at the changed
  PNGs**. `screenshots:verify` proves a capture was regenerated after its hand-maintained source list
  changed; it never opens an image.
- **Storybook** — a row-state row (1 / 6 / 20 fields, wrap on and off, empty values, long values) and
  a rail-state row (0 chips, 1 chip, overflowing, cleared), mounted where production mounts them.
- **Research gate** — standing, triggered when a criterion fails twice without a new hypothesis. Read
  AnyType and AppFlowy under `external/` for **behaviour only**: how a row degrades when its fields
  outnumber its width, and whether a filter rail scrolls, wraps or collapses. Both are
  AGPL/source-available against this plugin's MIT — **never copy code, CSS values or token scales.**
  Notion is the visual target and is not a source.

---

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

The sizing contract touches seven view types at once and lands in the serialized CSS lane, so no
other spec may hold `styles.css` while it runs.

The rail's seven blocks include one inside a `@media (max-width: 760px)` query and one that reverses
an earlier `mask-image`. Collapsing them is exactly the operation `architecture-findings.md` §4 shows
going wrong: a block that looks dead is load-bearing through a duplicate class. Every deletion is
justified from the cascade audit `000` produces, and the full recapture with human review is the check
that the block really was dead.

`--db-header-height` currently resolves to `34px` by fallback in production and `40px` in captures.
Publishing the real value will move sticky offsets on `.db-table td`, `.db-board-card`, `.db-list-row`
and `.db-gallery-card` (`styles.css:17698`). That movement is the point, and it is why the recapture
is a full one.

---

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Dependency | `000-surface-contract-and-truthful-harness` — the honest harness only, not the factory | Without it no measurement can be trusted | This phase starts once `000` lands and takes no factory dependency |
| Dependency | `000`'s cascade audit | Stage 5's deletions each need an audit entry | Every rail deletion cites its entry; a block that looks dead has already been shown here to be load-bearing through a duplicate class |
| Dependency | Serialized `styles.css` lane, Stages 4 and 5 | No other spec may hold the file in that window | The lane is released at Stage 7's recapture |
| Dependency | 196 fingerprinted captures | A partial recapture cannot satisfy `screenshots:verify` | Full recapture at four widths per view, both themes, then a human opens the changed PNGs |

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance

- **NFR-P01**: The census is tooling and ships nothing; its artefact is committed, its script is not
  loaded at runtime.
- **NFR-P02**: Publishing `--db-header-height` measures the header once per layout change, not per
  row.

### Security

- **NFR-S01**: No network call, telemetry or remote dependency. Local Obsidian DOM APIs only.
- **NFR-S02**: AnyType and AppFlowy under `external/` are read for behaviour only — both are
  AGPL/source-available against this plugin's MIT, so no code, CSS value or token scale is copied.
  Notion is the visual target and is not a source.

### Reliability

- **NFR-R01**: Each stage is separately revertable and lands as its own commit.
- **NFR-R02**: The census script is unchanged between Stage 2 and Stage 6; criteria are the delta
  between the two artefacts, so a criterion cannot be satisfied by changing how it is measured.
- **NFR-R03**: All seven view types are covered at both census runs, not the five in the original
  brief — the rail is shared, so a calendar-only validation would ship six untested surfaces.

---

## 8. EDGE CASES

### Data Boundaries

- 320, 402, 768 and 1440 logical pixels, with 1, 6 and 20 visible fields, over a 20-row fixture: 84
  render states. The census is exhaustive, not a sample.
- A rail with 0 chips, 1 chip, overflowing and cleared are the four rail states the catalogue must
  show; a row with empty values and with long values are the two row extremes.
- The header's border box and content box differ by 12px per side (`margin-left: -12px;
  margin-right: -12px` at `styles.css:609`, padded 12px back in). The census measures the content box.

### Error Scenarios

- The harness lies in two known ways the census must not inherit: `--db-card-field-width` is pinned
  30px narrower than production, and `--db-timeline-row` is pinned as a length when it is a grid line
  index, so every timeline band falls back to `auto` in every capture.
- A declaration can read as intentional and do nothing: `.db-list-field-wrap`'s `width` is beaten by
  `flex-basis`, and the rail's `mask-image` is set then unset. Both are recorded as A7's failing
  state rather than assumed away.
- `screenshots:verify` green is not evidence that anything looks right; it never opens an image.

### State Transitions

- Switching view type must not resize the header by more than one step on the spacing scale (A5).
- Toggling `is-overflowing` from JavaScript at `active-view-controls-renderer.ts:153` must match
  whatever single rule survives Stage 5, or the class and its JavaScript go together.
- Publishing `--db-header-height` moves sticky offsets on `.db-table td`, `.db-board-card`,
  `.db-list-row` and `.db-gallery-card`. That movement is the point, and it is why the recapture is a
  full one.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 21/25 | Seven view types, 84 census states, 31 `max-content` declarations, seven rail blocks, one new token, one runtime publisher, four harness changes |
| Risk | 18/25 | Holds the serialized `styles.css` lane for two stages; the rail is shared by every view; publishing the header height moves sticky offsets across four surfaces |
| Research | 14/20 | Root causes measured in `../architecture-findings.md`; the open question is which direction wrapping actually moves the heights, and only the census answers it |
| Multi-Agent | 8/15 | Single CSS lane by construction |
| Coordination | 9/15 | Depends on `000`'s honest harness and cascade audit; blocks nothing |
| **Total** | **70/100** | **Level 3** |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | The rail fix is validated only against the calendar, shipping six untested surfaces | H | M | Stage 2 and Stage 6 both run all seven view types; S1 in `checklist.md` §5 asserts it |
| R-002 | A collapsed rail block that looked dead was load-bearing through a duplicate class | H | M | Every deletion cites its entry in `000`'s cascade audit; full recapture with human review |
| R-003 | The census contradicts the defect report on wrap direction | M | H | Recorded as an open question; if Stage 2 confirms the source reading the fix changes shape, and that is an operator decision at the Stage 3 boundary, not a silent reconciliation |
| R-004 | Publishing `--db-header-height` moves sticky offsets the captures cannot justify | M | M | Revert Stage 4's header publication alone; the row rhythm does not depend on it |
| R-005 | The census inherits a harness lie and measures the wrong thing | H | M | Stage 1 removes the `--db-card-field-width` and `--db-timeline-row` pins before Stage 2 runs; H3 asserts the harness pins no value this spec measures |
| R-006 | A criterion is satisfied by changing how it is measured | H | L | The census script is unchanged between Stage 2 and Stage 6; criteria are the delta between artefacts |

---

## 11. USER STORIES

### US-001: Rows that line up (Priority: P0)

**As a** plugin user scanning a list view, **I want** rows to land on a consistent rhythm, **so that**
the list stops looking ragged and I can scan down it.

**Acceptance Criteria**:
1. Given 20 rows with wrapping off, When their heights are measured, Then the standard deviation is 0
   (A1).
2. Given wrapping on, When each row height is measured, Then it is a whole multiple of the line box
   (A2).

### US-002: A header that contains its own contents (Priority: P0)

**As a** plugin user with several filters applied, **I want** the filter chips to scroll inside the
header, **so that** they stop painting past the edge of the view.

**Acceptance Criteria**:
1. Given any of the seven view types at any of the four widths, When the header's descendants are
   measured, Then none exceeds the header's content box (A3).
2. Given more chips than fit, When the rail is measured, Then `scrollWidth > clientWidth` and the
   parent's width is unchanged (A4).

### US-003: A header that stays put (Priority: P0)

**As a** plugin user switching between view types, **I want** the header to stay the same height,
**so that** the content below it does not jump.

**Acceptance Criteria**:
1. Given a switch between any two view types, When header height is measured, Then the difference is
   at most one step on the spacing scale (A5).
2. Given the running plugin, When `--db-header-height` is read, Then it resolves to the measured value
   published from `src/`, not to a fallback or a harness pin (REQ-007).

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

**The wrap direction does not match the source.** The defect was reported as *ragged unless wrapping
is enabled*. In the stylesheet, wrapping a list field keeps `white-space: nowrap`
(`styles.css:9738`) and does not add a line — the field is a per-column boolean (`col.wrap`,
`src/data/types.ts:90`) applied at `card-field-renderer.ts:109`, and on desktop the meta row is
`flex-wrap: nowrap` (`styles.css:9668`), so no field can move to a second line at all. Static reading
predicts the *opposite* of the report: uniform heights with wrap off, and values painting outside
their boxes with wrap on.

The census settles it. Both readings produce a failing number and both are covered by A1 and A2, so
this question does not block the work — but it must be answered from the artefact before the fix is
designed, because the two readings imply different fixes.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- **Folder neighbours**: `004-checkbox-ownership` and `006-record-open-target`. Folder numbering is
  an identifier, not the execution order; this phase runs third, per [`../spec.md`](../spec.md) §3.
- **Parent Spec**: [`../spec.md`](../spec.md)
- **Findings**: [`../architecture-findings.md`](../architecture-findings.md)
- **Predecessor**: [`../004-checkbox-ownership/spec.md`](../004-checkbox-ownership/spec.md)
- **Harness dependency**: [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- **Implementation Plan**: See [`plan.md`](plan.md)
- **Task Breakdown**: See [`tasks.md`](tasks.md)
- **Verification Checklist**: See [`checklist.md`](checklist.md)
- **Acceptance Criteria**: See [`acceptance-criteria.md`](acceptance-criteria.md)
