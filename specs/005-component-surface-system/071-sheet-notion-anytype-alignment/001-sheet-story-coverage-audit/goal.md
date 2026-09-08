---
title: "Goal: Sheet Story Coverage Audit"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "001-sheet-story-coverage-audit goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit"
    last_updated_at: "2026-09-08T10:20:00Z"
    last_updated_by: "235-implementation"
    recent_action: "Produced the 86-row coverage inventory; every completion criterion evidenced"
    next_safe_action: "Run the next 071 child; read its row in 001:s inventory.md first"
    blockers: []
    key_files:
      - "inventory.md"
      - "tools/storybook/sheet-inventory.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "001-sheet-story-coverage-audit-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Story Coverage Audit

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** One inventory table names every sheet/panel/popover the app can open, its story/screenshot coverage state, and its Notion/Anytype reference mapping.

### Decisions

| ID | Decision |
|----|----------|
| D1 | No later phase may claim coverage without a row here naming it |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Inventory table produced, naming every sheet-capable surface — 86 rows (54 primary + 32 stacked): the 17+11+32 grammar-registry surfaces, 18 unfolded modal producers plus the anonymous trash-restore modal, the three suggest modals, the four view-toolbar option popovers, toast, column menu, bulk-edit menu, with the settings sheet and the add-property/property-type picker sheet as rows 1-2
- [x] Every row names a coverage state and a reference mapping (or its absence) — no blank cells; 46 rows record "none" on both reference sides and 18 primary rows record "none" captures, all by name
- [x] Same-session coverage gaps closed — the coverage gate reports 0 missing, 0 stale, 0 unreasoned (exit 0), so no story or allowlist fix fired; every absence the inventory found (18 primary rows without captures, 46 without references) is recorded by a row, and the count test pins the census at 40 = 19 + 21
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| LANDED on `origin/main` | Done | Leg `16547b92` (GLM) rebased onto `90e60d00` → `527e8455`, plus the verifier's reconciliation `31f712c3` (`90e60d00..31f712c3`); 86-row inventory (54 primary + 32 stacked) regenerated post-rebase with 0 diff; 9-test count suite mutation-proven (9/9); gate 27 green, 0 red; `validate --strict` PASSED for 001, 071 and 005 |

### Deviations and findings

| Item | Note |
|------|------|
| The freshness test earned its keep | Went RED after the rebase because 070's landing shifted `toolbar-renderer.ts`, moving 3 cited producer lines :201→:202 (add-view, toolbar-utilities, toolbar-tab-menu); regenerated with unchanged counts |
| Screenshots judged by decoded pixel delta, not pixelHash | 5 PNGs kept REAL (one-px movers present in both delta runs), 4 jitter movers (Δ1, one run only) restored with their manifest `bytes` patched back |
| One evidence artefact was stale | `capture-device-parity.json`'s recorded manifest-hash input; re-run by its own tool (146 differing / 0 identical vs baseline 4, PASS) |
<!-- /ANCHOR:log -->
