---
title: "Feature Research: the view toolbar and view controls (053) — what Notion's captures add to a surface already built to their grammar"
description: "Deep-research synthesis of Notion's view-toolbar captures read against the note-database plugin's toolbar: which of the digest's thirteen patterns we already carry, the six additive refinements that survive, the one genuine conflict with a landed threshold, the device-only checks, and a ranked remediation plan with thresholds and red-first probes."
trigger_phrases:
  - "research findings"
  - "toolbar notion research"
  - "053 research"
  - "notion toolbar refinement"
  - "view controls research"
  - "research synthesis"
importance_tier: "normal"
contextType: "general"
---
# Feature Research: the view toolbar and view controls (053) vs Notion

Deep-research synthesis feeding an Opus pass that opens one child phase under
`005-component-surface-system` for the Notion refinements this surface can take.

<!-- SPECKIT_TEMPLATE_SOURCE: research | v1.0 -->

---

## 1. METADATA

- **Research ID**: RESEARCH-053-NOTION-TOOLBAR
- **Feature/Spec**: `specs/005-component-surface-system/053-toolbar-and-view-controls`
- **Status**: Complete
- **Date Started**: 2026-09-06
- **Date Completed**: 2026-09-06
- **Command**: `/deep:research:auto`, `--max-iterations 5`, `--stop-policy=max-iterations`,
  `--concurrency 1`
- **Executor**: fan-out, one lineage. `cli-pi` on `z-ai/glm-5.3-flash` (the OpenRouter route —
  `PI_MODEL_PROVIDERS` maps that literal to `openrouter`, composing
  `openrouter/z-ai/glm-5.3-flash`) at `reasoningEffort: max`, label `glm-openrouter-toolbar`.
  Invocation identity recorded at
  `lineages/glm-openrouter-toolbar/invocation-metadata.json`
  (`inv:2a2d631d45548836d09b78f2868a51255b9c52ed2002f814b14a61f23c3a82b3`).
- **Run window**: 2026-09-06 18:01:56 → 18:40:59 CEST, **2,343,275 ms** wall
  (`orchestration-summary.json`), 1 of 1 lineage `fulfilled`, exit 0, 0 salvaged.
- **Iterations**: **5 of 5**, `stopReason: maxIterationsReached` — convergence was telemetry only
  under `--stop-policy=max-iterations`.
- **Findings merged**: **34** (`findings-registry.json`, `keyFindings`), 6 of 6 questions resolved,
  0 open at the registry level.
- **Image reads**: **zero**. GLM-5.3-Flash cannot read images; every Notion fact in this document
  comes from `notion-screens-digest-toolbar.md` and is cited by screen id, exactly as the brief bound it.
- **Why these artefacts sit in `research/notion-toolbar/` and the digest carries a `-toolbar`
  suffix**: two Notion pipelines were bound to this same packet. The table pipeline landed first
  (`94f03c88`, `f52109c1`) and holds the canonical `notion-screens-digest.md` and the canonical
  `research/` directory, cited by `062-notion-table-refinement`, `053/goal.md` and `053/tasks.md`.
  This run is the later arrival and moved rather than displace four landed citations in a packet it
  does not own. **The canonical `053/research/research.md` is the table synthesis, not this one.**
  Nothing in this file has been rewritten to fit the move; only the digest's filename was corrected
  in the prose, because the unsuffixed path now resolves to the other pipeline's digest.

---

## 2. INVESTIGATION REPORT

### Request Summary

Read Notion's view-toolbar and view-control captures — view tabs, add view, filter and sort panels
and chips, group, properties/columns, search, the new-record split button, the settings gear, the
overflow menu and collapse at narrow widths — against this packet's implementation and design
record, and produce a ranked remediation plan suitable for a new child phase. Notion facts were
bounded to `notion-screens-digest-toolbar.md` (104 screens, written by an image-capable analyst); our side
was bounded to `toolbar-renderer.ts`, `toolbar-primitives.ts`, `active-view-controls-renderer.ts`,
`filter-panel-renderer.ts`, `sort-panel-renderer.ts`, `view-config-panel-renderer.ts`, the toolbar
blocks of `styles.css`, the packet's `goal.md` / `design-trueup.md` / `decision-record.md` /
`tasks.md`, `design-system.md` and `roadmap.md` §6A.

Anytype parity is the default ruling for these surfaces (`051` ADR-007, `056`, `057`). Notion
refinements are additive; where the two references disagree the conflict is named and a proposal
made, never a landed operator ruling overridden.

### Current Behavior

The toolbar was componentized onto five shared primitives before Notion's captures were read
(`c45c53c3`, and the gear/side-sheet/footer rulings that followed). `render()` assembles
`db-toolbar` as a left region (tab strip plus phone search) and a right region holding the query
cluster (filter, sort, group), the properties cluster, the utilities cluster (gear then `···`) and
the creation cluster (search plus the split New button) — `toolbar-renderer.ts:239-421`, clusters
at `:403-419`. The control cluster is icon-only by construction: `createControlClusterButton`
draws an icon, an optional count badge and an `aria-label`, and no text span
(`toolbar-primitives.ts:186-220`).

### Key Findings

1. **Twelve of the digest's thirteen patterns are already present in whole or in part.** The
   surface was built to this grammar independently of Notion (F-502; census rows F-101 through
   F-107, F-205, F-206, F-301, F-305, F-401, F-403, F-404).
2. **The highest-impact gap is destructive and uncorroborated.** `deleteView` runs with no
   confirmation at either call site — `toolbar-renderer.ts:1180` (the hub row) and `:1330` (the tab
   context menu) call `actions.deleteView(index)` directly, and `database-view.ts:3445` splices the
   view and saves. Notion's P9 (`55602f6a`, `348fd2b7`) is the only capture evidence for a
   delete-view confirm existing anywhere; Anytype has no opinion (F-304).
3. **The most common filter case costs three clicks.** Every filter is answered by the same
   nested-tree builder; the panel's zero-rule state is a text hint (`filter-panel-renderer.ts:184-191`).
   Notion's P4 puts a flat property list in front of the builder (F-202).
4. **Two condition-row dropdowns never search.** `createDropdownField` supports `searchable` and
   `view-config-panel-renderer.ts:2076-2090` already passes it; the filter and sort field dropdowns
   do not (`filter-panel-renderer.ts:517-527`, `sort-panel-renderer.ts:158-168`) (F-203).
5. **One genuine conflict with a landed threshold, resolved additively.** Notion's split New button
   survives on every populated capture including the narrow no-tab cases (`21d71e5f`, `795eb9b5`);
   our embedded collapse ladder drops the creation cluster **first**, which is `AC-012` / `T008`, an
   Anytype-derived landed threshold. The conflict is named and the order is not reopened; a
   text→icon rung is proposed *before* the existing ladder (F-105).
6. **Two digest rows are stale against the tree, and one open question is answerable.** The digest's
   §4 P3 row calls our settings surface "a popover/sheet" and the docked shape a difference — the
   desktop side sheet has since landed (`view-config-panel-renderer.ts:540-565`,
   `surface-shell.ts:185`), so we match Notion web's docked slot (F-301). And the digest's §6 Q4
   asks whether our control cluster carries text labels to collapse: it does not
   (`toolbar-primitives.ts:186-220`), so the density comparison is moot for the cluster and lives
   only on the New button's label (F-106, F-105).

### Recommendations

Six additive tasks, ranked by consequence then cost, all red-first, none reopening `D4`, `ADR-001`,
`ADR-003`, `ADR-006`, Anytype `T8` or `AC-012`. Full table in §11.

---

## 3. EXECUTIVE OVERVIEW

### Executive Summary

Notion's captures largely ratify this surface rather than correct it. Two independent products —
Anytype, read at 1:1 in `design-trueup.md`, and Notion, read at thumbnail scale in the digest —
chose the same toolbar row grammar, the same per-rule chip anatomy, the same inline search, the
same one-row condition builder and the same value-summary settings rows that this packet already
ships. Where the two references disagree with each other (Anytype's aggregate sort pill against
Notion's per-rule chips; Anytype's three-popover condition split against Notion's one-row builder),
they disagree in the direction of what we already have.

What survives is six additive refinements. One is a safety defect the captures merely made visible:
a configured view is destroyed by a single tap in the all-views hub, with no confirmation and no
undo. One is a friction defect: the single-property filter, which is the common case, costs three
clicks because the panel has only one entry surface. The other four are small — a search flag on
two dropdowns, one collapse rung, one add control, one eye toggle.

The loop opened no new front it could not close. It read 34 findings across five iterations, ruled
out nine approaches with reasons, closed all eight rows of its conflict ledger, and named five
checks that only a device or a new capture harvest can answer.

### Architecture Diagram

```
db-toolbar (toolbar-renderer.ts:239-421)
├── left region ............................. :401
│   ├── view tab strip ...................... toolbar-primitives.ts:322-394
│   │   ├── overflow collapse (measured) .... toolbar-renderer.ts:1040-1103
│   │   └── all-views hub (⋯) ............... :1105-1273  ← T-A call site :1180
│   └── phone search ........................ :1613-1680
└── right region ............................ :403-419
    ├── query cluster
    │   ├── filter trigger .................. :2241  → filter-panel-renderer.ts:129-228
    │   │                                              zero-rule branch :184-191  ← T-B
    │   │                                              field dropdown :517-527   ← T-C
    │   ├── sort trigger .................... :2260  → sort-panel-renderer.ts:71-228
    │   │                                              field dropdown :158-168   ← T-C
    │   └── group popover ................... :1701-2099
    │                                                  row builder :1878-1896     ← T-F
    ├── properties cluster .................. :2284
    ├── utilities cluster ................... gear :431, overflow :448
    │                                                  tab context menu :1330    ← T-A call site
    └── creation cluster
        ├── inline search ................... :1613
        └── split New ....................... :2351-2568, label span :2365       ← T-D
                                                        presets :2517-2540

active-view-controls-renderer.ts:72-180 — the chip rail, below the toolbar band  ← T-E
applyToolbarChromeCollapse :2561-2598 — the embedded ladder, targets at :2571    ← T-D
```

### Quick Reference Guide

| Question | Answer | Where |
|---|---|---|
| How many of Notion's patterns do we already have? | 12 of 13, in whole or in part | §5, F-502 |
| What is the top adoptable pattern? | P9's delete-view confirm | §11 T-A |
| Does anything conflict with a landed ruling? | One: P1's New-survives invariant vs `AC-012`'s drop order. Named, resolved additively | §7, F-503 |
| Does anything contradict an Anytype ruling? | No | §7 |
| What can only a device answer? | Five checks, four device plus one external harvest | §6, F-504 |
| Were any new CSS values minted? | No — all six tasks reuse the landed inventory | §5, F-406 |
| Were any images opened? | No, and none could be | §1 |

### Research Sources

| Source | Role |
|---|---|
| `notion-screens-digest-toolbar.md` | The **only** Notion source. 104 screens, cited by id throughout |
| `src/views/toolbar-renderer.ts` (2,750 lines) | Row assembly, tabs, hub, group, triggers, split New, embedded collapse |
| `src/views/toolbar-primitives.ts` (394) | Row floors, shell, condition row, cluster button, settings entry, tab strip |
| `src/views/active-view-controls-renderer.ts` (238) | The chip rail |
| `src/views/filter-panel-renderer.ts` (698) | Tree builder, panel render, rows and pickers |
| `src/views/sort-panel-renderer.ts` (342) | Sort panel, drag reorder |
| `src/views/view-config-panel-renderer.ts` (2,244) | Settings render, applied summaries, side sheet, board settings |
| `styles.css` toolbar blocks | `:1728-2100`, `:2405-2417`, `:19810-19928` |
| Packet record | `goal.md`, `design-trueup.md`, `decision-record.md`, `tasks.md` |
| Program record | `design-system.md`, `roadmap.md` §6A |

Read at HEAD `0c1b400a`. `src/` and `styles.css` are unchanged since the digest's reference HEAD
`28e680fc`, verified by an empty `git diff --stat` — so every digest citation still resolves.

---

## 4. CORE ARCHITECTURE

### Component 1: the control cluster — icon-only by construction

`createControlClusterButton` (`toolbar-primitives.ts:186-220`) creates a button carrying
`db-toolbar-icon-button`, calls `setIcon`, sets `aria-label` and a 100ms tooltip, toggles
`is-active` / `is-add` from a `data-control-state`, and appends a badge span when a count is
present. There is no text node anywhere in it.

This settles the digest's §6 Q4 directly. Notion has two attested cluster densities and collapses
text to icons before dropping controls; ours has one density and it is already the collapsed one.
The text→icon move therefore has exactly one place to land on this surface — the New button's label
span (`toolbar-renderer.ts:2365`), drawn only off-touch — which is what T-D proposes.

### Component 2: the embedded collapse ladder

`applyToolbarChromeCollapse` (`toolbar-renderer.ts:2561-2598`) hides whole clusters in the order
declared at `:2571` — `[newCluster, query, props, add]` — and then, as the last rung,
`collapseTabStripToDropdown` (`:2599-2642`). That order is the landed `AC-012` / `T008` threshold,
derived from Anytype's captures, not from Notion's.

### Component 3: the filter panel's two states

`FilterPanelRenderer.render` (`filter-panel-renderer.ts:129-228`) already branches on the empty
tree at `:184-191` and renders a `db-panel-empty` hint. Every non-empty state renders the nested
tree (`:365-455`, depth capped at 3 by `MAX_FILTER_GROUP_DEPTH`, `:52`). T-B extends the branch
that already exists; the builder is untouched, which is what `D4` requires.

### Component 4: the two delete paths

Both reach `actions.deleteView(index)` with nothing in between — the hub row action
(`toolbar-renderer.ts:1180`, `danger: true`) and the tab context-menu row (`:1330`,
`warning: true`). The host implementation splices the view, clears the state cache, saves in the
background and refreshes (`database-view.ts:3445-3456`). The only guard is `db.views.length <= 1`.

A confirm primitive already exists and is owned by `051` — `buildConfirmSheetBody`
(`src/views/confirm-sheet.ts:46`). `D8` assigns it there and `ADR-003`'s sort-conflict confirm
already consumes it, so T-A consumes the same one rather than creating a second.

### Data flow — where a Notion pattern can land

```
digest pattern → is it in the bounded source set?
   ├── no  → recorded as Notion-only, no our-side surface (AI view box, multi-source,
   │          dashboard/map layouts, conditional colour)
   └── yes → does a landed ruling govern it?
        ├── yes, and it agrees   → census row, guard recorded (P2, P3, P4, P5, P12)
        ├── yes, and it disagrees → conflict named; additive proposal only (P1 / AC-012)
        └── no                    → ranked by consequence, then cost (P9, P4-entry, P7)
```

---

## 5. TECHNICAL SPECIFICATIONS

### 5.1 The census — what both references and our tree agree on

| Digest pattern | Our producer | Finding |
|---|---|---|
| P1 row grammar, split New | `toolbar-renderer.ts:239-421`, `:2351-2412` | F-101 |
| P10 inline search | `:1613-1680`; phone at `:401`, desktop at `:418` | F-102 |
| P11 New-menu defaults (partial) | `:2417-2568`, presets `:2517-2540` | F-107 |
| P12 column menu Filter/Sort/Group/Calculate | `design-trueup.md` T13 | F-103 |
| P13 view-type-specific additions | `:35`, `:219-221`, `:268-269` | F-104 |
| P2/P5 per-rule chips, direction glyph plus word | `active-view-controls-renderer.ts:103-121`, `:230-232` | F-205 |
| P4 one-row advanced builder | `toolbar-primitives.ts:135-165`, role 440-560px | F-206 |
| P3 value summaries plus docked shape | `view-config-panel-renderer.ts:510-534`, `:540-565` | F-301 |
| P8 all-views hub | `toolbar-renderer.ts:1105-1273` — plus rename-in-place, which neither reference has | F-305 |

### 5.2 The CSS value inventory the plan reuses (F-406)

No task mints a new number. Every value below is already measured and already tied to a landed
threshold: chip **28px** (`styles.css:1822`); chip accent tint **11% / 17% hover** (`:1826`,
`:1837`); group divider **1px × 16px** at 12px/8px margins (`:1845-1852`); toolbar min-height
**36px** (`:1733`); tab height **28px**, add/more **24px** (`:2026`, `:2076-2079`); badge **16px**
at −5px/−3px offsets (`:2405-2417`, `:19920-19924`); **≤760px** column stack and 12px popover
insets (`:19810-19868`); phone search **42vw / 168px** (`:19906-19916`).

### 5.3 The count badge, and why it is not a gap

Notion's icon clusters carry no numeric badges in any capture (`71f9dba2`, `98dde396`, `3b3c3c26`).
Ours carries a 16px accent pill with `--text-on-accent` text at weight 700 — a **text** second
signal over the icon state, which is exactly what `ADR-001`'s amendment requires over colour-only
signalling. Recorded as a guard against later drift to colour-only, not as a divergence (F-403).

### 5.4 Dark theme — the corpus ceiling

Exactly one confirmed dark-theme Notion capture of this surface exists (`9aed23d0`), and the digest
rules a dark-theme cross-check impossible from this harvest. Our toolbar CSS consumes theme tokens
rather than literals (`styles.css:2023-2049`, `:1817-1834`), so theme-agnosticism is structural.
The follow-up is a targeted external harvest, not repository work (F-405).

---

## 6. CONSTRAINTS & LIMITATIONS

**The Notion evidence is structural, never dimensional.** iOS captures are 299×678/680px and web
768×521/523px — Mobbin's scaled thumbnails. The digest says so in its §1 and forbids adopting a px
value on that basis; no proposal here does.

**Notion is one reference and, on the top-ranked task, the only one.** P9's delete-view confirm is
uncorroborated: Anytype's captures never reached one. T-A rests on a consequence argument rather
than on two references agreeing, and that is stated in its row.

**Five checks are not closable in this repository** (F-504):

| Check | Why not here | Finding |
|---|---|---|
| Icon-only rail discoverability on a phone | Tooltips do not exist on touch; first-use identification is a human read | F-108 |
| The zero-rule entry tier inside the phone filter sheet | Whether the list should fill the first screen is a thumb judgment | F-208 |
| Group eye toggles in sheet form, and the delete confirm as a stacked sheet | Geometry is assertable; feel is not | F-307 |
| Phone tabs against the view switcher both references use | Thumb reach unmeasured either way | F-402 |
| Dark-theme Notion toolbar chrome | One capture in the whole harvest; needs a new harvest | F-405 |

The first four ride `AC-111`, the operator's own device read. The fifth is external work.

**The bounded scope was honoured and its edges are named.** `column-manager-renderer.ts` and
`column-menu.ts` are cited through the packet record only; the board and table renderers, which
T-F's hidden-group set would have to reach, were deliberately not read — the boundary is named in
F-302 and made T-F's first job rather than assumed away.

---

## 7. INTEGRATION PATTERNS — the conflict ledger, closed (F-503)

| Notion position | Landed ruling | Resolution |
|---|---|---|
| The split New button never drops (P1, ~30 screens incl. `21d71e5f`, `795eb9b5`) | `AC-012` / `T008`: drop order is New, then the icon cluster, then the add-view `+`, all before the tab row | **Conflict named, order not reopened.** T-D inserts a text→icon rung *before* the ladder; the ladder is untouched |
| Text-label cluster density (P1, `9693630d`, `213f8a7c`, `a8a5865d`) | `ADR-001`'s single vocabulary; Anytype's 120-capture single-state icons | **Ruled out** — a second control vocabulary for no measured user loss (F-106) |
| Chip-per-rule (P2, P5) | Our shipped rail | **Agreement.** Two products against Anytype's aggregate pill; recorded so no later pass "fixes" toward it (F-207) |
| A group panel richer than Anytype's (P7, `e9698e1b`) | Anytype `T8`: our control set is "ours, justified" against a thinner Anytype | **No conflict.** `T8` protects what exists; T-F adds and removes nothing (F-302) |
| Shown/Hidden property-visibility split (P6, `35c32af9`) | None — the digest's §6 Q6 left it open | **Declined**, with a reason: one list carries reorder *and* visibility, which the split does not. Optional sectioning of the existing list recorded (F-303) |
| Two-scope delete radio (P9, `348fd2b7`) | None | **Half adopted.** Our views own no data sources, so the scope half is inapplicable; the confirm is the adoptable part (F-304) |
| One-row advanced builder (P4, `41665ca0`) vs Anytype's three stacked popovers | §6A's condition-panel role, 440-560px, floors 140/140/120 | **The two references disagree with each other**, and ours is already the one-row shape (F-206) |
| Web settings as a right-docked panel (P3, `9e80b489`, `420dd630`) | `051`'s desktop side sheet, landed | **Dissolved** — we now match. The digest's §4 P3 row is stale on this point (F-301) |

No landed Anytype ruling is contradicted by anything this research proposes.

---

## 8. IMPLEMENTATION GUIDE

Each task below names the file, the function, the value and the threshold, and each threshold names
a probe that fails on the tree **today**. The red-first obligation is `goal.md` D2's, carried
forward.

**T-A · delete-view confirm.** Route `toolbar-renderer.ts:1180` and `:1330` through `051`'s confirm
primitive (`confirm-sheet.ts:46`) before `actions.deleteView(index)`. One-scope copy. Decline is a
no-op; accept deletes exactly once. On a phone it presents per `048` D1 as a stacked bottom sheet.
*Red-first:* the hub row deletes on first click — click, view gone, no dialog.

**T-B · zero-rule filter entry tier.** Extend the branch at `filter-panel-renderer.ts:184-191` with
a searchable flat property list built from the existing `toPropertyDropdownOption` vocabulary
(`:509-516`); picking a property creates the first leaf through `appendLeaf` /
`createDefaultFilterRule` (`:100-104`); a `+ Add advanced filter` footer switches to the tree. The
builder is untouched. *Threshold:* the first rule lands in **1 click** against **3** today, and a
seeded one-rule panel renders byte-identical before and after — that comparison is the negative
control. *Red-first:* today's zero-rule panel is a text hint with no list.

**T-C · searchable condition dropdowns.** Pass `searchable: true` at
`filter-panel-renderer.ts:517-527` and `:672-690` and `sort-panel-renderer.ts:158-168` when the
option count exceeds 8, the gate owned inside the primitive. Precedent:
`view-config-panel-renderer.ts:2076-2090`. *Red-first:* neither renders a search input today.

**T-D · New-label collapse rung.** Give `applyToolbarChromeCollapse` (`:2561-2598`) a first rung
that collapses the `:2365` label span before the `:2571` cluster loop. *Threshold:* in the
250-900px sweep the label is measured absent **before** the first width at which any cluster is
hidden, and zero-overflow holds at every width. It belongs on the existing lane —
`tools/live/toolbar-collapse-sweep.ts` already sweeps that range, so the threshold rides a probe
that runs. *Red-first:* today the sweep hides the whole creation cluster while the label is drawn.

**T-E · chip-rail add control.** Append one `db-active-control-add` chip-button per group in
`active-view-controls-renderer.ts` `render()` (`:72-180`), wired to the existing
`toggleFilterPanel` / `toggleSortPanel`; reuse the 28px chip pitch (`styles.css:1822`).
*Threshold:* present iff at least one chip is visible. *Red-first:* `db-active-control-add`
resolves nothing today.

**T-F · per-group visibility.** Give `renderGroupPopoverRow` (`toolbar-renderer.ts:1878-1896`) a
trailing eye toggle for select/status group fields, persisted as a per-view hidden-group set that
the board and table renderers consume. *Threshold:* a hidden group renders no cards or rows and its
count is excluded. *Red-first:* no toggle exists today. **The renderer read is this task's first
job** — those files sit outside the bounded scope and their impact is inferred, not measured.

---

## 9. CODE EXAMPLES & EVIDENCE ANCHORS

**The unconfirmed delete (T-A's red).**

```ts
// src/views/toolbar-renderer.ts:1180 — the all-views hub row
rowActions.push({ label: t("toolbar.deleteView"), icon: "trash",
                  run: () => actions.deleteView(index), danger: true });

// src/views/toolbar-renderer.ts:1330 — the tab context menu row
menu.addRow({ icon: "trash", label: t("toolbar.deleteView"), warning: true,
              onClick: () => actions.deleteView(viewIndex) });

// src/views/database-view.ts:3445 — the host, with only a last-view guard
private deleteView(viewIndex: number): void {
  const db = this.getActiveDb();
  if (!db || db.views.length <= 1) return;
  db.views.splice(viewIndex, 1);
  ...
}
```

**The icon-only cluster (why the density comparison is moot — F-106, digest §6 Q4).**

```ts
// src/views/toolbar-primitives.ts:186-197
const button = parent.createEl("button", {
  cls: ["db-toolbar-icon-button", options.className].filter(Boolean).join(" "),
  attr: { type: "button", "aria-label": options.label,
          "data-control-state": options.state, ... },
});
setIcon(button, options.icon);
setTooltip(button, options.label, { delay: 100 });
```

No text node exists in the cluster button. The label lives in `aria-label` and the tooltip, and a
tooltip does not exist on touch — which is what makes F-108 a device check rather than a code read.

**Anchors for every proposal**

| Task | Anchor |
|---|---|
| T-A | `toolbar-renderer.ts:1180`, `:1330`; `database-view.ts:3445`; `confirm-sheet.ts:46` |
| T-B | `filter-panel-renderer.ts:184-191`, `:100-104`, `:509-516` |
| T-C | `filter-panel-renderer.ts:517-527`, `:672-690`; `sort-panel-renderer.ts:158-168`; `view-config-panel-renderer.ts:2076-2090` |
| T-D | `toolbar-renderer.ts:2365`, `:2561-2598`, `:2571`; `tools/live/toolbar-collapse-sweep.ts` |
| T-E | `active-view-controls-renderer.ts:72-180`, `:166-172`; `styles.css:1822` |
| T-F | `toolbar-renderer.ts:1878-1896`, group popover `:1701-1870` |

---

## 10. TESTING & DEBUGGING

Every task's threshold is written to be observed failing first, and four of the six can ride
instruments that already exist.

| Task | Where the check lives | Negative control |
|---|---|---|
| T-A | A test asserting a confirm on both paths | Remove the confirm from one path and watch the row go red |
| T-B | Click-count probe plus a seeded one-rule panel diff | The one-rule panel must be byte-identical; change it and the control fires |
| T-C | Assert the search input's presence at 9 options and its absence at 8 | The 8-option case is the control |
| T-D | `tools/live/toolbar-collapse-sweep.ts`, 250-900px | Restore the label at a hidden-cluster width and the sweep goes red |
| T-E | Assert presence with one chip, absence with none | The zero-chip case is the control |
| T-F | Assert the toggle on a select group field and its exclusion effect | A non-select group field must carry no toggle |

**The trap this surface has already paid for once.** `053`'s own history shows a threshold written
around the state it was landed on. Each row above states its failing figure *before* the fix — a
probe that only passes after the change is not evidence that the change did anything.

---

## 11. RECOMMENDATIONS — the ranked remediation plan (F-501)

Ranking rule: severity of user consequence first — data loss beats repeated friction beats saved
clicks beats capability depth — then cost of the change.

| Rank | Task | Finding | Notion evidence | Change | Threshold, red-first |
|---|---|---|---|---|---|
| 1 | **T-A Delete-view confirm** | F-304 | P9 `55602f6a`, `348fd2b7` (scope half inapplicable) | `toolbar-renderer.ts:1180`, `:1330` route through `051`'s confirm primitive | Confirm on every `deleteView` path; decline is a no-op; accept deletes once. Today: hub row deletes on first click |
| 2 | **T-B Zero-rule filter entry tier** | F-202 | P4 `86a8e66c`, `8ff7ae4b`, `1f10ae24` | `filter-panel-renderer.ts` `render()` extends the `:184-191` branch | First rule in 1 click against 3; the ≥1-rule panel byte-identical. Today: a text hint, no list |
| 3 | **T-C Searchable condition dropdowns** | F-203 | P4/P5 `1067756c`, `82d66d47`, `86a8e66c` | `searchable: true` at three sites when options > 8 | A search input iff options > 8. Today: neither renders one |
| 4 | **T-D New-label collapse rung** | F-105 | P1, ~30 screens incl. `21d71e5f` | First rung in `applyToolbarChromeCollapse` collapses the `:2365` label | Label absent before the first cluster-hidden width; zero-overflow holds. Today: the cluster hides while the label is drawn |
| 5 | **T-E Chip-rail add control** | F-201 | P2 `d8abbe0b`, and Anytype's own T001 read | `active-view-controls-renderer.ts` `render()`, 28px pitch | Present iff ≥1 chip. Today: absent |
| 6 | **T-F Per-group visibility** | F-302 | P7 `e9698e1b` | `renderGroupPopoverRow` trailing toggle plus a per-view hidden-group set | Toggle per select/status group row; a hidden group renders nothing. Today: no toggle |

**Sequencing.** T-A and T-B are independent and can run in parallel. T-D belongs with the existing
collapse-sweep lane. T-F is last and opens with a renderer read this loop deliberately did not do.

**T-A and T-E each carry a caveat that survives into the phase.** T-A is Notion-only evidence, and
its severity rests on an inference — irrecoverability is asserted from the absence of an undo path
in our delete flow, not measured. T-F's renderer-side impact is likewise inferred.

---

## Eliminated Alternatives

| Approach | Reason eliminated | Evidence | Iteration |
|---|---|---|---|
| Text-label toolbar density | A second control vocabulary against `ADR-001`; Anytype's 120-capture single-state evidence | `toolbar-primitives.ts:186-220`; `design-trueup.md` REQ-001 | 1 |
| Reordering the landed collapse ladder | `AC-012` is a landed Anytype-derived threshold; thumbnail captures do not outweigh it | `tasks.md` T008; `toolbar-renderer.ts:2571` | 1 |
| A chip rail with one trailing add control | The per-group structure is `ADR-001`'s accepted anatomy | `active-view-controls-renderer.ts:72-180` | 2 |
| Multi-value checkbox filter pickers | Needs a `FilterRule` value-shape ruling first — a data-model change, not a surface one | `filter-panel-renderer.ts:663-712`; `13bbee6c` | 2 |
| The two-scope delete radio | Our views own no data sources; one-scope is the adoptable half | `55602f6a`; `toolbar-renderer.ts:1180` | 3 |
| Splitting properties from property visibility | One list carries reorder and visibility together; a split risks the drag grammar for no measured gain | digest §6 Q6; `35c32af9` | 3 |
| A phone view switcher replacing the tab strip | Both references use a switcher, but thumb reach is unmeasured here; device-gated | `71f9dba2`; `toolbar-renderer.ts:1040-1103` | 4 |
| Per-group "Text by" | No equivalent concept in our grouping model | `e9698e1b` vs `:1701-1870` | 3 |
| Notion-only features — AI view box, multi-source, dashboard and map layouts, conditional colour | No our-side surface; out of scope by operator context | digest §5 (`2f7bbc1f`, `794591f5`, `142cef4e`) | 1-5 |

---

## Divergence Map

No divergent pivots were recorded. `antiConvergence.convergenceMode` was `default` and
`--stop-policy=max-iterations` made convergence telemetry only, so the loop ran its full five
iterations without a Council pivot, an override or a saturation stop. The merged registry carries
no `divergence` block (`findings-registry.json`).

**Frontier that remains** — breadth this loop deliberately did not open: the board and table
renderers behind T-F; `column-manager-renderer.ts` and `column-menu.ts`, cited through the packet
record only; and the `FilterRule` value shape behind the multi-value picker.

---

## 12. OPEN QUESTIONS

1. **Does T-F expand this packet's bounded scope, or open a sibling?** The hidden-group set has to
   reach the board and table renderers, which this loop did not read. Named boundary, F-302.
2. **Will a view-scoped template system ever exist?** It is the only trigger for Notion's two-scope
   default offer; today our default template is database-scoped and our per-view default is field
   presets (F-107).
3. **What is the narrowest supported toolbar width?** The wrap rule deliberately hedges it and the
   comment says so; no Notion evidence bears on it at thumbnail scale (F-401,
   `styles.css:1745-1763`).
4. **Dark-theme Notion toolbar chrome.** One capture exists in the whole harvest; a targeted
   external harvest is the only way to answer it (F-405, digest §1).
5. **The five device and external checks in §6.** Four ride `AC-111`; none is closable here.

---

## 13. FUTURE-PROOFING & MAINTENANCE

- **Guard the chip anatomy.** Two products chose per-rule chips over Anytype's aggregate pill. A
  later parity pass that reads only Anytype could "fix" the rail toward the pill; F-207 exists so
  that regression is visible as one.
- **Guard the badge's text signal.** `ADR-001`'s amendment requires a second signal that is not
  colour. The badge is it; a drift to colour-only would satisfy neither reference nor WCAG 1.4.11.
- **The digest ages against the tree, not against Notion.** Its §4 P3 row is already stale because
  the side sheet landed after it was written. Any future read of it should re-verify the divergence
  table against `git log` before treating a row as current.
- **Keep the one-owner map.** T-A consumes `051`'s confirm primitive. A second confirm surface on
  this path would break `D8` and would be the exact failure the five family phases were split to
  avoid.

---

## 14. REFERENCE — findings index

| ID | One line | Iteration |
|---|---|---|
| F-101 | P1 toolbar row grammar and split New: already ours | 1 |
| F-102 | P10 inline search: already ours, both platforms | 1 |
| F-103 | P12 column menu: converged | 1 |
| F-104 | P13 view-type-specific additions: already ours | 1 |
| F-105 | P1 New-survives vs `AC-012`: conflict named; additive text→icon rung proposed (**T-D**) | 1 |
| F-106 | P1 text-label density: ruled out; our cluster carries no labels | 1 |
| F-107 | P11 New-menu defaults: partial convergence, record-only | 1 |
| F-108 | Device check: icon-only rail discoverability on a phone | 1 |
| F-201 | P2 in-row add control: both references have it, we do not (**T-E**) | 2 |
| F-202 | P4 zero-rule entry tier, builder untouched (**T-B**) | 2 |
| F-203 | Searchable condition dropdowns, one flag (**T-C**) | 2 |
| F-204 | Multi-value pickers blocked on a `FilterRule` ruling: record-only | 2 |
| F-205 | P5 sort panel: census | 2 |
| F-206 | P4 one-row builder: agreement, corroborates the landed role widths | 2 |
| F-207 | Chip aggregation: Notion corroborates the shipped choice | 2 |
| F-208 | Device check: the entry tier inside the phone sheet | 2 |
| F-301 | P3 value summaries and the docked shape: census plus a digest-staleness correction | 3 |
| F-302 | P7 per-group visibility: the one adoptable group control (**T-F**) | 3 |
| F-303 | P6 split declined on capability grounds; optional sectioning recorded | 3 |
| F-304 | P9 delete-view confirm: the top gap (**T-A**) | 3 |
| F-305 | P8 hub: we exceed both references | 3 |
| F-306 | Conflict check for iteration 3: none open | 3 |
| F-307 | Device checks: group toggles and the confirm in sheet form | 3 |
| F-401 | The wrap rule is measured, hedged, and beyond Notion's evidence ceiling | 4 |
| F-402 | Phone tabs vs the switcher both references use: device-gated observation | 4 |
| F-403 | Count badges carry a text signal neither reference shows: guard recorded | 4 |
| F-404 | Chip-rail overflow scroller: census | 4 |
| F-405 | Dark theme: corpus ceiling stands; our CSS is token-based | 4 |
| F-406 | The CSS value inventory the plan reuses | 4 |
| F-501 | Q1/Q6: the ranked remediation plan, six tasks | 5 |
| F-502 | Q3: the census ledger, twelve of thirteen patterns | 5 |
| F-503 | Q4: the conflict ledger, closed | 5 |
| F-504 | Q5: the device-check ledger, five rows | 5 |
| F-505 | Convergence evaluation: telemetry only under `max-iterations` | 5 |

---

## 15. TROUBLESHOOTING — runtime notes for the next run

Three behaviours cost time in this run and are recorded so the next one does not rediscover them.

1. **The fan-out executor schema reads `kind`, not `type`.** `lineageExecutorSchema` and
   `LINEAGE_COMMAND_ADAPTERS` both key on `kind` (`fanout-run.cjs:2386-2391`). An `--executors`
   value written with `"type"` falls back to the native executor silently. The config written for
   this run uses `"kind": "cli-pi"`.
2. **The cli-pi model literal is `z-ai/glm-5.3-flash`, not `openrouter/z-ai/glm-5.3-flash`.**
   `PI_SUPPORTED_MODELS` carries the vendor-prefixed literal and `PI_MODEL_PROVIDERS` supplies the
   `openrouter` provider, composing the three-segment selector. Passing the composed form fails the
   allowlist closed.
3. **`reduce-state.cjs` refuses a worktree root.** `resolveArtifactRoot` computes its approved roots
   from the shared module's own location, so a spec folder inside `.worktrees/` resolves outside
   them and the reducer exits with *"specFolder resolves outside the approved specs roots"*. The
   lineage's own `resource-map.md` was written by the in-lineage reducer and is intact; the
   top-level `resource-map.md` beside this file was composed from it by hand, and says so. This is
   the same limitation `067` recorded for the sheet-family run.

4. **Two pipelines can be briefed onto one packet, and the second one finds the filenames taken.**
   Both the table Notion run and this toolbar run were bound to
   `053-toolbar-and-view-controls`, and both write `notion-screens-digest.md` and `research/`. The
   table run landed first; this one moved to `notion-screens-digest-toolbar.md` and
   `research/notion-toolbar/`. Nothing was overwritten and no landed citation broke, but the
   collision was invisible until the rebase refused the checkout. A run bound to a packet another
   run already used should check `git ls-tree origin/main <packet>` before it writes, not after.

A fifth, benign: `fanout-attribution.md` reports the lineage's `Kind` and `Model` as `unknown`
because the attribution reader looks for fields the inline lineage does not write. The authoritative
record is `lineages/glm-openrouter-toolbar/invocation-metadata.json`, which carries both.

---

## 16. ACKNOWLEDGEMENTS & SOURCES

- **Notion facts**: `specs/005-component-surface-system/053-toolbar-and-view-controls/notion-screens-digest-toolbar.md`
  — the sole source, cited by screen id throughout. Written by an image-capable analyst from the
  Mobbin captures; this loop opened no image and could not have.
- **Our implementation**: `src/views/toolbar-renderer.ts`, `toolbar-primitives.ts`,
  `active-view-controls-renderer.ts`, `filter-panel-renderer.ts`, `sort-panel-renderer.ts`,
  `view-config-panel-renderer.ts`, `surface-shell.ts:185`, `database-view.ts:3445`,
  `confirm-sheet.ts:46`.
- **Stylesheet**: `styles.css` toolbar blocks `:1728-2100`, `:2405-2417`, `:19810-19928`.
- **Packet record**: `goal.md` (D1-D9, completion criteria, AC-111), `design-trueup.md` (REQ-001,
  T13), `decision-record.md` (ADR-001 through ADR-006), `tasks.md` (T004, T005, T008).
- **Program record**: `specs/005-component-surface-system/design-system.md`,
  `specs/005-component-surface-system/roadmap.md` §6A.
- **Coverage map**: `resource-map.md` beside this file.
- **Lineage artefacts**: `lineages/glm-openrouter-toolbar/` — `iterations/iteration-001..005.md`,
  `deltas/iter-001..005.jsonl`, `deep-research-state.jsonl`, `deep-research-strategy.md`,
  `deep-research-dashboard.md`, `findings-registry.json`, `research.md`, `resource-map.md`,
  `invocation-metadata.json`. The lineage directory is gitignored; this synthesis and the merged
  registry beside it are the committed record.

---

## 17. APPENDIX

### A. Iteration ledger

| Run | Focus | newInfoRatio | Findings |
|---|---|---|---|
| 1 | The toolbar row: density, collapse order, search, column menu, split New (P1, P10-P13) | 0.66 | 8 |
| 2 | Rule surfaces: chip add control (P2), the two-tier entry (P4), pickers, sort (P5) | 0.60 | 8 |
| 3 | Settings, group, properties and visibility, the hub, the delete confirm (P3, P6-P9) | 0.62 | 7 |
| 4 | Narrow widths and the CSS layer: collapse, wrap, geometry, the dark-theme ceiling | 0.45 | 6 |
| 5 | Consolidation: impact ranking, conflict ledger, device ledger, remediation plan | 0.50 | 5 |

### B. Question status

6 of 6 answered. Q1 ranking and Q6 plan in F-501; Q2 thresholds per task in F-501's threshold
column plus F-406's value inventory; Q3 census in F-502; Q4 conflict ledger in F-503; Q5 device
ledger in F-504.

### C. Provenance of the executor claim

`lineages/glm-openrouter-toolbar/invocation-metadata.json`:

```json
{"effectiveConfig":{"kind":"cli-pi","executable":"pi","model":"z-ai/glm-5.3-flash",
"reasoningEffort":"max","serviceTier":null,"sandboxMode":"workspace-write",
"permissionMode":"acceptEdits","webSearch":"inherit"}}
```

---

## Convergence Report

- **Stop reason**: `maxIterationsReached`
- **Total iterations**: 5 of 5
- **Questions answered**: 6 / 6
- **Remaining questions**: 0 at the registry level; 5 carried into §12 as operator or external work
- **newInfoRatio series**: 0.66 → 0.60 → 0.62 → 0.45 → 0.50, rolling average 0.566
- **Threshold**: 0.05, never breached. Under `--stop-policy=max-iterations` convergence is
  telemetry only, so the series did not and could not stop the loop
- **Lineages**: 1 of 1 fulfilled, 0 failed, 0 salvaged, 0 orphaned
- **Timestamp anomalies**: 8 of 16 state-log records fall outside the pool's ±120s window
  (`orchestration-summary.json`). The lineage stamps its own records with a coarse wall clock; the
  pool's own start and end timestamps are authoritative for the run window

---

## CHANGELOG & UPDATES

| Date | Change |
|---|---|
| 2026-09-06 | Created. Five iterations, 34 findings merged, synthesised from the single `glm-openrouter-toolbar` lineage after `fanout-merge.cjs` consolidated its registry |
