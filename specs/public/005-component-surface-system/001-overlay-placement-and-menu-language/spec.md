---
title: "Feature Specification: Overlay Placement and Menu Language"
description: "One placement authority for every floating surface, and one row grammar behind every menu — so that where a surface lands and what it looks like stop being decided by whichever call site typed the numbers."
trigger_phrases:
  - "overlay placement contract"
  - "menu language"
  - "row grammar"
  - "positionToolbarPopover"
  - "panel parity"
  - "001 overlay placement"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/001-overlay-placement-and-menu-language"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "surface-factory-decision"
    recent_action: "Deleted the unwired surface factory; kept the contract. See section 13"
    next_safe_action: "Run the overlay census by user-reachable trigger; no code edits until the census is complete"
    blockers:
      - "styles.css and the capture manifest are held by another lane; this phase must not edit either, and a comment in popover-position.ts naming the deleted factory is left for that lane to correct alongside a recapture"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-001"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Wire openSurface or delete it? Deleted, on nine measurements recorded in section 13. It had zero importers, zero tests, was absent from the shipped bundle, and could not express the cursor placement 12 of 14 menu openings use nor the non-width axes 10 of 34 placement call sites pass. The contract it sat on is live and was kept."
---
# Feature Specification: Overlay Placement and Menu Language

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `000-surface-contract-and-truthful-harness`,
> successor `002-properties-panel`. Root causes, the corrected inventory and the criteria doctrine
> live in [`../architecture-findings.md`](../architecture-findings.md) and are cited here, never
> restated.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

`popover-position.ts` decides where every floating surface lands, and 33 call sites each hold their
own opinion about it — 15 pass a shared preset, 15 pass bespoke numbers, and 3 pass nothing and fall
through to a 520px default. Menus have the same problem in a second register: one canonical row
builder has one caller, while `toolbar-renderer.ts` alone emits 14 row-class grammars by hand.

**Key Decisions**: placement and sizing are resolved from the `data-db-surface` role that `000`'s
factory stamps, never from numbers typed at a call site; every menu row is produced by
`createMenuRow`; `submenu: true` opens a real submenu instead of drawing a chevron.

**Critical Dependencies**: `000-surface-contract-and-truthful-harness` must land first — this phase
places surfaces the factory creates. It then holds the serialized `styles.css` lane for its whole
duration, and blocks `002-properties-panel` and through it `003` and `006`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 001-overlay-placement-and-menu-language |
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Planned |
| **Created** | 2026-08-29 |
| **Blocked by** | `000-surface-contract-and-truthful-harness` |
| **Blocks** | `002-properties-panel`, and through it `003` and `006` |
| **CSS lane** | holds `styles.css` for the whole phase |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Placement has no authority and menus have no shared grammar. Where a surface lands is decided by
whichever call site typed the numbers, and what a menu row looks like is decided by whichever
container it happens to sit inside. The five subsections below record the measured evidence.

### Why placement and menu language are one spec

They have one owner. `popover-position.ts` decides where a surface lands; the same file's width
preset decides how wide it reads, and the panel blocks in `styles.css` decide the rest. Splitting
placement from visual grammar would put two specs in the serialized CSS lane at once, which the
program forbids for a reason the stylesheet has already demonstrated: 87 selectors are declared
twice and 124 values are reversed by a later block, so two concurrent editors cannot know whose
rule wins.

### Placement has no authority, only thirty-three opinions

`positionToolbarPopover` has **33 call sites**. Fifteen pass `COMPACT_MENU_POPOVER`. Fifteen pass
bespoke numbers. **Three pass nothing at all** — `filter-panel-renderer.ts:213`,
`sort-panel-renderer.ts:90` and `column-manager-renderer.ts:134` — and fall through to the raw
`preferredWidth ?? 520` at `popover-position.ts:74`. Filter, Sort and Column Manager are three of
the most-used surfaces in the plugin and they are the three that ask for nothing.

The stylesheet cannot rescue them. The panel block at `styles.css:9829-9852` declares `position`,
`top`, `right`, `width` and `max-height` for exactly these panels, and the positioner overwrites
every one of them inline — `position: fixed` and `right: auto` at `popover-position.ts:88-98`, and
`maxHeight` at `126`, `160` and `177`. The block is dead code that still reads as authoritative to
anyone who opens the file looking for panel layout.

`db-anchored-popover` is added to every panel the positioner touches (`popover-position.ts:83`) and
**has no rule anywhere in `styles.css`.** A marker nobody reads.

### There is one canonical menu row and nobody uses it

`createMenuRow` has **exactly one production caller**, `owned-menu.ts:109`. Against that,
`toolbar-renderer.ts` alone declares **8 private `render*Row` methods** and emits **14 distinct
row-class grammars** — `db-toolbar-menu-row`, `db-database-popover-row`, `db-view-tab-popover-row`,
`db-add-view-duplicate-action`, `db-group-popover-row` in four variants, `db-export-popover-row`,
`db-new-template-row`, and more. Every one of them re-declares the same three spans by hand.

Two of them are the same function. `renderTitleActionsPopoverRow` (`toolbar-renderer.ts:756-773`)
and `renderViewTabPopoverRow` (`1221-1238`) are line-for-line identical apart from which close
method they call and whether the callback takes the event. Both emit `db-view-tab-popover-row`, so
the Title Actions menu is already wearing the View Tab menu's class names.

A row does not lay itself out. `.db-menu-item` at `styles.css:205` sets colour, padding and
font — but `display: flex` is declared only at `styles.css:258`, on `.db-owned-menu .db-menu-item`.
Move a canonical row into any other container and the label and value collapse inline. The trap is
documented in the module's own header (`menu-row.ts:23-31`) and is exactly the ancestry-keyed
grammar `000` retires.

### The submenu affordance is a drawing of a submenu

`submenu: true` draws a chevron (`menu-row.ts:102`) and stops the parent menu closing on click
(`owned-menu.ts:113`). `OwnedMenuHandle` exposes no way to open a nested menu. Its only production
caller, `column-menu.ts`, opens real submenus through an entirely separate hand-built popover
mounted on `doc.body` (`column-menu.ts:577`). One affordance, two mechanisms, and the honest one is
not the one the API advertises.

### Two adjacent buttons, two different contracts

Filter is `role="dialog"` with an `aria-label`, `tabIndex = -1` and a real focus trap
(`filter-panel-renderer.ts:161-171`). Sort, opened by the button beside it, declares no role, no
label, no tab index and no trap (`sort-panel-renderer.ts:61`). Nothing in either file explains the
difference; it is drift.

Sort is also the program's cautionary tale about undeclared dependencies. `db-sort-panel` carries
**no layout CSS of its own** — its four appearances in `styles.css` (`396`, `18436`, `18455`,
`18594`) supply z-index, background and elevation only. Every dimension it has comes from being
dual-classed with `db-filter-panel` at `sort-panel-renderer.ts:61`. The phone height clamp at
`styles.css:17206-17215` lists eight panels and omits Sort, so Sort's mobile height also arrives
through the piggyback. Deleting the apparently redundant class would silently break it, with no
compiler warning and no failing test.

### Purpose

One placement authority and one row grammar, both keyed to the surface's role, so that where a
surface lands and what it looks like stop being decided by whichever call site typed the numbers.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- The placement contract for every floating surface reachable from the census: bounds, flip, clamp,
  sidebar avoidance, popped-out window
- Per-role sizing, replacing the 15 bespoke width arguments and the 3 widthless calls
- One row grammar: the 8 `render*Row` methods and 14 row-class grammars in `toolbar-renderer.ts`
- Making `submenu: true` open a real submenu, and retiring the hand-built subpopover onto it
- Panel parity for Filter, Sort, Column Manager and view-config, including Sort's dual-class
  dependency
- The dead panel layout block and the `db-anchored-popover` marker

### Out of Scope

- The properties panel's row grid — that is `002`, and it is deliberately separate
- The mobile sheet portal and the phone predicates — `003`
- Checkbox appearance — `004`
- What a menu row *does*. This phase changes how rows are built and placed, not which actions exist
  or what they invoke

### Files to Change

The complete list is a deliverable of the Phase-1 trigger census; a module census counts code, not
reachable surfaces. The files known before the census are:

| File Path | Change Type | Description |
|---|---|---|
| `popover-position.ts` | Modify | Placement and sizing resolved per role; the `preferredWidth ?? 520` fallback at `popover-position.ts:74` made unreachable; bounds confirmed against `getVisiblePopoverBounds` (`popover-position.ts:271`) including the popped-out-window branch |
| `toolbar-renderer.ts` | Modify | Retire the 8 private `render*Row` methods and the 14 row-class grammars; collapse the duplicate `renderTitleActionsPopoverRow` (`toolbar-renderer.ts:756-773`) and `renderViewTabPopoverRow` onto `createMenuRow` |
| `menu-row.ts` | Modify | A row carries its own layout; the container-keyed grammar documented at `menu-row.ts:23-31` is retired; `submenu: true` stops being a drawing (`menu-row.ts:102`) |
| `owned-menu.ts` | Modify | `OwnedMenuHandle` gains real nested-menu opening (`owned-menu.ts:109`, `owned-menu.ts:113`) |
| `column-menu.ts` | Modify | Retire the hand-built body-mounted subpopover at `column-menu.ts:577` onto the factory-backed submenu |
| `filter-panel-renderer.ts` | Modify | Declared sizing instead of the widthless call at `filter-panel-renderer.ts:213`; role contract shared with Sort (`filter-panel-renderer.ts:161-171`) |
| `sort-panel-renderer.ts` | Modify | Declared sizing and role at `sort-panel-renderer.ts:61` and `sort-panel-renderer.ts:90`; the dual-class piggyback on `db-filter-panel` resolved |
| `column-manager-renderer.ts` | Modify | Declared sizing instead of the widthless call at `column-manager-renderer.ts:134` |
| `styles.css` | Modify | Delete the dead panel layout block at `styles.css:9829-9852` and the unread `db-anchored-popover` marker; the phone height clamp at `styles.css:17206-17215` gains Sort |
| `tools/storybook/verify-placement.mjs` | Modify | 1024 and 768 widths, sidebar-closed state, popped-out-window layout, the container-relative pair for A3 and the class-deletion sweep for A6 |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001 — One placement contract, expressed as roles.** Placement is resolved from the surface's
  `data-db-surface` role stamped by `000`'s factory, not from numbers a call site typed. Bounds,
  flip, clamp, sidebar avoidance and popped-out-window behaviour are decided once, for the role.

- **REQ-002 — Sizing is a property of the role.** `292px` is the one menu width in the plugin that reads
  correctly today — it is the column menu's explicit request (`styles.css:5071-5073`) and the
  `preferredWidth` of the compact preset (`popover-position.ts:47-51`). Menu-role surfaces size from
  it. **The 520px default stops being reachable**: no code path may produce a four-item menu 520px
  wide. Editors that genuinely need room — relation pickers, chart toolbars, the record detail
  panel — declare a wider role, not a bespoke number.

- **REQ-003 — Every surface stays inside the visible editing bounds.** Bounds are the intersection the
  shipped `getVisiblePopoverBounds` already computes (`popover-position.ts:271`): visual viewport,
  the root split, and the container. The root-split preference exists so a popover cannot slide under
  an open right sidebar; the `.app-container` / `.workspace` fallbacks exist for the popped-out
  window, and that branch is currently exercised by nothing.

- **REQ-004 — One row grammar.** Every menu row in the plugin is produced by `createMenuRow`. The 8
  `render*Row` methods in `toolbar-renderer.ts` and the 14 class grammars they emit are retired; the
  two duplicate builders collapse into the canonical call. A row's layout travels with the row, not
  with its container, so a canonical row keeps its computed layout in any parent.

- **REQ-005 — `submenu: true` opens a submenu.** The affordance and the mechanism become the same thing.
  `OwnedMenuHandle` gains the ability to open a nested menu through the same factory that produced
  its parent, and `column-menu.ts`'s hand-built body-mounted subpopover is retired onto it. A drawn
  chevron that opens nothing is worse than no chevron.

- **REQ-006 — Panels of the same role expose the same contract.** Filter, Sort, Column Manager and the
  view-config panel share a role, and therefore share role, focus behaviour, keyboard contract,
  padding, radius, shadow and row height. Sort acquires its own declared sizing rather than
  inheriting Filter's by accident.

- **REQ-007 — No surface depends on an undeclared piggyback.** Every class in a surface's class list
  contributes a measurable value, or it is removed. The dual-class arrangement that keeps Sort alive
  is either made explicit or eliminated.

- **REQ-008 — The dead placement CSS goes, and the removal is proved by measurement.** The panel
  layout block at `styles.css:9829-9852` — resolve it with
  `rg -n -B8 -A16 'max-width: min\(760px, calc\(100vw - 72px\)\)' styles.css`, never by the line
  number — and the `db-anchored-popover` marker are deleted or made live. A block the positioner
  overwrites inline must not read as the place panel layout is decided.

  **The deletion is not the acceptance condition** (review finding F8). AC-008 closes on the
  before/after computed-geometry diff: all eight panel selectors and every positioner-produced
  surface must report identical `position`, `top`, `right`, `width`, `max-height` and `padding`
  across the removal, at 1440, 1024 and 768 CSS px with the sidebar open and closed, and must still
  pass A1's containment test afterwards. A value that moves means the block or the marker was live;
  the removal is then rejected and the moving value is what the replacement rule must declare.

### P1 - Required (complete OR user-approved deferral)

None. Every requirement above is a blocker: each one is load-bearing for a criterion in Section 5,
and the spec records no deferral for any of them.

<!-- /ANCHOR:requirements -->
---

## 4A. INVENTORY METHOD

**Enumerate by user-reachable trigger, not by module.** A module census counts the code that
exists; a trigger census counts the surfaces a person can actually open, which is the population
the criteria are written against. The two disagree — `toolbar-renderer.ts` is one module and holds
at least fourteen row grammars.

Walk the product and record every trigger: every toolbar button, every header affordance, every
cell affordance, every context menu and every submenu inside one, on desktop and on phone. For
each, record:

| Column | Meaning |
|---|---|
| **Trigger** | what the user clicks, tapped through from the top of the UI |
| **Role** | the `data-db-surface` role it resolves to |
| **Anchor** | the element placement is computed against, or none |
| **Mount** | where the node is actually attached in the DOM |
| **Options** | the width and placement arguments the call site passes today |

The census is complete when every one of the 33 `positionToolbarPopover` call sites, the 11
production owned menus and the `column-menu.ts` subpopover appear as at least one reachable
trigger, and when every trigger reached by hand maps to a call site. **A trigger with no call site,
or a call site with no trigger, is a finding** — the first is a surface created by some other path,
the second is dead code.

---

## 4B. VARIANT ARCHITECTURE

**Roles from `000`, addressed as `data-db-surface`.** Every placement and appearance rule keys off
the role attribute. Nothing keys off ancestry, because ancestry is what broke: `.db-menu-item` lays
out only under `.db-owned-menu`, and `db-sort-panel` is dimensioned only by a sibling's class.

**Sizing belongs to the role, not the call site.** The role decides `minWidth`, `preferredWidth`
and `maxWidth`. `292px` is the menu role's width because it is the one that reads correctly today;
wider surfaces declare a wider role.

**Why not the alternatives.** Keeping per-call-site numbers is the present state and produced three
surfaces asking for nothing and fifteen asking for something different. Keying off the container
class is the documented trap in `../architecture-findings.md` §8. Adding a fourth width preset
alongside the existing three multiplies the disagreement rather than resolving it.

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

### Acceptance Criteria

Each is measured on the real renderer at the production mount point, expressed as a number or a hit
test with a threshold, and recorded here with its failing value from the current tree before it is
trusted. **A criterion with no recorded failing number is not accepted.** Class names and call
counts are banned; the counts in §2 are evidence for the argument, never criteria.

| # | Criterion | Threshold | Measured today |
|---|---|---|---|
| **A1** | Every popover's measured rect is fully inside the visible editing bounds | `rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom` at 1440, 1024 and 768 CSS px, sidebar open and closed — 6 configurations per surface | **fails: More tools clips.** Record the overflow in px per axis per configuration before any edit |
| **A2** | Any two surfaces of the same role compute identical `padding`, `border-radius`, `box-shadow`, row `height` and `font-size` | set equality across all five, over every pair in the role | **fails.** Record the distinct-value count per property per role |
| **A3** | A canonical menu row's computed layout is unchanged when mounted in a different container | `display`, `align-items`, and the label and value `getBoundingClientRect()` are equal in `.db-owned-menu` and in a bare `div` | **fails: `display` computes `flex` inside `.db-owned-menu` and `block` outside** (`styles.css:258` is the only flex declaration). Record both rects |
| **A4** | A submenu opened from a menu row is produced by the same mechanism as its parent, and its rect is inside the visible bounds | the submenu node's `data-db-surface` role resolves through the same factory as the parent, **and** A1's bounds test passes for it | **fails: no submenu opens.** `submenu: true` draws a chevron only; record that opening a chevron row produces zero new surface nodes |
| **A5** | Filter and Sort expose the same role, focus behaviour and keyboard contract | asserted, not inspected: equal `role` attribute; Tab from the last focusable returns to the first in both; Escape closes and returns focus to the trigger in both | **fails:** Filter `role="dialog"` with a trap; Sort has no role and no trap. Record the tab-cycle exit target for each |
| **A6** | Removing any one class from a panel's class list changes at least one measured value | for each class in each panel's list, delete it and re-measure width, height, padding, radius, shadow and z-index; every deletion must move a number | **fails: removing `db-filter-panel` from the Sort panel changes its width, max-height and phone clamp.** Record the four values that move |
| **A7** | No reachable code path produces a menu-role surface wider than its role permits | measured `rect.width <= 320` for every menu-role surface reached in the census | **fails: 3 call sites reach the 520px default.** Record the measured width of Filter, Sort and Column Manager |

**A4 and A6 are the harness's negative controls.** A4 fails today by producing nothing to measure,
so the check proves it can distinguish. A6 is a deletion test by construction: if removing a class
moves no number, the class is decorative and the criterion has told us so.

<!-- /ANCHOR:success-criteria -->
---

## 5A. PHASE PLAN

| # | Phase | Exit condition |
|---|---|---|
| 1 | **Overlay census by user-reachable trigger** | §4's table is complete and reconciled against the 33 call sites in both directions |
| 2 | **Placement contract** | bounds, flip, clamp, sidebar and popped-out-window behaviour defined per role, with the failing numbers for A1 and A7 recorded |
| 3 | **Row grammar** | the 8 `render*Row` methods and 14 grammars mapped onto `createMenuRow`; the two duplicates collapsed; `submenu: true` opens a real submenu |
| 4 | **Panel parity** | Filter, Sort, Column Manager and view-config share a role and a declared contract; Sort's piggyback resolved |
| 5 | **Implement** | source and `styles.css` changes land, including deleting the dead block and the dead marker |
| 6 | **Measured placement tests** | A1-A7 asserted in the browser harness, each demonstrated to fail first |
| 7 | **Screenshots** | 4 widths x sidebar open/closed, full recapture, human review of every changed PNG |
| 8 | **Storybook roles side by side** | one story per role showing its members together, at the production mount point |
| 9 | **Research gate** | standing; see §9 |

---

## 5B. VERIFICATION METHOD

**Measured tests live in the browser.** `vitest` runs `environment: "node"` with no jsdom
(`vitest.config.ts`), so no DOM assertion can live in a unit test. Every criterion in §6 is
asserted in `tools/storybook/verify-placement.mjs` — which today runs a single 1440x900 viewport
with a hardcoded 300px sidebar and a 390x844 phone profile, and must grow the widths, the
sidebar-closed state and the popped-out-window layout this phase asks for.

**Negative controls.** Each check is demonstrated to fail on the current tree, with the failing
number written into §6, before the fix lands. If deleting the thing under test changes no asserted
number, the check is theatre and is rewritten.

**Screenshots.** 1440, 1024, 768 and the phone profile, sidebar open and closed, full recapture,
**and a human opening the changed PNGs.** `screenshots:verify` only proves a capture was
regenerated after its hand-maintained source list changed; it never opens an image.

**Storybook.** One story per role, its members rendered side by side, mounted where production
mounts them rather than inside a convenience wrapper.

### Line numbers are dated hints; the selector is the address

`styles.css` is 19,261 lines and `000` deletes dead blocks before this phase starts. Every
`styles.css:NNNN` in this packet was confirmed correct on 2026-08-29 and is kept as evidence about
the tree on that date — **it is not an address.** `acceptance-criteria.md` carries the resolution
table: selector or symbol, plus the `rg` command that finds it today. When the command and the
number disagree, the command is right. Record the old number, the new number and the edit that moved
it; do not silently correct a citation.

### No desktop number recorded before `000` repairs the desktop page

`tools/storybook/verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it
targets the **phone** page. Every desktop geometry check in that harness therefore runs against a
document with no plugin cascade, which is the same structural blindness as measuring inside the
`.note-database-container` wrapper. A1, A2, A4, A5, A6 and A7 are all desktop reads.

`000` fixes the load. Until it has, **no failing number and no passing number for this packet may be
taken from the desktop harness page.** A number recorded before that repair is discarded rather than
re-used, because it was measured in a document the product never renders in. A harness number that
disagrees with the `009` live probe is a blocking failure here, not a note.

### The `styles.css` lane

This packet **takes the lane at the start of Phase 5** and holds it through Phase 6. Phases 1 to 4
are census, contract and decision work and run against an unedited stylesheet.

It **releases the lane** only after, in order: a full recapture; a named human opening every changed
PNG and signing off in `checklist.md`; `008`'s early replay re-asserting `000`, `004` and `005`
against the released tree; and the cascade re-confirmation for every duplicated selector this packet
touched. `screenshots:verify` never opens an image, so it can never be the sign-off. A phase that
closed earlier and fails to re-close at this handoff blocks the release.

---

## 5C. RESEARCH GATE

Standing, and triggered by a rule rather than a schedule: **when a criterion fails twice without a
new hypothesis.** Two failures with the same explanation means the explanation is wrong, and more
attempts are cheaper to stop than to continue.

Read AnyType and AppFlowy under `external/` (gitignored) for **behaviour only** — how a menu
decides which side to open on, what a submenu does when the parent scrolls, how a panel degrades
when the sidebar opens under it. Both are AGPL or source-available and this plugin is MIT:
**never copy code, CSS values or token scales.** Notion is the visual target and is not a source;
describe what it looks like, then derive values from our own scale.

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

This phase holds `styles.css` for its entire duration. All 196 captures fingerprint the file, so
no other spec may hold it concurrently and every landing ends in a full recapture with human
review.

The row-grammar work touches 14 emission sites in one file and is the largest single change in the
program. It is sequenced after the placement contract deliberately: once placement is decided by
role, a row's container stops being load-bearing, and the collapse becomes a mechanical
substitution rather than a redesign.

Sort's dual-class dependency is the specific trap. It has no compiler protection and no test, so
A6 exists to make its removal loud instead of silent.

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance

- **NFR-P01**: The placement contract adds no listener the shipped positioner did not already own;
  reposition listeners stay owned by one authority rather than one per call site.
- **NFR-P02**: Row construction through `createMenuRow` performs no more DOM work per row than the
  hand-written `render*Row` methods it replaces.

### Security

- **NFR-S01**: No network call, telemetry or remote dependency. Local Obsidian DOM APIs only.
- **NFR-S02**: AnyType and AppFlowy under `external/` are read for behaviour only — both are AGPL or
  source-available and this plugin is MIT, so no code, CSS value or token scale is copied.

### Reliability

- **NFR-R01**: Desktop behaviour outside the censused surfaces is unchanged; the phone predicates and
  the sheet portal belong to `003`.
- **NFR-R02**: Every row grammar is retired in its own commit, so a regression bisects to a grammar.
- **NFR-R03**: `column-menu.ts`'s working hand-built subpopover stays in place until the
  factory-backed submenu passes A4.

---

## 8. EDGE CASES

### Data Boundaries

- A surface anchored near a viewport edge must flip or clamp rather than overflow; A1 measures this
  at 1440, 1024 and 768 CSS px with the sidebar open and closed — 6 configurations per surface.
- A menu with four items must not size to the 520px default. A7 measures `rect.width <= 320` for
  every menu-role surface.
- A popped-out window has no `.workspace-split` to prefer; the `.app-container` / `.workspace`
  fallback branch in `getVisiblePopoverBounds` exists for it and is currently exercised by nothing.

### Error Scenarios

- A canonical row mounted outside `.db-owned-menu` collapses to `display: block`. A3 measures both
  rects rather than asserting a class name.
- Deleting `db-filter-panel` from the Sort panel silently removes its width, max-height and phone
  clamp. There is no compiler warning and no failing test; A6 is the deletion sweep that makes it
  loud.
- A chevron row that opens nothing produces zero new surface nodes. A4 fails today by having nothing
  to measure, which is what proves the check can distinguish.

### State Transitions

- A submenu opened from a parent menu must resolve what Escape closes and what an outside click
  dismisses. The existing `OverlayStack` LIFO dismissal already has an answer for nested surfaces.
- Opening the right sidebar under an open popover changes the bounds; the root-split preference
  exists so the popover cannot slide under it.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 24/25 | 33 positioner call sites, 8 `render*Row` methods, 14 row grammars, 11 owned menus, 4 panels, plus the census |
| Risk | 21/25 | Holds the serialized `styles.css` lane for the whole phase; the row-grammar work is the largest single change in the program |
| Research | 12/20 | Root causes already measured in `../architecture-findings.md`; the open judgement is which bespoke widths justify a role |
| Multi-Agent | 8/15 | Single CSS lane by construction |
| Coordination | 13/15 | Blocked by `000`; blocks `002` and through it `003` and `006` |
| **Total** | **78/100** | **Level 3** |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | Sort's dual-class piggyback removed without noticing what it supplied | H | M | A6 deletion sweep records the four values that move before any class is touched |
| R-002 | Row-grammar collapse regresses a menu nobody censused | H | M | Trigger census reconciled in both directions; one commit per grammar so a regression bisects |
| R-003 | Retiring `column-menu.ts`'s subpopover before the factory submenu works leaves no working submenu | H | L | T-026 is gated on T-025 passing A4; the working mechanism stays until the honest one works |
| R-004 | The phase ends with fifteen roles — the present state renamed | M | M | Open question in Section 12; the census supplies the evidence, the judgement is recorded |
| R-005 | A `styles.css` edit collides with a parallel phase | H | L | One serialized CSS lane; this phase holds it for its whole duration |
| R-006 | `screenshots:verify` passes on a regenerated capture nobody looked at | H | M | The gate is a human opening every changed PNG; the command never opens an image |

---

## 11. USER STORIES

### US-001: Menus land where they are supposed to (Priority: P0)

**As a** plugin user, **I want** every popover and menu to open fully inside the visible editing
area, **so that** More tools stops clipping and Filter, Sort and Column Manager stop opening at
520px for four items.

**Acceptance Criteria**:
1. Given any censused surface at 1440, 1024 or 768 CSS px with the sidebar open or closed, When it
   opens, Then its measured rect is fully inside the visible editing bounds (A1).
2. Given a menu-role surface, When its width is measured, Then `rect.width <= 320` (A7).

### US-002: One menu, one grammar (Priority: P0)

**As a** maintainer, **I want** every menu row to come from `createMenuRow` and to keep its layout
wherever it is mounted, **so that** a row's appearance stops depending on which container it landed
in and the Title Actions menu stops wearing the View Tab menu's class names.

**Acceptance Criteria**:
1. Given a canonical menu row, When it is mounted in `.db-owned-menu` and in a bare `div`, Then
   `display`, `align-items` and the label and value rects are equal (A3).
2. Given a row with `submenu: true`, When it is activated, Then a submenu is produced by the same
   factory as its parent and passes the A1 bounds test (A4).

### US-003: Two adjacent buttons, one contract (Priority: P0)

**As a** keyboard or screen-reader user, **I want** Filter and Sort to behave identically, **so
that** the panel beside the one I just used does not silently drop its role, label and focus trap.

**Acceptance Criteria**:
1. Given Filter and Sort, When their role attribute, tab cycle and Escape behaviour are compared,
   Then they are equal (A5).
2. Given any class in a panel's class list, When it is deleted and the panel re-measured, Then at
   least one measured value moves (A6).

---

## 12. OPEN QUESTIONS

**Which of the 15 bespoke widths justify a role, and which are drift?** The census answers this, but
the judgement is not mechanical. A relation picker at 420px and a chart toolbar at 520px may be two
roles or one; an icon picker pinned to 318px and a colour picker pinned to 124px are probably two
more. The phase must not end with fifteen roles, which would be the present state renamed.

**Does a submenu join the overlay stack as its own layer, or as part of its parent?** It decides
what Escape closes and what a click outside dismisses. The existing `OverlayStack` LIFO dismissal
already has an answer for nested surfaces; this phase should adopt it rather than invent one.

**Does Sort keep its own class at all?** R7 permits either an explicit declaration or elimination.
If Sort and Filter genuinely share one role after the parity work, a separate class may have nothing
left to say — but the decision needs the measured parity result, not a guess.

<!-- /ANCHOR:questions -->
---

## 13. DECISION RECORD — the surface factory is deleted, the contract is kept

**Decision.** `src/views/surface.ts` and its `openSurface()` factory are deleted.
`src/views/surface-contract.ts` is kept in full. Taken 2026-08-30, on the third time the question
was raised, because the two previous answers were deferrals and the deferral itself had already
decayed.

### What was measured

Every figure below was read from the tree before the deletion, and each is reproducible.

| # | Measurement | Value | Bar for wiring | Result |
|---|---|---|---|---|
| M1 | Modules importing `views/surface` | **0** | at least 1 | fail |
| M2 | Tests or stories exercising `openSurface` | **0** | at least 1 | fail |
| M3 | Production nodes carrying `data-db-surface` | **0** | at least 1 | fail |
| M4 | Is the factory in the shipped bundle | **no** | yes | fail |
| M5 | `showAt` call sites that open at a cursor point, which an anchor-only factory cannot express | **12 of 14** | most are anchorable | fail |
| M6 | `positionToolbarPopover` sites passing a non-width axis (`align`, `gap`, `preferredSide`, `margin`), which the declaration has no field to carry | **10 of 34** | near 0 | fail |
| M7 | Registered producers adoptable with no new capability | **1 of 5** | a real family | fail |
| M8 | Largest anchor-only, width-only candidate family | **3** panels, of which **1** traps focus and **0** share a dismissal owner | one behaviour | fail |
| M9 | Surface-shaped elements built outside any declared role | **193** | the registry names 5 | fail |

M4 is the one that reframes the rest. Nothing imports the factory, so the bundler drops it: it has
never run on a device, in any release, for any user. It could not be the cause of a defect and could
not be the fix for one.

### Why wiring was not available

The three blockers are not a to-do list, they are three measurements pointing the same way.

Anchor-only is not a gap next to M5 — it is the wrong model for 12 of 14 menu openings, which begin
at a pointer coordinate that no element resolves. The role-declared width is not a gap next to M6 —
placement has four axes and a role has an opinion about one, so 10 real call sites would have to
give up a value they pass today. A close that cannot commit is not a gap next to the date picker,
which is **in the factory's own registry** and whose dismissal writes to the operator's vault.

An abstraction that four of its own five registered producers contradict is not unfinished. It is
falsified. Finishing it would have meant designing a second time, against evidence gathered after
the first design, with no caller waiting.

And there was no caller waiting. This phase — the one the factory was recorded as blocking — does
not name `openSurface` in any of its eight documents. Two later phases wrote the refusal into their
own requirements as a constraint to hold. Four plans cited the factory as a foundation while none
of them depended on it.

### Why "mark it unfinished" was not the answer either

It was already the answer, and it had already rotted. The factory carried an uncommitted docblock
naming two blockers and asserting that everything else in it "is exercised by the tests" — while
M2 was zero at the moment the sentence was written. A third blocker was then found by someone else,
after that docblock existed and without it helping. A marker that is wrong on its central claim
within one phase is not a safeguard; it is the fourth deferral wearing a warning label.

### What the program is choosing not to have

**There is no single factory that owns floating-surface creation.** No one function stamps identity,
registers dismissal, applies placement and owns teardown. Those stay distributed across the paths
that do them today: `positionToolbarPopover` for placement, `OwnedMenuHandle.showAt` for menus,
`overlayStack` for LIFO dismissal, `popover-auto-close` for outside-dismissal, and the token root in
the stylesheet for token inheritance. The 193 in M9 stays uncovered, and is now counted under a name
that does not promise a destination that is not being built.

This is a real capability the program is declining, not a defect it is denying. Anyone who wants it
back should want it for the 193, not for the 5.

### What the contract keeps, and why it was not deleted alongside

`surface-contract.ts` was measured separately and is **live**: `surface-contract.test.ts` covers it,
`anchor-ref.ts` imports `SurfaceRole`, and two tools read it from disk as an input they fingerprint.
It carries every role, dismissal set, focus mode, width policy, token key and producer registration
— the whole design. Deleting it would have destroyed the design in order to remove a guess at its
implementation, and would have broken a passing suite and two tools.

The design survives the factory. That is the point: the roles were right and the factory was one
opinion about how to apply them.

### What would settle a rebuild

Not a plan and not an argument — three numbers, in this order.

1. **A placement input that carries all four axes.** M6 goes from 10 of 34 to 0: no call site passes
   an axis the abstraction cannot accept.
2. **A point anchor.** M5 goes from 12 of 14 to 0: a cursor coordinate is expressible without an
   element.
3. **A close that returns a disposition its owner can act on**, proven by the date picker committing
   through it rather than beside it.

Only then does the migration question become real, and its bar is M7: a family of call sites that
share a dismissal owner and a focus mode, not merely a width. M8 is the warning — the three panels
that look like a family share a width preset and disagree about focus, so migrating them on the
strength of the width would have newly trapped focus in two panels that do not trap it today.

Rebuilding it without those three numbers reproduces exactly what was deleted.

### Guard against re-litigation

The reason this sat for three phases is that nothing measured it. A module that nothing imports is
invisible to every other check: the bundler drops it, so no screenshot or geometry check sees it,
and no suite loads it, so nothing contradicts its comments.

`design-conformance.mjs` now walks module reachability from the roots the real builds use — the
plugin entry point, the suite setup file, and every test and story — and counts what is reached by
none of them. It read **3** with the factory present and reads **2** without it, naming the file in
both runs. An unwired module now has a number against a target of 0, and cannot sit unnoticed again.

The two that remain are `create-record-icon-field-modal.ts` and `group-order-modal.ts`. They are the
same finding in a different file and were left alone: they are outside this decision's scope and
each needs its own disposition.

### Residual debt this decision creates

- **A stale comment.** `popover-position.ts` explains its hide-on-detached-anchor behaviour by
  reference to the deleted factory's `place()`. Correcting it changes the file's hash, which marks
  four `panel-record-detail-sheet` captures stale, and the capture tool only rewrites its manifest
  on a full run — which would overwrite roughly thirty screenshots another lane has uncommitted.
  The edit was made, measured, and reverted. It belongs to whoever next holds the capture lane, in
  the same landing as a recapture.
- **Predecessor reconciliation.** `000-surface-contract-and-truthful-harness` still names the
  factory as REQ-001 and lists `surface.ts` as a file it creates, and the parent `spec.md`,
  `graph-metadata.json` and `design-system.md` still present `openSurface()` as the API. Those are
  another phase's documents and were not edited from here. They need the disposition above applied.
- **This phase's blocker is discharged.** The dependency on `000` landing first was recorded on the
  belief that this phase "places surfaces the factory creates". It does not, and never did.

---

## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Findings**: [`../architecture-findings.md`](../architecture-findings.md)
- **Predecessor**: [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- **Successor**: [`../002-properties-panel/spec.md`](../002-properties-panel/spec.md)
- **Implementation Plan**: See [`plan.md`](plan.md)
- **Task Breakdown**: See [`tasks.md`](tasks.md)
- **Verification**: See [`checklist.md`](checklist.md)
