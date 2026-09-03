---
title: "Goal: Shared UI/UX Port"
description: "One token/primitive/motion/settings/accessibility vocabulary across the ported surfaces, without touching the local bottom sheet."
trigger_phrases:
  - "041 goal"
  - "shared ui ux port goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/041-shared-ui-ux-port"
    last_updated_at: "2026-09-03T21:04:00Z"
    last_updated_by: "reduced-motion-descendant-fix"
    recent_action: "Closed T007's owned-menu reduced-motion gap: added .db-surface to styles.css:876"
    next_safe_action: "Verify owned-menu reduced motion on an operator device"
    blockers:
      - "037-040 have not all landed their own renderer shape yet, so cross-surface polish (plan.md step 7) has no full target"
    key_files:
      - "spec.md"
      - "plan.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "041-shared-ui-ux-port-open"
      parent_session_id: null
    completion_pct: 27
    open_questions:
      - "Whether the settings reconciliation adds a first-class PluginSettings field now, or defers to 037/038 where the concrete display options live"
      - "Whether reduced-motion coverage extends to 037/038/039's own new overlay classes or stays scoped to the two selectors this packet's spec names"
    answered_questions:
      - "Bottom sheets stay local: mobile-bottom-sheet.ts:81-87, :414-422, :423-426, :488 are the keep-local evidence and this packet does not edit that file"
      - "Level 2, per recommend-level.sh at the catalog's own 650-950 LOC / ~9-12 file estimate"
---
# Goal: Shared UI/UX Port

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Give the timeline, board and calendar renderers one reconciled token, primitive,
motion, settings and accessibility vocabulary: rewritten from `036`'s verified obsidian-pm
citations into this repository's `db-*` surfaces: without replacing the local bottom sheet, table
view, or calculation layer, all three of which the catalog names as ours to keep.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The local bottom sheet is not a port target. `mobile-bottom-sheet.ts:81-87` (`createSheetHandle`), `:414-422` (`shouldFlickDismiss`), `:423-426` (`attachSheetDragToDismiss`) and `:488` (its pointerup application) are the catalog's corrected keep-local evidence; a diff touching that file fails this packet. |
| D2 | Every reconciled token or primitive traces to a verified `specs/context/obsidian-pm-main` `file:line`, re-checked against current disk before use, or is marked a documented local-only extension. No invented citation. |
| D3 | Token reconciliation is additive. No existing `--db-*` variable is renamed or removed on the strength of this packet; `styles.css:63-67`'s own recorded lesson: a frozen editor geometry measured against `--db-font-md`: is the standing example of what an in-place rename costs. |
| D4 | Editing `styles.css` requires the lane hold in `tools/lane/css-lane.json`, acquired before the edit and released only after a recapture this packet's author has read. |
| D5 | A completion-criteria row needs its own observed red before it is ticked green, per the parent program's D2/D3 (`005/goal.md`). |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] `git diff -- src/views/mobile-bottom-sheet.ts` is empty after this packet lands (AC-001).
- [ ] Every reconciled `--db-*` token or primitive traces to a verified reference citation or a
      documented local-only extension (AC-002).
- [ ] `SURFACE_PHASE=041-shared-ui-ux-port npm run gate` exits 0, read from `$?` directly (AC-003).
- [ ] `empty-state-renderer.ts`'s composition covers the verified `EmptyState.ts:10-37` icon/title/
      body/action/CTA shape through local diagnostics-aware reasons (AC-004).
- [ ] `board-renderer.ts`'s card icon/tooltip/chip density is reconciled against `IconButton.ts:3-31`/
      `Chip.ts:3-40` through local field renderers, no copied DOM (AC-005).
- [x] The reduced-motion media rule covers every implied `db-overlay-enter`/`db-mobile-sheet-scrim`
      surface without adding a second sheet-height cap (AC-006). T007 closed the named surfaces; the
      narrower gap it left standing — an owned menu is a `.db-surface` without `.note-database-container`,
      so the container-wide reset never reached its descendants — is closed by adding `.db-surface` to
      that reset (`styles.css:883-886`). A source-string test on the block's selector list
      (`owned-menu-reduced-motion.test.ts`) failed `toContain(".db-surface")` before the fix and passed
      after. No second sheet-height cap was added.
- [ ] `SettingsTab.display()` exposes the reconciled default-view/editor/save and board/timeline
      display vocabulary, localized through `src/i18n.ts` (AC-007).
- [ ] Toggle-button `aria-expanded`/`is-open` state and the board's roving keyboard match the
      reconciled active/focus language verified at `chrome.css:124-170` (AC-008).
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Nothing has started.** This packet was opened from `036-obsidian-pm-ui-harvest`'s research
catalog §5 ("SHARED UI / UX") and the Final adoption plan's row 5, plus the catalog's "Cross-surface
integration seams and rewrite standard" and "Copy / rewrite / drop policy" sections. `spec.md`,
`plan.md`, `tasks.md`, `acceptance-criteria.md` and this `goal.md` are the first work done in the
folder; no code has landed.

Local host files were read before writing this packet's scope, per D2: `styles.css:1-20, :55-90,
:706-713`; `src/views/empty-state-renderer.ts:25-60, :140-155`; `src/views/board-renderer.ts:745-795`;
`src/settings.ts:70-95`; `src/data/types.ts:373-400`; `src/views/toolbar-renderer.ts:2050-2075,
:2108-2118`; `src/views/card-roving-tabindex.ts:60-100`; `src/views/mobile-bottom-sheet.ts:75-95,
:115-205, :405-430, :480-495`. One correction against the catalog's own citation: its
`toolbar-renderer.ts:2067-2070` pointer for the "expanded state helper" lands on
`closeViewTabPopover`, not the toggle helper; the actual `setPopoverTriggerState` that sets
`aria-expanded` and `is-open` is at `:2111-2114`, and this packet's `spec.md`/`plan.md`/
`tasks.md`/`acceptance-criteria.md` cite the corrected line window.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened, docs authored | Done | `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md`, this `goal.md` |
| Token reconciliation (plan.md step 1) | Pending | Not started |
| Empty-state composition (plan.md step 2) | Pending | Not started |
| Primitive density (plan.md step 3) | Pending | Not started |
| Motion / reduced motion (plan.md step 4) | Done | T007 (tasks.md) plus the owned-menu descendant fix recorded below; AC-006 ticked |
| Settings UX (plan.md step 5) | Pending | Not started |
| Accessibility / focus (plan.md step 6) | Pending | Not started |
| Cross-surface polish (plan.md step 7) | Pending | Depends on `037`/`038`/`039` landing their own renderer shape |

### Update, 2026-09-03

Leg a and leg b (see `implementation-summary.md`) had already landed by the time this entry was
written; the paragraph above predates them and is left as the record of how the packet opened.

This entry closes the one gap leg b's own limitations list recorded rather than fixed: an owned
menu (`owned-menu.ts:86`) mounts on `doc.body` carrying `.db-surface` and never
`.note-database-container`, so the container-wide reduced-motion reset at `styles.css:876` never
reached its descendants. `.db-surface` (and its `*`/`::before`/`::after` arms) now leads that
selector list, mirroring the `.db-surface`-leads-the-list convention the accent focus ring already
uses. Red-first via a source-string test (`src/views/owned-menu-reduced-motion.test.ts`) asserting
the block's selector list contains `.db-surface`; failed before the edit, passed after. The two
scenarios that actually render `.db-surface` (`chrome-owned-menu`, `chrome-owned-menu-sheet`) came
back byte-identical on recapture; ten unrelated captures drifted across repeated runs on the same
tree with no `.db-surface` in their markup at all and were restored rather than shipped, matching
the harness non-determinism this packet's own limitations list already named.

### Deviations and findings

| Item | Note |
|------|------|
| `036/research/research.md` `toolbar-renderer.ts:2067-2070` citation | Points at `closeViewTabPopover`, not the aria-expanded toggle helper. The toggle helper `setPopoverTriggerState` (sets `aria-expanded` and toggles `is-open`) is actually at `:2111-2114`. Corrected in this packet's own docs; not this packet's scope to edit the parent research artifact. |
<!-- /ANCHOR:log -->
