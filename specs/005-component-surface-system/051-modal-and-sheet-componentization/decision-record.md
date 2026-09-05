---
title: "Decision Record: Modal and Sheet Componentization"
description: "ADR-001 the sheet engine stays and the shell composes it. ADR-002 a sub-page replaces in place rather than stacking, per pair, where the Anytype capture shows it. ADR-003 the confirm primitive is this packet's and is the only one. ADR-004 fullscreen survives only for the formula workbench."
trigger_phrases:
  - "051 decision record"
  - "shell composition decision"
  - "sub-page decision"
  - "confirm primitive ownership"
  - "fullscreen presentation decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/051-modal-and-sheet-componentization"
    last_updated_at: "2026-09-05T14:50:00Z"
    last_updated_by: "adr-answers-051-053"
    recent_action: "Recorded ADR-002 and new ADR-004 Accepted: operator's 2026-09-05 (~14:15) answers"
    next_safe_action: "Unblock T009 (fullscreen disposition) and resume T001's per-pair sub-page reads against ADR-002"
    blockers: []
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/modals/db-modal.ts"
      - "src/views/modals/confirm-modal.ts"
      - "src/views/modals/formula-modal.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-051-adr"
      parent_session_id: null
    completion_pct: 50
    open_questions: []
    answered_questions:
      - "ADR-002: a registered stacked pair may become an in-place sub-page where the Anytype capture shows that pattern; 048's stacking model stays the default for every other pair"
      - "ADR-004: fullscreen survives only for the formula workbench; the other three fullscreen users become modal (desktop) / sheet (phone)"
---
# Decision Record: Modal and Sheet Componentization

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The sheet engine stays; the shell composes it

**Status: PROPOSED — awaiting operator review.**

### Context

`mobile-bottom-sheet.ts` is 840 lines with nineteen exports, and it is what `044`'s seven grammar
elements and `048`'s thirty-one stacked pairs actually assert against. The componentization ask
reads as "fold it into the shell". Doing that would move every behaviour those two landed phases
verified, in one commit, under a gate whose lanes read the old module's names.

### Decision

**The engine stays and the shell composes it.** `createSurfaceShell` calls
`attachSheetChromeToModal`, `createSheetHeader`, `placeSheet`, `keepSheetPlaced` and the entrance
helpers in one order; it does not reimplement them. Narrowing the nineteen exports is a deprecation
with a call-site count going to zero, never a deletion.

### Consequences

- The extraction is reversible per leg, because the engine's behaviour never moves.
- `044`'s and `048`'s lanes stay meaningful throughout, which is what makes them a leg boundary
  rather than a final check.
- A reader will find two modules where the ask said one. The shell's contract table (`plan.md` §3)
  is where the division is written down.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Fold the engine into the shell** | Literally one module | Moves every behaviour two landed phases verified, in one commit, under lanes that read the old names |
| **Compose the engine (chosen)** | Reversible per leg; the lanes stay meaningful | Two modules, and the division has to be documented rather than obvious |
<!-- /ANCHOR:adr-001 -->

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | The shell does; the engine already does. Only the composition is new |
| **Is there a simpler existing thing?** | The engine — composing it is the simpler thing |
| **What does it touch?** | `surface-shell.ts` (new), `db-modal.ts`, `mobile-bottom-sheet.ts`'s export surface |
| **What is the real caller that must not break?** | `DbModal.applyPresentation`, which every one of the twenty subclasses reaches |
| **What contract must not break?** | `044`'s seven elements and `048`'s thirty-one pairs, asserted after every leg |

---

<!-- ANCHOR:adr-002 -->
## ADR-002: A sub-page replaces in place; it does not stack

**Status: Accepted, 2026-09-05 (~14:15).**

### Context

`048` landed a stacking model, so the obvious way to open a settings sub-page is to stack a second
sheet over the first. `design-trueup.md` REQ-002 read the shipped Anytype build and found the
opposite: tapping `Layout` in the view-settings panel **swaps the panel's body inside the same 360px
frame** and the header becomes `‹ Layout` — one frame, a back affordance, no second surface. A
picker, by contrast, opens as a separate anchored popover that overlaps its parent, and the parent
stays fully visible and undimmed.

`048` REQ-002 independently prefers the same thing for the same reason: a parent that does not move
is cheaper than a parent that dims and scales back.

### Decision

**Operator, 2026-09-05 (~14:15):** *"Yes, where the capture shows it."* A registered stacked pair
may become an in-place sub-page with a back arrow when the Anytype capture shows that pattern for
the equivalent surface; per pair, the `sheet-grammar` lane row is rewritten to the sub-page shape
red-first. `048`'s stacking model stays the default for every other pair — this is a per-pair
exception, not a replacement of the stacking model, and `048/decision-record.md` records it as a
scoped exception.

**A sub-page replaces in place with a back affordance; a picker opens as its own surface over an
undimmed parent.** Two distinct moves, both captured, and the shell offers both rather than making
every child a stacked pair.

### Consequences

- Two independent sources — a capture of the product the operator called amazing, and our own
  landed stacking phase — agree, which is the strongest evidence this program accepts short of a
  device confirmation.
- **Resolved 2026-09-05 (~14:15), operator.** `spec.md` §11's third open question is answered: a
  registered stacked pair converts to a sub-page only where the Anytype capture shows the pattern
  for that surface, judged per pair rather than as a blanket rule. Each conversion rewrites that
  pair's `sheet-grammar` row to the sub-page shape, observed red before green, in the same leg that
  makes the change — never a bulk rewrite ahead of the per-pair capture read.
- The sub-page needs its own back affordance and its own keyboard path; the stacked child already
  had both through `048`.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Stack every child** | One mechanism; `048` already ships it | Contradicts the captured pattern and `048`'s own stated preference; a settings sub-page that dims its parent hides the thing it is a page of |
| **Replace in place for sub-pages, stack for pickers (chosen)** | What the capture shows and what `048` prefers | Two mechanisms, and the boundary between them has to be written down per surface |
<!-- /ANCHOR:adr-002 -->

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — REQ-003; today a sub-page is whatever its own surface builds |
| **Is there a simpler existing thing?** | `048`'s stacking, which is the thing this decision declines for this case and keeps for the other |
| **What does it touch?** | The shell's sub-page stack; no consumer changes until a surface opts in |
| **What is the real caller that must not break?** | Every registered stacked pair — none is converted without the operator's ruling |
| **What contract must not break?** | `048` AC-002's parent bounding-box tolerance, which the sub-page must also satisfy |

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The confirm primitive is this packet's, and it is the only one

**Status: PROPOSED — awaiting operator review.**

### Context

Three packets name a confirm. `053`'s ADR-003 gates a sort-conflict drop on one and names
`confirm-modal.ts`'s `openAndWait` as the mechanism. `055`'s D1 lists `destructive.confirm` as one
of its seven states. This packet owns the shell every confirm presents in. Nobody exports a confirm
primitive, so all three currently name something that does not exist under that name.

### Decision

**The confirm primitive is built and exported here.** `openAndWait` (`modals/confirm-modal.ts:45`,
module entry `:98`) becomes the family confirm, carries `044`'s seven grammar elements, and is
consumed — not reimplemented — by `053` and `055`.

### Consequences

- One owner, so the sort-conflict confirm and the destructive-confirm state cannot drift apart.
- `053` and `055` each gain a dependency on this packet's leg 4. Both already gate on it implicitly;
  this makes the dependency visible in the plan rather than discovered at implementation time.
- The confirm surface itself is **not in the Anytype sweep**. `design-trueup.md` REQ-007 records the
  confirm-versus-disable ruling as *design inferred from source code, not seen*, and that label
  carries here.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Let `053` own it** | It is the packet with the first concrete consumer | The confirm is a shell surface, and `055` would then depend on `053` for a state in its own vocabulary |
| **Let each packet build its own** | No cross-packet dependency | Three confirms is the exact defect the componentization ask exists to remove |
| **Own it here (chosen)** | One owner, the shell packet, with both consumers named | Two sibling packets gain a visible dependency on leg 4 |
<!-- /ANCHOR:adr-003 -->

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | The confirm exists; the *export* and the grammar assertion do not |
| **Is there a simpler existing thing?** | `openAndWait` itself — this promotes it rather than replacing it |
| **What does it touch?** | `modals/confirm-modal.ts`, and the two sibling packets' references |
| **What is the real caller that must not break?** | `048`'s registered `confirm over a sheet` pair |
| **What contract must not break?** | `openAndWait` resolving `false` on dismissal — the behaviour its own header comment pins |

---

<!-- ANCHOR:adr-004 -->
## ADR-004: `fullscreen` survives only for the formula workbench

**Status: Accepted, 2026-09-05 (~14:15).**

### Context

`spec.md` §11's first open question asked whether `fullscreen` survives as a third presentation
alongside the shell's modal and sheet. Four subclasses declare it: `ChartDrilldownModal`
(`chart-renderer.ts:972`), `InvalidTimeEventsModal` (`modals/invalid-time-events-modal.ts:78`),
`FormulaModal` (`modals/formula-modal.ts:217`) and `PropertyTypeConflictModal`
(`modals/property-type-conflict-modal.ts:90`). One of them, the formula workbench, is 1,664 lines
and is explicitly out of scope for this phase (`spec.md` §3); the other three are ordinary
dialog-sized surfaces with no scoped reason to keep a third presentation.

### Decision

**Operator, 2026-09-05 (~14:15):** *"Keep fullscreen for the workbench only."* The formula
workbench (`FormulaModal`) stays `fullscreen`, untouched. `ChartDrilldownModal`,
`InvalidTimeEventsModal` and `PropertyTypeConflictModal` become modal on desktop and sheet on
phone — the shell's ordinary two-presentation resolution, the same as every other migrated
`DbModal` subclass.

### Consequences

- `fullscreen` is not a third shell presentation; it is a named exception the workbench keeps
  because it is out of scope here, not because the shell needs a third mode.
- `tasks.md` T009 is unblocked: 3 of the 4 `fullscreen` subclasses take a shell role; the fourth
  carries the written reason this ADR is.
- `spec.md` §11's first open question is answered and moves to the resolved log.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Keep `fullscreen` as a third presentation for all four** | No migration for any of the four | Carries a third mode through the shell for three surfaces that do not need it; the shell's contract stays two presentations for everything else |
| **Collapse all four into the sheet with a height role** | One fewer mode everywhere | Forces the out-of-scope formula workbench through a migration this phase does not own |
| **Keep the workbench fullscreen; migrate the other three (chosen)** | Matches scope exactly; three surfaces gain the shell's declared title, close and motion contract | The boundary — one surface keeps a mode the other three lose — has to be written down, which this ADR does |

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — REQ-001 and T009 both name the four `fullscreen` subclasses as undispositioned |
| **Is there a simpler existing thing?** | The shell's existing two-presentation resolution — the three non-workbench subclasses take it as-is |
| **What does it touch?** | `chart-renderer.ts`, `modals/invalid-time-events-modal.ts`, `modals/property-type-conflict-modal.ts`; `modals/formula-modal.ts` is untouched |
| **What is the real caller that must not break?** | The formula workbench's own `fullscreen` open path — explicitly out of scope, so nothing here may touch it |
| **What contract must not break?** | `spec.md` §3's Out of Scope line naming the workbench `fullscreen`, untouched |
<!-- /ANCHOR:adr-004 -->
