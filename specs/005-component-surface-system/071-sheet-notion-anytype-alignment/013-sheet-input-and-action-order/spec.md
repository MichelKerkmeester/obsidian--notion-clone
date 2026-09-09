---
title: "Feature Specification: Phase 13: Sheet Input and Action Order"
description: "Four sheets present their inputs in the order the code built them rather than the order the action needs: add-view demands four settings before its create rows, the date picker puts three numeric text boxes ahead of the calendar, the confirm card renders Cancel above the destructive action, and the toolbar overflow menu mixes free-text fields among action rows."
trigger_phrases:
  - "071 phase 13"
  - "sheet input action order"
  - "confirm cancel above delete"
  - "date picker segments before calendar"
  - "add view name before create"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 13: Sheet Input and Action Order

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

The operator's ruling named *input* and *content* specifically. `../sheet-notion-audit.md` §3.4, §3.5, §3.12 and §3.14 find four sheets whose controls are correct individually and ordered wrongly as a sequence. All four deltas are **ordinal** — which element comes first — and an ordinal fact is exactly the kind that survives the 299x678 ceiling intact, so this packet's Notion column is unusually solid.\n\n**The confirm card is the sharpest and the smallest.** `061` converged its geometry and the lane proves all of it: centred, inset ≥16px on all four edges, 16px radii, actions `flex-direction: column`, every action ≥44px. What was never asserted is which of the two buttons comes first. `confirm-sheet.ts:93` creates the cancel button and `:107` the confirm button, so under a column layout **Cancel renders above the destructive action**. Notion puts the destructive action first in **four of four** captured stacked confirms. One-line producer change, one clause, no geometry consequence.\n\n**The date picker asks a phone user to type a date into three boxes.** `date-value-picker.ts:189-231` builds `YYYY`, `MM` and `DD` as separate maxlength-capped numeric inputs, ahead of the calendar grid, with `Clear` sitting as the fourth member of a Today / Tomorrow / Next week presets group. Notion's sheet is a tappable date field, then a calendar, then value rows, with `Clear` as a plain row at the bottom.\n\n**Add-view asks for four decisions before the action.** Name, view-key field, icon and a duplicate checkbox precede the type rows. Notion creates the view from a layout choice and lets you name it afterwards.\n\n**The toolbar overflow menu mixes free-text preset fields in among action rows** (`toolbar-renderer.ts:2540-2556`) — a shape no Notion menu in the harvest has.

**Key Decisions**: The confirm card's measured geometry is regression-checked, not re-designed — only the order of two children changes. The add-view name input keeps its **deliberate** absence of a placeholder; `toolbar-renderer.ts:1428-1430` records why, and Notion's use of one is not evidence against that reasoning. ADR-C (rows against tiles for the layout choice) is **not** resolved here and no task converts them. No numeric target is derived from a Notion asset.

**Critical Dependencies**: `061`'s landed confirm geometry and `005`/`004`'s landed row grammar (unchanged, regression-checked); the audit's §3.4, §3.5, §3.12, §3.14 and §0.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P2 |
| **Status** | Draft — scaffolded, not implemented |
| **Created** | 2026-09-09 |
| **Branch** | `worktrees/272-sheet-notion-audit` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 13** of the Sheet family alignment to Notion x Anytype specification, opened by
`../sheet-notion-audit.md` under the operator's 2026-09-09 ~22:30 ruling — *"Check more sheets
align closer to notion, input, content, wise etc"*, *"Ui improvement is focus here"*.

**Scope Boundary**: The DOM order of controls on four surfaces — the confirm body (`src/views/confirm-sheet.ts`), the date picker (`src/views/date-value-picker.ts`), the add-view popover and the toolbar overflow menu (`src/views/toolbar-renderer.ts`). Not any control's type, geometry, or behaviour, and not the layout-choice presentation.

**Dependencies**: `061`'s landed confirm geometry and `005`/`004`'s landed row grammar (unchanged, regression-checked); the audit's §3.4, §3.5, §3.12, §3.14 and §0.

**Deliverables**: four reordered surfaces, each with a lane clause asserting the order, and the regression proof that `061`'s confirm geometry and the surrounding row grammar still hold.

**Changelog**: When this phase closes, add an entry to `../changelog/` named
`071-013-sheet-input-and-action-order.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Each of these four sheets passes its clauses because its clauses measure geometry and control types. Order was never among them. The confirm card is the clearest case: `061` proved the card's inset, its radii, its stacking and its button heights red-then-green, and the one thing it did not check — which button is on top — is the one thing Notion is unambiguous about across four separate captures. A user reaching for the safe action on a phone finds the destructive one where Notion puts Cancel.

### Purpose
Each of the four sheets presents its controls in the order its action needs — the commit before the optional settings, the calendar before the typed fallback, the destructive action where Notion puts it, and free-text fields away from action rows — with a clause asserting the order so it cannot silently invert again.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The stacked confirm's action order: today Cancel first, target the destructive action first
- The date picker's DOM order: calendar before the numeric segment inputs; `Clear` out of the presets group
- The add-view sheet's DOM order: the create affordance before the optional settings
- The toolbar overflow menu's free-text preset inputs, today sharing a surface with action rows
- Lane clauses asserting each order, RED before GREEN

### Out of Scope
- The confirm card's geometry — `061` converged the inset, radii, stacking and 44/50px heights; regression-checked here, not re-targeted
- The add-view name input's absence of a placeholder — a documented local decision (`toolbar-renderer.ts:1428-1430`) that Notion does not overturn
- The layout choice's presentation as rows rather than tiles — audit §6 ADR-C, Proposed, **not resolved here**
- Notion's type-to-confirm and radio-choice confirm variants — features for objects we do not have
- `End date`, `Include time`, `Remind`, `Date format` and `Timezone` rows — features we lack, not alignment gaps
- Card grouping / canvas backgrounds — owned by `007`, audit §6 ADR-A

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/views/confirm-sheet.ts` | Modify | Emit the destructive action before cancel in the stacked variant |
| `src/views/date-value-picker.ts` | Modify | Calendar before the segment inputs; `Clear` out of the presets group |
| `src/views/toolbar-renderer.ts` | Modify | Add-view create affordance before its settings; move the preset text inputs off the menu surface |
| `styles.css` | Modify | Any ordering the producers express through layout rather than DOM position |
| `tools/live/sheet-grammar.mjs` | Modify | Order clauses for all four surfaces (RED before GREEN) |
| `src/views/confirm-sheet.test.ts` | Modify | Revert-proof unit test for the action order |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read `../sheet-notion-audit.md` §0, §3.4, §3.5, §3.12 and §3.14 before writing any assertion; every ordering target is an ordinal structural fact and every pixel number is ours |
| REQ-002 | In the stacked confirm, the destructive action is the **first** child of `.obnotion-modal-actions` and cancel is the **last** (today: inverted, `confirm-sheet.ts:93` before `:107`) |
| REQ-003 | No regression on `061`'s confirm geometry: inset ≥16px all four edges, 16px radii on all four corners, actions `flex-direction: column`, every action ≥44px |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | The date picker's calendar precedes its numeric segment inputs in DOM order |
| REQ-005 | `Clear` is not a member of the date picker's presets group (today: the fourth of four) |
| REQ-006 | The add-view sheet's create affordance precedes its optional settings in DOM order |
| REQ-007 | The add-view name input still carries **no** placeholder |
| REQ-008 | **0** free-text inputs share a surface with the toolbar overflow menu's action rows |
| REQ-009 | Recapture all four surfaces phone-only, light and dark, and record a measured before/after against §13 |

### P2 - Proposed, pending operator ruling

| ID | Requirement |
|----|-------------|
| REQ-010 | ADR-C: whether the layout choice becomes a grid of icon cards, matching Notion, or stays as rows — held Proposed (`../sheet-notion-audit.md` §6). **Default is rows.** No task converts them |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The stacked confirm puts the destructive action first, measured by the lane
- **SC-002**: The date picker's calendar precedes its segment inputs, measured by the lane
- **SC-003**: The add-view create affordance precedes its settings, measured by the lane
- **SC-004**: No free-text input shares the toolbar overflow menu's surface, measured by the lane
- **SC-005**: No regression on `061`'s confirm geometry or the surrounding row grammar
- **SC-006**: The operator's own device read reports the four sheets aligned (D3 — no agent ticks this row)
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Reversing the confirm's action order changes which button muscle memory reaches | A user who has learned the current order taps the wrong one once | This is the point of the change — the current order puts the destructive action where Notion and four of four captures put cancel. The destructive action keeps its `mod-warning` styling so it is distinguishable by colour, not only by position |
| Risk | The confirm body is shared by the production modal **and** by a live-lane probe that measures the same shape (`confirm-sheet.ts`'s own module comment) | A producer change could desync the probe | That is exactly why the builder is shared — both read the same function. Change the builder, not the probe; T007's clause runs against the real modal |
| Risk | Moving the date picker's calendar ahead of the segments changes focus order and may change which control the keyboard opens against | A phone keyboard could cover the calendar it now precedes | T005 measures the keyboard inset with the reordered sheet mounted, using the published `--obnotion-keyboard-inset` the placement loop writes per sheet |
| Risk | Moving the toolbar menu's preset inputs needs a destination | The presets could become unreachable | T006 lands the destination before removing the inputs from the menu, the same destination-before-source order `009` uses |
| Dependency | `061`'s landed confirm geometry | Must not regress | REQ-003, verified by rerunning `061`'s clauses unchanged |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

- Every change is a DOM-order change. No control changes type, no geometry moves, and no action does anything different when invoked.
- The destructive action stays visually distinguishable by its `mod-warning` styling, not by its position alone — so the reorder does not make the two buttons interchangeable at a glance.

## 8. EDGE CASES

- A confirm with a secondary action has three buttons; the destructive action is still first and cancel still last, with the secondary between them.
- A non-stacked confirm keeps the side-by-side, right-aligned footer every other modal uses — the reorder is scoped to the stacked variant, which is the phone's.
- A date property with no value renders the picker with nothing to clear; `Clear` renders inert rather than absent, so the sheet's row set does not change between states.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Medium | Three producers, one stylesheet region, one lane file, one unit test — but each change is small |
| Risk | Low-Medium | Ordering changes carry little geometric risk; the shared confirm builder is the one place to be careful |
| Research | Low | The audit completed the reference and current-state reading |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| The confirm reorder is mistaken for a regression by a reader who knew the old order | Medium | Low | The change is recorded against Notion's 4/4 captures in `spec.md` §13 and in `decision-record.md` |
| The reordered date picker's calendar is covered by the keyboard | Low | Medium | T005 measures against the published `--obnotion-keyboard-inset` |
| The toolbar presets become unreachable | Low | Medium | T006 lands the destination before removing the source |

## 11. USER STORIES

- As the operator, I want the safe button where I expect it and the calendar before the boxes I would rather not type in, so a phone sheet stops asking me to work in the order the code was written.

## 12. OPEN QUESTIONS

- ADR-C: does the add-view layout choice become a grid of icon cards, matching Notion's six captures across three flows, or stay as rows? `toolbar-renderer.ts:1494-1502` documents a real defect in our own former tiles — an identical preview for all seven types — that Notion's per-layout icons may not share. Held Proposed; default rows.
- Where do the toolbar overflow menu's per-column preset text inputs move to — their own sheet, or behind a row?
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Audit**: `../sheet-notion-audit.md` §3.4, §3.5, §3.12, §3.14, §0, §6
- **Predecessor**: `../004-view-config-sheet/`

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE

**Reference**: Confirm — `screenshots/notion/ios/sheets/notion-ios-sheets-delete-confirm-{01,02,03,06,07,14,15}-*.webp` and `screenshots/notion/ios/flows/deleting-a-page/notion-ios-flow-deleting-a-page-02-*.webp`. Date — `screenshots/notion/ios/sheets/notion-ios-sheets-date-picker-03-*.webp`, `-04-*.webp`, `screenshots/notion/ios/flows/adding-an-end-date/*`. Add-view — `screenshots/notion/ios/flows/changing-database-view/notion-ios-flow-changing-database-view-02-*.webp`, `screenshots/notion/ios/flows/changing-layout/notion-ios-flow-changing-layout-02-*.webp`. Toolbar — `screenshots/notion/ios/database/notion-ios-database-more-menu-15-*.webp`.
**All Notion iOS captures in this repository are 299x678** (`sips`-confirmed over a 400-file sample
of all 1,315 files, and over all 171 files in the five folders this family leans on). The Notion
column below is therefore **structural only**; every number in the Target column is **ours**, from
`node tools/live/sheet-grammar.mjs`, from `styles.css` read directly, or from `src/i18n.ts` counted
directly — or it is marked `TBD` and listed in the audit's §5.

| Property | Current (ours, measured) | Notion (ref, observed structure) | Target |
|---|---|---|---|
| Confirm action order | **Cancel first** — `confirm-sheet.ts:93` before `:107`, rendered top under `flex-direction: column` | **Destructive action first, Cancel beneath** — 4 of 4 captured stacked confirms agree | Destructive action is the **first** child; cancel the **last**. Structural, from Notion, 4/4 |
| Confirm geometry | inset ≥16px all four edges, radius 16px all four corners, actions column, heights `[44,50]` (lane) | Centred card, stacked full-width actions | **No change** — already converged; regression-checked |
| Date picker DOM order | presets (Today / Tomorrow / Next week / **Clear**), then `YYYY`-`MM`-`DD` numeric inputs, then the calendar (`date-value-picker.ts:163-232`) | tappable date field, **calendar**, then value rows, `Clear` a plain row at the bottom | Calendar **precedes** the segment inputs. Structural, from Notion |
| Date picker `Clear` | The **fourth of four** preset buttons (`:185-188`) | A plain row at the **bottom**, separate from any shortcut group | `Clear` is not a member of the presets group. Structural, from Notion |
| Date entry control | **3 numeric text inputs**, maxlength-capped, `inputmode: numeric` | **No segment entry anywhere** — a tappable field and a calendar grid | Segment inputs are not the primary path; they follow the calendar |
| Add-view order | 4 settings rows — name, view-key field, icon, duplicate checkbox — **then** the create rows (`toolbar-renderer.ts:1427-1510`) | **Create first**: a `New view` row → a layout choice → the view exists → rename afterwards via View options | The create affordance **precedes** the optional settings. Structural, from Notion |
| Add-view name placeholder | **None**, deliberately (`:1428-1430`) | `View name` placeholder present | **No change** — our reasoning is documented and sound; recorded, not proposed |
| Layout choice presentation | **Rows with chevrons** (`:1494-1502`, documented against tiles) | A **grid of icon+label cards**, selected card blue-bordered, in 6 captures across 3 flows | **No change** — Proposed only, audit §6 ADR-C |
| Toolbar menu composition | Action rows **plus** per-column free-text preset inputs on one surface (`:2540-2556`) | Plain action rows only; **no** Notion menu in the harvest carries a free-text field | **0** free-text inputs sharing the action-row surface |
| Confirm variants not adopted | one stacked confirm | type-to-confirm and radio-choice variants also exist | **Not adopted** — features for objects we do not have |
| Date rows not adopted | none | `End date`, `Date format`, `Include time`, `Time format`, `Timezone`, `Remind` | **Not adopted** — features we lack, not alignment gaps |
<!-- /ANCHOR:gap-table -->
