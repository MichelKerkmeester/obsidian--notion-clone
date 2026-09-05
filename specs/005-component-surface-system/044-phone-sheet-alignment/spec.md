---
title: "Feature Specification: Phone Sheet Alignment"
description: "Three operator reports on one evening name the same defect from three surfaces: the phone's sheets do not share a grammar. This phase brings every sheet and dropdown instance onto the shared bottom-sheet grammar and makes a non-conforming instance fail a check rather than an operator."
trigger_phrases:
  - "phone sheet alignment"
  - "044 spec"
  - "sheet grammar conformance"
  - "column width sheet"
  - "settings sheet drag"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/044-phone-sheet-alignment"
    last_updated_at: "2026-09-05T04:50:00Z"
    last_updated_by: "code-agent"
    recent_action: "Amended REQ-007 (header everywhere)"
    next_safe_action: "Seek the operator's device report for AC-006"
    blockers:
      - "AC-006 is operator-only; nothing in this repository can close it"
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/database-view.ts"
      - "src/settings.ts"
      - "src/views/modals/db-modal.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-044-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the Obsidian-owned PluginSettingTab body get a local row grammar, or a wrapper that restyles Setting rows in place?"
      - "Which sheet owns keyboard avoidance: applySheetChrome for every sheet, or an opt-in per instance?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Phone Sheet Alignment

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 (`recommend-level.sh --loc 700 --files 16 --architectural` → 67/100, phase score 20/50, phases NO) |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-04 |
| **Branch** | `worktrees/039-column-width-sheet`, `worktrees/040-settings-sheet` (first two legs, already running) |
| **Parent Spec** | ../spec.md |
| **Phase** | 44 of 45 |
| **Predecessor** | 043-constructed-capture |
| **Successor** | 045-board-card-properties |
| **Handoff Criteria** | None — report-driven, opened from the operator's 2026-09-04 evening pass, not blocked on `043`'s release |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 44** of the Component Surface System.

**Scope Boundary**: the presentation grammar of every sheet and dropdown instance on the phone.
`003-mobile-sheet-presentation` owns the portal, the phone predicate and the anchor lifetime;
`016-sheet-drag-and-audit` owns the drag mechanism and the grab band's measured geometry. Both stay
the contract owners. This phase owns **conformance to them**, instance by instance, and it does not
redesign either contract.

**Dependencies**:
- `003-mobile-sheet-presentation` — `setSheetMount`, the phone predicate, the scrim.
- `016-sheet-drag-and-audit` — `attachSheetDragToDismiss`, the grab band's 32px measured height and
  the accepted-shortfall decision recorded in `../roadmap.md` §4 row 10.
- `013-add-view-sheet` — built the Add view surface this phase re-dresses (report 43).
- `031-sheet-lifecycle-ownership` — the outside-pointerdown/`getPanel()` resolver report 29 needed.
- `006-list-view-deprecation` — removes List view from the Add view picker. This phase asserts the
  absence; it does not perform the removal.
- `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md` — the ranked instance list this
  phase's task table is generated from. Being written concurrently; read it, do not wait for it.

**Deliverables**:
- Every phone sheet instance presenting the shared grammar, reports 40/40b/41/43 first.
- Keyboard avoidance that a harness can observe, not a promise.
- A conformance check that enumerates registered surfaces and goes red when a grammar element is
  removed.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Three operator reports arrived inside eight minutes on 2026-09-04 and they are one defect seen from
three surfaces. Verbatim: *"adjust column width sheet on ios needs an obvious redesign and alignment
with other sheets"*; *"Same for settings sheet. That one also cant properly close, drag handler
doesnt work"*; *"This sheet also still has bad design"* (the Add view sheet). A fourth, the addendum
to report 40: *"When typing pixel width sheet should also move or adjust so you can still see what
your doing when typing."*

The measured cause is that conformance was never enforced, only built. `applySheetChrome` exists and
six modules call it (`popover-position.ts`, `owned-menu.ts`, `toolbar-renderer.ts`,
`record-detail-panel.ts`, `modals/db-modal.ts`, and the sheet module itself). The column-width
adjuster is not one of them: `database-view.ts:11411-11412` builds
`db-mobile-column-width-backdrop` and `db-mobile-column-width-panel` with `doc.body.createDiv` and
never routes through the sheet path at all — no surface, no grab handle, no header, no row padding,
no safe-area inset, and no keyboard avoidance, which is exactly the bare strip the operator
photographed. The settings sheet is the opposite failure: `SettingsTab` reaches the phone through
`DbModal`'s `sheet` presentation and gets the chrome, but its body is Obsidian's desktop two-column
`Setting` grid squeezed onto 390pt, and its grab handle does not close it. The Add view sheet has
the chrome and no row grammar: three tall bordered inputs, a `select` rendered as a plain text
input, a bare checkbox, and a flat icon list under a "Create" heading.

### Purpose

Every sheet and dropdown instance on the phone renders the same grammar, and a non-conforming
instance fails a check in this repository instead of being found by the operator on a device.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The seven grammar elements, defined once and asserted everywhere: **surface** (rounded top,
  elevated, `--background-primary` through the portal), **handle** (grab band with working
  drag-to-close), **header** (title plus a close affordance), **padded rows** (one row grammar, not
  bespoke per surface), **segmented choices** (preset/option groups as a segmented control, not
  loose buttons), **keyboard avoidance**, and **safe-area inset**.
- Operator report 40 and its addendum 40b — the column-width adjuster.
- Operator report 41 — the settings sheet.
- Operator report 43 — the Add view sheet.
- One task per non-conforming instance the inventory ranks, after those three.
- A conformance check with a negative control.

### Out of Scope
- The sheet drag mechanism and the grab band's height — `016` owns them, and the 35px shortfall is
  an operator-confirmed accepted decision (`../roadmap.md` §4 row 10). Reusing it is in scope;
  changing it is not.
- The portal, the phone predicate and the anchor lease — `003` owns them.
- Desktop dropdown placement — `015` owns it; this phase touches the phone presentation of the same
  surfaces only.
- Removing List view from the picker — `specs/006-list-view-deprecation/002-hide-and-migrate` owns
  the removal. This phase owns the picker's shape and the assertion that the row is gone.
- Rebuilding the Add view surface's behaviour — `013` built it and keeps it; this is a dressing
  pass over its existing controls.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/mobile-bottom-sheet.ts` | Modify | Header/close affordance and keyboard avoidance as shared chrome, beside the existing handle and drag |
| `src/views/database-view.ts` | Modify | `showMobileColumnWidthPanel` routed through the sheet path instead of two bespoke body divs |
| `src/settings.ts` | Modify | The settings body's row grammar; drag-to-close reaching `SettingsTab`'s host |
| `src/views/modals/db-modal.ts` | Modify | Header/close for the `sheet` presentation, so all 20 subclasses inherit it |
| `src/views/toolbar-renderer.ts` | Modify | The Add view sheet's rows, dropdown row and view-type picker |
| `src/views/owned-menu.ts` | Modify | Sheet menu rows onto the shared row grammar |
| `src/views/icon-picker-popover.ts` | Modify | Body-mounted popover onto the sheet path on phone |
| `src/views/option-color-picker.ts` | Modify | Same |
| `src/views/column-menu.ts` | Modify | Sub-popover onto the sheet path on phone |
| `src/i18n.ts` | Modify | Close/done labels in three locales |
| `styles.css` | Modify | The row, header and segmented-control rules (serialized lane — see `../spec.md` §4) |
| `tools/live/sheet-grammar.mjs` | Create | The conformance check |
| `src/views/mobile-bottom-sheet.stories.ts` | Modify | Story coverage for header, keyboard inset and segmented rows |
| `src/views/__tests__` (sheet specs) | Modify | Unit coverage for the new chrome |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Every surface that presents as a bottom sheet on the phone reaches the screen through `applySheetChrome`. A body-mounted surface that reads as a sheet and does not call it is a conformance failure, not a style variant. Today's counter-example is `db-mobile-column-width-panel` (`src/views/database-view.ts:11412`). |
| REQ-002 | The column-width adjuster presents as a sheet: surface, grab band with working drag-to-close, header carrying the column name and a close affordance, padded rows, the four width presets as a segmented control rather than four loose buttons, and a bottom safe-area inset. Operator report 40. |
| REQ-003 | While an input inside a sheet holds focus, the sheet's bottom edge stays above the reduced `visualViewport` bottom and the focused field stays inside the visible area. Proven by a harness that emulates a viewport height reduction, red first against the current strip. Operator report 40b. |
| REQ-004 | The settings sheet closes from its grab handle, and its body renders padded rows rather than Obsidian's desktop two-column `Setting` grid, so no label wraps against a narrow control and no description is clipped at the right edge. Operator report 41. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | The Add view sheet uses the shared row grammar: header with a close affordance, grouped rows instead of loose tall inputs, **Title property** as a dropdown row (it is a select rendered as a plain text input today), **Copy settings from current view** as a toggle row, and the view-type list as chromed rows with chevrons rather than a bare icon list. Operator report 43. |
| REQ-006 | The Add view picker carries no **List view** row. The removal itself belongs to `specs/006-list-view-deprecation/002-hide-and-migrate`; this phase asserts the absence and fails if the row returns. |
| REQ-007 | Dropdown instances that present as sheets on the phone — owned menus, the column-menu sub-popover, the icon picker, the option colour picker — carry the same seven elements as a sheet does. A dropdown is not a second grammar. **Amended 2026-09-05 (operator decision, superseding this row's earlier no-title menu-variant draft):** "header everywhere" — every phone sheet, including the owned context menu, gets a title row with a 44px close, with no title-less variant. The owned menu's title names the row, column or field it was opened for (`row-menu.ts`'s file name, `column-menu.ts`'s `col.label`), falling back to the active view's own tab title, then to a generic label, when no specific subject was threaded to the call site. Closed for owned-menu, the icon picker, the option colour picker and the date picker by this leg; the column-menu sub-popover (this row's fourth named instance) still has no header and remains open — its own back-navigation affordance was never evaluated against this contract. |
| REQ-008 | A conformance check enumerates every registered phone surface and reports one row per instance per grammar element. It is not evidence until a negative control is observed: remove one element from one conforming surface and the check goes red on that surface alone. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `tools/live/sheet-grammar.mjs` exits 0 over every instance the inventory ranks, with the
  negative control observed red.
- **SC-002**: the operator opens the column-width adjuster, the settings sheet and the Add view sheet
  on iOS and reports each as aligned with the other sheets. This is the only row that closes the
  phase; a green check is necessary and has already been shown to be insufficient here.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `styles.css` serialized lane (`../spec.md` §4) | Only one phase may hold it; two legs are already running | Legs 039/040 hold the lane in turn and recapture on release |
| Dependency | `sheet-and-dropdown-inventory.md` (concurrent) | The instance task list cannot be final until it lands | Reports 40/41/43 are named tasks now; the rest is generated from the inventory in T002 |
| Risk | `SettingsTab` is a `PluginSettingTab`, whose body Obsidian owns | Med — restyling host DOM can break on an Obsidian update | Restyle by class on our own host wrapper, never by patching `Setting` internals; assert on our classes |
| Risk | Keyboard avoidance overlaps `022-selection-bar-keyboard-docking`'s `--db-keyboard-inset` | Med — two mechanisms publishing one inset | Reuse `022`'s published variable; do not add a second source of truth |
| Risk | Changing the close affordance touches 20 `DbModal` subclasses at once | Med | Add at the base, assert on the base's own story, spot-check three subclasses |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: opening a sheet adds no synchronous layout read beyond the one `applySheetChrome`
  already performs; the keyboard inset is published from a `visualViewport` listener, not polled.
- **NFR-P02**: the conformance check completes inside the existing `npm run gate` budget — it mounts
  the constructed scenarios `043` already built rather than opening a new capture pass.

### Security
- **NFR-S01**: N/A. No authentication, network or credential surface is touched.
- **NFR-S02**: N/A. No data leaves the vault; the phase changes presentation only.

### Reliability
- **NFR-R01**: every touch target introduced by this phase clears the 28px floor
  `touch-targets.mjs` ratchets, and the close affordance clears 44px.
- **NFR-R02**: a sheet whose drag is released mid-gesture restores its position rather than closing;
  `016`'s flick thresholds (`FLICK_PX_PER_MS`, `FLICK_MIN_PX`) are reused unchanged.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty input: a width field cleared to empty holds the last applied width rather than clamping to
  the minimum mid-keystroke — the existing `activeElement` guard at `database-view.ts` stays.
- Maximum length: a column name longer than the header truncates with an ellipsis; the header does
  not wrap to two lines and push the close affordance off the surface.
- Invalid format: a non-numeric width is ignored, not applied as `NaN`.

### Error Scenarios
- External service failure: N/A — no external service.
- Network timeout: N/A.
- Concurrent access: two sheets opened in sequence — the second's chrome must not inherit the
  first's keyboard inset. `031`'s `getPanel()` resolver is the precedent for resolving late.

### State Transitions
- Partial completion: a sheet dismissed by drag while a field is focused blurs the field first, so
  the keyboard retracts before the surface animates out.
- Session expiry: N/A. Rotation across the touch boundary re-applies presentation through
  `DbModal.applyPresentation`, which already exists for this reason.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 18/25 | ~16 files, ~700 LOC, one shared module plus every consumer |
| Risk | 14/25 | No auth/API/data; host-owned settings DOM and the serialized CSS lane carry the risk |
| Research | 8/20 | The inventory does the discovery; the contracts already exist |
| **Total** | **40/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Does the settings body get a local row grammar of its own, or a wrapper that restyles Obsidian's
  `Setting` rows in place? The second is cheaper and breaks on a host update; the first duplicates
  a host widget. Recorded, not decided.
- Is keyboard avoidance unconditional in `applySheetChrome`, or opt-in per instance? Unconditional
  is one behaviour to prove; opt-in avoids paying for it on sheets with no fields.
- Does `016`'s accepted 35px grab band carry into the surfaces this phase newly dresses, or does a
  fresh surface get the 48px the operator originally asked for? Reopening the number needs the
  operator, since the shortfall was accepted with evidence.
<!-- /ANCHOR:questions -->

---
