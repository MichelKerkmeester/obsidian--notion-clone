---
title: "Task Breakdown: Sheet Reading Rhythm and Keyboard Avoidance"
description: "The work as it was actually done across both halves of the phase, each task closed on a measured number, with the two corrected criteria and the device gap recorded rather than smoothed."
trigger_phrases:
  - "010 sheet reading tasks"
  - "keyboard inset evidence"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Sheet Reading Rhythm and Keyboard Avoidance

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Written after the work was done.** Each task closes on a number that was read or a command whose
output was read.

**A criterion that was corrected says so.** Two of this phase's criteria were wrong rather than
merely unmet, and the tasks that fixed them are tasks in their own right.

**A result obtained from a driven mechanism is not a device result.** The keyboard tasks name the
signal they drove and the value they drove it at.

<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP — measure before designing

- [x] **T1** Decompose both screenshots into ink runs rather than judging them by eye.
      *Closed on:* both images 1206×2622 at DPR 3, so 402×874 CSS px, luminance-thresholded per row
      band. Notion's value column starts at a fixed **154.7px, spread 0.7px across 13 rows**; the
      plugin's values ended at a fixed **382.7px, spread 0.3px**, starting ragged across **51.0px**.
      Fixed-start against fixed-end is the signature of `text-align: right` on a fixed column.
- [x] **T2** Establish how the host actually reports a keyboard, from its shipped bundle.
      *Closed on:* `app.js` and `app.css` extracted from `obsidian.asar`. Obsidian declares
      `--keyboard-height: 0px` on `:root`, writes it from `keyboardWillShow`/`keyboardWillHide`, and
      positions `.mobile-toolbar` and `.app-container` from it. **The WebView is not resized** —
      `body.is-mobile` stays `height: 100vh`.
- [x] **T3** Establish why the sheet does not inherit that shrink.
      *Closed on:* the sheet is portalled to `document.body`, a **sibling** of `.app-container`. That
      is the whole defect. Also established: `visualViewport` `resize` and `scroll` were already
      subscribed, so the listener was never the missing piece — `place()` recomputed `bottom: 0px`
      every time it ran.

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Reading rhythm

- [x] **T4** Un-pin the value from the right edge — criteria 1 and 2.
      *Closed on:* `text-align: left` overriding the inherited
      `.note-database-container .db-board-card-value { text-align: right }`, which reaches the sheet
      because the portal adds `note-database-container` to the sheet itself. Overridden **only**
      inside the phone sheet; board cards keep it.
- [x] **T5** Give the label a fixed column that truncates — criterion 9.
      *Closed on:* `flex: 0 0 96px` with ellipsis, replacing `min-width: 72px`. A `min-width` is a
      floor, so a label wider than it still shoves the value. Notion's measured label column is
      103.4px; 96px is the nearest scale step that still fits this record's longest label
      ("Subscriptions", 82px at 13px). 128px was rejected — it leaves 60px of dead space beside a
      short label, which is the defect being fixed in miniature.
- [x] **T6** Close the dead space and add the divider the operator asked for — criteria 5 and 6.
      *Closed on:* field-list `gap` 2px to `0`, plus `1px solid var(--db-border-subtle)`, the
      project's existing hairline at 40% alpha. `--db-border-regular` at 70% was rejected: it reads as
      a table rule and returns the compartmentalised look.
- [x] **T7** Raise row padding and set a thumb floor — criteria 3 and 4.
      *Closed on:* padding `4px 6px` to `8px 12px`, which puts natural row height at **37.6px, within
      0.4px of Notion's measured 38.0**. `--db-space-3` lands at 33.6 and misses; `--db-space-6`
      reaches 53.6 and only five rows survive on screen. `min-height: 44px` added as the one
      deliberate off-scale value, cited as WCAG 2.5.5 rather than as a design step.
- [x] **T8** Fix the units, not just the size — criterion 8.
      *Closed on:* label moved from `var(--font-smaller)` to `var(--db-font-md)`. Same rendered 13px,
      but `--font-smaller` is `0.875em` and `em` compounds through nesting and drifts with the
      reader's text-size setting, so the scale silently stops existing.
- [x] **T9** Raise the value to the iOS input floor — criterion 7.
      *Closed on:* `var(--db-font-lg)`, 16px. The project scale's neighbouring steps are 13 and 22;
      13 leaves the zoom defect and 22 is a title size. 16 satisfies "a bit bigger" and removes a
      functional defect in one value.
- [x] **T10** Re-centre the row now that the box is taller than its line.
      *Closed on:* `align-items` `baseline` to `center`. Baseline alignment is right when a box hugs
      its text; once `min-height: 44px` makes it taller, baseline strands both texts at the top edge.
      Cost accepted and named: the 13px and 16px baselines now differ by about 1px.
- [x] **T11** Give touch its feedback.
      *Closed on:* an `:active` background. Touch has no hover, so without it a tap has no feedback at
      all. The existing `:hover` rule stays correctly guarded by `@media (hover: hover)`.

### Keyboard avoidance

- [x] **T12** Write the measured inset into the lever that already existed — criterion 11.
      *Closed on:* `--db-mobile-sheet-bottom`, previously hardcoded `"0px"` in `place()`. The
      `!important` rule `bottom: var(--db-mobile-sheet-bottom, 0px)` already beat the inline `bottom`.
- [x] **T13** Stop a lifted sheet being pushed off the top — criterion 12.
      *Closed on:* `max-height` from `90svh !important` to
      `calc(90svh - var(--db-mobile-sheet-bottom, 0px)) !important`. With the variable at `0px` this
      reduces to exactly `90svh`, so the predecessor's cap is unchanged by construction.
- [x] **T14** Combine host variable and visual viewport so whichever sees the keyboard first wins.
      *Closed on:* `max()` of the two, with the host variable primary — anything else would put the
      sheet on a different number from the toolbar riding beside it.
- [x] **T15** Guard against pinch-zoom being read as a keyboard — criterion 14.
      *Closed on:* the visual-viewport term is ignored when `scale > 1.01`, because
      `innerHeight − visualViewport.height − offsetTop` is also non-zero under pinch-zoom. The host
      variable is unaffected and still applies.

### Correcting the checks themselves

- [x] **T16** Replace criterion 9's unfalsifiable assertion.
      *Closed on:* it measured the value's **text** rect, which `text-align: right` pins by
      construction, so it passed against the defect and could never have gone red. Now measures the
      **box** rect; its control widens a label by 200px and confirms the assertion moves.
- [x] **T17** Replace criterion 2's wrong threshold.
      *Closed on:* the original read "gutter ≤ 24px" and the implementation failed it at 33–80px.
      **The implementation was right.** A fixed value column necessarily leaves a variable gap beside
      a short label; the reference's own gutters run 11px to 71px, so the rule forbade the layout
      being copied. Replaced by a measurement of the column's position, with the per-row range still
      reported beside it.

<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T18** Drive the function production calls, not the convenient one.
      *Closed on:* the checks bundle and call `positionToolbarPopover`, not `applySheetChrome`. A
      check that calls the chrome helper alone exercises none of the placement arithmetic, and that
      mistake shipped a broken sheet twice.
- [x] **T19** Build rows from the shipped renderer.
      *Closed on:* `renderCardField` from `src/views/card-field-renderer.ts`, so class names, element
      types and nesting are production's rather than a hand-copy that can drift.
- [x] **T20** Confirm the predecessor did not regress — criteria 10 and 13.
      *Closed on:* with no keyboard the sheet's bottom is **844 against an innerHeight of 844**, and
      it returns to 844 when the reported keyboard closes.
- [x] **T21** Confirm desktop did not move — criterion 16.
      *Closed on:* row 26.84px, value right-aligned, gap 2px, no divider — measured identical before
      and after. Every rule added is scoped to a class only the phone sheet carries.
- [ ] **T22** Confirm on the operator's device.
      *Not done, and not claimable here.* Criteria 11–15 drive `--keyboard-height` and
      `visualViewport` at 331px, a value measured off the operator's screenshot. They prove the sheet
      responds correctly **to the signal**. They do not prove iOS emits that signal at that moment
      with that number.

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- Criteria 1 through 9 each carry a red baseline and a measured result.
- Criteria 2 and 9 were corrected as criteria, and the correction is recorded rather than quietly
  applied.
- Criteria 10 through 16 hold, with the keyboard half labelled as mechanism-verified.
- Desktop measured identical before and after.

**Open, and named:** the operator's device has not confirmed any of this, and
`record-detail-panel.ts` still closes the panel on a `window` resize — which decides whether the
keyboard half is finished or blocked on the handset. That question is carried by
`016-sheet-drag-and-audit`, which re-measured these asks on the shipped build.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md)
- [`../016-sheet-drag-and-audit/spec.md`](../016-sheet-drag-and-audit/spec.md)

<!-- /ANCHOR:cross-refs -->
