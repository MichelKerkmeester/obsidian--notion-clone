---
title: "Goal: Sheet Family Alignment to Notion x Anytype"
description: "The durable directive this phase parent executes against and the criteria that decide when the whole packet is done."
trigger_phrases:
  - "packet goal"
  - "071 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment"
    last_updated_at: "2026-09-09T02:25:00Z"
    last_updated_by: "245-landing-verify"
    recent_action: "004-view-config-sheet LANDED+verified: goal 3/3, parent 2/4"
    next_safe_action: "005/006 redesign legs; 008/003-004 wait on the next release"
    blockers:
      - "071/004's landing is complete (f72e50cd, landing-verified); the .worktrees/245-view-config-sheet worktree can be retired once the 005-handover entry lands"
      - "005/006 not started — the row grammar's next two consumers; the 005 track handover carries the resume point"
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "071-sheet-notion-anytype-alignment-scaffold"
      parent_session_id: null
    completion_pct: 50
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Family Alignment to Notion x Anytype

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every sheet, panel and popover the app can open is inventoried once (R7), then brought as close as possible to Notion x Anytype's own presentation, one sheet family per child phase, starting with the settings sheet (R5) and the add-property sheet (R6).

### Decisions

| ID | Decision |
|----|----------|
| D1 | No child phase after 001 may redesign a sheet without first citing 001's reference-mapping row for it |
| D2 | The settings sheet (002) and add-property sheet (003) are the first two rows, per the operator |
| D3 | Only the operator's own device recheck may close a device row; no agent ticks it |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the child goal before working a phase.** Each is authoritative for its
phase and binds as if written here.

| Phase | Goal document |
|-------|---------------|
| 001-sheet-story-coverage-audit | `001-sheet-story-coverage-audit/goal.md` |
| 002-settings-sheet | `002-settings-sheet/goal.md` |
| 003-add-property-sheet | `003-add-property-sheet/goal.md` |
| 004-view-config-sheet | `004-view-config-sheet/goal.md` |
| 005-filter-sort-group-sheets | `005-filter-sort-group-sheets/goal.md` |
| 006-record-and-menu-sheets | `006-record-and-menu-sheets/goal.md` |

**Precedence.** Decisions above outrank child detail. Child detail outranks any
summary of it. Name a conflict rather than resolving it silently.

**Stop.** Only the criteria below decide done. An evaluator sees the objective
string, not these files.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] 001's inventory table exists and names every sheet-capable surface with its coverage and reference state — `001/inventory.md` holds 86 rows (54 primary + 32 stacked) with 0 blank cells, 68 rows carrying captures, 46 recording "none" references by name; the parent figure was 0/4 when the packet landed 2026-09-08 (`527e8455`), the packet's own 3/3 criteria are all ticked, its 9-test count suite and the 27/0 gate are green; the three redesign criteria stay open, so the parent's figure is 1/4
- [x] 002 (settings sheet) and 003 (add-property sheet) both redesigned, recaptured and matched against their mapped reference — 002 LANDED+verified post-rebase at `8b213929` (goal 2/3: its against-reference half rides D-005); 003 LANDED+verified 2026-09-09, landed as `6a828e7e` (goal 3/3: the reference match is the lane's printed numbers — the family has no committed PNG and the reference harvests carry no pixel measurements, D-005; pitch 44.0/44.0, 21 rows, sheet top 238.4px ≥ note-header bottom 44.0px at the 336px keyboard inset); each leg's device path read red with the fix's styles.css (or its rules) stashed before it read green (002's settings-row grammar, 003's pitch/padding/scroll), so the parent figure moves 1/4 → 2/4; each packet's own device read stays the operator's (D3, no agent ticks it)
- [x] 004, 005 and 006 (view-config, filter/sort/group, record/menu) each redesigned, recaptured and matched against their mapped reference — 004 LANDED+verified 2026-09-09, landed as `f72e50cd` on the 071/002/003-merged main (goal 3/3: the reference match is the lane's printed numbers — 13/13 direction, 6/6 plain-row pitches 48.0px inside the 44–52 band, 18/18 divider-owing rows, 16px insets, 0 native selects, the 5-part negative control red→green; the reference-mapping half rides D-005, the device read stays the operator's, D3; the merged-stylesheet overflow check measures 002's extent-minus-border, 389 == 389, after the border-subtle token's #333333 definition-site fallback made the sheet's own 1px left border resolve); 006 (record + menu) LANDED+verified 2026-09-09, replayed as `a10c11ac` onto the 066+0.0.34+004-merged main (goal 2/2: 21/21 record property rows 61.0px → 44.0px border-box, one shared 16px surface inset, 1/1 section headings 16.0px/1px behind a 1px border-subtle divider, 20/20 hairlines, 0 native selects, extent 401 ≤ 401; the menu-card half ships no stylesheet and re-proves the 061/067 rulings where the record family mounts its menus — 4/4 record pairs 44.0px; the reference-mapping half rides D-005, the device read stays the operator's, D3; gate 27/0); 005 (filter/sort/group) LANDED+verified 2026-09-09, the leg's single commit `9df04459` (two GLM runs + Sonnet) replayed onto the 004+006-merged main as `4c00bf798` (goal: the three toolbar sheets' rows on the Notion row grammar — filter 3/3 rows 48px, sort 2/2 rows 48px, group 17/17 rows 44px, every row inside the 44–52px window, one 16px inset, 0 native selects, extent 374 == 374 on both engines; the group popover's 370>366px WebKit overflow closed by hiding the family's desktop-style scrollbar (the §30 inline floors 140/140/120 already yield to min-width:0 on the sheet), and its never-firing `:first-of-type` heading-divider exception rewritten to sibling position (`X ~ X`); both halves proved red before green by the lane's own clauses — the overflow sweep 370>366 → 374 ≤ 374, the divider clause wired through the previously-unused `dividerOk` check; vitest 1747/1747, sheet-rebuild 0 (the `85ff504` freeze regression), placement 413/415 (2 declared), evidence 15/15 fresh, gate 27/0, validate RESULT: PASSED; the reference-mapping half rides D-005, the device read stays the operator's, D3)
- [ ] No prior sheet fix (054, 058, 045, 067) regresses as a result of any redesign in this packet
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened, six child phases scaffolded | Done | This scaffold, 2026-09-08 |
| 001-sheet-story-coverage-audit | Done | Landed `31f712c3`/`16547b92`; `001/inventory.md` 86-row coverage table |
| 002-settings-sheet | LANDED, landing-verified | `f0ffadc7`+`70ee0b95` rebased+landed as `5aa0ffd4`+`8b213929` on `origin/main`; continuation verification: gate 27/0, evidence re-derived, goal 2/3 (D-005) |
| 003-add-property-sheet | LANDED, landing-verified | `3f1fe088` rebased onto `1624041e` and landed as `6a828e7e`; continuation verification: goal 3/3, screenshots ×2 616/616 (29 movers, 2 content, all moved in both runs → kept), evidence 15/15 fresh, css-lane released at `f3feddd7c055`, gate and scans recorded in the 005 handover |
| 004-view-config-sheet | LANDED, landing-verified | `c820d688` rebased onto `2d9af89c` (071/002, 066 wave-2, 071/003, 0.0.34) and landed as `f72e50cd`; continuation verification: goal 3/3, screenshots ×3 616/616 (6+1 content movers, every one moved in both sampled runs → kept), evidence 15/15 fresh, css-lane released at `92ad633b2666`, gate 27/0 after the sheet-grammar extent-true (002's resolving 1px sheet border), scans 0 — recorded in the 005 handover |
| 005-filter-sort-group-sheets, 006-record-and-menu-sheets | Not started | — |

### Deviations and findings

| Item | Note |
|------|------|
| Combined into one phase parent | Both phase-qualification thresholds (architectural cross-cutting change across every sheet family, plus file/LOC scores) are met independently, per `recommend-level.sh --loc 1200 --files 25 --architectural`; one coordinated packet avoids re-litigating the audit per sheet family |
<!-- /ANCHOR:log -->
