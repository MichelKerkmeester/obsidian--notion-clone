---
title: "Decision Record: Anytype Adoption"
description: "ADR-003 the capture outranks the research where they disagree, and the seven places they do. ADR-004 six thresholds are restated before any of them may be observed red. ADR-005 the measured Anytype geometry is adopted and its two contrast values are refused."
trigger_phrases:
  - "050 decision record"
  - "anytype adoption adr"
  - "capture wins decision"
  - "threshold restatement decision"
  - "anytype contrast refusal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/050-anytype-adoption"
    last_updated_at: "2026-09-05T13:20:00Z"
    last_updated_by: "design-agent"
    recent_action: "Read the capture sweep and recorded the three rulings T001 forced"
    next_safe_action: "Execute T002 against the restated thresholds"
    blockers: []
    key_files:
      - "specs/005-component-surface-system/050-anytype-adoption/design-trueup.md"
      - "screenshots/anytype/README.md"
      - "tools/mock-data/anytype/views-report.json"
      - "src/views/active-view-controls-renderer.ts"
      - "src/views/empty-state-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-050-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Does the sweep reach the six surfaces the first pass could not? Partly — view settings, the layout picker, the filter panel, the property and value pickers and the object context menu were reached; a view-tab right-click, an open cell editor, a drag under a sort and any phone filter surface were not."
      - "Do REQ-005 and REQ-011 need a visual reference? No. Confirmed at T001; both are behaviour and their tasks should stop carrying a capture field."
      - "Does the sticky scrollbar belong to the board only? No. The grid carries it at identical geometry."
---
# Decision Record: Anytype Adoption

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: Where the capture and the research disagree, the capture decides

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator (T001 dispatch), design agent |

---

<!-- ANCHOR:adr-003-context -->
### Context

`047` ranked fourteen items from `anytype-ts` source and the official docs, in an environment that
could not click. Goal D1 made reading the sweep a gate for exactly that reason. Reading it turned up
seven places where the shipped 0.56.5 build does not do what the source-derived research says it does,
and the dispatch's own rule is that the capture wins and the contradiction is named.

The seven are enumerated with their evidence in `design-trueup.md` §1. In short: the filter and sort
trigger icons are pixel-identical in every state; no chip row renders on any of 151 captures; the
sticky horizontal scrollbar is not board-scoped; the view switcher has no selector dropdown and the
duplicate/remove actions live in the settings panel rather than a tab menu; the object context menu
has five sections rather than four; an empty collection renders no empty-state block at all; and the
view-settings panel has no per-view default-template row in either of its captured forms.

**Amended 2026-09-05: two of the seven do not survive `053`'s T001, and this ruling is the reason
why.** ADR-003 says a capture beats a source read. It follows that a capture that was **opened**
beats a capture that was **not**, and `053` opened the catalogue List views and the `New ⌄` menu that
this packet's read never did.

- **C2 is withdrawn.** The chip rail is on eleven captures and is conditional — present on 5 of 5
  List views carrying a filter, absent on Grid, Gallery, Kanban, Calendar and Graph. This read
  scanned the four toolbar icons and never scanned the band beneath them, then reported an absence
  from a region it had not examined. `047` was right.
- **C7 narrows to the settings panel.** There is indeed no default-template row there; the control
  is one surface over, in the `New ⌄` menu's `Settings` section (`Default Type for this View`,
  `Template for this View`). `047` was right about the capability and wrong only about the surface.

Both errors are the same shape — **generalising from a single surface to the product** — and the
adopted page limit was a third instance of it (a flat 60 read off the gallery panel; the limit is
per-layout, Gallery 60 and Kanban 10, absent on four layouts). ADR-003 gains a second corollary:
**absence in one captured surface is evidence about that surface only.** C1, C3, C4, C5 and C6 are
unaffected and stand.

Two of these were checked against a natural control rather than accepted from one screen. The icon
result was scanned across all 120 catalogue captures and cross-checked against
`tools/mock-data/anytype/views-report.json`, which records which view carries the sort and which
carries the filter — so a filtered view and an unfiltered one were compared directly and measured
identical. The scrollbar result was measured on a grid and a kanban in the same window and found to
sit at the same y, the same height and the same width.
<!-- /ANCHOR:adr-003-context -->

<!-- ANCHOR:adr-003-decision -->
### Decision

Where a capture and `047` disagree, the capture is the fact and `047` is a source reading. A
requirement written from the research is rewritten to what the screen shows, and the contradiction is
recorded in `design-trueup.md` rather than quietly resolved.

Two corollaries, because the rule cuts both ways.

1. **Absence of a capture is not evidence of absence.** A view-tab context menu was never right-clicked
   in either capture phase. It may exist. What the packet may not do is design one from a screen
   nobody saw, so it stays marked *design inferred from source code, not seen*.
2. **A source-derived number survives where no capture can replace it**, and carries its provenance.
   The 92px flip boundary, the ~50ms settings-open figure, the 0.2s/0.1s motion pair and the "measured
   collapse, not a breakpoint" mechanism are all in this class. A borrowed number beats an invented
   one; it just may not be quoted as measured.
<!-- /ANCHOR:adr-003-decision -->

<!-- ANCHOR:adr-003-consequences -->
### Consequences

- Positive: the design the packet implements is the one the operator actually saw and called amazing,
  not a reconstruction of it from a repository.
- Positive: three of the seven contradictions turn out to be places where **we are ahead**, which
  removes work rather than adding it.
- Negative: `047` §5, §6, §8 and §9 now contain four claims this packet has shown do not hold in
  0.56.5. `047` is not reopened — it stays the owner of its own findings — so a future reader of the
  research alone will read them as true. Mitigation: every one is named in `design-trueup.md` §1's
  contradiction table, and this packet's `spec.md` §4 cites that table rather than the research.
- Negative: the object context menu was captured on a **page**, not on a multi-row selection, so the
  selection caps `047` describes have no capture either way.

### Alternatives Rejected

- **Keep the research's design and treat the captures as one build's quirks.** Rejected because the
  operator's ruling was about a product they used, and the product is the build. A design trued
  against source the operator never saw is the failure mode D1 exists to prevent.
- **Reopen `047` and correct it.** Rejected: `047` is closed and owns its captures and its Project
  Manager parity pass. Correcting a closed packet to keep a later one tidy trades one stale document
  for two.
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: Six thresholds are restated before any of them may be observed red

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Design agent, under goal D2 |

---

<!-- ANCHOR:adr-004-context -->
### Context

Goal D2 requires every item to close on a threshold observed **failing on the current tree** first.
Six of the fourteen assert a failing value the tree does not have, because the packet was authored
from `047`'s research without re-reading `src/views`.

- AC-001 asserts no chip row and one icon state. `active-view-controls-renderer.ts` renders the chip
  row — sorts first with a direction arrow and an ordinal, a conjunction chip, filter chips with a
  format icon and an `×`, `Clear all`, auto-hiding at `:93` — and it is constructed in
  `database-view.ts:396` and `embedded-database-renderer.ts:309`. `toolbar-renderer.ts:2204-2227` puts
  a count badge on both trigger buttons through `setBadge` at `:2575`.
- AC-005 asserts the tree has no restore. `database-viewport.ts` has one, with four request kinds; a
  view switch merely asks for `reset-top`.
- AC-008 asserts a fully-restricted selection renders an empty menu. `row-menu.ts`'s first row is
  unconditional, so it cannot. `bulk-edit-field-menu.ts:31-45` can.
- AC-009 asserts all conditions render the same empty state. `empty-state-renderer.ts:24-36` declares
  twelve reasons with a diagnosis function at `:209`.
- AC-013 asserts zero phone filter surfaces render per-format rows. They render on both viewports, and
  `filter-panel` and `sort-panel` are already registered in `tools/live/sheet-grammar.mjs`.
- AC-014 asserts the virtualization path is entered. No virtualization exists anywhere in `src/views`.

A threshold whose failing value is asserted wrongly is worse than no threshold: it will be "observed
red" against a condition nobody can produce, or it will be quietly softened at implementation time,
and either way D2's guarantee is gone.
<!-- /ANCHOR:adr-004-context -->

<!-- ANCHOR:adr-004-decision -->
### Decision

Each of the six is restated to the residue that is actually absent, and the restated form is what T002
measures. The restatements are in `acceptance-criteria.md` and summarised in `design-trueup.md` §4.

The rule the restatements follow: **assert what is missing, and separately assert what already works
so it cannot regress.** A row that ships today gets a lane row that would go red if it were removed —
that is a negative control on existing behaviour, which is cheap — rather than being deleted from the
packet as "already done". Deleting it loses the guard; keeping it as-written loses D2.
<!-- /ANCHOR:adr-004-decision -->

<!-- ANCHOR:adr-004-consequences -->
### Consequences

- Positive: every remaining threshold can be observed red, which is what D2 asked for and could not
  have got from the original wording.
- Positive: the six shipped behaviours gain permanent lane rows they did not have.
- Negative: the packet is materially smaller than its effort estimate. `plan.md`'s ~1660 LOC was sized
  against fourteen items built from nothing; six are now assertions over existing code. The estimate
  is corrected rather than left to be discovered mid-phase.
- Negative: `checklist.md` will carry "already true" beside six criteria where it expected a number.
  That is honest and it is also the evidence that T001 did its job.

### Alternatives Rejected

- **Drop the six items as already satisfied.** Rejected: five of the six have a real residue (the
  dual-mode toggle, per-view wiring of the restore, the bulk menu's empty case, the deleted-relation
  state, the three unseen grammar elements), and dropping the item drops the residue with it.
- **Keep the thresholds and let implementation discover the truth.** Rejected: that is exactly the
  "arrives green" failure D2 names, and it would produce six lane rows that were never red.
<!-- /ANCHOR:adr-004-consequences -->
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: The measured geometry is adopted; the two contrast values are refused

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Design agent |

---

<!-- ANCHOR:adr-005-context -->
### Context

The sweep yields a complete, internally consistent geometry for Anytype's popover system: 360px
panels, 256px menus, 28px rows everywhere, 8px radius, 16px horizontal and 8px vertical padding, 8px
divider clearance, 104 × 88px layout tiles on an 8px gutter, a 10px horizontal scrollbar 8px above the
viewport bottom, 48px full-page and ≈40px inline rows, and ~~a 60-row default page limit~~ **a
per-layout page limit — Gallery 60, Kanban 10, and no limit row on Grid, List, Calendar or Graph
(corrected 2026-09-05, `053` D4)**. A measurement outranks a default for the surface it covers, so
most of that is simply adopted — and the page limit is the reminder that "the surface it covers" is a
real constraint: a value measured on one layout's panel is a value for that layout.

Two of its values are not geometry, and they fail the bar this repository already holds.

- The preselected-row highlight measures `#232323` on a `#171717` panel: **1.14:1**. WCAG 1.4.11 asks
  3:1 of a non-text element that is the only thing identifying state, and this is the only thing
  identifying which row the keyboard is on.
- Active filter and sort state is signalled by nothing at all in the toolbar, and where Anytype does
  signal state it signals with hue alone. **Strengthened 2026-09-05 (`053` D1):** it does signal
  filter state, on a chip rail — and with hue alone at every level. The chip label `#3C7FFB` on its
  `#E2ECFE` fill measures **3.14:1** against the 4.5:1 a ~13px label needs; the fill against the bar
  measures **1.19:1**; the inactive view tab `#B6B6B6` on white measures **2.03:1**; the `New`
  button's white label measures **3.74:1**. The refusal is unchanged and now has four more
  measurements behind it, and the rail's **geometry** is adopted where its colour is not.

A third class is not a quality question but an ownership one: `#3C7FFB`, `#B6B6B6` and `#EBEBEB` are
fixed values in a product that owns its own palette. This is an Obsidian plugin, where the user's
theme owns those tokens.
<!-- /ANCHOR:adr-005-context -->

<!-- ANCHOR:adr-005-decision -->
### Decision

Adopt the measured geometry. Refuse the two contrast values. Keep every colour on our own theme
tokens.

Three of the adopted numbers are adopted twice over, which is why they are not arguable: **360px** is
the measured panel width and the top of our own `panel` role (`design-system.md` §5, 292-360px);
**8px** is the measured radius and the radius our own design already asks for (§10); **28px** is the
measured row height and the coarse-pointer touch floor §9 already sets.

Where our own value is documented and differs, ours wins: the **292px** `menu` role beats Anytype's
256px, and our **13px** menu type beats its 14px. Where ours is a range and the measurement sits
inside it, the measurement fixes the number.

**One deviation, stated rather than absorbed.** 28px is not on the 4/8/12/16/24/32 scale a greenfield
design would pick from. It is adopted because a measurement and an established project value agree on
it, and both outrank a scale default. On the phone the floor stays `044`'s 44px close.

**Motion.** `047` §10's 0.2s enter / 0.1s exit is source-derived and no capture can confirm it. 200ms
enter is in band for a small state change. 100ms exit is below the 120ms floor for direct feedback and
would read as a cut. Enter **200ms `ease-out`**, exit **150ms `ease-in`**.
<!-- /ANCHOR:adr-005-decision -->

<!-- ANCHOR:adr-005-consequences -->
### Consequences

- Positive: the geometry is quotable — every number in `design-trueup.md` §2 has a file and a pixel
  range behind it — so an implementer does not have to re-derive anything or guess.
- Positive: three numbers are confirmed by two independent authorities at once, which is the strongest
  form the packet can offer.
- Negative: a reader who knows Anytype will find our menus 36px wider and our selection highlight
  visibly stronger than the product they liked. That is the intended trade and it is recorded here so
  it is not later "fixed" back toward the reference.
- Negative: refusing the accent means the adopted surfaces will look like Obsidian rather than like
  Anytype. Correct for a plugin, and worth saying out loud since the operator's ruling was about how
  Anytype looks.

### Alternatives Rejected

- **Adopt the palette too, for fidelity.** Rejected: an Obsidian plugin that ignores the user's theme
  is a worse product than one that borrows only structure, and it would break in every non-default
  theme.
- **Adopt the 1.14:1 highlight and add a second signal beside it.** Rejected: the second signal would
  be doing all the work while a near-invisible background pretended to. Raise the background instead.
<!-- /ANCHOR:adr-005-consequences -->
<!-- /ANCHOR:adr-005 -->
