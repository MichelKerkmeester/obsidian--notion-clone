---
title: "Implementation Plan: Notion Sheet Refinement"
description: "How the two Notion shapes land: the cell menu as a tap-that-edits plus an explicit selection mode with a single-row bar, and the confirm as a declared card frame role — both additive over 044, 048 and 051, and both serialized against 067."
trigger_phrases:
  - "061 plan"
  - "cell menu plan"
  - "confirm card plan"
  - "selection mode implementation"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/061-notion-sheet-refinement"
    last_updated_at: "2026-09-06T19:30:00Z"
    last_updated_by: "design-research-session"
    recent_action: "Reconciled the plan to the 19:00 ruling; the ADR gate is closed"
    next_safe_action: "Leg A first; it touches no file 067 holds"
    blockers: []
    key_files:
      - "src/views/database-view.ts"
      - "src/views/confirm-sheet.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-061-plan"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Leg A and Leg B share only styles.css, so they can run in either order once the ADRs land"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Notion Sheet Refinement

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, an Obsidian plugin, no build framework |
| **Framework** | Obsidian API; the plugin's own `surface-shell` / `mobile-bottom-sheet` primitives |
| **Storage** | None — this packet changes presentation and gesture routing only |
| **Testing** | `vitest` for units; `tools/live/*` and `tools/storybook/verify-placement.mjs` for measured lane rows; `tools/screenshots` for captures |

### Overview
Two independent legs. **Leg A** is the operator's cell menu: one early return so a phone tap edits
rather than selects, a long press that enters selection, the phone's bottom-docked bar **deleted**
in favour of a three-control pill anchored to the selection and clamped clear of the phone
navigation bar, a titled `···` sheet behind it, the desktop bar collapsed to five children with an
anchored menu, and one missing `claimBottomDock` pair on the multi-line text editor. **Leg B** is
the confirm card: a declared third frame role on the sheet chrome, a `stackedActions` flag on the
shipped confirm builder, and two CSS blocks. Neither leg invents a mechanism — the frame-shape
classifier, the dock-claim registry and the published navigation-bar height all already ship and are
simply not reaching the surfaces that need them.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] ADR-001 to ADR-004 and ADR-006 ruled on by the operator — **closed 2026-09-06 19:00**. ADR-001 to ADR-004 `Accepted`; ADR-006 stays parked behind the Anytype multi-section re-read that is its own stated precondition, which `AC-007` accepts as closure. ADR-000 records the four-product read they were decided from
- [ ] `067`'s legs on `surface-shell.ts` / `mobile-bottom-sheet.ts` landed or explicitly interleaved
- [ ] Every threshold in `acceptance-criteria.md` re-read as red on the commit the leg branches from

### Definition of Done
- [ ] `npx tsc --noEmit` 0, `npx vitest run` all green, `npm run build` 0, read from `$?`
- [ ] `npm run gate` exit 0, read from a file rather than a pipe
- [ ] `node tools/screenshots/verify.mjs` current, and the changed PNGs opened and looked at
- [ ] `sheet-grammar.mjs` at or above 14 surfaces / 32 pairs, every row green
- [ ] Parent D5: the 32 Project Manager board and gantt captures `pixelHash`-identical
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Declared-not-inferred, twice. The card frame role is declared by the surface rather than derived
from its height; the selection mode is declared by a gesture rather than derived from a tap. Both
follow the discipline `051` already set for the floating/flush split and `067` restates for the
`menu` role.

### Key Components
- **`resolveCellTapAction`** (`table-cell-gesture.ts:269-273`) — the existing single answer to what a
  press means. Unchanged; the change is that its `edit-cell` answer is finally honoured.
- **`renderSelectionStatusBar`** (`database-view.ts:7607`) — the chrome builder. Its cell branch
  goes from eight children to **three** on a phone, in a pill rather than a bar, and to **five** in
  the bar on desktop; the rest move into the `···` sheet or menu. One builder emits both — the
  platform decides the frame, not the control set.
- **`claimBottomDock`** (`mobile-bottom-sheet.ts:710-718`) — the named-owner registry for the bottom
  edge. Gains its second cell-editor claimant.
- **`--db-mobile-navbar-height`** (`toolbar-renderer.ts:2410-2420`) — the measured navigation-bar
  height, already consumed by the mobile FAB. Its publication becomes unconditional on a phone.
- **`classifySheetFrameShape`** (`mobile-bottom-sheet.ts:364`) — the frame-shape toggle. Gains a
  third class applied only from a declaration.
- **`buildConfirmSheetBody`** (`confirm-sheet.ts:46`) — the shipped confirm primitive. Gains
  `stackedActions`.

### Data Flow
A press on a `td` reaches `resolveCellTapAction`, which answers `open-record`, `edit-cell` or
`select-cell`. Today only the first short-circuits; after Leg A the second does too, so the cell
renderer's own click handler (`cell-renderer.ts:571-592`) is the sole producer of the editor. An
explicit selection gesture is the only path that reaches `renderSelectionStatusBar`, which reads the
selection and builds one row. Any open editor claims the bottom dock, so the bar and the editor can
never be drawn on each other.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

The cell menu is a **cross-consumer** finding: two renderers hold their own copy of the same tap
grammar and the same bar builder, and a fix in one leaves the other diverged.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `database-view.ts:4786-4803` | The table view's cell press handler | update — early-return on `edit-cell` | `verify-placement.mjs` selection legs assert 0 bars after a touch tap |
| `embedded-database-renderer.ts:4384-4401` | The embedded renderer's own copy of the same handler | update — the same early return | The embed's own placement leg |
| `database-view.ts:7607-7712` | The chrome builder, cell branch | update — a three-child pill on a phone, a five-child bar on desktop, the rest behind `···`; plus the pill's anchoring and clamp | Pill-shape, bar-absence, child-count, clamp and reachability assertions |
| `database-view.ts:7713-7740` | The bar builder, row branch | unchanged in content, inherits the row shape and the anchoring | Existing row-selection legs still green |
| `embedded-database-renderer.ts:4569-4579` | The embed's own bar builder | update — kept in step | The embed's own legs |
| `styles.css:2645-2655` | The phone bar rule | **delete**, and add `.db-cell-selection-pill` | Bar-absence assertion, plus the clearance and clamp assertions against a stand-in `.mobile-navbar` |
| `styles.css:2590-2612` | The desktop bar rule | update — the same overflow shape at 30px | Desktop capture set |
| `cell-editor-text.ts:331` | `openTextPopoverEditor` | update — claim and release the dock | The `body.db-bottom-dock-taken` class asserted while the editor is open |
| `cell-editor-text.ts:190-233` | `openSingleLineEditor` | unchanged — already claims and releases | Regression only |
| `cell-editor-date.ts`, `cell-editor-option.ts`, `cell-editor-relation.ts` | The other editors | inventory first, then update or record as not-a-consumer | `rg -n "claimBottomDock" src/views/record-surface/` against the editor list |
| `toolbar-renderer.ts:2360` | The FAB-only publication guard | update — publish on a phone regardless | The var read on a container with no FAB |
| `confirm-sheet.ts:46-71` | The confirm primitive | update — `stackedActions` | `sheet-grammar.mjs`'s `confirm` row, action-layout column |
| `tools/live/sheet-grammar.mjs` | The grammar lane | update — card columns on the `confirm` row | Its own negative control |
| `tools/storybook/verify-placement.mjs` | The selection-bar legs (`:884`, `:894`, `:1254`, `:1299`, `:10622`) | update — wrap, child count, clearance | Each with a negative control |

Required inventories, to be run before the leg rather than after:
- Same-class producers of the bar: `rg -n "db-selection-status-bar" src/`.
- Same-class producers of the tap grammar: `rg -n "resolveCellTapAction" src/`.
- Dock claimants: `rg -n "claimBottomDock" src/`.
- Consumers of the copy strings: `rg -n "selection\.copy(Tsv|Markdown|Csv)" src/ tools/`.
<!-- /ANCHOR:affected-surfaces -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `resolveCellTapAction`'s three answers; the bar builder's child count per selection shape | `vitest` |
| Measured lane | Bar row count, child count, clearance, dock claim, confirm inset/radius/action layout | `tools/storybook/verify-placement.mjs`, `tools/live/sheet-grammar.mjs`, `tools/live/touch-targets.mjs` |
| Negative control | One per lane row: restore `flex-wrap: wrap`, drop the navigation-bar term, strip the card class, restore the tap fall-through — each must go red | The same lanes |
| Capture | The bar in its single-row shape and the confirm card, dark and light | `npm run screenshots`, then open the PNGs |
| Manual | The operator's own device read, in the same sitting as `067` AC-011 | iOS |

Every lane row carries a control. A row that cannot be made to fail is not a row (goal D3), and the
research's own account of `HANDLE_TO_TITLE_GAP_MAX_PX` — a threshold written around the state it
landed on and therefore passing the defect it was created for — is the failure this rule prevents.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| ADR-001 to ADR-004, ADR-006 | Internal — operator | **Green, 2026-09-06 19:00** | Was red: nothing may be implemented on a `Proposed` decision. ADR-001 to ADR-004 are now `Accepted` and ADR-006 is parked without gating a P0, so neither leg is blocked on a decision |
| `067-sheet-family-remediation` | Internal | Yellow | Holds `surface-shell.ts`, `mobile-bottom-sheet.ts` and reaches `styles.css`; Leg B serializes against it, Leg A only against the stylesheet |
| `067` AC-011 | Internal — operator | Red | AC-005 is read in that sitting and cannot be closed here |
| `screenshots/notion/` | Reference | Green | Already harvested; every capture this packet cites is on disk and was opened |
| The Anytype multi-section re-read | Internal — operator | Red | AC-007 stays parked until it is scheduled |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a lane row goes red that this packet did not touch, a Project Manager reference
  capture moves `pixelHash`, or the operator reads the new bar as worse than the old one.
- **Procedure**: each change is additive and reverts on its own. Leg A: restore the fall-through at
  `database-view.ts:4791`, restore `flex-wrap: wrap`, restore the three copy buttons. The
  navigation-bar term and the dock claim are independent fixes for independent defects and should
  **not** be reverted with the rest. Leg B: remove the `.db-sheet-card` and `.db-confirm-stacked`
  blocks and stop passing the role — with the class absent, the classifier produces exactly the two
  shapes it produces today.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
ADR ruling ──┬──► Leg A (cell menu) ──┐
             │                        ├──► Verification ──► Device sitting (067 AC-011)
             └──► Leg B (confirm card)┘
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| ADR ruling | Operator | Leg A, Leg B |
| Leg A — cell menu | ADR-002, ADR-003, ADR-004 | Verification |
| Leg B — confirm card | ADR-001, and `067`'s shell legs | Verification |
| Verification | Leg A, Leg B | The device sitting |
| Device sitting | Verification, one released build | AC-005 |

Leg A and Leg B share only `styles.css`, which the parent's CSS lane serializes anyway, so once the
ADRs land they can run in either order or in parallel worktrees. **Leg A goes first by default**: it
carries the operator's own report and it touches no file `067` holds.
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Leg A — cell menu | Med | ~250 LOC across 7 files plus 3 lane rows |
| Leg B — confirm card | Med | ~150 LOC across 5 files plus 1 lane row extension |
| Verification | Med | Gate, captures, and one negative control per row |
| **Total** | | **~450 LOC, 14 files** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Baseline captured: the current bar's child count, row count and rect, and the confirm's inset,
      radius and action layout, recorded before the first edit
- [ ] No feature flag — every change is a class or an early return and reverts by itself
- [ ] The 32 Project Manager reference captures hashed before the leg

### Rollback Procedure
1. Revert the leg's commit; both legs are self-contained.
2. Re-run `npm run gate` and read `$?`.
3. Re-run `node tools/screenshots/verify.mjs` and confirm the count returns to its pre-leg figure.
4. Tell the operator which of the two legs was reverted and which defect is therefore back.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A — nothing is persisted. The selection is in-memory state.
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  ADR ruling  │────►│  Leg A cell menu │────►│ Verification │
│  (operator)  │     └──────────────────┘     └──────┬───────┘
└──────┬───────┘                                     │
       │           ┌──────────────────┐              │
       └──────────►│ Leg B confirm    │──────────────┘
                   └──────────────────┘
                                                ┌──────▼───────┐
                                                │ 067 AC-011   │
                                                │ device read  │
                                                └──────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| ADR ruling | Operator | Five accepted or waived decisions | Leg A, Leg B |
| Leg A — tap and bar | ADR-002/003/004 | AC-001, AC-002, AC-003 | Verification |
| Leg B — confirm card | ADR-001, `067` shell legs | AC-004 | Verification |
| Register | Parent D15 | AC-006 | None — it is already written |
| Verification | Leg A, Leg B | A released build | The device sitting |
| Device sitting | A released build | AC-005 | Packet closure |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **ADR ruling** — the operator's, unbounded — CRITICAL
2. **Leg A, the cell menu** — the operator's own report — CRITICAL
3. **Verification and a released build** — CRITICAL
4. **The device sitting, shared with `067` AC-011** — CRITICAL

**Total Critical Path**: bounded by two operator steps, not by implementation.

**Parallel Opportunities**:
- Leg A and Leg B, once the ADRs land, in separate worktrees serialized on `styles.css`.
- The register (AC-006) is already written and needs no leg at all.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | ADRs ruled on | Five decisions Accepted or Waived, none left Proposed | **Met 2026-09-06 19:00** — four Accepted, ADR-006 parked with its precondition named |
| M2 | Leg A landed | AC-001, AC-002, AC-003 `Met` with each negative control observed red first | After M1 |
| M3 | Leg B landed | AC-004 `Met`, Project Manager captures `pixelHash`-identical | After M1 |
| M4 | Device sitting | AC-005 read against one build, in `067` AC-011's sitting | After M2, M3 and a release |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

The **seven** decisions live in `decision-record.md` and are not duplicated here. In one line each:

- **ADR-000** — the four-product read the operator ordered at 19:00: 50 captures across Notion,
  Anytype, Evernote and Fibery, finding that **zero of four dock a labelled action bar to the frame's
  bottom edge**. *Accepted.* It is the evidence ADR-002 to ADR-004 are decided from.
- **ADR-001** — the confirm keeps its sheet mount and gains a declared card frame role. *Accepted*,
  verbatim: *"Yes, centred card with stacked buttons"*.
- **ADR-002** — a phone tap on an editable cell edits and does not select. *Accepted.*
- **ADR-003** — the value editor is drawn **at the cell**, and claims the bottom dock for its whole
  life. *Accepted.* The `Proposed` version's named divergence from digest P9 is **withdrawn**: P9 is
  about a picker inside a property editor, not about a grid cell.
- **ADR-004** — **no bottom-docked bar on a phone.** A three-control anchored pill, with everything
  past `Copy` in a titled sheet behind `···`; desktop's bar collapses to five children with an
  anchored menu. *Accepted*, superseding the `Proposed` six-child bar of the same number.
- **ADR-005** — eight Notion-versus-Anytype conflicts, and none overrides a landed ruling.
  *Accepted*, because it records the status quo. The count survives the 19:00 read unchanged; the one
  conflict that read added is carried as **C-I** in its own addendum so neither count is ambiguous.
- **ADR-006** — grouped gutter bands stay parked behind an Anytype re-read. *Parked*, which `AC-007`
  accepts as closure; it gates no P0.

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
