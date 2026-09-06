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
    last_updated_at: "2026-09-06T19:00:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Authored the acceptance criteria from the Notion research synthesis"
    next_safe_action: "Put ADR-001, ADR-005 and ADR-007 to the operator, then observe the first red"
    blockers:
      - "ADR-001, ADR-005 and ADR-007 are Proposed and gate REQ-004, REQ-001 and REQ-006"
      - "AC-011 is the operator's and rides 053 AC-111; nothing here can close it"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/filter-panel-renderer.ts"
      - "tools/live/toolbar-collapse-sweep.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-064-acceptance"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Which of ADR-007's two readings the operator takes"
    answered_questions:
      - "The nine dispositions are recorded in decision-record.md and none is applied over a landed ruling"
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
**Status:** Draft
**Date:** 2026-09-06
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

Every row's Verification cell names the command or artifact that decides it, and exit statuses are
read from `$?`, never through a pipe. Where a row records a value observed on today's tree, that
value was read in this worktree at `80c2bb48`, whose `src/` and `styles.css` are identical to the
digest's reference HEAD `28e680fc` (`git diff --stat 28e680fc HEAD -- src/` names none of the six
toolbar-family files), so every red is about the code and not about drift.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a database with more than one view, When the view is deleted from the all-views hub row (`toolbar-renderer.ts:1180`) or from the tab context menu (`:1330`), Then `051`'s confirm (`buildConfirmSheetBody`, `confirm-sheet.ts:46`) is raised, its copy names the view, declining is a no-op and accepting deletes exactly one view | A vitest block driving the real renderer's two paths with the confirm resolved via a real Promise, the decline/accept idiom `053`'s AC-105 blocks established. Red today: `grep -c "buildConfirmSheetBody" src/views/toolbar-renderer.ts` = **0** — neither path confirms | Unmet | - |
| AC-002 | REQ-001 | Given a database with exactly one view, When the toolbar renders, Then no confirm is raised for the delete that cannot happen — the `database-view.ts:3447` early return precedes any confirm | The same block's one-view case; the criterion asserts the guard, not merely the absence of a dialog | Unmet | - |
| AC-003 | REQ-001 | Given the confirm open on a phone, When it presents, Then it is a stacked bottom sheet per `048` D1, and `044`'s sheet grammar and `048`'s stacking stay green | `npm run gate`, `$?` read; the `sheet-grammar` and stacking lanes green | Unmet | - |
| AC-004 | REQ-002 | Given the filter panel with zero rules, When it opens, Then a searchable flat property list renders, built from the `toPropertyDropdownOption` vocabulary (`filter-panel-renderer.ts:497`), picking a property creates the first leaf through `createDefaultFilterRule` (`:90`) and `appendLeaf` (`:223`), and a `+ Add advanced filter` footer switches to the tree | A test asserting the zero-rule branch renders the list. Red today: the branch renders only the `db-panel-empty` hint at `:197-202` | Unmet | - |
| AC-005 | REQ-002 | Given the panel already holds exactly one rule, When it renders, Then it is byte-identical before and after REQ-002 — the negative control | A seeded one-rule panel rendered on both sides of the change and diffed; the result recorded in `tasks.md` | Unmet | - |
| AC-006 | REQ-003 | Given the filter field (`:494-501`), the select/status value (`:576-590`) and the sort field (`sort-panel-renderer.ts:199-206`) dropdowns, When they present in a phone sheet — which is how the panels present on a phone, and where these dropdowns' search rows live — Then a search input shows above 8 options and not at 8, the 8-option case being the control; the gate is the primitive's own (`dropdown-field.ts:228`, the phone-branch rule `063`'s ADR-001 recorded), and the desktop combobox rule (`a952e5e7`) is untouched | Red today: `grep -c searchable` = **0** and **0** — the flag reaches neither panel, so the phone-sheet branch falls to its `searchable === true` default and renders no search row at any count. The flag's precedent: `view-config-panel-renderer.ts:1558`, `:2060`, `:2077` | Unmet | - |
| AC-007 | REQ-004 | Given the toolbar swept 250→900px in 10px steps (`run-toolbar-collapse-sweep.mjs:39`), When the width narrows, Then the New label reads absent before the first width at which any cluster is hidden, zero-overflow holds at every width, the accessible name is unchanged, and the landed `:2571` drop order is not reordered | `tools/live/toolbar-collapse-sweep.ts`'s existing lane, extended with the label reading and the order assertion, run through the `toolbar-collapse` gate row. Red today: the cluster hides while the label is still drawn | Unmet | - |
| AC-008 | REQ-005 | Given at least one chip in the rail, When the rail renders, Then exactly one `db-active-control-add` control per rule group is present, wired to the existing `toggleFilterPanel` / `toggleSortPanel`, at the landed 28px chip pitch (`styles.css:1821`) and carrying its own accessible name; with zero chips, none | Red today: `grep -rn "db-active-control-add" src/ styles.css` = **0**; a test asserting presence iff at least one chip — the zero-chip case is the control | Unmet | - |
| AC-009 | REQ-007 | Given every Notion-versus-Anytype disposition the loop named, When this packet's record is read, Then it lives in `decision-record.md` — the ones a landed ruling or the tree decides marked `Accepted` and citing it, the ones it does not marked **Proposed** and the operator's — and none is applied over a landed ruling | `decision-record.md`: nine ADRs plus the four corrections D1 requires, statuses read against `goal.md` D6's three gates | Unmet | - |
| AC-010 | REQ-006 | Given the operator's answer on ADR-007, Then either the group popover's select/status rows (`toolbar-renderer.ts:1869-1887`) carry the eye toggle persisting into the existing `boardHiddenGroups` axis (`types.ts:560`, `data-source.ts:1230`, `:1352`; read at `board-renderer.ts:192`) with the table-renderer read recorded, or this row closes **Waived** citing ADR-007 | The operator's answer; the renderer read taken before any code — the board's read is verified, the table's is not, and `059` REQ-001's zero-writer census is the axis's own record | Unmet | - |
| AC-011 | REQ-008 | Given a released build, When the operator reads the refined toolbar on a device, Then the four device-only checks the loop named — icon-only rail discoverability on a phone, the entry tier inside the phone filter sheet, the delete confirm as a stacked sheet, and tabs against the view switcher both references use — are answered in `053` AC-111's sitting | `053`'s AC-111. Only the operator closes this row; nothing in this repository can | Unmet | - |

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

**Closeable:** No

Eleven criteria, all `Unmet`, none waived. The packet was opened by a research synthesis and no
code has changed yet. ADR-001, ADR-005 and ADR-007 gate REQ-004, REQ-001 and REQ-006, and
`goal.md` D6 bars their code until the operator answers; AC-011 is the operator's and rides
`053` AC-111. The two corrections this record's rows depend on — the group-popover anchor and the
hidden-group axis's state — were verified on this tree, not carried from the loop.
<!-- /ANCHOR:closure -->
