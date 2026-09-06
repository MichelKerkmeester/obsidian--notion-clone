---
title: "Decision Record: Notion Board Refinement"
description: "Eleven decisions: seven declines a landed Anytype ruling already settles, and four the operator owns — whether to adopt Notion's group management at all, whether to wrap board text, what 'Hide empty groups' defaults to, and what happens to two actions no host implements."
trigger_phrases:
  - "059 decision record"
  - "notion board adr"
  - "board groups panel adr"
  - "showGroup adr"
  - "notion vs anytype board decline"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/059-notion-board-refinement"
    last_updated_at: "2026-09-06T16:36:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 18:36 rulings; ADR-004, ADR-010, ADR-011 Accepted"
    next_safe_action: "Build the Groups panel; hide-empty-groups defaults ON"
    blockers: []
    key_files:
      - "src/views/board-renderer.ts"
      - "specs/005-component-surface-system/056-board-anytype-parity/notion-screens-digest.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-059-decisions"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "ADR-009: does a board-level wrap switch belong here, against a criterion that asks for the opposite — Proposed, and it proposes no change"
    answered_questions:
      - "Seven of the nine conflicts the research named are already decided by a landed operator ruling"
      - "Notion's group management is adopted as one Groups panel"
      - "Hide empty groups defaults ON, matching Notion and reversing this packet's proposal"
      - "hideGroup is wired; deleteGroup is deleted with its i18n keys"
---
# Decision Record: Notion Board Refinement

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

**How to read the status column.** `goal.md` D1 sets the rule: a Notion-vs-Anytype conflict that a
landed operator ruling already decides is **Accepted** citing that ruling; one no ruling has touched
is **Proposed** and waits for the operator. **Ten are Accepted here and one is Proposed.** Seven were
Accepted at opening on a landed ruling; three more — ADR-004, ADR-010 and ADR-011 — were ruled by the
operator on **2026-09-06 18:36** and are quoted verbatim below. ADR-009 is the one still Proposed,
and it proposes doing nothing, so nothing waits on it. **No code leg in this packet is gated.**

The research's conflict register (`../056-board-anytype-parity/research/research.md` §9) carries
nine rows. The digest's own list (`../056-board-anytype-parity/notion-screens-digest.md:236-257`)
carries seven of them; the loop added two — the header *treatment* (ADR-003) and the board-level
text wrap (ADR-009). ADR-010 and ADR-011 come from the shape of the one adoption rather than from
the register.

---

<!-- ANCHOR:decisions -->

## ADR-001: Notion refines this board; it does not re-target it

**Status**: **Accepted** — parent `goal.md` D15 and `../roadmap.md` §7.15, operator 2026-09-06
~16:10.

**Context.** Two instructions are live at once and neither withdraws the other. The board's parity
target is Anytype (`056` ADR-001, operator 2026-09-05 ~22:45: *"Board UI/UX should almost be 1:1
Anytype"*). The Notion harvest arrived four hours before this packet opened, with *"add phases to
all ui improvement phases to further refine based on notion ui screenshots"*. On chip ink, on
density and on where a menu lives, the two products draw different pixels.

**Decision.** Notion is additive. This packet may add a criterion, a task, an ADR or a measurement.
It may not un-tick a measured row, rewrite a landed ruling, or move a parity target. Where a Notion
finding contradicts a landed Anytype ruling, the contradiction is written down with both readings
and stops there.

**Consequences.**
- Seven of the nine conflicts below resolve without asking anyone, because a ruling already decided
  them. That is the rule working, not the rule being lazy.
- The one genuine adoption candidate (ADR-004) needs the operator precisely because `056` D3's
  parity-by-default logic has no clause for *adding* beyond what Anytype shows.

**Alternatives rejected.**
- *Treat Notion as a second parity target.* Rejected: it would make every value in this program a
  two-reference negotiation, and `../roadmap.md` §7.15 already ruled otherwise.

---

## ADR-002: The desktop column header keeps no record count

**Status**: **Accepted** — `056` ADR-002 and D3, on `design-trueup.md` A1.

**Context.** Notion shows the count beside the label unconditionally, on web and on iOS, in every
board capture that shows a header at rest (`notion-screens-digest.md:109-117`, `:236-238`). Anytype
measures no count anywhere on the desktop board and shows one on phone only (A1).

**Decision.** Anytype's reading stands. Ours already matches it: the count is created inside the
touch branch alone (`board-renderer.ts:294`) and styled as plain text
(`styles.css:9489`).

**Consequences.** Zero lines change. The disagreement is on the record so the next reader does not
re-derive it from the Notion screens.

---

## ADR-003: The header chip keeps Anytype's tint fill

**Status**: **Accepted** — `056` ADR-006, decided by the operator 2026-09-06 ~05:25, implemented the
same day.

**Context.** Notion's web header is a coloured dot plus a plain, uncoloured label and a plain count,
with no chip container at all (`98dde396`; digest `:78`). Ours is a 24px chip that takes the option's
own tint as a fill — `background: var(--db-status-bg, transparent)` at `styles.css:9440`.

**Decision.** The fill stands. It is newer than the digest's description of it, operator-ruled, and
WCAG-motivated: the same ruling darkened the text so twenty-two colour pairs read at or above 4.5:1
in both themes.

**Consequences.**
- Notion's dot-plus-small-grey-text would re-introduce the contrast class `056`'s E1 declined
  (`design-trueup.md:349-352`).
- The digest's own header paragraph predates the ruling and is now wrong about our tree. Filed as
  erratum **E-1**, `tasks.md` T003.

---

## ADR-004: Adopt Notion's group management, as a `panel` rather than a screen

**Status**: **Accepted 2026-09-06 18:36.** Operator, verbatim: *"Yes, one Groups panel"*. It was the
gate on every code leg in this packet; it is not any more.

**Context.** Notion puts per-group visibility, hide-all, show-all, drag-handle reorder and "Remove
grouping" on one dedicated surface (`30ba5533`, `f6d1e7e6`, `e9698e1b`, `2ef31bd5`; digest
`:119-127`). Anytype ships one "Hide Column" toggle per column and nothing else (`design-trueup.md`
§2b). The digest declines to resolve it: *"Neither reference is closer to ours than the other is far
from it"* (`:246-247`), and asks the operator directly at `:277-281`.

Our own state is worse than either reference, and worse than the research inferred. `hideGroup?` and
`deleteGroup?` are declared at `board-renderer.ts:84-85`; **neither host implements them**
(`database-view.ts:791-830`, `embedded-database-renderer.ts:532-563`), so the two rows guarded on
them at `:558-559` have never rendered, and `config.boardHiddenGroups` has no board-mounted writer
or restorer at all. The board has a visibility axis in its data model and no visibility at all in
its UI.

**Decision, accepted.** Adopt the pattern, not the presentation — and the operator's own words name
the shape as well as the answer: **one** panel, not a panel per concern. A **Groups panel** in the `panel`
role — 292-360px, local anchor, trapped focus, Escape or outside click to dismiss
(`../design-system.md:77`, `:126`) — entered from one new row in the column menu the reader already
opened to hide the group (`renderBoardGroupOptions`, `:540-560`). Not a full screen: Notion's is a
screen because Notion's mobile grammar is screens, and `goal.md` D2 forbids importing a grammar
along with a pattern. The phone presentation goes through `044`'s sheet grammar.

**Alternatives considered.**

| Option | Why it might win | Why it does not |
|---|---|---|
| **A Groups panel (proposed)** | Closes the irreversibility with one surface, in the role the design system already defines | Adds a surface to a board the operator asked to keep 1:1 with a product that has no such surface |
| Wire `hideGroup` and stop there | The smallest possible change | Leaves the hide with no undo, which is the actual defect |
| A full Notion-shaped screen | Matches the reference exactly | Imports Notion's mobile grammar into a plugin whose grammar is `044`'s sheet — D2 |
| Do nothing | Anytype parity is preserved exactly | The dead visibility axis stays dead, and two i18n keys keep shipping in three locales for rows nothing renders |

**Consequences.** One new file, one member on `BoardRendererActions`, one flag, four captures, two
assertion rows, zero new gate lanes. The panel is the single surface: per-group visibility, hide-all,
show-all, drag-handle reorder and "Remove grouping" all live on it rather than being scattered across
the column menu, which is what *"one Groups panel"* settles beyond the yes. ADR-011 needed an answer
independently of this one and now has it: `hideGroup` becomes the panel's toggle-off.

---

## ADR-005: `···` and `+` stay hover-only on desktop

**Status**: **Accepted** — `056` D3 on `design-trueup.md` A1; digest `:239-242`.

**Context.** Notion's iOS captures show both controls permanently, even in an at-rest header
(`71f9dba2`, `c9d34319`). Notion's *web* hover state was never captured, so the desktop comparison
cannot be made from this harvest at all.

**Decision.** Anytype's reading stands for desktop. Ours already implements it and adds a keyboard
route the reference does not have: the reveal is scoped `:not(.is-touch)` with a `:focus-within`
fallback (`styles.css:9458-9464`). On phone both references agree with each other and with us.

**Consequences.** Zero lines change. The uncaptured web hover state is listed as a frontier the
digest cannot close (`:269-272`) and rides `056` AC-010 as device check 3.

---

## ADR-006: Sub-grouping stays unrendered

**Status**: **Accepted** — `056` D6; digest `:248-250`.

**Context.** Notion demonstrates "Sub-group by" as a real second axis — but on a **Table** view of
the same dataset (`65ed2da3`, `30ba5533`), never on a board. Anytype's kanban has no swimlanes at
all. `056` D6 retires or folds any board affordance with no Anytype counterpart.

**Decision.** No swimlane rendering. The absence stands.

**Consequences and one correction.** The digest's premise is wrong even though its conclusion holds:
our tree *does* carry a subgroup axis — `BoardSubgroup` at `board-renderer.ts:63-70`, the field
threaded at `:222`, subgroup group-updates in the drop path at `:639-640`, all gated on
`config.boardSubgroupEnabled`. What is still true is that the **rendering** is a flat strip:
`renderReferenceColumn` (`:263-341`) draws one row of columns and nothing reads the subgroup axis
for layout. Filed as erratum **E-2**, `tasks.md` T003.

---

## ADR-007: The add-card control stays the bordered box

**Status**: **Accepted** — `056` D3 on `design-trueup.md` A5; digest `:251-252`.

**Context.** Notion's "+ New page" is a bare, left-aligned text link with no border, no box and no
background (`71f9dba2`, `98dde396`). Anytype's is a bordered 246×42px box with a bare `+`.

**Decision.** Anytype's shape stands. Ours already ships it — a 42px bordered box on desktop
(`styles.css:9660-9672`) that becomes a labelled row at the 44px touch floor (`:9684-9698`) — and
the two references already agree on placement, the bottom of the column.

**Consequences.** Zero lines change. The control survived the page-scroll landing unmoved: it is
still the cards list's last flex child (`board-renderer.ts:336-341`).

---

## ADR-008: Card property rows stay icon-free outside relation

**Status**: **Accepted** — `056` D3 and D5 on `design-trueup.md` A4; digest `:253-255`.

**Context.** Notion puts a circular avatar before a Person value and renders select values as filled
colour pills (`98dde396`, `69f98d1d`). Anytype shows values only, with the relation's 16px icon as
the single exception.

**Decision.** Anytype's reading stands. An icon-per-type system is a new **vocabulary**, not a value,
and `056` D3 gives accessibility as the only ground for declining a measured Anytype value — it says
nothing that licenses adding a system Anytype does not have.

**Consequences.** Zero lines change. A Person-only middle path was considered and rejected in the
research: it re-introduces the per-type dedicated slot the Anytype rebuild explicitly retired.

---

## ADR-009: No board-level text-wrap switch, and the page limit stays at 10

**Status**: **Proposed** — a decline that no landed ruling makes, so it goes to the operator rather
than being taken silently. It gates nothing: it proposes changing nothing.

**Context.** Notion's Board layout sheet carries **"Wrap all properties (on)"** (`2050ac3d`; digest
`:84`) and a page limit of 25 for board and 50 for table (`:73`, `:94`). Our cards are single-line
by measurement — title ellipsis, description ellipsis, a 25px property pitch — and our kanban limit
is 10 (`board-renderer.ts:320`). The *mechanisms* already exist in both cases: the shared field
renderer takes `wrap: col.wrap`, and the limit is a real per-view setting.

**Decision, proposed.** Decline both.
- **Wrap:** a board-level switch would fight `056` AC-013, which asks for the opposite — left-
  aligned, single-token values ellipsised at the content edge — and which **landed at `dc1d54a9`
  and now reads Met**. Adding a default-off switch against a criterion that just went green is the
  worst of both.
- **Limit:** the magnitude is the only difference; Anytype's 10 is what `056` AC-008 already ships,
  and the digest rules for it (`:256-257`).

**Reopen it if.** The operator reports board text truncation as a defect. If a wrap switch is ever
taken, the table's own wrap rulings are the pattern to follow — a view switch that gates, measured
red-first per row.

---

## ADR-010: "Hide empty groups" defaults on

**Status**: **Accepted 2026-09-06 18:36.** Operator, verbatim: *"On by default, like Notion"*.
**This reverses the packet's own proposal**, which was to ship the setting defaulted `false`; the
title of this ADR was changed with it so the record does not read as the opposite of what was
decided.

**Context.** Notion ships the toggle **on** in all three of its group-management captures
(`30ba5533`, `e9698e1b`, `2ef31bd5`). Our board renders a shared empty card for an empty column
(`board-renderer.ts:324-327`), and that state is committed to eight captures and pinned by `056`
AC-011.

**Decision, accepted.** Ship the setting and default it **`true`**, matching Notion's own default in
all three of its group-management captures.

The argument this overturns is kept rather than deleted, because it names the work the ruling
creates: our board renders a shared empty card for an empty column (`board-renderer.ts:324-327`), and
that state is committed to **eight captures** and pinned by `056` AC-011. Defaulting the toggle on
means a default-configured board **no longer shows those columns at all**, so the empty-column state
is reachable only with the toggle switched off. Two things follow and are part of this decision:

- The eight captures and `056` AC-011 need a **named configuration** — the fixture that photographs
  the empty-column state sets `hideEmptyGroups: false` explicitly, rather than relying on a default
  that has now moved. A capture whose content depends on an unstated default is a capture that
  silently changes when the default does.
- The empty-column card is **not deleted**. It stays a designed state; the ruling changes which
  configuration reaches it, not whether it exists.

**Consequences.** One flag on `ViewConfig` (`src/data/types.ts:560`) defaulting `true`, one entry in
the persisted key allowlist (`src/data/data-source.ts:1352`), one filter beside the hidden-group
filter at `:192-193`, and the capture-fixture pin above.

---

## ADR-011: `hideGroup` and `deleteGroup` are wired or deleted, not left declared

**Status**: **Accepted 2026-09-06 18:36 — branch two.** Operator, verbatim: *"Wire hide, delete the
delete action"*. One branch of this was destructive, which is why it was the operator's; the branch
taken is the one that removes the destructive affordance rather than shipping it.

**Context.** Both members are declared optional on `BoardRendererActions`
(`board-renderer.ts:84-85`) and implemented by neither host. `grep -rn "hideGroup" src/` returns two
rows and zero implementations. The consequence is quiet: the two menu rows at `:558-559` never
build, so the column menu ships three rows rather than five, and `src/i18n.ts:136-137` ships "Hide
column" and "Delete group" in three locales for rows nothing renders. This is a **cross-consumer**
defect — one contract, two hosts, neither supplying it — not a local one.

**Decision, accepted — branch two of the three.** `hideGroup` is wired and becomes the Groups
panel's toggle-off; `deleteGroup` is **deleted**, along with its guard at `board-renderer.ts:558-559`
and its `src/i18n.ts:136-137` "Delete group" key in all three locales. The third state — a
declaration with no implementation — is not an option in any branch. The three branches, with the one
taken marked:

| Branch | What it means | Cost |
|---|---|---|
| **Wire both** | `hideGroup` becomes the panel's toggle-off; `deleteGroup` becomes a real destructive action in the column menu | Ships a group-deleting affordance nobody has asked for, on a board whose records are notes |
| **Wire `hideGroup`, delete `deleteGroup`** — **taken** | Visibility becomes real; the destructive one goes with its guard and its i18n keys | The safe default, the one this packet recommended, and the one the operator chose |
| **Delete both** | The board keeps no group actions and ADR-004 supplies visibility from the panel alone | Leaves the menu at three rows; makes the panel the only route |

**Why branch two.** Deleting a dead destructive action is cheaper to reverse than shipping a live
one, and nothing in the record asks for group deletion from the board. The recommendation and the
ruling agree; the ruling is what binds.

**Consequences.** Whichever branch is taken, the end state is one implementation per declaration in
both hosts — the property a test locks, so this cannot silently return.

<!-- /ANCHOR:decisions -->

---

## Status summary

| ADR | Subject | Status | Gates code? |
|---|---|---|---|
| ADR-001 | Notion is additive | Accepted (parent D15, §7.15) | No |
| ADR-002 | No desktop header count | Accepted (`056` ADR-002, A1) | No |
| ADR-003 | Header chip keeps the tint fill | Accepted (`056` ADR-006, operator) | No |
| ADR-004 | Adopt group management as one Groups `panel` | **Accepted 2026-09-06 18:36** (operator) | Was the gate; settled |
| ADR-005 | `···`/`+` hover-only on desktop | Accepted (`056` D3, A1) | No |
| ADR-006 | Sub-grouping stays unrendered | Accepted (`056` D6) | No |
| ADR-007 | Add-card stays the bordered box | Accepted (`056` D3, A5) | No |
| ADR-008 | Property rows stay icon-free | Accepted (`056` D3/D5, A4) | No |
| ADR-009 | No wrap switch; limit stays 10 | **Proposed** | No — it proposes no change |
| ADR-010 | "Hide empty groups" defaults **on**, reversing the proposal | **Accepted 2026-09-06 18:36** (operator) | Settled |
| ADR-011 | `hideGroup` wired, `deleteGroup` deleted | **Accepted 2026-09-06 18:36** (operator) | Settled |

**Ten Accepted, one Proposed, and the one Proposed proposes no change.** Seven were Accepted at
opening on a landed ruling; ADR-004, ADR-010 and ADR-011 were ruled by the operator on 2026-09-06
18:36. Nothing in this packet is gated on a decision any more. Eight patterns land **0** lines of code:
the seven Accepted declines plus ADR-009's proposed one.
