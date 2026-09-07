---
title: "Feature Specification: Card Title and Title Formats"
description: "A view's chosen title field renders through its own column's number/currency format everywhere a title is drawn, and the board's Title fixed slot opens the picker rather than only reporting it."
trigger_phrases:
  - "feature specification"
  - "card title formats"
  - "058 spec"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Card Title and Title Formats

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Implemented — AC-001 through AC-007 Met; AC-008 Unmet, operator-owned (`acceptance-criteria.md`) |
| **Created** | 2026-09-06 |
| **Branch** | `005-component-surface-system` |
| **Parent Spec** | ../spec.md |
| **Phase** | 58 of 58 |
| **Predecessor** | 057-calendar-anytype-parity |
| **Successor** | None |
| **Handoff Criteria** | `goal.md`'s completion criteria met or operator-owned; `npm run gate` exit 0; the operator device row confirmed or deferred |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 58** of the Component Surface System.

**Scope Boundary**: The one shared title-display resolver and the board's Title fixed-slot
affordance. Not the `titleField` picker itself (already shipped), not `045`'s Properties panel,
not `054`'s record-surface primitives, not `056`'s card anatomy, and not `057`'s calendar/timeline
title fields.

**Dependencies**:
- `045-board-card-properties` (owns the board's Properties sheet the Title row lives in)
- `054-record-and-relation-surfaces` (owns the record header this packet's resolver also feeds)
- `056-board-anytype-parity` (owns the card anatomy the formatted title renders inside)

**Deliverables**:
- `resolveTitleFieldDisplay` routes number/currency (and date) titles through the column's own
  formatter instead of `stringifyValue()`.
- The board's Title fixed slot opens the existing `titleField` picker.
- A regression test locking the board/record/phone-sheet title-field agreement already true in code.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number
  plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
A view's card and record title can already be set to any column (`ViewConfig.titleField`), but the
title's display text is computed by `stringifyValue()` alone (`title-field-display.ts:53`), so a
number or currency column chosen as the title renders its raw stored value instead of the format
that same column shows everywhere else. Separately, the board's own Properties sheet shows the
current title choice as a read-only label with no way to change it from that surface, which is
where the operator was looking when they filed this report.

### Purpose
A title drawn from a number or currency column reads with that column's own format wherever a
title appears, and the operator can change which column is the title from the board surface that
shows it.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Route `resolveTitleFieldDisplay`'s non-file-pseudo-field branch through the chosen column's own
  typed display (number/currency formatter today; date formatter where the title column is a date).
- Give `board-card-properties-panel.ts`'s Title fixed slot a jump-to-picker affordance.
- A regression test locking the existing board/record-header/phone-sheet titleField agreement.
- A screenshot scenario per `screenshot-currency.md`: a currency-titled card, both themes.
- **2026-09-07 amendment (a fresh operator report on 0.0.31 iOS, closing D1):** a `titleFormat`
  field on `ViewConfig`, applied only while the title reads the file name (no column to inherit a
  format from) — plain text / number / currency (EUR, USD, GBP) / date — with its own picker row
  beside the existing Title field row, shown only in that state; and a live
  `tools/live/render-assertion-harness.ts` proof that mounts the production `BoardRenderer`
  directly, closing the earlier fixture-HTML-only evidence gap for REQ-001.

### Out of Scope
- Building a second title-field picker — `view-config-panel-renderer.ts:1902-1920` already has one.
- Calendar and timeline title fields (`calendarTitleField`/`timelineTitleField`) — `057`'s.
- `045`'s card-property visibility/order list, `054`'s record-surface primitive extraction,
  `056`'s card anatomy migration — each stays that packet's own, unedited by this one.
- A second, independent format setting for a title drawn from a real column — D3/ADR-003 stand;
  `titleFormat` applies only to the file-name pseudo-field, which has no column to inherit from.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/title-field-display.ts` | Modify | Route the non-file branch through the column's own typed formatter instead of `stringifyValue()`; route the file-title branch through the new `titleFormat` |
| `src/views/board-card-properties-panel.ts` | Modify | Title fixed slot (`:43`) gains a jump-to-picker affordance |
| `src/views/board-card-fields.test.ts` / a new title-field-display test | Create/Modify | Red-first coverage for the formatted-title case and the cross-surface agreement |
| `tools/screenshots/scenarios/*.mjs` | Modify | One new scenario: a currency-titled card, light and dark |
| `src/data/types.ts` | Modify | `TitleFileFormat` type, `ViewConfig.titleFormat` |
| `src/views/view-config-panel-renderer.ts` | Modify | "Title format" row, visible only while the title reads the file name |
| `src/views/board-renderer.ts` | Modify | `getReferenceRowTitle` now reads `title.text` unconditionally (D8) — it silently discarded a file-title's format under the prior `title.isFileTitle` shortcut |
| `src/i18n.ts` | Modify | New `viewConfig.titleFormat*`/`undo.titleFormatConfig` keys, all three locales |
| `tools/live/render-assertion-harness.ts`, `tools/live/render-assertion-bundle.mjs` | Modify | Two new board scenarios mounting the production `BoardRenderer`: a currency-typed `titleField`, and a numeric file name with a `titleFormat` choice |
| `tools/screenshots/constructed-scenarios.mjs`, `tools/screenshots/scenarios/core.mjs` | Modify | Two new constructed captures (real-renderer-driven) plus a `fixtureOf` cross-link from the existing hand-written fixture |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A number or currency column chosen as a view's `titleField` renders through that column's own formatter on the board card, the record sheet header (desktop and phone) |
| REQ-002 | `board-card-properties-panel.ts`'s Title fixed slot opens the existing `titleField` picker |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | A date column chosen as a `titleField` renders through the plugin's existing date format, not an ISO string |
| REQ-004 | A regression test asserts the board card, the desktop record header and the phone record sheet read the identical `titleField` value for every view type but calendar and timeline |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A currency column set as a board's `titleField` shows `€ 3.537,32` (its own column
  format) as the card's main name, on desktop and on the phone.
- **SC-002**: Opening a board's Properties sheet and tapping the Title row reaches the `titleField`
  picker in one step, where today it reaches nothing.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `045`/`054`/`056` all call the same resolver | A change to `resolveTitleFieldDisplay` reaches every card/record surface at once | The regression test (REQ-004) is the shared contract; this packet does not touch any of those three packets' own files |
| Risk | Formatting a title that is also a file pseudo-field (`file.name`) | Would double-format a string that was never numeric | `resolveTitleFieldDisplay`'s file-pseudo-field branch (`:42-50`) is untouched by this packet — the format routing is added only to the non-file branch (`:52-60`) |
| Risk | `board-card-properties-panel.ts`'s Title row is shared with the Cover row's read-only pattern | An affordance added carelessly could make Cover look interactive too | The jump-to-picker affordance is added to the Title row's own handler only, verified by a negative control on the Cover row |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The formatter call adds no measurable render-time regression to the board or record
  paths — it is the same formatter call the cell renderer already makes for the same column.

### Security
- **NFR-S01**: N/A — no auth, network or persistence surface changes.

### Reliability
- **NFR-R01**: A malformed or non-numeric value in a number/currency-typed title column falls back
  to the existing `nonNumericText`/empty-placeholder behavior the cell renderer already uses,
  never a thrown error.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty input: an empty number/currency value renders the same `EMPTY_TITLE_PLACEHOLDER` ("—") the
  resolver already uses for an empty title today.
- Maximum length: unaffected — formatting a number does not change how the title element wraps or
  truncates.
- Invalid format: a non-numeric value in a `number`/`currency`-typed column falls back to the
  existing `nonNumericText` path, matching the cell renderer.

### Error Scenarios
- External service failure: N/A.
- Network timeout: N/A.
- Concurrent access: unaffected — the resolver reads the same `RowData` every other renderer reads.

### State Transitions
- Partial completion: N/A — no multi-step user flow.
- Session expiry: N/A.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 19/25 | One shared resolver, one fixed-slot affordance, ~4 files, ~700 LOC estimate including tests |
| Risk | 12/25 | No auth/API/DB surface; risk is confined to a shared resolver three other packets read |
| Research | 10/20 | Mechanism already exists and is read from source in this document; no new research needed |
| **Total** | **41/70** | **Level 2** — matching `recommend-level.sh`'s `--loc 700 --files 12 --db` → 51/100, confidence 92%, phase score 0/50 (standard child, not phased) |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Does `047`'s queued Notion harvest change ADR-002's picker-location call once it lands (`goal.md` open question).
<!-- /ANCHOR:questions -->

---
