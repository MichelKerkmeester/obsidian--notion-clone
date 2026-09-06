---
title: "Tasks: Notion Sheet Refinement"
description: "Two legs, each task carrying its threshold, its red-first proof and its source: the cell menu the operator reported, and the confirm card the Notion loop ranked first over 77 screens."
trigger_phrases:
  - "061 tasks"
  - "cell menu tasks"
  - "confirm card tasks"
  - "selection bar leg"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/061-notion-sheet-refinement"
    last_updated_at: "2026-09-06T19:30:00Z"
    last_updated_by: "design-research-session"
    recent_action: "Closed T001 and re-cut T005-T007; added T011 for the overflow sheet"
    next_safe_action: "T002 baseline, then T004; the ADR gate is closed"
    blockers: []
    key_files:
      - "src/views/database-view.ts"
      - "src/views/record-surface/cell-editor-text.ts"
      - "src/views/confirm-sheet.ts"
      - "tools/storybook/verify-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-061-tasks"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "No new lane is created; three existing lanes gain rows"
      - "Zero of four reference products dock a labelled action bar to the frame's bottom edge"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion Sheet Refinement

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

Following `051`'s notation, every implementation task carries **threshold**, **red-first proof** and
**source**. A task with no red-first proof is a task with no threshold (goal D3).
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] **T001** [P0] Put ADR-001, ADR-002, ADR-003, ADR-004 and ADR-006 to the operator as **one
      set**, with the two captures and the Notion capture filenames beside them
      (`decision-record.md`).
      **Threshold:** zero ADRs left `Proposed` on the cell surface and the confirm.
      **Red-first proof:** all five were `Proposed` at 17:40.
      **Source:** parent D15 — a Notion finding that contradicts a landed ruling stops at a Proposed
      ADR. **Closed 2026-09-06 19:00.** The operator declined to rule on Notion alone and widened
      the evidence — *"Check anytype, evernote, fibery and find best ui ux approach for this"* — and
      accepted the confirm in the same sitting: *"Yes, centred card with stacked buttons"*. 51
      captures were then read directly across the four products; **ADR-000** records that read,
      **ADR-001 to ADR-004 are Accepted**, and **ADR-006** stays parked behind the Anytype
      multi-section re-read that is its own stated precondition (AC-007 accepts a recorded park).

- [ ] **T002** [P] Record the baseline before the first edit: the bar's child count, rendered row
      count and rect at 390px; the confirm's inset, radius and computed action `flex-direction`; and
      the hash of the 32 Project Manager reference captures (`specs/.../061-notion-sheet-refinement/scratch/`).
      **Threshold:** every figure in `acceptance-criteria.md`'s Verification column re-read on the
      commit the leg branches from. **Red-first proof:** this task *is* the red-first proof.
      **Source:** goal D3, parent D5.

- [ ] **T003** [P0] Inventory the cross-consumer surfaces before touching one:
      `rg -n "resolveCellTapAction" src/`, `rg -n "db-selection-status-bar" src/`,
      `rg -n "claimBottomDock" src/`, `rg -n "selection\.copy(Tsv|Markdown|Csv)" src/ tools/`.
      **Threshold:** every producer named in `plan.md`'s affected-surfaces table, or a written
      not-a-consumer line. **Red-first proof:** the table already names two renderers holding their
      own copy of the same grammar; the inventory confirms there is no third. **Source:** the
      cell menu is a cross-consumer finding, not an instance-only one.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Leg A — the cell action menu (the operator's report)

- [ ] **T004** [P0] A phone tap on an editable, non-title cell edits and does not select
      (`src/views/database-view.ts:4786-4803`, `src/views/embedded-database-renderer.ts:4384-4401`).
      **Threshold:** `.db-selection-status-bar` count reads **0** after a touch tap; the desktop
      mouse grammar is byte-unchanged. **Red-first proof:** the caller returns early only on
      `open-record` (`database-view.ts:4791`) and then runs `nextCellRange`,
      `renderCellSelectionClasses` and `renderSelectionStatusBar` on the same press (`:4795-4803`),
      although `resolveCellTapAction` already answered `edit-cell` (`table-cell-gesture.ts:269-273`).
      **Source:** ADR-002; the operator's second capture. **Lane:** the existing
      `verify-placement.mjs` selection legs (`:884`, `:894`, `:10622`) gain a bar-absence assertion,
      with a negative control that restores the fall-through and requires the count to go to 1.

- [ ] **T005** [P0] Selection becomes an explicit mode entered by a **long press on a cell**
      (`src/views/table-cell-gesture.ts`, `src/views/database-view.ts`).
      **Threshold:** a long press on a cell enters selection mode and renders the pill; **no other
      phone path** reaches selection; the gesture is `attachLongPress` (`table-cell-gesture.ts:243-249`),
      so its threshold, movement tolerance and haptic are the row grammar's rather than a second set
      matched to it. **Red-first proof:** today the only phone path into a cell selection is the
      ordinary tap T004 removes, so without this task the actions become unreachable — that is the
      red. **Source:** ADR-004 §1; the 2026-08-30 row-range ruling, which put the row's own range
      select behind the same object. **Lane:** the same selection legs assert the long press reaches
      the pill and that a plain tap does not, each with its own control.

- [ ] **T006** [P0] The phone grows **no bottom-docked selection bar**; the selection wears a
      three-control anchored pill instead
      (`src/views/database-view.ts:7607-7712`, `src/views/embedded-database-renderer.ts:4569-4579`,
      `styles.css:2590-2665`).
      **Threshold:** on a 390px viewport with a live selection, `.db-selection-status-bar` renders
      **0** times and `.db-cell-selection-pill` renders exactly **1**; the pill holds exactly **3**
      children — the live count, one `Copy`, one `···` — at `flex-wrap: nowrap`, height **44px**,
      radius `--db-radius-full`, gap `--db-space-2`, padding `--db-space-3`, every child's hit box
      **≥ 44 × 44px**. The count keeps its live region (`database-view.ts:7636-7641`, `:7660-7662`).
      `× Esc` is **not** built on a phone.
      **Red-first proof:** eight children are built for one selected cell — clear pill (`:7643`),
      count badge (`:7657`), Copy TSV (`:7665`), Copy Markdown (`:7671`), Copy CSV (`:7677`), Paste
      (`:7683`), chip-or-Fill (`:7688-7705`), Clear (`:7707`) — into `flex-wrap: wrap` with `row-gap`
      at `max-width: calc(100vw - 32px)` (`styles.css:2645-2654`), and no `.db-cell-selection-pill`
      exists in the tree. **Source:** ADR-004, decided on ADR-000's four-product read — zero of four
      references dock a labelled action bar to the frame's bottom edge, and Notion's own selected
      cell wears a two-control anchored pill
      (`screenshots/notion/ios/flows/reordering-a-table/notion-ios-flow-reordering-a-table-02-026940b3-e0de-443d-a948-6eb1e53e4ea1.webp`).
      **Lane:** pill-shape, child-count and bar-absence assertions on the existing selection legs,
      control = restore the phone bar rule and require the bar count to go to 1.

- [ ] **T007** [P0] The pill is anchored to the selection and clamped clear of Obsidian's phone
      navigation bar, and the navigation height is published whether or not the FAB renders
      (`src/views/database-view.ts`, `styles.css`, `src/views/toolbar-renderer.ts:2362`, `:2410-2419`).
      **Threshold:** the pill sits **8px** above the selection range's top edge, or 8px below it when
      there is no room above; its rect is fully inside the grid's scroll viewport with a **≥ 8px**
      margin each side; its bottom edge resolves at or above
      `max(env(safe-area-inset-bottom), var(--db-mobile-navbar-height, 0px)) + 8px`, so the
      intersection area with the navigation bar's rect reads **0px²**; and
      `--db-mobile-navbar-height` resolves non-zero on a phone container with no FAB.
      **Red-first proof:** the bar's `bottom` is
      `max(16px, env(safe-area-inset-bottom), var(--db-keyboard-inset, 0px))` (`styles.css:2646`)
      with no navigation-bar term, while the mobile FAB on the same container already reads it
      (`:22569`); and the publisher `reserveMobileFabInset` runs only inside the New-button build
      (`toolbar-renderer.ts:2362`). **Source:** ADR-004 §3; the operator's first capture. **Lane:**
      the clearance and clamp assertions against a stand-in `.mobile-navbar` rect, controls = drop
      the navbar term and require overlap, and widen the range past the viewport and require the
      clamp to hold. **Trap:** a `var()` that misses does not fail — the same silence
      `styles.css:2639-2644` already documents for `--db-keyboard-inset`.

- [ ] **T008** [P0] Every cell editor claims the bottom dock while it is open
      (`src/views/record-surface/cell-editor-text.ts:331` and its close path; the other editors per
      T003's inventory).
      **Threshold:** `body.db-bottom-dock-taken` is present for the whole life of every cell editor
      and released on commit, cancel and outside-press alike. **Red-first proof:**
      `openTextPopoverEditor` (`:331`) never calls `claimBottomDock`, where `openSingleLineEditor`
      claims at `:212` and releases at `:233` — so the rule that hides the bar
      (`styles.css:2635-2637`) does not fire for a multi-line text cell, which is exactly the
      operator's second capture. **Source:** ADR-003. **Lane:** the class asserted while the editor
      is open, control = remove the claim and require the bar to reappear.

- [ ] **T011** [P0] `···` opens a titled sheet on the phone and an anchored menu on desktop, and
      the desktop bar collapses to five children
      (`src/views/database-view.ts:7607-7712`, `src/i18n.ts:369-371`, `styles.css:925`).
      **Threshold:** the phone sheet is the shell's own bottom sheet — `044`'s grammar, header
      everywhere, registered as an `048` stacked pair — titled **"N cells selected"**, carrying
      labelled rows in three groups: *Copy TSV · Copy Markdown · Copy CSV* | *Paste · Fill · Bulk
      edit <Column>* | ***Clear*** (destructive, last, the only red row); a group that would be empty
      is not drawn. Every one of the seven actions is reachable within **one** tap of `···`. On
      desktop the bar's child count reads **≤ 5** — count, Copy, Paste, Clear, `···` — at
      `flex-wrap: nowrap` and the declared **30px** (`--db-selection-status-height`,
      `styles.css:925`), with the three copy formats and Fill in the `···` anchored menu.
      **Red-first proof:** there is no `···` control and no sheet on either platform; the same
      builder emits eight children on both. **Source:** ADR-004 §4 and its desktop half — Notion's
      `···` "Actions" sheet
      (`screenshots/notion/ios/flows/turning-a-table-into-a-database/notion-ios-flow-turning-a-table-into-a-database-03-6ecea6c7-4682-4c35-b649-412a0a240738.webp`),
      Evernote's titled sheets
      (`screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-05-0487410c-2d35-470c-8dc8-39ae80077152.webp`)
      and Fibery's Actions dropdown
      (`.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/deleting-entities/fibery-web-flow-deleting-entities-03-0a207252-0899-4e33-8a10-a9c22005dbaa.webp`).
      **Lane:** a reachability assertion enumerating the sheet's rows and the menu's items, control =
      drop a row and require the count to fall. **Constraint:** nothing is deleted — all three copy
      strings stay (`i18n.ts:369-371`).

### Leg B — the confirm card

- [ ] **T009** [P0] The destructive confirm presents as a margined card with stacked full-width
      actions, on both platforms (`src/views/surface-shell.ts:156-170`,
      `src/views/mobile-bottom-sheet.ts:29-45` and `:364`, `src/views/modals/confirm-modal.ts`,
      `src/views/confirm-sheet.ts:46-71`, `styles.css:230-282` and `:8592-8598`).
      **Threshold:** inset **≥ 16px** on all four edges, radius `--db-radius-xl` on all four corners,
      actions stacked full width at **≥ 44px** each with a 50pt target
      (`SHELL_PRIMARY_ACTION_HEIGHT_PT`, `surface-shell.ts:167`), and `openAndWait` still resolving
      `false` on Escape, outside press and drag. **Red-first proof:** the sheet is flush at
      `left: 0 !important; right: 0 !important` (`styles.css:230-231`) with a top-corners-only radius
      (`:265`), and the action row is `display: flex; flex-wrap: wrap; justify-content: flex-end`
      (`:8592-8595`) with no `min-height` on its buttons. **Source:** ADR-001; digest A4, C9, G3 and
      `screenshots/notion/ios/database/notion-ios-database-property-editor-02-658fd83b-c23b-4573-aac8-a18e06e185a1.webp`.
      **Lane:** the `confirm` row in `tools/live/sheet-grammar.mjs` gains inset, radius and
      action-layout columns measured off the shipped `buildConfirmSheetBody`; control = strip the
      card class and require red. **Constraint:** `super(app, "sheet")` (`confirm-modal.ts:44`) is
      unchanged — `048` D1 forbids the `dialog` route on a phone.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] **T010** [P0] Append two questions to `067` AC-011's device checklist, and add no fourth device
      owner: does the selection bar clear the navigation pill on the real device, and does a tap on a
      cell open the editor without a bar flashing first
      (`../067-sheet-family-remediation/acceptance-criteria.md`).
      **Threshold:** the two questions present in that checklist; **zero** new operator device rows
      created in this packet. **Red-first proof:** neither question exists in any checklist today.
      **Source:** goal D5, parent D3. **Never ticked from here** — the operator answers it, and
      `044` AC-006, `048` AC-009, `051` AC-010 and `067` AC-011 are read against one build.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Every negative control observed red before its row was called green
- [ ] `acceptance-criteria.md` AC-001 to AC-004, AC-006, AC-007 and AC-008 `Met`, `Waived` or `Superseded`
- [ ] AC-005 answered by the operator, in `067` AC-011's sitting
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Research**: See `research/research.md`
- **Sibling**: `../067-sheet-family-remediation/` — REQ-001..011, deliberately not restated
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Dependencies identified and available — the five `Proposed` ADRs were the blocker and the operator closed them on 2026-09-06 at 19:00; ADR-006 is parked and gates no P0
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` exits 0, read from `$?`
- [ ] CHK-011 [P0] `npm run build` exits 0 and no console error appears in a capture run
- [ ] CHK-012 [P1] The dock claim is released on every editor close path, not only on commit
- [ ] CHK-013 [P1] Both renderers hold the same tap grammar and the same bar shape after the leg
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] Every acceptance row's threshold measured, not inferred
- [ ] CHK-021 [P0] `npx vitest run` green; `npm run gate` exit 0 read from a file, not a pipe
- [ ] CHK-022 [P1] Edge cases from `spec.md` §8 exercised: multi-column selection, 100+ cells, a
      read-only view, an unmeasurable navigation bar, keyboard open with a live selection
- [ ] CHK-023 [P1] Every negative control run independently at the landing rather than taken on
      report
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Finding class recorded: the cell menu is **cross-consumer** (two renderers,
      one grammar); the confirm card is **class-of-bug** (one primitive, every consumer).
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed per T003, or instance-only proven by
      grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for `resolveCellTapAction`,
      `renderSelectionStatusBar`, `claimBottomDock`, `buildConfirmSheetBody` and the three copy
      strings.
- [ ] CHK-FIX-004 [P0] Not applicable — no security, path, parser or redaction surface is touched;
      recorded rather than left blank.
- [ ] CHK-FIX-005 [P1] Matrix axes listed before implementation: {phone, desktop} × {one cell, many
      cells, one column vs many} × {read-only, editable} × {keyboard open, closed}.
- [ ] CHK-FIX-006 [P1] Not applicable — no process-wide state is read.
- [ ] CHK-FIX-007 [P1] Evidence pinned to a fix SHA, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Clipboard reads on the Paste path keep their existing validation
- [ ] CHK-032 [P1] Not applicable — no auth surface is touched; recorded rather than left blank
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] spec / plan / tasks / acceptance-criteria / decision-record synchronized
- [ ] CHK-041 [P1] Code comments carry the durable WHY and no spec path, packet number or task id
- [ ] CHK-042 [P2] The parent's `roadmap.md` §5.A row and `goal.md` tables updated at the landing
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 0/11 |
| P1 Items | 14 | 0/14 |
| P2 Items | 4 | 0/4 |

**Verification Date**: 2026-09-06
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md — six, and each names its
      ruling of record
- [ ] CHK-101 [P1] All ADRs have status: five `Proposed`, one `Accepted`
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale in every ADR
- [ ] CHK-103 [P2] Not applicable — no migration path; nothing is persisted
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] NFR-P01: the tap-to-editor path adds no layout pass beyond the editor's own
- [ ] CHK-111 [P1] Not applicable — no throughput target; recorded rather than left blank
- [ ] CHK-112 [P2] Not applicable — no load surface
- [ ] CHK-113 [P2] Not applicable — no benchmark claimed, so none is owed
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented in `plan.md` §7 and exercised once on a branch
- [ ] CHK-121 [P0] No feature flag — each change is a class or an early return and reverts by itself;
      recorded rather than left blank
- [ ] CHK-122 [P1] The three lanes carrying this packet's rows are in `npm run gate`
- [ ] CHK-123 [P1] The device sitting's two questions are in `067` AC-011's checklist
- [ ] CHK-124 [P2] The release note names the changed gesture, because a tap that stops selecting is
      a behaviour change a user will notice
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Not applicable — no security review surface; recorded rather than left blank
- [ ] CHK-131 [P1] No dependency added
- [ ] CHK-132 [P2] Not applicable
- [ ] CHK-133 [P2] Not applicable — no user data is read or written
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized, including the parent's `spec.md` phase map row
- [ ] CHK-141 [P1] Not applicable — no public API changes
- [ ] CHK-142 [P2] CHANGELOG entry for the changed tap gesture
- [ ] CHK-143 [P2] The conflict register (ADR-005) is the knowledge transfer, and it is written
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Decision authority on the five `Proposed` ADRs | [x] Approved | 2026-09-06 19:00 |
| Operator | Device read, in `067` AC-011's sitting | [ ] Approved | |
| Fresh in-runtime verifier | Gate and `validate.sh --strict` run independently (parent D4) | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
