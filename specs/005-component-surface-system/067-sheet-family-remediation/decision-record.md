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
    last_updated_at: "2026-09-07T00:05:00+02:00"
    last_updated_by: "operator-ruling-session"
    recent_action: "Flipped ADR-002, ADR-003, ADR-004 to Accepted per 2026-09-07 operator rulings"
    next_safe_action: "Implement T004-T008 per the four ADRs; ADR-001 is the only one still Proposed"
    blockers: []
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
    open_questions: []
    answered_questions:
      - "The depth cap itself is decided: design-trueup.md C4 adopts it in full as a shell rule"
      - "The 44px close survives the handle-less card: ADR-007 exception E1"
      - "Dimmed or undimmed parent under a menu card: Notion, per the operator's 2026-09-07 ruling — ADR-002"
      - "The page-under-sheet dim and the scale(0.96) pull-back: 0.52 scrim plus the pull-back, per the operator's 2026-09-07 ruling — ADR-003"
      - "The three FuzzySuggestModal surfaces: route through the shell, per the operator's 2026-09-07 ruling — ADR-004"
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

**Built, operator acceptance still pending.** The designed mechanism above is implemented exactly
as described — `overlayStack.register` offers a new sheet to its parent's `replace` callback when
that parent is already two deep, and only `panel`/`condition panel`-role `createSurfaceShell`
consumers ever set one. Verified: `overlay-stack.test.ts` (three new unit cases) and a live
`sheet-grammar.mjs` check driving real `createSurfaceShell` end to end, both the positive case (no
third sheet, content grafted, title swapped, back control shown) and a `dialog`-role negative
control (stacks to three, as a menu-stack must). **Not verified**: the two NAMED lane pairs this
ADR cites (`properties property type picker`, `add view property picker`) still assert their
pre-existing stack shape in `REGISTERED_STACKED_PAIRS` — both hops in that harness are synthetic
stand-ins rather than the real production call graph, so the mechanism is proven generically rather
than through those two specific rows. This status field stays `Proposed` because its own
"Deciders" row names the operator and nothing here changes that; what is now settled is that the
approach builds and measures as designed.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: A `menu` role presents as a handle-less card, and the close stays

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — the parent clause ruled 2026-09-07 ~00:05 Europe/Amsterdam; the close was already Accepted on ADR-007 **E1** |
| **Date** | 2026-09-06; parent clause 2026-09-07 |
| **Deciders** | Operator (E1 taken 2026-09-05 ~18:30; parent clause 2026-09-07 ~00:05) |

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

**Our own handle's contrast, measured (T003).** No figure existed for our own handle before this
packet — `--text-faint` at 0.65 opacity is theme-supplied and its hex is not declared in
`styles.css`. Computed against the harness's own light/dark token values (`--text-faint` composited
at 0.65 over `--background-primary`, WCAG relative-luminance contrast): **dark 2.150:1**, **light
1.838:1** — both below the 3:1 floor, and both below Anytype's own 2.21:1. E1's justification is
restated with our own number rather than left resting on Anytype's: the substituted handle is the
only non-text element identifying the dismissal control on the menu-role card, its contrast falls
short of WCAG 1.4.11 in both themes, and the 44px close is what carries the accessible dismissal
affordance instead.

### Constraints

- **Rows 26 and 31 disagreed about the parent** — row 26 dimmed, row 31 undimmed (`trueup:320`) —
  and the operator's 2026-09-07 ruling settled it by citing a third reference (Notion) rather than
  picking between them. Kept here as history: the disagreement is why the question was asked, not
  something still open.
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

**The parent clause is now Accepted.** Operator ruling, **2026-09-07 ~00:05 Europe/Amsterdam**,
verbatim: *"Notion"* — asked whether the handle-less menu card should dim the parent the way Anytype
shows (row 26) or leave it undimmed (row 31), the operator named a third reference instead of
choosing between the two ADOPT rows. **The ruling is read as: dim the parent, the way Notion's own
phone menus do** — this does not choose row 26's *reading* of Anytype, it supersedes the row
26-versus-31 question with a different source entirely, so re-reading either row no longer settles
anything here.

**The Notion reference and its measured band.** `051/notion-screens-digest.md` records the pattern
directly: row **B1** — *"'Insert Media' sheet … over a dimmed 'To do list' page"*
(`ios/menus/notion-ios-menus-context-menu-13-3601882d….webp`) — and row **A4** — *"a centred floating
dialog over a dimmed 'View options' sheet"*
(`ios/sheets/notion-ios-sheets-delete-confirm-01-55602f6a….webp`) both show a handle-less card over a
measurably dimmed parent, and both sit beside an unmodified before-frame of the same screen in the
harvest, which is what makes them measurable rather than merely described. Read with a one-off
Pillow script sampling background patches away from text, icons and the card itself, mean of RGB
channels as luminance:

| Capture | Dimmed patch (RGB, mean) | Undimmed control | Ratio |
|---|---|---|---|
| B1 — Insert Media over "To do list" | `(88, 88, 88)` — 3 patches, exact | `notion-ios-flow-page-actions-01-71f786c5…` — `(255,255,255)` / `(245,245,245)` at the same page, pre-menu | **0.349** |
| A4 — Delete-view dialog over "View options" | `(108, 108, 108)` — 3 patches, exact | `notion-ios-flow-deleting-a-view-02-2f0d2563…` — the identical sheet, one step before the dialog opens | **0.435** |

Two independent Notion captures, **0.35 and 0.44**, mean **≈0.39** — both markedly stronger than
`048`/`051`'s own Anytype-measured **0.519** for a page under a first sheet (ADR-003), which is
expected: this is a different product's dim on a different surface class, cited because the operator
named it, not because it is expected to match Anytype's number. **Threshold**: the menu-role card's
parent dims to **≈0.39** (band 0.35-0.44) of undimmed luminance, distinct from and not overriding
ADR-003's sheet-scrim figure.

**The 44px close stays** — unchanged from E1, not reopened by this ruling.
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
| The ≈0.39 Notion band drifts from whatever a first implementation renders | M | Re-measure the same two patches against the shipped `menu`-role card once T006 lands, the way ADR-003's own composite was re-verified rather than assumed |
| Desktop popovers move | H | Assert the desktop capture set `pixelHash`-identical, as `051` T011 did after the leading slot shipped unscoped |
<!-- /ANCHOR:adr-002-consequences -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: One dim, at the measured level, and the pull-back is dispositioned

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted** |
| **Date** | 2026-09-06; ruled 2026-09-07 |
| **Deciders** | Operator (2026-09-07 ~00:05 Europe/Amsterdam) |

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

**Operator ruling, 2026-09-07 ~00:05 Europe/Amsterdam, verbatim**: *"0.52 scrim plus the 0.96 scale
cue"*.

**Read as two clauses, both Accepted:**

1. **The page under a first sheet dims to 0.52 ± 0.02** of undimmed luminance (Anytype measured,
   `design-trueup.md` §6 C3's 0.519/0.520/0.505 three-band read — 0.52 is that figure at the
   precision the ruling gave it, and 0.519 stays the recorded measurement underneath it).
2. **The `scale(0.96)` pull-back is adopted**, not merely dispositioned either way, and the ruling
   extends its reach: a `scale(0.96)` push-back now applies **to the page under a first sheet**, the
   same depth cue the `.is-stack-parent` case already carries, rather than being a stacked-only
   affordance. The `translateY(4px)` component is not named in the ruling and is not re-opened by
   it — it rides with the existing `.is-stack-parent` declaration unchanged.

**The stacked-parent case stays at parity — the same 0.710 ± 0.02 *result*, not the same
inputs.** `93205d4d`'s measured **0.717** is a composite of two steps sharing one scrim: the single
scrim is hoisted between levels and composites onto *every* dimmed surface, so it is the same element
whether the sheet above it is the first or the second. Raising that scrim's alpha to reach the 0.52
band therefore also darkens the stacked composite, which currently reads `0.88 opacity × scrim`. Parity
is held by moving `.is-stack-parent`'s `opacity: 0.88` the other way, enough that
`new-opacity × new-scrim` still lands at 0.710 ± 0.02 — the ADR's title, "**one dim**", means one
scrim serving both cases with one recalibration, not two independent dims left alone.

**How it works**: the scrim alpha rises until the page under a first sheet reads 0.52 ± 0.02; because
that same scrim also composites under `.is-stack-parent`, its opacity constant is recalibrated in
the same commit so the two-step stacked composite still lands at 0.710 ± 0.02 — recalibrated, not
independently re-decided, since the *target* is unchanged and only the intermediate constant that
reaches it moves. The page under a first sheet also gains the `scale(0.96)` step
`.is-stack-parent` already declares, applied to that case for the first time rather than only the
stacked one. Re-measurement uses the same decoded-pixel method `93205d4d` used, on the same control,
so the after-numbers are comparable to the before-numbers rather than to an assertion.
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
| Giving the first-sheet page its own `scale(0.96)` step reads as a second, uncoordinated depth cue next to the already-adopted `.is-stack-parent` one | M | Reuse the `.is-stack-parent` declaration's own transform rather than writing a second one; measure the composite, not the declarations — the lane samples luminance, which is what the true-up measured |
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The three `FuzzySuggestModal` surfaces

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — option (a), ruled 2026-09-07 ~00:05 Europe/Amsterdam |
| **Date** | 2026-09-06; ruled 2026-09-07 |
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

**Operator ruling, 2026-09-07 ~00:05 Europe/Amsterdam, verbatim**: *"Route through the shell"*.

**We chose (a): route through `createSurfaceShell`.** The three surfaces — `BaseFileSuggestModal`
(`main.ts:3047`), `ImageFileSuggestModal` (`image-file-suggest-modal.ts:40`) and
`MarkdownFileSuggestModal` (`markdown-file-suggest-modal.ts:34`) — stop hand-rolling
`isTouchDevice` → `attachSheetChromeToModal` → `placeSheet` → `keepSheetPlaced` and gain the
composition's centred three-slot header, a declared role and a declared title, the same way
`DbModal` already demonstrates the whole integration at `db-modal.ts:120-133`. Option (b), the
FuzzySuggest-specific shim, is declined: it would have kept the surfaces Obsidian-native and left the
header divergence and the missing `048` stack rule in place, closing only the duplication rather than
the coverage hole AC-004 names.

**Threshold, now concrete**: the three named call sites are removed — **0** direct
`attachSheetChromeToModal` callers outside `surface-shell.ts`, no "or a written reason" survivor
clause needed, because the ruling picked the option that removes all three rather than the one that
would have kept them. `051` T010's `[B]` lifts: the question it was blocked on — join the shell or
stay native — now has an answer, and the disposition is (a).

**What ships alongside it, named in the same ruling's scope**: `BaseFileSuggestModal`'s double-title
defect (§ Context above) is fixed by the same route, since `createSurfaceShell` owns title rendering
and the duplicate-title path it replaces goes with it.
<!-- /ANCHOR:adr-004-decision -->

---

<!-- ANCHOR:adr-004-consequences -->
### Consequences

**What improves**: one written definition instead of three copies, three surfaces enter the lane
(`sheet-grammar.mjs`, T009), and the double-title defect closes as a side effect rather than a
separate fix.

**What it costs**: the three surfaces change what they look like on a phone — three-slot header,
declared title — so the route needs its own captures, same as any other `048`/`051` surface that
gained the composition.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Row 21's flip (`BaseFileSuggestModal` becoming Anytype's full-screen search) gets folded into this route instead of staying its own task | M | Named in Constraints as a separate task either way; this ADR is chrome-routing only |
| The double-title fix regresses silently once title ownership moves to the shell | M | Assert one title, not two, the same way `051` T016's scrape-fallback counter is asserted rather than eyeballed |
<!-- /ANCHOR:adr-004-consequences -->
<!-- /ANCHOR:adr-004 -->
