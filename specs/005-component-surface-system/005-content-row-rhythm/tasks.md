---
title: "Task Breakdown: Content Row Rhythm and Header Rail"
description: "One task per requirement, each closed only with evidence that was read, not assumed."
trigger_phrases:
  - "005 row rhythm tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Content Row Rhythm and Header Rail

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

**Reconciled against evidence on 2026-09-02: 11 ticked with citations, 25 left open (0 not done by
decision, 2 operator-owned, rest unfound).**

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**No task closes on "looks right".** Each task's evidence must name a number that was read or a
command whose output and exit status were read.

**No DOM assertion in vitest.** `vitest` runs `environment: "node"` with no jsdom. A vitest test here
may assert source text; it may not claim to have measured a rectangle. Every geometry assertion lives
in `tools/storybook/verify-placement.mjs` or its successor.

**No spec path, requirement id, task id or phase number in any code comment.**

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP [Widen the harness, then census]

### Stage 1 — widen the harness

- [ ] **T1** Add 320 and 768 to the capture devices — REQ-008.
      *Evidence to close:* `capture.mjs` device list has four entries; a capture exists at each width
- [x] **T2** Teach the browser harness to render a view at a chosen width — REQ-008.
      *Evidence to close:* A list view renders at 320 and reports a row rect; the value changes with the width
      **Evidence:** `tools/live/view-census.json` `widths: [320, 402, 768, 1440]` and a
      `rowMatrix` of 24 states, each reporting a measured row rect. The value moves with the width:
      the 6-field phone row reads `mean 169.9` at 320 and `76.3` at 768; the 20-field phone row
      `497.4` at 320 and `99.7` at 1440.
- [x] **T3** Delete `--db-card-field-width` from `runtime-vars.css` — REQ-008.
      *Evidence to close:* Captured field width moves from 120px to the production value
      **Evidence:** deleted — `grep -n db-card-field-width tools/screenshots/runtime-vars.css`
      matches only the removal note at `:100`, which records both terms:
      *"production falls back to 150px, this pinned 120px"*. The file's stated rule is now
      *never assign a property the runtime also assigns*, because
      *"a harness that supplies the answer cannot detect a wrong one"*.
- [x] **T4** Delete `--db-timeline-row` from `runtime-vars.css` — REQ-008.
      *Evidence to close:* Timeline bands resolve to real grid rows; `grid-row` is no longer given a length
      **Evidence:** deleted — `grep -n db-timeline-row tools/screenshots/runtime-vars.css` matches
      only the removal note at `:102-103`, which records the defect it caused:
      *"a grid line INDEX, not a length; 34px made `grid-row` invalid, so every timeline band in
      every capture collapsed to auto"*. With the pin gone, `grid-row` is no longer handed a
      length.
- [x] **T5** Load `styles.css` in the desktop harness page as well as the phone page — REQ-008.
      *Evidence to close:* A cascade-dependent value differs from the inline scaffold
      **Evidence:** `tools/storybook/verify-placement.mjs:316`
      `page.addStyleTag({ content: readFileSync(join(REPO, "styles.css")) + HOST_BARE_CONTROLS })`
      on the desktop page, with the reason recorded at `:312-315`: the desktop checks previously
      *"measured a document that does not contain the cascade the defects live in"*, so every
      desktop number taken before that line *"described a rendering nobody ships"*.

### Stage 2 — census

- [ ] **T6** Script the 84-state census: 7 view types × 4 widths × 3 field counts, 20 rows — REQ-001.
      *Evidence to close:* Committed artefact with one record per state
- [x] **T7** Record every element whose right edge exceeds its parent's content box — REQ-005.
      *Evidence to close:* Per record: element class, parent class, overflow in px
      **Evidence:** `tools/live/view-census.json` `rows[]` — **597 records** over 36 fixtures at 4
      widths, each carrying `cls`, `parentCls`, `by` (overflow in px), `kind`
      (escaping/growing/scrolling), `scrolls` and `pastHeader`. Totals: `escaping: 577`,
      `growing: 264`, `scrolling: 313`.
- [x] **T8** Record the row-height histogram and standard deviation per state — REQ-002.
      *Evidence to close:* Per record: distinct heights, counts, deviation
      **Evidence:** `tools/live/view-census.json` `rowMatrix[]` — 24 states (4 widths x 3 field
      counts x desktop/phone), each with `distinct`, `min`, `max`, `mean` and `sd`, plus
      `spilling`, `worstSpill` and `lineBox`.
- [ ] **T9** Settle the wrap-direction question from the artefact — REQ-002.
      *Evidence to close:* Heights with wrap on and wrap off, both recorded; `spec.md` §9 answered with numbers
- [x] **T22** Resolve every element computing an intrinsic `max-content` width at runtime and record
      its rect against its bounding container's content box, at 4 widths x 7 view types — REQ-003.
      *Evidence to close:* Per element: class, bounding container, overflow in px, and whether that
      container scrolls. This is A6's failing number; the 31 static declarations are only the input
      **Evidence:** measured at runtime rather than read off the declarations —
      `tools/live/view-census.json` `rows[]` records `cls`, `parentCls`, `by` and `scrolls` per
      element at `widths: [320, 402, 768, 1440]`, over 36 fixtures, split
      `growing: 264` against `scrolling: 313`. The distinction the row asks for is the `scrolls`
      field: `db-column-menu-trigger` escapes `db-th-content` by 33.2px **into a scroller**.
- [ ] **T23** Fill every blank failing-number cell named in `acceptance-criteria.md`'s provenance
      table — REQ-001 through REQ-008.
      *Evidence to close:* Each cell holds a number produced by the named producer. No number invented

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Stage 3 — the sizing contract

- [ ] **T10** Write the contract: one declared authority per axis, argued against the alternatives — REQ-001.
      *Evidence to close:* Document names, for every row and rail, which side decides and why
- [ ] **T11** Classify all 31 `width: max-content` declarations as scroller-backed or grower — REQ-003.
      *Evidence to close:* Each survivor names its scrolling ancestor; each removal names its replacement
- [ ] **T12** Audit `min-width: 0` coverage against the container-sized set — REQ-001.
      *Evidence to close:* Every container-sized child either carries it or is listed as exempt with a reason

### Stage 4 — implement, rows first

- [ ] **T13** Declare the row rhythm token and express `min-height: 44px` in it — REQ-002.
      *Evidence to close:* Row heights are whole multiples; residual recorded as 0
- [x] **T14** Apply the contract to the list row, its meta row and its fields — REQ-001, REQ-002.
      *Evidence to close:* Standard deviation of 20 sibling row heights moves to 0
      **Evidence:** `sd: 0` in **all 24** `rowMatrix` states of
      `tools/live/view-census.json`, the 20-field states included. Ticked on `goal.md` criterion 1,
      which also records why an earlier `sd 0` meant nothing — every synthesised row carried the
      same string — and **watched it fail** with `overflow: hidden`, `text-overflow: ellipsis` and
      `white-space: nowrap` removed from `.db-list-field-value`: the deviation moves from `0` to
      between **99.2 and 1475.63** across the same combinations.
- [x] **T15** Resolve the inert `.db-list-field-wrap` rule — REQ-001.
      *Evidence to close:* Wrapped field either widens or is contained; no value paints outside its box
      **Evidence:** the rule is no longer inert — `styles.css:10459`, with dependent rules at
      `:10478`, `:10503` and `:10516`, reached by `src/views/list-renderer.ts:855`
      (`if (col.wrap) spacer.addClass("db-list-field-wrap")`). Containment is the ticked `goal.md`
      criterion 2, carried by `tools/live/replay.mjs:145`
      *"no list row paints outside its container"* — **was 26, recorded 0, now 0**, the failing
      value taken on the same instrument.
- [ ] **T16** Publish `--db-header-height` from the runtime — REQ-007.
      *Evidence to close:* Assigned in `src/`; resolves to the measured value with no harness override

### Stage 5 — the rail

- [ ] **T17** Collapse the rail's seven blocks to one declaration per property — REQ-004.
      *Evidence to close:* Each deletion cites its cascade-audit entry; recapture shows no unexplained change
- [ ] **T18** Resolve the `mask-image` reversal at `18577` → `19096` → `19101` — re-resolve with
      `rg -n -A6 '\.db-active-view-controls-scroll' styles.css` and read the hits **in order**, since
      the order of the three acts is the whole argument — REQ-004.
      *Evidence to close:* One rule remains; its behaviour matches the class the renderer sets, or both are removed; the computed winner recorded before and after
- [x] **T19** Make the rail a scroller, not a grower, at every width — REQ-003, REQ-005.
      *Evidence to close:* `scrollWidth > clientWidth` with the parent width unchanged
      **Evidence:** `tools/live/view-census.json` `rail[]` — all four widths (320, 402, 768,
      1440) report `scrolls: true`, `overflowing: true`, `growsContainer: false`, `fadeAppears:
      true`. Ticked on `goal.md` criterion 4, which the harness-dependence audit lists as sound:
      a relation between two measurements of the same element, so a host that pads the content
      moves both terms.
- [ ] **T20** Contain every `.db-header` descendant within the header content box — REQ-005.
      *Evidence to close:* Zero overflow records at 4 widths in all 7 view types, re-read from T22's
      runtime sweep rather than from the static declaration list
- [x] **T21** Hold header height across view switches to one spacing step — REQ-006.
      *Evidence to close:* Per-view heights recorded; max pairwise difference ≤ 8px
      **Evidence:** `tools/storybook/verify-placement.mjs:8250`
      *"switching view type changes header height by at most one token step"*, performing six real
      switches: `table=109px, board=109px, gallery=109px, list=109px, calendar=109px,
      timeline=109px`, **spread 0px** against one `--db-space-2` step. **Watched red** by giving
      the calendar and timeline branch a second toolbar row: `calendar=151px, timeline=151px …
      spread 42px`. The count is asserted beside it at `:8246`
      *"every view type renders a header to measure"*, added after a truthy stub returned six null
      heights and no error. Ticked on `goal.md` criterion 5.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

Stage 6 — prove it.

- [ ] **T22** Re-run the census unchanged — REQ-001-REQ-006.
      *Evidence to close:* Stage 6 artefact; every criterion is a delta against Stage 2
- [ ] **T23** Negative controls — REQ-001-REQ-006.
      *Evidence to close:* Deleting a chip moves an asserted rail number; deleting a field moves an asserted row number
- [ ] **T24** Full recapture at 4 widths per view, both themes — REQ-008.
      *Evidence to close:* `screenshots:verify` exit 0 **and** a human reviewed the changed PNGs
- [ ] **T25** Storybook row states and rail states at production mount points — REQ-008.
      *Evidence to close:* 1/6/20 fields, wrap on and off, empty and long values; 0/1/overflowing/cleared chips

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- [ ] [P0] `npx tsc --noEmit` exit 0, no output, read without a pipe
- [ ] [P0] `npm run build` exit 0
- [ ] [P0] `npx vitest run` exit 0, count not reduced
- [ ] [P0] Census re-run from the final state; every criterion's number moved
- [ ] [P0] Negative controls hold
- [ ] [P0] `npm run screenshots:verify` exit 0 after a **full** recapture
- [ ] [P0] Human reviewed the changed PNGs
- [ ] [P0] `npm run story:smoke` green at production mount points
- [ ] [P1] Working tree clean; no census scratch output committed outside the artefact

**No DOM assertion in vitest.** `vitest` runs `environment: "node"` with no jsdom. A vitest test here
may assert source text; it may not claim to have measured a rectangle. Every geometry assertion lives
in `tools/storybook/verify-placement.mjs` or its successor.

**No spec path, requirement id, task id or phase number in any code comment.**

---

**No task closes on "looks right".** Each row's evidence column must name a number that was read or a
command whose output and exit status were read.

- Every requirement REQ-001 to REQ-008 met with cited evidence.
- Every criterion A1-A7 has both its Stage-2 and its Stage-6 number recorded.
- **The operator has looked at list rows and the filter rail on a device** — the two defects that
  started this spec.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md)

<!-- /ANCHOR:cross-refs -->
