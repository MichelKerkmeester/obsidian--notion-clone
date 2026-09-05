---
title: "Implementation Plan: Calendar Anytype Parity"
description: "How the calendar is retargeted to Anytype: a capture true-up, an operator ruling on the scales, a red-first pass, then legs grouped by file."
trigger_phrases:
  - "057 plan"
  - "calendar anytype parity plan"
  - "calendar retarget legs"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "authored the leg plan for the calendar anytype retarget"
    next_safe_action: "Execute T001 and put ADR-002's scale question to the operator in the same pass"
    blockers:
      - "Leg A is gated on ADR-002; the other legs are gated on T001 and T002"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-toolbar-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-plan"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "The scale question is asked before the legs start, not discovered mid-implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Calendar Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None — direct DOM construction through Obsidian's `createDiv`/`createEl` helpers |
| **Storage** | Vault markdown frontmatter; the calendar reads and writes a date property |
| **Testing** | Vitest (`calendar-renderer.test.ts`, `calendar-keyboard-navigation.test.ts`, `calendar-search-placement.test.ts`); `npm run gate`; `tools/live/sheet-grammar.mjs` |

### Overview
The calendar is retargeted in four movements: an image-capable leaf reads the 44 calendar capture
files and records every value in `design-trueup.md` (T001); the scale question goes to the operator
as ADR-002 in the same pass, because one whole element and a third of the class vocabulary hang on
it; a measurement pass records each criterion's failing figure (T002); then legs grouped by file
retarget the month grid, the day cell, the event chip, navigation and the date-property picker,
with every phone value labelled as inferred from the desktop capture it came from.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented — `spec.md` sections 2 and 3
- [ ] Success criteria measurable — SC-001 through SC-005 each carry a number or a boolean
- [ ] Dependencies identified — `039`, `044`, `048`, `050`, `053`, the CSS lane, and the operator's
      ADR-002 ruling, which is the one that gates a leg rather than a check

### Definition of Done
- [ ] All acceptance criteria met, waived by an ADR, or superseded by one
- [ ] `npm run gate` exit 0 read from `$?`, and `sheet-grammar.mjs` 12 surfaces / 31 pairs green
- [ ] Unlabelled phone-calendar values: 0
- [ ] `design-trueup.md` written, and `checklist.md` Today cells filled by T002 rather than after
      the fix
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Renderer-per-view, split by scale. `CalendarRenderer` owns the month grid, the week body and the
day column; `calendar-toolbar-renderer.ts` owns the calendar's own toolbar;
`calendar-mini-calendar-renderer.ts` owns the jump control. This packet changes what they
construct, not how the split works — unless ADR-002 removes two of the three scales, which would
remove the week and day branches outright.

### Key Components
- **`CalendarRenderer` (`src/views/calendar-renderer.ts`, 2522 lines)**: 91 `db-calendar-*` classes,
  three scales, the unscheduled backlog drawer (`:160-163`), the today marker (`:344`), and the
  invalid-event repair entry point.
- **`calendar-toolbar-renderer.ts` (578 lines)**: navigation. A5's month/year selects, arrows and
  Today button land here.
- **`calendar-mini-calendar-renderer.ts` (420 lines)**: the jump control. Dispositioned by T001 —
  matched to a captured counterpart or kept as ours.
- **`styles.css` calendar block (133 `db-calendar` rules)**: presentation, under the serialized lane.
- **`calendar-timeline-renderer.ts` (4317 lines)**: **not this packet's.** It is the gantt, it is
  `037`'s verified 1:1 Project Manager port, and it is the nearest neighbour a careless leg would
  damage.

### Data Flow
Rows arrive with a date property; the renderer buckets them by day key and paints one cell per day
in the current scale's window. `047` section 5 records Anytype's day cells self-loading their own
objects rather than being fed a pre-bucketed set — a structural difference T001 confirms before
anyone decides whether to adopt it, since it is a data-flow change rather than a presentation one
and goal D8 keeps the data model ours.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `src/views/calendar-renderer.ts` | Producer — 91 `db-calendar-*` classes, three scales | update | `grep -o 'db-calendar[a-z-]*' src/views/calendar-renderer.ts \| sort -u \| wc -l` → 91 today |
| `styles.css` calendar block | Producer — 133 `db-calendar` rules | update | `grep -o 'db-calendar[a-z-]*' styles.css \| sort -u \| wc -l` → 133 today |
| `src/views/calendar-toolbar-renderer.ts` | Producer — navigation | update | A5's captured toolbar |
| `src/views/calendar-mini-calendar-renderer.ts` | Producer — jump control | update or dispositioned | T001 decides which |
| `src/views/calendar-renderer.test.ts` | Consumer — asserts the current shape | update | Follows the retarget |
| `src/views/calendar-keyboard-navigation.test.ts` | Consumer — keyboard behaviour | unchanged | Green with **0** lines changed; that is REQ-010's guard |
| `src/views/calendar-search-placement.test.ts` | Consumer — search placement | unchanged | Green with 0 lines changed |
| `src/views/calendar-timeline-renderer.ts` and the `pm-gantt-*` set | **Not a consumer** — but the nearest neighbour and a stylesheet co-tenant | not a consumer | REQ-009: baseline before leg 1, re-read after the last |
| `tools/live/sheet-grammar.mjs` | Consumer — phone grammar and stacking | unchanged | 12 surfaces, 31 pairs, exit 0 |

Required inventories:
- Same-class producers: `rg -n 'db-calendar' src/views/ styles.css`.
- Consumers of changed symbols: `rg -n 'updateCalendarScale|calendarScale|db-calendar-backlog' . --glob '*.ts' --glob '*.css' --glob '*.mjs' --glob '*.md'` — this is the inventory ADR-002's answer acts on.
- Matrix axes: scale (month / week / day, pending ADR-002) x device (desktop / phone) x theme
  (light / dark) x day state (empty / populated / overflowing / today). Every axis has a capture or
  a named gap; the phone column has **no** capture and is labelled throughout.
- Algorithm invariant: a record lands in exactly one day cell, and a presentation retarget must not
  change which. Adversarial cases: a DST boundary, a month-edge span, and an unparseable date.
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
| Unit | Month grid shape, day cell, event chip, navigation | Vitest (`calendar-renderer.test.ts`) |
| Regression | Keyboard navigation and search placement, unchanged | Vitest, with a 0-line diff on both test files as the assertion |
| Integration | The full gate — 25 live lanes | `npm run gate`, exit read from `$?` |
| Grammar | Every phone surface the calendar opens | `node tools/live/sheet-grammar.mjs` |
| Capture | Calendar capture hashes, and the gantt's, against the pre-leg baseline | `npm run screenshots:verify` |
| Manual | The operator's own desktop side-by-side against Anytype; the phone read knowing it was inferred | Device, operator-owned |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| T001's image-capable leaf | Internal | Red — not yet run | Every geometry value stays owed |
| The operator's ADR-002 scale ruling | External to this repository | Red — not yet asked | Leg A cannot start: it either keeps three scale branches or removes two |
| `047/research/research.md` section 5 "Calendar" | Internal | Green — written, source-derived | The only existing read of Anytype's calendar; corroborates rather than replaces T001 |
| `050-anytype-adoption/design-trueup.md` | Internal | Yellow — written, but nearly silent on the calendar | T001 reads first-hand rather than inheriting |
| `044` grammar + `048` stacking lanes | Internal | Green | A regression blocks the leg, not the packet |
| Parent serialized CSS lane | Internal | Yellow — shared with `051`, `052`, `055`, `056` | Legs queue rather than conflict |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the gate goes red and stays red after one bounded repair pass; or the gantt capture
  hashes move without a named gap; or either unchanged-test guard (REQ-010) needs editing to pass.
- **Procedure**: legs land individually on the packet's worktree branch; revert the last leg's
  commit, rerun the gate, read the exit from `$?`. No data migrates, so a revert is complete.
- **The one irreversible step**: if ADR-002 removes the week and day scales, that deletion is a
  separate, clearly-labelled leg landed last, so reverting it does not unwind the rest of the
  retarget.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 capture true-up ──┬──► ADR-002 operator ruling ──► Leg A (renderer + scales)
                       └──► T002 red-first ───────────┬──► Leg B (navigation)
                                                      ├──► Leg C (stylesheet)
                                                      └──► Leg D (phone, all labelled)
                                                              └──► Leg E (verification)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| T001 true-up | The capture set on disk | ADR-002, T002, every leg |
| ADR-002 ruling | T001's confirmed absence of a scale switch | Leg A |
| T002 measurement | T001 | Every leg |
| Leg A renderer + scales | T001, T002, ADR-002 | B, C, D |
| Leg B navigation | Leg A | Leg E |
| Leg C stylesheet | Leg A, the CSS lane | Leg E |
| Leg D phone | Leg A | Leg E |
| Leg E verification | A, B, C, D | The operator row |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Med | T001 reads 44 capture files, and must establish two absences across all twenty set captures rather than one |
| Core Implementation | High | A 2522-line renderer, a 578-line toolbar, a 133-rule stylesheet block, and possibly the removal of two scale branches |
| Verification | Med | Gate, grammar, capture hashes, gantt no-move, and two 0-line-diff test guards |
| **Total** | | Gated twice: on T001, and on an operator answer that arrives on its own schedule |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Baseline captured: `db-calendar-*` counts, `pm-gantt-*` count, calendar and gantt capture hashes
- [ ] The CSS lane is held for the leg that touches `styles.css`
- [ ] `sheet-grammar.mjs` green before the leg, so a red after it is attributable
- [ ] ADR-002 is answered — a leg started before the ruling may have to be redone

### Rollback Procedure
1. Stop landing legs; the calendar's previous shape is whole in the previous commit.
2. `git revert` the leg's commit, or reset the branch to the last green leg.
3. Rerun `npm run gate` and `node tools/live/sheet-grammar.mjs`, reading each exit from `$?`.
4. Record the revert and its reason in `implementation-summary.md`.

### Data Reversal
- **Has data migrations?** No. The calendar reads and writes an existing date property and this
  packet does not change which one, unless ADR-002's answer moves the date-property picker's
  default — in which case that leg names the reversal explicitly.
- **Reversal procedure**: N/A for presentation legs.
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  T001        │────►│  ADR-002     │────►│  Leg A       │
│  true-up     │  │  │  operator    │     │  renderer    │
└──────────────┘  │  └──────────────┘     └──────┬───────┘
                  │                              │
                  └──► T002 red-first ───────────┤
                                                 │
                                   ┌─────────────▼─────────────┐
                                   │  Legs B / C / D  ──► E    │
                                   └───────────────────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| T001 true-up | The 44 calendar capture files | `design-trueup.md`, section 4's filled table, two established absences | ADR-002, T002, A |
| ADR-002 | T001's absence finding | The operator's scale ruling | Leg A |
| T002 red-first | T001 | Every `checklist.md` Today cell | A, B, C, D |
| Leg A renderer | T001, T002, ADR-002 | Month grid, day cell, chip, today marker, scales | B, C, D |
| Leg B navigation | A | The captured toolbar | E |
| Leg C stylesheet | A, CSS lane | The calendar block | E |
| Leg D phone | A | Every phone value labelled | E |
| Leg E verify | A, B, C, D | Gate green, grammar green, gantt unmoved, guards intact | The operator row |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **T001 capture true-up** — the packet is gated on it, and so is the question the operator answers — CRITICAL
2. **ADR-002 operator ruling** — Leg A branches on it — CRITICAL, and not this repository's to schedule
3. **Leg A, the renderer** — every other leg reads what it produces — CRITICAL
4. **Leg E, verification** — gate, grammar, capture hashes, gantt no-move, two 0-line guards — CRITICAL

**Total Critical Path**: T001 → ADR-002 → A → E.

**Parallel Opportunities**:
- T002 runs alongside the wait for ADR-002; it needs T001 only.
- Legs B, C and D are independent of one another once A lands; C queues on the CSS lane rather
  than on B or D.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | The capture read exists | `design-trueup.md` written; 9 of 9 anatomy elements carry a measurement or a labelled inference; A4 and A6's absences established across all twenty set captures | After T001 |
| M2 | The scale question is answered | ADR-002 status is Accepted or Rejected, never Proposed | After the operator rules |
| M3 | Every criterion has a red | Each `checklist.md` Today cell holds a figure read off the current tree | After T002 |
| M4 | The calendar is Anytype-shaped | Nine elements matched or deviating with a named ground; unlabelled phone values 0 | After Leg D |
| M5 | The gate is green and nothing else moved | `npm run gate` exit 0; grammar 12/31; `pm-gantt-*` unchanged; both guard tests green at 0 lines changed | After Leg E |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

The full records live in `decision-record.md`. Two are summarised here.

### ADR-001: The calendar's parity target moves to Anytype

**Status**: Accepted (2026-09-05 ~22:45, operator)

**Context**: `039-calendar-parity-port` shipped a behavioural parity port of Project Manager's
calendar in 1.4.6. The operator has since named Anytype as the target for the board and the
calendar, and kept Project Manager for the gantt.

**Decision**: the calendar is rebuilt against Anytype's captured calendar layout. The gantt is not.

**Consequences**:
- `039`'s port is superseded rather than deleted; its record stays as history with a note.
- Unlike `056`, there is no Project Manager markup to remove — the retarget is per-element.
- The phone half has no reference and is labelled throughout rather than silently inferred.

**Alternatives Rejected**:
- Reopen `039`: it shipped and verified a different target; reopening would make its record
  contradict itself, and the operator asked for phases.

### ADR-002: The week and day scales — operator's call

**Status**: **Proposed** — awaiting the operator.

**Context**: ours has three scales; Anytype ships one calendar layout and no captured scale switch.

**Decision**: pending. This packet implements the answer and does not infer one.

**Consequences**: roughly a third of the calendar's 91-class vocabulary, its timed-event body and
its keyboard tests hang on it.

**Alternatives Rejected**:
- Deciding it here: a large, irreversible, operator-visible deletion the operator did not ask for.

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
