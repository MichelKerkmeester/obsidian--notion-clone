---
title: "Tasks: Visual Pass Product Defects"
description: "One task per defect, plus the lane, the recapture, the release, the gate and the commit."
trigger_phrases: ["035 tasks", "035 plan"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/035-visual-pass-product-defects"
    last_updated_at: "2026-09-02T18:30:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "14 defect tasks closed on measurement; T4 T6 T15 stay open"
    next_safe_action: "Take the operator call on P6 scroll-versus-wrap and P15 threshold"
    blockers: ["P6 contradicts the placement lane; P15 threshold met by no tag"]
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-035-tasks"
      parent_session_id: null
    completion_pct: 78
    open_questions: ["Should the phone selection bar wrap or keep its scroll lane"]
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
- [ ] **T4** P4 · the phone calendar "+" stealing the title's width, `styles.css:18474` — REQ-001.
      *Open, with the mechanism corrected:* the pattern chosen is a corner control — `position: relative`
      in a 46px flex heading became `position: absolute` top-right — and the affordance stays 28x28 and
      reachable. But the titles do not move: 6 of 12 month segments truncate before the change and 6 after.
      They are week-grid segments, not day-cell children, and they truncate from a 48px column at 402px.
      The "+" never took their width, so this stays open rather than ticking on a change that missed.
- [x] **T5** P5 · the "N hidden" badge overhanging the Group button, `styles.css:2293-2308` — REQ-001, REQ-004.
      *Closed:* the badge was 55px absolute at `right: -5px`, overhanging its 28px button by 5px right and
      22px left at 4.09:1. It is static, 61px, inside a 96px button, at 8.36:1.
- [ ] **T6** P6 · "Copy CSV" clipping at 402px — REQ-001.
      *Open, mechanism named:* the box is capped at `calc(100vw - 32px)` = 370px while the content runs
      416px. Nothing truncates — "Copy CSV" measures clientWidth 71 against scrollWidth 71 — it sits 55px
      outside the scroll port, and a capture cannot scroll. A wrapping bar was built and measured green,
      then reverted: `tools/storybook/verify-placement.mjs:903` pins `scrollWidth > clientWidth`,
      `overflow-x: auto` and `scrollbar-width: thin`, and went red. Operator call, not 035's.
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
- [ ] **T15** P15 · the uncoloured "saas" tag, `src/views/file-field-renderer.ts:81` — REQ-001, REQ-004.
      *Open, half met:* the gray tokens are applied and the tag now measures exactly like its registered
      siblings — fill 1.00 → 1.55 and edge 1.71 → 2.64 in dark, against design 1.37/2.27 and personal
      1.57/2.65; light moves 1.00 → 1.23 beside siblings at 1.22. The 3:1 threshold is met by NO tag in the
      corpus, so it indicts the shared badge design rather than this one. The renderer was left alone: it
      opts out of the gray class deliberately, so the fallback lands in the stylesheet instead.
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
      *Closed:* released by this runtime after reading the captures, holder back to null, `baselineHash`
      recut from the current `styles.css`, and the release entry naming every capture read.
- [x] **G1** `npm run gate` prints `gate: PASS` and exits 0.
      *Closed:* `gate: PASS — 25 green, 0 red for a declared reason`, `$?` read directly at 0. Two lanes
      went red on the way and both logs were read: `evidence` on eight stale artefacts, re-run rather than
      edited, and `placement` on the contradiction recorded in T6.
- [ ] **C1** Commit the phase.
      *Evidence to close:* one commit carrying the stylesheet, the renderers and the gate tooling
      together, with no spec path, ADR/REQ/task id or phase number in any code comment.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Fourteen of T1-T17 are closed as fixed or as not-a-defect, and V1, L2 and G1 are closed. T4, T6 and
T15 stay open and each carries what was measured instead of what was expected. The operator's
confirmation still closes the phase — shipped, verified and operator-confirmed are three states and
only the third counts, and nothing here reaches the third.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · [`goal.md`](goal.md) · [`acceptance-criteria.md`](acceptance-criteria.md) · parent [`../spec.md`](../spec.md)
<!-- /ANCHOR:cross-refs -->
