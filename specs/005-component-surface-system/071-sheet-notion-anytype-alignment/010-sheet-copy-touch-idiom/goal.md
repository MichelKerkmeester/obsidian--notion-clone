---
title: "Goal: Sheet Copy: Touch Idiom"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "010-sheet-copy-touch-idiom goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/010-sheet-copy-touch-idiom"
    last_updated_at: "2026-09-09T22:15:00Z"
    last_updated_by: "implement-010-sheet-copy-touch-idiom"
    recent_action: "Landed the copy: gesture count 0/237, one spelling, one property word; gate 28/0"
    next_safe_action: "Operator device re-read (D3); every 071 child (008-014) has now landed"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-notion-audit.md"
      - "src/i18n.ts"
      - "src/i18n.test.ts"
      - "src/views/filter-panel-renderer.ts"
      - "src/views/sort-panel-renderer.ts"
      - "src/views/column-manager-renderer.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "010-sheet-copy-touch-idiom-scaffold"
      parent_session_id: null
    completion_pct: 71
    open_questions: []
    answered_questions:
      - "Does the operator want the sheet-facing property label to read 'Property' everywhere, or is 'Field' retained? — Answered by the packet's recorded default (D5, 2026-09-10): Property, the same word as filter.field in every locale, matching Notion and our own panel.addColumn and panel.searchProperties. No operator ruling was taken; the default is the decision, held by a unit clause"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Copy: Touch Idiom

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** No string that reaches a phone sheet instructs a pointer gesture, the dictionary spells its ellipsis one way, and the sheet-facing label for a property is one word — closing the audit's §3.16 finding that four sheet-reachable strings tell a phone user to click or double-click.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The scope is strings that reach a **phone sheet renderer**, grep-confirmed. The seven further pointer-gesture strings that belong to cells and the desktop table are explicitly out of scope and must not be touched |
| D2 | Every count in this packet is ours, from `src/i18n.ts` counted directly. No Notion asset supplies a number, and none could — every Notion iOS capture here is 299x678 |
| D3 | Non-English dictionaries are updated in the same change; a key whose English loses "double-click" must not keep it in zh-CN or zh-TW |
| D4 | Only the operator's own device recheck may close the alignment judgement; no agent ticks the device row |
| D5 | The sheet-facing property label reads **Property** — the packet's §12 default, taken because no operator ruling had been made. It is the same word as `filter.field` in every locale, and the same word `panel.addColumn` ("Add property" / 添加属性 / 新增屬性) and `panel.searchProperties` ("Search properties" / 搜索属性 / 搜尋屬性) already use. Held by a unit clause; the divergence goes red the next time the two keys disagree |

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
- [x] 0 strings that reach a phone sheet renderer name a pointer gesture (today: 4), asserted by a lane or unit clause — 0 of 237 derived sheet-reachable keys matches in any of the three locales; the clause went red before green (14 gesture rows + 2 parity rows, the failing set exactly the four keys, none of the seven) and the unit clauses in `src/i18n.test.ts` hold the dictionary beneath it
- [x] The EN dictionary spells its ellipsis one way (today: 13 ASCII `...` and 10 U+2026 `…`) — settled on U+2026, 23/23/23 across all three dictionaries, 0 ASCII; unit clause proved red-then-green by reintroducing one ASCII ellipsis (1 failed → 11/11)
- [x] The sheet-facing property label is one word across the filter and sort sheets — `panel.field` = Property/属性/屬性 = `filter.field`, unit-held (goal D5 records the default)
- [x] The three locales agree: no key loses a pointer gesture in EN and keeps it in zh-CN or zh-TW — the lane's parity clause and the unit clause both read 0; two further rows outside this packet's changed set (`settings.debugSheetTrace.desc` zh-CN/zh-TW) keep a gesture their EN never had; recorded, untouched
- [ ] Recaptured phone-only light and dark for the two empty states that change — the **sort** half is proven: `constructed-sort-panel-calendar-*` moved in both sampled runs, the whole change inside its 518×23px hint band. The **filter** empty state has no scenario in the capture corpus (`constructed-filter-panel` mounts conditions), so no before/after image can exist for it; the lane's printed `t()` values are its evidence. Adding that scenario is outside this packet's frozen Files-to-Change — recorded, strand open
- [ ] Operator's own device re-read reports the copy correct (no agent ticks this row)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-09, worktree `worktrees/272-sheet-notion-audit` |
| Reference inventory | Done | `../sheet-notion-audit.md` §3.16. Notion supplies no counter-example to cite here, only the absence: no Notion iOS capture in the harvest names a pointer gesture. That absence is structural and survives 299x678 |
| Current-state measurement | Done | `src/i18n.ts` EN block (lines 23-1840) counted directly: 4 pointer-gesture strings reach a sheet renderer, 13 ASCII `...` against 10 U+2026 `…`, and `panel.field`="Field" beside `filter.field`="Property" |
| Producer confirmation | Done | Each of the four keys grep-traced to its renderer: `panel.emptyFilters`→`filter-panel-renderer.ts`, `panel.emptySorts`→`sort-panel-renderer.ts`, `panel.doubleClickEdit`→`column-manager-renderer.ts:383`, `viewConfig.computedSync.manualHint`→`view-config-panel-renderer.ts` |
| Gap table | Done | `spec.md` §13 |
| Implementation | Done 2026-09-10 | This leg (worktree `273-sheet-copy-idiom`): 52 lines in `src/i18n.ts`, the clause in `tools/live/sheet-grammar.mjs`, `src/i18n.test.ts` created. RED 14 gesture rows + 2 parity → GREEN 0/0; vitest 1598/1598; build 0; screenshots ×2 480/480 (8 two-run movers kept, 2 jitters restored); evidence 16/16; gate 28/0; scans 0. Full record: `implementation-summary.md` |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it. Until then the packet is **landed, awaiting device** |

### Deviations and findings

| Item | Note |
|------|------|
| The count is exactly four, and the boundary matters | Eleven EN strings name a pointer gesture. Seven belong to cells and the desktop table (`cell.doubleClickRename`, `cell.clickToEdit`, `cell.doubleClickEditFormula`, `cell.doubleClickConfigureRollup`, `formula.errorHint`, `timeline.clickToSetDates`, `modal.groupOrderHint`) and are **out of scope** — a desktop pointer gesture named in a desktop surface is correct copy, not a defect. Only the four that reach a sheet are in scope |
| This is the smallest and safest packet in the audit's set | It touches a dictionary and no layout, so it is ordered first for the implementation leg: it can land and be verified without interacting with any other packet's producer change |
| The parity clause surfaced rows beyond the four | `viewConfig.computedSync.manualDesc` (zh-CN/zh-TW) kept 点击/點擊 while its EN was gestureless — the clause found it at birth; its two zh values were fixed, EN untouched. Two further rows keep a gesture their EN never had but sit outside the sheet-reached set: `settings.debugSheetTrace.desc` (producer: the settings tab, not a sheet) — recorded, untouched, for the next count to reconcile |
| The goal's deviation note counted eleven gesture strings; there are twelve | `cell.doubleClickEdit` (a near-twin of `panel.doubleClickEdit`, also in `cell-renderer.ts`) is a twelfth. It is neither of the four nor of the seven named, lives in cell/desktop scope, and is untouched — recorded here so the next count reconciles rather than re-derives |
| The capture corpus cannot photograph the filter's empty state | `constructed-filter-panel` mounts conditions, so `panel.emptyFilters`' before/after has no image anywhere; the lane's printed `t()` values are the filter's evidence. The strand stays open for whoever adds the scenario. Adjacent, same blindness: the two movers (`constructed-sort-panel-calendar-*`, `constructed-view-config-*`) paint i18n strings without naming `src/i18n.ts` in their `sources`, so the freshness check could not have flagged them — they were caught by the twice-capture + pixel-delta ritual. Both sources lists are adjacent to this packet's frozen Files-to-Change |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. Where a Notion reading contradicts a landed decision, this packet records it as Proposed in `../sheet-notion-audit.md` §6 rather than resolving it |
<!-- /ANCHOR:log -->
