---
title: "Implementation Plan: Notion Record Refinement"
description: "Five legs over the record and property surfaces: empty copy and type size, the option split, the add-property surface, the hidden-group work the 2026-09-06 19:05 rulings opened, and the one row still operator-gated."
trigger_phrases:
  - "065 plan"
  - "record refinement legs"
  - "empty prompt leg"
  - "option split leg"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Notion Record Refinement

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, an Obsidian plugin bundled with esbuild |
| **Framework** | None — Obsidian's own DOM APIs and one root `styles.css` |
| **Storage** | None. Every criterion here is render-time; no persisted shape changes |
| **Testing** | `vitest` for units; `tools/live/*.mjs` computed-style lanes over constructed scenarios; `tools/screenshots` for captures |

### Overview
Five legs, sequenced so the capture baselines settle once rather than four times. Leg A takes the
empty copy on both surfaces plus the one CSS declaration; Leg B switches the option renderer on the
same two consumer groups; Leg C fixes the picker's dropped query and adds the record sheet's
trailing add row, ungated since 2026-09-06 19:05; **Leg E** carries the hidden-group population, its
row grammar and the visibility-list search that the same sitting opened; Leg D is what remains
operator-gated and carries no task row. Every leg's proof is a check observed red before the change.

**Leg E's internal order is not a preference.** The population (T012) lands before the grammar
(T013), because an eye that toggles view visibility inside a group of empty fields toggles nothing a
user asked for. T007's position — "above the hidden group" — also depends on T012, so it queues
there too.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented — `spec.md` §2, §3
- [x] Success criteria measurable — `goal.md` §3 C1-C10, each with a threshold and an observed red
- [x] Dependencies identified — `spec.md` §6; `052`'s picker host and the serialized CSS lane
- [x] ADR-008 taken (operator, 2026-09-06 19:05), so Leg C's second half is schedulable
- [ ] The empty-fields home is owed an ADR before T012 moves the group's population

### Definition of Done
- [ ] C1-C6 and C8-C10 met, each proved by the check that was observed red first
- [ ] C8 landed before C9 and before C6, with the ordering evidenced rather than asserted
- [ ] `npx tsc --noEmit`, `npm run build` and `npx vitest run` all pass, output and exit status read
- [ ] `npm run screenshots:verify` exits 0 and every changed PNG was opened and looked at
- [ ] `npm run gate` exits 0, read from `$?`
- [ ] `acceptance-criteria.md` rows carry evidence, not assertions
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Shared render primitives with per-surface consumers. `record-surface/property-row.ts` owns the row
primitives; `record-detail-panel.ts`, `table-record-peek.ts` and `board-renderer.ts` are the
consumers. This packet's whole shape is *consume the primitive that already exists* rather than
*write a new one*.

### Key Components
- **`getPropertyEmptyPrompt` (`property-row.ts:286-291`)** — the single source of empty-value copy.
  Today it is consumed by the record sheet only, and it covers three formats.
- **`getEmptyDisplayValue` (`board-renderer.ts:754-757`)** — the board card's parallel path, which
  never consults the primitive. C1 makes it a delegation.
- **`renderOptionValue` (`property-row.ts:255`)** — the corrected option renderer, with its contract
  documented above it and zero production consumers. C4 gives it two.
- **`buildAddPropertyRow` (`add-property-row.ts:54`)** — the search-first picker, whose `handle`
  exposes `searchInput` (`:43`, `:108`). C5 reads it; C6 mounts the picker on a new surface.
- **`createProperty` (`column-manager-renderer.ts:180-181`)** — already forwards `initialLabel` down
  to `database-view.ts:5088`. Only the call site at `:200` drops it.

### Data Flow

```
record sheet ──┐                          ┌── getPropertyEmptyPrompt ── i18n
               ├── property-row.ts ───────┤
board card  ───┘   (row shell, value)     └── renderOptionValue ── option tones

picker query ── buildAddPropertyRow ── onSelect ── createProperty(type, label)
                                                        └── database-view.ts:5088 ── modal
```

Today the two dashed halves are broken in one place each: the board card bypasses the first box, and
`onSelect` drops the label before it reaches the second.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Three of the six criteria are fixes to a producer that a second consumer never adopted, so the
same-class-producer inventory is the load-bearing one here.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `getPropertyEmptyPrompt` (`property-row.ts:286-291`) | The empty-copy producer | Extend to the formats with editors (C2) | `rg -n 'getPropertyEmptyPrompt' src/` — two consumers after C1, one today |
| `getEmptyDisplayValue` (`board-renderer.ts:754-757`) | A second, private producer of the same behaviour | Replace with a delegation (C1) | `rg -n 'common\.empty' src/views/` returns no record or card field path |
| `record-detail-panel.ts:515` | The one existing consumer of the prompt | Unchanged | Its rendering is byte-identical before and after C1 |
| `renderPropertyValue` (`property-row.ts:76-101`) | The live option path, filled badges for both kinds | Not a consumer after C4 for single-select | `rg -n 'renderOptionValue' src/` — two production call sites |
| `renderOptionValue` (`property-row.ts:255`) | The corrected path, unconsumed | Becomes the option branch on both surfaces (C4) | `property-row.test.ts` keeps passing; the "Unlisted" path is unchanged |
| `column-manager-renderer.ts:200` / `:201` | The picker's two exits | `:200` forwards the query; `:201` unchanged | Unit test over the wiring, plus `database-view.ts:5088`'s signature |
| `table-record-peek.ts:351` | Consumes `buildPropertyRow` already | Unchanged — the peek is not in any criterion | Its constructed scenario's capture is `pixelHash`-identical |
| `styles.css:10459-10468` (phone label arm) | The 96px column and the 16px input-zoom floor | Unchanged, and asserted unchanged | Computed `font-size` on the phone arm is read in the same lane run as C3 |

Required inventories, run before the first edit:
- Same-class producers: `rg -n 'common\.empty|emptySelectPrompt|emptyMultiSelectPrompt|emptyRelationPrompt' src/`
- Consumers of changed symbols: `rg -n 'getPropertyEmptyPrompt|renderOptionValue|getEmptyDisplayValue|createPropertyOfType' src/ tools/`
- Matrix axes for C1/C2: {record sheet, board card} × {select, multi-select, relation, number, date, datetime, currency, text, files, checkbox} × {en, zh}. The `checkbox` row must stay `false`.
- Invariant for C1: the delegation returns `[prompt]` for `multi-select` and `false` for `checkbox`;
  anything else is the prompt string or the previous value. Adversarial case: a format with no
  prompt must return the previous empty rendering, not the literal `null`.
<!-- /ANCHOR:affected-surfaces -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.

The four legs, and why they are in this order:

- **Leg A — empty copy and type size** (T002, T003, T004). One recapture cycle covers the record
  sheet and the board card, and the two negative controls are the restored word and the unequalised
  label. Depends on nothing. Unblocks the operator's read of `054` AC-004.
- **Leg B — the option split** (T005). The same two consumer groups as Leg A but a different
  primitive. Sequenced after A so the capture baselines settle once.
- **Leg C — the add-property surface** (T006, T007). The wiring fix is two lines and a unit test and
  can land at any time; the trailing row is new DOM on the sheet, needs a constructed scenario and a
  capture entry, and queues behind Leg E's T012 for its position rather than behind a ruling.
- **Leg E — the 19:05 rulings** (T012, T013, T014). The hidden group's population, then its row
  grammar on top of it, then the visibility list's search field. T013 changes
  `HiddenPropertiesGroupHandle.render`'s signature, so the table peek compiles in the same commit.
- **Leg D — what stays operator-gated.** No task row, and after 19:05 it holds two items rather than
  four: the featured line waits on ADR-004's landing, and the cover, icon and "+ Add description"
  strip is **Deferred** by ruling. Each keeps its threshold and red-first check written.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `getPropertyEmptyPrompt`'s new formats; the delegation's array and checkbox shapes; the picker's query forwarding | `vitest` — `property-row.test.ts` and a new case over the column-manager wiring |
| Render assertion | The board card's empty `select` text and its option rendering | `tools/live/render-assertions.mjs`, extended |
| Computed style | Label vs value `font-size` on the desktop arm; the phone arm unchanged | `tools/live/constructed-state-assertions.mjs`, extended |
| Contrast | Every option foreground/background pair after C4 | `tools/screenshots/scan-option-tones.mjs`, already in the gate |
| Touch target | C6's row at or above 44px on the phone sheet | `tools/live/touch-targets.mjs`, extended |
| Capture | The empty-prompt state, the option split, and the add row | `tools/screenshots/constructed-scenarios.mjs` + `npm run screenshots` |
| Manual | The operator's own device read | iOS and desktop, C7 |

**Every one of these starts red.** A lane row added green proves the assertion compiles, not that
the change did anything; each new assertion is committed against the pre-change tree first, or its
red is recorded from a run before the edit.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `052`'s picker host | Internal | Yellow | C6 cannot mount its picker. This is now C6's **only** external precondition — ADR-008 was taken on 2026-09-06 19:05 |
| The parent's serialized `styles.css` lane | Internal | Green | C3 queues behind any other CSS leg; it is one declaration |
| `054`'s `property-row.ts` file group | Internal | Green | Legs are taken one at a time in this file; no two run concurrently |
| `board-renderer.ts` (`056`'s file group) | Internal | Yellow | C1 and C4 touch its card-field path; sequence after any open `056` leg in that file |
| ADR-005 / ADR-006 / ADR-007 / ADR-008 | Operator | **Green — taken 2026-09-06 19:05** | Three Accepted, one Deferred. C6 is unblocked and Leg E exists |
| The empty-fields reveal's new home | Operator | Yellow | T012 moves the hidden group's population; nothing yet says where the empty-fields reveal goes. Owed an ADR before T012 lands, not before it is planned |
| ADR-004's landing | Internal | Red | Leg D's featured line stays unscheduled. This is the designed state, not a blocker to work around |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: any of the three build gates fails, a capture shows a record or card field rendering
  wrongly, or an option pair measures below 4.5:1 after C4.
- **Procedure**: `git revert` the leg's commit. Every leg is one commit and no leg writes data, a
  migration or a persisted shape, so a revert restores the previous rendering exactly.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 (inventories + red baselines) ──► Leg A (T002-T004) ──► Leg B (T005) ──► T009-T011 (verify)
                                   └──► Leg C wiring (T006) ─────────────────────┘
                                   └──► Leg E: T012 ──► T013 ──────────────────────┤
                                                 └──► Leg C row (T007) ────────────┤
                                   └──► Leg E: T014 ───────────────────────────────┘

ADR-004's landing ──► Leg D featured line — unscheduled
ADR-007 (Deferred) ──► Leg D cover / icon / description strip — not scheduled by ruling
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| T001 Setup | None | Every leg |
| Leg A | T001 | Leg B (capture baselines) |
| Leg B | Leg A | T009-T011 |
| Leg C wiring (T006) | T001 | T009-T011 |
| Leg C row (T007) | T012, `052`'s host | T009-T011 |
| Leg E T012 (population) | T001 | T013, T007 |
| Leg E T013 (row grammar) | T012 | T009-T011 |
| Leg E T014 (visibility search) | T001 | T009-T011 |
| Leg D | ADR-004's landing; ADR-007 is Deferred | Nothing here; it is a separate scheduling decision |
| T009-T011 Verification | Leg A, Leg B, T006, T007, Leg E | C7 |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup (inventories, red baselines, scenarios) | Med | 2-3 hours |
| Leg A (C1, C2, C3) | Med | 3-5 hours — the copy for five formats is the slow half, not the mechanism |
| Leg B (C4) | Low | 1-2 hours plus the contrast sweep |
| Leg C wiring (C5) | Low | 1 hour including the unit test |
| Leg C row (C6) | Med | 2-3 hours — new DOM, a scenario and a capture entry |
| Leg E T012 (C8, population) | Med | 2-3 hours — the caller's column set changes, and the empty-fields reveal needs somewhere to go |
| Leg E T013 (C9, row grammar) | High | 4-6 hours — a shared primitive's signature, two consumers, two group states to capture |
| Leg E T014 (C10, search) | Low | 1 hour — the input already exists one file away |
| Verification (gates, captures, evidence rows) | Med | 2-3 hours |
| **Total** | | **18-27 hours**. The 19:05 rulings added 7-10 of that, most of it T013's shared-primitive change rather than the eye control itself |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Red baseline recorded for every new assertion, from a run against the pre-change tree
- [ ] The phone arm's computed `font-size` recorded before C3, to compare after
- [ ] Option pairs measured before C4, so a contrast failure is attributable

### Rollback Procedure
1. `git revert <leg commit>` — one commit per leg, no partial states.
2. `npx tsc --noEmit && npm run build && npx vitest run`, reading each exit status.
3. `npm run screenshots:verify`, then open the restored PNGs and look at them.
4. Record the revert and its reason in `implementation-summary.md`; a reverted leg's criterion goes
   back to unticked with the failure named.

### Data Reversal
- **Has data migrations?** No. Every change is render-time.
- **Reversal procedure**: N/A.
<!-- /ANCHOR:enhanced-rollback -->
