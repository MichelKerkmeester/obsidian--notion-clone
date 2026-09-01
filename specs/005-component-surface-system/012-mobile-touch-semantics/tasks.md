---
title: "Task Breakdown: Mobile Touch Semantics in the Table"
description: "The work as it was actually done, with every check watched failing first, one criterion left UNVERIFIED, one gate recorded FAIL, and the row-height shortfall carried as a declined criterion."
trigger_phrases:
  - "012 touch semantics tasks"
  - "tap to edit evidence"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Mobile Touch Semantics in the Table

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Written after the work was done.** Each task closes on a number that was read.

**A declined criterion is closed; an unmet one is not.** The row-height task below is closed because
the operator was shown the shortfall and chose the other side of the trade. That is a different state
from a criterion that simply was not met, and the two are not merged here.

**A criterion that could not be measured says so.** UNVERIFIED is a result, not a gap in the record.

<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP — inventory before designing

- [x] **T1** Establish what actually paints the range.
      *Closed on:* **two taps, not a drag.** Drag was already disabled on touch. The block in the
      report is 7 rows by 2 columns — 14 cells — measured off the PNG at 1206×2622 device pixels,
      DPR 3, with the border box spanning 238 CSS pixels, exactly seven 34px rows.
- [x] **T2** Count the pointer owners.
      *Closed on:* **two, not three.** `table-renderer` binds no cell selection. Each of the two
      carried its own copy of the range branch, and the branch is what drifted.
- [x] **T3** Establish what a tap already does, and whether the record sheet is reachable.
      *Closed on:* a tap already opens an editor for four column types. The record sheet already
      existed and was already reachable — **through a 24px target**, the icon rather than the cell.
- [x] **T4** Measure the row against the thumb floor at every density.
      *Closed on:* compact **28px (64%)**, default **34px (77%)**, comfortable **40px (91%)** against
      the 44px floor. There is no phone override, so **even the loosest density leaves a row 4px
      short** and the default is 10px short.
- [x] **T5** Record the same defect on the row checkbox, and leave it alone deliberately.
      *Closed on:* both views read `range: Boolean(event?.shiftKey || isTouchDevice(...))` on the row
      checkbox too. Out of scope here — the operator reported cells, the screenshot shows every row
      checkbox unticked, and removing it would leave a phone with no way to range-select rows at all.
      Recorded so the successor phase would not have to rediscover it.

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

- [x] **T6** Route the decision off per-event `pointerType` rather than off a device predicate.
      *Closed on:* `pointerdown` carries `pointerType` and the browser dispatches it on the same
      target before the compatibility mouse events it synthesises. **No device predicate can answer
      this** — the plugin's two existing predicates disagree correctly, one being about layout and the
      other about presentation, and neither about input.
- [x] **T7** Put the decision in one module both hosts call.
      *Closed on:* `src/views/table-cell-gesture.ts`. Two files had independently decided that touch
      means shift is held; a shared module makes the next divergence impossible rather than unlikely.
- [x] **T8** Give a tap on the title cell the record sheet, and every other cell its editor.
      *Closed on:* `setupTitleCellTap` moved to the shared `table-record-peek` and bound by both table
      hosts. `isTitleCell` keys off **visible column order**, so it stays correct when the note-name
      column is hidden.
- [x] **T9** Stop the sheet's grab band stealing its own header.
      *Closed on:* the record sheet pads its top by `--db-space-6`, four times the menu sheets, so its
      bar sits 24px down and a band centred on it ran 2–50px while the header starts at 32.
      **Measured consequence: the band answered every press aimed at the title, and both 44px header
      actions delivered 26px.** Because rename opens on a double-click, the second tap never reached
      it — which is why renaming looked as though tap-to-open had removed it. The band now runs from
      the sheet's top edge to the bottom of the handle's margin box, measured **35px at the time of
      this edit** with 0 stolen, the title reachable and both actions 44 of 44. Menu sheets keep the
      shared rule and measured 41px, 0 stolen, before and after. The band is an invisible
      pseudo-element, so screenshots of both sheet surfaces are byte-identical with the override on
      and off.
- [x] **T10** Defer the selection paint and strip tracker ids from comments.
      *Closed on:* 45 tracker references replaced with the reason behind the code. Comment hygiene
      holds: no spec paths, phase numbers or task ids remain in the source.

<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T11** A tap never extends a range — AC-1.
      *Closed on:* threshold `cells === 1` with the anchor equal to the focus. Harness span of 8 rows
      by 2 columns produced **16 cells; now 1**.
- [x] **T12** A mouse still extends a range at phone width — AC-2.
      *Closed on:* **24 cells** across 8 rows by 3 columns, anchor still held at `file.name`. This is
      the check that proves the repair did not simply disable ranges.
- [x] **T13** The gesture reader routes real events — AC-3.
      *Closed on:* four values from one binding — `at rest = mouse`, `after touch = touch`,
      `after mouse = mouse`, `after pen = touch`.
- [x] **T14** The tap truth table holds — AC-4.
      *Closed on:* **5 of 5 rows.**
- [x] **T15** The whole title cell opens the record, not the icon inside it — AC-5.
      *Closed on:* a press **40px left of the button** resolves to `open-record`; a click resolves to
      `select-cell`. Cell **169×34** against a button of **24×24**. That 169×34 is a third independent
      confirmation of the 34px default density, after the stylesheet and the screenshot's pixel pitch.
- [x] **T16** A tap does not fight the sheet's dismissal — AC-6.
      *Closed on:* the cell centre resolves to `db-mobile-sheet-scrim` with `pointer-events: auto`.
      Negative control `{ scrimCapturesPointer: false }` observed red as
      `pointer-events=none … resolves to <td>`.
- [x] **T17** The long-press row menu survives — AC-7.
      *Closed on:* a 100ms press fires **0** long-presses, a 600ms press fires **1**, with
      `isTouchDevice(row) = true` throughout.
- [x] **T18** Watch every check fail before trusting it.
      *Closed on:* **7 of 7 controls installed and reds observed** — reader hardcoded to `"touch"`;
      the old always-extend branch restored (16 cells, rows 2–9 by 2 columns); the range function
      forced to collapse; the resolver forced to one answer (2 of 5 rows wrong); the long-press delay
      raised to 5000ms (600ms press fired 0); the scrim's capture switched off.
- [x] **T19** Correct this phase's own overclaim.
      *Closed on:* the AC-1 control was described as reproducing the screenshot "exactly". It does
      not — the control gives **8 rows by 2 columns, 16 cells**, and the screenshot measures **7 by 2,
      14 cells**. The difference is where the fingers landed, not what the code did. The defect was
      never "the block is N rows tall", so the repair is unaffected; the word "exactly" was the only
      thing wrong, and it was removed rather than defended.
- [x] **T20** Measure the capture churn floor rather than assume it.
      *Closed on:* this phase's edits moved **7** PNGs; a run with **no source change at all** moved
      **4**. The movers were the same calendar, timeline and record-sheet family both times, and **no
      table or field capture moved in either run** — including all 20 the verifier had flagged against
      `cell-renderer.ts`. The fingerprints were refreshed and no pixel is attributable to this change.
- [x] **T21** Escalate the row height rather than gate on a number CSS cannot reach.
      **Closed as DECLINED, with the shortfall stated.** The operator was shown the measurement and
      **chose density**: the row stays at 34px and no phone-only override is added, because raising it
      would override a preference the reader deliberately set. WCAG **2.5.8's 24px AA floor is met**;
      **2.5.5's 44px AAA target is not**. The harness reports the 33px reach on every run so the number
      stays visible rather than being closed by silence.
- [x] **T22** Try the thumb-target expansion, and report the result rather than the intention.
      *Closed on:* **tried and reverted, byte-identically.** A downward negative-inset pseudo-element
      is a measured no-op for two independent reasons — the cell clips its overflow so the
      pseudo-element is cut back to the cell box and the last row gained **0px**, and in a contiguous
      table the next row's area begins exactly where this one's box ends, so there are no dead pixels
      to reclaim. Reverted because **a rule that measures as a no-op advertises a fix that is not
      there.**
- [ ] **T23** AC-6b — a tap that opens an editor does not scroll the table.
      **UNVERIFIED.** Not measurable without a live Obsidian `App`. Recorded with its reason rather
      than dropped or optimistically passed.
- [ ] **T24** AC-8 — the phase gate.
      **FAIL.** Threshold is exit 0; observed **exit 1, 12 of 13 green**. `screenshots-fresh` reports
      204 captures stale, **all 204 attributed to `styles.css` and zero to any `src/` file**. This
      phase made no CSS edit and never held the lane, so the red belongs to another phase's
      unrecaptured stylesheet edit. **Attribution explains a red; it does not clear one**, and
      claiming it would absorb another phase's debt.

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- A tap selects one cell; a mouse still extends at phone width.
- The gesture is read from the event, in one module both hosts call.
- The title cell opens the record across its whole 169×34 area rather than a 24×24 icon.
- Seven of seven checks were observed red before being trusted.
- The capture churn floor is measured, and no pixel is attributable to this phase.

**Not met, and each named with its own state:** AC-6b is **UNVERIFIED** for want of a live `App`;
AC-8 is **FAIL** on another phase's unrecaptured stylesheet edit; the 44px row height is **DECLINED**
by the operator with the shortfall stated. The phase stands at 90% for these reasons.

**A note on one number.** This phase measured the repaired grab band at **35px**. A later audit
measured the shipped build at **32px** and derived it from the stylesheet's own arithmetic. Four
heights are now on record across the program; the parent roadmap carries the conflict and states that
the operator's decision does not depend on which is right, since all of them clear WCAG 2.5.8's 24px
and fall short of 2.5.5's 44px.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../017-touch-row-range-selection/spec.md`](../017-touch-row-range-selection/spec.md)
- [`../016-sheet-drag-and-audit/spec.md`](../016-sheet-drag-and-audit/spec.md)

<!-- /ANCHOR:cross-refs -->
