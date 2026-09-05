---
title: "Implementation Plan: States, Feedback and Motion"
description: "Four component legs and two 050-item legs, each opened once, each closed on a threshold observed red first, with the board/gantt parity and the sheet grammar as constraints."
trigger_phrases:
  - "055 plan"
  - "states feedback plan"
  - "toast plan"
  - "motion leg"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: States, Feedback and Motion

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

Seven state families, four shared components, no new architecture layer — every deliverable lands
in an existing renderer, an existing modal, or the token block the stylesheet already declares.
The measure of the phase is subtraction: after it, `db-chart-empty` is gone, two undo shapes are
one, and 78 hand-typed durations read tokens.

### Overview

Six legs. L1-L4 are the components (toast, confirm, empty-state, motion); L5-L6 are the 050 items
that are not component work but state behaviour (menus, scroll+load-more). `styles.css` is the one
file more than one leg reaches; the parent's serialized CSS lane owns it. Every leg's threshold is
measured red on the current tree before its code lands (goal D2).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- The leg's threshold from `acceptance-criteria.md` has been run on the current tree and observed
  failing, with the measured figure in that row's Verification cell (T001 wrote them there on
  2026-09-05; `design-trueup.md` carries the reading) and the leg's red-then-green recorded in
  `checklist.md` as it lands.
- The leg's phone expression is stated, or its absence is stated with a reason (050 goal D3's
  discipline, carried).
- Any capture the leg's design depends on is named in the task's own Capture field and in
  `design-trueup.md` §3, or the gap is named there. Four rows have no capture on either platform —
  `empty.deleted-relation`, `loading`, `error` and `destructive.confirm` — and each says so.

### Definition of Done
- The threshold passes; the negative control was observed red after the row went green.
- The leg's lane row is permanent and green; `npm run gate` exits 0 read from `$?`.
- Any phone surface the leg added or changed passes all seven `044` grammar elements.
- Any leg touching `board-renderer.ts`'s render path recaptures the `screenshots/project-manager/`
  board reference and proves `pixelHash` unchanged (goal D4).
- Any leg changing what a scenario renders recaptures that scenario and the changed PNGs were
  opened and read (screenshot-currency rule).
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Additive, per component. `toast.ts` is a new module consumed through one export;
`EmptyStateRenderer` grows two reasons and absorbs chart's; `ConfirmModal` gains a header behind
its unchanged `confirmWithModal` signature; motion tokens join the existing `--db-*` block and
call sites are migrated by file. Nothing introduces a new mounting mechanism — the toast mounts
through `document.body` carrying `.db-surface` (the owned-menu precedent, `owned-menu.ts:56`), and
the confirm keeps presenting through `DbModal`'s declared presentation (`db-modal.ts:56`).

### Key Components
- **Toast** — one component, severity + optional action, `role="status"`, auto-dismiss on success
  and sticky-until-acted on error; `showOperationResult` and the selection-bar undo become
  placements of it.
- **Confirm primitive** — same class, same promise-based API; `createSheetHeader` inside
  `onOpen`; stacked-pair registration under `048`'s model.
- **Empty state** — `no-source` and `deleted-relation` join the reason union; `getEmptyStateReason`
  gains the source-missing branch; chart's `ChartEmptyReason` maps onto the shared component.
- **Motion tokens** — five tokens in the `--db-*` block, measured against `anytype-ts` source and
  reconciled with our established values in ADR-005; the reduced-motion reset names every new
  consumer in the same change. Anytype ships **no** reduced-motion rule, so that half is ours
  alone.
- **View state** — one scroll-offset field, written on switch-away, restored on return.
- **Capability gate** — one predicate over the selection, one fallback row, two caps.

### Data Flow

View state → renderer → component. Nothing new is persisted except the per-view scroll offset; a
view without one behaves exactly as today. Toast state is ephemeral and never persisted.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## AFFECTED SURFACES

| Leg | Files | Content | Threshold source |
|-----|-------|---------|------------------|
| L1 | `src/views/toast.ts` (new), `src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`, `styles.css` | Toast component; `notice.galleryMigrated` gains its Undo; `notice.deletedRow` routed; rail + bar undo unified | AC-055-1, AC-055-2 |
| L2 | `src/views/empty-state-renderer.ts`, `src/views/chart-renderer.ts`, `src/views/database-view.ts`, `styles.css` | `no-source` + `deleted-relation` flavours; chart absorption | AC-055-5, AC-055-6 (050 AC-009) |
| L3 | `src/views/modals/confirm-modal.ts`, `styles.css` | `044` grammar on the confirm sheet; `048` stacked-pair registration | AC-055-3, AC-055-4 |
| L4 | `styles.css` | Motion tokens (`--db-motion-surface` is **200ms**, not 180ms — ADR-005) plus `--db-motion-scale-from: 0.98`; migrated durations in the legs' own files, the three `180ms` literals included; reduced-motion reset extension | AC-055-7, AC-055-8 |
| L5 | `src/views/row-menu.ts`, `src/views/bulk-edit-field-menu.ts` | Capability gate, never-empty fallback, caps (050 REQ-008) | AC-055-9 (050 AC-008) |
| L6 | `src/views/view-state-store.ts`, `src/views/embedded-database-renderer.ts` | Scroll restore (050 REQ-005); "Load more" row (050 REQ-014) | AC-055-10 (050 AC-005), AC-055-11 (050 AC-014) |

**Why the notice migration is bounded.** 247 `new Notice` call sites exist. L1 migrates the sites
this phase owns: the migration notice whose text promises Undo (`database-view.ts:2744`,
`embedded-database-renderer.ts:764`), the delete confirmations (`database-view.ts:8314`,
`embedded-database-renderer.ts:3208`), and the sites `showOperationResult` and the selection bar
already own. The residue is named here as follow-up work with the component + pattern as the
deliverable — not folded into this phase to chase a sweep across 18 files.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:testing -->
## 4. TESTING STRATEGY

- **Red first, per threshold.** Measured on the current tree from source evidence, recorded in
  `checklist.md`, before the code exists.
- **Negative control per row.** After green, the mechanism is removed or inverted and the row must
  go red again — e.g. collapsing the two empty flavours, deleting the toast's action slot, removing
  a motion token's reset entry.
- **Unit** where behaviour is pure: the capability predicate and its caps, the scroll-offset
  arithmetic, `getEmptyStateReason`'s extended precedence.
- **Lane rows** where behaviour is rendered: `sheet-grammar` rows for the confirm sheet, the
  constructed-capture scenarios for the new empty states, the toast read in a constructed mount.
- **Reference parity** for any leg that could move the board: recapture and `pixelHash` compare
  against the pre-phase baseline (goal D4).
- **Screenshot currency:** every changed or new rendered state gets its scenario registration in
  the same change, and the changed PNGs are opened and read (`repo-rules/screenshot-currency.md`).
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 5. DEPENDENCIES

- `050-anytype-adoption` — REQ-005/008/009/014, thresholds quoted verbatim; consumed, not reopened.
- `044-phone-sheet-alignment` — the seven grammar elements and the `sheet-grammar` lane.
- `048-stacked-sheets` — the stacking model and the stacked-pair registry the confirm joins.
- `design-system.md` — role vocabulary, token snapshot, row grammar; the motion tokens extend its
  token block.
- `047-competitor-references-and-pm-alignment` — §9/§10 findings and the capture index, cited per
  pattern in `state-feedback-vocabulary.md` §3. **Its §10 motion finding is superseded** by the
  source read in `design-trueup.md` §2 (ADR-005).
- `specs/context/anytype-ts/src/scss/` — the motion source. Motion is invisible in a still, so
  every duration, easing and scale in this packet is a `file:line` read, never a capture.
- `../050-anytype-adoption/design-trueup.md` — the method, and the binding restatements for items
  5, 8, 9 and 14 (ADR-004).
- `specs/007-gallery-view-deprecation` — the gallery retires; inheritance only (goal D7).
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 6. ROLLBACK PLAN

Every leg is independently revertible: one leg touches one file group, so reverting a leg restores
the prior surface without touching the others. The toast is the widest-blast-radius leg (its
callers span three files); its rollback restores `new Notice` at exactly the migrated sites. The
motion tokens are additive; a revert leaves the migrated literals reading a missing token only if
the literal migration is also reverted — so L4's commit carries token + migration together.

### Data Reversal
- **Data migrations?** One: the per-view scroll offset in view state. A view saved without the
  field renders exactly as today; removing the code leaves stored views readable. No frontmatter,
  no database schema, nothing irreversible.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Leg | Depends on | Why |
|-----|-----------|-----|
| L1 | T001 | The toast's action contract is what makes the migration notice's Undo deliverable |
| L2 | T001 | The two new flavours need their red-first measurement first |
| L3 | T001 | The confirm's grammar row needs its 0-of-7 figure recorded first |
| L4 | L1-L3 | Tokens are consumed by the components; introducing them first would leave nothing reading them green |
| L5 | T001 | The caps are unit-tested; the fallback row needs the red menu first |
| L6 | T001 | Scroll restore and Load more are independent of every component leg |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Leg | Estimated LOC | Note |
|-----|---------------|------|
| T001 | ~560 (doc) | `design-trueup.md`, the measured true-up; figures written into `acceptance-criteria.md` |
| L1 | ~220 | Component + callers + CSS |
| L2 | ~160 | Two flavours + chart absorption |
| L3 | ~80 | Header + registration |
| L4 | ~150 | Tokens + migrated literals + reset |
| L5 | ~120 | Predicate + caps + fallback |
| L6 | ~110 | Store field + Load more row |
| **Total** | **~940** | Against the 900 the level was scored on |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```text
T001  red-first measurements
 |
 +--> L1  toast                      (REQ-055-1, REQ-055-2)
 +--> L2  empty-state + chart        (REQ-055-5, REQ-055-6)
 +--> L3  confirm grammar            (REQ-055-3, REQ-055-4)
 +--> L5  capability gate            (REQ-055-9)
 +--> L6  scroll + load-more         (REQ-055-10, REQ-055-11)
 |
 +--> L4  motion tokens              (REQ-055-7, REQ-055-8) — last; consumes L1-L3's surfaces
```

| From | To | Kind |
|------|----|------|
| T001 | L1-L6 | Blocking (goal D2) |
| L1-L3 | L4 | Sequential — tokens land with their consumers |
| `044` | L3 | Contract consumed unchanged |
| `048` | L3 | Contract consumed unchanged |
| `050` | L2, L5, L6 | Requirements quoted; 050 stays the requirement set (goal D3) |
| `038`/`037` parity | L2 | Constraint — recapture before the leg closes |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Content | Gate |
|-----------|---------|------|
| M1 | `design-trueup.md` written and every threshold's red figure recorded in its `acceptance-criteria.md` cell | No leg starts before its figure exists — **met 2026-09-05** |
| M2 | L1-L3, L5, L6 green with controls seen red | `npm run gate` exits 0 |
| M3 | L4 landed; token census reconciled; reduced-motion test extended | Gate 0; no untokenized duration in touched files |
| M4 | Operator reads the states on device | The operator's own words; not tickable by an agent |
<!-- /ANCHOR:milestones -->

---

<!-- ANCHOR:phase-adr -->
## L3: ARCHITECTURE DECISION RECORD

### ADR-055-1: One toast with an action slot; the inline rail and the bar's undo become placements

**Status**: Proposed

**Context**: Feedback exists in three shapes: raw `Notice` (247 sites, no action), a per-view
result rail (`database-view.ts:9433-9437`), and a selection-bar undo button (`database-view.ts:7719`). Any replacement
that deleted the rail would lose its inline placement next to the operation it reports.

**Decision**: One toast component with severity and an optional action. The rail and the bar's
undo are placements — the rail keeps its position, the bar keeps its button — but both render the
component and share its timer, announcement and motion contracts.

**Consequences**:
- Positive: the action slot is the feature; one place to fix announcement, timing or reduced motion.
- Negative: three consumers must agree on one API. Mitigation: the API is two fields of state plus
  one optional action callback — smaller than any of the three shapes it replaces.

**Alternatives rejected**: a second inline rail component (preserves placement, keeps three
contracts); Notice extension via Obsidian's fragment API (no severity, no token boundary, no
reduced-motion story).

### ADR-055-2: The confirm keeps its API and gains the grammar inside

**Status**: Proposed

**Context**: 19 callers type `confirmWithModal(app, {...})`. Changing the signature to thread
presentation would fork 19 call sites for a change only the component should own.

**Decision**: the signature is unchanged; `onOpen` calls `createSheetHeader` with the options'
title, and the sheet/stack behaviour follows `DbModal`'s existing declaration.

**Consequences**:
- Positive: every destructive flow conforms in one place; `048`'s M-4 row closes without touching
  a caller.
- Negative: a caller cannot opt out of the header. Accepted — the operator's "header everywhere"
  ruling (`roadmap.md` §6A) is exactly that there is no opting out.

**Alternatives rejected**: a `ConfirmSheet` parallel class (two confirm paths, the thing `048`
exists to end).

### ADR-004 and ADR-005 live in `decision-record.md`

Two further decisions were taken at T001 and are recorded in full in `decision-record.md`, which is
this packet's ADR authority; they are named here so the set is discoverable from the plan.

- **ADR-004** — the four `050`-inherited thresholds bind at their restated figures, not their
  originals. `acceptance-criteria.md` AC-009 and AC-011 cite it; before T001 that citation was
  dangling.
- **ADR-005** — the motion set is measured from `anytype-ts` source rather than from `047` §10, and
  `--db-motion-surface` becomes `200ms ease-out` with `--db-motion-scale-from: 0.98` added.

ADR-003 is deliberately unused here: `051` ADR-003 owns the confirm primitive, and a local ADR-003
would read as the same ruling.
<!-- /ANCHOR:phase-adr -->

