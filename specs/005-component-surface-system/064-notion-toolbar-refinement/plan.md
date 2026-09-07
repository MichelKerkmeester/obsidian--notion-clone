---
title: "Implementation Plan: Notion Toolbar Refinement"
description: "How the six measured reds close: one confirm consumed not built, one branch extended in front of an untouched builder, one flag meeting a gate that already exists, one rung added ahead of a ladder nobody reorders, one rail control, and one settle-or-waive — with the sweep lane that proves the collapse red first."
trigger_phrases:
  - "064 plan"
  - "notion toolbar refinement plan"
  - "delete confirm approach"
  - "collapse rung approach"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Notion Toolbar Refinement

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API, no framework |
| **Framework** | None — DOM built through Obsidian's `createDiv`/`createSpan`/`createEl` helpers |
| **Storage** | Mostly none. The only persisted candidate is REQ-006's, and it already exists — `boardHiddenGroups` (`types.ts:560`) — so even that leg mints no schema (D7) |
| **Testing** | Vitest (`src/views/toolbar-renderer.test.ts`), the headless-Chrome collapse sweep (`tools/live/run-toolbar-collapse-sweep.mjs`, the `toolbar-collapse` gate row at `tools/gate.mjs:80`), and the `sheet-grammar`/stacking lanes for the confirm's phone presentation |

### Overview
Six independent changes, ordered by what they owe. The confirm is not built at all — `051`'s
primitive is consumed at two call sites, which is the whole point of `053` D8. The filter panel's
zero-rule branch gains an entry tier in front of a builder this packet does not touch. The
searchable flag meets a gate that already lives inside the dropdown primitive, so the change is
the flag at three call sites. The collapse rung is one added step at the head of a ladder nobody
reorders. The chip rail gains one control per group, wired to actions that already exist. REQ-006
is settled rather than built: the axis exists, and the operator decides whose writer it gets.
Every leg's proof already has an instrument — the sweep, the grammar lanes, or the confirm idiom
`053`'s AC-105 blocks established.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented — `spec.md` §2, §3
- [x] Success criteria measurable — `spec.md` §5, each with a value observed at `80c2bb48`
- [x] Dependencies identified — the three Proposed ADRs, `062` ADR-003's inherited ruling, `053`'s open legs, the parent's CSS lane

### Definition of Done
- [ ] All acceptance criteria met, waived or superseded — `acceptance-criteria.md`
- [ ] `npx tsc --noEmit`, `npm run build` and `npx vitest run` all exit 0, each output read
- [ ] `npm run gate` exits 0 with the `toolbar-collapse` row green, having been observed red in T001
- [ ] Every capture whose picture moved re-taken, opened and read, before the CSS lane releases
- [ ] Docs synchronized: `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md`
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
One primitive per surface, callers configuring it — the shape `053` established. Nothing here adds
a second producer for anything that already has one: the confirm is consumed, the count gate is
already inside the dropdown primitive, the collapse ladder is extended not replaced, and the
hidden-group axis already has exactly one persisted home.

### Key Components
- **`toolbar-renderer.ts`**: the row, the clusters, the hub, the tab menu, the collapse ladder and
  the group popover. REQ-001's two call sites (`:1180`, `:1330`), REQ-004's rung (the head of
  `applyToolbarChromeCollapse` at `:2561`, the `:2571` order, the `:2365` label) and — if ADR-007
  answers "here" — REQ-006's eye toggle in `renderGroupPopoverRow` (`:1869-1887`) all land here.
- **`filter-panel-renderer.ts`**: the panel's two states. The zero-rule branch (`:197-202`) gains
  the entry tier; the condition rows' dropdowns at `:494-501` and `:576-590` gain the flag. The
  landed builder (`:365-455`, depth-capped) is untouched.
- **`sort-panel-renderer.ts`**: the field dropdown at `:199-206` gains the flag. Nothing else.
- **`active-view-controls-renderer.ts`**: the chip rail. One add control per rule group in
  `render()` (`:60`), at the landed anatomy (`:103-121`, `:230-232`); the clear-all at `:150` stays
  the rail's only other button.
- **`confirm-sheet.ts`**: `051`'s confirm primitive. **Unchanged by this packet** — `buildConfirmSheetBody`
  (`:46`) is consumed, which is what `053` goal D8 bought.
- **`dropdown-field.ts`**: the search gate at `:228`. **Unchanged by this packet** — the gate
  already lives inside the primitive, and `063`'s `a952e5e7` combobox rule owns the desktop branch.
- **`styles.css`**: one class for the add control and one for the collapsed label, reusing the
  landed values — the 28px pitch (`:1821`) and the 11%/17% tints (`:1825`, `:1832`). No new number
  (D7).
- **`view-config-panel-renderer.ts`**: the view-settings panel. REQ-009 adds a fourth summary row
  to `renderAppliedSummaries` (`:510-518`) and an explainer in the panel's own `hintClass()` idiom
  (`:569`, `:1688`); the existing `renderConditionalFormatting` section (`:747`, mounted in the
  view half at `:405`) is opened, never duplicated. It is also the `searchable` precedent
  (`:1558`).
- **`tools/live/toolbar-collapse-sweep.ts` + `run-toolbar-collapse-sweep.mjs`**: the existing lane,
  extended with the label and order readings; its gate row is `tools/gate.mjs:80`.

### Data Flow
A view renders its toolbar → the collapse ladder measures it on the `:920`-driven ResizeObserver
and — new — collapses the New label before the first cluster goes → the triggers open the panels,
whose zero-rule state — new — offers the property list ahead of the landed tree → the condition
rows' dropdowns, flagged — new — present their search row on a phone sheet under the primitive's
existing count gate → active rules render as chips, which — new — carry their own add control →
a view's deletion — new — passes through `051`'s confirm before the host's splice-and-save, which
the `:3447` guard terminates for the last view.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Three requirements change markup that other things read or photograph, and one extends a lane that
is also a gate, so the inventory is not optional.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `toolbar-renderer.ts:1180`, `:1330` | Producer: the two `deleteView` call sites, unconfirmed | Update — `051`'s confirm raised ahead of each | `grep -c "buildConfirmSheetBody" src/views/toolbar-renderer.ts` = **0** today; the vitest block afterward |
| `confirm-sheet.ts:46` | Producer: `051`'s confirm primitive | Unchanged — consumed, never rebuilt | `053`'s AC-105 idiom; `053` goal D8 |
| `database-view.ts:3445-3456` | Consumer: the host's splice-and-save, guarded at `:3447` | Unchanged — the confirm precedes it, the guard precedes the confirm | The one-view case in the confirm block |
| `toolbar-renderer.ts:2561-2598` (`:2571`) | Policy: the landed collapse order, `053`'s `AC-012`/`T008` | Update — one rung at the head; the order untouched (ADR-001) | The sweep's order assertion; the `:2571` array read before and after |
| `toolbar-renderer.ts:2365` | Producer: the New button's label span, drawn off-touch | Update — collapsed by the new first rung | The sweep's label reading; `aria-label` unchanged (NFR-A03) |
| `filter-panel-renderer.ts:197-202` | Producer: the zero-rule branch, a `db-panel-empty` hint | Update — the entry tier; the ≥1-rule panel byte-identical | The seeded one-rule diff, recorded in `tasks.md` (AC-005) |
| `filter-panel-renderer.ts:494-501`, `:576-590`; `sort-panel-renderer.ts:199-206` | Producers: the condition dropdowns, flagless | Update — `searchable: true`; nothing else | `grep -c searchable` = **0**/**0** today; the primitive's `:228` owns the gate |
| `dropdown-field.ts:224-228` | Policy: the search gate — phone `searchable && >8`, desktop the `a952e5e7` combobox rule | Unchanged — this packet adds no second gate | `063`'s ADR-001/ADR-008; the 8-option case is the control, not a new rule |
| `active-view-controls-renderer.ts:60-180` | Producer: the chip rail, clear-all only (`:150`) | Update — one add control per rule group | `grep -rn "db-active-control-add" src/ styles.css` = **0** today; the presence-iff-≥1-chip test |
| `styles.css` `:1815-1834` | Policy: the landed chip geometry | Update — one class each, landed values only | `styles.css:1821`, `:1825`, `:1832` read; D7's no-new-number rule |
| `toolbar-renderer.ts:1869-1887`; `types.ts:560`; `data-source.ts:1230`/`:1352`; `board-renderer.ts:192` | The hidden-group axis: rows, declaration, persistence, the board's read | Unchanged until ADR-007 answers; the table's consumption is the unestablished half | ADR-007; `059` REQ-001's zero-writer census; the read before any criterion goes green |
| `view-config-panel-renderer.ts:510-518` | Producer: the view-settings summary block, three rows — Properties, Filters, Sorts | Update — a fourth named conditional-colour row plus its explainer | `grep -c "this.renderAppliedSummary(" src/views/view-config-panel-renderer.ts` = **3** today; the chart view is the control (AC-012) |
| `view-config-panel-renderer.ts:747` (`:405`) | Producer: the conditional-formatting section, already per-view and already in the view half of the panel | Unchanged — opened by the new row, never duplicated | ADR-010; CHK-013's no-second-producer rule |
| `conditional-formatting.ts:168-206`; `table-renderer.ts:85`/`:866`/`:911`; `styles.css:1317-1319` | The capability: evaluation, wiring and paint | Unchanged — REQ-009 moves the way in, not the rules | `062` ADR-003's reads, re-verified here |
| `tools/live/toolbar-collapse-sweep.ts` | The lane: 250-900px, 10px steps | Update — the label and order readings | T001's red, `$?` read; the `toolbar-collapse` row at `tools/gate.mjs:80` |
| `044`/`048` lanes | Consumers: the confirm's phone presentation | Unchanged — the grammar lanes must stay green, not be re-specified | `npm run gate`, `$?`; AC-003 |

Required inventories, to be run and pasted into `tasks.md` before T004 is written (T002):
- Same-class producers: `rg -n 'buildConfirmSheetBody|db-active-control-add|searchable' src/views styles.css`
- Consumers of the changed markup: the registered captures that photograph the toolbar, the panels
  or the rail — named in T002 before the leg that moves them.
- Matrix axes for REQ-003: {phone sheet, desktop} × {8, 9 options} — four rows, of which the
  phone/8 and phone/9 cells are the gate's behaviour and the desktop cells are already ruled by
  `a952e5e7` and must not move.
- Invariant: the desktop combobox rule (`a952e5e7`) is untouched — every desktop dropdown filters
  as you type, whatever its length — and the `:228` gate keeps its `063`-ADR-001 wording. A change
  to either is a `063` ruling amended, which is not this packet's to do.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | The confirm's decline/accept/no-confirm cases, the zero-rule branch and its byte-identical control, the 8/9-option gate, the chip rail's presence-iff-≥1 | Vitest — `src/views/toolbar-renderer.test.ts` extended, plus the panel cases beside it, in the idiom `053`'s AC-105 blocks established |
| Lane | The 250-900px collapse sweep: label-absent-before-first-cluster-hidden, zero-overflow, the unchanged `:2571` order | `tools/live/toolbar-collapse-sweep.ts`, through the `toolbar-collapse` gate row |
| Manual | The four device-only checks: rail discoverability, the entry tier in the phone sheet, the confirm as a stacked sheet, tabs against the switcher | Obsidian, on device — the harness renders fixture markup and cannot answer any of them (they ride `053` AC-111) |

Each check is written before its code and observed failing, with the command named and `$?` read
directly. Every red carries a negative control: the one-rule panel (AC-005), the 8-option case
(AC-006), the zero-chip rail (AC-008), the one-view guard (AC-002), and the sweep's
no-cluster-hidden width (T001), so a green result cannot come from an assertion quietly matching
nothing.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `051`'s confirm primitive (`confirm-sheet.ts:46`) | Internal | Green — it ships, and `053`'s AC-105 blocks are the precedent consumer | REQ-001 cannot land without it; it does not block |
| The operator's answers on ADR-001, ADR-005, ADR-007 | Operator | Red — Proposed | T004, T007 and T009 wait; the proofs in T001/T002 and the ungated legs (T005, T006, T008, T010) do not |
| `053`'s open legs in the same files | Internal | Yellow — any leg of `053` still in these four files | This packet is sequenced after them (the handoff criteria); its legs contribute to the same file groups, never fork them |
| The parent's serialized CSS lane | Internal | Green once the hold is acquired (T003) | REQ-002, REQ-004 and REQ-005's `styles.css` edits wait on the hold, not on each other |
| `044`'s sheet grammar, `048`'s stacking model | Internal | Green | AC-003 must hold both green; neither is re-specified |
| `059`'s REQ-001/REQ-003 (the Groups panel) | Internal | Yellow — open, `059`'s own census: 0 board-mounted writers | If the operator routes the writer to `059`, REQ-006 closes Waived here, citing ADR-007 |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the confirm's copy or phone presentation reads wrong on device, the collapse rung
  changes nothing the sweep can see, or the entry tier disturbs the ≥1-rule panel.
- **Procedure**: each requirement is its own commit against its own file group, so a single
  `git revert` of that commit restores the prior behaviour without touching the others. The lane
  reading and the tests revert with their leg; nothing is left asserting a shape the code no longer
  produces, and the negative controls re-run to confirm the restoration.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 red-first probes ──► T004 confirm [B:ADR-005] ───────────────────┐
T002 inventories ─────────────────────────────────────────────────────┤
T003 CSS lane hold ──► T005, T007, T008 ──────────────────────────────┤
T005 entry tier ──► (its one-rule control) ───────────────────────────├──► T011 gates ──► T012 captures ──► T013 operator
T006 searchable flag ─────────────────────────────────────────────────┤
T007 collapse rung [B:ADR-001] ───────────────────────────────────────┤
T009 REQ-006: read, then settle [B:ADR-007] ──────────────────────────┘
T010 record-verify — independent, runnable immediately
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| T001 (red-first probes) | None | T004, T007 |
| T002 (inventories) | None | T004–T009 |
| T003 (CSS lane hold) | None | T005, T007, T008 |
| T004 (the confirm) | T001, T002, ADR-005 | T011 |
| T005 (entry tier) | T002, T003 | T011 |
| T006 (searchable flag) | T002 | T011 |
| T007 (collapse rung) | T001, T003, ADR-001 | T011 |
| T008 (chip-rail add) | T002, T003 | T011 |
| T009 (REQ-006) | Its own read, then ADR-007 | T011 |
| T010 (record-verify) | None | None |
| T011 (gates) | T004–T009 | T012 |
| T012 (captures + lane release) | T011 | T013 |
| T013 (operator, via `053` AC-111) | T012 | None — only the operator closes it |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 1-2 hours — the two probes, the inventories, the lane hold |
| Core Implementation | Medium | 6-9 hours — the confirm and the entry tier are most of it; the flag, rung and add control are small |
| Verification | Medium | 2-3 hours — gates, the capture pass and read, the operator's sitting |
| **Total** | | **9-14 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] The CSS lane is held, and the release names every capture whose picture moved
- [ ] The `toolbar-collapse` reading observed red before the rung, green after, both `$?` recorded
- [ ] No lane row skipped to reach green

### Rollback Procedure
1. Identify which requirement regressed — each is its own commit against its own file group.
2. `git revert` that commit, taking its lane reading and its test case with it.
3. Re-run `npm run gate` and read `$?`; re-run the affected negative control and confirm it reads
   as it did before the leg.
4. Record the revert in `implementation-summary.md` with what was observed, not what was expected.

### Data Reversal
- **Has data migrations?** Only if ADR-007 answers "here" — and then none: the axis
  (`boardHiddenGroups`) already persists; the leg writes existing keys, adds no schema.
- **Reversal procedure**: the toggle's absence; the stored keys of a group nobody hid are inert on
  read (`board-renderer.ts:192` filters by membership, so unknown keys are ignored).
<!-- /ANCHOR:enhanced-rollback -->

---
