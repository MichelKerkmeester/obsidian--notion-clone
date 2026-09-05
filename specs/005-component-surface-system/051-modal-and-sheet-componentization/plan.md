---
title: "Implementation Plan: Modal and Sheet Componentization"
description: "How the shell primitive and the confirm primitive are built and adopted: the composition, the legs grouped by file, the gates each leg passes, and the rollback."
trigger_phrases:
  - "051 plan"
  - "shell primitive plan"
  - "modal migration legs"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Modal and Sheet Componentization

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

The behaviour is already right. `044` landed the seven phone grammar elements, `048` landed the
stacking model and the operator's modals-as-sheets ruling (`915591c2`), and `npm run gate` reads the
twelve registered `sheet-grammar` surfaces and thirty-one registered stacked pairs green. What is
wrong is that the chrome producing that behaviour is composed at four sites out of three modules,
and a surface's sheet title is recovered by scraping its own headings.

So this is extraction under a passing gate, which is the cheapest kind and the easiest kind to get
wrong: every leg's real risk is a silent regression in a surface no check mounts. The gate lanes are
therefore the leg boundary, not the finish line.

### Overview

Four legs, grouped by file (goal D7):

1. **The shell** — `src/views/surface-shell.ts` (new), with `mobile-bottom-sheet.ts` kept as the
   engine underneath it and `db-modal.ts` delegating to it. Its geometry is `design-trueup.md`
   §2a (desktop) and §2b (phone), the latter measured for the first time by T001.
2. **The declared titles** — the seventeen `DbModal` subclasses that declare a presentation gain a
   declared title and a shell role; the scrape survives as the counted fallback.
3. **The three outliers** — `BaseFileSuggestModal`, `ImageFileSuggestModal`,
   `MarkdownFileSuggestModal`, each routed through the shell or dispositioned with a reason.
4. **The confirm primitive and the sub-page navigation** — `openAndWait` exported as the family
   confirm, and the replace-in-place-with-back pattern added to the shell.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Passing condition |
|------|---------|-------------------|
| Types | `npx tsc --noEmit` | exit 0, read from `$?` |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0 |
| Lanes | `npm run gate >/tmp/gate.log 2>&1; echo $?` | 0, with the `sheet-grammar` lane's twelve surfaces and thirty-one pairs green |
| Replay | `npm run replay` | holds, reversed 0 |
| Captures | `npm run screenshots:verify` | exit 0, every changed capture opened and read by a person |
| Packet | `validate.sh <this folder> --strict` | first `RESULT:` line PASSED |

No leg closes on a command that was merely run. A criterion closes on a number that was read.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### The shell composition

`createSurfaceShell(options)` takes a declared title, a shell role, a presentation preference and a
close callback, and returns a handle with `setSubPage`, `popSubPage` and `destroy`. Internally it
composes what four sites compose today, in one order:

| Step | Today | Under the shell |
|------|-------|-----------------|
| Decide presentation | `DbModal.applyPresentation` (`db-modal.ts:92-113`) reads `isTouchDevice` and asks `overlayStack` for a sheet parent | Same logic, one caller |
| Title | `getSheetTitle` scrapes `h1`/`h2`/`h3` (`db-modal.ts:83-88`) | Declared; the scrape is the counted fallback |
| Chrome | `attachSheetChromeToModal` (`mobile-bottom-sheet.ts:219`) from `DbModal`, or directly from three non-`DbModal` surfaces | One call, from the shell |
| Header | `createSheetHeader` (`:160`) at twelve independent sites, **two slots**: leading title, `beforeClose`, close | One call, from the shell, **three slots**: leading action, **centred** title, trailing controls then the close — the shape every Anytype sheet header uses (`design-trueup.md` §6 C6) |
| Placement | `placeSheet` + `keepSheetPlaced` | One call pair, from the shell |
| Entrance | `playSheetEntrance` (`:289`) / `carrySheetEntrance` (`:314`) | One call, chosen by the shell from the role |
| Teardown | `DbModal.onClose`'s idempotent `applySheetChrome(el, false)` (`db-modal.ts:70-79`) | Kept exactly — see NFR-R01 |

### Decisions taken in this plan

- **`mobile-bottom-sheet.ts` stays.** It is the engine and `044`/`048` assert against its behaviour.
  The shell composes it; it is not folded into the shell. Narrowing its nineteen exports is a
  deprecation with a call-site count going to zero, never a deletion.
- **The scrape survives as a counted fallback.** Removing it would make an undeclared surface
  titleless; counting its uses makes the number of undeclared surfaces visible, which is what
  actually closes REQ-002.
- **The sub-page replaces in place; it does not stack — and there are three moves, not two.**
  T001's capture read (`design-trueup.md` §3) found a stacked *sheet* and a stacked *menu* behaving
  differently, and the reference marks each: a replace keeps **one** handle at an unmoved edge, a
  stacked sheet shows **two** handles with the parent dimmed to 0.710 of its luminance, a stacked
  menu has **no** handle and leaves a desktop parent undimmed. The shell offers all three, and
  `048` REQ-002's preference still decides which a config sub-page gets.
  **The tolerance is per-axis.** The frame's width and anchored edge hold to `|Δ| ≤ 1px`; the
  cross-axis extent does not, because a desktop replace moves the popover through
  316 → 298 → 90 → 166 → 390px of height inside an invariant 360px width, while a phone replace
  moves nothing at all (`design-trueup.md` §6 C1).
- **The confirm is exported, not rebuilt.** `openAndWait` already resolves `false` on dismissal and
  is already the confirm `048`'s M-4 pair routes through. The work is the export, the grammar
  assertion and the two sibling consumers, not a new surface.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## 3b. PHASES

| Phase | Leg | Files | Gate at the boundary |
|-------|-----|-------|----------------------|
| 1 | Evidence | `design-trueup.md` (**done**), `checklist.md` | Every Today cell filled from the tree |
| 2 | The shell | `surface-shell.ts` (new), `db-modal.ts`, `mobile-bottom-sheet.ts` | Unit tests green; `sheet-grammar` unchanged |
| 3 | Consumers | 17 `modals/*.ts`, `main.ts`, the two suggest modals | Pairs green per leg; captures read |
| 4 | Confirm, sub-pages, lanes | `confirm-modal.ts`, `surface-shell.ts`, `sheet-grammar.mjs`, `styles.css` | Gate 0; replay reversed 0; parity `pixelHash` |

## 4. AFFECTED SURFACES

| Surface family | Count | Leg |
|---|---|---|
| `extends DbModal` subclasses | 20 (13 `sheet`, 4 `fullscreen`, 3 default) | 3 |
| `FuzzySuggestModal` subclasses outside `DbModal` | 3 | 3 |
| Independent `createSheetHeader` call sites | 12 | 2-3 |
| Registered `sheet-grammar` surfaces (regression gate) | 12 | every |
| Registered stacked pairs (regression gate) | 31 | every |
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:testing -->
## 5. TESTING

- **Unit**: one test per shell behaviour — presentation resolution, declared title, fallback title,
  sub-page push/pop, teardown idempotence.
- **Lane**: one permanent row per shell deliverable, each with a negative control that reverts the
  behaviour and is observed red before the green is trusted.
- **Regression**: the `sheet-grammar` lane's twelve surfaces and thirty-one pairs after every leg —
  the pairs are the check that extraction did not move behaviour. **Two pairs change shape rather
  than regress**: `properties property type picker` and `add view property picker` convert to the
  replace assertion, red-first, per ADR-002's list. **The 8pt phone frame inset moves every selector
  that reads a sheet rect**, so it lands in the same commit as those row updates and in no earlier
  leg.
- **Parity**: the board and gantt reference captures re-read before any leg touching a surface those
  renderers mount (parent goal D5).
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Direction | Note |
|---|---|---|
| `044-phone-sheet-alignment` | consumed | Seven grammar elements; constraint, not deliverable |
| `048-stacked-sheets` | consumed | Stacking model, twelve surfaces, thirty-one pairs; constraint |
| `003-mobile-sheet-presentation` | consumed | Portal, phone predicate, anchor lifetime |
| `050-anytype-adoption` | consumed | `design-trueup.md` is the design read of record |
| `052`/`053`/`054`/`055` | peers | One owner per surface; `spec.md` §7 holds the split |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK

Each leg is one commit against one file group, so rollback is `git revert` of that commit. The shell
is additive until leg 3 switches the first consumer, so legs 1-2 are reversible with no consumer
impact. The irreversible moment is the first `sheet-grammar` pair whose selector moves: that update
lands in the same commit as the markup change, so reverting one reverts both.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:effort -->
## 8. EFFORT

| Leg | Estimate | Driver |
|---|---|---|
| 1 Evidence | small | Counting, not building |
| 2 The shell | medium | New module, five behaviours, unit tests |
| 3 Consumers | large | 20 subclasses + 3 outliers + 12 header sites, each with a capture read |
| 4 Confirm, sub-pages, lanes | medium | One new navigation behaviour and the lane rows |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:user-stories -->
## 9. USER STORIES

### US-001: One shell, one definition (Priority: P0)

As the next person adding a surface, I declare what it is and get its chrome, instead of composing
four decisions from three modules and hoping the order is the one everything else used.

### US-002: A sub-page that does not stack (Priority: P0)

As a reader on a phone, I open a settings sub-page and the frame's body changes with a back
affordance in the header — the parent does not dim, scale back or move, because it is still the
surface I am looking at.

### US-003: One confirm (Priority: P0)

As a reader about to lose something, I see the same confirm wherever the loss is about to happen,
with the same header, the same close and the same 44px target on a phone.

### US-004: Nothing regressed underneath (Priority: P0)

As the operator, I find every sheet and modal behaving exactly as it did on 0.0.25, because the
thirty-one registered pairs and twelve registered surfaces were green after every leg.
<!-- /ANCHOR:user-stories -->
