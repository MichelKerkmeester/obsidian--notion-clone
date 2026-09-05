---
title: "Decision Record: Toolbar and View Controls"
description: "ADR-001 the existing chip rail is extended rather than rebuilt. ADR-002 dead settings-entry methods are deleted with their classes kept. ADR-003 the sort-conflict confirm fires at commit, not at gesture start."
trigger_phrases:
  - "053 decision record"
  - "chip rail decision"
  - "dead methods decision"
  - "sort conflict decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/053-toolbar-and-view-controls"
    last_updated_at: "2026-09-05T12:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the three architecture decisions the plan's legs depend on"
    next_safe_action: "Operator review of ADR-001's implication for 050's item-1 Today cell"
    blockers: []
    key_files:
      - "src/views/active-view-controls-renderer.ts"
      - "src/views/toolbar-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-053-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---

# Decision Record: Toolbar and View Controls

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:disposition -->
## 0. STATUS DISPOSITION, 2026-09-05 (landing)

All three ADRs were drafted **PROPOSED**. At landing each was tested against one question: *does it
sit inside a decision the operator has already taken in `../roadmap.md` §6A?* **None of the three
does.** §6A's recorded decisions cover row height, the grab band, long-press range select, the
list-view direction, the twelve deferrals, rows 37/38, the gallery retirement, board-card property
hiding, header-everywhere, the 16px sheet inset and title, worktree hygiene, the sheet-action
closure, stacked sheets as a phase, the Notion-like stacking model, `048` D1, the "debugged,
refined, perfected" bar, the 20-iteration Anytype run, the AppFlowy skip, the `condition panel`
role at 440-560px, and AppFlowy's removal. The chip rail's fate, the dead settings-entry methods
and the sort-conflict confirm's timing are in none of them.

**So all three stay PROPOSED and all three are operator questions**, carried in `../handover.md`.
Two carry an upstream constraint that narrows them without deciding them, and each says so in its
own Context or Decision.

| ADR | Status | Upstream constraint that narrows it | The operator question |
|---|---|---|---|
| ADR-001 | **Proposed** | `050` ADR-004 restated AC-001, and `design-trueup.md` REQ-001 **rejects** the dual-mode clause this ADR originally carried — amended below. The rail-extension half is unaffected | Extend the existing chip rail, or rebuild it on a new primitive? |
| ADR-002 | **Proposed** | None | Delete seven dead methods and keep their classes for the anchor fallbacks, or keep the methods? |
| ADR-003 | **Proposed** | `design-trueup.md` REQ-007 ruled **confirm, not disable**, and `051` ADR-003 makes the confirm primitive `051`'s. Neither decides *when* the confirm fires | Gate the drop, or gate the gesture? |
<!-- /ANCHOR:disposition -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The existing chip rail is extended, not rebuilt

**Status: PROPOSED — awaiting operator review.**

### Context

`050`'s checklist records item 1's Today as "**0 chips, 1 icon state** — neither
`filter-panel-renderer.ts` nor `sort-panel-renderer.ts` renders a chip surface". The current tree
disagrees: `active-view-controls-renderer.ts` renders a chip rail into `.db-header` with
sort-then-filter groups, an AND/OR logic toggle, per-chip edit and remove, a clear-all, an
overflow scroller and auto-hide-when-empty (its `render()`, lines 66-205; commit history shows the
module predates `050`, renamed at `2d10e6fc` from the UI-improvement program). Rebuilding it would
discard conformed, captured surface — the fixtures `chrome-active-rule-popover-filter` and
`-sort` and the screenshot manifest already track it.

**Corroborated 2026-09-05.** `050`'s `design-trueup.md` REQ-001 reached the same finding
independently, reading the tree rather than this packet: the chip row ships in
`active-view-controls-renderer.ts`, auto-hides when empty at `:97`, preserves `scrollLeft` across
re-renders at `:67`, and is constructed on **both** the full-page (`database-view.ts:396`) and
embedded (`embedded-database-renderer.ts:309`) paths. Two independent reads agreeing is the
strongest in-repo evidence this program accepts short of a device confirmation.

### Decision

**Extend the rail.** The rail gains the two things it lacks — the direction-coloured leading sort
chip, and placement in the toolbar band under the clusters — plus a **declared state** on each
trigger that a lane can read.

**Amended 2026-09-05 at landing.** This decision originally read *"and the triggers gain their
dual-mode states."* `design-trueup.md` REQ-001 **rejects** dual-mode on two independent grounds. The
funnel and sort glyphs are pixel-identical across all 120 catalogue captures whether or not the view
carries a filter or a sort — `ink=52, blue=0` on both, cross-checked against
`tools/mock-data/anytype/views-report.json`, which records which view carries which rule, so a
filtered view and an unfiltered one were compared directly and measured identical. And the
colour-only signalling Anytype does carry fails WCAG 1.4.11, where our count badge already carries a
text second signal. The adopted behaviour is instead the **`N applied` count label** in the settings
panel's value column, which lands in T19. `050`'s AC-001 threshold **as restated by ADR-004** is
asserted against the finished whole. The Today-value discrepancy is recorded as correction 1 in the
parent `goal.md` §2 with citations, not absorbed silently.

### Consequences

- `050`'s item-1 checklist row reads wrong as written until its C1 cell is re-measured; this
  packet's parent-goal correction is the record of that, and `050`'s threshold is untouched.
- Less churn in a surface the screenshot manifest and `003`'s inventory already track; the
  auto-hide and overflow behaviours are already correct and already captured.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Rebuild the rail on a new primitive** | A single `createChipRow` export alongside the other five | Two chip rows for one job during the migration; the second would have to re-earn every conformance the first already passed; a fifth primitive whose only caller is a surface that already works |
| **Extend the existing rail (chosen)** | The conformed surface is the one that survives; the primitive count stays at what the duplication justified | `050`'s Today cell needs a recorded correction rather than a clean "from zero" story |
<!-- /ANCHOR:adr-001 -->

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | The rail exists; only its missing halves (direction colour, band placement, dual-mode triggers) need to |
| **Is there a simpler existing thing?** | The rail itself — extending is the simpler thing |
| **What does it touch?** | `active-view-controls-renderer.ts` (chip styling, mount point), `toolbar-renderer.ts` (trigger states) |
| **What is the real caller that must not break?** | `database-view.ts:2201` and `embedded-database-renderer.ts:1700`, the two `activeViewControlsRenderer.render` call sites — both keep the same action interface |
| **What contract must not break?** | The rail's auto-hide-when-empty and its per-chip edit popover contract (`active-rule-popover-renderer.ts`) |

---

<!-- ANCHOR:adr-002 -->
## ADR-002: Dead settings-entry methods are deleted; their classes are kept

**Status: PROPOSED — awaiting operator review.**

### Context

Seven `toolbar-renderer.ts` methods have zero `this.` call sites at HEAD: `renderComputedSyncButton`
(`:512`), `renderDatabaseRefreshButton` (`:519`), `renderCalendarTimelineOptionsButton` (`:551`),
`renderWidthSelect` (`:1594`), `renderViewConfigButton` (`:2239`), `renderChartOptionsButton`
(`:2252`), `renderExportButton` (`:2290`) — verified by grepping `this.<method>` across `src/`
against HEAD. Two of them would stamp classes that anchor-fallback queries still read:
`database-view.ts:3129` queries `.db-view-config-btn` and `embedded-database-renderer.ts:1921`
queries the same, with `:2242` querying `.db-chart-options-toolbar-btn`. Deleting the methods and
their classes together would break the fallbacks; keeping the methods keeps the settings entry
unreadable — the live path is the utilities row's settings shortcut (`:465-470`).

### Decision

**Delete the methods, keep the classes.** `createSettingsEntry` stamps the same classes on the
live trigger it renders, so the fallback queries resolve against the live trigger — or against
nothing when there is no trigger, which is the honest answer — never against a node a dead method
drew.

### Consequences

- One settings path; the seven-method tangle is gone, which is what makes item 2's 100ms landing
  assertable against a single entry point.
- A future reader may look for the methods a class name suggests. The class names live in the
  primitive's contract table (`spec.md` §5) and the fallback queries' comments name the primitive.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Keep the methods behind a flag** | No deletion risk | A second settings path is the defect this leg exists to remove; a flag nobody sets is the same dead code with extra steps |
| **Delete methods and classes, update the fallbacks** | Cleanest tree | Breaks the anchor fallback's contract for a node shape that legitimately may not exist; the classes are cheap to keep and are the fallback's documented vocabulary |
| **Delete methods, keep classes (chosen)** | One path; fallback contract intact | The class-to-method association the names imply is gone — mitigated by the contract table |
<!-- /ANCHOR:adr-002 -->

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — REQ-108 names the deletion; the dead methods are why "one settings entry" is unreadable today |
| **Is there a simpler existing thing?** | The live utilities-row shortcut — `createSettingsEntry` generalizes it rather than replacing it |
| **What does it touch?** | Seven method bodies in `toolbar-renderer.ts`, and the trigger the primitive renders |
| **What is the real caller that must not break?** | The two anchor-fallback query sites (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`) — verified resolving after the deletion |
| **What contract must not break?** | The anchor-fallback contract: the classes resolve, or resolve nothing when no trigger exists |

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The sort-conflict confirm fires at commit, not at gesture start

**Status: PROPOSED — awaiting operator review.**

### Context

`050` item 7 requires that a manual drag reorder under an active sort "asks before it commits".
The ask could gate the drag itself (refuse to start, or warn at dragstart) or the drop (confirm
before writing). `board-renderer.ts` carries the Project Manager 1:1 parity (`038`'s T12 landing);
any change to the drag's visuals risks moving a reference pixel, which parent goal D5 forbids
without a recapture read.

### Decision

**Gate the commit.** The drag runs exactly as today — same drag image, same preview, same hover
classes.

**Two upstream rulings narrow this without deciding it.** `design-trueup.md` REQ-007 ruled
**confirm, not disable** — the drag is a direct manipulation the reader has already committed muscle
to, and silently refusing it reads as a broken drag, whereas the row menu can disable legibly
because a menu row carries a disabled state and a drag cannot. And the "is this view sorted" test is
**`isExplicitlySorted(config)`**, already the predicate `row-menu.ts:104` and `:110` gate Insert
above / Insert below on; a second predicate answering the same question is the anti-pattern
`design-system.md` §10 names. Neither ruling says *when* the confirm fires, which is what this ADR
decides and what stays the operator's. When sort rules are active, the drop raises the confirm before writing. Decline leaves
both the order and the sort unchanged; accept clears the sort and commits the drop. This matches
`050` AC-007's own wording: "asks before it commits, rather than dropping the row where the sort
will immediately move it."

### Consequences

- Zero drag-visual change, so the board reference `pixelHash` comparison before/after this leg is
  meaningful evidence rather than a noisy diff.
- The confirm is testable as a pure commit-path branch on both renderers.
- The reader learns about the conflict after the gesture, not before — accepted, because it is
  what the threshold says and because the pre-gesture alternative buys its clarity with parity
  risk.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Gate the drag start** | The reader knows before moving anything | Changes the surface the parity lane photographs; a refused drag needs its own visual vocabulary; more than the threshold asks |
| **Gate the commit (chosen)** | No visual change; the threshold's exact behaviour; testable branch | The surprise arrives at drop time, not drag time |

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — item 7 names the silent-undo defect; today the drop commits and the sort reorders it back |
| **Is there a simpler existing thing?** | `confirm-modal.ts`'s `openAndWait` — the same confirm `048`'s M-4 row already routes through; no new surface. **`051` ADR-003 owns promoting it to the family's exported confirm primitive; this phase consumes it and does not build a second** |
| **What does it touch?** | The board's drop handler and the table's reorder commit, plus one sort-rules read |
| **What is the real caller that must not break?** | The drag-reorder path without an active sort — byte-for-byte the same code path, the confirm sitting entirely behind the sort-active branch |
| **What contract must not break?** | The PM 1:1 board parity: no reference pixel moves; the recapture comparison is the proof |
<!-- /ANCHOR:adr-003 -->
