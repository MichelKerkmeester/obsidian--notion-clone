---
title: "Feature Specification: Phase 11: Record Sheet Header and Property Icons"
description: "The record sheet is the one phone sheet whose title does not centre, because it builds its own header instead of the shared one the centring contract queries, so the contract covers thirteen surfaces and misses this one."
trigger_phrases:
  - "071 phase 11"
  - "record sheet header centring"
  - "record peek title left aligned"
  - "record property type icon"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 11: Record Sheet Header and Property Icons

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

`../sheet-notion-audit.md` §3.3 finds the audit's clearest instance of Mechanism B — **a contract that passes because its surface list omits the surface**.\n\nThe sheet-grammar lane carries a title-centring clause and it passes: **13** header-bearing surfaces each measure their title centre within 0.50px of the frame centre, 12 of them at ≤0.50px. `record-detail` and `record-peek` are not among the 13. The clause queries `.obnotion-shell-header` (`sheet-grammar.mjs:3402`) and the record family mounts `.obnotion-record-detail-header` instead, which `styles.css:10806-10825` lays out as `display: flex` with the title at `flex: 1` — left-anchored. So the record sheet's title is the one phone-sheet title that does not centre, and the assertion that would have caught it was never eligible to fail.\n\nOur own capture shows it plainly: in `screenshots/notion-clone/panels/constructed-record-detail-mobile-light.png` (804x1748, opened and read) the title `row-0` sits hard left, while `Filter`, `Sort` and `Properties` centre in their own captures at the same frame.\n\nA second, smaller delta rides along. Notion's row page carries a **leading type icon** on every property row (`screenshots/notion/ios/database/notion-ios-database-row-page-03-0cb59457-00da-4154-b7c0-5bb2a4831ba2.webp`). Ours carries none — and that is an internal inconsistency as much as a Notion one, because our properties sheet and our filter sheet both show a type icon per property.

**Key Decisions**: The record's landed row grammar is regression-checked, not re-designed: `006` converged 21/21 rows at 44.0px, 20/20 hairlines, the 16.0px inset and 0 native selects. The record's **open target** — our bottom sheet against Notion's side-peek / center-peek / full-page setting — is out of scope and stays with `006-record-open-target`. The one number here, 0.50px, is ours and is already met by 13 surfaces.

**Critical Dependencies**: `006-record-and-menu-sheets`'s landed record grammar (unchanged, regression-checked); the audit's §3.3 and §0.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft — scaffolded, not implemented |
| **Created** | 2026-09-09 |
| **Branch** | `worktrees/272-sheet-notion-audit` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 11** of the Sheet family alignment to Notion x Anytype specification, opened by
`../sheet-notion-audit.md` under the operator's 2026-09-09 ~22:30 ruling — *"Check more sheets
align closer to notion, input, content, wise etc"*, *"Ui improvement is focus here"*.

**Scope Boundary**: The record family's header construction and title alignment, and its property rows' type icon (`src/views/record-detail-panel.ts`, `src/views/table-record-peek.ts`, the record region of `styles.css`, and the lane's title-centring surface list). Not the open target, not the row grammar, not the note-body editor.

**Dependencies**: `006-record-and-menu-sheets`'s landed record grammar (unchanged, regression-checked); the audit's §3.3 and §0.

**Deliverables**: record-detail and record-peek inside the title-centring contract, both measuring ≤0.50px, a type icon on every record property row, and the regression proof that `006` still holds.

**Changelog**: When this phase closes, add an entry to `../changelog/` named
`071-011-record-sheet-header-and-icons.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Thirteen phone sheets centre their titles and two do not, and the gate cannot tell. This is not a tolerance that drifted — the record family was never in the clause's surface list, because it never mounted the element the clause looks for. A contract whose coverage is implicit in a selector will silently stop covering any surface that stops using it, and that is exactly what happened here.

### Purpose
Every header-bearing phone sheet, including the record family's two, is a member of the title-centring contract and measures within 0.50px of the frame centre; and a record property row carries the same type icon the properties and filter sheets already show — so the record sheet reads as one of the app's sheets rather than as an exception.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The record family's header construction and its title alignment
- Membership of the title-centring clause's surface list for record-detail and record-peek
- The property-type icon on record property rows
- Lane assertions for both, RED before GREEN

### Out of Scope
- The record's open target — bottom sheet against side peek / center peek / full page. `006-record-open-target` owns it and this packet must not move it
- `006`'s landed row grammar: 21/21 rows at 44.0px, 20/20 hairlines, 16.0px inset, 0 native selects — regression-checked here, not re-targeted
- The note-body editor and its placeholder
- Card grouping / canvas backgrounds — owned by `007`, audit §6 ADR-A

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/views/record-detail-panel.ts` | Modify | Header construction: adopt the shared builder, or satisfy the contract with its own |
| `src/views/table-record-peek.ts` | Modify | Same, for the peek variant |
| `styles.css` | Modify | Title alignment in the record header; the property row's type-icon slot |
| `tools/live/sheet-grammar.mjs` | Modify | Add record-detail and record-peek to the title-centring surface list; add the type-icon clause (RED before GREEN) |
| `src/views/record-detail-panel.test.ts` | Modify | Revert-proof unit test for the header contract |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read `../sheet-notion-audit.md` §0 and §3.3 before writing any assertion; the one numeric target here (0.50px) is ours and is already met by 13 covered surfaces |
| REQ-002 | `record-detail` and `record-peek` are members of the title-centring clause's surface list |
| REQ-003 | Both measure their title centre within **0.50px** of the frame centre (today: left-anchored, and unmeasured) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | Every record property row renders its property's type icon (today: 0 of 21) |
| REQ-005 | No regression on `006`'s record clauses: 21/21 rows at 44.0px, 20/20 hairlines, the 16.0px inset, 0 native selects, extent within clientWidth |
| REQ-006 | The record's open target is unchanged and still owned by `006-record-open-target` |
| REQ-007 | Recapture the record sheet and the record peek phone-only, light and dark, and record a measured before/after against §13 |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: record-detail and record-peek are in the title-centring surface list and both measure ≤0.50px
- **SC-002**: Every record property row carries its type icon, measured by the lane
- **SC-003**: No regression on `006`'s record clauses
- **SC-004**: The operator's own device read reports the record sheet aligned (D3 — no agent ticks this row)
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Adopting the shared `createSheetHeader` changes the record header's action slot — it carries an expand control beside the close button | The expand affordance could be lost or misplaced | `createSheetHeader` already exposes a `beforeClose` hook for exactly this (`mobile-bottom-sheet.ts`); route the expand control through it. T005 chooses between adoption and satisfying the contract in place, with the measurement in hand |
| Risk | The record title is the user's own record name and can be arbitrarily long | Centring a long title could push the close control off the right edge | `styles.css:13969-13985` already documents this: `.obnotion-record-detail-title` carries `min-width: 0` and a `word-break`, and is called out as the one sheet header that never overflowed. Keep both; T008's overflow sweep proves it on both engines |
| Risk | Adding a type icon to 21 rows changes each row's inner width | `006`'s 44.0px pitch and 16.0px inset could move | The icon takes the row's existing leading slot rather than adding width; T008's regression check is the gate, and T007 measures pitch immediately after the icon lands |
| Dependency | `006-record-and-menu-sheets`'s landed record grammar | Must not regress | REQ-005, verified by rerunning `006`'s clauses unchanged |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

- The change is presentational. No record opens differently, no property is written differently, and the expand and close affordances keep their behaviour.
- The title must still degrade safely for a long record name — no horizontal overflow at 402px on either engine.

## 8. EDGE CASES

- A record with an empty title falls back to the shared empty label; centring applies to whatever renders, and an empty title is not a defect.
- `record-peek` may present without the expand control; the contract measures the title's centre against the frame, not against the control set, so a differing action slot does not exempt it.
- A property whose type has no icon renders the slot empty rather than collapsing it, so the labels of adjacent rows stay aligned with one another.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Low-Medium | Two producers, one stylesheet region, one lane file, one unit test |
| Risk | Medium | The header builder choice has two shapes with different blast radii, and the shared builder is used by every phone sheet |
| Research | Low | The audit completed the reference and current-state reading |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Adopting the shared header loses the expand control | Medium | Medium | Route it through `createSheetHeader`'s existing `beforeClose` hook; T005 decides with the measurement in hand |
| A long record title overflows once centred | Medium | Medium | Keep `min-width: 0` and the `word-break` already documented at `styles.css:13969-13985`; T008 sweeps both engines |
| The type icon moves `006`'s 44.0px pitch | Low | Medium | Icon takes the existing leading slot; T007 measures pitch immediately, T008 gates it |

## 11. USER STORIES

- As the operator, I want the record sheet to look like the other sheets in the app, so opening a record does not read as arriving in a different product.

## 12. OPEN QUESTIONS

- Does the record family adopt the shared `createSheetHeader` outright, or keep its own header and merely satisfy the centring contract? The first is cleaner and has the wider blast radius; T005 decides with the measurement in hand.
- Can the operator supply a full-resolution Notion record page carrying many properties (audit §5 C-5)? Every captured row page has exactly three, so a "N properties / Show all" collapse never triggers and cannot be ruled in or out.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Audit**: `../sheet-notion-audit.md` §3.3, §0, §1
- **Predecessor**: `../006-record-and-menu-sheets/`

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE

**Reference**: `screenshots/notion/ios/database/notion-ios-database-row-page-03-0cb59457-00da-4154-b7c0-5bb2a4831ba2.webp` and `-04-*.webp` (row page), `screenshots/notion/ios/flows/database-detail/notion-ios-flow-database-detail-01-74da3d7a-b6b7-4ab8-ba38-9a17f04de3da.webp` (the side-peek / center-peek / full-page setting, recorded as out of scope).
**All Notion iOS captures in this repository are 299x678** (`sips`-confirmed over a 400-file sample
of all 1,315 files, and over all 171 files in the five folders this family leans on). The Notion
column below is therefore **structural only**; every number in the Target column is **ours**, from
`node tools/live/sheet-grammar.mjs`, from `styles.css` read directly, or from `src/i18n.ts` counted
directly — or it is marked `TBD` and listed in the audit's §5.

| Property | Current (ours, measured) | Notion (ref, observed structure) | Target |
|---|---|---|---|
| Title alignment | **Left-anchored** — `.obnotion-record-detail-header` is `display:flex` with the title at `flex: 1` (`styles.css:10806-10825`); visible in `constructed-record-detail-mobile-light.png` | Notion's row page carries the title as a body heading, not in a header bar — so Notion is **not** the source of the target here | **Centred within 0.50px**. Ours, an internal-consistency target: 13 covered surfaces already meet it |
| Title-centring contract membership | **Not a member.** The clause names 13 surfaces; record-detail and record-peek are absent because the clause queries `.obnotion-shell-header` (`sheet-grammar.mjs:3402`) and this family never mounts it | not applicable | Both surfaces are members; the clause names 15 |
| Property row type icon | **0 of 21 rows** carry one — `constructed-record-detail-mobile-light.png` shows every label starting at its text | **Present** — a leading type glyph on every property row | Every record property row renders its type icon. Also an internal-consistency target: our properties and filter sheets already show one |
| Property row layout | 21/21 label-beside-value on one line (lane) | label left, value right, one per line | **No change** — already converged |
| Row pitch | 21/21 at **44.0px** (lane) | Not measurable at 299x678 | **No change** — regression-checked |
| Row hairlines | **20/20**, last row 0px (lane) | Not measurable | **No change** — regression-checked |
| Surface inset | **16.0px**, sheet padding-left 16px (lane) | Not measurable | **No change** — regression-checked |
| Native selects | **0** (lane) | Notion uses no native pickers either | **No change** — already converged |
| Add-property affordance | `+ Add property` row (`record-detail-panel.ts:445-447`) | `+ Add a property` row | **Converged** — copy only, and that is `010`'s |
| Open target | Bottom sheet | **side peek / center peek / full page**, a user setting | **Out of scope** — `006-record-open-target` owns it; recorded so a later reader does not re-open it here |
| Property count collapse | Not implemented | **Unknown** — every captured row page has exactly 3 properties, so a collapse never triggers | `TBD — needs operator capture` (audit §5 C-5) |
<!-- /ANCHOR:gap-table -->
