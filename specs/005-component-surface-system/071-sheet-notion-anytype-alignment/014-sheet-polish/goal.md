---
title: "Goal: Sheet Polish"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "014-sheet-polish goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/014-sheet-polish"
    last_updated_at: "2026-09-09T22:50:00Z"
    last_updated_by: "sheet-notion-audit"
    recent_action: "Scaffolded from the sheet-notion audit's gap tables"
    next_safe_action: "Execute tasks.md T001-T007"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-notion-audit.md"
      - "src/views/icon-picker-popover.ts"
      - "src/views/column-manager-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "014-sheet-polish-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Is the icon picker's Remove action promoted to the sheet header, matching Notion, given that `createSheetHeader` is shared by every phone sheet and a header-slot change there is a whole-app change?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Polish

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The P3 residue of the sheet-notion audit lands in one packet rather than scattering across six: the icon picker stops crowding three buttons beside its search field, and the add-affordance pairs render as full-width rows like every other add in the app.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This packet exists so that P3 findings are neither lost nor promoted. Nothing here is a defect a user reported; each item is a consistency gap the audit measured |
| D2 | No numeric target may be derived from a Notion asset. Every Notion iOS capture here is 299x678; every number is ours |
| D3 | If promoting the icon picker's Remove into the header requires changing `createSheetHeader`, that change is **out of scope** and the item is recorded Proposed instead — the same boundary `007` REQ-006 already draws around the shared header builder |
| D4 | This packet is ordered **last** for the implementation leg. If budget runs short it is the one to drop, and dropping it costs no P1 or P2 row |
| D5 | Only the operator's own device recheck may close the alignment judgement; no agent ticks the device row |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Reference and current-state gap table complete (`spec.md` §13, from `../sheet-notion-audit.md`)
- [ ] The icon picker's Remove, Random and settings controls no longer share a row with its search field
- [ ] The add-affordance pairs on the properties and record sheets render as full-width rows
- [ ] No regression on any landed sheet clause
- [ ] Recaptured phone-only light and dark for each surface that changes
- [ ] Operator's own device re-read reports the polish items closed (no agent ticks this row)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-09, worktree `worktrees/272-sheet-notion-audit` |
| Reference inventory | Done | `../sheet-notion-audit.md` §3.6 and §3.1. Icon picker: `screenshots/notion/ios/sheets/notion-ios-sheets-icon-picker-01-0c4e7197-170b-44d6-adea-534219b9dd35.webp` — `Remove` top-left, `Page icon` centred, `Close` top-right, with the search row carrying only the filter field and its two adjacent affordances. 299x678, read for structure only |
| Current-state measurement | Done | `node tools/live/sheet-grammar.mjs` PASS exit 0: icon-picker 8/8 grammar columns, close target 44.0x44.0, parent dim ratio 0.390, title centres within 0.49px |
| Producer read | Done | `icon-picker-popover.ts:122-151` builds tabs, the search input, then `Remove`, `Random` and a settings button into the same header div. `column-manager-renderer.ts:117-137` builds `+ Add property` and `+ File property` as two buttons on one line |
| Gap table | Done | `spec.md` §13 |
| Implementation | Not started | Deferred to `tasks.md` |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it |

### Deviations and findings

| Item | Note |
|------|------|
| The colour picker needed no row and is recorded as converged | `option-color-picker.ts:76-89` builds a single-column list of rows carrying a colour dot, a translated name and a checkmark for the current value. Notion's `flows/adding-a-conditional-color/notion-ios-flow-adding-a-conditional-color-06-*.webp` is the same control. The audit records it converged (§3.7) so a later pass does not re-audit it |
| The column-width sheet has no Notion reference at all | Notion's iOS app exposes no per-column width; the nearest relative is a `Wrap all columns` toggle on its Table layout sheet. No delta can be stated where no reference exists, and the audit says so (§3.13) rather than inventing one |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. Where a Notion reading contradicts a landed decision, this packet records it as Proposed in `../sheet-notion-audit.md` §6 rather than resolving it |
<!-- /ANCHOR:log -->
