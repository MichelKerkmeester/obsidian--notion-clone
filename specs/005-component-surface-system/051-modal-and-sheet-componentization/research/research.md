---
title: "Feature Research: the phone-sheet family (044 / 048 / 051) — remaining defects and parity gaps against Anytype's mobile sheets"
description: "Deep-research synthesis of the note-database plugin's phone-sheet family: which grammar elements still diverge from the measured Anytype sheet, which surfaces bypass the shell, where the lane has no permanent row, which iOS/WebKit behaviours the Chromium harness cannot see, and a ranked remediation plan with thresholds and red-first checks."
trigger_phrases:
  - "research findings"
  - "evidence and citations"
  - "open questions"
  - "research synthesis"
  - "phone sheet parity"
  - "sheet family defects"
importance_tier: "normal"
contextType: "general"
---
# Feature Research: the phone-sheet family (044 / 048 / 051) — remaining defects and parity gaps

Deep-research synthesis feeding an Opus pass that will update or add phases across
`044-phone-sheet-alignment`, `048-stacked-sheets` and `051-modal-and-sheet-componentization`.

<!-- SPECKIT_TEMPLATE_SOURCE: research | v1.0 -->

---

## 1. METADATA

- **Research ID**: RESEARCH-051-T025
- **Feature/Spec**: `specs/005-component-surface-system/051-modal-and-sheet-componentization`
  (siblings `044-phone-sheet-alignment`, `048-stacked-sheets`)
- **Status**: Complete
- **Date Started**: 2026-09-06
- **Date Completed**: 2026-09-06
- **Loop**: `/deep:research:auto`, fan-out, 1 lineage × 10 iterations, `stopPolicy: max-iterations`
- **Executor**: `cli-opencode`, `llmgateway/glm-5.3-flash`, `reasoningEffort: max`, label `glm-devpass`
- **Stop reason**: `maxIterationsReached` (10 of 10 — convergence treated as telemetry only, by
  operator instruction; `newInfoRatio` never fell below the 0.05 threshold)
- **Findings merged**: 51 (`findings-registry.json`, one lineage, no cross-lineage conflicts)

**Provenance and how to read the citations.** Every `file:line` and every measured value in this
document is carried forward from the lineage's ten iteration files, which read a bounded,
operator-supplied file list. Citations are the lineage's; this synthesis consolidates, ranks and
deduplicates them but did not re-derive line numbers. Claims the lineage marked as inference are
marked as inference here (§12.3 carries the full register). No image file was opened at any point —
all Anytype values are the recorded measurements in `051/design-trueup.md`.

**Related documents**:
- Lineage report: `research/lineages/glm-devpass/research.md`
- Per-iteration evidence: `research/lineages/glm-devpass/iterations/iteration-001.md` … `-010.md`
- Merged registry: `research/findings-registry.json` · attribution: `research/fanout-attribution.md`
- Resource map: `research/resource-map.md`
- Convergence report: `research/lineages/glm-devpass/research/convergence-report.md`

---

## 2. INVESTIGATION REPORT

### Request Summary

The phone-sheet family has had three phases of work land (044 alignment, 048 stacking, 051
componentization) and the operator has filed four defect reports against it, the most recent on
2026-09-06 at 10:04 on iOS ("this sheet is really bad bugged"). The question this research answers:
after everything that has landed, **what is still actually wrong**, measured against the Anytype
values already recorded in `051/design-trueup.md`, and what would a ranked, red-first remediation
plan look like as concrete phase tasks?

### Current Behavior

The family is largely converged and the recent reports are largely explained. The frame, the
three-slot centred header, the stacking mechanism, horizontal overflow and the confirm primitive
all hold at this tree. What remains is a small, specific set: **two adopted navigation moves that
were never built** (the depth cap with replace-in-place, and the handle-less menu-role card), **a
scrim at roughly half the measured strength**, **three surfaces that bypass the shell**, and a
cluster of declared-but-unused constants (motion, row pitch, pill, chip) whose correct values sit
in TypeScript where CSS cannot read them.

### Key Findings

1. **The two unshipped navigation moves are the largest remaining user-facing gap.** The depth cap
   ("no third stacked sheet; the third replaces the second") is adopted in `design-trueup.md`
   §6 C4 (`:344-346`, `:349`) and implemented nowhere: `register` derives `parentId` with no depth
   check (`overlay-stack.ts:94-96`) and `getDepth` walks the chain unbounded (`:194-209`). The
   replace-in-place move exists only as a header title swap and a back control
   (`surface-shell.ts:200-231`, `:428-432`) with no body producer — so the two converted pairs
   (`properties property type picker`, `add view property picker`) are **inexpressible today**.
2. **The scrim is at 25% where the captures measured ~48%.** `.db-mobile-sheet-scrim` is
   `rgba(0,0,0,0.25)` (`styles.css:315-322`); the recorded measurement for content under a first
   sheet is 0.519 luminance across three bands (`design-trueup.md` §2b). The stacked-parent dim is
   numerically close (~34% effective vs 29% measured) but is produced by **two** mechanisms — scrim
   × `is-stack-parent` opacity 0.88 × `scale(0.96)` (`styles.css:295-305`) — where the measurement
   is one dim. No lane row asserts scrim opacity at all.
3. **The shell bypass set is exactly three surfaces, and they are measured by nothing.** All 20
   `extends DbModal` subclasses route through `createSurfaceShell` (`db-modal.ts:120-133`). The
   three `FuzzySuggestModal` subclasses each hand-roll the same four-call dance
   (`main.ts:3047`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34`) and
   therefore ship the two-slot header, skip the 048 stack rule, skip declared-title counting, and
   appear in none of the lane's 14 registered surfaces (`sheet-grammar.mjs:65-107`).
4. **The correct measured values are already in the codebase and unused.** `SHELL_ENTER_MS = 200`,
   `SHELL_EXIT_MS = 150`, `SHELL_PHONE_ROW_HEIGHT_PT = 50`, `SHELL_PHONE_HEADER_HEIGHT_PT = 70`,
   `SHELL_PRIMARY_ACTION_HEIGHT_PT = 50`, `SHELL_TRAILING_CHIP_SIZE_PT = 44`
   (`surface-shell.ts:139-170`). The stylesheet ships 260ms with **no exit transition at all**
   (`styles.css:130`, `:440-456`) and `.db-panel-row` with no min-height (`styles.css:12366-12373`).
   A CSS custom property cannot read a TS constant and no bridge exists.
5. **One lane threshold admits the very defect it was created for.** `HANDLE_TO_TITLE_GAP_MAX_PX = 80`
   (`sheet-grammar.mjs:222-228`) was added by the row-59 leg, whose defect state measured **74.4px**
   in the harness. 74.4 < 80, so a regression restoring the dead band passes the numeric column.
   (The permanent `constructed-modal-sheet-*` pixelHash scenarios do still catch it.)

### Recommendations

**Primary recommendation**: treat the family as *nearly* closed and spend the next phase budget on
the four P0 items in §11 — the depth cap and replace move, the menu-role card, the scrim level, and
the T010 disposition. Each has a threshold and an assertion that is **red on the current tree**, so
each can be run red-first without inventing a failure state.

**Alternative approaches considered**:
- *Close the family on the device pass alone and defer the rest.* Cheaper, but leaves the two
  unshipped navigation moves as permanent silent debt — they are the only adopted Anytype patterns
  with no producer whatsoever.
- *Bridge the constants first (P2-2) and let the values follow.* Attractive ordering, but the
  bridge is invisible to the user; the scrim and the row pitch are visible on every sheet.

---

## 3. EXECUTIVE OVERVIEW

### Executive Summary

Three phases of sheet work have taken the phone-sheet family from "sheets look like the old ones"
to near-parity with the measured Anytype grammar. The frame geometry matches (8px inset / 16px
radius floating, edge-to-edge top-corners-only flush), the three-slot centred header is real and
measured at 0.01px centre error, the stacking model registers, derives depth, and places one scrim
between parent and child on both engines, and the horizontal-overflow report is closed by a
red-first sweep that drove 316 failures to zero.

What remains splits cleanly into three groups. **Unshipped decisions**: two of the three adopted
navigation moves — replace-in-place and the handle-less menu card — plus the depth cap have no
runtime mechanism at all. **Live numeric divergences**: the scrim at 25% against a measured 48%,
row pitch with no floor against a measured 50pt, entrance motion at 260ms with no exit against a
reconciled 200/150ms band, and a handle at 36×4px/8px against a measured 34×5pt/6pt. **Coverage
holes**: eight deliverables with no permanent lane row, three shipping sheets registered nowhere,
and one threshold loose enough to pass its own defect.

The 2026-09-06 10:04 iOS report is fully mechanised: all four symptoms (duplicate close control,
split header/body backgrounds, blank space above the title, apparent parent bleed) trace to one
producer set, and all four fixes are in the tree with permanent red-first coverage. Only the
device read is outstanding — and one commit-id discrepancy needs reconciling before that read is
recorded.

### Architecture Diagram

```
                        ┌──────────────────────────────────────────┐
   20 DbModal           │  createSurfaceShell (surface-shell.ts)   │
   subclasses  ────────▶│  presentation → chrome → header →        │──┐
   (all routed)         │  placement → keyboard reposition →       │  │
                        │  teardown, in one order                  │  │
                        └──────────────────────────────────────────┘  │
                                                                      ▼
   3 FuzzySuggestModal      ┌───── BYPASS ─────┐        ┌──────────────────────────┐
   subclasses  ────────────▶│ isTouchDevice →  │───────▶│ attachSheetChromeToModal │
   main.ts:3047             │ attachSheetChrome│        │ (mobile-bottom-sheet.ts) │
   image-file-suggest:40    │ → placeSheet →   │        └──────────────────────────┘
   markdown-file-suggest:34 │ keepSheetPlaced  │                     │
                            └──────────────────┘                     ▼
                                                        ┌──────────────────────────┐
   11 self-composing        buildShellHeader            │  overlayStack.register   │
   surfaces (toolbars,  ───▶ (header shape only,        │  (overlay-stack.ts)      │
   pickers, record head)     rest re-assembled)         │  parentId = top sheet    │
                                                        │  ✗ NO DEPTH CAP          │
                                                        └──────────────────────────┘
```

### Quick Reference Guide

**Use this document to**:
- Decide which of 044 / 048 / 051 absorbs each remaining task (§13.1 carries a mapping suggestion).
- Write phase tasks with a threshold and a red-first check already attached (§11).
- Avoid re-opening what already holds (§3, "What already holds").

**Do NOT use this document to**:
- Settle T010 or the fullscreen third mode — both are explicitly the operator's decisions (§12.1).
- Adjudicate the commit-id discrepancy (§12.1, item 4) — this needed git reads the lineage's
  contract excluded.
- Claim device behaviour. Nothing here was observed on a device (§6).

**What already holds** (so the synthesis does not re-open it):

| Element | State | Evidence |
|---|---|---|
| Frame geometry (floating + flush) | parity held | `styles.css:86`, `:90`, `:224-283`; trueup §8a, §6 C5/C10 |
| Frame-shape classifier + hysteresis | live | `mobile-bottom-sheet.ts:321-431` |
| Three-slot centred header | landed, 0.01px centre error | `styles.css:12295-12344`; 11 of 12 `createSheetHeader` sites migrated |
| Stacking: register / depth / scrim-between / z-monotone | verified, both engines | `overlay-stack.ts:194-209`; `mobile-bottom-sheet.ts:811`, `:785-787` |
| Two-handle stacked affordance | matches captures | `styles.css:295-305`; trueup §3 move 2 |
| Row-59's four symptoms | fixed in tree, permanent coverage | `mobile-bottom-sheet.ts:246-263`; `styles.css:21663-21669`; `sheet-grammar.mjs:1416-1421` |
| Horizontal overflow | closed red-first (316 → 0) | `styles.css:12790-12795`; 044 AC-009 |
| Confirm primitive | one exported path, verified | `confirm-sheet.ts:46-72`; `confirm-modal.ts:37-119` |
| Keyboard placement emulation | already exists | `verify-placement.mjs`; `044/goal.md:96-107` |
| Segmented choices | no divergence found | `sheet-grammar.ts:146-161` |

### Research Sources

| Source Type | Description | Reference | Credibility |
|---|---|---|---|
| Measured baseline | Anytype values recorded from captures | `051/design-trueup.md` §2a/§2b/§8a, §6 C1–C10 | High (measured, recorded) |
| Production source | Sheet, shell, stack, popover, grammar modules | `src/views/*` (10 files) + `db-modal.ts` | High (read directly) |
| Stylesheet | Sheet blocks by class grep | `styles.css` (~lines 31-470, 3156-3213, 12130-12424, 12775-12830, 21635-21700) | High (read directly) |
| Harness | Lane registry, probes, stand-ins, placement | `tools/live/sheet-grammar.mjs`, `host-modal-stand-in.ts`, `tools/storybook/verify-placement.mjs` | High (read directly) |
| Packet documents | 044 / 048 / 051 goal, tasks, ACs, decisions | 14 spec files | High |
| Roadmap | §4 rows 40, 41, 43, 59; §6A; §5 phase status | `specs/005-component-surface-system/roadmap.md` | High |
| Screenshot index | Anytype capture descriptions only | `screenshots/anytype/README.md` | Medium (descriptions, no image reads) |

**Containment**: 16 bounded sources + exactly 1 justified extra (`db-modal.ts`, taken in iteration 3
because AC-001's presentation switch lives there). Zero image reads. Zero writes outside the
lineage directory during the loop.

---

## 4. CORE ARCHITECTURE

### Component 1: `createSurfaceShell` — the composition primitive

**Purpose**: own presentation resolution, chrome, header, placement, keyboard-aware reposition and
teardown in one order (`surface-shell.ts:400-421`, module comment `:6-16`).

**Finding F2.1 — it has exactly one production consumer.** `createSurfaceShell(` is called from
`db-modal.ts:122` and nowhere else in non-test code. Eleven other surfaces call `buildShellHeader`
directly and re-assemble the rest per surface: `owned-menu.ts:338`, `toolbar-renderer.ts:633` and
`:1794`, `chart-toolbar-renderer.ts:344/534/701/912`, `calendar-toolbar-renderer.ts:91`,
`calendar-timeline-toolbar-renderer.ts:72`, `record-surface/record-header.ts:127`,
`record-surface/cell-editor-relation.ts:93`, `toolbar-primitives.ts:113`, `popover-host.ts:174`.
They get the header *shape* but not the composition — `goal.md` §1's "one surface's chrome is four
decisions taken in four files" persisting inside the migrated files. *(Inference from the call-site
shape; per-file verification was not performed.)*

### Component 2: `overlayStack` — registration, depth, dismissal

**Purpose**: register surfaces per document, derive stacking depth, route Escape and outside-press
dismissal LIFO, restore focus.

**What holds**: depth-to-z is monotone — sheet z is `baseZ + max(0, depth-1)*2`
(`mobile-bottom-sheet.ts:811`), scrim at `topZ - 1` (`:785-787`); row 59 measured parent 1000 /
scrim 1001 / child 1002. Dismissal routes only to the top surface per document
(`overlay-stack.ts:271-288`); `isInsideSurfaceAbove` stops a press inside a child from closing its
parent (`:219-229`).

**What diverges**:
- **F5.1 — no depth cap exists anywhere in the API.** Searched `register` / `dismiss` / `getDepth`;
  the only depth-related guard is the cycle-protected parent walk (`overlay-stack.ts:199-207`).
- **F5.2 — parent derivation is document-wide.** `parentId: options.parentId ?? this.getTopSurfaceForDocument(doc, { sheetsOnly: true })?.id`
  (`overlay-stack.ts:96`) — no leaf or view scoping. *(Inference: with two databases side by side,
  a sheet opened in view B while view A holds a sheet registers depth 2 under A's sheet. Harmless
  on a single-leaf phone; a real false-stack on desktop split panes. Not observed.)*
- **F5.4 — focus restoration is a no-op for every sheet.** `restoreFocus` requires a registered
  anchor (`overlay-stack.ts:307-311`); sheet registration passes none
  (`mobile-bottom-sheet.ts:525-536`).

### Component 3: `attachSheetChromeToModal` — the sheet chrome path

**Purpose**: handle, header, scrim, placement, drag-to-dismiss, portal mount.

**Portal and stand-in (F1.12)**: the sheet portals to `body` with a `note-database-container`
stand-in class (`mobile-bottom-sheet.ts:514-588`); the comment itself calls re-keying rules to the
surface "the right long-term answer" (`:578-580`). Every selector is scoped
`.note-database-container .db-*` (`styles.css:12139`, `:12247`, `:12259`, `:12366`), so **any rule
that misses the stand-in renders unstyled on the portalled sheet** — the mechanism behind several
"looked like the old ones" reports.

**Why the portal exists (F7.6)**: inside the workspace leaf a sheet resolves `bottom: 0` 72–80px
short depending on the host's floating navbar (`mobile-bottom-sheet.ts:66-75`, measured by two
independent reviews). Recorded so the synthesis does not re-derive it.

### Component 4: `popover-host` — the picker/menu family

`mountPickerSheetHeader` mounts the shell header (title + close) on a phone sheet
(`popover-host.ts:168-176`); `.db-dropdown-popover.db-mobile-bottom-sheet` confirms handle, scrim
and close button ship (`styles.css:3156-3213`). This is the **opposite affordance set** from the
adopted decision (§5.4).

### Data Flow — the three navigation moves and the cap

| Move | True-up disposition | Implementation state | Evidence |
|---|---|---|---|
| Replace in place | ADOPT (C1, C6) | Title swap + back control only; body swap has no producer; the two converted pairs are inexpressible | F2.4, F5.1 — `surface-shell.ts:200-231`, `:428-432` |
| Stack a sheet | ADOPT (C4, C5) | **Implemented and verified**; parent-dim mechanism diverges in composition | F5.3, F5.5 — `styles.css:295-305` |
| Stack a menu / popover | ADOPT (rows 26/31 FLIPPED) | **Not implemented** — menu-role surfaces present as handle+close sheets | F2.6 — `popover-host.ts:168-176` |
| Depth cap (no third stacked sheet) | ADOPT as shell rule (C4) | **No runtime enforcement** | F5.1 — `overlay-stack.ts:94-96`, `:194-209` |

---

## 5. TECHNICAL SPECIFICATIONS — measured baseline vs implemented value

All "measured" values are the recorded measurements in `051/design-trueup.md`. No image was opened.

### 5.1 Frame

| Property | Measured (Anytype) | Implemented | Verdict |
|---|---|---|---|
| Floating inset | 8.0 / 8.3 / 8.3 pt | `--db-sheet-float-inset: 8px` (`styles.css:90`), applied L/R/bottom (`:277-279`) | **MATCH** |
| Floating radius | 16 pt arc | `--db-radius-xl: 16px` (`styles.css:86`, `:282`) | **MATCH** |
| Flush frame | L 0 / R 1205 / bottom 2621, top corners only | `left/right: 0`, `--db-radius-lg: 8px` top corners (`styles.css:230-265`) | **MATCH** (flush radius unmeasured in captures — not contradicted) |
| Shape selection | "shape from a surface's **declared height role**" (trueup:355, C10) | `FLOATING_HEIGHT_RATIO_MAX` at the midpoint of the unobserved gap (`mobile-bottom-sheet.ts:321`), hysteresis 0.03 (`:338`), debounce 80ms (`:341`), ResizeObserver classifier (`:364-375`, `:385-431`); `SheetChromeOptions` (`:29-45`) carries no height-role field | **DIVERGES** (documented, not drift — F1.2) |

### 5.2 Handle

| Property | Measured | Implemented | Verdict |
|---|---|---|---|
| Size | 34 × 5 pt | 36 × 4 px (`styles.css:349-359`) | diverges |
| Drop below top edge | 6 pt | `margin: 8px auto 4px` (`styles.css:349-359`) | diverges |
| Colour / contrast | `#555555`, 2.21:1 (the E1 justification) | `--text-faint` at opacity 0.65 — **theme-supplied, hex not in `styles.css`** | **unmeasured** |
| Grammar predicate | — | `hasSheetHandle` checks existence + `hasSheetDrag` only (`sheet-grammar.ts:80-86`) — cannot see geometry or colour | coverage hole |

### 5.3 Header

| Property | Measured | Implemented | Verdict |
|---|---|---|---|
| Title size / colour | ~17px, `#F3F3F3`, bold, centred | `--db-font-lg` (comment: 16px, `styles.css:12777-12783`), `--text-normal` | within tolerance; colour theme-dependent |
| Top edge → title centre | 39 pt | falls out of handle margins + 20px + 44px control | **unmeasured** |
| Header block height | ~70 pt | 20px-margin arithmetic: `.db-panel-header:has(.db-sheet-close) { margin-top: 20px }` (`styles.css:12213-12222`), `.db-mobile-bottom-sheet > .db-sheet-modal-header { margin: 20px 0 0 }` (`:12153-12157`), record-panel override (`:421-426`), floating sort panels halve the inset (`:12209-12211`) | **unmeasured** — *(inference: ~84px vs the measured 70pt)* |
| Three-slot grid | centred title, 44px edge control | `grid-template-columns: 1fr auto 1fr` (`styles.css:12316-12344`), `--db-shell-edge-control-size: 44px` (`:93`), `db-shell-back` shares the edge rule (`:12259-12272`) | **landed** — but only on `.db-shell-header` |
| Two-slot legacy builder | — | `createSheetHeader` (`mobile-bottom-sheet.ts:161-175`) and `attachSheetChromeToModal`'s default (`:276-278`) — no leading slot, no centred title | survives on the bypass path |
| Grammar predicate | — | `hasSheetHeader` accepts either shape (title + close only, `sheet-grammar.ts:88-95`) | **the lane cannot see this divergence** |
| Title source | declared per surface (AC-001) | `resolveTitle` falls back to the first h1/h2/h3 (`mobile-bottom-sheet.ts:268-275`); `DbModal.getSheetTitle` is a **second** scrape chain (`db-modal.ts:91-96`) | 17 of 20 declared; two chains |

### 5.4 Scrim and parent dim — **the top numeric divergence**

| Property | Measured | Implemented | Verdict |
|---|---|---|---|
| Page under first sheet | **0.519 luminance ≈ 48% black** (three bands: 0.519 / 0.520 / 0.505) | `rgba(0,0,0,0.25)` (`styles.css:315-322`), one shared scrim inserted before the top sheet only (`mobile-bottom-sheet.ts:767-795`) | **≈ half strength** |
| Parent under child | **0.710 ≈ 29% black**, one dim | scrim 0.25 × `.is-stack-parent` opacity 0.88 × `scale(0.96) translateY(4px)` ≈ 34% effective (`styles.css:295-305`) | numerically close, **two mechanisms vs one** |
| Pull-back cue | not observable in captures | `scale(0.96)`, comment: "the compact depth cue used by iOS and Notion" (`styles.css:285-288`) | **design-inferred and unlabelled as such**; no packet document records it as adopted or declined |
| Lane coverage | — | none — no row asserts scrim opacity | coverage hole |

### 5.5 Rows, actions, dividers

| Property | Measured / adopted | Implemented | Verdict |
|---|---|---|---|
| Phone row pitch | 50 pt (desktop menus 28px, adopted `goal.md` §3 criterion 5) | `.db-panel-row { padding: 2px }`, **no min-height** (`styles.css:12366-12373`); `.db-menu-item` min-height 30px (`:469`); `ROW_PADDING_FLOOR_PX = 2` (`sheet-grammar.ts:52`) | **diverges** — rows read denser *(inference)* |
| Primary action pill | 341.7 × 50.0 pt, ~21pt insets (trueup §8a); row 19 flip footer-bar → one pill | **no producer at all** — modals build `.db-modal-actions` button rows (`confirm-sheet.ts:54-72`); `SHELL_PRIMARY_ACTION_HEIGHT_PT` has no consumer | **unshipped**, no lane row |
| Trailing header chip | 44.0 × 44.0 pt | `SHELL_TRAILING_CHIP_SIZE_PT` has no consumer | **unshipped**, no lane row |
| Dividers | three contexts adopted: 20pt symmetric / text-column / full-bleed (C8) | **not audited by this research** | explicit audit gap (§ Eliminated Alternatives) |
| Segmented choices | — | real surface to fail on: `.db-new-placement` (`sheet-grammar.ts:146-161`) | no divergence found |

### 5.6 Motion

| Property | Reconciled band | Implemented | Verdict |
|---|---|---|---|
| Enter | 200ms ease-out (`goal.md` §3 criterion 6) | `--db-sheet-enter: 260ms` (`styles.css:130`), `transform var(--db-sheet-enter) ease-out` (`:453-456`), rise `translate3d(0,100%,0)` → 0 (`:440-451`) | 260 vs 200 |
| Exit | 150ms ease-in | **no exit transition anywhere in the sheet block**; no `--db-sheet-exit` token; removal is an unmount (`mobile-bottom-sheet.ts:591-618`) | **absent, not mistimed** |
| Declared constants | — | `SHELL_ENTER_MS = 200` / `SHELL_EXIT_MS = 150` (`surface-shell.ts:169-170`) | declared, unread by CSS |

### 5.7 Safe area and drag

- **Safe area (F1.10)**: `padding-bottom: calc(16px + env(safe-area-inset-bottom))`
  (`styles.css:254`); grammar floor 16px with an explicit note that `env()` resolves to 0 headless
  (`sheet-grammar.ts:54-59`); fullscreen class also carries it (`styles.css:221`). **Floor correct;
  environment term structurally unobservable in any harness.**
- **Drag-to-dismiss (F1.11)**: `DISMISS_PX 96`, flick `0.8 px/ms`, `FLICK_MIN_PX 24`,
  `STALE_SAMPLE_MS 100` (`mobile-bottom-sheet.ts:881-888`, `:917`); gesture starts only on the
  handle band (`:952`); pointer capture + cancel spring-back (`:984-998`);
  `shouldFlickDismiss` lifted out so the harness supplies values (`:895-903`) after synthetic
  gestures measured 2 px/ms on a quiet machine and under 0.8 on a loaded one. The hit band is four
  coordinated values in one file — pseudo-element `top: -40px; bottom: -28px`
  (`styles.css:361-386`), floating variant (`:405-407`), record-panel variant (`:421-426`), plus
  the `:has(.db-sheet-close)` header clearance (`:12213-12222`).

### 5.8 Picker widths (minor, F2.7)

`DATE_PICKER_POPOVER 252`, `SWATCH_PICKER_POPOVER 124`, `GRID_PICKER_POPOVER 318`,
`RELATION_PICKER_POPOVER 360-520` (`popover-host.ts:229-257`) were declared independently of the
measured menu 256 / condition 288 / operator 232 (trueup §2a) — even though
`SHELL_CONDITION_SURFACE_WIDTH_PX = 288` and `SHELL_OPERATOR_DROPDOWN_WIDTH_PX = 232` already exist
(`surface-shell.ts:148-149`). Same pattern as F2.2: measured values declared in one file,
unreferenced where they are set.

---

## 6. CONSTRAINTS & LIMITATIONS — what the Chromium harness cannot see (Q4)

| Behaviour | Device-only? | What the harness *can* check | Cheapest honest check |
|---|---|---|---|
| Keyboard avoidance | **partially — already emulated** | `verify-placement.mjs` drives both a host-declared `--keyboard-height` and a `visualViewport.height` shrink against a 331px keyboard, with a red-observed negative control (`044/goal.md:96-107`) | device probe for the *real* keyboard's focus-steal and rubber-band-under-keyboard behaviour |
| Safe-area inset | **yes** | the literal `env()` term is present (`sheet-grammar.ts:54-59`) | device measurement of applied padding (expect 16px + inset), bound to 044 AC-006 / 051 AC-010 as a checklist item |
| Rubber-band scrolling | **yes** | `overscroll-behavior: contain` is applied (`styles.css:12164`) | device gesture test; red-first = the page behind scrolls while the sheet is open. Fold into 048 AC-009 (stacked sheets each carry their own scroller) |
| Drag-to-dismiss | **partially** | decision function is unit-driven already (`mobile-bottom-sheet.ts:895-903`) | record a pointer stream on device, replay through `shouldFlickDismiss` once per OS version |
| Focus restoration | **no — once built** | nothing; it is a no-op today | plumb the trigger as the registration anchor, then unit-assert focus returns after `dismissPanel` |
| `svh` / floating navbar geometry | **yes** | nothing; the harness viewport has neither navbar nor dynamic toolbar | the existing AC-010 checklist item; the portal already owns the mechanism |
| Engine layout timing | **no** | both-engine resting waits, already landed | keep the pattern: assert on both engines and wait for **rest**, not frames |

**Why engine timing is a proven defect class (F7.7)**: in the row-59 era a WebKit run held the
filter sheet's top at 556 while its bottom sat at 733 on a 660px screen — mid-placement — so the
lane's tap landed on the scrim and dismissed the surface. Fixed by a resting wait on the published
settle signal (`readSheetFrameShapeActivity`, `mobile-bottom-sheet.ts:346-361`) after the
two-rAF-vs-80ms-debounce race. **Any new lane row must inherit this.**

**Harness fidelity limit (F6.3)**: `host-modal-stand-in.ts:44-48` states its 40px title / 32px close
sizes "stand in for" Obsidian's host CSS, "approximated rather than measured". The relative
assertions (one close control, shared background, gap) verify the *mechanism*; the operator's
absolute ~200px device band is **not reproducible in the harness**.

**Declared harness debt (F8.5)**: `verify-placement.mjs` reads 402/403 with "the same 1 declared red
every release carries" (roadmap rows 40-43). **402/403 is the healthy signature**; 401/403 or
403/403 is the signal.

---

## 7. INTEGRATION PATTERNS — the shell bypass audit (Q2 / T010)

### 7.1 The bypass set is exactly three surfaces

Census at this tree: **20** `extends DbModal` subclasses (matches `goal.md:124`), all presenting
through `DbModal.applyPresentation` → `createSurfaceShell` (`db-modal.ts:120-133`). **No subclass
calls `attachSheetChromeToModal` directly.**

The direct-call set is unchanged from the packet census:

| Surface | Direct call site | Class definition |
|---|---|---|
| `BaseFileSuggestModal` | `main.ts:3047` | `main.ts:3021` |
| `ImageFileSuggestModal` | `image-file-suggest-modal.ts:40` | `:25` |
| `MarkdownFileSuggestModal` | `markdown-file-suggest-modal.ts:34` | `:19` |

Each repeats the same four-call dance in `onOpen`: `isTouchDevice` → `attachSheetChromeToModal` →
`placeSheet` → `keepSheetPlaced` (`main.ts:3044-3055`, `image-file-suggest-modal.ts:37-50`,
`markdown-file-suggest-modal.ts:33-46`) — the exact composition `createSurfaceShell` exists to own,
re-assembled by hand three times.

### 7.2 What the bypass costs, concretely (F3.2)

1. **Two-slot header** — no `buildHeader` option is passed, so the default `createSheetHeader` runs
   (`mobile-bottom-sheet.ts:276-278`); the centred grid applies only to `.db-shell-header`
   (`styles.css:12316-12320`).
2. **No role, no declared-title counting** — the shell's `role` and `resolveShellTitle` counter
   (`surface-shell.ts:101-126`) never see these surfaces.
3. **No 048 stack rule** — their `asSheet` is `isTouchDevice` only. The shell path forces `asSheet`
   when a sheet is already open (`hasSheetParent`, `surface-shell.ts:56`); the Fuzzy path never
   asks. *(Inference: a file-suggest opened while a sheet is up behaves differently from a DbModal
   `dialog` in the same state.)*
4. **Row 21's flip is unimplemented here** — trueup §5b row 21 flips `BaseFileSuggestModal` to
   Anytype's full-screen search (bottom-docked field, chip row, results upward). What ships is a
   generic bottom sheet with the same header as every other surface. *(Inference from the call
   shape; the surface's body was not read.)*
5. **Measured by nothing** — none of the three appears in the lane's 14 `REGISTERED_SURFACES`
   (`sheet-grammar.mjs:65-107`). The stacked-pair registry *does* mount fuzzy children
   (`settings template file picker`, `settings cover image picker`, `kind: "fuzzy"`,
   `sheet-grammar.mjs:193-194`) — but as **stand-in mounts**, not the real subclasses, consistent
   with the roadmap's note that nothing in the tree constructs a real `Modal`
   (`obsidian-stub.mjs` throws by design). *(Inference — the `kind: "fuzzy"` handler was not read
   in full.)*

### 7.3 T010 sharpened (F3.3)

The spec's framing — "join the shell or stay Obsidian-native behind a shim" — is no longer accurate
about what the code does: **the three surfaces already wear the plugin's sheet chrome**. The real
choice is:

- **(a) Route through `createSurfaceShell`** — they stop hand-rolling placement and gain the
  three-slot header, the role, the stack rule and the title counter. *(Inference: smaller than it
  looks, because `DbModal` already demonstrates the whole integration at `db-modal.ts:120-133`.)*
- **(b) Extract the four-call dance into one FuzzySuggest-specific shim** — so it is at least
  written once.

**The decision is the operator's.** Either way the threshold in §11 (P0-4) applies.

### 7.4 What else holds on this axis

- **Confirm primitive (F3.5)**: `buildConfirmSheetBody` exported (`confirm-sheet.ts:46-72`);
  `ConfirmModal` extends DbModal with a declared title and `dialog` role
  (`confirm-modal.ts:37-53`); `openAndWait` resolves false on dismissal (`:55-60`);
  `confirmWithModal` wrapper (`:102-104`); `canUndoDeletion` implements the E4 Undo ruling
  (`:113-119`); body built before `super.onOpen()` so the shell header uses the declared title
  (`:62-81`). **AC-005's "one exported path" holds.** The plain-button actions row (rather than
  Anytype's pill) is the operator-flagged row-1 HOLD and nothing here contradicts it.
- **Fullscreen third mode (F3.6)**: implemented and stable — `db-modal-fullscreen` forces
  `position: fixed; inset: 0` on touch (`styles.css:212-222`); `resolveShellPresentation` keeps
  fullscreen only when no sheet is open (`surface-shell.ts:57`). Four users: FormulaModal keeps it
  (ADR-004); ChartDrilldown / InvalidTimeEvents / PropertyTypeConflict are fullscreen → sheet
  transitions per trueup rows 18-20. One presentation type, re-exported (`db-modal.ts:54`), no
  drift. **Implemented but not yet decided** by the operator.
- **Side sheet (F2.5)**: `SHELL_SIDE_SHEET_CLASS` + `SHELL_SIDE_SHEET_WIDTH_PX = 420`
  (`surface-shell.ts:185-194`, measured off the object-properties panel border column and widened
  for our content); consumer owns mounting (`:180-182`); CSS at `styles.css:10828`/`:10839+`.
  T023 leaves the lane row untaken while one surface uses it — **a ruling, not a defect.**

---

## 8. IMPLEMENTATION GUIDE — lane coverage holes (Q3)

### 8.1 The model to follow: how row 59 produced permanent coverage (F4.4)

The host-modal leg added, in one pass:
1. a faithful host-modal stand-in shared from `tools/live/host-modal-stand-in.ts`;
2. the operator's own pair (`properties edit property`) registered;
3. three new grammar columns — exactly one visible close control, header and body share one
   background, handle-to-title gap — **each with a dedicated negative control**;
4. four permanent `constructed-modal-sheet-*` screenshot scenarios mounting **real subclasses**
   (`ColumnRenameModal`, `ConfirmModal`) through the **real** `attachSheetChromeToModal`;
5. all of it **watched red first** by reverting the by-reference hide.

Columns and controls verified at `sheet-grammar.mjs:1416-1421` (assertions), `:1639-1641`
(before/after background injection), `:544-547` (frame-shape geometry negative control),
`:230-232` (handle-removal negative control).

The same leg caught two latent defects **in its own harness**: the chrome capture hid
`modalEl.parentElement` unconditionally (wrong for non-Modal panels), and the background column
could go green on two transparent boxes. Both now carry injection controls.

**Every new row in §8.2 should follow this shape: production-module import + negative control +
permanent scenario, watched red first.**

### 8.2 The holes

**Named by the packets, still true:**

| Deliverable | Why there is no row | Evidence |
|---|---|---|
| Primary action pill | no producer *and* no consumer of the constant | `goal.md:172-173`; F2.2; F8.6 |
| Trailing header chip | no producer, no consumer | `goal.md:172-173`; F2.2 |
| Motion timing band | a row would be red today (260ms, no exit) — which is what a threshold is for (`goal.md` D2) | F1.8 |
| Sub-page shape | no production caller reaches `pushSubPage`/`popSubPage` | roadmap 051 row; F2.4 |
| Side-sheet shape | **deliberately** untaken while one surface uses it (T023) | `goal.md:195-196` |

**Added by this research:**

| Candidate row | Threshold it would assert | Why it matters |
|---|---|---|
| Header-block height | top-edge → first-row ≈ 70pt | would have caught the row-59 dead band faster — that defect needed its own new column |
| Scrim level | computed scrim alpha | **nothing pins dim strength at all**; the row-59 leg added background-continuity columns but not this |
| Handle geometry + contrast | 34 × 5pt, 6pt drop, measured contrast | `hasSheetHandle` sees existence only |
| The three FuzzySuggest surfaces | registration at all | three shipping phone sheets measured by nothing |
| Depth-3 capture scenarios | photograph the three registered depth-3 chains | 048 T025 open — measured but never photographed (`048/tasks.md:159-176`) |

**Every one of these is a bridge from a constant the codebase already declares
(`surface-shell.ts:139-170`) to a computed-style assertion.**

### 8.3 Phase completion arithmetic (F4.7), for the synthesis's phase math

- **051**: goal criteria 2 of 9 Met (side-sheet criterion closed by the "Keep the overlay" ruling;
  the deep-research criterion is this loop). Acceptance rows 3 of 14 Met. Non-operator open rows:
  **T010, T015, T023** (+ T025 = this lineage).
- **048**: 88%, 9 of 10 rows; only AC-009 is operator-owned.
- **044**: one open row — AC-006.
- **Device rows 40 / 41 / 43 are all "fixed in repo, unread on device"**; the build counter has
  moved 0.0.24 → 0.0.29 with no new operator reading.
- The T025 precondition ("all three packets done AND verified") measured **NOT MET** at loop start
  (roadmap 051 row; `goal.md:203-208`).

---

## 9. CODE EXAMPLES & EVIDENCE ANCHORS

### 9.1 The bypass shape (what P0-4 removes)

```ts
// main.ts:3044-3055 — repeated verbatim at image-file-suggest-modal.ts:37-50
//                     and markdown-file-suggest-modal.ts:33-46
onOpen() {
  super.onOpen();
  if (isTouchDevice()) {          // ← no role, no declared title, no stack rule
    attachSheetChromeToModal(...); // ← default two-slot createSheetHeader
    placeSheet(...);               // ← hand-rolled placement
    keepSheetPlaced(...);          // ← hand-rolled reposition
  }
}
```

Contrast with the routed path, which already demonstrates the whole integration:

```ts
// db-modal.ts:120-133 — the ONLY production call to createSurfaceShell
applyPresentation() { /* → createSurfaceShell(...) at db-modal.ts:122 */ }
```

### 9.2 The constants that CSS cannot read (what P2-2 bridges)

```ts
// surface-shell.ts:139-170 — declared, correct, and unreferenced by the stylesheet
SHELL_ENTER_MS = 200;                  // styles.css:130 ships 260ms
SHELL_EXIT_MS = 150;                   // no exit token exists at all
SHELL_PHONE_ROW_HEIGHT_PT = 50;        // .db-panel-row has no min-height
SHELL_PHONE_HEADER_HEIGHT_PT = 70;     // header block is 20px-margin arithmetic
SHELL_PRIMARY_ACTION_HEIGHT_PT = 50;   // no consumer anywhere
SHELL_TRAILING_CHIP_SIZE_PT = 44;      // no consumer anywhere
```

The section comment says consumers "point at one of these instead of repeating the number"
(`surface-shell.ts:133-136`) — but **a CSS custom property cannot read a TS constant**, and no
bridge (injected custom properties, generated stylesheet, or build-time check) exists.

### 9.3 The missing depth cap (what P0-1 adds)

```ts
// overlay-stack.ts:94-96 — parentId derived from the current top sheet, no depth check
parentId: options.parentId ?? this.getTopSurfaceForDocument(doc, { sheetsOnly: true })?.id
// overlay-stack.ts:194-209 — getDepth walks the parent chain unbounded
// mobile-bottom-sheet.ts:811 — syncSheetStack styles whatever depth resolves
```

Searched: `register` / `dismiss` / `getDepth` carry no cap. The only depth-related guard is the
cycle-protected parent walk (`overlay-stack.ts:199-207`).

---

## 10. TESTING & DEBUGGING

### 10.1 The lane's current state

- `REGISTERED_SURFACES` carries **14 surfaces** (`sheet-grammar.mjs:65-107`): sort-panel,
  filter-panel, add-view, record-detail, record-peek, column-width, settings, column-manager,
  board-card-properties, owned-menu, date-picker, icon-picker, option-color-picker, confirm.
  **None is a suggest surface.**
- Gate registers 14 surfaces / 32 pairs, **2041 PASS / 0 FAIL**.
- `verify-placement.mjs`: **402/403** — one declared red every release carries (F8.5).

### 10.2 The threshold that admits its own defect (F8.2) — **a live harness defect**

`HANDLE_TO_TITLE_GAP_MAX_PX = 80` (`sheet-grammar.mjs:222-228`). Its derivation comment sizes the
conforming spend at "roughly 80px" (handle band 16 + header margin 20 + title row 28-40). But the
defect state the column was created for measured **74.4px** in the harness (roadmap row 59:
"handle-to-title gap 74.4px … 34.4px once removed").

**74.4 < 80: a regression that restores the empty native title's dead band passes the cap today.**

Mitigating: the on-device defect (~200px) *would* be caught, and the permanent
`constructed-modal-sheet-*` pixelHash scenarios *do* catch the harness-scale regression. So the
user impact is indirect — which is why this ranks P2-1 and not higher.

**Fix**: re-derive the cap between the healthy 34.4px and the defective 74.4px (≈50px), red-first
by re-introducing the stand-in's native title.

### 10.3 Red-first checks available on the current tree

Every P0 and P1 item in §11 has an assertion that is **red right now**, so none requires
manufacturing a failure state:

| Task | Assertion that is red today | Anchor |
|---|---|---|
| P0-1 depth cap | both converted pairs register as **stacks** | `overlay-stack.ts:94-96` |
| P0-2 menu role | pickers ship handle + close control | `popover-host.ts:168-176`; `styles.css:3156-3213` |
| P0-3 scrim | computed scrim alpha **0.25** vs 0.48 threshold | `styles.css:319` |
| P0-4 T010 | **three** direct `attachSheetChromeToModal` call sites | `main.ts:3047` + 2 |
| P1-1 row pitch | `.db-panel-row` has **no** min-height; menu rows 30px | `styles.css:12366-12373`, `:469` |
| P1-2 motion | 260ms; **no exit token** | `styles.css:130`, `:440-456` |
| P1-3 lane rows | rows absent; pill has no producer | `goal.md:172-173` |
| P1-4 handle | 36 × 4px at 8px drop | `styles.css:349-359` |
| P1-5 declared titles | scrape-fallback counter **> 0** on three named surfaces | `surface-shell.ts:101-126` |
| P2-1 gap cap | the 74.4px defect state **passes** the 80px cap | `sheet-grammar.mjs:222-228` |
| P2-3 height role | no `heightRole` field exists | `mobile-bottom-sheet.ts:29-45` |
| P2-4 focus restore | `restoreFocus` is a no-op for sheets | `overlay-stack.ts:307-311` |

---

## 11. RECOMMENDATIONS — the ranked remediation plan (Q5)

Ranked by **user impact**. Each item carries an owner suggestion, a threshold, and a red-first
check that is already failing on this tree.

### P0 — breaks the "one surface family" read on a device

**P0-1. Implement the depth cap and the replace move.** *(F5.1, F2.4 · owner 048 + 051)*
- **Threshold**: registering a third stacked sheet presents as a **replacement** of the second —
  parent frame unmoved, one handle pair, header title swaps. The two converted pairs
  (`properties property type picker`, `add view property picker`) assert **replace**, not stack.
- **Red-first**: on the current tree both pairs register as stacks — the assertion is already red.
- **Note**: inherits a known-good base — depth-to-z is monotone and verified (F5.5).

**P0-2. Ship the menu-role phone presentation: a handle-less anchored card.** *(F2.6 · owner 051/052)*
- **Threshold**: a `menu`-role surface on the phone carries **no grab handle and no close button**;
  the parent dims but never moves; picker width roles cite the measured 256 / 288 / 232 where they
  apply.
- **Red-first**: the close-control count column goes red the moment the role check exists — pickers
  currently ship both affordances.
- **Basis**: trueup row 26 (FLIPPED) — "a `menu` role on the phone is an **anchored, handle-less
  card** over a dimmed parent … not a grab-handle bottom sheet"; row 31 — "ADOPT the popover shape.
  A handle-less popover over an **undimmed** parent" (`trueup:320`); §3 move 3 — the child has
  "**No** handle at all" (`trueup:171`). The `menu`-vs-`panel` role distinction is **declared**
  (`surface-shell.ts:86`) but **nothing in the presentation path reads it**.

**P0-3. Fix the scrim level.** *(F1.7 · owner 048, which owns the scrim per trueup C3)*
- **Threshold**: page under a first sheet at 0.519 luminance (~48% black); parent under a child at
  0.710 (~29% black) via **one** mechanism (the scrim) — retiring the opacity-0.88 + scale(0.96)
  composition, **or** dispositioning it explicitly as a deliberate extra cue (it is currently
  design-inferred and recorded nowhere).
- **Red-first**: computed scrim alpha 0.25 today vs the 0.48 threshold — red now.

**P0-4. Resolve T010 and land the FuzzySuggest disposition.** *(F3.2, F3.3 · owner 051; the decision
is the operator's)*
- **Threshold**: **0** direct `attachSheetChromeToModal` call sites outside the shell; the three
  surfaces carry the shell header and register with the stack. Row 21's flip (full-screen search
  surface) is scoped as its own separate task.
- **Red-first**: three direct call sites today.

### P1 — parity polish visible on every sheet

**P1-1. Phone row pitch.** *(F1.9)* — **Threshold**: `.db-panel-row` and menu rows on
`body.is-phone` at a 44px min-height floor / 50pt target pitch. **Red-first**: no min-height today;
menu rows 30px.

**P1-2. Motion band with one source of truth.** *(F1.8, F2.2)* — **Threshold**: `--db-sheet-enter`
at 200ms; an exit transition exists at 150ms ease-in; a drift check asserts stylesheet values equal
`SHELL_ENTER_MS` / `SHELL_EXIT_MS`. **Red-first**: 260ms and no exit token.

**P1-3. Lane rows for the pill, the chip and the header block.** *(F4.1, F4.2, F8.4)* —
**Thresholds**: pill 341.7 × 50.0pt at ~21pt insets; chip 44.0 × 44.0pt; header block ≈70pt
top-edge-to-first-row. Each row imports the production builder and carries a negative control (the
§8.1 pattern). **Red-first**: no rows exist; the pill has no producer at all.

**P1-4. Handle geometry and its contrast.** *(F1.3)* — **Threshold**: adopt the measured 34 × 5pt
and 6pt drop; **measure the rendered handle contrast once and record it** — if below 3:1, E1's
justification stands with *our* number instead of Anytype's 2.21:1. **Red-first**: 36 × 4px at 8px
drop today.

**P1-5. Declared titles 17/20 → 20/20.** *(F3.4)* — The three survivors are already named:
`CsvMarkdownImportModal`, `CsvMarkdownExportModal`, and the `settings.ts` restore modal (roadmap 051
row). **Threshold**: scrape-fallback counter at 0 for the registered set. **Red-first**: counter > 0
on those three. **Consider also retiring one of the two scrape chains** — `DbModal.getSheetTitle`
(`db-modal.ts:91-96`) and `resolveTitle` (`mobile-bottom-sheet.ts:268-275`) must stay in sync, and
a title fix applied to one will not reach the other *(inference: structural, not observed failing)*.

### P2 — harness, hygiene, and decisions

| # | Task | Threshold | Red-first |
|---|---|---|---|
| P2-1 | Re-derive `HANDLE_TO_TITLE_GAP_MAX_PX` (F8.2) | cap between healthy 34.4px and defective 74.4px (≈50px) | re-introduce the stand-in's native title — that state passes the 80px cap today |
| P2-2 | Constants-to-CSS bridge (F2.2) | no stylesheet literal may disagree with a declared constant | 260 vs 200ms; row and header mismatches |
| P2-3 | Declared height role (F1.2) | `SheetChromeOptions.heightRole?: "floating" \| "flush"`; classifier becomes the fallback for undeclared surfaces — satisfies C10's wording while keeping the oscillation fix *(inference)* | no such field exists |
| P2-4 | Focus restoration for sheets (F7.5) | plumb the trigger as the registration anchor; unit-assert focus returns on dismiss | `restoreFocus` is a no-op for every sheet |
| P2-5 | Depth-3 capture scenarios (048 T025) | photograph the three registered depth-3 chains, plus the capture the converted pairs need after P0-1 | no depth-3 capture scenario exists |
| P2-6 | Device passes with the §6 checklist (F6.2, F7.8) | 044 AC-006, 048 AC-009, 051 AC-010 read against **one** build, with keyboard / safe-area / rubber-band / drag bound to those reads; **reconcile the commit ids** | rows 40/41/43 "fixed in repo, unread on device" across 0.0.24 → 0.0.29 |
| P2-7 | Divider-inset audit (F8.6) | verify C8's three contexts (20pt symmetric / text-column / full-bleed) against `styles.css` | this research explicitly did **not** audit them |

---

## Eliminated Alternatives

Negative knowledge — what was tried, ruled out, or deliberately refused. **This is primary research
output**: each row saves a future pass from re-deriving a dead end.

| Approach | Reason Eliminated | Evidence | Iteration(s) |
|---|---|---|---|
| Resolve the handle's rendered contrast from `--text-faint` | The token's hex is not defined in `styles.css` — it is theme-supplied. Recorded as **unmeasured** rather than guessed. | `styles.css:349-359` | 1 |
| Find a consumer of `SHELL_PRIMARY_ACTION_HEIGHT_PT` / `SHELL_TRAILING_CHIP_SIZE_PT` | **None exists** in non-test code. Confirms `goal.md:172-173` and adds: these deliverables have no consumer *at all*, not just no lane row. | `surface-shell.ts:139-170` | 2 |
| Find a DbModal subclass overriding `onOpen` without `super.onOpen()` (an invisible shell bypass) | All 20 declare `onOpen`; the three read call `super.onOpen()` correctly (`confirm-modal.ts:81` is explicit). The other 17 were not individually read — full verification is treated as a **lane-row candidate**, not settled fact. | `confirm-modal.ts:81` | 3 |
| Cite an existing scrim-opacity assertion rather than propose a new row | **None found** in the row-59 column list or the registry figures. Recorded as a hole, not double-counted. | roadmap row 59 | 4 |
| Find a depth cap anywhere in the stack API (`register` / `dismiss` / `getDepth`) | **None exists.** The only depth-related guard is the cycle-protected parent walk. Searched, not assumed. | `overlay-stack.ts:199-207` | 5 |
| Open the operator's 10:04 screenshot | Never committed (roadmap row 59's evidence column), and image reads were out of scope. The committed sibling `scratch/device-2026-09-05/stacked-properties-create-property.png` is cited by the roadmap and was **not** read. | roadmap row 59 | 6 |
| Build a synthetic `env()` override for the harness | Rejected: `env()` is structurally 0 in every headless run, and the grammar's own comment establishes the literal-term check as the honest floor. **A synthetic env would assert the harness, not the sheet.** | `sheet-grammar.ts:54-59` | 7 |
| Read the lane's `kind: "fuzzy"` handler in full to confirm the stand-in mount shape | Budget. The stand-in inference rests on the roadmap's `obsidian-stub.mjs` note and is **labelled as inference**, not asserted. | `sheet-grammar.mjs:193-194` | 8 |
| Rank P2-1 (the loose gap cap) above P1 | Rejected: the `constructed-modal-sheet-*` pixelHash scenarios already catch the regression the numeric cap misses, so **user impact is indirect**. | F8.2 | 9 |
| Audit divider insets against C8's three contexts | **Explicitly out of this lineage's bounded read set.** Recorded as an open audit (P2-7) rather than claimed either way. | trueup §6 C8 | 8, 10 |
| Adjudicate the commit-id discrepancy (`e632a1e1` vs `772b24d2`) | Git writes and git reads were out of this lineage's contract. Flagged for the synthesis to reconcile against the log rather than carrying both ids silently. | roadmap row 59; 048 T024 | 6, 10 |
| Treat the confirm primitive's plain-button actions row as a defect | The Anytype captures raise no confirm surface; trueup row 1 is an operator-flagged **HOLD**, not an adopted flip. The hold is legitimate (data-loss precondition). | `confirm-sheet.ts:54-72`; trueup row 1 | 3, 10 |
| Synthesize early on convergence | `stopPolicy: max-iterations` made early synthesis **incorrect** by instruction. Iterations 7–8 broadened review angles (verification design, harness audit) instead of stopping. | convergence report | 7, 8, 10 |

---

## Divergence Map

Single lineage (`glm-devpass`), `convergenceMode: default`, **no divergent pivot was triggered** —
`stopPolicy: max-iterations` kept the loop running to the cap, so no `composite_converged` stop ever
reached the pivot path. Breadth was therefore achieved by **planned focus rotation**, not by pivot.

**Saturated directions** (fully extracted; do not re-read):
- Frame / handle / header / scrim / motion / row values in `styles.css` — extracted in iteration 1.
- The stack API surface, searched end-to-end for a depth guard — iteration 5.
- The lane registry read for suggest-surface coverage — iteration 8.
- The confirm primitive, presentation types, and the `SHELL_*` constants audited for consumers —
  iterations 2–3.

**Pivots taken**: none (no Council seats dispatched, no `divergent` mode). Iterations 7 and 8 turned
from primary questions to verification design and harness audit — a **focus rotation inside the
declared plan**, recorded here so it is not mistaken for a pivot.

**Pivot failures / audited overrides**: none.

**Remaining frontier** — where an additional pass would find genuinely new information:
1. **Divider insets** in `styles.css` against C8's three contexts (never opened — P2-7).
2. **The 17 unread DbModal subclass bodies** — `onOpen` correctness was verified for 3 of 20.
3. **The `kind: "fuzzy"` lane handler** — the stand-in inference rests on a secondary note.
4. **The FuzzySuggest surface bodies** — row 21's flip state and title-overflow behaviour are both
   inferred from call shape, not read.
5. **Anything device-observable** — §6's whole first column is outside any harness's reach.

**Coverage claim, stated honestly**: the loop broadened its frontier to answer all five questions;
it did **not** converge in the `newInfoRatio` sense (the ratio stayed above 0.05 on every iteration
and averaged 0.73). Breadth here is not a convergence claim.

---

## 12. OPEN QUESTIONS

### 12.1 Decisions that are the operator's, not this research's

1. **T010 — the FuzzySuggest disposition.** Route through `createSurfaceShell`, or extract one
   shim? §7.3 sharpens the framing and §11 P0-4 gives a threshold that holds either way. **Open.**
2. **The `fullscreen` third mode.** Implemented and stable with four users, two mid-transition
   (trueup rows 18-20). Implemented ≠ decided. **Open.**
3. **The `scale(0.96) translateY(4px)` parent pull-back.** Design-inferred; the captures cannot show
   transforms; **no packet document records it as adopted or declined.** A gap in the true-up's
   disposition table. Decide it as part of P0-3.
4. **Commit-id discrepancy.** The dispatch names `be578988` / `e632a1e1`; roadmap row 59 and 051's
   roadmap row record `be578988` / `772b24d2` (048's T024 reconciliation names both). Not
   adjudicated — git reads were out of contract. **Reconcile before the device read is recorded.**
5. **T023 — the side-sheet lane row.** Deliberately untaken while one surface uses it. Confirm the
   ruling still stands or take the row.

### 12.2 Empirically unresolved

6. **The header block's real height.** Ours is arithmetic, never measured; the measured Anytype
   figure is ~70pt. One measurement closes it (and gives P1-3 its threshold).
7. **Our handle's rendered contrast.** Unrecorded anywhere. One measurement closes it, and E1's
   justification then rests on our number rather than Anytype's.
8. **The scrape-fallback counter's production value.** The mechanism AC-001 needs is in place
   (`surface-shell.ts:101-126`); the count itself is unrecorded — it is the natural red-first
   baseline for P1-5.
9. **All device behaviour.** Nothing in §6's device-only column has been observed. Rows 40 / 41 / 43
   are fixed-in-repo and unread across builds 0.0.24 → 0.0.29.

### 12.3 Inference register — every unverified claim, labelled

The lineage marked exactly seven claims as inference. They are reproduced here unchanged so the
synthesis does not promote any of them to fact:

| # | Inference | Why it is not a fact | Anchor |
|---|---|---|---|
| 1 | Desktop false-stack when unrelated sheets are open | registry-level reasoning; **not observed** | F2.3 / F5.2 — `overlay-stack.ts:96` |
| 2 | Fuzzy pair children are stand-in mounts, not real subclasses | rests on the `obsidian-stub.mjs` note; handler not read in full | F8.1 — `sheet-grammar.mjs:193-194` |
| 3 | Our handle's contrast is below 3:1 | the token is theme-supplied and **unmeasured** | F1.3 |
| 4 | Header block ≈84px vs the measured 70pt | arithmetic from margins, **not a live measurement** | F1.5 |
| 5 | The modality reading of the scrim deficit ("sheets read as cards over live content") | **the 25%-vs-48% numbers are measured; the reading is interpretation** | F1.7 |
| 6 | FuzzySuggest titles' overflow behaviour | older path, unmeasured | F4.5 |
| 7 | Two-scrape-chain drift risk | structural, **not observed failing** | F3.4 |

Everything else in this document carries a `file:line` or a recorded measurement.

---

## 13. FUTURE-PROOFING & MAINTENANCE

### 13.1 Phase mapping — a suggestion for the synthesis, not a ruling

| Phase | Absorbs | Rationale |
|---|---|---|
| **048-stacked-sheets** | P0-1 (cap + replace), P0-3 (scrim), P2-5 (depth-3 captures) | it owns the scrim per trueup C3, and its model held under row 59 |
| **051-modal-and-sheet-componentization** | P0-2, P0-4, P1-2 … P1-5, P2-2, P2-3, P2-4 | its census rows are current and its open rows are exactly T010/T015/T023 |
| **044-phone-sheet-alignment** | P1-1 (row pitch), P1-4 (handle), P2-1 (gap cap) | the grammar elements it owns; AC-006 stays its close |
| **New phase candidate — "device verification pass"** | P2-6 + the §6 checklist | so the three packets' device rows are read **in one sitting against one build**, with the commit-id reconciliation folded in |
| **New phase candidate — "surface family completion"** | P0-1 + P0-2 | these are the **only adopted Anytype patterns with no producer at all** — packaging them keeps the two unshipped navigation moves from dissolving into polish work |

### 13.2 Structural risks to watch

- **The portal stand-in class is the standing unstyled-render risk** (F1.12). Every `.db-*` selector
  is scoped `.note-database-container`; the code comment names re-keying to the surface as "the
  right long-term answer". Any new rule that misses the stand-in reproduces the "old-looking sheets"
  class of report.
- **Two scrape chains, two fallback behaviours** (F3.4). Retiring one is cheap now and expensive
  later.
- **Declared-but-unread constants are a renewable source of drift** (F2.2). P2-2's bridge is the
  structural fix; every P1 numeric task is a symptom of its absence.
- **The lane can be green on a divergence it cannot see** (F1.4 / F8.2). `hasSheetHeader` accepts
  either header shape; `hasSheetHandle` sees existence only; the gap cap passes its own defect.
  New rows should assert *computed values*, not *presence*.

---

## 14. REFERENCE — findings index

51 merged findings from `findings-registry.json`, grouped by disposition.

**Divergences driving P0** — F5.1 (depth cap unimplemented), F2.4 (sub-page title-only), F2.6
(menu-role as sheet), F1.7 (scrim 25 vs 48), F3.1 (bypass set = 3), F3.2 (bypass cost), F8.1
(suggest surfaces unregistered), F4.6 (old-looking residue: scrim + row pitch).

**Divergences driving P1** — F1.9 (row pitch), F1.8 (motion), F2.2 (constants unreferenced), F1.5
(header block unmeasured), F4.1 (T015's three rows), F8.4 (missing lane columns), F4.2 (five new row
candidates), F8.6 (pill unshipped, dividers unaudited, segmented clean), F1.3 (handle deltas), F2.8
(scrape counter unrecorded), F3.4 (17/20 declared, two chains), F2.7 (picker widths).

**Harness / hygiene → P2** — F8.2 (gap cap admits its defect), F1.2 (classifier vs declared height
role), F5.4 (focus restoration no-op), F6.4 (residue: device read, depth-3, dim composition), F4.3
(device passes open), F6.2 (commit-id discrepancy), F7.1–F7.8 (blind-spot verification designs).

**Closed** — F4.5 (overflow, by 044 AC-009), F6.1 (row-59 symptoms mechanised — *closed pending
device*).

**Holds, no action** — F1.1 (frame parity), F1.11 (drag thresholds), F1.12 (portal stand-in risk,
recorded), F1.6 (title near-parity), F2.5 (side sheet scoped), F3.5 (confirm verified), F3.6
(fullscreen survives), F5.3 (stacked affordance matches), F5.5 (z monotone), F6.3 (stand-in
fidelity limit), F8.5 (verify-placement's declared red).

**Context / model / decision** — F2.1 (single shell consumer), F4.7 (phase arithmetic), F3.3 (T010
sharpened), F1.10 (safe-area device-only), F6.5 (earlier reports mapped), F5.6 (three-moves
scoreboard), F4.4 (row-59 pattern generalised), F8.3 (row-59 columns verified), F1.4 (resolved by
T011).

**Inferences** — F2.3, F5.2 (see §12.3).

---

## 15. TROUBLESHOOTING — operator report closure

### 15.1 "This sheet is really bad bugged" — 2026-09-06 10:04, iOS, depth-2 stack

All four symptoms trace to **one producer set**, confirmed in code at this tree rather than on
report. All four fixes are in the tree. **Device confirmation is the only outstanding step.**

| Symptom | Root cause | Fix in tree |
|---|---|---|
| Duplicate close control | Obsidian's `Modal` always creates `.modal-title` and an unexposed `.modal-close-button` inside `modalEl` (`host-modal-stand-in.ts:27-33` documents the shape); the shell adds its own `.db-sheet-close` | both found **by reference** and hidden (`nativeClose?.style.setProperty("display","none")`, `mobile-bottom-sheet.ts:257`), **restored on teardown** (`:261`, `:301`) so a rotation back to desktop gets them back |
| Split header/body backgrounds | `.note-database-modal` still carried the desktop centred dialog's frame — background, 1px border, elevation shadow, blur (`styles.css:21648-21653`) — painted over the sheet root's shared fill. Measured pair recorded in the comment: body `rgb(57,57,57)` over root `rgb(46,46,46)` | inside-sheet override `.db-mobile-bottom-sheet > .note-database-modal { background: none; border: 0; box-shadow: none; backdrop-filter: none; }` (`styles.css:21663-21669`). A first `:has()`-based attempt measured as a **no-op on both engines** and shipped **removed** rather than belt-and-braces |
| Blank space above the title | the empty native `.modal-title`'s dead band — the stand-in sizes it at 40px (`host-modal-stand-in.ts:64`); the operator measured roughly **200 CSS px** on device | empty title hidden by reference (`mobile-bottom-sheet.ts:258`) + a new `handle-to-title gap` grammar column that watched **74.4px fall to 34.4px** |
| Parent bleed | **verified NOT a stacking defect** — the child registers, derives depth 2, one scrim sits at z 1001 between parent 1000 and child 1002, and the parent carries `is-stack-parent` opacity 0.88, identical before and after the fix | what read as bleed was the **transparent child** (the background defect) plus the parent legitimately visible above the child's floating top edge (8/382/836 in a 390×844 viewport) |

**Residue**: device read outstanding (roadmap row 59: "Fixed, awaiting device read"); 048 T025's
depth-3 capture gap; the parent-dim composition still two mechanisms; **and the commit-id
discrepancy (§12.1 item 4) to reconcile first.**

### 15.2 "Sheets still looked like the old ones"

**Three landed producers**, each fixed red-first:
1. the two-slot / uncentred header — title 27.67px off-centre on column-manager, fixed by the
   1fr-auto-1fr grid;
2. the pre-C10 flush-only frame — fixed by the classifier (short sheets float at 16 device-px with a
   32 device-px radius; tall stay flush);
3. the host-modal chrome bleed — row 59, §15.1.

**What no landed fix explains**: the **scrim level** (25% vs 48% measured) and the **row pitch** (no
floor vs 50pt measured). Both are still live in the tree and both are **unasserted by any lane row**
— they are P0-3 and P1-1.

### 15.3 "Some sheets overflowed horizontally"

**Closed.** 044 AC-009 is Met: the long-name sweep drove **316 failures → 0**, producing
`.db-mobile-bottom-sheet .db-panel-title { min-width: 0; overflow-wrap: anywhere }`
(`styles.css:12790-12795`), recorded red-first at `3407dab0` with 10 of 11 headers overflowing and
scroll widths 615–687 against a 390px client. Reinforced by `overflow-x: hidden` on the sheet class
itself (`styles.css:253`), added after the positioner's inline write silently introduced the axis
(`:246-252` comment).

**Residual risk**: the same `overflow-wrap` treatment covers `.db-panel-title`, but the FuzzySuggest
surfaces' titles come from user placeholders through the older path *(inference, unmeasured — §12.3
item 6)*.

### 15.4 "Stacked sheets did not look or work right"

Splits in two:
- **Row 59** — fixed in tree, pending device (§15.1).
- **The two nav-move holes that never shipped** — the depth cap (F5.1) and the replace move
  (F2.4/F5.1). These are the residual defect surface. Note that the registered depth-3 pairs are
  *menu*-stacks, so **no shipped surface currently exercises the cap's violation mode**
  *(inference)* — which is exactly why P0-1 needs its own capture scenario (P2-5).

---

## 16. ACKNOWLEDGEMENTS & SOURCES

**Research contributors**
- Lineage `glm-devpass` (`cli-opencode`, `llmgateway/glm-5.3-flash`, reasoningEffort max) — ten
  iterations, all evidence gathering and the first-pass ranking.
- Synthesis pass (this document) — merge, dedupe, template compilation, provenance labelling.

**Resources**
- `specs/005-component-surface-system/051-modal-and-sheet-componentization/design-trueup.md` — the
  measured Anytype baseline of record. **This document's single most load-bearing source**: it
  carries per-surface dispositions, so iterations could diff code against measured values rather
  than re-derive them.
- `specs/005-component-surface-system/roadmap.md` §4 rows 40/41/43/59 and §6A — the landed-work and
  device-read ledger.
- `screenshots/anytype/README.md` — capture index, **descriptions only** (no image reads).
- `research/resource-map.md` — generated this run from the ten lineage delta files by
  `reduce-state.cjs`.

**Method notes worth carrying forward**
- *Worked*: the bounded-file-list discipline; **grep-then-read** on the 22.7k-line stylesheet (three
  reads found every sheet block); using recorded measurements as the comparison baseline instead of
  re-deriving them.
- *Failed*: nothing structural. One correction was issued mid-loop (F7.1 — keyboard placement
  emulation already existed, corrected in iteration 9), and one commit-id discrepancy was left
  flagged rather than adjudicated.

---

## 17. APPENDIX

### Glossary

- **Lane / lane row** — a permanent assertion in the live grammar harness
  (`tools/live/sheet-grammar.mjs`) that runs every release. "No lane row" = the value is unasserted.
- **Red-first** — observing a check fail on the defect state before landing the fix, so the check is
  known to have discriminating power.
- **Negative control** — a deliberately broken variant asserted to fail, proving a column can go red.
- **The three navigation moves** — replace-in-place, stack-a-sheet, stack-a-menu (trueup §3).
- **Depth cap** — the adopted rule that there is no third stacked sheet; the third level replaces
  the second (trueup §6 C4).
- **Stand-in** — a harness double for host chrome (`host-modal-stand-in.ts`) or for the plugin's
  container class on a portalled sheet.

### Convergence Report

- **Stop reason**: `maxIterationsReached`
- **Total iterations**: 10 of 10 (`stopPolicy: max-iterations`; convergence was telemetry only)
- **Converged before cap**: No — `newInfoRatio` stayed above the 0.05 threshold on every iteration,
  as expected under a fixed-count instruction
- **Questions answered**: **5 of 5** (Q1 grammar divergence · Q2 shell bypass · Q3 lane holes ·
  Q4 iOS/WebKit blind spots · Q5 ranked plan)
- **Operator reports**: 4 of 4 mapped to a landed producer or an open divergence, with anchors
- **Remaining questions**: 0 of the five dispatch questions; 9 open items recorded in §12 (5 are
  operator decisions, 4 are empirical)
- **Statuses**: 9 complete, 1 `thought` (iteration 7 — analytical synthesis, no new sources)
- **`newInfoRatio` trend**: 0.90, 0.85, 0.80, 0.75, 0.80, 0.70, 0.65, 0.75, 0.70, 0.40 (avg 0.73)
- **Source diversity**: 16 bounded sources + 1 justified extra across `src/`, `styles.css`,
  `tools/`, `specs/`, roadmap — **no single-source findings**
- **Findings**: 51 merged · 4 P0 / 5 P1 / 7 P2 ranked tasks · 7 labelled inferences · 12 recorded
  dead ends

**Per-iteration index**

| N | Focus | Status | newInfo |
|---|---|---|---|
| 1 | Frame, handle, header vs measured | complete | 0.90 |
| 2 | Shell primitive: composition + constants | complete | 0.85 |
| 3 | Shell bypass audit (Q2) | complete | 0.80 |
| 4 | Lane coverage holes (Q3) | complete | 0.75 |
| 5 | Stacking depth rules | complete | 0.80 |
| 6 | The 10:04 iOS defect set | complete | 0.70 |
| 7 | iOS/WebKit blind spots + verification designs (Q4) | thought | 0.65 |
| 8 | Harness audit: registry, gap-cap threshold | complete | 0.75 |
| 9 | Ranked remediation plan (Q5) | complete | 0.70 |
| 10 | Consolidation + inference audit | complete | 0.40 |

**Quality guards** — source diversity: pass (six source families, every finding multi-anchor).
Focus alignment: pass (one declared focus per iteration; all five questions covered). No
single-weak-source findings: pass (the one non-measurement — handle contrast — is recorded as
unmeasured, not asserted). Spec anchoring: intentionally not exercised — the lineage ran with a
fixed write surface and attempted no generated-fence write-back.

### Related Research
- `specs/005-component-surface-system/044-phone-sheet-alignment/design-trueup.md`, `decision-record.md`
- `specs/005-component-surface-system/048-stacked-sheets/decision-record.md`
- `specs/005-component-surface-system/051-modal-and-sheet-componentization/decision-record.md`,
  `implementation-summary.md`
- `specs/005-component-surface-system/design-system.md`

---

## CHANGELOG & UPDATES

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-09-06 | 1.0.0 | Initial research completed — 10-iteration fan-out lineage `glm-devpass`, 51 findings merged, ranked plan of 4 P0 / 5 P1 / 7 P2 tasks | deep-research loop + synthesis pass |

### Recent Updates
- 2026-09-06: Loop resumed and completed. The lineage's ten iterations were already on disk; the
  fan-out pool had been failing its completion check because the lineage wrote its report to
  `lineages/glm-devpass/research/research.md` while the pool's contract expects
  `lineages/glm-devpass/research.md`. The report was placed at the contract path, the pool
  completed clean (`salvage_miss: 0`, no new iterations), `fanout-merge.cjs` merged 51 findings,
  `reduce-state.cjs` emitted `resource-map.md` from all ten delta files, and this document was
  compiled from the ten iteration files, the merged registry and the final strategy state.
