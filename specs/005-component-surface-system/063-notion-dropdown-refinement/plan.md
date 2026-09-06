---
title: "Implementation Plan: Notion Dropdown, Menu and Picker Refinement"
description: "How the four measured reds close: one owned leg for the check flip, two riders on 052's open legs, one new escalation branch in the dropdown primitive, and the lane that proves each of them failed first."
trigger_phrases:
  - "063 plan"
  - "notion dropdown refinement plan"
  - "check flip approach"
  - "sheet escalation approach"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Notion Dropdown, Menu and Picker Refinement

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API, no framework |
| **Framework** | None — DOM built through Obsidian's `createDiv`/`createSpan` helpers |
| **Storage** | None. No persisted state changes in this packet |
| **Testing** | Vitest (`src/views/dropdown-field.test.ts`), plus the Playwright-backed live lanes under `tools/live/` |

### Overview
Four independent changes, ordered by how much each is owed to a landed ruling. The check flip is a
DOM-order change in one row builder plus a grid reorder in one stylesheet block and its three
variants — small, exact, and un-owned by any pending task, which is why it goes first. The trailing
values need no primitive change at all: `menu-row.ts` has carried the slot since it was written, and
four callers simply do not pass it, so those rows ride `052`'s open legs. The date sublines are a
first read of `date-value-picker.ts` followed by one element per preset. The escalation is the only
structural addition: one branch in the dropdown primitive that chooses between the anchored popover
and a sheet, on a condition the placement code already computes.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented — `spec.md` §2, §3
- [x] Success criteria measurable — `spec.md` §5, each with a value observed on `c9966433`
- [x] Dependencies identified — `052` T008/T009, the parent's CSS lane, two operator-owned ADRs

### Definition of Done
- [ ] All acceptance criteria met, waived or superseded — `acceptance-criteria.md`
- [ ] `npx tsc --noEmit`, `npm run build` and `npx vitest run` all exit 0, each output read
- [ ] `npm run gate` exits 0 with the extended `constructed-dropdown` row green
- [ ] The `constructed-dropdown` capture re-taken and opened, pixel read owed recorded
- [ ] Docs synchronized: `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md`
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
One primitive per surface family, callers configuring it — the shape `052` established. Nothing here
adds a second producer for anything that already has one.

### Key Components
- **`dropdown-field.ts`**: the dropdown primitive. Owns the row builder (`:349-359`), the
  phone-sheet branch (`:224`), the search gate (`:228`) and the anchored placement call (`:421`).
  Both P0 requirements land here.
- **`menu-row.ts`**: the shared row grammar. Owns the `[icon] label … [value] [chevron]` shape at
  `:87-119`. **Unchanged by this packet** — the value slot already exists, and REQ-002 is a caller
  change, which is the whole point of having the primitive.
- **`popover-host.ts`**: the shared picker plumbing and the named width roles (`:229-258`).
  Consulted for the date picker's hard 252, not modified.
- **`owned-menu.ts`**: the menu primitive. Its height cap at `:360` supplies half of REQ-004's
  cramped condition; not otherwise touched.
- **`tools/live/constructed-state-assertions.mjs`**: the lane. The `dropdownPopover` marker at
  `:123` is extended, and its scenario entry at `:417-420` is the row that turns red first.

### Data Flow
A dropdown opens → the primitive decides its presentation (anchored popover, phone sheet, or — new —
a desktop sheet when the anchored placement is cramped) → the row builder emits one row per option
with the check **last** → the placement code sizes and positions the surface → the lane mounts the
constructed renderer and reads the markers back out of the real DOM.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

REQ-001 changes the DOM order of a row that four other things read, so the inventory is not optional.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `dropdown-field.ts:349-359` | Producer: builds the option row, check first | Update — check created last | `rg -n 'db-dropdown-option-check' src/views` |
| `styles.css:3237-3241`, `:3258-3268` | Policy: grid tracks that place the check | Update — trailing track | `rg -n 'db-dropdown-option(\.has-)?' styles.css` |
| `styles.css:3289-3296` | Policy: the check's own box | Unchanged — it is position-independent | Read the rule; it sets display, colour and flex only |
| `dropdown-field.ts:539` | Consumer: reads the check to sync selection | Unchanged — queries by class, not position | `rg -n 'querySelector.*option-check' src/views` |
| `tools/screenshots/scenarios/core.mjs:251-256` | Consumer: fixture mirroring the real row | Update — it hard-codes the leading-check grid in a comment and in markup | Read the fixture and the comment together |
| `tools/live/constructed-state-assertions.mjs:123` | Consumer: the marker | Update — assert order, not just presence | Run the lane, read `$?` |
| `cell-editor-relation.ts:153-154`, `cell-editor-option.ts:532-534` | Same-class producers, already trailing | Not a consumer of this change — different class (`db-option-check`) and already compliant | `rg -n 'db-option-check|db-relation-option-check' src/views` |

Required inventories, to be run and pasted into `tasks.md` before T002 is written:
- Same-class producers: `rg -n 'db-dropdown-option-check|db-menu-item-check' src/views styles.css`
- Consumers of the changed order: `rg -n 'db-dropdown-option' src tools styles.css`
- Matrix axes for REQ-001: {no icon, icon} × {no swatches, swatches} × {selected, unselected} —
  eight rows, four of which are the grid variants at `styles.css:3237-3268`.
- Invariant: the check is the last element child of `.db-dropdown-option` in every variant, and the
  label's track is never the 16px one — the failure `core.mjs`'s own fixture comment records, where
  a missing check pushed every label into a 16px track and rendered "S…", "A…", "R…".
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
| Unit | Row DOM order, the escalation branch's condition, the preset subline's resolved value | Vitest — `src/views/dropdown-field.test.ts`, plus a new case in the date picker's own suite |
| Integration | The constructed dropdown mounted through the real renderer, markers read back from the DOM | `tools/live/constructed-state-assertions.mjs`, run through `npm run gate` |
| Manual | The escalated sheet on desktop, and the flipped check under the operator's theme | Obsidian, on device — the harness renders fixture markup and cannot answer either (D5) |

Each check is written before its code and observed failing, with the command named and `$?` read
directly. Every red carries a negative control: for REQ-001, a row built without a check still
passes the other assertions, so a green result cannot come from the assertion silently matching
nothing.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `052` T008 (toolbar action panels) | Internal | Yellow — open | REQ-002's `toolbar-renderer.ts:1312` row waits; the other three rows are unaffected |
| `052` T009 (column-menu submenus) | Internal | Yellow — open | REQ-002's three `column-menu.ts` rows wait; REQ-001 does not, because T009 never opens `dropdown-field.ts` |
| The parent's serialized CSS lane | Internal | Green | REQ-001 and REQ-004 both wait on the hold, not on each other |
| ADR-004, ADR-005 | Operator | **Green — both ruled 2026-09-06 19:08** | ADR-004 Accepted (the labelled colour list, and it opens REQ-008 / AC-012-016 / T014-017); ADR-005's carve-out Declined, so `051` E3 stands whole and no row changes |
| `044` sheet grammar, `048` stacking model | Internal | Green | REQ-004 must hold both green; it re-specifies neither |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the flipped check reads wrong under the operator's theme on device, or the escalation
  selects surfaces the operator does not consider cramped.
- **Procedure**: each requirement is its own commit against its own file group, so a single
  `git revert` of that commit restores the prior behaviour without touching the others. The lane
  assertion reverts with it; nothing is left asserting a shape the code no longer produces.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 red-first assertion ──► T004 check flip ──► T005 grid + fixture ──┐
T002 inventories ─────────────────────────────────────────────────────┤
T003 CSS lane hold ──► T005, T006 ────────────────────────────────────┤
T006 escalation branch ──► T007 search survives it ───────────────────├──► T011 gates ──► T012 capture ──► T013 operator
T008 trailing values (rides 052 T008/T009) ───────────────────────────┤
T009 date sublines ───────────────────────────────────────────────────┘

T010 052 metadata reconcile — independent, runnable immediately
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| T001 (red-first assertion) | None | T004 |
| T002 (inventories) | None | T004 |
| T003 (CSS lane hold) | None | T005, T006 |
| T004 (row builder) | T001, T002 | T005 |
| T005 (grid + fixture) | T003, T004 | T011 |
| T006 (escalation) | T003 | T007, T011 |
| T007 (search survives) | T006 | T011 |
| T008 (trailing values) | `052` T008 / T009 | T011 |
| T009 (date sublines) | A first read of `date-value-picker.ts` | T011 |
| T010 (052 reconcile) | None | None |
| T011 (gates) | T005, T006, T007, T008, T009 | T012 |
| T012 (capture + lane release) | T011 | T013 |
| T013 (operator read) | T012 | None — only the operator closes it |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 1 hour — the red-first assertion and the inventories |
| Core Implementation | Medium | 6-9 hours — the flip is small, the escalation is most of it |
| Verification | Medium | 2-3 hours — gate, capture re-take and read, device check |
| **Total** | | **9-13 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] The CSS lane is held, and the release names every capture whose picture moved
- [ ] `constructed-dropdown` re-taken and opened before the lane is released
- [ ] No lane row skipped to reach green

### Rollback Procedure
1. Identify which requirement regressed — each is its own commit against its own file group.
2. `git revert` that commit, taking its lane assertion and fixture change with it.
3. Re-run `npm run gate` and read `$?`; re-take `constructed-dropdown` and open it.
4. Record the revert in `implementation-summary.md` with what was observed, not what was expected.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A. Nothing in this packet writes persisted state.
<!-- /ANCHOR:enhanced-rollback -->

---
