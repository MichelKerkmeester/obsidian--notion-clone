---
title: "Goal: Sheet Family Remediation"
description: "The durable directive for the sheet family's remediation phase, and the thresholds that decide when the family is closed."
trigger_phrases:
  - "067 goal"
  - "sheet family remediation goal"
  - "depth cap goal"
  - "scrim level goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/067-sheet-family-remediation"
    last_updated_at: "2026-09-06T16:30:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Opened the packet from the sheet family's deep-research synthesis"
    next_safe_action: "Settle the row 26 / row 31 parent-dim disagreement, then start T001"
    blockers:
      - "T012 (the FuzzySuggest disposition) is blocked on the operator, carried from 051 T010"
      - "styles.css edits are serialized by the parent's CSS lane"
      - "surface-shell.ts and mobile-bottom-sheet.ts are 051's file group and are taken one leg at a time"
    key_files:
      - "src/views/overlay-stack.ts"
      - "src/views/surface-shell.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/popover-host.ts"
      - "tools/live/sheet-grammar.mjs"
      - "specs/005-component-surface-system/051-modal-and-sheet-componentization/design-trueup.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-067-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does a stacked menu leave its parent dimmed (trueup row 26) or undimmed (row 31)"
      - "Do the three FuzzySuggestModal subclasses join the shell, or take one shim"
    answered_questions:
      - "The scale(0.96) pull-back: dropped, per the operator's 2026-09-07 ~14:50 ruling — the page under a first sheet carries the scrim dim alone"
      - "The depth cap is a measured value and a shell rule, adopted in full at design-trueup.md C4"
      - "The 44px close survives on the menu-role card: ADR-007 exception E1, an accessibility deviation with a number"
      - "The loop's precondition was waived by the operator at 2026-09-06 ~15:50, Run it now on the current state"
---
# Goal: Sheet Family Remediation

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Close the phone-sheet family — give every adopted Anytype move a producer, put every
measured value behind one source of truth with a lane row that reads the computed value, and read
the whole family on one device build with the blind spots named.

**Why.** `044`, `048` and `051` took the family from "sheets look like the old ones" to near-parity.
A ten-iteration deep-research loop (`051/research/research.md`, 51 findings) then measured what is
left, and it splits three ways. **Unshipped decisions**: the depth cap, the replace-in-place move
and the handle-less menu card are all ADOPT rows in `051/design-trueup.md` with no runtime mechanism
at all. **Live numeric divergences**: the page under a first sheet at 0.75 of undimmed against a measured
0.519, rows with no min-height against a measured 50pt, entrance motion at 260ms with no exit at all
against a reconciled 200/150ms band, a handle at 36 × 4px/8px against a measured 34 × 5pt/6pt.
**Coverage holes**: three shipping phone sheets registered nowhere, several deliverables with no
permanent lane row, and **two thresholds loose enough to pass the state they were written against** —
`HANDLE_TO_TITLE_GAP_MAX_PX = 80` against a 74.4px defect, and the motion band's 180-260ms against
the 260ms it was landed on.

**Corrected against what landed on `main` while this packet was being written**, because a synthesis
that reports a fixed defect is worse than one that reports nothing. `ae4fff81` registered the three
depth-3 stacked capture scenarios, closing `048` T025 and the loop's P2-5. `311f957a` landed the
motion timing band lane row, so the loop's *"the motion band has no lane row"* is false — what is
true, and sharper, is that the row pins the **current** 260ms (`MOTION_BAND_TOKEN_DEFAULT_MS`,
`sheet-grammar.mjs:182`) inside a 180-260ms band, so **correcting the value to 200ms takes that row
red** and the two must move in one commit. And `93205d4d` measured the stacked-parent dim off
decoded PNGs — dark 46 → 33, light 242 → 183 against an undimmed control — which puts the
parent-under-child figure at **0.717**, inside the true-up's 0.710 ± 0.02. That clause is **already
at parity**; what remains red is the page under a *first* sheet.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The research is the read of record for what is wrong; `design-trueup.md` is the read of record for what is right.** Where the loop's synthesis and the true-up disagree about an Anytype value, the true-up wins — it is the measured document (`050` ADR-003). Where they disagree about the *tree*, the tree wins and the finding is corrected in place, dated. Three of the loop's own claims were corrected that way at this packet's opening; each correction is in `decision-record.md`, not silently absorbed. |
| D2 | **Red first, per criterion, on a threshold.** Every row in `acceptance-criteria.md` carries one number or one boolean observed failing on the tree at `6b16b87a` before its fix is written, with the failing figure recorded. This packet has an unusual advantage and must not waste it: **every P0 and P1 threshold is already red**, so none needs a failure state invented for it. |
| D3 | **A lane row asserts a computed value, never a presence.** The family's standing harness failure is a green lane over a divergence it cannot see: `hasSheetHeader` accepts either header shape, `hasSheetHandle` sees existence only, and `HANDLE_TO_TITLE_GAP_MAX_PX = 80` passes the 74.4px defect it was created for. Every row added here reads a computed style or a measured rect and carries its own negative control, following the row-59 pattern — production-module import, negative control, permanent scenario, watched red first. |
| D4 | **`044`'s grammar and `048`'s stacking model are constraints, not deliverables**, exactly as they are for `051` (`051` goal D4). The 14 registered surfaces and 32 registered pairs must still pass after every leg. This packet does not re-specify either contract. |
| D5 | **One value, one owner, one place it is written.** Every numeric divergence in this packet is a symptom of the same structural absence: correct measured values live in `surface-shell.ts` constants and a CSS custom property cannot read them. The bridge is the structural fix and the drift check is the deliverable — a bridge that lands without a check that fails on disagreement has closed nothing. |
| D6 | **Parity by default, and a deviation must be an accessibility one with a number.** `051` ADR-007 carries over unchanged, exceptions **E1**, **E2**, **E3** included. E1 is why the 44px close survives on the handle-less menu card: `#555555` on `#1F1F1F` measures 2.21:1 against WCAG 1.4.11's 3:1, and the handle Anytype substitutes is the only non-text element identifying the dismissal control. A parity move that would delete the close is wrong here, and REQ-002 does not reopen it. |
| D7 | **One leg touches one file group**, carried from `051` D7. `surface-shell.ts` and `mobile-bottom-sheet.ts` are opened once each rather than once per surface; `styles.css` is the exception every leg may reach and is serialized by the parent's CSS lane. |
| D8 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase, and this packet exists because a green lane did not close the last one. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the parent's `goal.md` first** (`../goal.md`) — D1-D14 bind here as written there.
`../roadmap.md` §4 rows 40, 41, 43 and 59 map report to phase, §5.A places this phase, §6A holds
the operator decisions this packet consumes — including the 2026-09-06 ~15:50 ruling that waived
the loop's own precondition — and §7 the conflicts.

**The design read of record is `../051-modal-and-sheet-componentization/design-trueup.md`.** Where
it and any other document disagree about an Anytype value, it wins (`050` ADR-003).

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **No third stacked sheet exists, and the replace move has a body producer.** **Today: no cap
      anywhere in the stack API.** `register` derives `parentId` from the current top sheet with no
      depth check (`overlay-stack.ts:94-96`) and `getDepth` walks the chain unbounded (`:194-209`);
      the only depth-related guard is the cycle-protected parent walk (`:199-207`). The replace move
      exists as a header title swap and a back control (`surface-shell.ts:200-231`, `:428-432`) with
      no body producer, so the two pairs `051` AC-003 enumerates as converting —
      `properties property type picker` and `add view property picker` — are **inexpressible**. Done
      is: both pairs assert **replace**, the count of stacked *sheets* at depth 3 reads **0**, and
      `record column submenu` and `import confirm dropdown chain` keep `depth: 3` untouched, being
      menu-stacks the cap does not govern.
- [ ] **A `menu`-role surface presents on the phone as a handle-less anchored card, and the
      presentation path reads the role.** **Follow-up leg: handle-less, close-retained, parent-
      dimmed are all done and measured live; the "anchored" half of this row's own wording is
      deliberately declined.** All four production `menu`-role surfaces (`owned-menu`,
      `date-picker`, `icon-picker`, `option-color-picker`) now read the role through
      `mountPickerSheetHeader` + `setSheetMount`'s add-only `db-mobile-menu-card` toggle: no grab
      handle, a 44.0×44.0 close target, and a parent dim ratio of **0.390** (band 0.35-0.44),
      measured at 402px. What is NOT done, and not attempted further after one measured trial:
      anchoring the card to its trigger rather than docking it full-width — tried and reverted
      (24 overflowing calendar-grid cells, a broken keyboard-avoidance handoff at the anchored
      width), recorded in `decision-record.md` ADR-002 with a pin at
      `popover-position.ts`'s `mobileSheet` branch. This checkbox stays unchecked because its own
      text says "anchored"; `acceptance-criteria.md` AC-002, whose Given/When/Then never named
      anchoring as a separate clause, is `Met`.
- [x] **The page under a first sheet is dimmed to the measured level, and no lane row is missing
      for it.** **Today: 0.75 of undimmed against a measured 0.519.** `.db-mobile-sheet-scrim` is
      `rgba(0,0,0,0.25)` (`styles.css:319`) against `0.519 / 0.520 / 0.505` luminance across three
      bands (`design-trueup.md` §2b, C3) — roughly half the measured strength. **The stacked-parent
      half of C3 is already at parity and is not reopened**: measured off decoded PNGs at
      `93205d4d`, dark 46 → 33 and light 242 → 183 against an undimmed control, which is **0.717**
      against the measured 0.710 ± 0.02, produced by two steps rather than two scrims —
      `.is-stack-parent` at opacity 0.88 composited under the single scrim. **No lane row asserts
      scrim opacity at all**; the motion row reads the scrim's `animation-duration`, not its colour.
      Done is: **0.52 ± 0.02** on the page under a first sheet (the operator's 2026-09-07 ruling,
      inside the measured 0.519 ± 0.02 band), 0.710 ± 0.02 held on the parent, and a lane row on
      the computed alpha. The `scale(0.96) translateY(4px)` cue is no longer part of this line: it
      was attempted, broke `position: fixed` for the row-selection bar, and the operator dropped it
      outright on 2026-09-07 ~14:50 — the page under a first sheet is dimmed, not scaled.
- [x] **Zero surfaces bypass the shell, and every shipping phone sheet is registered.** **Today: 3
      bypasses and 3 unregistered surfaces, and they are the same three.**
      `attachSheetChromeToModal` is called outside `surface-shell.ts` at `main.ts:3047`,
      `image-file-suggest-modal.ts:40` and `markdown-file-suggest-modal.ts:34`, each repeating the
      same `isTouchDevice` → chrome → `placeSheet` → `keepSheetPlaced` dance; none appears in
      `sheet-grammar.mjs`'s 14 registered surfaces. Done is: **0** direct call sites or a written
      reason per survivor, and all three in the registered set. **Closed 2026-09-07 at the landing:
      3 -> 0** direct call sites (`rg -n "attachSheetChromeToModal\(" src --type ts` returns only
      the definition itself), and all three suggest surfaces are registered and pass all eight
      grammar columns live.
- [x] **Every measured value has one source of truth, and a check fails when the stylesheet
      disagrees with it.** **Today: six declared constants with no consumer.** `SHELL_ENTER_MS =
      200`, `SHELL_EXIT_MS = 150`, `SHELL_PHONE_ROW_HEIGHT_PT = 50`,
      `SHELL_PHONE_HEADER_HEIGHT_PT = 70`, `SHELL_PRIMARY_ACTION_HEIGHT_PT = 50`,
      `SHELL_TRAILING_CHIP_SIZE_PT = 44` (`surface-shell.ts:139-170`) against a stylesheet shipping
      260ms with **no exit transition at all** (`styles.css:130`, `:440-456`) and `.db-panel-row`
      with **no min-height** (`:12366-12373`). The section comment asks consumers to "point at one of
      these instead of repeating the number" and a CSS custom property cannot read a TS constant.
      The lane now pins the stylesheet's side of that disagreement rather than the constant's:
      `MOTION_BAND_TOKEN_DEFAULT_MS = 260` (`sheet-grammar.mjs:182`) asserts the **current** value,
      so the bridge and the row move in one commit or the row goes red on the fix. Done is: the
      bridge exists, and a deliberate disagreement takes a check red.
- [x] **`npm run gate` exits 0 read from `$?`, with one permanent lane row per remaining deliverable
      — the pill, the chip, the header block, the scrim level, the handle geometry and the three
      suggest surfaces — each negative control observed red before green**, and
      the registered counts hold at or above 14 surfaces / 32 pairs. **Today: none of those rows
      exists**, and `HANDLE_TO_TITLE_GAP_MAX_PX = 80` (`sheet-grammar.mjs:228`) passes the 74.4px
      state it was created for.
      **Progress on a third follow-up leg**: `npm run gate` now exits 0 (26/26 green), and every named deliverable — the pill, the chip, the header block, the scrim level, the handle geometry and the three suggest surfaces — carries a permanent lane row with a negative control confirmed cycling red then green. **Ticked on the fourth residual leg**: the header-block deliverable itself closed at 74px inside the true 66-74px band (AC-007 now `Met`), the divider grammar closed across the filter, sort, group and Properties sheets (AC-010 now `Met`), and `T015`/`T020`/`T021` are all `[x]` in `tasks.md` — every named lane row exists with a negative control observed red before green, the gate exits 0, and the registered counts hold.
- [ ] **The operator opens a sheet, a stacked pair, a menu and a destructive confirm on one iOS
      build and reads the family as debugged, refined, perfected.** One build, one sitting, closing
      `044` AC-006, `048` AC-009 and `051` AC-010 together, with the device-only checklist
      (keyboard focus-steal, safe-area inset, rubber-band scrolling, drag-to-dismiss) bound to that
      read. Only the operator closes this row; nothing in this repository can.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Deep-research loop run | Done | `/deep:research:auto`, 10 of 10 iterations, `stopPolicy: max-iterations`, lineage `glm-devpass` on `llmgateway/glm-5.3-flash` at `reasoningEffort: max`, 51 findings merged. `051/research/`, `051` T025 |
| Opus synthesis | Done | This packet, plus the dated amendments in `044`, `048` and `051` and the roadmap reconciliations |
| Level chosen | Done | `recommend-level.sh --loc 1100 --files 20 --architectural` → Level 3, **72/100**, confidence **82%**, phase score **30/50** against the 25 threshold. Both `phase-definitions.md` §2 thresholds met independently, so one coordinated child rather than rows scattered across three packets. Without `--architectural`: 52/100, Level 2, phase 20/50 — recorded so the sensitivity is visible |
| Red-first anchors | Done | Every P0 and P1 threshold verified red on the tree at `6b16b87a` during synthesis, not carried on the loop's report — the file:line for each is in `tasks.md` |
| Implementation | Three landings on `main`, plus a third follow-up leg (this entry) | T001-T019 closed across the first two legs; the third follow-up leg retargeted AC-001's own `REGISTERED_STACKED_PAIRS` entry to the real replace-in-place shape (fixing two production bugs and a capture defect it surfaced), added T015's pill/chip lane rows and narrowed its header-block figure to 75px (still 1px short of the 66-74px band), and closed the T021 divider audit against real reference captures (1 of 3 contexts Met). `npm run gate` reads 26/26 green. Full detail in `tasks.md`, `acceptance-criteria.md` and `implementation-summary.md` |

### Deviations and findings

| Item | Note |
|------|------|
| **The loop's precondition was waived, not met** | `051` T025 and AC-014 both require `044`, `048` and `051` *done and verified as planned* before the loop runs, and the precondition measured **NOT MET** at `5aeb7087`: all three device rows are open. The operator ruled at 2026-09-06 ~15:50, verbatim: *"Run it now on the current state"*. The loop ran against an unverified family and this packet inherits that: **nothing here is device-confirmed**, and the device pass is a criterion rather than a closed row. Recorded in `../roadmap.md` §6A. |
| **Three of the loop's own claims were corrected against the tree** | A finding is a hypothesis. P0-2's threshold as written asked for "no grab handle **and no close button**" — that contradicts `design-trueup.md` row 26, which says the close **stays** under ADR-007 E1; the threshold here is handle-less with the close retained. The commit-id "discrepancy" the loop flagged is not one: `be578988`, `772b24d2` and `e632a1e1` are three real commits with three roles, and `048` T024 already named all three. And AC-011's *"Today: no scrim exists"* is stale — one has existed since `048`, at the wrong level. |
| **Two capture rows disagree about the same move** | `design-trueup.md` row 26 resolves the menu card over a **dimmed** parent; row 31 resolves the popover shape over an **undimmed** one. Both are ADOPT, both are about §3's third move. They were measured off different surface classes and one of them is wrong for the other's case. Named rather than resolved — `decision-record.md` ADR-002 carries it and stays Proposed on that clause. |
| **`design-system.md` §7 is stale on the scrim** | It states *"There is no sheet scrim … A scrim is new construction"*. One has shipped since `048`. Named, not fixed: the design system is the parent's document and this packet does not own it. |
| **Three findings were overtaken by landings on `main` while this packet was written** | Rebasing found them; each is corrected above rather than shipped stale. **P2-5 (depth-3 captures) is closed** — `ae4fff81` registered three `constructed-depth3-*` scenarios and `048` T025 is ticked, so `067` T020 keeps only the replace-pair capture. **P1-2's "no lane row" is false** — `311f957a` landed the motion timing band row, and the real finding is worse than the reported one: the row pins the **current** 260ms (`MOTION_BAND_TOKEN_DEFAULT_MS`, `sheet-grammar.mjs:182`) inside a 180-260ms band, so it is the second threshold in this family that passes the state it was written against, and correcting the value takes the row red. **P0-3's stacked-parent half is at parity** — `93205d4d` measured dark 46 → 33 and light 242 → 183 off decoded PNGs, which is 0.717 against the measured 0.710 ± 0.02, and the dim is two steps rather than two scrims. What stays red is the page under a **first** sheet. |
| **The depth-3 captures produced a finding this packet consumes** | `93205d4d` records it: in all three depth-3 chains the **first-level child is fully buried** — the top child's rect contains the middle panel's entirely, same x, same width, same bottom edge — so nothing of the middle level survives in any of the six images and the header a reader sees over the option list is the dropdown's own. That is a photographed argument for REQ-001's replace move, not a capture defect, and it is stronger evidence than anything the loop found for the same requirement. |
| **Retargeting a "too wide a blast radius" call, on a third follow-up leg, needed no widening after all** | The second follow-up leg declined to point `properties property type picker`'s own `REGISTERED_STACKED_PAIRS` entry at the real replace shape, reasoning the shared 18-assertion battery assumed an independent, separately-measurable child. That assumption did not hold: `openDropdownChild`'s own `newestSheet()` lookup already resolves to the absorbing panel once the depth cap strips the child's sheet class, so the battery's own `child`/`top` variables read the correct element with zero changes to `measureStackedPair`. Retargeting it surfaced two real production bugs (a second, orphaned close control on the absorbed child's own header; `positionToolbarPopover` placing an absorbed dropdown as a fixed, full-viewport layer) and one capture defect (a CSS grid-column-order collision truncating the replaced body's own option labels to `O..`) that the narrower, additive-only proof never exercised. A "too costly to retarget" call is itself a finding, not a fact — this one did not survive being checked against the actual mounting code. |
| **A shared constant's own tuning comment can go stale mid-packet** | `.obnotion-mobile-bottom-sheet-handle::before`'s bottom inset was tuned against "the owned menu's own tighter clearance" — true when written, false by the time T015's header-block clause needed the same constant loosened, because an EARLIER leg of this SAME packet (T006) made every `menu`-role card, owned menu included, handle-less. The stale comparison sat unnoticed through two follow-up legs because nothing forced a re-read of the reasoning until a live sweep needed to know exactly how much room the constant actually had. |
<!-- /ANCHOR:log -->
