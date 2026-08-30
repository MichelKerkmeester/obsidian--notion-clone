---
title: "Goal: Sheet Reading Rhythm and Keyboard Avoidance"
description: "What would make phase 010 worth having done, and the criteria that decide it."
trigger_phrases:
  - "010 goal"
  - "sheet reading goal"
  - "keyboard avoidance goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/010-sheet-reading-and-keyboard"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "9 criteria audited vs captured f64dd87 run; 6 ticked with numbers, 2 have no check"
    next_safe_action: "Build the desktop four-value non-regression check and the five-dimension mapping"
    blockers:
      - "spec.md continuity says 0% and not started; implementation-summary.md says 90% and shipped"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-010-goal"
      parent_session_id: null
    completion_pct: 67
    open_questions:
      - "Does the operator's handset shrink visualViewport or resize the window"
      - "Desktop non-regression is claimed with four values that no check measures"
    answered_questions: []
---
# Goal: Sheet Reading Rhythm and Keyboard Avoidance

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A record opened on a phone reads as label-and-value pairs, and the field being edited
stays visible when the keyboard opens.

It did neither. Values were pinned to the right edge, so the eye paired each value with the value
above it rather than with its own label. And the sheet is `position: fixed; bottom: 0`, docked to the
**layout** viewport, which a software keyboard does not change.

**Both halves were measured before either was designed**, which is the part worth keeping. The two
screenshots were luminance-thresholded per row band and decomposed into ink runs, turning an
aesthetic complaint into a shape: the Notion reference's value column **starts** at a fixed 154.7px
and ends ragged; the plugin's **ended** at a fixed 382.7px and started ragged across 51.0px.
Fixed-end against fixed-start is the signature of `text-align: right` against a fixed column, and it
named the defect precisely enough to fix. The keyboard mechanism was read out of Obsidian's shipped
bundle rather than inferred: the host declares `--keyboard-height` on `:root` and shrinks
`.app-container` with it, and the sheet is portalled to `document.body`, a **sibling** of that
container. The lever already existed and was always being written zero.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The host variable is primary and the visual viewport is a fallback, combined with `max()`. Anything else puts the sheet on a different number from the toolbar riding beside it. |
| D2 | The label gets a fixed 96px basis, not a minimum width. A minimum is a floor: a longer label still shoves the value column, which is the defect. |
| D3 | `min-height: 44px` is the one deliberate off-scale value, cited as WCAG 2.5.5 target size. |
| D4 | Where the project's scale and the design skill's default disagree, the project's wins — which is why the label stayed at 13px. |
| D5 | A criterion can fail a correct implementation. Two here were defective before they were met; check both directions. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

A ticked criterion carries the harness check that closed it and that check's measured number, quoted
from the single run captured against a clean tree at `f64dd87` — `verify-placement: 220/224 geometry
checks passed, 4 red for a declared reason`. An unticked criterion carries the check that would
settle it and **no number**, because none ran.

- [x] Value text starts on one column: left-edge spread ≤ 2px. Was 42.3px across 36 rows.
      → *every value starts in one fixed column*: `value text left-edge spread across 36 rows = 0.0px
      (want <=2; right-aligned values measured 42.3 here and 51.0 on the device)`.
- [x] The value column begins at ≤ 40% of sheet width. Was 84%; the reference measures 38.5%.
      → *the value column starts early, so a label and its value read as one line*: `value column at
      33.1% of sheet width (reference measured 38.5%; the device measured 81-94%)`.
- [x] Row pitch ≥ 38px and row height ≥ 44px. Was 28.8px and 26.8px.
      → *row pitch reaches the reference rhythm*: `min pitch=44.0px (reference measured 38.0, device
      28.0)`. → *a sheet row is a thumb-sized target*: `min row height=44.0px (WCAG 2.5.5 target size
      is 44)`.
- [x] A hairline divider, no gap between targets, value text ≥ 16px. Was no divider at all, a 2px
      gap, 13px.
      → *a divider separates each sheet row*: `border-bottom: 1px solid color(srgb 0.2 0.2 0.2 /
      0.4)`. → *no dead space between adjacent sheet rows*: `max gap between consecutive rows=0.0px`.
      → *value text clears the size at which iOS zooms an input on focus*: `value font-size=16px,
      --db-font-lg=16px`.
- [x] A 36-character label moves the value **box** ≤ 1px. Moved 115px.
      → *a long label truncates instead of moving the value column*: `value box left 129 -> 129px (a
      min-width label moved it 115px)` — zero movement, against a 1px allowance.
- [x] On a reported keyboard the sheet's bottom sits within 2px of `innerHeight − keyboardHeight` and
      its top stays on screen. Was 844 where 513 was wanted, top 84 with height 760 against 513
      available.
      → *the sheet clears the keyboard the host reports*: `sheet bottom=513 want=513 (keyboard covers
      513..844)`. → *a lifted sheet fits in the space the keyboard leaves*: `top=84 height=429
      available=513`. → *a declared keyboard height lifts the sheet clear of it*:
      `--keyboard-height:336px moved the sheet's bottom edge 844 -> 508 on an 844px screen (clearance
      336px)`.
      **Scoped to the reporting path, and only that.** The resize path is red in the same run — *the
      sheet survives the window resize a keyboard causes* stands `RED (declared)`: `one window resize
      closed the record sheet outright — openRecordDetailPanel registers onResize = close()`. On a
      host that announces its keyboard by resizing the window, this criterion's mechanism never gets
      to run. Which of the two the operator's handset does is the open question in the frontmatter.
- [ ] Desktop keeps its four measured values — row 26.84px, right-aligned, 2px gap, no divider —
      identical before and after.
      **No check exists.** Three of the four values are unmeasured anywhere in the captured run. The
      fourth appears only incidentally, as `row [83..109.8] h=26.8` inside the detail line of *the
      desktop record panel's editor geometry is frozen by this phase* — a check owned by another
      phase and thresholded on editor height, centre offset and overhang, not on these four. The
      stylesheet does corroborate the scoping claim in `acceptance-criteria.md` §4.3: every phone
      rule for this surface is written under `.db-record-detail-panel.db-mobile-bottom-sheet …`
      (`styles.css:9464`, `:9468`, `:9477`, `:9485`, `:9489`, `:9502`). That proves the phone rules
      cannot match a desktop panel. It does not prove the four desktop values are what AC-16 says
      they are, because row height and inter-row gap are computed, not declared.
      **The check to build.** In `verify-placement.mjs`, mount `.db-record-detail-panel` **without**
      the `db-mobile-bottom-sheet` class at 1440×900, building the rows through the same shipped
      `renderCardField` the phone case uses, and assert four computed values on
      `.db-record-detail-field` in one check reported as one line: `height` = 26.84px ±0.5;
      `text-align` on the descendant `.db-board-card-value` = `right`; the vertical gap between
      consecutive field boxes = 2px ±0.5; and `border-bottom` = `0px none`. One line, four values, so
      a phone rule that ever leaks to desktop moves all four at once and the check goes red for the
      reason it exists. Pair it with a negative control that adds `db-mobile-bottom-sheet` to the
      same panel and requires all four to move — the phone's own 44px, `left`, 0px and 1px.
- [ ] The five stateful dimensions are covered: semantic identity, transition trace, action outcome,
      resource ownership, negative-control mutation.
      **No check exists, and no mapping exists either.** Only negative-control mutation is evidenced,
      by *control: the column check reacts when a label really does shove the value* (`widening the
      label moved the value box 129 -> 253px`) and *control: the divider check reacts when the
      divider is taken away* (`with the border removed the check reads 0px none`). This phase's
      `acceptance-criteria.md` never names the five dimensions, so not one of its sixteen criteria is
      assigned to one — unlike `002`, `005` and `008`, whose acceptance documents carry the mapping.
      Nothing in the captured run labels a check by dimension, so "covered" cannot be read off it.
      **The check to build.** First the mapping, in `acceptance-criteria.md`: a criterion → dimension
      table covering all five, so the claim is auditable instead of asserted. Then the two dimensions
      with no measurement on this surface. *Semantic identity*: open the sheet on a known record, call
      `refreshRecordDetailPanel`, and assert the row labelled `Income` still resolves to the record id
      and column key it opened with — node identity, not a node that happens to sit at the same
      coordinates. *Resource ownership*: open the sheet, drive one `--keyboard-height` open/close
      cycle, close the sheet, then assert 0 surviving `visualViewport` `resize` and `scroll`
      listeners and that `--db-mobile-sheet-bottom` is back to `0px` with no writer still subscribed.
      The inset is written by a subscription, so a leaked one silently moves the *next* sheet.
- [ ] The operator opens a record on the phone, reads every row as one line, taps a field, and still
      sees it.
      **Operator criterion. Stays open regardless of the numbers, per D3.** No harness check can close
      it, and the keyboard half least of all: no harness in this repository opens a software keyboard,
      so whether iOS shrinks `visualViewport` or resizes the window is decided on the device and
      nowhere else.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**6 of 9 criteria closed against the captured `f64dd87` run. Not operator-confirmed, the keyboard half
is mechanism-verified only, and two criteria that read as verified turn out to have no check behind
them at all.**

### Two criteria were defective before they were met, and this is where the program learned both shapes

One measured the value's *text* rect — an edge that right-alignment pins by construction — so it
passed against the defect and could never have gone red. The other set a threshold that **forbade the
layout being copied**: it capped the gutter between a label's last glyph and its value's first at
24px, and the reference's own gutters run 11px to 71px. The implementation was right and the
criterion was wrong. Both are rewritten and both carry controls.

### What is not claimed

No software keyboard was ever opened. The keyboard criteria drive the host's *reporting mechanism* at
331px, a value read off the operator's screenshot; they prove the sheet responds correctly to the
signal, never that iOS emits it. And `record-detail-panel.ts` still registers
`onResize = () => close()`: on a host that announces the keyboard by resizing the window, the sheet
is destroyed before any inset can apply. **Which of the two the operator's phone does decides whether
this half is finished or blocked.**

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Reading rhythm | Shipped, verified | 5 goal criteria closed against the `f64dd87` run |
| Keyboard inset | Shipped, mechanism-verified | Closed for the reporting path; the resize path is a declared red |
| Desktop non-regression | **Claimed, unmeasured** | No check measures the four values; row height alone appears, incidentally, in another phase's check |
| Five stateful dimensions | **Claimed, unmapped** | Only negative-control mutation is evidenced; `acceptance-criteria.md` never names the five |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| Continuity conflict | `spec.md` says 0% and "not started"; `implementation-summary.md` says 90% and shipped, and the working tree agrees with the summary. Recorded in `roadmap.md` §7.6; do not resolve it by picking the nearer file |
| Label at 13px | Deliberate under D4, later raised by `016` as a one-token operator decision. Not a defect |
| Two criteria were carrying no measurement | The desktop non-regression and the five-dimension claim were both written as though verified. Neither has a check. Found by auditing the goal against the captured run rather than against the phase's own prose — which is the only way this shape is ever found |
| The label's 13px is a declared red, not a silence | *the row's label size is on the type scale* stands `RED (declared)`: `label 13px; nearest scale steps are 12px and 14px`. Consistent with D4; it sits under the shared row grammar, so moving it moves every menu and sheet at once |
<!-- /ANCHOR:log -->
