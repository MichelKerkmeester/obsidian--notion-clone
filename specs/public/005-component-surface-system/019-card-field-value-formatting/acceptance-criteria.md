---
title: "Acceptance Criteria: Card Field Value Formatting"
description: "Criteria for a number rendering identically in a card field and a table cell, each with a threshold and the state measured before the change."
trigger_phrases:
  - "019 acceptance criteria"
  - "card cell format parity"
  - "euro format criteria"
importance_tier: "critical"
contextType: "planning"
---
# Acceptance Criteria: Card Field Value Formatting

**Provenance.** The before-states below were read from the source diff when this was written, because
no check in this repository had ever compared a card's rendered text to a cell's. That absence was
AC-2's reason for existing. **It no longer holds: AC-1, AC-2, AC-3, AC-4 and AC-6 now carry numbers
taken from a run, each observed red before it was trusted green.** Every before-state that a control
could reproduce has been reproduced rather than quoted — the pre-fix card renders `1000.24` because
removing the branch made it, not because the diff says so.

**Harness.** `tools/storybook/verify-placement.mjs` for the parity check, `vitest` for the
formatters. The formatters are pure functions with no DOM, so they are the rare thing in this program
the unit suite can actually evidence — see `../spec.md` §6 for why that is normally not true.

---

## AC-1 — a currency column carries its symbol and separators

**Threshold.** A card field for a currency column renders `formatEuroCurrency(value)` exactly:
grouped thousands with `.`, a `,` decimal separator, and a euro sign.

**Before.** The raw JavaScript number, via the default `String()` path — `1000.24`.

**After.** `card-field-renderer.ts` routes the finite-numeric branch through `formatEuroCurrency` for
`displayType === "currency"`.

**Measured.** `card renders "€\u00A01.000,24" for 1000.24, want "€\u00A01.000,24"`. The sign is
followed by U+00A0; the check names the code point rather than the glyph, and prints it that way, so
an assertion written from habit cannot pass by looking right.

**Negative control.** Removing the euro branch — the state the operator reported — gives `card
renders "1000.24"`. The file was restored and confirmed byte-identical by `shasum -a 256`.

**State.** Met.

## AC-2 — a card and a cell agree

**Threshold.** For the same record and the same column, the text rendered in a card field and the
text rendered in a table cell are byte-identical, across every numeric column type. **Zero
disagreements.**

**Before.** Unmeasured, and unmeasurable: nothing in the repository rendered both and compared them.
That is why a divergence survived long enough for the operator to find it.

**Measured.** `14 pairs compared across number and currency columns, 0 disagreements`, over the
operator's own figure, their own record, zero, a negative, a million, the six-digit ceiling and a
round thousand. Both sides are built from the shipped modules and handed one record: the card gets
the frontmatter value the way the board and list renderers pass it, and the cell reads the same
record itself.

**Negative control.** Removing the card's euro branch gives `13 disagreements`, opening `number
"1000.24" card="1000.24" cell="1.000,24"`. The fourteenth pair still agreed — `0` reads identically
through either path, which is the evidence that a check written on a single value could have missed
the whole defect.

**A second arm, red and declared.** `12 pairs compared, 10 disagreements` when the column holds text
or a non-finite number. The card coerces the whole string and falls back to printing it unchanged;
the cell coerces the numeric prefix and falls back to the placeholder. A field holding the Dutch text
`1.000,24` renders as that text on the card and as `1` in the row behind it. Kept as its own
measurement because it has a different producer, and folding it into the arm above would let one
cause mask the other. Declared in the harness `KNOWN` map, so the number stays in front of everyone
and a fix reports itself as an unexpected pass. Its control runs the other way: aligning the card's
coercion and its fallback takes it to `0 disagreements`, so the check is satisfiable rather than
permanently red.

**State.** Met on numeric values. The text arm is a measured, declared defect outside this phase's
scope.

**Why parity and not a literal.** A criterion asserting the card renders `€ 1.000,24` would pass
while the *table* drifted, and the operator's complaint was a comparison, not an absolute. The
program's doctrine is that a criterion must be able to fail for the real reason: here the real
failure is disagreement, so disagreement is what gets measured.

## AC-3 — the progress and ring display styles are unaffected

**Threshold.** For a number column configured as a bar, and again as a ring: **1** bar/ring element
present and **0** text nodes carrying a formatted numeric string, on the rendered card field. Both
counts, per style.

**Before.** Both styles return before the numeric text branch.

**After.** The new branch sits after both returns, so neither is reachable by it — and that sentence
is now a measurement rather than a reading.

**Measured.** Per style: `1 bar elements on the rendered field, want 1` and `0 text nodes carry
"1.234,5", want 0`; the same two for the ring. The probe value is 1234.5 because the bar labels
itself `1234.5` through its own formatter while the euro form is `1.234,5`. At a value where those
two strings coincide the second count is green against every possible implementation and measures
nothing, so the gap between them is what makes the count able to fail. The needle is derived by
calling the shipped formatter in the page, not copied as a literal that would go stale.

**Negative control, twice.** Dropping the early return after the bar renderer takes the element count
to `0` and the text count to `1`. Then the control that earns the split: appending the formatted text
instead of assigning it leaves `1 bar elements` **passing** while the text count reports `1 text
nodes carry "1.234,5"` against text nodes `"Amount", "1234.5", "1.234,5"`. That is the formatted
string sitting beside the bar rather than instead of it, and the element count alone reported it
green — which is the shape this criterion's rationale predicted and the reason the two counts are
separate checks rather than one.

**State.** Met.

**Why counts rather than "renders its bar".** Reading a control flow proves the branch is not
*reached*; it cannot fail when a future edit reorders the returns, which is precisely the change that
would break this. Two counts on the rendered output can, and the second count is the one that goes
red if a formatted string ever appears **beside** the bar rather than instead of it — a shape the
first count alone would report green.

## AC-4 — a non-finite value still renders the placeholder

**Threshold.** A `NaN` or infinite value renders the placeholder, never a formatted `NaN`.

**Before.** The default path.

**After.** The branch is guarded `Number.isFinite(numeric)`, and the formatters independently return
`-` for a non-finite input.

**Measured.** `src/data/euro-format.test.ts` exercises all three formatters against `NaN`,
`+Infinity` and `-Infinity`.

**Negative control.** Removing the guard from `formatEuroCurrency` fails with `expected '€ NaN' to be
'-'`. Restored, green.

**State.** Met for the formatters. The card's own guard is a second, independent one, and the parity
check shows what it does when it fires: the card prints `NaN` where the row behind it prints `-`.
That is recorded under AC-2's declared arm rather than here, because its producer is the card's
fallback, not the formatter.

## AC-5 — the scope exclusion is settled

**Threshold.** `../spec.md` §2 either names card field formatting as in scope, or this folder moves
to the earlier track. A written decision either way.

**State.** Open. `../spec.md` §7 of this document's spec states both readings.

## AC-6 — the formatters have a test

**Threshold.** `formatEuroNumber`, `formatEuroNumber2` and `formatEuroCurrency` each have at least a
grouped value, a decimal value and a non-finite value asserted.

**Before.** **Zero tests.** Grepped across the repository: no test file references any of the three,
despite five calling surfaces.

**Measured.** `src/data/euro-format.test.ts`, 6 tests, exit 0. The six-digit cell ceiling is asserted
apart from the two-digit summary one, so a swapped import fails in the suite rather than surfacing as
a footer that disagrees with the column above it.

**Negative control.** Swapping the locale to `en-US` fails 4 assertions on the separator reversal —
`'1,000,000'` against `'1.000.000'`, `'1.234567'` against `'1,234567'`.

**State.** Met.

**Why this is P1 and not optional.** Five surfaces render every number in the plugin through three
untested functions. A locale change, a rounding change, or an `Intl` option typo would alter every
figure the operator sees and break no check.

---

## Coverage

| Criterion | Producer | Mount | Environment | Negative control | State |
|---|---|---|---|---|---|
| AC-1 | `verify-placement`, currency arm | production card field | desktop | remove the euro branch: `card renders "1000.24"` | Met |
| AC-2 | `verify-placement`, parity arm | production card field vs production table cell | desktop | remove the euro branch: `13 disagreements` of 14 | Met on numeric values |
| AC-2 | `verify-placement`, coercion arm | production card field vs production table cell | desktop | align the card's coercion and fallback: `0 disagreements` | Red, declared in `KNOWN` |
| AC-3 | `verify-placement`, display-style arm | production card field | desktop | drop the early return: `0` bars, `1` formatted text. Append instead of assign: bar count stays `1` and passes while the text count reports `1` | Met |
| AC-4 | `src/data/euro-format.test.ts` | pure function | node | remove the guard: `expected '€ NaN' to be '-'` | Met |
| AC-5 | a written decision | `../spec.md` §2 | n/a | n/a — a decision has no control | Open |
| AC-6 | `src/data/euro-format.test.ts` | pure function | node | locale to `en-US`: 4 assertions fail on the separator reversal | Met |

Five criteria met, one open on an operator decision, and one measured defect declared rather than
repaired. The environment column reads desktop rather than phone because that is where the check
actually ran; text content does not vary with viewport, but claiming an environment nothing measured
is the failure this program keeps finding. Under `../spec.md` §6 the phase is now verified and not
yet operator-confirmed, which is the distinction that decides closure.
