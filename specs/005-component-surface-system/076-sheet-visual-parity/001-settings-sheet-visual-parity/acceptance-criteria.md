---
title: "Acceptance Criteria: Settings Sheet Visual Parity"
description: "The criteria this phase must satisfy before it may be closed: nine lane thresholds each carrying its failing value, the two judge passes, and the operator row no agent ticks."
trigger_phrases:
  - "acceptance criteria"
  - "001-settings-sheet-visual-parity acceptance criteria"
  - "001 rubric thresholds"
  - "001 failing values"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Settings Sheet Visual Parity

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/001-settings-sheet-visual-parity
**Level:** 2
**Status:** DEFINE and PLAN complete — CREATE not started
**Date:** 2026-09-10
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

Every row below states the threshold **and the value that fails it today**, measured this session
off `screenshots/notion-clone/panels/constructed-view-config-mobile-{light,dark}.png` and off the
producer that painted them. A criterion without a failing value is a criterion nobody can tell has
been met.

| AC-ID | REQ | Given / When / Then | Failing value today | Verification | Status | Waiver |
|-------|-----|---------------------|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the 299×678 ceiling, When any target is written, Then every numeric cell is traceable to our own measurement or is marked provisional with the operator capture that settles it | n/a | `spec.md` §13.12 — 17 provisionals, each with **OC-S1** or **OC-S2** named | **Met** | - |
| AC-002 | REQ-002 | Given the sheet's grammar, When the surfaces are enumerated, Then every production producer painting it is listed and the scenario is proven to mount production link by link | n/a | `spec.md` §3; `plan.md` §3.2 — harness branch `:3412`, renderer call `:3475`, provenance `:3477` | **Met** | - |
| AC-003 | REQ-003 | Given each of L1-L9, When it is added, Then its failing number is recorded before the producer moves and its passing number after | all nine unwritten | `tasks.md` T002; `verification.md` RED/GREEN pairs | Unmet | - |
| AC-004 | REQ-004 | Given our phone capture and R-1/R-4/R-5, When a reviewer scores the eight-row rubric, Then the total is **≥ 14/16** with **no row at 0** | not yet judged; `plan.md` §3.5 predicts **15/16** | `verification.md`, score table #1 | Unmet | - |
| AC-005 | REQ-004 | Given an **unchanged tree**, When the reviewer scores it a second time, Then it passes again at the same thresholds | — | `verification.md`, score table #2, tree hash recorded on both | Unmet | - |
| AC-006 | REQ-005 | Given the change, When recaptured at the phone viewport, Then light and dark are both current and both were opened and looked at | — | `npm run screenshots:verify` 0 stale; `tasks.md` T012 | Unmet | - |
| AC-007 | REQ-006 | Given the change, When the `071` clauses re-run unchanged in the same invocation, Then they still pass | green today | Lane exit 0, same run as AC-003 | Unmet | - |
| AC-008 | REQ-007 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report it aligned | — | Operator's own device read (D5) — **no agent ticks this row** | Unmet | - |
| AC-009 | REQ-003 | **L1** — the body renders **≥ 5** cards, each radius `≥ 8px`, each consecutive gap `≥ 8px` | **1 card** | Lane clause L1 | Unmet | - |
| AC-010 | REQ-003 | **L2** — **0** bordered `input[type=text]` and **0** `textarea` in the sheet body | **≥ 4** rendered; **14** input/textarea constructions in the producer (`grep -c`) | Lane clause L2 | Unmet | - |
| AC-011 | REQ-003 | **L3** — **≥ 13** rows carry leading icon **and** right-aligned value on the label's line **and** chevron, each `≥ 44px` | **0** | Lane clause L3 | Unmet | - |
| AC-012 | REQ-003 | **L4** — **0** icon-only buttons in the sheet body | **≥ 3** (the Source-rules `+` / folder-plus / `>_` strip) | Lane clause L4 | Unmet | - |
| AC-013 | REQ-003 | **L5** — no text run over **80** characters, in all three locales | longest reaching this sheet is **147** (`viewConfig.sourceRules.help`); **5** EN keys exceed 80 — 147 / 141 / 129 / 128 / 107 | Lane clause L5 | Unmet | - |
| AC-014 | REQ-003 | **L6** — the card band's luminance exceeds the canvas's in **both** themes | light `rgb(255,255,255)` on `rgb(242,242,242)` = **+13**, correct; dark `rgb(30,30,30)` on `rgb(46,46,46)` = **−16**, **inverted** | Lane clause L6 | Unmet | - |
| AC-015 | REQ-003 | **L7** — the section heading computes `text-transform: none`, `letter-spacing: normal`, `font-weight ≤ 500` | `uppercase` / `0.04em` / `700` / 11px (`styles.css:24220-24231`) | Lane clause L7 | Unmet | - |
| AC-016 | REQ-003 | **L8** — the last card carries `obnotion-settings-card-footer` and none of its rows has a chevron or a trailing value | no footer card exists | Lane clause L8 | Unmet | - |
| AC-017 | REQ-003 | **L9** — the landed stack-row width clause **errors on an empty set** rather than passing vacuously | passes on a non-empty set today; goes vacuous the moment AC-010 lands | Lane clause L9, proven by emptying the set | Unmet | - |

### The rubric AC-004 and AC-005 score

Eight rows, **0 / 1 / 2** each, maximum **16**. Defined in `../spec.md` §5; instanced for this
sheet in `plan.md` §3.5.

| Row | What it scores | Target here |
|---|---|---|
| Frame | Canvas colour token, corner radius, handle, header layout | **1** — the trailing control is `✕` where the reference has `Done`; held as **ADR-I** |
| Sections | Which groups exist, in what order, separated how | 2 |
| Row anatomy | Leading icon, label, trailing element, and their order | 2 |
| Controls | Control kind and affordance — an input where the reference navigates scores 0 | 2 |
| Type | Scale and weight hierarchy | 2 |
| Spacing | Pitch, inset and gaps | 2 |
| Colour | Text, secondary, divider and accent | 2 |
| Both themes | Light and dark each internally consistent and structurally matched | 2 |

**Pass: total ≥ 14 AND no row at 0.** A 13 fails with seven 2s. Any 0 fails at any total.
**Planned total: 15/16.** A *Frame* of 1 is expected while ADR-I is open and is not a remediation
trigger; any other row below 2 is.

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by another criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** no — 15 of 17 rows are Unmet and CREATE has not started. AC-001 and AC-002 are Met on
the DEFINE and PLAN work recorded in `spec.md` §13 and `plan.md` §3.2.

When the rest are reached, **AC-008 is the one that stays open**: the operator's own device read,
which no agent ticks. **AC-005 is the row that most often blocks closure**, because it needs the
judge to pass a *second* time on a tree nothing has touched since the first — a re-judge after a fix
is a new iteration, not the second pass, and the tree hash on each pass is what tells them apart.

**AC-017 is the quiet one.** AC-010 empties the row set a landed `071` clause measures, so without
L9 that clause would report clean on zero rows and a real regression would land green. It is the
same failure `spec-tree-layout.md` §2 records in `scan-failing-values.mjs`.
<!-- /ANCHOR:closure -->
