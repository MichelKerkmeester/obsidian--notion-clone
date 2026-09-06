---
title: "Feature Specification: Notion Calendar Refinement"
description: "What the Notion calendar harvest still changes on the Anytype-parity calendar once the rebuild is accounted for: one in-grid string to remove, one touch floor to pin, four conflicts to record."
trigger_phrases:
  - "060 spec"
  - "notion calendar refinement"
  - "all-day strip date range"
  - "calendar mini day touch floor"
importance_tier: "important"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Notion Calendar Refinement

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-06 |
| **Owner surface** | `057-calendar-anytype-parity` |
| **Opened by** | The Opus synthesis of `057`'s five-iteration `/deep:research:auto` loop on GLM 5.3 flash max |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Notion's 40-screen calendar harvest changes exactly one design decision on this surface, and the calendar rebuild landed most of its consequences before this packet opened. Two rows survive on today's tree. The week and day **all-day strip** still prints an inline `start-end` date string inside a multi-day bar (`src/views/calendar-renderer.ts:862-864`), an element Notion's eleven-week multi-day record never draws (`057/notion-screens-digest.md:163-171`) and the month grid itself already stopped drawing when P0-3 rebuilt it — so the same event now reads two different ways at two scales. Separately, the **date picker's day cells** are the one interactive thing the calendar draws whose touch floor nobody pinned: `min-height: 34px` at `styles.css:15938`, and `28px` at `styles.css:6942` inside a `(hover: hover)` block a touch device never enters, against `044`'s 44px phone floor.

### Purpose

The calendar reads the same way at every scale for a multi-day event, its date picker is reachable by thumb, and every Notion pattern that disagrees with a landed Anytype ruling is written down with both readings instead of being quietly adopted or quietly lost.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- Removing the inline `start-end` string from the week and day all-day strip's spanning bar, at every breakpoint, and retiring the CSS the removal makes inert.
- Lifting `.db-calendar-mini-day`'s hit target to the phone and coarse-pointer floors, in both the toolbar mini calendar and the date-edit popover variant, with pinned values and a negative control.
- One ADR per Notion-versus-Anytype conflict the harvest named, plus the two Proposed rows that belong to surfaces this packet does not own.
- Verification rows for the four research findings the calendar rebuild closed while the loop ran.

### Out of Scope

- **The month grid's chip anatomy** - P0-3 already landed one chip per covered day with no inline range (`calendar-renderer.ts:417-425`); `057` G3/G4/G5 are `Met` and D1 forbids reopening them.
- **The chip's fill and border** - Notion's boxed pill (`420ef2f0`) contradicts the landed flat chip; ADR-001 declines it.
- **The week start** - ruled Monday and landed (`src/data/calendar-date-time.ts:172-180`, `057` ADR-007); ADR-002 records the loop's evidence against a settled row.
- **Range shading in a date picker** - Notion's own three frames disagree; the surface is the record/cell editor, not this view. ADR-006, Proposed, routed by name.
- **The picker's today treatment** - a documented today-versus-selected collision rule already solves it (`styles.css:15977-15988`); ADR-007, Proposed, deferred to the picker's own leg.
- **The `Relative` date format, Notion's layout tiles, the Connect-Calendar feature, Notion's dark theme** - other owners or absent from the harvest entirely.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/calendar-renderer.ts` | Modify | Drop the `.db-calendar-month-dates` emission from the all-day strip segment (`:862-864`); leave the tooltip (`getSegmentTitle`), the day popover (`:628`), the overflow popover (`:930`) and the drag ghost (`:1483`, `:1498`) intact |
| `styles.css` | Modify | Retire `.db-calendar-month-dates`'s in-grid rule and the `:has()` flex band-aid once no in-grid producer emits the child (`:17361-17383`); lift `.db-calendar-mini-day` at `:15938` and `:6942` to the phone and coarse floors |
| `src/views/calendar-pinned-values.test.ts` | Modify | Pin the zero-in-grid-range-string count and the two touch floors, each with a negative control |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A multi-day all-day event renders no inline `start-end` date string inside the week or day grid, at any breakpoint. The dates stay reachable through the chip's `title` tooltip and the day and overflow popovers, which is where Notion's own frames leave them. |
| REQ-002 | Every `.db-calendar-mini-day` hit target clears 44 CSS px in the phone profile and 28 px under `(pointer: coarse)`, in the toolbar mini calendar and in the date-edit popover variant alike. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | `decision-record.md` carries one ADR for each Notion-versus-Anytype conflict the harvest named - chip presentation, week start, drop-target treatment and today hue - each citing the Notion screen id and our `file:line` for both readings, and each leaving the landed ruling standing. |
| REQ-004 | The four research rows that closed on `main` while the loop ran are recorded with their closing evidence rather than re-proposed as work. |
| REQ-005 | The device-only checks the loop consolidated are carried as an operator checklist that this packet never ticks on its own authority. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A constructed week-scale render carrying one multi-day all-day event yields 0 `.db-calendar-month-dates` elements inside `.db-calendar-week-allday-cols`, on both profiles, and re-adding the emitter turns that assertion red.
- **SC-002**: The two `min-height` declarations at `styles.css:15938` and `:6942` are superseded by profile-scoped floors of 44 px and 28 px, pinned with a negative control.
- **SC-003**: Seven ADRs exist; the four conflict ADRs are `Accepted` with the landed ruling intact, and the two routed rows are `Proposed` and name their owner.
- **SC-004**: `057/acceptance-criteria.md` still reads 13 `Met` of 15 after this packet lands - nothing here un-ticks a measured row.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `057` T019's remaining reds (G12 capture, G15 done-chip colour) | Neither touches this packet's two legs | Independent; no ordering constraint |
| Dependency | The date-edit popover's phone chrome (device check D1) | REQ-002's sizing is correct either way; the *chrome* decides which selector carries the lift | Confirm on device before choosing between a phone-profile rule and a sheet-scoped one |
| Risk | Removing the all-day strip's range string loses information for a user scanning a week | Low | The tooltip and both popovers keep it, and the month grid has shipped without it since P0-3 without a report |
| Risk | The `:has()` band-aid is retired while a producer still emits the child | Med | The band-aid targets `.db-calendar-month-segment` with a `.db-calendar-month-dates` child; the popovers use the same class, so verify by rendering a popover before deleting the rule rather than by reading the diff |
| Risk | The 28 px date-edit override lives under `(hover: hover)`, so a naive lift changes desktop density | Low | Scope the lift to the touch profiles and leave the hover-scoped 28 px alone |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: No change to the month, week or day render path's element count beyond removing one span per multi-day all-day segment.
- **NFR-P02**: The touch-floor lift is declarative CSS only - no layout read, no measurement in script.

### Accessibility
- **NFR-A01**: Every changed hit target clears WCAG 2.5.8's 24 px minimum and this repository's stricter 44 px phone floor (`044`).
- **NFR-A02**: Removing the range string removes no information from assistive technology: the chip's `title` retains the full range through `getSegmentTitle`.

### Reliability
- **NFR-R01**: Both legs are pinned in `calendar-pinned-values.test.ts`, each with a negative control, so a regression fails a test rather than a capture review.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Same-day "range": `endDateKey === startDateKey` already suppresses the string at `calendar-renderer.ts:862`; the removal must not change single-day chips, which never had one.
- A range with times: `formatMonthDateRange` takes start and end minutes; the tooltip keeps them, so a timed multi-day event loses nothing.
- A segment that continues past the week edge: `is-continuation` / `continues-after` bars carry no start or end marker of their own; they must not gain one.

### Error Scenarios
- The `:has()` rule is deleted while the popovers still emit the child: the popover chip's title stops shrinking and the range wraps. Render a popover, not a diff, before deleting.
- The touch lift is applied unscoped: the desktop date-edit popover grows by 16 px per row and the popover outgrows its anchor.

### State Transitions
- Mid-drag: the ghost (`calendar-renderer.ts:1483`, `:1498`) shows the live target range and is deliberately kept - it is a transient preview, not a resting chip.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 18/25 | ~160 LOC across 3 files: one emission site, two CSS blocks, two pinned assertions with negative controls |
| Risk | 7/25 | No auth, no API, no persisted shape; one shared CSS class read by four producers, which is why the `:has()` retirement is verified by render rather than by grep |
| Research | 13/20 | Five iterations landed and the whole 40-screen inventory is dispositioned; two device checks and two routed ADRs stay open |
| **Total** | **28/70** | **Level 2** - `recommend-level.sh --loc 220 --files 6` returns 28/100 at 80% confidence, recommended level 1, phase score 0/50. Raised to 2 on the go-higher rule: the packet's substance is its ADRs and its acceptance rows, which are Level 2's verification addendum, and every sibling in the D15 family sits at 2 or 3 |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Which chrome does a phone date-edit take - a popover, or `044`'s bottom sheet? The CSS cannot say, and REQ-002's selector depends on the answer. Device check D1.
- Does any of our pickers ever need a between-endpoints range shade at all? Notion's three frames of one sheet show three different treatments (`057/notion-screens-digest.md:110`, `:114`, `:116`), so the reference cannot decide it; ours has zero `is-in-range` rules today. ADR-006 routes it to the record/cell editor's owner rather than answering it.
- What does Notion's `Relative` date format actually render? The digest names the label at `812c6468` and not the behaviour. The column-format owner's question, recorded so it is not silently dropped.
- What Notion setting produces the boxed-pill chip? Absent from the 40-screen set (`057/notion-screens-digest.md:331-334`). Only matters if the flat-chip ruling is ever revisited.
<!-- /ANCHOR:questions -->

---
