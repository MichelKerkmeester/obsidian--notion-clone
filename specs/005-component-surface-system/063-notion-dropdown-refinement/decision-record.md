---
title: "Decision Record: Notion Dropdown, Menu and Picker Refinement"
description: "Eight decisions from the Notion research loop: six naming a conflict and leaving the landed Anytype ruling standing, and two the operator has ruled or must rule."
trigger_phrases:
  - "063 decision record"
  - "notion dropdown adr"
  - "sheet escalation adr"
  - "colour label adr"
  - "destructive carve-out adr"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/063-notion-dropdown-refinement"
    last_updated_at: "2026-09-06T18:20:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Recorded eight decisions from the Notion research synthesis"
    next_safe_action: "Put ADR-004 and ADR-005 to the operator"
    blockers:
      - "ADR-004 and ADR-005 are Proposed and operator-owned"
    key_files:
      - "specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization/decision-record.md"
      - "specs/005-component-surface-system/roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-063-decisions"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Visible colour labels, or the landed accessible name plus check icon"
      - "A structure-removal carve-out to E3, or E3 whole"
    answered_questions:
      - "Six Notion-versus-Anytype conflicts already have a landed ruling and it stands"
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Notion Dropdown, Menu and Picker Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Under the parent's **D15**, a Notion finding never silently overrides a landed Anytype ruling.
> Where the two disagree, the record names both readings. Six of the eight decisions below do exactly
> that and change nothing; two are the operator's, one already ruled and one still open.

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The phone sheet's search count gate stays the phone's alone

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator (via `052` ADR-006); recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-001-context -->
### Context

Notion shows a search field on its iOS pickers regardless of option count — `8ff7ae4b` puts one over
a three-option list, `86a8e66c` opens the Add-filter sheet with search first. Our phone sheet gates
the search row behind `options.searchable === true && options.options.length > 8`
(`dropdown-field.ts:228`). Read on its own, the digest looks like evidence for removing the gate.

It is not, because the gate was ruled on the same day the combobox landed. `052` ADR-006 ¶1: *"The
count gate is the phone's alone… On a phone sheet the old condition is untouched, so `044`'s sheet
grammar and its registered pairs are unchanged."* The research loop opened this as a candidate
improvement in iteration 1 and closed it in iteration 2 on that text.

### Constraints

- `044`'s registered sheet pairs assume the current phone grammar; changing what the sheet contains
  at low option counts moves them.
- The desktop half of the same line is already unconditional and is not in question.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: keep the phone sheet's `> 8` count gate exactly as it is, and record Notion's iOS
evidence as a named non-adoption rather than acting on it.

**How it works**: `dropdown-field.ts:228` is not edited by this packet. If the operator ever wants
the phone gate re-opened, the check is a phone sheet-space measurement, not a desktop one — that is
the only work this decision defers.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- The phone grammar and `044`'s registered pairs stay untouched, so nothing this packet does can
  move them.

**What it costs**:
- A phone user with four options still has no filter. Mitigation: the operator can re-open it, and
  the measurement they would need is named above.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The digest is read later as an unactioned gap | L | This ADR is the record that it was read and dispositioned |
<!-- /ANCHOR:adr-001-consequences -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: One checkmark grammar — Notion's entity-selection filled circle is refused

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator (via `052` ADR-005 refusal 4); recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-002-context -->
### Context

Notion's N2 carries three selection indicators, not one: a plain trailing checkmark, a **blue filled
circular check** on person and entity pickers (`7174b226`), and a radio control in one sort-order
list (`aeb6d373`). All three are trailing; they differ in shape by picker kind.

`052` ADR-005 refusal 4 already refused exactly this shape when Anytype's iOS offered it: *"iOS's two
checkmark grammars… One product, two ticks for one affordance, is the exact defect G14 exists to
close."* Notion's circle is that second grammar arriving from a second product.

### Constraints

- G14 is landed and this packet's REQ-001 is the leg that finishes honouring it. Adopting a second
  indicator in the same release would undo the reason for the first.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: one trailing checkmark for every selection in the family, in the dropdown, the relation
picker, the option editor and the colour picker alike.

**How it works**: no code change. The refusal is recorded so a later reader who finds `7174b226` in
the digest can see it was considered rather than missed.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**:
- The family reads as one product. A person learning the tick in one picker knows it everywhere.

**What it costs**:
- Entity pickers lose a visual cue Notion uses to say "this row is a person, and it is selected".
  Mitigation: the relation picker's own row already carries a record icon, which does that work.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future picker kind wants its own indicator | L | It would be a new ADR against G14, not a silent addition |
<!-- /ANCHOR:adr-002-consequences -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: Notion's radio grammar is not adopted

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | The Notion synthesis, under G14 and N2's own rule |

---

<!-- ANCHOR:adr-003-context -->
### Context

`aeb6d373` shows a radio-button column in one Notion surface: a search-results sort-order list. It is
the third of N2's three indicators, and the digest's own observation is that the three are **never
mixed within one list**.

We have no surface that matches. Our single-select lists are dropdowns and pickers, all of which
already carry the trailing tick that G14 rules and that REQ-001 finishes landing.

### Constraints

- Adding a radio to any of our lists would put two indicators in one product, which is the same
  defect ADR-002 refuses, and it would break N2's own never-mixed rule at the same time.
<!-- /ANCHOR:adr-003-context -->

---

<!-- ANCHOR:adr-003-decision -->
### Decision

**We chose**: no radio grammar. The trailing tick carries every single-select in the family.

**How it works**: no code change; a ruled-out direction recorded so it is not re-proposed.
<!-- /ANCHOR:adr-003-decision -->

---

<!-- ANCHOR:adr-003-consequences -->
### Consequences

**What improves**:
- One fewer indicator to keep consistent across four pickers and a menu grammar.

**What it costs**:
- Nothing measurable: no current surface asked for it.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future exclusive-choice surface reads ambiguously with only a tick | L | Revisit against a real caller, not against a screenshot |
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: Whether a colour swatch carries a visible label

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — open |

---

<!-- ANCHOR:adr-004-context -->
### Context

Notion presents colour choice as a **one-column labelled list**: swatch plus name per row, trailing
check on the selected one (`e5accf4d`, N4). We ship a 12-swatch grid.

The grid itself is settled and is not what this ADR asks about. G15 dispositioned it — keep the grid,
a shipped surface with a registered `048` capture pair, and adopt the named colours **as accessible
names** — and that clause has landed: `option-color-picker.ts:40-63` sets `"aria-label": color` per
swatch with the comment *"the choice is never colour-only"*, puts a `check` icon on the selected
swatch so the state has a shape rather than a hue, and sets `title: color` for a hover label. The
module comment at `:23-26` records the disposition verbatim.

So the anti-colour-only rule is satisfied three ways over. What remains is a **preference**: whether
the name should also be visible without hovering or using a screen reader.

### Constraints

- The picker's width role is a hard 124 (`popover-host.ts:237-241`). A labelled list does not fit
  that role, so adopting labels means a new width role and a new capture pair, not a CSS tweak.
- `048` holds a registered capture pair for the current grid.
<!-- /ANCHOR:adr-004-context -->

---

<!-- ANCHOR:adr-004-decision -->
### Decision

**We chose**: nothing yet. This is put to the operator as written, with the recommendation to
**keep the grid**.

**How it works**: no code change while this is Proposed. If the operator wants visible labels, the
work is a new width role, a one-column list layout and a re-registered capture pair — a small packet
of its own, not a line in this one.
<!-- /ANCHOR:adr-004-decision -->

---

<!-- ANCHOR:adr-004-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Keep the grid (recommended)** | Landed, captured, accessible name + hover title + shape-coded selection already satisfy the rule; 124px stays a cheap surface | The colour's name is not visible at rest | 8/10 |
| One-column labelled list, Notion's shape | Name always visible; matches `e5accf4d` exactly | New width role, new capture pair, a much taller surface for twelve choices | 6/10 |
| Labelled grid — name under each swatch | Keeps the grid's compactness ordering | Twelve labels in a 124px column is unreadable; needs a wider role anyway | 4/10 |

**Why this one**: the accessibility ground the labels would serve is already covered by three landed
mechanisms, so the change is a preference, and preferences are the operator's.
<!-- /ANCHOR:adr-004-alternatives -->

---

<!-- ANCHOR:adr-004-consequences -->
### Consequences

**What improves**:
- If adopted: a colour's name is readable without hovering.

**What it costs**:
- If adopted: a taller picker, a new width role, and a re-registered `048` pair.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The question is read as an accessibility gap rather than a preference | M | This ADR states the three landed mechanisms explicitly |
<!-- /ANCHOR:adr-004-consequences -->

---

<!-- ANCHOR:adr-004-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | FAIL | The rule it would serve is already satisfied by `option-color-picker.ts:40-63` |
| 2 | **Beyond Local Maxima?** | PASS | Three shapes weighed above |
| 3 | **Sufficient?** | PASS | If wanted, the one-column list is the whole change |
| 4 | **Fits Goal?** | FAIL | Not on this packet's critical path; nothing else waits on it |
| 5 | **Open Horizons?** | PASS | A width role is additive and reversible |

**Checks Summary**: 3/5 PASS — which is why it is Proposed rather than planned.
<!-- /ANCHOR:adr-004-five-checks -->
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: Whether E3 takes a carve-out for structure-removing rows

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — open |

---

<!-- ANCHOR:adr-005-context -->
### Context

Notion is inconsistent about destructive rows, and the inconsistency looks deliberate: red **with** an
icon for content-destroying rows; red **without** an icon on `Remove` rows (`5f81b365`, `ca4fd83f`);
and **plain text, no red at all** for rows that remove structure without destroying content —
`Remove grouping` (`e9698e1b`), `Delete filter` (`299e69bb`).

The research loop proposed a carve-out on that reading in iteration 1, then withdrew it in iteration
4 against the authority documents. `051` ADR-007 exception **E3**, recorded in `roadmap.md` §6A on
2026-09-05 ~18:30, rules red-plus-trash-icon on **every** destructive row, with the stated reason that
*"Anytype's own minority answer carries no non-colour signal"*. E3 is universal by construction, so
the carve-out is not a recommendation this packet can make.

### Constraints

- E3 is an operator ruling. D1 forbids overturning it here.
- The distinction Notion draws — content versus structure — is real and would need a definition
  before any code could implement it. "Removes a filter" and "deletes an option and its values" are
  genuinely different acts.
<!-- /ANCHOR:adr-005-context -->

---

<!-- ANCHOR:adr-005-decision -->
### Decision

**We chose**: E3 stands whole. The carve-out is recorded as an operator question and nothing else.

**How it works**: no code change. If the operator wants the carve-out, it needs a definition of
"removes structure without destroying content" that a reviewer can apply to a row without asking,
and that definition belongs in `051`'s record, not this packet's.
<!-- /ANCHOR:adr-005-decision -->

---

<!-- ANCHOR:adr-005-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **E3 whole (recommended)** | One rule, no judgement call at any call site; every destructive row carries a non-colour signal | A `Remove grouping` row looks as grave as deleting an option | 8/10 |
| Notion's three-way split | Matches the digest exactly; visual weight matches actual consequence | Three rules, each needing a per-row judgement; two of the three carry no non-colour signal, which is what E3 exists to prevent | 4/10 |
| A named two-way carve-out: red+icon for destroying, plain for structure removal | Only one boundary to define; keeps a non-colour signal where it matters most | Still needs the boundary defined; re-opens a ruling that closed a day earlier | 6/10 |

**Why this one**: E3 is landed, and the case for re-opening it is a visual-weight argument with no
accessibility ground behind it. That is precisely the kind of call the operator takes, not us.
<!-- /ANCHOR:adr-005-alternatives -->

---

<!-- ANCHOR:adr-005-consequences -->
### Consequences

**What improves**:
- One rule for every destructive row, and no reviewer ever has to classify one.

**What it costs**:
- Low-consequence rows read as heavily as high-consequence ones.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Red fatigue: everything red means nothing is | M | Recorded here; the operator has the data to decide |
<!-- /ANCHOR:adr-005-consequences -->

---

<!-- ANCHOR:adr-005-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | FAIL | No defect is open against E3; this is a visual-weight preference |
| 2 | **Beyond Local Maxima?** | PASS | Three dispositions weighed above |
| 3 | **Sufficient?** | FAIL | The two-way carve-out needs a boundary definition that does not exist yet |
| 4 | **Fits Goal?** | FAIL | Outside this packet's scope; `051` owns the rule |
| 5 | **Open Horizons?** | PASS | Recording the question costs nothing and keeps it findable |

**Checks Summary**: 2/5 PASS — Proposed, and recommended against.
<!-- /ANCHOR:adr-005-five-checks -->
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: The popover-versus-docked-panel split is already ruled

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator (via `051` ADR-008); recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-006-context -->
### Context

Notion's N12 records an inconsistency in Notion itself: the same "Edit property" content appears once
as a floating popover and once as a **right-docked side panel** (`1d99acb0`), and the full view
settings appear as a panel too (`50d73158`). Read cold, that is an open question about which host our
family should use.

It is not open. `051` ADR-008, ruled 2026-09-06 ~08:15 and recorded in `roadmap.md` §6A, converts the
database settings panel to a 420px right-docked side sheet while menus and pickers stay anchored
surfaces. Both shapes exist here already, each on its ruled surface.

### Constraints

- ADR-007 below adds a *third* presentation for one specific measured condition. It does not reopen
  this split; it adds an escape hatch inside the anchored half.
<!-- /ANCHOR:adr-006-context -->

---

<!-- ANCHOR:adr-006-decision -->
### Decision

**We chose**: no host change from N12. Settings are a right side sheet; menus and pickers are
anchored surfaces.

**How it works**: no code change. Notion's own inconsistency needs no decision from us because our
split is already ruled per surface.
<!-- /ANCHOR:adr-006-decision -->

---

<!-- ANCHOR:adr-006-consequences -->
### Consequences

**What improves**:
- The digest's most structural-looking finding is closed without touching a host.

**What it costs**:
- Nothing. Both shapes were already built.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| ADR-007's escalation is read as reopening this | M | ADR-007 states its condition in measured terms and applies only to dropdowns |
<!-- /ANCHOR:adr-006-consequences -->
<!-- /ANCHOR:adr-006 -->

---

<!-- ANCHOR:adr-007 -->
## ADR-007: A cramped desktop dropdown escalates to a sheet with a dedicated button

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — ruled directly |

---

<!-- ANCHOR:adr-007-context -->
### Context

The operator's ruling: **where the anchored popover is cramped, a desktop dropdown should become a
sheet with a dedicated button.**

Today the desktop dropdown has exactly one presentation. `dropdown-field.ts:421` places every one of
them with `{ preferredWidth: 280, maxWidth: 360, minWidth: 180, gap: 6, align: "left" }`, and the
sheet branch at `:224` is guarded by `isMobileBottomSheet`, so it is unreachable on desktop. When the
anchored arithmetic cannot find room, the surface shrinks toward 180px or its list scrolls under
`owned-menu.ts:360`'s `max(120, bounds.height - margin * 2)` cap. Neither is a failure the code
reports; both are just a smaller surface.

Notion carries the same escalation in three forms: a sheet with a `Done` header (`9acbba50`), a
docked panel where a floating popover would be cramped (`1d99acb0`, `50d73158`), and an explicit
escalation row into a fuller picker (`cfca14fb`, "Choose date ›"). None of them is our shape exactly,
and per D3 none of them supplies a value — they establish that the move is a real pattern, and our
own placement code supplies the trigger.

### Constraints

- "Cramped" must be measured or the criterion is unfalsifiable and the escalation will fire on the
  wrong surfaces.
- `048`'s stacking model and `044`'s sheet grammar govern anything that presents as a sheet.
- `052`'s D6: the decision belongs in the primitive, not at 29 `createDropdownField` call sites.
<!-- /ANCHOR:adr-007-context -->

---

<!-- ANCHOR:adr-007-decision -->
### Decision

**We chose**: the dropdown primitive gains a third presentation — a desktop sheet, opened by a
dedicated button — chosen on a measured condition rather than a per-call-site flag.

**How it works**: at open, the primitive asks the placement code what it could actually give the
anchored popover. The surface is cramped when **either** the anchored placement cannot honour
`preferredWidth: 280` and falls toward `minWidth: 180`, **or** the panel's height reaches
`owned-menu.ts:360`'s viewport cap so the list scrolls. Either condition escalates: the popover is
not opened, and the dedicated button presents the sheet instead. When a sheet has no room either, the
primitive falls back to today's anchored popover rather than pinning a surface to the viewport top —
the failure `popover-position.ts:48-58` already documents from the `dockTo` history.
<!-- /ANCHOR:adr-007-decision -->

---

<!-- ANCHOR:adr-007-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Measured escalation in the primitive (chosen)** | One decision point; the trigger is re-derivable by any reader; no call site learns a new flag | Needs the placement code to report what it gave, which it does not do today | 8/10 |
| A per-call-site `presentAsSheet` flag | Trivial to implement; the author of each surface decides | 29 call sites each holding a judgement; drifts the moment a layout changes; exactly the pattern `052` exists to remove | 3/10 |
| Always a sheet on desktop | No condition to get wrong | Turns every two-option dropdown into a sheet; contradicts `051` ADR-008's anchored-menus half | 2/10 |
| A docked side panel, Notion's `1d99acb0` shape | Matches the digest most literally | `051` ADR-008 already assigns the docked panel to settings; a second docked host would blur the split ADR-006 just recorded | 4/10 |

**Why this one**: the operator's ruling names a condition ("where the popover is cramped"), and the
only way to honour a conditional ruling without guessing is to make the condition something the code
computes and a reader can check.
<!-- /ANCHOR:adr-007-alternatives -->

---

<!-- ANCHOR:adr-007-consequences -->
### Consequences

**What improves**:
- A long or wide option list stops being squeezed into a 180px column beside its trigger.
- The escalation is one rule, so a new dropdown inherits it without its author knowing it exists.

**What it costs**:
- A third presentation to keep green in the lanes. Mitigation: it reuses `044`'s sheet grammar and
  `048`'s stacking rather than inventing chrome.
- The placement code must report its outcome. Mitigation: it already computes both numbers; the
  change is returning them, not deriving them.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The measured condition selects surfaces the operator does not consider cramped | H | AC-011 is the operator's read; the threshold is one line and tunable without touching call sites |
| A dropdown escalates mid-interaction and loses the typed query | M | The surface is re-presented rather than mutated; ADR-008 requires the search input to survive |
| Two open surfaces at once if the registry is bypassed | M | The escalated sheet goes through `popover-host.ts`'s one-per-document active-picker registry like every other picker |
<!-- /ANCHOR:adr-007-consequences -->

---

<!-- ANCHOR:adr-007-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The operator reported cramped popovers; today there is no second presentation at all |
| 2 | **Beyond Local Maxima?** | PASS | Four options weighed, including the two the digest suggests |
| 3 | **Sufficient?** | PASS | One branch in one primitive, on numbers the placement code already has |
| 4 | **Fits Goal?** | PASS | REQ-004, a P0 of this packet |
| 5 | **Open Horizons?** | PASS | The threshold is a single condition, tunable without touching any caller |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-007-five-checks -->

---

<!-- ANCHOR:adr-007-impl -->
### Implementation

**What changes**:
- `src/views/dropdown-field.ts` — the escalation branch beside the phone-sheet branch at `:224`, and
  the placement call at `:421` reporting what it could give.
- `styles.css` — the escalated surface's chrome, reusing `044`'s sheet grammar rather than new rules.
- `src/views/dropdown-field.test.ts` — the branch's condition, both ways.

**How to roll back**: the branch is one commit against one file group. `git revert` it and the
primitive is back to a single desktop presentation; no caller changed, so nothing else moves.
<!-- /ANCHOR:adr-007-impl -->
<!-- /ANCHOR:adr-007 -->

---

<!-- ANCHOR:adr-008 -->
## ADR-008: Search is unconditional on desktop, and the escalation must preserve it

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — ruled, and landed at `a952e5e7` via `052` ADR-006 |

---

<!-- ANCHOR:adr-008-context -->
### Context

Every desktop dropdown opens with a search input active. That is a landed operator ruling, not a
proposal: `052` ADR-006 was rewritten from a refusal into the ruling it should have been, and
`dropdown-field.ts:228` now reads `searchable = phoneSheet ? options.searchable === true &&
options.options.length > 8 : true`, with the comment *"Every desktop dropdown is a combobox: the list
filters as you type, whatever its length."* Notion's own evidence agrees at any count (**N3**,
`8ff7ae4b` over a three-option list).

ADR-007 adds a second desktop presentation. A new presentation is exactly where a landed rule quietly
stops applying, because nobody wrote it down for the shape that did not exist yet.

### Constraints

- The phone sheet's count gate is out of scope here — ADR-001 above.
- `a952e5e7`'s census recorded 52 call sites, none of which changed. The escalation must not become
  the 53rd exception.
<!-- /ANCHOR:adr-008-context -->

---

<!-- ANCHOR:adr-008-decision -->
### Decision

**We chose**: the combobox rule binds every desktop presentation of a dropdown, including the sheet
ADR-007 introduces. The escalated surface opens with a search input present and focused.

**How it works**: REQ-005 and AC-006 carry it as a criterion, and T007 carries the assertion. The
rule is restated here rather than assumed, because a rule that lives only in a branch nobody has
written yet is not a rule.
<!-- /ANCHOR:adr-008-decision -->

---

<!-- ANCHOR:adr-008-consequences -->
### Consequences

**What improves**:
- The escalation cannot silently become a place where typing stops working.

**What it costs**:
- The escalated sheet must find room for a search row before its list. Mitigation: it is a sheet;
  room is the reason it exists.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Focus lands on the sheet rather than its input | M | AC-006 asserts the input is focused, not merely present |
| The typed query is lost when a popover escalates | M | ADR-007's consequences carry the re-presentation rule; the query is carried across |
<!-- /ANCHOR:adr-008-consequences -->
<!-- /ANCHOR:adr-008 -->
