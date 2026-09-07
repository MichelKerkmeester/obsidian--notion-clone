---
title: "Acceptance Criteria: Notion Toolbar Refinement"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "064 acceptance criteria"
  - "notion toolbar closure gate"
  - "delete confirm criterion"
  - "collapse rung criterion"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/064-notion-toolbar-refinement"
    last_updated_at: "2026-09-07T00:00:00Z"
    last_updated_by: "implementation-session"
    recent_action: "Closed AC-001/002/004-009/012 as Met after implementation"
    next_safe_action: "AC-011 rides 053 AC-111 — only the operator closes it"
    blockers:
      - "AC-011 is the operator's and rides 053 AC-111; nothing here can close it"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/filter-panel-renderer.ts"
      - "src/views/database-view.ts"
      - "src/views/active-view-controls-renderer.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "tools/live/toolbar-collapse-sweep.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-064-acceptance"
      parent_session_id: null
    completion_pct: 92
    open_questions: []
    answered_questions:
      - "The ten dispositions are recorded in decision-record.md and none is applied over a landed ruling"
      - "AC-012 is inherited from 062 ADR-003 and is not gated: the operator ruled it at 18:32"
      - "ADR-001 and ADR-005 Accepted, ADR-007 Declined — ruled 2026-09-07 (Europe/Amsterdam)"
      - "ADR-005's persistence-layer read found Branch B applies: deleteView already saves through the generic config-history path, which already makes the deletion undoable — an Undo toast was built, no confirm"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion Toolbar Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/064-notion-toolbar-refinement
**Level:** 2
**Status:** Implemented — pending the operator's device sitting (AC-011)
**Date:** 2026-09-06
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

Every row's Verification cell names the command or artifact that decides it, and exit statuses are
read from `$?`, never through a pipe. Where a row records a value observed on today's tree, that
value was read in this worktree at `80c2bb48` and **re-read at the landing**, after the rebase onto
`31eafb60`. Those twenty-seven commits touched `styles.css` and `view-config-panel-renderer.ts` but
left the six toolbar-family source files byte-identical, so every red below is about the code and
not about drift; the two citations that did move with them are corrected in place and recorded in
`goal.md` §4.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a database with more than one view, and the persistence-layer read (`database-view.ts:3445-3456`) taken first for whether a deleted view is recoverable by any existing undo path, When the view is deleted from the all-views hub row (`toolbar-renderer.ts:1180`) or from the tab context menu (`:1330`), Then **Branch A (unrecoverable)**: `051`'s confirm (`buildConfirmSheetBody`, `confirm-sheet.ts:46`), presented as the `061`/`067` centred card at one danger weight, is raised, its copy names the view, declining is a no-op and accepting deletes exactly one view; **Branch B (an undo path covers it)**: no confirm is raised, the view is deleted, and an Undo toast presents whose Undo action restores it — the same shape `051` ADR-007's E4 ruled for row deletion | **The read found Branch B applies**: `deleteView` already saves through `saveCurrentViewConfigInBackground` → `saveViewEntryConfig` → `recordConfigHistory`, which pushes an undoable `"config"` history entry the toolbar's own Undo action and Ctrl+Z already read — no existing-undo-path assumption to build, it is already wired. `src/views/database-view.test.ts`'s "DatabaseView deleteView" block: deleting from a 2-view database raises no confirm, records the entry labeled `undo.deleteViewConfig`, and `undoLastEdit()` restores both views; `src/views/toolbar-renderer.test.ts` pins that neither call site gained `buildConfirmSheetBody`/`confirmWithModal`. `npx vitest run` exit **0** | Met | - |
| AC-002 | REQ-001 | Given a database with exactly one view, When the toolbar renders, Then no confirm is raised for the delete that cannot happen — the `database-view.ts:3447` early return precedes any confirm, in either of AC-001's branches | The same block's one-view case; the criterion asserts the guard, not merely the absence of a dialog | Met | - |
| AC-003 | REQ-001 | Given the confirm open on a phone under AC-001's Branch A, When it presents, Then it is a stacked bottom sheet per `048` D1, and `044`'s sheet grammar and `048`'s stacking stay green. Branch B raises no confirm, so this row does not apply to it | ADR-005's read resolved to Branch B (see AC-001), so Branch A never ships and this row's own precondition — a confirm existing to present — is never met. `npm run gate`'s `sheet-grammar` and `sheet-rebuild` rows stay green regardless (exit **0**), since nothing here changed the sheet-presentation primitives | Superseded | ADR-005 |
| AC-004 | REQ-002 | Given the filter panel with zero rules, When it opens, Then a searchable flat property list renders, built from the `toPropertyDropdownOption` vocabulary (`filter-panel-renderer.ts:497`), picking a property creates the first leaf through `createDefaultFilterRule` (`:90`) and `appendLeaf` (`:223`), and a `+ Add advanced filter` footer switches to the tree | `src/views/filter-panel-renderer.test.ts` asserts the entry tier's structure, the leaf-creation path and the distinct footer wording; the live `sheet-rebuild` lane mounts the real `FilterPanelRenderer` and exercises this exact branch end to end. `npx vitest run` and `node tools/live/sheet-rebuild.mjs` both exit **0** | Met | - |
| AC-005 | REQ-002 | Given the panel already holds exactly one rule, When it renders, Then it is byte-identical before and after REQ-002 — the negative control | The tree branch's own render code (`renderFilterTreeNode`, the `+ Add condition` button) moved inside the `else` block unedited — same `createEl`/`createConditionRow` calls, same classes, same order — so a ≥1-rule panel's output is unchanged by construction; `src/views/filter-panel-renderer.test.ts` pins that this button's markup and position are untouched | Met | - |
| AC-006 | REQ-003 | Given the filter field (`:494-501`), the select/status value (`:576-590`) and the sort field (`sort-panel-renderer.ts:199-206`) dropdowns, When they present in a phone sheet — which is how the panels present on a phone, and where these dropdowns' search rows live — Then a search input shows above 8 options and not at 8, the 8-option case being the control; the gate is the primitive's own (`dropdown-field.ts:228`, the phone-branch rule `063`'s ADR-001 recorded), and the desktop combobox rule (`a952e5e7`) is untouched | `grep -c "searchable: true," src/views/filter-panel-renderer.ts src/views/sort-panel-renderer.ts` now reads **2** and **1**, from **0** and **0**. `src/views/filter-panel-renderer.test.ts` and `src/views/sort-panel-renderer.test.ts` pin the exact sites and that no second count gate was added; the 8-option boundary itself is `dropdown-field.ts`'s own established gate, untouched | Met | - |
| AC-007 | REQ-004 | Given the toolbar swept 250→900px in 10px steps (`run-toolbar-collapse-sweep.mjs:39`), When the width narrows, Then the New label reads absent before the first width at which any cluster is hidden, zero-overflow holds at every width, the accessible name is unchanged, and the landed `:2571` drop order is not reordered | `tools/live/toolbar-collapse-sweep.ts`'s lane, extended with `newLabelVisible`/`newButtonAriaLabel` readings; `run-toolbar-collapse-sweep.mjs` now asserts all three directly (label-ahead-of-cluster, non-vacuous, aria-stable) rather than only printing switch points. `node tools/live/run-toolbar-collapse-sweep.mjs` exit **0**, run through the `toolbar-collapse` gate row | Met | - |
| AC-008 | REQ-005 | Given at least one chip in the rail, When the rail renders, Then exactly one `db-active-control-add` control per rule group is present, wired to the existing `toggleFilterPanel` / `toggleSortPanel`, at the landed 28px chip pitch (`styles.css:1821`) and carrying its own accessible name; with zero chips, none | `grep -rn "db-active-control-add" src/ styles.css` now returns the definition and its three call sites, from **0**. `src/views/active-view-controls-renderer.test.ts` pins the per-group gating (each add control sits inside its own group's `if`, so a zero-chip group never renders one) | Met | - |
| AC-009 | REQ-007 | Given every Notion-versus-Anytype disposition the loop named, When this packet's record is read, Then it lives in `decision-record.md` — the ones a landed ruling or the tree decides marked `Accepted` and citing it, the ones the operator ruled marked `Accepted` or `Declined` and citing the verbatim ruling — and none is applied over a landed ruling | `decision-record.md` carries ten ADRs (ADR-001 through ADR-010) plus the seven corrections D1 requires; zero `Proposed` remain (status summary table, ADR-001/005 Accepted, ADR-007 Declined, ADR-010 inherited Accepted). `tasks.md` T010 re-verified ADR-008 and ADR-002 against the current tree without needing a further correction | Met | - |
| AC-010 | REQ-006 | ~~Given the operator's answer on ADR-007, Then either the group popover's select/status rows (`toolbar-renderer.ts:1869-1887`) carry the eye toggle persisting into the existing `boardHiddenGroups` axis (`types.ts:560`, `data-source.ts:1230`, `:1352`; read at `board-renderer.ts:192`) with the table-renderer read recorded, or this row closes **Waived** citing ADR-007~~ **Waived, 2026-09-07 by ADR-007** (Declined, operator verbatim *"Groups panel only"*). Per-group visibility lives in `059`'s Groups panel only; this packet's popover keeps exactly its existing "show empty groups" switch (`renderGroupVisibilitySwitch`, `toolbar-renderer.ts:1885`) and gains no eye-toggle row | No verification owed — REQ-006 is not built here. `059`'s own REQ-001/REQ-003 own the axis's writer and, now, the table-renderer read | Waived | ADR-007 |
| AC-011 | REQ-008 | Given a released build, When the operator reads the refined toolbar on a device, Then the four device-only checks the loop named — icon-only rail discoverability on a phone, the entry tier inside the phone filter sheet, the delete confirm as a stacked sheet, and tabs against the view switcher both references use — are answered in `053` AC-111's sitting | `053`'s AC-111. Only the operator closes this row; nothing in this repository can | Unmet | - |
| AC-012 | REQ-009 | Given the view-settings panel on a non-chart view, When it renders, Then a fourth named row sits in the summary block beside Properties, Filters and Sorts, reading the count of `config.conditionalFormats`, carrying an explainer line in the panel's `hintClass()` idiom, and opening the existing `renderConditionalFormatting` section (`:747`) — with no second rule editor created | `grep -c "this.renderAppliedSummary(" src/views/view-config-panel-renderer.ts` now reads **4**, from **3**. `src/views/view-config-panel-renderer.test.ts` (real DOM mount, no jsdom): four `db-view-config-summary-row` rows on a table view, the fourth named "Conditional color" with the count and an explainer, its click opening the existing section without a second one; a chart view renders three rows and no conditional-formatting section at all — the negative control. `npx vitest run` exit **0** | Met | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** Yes, except the operator's own row

Twelve criteria: nine `Met`, one `Waived` (AC-010, citing ADR-007), one `Superseded` (AC-003,
citing ADR-005 — Branch B applies, so Branch A's phone-presentation criterion never has a confirm
to test), and one riding the operator (AC-011, `053` AC-111). Every row this packet can close on
its own is closed: `npx tsc --noEmit`, `npm run build` and `npx vitest run` (146 files / 1557
tests) all exit **0**, and `npm run gate` exits **0** at **26 green, 0 red for a declared reason**
— including `toolbar-collapse` (observed red in T001, green after T007) and `sheet-rebuild` (two
scoped fixes recorded in `tasks.md` T011, both root-caused rather than patched around). Full
evidence per row lives in `tasks.md`'s Phase 1-3 entries. AC-011 is the operator's device sitting
and rides `053` AC-111; nothing in this repository closes it.
<!-- /ANCHOR:closure -->
