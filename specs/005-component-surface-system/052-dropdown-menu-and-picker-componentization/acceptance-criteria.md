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
    last_updated_at: "2026-09-05T18:10:00Z"
    last_updated_by: "t002-red-baselines"
    recent_action: "Reconfirmed checklist C1-C10 red baselines; corrected drifted citations in C5/C6/C8/AC-006"
    next_safe_action: "Execute T004, the menu primitive submenu handle, against the confirmed C1 baseline"
    blockers:
      - "AC-010 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/owned-menu.ts"
      - "src/views/dropdown-field.ts"
      - "src/views/popover-host.ts"
      - "componentization-plan.md"
      - "design-trueup.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-052-ac"
      parent_session_id: null
    completion_pct: 20
    open_questions:
      - "How far the create-option convention reaches beyond select-value pickers"
      - "Whether the desktop view-tab context menu is built at all, given no capture shows one"
    answered_questions:
      - "Do Anytype's hover-open submenus adopt on desktop: YES, proved by the sweep's procedure, decided in ADR-004"
      - "Where the create affordance sits: first, under the search and above the list, per ADR-004"
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
| AC-001 | REQ-001 | **Given** a menu row with `submenu: true`, **When** it is activated by pointer click, `ArrowRight`/`Enter`, hover on a hover-capable pointer, or tapped on a phone sheet, **Then** a nested menu produced by the same factory opens, registered in `overlayStack` with the row's menu as `parentId`; **and When** Escape fires, **Then** only the innermost closes | Lane row driving all four paths plus the Escape order; negative control: revert the handle, require the lane red. Today: **no path opens a nested menu** — `owned-menu.ts:175` reads the flag once, only to suppress auto-close (`if (!rowOptions.submenu) close();`), verified 2026-09-05. **Hover is now in scope**: `design-trueup.md` G8 proves hover-open from the sweep's own procedure and ADR-004 decides it, guarded by `@media (hover: hover)` | Unmet | - |
| AC-002 | REQ-002 | **Given** the family census, **When** the legs complete, **Then** zero hand-built `db-menu-item` constructions remain outside `menu-row.ts` **or** every remaining site is individually dispositioned in `componentization-plan.md` §1-§2 with a written reason | `grep -rn "db-menu-item" src/views/*.ts \| grep "cls"` against the baseline **70 outside `menu-row.ts`** — `toolbar-renderer.ts` **44**, `column-menu.ts` 19, `dropdown-field.ts` 4, `cell-renderer.ts` 3 — and **76** including `menu-row.ts`'s own 6; each survivor's plan row cited. Today: **70**. **The earlier 71/45 figures were wrong** (`design-trueup.md` C8, re-measured 2026-09-05); `checklist.md` C2 already carried the right number | Unmet | - |
| AC-003 | REQ-003 | **Given** the picker family, **Then** exactly one active-picker registry, one phone sheet-header construction, one shared search, one geometric grid navigator exist in `src/views/`, and the five pickers consume them | `grep -c "activePickers = new WeakMap"` → 1 (baseline **3**: `date-value-picker.ts:71`, `option-color-picker.ts:29`, `icon-picker-popover.ts:50`, verified 2026-09-05); navigator count → 1 (baseline **2**: `getColorNavigationTarget` at `option-color-picker.ts:138`, `getIconNavigationTarget` at `icon-picker-popover.ts:284` — line numbers corrected from ADR-003's `:130`/`:281`); header sites → 1 (baseline **5 in the family**, of 14 tree-wide). Each picker's captures re-taken and read | Unmet | - |
| AC-004 | REQ-004 | **Given** `componentization-plan.md`, **Then** every surface in the census carries a row with all five cells filled — surface → primitive → changes → Anytype pattern (capture filename or named gap) → stays ours — and no census surface is absent | The plan's §1-§2 row set diffed against the census commands in `goal.md` §3; every cited capture resolves under `screenshots/anytype/`. **Satisfied for the evidence half at T001**: `design-trueup.md` §4 re-evidences all 25 rows against a capture in `menus/` or `mobile/`, and names the five with none — M4, M5, M12, M15 and M7's desktop half. **What remains** is the disposition half, verified against a landed leg | Unmet | - |
| AC-005 | REQ-005 | **Given** `anytype-menu-grammar.md`, **Then** every adopted pattern (G-row) names its capture file **and** every gap (capture-unreachable pattern) is named as code-derived — zero rows claim capture evidence the captures cannot show | The grammar doc's G-table read against T001's capture pass; gap rows counted. **Met 2026-09-05.** Fourteen of the sixteen G-rows cite a capture measured at the pixel and marked `[trued 2026-09-05 · T001]`; §5 tabulates every correction; §3 was rewritten and names the four surviving gaps — the fully-gated action menu (G3's wording), the state-naming toggle label (G7), the desktop view-tab right-click (M7), and nesting deeper than depth 2 — each **code-derived**. Zero rows now claim evidence the captures cannot show | Met | - |
| AC-006 | REQ-006 | **Given** a picker with search, **When** the query matches nothing, **Then** the shared empty state renders and the create affordance (where the source can create) is reachable in that state; **and** the same search component serves dropdown, relation and option editors | Lane row per picker plus a unit test on the shared search; red-first on today's four separate implementations. Today: **4 implementations** (`dropdown-field.ts:424`, `cell-renderer.ts:973`, `icon-picker-popover.ts:126`, `toolbar-renderer.ts:1099`), **no shared create-in-empty affordance**. **The four line citations were stale** (drifted since T001; re-found 2026-09-05 by `grep -n` against each file's function/variable name — T002, `checklist.md` C6). The reachable-when-empty clause is now **evidence-backed**: `menus/anytype-menu-object-featured-tag-dark.png` and `mobile/anytype-mobile-sheet-cell-multiselect-empty-dark.png` both keep it, and both name the action rather than the absence (`design-trueup.md` G3, G11) | Unmet | - |
| AC-007 | REQ-007 | **Given** the family's placement widths, **Then** every former bespoke literal is a named role or carries its written reason in `componentization-plan.md` §3, and no menu-role surface exceeds its role's width (design-system §5 policy) | `grep -rn "preferredWidth: [0-9]" src/views/` excluding the host's role definitions, tests and stories; geometry lane for the role-width bound. Today: **8 distinct literals — 124, 252, 280, 292, 318, 360, 420, 520 — at 14 production call sites**, re-counted 2026-09-05. **The earlier "9 distinct including 240" was wrong** (`design-trueup.md` C9): `chart-toolbar-renderer.ts:927` passes 280, and the only 240 in the tree is `popover-position.stories.ts:40`, a story. `checklist.md` C7 still carries the old figure and is **T003's to correct** | Unmet | - |
| AC-008 | REQ-008 | **Given** the gate, **When** `npm run gate` runs and `$?` is read, **Then** it exits **0** with one permanent lane row per migrated family, each negative control observed red then green; `npm run replay` holds with reversed 0; `044`'s grammar rows and `048`'s 31 stacking pairs stay green | `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0; the red observations recorded in `checklist.md` C10 before the greens; `sheet-grammar.mjs` pair count ≥ 31 unchanged. Today: **the family's lane rows do not exist** | Unmet | - |
| AC-009 | REQ-005 | **Given** the capture read, **Then** every G-row in `anytype-menu-grammar.md` rests on pixels rather than on index prose, and every refuted row carries a dated correction in the same document | **Met 2026-09-05 (T001).** `design-trueup.md` is this packet's read of record: the 150 clipped menus in `screenshots/anytype/desktop/menus/` and the 59 iOS states in `screenshots/anytype/mobile/` were opened and measured per pixel, and §2 carries the geometry set and the five width tiers that read produced. Eleven contradictions are recorded (§1) and each is expanded in its row; `anytype-menu-grammar.md` §5 tabulates all fourteen corrections it caused. The evidence gate this row exists for is closed, and **AC-005 follows it to Met** | Met | - |
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

**Two rows closed at T001 — AC-009 and the AC-005 it gated.** The grammar's evidence is now pixels
rather than index prose: 150 desktop menus and 59 iOS states opened and measured,
`design-trueup.md` written as the read of record, eleven contradictions recorded, and fourteen
G-rows corrected in `anytype-menu-grammar.md` §5.

Eight rows remain. AC-001 is still the headline (the chevron-that-promises anti-pattern dies here),
and it grew a fourth path: **hover-open on desktop** is no longer an open question — the sweep could
only reach its 37 submenus by hovering, so ADR-004 decides it behind `@media (hover: hover)`.
AC-002, AC-003 and AC-007 carry **corrected baselines**: 70 hand-built row sites rather than 71,
`toolbar-renderer.ts` at 44 rather than 45, 8 distinct widths rather than 9, and the two navigators
at their real line numbers. A threshold whose failing value is asserted wrongly cannot be observed
red, which is why those three had to be restated before Phase 1 may close. AC-010 is the operator's
and is the only row that closes the ask behind the phase (parent D3).
<!-- /ANCHOR:closure -->
