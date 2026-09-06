---
title: "Implementation Plan: Notion Record Refinement"
description: "Four legs over the record and property surfaces: empty copy and type size, the option split, the add-property surface, and the operator-gated rows that stay unscheduled until their rulings land."
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
Four legs, sequenced so the capture baselines settle once rather than three times. Leg A takes the
empty copy on both surfaces plus the one CSS declaration; Leg B switches the option renderer on the
same two consumer groups; Leg C fixes the picker's dropped query and, if ADR-008 lands, adds the
record sheet's trailing add row; Leg D is the operator-gated set and carries no task row until its
rulings are taken. Every leg's proof is a check observed red before the change.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented — `spec.md` §2, §3
- [x] Success criteria measurable — `goal.md` §3 C1-C7, each with a threshold and an observed red
- [x] Dependencies identified — `spec.md` §6; `052`'s picker host and the serialized CSS lane
- [ ] ADR-008 taken, before Leg C's second half is scheduled

### Definition of Done
- [ ] C1-C5 met, each proved by the check that was observed red first
- [ ] C6 met, or recorded unscheduled with ADR-008 still open
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
  capture entry, and is gated on ADR-008.
- **Leg D — operator-gated** (T009). No task row until the ruling. Each item's threshold and
  red-first check are already written, so a ruling converts into a row rather than into a fresh
  investigation.
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
| `052`'s picker host | Internal | Yellow | C6 cannot mount its picker; C6 is gated on ADR-008 regardless |
| The parent's serialized `styles.css` lane | Internal | Green | C3 queues behind any other CSS leg; it is one declaration |
| `054`'s `property-row.ts` file group | Internal | Green | Legs are taken one at a time in this file; no two run concurrently |
| `board-renderer.ts` (`056`'s file group) | Internal | Yellow | C1 and C4 touch its card-field path; sequence after any open `056` leg in that file |
| ADR-005 / ADR-006 / ADR-007 / ADR-008 | Operator | Red | Leg D and C6 stay unscheduled. This is the designed state, not a blocker to work around |
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
T001 (inventories + red baselines) ──► Leg A (T002-T004) ──► Leg B (T005) ──► T008 (gate)
                                   └──► Leg C wiring (T006) ─────────────────┘
                                                    │
                            ADR-008 ──► Leg C row (T007) ──────────────────────┘

ADR-005 / ADR-006 / ADR-007 ──► Leg D (T009) — unscheduled
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| T001 Setup | None | Every leg |
| Leg A | T001 | Leg B (capture baselines) |
| Leg B | Leg A | T008 |
| Leg C wiring (T006) | T001 | T008 |
| Leg C row (T007) | ADR-008, `052`'s host | T008 |
| Leg D (T009) | ADR-005, ADR-006, ADR-007 | Nothing here; it is a separate scheduling decision |
| T008 Verification | Leg A, Leg B, T006, T007 if taken | C7 |
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
| Leg C row (C6, gated) | Med | 2-3 hours — new DOM, a scenario and a capture entry |
| Verification (gates, captures, evidence rows) | Med | 2-3 hours |
| **Total** | | **11-17 hours**, of which 2-3 do not start until ADR-008 |
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
