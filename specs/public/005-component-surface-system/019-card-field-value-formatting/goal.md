---
title: "Goal: Card Field Value Formatting"
description: "What would make phase 019 worth having done, and the criteria that decide it."
trigger_phrases:
  - "019 goal"
  - "card field formatting goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/019-card-field-value-formatting"
    last_updated_at: "2026-08-31T09:00:00Z"
    last_updated_by: "harness-dependence-review"
    recent_action: "Harness-dependence review: no tick withdrawn; both parity sides are shipped renderers"
    next_safe_action: "Settle the scope exclusion with the operator, then confirm the figure on device"
    blockers:
      - "Crosses a written scope exclusion in the parent spec; unresolved"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-019-goal"
      parent_session_id: null
    completion_pct: 70
    open_questions:
      - "Does the parent scope exclusion mean the formula editor's number format"
      - "Which coercion wins when a numeric column holds text the card and the cell read differently"
    answered_questions:
      - "Card and cell agree on every finite numeric value; measured, not inferred"
      - "The bar and ring branches are unreachable by the numeric text branch; measured by two counts, not by reading the returns"
---
# Goal: Card Field Value Formatting

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A number reads the same wherever the plugin renders it.

The formatter already existed and four surfaces already called it; the card renderer was the single
number surface not wired to it, so a card showed `1000.24` where the table beside it showed
`€ 1.000,24`.

**The criterion that matters is parity, not a literal, and that distinction is the whole lesson.** A
criterion asserting the card renders `€ 1.000,24` would pass while the **table** drifted, and the
operator's complaint was a comparison, not an absolute. So what gets measured is disagreement.
**Nothing in this repository renders both and compares them**, which is why a divergence survived long
enough for the operator to find it, and that absence is the criterion's own reason for existing.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Parity is the criterion. A literal passes while the other side drifts. |
| D2 | The code shipping does not make a criterion Met. A row closes when a command has been seen failing and then passing, never because the diff is in the tree. |
| D3 | The formatters are pure functions with no DOM, which makes them the one subject in this program the unit suite can actually evidence. |
| D4 | Control-flow reading is not a measurement. It proves a branch is not reached; it cannot fail when a future edit reorders the returns. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

**Reviewed against "if this value came from the device instead of the harness, would the check still
pass — and could it still fail?", and nothing here is withdrawn.** That is a result rather than an
absence of one, so it is worth saying why it holds.

Both sides of the parity check are shipped renderers: `renderCardField` from
`card-field-renderer.ts` and `new CellRenderer(…).renderCell(…)` from `cell-renderer.ts`, bundled
from `src/` and handed one record (`verify-placement.mjs:5205-5222`). The stubs they receive —
`app: {}`, `openNote(){}`, and an `async () => {}` save — are navigation and persistence, and take no
part in producing the text that is compared. The comparison is `textContent`, so it is untouched by
the absent host stylesheet, by the pinned variables and by every other supply the harness makes: none
of them can change a string. **AC-2 is the soundest criterion in this packet**, and its form is why:
a parity check cannot be satisfied by the harness handing over the answer, because the harness would
have to hand the same wrong answer to two independent renderers.

**One dependency does exist and it runs the other way.** The formatters are `Intl.NumberFormat("nl-NL")`
(`euro-format.ts:17-31`), so the exact glyphs in AC-1 and AC-6 — the U+00A0 after the euro sign, `.`
for grouping, `,` for the decimal — are ICU's output in Chromium and in Node, not the plugin's. A
device whose WebView ships different ICU data could print U+202F and turn AC-1 red while the product
is perfectly correct. That is a **false red, never a false green**: it cannot hide a defect, only
invent one. AC-2 is immune to it entirely, since both sides call the same formatter in the same
runtime and would shift together. Recorded so a future red on AC-1 is diagnosed before it is
"fixed".

- [x] Card and cell agree, byte for byte, on every numeric column type. `verify-placement` now
      builds both from the shipped modules and hands them one record: **`14 pairs compared across
      number and currency columns, 0 disagreements`**. Before: unmeasured and unmeasurable — no such
      check existed. Observed red first by removing the card's euro branch, which is the state the
      operator reported: `13 disagreements`, opening `number "1000.24" card="1000.24"
      cell="1.000,24"`. The fourteenth pair still agreed, because `0` reads the same through either
      path — which is how a check written on one value could have missed the entire defect.
      **A second arm is red and declared.** When the column holds text or a non-finite number the two
      sides disagree: `12 pairs compared, 10 disagreements`, worst `number "1.000,24"
      card="1.000,24" cell="1"`. Cause, control and why it is declared rather than fixed: LOG.
- [x] A currency column carries its symbol and separators. **`card renders "€\u00A01.000,24" for
      1000.24`.** Asserted as a literal on purpose: comparing the renderer against its own formatter
      stays true however that formatter is rewritten, so it cannot answer whether the output is the
      Dutch currency form at all. Before, and reproduced exactly as the negative control by removing
      the branch: `card renders "1000.24"` — the operator's own report.
- [x] Bar and ring display styles are unaffected: **`1 bar elements on the rendered field, want 1`
      and `0 text nodes carry "1.234,5", want 0`** — both counts, both styles. The probe value is
      chosen so the grouped form and the raw form differ, because the bar labels itself `1234.5`
      through its own formatter and at a value where the two forms match the second count is green
      against any implementation whatsoever. Observed red first: dropping the early return after the
      bar renderer takes the element count to `0` and the text count to `1`. The second control is
      the one that earns the split — appending rather than assigning leaves `1 bar elements`
      **passing** while the text count reports `1 text nodes carry "1.234,5"` against text nodes
      `"Amount", "1234.5", "1.234,5"`. That is a formatted string sitting beside the bar, and the
      element count alone reported it green.
- [x] A non-finite value renders the placeholder, never a formatted `NaN`. **Now exercised for all
      three formatters against `NaN`, `+Infinity` and `-Infinity`.** Observed red first: removing the
      guard from `formatEuroCurrency` fails with `expected '€ NaN' to be '-'`. Restored, green.
- [x] `formatEuroNumber`, `formatEuroNumber2` and `formatEuroCurrency` each have a grouped value, a
      decimal value and a non-finite value asserted. Before: **zero tests**, grepped repository-wide,
      against five calling surfaces. Now `src/data/euro-format.test.ts`, 6 tests, exit 0, with the
      six-digit cell ceiling separated from the two-digit summary one so a swapped import fails in
      the suite rather than as a footer disagreeing with its own column. Negative control: swapping
      the locale to `en-US` fails 4 assertions on the separator reversal — `'1,000,000'` against
      `'1.000.000'`, `'1.234567'` against `'1,234567'`.
- [ ] The scope exclusion is settled in writing, either way.
- [ ] The operator sees the same euro figure on a card and in the table row behind it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Five of seven criteria now carry an observed number.** What remains is not measurement: the scope
exclusion is an operator decision, and the last one is the operator seeing the same figure on a card
and in the row behind it, which under the parent `spec.md` §6 is the only thing that closes a phase.

The parity check found a second divergence the moment it existed, in the direction nobody was
looking. It is declared, not fixed — see below.

### Why the missing tests are P1 and not optional

Five surfaces render every number in the plugin through three untested functions. A locale change, a
rounding change, or an `Intl` option typo would alter every figure the operator sees and break no
check.

### It crosses a written scope exclusion, and that is not resolved

The parent `spec.md` §2 excludes "output number format" as remaining on the earlier track, and this
work changed output number format inside this program. Either the exclusion means the formula
editor's number format and the parent should say so, or this belongs elsewhere. Recorded, not
decided.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Card renderer wired to the formatter | Shipped | Eleven added lines in `card-field-renderer.ts` |
| Parity check | Exists, green on numbers | `verify-placement`: `14 pairs compared across number and currency columns, 0 disagreements`. Both sides built from the shipped modules against one record |
| Parity on text and non-finite values | Red, declared | `12 pairs compared, 10 disagreements`. Declared in the harness `KNOWN` map so the number stays visible and an unexpected pass reports itself |
| Bar and ring counts | Green, both counts, both styles | `1 bar elements ... want 1` and `0 text nodes carry "1.234,5", want 0` |
| Formatter tests | Exist | `src/data/euro-format.test.ts`, 6 tests, exit 0 |
| Harness total | 218/223, 5 red for a declared reason | Was 212/216 with 4. Seven checks added, one of them the new declared red |
| Gate | 16 green, exit 0 | Read from `$?` directly, not through a pipe |
| Scope question | Open | `spec.md` §7 states both readings |

### Deviations and findings

| Item | Note |
|------|------|
| Opened after the code shipped | One of two orphans this program found; `roadmap.md` §6 |
| Every coverage cell blank | Was six criteria with no negative control recorded. Five now carry one; AC-5 is an operator decision and has none to carry |
| The card and the cell coerce a stored value differently | Found by the parity check on its first run, which is the entire argument for the check. The card reads the whole string and treats a partial number as text, printing it unchanged; the cell reads the numeric prefix, formats whatever it found, and shows the placeholder only when there is none. A field holding the Dutch text `1.000,24` renders as that text on the card and as `1` in the row behind it — **worse than the reported defect**, because the row silently drops three digits rather than merely looking unformatted. Declared rather than repaired: the card is not this phase's scope, and choosing which coercion wins is a data decision about what a numeric column may hold, not a formatting one. The control proves it is closeable: aligning the coercion and the fallback takes it to `0 disagreements` and the harness then reports an unexpected pass, which is the signal to remove the declaration |
| D2's factual tail was stale and has been rewritten | D2 reads "Every row here is Unmet, including the ones whose code is already in the tree." Five rows are now Met. The **principle** — that shipping a diff does not close a criterion — is exactly what this phase followed, and it still holds. Only the count inside it has moved. Rewritten to state the principle without the count, which is what made it go stale. The contradiction was escalated rather than silently edited, which is why it got fixed at the right level |
<!-- /ANCHOR:log -->
