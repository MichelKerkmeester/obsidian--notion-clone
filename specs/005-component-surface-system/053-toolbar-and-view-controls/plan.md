---
title: "Implementation Plan: Toolbar and View Controls"
description: "Five file-grouped legs that build the primitives first and migrate the surfaces onto them, each leg closed on a threshold observed red first, with the 050 item thresholds this phase keeps."
trigger_phrases:
  - "implementation plan"
  - "053 plan"
  - "toolbar legs"
  - "toolbar plan"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Toolbar and View Controls

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

Eight renderers, five mechanisms re-implemented per surface (`toolbar-surface-inventory.md` §1),
~1,200 LOC across 14 files. The dependency inside the work is itself: a dual-mode trigger (item 1)
is only expressible once `createControlClusterButton` carries a state, and the settings landing
(item 2) is only correct once `createSettingsEntry` is the one entry point. So the legs build the
primitive before the surface that consumes it, and no leg edits a file another leg owns (goal D6).

### Overview

Six legs. L0 gates everything (capture read). L1 builds the primitives module. L2-L5 migrate the
surfaces and land the `050` items, ordered so each leg's consumers exist by the time it runs.
`styles.css` is the one file more than one leg reaches; the parent's serialized CSS lane owns it.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready (per leg)
- T001's capture-read record names every capture the leg's design rows cite.
- Every threshold the leg closes has been run on the current tree and **observed failing**, with
  the figure in `checklist.md`.
- The leg's phone expression is stated, or its absence is stated with a reason.

### Definition of Done (per leg)
- The threshold passes, and the negative control for it was observed red.
- The leg's replaced vocabularies are **deleted**, not parked (goal D3) — grep-clean on the dual
  class, the close run, or the dead method the leg owned.
- The leg's lane row is permanent and green; `npm run gate` exits 0 read from `$?`.
- Any leg touching `board-renderer.ts`: the `screenshots/project-manager/` board reference is
  `pixelHash`-identical to its pre-leg baseline (parent goal D5).
- All three verification gates pass (`verification-gates.md`): `npx tsc --noEmit`,
  `npm run build`, `npx vitest run`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Additive module, subtractive migration. `toolbar-primitives.ts` is new and imports nothing from
`toolbar-renderer.ts` (the dependency points one way: renderers → primitives). Each migrated
surface loses the mechanism it migrated off — the close runs, the dual class, the dead methods —
in the same commit that lands its consumer. No surface keeps both paths.

### Key Components

- **`createPopoverShell`** — owns open/close, the anchor lease, `installPopoverAutoClose`, and the
  sibling-close sequence the 17 close runs encode. Panes declare a role from `design-system.md`
  §3 and size from it.
- **`createConditionRow`** — one property/operator/value row; filter and sort bind their own
  operator lists and value controls onto it. Keeps the condition-panel row floors
  (property/operator 140px, value 120px).
- **`createControlClusterButton`** — one trigger button with badge, `aria-expanded`, and a
  declared `add`/`active` state.
- **`createSettingsEntry`** — one settings trigger resolving per view type; the anchor-fallback
  classes survive as classes, not as methods.
- **`createTabStrip`** — one tab strip with drag, measured overflow and the context menu; used by
  the standalone view and the embed.

### Data Flow (item 10)

`ViewConfig.newRowPresets` (map: column key → string value) is set in the view-config panel,
read at creation by the same path `createEntry(defaults)` already exposes
(`toolbar-renderer.ts:157-159`), and skipped key-by-key when a preset names a column the schema
no longer has. A view with no presets reaches `createEntry(undefined, ...)` — byte-identical to
today's call.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:legs -->
## 4. LEGS

### L0 — Capture read (gate)

T001 only. Opens every capture named in `toolbar-surface-inventory.md` §3 and records, per row,
the file opened and one sentence on what the design takes from it. No code. Every later leg's
Definition of Ready points here.

### L1 — Primitives module (`toolbar-primitives.ts`)

Build all five constructors with their unit tests. No surface migrates yet — the module lands
complete so no leg edits the primitives file again. Consumer-first ordering inside the leg:
`createPopoverShell` and `createConditionRow` first (the largest duplications), then the strip,
cluster and settings constructors.

### L2 — Toolbar row shells (`toolbar-renderer.ts`)

Migrate T1-T10: tab strip, view-tab menu, add-view, all-views hub, title actions, utilities,
group-by, export, new button. Delete the seven dead methods and collapse the 17 close runs into
the shell's sibling sequence. Lane: close-sequence assertion on the view-tab menu; dead-method
grep count 0; dual-class count 0.

### L3 — Clusters and chips (`toolbar-renderer.ts` clusters + `active-view-controls-renderer.ts`)

Migrate T11-T15: the dual-mode filter and sort triggers (`050` item 1), the properties trigger's
state plumbing, the chip rail's direction colour and in-toolbar placement, the active-rule
popover's shared row. Lane: the four-combination filter × sort assertion (`050` AC-001's shape);
header-height before/after.

### L4 — Rule panels and conflict confirm (`filter-panel-renderer.ts`, `sort-panel-renderer.ts`,
`board-renderer.ts`, `table-renderer.ts`, `database-view.ts`)

Migrate T16-T18: condition rows onto the shared primitive; the sort-conflict confirm on board
card drag and table row reorder (`050` item 7). Lane: confirm raised / decline no-op / accept
clears-sort on both renderers; board reference `pixelHash` unchanged.

### L5 — Settings, presets and embed collapse (`view-config-panel-renderer.ts`,
`database-view.ts`, `embedded-database-renderer.ts`, `types.ts`)

Migrate T19, T23, T24 and T10's preset read: settings landing within 100ms of create/duplicate
(item 2), the presets section and creation read (item 10), the measured embed collapse (item 12).
Lane: timing assertion; byte-identical no-preset creation; width sweep from 250px with zero
overflow.

### Leg order and why

L2 before L3: the triggers live in the row the shells reorganize. L3 before L4: the panels'
condition rows bind to the primitive, and the confirm needs the trigger state that shows the sort
is active. L5 last: the settings entry resolves to surfaces the earlier legs stabilized, and the
preset read is the smallest slice.
<!-- /ANCHOR:legs -->

---

<!-- ANCHOR:adr -->
## L3: ARCHITECTURE DECISION RECORD

### ADR-001: The existing chip rail is extended, not rebuilt

**Status**: Proposed

**Context**: `050`'s checklist says item 1 starts from zero chips; the tree disagrees —
`active-view-controls-renderer.ts` ships a sort-then-filter rail with logic toggle, clear-all and
auto-hide. Rebuilding it would discard conformed, captured surface.

**Decision**: Extend. The rail gains the direction-coloured leading sort chip and the in-toolbar
band placement; the triggers gain their dual-mode states. The `050` AC-001 threshold is asserted
against the finished whole.

**Consequences**:
- Positive: less churn in a surface `003`'s inventory and the screenshot manifest already track;
  the auto-hide and overflow behaviour is already correct.
- Negative: `050`'s "Today" cell for item 1 is wrong as written. Mitigation: the correction is
  recorded in the parent `goal.md` §2 with citations, and the threshold itself is unchanged.

**Alternatives Rejected**:
- Rebuild the rail on a new primitive: two chip rows for one job, and the second one would have to
  re-earn every conformance the first already passed.

---

### ADR-002: Dead settings-entry methods are deleted, classes kept

**Status**: Proposed

**Context**: Seven methods with zero call sites stamp the exact classes two anchor-fallback
queries read (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`). Deleting them and
their classes together would break the fallbacks; keeping the methods keeps the entry point
unreadable.

**Decision**: Delete the methods, keep the classes. `createSettingsEntry` stamps the same
classes; the fallback queries resolve against the live trigger or against nothing, never against a
node a dead method drew.

**Consequences**:
- Positive: one settings path; the fallback contract survives unchanged.
- Negative: a future reader may look for the methods a class suggests. Mitigation: the class
  names live in the primitive's contract table (`spec.md` §5).

**Alternatives Rejected**:
- Keep the methods wired behind a flag: a second settings path is the defect this leg exists to
  remove.

---

### ADR-003: The sort-conflict confirm fires at commit, not at gesture start

**Status**: Proposed

**Context**: Item 7's confirm could gate the drag itself (refuse to start) or the drop (ask
before committing). The board carries the Project Manager 1:1 parity; any change to the drag's
visuals risks a reference pixel.

**Decision**: Gate the commit. The drag runs exactly as today; when sort rules are active, the
drop raises the confirm before writing. Decline leaves both order and sort unchanged; accept
clears the sort and commits.

**Consequences**:
- Positive: zero drag-visual change, so the board reference `pixelHash` comparison is meaningful;
  the confirm is testable as a pure commit-path branch.
- Negative: the reader learns about the conflict after the gesture, not before. Mitigation: this
  matches `050` AC-007's own wording ("asks before it commits").

**Alternatives Rejected**:
- Gate the drag start: changes the surface the parity lane photographs, for no threshold benefit.
<!-- /ANCHOR:adr -->

---

<!-- ANCHOR:milestones -->
## 5. MILESTONES

| Milestone | State | Evidence |
|-----------|-------|----------|
| M1: Captures read, designs trued | Pending | T001's record |
| M2: Primitives module complete, unit-tested | Pending | L1's vitest run |
| M3: All migration rows at target, vocabularies deleted | Pending | L2-L5 lane rows + grep-zero proofs |
| M4: Six `050` item thresholds green, red-first recorded | Pending | `checklist.md` evidence column |
| M5: Gate 0, replay reversed 0, PM parity unchanged | Pending | `npm run gate` / `npm run replay` / pixelHash diff |
| M6: Operator reads the rebuilt toolbar on device | Pending | Operator-owned; not tickable by an agent |
<!-- /ANCHOR:milestones -->

---

<!-- ANCHOR:ai-execution -->
## L3: AI EXECUTION FRAMEWORK

### Pre-Task Checklist (9 steps)
1. Load `spec.md` and verify scope hasn't changed
2. Load `plan.md` and identify the current leg (L0-L5)
3. Load `tasks.md` and find the next uncompleted task
4. Verify task dependencies are satisfied (L0 gates everything; L2 before L3 before L4 before L5)
5. Load the verification sections in `tasks.md` and identify the task's P0 items
6. Check for blocking issues in `decision-record.md` (ADR status: Proposed until the operator reviews)
7. Review `handover.md` and `_memory.continuity` for prior session context
8. Confirm understanding of the success criteria and the task's red-first threshold
9. Begin implementation only after all checks pass

### Execution Rules

| Rule | Description |
|------|-------------|
| TASK-SEQ | Complete tasks in dependency order; T001 gates all design work |
| TASK-SCOPE | Stay within the task's file boundary — one leg touches one file (goal D6) |
| TASK-VERIFY | Verify each task against its acceptance criterion, red-first |
| TASK-DOC | Update status immediately on completion, with the evidence link |
| TASK-SYNC | `styles.css` is the shared lane: one leg at a time, serialized by the parent's CSS lane |

### Status Reporting Format

```
## Status Update - [TIMESTAMP]
- **Task**: T### - [Description]
- **Leg**: [L0 | L1 | L2 | L3 | L4 | L5]
- **Status**: [IN_PROGRESS | COMPLETED | BLOCKED]
- **Evidence**: [file:line, lane output, or capture read]
- **Blockers**: [None | Description]
- **Next**: T### - [Next task]
```

### Blocked Task Protocol

1. Halt the task; do not improvise around the blocker.
2. Record the blocker in the task's own row in `tasks.md`, with the observed error.
3. If the blocker is a contradiction between documents, escalate per the parent's Logic-Sync
   protocol: state the two facts, name which document each comes from, ask which truth prevails.
4. If the blocker is an operator decision (an ADR still Proposed, or a D-threshold change), stop
   and ask — do not self-certify (parent goal D4).
5. Re-run the task's red-first check after any unblocking, before continuing.
<!-- /ANCHOR:ai-execution -->
