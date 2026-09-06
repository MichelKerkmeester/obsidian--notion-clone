---
title: "Implementation Plan: Notion States Refinement"
description: "How the five buildable refinements land: the dwell split first because it is the smallest and the most read, then the failure routing, the chip, the reconciliation and the census."
trigger_phrases:
  - "066 plan"
  - "notion states refinement plan"
  - "toast dwell plan"
  - "inline chip plan"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Notion States Refinement

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None — owned DOM builders over Obsidian's `createDiv`/`setIcon` |
| **Storage** | None; no persisted state changes |
| **Testing** | Vitest, plus the permanent lane rows under `tools/live/` |

### Overview

Five legs, each independently landable, sequenced by how many readers they reach. The dwell split is
one constant and one ternary and reaches every delete; the failure routing is three catches and a
census that has to move; the chip is the only new shape; the reconciliation is bookkeeping with its
own negative controls; the census is four declarations behind one recorded curve decision.

Nothing here widens the toast's public surface. `ToastOptions` already carries `action`, so the dwell
split reads a field the callers already pass — the change is in the component's own dismissal branch,
not in its contract.

A sixth leg joins them on the operator's 2026-09-06 18:50 ruling of ADR-002 (*"Centre on phone, keep
corner on desktop"*): the shared toast/rail placement centres on phone with symmetric margins, the
desktop corner stays measured-Anytype, and the device pass owes a read of the centred stack.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented — `goal.md` §1, `spec.md` §2-§3
- [x] Success criteria measurable — `spec.md` §5, five numbers, each with a red observed on `38bba1e3`
- [x] Dependencies identified — the CSS lane and two operator rulings, `spec.md` §6

### Definition of Done
- [ ] All acceptance criteria met, waived by an ADR or superseded by one
- [ ] Tests passing: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, each exit status read
- [ ] Docs updated: this packet's spec/plan/tasks plus `055`'s reconciled rows
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

One owned component per state family, carried from `055`. This packet adds no new module: it widens
one component's dismissal rule, adds one render function to an existing renderer, and moves three
call sites onto a component that already exists.

### Key Components

- **`src/views/toast.ts`**: owns the dismissal contract. Gains a second budget constant; the branch
  that selects between them is the only new control flow.
- **`src/views/database-view.ts`**: owns the operation call sites. Three `errors.*` catches move from
  `new Notice` to `showToast`, following `showOperationResult` (`:11316-11334`), which already does
  this correctly and is the in-tree model.
- **`src/views/empty-state-renderer.ts`**: owns the empty and error shapes. Gains `renderInlineChip`
  beside `renderCard` (`:295-330`); the fourteen-member `EmptyStateReason` union (`:25-39`) is
  unchanged — the chip is a second presentation of two existing reasons, not two new reasons.
- **`styles.css`**: gains `.db-inline-chip` beside the `.db-empty-card` family and loses its four
  fast-band literals.

### Data Flow

An operation completes or fails → the call site builds a `ToastOptions` with a severity and an
optional action → `showToast` mounts one card into the shared stack, or into the rail's single-slot
host → the dismissal branch reads `options.action` and `options.severity` to choose between clearing
itself and waiting for the reader. A stale reference takes a different path: the reason resolver
returns `source-missing` or `group-relation-deleted`, and the compact context calls
`renderInlineChip` instead of `renderCard`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `toast.ts` `AUTO_DISMISS_MS` (`:62`) | the only dismissal budget, applied at `:137` | update — a second constant plus a selection | `rg -n "AUTO_DISMISS" src/views/toast.ts`, then the dwell test |
| `toast.ts` `ToastOptions.action` | already public, already passed by three call sites | unchanged — the dwell split reads it, it does not change it | `rg -n "action:" src/views/database-view.ts src/views/embedded-database-renderer.ts` |
| `database-view.ts` `errors.deleteFailed` catches (`:3681`, `:8378`, `:8468`) | bare host notices on owned operations | update — route through `showToast` | `rg -n "new Notice\(" src --glob '!*.test.ts' \| wc -l`, before and after |
| `database-view.ts` `showOperationResult` (`:11316-11334`) | the correct model: severity plus action, rail-hosted | unchanged — it is the pattern being followed | read the range; no edit |
| `empty-state-renderer.ts` `renderCard` (`:295-330`) | the full-card shape for all fourteen reasons | unchanged — the chip is additive | `rg -n "renderCard" src/views` |
| `styles.css` fast-band literals (`:200`, `:473`, `:7431`, `:22745`) | four `120ms ease-out` declarations outside the token | update per ADR-004 | `grep -n "120ms" styles.css` minus the definition at `:122` and the comment at `:430` |
| `styles.css` toast/rail placement (`:2714-2719`, `:2724-2736`, `:2755-2763`) | one shared placement: stack corner-anchored, rail host fixed right, `is-inline` clamp | update per ADR-002's 18:50 ruling — centre within the phone band (`:20945`), desktop untouched | lane row reading computed left/right margins at 390px and 430px, and a desktop read showing both anchors unchanged |
| `styles.css` `--db-transition-fast` (`:122`) / `--db-motion-fast` (`:142`) | the fast-band token and its alias | unchanged unless ADR-004 adds a curve variant | read `:114-150` |
| `tools/live/*.json` lane rows | the permanent evidence surface | update — existing lanes extended, no new lane file | `node tools/live/...` per lane, exit status read |
| `055/goal.md` §3, `055/tasks.md` | the owner packet's tracking documents | update — five rows and two checkboxes | each restatement re-derived from the tree the same day |

Required inventories:
- Same-class producers: `rg -n "new Notice\(" src --glob '!*.test.ts'` — 242 today; the owned-operation subset is what REQ-002 moves.
- Consumers of changed symbols: `rg -n "showToast|AUTO_DISMISS_MS|renderCard|db-inline-chip" src styles.css --glob '*.ts'`.
- Matrix axes for the dwell: severity (`success`, `error`) × action (present, absent) — four rows, of which the `error` pair is unchanged and must be asserted unchanged.
- Algorithm invariant: an `error` toast never auto-dismisses, before or after. The dwell split touches the `success` branch only.
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
| Unit | The dwell matrix (severity × action), the chip's shape and `aria-live`, the reason-to-shape selection | Vitest, fake timers, production module import |
| Integration | A forced delete failure rendering `.db-toast.is-error`; a deleted group relation rendering the chip in a compact header | Vitest against the rendered container |
| Lane | The two computed dwell budgets, the owned-operation notice census, the chip's token-only background, the comment-excluded fast-band census, and the phone-band placement margins | `tools/live/` rows, each with its own negative control watched red |
| Manual | D-1 and D-2 on a handset — reduced motion inside the WKWebView, and one-hand reach to the Undo at the clamped rail width — plus the centred-placement read ADR-002's 18:50 ruling owes | Operator device pass, `055` `tasks.md` T017 |

Every lane row asserts a computed value, never a presence (`goal.md` D6). The census rows count
declarations rather than grep hits, because the raw counts mix comments and definitions — that is the
specific error the research corrected in the digest's own numbers.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Parent CSS lane | Internal | Yellow | `styles.css` legs serialize; the chip and the census cannot land together |
| `055` toast component | Internal | Green | Shipped at `a7188274`; this packet widens its dismissal rule only |
| Operator ruling, ADR-001 | External | **Green — ruled 2026-09-06 18:50** | Settled: one destructive weight; zero code |
| Operator ruling, ADR-002 | External | **Green — ruled 2026-09-06 18:50** | Settled: phone centred, desktop corner kept; the phone half is T017 and AC-009 |
| Operator device pass (`055` T017) | External | Yellow | D-1 and D-2 ride it, plus the centred-placement read ADR-002 owes; the packet's own row cannot close without it |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the dwell split makes a success toast outlive a subsequent one and the stack tiles; the
  routed failures produce a toast that outlives the view that owns it; the chip renders where a card
  was required; or a lane row goes green on a surface that got worse.
- **Procedure**: each leg is one commit touching one file group, so `git revert` of that commit is the
  whole rollback. The dwell split reverts to a single constant; the routed catches revert to
  `new Notice`; the chip reverts by deleting `renderInlineChip` and its CSS block, since nothing else
  calls it. `055`'s reconciled rows are documentation and revert independently of any code leg.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 dwell split ──────────┐
                           ├──► T009 lane rows ──► T012 device read
T004 failure routing ──────┤
T005 inline chip ──────────┤
T007 fast-band census ─────┘
T008 055 reconciliation ───► (independent; no code leg depends on it)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup (ADR-003, ADR-004 recorded) | None | Dwell split, fast-band census |
| Core (dwell, routing, chip, census) | Setup | Lane rows |
| Reconciliation | None | Nothing — it is documentation |
| Verify (lanes, gates, device) | Core | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 1-2 hours — two ADRs written, both decidable from the research |
| Core Implementation | Medium | 6-10 hours — the chip carries most of it; the dwell split is under an hour |
| Verification | Medium | 3-5 hours — four lane rows, each with a negative control watched red |
| **Total** | | **10-17 hours**, excluding the operator device pass |
<!-- /ANCHOR:effort -->
