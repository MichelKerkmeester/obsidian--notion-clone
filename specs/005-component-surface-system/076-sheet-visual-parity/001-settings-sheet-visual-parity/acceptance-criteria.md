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
**Status:** CREATE landed, first judge pass 11/16 — frame-ruling remediation (D7) queued before re-judge
**Date:** 2026-09-10, remediation queued 2026-09-11
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
| AC-003 | REQ-003 | Given each of L1-L9, When it is added, Then its failing number is recorded before the producer moves and its passing number after | all nine unwritten | `tasks.md` T002; `verification.md` RED/GREEN pairs | **Met** | - |
| AC-004 | REQ-004 | Given our phone capture and R-1/R-4/R-5, When a reviewer scores the eight-row rubric, Then the total is **≥ 14/16** with **no row at 0** | First pass scored **11/16** against the 5-card shape (D7, `../decision-record.md`); the rubric itself has since been rewritten (`../spec.md` §5) to score a card container at 0 on Frame, so this pass is superseded by the frame-ruling remediation (`tasks.md`), not re-attempted as-is | `verification.md`, score table #1 | Unmet | - |
| AC-005 | REQ-004 | Given an **unchanged tree**, When the reviewer scores it a second time, Then it passes again at the same thresholds | — | `verification.md`, score table #2, tree hash recorded on both | Unmet | - |
| AC-006 | REQ-005 | Given the change, When recaptured at the phone viewport, Then light and dark are both current and both were opened and looked at | — | `npm run screenshots:verify` 0 stale; `tasks.md` T012 | **Met** | - |
| AC-007 | REQ-006 | Given the change, When the `071` clauses re-run unchanged in the same invocation, Then they still pass | green today | Lane exit 0, same run as AC-003 | **Met** | - |
| AC-008 | REQ-007 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report it aligned | — | Operator's own device read (D5) — **no agent ticks this row** | Unmet | - |
| AC-009 | REQ-003 | **L1 — superseded by D7, 2026-09-11.** The body renders **0** card containers under `.obnotion-view-config-body`, and **≥ 4** dividers separate the five groups | Shipped tree carries **5 card containers, 0 group dividers** (the shape this row previously certified as passing) | Lane clause L1, rewritten (`../spec.md` §13.11) | **Unmet — target superseded by D7** | - |
| AC-010 | REQ-003 | **L2** — **0** bordered `input[type=text]` and **0** `textarea` in the sheet body | **≥ 4** rendered; **14** input/textarea constructions in the producer (`grep -c`) | Lane clause L2 | **Met** | - |
| AC-011 | REQ-003 | **L3** — **≥ 13** rows carry leading icon **and** right-aligned value on the label's line **and** chevron, each `≥ 44px` | **0** | Lane clause L3 | **Met** | - |
| AC-012 | REQ-003 | **L4** — **0** icon-only buttons in the sheet body | **≥ 3** (the Source-rules `+` / folder-plus / `>_` strip) | Lane clause L4 | **Met** | - |
| AC-013 | REQ-003 | **L5** — no text run over **80** characters, in all three locales | longest reaching this sheet is **147** (`viewConfig.sourceRules.help`); **5** EN keys exceed 80 — 147 / 141 / 129 / 128 / 107 | Lane clause L5 | **Met** | - |
| AC-014 | REQ-003 | **L6 — superseded by D7, 2026-09-11.** **0** elements in the sheet body compute a background distinct from the sheet canvas, in **both** themes | Shipped tree carries 5 such elements per theme (the card fill this row previously scored on direction, light `+13`/dark `−16`) | Lane clause L6, rewritten (`../spec.md` §13.11) | **Unmet — target superseded by D7** | - |
| AC-015 | REQ-003 | **L7** — the section heading computes `text-transform: none`, `letter-spacing: normal`, `font-weight ≤ 500` | `uppercase` / `0.04em` / `700` / 11px (`styles.css:24220-24231`) | Lane clause L7 | **Met** | - |
| AC-016 | REQ-003 | **L8 — superseded by D7, 2026-09-11.** The last group carries **0** card wrapper and none of its rows has a chevron or a trailing value | Shipped tree carries 1 card wrapper (`obnotion-settings-card-footer`) | Lane clause L8, rewritten (`../spec.md` §13.11) | **Unmet — target superseded by D7** | - |
| AC-017 | REQ-003 | **L9** — the landed stack-row width clause **errors on an empty set** rather than passing vacuously | passes on a non-empty set today; unaffected by the frame-ruling remediation | Lane clause L9, proven by emptying the set | **Met** | - |
| AC-018 | REQ-003 | **L1 (D7 target)** — **0** card containers under `.obnotion-view-config-body`; **≥ 4** dividers separate the five groups | 5 card containers, 0 dividers | Lane clause L1 | **Unmet** | - |
| AC-019 | REQ-003 | **L6 (D7 target)** — **0** elements compute a background distinct from the sheet canvas, in **both** themes | 5 elements per theme | Lane clause L6 | **Unmet** | - |
| AC-020 | REQ-003 | **L8 (D7 target)** — the terminal group carries **0** card wrapper | 1 card wrapper | Lane clause L8 | **Unmet** | - |
| AC-021 | REQ-003 | **L10 (new)** — row label computes `font-weight ≤ 500`; leading icon computes in the 20-22pt range, at label ink colour | provisional, pending the shipped tree's own re-measurement (`tasks.md` T015) | Lane clause L10 | **Unmet** | - |
| AC-022 | REQ-003 | **Formula result storage (R09)** renders as a single navigation row (icon · label · value · chevron) opening a picker sheet with its three options as rows, not as an inline three-option segmented control | Shipped tree renders three stacked pill buttons inline, per the operator's settings-sheet screenshot | `tasks.md` T016 | **Unmet** | - |

### The rubric AC-004 and AC-005 score

Eight rows, **0 / 1 / 2** each, maximum **16**. Defined in `../spec.md` §5; instanced for this
sheet in `plan.md` §3.5.

| Row | What it scores | Target here |
|---|---|---|
| Frame | Rows on the plain sheet background with dividers, no card container (D7); canvas colour token, corner radius, handle, header layout | **1** — the trailing control is `✕` where the reference has `Done`; held as **ADR-I**. A card container anywhere scores this row **0** regardless of everything else (D7) |
| Sections | Same sections, same order, same heading-plus-divider separation — no card boundary (D7) | 2 |
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

**Closeable:** no — AC-004, AC-005, AC-008, AC-009, AC-014, AC-016 and AC-018 through AC-022 remain
Unmet (AC-009/014/016 carry targets superseded by D7 rather than the pre-remediation "Met", per
`../decision-record.md`). The first CREATE landed a card-grouped
sheet that scored 11/16 on its first judge pass; the operator then ruled the card container out
entirely (D7) and named typography defects on the same capture. `spec.md` §13 is rewritten to the
divider target and `tasks.md`'s `### Frame-ruling remediation (2026-09-11)` block (T015-T019) is
what carries the shipped tree there — none of it has run yet. AC-001 and AC-002 remain Met on the
DEFINE and PLAN work in `spec.md` §13 and `plan.md` §3.2. AC-010, AC-011, AC-012, AC-013, AC-015 and
AC-017 remain Met — the frame-ruling remediation does not touch the bordered-input, navigation-row,
icon-button, prose-length, heading-case or empty-set-guard clauses. What remains before AC-004/AC-005
can even be re-attempted is the remediation block; what remains after that is unchanged: the image
judge (twice consecutively) and the operator's own device read (AC-008), neither of which this leg
ticks.

When the rest are reached, **AC-008 is the one that stays open**: the operator's own device read,
which no agent ticks. **AC-005 is the row that most often blocks closure**, because it needs the
judge to pass a *second* time on a tree nothing has touched since the first — a re-judge after a fix
is a new iteration, not the second pass, and the tree hash on each pass is what tells them apart.

**AC-017 is the quiet one.** AC-010 empties the row set a landed `071` clause measures, so without
L9 that clause would report clean on zero rows and a real regression would land green. It is the
same failure `spec-tree-layout.md` §2 records in `scan-failing-values.mjs`.
<!-- /ANCHOR:closure -->
