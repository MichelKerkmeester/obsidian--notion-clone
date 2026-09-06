---
title: "Feature Specification: Sheet Family Remediation"
description: "The phone-sheet family's remaining defects after 044, 048 and 051: two adopted navigation moves with no producer, a scrim at half the measured strength, three surfaces outside the shell and the lane, and the numeric divergences the declared-but-unread constants leave behind."
trigger_phrases:
  - "sheet family remediation"
  - "067 spec"
  - "depth cap"
  - "menu role card"
  - "scrim level"
  - "fuzzy suggest disposition"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Sheet Family Remediation

<!-- SPECKIT_LEVEL: 3 -->


---

## EXECUTIVE SUMMARY

Three phases of sheet work — `044` alignment, `048` stacking, `051` componentization — took the
phone-sheet family to near-parity with the measured Anytype grammar. A ten-iteration deep-research
loop then read the tree against `051/design-trueup.md` and found what is left. It is not a long
list and it is not diffuse: **two adopted navigation moves have no runtime producer at all**, the
**scrim ships at roughly half the strength the captures measured**, **three shipping phone sheets
bypass the shell and appear in no lane row**, and a set of correct measured values sits in
TypeScript constants that no stylesheet can read.

**Key Decisions**: where the depth cap is enforced (ADR-001); what a `menu` role presents as on the
phone, given that `design-trueup.md` rows 26 and 31 disagree about the parent (ADR-002); whether
the parent dim is one mechanism or two (ADR-003); and the FuzzySuggest disposition `051` T010 has
held open since 2026-09-05 (ADR-004).

**Critical Dependencies**: `051`'s `surface-shell.ts` and `mobile-bottom-sheet.ts` are this
packet's working set and are serialized against any other leg holding them; `styles.css` is
serialized by the parent's CSS lane; ADR-004 is blocked on the operator.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-06 |
| **Branch** | `worktrees/172-research-sheet-family` (documentation only; implementation legs get their own) |
| **Parent Spec** | ../spec.md |
| **Phase** | 67 |
| **Predecessor** | 051-modal-and-sheet-componentization |
| **Successor** | None |
| **Handoff Criteria** | Every row in `acceptance-criteria.md` `Met`, `Waived` with an ADR or `Superseded` with an ADR, except AC-011 which is the operator's |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 67** of `005-component-surface-system`, opened by the Opus synthesis of the sheet
family's deep-research loop (`051/research/research.md`, `051` T025, AC-014).

**Scope Boundary**: the phone-sheet family's remaining divergences from the measured Anytype
grammar, and the harness holes that let those divergences pass. It does **not** re-open anything
`044`, `048` or `051` closed on measured evidence, and it does not redesign a surface's body —
`052` owns picker rows, `053` the toolbars, `054` the record surfaces, `055` the states.

**Numbering note**: `059` through `066` are reserved for the Notion refinements, so this child is
`067` although it is the fifty-ninth child folder under the parent.

**Dependencies**:
- `051/design-trueup.md` is the measured baseline of record; where it and any other document
  disagree about an Anytype value, it wins (`050` ADR-003).
- `044`'s seven grammar elements and `048`'s stacking model bind as constraints, exactly as they
  bind `051` (`051` goal D4). Nothing here re-specifies either.
- `051` T010 / AC-001 is the operator's open question and gates REQ-004 alone.

**Deliverables**:
- A depth cap and a replace-in-place body producer, so the two converted pairs become expressible.
- A `menu`-role phone presentation the shell actually reads the role for.
- One scrim mechanism at the measured band, with the pull-back transform dispositioned either way.
- The three `FuzzySuggestModal` surfaces routed or dispositioned, and registered in the lane.
- The declared-constant set bridged into the stylesheet, with a drift check that fails on
  disagreement.
- One device pass against one build, carrying the checklist of what no headless harness can see.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The family reads as one surface set until you measure it. Two of the three navigation moves the
true-up adopted — replace-in-place and the handle-less menu card — plus the depth cap that governs
them have **no runtime mechanism whatsoever**, so the two pairs `051` AC-003 enumerates as
converting are inexpressible today. The scrim ships at `rgba(0,0,0,0.25)` against a measured 48%,
and the parent dim is produced by two mechanisms where the captures show one. Three
`FuzzySuggestModal` subclasses hand-roll the shell's own four-call composition and are asserted by
nothing. And a set of correct measured values — the motion band, the row pitch, the pill, the chip —
sits in `surface-shell.ts` constants that a CSS custom property cannot read, so the stylesheet
carries the old numbers and no check notices.

### Purpose
Close the family: every adopted Anytype move has a producer, every measured value has one source of
truth and a lane row that reads the computed value rather than the presence of a class, and the
device pass reads one build with the blind spots named.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The stacking depth cap and the replace-in-place body producer (REQ-001).
- The `menu`-role phone presentation (REQ-002).
- The scrim level and the parent-dim composition (REQ-003).
- The FuzzySuggest disposition and lane registration (REQ-004).
- Phone row pitch, motion band, pill and chip producers, handle geometry, declared titles
  (REQ-005 to REQ-009).
- The harness and hygiene set: the gap cap, the declared height role, focus restoration, the
  replace-pair capture scenarios, the divider audit (REQ-010).
- One device pass against one build with the blind-spot checklist (REQ-011).

### Out of Scope
- `044`'s grammar contract and `048`'s stacking model as *specifications* — both bind here as
  constraints and neither is re-specified (`051` goal D4).
- The bodies of the picker, toolbar, record and state surfaces — `052`, `053`, `054` and `055` own
  them; this packet changes chrome, presentation and geometry only.
- Row 21's full-screen search flip for `BaseFileSuggestModal`. It rides the same file as REQ-004 and
  is deliberately a separate task, because a chrome route and a surface redesign are different
  blast radii.
- `design-system.md` §7's stale sentence *"There is no sheet scrim … A scrim is new construction"*.
  It has been false since `048` landed one. Named here rather than fixed, because the design system
  is the parent's document and this packet does not own it.
- Anything `050` D6 non-adopted, and the two values ADR-007 refused.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/overlay-stack.ts` | Modify | Depth cap in `register`; the registration anchor for focus restoration |
| `src/views/surface-shell.ts` | Modify | Role-driven presentation, the sub-page body producer, the declared height role, the constant bridge's source |
| `src/views/mobile-bottom-sheet.ts` | Modify | Handle geometry, the exit transition's teardown hook, `SheetChromeOptions.heightRole` |
| `src/views/popover-host.ts` | Modify | The `menu`-role card path, picker widths reading the measured constants |
| `src/views/modals/db-modal.ts` | Modify | The three remaining scrape survivors; one scrape chain, not two |
| `src/main.ts`, `src/views/image-file-suggest-modal.ts`, `src/views/markdown-file-suggest-modal.ts` | Modify | REQ-004's disposition, whichever ADR-004 takes |
| `src/views/confirm-sheet.ts` | Modify | The primary-action pill producer, if the pill lands here |
| `styles.css` | Modify | Scrim level, row pitch floor, motion band, handle geometry, pill and chip |
| `tools/live/sheet-grammar.mjs` | Modify | The new computed-value rows, the three suggest surfaces, the re-derived gap cap |
| `tools/screenshots/constructed-scenarios.mjs` | Modify | The replace-in-place capture; the three `constructed-depth3-*` scenarios re-read for the chains the cap changes |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A third stacked **sheet** cannot be registered. Registering one presents as a **replacement** of the second, and the shell carries a body producer for it, so `properties property type picker` and `add view property picker` express the replace move rather than a stack. `record column submenu` and `import confirm dropdown chain` keep `depth: 3` — both are menu-stacks, which the cap does not govern (`design-trueup.md` §6 C4) |
| REQ-002 | A surface whose declared `role` is `menu` presents on the phone as an **anchored, handle-less card**, and the presentation path reads the role rather than ignoring it. The 44px close **stays** — that is ADR-007 exception **E1**, an accessibility deviation with a measurement behind it, and REQ-002 does not reopen it |
| REQ-003 | The page under a first sheet renders at **0.519 ± 0.02** of its undimmed luminance, and a parent sheet under a stacked child **holds** at **0.710 ± 0.02** — measured at 0.717 today and not to be regressed by raising the page dim — with the `scale(0.96) translateY(4px)` cue dispositioned in `decision-record.md` rather than left design-inferred |
| REQ-004 | **Zero** direct `attachSheetChromeToModal` call sites outside `surface-shell.ts`, or a written disposition per survivor; and all three `FuzzySuggestModal` surfaces appear in `tools/live/sheet-grammar.mjs`'s registered set |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | Phone rows carry a min-height floor: `.db-panel-row` and menu rows on `body.is-phone` at **44px** minimum against the measured **50pt** target pitch |
| REQ-006 | One source of truth for the motion band: `--db-sheet-enter` at **200ms** `ease-out`, an exit transition at **150ms** `ease-in`, and a check that fails when a stylesheet value disagrees with its declared constant |
| REQ-007 | The primary action pill and the trailing header chip have **producers**, at **341.7 × 50.0pt** with ~21pt insets and **44.0 × 44.0pt** respectively, and the pill, the chip and the header block each carry a permanent lane row asserting the computed value |
| REQ-008 | The grab handle measures **34 × 5pt** at a **6pt** drop, and its rendered contrast is **measured once and recorded** — if it falls below 3:1, E1's justification is restated with our number instead of Anytype's 2.21:1 |
| REQ-009 | **20 of 20** `DbModal` subclasses declare a title, the scrape-fallback counter reads **0** for the registered set, and exactly **one** scrape chain survives |
| REQ-010 | The harness set: `HANDLE_TO_TITLE_GAP_MAX_PX` re-derived between the healthy 34.4px and the defective 74.4px; `SheetChromeOptions` carries a declared `heightRole` with the classifier as the fallback; sheet focus restoration is no longer a no-op; the replace pairs are photographed; the divider inset audited against C8's three contexts |
| REQ-011 | One device pass against **one** build closes `044` AC-006, `048` AC-009 and `051` AC-010 together, with keyboard, safe area, rubber-band scrolling and drag-to-dismiss bound to that read |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Every threshold in `acceptance-criteria.md` was **observed red on the tree at
  `6b16b87a`** before its fix landed. Each of the eleven has a red-first anchor recorded in
  `tasks.md`; none needs a failure state manufactured for it.
- **SC-002**: `npm run gate` exits 0 read from `$?`, `npx tsc --noEmit` 0, `npx vitest run` 0, and
  the registered surface and pair counts are at or above the 14 / 32 this packet opened against.
- **SC-003**: Every new lane row asserts a **computed value against the measured target**, not the
  presence of a class and not the value the tree happens to ship. The family has failed this twice:
  `hasSheetHeader` accepts either header shape and `hasSheetHandle` sees existence only, so the lane
  is green over divergences it cannot see; and two thresholds are written around the state they were
  landed on — `HANDLE_TO_TITLE_GAP_MAX_PX = 80` passes the 74.4px defect it was created for, and the
  motion band's `MOTION_BAND_TOKEN_DEFAULT_MS = 260` pins the value this packet is here to correct.
  A row that cannot go red for the reason it exists has not been written yet.
- **SC-004**: No adopted Anytype move in `design-trueup.md` §3 or §6 is left without a producer, and
  anything still unbuilt is named in `decision-record.md` with the reason.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `051`'s `surface-shell.ts` / `mobile-bottom-sheet.ts` | A concurrent leg holding either file blocks this one | One leg, one file group (`051` goal D7); sequence rather than race |
| Dependency | `styles.css` | Serialized by the parent's CSS lane | Take the lane; every leg here touches it |
| Dependency | ADR-004 (the FuzzySuggest disposition) | REQ-004 cannot start | Blocked on the operator; nothing else in the packet waits on it |
| Risk | The scrim change moves every sheet capture | H | Recapture in the same leg; the 32 protected Project Manager entries must stay `pixelHash`-identical (parent D5) |
| Risk | The portal stand-in class | H | Every `.db-*` selector is scoped `.note-database-container`; a new rule that misses the stand-in renders unstyled on a portalled sheet. Assert the computed value on the portalled node, never on a fixture |
| Risk | Engine layout timing | M | Wait on the sheet module's published settle signal, not on frames. The row-59 era lost a tap to a mid-placement sheet on WebKit; every new row inherits the resting wait |
| Risk | The depth cap breaks a live path | M | Three pairs register at depth 3 and two are menu-stacks the cap must not touch; the cap is a *sheet* cap and its negative control registers a menu-stack and requires it to survive |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The depth check runs on `register`, which already walks the parent chain; the cap
  adds no second walk.
- **NFR-P02**: No new `ResizeObserver`, `MutationObserver` or rAF loop. The frame-shape classifier
  is the family's only observer and REQ-010's declared height role reduces its work rather than
  adding to it.

### Security
- **NFR-S01**: N/A — no auth, no input crossing a trust boundary, no persisted user data. Recorded
  rather than silently skipped.

### Reliability
- **NFR-R01**: Teardown stays idempotent and restores host chrome. `be578988` hides Obsidian's own
  title and close **by reference** and restores them on teardown so a rotation back to the desktop
  presentation gets them back; nothing here may make teardown lossy.

---

## 8. EDGE CASES

### Data Boundaries
- A surface registering at depth 3 when the two above it are menu-stacks: the cap must **not** fire.
- A sheet with no declared height role: the classifier stays the fallback (REQ-010), so an
  undeclared surface behaves exactly as it does today.
- A `menu`-role surface on desktop: REQ-002 is a phone presentation and must leave the desktop
  anchored popover byte-identical.

### Error Scenarios
- A parent destroyed under an open child: already handled (`048` CHK-022) and must stay handled.
- A popped-out window with its own document: the stack is per-document; the cap is per-document too.
- `env()` resolving to 0 headless: the safe-area floor stays a literal-term check. A synthetic
  `env()` override asserts the harness, not the sheet, and is refused (`research.md` Eliminated
  Alternatives).

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 20/25 | Files: 20, LOC: ~1100, Systems: shell + stack + stylesheet + harness |
| Risk | 12/25 | Auth: N, API: N, Breaking: shared shell contract, every sheet capture |
| Research | 5/20 | Done — 10 iterations, 51 findings, `051/research/research.md` |
| Multi-Agent | 5/15 | Workstreams: 2 (navigation moves; values and harness) |
| Coordination | 10/15 | Dependencies: `051` file group, the CSS lane, one operator ruling |
| **Total** | **52/100** | **Level 3** |

`recommend-level.sh --loc 1100 --files 20 --architectural` → **72/100, confidence 82%, Level 3**;
phase score **30/50** against the 25 threshold. Both phase-qualification thresholds in
`phase-definitions.md` §2 are met independently, which is why this is one coordinated child rather
than rows scattered across three packets. Without `--architectural` the same call reads **52/100,
Level 2, phase score 20/50** — recorded so the sensitivity is visible: the flag is what carries it,
and it is earned by three cross-cutting decisions (a cap on a shared registration contract, a new
presentation path keyed on a role nothing reads, and a constants-to-stylesheet bridge).

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | The scrim change moves every mobile capture and hides a real regression in the noise | H | H | Recapture in the same leg; assert the 32 protected entries `pixelHash`-identical; read the movers by scenario, not by count |
| R-002 | The depth cap fires on a menu-stack and breaks two registered depth-3 pairs | H | M | The cap is scoped to sheets; the negative control registers a menu-stack and requires it to survive |
| R-003 | A new lane row goes green on presence rather than value, repeating F1.4 / F8.2 | M | M | Every row asserts a computed style or a measured rect, with its own negative control observed red |
| R-004 | The constants bridge silently no-ops, leaving both values live | M | M | The drift check is the deliverable, not the bridge: it must fail on a deliberate disagreement |
| R-005 | The menu-role card lands on the wrong parent treatment, because rows 26 and 31 disagree | M | H | ADR-002 names the disagreement and stays Proposed on that clause until it is measured or ruled |

---

## 11. USER STORIES

### US-001: The stack has a floor (Priority: P0)

**As a** person on a phone opening a picker from a sheet opened from a sheet, **I want** the third
surface to replace the second rather than pile onto it, **so that** the screen does not fill with
stacked chrome and I can still see what I am editing.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-001).

---

### US-002: A menu reads as a menu (Priority: P0)

**As a** person tapping a `···` on a phone, **I want** a card that hangs off the control, **so that**
a menu does not present with the grab handle that means "this is a sheet you drag".

**Acceptance criteria:** see `acceptance-criteria.md` (AC-002).

---

### US-003: A sheet reads as modal (Priority: P0)

**As a** person with a sheet open, **I want** the page behind it dimmed to the measured level,
**so that** the sheet reads as the thing I am using rather than as a card over live content.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-003).

---

## 12. OPEN QUESTIONS

- **ADR-004 / `051` T010** — do the three `FuzzySuggestModal` subclasses route through
  `createSurfaceShell`, or does the four-call dance become one shim? A question about our host, and
  no Anytype capture can answer it. The operator's.
- **The parent under a stacked menu** — `design-trueup.md` row 26 says *dimmed*, row 31 says
  *undimmed*, and both are ADOPT rows about the same move. One of them is measured off a different
  surface class. Settle it before REQ-002 lands, by re-reading the two captures rather than by
  choosing.
- **The `scale(0.96) translateY(4px)` pull-back** — design-inferred, recorded in no packet document
  as adopted or declined. ADR-003 dispositions it.
- **The `fullscreen` third mode** — implemented and stable with four users, two mid-transition.
  Implemented is not decided; carried from `051` `spec.md` §11 unchanged.
- **`051` T023** — the side-sheet lane row, deliberately untaken while one surface uses it. Confirm
  the ruling still stands or take the row. Carried, not re-decided here.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Durable directive**: See `goal.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `tasks.md`
- **Decision Records**: See `decision-record.md`
- **Research of record**: `../051-modal-and-sheet-componentization/research/research.md`
- **Measured baseline**: `../051-modal-and-sheet-componentization/design-trueup.md`

---
