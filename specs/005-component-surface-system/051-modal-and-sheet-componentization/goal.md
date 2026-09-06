---
title: "Goal: Modal and Sheet Componentization"
description: "The durable directive for the modal/sheet family phase, and the criteria that decide when it is done."
trigger_phrases:
  - "051 goal"
  - "modal componentization goal"
  - "sheet shell primitive goal"
  - "confirm primitive goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/051-modal-and-sheet-componentization"
    last_updated_at: "2026-09-06T14:00:00Z"
    last_updated_by: "implementer-session-fourth-landing"
    recent_action: "Closed AC-013 by the Keep-the-overlay ruling and ticked T024 against 5aeb7087"
    next_safe_action: "Take T015's three missing lane rows, then T010's operator question"
    blockers:
      - "styles.css edits are serialized by the parent's CSS lane"
      - "T010 stays blocked on the operator (spec.md §11's second open question, unanswerable from any capture)"
    key_files:
      - "src/views/modals/db-modal.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/modals/confirm-modal.ts"
      - "src/views/confirm-sheet.ts"
      - "tools/live/sheet-grammar.mjs"
      - "specs/005-component-surface-system/050-anytype-adoption/design-trueup.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-051-goal"
      parent_session_id: null
    completion_pct: 22
    open_questions:
      - "Do the three FuzzySuggestModal subclasses join the shell, or stay Obsidian-native with a shim"
      - "Does the fullscreen presentation survive as a third mode, or collapse into the sheet with a height role"
    answered_questions:
      - "The confirm primitive belongs to this packet; 055 references it rather than re-specifying it"
      - "048's stacking model is a constraint here, not a deliverable and not re-specified"
      - "Anytype's replace-in-place-with-back pattern for sub-pages is captured and adopted (design-trueup.md REQ-002)"
---
# Goal: Modal and Sheet Componentization

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Reduce every modal and every sheet in the plugin to **one shell primitive** — one
definition that produces the desktop modal and the phone sheet, owns the header, the close, the
drag, the placement and the entrance, and carries the sub-page navigation Anytype's captures show —
plus **one confirm primitive** every destructive path routes through; and keep what the program has
ruled stays ours.

**Why.** The operator's instruction of 2026-09-05, verbatim: *"research recommendations and how to
tackle / update / improve every modal, sheet and general ui ux to take the best from AnyType and
componentize stuff as much as possible."* `044` gave a first sheet its grammar and `048` gave a
second sheet its stacking model. Neither owns the **shell**: today the family is `DbModal`'s
presentation switch, `mobile-bottom-sheet.ts`'s 840-line engine with nineteen exports, twelve
independent `createSheetHeader` call sites, and three `FuzzySuggestModal` subclasses that reach
past `DbModal` to call `attachSheetChromeToModal` themselves. One surface's chrome is four
decisions taken in four files.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Captures first, and this is a gate rather than a preference.** Every shell behaviour this packet adopts is trued against a real Anytype screen before it is written. `050`'s `design-trueup.md` is the read of record and this packet consumes it rather than re-reading the sweep; a behaviour that document marks *design inferred from source code, not seen* carries that label here too, in its own task. Nothing is designed from a guess about a screen nobody opened. |
| D2 | **Red first, per criterion, on a threshold.** Every criterion in `acceptance-criteria.md` carries one number or one boolean, observed failing on the current tree before the work is written, with the failing figure recorded in `checklist.md`. A threshold that cannot be made to fail is not a threshold — the six false premises `050` found are the scar this decision exists to avoid repeating. |
| D3 | **Desktop and phone, both, per surface.** The shell has one definition and two presentations; a surface that lands on desktop only is half done. Where a behaviour has no phone expression, the task says so and says why. Silence is not a disposition. |
| D4 | **`044`'s sheet grammar and `048`'s stacking model are constraints, not deliverables.** `044`'s seven elements bind every phone surface the shell produces; `048`'s stacking model binds every surface that can open over another, and this packet **does not re-specify it** — the twelve registered surfaces and thirty-one registered stacked pairs in `tools/live/sheet-grammar.mjs` must still pass after every leg. |
| D5 | **The confirm primitive is this packet's, and it is the only one.** `ConfirmModal` (`modals/confirm-modal.ts`) and its `openAndWait` become the single confirm path, gain `044`'s header grammar, and are exported for every consumer. `053`'s sort-conflict confirm and `055`'s destructive-confirm state both **reference** this primitive; neither builds a second. |
| D6 | **Kept ours, per the program's rulings.** The table view, formulas/rollups/calculations, the Project Manager 1:1 board and gantt parity (`037`/`038`), `023`'s editable note body, and the bottom sheets' *ownership* (`003`/`016`/`031`) are not redesigned here. A shell change that moves a reference pixel is wrong until the parity captures are re-read and shown unchanged. |
| D7 | **One leg touches one file group.** Legs are grouped by file, so `mobile-bottom-sheet.ts` and `db-modal.ts` are each opened once rather than once per surface. `styles.css` is the exception every leg may reach and is serialized by the parent's CSS lane. |
| D8 | **Anytype is a design source, not a data model.** `050`'s D6 non-adoptions carry over unchanged: no Objects/Types/Queries, no sidebar widgets, no full template system, no dynamic filter values. And the two values `050` **refused** stay refused: the `#232323` row highlight at 1.14:1, and colour-only active-state signalling. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the parent's `goal.md` first** (`../goal.md`) — D1-D14 bind here as written there.
`../roadmap.md` §4 maps report to phase, §5.A places this phase, §6A holds the operator decisions
this packet consumes (header everywhere, 16px sheet inset and title, `048` D1's modals-as-sheets
ruling, the "debugged, refined, perfected" bar), and §7 the conflicts.

**The design read of record is `../050-anytype-adoption/design-trueup.md`,** not `047`'s research.
Where the two disagree, the true-up wins — that is `050`'s ADR-003, Accepted 2026-09-05, and it
binds every packet that designs against an Anytype screen.

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **One shell primitive produces every modal and every sheet, and the replaced vocabularies are
      gone.** **Today: four.** `DbModal.applyPresentation` (`modals/db-modal.ts:92-113`) decides
      one; `attachSheetChromeToModal` is called directly by three non-`DbModal` surfaces
      (`src/main.ts:3047`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34`);
      `createSheetHeader` is called independently at **twelve** sites; and `getSheetTitle`
      (`db-modal.ts:83-88`) recovers a title by **scraping the first `h1`/`h2`/`h3` in the content**
      because no surface declares one. Done is one constructor, one declared title per surface, and
      the three direct `attachSheetChromeToModal` callers routed through it or dispositioned in
      `modal-surface-inventory.md` with a written reason.
- [ ] **Every modal surface in the family is dispositioned in `modal-surface-inventory.md`:
      surface → shell role → presentation → changes → Anytype pattern with its capture or its named
      gap → stays ours.** **Today: no such table exists.** The census it is built from is real and
      counted from source at HEAD: **20** `extends DbModal` subclasses, of which **13** declare
      `sheet`, **4** declare `fullscreen` and **3** inherit the `sheet` default; **3**
      `FuzzySuggestModal` subclasses outside `DbModal` entirely; **12** `createSheetHeader` call
      sites; and `mobile-bottom-sheet.ts` at **840 lines** with **19 exports**.
- [ ] **A sub-page inside a shell replaces in place with a back affordance, and a picker opened from
      a shell opens as its own surface over an undimmed parent.** **Today: neither pattern exists as
      a shell affordance** — a sub-page is whatever its own surface builds, and `048`'s stacking is
      the only thing a child surface inherits. This is `design-trueup.md` REQ-002's captured finding
      (`anytype-view-settings-panel-dark.png`: tapping `Layout` swaps the panel body inside the same
      360px frame and the header becomes `‹ Layout`; `+ New filter` opens a 256px picker that
      overlaps its parent, which stays fully visible and undimmed), and it is the phone-correct
      pattern `048` REQ-002 already prefers — a parent that does not move is cheaper than a parent
      that dims and scales back.
- [x] **One confirm primitive, carrying `044`'s seven grammar elements, is the only confirm path.**
      **Today: 0 of 7.** `ConfirmModal` declares `sheet` (`modals/confirm-modal.ts:42`,
      `super(app, "sheet")`) and inherits `DbModal`'s chrome, but the phase that owns the confirm as
      a *primitive* does not exist, so `053`'s sort-conflict confirm and `055`'s destructive-confirm
      state each name a confirm nobody exports.
      **Fourth landing, 2026-09-06 — 7 of 7, one path.** `src/views/confirm-sheet.ts` exports
      `buildConfirmSheetBody`; `modals/confirm-modal.ts` now `export class ConfirmModal`, consuming
      it rather than hand-building the same markup a second time. `tools/live/sheet-grammar.mjs`'s
      `confirm` row mounts the real primitive (imported, not mirrored) and is asserted at 7 of 7
      canonical grammar elements plus the dropdown column, including in the title-centring probe it
      was previously excluded from. `053` and `055` were already consumers of the `confirmWithModal`
      wrapper around this primitive at every sort-conflict and destructive call site. This bullet is
      silent on E4 (whether a destructive confirm is shown at all) by design — that stays the
      operator's, tracked at AC-012 — and answers only whether one exported path exists, which it
      does.
- [ ] **The shell's geometry and motion read from the values `050` measured, not from per-surface
      literals.** **Today: per-surface literals**, and the shell has no geometry of its own. The
      adopted values are `design-trueup.md` §2 and §4: **8px** popover radius, **16px** horizontal
      and **8px** vertical padding, **8px** divider clearance, **28px** rows (adopted as the
      measured Anytype value *and* our own `design-system.md` §9 coarse-pointer floor — the named
      deviation from the 4/8/12/16/24/32 scale, recorded rather than absorbed), **360px** for the
      `panel` role, and motion **enter 200ms `ease-out` / exit 150ms `ease-in`**. On the phone the
      floor is `044`'s **44px** close, unchanged.
- [ ] **`npm run gate` exits 0 read from `$?`, with one permanent lane row per shell deliverable,
      each negative control observed red before green**; `npm run replay` holds with reversed 0; the
      **12** registered `sheet-grammar` surfaces and **31** registered stacked pairs still pass; and
      the board and gantt reference captures are `pixelHash`-identical to their baseline or the
      difference carries an operator ruling.
      **Open on the lane-row clause alone, re-derived 2026-09-06 at `main` `5aeb7087`.** Three of
      the four clauses hold: the gate read 26 green / 0 red at this tree's own landing, `npm run
      replay` held at 28/28 with reversed 0 (T017), and the 32 protected board and gantt entries
      are `pixelHash`-identical (T016). The registry figures in this row are the ones it was written
      with; the lane now registers **14** surfaces and **32** pairs and passes all of them (2041
      PASS / 0 FAIL, exit 0), the growth being `column-manager` at `3ae2818e` and the operator's own
      `properties edit property` pair at `5fccf193`. What keeps the row open is "one permanent lane
      row per shell deliverable": three deliverables have none, named in `tasks.md` T015 — the
      primary action pill, the trailing header chip, and the motion timing band; the sub-page shape
      has no row because it has no production producer.
- [ ] **The operator opens a modal, a sheet, a sub-page and a destructive confirm on iOS and on
      desktop and reads them as one surface family, debugged, refined, perfected.** Only the
      operator closes this row; nothing in this repository can.
- [x] **The desktop database Settings surface opens as a right side sheet: a full-height panel
      docked to the right edge, the database stays visible and interactive to its left, and the
      panel scrolls independently of it.** **Added 2026-09-06** from the operator's report and
      ruling (`goal.md` §4 amendment below). **Observed red** on the shipped renderer before the
      change, measured on the `view-config` scenario through the render-assertion bundle in
      headless Chrome at 1200x900: a 360x560px anchored dropdown, the panel itself the scroller
      with its header carried off the top, 1776px of content in a 576px client box, description
      textarea 58px in a 236px column. Green now, same mount: `position: absolute`,
      `inset 0 0 0 auto`, **420px** wide, height 844px which is the container's own,
      `border-left 1px`, `border-radius 0`, `overflow: hidden` on the panel with
      `.db-view-config-body` the only scroller at 1672px inside 776px, textarea 84px in a 279px
      column, no inline `top`/`left` written; focus trapped, and a picker opened from a row inside
      it mounting as a container sibling at `z-index` 100 against the panel's 50.
      **The fourth clause is closed by ruling, 2026-09-06 (~10:55), operator: *"Keep the
      overlay."*** *Interactive* means the database stays visible and independently scrollable; a
      pointer-down on it still dismisses the sheet through the shared `overlayStack`
      outside-pointerdown contract, and no surface becomes exempt from it. Recorded in ADR-008's
      amendment and on AC-013, which is now `Met`. **What this row does not close:** T023, the
      lane row for the shape, deliberately not taken while one surface uses it.
- [ ] **The sheet family's device pass runs an extra deep-research loop before this family is
      called done.** **Added 2026-09-06** from the operator's 10:04 standing instruction
      (`../roadmap.md` §4 row 59, §6A). It is not a code criterion and it is not a substitute for
      any row above: it starts only once `044`, `048` and `051` are each done **and verified as
      planned**, and it closes when the Opus synthesis has landed its phase updates. Executor spec
      in §4's amendment below, and the exact dispatch in `tasks.md` T025. **Today: no such loop has
      run** — `deep-research-state.jsonl` at the program root is 0 bytes.
      **Precondition verdict, 2026-09-06 at `main` `5aeb7087`: NOT MET.** *Verified as planned* is
      the operator's device read under D3, and none of the three packets has one: `044` AC-006,
      `048` AC-009 and this packet's AC-010 are all open, with no reply landed since the 0.0.23
      check. Two non-operator rows also remain: `048`'s T025 (no depth-3 stacked capture scenario
      exists) and this packet's own T010, T015 and T023. The full row-by-row table is in `tasks.md`
      T025.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened from the operator's componentization instruction | Done | Operator 2026-09-05, verbatim in §1 |
| Level chosen | Done | `recommend-level.sh --loc 1600 --files 18` → Level 2, **51/100**, confidence **90%**, phase score **20/50** against a 25 threshold, so a standard child. Raised to **Level 3** on judgment, the same call `050`, `052`, `053` and `055` made at comparable numbers — the shell binds every surface in the plugin |
| Source census of the modal and sheet families | Done | §3 criterion 2, every figure counted from HEAD |
| Designs trued against the captures | Done first-hand | This packet's own `design-trueup.md` — 151 desktop states, 600 menu files, 118 iOS sheets, every number sampled per pixel. `050`'s read is extended, not consumed: it had no phone captures, so the phone half of every shell value is measured here for the first time |
| `modal-surface-inventory.md` | Done | Landed as `design-trueup.md` — the filename changed and nothing else did. 35 of 35 census rows, 31 of 31 registered pairs |
| **Retargeted to Anytype parity by default** | Done | Operator 2026-09-05 (~18:30): *"Yes, parity by default."* `decision-record.md` ADR-007 (Accepted); `design-trueup.md` §8. **18** declines flipped, **3** accessibility exceptions named with their measurements, **1** hold flagged for the operator (the confirm), **1** over-generalisation corrected (two phone frame shapes, not one) |
| Red-first measurements | Done | `checklist.md`'s Today column filled across every criterion, 2026-09-05 onward |
| Shell and confirm legs | Done | T003-T009 (shell, 2026-09-05/06) and T013 (confirm, fourth landing 2026-09-06 — `confirm-sheet.ts` exported, `ConfirmModal` exported, `053`/`055` already consuming it) |
| Lane rows | Partial | Title centring and the C10 frame shape (T011/T012), plus the confirm grammar's fidelity and the 44px edge-control token (T015, fourth landing) are permanent rows with negative controls. The primary-action pill, the trailing chip and motion timing (AC-006/AC-007) still have none |
| Device pass | Pending | T018, operator-owned, stays unticked |

### Deviations and findings

| Item | Note |
|------|------|
| **This packet had no usable upstream draft** | The external leaf (GLM 5.3 flash, `worktrees/080-phase-modal-componentization`) ran `create.sh` and died before writing content: `spec.md` was 15 lines of scaffold comment, `plan.md` 8, `tasks.md` a bare title line, and `goal.md`, `checklist.md`, `acceptance-criteria.md` and `decision-record.md` were absent. Every document in this packet is in-runtime work. Recorded because the four sibling packets *were* drafted externally and reviewed, and this one was not — the two have different provenance and a later reader should not assume otherwise. |
| The title is scraped, not declared | `getSheetTitle` (`db-modal.ts:83-88`) finds the first `h1`/`h2`/`h3` in `contentEl` that is not already inside `.db-sheet-modal-header`, and falls back to `t("menu.title")`. It works, and it means a surface's sheet title is a side effect of its heading markup. The shell asks for a declared title; the scrape survives as the fallback for a surface that does not declare one. |
| `fullscreen` is a third presentation with four users | `ChartDrilldownModal` (`chart-renderer.ts:972`), `InvalidTimeEventsModal` (`:78`), `FormulaModal` (`:217`) and `PropertyTypeConflictModal` (`:90`). Whether it survives as a mode or collapses into the sheet with a height role is `spec.md` §11's first open question — not pre-decided here, because the formula workbench is 1,664 lines and stays ours. |
| **The true-up measured parity and then declined it fifteen times** | T001 read the captures under *"capture wins"* and applied it row by row rather than as a rule. Fifteen of the thirty-five census cells recorded a measured Anytype value in the pattern column and kept ours in the decision column — some for a real reason (no equivalent surface exists), some because the change looked large, some with no stated reason at all. Three of the nine contradictions were deferred, routed or declined the same way. The operator's ~18:30 ruling replaces the judgment with a rule and ADR-007 records it; **18** decisions flipped. Recorded because the pattern — measure a reference, then decline it surface by surface — converges on neither the reference nor a design of its own, and it is the same drift `spec.md` §2 names as the family's original defect. |
| **One value was over-generalised, not under-adopted** | REQ-006 said the phone frame has "an 8pt inset on three sides". Re-measuring all 52 dark sheet captures for the retarget found **two** shapes: a floating card at device L 24 / R 1181 / bottom 2597 on 22 files, and a flush edge-to-edge sheet at L 0 / R 1205 / bottom 2621 on 13. A blanket inset would have been wrong on thirteen of the thirty-five census surfaces. The boundary between the shapes is **unobserved** — every floating capture sits at a top edge ≥ 299pt and every flush one at ≤ 198pt, and nothing was captured between — so the shell takes the shape from a declared height role rather than from an invented threshold. |
| `048` D1 already moved the modals | The operator's 2026-09-05 ruling — Obsidian modals opened from a sheet on the phone become stacked sheets, none stay modals — landed at `915591c2` and gave all subclasses the shared header. That is the reason this packet is componentization rather than repair: the behaviour is right and the code that produces it is in four places. |

### 2026-09-06 amendment: the desktop Settings side sheet, and ADR-007 E4 closes

**Operator report, desktop, ~08:15 (screenshots supplied with the report; the operator's own captures, not committed to this repository):** *"btw this dropdown on desktop
is horrible … should probably become a sheet, on desktop at least, and get dedicated button."* The
database Settings panel opens today as a tall anchored dropdown (`view-config-panel-renderer.ts`
through `positionToolbarPopover`'s general preset), which is none of `design-system.md` §3's roles —
too tall for `panel`, not a phone `sheet`, and not the `condition panel` role either.

**Ruling: "Right side sheet."** A full-height panel docked to the right edge of the viewport, with
the database staying visible and interactive to its left, and the panel scrolling independently of
the database beneath it. This is a **new shell shape**, not a wider `panel` — `design-system.md` §5's
policy ("declare a wider role, not a bespoke number") does not reach a desktop surface that is
full-height and edge-docked rather than anchored to a trigger, so this packet's own
`decision-record.md` gains a new ADR for the shape and its grammar rather than stretching an
anchored-popover role to fit it.
Recorded in `../roadmap.md` §4 (new row) and `../roadmap.md` §6A. Owner: this packet, for the shell
shape in `surface-shell.ts`; `053` owns the second half of the same report — a dedicated gear button
in the toolbar rail, see `053/goal.md`'s own amendment.

**ADR-007 E4 closes.** The operator's ruling, 2026-09-06 ~07:50, verbatim: **"No confirm for single
delete, Undo toast."** Single-row delete becomes immediate, with Undo carried on the toast; the
confirm stays for bulk delete and for anything not undoable. This is a third reading of E4, not
either of the two ADR-007 posed: not "keep the confirm because there is no Bin" (reading 1) and not
"build a `TrashManagerModal`" (reading 2) — the operator chose Undo-on-toast, which this packet
already has a primitive for (`055`'s toast/undo vocabulary, D5's cross-reference). E4 is closed;
`decision-record.md`'s ADR-007 is amended in place with the ruling, dated, rather than rewritten.
Owner of the call-site changes: `055` (`deleteRow` callers); this packet's own scope is only the
confirm primitive `055` calls into for the cases that still need one.

### 2026-09-06 amendment: the iOS stacked-sheet report, and the planned deep-research loop

**Operator, 2026-09-06 10:04, on iOS running 0.0.29**, verbatim: *"This sheet is really bad bugged
on current ios make sure the sheet phase gets an extra deep research loop once done and verified as
planned like 10 iters with glm 5.3 flash max, properly prompt them so they dont get stuck use
openrouter or devpass than let a opus synthesize and update / add phases to remediate as needed"*.

**The shell half of the defect.** Four defects on one depth-2 stack (Edit property → Month over
Properties): a duplicate close control, a header/body background split, roughly 200 CSS px of dead
space above the title, and the parent Properties sheet bleeding through with its rows and a "14"
count badge over the toolbar. `048/goal.md` carries the criterion and `048/tasks.md` T024 the fix
leg (`worktrees/159-fix-048-ios-stacked-sheet`); this packet owns `surface-shell.ts` and
`mobile-bottom-sheet.ts`, which is why that leg lands **after** T021-T023's side-sheet work frees
both files rather than racing it. `044` owns the header grammar the duplicate control and the ink
split belong to. Three owners, one capture, named rather than merged.

**The standing instruction, recorded here as a planned leg with its executor spec.** It is the
parent-level check on this whole family, so it lives with the family's shell owner rather than
inside one defect's packet.

| Field | Value |
|---|---|
| **Starts when** | `044`, `048` and `051` are each done **and verified as planned** — not shipped, not landed. Under D3 that is the second state, and the operator's words are *"once done and verified"* |
| **Command** | `/deep:research:auto`, **10 iterations**, `--stop-policy=max-iterations` (the operator asked for a fixed count, not convergence) |
| **Executors** | `cli-pi` on GLM 5.3 flash max — `openrouter/z-ai/glm-5.3-flash` first, `llmgateway` (DevPass) as the fallback transport. Read `.opencode/skills/cli-external-orchestration/cli-pi/SKILL.md` before composing any prompt (AGENTS.md §10 CLI dispatch) |
| **Prompt discipline** | Bounded, because the operator's own words are *"properly prompt them so they dont get stuck"*: an explicit file list per iteration, no exploration budget, and **no image reads** — GLM cannot read PNGs, so every defect reaches it as the measured list (numbers and `file:line`), never as a capture |
| **Containment** | A fresh worktree per run. Deep-loop containment scans the whole tree, and a dirty parent checkout is what makes a run stall |
| **Synthesis** | An **Opus** pass reads the loop's findings and updates or adds phases to remediate. The loop itself writes findings; only the synthesis touches a phase document |
| **Closes** | When the synthesis has landed its phase updates and this packet's criterion above is ticked with the run's own artefacts cited |

**What this is not.** It is not a replacement for the operator's own device row (AC-010), and it is
not a gate on any leg currently in flight. Nothing waits on it; it waits on everything.
Recorded in `../roadmap.md` §4 row 59 and §6A.
<!-- /ANCHOR:log -->
