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
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored; the code shipped and every criterion is still Unmet"
    next_safe_action: "Write the formatter tests, then add the card-versus-cell parity check"
    blockers:
      - "Crosses a written scope exclusion in the parent spec; unresolved"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-019-goal"
      parent_session_id: null
    completion_pct: 30
    open_questions:
      - "Does the parent scope exclusion mean the formula editor's number format"
    answered_questions: []
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
| D2 | The code shipping does not make a criterion Met. Every row here is Unmet, including the ones whose code is already in the tree. |
| D3 | The formatters are pure functions with no DOM, which makes them the one subject in this program the unit suite can actually evidence. |
| D4 | Control-flow reading is not a measurement. It proves a branch is not reached; it cannot fail when a future edit reorders the returns. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] Card and cell agree, byte for byte, on every numeric column type, zero disagreements. Before:
      unmeasured and unmeasurable — no such check exists.
- [ ] A currency column carries its symbol and separators. Before: the raw JavaScript number via the
      default `String()` path — `1000.24`.
- [ ] Bar and ring display styles are unaffected: 1 bar/ring element present and 0 text nodes
      carrying a formatted numeric string, per style. The second count is the one that goes red if a
      formatted string ever appears **beside** the bar rather than instead of it.
- [ ] A non-finite value renders the placeholder, never a formatted `NaN`. Two guards, neither
      exercised.
- [ ] `formatEuroNumber`, `formatEuroNumber2` and `formatEuroCurrency` each have a grouped value, a
      decimal value and a non-finite value asserted. Before: **zero tests**, grepped repository-wide,
      against five calling surfaces.
- [ ] The scope exclusion is settled in writing, either way.
- [ ] The operator sees the same euro figure on a card and in the table row behind it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**The code shipped. None of it is evidenced.** Under the parent `spec.md` §6 that is the distinction
between shipped and verified, and this phase is at the first.

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
| Parity check | Does not exist | AC-2; the criterion that would have caught the defect |
| Formatter tests | Do not exist | Zero, grepped repository-wide |
| Scope question | Open | `spec.md` §7 states both readings |

### Deviations and findings

| Item | Note |
|------|------|
| Opened after the code shipped | One of two orphans this program found; `roadmap.md` §6 |
| Every coverage cell blank | Six criteria, no negative controls recorded. Under the parent doctrine a blank cell blocks closure |
<!-- /ANCHOR:log -->
