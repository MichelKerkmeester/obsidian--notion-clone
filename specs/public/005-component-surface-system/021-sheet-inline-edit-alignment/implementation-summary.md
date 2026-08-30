---
title: "Implementation Summary: Sheet Inline Edit Alignment"
description: "Three declarations and one token swap centred the sheet's number editor on its row. A fresh review then corrected three claims: there are five editors, two are inline, and the second is still 2.4px off."
trigger_phrases:
  - "021 inline edit summary"
  - "five editors correction"
  - "title rename editor open"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/021-sheet-inline-edit-alignment"
    last_updated_at: "2026-08-30T16:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Shipped as 0ff9f9a; a fresh review corrected three claims and opened criterion 6"
    next_safe_action: "Give the harness a path to the title editor, then derive its own offset"
    blockers:
      - "The harness stubs the rename entry point and triggers on click, so it cannot see the title editor"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-021"
      parent_session_id: null
    completion_pct: 85
    open_questions:
      - "A second literal for the title, or a per-anchor offset?"
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
| **Spec Folder** | 021-sheet-inline-edit-alignment |
| **Shipped** | 2026-08-30 (`0ff9f9a`) |
| **Level** | 3 |
| **Status** | Partial |
| **State** | Shipped and harness-verified for the value editor. **One criterion open**: the title's rename editor is 2.4px off its own centre line |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

`styles.css`, three declarations plus one token swap, all under
`.db-record-detail-panel.db-mobile-bottom-sheet`:

| Change | Effect |
|---|---|
| `--db-sheet-row-min-height: 44px` declared on the sheet; the field row reads it | The literal **moved** rather than multiplied. Three declarations must agree on this number and two derive a negative margin from it, so a drifting literal would decentre the editor silently instead of failing |
| The inline editor takes the row's height | 34.8px -> 44px. At exactly the row's height the two boxes coincide, so centring and containment are exact rather than approximate, and it holds the 44px floor the sheet's textarea editor already holds |
| The editor is lifted by half the difference between the value's line box and the row | Criterion 1: 7.6px -> 1.0px. Both terms are the tokens that produce those heights, so the correction follows them |
| The input carries the popover's height rather than setting its own | A host stylesheet that gives every input a height can no longer push the box out of the row |

Plus a 267-line section in `tools/storybook/verify-placement.mjs` that opens the sheet and taps each
editable value through the shipped renderer. **Nothing in it builds an editor by hand.**

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The approach turned on one question: is the editor an ordinary flex child of the row, or an overlay?
The two want opposite fixes, and the row already declares `align-items: center` — so a flex child
would already be centred and there would be no defect to explain.

It is an overlay: `position: absolute`, parent is the sheet panel. **An out-of-flow box cannot make
its row grow**, so "the row contains the editor" had to be bought by sizing the editor to the row.

The offset turned out to be arithmetic rather than incidental — half the difference between the two
heights, plus the sheet's 1px border. That mattered twice. It explains why the device shows a far
larger overlap than a harness loading only `styles.css` (Obsidian's `app.css` gives every input a box
of its own), and it predicts the residue that is still open.

**This phase was not committed by its author.** Another party committed it as `0ff9f9a fix(ui): centre
the sheet's inline editor on the row it replaces`, with the harness section arriving earlier inside
`173819e` and the captures in `3b22924`.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Size the editor to the row rather than let the row stretch | An out-of-flow box cannot make its row grow. This is a constraint, not a preference |
| Declare the row height once as a token | Three rules must agree on it and two derive a negative margin from it. A drifting literal decentres silently rather than failing |
| Give the input the popover's height instead of its own | A host stylesheet that sizes every input cannot then push the box back out of the row |
| Freeze desktop rather than fix it | The desktop panel has the same defect. Criterion 5 pins its numbers so a phase that fixes it must update them |
| Rewrite criterion 5's control rather than trust it | Its first version passed the mistake it existed to catch. See Verification |
| Name the `setPosition` defect, do not fix it | It lives in a shared placement helper with desktop callers. A repair there is a different phase's blast radius |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

| Gate | Result |
|---|---|
| `npm run gate` | **14 green, exit 0** |
| `npx vitest run` | **444 passed** |
| `npm run storybook:placement` | **186/190**, 4 red for a declared reason, exit 0 |
| `npm run screenshots:verify` | **224 entries**, green |
| `evidence.mjs --check-all` | **8 of 8** |

### The negative controls

Criteria 1-4 were red before the change, with the numbers in the criteria table.

**Criterion 5 needed its own control, and the first version of it did not survive one.** That check
originally asserted the desktop editor's `margin-top` was still `0px`. Unscoping both new selectors —
the mistake it exists to catch — left `margin-top` reading `0px` anyway, because
`--db-sheet-row-min-height` is declared only on the sheet, so off it the declaration is invalid at
computed-value time and falls back to the initial value.

Meanwhile the input rule **did** leak and shrank the desktop editor from 34.8px to 31px. The check now
measures the rectangle, and under the same control it reports `31/6.1/8.2` against the frozen
`34.8/8/12` and the run exits 1.

A control that cannot fail is the same defect as a check that cannot fail, one level up.

### Capture attribution

224 entries. Eight images differ from the previous commit and **every one is a calendar, timeline or
date-picker fixture**. Not attributable, on two independent grounds:

*Reachability.* Every rule added here is under `.db-record-detail-panel.db-mobile-bottom-sheet`, and
none of these fixtures contains a `.db-record-detail-panel` at all. No record-sheet capture differs.

*Churn.* The floor was re-measured rather than assumed: three identical capture runs with no code
change moved six fixtures in the same families, the record-sheet fixture among them.

One earlier capture did put `panel-record-detail-sheet-desktop-light` in the diff. It was decoded and
compared: **6 pixels of 5,184,000 at a maximum delta of 1/255**, on six non-adjacent rows. A row whose
height had moved would have shifted hundreds of thousands. It settled back out on the next run.

### The concurrency episode

The working tree was not clean and `verify-placement.mjs` was not free. A second session was editing
`src/views/list-renderer.ts` and adding its own checks to the same harness file throughout, and later
ran `git checkout` and `git stash` against it. Edits were overwritten three times and re-applied. Six
of the 190 placement checks are theirs; the 267-line section carrying this phase's seven is this
phase's. The 443/444 vitest reading taken mid-phase was their in-flight `list-renderer` edit and
resolved on its own.

**Because a reconciling check count can sit on top of a wrong body**, the section was re-verified by
content rather than by arithmetic: the bundle export, the driving path, every derived field, the
Escape teardown and all seven assertion bodies with their thresholds were read back, and the run
re-measured the same numbers.

Their fixture finding — that the list fixture omits row controls the renderer always builds, so its
field area is roughly twice the real one — does not reach these checks. This section renders no
fixture; it drives `openRecordDetailPanel` with `editCell` wired to the shipped `CellRenderer`. It
also asserts no width: every threshold here is vertical.

### The repository contract

`REPO RULES.md` was a four-line stub for the duration of the work and was restored afterwards in
`308f0c0`. Its verification clause was then run in full against the committed result: `npx tsc
--noEmit` exit 0, `npm run build` clean with `main.js` byte-identical, `npx vitest run` 444 passed,
`npm run screenshots:verify` current.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

### Corrections from a fresh review

Every measured number in this phase reproduced exactly under an independent probe, including the
negative control. **Three claims around them did not.**

**There are five editors, not four, and two of them are inline.** The title's rename editor is the
same single-line popover class as the number editor, hosted inside the panel, so it receives both new
declarations. This phase did not measure it and its scoping argument explicitly excluded it.

The harness cannot see it, for two independent reasons: it stubs the rename entry point as a no-op,
and the trigger is a double-click rather than a click. **Either alone would have hidden it.**

The consequence is arithmetic, not cosmetic. The vertical correction is derived from the **value's**
line box at 21.6px, but the title's line box is 18.85px, so the correct offset there is **−12.6px**
rather than the **−11.2px** it inherits. Measured on the title: **9.0px off-centre before, 2.4px
after** — an improvement, and still wrong by 1.4px plus the border. **Open**, as criterion 6 and
REQ-007.

**The residue is sheet-only, not desktop-wide.** The 1px displacement is confirmed, but its cause is
narrower than first recorded: the sheet chrome stamps the container class onto the panel itself, so
the nearest matching ancestor *is* the panel, and that panel has a border. On desktop the same lookup
finds the real container, which has none — measured displacement **0.00 in both axes**. The sentence
that survives is that repairing the shared placement helper would touch desktop callers, which is a
different claim from desktop being affected today.

**Two smaller corrections.** The helper cited by name as already compensating does not exist under
that name; the real one is `fixedContainingBlock`, and the quoted comment is genuine. And the two
bottom-docked overlays are anchored by their bottom edge, so they are displaced in the opposite
vertical direction — "low and right" describes the top-positioned editors only.

### Measured, and not this phase's to fix

- **The desktop record panel has the same defect.** Its editor is 34.8px top-aligned onto an 18.8px
  value inside a 26.8px row: 8px below the label's centre line and 12px past the row. Excluded
  deliberately; criterion 5 freezes those numbers, so a phase that fixes desktop has to update them.
- **`setPosition` converts to the wrong box.** It offsets from the container's border box while
  `absolute` resolves against the padding box. It lives in `popover-position.ts` — one of the thirteen
  modules `../025-story-coverage-blindness` shows the story catalogue cannot see.
- **The sheet's date editor runs off the screen.** On a 390x844 phone the date popover opens 438.9px
  tall below its row and reaches y=1001, with the sheet's own bottom at 848.8. The text editor is
  193px and lands at y=844.3 — inside, with nothing to spare.
- **The type shrinks at the moment of tap.** The resting value renders at the large step and the input
  that replaces it at the medium one, two steps down, while the box simultaneously grows from 21.6px
  to 44px. **This phase enlarged the box and left the type, widening the mismatch it inherited.**
- **The inline editor's font is 13px, and 16px is the iOS zoom floor.** The value it replaces is 16px,
  and the comment on that rule gives the reason: it "is also the size below which iOS zooms the whole
  page when this cell becomes an input on tap". The input that appears on that tap is `--db-font-md`,
  13px, so the protection the comment claims is not delivered. Left alone: raising it makes the editor
  taller and interacts with everything above, and it is not what was reported.

### Coverage

**No screenshot in the set shows an open editor**, so none could have moved. The capture named for the
desktop panel renders the sheet presentation at desktop width, so the surface criterion 5 freezes has
**no capture at all**.

<!-- /ANCHOR:limitations -->
