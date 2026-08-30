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

**Provenance.** The before-state below is read from the source diff, not from a harness run: no check
in this repository has ever compared a card's rendered text to a cell's. That absence is itself
AC-2's reason for existing, and it means **every criterion here is currently unmet**, including the
ones whose code has already shipped.

**Harness.** `tools/storybook/verify-placement.mjs` for the parity check, `vitest` for the
formatters. The formatters are pure functions with no DOM, so they are the rare thing in this program
the unit suite can actually evidence — see `../spec.md` §6 for why that is normally not true.

---

## AC-1 — a currency column carries its symbol and separators

**Threshold.** A card field for a currency column renders `formatEuroCurrency(value)` exactly:
grouped thousands with `.`, a `,` decimal separator, and a euro sign.

**Before.** The raw JavaScript number, via the default `String()` path — `1000.24`.

**After (shipped, unverified).** `card-field-renderer.ts` routes the finite-numeric branch through
`formatEuroCurrency` for `displayType === "currency"`.

**State.** Unmet — no check runs it.

## AC-2 — a card and a cell agree

**Threshold.** For the same record and the same column, the text rendered in a card field and the
text rendered in a table cell are byte-identical, across every numeric column type. **Zero
disagreements.**

**Before.** Unmeasured, and unmeasurable: nothing in the repository renders both and compares them.
That is why a divergence survived long enough for the operator to find it.

**State.** Unmet. This is the criterion that would have caught the defect, and it does not exist yet.

**Why parity and not a literal.** A criterion asserting the card renders `€ 1.000,24` would pass
while the *table* drifted, and the operator's complaint was a comparison, not an absolute. The
program's doctrine is that a criterion must be able to fail for the real reason: here the real
failure is disagreement, so disagreement is what gets measured.

## AC-3 — the progress and ring display styles are unaffected

**Threshold.** A number column configured as a bar or a ring renders its bar or ring, not formatted
text.

**Before.** Both styles return before the numeric text branch.

**After (shipped, unverified).** The new branch sits after both returns, so neither is reachable by
it.

**State.** Unmet — asserted from reading the control flow, not from a run.

## AC-4 — a non-finite value still renders the placeholder

**Threshold.** A `NaN` or infinite value renders the placeholder, never a formatted `NaN`.

**Before.** The default path.

**After (shipped, unverified).** The branch is guarded `Number.isFinite(numeric)`, and the formatters
independently return `-` for a non-finite input.

**State.** Unmet — two guards, neither exercised by a test.

## AC-5 — the scope exclusion is settled

**Threshold.** `../spec.md` §2 either names card field formatting as in scope, or this folder moves
to the earlier track. A written decision either way.

**State.** Open. `../spec.md` §7 of this document's spec states both readings.

## AC-6 — the formatters have a test

**Threshold.** `formatEuroNumber`, `formatEuroNumber2` and `formatEuroCurrency` each have at least a
grouped value, a decimal value and a non-finite value asserted.

**Before.** **Zero tests.** Grepped across the repository: no test file references any of the three,
despite five calling surfaces.

**State.** Unmet.

**Why this is P1 and not optional.** Five surfaces render every number in the plugin through three
untested functions. A locale change, a rounding change, or an `Intl` option typo would alter every
figure the operator sees and break no check.

---

## Coverage

| Criterion | Producer | Mount | Environment | Negative control | State |
|---|---|---|---|---|---|
| AC-1 | parity check, currency arm | production card field | phone + desktop | — | Unmet |
| AC-2 | parity check | card field vs table cell | phone + desktop | — | Unmet |
| AC-3 | display-style arm | production card field | desktop | — | Unmet |
| AC-4 | formatter test | pure function | node | — | Unmet |
| AC-5 | a written decision | `../spec.md` §2 | n/a | n/a | Open |
| AC-6 | `vitest` | pure function | node | — | Unmet |

Every row unmet. The code shipped; none of it is evidenced. Under `../spec.md` §6 that is the
distinction between shipped and verified, and this phase is at the first.
