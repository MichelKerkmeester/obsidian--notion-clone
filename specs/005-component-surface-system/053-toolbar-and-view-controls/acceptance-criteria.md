---
title: "Acceptance Criteria: Toolbar and View Controls"
description: "The criteria this packet must satisfy before it may be closed: one threshold per primitive migration and per 050 item kept, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "053 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/053-toolbar-and-view-controls"
    last_updated_at: "2026-09-05T18:30:00Z"
    last_updated_by: "design-trueup-t001"
    recent_action: "Marked AC-112 Met; restated AC-102, AC-106, AC-107"
    next_safe_action: "Execute T002 (red-first measurements), then the primitive legs in plan order"
    blockers:
      - "AC-111 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/active-view-controls-renderer.ts"
      - "src/views/embedded-database-renderer.ts"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/design-trueup.md"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/toolbar-surface-inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-053-ac"
      parent_session_id: null
    completion_pct: 8
    open_questions: []
    answered_questions:
      - "T001: the rail does not move, so the header-height question is void and spec.md §8's sticky-offset risk row is retired"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Toolbar and View Controls

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `plan.md`'s ADR section.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/053-toolbar-and-view-controls
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
REQ-10x maps to `spec.md` §4. Where a row keeps a `050` item threshold, the Given/When/Then is
that threshold's, applied to this phase's surfaces; the Today cell is measured on the current
tree, including the two corrections the parent `goal.md` §2 records (items 1 and 4).

Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390×844 profile with a navbar present. Every threshold carries a failing number
observed before the fix (goal D2). Exit statuses are read from `$?` and never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-101 | REQ-101 | **Given** the toolbar family, **When** the migration table's rows are read against the tree, **Then** every row whose target names a primitive renders through that primitive, and its replaced vocabulary is deleted: the close-run count is **0** outside `createPopoverShell` (today **17**), the dual-class count is **0** (today **2** — `toolbar-renderer.ts:1249`, `:1341`), the dead-method count is **0** (today **7**) | Grep counts read on the final tree + the close-sequence lane row + a negative control re-adding one close run, require red | Unmet | - |
| AC-102 | REQ-102 | **Restated at T001 against this packet's `design-trueup.md` T14** (`050` item 1 threshold as restated by `050` ADR-004, kept). **Given** a view, **When** at least one filter or one sort is active, **Then** the chip row is present with a leading sort chip whose **direction is carried by the arrow glyph** — and by the **direction word** on any surface with room for a second line — before the filter chips, and the trigger carries a declared `active` state; **and When** neither is active, **Then** the row is absent entirely and the state reads `add`; **and** **every** value column of the view-settings surface carries a state summary, the empty case reading as a **word** (`No filters`) rather than a blank | Lane row asserting chip-row presence, declared state, the direction signal and the summary label in all four combinations of filter × sort. Negative control: force the state constant and strip the label, require red. Today: **the rail exists at 26px, carries an arrow and an ordinal but no direction word, no trigger declares a state, and 0 settings rows carry a summary label**. **Three things are not asserted because they are rejected**: dual-mode icons (`ink=52, sat=0` on filtered and unfiltered alike, 120 captures, re-derived on light theme at T001); **direction by colour alone** (accent-on-tint **3.14:1**, fill-on-bar **1.19:1** — WCAG 1.4.11); and **the rail's move into the toolbar band**, withdrawn because the capture puts the rail where ours already renders | Unmet | - |
| AC-103 | REQ-103 | **Given** a database view (`050` item 2 threshold, kept), **When** a view is created or duplicated, **Then** the view-settings surface is open within **100ms** of the create completing | Lane row timing from the create callback to the settings mount. Today's failing value: **never — nothing opens** (`database-view.ts:3460-3462`, `:3941-3943`) | Unmet | - |
| AC-104 | REQ-104 | **Given** a view (`050` item 4 threshold, kept), **When** it is duplicated, **Then** the duplicate's config equals the source's on every field except `id` and the name suffix, and its `id` is **new**; **and When** a view tab's context menu opens, **Then** it offers rename, duplicate and remove through the shared shell | Unit test on config equality (the existing `duplicateView` semantics, `database-view.ts:3925-3956`, preserved through the migration) + a lane row for the menu. Today: **the behaviour exists hand-rolled** (correction 2, parent `goal.md` §2) — the criterion binds the migration, not the creation | Unmet | - |
| AC-105 | REQ-105 | **Given** a board or table view with an active sort (`050` item 7 threshold, kept), **When** a row or card is dragged to a new position, **Then** a confirmation is raised; declining leaves both the order and the sort unchanged, and accepting clears the sort and commits the drop | Lane rows on both renderers, both branches. Today: **the drop is accepted and then silently undone by the sort — no confirmation exists on either renderer** | Unmet | - |
| AC-106 | REQ-106 | **Given** a view carrying new-row default presets (`050` item 10 threshold, kept), **When** a row is created in it, **Then** every preset value is applied at creation; **and Given** a view with no presets, **Then** the new row is byte-identical to one created today; **and** the presets section is reachable from the **New button's dropdown** under a `Settings` section label | Unit test on the creation path plus a byte-comparison of the no-preset case against a pre-change baseline, plus a lane row for the section's placement. Today: **no preset can be stored, so nothing is applied**, and **0 New-menu rows carry a `Settings` section**. **Placement amended at T001**: `anytype-menu-set-new-object-light.png` puts `Default Type for this View` and `Template for this View` in this menu, not in the settings panel — overturning `050` C7's "absent from the product" | Unmet | - |
| AC-107 | REQ-107 | **Given** an embedded view (`050` item 12 threshold, kept), **When** its container is swept from **250px** upward, **Then** the toolbar collapses on a measured natural-width comparison rather than a fixed breakpoint, **no** control overflows its container at any width in the sweep, and the drop order matches the captured ladder — the `New` button, the icon cluster **and the add-view `+`** all go before the tab row, which becomes a dropdown before it is dropped | Lane row sweeping container widths, asserting zero overflow and asserting the drop order. Today: the collapse is a boolean hide-or-nothing (`embedded-database-renderer.ts:2410-2416`) and the sweep's first overflowing width is recorded by T002. **Sharpened at T001**: `anytype-page-with-inline-collection-dark.png` shows the inline rung as the tab row **without its trailing `+`**, which `050`'s "view tab row only" did not distinguish. The measured-versus-breakpoint clause stays **source-derived** — one inline width exists in the sweep, so no capture can decide the mechanism | Unmet | - |
| AC-108 | REQ-108 | **Given** any view type, **When** the settings trigger is pressed, **Then** exactly one settings path resolves it — the view-config panel or the view-type options panel — and the anchor-fallback queries still resolve against the live trigger | Unit test on per-view-type resolution + grep proof the fallback classes resolve (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`). Today: **one live path through the utilities row and seven dead methods** | Unmet | - |
| AC-109 | REQ-109 | **Given** every toolbar surface this phase changed, **When** it presents on a phone, **Then** it carries `044`'s seven grammar elements, and **When** it can open over another sheet, **Then** it obeys `048`'s stacking model | `sheet-grammar` rows for the changed surfaces (added, not replaced); the stacking lane's existing rows stay green. Negative control: strip one grammar element from a registered row, require red. Today: **the toolbar surfaces conform; this criterion binds the migrations not to regress it** | Unmet | - |
| AC-110 | All | **Given** the gate, **When** `npm run gate` runs to completion and its status is read from `$?`, **Then** it exits **0** with one permanent row per criterion, each negative control observed **red then green**, `npm run replay` holds with reversed 0, and the `screenshots/project-manager/` board and gantt references are `pixelHash`-identical to their pre-phase baseline | `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0; the replay's own reversed count; the parity recapture diff (parent goal D5) | Unmet | - |
| AC-111 | REQ-102, REQ-103, REQ-107 | **Given** a released build, **When** the operator opens a filtered view, creates a view, and resizes an embedded view on iOS and on desktop, **Then** they read the rebuilt toolbar as the improvement they asked for | The operator's own words. **Only the operator closes this row; nothing in this repository can** | Unmet | - |
| AC-112 | REQ-101 | **Given** the Anytype capture set, **When** T001 has read it, **Then** `toolbar-surface-inventory.md` carries a capture-read record per migration row naming the file opened, and **no** surface was implemented before its record existed | **Met, 2026-09-05.** `design-trueup.md` is the read; `toolbar-surface-inventory.md` **§8.1** carries the per-row record — **24 of 24 rows** name the files opened or the named gap, and every named capture resolves under `screenshots/anytype/`. §8.2 lists the eight contradictions the read resolved. No surface has been implemented, so the second clause holds vacuously and stays binding for T003 onward | **Met** | - |

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

**AC-112 is Met as of 2026-09-05** — the evidence gate (D1) has moved, so the design rows may now
be implemented against `design-trueup.md` and `toolbar-surface-inventory.md` §8. Eleven rows remain
open, which is correct for a packet whose first implementation leg has not run. AC-111 is the
operator's and is the only row that closes the ask behind the phase (parent D3).

**Three rows were restated by the same read**, and each says so in its own cell: AC-102 (the rail's
band move withdrawn, the direction colour demoted, the summary label widened), AC-106 (the presets
section moved to the New menu), AC-107 (the inline rung also drops the `+`). None of the three
changed its `050` threshold — only the failing values and the clauses the captures disproved.
<!-- /ANCHOR:closure -->
