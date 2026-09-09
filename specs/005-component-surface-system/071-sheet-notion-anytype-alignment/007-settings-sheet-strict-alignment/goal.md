---
title: "Goal: Settings Sheet Strict Notion Alignment"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "007-settings-sheet-strict-alignment goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/007-settings-sheet-strict-alignment"
    last_updated_at: "2026-09-09T20:45:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive and the reference/gap-table inventory"
    next_safe_action: "Execute tasks.md T001-T012"
    blockers: []
    key_files:
      - "spec.md"
      - "tools/live/sheet-grammar.mjs"
      - "src/views/view-config-panel-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "007-settings-sheet-strict-alignment-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the operator want REQ-006's header change (centered title, handle-only dismissal) applied app-wide, per-sheet, or not at all"
      - "Can the operator supply a full-resolution Notion iOS database-settings screenshot to replace spec.md §13's TBD numeric cells"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Settings Sheet Strict Notion Alignment

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The Settings sheet's card/grouping shell matches Notion's own database-settings
sheet's grouped-card silhouette, closing the operator's 0.0.36 report that the sheet "still has bad
ui overall and needs strict alignment with notion sheets," without regressing `002`'s already-
converged row-internal grammar.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Row-internal grammar (pitch, dividers, control types) that `002`/`004` already converged is regression-checked, not re-designed, in this phase |
| D2 | Where a Notion pixel number cannot be read off the only local capture (a 299x678px thumbnail), the target stays `TBD` rather than invented — the same discipline `002` decision D-005 established |
| D3 | Only the operator's own device recheck may close the alignment judgement; no agent ticks AC-007 |
| D4 | REQ-006 (header centering, close-button removal) is held Proposed pending an explicit operator ruling, because `createSheetHeader` is shared by every phone sheet in the app and a change there is out of this phase's Settings-sheet-only scope |

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

- [x] Reference inventory and current-state gap table complete (`spec.md` §13)
- [ ] Settings sheet's card-grouping shell implemented and measured by the sheet-grammar lane (RED
      then GREEN)
- [ ] No regression on `002`'s row-grammar and overflow assertions
- [ ] Recaptured phone-only, light and dark, with a measured before/after recorded
- [ ] Operator's own device re-read reports the sheet aligned (D3 — no agent ticks this row)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-09, worktree `worktrees/268-settings-sheet-strict` |
| Reference inventory | Done | `spec.md` §13 — the actual per-database "Settings" bottom sheet located at `screenshots/notion/ios/flows/database-settings/`, viewed directly; `002`'s own citation of `notion/ios/settings`/`notion/web/settings` found to be the account-level Settings pages, a different surface |
| Current-state measurement | Done | `tools/live/sheet-grammar.mjs` run against the settings surface; `styles.css` read directly for row/section/divider/header rules |
| Gap table | Done | `spec.md` §13 — 12 shell properties, current measured, Notion observed/TBD, and a target for each |
| Card-grouping implementation | Not started | Deferred to `tasks.md` T003-T007 |
| Regression check | Not started | Deferred to `tasks.md` T008-T009 |
| Recapture | Not started | Deferred to `tasks.md` T010 |
| Operator device read | Open | D3 — the report that opened this phase IS the prior device read; the next one closes it |

### Deviations and findings

| Item | Note |
|------|------|
| `002`'s Notion reference citation was the wrong surface | `002/spec.md` §13 cited `notion/ios/settings` (24) / `notion/web/settings` (51) as the Settings sheet's reference, but those files are Notion's account-level Settings pages (Password, Passkeys, Theme, Subscription). The per-database "Settings" bottom sheet — the one this plugin's Settings sheet actually corresponds to — lives at `screenshots/notion/ios/flows/database-settings/` and was never opened by `002`. This phase's central finding (the card-grouping gap) only surfaced once that flow was viewed |
| No landed Anytype ruling contradicts this phase | `071/goal.md` D15 makes Anytype the default only for the board and the calendar (§7.12); `002`'s own decision record (D-001 through D-005) records implementation mechanics, not a Notion-vs-Anytype choice — it already targeted "Notion-shaped" rows. No Proposed ADR is opened in `roadmap.md` §7 because no contradiction exists to record |
| Image-viewing is available in this harness | Contrary to `002/decision-record.md`'s note ("no image-viewing in this harness"), this scaffold viewed `.webp` and `.png` captures directly (Read tool). The Notion asset's limit is its **resolution** (299x678px, confirmed via `sips`), not an inability to view it — this is why the gap table can state real structure (card grouping, header alignment, close-button absence) as observed, while still marking exact pixel values `TBD` |
<!-- /ANCHOR:log -->
