---
title: "Decision Record: Toolbar and View Controls"
description: "ADR-001 the existing chip rail is extended rather than rebuilt. ADR-002 dead settings-entry methods are deleted with their classes kept. ADR-003 the sort-conflict confirm fires at commit, not at gesture start. ADR-004 the wrap control is a per-view default with a per-column override, column wins. ADR-005 the summary footer is hidden at zero rows and its phone trigger meets the 44px floor."
trigger_phrases:
  - "053 decision record"
  - "chip rail decision"
  - "dead methods decision"
  - "sort conflict decision"
  - "wrap toggle decision"
  - "wrap text default"
  - "table footer decision"
  - "footer trigger touch target"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/053-toolbar-and-view-controls"
    last_updated_at: "2026-09-06T22:45:00Z"
    last_updated_by: "verify-053-table-footer"
    recent_action: "Verified ADR-005 red-first and landed it on main; gate 26 green"
    next_safe_action: "Operator device pass on the footer; nothing else here is blocked"
    blockers: []
    key_files:
      - "src/views/active-view-controls-renderer.ts"
      - "src/views/toolbar-renderer.ts"
      - "src/views/cell-renderer.ts"
      - "src/views/column-menu.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "src/views/table-renderer.ts"
      - "src/views/table-footer-renderer.ts"
      - "styles.css"
      - "tools/live/touch-targets.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-053-adr"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "ADR-001: extend the existing chip rail; no new chip-row component"
      - "ADR-002: delete the seven dead methods, keep their classes"
      - "ADR-003: the confirm fires on drop, not on gesture start"
      - "ADR-001 amendment 2 (T001): the rail's in-toolbar band move is withdrawn — the capture puts Anytype's rail where ours already renders"
      - "ADR-001 amendment 2 (T001): the direction colour is demoted to a redundant third signal at 3.14:1 accent-on-tint and 1.19:1 fill-on-bar; direction rides the arrow glyph and the direction word"
      - "ADR-004: the view carries a wrapText default (table view settings only); a column's own wrap always overrides it; undefined follows the view"
      - "ADR-005: the summary footer is hidden entirely at zero rows; its phone trigger is raised to the shared 44px floor, desktop unchanged at 26px"
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

**Operator answered all three, 2026-09-05 (~14:15).** Each moves to **Accepted** below, quoted in
its own ADR section.

| ADR | Status | Operator's answer |
|---|---|---|
| ADR-001 | **Accepted** | *"Extend the existing rail"* — keep `active-view-controls-renderer.ts` and reshape it to the Anytype-derived layout; no new chip-row component |
| ADR-002 | **Accepted** | *"Delete methods, keep classes"* — remove the seven dead methods; the two anchor-fallback DOM queries keep their classes |
| ADR-003 | **Accepted** | *"On drop"* — the drag proceeds; on drop the confirm offers clear-sort-and-commit or decline-and-revert |
<!-- /ANCHOR:disposition -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The existing chip rail is extended, not rebuilt

**Status: Accepted, 2026-09-05 (~14:15).**

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

**Operator, 2026-09-05 (~14:15):** *"Extend the existing rail."* Keep
`active-view-controls-renderer.ts` and reshape it to the Anytype-derived layout; no new chip-row
component.

**Extend the rail.** The rail is reshaped to the anatomy the captures show, plus a **declared
state** on each trigger that a lane can read. What "reshaped" means is now measured rather than
guessed — see the second amendment below.

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

**Amended a second time, 2026-09-05 at T001.** The capture read this ADR was waiting on landed, and
it removes two more clauses while confirming the decision itself.

1. **The in-toolbar band placement is withdrawn.** `050` C2 recorded that no chip row appears on any
   capture; the 600-file menu sweep and the catalogue's List views show one on eleven files, and
   `anytype-project-tracker-list-light.png` places it at **y 274..301, below a 1px
   full-content-width divider at y 261** — its own band, under the toolbar. That is exactly where
   `active-view-controls-renderer.ts` already renders it. There is nothing to move, so the clause
   goes, and `spec.md` §8's sticky-offset risk row and `goal.md`'s open question retire with it.
2. **The direction colour is demoted to a redundant signal.** Anytype never carries sort direction
   by colour: the desktop chip carries a `↓` **glyph** and the phone's Sorts sheet carries the
   **word** `Ascending` on a second line. And its own chip colours would not survive our bar —
   accent-on-tint measures **3.14:1** (below 4.5:1 for a ~13px label) and the chip fill measures
   **1.19:1** against the bar it sits on (below 3:1 for a non-text state indicator). So direction
   rides the arrow glyph and, where a second line fits, the word; colour may be a third signal and
   may never be the only one. `sk-design` ALWAYS-5 and WCAG 1.4.11 both bind here.

**What the rail does gain**, all measured: chip **26px → 28px** (the measurement and our own
`design-system.md` §9 coarse-pointer floor agree — the same justification `050` used for its 28px
row), a group separator at 8px before and 12px after, and the condition-as-a-phrase chip label
Anytype reads better than we do (`Starts is today`). The **radius stays 8px**: the measured chip is
a full pill at r≈14, which is off our 4/6/8 scale, and mixing pill and square corners in one
interface degrades both.

**The decision itself is corroborated a third time.** T001 measured Anytype's rail and found ours
structurally the same surface — sorts first, then filters, an add control, a clear-all, auto-hiding
when empty. Rebuilding it would have thrown away the closer of the two.

### Consequences

- `050`'s item-1 checklist row reads wrong as written until its C1 cell is re-measured; this
  packet's parent-goal correction is the record of that, and `050`'s threshold is untouched.
- Less churn in a surface the screenshot manifest and `003`'s inventory already track; the
  auto-hide and overflow behaviours are already correct and already captured.
- **After T001 the leg is smaller than this ADR first scoped.** Three of the four changes it
  originally proposed — dual-mode triggers, the band move, the direction colour — are struck on
  evidence. What remains is a height change, a separator, a label format and the declared state.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Rebuild the rail on a new primitive** | A single `createChipRow` export alongside the other five | Two chip rows for one job during the migration; the second would have to re-earn every conformance the first already passed; a fifth primitive whose only caller is a surface that already works |
| **Extend the existing rail (chosen)** | The conformed surface is the one that survives; the primitive count stays at what the duplication justified | `050`'s Today cell needs a recorded correction rather than a clean "from zero" story |
<!-- /ANCHOR:adr-001 -->

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | The rail exists. **After T001, three of its four "missing halves" turn out not to be missing or not to be wanted** — dual-mode triggers, the band move and the direction colour are all struck on evidence. What is left: the 28px height, the group separator, the phrase label and the declared trigger state |
| **Is there a simpler existing thing?** | The rail itself — extending is the simpler thing, and T001 made it simpler still |
| **What does it touch?** | `active-view-controls-renderer.ts` (chip styling and label format only — **not the mount point**, since the rail does not move), `toolbar-renderer.ts` (trigger states) |
| **What is the real caller that must not break?** | `database-view.ts:2201` and `embedded-database-renderer.ts:1700`, the two `activeViewControlsRenderer.render` call sites — both keep the same action interface |
| **What contract must not break?** | The rail's auto-hide-when-empty and its per-chip edit popover contract (`active-rule-popover-renderer.ts`) |

---

<!-- ANCHOR:adr-002 -->
## ADR-002: Dead settings-entry methods are deleted; their classes are kept

**Status: Accepted, 2026-09-05 (~14:15).**

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

**Operator, 2026-09-05 (~14:15):** *"Delete methods, keep classes."* Remove the seven dead methods;
the two anchor-fallback DOM queries keep their classes.

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

**Status: Accepted, 2026-09-05 (~14:15).**

### Context

`050` item 7 requires that a manual drag reorder under an active sort "asks before it commits".
The ask could gate the drag itself (refuse to start, or warn at dragstart) or the drop (confirm
before writing). `board-renderer.ts` carries the Project Manager 1:1 parity (`038`'s T12 landing);
any change to the drag's visuals risks moving a reference pixel, which parent goal D5 forbids
without a recapture read.

### Decision

**Operator, 2026-09-05 (~14:15):** *"On drop."* The drag proceeds; on drop the confirm offers
clear-sort-and-commit or decline-and-revert.

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

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The wrap control is a per-view default with a per-column override; the column always wins

**Status: Accepted, 2026-09-06.**

### Context

Roadmap row 53, the operator's 2026-09-05 22:35 report: *"Also make it easier to set wrap or no
wrapping table rows etc."* `005-content-row-rhythm` ADR-001 fixed the row-height defect the same
evening by taking wrap out of four value containers inside a `td` that has not opted into
wrapping; its own ADR-002 scoped what the coming control must own without building it — the field
already exists (`ColumnDef.wrap`, `column-manager-renderer.ts`'s quick toggle), it is already on
by default for one catalogue column, and `db-cell-wrap` carries no cap, so turning wrap on for
every column would reopen the same defect through a different door.

Two surfaces were named for the two halves: a per-view setting on `053`'s own view settings
panel/sheet, and a per-column override on `052`'s column menu. Neither existed as a *view-level*
default before this; the column-level field did.

### Decision

**A boolean view default, a tri-state column override, column wins.**

- `ViewConfig.wrapText` (new) is a table-view-only switch in the view settings panel, placed next
  to `rowDensity` using the same `renderSwitch` row grammar `showEmptyFields` and
  `recordIcon.show` already use — no new row shape. **Default off**, so an upgraded vault's tables
  render exactly as they do today; the operator opts in per view.
- `ColumnDef.wrap` (already shipped) carries three states instead of two: `true` forces wrap,
  `false` forces clip, `undefined` follows the view. The column menu (`column-menu.ts`) exposes
  all three as **Wrap / Clip / Follow view** in one submenu row, built with `owned-menu.ts`'s real
  `buildSubmenu` — the primitive `design-system.md` §6 recorded as unable to open a nested menu on
  2026-08-29, landed at `fc730ed9` (2026-09-05 22:26), a day before this ADR and a week after that
  section was written. §6 is stale on this one point; noted here rather than silently perpetuated
  or corrected out of this phase's scope.
- Precedence is a single expression, computed once: `col.wrap ?? config.wrapText`, in
  `CellRenderer.renderCell`. A column's own choice always overrides the view; `undefined` is the
  only state that reads the view at all.
- The column manager's own quick icon toggle (`column-manager-renderer.ts`) is left as its
  pre-existing two-state cycle (wrap / follow-view) rather than widened to three — it is a
  shortcut, not the authoritative control the column menu's submenu is, and the task named the
  column menu specifically for the three-state ask.

**One data-integrity fix rides with this, not a new decision.** `column-operations.ts`'s
rename/retype path normalized the property-edit modal's wrap checkbox with `result.wrap ||
undefined`, which was inert while `wrap` was two-state (`false` and `undefined` meant the same
thing) and would have silently turned an explicit "clip" into "follow view" once `false` became a
real, distinct state. Changed to a direct assignment.

### Consequences

- No vault changes appearance on upgrade: `wrapText` is absent everywhere until an operator opens
  a view's settings and turns it on.
- The row-height floor stays provable in the same lane `005`'s ADR-001 added to:
  `render-assertions.mjs` gained a `WRAP TOGGLE` pass on the same catalogue mount, asserting a
  clipped row stays at the floor and a view with `wrapText` forced on grows past it. Measured on
  the harness's phone page (390x844, `is-phone`) — the device the defect was reported on —
  **36px clipped against a 36px floor, 133px wrapped**. Both halves were seen red before landing:
  forcing the clipped scenario to wrap reports 133px and fails, and the wrapped scenario is itself
  the control for the wiring reaching the renderer at all.
- Two `vitest` pins carry what a browser lane cannot see. `data-source.test.ts` round-trips
  `wrapText` through the reader and the writer with an unnamed sibling key as the negative control,
  and asserts a view written before this release reads back clipped; removing either half of the
  wiring turns it red. `cell-renderer-wrap.test.ts` drives the real `renderCell` over the 3x2
  matrix of column override against view default; `??` → `||`, or dropping the view default,
  turns it red.
- Three surfaces write the same field (view settings switch, column menu submenu, column manager
  quick toggle, rename modal checkbox) and one place resolves it (`cell-renderer.ts`). A future
  fourth writer only has to produce a `boolean | undefined` on the right field; the read side does
  not change.

### Anytype parity

Read on `screenshots/anytype/desktop/menus/anytype-menu-set-view-settings-dark.png`,
`anytype-menu-set-column-header-light-full.png` and `anytype-menu-set-column-header-align-dark.png`.

**Anytype has no wrap control at all, on either surface.** Its view settings menu carries View name,
Layout, Properties, Filter, Sort, Duplicate view and Remove view; its column-header menu carries the
property name and type, Open as Object, Duplicate, Remove from Collection, Add filter, the two sorts,
Insert left/right, Hide Property, Align and Calculate. Neither offers wrapping, and the grid behind
the open menu in the full-page capture clips every long value to one line with an ellipsis at a
uniform row height. So there is no Anytype behaviour to match here — the ask is ours, and the
comparison is only about the *shape* of the control.

**On shape we match it.** Anytype's own per-column three-state choice is `Align` (Left / Center /
Right): an icon-plus-label parent row with a trailing chevron, opening a child menu flush beside it
with a check on the current value. That is the row this ADR adopts. **Where we differ:** our parent
row also carries the current value as trailing text (`db-menu-item-current`), which Anytype's `Align`
row omits — but which its *view settings* rows do use (`Layout → Grid`, `Properties → Name, Object
type,…`). We take the value-carrying form in both places rather than splitting the vocabulary by
depth, because a wrap state that is invisible until the submenu opens is the state a reader most
needs to see: the whole point of `Follow view` is that it is not self-evident from the cell.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Column-level only, no view default** | Smaller change; the field already existed | Does not answer the operator's ask, which named a per-view setting explicitly, and leaves every column to be set one at a time |
| **View-level only, no column override** | One setting, nothing to explain | Discards the shipped per-column field and the catalogue's own wrap:true column would have no way to force wrap independent of the view |
| **Both, column wins (chosen)** | Matches the operator's own two-surface framing; reuses the shipped field; one resolution rule | A column's `false` and the view's off both read as "clipped," so a reader inspecting only the column menu cannot tell which one is holding it there without opening the view settings too — accepted, because the submenu's "Follow view" row is the visible tell |

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — row 53 is an open operator ask, and `005` ADR-002 named this exact gap without closing it |
| **Is there a simpler existing thing?** | `ColumnDef.wrap` itself — this widens its range from two states to three and adds one new view field; no new class of control |
| **What does it touch?** | `types.ts` (both fields), `data-source.ts` (parse/serialize `wrapText`), `cell-renderer.ts` (the one resolution), `column-menu.ts` and `embedded-database-renderer.ts` (the submenu), `view-config-panel-renderer.ts` (the switch) |
| **What is the real caller that must not break?** | Every existing `renderCell` call site — the new fourth parameter is optional and every scenario that never sets it keeps its exact prior output, proved by pixelHash-identical screenshots after a full recapture |
| **What contract must not break?** | `005` ADR-001's `td:not(.db-cell-wrap)` rule for the four value containers — the wrap control reaches it only by adding `.db-cell-wrap` through the same class, never by touching the containers directly |
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: The summary footer is hidden at zero rows; its phone trigger meets the 44px floor

**Status: Accepted, 2026-09-06 (~08:10).**

### Context

`renderTable` draws the `tfoot.db-table-footer` summary row — one `db-table-footer-trigger`
"+ Calculate" button per visible column — at any row count, including zero: an empty table showed
a footer of controls with nothing to summarize. Separately, `tools/live/touch-targets.mjs`'s
constructed pass records 173 `db-table-footer-trigger` instances under its own 28px coarse-pointer
floor (`raiseHistory`, 2026-09-04), because the trigger's phone height was never raised past its
desktop `calc(var(--db-row-height) - 8px)` (26px). This is the same shape the embedded table's
Load-more row carried before its own operator ruling the same day (`../../roadmap.md` §6A, "taken
2026-09-06 (~04:45)"): a row that stays useful on a mouse but sits under the thumb floor on a
phone.

### Decision

**Operator, 2026-09-06 (~08:10), verbatim option:** *"Hide the footer at zero rows, 44px
otherwise."*

**Zero rows draws no footer at all.** `table-renderer.ts`'s private `renderFooter` returns before
calling `TableFooterRenderer.renderFooter` when `rows.length === 0`, on every path that reaches it
(the windowed branch, the flat branch and the grouped branch all call the same private method) —
both the full-page and embedded renderers share one `TableRenderer`, so the fix is not duplicated.
`config.summaryRules` is never touched: the footer reappears with its prior calculations intact
the instant a row exists, because the guard is purely a render-time skip.

**When rows exist, the phone trigger meets the same 44px floor every other phone row does.**
`.is-phone .note-database-container .db-table-footer-trigger` gains `min-height: 44px` (its
`tfoot` cell gains `height: 44px` alongside it), the same floor `.is-phone .db-menu-item` and the
load-more row's own `.is-phone` rule already raise their rows to. Desktop is untouched at 26px.
`tools/live/touch-targets.mjs` gained a matching `RAISED` entry holding the class to 44px outright
on phone, so a regression back under it fails the lane rather than only widening the informational
28-44px band.

### Consequences

- Both touch-targets ratchets move down, never up, on this fix alone: the constructed baseline's
  974 drops to 801 (all 173 `db-table-footer-trigger` instances clear their new 44px floor and
  leave the general 28px ratchet), and the fixture baseline's 209 (already stale; the untouched
  tree measures 197) drops to 196.
- No fixture or constructed scenario in `tools/screenshots/` mounts a table at zero rows, so the
  hidden-footer half of this decision has no capture to move — it is proven by
  `table-renderer-footer-visibility.test.ts` instead (zero rows → no `.db-table-footer` and the
  empty-state card in its place; one renderer driven from zero rows to one → the footer returns
  carrying its COUNT). The render-assertion bundle's own two empty-table probes were also mounted
  and read, and both come back with no `tfoot.db-table-footer`. Named here rather than silently
  left unverified.
- 12 mobile captures moved pixelHash from the 44px trigger height (a table's footer row growing
  from a 26px-tall "+ Calculate" hint); the css lane's 2026-09-06T22:40:00Z release names all
  twelve, and no desktop capture moved pixelHash, which is what the `.is-phone` scope predicts.
  A further 14 moved bytes without moving pixelHash — 10 mobile tables whose footer sits below the
  fold, so their layout moved and their pixels did not, and 4 unrelated encoder and rasteriser
  noise — and all 14 are restored to their committed bytes with the manifest's `bytes` reconciled
  to the files on disk.
- The trigger was measured rather than assumed: 44 CSS px, 88 device px at DPR 2, in the
  `chrome-table-footer` fixture and in both the file-view and embed constructed scenarios, with its
  `tfoot` cell at 53 CSS px.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Keep the footer at zero rows, raise the trigger anyway** | Smaller diff; the touch-target fix stands alone | Leaves a row of controls with nothing to summarize, which is the defect the operator named first |
| **Hide the footer at zero rows, leave the phone trigger at 26px** | Smaller diff | Does not answer the operator's second clause, and leaves the 173-instance touch-target shortfall recorded rather than closed |
| **Both, as ruled (chosen)** | Answers both clauses of the verbatim option; closes a real touch-target shortfall this file's own history already tracked | None — the desktop trigger is unaffected and the summary config survives the toggle in both directions |

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — an operator-observed defect (a footer of controls with nothing to summarize) plus a measured touch-target shortfall (173 instances under this project's own 28px floor) |
| **Is there a simpler existing thing?** | Yes on both halves: the private `renderFooter` wrapper already gates every call site, so one early return covers all three render paths; and `.is-phone .db-menu-item`'s own 44px rule is the floor this reuses rather than inventing a new number |
| **What does it touch?** | `src/views/table-renderer.ts` (`renderFooter`), `styles.css` (`.db-table-footer-trigger` and its `tfoot` cell, `.is-phone`-scoped), `tools/live/touch-targets.mjs` (one `RAISED` entry) |
| **What is the real caller that must not break?** | The three `renderFooter` call sites in `table-renderer.ts` (flat, windowed, grouped) — all three still call through the one private method, and `config.summaryRules` is read exactly as before once a row exists |
| **What contract must not break?** | `TableFooterRenderer.renderFooter`'s own contract (columns, options, calculation values) is unchanged; the guard sits entirely outside it |
<!-- /ANCHOR:adr-005 -->
