---
title: "Feature Specification: Phase 12: Sort and Group Sheet Rows"
description: "The sort sheet gives a rule one row carrying five controls where Notion gives it two rows and a labelled Delete, and the group sheet has no Shown/Hidden partition and no bulk action on its section header."
trigger_phrases:
  - "071 phase 12"
  - "sort sheet rule rows"
  - "group sheet shown hidden"
  - "sort reorder arrows drag handle"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 12: Sort and Group Sheet Rows

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

`../sheet-notion-audit.md` §3.10 and §3.11 read the sort and group sheets as the milder half of the panel-sheet family. Their labels fit — which is exactly why they are P2 and the filter sheet is P1 — but their row models are still Notion's inverted.\n\n**Sort.** `sort-panel-renderer.ts:182-246` builds each rule as one row carrying a `⋮⋮` drag handle, an up arrow, a down arrow, a field dropdown, a direction dropdown and a `×`. Notion gives the same rule **two rows in one card** — a property row with a chevron, a direction row indented beneath it — followed by a red, labelled **`Delete`** (`screenshots/notion/ios/database/notion-ios-database-sort-01-*.webp`, `-02-*.webp`, five frames of `flows/sorting-a-database/`). Two facts about ours are worth separating. The `×` glyph's hit area is **already** expanded past 44px by `styles.css:13820`'s `::before`, so replacing it with a labelled row is a legibility change and **must not be justified as a touch-target fix**. And the sheet carries **two** reorder affordances on one row — the drag handle and the arrow pair — where Notion's group sheet shows a 6-dot grip alone; no capture shows a Notion sort rule being reordered at all, so which of ours survives is a question this packet measures rather than assumes.\n\n**Group.** The lane measures 17/17 rows at 44.0px and **1** section heading. Notion's group sheet carries a **`Groups`** section header with a **`Hide all`** link on its own line, per-group rows of grip + name + eye, and — at sub-group level — a split into **`Visible groups`** and **`Hidden groups`** with `Hide all` and `Show all` (`flows/grouping-a-database/notion-ios-flow-grouping-a-database-03-*.webp`, `flows/group-2/notion-ios-flow-group-2-02..04-*.webp`). That is the same shown/hidden partition `009` gives the properties sheet and the record sheet already has.

**Key Decisions**: Row pitch, panel padding, divider grammar and the native-select count are regression-checked, not re-designed — `005` converged them and the lane proves them. The reorder question is **not** pre-decided: T004 measures both affordances and the packet records the choice with its evidence. The `×` replacement is legibility, not touch-target. No numeric target is derived from a Notion asset.

**Critical Dependencies**: `005-filter-sort-group-sheets`'s landed grammar (unchanged, regression-checked); `009`'s shown/hidden vocabulary; the audit's §3.10, §3.11 and §0.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P2 |
| **Status** | Implemented — the operator's device read (AC-010) outstanding |
| **Created** | 2026-09-09 |
| **Branch** | `worktrees/278-sort-group-rows` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 12** of the Sheet family alignment to Notion x Anytype specification, opened by
`../sheet-notion-audit.md` under the operator's 2026-09-09 ~22:30 ruling — *"Check more sheets
align closer to notion, input, content, wise etc"*, *"Ui improvement is focus here"*.

**Scope Boundary**: The sort sheet's rule-row layout and reorder control set (`src/views/sort-panel-renderer.ts`), and the group sheet's section partition and per-group row control set (`src/views/toolbar-renderer.ts`'s group builder). Not the sort or group semantics, not the group-order vocabulary, and not the row pitch or divider grammar `005` converged.

**Dependencies**: `005-filter-sort-group-sheets`'s landed grammar (unchanged, regression-checked); `009`'s shown/hidden vocabulary; the audit's §3.10, §3.11 and §0.

**Deliverables**: a two-row sort rule with a labelled destructive delete, one reorder affordance with its choice evidenced, a Shown/Hidden group partition with header-level bulk actions, and a lane clause for each — every one RED before GREEN.

**Changelog**: When this phase closes, add an entry to `../changelog/` named
`071-012-sort-and-group-sheet-rows.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Both sheets pass every clause they have. The lane proves sort's 2/2 rows at 48px, its 16.0px row inset, its 357px span and its 0 native selects; group's 17/17 rows at 44px, its 16px padding and its single section heading. No clause counts the controls on a row, notices that two reorder mechanisms ship side by side, or asks whether a list of groups says which are hidden. That is the audit's §1 Mechanism A on two more surfaces.

### Purpose
A sort rule reads as its property and its direction, each on its own row, with a delete that says what it does; the sheet offers one way to reorder rather than two; and the group sheet tells the user which groups are shown and which are hidden, in the same words the properties and record sheets use.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The sort rule's row model: today one row of five controls, target two rows with a labelled delete
- The sort sheet's reorder affordance count: today two, target one, with the choice evidenced
- The `sortPanel.calendarHint` paragraph rendered in the sheet body
- The group sheet's Shown / Hidden partition and its header-level bulk actions
- The group row's interactive control count
- Lane assertions for each of the above, RED before GREEN

### Out of Scope
- Sort and group semantics, and the `groupOrder.*` vocabulary — behaviour is unchanged
- Row pitch, panel padding, divider grammar, native-select count — `005` converged them; regression-checked here
- The `×` glyph's touch target — already ≥44px via `styles.css:13820`; this packet must not claim to fix it
- Card grouping / canvas backgrounds — owned by `007`, audit §6 ADR-A
- Empty-state copy — owned by `010-sheet-copy-touch-idiom`

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/views/sort-panel-renderer.ts` | Modify | Two-row rule model; labelled destructive delete; one reorder affordance |
| `src/views/toolbar-renderer.ts` | Modify | The group sheet's Shown/Hidden partition and header-level bulk actions |
| `styles.css` | Modify | The stacked rule block; the group section header with its bulk-action link |
| `tools/live/sheet-grammar.mjs` | Modify | Clauses: rule rows, controls-per-row, reorder count, sheet-body prose length, group partition (RED before GREEN) |
| `src/views/sort-panel-renderer.test.ts` | Modify | Revert-proof unit test for the rule-row contract |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read `../sheet-notion-audit.md` §0, §3.10 and §3.11 before writing any assertion; no numeric target may be derived from a Notion asset |
| REQ-002 | A sort rule renders its property and direction on **2** rows, and no rule row carries more than **4** interactive controls (today: 1 row, 5 controls) |
| REQ-003 | The sort sheet carries exactly **one** reorder affordance (today: 2 — a `⋮⋮` drag handle and an up/down arrow pair), and the choice is recorded with the evidence behind it |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | A sort rule's delete is a labelled destructive row carrying `is-warning`; **0** `×` glyphs remain on a rule row |
| REQ-005 | When at least one group is hidden, the group sheet renders a Shown section and a Hidden section, each header carrying its own bulk action |
| REQ-006 | No group row carries more than **4** interactive controls |
| REQ-007 | Sheet-body prose runs at most **80** characters, or moves behind an info affordance (today: `sortPanel.calendarHint` is 150) |
| REQ-008 | No regression on `005`'s sort and group clauses on both engines |
| REQ-009 | Recapture both sheets phone-only, light and dark, and record a measured before/after against §13 |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A sort rule renders on 2 rows with ≤4 interactive controls, measured by the lane
- **SC-002**: The sort sheet carries one reorder affordance, measured by the lane, with the choice evidenced
- **SC-003**: The group sheet partitions into Shown and Hidden with bulk actions, measured by the lane
- **SC-004**: No regression on `005`'s clauses
- **SC-005**: The operator's own device read reports both sheets aligned (D3 — no agent ticks this row)
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Removing one reorder affordance removes a working path for whoever uses it | A user who reorders by arrows loses the arrows, or vice versa | T004 measures both against the touch floor and against keyboard reachability before either is removed; the arrows are the accessible path on a keyboard, so if the grip wins, keyboard reorder must survive by another route. Record which, and why |
| Risk | The sort and group builders share row primitives with the filter sheet, which `008` is also changing | Two packets touching one primitive can each pass alone and conflict merged | Implement `008` first (the audit's stated order), then rebase this packet onto it and rerun both packets' clauses together before closing. T009 is that check |
| Risk | Stacking the sort rule makes the sheet taller | A many-rule sort could exceed the 90svH cap | The sheet already scrolls; T007 confirms the cap and the keyboard inset hold with a 5-rule sort mounted |
| Dependency | `009`'s shown/hidden vocabulary | The group partition should reuse the same four strings rather than inventing group-specific ones | If `009` has not landed, reuse `panel.shownSection` / `panel.hiddenSection` directly — they already ship and are already consumed by `record-detail-panel.ts:222-226` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

- The change is presentational. No sort evaluates differently, no group is computed differently, and every existing handler keeps its target.
- Touch targets stay at or above 44px, and the keyboard path to reordering a rule survives whichever affordance is chosen.

## 8. EDGE CASES

- A single sort rule cannot be reordered; the reorder affordance renders inert rather than absent, so the row's geometry does not change between one rule and two.
- A calendar view's sort carries `sortPanel.calendarHint`; if the hint moves behind an info affordance, the affordance must be reachable on the phone, not hover-only.
- A database with no hidden groups renders one section, not two — the partition applies when at least one group is hidden.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Medium | Two producers, one stylesheet region, one lane file, one unit test |
| Risk | Medium | Shares row primitives with the filter sheet, which `008` changes in the same wave |
| Research | Low | The audit completed the reference and current-state reading |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Removing a reorder affordance breaks the keyboard path | Medium | High | T004 measures keyboard reachability before removal; the surviving affordance must carry it |
| `008` and this packet conflict on a shared primitive | Medium | Medium | Land `008` first, rebase, then rerun both packets' clauses together (T009) |
| Stacked rules exceed the height cap | Low | Medium | T007 checks the 90svH cap and the keyboard inset with 5 rules mounted |

## 11. USER STORIES

- As the operator, I want a sort rule to say which property it sorts and which direction, on rows I can read, with a delete that says Delete.

## 12. OPEN QUESTIONS

- Which reorder affordance survives — the `⋮⋮` drag handle or the ↑↓ arrow pair? Notion's group sheet uses a 6-dot grip alone, but **no capture shows a Notion sort rule being reordered** (audit §5 C-4), so this is measured rather than inherited.
- Does the group partition reuse `panel.shownSection` / `panel.hiddenSection`, or does a group need its own words?
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Audit**: `../sheet-notion-audit.md` §3.10, §3.11, §0
- **Predecessor**: `../005-filter-sort-group-sheets/`

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE

**Reference**: Sort — `screenshots/notion/ios/database/notion-ios-database-sort-01-*.webp`, `-02-*.webp`, and `screenshots/notion/ios/flows/sorting-a-database/notion-ios-flow-sorting-a-database-03..07-*.webp`. Group — `screenshots/notion/ios/flows/grouping-a-database/notion-ios-flow-grouping-a-database-02-*.webp`, `-03-*.webp`, `screenshots/notion/ios/flows/group-2/notion-ios-flow-group-2-02..04-*.webp`, `screenshots/notion/ios/database/notion-ios-database-group-by-13-*.webp`.
**All Notion iOS captures in this repository are 299x678** (`sips`-confirmed over a 400-file sample
of all 1,315 files, and over all 171 files in the five folders this family leans on). The Notion
column below is therefore **structural only**; every number in the Target column is **ours**, from
`node tools/live/sheet-grammar.mjs`, from `styles.css` read directly, or from `src/i18n.ts` counted
directly — or it is marked `TBD` and listed in the audit's §5.

| Property | Current (ours, measured) | Notion (ref, observed structure) | Target |
|---|---|---|---|
| Sort rule row model | **1** row carrying **5** controls: `⋮⋮`, ↑, ↓, field dropdown, direction dropdown, `×` (`sort-panel-renderer.ts:182-246`) | **2** rows in one card — property (chevron), direction indented (chevron) — then a red labelled `Delete` | **2** rows; **≤4** interactive controls per row |
| Sort rule delete | A `×` text glyph (`:246`) | A red, labelled **`Delete`** row with a trash icon | A labelled destructive row carrying `is-warning`; 0 `×` glyphs on a rule row |
| Sort reorder affordance | **2** — a `⋮⋮` drag handle **and** an up/down arrow pair (`:182-205`) | Notion's group sheet uses a 6-dot grip alone; **no capture shows a Notion sort rule being reordered** | **1**, with the choice recorded and evidenced. `TBD` which — audit §5 C-4 |
| Sort direction control | A dropdown field, plugin's own picker (0 native selects) | A custom sheet with exactly `Ascending` / `Descending` and a `Done` | **Control type already converged**; only the row placement moves |
| Sheet-body prose | `sortPanel.calendarHint`, **150 characters** (`:124`) | No Notion sheet in the harvest carries prose of that length | **≤80** characters, or behind an info affordance. Ours |
| Group section partition | **1** section heading, no bulk action (lane) | A `Groups` header with a `Hide all` link on its own line; at sub-group level a split into `Visible groups` / `Hidden groups` with `Hide all` and `Show all` | ≥2 sections when ≥1 group is hidden; a bulk action on each header |
| Group row controls | 17/17 rows at 44.0px; control count unasserted | grip + name + eye = **3** | **≤4** interactive controls per group row |
| Sort row pitch | **2/2** at 48px, inside the 44-52 band (lane) | Not measurable at 299x678 | **No change** — regression-checked |
| Group row pitch | **17/17** at 44px (lane) | Not measurable | **No change** — regression-checked |
| Panel padding | **16px / 16px** on both sheets (lane) | Not measurable | **No change** |
| Sort row inset | **16.0px** (lane) | Not measurable | **No change** — and it is the reference `008` brings the filter sheet to |
| Native selects | **0** on both | Notion uses no native pickers either | **No change** — already converged |
| Empty-state copy | `panel.emptySorts`, a pointer-gesture string | Notion names no pointer gesture anywhere | Owned by `010-sheet-copy-touch-idiom`, not this packet |
<!-- /ANCHOR:gap-table -->
