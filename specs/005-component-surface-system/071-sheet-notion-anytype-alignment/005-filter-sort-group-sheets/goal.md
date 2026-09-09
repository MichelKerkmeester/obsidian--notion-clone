---
title: "Goal: Filter, Sort and Group Sheets Redesign"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "005-filter-sort-group-sheets goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/005-filter-sort-group-sheets"
    last_updated_at: "2026-09-09T09:47:00Z"
    last_updated_by: "goal-refresh-0035"
    recent_action: "Reconciled goal.md ticks against the 79500b89 landing"
    next_safe_action: "Operator device recheck (071 D3)"
    blockers: []
    key_files:
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "005-filter-sort-group-sheets-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Filter, Sort and Group Sheets Redesign

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The filter, sort and group sheets match their mapped reference, and the freeze-prone history (roadmap rows 21-23) stays fixed.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This phase does not start until Phase 1 names these sheets' reference |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Phase 1's reference mapping read before redesign starts — `spec.md:120` onward quotes `001/inventory.md` rows 45 (filter-panel), 44 (sort-panel) and 133 (group panel)
- [x] Sheets redesigned and recaptured against their mapped reference — filter and sort's row grammar (single-column rows, 44-52px pitch, 16px inset) already converged in prior runs; this session closed the group popover's own overflow (desktop-style scrollbar shrinking the drag-handle row by 8px) and its missing first-section divider (`:first-of-type` tag census vs class-sibling `X ~ X`); `tools/live/sheet-grammar.mjs` PASS exit 0 for filter, sort and group; recapture 616/616 twice, 14 real movers (scrollbar-thumb removal), 2 encoder-jitter reverted; reference columns stay `TBD` (D-005, inherited — no third-party reference carries readable measurements)
- [x] Regression check against the freeze fix in 85ff504 passes — `tools/live/sheet-rebuild.mjs` PASS exit 0, every rebuilt sheet still has the bar it opened with
- [x] The sort sheet presents the flush frame — full width, bottom edge on the viewport, no gap — on the operator's 2026-09-09 report; `tools/live/sheet-grammar.mjs`'s frame-role clause RED (floating, 8/8/8px insets at 390px) → GREEN (flush, 0/0/0px) via the sort sheet's declared `heightRole: "flush"`; the operator's own device recheck stays open per the parent D3 decision (not ticked here)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Phase 1 mapping read | Done | `spec.md:120` quoting `001/inventory.md` rows 45/44/133 |
| Group popover fixed | Done | Scrollbar-hiding (overflow) + sibling-combinator divider fix in `styles.css`; `tools/live/sheet-grammar.mjs` group clauses red before, green after, exit 0 |
| Freeze regression | Done | `tools/live/sheet-rebuild.mjs` (85ff504 lane) PASS exit 0 |
| Captures + evidence + gate | Done | 616/616 ×2, 14 real movers judged and named in the css-lane release (baseline handoff from 072); evidence 15/15 fresh; gate 27/27, exit 0 |
| Docs + validation | Done | `acceptance-criteria.md` (3 × `Met`), `implementation-summary.md`, `decision-record.md`; landed on main at `79500b89` |

### Deviations and findings

| Item | Note |
|------|------|
| Diagnosis correction | The prior run's diagnosis blamed the same inline-floor/`min-width:0` conflict fixed for filter/sort's condition rows, but the group popover builds no condition rows — the real cause was the scrollbar-shrunk handle row, fixed at that shared seam instead |
| Reference measurements | `TBD`, inherited ruling (D-005): third-party captures carry no readable numbers |
| engine-parity nondeterminism | Re-running to refresh freshness surfaced a handful of additional, nondeterministic `panel-base-import-modal` checkbox-tint disagreements (opacity-transition artifact); unrelated to this phase's scope, not part of the 27-check gate |
| Operator device recheck | Stays open per the parent packet's D3 decision; not ticked here |
<!-- /ANCHOR:log -->
