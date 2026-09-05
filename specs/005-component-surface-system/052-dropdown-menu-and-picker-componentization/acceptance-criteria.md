---
title: "Acceptance Criteria: Dropdown, Menu and Picker Componentization"
description: "The criteria this packet must satisfy before it may be closed, one threshold per requirement, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "052 acceptance criteria"
  - "menu componentization closure gate"
  - "ac traceability menu"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/052-dropdown-menu-and-picker-componentization"
    last_updated_at: "2026-09-05T12:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored one threshold per requirement"
    next_safe_action: "Execute T001, the capture read"
    blockers:
      - "AC-008 is the capture read and gates the grammar doc's evidence status"
      - "AC-010 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/owned-menu.ts"
      - "src/views/dropdown-field.ts"
      - "src/views/popover-host.ts"
      - "componentization-plan.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-052-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "How far the create-option convention reaches beyond select-value pickers"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Dropdown, Menu and Picker Componentization

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `plan.md`'s ADR section.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/052-dropdown-menu-and-picker-componentization
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
AC-001 through AC-008 align to REQ-001 through REQ-008. AC-009 is the grammar doc's evidence row,
AC-010 the operator's.

Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390×844 profile with a navbar present. Every threshold carries a failing value
observed before the fix (goal D2). Exit statuses are read from `$?` and never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a menu row with `submenu: true`, **When** it is activated by pointer click, `ArrowRight`/`Enter`, or tapped on a phone sheet, **Then** a nested menu produced by the same factory opens, registered in `overlayStack` with the row's menu as `parentId`; **and When** Escape fires, **Then** only the innermost closes | Lane row driving all three paths plus the Escape order; negative control: revert the handle, require the lane red. Today: **no path opens a nested menu** (`owned-menu.ts:170-178` closes on any non-submenu row) | Unmet | - |
| AC-002 | REQ-002 | **Given** the family census, **When** the legs complete, **Then** zero hand-built `db-menu-item` constructions remain outside `menu-row.ts` **or** every remaining site is individually dispositioned in `componentization-plan.md` §1-§2 with a written reason | `grep -rn "db-menu-item" src/views/*.ts \| grep "cls"` against the baseline **71** (`toolbar-renderer.ts` 45, `column-menu.ts` 19, `dropdown-field.ts` 4, `cell-renderer.ts` 3); each survivor's plan row cited. Today: **71** | Unmet | - |
| AC-003 | REQ-003 | **Given** the picker family, **Then** exactly one active-picker registry, one phone sheet-header construction, one shared search, one geometric grid navigator exist in `src/views/`, and the five pickers consume them | `grep -c "activePickers = new WeakMap"` → 1 (baseline **3**); navigator count → 1 (baseline **2**); header sites → 1 (baseline 6+). Each picker's captures re-taken and read | Unmet | - |
| AC-004 | REQ-004 | **Given** `componentization-plan.md`, **Then** every surface in the census carries a row with all five cells filled — surface → primitive → changes → Anytype pattern (capture filename or named gap) → stays ours — and no census surface is absent | The plan's §1-§2 row set diffed against the census commands in `goal.md` §3; every cited capture resolves under `screenshots/anytype/`. Today: **the plan exists with no disposition verified against a landed leg** | Unmet | - |
| AC-005 | REQ-005 | **Given** `anytype-menu-grammar.md`, **Then** every adopted pattern (G-row) names its capture file **and** every gap (capture-unreachable pattern) is named as code-derived — zero rows claim capture evidence the captures cannot show | The grammar doc's G-table read against T001's capture pass; gap rows counted. Today: **five rows corrected against `design-trueup.md` at landing; three cited captures still unread by pixel** | Unmet | - |
| AC-006 | REQ-006 | **Given** a picker with search, **When** the query matches nothing, **Then** the shared empty state renders and the create affordance (where the source can create) is reachable in that state; **and** the same search component serves dropdown, relation and option editors | Lane row per picker plus a unit test on the shared search; red-first on today's four separate implementations. Today: **4 implementations, no shared create-in-empty affordance** | Unmet | - |
| AC-007 | REQ-007 | **Given** the family's placement widths, **Then** every former bespoke literal is a named role or carries its written reason in `componentization-plan.md` §3, and no menu-role surface exceeds its role's width (design-system §5 policy) | `grep -rn "preferredWidth: [0-9]" src/views/` excluding the host's role definitions; geometry lane for the role-width bound. Today: **9 distinct bespoke values** | Unmet | - |
| AC-008 | REQ-008 | **Given** the gate, **When** `npm run gate` runs and `$?` is read, **Then** it exits **0** with one permanent lane row per migrated family, each negative control observed red then green; `npm run replay` holds with reversed 0; `044`'s grammar rows and `048`'s 31 stacking pairs stay green | `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0; the red observations recorded in `checklist.md` C10 before the greens; `sheet-grammar.mjs` pair count ≥ 31 unchanged. Today: **the family's lane rows do not exist** | Unmet | - |
| AC-009 | REQ-005 | **Given** the capture read, **Then** every G-row in `anytype-menu-grammar.md` rests on pixels rather than on index prose, and every refuted row carries a dated correction in the same document | **Partly satisfied at landing 2026-09-05.** `050`'s `design-trueup.md` read the three menu captures with a per-pixel scan and is the read of record (`050` ADR-003); `anytype-menu-grammar.md` §4 records the five rows it corrected. **What remains** is the rows the true-up did not cover — `anytype-relation-editor-tag-dark.png` (G14), `anytype-layout-picker-dark.png` (§3) and the type picker — which T001 opens. **This row gates AC-005's final disposition** | Unmet | - |
| AC-010 | REQ-001, REQ-003 | **Given** a released build, **When** the operator opens menus, dropdowns and pickers on iOS and on desktop, **Then** they read as componentized and improved per the operator's ask | The operator's own words. **Only the operator closes this row; nothing in this repository can** | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in `plan.md`'s
ADR section. A waiver naming an ADR that is not there fails validation: the point
of a waiver is that someone recorded the reasoning, so an unbacked waiver is
treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Every row is open, which is correct for a packet opened the day its census was counted. AC-001 is
the headline (the chevron-that-promises anti-pattern dies here); AC-009 gates AC-005 because the
grammar's evidence is currently index prose, not pixels; AC-010 is the operator's and is the only
row that closes the ask behind the phase (parent D3).
<!-- /ANCHOR:closure -->
