---
title: "Goal: Filter Sheet Row Model"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "008-filter-sheet-row-model goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/008-filter-sheet-row-model"
    last_updated_at: "2026-09-09T22:50:00Z"
    last_updated_by: "sheet-notion-audit"
    recent_action: "Scaffolded from the sheet-notion audit's 3.9 gap table"
    next_safe_action: "Execute tasks.md T001-T012"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-notion-audit.md"
      - "src/views/filter-panel-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "008-filter-sheet-row-model-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "ADR-B: is the AND/OR conjunction control retained? Default retain; operator may overrule"
      - "Can the operator supply a full-resolution Notion Advanced-filter capture (audit C-1)"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Filter Sheet Row Model

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A filter condition on a phone reads as three labelled rows whose property name is
legible in full, its rule actions are named rather than drawn as unlabelled glyphs, and the sheet
sits on the same 16px row inset and row span as the sort and group sheets beside it — closing the
audit's §3.9 finding that the Filter sheet renders its property names as two characters.

### Decisions

| ID | Decision |
|----|----------|
| D1 | No numeric target in this packet may be derived from a Notion asset. Every Notion iOS capture here is 299x678; the Notion column is structural and every number is ours |
| D2 | Row pitch, divider inset, section inset and native-select count are regression-checked, not re-designed — `005` converged them |
| D3 | Only the operator's own device recheck may close the alignment judgement; no agent ticks AC-011 |
| D4 | The `AND (all)` / `OR (any)` conjunction control is **retained** by default. Notion has no inline equivalent, but removing a working control to match a screenshot is a regression. Held Proposed as `../sheet-notion-audit.md` §6 ADR-B |
| D5 | No card or canvas treatment is added here — `007` owns that decision (§6 ADR-A) |

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

- [x] Reference and current-state gap table complete (`spec.md` §13, from `../sheet-notion-audit.md` §3.9)
- [ ] A condition renders on 3 rows with ≤4 interactive controls, lane-measured RED then GREEN
- [ ] A 12-character property name renders untruncated at 402px, lane-measured
- [ ] The sheet's row inset reads 16.0px and the three panel sheets share one row span within ±2px
- [ ] No regression on `005`'s row-grammar and overflow clauses, both engines
- [ ] Recaptured phone-only light and dark, with a measured before/after recorded
- [ ] Operator's own device re-read reports the Filter sheet legible (D3 — no agent ticks this row)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-09, worktree `worktrees/272-sheet-notion-audit` |
| Reference inventory | Done | `../sheet-notion-audit.md` §3.9 — Notion's Advanced-filter sheet located at `screenshots/notion/ios/database/notion-ios-database-filters-03/-04/-07/-08` and four frames of `flows/filtering-a-database/`, all 299x678, read for structure only |
| Current-state measurement | Done | `node tools/live/sheet-grammar.mjs` PASS exit 0: filter 3/3 rows @48px, padding 16px/16px, span 332px, 0 native selects, extent 373 == 373, row inset **25.0px** printed and unasserted |
| Visual read | Done | `screenshots/notion-clone/panels/constructed-filter-panel-mobile-light.png` (804x1748) opened: property names render `F…`, `gr…`, `is…`; value `Backl…` |
| Gap table | Done | `spec.md` §13 — 11 properties, current measured, Notion observed structure, target |
| Implementation | Not started | Deferred to `tasks.md` T004-T010 |
| Regression check | Not started | Deferred to `tasks.md` T011-T012 |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it |

### Deviations and findings

| Item | Note |
|------|------|
| The lane prints a number it never asserts | `sheet-grammar.mjs:3998` prints `report.pairs[0].rowInsetFromSheet` in the divider-inset clause's PASS line, and the clause asserts only hairline presence. Filter has been reading 25.0px against sort's 16.0px in every green run since `005` landed. T006 promotes the printed number to an assertion |
| The eight grammar columns are presence checks | `surface`, `handle`, `header`, `rows`, `segmented`, `keyboard`, `safeArea`, `dropdown` each print `true`. They prove a sheet has chrome, not what is in it — which is why this sheet scores 8/8 and shows the user `F…`. Recorded in `../sheet-notion-audit.md` §1 as Mechanism A |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. The two contradictions this phase does touch are with **Notion**, not Anytype, and both are held Proposed rather than resolved (§6 ADR-B, ADR-C) |
<!-- /ANCHOR:log -->
