---
title: "Tasks: Phase 10: sheet-copy-touch-idiom"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 10: sheet-copy-touch-idiom

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: Count and scope

- [x] T001 DONE 2026-09-10: §0 and §3.16 read; boundary confirmed — the four in-scope keys are each referenced by exactly one producer (`panel.emptyFilters`→`filter-panel-renderer.ts`, `panel.emptySorts`→`sort-panel-renderer.ts`, `panel.doubleClickEdit`→`column-manager-renderer.ts:383` (the property row's `nameEl.title`, the row's own `dblclick` listener), `viewConfig.computedSync.manualHint`→`view-config-panel-renderer.ts`); of the seven named out-of-scope strings, five live in `cell-renderer.ts` and `cell.doubleClickRename` also in `record-surface/record-header.ts`, while `timeline.clickToSetDates` and `modal.groupOrderHint` are referenced by no current producer (the archived-timeline/modal surfaces) — none of the seven appears in any of the four producers, and no other registered sheet producer references a gesture key. One further EN gesture string, `cell.doubleClickEdit` (a twelfth; the goal's deviation note counts eleven), likewise lives in `cell-renderer.ts` — cell/desktop scope, untouched
- [x] T002 DONE 2026-09-10: derivation is mechanical and lives inside the clause itself — every dotted identifier the four producers reference by name, extracted by the lane at run time (237 keys at GREEN), so the list cannot drift from the producers. There are exactly four `*-panel-renderer.ts` files, so the packet's named producers are the whole set; the derivation was cross-checked before the clause was written: exactly 4 gesture keys reachable, 0 extras, 0 of the seven referenced
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert the count

- [x] T003 DONE 2026-09-10: the clause lives in `tools/live/sheet-grammar.mjs` (probe through the shipped `t()`/`setLocale` inside the harness bundle — the lane measures what a phone sheet actually renders, in all three locales, not the source text — plus the Node-side derivation over the producers). RED, recorded: 14 gesture rows (the four keys × three locales, plus `viewConfig.computedSync.manualDesc`'s two zh rows, which the clause itself discovered — EN gestureless, zh keeps 点击/點擊) + 2 locale-parity rows; the failing set names exactly the four keys and none of the seven. Gesture patterns: EN `/click|hover/i`, zh `点击|點擊|单击|單擊|雙擊|双击|點選|懸停|悬停` — touch words (tap, 轻点) deliberately pass
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [x] T004 DONE 2026-09-10: all twelve strings rewritten — `panel.emptyFilters` "Tap \"Add condition\" to start filtering." / 轻点「添加条件」开始筛选。 / 輕點「新增條件」開始篩選。; `panel.emptySorts` likewise ("below" dropped in all three); `panel.doubleClickEdit` "Double-tap to edit" / 轻点两下编辑属性 / 輕點兩下編輯屬性 (双击/雙擊 count as gestures in the clause's pattern, and 轻点两下 is the touch-true double-tap); `viewConfig.computedSync.manualHint` keeps the button name, gesture gone ("…until you tap “Save formula results”" / 请轻点“保存计算结果” / 請輕點「儲存計算結果」). One shared-string note recorded, not silently: `panel.doubleClickEdit` is the column-manager name row's title on desktop too, and one string now says tap; the row's own `dblclick` fires from a double-tap in the mobile webview and a double-click on the desktop, so the sheet is satisfied exactly and the desktop keeps a working instruction — the key-split the spec's edge-case rule would demand costs a platform seam the packet does not have
- [x] T005 DONE 2026-09-10: the settled spelling is U+2026 (T007's red-then-green proof reintroduces an ASCII ellipsis, so U+2026 is the settled form); 13 EN + 11 zh-CN + 11 zh-TW values = 35 edits, 52 lines changed in `src/i18n.ts` in total. `npx vitest run` immediately afterwards: 1586/1586, exit 0 — no fixture compared the old strings, nothing to fix
- [x] T006 DONE 2026-09-10: no operator ruling was taken, so the packet's §12 own default applies and is recorded as the decision it is (goal.md D5; spec.md §12 answered): `panel.field` = "Property" / 属性 / 屬性 — the same word as `filter.field` in every locale, and the same word the dictionary already uses in `panel.addColumn` ("Add property" / 添加属性 / 新增屬性) and `panel.searchProperties` ("Search properties" / 搜索属性 / 搜尋屬性). Held by a unit clause: `panel.field` must resolve exactly as `filter.field` in all three locales, red the next time they diverge. The label is `hideLabel: true` on all three sheets — read by assistive tech, never painted — which is why no capture can show it and the dictionary must hold it
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Prove and close

- [x] T007 DONE 2026-09-10: GREEN — 0 of the 237 sheet-reachable keys matches a gesture in any locale, 0 parity rows, lane 2349 PASS / 0 FAIL, exit 0. The seven out-of-scope strings are byte-identical: `git diff src/i18n.ts` shows none of `cell.doubleClickRename`, `cell.clickToEdit`, `cell.doubleClickEditFormula`, `cell.doubleClickConfigureRollup`, `formula.errorHint`, `timeline.clickToSetDates`, `modal.groupOrderHint` (nor `cell.doubleClickEdit`). The unit clauses live in `src/i18n.test.ts` (the spec's Files-to-Change named it; it did not yet exist, so this leg created it, in the key-coverage suite's read-the-source idiom): one spelling per dictionary (0 ASCII, ≥1 U+2026, a key-count guard so a missed parse cannot pass vacuously), the gesture-parity rule over the keys that lost one, and the one-word property label. Red-then-green proven: one ASCII ellipsis reintroduced in `menu.changeType` → exactly 1 clause fails (11 total, 1 failed | 10 passed); restored → 11/11; the one-word clause added after, 12/12 in the final file
- [x] T008 DONE 2026-09-10: full battery from the final state, every exit read — `npx tsc --noEmit` 0; `npx vitest run` 0 (1598/1598, 158 files); `npm run build` 0; `node tools/live/render-assertions.mjs` 0; `node tools/live/sheet-grammar.mjs` 0 (2349 PASS / 0 FAIL); `node tools/storybook/verify-placement.mjs` 0 (418/420, 2 declared); `npm run screenshots </dev/null` ×2, both 0 (480/480; 8 two-run content movers kept — the sort empty state's 518×23px hint band on all four `constructed-sort-panel-calendar-*` shots and the 12–14×4px word box on all four `constructed-view-config-*`, i.e. the `Custom property…` ellipsis; 2 one-run 1–4px@Δ1 jitters restored, their manifest bytes restored; `screenshots:verify` 0, 480 current); `node tools/live/evidence.mjs --check-all` 0 after `capture-device-parity.mjs` 0 re-ran (16/16 fresh); `node tools/naming/scan-comments.mjs` 0, `scan-failing-values.mjs` 0; the gate once, from the final state: 28 green, 0 red. Recorded gap, named not silently absorbed: the corpus photographs the **sort** empty state (it moved, both runs) but no scenario mounts the **filter** empty state (`constructed-filter-panel` mounts conditions), so the filter's before/after is the lane's printed `t()` values, not an image — the capture strand stays open, a scenario's sources lists there (and on the two movers, which paint i18n strings without naming `i18n.ts` in `sources`) are adjacent, outside this packet's frozen Files-to-Change. Closing docs, validate, backfill and the 005 handover entry = this close
<!-- /ANCHOR:phase-4 -->
