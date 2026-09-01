---
title: "Feature Specification: Record Open Target"
description: "Where a record opens, decided once by a setting instead of by which affordance was clicked, and producing the note's rendered body rather than a property list."
trigger_phrases:
  - "record open target"
  - "record peek shows properties not page"
  - "open in side panel or full page"
  - "table record peek"
  - "open path census"
  - "006 record open"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/006-record-open-target"
    last_updated_at: "2026-08-30T18:40:00Z"
    last_updated_by: "summary-author"
    recent_action: "Found shipped: desktop Open opens the note and the peek left z-index 998"
    next_safe_action: "Take the target-policy decision with the operator; no further code before it"
    blockers:
      - "Depends on 003-mobile-sheet-presentation for the phone answer"
      - "T5, the target-policy decision, is unmade and gates every remaining task"
    key_files:
      - "spec.md"
      - "implementation-summary.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-006"
      parent_session_id: null
    completion_pct: 43
    open_questions:
      - "Side panel, full-page modal, or both behind the setting"
    answered_questions: []
---
# Feature Specification: Record Open Target

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `003-mobile-sheet-presentation`, last in
> the program. Root causes, the corrected inventory and the criteria doctrine live in
> [`../architecture-findings.md`](../architecture-findings.md); this spec cites it and does not
> restate it.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

Clicking **Open** in the table produces a small card listing properties. It never reads the file, it
docks to the container's right edge rather than anchoring, it sits at a literal `z-index: 998` above
every popover, and it has no phone CSS at all. Behind that single defect the open-path census finds
twenty affordances resolving to four surfaces, with no setting for anyone to disagree with.

**Key Decisions**: one resolver decides the open target from a persisted setting, the platform and the
record, and every affordance calls it; the target is a real Obsidian surface showing the note's
rendered body; the peek is retired rather than left beside its replacement.

**Critical Dependencies**: `000-surface-contract-and-truthful-harness` for the factory and token root,
and `003-mobile-sheet-presentation` for the phone answer — without the portal the phone target is
another container-bound panel and A3 cannot pass. This phase is last and blocks nothing.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 006-record-open-target |
| **Level** | 3 |
| **Depends on** | `000` for the factory and token root; `003-mobile-sheet-presentation` for the phone answer |
| **Blocks** | nothing; it is last |
| **CSS lane** | holds `styles.css` for the peek retirement and the target surface's rules |
| **Priority** | P0 |
| **Status** | **Partial — desktop Open and the peek layer landed under `002`'s lane hold; the setting, the resolver and every measurement are outstanding.** In the tree: `openRow` routes through `dataSource.openNote` at `src/views/database-view.ts:410` and four further call sites. `tasks.md` carries 0 of 32 ticked. **Completion figure: UNKNOWN** — this phase has no `goal.md` criteria checklist, so the rule in `../roadmap.md` §3.2 has nothing to count and the `completion_pct` below is an unrevised phase-cut value. Writing that checklist settles it. |
| **Created** | 2026-08-29 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `003-mobile-sheet-presentation` |
| **Successor** | None — last in the program |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

On desktop, clicking **Open** in the table shows a small card listing properties. The operator wants
the actual page — in a side panel or a full-page modal.

**The peek is display-only by construction.** `src/views/table-record-peek.ts` renders a basename
header (`:176-177`) and a flat label/value list whose every value is
`value.textContent = stringifyValue(getColumnValue(row, column))` (`:262-271`). It never calls
`MarkdownRenderer`, never reads the file, and does not even render inline markdown — the sibling
`record-detail-panel.ts` at least imports `renderInlineMarkdown` (`:38`). The module declares itself
"Display-only" at `:3`. **The note's body is not merely unstyled; it is never fetched.**

**It is docked, not anchored.** `styles.css:18319-18338` is `position: absolute; top: 0; right: 0;
bottom: 0; width: min(360px, 100%)`. There is no `positionToolbarPopover` call and no
`getBoundingClientRect`; the `anchor` option is used only for outside-click hit-testing (`:155`), so
the panel docks to the container's right edge no matter which row was clicked. It self-dismisses on
container scroll and window resize (`:227-228`) precisely because it cannot follow its anchor.

**Its z-index is outside the scale, and above the wrong things.** `styles.css:18324` is a literal
`z-index: 998`. The declared scale is `--db-layer-panel: 50`, `--db-layer-popover: 100`,
`--db-layer-submenu: 110`, `--db-layer-modal: 1000` (`styles.css:71-74`). 998 is none of them, and it
is **above every popover and submenu** — so a dropdown opened from inside the peek paints beneath it.
The sibling detail panel documents having deliberately fixed exactly this and uses
`var(--db-layer-panel, 50)` (`styles.css:9000`, comment at `8994-8996`). The peek was never brought
onto the scale.

**It has no phone CSS at all.** Fifteen `db-record-peek` hits in `styles.css` (18230, 18319, 18340,
18352, 18359, 18366, 18373, 18377, 18385, 18401, 18402, 18407, 18415, 18419, 18426), every one a flat
top-level selector. `grep -n "is-phone.*record-peek\|record-peek.*is-phone" styles.css` exits 1. No
`@media` block anywhere in the file contains a `db-record-peek` selector.

---

### Why this is its own spec

This is a product decision with a settings surface, not a styling fix. The question "where does a
record open" has to be answered once, by the user, and then honoured by every affordance. That is a
policy and a persisted setting, not a rule in `styles.css`.

It depends on `003` because the phone answer is a leaf or a full-height sheet, and neither exists
until the portal work lands. Sizing it as a CSS change would produce a fourth surface rather than
replacing the ones that already disagree.

---

### Purpose

Where a record opens, decided once by a setting instead of by which affordance was clicked, and
producing the note's rendered body rather than a property list.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- One resolver: setting x platform x record → surface, called by every affordance in Section 4A
- A persisted open-target setting on `PluginSettings`, absent meaning current behaviour
- A target surface that contains the note's rendered body and is a real workspace leaf or `Modal`
- Retiring the hardcoded touch branch at `database-view.ts:8425` and giving `Mod+Enter` the same
  resolution as the button
- Bringing `getLeaf(false)` (`data-source.ts:425`) under the resolver so an open does not destroy the
  view it came from
- Retiring `table-record-peek.ts` and its fifteen `styles.css` rules, or reducing it to the resolver's
  preview mode with the literal `998` replaced by a declared tier

### Out of Scope

- The database definition file's open behaviour. `databaseFilesAlwaysOpenInNewTab` and
  `databaseFilesPreventDuplicateTabs` (`src/data/types.ts:641-644`) are consumed only at
  `main.ts:689-724` and must keep doing exactly what they do
- Hover preview (`src/views/hover-link-preview.ts:59-66`) — it is not an open
- Field-link opens inside cell values
- The sheet portal itself — that is `003`, and this phase depends on it rather than reimplementing it

### Files to Change

The complete list is the delta between Section 4A's static census and the Stage-1 driven trace. The
files known before the trace are:

| File Path | Change Type | Description |
|---|---|---|
| `src/data/types.ts` | Modify | The open-target setting added to `PluginSettings` (`src/data/types.ts:636-657`), absent meaning current behaviour |
| `src/settings.ts` | Modify | The setting's control, beside the existing database-file toggles that must keep their current scope |
| `src/data/data-source.ts` | Modify | `getLeaf(false)` at `src/data/data-source.ts:424-426` comes under the resolver |
| `src/views/database-view.ts` | Modify | The hardcoded touch branch at `database-view.ts:8419-8437` retired; `Mod+Enter` at `database-view.ts:1717-1736` resolved the same way as the button; `openRow` at `src/views/database-view.ts:8107-8110` routed |
| `src/views/table-record-peek.ts` | Delete or Modify | Retired, or reduced to the resolver's preview mode; `table-record-peek.ts:109`, `:227-228`, `:262-271` |
| `styles.css` | Modify | The fifteen `db-record-peek` rules; the literal `z-index: 998` at `styles.css:18324` replaced by a tier from the scale at `styles.css:71-74` |
| Target-surface module | Create | The resolver and the surface that renders the note's body |
| Affordance call sites | Modify | All twenty in Section 4A routed through the resolver in one pass |
| `tools/storybook/verify-placement.mjs` | Modify | Driven-affordance assertions, the phone height check and the A6 hit test |

<!-- /ANCHOR:scope -->
---

## 3A. MEASURED FACTS — THE OPEN-PATH CENSUS

Run against the current tree. **The paths do not agree, and there are more than three.**

### Four surfaces, six call paths

| # | Path | Surface produced | Where |
|---|---|---|---|
| 1 | `DataSource.openNote` → `getLeaf(false).openFile` | a real leaf, **replacing the current tab** | `src/data/data-source.ts:424-426` |
| 1b | `DatabaseView.openRow` (flushes computed fields, then Path 1) | same real leaf | `src/views/database-view.ts:8107-8110` |
| 2 | `openTableRecordPeek` | display-only docked `div`, not a leaf, not a `Modal` | `src/views/table-record-peek.ts:109` |
| 3 | `openRecordDetailPanel` | editable floating panel; phone bottom sheet | `src/views/record-detail-panel.ts:141` |
| 4 | `workspace.openLinkText(row.file.path, …)` | real leaf, from inside the only true `Modal` | `src/views/chart-renderer.ts:1002-1005`, `:1027-1031` |
| 4b | `getLeaf(false).openFile` on the row's own file, from a field | real leaf | `src/views/file-field-renderer.ts:137-148` |

A fifth surface, hover preview, is not an open: `src/views/hover-link-preview.ts:59-66`.

### Which affordance takes which path

| Affordance | Path | Where |
|---|---|---|
| Table title click | **1b** real leaf | `cell-renderer.ts:217-227`, injected at `database-view.ts:611` |
| Table **Open** button (`db-record-open-btn`) | **2** peek on desktop, **3** detail panel on touch | branch at `database-view.ts:8419-8437` |
| `Mod+Enter` on a focused table cell | **2** peek — **no touch guard** | `database-view.ts:1717-1736` |
| `Enter` on a focused table cell | none — starts inline edit | `table-keyboard-navigation.ts:48` |
| List row body click | **3** detail panel | `list-renderer.ts:252-257` |
| List **Open** button (`db-list-row-open`) | **1** real leaf | `list-renderer.ts:279-289` |
| Board card body click | **3** | `board-renderer.ts:752-757` |
| Board **Open** button (`db-board-card-open`) | **1** | `board-renderer.ts:873-883` |
| Gallery card body click | **3** | `gallery-renderer.ts:260-265` |
| Gallery **Open** button (`db-gallery-card-open`) | **1** | `gallery-renderer.ts:298-308` |
| `Enter` / `Space` on a focused card | **3** | `card-roving-tabindex.ts:341-363` |
| Calendar event click | **3**, falling back to **1** | `calendar-renderer.ts:1656-1665` |
| Calendar backlog item | **3**, falling back to **1** | `calendar-renderer.ts:179-184` |
| Timeline event click | **3**, falling back to **1** | `calendar-timeline-renderer.ts:598-606` |
| Timeline backlog item | **3**, falling back to **1** | `calendar-timeline-renderer.ts:463-469` |
| Calendar grid-cell `Enter` | none — creates an entry for that date | `calendar-keyboard-navigation.ts:101-112` |
| Chart drilldown row | **4** | `chart-renderer.ts:1002-1005` |
| Chart **Open all** | **4**, one new leaf per row | `chart-renderer.ts:1019-1031` |
| Row context menu "Open note" | **1b** | `row-menu.ts:82-86` |
| Detail panel's own "Open note" | **1** then closes | `record-detail-panel.ts:222-232` |

### The three facts that decide the design

- **Same glyph, same label, two outcomes.** `db-record-open-btn`, `db-list-row-open`,
  `db-board-card-open` and `db-gallery-card-open` share the `maximize-2` icon and the
  `menu.openNote` label. The table's opens a preview surface; the other three open a real leaf.
- **Every real-leaf open replaces the current tab.** `getLeaf(false)` — `data-source.ts:425`, one
  line. Opening a record navigates the database view away. Neither that nor the peek is what was
  asked for.
- **No setting exists.** `PluginSettings` is `src/data/types.ts:636-657`; its only open-related fields
  are `databaseFilesAlwaysOpenInNewTab` and `databaseFilesPreventDuplicateTabs` (`:641-644`), which
  govern the **database definition file** and are consumed only at `main.ts:689-724`. Neither reaches
  `DataSource.openNote`. `ViewConfig` (`types.ts:408`+) has no open-target field either. The
  desktop-versus-touch choice is a hardcoded runtime branch at `database-view.ts:8425`.

---

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001 — One policy, one resolver.** A single function resolves the open target from the setting, the
  platform and the record. Every affordance in §4 calls it. No affordance decides for itself, and the
  hardcoded touch branch at `database-view.ts:8425` is retired.

- **REQ-002 — The target shows the page.** The surface contains the note's **rendered body**. A property
  list is not an answer to "open".

- **REQ-003 — The target is a real Obsidian surface.** A leaf or a `Modal`, owned by the workspace, with a
  lifetime independent of the database view's render cycle.

- **REQ-004 — The setting round-trips and is honoured.** It persists across a reload and every affordance
  produces the configured target.

  **The round-trip alone does not close A5** (review finding F8): a persisted string that nothing acts
  on satisfies it while the user still gets whatever surface the affordance always produced. A5 closes
  on a driven open per target value **after** the reload — 0 affordances producing a surface other
  than the one the setting names.

- **REQ-005 — The phone answer is a leaf or a full-height sheet.** This is why the spec depends on `003`.
  Nothing on a phone produces a surface shorter than half the viewport.

- **REQ-006 — The peek is retired, not left beside its replacement.** `table-record-peek.ts` and its fifteen
  CSS rules go, or the module is reduced to the resolver's preview mode with the literal `998` replaced
  by a declared tier. A second surface that nobody routes to is how the current disagreement started.

- **REQ-007 — Opening a record does not destroy the view it was opened from.** Whatever `getLeaf(false)`
  becomes, the database view survives the open unless the user chose full-page.

---

### P1 - Required (complete OR user-approved deferral)

None. Every requirement above is a blocker: each one is load-bearing for a criterion in Section 5,
and the spec records no deferral for any of them.

<!-- /ANCHOR:requirements -->
---

## 4A. INVENTORY METHOD

**Trace, do not grep.** §4 above is the static census and it is the starting point, not the
deliverable.

Drive each affordance in the running plugin and record the surface it actually produced: its
constructor, its parent, whether it is a workspace leaf, its rect, and whether the database view
survived. Static reading already disagrees with the reported symptom once — the table **Open** button
branches on `isTouchDevice` and sends touch devices to the detail panel, so the 360px dock is
reachable on a phone only through `Mod+Enter`, which carries no touch guard
(`database-view.ts:1717`). A trace settles which surface a person on a device actually meets.

The delta between the driven trace and §4's table is the finding.

---

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

### Acceptance Criteria

Each is measured on the real renderer at the production mount point. Rows marked *trace* take their
failing number from §6's artefact; the source fact beside them is why the criterion is expected to
fail.

| # | Criterion | Today |
|---|---|---|
| **A1** | The surface produced by **Open** contains the note's rendered body: seed a note whose body has a heading and a paragraph, then count the body characters present in the surface | **0** — the peek stringifies column values only (`table-record-peek.ts:262-271`) and never reads the file |
| **A2** | After a field commit re-renders the view, `elementFromPoint` at the surface's centre still returns a node inside the surface | *trace* — the peek dismisses on container scroll and window resize (`:227-228`); it is not a leaf and not a `Modal` |
| **A3** | On a 402px phone the surface's height is at least half the viewport | *trace* — the detail panel is clamped to `50vh` (`styles.css:9074-9076`, `60vh` desktop at `:9001`); the peek is a `min(360px, 100%)` dock with no phone rule at all (`styles.css:18328`) |
| **A4** | Driving every affordance in §4, the count that produced a surface other than the configured target is **0** | **20 affordances resolve to 4 surfaces and there is no setting to disagree with** (`types.ts:636-657`) |
| **A5** | The setting survives a plugin reload: written value equals read-back value, **and after the reload a driven affordance produces the surface the setting names — 0 mismatches across every target value it accepts.** *Threshold extended under review finding F8: a round-trip alone closes on a persisted string that nothing has to act on* | no such setting exists, so no affordance can disagree with one; the spread it must collapse is A4's **20 affordances resolving to 4 surfaces** |
| **A6** | A dropdown opened from inside the surface is on top: `elementFromPoint` over the dropdown returns the dropdown | returns the peek — `z-index: 998` (`styles.css:18324`) is above `--db-layer-popover: 100` and `--db-layer-submenu: 110` (`styles.css:72-73`) |
| **A7** | Opening a record leaves the database view rendered, unless the user chose full-page | *trace* — `getLeaf(false)` reuses the active leaf (`data-source.ts:425`), navigating the view away |
| **A8** | Deleting the target surface from the harness DOM changes an asserted number | no such check exists; per `000` R6 an assertion that survives deletion is theatre |

**Banned.** No criterion may count call sites, assert a class is present, or assert a rule count. A4
counts *observed surfaces produced by driven affordances*, which is a behavioural measurement, not a
static call count — the distinction is the whole point of `architecture-findings.md` §9.

---

### Acceptance Scenarios

1. **Given** a note whose body has a heading and a paragraph, **When** it is opened through any
   affordance, **Then** the body characters are present in the surface (A1).
2. **Given** the open-target setting written and the plugin reloaded, **When** it is read back,
   **Then** it equals the written value, and every affordance produces that target (A5, A4).
3. **Given** a dropdown opened from inside the target surface, **When** `elementFromPoint` is called
   over the dropdown, **Then** it returns the dropdown (A6).

<!-- /ANCHOR:success-criteria -->
---

## 5A. VERIFICATION METHOD

- **Behaviour tests** — driven in the browser harness: activate each affordance, assert the resulting
  surface's identity, rect and survival. `vitest` runs `environment: "node"` with no jsdom, so
  **every DOM assertion lives in `tools/storybook/verify-placement.mjs`** or its successor. A vitest
  test here may assert source text and the setting's serialisation; it may not claim to have measured
  a rectangle.
- **Negative controls** — A8 before the criteria are trusted.
- **Line numbers are dated hints; the selector or symbol is the address.** Every `styles.css:NNNN` and
  `src/**/*.ts:NNNN` here was confirmed correct on 2026-08-29 and is kept as evidence about the tree
  on that date. Five phases edit `styles.css` before this one starts. `acceptance-criteria.md`
  carries the resolution table; when the command and the number disagree, the command is right. The
  literal `998` is evidence in its own right — **its value matters more than its address**, because
  it is the number that beats two declared tiers.
- **AC-006 cannot be evaluated without the cascade** (review finding F3). `verify-placement.mjs:220`
  loads `styles.css` on the **phone** page only, and the entire A6 finding is that a literal
  `z-index: 998` beats `--db-layer-popover: 100` and `--db-layer-submenu: 110`. On a page with no
  stylesheet **no z-index applies to anything**, so the hit test returns whatever DOM order gives and
  reports a result unrelated to the defect. A3's phone half is safe; its desktop comparison is not,
  and any rect the behavioural criteria read along the way — AC-002's `elementFromPoint` in
  particular — is subject to the same rule. `000` repairs the load; no desktop measurement recorded
  before that is admissible, and one taken earlier is discarded rather than re-used. Cross-check
  against `009`'s live probe.
- **The `styles.css` lane.** Taken at the start of Stage 5 (*Retire the peek*), the stage that removes
  the peek's fifteen rules and replaces the literal `998` with a declared tier; held through Stage 6.
  Stages 1 to 4 trace, decide, build the resolver and route the affordances against an unedited
  stylesheet. Released only after a full recapture, a **named human** signing off on every changed
  PNG, `008`'s early replay re-asserting `000`, `004`, `005`, `001`, `002` and `003` against the
  released tree, and cascade re-confirmation for every duplicated selector touched — a real check
  here, since replacing `998` with a declared tier changes stacking for anything that sat between the
  two values. This is the last handoff before `008`'s full release gate, and therefore the last cheap
  chance to find a cascade reversal introduced anywhere in the program.
- **Stage 5 may not retire the peek before its *before* numbers exist.** AC-002, AC-003, AC-007,
  AC-009 and AC-012 all measure the peek's current behaviour; once the module is gone there is
  nothing left to measure them against. Deleting before Stage 4 strands `Mod+Enter`, deleting after
  Stage 4 recreates the disagreement, and deleting before the numbers exist makes the fix
  unfalsifiable.
- **Screenshots** — one per target: side panel, full-page, phone. Both themes. Ending in **a human
  looking at the changed PNGs**; `screenshots:verify` proves only that a capture was regenerated
  after its hand-maintained source list changed, and never opens an image.
- **Storybook** — each target surface at its production mount point, plus the setting's states.
- **Research gate** — standing, triggered when a criterion fails twice without a new hypothesis. The
  reference question is Notion's side-peek and full-page: what each shows, what persists when the
  underlying view re-renders, and what the phone does instead. **Notion is the visual target and is
  not a source** — describe the behaviour, then derive values from our own token scale. AnyType and
  AppFlowy under `external/` are read for **behaviour only**; both are AGPL/source-available against
  this plugin's MIT, so **never copy code, CSS values or token scales.**

---

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

**A new surface beside the old ones is the failure mode this program exists to stop.** R6 is not
tidying; leaving the peek routed-to-by-nothing reproduces the exact condition in §4 where twenty
affordances reach four surfaces.

**Changing `getLeaf(false)` is a one-line change with a wide blast radius.** It is called from
`database-view.ts` in six places and `embedded-database-renderer.ts` in seven, plus `main.ts` for the
database definition file, which must **not** change. The resolver draws that boundary explicitly.

**The setting is persisted state.** Absent values must retain current behaviour, so an existing vault
that never opens settings sees no change until it chooses one.

**`003` is a hard dependency, not a preference.** Without the portal, the phone target is another
container-bound panel and A3 cannot pass.

---

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Dependency | `003-mobile-sheet-presentation` | Without the portal the phone target is another container-bound panel and A3 cannot pass | Hard dependency; if `003` slips this spec stops at Stage 4 with the phone target unimplemented rather than shipping a fourth phone surface |
| Dependency | `000-surface-contract-and-truthful-harness` | The factory, the token root, and the Storybook `Modal` stub the chart drilldown precedent needs | `000` T5 already owns the stub unblock |
| Dependency | Operator decision on target policy | Side panel, full page, or both changes the size of every later stage | Stage 2 takes the decision before any code is written |
| Dependency | Serialized `styles.css` lane, Stage 5 | The peek's fifteen rules cannot be edited concurrently | The lane is held for Stage 5 and released at Stage 7's recapture |

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance

- **NFR-P01**: The resolver is a pure function of setting, platform and record; it performs no I/O and
  is not on a render hot path.
- **NFR-P02**: Chart **Open all** opens one leaf per row today (`chart-renderer.ts:1019-1031`); the
  resolver must not multiply that count.

### Security

- **NFR-S01**: No network call, telemetry or remote dependency. Local Obsidian workspace APIs only.
- **NFR-S02**: AnyType and AppFlowy under `external/` are read for behaviour only — both are
  AGPL/source-available against this plugin's MIT, so no code, CSS value or token scale is copied.
  Notion is the visual target and is not a source.

### Reliability

- **NFR-R01**: The setting is persisted state. An absent value retains current behaviour, so an
  existing vault that never opens settings sees no change until it chooses one.
- **NFR-R02**: The resolver's boundary is explicit and asserted: record opens come under it, the
  database-definition-file opens at `main.ts:689-724` do not.
- **NFR-R03**: Stage 3 is additive — the resolver exists and nothing calls it — so reverting it is a
  deletion with no migration.

---

## 8. EDGE CASES

### Data Boundaries

- A 402px phone must not produce a surface shorter than half the viewport. The detail panel is clamped
  to `50vh` and the peek is a `min(360px, 100%)` dock with no phone rule at all.
- Chart **Open all** produces one leaf per row; the target policy has to say what that means when the
  target is a side panel rather than a leaf.
- A record with no file cannot be opened; the resolver must return a defined outcome rather than
  falling through to a fourth surface.

### Error Scenarios

- A partial migration leaves the same `maximize-2` glyph and the same `menu.openNote` label producing
  different outcomes — the defect itself, not a step toward fixing it. Stage 4 routes all twenty in
  one pass.
- Deleting the peek before Stage 4 strands `Mod+Enter`, which carries no touch guard. Leaving it after
  Stage 4 recreates the disagreement. It goes in Stage 5, in that order.
- `getLeaf(false)` is reached from `database-view.ts` in six places and `embedded-database-renderer.ts`
  in seven. A change that catches `main.ts:689-724` breaks the database definition file.

### State Transitions

- A field commit re-renders the view. The target surface must survive it; the peek dismisses on
  container scroll and window resize precisely because it cannot follow its anchor.
- Toggling the setting must take effect on the next open without a reload, and must round-trip across
  one (A5).
- An absent setting value must reproduce today's per-affordance behaviour exactly (N3).

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 22/25 | Twenty affordances, four surfaces, six call paths, one new setting, one new surface, one module retired with fifteen CSS rules |
| Risk | 20/25 | Persisted state; `getLeaf(false)` has thirteen call sites plus a boundary that must not move; the migration is deliberately non-incremental |
| Research | 12/20 | The static census is already recorded; the open work is the driven trace and the policy decision |
| Multi-Agent | 8/15 | Single CSS lane for Stage 5 |
| Coordination | 13/15 | Depends on `000` and hard-depends on `003`; blocks nothing, and is last |
| **Total** | **75/100** | **Level 3** |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | A new target surface ships beside the peek instead of replacing it | H | M | REQ-006 retires the peek; S1 asserts no surface remains that the resolver does not own |
| R-002 | The `getLeaf(false)` change catches the database-definition-file opens | H | M | The resolver's boundary is drawn explicitly and asserted by B1-B3 |
| R-003 | `003` slips and the phone target has nowhere to live | H | M | Stop at Stage 4 with the phone target unimplemented rather than shipping a fourth phone surface |
| R-004 | The policy decision is discovered during implementation rather than taken before it | H | M | Stage 2 is a gate: no code is written until `spec.md` Section 12 is answered |
| R-005 | A partial migration leaves the same glyph producing two outcomes | H | M | Stage 4 routes all twenty affordances in one pass |
| R-006 | The setting changes behaviour for a vault that never opened settings | M | L | Absent means current behaviour; N3 asserts it reproduces today's split exactly |

---

## 11. USER STORIES

### US-001: Open shows the page (Priority: P0)

**As a** plugin user, **I want** clicking **Open** to show the note's actual page, **so that** I stop
getting a small card listing properties.

**Acceptance Criteria**:
1. Given a note whose body has a heading and a paragraph, When it is opened, Then those body
   characters are present in the surface (A1).
2. Given the surface, When the view re-renders after a field commit, Then `elementFromPoint` at its
   centre still returns a node inside it (A2).

### US-002: I choose where records open (Priority: P0)

**As a** plugin user, **I want** to choose whether records open in a side panel or full page, **so
that** every affordance behaves the way I asked rather than the way its author happened to code it.

**Acceptance Criteria**:
1. Given the setting written and the plugin reloaded, When it is read back, Then it equals the written
   value (A5).
2. Given every affordance driven, When each surface is observed, Then none differs from the configured
   target (A4).

### US-003: Opening a record does not lose my view (Priority: P0)

**As a** plugin user, **I want** the database view to still be there after I open a record, **so
that** I do not have to navigate back to where I was.

**Acceptance Criteria**:
1. Given any affordance other than a deliberate full-page open, When a record is opened, Then the
   database view is still rendered (A7).
2. Given a dropdown opened from inside the target surface, When the hit test runs over the dropdown,
   Then it returns the dropdown rather than the surface (A6).

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

**Side panel, full-page modal, or both behind the setting?** The operator asked for "a side panel or
a full-page modal". Both are buildable; the decision changes the shape of the setting — a boolean, a
three-value enum including the current preview, or a per-view override.

A related sub-question the census forces: the table title, the list/board/gallery **Open** buttons and
the context menu already open a real leaf. If the setting's default is "full page", most affordances
change only in *which* leaf they use; if it is "side panel", all twenty change surface. That choice
sets the size of this spec and should be taken before Stage 3, not discovered during it.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- **Folder neighbours**: `005-content-row-rhythm`, and the standing research run in
  `007-architecture-research`, which is not a program phase and is not on the execution path.
  Folder numbering is an identifier, not the execution order; this phase runs last, per
  [`../spec.md`](../spec.md) §3.
- **Parent Spec**: [`../spec.md`](../spec.md)
- **Findings**: [`../architecture-findings.md`](../architecture-findings.md)
- **Predecessor**: [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md)
- **Foundation**: [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- **Implementation Plan**: See [`plan.md`](plan.md)
- **Task Breakdown**: See [`tasks.md`](tasks.md)
- **Verification Checklist**: See [`checklist.md`](checklist.md)
- **Acceptance Criteria**: See [`acceptance-criteria.md`](acceptance-criteria.md)
