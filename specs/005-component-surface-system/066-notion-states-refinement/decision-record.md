---
title: "Decision Record: Notion States Refinement"
description: "The four decisions this refinement turns on: whether a second destructive red enters the confirm primitive, whether the toast keeps its measured corner, how long an action-carrying toast stays, and which curve owns the fast band."
trigger_phrases:
  - "066 decision record"
  - "destructive red weight adr"
  - "toast placement adr"
  - "action toast dwell adr"
  - "fast band curve adr"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/066-notion-states-refinement"
    last_updated_at: "2026-09-06T16:50:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 18:50 rulings; ADR-001 and ADR-002 Accepted"
    next_safe_action: "Decide ADR-004 at T002 before T009 migrates anything"
    blockers:
      - "The centred phone stack still owes its device read (T015, AC-008)"
    key_files:
      - "src/views/toast.ts"
      - "src/views/confirm-sheet.ts"
      - "src/views/modals/confirm-modal.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-066-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Is 5000ms the dwell, or does the device pass move it"
    answered_questions:
      - "Notion's own two platforms disagree about toast placement, which is evidence against switching"
      - "The 2200ms budget is an unmeasured inheritance from the operation-result rail, not a landed ruling"
      - "The confirm keeps one destructive weight (operator 18:50, verbatim 'Keep one weight')"
      - "Toast placement splits by form factor: centred on phone, corner kept on desktop (operator 18:50)"
---
# Decision Record: Notion States Refinement

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

> Four decisions. **Two were ruled by the operator on 2026-09-06 18:50** — ADR-001, *"Keep one
> weight"*, and ADR-002, *"Centre on phone, keep corner on desktop"*, both quoted verbatim below —
> and two remain open: ADR-003's 5000ms is an inference the device pass can move, and ADR-004 is the
> implementer's to record at T002. Nothing here re-decides what
> `055`'s `design-trueup.md` measured — these are about which reading governs, not about what a
> reference shows.

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The confirm keeps one destructive weight

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 (opened) · 2026-09-06 18:50 (ruled) |
| **Deciders** | The operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

Notion differentiates two destructive weights **within one platform**, split by how much the action
destroys: text-only red for a page delete (`screen:28751c29`) against a filled red for the
view-plus-data-source delete (`screen:348fd2b7`). Our confirm primitive has one `danger` boolean
(`src/views/modals/confirm-modal.ts:28`) mapped to the host's themed `mod-warning`
(`src/views/confirm-sheet.ts:69`), and 17 `danger: true` call sites across 9 files inventory the
surface it governs.

The landed ruling is the other reading. `051` E3 pairs colour with an icon rather than relying on
colour alone, and `055`'s `design-trueup.md` records "don't split further" against a hex-valued
Anytype red that a themed host does not adopt.

### Constraints

- Parent `goal.md` D15: a Notion finding never silently overrides a landed Anytype ruling.
- `051` ADR-007: Anytype parity is the default for these surfaces; a deviation must be an
  accessibility one with a number.
- A second weight requires a per-site severity classification across all 17 `danger: true` sites.

<!-- /ANCHOR:adr-001-context -->

<!-- ANCHOR:adr-001-decision -->
### Decision

**Accepted — hold the single `danger` boolean.** Operator, 2026-09-06 18:50, verbatim: *"Keep one
weight"*. The case Notion's split exists for — an action that destroys a
data source rather than a view of one — has no consumer in this tree: our views are configurations
over vault notes, and nothing here deletes a data source. A second weight would be an abstraction no
current requirement earns, bought with a 17-site classification pass. The recommendation and the
ruling agree; the ruling is what binds.

If a future packet reopens this, the threshold that would apply is stated so the pass is scoped
before it starts: **the heavier weight is reserved for an action that destroys a data source or a
batch beyond the undo snapshot's capacity; `mod-warning` stays for every single-object delete.**
<!-- /ANCHOR:adr-001-decision -->

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Alternative | Why not |
|---|---|
| Adopt Notion's two weights now | No consumer; the classification cost lands on 17 sites for a case that cannot occur |
| Adopt the filled red as the single weight | Contradicts `051` E3's colour-plus-icon rule and imports a hex into a themed host |
| Defer the question without recording it | The next Notion pass re-derives the same conflict from the same screens |
<!-- /ANCHOR:adr-001-alternatives -->

<!-- ANCHOR:adr-001-consequences -->
### Consequences

The confirm surface is unchanged by this packet — now by ruling rather than by proposal. `AC-007`
records the ruling with its verbatim quote, and nothing waits on the operator for this conflict any
more.
<!-- /ANCHOR:adr-001-consequences -->

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| Check | Reading |
|---|---|
| Simplicity | One boolean beats two weights plus a classification |
| Performance | Not applicable; a class name |
| Maintainability | 17 sites keep one rule to read |
| Scope | Holding costs nothing; splitting opens a pass no requirement drives |
| Reversibility | Fully reversible: the threshold for the reverse is written above |
<!-- /ANCHOR:adr-001-five-checks -->

<!-- ANCHOR:adr-001-impl -->
### Implementation

None. T003 records the ADR; no source file changes.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The toast placement splits by form factor — centred on phone, corner kept on desktop

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted — placement split by form factor |
| **Date** | 2026-09-06 (opened) · 2026-09-06 18:50 (ruled) |
| **Deciders** | The operator |

---

<!-- ANCHOR:adr-002-context -->
### Context

Notion centres its iOS undo pill with symmetric margins and left-aligns its web one under the content
column (`screen:56f376d3`, `screen:7a0e976e`). Ours is the Anytype-measured bottom-right 384px corner
card (`styles.css:2724-2736`), shared with the operation-result rail through the `is-inline` clamp
`min(384px, calc(100vw - 32px))` (`:2756-2767`).

### Constraints

- The corner card is a measured Anytype value, landed, and the rail already shares it.
- Notion's own two platforms disagree with each other about placement.
- Moving the stack moves the rail with it, or splits one placement into two.

<!-- /ANCHOR:adr-002-context -->

<!-- ANCHOR:adr-002-decision -->
### Decision

**Accepted, and it reverses this ADR's proposal — by form factor.** Operator, 2026-09-06 18:50,
verbatim: *"Centre on phone, keep corner on desktop"*.

The proposal was to hold the Anytype-measured corner everywhere, on the argument that a reference
whose two platforms disagree is not evidence for either placement. The operator took one reading
from each side: **on a phone viewport the shared placement centres horizontally with symmetric
margins** — Notion's iOS reading, `screen:56f376d3` — **and on desktop the measured Anytype corner
stays.** The constraint that moving the stack moves the rail is honoured, not dissolved: the toast
stack and the operation-result rail are one placement and stay one, so one phone-band change
centres both and no desktop rule moves.

What the ruling supplies that the proposal could not: a decision where the reference was split, and
a phone placement that no longer hugs the right edge — which is also the form factor where the
unclamped 384px stack anchored at `right: var(--db-space-5)` (12px) overflows a 390px viewport
today.
<!-- /ANCHOR:adr-002-decision -->

<!-- ANCHOR:adr-002-consequences -->
### Consequences

The desktop block is untouched by this packet: the stack's corner anchor at `styles.css:2724-2736`
and the rail host's `right: 16px` at `:2714-2719` both stay. The phone band is now in scope — one
placement change centring the shared card, with the threshold in AC-009 — and the device pass owes
a read of the centred stack on a handset, riding beside D-1 and D-2 (AC-008). An operator reversal
of that read would arrive with a device fact behind it rather than a capture.
<!-- /ANCHOR:adr-002-consequences -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: An action-carrying toast dwells for 5000ms, and the number is an inference

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator, pending; the value is decidable by the device pass |

---

<!-- ANCHOR:adr-003-context -->
### Context

`AUTO_DISMISS_MS = 2200` is described in the component itself as "the budget the operation-result rail
already runs" (`src/views/toast.ts:62`) and applied unconditionally to every `success` toast (`:137`)
— including the two that attach an Undo (`src/views/database-view.ts:8369-8373`, `:2718-2723`).

**That budget was never measured for undo, and it is not a landed ruling.**
`055`'s `design-trueup.md:350` records the rail's 2200ms as an existing budget, citing the rail's own
code, and ADR-005's toast row (`decision-record.md:452-460`) measures only Anytype's 0.2s *transition*
— enter and exit — never a dismissal. No capture can supply the number either: the digest is a still
harvest, and a still cannot show a duration.

### Constraints

- D2 in `goal.md`: no Notion number is adopted, and there is no Notion number here to adopt.
- The `error` branch must stay wait-for-the-reader; the split touches `success` only.
- The component's public surface must not widen: `ToastOptions.action` already exists.

<!-- /ANCHOR:adr-003-context -->

<!-- ANCHOR:adr-003-decision -->
### Decision

**Split the budget: 5000ms when `options.action` is present, 2200ms when it is not.**

**5000ms is an inference, and is recorded as one** — the shortest window that comfortably covers
read, aim and act, chosen without claiming parity with anything. It refines an unmeasured inheritance
rather than overriding a measured value, which is why it does not need an operator ruling to land.

**D-2 is the check that would move it.** If the Undo target is not one-hand reachable at the rail's
clamped phone width, the number is wrong in a way no unit test can show.
<!-- /ANCHOR:adr-003-decision -->

<!-- ANCHOR:adr-003-alternatives -->
### Alternatives Considered

| Alternative | Why not |
|---|---|
| Raise the single budget to 5000ms for every success | A plain success has nothing to act on; 5s of screen for "Row deleted" is a regression |
| Make an action-carrying toast wait for the reader, like an error | An Undo that never clears turns a routine delete into a dismissal chore |
| Take the number from a Notion capture | Structurally impossible: a still is not a duration |
| Leave 2200ms and rely on the reader being quick | The failure is silent and lands on the reader who was slowest to read |
<!-- /ANCHOR:adr-003-alternatives -->

<!-- ANCHOR:adr-003-consequences -->
### Consequences

Two constants and one ternary in `toast.ts`; no caller changes. The severity × action matrix becomes
four testable cells, of which the two `error` cells must be asserted unchanged. The lane row reads
both computed budgets apart, so a later single-budget regression goes red rather than silent.
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: One curve owns the fast band, and which one is recorded

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Implementer at T002, before T009 reads it |

---

<!-- ANCHOR:adr-004-context -->
### Context

Four declarations hand-type `120ms ease-out` outside any token — `styles.css:200` (the popover
entrance), `:473`, `:7431` and `:22745` (hover and state transitions) — while `--db-transition-fast`
is `120ms ease` (`:122`) and `--db-motion-fast` aliases it (`:142`). **A blind migration to the token
silently changes the curve on all four surfaces**, which is the reason the census has not moved on
its own and the reason the raw grep count of 7 (which also matches the definition and a comment at
`:430`) is the wrong target list.

### Constraints

- ADR-005 in `055` owns the token values; this decision adds a variant or accepts an existing curve,
  it does not re-measure either.
- Neither reference contributes: Anytype's source gives no fast-band curve and a Notion still gives
  no duration at all.

<!-- /ANCHOR:adr-004-context -->

<!-- ANCHOR:adr-004-decision -->
### Decision

**Record the choice explicitly at T002, before T009 migrates anything.** Two admissible options:

1. Add `--db-motion-fast-out: 120ms ease-out` to the token block (`styles.css:142-146`) and alias the
   four sites — preserves every current curve, at the cost of a second fast-band token.
2. Migrate the four sites to `var(--db-motion-fast)` and accept `ease` as the one fast-band curve —
   one token, at the cost of a deliberate curve change on four surfaces.

**Either satisfies the threshold; absorbing the choice does not.** The failure this ADR prevents is a
census that reaches zero by changing four surfaces' motion without anyone deciding to.
<!-- /ANCHOR:adr-004-decision -->

<!-- ANCHOR:adr-004-consequences -->
### Consequences

The lane row counts **declarations, comments excluded**, not grep hits — the digest's own census
inflated the target list by three, and copying that method would carry the error forward. Whichever
option is taken, the five residual `var(--db-transition-fast)` uses (`:2037`, `:5461`, `:5678`,
`:20214`, `:21854`) move to the motion-token name in the same pass, so one name is left for one band.
<!-- /ANCHOR:adr-004-consequences -->
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:recorded-not-built -->
## Recorded, not built

Two Notion patterns keep their thresholds here so the phase that opens them does not re-derive them,
and neither is in this packet's scope.

| Pattern | Disposition | Threshold and red-first check |
|---|---|---|
| In-trash persistent banner (`screen:15f3126a`, `screen:4e2f2124`) | **Future** — a trash/restore phase. It inherits a Bin-shaped design question from E4's own logic: Anytype skips the confirm because its Bin makes deletion reversible, so a trash surface has to answer what this phase never had to | Opening a note whose file sits in `.trash` renders a banner pinned to the top of the view content with exactly two outline actions, coloured from the host error token and never a hex. Red-first: no banner shape exists — `grep db-trash-banner` reads 0 |
| Two-tier loading (`screen:a483c1af`, `screen:a36c0cce`) | **Conditional** — on a future import or bulk-transform surface. No surface in this plugin runs a multi-step, leave-it-running async operation today | The step list plus persistent bar appear only for an operation with ≥2 named steps and >2s expected duration; below that the single shimmer (`styles.css:2864-2910`) stays. Red-first: both tiers render for a 3-step mock, the bar survives the step card scrolling out of view, and a single-step operation still renders only the shimmer |
<!-- /ANCHOR:recorded-not-built -->
