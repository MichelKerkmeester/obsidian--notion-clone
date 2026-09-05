---
title: "Implementation Plan: Board Anytype Parity"
description: "How the board is taken from a Project Manager 1:1 copy to Anytype's kanban: a capture true-up, a red-first measurement pass, then legs grouped by file."
trigger_phrases:
  - "056 plan"
  - "board anytype parity plan"
  - "kanban rebuild legs"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "authored the leg plan for the board anytype retarget"
    next_safe_action: "Execute T001, the kanban capture true-up"
    blockers:
      - "Legs 2 onward are gated on T001 and T002"
    key_files:
      - "src/views/board-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-plan"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Legs are grouped by file so board-renderer.ts is opened once rather than once per element"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Board Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None — direct DOM construction through Obsidian's `createDiv`/`createEl` helpers |
| **Storage** | Vault markdown frontmatter; no database. The board writes the group property on drop |
| **Testing** | Vitest unit tests under `src/views/*.test.ts`; `npm run gate` for the live lanes; `tools/live/sheet-grammar.mjs` for the phone grammar |

### Overview
The board is rebuilt against Anytype's captured kanban in three movements: an image-capable leaf
reads the 62 kanban capture files px by px and records every value in `design-trueup.md` (T001); a
measurement pass records each acceptance criterion's failing figure on the current tree (T002); then
implementation legs grouped by file replace the Project Manager element vocabulary with the
Anytype-shaped one, add the sticky horizontal scrollbar the captures show and this repository does
not have, and disposition the seven local extensions the 1:1 copy left gated off.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented — `spec.md` sections 2 and 3
- [ ] Success criteria measurable — SC-001 through SC-005 each carry a number
- [ ] Dependencies identified — `045`, `044`, `048`, `050`, `053` and the serialized CSS lane

### Definition of Done
- [ ] All acceptance criteria met, waived by an ADR, or superseded by one
- [ ] `npm run gate` exit 0 read from `$?`, and `sheet-grammar.mjs` 12 surfaces / 31 pairs green
- [ ] Docs updated: `spec.md` migration table complete, `design-trueup.md` written, `checklist.md`
      Today cells filled by T002 rather than after the fix
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Renderer-per-view. `BoardRenderer` owns the board's DOM construction end to end; there is no
component layer between it and the vault data. This packet changes the vocabulary it constructs,
not the pattern it constructs it with.

### Key Components
- **`BoardRenderer` (`src/views/board-renderer.ts`, 2580 lines)**: constructs the whole board —
  strip, columns, headers, cards, covers, drag. The 39 `pm-*` classes are constructed here.
- **`board-card-fields.ts` (118 lines)**: decides which properties render on a card and in what
  order. `045`'s mechanism; kept, its row shape retargeted.
- **`board-card-properties-panel.ts` (188 lines)**: the panel that configures the above. `045`'s
  mechanism; untouched, and its test must stay green unmodified as the guard that it was.
- **`styles.css` board block (180 `db-board` rules, 23 `pm-kanban-*` rules)**: the presentation.
  Edited under the parent's serialized CSS lane.
- **`EmptyStateRenderer` (`empty-state-renderer.ts`)**: already consumed by the board at
  `board-renderer.ts:186`. `055` owns the empty-state component; this packet supplies the board's
  two states (empty column, deleted group relation) through it rather than building a third.

### Data Flow
`render(container, config, groups, groupField, emptyState)` (`board-renderer.ts:222`) receives
grouped rows and a group field, builds the strip, and appends one column per group. A card's
properties come from `board-card-fields.ts`; a cover from `resolveCoverImage`. A drop writes the
group property once for the whole selection, not once per card — `047` section 5 records Anytype
doing the same, so this is a behaviour the port already matches and the retarget must not lose.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

This packet reverses a shipped port, so the surfaces that observe the board's element vocabulary
matter as much as the ones that produce it.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `src/views/board-renderer.ts` | Producer — constructs all 39 `pm-*` classes | update | `grep -o "pm-[a-z-]*" src/views/board-renderer.ts \| sort -u \| wc -l` → 39 today, 0 undispositioned after |
| `styles.css` board block | Producer — 23 `pm-kanban-*` rules, 180 `db-board` rules | update | `grep -o "pm-kanban[a-z-]*" styles.css \| sort -u \| wc -l` → 23 today |
| `src/views/board-renderer-parity.test.ts` | Consumer — asserts the Project Manager parity | update | The assertions re-point to the Anytype reference; a test that still asserts PM parity is a contradiction, not a regression guard |
| `src/views/board-renderer-hierarchy.test.ts` | Consumer — asserts the element hierarchy | update | Follows the new hierarchy |
| `src/views/board-card-fields.ts` + its test | Producer/consumer — `045`'s card properties | update | Row shape changes; the property-selection mechanism does not |
| `src/views/board-card-properties-panel.ts` + its test | Producer — `045`'s config panel | unchanged | The test stays green **without modification**; that is REQ-006's guard |
| `tools/live/sheet-grammar.mjs` | Consumer — the phone grammar and stacking lanes | unchanged | 12 surfaces, 31 pairs, exit 0 after every leg |
| `src/views/calendar-timeline-renderer.ts` and the `pm-gantt-*` set | Not a consumer — but shares `styles.css` and the chip primitives | not a consumer | REQ-009: baseline the `pm-gantt-*` count and gantt capture hashes before leg 1, re-read after the last |

Required inventories:
- Same-class producers: `rg -n 'pm-kanban|pm-chip|pm-avatar|pm-progress' src/views/ styles.css`.
- Consumers of changed symbols: `rg -n 'pm-kanban|boardExtensions|db-board-card-cover' . --glob '*.ts' --glob '*.css' --glob '*.mjs' --glob '*.md'`.
- Matrix axes: layout (desktop / phone) x theme (light / dark) x column state (populated / empty /
  deleted-relation) x card state (with cover / without / dragging). Every axis has a capture or a
  named gap before a value is written.
- Algorithm invariant: a cross-column drop commits **one** property write for the whole selection.
  Adversarial case: a multi-select spanning three columns dropped into a fourth must still produce
  one write, not three.
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
| Unit | Board hierarchy, parity assertions, card field selection and row shape | Vitest (`src/views/board-renderer-*.test.ts`, `board-card-fields.test.ts`) |
| Integration | The full gate — 25 live lanes including the board's own render assertions | `npm run gate`, exit read from `$?` |
| Grammar | The phone board and every sheet it opens: 12 surfaces, 31 stacked pairs | `node tools/live/sheet-grammar.mjs` |
| Capture | Board capture hashes against the pre-leg baseline; any move explained by a named gap | `npm run screenshots:verify` |
| Manual | The operator's own side-by-side against Anytype on iOS and on desktop | Device, operator-owned |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| T001's image-capable leaf | Internal | Red — not yet run | Every geometry value stays owed; no element may be written |
| `050-anytype-adoption/design-trueup.md` | Internal | Green — written, and corrected by four family true-ups | The design read of record; a disagreement resolves to it (`050` ADR-003) |
| `045-board-card-properties` | Internal | Green — shipped on main (`56a34199`) | The card-property mechanism this packet keeps |
| `044` grammar + `048` stacking lanes | Internal | Green — 12 surfaces, 31 pairs | A regression here blocks the leg, not the packet |
| Parent serialized CSS lane | Internal | Yellow — shared with `051`, `052`, `055` | Legs queue rather than conflict |
| `053-toolbar-and-view-controls` | Internal | Yellow — implementation landing | A board settings row is asked of `053`, not built twice |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the gate goes red and stays red after one bounded repair pass; or the gantt capture
  hashes move without a named gap; or `board-card-properties-panel.test.ts` needs modification to
  pass, which means `045`'s mechanism was broken rather than retargeted.
- **Procedure**: the work is landed leg by leg on `worktrees/117-phases-056-057` and its
  successors; revert the last leg's commit, rerun the gate, and re-read the exit status from `$?`.
  Nothing here migrates data, so a revert is complete.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 capture true-up ──► T002 red-first measurement ──┬──► Leg A (renderer vocabulary)
                                                      ├──► Leg B (card + properties)
                                                      ├──► Leg C (stylesheet)
                                                      └──► Leg D (extensions disposition)
                                                              └──► Leg E (verification)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| T001 true-up | The capture set on disk | Every leg |
| T002 measurement | T001 | Every leg |
| Leg A renderer | T001, T002 | Leg B, Leg C |
| Leg B card + properties | Leg A | Leg E |
| Leg C stylesheet | Leg A, the CSS lane | Leg E |
| Leg D extensions | T001 (which of the seven have counterparts) | Leg E |
| Leg E verification | A, B, C, D | The operator row |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Med | T001 is the cost: 62 capture files read px by px by an image-capable leaf |
| Core Implementation | High | Four legs over a 2580-line renderer and a 180-rule stylesheet block |
| Verification | Med | Gate, grammar lane, capture hashes, and the gantt no-move check |
| **Total** | | Dominated by T001; no leg starts before it lands |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Baseline captured: `pm-*` count, `pm-gantt-*` count, board and gantt capture hashes
- [ ] The CSS lane is held for the leg that touches `styles.css`
- [ ] `sheet-grammar.mjs` green before the leg, so a red after it is attributable

### Rollback Procedure
1. Stop landing legs; the board's previous vocabulary is whole in the previous commit.
2. `git revert` the leg's commit on the worktree branch, or reset the branch to the last green leg.
3. Rerun `npm run gate` and `node tools/live/sheet-grammar.mjs`, reading each exit from `$?`.
4. Record the revert and its reason in `implementation-summary.md`; a silent revert leaves the next
   session to rediscover the same wall.

### Data Reversal
- **Has data migrations?** No. The board writes an existing group property on drop and this packet
  does not change what it writes.
- **Reversal procedure**: N/A
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  T001        │────►│  T002        │────►│  Legs A-D    │
│  true-up     │     │  red-first   │     │  by file     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │  Leg E       │
                                          │  verify      │
                                          └──────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| T001 true-up | The 62 kanban capture files | `design-trueup.md`, section 4's filled table | T002, A, B, C, D |
| T002 red-first | T001 | Every `checklist.md` Today cell | A, B, C, D |
| Leg A renderer | T001, T002 | Anytype element vocabulary in `board-renderer.ts` | B, C |
| Leg B card | A | Retargeted property rows; `045` mechanism intact | E |
| Leg C stylesheet | A, CSS lane | The board block, sticky scrollbar included | E |
| Leg D extensions | T001 | Seven dispositions, none default-off | E |
| Leg E verify | A, B, C, D | Gate green, grammar green, gantt unmoved | The operator row |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **T001 capture true-up** — the whole packet is gated on it — CRITICAL
2. **T002 red-first measurement** — no criterion may be claimed without its failing figure — CRITICAL
3. **Leg A, the renderer vocabulary** — every other leg reads the element names it produces — CRITICAL
4. **Leg E, verification** — gate, grammar, capture hashes, gantt no-move — CRITICAL

**Total Critical Path**: T001 → T002 → A → E. B, C and D hang off A and do not extend it.

**Parallel Opportunities**:
- Leg B (card and properties) and Leg D (extensions disposition) can run simultaneously once A lands.
- Leg C (stylesheet) waits on the CSS lane rather than on B or D, so it queues independently.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | The capture read exists | `design-trueup.md` written; 13 of 13 anatomy elements carry a measurement or a labelled inference; no migration-table cell reads `unknown` | After T001 |
| M2 | Every criterion has a red | Each `checklist.md` Today cell holds a figure read off the current tree, not a mechanism | After T002 |
| M3 | The board is Anytype-shaped | `pm-*` 39 → 0 undispositioned; sticky scrollbar present; extensions 7 → 0 default-off | After Leg D |
| M4 | The gate is green and the gantt did not move | `npm run gate` exit 0 from `$?`; grammar 12/31; `pm-gantt-*` count and gantt hashes unchanged | After Leg E |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

The full records live in `decision-record.md`. ADR-001 is summarised here because it is the reason
this packet exists.

### ADR-001: The board's parity target moves from Project Manager to Anytype

**Status**: Accepted (2026-09-05 ~22:45, operator)

**Context**: `038-board-kanban-port` copied Project Manager's board 1:1 on the operator's
2026-09-04 ruling and shipped it in 0.0.16 through 0.0.20. The operator has since seen Anytype and
replaced the target for the board and the calendar, while keeping it for the gantt.

**Decision**: the board is rebuilt against Anytype's captured kanban. The gantt is not.

**Consequences**:
- `038`'s shipped 1:1 board is superseded rather than deleted; its record stays as history.
- `047`'s T012-T014 align-closer pass narrows to the gantt.
- Anytype has no timeline layout, so the gantt has no reference to move to — which is the reason
  the split is coherent rather than arbitrary.

**Alternatives Rejected**:
- Move the gantt too: rejected by the operator's own clarification, and impossible besides — there
  is no Anytype timeline to port from.

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
