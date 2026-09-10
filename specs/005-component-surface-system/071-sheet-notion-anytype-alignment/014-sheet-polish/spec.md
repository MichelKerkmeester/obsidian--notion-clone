---
title: "Feature Specification: Phase 14: Sheet Polish"
description: "The P3 residue of the sheet-notion audit, gathered into one packet so it neither scatters across six others nor gets promoted past its weight."
trigger_phrases:
  - "071 phase 14"
  - "sheet polish"
  - "icon picker remove header"
  - "add affordance full width row"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 14: Sheet Polish

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

`../sheet-notion-audit.md` §4 counts **13** P3 findings against 16 P1 and 26 P2. This packet exists so those 13 neither scatter into the six packets above — where they would compete with real defects for a reviewer's attention — nor get promoted past their weight. Nothing here is something a user reported. Each item is a consistency gap the audit measured.\n\n**Two items carry work.** The icon picker builds `Remove`, `Random` and a settings button into the same header div as its search field (`icon-picker-popover.ts:141-151`); Notion promotes `Remove` to the sheet header's top-left and leaves the search row to the filter field and its two adjacent affordances (`screenshots/notion/ios/sheets/notion-ios-sheets-icon-picker-01-0c4e7197-170b-44d6-adea-534219b9dd35.webp`). And two sheets render their add affordances as side-by-side button pairs — `+ Add property` beside `+ File property` at `column-manager-renderer.ts:117-137` — where Notion and every other add in the app read as a full-width row.\n\n**The rest of the P3 count is recorded rather than worked**, and two entries are worth stating because they are findings of *convergence*, which are as useful as findings of drift. The **option colour picker is already Notion's control**: `option-color-picker.ts:76-89` builds a single-column list of rows carrying a colour dot, a translated name and a checkmark for the current value, and Notion's `flows/adding-a-conditional-color/notion-ios-flow-adding-a-conditional-color-06-*.webp` is the same list. And the **column-width sheet has no Notion reference at all** — Notion's iOS app exposes no per-column width — so no delta can be stated where no reference exists.

**Key Decisions**: This packet is ordered **last**. If budget runs short it is the one to drop, and dropping it costs no P1 or P2 row. If promoting the icon picker's `Remove` into the sheet header would require changing `createSheetHeader`, that change is out of scope and the item is recorded Proposed instead — the same boundary `007` REQ-006 draws around the shared header builder. No numeric target is derived from a Notion asset.

**Critical Dependencies**: None blocking. Best landed after `009`, whose add-affordance change shares a producer. The audit's §3.1, §3.6, §3.7, §3.13 and §0.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P3 |
| **Status** | Implemented — landed, awaiting the operator's device read (D3) |
| **Created** | 2026-09-09 |
| **Branch** | `worktrees/272-sheet-notion-audit` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 14** of the Sheet family alignment to Notion x Anytype specification, opened by
`../sheet-notion-audit.md` under the operator's 2026-09-09 ~22:30 ruling — *"Check more sheets
align closer to notion, input, content, wise etc"*, *"Ui improvement is focus here"*.

**Scope Boundary**: The icon picker's header composition (`src/views/icon-picker-popover.ts`) and the add-affordance layout on the properties and record sheets. Not the shared `createSheetHeader` builder, not the colour picker, and not the column-width sheet.

**Dependencies**: None blocking. Best landed after `009`, whose add-affordance change shares a producer. The audit's §3.1, §3.6, §3.7, §3.13 and §0.

**Deliverables**: an icon-picker search row carrying only its search affordances, full-width add rows on two sheets, and the audit's convergence findings recorded so a later pass does not re-audit them.

**Changelog**: When this phase closes, add an entry to `../changelog/` named
`071-014-sheet-polish.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
P3 findings have two failure modes and this packet avoids both. Folded into a P1 packet, they dilute its review and give a reviewer reason to argue about a button's position while a truncated label ships. Left unrecorded, they are re-discovered by the next audit, which spends its budget re-deriving what this one already measured. Gathering them here keeps the P1 packets clean and keeps the findings.

### Purpose
The audit's P3 residue is closed or recorded in one place: the two items that carry work are done, the convergence findings are written down so they are not re-audited, and the surfaces that have no reference are named as such rather than left looking unexamined.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The icon picker's search-row composition: today `Remove`, `Random` and a settings button share it
- The add-affordance layout on the properties and record sheets: today side-by-side button pairs
- Recording the audit's convergence findings — the colour picker, the column-width sheet — so they are not re-audited
- Lane assertions for the two items that carry work, RED before GREEN

### Out of Scope
- The shared `createSheetHeader` builder — if promoting `Remove` needs it, the item becomes Proposed instead. Same boundary as `007` REQ-006
- The option colour picker — **converged**, recorded in §13, no work
- The column-width sheet — **no Notion reference exists**, recorded in §13, no work
- The icon picker's search placeholder — copy, and ours is clearer than Notion's `Filter...`; `010` owns copy anyway
- Card grouping in the menus — deferred to `007`, audit §6 ADR-A

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/views/icon-picker-popover.ts` | Modify | Take `Remove`, `Random` and the settings button off the search row |
| `src/views/column-manager-renderer.ts` | Modify | Add affordances as full-width rows rather than a side-by-side pair |
| `src/views/record-detail-panel.ts` | Modify | Same, if its add row shares the pattern |
| `styles.css` | Modify | Icon-picker header layout; full-width add-row layout |
| `tools/live/sheet-grammar.mjs` | Modify | Clauses for the two items that carry work (RED before GREEN) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read `../sheet-notion-audit.md` §0, §3.6 and §3.1 before any edit; every number in this packet is ours |
| REQ-002 | The icon picker's search row carries **0** of `Remove`, `Random` and the settings button among its siblings |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | The add affordances on the properties and record sheets each render as a full-width row, not as one of a side-by-side pair |
| REQ-004 | If promoting `Remove` to the sheet header would require changing the shared `createSheetHeader`, the builder is left untouched and the item is recorded Proposed in `decision-record.md` |
| REQ-005 | No regression on any landed sheet clause, both engines |
| REQ-006 | Recapture each changed surface phone-only, light and dark |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The icon picker's search row carries only its search affordances, measured by the lane
- **SC-002**: The add affordances render as full-width rows, measured by the lane
- **SC-003**: `createSheetHeader` is byte-identical unless the operator ruled otherwise
- **SC-004**: No regression on any landed sheet clause
- **SC-005**: The operator's own device read reports the polish items closed (D3 — no agent ticks this row)
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Promoting `Remove` into the sheet header touches `createSheetHeader`, which every phone sheet in the app uses | A P3 item acquires a whole-app blast radius | Hard boundary: if the header slot is needed, the item is recorded Proposed and the builder is not touched. `007` REQ-006 already draws this exact line around the same builder; T003 checks which case applies before any edit |
| Risk | The add-affordance change touches `column-manager-renderer.ts`, which `009` is also changing | Two packets on one producer | Land this packet **after** `009` — it is last in the implementation order anyway — and rebase before running its clauses |
| Risk | A P3 packet invites scope creep, since everything in it is discretionary | The packet grows past its weight and delays the P1 wave | The scope is closed: two items carry work, the rest are recorded. Adding an item requires an operator ruling, not a reviewer's preference |
| Dependency | `009-properties-sheet-row-model` | Shares a producer | Ordered after it; rebase before verifying |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

- Every change is presentational. No icon is chosen differently, no property is added differently, and every handler keeps its target.
- Touch targets stay at or above 44px; controls that leave a crowded row must not shrink on their new one.

## 8. EDGE CASES

- The `Reaction` variant of the icon picker carries no `Remove` at all (`notion-ios-sheets-icon-picker-05-*.webp` shows Notion's does not either); the clause must pass on a picker that has no `Remove` to place.
- A properties sheet whose schema supports no file property renders one add affordance rather than two; a single full-width row is the correct result, not a defect.
- If the operator rules that `Remove` stays on the search row, REQ-002 is Waived with that ruling recorded in the Waiver cell rather than silently dropped.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Low | Three producers, one stylesheet region, one lane file — each change small |
| Risk | Low | Discretionary work with a hard boundary at the shared header builder |
| Research | Low | The audit completed the reference and current-state reading |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| The `Remove` promotion pulls in `createSheetHeader` | Medium | Medium | Hard boundary; T003 checks first and records Proposed rather than editing the shared builder |
| Conflict with `009` on the properties producer | Medium | Low | Ordered last; rebase before verifying |
| Scope creep on a discretionary packet | Medium | Low | Scope is closed at two working items; additions need an operator ruling |

## 11. USER STORIES

- As the operator, I want the small inconsistencies recorded and closed in one place, so they neither clutter the packets fixing real defects nor get rediscovered by the next audit.

## 12. OPEN QUESTIONS

- Is the icon picker's `Remove` promoted to the sheet header, matching Notion, given that `createSheetHeader` is shared by every phone sheet and a header-slot change there is a whole-app change? Default: leave the builder alone and record Proposed.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Audit**: `../sheet-notion-audit.md` §3.6, §3.7, §3.13, §3.1, §4, §0
- **Predecessor**: `../009-properties-sheet-row-model/`

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE

**Reference**: `screenshots/notion/ios/sheets/notion-ios-sheets-icon-picker-01-0c4e7197-170b-44d6-adea-534219b9dd35.webp` and `-02-*.webp` (Page icon picker); `screenshots/notion/ios/flows/adding-a-conditional-color/notion-ios-flow-adding-a-conditional-color-06-fe308218-4a60-4b96-bbb5-212753e870a2.webp` (the colour list, recorded as converged).
**All Notion iOS captures in this repository are 299x678** (`sips`-confirmed over a 400-file sample
of all 1,315 files, and over all 171 files in the five folders this family leans on). The Notion
column below is therefore **structural only**; every number in the Target column is **ours**, from
`node tools/live/sheet-grammar.mjs`, from `styles.css` read directly, or from `src/i18n.ts` counted
directly — or it is marked `TBD` and listed in the audit's §5.

| Property | Current (ours, measured) | Notion (ref, observed structure) | Target |
|---|---|---|---|
| Icon picker search row | `Remove`, `Random` and a settings button share the header div with the search field (`icon-picker-popover.ts:141-151`) | `Remove` sits **top-left in the sheet header**; `Page icon` centred; `Close` top-right. The search row carries the filter field and its two adjacent affordances only | **0** of the three share the search row. Structural, from Notion |
| Add affordance layout | `+ Add property` and `+ File property` as **two buttons on one line** (`column-manager-renderer.ts:117-137`) | `+ New property` as a **full-width row** | Full-width rows, not a side-by-side pair |
| Icon picker tabs | `Emoji` \| `Icons` | `Emoji` \| `Icons` \| `Upload` | **No change** — we have no upload; omitting it is correct |
| Icon picker sections | `Recent`, then category sections (`:211-220`) | `Recent`, then category sections | **No change** — already converged |
| Icon picker search placeholder | `Search icons and emoji` | `Filter...` | **No change** — ours is clearer; and copy is `010`'s scope |
| Icon picker colour affordance | A colour dot row (`:161-166`) | A swatch popover with an `Ask every time` toggle | **No change** — converged in substance |
| Option colour picker | A single-column list: colour dot + translated name + checkmark for the current value (`option-color-picker.ts:76-89`) | A single-column list: swatch + colour name + trailing checkmark on the selection | **No change — CONVERGED.** Recorded so a later pass does not re-audit it |
| Column-width sheet | Title row, slider + numeric input, a 4-button preset group (`column-width.ts:352-424`) | **No corresponding screen exists in the harvest.** Notion's iOS app exposes no per-column width | **No delta can be stated** — no reference exists. Recorded so a later pass does not re-search for one |
| Column-width frame | Classified `floating`: 8px insets, 16px radii (lane) — the only sheet in the app so classified | Not applicable | **No change** — deliberate, and proven by its own frame-shape assertion |
| Menu card grouping | Rows with separators and section headings | Rows grouped into 5-6 rounded cards on a canvas | **Deferred to `007`** — audit §6 ADR-A. No task here |
| Menu destructive rows | `is-warning` red (`styles.css:813`), 3 producers | Red, last in its card | **No change** — already converged |

**Landed, 2026-09-10** (this packet): the two carried rows — the icon picker's search row now
 carries the tabs and the search field alone, with `Remove`, `Random` and the settings button on
 their own 44px action row beneath it (lane: 3 strays → 0; the `Remove`-into-header promotion
 recorded Proposed in `decision-record.md`); the properties and record sheets' add affordances
 are full-width 44px rows (lane: 17% / 23% / 22% → 100% / 92% / 92% of their rows). The
 convergence rows above are carried forward verbatim in `implementation-summary.md` so the next
 audit does not re-derive them: the option colour picker is already Notion's control, and the
 column-width sheet has no Notion reference at all.
<!-- /ANCHOR:gap-table -->
