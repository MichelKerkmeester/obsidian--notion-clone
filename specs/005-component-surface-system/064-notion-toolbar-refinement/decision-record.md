---
title: "Decision Record: Notion Toolbar Refinement"
description: "Ten decisions on the toolbar refinement: nine from the Notion research loop — six recorded because a landed ruling or the tree's own state already decides them, three Proposed that gate REQ-001, REQ-004 and REQ-006 — plus one inherited from 062 ADR-003 by the operator's 18:32 ruling, and the corrections D1 requires, recorded rather than absorbed."
trigger_phrases:
  - "064 decision record"
  - "notion toolbar adr"
  - "delete view confirm adr"
  - "collapse rung adr"
  - "research folder placement adr"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/064-notion-toolbar-refinement"
    last_updated_at: "2026-09-06T19:00:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Recorded ten decisions and seven corrections"
    next_safe_action: "Put ADR-001, ADR-005 and ADR-007 to the operator; they gate REQ-004, REQ-001 and REQ-006"
    blockers:
      - "ADR-001, ADR-005 and ADR-007 are Proposed and the operator's; each decides whether a gated leg exists at all"
    key_files:
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/decision-record.md"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/goal.md"
      - "specs/005-component-surface-system/roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-064-decisions"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "May a text-to-icon rung be added ahead of 053's AC-012 landed drop order"
      - "Should a delete-view confirm exist at all, on Notion-only evidence"
      - "Is per-group visibility this packet's popover row or 059's board panel"
    answered_questions:
      - "Six of the nine loop dispositions already have a landed ruling or the tree's own state, and it stands"
      - "The conditional-colour row is ADR-010: operator-ruled in 062 at 18:32, inherited here, not proposed"
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Notion Toolbar Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Under the parent's **D15**, a Notion finding never silently overrides a landed Anytype ruling.
> Where the two disagree, the record names both readings. Of the ten decisions below, five are
> decided by a landed ruling or by the tree's own state and change nothing; three are the
> operator's and gate REQ-001, REQ-004 and REQ-006 (`goal.md` D6); one records the arrangement the
> packet's own research had to make; and one — ADR-010 — is inherited, a ruling the operator
> already took in `062` and this packet carries rather than re-opens. ADR-001, ADR-005 and ADR-007
> are the three gates: no code for their requirements is written before the operator answers.

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The New label collapses before any control does — one added rung, the landed ladder untouched

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — the decision gates REQ-004; recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-001-context -->
### Context

Notion's split New button survives on every populated capture, including the narrow no-tab cases
(`21d71e5f`, `795eb9b5` — digest P1, research F-105). Ours hides the creation cluster **first**:
`applyToolbarChromeCollapse` (`toolbar-renderer.ts:2561`) hides whole clusters in the order
`[newCluster, query, props, add]` declared at `:2571`, and the New button's text label is drawn
unconditionally off-touch at `:2365` — so there are widths today where the cluster disappears while
the word "New" is still drawn.

That order is `053`'s `AC-012` / `T008`, a landed Anytype-derived threshold the operator approved. Notion's
New-survives invariant is the one genuine conflict the loop found with a landed threshold, and the
research's conflict ledger closes it additively (F-503): *conflict named, order not reopened*. Two
readings exist — reorder the ladder, or insert a rung ahead of it — and only the second was
argued, because thumbnail captures do not outweigh a landed threshold (research, Eliminated
Alternatives).

### Constraints

- The landed drop order is not reordered; `053`'s `AC-012` stands exactly as written.
- The sweep lane already exists: `tools/live/toolbar-collapse-sweep.ts` steps 250px→900px in 10px
  steps (`run-toolbar-collapse-sweep.mjs:39`), so the rung's threshold rides a probe that runs.
- The label span already draws only off-touch (`:2365`) and the accessible name already lives on
  the button, so a visual collapse costs an on-screen word, not a screen-reader one.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose (pending the operator)**: one text→icon rung at the head of
`applyToolbarChromeCollapse`, collapsing the `:2365` label before the `:2571` targets loop runs.
The landed drop order is not reordered and nothing behind it moves.

**How it works**: REQ-004's criterion asserts, in the existing 250-900px sweep, that the label reads
absent **before** the first width at which any cluster is hidden, and that zero-overflow holds at
every width. `053`'s AC-112 note already warns that `tools/live/*.ts` is covered by neither
`tsconfig.json` nor `lint:tools`, so the leg's evidence is the lane's own exit status, not the
typecheck.

**Why Proposed**: the operator approved `053`'s AC-012 order. Even an additive rung ahead of it is
theirs to veto, so the ADR records both readings and neither is applied until they answer.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- At mid widths the New button shrinks to its icon before any control disappears, which is
  Notion's behaviour on every populated capture.

**What it costs**:
- The word "New" disappears earlier than today. Mitigation: the accessible name and the tooltip are
  unchanged, and the label already only draws off-touch (`:2365`).

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A rung that changes nothing measurable would prove nothing | M | The sweep assertion is written red-first: the label must read absent before the first cluster-hidden width, or the leg is not done |
| The rung quietly reorders the landed ladder | L | The criterion asserts the `:2571` order is unchanged; the ladder's own row in `053`'s record stays the authority |
<!-- /ANCHOR:adr-001-consequences -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The control cluster stays icon-only — the density question has nothing to collapse here

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | The landed tree and `053`'s ADR-001 (the single control vocabulary); recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-002-context -->
### Context

The digest's §6 Q4 asked whether our control cluster carries text labels to collapse, and its P1
density rows (`9693630d`, `213f8a7c`, `a8a5865d`) show Notion collapsing label→icon before dropping
controls. The question answers itself on this tree: `createControlClusterButton`
(`toolbar-primitives.ts:186-220`) creates an icon, an optional 16px count badge and an
`aria-label`, and no text node — our cluster is icon-only by construction, the already-collapsed
state of Notion's two attested densities.

`053`'s ADR-001 ruled the single vocabulary in (one icon state across Anytype's 120 captures;
the count badge's 700-weight text is the WCAG 1.4.11 second signal that vocabulary already requires
— research F-403). A second, label-bearing vocabulary would re-open that ruling for no measured
loss.

### Constraints

- `053`'s ADR-001 and its amendments bind; this record does not amend them.
- The badge's text signal is a guard, not a divergence: recorded so no later pass reads it as one.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: no second control vocabulary. The density comparison the digest drew lives only on
the New button's label, which is exactly what REQ-004 collapses — one target, already named.

**How it works**: nothing to build. The answer to the digest's §6 Q4 is **no**, and this ADR is
where it is answered rather than absorbed.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**:
- The digest's open question closes with the tree's own evidence, and REQ-004's scope is exactly
  one element.

**What it costs**:
- Nothing; it is a record.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later parity pass reads the digest's two-density rows and adds labels | L | F-106 and F-403 exist so the regression is visible as one, with Anytype's 120-capture evidence attached |
<!-- /ANCHOR:adr-002-consequences -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The delete confirm is `051`'s primitive, consumed — one scope, no second confirm surface

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator, via `053` goal D8; recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-003-context -->
### Context

Notion's delete-view capture carries a **two-scope** radio — all views, or this view and its data
sources (`348fd2b7`; digest P9). Our views own no data sources, so the scope half of that capture
has nothing to scope; the research recorded it as the adoptable half being the confirm itself
(F-304).

Meanwhile the ownership ruling already exists: `053`'s goal D8 — *"The confirm primitive is `051`'s;
ADR-003's sort-conflict confirm consumes it and does not create a second."* `buildConfirmSheetBody`
(`confirm-sheet.ts:46`) ships today, and `053`'s own sort-conflict confirm is its precedent
consumer (`053` AC-105's decline/accept blocks). A confirm built anywhere else would be exactly the
failure the five family phases were split to avoid.

The phone presentation is likewise ruled: `048`'s D1 stacking model decides how the confirm
presents over the surface that spawned it, and is a constraint, not a re-specification.

### Constraints

- `053` goal D8 and `053` ADR-003: one confirm primitive, consumed.
- `048` D1 governs the phone presentation; `044`'s sheet grammar and `048`'s stacking stay green.
- The two-scope radio is a named non-adoption (F-304), not a deferred decision.
<!-- /ANCHOR:adr-003-context -->

---

<!-- ANCHOR:adr-003-decision -->
### Decision

**We chose**: both `deleteView` call sites — the all-views hub row (`toolbar-renderer.ts:1180`,
where the only guard today is `db.views.length > 1`) and the tab context menu (`:1330`) — raise
`051`'s confirm through `buildConfirmSheetBody` before `actions.deleteView(index)`, with one-scope
copy that names the view. The scope radio is not adopted.

**How it works**: REQ-001 consumes the primitive; the copy carries the scope; the host's splice-
and-save path (`database-view.ts:3445-3456`, last-view early return at `:3447`) is unchanged, and
the last-view case raises no confirm because a delete that cannot happen asks nothing.
<!-- /ANCHOR:adr-003-decision -->

---

<!-- ANCHOR:adr-003-consequences -->
### Consequences

**What improves**:
- One confirm primitive, one grammar, already exercised by `053`'s precedent; the two new call
  sites cannot grow a divergent confirmation.

**What it costs**:
- One extra tap on a certain delete. Mitigation: that is the adoption — Notion's evidence, and the
  point of the primitive.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The copy outruns the primitive's one-scope shape | L | REQ-001's criterion names the view; anything beyond one scope is the radio's, and the radio is refused |
| A second confirm surface grows here later | L | This record and `053` goal D8 both exist; the failure they prevent is the one they describe |
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The property list stays one surface — the shown/hidden split is declined, not parked

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | The Notion synthesis, on the landed list's own anatomy; the digest itself left the question open |

---

<!-- ANCHOR:adr-004-context -->
### Context

The digest's §6 Q6 asked whether Notion's shown/hidden property-visibility split (P6, `35c32af9`)
should be adopted, and left it unresolved. The research answered it on capability grounds (F-303):
our one property list carries **reorder and visibility together**, and the shown/hidden split
carries neither reorder in Notion's reading nor the drag grammar ours already has. Splitting the
list risks that grammar for no measured gain.

There is no landed ruling that decides this — the question reached this packet unresolved. What
decides it is the landed list's own anatomy in `view-config-panel-renderer.ts`, which the research
read and the digest's own question presumes.

### Constraints

- The settings surface is not this packet's to redesign; the side sheet it lives in landed after
  the digest was written (ADR-008 below).
- Optional sectioning of the existing list is recorded (F-303) as the shape a future ruling would
  take, so declining the split is not the same as forgetting the question.
<!-- /ANCHOR:adr-004-context -->

---

<!-- ANCHOR:adr-004-decision -->
### Decision

**We chose**: one property list, sectioned or not as a later ruling decides. The shown/hidden
split carries no criterion, no task and no lane in this packet.

**How it works**: the decline is recorded here and in `spec.md` §3's out-of-scope list; `spec.md`
§10's question is answered by this record rather than left to the digest.
<!-- /ANCHOR:adr-004-decision -->

---

<!-- ANCHOR:adr-004-consequences -->
### Consequences

**What improves**:
- `spec.md` §10's open question closes; the digest's §6 Q6 has a recorded answer.

**What it costs**:
- A surface difference from Notion's property panel. Mitigation: the optional sectioning is
  recorded in the research (F-303) as the shape a future ruling would take.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later pass re-opens the split without the capability argument | L | This record is the argument; the research's §6 F-303 row is its evidence |
<!-- /ANCHOR:adr-004-consequences -->
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: A delete-view confirm exists at all — on Notion-only evidence, with its severity stated as an inference

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — the decision gates REQ-001; recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-005-context -->
### Context

The research's top-ranked candidate (F-304, research T-A): both `deleteView` paths — the hub row at
`toolbar-renderer.ts:1180` and the tab context menu at `:1330` — reach `actions.deleteView(index)`
with nothing between, and the host splices and saves (`database-view.ts:3445-3456`). Notion's P9
(`55602f6a`, `348fd2b7`) is the only capture evidence anywhere that a delete-view confirmation
exists; Anytype's captures never reached one, so the adoption rests on consequence rather than on
two references agreeing.

The consequence argument itself rests on an inference: that a deleted view is unrecoverable. That
is asserted from the absence of an undo affordance in the delete path, not from a read of the
persistence layer. It is cheap to close — one read of the delete path — and it is `spec.md` §10's
recorded verification gap.

### Constraints

- ADR-003 above already decides the *shape* if this gate answers yes; this ADR decides only
  whether the confirm exists.
- The last-view early return (`database-view.ts:3447`) means the confirm must not be raised for a
  delete that cannot happen.
<!-- /ANCHOR:adr-005-context -->

---

<!-- ANCHOR:adr-005-decision -->
### Decision

**We chose (pending the operator)**: a confirmation stands in front of both paths, declining as a
no-op and accepting exactly once, because a configured view is destroyed by one tap today and the
captures show the reference product answering exactly that.

**How it works**: until the operator answers, no code for REQ-001 is written (`goal.md` D6). The
severity inference is named above; the read that closes it is REQ-001's first evidence, taken
before the confirm is argued further.
<!-- /ANCHOR:adr-005-decision -->

---

<!-- ANCHOR:adr-005-consequences -->
### Consequences

**What improves**:
- A configured view — tabs, filters, sorts, groupings — stops being one tap from gone.

**What it costs**:
- One tap added to every certain delete, the common case. Mitigation: the decline path is a no-op
  by criterion, so the cost is the tap, not a state.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The irrecoverability claim is wrong and an undo path exists | M | One read of the persistence layer closes it; the UNKNOWN row in `spec.md` §10 tracks it |
| The confirm fires on the last view, where nothing can be deleted | L | The criterion asserts the `:3447` early return precedes any confirm |
<!-- /ANCHOR:adr-005-consequences -->
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: The condition builder and the chip rail — the two references disagree with each other, in the direction we already ship

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | The landed rulings — §6A's condition-panel role and `053`'s shipped condition row; recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-006-context -->
### Context

The loop's conflict ledger (research §7, F-503) closes two rows the same way: where Anytype and
Notion disagree with **each other**, our tree already ships the shape Notion's evidence supports.

- The condition surface: Anytype splits it across three stacked popovers; Notion builds it in one
  row (P4, `41665ca0`). Ours is the one-row shape (`toolbar-primitives.ts:135-165` at the landed
  440-560px role, floors 140/140/120) — F-206. `053` D8 owns the condition row; this packet did
  not build it and does not re-role it.
- The active-rule rail: Anytype aggregates sort into one pill; Notion carries a chip per rule
  (P2, P5). Ours is per-rule (`active-view-controls-renderer.ts:103-121`, `:230-232`) — F-205,
  corroborated by F-207.

Two independent products, read independently, chose what this packet already ships. That is
ratification, and the guard's job is to keep a later single-reference pass from "fixing" it.

### Constraints

- `053`'s condition-row primitive and the landed §6A role widths are not re-measured here; this
  record only pins them against the disagreement.
- REQ-002's entry tier extends the panel's zero-rule branch **in front of** the landed builder and
  touches nothing inside it (`053`'s structural rulings hold; the builder's tree is unchanged).
<!-- /ANCHOR:adr-006-context -->

---

<!-- ANCHOR:adr-006-decision -->
### Decision

**We chose**: no change, guards recorded. The one-row builder and the per-rule chip rail stay
exactly as shipped; F-206 and F-207 are the guards a later parity pass trips over visibly.

**How it works**: this record is the disposition. The research's census (F-205, F-206, F-207) is
the evidence; the landed role widths and the shipped rail anatomy are the things it pins.
<!-- /ANCHOR:adr-006-decision -->

---

<!-- ANCHOR:adr-006-consequences -->
### Consequences

**What improves**:
- Two "the references disagree" rows stop being loose ends in a research folder and become guards
  with names.

**What it costs**:
- Nothing; it is a record.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later Anytype-only pass "fixes" the rail toward the aggregate pill | L | F-207 names the regression; this record is its second copy |
| The condition role is re-measured against the wrong reference | L | `053` D8's ownership stands; this packet re-opens neither |
<!-- /ANCHOR:adr-006-consequences -->
<!-- /ANCHOR:adr-006 -->

---

<!-- ANCHOR:adr-007 -->
## ADR-007: Per-group visibility is `059`'s axis — the hidden-group set already exists, the missing writer is theirs

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — the decision gates REQ-006; recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-007-context -->
### Context

The loop's sixth task proposed a per-group eye toggle in the group popover and said `ViewConfig`
would "gain the hidden-group set". That correction is the packet's D1 case: the set **already
exists**. `boardHiddenGroups` is declared at `src/data/types.ts:560`, parsed and persisted at
`data-source.ts:1230` and `:1352`, and read by the board at `board-renderer.ts:192`. What is
missing is a **writer** — `059`'s own REQ-001 counts zero board-mounted writers today — and
`059`'s REQ-001/REQ-003 already specify one: a board-mounted Groups panel with per-group toggles
and bulk actions.

Building a second writer in this packet's group popover would give one persisted axis two owners,
which is the failure `053`'s D8 one-owner rule exists to prevent. The loop's account of the
renderer side was also incomplete: the board's read is verified (and corrected in `goal.md` §4),
while the table's consumption was never established — the loop deliberately did not read the table
renderer, so REQ-006's first task remains that read.

### Constraints

- `053` goal D8: one owner per shared primitive. The persisted axis is one; its writer should be
  one, whoever it is.
- `059`'s REQ-001/REQ-003 own the Groups panel and its bulk actions; a popover-row toggle here
  would have to compose with that, not compete with it.
- The table renderer's consumption of the axis is unestablished; no criterion here asserts it.
<!-- /ANCHOR:adr-007-context -->

---

<!-- ANCHOR:adr-007-decision -->
### Decision

**We chose (pending the operator)**: this packet's REQ-006 shrinks to the popover row's eye toggle
for select/status group fields, persisting into the existing `boardHiddenGroups` axis — **or**,
if the operator answers that `059`'s panel is the single writer, REQ-006 is superseded here and
`acceptance-criteria.md` waives it by this ADR. Both readings are recorded; neither is applied.

**How it works**: until the operator answers, no REQ-006 code is written (`goal.md` D6). Whichever
way they answer, the first task is unchanged: read the renderers — the board's read is verified at
`board-renderer.ts:192`, the table's is not — before any criterion here goes green.
<!-- /ANCHOR:adr-007-decision -->

---

<!-- ANCHOR:adr-007-consequences -->
### Consequences

**What improves**:
- The correction the loop needed is on the record: the set exists, so nobody "adds" it a second
  time; the question is only who writes it.

**What it costs**:
- If the operator routes to `059`, this packet's REQ-006 closes as a waiver rather than as a
  feature. Mitigation: the waiver cites this ADR, which cites `059`'s own REQ-001.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Two writers for one persisted axis | M | `053` goal D8 is the ruling; this ADR applies it and names both candidate owners |
| A criterion asserts table consumption nobody established | L | The first task is the read; the criterion waits for it |
<!-- /ANCHOR:adr-007-consequences -->
<!-- /ANCHOR:adr-007 -->

---

<!-- ANCHOR:adr-008 -->
## ADR-008: The digest's §4 P3 row is stale — the desktop side sheet landed after the digest was written

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | The landed tree; recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-008-context -->
### Context

The digest's §4 P3 row calls our settings surface "a popover/sheet" and reads Notion's
right-docked settings panel (`9e80b489`, `420dd630`) as a difference. The desktop side sheet has
since landed: the settings render presents through the docked shell
(`view-config-panel-renderer.ts`'s `presentPanel` path; `surface-shell.ts:185`), which is Notion
web's shape. The research recorded it as a divergence dissolved before this loop ran (F-301), and
its future-proofing note (§13) states the general rule the row instantiates: the digest ages
against the tree, not against Notion.

### Constraints

- The digest itself is not rewritten — it is the loop's read of record, and its §4 row stays as
  written; the corrections live here and in `goal.md` §4.
- Any future read of the digest re-verifies the divergence table against `git log` before treating
  a row as current.
<!-- /ANCHOR:adr-008-context -->

---

<!-- ANCHOR:adr-008-decision -->
### Decision

**We chose**: record the staleness, change nothing. There is no our-side surface left to change —
the thing the row said we lacked is the thing that landed.

**How it works**: REQ-007 (the packet's own record) carries this correction; the research's F-301
is its finding; this ADR is where a later reader lands.
<!-- /ANCHOR:adr-008-decision -->

---

<!-- ANCHOR:adr-008-consequences -->
### Consequences

**What improves**:
- The divergence table stops costing a future pass a re-derivation that the tree already answers.

**What it costs**:
- Nothing; it is a record.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The digest's P3 row is read as current | L | This record, `goal.md` §4's correction, and the research's §13 rule all say otherwise |
<!-- /ANCHOR:adr-008-consequences -->
<!-- /ANCHOR:adr-008 -->

---

<!-- ANCHOR:adr-009 -->
## ADR-009: Two Notion pipelines, one packet — the `-toolbar` suffix and `research/notion-toolbar/` are this packet's read of record

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | The Notion synthesis, after the second pipeline's collision; recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-009-context -->
### Context

Two Notion pipelines were bound to `053`. The table pipeline landed first
(`94f03c88`, `f52109c1`) and holds the canonical `notion-screens-digest.md` and the canonical
`research/` directory, cited by `062-notion-table-refinement`, `053/goal.md` and `053/tasks.md`.
This run is the later arrival; it moved rather than displace four landed citations, filing as
`notion-screens-digest-toolbar.md` and `research/notion-toolbar/`. Nothing was overwritten and no
landed citation broke, but the collision was invisible until a rebase refused the checkout — the
research's troubleshooting §15.4 records it, and its fix for the next run: a pipeline bound to a
packet another run already used checks `git ls-tree origin/main <packet>` before it writes, not
after.

### Constraints

- The canonical names stay the table pipeline's; this packet does not retake them.
- `goal.md`'s binding section names the `-toolbar` digest and the `research/notion-toolbar/`
  directory as this packet's read of record; this ADR is why those names are what they are.
<!-- /ANCHOR:adr-009-context -->

---

<!-- ANCHOR:adr-009-decision -->
### Decision

**We chose**: the arrangement stands and is recorded. The suffixed filenames and the
`research/notion-toolbar/` directory are this packet's, deliberately, and every citation in this
packet's documents resolves through `goal.md`'s binding section.

**How it works**: the four landed citations are untouched; this packet's citations are suffixed;
and the next run checks before it writes. Nothing further.
<!-- /ANCHOR:adr-009-decision -->

---

<!-- ANCHOR:adr-009-consequences -->
### Consequences

**What improves**:
- A reader who lands on the unsuffixed digest or the unsuffixed `research/` finds this ADR at the
  end of the chain that explains the difference.

**What it costs**:
- Two differently-named artefacts for the same kind of thing. Mitigation: the names are in
  `goal.md`'s binding section, which every reader of this packet is told to read first.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A third pipeline binds to `053` and collides again | L | Research §15.4's check-before-write rule; the fourth notes the pattern |
<!-- /ANCHOR:adr-009-consequences -->
<!-- /ANCHOR:adr-009 -->

---

## The seven corrections D1 requires

`goal.md` D1: where the loop's synthesis and this tree disagree, the tree wins, and the correction
is recorded here rather than absorbed. Four of the loop's own claims were corrected at this
packet's opening — one substantive and three of citation. The files were unchanged since the loop
read them (`git diff --stat 28e680fc HEAD -- src/` names none of the six toolbar-family files), so
those four are the model approximating line numbers, not the tree moving. Dated 2026-09-06.

Three more were corrected at the landing, when this packet rebased onto twenty-seven further
commits. Rows 5 and 6 are the tree genuinely moving under a citation — the honest opposite of rows
2-4 — and row 7 is this packet reading the same evidence wrong that `062` had already corrected.
Dated 2026-09-07.

| # | Kind | The loop's claim | What the tree says | Disposition |
|---|------|------------------|--------------------|-------------|
| 1 | Substantive | The sixth task said `ViewConfig` would "gain the hidden-group set" | It already has one: `boardHiddenGroups` at `src/data/types.ts:560`, parsed and persisted at `data-source.ts:1230` and `:1352`, read by the board at `board-renderer.ts:192`. The missing thing is a writer, and `059`'s REQ-001/REQ-003 own it | Routed, in ADR-007 |
| 2 | Citation | The zero-rule filter branch is at `filter-panel-renderer.ts:184-191`; leaf creation at `:100-104`; the field dropdown at `:517-527`; the value dropdown at `:672-690` | The branch is `:197-202`; leaf creation is `:90` (`createDefaultFilterRule`) and `:223` (`appendLeaf`); the field dropdown is `:494-501`; the select/status value dropdown is `:576-590` | Corrected in `goal.md` §3's criteria; this packet's criteria carry the verified anchors |
| 3 | Citation | The sort field dropdown is at `sort-panel-renderer.ts:158-168` | It is `:199-206` (the second `createDropdownField` in the file, at `:217`, is the direction's) | Corrected, as above |
| 4 | Citation | `renderGroupPopoverRow` is at `toolbar-renderer.ts:1878-1896` | It is `:1869-1887` | Corrected, as above |
| 5 | Citation | The chip rail's hover tint is at `styles.css:1831` | It is `:1832`; `:1831` is the `:focus-within` selector line. The block did not move under the rebase — the off-by-one was there from the start | Corrected in D7, AC-008, T008 and `plan.md` |
| 6 | Citation | The `searchable` precedent is `view-config-panel-renderer.ts:1558`, `:2060`, `:2077` | `:1558` is the one real pass-`true` site. `:2060` and `:2077` were never pass sites — they are `renderSelect`'s `searchable` parameter and its pass-through — and the twenty-seven rebased commits moved them to `:2064` and `:2082` | Corrected in the criterion, AC-006, REQ-003 and T006 |
| 7 | Substantive | Conditional colour is a Notion-only feature with no our-side surface (`spec.md` §3, repeating the toolbar digest's row for `142cef4e`) | It ships: `applyConditionalFormat` at `conditional-formatting.ts:168-206`, wired at `table-renderer.ts:85`/`:866`/`:911`, painted at `styles.css:1317-1319`. `062` ADR-003 had corrected this before this packet was written, and the operator ruled its view-settings row here at 18:32 | Corrected in `spec.md` §3; the work is REQ-009 / AC-012 / T014, recorded in ADR-010 |

The research document keeps the loop's own numbers — it is the loop's record, and rewriting it
would make it lie about when it was written. Every criterion, task and acceptance row in this
packet carries the verified anchor.

---

<!-- ANCHOR:adr-010 -->
## ADR-010: Conditional row colour gets its own view-settings row — inherited from `062`, ruled by the operator, and the digest was wrong twice

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 18:32 (ruled in `062`) · 2026-09-07 (inherited here at landing) |
| **Deciders** | The operator, verbatim: *"Yes, own row in view settings"* (`062` ADR-003) |
| **Criterion** | Binds AC-012 / REQ-009 / T014 |

---

<!-- ANCHOR:adr-010-context -->
### Context

This is the one decision in this record that was neither found by this packet's loop nor proposed
by it. It arrived from a sibling.

`062-notion-table-refinement` opened ADR-003 on a divergence its own digest reported: conditional
row colour read as **no match** here, escalated by the Anytype cross-read to "a disagreement in
existence". Both readings were wrong, and `062`'s research caught it on two targeted reads —
`applyConditionalFormat` sets `--db-conditional-format-bg` on the `tr`
(`src/data/conditional-formatting.ts:168-206`), it is wired at `src/views/table-renderer.ts:85`,
`:866` and `:911`, and `tr.db-conditional-format > td` paints it (`styles.css:1317-1319`). The
digest's grep pattern could not match the symbol names in use. **An absence grep is a claim, not
evidence.**

**This packet repeated the same mistake, from the other end.** The toolbar digest's own row for
`142cef4e` reads *"Notion-only feature, no Anytype or our equivalent"*, and `spec.md` §3 duly
listed conditional colour among the Notion-only features with "no our-side surface exists to
change". It was wrong when it was written, and it is corrected above.

What is genuinely different is **presentation**: Notion gives it a first-class *Conditional color*
row in the view-settings list with an explainer (`142cef4e`, listed in `ac0d576b`, `2517d4cf`,
`9e80b489` and `420dd630`). The operator was asked the narrow question and answered it at
2026-09-06 18:32. `064` did not exist on `main` when the ruling was taken, so `062` carried the
pointer; this packet is where it lands.

**One inherited sentence does not survive the tree, and D1 says the tree wins.** `062` ADR-003
says ours "lives in database settings". It does not. `renderConditionalFormatting` is mounted in
the **view** section — `view-config-panel-renderer.ts:405`, after the `viewConfig.viewSection`
title at `:387` — and the rules are per-view: `ViewConfig.conditionalFormats` (`data/types.ts:593`),
with the database-level field deprecated (`data/types.ts:427`) and migrated into views on read
(`data-source.ts:893-899`).

### Constraints

- The capability does not move and no rule semantics change. Only the way in is added.
- `053` owns the settings entry, which is why the ruling routed here rather than staying in `062`.
- A second rule editor is the failure mode: the existing section is opened, never duplicated.
<!-- /ANCHOR:adr-010-context -->

---

<!-- ANCHOR:adr-010-decision -->
### Decision

**We chose**: a fourth named row in the view-settings summary block, beside the three
`renderAppliedSummaries` already emits (`view-config-panel-renderer.ts:510-518` — Properties,
Filters, Sorts), reading the count of `config.conditionalFormats`, carrying an explainer line in
the panel's own `hintClass()` idiom (`:569`, `:1688`), and opening the existing
`renderConditionalFormatting` section (`:747`).

**Because the work the ruling actually asks for is a named row and an explainer, not a
relocation** — the section is already per-view and already in the view half of the panel. Stating
that precisely is the difference between a small additive row and a migration nobody ordered.

**Not Proposed.** Every other conflict in this record that touches a landed ruling stays Proposed
under D3, and rightly. This one does not, for the one reason D3 allows: the operator already ruled
it, in `062`, and an agent may carry a ruling it may not make.
<!-- /ANCHOR:adr-010-decision -->

---

<!-- ANCHOR:adr-010-consequences -->
### Consequences

**What improves**:
- The commonest question about conditional colour — *where is it?* — is answered by the panel
  itself rather than by a grep.
- The digest's row for `142cef4e` and this packet's own out-of-scope list are corrected in place,
  so the next reader finds the correction rather than repeating it a third time.

**What it costs**:
- One more row in a panel that is already long. Mitigation: it is a summary row in the block built
  for exactly this, not a new section.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The row is read as a second editor | M | AC-012 asserts it opens the existing `:747` section; CHK-013's no-second-producer rule covers it |
| A chart view renders a row for a section `:405` does not mount | L | AC-012's negative control is the chart view |
<!-- /ANCHOR:adr-010-consequences -->
<!-- /ANCHOR:adr-010 -->

---

## Status summary

| ADR | Status | Gates |
|-----|--------|-------|
| ADR-001 | Proposed | REQ-004 |
| ADR-002 | Accepted | — |
| ADR-003 | Accepted | — |
| ADR-004 | Accepted | — |
| ADR-005 | Proposed | REQ-001 |
| ADR-006 | Accepted | — |
| ADR-007 | Proposed | REQ-006 |
| ADR-008 | Accepted | — |
| ADR-009 | Accepted | — |
| ADR-010 | Accepted | REQ-009 — inherited, not gated |

Three Proposed, and they are the three `goal.md` D6 names. No code for REQ-001, REQ-004 or REQ-006
is written before the operator answers.
