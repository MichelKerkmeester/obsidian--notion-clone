---
title: "Implementation Plan: Notion Board Refinement"
description: "How the board's group-management panel is built once the operator adopts it, how the eight declines and four errata are filed before then, and what proves each one."
trigger_phrases:
  - "059 plan"
  - "board groups panel plan"
  - "notion board refinement plan"
  - "showGroup wiring plan"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Notion Board Refinement

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, an Obsidian plugin; no build framework beyond `esbuild` |
| **Framework** | None. DOM built imperatively through Obsidian's `createDiv`/`createEl` helpers |
| **Storage** | The vault's `data.json` view config, read and written through `src/data/data-source.ts`'s key allowlist |
| **Testing** | `vitest` for units; `tools/live/*.mjs` for live-DOM assertions; `tools/screenshots/` for captures; `npm run gate` runs the lanes |

### Overview
Two halves that do not overlap. The **paper half** — the eight declines, the four errata, the four
device-only checks — needs no source file and runs today; it is what goes to the operator. The
**code half** is one new `panel`-role surface, a `showGroup` member on `BoardRendererActions`
implemented by both hosts, and one `boardHideEmptyGroups` flag defaulted off; it does not start
until the operator answers ADR-004, ADR-010 and ADR-011 (`goal.md` D6). The research's own P0 is in
neither half: `dc1d54a9` landed it, so T001 re-reads that landing instead of repeating it
(`goal.md` D7).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] The reds in `acceptance-criteria.md` are observed on the tree, not asserted — T002.
- [ ] ADR-004, ADR-010 and ADR-011 are in front of the operator with both readings each — T003.
- [ ] `src/views/board-renderer.ts` is released by `058`.

### Definition of Done
- [ ] Every acceptance criterion Met, Waived with an ADR, or Superseded with one.
- [ ] `npm run gate` exit 0 read from `$?`, at its current lane count — **0** lanes added (D4).
- [ ] `tools/live/sheet-grammar.mjs` still 12 surfaces and 31 stacked pairs (D5).
- [ ] `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md` and `decision-record.md` agree with
      each other and with the tree.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
The plugin's existing renderer-plus-actions split. `BoardRenderer` builds DOM and calls out through
`BoardRendererActions`; the two hosts — `DatabaseView` and `EmbeddedDatabaseRenderer` — supply the
implementations. This packet's whole architectural content is that **the contract already has two
members no host implements**, so the fix is a wiring change plus one surface, not a new subsystem.

### Key Components
- **`src/views/board-groups-panel.ts` (new)**: builds the Groups panel's rows from `groupField`'s
  options plus any key present in `config.boardHiddenGroups` that the schema no longer carries. One
  row per group: a visibility toggle, a drag handle, the option's own label and colour. Bulk
  hide-all / show-all, a "Hide empty groups" toggle, and "Remove grouping". It owns no persistence
  of its own — every commit goes through the callbacks the host already has.
- **`src/views/record-surface/property-row.ts` `buildCheckboxPropertyRow` (`:353`)**: the shared row
  builder. It already carries the drag handle, the drop-target class, the touch move-up/move-down
  controls and the checkbox, which is why the panel reuses it rather than writing a second drag
  vocabulary — `src/views/board-card-properties-panel.ts:48-125` is the working example to copy.
- **`BoardRendererActions` (`src/views/board-renderer.ts:77-132`)**: gains `showGroup`. `hideGroup`
  and `deleteGroup` are decided by ADR-011 — wired, or deleted with their guards and their i18n
  keys. Leaving them declared and unimplemented is the state this packet exists to end.
- **`src/data/types.ts` / `src/data/data-source.ts`**: `boardHideEmptyGroups` beside
  `boardHiddenGroups` (`types.ts:560`), added to the view-config key allowlist
  (`data-source.ts:1352`) so a vault's `data.json` round-trips it and cannot introduce an unlisted
  board flag.

### Data Flow
Column menu (`renderBoardGroupOptions`, `board-renderer.ts:540-560`) → new "Manage groups" row →
`board-groups-panel.ts` opens in the `panel` role, anchored locally on desktop and presented through
`044`'s sheet grammar on phone → a toggle calls `hideGroup`/`showGroup`, a drag calls
`updateGroupOrder` (`:83`) → the host writes `config.boardHiddenGroups` / `config.groupOrders` and
schedules the config save → the board re-renders and the filter at `board-renderer.ts:192-193`
reads the new set. No new read path, no new persistence mechanism, no query.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

This packet is partly a fix — two declared actions no producer implements — so the inventory is
required rather than optional.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `src/views/board-renderer.ts:84-85` | Declares `hideGroup?` and `deleteGroup?` on the actions contract | Update: add `showGroup`; resolve the two dead members per ADR-011 | `grep -rn "hideGroup\|showGroup\|deleteGroup" src/` shows an implementation per declaration, in both hosts |
| `src/views/board-renderer.ts:558-559` | Two menu rows guarded on those members, so they never build | Update: the guards become live, or the rows go with the members | A renderer test asserting the column menu's row count moves from **3** to its post-ADR figure |
| `src/views/database-view.ts:791-830` | The host actions object — the producer that is missing | Update: supply `showGroup` and the ADR-011 outcome | `database-view.test.ts`'s `boardRenderer.actions` fixture asserts the member exists |
| `src/views/embedded-database-renderer.ts:532-563` | The second host, same gap, plus no `createGroup` | Update: same members; `createGroup` stays out of scope and is named, not fixed | `embedded-database-renderer.test.ts`'s same fixture |
| `src/data/data-source.ts:1352` | The view-config key allowlist — the persistence boundary | Update: one key added | A parse test proving an unlisted board flag is still dropped, the property `056` AC-005 locks for `boardExtensionsEnabled` |
| `src/views/board-renderer.ts:192-193` | The hidden-group filter — the only consumer of `boardHiddenGroups` | Unchanged in shape; gains the empty-group filter beside it | The default-config render still shows every group, and the empty-column card still builds (`:324-327`) |
| `src/views/database-view.ts:3119-3287` | The toolbar's group-order popover — order without visibility | Not a consumer. It keeps its own job; the panel does not replace it | A zero-line diff on that method |
| `tools/live/render-assertions.mjs`, `screenshots/manifest.json` | The lanes that would catch a regression | Update: two rows and four captures | Negative control observed red before the rows are trusted |
| `../056-board-anytype-parity/notion-screens-digest.md`, `../056-board-anytype-parity/acceptance-criteria.md` | The record the errata correct | Update: E-1, E-2, E-4, E-5 notes; four device items on AC-010 | Each note re-read against the tree at the moment it is written |

Required inventories, run before the code half starts:

- Same-class producers: `rg -n "hideGroup|showGroup|deleteGroup|boardHiddenGroups" src/`.
- Consumers of changed symbols: `rg -n "BoardRendererActions|boardHiddenGroups|boardHideEmptyGroups" . --glob '*.ts' --glob '*.mjs' --glob '*.md'`.
- Matrix axes: {desktop, phone} × {light, dark} × {group visible, group hidden, group key with no
  schema option} — the third column is the one NFR-R02 exists for.
- Invariant: a group key that reaches the panel is always listable and always restorable. A key the
  schema no longer carries must render as unknown-and-restorable, never be silently dropped —
  dropping it is what makes a hide irreversible.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase
checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | The panel's row model: every option listed, hidden keys included, an orphan key listed as unknown-and-restorable, toggle and reorder callbacks fired with the right arguments | `vitest`, beside `board-card-properties-panel.test.ts` |
| Unit | Both hosts supply `showGroup` and the ADR-011 outcome; the persisted key allowlist still drops an unlisted board flag | `vitest`, `database-view.test.ts`, `embedded-database-renderer.test.ts`, `data-source.test.ts` |
| Integration | The column menu's row count, and the panel opening from it at the declared role and width | `tools/live/render-assertions.mjs`, with a negative control read red first |
| Integration | The phone presentation still leaves 12 surfaces and 31 stacked pairs green | `tools/live/sheet-grammar.mjs`, exit read from `$?` |
| Manual | The operator's own read on iOS and on desktop | The device, which is the only thing that closes the last criterion |

**Coverage floor, and the ceiling above it.** Happy path plus one edge case per public surface. The
edge case that earns its own test is the orphan group key (NFR-R02) — no current test covers a
`boardHiddenGroups` entry with no matching option, and it is exactly the state that makes a hide
irreversible. No test is added per branch, and none re-asserts the framework.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The operator's answer to ADR-004 / ADR-010 / ADR-011 | External | **Red** — asked, unanswered | The whole code half. T001-T003 are unaffected |
| `058-card-title-and-title-formats` holding `src/views/board-renderer.ts` | Internal | Yellow — `058` is opened, not started | The code half queues; the paper half does not |
| `056` T014-T016 holding the same file | Internal | **Green** — landed at `dc1d54a9` | None. Released |
| The serialized `styles.css` lane (`parent` D11) | Internal | Yellow — acquired per leg | The panel's treatment waits for the lane, not for a rewrite |
| `044` sheet grammar / `048` stacking | Internal | Green | A phone presentation that breaks either fails D5 rather than shipping |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the panel regresses the board's own lanes, or the operator reads it as a fourth place
  to hunt for a setting rather than an improvement.
- **Procedure**: `git revert` the panel commit. The surface is additive — one new file, one member
  on an interface, one defaulted-off flag — so reverting restores exactly the pre-packet board. The
  errata and the ADRs are documentation and are not reverted with it; they stay true either way.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 verification ──┐
T002 red-first ─────┼──► T003 ADR pack ──► OPERATOR GATE ──► T004-T007 code ──► T008-T010 verify
errata (T002b) ─────┘
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup (T001-T003) | Nothing. No source file, no lane | The operator gate |
| Operator gate | T003 | Every code task |
| Core (T004-T007) | The gate, and `058` releasing `board-renderer.ts` | Verification |
| Verification (T008-T010) | Core | The operator's device read |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup — verification, errata, red-first, the ADR pack | Low | 2-3 hours, no source file touched |
| Core Implementation — the panel, the wiring, the flag, the strings, the treatment | Medium | 6-9 hours, one `styles.css` lane acquisition |
| Verification — captures, assertion rows with a negative control, the gate | Medium | 2-4 hours |
| **Total** | | **10-16 hours**, spread across an operator gate that may hold it indefinitely |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] No feature flag. `056` D6 forbids shipping an affordance default-off, so the panel ships on or
      not at all — which is why the operator gate is a real gate and not a formality.
- [ ] `screenshots/manifest.json` entries added in the same commit as the captures they describe.
- [ ] The `styles.css` lane released with a recapture a person looked at (parent D11).

### Rollback Procedure
1. `git revert` the panel commit.
2. `node tools/screenshots/verify.mjs` and `npm run gate`, both exit statuses read from `$?`.
3. Confirm the column menu returns to its pre-packet row count and the board renders unchanged.
4. Tell the operator, because the surface was theirs to adopt.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: `boardHideEmptyGroups` is additive and defaults `false`; an older build
  drops it through the same allowlist that added it, and `boardHiddenGroups` keeps whatever the
  panel wrote. A reverted build shows every group again, which is the safe direction.
<!-- /ANCHOR:enhanced-rollback -->

---
