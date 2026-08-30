# 021 — Sheet inline edit alignment

## WHY

Reported from a phone: tapping a value in the record sheet leaves the edit input sitting below the
line its label is on. The screenshot carries a second defect the report does not mention and which
is the worse of the two — the input is taller than the row it belongs to, so its bottom edge lies
over the row beneath it.

Both come from one mechanism, so both are one fix.

## WHAT THE EDITOR ACTUALLY IS

The first job was deciding whether the editor is an ordinary flex child of the row or an overlay,
because the two want opposite fixes and the row already declares `align-items: center`. It is an
overlay, and the sheet does not open one editor but four:

| field type | editor | shape |
| --- | --- | --- |
| number, currency | `.db-cell-edit-popover.db-cell-line-edit-popover` | absolutely positioned, sized to the value it replaces, placed on it |
| text, files | `.db-cell-edit-popover.is-mobile.is-inline-overlay` | full sheet width, docked below the row |
| date, datetime | the same, plus `.db-date-edit-popover` | full width, docked below the row |
| select, status, multi-select | `.db-cell-option-popover` | a list popover |

Only the first pretends to be the value. The other three are deliberately different affordances and
have no business on the value's centre line, so the reported defect is the number and currency
editor and this phase changes nothing else.

Measured, on the phone sheet, through the shipped `CellRenderer`: `position: absolute`, parent is
the sheet panel, and not a flex child of the row. That decides the fix. An out-of-flow box cannot
make its row grow, so "the row contains the editor" has to be bought by sizing the editor to the
row rather than by letting the row stretch.

## THE MECHANISM

`CellRenderer.editSingleLinePopover` builds the editor and hands it to `positionTextEditPopover`,
which puts the popover's **top** edge on the anchor's **top** edge. In a table that reads correctly,
because a `<td>` and its editor are nearly the same height. In the sheet the anchor is
`.db-board-card-value` — a 21.6px line of text centred in a 44px row — and the editor is 34.8px. So
the editor hangs 6.6px lower than the value it replaced, and its bottom passes the row's.

The offset is arithmetic, not chance: it is half the difference between the two heights, plus the
sheet's own 1px border. That predicts the defect grows with the editor, which is why the device
screenshot shows a far larger overlap than a harness loading only `styles.css` does — Obsidian's
`app.css` gives every input a box of its own and is not present here.

## ACCEPTANCE CRITERIA

Each measured through the real open-and-edit path — the shipped `openRecordDetailPanel` with its
`editCell` wired to the shipped `CellRenderer`, and a click on the value element. Failing numbers
are from the tree as received.

| # | criterion | threshold | before | after |
| --- | --- | --- | --- | --- |
| 1 | the inline editor sits on its label's centre line | ≤ 1px | **7.6px** | 1.0px |
| 2 | the inline editor stays inside its row | ≤ 1px overhang | **2.5px** below the row | 0.5px |
| 3 | the inline editor meets the 44px thumb floor | ≥ 44px | **34.8px** | 44px |
| 4 | criteria 1 and 2 hold when the host stylesheet inflates every input | ≤ 1px each | **15.2px / 17.7px** | 1.0px / 0.5px |
| 5 | the desktop panel's editor geometry is unchanged | exact, ±0.5px | 34.8px / 8px / 12px | 34.8px / 8px / 12px |

The residue in 1 and 2 is the sheet's own `border-top`, and is not sub-pixel noise. `setPosition`
writes a child's `top` as an offset from the container's **border** box while `position: absolute`
resolves it against the **padding** box, so every popover the sheet hosts lands one border-width low
and one right. That is a positioner defect with desktop blast radius; it is named below rather than
fixed here.

Criterion 4 is a stress test, not a claim about what Obsidian sets. Its point is that the fix holds
as the input grows rather than only at the height this harness happens to build.

## WHAT CHANGED

`styles.css`, three declarations plus one token swap, all under `.db-record-detail-panel.db-mobile-bottom-sheet`:

- `--db-sheet-row-min-height: 44px` declared on the sheet, and the field row's `min-height` now
  reads it. The literal moved rather than multiplied: three declarations have to agree on this
  number, and two of them are a negative margin computed from it, so a drifting literal would
  decentre the editor silently instead of failing.
- The inline editor takes the row's height. At exactly that height the two boxes coincide, which
  makes both the shared centre line and the containment exact rather than approximate, and it holds
  the same 44px floor the sheet's textarea editor already holds — a focused field still has to be
  re-tappable to move the caret.
- The inline editor is lifted by half the difference between the value's line box and the row, which
  is the correction for `top` having been set to the value's top. Both terms are the tokens that
  produce those two heights, so the correction follows them.
- The input carries the popover's height rather than setting its own, so a host stylesheet that
  gives every input a height cannot push the box back out of the row.

`tools/storybook/verify-placement.mjs` gains a section that opens the sheet and taps each editable
value through the shipped renderer. Nothing in it builds an editor by hand.

## VERIFICATION

- gate: **14 green, exit 0**
- vitest: **444 passed**
- placement: **186/190, 4 red for a declared reason, exit 0** (7 checks added; 6 of the 190 arrived
  from a concurrent session, see below)
- screenshots: 224 entries current, none blank, none identical across themes
- evidence: 8 of 8 artefacts describe this tree

### The negative controls

Criteria 1–4 were red before the change, with the numbers in the table.

Criterion 5 needed its own control, and the first version of it did not survive one. That check
originally asserted the desktop editor's `margin-top` was still `0px`. Unscoping both new selectors
— the mistake it exists to catch — left `margin-top` reading `0px` anyway, because
`--db-sheet-row-min-height` is declared only on the sheet, so off it the declaration is invalid at
computed-value time and falls back to the initial value. Meanwhile the input rule did leak and shrank
the desktop editor from 34.8px to 31px. The check now measures the rectangle, and under the same
control it reports `31/6.1/8.2` against the frozen `34.8/8/12` and the run exits 1.

### Screenshots

Recaptured, 224 entries, `screenshots:verify` green. Eight images differ from the previous commit
and every one of them is a calendar, timeline or date-picker fixture:

```
field-date-value-picker-datetime-mobile-light   calendar-week-time-grid-desktop-dark
calendar-mini-calendar-desktop-dark             calendar-week-time-grid-mobile-dark
calendar-month-view-mobile-dark                 timeline-toolbar-options-mobile-dark
calendar-month-view-mobile-light                timeline-view-desktop-dark
```

None is attributable, on two independent grounds.

Reachability: every rule added here is under `.db-record-detail-panel.db-mobile-bottom-sheet`, and
none of these fixtures contains a `.db-record-detail-panel` at all. No record-sheet capture differs
from the previous commit.

Churn: the floor was re-measured rather than assumed. Three identical capture runs with no code
change moved `panel-record-detail-sheet-mobile-light`, `calendar-mini-calendar-desktop-light`,
`calendar-month-view-mobile-light`, `calendar-month-view-mobile-dark`,
`calendar-week-time-grid-mobile-light` and `calendar-toolbar-options-desktop-dark` — the same
families, and the record-sheet fixture among them.

One earlier capture did put `panel-record-detail-sheet-desktop-light` in the diff. It was decoded
and compared: **6 pixels of 5,184,000 at a maximum delta of 1/255**, on six non-adjacent rows. A row
whose height had moved would have shifted hundreds of thousands. It settled back out on the next
run.

## OUT OF SCOPE, MEASURED AND NOT FIXED

**The desktop record panel has the same defect.** Its editor is 34.8px top-aligned onto an 18.8px
value inside a 26.8px row: 8px below the label's centre line and 12px past the row. It was excluded
deliberately, so criterion 5 freezes those numbers; a phase that fixes desktop has to update them.

**`setPosition` converts to the wrong box.** It offsets from the container's border box while
`absolute` resolves against the padding box, so every popover the sheet hosts is displaced by the
sheet's border width in both axes. That is the 1px residue in criteria 1 and 2. `containerLeafRect`
in the same file already compensates for exactly this on the leaf, with a comment describing it as
"a silent offset of exactly the border width" — the sheet path never got the same treatment.

**The sheet's date editor runs off the screen.** On a 390×844 phone the date popover opens 438.9px
tall below its row and reaches y=1001, with the sheet's own bottom at 848.8. The text editor is
193px and lands at y=844.3 on the same viewport — inside, but with nothing to spare.

**The inline editor's font is 13px, and 16px is the iOS zoom floor.** The value it replaces is 16px,
and the comment on that rule gives the reason: it "is also the size below which iOS zooms the whole
page when this cell becomes an input on tap". The input that appears on that tap is `--db-font-md`,
13px, so the protection the comment claims is not delivered. Left alone because raising it makes the
editor taller and interacts with everything above, and because it is not what was reported.

## A NOTE ON THE TREE

The working tree was not clean and `tools/storybook/verify-placement.mjs` was not free. A second
session was editing `src/views/list-renderer.ts` and adding its own checks to the same harness file
throughout this phase; edits to it were overwritten twice and had to be re-applied. Six of the 190
placement checks are theirs. The 443/444 vitest reading taken mid-phase was their in-flight
`list-renderer` edit and resolved on its own.
