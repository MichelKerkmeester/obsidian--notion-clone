---
title: "Decision Record: Linked Views Notion Parity"
description: "The write model for embedded database views, and the presentation-versus-capability split that makes it statable. Both are preconditions for the phase's capability work rather than outcomes of it."
trigger_phrases:
  - "046 decision record"
  - "embed write model"
  - "codeblock read-only decision"
  - "linked view adr"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/046-linked-views-notion-parity"
    last_updated_at: "2026-09-05T04:20:00Z"
    last_updated_by: "implementation-verifier"
    recent_action: "Accepted ADR-002 after the capability seam landed; ADR-001 was accepted before the gates moved"
    next_safe_action: "Decide whether the write capability ships behind a settings flag (tasks.md T016)"
    blockers:
      - "ADR-001's rollback assumes a feature flag that was not built; T016 asks whether one is needed"
    key_files:
      - "src/views/embedded-database-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-046-adr"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Decision Record: Linked Views Notion Parity

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: May an embedded view write to the vault?

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

The operator asked for embedded views that *look like* the original databases. Looking like one and
being one are different asks, and the difference is a write.

A codeblock embed is read-only today, decided in four independent places that all key on the same
string: `createEntry` no-ops when `isCodeBlock` (`embedded-database-renderer.ts:421`, `:433`,
`:463`), `isReadOnly: this.persistMode === "codeblock"` (`:1592`),
`showChartOptions: persistMode !== "codeblock"` (`:1593`), and `syncComputedFields` gated the same
way (`:1575`). None of them carries a comment explaining the intent, so the decision exists only as
a repeated conditional. That is why it has to be taken now rather than discovered: chasing parity
would relax them one at a time, and the endpoint is an embed that edits some things and not others
with nobody able to say which.

The standalone view in the operator's own reference capture has a "+ New" row, editable cells and a
"+ Calculate" footer. An embed with the same chrome and none of the behaviour is arguably worse than
today's honest block, because it looks like it should work.

### Constraints

- An embed renders inside Obsidian's markdown reading view, where the surrounding content is prose
  the page's author wrote. A write from there creates or edits notes the author did not open.
- Undo in the reading view belongs to Obsidian, not to the plugin. The plugin's own undo stack
  (`undo.*` in `src/i18n.ts`) is scoped to a database view, and an embed is not one.
- A page can carry several embeds of the same or different views. Concurrent writers already exist
  through `ViewConfigMutation`'s `sourceInstanceId`, but that guards config, not records.
- Whatever is decided applies to every existing page in every vault the moment it ships.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: **Option A — full parity.** An embedded/linked view writes to its source database
exactly as the standalone view does: cell edits, row creation and deletion, status and board-column
moves, and view configuration all persist to the source database rather than to a page-local copy.
Undo runs through the plugin's existing undo history stack — the same one the standalone view uses.
The view is read-only only when its source database is missing or unresolved, never as a default
posture for the embed as such.

Operator, verbatim, 2026-09-05 ~05:30 CEST: *"Allow db writing from linked views."*

**How it works**: the phase's chrome and width work (T004, T005) already proceeded regardless,
because it changes presentation only. The capability leg (T006) is now unblocked: the four
read-only gates come out together, in one commit, keyed on whether the source resolves rather than
on `persistMode === "codeblock"`.

**What landed**: one `isViewReadOnly()` seam, read from 24 sites, standing where `createEntry`,
`isReadOnly`, `showChartOptions` and `syncComputedFields` each had their own string comparison. It
is true only when the source database is missing or its path does not resolve to a file. Cell edits,
new rows, deletions, board column moves and view-config edits persist to the source and record the
same `undo.*` labels the standalone view records, plus `undo.moveLinkedView`.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **A. Full parity — embeds write** | Matches the ask most literally; the page becomes a place to work | A note can be created from a page that reads as prose; undo is the host's and does not reach the plugin's stack | 6/10 |
| **B. Presentation parity only — chrome without capability** | Smallest change; no data risk; ships this week | An embed that looks editable and is not is a worse lie than a block that looks like a block | 5/10 |
| **C. Opt-in per block — an `editable: true` option in the fence** | The page author decides, per embed; existing pages unchanged | A fifth option in a format this phase is trying to simplify; two behaviours to test everywhere | 7/10 |
| **D. Editable where the page owns the database, read-only elsewhere** | Intuition matches Notion's inline-versus-linked distinction | "Owns" has no meaning in this data model — a database is a file, a page is a file, and any page can embed any view | 3/10 |

**Why this one**: the operator chose Option A directly — *"Allow db writing from linked views"* —
over the per-block opt-in of C. The ruling is unconditional: every existing embed gets the same
capability the standalone view has, not a fence flag an author must opt into. The fence format is
therefore unchanged: `{dbId|dbPath, viewId, hideHeader}`.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- The four gates stop being four decisions and become one, whichever way it resolves.
- REQ-003's affordance list becomes checkable: every affordance is present or excluded for a stated
  reason.

**What it costs**:
- A decision the operator has to make, which is slower than shipping a guess. Mitigation: the chrome
  and width legs are unblocked and are what the operator actually complained about.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The decision is deferred and the capability leg starts anyway | H | REQ-004 makes the ADR a precondition, and AC-003 will not close without a status |
| Option A ships and a page author loses work they did not know they could do | H | Any writable path ships behind a flag and with an explicit undo story, or it does not ship |
| Option C adds a format option this phase is otherwise simplifying | M | If C wins, `hideHeader`'s fate is settled in the same change so the format's option count does not grow |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Four gates key on one string with no recorded intent; parity work touches all four |
| 2 | **Beyond Local Maxima?** | PASS | Four options considered, including the two obvious extremes and the Notion-shaped one |
| 3 | **Sufficient?** | PASS | Option A is chosen and matches the standalone view's own capability set; the embed becomes the database rather than a restricted view of it |
| 4 | **Fits Goal?** | PASS | REQ-003 and REQ-004 both depend on it; the critical path runs through it |
| 5 | **Open Horizons?** | PASS | Whichever option wins, the presentation/capability split leaves the other reachable |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `src/views/embedded-database-renderer.ts` — the four gates, together, in one commit.
- The block format does not change (goal.md D1) — Option A carries no new fence option.

**How to roll back**: if a writable path ships, disable its flag first so an in-flight edit is
refused rather than half-written, then revert the gate commit. Notes already created from an embed
are ordinary notes and are not removed by the revert; say so in the release note rather than
implying the revert undoes them.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: Split presentation mode from capability

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Phase author |

---

<!-- ANCHOR:adr-002-context -->
### Context

`persistMode === "codeblock"` currently decides two unrelated things: how the surface is dressed and
what it may do. Every question about an embed therefore has one answer, and the answer is a string
comparison repeated across a 4,173-line file.

### Constraints

- `persistMode` is also a real distinction — a codeblock embed genuinely persists differently from a
  file view, and that part must survive the split.
- Two code-block processors (`main.ts:387`, `:401`) construct the renderer with the same mode, so
  the split must not require them to disagree.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: separate the presentation question ("how is this surface dressed?") from the
capability question ("what may it do?"), so ADR-001 has somewhere to land.

**How it works**: presentation stops being inferred from `persistMode` and becomes explicit;
capability becomes one resolved value rather than four conditionals. `persistMode` keeps its
original meaning — where writes go — and stops standing in for the other two.

**What landed**: capability is `isViewReadOnly()`, read from 24 sites. Presentation is three
explicit statements the embed makes to the toolbar and the container — `hideDatabaseTitle`,
`moveLinkedView` and the linked-embed class — and they are the only `persistMode === "codeblock"`
reads left in the file, down from ten. What the ADR asked for and did not get is the separate
commit: the split shipped inside the capability change, so its no-behaviour-change half was never
independently provable. That is recorded as a missed control in `checklist.md` CHK-013 rather than
waved through.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **A. Split into presentation + capability** | Each question has one owner; ADR-001 becomes statable | A third concept in a file that already has two | 8/10 |
| B. Keep one mode, add a second string value | No new concept | Multiplies as soon as a third combination is wanted; the current confusion is exactly this pattern one step earlier | 4/10 |
| C. Leave it; special-case at each site | Zero refactor | This is the current state, and it is what makes ADR-001 hard to write | 2/10 |

**Why this one**: A is the only option under which "may an embed write?" has a single place to be
answered. That is the whole reason this ADR exists.
<!-- /ANCHOR:adr-002-alternatives -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**:
- `rg -n 'persistMode === "codeblock"'` stops being the way to find out what an embed can do.
- The chrome leg and the capability leg become independently revertible.

**What it costs**:
- A refactor inside a 4,173-line file with no behaviour change, which is the kind of change that is
  hard to review. Mitigation: land it as its own commit with the grep count stated before and after.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The refactor silently changes one of the four gates | H | Land it with no behaviour change and prove it: the embed's rendered DOM and affordance set are identical before and after |
| A third concept makes the file harder, not easier | M | Two concepts, not three: presentation and capability. `persistMode` narrows rather than joins them |
<!-- /ANCHOR:adr-002-consequences -->

---

<!-- ANCHOR:adr-002-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | ADR-001 cannot be stated cleanly without it |
| 2 | **Beyond Local Maxima?** | PASS | Three options, including doing nothing |
| 3 | **Sufficient?** | PASS | Two concepts, no framework, no new file |
| 4 | **Fits Goal?** | PASS | REQ-004 names the four gates as one change, which this makes possible |
| 5 | **Open Horizons?** | PASS | Leaves every ADR-001 option reachable |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-002-five-checks -->

---

<!-- ANCHOR:adr-002-impl -->
### Implementation

**What changes**:
- `src/views/embedded-database-renderer.ts` — the six `persistMode` reads named in `spec.md` §2.

**How to roll back**: revert the single refactor commit. It carries no behaviour change by
construction, so nothing else depends on it having happened.
<!-- /ANCHOR:adr-002-impl -->
<!-- /ANCHOR:adr-002 -->

---
