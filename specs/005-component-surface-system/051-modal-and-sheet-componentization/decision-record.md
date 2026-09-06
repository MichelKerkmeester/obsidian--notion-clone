---
title: "Decision Record: Modal and Sheet Componentization"
description: "ADR-001 the sheet engine stays and the shell composes it. ADR-002 a sub-page replaces in place rather than stacking, per pair, with the list of two converts out of thirty-one. ADR-003 the confirm primitive is this packet's and is the only one. ADR-004 fullscreen survives only for the formula workbench. ADR-005 the phone close survives the capture that contradicts it, on a measured 2.21:1. ADR-006 (Accepted) restates AC-006's geometry-literal count as the shell's seven raw-literal properties, so it can be observed red instead of trivially zero. ADR-007 retargets the whole packet to Anytype parity by default, with three named accessibility exceptions and one flagged data-loss hold."
trigger_phrases:
  - "051 decision record"
  - "shell composition decision"
  - "sub-page decision"
  - "confirm primitive ownership"
  - "fullscreen presentation decision"
  - "phone close contrast decision"
  - "parity by default"
  - "051 adr-007"
  - "parity retarget exceptions"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/051-modal-and-sheet-componentization"
    last_updated_at: "2026-09-06T07:50:00Z"
    last_updated_by: "operator-decision"
    recent_action: "ADR-008 merged with its planning entry and records planned versus shipped"
    next_safe_action: "Revisit T023 only when a second surface takes the side-sheet shape"
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
    completion_pct: 22
    open_questions: []
    answered_questions:
      - "ADR-002: a registered stacked pair may become an in-place sub-page where the Anytype capture shows that pattern; 048's stacking model stays the default for every other pair"
      - "ADR-004: fullscreen survives only for the formula workbench; the other three fullscreen users become modal (desktop) / sheet (phone)"
      - "ADR-002 per-pair list: properties property type picker and add view property picker convert; 29 keep 048 stacking"
      - "ADR-005: 044's 44px phone close survives every contradicting capture, because the handle it would be replaced by is 2.21:1"
      - "ADR-007: parity by default; deviations only for WCAG 1.4.11, 1.4.3 or a 44px floor; 18 decisions flipped, 3 exceptions (E1 close, E2 grey-as-text, E3 destructive icon), 1 flagged data-loss hold (the confirm)"
      - "ADR-006 (2026-09-05 ~18:20): accepted. AC-006's Verification cell restates as a count of the shell's seven properties declared as raw literals outside surface-shell.ts's named constants, red today at ≥20 for the 360px width alone"
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
undimmed parent.** Two distinct moves — and, after T001 opened the phone captures, **three**: a
stacked *sheet* and a stacked *menu* behave differently and the reference marks them differently.
The shell offers all three rather than making every child a stacked pair.

**The three moves, and the affordance that identifies each** (`design-trueup.md` §3):

| Move | The frame | Affordance |
|---|---|---|
| Replace in place | anchored edge unmoved; title and body swap | **one** grab handle, unmoved |
| Stack a sheet | a second sheet rises; the parent stays mounted, dimmed to **0.710** of its luminance | **two** handles, the parent's peeking ~10pt above the child's |
| Stack a menu or popover | an anchored surface opens; the parent does not move, and on desktop is **undimmed** | **no** handle on the child |

**The per-pair list, which this ADR asked for and did not have.** `design-trueup.md` §4 reads all
thirty-one registered pairs. **Two convert**:

- **`properties property type picker`** (`sheet-grammar.mjs:98`, `depth: 3`) — Anytype's identical
  chain replaces at the third level rather than stacking it
  (`anytype-mobile-sheet-relation-new-format-dark.png` carries `Add property`'s doubled handle and
  none of `New property`'s body).
- **`add view property picker`** (`:114`) — a property chosen from a chevron row inside a view-config
  sheet, which is exactly `Image preview ›`: `anytype-mobile-sheet-view-gallery-imagepreview-dark.png`
  sits at the same frame top **1261** and handle **1278** as `-view-edit-` and `-view-layout-picker-`.

**Twenty-nine keep `048`'s stacking**, ten of them because nothing equivalent was captured, each
labelled rather than guessed.

**The tolerance this ADR was written with is wrong and is corrected here.** "The parent does not
move" holds on the phone to the pixel and is false on the desktop: the same navigation takes the
popover through 316 → 298 → 90 → 166 → 390px of height inside an invariant 360px width. What holds
on both is the **width and the anchored edge**; the cross-axis extent is content-driven on desktop
and fixed on phone (`design-trueup.md` §6 C1). `NFR-P02` and `AC-003` are rewritten to that shape.

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
- **The per-pair read cost two conversions, not a wave.** Twenty-nine of thirty-one pairs keep the
  model `048` landed, which is the outcome a per-pair rule should produce and the argument against
  having applied it as a blanket.
- **A depth cap fell out of the read that nobody asked for.** Anytype's phone client never stacks a
  third sheet, in any of 118 states; where a third level is needed it replaces the second. Three of
  our pairs declare `depth: 3`. One converts here; `record column submenu` is menu-from-menu, which
  Anytype does stack, and `import confirm dropdown chain` has no equivalent — both keep `048` and
  the question goes to `054` rather than being answered by this packet
  (`design-trueup.md` §6 C4).

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

---

<!-- ANCHOR:adr-005 -->
## ADR-005: The phone close survives the capture that contradicts it

**Status: Accepted, 2026-09-05. It changes nothing and supplies the reason `044`'s amendment lacked.**

### Context

`044` REQ-007 was amended by an operator decision to *"header everywhere"* — every phone sheet gets a
title row with a **44px close**, with no title-less variant. That amendment was a preference, stated
without a reference screen, because none existed at the time.

T001 opened the reference screens, and **every one of them contradicts it.** No Anytype iOS sheet
carries a close control: `anytype-mobile-sheet-view-edit-dark.png`,
`anytype-mobile-sheet-object-more-dark.png`, `anytype-mobile-sheet-icon-picker-dark.png`,
`anytype-mobile-sheet-cover-picker-dark.png`, `anytype-mobile-sheet-cell-url-dark.png`,
`anytype-mobile-sheet-view-sorts-dark.png` and `anytype-mobile-sheet-view-filters-empty-dark.png` all
carry a centred title, sometimes a leading and a trailing action, and never an `×`. Dismissal is the
grab handle and the scrim.

This task's rule is that the capture wins. This is the one place in `design-trueup.md` where it does
not, and a rule broken without a written reason is the thing a decision record exists to prevent.

### Decision

**`044`'s 44px close stands.** The reason is measured, not preferred: the affordance the reference
substitutes for it — the grab handle — is `#555555` on `#1F1F1F`, which is **2.21:1**. On a sheet
with no other dismissal control that handle is the only non-text element identifying a control, which
is exactly WCAG 1.4.11's 3:1 case, and it misses by a third. Anytype's sheet is dismissible by a
gesture nobody with low vision can see the affordance for.

Two secondary facts point the same way and neither is the argument on its own. Our host is Obsidian,
not iOS, so the platform's edge-swipe-back habit is not available to lean on. And our own render
already shows the gap: `screenshots/notion-clone/components/chrome-owned-menu-sheet-mobile-dark.png`
has a leading grey title and **no close** — so row 26 of the inventory is a `044` conformance gap the
shell closes, not a place where we had already chosen the reference's answer.

### Consequences

- The divergence is now **deliberate with a number behind it**, not unnoticed drift, and the number
  is re-checkable off the same file.
- `044` is unchanged. This ADR does not amend another packet's landed ruling; it supplies the
  evidence that ruling was made without.
- The header keeps a trailing close, so the **trailing** action Anytype puts there — the `+` on
  `Filters` and `Sorts`, the `···` on `Edit view` — sits beside the close rather than in its place.
  That is `design-trueup.md` §6 C6's three-slot header, and the leading slot is what absorbs the
  pressure.
- Anything else the captures show about the handle is still adopted: its **34 × 5pt** geometry and
  its 6pt offset are measured values under REQ-006. Only its use as the *sole* dismissal affordance
  is refused.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Follow the capture: drop the close, dismiss by handle and scrim** | Matches the reference exactly; a cleaner header; one fewer target to place | The only visible dismissal affordance measures 2.21:1, below WCAG 1.4.11's 3:1; reverses a landed operator amendment on the strength of a screenshot |
| **Keep the close and drop the handle** | One affordance, unambiguous | Loses drag-to-dismiss, which `016` measured and `044` conformance asserts; the gesture is not the problem, its being *alone* is |
| **Keep both; the close is the accessible affordance, the handle the fast one (chosen)** | Clears 1.4.11; keeps the gesture; `044` and `048` lanes stay green unchanged | Diverges visibly from the reference on a surface the operator will compare side by side, which is why the reason is written here rather than assumed |

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — `design-trueup.md` resolves eight contradictions in the capture's favour and one against, and the one against needs its reason on the record |
| **Is there a simpler existing thing?** | `044` REQ-007 itself. This adds the evidence, not a second rule |
| **What does it touch?** | Nothing in code. It constrains what the shell's header may drop |
| **What is the real caller that must not break?** | `createSheetHeader`'s close button (`mobile-bottom-sheet.ts:163-176`) and the touch-target ratchet that measures it |
| **What contract must not break?** | `044` REQ-007 as amended, and the `sheet-grammar` lane rows that assert the close on twelve registered surfaces |
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: AC-006's geometry-literal count is restated so it can be observed red

**Status: Accepted, 2026-09-05 (~18:20).**

### Context

T002 (`tasks.md`) requires every threshold in `acceptance-criteria.md` to carry a failing figure
observed on HEAD before the fix (goal D2). AC-006's Verification cell reads: *"a count of geometry
literals in the shell path → 0."* Measured as written, that count is **0 today** —
`src/views/surface-shell.ts` does not exist (confirmed: `ls src/views/surface-shell.ts` → No such
file or directory) — which is the same number the criterion requires to be true when the work is
*done*. A metric that reads "0" both before any code is written and after the shell is built and
correct cannot be observed red: it fails `SC-004` for the same reason `AC-003`'s pre-T001 tolerance
did, addressed above in `design-trueup.md` §6 C1 — the earlier "bounding box moves by `\|Δ\| ≤ 1px`"
was false on the surface it was written for, and here the count is trivially true for the wrong
reason (absence, not conformance) rather than false.

**What is actually red today, measured 2026-09-05:** the seven geometry values AC-006 names are
not literals *inside a shell path that does not yet exist* — they are literals scattered across
`styles.css` outside any single shared declaration. `rg -c "360px" styles.css` → **20** separate
occurrences (max-width/max-height rules, none reading one named constant); the **8px** radius is
`--db-radius-lg` (`styles.css:83`), a design-system-wide token referenced ad hoc per surface
(`var(--menu-radius, var(--db-radius-lg))` and others) rather than a shell-owned declaration. That
scatter — not an empty file — is the red baseline the fix actually closes.

### Decision

**Operator, 2026-09-05 (~18:20): Accepted.** AC-006's Verification cell restates from *"a count of
geometry literals in the shell path → 0"* to *"a count of the shell's seven properties (radius,
horizontal padding, vertical padding, divider clearance, row height, panel width, phone close)
declared as raw literals outside `surface-shell.ts`'s named constants → 0, red-first against
today's scattered occurrence count (≥ 20 for the 360px panel width alone, confirmed by
`rg -c \"360px\" styles.css`)."* The target number does not change; only the metric's denominator
changes, from a file that does not exist to the surfaces that exist today and must converge on the
shell's constants.

### Consequences

- The lane T007/T015 build asserts against a baseline that can actually go from red to green,
  rather than one that reads green by construction before the shell exists.
- No scope change: AC-006's seven target values, and `checklist.md` C6's Target column, are
  unchanged. Only the Verification cell's wording moves.
- The alternative of leaving the criterion as originally written, and its false-"already met" risk,
  is rejected by the operator ruling above — the restated form is what AC-006 and `checklist.md`
  C6 now carry.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Leave the wording as written** | No document change | A literal-minded run of the stated check passes today, before any shell code exists, which is the false-pass `evidence-and-proof.md` §3.4 warns against ("it asserted nothing") |
| **Restate against today's scattered-literal count (accepted)** | Observable red today, same green target | One more sentence to maintain until the criterion closes |
<!-- /ANCHOR:adr-006 -->

---

<!-- ANCHOR:adr-007 -->
## ADR-007: Anytype parity is the default; a deviation must be an accessibility one with a number

**Status: Accepted, 2026-09-05 (~18:30), operator: *"Yes, parity by default."***

### Context

T001 read the captures under the rule *"capture wins"* and applied it unevenly. Nine contradictions
were named and only seven resolved toward the reference; across the thirty-five census rows, fifteen
recorded a measured Anytype value in the pattern column and then kept ours in the decision column —
sometimes for a real reason (an absent equivalent), sometimes because the change looked large
(`053`-scale, `design-system.md` §5), and sometimes for no stated reason at all.

That is the failure mode a parity target exists to prevent. A packet that measures a reference and
then declines the measurement surface by surface converges on neither the reference nor a coherent
design of its own — it converges on whatever each row's author found easy, which is exactly the
drift `spec.md` §2 describes as the family's original defect.

The operator resolved it in one sentence.

### Decision

**Every sheet and modal in the `051` census targets Anytype parity by default.** Every value the
captures show is adopted. **A deviation is permitted only where the measured value fails WCAG
1.4.11 (non-text contrast), WCAG 1.4.3 (text contrast) or a 44px touch floor**, and every such
deviation is named here with its measurement.

**Eighteen decisions flipped** — §6's C4, C7 and C8, and fifteen census rows (2, 3, 4, 5, 12, 15,
19, 21, 22, 23, 26, 27, 29, 33, 35). `design-trueup.md` §8b is the row-by-row list.

**Three exceptions, each with its number.**

| # | The Anytype value | Its measurement | The bar it misses | What we do instead |
|---|---|---|---|---|
| **E1** | Dismissal by grab handle alone, with no close control on any sheet | `#555555` on `#1F1F1F` = **2.21:1** | WCAG 1.4.11, 3:1 for the only non-text element identifying a control | `044`'s **44px close** stays, and the handle stays beside it as the fast affordance. ADR-005 unchanged; this is now the packet's only presentation refusal |
| **E2** | `#7B7B7B` for an empty property value, at 16px | `#7B7B7B` on `#1F1F1F` = **3.89:1** | WCAG 1.4.3, 4.5:1 for body text | **Anytype's own applied-value grey `#909090` = 5.16:1**, used for both the applied and the empty case. The substitution is itself a measured value. **Scoped to text**: the same hex is adopted unchanged for the header's `+` glyph, where 1.4.11's 3:1 bar applies and 3.89:1 clears it |
| **E3** | A destructive row rendered without red and without an icon (`Empty Bin`, `anytype-menu-nav-widget-bin-dark.png`) | No non-colour signal, and no colour signal either | WCAG 1.4.1, information not carried by colour alone | **Red plus a trash icon on every destructive row** — which is also Anytype's majority answer, in `anytype-mobile-sheet-object-more-dark.png` and `anytype-mobile-sheet-view-edit-more-dark.png`. Two captures to one, and the minority carries the meaning on nothing |

**No adopted value fails the 44px touch floor.** Re-measured: the primary pill **50.0pt**, the row
pitch **50pt**, the text input **50pt**, the trailing header chip **44.0 × 44.0pt** exactly. Two
header actions have hit areas no static capture can measure — the leading `Clear` and the trailing
`···` — and our own 44px floor applies to them. That is a floor added above parity, not a
divergence from a measured value.

**E4 — one hold is flagged rather than taken.** `design-trueup.md` row 1: Anytype raises **no
destructive confirm anywhere** in 118 iOS states or 600 desktop menu files, because deletion is
reversible into a Bin. Ours is not. The confirm therefore stays, and the reason is **data loss, not
accessibility** — which this ruling does not authorise. It is recorded here for the operator rather
than absorbed silently. Two readings are open and only the operator can choose:

1. **Keep the confirm** (what the packet does today). The precondition for Anytype's pattern is
   absent — there is no Bin — so there is no equivalent surface to be parity with, and this is an
   *absent equivalent* rather than a deviation.
2. **Reach the pattern properly** by routing deletions through `TrashManagerModal` and then dropping
   the confirm. That is a data-model change, far outside `051`, and would belong to its own packet.

Reading 1 was applied until the operator ruled.

**E4 is closed, 2026-09-06 (~07:50). The operator ruled, verbatim: "No confirm for single delete,
Undo toast."** The confirm is kept for bulk delete and for anything not undoable. This is neither of
the two readings above: it takes Anytype's pattern without the data-model change reading 2 required,
by making the single delete reversible at the interaction layer — an undo toast — rather than at the
storage layer. The hold this ADR flagged is discharged; the row stops waiting on the operator. It
reuses the toast/undo primitive `055` already owns rather than either of E4's original two paths.
The confirm primitive this ADR builds still exists and is still the only one; it is simply no longer
the path a single-row delete takes. **Owner of the `deleteRow` call-site changes: `055`**; this
packet's scope is unchanged — the confirm primitive `055` calls into for bulk and non-undoable cases.

**Not implemented here.** This leg exported the confirm primitive and closed the census; removing
the single-delete confirm and adding the undo toast is a separate leg's work, and nothing in the
code shipped alongside this ruling acts on it. The primitive is what a bulk-delete and
not-undoable confirm will keep using.

**Implemented at `f962d626`** by `055` T019 (its ADR-010), not here: `deleteRow` in both classes
now gates the confirm on `canUndoDeletion(app, file)`, and this packet's primitive is what the
surviving bulk and not-undoable confirms still call.

**One value was over-generalised rather than under-adopted, and is corrected in the same pass.**
`design-trueup.md` §6 C10: Anytype ships **two** phone frame shapes, not one. A **floating card** at
device L 24 / R 1181 / bottom 2597 — 8.0 / 8.3 / 8.3pt with a 16pt radius, on 22 files — and a
**flush** edge-to-edge sheet at L 0 / R 1205 / bottom 2621, on 13. Every floating sheet's top edge
sits at ≥ 299pt of an 874pt screen and every flush one at ≤ 198pt; **nothing was captured between**,
so the boundary is unobserved and is not invented. The shell takes the shape from the surface's
declared height role. Writing "8pt inset on three sides" as a blanket, as REQ-006 did, would have
been wrong on thirteen of thirty-five census surfaces.

### Consequences

- **`044`'s grammar yields where it differs.** Row 26's `menu` role becomes an anchored, handle-less
  card over a dimmed parent rather than a grab-handle bottom sheet. `044`'s 44px close survives as
  E1 and nothing else about `044` is amended; the note is recorded in
  `../044-phone-sheet-alignment/decision-record.md`.
- **`048` gains a default, not an exception.** Sub-page-by-capture stops being a two-pair carve-out
  and becomes the rule for the pairs `design-trueup.md` §4 enumerates, and the depth cap — no third
  stacked sheet — is now a shell rule rather than a question routed to `054`. The note is recorded
  in `../048-stacked-sheets/decision-record.md`.
- **Three flips land outside this packet's write authority and are named, not taken.** Rows 29, 33
  and 35 retarget widths and a row shape that `design-system.md` §5 fixes at 440-560px with
  140/140/120px column floors. This packet records the measured target; the conflict is reported at
  `../roadmap.md` §7.11 for the owner to resolve. Row 21's bottom-anchored search is `053`'s to
  build; `051` declares the target only.
- **The acceptance thresholds move with the decisions.** `AC-003`, `AC-006` and the new `AC-011`
  and `AC-012` carry the adopted values with tolerances, so a parity claim is measurable rather than
  asserted. The reds T002 measured at `de4783bb` are untouched — they describe the tree, and the
  tree did not change.
- **A later reader can tell adoption from refusal at a glance, and the tally is countable.** All
  **35** §5 decision cells open with a decision word — **16 ADOPT, 7 FLIPPED, 12 HOLD, 0 REFUSE** —
  and all **10** §6 resolutions do too, at **9 ADOPT and 1 REFUSE**. The single `REFUSE` is C2, and
  it names **E1**. `HOLD` never means "we declined it": it means no Anytype surface exists to be
  parity with, which is why ten of the twelve carry `design-trueup.md`'s *design inferred from
  source code, not seen* label.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Keep "capture wins, mostly"** | No document change; fifteen judgment calls already made | Those fifteen calls have no shared rule, so the packet converges on neither the reference nor a design of its own — the drift `spec.md` §2 names as the family's defect |
| **Parity with no exceptions at all** | The simplest rule to state and to check | Ships a 2.21:1 dismissal affordance and a 3.89:1 body grey. Parity with an inaccessible reference is not a goal worth having |
| **Parity by default, accessibility-only deviations, each named with its number (chosen)** | One rule; every deviation is checkable against a file; the exception list is three rows long | One hold (E4) does not fit the rule and has to be flagged rather than resolved here |

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — fifteen census rows and three contradictions were decided without a shared rule, and a later reader could not tell which were reasoned |
| **Is there a simpler existing thing?** | ADR-002's "where the capture shows it", which is this rule for one question. This generalises it rather than adding a second rule |
| **What does it touch?** | `design-trueup.md` §§1, 2b, 4, 6, 7, 8 and fifteen §5 cells; `spec.md` REQ-003/006/009; `acceptance-criteria.md` AC-003/006/011/012; `checklist.md` C12-C14; `tasks.md` T006/T007/T011/T013/T020 |
| **What is the real caller that must not break?** | `044`'s twelve registered `sheet-grammar` surfaces and `048`'s thirty-one registered pairs — the frame-shape change moves every selector that measures a sheet rect, so it lands with T012's row updates |
| **What contract must not break?** | WCAG 1.4.1, 1.4.3 and 1.4.11, which are the only grounds on which this ruling permits a deviation at all |
<!-- /ANCHOR:adr-007 -->

---

<!-- ANCHOR:adr-008 -->
## ADR-008: A fourth desktop shape — the full-height side sheet, for one surface

**Status: Accepted, 2026-09-06 (~08:15), operator: *"this dropdown on desktop is horrible … should
probably become a sheet, on desktop at least, and get dedicated button."***

### Context

The database Settings panel (`ViewConfigPanelRenderer`) is the one surface in the census whose
content always overflows its own chrome — 1461px of it inside a 360×560px anchored dropdown,
scrolling the panel itself, header included, so a long enough scroll carried the title off the top
with it (the same defect `view-config-panel-renderer.ts`'s own header comment already names). The
operator's report names this exact surface — the screenshot attached is
`anytype-menu-object-properties-panel-dark-full.png`'s shape held up against ours — and gives two
rulings in one sentence: **"Right side sheet"**, a full-height panel docked to the right edge like
Anytype's own object panel, database staying visible and scrolling independently; and **"Gear icon
in the toolbar rail, before ···"**, a permanent control beside filter, sort, group and columns.

The planning entry this replaces surveyed the role table and reached the same place from the
other side: the panel opens through `positionToolbarPopover`'s general preset, sized by
`design-system.md` §3's `panel` role (292-360px, anchored to its trigger), and none of §3's roles
is the asked-for shape — `panel` is anchored and bounded rather than full-height, `sheet` is the
phone presentation docked to the bottom, and `condition panel` is a wider `panel`, still anchored.

Neither the modal/sheet shell (`surface-shell.ts`'s `sheet`/`fullscreen`/`dialog` presentations,
built for the `DbModal` family) nor the desktop anchored popover (`positionToolbarPopover`, built
for a compact dropdown capped at a few hundred pixels tall) is this shape. Forcing it into either
would mean stretching one of `044`'s phone-only sheet mechanics onto the desktop (wrong: the
operator ruled *"on desktop at least"*, and `044`'s own grammar — grab handle, bottom dock — has no
desktop equivalent) or fighting `positionToolbarPopover`'s own inline `top`/`left` math with
`!important` for a surface that needs none of its anchor-relative placement.

### Decision

**A fourth desktop presentation, `db-shell-side-sheet` (`surface-shell.ts`'s
`SHELL_SIDE_SHEET_CLASS`), for the one surface that needs it.** Full height, docked to the right
edge, `position: absolute` against `.note-database-container` — not `position: fixed` against the
viewport, so a database open in one pane of a split workspace docks against that pane's edge and
not the whole window's, the risk a `fixed` approach would have carried silently. Header through
`buildShellHeader` (title, trailing close), independently-scrolling body below it, the same
fixed-header/scrolling-body split `record-detail-panel.ts` already uses for its own overlong form.
Width **420px**, `SHELL_SIDE_SHEET_WIDTH_PX` — measured off Anytype's own right-hand object panel
(`anytype-menu-object-properties-panel-dark-full.png`, border column at device x 1832 of a 2168px
window, **336px** to the edge) and then widened rather than copied: this body carries a multi-line
description field and a template picker the reference's plain label/value list does not, the same
reasoning the sort/filter condition panel's own width already carries against its measured 288px
(`roadmap.md` §7.11). Focus trapped inside the sheet while open (`interaction-scope.ts`'s
`trapFocus`, the same primitive `filter-panel-renderer.ts` and `sort-panel-renderer.ts` already
use), Escape closes and returns focus to the anchor, resize-safe by construction (an absolutely
positioned, container-relative box needs no resize listener the way an anchor-tracking popover
does). A picker opened from inside it (the icon picker, the template file picker, the record-icon
dropdown) registers with `overlayStack` exactly as it already does from the anchored dropdown, so
`048`'s stacking model docks it over the side sheet unchanged — this ADR does not touch that
registration.

**Phone is untouched.** `this.asSheet` (`isMobileBottomSheet`) still selects `044`'s bottom sheet
for the identical content; the side-sheet class and its CSS block apply only on the `!asSheet`
branch, and `positionToolbarPopover` — with its own sheet-vs-anchored fork — still runs for phone
exactly as before. The desktop branch stops calling it at all, rather than fighting its inline
`position`/`top`/`left` writes with `!important`.

**The gear is a permanent rail control, not a menu row.** `renderSettingsButton`
(`toolbar-renderer.ts`) draws it in the utilities cluster before "···", wired to the same
`actions.toggleViewConfig` the removed "···" row called. `···`'s own `toolbar.viewSettings` row is
deleted outright — one path to the panel, not two — and the fallback classes
`createSettingsEntry` stamps (`db-view-config-btn` et al., which `openViewSettingsAfterMutation`
still looks up by selector) move from the utilities button to the gear with it. Recorded fully in
`053-toolbar-and-view-controls/decision-record.md` ADR-006, since the rail's own grammar and
collapse order are that packet's, not this one's.

### Planned shape versus the shape that shipped

The planning form of this entry named a mechanism the implementation did not take, and the
divergences are recorded rather than quietly dropped:

| Planned | Shipped | Why |
|---|---|---|
| A fifth `design-system.md` §3 role, `side sheet`, with its own role row in §3/§4 | No role row; a marker class plus two named constants in `surface-shell.ts` | One surface uses this shape. A role row is the right record once a second consumer exists; until then it would describe a taxonomy entry with one member |
| `openSurface({ role, mount: "bodyPortal" })` through the shell | `panel.addClass(SHELL_SIDE_SHEET_CLASS)` on the renderer's own panel, `position: absolute` inside `.note-database-container` | A body portal docks to the window; the pane is what the operator sees. Container-relative docking is also what makes it resize-safe with no listener |
| "The side sheet does not overlay [the database]" | It does overlay: it covers the rightmost 420px of the pane rather than reflowing the table into a narrower column | Reflowing the database is a table-layout change with its own blast radius, and none of it was asked for. The database stays visible to the left and keeps its own scroll |
| "The database stays interactive" | The database stays visible and scrolls, but a pointer-down on it dismisses the sheet, the same `overlayStack` outside-pointerdown contract every other toolbar panel carries | Left deliberately unchanged: making one surface exempt from the shared dismissal contract is a change to `048`'s model, not to this surface |

**How to roll back**: drop `SHELL_SIDE_SHEET_CLASS` from `presentPanel` so the desktop branch calls
`positionToolbarPopover` again, and delete the `.db-shell-side-sheet` CSS block. No stored data
changes, no migration.

### Consequences

- **A fourth shape exists, and it is named as one rather than folded into the popover or the
  sheet.** `SurfaceShellRole`/`SurfaceShellPresentation` are unchanged — this surface does not go
  through `createSurfaceShell` at all, the same way it did not before — but a later reader looking
  for "where does the side-sheet shape live" finds `SHELL_SIDE_SHEET_CLASS`/
  `SHELL_SIDE_SHEET_WIDTH_PX` beside the shell's other named geometry rather than a class invented
  in a stylesheet with nothing pointing at it.
- **The census of hand-built side panels stays at the figure `053`'s own file-list closes.** No
  second implementation of "a full-height docked panel" exists; the board variant of the same
  settings surface (`renderBoardSettings`, reached when `config.viewType === "board"`) takes the
  same shape for free, because it shares the one `ViewConfigPanelRenderer.render()` call this ADR
  changes.
- **The screenshot lane moves accordingly.** `constructed-view-config`'s desktop capture is the
  side sheet now; `panel-view-config`, the hand-built anchored-dropdown fixture, is kept rather
  than deleted, since it still documents the row content and the shape it used to be wrong — a new
  hand-built fixture, `panel-settings-side-sheet`, documents the shape it is now. `css-lane.json`
  carries the acquire/release pair and the reviewed capture list.
- **The reference measurement was re-taken at the landing, not carried on trust.** Decoding
  `anytype-menu-object-properties-panel-dark-full.png` and scanning rows y=300/600/900/1100: a 1px
  `rgb(41,41,41)` divider at x=1832 against `rgb(23,23,23)` content to its left, panel body
  `rgb(30,30,30)` from 1845 to 2136 inside 12px gutters, image width 2168 — **336px** from the
  divider to the edge, exactly as recorded. The capture's pixels are CSS pixels rather than DPR-2
  device pixels, cross-checked on the panel's own rhythm in the same decode: single-line property
  cards 42-44px tall on 10px gaps, values a DPR-2 reading would halve to 21-22px cards, which no
  44px-row product draws.
- **A pointer-down on the database closes the sheet.** Inherited, not chosen: the panel registers
  with `overlayStack` through `installHeaderPopoverAutoClose` exactly as it did as a dropdown, and
  that registration closes on outside pointer-down. Wheel-scrolling the table does not dismiss it,
  so "stays visible and scrolls independently" holds; clicking a row does. Left as-is here because
  exempting one surface from the shared dismissal contract is a change to that contract.
- **One value this ADR does not re-litigate:** the desktop `panel`/condition-surface width conflict
  `roadmap.md` §7.11 already names for rows 29/33/35 is untouched; 420px is this surface's own
  width, not a resolution of that conflict.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Stretch `044`'s phone sheet onto desktop** | One presentation shape instead of four | The operator ruled *"on desktop at least"* — a bottom-docked, grab-handle sheet has no desktop equivalent, and `044`'s own grammar (drag-to-dismiss, bottom-edge dock) is phone-specific by design |
| **Widen the anchored popover instead of docking it** | Smaller diff — one `positionToolbarPopover` option | Does not answer the report: a taller, wider dropdown is still a dropdown, floating near the toolbar rather than "docked to the right edge, database stays visible and scrolls independently" |
| **A fourth desktop shape, container-relative, for the one surface that needs it (chosen)** | Answers both operator rulings exactly; resize-safe and pane-scoped by construction; reuses `buildShellHeader`, `trapFocus` and `overlayStack` rather than inventing new versions of any of them | One more named presentation shape to keep straight, though it is a CSS class and two constants, not a second engine |

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — the operator's own report, plus the panel's own code comment already naming the overflow the anchored dropdown could not solve |
| **Is there a simpler existing thing?** | Checked and refused twice: `044`'s phone sheet has no desktop expression, and `positionToolbarPopover`'s anchored math would need fighting with `!important` for a surface that needs none of it |
| **What does it touch?** | `surface-shell.ts` (two constants), `view-config-panel-renderer.ts` (`presentPanel`, focus trap), `styles.css` (`.db-shell-side-sheet` and its sub-rules), `toolbar-renderer.ts` (the gear, the removed "···" row) — recorded jointly with `053` ADR-006 |
| **What is the real caller that must not break?** | `048`'s stacking model (a picker opened from the side sheet must still dock over it) and `044`'s twelve registered `sheet-grammar` surfaces (phone's `settings` row, unchanged) |
| **What contract must not break?** | Focus return on close (WCAG 2.4.3) and Escape-dismissal, both already provided by `overlayStack`/`trapFocus` and asserted unchanged here rather than reimplemented |

---

### Amendment, 2026-09-06 (~10:55) — the interactivity clause is settled by ruling

**Operator: *"Keep the overlay."*** The one clause the landing left open is closed by decision
rather than by code. The side sheet keeps the shared `overlayStack` outside-pointerdown contract: a
pointer-down on the database dismisses it, exactly as it dismisses every other toolbar panel. No
surface becomes exempt, `048`'s stacking and dismissal model is untouched, and the fourth row of the
planned-versus-shipped table above stops being a divergence awaiting a decision and becomes the
shipped behaviour with the operator's name on it.

**What that leaves the surface with**, all of it already measured at the landing and unchanged by
this amendment: docked to the pane's right edge at 420px, the container's full height, the header
fixed with the body the only scroller (1672px inside 776px), the database visible and independently
scrollable to its left, focus trapped, and a picker opened from inside it docking over it at
`z-index` 100 against the sheet's 50.

**What it does not close.** T023 stays open on its own reasons, which are not this ruling's:
ADR-008 shipped one marker class for one surface rather than a fifth `design-system.md` role, so a
role row would describe a taxonomy entry with a single member, and no gate lane asserts the shape.
The ruling settles *what the surface should do*, not *whether a lane watches it*.

**Provenance.** Relayed into this record by the 2026-09-06 family reconciliation, which carried the
ruling from the operator's own dispatch. Recorded here, on `acceptance-criteria.md` AC-013,
on `goal.md`'s side-sheet criterion, and in `../roadmap.md` §6A's dated tables.

<!-- /ANCHOR:adr-008 -->

