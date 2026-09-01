---
title: "Acceptance Criteria: Select Column Affordance Fit"
description: "Numbered criteria for the select column's two controls, each with a threshold and the negative number it was measured at before the change."
trigger_phrases:
  - "018 acceptance criteria"
  - "reorder overlap criteria"
  - "select column width criteria"
importance_tier: "critical"
contextType: "planning"
---
# Acceptance Criteria: Select Column Affordance Fit

Every criterion carries a threshold and the value measured **before** the change.

**Provenance of the before-numbers.** They are copied from `tools/lane/css-lane.json`, history entry
64, written by the phase that held the stylesheet lane when the edit landed. **They were not
reproduced by this phase**, because this phase was opened after the fact and must not take a lane
another phase holds. Each row below is marked accordingly, and no row may be marked Met on a
recorded number alone — this program has already shipped a release on numbers nobody re-ran.

**Harness.** `tools/storybook/verify-placement.mjs`. The check is
`on <id> the reorder button and the row checkbox do not overlap`, built from `overlapResults`
(`:3218`, the section opening at `:3219`).

**What that check actually mounts, which is not what the coverage table below used to claim.** At
`:3228` it renders `SCENARIOS.find(s => s.id === "table-mobile").html()` — a **screenshot scenario's
hand-written fixture markup**, not a table the renderer built. The fixture writes the select cell
literally (`tools/screenshots/scenarios/core.mjs:245-247`), so the reorder button is present in every
row on both devices and the desktop arm passes only because CSS hides it. Consequences per criterion
are recorded in each section; the coverage rows that said "production select cell" said something
untrue and now say what is there.

**One exposure this check does *not* have, which is worth stating because it was the obvious
suspicion.** It loads `tools/screenshots/runtime-vars.css`, the pinned-variable file — but that file
has since been repaired, and it now pins nothing that touches the select column. Its own header
records the five values it removed for contradicting production and adopts the rule "never assign a
property the runtime also assigns". None of what remains reaches this surface. The select column's
widths are literals in `styles.css` (`:4955` desktop 40px, `:17605` phone 64px). **The pins are not
the problem here; the markup is.**

---

## AC-1 — the two controls do not overlap

**Threshold.** The measured gap between the reorder button's right edge and the checkbox's left edge
is `>= 0` on every surface that renders both.

**Failing first.** Phone: **−14px in a 49px cell**. Desktop: **−17px**.

**Recorded after.** Phone: **+4px in a 65px cell**. Desktop: no button rendered at all, which is what
production does — the table builds it only on touch.

**State.** Recorded, not reproduced. Settled by re-running the harness and pasting the two numbers.

**Negative control.** Not yet run. Restoring the `display` declaration to the touch-floor block must
take this check red on the desktop surfaces; restoring the 48px column must take it red on the phone.
Until both have been observed red, this check has not been shown to be connected.

**The desktop arm is withdrawn: it passes on an absence, and the absence is the fixture's.** With no
button shown, `gaps` is empty and the check reports "no reorder button is shown in 11 select cells,
so nothing can collide". Meanwhile production's desktop select cell is not empty beside the
checkbox — `table-renderer.ts:786` calls `setupRowDrag(selectInner, …)`, which builds a
`db-table-row-drag-handle` into that same flex row on desktop and returns early on touch
(`:912`). So desktop renders **handle + checkbox** and the fixture renders **move button +
checkbox**, and the pair production actually paints has never been measured for overlap. By the
declared arithmetic it fits — handle 16px (`styles.css:6306`) and row checkbox 16px (`:19927`) in a
40px column — so this is an unmeasured question, not a live defect, and it should be recorded as the
first and not the second.

**The phone arm holds, with the duplicated constant named.** The +4px is real stylesheet arithmetic
over declared boxes. But the column's 64px reaches a device from a **second** source: the renderer
writes it inline, `getSelectionColumnWidth()` returning `isTouchDevice ? 64 : 40`
(`table-renderer.ts:475`, applied at `:423-424`), and an inline width beats the class rule. The two
copies agree today — checked, not assumed — and the fixture carries no inline width, so it measures
only the CSS one. Change the literal in `table-renderer.ts` and the phone column narrows on device
while this check still reads 65px and +4px. That is phase 015's transcription cost in CSS form.

## AC-2 — the reorder button renders only where production builds it

**Threshold.** Zero reorder buttons present in a rendered desktop list or gallery row.

**Failing first.** Present and unstyled in every desktop list and gallery row, because a touch-floor
block declared `display: inline-flex` at the same specificity as, and later in the file than, the
`display: none` written for the non-phone case.

**Recorded after.** `display` removed from the floor block; the floor itself kept.

**State.** Recorded, not reproduced.

**Why this is a criterion and not a footnote.** A minimum-size rule decided visibility. That is the
same class of defect as the duplicate `.db-mobile-reorder-controls` pair recorded in
`002-properties-panel` — two declarations of equal weight where the later one silently wins. A check
on the gap alone would have gone green the moment the desktop button disappeared, without anyone
establishing why it disappeared.

**Withdrawn: the check tests the CSS rule, and the threshold is written about the renderer.** The
threshold says "zero reorder buttons **present** in a rendered desktop list or gallery row", and the
harness reads `getComputedStyle(button).display !== "none"` on a fixture that **contains the button
in every row on both devices**. So it measures whether the stylesheet hides it, which is the defect
that was fixed and is a fair thing to check — but it cannot see the gate the sentence names, the
`isTouchDevice(this.renderContainer)` at `table-renderer.ts:790` that decides whether the button is
built at all. Presence and visibility are different questions and the criterion promises the first.

**And "list or gallery" is measured nowhere.** The check loads one scenario, `table-mobile`. No list
or gallery row is rendered on either device, so two of the three surfaces the threshold names have no
number behind them.

**What would settle it.** Assert on a table built by `TableRenderer` with `isTouchDevice` false that
`.db-table-mobile-move-btn` is absent from the DOM rather than hidden by it, and extend the same
question to the list and gallery rows the threshold names.

## AC-3 — the column width is derived from what the controls paint

**Threshold.** Column width equals the sum of the painted control boxes and their insets, re-measured
rather than read from a comment.

**Failing first.** 48px, from a comment recording `48 = button 24 + checkbox 16 + gap 8`. Both
controls had since grown to 28px for the touch floor. Two 28px controls do not fit in 48px at any
gap.

**Recorded after.** `4 + 28 + 4 + 28 = 64`, matched in the touch branch, with the phone pin taken
from 6px to 4px and the phone button declared at the 28px it had been painting all along.

**State.** Recorded, not reproduced.

**The trap this criterion names.** The stale comment was not wrong when written. It stopped being
true when a different phase raised the control sizes for an unrelated reason, and nothing recomputed
the sum. A criterion that reads the comment would still pass today.

**The same trap has a second instance in this criterion, one layer down.** The width is declared
twice: `styles.css:17607` says 64px for `.is-phone`, and `table-renderer.ts:475` says
`isTouchDevice ? 64 : 40` and writes it **inline** on the `<col>` at `:423-424`, where it wins the
cascade. `table-column-layout-sync.ts:101-105` then reads that inline value back and re-pins it, so
the TypeScript literal is what a device gets. They agree today — read and compared, not assumed —
but the fixture has no inline width, so this criterion measures the CSS copy only. **Change the
number in `table-renderer.ts` alone and the phone column narrows on device while this check still
reports 65px and +4px**, which is the same failure mode as the stale comment, moved from a comment
into a second source of truth.

**What would settle it.** Read the width from a `<col>` the renderer produced, so both declarations
are in the measurement, and assert the two agree rather than trusting either.

## AC-4 — the operator confirms on device

**Threshold.** The operator opens the table on the phone and reports that the button has room.

**State.** Not requested.

**Why it is separate from AC-1.** AC-1 is a number in a headless browser. This program exists because
a release passed every check and changed nothing the operator could see, so a positive gap is
necessary and never sufficient. Operator confirmation is the program's closing condition
(`../spec.md` §7).

---

## Coverage

| Criterion | Producer | Mount | Environment | Negative control | State |
|---|---|---|---|---|---|
| AC-1 phone | `verify-placement.mjs` overlap check | `table-mobile` **fixture** select cell | phone | **Observed red.** Control B (phone column back to 48px **and** the pin back to `right: 6px`) takes phone to `-14px`. Restored: `+4px in a 65px cell`, harness exit 0 | Met on the CSS copy of the width; the renderer writes a second one inline |
| AC-1 desktop | the same check, gap arm | `table-mobile` **fixture** select cell | desktop | **Observed red.** Control A (touch-floor block re-declares `display: inline-flex`) takes desktop to `-17px in a 40px cell` while the phone stays green | **Withdrawn.** Passes on an absence: production's desktop cell holds a drag handle beside the checkbox, which the fixture never contains and the check never measures |
| AC-2 | the same check, presence arm | `table-mobile` **fixture**, where the button is always in the DOM | desktop | **Observed red.** Under control A the desktop reports `11 cells show both`. Restored, it reports `no reorder button is shown in 11 select cells, so nothing can collide` | **Withdrawn.** Measures `display`, not presence; and no list or gallery row is rendered at all |
| AC-3 | column width read from the computed style | `table-mobile` **fixture** select column | phone touch branch | **Observed red.** Reverting both of this phase's phone edits — the column to 48px and the checkbox pin to `right: 6px` — gives `-14px`, the recorded figure. At 64px with the 4px pin the cell measures 65px and the gap is `+4px` | Met on the CSS copy. `table-renderer.ts:475` declares the same 64 in TypeScript and writes it inline, where it wins; the fixture has no inline width |
| AC-4 | the operator | the operator's phone | device | n/a | Not requested |

Three of the four controls have now been run and observed red, each isolated to the surface it
belongs to: control A moves only the desktop number, control B only the phone one. Restoring the
stylesheet returns the harness to exit 0 at 210 of 214 checks, and `shasum -a 256 styles.css` is
byte-identical to the pre-control baseline.

**The number that "did not reproduce" was an incomplete control, and the record was right.** This
phase made two phone edits: the column 48px to 64px, and the checkbox pin `right: 6px` to `4px`. A
control reverting only the column leaves the pin's 2px in place and measures `-12px` — a
configuration that never shipped in either direction. Reverting both gives the recorded `-14px`.

Worth keeping as a caution rather than deleting: a negative control has to restore *the whole* prior
state. Reverting one of two edits produces a real number for a tree that never existed, and it is
indistinguishable from a reproduction unless someone counts the edits.

**The other criteria were re-read for that same partial shape, and the answer is that the controls
are complete while the *mount* is not.** AC-2's fix was a single edit — `display` removed from the
touch-floor block — so control A restores the whole prior state and is sound as a control. What both
controls share is a subject: they move a hand-written fixture, which is enough to prove the check is
connected to the stylesheet and not enough to prove it is connected to the product. Two consequences
follow and are recorded above: the desktop gap is never measured on the pair production paints, and
the phone width has a second declaration in TypeScript that the fixture cannot carry.

**AC-4 remains open and is not closeable here.** It is the operator opening the table on their phone.
A positive gap in a headless browser is necessary and never sufficient, which is the whole reason
this program exists, so **this phase does not close today** — but it now fails for one honest reason
instead of four unrun controls.
