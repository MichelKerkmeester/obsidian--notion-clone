---
title: "Feature Specification: Notion Toolbar Refinement"
description: "Refine the view toolbar and its view controls against the Notion screen digest: a confirm in front of the two unconfirmed delete-view paths, a zero-rule filter entry tier in front of the nested builder, search on two condition dropdowns, one collapse rung, a chip-rail add control, per-group visibility, a named conditional-colour view-settings row — and every Notion-versus-Anytype conflict recorded as an ADR rather than applied."
trigger_phrases:
  - "064 spec"
  - "notion toolbar refinement"
  - "delete view confirm"
  - "filter entry tier"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Notion Toolbar Refinement

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
| **Branch** | `worktrees/180-notion-toolbar` |
| **Parent Spec** | ../spec.md |
| **Phase** | 64 of 68 |
| **Predecessor** | 053-toolbar-and-view-controls |
| **Successor** | None |
| **Handoff Criteria** | `053` owns every file this packet edits. It is sequenced after any `053` leg still open in `toolbar-renderer.ts`, `filter-panel-renderer.ts`, `sort-panel-renderer.ts` or `active-view-controls-renderer.ts`, and `styles.css` is serialized by the parent's CSS lane |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is the reserved `064` child of the parent's D15 Notion-refinement pipeline — the toolbar and
view-controls slot, owner `053-toolbar-and-view-controls`.

**Scope Boundary**: the toolbar row, the filter and sort panels, the chip rail, the group popover
and the two delete-view call sites. It does not touch the table, the board, the calendar, the
record surfaces, the dropdown primitive or the sheet shell — each has its own owner and, where the
Notion pipeline reached it, its own `059`-`066` child.

**Dependencies**:
- `053`'s five landed primitives, which this packet extends and never replaces.
- `051`'s confirm primitive (`confirm-sheet.ts`), consumed by REQ-001 under `053` goal D8.
- `048` D1's stacking model, which decides how REQ-001's confirm presents on a phone.
- Three ADRs ruled 2026-09-07 (Europe/Amsterdam) — ADR-001 and ADR-005 Accepted, ADR-007 Declined.
  No ADR here still gates a leg.

**Deliverables**:
- A confirm in front of both `deleteView` call sites, in the branch ADR-005's read finds
  unrecoverable; an Undo toast in the branch where an existing path already covers it.
- A zero-rule entry tier in the filter panel, with the nested builder untouched.
- `searchable` on the filter and sort field dropdowns and the select/status value dropdown.
- One text→icon collapse rung ahead of the landed cluster ladder.
- An add control in the active-rule chip rail.
- A first-class *Conditional color* row in the view-settings summary block, with an explainer —
  inherited from `062` ADR-003 and the operator's 18:32 ruling, not proposed here.
- Ten ADRs recording every Notion-versus-Anytype disposition the loop named, plus the inherited
  ruling.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

A five-iteration Notion research loop read 104 captures against this surface and found that twelve
of the digest's thirteen patterns are already ours — the toolbar was built to this grammar before
Notion's captures were read. What it also found is that a configured view is destroyed by one tap
with no confirmation and no undo (`toolbar-renderer.ts:1180`, `:1330`, `database-view.ts:3445`),
and that the commonest filter — one property, one operator, one value — costs three clicks because
the panel has exactly one entry surface (`filter-panel-renderer.ts:197-202`). Four smaller gaps sit
behind those two.

### Purpose

Take the six additive refinements Notion's captures justify, at thresholds observed red on this
tree first, without reopening a single landed Anytype ruling.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- A confirm on the `deleteView` paths, consuming `051`'s confirm primitive — but only in the branch
  ADR-005's read finds unrecoverable; the other branch is an Undo toast, no confirm.
- A zero-rule property-list entry tier in the filter panel.
- `searchable: true` on two field dropdowns and one value dropdown, gated at 8 options.
- A text→icon rung for the New button's label, ahead of the landed cluster-hiding ladder.
- An add control in the chip rail, one per rule group.
- A named conditional-colour row in the view-settings summary block
  (`view-config-panel-renderer.ts:510-518`), with an explainer, opening the existing section.
- Ten ADRs, and the record corrections the loop and this landing produced.

### Out of Scope
- **The landed collapse order** (`053`'s `AC-012` / T008) — Notion's New-survives invariant is named
  as a conflict in ADR-001 and the order is not reopened. Additive rung only.
- **The nested filter builder** — `053` goal D4 rules it stays; REQ-002 extends the branch in front
  of it and changes nothing inside it.
- **A second confirm surface** — `053` goal D8 makes the confirm primitive `051`'s. REQ-001 consumes
  it.
- **Multi-value checkbox filter pickers** — blocked on a `FilterRule` value-shape ruling, which is a
  data-model change and not this surface's (research F-204).
- **A phone view switcher** — both references use one and ours keeps measured tabs; unmeasured
  either way, so it is a device question, not a task (F-402).
- **Notion-only features** — the AI view box, multiple data sources per database, dashboard and map
  layouts. No our-side surface exists to change. **Conditional colour is not one of them** and was
  wrongly listed here at this packet's opening: it ships (`conditional-formatting.ts:168-206`), and
  `062` ADR-003's operator ruling makes its view-settings row REQ-009 below.
- **Per-group visibility in this packet's group popover** — **Declined by ADR-007**, 2026-09-07,
  verbatim *"Groups panel only"*. Per-group visibility lives in `059`'s Groups panel only; this
  packet's popover keeps just its existing "show empty groups" switch and gains no eye toggle.
  `boardHiddenGroups` (`types.ts:560`) stays `059`'s to write and to read for the table renderer.
- **The table, board, calendar, record, dropdown and state surfaces** — other owners, other children.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/toolbar-renderer.ts` | Modify | Confirm (Branch A) or Undo toast (Branch B) at `:1180` and `:1330`; collapse rung in `applyToolbarChromeCollapse` (`:2561-2598`) |
| `src/views/filter-panel-renderer.ts` | Modify | Zero-rule entry tier at `:197-202`; `searchable` at `:494-501` and `:576-590` |
| `src/views/sort-panel-renderer.ts` | Modify | `searchable` at `:199-206` |
| `src/views/active-view-controls-renderer.ts` | Modify | Per-group add control in `render()` (`:72-180`) |
| `src/views/database-view.ts` | Read (the ADR-005 branch determination), Modify if the confirm/toast wiring reaches here | Whether view deletion is recoverable by any existing undo path (`:3445-3456`) |
| `src/views/view-config-panel-renderer.ts` | Modify | REQ-009's named conditional-colour summary row and its explainer, beside the three `renderAppliedSummaries` already emits (`:510-518`); the existing `renderConditionalFormatting` section (`:747`) is opened, never duplicated |
| `styles.css` | Modify | One class for the add control and one for the collapsed label; both reuse the landed value inventory |
| `tools/live/toolbar-collapse-sweep.ts` | Modify | The REQ-004 assertion, red-first |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | **A confirm stands in front of a `deleteView` path only when the deletion is unrecoverable.** Read the persistence layer first (`database-view.ts:3445-3456`): if no existing undo path covers it, both call sites — the all-views hub row (`toolbar-renderer.ts:1180`) and the tab context menu (`:1330`) — raise `051`'s confirm (the `061`/`067` centred card, one danger weight) before `actions.deleteView(index)`; decline is a no-op, accept deletes exactly once, and on a phone the confirm presents as a stacked bottom sheet per `048` D1. If an existing undo path covers it, no confirm is raised and an Undo toast presents instead. **Ruled by ADR-005** (Accepted 2026-09-07, verbatim *"Confirm only if unrecoverable"*) — not gated |
| REQ-002 | **The filter panel answers a zero-rule state with a property list, not a hint.** Opening the panel with no rules renders a searchable flat property list; picking a property creates the first leaf through the existing `appendLeaf` / `createDefaultFilterRule` path; a `+ Add advanced filter` footer switches to the tree. Any panel with at least one rule renders exactly as today |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | **The condition rows' property and value dropdowns search when the list is long.** `searchable: true` at `filter-panel-renderer.ts:494-501`, `:576-590` and `sort-panel-renderer.ts:199-206`, gated inside `createDropdownField` at 8 options so short lists stay clean. The flag and its precedent already exist (`view-config-panel-renderer.ts:1558` — the one real pass-`true` site; `:2064` and `:2082` are `renderSelect`'s parameter and its pass-through) |
| REQ-004 | **The New button's label collapses to its icon before any cluster is hidden.** One rung added at the head of `applyToolbarChromeCollapse` (`:2561-2598`), ahead of the `:2571` targets loop. The landed drop order is not changed and still applies, unmoved, after the icon step. **Ruled by ADR-001** (Accepted 2026-09-07, verbatim *"Yes, icons first then the drop order"*) — not gated |
| REQ-005 | **The chip rail carries its own add control.** One `db-active-control-add` button per rule group in `active-view-controls-renderer.ts` `render()`, wired to the existing panel toggles, at the landed 28px chip pitch |
| REQ-007 | **The packet's own record says what the tree says.** Two corrections the loop produced are written down rather than absorbed: the digest's §4 P3 row is stale because the desktop side sheet landed after it was written, and the digest's §6 Q4 is answered — our control cluster carries no text label to collapse, so the density comparison lives only on the New button |
| REQ-009 | **Conditional row colour is found where Notion puts it: its own named view-settings row.** A fourth summary row beside Properties/Filters/Sorts in `renderAppliedSummaries` (`view-config-panel-renderer.ts:510-518`), reading the rule count already on `ViewConfig.conditionalFormats`, carrying an explainer in the panel's own `hintClass()` idiom, and opening the existing `renderConditionalFormatting` section (`:747`) rather than a second editor. **Not gated** — `062` ADR-003 is Accepted, ruled by the operator 2026-09-06 18:32: *"Yes, own row in view settings"* |

### P2 - Nice to have

| ID | Requirement |
|----|-------------|
| REQ-006 | ~~A group can be hidden from the group popover. An eye toggle per group row for select/status group fields, persisted as a per-view hidden-group set that the board and table renderers consume.~~ **Declined by ADR-007** (2026-09-07, verbatim *"Groups panel only"*) — per-group visibility lives in `059`'s Groups panel only; this packet's popover keeps just its existing "show empty groups" switch. Closes **Waived**, `acceptance-criteria.md` AC-010 |
| REQ-008 | **The operator reads the refined toolbar on a device.** Four device-only checks the loop named ride `053` AC-111 and close with it, not here |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A view cannot be destroyed without a confirmation, on either path, on either platform.
- **SC-002**: The single-property filter costs one click from the panel's zero-rule state, against
  three today, and a panel that already holds a rule is byte-identical to today's.
- **SC-003**: No landed Anytype ruling is overturned. Every Notion-versus-Anytype conflict the loop
  named carries an ADR; the ones that touch a landed ruling stay **Proposed**.
- **SC-005**: Conditional row colour is reachable from the view-settings panel by name, with the
  capability unchanged — the same rules, the same paint, one more way in.
- **SC-004**: No new CSS value is minted. Every geometry this packet writes is already in the landed
  inventory the research recorded.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `051`'s confirm primitive (`confirm-sheet.ts:46`) | REQ-001 cannot land without it | It ships today; `ADR-003`'s sort-conflict confirm already consumes it. Never build a second |
| Dependency | `053`'s open legs in the same files | Merge collisions | One leg touches one file group (`053` D6); this packet is sequenced after any `053` leg still in them |
| Risk | REQ-001's confirm-or-toast branch is picked without reading the persistence layer | Medium | ADR-005 requires the read as the leg's first line, not a risk beside it; `database-view.ts:3445-3456` is where it is taken |
| Risk | REQ-004 adds a rung to a lane assertion that already passes | Low | The sweep assertion is written red-first; a rung that changes nothing measurable would leave it green and prove nothing |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The zero-rule property list renders inside the panel's existing open path; no
  additional measured delay against the 100ms landing budget `053` already carries for view
  settings.
- **NFR-P02**: The collapse rung is read once per resize, on the existing ResizeObserver
  (`toolbar-renderer.ts:920`-driven collapse), and adds no second observer.

### Accessibility
- **NFR-A01**: The confirm's destructive action is reachable by keyboard and its label names the
  view, so the control is not "Delete" alone.
- **NFR-A02**: The chip-rail add control carries an `aria-label`; it is icon-sized at the 28px chip
  pitch and is not the only signal that a rule can be added.
- **NFR-A03**: The collapsed New label keeps its accessible name — the label collapses visually, the
  `aria-label` does not.

### Reliability
- **NFR-R01**: Declining the delete confirm leaves `db.views` byte-identical; accepting deletes
  exactly one view.
- **NFR-R02**: A panel holding at least one filter rule renders identically before and after
  REQ-002, which is the negative control REQ-002 is measured against.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- **The last view.** `deleteView` already returns early at `db.views.length <= 1`
  (`database-view.ts:3447`). The confirm must not be raised for a delete that cannot happen.
- **A database with no properties.** The zero-rule entry list has nothing to list; it falls back to
  today's hint rather than rendering an empty list.
- **Exactly eight options.** REQ-003's gate is "more than 8", so the eight-option case renders no
  search input and is the negative control.
- **A group field that is not select or status.** REQ-006's toggle does not render, and that absence
  is asserted rather than assumed.

### Error Scenarios
- **The confirm is dismissed by the scrim or Escape.** Treated as decline, never as accept.
- **A hidden group whose option is deleted from the column.** The hidden-group set holds a value
  that no longer exists; it is ignored on read rather than resurrecting an empty column.

### State Transitions
- **A filter rule added from the entry tier, then removed.** The panel returns to the zero-rule
  state and the entry tier again, not to an empty tree view.
- **Collapse and re-expand.** The New label returns when width allows; the rung is reversible and
  carries no persisted state.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 18/25 | ~600 LOC across 10 files, plus one lane assertion and the CSS classes |
| Risk | 13/25 | Three renderers, one shared primitive consumed not built, one `ViewConfig` field; no auth or API surface |
| Research | 12/20 | Done — five iterations, 34 findings, every red re-derived against this tree |
| **Total** | **43/70** | **Level 2** (`recommend-level.sh --loc 600 --files 10 --db`: 48/100, confidence 82%, phase score **0/50** against the 25 bar, so a standard child and never a phase parent) |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- **ADR-001 — RULED, 2026-09-07.** Operator, verbatim: *"Yes, icons first then the drop order"*. A
  text→icon rung sits ahead of `053`'s approved AC-012 drop order; the drop order itself is
  unchanged and still applies after the icon step.
- **ADR-005 — RULED, 2026-09-07.** Operator, verbatim: *"Confirm only if unrecoverable"*. Not the
  blanket confirm this ADR proposed — see the UNKNOWN row below, which the ruling turns from a risk
  into the branch selector.
- **ADR-007 — RULED, 2026-09-07.** Operator, verbatim: *"Groups panel only"*. Per-group visibility
  is `059`'s; this packet's REQ-006 closes Waived and the popover keeps its existing switch.
- **ADR-004** — does the property list stay one surface? The digest's own §6 Q6 left it unresolved,
  and this packet declines the split on capability grounds rather than on a ruling.
- **UNKNOWN, verification gap, still owed** — is a deleted view recoverable by any existing undo
  path? ADR-005's ruling makes this the branch selector rather than a severity risk: the
  implementation leg reads the persistence layer (`database-view.ts:3445-3456`) before either
  branch — the confirm card or the Undo toast — is written.
- **Inherited from the digest, not this packet's to answer** — exactly one dark-theme Notion capture
  of this surface exists (`9aed23d0`), so a dark-theme cross-check of Notion's toolbar chrome needs a
  new harvest, not a re-read.
<!-- /ANCHOR:questions -->
