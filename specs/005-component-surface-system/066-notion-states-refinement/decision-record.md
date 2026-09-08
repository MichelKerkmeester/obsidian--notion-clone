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
> weight"*, and ADR-002, *"Centre on phone, keep corner on desktop"*, both quoted verbatim below.
> **ADR-004 is now decided** — a dedicated `ease-out` token, so the fast-band migration changes no
> surface's curve. **ADR-003 stays open**: 5000ms is an inference the device pass can move. Nothing
> here re-decides what `055`'s `design-trueup.md` measured — these are about which reading governs,
> not about what a reference shows.

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
| **Status** | Accepted — option 1, a dedicated `ease-out` token |
| **Date** | 2026-09-06 (opened) · 2026-09-07 (decided) |
| **Deciders** | Implementer, at the fast-band migration itself |

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

**Option 1 — add `--db-motion-fast-out: 120ms ease-out` beside `--db-motion-fast` and alias the four
sites to it.** Two admissible options were on the table:

1. Add `--db-motion-fast-out: 120ms ease-out` to the token block and alias the four sites —
   preserves every current curve, at the cost of a second fast-band token.
2. Migrate the four sites to `var(--db-motion-fast)` and accept `ease` as the one fast-band curve —
   one token, at the cost of a deliberate curve change on four surfaces.

Option 1 is taken. A popover entrance and three hover/state transitions are read-heavy, frequent
interactions with an established feel; nothing in this packet's scope asked for that feel to change,
and REQ-005 is satisfied by the census alone — it does not prefer one curve over the other. Trading
a second small token for zero visual change on four live surfaces is the smaller, safer move, and it
keeps the migration mechanical: every site keeps the value it already rendered, named instead of
hand-typed. **Absorbing the choice silently was the failure this ADR exists to prevent — deciding is
what discharges it, not which option is picked.**
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

<!-- ANCHOR:adr-005 -->
## ADR-005: The Undo toast's dwell shortens from 5000ms to 3500ms, on a direct operator report

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-08 |
| **Deciders** | Operator (report), implementer (the number) |

---

<!-- ANCHOR:adr-005-context -->
### Context

ADR-003 set `ACTION_DISMISS_MS = 5000` as an inference — "the shortest window that comfortably
covers read, aim and act" — and left it Proposed, naming the phone device pass (D-2) as the only
check that would move it. That inference shipped in `0.0.32` and is still live in this tree today.

**A fresh, dated operator report supersedes the inference before the device pass ever ran.** On
2026-09-08 the operator reported, verbatim: "toast like the undo toast stay too long on screen."
This is not the D-2 reachability check ADR-003 named — it is the reader's own account of the felt
duration, on the exact number ADR-003 chose. `ACTION_DISMISS_MS` was confirmed at 5000ms in the
tree the operator tested (`8614ead0`, an ancestor of the `0.0.32` release tag), and no bug or
extension of the timer was found: `database-view.ts`'s delete-then-Undo call site raises the toast
with `severity: "success"` and `action` set, exactly the shape `ACTION_DISMISS_MS` gates on.

### Constraints

- No Notion or Anytype capture carries a timing manifest row for either reference's undo toast — a
  still cannot show a duration, the same fact ADR-003 already recorded. The operator's own report is
  the only fresh evidence available, and it is stronger than the original inference: it is a
  dated account of the actual shipped number, not a guess made before any number existed.
- The plain-success budget (`AUTO_DISMISS_MS = 2200`) is untouched — the report named the Undo toast
  specifically, and a plain success has nothing to act on.
- The `error` branch stays wait-for-the-reader, unchanged by this decision.

<!-- /ANCHOR:adr-005-context -->

<!-- ANCHOR:adr-005-decision -->
### Decision

**Shorten `ACTION_DISMISS_MS` from 5000ms to 3500ms, a 30% cut, and pair it with AC-011's enlarged
close hit area.** 3500ms is itself an inference — no reference supplies a number this packet can
adopt instead — but it is no longer a first guess: it is a deliberate reduction from a value already
proven too long by the person who has to read the toast. The two changes are paired because a
shorter window increases the cost of an unreachable close control: a reader who wants the card gone
sooner now also has a real 56×56 target to reach for, rather than the 18×18 sliver AC-011 measured.

**D-2 remains the check that could move it again.** If the shortened window turns out to be too
short for the rail's clamped phone width to reach the Undo action inside it, that is a device fact,
not a number this decision can anticipate from a desktop tree.

<!-- /ANCHOR:adr-005-decision -->

<!-- ANCHOR:adr-005-alternatives -->
### Alternatives Considered

| Alternative | Why not |
|---|---|
| Keep 5000ms and wait for the operator device pass (D-2) to move it | The device pass answers reachability, not felt duration; the operator has already reported the duration itself as the problem |
| Set exactly Notion's ~5s framing this packet's own dispatch note carries | That is the number already shipping and already reported too long — repeating it would not address the report at all |
| Cut to the plain-success budget (2200ms) | Erases the distinction ADR-003 exists to protect: an action-carrying toast still needs more time than a plain notice with nothing to press |
| Make the timer pause on hover/focus/touch | No reference capture shows either platform doing this, and inventing the behaviour without evidence would be exactly the phantom edge-case handling this packet's own process rules against; the shortened window plus the larger close target cover the same need without it |

<!-- /ANCHOR:adr-005-alternatives -->

<!-- ANCHOR:adr-005-consequences -->
### Consequences

One constant in `toast.ts`. `toast.test.ts`'s dwell matrix moves its checkpoints to prove the new
figure and to fail against the value it replaced (still connected at 3000ms; gone by 4000ms, which
the old 5000ms figure would still show connected at). The toast lane in
`tools/storybook/verify-placement.mjs` adds a real-timer row on the production `showToast` call,
proving the same two facts against the actual card rather than a mocked clock.
<!-- /ANCHOR:adr-005-consequences -->
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: The toast close control gets an invisible 56×56 hit inset, the checkbox's own idiom

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-08 |
| **Deciders** | Operator (report), implementer (the mechanism) |

---

<!-- ANCHOR:adr-006-context -->
### Context

A second, paired operator report on 2026-09-08, verbatim: "toast close button needs a 56 x 56 click
area." Measured before this decision, `.obnotion-toast-close`'s own box is 18px wide by 29-30px
tall under this repository's harnesses — 18px from its own `padding: 2px` around a 14px glyph, 29-
30px because nothing in the rule overrides the height the host's own bare `<button>` rule sets
(`tools/screenshots/host-bare-controls.css`, `--input-height: 30px`, read from Obsidian's shipped
`app.css`). `tools/live/touch-targets-baseline.json`'s `toastFixtureRaise` entry recorded this
control at 18x18 on 2026-09-05, before `hostStylesheetModelLowering` (2026-09-07) gave the fixture
pass that host button model; the 18x18 figure was already stale by the time this decision measured
the tree fresh, and this record corrects it rather than repeating it.

The card's own visual weight is set by its message and its Undo action; widening the close button's
own painted box to 56×56 would make a small, secondary control the loudest shape on the card.

### Constraints

- The visible glyph (14×14) must not change size — the report names the click AREA, not the icon.
- `tools/live/touch-targets.mjs` measures `getBoundingClientRect()` on the interactive element
  itself; it has no way to see a pseudo-element's inset, so a check for the real hit area has to
  live somewhere that can read `getComputedStyle(el, "::before")`.
- The enlarged hit area must not swallow the Undo action button that sits beside the close control
  in the same header row.

<!-- /ANCHOR:adr-006-context -->

<!-- ANCHOR:adr-006-decision -->
### Decision

**Reuse `input[type="checkbox"].obnotion-checkbox`'s own idiom: the visible box stays its drawn
size, and a borderless `::before { position: absolute; inset: -19px; content: ""; pointer-events:
auto; }` takes the real hit area past its edge.** Against the button's own 18×29-30 box this
computes to at least 56 wide by 67 tall — the width lands exactly on the 56px floor the report
named; the height clears it with margin because the box was already taller than wide. `styles.css`
gains `position: relative` on `.obnotion-toast-close` so the pseudo-element's `absolute` positioning
resolves against it, matching the checkbox's own containing-block setup.

`tools/live/touch-targets.mjs`'s DECLARED list gains a matching `obnotion-toast-close` entry, the
same shape as the checkbox and board-pagination-dot entries beside it: the bounding-box sweep cannot
prove 56×56, so it is told why the shortfall it still measures is not a defect, and the toast lane in
`tools/storybook/verify-placement.mjs` proves the real number instead — reading the button's box
together with its computed `::before`, and separately confirming `elementFromPoint` at the Undo
button's own centre still resolves inside the Undo button rather than being swallowed by the wider
invisible close target beside it.

<!-- /ANCHOR:adr-006-decision -->

<!-- ANCHOR:adr-006-alternatives -->
### Alternatives Considered

| Alternative | Why not |
|---|---|
| Grow the button's own box (`min-width`/`min-height: 56px`), the same shape `.is-phone .obnotion-toast-action` already uses at 46px | Makes the close control visually as large as the card's primary action, which nothing in the report or either reference asks for; the glyph would sit inside a conspicuously larger button even though its own pixels stay 14×14 |
| A flat, unconditional inset the same magnitude on all four sides without checking neighbours | This is what was tried first; measuring it against the actual header layout (26px total width padding either side of an 18px box, a 12px `margin-top` gap to the actions row) is what surfaced the need for the `elementFromPoint` proof below, which passed without needing to bias the inset asymmetrically — recorded here so a future change to the header's spacing knows this proof exists and should be re-run |
| Scope the `::before` rule to `.is-phone` only, matching `obnotion-toast-action`'s own phone-only raise | The close control's small size is not a phone-only problem — a mouse pointer benefits from a larger target too, and nothing about the fix's mechanism needs a coarse-pointer gate the checkbox's own idiom does not carry either |

<!-- /ANCHOR:adr-006-alternatives -->

<!-- ANCHOR:adr-006-consequences -->
### Consequences

Four lines in `styles.css` (`position: relative` plus a four-line `::before` rule) and one DECLARED
entry in `tools/live/touch-targets.mjs`. `tools/live/touch-targets-baseline.json`'s fixture ratchet
drops from 171 to 169 — the two `obnotion-toast-close` instances `chrome-toast-success` and
`chrome-toast-error` already carried move from undeclared to declared, not a new repair elsewhere.
Three new rows land in the toast lane (`tools/storybook/verify-placement.mjs`): the hit-area
measurement, an unchanged-glyph guard, and the neighbour-occlusion proof.
<!-- /ANCHOR:adr-006-consequences -->
<!-- /ANCHOR:adr-006 -->

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
