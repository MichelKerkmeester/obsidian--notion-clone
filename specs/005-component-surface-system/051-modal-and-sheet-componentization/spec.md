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

**Key Decisions**: **Anytype parity is the default for every sheet and modal, and a deviation is
permitted only for accessibility, named with its measurement** (ADR-007, operator 2026-09-05
~18:30); one shell, two presentations (D1); the confirm primitive is this packet's and the only one
(D5); `044` and `048` are consumed unchanged as *contracts* and may not regress, while their
*grammar* yields to a measured parity value where the two differ (D4, as amended by ADR-007); the
geometry and motion come from this packet's measured true-up, not from per-surface literals.

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
- `design-trueup.md` — the per-surface migration table: surface → shell role → presentation →
  changes → Anytype pattern with its capture → stays ours. **Landed 2026-09-05 as T001's output**;
  it is the file the packet drafted as `modal-surface-inventory.md`, renamed and nothing else, the
  way `050`'s `design-trueup.md` replaced its `capture-alignment.md`.
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
  state copy `055`'s. **ADR-007 does not move that boundary**: where parity retargets a value another
  owner holds — `053`'s bottom-anchored search row, `design-system.md` §5's `condition panel` width
  and its 140/140/120px column floors — this packet records the measured target and names the
  conflict (`../roadmap.md` §7.11). It does not edit the owner's file.
- **The formula workbench** (`modals/formula-modal.ts`, 1,664 lines) — stays ours, `fullscreen`,
  untouched. Confirmed by the operator's fullscreen-presentation ruling, §11 and
  `decision-record.md` ADR-004 (Accepted).
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
| `design-trueup.md` | Create | The migration table — **landed**; T001's output, and ADR-002's per-pair list |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | One shell constructor produces both presentations from one definition. `DbModal.applyPresentation`'s branch, the three direct `attachSheetChromeToModal` callers and the twelve independent `createSheetHeader` sites resolve to it, or each survivor is individually dispositioned in `design-trueup.md` with a written reason. |
| REQ-002 | Every surface declares its own sheet title and its shell role. `getSheetTitle`'s heading scrape survives only as the fallback for a surface that declares none, and the fallback's use is counted rather than assumed. |
| REQ-003 | The shell offers **three** navigation moves, each with the affordance the captures mark it by (`design-trueup.md` §3). **Replace in place**: the frame's title and body swap, a back affordance appears in the header, one grab handle stays at an unmoved edge. **Stack a sheet**: a second sheet rises over the first, the parent stays mounted and dimmed, and the parent's own handle stays visible above the child's. **Stack a menu**: an anchored surface opens over the parent with no handle of its own, and on desktop the parent stays undimmed. The frame's **width and its anchored edge** hold to `\|Δ\| ≤ 1px` across a replace; its **cross-axis extent is content-driven on desktop and fixed on phone** — measured, `design-trueup.md` §6 C1. A stacked child registers as a stacked pair like any other; which pairs convert to a replace is `decision-record.md` ADR-002's list, resolved per pair in `design-trueup.md` §4 — **two convert** (`properties property type picker`, `add view property picker`) and **twenty-nine keep `048`'s stacking**, ten of those because nothing equivalent was captured. **The depth cap is a shell rule, not an observation** (ADR-007, `design-trueup.md` §6 C4): **no third stacked sheet** — where a third level is needed, the third **replaces** the second. The two remaining `depth: 3` registrations (`record column submenu`, `import confirm dropdown chain`) are menu-stacks rather than sheet-stacks and satisfy the cap without converting. |
| REQ-004 | `design-trueup.md` carries one row per family surface: surface → shell role → presentation → changes → Anytype pattern with capture filename or named gap → stays ours. No surface in the census is undispositioned. **Met 2026-09-05**: 35 rows — 20 `DbModal` subclasses, 3 `FuzzySuggestModal` outliers, 12 `createSheetHeader` sites — of which 25 name a capture and 10 carry **design inferred from source code, not seen**. |
| REQ-005 | The confirm primitive is exported, carries `044`'s seven grammar elements, and is the only confirm path in `src/`. `053`'s sort-conflict confirm and `055`'s destructive-confirm state consume it; neither builds a second. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-006 | The shell's geometry reads from named values, not per-surface literals, and every value is the one measured off the reference (ADR-007). **Desktop**: **8px** radius, **16px**/**8px** padding, **8px** divider clearance, **28px** rows, **360px** `panel` width, **288px** condition surface on `#191919`, **232px** operator dropdown — all re-measured off a second capture set (`design-trueup.md` §2a). **Phone, two frame shapes, not one** (`design-trueup.md` §6 C10): a **floating card** at an **8pt inset on three sides** (device L 24 / R 1181 / bottom 2597, i.e. 8.0 / 8.3 / 8.3pt) with a **16pt** radius, and a **flush** edge-to-edge sheet (L 0 / R 1205 / bottom 2621) with top corners only; the shell takes the shape from the surface's declared height role, because every floating capture sits at a top edge ≥ 299pt and every flush one at ≤ 198pt and **nothing was captured between**. Both shapes carry a **34 × 5pt** grab handle 6pt below the top edge, **50pt** rows, an **≈70pt** header, a **20pt symmetric divider inset** on plain rows (text-column-aligned past a leading icon, full-bleed between sections), and `044`'s **44px** close. A **primary action is a full-width pill, 341.7 × 50.0pt at ≈21pt inside each sheet edge**, disabled until valid. A **trailing header chip is 44.0 × 44.0pt**. Every former literal is a named value or carries a written reason in `design-trueup.md`. The phone frame's 8pt inset is the one geometry change with a regression surface — every `sheet-grammar` selector that measures a sheet's rect moves with it, so it lands in the leg that updates those rows. |
| REQ-007 | The shell's motion is **enter 200ms `ease-out`, exit 150ms `ease-in`** (`design-trueup.md` §4 Motion — 150ms is the closest in-band value to `047`'s source-read 0.1s exit, which sits below the 120ms floor for direct feedback and would read as a cut). Reduced-motion coverage holds for every surface the shell produces. |
| REQ-008 | `npm run gate` exits 0 with one permanent lane row per shell deliverable, each negative control observed red then green; `npm run replay` holds with reversed 0; the twelve registered `sheet-grammar` surfaces and the thirty-one registered stacked pairs stay green. |
| REQ-009 | **Parity is the default and a deviation is an accessibility one with a number.** Every decision cell in `design-trueup.md` §5 and every resolution in §6 reads **ADOPT**, **FLIPPED**, **HOLD** (an absent equivalent — no Anytype surface exists to be parity with) or **REFUSE**, and every `REFUSE` names an exception in `decision-record.md` ADR-007 with the measurement that justifies it. The permitted grounds are WCAG **1.4.11** (non-text contrast), WCAG **1.4.3** (text contrast) and a **44px** touch floor, and nothing else. Three exceptions exist — **E1** the 44px close (handle 2.21:1), **E2** the empty-value grey as text (`#7B7B7B` 3.89:1, replaced by Anytype's own `#909090` at 5.16:1), **E3** red-plus-icon on every destructive row (Anytype's minority answer carries no non-colour signal) — plus **E4**, the confirm, which holds for a data-loss reason the ruling does not authorise and is **flagged for the operator** rather than absorbed. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `design-trueup.md` dispositions every surface in the census with no "unknown" cells,
  and every cited capture resolves under `screenshots/anytype/`. **Met 2026-09-05**, 35 of 35.
- **SC-002**: A sub-page opened from the view-settings sheet replaces in place with a back
  affordance on desktop, on phone and by keyboard, and the parent's **width and anchored edge** do
  not move (`|Δ| ≤ 1px`); the cross-axis extent is content-driven on desktop and fixed on phone,
  which is what the capture measures (`design-trueup.md` §6 C1).
- **SC-003**: The four chrome-deciding sites reduce to one, measured by a count against a recorded
  baseline of **4**, with the three direct `attachSheetChromeToModal` callers each resolved or
  dispositioned.
- **SC-004**: Every threshold in `acceptance-criteria.md` was observed failing on the current tree
  before its leg ran, and the failing figure is recorded in `checklist.md`.
- **SC-005**: Zero decision cells in `design-trueup.md` §5 and zero resolutions in §6 decline a
  measured Anytype value without naming an ADR-007 exception. Counted, not asserted: three
  exceptions plus one flagged hold, and no fifth.
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
| The stacking model | **048** | A constraint. Consumed unchanged as a *contract*, asserted after every leg, never re-specified. **Amended by ADR-007**: sub-page-by-capture is the default for the pairs `design-trueup.md` §4 enumerates rather than a two-pair carve-out, and the depth cap — no third stacked sheet — is a shell rule. `048`'s registrations and its thirty-one-pair regression gate are unchanged |
| The seven phone grammar elements | **044** | A constraint, same terms — with one amendment. **ADR-007**: `044`'s **grammar yields to a measured parity value where the two differ**, which is row 26's `menu` role becoming an anchored, handle-less card rather than a grab-handle bottom sheet. `044`'s 44px close is the one thing parity does **not** take, and it survives as exception **E1** on a measured 2.21:1 |
| `050`'s fourteen adoption items | **050** | None of the fourteen is a shell item. `050`'s `design-trueup.md` remains the **desktop** read of record; its REQ-002 sub-page finding is the only row this phase implements against, and it implements the *shell* half while `050` keeps the requirement. **This packet's own `design-trueup.md` extends it rather than replacing it**: `050` was written before the 118 iOS captures landed, so the phone half of every shell value is measured here for the first time, and `050` C6's desktop empty-state finding is left standing (`design-trueup.md` §6 C7) |
<!-- /ANCHOR:overlaps -->

---

<!-- ANCHOR:nfr -->
## 8. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: A shell opens within the same budget the surface has today; the shell composes the
  same chrome calls in the same order rather than adding a layer that re-measures.
- **NFR-P02**: A sub-page replace does not remount the frame. The frame's **width and its anchored
  edge** move by `|Δ| ≤ 1px`, the same tolerance `048` AC-002 already measures for a stacked parent.
  The **cross-axis extent is not held**: measured on the reference, a desktop replace changes the
  frame's height by up to 300px within an invariant 360px width, while a phone replace changes
  nothing at all (`design-trueup.md` §6 C1). A tolerance written across both axes could not be
  observed failing on the surface it was written for, which is what `SC-004` requires of it.

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

- ~~Does `fullscreen` survive as a third presentation, or collapse into the sheet with a height
  role?~~ **Resolved 2026-09-05 (~14:15), operator: "Keep fullscreen for the workbench only."** The
  formula workbench (`FormulaModal`) stays `fullscreen`; the other three `fullscreen` subclasses
  (`ChartDrilldownModal`, `InvalidTimeEventsModal`, `PropertyTypeConflictModal`) become modal
  (desktop) / sheet (phone) — see `decision-record.md` ADR-004 (Accepted).
- ~~Which of the values the captures show does this packet actually take?~~ **Resolved 2026-09-05
  (~18:30), operator: "Yes, parity by default."** Every one, except where the measured value fails
  WCAG 1.4.11, WCAG 1.4.3 or a 44px touch floor. Eighteen decisions flipped, three exceptions
  named with their numbers, one hold flagged — `decision-record.md` ADR-007, `design-trueup.md` §8.
- Do the three `FuzzySuggestModal` subclasses join the shell, or stay Obsidian-native behind a shim?
  They are not `DbModal` subclasses and they reach `attachSheetChromeToModal` directly; joining the
  shell means re-parenting them, and a shim means the count of chrome-deciding sites stops at two
  rather than one. **Still open** — and unchanged by the parity retarget, which decided what these
  surfaces should *look* like (row 21: full-screen, bottom-docked field) without deciding what they
  should *be parented to*. Anytype has no host application to be native to.
- ~~Does the sub-page pattern reach surfaces `048` has already registered as stacked pairs?~~
  **Resolved 2026-09-05 (~14:15), operator: "Yes, where the capture shows it."** A registered
  stacked pair converts to an in-place sub-page with a back arrow only where the Anytype capture
  shows that pattern for the equivalent surface, judged per pair; per pair the `sheet-grammar` lane
  row is rewritten to the sub-page shape red-first. `048`'s stacking model stays the default for
  every other pair — see `decision-record.md` ADR-002 (Accepted) and `048/decision-record.md`'s
  scoped-exception note. **The list is now written**: `design-trueup.md` §4 reads all thirty-one
  registered pairs against the captures and converts **two** — `properties property type picker`
  and `add view property picker`. Twenty-nine keep `048`'s stacking, ten of them because nothing
  equivalent was captured.
<!-- /ANCHOR:questions -->

---



---

## RECONCILIATION, 2026-09-05 (later the same day): the iOS simulator captures landed

`964a0b2a` landed **118 files — 59 states in light and dark — of Anytype's official open-source iOS
client, built from source and run on a simulator**, under `screenshots/anytype/mobile/`, against the
same 326-record demo space the desktop captures used. They are real iOS chrome: sheets sliding from
the bottom, iOS pickers, the SpringBoard status bar — not the desktop app at a narrow width. They
are indexed with a per-file written description in `screenshots/anytype/README.md`.

**This closes the evidence gap this packet's phone rows were written against**, and it supersedes
one caveat that appears throughout the 050 true-up: `design-trueup.md` was written before these
existed, so wherever it says a phone surface has no capture, or takes its phone reading from the
twenty **App Store and Google Play marketing images** in `mobile/official/`, that gap is now closed
by a real screen. The marketing images stay what they were — good evidence of intent, weak evidence
of pixels — and no number is taken from them.

**What this document claims, and what it does not.** The rows below name the capture each phone
design should now be read against. **The pixels are unread here** — this landing pass could not open
image files, exactly as the original drafting pass could not. Naming the file is not reading it.
T001 opens each one and trues the design; that obligation is unchanged and is now answerable.

| This packet's phone concern | Now readable in |
|---|---|
| The shell's phone presentation — what a sheet's chrome, header and close look like on a real phone | Every one of the 59 states; `anytype-mobile-sheet-object-more` and `anytype-mobile-sheet-space-settings` are the plainest |
| REQ-003's **sub-page replaces in place** pattern, on a phone rather than in a desktop popover | `anytype-mobile-sheet-view-edit` → `anytype-mobile-sheet-view-layout-picker` → `anytype-mobile-sheet-view-gallery-cardsize` is a three-level chain, and the index reaches each by tapping a row of the one before |
| Whether a phone child **stacks** or **replaces** — the `048`-versus-sub-page boundary in §11's third open question | `anytype-mobile-sheet-object-more` → `anytype-mobile-sheet-object-more-submenu`, the same question on someone else's product |
| The confirm primitive's phone presentation | Not captured. No destructive confirm appears in the 59 states; this stays **design inferred from source code, not seen** |

**One row of §11 is now answerable and one is not.** The sub-page-versus-stack question has a
reference screen for the first time. The `fullscreen` presentation question does not — iOS has no
equivalent, and the index records that the iOS client ships **no Calendar and no Graph layout at
all**, so its surface set is narrower than the desktop's rather than a translation of it.

---

## T001, 2026-09-05 (later still): the captures were opened and the pixels were read

The reconciliation above said the honest thing — *"The pixels are unread here … Naming the file is
not reading it."* They have now been read. `design-trueup.md` is that read: 35 census rows against
151 desktop states, 600 desktop menu files and 118 iOS sheet files, with every number sampled off a
file rather than eyeballed, and the iOS files divided by three because they are 1206 × 2622 at 3×.

**It confirmed more than it changed, which is the outcome a second capture set should produce.** The
360 × 316px popover, the 28px row, the 8px divider clearance, the 16px inset and the four surface
colours all came back identical off `menus/` to what `050` measured off the earlier panel
captures — two crawlers, two file sets, one answer, which is what licenses REQ-006's desktop half.

**It changed four things, each inside an existing requirement**: REQ-003 gains a third navigation
move and loses a tolerance that could not have been observed failing; REQ-004 is met; REQ-006 gains
the phone half nobody had measured; and ADR-002's per-pair list exists, with two converts out of
thirty-one. `design-trueup.md` §7 is the change list and §6 the nine contradictions, each named with
the capture that shows it.

**It did not answer §11's second question**, and could not: whether the three `FuzzySuggestModal`
subclasses join the shell or stay Obsidian-native behind a shim is a question about our host, and
Anytype has no host. T010 stays blocked.

---

## THE PARITY RETARGET, 2026-09-05 (~18:30): the operator raised the bar

T001 read the captures under *"capture wins"* and applied it row by row. Fifteen census rows recorded
a measured Anytype value and then kept ours, and three of the nine contradictions were deferred,
routed or declined. The operator's ruling replaces the judgment with a rule: **parity by default, and
a deviation must be an accessibility one with a number behind it.**

**What changed here.** REQ-003 gains the depth cap and the enumerated pair list. REQ-006 gains the
condition-surface widths, the divider rule, the pill and chip geometry, and — the one correction that
went the other way — the fact that the phone has **two** frame shapes rather than the one "8pt inset
on three sides" it previously claimed of every sheet. REQ-009 is new and is the rule itself. SC-002's
tolerance is restated to what the capture measures, and SC-005 counts the exceptions so a fifth
cannot appear unnoticed.

**What did not change.** Scope: no file joins the list, and the three flips that reach another
owner's file (`053`'s search row, `design-system.md` §5's `condition panel`) are recorded as targets
and named as conflicts rather than taken. The reds T002 measured at `de4783bb` stand — they describe
the tree, and the tree has not moved. `044` and `048` remain the regression gate; what yields is
their *grammar* where a measured value differs, not their *contracts*.

**What is still the operator's.** Exception **E4** — the destructive confirm. Anytype ships none,
because its deletions are reversible into a Bin and ours are not. Holding the confirm is a data-loss
deviation, not an accessibility one, and this ruling authorises only the latter. It is flagged in
ADR-007 with the two readings and is not resolved here.

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decision Record**: See `decision-record.md`
- **Packet Goal**: See `goal.md`
- **Design read of record**: See `design-trueup.md` (this packet's, §8 is the parity retarget) and `../050-anytype-adoption/design-trueup.md` (the desktop read it extends)
- **Sheet grammar**: See `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: See `../048-stacked-sheets/spec.md` §4
