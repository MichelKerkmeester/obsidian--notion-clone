---
title: "Goal: View Config Sheet Redesign"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "004-view-config-sheet goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/004-view-config-sheet"
    last_updated_at: "2026-09-09T02:25:00Z"
    last_updated_by: "245-landing-verify"
    recent_action: "LANDED+verified (f72e50cd): goal 3/3, 071 2/4, gate 27/0, scans 0"
    next_safe_action: "Operator device recheck; then 005/006 reuse this row grammar"
    blockers: []
    key_files:
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "src/views/view-config-sheet-row-grammar.test.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "004-view-config-sheet-implementation"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Reference mapping: notion/ios/settings + notion/web/settings vs anytype/mobile/sheets + anytype/desktop/app (inventory row 42); disagreements resolved by 002's adopted inset-list grammar"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: View Config Sheet Redesign

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The view-config sheet (title field/format, column settings) matches its Phase-1-mapped reference.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This phase does not start until Phase 1 names this sheet's reference |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Phase 1's reference mapping read before redesign starts — inventory row 42, quoted in `plan.md` and cited throughout `spec.md` §4
- [x] View-config sheet redesigned and recaptured against its mapped reference — the reference row grammar (label left / control right, 44–52px pitch, inset hairlines, 16px insets, no native selects) went 6-failures red → green in the settings lane, and the recapture moved exactly the redesigned surface (6 content moves, twice, deterministic; `implementation-summary.md` → How It Was Delivered)
- [x] No regression on 058's or 045's controls — their producer markup untouched; `npx vitest run` 1729/1729, `render-assertions` / `touch-targets` / `verify-placement` / `sheet-grammar` all 0, `npm run gate` 27 green / 0 red
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| View-config redesign | Done | This leg, 2026-09-08: reference row grammar in `tools/live/sheet-grammar.mjs` red→green (13/13 direction, 6/6 pitch 48.0px, 18/18 hairlines, 16px insets, 0 native selects, no overflow), `styles.css` + `src/views/view-config-sheet-row-grammar.test.ts`, 6 recaptured content moves, gate 27/27, validated strict — see `implementation-summary.md` |

### Deviations and findings

| Item | Note |
|------|------|
| `engine-parity` exits 1 | Pre-existing, documented by 074's leg (50 differences then); now 82 fixtures / 43 differences, none in the view-config/board family — the 7 that left are disagreements this redesign's one-line rows no longer produce. Not a gate CHECK |
| css-lane takeover shares this leg's commit | The lane-README wants a commit of its own; the brief ordered one commit. Recorded in `decision-record.md` ADR-004; the acquire/edit/release triplet is separate history in `tools/lane/css-lane.json` |
| `../changelog/` still does not exist | 002 and 003 never created it; the spec's changelog-refresh instruction stays recorded as unmet in `implementation-summary.md` → Known Limitations |
<!-- /ANCHOR:log -->
