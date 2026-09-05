---
title: "Decision Record: States, Feedback and Motion"
description: "ADR-001 — one toast component with an action slot, the inline rail and the selection-bar undo becoming placements of it. ADR-002 — the confirm keeps confirmWithModal's signature and gains 044's grammar inside the component."
trigger_phrases:
  - "055 decision record"
  - "toast adr"
  - "confirm grammar adr"
importance_tier: "normal"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/055-states-feedback-and-motion"
    last_updated_at: "2026-09-05T13:20:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the two architecture decisions the plan's legs implement"
    next_safe_action: "Execute T001, the red-first threshold measurements"
    blockers: []
    key_files:
      - "src/views/toast.ts"
      - "src/views/modals/confirm-modal.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-055-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: States, Feedback and Motion

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Three feedback shapes become one toast component with an action slot

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-05 |
| **Deciders** | Phase author (operator rule pending) |

---

### Context

Feedback exists in three shapes that answer one question. 247 bare `new Notice(...)` call sites
carry no severity and no action affordance — so `notice.galleryMigrated`
(`src/i18n.ts:1455`, raised at `database-view.ts:2744` and `embedded-database-renderer.ts:764`)
has promised *"Undo to keep it a gallery"* over a surface that cannot carry a button. The per-view
result rail (`showOperationResult`, `showOperationResult`, called at `database-view.ts:9433-9437`) has severity and an
Undo/Retry action but is scoped to one view and one timer. The selection bar's undo button
(`database-view.ts:7719`) is a third contract with its own CSS. The operator's componentize
directive names exactly this: one thing, many callers.

### Constraints

- The rail's inline placement next to the operation it reports is load-bearing; a floating toast
  cannot replace its position.
- The undo affordance routes to the existing history stack (`undoLastEdit`) — no new undo
  mechanism may be introduced.
- The toast is a floating surface, so it mounts outside the token subtree and must carry the
  token snapshot (`design-system.md` §4.2) and reduced-motion coverage (`styles.css:918-947`).

### Decision

**We chose**: one toast component (`src/views/toast.ts`) with severity, an optional action slot,
`role="status"` announcement, and motion tokens. The rail and the bar's undo become placements of
it — the rail keeps its position, the bar keeps its button, and both render the component.

**How it works**: the component takes state (`success`/`error`), message, and an optional action
(label, icon, callback). Auto-dismiss on success uses the 2200ms budget the rail already runs
(`database-view.ts:11256`); error sticks until acted on or replaced. Placement is the caller's
(the rail's container position, the bar's row); presentation, timing, announcement and teardown
are the component's.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **One component, placements (chosen)** | One API; the action slot is the feature; one reduced-motion story | Three consumers must agree on one contract | 9/10 |
| Second inline-rail component | Preserves placement untouched | Keeps three feedback contracts; the 247-site residue stays uncomponentized | 5/10 |
| Extend Obsidian's `Notice` with a fragment | Zero new component | No severity, no token boundary, no reduced-motion story, host-owned lifetime | 4/10 |

**Why this one**: the component is smaller than any of the three shapes it replaces, and the
action slot is what makes a promise like the migration notice's Undo deliverable at all.

### Consequences

**What improves**:
- One place to fix announcement, timing, tokens and reduced motion for every notice.
- The migration notice's Undo becomes real; the deleted-relation and delete confirmations gain
  severity.

**What it costs**:
- The wider migration (247 sites) is out of this phase's scope — this phase owns the component,
  the pattern and the named sites. Mitigation: the residue is named in `plan.md`'s bounded-migration
  note, not hidden.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Toast and a sheet both dock at the bottom edge on phone | M | The bar's `db-bottom-dock-taken` coordination (`styles.css:2591`) is the precedent to extend; the lane asserts the ordering |
| A toast action fires after its dismissal | M | The handler runs against the stack's current state or reports `nothingToUndo` — never a silent no-op (`spec.md` §10) |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | 247 bare notices; a promise Undo cannot keep (`src/i18n.ts:1455`) |
| 2 | **Beyond Local Maxima?** | PASS | Three alternatives scored; the fragment route rejected for host-owned lifetime |
| 3 | **Sufficient?** | PASS | One component + placements is the smallest thing that ends the three-contract split |
| 4 | **Fits Goal?** | PASS | The operator's componentize directive names this exact shape |
| 5 | **Open Horizons?** | PASS | The residue migration is the component's, not a second design |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**:
- `src/views/toast.ts` — the component.
- `src/views/database-view.ts` — the rail and the bar's undo render it; the owned notice sites
  route through it.
- `src/views/embedded-database-renderer.ts` — the migration and delete notices route through it.

**How to roll back**: revert the leg's commit; the migrated call sites restore `new Notice` at
exactly the sites the leg touched — the component is leaf-shaped and nothing else reads it.
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The confirm keeps its API and gains `044`'s grammar inside the component

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-05 |
| **Deciders** | Phase author (operator rule pending) |

---

### Context

`ConfirmModal` declares `sheet` (`modals/confirm-modal.ts:42` (`super(app, "sheet")`)) and never calls `createSheetHeader`, so
the most common stacked surface in the plugin (`048` inventory M-4 — "any destructive action
inside a sheet → ConfirmModal") scores 0 of 7 on `044`'s grammar. Nineteen call sites type
`confirmWithModal(app, {...})` across twelve files (`spec.md` §5's Confirm row). Threading a
presentation or header option through the signature would fork nineteen call sites for a change
only the component should own — and the operator's "header everywhere" ruling
(`roadmap.md` §6A) is precisely that there is no opting out.

### Constraints

- `confirmWithModal`'s promise-based contract — `false` on dismissal and cancel identically
  (`confirm-modal.ts:18-19`) — must not change.
- The confirm presents as a stacked child wherever a sheet opens it: `048`'s stacking model is a
  constraint this component consumes, not regresses.
- `DbModal`'s declared presentation (`db-modal.ts:56`) remains the presentation mechanism; no
  parallel sheet class.

### Decision

**We chose**: the `confirmWithModal` signature is unchanged; `ConfirmModal.onOpen` calls
`createSheetHeader` with the options' title, and the stacked-pair rows are registered in `048`'s
registry.

**How it works**: every caller conforms in one place. The header's title comes from the options'
existing `title` field; the danger variant's `mod-warning` confirm button is untouched; the
grammar lane asserts the seven elements on a registered `confirm` row.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Grammar inside, signature unchanged (chosen)** | 19 call sites conform without touching one; "header everywhere" holds structurally | A caller cannot opt out — accepted, since the ruling forbids opting out | 9/10 |
| A `ConfirmSheet` parallel class | Desktop and phone could diverge deliberately | Two confirm paths — the exact split `048`'s D1 exists to end | 3/10 |
| Signature option (`header: true` per caller) | Explicit per site | Nineteen edits; a caller that forgets one is a non-conforming confirm again | 4/10 |

**Why this one**: the defect is in the component; the fix belongs in the component.

### Consequences

**What improves**:
- Every destructive flow in the plugin reads as `044`'s sheet grammar, in one change.
- The stacked-pair registry gains the most common pair, closing `048` M-4's row.

**What it costs**:
- A desktop confirm gains a header it did not have. Mitigation: the operator's ruling is
  header-everywhere, and desktop confirms are modals — the header presents only where the sheet
  grammar applies (`is-phone` scoping, `044` ADR-002's precedent).

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The header changes a confirm's height on a tall confirmation | L | The grammar's own 16px inset and title rules are what the lane asserts; recapture any changed scenario in the same change |
| A stacked confirm over `fullscreen` parents takes the wrong path | M | `048`'s edge case already names the unstacked path for non-sheet parents (`048` spec §L2); the confirm inherits it |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | 0 of 7 grammar elements on the most common stacked surface (`048` M-4) |
| 2 | **Beyond Local Maxima?** | PASS | Three options scored; the parallel class explicitly rejected |
| 3 | **Sufficient?** | PASS | One `createSheetHeader` call + registration is the smallest conforming change |
| 4 | **Fits Goal?** | PASS | The confirm is one of the phase's named component primitives |
| 5 | **Open Horizons?** | PASS | The unchanged signature is what lets `051` own the primitive and this phase consume it — `051` ADR-003, written at landing 2026-09-05 |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**:
- `src/views/modals/confirm-modal.ts` — `createSheetHeader` in `onOpen`; the options' `title`
  becomes the header's title.
- `tools/live/sheet-grammar.mjs` — a `confirm` row and its stacked-pair registration.

**How to roll back**: revert the leg's commit; the signature never changed, so every caller is
unaffected by the revert — the confirm returns to its headerless sheet exactly as shipped today.
<!-- /ANCHOR:adr-002 -->
