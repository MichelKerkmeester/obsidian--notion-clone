---
title: "Implementation Plan: Notion Calendar Refinement"
description: "How the two surviving Notion calendar refinements land: one emission site removed and verified by render rather than by grep, and two touch floors lifted per profile and pinned with negative controls."
trigger_phrases:
  - "060 plan"
  - "calendar refinement plan"
  - "all-day strip removal plan"
  - "mini day floor plan"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Notion Calendar Refinement

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None - direct DOM construction through `createEl` / `createSpan` |
| **Storage** | None; `ViewConfig` only, unchanged by this packet |
| **Testing** | Vitest (`calendar-pinned-values.test.ts`), the render-assertion harness, and the screenshot corpus |

### Overview

Two independent legs. The first deletes one `createSpan` call in the week and day all-day strip and then retires the two CSS rules that call leaves inert, verifying by rendering the surfaces that share the class rather than by reading the diff. The second lifts `.db-calendar-mini-day`'s hit target into the phone and coarse-pointer profiles, in both the toolbar mini calendar and the date-edit popover variant, without disturbing the hover-scoped desktop density. Both legs are proven red first and pinned after.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Both red-first values re-measured on the tree the work will start from, not carried from the research
- [ ] Device check D1 answered, or REQ-002 scoped to the profile that does not depend on it
- [ ] `057` G-rows re-read so nothing here proposes work a `Met` row already closed

### Definition of Done
- [ ] `npx tsc --noEmit`, `npm run build` and `npx vitest run` all pass, each output and exit status read
- [ ] `npm run screenshots:verify` exits 0 and every changed PNG was opened and looked at
- [ ] Every acceptance row is `Met`, `Waived` or `Superseded`, and each waiver names an ADR that exists
- [ ] `057/acceptance-criteria.md` still reads 13 `Met` of 15
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Renderer plus stylesheet, with pinned values as the regression seam. There is no new module and no new abstraction: both legs are edits inside surfaces that already exist.

### Key Components

- **`CalendarRenderer.renderWeekAllDayStrip`** (`src/views/calendar-renderer.ts`, the block at `:840-870`): the only in-grid producer of a multi-day bar left after P0-3, and therefore the only in-grid producer of `.db-calendar-month-dates`.
- **`.db-calendar-month-dates`** (`styles.css:17361-17373`) and its `:has()` flex bound (`:17381-17383`): shared by four producers - the all-day strip, the day popover, the overflow popover and the drag ghost. Only the first is in-grid.
- **`.db-calendar-mini-day`** (`styles.css:15932-15945`) and its date-edit override (`styles.css:6941-6945`): the picker's day cell, in two variants.

### Data Flow

`buildCalendarMonthModel` produces segments carrying `startDateKey` / `endDateKey`; the all-day strip reads that pair twice today - once to decide whether to emit the string, once to format it. After this packet it reads it only through `getSegmentTitle`, which already composes the same range into the chip's `title`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `calendar-renderer.ts:862-864` (all-day strip) | The one in-grid emitter of the range span | update | Constructed week render: 0 `.db-calendar-month-dates` inside `.db-calendar-week-allday-cols` |
| `calendar-renderer.ts:628` (day popover) | Popover emitter | unchanged | Render the day popover and read the span still present |
| `calendar-renderer.ts:930` (all-day overflow popover) | Popover emitter | unchanged | Render the overflow popover and read the span still present |
| `calendar-renderer.ts:1483`, `:1498` (drag ghost) | Transient drag preview | unchanged | Drag a segment and read the ghost's live label |
| `getSegmentTitle` (`calendar-renderer.ts`) | Composes the range into the chip `title` | unchanged | Assert the tooltip still carries the range after the span is gone |
| `styles.css:17361-17383` | Base rule plus `:has()` flex bound | update | Retire only after a rendered popover proves no in-grid producer remains |
| `styles.css:15932-15945`, `:6941-6945` | Picker day-cell metrics | update | Computed `min-height` read per profile |
| `calendar-pinned-values.test.ts` | The regression seam for both legs | update | Two new pins, two negative controls |

Required inventories:
- Producers of the class: `rg -n 'db-calendar-month-dates' src styles.css` - four in `src`, three selectors in `styles.css`, re-run after the edit.
- Consumers of the picker metric: `rg -n 'db-calendar-mini-day' styles.css src` before choosing the selector to lift.
- Matrix axes for REQ-002: {toolbar mini, date-edit popover} x {phone profile, coarse pointer, hover desktop} = six rows, all six stated before implementation.
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
| Unit / pinned values | The two red-first numbers and both negative controls | Vitest, `calendar-pinned-values.test.ts` |
| Render assertion | Constructed week-scale render carrying a multi-day all-day event; computed `min-height` per profile | The render-assertion harness |
| Capture | Week and day all-day strip, both themes, desktop and phone | `npm run screenshots`, then open the PNGs |
| Manual / device | D1-D4 in `acceptance-criteria.md` section 4 | The operator, on iOS |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Device check D1 (date-edit phone chrome) | Internal | Yellow | REQ-002's selector choice waits; the 44px value itself does not |
| `057` T019 residuals (G12, G15) | Internal | Green | Independent surfaces; no ordering constraint |
| The screenshot harness's week all-day scenario | Internal | Green | Needed to photograph the change; already registered |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: A user report that a multi-day event's dates became unreachable, or a picker row that outgrew its popover on desktop.
- **Procedure**: Both legs are additive-free deletions and declarative floors. Revert the single commit; no data migration, no persisted shape, no feature flag to unwind.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 (red-first proof) ──► T002 (strip emitter)  ──┐
                       └──► T003 (touch floors)  ──┼──► T004 (pins) ──► T005/T006 (record, capture)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Red-first proof (T001) | None | T002, T003 |
| Strip removal (T002) | T001 | T004 |
| Touch floors (T003) | T001, device check D1 for the selector | T004 |
| Pins (T004) | T002, T003 | T006 |
| Record and capture (T005, T006) | T004 | Closure |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Red-first proof | Low | 1 hour |
| Strip removal and CSS retirement | Medium | 2-3 hours, most of it verifying the shared class by render |
| Touch floors | Low | 1 hour |
| Pins and negative controls | Low | 1 hour |
| Capture and record | Medium | 2 hours |
| **Total** | | **7-8 hours**, excluding the operator's device pass |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Both negative controls observed red before the fix and green after
- [ ] The day popover and the overflow popover rendered and read after the CSS retirement
- [ ] Changed captures opened and looked at, not just regenerated

### Rollback Procedure
1. `git revert` the packet's implementation commit.
2. Re-run `npx vitest run` and confirm the two new pins disappear with it rather than failing.
3. Recapture, and confirm the corpus returns to its pre-change hashes.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A - no persisted shape changes.
<!-- /ANCHOR:enhanced-rollback -->

---
