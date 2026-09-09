---
title: "Feature Specification: Phase 9: Properties Sheet Row Model"
description: "The Properties sheet puts eight elements on every row, six of them interactive, and prints the internal storage key beside every property name; Notion's equivalent carries four and moves the surplus into an Edit-property sheet."
trigger_phrases:
  - "071 phase 9"
  - "properties sheet row model"
  - "property row shows storage key"
  - "properties shown hidden sections"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 9: Properties Sheet Row Model

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

`../sheet-notion-audit.md` §3.1 reads the Properties sheet as the audit's second P1, and the evidence is our own capture. In `screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png` (804x1748, opened and read) every row carries **eight** elements — a reorder-up arrow, a reorder-down arrow, a visibility checkbox, a type icon, the label, a wrap button, an edit button and a trash button — of which **six** are interactive. The label itself reads `Name [file.name]`, `Field 1 [field1]`: the internal storage key, printed to the user on every row.\n\nNotion's two variants of the same surface carry **four** elements — a drag handle, a type icon, the label and an eye icon — and partition the list under **"Shown in table"** and **"Hidden in table"** section headers, each header carrying a **"Hide all"** or **"Show all"** link on its own line (`screenshots/notion/ios/flows/hiding-properties/notion-ios-flow-hiding-properties-02-9867cb76-74ed-4ff0-9254-398aeff2265e.webp`). The two controls our row carries and Notion's does not — wrap and delete — live in Notion's **Edit property** sheet, alongside its own `Wrap content` toggle and `Delete property` row (`screenshots/notion/ios/database/notion-ios-database-properties-05-086606f1-d300-4d22-a236-46180752ed89.webp`). That is why §3.1 and §3.2 are one packet: the fix is a **move** between two surfaces, not two independent changes.\n\nThe shown/hidden vocabulary does not need inventing. `panel.shownSection`, `panel.hiddenSection`, `panel.hideAllProperties` and `panel.showAllProperties` already ship in `src/i18n.ts` and are already consumed by `record-detail-panel.ts:222-226`. The Properties sheet — the surface whose entire job is showing and hiding properties — is the one that does not use them.

**Key Decisions**: Row pitch, the 3/3 section-boundary hairlines and the 0 native-select count are regression-checked, not re-designed. No card or canvas treatment is added — `007` owns that (audit §6 ADR-A). Notion's own destructive-row colour on this sheet is **not** copied: it renders "Delete property" un-red where four other captures render destructive rows red, and our `is-warning` treatment is the more consistent of the two. No numeric target is derived from a Notion asset.

**Critical Dependencies**: `002`-`006`'s landed row grammar (unchanged, regression-checked); the audit's §3.1, §3.2 and §0.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Implemented — landed, awaiting the operator's device read (D3) |
| **Created** | 2026-09-09 |
| **Branch** | `worktrees/272-sheet-notion-audit` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 9** of the Sheet family alignment to Notion x Anytype specification, opened by
`../sheet-notion-audit.md` under the operator's 2026-09-09 ~22:30 ruling — *"Check more sheets
align closer to notion, input, content, wise etc"*, *"Ui improvement is focus here"*.

**Scope Boundary**: The Properties sheet's row control set, its label composition and its section partition (`src/views/column-manager-renderer.ts`), plus the edit-property surface the two removed controls land in. Not the property data model, not the visibility persistence, and not the row pitch or hairline grammar `002`-`006` converged.

**Dependencies**: `002`-`006`'s landed row grammar (unchanged, regression-checked); the audit's §3.1, §3.2 and §0.

**Deliverables**: a four-control row, a key-free label, a Shown/Hidden partition reusing the four existing strings, an edit-property home for wrap and delete, and a lane clause for each — every one RED before GREEN.

**Changelog**: When this phase closes, add an entry to `../changelog/` named
`071-009-properties-sheet-row-model.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
This sheet passes every assertion it has. The lane proves its 3/3 between-section boundaries carry the edge-to-edge hairline and its title centres within 0.49px. No clause counts the controls on a row or looks at what the label says, which is the audit's §1 Mechanism A: the grammar columns are presence checks and the row-grammar clause checks pitch, inset and hairline. So six controls and a printed storage key have passed every green run since the sheet shipped.

### Purpose
A property row on a phone carries only what a person needs to identify and show or hide that property, its label is the property's name rather than its storage key, and the list says which properties are shown and which are hidden — with a lane clause for each, so the next regression is caught by the gate rather than by the operator.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The row's interactive control set: today six, target at most four
- The row label's composition — the bracketed internal key
- The Shown / Hidden section partition and its header-level bulk actions, reusing the four strings that already ship
- An edit-property home for the wrap and delete controls the row sheds
- Lane assertions for each of the above, RED before GREEN

### Out of Scope
- The property data model and visibility persistence — behaviour is unchanged
- Row pitch, section-boundary hairlines, native-select count — `002`-`006` converged them; regression-checked here
- Card grouping / canvas backgrounds — owned by `007`, audit §6 ADR-A
- The search placeholder and any other pure-copy item — owned by `010-sheet-copy-touch-idiom`
- Notion's un-red "Delete property" tone — explicitly not copied

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/views/column-manager-renderer.ts` | Modify | Reduce the row's control set; drop the bracketed key; build the Shown/Hidden partition |
| `src/views/database-view.ts` | Modify | Route the wrap and delete controls to the edit-property surface |
| `styles.css` | Modify | Section-header layout with its bulk-action link; row layout at four controls |
| `tools/live/sheet-grammar.mjs` | Modify | Clauses: controls-per-row, key-free label, section partition (RED before GREEN) |
| `src/views/column-manager-renderer.test.ts` | Modify | Revert-proof unit test for the row contract |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read `../sheet-notion-audit.md` §0 (the 299x678 ceiling), §3.1 and §3.2 before writing any assertion; no numeric target may be derived from a Notion asset |
| REQ-002 | No properties row carries more than **4** interactive controls (today: 6) |
| REQ-003 | **0** rows render a bracketed internal storage key in the phone presentation (today: every row) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | When at least one property is hidden, the list renders a Shown section and a Hidden section, each header carrying its own bulk action, reusing `panel.shownSection` / `panel.hiddenSection` / `panel.hideAllProperties` / `panel.showAllProperties` |
| REQ-005 | The wrap and delete controls removed from the row remain reachable from an edit-property surface; no behaviour is lost |
| REQ-006 | No regression on the sheet's landed clauses: 3/3 section-boundary hairlines, row pitch, 0 native selects, title centred within 0.49px |
| REQ-007 | Recapture the Properties sheet phone-only, light and dark, and record a measured before/after against §13 |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A properties row carries at most 4 interactive controls, measured by the lane
- **SC-002**: No row prints a storage key, measured by the lane
- **SC-003**: The list partitions into Shown and Hidden with bulk actions, measured by the lane
- **SC-004**: No regression on the sheet's landed clauses
- **SC-005**: The operator's own device read reports the Properties sheet aligned (D3 — no agent ticks this row)
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | The row builder is shared with the record sheet's own property list (`record-detail-panel.ts:216-226` passes the same drag-handle and section options) | Cutting the row's control set could change the record sheet too | Read both call sites before changing the shared builder; if the option set diverges, branch on the caller rather than editing the shared default. The record sheet's own clauses are in the regression set (T009) |
| Risk | Moving delete off the row changes a destructive path's entry point | A user who knew the trash icon loses it | The edit-property surface must be reachable in one tap from the row before the trash icon is removed — T006 lands the destination before T007 removes the source |
| Risk | The bracketed key may be load-bearing for disambiguating two properties with the same label | Dropping it could make two rows identical | T003 measures how often two properties share a label in the fixtures; if it happens, the disambiguation moves to a secondary line rather than the primary label |
| Dependency | `002`-`006`'s landed row grammar | Must not regress | REQ-006, verified by rerunning the existing clauses unchanged |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

- The change is presentational and navigational. No property is created, renamed, retyped or deleted differently; only where its controls live changes.
- Touch targets stay at or above 44px; a row that sheds controls must not let the survivors shrink below the floor.

## 8. EDGE CASES

- A database with zero hidden properties renders one section, not two — REQ-004's partition applies when at least one property is hidden, and a single-section list is not a defect.
- The title property cannot be hidden; its visibility control renders inert, as Notion's does (its eye icon renders muted in `notion-ios-flow-hiding-properties-02`).
- A property whose label is empty falls back to its key — that is the one place a key may still surface, and it is a fallback, not the default composition.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Medium | Two producers, one stylesheet region, one lane file, one unit test |
| Risk | Medium-High | The row builder is shared with the record sheet, and a destructive path's entry point moves |
| Research | Low | The audit completed the reference and current-state reading |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| The shared row builder regresses the record sheet | Medium | High | T009 puts the record sheet's own clauses in the regression set; branch on caller rather than editing the shared default |
| Delete becomes unreachable between T007 and T006 | Low | High | Task order is fixed: the destination lands before the source is removed |
| Two properties become indistinguishable without the key | Low | Medium | T003 measures it first; fallback to a secondary line if it occurs |

## 11. USER STORIES

- As the operator, I want a property row to show me the property and let me hide it, without six controls and a storage key competing for the same 402px.

## 12. OPEN QUESTIONS

- Do the wrap and delete controls belong in an edit-property sheet, as Notion has them, or behind a per-row overflow menu? The audit reads Notion as the former and the packet defaults to it.
- Can the operator supply a full-resolution Notion Property-visibility capture (audit §5 C-2) so §13's numeric cells stop being `TBD`?
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Audit**: `../sheet-notion-audit.md` §3.1, §3.2, §0, §6
- **Predecessor**: `../003-add-property-sheet/`

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE

**Reference**: `screenshots/notion/ios/flows/hiding-properties/notion-ios-flow-hiding-properties-02-9867cb76-74ed-4ff0-9254-398aeff2265e.webp` and `-03-*.webp` (Property visibility); `screenshots/notion/ios/flows/adding-new-properties/notion-ios-flow-adding-new-properties-02-2f52d1bc-fcf7-4da5-8f96-6b1e31339dc4.webp` and `-03-*.webp` (Properties, the board-view variant); `screenshots/notion/ios/database/notion-ios-database-properties-05-086606f1-d300-4d22-a236-46180752ed89.webp` (Edit property).
**All Notion iOS captures in this repository are 299x678** (`sips`-confirmed over a 400-file sample
of all 1,315 files, and over all 171 files in the five folders this family leans on). The Notion
column below is therefore **structural only**; every number in the Target column is **ours**, from
`node tools/live/sheet-grammar.mjs`, from `styles.css` read directly, or from `src/i18n.ts` counted
directly — or it is marked `TBD` and listed in the audit's §5.

| Property | Current (ours, measured) | Notion (ref, observed structure) | Target |
|---|---|---|---|
| Elements per row | **8** (↑, ↓, checkbox, type icon, label, wrap, edit, trash), **6** interactive — `column-manager-renderer.ts:355-410` | **4** — drag handle, type icon, label, eye icon | **≤4** interactive controls per row |
| Row label | `Name [file.name]`, `Field 1 [field1]` — the storage key printed in brackets | The property's name only | **0** rows print a bracketed key |
| Section partition | **None** — one flat list | **"Shown in table"** and **"Hidden in table"** headers | ≥2 sections when ≥1 property is hidden, reusing the four strings that already ship |
| Bulk action | An **"All"** master checkbox in the sheet header | **"Hide all"** / **"Show all"** links on each section header's own line | Bulk action moves to the section header it governs |
| Wrap and delete | Icon buttons **on the list row** | In the **Edit property** sheet: a `Wrap content` toggle and a `Delete property` row | Both reachable from an edit-property surface; 0 on the list row |
| Add affordance | `+ Add property` and `+ File property` as **two buttons on one line** (`:117-137`) | **`+ New property`** as a full-width row, then a `Learn about properties` row | Full-width rows, not a side-by-side pair (delivered by `014-sheet-polish`) |
| Search placeholder | `Search properties` | `Search for a property...` | Owned by `010-sheet-copy-touch-idiom`, not this packet |
| Row name tooltip | `Double-click to edit` (`:383`) | No pointer-gesture copy anywhere in the harvest | Owned by `010-sheet-copy-touch-idiom`, not this packet |
| Section-boundary hairlines | **3/3** edge-to-edge 1px (lane) | Not measurable at 299x678 | **No change** — regression-checked |
| Title centring | Within **0.49px** of the frame centre (lane) | Not measurable | **No change** — already converged |
| Native selects | **0** | Notion uses no native pickers either | **No change** — already converged |
| Destructive row colour | `is-warning` red (`styles.css:813`) | **Inconsistent in Notion**: un-red here, red in four other captures | **No change** — ours is the more consistent; explicitly not copied |

**Landed, 2026-09-09/10** (`worktrees/275-properties-sheet-rows`, awaiting the operator's device
read D3): the Target column's own numbers now read GREEN on this packet's clauses — 3 interactive
controls on all 16 rows (wanted ≤4), 16/16 labels key-free, 2 section headers
(`Shown`/`Hide all`, `Hidden`/`Show all`) each carrying its bulk action on its own line, 0 native
selects, 34px row heights, 3/3 hairlines, 0.49px centring, WebKit extent 401 ≤ 401. The audit's
Current column above is preserved as the RED the clauses were written against; the C-2 capture
dependence stands, so the Notion column stays structural.
<!-- /ANCHOR:gap-table -->
