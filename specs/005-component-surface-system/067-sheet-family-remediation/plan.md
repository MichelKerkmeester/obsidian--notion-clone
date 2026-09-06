---
title: "Implementation Plan: Sheet Family Remediation"
description: "How the sheet family closes: one leg per file group, the P0 moves before the P1 values, the constants bridge before the numbers that depend on it, and one recapture rather than four."
trigger_phrases:
  - "067 plan"
  - "sheet family remediation plan"
  - "leg sequencing"
  - "constants bridge"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Sheet Family Remediation

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, an Obsidian plugin; one bundled `styles.css` |
| **Framework** | None. Obsidian's `Modal` is the host chrome; everything else is ours |
| **Storage** | None — no data model change in this packet |
| **Testing** | Vitest for units; `tools/live/sheet-grammar.mjs` for the live grammar lane on Chrome and WebKit; `tools/screenshots/` for the permanent capture corpus; `npm run gate` as the authority |

### Overview
Sixteen rows in four legs, grouped by file rather than by surface (`051` D7). The two navigation
moves with no producer come first, because they are the only adopted Anytype patterns with nothing
behind them at all. The constants bridge comes before the numeric rows that depend on it, so those
rows change one declaration rather than two. The scrim moves once, with its recapture, rather than
being nudged across three legs.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented — `spec.md` §2, §3
- [x] Success criteria measurable — eleven thresholds in `acceptance-criteria.md`, each with a
      `file:line` red-first anchor observed on the tree at `6b16b87a`
- [x] Dependencies identified — `spec.md` §6; the one blocking dependency is ADR-004, the operator's

### Definition of Done
- [ ] Every `acceptance-criteria.md` row `Met`, `Waived` with an ADR or `Superseded` with an ADR,
      except AC-011 which is the operator's
- [ ] `npx tsc --noEmit` 0, `npm run build` 0, `npx vitest run` 0, `npm run gate` exit 0 read from
      `$?` without a pipe, `npm run replay` reversed 0 — output and exit status **read**, not assumed
- [ ] Every negative control observed **red** before its green, recorded with the failing figure
- [ ] `spec.md`, `plan.md`, `tasks.md`, `goal.md` and `decision-record.md` reconciled against what
      actually landed
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
One composition primitive with two presentations, over a per-document overlay registry. `051` built
it; this packet finishes wiring the decisions into it.

### Key Components
- **`createSurfaceShell` (`surface-shell.ts`)**: owns presentation resolution, chrome, header,
  placement, keyboard reposition and teardown in one order. It has **one** production consumer
  (`db-modal.ts:122`); eleven other surfaces call `buildShellHeader` directly and re-assemble the
  rest, which is `051` goal §1's "four decisions in four files" persisting inside the migrated files.
- **`overlayStack` (`overlay-stack.ts`)**: registration, depth derivation, LIFO dismissal, focus
  restoration. Depth-to-z is monotone and verified; the cap and the focus anchor are what it lacks.
- **`attachSheetChromeToModal` (`mobile-bottom-sheet.ts`)**: handle, header, scrim, placement,
  drag-to-dismiss, portal mount. The one function every `DbModal` subclass and all three suggest
  modals route through.
- **`popover-host.ts`**: the picker and menu family, and where the `menu`-role card lands.
- **`tools/live/sheet-grammar.mjs`**: 14 registered surfaces, 32 registered pairs, and the place a
  threshold becomes permanent.

### Data Flow
A surface declares a role and a title, `DbModal.applyPresentation` resolves the presentation through
`createSurfaceShell`, the shell composes chrome through `attachSheetChromeToModal`, and the sheet
**portals to `body`** wearing a `note-database-container` stand-in class. That portal is the standing
risk: every `.db-*` selector is scoped `.note-database-container`, so **any rule that misses the
stand-in renders unstyled on the portalled sheet** — the mechanism behind several "looked like the
old ones" reports. The portal exists because inside the workspace leaf a sheet resolves `bottom: 0`
72–80px short of the screen, depending on the host's floating navbar; that was measured twice
independently and is recorded here so no leg re-derives it.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Use this section when `research_intent=fix_bug`, when planning from a deep-review FAIL/CONDITIONAL verdict, or when any finding touches security, path handling, env precedence, schema boundaries, persistence, public responses, or shared policy.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `overlay-stack.ts` `register` / `getDepth` | Producer: derives parent and depth for every surface | update — the sheet-scoped cap | `rg -n "getDepth\|register\(" src/views/overlay-stack.ts`; lane rows on both converting pairs plus a menu-stack control |
| `surface-shell.ts` push/pop stack | Producer: the replace move's title and back control | update — gains the body producer | `surface-shell.test.ts`'s pure-data assertions extended; the two pairs assert replace |
| `surface-shell.ts` `role` | Producer: declared, exposed, read by nothing | update — the presentation path reads it | `rg -n "role" src/views/surface-shell.ts` returns a consumer, not only the declaration |
| `popover-host.ts` `mountPickerSheetHeader` | Consumer: mounts the shell header on a phone sheet | update — the `menu` branch drops the handle, keeps the close | Grammar column on handle absence, with a reintroduce-the-handle control |
| `styles.css` `.db-mobile-sheet-scrim` | Producer: the one dim | update — measured band | Scrim lane sampling three-band luminance; 32 protected captures identical |
| `styles.css` `.is-stack-parent` | Producer: the second and third dim mechanisms | update or disposition — ADR-003 | The composite measured, not the declarations |
| `surface-shell.ts` `SHELL_*` constants | Producer: six correct values with no consumer | update — bridged, plus a drift check | A deliberate disagreement takes the check red |
| `main.ts` / the two suggest modals | Consumers: hand-rolled chrome composition | update or disposition — ADR-004 | `rg -n "attachSheetChromeToModal\(" src/ --type ts` against the baseline of three |
| `tools/live/sheet-grammar.mjs` | Consumer: the permanent assertions | update — new computed-value rows, three surfaces registered, the gap cap re-derived | `node tools/live/sheet-grammar.mjs`; exit 0 and the row count |
| `tools/screenshots/constructed-scenarios.mjs` | Consumer: the permanent capture corpus | update — depth-3 and replace scenarios | `node tools/screenshots/verify.mjs` current |
| `db-modal.ts` `getSheetTitle` / `mobile-bottom-sheet.ts` `resolveTitle` | Two scrape chains that must stay in sync | update — one survives | `rg -c "protected getDeclaredTitle\(\)" src/ --type ts` against the subclass count |
| `044` / `048` contracts | Constraints, not deliverables | unchanged — must still pass | 14 surfaces / 32 pairs green after every leg |

Required inventories, run before the leg that touches each:
- Same-class producers of a dim: `rg -n "opacity|scrim|is-stack-parent" styles.css`.
- Consumers of the changed constants: `rg -n "SHELL_ENTER_MS|SHELL_EXIT_MS|SHELL_PHONE_ROW_HEIGHT_PT|SHELL_PHONE_HEADER_HEIGHT_PT|SHELL_PRIMARY_ACTION_HEIGHT_PT|SHELL_TRAILING_CHIP_SIZE_PT" . --glob '*.ts' --glob '*.mjs' --glob '*.md'`.
- Matrix axes for the cap: depth × surface kind (sheet / menu) × document (main / popped-out). Six
  rows, and the menu column is the one that must not move.

Required inventories:
- Same-class producers: `rg -n '<field|string|helper|literal|error-pattern>' <module-or-files>`.
- Consumers of changed symbols: `rg -n '<changedSymbol>|<changedConstant>|<changedPublicField>' . --glob '*.ts' --glob '*.js' --glob '*.md'`.
- Matrix axes: list every independent input axis and the required rows before implementation.
- Algorithm invariant: for path/redaction/parser/resolver/security fixes, state the invariant and adversarial cases.
<!-- /ANCHOR:affected-surfaces -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the phase checkboxes and task state.

**Four legs, grouped by file (`051` D7):**

| Leg | Rows | File group | Why here |
|-----|------|-----------|----------|
| **Leg 1 — settle** | T001-T003 | documents plus two measurements | Nothing is written until the row 26 / row 31 disagreement is settled, the scrim baseline is recorded, and the handle contrast has a number. Two of the three are measurements, not decisions |
| **Leg 2 — the moves** | T004-T010 | `overlay-stack.ts`, `surface-shell.ts`, `popover-host.ts`, `styles.css` | The cap and the replace move are one mechanism and land together; the menu card and the scrim are the two visible ones. One recapture at the end of the leg, not four |
| **Leg 3 — the values** | T011-T016 | `surface-shell.ts`, `styles.css`, `sheet-grammar.mjs` | The bridge (T011) goes first so every numeric row after it changes one declaration rather than two |
| **Leg 4 — harness and read** | T017-T023 | `sheet-grammar.mjs`, `constructed-scenarios.mjs`, then the device | The harness rows are independent of each other and mostly `[P]`; the device read is last and is the operator's |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | The cap's decision function, the sub-page stack as pure data, the constants' drift check, focus restoration | Vitest |
| Live grammar | Every registered surface and pair, on **both** engines, asserting computed values | `tools/live/sheet-grammar.mjs` |
| Capture | Permanent scenarios mounting **real** subclasses through the **real** chrome path, `pixelHash`-compared | `tools/screenshots/constructed-scenarios.mjs`, `verify.mjs` |
| Placement | Keyboard-aware reposition against a 331px keyboard, both a host-declared inset and a `visualViewport` shrink | `tools/storybook/verify-placement.mjs` |
| Manual | AC-011 only — the four device-only behaviours no harness reaches | The operator's own iOS build |

**Three rules every new assertion inherits**, each of them a scar rather than a preference:

1. **Assert a computed value, never a presence** (goal D3). `hasSheetHeader` accepts either header
   shape and `hasSheetHandle` sees existence only, so the lane is currently green over divergences
   it cannot see.
2. **Wait for rest, not for frames.** In the row-59 era a WebKit run held the filter sheet's top at
   556 while its bottom sat at 733 on a 660px screen — mid-placement — so the lane's tap landed on
   the scrim and dismissed the surface. Wait on the settle signal the sheet module publishes
   (`readSheetFrameShapeActivity`, `mobile-bottom-sheet.ts:346-361`).
3. **Every column gets its own injection control.** The row-59 leg found two latent defects in its
   own harness that way: a chrome capture that took `modalEl.parentElement` unconditionally, and a
   background column that went green on two transparent boxes.

**Known harness limits, so nothing is claimed past them:** `host-modal-stand-in.ts:44-48` states its
40px title and 32px close "stand in for" Obsidian's host CSS, approximated rather than measured, so
the operator's absolute ~200px device band is **not reproducible headless** — the relative assertions
verify the mechanism. `env()` resolves to 0 in every headless run, so the safe-area check stays a
literal-term check; a synthetic override would assert the harness, not the sheet.
`verify-placement.mjs` reads **402/403**, and 402/403 is the healthy signature — 401 or 403 is the
signal.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| ADR-004, the FuzzySuggest disposition | Operator | Red | T008 only. Nothing else waits on it; T009's registration lands under either option |
| `051`'s `surface-shell.ts` / `mobile-bottom-sheet.ts` | Internal | Yellow | A concurrent leg holding either file blocks Legs 2 and 3. Sequence rather than race |
| `styles.css` CSS lane | Internal | Yellow | Serialized by the parent. Every leg here touches it |
| The row 26 / row 31 reading | Internal | Yellow | T006's parent clause. The handle clause can land without it |
| `051/design-trueup.md` | Internal | Green | The measured baseline; read, not re-derived |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: any registered surface or pair going red and staying red; a protected Project Manager
  capture moving `pixelHash`; `npm run gate` non-zero from the final state.
- **Procedure**: each leg is one commit range against a rebased branch, so a revert is per leg. The
  two legs with a wide blast radius are named: the scrim (every mobile capture moves with it) and the
  menu card (every `menu`-role surface moves at once). Revert those as a unit including their
  recapture, never the code alone — a reverted stylesheet against a kept manifest is a corpus that
  disagrees with the tree.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Leg 1 (settle) ──► Leg 2 (the moves) ──► Leg 4 (harness) ──► T023 (device)
                          │                     ▲
                          └──► Leg 3 (values) ──┘
```

| Leg | Depends On | Blocks |
|-----|------------|--------|
| Leg 1 — settle | None | Legs 2 and 3 |
| Leg 2 — the moves | Leg 1 (T001, T002) | Leg 4's T020 |
| Leg 3 — the values | Leg 1 (T003) | Leg 4 |
| Leg 4 — harness | Legs 2 and 3 | T023 |
| T023 — device | Everything | Closure |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Leg | Complexity | Estimated Effort |
|-----|------------|------------------|
| Leg 1 — settle | Low | 2 measurements and one document read |
| Leg 2 — the moves | High | The cap, the replace producer, the menu card, the scrim, plus one full mobile recapture |
| Leg 3 — the values | Medium | The bridge, then five numeric rows that each change one declaration |
| Leg 4 — harness and read | Medium | Five mostly-parallel harness rows, then the operator's sitting |
| **Total** | | **~1100 LOC across ~20 files**, per the level scoring in `spec.md` §9 |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] N/A — no data changes, so no backup
- [ ] N/A — this repository ships no feature flags; a leg is reverted, not disabled
- [ ] The capture corpus is current before the leg lands, so the diff after it is readable

### Rollback Procedure
1. Revert the leg's commit range, code and recapture together.
2. Re-run `npm run gate` and read `$?` without a pipe.
3. Re-run `node tools/screenshots/verify.mjs` and confirm the corpus is current again.
4. Record the revert in `tasks.md` on the row it undoes, with the failing figure — a reverted leg
   that leaves no record is a leg the next session will re-attempt identically.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A. Nothing here writes user data or changes a stored shape.
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Phase 1   │────►│   Phase 2   │────►│   Phase 3   │
│   Setup     │     │    Core     │     │   Verify    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                    ┌─────▼─────┐
                    │  Phase 2b │
                    │  Parallel │
                    └───────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| Depth cap (T004) | None | A sheet cap in `register` | T005, T020 |
| Motion band (T012) | T011 | 200/150ms behind one constant | The lane row at `sheet-grammar.mjs:182`, which pins 260ms and goes red on the fix |
| Replace producer (T005) | T004 | The two converting pairs become expressible | T020 |
| Menu card (T006) | T001 | A role-driven phone presentation | — |
| Scrim (T007) | T002 | One dim at the measured band | The mobile recapture |
| Constants bridge (T011) | None | One source of truth | T012, T013, T014, T015 |
| Lane rows (T009, T013-T015, T017) | Their producers | Permanent computed-value assertions | T022 |
| Device read (T023) | Everything | AC-011, and `044`/`048`/`051`'s device rows with it | Closure |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **T001** settle the parent-dim reading — CRITICAL, blocks the menu card
2. **T004 → T005** the cap, then the replace producer — CRITICAL, the only adopted move with no
   producer at all
3. **T020** photograph the replace pairs — CRITICAL. The depth-3 half closed on `main` at
   `ae4fff81`, and those captures are this packet's strongest evidence for T005: the middle child is
   fully buried in all three chains
4. **T022 → T023** the gate, then the device read — CRITICAL, and the second is the operator's

**Total Critical Path**: Leg 1 → Leg 2 → Leg 4 → the operator's sitting.

**Parallel Opportunities**:
- T002 and T003 are measurements and run beside T001.
- Leg 3 runs beside Leg 2 **only if** the two legs do not both hold `surface-shell.ts`; under D7
  they do, so in practice Leg 3 follows Leg 2 on that file and its `styles.css` rows can interleave.
- T009 does not wait on T008. The registration hole exists under either disposition.
- T017, T018, T019 and T021 are independent of each other.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Settled | ADR-002's parent clause has an answer with a capture beside it; the scrim baseline and the handle contrast are recorded | Leg 1 |
| M2 | Every adopted move has a producer | AC-001 and AC-002 `Met`; depth-3 sheet count 0; no handle on a `menu` role | Leg 2 |
| M3 | One source of truth | AC-006 `Met`; a deliberate constant disagreement takes a check red | Leg 3 |
| M4 | Nothing green over a divergence it cannot see | AC-005, AC-007, AC-008, AC-010 `Met`; every new row asserts a computed value with its control observed red | Leg 4 |
| M5 | Read on a device | AC-011, and `044` AC-006 / `048` AC-009 / `051` AC-010 with it, against one build | The operator |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

The decisions live in `decision-record.md`, in full, and are summarised here so a reader of the plan
does not have to open it to know what is still open.

| ADR | Decision | Status |
|-----|----------|--------|
| ADR-001 | The depth cap is enforced in `overlayStack.register`, scoped to sheets, with the shell owning the replace | Proposed |
| ADR-002 | A `menu` role presents as a handle-less anchored card; the 44px close **stays** | **Accepted** on the close (ADR-007 **E1** decided it); **Proposed** on the parent-dim clause, because `design-trueup.md` rows 26 and 31 disagree |
| ADR-003 | One dim at the measured band; the `scale(0.96)` pull-back is dispositioned rather than left design-inferred | Proposed |
| ADR-004 | The three `FuzzySuggestModal` surfaces: route through the shell, or one shim | Proposed — **the operator's**, carried from `051` T010 |

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
