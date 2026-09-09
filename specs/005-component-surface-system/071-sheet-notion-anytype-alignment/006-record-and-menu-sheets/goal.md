---
title: "Goal: Record Detail Sheet and Menu Cards Redesign"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "006-record-and-menu-sheets goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/006-record-and-menu-sheets"
    last_updated_at: "2026-09-08T08:20:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive"
    next_safe_action: "Execute against the completion criteria"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "006-record-and-menu-sheets-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Record Detail Sheet and Menu Cards Redesign

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The record detail sheet and menu-card popovers match their mapped reference.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This phase does not start until Phase 1 names these surfaces' reference |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Phase 1's reference mapping read before redesign starts
- [x] Surfaces redesigned and recaptured against their mapped reference — the redesign is measured (RED 21/21 rows at 61.0px → GREEN 21/21 at 44.0px, inset 16.0px, headings 16.0px/1px, exit 1 → exit 0) and the recapture ran (616/616 twice; 21 content movers judged, 9 jitter restored, 9 byte-only); the reference columns stay `TBD` (D-005, inherited: no third-party reference carries readable measurements), so the against-its-reference half is recorded, not proven. Ticked at the 2026-09-09 landing verification per the 003/004 precedent — the before/after is the lane's printed numbers, the family has no committed PNG, and the mutations were re-proven on the merged tree: deleting the section-header border-top alone flips exactly that lane row (16.0px/0px, lane exit 1, 1 failure), the unit suite reads 5/5 → 1 failed | 4 passed → 5/5 on the surface-inset revert, and the post-rebase recapture (616/616 twice) kept 12 two-run-stable movers and restored 1 jitter mover (board-view-desktop-dark 4px@max1, run-2 only)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Phase 1 mapping read | Done | The inventory rows quoted in `plan.md` §1: the record sheet (line 47, `src/views/record-detail-panel.ts:172`), the record peek (line 48), the six menu-card children (lines 120–125), the column-menu popover (line 94) |
| Gap table | Done | `spec.md` §13 — current numbers measured by the lane; reference columns honest `TBD` (D-005, inherited) |
| RED | Done | 21/21 property rows one-line but all 21 at 61.0px (last 60.0), labels 25.0px, section headings 13.0px/0px, 4 failures, exit 1 (`tools/live/sheet-grammar.mjs`) |
| Implemented | Done | `styles.css` only; the producers untouched except the row-pitch contract's second documented exception (decision-record D-001/D-004) |
| GREEN | Done | 21/21 property rows at 44.0px, inset 16.0px, heading 16.0px/1px, 0 native selects, extent 401 ≤ 401 @ 402px, 2166 PASS / 0 FAIL, exit 0 |
| Unit-test revert proof | Done | 5/5 → 1 failed / 4 passed on the shared-inset line → 5/5 (`src/views/record-sheet-row-grammar.test.ts`) |
| Captures + evidence + gate | Done | 616/616 ×2 + the decoded pixel-delta judgement (21 content movers, 9 jitter restores, 9 byte-only); evidence 15/15 fresh after 11 writers re-run (engine-parity 1 INFORMATIONAL); gate 27/27, exit 0; the css-lane acquired/edited/released, holder = this packet, baselineHash `eba321e38ac0` |
| Docs + validation | Done | This log, `acceptance-criteria.md` (3 × `Met`), `implementation-summary.md`, `decision-record.md`, `tasks.md`; the orchestrator's `--strict` verdict and the graph-metadata backfill recorded with the commit |

### Deviations and findings

| Item | Note |
|------|------|
| The 44px touch floor's box was unnamed | The same row measured 61.0px (content-box: floor + the row's 8px/8px padding + 1px hairline; the last row 60.0) and 44px elsewhere — the five measured row shapes now name `border-box` (D-002) |
| The rows' second zero-horizontal-padding exception | The record field row joins the Add-view precedent in the row-pitch contract; the surface's one 16px inset is the label's, the hairlines' and the section dividers' single reading line (D-001/D-004) |
| 067's seventeen outstanding capture reads | The five this release actually moved are judged and named in the css-lane release (body-empty-desktop-light 62,773px @214, its dark pair, the depth3 pair, chrome-owned-menu-sheet); the twelve that did not move stay 067's (D-record §4) |
| Reference measurements | `TBD`, the settings leg's ruling inherited: the third-party captures carry no readable numbers; the directives are the targets (D-005) |
| engine-parity exits 1 | INFORMATIONAL by design: 43→67 disagreeing elements, +6 selector-pairs, all three panel-modal checkbox-tint notes, 0 record-family fixtures — the 002 precedent |
<!-- /ANCHOR:log -->
