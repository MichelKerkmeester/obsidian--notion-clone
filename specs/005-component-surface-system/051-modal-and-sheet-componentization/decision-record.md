---
title: "Decision Record: Modal and Sheet Componentization"
description: "ADR-001 the sheet engine stays and the shell composes it. ADR-002 a sub-page replaces in place rather than stacking. ADR-003 the confirm primitive is this packet's and is the only one."
trigger_phrases:
  - "051 decision record"
  - "shell composition decision"
  - "sub-page decision"
  - "confirm primitive ownership"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/051-modal-and-sheet-componentization"
    last_updated_at: "2026-09-05T14:00:00Z"
    last_updated_by: "orchestrate-handover-19"
    recent_action: "Recorded the three decisions the plan's legs depend on"
    next_safe_action: "Operator review of ADR-002's implication for the registered stacked pairs"
    blockers: []
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/modals/db-modal.ts"
      - "src/views/modals/confirm-modal.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-051-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
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

**Status: PROPOSED — awaiting operator review.**

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

**A sub-page replaces in place with a back affordance; a picker opens as its own surface over an
undimmed parent.** Two distinct moves, both captured, and the shell offers both rather than making
every child a stacked pair.

### Consequences

- Two independent sources — a capture of the product the operator called amazing, and our own
  landed stacking phase — agree, which is the strongest evidence this program accepts short of a
  device confirmation.
- A registered stacked pair that would become a sub-page changes a green row's subject. That is
  `spec.md` §11's third open question and it is the operator's, not an agent's.
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
