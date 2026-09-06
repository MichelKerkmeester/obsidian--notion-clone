---
title: "Feature Specification: Notion Record Refinement"
description: "Refine the record and relation surfaces against the Notion screen digest: finish two half-landed Anytype rulings, consume a built-but-unwired primitive, fix the add-property picker's dropped name, and route four extensions to the operator as rulings."
trigger_phrases:
  - "065 spec"
  - "notion record refinement"
  - "record surface empty prompt"
  - "add property picker name"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Notion Record Refinement

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-06 |
| **Branch** | `worktrees/181-notion-record` |
| **Parent Spec** | ../spec.md |
| **Phase** | 65 of 68 |
| **Predecessor** | 054-record-and-relation-surfaces |
| **Successor** | None |
| **Handoff Criteria** | `054`'s own primitives are the file group this packet edits; it is sequenced after any `054` leg still in `property-row.ts` or `record-detail-panel.ts` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 65** of `005-component-surface-system`, one of the eight Notion-refinement children
the parent reserved at `roadmap.md` §5.A on 2026-09-06. Its owner surfaces are
`054-record-and-relation-surfaces` and `058-card-title-and-title-formats`.

**Scope Boundary**: the record and property surfaces only — `src/views/record-surface/*.ts`,
`record-detail-panel.ts`, `table-record-peek.ts`, `board-renderer.ts`'s card-field path,
`column-manager-renderer.ts`'s add-property wiring, the record blocks of `styles.css`, and
`src/i18n.ts`'s field-prompt keys. Menu chrome, the toolbar, the board's layout and the calendar are
other packets'.

**Dependencies**:
- `054`'s landed primitives (`property-row.ts`, `hidden-properties.ts`, `add-property-row.ts`).
- `052`'s picker host, for C6's row (`054` D8).
- The parent's D15 and `roadmap.md` §7.15: a Notion finding that contradicts a landed Anytype
  ruling becomes a Proposed ADR here, never an edit to the parent.

**Deliverables**:
- C1-C5 landed against their thresholds, each proved by the red it was observed failing.
- C6 landed if ADR-008 is taken; recorded and unscheduled if it is not.
- ADR-005 through ADR-008 in front of the operator with their thresholds already written, so a
  ruling converts into a task row rather than into a fresh investigation.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Three changes this program already ruled on Anytype evidence are half-landed on the record surface:
the empty-value prompt never reached the board card, the desktop property label is still a type step
smaller than its value, and the corrected single-select renderer has zero production consumers. The
Notion digest adds one concrete defect on top of them — the add-property picker throws away the name
the user typed whenever a format is selected — and four larger patterns that no ruling covers.

### Purpose
The record surface reads as one finished object page: no field labelled "Empty" where an editor
exists, label and value at one size, options rendered by the one renderer designed for them, a
property nameable and typeable in one pass, and every remaining Notion pattern either adopted with a
threshold or recorded as a ruling the operator still owes.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Delegating the board card's empty-value path to `getPropertyEmptyPrompt` (C1).
- Extending the prompt to every format that has an editor, in both locales (C2).
- Equalising the desktop record-sheet label and value type size (C3).
- Pointing the record sheet's and board card's option branches at `renderOptionValue` (C4).
- Forwarding the picker's typed query on format selection (C5).
- A trailing add-property row on the record sheet, gated on ADR-008 (C6).
- The display-mode vocabulary in docs and labels (T005; zero code).
- Extending `constructed-state-assertions.mjs`, `render-assertions.mjs` and `touch-targets.mjs`, and
  adding the constructed scenarios C1-C6 need.

### Out of Scope
- **A record-level cover and icon system** — Notion sizes it as the icon picker multiplied by
  upload, reposition and alt-text states; ownership is `051`'s shell question (`054` D8) and no
  Anytype evidence for one exists in the bounded sources. ADR-007 routes the question.
- **A comments area** — unowned, and Notion's evidence is three distinct UIs [digest screens
  `1da73ef6`, `92c51f39`, `388a29da`]. A future packet must scope which one before a task exists.
- **The "···" page menu (P8)** — menu chrome is `051`/`052`'s, confirmed by `054` D8.
- **A "Deleted properties" tier** — implies a property-deletion lifecycle this file group does not
  own, and possibly collides with `045`'s card-hiding mechanism.
- **Formulas, rollups and calculations** — excluded by `054` ADR-003; rollups already render as
  ordinary property rows, which is the only pattern the Notion sample shows.
- **AI Autofill chips and the cover picker's AI tab** — `054` D6.
- **The phone label column** — A2 ruled the 96px fixed column and this packet does not reopen it.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/board-renderer.ts` | Modify | `getEmptyDisplayValue` (:754-757) delegates to `getPropertyEmptyPrompt`, keeping the array shape and the checkbox case (C1) |
| `src/views/record-surface/property-row.ts` | Modify | `getPropertyEmptyPrompt` (:286-291) covers the formats with editors (C2) |
| `src/i18n.ts` | Modify | New `field.empty*Prompt` keys in both locales (C2) |
| `styles.css` | Modify | Drop `font-size: var(--font-smaller)` from the desktop arm of `.db-record-detail-field-label` (:10300-10306) (C3) |
| `src/views/record-detail-panel.ts` | Modify | Option branch consumes `renderOptionValue` (C4); trailing add row (C6, gated) |
| `src/views/board-renderer.ts` | Modify | Option branch consumes `renderOptionValue` (C4) |
| `src/views/column-manager-renderer.ts` | Modify | `onSelect` forwards the typed query (:200) (C5) |
| `tools/screenshots/constructed-scenarios.mjs` | Modify | Scenarios for the empty-prompt and option-split states, and the add row |
| `tools/live/constructed-state-assertions.mjs` | Modify | Assertions for C1-C4 and C6 |
| `tools/live/render-assertions.mjs` | Modify | Board-card computed-value assertions for C1 and C4 |
| `tools/live/touch-targets.mjs` | Modify | The add row's 44px floor (C6, gated) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | The board card's empty-value path consumes `getPropertyEmptyPrompt` rather than its own `t("common.empty")` return, preserving the `multi-select → [prompt]` array shape and the `checkbox → false` case. Red today at `board-renderer.ts:754-757` |
| REQ-002 | `getPropertyEmptyPrompt` returns a prompt for every format with an editor — `number`, `date`, `datetime`, `currency`, `text`, `files` beside the three it carries — in the verb+noun shape A3 captured. Red today at `property-row.ts:286-291`. **The copy for the five formats A3 did not capture is minted here and is an inference**, marked as one in `decision-record.md` ADR-001 |
| REQ-003 | The desktop record-sheet label and its value compute to the same `font-size`, with the phone arm at `styles.css:10459-10468` untouched. Red today at `styles.css:10300-10306` |
| REQ-004 | The record sheet's and the board card's option branches consume `renderOptionValue`, so single-select renders as coloured text and multi-select keeps its chips, every pair at or above 4.5:1. Red today: zero production consumers of `property-row.ts:255`, both kinds filled at `property-row.ts:76-101` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | The add-property picker forwards its typed query when a format is selected, so a named column of a chosen format is possible in one pass. Red today at `column-manager-renderer.ts:200`; the layers below already forward the label (`:180-181`, `database-view.ts:5088`) |
| REQ-006 | *(gated on ADR-008)* The record sheet carries a muted trailing add-property row below the last field and above the hidden group, opening the existing search-first picker through `052`'s host, at or above the 44px touch floor. Red today: zero add affordances on the record sheet |
| REQ-007 | The three display-mode shells are named Side peek / Center peek / Full page in this program's docs and in any user-facing label that names them. Zero code; `006`'s placement ruling is untouched |
| REQ-008 | ADR-005, ADR-006, ADR-007 and ADR-008 are in front of the operator with a threshold and a red-first check each, so a ruling converts directly into a task row |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The string "Empty" renders on no record-sheet or board-card field that has an editor,
  in either locale, proved by an assertion that was observed red on the board card first.
- **SC-002**: The desktop label and value computed `font-size` are equal in
  `constructed-record-detail`, and the phone arm's `--db-font-lg` value is unchanged.
- **SC-003**: `renderOptionValue` has at least two production consumers and the filled-badge path is
  no longer reached for single-select on either surface.
- **SC-004**: A unit test pins that selecting a format after typing a name produces a column of that
  format carrying that label.
- **SC-005**: Four Proposed ADRs carry a threshold and a red-first check each, and none of their code
  has been written.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `052`'s picker host, for C6 | C6 cannot land without it | C6 is gated on ADR-008 anyway; confirm the host before scheduling the row |
| Dependency | The parent's serialized `styles.css` lane | C3 waits behind any other CSS leg | One declaration, one arm; take it in its own leg (Leg A) |
| Risk | C3's change reaches the phone arm | High — it would breach the iOS 16px input-zoom floor | The phone arm is a separate selector at `:10459-10468`; the assertion reads both arms |
| Risk | C2's minted copy is wrong for a format A3 never captured | Medium — user-visible strings with no reference behind them | Marked an inference in ADR-001; the operator can re-word without touching the mechanism |
| Risk | C1's delegation loses the `multi-select` array shape or the `checkbox → false` case | Medium — the board card renders `[object Object]` or a stray "false" | Mirror `record-detail-panel.ts:514-519` exactly; assert both shapes |
| Risk | C4's contrast floor fails for a stored option colour | Medium — a 4.5:1 breach is a WCAG regression, not a style preference | Measure every pair in the option-tone scan before landing; `scan-option-tones.mjs` already exists |
| Risk | Writing a gated leg's code before its ruling | High — it presents an unratified change as done | D4: no task row exists for a gated leg until its ADR is Accepted |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: No criterion adds a render pass. C1, C2 and C4 change what an existing branch
  returns; C5 changes one call's arguments; C6 adds one row to a list that already renders N rows.
- **NFR-P02**: The record sheet's first paint is unchanged within measurement noise on the
  constructed scenario, which is the only place this packet can measure it.

### Accessibility
- **NFR-A01**: Every option foreground/background pair produced by C4 measures at or above 4.5:1
  (WCAG 1.4.3), which is A2's C9 floor and not a new one.
- **NFR-A02**: C6's row measures at or above 44px on the phone sheet, the program's touch floor.
- **NFR-A03**: C2's prompts are field content, not placeholder chrome; they inherit the value's own
  contrast, which A3 already refused to take below 4.5:1.

### Reliability
- **NFR-R01**: C1 preserves both special cases of the path it replaces — the `multi-select` array
  shape and `checkbox → false` — so no card field changes rendering except the empty ones.
- **NFR-R02**: C3 changes one declaration on one arm. The phone arm's computed `font-size` is
  asserted unchanged in the same lane run.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- **Empty multi-select**: must render `[prompt]`, an array of one, not the bare string — the shape
  the card-field renderer expects.
- **Empty checkbox**: must stay `false`, not a prompt. A checkbox has no empty state a word can
  name.
- **A format with no prompt**: after C2 the set is closed, but `getPropertyEmptyPrompt` must keep
  returning `null` for anything outside it rather than a stray key name.
- **An option value not in the column's option list**: `renderOptionValue`'s existing "Unlisted"
  path is already covered by `property-row.test.ts:216-220` and must keep behaving the same.

### Error Scenarios
- **A stored option colour below 4.5:1 against the text tone C4 selects**: the pair fails the
  contrast floor, and the packet reports it rather than shipping it. This is a finding about the
  stored palette, not about C4.
- **The picker's search input removed or renamed**: C5 reads `handle.searchInput`
  (`add-property-row.ts:43`, `:108`); a rename breaks it at compile time, which is the intended
  failure mode.

### State Transitions
- **Hidden group expanded, then a field edited**: expanded state already survives a re-render
  (`hidden-properties.ts`, closed-over `expanded`), and no criterion here touches that.
- **A locale switch mid-session**: C2's keys must exist in both locales or the switch renders a raw
  key. Both locale tables are edited in the same change.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 17/25 | ~420 LOC across 10 files, plus lane and scenario edits |
| Risk | 14/25 | Two renderers and one shared primitive; no data, auth or API surface |
| Research | 12/20 | Done — five iterations, 27 findings, every red re-derived against this tree |
| **Total** | **43/70** | **Level 2** (`recommend-level.sh --loc 420 --files 10 --architectural`: 59/100, confidence 92%, phase score 10/50) |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- **ADR-006** — does the record sheet's hidden group hold empty fields, view-hidden columns, or
  both? One label names two populations today and neither is Notion's.
- **ADR-005** — does the hidden group grow Notion's per-row eye and a bulk "Show all" link? A4 ruled
  the group's shape and never ruled on per-row affordances.
- **ADR-007** — which packet owns a record-level cover and icon, and is one wanted at all?
- **ADR-008** — does the record sheet's add-property entry sit as Notion's trailing row or on
  Anytype's section header? Neither placement is ruled for this surface.
- **UNKNOWN, verification gap** — does the title row already disable its visibility checkbox?
  `checkboxDisabled` exists at `property-row.ts:355` and the state was never verified. A one-line
  check the next time a column-manager leg runs.
- **Inherited from the digest, not this packet's to answer** — screen `d9d61160` is a
  low-confidence crop, and no Notion per-format value-editor comparison exists in this harvest; the
  digest states a differently-targeted query set would be needed.
<!-- /ANCHOR:questions -->
