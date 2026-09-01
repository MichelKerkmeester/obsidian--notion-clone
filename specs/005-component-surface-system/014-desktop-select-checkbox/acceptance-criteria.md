# Acceptance Criteria: Desktop Select Checkbox Placement

Each criterion carries a number with a threshold, was demonstrated failing on the unfixed tree with
the failing number recorded, and is measured on the real stylesheet at the production mount point.

## AC-1 — the checkbox keeps clearance from the edge that clips it

**Threshold.** Narrowest left clearance across every select cell >= 4px, with the cell still
declaring `overflow: hidden`.

**Failing first.** With the pin guarded, measured **0px across 25 cells**, all 25 clipping. Zero
clearance inside a clipping box is the shear in the operator's screenshot.

**After.** 18px across 25 cells.

**Check.** `the select checkbox keeps clearance from the cell edge that clips it`, in
`tools/storybook/verify-placement.mjs`.

**Negative control.** Re-guarding the rule takes the check to `FAIL … narrowest left clearance 0px`
and the run to exit 1, 78/80. Restoring returns it to 79/80 exit 0. Run and observed, both ways.

## AC-2 — the fixture still resembles what production builds

**Threshold.** Every select checkbox measured carries the shared checkbox component's class.

**Result.** 25/25.

**Why this criterion exists.** AC-1's geometry is only meaningful if the thing being measured is the
thing production renders. The defect was caused *by* that class being present, so a fixture that
stopped carrying it would turn AC-1 green while the product stayed broken. This is the check that
makes the other one honest.

**Check.** `the select column's checkbox is the shared owned control`.

**Negative control. Run, and observed red.** `PLACEMENT_SELECT_CONTROL=strip-select` removes the
shared component's class from exactly one of the 25 select checkboxes in the harness. The check goes
to `FAIL 24/25 select checkboxes carry the shared component class`, the run to 223/227, exit 1.
Unsetting the control returns 25/25 at 224/227, exit 0. Run and observed, both ways.

The control is a named environment flag rather than a hand edit, for the reason AC-4 records: a
control nobody can re-run is a claim, not evidence. `verify-placement.mjs` refuses to arm silently —
a control that matches no element throws, and the section wrapper turns that into one named red
rather than a quiet green.

## AC-3 — the header and the rows land on the same column

**Threshold.** Two clauses, both required. Right clearance takes exactly one distinct value across
the header cell and every row cell, **and** the header's inner container and a row's are coincident —
height delta 0px.

**Failing first.** The first clause **was already satisfied on the unfixed tree**: the value was
uniform at 25px with every box flush left. That is now re-measurable rather than remembered —
`PLACEMENT_SELECT_CONTROL=reguard-desktop` reproduces it exactly, at
`right clearance takes 1 distinct value(s): 25px`, with the left clearance at 0px. The single-value
clause alone is therefore a criterion that passes before a line is written, and it is recorded here
as one — it is kept because it is what regresses if the pin is ever re-guarded, and it is paired
because on its own it certifies the defect.

**After.** One value, 7px, across the header and all 24 rows.

**The coincidence clause was specified, measured, and not built.** It asked for the header's inner
flex container and a row's to be coincident to 0px, naming 32px against 33px as the pre-fix failing
pair. Measured on the shipped tree, in the document the check would run against, `.db-select-inner`
resolves to **32px in the header, 33px in twenty-three rows, and 34px in the last row**. The pair
recorded above as the failure is the current, correct value. An exact clause there is red against
correct code, and the tolerance cannot be widened to hide it — the specification itself observes that
any tolerance above 1px stops distinguishing the numbers it names.

It is also blind to the defect it was written to guard. With the pin re-guarded the same three
numbers come back unchanged: the run prints `header 32px against row values 33/34px` identically in
both states. The spread is table-border geometry — the header's container starts 1px into its cell,
and the last row has no bottom border to give back — and it does not depend on whether the checkbox
is pinned. Neither nearby variant rescues it. The `<td>` heights are a uniform 34px in **both**
states, and the checkbox's own vertical centre within its cell is 17px in the header against 16.5px
in the rows in **both** states. Every vertical clause available on this fixture is either red against
correct code, or identical across the defect, and two of the three are both.

Recorded rather than built, and the number it wanted is now printed by the check that was built —
unasserted, in the detail line, so the next reader sees it instead of re-deriving it. This is another
criterion in this program that would fail correct code, and another introduced by a specification
rather than by an implementation.

**What this fixture cannot model.** The original rationale for pinning out of flow was that a row
with a drag handle and a row without one otherwise resolve a pixel apart, so the checkbox jumps when
sorting removes the handle. No select cell in the desktop fixture has a drag handle — the table
builds that button only on touch, which the reorder check in the same harness reports as
`no reorder button is shown in 11 select cells`. The horizontal clause is the only one of the two
that models the jump here, and it is the one that moves: 7px pinned, 25px unpinned.

**Check.** `the header checkbox and the row checkboxes land on the same column`.

## AC-4 — the phone does not move

**Threshold.** Phone clearances identical before and after.

**Result.** **32px left / 5px right**, one distinct right value across the header and all 24 rows,
and unchanged when the desktop pin is re-guarded. The phone arm had already been de-guarded on its
own; the new unguarded rule merely restates it, and the phone arm still wins on specificity and
order.

**The 26px / 7px pair this criterion used to record does not reproduce.** It came from a run nobody
could re-execute, which this folder had already named as the shape of evidence this program decided
not to accept. Measured now, from a committed probe: **32px left, 5px right**, on a 390x844 phone
with `is-mobile is-phone` on the body. The column resolves to 65px and the box to 28px under the
coarse-pointer minimum, which is where 32 + 28 + 5 comes from. The old pair is kept in this sentence
rather than deleted, because a number that is quoted and then silently replaced is how the next
reader loses the ability to tell a correction from a drift.

**Method.** A second page in the same section of `tools/storybook/verify-placement.mjs`, at 390x844
with `hasTouch` and `isMobile`, running the same probe function as the desktop arm rather than a
second hand-written copy of it. Both phone checks assert `body.is-phone` and `pointer: coarse`
alongside their geometry, because a desktop rendering of that page satisfies both clauses and would
otherwise pass for the wrong reason.

**Checks.** `the select checkbox keeps its clearance on a phone` — `narrowest left clearance 32px
across 25 cells (25 of them clip their overflow); right clearance 5px`. And `the phone header and
the phone row checkboxes land on the same column` — `1 distinct value(s): 5px across 25 cells`.

**Negative control, both ways, run and observed.** `PLACEMENT_SELECT_CONTROL=reguard-phone` takes the
first to `FAIL narrowest left clearance 0px across 25 cells (25 of them clip their overflow); right
clearance 37px` and the run to exit 1. `reguard-desktop` takes the *desktop* clearance check red at
0px while both phone checks stay green at 32px and 5px — which is the half that distinguishes *the
phone was already right* from *the desktop edit reached the phone*, and it is now a number rather
than a sentence.

**The same structural warning AC-3 carries applies here.** Under `reguard-phone` the phone
single-value clause stays green, at a uniform 37px. One distinct value is a property of a column
whose boxes are all wrong in the same way, so on the phone too it is the left-clearance clause that
carries the criterion.

## AC-5 — appearance keeps exactly one owner

**Threshold.** Two clauses. In the source, no border, fill or checkmark declaration is reintroduced
into the select-column block. In the browser, a select checkbox's computed `appearance`,
`border-width`, `border-radius`, `background-color` **and `border-color`** are identical to a
role-mate the same factory builds elsewhere — set equality, 0 differing properties.

**The fifth property is an amendment, and it is why this criterion can close.** It was written with
four, and against four the negative control moved nothing: the select column's own `:not(.db-checkbox)`
fallback agrees with the component on all four, so stripping the shared class woke a second owner
instead of removing the only one. `border-color` is the one property on which the two disagree, and
the disagreement crosses WCAG 1.4.11's 3:1 non-text minimum. Widening the threshold here is a
criterion admitting it was measuring the wrong set, not a threshold being relaxed to fit a result.

**Why the second clause.** The first is an absence in a file, and an absence passes before anything
is written. It cannot distinguish a repair that respected the boundary from a repair that never
approached it, and it goes stale the moment appearance is reintroduced from a *different* block. The
computed comparison is the one that can fail.

**Result.** The edit adds `position` and `right` only. Appearance stays with the shared component,
which is what the checkbox-ownership work established and what this repair must not undo. The
computed set-equality clause is now **measured: 0 of 4 properties differ** between a select checkbox
and a `db-gallery-card-checkbox` role-mate the same factory builds — `appearance: none`,
`border-width: 1px`, `border-radius: 4px`, `background-color: rgb(255, 255, 255)` on both.

**Check.** `the select checkbox and a role-mate compute one appearance`. The table fixture holds no
second family, so the gallery fixture is mounted beside it and both readings come out of one
document. Two absolute assertions in two documents can drift together and still agree; a comparison
cannot. Mounting the gallery moves nothing else — the three geometry checks print byte-identical
detail lines before and after it was added, and the run total goes 221/224 to 224/227, which is the
three new checks and nothing more.

**Seen red.** `PLACEMENT_SELECT_CONTROL=strip-mate` strips the shared class from the role-mate and
takes the check to `FAIL 4 of 4 properties differ … appearance none vs auto, borderWidth 1px vs 0px,
borderRadius 4px vs 0px, backgroundColor rgb(255, 255, 255) vs rgba(0, 0, 0, 0)`, exit 1.

**The owed control was run, and it does not discharge this criterion.**
`PLACEMENT_SELECT_CONTROL=strip-select` removes the shared class from a select checkbox. Measured
result: **0 of the 4 named properties move.** The select column keeps its own `:not(.db-checkbox)`
fallback block, and that block declares `appearance: none`, a 1px border, the same `--db-radius-sm`
radius and the same `--background-primary` fill. Stripping the class does not remove an owner. It
wakes the second one, and the second one agrees.

The one property that does move is `border-color`, `rgb(138, 144, 153)` from the component against
`rgb(221, 221, 221)` from the fallback, because the two blocks name different fallback tokens for it.
The check reads and prints it and deliberately does not assert it: widening the property set is a
change to this criterion, not to the check that serves it.

**The property this control cannot see is the one that carries an accessibility floor.** A checkbox's
border is the only thing identifying the control, so WCAG 1.4.11 puts it at 3:1 against its
background, not at the hairline ratio used for dividing content. Computed from the two measured
colours against the white the same run reports as the fill: the component's border is **3.22:1** and
the fallback's is **1.36:1**. The second number is the one `styles.css` already records beside the
component rule as the inherited token it replaced — "measured 1.36:1 in light" — which is
independent corroboration that the dormant block would repaint the pre-fix, sub-threshold border the
checkbox-ownership work removed.

So the four properties this criterion names are exactly the four on which the two owners agree, and
the fifth is where they disagree by an accessibility threshold. That is the argument for closing this
criterion by asserting `border-color` rather than by any of the other two routes: it is the one
change that makes the control discharging *and* puts a WCAG floor under a value that currently has
none. The arithmetic above is derived here from the measured colours, not read off a check — nothing
in the harness asserts a contrast ratio for this control today.

**AC-5 is closed, by route 1.** Two agreeing owners are indistinguishable from one owner until one of
them is taken away, and against four properties this control could not take the second away. The
comparison now names five, and the same control discharges: `PLACEMENT_SELECT_CONTROL=strip-select`
reports **`1 of 5 properties differ: borderColor rgb(221, 221, 221) vs rgb(138, 144, 153)`**, the
appearance check red and exit 1, while the unarmed run reads 0 of 5 and exit 0.

Three routes were available and the first was taken, because it is the only one that makes the
control discharging *and* puts a floor under a value that had none:

1. **Taken.** Assert `border-color` as a fifth property. One line. The role-mate reads
   `rgb(138, 144, 153)` too, so the check stays green on correct code, and the dormant fallback's
   `rgb(221, 221, 221)` is what the control now exposes — at **1.36:1** against the white fill where
   WCAG 1.4.11 requires 3:1, against the component's **3.22:1**. Both ratios are derived here from
   the measured colours rather than asserted by any check, and the property itself is asserted.
2. Not taken. Delete the three dead guarded blocks — D3's open question, and it moves captures.
3. Not taken. Run the control against a role-mate with no per-site fallback: a different claim about
   a different element. Measured for contrast, stripping the class from the gallery role-mate moves
   all four original properties and takes the check red at `4 of 4 properties differ`.

## AC-6 — the lane records the edit

**Threshold.** `node tools/lane/check-lane.mjs` exits 0 with the stylesheet matching the recorded
baseline, and the history carries an acquire, an edit with a stated reason, and a release.

**Result.** Recorded; baseline moved `e53819a117ba` -> `b4dc64bb4e72`; exit 0.

## Not done here, deliberately

The select-column appearance block, and the equivalent modal and CSV-option blocks, are still
guarded against the shared component's class and are therefore dead code. Nothing is visibly missing
because the component supplies all of it, but three dead blocks remain and the next reader will
believe they are live. Removing them moves captures and is a separate reviewable change; it is
recorded in the lane's outstanding list rather than folded in here.

**They are dead only while the class is present, and AC-5's control is what proved it.** Strip the
class and the select-column block wakes and paints the same four values, which is why the control
that was supposed to demonstrate single ownership demonstrates nothing. "Dead code the next reader
will believe is live" understated it: it is dormant code that a negative control reanimates, and it
is the reason a criterion in this folder cannot be closed by the control written for it.
