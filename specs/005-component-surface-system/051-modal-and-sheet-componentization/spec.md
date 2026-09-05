---
title: "Feature Specification: Modal and Sheet Componentization"
description: "One shell primitive for every modal and sheet in the plugin — one definition, two presentations, declared titles, sub-page navigation and one confirm primitive — with a per-surface migration table and the Anytype shell behaviours each migration takes or declines."
trigger_phrases:
  - "051 spec"
  - "shell primitive spec"
  - "modal sheet componentization"
  - "confirm primitive"
  - "sub-page navigation"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Modal and Sheet Componentization

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

The plugin's modals and sheets already behave correctly — `044` gave a first sheet its grammar and
`048` gave a second its stacking model, both landed. What no phase owns is the **shell**: the code
that decides a surface is a modal or a sheet, gives it a header, a close, a drag, a placement and an
entrance. That decision is taken in four places today, and a surface's sheet title is recovered by
scraping its own headings. This phase reduces the family to one shell primitive with one declared
title per surface, adds the sub-page navigation Anytype's captures show, and makes the confirm a
primitive every consumer imports.

**Key Decisions**: one shell, two presentations (D1); the confirm primitive is this packet's and the
only one (D5); `044` and `048` are consumed unchanged and may not regress (D4); the geometry and
motion come from `050`'s measured true-up, not from per-surface literals.

**Critical Dependencies**: `../050-anytype-adoption/design-trueup.md` (the design read of record),
`044`'s sheet grammar, `048`'s stacking model and its thirty-one registered pairs, `003`'s portal
and anchor lifetime.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-05 |
| **Branch** | `worktrees/086-land-phases-051-055` |
| **Parent Spec** | ../spec.md |
| **Phase** | 51 |
| **Predecessor** | 044-phone-sheet-alignment (grammar), 048-stacked-sheets (stacking), 003-mobile-sheet-presentation (portal) |
| **Related** | 050-anytype-adoption (the design read of record), 052/053/054/055 (the sibling family phases) |
| **Handoff Criteria** | `modal-surface-inventory.md` exists with every family surface dispositioned; one shell constructor produces both presentations; the confirm primitive is exported and is the only confirm path; one lane row per shell deliverable is green with its negative control seen failing |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 51** of the component surface program, and the first of the five family phases the
operator's 2026-09-05 componentization instruction opened (51 modals and sheets, 52 menus and
pickers, 53 the toolbar, 54 records and relations, 55 states and feedback).

**Scope Boundary**: the shell — what makes a surface a modal or a sheet, and what chrome it wears.
A menu's own row vocabulary is `052`'s. The toolbar's popovers are `053`'s. A record's property rows
are `054`'s. A state's copy and its icon are `055`'s. The stacking of one surface over another is
`048`'s and is a constraint here.

**Deliverables**:
- `modal-surface-inventory.md` — the per-surface migration table: surface → shell role →
  presentation → changes → Anytype pattern with its capture → stays ours.
- One shell primitive: one definition, desktop modal and phone sheet, declared title, close, drag,
  placement, entrance, sub-page navigation.
- One confirm primitive, exported, carrying `044`'s seven grammar elements.
- One lane row per shell deliverable, red before green.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The family works surface by surface and drifts as a family. Counted from source at HEAD:

- **Four places decide chrome.** `DbModal.applyPresentation` (`modals/db-modal.ts:92-113`) reads
  `isTouchDevice`, asks `overlayStack` whether a sheet parent exists, and branches to
  `attachSheetChromeToModal` + `placeSheet` + `keepSheetPlaced`. Three surfaces that are not
  `DbModal` subclasses call `attachSheetChromeToModal` themselves — `src/main.ts:3047`
  (`BaseFileSuggestModal`), `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34`.
  And `createSheetHeader` is called independently at **twelve** sites across the view layer.
- **The title is a side effect.** `getSheetTitle` (`db-modal.ts:83-88`) scrapes the first
  `h1`/`h2`/`h3` in `contentEl` that is not inside `.db-sheet-modal-header`, falling back to
  `t("menu.title")`. No surface declares its own sheet title, so renaming a heading renames a sheet.
- **Three presentations, one of them nearly private.** **20** `extends DbModal` subclasses: **13**
  declare `sheet`, **4** declare `fullscreen` (`chart-renderer.ts:972`,
  `modals/invalid-time-events-modal.ts:78`, `modals/formula-modal.ts:217`,
  `modals/property-type-conflict-modal.ts:90`), **3** take the `sheet` default without saying so.
- **The engine is a module, not a primitive.** `mobile-bottom-sheet.ts` is **840 lines** with **19
  exports** — `applySheetChrome` (`:59`), `createSheetHeader` (`:160`),
  `attachSheetChromeToModal` (`:219`), `playSheetEntrance` (`:289`), `carrySheetEntrance` (`:314`),
  `isInsideOpenSheet` (`:466`), `claimBottomDock` (`:537`), `attachSheetDragToDismiss` (`:739`) and
  the rest. Every consumer composes its own subset, in its own order.
- **The confirm is a function, not a primitive.** `openAndWait` (`modals/confirm-modal.ts:45`,
  module entry `:98`) is correct and is already the confirm `048`'s M-4 pair routes through — but it
  is not exported as the family's confirm, which is why `053`'s sort-conflict confirm and `055`'s
  destructive-confirm state each name a primitive that does not exist under that name.

Anytype solves the shell problem with one frame and two navigation moves, both captured: a sub-page
**replaces in place** inside the same frame with a back affordance in the header, and a picker opens
as **its own surface over an undimmed parent** (`design-trueup.md` REQ-002, read off
`anytype-view-settings-panel-dark.png`).

### Purpose

One shell, so the next surface declares what it is and gets its chrome — instead of composing four
decisions from three modules and hoping the order is the one everything else used.

<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The shell primitive: presentation resolution, declared title, header, close, drag-to-dismiss,
  placement, entrance, teardown, `overlayStack` registration, sub-page navigation.
- The confirm primitive: `openAndWait` exported as the family's confirm, with `044`'s seven grammar
  elements asserted on it.
- The migration of every surface listed in `modal-surface-inventory.md`.
- The shell's geometry and motion tokens, read from `050`'s measured values.
- Lane rows per deliverable, with negative controls.

### Out of Scope
- **`048`'s stacking model.** Consumed unchanged, asserted after every leg, never re-specified here.
  Its twelve registered surfaces and thirty-one registered stacked pairs are the regression gate.
- **`044`'s seven grammar elements.** Consumed unchanged; the shell is what makes them cheap to
  satisfy, not a second definition of them.
- **A surface's own body.** Menu rows are `052`'s, toolbar popovers `053`'s, property rows `054`'s,
  state copy `055`'s.
- **The formula workbench** (`modals/formula-modal.ts`, 1,664 lines) — stays ours, `fullscreen`,
  untouched except by whatever the presentation decision in §11 rules.
- **The table view, formulas/rollups/calculations, the Project Manager 1:1 board and gantt** — kept
  ours per the program's rulings.
- **Anytype's data model** — `050` D6 applies unchanged.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/surface-shell.ts` (new) | Create | The shell primitive: presentation, declared title, chrome composition, sub-page stack |
| `src/views/modals/db-modal.ts` | Modify | `applyPresentation` delegates to the shell; `getSheetTitle` becomes the fallback behind a declared title |
| `src/views/mobile-bottom-sheet.ts` | Modify | Stays the engine; its nineteen exports narrow to what the shell needs plus what `048` and `044` assert against |
| `src/views/modals/confirm-modal.ts` | Modify | `openAndWait` exported as the family confirm primitive; grammar elements asserted |
| `src/main.ts` | Modify | `BaseFileSuggestModal` routed through the shell or dispositioned |
| `src/views/image-file-suggest-modal.ts` | Modify | Routed through the shell or dispositioned |
| `src/views/markdown-file-suggest-modal.ts` | Modify | Routed through the shell or dispositioned |
| `src/views/modals/*.ts` (17 subclasses) | Modify | Declare a title and a role; stop composing chrome |
| `tools/live/sheet-grammar.mjs` | Modify | Row updates for any registered surface or pair whose markup moved, in the same leg |
| `styles.css` | Modify | Shell geometry and motion tokens; serialized by the parent's CSS lane |
| `modal-surface-inventory.md` | Create | The migration table |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | One shell constructor produces both presentations from one definition. `DbModal.applyPresentation`'s branch, the three direct `attachSheetChromeToModal` callers and the twelve independent `createSheetHeader` sites resolve to it, or each survivor is individually dispositioned in `modal-surface-inventory.md` with a written reason. |
| REQ-002 | Every surface declares its own sheet title and its shell role. `getSheetTitle`'s heading scrape survives only as the fallback for a surface that declares none, and the fallback's use is counted rather than assumed. |
| REQ-003 | A sub-page opened inside a shell **replaces in place** with a back affordance in the header, inside the same frame; a picker opened from a shell opens as **its own surface over an undimmed parent**. Both are `design-trueup.md` REQ-002's captured patterns; the phone expression of the first is the one `048` REQ-002 already prefers, and the second registers as a stacked pair like any other child. |
| REQ-004 | `modal-surface-inventory.md` carries one row per family surface: surface → shell role → presentation → changes → Anytype pattern with capture filename or named gap → stays ours. No surface in the census is undispositioned. |
| REQ-005 | The confirm primitive is exported, carries `044`'s seven grammar elements, and is the only confirm path in `src/`. `053`'s sort-conflict confirm and `055`'s destructive-confirm state consume it; neither builds a second. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-006 | The shell's geometry reads from named values, not per-surface literals: **8px** radius, **16px**/**8px** padding, **8px** divider clearance, **28px** rows, **360px** `panel` width, **44px** phone close (`044`). Every former literal is a named value or carries a written reason in `modal-surface-inventory.md`. |
| REQ-007 | The shell's motion is **enter 200ms `ease-out`, exit 150ms `ease-in`** (`design-trueup.md` §4 Motion — 150ms is the closest in-band value to `047`'s source-read 0.1s exit, which sits below the 120ms floor for direct feedback and would read as a cut). Reduced-motion coverage holds for every surface the shell produces. |
| REQ-008 | `npm run gate` exits 0 with one permanent lane row per shell deliverable, each negative control observed red then green; `npm run replay` holds with reversed 0; the twelve registered `sheet-grammar` surfaces and the thirty-one registered stacked pairs stay green. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `modal-surface-inventory.md` dispositions every surface in the census with no
  "unknown" cells, and every cited capture resolves under `screenshots/anytype/`.
- **SC-002**: A sub-page opened from the view-settings sheet replaces in place with a back
  affordance on desktop, on phone and by keyboard, and the parent's bounding box does not move.
- **SC-003**: The four chrome-deciding sites reduce to one, measured by a count against a recorded
  baseline of **4**, with the three direct `attachSheetChromeToModal` callers each resolved or
  dispositioned.
- **SC-004**: Every threshold in `acceptance-criteria.md` was observed failing on the current tree
  before its leg ran, and the failing figure is recorded in `checklist.md`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `048`'s thirty-one registered stacked pairs | A shell change moves the markup a registered pair's selector reads | `tools/live/sheet-grammar.mjs` names every pair and selector; update rows in the same leg, never after |
| Dependency | `048` D1's modals-as-sheets landing (`915591c2`) | The shell inherits a behaviour that is already correct and already captured | Regression, not construction: the pairs' green is the baseline this phase must not move |
| Risk | `mobile-bottom-sheet.ts` is the engine under every phone surface | A narrowed export breaks a consumer no test mounts | Narrow by deprecation, not deletion: keep the export, mark it, count call sites down to zero before removing |
| Risk | The title scrape is load-bearing in surfaces nobody declared | Declaring titles surface-by-surface can change a sheet's visible title | The scrape stays as the fallback; a declared title is asserted against the scraped one in the same leg, and any intentional difference is recorded |
| Risk | `styles.css` is 22k+ lines with cascade traps | A shell selector change silently reaches a sibling surface | The parent's serialized CSS lane; a recapture a person looks at before the lane releases |
| Risk | The board and gantt carry 1:1 reference parity | A shell geometry change can move a reference pixel | Parent goal D5: recapture and read before any leg that touches a surface those renderers mount |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:overlaps -->
## 7. OVERLAP WITH THE SIBLING PHASES AND WITH 050

One owner per surface. Where two phases would both open a file, the parent's serialized CSS lane and
each phase's one-leg-one-file rule coordinate them.

| Surface | Owner | This phase's role |
|---------|-------|-------------------|
| The confirm primitive | **051 (this phase)** | Built and exported here. `053`'s sort-conflict confirm (its ADR-003) and `055`'s `destructive.confirm` state both reference it |
| The shell a menu presents in on the phone | **051** | `052`'s menu primitive composes into this shell; the menu's rows are `052`'s |
| A toolbar popover's shell | **051** | `053`'s `createPopoverShell` consumes this shell for its sheet presentation rather than declaring a second |
| The condition row | **053** | Not this phase's, not `052`'s. Named here so it is not built twice |
| Cell inline editors, one per column type | **054** | Not this phase's. The shell they open in is |
| Empty, loading, error, success copy and icons | **055** | Not this phase's. The surface they render inside is |
| The stacking model | **048** | A constraint. Consumed unchanged, asserted after every leg, never re-specified |
| The seven phone grammar elements | **044** | A constraint, same terms |
| `050`'s fourteen adoption items | **050** | None of the fourteen is a shell item. `050`'s `design-trueup.md` is this phase's design read of record; its REQ-002 sub-page finding is the only row this phase implements against, and it implements the *shell* half while `050` keeps the requirement |
<!-- /ANCHOR:overlaps -->

---

<!-- ANCHOR:nfr -->
## 8. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: A shell opens within the same budget the surface has today; the shell composes the
  same chrome calls in the same order rather than adding a layer that re-measures.
- **NFR-P02**: A sub-page replace does not remount the frame. The parent's bounding box delta is
  `|Δ| ≤ 1px`, the same tolerance `048` AC-002 already measures for a stacked parent.

### Security
- **NFR-S01**: No new document-level listeners per surface. The shell registers through
  `overlayStack` as `DbModal` and `installPopoverAutoClose` already do — a second dismissal system
  is the anti-pattern `design-system.md` §10 names, and `048` paid for it once already.

### Reliability
- **NFR-R01**: The shell's teardown runs whether or not a handle was stored. `DbModal.onClose`
  (`db-modal.ts:70-79`) already asserts the off state for exactly this reason — a modal closing by a
  path that never stored a teardown strands the backdrop over the whole app, where it swallows every
  tap. The shell keeps that idempotent assertion; it does not replace it with a stored handle.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## 9. EDGE CASES

### Data Boundaries
- A surface that declares no title: the scrape fallback runs and the fallback's use is counted, so
  the number of undeclared surfaces is visible rather than invisible.
- A sub-page stack deeper than one: the back affordance pops one level, and the frame's height
  animates within the motion band rather than jumping.

### Error Scenarios
- The parent closes while a sub-page is open: the whole shell closes with it — the sub-page is
  inside the frame, not a second surface, which is the point of the replace-in-place pattern.
- A picker opened over an undimmed parent whose anchor is destroyed: the anchor-lease rule
  (`design-system.md` §8) applies — the child closes on expiry rather than pointing at nothing.

### State Transitions
- Rotation across the touch boundary mid-surface: `applyPresentation` already re-runs for modals
  (`db-modal.ts`), and the shell keeps that. Menus close and reopen instead, which is `052`'s
  stance and is not changed here.
- A confirm raised over a sheet: `048`'s `confirm over a sheet` pair is already registered; the
  confirm primitive registers the same way and the pair's row must stay green.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## 10. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 18/25 | 18 files, ~1,600 LOC estimated; `recommend-level.sh --loc 1600 --files 18` → 51/100 |
| Risk | 15/25 | No auth, no API, no data. The risk is that the shell sits under every surface in the plugin |
| Research | 3/20 | `050`'s `design-trueup.md` is the read; this is extraction, not research |
| Multi-Agent | 6/15 | Legs grouped by file; sequential |
| Coordination | 9/15 | Four upstream contracts consumed unchanged, four sibling phases to keep off the same files |
| **Total** | **51/100** | **Level 3** — raised from the script's Level 2 on judgment. Phase score **20/50** against a 25 threshold, so a standard child, not a phase parent |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 11. OPEN QUESTIONS

- Does `fullscreen` survive as a third presentation, or collapse into the sheet with a height role?
  Four surfaces use it and one of them is the 1,664-line formula workbench that stays ours. Decided
  in `modal-surface-inventory.md` against the four, not pre-decided here.
- Do the three `FuzzySuggestModal` subclasses join the shell, or stay Obsidian-native behind a shim?
  They are not `DbModal` subclasses and they reach `attachSheetChromeToModal` directly; joining the
  shell means re-parenting them, and a shim means the count of chrome-deciding sites stops at two
  rather than one.
- Does the sub-page pattern reach surfaces `048` has already registered as stacked pairs? Replacing
  a registered stacked pair with a sub-page would change a green row's subject, which needs the
  operator's ruling rather than an agent's judgment.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decision Record**: See `decision-record.md`
- **Packet Goal**: See `goal.md`
- **Design read of record**: See `../050-anytype-adoption/design-trueup.md`
- **Sheet grammar**: See `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: See `../048-stacked-sheets/spec.md` §4
