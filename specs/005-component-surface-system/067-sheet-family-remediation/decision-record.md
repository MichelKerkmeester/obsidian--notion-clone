---
title: "Decision Record: Sheet Family Remediation"
description: "The four decisions the sheet family's remaining P0 work turns on: where the depth cap lives, what a menu role presents as, whether the parent dim is one mechanism or two, and what happens to the three surfaces outside the shell."
trigger_phrases:
  - "067 decision record"
  - "depth cap adr"
  - "menu role adr"
  - "scrim mechanism adr"
  - "fuzzy suggest adr"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/067-sheet-family-remediation"
    last_updated_at: "2026-09-06T16:30:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Opened four ADRs from the sheet family research synthesis, three Proposed and one part-Accepted"
    next_safe_action: "Re-read trueup rows 26 and 31 against their captures to settle ADR-002's parent clause"
    blockers:
      - "ADR-004 is the operator's; no capture can answer a question about our host"
    key_files:
      - "src/views/overlay-stack.ts"
      - "src/views/surface-shell.ts"
      - "src/views/popover-host.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-067-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Dimmed or undimmed parent under a stacked menu"
    answered_questions:
      - "The depth cap itself is decided: design-trueup.md C4 adopts it in full as a shell rule"
      - "The 44px close survives the handle-less card: ADR-007 exception E1"
---
# Decision Record: Sheet Family Remediation

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

> Four decisions, one per P0. Each is **Proposed** unless a landed ruling already decides it, and
> where a ruling decides part of a decision that part says so and the rest stays open. Nothing here
> re-decides what `051` `design-trueup.md` measured; these are about *where the mechanism goes*, not
> about what the reference shows.

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The depth cap is enforced in the stack, not at the call site

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator, pending |

---

<!-- ANCHOR:adr-001-context -->
### Context

`design-trueup.md` §6 **C4** adopts the cap in full and states it as a shell rule: *"no third
stacked sheet; the third level replaces the second."* The rule is decided. What is not decided is
where it is enforced, and today it is enforced nowhere: `overlayStack.register` derives `parentId`
from the current top sheet with no depth check (`overlay-stack.ts:94-96`), `getDepth` walks the
parent chain unbounded (`:194-209`), and the only depth-related guard in the API is the
cycle-protected parent walk (`:199-207`). The two pairs `051` AC-003 enumerates as converting —
`properties property type picker` and `add view property picker` — are therefore inexpressible: the
replace move exists as a header title swap and a back control (`surface-shell.ts:200-231`,
`:428-432`) with no body producer.

### Constraints

- The cap governs **sheets**. `record column submenu` and `import confirm dropdown chain` register
  at `depth: 3` and both are menu-stacks, which Anytype does stack
  (`anytype-mobile-sheet-object-more-submenu-dark.png`). Firing on either is a regression, not the
  feature.
- `048`'s stacking model is a constraint here and is not re-specified (`051` goal D4). Depth-to-z
  is monotone and verified on both engines; the cap sits above a known-good base.
- The stack is per-document. A popped-out window carries its own surfaces and its own cap.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: enforce the cap inside `overlayStack.register`, where the parent chain is already
walked, and give `createSurfaceShell` a body producer so the replaced surface has somewhere to
render.

**How it works**: `register` resolves the prospective depth from the parent it is about to attach
to. When the surface is a sheet and the resolved depth would exceed 2, it does not register a third
surface — it hands the second surface's shell a replace instruction, which swaps the body and the
title and shows the back control the shell already builds. Menu-role surfaces skip the check
entirely, which is what keeps the two registered depth-3 menu-stacks intact.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Cap in `register`** | One place; the parent chain is already resolved there; every opener inherits it without knowing about it | The stack gains a presentation concern it did not have | 8/10 |
| Cap at each opener | No new coupling in the stack | Thirty-one registered pairs, each an opportunity to forget; this is the same "four decisions in four files" defect `051` exists to remove | 3/10 |
| Cap in `attachSheetChromeToModal` | Close to the mount | Three surfaces bypass it today (AC-004) and would silently escape the cap | 4/10 |

**Why this one**: the cap is a property of the stack, and the stack is the only object that knows
what is already open. Putting it anywhere else means every future opener has to remember.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- The two converted pairs become expressible, closing the only adopted navigation move with no
  producer whatsoever.
- A depth-3 sheet chain becomes impossible rather than merely undesirable.

**What it costs**:
- `overlayStack` learns that some surfaces replace rather than stack. Mitigation: the stack decides
  *whether*, the shell decides *how* — the replace instruction is one call into an interface the
  shell already exposes.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The cap fires on a menu-stack | H | Scope the check to sheets; the negative control registers a menu-stack at depth 3 and requires it to survive |
| A replace loses parent state | M | `048` AC-006 already asserts a parent's `scrollTop` and draft value survive a child; the replace path inherits that assertion |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | C4 is an ADOPT row with no mechanism; two enumerated pairs cannot be expressed |
| 2 | **Beyond Local Maxima?** | PASS | Three enforcement points compared above |
| 3 | **Sufficient?** | PASS | One check in one function plus one producer; no new module |
| 4 | **Fits Goal?** | PASS | `goal.md` criterion 1 |
| 5 | **Open Horizons?** | PASS | A cap in the stack is where a future fourth level would also be governed |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `src/views/overlay-stack.ts` — the depth check in `register`, scoped to sheets.
- `src/views/surface-shell.ts` — the sub-page body producer behind the existing push/pop stack.
- `tools/live/sheet-grammar.mjs` — the two pairs assert replace; a menu-stack negative control.

**How to roll back**: revert the `register` check and the two lane rows; the shell's body producer is
additive and can stay unreferenced without changing behaviour.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: A `menu` role presents as a handle-less card, and the close stays

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed on the parent clause; **Accepted** on the close, which ADR-007 **E1** already decided |
| **Date** | 2026-09-06 |
| **Deciders** | Operator (E1 taken 2026-09-05 ~18:30); the parent clause pending |

---

<!-- ANCHOR:adr-002-context -->
### Context

`design-trueup.md` row 26 is FLIPPED and explicit: *"a `menu` role on the phone is an anchored,
handle-less card over a dimmed parent … not a grab-handle bottom sheet"*, with the handle's absence
re-measured across `-object-more-`, `-object-more-submenu-`, `-set-more-` and
`-kanban-column-menu-`. §3's third move says the child has *"No handle at all"*.

The role exists in the code and nothing reads it. `SurfaceShellRole` is declared
(`surface-shell.ts:332`, `:347-348`) and exposed through a getter (`:394-395`); the presentation
path never consults it. `menu`-role surfaces mount `mountPickerSheetHeader`
(`popover-host.ts:168-176`) and ship handle, scrim and close as
`.db-dropdown-popover.db-mobile-bottom-sheet` (`styles.css:3156-3213`) — the opposite affordance set.

**One correction, made at this packet's opening.** The research synthesis proposed the threshold as
*"no grab handle and no close button"*. That is wrong, and it contradicts the same row it cites:
row 26 ends *"The **44px close stays** — ADR-007 **E1**"*. E1 is an accessibility deviation with a
measurement behind it — Anytype's substituted handle is `#555555` on `#1F1F1F` at **2.21:1**, below
WCAG 1.4.11's 3:1 for the only non-text element identifying the dismissal control. A finding is a
hypothesis; this one was checked and corrected rather than carried.

### Constraints

- **Rows 26 and 31 disagree about the parent.** Row 26 resolves the card over a **dimmed** parent;
  row 31 resolves the popover shape over an **undimmed** one (`trueup:320`). Both are ADOPT and both
  are about §3's third move. They were measured off different surface classes and at most one is
  right for the other's case.
- The desktop anchored popover must not move. A `menu` role on desktop is already correct.
- `052` owns the rows inside a picker. This decision is about chrome and presentation only.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: make `SurfaceShellRole` load-bearing — the phone presentation path resolves the
affordance set from the declared role, a `menu` role yields a handle-less anchored card, and the
44px close is retained under E1.

**How it works**: `resolveShellPresentation` gains a role branch; the `menu` branch mounts the
header without the grab handle and without the drag gesture, and the card is anchored to its trigger
rather than docked to the bottom edge. Picker width roles cite the measured 256 / 288 / 232
(`design-trueup.md` §2a) through the constants that already exist for two of the three
(`surface-shell.ts:148-149`).

**What is not decided**: whether the parent dims. That clause stays **Proposed** until rows 26 and
31 are re-read against their own captures. Choosing between two ADOPT rows without re-reading them
is exactly the "measure a reference, then decline it surface by surface" pattern `051`'s log records
as the family's original defect.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**:
- A menu stops advertising a gesture it does not want; the handle currently promises drag-to-dismiss
  on a surface whose dismissal is a tap.
- The declared role stops being decoration. Today a surface can declare `menu` and present as a
  sheet, and no check notices.

**What it costs**:
- Every `menu`-role phone surface moves at once. Mitigation: the role is declared per surface, so
  the blast radius is exactly the set that declares it, and the capture diff names them.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Landing on the wrong parent treatment | M | The parent clause stays Proposed; the handle clause can land without it |
| Desktop popovers move | H | Assert the desktop capture set `pixelHash`-identical, as `051` T011 did after the leading slot shipped unscoped |
<!-- /ANCHOR:adr-002-consequences -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: One dim, at the measured level, and the pull-back is dispositioned

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator, pending |

---

<!-- ANCHOR:adr-003-context -->
### Context

`design-trueup.md` §6 **C3** adopts two measured scrim levels: the page under a first sheet at
**0.519** of undimmed luminance across three bands (0.519 / 0.520 / 0.505), and a parent sheet under
a stacked child at **0.710** (three bands, all 0.710). `051` AC-011 carries both figures with their
tolerances and their provenance.

The tree ships `rgba(0, 0, 0, 0.25)` (`styles.css:319`), which puts the page under a first sheet at
**0.75** of undimmed — roughly half the measured strength.

**The stacked-parent case is already at parity, and this ADR does not reopen it.** `93205d4d`
measured it off decoded PNGs rather than describing it, against
`constructed-column-manager-mobile-*` as the undimmed control: dark **46 → 33**, light
**242 → 183**, which is **0.717** against the measured 0.710 ± 0.02. It is produced by **two steps,
not two scrims** — `.is-stack-parent` at `opacity: 0.88` composited over the page, then the single
scrim over the result, that scrim hoisted to z-index 1003 between the levels. Two scrims would have
read 26 and 137, and they do not. So the loop's *"~34% effective through three compounding
declarations"* was arithmetic on the declarations rather than a measurement of the result, and it is
corrected here rather than carried.

**What that leaves undecided is narrower and still real**: the `scale(0.96) translateY(4px)`
pull-back on the parent's children (`styles.css:295-305`), which the two-step measurement does not
cover because it is a transform rather than a dim.

The pull-back is the part with no paper trail. Its comment calls it *"the compact depth cue used by
iOS and Notion"*; no capture can show a transform, and **no packet document records it as adopted or
declined**. It is design-inferred and unlabelled as such, which is precisely what `051` D1 forbids.

`051` AC-011's *"Today: no scrim exists"* was true when it was written and is not now. That cell is
corrected in place rather than rewritten, and AC-003 here supersedes it.

### Constraints

- `048` owns the scrim per C3; this packet consumes the value, and the amendment lands in `048` as
  well as here.
- Changing the scrim moves every mobile capture. The 32 protected Project Manager board and gantt
  entries must stay `pixelHash`-identical (parent D5).
- `design-system.md` §7 still says *"There is no sheet scrim … A scrim is new construction"*. Stale
  since `048`. Named, not fixed — the design system is the parent's document.
<!-- /ANCHOR:adr-003-context -->

---

<!-- ANCHOR:adr-003-decision -->
### Decision

**We chose**: raise the page-under-sheet dim to the measured band **while holding the
parent-under-child figure at the 0.717 it already measures**, and disposition the pull-back either
way. What is not acceptable is the current state: a page at half the measured dim, and a transform
nobody decided.

**How it works**: the scrim alpha moves toward the measured value and the `.is-stack-parent` opacity
step moves with it, because the two compose — raising the scrim alone would push the parent past
0.710. Both figures are re-measured by the same decoded-PNG method `93205d4d` used, on the same
control, so the after-numbers are comparable to the before-numbers rather than to an assertion. The
pull-back is then either recorded here as adopted, with its reason, or removed.
<!-- /ANCHOR:adr-003-decision -->

---

<!-- ANCHOR:adr-003-consequences -->
### Consequences

**What improves**:
- A sheet reads as modal rather than as a card over live content. This is the one remaining producer
  of the operator's *"sheets still looked like the old ones"* report that no landed fix explains.
- Dim strength becomes assertable. Nothing pins it today.

**What it costs**:
- A full mobile recapture. Mitigation: take it in the same leg and read the movers by scenario, not
  by count.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The recapture noise hides a real regression | H | Assert the 32 protected entries identical; diff the movers scenario by scenario |
| Keeping the pull-back and raising the scrim overshoots 0.710 | M | Measure the composite, not the declarations — the lane samples luminance, which is what the true-up measured |
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The three `FuzzySuggestModal` surfaces

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed — **the decision is the operator's**, carried unchanged from `051` T010 |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-004-context -->
### Context

`051` `spec.md` §11's second open question has been blocked since 2026-09-05, and `051` T010 records
why it cannot be closed here: *"whether the three `FuzzySuggestModal` subclasses join the shell or
stay Obsidian-native behind a shim is a question about our host, and Anytype has no host."* No
capture can answer it.

What the research adds is that the question's framing is now inaccurate. **The three surfaces
already wear the plugin's sheet chrome** — they call `attachSheetChromeToModal` directly
(`main.ts:3047`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34`), each
repeating the same `isTouchDevice` → chrome → `placeSheet` → `keepSheetPlaced` dance. So the choice
is not "join the shell or stay native"; it is "route through the composition, or write the
composition down once".

What the bypass costs, concretely: the two-slot legacy header rather than the centred three-slot grid
(`mobile-bottom-sheet.ts:276-278` against `styles.css:12316-12320`), no role and no declared-title
counting (`surface-shell.ts:101-126` never sees them), no `048` stack rule — the shell forces
`asSheet` when a sheet is already open (`hasSheetParent`, `surface-shell.ts:56`) and the Fuzzy path
never asks — and **measurement by nothing**: none of the three is among the 14 registered surfaces
(`sheet-grammar.mjs:65-107`).

One defect found and not fixed by `051` belongs to whichever option lands: `BaseFileSuggestModal`
calls `this.titleEl.setText(...)` before its own chrome call, and `attachSheetChromeToModal`'s
by-reference hide only hides the native title when it is **empty**. On a phone that subclass renders
its title twice. Distinct from row 59's defect, which was an empty title's dead band.

### Constraints

- Row 21's flip — `BaseFileSuggestModal` becoming Anytype's full-screen search — is a **separate
  task** either way. A chrome route and a surface redesign are different blast radii.
- Whichever option lands, AC-004's registration clause holds: three shipping phone sheets measured by
  nothing is a coverage hole independent of the disposition.
<!-- /ANCHOR:adr-004-context -->

---

<!-- ANCHOR:adr-004-decision -->
### Decision

**We chose**: nothing yet. Two options, put to the operator with the cost of each.

**(a) Route through `createSurfaceShell`.** The three surfaces stop hand-rolling placement and gain
the three-slot header, the role, the stack rule and the title counter. Smaller than it looks —
`DbModal` already demonstrates the whole integration at `db-modal.ts:120-133`, and that is an
inference from the call shape rather than a measured estimate.

**(b) Extract the four-call dance into one FuzzySuggest-specific shim.** So it is at least written
once. Keeps the surfaces Obsidian-native; leaves the header, the role and the stack rule where they
are.
<!-- /ANCHOR:adr-004-decision -->

---

<!-- ANCHOR:adr-004-consequences -->
### Consequences

**What improves** under either option: one written definition instead of three copies, and three
surfaces enter the lane.

**What it costs**: (a) changes what these surfaces look like on a phone — three-slot header,
declared title — so it needs its own captures. (b) leaves the header divergence and the missing
stack rule in place and closes only the duplication.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Deciding it here instead of asking | H | It is `051` T010's own recorded reason for being blocked; this ADR restates the question and does not answer it |
| The double-title defect ships either way | M | It is named above and belongs to whichever option lands, as its own task row |
<!-- /ANCHOR:adr-004-consequences -->
<!-- /ANCHOR:adr-004 -->
