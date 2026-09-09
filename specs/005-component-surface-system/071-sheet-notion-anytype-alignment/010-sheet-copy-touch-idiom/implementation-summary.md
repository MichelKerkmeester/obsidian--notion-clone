---
title: "Implementation Summary: Sheet Copy, Touch Idiom"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/010-sheet-copy-touch-idiom"
    last_updated_at: "2026-09-09T22:20:00Z"
    last_updated_by: "implement-010-sheet-copy-touch-idiom"
    recent_action: "Landed the copy; gesture count 0/237; one spelling, one property word; gate 28/0"
    next_safe_action: "Execute 008/tasks.md; add the missing filter-empty scenario"
    blockers: []
    key_files:
      - "src/i18n.ts"
      - "src/i18n.test.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "010-sheet-copy-touch-idiom-implementation"
      parent_session_id: null
    completion_pct: 71
    open_questions: []
    answered_questions:
      - "Property or Field? — D5: Property, the packet's recorded default; unit-held against filter.field"
---
<!-- SPECKIT_TEMPLATE_SOURCE: implementation-summary | v2.2 -->

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 010-sheet-copy-touch-idiom |
| **Status** | Implemented — 2026-09-10, awaiting the operator's device read |
| **Completed** | 2026-09-10 |
| **Level** | 3 |
| **Worktree** | `worktrees/273-sheet-copy-idiom` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Every string a phone sheet renders now describes something the phone can do: the four
sheet-reachable strings that named click, double-click or hover say tap (and 轻点) instead —
`panel.emptyFilters`, `panel.emptySorts`, `panel.doubleClickEdit`, `viewConfig.computedSync.manualHint`,
button names kept, the spatial "below" dropped — and the count is held at zero by a clause, not by
an inspection. The dictionary's ellipsis is spelled one way (U+2026, 23/23 in all three
dictionaries), and the property the sheets' controls label is one word: `panel.field` =
Property/属性/屬性, the packet's recorded default (D5), unit-held equal to `filter.field`. All of
it rides one 52-line change in `src/i18n.ts`, because this packet touches a dictionary and no
layout.

| File | Change |
|------|--------|
| `src/i18n.ts` | 52 lines: the four gesture keys × three locales; `viewConfig.computedSync.manualDesc`'s two zh rows (the clause's own discovery — EN gestureless, zh kept 点击/點擊); `panel.field` in three locales; 35 ellipsis values (13 EN + 11 + 11) |
| `tools/live/sheet-grammar.mjs` | The sheet-copy clause: a Node-side derivation of the sheet-reachable key set (every dotted identifier the four producers reference by name — 237 keys) plus an in-bundle probe that reads every key through the shipped `t()`/`setLocale` in all three locales. Two predicates: 0 gesture rows anywhere, and no locale keeping a gesture its English dropped |
| `src/i18n.test.ts` | New file (the spec's Files-to-Change named it; it did not yet exist). One-ellipsis-per-dictionary with a key-count guard, the gesture-parity rule over the keys that lost one, and the one-word property label — reading the source in the key-coverage suite's idiom, because the dictionaries are private and the property they hold lives in the source text |

Out of scope, verified untouched: the seven named cell/desktop gesture strings are byte-identical
(`git diff src/i18n.ts` names none of them; the twelfth, `cell.doubleClickEdit`, also untouched).
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first, in the gate's own lane. Before the dictionary changed, the clause measured **14 gesture
rows + 2 locale-parity rows, and the failing set named exactly the four keys and none of the
seven**; the sheet-reachable key set is derived at run time from the producers, so the clause
cannot drift from the producers, and the probe reads the shipped `t()` lookup rather than the
source text — the lane measures what a phone sheet actually renders, in all three locales. After
the dictionary change: 0 of 237 keys matches a gesture in any locale, 0 parity rows, 2349 PASS /
0 FAIL, exit 0.

The unit clauses were proved the same way: one ASCII ellipsis reintroduced in `menu.changeType` →
exactly 1 clause fails (11 total, 1 failed | 10 passed); restored → 11/11. The one-word clause
added after (12/12; 1598/1598 with the full suite).

The one shared-string call, recorded rather than silent: `panel.doubleClickEdit` is also the
column-manager name row's title on the desktop, and one string now says *tap*; the row's own
`dblclick` fires from a double-tap in the mobile webview and a double-click on the desktop, so the
sheet is satisfied exactly while the desktop keeps a working instruction — the key-split the spec's
edge-case rule would demand costs a platform seam this packet does not have.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Decisions

| ID | Decision |
|----|----------|
| D5 (goal.md) | The sheet-facing property label reads **Property** — the packet's §12 default, taken because no operator ruling had been made. It is the same word as `filter.field` in every locale, and the same word `panel.addColumn` ("Add property" / 添加属性 / 新增屬性) and `panel.searchProperties` ("Search properties" / 搜索属性 / 搜尋屬性) already use. Held by a unit clause; the divergence goes red the next time the two keys disagree |
| The settled ellipsis | U+2026 — the spelling T007's proof reintroduces *from*, so the 13+11+11 ASCII values (35) moved to it across all three dictionaries |
| 轻点两下, not 双击 | 双击/雙擊 count as gestures in the clause's pattern, and 轻点两下 is the touch-true double-tap; the clause's patterns deliberately distinguish pointer words (click, 双击) from touch words (tap, 轻点) — dragging stays out, it is a touch gesture |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | 0 |
| `npx vitest run` | 0 — 1598/1598, 158 files |
| `npm run build` | 0 |
| `node tools/live/sheet-grammar.mjs` | 0 — 2349 PASS / 0 FAIL; clause GREEN 0 of 237 keys, 0 parity rows |
| `node tools/live/render-assertions.mjs` | 0 |
| `node tools/storybook/verify-placement.mjs` | 0 — 418/420, 2 declared |
| `npm run screenshots </dev/null` ×2 | 0/480 both runs; 8 two-run movers kept, 2 jitters restored; `screenshots:verify` 0 |
| `node tools/live/capture-device-parity.mjs` | 0 |
| `node tools/live/evidence.mjs --check-all` | 0 — 16/16 fresh |
| `node tools/naming/scan-comments.mjs` / `scan-failing-values.mjs` | 0 / 0 |
| `npm run gate` | 28 green, 0 red — run once, from the final state |
| `orchestrator.js --strict` | `RESULT: PASSED` — this packet, the 071 parent (first RESULT), the 005 track |

**The captures.** 8 of 480 moved, every one in both sampled runs (kept): the four
`constructed-sort-panel-calendar-*` shots — the sort empty state, its whole change inside one
518×23px hint band (the rewritten sentence) — and the four `constructed-view-config-*` shots, a
12–14×4px word box (the `Custom property…` ellipsis). Two one-run jitters (1–4px, max channel
delta 1, `board-subtask-tree-desktop-dark`, `board-view-desktop-dark`) restored, their manifest
bytes with them. The deltas were localised, not assumed: the bounding box of every changed pixel
puts each mover's change inside one text line or one word — no layout displacement anywhere.

**What the copy cannot do.** The label change (`panel.field`) paints nothing: all three consumers
pass `hideLabel: true`, so the 12–14×4px mover is the `Custom property…` ellipsis, not the label —
the dictionary and the unit clause, not a capture, hold it.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Limitations

- **AC-008** — the operator's own device read (D3). Until it, the packet is **landed, awaiting
  device**; nothing here is operator-confirmed.
- **The filter's empty state has no image.** No scenario in the capture corpus mounts it
  (`constructed-filter-panel` mounts conditions), so its before/after is the lane's printed
  `t()` values. Adding the scenario is outside this packet's frozen Files-to-Change. The next
  natural owner is 008's leg, whose surface it is.
- **Two sources lists are blind** — `constructed-sort-panel-calendar-*` and
  `constructed-view-config-*` paint i18n strings without naming `src/i18n.ts` in their `sources`,
  so the freshness check could never have flagged them; the twice-capture + pixel-delta ritual
  caught these. Adjacent to this packet's frozen Files-to-Change; recorded in goal.md.
- `settings.debugSheetTrace.desc` (zh-CN/zh-TW) keeps 点击/點擊 while its EN never had a gesture —
  outside the sheet-reached set (producer: the settings tab), recorded, untouched.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:continuation -->
## Continuation

Next in the ruling's order: `008/tasks.md` (the filter sheet's row model). Its leg touches the
filter sheet, which is where the missing filter-empty capture scenario belongs. The device read
closes this packet and, with its siblings, the ruling's D3. Validation record: 2026-09-10,
`orchestrator.js` --strict on this packet, on the 071 parent (first RESULT) and on the 005 track,
after the scoped graph-metadata backfill of each — the commit sha lives in the 005 handover, not
here; this file was written before it existed.
<!-- /ANCHOR:continuation -->
