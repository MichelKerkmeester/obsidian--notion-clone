---
title: "Task Breakdown: Sheet Inline Edit Alignment"
description: "The shipped work is closed with its evidence. One task is open: the second inline editor is 2.4px off its own centre line."
trigger_phrases:
  - "021 inline edit tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Sheet Inline Edit Alignment

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**This phase shipped as `0ff9f9a` and is not finished.** The tasks behind criteria 1-5 are closed with
their evidence. T13 is open: a fresh review found a second inline editor that receives this phase's
declarations and is 2.4px off its own centre line.

**The editor inventory below is the corrected one — five editors, two inline.** The earlier count of
four is withdrawn and is not restated here; it appears only as the cause of T13.

**No task closed on "looks right".** Each names a number that was read or a command whose output and
exit status were read.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

- [x] **T1** Acquire the css lane.
      *Closed on:* taken at `2026-08-30T13:19:14Z`, and again at `13:38:57Z` for the declaration
      reorder. Both released with recapture notes.
- [x] **T2** Decide whether the editor is a flex child or an overlay — the question the whole approach
      turns on.
      *Closed on:* measured through the shipped `CellRenderer`: `position: absolute`, parent is the
      sheet panel, **not** a flex child of the row. The row already declares `align-items: center`, so
      a flex child would already have been centred and there would be no defect to explain. An
      out-of-flow box cannot make its row grow, so containment is bought by sizing the editor.
- [x] **T3** Enumerate the editors the sheet opens.
      *Closed on:* **five, of which two are inline** — the number/currency editor and the title's
      rename editor, both `.db-cell-line-edit-popover`. The other three are deliberately different
      affordances: two docked below the row, one a list popover. **This task was originally closed on
      a count of four with one inline, and that was wrong.** It is the direct cause of T13.
- [x] **T4** Derive the offset.
      *Closed on:* `positionTextEditPopover` puts the popover's **top** on the anchor's **top**. The
      anchor is a 21.6px line centred in a 44px row; the editor is 34.8px. The editor hangs **6.6px**
      low — half the difference between the heights, plus the sheet's 1px border. Arithmetic, not
      chance, which is why the device shows a larger overlap than a harness loading only `styles.css`:
      Obsidian's `app.css` gives every input a box of its own.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

- [x] **T5** Declare `--db-sheet-row-min-height: 44px` on the sheet and point the field row at it —
      NFR-M01.
      *Closed on:* value-preserving — the row measures 44px before and after. The literal **moved**
      rather than multiplied: three declarations have to agree on this number and two of them are a
      negative margin computed from it, so a drifting literal would decentre the editor **silently**
      instead of failing.
- [x] **T6** Give the inline editor the row's height — REQ-003.
      *Closed on:* 34.8px -> 44px. At exactly the row's height the two boxes coincide, making both the
      shared centre line and the containment exact rather than approximate, and holding the same 44px
      floor the sheet's textarea editor already holds.
- [x] **T7** Lift the editor by half the difference between the value's line box and the row —
      REQ-001.
      *Closed on:* both terms are the tokens that produce those two heights, so the correction follows
      them. Criterion 1: **7.6px -> 1.0px**.
- [x] **T8** Make the input carry the popover's height rather than setting its own — REQ-004.
      *Closed on:* a host stylesheet that gives every input a height can no longer push the box back
      out of the row. Criterion 4: **15.2px / 17.7px -> 1.0px / 0.5px**.
- [x] **T9** Add a harness section that drives the shipped path — REQ-006.
      *Closed on:* a 267-line section in `verify-placement.mjs` that opens the sheet and taps each
      editable value through the shipped renderer. **Nothing in it builds an editor by hand.**
- [x] **T10** Show criteria 1-4 red on the tree as received.
      *Closed on:* 7.6px, 2.5px, 34.8px, and 15.2px / 17.7px — the numbers in the criteria table's
      "before" column, each read before the declarations landed.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T11** Freeze the desktop rectangle — REQ-005, criterion 5.
      *Closed on:* `34.8px / 8px / 12px`, pinned. A phase that fixes desktop has to update them.
- [x] **T12** **Rewrite criterion 5's control after it failed to fail.**
      *Closed on:* the first version asserted the desktop editor's `margin-top` was still `0px`.
      Unscoping both new selectors — the mistake it exists to catch — left `margin-top` reading `0px`
      anyway: `--db-sheet-row-min-height` is declared only on the sheet, so off it the declaration is
      invalid at computed-value time and falls back to the initial value. Meanwhile **the input rule
      did leak**, shrinking the desktop editor 34.8px -> 31px. The check now measures the rectangle and
      under the same control reports `31/6.1/8.2` against the frozen `34.8/8/12`, and the run exits 1.
- [ ] **T13** **Centre the title's rename editor on its own line box** — REQ-007, criterion 6. **Open.**
      *Evidence to close:* the title editor is the second inline editor and receives both new
      declarations, but inherits a correction derived from the **value's** 21.6px line box. Its own is
      18.85px, so the correct offset is **−12.6px** rather than the −11.2px it has. Measured on the
      title: **9.0px off-centre before, 2.4px after** — an improvement, and still wrong by 1.4px plus
      the border.
      *Why the harness cannot close this:* it stubs the rename entry point as a no-op, and the trigger
      is a double-click rather than a click. **Either alone would have hidden it.** Closing T13 means
      first giving the harness a path to the title editor, or the criterion is unverifiable here.
      *Two shapes, per `plan.md` ADR-002:* a second literal, or deriving the offset from whichever
      anchor the popover was placed on. Undecided.
- [x] **T14** Run the whole gate from the final state, exit codes read without a pipe.
      *Closed on:* gate **14 green, exit 0**. vitest **444 passed**. Placement **186/190**, 4 red for a
      declared reason, exit 0. Evidence **8 of 8**.
- [x] **T15** Recapture and attribute the churn on two independent grounds.
      *Closed on:* 224 entries, `screenshots:verify` green. Eight images differ and **every one is a
      calendar, timeline or date-picker fixture**. *Reachability:* every rule added here is under
      `.db-record-detail-panel.db-mobile-bottom-sheet`, and none of those fixtures contains a
      `.db-record-detail-panel` at all; no record-sheet capture differs. *Churn:* the floor was
      re-measured rather than assumed — three identical runs with no code change moved six fixtures in
      the same families, the record-sheet fixture among them.
- [x] **T16** Decode the one capture that looked attributable.
      *Closed on:* an earlier run put `panel-record-detail-sheet-desktop-light` in the diff. Decoded
      and compared: **6 pixels of 5,184,000 at a maximum delta of 1/255**, on six non-adjacent rows. A
      row whose height had moved would have shifted hundreds of thousands. It settled back out on the
      next run.
- [x] **T17** Re-verify the harness section **by content** after the concurrency episode — TASK-CONTENT.
      *Closed on:* a second session was editing `src/views/list-renderer.ts` and adding its own checks
      to the same harness file throughout this phase, and later ran `git checkout` and `git stash`
      against it. Edits were overwritten three times and re-applied. **A reconciling check count can
      sit on top of a wrong body**, so the bundle export, the driving path, every derived field, the
      Escape teardown and all seven assertion bodies with their thresholds were read back, and the run
      re-measured the same numbers. Six of the 190 checks are the other session's; the 267-line section
      is this phase's.
- [x] **T18** Establish that the other session's fixture finding does not reach these checks.
      *Closed on:* their finding is that the list fixture omits row controls the renderer always
      builds, so its field area is roughly twice the real one. **This section renders no fixture** — it
      drives `openRecordDetailPanel` with `editCell` wired to the shipped `CellRenderer`. It also
      asserts no width: every threshold here is vertical.
- [x] **T19** Re-run the repository contract's verification clause against the committed result.
      *Closed on:* `REPO RULES.md` was a four-line stub for the duration of the work and was restored
      in `308f0c0`. Its clause was then run in full: `npx tsc --noEmit` exit 0, `npm run build` clean
      with `main.js` byte-identical, `npx vitest run` 444 passed, `npm run screenshots:verify` current.
- [x] **T20** Record what was measured and not fixed — `spec.md` §12.
      *Closed on:* the `setPosition` box conversion (**sheet-only**, desktop measured 0.00 in both
      axes), the desktop panel's identical defect, the date editor reaching y=1001 against a sheet
      bottom of 848.8, the type shrinking two steps at the moment of tap, and the 13px input against
      the 16px iOS zoom floor. Each with its number.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

**Not all met. This packet is `Partial`.**

Met:

- The value editor sits on its label's centre line (1.0px) and inside its row (0.5px overhang).
- It meets the 44px thumb floor, and holds under a host stylesheet that inflates every input.
- Desktop geometry is frozen, behind a control that was **rewritten after it failed to fail** and
  that now exits 1 on the leak it exists to catch.
- Every check drives the shipped open-and-edit path; nothing builds an editor by hand.
- The capture churn is attributed on two independent grounds, against a re-measured floor.
- The harness section was re-verified by content after a concurrency episode, not by check count.

Open:

- **The title's rename editor is 2.4px off its own centre line** (T13, REQ-007, criterion 6). It
  receives this phase's declarations and inherits a correction derived from the wrong anchor. The
  harness cannot see it, so closing it requires either a harness path to the title editor or an
  independent probe.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`implementation-summary.md`](implementation-summary.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../025-story-coverage-blindness/spec.md`](../025-story-coverage-blindness/spec.md)

<!-- /ANCHOR:cross-refs -->
