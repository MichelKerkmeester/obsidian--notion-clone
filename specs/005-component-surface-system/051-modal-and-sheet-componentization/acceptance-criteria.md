---
title: "Acceptance Criteria: Modal and Sheet Componentization"
description: "The criteria this packet must satisfy before it may be closed, one threshold per requirement, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "051 acceptance criteria"
  - "shell primitive closure gate"
  - "modal componentization ac"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/051-modal-and-sheet-componentization"
    last_updated_at: "2026-09-05T18:30:00Z"
    last_updated_by: "operator-decision"
    recent_action: "Retargeted ac-003/006 and added ac-011/012 to the adopted parity values"
    next_safe_action: "Operator ruling on ADR-007 E4 (the confirm), then begin Phase 2 legs (T004+)"
    blockers:
      - "AC-009 no longer gates on 050: T001 read the captures first-hand and 10 of 35 rows carry the not-seen label"
      - "AC-010 is operator-owned and nothing here can close it"
      - "AC-012's E4 row needs the operator's ruling on whether holding the confirm is permitted under a parity-by-default target"
    key_files:
      - "src/views/surface-shell.ts"
      - "src/views/modals/db-modal.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/modals/confirm-modal.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-051-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Fullscreen survives only for the formula workbench (ADR-004, Accepted); the other three fullscreen subclasses become modal/sheet"
      - "A registered stacked pair may become an in-place sub-page where the Anytype capture shows it, per pair (ADR-002, Accepted)"
      - "Which pairs: two — properties property type picker and add view property picker; 29 keep 048's stacking (design-trueup.md section 4)"
      - "ADR-007: parity by default; deviations only for WCAG 1.4.11, 1.4.3 or a 44px floor; three exceptions E1/E2/E3 and one flagged hold E4"
      - "AC-006's Verification cell restates as a count of the shell's seven properties declared as raw literals outside surface-shell.ts's named constants, red today at >= 20 for the 360px width alone (ADR-006, Accepted)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Modal and Sheet Componentization

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/051-modal-and-sheet-componentization
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
AC-001 through AC-008 align to REQ-001 through REQ-008. AC-009 is the design-evidence row, AC-010
the operator's.

Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390×844 profile with a navbar present. Every threshold carries a failing value
observed on HEAD before the fix (goal D2). Exit statuses are read from `$?` and never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the modal and sheet family, **When** the legs complete, **Then** exactly one site decides a surface's chrome, **or** each survivor carries a written reason in `modal-surface-inventory.md` | Count of chrome-deciding sites against the recorded baseline of **4** (`db-modal.ts:92-113` plus the three direct `attachSheetChromeToModal` callers at `src/main.ts:3047`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34`); each survivor's row in `design-trueup.md` §5 cited. Today: **4**. **T002, confirmed 2026-09-05**: `rg -n "attachSheetChromeToModal\(" src/ --type ts` → 5 lines total, 1 the definition (`mobile-bottom-sheet.ts:219`), 4 callers matching the baseline exactly | Unmet | - |
| AC-002 | REQ-002 | **Given** a surface presented as a sheet, **Then** its title comes from a declared value, and the heading scrape runs only for surfaces that declare none — with that number counted, not assumed | Declared-title count against a baseline of **0 of 20**; the scrape's invocation counted at runtime in the lane. Today: **0 declared, 20 scraped** (`getSheetTitle`, `db-modal.ts:83-88`). **T002, confirmed 2026-09-05**: `rg -n "extends DbModal\b" src/ --type ts` → 20; `rg -n "declaredTitle\|declareTitle\|sheetTitle\s*[:=]" src/views/ --type ts` → 0 matches, no declared-title mechanism exists anywhere; `rg -n "getSheetTitle" src/ --type ts` → the base method plus one override (`create-linked-view-modal.ts:55`), both scrape-family | Unmet | - |
| AC-003 | REQ-003 | **Given** a shell with a sub-page, **When** the sub-page is pushed by pointer, by keyboard and on a phone, **Then** the frame's body and header change in place with a back affordance and the frame's **width and anchored edge** move by **\|Δ\| ≤ 1px** — the cross-axis extent is **not** asserted, being content-driven on desktop and unchanged on phone; **and When** a picker is opened from a shell, **Then** it opens as its own surface and the parent stays undimmed on desktop; **and Then** the converting pairs are exactly the **two** enumerated below and no third stacked *sheet* exists anywhere in the shell | Lane row driving all three push paths and the picker path; negative control: push as a stacked child instead, require the anchored edge to move and the lane to go red. **Threshold corrected 2026-09-05** — the earlier "bounding box moves by \|Δ\| ≤ 1px" is false on the surface it was written for: measured, a desktop replace changes the frame height 316 → 298 → 90 → 166 → 390px within an invariant 360px width (`anytype-menu-set-view-settings-dark.png` and its four sub-pages), while a phone replace changes nothing (frame top **1261**, handle **1278**, in all three of `anytype-mobile-sheet-view-edit-dark.png`, `-view-layout-picker-dark.png`, `-view-gallery-imagepreview-dark.png`). A threshold whose failing value is stated wrongly cannot be observed red, which SC-004 requires. `design-trueup.md` §6 C1. **Pairs enumerated 2026-09-05 (ADR-007)** — the list is closed, so a conversion nobody named is a failure, not a judgment call. **Convert (2)**: `properties property type picker` (`sheet-grammar.mjs:98`) and `add view property picker` (`:114`). **Keep `048`'s stacking (29)**: `filter property picker`, `filter operator picker`, `filter select value picker`, `filter checkbox value picker`, `filter conjunction picker`, `filter date value picker`, `sort field picker`, `sort direction picker`, `properties create property`, `properties column overflow menu`, `settings dropdown field`, `settings ad hoc dropdown`, `settings icon picker`, `settings template file picker`, `settings cover image picker`, `record select value menu`, `record date editor`, `record relation editor`, `record option colour picker`, `record column context menu`, `record column submenu`, `all views overflow menu`, `confirm over a sheet`, `import confirm dropdown chain`, `chart option dropdown`, `calendar option dropdown`, `timeline option dropdown`, `group by dropdown`, `timeline event menu` — ten of them held because nothing equivalent was captured (`design-trueup.md` §4). **Depth cap**: a count of stacked *sheets* at depth 3 → **0**; `record column submenu` and `import confirm dropdown chain` keep their `depth: 3` registration because both are menu-stacks, which Anytype does stack. Today: **no shell affordance exists**, so 0 of 4 paths are assertable. **T002, confirmed 2026-09-05**: `ls src/views/surface-shell.ts` → No such file or directory; `rg -n "createSurfaceShell\|replaceInPlace\|sub-page" src/ --type ts` → 0 matches | Unmet | - |
| AC-004 | REQ-004 | **Given** the census, **Then** every surface carries an inventory row with all six cells filled — surface → shell role → presentation → changes → Anytype pattern (capture filename or named gap) → stays ours — and no census surface is absent | The inventory's row set diffed against the census in `goal.md` §3; every cited capture resolves under `screenshots/anytype/`. **Met 2026-09-05**: `design-trueup.md` §5 carries **35 of 35** — 20 subclasses + 3 outliers + 12 header sites — with 25 naming a capture and 10 carrying **design inferred from source code, not seen**; §4 adds the per-pair ADR-002 ruling for all 31 registered pairs. The file is the one drafted as `modal-surface-inventory.md`, renamed and nothing else | Met | - |
| AC-005 | REQ-005 | **Given** every destructive path in `src/`, **Then** each routes through one exported confirm primitive carrying `044`'s seven grammar elements, and no second confirm implementation exists | Grammar lane on the confirm sheet (**7 of 7**); a count of confirm implementations → **1**. Today: **0 of 7 asserted and 0 exported primitives** — `openAndWait` (`modals/confirm-modal.ts:45`, entry `:98`) is correct but is not the family's exported confirm, which is why `053` ADR-003 and `055` D1 both name one that does not exist. **T002, confirmed 2026-09-05**: `sed -n '35,45p;96,99p' src/views/modals/confirm-modal.ts` → `class ConfirmModal` carries no `export` keyword; only `export function confirmWithModal` is public and it wraps `openAndWait()` rather than exposing it; `grep -n "confirm" tools/live/sheet-grammar.mjs` → the only hits are the `confirm over a sheet` / `import confirm dropdown chain` *stacking*-pair names, no lane asserts the confirm sheet's own header grammar | Unmet | - |
| AC-006 | REQ-006 | **Given** the shell's rendered geometry, **Then** every value below is the measured parity value within its stated tolerance, read from a named value, with every former per-surface literal named or reasoned. **Desktop**: radius **8px**, padding **16px**/**8px**, divider clearance **8px**, row height **28px**, `panel` width **360px**, condition surface **288px**, operator dropdown **232px**. **Phone, floating card**: frame inset **8px ± 1** on left, right and bottom; corner radius **16px ± 1**. **Phone, flush sheet**: left, right and bottom inset **0**, top corners only. **Both shapes**: grab handle **34 × 5pt**, row height **50pt**, header **≈70pt**, plain-row divider inset **20pt ± 1** symmetric, `044`'s close **44px**. **Header**: **three** slots with the title's centre within **± 1px** of the frame's centre. **Primary action**: a full-width pill, height **≥ 44px** (measured target **50pt**), inset **≈21pt** inside each sheet edge, disabled until valid. **Trailing header chip**: **44 × 44px ± 1** | Geometry lane measuring the rendered values; a count of the shell's seven properties (radius, horizontal padding, vertical padding, divider clearance, row height, panel width, phone close) declared as raw literals outside `surface-shell.ts`'s named constants → **0**. **Verification wording restated 2026-09-05 (~18:20) — `decision-record.md` ADR-006, Accepted.** The originally written form ("a count of geometry literals in the shell path → 0") could not be observed red: measured as written that count is trivially 0 today because `src/views/surface-shell.ts` does not exist (confirmed: `ls src/views/surface-shell.ts` → No such file or directory), the same number the criterion needs when the work is done, failing SC-004. The operator accepted ADR-006's restatement, so the denominator moves from a file that does not exist to the surfaces that exist today, red-first against today's scattered count. Today: **per-surface literals, no shell geometry, red at ≥20 for the 360px width alone** — **T002, confirmed 2026-09-05**: `rg -c "360px" styles.css` → 20 separate declarations, none reading one shared constant; the **8px** radius is `--db-radius-lg` (`styles.css:83`), a design-system-wide token reused ad hoc per surface, not a shell-owned value. The **28px** deviation from the 4/8/12/16/24/32 scale is named rather than absorbed: it is simultaneously the measured Anytype row height and our own `design-system.md` §9 coarse-pointer floor. The desktop half was **re-measured off a second capture set on 2026-09-05 and came back identical** (`anytype-menu-set-view-settings-dark.png`, 360 × 316px, 28px rows, 8px clearance, 16px inset — `design-trueup.md` §2a); the phone half is measured for the first time (§2b) and carries the one regression surface, since every `sheet-grammar` selector reading a sheet rect moves with the 8pt inset. **Retargeted 2026-09-05 (~18:30, ADR-007)**: the threshold now carries the full adopted set with tolerances, and the "8pt inset on three sides" it previously stated of every phone sheet is corrected — **two** frame shapes were measured, floating (22 files, device L 24 / R 1181 / bottom 2597) and flush (13 files, L 0 / R 1205 / bottom 2621), and a blanket inset would have failed on thirteen of the thirty-five census surfaces (`design-trueup.md` §6 C10). The pill (**341.7 × 50.0pt**), the chip (**44.0 × 44.0pt**) and the divider (**19.3pt** each side) were sampled for this retarget and are cited in §8a with their device coordinates. **ADR-006's accepted Verification form is unchanged by this** — the denominator is still the seven properties declared as raw literals outside the shell's constants, red at ≥20; the retarget moved the *target values*, not the metric. Today's red is unchanged: the tree did not move | Unmet | - |
| AC-007 | REQ-007 | **Given** the shell's motion, **Then** enter is **200ms `ease-out`** and exit **150ms `ease-in`**, and every surface the shell produces honours `prefers-reduced-motion` | Motion lane plus the reduced-motion assertion; the exit value's provenance recorded — **150ms is the closest in-band value to `047`'s source-read 0.1s**, which sits below the 120ms floor for direct feedback and would read as a cut rather than a dismissal (`design-trueup.md` §4). Today: **per-surface literals**. **T002, confirmed 2026-09-05**: `rg -n "\-\-db-sheet-enter" styles.css` → one shared var at `260ms` (`:121`), used only for sheet entrance (`ease-out`) with no matching exit token; direct-literal transitions/animations elsewhere in `styles.css` (excluding shimmer/shake) carry `120ms` (`.db-overlay-enter`, `:175`), `180ms` (`.is-stack-parent` scale-back, `:255`) — three distinct per-surface-class values, none matching the 200ms/150ms target | Unmet | - |
| AC-008 | REQ-008 | **Given** the gate, **When** `npm run gate >/tmp/gate.log 2>&1; echo $?` runs, **Then** it reads **0** with one permanent lane row per shell deliverable, each negative control observed red then green; `npm run replay` holds with reversed **0**; the **12** registered `sheet-grammar` surfaces and **31** registered stacked pairs stay green | The gate log and the recorded red observations in `checklist.md` C10; the surface and pair counts read from `tools/live/sheet-grammar.mjs`. Today: **the shell's lane rows do not exist**. **T002, confirmed 2026-09-05**: `rg -n "shell" tools/gate.mjs` → only an unrelated comment and the `shell: false` spawn option, zero shell-deliverable check entries; `node tools/live/sheet-grammar.mjs` → exit 0, 12 registered surfaces and 31 registered stacked pairs all green, 0 `FAIL` lines (`checklist.md` C8); `node tools/live/replay.mjs` → exit 0, `PASS — all 28 results still hold`, `reversed: 0`. Full `npm run gate` not re-run for this leg — see `checklist.md` C10 for why | Unmet | - |
| AC-009 | REQ-003, REQ-006, REQ-007 | **Given** every adopted Anytype behaviour and value in this packet, **Then** each names the capture file it was read from, and each behaviour no capture shows carries the label **design inferred from source code, not seen** | The Anytype column of `design-trueup.md` §5 read against the files under `screenshots/anytype/`. **Regime changed 2026-09-05, and it changed in the stricter direction.** The row previously said this packet consumes `050`'s read rather than repeating it. It could not: `050` was written before the 118 iOS captures landed, so the phone half of every shell value had no source at all. T001 opened the files directly — 151 desktop states, 600 menu files, 118 iOS sheets — and `design-trueup.md` is that first-hand read. `050`'s desktop values were re-measured off a second capture set and agree; `050` C6's desktop empty-state finding is left standing rather than overturned by the iOS client that disagrees with it (§6 C7). A row claiming capture evidence no file carries still fails this criterion, and **10 of the 35 rows carry the not-seen label** rather than a guess. **T002, confirmed 2026-09-05**: all 24 unique capture filenames cited in `design-trueup.md` §5 resolve under `screenshots/anytype/` (`find screenshots/anytype -name "<file>"` checked for each, 0 missing). One nuance recorded, not corrected here — `design-trueup.md` is outside this task's write authority: rows 7, 17 and 32 also carry "Not seen" phrasing in §5 but are not counted in the document's own "ten" tally (§7) — row 7 (`DeleteDatabaseModal`) cites two capture files as styling evidence for the adjacent destructive-row pattern even though the confirm itself is unseen, and rows 17 (`FormulaModal`, kept `fullscreen`) and 32 (`option-color-picker.ts`, "Ours") adopt nothing from Anytype, so AC-009's adopted-behaviour label does not apply to them. This is an adjacent finding, not a defect in this criterion's own count | Unmet | - |
| AC-010 | REQ-001, REQ-003, REQ-005 | **Given** a released build, **When** the operator opens a modal, a sheet, a sub-page and a destructive confirm on iOS and on desktop, **Then** they read as one surface family — debugged, refined, perfected | The operator's own words. **Only the operator closes this row; nothing in this repository can** (parent D3) | Unmet | - |
| AC-011 | REQ-006 | **Given** a sheet over a page and a sheet over a sheet, **Then** the page under a first sheet renders at **0.519 ± 0.02** of its undimmed luminance and a parent sheet under a stacked child at **0.710 ± 0.02**, and a stacked *menu* leaves its parent undimmed on desktop | Scrim lane sampling mean band luminance with and without the child present, on the same three bands, and dividing — the method `design-trueup.md` §2b states. The two figures are **T001's measurements, carried unchanged and labelled as carried**: the retarget deliberately did not re-derive them, because a re-derivation on differently chosen bands is not a check of them and a second number from a non-comparable sample would manufacture a disagreement rather than confirm one (§8a). Provenance: page-under-sheet `-view-edit-` against `anytype-mobile-set-grid-dark.png`, three bands at 0.519 / 0.520 / 0.505; parent-under-child `-cell-url-` against `-object-properties-`, three bands all 0.710. Today: **no scrim exists** — `design-system.md` §7 states it outright ("There is no sheet scrim … A scrim is new construction"), and `design-trueup.md` §6 C3 records that as the red. The value is `048`'s to own and this packet consumes it | Unmet | - |
| AC-012 | REQ-009 | **Given** every decision in `design-trueup.md`, **Then** each reads **ADOPT**, **FLIPPED**, **HOLD** or **REFUSE**; every `REFUSE` names an ADR-007 exception with a measurement; and the exception count is exactly **three** (E1, E2, E3) plus **one** flagged hold (E4) | A count over `design-trueup.md` §5's 35 decision cells and §6's 10 resolutions: cells not opening with one of the four words → **0** (post-retarget tally, countable off the file: §5 at **16 ADOPT / 7 FLIPPED / 12 HOLD / 0 REFUSE**, §6 at **9 ADOPT / 1 REFUSE**); `REFUSE` cells naming no ADR-007 exception → **0**; ADR-007 exceptions whose permitted ground is not WCAG 1.4.11, WCAG 1.4.3 or a 44px floor → **0**. **Red-first, measured at T001's state**: 15 of the 35 §5 cells declined a measured Anytype value with no exception named and no ground stated (rows 2, 3, 4, 5, 12, 15, 19, 21, 22, 23, 26, 27, 29, 33, 35), and 3 of the 10 §6 resolutions deferred, routed or declined one (C4, C7, C8) — **18 undeclared declines**, which is the figure this criterion closes from. **E4 is the open half**: holding the confirm is a data-loss deviation, not an accessibility one, so it does not fit the permitted grounds and the row cannot read `Met` until the operator rules on it (ADR-007) | Unmet | ADR-007 |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is `Waived` or
`Superseded`, naming a decision record that exists in `decision-record.md`. A waiver naming an ADR
that is not there fails validation: the point of a waiver is that someone recorded the reasoning, so
an unbacked waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No — 1 of 12 rows Met (AC-004), 11 open

**AC-004 is Met** as of 2026-09-05: T001 opened the captures and `design-trueup.md` dispositions all
35 census surfaces and all 31 registered pairs. Every other row is open, which is correct for a
packet whose code has not started. AC-001 is the headline — four places decide chrome and the count
is the whole argument. AC-003's threshold was **corrected before it was ever measured**, because the
capture showed the stated failing value was false on desktop; a threshold nobody can observe red is
not a gate. AC-005 is the row two sibling packets are waiting on: both `053` and `055` name a confirm
primitive nobody exports yet, and the captures confirm there is no reference for it — Anytype raises
no destructive confirm anywhere in 718 files, because its deletions are reversible and ours are not.
AC-009 is the honesty row and it got stricter: the packet now reads the captures first-hand, and 10
of 35 rows say **not seen** and mean it. AC-010 is the operator's and is the only row that closes the
ask behind the phase.

**T002, 2026-09-05: every Unmet row's Today figure was measured against HEAD and confirmed to
match, or corrected.** AC-001, AC-002, AC-003, AC-005, AC-007, AC-008 and AC-009 all measured exactly
as previously stated (`rg`, `node`, and the `sheet-grammar`/`replay` live harnesses; commands and
output cited inline per row). Two things changed: AC-006's Verification cell cannot be observed red
as written — it reads "0" both before the shell exists and after it is built correctly — and
`decision-record.md` ADR-006, **Accepted 2026-09-05 (~18:20)**, restates it against today's
scattered-literal count instead.
`checklist.md` C4 had gone stale after T001 landed (still read "file does not exist") and is corrected
to match AC-004's `Met` status. `tasks.md` T002 is ticked on this basis.

**ADR-007, 2026-09-05 (~18:30): the thresholds were retargeted to the adopted parity values, and
two rows were added.** The operator's *"Yes, parity by default"* made eighteen previously-declined
decisions into adoptions, so AC-003 now enumerates the closed pair list and the depth cap, and
AC-006 carries the full geometry set with tolerances instead of a partial list — its ADR-006-accepted
Verification metric is untouched, because the retarget moved target values rather than the metric.
**AC-011** is the scrim, which had a measured pair and no threshold. **AC-012** is the rule itself,
and it is the row with the most useful red on it: **18 decisions declined a measured value without
naming a ground**, which is a number, not an impression. One correction went toward the reference
rather than away from it — AC-006's "8pt inset on three sides" was a blanket over **two** measured
frame shapes and would have failed on thirteen of thirty-five surfaces.

**None of T002's reds moved.** They describe HEAD at `de4783bb`, and the retarget changed documents
rather than code. AC-010 and its `checklist.md` row stay unticked; they are the operator's.
<!-- /ANCHOR:closure -->
