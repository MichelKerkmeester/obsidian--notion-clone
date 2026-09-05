---
title: "Feature Specification: Stacked Sheets"
description: "A sheet opened from inside another sheet must read as one stack: the child overlays the parent in place, the parent dims and scales back without moving, one scrim sits between them, and the child carries the same header, close and scroll grammar a first sheet carries."
trigger_phrases:
  - "stacked sheets spec"
  - "sheet over sheet"
  - "048 spec"
  - "stacking model"
  - "notion sheet stacking"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Stacked Sheets

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-05 |
| **Branch** | `worktrees/062-stacked-sheets` |
| **Parent Spec** | ../spec.md |
| **Phase** | 48 of 48 |
| **Predecessor** | 044-phone-sheet-alignment |
| **Successor** | None |
| **Handoff Criteria** | The stacking model lands in `mobile-bottom-sheet.ts` and `overlay-stack.ts`, every inventory row above rank 3 is migrated onto it, and one `sheet-grammar` lane row per stacked pair is green with its negative control observed red |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 48** of the component surface program. `044` gave a first phone sheet its grammar —
surface, handle, header with a close, padded rows, segmented choices, keyboard avoidance, safe-area
inset. On 0.0.23 the operator confirmed the part of that work the buttons depend on and then
reported the next surface out: *"Buttons work now but stacked sheets dont look or work right."*

**Scope Boundary**: what happens when a **second** sheet opens over a first. `044` owns what a
single sheet looks like and this phase does not reopen it. `003` owns the portal, `016` owns the
drag, `031` owns sheet lifecycle and dismissal. This phase adds one layer above all four: depth.

**Dependencies**:
- `044-phone-sheet-alignment` — the seven-element grammar a stacked child must also carry, and the
  `sheet-grammar` lane this phase adds rows to rather than replacing.
- `003-mobile-sheet-presentation` — the portal contract, and `sheet-and-dropdown-inventory.md`,
  which this phase extends along the stacking axis in `stacked-surface-inventory.md`.
- `031-sheet-lifecycle-ownership` — the tap-inside-sheet fix, operator-confirmed on 0.0.23. Without
  it none of this is reachable on a device.

**Deliverables**:
- `stacked-surface-inventory.md` — every parent → child → opener kind → current → target.
- A stacking model in `mobile-bottom-sheet.ts` / `overlay-stack.ts` that reads depth.
- Per-child migrations by inventory rank.
- A permanent `sheet-grammar` lane row per stacked pair, red before green.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Nothing in the plugin models a stack. Every sheet takes `z-index: var(--db-layer-modal, 1000)`
(`styles.css:194`), so two sheets are ordered by DOM position on the body alone; one shared
`.db-mobile-sheet-scrim` node sits behind **all** of them (`mobile-bottom-sheet.ts:478`), so a
parent under a child is not dimmed; `setSheetMount` (`:274`) appends a child and never looks at what
was already open; and each sheet writes its own keyboard inset when its own placement last ran
(`popover-position.ts:406`), so two sheets can disagree about where the floor is. `overlay-stack.ts`
already declares a `parentId` on every surface (`:47`) and **never reads it** — the shape is there
and nothing consumes it.

The operator's three captures on 0.0.23 are three views of the same absence.

### Purpose

A child sheet reads as a card laid over its parent: the parent stays exactly where it is, dims and
scales back a step, one scrim sits between them, and the child looks like a sheet rather than like a
panel that happened to arrive.

### The three reports, verbatim from the operator's 2026-09-05 07:02 CEST pass on 0.0.23

| Capture | What the operator reported |
|---|---|
| `../scratch/device-2026-09-05/stacked-properties-create-property.png` | Properties sheet → *"Create property"* opens as an Obsidian modal stacked over two peeking parent sheets, **no dim or push-back** |
| `../scratch/device-2026-09-05/stacked-filter-operator-dropdown.png` | The operator dropdown in the filter sheet opens as a **second sheet at the bottom** while the filter sheet is **shoved to the top** — two sheets splitting the viewport |
| `../scratch/device-2026-09-05/stacked-filter-property-picker.png` | The property picker **covers most of the screen**, the parent filter sheet **vanishes**, the list is **cut off mid-row** with no title, no header or close, and no scroll affordance |
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The stacking model to build toward

Notion-like, and the phrasing is deliberate: this is a contract, not a mood.

1. **The child overlays the parent in place.** The parent does not move. Its bounding box is
   unchanged on every edge while a child is open, |Δ| ≤ 1px.
2. **The parent dims and scales back a step**, the way iOS stacks a modal over its presenter. Depth
   is read from the stack, never computed by a surface.
3. **The child carries the header-everywhere grammar `044` decided**: a title, a 44px close, 16px
   row inset, 16px title. A child with no header is non-conforming however it was opened.
4. **Dismissing the child returns to the parent with its state intact** — scroll offset, draft
   values, focus. A child close that rebuilds the parent is a regression.
5. **The scrim belongs to the topmost sheet only.** Two sheets open means one scrim, sitting between
   them, not one behind both.
6. **The keyboard inset applies to the topmost sheet.** The sheet beneath holds zero and does not
   move when the keyboard opens over its child.
7. **Drag-to-dismiss on the child never moves the parent.** The gesture is bound to the child's own
   node and the parent's transform is the stack's, not the gesture's.
8. **A child list longer than the viewport scrolls inside the sheet**, with a visible fade or
   scrollbar at the cut. A row bisected by the sheet's bottom edge with nothing to say the list
   continues is the defect in the third capture.

### Decision D1 — operator-owned, open

**An Obsidian `Modal` opened from inside a sheet — create property, confirms, date pickers — must
present as a sheet too on the phone, or the phone flow must use a sheet instead of the modal.**

**Recommendation: present as a sheet.** `DbModal` already declares a presentation per subclass
(`db-modal.ts:56`), so the mechanism exists and the change is to give those subclasses the header
`createSheetHeader` builds rather than to fork the flow. The alternative — replacing each modal with
a bespoke phone sheet — creates a phone branch and a desktop branch per flow, twenty subclasses
deep, and this program has already paid once for two answers to one question
(`popover-position.ts:363-372`). The operator decides; this packet does not proceed past T007 on the
modal rows until they do.

### In Scope
- The stacking model itself, in `mobile-bottom-sheet.ts` and `overlay-stack.ts`.
- `stacked-surface-inventory.md`, code-derived, with a `file:line` opener per row.
- Migrating each inventory row onto the model, by rank.
- One `sheet-grammar` lane row per stacked pair, each observed red before green.
- Making `overlay-stack.ts`'s existing `parentId` load-bearing.

### Out of Scope
- **A first sheet's own grammar** — `044`'s, and reopening it here would give two owners one contract.
- **The portal and the drag** — `003` and `016`. Consumed unchanged, per `044` D3.
- **Dismissal routing and the tap-inside-sheet class** — `031`'s. Operator-confirmed on 0.0.23.
- **Desktop anchored popovers** — nothing below changes a surface that is not presenting as a sheet.
- **The inline cell editor** — deliberately not a sheet (`003` inventory §9). Only its bottom-dock
  claim is arbitrated here.
- **Rewriting `003`'s inventory** — extended by reference, not edited.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/mobile-bottom-sheet.ts` | Modify | Depth-aware mount: parent treatment on push, restore on pop; scrim between the top two rather than behind all |
| `src/views/overlay-stack.ts` | Modify | Make `parentId` load-bearing; expose depth and the surface beneath the top |
| `src/views/popover-position.ts` | Modify | Keyboard inset published to the topmost sheet only |
| `src/views/dropdown-field.ts` | Modify | Stacked dropdowns get a header with a title and a 44px close |
| `src/views/owned-menu.ts` | Modify | Same, for the owned-menu sheet |
| `src/views/modals/db-modal.ts` | Modify | Sheet-presented modals get the shared header, subject to D1 |
| `src/views/column-manager-renderer.ts` | Modify | `createSheetHeader` instead of the hand-built header at `:166` |
| `src/views/date-value-picker.ts` | Modify | Header on the stacked picker |
| `src/views/icon-picker-popover.ts` | Modify | Header on the stacked picker |
| `src/views/option-color-picker.ts` | Modify | Header on the stacked picker |
| `styles.css` | Modify | Parent dim/scale, per-depth ordering, scroll fade at the cut |
| `tools/live/sheet-grammar.mjs` | Modify | A registry row per stacked pair, and a stacking negative control |
| `specs/.../048-stacked-sheets/stacked-surface-inventory.md` | Create | Done — the inventory |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | The inventory names every surface that can open while another sheet is open, grouped parent → child → opener kind → current → target, each row citing the `file:line` that constructs the child. |
| REQ-002 | A parent sheet's bounding box does not change while a child is open. The parent dims and scales back; it does not move. |
| REQ-003 | Exactly one scrim exists while two sheets are open, and it sits between them rather than behind both. |
| REQ-004 | Every stacked child carries a header with a title and a 44px close, a 16px row inset and a 16px title — `044`'s grammar, unchanged. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | The keyboard inset is published to the topmost sheet only; the sheet beneath holds zero and does not move for a keyboard opened over its child. |
| REQ-006 | Dismissing a child returns to the parent with its scroll offset, draft values and focus intact, and drag-to-dismiss on the child leaves the parent's transform to the stack. |
| REQ-007 | A child taller than the viewport scrolls inside its own sheet with a visible fade or scrollbar at the cut. |
| REQ-008 | `npm run gate` exits 0 with one `sheet-grammar` row per stacked pair, each observed red before green, and a stacking negative control that removes the parent's dim. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The operator opens the Properties sheet, the filter sheet's operator dropdown and its
  property picker on iOS and reads each as one stack rather than two sheets.
- **SC-002**: Zero stacked children reach the screen without a header, measured against the
  inventory rather than against a grep.
- **SC-003**: Parent bounding-box delta ≤ 1px, scrim count == 1, and topmost-only keyboard inset,
  each with a failing number recorded before the fix.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `044`'s `sheet-grammar` lane | Without it there is nowhere to register a stacked pair | It exists and is green at `7b976e28`; this phase adds rows rather than a lane |
| Dependency | D1, operator-owned | Six modal rows in the inventory cannot be migrated until it is answered | The non-modal rows — the largest class — do not wait on it |
| Risk | A parent transform creates a containing block | High. A transformed ancestor makes `position: fixed` resolve against the parent, which is the exact failure `mobile-bottom-sheet.ts:264-270` records for the portal | Parents and children are siblings on the body, never nested, so a parent's transform cannot contain a child. Asserted in the lane, not assumed |
| Risk | The scrim moving between sheets flickers on every push and pop | Medium. The scrim is one node reused across sheets by design (`:478`) | Move the node rather than recreating it; the entrance keyframe is a one-shot on creation only |
| Risk | Depth-3 chains — record → owned menu → submenu, Properties → modal → dropdown | Medium. A model tested only at depth 2 breaks at 3 | The inventory names four depth-3 chains; the lane registers one |
| Risk | `fullscreen` modals as parents | Medium. `FormulaModal` and `PropertyTypeConflictModal` present fullscreen, so a dropdown stacks over a surface that is not a sheet | Named as a third arrangement in the inventory §3.8; a rule for it is REQ-004's boundary, decided at T005 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: A child push adds no layout beyond the parent's own transform and opacity — both
  compositor properties, no reflow of the parent's subtree.
- **NFR-P02**: Push and pop complete within the shared sheet duration (`--db-sheet-enter`), the same
  budget the entrance already runs on.

### Security
- **NFR-S01**: No new document-level listener per sheet. Depth is read from the existing single
  `OverlayStack`, whose listeners are already per-document and torn down when idle
  (`overlay-stack.ts:214-222`).
- **NFR-S02**: A parent under a child is not interactive. The scrim between them takes the press;
  nothing reaches a control the person cannot see.

### Reliability
- **NFR-R01**: A child removed with a bare `.remove()` still restores its parent. The existing
  `MutationObserver` (`mobile-bottom-sheet.ts:464`) is the precedent: correctness by construction
  rather than by every producer remembering.
- **NFR-R02**: A parent rebuilt while a child is open leaves the child reachable and closable, never
  orphaned into a detached tree.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty input: a child with zero rows — an empty dropdown — still gets a header and a close.
- Maximum length: a child list longer than `90svh` scrolls inside itself, with the cut marked.
- Invalid format: a child whose parent is not a sheet — a desktop popover, a `fullscreen` modal —
  takes the unstacked path rather than half of this one.

### Error Scenarios
- Parent destroyed while the child is open: the child stays reachable and closes to whatever is
  beneath, rather than being reinserted into a detached tree (`mobile-bottom-sheet.ts:337-340`).
- Child removed without taking its chrome down: the watcher prunes it and the parent is restored.
- Keyboard opens over a depth-3 stack: only the top surface insets.

### State Transitions
- Partial completion: a child dismissed mid-edit leaves the parent's draft intact (REQ-006).
- Session expiry: not applicable — no session state is held by a sheet.
- Rotation across the touch boundary while stacked: `applyPresentation` re-runs (`db-modal.ts:65`)
  and the stack is re-read rather than rebuilt.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 18/25 | 13 files, ~600 LOC estimated; `recommend-level.sh --loc 600 --files 13 --architectural` → 64/100 |
| Risk | 14/25 | No auth, no API, no data. The risk is a shared surface mechanism every view consumes |
| Research | 8/20 | The inventory is written; what remains is runtime confirmation of three named items |
| **Total** | **40/70** | **Level 2** — phase score 10/50 against a 25 threshold, so a standard child, not a phase parent |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- **D1**: do Obsidian modals opened from a sheet present as sheets, or does the phone flow use a
  sheet instead of the modal? Operator-owned; recommendation recorded in §3.
- What scale-back step does the parent take — iOS's 0.92, or something smaller on a 390pt screen
  where 8% is 31pt of visible movement?
- Does a `fullscreen` modal parent take the stacking treatment, or is it exempt like the desktop
  anchored path?
<!-- /ANCHOR:questions -->

---

