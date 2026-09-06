---
title: "Research: Notion's Sheets, Modals and Dialogs as an Additive Refinement to the Plugin Surface"
description: "Digest-only extraction of Notion's phone bottom sheets, modals, dialogs and desktop modal counterparts, mapped against src/views/* and the 044/048/051 sheet grammar, ranked by user impact, with the Anytype-conflict register and a red-first remediation plan for a new child phase."
---

# Research: Notion Sheets, Modals and Dialogs vs the Note-Database Plugin Surface

<!-- SPECKIT_TEMPLATE_SOURCE: research | v1 -->

**Spec folder:** `specs/005-component-surface-system/051-modal-and-sheet-componentization`
**Now filed under:** `specs/005-component-surface-system/061-notion-sheet-refinement` — the
child this synthesis opened. The line above is the loop's own run record and reports the folder it
ran against, which was `051`; it is left standing rather than rewritten. `051`'s `research/` on
`main` holds a *different* loop — the ten-iteration sheet-family lineage that produced `067`.
**Loop:** `/deep:research:auto` · single-lineage fan-out `glm-devpass-sheets`
**Executor:** cli-opencode, model `llmgateway/glm-5.3-flash`, reasoning effort `max`
**Iterations:** 5 / 5 (stop policy: forced `max-iterations`; convergence treated as telemetry only)
**Findings:** 7 merged · **Question coverage:** 6 / 6 answered · **Avg newInfoRatio:** ≈0.51
**Sole Notion source:** `specs/005-component-surface-system/051-modal-and-sheet-componentization/notion-screens-digest.md` (77 screens; no image file was opened — none can be)

---

## 1. Executive Summary

Notion supplies exactly **one** shape this surface should adopt, and it is the highest-traffic one:
the **confirm dialog**. Notion presents confirms — identically on iOS (A4, C9) and web (G3) — as a
small centred card, margined on every edge, with **stacked full-width buttons**. Our confirm is a
full-width flush bottom sheet with side-by-side right-aligned buttons (`confirm-sheet.ts:54-71`;
`styles.css:230-232`, `8592-8598`). Anytype is *silent* here (051 design-trueup row 1, "Not seen",
across 118 iOS states and 600 menus), so this is the one place Notion fills a gap rather than
contradicting a landed ruling.

Everything else divides three ways. **We already have** Notion's stacking model, its two-deep sheet
cap, its platform split for filter/sort surfaces, its destructive-colour-by-reversibility rule, and
its single-full-width-commit pattern — each now independently corroborated by a second reference.
**Eight patterns conflict** with a landed Anytype ruling; all eight are named below with their
ruling citation and **none is overridden**. **Four checks are device-only** and stay on the
operator's existing device-pass rows.

The loop also surfaced two gaps that are *ours, not Notion's*: the rendered scrim is never measured
against AC-011's 0.519/0.710 ± 0.02 bands, and three of T015's lane rows (primary pill, trailing
chip, motion band) still do not exist. Both are in the remediation plan because the family should
not stay half-measured while a new shape lands in it.

**Headline caveat on the source:** every iOS file in the digest is a 299×678-680px thumbnail with
*named*, not sampled, colours (digest §1 scale caveat). No Notion-derived scrim, motion, or pixel
value exists to adopt. Notion's contribution here is shape and arrangement only.

## 2. Research Charter & Scope

**Question.** How should Notion's UI for phone bottom sheets, modals and dialogs (frame, handle,
header, rows, actions, stacking, scrim, motion, keyboard) and their desktop modal counterparts
refine this plugin's surface?

**Operator context (binding).** Anytype parity is the default ruling for these surfaces (051
ADR-007, 056, 057). Notion refinements are **additive**. Where the two disagree, the conflict is
named and a side is proposed with a reason — a landed operator ruling is never overridden.

**Bounded scope.** `src/views/mobile-bottom-sheet.ts`, `overlay-stack.ts`, `surface-shell.ts`,
`popover-host.ts`, `confirm-sheet.ts`, `sheet-grammar.ts`; the sheet blocks of `styles.css`;
`{044-phone-sheet-alignment, 048-stacked-sheets, 051-modal-and-sheet-componentization}/{goal.md,
design-trueup.md, decision-record.md, tasks.md}`; `design-system.md`; `roadmap.md` §6A. One extra
file was opened under the one-more-source exception: `src/views/modals/confirm-modal.ts`, required
by the top-ranked finding (iteration 002).

**Non-goals.** No implementation. No reading beyond the bounded scope. No override of a landed
ruling.

## 3. Methodology & Sources

Five iterations, each a depth pass on the classification built in iteration 001:

1. **Inventory & impact ranking** — every digest pattern mapped to the tree and classed
   IMPROVE / HAVE / CONFLICT / DEVICE / NAMED (14 rows, N1-N14).
2. **Phone-sheet concrete deltas** — file/function/value changes plus red-first thresholds for the
   top three.
3. **Stacking, scrim, motion, desktop counterparts** — the G/H/I web-dialog rows against our
   desktop shell.
4. **Conflict register and device-only checks** — eight conflicts, five checks.
5. **Remediation plan** — the child-phase task list.

Every Notion claim cites a digest screen-id; every claim about this tree cites `file:line`.
Inferences are marked **[inference]** inline and are not treated as evidence.

## 4. Ranked Improvements (Q1)

| Rank | Pattern | Digest evidence | Our state | Impact |
|---|---|---|---|---|
| 1 | **Confirm-card shape** (P6) | A4, C9 (iOS), G3 (web) — small centred card, margined all sides, stacked full-width buttons | Full-width flush sheet, side-by-side right-aligned buttons (`confirm-sheet.ts:54-71`; `styles.css:230-232`, `8592-8598`) | **5** |
| 2 | **Grouped sections** (P4) | C10, D2, E1 — grey gutter bands between rounded cards (five groups in one sheet) | Dividers inside one card via `.db-panel-row` (`styles.css:12366-12373`), matching Anytype | **3**, conditional |
| 3 | **Keyboard behaviour** (F2) | Sheet does not resize; rows below the focused field are simply covered; "Done" repeats as keyboard accessory | We *lift* via `--db-keyboard-inset` (`mobile-bottom-sheet.ts:190`; `styles.css:245`) | **3**, device-check |
| 4 | **Toast over sheet** (B5, A5) | Toast stacks over an open sheet, bottom-anchored above the input bar | Owned by `055`; z-order vs an open sheet unverified in scoped files | **2**, device-check |

Rank 1 leads because every bulk and non-undoable destructive path routes through the confirm (051
goal D5), and the current presentation diverges from *both* references' confirm family. Rank 2 is
real but blocked on a capture re-read the digest itself demands (§6 Q3). Ranks 3-4 are verification
items, not changes.

## 5. Concrete Changes and Thresholds (Q2)

### 5.1 R1 — The confirm-card

A landed ruling constrains the obvious approach: `super(app, "sheet")` (`confirm-modal.ts:44`)
cannot simply become `"dialog"`, because the shell's `dialog` presentation "stays a centred dialog
everywhere" (`surface-shell.ts:41`), which on a phone would violate **048 D1** (operator,
2026-09-05: *"Obsidian modals opened from a sheet on the phone … become stacked bottom sheets; none
stay modals"*, roadmap §6A). The proposal therefore **keeps the sheet mount** and adds a *declared*
third frame role — the same "declared, never inferred" discipline as C10's floating/flush split.

| File | Change |
|---|---|
| `src/views/surface-shell.ts` | Beside the frame-shape constants (§4, lines 156-166): `SHELL_PHONE_CARD_INSET_PX = 16` (A4's visible margin); reuse `SHELL_PHONE_FLOATING_RADIUS_PT = 16` and `SHELL_PRIMARY_ACTION_HEIGHT_PT = 50` |
| `src/views/mobile-bottom-sheet.ts` | `classifySheetFrameShape` (line 364) gains a third class `db-sheet-card`, applied **only** on a declared role from `SheetChromeOptions` — never a height inference; the ResizeObserver watcher (line 385) keeps it current |
| `src/views/modals/confirm-modal.ts` | Pass the declared card role through `createSurfaceShell`; `getShellRole()` (`:51-53`) already returns `"dialog"` — the card is its phone expression |
| `src/views/confirm-sheet.ts` | `buildConfirmSheetBody` (line 46) gains `stackedActions`; the actions row (`:54`) carries `.db-modal-actions.db-confirm-stacked`; order and `mod-warning`/`mod-cta` unchanged (`:55-72`) |
| `styles.css` | New block beside `.db-sheet-floating` (line 276): `.db-mobile-bottom-sheet.db-sheet-card { left/right: 16px; bottom: auto; top: 50%; transform: translateY(-50%); max-height: calc(90svh - 32px); border-radius: var(--db-radius-xl); }` plus scoped `.db-sheet-card .db-modal-actions { flex-direction: column; align-items: stretch; }` and `> button { width: 100%; min-height: 44px; }` |

**Desktop half (G3).** Notion uses the *same* stacked full-width footer on desktop, while non-confirm
editors keep a side-by-side footer (H3). So the footer grammar splits **by surface family, not by
platform**: `.db-confirm-stacked` is scoped to the confirm on both platforms (on desktop landing as
`.note-database-modal .db-confirm-stacked`), while the 16px card inset stays phone-only.

| Threshold | Value | Red-first proof today |
|---|---|---|
| Card inset, every frame edge | ≥ 16px | Flush: `left: 0; right: 0; bottom: 0` (`styles.css:230-232`) — measured 0/0/0 |
| Button layout | Stacked, full width of card content box | `.db-modal-actions` is `flex; justify-content: flex-end` (`styles.css:8593-8595`) |
| Button height | ≥ 44px floor, target 50pt (`SHELL_PRIMARY_ACTION_HEIGHT_PT`) | No `min-height` on `.db-modal-actions > button` today |
| Card radius | 16pt (`--db-radius-xl`) | Flush radius is top-corners-only `var(--db-radius-lg)` (`styles.css:265`) |
| Dismissal contract unchanged | Escape / outside / drag → `openAndWait` resolves `false` (`confirm-modal.ts:6-8`) | Existing; asserted by the confirm lane row (T013, 8/8 columns) |

**Gate.** Needs operator sign-off — AC-012 is the operator's row.

### 5.2 R2 — Grouped bands (parked)

Held behind the digest's own ruling (§4 P4 row, §6 Q3): *not something to build from Notion alone*.
The parked sketch: a `.db-sheet-group` wrapper per logical group, each its own rounded card
(`border-radius: var(--db-radius-lg); overflow: hidden`), with an 8px background band between groups
— the band being page background showing between two cards, not a divider inside one. Threshold if
licensed: band height 8px ± 1; groups keep the row-padding floor the grammar lane already measures
(`sheet-grammar.ts:52`, `ROW_PADDING_FLOOR_PX = 2`); no registered pair's rect assertions move
without a row update in the same commit (TASK-SYNC).

### 5.3 R3 — Scrim measurement

Declared value is `rgba(0, 0, 0, 0.25)` (`styles.css:319`). The values *of record* are Anytype's:
page under a first sheet at 0.519 of undimmed luminance, parent sheet under a stacked child at
0.710, held to ± 0.02 by AC-011 (051 design-trueup §2b; 048 parity note). **[inference]** A
0.25-alpha black scrim over a typical light page leaves content near ≈0.75 — well above the 0.519
target — and no lane row measures the rendered scrim. Notion contributes nothing measurable here
(§1 scale caveat); **the measurement itself is the task**.

### 5.4 R4 — Motion lane row

`SHELL_ENTER_MS` 200 ease-out / `SHELL_EXIT_MS` 150 ease-in (`surface-shell.ts:169-170`); entrance
is a 100% translate with ease-out (`styles.css:440-456`); the scrim fades via a one-shot keyframe
(`styles.css:461-464`). Notion carries no timing at all (digest §1: "no static image carries
timing"). T015's own account names the motion band as one of three shell deliverables with no lane
row and no harness — red-first because the rows are absent.

## 6. What We Already Have (Q3)

| Notion evidence | Our tree | Note |
|---|---|---|
| C2 — child sheet over parent; **parent's dimmed rows stay visible above the child's top edge** | `is-stack-parent` dims to 0.88, scales content 0.96 (`styles.css:295-305`); depth-derived z-order (`mobile-bottom-sheet.ts:808-821`); one shared scrim (`setScrim`, `:767-795`) | Same shape |
| C7 / C8 — two layers of chrome at once, neither a sheet | Menu-stacks registered like any surface (`overlay-stack.ts:86-125`); `isInsideSurfaceAbove` protects outside-press (`:219-229`) | |
| I5 / I7 — menus stacked over a panel's own footer, **panel undimmed** | The stacked-menu move: parent undimmed on desktop, no handle on the child (051 design-trueup §3) | |
| J7 — "Add sort" nests a narrower dropdown rather than pushing a surface | Menu-from-menu stacks satisfy the depth cap | |
| Deepest stack anywhere in the sample is **two** (C2, C11, C8) | Shell rule: no third stacked sheet; the third level replaces the second (051 design-trueup C4) | Independent corroboration |
| P7 — filter/sort/properties are sheets on phone, anchored popovers on desktop | Already split (`filter-panel-renderer.ts:259`, `sort-panel-renderer.ts:113`; 051 rows 29/33) | Kind matches; width does not — see C-G |
| P5 — destructive colour tracks **reversibility** (irreversible red + trash; "Move to Trash" default colour) | ADR-007 E3 plus the E4 undo-toast ruling draw the same line | Third independent confirmation |
| P9 — a picker's value editor is always a pushed/stacked surface, never inline | 048's 31 registered pairs; ADR-002's two converts | Third independent confirmation |
| G6 — single full-width primary, **no cancel row** (dismissal = `X` / outside) | Row 19's landed pill ruling: cancel is the close and the handle | Notion agrees with the Anytype ruling |
| G2 — desktop modal with leading back chevron, centred title, trailing `X` | Desktop popovers gained the shared close control via T011's header migration | Leading-back variant's producer still unwired (T006/T015) |
| H3 / I6 — non-confirm desktop footers side-by-side, right-aligned | `.db-modal-actions` right-aligned | Correct for editors; the confirm is the exception |
| I8 — panel anchored below its trigger, inset from edges | Anchored-popover family (`positionToolbarPopover` preset) | |
| A3 / B7 / A10 / D9 — two-line rows, icon+title+description templates | Row 29 adopted icon-tile + two-line rows for sort | |

## 7. Conflicts With a Landed Anytype Ruling (Q4)

Eight named. **One adoption, into a silence. Zero rulings overridden.**

| C# | Conflict | Ruling of record | Proposal |
|---|---|---|---|
| C-A | **Header slots.** Notion's plurality is title-only, zero actions (B1, B4, C1, C6, C10, C12, D2, D8, D9, E1); we ADOPTed Anytype's three slots with centred title (`surface-shell.ts:254-290`) | Parity by default (ADR-007, 2026-09-05); digest §5 bullet 1 | **Keep Anytype.** Notion contradicts itself — the same "View options" sheet is zero-action at C10 and "Done"-trailing at D2 — which is weak evidence against a measured, adopted rule |
| C-B | **Close affordance.** Notion splits ~50/50 explicit-close vs handle-only, no rule (A3/A11/B7 vs B4/C1/C6) | 044 REQ-007 / ADR-007 E1: 44px close, refused handle-only on the handle's 2.21:1 contrast; digest §5 bullet 2: "the accessibility number … does not move" | **Keep the 44px close.** Notion corroborates neither side |
| C-C | **Grouped sections.** Notion iOS uses gutter bands between cards (C10, D2, E1); our `.db-panel-row` divider grammar matches Anytype | Parity by default; digest §5 bullet 3: "nothing here licenses adopting it" | **Keep dividers**; run the §6 Q3 capture re-read as an operator question before any band is built |
| C-D | **Confirm shape.** Anytype silent (row 1, "Not seen"); Notion consistent on both platforms (A4, C9, G3) | E4 closed the *whether* ("No confirm for single delete, Undo toast"); the *shape* of the surviving bulk/non-undoable confirm is open (AC-012) | **Adopt Notion** — the one place it fills a silence rather than contradicting a ruling — as §5.1's declared card role, with operator sign-off |
| C-E | **Desktop side panel.** Notion's config panels float, content-sized, inset (I4 ~190px, I10 ~340px); only comments/inbox (I11) is edge-flush | Operator: *"Keep the overlay"* (2026-09-06 ~10:55, ADR-008 amendment; roadmap §6A) — dated after both true-ups, closes AC-013 | **No action.** Recorded: our shipped 420px edge-docked shape is closer to Notion's I11 outlier than to its config-panel norm. Worth remembering only if a *second* config surface adopts the shape (T023's revisit condition) |
| C-F | **Commit placement.** Notion C11 uses trailing "Save" header text; our ruling is Anytype's full-width pill commit row | Row 19 FLIPPED | **Keep the pill.** Named divergence |
| C-G | **Desktop builder width.** Notion keeps filter/sort builders to single/double-row anchored dropdowns (J2-J8); our condition panels are 440-560px | Already-open conflict, `roadmap.md` §7.11; the digest declines to widen it | **No new action.** Owned where it already lives |
| C-H | **Keyboard.** Notion covers rows below the focused field (F2); we lift the sheet | No Anytype measurement of keyboard behaviour exists in the true-up | **Keep the lift**, verified on device (D-A). The lift is the accessibility-friendlier behaviour **[inference]**, and no ruling says otherwise |

## 8. Device-Only Checks (Q5)

| D# | Check | Measure on device | Red-first condition |
|---|---|---|---|
| D-A | **Keyboard-open sheets** (F2) | With the software keyboard open on the filter sheet's value field: focused input rect fully inside the visual viewport; sheet top edge ≥ 0 | Run the resting-wait probe with a reduced `visualViewport`; **no check asserts focused-input visibility today — the absence is the red** |
| D-B | **Frame-shape classification** | A2's date sheet (~90%) must classify flush; A3's change-access sheet (~55%) and A10's card must classify floating; B1's mid-size sheet floats with visible bottom margin | Cutoffs are floating ≤ 0.716, flush ≥ 0.746 (`mobile-bottom-sheet.ts:321, 338, 342`); A2 at 0.9 and A3 at 0.55 land correctly **[inference from the constants]** — verify a real keyboard/rotation does not flip a sheet across the 3% hysteresis band mid-interaction |
| D-C | **Toast over sheet** (B5) | `055`'s undo toast renders above an open sheet's scrim; tapping it does not dismiss the sheet | Not measurable in the scoped files; treat as unverified until exercised on device. Cross-packet — coordinate with `055`, do not edit its files |
| D-D | **Scrim luminance** | Rendered scrim vs AC-011's 0.519 / 0.710 ± 0.02, light and dark, both engines, single-sheet and stacked-parent | `styles.css:319` declares 0.25 alpha; no lane measures the rendered value — measurement absence is the red |
| E-D | **Dark theme** | — | **Impossible from the sole source.** Zero dark-theme sheet/menu/dialog captures exist in the entire 3,647-file Notion harvest (digest §1, K1/K2). A targeted re-harvest with dark mode toggled is the precondition (§6 Q5) |

All four runnable checks attach to the **existing** operator device-pass rows (044 AC-006, 048
AC-009, 051 AC-010) rather than inventing a fourth owner. None is agent-closable.

## 9. Named, Not Actioned

- **N4 — unsaved-state signalling** (D3/D4/C1/D7): a dot on the filter pill, an orange "Save for
  everyone" banner, accent-blue text on rows with a rule set. Belongs to `053`'s condition rows
  (051 rows 29/33 already route row shapes there). Recording only.
- **N11 — trailing text actions** (A8/A9/C11): the mechanism already exists
  (`SheetHeaderOptions.beforeClose`, `mobile-bottom-sheet.ts:143`; `surface-shell.ts:260-288`); the
  adoption is refused by C-F.
- **N14 — dark-theme capture gap:** a Notion-side gap, not ours. No action.

## 10. Desktop Modal Counterparts — What Transfers

Only one thing transfers as a change: **G3's stacked confirm footer**, which is the desktop half of
R1 and the reason the footer grammar splits by surface family rather than by platform. Everything
else in the G/H/I rows either already matches (G2 close control, H3/I6 editor footers, G6 single
commit, I8 anchoring) or is settled by ruling (C-E side panel, C-G builder width). Notion's
two-pane floating panel (G4/I3) has no scoped consumer, and the workbench that resembles it
(FormulaModal) is `fullscreen` by ADR-004 and stays ours.

## 11. Recommendations — Ranked Remediation Plan (Q6)

Proposed child phase: **`059-notion-sheet-refinements`** (working title). Format follows 051's task
notation (threshold + red-first proof + source per task). Sequencing respects D7 (one leg, one file
group) and every ruling boundary in §7.

**Scope statement.** Land the refinements the digest supplies where Anytype is silent, and close the
measurement gaps the loop found — without overriding any landed ruling (044 REQ-007/E1, 048
D1/ADR-002/ADR-003, 051 ADR-004/ADR-007/ADR-008, roadmap §6A and §7.11).

| # | Task | Thresholds | Red-first proof | Gate |
|---|---|---|---|---|
| **R1** | **Confirm-card.** (a) declare the card role on `SheetChromeOptions` + `classifySheetFrameShape` (`mobile-bottom-sheet.ts:64-94, 364`); (b) stamp it from the shell (`SHELL_PHONE_CARD_INSET_PX = 16`; `confirm-modal.ts:44` keeps `super(app, "sheet")`); (c) `stackedActions` on `buildConfirmSheetBody` (`confirm-sheet.ts:46-72`); (d) the `styles.css` `.db-sheet-card` + scoped `.db-confirm-stacked` block | Inset ≥ 16px every side; actions stacked full-width, each ≥ 44px (target 50pt); radius `--db-radius-xl`; `openAndWait` still resolves `false` on Escape/outside/drag | Record today's flush 0/0/0 and side-by-side right-aligned figures (`styles.css:230-232`, `8592-8598`) before the change | Extend `sheet-grammar.mjs`'s confirm row (T013) with the card columns; negative control: strip the card class, require red. **Operator sign-off (AC-012)** |
| **R2** | **Close T015's three missing lane rows** — primary pill, trailing chip, motion band | Pill width = content box, height 44-50pt, ≈21pt inside sheet edges; chip 44×44 ± 1; transitions 200ms ease-out enter / 150ms ease-in exit on a mounted sheet | The rows do not exist (T015's own account) | Permanent rows with negative controls, measured against `surface-shell.ts:145-170`. **No Notion contribution** — 051's own debt |
| **R3** | **Scrim measurement and reconciliation** — light+dark, both engines, single-sheet and stacked-parent; reconcile `rgba(0,0,0,0.25)` against AC-011 | 0.519 / 0.710 ± 0.02 | No lane measures the rendered scrim today | Add the permanent lane row. Source: 051 design-trueup §2b + 048 parity note |
| **R4** | **Device-check bundle** — D-A, D-B, D-C from §8 | As tabulated in §8 | As tabulated in §8 | Add to 044 AC-006 / 048 AC-009 / 051 AC-010. **Operator-only; not agent-closable** |
| **R5** | **Grouped-band decision** — re-read Anytype's own multi-section sheets (digest §6 Q3), then decide dividers vs bands | n/a while parked | n/a — a decision task whose evidence is the re-read | Only if licensed, adopt §5.2's sketch |
| **R6** | **Named, not actioned** — C-A/C-B/C-C/C-E/C-F/C-G/C-H plus N4 and N14, each with its ruling citation | — | — | Permanent register. **Never a task** |

**Sequencing.** R2 first (pure measurement, no surface change — it establishes the phase's own
red-first discipline) → R1 (the surface change; its lane row lands with it per TASK-SYNC) → R3
(independent; CSS lane serialized) → R4 after R1 lands (the device pass should see final shapes) →
R5 whenever the operator schedules the re-read → R6 never.

## Eliminated Alternatives

Negative knowledge from the run itself, so a later loop does not repeat these:

| Approach | Reason Eliminated | Evidence | Iteration(s) |
|---|---|---|---|
| Deriving any Notion scrim, motion, or pixel value | Source-impossible: every iOS file is a 299×678-680px thumbnail and colours are *named*, not sampled | Digest §1 scale caveat | 1, 2, 3 |
| Reading the screen PNGs to cross-check the digest | Executor cannot read image files; the digest is the only Notion channel by operator dispatch | Operator instruction; executor limitation | 1 |
| Re-presenting `ConfirmModal` via the shell's `dialog` presentation | Violates 048 D1 — `dialog` "stays a centred dialog everywhere" (`surface-shell.ts:41`), and phone modals must become stacked sheets | 048 D1 (operator, 2026-09-05); roadmap §6A | 2 |
| Adopting Notion's trailing "Save"/"Done" header text as a commit control | Contradicts the landed full-width-pill ruling | 051 design-trueup row 19 FLIPPED | 2 |
| Building the gutter-band grouping now | No Anytype backing under "parity by default"; the digest itself demands a capture re-read first | Digest §4 P4 row, §6 Q3 | 2, 4 |
| Adopting a Notion-style two-pane floating panel (G4/I3) | No scoped consumer; the closest surface (FormulaModal) is `fullscreen` by ADR-004 | ADR-004 | 3 |
| Reopening the side sheet, condition-panel widths, or header/close rules | Settled by ruling | ADR-008 amendment; roadmap §7.11; ADR-007 E1/C6 | 3, 4 |

## Divergence Map

This lineage ran under `convergence_mode: default` with `stop_policy: max-iterations`. The
5-iteration count was a fixed operator instruction, not a convergence-driven decision. No Council
pivot occurred and none was triggered: the newInfoRatio series (1.0, 0.6, 0.4, 0.3, 0.25) averages
**≈0.51** and never approached the 0.05 threshold, so the cap — not exhaustion — is what stopped
the run. The declining series is the normal broadening-to-consolidation pattern: iterations 1-3
opened new ground, 4-5 consolidated it into decision-ready form.

**Saturated directions:** Notion-derived quantitative values (scrim, motion, pixels) — saturated at
iteration 1 by the source's own scale caveat, and re-confirmed twice; no further reading can change
it.

**Remaining frontier** — what a follow-up lineage should pick up first: per-surface design reads
beyond the six scoped view files (the bounded scope held throughout, so the space is *not*
exhausted); Anytype's own multi-section sheets for the C-C decision; and a dark-mode Notion
re-harvest, which is the precondition for any dark-theme parity claim.

## 12. Open Questions

All six charter questions were answered within scope. The items below are questions this run
*surfaced*, not gaps in the charter:

- **AC-012 — the confirm's shape.** R1 is a proposal, not a decision. The operator's row owns it.
- **C-C — dividers or gutter bands?** Blocked on the Anytype multi-section capture re-read (digest
  §6 Q3). Cannot be settled from Notion alone.
- **Does the rendered scrim actually meet AC-011?** The declared 0.25 alpha does not visibly derive
  from either band **[inference]**; R3 is the measurement that answers it.
- **Does the keyboard lift ever push a sheet off-screen?** T012's third landing measured a WebKit
  sheet resting 73px below the viewport mid-placement; D-A is the check.
- **Notion dark theme.** Unanswerable — zero dark captures exist in the harvest (K1/K2).
- **Does `055`'s toast clear an open sheet's z-order?** Cross-packet; D-C.

## 13. Confidence and Limitations

**High confidence:** the "already have" set (§6) — each item is a direct `file:line` ↔ screen-id
correspondence, and several are now third independent confirmations. The conflict register (§7) —
each row carries its ruling citation.

**Medium confidence:** the R1 delta's exact CSS values. The shape is well-evidenced (three screens,
two platforms), but the 16px inset is read off a thumbnail proportionally, not sampled.

**Low confidence / explicitly inferential:** the scrim-luminance estimate in §5.3, the frame-shape
classification cross-check in D-B, and the claim that the keyboard lift is the accessibility-friendlier
behaviour (C-H). All three are marked **[inference]** and each is written as a *measurement task*
rather than a finding.

**Structural limitation:** one source, no images, no sampled colour, no timing. Notion's contribution
to this surface is shape and arrangement only — which is precisely why exactly one change (R1) comes
out of 77 screens.

## 14. Convergence Report

- **Stop reason:** `maxIterationsReached` (5/5), per the operator's fixed-count instruction. The
  0.05 convergence threshold was never crossed and was treated as telemetry only for the whole run.
- **Total iterations:** 5 · **Merged findings:** 7 · **Questions answered:** 6 / 6 (Q1-Q6).
- **newInfoRatio series:** 1.0, 0.6, 0.4, 0.3, 0.25 — average ≈0.51.
- **Iteration focus:** (1) inventory + impact ranking, (2) phone-sheet concrete deltas, (3)
  stacking/scrim/motion + desktop counterparts, (4) conflicts + device checks, (5) remediation plan.
- **Quality guards:** every claim carries a `file:line` or a digest screen-id; every inference is
  marked; the bounded scope held, with one documented one-more-source exception
  (`src/views/modals/confirm-modal.ts`, iteration 2).
- **Executor route-proof:** `cli-opencode` (detached fan-out lineage, model
  `llmgateway/glm-5.3-flash`, reasoning effort `max`), label `glm-devpass-sheets`, session
  `fanout-glm-devpass-sheets-1788705439278-6u12t7`, executable
  `sha256:f554a08dee4c34f4f43df63af72f0a6afbe57f955496853f411767718927bf2c`.

## 15. Run History

1. **Dispatch attempt 1 — failed, discarded.** The lineage subprocess exited 1 after ~750ms with
   empty stdout *and* stderr. Diagnosed with a temporary PATH shim, which proved the constructed
   `opencode run` invocation was correct; the failure signature is consistent with the detached
   spawn, not the CLI. No iteration artifacts were produced.
2. **Dispatch attempt 2 — discarded despite succeeding.** Ran and iterated correctly, but the
   diagnostic shim was still on `PATH`, so `invocation-metadata.json` recorded the shim's hash
   (`sha256:521a6d26…`) instead of the real binary's. Stopped and deleted rather than ship a
   falsified provenance record.
3. **Dispatch attempt 3 — this document's source lineage.** Shim removed, packet reset, relaunched.
   Ran cleanly to `maxIterationsReached` at 5/5 with zero salvage failures and the correct
   executable fingerprint (`sha256:f554a08d…`, matching the `047` reference run).

**Known artifact defects in this packet, recorded rather than silently repaired:**

- **Lineage state timestamps are synthetic.** The run summary flags 8 anomalous and 1 untimestamped
  record in `lineages/glm-devpass-sheets/deep-research-state.jsonl` (e.g. `2026-09-06T00:00:01Z`
  against a real window of `14:37:19Z`-`14:55:28Z`). The executor authored placeholder times. The
  *content* is unaffected; the timestamps are not evidence of anything.
- **`resource-map.md` was not emitted.** `reduce-state.cjs --emit-resource-map` fails closed here:
  this worktree's `.opencode` is a symlink into a shared skills repo, so `findRepoRoot(__dirname)`
  resolves the repo root to that shared repo and `resolveArtifactRoot` then rejects this project's
  `specs/` as outside the approved roots. Environmental, not a research gap — `research.md` is
  unaffected, and `resource_map_present` was `false` at init so no map is cited in §16.
- **`fanout-attribution.md` shows `kind: unknown / model: unknown`** for the lineage. The merge
  script did not read them back; the true values are in `lineages/glm-devpass-sheets/invocation-metadata.json`
  and restated in §14.

## 16. References

**Sole Notion source:** `specs/005-component-surface-system/051-modal-and-sheet-componentization/notion-screens-digest.md`
— 77 screens across iOS (A-F), web (G-J) and theme-coverage (K) groups, written by an image-capable
analyst from the Mobbin captures. No image file was opened by this loop.

**This repository (implementation):** `src/views/mobile-bottom-sheet.ts`, `src/views/overlay-stack.ts`,
`src/views/surface-shell.ts`, `src/views/popover-host.ts`, `src/views/confirm-sheet.ts`,
`src/views/sheet-grammar.ts`, `src/views/modals/confirm-modal.ts` (one-more-source exception),
`styles.css` (sheet, header, row and action blocks).

**This repository (design record):** `specs/005-component-surface-system/044-phone-sheet-alignment/`,
`048-stacked-sheets/`, `051-modal-and-sheet-componentization/` (goal, design-trueup, decision-record,
tasks), `specs/005-component-surface-system/design-system.md`, `roadmap.md` §6A (and §7.11 for the
already-open builder-width conflict).

**Related packets referenced but not read:** `053` (condition rows — owner of N4), `055` (toast/undo
vocabulary — owner of D-C), `056` / `057` (parity rulings cited via 051 ADR-007).

**Generated artifacts from this run:** `research/lineages/glm-devpass-sheets/` (full trail:
`deep-research-state.jsonl`, `deep-research-strategy.md`, `deep-research-dashboard.md`,
`iterations/iteration-001.md`-`005.md`, `deltas/iter-001.jsonl`-`005.jsonl`, `findings-registry.json`,
`research.md`, `invocation-metadata.json`), `research/findings-registry.json` (merged),
`research/fanout-attribution.md`, `research/orchestration-summary.json`. No `resource-map.md` — see §15.

## 17. Machine State (do not hand-edit)

Reducer-owned anchors are refreshed from `findings-registry.json`, `deep-research-state.jsonl`, and
`deep-research-strategy.md` under `research/` and `research/lineages/glm-devpass-sheets/`. This
section exists so a future reducer run can locate and refresh those anchors without mutating the
synthesis above.

<!-- ANCHOR:deep-research-notion-sheets-source -->
<!-- ANCHOR:findings -->
<!-- ANCHOR:convergence-report -->
