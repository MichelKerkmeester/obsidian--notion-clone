---
title: "Tasks: Visual Pass Product Defects"
description: "One task per defect, plus the lane, the recapture, the release, the gate and the commit."
trigger_phrases: ["035 tasks", "035 plan"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/035-visual-pass-product-defects"
    last_updated_at: "2026-09-02T23:55:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "T6 closed: phone bar wraps its actions; T4 stays open"
    next_safe_action: "Take the operator call on P4 needing a wider month column"
    blockers: ["P4 truncates 4 of 11 titles from a 48px column at 402px"]
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-035-tasks"
      parent_session_id: null
    completion_pct: 89
    open_questions: ["Does a 48px phone column earn a wider month cell (T4)"]
    answered_questions: ["P12 is guarded on disk; P16 has no better-styled sibling to copy"]
---
# Tasks: Visual Pass Product Defects

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it. A row is closed by the runtime that
> can observe its evidence, which for every visual row is not the runtime that wrote the fix.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## TASKS

### Lane

- [x] **L1** Acquire the stylesheet lane before the first `styles.css` edit — REQ-005.
      *Evidence to close:* `tools/lane/css-lane.json` holds `035-visual-pass-product-defects` with an
      `acquiredAt` and an appended `acquire` history entry carrying the current `baselineHash`.
      `SURFACE_PHASE=035-visual-pass-product-defects node tools/lane/check-lane.mjs` quoted.

### One per defect

- [x] **T1** P1 · invalid-events span cell, `styles.css:11244` — REQ-001, REQ-003.
      *Closed:* the `grid-area` declaration dropped and read back `""`; it now parses as `event-span`.
      The cell measured 28x24 in the select gutter and measures 302x28. Read in both themes.
- [x] **T2** P2 · board drop-target background, `styles.css:9153` — REQ-001, REQ-004.
      *Closed:* `--background-interactive-hover`, defined nowhere, became `--db-hover-bg` at `styles.css:100`,
      the token the surrounding hover rule already uses. No fixture renders the state, so this is read from
      the token table rather than from a capture, and that is said rather than implied.
- [x] **T3** P3 · twelve invalid-events controls under the 28px floor, `styles.css:11161` — REQ-001.
      *Closed:* 9 of the 12 measured controls sat under the floor; 0 do. The baseline falls 228 → 215,
      measured twice at 215 before it was written.
- [ ] **T4** P4 · the phone calendar "+" stealing the title's width, `styles.css:18621` — REQ-001.
      *Open, improved, mechanism still corrected:* the "+" is a 28x28 out-of-flow corner control that
      hit-tests to itself, and it never took the titles' width — they are week-grid segments, not
      day-cell children. What did move is the segment's own box: taking back `margin-inline`, `gap` and
      `padding-inline` inside the coarse-pointer block goes 44.28 → 48.28px and the title 33 → 37px, and
      truncation falls **6 → 4** of 11 titles at the 402px frame. "Spotify" and the four-day
      "Q1 renewals sweep" stopped truncating. The row asks for none, and four still need more than a
      48px column: "Spotify family" wants 72px of text in 37px of box. The implementing lane's other
      half — relaxing the title to `flex: 1 1 auto` — **measured 7 and was reverted here**; that basis
      is a floor, and without it the title took 28px inside the wider box and two titles that had fit
      began truncating. A wider phone month cell is a layout decision this row does not own.
- [x] **T5** P5 · the "N hidden" badge overhanging the Group button, `styles.css:2293-2308` — REQ-001, REQ-004.
      *Closed:* the badge was 55px absolute at `right: -5px`, overhanging its 28px button by 5px right and
      22px left at 4.09:1. It is static, 61px, inside a 96px button, at 8.36:1.
- [x] **T6** P6 · "Copy CSV" clipping at 402px — REQ-001. Proof: `styles.css:2511-2527`,
      `tools/storybook/verify-placement.mjs:907-914`.
      *Closed:* was 416px of content in a 370px box, "Copy CSV" 55px outside a port a capture cannot
      scroll and clipped to "Cop". The phone bar now wraps, grows with its content, drops the horizontal
      scroll lane and keeps the 44px action floor: the content box reads 46px → 96px and the actions
      maxActionRight 341px inside clientRight 373px. The retargeted placement check was observed red at
      567px with the stylesheet stashed, then green; both mobile captures were recaptured and read.
- [x] **T7** P7 · list field truncating beside an empty row, `styles.css:10446` — REQ-001.
      *Closed:* 2 of 48 field values were clipped and 0 are. The sparse capture is byte-identical to its
      committed self, so the 110/190/150/130 columns are unchanged — the declared width is a floor now,
      not a cage, because deleting it collapsed them to 73/141/97/75.
- [x] **T8** P8 · the collapsed leading track in the select popover, `styles.css:7041-7043` — REQ-001.
      *Closed:* the unregistered row's dot sat at x=33 against x=51 for its siblings — an 18px offset, not
      the ~35px reported. All four now sit at x=51, the handle hidden by `visibility` at its full 8px.
- [x] **T9** P9 · the dead `is-compact` class, `src/views/relation-value-renderer.ts:36` — REQ-001.
      *Closed:* 0 matching rules became 3, and the compact row photographs tighter than the two above it.
      The rule was written rather than the class deleted: the renderer sets it deliberately, per row.
- [x] **T10** P10 · four unstyled OS sliders, `styles.css:11398` and `styles.css:15889` — REQ-001, REQ-004.
      *Closed:* 0 of 4 sliders carried the treatment; 4 of 4 do, every colour a host token. The 4px line is
      on the track pseudo-element — painting it on the input left a 353x4 control in the touch census.
- [x] **T11** P11 · the icon-picker header overflowing, `styles.css:18366` — REQ-001.
      *Closed:* 2 header controls fell outside the popover, at x=347 and x=391 against an edge at x=336; 0 do.
      The header wraps from 37px to 82px and the search takes its own full-width row.
- [x] **T12** P12 · reorder arrows on a transient row — REQ-001, REQ-006.
      *Evidence to close:* **this row closes as NOT A DEFECT unless a recapture shows the arrows.**
      `src/views/cell-renderer.ts:1332` already applies the guard `:1271` uses. If they are visible,
      name the specificity or scope miss before editing.
- [x] **T13** P13 · EARLIEST/LATEST printing a dateKey, `src/views/table-footer-renderer.ts:214` — REQ-001.
      *Evidence to close:* a unit test failing on `"2026-03-02"` and passing on the column's format.
- [x] **T14** P14 · the two acting chart rows reading as disabled, `styles.css:4506` — REQ-001, REQ-004.
      *Closed:* the export labels read rgb(154,155,158) at 6.0:1 and now read rgb(220,221,222) at 12.26:1,
      identical to the sibling label. The tone was set by the nested label rule, which outranks the button —
      recolouring the button alone was a no-op. Values move 3.31 → 6.0.
- [x] **T15** P15 · the uncoloured "saas" tag, `styles.css:7306` — REQ-001, REQ-004.
      *Closed on the edge:* the gray pair now applies to the whole
      `.status-badge:not([class*="status-color-"])` family in the container and the modal, with
      `--db-control-border-strong` as its boundary. The tag had **no painted edge at all** in light —
      `border-color` computed `rgba(0, 0, 0, 0)` — and a 20%-alpha currentColor edge in dark at 1.71:1;
      it now computes rgb(130, 135, 142) and rgb(124, 130, 136), **3.62:1 and 4.29:1** against
      `--background-primary`, recomputed from relative luminance and read back out of Chrome. The
      narrower `.db-file-tag-badge` rule was deleted as the family rule subsumes it — the renderer gives
      every file tag both classes at `src/views/file-field-renderer.ts:81,84`, so nothing lost the pair.
      The renderer is still left alone: it opts out of the gray class deliberately. The fill is untouched
      and no fill in the corpus reaches 3:1, which stays the operator's question about the badge design.
- [x] **T16** P16 · "+ Add sort" not reading as a control, `styles.css:11868-11877` — REQ-001, REQ-006.
      *Closed:* the button was `--text-muted` at weight 400 and 6.0:1, indistinguishable from the copy; it is
      `--text-normal` at 600 and 12.26:1 while the copy stays muted. The shared class was allowed to widen and
      three sibling surfaces were recaptured and read: filter conditions, nested filter group, column manager.
- [x] **T17** P17 · one red lane manufacturing two failures, `tools/gate.mjs:127` and `:46` — REQ-001.
      *Closed:* `scan-folder-docs` exited 1 with `tools/lane/gate-logs — missing-readme` and exits 0 with the
      README the gate now writes. Both controls watched: a deliberately reddened `comments` lane produced its
      log directory with folder-docs green, and a genuinely undocumented source folder still exits 1.
      The README satisfies the lane rather than exempting the folder, so folder-docs loses nothing.
- [x] **V1** Recapture and **read** the changed captures — REQ-002.
      *Closed:* `npm run screenshots` exit 0, 240 captures, 63 moved. Read in dark and light: the selection
      bar, the toolbar badge, the invalid-events modal, the select popover, the file tags, the icon picker,
      the chart popover, the relation values, the sort panel, the filter conditions, the nested filter group,
      the column manager, the calendar month view, the calendar and timeline options, the list view and the
      mobile list. `list-sparse-fields` is byte-identical, which is itself the proof its columns did not move.
- [x] **L2** Release the stylesheet lane — REQ-005.
      *Closed twice:* released after the first round, re-acquired by the second-round `codex` lane, and
      released again here after reading the captures — holder back to null, `baselineHash` recut from the
      current `styles.css`, and each release entry naming every capture it read.
- [x] **G1** `npm run gate` prints `gate: PASS` and exits 0.
      *Closed:* `gate: PASS — 25 green, 0 red for a declared reason`, `$?` read directly at 0. Two lanes
      went red on the way and both logs were read: `evidence` on eight stale artefacts, re-run rather than
      edited, and `placement` on the contradiction recorded in T6.
- [x] **C1** Commit the phase.
      *Closed:* the first round's commit carried the stylesheet, the renderers and the gate tooling; the
      second round's carries the two residual selectors, the recaptures, the re-measured evidence
      artefacts and the lane release. No spec path, ADR/REQ/task id or phase number in any code comment,
      and `node tools/naming/scan-comments.mjs` exits 0 over 360 files.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Fifteen of T1-T17 are closed as fixed or as not-a-defect, and V1, L2, G1 and C1 are closed. T15
closed in the second round on a 3:1 edge. **T4 and T6 stay open** and each carries what was measured
instead of what was expected — T4 improved 6 → 4 without reaching the 0 it asks for, and T6 is a
contradiction between two shipped decisions that only the operator can settle. The operator's
confirmation still closes the phase — shipped, verified and operator-confirmed are three states and
only the third counts, and nothing here reaches the third.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · [`goal.md`](goal.md) · [`acceptance-criteria.md`](acceptance-criteria.md) · parent [`../spec.md`](../spec.md)
<!-- /ANCHOR:cross-refs -->
