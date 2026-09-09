---
title: "Acceptance Criteria: Sheet Copy: Touch Idiom"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "010-sheet-copy-touch-idiom acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Copy: Touch Idiom

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/010-sheet-copy-touch-idiom
**Level:** 3
**Status:** LANDED 2026-09-10 — awaiting the operator's device read (D3)
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per measured property, plus the operator's device row.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any target is written, Then every count is traceable to `src/i18n.ts` counted directly and none to a 299x678 Notion asset | `spec.md` §13's Target column | Met | - |
| AC-002 | REQ-002 | Given the four sheet-reachable strings, When the dictionary is swept, Then 0 strings reaching a phone sheet renderer name click, double-click or hover | Lane clause, RED→GREEN. RED: 14 gesture rows — the four keys × three locales, plus `viewConfig.computedSync.manualDesc`'s two zh rows the clause itself discovered (EN gestureless, zh keeps 点击/點擊) — plus 2 locale-parity rows; the failing set names exactly the four keys and none of the seven. GREEN: 0 of the 237 derived sheet-reachable keys matches in any locale, 0 parity rows, 2349 PASS / 0 FAIL, exit 0 | Met | - |
| AC-003 | REQ-003 | Given the seven cell and desktop-table pointer-gesture strings, When this phase closes, Then all seven are unchanged | `git diff` over `src/i18n.ts` — observed: none of the seven appears in the 104-line diff (nor does the twelfth, `cell.doubleClickEdit`) | Met | - |
| AC-004 | REQ-004 | Given the EN dictionary, When its ellipsis characters are counted, Then one spelling is used throughout | Unit clause RED→GREEN. Observed: the settled spelling is U+2026 — 23/23 in EN, 23/23 in zh-CN, 23/23 in zh-TW, 0 ASCII anywhere; reintroducing one ASCII ellipsis failed exactly 1 clause (11 total, 1 failed \| 10 passed), restored → 11/11 (12/12 in the final file with the one-word clause) | Met | - |
| AC-005 | REQ-005 | Given the filter and sort sheets, When their control labels are read, Then a property is called by one word | Unit clause: `panel.field` resolves exactly as `filter.field` in all three locales ("Property" / 属性 / 屬性), plus the three producer call sites (`sort-panel-renderer.ts:209`, `filter-panel-renderer.ts:555`, `view-config-panel-renderer.ts:1381`). The label is `hideLabel: true` — read by assistive tech, never painted — so no capture can show it; the capture that did move, `constructed-view-config-*`'s 12–14×4px box, is the `Custom property…` ellipsis, not this label | Met | - |
| AC-006 | REQ-006 | Given any key changed in EN, When zh-CN and zh-TW are read, Then neither retains a pointer gesture the EN string dropped | Dictionary read across all three locales + the lane's parity clause (0 rows) + the unit clause over the five gestureless keys. Observed: every key that changed in EN is gestureless in both zh dictionaries. Two further rows keep a gesture their EN never had — `settings.debugSheetTrace.desc` zh-CN/zh-TW keep 点击/點擊; that EN string did not change in this packet and its producer is the settings tab, not a sheet, so they sit outside this criterion — recorded, untouched | Met | - |
| AC-007 | REQ-007 | Given the two empty states that change, When recaptured phone-only light and dark, Then a before/after is recorded | Capture diff, `implementation-summary.md`. Observed so far: the **sort** empty state's half — `constructed-sort-panel-calendar-*` (phone and desktop, light and dark) moved in both sampled runs, the whole change inside one 518×23px hint band; the **filter** empty state has no scenario in the corpus (`constructed-filter-panel` mounts conditions), so its before/after is the lane's printed `t()` values, not an image. Half-proven; the criterion as written needs both | Unmet | - |
| AC-008 | SC-004 | Given the changed copy, When the operator re-reads the sheets on their own iPhone, Then they report the wording correct | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No — the implementation leg landed 2026-09-10. AC-001–AC-006 are Met on lane
and unit evidence: the gesture count is 0 of 237 sheet-reachable keys in all three locales, held
by the sheet-grammar clause (RED: 14 gesture rows + 2 parity rows, failing set exactly the four
keys) and by `src/i18n.test.ts`; the seven out-of-scope strings are byte-identical; one ellipsis
spelling, 23/23/23; the property label is one word. Two rows stay open: **AC-007** is half-proven
— the sort empty state's recapture moved in both sampled runs (518×23px hint band), but the
corpus has no scenario for the filter's empty state, so no before/after image can exist for it
until someone adds that scenario; **AC-008** is the operator's own device read (D3), which no
agent ticks. The 2026-09-09 22:30 ruling's “landed, awaiting device” state applies.
<!-- /ANCHOR:closure -->
